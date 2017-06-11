import { composeAll, compose } from 'mantra-core';
import { findDOMNode } from 'react-dom';
import { DragSource, DropTarget } from 'react-dnd';
import NodesTableRow from '../components/table/nodes_table_row';

export const composer = ({ context, node }, onData) => {
  const { Meteor, Collections } = context();
  if (Meteor.subscribe('nodes.byId', node._id).ready()) {
    const n = Collections.Nodes.findOne({ _id: node._id }, { reactive: false });
    return onData(null, {
      node: n,
    });
  }
  return onData(null, {});
};

const dragSource = {
  beginDrag(props) {
    const { node, index } = props;
    const { _id, nodeType } = node;

    return {
      _id,
      index,
      nodeType,
    };
  },
};

const dropTarget = {
  hover(props, monitor, component) {
    const { index } = props;
    const hoverIndex = index;
    const dragIndex = monitor.getItem().index;

    // Don't replace items with themselves
    if (dragIndex === hoverIndex) {
      return;
    }

    // Determine rectangle on screen
    const hoverBoundingRect = findDOMNode(component).getBoundingClientRect();

    // Get vertical middle
    const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;

    // Determine mouse position
    const clientOffset = monitor.getClientOffset();

    // Get pixels to the top
    const hoverClientY = clientOffset.y - hoverBoundingRect.top;

    // Dragging downwards
    if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) {
      return;
    }

    // Dragging upwards
    if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) {
      return;
    }

    // Time to actually perform the action
    props.moveNode(dragIndex, hoverIndex);

    monitor.getItem().index = hoverIndex;
  },

  drop(props, monitor) {
    const { _id } = monitor.getItem();
    const { index } = props;
    const dropIndex = index;

    props.updateMediaNodePosition({
      toPos: dropIndex,
      _id,
    });
  },
};
const collectDrop = connect => ({
  connectDropTarget: connect.dropTarget(),
});

const collectDrag = (connect, monitor) => ({
  connectDragSource: connect.dragSource(),
  isDragging: monitor.isDragging(),
});


export default composeAll(
  compose(composer),
  DropTarget('node', dropTarget, collectDrop),
  DragSource('node', dragSource, collectDrag),
)(NodesTableRow);
