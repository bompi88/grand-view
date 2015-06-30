////////////////////////////////////////////////////////////////////////////////
// Template Route Controllers
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

/**
 * Edit Template Route Controller
 */
GV.routeCtrls.Template = RouteController.extend({

  subscriptions: function() {
    return [
      Meteor.subscribe('documentById', this.params._id),
      Meteor.subscribe('nodesByDoc', this.params._id),
      Meteor.subscribe('tags'),
      Meteor.subscribe('references')
    ];
  },

  data: function() {
    return GV.collections.Documents.findOne({
      _id: this.params._id
    });
  },

  onAfterAction: function() {
    GV.tabs.reset();
    GV.tags.reset();

    Session.set('mainDocument', this.params._id);
    Session.set('nodeInFocus', this.params._id);
    Session.set("file", null);
    Session.set("uploadStopped", false);
    Session.set("structureState", "tree");
  }

});

/**
 * View Templates Route Controller
 */
GV.routeCtrls.Templates = RouteController.extend({

  subscriptions: function() {
    return Meteor.subscribe('documents');
  },

  data: function() {
    return {
      templates: GV.collections.Documents.find({
        template: true
      }, {
        sort: _.defaults(Session.get("templateSort") || {}, {
          lastChanged: -1
        })
      })
    };
  },

  onAfterAction: function() {
    GV.selectedCtrl.resetAll();
  }

});
