import React from 'react';
import EditRootViewForm from '../../containers/edit_root_view_form';
import EditChapterViewForm from '../../containers/edit_chapter_view_form';

const styles = {
  header: {

  },
  headerIcon: {
    fontSize: '15px',
    margin: '0 5px',
  },
  container: {
    padding: '20px',
    height: 'calc(100% - 40px)',
    overflowY: 'scroll',
  },
};

class EditView extends React.Component {
  renderRootHeader() {
    const { text } = this.props;

    return (
      <h4 className="header-text">
        <span className="glyphicon glyphicon-book" style={styles.headerIcon} /> {text.projectDescription}
      </h4>
    );
  }

  renderChapterHeader() {
    const { text } = this.props;

    return (
      <div>
        <h4 className="header-text">
          <span className="glyphicon glyphicon-list" style={styles.headerIcon} /> {text.chapterView}
        </h4>
      </div>
    );
  }

  renderMediaNodeHeader() {
    const { text } = this.props;

    return (
      <h4 className="header-text">
        <span className="glyphicon glyphicon-leaf" style={styles.headerIcon} /> {text.mediaView}
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
          </div>
          <div style={styles.container} className="edit-view-container">
            { nodeType === 'root' ? (
              <EditRootViewForm initialValues={node} nodeId={node._id} />
            ) : null }
            { nodeType === 'chapter' ? (
              <EditChapterViewForm initialValues={node} nodeId={node._id} />
            ) : null }
          </div>
        </div>
      </div>
    );
  }
}

export default EditView;
