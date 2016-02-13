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

import MainLayout from './components/main_layout/main_layout.jsx';
import Index from './components/index/index.jsx';

export default function (injectDeps, {FlowRouter}) {
  const MainLayoutCtx = injectDeps(MainLayout);

  /**
   * Landing page
   */
  FlowRouter.route('/', {
    name: 'Index',
    action() {
      mount(MainLayoutCtx, {
        content: () => (<Index />)
      });
    }
  });


  // -- Document routes --------------------------------------------------------

  /**
   * Edit Document
   */
  FlowRouter.route('/document/:_id', {
    name: 'Document',
    action() {
      mount(MainLayoutCtx, {
        content: () => (<span>Document</span>)
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
        content: () => (<span>Documents</span>)
      });
    }
  });

  // -- Template routes --------------------------------------------------------

  /**
   * Edit Template
   */
  FlowRouter.route('/template/:_id', {
    name: 'Template',
    action() {
      mount(MainLayoutCtx, {
        content: () => (<span>Template</span>)
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
        content: () => (<span>Templates</span>)
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
        content: () => (<span>Workarea</span>)
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
        content: () => (<span>Trash</span>)
      });
    }
  });


}
