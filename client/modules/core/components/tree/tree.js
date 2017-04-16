import React from 'react';

import DocumentOptionsDropdown from '../../containers/document_options_dropdown';
import TreeFooter from '../../containers/tree_footer';
import NodeContainer from '../../containers/node';
import Node from './node';
import TagsView from '../../containers/tags_view';
import RootNode from '../../containers/root_node';

import HTML5Backend from 'react-dnd-html5-backend';
import { DragDropContext } from 'react-dnd';

class Tree extends React.Component {

  renderNodes() {
    const {nodes = []} = this.props;
    const Child = NodeContainer(Node);
    return nodes.map((node, index) => {
      return <Child key={node._id} node={node} index={index} sectionLabel={node.position} />;
    });
  }

  renderTreeView() {
    const {doc = {}, nodes = []} = this.props;
    const count = nodes.length;

    return (
      <div className="tree structure disable-select">
        <ul>
          <li className="node root">
            <RootNode key={doc._id} node={doc} count={count} />
            {this.renderNodes()}
          </li>
        </ul>
      </div>
    );
  }

  renderReferencesView() {
    return (
      <div className="tree structure disable-select">
        references
      </div>
    );
  }

  renderTreeHeader() {
    const { text } = this.props;

    return (
      <h4 className="header-text">
        <span className="glyphicon glyphicon-tree-conifer"></span> {text.tree}
      </h4>
    );
  }

  renderTagsHeader() {
    const { text } = this.props;

    return (
      <h4 className="header-text">
        <span className="glyphicon glyphicon-tags"></span> {text.tags}
      </h4>
    );
  }

  renderReferencesHeader() {
    const { text } = this.props;

    return (
      <h4 className="header-text">
        <span className="glyphicon glyphicon-bookmark"></span> {text.references}
      </h4>
    );
  }

  render() {
    const {currentView} = this.props;

    return (
      <div className="col-xs-4 structure-container">
        <div className="structure-header">

          <DocumentOptionsDropdown />

          { currentView === 'tree' ? this.renderTreeHeader() : null }
          { currentView === 'tags' ? this.renderTagsHeader() : null }
          { currentView === 'references' ? this.renderReferencesHeader() : null }
        </div>
        { currentView === 'tree' ? this.renderTreeView() : null }
        { currentView === 'tags' ? <TagsView /> : null }
        { currentView === 'references' ? this.renderReferencesView() : null }

        <TreeFooter currentState={currentView}/>
      </div>
    );
  }
}

export default DragDropContext(HTML5Backend)(Tree);
