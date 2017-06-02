////////////////////////////////////////////////////////////////////////////////////////////////////
// Tags Selectbox Container
////////////////////////////////////////////////////////////////////////////////////////////////////

import { useDeps, composeAll, composeWithTracker } from 'mantra-core';
import SelectBox from '../components/prototypes/select_box';

const onPropsChange = ({ context }, onData) => {
  const { Meteor, Collections } = context();

  if (Meteor.subscribe('tags').ready()) {
    const options = Collections.Tags.find({}, { sort: { count: -1 }, limit: 20 }).fetch();
    return onData(null, { creatable: true, options });
  }
  onData(null, { creatable: true });
};

export const depsMapper = (context, actions) => ({
  search: actions.editView.searchTags,
  removeItem: actions.editView.removeTag,
  updateOnChange: actions.editView.setTags,
  context: () => context
});

export default composeAll(
  composeWithTracker(onPropsChange),
  useDeps(depsMapper)
)(SelectBox);
