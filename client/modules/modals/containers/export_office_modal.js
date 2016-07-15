import {
  useDeps, composeWithTracker, composeAll
} from 'mantra-core';
import ExportOfficeModal from '../components/export_office_modal/export_office_modal';

export const composer = ({context}, onData) => {
  const {LocalState, TAPi18n} = context();

  const isOpen = LocalState.get('EXPORT_OFFICE_MODAL_VISIBLE') || false;
  const title = TAPi18n.__('export_office_modal.title');
  const description = TAPi18n.__('export_office_modal.description');
  const generateBtn = TAPi18n.__('export_office_modal.generate');
  const cancelBtn = TAPi18n.__('forms.cancel');
  const selectLabel = TAPi18n.__('export_office_modal.select.default');

  const selectOptions = [
    {
      value: 'chapters',
      label: TAPi18n.__('export_office_modal.select.chapters')
    },
    {
      value: 'tags',
      label: TAPi18n.__('export_office_modal.select.tags')
    },
    {
      value: 'references',
      label: TAPi18n.__('export_office_modal.select.references')
    }
  ];

  onData(null, {isOpen, title, description, generateBtn, cancelBtn, selectOptions, selectLabel});
};

export const depsMapper = (context, actions) => ({
  generate: actions.exportOfficeModal.generate,
  close: actions.exportOfficeModal.close,
  context: () => context
});

export default composeAll(
  composeWithTracker(composer),
  useDeps(depsMapper)
)(ExportOfficeModal);
