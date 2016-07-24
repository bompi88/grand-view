import React from 'react';
import {Modal, HelpBlock, FormGroup, ControlLabel, FormControl, Button} from 'react-bootstrap';

const CreateModal = React.createClass({
  propTypes: {
    title: React.PropTypes.string.isRequired,
    description: React.PropTypes.string,
    cancelBtn: React.PropTypes.string,
    okBtn: React.PropTypes.string,
    selectLabel: React.PropTypes.string,
    selectOptions: React.PropTypes.arrayOf(React.PropTypes.shape({
      value: React.PropTypes.string,
      label: React.PropTypes.string
    })).isRequired,
    helperTexts: React.PropTypes.shape({
      minLength: React.PropTypes.string,
    }).isRequired,

    isOpen: React.PropTypes.bool.isRequired,
    isTemplate: React.PropTypes.bool.isRequired,

    close: React.PropTypes.func.isRequired,
    create: React.PropTypes.func.isRequired
  },

  getInitialState() {
    return {
      title: '',
      template: ''
    };
  },

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
  },

  getValidationState() {
    const title = this.state.title;
    const length = title.length;

    if (length >= 5) {
      return 'success';
    } else if (length > 0) {
      return 'error';
    }
  },

  reset() {
    this.setState(this.getInitialState());
  },

  create() {
    const {create, isTemplate} = this.props;
    const title = this.state.title;
    const hasTemplate = this.state.template;

    create({ title, hasTemplate, isTemplate }, (err) => {
      if (!err) {
        this.reset();
      }
    });
  },

  handleTitleChange(e) {
    this.setState({ title: e.target.value });
  },

  handleTemplateChange(e) {
    this.setState({ template: e.target.value });
  },

  render() {
    const {
      isOpen,
      close,
      title,
      description,
      cancelBtn,
      okBtn,
      selectLabel,
      titleLabel,
      titlePlaceholder,
      helperTexts,
      isTemplate
    } = this.props;

    const {minLengthString} = helperTexts || {};

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
            <form>
              <FormGroup
                controlId="formBasicText"
                validationState={this.getValidationState()}
              >
                <ControlLabel>{titleLabel}</ControlLabel>
                <FormControl
                  type="text"
                  value={this.state.title}
                  placeholder={titlePlaceholder}
                  onChange={this.handleTitleChange}
                />
                <FormControl.Feedback />
                {minLengthString && this.getValidationState() === 'error' ? (
                  <HelpBlock>{minLengthString}</HelpBlock>
                ) : ''}
              </FormGroup>
              { !isTemplate ? (
                <FormGroup controlId="formControlsSelect">
                  <ControlLabel>{selectLabel || 'Select'}</ControlLabel>
                  <FormControl
                    componentClass="select"
                    placeholder="select"
                    onChange={this.handleTemplateChange}
                  >
                    {this.renderSelectOptions()}
                  </FormControl>
                </FormGroup>
              ) : ''}
            </form>
          </Modal.Body>

          <Modal.Footer>
            <Button onClick={close}>{cancelBtn || 'Cancel'}</Button>
            <Button
              onClick={this.create}
              bsStyle="primary"
              disabled={this.getValidationState() !== 'success'}>{okBtn || 'OK'}</Button>
          </Modal.Footer>

        </Modal>
      </div>
    );
  }
});

export default CreateModal;
