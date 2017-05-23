import React from 'react';
import ReactDOM from 'react-dom';
import Linkify from 'react-linkify';

import EditViewForm from '../../containers/edit_view_form';


export default class NodesTableRow extends React.Component {

  handleClick(e) {
    const { unsetEditable, nodeId } = this.props;
    const target = ReactDOM.findDOMNode(this.refs.target);

    if (!target || (e.target.className && e.target.className.indexOf('mfp') > -1)) {
      return;
    }

    if (target.contains(e.target)) {
      return;
    }

    unsetEditable(nodeId);
  }

  handleKeyPress(e) {
    const { unsetEditable, node: { _id: nodeId } } = this.props;

    if (e.keyCode === 27) {
      unsetEditable(nodeId);
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
        <b>{text.tags}:</b> {tags.map((n) => n.label).join(', ')}
      </li>
    );
  }

  renderNode(node) {
    const { mode, text, openLink } = this.props;
    if (mode === 'easy') {
      return (
        <div style={{ lineHeight: '1.3em', whiteSpace: 'pre-wrap' }}>
          <h5 style={{ marginTop: '0' }}>{node.name ? node.name : text.noName}</h5>
        </div>
      );
    }

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
  }

  renderReferences(references) {
    const { text } = this.props;
    return (
      <li className="node-list-item">
        <b>{text.references}:</b> {references.map((n) => n.label).join(', ')}
      </li>
    );
  }

  renderCategorization(node) {
    const { tags = [], references = []} = node;

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

  render() {
    const {
      node = {},
      setAsEditable,
      isSelected,
      tableName,
      disablePointer,
      editNode,
      text,
      isDragging,
      connectDragSource,
      connectDropTarget
    } = this.props;

    const opacity = isDragging ? 0 : 1;

    const isInEditMode = editNode === node._id;

    const checked = isSelected(node._id, tableName) ? 'checked' : null;
    // onChange={toggleSelected.bind(this, node._id, tableName)}

    return (connectDragSource(connectDropTarget(
      <tr
        className={isInEditMode || disablePointer ? 'table-row' : 'table-row clickable-row'}
        style={{ opacity }}
      >
        <td
          key="checkbox"
          className="row-item"
          onClick={(e) => { e.stopPropagation(); }}
          style={{
            width: '20px'
          }}
        >
          <input type="checkbox" className="checkbox" checked={checked}/>
        </td>

        <td
          key="informationelement"
          className="row-item"
          onClick={isInEditMode ? null : setAsEditable.bind(this, node._id)}
        >
          { isInEditMode ? (
            <div>
              <div className="alert alert-info" dangerouslySetInnerHTML={{
                __html: text.closeFormInfo
              }}>
              </div>
              <EditViewForm initialValues={node} nodeId={node._id} />
            </div>
          ) : this.renderNode(node)}
        </td>
      </tr>
    )));
  }
}
