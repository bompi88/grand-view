import DocumentTableDropdown from '../components/document_table_dropdown/document_table_dropdown';
import {useDeps, composeWithTracker, composeAll} from 'mantra-core';

export const composer = ({context}, onData) => {
  const {TAPi18n} = context();

  const items = [
    {
      func: 'createNewDocument',
      icon: 'glyphicon glyphicon-plus',
      label: TAPi18n.__('dropdowns.document_table.create_document'),
    },
    {
      func: 'openDocument',
      icon: 'glyphicon glyphicon-edit',
      label: TAPi18n.__('dropdowns.document_table.edit_document'),
      disabledOn: 'MANY_AND_NONE'
    },
    {
      divider: true
    },
    {
      func: 'importDocument',
      icon: 'glyphicon glyphicon-import',
      label: TAPi18n.__('dropdowns.document_table.import_document')
    },
    {
      func: 'exportDocument',
      icon: 'glyphicon glyphicon-export',
      label: TAPi18n.__('dropdowns.document_table.export_document'),
      disabledOn: 'NONE'
    },
    {
      divider: true
    },
    {
      func: 'removeDocument',
      icon: 'glyphicon glyphicon-trash',
      label: TAPi18n.__('dropdowns.document_table.remove_document'),
      disabledOn: 'NONE'
    }
  ];

  onData(null, {items});
};

export const depsMapper = (context, actions) => ({
  createNewDocument: actions.documents.createNewDocument,
  openDocument: actions.documents.openDocument,
  importDocument: actions.documents.exportDocument,
  exportDocument: actions.documents.exportDocument,
  removeDocument: actions.documents.removeDocument,
  isDisabledOnManyAndNone: actions.documents.isDisabledOnManyAndNone,
  isDisabledOnNone: actions.documents.isDisabledOnNone,
  context: () => context
});

export default composeAll(
  composeWithTracker(composer),
  useDeps(depsMapper)
)(DocumentTableDropdown);
