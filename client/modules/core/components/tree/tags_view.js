import React from 'react';

export default class TagsView extends React.Component {

  renderNode(node) {
    const active = false; // currentState === item.state ? 'active' : '';

    return (
      <li
        key={node._id}
        className="node"
      >
        <span draggable="false" className="element disable-select">
          <span className="glyphicon glyphicon-file"></span> {node.name}
        </span>
      </li>
    );
  }

  renderNodes(nodes) {
    return (
      <ul>
        { nodes.map((node) => {
          return this.renderNode(node);
        })}
      </ul>
    );
  }

  renderTag(item) {
    return (
      <li
        className="tag"
        key={item.tag}
      >
        <span draggable="false" className="element disable-select">
          <span className="glyphicon glyphicon-plus-sign show-node"></span>
          {item.tag}
        </span>
        { item.nodes ? this.renderNodes(item.nodes) : null }
      </li>
    );
  }

  renderTags(items) {
    return (
      <ul>
        { items.map((item) => {
          return this.renderTag(item);
        })}
      </ul>
    );
  }

  renderNoTags() {
    return (
      <div>
        <em>Ingen nøkkelord er tilbundet informasjonselementene enda. Legg til nøkkelord under redigering av informasjonselement.</em>
      </div>
    );
  }

  render() {
    const { items } = this.props;
    return (
      <div className="tree structure disable-select">
        { items && items.length ? this.renderTags(items) : this.renderNoTags() }
      </div>
    );
  }
}
