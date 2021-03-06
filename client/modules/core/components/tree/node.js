import React from 'react';

import NodeContainer from '../../containers/node';
import ContentEditable from 'react-contenteditable';
import { ContextMenuLayer } from 'react-contextmenu';
import { DropArea, DropAreaZero } from './drop_area';
import { DropTarget } from 'react-dnd';

class NodeElement extends React.Component {

  updateTitle(name) {
    const { context, node } = this.props;
    const { _id } = node;
    const { Collections } = context();

    Collections.Nodes.update({ _id }, { $set: { name: name.replace(/&nbsp;/g, '').trim() } });
  }

  handleKeypress(e) {
    if (e.key === 'Enter') {
      e.preventDefault();
      e.stopPropagation();
      const { context } = this.props;
      const { LocalState } = context();

      this.updateTitle(e.target.innerHTML);
      LocalState.set('RENAME_NODE', null);
    }
  }

  componentDidMount() {
    const { context } = this.props;
    const { $, LocalState } = context();

    if (LocalState.get('RENAME_NODE')) {
      const el = $('.tree li .element.nodes.rename div.node-text');
      el.focus();
      document.execCommand('selectAll', false, null);
    }
  }

  handleBlur(e) {
    const { context } = this.props;
    const { LocalState } = context();

    this.updateTitle(e.target.innerHTML);
    LocalState.set('RENAME_NODE', null);
  }

  render() {
    const {
      node,
      handleClick,
      sectionLabel,
      renameNode,
      isDragging,
      connectDropTarget,
      isOver,
      count,
    } = this.props;
    const { _id, name, nodeType, isSelected } = node;
    const pre = (nodeType === 'media') ? (<span className="glyphicon glyphicon-file" />) :
      sectionLabel;

    const nodeTitle = name && name.length ? name : 'No title';
    const countText = nodeType === 'media' ? '' : ` (${count})`;

    const combined = nodeTitle + countText;

    let className = 'element nodes';
    if (isSelected) {
      className += ' selected';
    }

    if (renameNode === _id) {
      className += ' rename';
    }
    if (connectDropTarget) {
      if (isOver) {
        className = 'element nodes selected';
      }

      return connectDropTarget(
        <span
          className={className}
          onClick={handleClick.bind(this, node)}
          title={combined}
          style={{
            textOverflow: renameNode === _id ? 'clip' : 'ellipsis',
            opacity: isDragging ? 0.5 : 1,
          }}
        >
          <span>{pre}{' '}</span>

          <ContentEditable
            className="node-text"
            onKeyPress={this.handleKeypress.bind(this)}
            onBlur={this.handleBlur.bind(this)}
            html={nodeTitle}
            disabled={!renameNode}
            style={{
              display: 'inline',
            }}
          />
          <span>{countText}</span>
        </span>,
      );
    }

    return (
      <span
        className={className}
        onClick={handleClick.bind(this, node)}
        title={combined}
        style={{
          textOverflow: renameNode === _id ? 'clip' : 'ellipsis',
          opacity: isDragging ? 0.5 : 1,
        }}
      >
        <span>{pre}{' '}</span>

        <ContentEditable
          className="node-text"
          onKeyPress={this.handleKeypress.bind(this)}
          onBlur={this.handleBlur.bind(this)}
          html={nodeTitle}
          disabled={!renameNode}
          style={{
            display: 'inline',
          }}
        />
        <span>{countText}</span>
      </span>
    );
  }
}

const ChapterNode = ContextMenuLayer('chapter', props => props.node)(NodeElement);

const MediaNode = ContextMenuLayer('media', props => props.node)(NodeElement);

const dropSpecs = {

  drop(props, monitor) {
    const { _id } = monitor.getItem();
    const { putIntoChapterNode, node: parent } = props;
    putIntoChapterNode({ parent: parent._id, _id });
  },

  // canDrop(props) {
  //   const { node: { level } } = props;
  //   return level < 4;
  // }

};

const collect = (connect, monitor) => ({
  connectDropTarget: connect.dropTarget(),
  isOver: monitor.isOver(),
});

class Node extends React.Component {

  renderNodes() {
    const { nodes = [], sectionLabel } = this.props;
    const Child = NodeContainer(Node);
    return nodes.map(node => (<Child
      key={node._id}
      node={node}
      sectionLabel={`${sectionLabel.toString()}.${node.position}`}
    />));
  }

  renderCollapseButton() {
    const { node, nodes = [], expandNode, collapseNode } = this.props;
    if (nodes.length > 0) {
      if (node.isCollapsed) {
        return (
          <span
            className="icon icon-plus show-node"
            onClick={expandNode.bind(this, node)}
          />
        );
      }
      return (
        <span
          className="icon icon-minus hide-node"
          onClick={collapseNode.bind(this, node)}
        />
      );
    }
    return (
      <span />
    );
  }

  renderFirstDropArea() {
    const {
      node: {
        level,
        parent,
      },
      connectDropTarget,
      isOver,
      setPosition,
    } = this.props;

    if (level === 1) {
      const node = {
        _id: parent,
      };
      return (<DropAreaZero
        connectDropTarget={connectDropTarget}
        isOver={isOver}
        setPosition={setPosition}
        node={node}
      />);
    }

    return <DropAreaZero {...this.props} />;
  }

  render() {
    const { nodes = [], node, index, connectDragSource, isDragging } = this.props;

    const DropTargetChapterNode = DropTarget('node', dropSpecs, collect)(ChapterNode);

    return (
      <li
        className={node.nodeType === 'chapter' ? 'node chapter' : 'node media-node'}
        style={{
          display: isDragging ? 'none' : 'block',
        }}
      >
        {this.renderCollapseButton()}
        { index === 0 ? this.renderFirstDropArea() : null }
        { node.nodeType === 'media' ? <MediaNode {...this.props} /> :
            connectDragSource(<div><DropTargetChapterNode {...this.props} /></div>)}
        { nodes.length > 0 ? (
          <ul>
            { node.isCollapsed ? null : <DropAreaZero {...this.props} />}
            { node.isCollapsed ? null : this.renderNodes()}
          </ul>
        ) : null }
        <DropArea {...this.props} />

      </li>
    );
  }
}

class NodeWrapper extends React.Component {
  render() {
    return (
      <ul><Node {...this.props} /></ul>
    );
  }
}

export default NodeWrapper;
