////////////////////////////////////////////////////////////////////////////////////////////////////
// Tags View Container
////////////////////////////////////////////////////////////////////////////////////////////////////

import {useDeps, composeAll, composeWithTracker} from 'mantra-core';
import TagsView from '../components/tree/tags_view';
import {_} from 'meteor/underscore';

const onPropsChange = ({ context, doc }, onData) => {
  const { Meteor, LocalState, Collections } = context();
  const mainDocId = LocalState.get('CURRENT_DOCUMENT');

  if (Meteor.subscribe('nodes.byDoc', mainDocId, 'media').ready()) {
    const nodes = Collections.Nodes.find({
      mainDocId,
      nodeType: 'media'
    }).fetch();

    const tags = {};

    nodes.forEach((node) => {
      if (node.tags) {
        node.tags.forEach((tag) => {
          if (!tags[tag.value]) {
            tags[tag.value] = [];
          }
          tags[tag.value].push(node);
        });
      }
    });

    const items = _.map(tags, (nds, tag) => {
      return { tag, nodes: nds };
    });

    return onData(null, { items });
  }

  onData(null, {});
};

export default composeAll(
  composeWithTracker(onPropsChange),
  useDeps()
)(TagsView);
