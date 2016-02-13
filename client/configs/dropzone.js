////////////////////////////////////////////////////////////////////////////////
// Basic event handlers for the dropzone
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

import {Meteor} from 'meteor/meteor';
import {$} from 'meteor/jquery';

Meteor.startup(() => {

  // Prevent drop outside of the droppable area
  window.addEventListener('dragover', (e) => {
    const ec = e || event;
    ec.preventDefault();
  }, false);

  window.addEventListener('drop', (e) => {
    const ec = e || event;
    ec.preventDefault();
  }, false);

  // prevent deafult drop behaviour of dropsone
  $('html')
    .on('dragenter', '.dropzone', (event) => {
      event.preventDefault();
      event.stopPropagation();
      return true;
    }).on('dragover', '.dropzone', (event) => {
      event.preventDefault();
      event.stopPropagation();
      return true;
    }).on('drop', '.dropzone', (event) => {
      event.preventDefault();
      event.stopPropagation();
      return true;
    });

});
