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
import {$} from 'meteor/jquery';
import {clippy} from 'meteor/macrozone:clippy';
import ImportButton from '../prototypes/import_button.jsx';

export default class Index extends React.Component {

  // TODO: Hook clippy up to local state
  componentDidMount() {
    clippy.load('Peedy', (agent) => {

      // GV.clippy = agent;

      agent.show();
      Session.set("clippyVisible", true);
      agent.speak("Hei og velkommen! Du kan velge språk ved å klikke på meg.");
      agent.speak("Du kan skru meg av og på ved å trykke Ctrl+Shift+H.", true);
      Session.set('clippyState', 'languageSelection');

      let left = 0;
      let top = 0;

      $('.clippy').on({
        mousedown(event) {
          left = event.pageX;
          top = event.pageY;
        },
        mouseup(event) {
          var deltaX = event.pageX - left;
          var deltaY = event.pageY - top;
          var euclidean = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

          if (euclidean < 5) {
            agent.stopCurrent();
            agent.play('DoMagic1');
            agent.play('DoMagic2', 850, () => {
              $('#language-select').modal('show');
            });
          }
        }
      });
    });
  }

  render() {
    return (
      <div className="container-fluid index animated fadeIn">
        <div className="row animated bounceInRight">
          <div className="col-sm-6 col-md-6 outer">
            <div className="jumbotron">
              <h1>GrandView</h1>
              <p className="lead">
                Dette er et verktøy for å strukturere store informasjonsmengder.
                 Kom i gang ved å enten:</p>
              <br />
              <div className="text-center">
                <button
                  type="button"
                  className="btn btn-success"
                  data-toggle="modal"
                  data-target="#template-modal">

                  <span className="glyphicon glyphicon-plus"></span> Opprette nytt dokument
                </button>
                <br /><span className="or-separator">eller</span>
                <br />
                <ImportButton label="Importere fil fra disk"/>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default Index;
