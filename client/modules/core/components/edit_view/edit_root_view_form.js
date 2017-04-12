import React from 'react';
import { Field, reduxForm } from 'redux-form';
import { renderTextInput } from '../prototypes/form_prototypes';

class EditRootViewForm extends React.Component {
  render() {
    const { setDescription, setTitle, change, nodeId, text } = this.props;

    return (
      <form>
        <Field
          name="title"
          component={renderTextInput}
          type="text"
          autoComplete="off"
          placeholder={text.title}
          label={text.title}
          onChange={(e) => {
            change('title', e.target.value);
            setTitle(e.target.value, nodeId);
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
      </form>
    );
  }
}

export default reduxForm({
  form: 'editRootNode',
  getFormState(state) {
    return state.form && state.form.present;
  },
  enableReinitialize: true,
  destroyOnUnmount: false
})(EditRootViewForm);
