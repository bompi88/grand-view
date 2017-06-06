import React from 'react';
import ReactDOM from 'react-dom';
import { Modal, FormGroup, ControlLabel, FormControl, Button, Checkbox } from 'react-bootstrap';

class CreateModal extends React.Component {

  renderSelectOptions() {
    const {selectOptions} = this.props;

    return selectOptions.map((option) => {
      return <option key={option.value} value={option.value}>{option.label}</option>;
    });
  }

  generate() {
    const {generate} = this.props;
    const format = ReactDOM.findDOMNode(this.refs.format).value;
    const compact = this.compact.checked;
    generate(format, compact);
  }

  render() {
    const {
      isOpen,
      close,
      title,
      description,
      cancelBtn,
      generateBtn,
      selectLabel,
      compactMode
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
              <FormControl ref="format" componentClass="select" placeholder="select">
                {this.renderSelectOptions()}
              </FormControl>
              <Checkbox inputRef={ref => { this.compact = ref; }}>
                {compactMode}
              </Checkbox>
            </FormGroup>
          </Modal.Body>

          <Modal.Footer>
            <Button onClick={close}>{cancelBtn || 'Cancel'}</Button>
            <Button
              onClick={this.generate.bind(this)}
              bsStyle="primary"
            >{generateBtn || 'OK'}</Button>
          </Modal.Footer>

        </Modal>
      </div>
    );
  }
}

CreateModal.propTypes = {
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
};

export default CreateModal;
