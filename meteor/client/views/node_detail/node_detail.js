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


Template.MediaNodesTable.helpers({

  getChildren: function() {
    var children = GV.collections.Nodes.find({ parent: Session.get('nodeInFocus'), nodeType: "media" });
    Template.instance().currentChildren = children.fetch();
    return children;
  }

});

Template.ViewMediaNode.helpers({

  file: function() {
    return GV.collections.Files.findOne({ _id: this.fileId });
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

    $("div.tooltip").hide();

    // A confirmation prompt before removing the document
    var confirmationPrompt = {
      title: "Bekreftelse på sletting av fil",
      message: '<div class="well well-sm"><span class="glyphicon glyphicon-warning-sign" aria-hidden="true" style="font-size:35px;color:#CC3232;"></span><div class="pull-right"style="width:90%;"><b>Advarsel!</b> Filen vil permanent bli slettet fra programmet, men den kan lastes inn på nytt hvis du har den på disk.</div></div>Er du sikker på at du vil slette filen? Det er ingen gjenopprettingsmuligheter...',
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
                          Notifications.success('Sletting fullført', 'Filen er nå fjernet og informasjonselementet oppdatert.');
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

  'click .delete-media-node': function(event, tmpl) {

    $("div.tooltip").hide();

    // A confirmation prompt before removing the document
    var confirmationPrompt = {
      title: "Bekreftelse på sletting av informasjonselement",
      message: '<div class="well well-sm"><span class="glyphicon glyphicon-warning-sign" aria-hidden="true" style="font-size:35px;color:#CC3232;"></span><div class="pull-right"style="width:90%;"><b>Advarsel!</b> Tekstlig innhold i dette elementet, samt eventuell tilknyttet fil vil permanent bli slettet fra programmet.</div></div>Er du sikker på at du vil slette informasjonselementet med alt av innhold? Det er ingen gjenopprettingsmuligheter tilgjengelige...',
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

              Notifications.success('Sletting fullført', 'Informasjonselementet ble slettet fra systemet.');
            }
          }
        }
      }
    }
    bootbox.dialog(confirmationPrompt);
  },

  'click .delete-chapter-node': function(event, tmpl) {

    $("div.tooltip").hide();

    // A confirmation prompt before removing the document
    var confirmationPrompt = {
      title: "Bekreftelse på sletting av kapittelelement",
      message: '<div class="well well-sm"><span class="glyphicon glyphicon-warning-sign" aria-hidden="true" style="font-size:35px;color:#CC3232;"></span><div class="pull-right"style="width:90%;"><b>Advarsel!</b> Sletter man kapittelelementet, forsvinner i tillegg informasjonselementene knyttet til dette kapittelet.</div></div>Er du sikker på at du vil slette kapittelelementet med alle underliggende informasjonselement? Det er ingen gjenopprettingsmuligheter tilgjengelige...',
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

              Notifications.success('Sletting fullført', 'Kapittelelementet ble slettet fra systemet.');
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
  },

  'click .toggle-media-nodes-view': function(event, tmpl) {
    var s = Session.get("showMediaNodesView");

    Session.set("showMediaNodesView", !s);

    if(!s) {
      var container = $(".node-detail-view");

      container.animate({
          scrollTop: $(".toggle-media-nodes-view").offset().top - container.offset().top + container.scrollTop() - 25
      }, 300);
    }
  },

  'click .toggle-node-form': function(event, tmpl) {
    var s = Session.get("showNodeForm");

    Session.set("showNodeForm", !s);

    if(!s) {
      var container = $(".node-detail-view");

      container.animate({
          scrollTop: $(".toggle-node-form").offset().top - container.offset().top + container.scrollTop() - 25
      }, 300);
    }
  }

});


Template.MediaNodesTable.events({
  'click .media-nodes-view .checkbox-master' : function(event, tmpl) {
    event.stopPropagation && event.stopPropagation();
    var checked = $(event.target).is(":checked");

    if(checked) {
      var docIds = _.pluck(Template.instance().currentChildren, "_id");
      GV.selectedCtrl.addAll("mediaNodeView", docIds);

      $(".media-nodes-view.nodes-table").find(".checkbox").prop('checked', true);
    } else {
      GV.selectedCtrl.reset(this.tableName);
      $(".media-nodes-view.nodes-table").find(".checkbox").prop('checked', false);
    }

  },

  'click .media-nodes-view .checkbox' : function(event, tmpl) {
    event.stopPropagation && event.stopPropagation();
    var checked = $(event.target).is(":checked");

    if(checked)
      GV.selectedCtrl.add("mediaNodeView", this._id);
    else
      GV.selectedCtrl.remove("mediaNodeView", this._id);

  },

  'click .row-item' : function(event, tmpl) {
    event.preventDefault && event.preventDefault();

    GV.tabs.addTab(this._id);
    Session.set('nodeInFocus', this._id);
    Session.set('showMediaNodesView', false);
    Session.set('showNodeForm', true);
  },

  'click .add-media-node': function(event, tmpl) {
    event.prevenDefault && event.prevenDefault();
    event.stopPropagation && event.stopPropagation();

    Session.set('showNodeForm', true);
    Session.set('showMediaNodesView', false);
    insertNodeOfType(this.doc, "media", tmpl);
  }

});


Template.GeneralInfo.helpers({

  getChildren: function() {
    return GV.collections.Nodes.find({ parent: Session.get('nodeInFocus'), nodeType: "media" });
  }

});

Template.GeneralInfo.events({

'click .delete-document': function(event, tmpl) {
  var self = this;

  $("div.tooltip").hide();

    // A confirmation prompt before removing the document
    var confirmationPrompt = {
      title: "Bekreftelse på sletting av dokument",
      message: '<div class="well well-sm"><span class="glyphicon glyphicon-info-sign" aria-hidden="true" style="font-size:35px;color:#0080ff;"></span><div class="pull-right"style="width:90%;"><b>NB!</b> Hvis du sletter dokumentet vil det først havne i papirkurven, og dokumentet kan gjenopprettes der ved seinere anledning.</div></div>Er du sikker på at du vil slette <b><em>hele</em></b> dokumentet?',
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

Template.ViewMediaNode.events({

  'click .edit-media-node': function(event, tmpl) {
    event.preventDefault && event.preventDefault();
    event.stopPropagation && event.stopPropagation();

    GV.tabs.addTab(this._id);
    Session.set('nodeInFocus', this._id);
    Session.set('showMediaNodesView', false);
    Session.set('showNodeForm', true);
  }

});
