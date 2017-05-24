import React from 'react';
import { Field, reduxForm } from 'redux-form';
import { renderTextInput } from '../prototypes/form_prototypes';

class EditRootViewForm extends React.Component {
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
            change('title', e.target.value);
            setName(e.target.value, nodeId);
          }}
        />
        <Field
          name="description"
          component={renderTextInput}
          autoComplete="off"
          placeholder={text.description}
          label={text.description}
          rows={12}
          componentClass={React.DOM.textarea}
          onChange={(e) => {
            change('description', e.target.value);
            setDescription(e.target.value, nodeId);
          }}
        />
      </form>
    );
  }
}

export default reduxForm({
  form: 'editChapterNode',
  getFormState(state) {
    return state.form && state.form.present;
  },
  enableReinitialize: true,
  destroyOnUnmount: false
})(EditRootViewForm);
