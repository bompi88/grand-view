// //////////////////////////////////////////////////////////////////////////////////////////////////
// Edit View Form Container
// //////////////////////////////////////////////////////////////////////////////////////////////////

import { useDeps, composeAll, compose } from 'mantra-core';
import EditRootViewForm from '../components/edit_view/edit_root_view_form';

const onPropsChange = ({ context }, onData) => {
  const { TAPi18n } = context();

  const text = {
    title: TAPi18n.__('edit_view.root_form.title'),
    description: TAPi18n.__('edit_view.root_form.description'),
  };

  onData(null, { text });
};

export const depsMapper = (context, actions) => ({
  setTitle: actions.editView.setTitle,
  setDescription: actions.editView.setRootDescription,
  context: () => context,
});

export default composeAll(
  compose(onPropsChange),
  useDeps(depsMapper),
)(EditRootViewForm);
