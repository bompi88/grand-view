import ContextMenu from '../components/context_menu/context_menu';
import {useDeps, composeWithTracker, composeAll} from 'mantra-core';

export const composer = ({context, actions}, onData) => {
  const {TAPi18n, LocalState} = context();
  const a = actions();

  const showNodes = LocalState.get('MEDIA_NODES_VISIBLE');
  const identifier = 'chapter';

  const menuItems = [
    {
      id: 'add-subchapter',
      label: TAPi18n.__('context_menus.add_subchapter'),
      icon: 'glyphicon glyphicon-plus',
      handleClick: a.contextMenus.addSubchapter
    },
    {
      id: 'rename-chapter',
      label: TAPi18n.__('context_menus.rename'),
      icon: 'glyphicon glyphicon-pencil',
      handleClick: (e, data) => {
        const { _id } = data;
        a.node.renameNode(_id);
      }
    },
    {
      id: 'remove-chapter',
      label: TAPi18n.__('context_menus.remove'),
      icon: 'glyphicon glyphicon-remove',
      handleClick: a.contextMenus.removeChapter
    }
  ];

  if (showNodes) {
    menuItems.splice(1, 0, {
      id: 'add-node',
      label: TAPi18n.__('context_menus.add_media_node'),
      icon: 'glyphicon glyphicon-plus',
      handleClick: a.contextMenus.addMediaNode
    });
  }

  onData(null, {menuItems, identifier});
};

export default composeAll(
  composeWithTracker(composer),
  useDeps()
)(ContextMenu);
