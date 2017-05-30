////////////////////////////////////////////////////////////////////////////////
// ImportButton Component
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


class ImportButton extends React.Component {

  render() {
    const classes = 'btn btn-default import' + this.props.className;
    return (
      <div className={classes} onClick={this.props.onClick}>
        <span className="glyphicon glyphicon-import" aria-hidden="true"></span> {this.props.label}
      </div>
    );
  }
}

export default ImportButton;
