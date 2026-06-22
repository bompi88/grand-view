// //////////////////////////////////////////////////////////////////////////////
// Top Navigation Bar Container
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

import TopNavBar from '../components/top_nav_bar/top_nav_bar';
import { useDeps, composeWithTracker, composeAll } from 'mantra-core';

export const composer = ({ context }, onData) => {
  const { TAPi18n, LocalState, FlowRouter } = context();
  const hasDot = LocalState.get('CURRENT_DOCUMENT') &&
    FlowRouter.current().route.name !== 'WorkArea';

  const text = {
    grandview: TAPi18n.__('navbar.grandview'),
    conceptLogo: TAPi18n.__('navbar.concept_logo'),
    toggleNavigation: TAPi18n.__('navbar.toggle_navigation'),
    gotoHome: TAPi18n.__('navbar.goto_home'),
  };

  const buttons = [
    {
      route: 'Documents',
      label: TAPi18n.__('navbar.my_documents'),
    },
    {
      route: 'Templates',
      label: TAPi18n.__('navbar.my_templates'),
    },
    {
      route: 'Trash',
      label: TAPi18n.__('navbar.trash'),
    },
    {
      route: 'WorkArea',
      label: TAPi18n.__('navbar.work_area'),
      hasDot,
      dotTooltip: TAPi18n.__('navbar.work_area_tooltip'),
    },
  ];

  onData(null, { text, buttons });
};

export default composeAll(
  composeWithTracker(composer),
  useDeps(),
)(TopNavBar);
