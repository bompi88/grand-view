////////////////////////////////////////////////////////////////////////////////
// Initial db adds
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

import { Settings, Tags } from './../../lib/collections';

const tags = [
  {
    value: 'test',
    label: 'test'
  },
  {
    value: 'test2',
    label: 'test2'
  },
  {
    value: 'test3',
    label: 'test3'
  },
  {
    value: 'test4',
    label: 'test4'
  },
  {
    value: 'kanskje1',
    label: 'kanskje1'
  },
  {
    value: 'kanskje2',
    label: 'kanskje2'
  }
];

if (Settings.find().count() === 0) {
  Settings.insert({
    _id: 'user',
    language: 'en'
  });
}

if (!Tags.findOne()) {
  console.log('----> Inserting tags...');
  tags.forEach((contact) => {
    Tags.insert(contact);
  });
}
