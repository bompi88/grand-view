////////////////////////////////////////////////////////////////////////////////
// Detail description of a node with edit possibilities
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

Session.set('isMoveMode', false);

// -- Helper methods -----------------------------------------------------------


var toggleVisibilityOfView = function(view, scrollToClass) {
  var s = Session.get(view);
  Session.set(view, !s);

  if (!s) {
    var container = $(".node-detail-view");
    container.animate({
      scrollTop: $(scrollToClass).offset().top - container.offset().top + container.scrollTop() - 25
    }, 300);
  }
};

// -- Template helpers ---------------------------------------------------------


Template.NodeDetail.helpers({

  node: function() {
    return GV.collections.Nodes.findOne({
      _id: Session.get('nodeInFocus')
    });
  },

  isEditing: function(node) {
    var nodeId = node && node._id;
    return Session.get("inlineEditNode") === nodeId;
  },

  artificialData: function() {
    var meta = Session.get('artificialNode');
    if(meta) {
      if(meta.type === 'tag') {
        return { children: GV.collections.Nodes.find({ tags: meta.value }) };
      } else if(meta.type === 'reference') {
        return { children: GV.collections.Nodes.find({ references: meta.value }) };
      }
      return null;
    } else {
      return null;
    }
  },

  artificialValue: function() {
    var meta = Session.get('artificialNode');

    return meta.value;
  },

  isOnArtificialType: function(type) {
    var meta = Session.get('artificialNode');
    return meta.type === type;
  }

});


Template.GeneralInfo.helpers({

  getChildren: function() {
    return GV.collections.Nodes.find({
      parent: Session.get('nodeInFocus'),
      nodeType: "media"
    });
  }

});


Template.MediaNodesTable.helpers({

  getChildren: function() {
    var children = GV.collections.Nodes.find({
      parent: Session.get('nodeInFocus'),
      nodeType: "media"
    }, {
      sort: {
        position: 1
      }
    });

    Template.instance().currentChildren = children.fetch();
    return children;
  },

  hasMarkedNodes: function() {
    var selected = GV.selectedCtrl.getSelected("mediaNodeView");

    return selected.length ? "" : "disabled";
  },

  allIsMarked: function() {
    var children = Template.instance().currentChildren;

    return GV.selectedCtrl.allSelected("mediaNodeView", _.pluck(children, "_id")) ? "checked" : "";
  }

});

Template.NodeDescription.helpers({

  file: function() {
    return GV.collections.Files.findOne({
      _id: this.fileId
    });
  },

  hasShowMore: function() {
    return this.description && (this.description.split("\n").length > 1);
  },

  showMore: function() {
    return !!GV.showMoreCtrl.get(this._id);
  },

  shortDescription: function() {
    return this.description && this.description.split("\n")[0];
  }

});


Template.ViewMediaNode.helpers({

  isEditing: function() {
    return Session.get("inlineEditNode") === this._id;
  },

  isMarked: function() {
    return GV.selectedCtrl.isSelected("mediaNodeView", this._id) ? "checked" : "";
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
    event.preventDefault();
    event.stopPropagation();

    toggleVisibilityOfView("showMediaNodesView", ".toggle-media-nodes-view");
  },

  'click .toggle-node-form': function(event, tmpl) {
    event.preventDefault();
    event.stopPropagation();

    toggleVisibilityOfView("showNodeForm", ".toggle-node-form");
  }

});


Template.GeneralInfo.events({

  'click .toggle-media-nodes-view': function(event, tmpl) {
    var s = Session.get("showMediaNodesView");

    Session.set("showMediaNodesView", !s);

    if (!s) {
      var container = $(".node-detail-view");

      container.animate({
        scrollTop: $(".toggle-media-nodes-view").offset().top - container.offset().top + container.scrollTop() - 25
      }, 300);
    }
  },

  'click .toggle-node-form': function(event, tmpl) {
    var s = Session.get("showNodeForm");

    Session.set("showNodeForm", !s);

    if (!s) {
      var container = $(".node-detail-view");

      container.animate({
        scrollTop: $(".toggle-node-form").offset().top - container.offset().top + container.scrollTop() - 25
      }, 300);
    }
  },

  'click .delete-document': function(event, tmpl) {

    GV.helpers.showConfirmationPrompt({
        title:  GV.helpers.isTemplate() ?
                "Bekreftelse på sletting av mal" :
                "Bekreftelse på sletting av dokument",
        message: Blaze.toHTML(Template.RemoveDocumentModal)
      },
      _.partial(GV.documentsCtrl.removeDocumentCallback, _, {
        title: 'Sletting fullført',
        text: GV.helpers.isTemplate() ?
              "Malen ble lagt i papirkurven." :
              "Dokumentet ble lagt i papirkurven."
      }, this._id)
    );
  }

});


