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

  generate({Helpers, NotificationManager, TAPi18n, LocalState}, format, compact = false) {
    const _id = LocalState.get('CURRENT_DOCUMENT');

    if (_id) {
      Helpers.generateDOCX(_id, format, compact, (err) => {
        if (err) {
          NotificationManager.error(
            TAPi18n.__('notifications.generation_docx_failed.message'),
            TAPi18n.__('notifications.generation_docx_failed.title')
          );
        } else {
          LocalState.set('EXPORT_OFFICE_MODAL_VISIBLE', false);
          NotificationManager.success(
            TAPi18n.__('notifications.generation_docx_success.message'),
            TAPi18n.__('notifications.generation_docx_success.title')
          );
        }
      });
    } else {
      NotificationManager.error(
        TAPi18n.__('notifications.generation_must_open_document.message'),
        TAPi18n.__('notifications.generation_must_open_document.title')
      );
    }
  },

  close({LocalState}) {
    return LocalState.set('EXPORT_OFFICE_MODAL_VISIBLE', false);
  }
};
