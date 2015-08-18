////////////////////////////////////////////////////////////////////////////////
// Clippy Setup
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

Session.set("clippyInAction", false);

Meteor.startup(function() {

  $(document).on("keyup", function(e) {
    if (e.shiftKey && e.ctrlKey && (e.which === 72)) {
      if (!Session.get("clippyInAction")) {
        Session.set("clippyInAction", true);

        if (Session.get("clippyVisible")) {
          GV.clippy.hide(false, function() {
            console.log("clippyHideFinished");
            Session.set("clippyVisible", false);
            Session.set("clippyInAction", false);
          });
        } else {
          GV.clippy.show();
          Session.set("clippyVisible", true);
          Session.set("clippyInAction", false);
        }
      }
    } else if(e.which === 27) {
      Session.set("closeOnSave", true);
      $("#update-node-form").trigger('submit');
    }
  });

});
