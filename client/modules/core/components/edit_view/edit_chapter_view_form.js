import React from 'react';
import PropTypes from 'prop-types';
import { Field, reduxForm } from 'redux-form';
import { renderTextInput } from '../prototypes/form_prototypes';

const EditRootViewForm = (props) => {
  const { setDescription, setName, change, nodeId, text } = props;

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
};

EditRootViewForm.propTypes = {
  text: PropTypes.PropTypes.shape({
    description: PropTypes.string,
    name: PropTypes.string,
  }),
  setDescription: PropTypes.func.isRequired,
  setName: PropTypes.func.isRequired,
  change: PropTypes.func.isRequired,
  nodeId: PropTypes.string.isRequired,
};

EditRootViewForm.defaultProps = {
  text: {
    description: 'Description',
    name: 'Name',
  },
};

export default reduxForm({
  form: 'editChapterNode',
  getFormState(state) {
    return state.form && state.form.present;
  },
  enableReinitialize: true,
  destroyOnUnmount: false,
})(EditRootViewForm);
