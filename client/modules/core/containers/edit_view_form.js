////////////////////////////////////////////////////////////////////////////////////////////////////
// Edit View Form Container
////////////////////////////////////////////////////////////////////////////////////////////////////

import {useDeps, composeAll, composeWithTracker} from 'mantra-core';
import EditViewForm from '../components/edit_view/edit_view_form';

const onPropsChange = ({ context }, onData) => {
  const { TAPi18n, Meteor, Collections, LocalState } = context();
  const nodeId = LocalState.get('EDIT_NODE');

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
    noResultsText: TAPi18n.__('edit_view.form.noResultsText'),
    attachments: TAPi18n.__('edit_view.form.attachmentsLabel')
  };

  if (Meteor.subscribe('files.byNode').ready()) {
    const files = Collections.Files.find({ 'meta.nodeId': nodeId }).fetch();
    return onData(null, { text, files });
  }

  onData(null, { text });
};

export const depsMapper = (context, actions) => ({
  setName: actions.editView.setName,
  setDescription: actions.editView.setDescription,
  context: () => context
});

export default composeAll(
  composeWithTracker(onPropsChange),
  useDeps(depsMapper)
)(EditViewForm);
