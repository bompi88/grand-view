import React from 'react';
import $ from 'jquery';

class Dot extends React.Component {

  componentDidMount() {
    $(this.refs.dot).tooltip({
      container: 'body',
    });
  }

  render() {
    const { label } = this.props;
    return (
      <span
        ref="dot"
        className="dot dot-bright-blue waves"
        data-toggle="tooltip"
        data-placement="bottom"
        data-original-title={label}
      >&nbsp;</span>
    );
  }
}

Dot.defaultProps = {
  label: 'Tooltip text here',
};

export default Dot;
