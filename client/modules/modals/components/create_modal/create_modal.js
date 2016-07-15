import React from 'react';
import {Modal, Button} from 'react-bootstrap';

const CreateModal = React.createClass({
  propTypes: {
    isOpen: React.PropTypes.bool.isRequired,
    close: React.PropTypes.func.isRequired,
    create: React.PropTypes.func.isRequired,
    title: React.PropTypes.string.isRequired,
    description: React.PropTypes.string,
    cancelBtn: React.PropTypes.string,
    okBtn: React.PropTypes.string
  },

  render() {
    const {isOpen, close, create, title, description, cancelBtn, okBtn} = this.props;

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
          </Modal.Body>

          <Modal.Footer>
            <Button onClick={close}>{cancelBtn || 'Cancel'}</Button>
            <Button onClick={create} bsStyle="primary">{okBtn || 'OK'}</Button>
          </Modal.Footer>

        </Modal>
      </div>
    );
  }
});

export default CreateModal;
