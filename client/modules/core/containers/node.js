import {useDeps, composeWithTracker, composeAll} from 'mantra-core';
import { DragSource } from 'react-dnd';

export const composer = (t, onData) => {
  const {context, node, sectionLabel} = t;
  const {Meteor, Collections, LocalState} = context();

  const showMediaNodes = LocalState.get('MEDIA_NODES_VISIBLE') || false;
  const parent = node._id;

  if (Meteor.subscribe('nodes.byParent', parent).ready()) {
    const selector = {
      parent
    };

    const options = {};

    if (showMediaNodes) {
      options.sort = [
        [ 'nodeType', 'asc' ],
        [ 'position', 'asc' ]
      ];
    } else {
      options.sort = { position: 1 };
      selector.nodeType = 'chapter';
    }

    const nodes = Collections.Nodes.find(selector, options).fetch();

    onData(null, {
      nodes,
      sectionLabel
    });
  } else {
    onData(null, { sectionLabel });
  }

};

export const depsMapper = (context, actions) => ({
  handleClick: actions.node.handleClick,
  collapseNode: actions.node.collapseNode,
  expandNode: actions.node.expandNode,
  context: () => context
});

const dragSpecs = {

  beginDrag(props, monitor, component) {
    return props;
  },

  endDrag(props, monitor, component) {
    return props;
  },

  canDrag(props, monitor) {
    return props;
  },

  isDragging(props, monitor) {
    return props;
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
