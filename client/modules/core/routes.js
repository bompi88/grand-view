////////////////////////////////////////////////////////////////////////////////
// Client Routes
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
import {mount} from 'react-mounter';

import MainLayout from './containers/main_layout';
import Documents from './containers/documents';
import Templates from './containers/templates';
import Trash from './containers/trash';
import WorkArea from './containers/work_area';
import Index from '/client/modules/index/containers/index';

export default function (injectDeps, {FlowRouter}) {
  const MainLayoutCtx = injectDeps(MainLayout);

  // -- Document routes --------------------------------------------------------

  /**
   * Index page
   */
  FlowRouter.route('/', {
    name: 'Index',
    action() {
      mount(MainLayoutCtx, {
        content: () => <Index />
      });
    }
  });

  /**
   * View Documents
   */
  FlowRouter.route('/documents', {
    name: 'Documents',
    action() {
      mount(MainLayoutCtx, {
        content: () => <Documents />
      });
    }
  });

  /**
   * View Templates
   */
  FlowRouter.route('/templates', {
    name: 'Templates',
    action() {
      mount(MainLayoutCtx, {
        content: () => <Templates />
      });
    }
  });

  // -- Miscellaneous routes ---------------------------------------------------

  /**
   * WorkArea
   */
  FlowRouter.route('/workarea', {
    name: 'WorkArea',
    action() {
      mount(MainLayoutCtx, {
        content: () => <WorkArea />
      });
    }
  });

  /**
   * Trash Can
   */
  FlowRouter.route('/trash', {
    name: 'Trash',
    action() {
      mount(MainLayoutCtx, {
        content: () => <Trash />
      });
    }
  });

}
