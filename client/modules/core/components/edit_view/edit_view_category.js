import React from 'react';
import MediaNodesTableCategory from '../../containers/media_nodes_table_category';
import ConfButton from '../../containers/conf_button';
// import UndoRedoButton from '../../containers/undo_redo_button';

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

class EditViewCategory extends React.Component {

  renderHeader() {
    const { text } = this.props;

    return (
      <div>
        <ConfButton />
        {/* <UndoRedoButton isRedo={true} />
        <UndoRedoButton /> */}
        <h4 className="header-text">
          <span className="glyphicon glyphicon-list" style={styles.headerIcon} /> {text.header}
        </h4>
      </div>
    );
  }

  render() {
    const { nodes = [], mode, text, category, type } = this.props;

    return (
      <div className="col-xs-8" style={{ paddingRight: 0, overflow: 'hidden', height: '100%' }}>
        <div className="col-xs-12 structure-container">
          <div className="structure-header">
            {this.renderHeader()}
          </div>
          <div style={styles.container} className="edit-view-container">
            {nodes.length ? (
              <MediaNodesTableCategory
                nodes={nodes}
                mode={mode}
                text={text}
                category={category}
                type={type}
              />
            ) : (
              <p>{text.selectToProceed}</p>
            )}
          </div>
        </div>
      </div>
    );
  }
}

export default EditViewCategory;
