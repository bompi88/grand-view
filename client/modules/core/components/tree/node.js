import React from 'react';

import NodeContainer from '../../containers/node';
import ContentEditable from 'react-contenteditable';
import {ContextMenuLayer} from 'react-contextmenu';


class NodeElement extends React.Component {

  updateTitle(title) {
    const { context, node } = this.props;
    const { _id } = node;
    const { Collections } = context();
    Collections.Nodes.update({ _id }, { $set: { title }});
  }

  handleKeypress(e) {
    if (e.key === 'Enter') {
      e.preventDefault();
      e.stopPropagation();
      const { context } = this.props;
      const { LocalState } = context();

      this.updateTitle(e.target.innerHTML);
      LocalState.set('editChapterNodeName', null);
      // parent.scrollLeft(0);
    }
  }

  handleBlur(e) {
    const { context } = this.props;
    const { LocalState } = context();

    this.updateTitle(e.target.innerHTML);
    LocalState.set('editChapterNodeName', null);
    // parent.scrollLeft(0);
  }

  render() {
    const {node, nodes = [], handleClick, sectionLabel, isEditable = false} = this.props;
    const {name, nodeType, isSelected} = node;

    const pre = (nodeType === 'media') ? (<span className="glyphicon glyphicon-file"></span>) :
      sectionLabel;

    const nodeTitle = name && name.length ? name : 'No title';
    const countText = nodeType === 'media' ? '' : ' (' + nodes.length + ')';

    const combined = nodeTitle + countText;

    return (
      <span
        className={isSelected ? 'element nodes selected' : 'element nodes'}
        onClick={handleClick.bind(this, node)}
        title={combined}
        style={{
          textOverflow: isEditable ? 'clip' : 'ellipsis'
        }}
      >
        <span>{pre}{' '}</span>

        <ContentEditable
          className="node-text"
          onKeyPress={this.handleKeypress.bind(this)}
          onBlur={this.handleBlur.bind(this)}
          html={nodeTitle}
          disabled={!isEditable}
          style={{
            display: 'inline'
          }}
        />
        <span>{countText}</span>
      </span>
    );
  }
}

const ChapterNode = ContextMenuLayer('chapter', (props) => {
  return props.node;
})(NodeElement);

const MediaNode = ContextMenuLayer('media', (props) => {
  return props.node;
})(NodeElement);


class Node extends React.Component {

  renderNodes() {
    const {nodes = [], sectionLabel} = this.props;
    const Child = NodeContainer(Node);
    return nodes.map((node) => {
      return <Child
        key={node._id}
        node={node}
        sectionLabel={sectionLabel.toString() + '.' + node.position}
      />;
    });
  }

  renderCollapseButton() {
    const {node, nodes = [], expandNode, collapseNode} = this.props;
    if (nodes.length > 0) {

      if (node.isCollapsed) {
        return (
          <span
            className="icon icon-plus show-node"
            onClick={expandNode.bind(this, node)}
          ></span>
        );
      }
      return (
        <span
          className="icon icon-minus hide-node"
          onClick={collapseNode.bind(this, node)}
        ></span>
      );
    }
    return (
      <span></span>
    );
  }

  render() {
    const {node} = this.props;

    var connectDragSource = this.props.connectDragSource;
    var isDragging = this.props.isDragging;

    return connectDragSource(
      <li className={node.nodeType === 'chapter' ? 'node chapter' : 'node media-node'}>
        {this.renderCollapseButton()}
        { node.nodeType === 'media' ? <MediaNode {...this.props} /> :
            <ChapterNode {...this.props} />}
        <ul>
          { node.isCollapsed ? null : this.renderNodes()}
        </ul>

      </li>
    );
  }
}

class NodeWrapper extends React.Component {
  render() {
    return (
        <ul><Node {...this.props}/></ul>
    );
  }
}

export default NodeWrapper;
