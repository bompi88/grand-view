import React from 'react';

import DocumentTable from '../table/table';
import DocumentTableDropdown from '../../containers/document_table_dropdown';

export default class Documents extends React.Component {
  render() {
    const { text } = this.props;

    return (
      <div className="container default-container animated fadeIn">
        <div className="row">
          <div>
            <DocumentTableDropdown {...this.props} dropdownClasses="pull-right" />
            <h3>
              <span className="glyphicon glyphicon-book" /> {text.header}
            </h3>
            <DocumentTable {...this.props} />
          </div>
        </div>
      </div>
    );
  }
}
