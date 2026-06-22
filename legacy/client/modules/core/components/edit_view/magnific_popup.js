import React from 'react';

import 'magnific-popup/dist/magnific-popup.css';

export default class MagnificPopup extends React.Component {
  componentWillReceiveProps(newProps) {
    if (this.props.open !== newProps.open) {
      this.toggleDialog(newProps);
    }
  }

  render() {
    return (
      <div ref="mfpRoot" className="white-popup mfp-hide">
        {this.props.children}
      </div>
    );
  }

  toggleDialog(props) {
    const { context } = this.props;
    const { $ } = context();
    const self = this;
    if (props.open) {
      $.magnificPopup.open({
        items: {
          src: props.src,
          type: props.type ? props.type : 'inline',
          iframe: {
            preload: false,
          },
        },
        callbacks: {
          close() {
            self.props.onClose();
          },
        },
      });
    } else {
      $.magnificPopup.close();
    }
  }
}
