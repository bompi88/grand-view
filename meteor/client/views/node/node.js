////////////////////////////////////////////////////////////////////////////////
// NodeLevel Template
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

// -- Helpers ------------------------------------------------------------------


/**
* NodeLevel: deleteNode
* parameter: _id (node collection id)
* description: recursively deletes all children
* from a node in a post-order manner
*/
deleteNode = function(_id, template) {

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

      // update positions
      if(template)
        updatePositions(template);
    });

  });
};

getSection = function(node, prevNodePos) {
  // var label = "";

  // if(this.level > 0) {
  //   if(node.prevSection) {
  //     label = label + node.prevSection + ".";
  //   }

  // }
  // label = label + "" + (prevNodePos + 1);

  return "" + (prevNodePos + 1) + "." + (node.node_index + 1);
};


// -- Template helpers ---------------------------------------------------------


Template.NodeLevel.helpers({

  /**
   * Returns true if the node has been collapsed, and the children should be hidden.
   */
  isCollapsed: function() {
    return this.collapsed || this.collapsed;
  },

  /**
   * Returns true if the node has children.
   */
  hasChildren: function() {
    return GV.collections.Nodes.find({parent: this._id}).count() > 0;
  },

  /**
   * Returns the children of the current node.
   */
  children: function() {
    return GV.collections.Nodes.find({ parent: this._id }, { sort: { position: 1 }}).map(function(node, index) {
      node.node_index = index;
      return node;
    });
  },

  getContext: function(prevNodePos) {
    console.log("POS");
    console.log(prevNodePos);
    var context = _.extend(this, {
      prevSection: getSection(this, prevNodePos)
    });

    return context;
  },
  /**
   * Returns a combined section label by merging the parents label and the node
   * position value. This is the readable structure notation.
   */
  // getSectionLabel: function() {
  //   var label = "";

  //   if(this.sectionLabel)
  //     label = label + this.sectionLabel;

  //   if(this.position >= 0) {

  //     if(this.level == 0)
  //       label = label + (this.position + 1);
  //     else
  //       label = label + "." + (this.position + 1);
  //   }

  //   return label;
  // },

  getSectionLabel: function() {
    console.log(this)

    if(this.prevSection)
      return this.prevSection + "." + (this.node_index + 1);
    else
      return this.node_index + 1;
  },

  /**
   * Returns true if this node should have a drop zone beneath itself.
   */
  hasBottomSlot: function() {
    return this.node_index == (GV.collections.Nodes.find({ parent: this.parent }).count() - 1);
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

        if(elData && (elData.level > 3)) {
          Notifications.warn('For stort tre', 'Det er for mange underkategorier, prøv heller å omstrukturere litt i hierarkiet.');
          return;
        } else {
          if(elData && elData._id) {

            var node = {
              parent: elData._id,
              title: "Ingen tittel",
              level: elData.level + 1,
              sectionLabel: generateSectionLabel(elData.sectionLabel, elData.position),
              userId: elData.userId,
              lastChanged: new Date(),
              position: -1
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

                Router.current().subscribe('nodeById', nodeId, {
                  onReady: function () {
                    Meteor.defer(function() {
                      updatePositions(t.parentNode);
                    });
                  },
                  onError: function () { console.log("onError", arguments); }
                });
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

                    deleteNode(elData._id, t.parentNode.parentNode.parentNode);

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
