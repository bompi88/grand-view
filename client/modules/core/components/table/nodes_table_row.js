import React from 'react';
import ReactDOM from 'react-dom';
import Linkify from 'react-linkify';
import { ContextMenuLayer } from 'react-contextmenu';

import EditViewForm from '../../containers/edit_view_form';

class NodesTableRow extends React.Component {

  constructor(props) {
    super(props);
    this.setDragable = this.setDragable.bind(this);
    this.unsetDragable = this.unsetDragable.bind(this);
    this.state = {
      dragable: true,
    };
  }

  handleClick(e) {
    const { unsetNodeEditable, nodeId } = this.props;
    const target = ReactDOM.findDOMNode(this.refs.target);

    if (!target || (e.target.className && e.target.className.indexOf('mfp') > -1)) {
      return;
    }

    if (target.contains(e.target)) {
      return;
    }

    unsetNodeEditable(nodeId);
  }

  handleKeyPress(e) {
    const { unsetNodeEditable, node: { _id: nodeId } } = this.props;

    if (e.keyCode === 27) {
      unsetNodeEditable(nodeId);
    }
  }

  componentWillMount() {
    document.addEventListener('click', this.handleClick.bind(this), false);
    document.addEventListener('keydown', this.handleKeyPress.bind(this));
  }

  componentWillUnmount() {
    document.removeEventListener('click', this.handleClick.bind(this), false);
    document.removeEventListener('keydown', this.handleKeyPress.bind(this));
  }

  renderTags(tags) {
    const { text } = this.props;
    return (
      <li className="node-list-item">
        <b>{text.tags}:</b> {tags.map(n => n.label).join(', ')}
      </li>
    );
  }

  renderNode(node) {
    const { mode, text, openLink, tableName } = this.props;

    if (mode === 'easy') {
      const wrappedItem = ContextMenuLayer('media', () => { return { tableName, ...node }; })(() => {
        return (
          <div style={{ lineHeight: '1.3em', whiteSpace: 'pre-wrap' }}>
            <h5 style={{ marginTop: '0' }}>{node.name ? node.name : text.noName}</h5>
          </div>
        );
      });
      return React.createElement(wrappedItem, {});
    }

    const wrappedItem = ContextMenuLayer('media', () => { return { tableName, ...node }; })(() => {
      return (
        <div style={{ lineHeight: '1.3em', whiteSpace: 'pre-wrap' }}>
          <h5 style={{ marginTop: '0' }}>{node.name ? node.name : text.noName}</h5>
          {node.description ? (
            <Linkify properties={{ onClick: openLink }}>
              <p>{node.description.trim()}</p>
            </Linkify>
          ) : null}
          {this.renderCategorization(node)}
        </div>
      );
    });

    return React.createElement(wrappedItem, {});
  }

  renderReferences(references) {
    const { text } = this.props;
    return (
      <li className="node-list-item">
        <b>{text.references}:</b> {references.map(n => n.label).join(', ')}
      </li>
    );
  }

  renderCategorization(node) {
    const { tags = [], references = [] } = node;

    if (!tags.length && !references.length) {
      return null;
    }

    return (
      <ul className="node-list">
        {tags.length ? this.renderTags(tags) : null}
        {references.length ? this.renderReferences(references) : null}
      </ul>
    );
  }

  setDragable() {
    this.setState({
      dragable: true,
    });
  }

  unsetDragable() {
    this.setState({
      dragable: false,
    });
  }

  render() {
    const {
      node = {},
      setNodeEditable,
      isSelected,
      tableName,
      disablePointer,
      editNode,
      text,
      isDragging,
      connectDragSource,
      connectDropTarget,
      toggleSelected,
      sortable = true,
    } = this.props;

    const opacity = isDragging ? 0 : 1;

    const isInEditMode = editNode === node._id;

    const checked = isSelected(node._id, tableName) ? 'checked' : '';
    // onChange={toggleSelected.bind(this, node._id, tableName)}

    if (this.state.dragable && sortable) {
      return (connectDragSource(connectDropTarget(
        <tr
          className={isInEditMode || disablePointer ? 'table-row' : 'table-row clickable-row'}
          style={{ opacity }}
        >
          <td
            key="checkbox"
            className="row-item"
            onClick={toggleSelected.bind(this, node._id, tableName)}
            style={{
              width: '20px',
            }}
          >
            <input type="checkbox" className="checkbox" checked={checked} />
          </td>

          <td
            key="informationelement"
            className="row-item"
            style={{
              paddingTop: 0,
              paddingBottom: 0,
            }}
            onClick={isInEditMode ? null : setNodeEditable.bind(this, node._id)}
          >
            { isInEditMode ? (
              <div style={{
                paddingTop: '10px',
                paddingBottom: '10px',
              }} >
                <div
                  className="alert alert-info" dangerouslySetInnerHTML={{
                    __html: text.closeFormInfo,
                  }}
                />
                <EditViewForm
                  initialValues={node}
                  nodeId={node._id}
                  setDragable={this.setDragable}
                  unsetDragable={this.unsetDragable}
                />
              </div>
            ) : this.renderNode(node)}
          </td>
        </tr>,
      )));
    }

    return (
      <tr
        className={isInEditMode || disablePointer ? 'table-row' : 'table-row clickable-row'}
        style={{ opacity }}
      >
        <td
          key="checkbox"
          className="row-item"
          onClick={toggleSelected.bind(this, node._id, tableName)}
          style={{
            width: '20px',
          }}
        >
          <input type="checkbox" className="checkbox" checked={checked} />
        </td>

        <td
          key="informationelement"
          className="row-item"
          onClick={isInEditMode ? null : setNodeEditable.bind(this, node._id)}
        >
          { isInEditMode ? (
            <div>
              <div
                className="alert alert-info" dangerouslySetInnerHTML={{
                  __html: text.closeFormInfo,
                }}
              />
              <EditViewForm
                initialValues={node}
                nodeId={node._id}
                setDragable={this.setDragable}
                unsetDragable={this.unsetDragable}
              />
            </div>
          ) : this.renderNode(node)}
        </td>
      </tr>
    );
  }
}

export default NodesTableRow;
