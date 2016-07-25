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

class DocumentTableDropdown extends React.Component {

  renderItem(item, index) {
    let disabled = '';
    const {isDisabledOnManyAndNone, isDisabledOnNone, tableName} = this.props;

    if (item.divider) {
      return <li className="divider" key={index}></li>;
    }

    if (item.disabledOn === 'NONE') {
      disabled = isDisabledOnNone(tableName) ? 'disabled' : '';
    } else if (item.disabledOn === 'MANY_AND_NONE') {
      disabled = isDisabledOnManyAndNone(tableName) ? 'disabled' : '';
    }

    return (
      <li
        onClick={disabled === 'disabled' ? null : this.props[item.func].bind(this)}
        className={disabled}
        key={index}
      >
        <a href="#">
          <span className={item.icon}></span> {item.label}
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
    const {text} = this.props;
    const classNames = this.props.dropdownClasses ?
      'btn-group dropdown ' + this.props.dropdownClasses : 'btn-group dropdown';

    return (
      <div className={classNames}>
        <button
          type="button"
          className="btn btn-default dropdown-toggle"
          data-toggle="dropdown"
          aria-expanded="false">

          {text.selectAction} <span className="caret"></span>
        </button>

        <ul className="dropdown-menu" role="menu">
          {this.renderItems()}
        </ul>
      </div>
    );
  }
}

DocumentTableDropdown.propTypes = {
  items: React.PropTypes.arrayOf(React.PropTypes.shape({
    label: React.PropTypes.string,
    icon: React.PropTypes.string,
    func: React.PropTypes.string,
    disabledOn: React.PropTypes.string,
    divider: React.PropTypes.bool
  })),
  text: React.PropTypes.shape({
    selectAction: React.PropTypes.string
  }),
  isDisabledOnManyAndNone: React.PropTypes.func,
  isDisabledOnNone: React.PropTypes.func,
  tableName: React.PropTypes.string
};

DocumentTableDropdown.defaultProps = {
  text: {
    selectAction: 'Select action'
  }
};

export default DocumentTableDropdown;
