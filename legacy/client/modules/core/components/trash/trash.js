import React from 'react';

import DocumentTable from '../table/table';
import TrashTableDropdown from '../../containers/trash_table_dropdown';

export default class Documents extends React.Component {
  render() {
    const { text, docs, templates } = this.props;

    return (
      <div className="container default-container animated fadeIn">
        <div className="row">
          <div>
            <TrashTableDropdown {...this.props} dropdownClasses="pull-right" />
            <h3>
              <span className="glyphicon glyphicon-trash" /> {text.header}
            </h3>
            <DocumentTable
              dropdownClasses="pull-right"
              documents={docs}
              tableName="trash_documents"
              tableHeader={text.docsTableHeader}
              emptyText={text.isDocumentsEmpty}
              {...this.props}
            />
            <DocumentTable
              dropdownClasses="pull-right"
              documents={templates}
              tableName="trash_templates"
              tableHeader={text.templatesTableHeader}
              emptyText={text.isTemplatesEmpty}
              {...this.props}
            />
          </div>
        </div>
      </div>
    );
  }
}
