import React, { Component, PropTypes } from 'react'
//---------------------------------------------------------------------------
// the leader line of category name
//---------------------------------------------------------------------------
export const CategoryLeaderLine = (props) => {
  const { pie, pie: { startAngle, endAngle }, arc, outerRadius } = props
  const midAngle = (startAngle + (endAngle - startAngle) / 2)
  const calcPolyNodes = (d) => {
    const startNode = arc.centroid(d)
    const midNode = arc.centroid(d).map((value) => value * 1.5)
    const endNode = [
      (midAngle > 0 && midAngle < Math.PI) ? outerRadius * 1.8 * 1 : outerRadius * 1.8 * -1,
      midNode[1]
    ]
    return [startNode, midNode, endNode]
  }

  return (
    <polyline
      points={calcPolyNodes(pie)}
      fill="none"
      stroke="#777"
      strokeWidth="1" />
  )
}

//---------------------------------------------------------------------------
// the leader line of category name
//---------------------------------------------------------------------------
export const CategoryArea = (props) => {
  const { d, fill, strokeWidth } = props
  return (
    <path
      d={d}
      stroke="white"
      strokeWidth={strokeWidth}
      fill={fill}
      style={{ cursor: 'pointer' }} />
  )
}

//---------------------------------------------------------------------------
// the patients count of each category
//---------------------------------------------------------------------------
export const CategoryCounts = (props) => {
  const { transform, count } = props
  return (
    <text
      transform={transform}
      fill="#bc1d32"
      dy="5"
      textAnchor="middle"
      style={{ cursor: 'pointer', 'fontStyle': 'bold', 'fontSize': '18px', 'fontFamily': 'Arial' }}>
    {count}
    </text>
  )
}

//---------------------------------------------------------------------------
// the name label of category
//---------------------------------------------------------------------------
export const CategoryNames = (props) => {
  // props
  const { pie, pie: { startAngle, endAngle }, arc, outerRadius, title, color, select } = props
  const midAngle = (startAngle + (endAngle - startAngle) / 2)
  const calcPositions = (d) => {
    const pos = arc.centroid(d)
    pos[0] = outerRadius * 1.8 * (midAngle > 0 && midAngle < (Math.PI) ? 1 : -1)
    pos[1] = pos[1] * 1.5
    return (`translate(${pos})`)
  }

  return (
    <g>
      <filter x="0" y="0" width="1" height="1" id="textBackground-normal">
        <feFlood floodColor={color.normal} />
        <feComposite in="SourceGraphic" />
      </filter>
      <filter x="0" y="0" width="1" height="1" id="textBackground-selected">
        <feFlood floodColor={color.selected} />
        <feComposite in="SourceGraphic" />
      </filter>
      <text
        filter={`url(#textBackground-${select.type})`}
        dy=".35em"
        transform={calcPositions(pie)}
        fill="white"
        style={{ cursor: 'pointer', floodColor: select.color }}
        textAnchor={midAngle > 0 && midAngle < Math.PI ? 'start' : 'end'}>
        {pie.data.number ? `${title}` : null}
      </text>
    </g>
  )
}

//---------------------------------------------------------------------------
// the centeral circle
//---------------------------------------------------------------------------
export const CenterCircle = (props) => {
  const { r, fill, strokeWidth, onClick, middleCircleText } = props
  return <g onClick={onClick} >
    <circle
      r={r}
      fill={fill}
      stroke="white"
      strokeWidth={strokeWidth}
      style={{ cursor: 'pointer' }}/>
    <text
      dy={5}
      textAnchor="middle"
      fill="white"
      style={{ cursor: 'pointer', font: 'bold 16px Arial' }}>{middleCircleText}</text>
  </g>
}

