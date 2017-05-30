import React from 'react';
import {ContextMenu, MenuItem} from 'react-contextmenu';

/* The menu items for right click of root node */
export default class CtxMenu extends React.Component {

  renderMenuItems() {
    const {menuItems} = this.props;

    return menuItems.map((item) => {
      const data = { node: item.data };
      return (
        <MenuItem key={item.id} data={data} onClick={item.handleClick}>
          { item.icon ? (<span className={item.icon}></span>) : ''} {' ' + item.label}
        </MenuItem>
      );
    });
  }

  render() {
    const {identifier} = this.props;

    return (
      <ContextMenu identifier={identifier} currentItem={this.currentItem}>
        {this.renderMenuItems()}
      </ContextMenu>
    );
  }
}
