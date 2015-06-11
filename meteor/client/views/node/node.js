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
deleteNode = function(prevNode, template) {

  if(typeof prevNode === "string")
    prevNode = GV.collections.Nodes.findOne({ _id: prevNode });

  var nodeId = prevNode._id;
  var fileId = prevNode.fileId;

  var nodes = GV.collections.Nodes.find({parent: nodeId}).fetch();

  nodes.forEach(function(node) {
    deleteNode(node);
  });

  // Remove the tab
  GV.tabs.removeTab(nodeId);

  // Remove the node
  GV.collections.Nodes.remove({ _id: nodeId }, function(error) {

    if(fileId) {
      GV.collections.Files.remove({ _id: fileId }, function(error) {

        // Remove the reference from the document
        GV.collections.Documents.update({
          _id: Session.get('mainDocument')
        },
        {
          $pull: {
            children: nodeId,
            fileIds: fileId
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
    } else {
      // Remove the reference from the document
      GV.collections.Documents.update({
        _id: Session.get('mainDocument')
      },
      {
        $pull: {
          children: nodeId
        }
      }, function(error) {
        if(error) {
          Notifications.warn('Feil', error.message);
        }

        // update positions
        if(template)
          updatePositions(template);
      });
    }
  });
};

getSection = function(prevSection, prevNodePos) {
  // var label = "";

  // if(this.level > 0) {
  //   if(node.prevSection) {
  //     label = label + node.prevSection + ".";
  //   }

  // }
  // label = label + "" + (prevNodePos + 1);
  if(prevSection)
    return prevSection + "." + (prevNodePos + 1);
  else
    prevNodePos + 1;

};


insertNodeOfType = function(data, type, t) {
  if(type == "chapter" && data && (data.level > 2)) {
    Notifications.warn('For stort tre', 'Det er for mange underkategorier, prøv heller å omstrukturere litt i hierarkiet.');
    return;
  } else {
    if(data && data._id) {

      var node = {
        parent: data._id,
        title: "Ingen tittel",
        level: data.level + 1,
        sectionLabel: generateSectionLabel(data.sectionLabel, data.position),
        userId: data.userId,
        lastChanged: new Date(),
        position: -1,
        nodeType: type
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
    return GV.collections.Nodes.find({ parent: this._id }, { sort: { nodeType: 1, position: 1  }}).map(function(node, index) {
      node.node_index = index;
      return node;
    });
  },

  getContext: function(options) {

    var context = _.extend(this, {
      prevSection: getSection(options.hash.prevSection, this.node_index)
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
    return this.prevSection;
    // if(this.prevSection)
    //   return this.prevSection + "." + (this.node_index + 1);
    // else
    //   return this.node_index + 1;
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

  $('.tree li.node.root li.node span').contextMenu('right-click-menu-node', {
    bindings: {

      // Add node button
      'add-chapter-node': function(t) {
        var elData = UI.getData(t);

        insertNodeOfType(elData, "chapter", t);
      },

      // Add node button
      'add-media-node': function(t) {
        var elData = UI.getData(t);

        insertNodeOfType(elData, "media", t);
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

                    deleteNode(elData, t.parentNode.parentNode.parentNode);

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
