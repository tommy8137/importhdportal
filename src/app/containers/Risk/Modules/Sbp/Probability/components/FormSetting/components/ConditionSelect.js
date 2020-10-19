import React, { Component, PropTypes } from 'react'
import CSSModules from 'react-css-modules'
import styles from '../form-setting.css'
import Select from 'react-select'
import optionValue from '../option-value'

@CSSModules(styles)
export default class ConditionSelect extends Component {
  static propTypes = {
    lastPointSBP: PropTypes.number,
    l: PropTypes.func,
    changeAction: PropTypes.func,
    input: PropTypes.object,
  }

  state = {
    condition: null,
  }

  onChange = (currentConditionObj) => {
    const { formName, sectionName, lastPointSBP, previousSBP, changeAction } = this.props
    const previousCondition = this.state.condition
    const previousIdx = optionValue.findIndex((option) => (previousCondition === option))
    const currentIdx = optionValue.findIndex((option) => (currentConditionObj.value === option))
    const previousGroup = parseInt(previousIdx / 2)
    const currentGroup = parseInt(currentIdx / 2)

    if (previousIdx !== currentIdx) {
      this.setState({ condition: currentConditionObj.value })
      if (currentGroup !== previousGroup) {
        let resultSBP
        if (currentGroup === 1) {
          // mmhg -> %
          // abs(origin - sbp) / sbp * 100%
          resultSBP = Math.abs(previousSBP - lastPointSBP) / lastPointSBP * 100
        } else {
          // % -> mmhg
          // increase, sbp * (1 + origin%)
          // decrease, sbp * (1 - origin%)
          if (previousIdx === 2) {
            resultSBP = lastPointSBP * (1 + previousSBP / 100)
          } else {
            resultSBP = lastPointSBP * (1 - previousSBP / 100)
          }
        }
        changeAction(formName, `${sectionName}[sbpValue]`, Math.round(resultSBP))
      }
    }
    changeAction(formName, `${sectionName}[condition]`, currentConditionObj)
  }

  render() {
    const { l, input } = this.props
    const currentConditionValue =
      (input && 'value' in input && input.value && input.value.value)
        ? input.value.value
        : ''
    const dropdownData = optionValue.map((option) => ({ label: l(option), value: option }))
    return (
      <Select
        clearable={false}
        searchable={false}
        styleName="condition-selector"
        placeholder="--"
        value={currentConditionValue}
        options={dropdownData}
        onChange={this.onChange} />
    )
  }
}
