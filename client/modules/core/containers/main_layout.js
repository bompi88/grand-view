////////////////////////////////////////////////////////////////////////////////////////////////////
// Main Layout Container
////////////////////////////////////////////////////////////////////////////////////////////////////

import {useDeps, composeAll, composeWithTracker} from 'mantra-core';
import MainLayout from '../components/main_layout/main_layout';

const onPropsChange = ({ context, helmet = {} }, onData) => {
  const { Store } = context();

  onData(null, {
    store: Store
  });
};

export default composeAll(
  composeWithTracker(onPropsChange),
  useDeps()
)(MainLayout);
