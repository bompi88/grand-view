import React from 'react';

/* The menu items for right click of media node */
export default class MediaNode extends React.Component {
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
