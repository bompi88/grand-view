////////////////////////////////////////////////////////////////////////////////
// Tabs Template Logic
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

// -- Template helpers ---------------------------------------------------------


Template.Tabs.helpers({

  tabs: function() {
    return GV.tabs.getTabs();
  },

  isMainDocument: function() {
    return Session.get('nodeInFocus') === Session.get('mainDocument');
  },

  getDoc: function(id) {
    return GV.collections.Nodes.findOne({
      _id: id
    }, {
      fields: {
        title: 1,
        nodeType: 1
      }
    });
  }

});


// -- Template events ----------------------------------------------------------


Template.Tabs.events({

  'click .tab': function(event, tmpl) {
    event.preventDefault();

    Session.set('nodeInFocus', this._id.toString());

    if (this.nodeType === "chapter") {
      Session.set('showNodeForm', false);
      Session.set('showMediaNodesView', true);
    } else {
      Session.set('showNodeForm', true);
      Session.set('showMediaNodesView', false);
    }

    $('li.node span').removeClass('selected');

    var el = $("li.root li.node[data-id='" + this._id + "']").find("> span");

    if (el && el.length)
      el.addClass('selected');

  },

  'click .general-info': function(event, tmpl) {
    event.preventDefault();

    Session.set('nodeInFocus', Session.get('mainDocument'));

    $('li.node span').removeClass('selected');

    var el = $("li.root > span");

    if (el && el.length)
      el.addClass('selected');
  },

  'click .delete-tab': function(event, tmpl) {
    event.preventDefault();
    event.stopPropagation();

    // If tab removed, go to the general tab.
    // This should be changed to be the nearest tab.
    Session.set('nodeInFocus', Session.get('mainDocument'));
    GV.tabs.removeTab(this._id);

    $('li.node span').removeClass('selected');

    $("li.node.root > span.element.root").addClass('selected');
  },

  'click .scroller-right': function() {
    $('.scroller-left').fadeIn('slow');
    $('.scroller-right').fadeOut('slow');
    $('.list').animate({
      left: "+=" + GV.tabs.widthOfHidden() + "px"
    }, 'slow');
  },

  'click .scroller-left': function() {
    $('.scroller-right').fadeIn('slow');
    $('.scroller-left').fadeOut('slow');
    $('.list').animate({
      left: "-=" + GV.tabs.getLeftPosi() + "px"
    }, 'slow');
  },

  'mouseenter .list span.glyphicon': function(event, tmpl) {
    $(event.target).parent().addClass('hovered');
  },

  'mouseleave .list span.glyphicon': function(event, tmpl) {
    $(event.target).parent().removeClass('hovered');
  }

});


//-- Make sure the tab view readjust itself on change --------------------------

// TODO: maybe a little hacky?

Template.Tabs.rendered = function() {
  GV.tabs.reAdjust();
};

$(window).on('resize', function(e) {
  GV.tabs.reAdjust();
});
