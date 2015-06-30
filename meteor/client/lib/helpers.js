////////////////////////////////////////////////////////////////////////////////
// Client helpers
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

GV.helpers = _.extend(GV.helpers, {

  /**
   * Formats the date like "i går kl. 15.28"
   */
  formatDateRelative: function(date) {
    return moment && moment(date).calendar();
  },

  formatDateRegular: function(date) {
    return moment && moment(date).format('L');
  },

  showConfirmationPrompt: function(options, callbackYes, callbackNo) {
    $("div.tooltip").hide();

    // A confirmation prompt before removing the document
    var confirmationPrompt = {
      title: options.title,
      message: options.message,
      buttons: {
        cancel: {
          label: "Nei",
          callback: callbackNo
        },
        confirm: {
          label: "Ja",
          callback: callbackYes
        }
      }
    };
    bootbox.dialog(confirmationPrompt);
  },

  showEditWarning: function(callback) {
    var dirty = Session.get("formDirty");

    if (dirty) {
      GV.helpers.showConfirmationPrompt({
          title: "Lukking av tidligere redigering",
          message: Blaze.toHTML(Template.CloseEditViewModal)
        },
        callback
      );
    } else {
      callback();
    }
  }

});
