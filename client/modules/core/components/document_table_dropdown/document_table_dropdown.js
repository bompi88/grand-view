import React from 'react';

export default class DocumentTableDropdown extends React.Component {

  renderItem(item, index) {
    let disabled = '';
    const {isDisabledOnManyAndNone, isDisabledOnNone, tableName} = this.props;

    if (item.divider) {
      return <li className="divider" key={index}></li>;
    }

    if (item.disabledOn === 'NONE') {
      disabled = isDisabledOnManyAndNone(tableName) ? 'disabled' : '';
    } else if (item.disabledOn === 'MANY_AND_NONE') {
      disabled = isDisabledOnNone(tableName) ? 'disabled' : '';
    }

    return (
      <li onClick={this.props[item.func]} className={disabled} key={index}>
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
    const classNames = this.props.dropdownClasses ?
      'btn-group dropdown ' + this.props.dropdownClasses : 'btn-group dropdown';

    return (
      <div className={classNames}>
        <button
          type="button"
          className="btn btn-default dropdown-toggle"
          data-toggle="dropdown"
          aria-expanded="false">

          Velg handling <span className="caret"></span>
        </button>

        <ul className="dropdown-menu" role="menu">
          {this.renderItems()}
        </ul>
      </div>
    );
  }
}
