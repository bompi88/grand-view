////////////////////////////////////////////////////////////////////////////////
// Index Actions
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

  createDocument({Meteor, LocalState, NotificationManager, TAPi18n, FlowRouter}, doc, cb) {
    Meteor.call('documents.create', doc, (err, _id) => {
      if (err) {
        NotificationManager.error(
          TAPi18n.__('notifications.create_document_failed.message'),
          TAPi18n.__('notifications.create_document_failed.title')
        );
      } else {
        LocalState.set('NEW_DOCUMENT_MODAL_VISIBLE', false);
        NotificationManager.success(
          TAPi18n.__('notifications.create_document_success.message'),
          TAPi18n.__('notifications.create_document_success.title')
        );
        LocalState.set('CURRENT_DOCUMENT', _id);
        FlowRouter.go('WorkArea', {_id});
      }
      if (cb) {
        return cb(err);
      }
    });
  },

  close({LocalState}, reset) {
    reset();
    return LocalState.set('NEW_DOCUMENT_MODAL_VISIBLE', false);
  }
};
