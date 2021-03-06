import React from 'react';
import TagsSelector from '../../containers/tags_selector';
import ReferencesSelector from '../../containers/references_selector';
import { Field, reduxForm } from 'redux-form';
import { renderTextInput } from '../prototypes/form_prototypes';
import Dropzone from '../../containers/dropzone';
import MagnificPopup from '../../containers/magnific_popup';
import bootbox from 'bootbox';

/* globals _require */

const { clipboard, shell } = _require('electron');
const fs = _require('fs-extra');
const mime = require('mime-types');
const platform = _require('os').platform();
let winClipboard = {};

if (platform === 'win32') {
  winClipboard = _require('win-clipboard');
}


import 'react-select/dist/react-select.css';

const styles = {
  marginBottom: {
    marginBottom: '15px',
  },
};

const uint8Tobase64 = (uint8) => {
  let binary = '';
  for (let i = 0; i < uint8.byteLength; i++) {
    binary += String.fromCharCode(uint8[i]);
  }
  return window.btoa(binary);
};

class EditViewForm extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      showDialog: false,
      file: {},
    };
  }

  handleShowDialog(file) {
    this.setState({
      showDialog: true,
      file,
    });
  }

  handleHideDialog() {
    this.setState({
      showDialog: false,
    });
  }

  openFile(path, e) {
    e.preventDefault();
    shell.openItem(path);
  }

  componentWillUnmount() {
    const { setDragable } = this.props;
    setDragable();
  }

  removeFile(file, e) {
    e.preventDefault();
    const { Collections, NotificationManager } = this.props.context();
    const confirmationPrompt = {
      title: 'Bekreftelse på sletting',
      message: 'Er du sikker på at du vil slette Filen?',
      buttons: {
        cancel: {
          label: 'Nei',
        },
        confirm: {
          label: 'Ja',
          callback(result) {
            if (result) {
              // Remove the file
              Collections.Files.remove({ _id: file._id });
              // Show sucess message
              NotificationManager.success(
                'Filen ble slettet fra systemet.',
                'Sletting fullført',
              );
            }
          },
        },
      },
    };
    bootbox.dialog(confirmationPrompt);
  }

  renderFile(file) {
    const { Collections } = this.props.context();
    return (
      <li className="media" key={file._id}>
        <div
          className="media-left" style={{
            width: '120px',
            overflow: 'hidden',
            minWidth: '120px',
            maxWidth: '120px',
            margin: '0 10px',
          }}
        >
          {file.isImage ? (
            <a
              href="#"
              className="image-preview center-block"
              onClick={this.handleShowDialog.bind(this, file)}
            >
              <img
                src={Collections.Files.link(file)}
                height="70"
              />
            </a>
            ) : (
              <img
                src="/images/placeholder-icon.png"
                height="70"
              />
            )}
        </div>
        <div className="media-body" style={{ paddingLeft: '10px' }} >
          <h4 className="media-heading">{file.name}</h4>
          <button
            className="btn btn-xs btn-primary"
            onClick={this.openFile.bind(this, file.path)}
            style={{ marginRight: '10px' }}
          ><span className="glyphicon glyphicon-open-file" /> Åpne</button>
          <a
            download={file.meta && file.meta.name || file.name}
            href={Collections.Files.link(file)}
            className="btn btn-xs btn-default"
            style={{ marginRight: '10px' }}
          >
            <span className="glyphicon glyphicon-floppy-disk" /> Lagre som
          </a>
          <button
            className="btn btn-xs btn-danger"
            onClick={this.removeFile.bind(this, file)}
          ><span className="glyphicon glyphicon-trash" /> Slett</button>
        </div>
      </li>
    );
  }

  renderFiles(files) {
    const filesRendered = files.map(file => this.renderFile(file));

    return (
      <ul className="media-list">
        {filesRendered}
      </ul>
    );
  }

  renderMagnificPopup(file) {
    const { context } = this.props;
    const { Collections } = context();
    let type = 'inline';

    if (file.isImage) {
      type = 'image';
    }
    if (file.isPDF) {
      type = 'iframe';
    }

    return (
      <div>

        <MagnificPopup
          open={this.state.showDialog}
          onClose={this.handleHideDialog.bind(this)}
          src={Collections.Files.link(file)}
          type={type}
        />

      </div>
    );
  }

  uploadFile(file, type, ext, cb) {
    const { Collections, LocalState } = this.props.context();
    const { Files } = Collections;

    const uploadInstance = Files.insert({
      file,
      fileName: `clipboard.${ext}`,
      isBase64: true,
      type,
      meta: {
        nodeId: LocalState.get('EDIT_NODE'),
        docId: LocalState.get('CURRENT_DOCUMENT'),
      },
      streams: 'dynamic',
      chunkSize: 'dynamic',
      allowWebWorkers: true,
    }, false);

    // self.setState({
    //   uploading: uploadInstance, // Keep track of this instance to use below
    //   inProgress: true // Show the progress bar now
    // });

    // These are the event functions, don't need most of them, it shows where we are in the process
    uploadInstance.on('start', () => {
      console.log('Starting');
    });

    uploadInstance.on('end', (error, fileObj) => {
      console.log('On end File Object: ', fileObj);
    });

    uploadInstance.on('uploaded', (error, fileObj) => {
      console.log('uploaded: ', fileObj);

      // // Remove the filename from the upload box
      // self.refs['fileinput'].value = '';

      // Reset our state for the next file
      // self.setState({
      //   uploading: [],
      //   progress: 0,
      //   inProgress: false
      // });
      cb(true);
    });

    uploadInstance.on('error', (error, fileObj) => {
      console.log(`Error during upload: ${error}`);
      cb(false);
    });

    uploadInstance.on('progress', (progress, fileObj) => {
      console.log(`Upload Percentage: ${progress}`);
      // Update our progress bar
      // self.setState({
      //   progress
      // });
    });

    uploadInstance.start(); // Must manually start the upload
  }

  handlePasteMac(cb) {
    if (clipboard.has('public.file-url')) {
      const rawFilePath = clipboard.read('public.file-url');
      const filePath = rawFilePath.replace('file://', '');
      const contentType = mime.lookup(filePath);

      if (contentType) {
        return fs.readFile(filePath, (err, buffer) => {
          const blob = buffer.toString('base64');
          return this.uploadFile(blob, contentType, mime.extension(contentType), cb);
        });
      }
    }

    if (clipboard.has('public.png')) {
      const buffer = clipboard.readBuffer('public.png');
      const blob = buffer.toString('base64');
      return this.uploadFile(blob, 'image/png', 'png', cb);
    }

    if (clipboard.has('com.adobe.pdf')) {
      const buffer = clipboard.readBuffer('com.adobe.pdf');
      const blob = buffer.toString('base64');
      return this.uploadFile(blob, 'application/pdf', 'pdf', cb);
    }

    if (clipboard.has('public.tiff')) {
      const buffer = clipboard.readBuffer('public.tiff');
      const blob = buffer.toString('base64');
      return this.uploadFile(blob, 'image/tif', 'tiff', cb);
    }

    // if (clipboard.has('com.apple.flat-rtfd')) {
    //   const buffer = clipboard.readBuffer('com.apple.flat-rtfd');
    //   console.log(buffer.toString('hex'));
    //   const blob = buffer.toString('base64');
    //   return this.uploadFile(blob, 'application/x-apple-disk', 'rtfd');
    // }

    if (clipboard.has('public.rtf')) {
      const buffer = clipboard.readBuffer('public.rtf');
      const blob = buffer.toString('base64');
      return this.uploadFile(blob, 'text/rtf', 'rtf', cb);
    }

    if (clipboard.has('public.utf8-plain-text')) {
      const buffer = clipboard.readBuffer('public.utf8-plain-text');
      const blob = buffer.toString('base64');
      return this.uploadFile(blob, 'text/plain', 'txt', cb);
    }

    cb(false);
  }

  handlePasteWin(cb) {
    const hasFormat = (format) => {
      const formats = winClipboard.getFormats();
      return formats.indexOf(format) > -1;
    };

    if (hasFormat('FileNameW')) {
      const filePath = winClipboard.getText('FileNameW');
      const contentType = mime.lookup(filePath);

      if (contentType) {
        return fs.readFile(filePath, (err, buffer) => {
          const blob = buffer.toString('base64');
          this.uploadFile(blob, contentType, mime.extension(contentType), cb);
        });
      }
    }

    if (hasFormat('PNG')) {
      const uint8 = winClipboard.getData('PNG');
      if (uint8) {
        const blob = uint8Tobase64(uint8);
        return this.uploadFile(blob, 'image/png', 'png', cb);
      }
    }

    if (hasFormat('CF_BITMAP') && hasFormat('CF_DIB')) {
      const uint8 = winClipboard.getData('CF_DIB');

      const bmpHeader = new Buffer(14);
      bmpHeader.writeUInt16LE(0x4d42, 0);
      bmpHeader.writeUInt32LE(uint8.byteLength + 14, 2); // size of BMP
      bmpHeader.writeUInt16LE(0, 6); // bfreserved1
      bmpHeader.writeUInt16LE(0, 8); // bfreserved2
      bmpHeader.writeUInt32LE(36, 10); // offset bitmap image data

      const f = new Uint8Array(bmpHeader.byteLength + uint8.length);
      f.set(new Uint8Array(bmpHeader));
      f.set(uint8, bmpHeader.byteLength);

      const blob = uint8Tobase64(f);
      return this.uploadFile(blob, 'image/bmp', 'bmp', cb);
    }

    if (hasFormat('GIF')) {
      const uint8 = winClipboard.getData('GIF');
      if (uint8) {
        const blob = uint8Tobase64(uint8);
        return this.uploadFile(blob, 'image/gif', 'gif', cb);
      }
    }

    if (hasFormat('Rich Text Format')) {
      const uint8 = winClipboard.getData('Rich Text Format');
      const blob = uint8Tobase64(uint8);
      return this.uploadFile(blob, 'text/rtf', 'rtf', cb);
    }
  }

  importFromClipboard(clipEvent) {
    clipEvent.stopPropagation();
    clipEvent.preventDefault();

    const { LocalState, NotificationManager, TAPi18n } = this.props.context();

    if (LocalState.get('PASTE_FILE', true)) {
      LocalState.get('PASTE_FILE', false);
      if (platform === 'win32') {
        this.handlePasteWin((pasted) => {
          if (!pasted) {
            NotificationManager.warning(
              TAPi18n.__('notifications.could_not_paste_as_file.message'),
              TAPi18n.__('notifications.could_not_paste_as_file.title'),
            );
          }
        });
      }

      if (platform === 'darwin') {
        this.handlePasteMac((pasted) => {
          if (!pasted) {
            NotificationManager.warning(
              TAPi18n.__('notifications.could_not_paste_as_file.message'),
              TAPi18n.__('notifications.could_not_paste_as_file.title'),
            );
          }
        });
      }

      if (platform === 'linux') {
        NotificationManager.warning(
          'Lim inn som fil er dessverre ikke støttet på Linux-plattformer enda.',
          TAPi18n.__('notifications.could_not_paste_as_file.title'),
        );
      }
    }
  }

  render() {
    const {
      setDescription,
      setName,
      change,
      nodeId,
      text,
      files,
      setDragable,
      unsetDragable,
    } = this.props;

    const file = this.state.file;

    return (
      <form ref="target" onPaste={this.importFromClipboard.bind(this)}>
        <Field
          name="name"
          component={renderTextInput}
          type="text"
          autoComplete="off"
          placeholder={text.name}
          label={text.name}
          onChange={(e) => {
            change('name', e.target.value);
            setName(e.target.value, nodeId);
          }}
          onMouseEnter={unsetDragable}
          onMouseLeave={setDragable}
        />
        <Field
          name="description"
          component={renderTextInput}
          autoComplete="off"
          placeholder={text.description}
          label={text.description}
          rows={6}
          componentClass={React.DOM.textarea}
          onChange={(e) => {
            change('description', e.target.value);
            setDescription(e.target.value, nodeId);
          }}
          onMouseEnter={unsetDragable}
          onMouseLeave={setDragable}
        />
        <Field
          name="tags"
          component={TagsSelector}
          multi
          label={text.tagsPlaceholder}
          placeholder={text.tagsLabel}
          style={styles.marginBottom}
          nodeId={nodeId}
          promptTextCreator={i => `${text.createTag} \"${i}\"`}
          removeText={text.removeItem}
          noResultsText={text.noResultsText}
          onMouseEnter={unsetDragable}
          onMouseLeave={setDragable}
        />
        <Field
          name="references"
          component={ReferencesSelector}
          multi
          label={text.referencesPlaceholder}
          placeholder={text.referencesLabel}
          style={styles.marginBottom}
          nodeId={nodeId}
          promptTextCreator={i => `${text.createReference} \"${i}\"`}
          removeText={text.removeItem}
          noResultsText={text.noResultsText}
          onMouseEnter={unsetDragable}
          onMouseLeave={setDragable}
        />
        <label>{text.attachments}</label>
        { files ? this.renderFiles(files) : null }
        <Dropzone />
        { file ? this.renderMagnificPopup(file) : null }
      </form>
    );
  }
}

export default reduxForm({
  form: 'editNode',
  getFormState(state) {
    return state.form && state.form.present;
  },
  enableReinitialize: true,
  destroyOnUnmount: false,
})(EditViewForm);
