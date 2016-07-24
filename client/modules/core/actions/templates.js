////////////////////////////////////////////////////////////////////////////////
// Template Table Actions
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

  isDisabledOnManyAndNone({SelectedCtrl}, tableName) {
    return SelectedCtrl.getSelected(tableName).length !== 1;
  },

  isDisabledOnNone({SelectedCtrl}, tableName) {
    return SelectedCtrl.getSelected(tableName).length === 0;
  },

  createNewTemplate({LocalState}) {
    LocalState.set('NEW_TEMPLATE_MODAL', true);
  },

  openTemplate({LocalState, Collections}, _id) {
    const doc = Collections.Documents.findOne({_id});
    LocalState.set('CURRENT_DOCUMENT', doc);
  },

  exportTemplate({}, id, e) {
    e.stopPropagation();
    console.log(id)
    console.log("export");
  },

  removeTemplate({Meteor, NotificationManager, TAPi18n}, id, e) {
    e.stopPropagation();

    Meteor.call('documents.remove', id, (err) => {
      if (err) {
        NotificationManager.error(
          TAPi18n.__('notifications.soft_remove_template_failed.message'),
          TAPi18n.__('notifications.soft_remove_template_failed.title')
        );
      } else {
        NotificationManager.success(
          TAPi18n.__('notifications.soft_remove_template_success.message'),
          TAPi18n.__('notifications.soft_remove_template_success.title')
        );
      }
    });
  }

};
