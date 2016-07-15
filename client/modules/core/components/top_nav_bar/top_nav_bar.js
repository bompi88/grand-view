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
import {FlowRouter} from 'meteor/kadira:flow-router';

class NavBarButton extends React.Component {

  renderAsActive() {
    const currentRoute = FlowRouter.getRouteName();
    return currentRoute === this.props.route ? 'active' : '';
  }

  render() {
    return (
      <li
        className={this.renderAsActive()}
        data-toggle="collapse"
        data-target=".in">

        <a href={FlowRouter.path(this.props.route)}>{this.props.name}</a>
      </li>
    );
  }
}

export default class TopNavBar extends React.Component {

  isActiveRoute(route) {
    const currentRoute = FlowRouter.getRouteName();
    return currentRoute === route;
  }

  renderWorkAreaButton() {
    if (this.isActiveRoute('Document')) {
      return <NavBarButton route="Document" name="Arbeidsområde"/>;
    }
    if (this.isActiveRoute('Template')) {
      return <NavBarButton route="Template" name="Arbeidsområde"/>;
    }

    return <NavBarButton route="WorkArea" name="Arbeidsområde"/>;
  }

  render() {
    return (
      <div className="navbar navbar-default navbar-fixed-top animated fadeInDown" role="navigation">
        <div className="container-fluid">
          <span className="navbar-brand navbar-right" rel="home" href="#">
            <img src="/images/concept_logo.png" alt="Logoen til Concept" />
          </span>

          <div className="navbar-header">
            <button
              type="button"
              className="navbar-toggle"
              data-toggle="collapse"
              data-target=".navbar-collapse"
              aria-expanded="false"
              aria-controls="navbar">

              <span className="sr-only">Toggle navigation</span>
              <span className="icon-bar"></span>
              <span className="icon-bar"></span>
              <span className="icon-bar"></span>
            </button>

            <a className="navbar-brand" rel="home" href="/" title="Til forsiden">GrandView</a>
          </div>
          <div className="navbar-collapse collapse">
            <ul className="nav navbar-nav">
              <NavBarButton route="Documents" name="Mine dokumenter"/>
              <NavBarButton route="Templates" name="Mine maler"/>
              <NavBarButton route="Trash" name="Papirkurv"/>

              {this.renderWorkAreaButton()}

            </ul>
          </div>
        </div>
      </div>
    );
  }
}
