// //////////////////////////////////////////////////////////////////////////////
// Node Actions
// //////////////////////////////////////////////////////////////////////////////
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
// //////////////////////////////////////////////////////////////////////////////

export default {

  handleClick({ Meteor, LocalState }, node, e) {
    const { _id } = node;
    if (e.nativeEvent.which === 1) {
      Meteor.call('document.setSelectedNode', LocalState.get('CURRENT_DOCUMENT'), _id);
      LocalState.set('CURRENT_NODE', _id);
    }
  },

  collapseNode({ Meteor, LocalState, Collections }, { _id }) {
    Collections.Nodes.update({
      _id,
    }, {
      $set: {
        isCollapsed: true,
      },
    });
  },

  expandNode({ Meteor, LocalState, Collections }, { _id }) {
    Collections.Nodes.update({
      _id,
    }, {
      $set: {
        isCollapsed: false,
      },
    });
  },

  setPosition({ Meteor }, { fromPos, toPos, nodeAboveId, _id, fromParent, toParent }) {
    Meteor.call('updateNodePosition', { fromPos, toPos, nodeAboveId, _id, fromParent, toParent });
  },

  putIntoChapterNode({ Meteor }, { parent, _id }) {
    Meteor.call('putIntoChapterNode', { parent, _id });
  },

  renameNode({ LocalState, Meteor, $ }, _id) {
    LocalState.set('RENAME_NODE', _id);

    Meteor.defer(() => {
      const el = $('.tree li .element.nodes.rename div.node-text');
      el.focus();
      document.execCommand('selectAll', false, null);
    });
  },
};
