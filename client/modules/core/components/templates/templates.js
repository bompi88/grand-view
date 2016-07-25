import React from 'react';

import TemplateTable from '../../containers/template_table';

export default class Documents extends React.Component {
  render() {
    return (
      <div className="container default-container animated fadeIn">
        <div className="row">
          <div>
            <TemplateTable dropdownClasses="pull-right" />
          </div>
        </div>
      </div>
    );
  }
}
