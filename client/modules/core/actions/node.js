////////////////////////////////////////////////////////////////////////////////
// Node Actions
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

export default {

  handleClick({ Meteor, LocalState }, node, e) {
    const { _id } = node;
    console.log(node)
    if (e.nativeEvent.which === 1) {
      Meteor.call('document.setSelectedNode', LocalState.get('CURRENT_DOCUMENT'), _id);
      LocalState.set('CURRENT_NODE', _id);
    }
  },

  collapseNode({ Meteor, LocalState, Collections }, { _id }) {
    Collections.Nodes.update({
      _id
    }, {
      $set: {
        isCollapsed: true
      }
    });
  },

  expandNode({ Meteor, LocalState, Collections }, { _id }) {
    Collections.Nodes.update({
      _id
    }, {
      $set: {
        isCollapsed: false
      }
    });
  },

  setPosition({ Meteor }, { fromPos, toPos, _id, fromParent, toParent }) {
    Meteor.call('updateNodePosition', { fromPos, toPos, _id, fromParent, toParent });
  },

  putIntoChapterNode({ Meteor }, { parent, _id }) {
    Meteor.call('putIntoChapterNode', { parent, _id });
  },

  /**
   * NodeLevel: deleteNode
   * parameter: _id (node collection id)
   * description: recursively deletes all children
   * from a node in a post-order manner
   */
  deleteNode({Nodes, Files, Documents, Notifications}, prevNode, mainDocId, template = false) {
    let parent = prevNode;

    if (typeof parent === 'string') {
      parent = Nodes.findOne({
        _id: parent
      });
    }

    const nodeId = prevNode._id;
    const fileId = prevNode.fileId;

    const nodes = Nodes.find({
      parent: nodeId
    }).fetch();

    nodes.forEach((node) => {
      this.deleteNode(node, mainDocId);
    });

    // Remove the node
    Nodes.remove({
      _id: nodeId
    }, (nodeError) => {
      if (nodeError) {
        throw nodeError;
      }

      if (fileId) {
        Files.remove({
          _id: fileId
        }, (fileError) => {
          if (fileError) {
            throw fileError;
          }

          // Remove the reference from the document
          Documents.update({
            _id: mainDocId
          }, {
            $pull: {
              children: nodeId,
              fileIds: fileId
            }
          }, (error) => {
            if (error) {
              Notifications.warn('Feil', error.message);
            }

            // update positions
            if (template) {
              this.updatePositions(template);
            }
          });
        });
      } else {
        // Remove the reference from the document
        Documents.update({
          _id: mainDocId
        }, {
          $pull: {
            children: nodeId
          }
        }, (error) => {
          if (error) {
            Notifications.warn('Feil', error.message);
          }

          // update positions
          if (template) {
            this.updatePositions(template);
          }
        });
      }
    });
  },

  getSection({}, prevSection, prevNodePos) {
    if (prevSection) {
      return prevSection + '.' + (prevNodePos + 1);
    }
    return prevNodePos + 1;
  },

  /**
   * Generates a section label for the next child
   */
  generateSectionLabel({}, parentLabel, position) {
    const parentNumbering = parentLabel ? parentLabel + '.' : '';

    if (position >= 0) {
      return parentNumbering + (position + 1);
    }

    return null;
  },

  openArtificialNode({LocalState, Meteor}, type, value) {
    const an = { type, value };

    Meteor.subscribe('filesByArtificialNode', an, () => {
      LocalState.set('artificialNode', an);
      LocalState.set('showMediaNodesView', true);
      LocalState.set('nodeInFocus', null);
    });
  },

  /**
   * Opens a node given data
   */
  openNode({LocalState, Meteor, $}, elData) {
    if (elData && elData._id) {
      // TODO: fix tabs?
      // GV.tabs.setDummyTab(elData._id);
      LocalState.set('artificialNode', null);
      LocalState.set('nodeInFocus', elData._id);
      Meteor.subscribe('fileByNode', elData._id);
      LocalState.set('file', null);
      LocalState.set('uploadStopped', false);

      if (elData.nodeType === 'chapter') {

        if (elData.title || elData.description) {
          LocalState.set('showNodeForm', false);
        } else {
          LocalState.set('showNodeForm', true);

          Meteor.defer(() => {
            $('#update-node-form input[name="title"]').tooltip({
              placement: 'top',
              title: 'Navn på kapittel mangler og trengs for å få god ' +
                'oversikt i kapittelstrukturen.'
            }).tooltip('show');
          });
        }

        LocalState.set('showMediaNodesView', true);
      } else {
        LocalState.set('showNodeForm', true);

        if (!elData.description) {
          Meteor.defer(() => {
            $('#update-node-form textarea[name="description"]').tooltip({
              placement: 'bottom',
              title: 'Informasjonselement mangler'
            }).tooltip('show');
          });
        }

        if (!elData.title) {
          Meteor.defer(() => {
            $('#update-node-form input[name="title"]').tooltip({
              placement: 'top',
              title: 'Navn på informasjonselement mangler og bør fylles ut ' +
                'for å kunne få fullt utbytte av nøkkelord- og kildevisningen.'
            }).tooltip('show');
          });
        }
      }

      // Reset the form because of no update on tags field on data change.
      // TODO: reset Formsy form
      // AutoForm.resetForm('update-node-form');
      Meteor.defer(() => {
        $('.node-detail-view').scrollTop(0);
      });
    }
  },

  /**
   * Updates the positions in the DB to reflect the current position in the client.
   */

  // TODO: This is brittle and will not work with React
  updatePositions({Nodes, $}, node) {
    $(node).find('> ul').each((index) => {
      var elData = Blaze.getData(this);

      Nodes.update({
        _id: elData._id
      }, {
        $set: {
          position: index
        }
      });
    });
  },

  insertNodeOfType({ LocalState, Meteor, Nodes, Documents, $ },
    input, type, t, noRedirect, mainDocId) {

    let data = input;

    if (data.tree) {
      data = data.tree;
    }

    if (data && data._id) {

      const pos = Nodes.find({ parent: data._id }).count();

      // Insert a node at the given branch
      Nodes.insert({
        parent: data._id,
        level: data.level + 1 || 0,
        sectionLabel: data.sectionLabel ?
                      this.generateSectionLabel(data.sectionLabel, data.position) :
                      null,
        userId: data.userId,
        lastChanged: new Date(),
        position: pos,
        nodeType: type
      },
      (error, nodeId) => {
        if (!error) {

          // Add the created node into children array of main document
          Documents.update({
            _id: mainDocId
          }, {
            $addToSet: {
              children: nodeId
            }
          });

          if (type === 'chapter' ||
              mainDocId !== data._id.toString() &&
              (type === 'media' && LocalState.get('showMediaNodes'))) {

            Nodes.update({
              _id: data._id
            }, {
              $set: {
                collapsed: false
              }
            });
          }


          // Subscribe on the newly created node
          Meteor.subscribe('nodeById', nodeId, {
            onReady() {
              Meteor.defer(() => {
                if (t) {
                  this.updatePositions(t.parentNode);
                }

                $('li.node span').removeClass('selected');
                var el = $('li.root li.node[data-id="' + nodeId + '"]').find('> span');

                if (el && el.length) {
                  el.addClass('selected');
                }

                if (type === 'chapter') {
                  this.renameNode(nodeId);
                }

                if (!noRedirect) {
                  LocalState.set('nodeInFocus', nodeId);
                } else {
                  LocalState.set('inlineEditNode', nodeId);

                  Meteor.defer(() => {
                    var container = $('.node-detail-view');

                    container.animate({
                      scrollTop: $('.table-row[data-id="' + nodeId + '"]')
                        .offset().top - container.offset().top +
                        container.scrollTop() - 25
                    }, 300);
                  });
                }
              });
            }
          });
        }
      });
    }
  },

  moveNodes({Nodes, Notifications}, parentId, ids, table, options) {

    ids.forEach((id) => {
      Nodes.update({
        _id: id
      }, {
        $set: {
          parent: parentId
        }
      });
    });

    if (table) {
      // TODO: fix actions ?
      GV.selectedCtrl.reset(table);
    }

    if (options) {
      Notifications.success(options.title, options.text);
    }
  },

  removeNodeCallback({LocalState, Notifications}, result, options, id) {
    if (result) {
      if (id) {
        this.deleteNode(id, LocalState.get('mainDocument'));
      } else {
        this.deleteNode(LocalState.get('nodeInFocus'), LocalState.get('mainDocument'));

        // Set the main document in focus
        LocalState.set('nodeInFocus', LocalState.get('mainDocument'));
      }

      Notifications.success(options.title, options.text);
    }
  },

  removeFileCallback({Files, Nodes, Documents, Notifications}, result, fileObj, options) {
    if (result) {

      const {nodeId: node, docId: doc, _id: file} = fileObj;
      const {title, text} = options;

      // Remove the file
      Files.remove({
        _id: file
      }, (error) => {
        if (error) {
          Notifications.warn('Feil', error.message);
        } else {

          // Remove the reference in Node
          Nodes.update({
            _id: node
          }, {
            $set: {
              fileId: null
            }
          }, {}, (nodeError) => {
            if (nodeError) {
              Notifications.warn('Feil', error.message);
            } else {

              // remove the reference in main document
              Documents.update({
                _id: doc
              }, {
                $pull: {
                  fileIds: file
                }
              }, null, (documentError) => {
                if (documentError) {
                  Notifications.warn('Feil', error.message);
                } else {
                  Notifications.success(title, text);
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
  toggleVisibility({}, collection, _id, visible) {
    collection.update({
      _id
    }, {
      $set: {
        collapsed: !visible
      }
    });
  },

  /**
   * Checks whether a drop target is inside the dragged node itself
   */
  insideItself({Notifications}, drag, target) {
    if (drag.nodeType !== 'media') {

      var dragSectionLabel = drag.prevSection;
      var targetSectionLabel = target.prevSection;

      if (!targetSectionLabel) {
        return false;
      }

      var dragLabels = dragSectionLabel.split('.');
      var targetLabels = targetSectionLabel.split('.');

      if (targetLabels >= dragLabels) {
        var numEquals = 0;

        for (var i = 0; i < dragLabels.length; i++) {

          if (dragLabels[i] === targetLabels[i]) {
            numEquals++;
          }
        }

        if (numEquals === dragLabels.length) {
          Notifications.error(
            'Feil ved flytting av kapittelelement',
            'Du kan ikke flytte et kapittelelement inn i sitt eget deltre.'
          );
          return true;
        }
      }
    }

    return false;

  },

  renameNode({LocalState, Meteor, $}, _id) {

    LocalState.set('RENAME_NODE', _id);

    Meteor.defer(() => {
      var el = $('.tree li .element.nodes.rename div.node-text');
      el.focus();
      document.execCommand('selectAll', false, null);
    });
  }
};
