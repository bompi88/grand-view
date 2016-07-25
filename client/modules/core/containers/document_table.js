import DocumentTable from '../components/document_table/document_table';
import {useDeps, composeWithTracker, composeAll} from 'mantra-core';

export const composer = ({context, clearState}, onData) => {
  const {Meteor, Collections, LocalState, TAPi18n} = context();

  const tableName = 'documents';
  const sort = LocalState.get('TABLE_SORT') || { title: 1 };

  const text = {
    header: TAPi18n.__('document_table.header'),
    title: TAPi18n.__('document_table.title'),
    createdAt: TAPi18n.__('document_table.created_at'),
    lastModified: TAPi18n.__('document_table.last_modified'),
    isEmpty: TAPi18n.__('document_table.is_empty'),
    remove: TAPi18n.__('document_table.remove'),
    export: TAPi18n.__('document_table.export'),
    by: TAPi18n.__('document_table.by'),
    templateUsed: TAPi18n.__('document_table.template_used')
  };

  const props = {
    tableName,
    text,
    showTemplates: true,
    showEditOptions: true
  };

  if (Meteor.subscribe('documents.all').ready() && Meteor.subscribe('templates.all').ready()) {
    const documents = Collections.Documents.find({
      isTemplate: false
    }, { sort }).fetch();

    onData(null, {
      documents,
      ...props
    });
  } else {
    onData(null, props);
  }

  return clearState;
};

export const depsMapper = (context, actions) => ({
  createNewDocument: actions.documents.createNewDocument,
  exportDocument: actions.documents.exportDocument,
  removeDocument: actions.documents.removeDocument,
  openDocument: actions.documents.openDocument,
  getTemplateTitle: actions.documents.getTemplateTitle,
  toggleSelected: actions.documents.toggleSelected,
  isSelected: actions.documents.isSelected,
  selectAll: actions.documents.selectAll,
  deselectAll: actions.documents.deselectAll,
  hasAllSelected: actions.documents.hasAllSelected,
  toggleSort: actions.documents.toggleSort,
  getSort: actions.documents.getSort,
  clearState: actions.documents.clearState,
  context: () => context
});

export default composeAll(
  composeWithTracker(composer),
  useDeps(depsMapper)
)(DocumentTable);
