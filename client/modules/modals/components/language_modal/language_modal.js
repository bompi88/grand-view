import React from 'react';
import ReactDOM from 'react-dom';
import {Modal, FormGroup, ControlLabel, FormControl, Button} from 'react-bootstrap';

class LanguageModal extends React.Component {

  constructor(props) {
    super(props);
  }

  renderSelectOptions() {
    const {selectOptions} = this.props;

    return selectOptions.map((option) => {
      return (
        <option
          key={option.value}
          value={option.value}
        >{option.label}</option>
      );
    });
  }

  onSubmit(e) {
    e.preventDefault();
    const {save} = this.props;
    const language = ReactDOM.findDOMNode(this.refs.language).value;
    save(language);
  }

  render() {
    const {
      isOpen,
      close,
      selected,
      text
    } = this.props;

    return (
      <div className="create-modal">
        <Modal show={isOpen} onHide={close}>
          <form onSubmit={this.onSubmit.bind(this)}>
            <Modal.Header closeButton>
              <Modal.Title>{text.title}</Modal.Title>
            </Modal.Header>

            <Modal.Body>
              <p>
                <em>{text.description}</em>
              </p>
              <FormGroup controlId="formControlsSelect">
                <ControlLabel>{text.selectLabel}</ControlLabel>
                <FormControl
                  componentClass="select"
                  placeholder="select"
                  ref='language'
                  defaultValue={selected}
                >
                  {this.renderSelectOptions()}
                </FormControl>
              </FormGroup>
            </Modal.Body>

            <Modal.Footer>
              <Button onClick={close}>{text.cancelBtn}</Button>
              <Button type="submit" bsStyle="primary">{text.saveBtn}</Button>
            </Modal.Footer>
          </form>
        </Modal>
      </div>
    );
  }
}


LanguageModal.propTypes = {
  text: React.PropTypes.shape({
    title: React.PropTypes.string.isRequired,
    description: React.PropTypes.string,
    cancelBtn: React.PropTypes.string,
    saveBtn: React.PropTypes.string,
    selectLabel: React.PropTypes.string
  }),
  isOpen: React.PropTypes.bool.isRequired,
  close: React.PropTypes.func.isRequired,
  save: React.PropTypes.func.isRequired,
  selectOptions: React.PropTypes.arrayOf(React.PropTypes.shape({
    value: React.PropTypes.string,
    label: React.PropTypes.string
  })).isRequired
};


LanguageModal.defaultProps = {
  text: {
    title: 'Select Language',
    description: 'Select language below.',
    cancelBtn: 'Cancel',
    saveBtn: 'Save',
    selectLabel: 'Select'
  }
};

export default LanguageModal;
