import React from 'react';

import DocumentTable from '../document_table/document_table';
import DocumentTableDropdown from '../../containers/document_table_dropdown';

export default class Documents extends React.Component {
  render() {
    const {text} = this.props;
    return (
      <div className="container default-container animated fadeIn">
        <div className="row">
          <div>
            <DocumentTableDropdown {...this.props} dropdownClasses="pull-right" />
            <h3>
              <span className="glyphicon glyphicon-book"></span> {text.header}
            </h3>
            <DocumentTable dropdownClasses="pull-right" {...this.props} />
          </div>
        </div>
      </div>
    );
  }
}
