//--------------------------------------------------------------------------------------------------
// Collections
//--------------------------------------------------------------------------------------------------

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
