import React from 'react';
import TagsSelector from '../../containers/tags_selector';
import ReferencesSelector from '../../containers/references_selector';
import { Field, reduxForm } from 'redux-form';
import { renderTextInput } from '../prototypes/form_prototypes';

import 'react-select/dist/react-select.css';

const styles = {
  marginBottom: {
    marginBottom: '15px'
  }
};

class EditViewForm extends React.Component {
  render() {
    const { setDescription, setName, change, nodeId, text } = this.props;

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
