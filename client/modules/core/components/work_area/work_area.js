import React from 'react';

import Tree from '../../containers/tree_view';
import EditView from '../../containers/edit_view';

export default class WorkArea extends React.Component {

  render() {
    const {text, gotoDocuments, createNewDocument, doc} = this.props;

    if (doc) {
      return (
        <div className="container container-media-nodes default-container animated fadeIn">
          <div className="row row-wrapper">
            <Tree doc={doc}/>
            <EditView doc={doc} />
          </div>
        </div>
      );
    }

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
                  onClick={createNewDocument}
                >

                  <span className="glyphicon glyphicon-plus"></span> {text.createDocument}
                </button>
                <br /><span className="or-separator">{text.or}</span><br />
                <button
                  type="button"
                  className="btn btn-default goto-documents"
                  onClick={gotoDocuments}
                >
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
