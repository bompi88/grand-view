////////////////////////////////////////////////////////////////////////////////
// Dashboard logic
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

var createNewDoc = function() {

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
      if(title != null) {
        var doc = {
          title: title || "Mitt nye dokument",
          lastChanged: new Date(),
          userId: GV.helpers.userId(Meteor.userId())
        };

        // create a new document
        var id = GV.collections.Documents.insert(doc);

        goToDoc(id);
      }
    }
  }
  bootbox.prompt(confirmationPrompt);
};

var goToDoc = function(id) {
  GV.tabs.reset();
  // redirect to the new document
  Router.go(Router.path('Document', { _id: id }));
}

var createNewTemplate = function() {

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
      if(title != null) {
        var doc = {
          title: title || "Min nye dokumentmal",
          lastChanged: new Date(),
          userId: GV.helpers.userId(Meteor.userId()),
          template: true
        };

        // create a new document
        var id = GV.collections.Documents.insert(doc);

        goToTemplate(id);
      }
    }
  }
  bootbox.prompt(confirmationPrompt);
};

var goToTemplate = function(id) {
  GV.tabs.reset();
  // redirect to the new document
  Router.go(Router.path('Document', { _id: id }));
};

var softRemoveDocument = function(id, hideNotification) {
  var doc = GV.collections.Documents.findOne({_id: id});
  var children = doc && doc.children || [];

  // Remove the document
  GV.collections.Documents.remove({_id: id}, function(error) {
    if(error) {
      Notifications.warn('Feil', error.message);
    } else {
      // Remove all the children nodes that rely on the document
      Meteor.call('removeNodes', children);

      if(!hideNotification)
        Notifications.success('Dokument slettet', 'Dokumentet ble lagt i papirkurven');
    }
  });
};

// -- Template events ----------------------------------------------------------


Template.Dashboard.events({

	'click #btn-newDoc': function(event, tmpl) {
    event.preventDefault && event.preventDefault();

    createNewDoc();
	},

  'click .checkbox-master' : function(event, tmpl) {
    event.stopPropagation && event.stopPropagation();
    var checked = $(event.target).is(":checked");

    if(checked) {
      var docIds = _.pluck(this.documents.fetch(), "_id");
      GV.dashboardCtrl.addAll(this.tableName, docIds);

      $("#" + this.tableName).find(".checkbox").prop('checked', true);
    } else {
      GV.dashboardCtrl.reset(this.tableName);
      $("#" + this.tableName).find(".checkbox").prop('checked', false);
    }

    console.log(GV.dashboardCtrl.getSelected(this.tableName));
  },

  'click .checkbox' : function(event, tmpl) {
    event.stopPropagation && event.stopPropagation();

    var checked = $(event.target).is(":checked");

    if(checked)
      GV.dashboardCtrl.add(this.tableName, this.document._id);
    else
      GV.dashboardCtrl.remove(this.tableName, this.document._id);

    console.log(GV.dashboardCtrl.getSelected(this.tableName));
  },

	'click .row-item' : function(event, tmpl) {
    event.preventDefault && event.preventDefault();

    GV.tabs.reset();
		Router.go(Router.path('Document', {_id: this.document._id}));
	},

  'click #btn-editDoc': function(event, tmpl) {
    GV.tabs.reset();
    Router.go(Router.path('Document', {_id: this.document._id}));
  },

  'click #btn-remove': function(event, tmpl) {
    var docId = this.document._id;
    var tableName = this.tableName;

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
            if(result) {
              softRemoveDocument(docId);
              GV.dashboardCtrl.remove(tableName, docId);
            }
          }
        }
      }
    }
    bootbox.dialog(confirmationPrompt);
  }

});


Template.DocumentActionsDropdown.helpers({

  isDisabledOnManyAndNone: function() {
    return GV.dashboardCtrl.getSelected(this.tableName).length !== 1 ? "disabled" : "";
  },

  isDisabledOnNone: function() {
    return GV.dashboardCtrl.getSelected(this.tableName).length == 0 ? "disabled" : "";
  }

});


Template.DocumentActionsDropdown.events({

  'click .new-doc': function(event, tmpl) {
    event.preventDefault && event.preventDefault();

    if(this.tableName === "documents") {
      createNewDoc();
    } else if(this.tableName === "templates") {
      createNewTemplate();
    }
  },

  'click .edit-doc': function(event, tmpl) {
    event.preventDefault && event.preventDefault();

    if(this.tableName === "documents") {
      goToDoc(GV.dashboardCtrl.getSelected(this.tableName)[0]);
    } else if(this.tableName === "templates") {
      goToTemplate(GV.dashboardCtrl.getSelected(this.tableName)[0]);
    }
  },

  'click .import-doc': function(event, tmpl) {
    event.preventDefault && event.preventDefault();

    if(this.tableName === "documents") {
      importDocument();
    } else if(this.tableName === "templates") {
      importDocument({ template: true });
    }
  },

  'click .export-doc': function(event, tmpl) {
    event.preventDefault && event.preventDefault();

    if(this.tableName === "documents") {
      exportDocument(GV.dashboardCtrl.getSelected(this.tableName)[0]);
    } else if(this.tableName === "templates") {
      exportDocument(GV.dashboardCtrl.getSelected(this.tableName)[0], { template: true });
    }
  },

  'click .trash-doc': function(event, tmpl) {
    event.preventDefault && event.preventDefault();
    var msg;
    var tableName = this.tableName;

    if(tableName === "documents") {
      msg = 'Er du sikker på at du vil legge de valgte dokumentene i papirkurven?';
    } else if(tableName === "templates") {
      msg = 'Er du sikker på at du vil legge de valgte malene i papirkurven?';
    }

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
            if(result) {
              var selected = GV.dashboardCtrl.getSelected(tableName);

              selected.forEach(function(id) {
                softRemoveDocument(id, true);
              });

              GV.dashboardCtrl.removeAll(tableName, selected);

              $("#" + tableName).find(".checkbox-master").prop('checked', false);

              Notifications.success('Sletting fullført', 'Elementene ble lagt i papirkurven');
            }
          }
        }
      }
    }
    bootbox.dialog(confirmationPrompt);
  }

});
