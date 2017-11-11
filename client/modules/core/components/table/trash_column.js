import React from 'react';

class TrashColumn extends React.Component {

  render() {
    const { remove, restore, text, doc } = this.props;

    return (
      <td>
        <div className="btn-group pull-right">
          <button
            type="button"
            className="btn btn-default btn-sm"
            onClick={restore.bind(this, doc._id)}
          >
            <span className="glyphicon glyphicon-repeat" /> {text.restore}
          </button>

          <button
            type="button"
            className="btn btn-danger btn-sm"
            onClick={remove.bind(this, doc._id)}
          >
            <span className="glyphicon glyphicon-trash" /> {text.remove}
          </button>
        </div>
      </td>
    );
  }

}

export default TrashColumn;
