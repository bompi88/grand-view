////////////////////////////////////////////////////////////////////////////////
// Tree template logic
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


// The selected element to drag
var dragElement;

// -- Tree Helpers -------------------------------------------------------------


/**
 * Sets a node to collapsed mode.
 */
var toggleVisibility = function(collection, id, visible) {
  collection.update({
    _id: id
  },
  {
    $set: {
      collapsed: !visible
    }
  });
};

/**
 * Generates a section label for the next child
 */
generateSectionLabel = function(parentLabel, position) {
  parentLabel = parentLabel ? parentLabel + "." : "";

  if(position >= 0)
    return parentLabel + (position + 1);
  else
    return null;
}

/**
 * Updates the positions in the DB to reflect the current position in the client.
 */
updatePositions = function(node) {
  $(node).find('> ul').each(function(index) {
    var elData = UI.getData(this);

    GV.collections.Nodes.update({ _id: elData._id }, { $set: { position: index }});
  });
}


// -- Tree Template helpers ----------------------------------------------------


Template.Tree.helpers({

  /**
   * The nodes of this tree.
   */
  treeItems: function() {
    return this.tree && GV.collections.Nodes.find({parent: this.tree._id}, { sort: { position: 1 }}).map(function(node, index) {
      node.node_index = index;
      return node;
    });;
  },

  /**
   * Returns true if the tree contains nodes.
   */
  hasChildren: function() {
    return this.tree && GV.collections.Nodes.find({parent: this.tree._id}).count() > 0;
  },

  /**
   * Returns the title if defined, else returns a dummy title.
   */
  documentTitle: function() {
    return this.tree && this.tree.title || "Uten tittel";
  }

  // getContext: function() {
  //   return _.extend(this, {
  //     prevSection: "" + (this.node_index + 1)
  //   });
  // }

});


// -- Tree On Render -----------------------------------------------------------


