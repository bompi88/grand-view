////////////////////////////////////////////////////////////////////////////////
// Selected Elements Controller
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

GV.selectedCtrl = {
  selectedItems: {},
  dep: new Tracker.Dependency(),

  getSelected: function(table) {
    this.dep.depend();

    return this.selectedItems[table] || [];
  },

  isSelected: function(table, id) {
    this.dep.depend();

    return _.contains(this.selectedItems[table], id);
  },

  allSelected: function(table, ids) {
    this.dep.depend();

    if (this.selectedItems[table]) {
      var diff = _.difference(ids, this.selectedItems[table]);
      return ids && ids.length && diff.length === 0;
    } else {
      return false;
    }
  },

  addAll: function(table, ids) {
    this.selectedItems[table] = ids;

    this.dep.changed();
    return this.selectedItems[table] || [];
  },

  add: function(table, id) {
    if (!this.selectedItems[table])
      this.selectedItems[table] = [];

    var index = this.selectedItems[table].indexOf(id);

    if (index === -1)
      this.selectedItems[table].push(id);

    this.dep.changed();
    return this.selectedItems[table] || [];
  },

  remove: function(table, id) {
    if (!this.selectedItems[table])
      return;

    var index = this.selectedItems[table].indexOf(id);

    if (index > -1)
      this.selectedItems[table].splice(index, 1);

    this.dep.changed();
    return this.selectedItems;
  },

  removeAll: function(table, ids) {

    if (!this.selectedItems[table])
      return;

    var selected = this.selectedItems;

    ids.forEach(function(id) {

      var index = selected[table].indexOf(id);

      if (index > -1)
        selected[table].splice(index, 1);
    });

    this.dep.changed();
    return this.selectedItems;
  },

  reset: function(table) {
    this.selectedItems[table] = [];

    this.dep.changed();
    return this.selectedItems[table] || [];
  },

  resetAll: function() {
    this.selectedItems = {};

    this.dep.changed();
    return this.selectedItems;
  }
};
