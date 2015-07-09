////////////////////////////////////////////////////////////////////////////////
// App Top Level
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

"use strict";

if (Meteor.isClient) {

  Template.MoveStatus.events({

    'click .close-move-mode': function() {
      Session.set('isMoveMode', false);
      Session.set('showMovePopover', false);
    }

  });

  Template.Clippy.onRendered(function() {
    Meteor.defer(function() {

      clippy.load('Peedy', function(agent) {

        GV.clippy = agent;
        //console.log(agent.animations());
        agent.show();
        agent.speak("Hei og velkommen! Du kan velge språk ved å klikke på meg.");
        Session.set('clippyState', 'languageSelection');

        var left = 0,
          top = 0;

        $('.clippy').on({
          mousedown: function(event) {
            left = event.pageX;
            top = event.pageY;
          },
          mouseup: function(event) {
            var deltaX = event.pageX - left;
            var deltaY = event.pageY - top;
            var euclidean = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

            if (euclidean < 5) {
              agent.stopCurrent();
              agent.play('DoMagic1');
              agent.play('DoMagic2', 850, function() {
                $('#language-select').modal('show');
              });
            }
          }
        });
      });
    });
  });
}

if (Meteor.isServer) {
  Meteor.startup(function() {
    console.log('Meteor app started.');
  });
}
