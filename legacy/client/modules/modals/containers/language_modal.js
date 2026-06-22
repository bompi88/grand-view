import {
  useDeps, composeWithTracker, composeAll,
} from 'mantra-core';
import LanguageModal from '../components/language_modal/language_modal';

export const composer = ({ context }, onData) => {
  const { Meteor, LocalState, TAPi18n, Collections } = context();

  const isOpen = LocalState.get('LANGUAGE_MODAL_VISIBLE') || false;

  const text = {
    title: TAPi18n.__('modals.language_modal.title'),
    description: TAPi18n.__('modals.language_modal.description'),
    saveBtn: TAPi18n.__('forms.save'),
    cancelBtn: TAPi18n.__('forms.cancel'),
    selectLabel: TAPi18n.__('modals.language_modal.select.label'),
  };

  const selectOptions = [
    {
      value: 'no-NB',
      label: TAPi18n.__('modals.language_modal.select.no-NB'),
    },
    {
      value: 'en',
      label: TAPi18n.__('modals.language_modal.select.en'),
    },
  ];

  const props = { isOpen, text, selectOptions };

  if (Meteor.subscribe('settings').ready()) {
    const { language } = Collections.Settings.findOne({ _id: 'user' });
    onData(null, { ...props, selected: language });
  } else {
    onData(null, props);
  }
};

export const depsMapper = (context, actions) => ({
  save: actions.languageModal.changeLanguage,
  close: actions.languageModal.close,
  context: () => context,
});

export default composeAll(
  composeWithTracker(composer),
  useDeps(depsMapper),
)(LanguageModal);
