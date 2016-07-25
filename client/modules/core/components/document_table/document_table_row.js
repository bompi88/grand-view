////////////////////////////////////////////////////////////////////////////////
// Document Table Row Component
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

import ExportButton from './../prototypes/export_button';

class DocumentTableRow extends React.Component {

  formatDateRelative(time) {
    const {moment} = this.props.context();
    return moment && moment(time).calendar();
  }

  formatDateRegular(time) {
    const {moment} = this.props.context();
    return moment && moment(time).format('L');
  }

  renderTemplateTitle(doc) {
    const {getTemplateTitle, text} = this.props;
    return getTemplateTitle(doc.hasTemplate) + ' (' + text.by + ' ' +
      this.formatDateRegular(doc.createdAt) + ')';
  }

  renderTemplateData(doc) {
    return (
      <td className="row-item">
        {doc.hasTemplate ? this.renderTemplateTitle(doc) : '-'}
      </td>
    );
  }

  renderEditOptions(doc) {
    const {exportDocument, removeDocument, text} = this.props;

    return (
      <td>
        <div className="btn-group pull-right">
          <ExportButton
            className="btn-sm"
            label={text.export}
            onClick={exportDocument.bind(this, doc._id)}
            doc={doc}
          />

          <button
            type="button"
            className="btn btn-danger btn-sm"
            onClick={removeDocument.bind(this, doc._id)}
          >
            <span className="glyphicon glyphicon-trash"></span> {text.remove}
          </button>
        </div>
      </td>
    );
  }

  render() {
    const {
      doc,
      showTemplates,
      showEditOptions,
      openDocument,
      toggleSelected,
      isSelected
    } = this.props;

    const checked = isSelected(doc._id) ? 'checked' : null;

    return (
      <tr className="table-row" onClick={openDocument.bind(this, doc._id)}>
        <td
          className="row-item"
          onClick={(e) => { e.stopPropagation(); }}
          onChange={toggleSelected.bind(this, doc._id)}
        >
          <input type="checkbox" className="checkbox" checked={checked}/>
        </td>
        <td className="row-item">{doc.title}</td>
        <td className="row-item">{this.formatDateRelative(doc.createdAt)}</td>
        <td className="row-item">{this.formatDateRelative(doc.lastModified)}</td>
        {showTemplates ? this.renderTemplateData(doc) : null}
        {showEditOptions ? this.renderEditOptions(doc) : null}
      </tr>
    );
  }
}

DocumentTableRow.propTypes = {
  doc: React.PropTypes.shape({
    title: React.PropTypes.string.isRequired,
    createdAt: React.PropTypes.instanceOf(Date).isRequired,
    lastModified: React.PropTypes.instanceOf(Date).isRequired,
    hasTemplate: React.PropTypes.string
  }).isRequired,
  text: React.PropTypes.shape({
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
  showEditOptions: React.PropTypes.bool
};

DocumentTableRow.defaultProps = {
  text: {
    by: 'by',
    remove: 'Remove',
    export: 'Export'
  }
};

export default DocumentTableRow;
