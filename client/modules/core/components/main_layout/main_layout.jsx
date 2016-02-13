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

import React from 'react';

import * as ContextMenus from '../context_menu/context_menu.jsx';
import TopNavBar from '../top_nav_bar/top_nav_bar.jsx';

const Layout = ({content = () => null }) => (
  <div>
    <ContextMenus.RootNode />
    <ContextMenus.ChapterNode />
    <ContextMenus.MediaNode />

    <TopNavBar />

    <div className="clippy"></div>

    {content()}

  </div>
);

export default Layout;
