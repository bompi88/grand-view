import {
  useDeps, composeWithTracker, composeAll
} from 'mantra-core';
import CreateModal from '../components/create_modal/create_modal';

export const composer = ({context}, onData) => {
  const {LocalState, TAPi18n} = context();

  const isOpen = LocalState.get('CREATE_MODAL_VISIBLE') || false;
  const title = TAPi18n.__('create_modal.title');
  const description = TAPi18n.__('create_modal.description');
  const okBtn = TAPi18n.__('forms.ok');
  const cancelBtn = TAPi18n.__('forms.cancel');

  onData(null, {isOpen, title, description, okBtn, cancelBtn});
};

export const depsMapper = (context, actions) => ({
  create: actions.createModal.createDocument,
  close: actions.createModal.close,
  context: () => context
});

export default composeAll(
  composeWithTracker(composer),
  useDeps(depsMapper)
)(CreateModal);