Template.Tree.rendered = function () {

  var self = this;

  // Create right click buttons when right clicking on root node
  $('.tree li.node.root span').contextMenu('right-click-menu', {
    bindings: {

      // Add node button
      'add-node': function(t) {
        var elData = UI.getData(t);

        if(elData) {
          // Insert a node at the given branch
          GV.collections.Nodes.insert({
            parent: elData.tree._id,
            title: "Ingen tittel",
            level: 0,
            sectionLabel: null,
            userId: elData.tree.userId,
            lastChanged: new Date(),
            position: -1
          },
          function(error, nodeId) {
            if(error) {
              Notifications.error(error);
            }

            // Add the created node into children array of main document
            GV.collections.Documents.update({
              _id: Session.get('mainDocument')
            },
            {
              $addToSet: {
                children: nodeId
              }
            });

            // Subscribe on the newly created node
            Router.current().subscribe('nodeById', nodeId, {
              onReady: function () {
                Meteor.defer(function() {
                  updatePositions(t.parentNode);
                });
              },
              onError: function () { console.log("onError", arguments); }
            });
          });
        }
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

  // -- Prevent default behaviour on dragover events ---------------------------

  // Do NOT remove this!! This snippet necessary
  // for the drop event to work.
  'dragover li span.element': function(event, tmpl) {
      if(event.preventDefault) { event.preventDefault(); }
  },

  // Do NOT remove this!! This snippet necessary
  // for the drop event to work.
  'dragover div.slot.slot-top': function(event, tmpl) {
      if(event.preventDefault) { event.preventDefault(); }
  },

  // Do NOT remove this!! This snippet necessary
  // for the drop event to work.
  'dragover div.slot.slot-bottom': function(event, tmpl) {
      if(event.preventDefault) { event.preventDefault(); }
  },


  // -- Toggle drop slot visibility events -------------------------------------


  'dragenter div.slot': function (event, tmpl) {
      if(event.preventDefault) { event.preventDefault(); }
      if(event.stopPropagation) { event.stopPropagation(); }

      $(event.currentTarget).addClass("slot-visible");
  },

  'dragleave div.slot': function (event, tmpl) {
      if(event.preventDefault) { event.preventDefault(); }
      if(event.stopPropagation) { event.stopPropagation(); }

      $(event.currentTarget).removeClass("slot-visible");
  },


  // -- Drop events ------------------------------------------------------------

  'drop li.node > div.slot.slot-top, drop li.node > div.slot.slot-bottom': function (event, tmpl) {
    if(event.preventDefault) { event.preventDefault(); }
    if(event.stopPropagation) { event.stopPropagation(); }

    var slot = event.currentTarget;
    var target = slot.parentNode.parentNode;
    var dragNode = dragElement.parentNode.parentNode;
    var prevNode = $(dragNode).parent().parent();

    $(slot).removeClass("slot-visible");

    var parent = target.parentNode;
    var dataTarget = UI.getData(parent);
    var data = UI.getData(dragElement.parentNode);
    var position = $(parent).find("> ul").index(target);

    var l;
    if(dataTarget.level >= 0)
      l = dataTarget.level + 1;
    else
      l = 0;


    console.log("dataTarget")
    console.log(dataTarget)

    console.log("parent of drag")
    console.log(prevNode)
    console.log("EVENT:");
    console.log(event.currentTarget.className);
    console.log("parent:");
    console.log(parent);
    console.log("target:");
    console.log(target);
    console.log("dragNode:");
    console.log(dragNode);
    console.log("data");
    console.log(data);
    console.log("position:");
    console.log(position);
    console.log("level:");
    console.log(l);

    if(slot.className === "slot slot-top") {
      $(dragNode).insertBefore($(target));
      console.log("top");
    } else if(slot.className === "slot slot-bottom") {
      $(dragNode).insertAfter($(target));
      console.log("bottom");
    }

    updatePositions(parent);

    // Update the node position
    GV.collections.Nodes.update({
      _id: data._id
    },
    {
      $set: {
        parent: dataTarget && dataTarget._id || dataTarget.tree._id,
        level: l,
        sectionLabel: generateSectionLabel(dataTarget && dataTarget.sectionLabel, dataTarget && dataTarget.position)
      }
    });

    updatePositions(parent);
    updatePositions(prevNode);
    // updatePositions(parent);

    return false;
  },

  /**
   * Drop on children nodes
   */
  'drop li span.element.nodes': function(event, tmpl) {
    if(event.preventDefault) { event.preventDefault(); }
    if(event.stopPropagation) { event.stopPropagation(); }

    if ($(event.currentTarget).hasClass('hover'))
      $(event.currentTarget).removeClass('hover');

    if($(event.currentTarget)[0] == $(dragElement)[0])
      return false;



    console.log(event.currentTarget)
    console.log(dragElement);

    var dataTarget = UI.getData(event.currentTarget);
    var data = UI.getData(dragElement);
    var parent = event.currentTarget.parentNode;

    var l = dataTarget.level + 1;

    var sectionsDragEl = data.sectionLabel && data.sectionLabel.split(".");
    var sectionsTargetEl = dataTarget.sectionLabel && dataTarget.sectionLabel.split('.');

    console.log("OVER")
    console.log(sectionsDragEl);
    console.log(sectionsTargetEl);
    console.log("UNDER")

    if(sectionsTargetEl && (sectionsTargetEl.length > sectionsDragEl.length) && sectionsDragEl.length > 0) {
      var numEquals = 0;

      for(var i = 0; i < sectionsTargetEl.length; i++) {

        if(sectionsDragEl[i]) {
          if(sectionsDragEl[i] === sectionsTargetEl[i])
            numEquals++;
        } else {
          break;
        }

      }

      if(numEquals == sectionsDragEl.length)
        return false;
    }

    // Update the node position
    GV.collections.Nodes.update({
      _id: data._id
    },
    {
      $set: {
        parent: dataTarget._id,
        level: l,
        position: -1,
        sectionLabel: generateSectionLabel(dataTarget.sectionLabel, dataTarget.position)
      }
    }, null, function() {
      updatePositions(parent);
    });

    return false;
  },

/**
 * Drop on root node
 */
'drop li span.element.root': function(event, tmpl) {
    if(event.preventDefault) { event.preventDefault(); }
    if(event.stopPropagation) { event.stopPropagation(); }

    if ($(event.currentTarget).hasClass('hover'))
      $(event.currentTarget).removeClass('hover');

    var dataTarget = UI.getData(event.currentTarget);
    var data = UI.getData(dragElement);
    var rootNode = event.currentTarget.parentNode;

    // Update the node position
    GV.collections.Nodes.update({
      _id: data._id
    },
    {
      $set: {
        parent: dataTarget.tree._id,
        level: 0,
        position: -1,
        sectionLabel: null
      }
    }, null, function() {
      updatePositions(rootNode);
    });

    return false;
  },


  // -- Drag over node events --------------------------------------------------


  'dragenter li span.element, dragleave li span.element': function(event, tmpl) {
    if(event.preventDefault) { event.preventDefault(); }
    if(event.stopPropagation) { event.stopPropagation(); }

    // Add class '.hover' it not already present
    var target = $(event.currentTarget);

    if (!target.hasClass('hover'))
      target.addClass('hover');
  },

  'dragleave li span.element': function(event, tmpl) {
    if(event.preventDefault) { event.preventDefault(); }
    if(event.stopPropagation) { event.stopPropagation(); }

    // if the element being hovered has a class '.hover'
    // remove it.
    var target = $(event.currentTarget);

    if (target.hasClass('hover'))
      target.removeClass('hover');
  },


  // -- On drag start of node --------------------------------------------------


  'dragstart li span.element.nodes': function(event, tmpl) {

    if(event.stopPropagation) { event.stopPropagation(); }

    // Store the node that is being dragged for a
    // later reference.
    dragElement = event.currentTarget;

    // Unselect all selected nodes
    $('li span').removeClass('selected');

    // Select the node that is being dragged.
    $(event.currentTarget).addClass('selected');
  },

  'dragstart li span.element.root': function(event, tmpl) {
    if(event.preventDefault) { event.preventDefault(); }
    if(event.stopPropagation) { event.stopPropagation(); }
  },


  // -- Hide/unhide node events ------------------------------------------------

  'click .hide-node': function(event, tmpl) {
    toggleVisibility(GV.collections.Nodes, this._id, false);
  },

  'click .show-node': function(event, tmpl) {
    toggleVisibility(GV.collections.Nodes, this._id, true);
  },

  'click .hide-root': function(event, tmpl) {
    toggleVisibility(GV.collections.Documents, this.tree._id, false);
  },

  'click .show-root': function(event, tmpl) {
    toggleVisibility(GV.collections.Documents, this.tree._id, true);
  },


  // -- Click on nodes ---------------------------------------------------------


  // Selects a node on regular mouse click
  'click li.root li span.element': function(event, tmpl) {

    // "Unselect" all selected nodes
    $('li span').removeClass('selected');

    // Style the current selected node.
    $(event.currentTarget).addClass('selected');

    var elData = UI.getData(event.currentTarget);

    if(elData && elData._id) {
      GV.tabs.setDummyTab(elData._id);
      Session.set('nodeInFocus', elData._id);
      Router.current().subscribe('fileByNode', elData._id);
      Session.set("file", null);
      Session.set("uploadStopped", false);
    }
  },

  // Selects root node on regular mouse click
  'click li.root > span.element': function(event, tmpl) {

    // "Unselect" all selected nodes
    $('li span').removeClass('selected');

    // Style the current selected node.
    $(event.currentTarget).addClass('selected');

    GV.tabs.setDummyTab(null);

    Session.set('nodeInFocus', Session.get('mainDocument'));
    Session.set("uploadStopped", false);
    Session.set("file", null);
  },

  // Opens a tab if double click on a node
  'dblclick li span.element': function(event, tmpl) {

    var data = UI.getData(event.currentTarget);

    // Adds a tab
    if(typeof data._id !== "undefined") {
      GV.tabs.addTab(data._id);
    }
  },

  // On right click on node
  'mousedown li span.element': function(event, tmpl) {

    if(event.which == 3) {
      // "Unselect" all selected nodes
      $('li span').removeClass('selected');

      // Style the current selected node.
      $(event.currentTarget).addClass('selected');
    }
  }
});
