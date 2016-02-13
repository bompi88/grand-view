import React from 'react';

// {{> DocumentTable documents=this.documents hasTemplate="true" editOptions="true" tableName="documents" label="dokument" emptyText="Ingen dokumenter funnet"}}
export default class Documents extends React.Component {
  render() {
    return (
      <div className="container default-container animated fadeIn">
        <div className="row">
          <div>
            <h3>
              <span className="glyphicon glyphicon-book"></span> Mine dokumenter
            </h3>
          </div>
        </div>
      </div>
    );
  }
}
