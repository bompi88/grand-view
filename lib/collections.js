// //////////////////////////////////////////////////////////////////////////////
// Collections
// //////////////////////////////////////////////////////////////////////////////
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
// //////////////////////////////////////////////////////////////////////////////

import { Mongo } from 'meteor/mongo';
import { Meteor } from 'meteor/meteor';
import { FilesCollection } from 'meteor/ostrio:files';

import Globals from './globals';

export const Documents = new Meteor.Collection('documents');
export const Nodes = new Meteor.Collection('nodes');
export const Tags = new Mongo.Collection('tags');
export const References = new Mongo.Collection('references');
export const Settings = new Mongo.Collection('settings');
export const Counts = new Mongo.Collection('counts');

const path = require('path');

Documents.attachBehaviour('softRemovable');

export const Files = new FilesCollection({
  collectionName: 'files',
  allowClientCode: true,
  storagePath: path.join(Globals.basePath, 'files'),
});

// -- Ensure uniqueness --------------------------------------------------------

if (Meteor.isServer) {
  // only unique tags
  Tags._ensureIndex('value', {
    unique: true,
  });

  // only unique references
  References._ensureIndex('value', {
    unique: true,
  });
}
