////////////////////////////////////////////////////////////////////////////////
// Node Controller
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

GV.nodeCtrl = {

  /**
   * NodeLevel: deleteNode
   * parameter: _id (node collection id)
   * description: recursively deletes all children
   * from a node in a post-order manner
   */
  deleteNode: function(prevNode, template) {

    if (typeof prevNode === "string")
      prevNode = GV.collections.Nodes.findOne({
        _id: prevNode
      });

    var nodeId = prevNode._id;
    var fileId = prevNode.fileId;

    var nodes = GV.collections.Nodes.find({
      parent: nodeId
    }).fetch();

    nodes.forEach(function(node) {
      GV.nodeCtrl.deleteNode(node);
    });

    // Remove the tab
    GV.tabs.removeTab(nodeId);

    // Remove the node
    GV.collections.Nodes.remove({
      _id: nodeId
    }, function(error) {

      if (fileId) {
        GV.collections.Files.remove({
          _id: fileId
        }, function(error) {

          // Remove the reference from the document
          GV.collections.Documents.update({
            _id: Session.get('mainDocument')
          }, {
            $pull: {
              children: nodeId,
              fileIds: fileId
            }
          }, function(error) {
            if (error) {
              Notifications.warn('Feil', error.message);
            }

            // update positions
            if (template)
              GV.nodeCtrl.updatePositions(template);
          });
        });
      } else {
        // Remove the reference from the document
        GV.collections.Documents.update({
          _id: Session.get('mainDocument')
        }, {
          $pull: {
            children: nodeId
          }
        }, function(error) {
          if (error) {
            Notifications.warn('Feil', error.message);
          }

          // update positions
          if (template)
            GV.nodeCtrl.updatePositions(template);
        });
      }
    });
  },

  getSection: function(prevSection, prevNodePos) {
    if (prevSection)
      return prevSection + "." + (prevNodePos + 1);
    else
      return prevNodePos + 1;
  },

  /**
   * Generates a section label for the next child
   */
  generateSectionLabel: function(parentLabel, position) {
    parentLabel = parentLabel ? parentLabel + "." : "";

    if (position >= 0)
      return parentLabel + (position + 1);
    else
      return null;
  },

  /**
   * Opens a node given data
   */
  openNode: function(elData) {
    if (elData && elData._id) {
      GV.tabs.setDummyTab(elData._id);
      Session.set('nodeInFocus', elData._id);
      Router.current().subscribe('fileByNode', elData._id);
      Session.set("file", null);
      Session.set("uploadStopped", false);

      if (elData.nodeType === "chapter") {

        if (elData.title || elData.description) {
          Session.set('showNodeForm', false);
        } else {
          Session.set('showNodeForm', true);

          Meteor.defer(function() {
            $("input[name='title']").tooltip({
              'placement': 'top',
              'title':  'Navn på kapittel mangler og trengs for å få god ' +
                        'oversikt i kapittelstrukturen.'
            }).tooltip('show');
          });
        }

        Session.set('showMediaNodesView', true);
      } else {
        Session.set('showNodeForm', true);

        if (!elData.description) {
          Meteor.defer(function() {
            $("textarea[name='description']").tooltip({
              'placement': 'bottom',
              'title': 'Informasjonselement mangler'
            }).tooltip('show');
          });
        }

        if (!elData.title) {
          Meteor.defer(function() {
            $("input[name='title']").tooltip({
              'placement': 'top',
              'title':  'Navn på informasjonselement mangler og bør fylles ut ' +
                        'for å kunne få fullt utbytte av nøkkelord- og kildevisningen.'
            }).tooltip('show');
          });
        }
      }

      // Reset the form because of no update on tags field on data change.
      AutoForm.resetForm("update-node-form");
      Meteor.defer(function() {
        $('.node-detail-view').scrollTop(0);
      });
    }
  },

  /**
   * Updates the positions in the DB to reflect the current position in the client.
   */
  updatePositions: function(node) {
    $(node).find('> ul').each(function(index) {
      var elData = Blaze.getData(this);

      GV.collections.Nodes.update({
        _id: elData._id
      }, {
        $set: {
          position: index
        }
      });
    });
  },

  insertNodeOfType: function(data, type, t, noRedirect) {

    if (data.tree)
      data = data.tree;

    if (data && data._id) {
      // Insert a node at the given branch
      GV.collections.Nodes.insert({
          parent: data._id,
          level: data.level + 1 || 0,
          sectionLabel: data.sectionLabel ?
                        GV.nodeCtrl.generateSectionLabel(data.sectionLabel, data.position) :
                        null,
          userId: data.userId,
          lastChanged: new Date(),
          position: -1,
          nodeType: type
        },
        function(error, nodeId) {
          if (!error) {

            // Add the created node into children array of main document
            GV.collections.Documents.update({
              _id: Session.get('mainDocument')
            }, {
              $addToSet: {
                children: nodeId
              }
            });

            if (type === "chapter" ||
                Session.get('mainDocument') !== data._id.toString() &&
                (type === "media" && Session.get("showMediaNodes")))
              GV.collections.Nodes.update({
                _id: data._id
              }, {
                $set: {
                  collapsed: false
                }
              });

            // Subscribe on the newly created node
            Router.current().subscribe('nodeById', nodeId, {
              onReady: function() {
                Meteor.defer(function() {
                  if (t)
                    GV.nodeCtrl.updatePositions(t.parentNode);

                  $('li.node span').removeClass('selected');
                  var el = $("li.root li.node[data-id='" + nodeId + "']").find("> span");

                  if (el && el.length)
                    el.addClass('selected');

                  if (!noRedirect) {
                    GV.tabs.setDummyTab(nodeId);
                    Session.set('nodeInFocus', nodeId);
                  } else {
                    Session.set("inlineEditNode", nodeId);

                    Meteor.defer(function() {
                      var container = $(".node-detail-view");

                      container.animate({
                        scrollTop:  $('.table-row[data-id="' + nodeId + '"]')
                                    .offset().top - container.offset().top +
                                    container.scrollTop() - 25
                      }, 300);
                    });
                  }
                });
              },
              onError: function() {
                console.log("onError", arguments);
              }
            });
          }
        });
    }
  },

  moveNodes: function(parentId, ids, table, options) {

    ids.forEach(function(id) {
      GV.collections.Nodes.update({
        _id: id
      }, {
        $set: {
          parent: parentId
        }
      });
    });

    if (table)
      GV.selectedCtrl.reset(table);

    if (options)
      Notifications.success(options.title, options.text);
  },

  removeNodeCallback: function(result, options, id) {
    if (result) {

      if (id) {
        GV.nodeCtrl.deleteNode(id);
      } else {
        GV.nodeCtrl.deleteNode(Session.get('nodeInFocus'));

        // Set the main document in focus
        Session.set('nodeInFocus', Session.get('mainDocument'));
      }

      Notifications.success(options.title, options.text);
    }
  },

  removeNodesCallback: function(result, options, ids, table) {
    if (result) {

      ids.forEach(function(id) {
        GV.nodeCtrl.deleteNode(id);
      });

      if (table)
        GV.selectedCtrl.reset(table);

      Notifications.success(options.title, options.text);
    }
  },

  removeFileCallback: function(result, fileObj, options) {
    if (result) {

      var node = fileObj.nodeId;
      var doc = fileObj.docId;
      var file = fileObj._id;

      // Remove the file
      GV.collections.Files.remove({
        _id: file
      }, function(error) {
        if (error) {
          Notifications.warn('Feil', error.message);
        } else {

          // Remove the reference in Node
          GV.collections.Nodes.update({
            _id: node
          }, {
            $set: {
              fileId: null
            }
          }, {}, function(error) {
            if (error)
              Notifications.warn('Feil', error.message);
            else {

              // remove the reference in main document
              GV.collections.Documents.update({
                _id: doc
              }, {
                $pull: {
                  fileIds: file
                }
              }, null, function(error) {
                if (error)
                  Notifications.warn('Feil', error.message);
                else {
                  Notifications.success(options.title, options.text);
                }
              });
            }
          });
        }
      });
    }
  },

  /**
   * Sets a node to collapsed mode.
   */
  toggleVisibility: function(collection, id, visible) {
    collection.update({
      _id: id
    }, {
      $set: {
        collapsed: !visible
      }
    });
  },

  /**
   * Checks whether a drop target is inside the dragged node itself
   */
  insideItself: function(drag, target) {

    var dragSectionLabel = drag.prevSection;
    var targetSectionLabel = target.prevSection;

    if (!targetSectionLabel)
      return false;

    var dragLabels = dragSectionLabel.split(".");
    var targetLabels = targetSectionLabel.split(".");

    if (targetLabels >= dragLabels) {
      var numEquals = 0;

      for (var i = 0; i < dragLabels.length; i++) {

        if (dragLabels[i] === targetLabels[i]) {
          numEquals++;
        }
      }

      if (numEquals === dragLabels.length) {
        Notifications.error(
          "Feil ved flytting av kapittelelement",
          "Du kan ikke flytte et kapittelelement inn i sitt eget deltre."
        );
        return true;
      }
    }

    return false;

  }

};
