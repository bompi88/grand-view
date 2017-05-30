import React from 'react';

export default class ConfButton extends React.Component {

  render() {
    const { text, mode, changeMode } = this.props;

    return (
      <div className="dropdown pull-right btn-group" role="group">
        <button
          aria-expanded="false"
          className="btn btn-default dropdown-toggle menu-button"
          role="button"
          data-toggle="dropdown"
          type="button"
        >
          <span className="glyphicon glyphicon-cog"></span>
        </button>

        <ul className="dropdown-menu toggle-advanced-mode">
          { mode === 'easy' ? (
            <li className="disabled">
              <a href="#" className="easy-mode">
                <span className="glyphicon glyphicon-ok green"></span> {text.collapsedMode}
              </a>
            </li>
          ) : (
            <li>
              <a
                href="#"
                className="easy-mode no-icon"
                onClick={changeMode.bind(this, 'easy')}
              >{text.collapsedMode}</a>
            </li>
          )}

          { mode === 'advanced' ? (
            <li className="disabled">
              <a href="#" className="advanced-mode">
                <span className="glyphicon glyphicon-ok green"></span> {text.expandedMode}
              </a>
            </li>
          ) : (
            <li>
              <a
                href="#"
                className="advanced-mode no-icon"
                onClick={changeMode.bind(this, 'advanced')}
              >{text.expandedMode}</a></li>
          )}
        </ul>
      </div>
    );
  }
}
