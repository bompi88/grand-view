import React from 'react';

import TemplateTable from '../../containers/template_table';

export default class Documents extends React.Component {
  render() {
    return (
      <div className="container default-container animated fadeIn">
        <div className="row">
          <div>
            <h3>
              <span className="glyphicon glyphicon-book"></span> Mine maler
            </h3>

            <TemplateTable
              tableName="templates"
              label="mal"
              hasTemplate={false}
              editOptions={true}
              dropdownClasses="pull-right"
              emptyText="Ingen maler funnet" />
          </div>
        </div>
      </div>
    );
  }
}
