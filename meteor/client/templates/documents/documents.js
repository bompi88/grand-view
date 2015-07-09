////////////////////////////////////////////////////////////////////////////////
// Documents Template Logic
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

// -- Template events ----------------------------------------------------------


Template.DocumentTable.events({

  'click #btn-newDoc': function(event, tmpl) {
    event.preventDefault();

    //GV.documentsCtrl.createNewDoc();
  },

  'click .checkbox-master': function(event, tmpl) {
    event.stopPropagation();
    var checked = $(event.target).is(":checked");

    if (checked) {
      var docIds = _.pluck(this.documents.fetch(), "_id");
      GV.selectedCtrl.addAll(this.tableName, docIds);

      $("#" + this.tableName).find(".checkbox").prop('checked', true);
    } else {
      GV.selectedCtrl.reset(this.tableName);
      $("#" + this.tableName).find(".checkbox").prop('checked', false);
    }

  },

  'click .checkbox': function(event, tmpl) {
    event.stopPropagation();

    var checked = $(event.target).is(":checked");

    if (checked)
      GV.selectedCtrl.add(this.tableName, this.document._id);
    else
      GV.selectedCtrl.remove(this.tableName, this.document._id);

  },

  'click .row-item': function(event, tmpl) {
    event.preventDefault();

    GV.tabs.reset();
    Router.go(Router.path('Document', {
      _id: this.document._id
    }));
  },

  'click #btn-editDoc': function(event, tmpl) {
    GV.tabs.reset();

    if (this.tableName === "documents") {
      GV.documentsCtrl.goToDoc(this.document._id);
    } else if (this.tableName === "templates") {
      GV.documentsCtrl.goToTemplate(this.document._id);
    }
  },

  'click #btn-remove': function(event, tmpl) {
    var docId = this.document._id;
    var tableName = this.tableName;

    $("div.tooltip").hide();

    // A confirmation prompt before removing the document
    var confirmationPrompt = {
      title: "Bekreftelse på slettingen",
      message: 'Er du sikker på at du vil legge dokumentet i papirkurven?',
      buttons: {
        cancel: {
          label: "Nei"
        },
        confirm: {
          label: "Ja",
          callback: function(result) {
            if (result) {
              GV.documentsCtrl.softRemoveDocument(docId);
              GV.selectedCtrl.remove(tableName, docId);
            }
          }
        }
      }
    };

    bootbox.dialog(confirmationPrompt);
  }

});


Template.DocumentActionsDropdown.helpers({

  isDisabledOnManyAndNone: function() {
    return GV.selectedCtrl.getSelected(this.tableName).length !== 1 ? "disabled" : "";
  },

  isDisabledOnNone: function() {
    return GV.selectedCtrl.getSelected(this.tableName).length === 0 ? "disabled" : "";
  }

});


Template.DocumentActionsDropdown.events({

  'click .new-doc': function(event, tmpl) {
    event.preventDefault();

    if (this.tableName === "templates") {
      GV.documentsCtrl.createNewTemplate();
    }
  },

  'click .edit-doc': function(event, tmpl) {
    event.preventDefault();

    if (this.tableName === "documents") {
      GV.documentsCtrl.goToDoc(GV.selectedCtrl.getSelected(this.tableName)[0]);
    } else if (this.tableName === "templates") {
      GV.documentsCtrl.goToTemplate(GV.selectedCtrl.getSelected(this.tableName)[0]);
    }
  },

  'click .import-doc': function(event, tmpl) {
    event.preventDefault();

    if (this.tableName === "documents") {
      GV.helpers.importDocument();
    } else if (this.tableName === "templates") {
      GV.helpers.importDocument({
        template: true
      });
    }
  },

  'click .export-doc': function(event, tmpl) {
    event.preventDefault();

    if (this.tableName === "documents") {
      GV.helpers.exportDocument(GV.selectedCtrl.getSelected(this.tableName)[0]);
    } else if (this.tableName === "templates") {
      GV.helpers.exportDocument(GV.selectedCtrl.getSelected(this.tableName)[0], {
        template: true
      });
    }
  },

  'click .trash-doc': function(event, tmpl) {
    event.preventDefault();
    var msg;
    var tableName = this.tableName;

    if (tableName === "documents") {
      msg = 'Er du sikker på at du vil legge de valgte dokumentene i papirkurven?';
    } else if (tableName === "templates") {
      msg = 'Er du sikker på at du vil legge de valgte malene i papirkurven?';
    }

    $("div.tooltip").hide();

    // A confirmation prompt before removing the document
    var confirmationPrompt = {
      title: "Bekreftelse på slettingen",
      message: msg,
      buttons: {
        cancel: {
          label: "Nei"
        },
        confirm: {
          label: "Ja",
          callback: function(result) {
            if (result) {
              var selected = GV.selectedCtrl.getSelected(tableName);

              selected.forEach(function(id) {
                GV.documentsCtrl.softRemoveDocument(id, true);
              });

              GV.selectedCtrl.removeAll(tableName, selected);

              $("#" + tableName).find(".checkbox-master").prop('checked', false);

              Notifications.success('Sletting fullført', 'Elementene ble lagt i papirkurven');
            }
          }
        }
      }
    };
    bootbox.dialog(confirmationPrompt);
  }

});

Template.DocumentRow.helpers({
  getTemplateTitle: function(id) {
    var template = GV.collections.Documents.findOne({
      _id: id
    });

    return template && template.title;
  }
});
