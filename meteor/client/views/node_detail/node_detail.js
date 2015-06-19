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


// -- Helper methods -----------------------------------------------------------


var toggleVisibilityOfView = function(view, scrollToClass) {
    var s = Session.get(view);
    Session.set(view, !s);

    if(!s) {
      var container = $(".node-detail-view");

      container.animate({
          scrollTop: $(scrollToClass).offset().top - container.offset().top + container.scrollTop() - 25
      }, 300);
    }
};


// -- Template helpers ---------------------------------------------------------


Template.NodeDetail.helpers({

  node: function() {
    return GV.collections.Nodes.findOne({_id: Session.get('nodeInFocus')});
  }

});


Template.GeneralInfo.helpers({

  getChildren: function() {
    return GV.collections.Nodes.find({ parent: Session.get('nodeInFocus'), nodeType: "media" });
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
  },

  hasShowMore: function() {
    return this.description && (this.description.split("\n").length > 1);
  },

  showMore: function() {
    return !!GV.showMoreCtrl.get(this._id);
  },

  shortDescription: function() {
    return this.description && this.description.split("\n")[0];
  },

  isEditing: function() {
    return Session.get("inlineEditNode") === this._id;
  }

});


Template.ShowMoreOrLess.helpers({

  hasShowMore: function() {
    return !GV.showMoreCtrl.get(this.node._id);
  }

});


// -- Template events ----------------------------------------------------------


Template.NodeDetail.events({

  'click .toggle-media-nodes-view': function(event, tmpl) {
    event.preventDefault && event.preventDefault();
    event.stopPropagation && event.stopPropagation();

    toggleVisibilityOfView("showMediaNodesView", ".toggle-media-nodes-view");
  },

  'click .toggle-node-form': function(event, tmpl) {
    event.preventDefault && event.preventDefault();
    event.stopPropagation && event.stopPropagation();

    toggleVisibilityOfView("showNodeForm", ".toggle-node-form");
  }

});


Template.GeneralInfo.events({

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
  },

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
  },

  'click .add-media-node': function(event, tmpl) {
    event.prevenDefault && event.prevenDefault();
    event.stopPropagation && event.stopPropagation();

    insertNodeOfType(this.doc, "media", null, true);
  }

});


Template.ViewMediaNode.events({

  'click .edit-media-node': function(event, tmpl) {
    event.preventDefault && event.preventDefault();
    event.stopPropagation && event.stopPropagation();

    Session.set("inlineEditNode", this._id);
  },

  'click .dismiss-edit-media-node': function(event, tmpl) {
    event.preventDefault && event.preventDefault();
    event.stopPropagation && event.stopPropagation();

    Session.set("inlineEditNode", null);
  },

  'click .save-media-node': function(event, tmpl) {
    event.preventDefault && event.preventDefault();
    event.stopPropagation && event.stopPropagation();

    $("#update-node-form").trigger('submit');
  }

});


Template.ShowMoreOrLess.events({

  'click .toggle-visibility': function(event, tmpl) {
    event.preventDefault && event.preventDefault();

    GV.showMoreCtrl.get(this.node._id) ? GV.showMoreCtrl.hide(this.node._id) : GV.showMoreCtrl.show(this.node._id);
  }

});
