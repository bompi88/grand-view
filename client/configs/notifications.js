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

import {Meteor} from 'meteor/meteor';
import {Notifications} from 'meteor/gfk:notifications';
import Globals from '/lib/globals';

Meteor.startup(() => {
  Notifications.defaultOptions = { timeout: Globals.timeout, ...Notifications.defaultOptions };
});