var placeholder = $(Blaze.toHTML(Template.PlaceholderRow))[0];
var nodePlacement = null;
var hoverPlaceholder = null;
var tableBody = null;

Template.MediaNodesTable.events({

  'click .media-nodes-view .checkbox-master': function(event, tmpl) {
    event.stopPropagation();
    var checked = $(event.target).is(":checked");

    if (checked) {
      var docIds = _.pluck(Template.instance().currentChildren, "_id");
      GV.selectedCtrl.addAll("mediaNodeView", docIds);
    } else {
      GV.selectedCtrl.reset("mediaNodeView");
    }

  },

  'click .media-nodes-view .checkbox': function(event, tmpl) {
    event.stopPropagation();
    var checked = $(event.target).is(":checked");

    if (checked)
      GV.selectedCtrl.add("mediaNodeView", this._id);
    else
      GV.selectedCtrl.remove("mediaNodeView", this._id);

  },

  'click .row-item': function(event, tmpl) {
    event.preventDefault();
  },

  'dragstart .row-item': function(event, tmpl) {
    event.stopPropagation();

    hoverPlaceholder = false;

    GV.dragElement = event.currentTarget;
    GV.dragElementRow = event.currentTarget.parentNode;
    tableBody = GV.dragElementRow.parentNode;
  },

  'dragend .row-item': function(event, tmpl) {
    GV.dragElementRow.style.display = 'table-row';
    tableBody.removeChild(placeholder);

    if(hoverPlaceholder) {
      var node =  Blaze.getData(GV.dragElement);
      var to = Blaze.getData(GV.over).position;
      var from = node.position;

      if(nodePlacement === "after") to++;

      Meteor.call('updateNodePosition', from, to, node);

    } else {
      return;
    }
  },

  'dragover .row-item': function(event, tmpl) {
    event.preventDefault();
    GV.dragElementRow.style.display = 'none';

    var td = event.target;

    if(td.className.indexOf("node-title") >= 0)
      td = td.parentNode;

    var tr = td.parentNode;

    if(tr.className.indexOf('placeholder-hover') >= 0)
      return;

    if(td.className.indexOf("row-item") >= 0) {
      GV.over = td;

      var relY = event.originalEvent.clientY - tr.getBoundingClientRect().top;
      var height = tr.offsetHeight / 2;

      if(relY > height) {
        nodePlacement = "after";
        tr.parentNode.insertBefore(placeholder, tr.nextElementSibling);
      } else if(relY < height) {
        nodePlacement = "before";
        tr.parentNode.insertBefore(placeholder, tr);
      }
    } else {
      return;
    }

  },

  'dragenter .placeholder': function(event, tmpl) {
    event.preventDefault();

    var t = event.currentTarget;

    hoverPlaceholder = true;

    if(t.className.indexOf('placeholder-hover') === -1)
      t.className = t.className + ' placeholder-hover';
  },

  'dragleave .placeholder': function(event, tmpl) {
    event.preventDefault();

    var t = event.currentTarget;

    hoverPlaceholder = false;

    if(t.className.indexOf('placeholder-hover') >= 0)
      t.className = t.className.replace(/placeholder-hover/g, '');
  },

  'click .add-media-node': function(event, tmpl) {
    event.preventDefault();
    event.stopPropagation();

    GV.nodeCtrl.insertNodeOfType(this.doc, "media", null, true);
  },

  'click .move-multiple': function(event, tmpl) {
    event.preventDefault();

    var selected = GV.selectedCtrl.getSelected("mediaNodeView");

    if (selected.length) {

      Session.set('isMoveMode', true);

      // var els = $(".tree li > span.element").confirmation({
      //   title: "Flytte elementer hit?",
      //   btnOkLabel: "Ok",
      //   trigger: "manual",
      //   btnCancelLabel: "Avbryt",
      //   btnOkClass: "btn btn-xs btn-primary",
      //   btnCancelClass: "btn btn-xs btn-default",
      //   singelton: true,
      //   placement: "top",
      //   onConfirm: function(event) {
      //     var data = UI.getData(event.target);

      //     console.log(data)
      //     moveNodes(data._id, selected, "mediaNodeView", { title: "Flytting vellykket", text: "Informasjonselementene er nå flyttet til <b>" + data.prevSection + " " + (data.title || "Uten navn") + "</b>"});

      //     Session.set('isMoveMode', false);
      //   },
      //   onCancel: function(event) {
      //     Session.set('isMoveMode', false);
      //   }
      // });


      // var els =
    }
    // if(selected.length) {
    //   GV.helpers.showConfirmationPrompt({
    //     title: "Bekreftelse på flytting av informasjonselementer",
    //     message: UI.toHTML(Template.MoveMediaNodesModal)
    //   }, function(result) {

    //     });

    //     // $(".tree li > span.element").unbind('click.move').bind('click.move', function() {
    //     //   var data = UI.getData(this);

    //     //   console.log(data)
    //     //   moveNodes(data._id, selected, "mediaNodeView", { title: "Flytting vellykket", text: "Informasjonselementene er nå flyttet til <b>" + data.prevSection + " " + (data.title || "Uten navn") + "</b>"});

    //     //   $(".tree li > span.element").unbind('click.move');
    //     // });
    //   });
    // }
  },

  'click .delete-multiple': function(event, tmpl) {
    var selected = GV.selectedCtrl.getSelected("mediaNodeView");

    if (selected.length) {
      GV.helpers.showConfirmationPrompt({
          title: "Bekreftelse på sletting av informasjonselementer",
          message: Blaze.toHTML(Template.RemoveMediaNodesModal)
        },
        _.partial(GV.nodeCtrl.removeNodesCallback, _, {
          title: 'Sletting fullført',
          text: 'De valgte informasjonselementene ble slettet fra systemet.'
        }, selected, "mediaNodeView")
      );
    }
  }

});

