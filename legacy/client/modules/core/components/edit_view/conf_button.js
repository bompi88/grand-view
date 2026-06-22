import React from 'react';
import PropTypes from 'prop-types';

const ConfButton = (props) => {
  const { text, mode, changeMode } = props;

  return (
    <div className="dropdown pull-right btn-group" role="group">
      <button
        aria-expanded="false"
        className="btn btn-default dropdown-toggle menu-button"
        data-toggle="dropdown"
        type="button"
      >
        <span className="glyphicon glyphicon-cog" />
      </button>

      <ul className="dropdown-menu toggle-advanced-mode">
        { mode === 'easy' ? (
          <li className="disabled">
            <a href="#" className="easy-mode">
              <span className="glyphicon glyphicon-ok green" /> {text.collapsedMode}
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
              <span className="glyphicon glyphicon-ok green" /> {text.expandedMode}
            </a>
          </li>
        ) : (
          <li>
            <a
              href="#"
              className="advanced-mode no-icon"
              onClick={changeMode.bind(this, 'advanced')}
            >{text.expandedMode}</a>
          </li>
        )}
      </ul>
    </div>
  );
};

ConfButton.propTypes = {
  text: PropTypes.PropTypes.shape({
    expandedMode: PropTypes.string,
    collapsedMode: PropTypes.string,
  }),
  mode: PropTypes.string,
  changeMode: PropTypes.func.isRequired,
};

ConfButton.defaultProps = {
  mode: 'easy',
  text: {
    expandedMode: 'Expanded Mode',
    collapsedMode: 'Collapsed Mode',
  },
};

export default ConfButton;
