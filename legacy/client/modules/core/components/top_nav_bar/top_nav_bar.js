// //////////////////////////////////////////////////////////////////////////////
// TopNavbar SCSS Styles
// //////////////////////////////////////////////////////////////////////////////
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
// //////////////////////////////////////////////////////////////////////////////

/* globals _require */

import React from 'react';
import { FlowRouter } from 'meteor/kadira:flow-router';
import NavBarButton from './nav_bar_button';

const { shell } = _require('electron');

export default class TopNavBar extends React.Component {

  openConcept() {
    shell.openExternal('http://www.ntnu.no/concept/');
  }

  gotoHome(e) {
    e.preventDefault();
    FlowRouter.go('Index');
  }

  renderButton(button) {
    return (
      <NavBarButton
        key={button.route}
        route={button.route}
        name={button.label}
        hasDot={button.hasDot}
        dotTooltip={button.dotTooltip}
      />
    );
  }

  renderButtons() {
    const { buttons } = this.props;

    return buttons.map(button => this.renderButton(button));
  }

  render() {
    const { text } = this.props;

    return (
      <div className="navbar navbar-default navbar-fixed-top animated fadeInDown" role="navigation">
        <div className="container-fluid">
          <span
            className="navbar-brand navbar-right"
            rel="home"
            onClick={this.openConcept}
          >
            <img src="/images/concept_logo.png" alt={text.conceptLogo} />
          </span>

          <div className="navbar-header">
            <button
              type="button"
              className="navbar-toggle"
              data-toggle="collapse"
              data-target=".navbar-collapse"
              aria-expanded="false"
              aria-controls="navbar"
            >

              <span className="sr-only">{text.toggleNavigation}</span>
              <span className="icon-bar" />
              <span className="icon-bar" />
              <span className="icon-bar" />
            </button>

            <a
              className="navbar-brand"
              rel="home"
              href="#"
              onClick={this.gotoHome}
              title={text.gotoHome}
            >{text.grandview}</a>
          </div>
          <div className="navbar-collapse collapse">
            <ul className="nav navbar-nav">
              {this.renderButtons()}
            </ul>
          </div>
        </div>
      </div>
    );
  }
}
