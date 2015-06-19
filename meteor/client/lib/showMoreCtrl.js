GV.showMoreCtrl = {
  showMore: {},
  dep: new Tracker.Dependency,

  get: function(key) {
    this.dep.depend();

    return this.showMore[key];
  },

  show: function (key){
    this.showMore[key] = true;
    this.dep.changed();

    return this.showMore;
  },

  hide: function (key){
    this.showMore[key] = false;
    this.dep.changed();

    return this.showMore;
  },

  reset: function() {
    this.showMore = {};
    this.dep.changed();

    return this.showMore;
  }

};
