import React from 'react';

// {{> DocumentTable documents=this.templates editOptions="true" tableName="templates" label="mal" emptyText="Ingen maler funnet"}}
export default class Templates extends React.Component {
  render() {
    return (
      <div className="container default-container animated fadeIn">
        <div className="row">
          <div>
            <h3>
              <span className="glyphicon glyphicon-tree-conifer"></span> Mine maler
            </h3>
          </div>

        </div>
      </div>
    );
  }
}
