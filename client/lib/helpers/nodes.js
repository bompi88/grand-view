export default {

  insertNodeOfType({Collections, LocalState}, parentNode, nodeType) {
    const {_id: parent, level, userId} = parentNode;

    const children = Collections.Nodes.find({ parent, nodeType: 'chapter' }).fetch();
    const position = children.length + 1;

    const doc = {
      parent,
      level: level ? level + 1 : 1,
      userId,
      lastChanged: new Date(),
      position,
      nodeType,
      mainDocId: LocalState.get('CURRENT_DOCUMENT')
    };

    if (nodeType === 'chapter') {
      doc.isCollapsed = false;
    }

    // Insert a node at the given branch
    return Collections.Nodes.insert(doc,
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
