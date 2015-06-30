////////////////////////////////////////////////////////////////////////////////
// Template helpers
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

var template_helpers = {

  'formatDateRelative': GV.helpers.formatDateRelative,

  'formatDateRegular': GV.helpers.formatDateRegular,

  'activeOnRoute': function(route, rValue) {
    var returnValue = 'active';

    if (arguments.length > 2) {
      returnValue = rValue;
    }

    var curRoute = Router.current();
    if (!curRoute || !curRoute.route) return '';

    return curRoute && ((route === curRoute.route.getName()) ? returnValue : '');
  },

  'commaSeparated': function(arr) {
    if (_.isArray(arr))
      return arr.join(", ");
    else
      return arr;
  },

  'convertLineBreaks': function(text) {
    if (text) {
      text = text.replace(/^[\r\n]+|[\r\n]+$/g, '').replace(/(?:\r\n|\r|\n)/g, '<br />');
      return text.trim();
    }
    return null;
  }

};

// Register all helpers as UI helpers
_.each(template_helpers, function(helper, key) {
  Blaze.registerHelper(key, helper);
});
