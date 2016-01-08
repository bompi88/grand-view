////////////////////////////////////////////////////////////////////////////////
// Update Node Form Logic
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

var path = require('path');

Session.set("file", null);
Session.set("uploadStopped", false);

var uploadFile = function(currentFile, self) {

  // remove file if it currently is a file in the session variable
  if (Session.get("file")) {

    var fileObj = GV.collections.Files.findOne({
      _id: Session.get("file")
    });

    FS.HTTP.uploadQueue.pause();

    FS.HTTP.uploadQueue.cancel(fileObj);
    GV.collections.Files.remove({
      _id: Session.get('file')
    });
  }

  Session.set("uploadStopped", false);

  // upload new file
  var file = new FS.File(currentFile);
  var meta = {
    docId: Session.get('mainDocument'),
    nodeId: self.node._id,
    path: file.path
  };

  FS.Utility.extend(file, meta);

  GV.collections.Files.insert(file, function(err, fileObj) {

    var fileId = fileObj._id;

    //Inserted new doc with ID fileObj._id, and kicked off the data upload using HTTP
    Session.set("file", fileId);
    Router.current().subscribe('fileById', fileObj._id);
    GV.collections.Nodes.update({
      _id: self.node._id
    }, {
      $set: {
        fileId: fileId
      }
    });
    GV.collections.Documents.update({
      _id: Session.get('mainDocument')
    }, {
      $addToSet: {
        fileIds: fileId
      }
    });
  });
};


// -- Template events ----------------------------------------------------------

Template.UpdateChapterNode.events({

  'click .cancel': function(event, tmpl) {
    AutoForm.resetForm("update-node-form");
  },

  'click .delete-chapter-node': function(event, tmpl) {
    event.preventDefault();
    event.stopPropagation();

    GV.helpers.showConfirmationPrompt({
        title: "Bekreftelse på sletting av kapittelelement",
        message: Blaze.toHTML(Template.RemoveChapterNodeModal)
      },
      _.partial(GV.nodeCtrl.removeNodeCallback, _, {
        title: 'Sletting fullført',
        text: 'Kapittelelementet ble slettet fra systemet.'
      })
    );
  }

});

Template.UpdateMediaNode.events({
  /**
   * Reset the form on click on cancel button
   */
  'click .cancel': function(event, tmpl) {
    var fileObj = GV.collections.Files.findOne({
      _id: Session.get("file")
    });

    FS.HTTP.uploadQueue.pause();

    FS.HTTP.uploadQueue.cancel(fileObj);
    GV.collections.Files.remove({
      _id: Session.get('file')
    });

    Session.set('file', null);
    AutoForm.resetForm("update-node-form");
  },

  'click .download': function(event, tmpl) {
    event.preventDefault();
    event.stopPropagation();

    var fileName = this.copies.filesStore.key.replace(new RegExp(" ", 'g'), '\\ ');

    var filePath = path.join(GV.basePath, "files", fileName);

    GV.helpers.openFile(filePath, function(error, result) {
        if(error)
          console.log(error);
    });
  },

  'click .delete-file': function(event, tmpl) {

    GV.helpers.showConfirmationPrompt({
        title: "Bekreftelse på sletting av fil",
        message: Blaze.toHTML(Template.RemoveFileModal)
      },
      _.partial(GV.nodeCtrl.removeFileCallback, _, this, {
        title: 'Sletting fullført',
        text: 'Filen er nå fjernet og informasjonselementet oppdatert.'
      })
    );
  },

  /**
   * Reset the form on click on cancel button
   */
  'click .upload-field': function(event, tmpl) {
    event.stopPropagation();

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
    event.preventDefault();
    event.stopPropagation();

    FS.HTTP.uploadQueue.pause();
    Session.set("uploadStopped", true);
  },

  /**
   * Reset the form on click on cancel button
   */
  'click .resume-upload': function(event, tmpl) {
    event.preventDefault();
    event.stopPropagation();

    FS.HTTP.uploadQueue.resume();
    Session.set("uploadStopped", false);
  },

  'click .delete-media-node': function(event, tmpl) {
    event.preventDefault();
    event.stopPropagation();

    GV.helpers.showConfirmationPrompt({
        title: "Bekreftelse på sletting av informasjonselement",
        message: Blaze.toHTML(Template.RemoveMediaNodeModal)
      },
      _.partial(GV.nodeCtrl.removeNodeCallback, _, {
        title: 'Sletting fullført',
        text: 'Informasjonselementet ble slettet fra systemet.'
      })
    );
  },

  'change .file-upload': function(event, tmpl, args) {
    event.preventDefault();
    event.stopPropagation();

    uploadFile(event.target.files[0], this);
  }
});


// -- Template Onrendered-------------------------------------------------------


Template.UpdateMediaNode.onRendered(function() {
  Meteor.subscribe("fileById", Session.get("file") || this.node && this.node.fileId || null);
});


// -- Template helpers ---------------------------------------------------------


Template.UpdateMediaNode.helpers({

  file: function() {
    return GV.collections.Files.findOne({
      _id: Session.get("file") || this.node && this.node.fileId || null
    });
  },

  uploadStopped: function() {
    return Session.get("uploadStopped");
  },

  getTagsOptions: function() {

    var self = this;
    var r;

    if (self._af && self.node && self.node.tags) {
      r = _.map(self.node.tags, function(val) {
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

    if (self._af && self.node && self.node.references) {
      r = _.map(self.node.references, function(val) {
        return {
          label: val,
          value: val
        };
      });
    }

    return r;
  }

});
