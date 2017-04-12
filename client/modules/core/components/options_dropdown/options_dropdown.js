////////////////////////////////////////////////////////////////////////////////
// Document Table Dropdown Component
////////////////////////////////////////////////////////////////////////////////
//
// Copyright 2015 Concept
//
// Licensed under the Apache License, Version 2.0 (the 'License');
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
// http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an 'AS IS' BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
////////////////////////////////////////////////////////////////////////////////


import React from 'react';

class OptionsDropdown extends React.Component {

  handleClick(func, e) {
    const f = this.props[func];
    f(e);
  }

  renderItem(item, index) {
    if (item.divider) {
      return <li key={index} role="presentation" className="divider"></li>;
    }

    return (
      <li role="presentation" key={index}>
        <a
          role="menuitem"
          tabIndex="-1"
          href="#"
          onClick={this.handleClick.bind(this, item.func)}
        >
          <span className={item.icon} aria-hidden="true"></span> {item.label}
        </a>
      </li>
    );
  }

  renderItems() {
    const {items} = this.props;

    return items.map((item, index) => {
      return this.renderItem(item, index);
    });
  }

  render() {
    return (
      <div className="pull-right btn-group" role="group">
        <button
          aria-expanded="false"
          className="btn btn-default dropdown-toggle menu-button"
          data-toggle="dropdown"
          type="button"
        >
          <span className="glyphicon glyphicon-option-horizontal"></span>
        </button>

        <ul className="dropdown-menu" role="menu">
          {this.renderItems()}
        </ul>
      </div>
    );
  }
}

OptionsDropdown.propTypes = {
  items: React.PropTypes.arrayOf(React.PropTypes.shape({
    label: React.PropTypes.string,
    icon: React.PropTypes.string,
    func: React.PropTypes.string,
    disabledOn: React.PropTypes.string,
    divider: React.PropTypes.bool
  }))
};

export default OptionsDropdown;
