import React from 'react';

export default class UndoRedoButton extends React.Component {

  renderRedo() {
    const { redo } = this.props;
    return (
      <button
        aria-expanded="false"
        className="btn btn-default dropdown-toggle menu-button menu-button-white redo-btn"
        role="button"
        type="button"
        onClick={redo.bind(this)}
      >
        <i className="fa fa-repeat"></i>
      </button>
    );
  }

  renderUndo() {
    const { undo } = this.props;

    return (
      <button
        aria-expanded="false"
        className="btn btn-default dropdown-toggle menu-button menu-button-white undo-btn"
        role="button"
        type="button"
        onClick={undo.bind(this)}

      >
        <i className="fa fa-undo"></i>
      </button>
    );
  }

  render() {
    const { isRedo = false, text } = this.props;

    const buttonTitle = isRedo ? text.redo : text.undo;

    return (
      <div className="btn-group pull-right" role="group" title={buttonTitle}>
        {isRedo ? this.renderRedo() : this.renderUndo()}
      </div>
    );
  }
}
