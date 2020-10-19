import React from 'react'
import CSSModules from 'react-css-modules'
import styles from '../dashboard.css'

const PatientStatusRaw = () => {
  return (
    <div styleName="patient-status">
      <div styleName="status-item">：</div>
      <div styleName="status-item">：</div>
      <div styleName="status-item">：</div>
      <div styleName="status-item">：</div>
    </div>
  )
}
export const PatientStatus = CSSModules(styles)(PatientStatusRaw)

const CircleSymbolRaw = ({ count, level = 'green', size, style = {} }) => {
  let s = style
  level = ['green', 'red', 'orange', 'critical'].indexOf(level) === -1 ? 'gray' : level
  if (size) {
    const criticalSize = `calc(${size} - 5px)`
    s = {
      width: level === 'critical' ? criticalSize : size,
      height: level === 'critical' ? criticalSize : size,
      fontSize: `calc(${size} / 2)`,
      borderRadius: `calc(${size} / 2)`,
      ...s,
    }
  }

  return (
    <div style={s} styleName={level}>{count}</div>
  )
}
export const CircleSymbol = CSSModules(styles)(CircleSymbolRaw)

const InformBlockRaw = ({ l, red, green, orange, critical }) => {
  const redCount = parseInt(red) || 0
  const greenCount = parseInt(green) || 0
  const orangeCount = parseInt(orange) || 0
  const criticalCount = Number(critical) || 0

  return (
    <div styleName="inform-block">
      <span styleName="number-of-record">{redCount + greenCount + orangeCount + criticalCount}</span>
      <span>{l('records include')}</span>
      <div styleName="signals">
        {!isNaN(critical) && <CircleSymbol level="critical" size="1.5rem" />}
        {!isNaN(critical) && <span>{criticalCount}</span>}
        {!isNaN(red) && <CircleSymbol level="red" size="1.5rem"/>}
        {!isNaN(red) && <span>{red}</span>}
        {!isNaN(green) && <CircleSymbol level="green" size="1.5rem"/>}
        {!isNaN(green) && <span>{greenCount}</span>}
        {!isNaN(orange) && <CircleSymbol level="orange" size="1.5rem"/>}
        {!isNaN(orange) && <span>{orangeCount}</span>}
      </div>
    </div>
  )
}
export const InformBlock = CSSModules(styles)(InformBlockRaw)
