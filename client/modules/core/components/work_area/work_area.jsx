import {FlowRouter} from 'meteor/kadira:flow-router';
import React from 'react';

export default class WorkArea extends React.Component {

  gotoDocuments() {
    FlowRouter.go('Documents');
  }

  render() {
    return (
      <div className="container default-container animated fadeIn">
        <div className="row">
          <div className="col-lg-12">
            <div className="jumbotron">
              <h2>Velkommen til arbeidsområdet</h2>
              <p className="lead">
                Dette er stedet man redigerer dokumenter eller maler. Ingen
                 dokument eller mal er valgt til redigering enda, derfor
                 er denne siden tom. For å komme i gang kan du enten:
              </p>
              <br />
              <p className="text-center">
                <button
                  type="button"
                  className="btn btn-success"
                  data-toggle="modal"
                  data-target="#template-modal">

                  <span className="glyphicon glyphicon-plus"></span> Opprette et nytt dokument
                </button>
                <br /><span className="or-separator">eller</span><br />
                <button
                  type="button"
                  className="btn btn-default goto-documents"
                  onClick={this.gotoDocuments}>
                  Gå til Mine dokumenter
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
