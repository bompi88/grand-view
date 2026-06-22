import React from 'react';

import Tree from '../../containers/tree_view';
import EditView from '../../containers/edit_view';
import EditViewTemplate from '../../containers/edit_view_template';
import EditViewTags from '../../containers/edit_view_tags';
import EditViewReferences from '../../containers/edit_view_references';

import HTML5Backend from 'react-dnd-html5-backend';
import { DragDropContext } from 'react-dnd';

class WorkArea extends React.Component {

  renderTemplateEditView() {
    const { doc } = this.props;
    return <EditViewTemplate doc={doc} />;
  }

  renderDocumentEditView() {
    const { doc, treeState } = this.props;

    if (treeState === 'tags') {
      return <EditViewTags doc={doc} />;
    } else if (treeState === 'references') {
      return <EditViewReferences doc={doc} />;
    }

    return <EditView doc={doc} />;
  }

  render() {
    const { text, gotoDocuments, createNewDocument, doc } = this.props;

    if (doc) {
      return (
        <div className="container container-media-nodes default-container animated fadeIn">
          <div className="row row-wrapper">
            <Tree doc={doc} />
            {doc.isTemplate ? this.renderTemplateEditView() : this.renderDocumentEditView()}
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

                  <span className="glyphicon glyphicon-plus" /> {text.createDocument}
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
            <div className="ball-loader" />
          </div>
        </div>
      </div>
    );
  }
}

export default DragDropContext(HTML5Backend)(WorkArea);
