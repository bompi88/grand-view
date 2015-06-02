////////////////////////////////////////////////////////////////////////////////
// NodeLevel Template
////////////////////////////////////////////////////////////////////////////////


// -- Helpers ------------------------------------------------------------------


/**
* NodeLevel: deleteNode
* parameter: _id (node collection id)
* description: recursively deletes all children
* from a node in a post-order manner
*/
deleteNode = function(_id) {

  var nodes = GV.collections.Nodes.find({parent: _id}).fetch();

  nodes.forEach(function(node) {
    deleteNode(node._id);
  });

  // Remove the node
  GV.collections.Nodes.remove({_id: _id}, function(error) {

    // Remove the tab
    GV.tabs.removeTab(_id);

    // Remove the reference from the document
    GV.collections.Documents.update({
      _id: Session.get('mainDocument')
    },
    {
      $pull: {
        children: _id
      }
    }, function(error) {
      if(error) {
        Notifications.warn('Feil', error.message);
      }
    });

  });
};


// -- Template helpers ---------------------------------------------------------


Template.NodeLevel.helpers({

  hasChildren: function() {
    return GV.collections.Nodes.find({parent: this._id}).count() > 0;
  },

  children: function() {
    return GV.collections.Nodes.find({parent: this._id});
  }

});


// -- Template on render -------------------------------------------------------


Template.NodeLevel.rendered = function() {

  var self = this;

  $('.tree li.node.root li.node span').contextMenu('right-click-menu', {
    bindings: {

      // Add node button
      'add-node': function(t) {
        var elData = UI.getData(t);

        if(elData && (elData.level > 4)) {
          Notifications.warn('For stort tre', 'Det er for mange underkategorier, prøv heller å omstrukturere litt i hierarkiet.');
          return;
        } else {
          if(elData && elData._id) {

            var node = {
              parent: elData._id,
              title: "Ingen tittel",
              level: elData.level + 1,
              sectionLabel: elData.sectionLabel + "." + (elData.level),
              userId: elData.userId,
              lastChanged: new Date()
            };

            GV.collections.Nodes.insert(node, function(error, nodeId) {
              if(!error) {
                GV.collections.Documents.update({
                  _id: Session.get('mainDocument')
                },
                {
                  $addToSet: {
                    children: nodeId
                  }
                });

                Router.current().subscribe('nodeById', nodeId);
              }
            });
          }
        }
      },

      // Delete button
      'delete-node': function(t) {
        var elData = UI.getData(t);

        if(elData && elData._id) {
          var confirmationPrompt = {
            title: "Bekreftelse på slettingen",
            message: 'Er du sikker på at du vil slette referansen? NB: Vil slette alle underkategorier til referansen!',
            buttons: {
              cancel: {
                label: "Nei"
              },
              confirm: {
                label: "Ja",
                callback: function(result) {
                  if(result) {

                    deleteNode(elData._id);
                    // Set the main document in focus
                    Session.set('nodeInFocus', Session.get('mainDocument'));

                    Notifications.success('Sletting fullført', 'Referansen ble slettet fra systemet.');
                  }
                }
              }
            }
          }
          bootbox.dialog(confirmationPrompt);
        }
      },

      // Edit button
      'edit-node': function(t) {
        var elData = UI.getData(t);

        if(elData && elData._id) {
          GV.tabs.addTab(elData._id);
          Session.set('nodeInFocus', elData._id);
        }
      }

    }
  });
};
