//--------------------------------------------------------------------------------------------------
// Show More Content Controller
//--------------------------------------------------------------------------------------------------

import { Tracker } from 'meteor/tracker';

export default {
  showMore: {},
  dep: new Tracker.Dependency(),

  get(key) {
    this.dep.depend();

    return this.showMore[key];
  },

  show(key) {
    this.showMore[key] = true;
    this.dep.changed();

    return this.showMore;
  },

  hide(key) {
    this.showMore[key] = false;
    this.dep.changed();

    return this.showMore;
  },

  reset() {
    this.showMore = {};
    this.dep.changed();

    return this.showMore;
  },

};
