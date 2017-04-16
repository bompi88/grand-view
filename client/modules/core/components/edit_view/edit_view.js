import React from 'react';
import EditViewForm from '../../containers/edit_view_form';
import EditRootViewForm from '../../containers/edit_root_view_form';
import MediaNodesTable from '../../containers/media_nodes_table';

const styles = {
  header: {

  },
  headerIcon: {
    fontSize: '15px',
    margin: '0 5px'
  },
  container: {
    padding: '20px',
    height: 'calc(100% - 40px)',
    overflowY: 'scroll'
  }
};

class EditView extends React.Component {

  handleKeyPress(e) {
    const { unsetEditable, node } = this.props;
    if (e.keyCode === 27) {
      unsetEditable(node.mainDocId);
    }
  }

  componentDidMount() {
    document.addEventListener('keydown', this.handleKeyPress.bind(this));
  }

  componentWillUnmount() {
    document.removeEventListener('keydown', this.handleKeyPress.bind(this));
  }

  renderRootHeader() {
    return (
      <h4 className="header-text">
        <span className="glyphicon glyphicon-book" style={styles.headerIcon}>
        </span> Prosjektbeskrivelse
      </h4>
    );
  }

  renderChapterHeader() {
    return (
      <h4 className="header-text">
        <span className="glyphicon glyphicon-grain" style={styles.headerIcon}>
        </span> Kapittelvisning
      </h4>
    );
  }

  renderMediaNodeHeader() {
    return (
      <h4 className="header-text">
        <span className="glyphicon glyphicon-leaf" style={styles.headerIcon}>
        </span> Rediger informasjonselement
      </h4>
    );
  }

  render() {
    const { node = {} } = this.props;
    const { nodeType = 'root' } = node;

    return (
      <div className="col-xs-8" style={{ paddingRight: 0, overflow: 'hidden', height: '100%' }}>
        <div className="col-xs-12 structure-container">
          <div className="structure-header">
            {nodeType === 'root' ? this.renderRootHeader() : null }
            {nodeType === 'chapter' ? this.renderChapterHeader() : null }
            {nodeType === 'media' ? this.renderMediaNodeHeader() : null }
          </div>
          <div style={styles.container} className="edit-view-container">
            { nodeType === 'root' ? <EditRootViewForm initialValues={node} nodeId={node._id}/> : null }
            { nodeType === 'media' ? <EditViewForm initialValues={node} nodeId={node._id}/> : null }
            { nodeType === 'chapter' ? <MediaNodesTable chapterNode={node}/> : null }
          </div>
        </div>
      </div>
    );
  }
}

export default EditView;
