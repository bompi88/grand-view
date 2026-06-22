// //////////////////////////////////////////////////////////////////////////////////////////////////
// Edit View Form Container
// //////////////////////////////////////////////////////////////////////////////////////////////////

import { useDeps, composeAll, compose } from 'mantra-core';
import EditRootViewForm from '../components/edit_view/edit_chapter_view_form';

const onPropsChange = ({ context }, onData) => {
  const { TAPi18n } = context();

  const text = {
    name: TAPi18n.__('edit_view.template_form.name'),
    description: TAPi18n.__('edit_view.template_form.description'),
  };

  onData(null, { text });
};

export const depsMapper = (context, actions) => ({
  setName: actions.editView.setName,
  setDescription: actions.editView.setDescription,
  context: () => context,
});

export default composeAll(
  compose(onPropsChange),
  useDeps(depsMapper),
)(EditRootViewForm);
