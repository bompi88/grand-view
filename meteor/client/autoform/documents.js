////////////////////////////////////////////////////////////////////////////////
// Autoform hooks for the Documents collection
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

AutoForm.hooks({
  "insert-doc": {
    after: {
      insert: function(error, docId, tmpl) {

        Router.current().subscribe('documentById', docId, function() {
          var doc = GV.collections.Documents.findOne({ _id: docId });

          var template = GV.collections.Documents.findOne({ _id: doc.templateBasis });

          if(template) {
            Meteor.call('deepCopyTemplate', doc, template, function() {
              Router.current().subscribe('nodesByDoc', docId);
            });
          }

        });
      }
    },
    formToDoc: function(doc) {
      doc.lastChanged = new Date();
      doc.title = doc.title ? doc.title : "Mitt nye dokument";

      return doc;
    },

    onError: function(operation, error, template) {
      Notifications.error('Feil', 'Dokumentet ble ikke lagret');
      console.log(error);
    },

    onSuccess: function(formType, result) {

      $('#template-modal').modal('hide');

      // reset the tabs
      GV.tabs.reset();

      // redirect to the new document
      Router.go(Router.path('Document', {
        _id: result
      }));

      Notifications.success(
        'Suksess',
        'Dokumentet ble opprettet og du kan redigere det umiddelbart!'
      );
    }

  },

  // Autoform hooks for the register new user form
  "update-document-form": {

    formToDoc: function(doc) {
      doc.lastChanged = new Date();

      return doc;
    },

    onError: function(operation, error, template) {
      Notifications.error('Feil', 'Dokumentet ble ikke lagret');
      console.log(error);
    }

  }

});
