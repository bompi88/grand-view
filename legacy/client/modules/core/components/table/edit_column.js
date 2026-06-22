import React from 'react';

import ExportButton from './../prototypes/export_button';

class EditColumn extends React.Component {

  render() {
    const { exportDocument, removeDocument, text, doc } = this.props;

    return (
      <td>
        <div className="btn-group pull-right">
          <ExportButton
            className="btn-sm"
            label={text.export}
            onClick={exportDocument.bind(this, doc._id)}
            doc={doc}
          />

          <button
            type="button"
            className="btn btn-danger btn-sm"
            onClick={removeDocument.bind(this, doc._id)}
          >
            <span className="glyphicon glyphicon-trash" /> {text.remove}
          </button>
        </div>
      </td>
    );
  }

}

export default EditColumn;
