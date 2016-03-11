import React from 'react';

export default class DocumentTableDropdown extends React.Component {

  createNewDocument() {
    const {createNewDocument} = this.props;

    createNewDocument();
  }

  renderNewButton() {
    if (this.props.tableName === 'documents') {
      return (
        <li onClick={this.createNewDocument.bind(this)}>
          <a href="#" className="new-doc">
            <span className="glyphicon glyphicon-plus"></span> Opprett {this.props.label}
          </a>
        </li>
      );
    }

    return (
      <li>
        <a href="#" data-toggle="modal" data-target="#template-modal">
          <span className="glyphicon glyphicon-plus"></span> Opprett {this.props.label}
        </a>
      </li>
    );
  }

  isDisabledOnManyAndNone() {
    const {isDisabledOnManyAndNone} = this.props;
    return isDisabledOnManyAndNone();
  }

  isDisabledOnNone() {
    const {isDisabledOnNone} = this.props;
    return isDisabledOnNone();
  }

  render() {
    const disabled = 'disabled';
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

          {this.renderNewButton()}

          <li className={this.isDisabledOnManyAndNone ? disabled : ''}>
            <a href="#" className="edit-doc">
              <span className="glyphicon glyphicon-edit"></span> Rediger {this.props.label}
            </a>
          </li>

          <li className="divider"></li>

          <li>
            <a href="#" className="import-doc">
              <span className="glyphicon glyphicon-import"></span> Importer {this.props.label}
            </a>
          </li>

          <li className={this.isDisabledOnNone ? disabled : ''}>
            <a href="#" className="export-doc">
              <span className="glyphicon glyphicon-export"></span> Eksporter {this.props.label}
            </a>
          </li>

          <li className="divider"></li>

          <li className={this.isDisabledOnNone ? disabled : ''}>
            <a href="#" className="trash-doc">
              <span className="glyphicon glyphicon-trash"></span> Legg i papirkurv
            </a>
          </li>
        </ul>
      </div>
    );
  }
}
