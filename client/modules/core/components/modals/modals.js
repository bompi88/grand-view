import React from 'react';
import NewDocumentModal from '/client/modules/modals/containers/new_document_modal';
import NewTemplateModal from '/client/modules/modals/containers/new_template_modal';
import LanguageModal from '/client/modules/modals/containers/language_modal';
import ExportOfficeModal from '/client/modules/modals/containers/export_office_modal';

export default class Modals extends React.Component {
  render() {
    return (
      <div>
        <NewDocumentModal />
        <NewTemplateModal />
        <LanguageModal />
        <ExportOfficeModal />
      </div>
    );
  }
}
