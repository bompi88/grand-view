export default {

  insertNodeOfType({ Collections, LocalState, Meteor, $ }, parentNode, nodeType) {
    const { _id: parent, level, userId } = parentNode;

    const children = Collections.Nodes.find({ parent, nodeType }).fetch();
    const position = children.length + 1;

    const doc = {
      parent,
      level: level ? level + 1 : 1,
      userId,
      lastChanged: new Date(),
      position,
      nodeType,
      mainDocId: LocalState.get('CURRENT_DOCUMENT'),
    };

    if (nodeType === 'chapter') {
      doc.isCollapsed = false;
    }

    // Insert a node at the given branch
    return Collections.Nodes.insert(doc,
    (error, nodeId) => {
      if (error) {
        return console.log(error);
      }
      if (nodeType === 'chapter') {
        Collections.Nodes.update({
          _id: doc.parent,
        }, {
          $set: { isCollapsed: false },
        }, (err) => {
          if (err) {
            return console.log(error);
          }

          return LocalState.set('RENAME_NODE', nodeId);
        });
      }
    });
  },

  removeNode({ Meteor }, node) {
    Meteor.call('document.removeNode', node, (err) => {
      console.log('Removed');
    });
  },
};
