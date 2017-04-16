import React from 'react';
import Dropzone from 'react-dropzone';

export default class EditRootViewForm extends React.Component {

  uploadFile(file) {
    const { Collections, LocalState } = this.props.context();
    const { Files } = Collections;

    let uploadInstance = Files.insert({
      file,
      meta: {
        nodeId: LocalState.get('EDIT_NODE')
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

  onDrop(files) {

    console.log('Received files: ', files);

    files.forEach((file) => {
      console.log(file)
      this.uploadFile(file);
    });

  }

  render() {
    const { text } = this.props;

    return (
      <Dropzone onDrop={this.onDrop.bind(this)}>
        <div>{text.uploadFiles}</div>
      </Dropzone>
    );
  }
}
