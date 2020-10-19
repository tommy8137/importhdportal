import React, { Component, PropTypes } from 'react'
import CSSModules from 'react-css-modules'
import styles from './estimation.css'

export const Legend = CSSModules(styles)(({ l }) => {
  return (
    <div styleName="legend-container">
      <div styleName="actual-legend-estimation">{l('Actual SBP')}</div>
      <div styleName="predict-legend-estimation">{l('Predict Range')}</div>
      <div styleName="simulate-legend-estimation">{l('Simulate Range')}</div>
    </div>
  )
})
