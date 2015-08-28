////////////////////////////////////////////////////////////////////////////////
// Tree Template Logic
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

// The selected element to drag
GV.dragElement = null;

Session.set("showMovePopover", false);


// -- Tree Template helpers ----------------------------------------------------


Template.Tree.helpers({

  /**
   * The nodes of this tree.
   */
  treeItems: function() {
    if (Session.get("showMediaNodes")) {
      return this.tree && GV.collections.Nodes.find({
        parent: this.tree._id
      }, {
        sort: {
          nodeType: 1,
          position: 1
        }
      }).map(function(node, index) {
        node.node_index = index;
        return node;
      });
    } else {
      return this.tree && GV.collections.Nodes.find({
        parent: this.tree._id,
        nodeType: "chapter"
      }, {
        sort: {
          position: 1
        }
      }).map(function(node, index) {
        node.node_index = index;
        return node;
      });
    }
  },

  /**
   * Returns true if the tree contains nodes.
   */
  hasChildren: function() {
    if (Session.get("showMediaNodes")) {
      return this.tree && GV.collections.Nodes.find({
        parent: this.tree._id
      }).count() > 0;
    } else {
      return this.tree && GV.collections.Nodes.find({
        parent: this.tree._id,
        nodeType: "chapter"
      }).count() > 0;
    }
  },

  childrenCount: function() {
    return this.tree && GV.collections.Nodes.find({
      parent: this.tree._id,
      nodeType: "media"
    }).count();
  },

  /**
   * Returns the title if defined, else returns a dummy title.
   */
  documentTitle: function() {
    return this.tree && this.tree.title || "Uten tittel";
  },

  getContext: function() {
    return _.extend(this, {
      prevSection: "" + (this.node_index + 1)
    });
  }

});


// -- Tree On Render -----------------------------------------------------------


Template.Tree.rendered = function() {

  // Create right click buttons when right clicking on root node
  $('.tree li.node.root > span').contextMenu('right-click-menu-root', {
    bindings: {

      // Add node button
      'add-chapter-node': function(t) {
        var elData = Blaze.getData(t);

        GV.nodeCtrl.insertNodeOfType(elData, "chapter", t);
      },

      // Add node button
      'add-media-node': function(t) {
        var elData = Blaze.getData(t);

        GV.nodeCtrl.insertNodeOfType(elData, "media", t);
      },

      // Delete button
      'delete-node': function(t) {
        Notifications.error('Sletting feilet', 'Kan ikke slette rotnoden.');
      },

      // Edit button
      'edit-node': function(t) {
        Session.set('nodeInFocus', Session.get('mainDocument'));
      }

    }
  });
};


