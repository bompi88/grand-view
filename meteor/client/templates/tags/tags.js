////////////////////////////////////////////////////////////////////////////////
// Tags Template Logic
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

Template.Tags.rendered = function() {
  GV.tags.collapseAll(Template.instance().tags);
};

Template.Tags.helpers({
  tags: function() {

    var doc = GV.collections.Documents.findOne({
      _id: this._id
    });

    var nodes = GV.collections.Nodes.find({
      _id: {
        $in: doc.children || []
      },
      nodeType: "media"
    }).fetch();

    var tags = [];

    nodes.forEach(function(node) {
      if (node.tags)
        tags = _.union(tags, node.tags);
    });

    tags = _.unique(tags).sort(function(a, b) {
      return a.localeCompare(b, "nb-NO");
    });

    Template.instance().tags = tags;

    return tags;
  }
});


Template.Tags.events({

  'click .expand-tags': function(event, tmpl) {
    event.preventDefault();

    GV.tags.reset();
  },

  'click .collapse-tags': function(event, tmpl) {
    event.preventDefault();

    GV.tags.collapseAll(Template.instance().tags);
  },

  'click .help-modal-button': function(event, tmpl) {
    event.preventDefault();

    $("div.tooltip").hide();

    var helpBox = {
      title: "<span class='glyphicon glyphicon-question-sign'></span> Hjelp til nøkkelordvisningen",
      message: Blaze.toHTML(Template.TagsHelp),
      buttons: {
        close: {
          label: "Lukk",
          className: "btn-default",
        }
      }
    };

    bootbox.dialog(helpBox);
  }

});

Template.Tag.helpers({

  isCollapsed: function() {
    return GV.tags.isCollapsed(this.title);
  },

  getNodes: function() {
    return GV.collections.Nodes.find({
      tags: this.title
    });
  }

});


Template.Tag.events({
  'click .hide-node': function(event, tmpl) {
    GV.tags.collapse(this.title);
  },

  'click .show-node': function(event, tmpl) {
    GV.tags.uncollapse(this.title);
  },

  // Selects a node on regular mouse click
  'click li.node span.element': function(event, tmpl) {
    // "Unselect" all selected nodes
    $('li.node span').removeClass('selected');

    // Style the current selected node.
    $(event.currentTarget).addClass('selected');

    var elData = Blaze.getData(event.currentTarget);

    GV.nodeCtrl.openNode(elData);
  }

});
