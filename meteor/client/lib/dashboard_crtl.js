GV.selectedCtrl = {
  selectedItems: {},
  dep: new Tracker.Dependency(),

  getSelected: function(table) {
    this.dep.depend();

    return this.selectedItems[table] || [];
  },

  addAll: function(table, ids) {
    this.selectedItems[table] = ids;

    this.dep.changed();
    return this.selectedItems[table] || [];
  },

  add: function(table, id) {
    if(!this.selectedItems[table])
      this.selectedItems[table] = [];

    var index = this.selectedItems[table].indexOf(id);

    if(index == -1)
      this.selectedItems[table].push(id);

    this.dep.changed();
    return this.selectedItems[table] || [];
  },

  remove: function(table, id) {
    if(!this.selectedItems[table])
      return;

    var index = this.selectedItems[table].indexOf(id);

    if(index > -1)
      this.selectedItems[table].splice(index, 1);

    this.dep.changed();
    return this.selectedItems;
  },

  removeAll: function(table, ids) {

    if(!this.selectedItems[table])
      return;

    var selected = this.selectedItems;

    ids.forEach(function(id) {

      var index = selected[table].indexOf(id);

      if(index > -1)
        selected[table].splice(index, 1);
    });

    this.dep.changed();
    return this.selectedItems;
  },

  reset: function(table) {
    this.selectedItems[table] = [];

    this.dep.changed();
    return this.selectedItems[table] || [];
  },

  resetAll: function() {
    this.selectedItems = {};

    this.dep.changed();
    return this.selectedItems;
  }
};
