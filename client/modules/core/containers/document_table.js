import DocumentTable from '../components/document_table/document_table';
import {useDeps, composeWithTracker, composeAll} from 'mantra-core';

export const composer = ({context, clearErrors}, onData) => {
  const {Meteor, Collections} = context();

  if (Meteor.subscribe('documents.all').ready()) {
    const documents = Collections.Documents.find({ isTemplate: false }).fetch();

    if (Meteor.subscribe('templates.all').ready()) {
      onData(null, {
        documents,
        showTemplates: true,
        showEditOptions: true
      });
    } else {
      onData(null, {});
    }
  } else {
    onData(null, {});
  }

  // clearErrors when unmounting the component
  return clearErrors;
};

export const depsMapper = (context, actions) => ({
  createNewDocument: actions.documents.createNewDocument,
  exportDocument: actions.documents.exportDocument,
  removeDocument: actions.documents.removeDocument,
  openDocument: actions.documents.openDocument,
  getTemplateTitle: actions.documents.getTemplateTitle,
  context: () => context
});

export default composeAll(
  composeWithTracker(composer),
  useDeps(depsMapper)
)(DocumentTable);
