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

  create({Documents, bootbox, $}, promptTitle, docTitle, callback, template = false) {
    $('div.tooltip').hide();
    // TODO: use the helper?
    // A confirmation prompt before removing the document
    const confirmationPrompt = {
      title: promptTitle,
      buttons: {
        cancel: {
          label: 'Avbryt'
        },
        confirm: {
          label: 'Ok'
        }
      },
      callback(title) {
        if (title !== null) {
          const doc = {
            title: title || docTitle,
            lastChanged: new Date(),
            template
          };

          // create a new document
          const id = Documents.insert(doc);

          return callback(id);
        }
      }
    };
    bootbox.prompt(confirmationPrompt);
  },

  createNewDocument() {
    this.create(
      'Vennligst velg en tittel for dokumentet',
      'Mitt nye dokument',
      this.goToDocument
    );
  },

  createNewTemplate() {
    this.create(
      'Vennligst velg en tittel for dokumentmalen',
      'Min nye dokumentmal',
      this.goToTemplate,
      true
    );
  },

  goto({FlowRouter}, id, template = false) {
    const route = template ? 'Template' : 'Document';
    // TODO: fix tabs
    // GV.tabs.reset();
    FlowRouter.go(FlowRouter.path(route, { _id: id }));
  },

  goToDocument({}, id) {
    this.goto(id);
  },

  goToTemplate({}, id) {
    this.goto(id, true);
  },

  softRemove({Helpers, Documents, Notifications}, id, hideNotification, callback) {

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

        // TODO: set local state?
        Session.set('mainDocument', null);

        return callback && callback();
      }
    });
  }
};
