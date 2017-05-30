import React from 'react';

class TemplateColumn extends React.Component {

  render() {
    const {value} = this.props;

    return <td className="row-item">{value}</td>;
  }

}

export default TemplateColumn;
