import React from 'react';
import {Modal, FormGroup, ControlLabel, FormControl, Button} from 'react-bootstrap';

const CreateModal = React.createClass({
  propTypes: {
    isOpen: React.PropTypes.bool.isRequired,
    close: React.PropTypes.func.isRequired,
    generate: React.PropTypes.func.isRequired,
    title: React.PropTypes.string.isRequired,
    description: React.PropTypes.string,
    cancelBtn: React.PropTypes.string,
    generateBtn: React.PropTypes.string,
    selectLabel: React.PropTypes.string,
    selectOptions: React.PropTypes.arrayOf(React.PropTypes.shape({
      value: React.PropTypes.string,
      label: React.PropTypes.string
    })).isRequired
  },

  renderSelectOptions() {
    const {selectOptions} = this.props;

    return selectOptions.map((option) => {
      return <option key={option.value} value={option.value}>{option.label}</option>;
    });
  },

  render() {
    const {
      isOpen,
      close,
      generate,
      title,
      description,
      cancelBtn,
      generateBtn,
      selectLabel
    } = this.props;

    return (
      <div className="create-modal">
        <Modal show={isOpen} onHide={close}>
          <Modal.Header closeButton>
            <Modal.Title>{title}</Modal.Title>
          </Modal.Header>

          <Modal.Body>
            <p>
              <em>{description}</em>
            </p>
            <FormGroup controlId="formControlsSelect">
              <ControlLabel>{selectLabel || 'Select'}</ControlLabel>
              <FormControl componentClass="select" placeholder="select">
                {this.renderSelectOptions()}
              </FormControl>
            </FormGroup>
          </Modal.Body>

          <Modal.Footer>
            <Button onClick={close}>{cancelBtn || 'Cancel'}</Button>
            <Button onClick={generate} bsStyle="primary">{generateBtn || 'OK'}</Button>
          </Modal.Footer>

        </Modal>
      </div>
    );
  }
});

export default CreateModal;
