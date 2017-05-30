import React from 'react';
import {ContextMenuLayer} from 'react-contextmenu';

export const RootNode = ContextMenuLayer('root')(
  React.createClass({
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
  })
);
