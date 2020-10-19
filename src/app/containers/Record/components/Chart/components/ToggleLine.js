import React from 'react'
import Line from 'components/Svg/Line'
import cssVars from 'app/css/variables-with-js'

export default function ToggleLine(props) {
  const { key, times, points, values, index, selectedNodes, symbols, callback, startAt, endAt } = props
  const { xScale, yScale } = props
  if (!points || points.length < 1) {
    return null
  }
  // according to the interval of times, caculate the different speed
  const total = (endAt - startAt)
  const l = times[times.length - 1] - startAt
  let speed = 1.5 // base speed
  speed = total / l * speed
  return (
    <Line
      times={times}
      points={points}
      values={values}
      type="solid"
      width={2}
      stroke={cssVars[`color${index}`]}
      callback={callback}
      selectedNodes={selectedNodes}
      symbols={symbols}
      speed={speed}
      xScale={xScale}
      yScale={yScale}/>
  )
}