Template.Tree.events({

  // -- Menu events ------------------------------------------------------------

  'click .toggle-media-nodes': function(event, tmpl) {
    event.preventDefault();

    Session.set("showMediaNodes", !Session.get("showMediaNodes"));
  },

  'click .expand-nodes': function(event, tmpl) {
    event.preventDefault();

    this.tree.children.forEach(function(nodeId) {
      GV.collections.Nodes.update({
        _id: nodeId
      }, {
        $set: {
          collapsed: false
        }
      });
    });
  },


  'click .collapse-nodes': function(event, tmpl) {
    event.preventDefault();

    this.tree.children.forEach(function(nodeId) {
      GV.collections.Nodes.update({
        _id: nodeId
      }, {
        $set: {
          collapsed: true
        }
      });
    });
  },


  'click .help-modal-button': function(event, tmpl) {
    event.preventDefault();

    $("div.tooltip").hide();

    var helpBox = {
      title:  '<span class="glyphicon glyphicon-question-sign"></span> ' +
              'Hjelp til kapittelstrukturvisningen',
      message: Blaze.toHTML(Template.TreeHelp),
      buttons: {
        close: {
          label: "Lukk",
          className: "btn-default",
        }
      }
    };

    bootbox.dialog(helpBox);
  },

  'click .add-media-node': function(event, tmpl) {
    event.preventDefault();

    Session.set('showNodeForm', true);
    Session.set('showMediaNodesView', false);

    GV.nodeCtrl.insertNodeOfType(this, "media", tmpl);
  },

  'click .add-chapter-node': function(event, tmpl) {
    event.preventDefault();

    Session.set('showNodeForm', true);
    Session.set('showMediaNodesView', true);

    GV.nodeCtrl.insertNodeOfType(this, "chapter", tmpl);
  },

  'click .generate-pdf': function(event, tmpl) {
    event.preventDefault();

    $('#create-printout').modal('show');
  },

  'click .export-to-file': function(event, tmpl) {
    event.preventDefault();
    GV.helpers.exportDocument(this.tree._id, this.tree.template);
  },


  // -- Prevent default behaviour on dragover events ---------------------------

  // Do NOT remove this!! This snippet necessary
  // for the drop event to work.
  'dragover li span.element': function(event, tmpl) {
    event.preventDefault();
  },

  // Do NOT remove this!! This snippet necessary
  // for the drop event to work.
  'dragover div.slot.slot-top': function(event, tmpl) {
    event.preventDefault();
  },

  // Do NOT remove this!! This snippet necessary
  // for the drop event to work.
  'dragover div.slot.slot-bottom': function(event, tmpl) {
    event.preventDefault();
  },


  // -- Toggle drop slot visibility events -------------------------------------


  'dragenter div.slot': function(event, tmpl) {
    event.preventDefault();
    event.stopPropagation();

    var data = Blaze.getData(GV.dragElement.parentNode);

    if(!Session.get('showMediaNodes') && data.nodeType === 'media')
      return false;

    $(event.currentTarget).addClass("slot-visible");
  },

  'dragleave div.slot': function(event, tmpl) {
    event.preventDefault();
    event.stopPropagation();

    $(event.currentTarget).removeClass("slot-visible");
  },


  // -- Drop events ------------------------------------------------------------

  'drop li.node > div.slot.slot-top, drop li.node > div.slot.slot-bottom': function(event, tmpl) {
    event.preventDefault();
    event.stopPropagation();

    var slot = event.currentTarget;
    var target = slot.parentNode.parentNode;
    var dragNode = GV.dragElement.parentNode.parentNode;
    var prevNode = $(dragNode).parent().parent();

    $(slot).removeClass("slot-visible");

    var parent = target.parentNode;
    var dataTarget = Blaze.getData(parent);
    var data = Blaze.getData(GV.dragElement.parentNode);

    if(!Session.get('showMediaNodes') && data.nodeType === 'media')
      return false;

    var l;
    if (dataTarget.level >= 0)
      l = dataTarget.level + 1;
    else
      l = 0;

    if (!GV.nodeCtrl.insideItself(data, dataTarget)) {
      if (slot.className === "slot slot-top") {
        $(dragNode).insertBefore($(target));
      } else if (slot.className === "slot slot-bottom") {
        $(dragNode).insertAfter($(target));
      }

      GV.nodeCtrl.updatePositions(parent);

      // Update the node position
      GV.collections.Nodes.update({
        _id: data._id
      }, {
        $set: {
          parent: dataTarget && dataTarget._id || dataTarget.tree._id,
          level: l,
          sectionLabel: GV.nodeCtrl.generateSectionLabel(
                          dataTarget && dataTarget.sectionLabel,
                          dataTarget && dataTarget.position
                        )
        }
      });

      GV.nodeCtrl.updatePositions(parent);
      GV.nodeCtrl.updatePositions(prevNode);
    }

    return false;
  },

  /**
   * Drop on children nodes
   */
  'drop li span.element.nodes': function(event, tmpl) {
    event.preventDefault();
    event.stopPropagation();

    if ($(event.currentTarget).hasClass('hover'))
      $(event.currentTarget).removeClass('hover');

    if ($(event.currentTarget)[0] === $(GV.dragElement)[0])
      return false;

    var dataTarget = Blaze.getData(event.currentTarget);
    var data = Blaze.getData(GV.dragElement);
    var parent = event.currentTarget.parentNode;

    var l = dataTarget.level + 1;

    if (dataTarget.nodeType !== "media" && !GV.nodeCtrl.insideItself(data, dataTarget)) {
      // Update the node position
      GV.collections.Nodes.update({
        _id: data._id
      }, {
        $set: {
          parent: dataTarget._id,
          level: l,
          position: -1,
          sectionLabel: GV.nodeCtrl.generateSectionLabel(
                          dataTarget.sectionLabel,
                          dataTarget.position
                        )
        }
      }, null, function() {
        GV.nodeCtrl.updatePositions(parent);
      });
    }

    return false;
  },

  /**
   * Drop on root node
   */
  'drop li span.element.root': function(event, tmpl) {
    event.preventDefault();
    event.stopPropagation();

    if ($(event.currentTarget).hasClass('hover'))
      $(event.currentTarget).removeClass('hover');

    var dataTarget = Blaze.getData(event.currentTarget);
    var data = Blaze.getData(GV.dragElement);
    var rootNode = event.currentTarget.parentNode;

    if(data.nodeType === 'media')
      return false;

    // Update the node position
    GV.collections.Nodes.update({
      _id: data._id
    }, {
      $set: {
        parent: dataTarget.tree._id,
        level: 0,
        position: -1,
        sectionLabel: null
      }
    }, null, function() {
      GV.nodeCtrl.updatePositions(rootNode);
    });

    return false;
  },


  // -- Drag over node events --------------------------------------------------
  'dragenter li span.element': function(event, tmpl) {
    event.preventDefault();
    event.stopPropagation();

    // Add class '.hover' it not already present
    var target = $(event.currentTarget);

    if (!target.hasClass('hover'))
      target.addClass('hover');
  },

  'dragleave li span.element': function(event, tmpl) {
    event.preventDefault();
    event.stopPropagation();

    // if the element being hovered has a class '.hover'
    // remove it.
    var target = $(event.currentTarget);

    if (target.hasClass('hover'))
      target.removeClass('hover');
  },


  // -- On drag start of node --------------------------------------------------


  'dragstart li span.element.nodes': function(event, tmpl) {

    event.stopPropagation();

    // Store the node that is being dragged for a
    // later reference.
    GV.dragElement = event.currentTarget;

    // Unselect all selected nodes
    $('li span').removeClass('selected');

    // Select the node that is being dragged.
    $(event.currentTarget).addClass('selected');
  },

  'dragstart li span.element.root': function(event, tmpl) {
    event.preventDefault();
    event.stopPropagation();
  },


  // -- Hide/unhide node events ------------------------------------------------

  'click .hide-node, dblclick .hide-node': function(event, tmpl) {
    event.stopPropagation();

    GV.nodeCtrl.toggleVisibility(GV.collections.Nodes, this._id, false);
  },

  'click .show-node, dblclick .show-node': function(event, tmpl) {
    event.stopPropagation();

    GV.nodeCtrl.toggleVisibility(GV.collections.Nodes, this._id, true);

    Meteor.defer(function() {
      $('li.node span').removeClass('selected');

      var el = $("li.root li.node[data-id='" + Session.get('nodeInFocus') + "']").find("> span");

      if (el && el.length)
        el.addClass('selected');
    });
  },

  'click .hide-root, dblclick .hide-root': function(event, tmpl) {
    event.stopPropagation();

    GV.nodeCtrl.toggleVisibility(GV.collections.Documents, this.tree._id, false);
  },

  'click .show-root, dblclick .show-root': function(event, tmpl) {
    event.stopPropagation();

    GV.nodeCtrl.toggleVisibility(GV.collections.Documents, this.tree._id, true);
  },


  // -- Click on nodes ---------------------------------------------------------


  // Selects a node on regular mouse click
  'click li.root li span.element': function(event, tmpl) {
    event.preventDefault();

    var elData = Blaze.getData(event.currentTarget);

    if (Session.get('isMoveMode') === true) {
      Session.set('movePopoverX', event.pageX - 80 + "px");
      Session.set('movePopoverY', event.pageY - 90 + "px");
      Session.set('showMovePopover', elData._id);
    } else {
      Session.set('inlineEditNode', null);

      // "Unselect" all selected nodes
      $('li span').removeClass('selected');

      // Style the current selected node.
      $(event.currentTarget).addClass('selected');

      GV.nodeCtrl.openNode(elData);
    }
  },

  // Selects root node on regular mouse click
  'click li.root > span.element': function(event, tmpl) {

    var id = Session.get('mainDocument');

    if (Session.get('isMoveMode') === true) {
      Session.set('movePopoverX', event.pageX - 53 + "px");
      Session.set('movePopoverY', event.pageY - 74 + "px");
      Session.set('showMovePopover', id);
    } else {

      // "Unselect" all selected nodes
      $('li span').removeClass('selected');

      // Style the current selected node.
      $(event.currentTarget).addClass('selected');

      GV.tabs.setDummyTab(null);

      Session.set('inlineEditNode', null);
      Session.set('nodeInFocus', Session.get('mainDocument'));
      Session.set("uploadStopped", false);
      Session.set("file", null);
      Session.set('showNodeForm', false);
      Session.set('showMediaNodesView', true);
    }
  },

  // Opens a tab if double click on a node
  'dblclick li span.element': function(event, tmpl) {

    var data = Blaze.getData(event.currentTarget);

    // Adds a tab
    if (typeof data._id !== "undefined") {
      GV.tabs.addTab(data._id);
    }
  },

  // On right click on node
  'mousedown li span.element': function(event, tmpl) {

    if (event.which === 3) {
      // "Unselect" all selected nodes
      $('li span').removeClass('selected');

      // Style the current selected node.
      $(event.currentTarget).addClass('selected');
    }
  }
});

Template.MovePopover.events({

  'click .apply-move': function(event, tmpl) {

    var selected = GV.selectedCtrl.getSelected("mediaNodeView");
    var nodeElement = $("[data-id='" + Session.get('showMovePopover') + "']");

    var elData = Blaze.getData(nodeElement[0]);

    if (selected.length) {
      GV.nodeCtrl.moveNodes(elData._id, selected, "mediaNodeView", {
        title: "Flytting vellykket",
        text: "Informasjonselementene er nå flyttet til <b>" + elData.prevSection +
          " " + (elData.title || "Uten navn") + "</b>"
      });
    }

    Session.set('isMoveMode', false);
    Session.set('showMovePopover', false);
  },

  'click .dismiss-move': function() {
    Session.set('isMoveMode', false);
    Session.set('showMovePopover', false);
  }

});
