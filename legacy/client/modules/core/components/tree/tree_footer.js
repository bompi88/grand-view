import React from 'react';

export default class Tree extends React.Component {

  renderItem(item) {
    const { currentState, changeState } = this.props;

    const active = currentState === item.state ? 'active' : '';
    return (
      <li
        key={item.state}
        role="presentation"
        className={active}
        onClick={changeState.bind(this, item.state)}
      ><a href="#">{item.label}</a></li>
    );
  }

  renderItems() {
    const { items } = this.props;

    return items.map(item => this.renderItem(item));
  }

  render() {
    return (
      <div className="structure-footer">
        <ul className="nav nav-pills nav-justified">
          {this.renderItems()}
        </ul>
      </div>
    );
  }
}
