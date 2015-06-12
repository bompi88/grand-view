GV.references = {
  collapsed: [],
  dep: new Tracker.Dependency(),

  isCollapsed: function(tag) {
    this.dep.depend();

    return this.collapsed.indexOf(tag) > -1;
  },

  uncollapse: function(tag) {
    var index = this.collapsed.indexOf(tag);

    if(this.collapsed.indexOf(tag) > -1) {
      this.collapsed.splice(index, 1);

      this.dep.changed();
      return this.collapsed;
    }

    return this.collapsed;
  },


  collapse: function(tag) {

    if(this.collapsed.indexOf(tag) == -1) {
      this.collapsed.push(tag);

      this.dep.changed();
      return this.collapsed;
    }

    return this.collapsed;
  },

  collapseAll: function(tags) {

    this.collapsed = _.unique(_.union(this.collapsed, tags));

    this.dep.changed();
    return this.collapsed;
  },

  reset: function(table) {
    this.collapsed = [];

    this.dep.changed();
    return this.collapsed;
  }
};
