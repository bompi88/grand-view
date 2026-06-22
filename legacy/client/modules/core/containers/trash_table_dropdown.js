import DocumentTableDropdown from '../components/table_dropdown/table_dropdown';
import { useDeps, composeWithTracker, composeAll } from 'mantra-core';

export const composer = ({ context }, onData) => {
  const { TAPi18n } = context();

  const items = [
    {
      func: 'restore',
      icon: 'glyphicon glyphicon-repeat',
      label: TAPi18n.__('dropdowns.trash_table.restore'),
      disabledOn: 'NONE',
    },
    {
      func: 'remove',
      icon: 'glyphicon glyphicon-trash',
      label: TAPi18n.__('dropdowns.trash_table.remove'),
      disabledOn: 'NONE',
    },
    {
      func: 'emptyTrash',
      icon: 'glyphicon glyphicon-fire',
      label: TAPi18n.__('dropdowns.trash_table.empty_trash'),
      disabledOn: 'NO_DOCS',
    },
  ];

  const text = {
    selectAction: TAPi18n.__('dropdowns.trash_table.select_action'),
  };

  onData(null, { items, text });
};

export const depsMapper = (context, actions) => ({
  remove: actions.trash.removeSelected,
  restore: actions.trash.restoreSelected,
  emptyTrash: actions.trash.emptyTrash,
  isDisabledOnNone: actions.trash.isDisabledOnNone,
  isDisabledNoDocs: actions.trash.isDisabledNoDocs,
  context: () => context,
});

export default composeAll(
  composeWithTracker(composer),
  useDeps(depsMapper),
)(DocumentTableDropdown);
