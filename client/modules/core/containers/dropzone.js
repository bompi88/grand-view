////////////////////////////////////////////////////////////////////////////////////////////////////
// Edit View Form Container
////////////////////////////////////////////////////////////////////////////////////////////////////

import {useDeps, composeAll, compose} from 'mantra-core';
import Dropzone from '../components/edit_view/dropzone';

const onPropsChange = ({ context }, onData) => {
  const { TAPi18n } = context();

  const text = {
    uploadFiles: TAPi18n.__('edit_view.form.uploadFiles'),
    uploadingFile: TAPi18n.__('edit_view.form.uploadingFile')
  };

  onData(null, { text });
};

export const depsMapper = (context, actions) => ({
  // setName: actions.editView.setName,
  // setDescription: actions.editView.setDescription,
  context: () => context
});

export default composeAll(
  compose(onPropsChange),
  useDeps(depsMapper)
)(Dropzone);
