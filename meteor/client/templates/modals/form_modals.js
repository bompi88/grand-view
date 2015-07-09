////////////////////////////////////////////////////////////////////////////////
// Form Modals Template Logic
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

Template.SelectTemplateModal.events({

  'click .submit-doc': function(event, tmpl) {
    event.preventDefault();

    $("#insert-doc").trigger("submit");
  }
});


Template.LanguageSelectModal.events({

  'click .save-settings': function(event, tmpl) {
    event.preventDefault();
    
    $("#language-select-form").trigger("submit");
  }
});

Template.LanguageSelectModal.helpers({

  getSettings: function() {
    var settings = GV.collections.Settings.find().fetch();

    return settings && settings[0];
  },

  languageOptions: function() {
    return [
      { value:"en", label: TAPi18n.__('languages.en') },
      { value:"no-NB", label: TAPi18n.__('languages.no-NB') },
      { value:"no-NN", label: TAPi18n.__('languages.no-NN') }
    ];
  }

});
