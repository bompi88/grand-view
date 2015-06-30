////////////////////////////////////////////////////////////////////////////////
// Miscellaneous Route Controllers
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
 * WorkArea Route Controller
 */
GV.routeCtrls.WorkArea = RouteController.extend({

  onAfterAction: function() {
    var docId = Session.get('mainDocument');

    if (docId) {
      Router.go('Document', {
        _id: docId
      });
    }
  }
});

/**
 * Trash Can Route Controller
 */
GV.routeCtrls.Trash = RouteController.extend({

  subscriptions: function() {
    return Meteor.subscribe('documents');
  },

  data: function() {
    return {
      trash: GV.collections.Documents.find({
        removed: true
      }, {
        sort: _.defaults(Session.get("templateSort") || {}, {
          removedAt: -1
        })
      })
    };
  },

  onAfterAction: function() {
    GV.selectedCtrl.resetAll();
  }

});
