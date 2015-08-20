////////////////////////////////////////////////////////////////////////////////
// NodeLevel Template Logic
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

// -- Template helpers ---------------------------------------------------------

Session.set('editChapterNodeName', null);

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
    if (Session.get("showMediaNodes")) {
      return GV.collections.Nodes.find({
        parent: this._id
      }).count() > 0;
    } else {
      return GV.collections.Nodes.find({
        parent: this._id,
        nodeType: "chapter"
      }).count() > 0;
    }
  },

  /**
   * Returns the children of the current node.
   */
  children: function() {
    if (Session.get("showMediaNodes")) {
      return GV.collections.Nodes.find({
        parent: this._id
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
      return GV.collections.Nodes.find({
        parent: this._id,
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

  childrenCount: function() {
    return GV.collections.Nodes.find({
      parent: this._id,
      nodeType: "media"
    }).count();
  },

  getContext: function(options) {

    var context = _.extend(this, {
      prevSection: GV.nodeCtrl.getSection(options.hash.prevSection, this.node_index)
    });

    return context;
  },

  getSectionLabel: function() {
    return this.prevSection;
  },

  /**
   * Returns true if this node should have a drop zone beneath itself.
   */
  hasBottomSlot: function() {
    return this.node_index === (GV.collections.Nodes.find({
      parent: this.parent
    }).count() - 1);
  },

  editableTitle: function () {
    return '<span class="node-name" contenteditable="' +
      (Session.get('editChapterNodeName') === this._id) + '">' +
      (this.title || 'Uten navn') + '</span>';
  }

});


// -- Template on render -------------------------------------------------------

Template.NodeLevel.rendered = function() {

  $('.tree li.node.root li.node.chapter span').contextMenu('right-click-menu-chapter-node', {
    bindings: {

      // Add node button
      'add-chapter-node': function(t) {
        var elData = Blaze.getData(t);

        GV.nodeCtrl.insertNodeOfType(elData, "chapter", t.parentNode);
      },

      // Add node button
      'add-media-node': function(t) {
        var elData = Blaze.getData(t);

        GV.nodeCtrl.insertNodeOfType(elData, "media", t.parentNode);
      },

      // Delete button
      'delete-node': function(t) {
        var elData = Blaze.getData(t);

        $("div.tooltip").hide();

        if (elData && elData._id) {
          var confirmationPrompt = {
            title: "Bekreftelse på slettingen",
            message:  'Er du sikker på at du vil slette kapittelelementet? NB: ' +
                      'Vil slette alle underkapitler of informasjonselementer ' +
                      'til dette kapittelet!',
            buttons: {
              cancel: {
                label: "Nei"
              },
              confirm: {
                label: "Ja",
                callback: function(result) {
                  if (result) {

                    GV.nodeCtrl.deleteNode(elData, t.parentNode.parentNode.parentNode.parentNode);

                    // Set the main document in focus
                    Session.set('nodeInFocus', Session.get('mainDocument'));

                    Notifications.success(
                      'Sletting fullført',
                      'Kapittelelementet ble slettet fra systemet.'
                    );
                  }
                }
              }
            }
          };
          bootbox.dialog(confirmationPrompt);
        }
      },

      // Edit button
      'edit-node': function(t) {
        var elData = Blaze.getData(t);
        if (elData && elData._id) {
          Session.set('editChapterNodeName', elData._id);
          Meteor.defer(function() {
            var el = $('.tree li[data-id="' + elData._id + '"] > .element .node-text .node-name');

            if(el) {
              var parent = el.parent().parent();
              parent.css('text-overflow', 'clip');
              console.log(parent);

              el.focus();
              document.execCommand('selectAll', false, null);

              el.blur(function(e) {
                // var textNode = e.currentTarget.firstChild;
                //
                // var caret = 0; // insert caret after the 10th character say
                // var range = document.createRange();
                // range.setStart(textNode, caret);
                // range.setEnd(textNode, caret);
                // var sel = window.getSelection();
                // sel.removeAllRanges();
                // sel.addRange(range);
                // window.scroll(0,0);
                $(e.currentTarget).scroll(0,0);
                Session.set('editChapterNodeName', null);

                parent.css('text-overflow', 'ellipsis');
              });

              el.keypress(function(e){
                if(e.which === 13) {
                  var text = e.currentTarget.innerText;

                  GV.collections.Nodes.update({ _id: elData._id }, { $set: { title: text }});

                  Session.set('editChapterNodeName', null);
                  parent.css('text-overflow', 'ellipsis');

                  return false;
                }
              });
            }
          });

        }
      }
    }
  });




  $('.tree li.node.root li.node.media-node span').contextMenu('right-click-menu-media-node', {
    bindings: {

      // Delete button
      'delete-node': function(t) {
        var elData = Blaze.getData(t);

        $("div.tooltip").hide();

        if (elData && elData._id) {
          var confirmationPrompt = {
            title: "Bekreftelse på slettingen",
            message:  'Er du sikker på at du vil slette informasjonselementet? ' +
                      'NB: Dette vil også slette filen knyttet til dette informasjonselementet!',
            buttons: {
              cancel: {
                label: "Nei"
              },
              confirm: {
                label: "Ja",
                callback: function(result) {
                  if (result) {

                    GV.nodeCtrl.deleteNode(elData, t.parentNode.parentNode.parentNode.parentNode);

                    // Set the main document in focus
                    Session.set('nodeInFocus', Session.get('mainDocument'));

                    Notifications.success(
                      'Sletting fullført',
                      'Informajonselementet ble slettet fra systemet.'
                    );
                  }
                }
              }
            }
          };
          bootbox.dialog(confirmationPrompt);
        }
      },

      // Edit button
      'edit-node': function(t) {
        var elData = Blaze.getData(t);

        if (elData && elData._id) {
          GV.tabs.addTab(elData._id);
          Session.set('nodeInFocus', elData._id);
          Session.set('inlineEditNode', elData._id);
        }
      }

    }
  });
};
