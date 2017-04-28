////////////////////////////////////////////////////////////////////////////////
// Options dropdown Actions
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

  toggleMediaNodes({LocalState}) {
    const showMediaNodes = LocalState.get('MEDIA_NODES_VISIBLE') || false;

    return LocalState.set('MEDIA_NODES_VISIBLE', !showMediaNodes);
  },

  createNewChapter(context) {
    const {Helpers, Collections, LocalState} = context;
    const _id = LocalState.get('CURRENT_DOCUMENT');
    const parent = Collections.Documents.findOne({_id});

    Helpers.insertNodeOfType(context, parent, 'chapter');
  },

  expandNodes({ Meteor, LocalState }) {
    const docId = LocalState.get('CURRENT_DOCUMENT');
    Meteor.call('expandAll', docId);
  },

  collapseNodes({ Meteor, LocalState }) {
    const docId = LocalState.get('CURRENT_DOCUMENT');
    Meteor.call('collapseAll', docId);
  },

  generateDOCX({LocalState}) {
    LocalState.set('EXPORT_OFFICE_MODAL_VISIBLE', true);
  },

  exportToFile(context) {
    const {Helpers, LocalState} = context;
    const id = LocalState.get('CURRENT_DOCUMENT');
    Helpers.exportDocument(context, id);
  },

  makeTemplate({ Meteor, LocalState, NotificationManager, TAPi18n }) {
    const mainDocId = LocalState.get('CURRENT_DOCUMENT');
    Meteor.call('document.makeTemplate', mainDocId, () => {
      NotificationManager.success(
        TAPi18n.__('notifications.make_template_success.message'),
        TAPi18n.__('notifications.make_template_success.title')
      );
    });
  },

  openHelpModal({}) {
    console.log('Open help modal');
  }

};
