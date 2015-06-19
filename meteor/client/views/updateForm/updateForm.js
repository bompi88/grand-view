////////////////////////////////////////////////////////////////////////////////
// The update form logic
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

var uploadFile = function(currentFile, self) {

  // remove file if it currently is a file in the session variable
  if(Session.get("file")) {

    var fileObj = GV.collections.Files.findOne({ _id: Session.get("file")});

    FS.HTTP.uploadQueue.pause();

    FS.HTTP.uploadQueue.cancel(fileObj);
    GV.collections.Files.remove({ _id: Session.get('file')});
  }

  Session.set("uploadStopped", false);

  // upload new file
  var file = new FS.File(currentFile);

  var meta = {
    owner: GV.helpers.userId(),
    docId: self._id,
    nodeId: self._af.doc._id,
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
};

var removeNodeCallback = function(result, options) {
  if(result) {

    deleteNode(Session.get('nodeInFocus'));

    // Set the main document in focus
    Session.set('nodeInFocus', Session.get('mainDocument'));

    Notifications.success(options.title, options.text);
  }
};

var removeFileCallback = function(result, fileObj, options) {
  if(result) {

    var node = fileObj.nodeId;
    var doc = fileObj.docId;
    var file = fileObj._id;

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
                Notifications.success(options.title, options.text);
              }
            });
          }
        });
      }
    });
  }
};

// -- Template events ----------------------------------------------------------


Template.UpdateNodeForm.events({

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
    event.stopPropagation && event.stopPropagation();

    var cp = require("child_process");

    var filename = this.copies.filesStore.key.replace(new RegExp(" ", 'g'), '\\ ');

    cp.exec("open ~/GrandView/files/" + filename, function(error, result) {
      if(error)
        console.log(error);
    });
  },

  'click .delete-file': function(event, tmpl) {
    var self = this;

    showConfirmationPrompt({
      title: "Bekreftelse på sletting av fil",
      message: UI.toHTML(Template.RemoveFileModal)
    },
      _.partial(removeFileCallback, _, this, {
        title: 'Sletting fullført',
        text: 'Filen er nå fjernet og informasjonselementet oppdatert.'
      })
    );
  },

  /**
   * Reset the form on click on cancel button
   */
  'click .upload-field': function(event, tmpl) {
    event.stopPropagation && event.stopPropagation();

    tmpl.find('input.file-upload[type="file"]').click();
  },

  // When dropping a file into upload area
  'drop .dropzone': function(event, tmpl) {
    uploadFile(event.originalEvent.dataTransfer.files[0], this);
  },

  /**
   * Reset the form on click on cancel button
   */
  'click .stop-upload': function(event, tmpl) {
    event.preventDefault && event.preventDefault();
    event.stopPropagation && event.stopPropagation();

    var fileObj = GV.collections.Files.findOne({ _id: Session.get("file")});

    FS.HTTP.uploadQueue.pause();
    Session.set("uploadStopped", true);
  },

  /**
   * Reset the form on click on cancel button
   */
  'click .resume-upload': function(event, tmpl) {
    event.preventDefault && event.preventDefault();
    event.stopPropagation && event.stopPropagation();

    var fileObj = GV.collections.Files.findOne({ _id: Session.get("file")});

    FS.HTTP.uploadQueue.resume();
    Session.set("uploadStopped", false);
  },

  'click .delete-media-node': function(event, tmpl) {
    event.preventDefault && event.preventDefault();
    event.stopPropagation && event.stopPropagation();

    showConfirmationPrompt({
      title: "Bekreftelse på sletting av informasjonselement",
      message: UI.toHTML(Template.RemoveMediaNodeModal)
    },
      _.partial(removeNodeCallback, _, {
        title: 'Sletting fullført',
        text: 'Informasjonselementet ble slettet fra systemet.'
      })
    );
  },

  'click .delete-chapter-node': function(event, tmpl) {
    event.preventDefault && event.preventDefault();
    event.stopPropagation && event.stopPropagation();

    showConfirmationPrompt({
      title: "Bekreftelse på sletting av kapittelelement",
      message: UI.toHTML(Template.RemoveChapterNodeModal)
    },
      _.partial(removeNodeCallback, _, {
        title: 'Sletting fullført',
        text: 'Kapittelelementet ble slettet fra systemet.'
      })
    );
  },

  'change .file-upload': function(event, tmpl, args) {
    event.preventDefault && event.preventDefault();
    event.stopPropagation && event.stopPropagation();

    uploadFile(event.target.files[0], this);
  }

});


// -- Template helpers ---------------------------------------------------------


Template.UpdateNodeForm.helpers({

  file: function() {
    return GV.collections.Files.findOne({ _id: Session.get("file") || this._af.doc && this._af.doc.fileId || null });
  },

  uploadStopped: function() {
    return Session.get("uploadStopped");
  },

  getTagsOptions: function() {

    var self = this;
    var r;

    if(self._af && self._af.doc && self._af.doc.tags) {
      r = _.map(self._af.doc.tags, function(val) {
        return {
          label: val,
          value: val
        };
      });
    }

    return r;
  },

  getReferencesOptions: function() {

    var self = this;
    var r;

    if(self._af && self._af.doc && self._af.doc.references) {
      r = _.map(self._af.doc.references, function(val) {
        return {
          label: val,
          value: val
        };
      });
    }

    return r;
  }

});
