import {useDeps, composeWithTracker, composeAll} from 'mantra-core';
import { DragSource } from 'react-dnd';

export const composer = (t, onData) => {
  const {context, node, sectionLabel} = t;
  const {Meteor, Collections, LocalState} = context();

  const renameNode = LocalState.get('RENAME_NODE') || false;
  const parent = node._id;

  const nodesReady = Meteor.subscribe('nodes.byParent', parent).ready();
  const countsReady = Meteor.subscribe('nodes.mediaNodeCount', parent).ready();

  if (nodesReady && countsReady) {
    const selector = {
      parent,
      nodeType: 'chapter'
    };

    const options = {
      sort: { position: 1 }
    };

    const nodes = Collections.Nodes.find(selector, options).fetch();
    const count = Collections.Counts.findOne({ _id: 'mediaNodeCount' + parent }).count || 0;
    onData(null, {
      nodes,
      sectionLabel,
      renameNode,
      count
    });
  } else {
    onData(null, { sectionLabel, renameNode, count: 0 });
  }

};

export const depsMapper = (context, actions) => ({
  handleClick: actions.node.handleClick,
  collapseNode: actions.node.collapseNode,
  expandNode: actions.node.expandNode,
  setPosition: actions.node.setPosition,
  putIntoChapterNode: actions.node.putIntoChapterNode,
  context: () => context
});

const dragSpecs = {

  beginDrag(props) {
    return props.node;
  },

  endDrag(props) {
    return props.node;
  }

};

const collect = (connect, monitor) => {
  return {
    connectDragSource: connect.dragSource(),
    isDragging: monitor.isDragging()
  };
};

export default composeAll(
  DragSource('node', dragSpecs, collect),
  composeWithTracker(composer),
  useDeps(depsMapper)
);
