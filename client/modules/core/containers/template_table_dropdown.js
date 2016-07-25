import DocumentTableDropdown from '../components/document_table_dropdown/document_table_dropdown';
import {useDeps, composeWithTracker, composeAll} from 'mantra-core';

export const composer = ({context}, onData) => {
  const {TAPi18n} = context();

  const items = [
    {
      func: 'createNewTemplate',
      icon: 'glyphicon glyphicon-plus',
      label: TAPi18n.__('dropdowns.template_table.create_template'),
    },
    {
      func: 'openTemplate',
      icon: 'glyphicon glyphicon-edit',
      label: TAPi18n.__('dropdowns.template_table.edit_template'),
      disabledOn: 'MANY_AND_NONE'
    },
    {
      divider: true
    },
    {
      func: 'importTemplate',
      icon: 'glyphicon glyphicon-import',
      label: TAPi18n.__('dropdowns.template_table.import_template')
    },
    {
      func: 'exportTemplate',
      icon: 'glyphicon glyphicon-export',
      label: TAPi18n.__('dropdowns.template_table.export_template'),
      disabledOn: 'NONE'
    },
    {
      divider: true
    },
    {
      func: 'removeTemplate',
      icon: 'glyphicon glyphicon-trash',
      label: TAPi18n.__('dropdowns.template_table.remove_template'),
      disabledOn: 'NONE'
    }
  ];

  const text = {
    selectAction: TAPi18n.__('dropdowns.template_table.select_action')
  };

  onData(null, {items, text});
};

export const depsMapper = (context, actions) => ({
  createNewTemplate: actions.templates.createNewTemplate,
  openTemplate: actions.templates.openTemplate,
  importTemplate: actions.templates.importTemplate,
  exportTemplate: actions.templates.exportTemplate,
  removeTemplate: actions.templates.removeTemplate,
  isDisabledOnManyAndNone: actions.templates.isDisabledOnManyAndNone,
  isDisabledOnNone: actions.templates.isDisabledOnNone,
  context: () => context
});

export default composeAll(
  composeWithTracker(composer),
  useDeps(depsMapper)
)(DocumentTableDropdown);
