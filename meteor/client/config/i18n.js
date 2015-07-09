////////////////////////////////////////////////////////////////////////////////
// Notifications package configuration
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

var getUserLanguage = function () {
  var settings = GV.collections.Settings.find().fetch();
  var language = "en";

  if(settings.length) {
    language = settings[0].language;
  }
  
  return language.toString();
};

Meteor.startup(function () {

  TAPi18n.setLanguage(getUserLanguage())
    .done(function () {
      console.log("Language set.");
    })
    .fail(function (error_message) {
      // Handle the situation
      console.log(error_message);
    });
});

Tracker.autorun(function() {
  TAPi18n.setLanguage(getUserLanguage());
});
