////////////////////////////////////////////////////////////////////////////////
// Notifications package configuration
////////////////////////////////////////////////////////////////////////////////

/*
 * Copyright 2015 Concept
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */


// -- Template event -----------------------------------------------------------


Template.Document.events({

  'click .back-to-dashboard': function () {
    Router.go('Documents');
  },

  'click .show-tree': function(event, tmpl) {
    event.prevenDefault && event.prevenDefault();

    Session.set("structureState", "tree");
  },

  'click .show-tags': function(event, tmpl) {
    event.prevenDefault && event.prevenDefault();

    Session.set("structureState", "tags");
  },

  'click .show-references': function(event, tmpl) {
    event.prevenDefault && event.prevenDefault();

    Session.set("structureState", "references");
  },

  'click .add-media-node': function(event, tmpl) {
    event.prevenDefault && event.prevenDefault();

    Session.set('showNodeForm', true);
    Session.set('showMediaNodesView', false);

    insertNodeOfType(this, "media", tmpl);
  },

  'click .add-chapter-node': function(event, tmpl) {
    event.prevenDefault && event.prevenDefault();

    Session.set('showNodeForm', true);
    Session.set('showMediaNodesView', true);

    insertNodeOfType(this, "chapter", tmpl);
  },

  'click .generate-pdf': function(event, tmpl) {
    event.prevenDefault && event.prevenDefault();

    // TODO: do some magic here
  },

  'click .export-to-file': function(event, tmpl) {
    event.prevenDefault && event.prevenDefault();

    exportDocument(this._id);
  }

});


// -- Template helpers ---------------------------------------------------------


Template.Document.helpers({

	focusOnMainDoc: function() {
		return Session.get('nodeInFocus') == Session.get('mainDocument');
	},

  getDoc: function() {
    return Router.current && Router.current() && Router.current().data && Router.current().data();
  }

});
