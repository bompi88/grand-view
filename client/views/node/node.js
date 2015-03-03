/**
 * NodeLevel: Helpers
 */

Template.NodeLevel.helpers({
  hasChildren: function() {
    return Nodes.find({parent: this._id}).count() > 0;
  },

  children: function() {
    return Nodes.find({parent: this._id});
  }
});


Template.NodeLevel.rendered = function() {
  console.log(this)
  var self = this;  
    $('.tree li.node.root li.node span').contextMenu('right-click-menu', {
        bindings: {
            'add-node': function(t) {
              var elData = UI.getData(t);

              if(elData && (elData.level > 4)) {
                alert('Det er for mange underkategorier, prøv heller å omstrukturere litt i hierarkiet.');
                return;
              } else {
                if(elData && elData._id) {
                  Nodes.insert({ parent: elData._id, title: "Ingen tittel", level: elData.level + 1, userId: elData.userId }, function(error, nodeId) {
                    if(!error) {
                      Documents.update({_id: Session.get('mainDocument')}, { $addToSet: {children: nodeId} });

                      // TODO: add this subscription to a subscription handler, if not the memory can blow up :p
                      Meteor.subscribe('nodeById', nodeId);
                    }
                  });
                }
              }
            },
            'delete-node': function(t) {
                alert('Trigger was '+t.id+'\nAction was Email');
            },
            'edit-node': function(t) {
              var elData = UI.getData(t);

              if(elData && elData._id) {
                Tabs.addTab(elData._id);
                Session.set('nodeInFocus', elData._id);
              }
            }
        }
    });
};