////////////////////////////////////////////////////////////////////////////////
// Collections
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

// -- Document collections -----------------------------------------------------

GV.collections = {
  Documents: new Meteor.Collection('documents'),
  Nodes: new Meteor.Collection('nodes'),
  Tags: new Mongo.Collection('tags'),
  References: new Mongo.Collection('references')
};

// -- File storage -------------------------------------------------------------

GV.collections.Files = new FS.Collection("files", {
  stores: [new FS.Store.FileSystem("filesStore", {
    path: "~/GrandView/files"
  })]
});

// -- Ensure uniqueness --------------------------------------------------------

if (Meteor.isServer) {

  // only unique tags
  GV.collections.Tags._ensureIndex('value', {
    unique: true
  });

  // only unique references
  GV.collections.References._ensureIndex('value', {
    unique: true
  });

}
