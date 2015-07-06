////////////////////////////////////////////////////////////////////////////////
// Documents Controller
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

"use strict";

GV.documentsCtrl = {
  createNewDoc: function() {
  $("div.tooltip").hide();
    // A confirmation prompt before removing the document
    var confirmationPrompt = {
      title: "Vennligst velg en tittel for dokumentet",
      buttons: {
        cancel: {
          label: "Avbryt"
        },
        confirm: {
          label: "Ok"
        }
      },
      callback: function(title, test) {
        if(title !== null) {
          var doc = {
            title: title || "Mitt nye dokument",
            lastChanged: new Date()
          };

          // create a new document
          var id = GV.collections.Documents.insert(doc);

          GV.documentsCtrl.goToDoc(id);
        }
      }
    };
    bootbox.prompt(confirmationPrompt);
  },

  goToDoc: function(id) {
    GV.tabs.reset();
    // redirect to the new document
    Router.go(Router.path('Document', { _id: id }));
  },

  createNewTemplate: function() {

    $("div.tooltip").hide();

    // A confirmation prompt before removing the document
    var confirmationPrompt = {
      title: "Vennligst velg en tittel for dokumentmalen",
      buttons: {
        cancel: {
          label: "Avbryt"
        },
        confirm: {
          label: "Ok"
        }
      },
      callback: function(title, test) {
        if (title !== null) {
          var doc = {
            title: title || "Min nye dokumentmal",
            lastChanged: new Date(),
            template: true
          };

          // create a new document
          var id = GV.collections.Documents.insert(doc);

          GV.documentsCtrl.goToTemplate(id);
        }
      }
    };

    bootbox.prompt(confirmationPrompt);
  },

  goToTemplate: function(id) {
    GV.tabs.reset();
    // redirect to the new document
    Router.go(Router.path('Template', {
      _id: id
    }));
  },

  softRemoveDocument: function(id, hideNotification, callback) {

    // Remove the document
    GV.collections.Documents.softRemove({
      _id: id
    }, function(error) {
      if (error) {
        Notifications.warn('Feil', error.message);
      } else {

        if (!hideNotification)
          Notifications.success('Dokument slettet', 'Dokumentet ble lagt i papirkurven');

        if(callback)
          callback();
      }
    });
  }
};
