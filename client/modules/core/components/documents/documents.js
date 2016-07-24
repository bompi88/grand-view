import React from 'react';

import DocumentTable from '../../containers/document_table';

export default class Documents extends React.Component {
  render() {
    return (
      <div className="container default-container animated fadeIn">
        <div className="row">
          <div>
            <h3>
              <span className="glyphicon glyphicon-book"></span> Mine dokumenter
            </h3>

            <DocumentTable
              tableName="documents"
              label="dokument"
              dropdownClasses="pull-right"
              emptyText="Ingen dokumenter funnet" />
          </div>
        </div>
      </div>
    );
  }
}
