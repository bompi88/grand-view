import React from 'react';
import Dropzone from 'react-dropzone';

export default class EditRootViewForm extends React.Component {

  uploadFile(file, load = false) {
    const { Collections, LocalState, Meteor } = this.props.context();
    const { Files } = Collections;
    let uploadInstance;

    const nodeId = LocalState.get('EDIT_NODE');
    const docId = LocalState.get('CURRENT_DOCUMENT');

    if (load) {
      return Meteor.call('loadImage', file, nodeId, docId);
    }

    uploadInstance = Files.insert({
      file,
      meta: {
        nodeId,
        docId,
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
    });

    uploadInstance.on('error', (error, fileObj) => {
      console.log(`Error during upload: ${error}`);
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

  onDrop(files, items) {
    if (files && files.length) {
      files.forEach((file) => {
        this.uploadFile(file);
      });
    } else if (items && items.length) {
      items.forEach((item) => {
        if ((item.kind === 'string') && (item.type.match('^text/plain'))) {
            // This item is the target node
          item.getAsString((s) => {
            console.log(s);
          });
        } else if ((item.kind === 'string') && (item.type.match('^text/html'))) {
          console.log('... Drop: HTML');
        } else if ((item.kind === 'string') && (item.type.match('^text/uri-list'))) {
          item.getAsString((uri) => {
            this.uploadFile(uri, true);
          });
        } else if ((item.kind === 'file') && (item.type.match('^image/'))) {
          // Drag data item is an image file
          const f = item.getAsFile();
          this.uploadFile(f);
          console.log('... Drop: File ', f);
        }
      });
    }
  }

  render() {
    const { text } = this.props;

    return (
      <Dropzone disablePreview onDrop={this.onDrop.bind(this)} className="upload-field">
        <div style={{
          width: '100%',
          height: '25px',
          marginTop: '20px',
        }}
        >
          <span className="glyphicon glyphicon-upload" style={{ fontSize: '1.9em' }} />
        </div>
        <div className="drop-text">{text.uploadFiles}</div>
      </Dropzone>
    );
  }
}
