import React from 'react'
import CSSModules from 'react-css-modules'
import styles from './simulator.css'
import Button from 'components/Buttons/ButtonDefault'
import { reduxForm, change, initialize, reset } from 'redux-form'
import { shouldValidate } from './validate'
import { compose, bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import selector from './selector'
import R from 'ramda'
import { maybe } from 'maybes'

const notEqual = R.complement(R.equals)
const ensureFormDataChanged = R.cond([
  [R.identical, R.F],
  [notEqual, R.T],
  [R.T, R.F]
])

const enhance = compose(
  connect(
    selector.mainSelector,
    (dispatch) => ({ actions: bindActionCreators({ change, initialize, reset }, dispatch) })
  ),
  reduxForm({
    form: 'Simulator',
    // touchOnBlur: false,
    shouldValidate,
  }),
  CSSModules(styles)
)

@enhance
export default class Simulator extends React.Component {
  static defaultProps = {
    formName: 'Simulator',
  }
  static propTypes = {
    l: React.PropTypes.func,
    submitCallback: React.PropTypes.func,
  }

  componentWillMount() {
    const { formName, initData, actions } = this.props
    actions.initialize(formName, initData, false)
  }

  componentWillReceiveProps(nextProps) {
    const { formName, initEnable, actions, localeName  } = this.props

    if (ensureFormDataChanged(this.props.initData, nextProps.initData)
        || ensureFormDataChanged(localeName, nextProps.localeName)) {
      actions.initialize(formName, nextProps.initData, false)
    }
  }

  totalSubmit = (e) => {
    e.preventDefault()
    this.props.submitCallback()
  }

  totalReset = (e) => {
    const { formName, actions, initData, reset } = this.props
    e.preventDefault()
    actions.initialize(formName, initData, false)
  }

  render() {
    const { children, simulatorDisabled, l, formValues, formErrors, formInvalid, actions, fields, isPredictable } = this.props
    const childrenWithProps = React.Children.map(children, (child) =>
      maybe(child)
        .filter(child => child.props.sectionName)
        .map(child => {
          const { sectionName } = child.props
          const data = {
            formValues: formValues ? formValues[sectionName] : {},
            formErrors: formErrors ? formErrors[sectionName] : {},
            formInvalid,
            actions,
            sectionFields: fields ? fields[sectionName] : {},
          }
          return React.cloneElement(child, { data })
        })
        .orJust(child)
    )

    return (
      <form autoComplete="off">
        {childrenWithProps}
        <div styleName="table-default">
          <div styleName="row">
            <div styleName="cell">
              <button type="button" styleName="gray" onClick={this.totalReset} >{l('Reset')}</button>
            </div>
          </div>
        </div>
        <div styleName="submit-row">
          <Button type="submit" disabled={isPredictable || simulatorDisabled || formInvalid} onClick={this.totalSubmit}>{l('Confirm')}</Button>
        </div>
      </form>
    )
  }
}
