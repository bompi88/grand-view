import React from 'react';
import { Modal, HelpBlock, FormGroup, ControlLabel, FormControl, Button } from 'react-bootstrap';

class CreateModal extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      title: '',
      template: '',
    };
  }

  renderSelectOptions() {
    const { selectOptions } = this.props;

    return selectOptions.map(option => (
      <option
        key={option.value}
        value={option.value}
      >{option.label}</option>
      ));
  }

  getValidationState() {
    const title = this.state.title;
    const length = title.length;

    if (length >= 3) {
      return 'success';
    } else if (length > 0) {
      return 'error';
    }
  }

  reset() {
    this.setState({
      title: '',
      template: '',
    });
  }

  onSubmit(e) {
    e.preventDefault();
    const { create, isTemplate } = this.props;
    const title = this.state.title;
    const hasTemplate = this.state.template;

    create({ title, hasTemplate, isTemplate }, (err) => {
      if (!err) {
        this.reset();
      }
    });
  }

  handleTitleChange(e) {
    this.setState({ title: e.target.value });
  }

  handleTemplateChange(e) {
    this.setState({ template: e.target.value });
  }

  render() {
    const {
      isOpen,
      close,
      text,
      helperTexts,
      isTemplate,
    } = this.props;

    const { minLengthString } = helperTexts || {};

    return (
      <div className="create-modal">
        <Modal show={isOpen} onHide={close.bind(this, this.reset.bind(this))}>
          <form onSubmit={this.onSubmit.bind(this)}>
            <Modal.Header closeButton>
              <Modal.Title>{text.title}</Modal.Title>
            </Modal.Header>

            <Modal.Body>
              <p>
                <em>{text.description}</em>
              </p>
              <FormGroup
                controlId="formBasicText"
                validationState={this.getValidationState()}
              >
                <ControlLabel>{text.titleLabel}</ControlLabel>
                <FormControl
                  type="text"
                  value={this.state.title}
                  placeholder={text.titlePlaceholder}
                  onChange={this.handleTitleChange.bind(this)}
                />
                <FormControl.Feedback />
                {minLengthString && this.getValidationState() === 'error' ? (
                  <HelpBlock>{minLengthString}</HelpBlock>
                ) : ''}
              </FormGroup>
              { !isTemplate ? (
                <FormGroup controlId="formControlsSelect">
                  <ControlLabel>{text.selectLabel}</ControlLabel>
                  <FormControl
                    componentClass="select"
                    placeholder="select"
                    onChange={this.handleTemplateChange.bind(this)}
                  >
                    {this.renderSelectOptions()}
                  </FormControl>
                </FormGroup>
              ) : ''}
            </Modal.Body>

            <Modal.Footer>
              <Button onClick={close.bind(this, this.reset.bind(this))}>{text.cancelBtn}</Button>
              <Button
                type="submit"
                bsStyle="primary"
                disabled={this.getValidationState() !== 'success'}
              >{text.okBtn}</Button>
            </Modal.Footer>
          </form>

        </Modal>
      </div>
    );
  }
}

CreateModal.propTypes = {
  text: React.PropTypes.shape({
    title: React.PropTypes.string.isRequired,
    description: React.PropTypes.string,
    cancelBtn: React.PropTypes.string,
    okBtn: React.PropTypes.string,
    selectLabel: React.PropTypes.string,
    titleLabel: React.PropTypes.string,
    titlePlaceholder: React.PropTypes.string,
  }),

  helperTexts: React.PropTypes.shape({
    minLength: React.PropTypes.string,
  }).isRequired,

  selectOptions: React.PropTypes.arrayOf(React.PropTypes.shape({
    value: React.PropTypes.string,
    label: React.PropTypes.string,
  })),

  isOpen: React.PropTypes.bool.isRequired,
  isTemplate: React.PropTypes.bool.isRequired,

  close: React.PropTypes.func.isRequired,
  create: React.PropTypes.func.isRequired,
};

CreateModal.defaultProps = {
  text: {
    title: 'Title',
    description: 'Description',
    cancelBtn: 'Cancel',
    okBtn: 'OK',
    selectLabel: 'Select',
    titleLabel: 'Title',
    titlePlaceholder: 'Title',
  },
};

export default CreateModal;
