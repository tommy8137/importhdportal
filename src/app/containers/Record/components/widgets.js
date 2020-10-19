import React, { Component } from 'react'
import styles from '../record.css'
import CSSModules from 'react-css-modules'
import chartStyles from './Chart/chart.css'
import moment from 'moment'

function TextItemRaw({ label, startValue, currentValue = '--', unit }) {
  return (
    <div styleName="status-item">
      <span styleName="status-label">{label}</span>
      <div styleName="status-format">
        <span>{startValue}/</span>
        <span styleName="status-value">{currentValue}</span>
        <span>({unit})</span>
      </div>
    </div>
  )
}

export const TextItem = CSSModules(styles)(TextItemRaw)

function PanelLineLabelRaw({ status = 2, selected = false, className, x, top, bottom, index, time, onClick }) {
  let styleName = status == 2 ? 'handled': 'abnormal'
  if (selected) {
    styleName = `${styleName}-selected`
  }
  return (
    <g styleName={styleName} onMouseDown={e => e.stopPropagation()}>
      <line strokeWidth="2" strokeDasharray={selected? null: "10,10"} x1={x} y1={top} x2={x} y2={bottom}/>
      <g styleName="g-text" onClick={onClick}>
        <rect x={x - 30} y={bottom} width="60" height="50" rx={5} ry={5}/>
        <text textAnchor="middle" x={x} y={bottom}>
          <tspan x={x} dy="1.4em">{index}</tspan>
          {selected && <tspan x={x} dy="1.4em">{moment(time).format('HH:mm')}</tspan>}
        </text>
      </g>
    </g>
  )
}

export const PanelLineLabel = CSSModules(chartStyles)(PanelLineLabelRaw)
