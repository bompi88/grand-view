import React from 'react';

import {formatDateRelative, formatDateRegular} from './../../../../../client/lib/helpers';


export default class DocumentTableRow extends React.Component {

  formatDateRelative(time) {
    return formatDateRelative(time);
  }

  getTemplateTitle(doc) {
    const {getTemplateTitle} = this.props;
    return getTemplateTitle(doc.templateBasis) + ' (av ' +
      formatDateRegular(document.createdOn) + ')';
  }

  renderTemplateData(doc) {
    return (
      <td class="row-item">
        {doc.templateBasis ? this.renderTemplateTitle(doc) : '-'}
      </td>
    );
  }

  renderEditOptions(doc) {
    return (
      <td>
        <div class="btn-group pull-right">
          <ExportButton doc={doc} clasName="btn-sm" label="Eksporter"/>

          <button type="button" id="btn-remove" class="btn btn-danger btn-sm">
            <span class="glyphicon glyphicon-trash"></span> Fjern
          </button>
        </div>
      </td>
    );
  }

  render() {
    const doc = this.props.document;

    return (
      <tr class="table-row">
        <td class="row-item"><input type="checkbox" class="checkbox" aria-label="..." /></td>
        <td class="row-item">{doc.title}</td>
        <td class="row-item">{this.formatDateRelative(doc.createdOn)}</td>
        <td class="row-item">{this.formatDateRelative(doc.lastChanged)}</td>
        {this.hasTemplate ? this.renderTemplateData(doc) : null}
        {this.editOptions ? this.renderEditOptions(doc) : null}
      </tr>
    );

  }
}
