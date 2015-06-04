////////////////////////////////////////////////////////////////////////////////
// Detail description of a node with edit possibilities
////////////////////////////////////////////////////////////////////////////////

/*
 * Copyright 2015 Concept
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

Session.set("file", null);
Session.set("uploadStopped", false);


// -- Template helpers ---------------------------------------------------------


Template.NodeDetail.helpers({

  node: function() {
    return GV.collections.Nodes.findOne({_id: Session.get('nodeInFocus')});
  },

  file: function() {
    return GV.collections.Files.findOne({ _id: Session.get("file") || this._af.doc && this._af.doc.fileId || null });
  },

  uploadStopped: function() {
    return Session.get("uploadStopped");
  },

  getTagsOptions: function() {

    var self = this;
    var r;

    if(self._af.doc.tags) {
      r = _.map(self._af.doc.tags, function(val) {
        return {
          label: val,
          value: val
        };
      });
    }

    return r;
  }

});


Template.GeneralInfo.helpers({

  getTagsOptions: function() {

    var self = this;
    var r;

    if(self._af.doc && self._af.doc.tags) {
      r = _.map(self._af.doc.tags, function(val) {
        return {
          label: val,
          value: val
        };
      });
    }
    return r;
  }

});


// -- Template events ----------------------------------------------------------


Template.NodeDetail.events({

  /**
   * Reset the form on click on cancel button
   */
  'click .cancel': function(event, tmpl) {
    var fileObj = GV.collections.Files.findOne({ _id: Session.get("file")});

    FS.HTTP.uploadQueue.pause();

    FS.HTTP.uploadQueue.cancel(fileObj);
    GV.collections.Files.remove({ _id: Session.get('file')});

    Session.set('file', null);
    AutoForm.resetForm("update-node-form");
  },

  'click .download': function(event, tmpl) {
    event.preventDefault && event.preventDefault();

    var cp = require("child_process");

    var filename = this.copies.filesStore.key.replace(new RegExp(" ", 'g'), '\\ ');

    cp.exec("open ~/GrandView/files/" + filename, function(error, result) {
      console.log(error);
    });
  },

  'click .delete-file': function(event, tmpl) {
    var self = this;
    // A confirmation prompt before removing the document
    var confirmationPrompt = {
      title: "Bekreftelse på slettingen",
      message: 'Er du sikker på at du vil slette filen? Det er ingen vei tilbake etter dette...',
      buttons: {
        cancel: {
          label: "Nei"
        },
        confirm: {
          label: "Ja",
          callback: function(result) {
            if(result) {
              console.log(self)

              var node = self.nodeId;
              var doc = self.docId;
              var file = self._id;

              // Remove the file
              GV.collections.Files.remove({_id: file}, function(error) {
                if(error) {
                  Notifications.warn('Feil', error.message);
                } else {

                  // Remove the reference in Node
                  GV.collections.Nodes.update({ _id: node}, { $set: { fileId: null }}, {}, function(error) {
                    if(error)
                      Notifications.warn('Feil', error.message);
                    else {

                      // remove the reference in main document
                      GV.collections.Documents.update({ _id: doc}, { $pull: { fileIds: file }}, {}, function(error) {
                        if(error)
                          Notifications.warn('Feil', error.message);
                        else {
                          Notifications.success('Sletting fullført', 'Filen er nå fjernet og referansen oppdatert.');
                        }
                      });
                    }
                  });
                }
              });
            }
          }
        }
      }
    }
    bootbox.dialog(confirmationPrompt);
  },

  /**
   * Reset the form on click on cancel button
   */
  'click .upload-field': function(event, tmpl) {
    tmpl.find('input[type="file"]').click();
  },

  /**
   * Reset the form on click on cancel button
   */
  'click .stop-upload': function(event, tmpl) {
    var fileObj = GV.collections.Files.findOne({ _id: Session.get("file")});

    FS.HTTP.uploadQueue.pause();
    Session.set("uploadStopped", true);
  },

  /**
   * Reset the form on click on cancel button
   */
  'click .resume-upload': function(event, tmpl) {
    var fileObj = GV.collections.Files.findOne({ _id: Session.get("file")});

    FS.HTTP.uploadQueue.resume();
    Session.set("uploadStopped", false);
  },

  'click .delete-reference': function(event, tmpl) {
    // A confirmation prompt before removing the document
    var confirmationPrompt = {
      title: "Bekreftelse på slettingen",
      message: 'Er du sikker på at du vil slette referansen? NB: Vil slette alle underkategorier til referansen!',
      buttons: {
        cancel: {
          label: "Nei"
        },
        confirm: {
          label: "Ja",
          callback: function(result) {
            if(result) {

              deleteNode(Session.get('nodeInFocus'));

              // Set the main document in focus
              Session.set('nodeInFocus', Session.get('mainDocument'));

              Notifications.success('Sletting fullført', 'Referansen ble slettet fra systemet.');
            }
          }
        }
      }
    }
    bootbox.dialog(confirmationPrompt);
  },

  'change .file-upload': function(event, tmpl, args) {
    var self = this;

    // remove file if it currently is a file in the session variable
    if(Session.get("file")) {

      var fileObj = GV.collections.Files.findOne({ _id: Session.get("file")});

      FS.HTTP.uploadQueue.pause();

      FS.HTTP.uploadQueue.cancel(fileObj);
      GV.collections.Files.remove({ _id: Session.get('file')});
    }

    Session.set("uploadStopped", false);
    // upload new file
    var file = new FS.File(event.target.files[0]);

    var meta = {
      owner: GV.helpers.userId(),
      docId: this._id,
      nodeId: this._af.doc._id,
      path: file.path
    };

    FS.Utility.extend(file, meta);

    GV.collections.Files.insert(file, function (err, fileObj) {

      var fileId = fileObj._id;

      //Inserted new doc with ID fileObj._id, and kicked off the data upload using HTTP
      Session.set("file", fileId);
      Router.current().subscribe('fileById', fileObj._id);
      GV.collections.Nodes.update({ _id: self._af.doc._id }, { $set: { fileId: fileId }});
      GV.collections.Documents.update({ _id: self._id }, { $addToSet: { fileIds: fileId }});
    });
  }

});


Template.GeneralInfo.events({

'click .delete-document': function(event, tmpl) {
  var self = this;
    // A confirmation prompt before removing the document
    var confirmationPrompt = {
      title: "Bekreftelse på slettingen",
      message: 'Er du sikker på at du vil slette <b><em>hele</em></b> dokumentet?',
      buttons: {
        cancel: {
          label: "Nei"
        },
        confirm: {
          label: "Ja",
          callback: function(result) {
            if(result) {
              // Remove the document
              GV.collections.Documents.remove({_id: self._id}, function(error) {
                if(error) {
                  Notifications.warn('Feil', error.message);
                } else {
                  // Remove all the children nodes that rely on the document
                  Meteor.call('removeNodes', self.children);

                  // Notify the user
                  Notifications.success('Sletting fullført', 'Dokument sammen med alle referanser er nå slettet.');
                  Router.go('Dashboard');
                }
              });
            }
          }
        }
      }
    }
    bootbox.dialog(confirmationPrompt);
  }

});
