////////////////////////////////////////////////////////////////////////////////////////////////////
// Edit View Form Container
////////////////////////////////////////////////////////////////////////////////////////////////////

import {useDeps, composeAll, compose} from 'mantra-core';
import EditViewForm from '../components/edit_view/edit_view_form';

const onPropsChange = ({ context }, onData) => {
  const { TAPi18n } = context();

  const text = {
    tagsPlaceholder: TAPi18n.__('edit_view.form.tagsPlaceholder'),
    tagsLabel: TAPi18n.__('edit_view.form.tagsLabel'),
    referencesPlaceholder: TAPi18n.__('edit_view.form.referencesPlaceholder'),
    referencesLabel: TAPi18n.__('edit_view.form.referencesLabel'),
    name: TAPi18n.__('edit_view.form.name'),
    description: TAPi18n.__('edit_view.form.description'),
    createTag: TAPi18n.__('edit_view.form.createTag'),
    createReference: TAPi18n.__('edit_view.form.createReference'),
    removeItem: TAPi18n.__('edit_view.form.removeItem'),
    noResultsText: TAPi18n.__('edit_view.form.noResultsText')
  };

  onData(null, { text });
};

export const depsMapper = (context, actions) => ({
  setName: actions.editView.setName,
  setDescription: actions.editView.setDescription,
  context: () => context
});

export default composeAll(
  compose(onPropsChange),
  useDeps(depsMapper)
)(EditViewForm);
