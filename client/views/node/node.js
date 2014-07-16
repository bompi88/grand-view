/**
 * NodeLevel: Helpers
 */

Template.NodeLevel.helpers({
  hasChild: function() {
    return this.children && this.children.length > 0;
  },

  nodesWithIndex: function() {
    if (this.nodes) {
      return this.nodes.map(function (node, index) {
        return _.extend(node, {index: index + 1 });
      });
    }
    return null;
  },

  nextLevelText: function (cur, next) {
    var lvl =  "" + cur + "." + next;

    if(parseInt(cur) == 0)
      lvl = next;
  
    return _.extend(this, {level: lvl});
  } 
});