import React from 'react';

/* The menu items for right click of root node */
export class RootNode extends React.Component {
  render() {
    return (
      <div className="contextMenu" id="right-click-menu-root">
        <ul>
          <li id="add-chapter-node">
            <span className="glyphicon glyphicon-plus"></span> Legg til kapittel
          </li>
          <li id="delete-node">
            <span className="glyphicon glyphicon-remove"></span> Slett
          </li>
        </ul>
      </div>
    );
  }
}

/* The menu items for right click of chapter node */
export class ChapterNode extends React.Component {

  showAddMediaNode() {
    // TODO use localstate
    if (Session.get('showMediaNodes')) {
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

/* The menu items for right click of media node */
export class MediaNode extends React.Component {
  render() {

    return (
      <div className="contextMenu" id="right-click-menu-media-node">
        <ul>
          <li id="edit-node">
            <span className="glyphicon glyphicon-pencil"></span> Rediger
          </li>
          <li id="delete-node">
            <span className="glyphicon glyphicon-remove"></span> Slett
          </li>
        </ul>
      </div>
    );
  }
}
