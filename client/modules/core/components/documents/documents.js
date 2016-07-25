import React from 'react';

import DocumentTable from '../../containers/document_table';

export default class Documents extends React.Component {
  render() {
    return (
      <div className="container default-container animated fadeIn">
        <div className="row">
          <div>
            <DocumentTable dropdownClasses="pull-right" />
          </div>
        </div>
      </div>
    );
  }
}
