import ContextMenu from '../components/context_menu/context_menu';
import { useDeps, composeWithTracker, composeAll } from 'mantra-core';
import bootbox from 'bootbox';

export const composer = ({ context, actions }, onData) => {
  const { Meteor, TAPi18n, LocalState, NotificationManager, SelectedCtrl } = context();
  const a = actions();

  const node = LocalState.get('SELECTED_NODE');
  const identifier = 'media';

  const menuItems = [
    {
      data: { node },
      id: 'edit-node',
      label: TAPi18n.__('context_menus.edit'),
      icon: 'glyphicon glyphicon-pencil',
      handleClick: (e, { tableName, ...data }) => {
        const { _id } = data;
        a.contextMenus.editMediaNode(_id);
      },
    },
    {
      data: { node },
      id: 'remove-node',
      label: TAPi18n.__('context_menus.remove'),
      icon: 'glyphicon glyphicon-remove',
      handleClick: (e, { tableName, ...data }) => {
        a.contextMenus.removeMediaNodeConfirmation(e, data);
      },
    },
    {
      data: { node },
      id: 'remove-nodes',
      label: TAPi18n.__('context_menus.removeSelected'),
      icon: 'glyphicon glyphicon-remove',
      handleClick: (e, { tableName }) => {
        const hasSelected = SelectedCtrl.getSelected(tableName).length;
        if (hasSelected) {
          return a.contextMenus.removeSelectedNodes(tableName);
        }
        return NotificationManager.warning(
          'Det var ingen markerte informasjonselementer i tabellen. Prøv å markere et eller flere elementer før du bruker denne funksjonen.',
          'Ingen elementer å slette'
        );
      },
    },
  ];

  onData(null, { menuItems, identifier });
};

export default composeAll(
  composeWithTracker(composer),
  useDeps(),
)(ContextMenu);
