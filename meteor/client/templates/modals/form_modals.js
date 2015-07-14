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

Template.SelectOutprintModal.events({
  "click .generate": function(event, tmpl){
    var doc = Template.instance().doc;
    var selectedFormat = $(tmpl.find('#select-format')).val();

    if(doc) {
      GV.helpers.generateDOCX(doc._id, selectedFormat, function(err) {
        if(err) {
          Notifications.error('Feil ved generering av utskrift', 'Noe skjedde under genereringen av utskriftsdokumentet, vennligts prøv igjen.');
        } else {
          Notifications.success('Utskrift ferdig', 'Utskriften er generert og åpnes nå opp, slik at du kan lagre den eller skrive den ut.');
        }
      });
    }
  }
});

Template.SelectOutprintModal.helpers({
  isTemplate: function(){
    var docId = Session.get('mainDocument');
    var doc = GV.collections.Documents.findOne({ _id: docId });

    Template.instance().doc = doc;
    return doc && doc.template;
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
