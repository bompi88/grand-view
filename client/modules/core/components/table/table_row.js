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

class DocumentTableRow extends React.Component {

  renderColumns(doc) {
    const {columns, context} = this.props;
    const {_} = context();

    return columns.map((column) => {
      const {transform, field, label, args = []} = column;

      let value;
      if (transform) {
        value = args.length ? this.props[transform](doc[field], { ..._.pick(this.props, args) }) :
          this.props[transform](doc[field]);
      } else {
        value = doc[field];
      }

      if (column.component) {
        return <column.component value={value} key={value} {...this.props}/>;
      }

      return <td key={label} className="row-item">{value}</td>;
    });
  }

  render() {
    const {
      doc,
      openDocument,
      toggleSelected,
      isSelected,
      tableName,
      disablePointer
    } = this.props;

    const checked = isSelected(doc._id, tableName) ? 'checked' : null;

    return (
      <tr
        className={disablePointer ? 'table-row' : 'table-row clickable-row'}
        onClick={openDocument ? openDocument.bind(this, doc._id) : null}
      >
        <td
          key="checkbox"
          className="row-item"
          onClick={(e) => { e.stopPropagation(); }}
          onChange={toggleSelected.bind(this, doc._id, tableName)}
        >
          <input type="checkbox" className="checkbox" checked={checked}/>
        </td>

        {this.renderColumns(doc)}

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
  openDocument: React.PropTypes.func,
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
