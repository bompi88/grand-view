////////////////////////////////////////////////////////////////////////////////
// Index Component
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
import ImportButton from '/client/modules/core/components/prototypes/import_button';
import Clippy from '../../containers/clippy';

/* globals _require */

const { BrowserWindow } = _require('electron').remote;

class Index extends React.Component {

  openUserManual(e) {
    e.preventDefault();
    let win = new BrowserWindow({width: 800, height: 600});
    win.on('closed', () => {
      win = null;
    });
    win.loadURL(location.origin + '/grandview-user-manual.pdf');
    win.setMenu(null);
  }

  render() {
    const {openCreateModal, importFile, text} = this.props;

    return (
      <div className="container-fluid index animated fadeIn">
        <Clippy />
        <div className="row animated bounceInRight">
          <div className="col-sm-6 col-md-6 outer">
            <div className="jumbotron" style={{ padding: '40px' }}>
              <h1>{text.header}</h1>
              <p className="lead">{text.description}</p>
              <p className="lead">
                {text.manual} <a href="" onClick={this.openUserManual.bind(this)}>{text.here}</a>.
              </p>
              <div style={{ fontWeight: 400, fontSize: '18px' }}>{text.getStarted}</div>
              <br />
              <div className="text-center">
                <button
                  type="button"
                  className="btn btn-success"
                  onClick={openCreateModal}>

                  <span className="glyphicon glyphicon-plus"></span> {text.createDocument}
                </button>
                <br /><span className="or-separator">{text.or}</span>
                <br />
                <ImportButton label={text.importDocuments} onClick={importFile}/>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

Index.propTypes = {
  text: React.PropTypes.shape({
    header: React.PropTypes.string.isRequired,
    description: React.PropTypes.string.isRequired,
    createDocument: React.PropTypes.string.isRequired,
    importDocuments: React.PropTypes.string.isRequired,
    or: React.PropTypes.string.isRequired
  }),
  openCreateModal: React.PropTypes.func.isRequired,
  importFile: React.PropTypes.func.isRequired
};

export default Index;
