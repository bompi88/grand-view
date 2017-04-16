import React from 'react';
import TagsSelector from '../../containers/tags_selector';
import ReferencesSelector from '../../containers/references_selector';
import { Field, reduxForm } from 'redux-form';
import { renderTextInput } from '../prototypes/form_prototypes';
import Dropzone from '../../containers/dropzone';
import MagnificPopup from '../../containers/magnific_popup';

import 'react-select/dist/react-select.css';

const styles = {
  marginBottom: {
    marginBottom: '15px'
  }
};

class EditViewForm extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      showDialog: false,
      file: {}
    };
  }

  handleShowDialog(file) {
    this.setState({
      showDialog: true,
      file
    });
  }

  handleHideDialog() {
    this.setState({
      showDialog: false
    });
  }

  renderFile(file) {
    const { Collections } = this.props.context();
    return (
      <div>
        {file.isImage ? (
          <img
            src={Collections.Files.link(file)}
            height="100"
            onClick={this.handleShowDialog.bind(this, file)}
          />
        ) : (
          <img
            src="/images/placeholder-icon.png"
            height="100"
            onClick={this.handleShowDialog.bind(this, file)}
          />
        )}
      </div>
    );
  }

  renderFiles(files) {
    return files.map((file) => {
      return this.renderFile(file);
    });
  }

  renderMagnificPopup(file) {
    const { context } = this.props;
    const { Collections } = context();
    let type = 'inline';

    if (file.isImage) {
      type = 'image';
    }
    if (file.isPDF) {
      type = 'iframe';
    }

    return (
      <div>

          <MagnificPopup
            open={this.state.showDialog}
            onClose={this.handleHideDialog.bind(this)}
            src={Collections.Files.link(file)}
            type={type}
          />

      </div>
    );
  }

  render() {
    const { setDescription, setName, change, nodeId, text, files } = this.props;

    const file = this.state.file;

    return (
      <form>
        <Field
          name="name"
          component={renderTextInput}
          type="text"
          autoComplete="off"
          placeholder={text.name}
          label={text.name}
          onChange={(e) => {
            change('name', e.target.value);
            setName(e.target.value, nodeId);
          }}
        />
        <Field
          name="description"
          component={renderTextInput}
          autoComplete="off"
          placeholder={text.description}
          label={text.description}
          rows={6}
          componentClass={React.DOM.textarea}
          onChange={(e) => {
            change('description', e.target.value);
            setDescription(e.target.value, nodeId);
          }}
        />
        <Field
          name="tags"
          component={TagsSelector}
          multi={true}
          label={text.tagsPlaceholder}
          placeholder={text.tagsLabel}
          style={styles.marginBottom}
          nodeId={nodeId}
          promptTextCreator={(i) => { return text.createTag + ' \"' + i + '\"'; }}
          removeText={text.removeItem}
          noResultsText={text.noResultsText}
        />
        <Field
          name="references"
          component={ReferencesSelector}
          multi={true}
          label={text.referencesPlaceholder}
          placeholder={text.referencesLabel}
          style={styles.marginBottom}
          nodeId={nodeId}
          promptTextCreator={(i) => { return text.createReference + ' \"' + i + '\"'; }}
          removeText={text.removeItem}
          noResultsText={text.noResultsText}
        />
      <label>{text.attachments}</label>
      <Dropzone />
      { files ? this.renderFiles(files) : null }
      { file ? this.renderMagnificPopup(file) : null }
      </form>
    );
  }
}

export default reduxForm({
  form: 'editNode',
  getFormState(state) {
    return state.form && state.form.present;
  },
  enableReinitialize: true,
  destroyOnUnmount: false
})(EditViewForm);
