////////////////////////////////////////////////////////////////////////////////
// NavBar Button Component
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
import {FlowRouter} from 'meteor/kadira:flow-router';

import Dot from '../prototypes/dot';

class NavBarButton extends React.Component {

  renderAsActive(route) {
    const currentRoute = FlowRouter.getRouteName();
    return currentRoute === route ? 'active' : '';
  }

  render() {

    const {name, route, hasDot, dotTooltip} = this.props;

    return (
      <li
        className={this.renderAsActive(route)}
        data-toggle="collapse"
        data-target=".in"
      >

        <a href={FlowRouter.path(route)}>{name}</a>
        {hasDot ? (<Dot label={dotTooltip} />) : ''}
      </li>
    );
  }
}

NavBarButton.propTypes = {
  route: React.PropTypes.string.isRequired,
  name: React.PropTypes.string.isRequired
};

export default NavBarButton;
