import React from 'react';

/* The menu items for right click of chapter node */
export default class ChapterNode extends React.Component {

  showAddMediaNode() {
    const { showMediaNodes } = this.props;

    if (showMediaNodes) {
      return (
        <li id="add-media-node">
          <span className="glyphicon glyphicon-plus"></span> Legg til informasjonselement
        </li>
      );
    }
  }

  render() {
    return (
      <div className="contextMenu" id="right-click-menu-chapter-node">
        <ul>
          <li id="add-chapter-node">
            <span className="glyphicon glyphicon-plus"></span> Legg til underkapittel
          </li>
          {this.showAddMediaNode()}
          <li id="edit-node">
            <span className="glyphicon glyphicon-pencil"></span> Gi nytt navn
          </li>
          <li id="delete-node">
            <span className="glyphicon glyphicon-remove"></span> Slett
          </li>
        </ul>
      </div>
    );
  }
}
