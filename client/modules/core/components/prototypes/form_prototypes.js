////////////////////////////////////////////////////////////////////////////////////////////////////
// Form prototypes
//--------------------------------------------------------------------------------------------------
// Methods used to render inputs by redux-form.
////////////////////////////////////////////////////////////////////////////////////////////////////

import { FormGroup, FormControl, ControlLabel } from 'react-bootstrap';

export const renderTextInput = (field) => {
  const {
    placeholder,
    style,
    componentClass,
    autoComplete,
    rows,
    type,
    input,
    label,
    onChange,
    onMouseEnter,
    onMouseLeave
  } = field;

  let customInput;

  if (onChange) {
    customInput = {
      ...input,
      onChange: (e) => {
        onChange(e, input.onChange);
      }
    };
  } else {
    customInput = input;
  }

  return (
    <FormGroup>
      {label ? (<ControlLabel>{label}</ControlLabel>) : null}
      <FormControl
        placeholder={placeholder}
        style={style}
        componentClass={componentClass}
        autoComplete={autoComplete}
        rows={rows}
        type={type}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        {...customInput}
      />
      <FormControl.Feedback className="form-control-feedback-default"/>
    </FormGroup>
  );
};
