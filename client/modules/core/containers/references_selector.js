////////////////////////////////////////////////////////////////////////////////////////////////////
// References Selectbox Container
////////////////////////////////////////////////////////////////////////////////////////////////////

import {useDeps, composeAll, compose} from 'mantra-core';
import SelectBox from '../components/prototypes/select_box';

const onPropsChange = ({ context }, onData) => {
  onData(null, { creatable: true });
};

export const depsMapper = (context, actions) => ({
  search: actions.editView.searchReferences,
  removeItem: actions.editView.removeReference,
  updateOnChange: actions.editView.setReferences,
  context: () => context
});

export default composeAll(
  compose(onPropsChange),
  useDeps(depsMapper)
)(SelectBox);
