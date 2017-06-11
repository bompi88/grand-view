import React from 'react';

import DocumentOptionsDropdown from '../../containers/document_options_dropdown';
import DocumentOptionsDropdownCategory from '../../containers/document_options_dropdown_category';
import TreeFooter from '../../containers/tree_footer';
import NodeContainer from '../../containers/node';
import Node from './node';
import TagsView from '../../containers/tags_view';
import ReferencesView from '../../containers/references_view';
import RootNode from '../../containers/root_node';

class Tree extends React.Component {

  renderNodes() {
    const { nodes = [] } = this.props;
    const Child = NodeContainer(Node);
    return nodes.map((node, index) => <Child key={node._id} node={node} index={index} sectionLabel={node.position} />);
  }

  renderTreeView() {
    const { doc = {}, nodes = [] } = this.props;
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

  renderTreeHeader() {
    const { text, isTemplate } = this.props;

    return (
      <div className="structure-header">
        <DocumentOptionsDropdown isTemplate={isTemplate} />
        <h4 className="header-text">
          <span className="glyphicon glyphicon-tree-conifer" /> {text.tree}
        </h4>
      </div>
    );
  }

  renderTagsHeader() {
    const { text } = this.props;

    return (
      <div className="structure-header">
        <DocumentOptionsDropdownCategory />
        <h4 className="header-text">
          <span className="glyphicon glyphicon-tags" /> {text.tags}
        </h4>
      </div>
    );
  }

  renderReferencesHeader() {
    const { text } = this.props;

    return (
      <div className="structure-header">
        <DocumentOptionsDropdownCategory />
        <h4 className="header-text">
          <span className="glyphicon glyphicon-bookmark" /> {text.references}
        </h4>
      </div>
    );
  }

  render() {
    const { currentView, doc } = this.props;
    const { isTemplate } = doc;

    return (
      <div className="col-xs-4 structure-container">
        { currentView === 'tree' ? this.renderTreeHeader() : null }
        { currentView === 'tags' ? this.renderTagsHeader() : null }
        { currentView === 'references' ? this.renderReferencesHeader() : null }

        { currentView === 'tree' ? this.renderTreeView() : null }
        { currentView === 'tags' ? <TagsView /> : null }
        { currentView === 'references' ? <ReferencesView /> : null }

        <TreeFooter currentState={currentView} isTemplate={isTemplate} />
      </div>
    );
  }
}

export default Tree;
