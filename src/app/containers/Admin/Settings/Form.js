import React, { Component } from 'react'
import styles from '../style.css'
import CSSModules from 'react-css-modules'
import Button from 'components/Buttons/ButtonDefault'
import { reduxForm, Field } from 'redux-form'
import validator from './timeout-validator'
import { change } from 'redux-form'

const TimeoutInput = CSSModules(styles)(({ name, input }) =>
  <input name={name} type="number" styleName="input" min="1" max="240" {...input}/>
)

const formName = 'timeout-setting'

@reduxForm({
  form: formName,
  validate: validator,
})
@CSSModules(styles)
export default class extends Component {
  state = {
    initTimeout: null,
  }

  componentDidMount() {
    if (this.props.valueTimeout) {
      this.setState({
        initTimeout: this.props.valueTimeout,
      })
    }
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.valueTimeout != this.props.valueTimeout) {
      this.setState({
        initTimeout: nextProps.valueTimeout,
      })
    }
  }

  handleTimeChange = (e) => {
    e.preventDefault()
    const { valueCurrent  } = this.props
    if (!valueCurrent) {
      return
    }
    this.setState({
      initTimeout: valueCurrent,
    })
    this.props.actions.setUserTimeout(parseInt(valueCurrent))
  };

  render() {
    const { titleSystem, titleTimeout, labelChange, logExport, min, labelTimeout, valueTimeout } = this.props
    const { l, invalid, dirty, syncError, valueCurrent } = this.props

    const errorMsg = invalid && this.state.initTimeout
      ? l(syncError.timeout)
      : null
    const disabled = invalid || this.state.initTimeout == valueCurrent
    return (
      <form styleName="body">
        <div styleName="row-value-timeout">
          <label styleName="label-timeout">{labelTimeout}: </label>
          <Field name="timeout" type="number" component={TimeoutInput}/>
          <span>{min}</span>
        </div>
        <div styleName="error-message" className={errorMsg? null: styles.hidden}>
          {errorMsg}
        </div>
        <div styleName="row-submit-timeout">
          <Button styleName="submit-timeout" onClick={this.handleTimeChange} disabled={disabled}>{labelChange}</Button>
        </div>
      </form>
    )
  }
}
