import {
  useDeps, composeWithTracker, composeAll
} from 'mantra-core';
import CreateModal from '../components/create_modal/create_modal';

export const composer = ({context}, onData) => {
  const {Meteor, LocalState, TAPi18n, _, Collections} = context();

  const isOpen = LocalState.get('NEW_TEMPLATE_MODAL') || false;
  const title = TAPi18n.__('modals.create_modal.title');
  const description = TAPi18n.__('modals.create_modal.description');
  const okBtn = TAPi18n.__('forms.ok');
  const cancelBtn = TAPi18n.__('forms.cancel');
  const selectLabel = TAPi18n.__('modals.create_modal.select.label');
  const titleLabel = TAPi18n.__('modals.create_modal.titleLabel');
  const titlePlaceholder = TAPi18n.__('modals.create_modal.titlePlaceholder');
  const helperTexts = {
    minLengthString: TAPi18n.__('modals.create_modal.helperTexts.minLengthString', 3)
  };

  let selectOptions = [
    {
      value: 'none',
      label: TAPi18n.__('modals.create_modal.select.none')
    }
  ];

  if (Meteor.subscribe('templates.all').ready()) {
    const templates = Collections.Documents.find({ template: true }).fetch();
    selectOptions = _.union(selectOptions, _.map(templates, (template) => {
      return {
        value: template._id,
        label: template.title
      };
    }));
  }

  onData(null, {
    isOpen,
    title,
    description,
    okBtn,
    cancelBtn,
    selectOptions,
    selectLabel,
    titleLabel,
    titlePlaceholder,
    helperTexts,
    isTemplate: true
  });
};

export const depsMapper = (context, actions) => ({
  create: actions.newTemplateModal.createTemplate,
  close: actions.newTemplateModal.close,
  context: () => context
});

export default composeAll(
  composeWithTracker(composer),
  useDeps(depsMapper)
)(CreateModal);
