import React from 'react';

import DocumentTableDropdown from './document_table_dropdown.jsx';
import DocumentTableRow from './document_table_row.jsx';


export default class DocumentTable extends React.Component {

  renderDocumentRow(doc) {
    return (
      <DocumentTableRow
        document={doc}
        {... this.props}
        />
    );
  }

  renderDocuments(documents) {
    if (documents && documents.length) {
      return documents.map((doc) => {
        return this.renderDocumentRow(doc);
      });
    }

    return (
      <tr className="no-results-row">
        <td colSpan={this.props.hasTemplate ? '6' : '5'}>
          {this.props.emptyText ? this.props.emptyText : 'Tom' }...
        </td>
      </tr>
    );
  }

  render() {
    return (
      <div>
        <DocumentTableDropdown {...this.props} />

        <div className="row default-table table-wrapper">
          <div className="col-xs-12">
            <div className="panel panel-default">
              <table className="table table-hover" id="{{tableName}}">
                <thead>
                  <tr>
                    <th><input type="checkbox" className="checkbox-master" aria-label="..." /></th>
                    <th>Navn</th>
                    <th>Opprettet</th>
                    <th>Sist endret</th>
                    { this.props.hasTemplate ? (<th>Mal brukt</th>) : null }
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {this.renderDocuments(this.props.documents)}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
