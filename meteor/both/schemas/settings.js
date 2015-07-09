////////////////////////////////////////////////////////////////////////////////
// Settings Schema
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

GV.schemas.Settings = new SimpleSchema({

  // Language of the resource
  language: {
    type: [String],
    label: function() {
      return TAPi18n.__('schemas.settings.language.label');
    },
    optional: true,
    blackbox: true,
    autoform: {
      type: "selectize",
      placeholder: "schemaLabel",
      afFieldInput: {
        multiple: true,
        selectizeOptions: {
          maxItems: 1,
          preload: true,
          persist: false,
          render: {
            item: function(item, escape) {
              return "<div>" + escape(item.text) + "</div>";
            },
            option: function(item, escape) {
              return "<div>" + escape(item.text) + "</div>";
            }
          }
        }
      }
    }
  }
});

GV.collections.Settings.attachSchema(GV.schemas.Settings);
