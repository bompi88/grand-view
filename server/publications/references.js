////////////////////////////////////////////////////////////////////////////////////////////////////
// Publications for References Collection
////////////////////////////////////////////////////////////////////////////////////////////////////
//
// Copyright 2017 Bjørn Bråthen, Concept NTNU
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
////////////////////////////////////////////////////////////////////////////////////////////////////

import { Meteor } from 'meteor/meteor';

import { References } from './../../lib/collections';

export default function () {

  /**
   * Publish references by query and sort
   */
  Meteor.publish('searchReferences', function (queryText = '') {
    return References.find({
      label: { $regex: queryText, $options: 'i' }
    });
  });

}