Template.AttachmentImage.onRendered(function() {

  Meteor.defer(function() {
    $('.attachment-image').magnificPopup({
  		type: 'image',
  		closeOnContentClick: true,
  		image: {
  			verticalFit: true
  		}
  	});
  });

});

Template.ViewMediaNode.events({

  'click .edit-media-node': function(event, tmpl) {
    event.preventDefault();
    event.stopPropagation();

    var it = this;

    GV.helpers.showEditWarning(function() {
      Session.set("inlineEditNode", it._id);
      Session.set("formDirty", false);
    });
  },

  'click .dismiss-edit-media-node': function(event, tmpl) {
    event.preventDefault();
    event.stopPropagation();

    Session.set("inlineEditNode", null);
  },

  'click .save-media-node': function(event, tmpl) {
    event.preventDefault();

    Session.set("closeOnSave", true);

    $("#update-node-form").trigger('submit');
  },

  'click .delete-media-node': function(event, tmpl) {
    event.preventDefault();

    GV.helpers.showConfirmationPrompt({
        title: "Bekreftelse på sletting av informasjonselement",
        message: Blaze.toHTML(Template.RemoveMediaNodeModal)
      },
      _.partial(GV.nodeCtrl.removeNodeCallback, _, {
        title: 'Sletting fullført',
        text: 'Informasjonselementet ble slettet fra systemet.'
      }, this._id)
    );
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
  }

});


Template.ShowMoreOrLess.events({

  'click .toggle-visibility': function(event, tmpl) {
    event.preventDefault();

    if (GV.showMoreCtrl.get(this.node._id)) {
      GV.showMoreCtrl.hide(this.node._id);
    } else {
      GV.showMoreCtrl.show(this.node._id);
    }
  }

});
