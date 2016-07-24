import React from 'react';
import {moment} from 'meteor/momentjs:moment';

import ExportButton from './../prototypes/export_button';

export default class DocumentTableRow extends React.Component {

  formatDateRelative(time) {
    return moment && moment(time).calendar();
  }

  formatDateRegular(time) {
    return moment && moment(time).format('L');
  }

  renderTemplateTitle(doc) {
    const {getTemplateTitle} = this.props;
    return getTemplateTitle(doc.hasTemplate) + ' (av ' +
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
    const {exportDocument, removeDocument} = this.props;

    return (
      <td>
        <div className="btn-group pull-right">
          <ExportButton
            className="btn-sm"
            label="Eksporter"
            onClick={exportDocument.bind(this, doc._id)}
            doc={doc}
          />

          <button
            type="button"
            className="btn btn-danger btn-sm"
            onClick={removeDocument.bind(this, doc._id)}
          >
            <span className="glyphicon glyphicon-trash"></span> Fjern
          </button>
        </div>
      </td>
    );
  }

  render() {
    const {document: doc, showTemplates, showEditOptions, openDocument} = this.props;

    return (
      <tr className="table-row" onClick={openDocument.bind(this, doc._id)}>
        <td className="row-item">
          <input type="checkbox" className="checkbox" aria-label="..." />
        </td>
        <td className="row-item">{doc.title}</td>
        <td className="row-item">{this.formatDateRelative(doc.createdOn)}</td>
        <td className="row-item">{this.formatDateRelative(doc.lastChanged)}</td>
        {showTemplates ? this.renderTemplateData(doc) : null}
        {showEditOptions ? this.renderEditOptions(doc) : null}
      </tr>
    );
  }
}
