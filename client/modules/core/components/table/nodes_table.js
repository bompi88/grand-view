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
import EditViewForm from '../../containers/edit_view_form';

const styles = {
  heading: {
    height: '42px'
  }
};

class NodesTableRow extends React.Component {
  render() {
    const {
      node,
      setAsEditable,
      toggleSelected,
      isSelected,
      tableName,
      disablePointer
    } = this.props;

    const checked = isSelected(node._id, tableName) ? 'checked' : null;
    // onChange={toggleSelected.bind(this, node._id, tableName)}

    return (
      <tr
        className={disablePointer ? 'table-row' : 'table-row clickable-row'}
      >
        <td
          key="checkbox"
          className="row-item"
          onClick={(e) => { e.stopPropagation(); }}

        >
          <input type="checkbox" className="checkbox" checked={checked}/>
        </td>

        <td
          key="informationelement"
          className="row-item"
          onClick={setAsEditable.bind(this, node._id, node.mainDocId)}
        >
          { node.isInEditMode ? (
            <div>
              <div className="alert alert-info">
                <b>NB!</b> Du er nå i redigeringsmodus. Trykk på <kbd>ESC</kbd> for å gå ut.
              </div>
              <EditViewForm initialValues={node} nodeId={node._id} />
            </div>
          ) : (
            <div>
              <h5 style={{ marginTop: '0' }}>{node.name ? node.name : 'No title'}</h5>
              {node.description ? (<p>{node.description}</p>) : (<p> - </p>)}
              <ul className="node-list">
                <li className="node-list-item"><b>Kilder:</b> { node.references ? node.references.map((n) => n.label).join(', ') : null}</li>
                <li className="node-list-item"><b>Nøkkelord:</b> { node.tags ? node.tags.map((n) => n.label).join(', ') : null}</li>
              </ul>
            </div>
          )}
        </td>
      </tr>
    );
  }
}


class NodesTable extends React.Component {

  renderNodeRow(node) {
    return (
      <NodesTableRow
        key={node._id}
        node={node}
        {... this.props}
        />
    );
  }

  renderNodes(nodes) {
    const {text, emptyText} = this.props;

    if (nodes && nodes.length) {
      return nodes.map((doc) => {
        return this.renderNodeRow(doc);
      });
    }
    return (
      <tr className="no-results-row" key="none">
        <td colSpan="2">
          {emptyText ? emptyText : text.isEmpty}...
        </td>
      </tr>
    );
  }

  renderTable() {
    const {
      nodes,
      hasAllSelected,
      selectAll,
      deselectAll,
      tableName
    } = this.props;

    const {_} = this.props.context();

    const checked = hasAllSelected(nodes && nodes.length || 0, tableName);
    const ids = _.pluck(nodes, '_id');

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
            <th>
            </th>
          </tr>
        </thead>
        <tbody>
          {this.renderNodes(nodes)}
        </tbody>
      </table>
    );
  }

  render() {

    const { chapterNode, text, addMediaNode } = this.props;

    return (
      <div className="row default-table">
        <div className="col-xs-12">
            <h4>{chapterNode.name}</h4>
            <div className="panel panel-default">
              <div className="panel-heading" style={styles.heading}>
                <b>{text.header}</b>
                <button
                  className="btn btn-xs btn-success pull-right"
                  onClick={addMediaNode.bind(this, chapterNode)}
                >
                  <span className="glyphicon glyphicon-plus"></span> {text.informationelement}
                </button>
              </div>
              {this.renderTable()}
            </div>
      </div>
    </div>
    );
  }
}

export default NodesTable;
