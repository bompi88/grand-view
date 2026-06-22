// //////////////////////////////////////////////////////////////////////////////
// Document Table Component
// //////////////////////////////////////////////////////////////////////////////
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
// //////////////////////////////////////////////////////////////////////////////

import React from 'react';

import DocumentTableRow from './table_row';


class DocumentTable extends React.Component {

  renderDocumentRow(doc) {
    return (
      <DocumentTableRow
        key={doc._id}
        doc={doc}
        {... this.props}
      />
    );
  }

  renderDocuments(documents) {
    const { text, emptyText, columns } = this.props;

    if (documents && documents.length) {
      return documents.map(doc => this.renderDocumentRow(doc));
    }
    return (
      <tr className="no-results-row" key="none">
        <td colSpan={columns.length + 1}>
          {emptyText || text.isEmpty}...
        </td>
      </tr>
    );
  }

  getSortIcon(field) {
    const { getSort, tableName } = this.props;
    const sort = getSort(field, tableName);

    if (!sort) {
      return <span />;
    }

    if (sort === -1) {
      return <span className="glyphicon glyphicon-chevron-up sort-icon" />;
    }

    return <span className="glyphicon glyphicon-chevron-down sort-icon" />;
  }

  renderHeaderColumn(column) {
    const { tableName, toggleSort } = this.props;
    const { field, label, key, sortable } = column;
    return (
      <th
        className={sortable ? 'clickable-list-item' : ''}
        onClick={sortable ? toggleSort.bind(this, field, tableName) : null}
        key={key}
      >
        {label || ''} {sortable ? this.getSortIcon(field) : ''}
      </th>
    );
  }

  renderHeaderColumns() {
    const { columns } = this.props;

    return columns.map(column => this.renderHeaderColumn(column));
  }

  renderTable() {
    const {
      documents,
      hasAllSelected,
      selectAll,
      deselectAll,
      tableName,
    } = this.props;

    const { _ } = this.props.context();

    const checked = hasAllSelected(documents && documents.length || 0, tableName);
    const ids = _.pluck(documents, '_id');

    return (
      <table className="table table-hover">
        <thead>
          <tr>
            <th key="checkbox">
              <input
                type="checkbox"
                className="checkbox-master"
                checked={checked}
                onChange={checked ? deselectAll.bind(this, ids, tableName) :
                  selectAll.bind(this, ids, tableName)}
              />
            </th>
            {this.renderHeaderColumns()}
          </tr>
        </thead>
        <tbody>
          {this.renderDocuments(documents)}
        </tbody>
      </table>
    );
  }

  render() {
    const { tableHeader } = this.props;

    return (
      <div className="row default-table table-wrapper">
        <div className="col-xs-12">
          { tableHeader ? (
            <div className="panel panel-default">
              <div className="panel-heading"><b>{tableHeader}</b></div>
              {this.renderTable()}
            </div>
          ) : (
            <div className="panel panel-default">
              {this.renderTable()}
            </div>
          )}
        </div>
      </div>
    );
  }
}

DocumentTable.propTypes = {
  documents: React.PropTypes.arrayOf(React.PropTypes.shape({
    title: React.PropTypes.string.isRequired,
    createdAt: React.PropTypes.instanceOf(Date).isRequired,
    lastModified: React.PropTypes.instanceOf(Date).isRequired,
    hasTemplate: React.PropTypes.string,
  })),
  text: React.PropTypes.shape({
    header: React.PropTypes.string.isRequired,
    title: React.PropTypes.string,
    createdAt: React.PropTypes.string,
    lastModified: React.PropTypes.string,
    templateUsed: React.PropTypes.string,
    isEmpty: React.PropTypes.string,
    by: React.PropTypes.string,
    remove: React.PropTypes.string,
    export: React.PropTypes.string,
  }),
  openDocument: React.PropTypes.func,
  exportDocument: React.PropTypes.func,
  removeDocument: React.PropTypes.func,
  getTemplateTitle: React.PropTypes.func,
  toggleSelected: React.PropTypes.func.isRequired,
  isSelected: React.PropTypes.func.isRequired,
  tableName: React.PropTypes.string.isRequired,
};

DocumentTable.defaultProps = {
  text: {
    title: 'Title',
    createdAt: 'Created at',
    lastModified: 'Last modified',
    templateUsed: 'Template used',
    isEmpty: 'No templates found',
    by: 'by',
    remove: 'Remove',
    export: 'Export',
  },
};

export default DocumentTable;
