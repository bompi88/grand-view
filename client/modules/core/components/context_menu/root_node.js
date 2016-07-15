import React from 'react';

/* The menu items for right click of root node */
export default class RootNode extends React.Component {
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
