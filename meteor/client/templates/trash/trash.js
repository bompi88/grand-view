////////////////////////////////////////////////////////////////////////////////
// Trash Template Logic
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

var removeDoc = function(id) {
  var doc = GV.collections.Documents.findOne({
    _id: id
  });
  
  var children = doc && doc.children || [];

  GV.collections.Documents.remove({
    _id: id
  }, function() {
    // Remove all the children nodes that rely on the document
    Meteor.call('removeNodes', children);
  });
};

var permanentlyRemove = function(ids) {
  if (_.isArray(ids)) {
    ids.forEach(function(id) {
      removeDoc(id);
    });
    Notifications.success("Sletting fullført", "De valgte dokumentene ble slettet fra systemet.");
  } else {
    removeDoc(ids);
    Notifications.success("Sletting fullført", "Dokumentet ble slettet fra systemet.");
  }
};

var restore = function(ids) {
  if (_.isArray(ids)) {
    ids.forEach(function(id) {
      GV.collections.Documents.restore({
        _id: id
      });
    });
    Notifications.success("Gjenoppretting fullført", "De valgte dokumentene ble gjenopprettet.");
  } else {
    GV.collections.Documents.restore({
      _id: ids
    });
    Notifications.success("Gjenoppretting fullført", "Dokumentet ble gjenopprettet.");
  }
};

Template.TrashTable.events({

  'click .checkbox-master': function(event, tmpl) {
    event.stopPropagation();
    var checked = $(event.target).is(":checked");
    if(this.documents) {

      var docIds = _.pluck(this.documents.fetch(), "_id");

      if (checked) {
        GV.selectedCtrl.addAll(this.tableName, docIds);
        $("#" + this.id).find(".checkbox").prop('checked', true);
      } else {
        GV.selectedCtrl.removeAll(this.tableName, docIds);
        $("#" + this.id).find(".checkbox").prop('checked', false);
      }
    }

  }

});

Template.TrashRow.events({

  'click .recover': function(event, tmpl) {
    event.preventDefault();

    GV.selectedCtrl.remove(this.tableName, this.document._id);
    restore(this.document._id);
  },

  'click .remove': function(event, tmpl) {
    event.preventDefault();
    var tableName = this.tableName;
    var docId = this.document._id;

    GV.helpers.showConfirmationPrompt({
      title: "Permanent sletting",
      message: "Vil du slette dokumentet permantent fra systemet?"
    }, function() {
      GV.selectedCtrl.remove(tableName, docId);
      permanentlyRemove(docId);
    });
  },

  'click .checkbox': function(event, tmpl) {
    event.stopPropagation();

    var checked = $(event.target).is(":checked");

    if (checked)
      GV.selectedCtrl.add(this.tableName, this.document._id);
    else
      GV.selectedCtrl.remove(this.tableName, this.document._id);

  }

});

Template.TrashActionsDropdown.events({

  'click .recover': function(event, tmpl) {
    event.preventDefault();
    var selected = GV.selectedCtrl.getSelected(this.tableName);
    var tableName = this.tableName;

    restore(selected);
    GV.selectedCtrl.removeAll(this.tableName, selected);

    $("." + tableName).find(".checkbox-master").prop('checked', false);
  },

  'click .remove': function(event, tmpl) {
    event.preventDefault();
    var tableName = this.tableName;
    var selected = GV.selectedCtrl.getSelected(tableName);

    GV.helpers.showConfirmationPrompt({
      title: "Permanent sletting",
      message: "Vil du permanent slette de valgte dokumentene fra systemet?"
    }, function() {
      permanentlyRemove(selected);
      GV.selectedCtrl.removeAll(tableName, selected);
      $("." + tableName).find(".checkbox-master").prop('checked', false);
    });
  }

});

Template.TrashActionsDropdown.helpers({

  isDisabledOnNone: function() {
    return GV.selectedCtrl.getSelected(this.tableName).length === 0 ? "disabled" : "";
  }

});
