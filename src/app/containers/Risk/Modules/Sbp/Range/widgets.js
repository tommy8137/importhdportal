import React, { Component, PropTypes } from 'react'
import CSSModules from 'react-css-modules'
import styles from './range.css'

export const Legend = CSSModules(styles)(({ l }) => {
  return (
    <div styleName="legend-container">
      <div styleName="actual-legend">{l('Actual SBP')}</div>
      <div styleName="predict-legend">{l('Predict Range')}</div>
      <div styleName="simulate-legend">{l('Simulate Range')}</div>
    </div>
  )
})
