// //////////////////////////////////////////////////////////////////////////////
// Context Menus Actions
// //////////////////////////////////////////////////////////////////////////////
//
// Copyright 2015 Concept
//
// Licensed under the Apache License, Version 2.0 (the 'License');
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
// http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an 'AS IS' BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
// //////////////////////////////////////////////////////////////////////////////

const actions = {

  addChapter(context, e, data) {
    const { node } = data;
    const { Helpers, Collections } = context;
    const parent = Collections.Documents.findOne({ _id: node.node });

    Helpers.insertNodeOfType(context, parent, 'chapter');
  },

  removeRootNode({ NotificationManager, TAPi18n }) {
    NotificationManager.warning(
      TAPi18n.__('notifications.context_menu_root.message'),
      TAPi18n.__('notifications.context_menu_root.title'),
    );
  },

  addSubchapter(context, e, parent) {
    const { Helpers } = context;
    Helpers.insertNodeOfType(context, parent, 'chapter');
  },

  addMediaNode(context, e, parent) {
    const { Helpers } = context;
    Helpers.insertNodeOfType(context, parent, 'media');
  },

  removeChapter(context, e, { _id, name, mainDocId }) {
    const { Helpers, bootbox, NotificationManager } = context;

    const confirmationPrompt = {
      title: 'Bekreftelse på slettingen',
      message: `Er du sikker på at du vil slette kapittelet "${name || 'Uten navn'}", sammen med alle underkapitler og informasjonselement? NB! Du kan ikke angre på dette valget.`,
      buttons: {
        cancel: {
          label: 'Nei',
        },
        confirm: {
          label: 'Ja',
          callback(result) {
            if (result) {
              // Remove the media nodes
              Helpers.removeNode(context, { _id, mainDocId });
              // Show sucess message
              NotificationManager.success(
                'Kapittelet ble slettet fra systemet.',
                'Sletting fullført',
              );
            }
          },
        },
      },
    };
    bootbox.dialog(confirmationPrompt);
  },

  duplicateChapterNode({ Meteor, LocalState }, nodeId) {
    Meteor.call('document.duplicateChapterNode', LocalState.get('CURRENT_DOCUMENT'), nodeId);
  },

  removeMediaNode(context, e, { _id, mainDocId }) {
    const { Helpers } = context;
    Helpers.removeNode(context, { _id, mainDocId });
  },

  removeMediaNodeConfirmation(context, e, node) {
    const { NotificationManager, bootbox } = context;
    const message = `Er du sikker på at du vil slette informasjonselement <b>${node.name}</b>? NB: ` +
      'Dette vil slette alle filer og data knyttet til disse informasjonselementene</br></br>';

    const confirmationPrompt = {
      title: 'Bekreftelse på slettingen',
      message,
      buttons: {
        cancel: {
          label: 'Nei',
        },
        confirm: {
          label: 'Ja',
          callback(result) {
            if (result) {
              // Remove the media nodes
              actions.removeMediaNode(context, e, node);
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

  editMediaNode({ Meteor, LocalState }, _id) {
    LocalState.set('EDIT_NODE', _id);
  },

  removeSelectedNodes(context, tableName, e) {
    const {
      NotificationManager,
      SelectedCtrl,
      Collections,
      TAPi18n,
      bootbox,
    } = context;

    const selectedIds = SelectedCtrl.getSelected(tableName);

    const nodes = Collections.Nodes.find({
      _id: {
        $in: selectedIds,
      },
    });


    let message = 'Er du sikker på at du vil slette informasjonselementene? NB: ' +
      'Dette vil slette alle filer og data knyttet til disse informasjonselementene</br></br>';

    const nodeList = nodes.map((node, i) => {
      const name = (!node.name || node.name.trim() === '') ? TAPi18n.__('no_title') : node.name;
      return `${i + 1}. ${name}`;
    });

    message += nodeList.join('</br>');
    const confirmationPrompt = {
      title: 'Bekreftelse på slettingen',
      message,
      buttons: {
        cancel: {
          label: 'Nei',
        },
        confirm: {
          label: 'Ja',
          callback(result) {
            if (result) {
              // Remove the media nodes
              nodes.forEach((node) => {
                actions.removeMediaNode(context, e, node);
              });
              SelectedCtrl.reset(tableName);
              // Show sucess message
              NotificationManager.success(
                'Informasjonselementene ble slettet fra systemet.',
                'Sletting fullført',
              );
            }
          },
        },
      },
    };
    bootbox.dialog(confirmationPrompt);
  },
};

export default actions;
