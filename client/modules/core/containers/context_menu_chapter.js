import ContextMenu from '../components/context_menu/context_menu';
import { useDeps, composeWithTracker, composeAll } from 'mantra-core';

export const composer = ({ context, actions }, onData) => {
  const { TAPi18n } = context();
  const a = actions();

  const identifier = 'chapter';

  const menuItems = [
    {
      id: 'add-subchapter',
      label: TAPi18n.__('context_menus.add_subchapter'),
      icon: 'glyphicon glyphicon-plus',
      handleClick: a.contextMenus.addSubchapter,
    },
    {
      id: 'rename-chapter',
      label: TAPi18n.__('context_menus.rename'),
      icon: 'glyphicon glyphicon-pencil',
      handleClick: (e, data) => {
        const { _id } = data;
        a.node.renameNode(_id);
      },
    },
    {
      id: 'remove-chapter',
      label: TAPi18n.__('context_menus.remove'),
      icon: 'glyphicon glyphicon-remove',
      handleClick: a.contextMenus.removeChapter,
    },
  ];

  onData(null, { menuItems, identifier });
};

export default composeAll(
  composeWithTracker(composer),
  useDeps(),
)(ContextMenu);
