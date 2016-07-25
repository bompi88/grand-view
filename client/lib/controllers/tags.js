////////////////////////////////////////////////////////////////////////////////
// Tags Controller
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

import {Tracker} from 'meteor/tracker';
import {_} from 'meteor/underscore';

export default {
  collapsed: [],
  dep: new Tracker.Dependency(),

  isCollapsed(tag) {
    this.dep.depend();

    return this.collapsed.indexOf(tag) > -1;
  },

  uncollapse(tag) {
    var index = this.collapsed.indexOf(tag);

    if (this.collapsed.indexOf(tag) > -1) {
      this.collapsed.splice(index, 1);

      this.dep.changed();
      return this.collapsed;
    }

    return this.collapsed;
  },

  collapse(tag) {

    if (this.collapsed.indexOf(tag) === -1) {
      this.collapsed.push(tag);

      this.dep.changed();
      return this.collapsed;
    }

    return this.collapsed;
  },

  collapseAll(tags) {

    this.collapsed = _.unique(_.union(this.collapsed, tags));

    this.dep.changed();
    return this.collapsed;
  },

  reset() {
    this.collapsed = [];

    this.dep.changed();
    return this.collapsed;
  }
};
