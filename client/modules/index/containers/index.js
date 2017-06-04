////////////////////////////////////////////////////////////////////////////////
// Index Container
////////////////////////////////////////////////////////////////////////////////
//
// Copyright 2015 Concept
//
// Licensed under the Apache License, Version 2.0 (the 'License');
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
// http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an 'AS IS' BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
////////////////////////////////////////////////////////////////////////////////


import Index from '../components/index/index';
import {useDeps, composeWithTracker, composeAll} from 'mantra-core';

export const composer = ({context, clearStates}, onData) => {
  const {TAPi18n} = context();

  const text = {
    header: TAPi18n.__('index.header'),
    description: TAPi18n.__('index.description'),
    createDocument: TAPi18n.__('index.create_document'),
    importDocuments: TAPi18n.__('index.import_document'),
    getStarted: TAPi18n.__('index.get_started'),
    manual: TAPi18n.__('index.manual'),
    here: TAPi18n.__('index.here'),
    or: TAPi18n.__('index.or')
  };

  onData(null, {text});

  return clearStates;
};

export const depsMapper = (context, actions) => ({
  openCreateModal: actions.index.openCreateModal,
  importFile: actions.index.importFile,
  context: () => context
});

export default composeAll(
  composeWithTracker(composer),
  useDeps(depsMapper)
)(Index);
