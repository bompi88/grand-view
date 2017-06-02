import React, { Component } from 'react';
import Select from 'react-select';
import _ from 'lodash';
import { ControlLabel } from 'react-bootstrap';

class SelectBox extends Component {

  constructor(props) {
    super(props);

    this.state = {
      isLoading: false,
      options: [],
      text: ''
    };
  }

  stopPropagation(e) {
    e.preventDefault();
    e.stopPropagation();
  }

  onInputChange(text) {
    const { search } = this.props;
    this.setState({ isLoading: true, options: [], text });
    search(text).then((result) => {
      this.setState({ options: result, isLoading: false });
    });
  }

  updateValue(opts) {
    const { updateOnChange, nodeId, input: { onChange } } = this.props;

    const val = _.isArray(opts) ? opts : opts && opts.value;

    if (typeof updateOnChange !== 'undefined') {
      let adjustedValue;

      if (_.isArray(val)) {
        adjustedValue = _.map(val, (i) => {
          return { value: i.value, label: i.label };
        });
      } else {
        adjustedValue = [ _.omit(val, 'className') ];
      }
      updateOnChange(adjustedValue, nodeId);
    }

    return onChange(val);
  }

  shouldCreateNewOption({ keyCode: number }) {
    switch (number) {
      case 9:
      case 13:
        return true;
      default:
        return false;
    }
  }

  render() {
    const {
      input: { value},
      meta: { touched, error },
      multi,
      creatable,
      placeholder,
      label,
      name,
      removeItem,
      autofocus,
      style,
      promptTextCreator,
      removeText,
      noResultsText,
      onMouseEnter,
      onMouseLeave
    } = this.props;

    let SelectComponent;

    if (creatable) {
      SelectComponent = Select.Creatable;
    } else {
      SelectComponent = Select;
    }

    let className = '';

    if (touched && error) {
      className = 'has-feedback has-error';
    }

    return (
      <div className={className} style={style}>
        {label ? (<ControlLabel htmlFor={name}>{label}</ControlLabel>) : null}
        <SelectComponent
          id={name}
          value={value}
          autofocus={autofocus}
          placeholder={placeholder}
          onChange={this.updateValue.bind(this)}
          multi={multi}
          options={this.state.options}
          onInputChange={this.onInputChange.bind(this)}
          isLoading={this.state.isLoading}
          promptTextCreator={promptTextCreator}
          noResultsText={noResultsText}
          onMouseEnter={onMouseEnter}
          onMouseLeave={onMouseLeave}
          shouldKeyDownEventCreateNewOption={this.shouldCreateNewOption.bind(this)}
          optionRenderer={(option) => {
            return (
              <div>
                {option.label}
                {
                  option.className !== 'Select-create-option-placeholder' ? (
                    <button
                      type="button"
                      className="btn btn-xs btn-danger pull-right"
                      onMouseDown={this.stopPropagation.bind(this)}
                      onClick={removeItem.bind(
                        this,
                        option.value,
                        this.setState.bind(this),
                        this.state.options
                      )}
                    >
                      <span className="glyphicon glyphicon-remove"></span> {removeText}
                    </button>
                  ) : ''
                }
              </div>
            );
          }}
          valueRenderer={(option) => {
            return (
              <div>{option.label}</div>
            );
          }}
          filterOption={(option, filter) => {
            if (!filter) {
              return true;
            }

            const l = String(option['label']).toLowerCase();

            return l.indexOf(filter) >= 0;
          }}
          />
      </div>
    );
  }
}

export default SelectBox;
