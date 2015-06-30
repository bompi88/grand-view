////////////////////////////////////////////////////////////////////////////////
// Show More Content Controller
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

GV.showMoreCtrl = {
  showMore: {},
  dep: new Tracker.Dependency(),

  get: function(key) {
    this.dep.depend();

    return this.showMore[key];
  },

  show: function(key) {
    this.showMore[key] = true;
    this.dep.changed();

    return this.showMore;
  },

  hide: function(key) {
    this.showMore[key] = false;
    this.dep.changed();

    return this.showMore;
  },

  reset: function() {
    this.showMore = {};
    this.dep.changed();

    return this.showMore;
  }

};
