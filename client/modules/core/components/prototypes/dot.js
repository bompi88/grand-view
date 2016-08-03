import React from 'react';
import {$} from 'meteor/jquery';

class Dot extends React.Component {

  componentDidMount() {
    $('.dot').tooltip({
      container: 'body'
    });
  }

  componentWillUpdate() {
    $('.dot').tooltip({
      container: 'body'
    });
  }

  render() {
    const {label} = this.props;
    return (
      <span
        id="work-area-dot"
        className="dot dot-bright-blue waves"
        data-toggle="tooltip"
        data-placement="bottom"
        title={label}
      >&nbsp;</span>
    );
  }
}

Dot.defaultProps = {
  label: 'Tooltip text here'
};

export default Dot;
