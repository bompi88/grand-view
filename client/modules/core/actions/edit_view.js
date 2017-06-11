////////////////////////////////////////////////////////////////////////////////
// Edit View Actions
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

/* globals _require */

import debounce from 'debounce';
// import { ActionCreators } from 'redux-undo';
const { sh } = _require('electron');

export default {

  removeTag({ Collections, Meteor, _ }, value, setState, options, e) {
    e.preventDefault();
    e.stopPropagation();

    Meteor.call('removeTag', value, (error) => {
      if (error) {
        return;
      }
      setState({
        options: options.filter((option) => {
          return option.value !== value;
        })
      });
    });

  },

  setCurrentTag({ LocalState }, tag) {
    LocalState.set('CURRENT_TAG', tag);
  },

  getCurrentTag({ LocalState }) {
    return LocalState.get('CURRENT_TAG');
  },

  setCurrentReference({ LocalState }, reference) {
    LocalState.set('CURRENT_REFERENCE', reference);
  },

  getCurrentReference({ LocalState }) {
    return LocalState.get('CURRENT_REFERENCE');
  },

  changeMode({ LocalState }, mode = 'easy') {
    LocalState.set('SELECTED_MODE', mode);
  },

  updateMediaNodePosition({ Meteor }, { toPos, _id, toParent }) {
    Meteor.call('updateMediaNodePosition', { toPos, _id, toParent });
  },

  searchTags({ Collections, Meteor }, inputText) {
    if (!inputText) {
      return Promise.resolve();
    }

    return new Promise((resolve, reject) => {
      Meteor.subscribe('searchTags', inputText, (err) => {
        if (err) {
          return reject(err);
        }
        return resolve(Collections.Tags.find({
          text: { $regex: inputText, $options: 'i' }
        }).fetch() || []);
      });
    });
  },

  setTags({ LocalState, Collections, Meteor }, tags, _id) {
    Collections.Nodes.update({ _id }, { $set: {
      tags
    }});

    Meteor.call('insertTags', tags);
  },

  removeReference({ Collections, Meteor, _ }, value, setState, options, e) {
    e.preventDefault();
    e.stopPropagation();

    Meteor.call('removeReference', value, (error) => {
      if (error) {
        return;
      }
      setState({
        options: options.filter((option) => {
          return option.value !== value;
        })
      });
    });

  },

  searchReferences({ Collections, Meteor }, inputText) {
    if (!inputText) {
      return Promise.resolve();
    }

    return new Promise((resolve, reject) => {
      Meteor.subscribe('searchReferences', inputText, (err) => {
        if (err) {
          return reject(err);
        }
        return resolve(Collections.References.find({
          text: { $regex: inputText, $options: 'i' }
        }).fetch() || []);
      });
    });
  },

  setAsEditable({ LocalState, Meteor, $ }, nodeId) {
    LocalState.set('EDIT_NODE', nodeId);
  },

  unsetEditable({ LocalState }, prevNodeId) {
    if (prevNodeId === LocalState.get('EDIT_NODE')) {
      LocalState.set('EDIT_NODE', null);
    }
  },

  addMediaNode(context, parent) {
    const { Helpers, Meteor, LocalState, $ } = context;
    const nodeId = Helpers.insertNodeOfType(context, parent, 'media');

    LocalState.set('EDIT_NODE', nodeId);
    Meteor.setTimeout(() => {
      $('.row-item form')[0].scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
      $('.row-item form input[name="name"]').focus();
    }, 500);
  },

  setReferences({ LocalState, Collections, Meteor }, references, _id) {
    Collections.Nodes.update({ _id }, { $set: {
      references
    }});

    Meteor.call('insertReferences', references);
  },

  openLink({}, e) {
    e.preventDefault();
    e.stopPropagation();

    const link = e.target.getAttribute('href');
    sh.openExternal(link);
  },

  setDescription: debounce(({ LocalState, Collections }, description, _id) => {
    Collections.Nodes.update({ _id }, { $set: {
      description
    }});
  }, 200),

  setName: debounce(({ LocalState, Collections }, name, _id) => {
    Collections.Nodes.update({ _id }, { $set: {
      name
    }});
  }, 20),

  setRootDescription: debounce(({ LocalState, Collections }, description, _id) => {
    Collections.Documents.update({ _id }, { $set: {
      description
    }});
  }, 200),

  setTitle: debounce(({ LocalState, Collections }, title, _id) => {
    Collections.Documents.update({ _id }, { $set: {
      title
    }});
  }, 200)

};
