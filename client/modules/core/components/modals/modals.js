import React from 'react';
import CreateModal from '/client/modules/modals/containers/create_modal';
import ExportOfficeModal from '/client/modules/modals/containers/export_office_modal';

export default class Modals extends React.Component {
  render() {
    return (
      <div>
        <CreateModal />
        <ExportOfficeModal />
      </div>
    );
  }
}
