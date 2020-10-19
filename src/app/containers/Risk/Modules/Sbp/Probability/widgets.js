import React, { Component } from 'react'
import CSSModules from 'react-css-modules'
import styles from './probability.css'
/**
 * regardless of condition, return the difference of
 * @param  {[type]} condition [description]
 * @param  {[type]} value     [description]
 * @param  {[type]} sbp       [description]
 * @return {[type]}           [description]
 */
export function conditionDiff(condition, value, sbp) {
  let ul, ulnum
  if (condition === 'Above' || condition === 'Below') {
    ul = condition
    ulnum = value
  } else if (condition === 'Increase') {
    ul = 'Above'
    ulnum = sbp * (1 + value / 100)
  } else if (condition === 'Decrease') {
    ul = 'Below'
    ulnum = sbp * (1 - value / 100), 10
  }

  ul = /above/i.test(ul)? 1: 0
  return { ul, ulnum }
}

export const Legend = CSSModules(styles)(({ l }) => {
  return (
    <div styleName="legend-container">
      <div styleName="actual-legend">{l('Actual SBP')}</div>
      <div styleName="predict-legend">{l('Predict')}</div>
      <div styleName="simulate-legend">{l('Simulate2')}</div>
    </div>
  )
})
