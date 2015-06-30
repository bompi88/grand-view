////////////////////////////////////////////////////////////////////////////////
// References Template Logic
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

Template.References.rendered = function() {
  GV.references.collapseAll(Template.instance().references);
};

Template.References.helpers({
  references: function() {

    var doc = GV.collections.Documents.findOne({
      _id: this._id
    });

    var nodes = GV.collections.Nodes.find({
      _id: {
        $in: doc.children || []
      },
      nodeType: "media"
    }).fetch();

    var references = [];

    nodes.forEach(function(node) {
      if (node.references)
        references = _.union(references, node.references);
    });

    references = _.unique(references).sort(function(a, b) {
      return a.localeCompare(b, "nb-NO");
    });

    Template.instance().references = references;

    return references;
  }
});


Template.References.events({

  'click .expand-references': function(event, tmpl) {
    event.preventDefault();

    GV.references.reset();
  },

  'click .collapse-references': function(event, tmpl) {
    event.preventDefault();

    GV.references.collapseAll(Template.instance().references);
  },

  'click .help-modal-button': function(event, tmpl) {
    event.preventDefault();

    $("div.tooltip").hide();

    var helpBox = {
      title: "<span class='glyphicon glyphicon-question-sign'></span> Hjelp til kildevisningen",
      message: Blaze.toHTML(Template.ReferencesHelp),
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

Template.Reference.helpers({

  isCollapsed: function() {
    return GV.references.isCollapsed(this.title);
  },

  getNodes: function() {
    return GV.collections.Nodes.find({
      references: this.title
    });
  }

});


Template.Reference.events({
  'click .hide-node': function(event, tmpl) {
    GV.references.collapse(this.title);
  },

  'click .show-node': function(event, tmpl) {
    GV.references.uncollapse(this.title);
  },

  // Selects a node on regular mouse click
  'click li.node span.element': function(event, tmpl) {
    // "Unselect" all selected nodes
    $('li.node span').removeClass('selected');

    // Style the current selected node.
    $(event.currentTarget).addClass('selected');

    var elData = Blaze.getData(event.currentTarget);

    GV.nodeCtrl.openNode(elData);

    var container = $(".node-detail-view");

    container.animate({
      scrollTop: 0
    }, 300);
  }

});
