import React, { PropTypes, Component } from 'react'
import styles from './form-sbp.css'
import { FormSection } from 'redux-form'
import CSSModules from 'react-css-modules'
import { FormRow } from './widgets'
import { fieldNames } from './selector'
import R from 'ramda'
import { normalizeInt, normalizeFloat } from '../../utils'

const nonNulls = R.pickBy((val, key) => !!val && key != 'time')
const valuesFetched = (values) => Object.keys(values).length > 0
const showErrorIfPossible = R.compose(
  valuesFetched,
  nonNulls
)

@CSSModules(styles)
export default class FormSBP extends Component {
  static propTypes = {
    l: PropTypes.func,
    fields: PropTypes.array,
    selectedPoint: PropTypes.object,
    data: PropTypes.object,
    sectionName: PropTypes.string,
  }

  static defaultProps = {
    fields: Object.keys(fieldNames),
    sectionName: 'FormSBP',
  }

  renderRows() {
    const {
      fields,
      selectedPoint,
      l,
      data: {
        formValues,
        formErrors,
        sectionFields,
      },
    } = this.props

    const fieldsFetched = showErrorIfPossible(formValues)

    return fields.map((key) => {
      const visited = fieldsFetched || (sectionFields && sectionFields[key])
      return (
        <FormRow
          l={l}
          key={key}
          visited={visited}
          errorMsg={formErrors[key]}
          fieldName={key}
          name={l(fieldNames[key])}
          normalize={key == 'dia_flow' || key == 'blood_flow' || key == 'ns' ? normalizeInt : normalizeFloat }
          value={selectedPoint[key]} />
      )
    })
  }

  render() {
    const { sectionName, l } = this.props
    return (
      <FormSection styleName="container" name={sectionName}>
        <div styleName="table-default">
          <div styleName="header">
            <div styleName="cell">{l('Item')}</div>
            <div styleName="cell">{l('Actual')}</div>
            <div styleName="cell">{l('Simulation')}</div>
          </div>
          <div styleName="body">
            {this.renderRows()}
          </div>
        </div>
      </FormSection>
    )
  }
}
