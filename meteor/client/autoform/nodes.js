////////////////////////////////////////////////////////////////////////////////
// Autoform hooks for the Nodes collection
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

  // Autoform hooks for update node form
  "update-node-form": {

    formToDoc: function(doc) {
      doc.lastChanged = new Date();

      return doc;
    },

    onError: function(operation, error, template) {
      Notifications.error('Feil', 'Elementet ble ikke lagret');
      console.log(error);
    },

    onSuccess: function(result) {
      // set new lastChanged date on the root document
      var allDocs = GV.collections.Documents.find({
        children: this.docId
      }).fetch();

      allDocs.forEach(function(doc) {
        GV.collections.Documents.update({
          _id: doc._id
        }, {
          $set: {
            lastChanged: new Date()
          }
        });
      });
      Session.set("inlineEditNode", null);
      Session.set("formDirty", false);
      Notifications.success('Suksess', 'Elementet ble oppdatert!');
    }

  }

});
