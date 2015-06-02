////////////////////////////////////////////////////////////////////////////////
// Tree template logic
////////////////////////////////////////////////////////////////////////////////

// The selected element to drag
var dragElement;

// -- Tree Helpers -------------------------------------------------------------


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


// -- Tree Template helpers ----------------------------------------------------


Template.Tree.helpers({

  treeItems: function() {
    return this.tree && GV.collections.Nodes.find({parent: this.tree._id}) || [];
  },

  hasChildren: function() {
    return this.tree && GV.collections.Nodes.find({parent: this.tree._id}).count() > 0;
  },

  documentTitle: function() {
    return this.tree && this.tree.title || "Uten tittel";
  }

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
            level: 1,
            sectionLabel: 1,
            userId: elData.tree.userId,
            lastChanged: new Date()
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
            Meteor.subscribe('nodeById', nodeId);
          });
        }
      },

      // Delete button
      'delete-node': function(t) {
        Notifications.error('Sletting feilet', 'Kan ikke slette rotnoden.', { timeout: GV.timeout });
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


  'drop div.slot.slot-top, drop div.slot.slot-bottom': function (event, tmpl) {
    if(event.preventDefault) { event.preventDefault(); }
    if(event.stopPropagation) { event.stopPropagation(); }

    $(event.currentTarget).removeClass("slot-visible");

    var dataTarget = UI.getElementData(event.currentTarget.parentNode.parentNode.parentNode);
    var data = UI.getElementData(dragElement.parentNode);

    // Update the node position
    GV.collections.Nodes.update({
      _id: data._id
    },
    {
      $set: {
        parent: dataTarget._id,
        level: dataTarget.level + 1,
        sectionLabel: dataTarget.sectionLabel + "." + (dataTarget.level)
      }
    });

    return false;
  },

  'drop li span.element': function(event, tmpl) {
    if(event.preventDefault) { event.preventDefault(); }
    if(event.stopPropagation) { event.stopPropagation(); }

    if ($(event.currentTarget).hasClass('hover'))
      $(event.currentTarget).removeClass('hover');

    var dataTarget = UI.getElementData(event.currentTarget);
    var data = UI.getElementData(dragElement);

    // Update the node position
    GV.collections.Nodes.update({
      _id: data._id
    },
    {
      $set: {
        parent: dataTarget._id,
        level: dataTarget.level + 1,
        sectionLabel: dataTarget.sectionLabel + "." + (dataTarget.level)
      }
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


  'dragstart li span.element': function(event, tmpl) {

    if(event.stopPropagation) { event.stopPropagation(); }

    // Store the node that is being dragged for a
    // later reference.
    dragElement = event.currentTarget;

    // Unselect all selected nodes
    $('li span').removeClass('selected');

    // Select the node that is being dragged.
    $(event.currentTarget).addClass('selected');
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
    }
  },

  // Selects a node on regular mouse click
  'click li.root > span.element': function(event, tmpl) {

    // "Unselect" all selected nodes
    $('li span').removeClass('selected');

    // Style the current selected node.
    $(event.currentTarget).addClass('selected');

    GV.tabs.setDummyTab(null);

    Session.set('nodeInFocus', Session.get('mainDocument'));
  },

  // Opens a tab if double click on a node
  'dblclick li span.element': function(event, tmpl) {

    var data = Blaze.getData(event.currentTarget);

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
