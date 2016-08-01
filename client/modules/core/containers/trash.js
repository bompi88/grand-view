import Trash from '../components/trash/trash';
import {useDeps, composeWithTracker, composeAll} from 'mantra-core';

export const composer = ({context, clearState}, onData) => {
  const {Meteor, Collections, LocalState, TAPi18n} = context();

  const sortDocs = LocalState.get('TABLE_SORT_TRASH_DOCUMENTS') || { title: 1 };
  const sortTemplates = LocalState.get('TABLE_SORT_TRASH_TEMPLATES') || { title: 1 };

  const text = {
    header: TAPi18n.__('trash.header'),
    title: TAPi18n.__('trash.title'),
    createdAt: TAPi18n.__('trash.created_at'),
    lastModified: TAPi18n.__('trash.last_modified'),
    isTemplatesEmpty: TAPi18n.__('trash.is_templates_empty'),
    isDocumentsEmpty: TAPi18n.__('trash.is_documents_empty'),
    remove: TAPi18n.__('trash.remove'),
    export: TAPi18n.__('trash.export'),
    by: TAPi18n.__('trash.by'),
    templateUsed: TAPi18n.__('trash.template_used'),
    docsTableHeader: TAPi18n.__('trash.documents_header'),
    templatesTableHeader: TAPi18n.__('trash.templates_header')
  };

  const props = {
    text
  };

  if (Meteor.subscribe('documents.removed').ready() &&
    Meteor.subscribe('templates.removed').ready()) {
    const docs = Collections.Documents.find({
      isTemplate: false,
      removed: true
    }, { sort: sortDocs }).fetch();

    const templates = Collections.Documents.find({
      isTemplate: true,
      removed: true
    }, { sort: sortTemplates }).fetch();


    onData(null, {
      docs,
      templates,
      ...props
    });
  } else {
    onData(null, props);
  }

  return clearState;
};

export const depsMapper = (context, actions) => ({
  toggleSelected: actions.trash.toggleSelected,
  isSelected: actions.trash.isSelected,
  selectAll: actions.trash.selectAll,
  deselectAll: actions.trash.deselectAll,
  hasAllSelected: actions.trash.hasAllSelected,
  toggleSort: actions.trash.toggleSort,
  getSort: actions.trash.getSort,
  clearState: actions.trash.clearState,
  context: () => context
});

export default composeAll(
  composeWithTracker(composer),
  useDeps(depsMapper)
)(Trash);
