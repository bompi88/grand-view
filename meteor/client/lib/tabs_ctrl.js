////////////////////////////////////////////////////////////////////////////////
// Tabs Controller
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

GV.tabs = {
  open: [],
  dummyTab: null,
  scrollBarWidths: 40,
  dep: new Tracker.Dependency(),

  /**
   * Add a tab to tab list
   */
  addTab: function(docId) {
    if (docId === this.dummyTab) {
      this.dummyTab = null;
    }

    if (this.open.indexOf(docId) === -1)
      this.open.push(docId);

    this.dep.changed();
    return this.open;
  },

  /**
   * Remove a tab from tab list
   */
  removeTab: function(docId) {

    if (docId === this.dummyTab) {
      this.dummyTab = null;
    }

    var index = this.open.indexOf(docId && docId.toString());

    if (index > -1) {
      this.open.splice(index, 1);
    }

    this.dep.changed();
    return this.open;
  },

  /**
   * Get all tabs contained in tab list
   */
  getTabs: function() {
    this.dep.depend();
    
    var self = this;

    Meteor.setTimeout(function() {
      if (self.open.length) {
        GV.tabs.reAdjust();
      }
    }, 200);

    var list = [];

    list = list.concat(this.open);

    if (this.dummyTab) {
      list.push(this.dummyTab);
    }

    return list;
  },

  /**
   * Set dummy tab that closes when unselect of node
   */
  setDummyTab: function(docId) {
    if (this.open.indexOf(docId) === -1) {
      this.dummyTab = docId;
    } else {
      this.dummyTab = null;
    }

    this.dep.changed();
    return this.dummyTab;
  },

  /**
   * Remove the dummy tab
   */
  resetDummyTab: function() {
    this.dummyTab = null;

    this.dep.changed();
    return this.dummyTab;
  },

  /**
   * Reset the tab list
   */
  reset: function() {
    this.open = [];
    this.dummyTab = null;

    this.dep.changed();

    return this.open;
  },

  /**
   * Readjusts the tab view and renders the scroll indicators
   */
  reAdjust: function() {

    // if tabs view overflows the container, render a scroll button on the right
    if (($('.tab-wrapper').outerWidth(true)) <= GV.tabs.widthOfList()) {
      $('.scroller-right').show();

      // else hide it and readjust the view
    } else {
      $('.scroller-right').hide();

      if (GV.tabs.getLeftPosi() < 0) {
        $('.list').animate({
          left: "-=" + GV.tabs.getLeftPosi() + "px"
        }, 'slow');
      }
    }

    // If left position is outside of container, show a scroll button else hide it
    if (GV.tabs.getLeftPosi() < 0) {
      $('.scroller-left').show();
    } else {
      $('.scroller-left').hide();
    }
  },

  /**
   * Return the width of all tabs combined
   */
  widthOfList: function() {
    var itemsWidth = 0;

    $('.list li').each(function() {
      var it = $(this).outerWidth();
      itemsWidth = itemsWidth + it;
    });

    return itemsWidth;
  },

  /**
   * Returns the width of hidden area
   */
  widthOfHidden: function() {
    return (($('.tab-wrapper').outerWidth(true)) - GV.tabs.widthOfList() - GV.tabs.getLeftPosi()) -
            GV.tabs.scrollBarWidths || 0;
  },

  /**
   * Get the left most position
   */
  getLeftPosi: function() {
    return $('.list') && $('.list').position() && $('.list').position().left;
  }
};
