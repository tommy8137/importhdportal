import React, { cloneElement } from 'react'
import CSSModules from 'react-css-modules'
import styles from './form-sbp.css'
import { Field } from 'redux-form'
import { printErrorMsg } from '../../utils'

const normalizeFloat = (value) => value && parseFloat(value)
// workaround: if type == string then this field is meant to be an integer, ow. => float
const normalizeInt = (value) => value && parseInt(value)

export const FormRow = CSSModules(styles)(({ l, visited, fieldName, name, value, type = 'number', errorMsg, normalize }) => (
    <div styleName={(errorMsg && visited) ? 'row-error' : 'row'}>
      <div styleName="cell">{name}</div>
      <div styleName="cell">{value}</div>
      <div styleName="cell">
        <Field
          name={fieldName}
          component="input"
          styleName={(errorMsg && visited) ? 'shadow-input-error' : 'shadow-input'}
          type="text"
          normalize={normalize}/>
      </div>
      {
        <div styleName={(errorMsg && visited) ? 'error-box' : 'error-box-hidden'}>
          {printErrorMsg(l, errorMsg)}
        </div>
      }
    </div>
  )
)
