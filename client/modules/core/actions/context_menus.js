////////////////////////////////////////////////////////////////////////////////
// Context Menus Actions
////////////////////////////////////////////////////////////////////////////////
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
////////////////////////////////////////////////////////////////////////////////

export default {

  addChapter(context, e, data) {
    const { node } = data;
    const { Helpers, Collections } = context;
    const parent = Collections.Documents.findOne({_id: node.node});

    Helpers.insertNodeOfType(context, parent, 'chapter');
  },

  removeRootNode({NotificationManager, TAPi18n}) {
    NotificationManager.warning(
      TAPi18n.__('notifications.context_menu_root.message'),
      TAPi18n.__('notifications.context_menu_root.title')
    );
  },

  addSubchapter(context, e, parent) {
    const { Helpers, NotificationManager, TAPi18n } = context;

    if (parent.level >= 5) {
      return NotificationManager.warning(
        TAPi18n.__('notifications.max_number_of_subchapters.message'),
        TAPi18n.__('notifications.max_number_of_subchapters.title')
      );
    }

    Helpers.insertNodeOfType(context, parent, 'chapter');
  },

  addMediaNode(context, e, parent) {
    const { Helpers } = context;
    Helpers.insertNodeOfType(context, parent, 'media');
  },

  removeChapter(context, e, { _id, mainDocId }) {
    const { Helpers } = context;
    Helpers.removeNode(context, {_id, mainDocId});
  },

  removeMediaNode(context, e, { _id, mainDocId }) {
    const { Helpers } = context;
    Helpers.removeNode(context, {_id, mainDocId});
  },

  editMediaNode({Meteor, LocalState}, _id) {
    Meteor.call('document.setSelectedNode', LocalState.get('CURRENT_DOCUMENT'), _id);
    LocalState.set('CURRENT_NODE', _id);
  },
};
