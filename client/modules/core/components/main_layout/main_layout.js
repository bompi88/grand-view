////////////////////////////////////////////////////////////////////////////////
// TopNavbar SCSS Styles
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

import 'react-notifications/lib/notifications.css';

import React from 'react';
import {NotificationContainer} from 'react-notifications';
import TopNavBar from '../../containers/top_nav_bar';
import Modals from '../modals/modals';
import ContextMenuRoot from '../../containers/context_menu_root';
import ContextMenuChapter from '../../containers/context_menu_chapter';
import ContextMenuNode from '../../containers/context_menu_node';

const Layout = ({content = () => null }) => (
  <div>
    <ContextMenuRoot />
    <ContextMenuChapter />
    <ContextMenuNode />

    <TopNavBar />

    <div className="clippy"></div>

    {content()}

    <Modals />
    <NotificationContainer/>
  </div>
);

export default Layout;
