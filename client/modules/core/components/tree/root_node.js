import React from 'react';
import {ContextMenuLayer} from 'react-contextmenu';

class Root extends React.Component {
  render() {
    const { node, handleClick } = this.props;
    const { title = 'No title', isSelected } = node;

    return (
      <span
        className={isSelected ? 'element root selected' : 'element root'}
        onClick={handleClick.bind(this, node)}
      >
        <span className="glyphicon glyphicon-book"></span> {(title === '' ? 'No title' : title)}
      </span>
    );
  }
}

export const RootNode = ContextMenuLayer('root')(Root);
