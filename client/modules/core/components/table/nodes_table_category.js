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
import update from 'react/lib/update';
import NodesTableRow from '../../containers/nodes_table_row';

const styles = {
  heading: {
    height: '42px'
  }
};


class NodesTableCateory extends React.Component {

  constructor(props) {
    super(props);
    this.moveNode = this.moveNode.bind(this);
    this.state = {
      nodes: props.nodes
    };
  }

  componentWillReceiveProps(props) {
    this.state = {
      nodes: props.nodes
    };
  }

  moveNode(dragIndex, hoverIndex) {
    const { nodes } = this.state;
    const dragNode = nodes[dragIndex];

    this.setState(update(this.state, {
      nodes: {
        $splice: [
          [ dragIndex, 1 ],
          [ hoverIndex, 0, dragNode ],
        ],
      },
    }));
  }

  renderNodeRow(node, i) {
    return (
      <NodesTableRow
        key={node._id}
        node={node}
        index={i}
        sortable={false}
        {... this.props}
        />
    );
  }

  renderNodes() {
    const { nodes } = this.state;
    const { text, emptyText } = this.props;

    if (nodes && nodes.length) {
      return nodes.map((doc, i) => {
        return this.renderNodeRow(doc, i);
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
      tableName,
      text,
      removeSelectedNodes,
      isDisabledOnNone
    } = this.props;

    const {_} = this.props.context();

    const checked = hasAllSelected(nodes && nodes.length || 0, tableName);
    const ids = _.pluck(nodes, '_id');

    const disabled = isDisabledOnNone(tableName) ? 'disabled' : '';

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
              <div className="dropup pull-right" style={{ marginRight: '10px' }}>
                <button
                  className="btn btn-default btn-xs dropdown-toggle"
                  type="button"
                  data-toggle="dropdown"
                  aria-expanded="true"
                >
                  {text.chooseAction} <span className="caret"></span>
                </button>
                <ul
                  className="dropdown-menu dropdown-menu-right"
                  role="menu"
                  aria-labelledby="media-node-dropdown"
                >
                  <li
                    role="presentation"
                    className={disabled}
                    onClick={disabled === 'disabled' ? null : removeSelectedNodes.bind(this, tableName)}>
                    <a
                      role="menuitem"
                      tabIndex="-1"
                      href="#"
                    >
                      <span className="glyphicon glyphicon-remove"></span> {text.removeSelected}
                    </a>
                  </li>
                </ul>
              </div>
            </th>
          </tr>
        </thead>
        <tbody>
          {this.renderNodes()}
        </tbody>
      </table>
    );
  }

  render() {

    const { category, text } = this.props;

    return (
      <div className="row default-table">
        <div className="col-xs-12">
            <h4>{category !== 'undefined' ? category : null}</h4>
            <div className="panel panel-default">
              <div className="panel-heading" style={styles.heading}>
                <b>{text.tableHeader}</b>
              </div>
              {this.renderTable()}
            </div>
      </div>
    </div>
    );
  }
}

export default NodesTableCateory;
