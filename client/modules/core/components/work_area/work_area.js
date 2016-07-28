import {FlowRouter} from 'meteor/kadira:flow-router';
import React from 'react';

import {ContextMenuLayer} from 'react-contextmenu';

const MyComponent = ContextMenuLayer('node')(
  React.createClass({
    render() {
      return <div className="well"></div>;
    }
  })
);


export default class WorkArea extends React.Component {

  render() {
    const {text, gotoDocuments, createNewDocument, doc} = this.props;

    if (doc) {
      return (
        <div className="container default-container animated fadeIn">
          <div className="row">
            <div className="col-lg-12">
            <br/>
            <br/>
            <br/>
            <br/>
            <br/>
            {doc.title}
            </div>
          </div>
        </div>
      );
    } else {
      return (
        <div className="container default-container animated fadeIn">
          <div className="row">
            <div className="col-lg-12">
              <div className="jumbotron">
                <h2>{text.title}</h2>
                <p className="lead">{text.description}</p>
                <br />
                <p className="text-center">
                  <button
                  type="button"
                  className="btn btn-success"
                  data-toggle="modal"
                  onClick={createNewDocument}
                  data-target="#template-modal">

                    <span className="glyphicon glyphicon-plus"></span> {text.createDocument}
                  </button>
                  <br /><span className="or-separator">{text.or}</span><br />
                  <button
                  type="button"
                  className="btn btn-default goto-documents"
                  onClick={gotoDocuments}>
                  {text.gotoDocuments}
                  </button>
                </p>
              </div>
            </div>
            <div className="col-lg-12 ball">
              <div className="ball-loader">
              </div>
            </div>
          </div>
        </div>
      );
    }
  }
}
