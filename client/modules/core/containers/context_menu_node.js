import ContextMenu from '../components/context_menu/context_menu';
import { useDeps, composeWithTracker, composeAll } from 'mantra-core';
import bootbox from 'bootbox';

export const composer = ({ context, actions }, onData) => {
  const { Meteor, TAPi18n, LocalState, NotificationManager } = context();
  const a = actions();

  const node = LocalState.get('SELECTED_NODE');
  const identifier = 'media';

  const menuItems = [
    {
      data: { node },
      id: 'edit-node',
      label: TAPi18n.__('context_menus.edit'),
      icon: 'glyphicon glyphicon-pencil',
      handleClick: (e, data) => {
        const { _id } = data;
        a.contextMenus.editMediaNode(_id);
      },
    },
    {
      data: { node },
      id: 'remove-node',
      label: TAPi18n.__('context_menus.remove'),
      icon: 'glyphicon glyphicon-remove',
      handleClick: (e, selectedNode) => {
        const { parent } = selectedNode;
        const confirmationPrompt = {
          title: 'Bekreftelse på slettingen',
          message: 'Er du sikker på at du vil slette informasjonselementet? NB: ' +
                    'Dette vil slette alle filer og data knyttet til dette informasjonselementet',
          buttons: {
            cancel: {
              label: 'Nei',
            },
            confirm: {
              label: 'Ja',
              callback(result) {
                if (result) {
                  // Remove the media node
                  a.contextMenus.removeMediaNode(e, selectedNode);

                  // Set parent node in focus
                  Meteor.call(
                    'document.setSelectedNode',
                    LocalState.get('CURRENT_DOCUMENT'),
                    parent,
                  );
                  LocalState.set('CURRENT_NODE', parent);

                  // Show sucess message
                  NotificationManager.success(
                    'Informasjonselementet ble slettet fra systemet.',
                    'Sletting fullført',
                  );
                }
              },
            },
          },
        };
        bootbox.dialog(confirmationPrompt);
      },
    },
  ];

  onData(null, { menuItems, identifier });
};

export default composeAll(
  composeWithTracker(composer),
  useDeps(),
)(ContextMenu);
