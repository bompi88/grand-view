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

'use strict';

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
        sort: _.defaults(Session.get('templateSort') || {}, {
          lastChanged: -1
        })
      })
    };
  },

  onAfterAction: function() {
    // Hide assistant
    if (GV.clippy && (GV.clippy._hidden === false)) {
      GV.clippy.hide();
    }

    // Reset table selections
    GV.selectedCtrl.resetAll();
  }

});
