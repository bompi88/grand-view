////////////////////////////////////////////////////////////////////////////////
// Document Actions
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

  createNewTemplate({Helpers}) {
    Helpers.createNewDocument(
      'Vennligst velg en tittel for dokumentmalen',
      'Min nye dokumentmal',
      Helpers.goToTemplate,
      true
    );
  },

  softRemove({LocalState, Helpers, Documents, Notifications}, id, hideNotification, callback) {

    const isTemplate = Helpers.isTemplate(id);

    // Remove the document
    Documents.softRemove({
      _id: id
    }, (error) => {
      if (error) {
        Notifications.warn('Feil', error.message);
      } else {

        if (!hideNotification) {
          if (isTemplate) {
            Notifications.success('Sletting fullført', 'Malen ble lagt i papirkurven');
          } else {
            Notifications.success('Sletting fullført', 'Dokumentet ble lagt i papirkurven');
          }
        }

        LocalState.set('mainDocument', null);

        return callback && callback();
      }
    });
  }
};
