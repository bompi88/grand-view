import { Component } from 'react';
import { DropTarget } from 'react-dnd';

class DropAreaComponent extends Component {
  render() {
    const { connectDropTarget, isOver } = this.props;
    const className = isOver ? 'drop-target active' : 'drop-target';

    return connectDropTarget(
      <span
      className={className}
      style={{
        height: isOver ? '30px' : '15px',
        display: 'block',
        backgroundColor: isOver ? '#ddd' : 'inherit',
        border: isOver ? '2px dashed #ccc' : 0,
        marginTop: isOver ? '5px' : 0,
        marginBottom: isOver ? '5px' : 0
      }}
      ></span>
    );
  }
}

const dropSpecs = {

  drop(props, monitor) {
    const { _id, position: fromPos, parent: fromParent } = monitor.getItem();
    const { node: nodeAbove, setPosition } = props;
    const { parent: toParent, position } = nodeAbove;
    setPosition({ fromPos, toPos: position + 1, _id, fromParent, toParent });
  },
  //
  // hover(props) {
  //
  // },
  //
  // canDrop(props) {
  //
  // }

};

const collect = (connect, monitor) => {
  return {
    connectDropTarget: connect.dropTarget(),
    isOver: monitor.isOver()
  };
};

const dropSpecsZero = {

  drop(props, monitor) {
    const { _id, position: fromPos, parent: fromParent } = monitor.getItem();
    const { node: nodeAbove, setPosition } = props;
    const { _id: toParent } = nodeAbove;
    setPosition({ fromPos, toPos: 1, _id, fromParent, toParent });
  },
  //
  // hover(props) {
  //
  // },
  //
  // canDrop(props) {
  //
  // }

};

const collectZero = (connect, monitor) => {
  return {
    connectDropTarget: connect.dropTarget(),
    isOver: monitor.isOver()
  };
};

export const DropArea = DropTarget('node', dropSpecs, collect)(DropAreaComponent);
export const DropAreaZero = DropTarget('node', dropSpecsZero, collectZero)(DropAreaComponent);