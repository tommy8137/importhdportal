import React, { Component, PropTypes } from 'react'
import { Field, FormSection } from 'redux-form'
import styles from './form-setting.css'
import CSSModules from 'react-css-modules'
import { printErrorMsg, normalizeInt } from '../../../utils'
import ConditionSelect from './components/ConditionSelect'
import optionValue from './option-value'

export {
  optionValue,
}

@CSSModules(styles)
export default class FormSetting extends Component {
  static propTypes = {
    l: PropTypes.func,
    lastPoint: PropTypes.object,
    data: PropTypes.object,
    formName: PropTypes.string,
    sectionName: PropTypes.string,
  }

  static defaultProps = {
    sectionName: 'FormSetting',
  }

  render() {
    const {
      l,
      lastPoint: { sbp },
      formName,
      sectionName,
      data: {
        formValues,
        formErrors,
        actions,
        sectionFields,
      },
    } = this.props

    const sbpValueIsTouched = !!((sectionFields && sectionFields.sbpValue) || formValues.sbpValue)
      // ? sectionFields.sbpValue.visited
      // : false

    const isSbpValueExist = formValues && formValues.sbpValue
    const isConditionValueExist = formValues && formValues.condition && formValues.condition.value
    let unit
    if(isConditionValueExist) {
      unit = (formValues.condition.value === optionValue[2] || formValues.condition.value === optionValue[3])
              ? '%'
              : 'mmHg'
    }

    const isAnyError = Object.keys(formErrors).length
    return (
      <FormSection styleName="container" name={sectionName}>
        <div styleName="table-default">
          <div styleName="body">
            <div styleName="row">
              <Field
                l={l}
                formName={formName}
                sectionName={sectionName}
                previousSBP={(isSbpValueExist) ? formValues.sbpValue : null}
                lastPointSBP={sbp}
                name="condition"
                changeAction={actions.change}
                component={ConditionSelect} />
              <Field
                styleName={isAnyError && sbpValueIsTouched ? 'shadow-input-error' : 'shadow-input'}
                name="sbpValue"
                component="input"
                type="text"
                normalize={normalizeInt}/>
              <div styleName="unit">
                {unit}
              </div>
              <div styleName="error-container">
              {
                <div styleName={isAnyError && sbpValueIsTouched ? 'error-box' : 'error-box-hidden'}>
                  {printErrorMsg(l, formErrors.sbpValue)}
                </div>
              }
              </div>
            </div>
          </div>
        </div>
      </FormSection>
    )
  }
}

