import WorkArea from '../components/work_area/work_area';
import { useDeps, composeWithTracker, composeAll } from 'mantra-core';

export const composer = ({ context }, onData) => {
  const { Meteor, TAPi18n, LocalState, Collections } = context();

  const _id = LocalState.get('CURRENT_DOCUMENT');
  const treeState = LocalState.get('TREE_VIEW_STATE') || 'tree';

  const text = {
    title: TAPi18n.__('work_area.title'),
    description: TAPi18n.__('work_area.description'),
    createDocument: TAPi18n.__('work_area.create_document'),
    or: TAPi18n.__('work_area.or'),
    gotoDocuments: TAPi18n.__('work_area.goto_documents'),
  };

  if (_id && Meteor.subscribe('documents.allByDocs', _id)) {
    const doc = Collections.Documents.findOne({ _id });

    onData(null, { text, doc, treeState });
  } else {
    onData(null, { text, treeState });
  }
};


export const depsMapper = (context, actions) => ({
  createNewDocument: actions.workArea.createNewDocument,
  gotoDocuments: actions.workArea.gotoDocuments,
  context: () => context,
});

export default composeAll(
  composeWithTracker(composer),
  useDeps(depsMapper),
)(WorkArea);
