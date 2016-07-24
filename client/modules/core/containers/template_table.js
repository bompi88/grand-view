import DocumentTable from '../components/document_table/document_table';
import {useDeps, composeWithTracker, composeAll} from 'mantra-core';

export const composer = ({context, clearErrors}, onData) => {
  const {Meteor, Collections} = context();

  if (Meteor.subscribe('templates.all').ready()) {
    const documents = Collections.Documents.find({ isTemplate: true }).fetch();
    onData(null, {
      documents,
      showTemplates: false,
      showEditOptions: true
    });
  } else {
    onData(null, {});
  }

  // clearErrors when unmounting the component
  return clearErrors;
};

export const depsMapper = (context, actions) => ({
  createNewDocument: actions.templates.createNewTemplate,
  exportDocument: actions.templates.exportTemplate,
  removeDocument: actions.templates.removeTemplate,
  openDocument: actions.templates.openTemplate,
  context: () => context
});

export default composeAll(
  composeWithTracker(composer),
  useDeps(depsMapper)
)(DocumentTable);
