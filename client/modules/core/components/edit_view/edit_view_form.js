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

import 'react-select/dist/react-select.css';

const styles = {
  marginBottom: {
    marginBottom: '15px'
  }
};

class EditViewForm extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      showDialog: false,
      file: {}
    };
  }

  handleShowDialog(file) {
    this.setState({
      showDialog: true,
      file
    });
  }

  handleHideDialog() {
    this.setState({
      showDialog: false
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
          label: 'Nei'
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
                'Sletting fullført'
              );
            }
          }
        }
      }
    };
    bootbox.dialog(confirmationPrompt);
  }

  renderFile(file) {
    const { Collections } = this.props.context();
    return (
      <li className="media" key={file._id}>
        <div className="media-left" style={{
          width: '120px',
          overflow: 'hidden',
          minWidth: '120px',
          maxWidth: '120px',
          margin: '0 10px'
        }}>
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
        <div className="media-body" style={{ paddingLeft: '10px'}} >
          <h4 className="media-heading">{file.name}</h4>
          <button
            className="btn btn-xs btn-primary"
            onClick={this.openFile.bind(this, file.path)}
            style={{ marginRight: '10px' }}
          ><span className="glyphicon glyphicon-open-file"></span> Åpne</button>
          <a
            download={file.meta && file.meta.name || file.name}
            href={Collections.Files.link(file)}
            className="btn btn-xs btn-default"
            style={{ marginRight: '10px' }}
          >
            <span className="glyphicon glyphicon-floppy-disk"></span> Lagre som
          </a>
          <button
            className="btn btn-xs btn-danger"
            onClick={this.removeFile.bind(this, file)}
          ><span className="glyphicon glyphicon-trash"></span> Slett</button>
        </div>
      </li>
    );
  }

  renderFiles(files) {
    const filesRendered = files.map((file) => {
      return this.renderFile(file);
    });

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

  uploadFile(file, type) {
    const { Collections, LocalState } = this.props.context();
    const { Files } = Collections;

    let uploadInstance = Files.insert({
      file,
      fileName: 'clipboard.' + type,
      isBase64: true,
      meta: {
        nodeId: LocalState.get('EDIT_NODE'),
        docId: LocalState.get('CURRENT_DOCUMENT')
      },
      streams: 'dynamic',
      chunkSize: 'dynamic',
      allowWebWorkers: true
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
    });

    uploadInstance.on('error', (error, fileObj) => {
      console.log('Error during upload: ' + error);
    });

    uploadInstance.on('progress', (progress, fileObj) => {
      console.log('Upload Percentage: ' + progress);
      // Update our progress bar
      // self.setState({
      //   progress
      // });
    });

    uploadInstance.start(); // Must manually start the upload
  }

  importFromClipboard(event) {
    const { LocalState, NotificationManager, TAPi18n } = this.props.context();
    if (LocalState.get('PASTE_FILE', true)) {
      LocalState.get('PASTE_FILE', false);
      const image = clipboard.readImage();
      const formats = clipboard.availableFormats();
      console.log(formats);
      let hasImage = false;
      for (let format of formats) {
        if (/image/.test(format)) {
          hasImage = true;
        }
      }

      try {
        if (hasImage) {
          this.uploadFile(image.toDataURL(), 'png');
        } else {
          this.uploadFile(clipboard.readRTF(), 'rtf');
        }
        event.stopPropagation();
        event.preventDefault();
      } catch (e) {
        NotificationManager.warning(
          TAPi18n.__('notifications.could_not_paste_as_file.message'),
          TAPi18n.__('notifications.could_not_paste_as_file.title')
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
      unsetDragable
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
          multi={true}
          label={text.tagsPlaceholder}
          placeholder={text.tagsLabel}
          style={styles.marginBottom}
          nodeId={nodeId}
          promptTextCreator={(i) => { return text.createTag + ' \"' + i + '\"'; }}
          removeText={text.removeItem}
          noResultsText={text.noResultsText}
          onMouseEnter={unsetDragable}
          onMouseLeave={setDragable}
        />
        <Field
          name="references"
          component={ReferencesSelector}
          multi={true}
          label={text.referencesPlaceholder}
          placeholder={text.referencesLabel}
          style={styles.marginBottom}
          nodeId={nodeId}
          promptTextCreator={(i) => { return text.createReference + ' \"' + i + '\"'; }}
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
  destroyOnUnmount: false
})(EditViewForm);
