// //////////////////////////////////////////////////////////////////////////////
// Clippy Container
// //////////////////////////////////////////////////////////////////////////////
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
// //////////////////////////////////////////////////////////////////////////////

import Clippy from '../components/clippy/clippy';
import { useDeps, composeWithTracker, composeAll } from 'mantra-core';

export const composer = ({ context }, onData) => {
  const { TAPi18n } = context();

  const text = {
    welcome: TAPi18n.__('clippy.welcome_message'),
    hideMe: TAPi18n.__('clippy.hide_me'),
  };

  onData(null, { text });
};

export const depsMapper = (context, actions) => ({
  openLanguageModal: actions.clippy.openLanguageModal,
  context: () => context,
});

export default composeAll(
  composeWithTracker(composer),
  useDeps(depsMapper),
)(Clippy);
