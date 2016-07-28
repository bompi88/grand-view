import React from 'react';

import TemplateTrashTable from '../../containers/template_trash_table';

export default class Documents extends React.Component {
  render() {
    return (
      <div className="container default-container animated fadeIn">
        <div className="row">
          <div>
            <TemplateTrashTable dropdownClasses="pull-right" />
          </div>
        </div>
      </div>
    );
  }
}
