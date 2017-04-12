export default {

  insertNodeOfType({Collections, LocalState}, parentNode, nodeType) {
    const {_id: parent, level, userId} = parentNode;

    const children = Collections.Nodes.find({ parent }).fetch();
    const position = children.length + 1;

    // Insert a node at the given branch
    Collections.Nodes.insert({
      parent,
      level: level ? level + 1 : 1,
      userId,
      lastChanged: new Date(),
      position,
      nodeType,
      mainDocId: LocalState.get('CURRENT_DOCUMENT')
    },
    (error, nodeId) => {
      if (error) {
        console.log(error);
      }


    });
  },

  removeNode({Meteor}, node) {
    Meteor.call('document.removeNode', node, (err) => {
      console.log('removed')
    });
  }
};
