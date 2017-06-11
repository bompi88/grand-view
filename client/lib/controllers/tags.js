//--------------------------------------------------------------------------------------------------
// Tags Controller
//--------------------------------------------------------------------------------------------------

import { Tracker } from 'meteor/tracker';
import { _ } from 'meteor/underscore';

export default {
  collapsed: [],
  dep: new Tracker.Dependency(),

  isCollapsed(tag) {
    this.dep.depend();

    return this.collapsed.indexOf(tag) > -1;
  },

  uncollapse(tag) {
    const index = this.collapsed.indexOf(tag);

    if (this.collapsed.indexOf(tag) > -1) {
      this.collapsed.splice(index, 1);

      this.dep.changed();
      return this.collapsed;
    }

    return this.collapsed;
  },

  collapse(tag) {
    if (this.collapsed.indexOf(tag) === -1) {
      this.collapsed.push(tag);

      this.dep.changed();
      return this.collapsed;
    }

    return this.collapsed;
  },

  collapseAll(tags) {
    this.collapsed = _.unique(_.union(this.collapsed, tags));

    this.dep.changed();
    return this.collapsed;
  },

  reset() {
    this.collapsed = [];

    this.dep.changed();
    return this.collapsed;
  },
};
