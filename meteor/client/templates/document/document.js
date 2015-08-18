////////////////////////////////////////////////////////////////////////////////
// Document Template Logic
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

Session.set("mode", "easy");

Template.Document.rendered = function() {
  $('body').on('paste', function(event) {
    var items = (event.clipboardData || event.originalEvent.clipboardData).items;
    var item = null;

    for( var i = 0; i < items.length; i++) {
      if(items[i].kind === 'file') {
        if(!item) {
          item = items[i];
        } else {
          if(items[i].type.split('/') === 'image') {
            item = items[i];
          }
        }
      }
    }
    // if it is a file upload it, else do the regular paste routine decided by browser
    if (item) {
      var mediaNodeInFocus = GV.collections.Nodes.findOne({
        _id: {
          $in: [Session.get("inlineEditNode"), Session.get("nodeInFocus")]
        },
        nodeType: "media"
      });

      if (mediaNodeInFocus) {
        var blob = item.getAsFile();
        var file = new FS.File(blob);

        GV.collections.Files.insert(file, function(err, fileObj) {
          if (err) {
            console.log(err);
          }

          fileObj.name("fil-" + moment().format('MM-DD-YYYY'));

          Router.current().subscribe("fileById", fileObj._id);

          GV.collections.Nodes.update({
            _id: mediaNodeInFocus._id
          }, {
            $set: {
              fileId: fileObj._id
            }
          });

          Notifications.success("Fil limt inn", "Filen ble limt inn og lastet inn i programmet.");
        });
      } else {
        Notifications.warn(
          "Kunne ikke lime inn fil",
          "Man kan bare lime inn fil når man er i redigeringsmodus for et bestemt informasjonselement"
        );
      }
    }
  });
};


// -- Template event -----------------------------------------------------------


Template.Document.events({

  'click .back-to-dashboard': function() {
    Router.go('Documents');
  },

  'click .show-tree': function(event, tmpl) {
    event.preventDefault();

    Session.set("structureState", "tree");
  },

  'click .show-tags': function(event, tmpl) {
    event.preventDefault();

    Session.set("structureState", "tags");
  },

  'click .show-references': function(event, tmpl) {
    event.preventDefault();

    Session.set("structureState", "references");
  },

  'click .easy-mode': function(event, tmpl) {
    Session.set("mode", "easy");
  },

  'click .advanced-mode': function(event, tmpl) {
    Session.set("mode", "advanced");
  },

  'click .redo-btn': function(event, tmpl) {
    event.preventDefault();
    event.stopPropagation();

    document.execCommand('redo', false, null);

  },

  'click .undo-btn': function(event, tmpl) {
    event.preventDefault();
    event.stopPropagation();

    document.execCommand('undo', false, null);
  }

});


// -- Template helpers ---------------------------------------------------------


Template.Document.helpers({

  focusOnMainDoc: function() {
    return Session.get('nodeInFocus') === Session.get('mainDocument');
  },

  getDoc: function() {
    return Router.current && Router.current() && Router.current().data && Router.current().data();
  }

});
