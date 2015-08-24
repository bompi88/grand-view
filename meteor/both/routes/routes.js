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

'use strict';

/**
 * Landing page
 */
Router.route('/', {
  name: 'Index',
  controller: 'GV.routeCtrls.Index'
});

// -- Document routes ----------------------------------------------------------

/**
 * Edit Document
 */
Router.route('/document/:_id', {
  name: 'Document',
  controller: 'GV.routeCtrls.Document'
});

/**
 * View Documents
 */
Router.route('/documents', {
  name: 'Documents',
  controller: 'GV.routeCtrls.Documents'
});

// -- Template routes ----------------------------------------------------------

/**
 * Edit Template
 */
Router.route('/template/:_id', {
  name: 'Template',
  template: 'Document',
  controller: 'GV.routeCtrls.Document'
});

/**
 * View Templates
 */
Router.route('/templates', {
  name: 'Templates',
  controller: 'GV.routeCtrls.Templates'
});

// -- Miscellaneous routes -----------------------------------------------------

/**
 * WorkArea
 */
Router.route('/workarea', {
  name: 'WorkArea',
  controller: 'GV.routeCtrls.WorkArea'
});

/**
 * Trash Can
 */
Router.route('/trash', {
  name: 'Trash',
  controller: 'GV.routeCtrls.Trash'
});
