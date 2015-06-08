////////////////////////////////////////////////////////////////////////////////
// Configure an object to handle tabs for the current session.
////////////////////////////////////////////////////////////////////////////////

GV.tabs = {
  open: [],
  dummyTab: null,
  dep: new Tracker.Dependency(),

  /**
   * Add a tab to tab list
   */
  addTab: function(docId) {
    if(docId == this.dummyTab) {
      this.dummyTab = null;
    }

    if (this.open.indexOf(docId)==-1)
      this.open.push(docId);

    this.dep.changed();
    return this.open;
  },

  /**
   * Remove a tab from tab list
   */
  removeTab: function(docId) {

    if(docId == this.dummyTab) {
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

    Meteor.setTimeout(function() {
      if(this.open.length) {
        reAdjust();
      }
    }, 200);

    var list = [];

    list = list.concat(this.open);

    if(this.dummyTab) {
      list.push(this.dummyTab);
    }

    return list;
  },

  /**
   * Set dummy tab that closes when unselect of node
   */
  setDummyTab: function(docId) {
    if (this.open.indexOf(docId)==-1) {
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
  }
}
