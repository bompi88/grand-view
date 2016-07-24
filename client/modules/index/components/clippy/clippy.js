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
import {clippy} from 'meteor/macrozone:clippy';

export default class Clippy extends React.Component {

  componentDidMount() {
    const {openLanguageModal} = this.props;
    const {TAPi18n, $} = this.props.context();

    clippy.load('Peedy', (agent) => {
      const uuid = Math.random().toString();

      this.setState({agent, uuid});

      agent.show();

      agent.speak(TAPi18n.__('clippy.welcome_message'));
      agent.speak(TAPi18n.__('clippy.hide_me'), true);

      let left = 0;
      let top = 0;

      $('.clippy').attr('data-uuid', uuid);

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
              openLanguageModal();
            });
          }
        }
      });
    });
  }

  componentWillUnmount() {
    const {$} = this.props.context();

    this.state.agent.hide(false, () => {
      $('.clippy[data-uuid="' + this.state.uuid + '"]').remove();
      $('.clippy-balloon').remove();
    });
  }

  render() {
    return <div></div>;
  }
}

export default Clippy;
