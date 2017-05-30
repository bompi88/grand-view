import {
  useDeps, composeWithTracker, composeAll
} from 'mantra-core';
import CreateModal from '../components/create_modal/create_modal';

export const composer = ({context}, onData) => {
  const {Meteor, LocalState, TAPi18n, _, Collections} = context();

  const isOpen = LocalState.get('NEW_DOCUMENT_MODAL_VISIBLE') || false;

  const helperTexts = {
    minLengthString: TAPi18n.__('modals.create_modal.helperTexts.minLengthString', 3)
  };

  const text = {
    title: TAPi18n.__('modals.create_modal.title'),
    description: TAPi18n.__('modals.create_modal.description'),
    okBtn: TAPi18n.__('forms.ok'),
    cancelBtn: TAPi18n.__('forms.cancel'),
    selectLabel: TAPi18n.__('modals.create_modal.select.label'),
    titleLabel: TAPi18n.__('modals.create_modal.titleLabel'),
    titlePlaceholder: TAPi18n.__('modals.create_modal.titlePlaceholder')
  };

  let selectOptions = [
    {
      value: 'none',
      label: TAPi18n.__('modals.create_modal.select.none')
    }
  ];

  if (Meteor.subscribe('templates.all').ready()) {
    const templates = Collections.Documents.find({ isTemplate: true }).fetch();
    selectOptions = _.union(selectOptions, _.map(templates, (template) => {
      return {
        value: template._id,
        label: template.title
      };
    }));
  }

  onData(null, {
    isOpen,
    text,
    selectOptions,
    helperTexts,
    isTemplate: false
  });
};

export const depsMapper = (context, actions) => ({
  create: actions.newDocumentModal.createDocument,
  close: actions.newDocumentModal.close,
  context: () => context
});

export default composeAll(
  composeWithTracker(composer),
  useDeps(depsMapper)
)(CreateModal);
