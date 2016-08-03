import React from 'react';

import DocumentTable from '../table/table';
import TemplateTableDropdown from '../../containers/template_table_dropdown';

export default class Templates extends React.Component {
  render() {
    const {text} = this.props;

    return (
      <div className="container default-container animated fadeIn">
        <div className="row">
          <div>
            <TemplateTableDropdown {...this.props} dropdownClasses="pull-right" />
            <h3>
              <span className="glyphicon glyphicon-tree-conifer"></span> {text.header}
            </h3>
            <DocumentTable {...this.props}/>
          </div>
        </div>
      </div>
    );
  }
}
