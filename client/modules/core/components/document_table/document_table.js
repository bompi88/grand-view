////////////////////////////////////////////////////////////////////////////////
// Document Table Component
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

import DocumentTableDropdown from '../../containers/document_table_dropdown';
import TemplateTableDropdown from '../../containers/template_table_dropdown';
import DocumentTableRow from './document_table_row';


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
    const {text, showTemplates} = this.props;

    if (documents && documents.length) {
      return documents.map((doc) => {
        return this.renderDocumentRow(doc);
      });
    }
    return (
      <tr className="no-results-row" key="none">
        <td colSpan={showTemplates ? '6' : '5'}>
          {text.isEmpty}...
        </td>
      </tr>
    );
  }

  getSortIcon(field) {
    const {getSort} = this.props;
    const sort = getSort(field);

    if (!sort) {
      return <span></span>;
    }

    if (sort === -1) {
      return <span className="glyphicon glyphicon-chevron-up sort-icon"></span>;
    }

    return <span className="glyphicon glyphicon-chevron-down sort-icon"></span>;
  }

  render() {
    const {
      text,
      documents,
      showTemplates,
      hasAllSelected,
      selectAll,
      deselectAll,
      toggleSort
    } = this.props;

    const {_} = this.props.context();

    const checked = hasAllSelected(documents && documents.length || 0);
    const ids = _.pluck(documents, '_id');

    return (
      <div>
        { showTemplates ? (
            <DocumentTableDropdown {...this.props} />
          ) : (
            <TemplateTableDropdown {...this.props} />
          )
        }
        <h3>
          <span className="glyphicon glyphicon-book"></span> {text.header}
        </h3>
        <div className="row default-table table-wrapper">
          <div className="col-xs-12">
            <div className="panel panel-default">
              <table className="table table-hover">
                <thead>
                  <tr>
                    <th>
                      <input
                        type="checkbox"
                        className="checkbox-master"
                        checked={checked}
                        onChange={checked ? deselectAll.bind(this, ids) : selectAll.bind(this, ids)}
                      />
                    </th>
                    <th
                      className="clickable-list-item"
                      onClick={toggleSort.bind(this, 'title')}
                    >
                      {text.title} {this.getSortIcon('title')}
                    </th>
                    <th
                      className="clickable-list-item"
                      onClick={toggleSort.bind(this, 'createdAt')}
                    >
                      {text.createdAt} {this.getSortIcon('createdAt')}
                    </th>
                    <th
                      className="clickable-list-item"
                      onClick={toggleSort.bind(this, 'lastModified')}
                    >
                      {text.lastModified} {this.getSortIcon('lastModified')}
                    </th>
                    { showTemplates ? (<th>{text.templateUsed}</th>) : null }
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {this.renderDocuments(documents)}
                </tbody>
              </table>
            </div>
          </div>
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
    hasTemplate: React.PropTypes.string
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
    export: React.PropTypes.string
  }),
  openDocument: React.PropTypes.func.isRequired,
  exportDocument: React.PropTypes.func,
  removeDocument: React.PropTypes.func,
  getTemplateTitle: React.PropTypes.func,
  toggleSelected: React.PropTypes.func.isRequired,
  isSelected: React.PropTypes.func.isRequired,
  showTemplates: React.PropTypes.bool,
  showEditOptions: React.PropTypes.bool,
  tableName: React.PropTypes.string.isRequired
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
    export: 'Export'
  }
};

export default DocumentTable;
