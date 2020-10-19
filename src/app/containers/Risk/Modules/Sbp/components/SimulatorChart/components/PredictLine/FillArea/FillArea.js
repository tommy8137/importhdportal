import React, { Component, PropTypes } from 'react'
import ReactFauxDOM from 'react-faux-dom'
import { area as d3Area } from 'd3-shape'
import { select } from 'd3-selection'
import PureRenderMixin from 'react-addons-pure-render-mixin'
import { Motion, spring } from 'react-motion'
import { linearInterpolator } from 'components/Svg/hack-spring100-to-linear'

export default class FillArea extends Component {

  static propTypes = {
    pointsUp: PropTypes.array,
    pointsBottom: PropTypes.array,
    color: PropTypes.string,
    opacity: PropTypes.number,
    speed: PropTypes.number,
    xScale: PropTypes.func.isRequired,
    yScale: PropTypes.func.isRequired,
  }
  static defaultProps = {
    speed: 1,
    xScale: x => x,
    yScale: y => y,
  }

  constructor(props) {
    super(props)
    this.shouldComponentUpdate = PureRenderMixin.shouldComponentUpdate.bind(this)
  }

  updateStep = (x, points) => {
    for (let i = 0; i < points.length - 1; i++) {
      if (x >= points[i].x && x < points[i + 1].x) {
        return i
      }
    }
    return points.length - 1
  }

  render() {
    const { pointsUp, pointsBottom, color, opacity, speed } = this.props
    const { xScale, yScale } = this.props
    if (!pointsUp || pointsUp.length == 0 || !pointsBottom || pointsBottom.length == 0) {
      return null
    }
    const mappedPtsUp = pointsUp.map(pt => ({ x: xScale(pt.x), y: yScale(pt.y) }))
    const mappedPtsBottom = pointsBottom.map(pt => ({ x: xScale(pt.x), y: yScale(pt.y) }))
    return (
      <Motion
        defaultStyle={{ x: pointsUp[0].x }}
        style={{ x: spring(pointsUp[pointsUp.length - 1].x, { stiffness: 100 }) }} >
        {
          value => {
            //-------------------------------------------------
            // calculate x and fill into xPositions array
            // it's a scaled value
            //-------------------------------------------------
            const mappedX = xScale(value.x)
            const x0 = mappedPtsUp[0].x
            const ratio = (mappedX - x0) / (mappedPtsUp[mappedPtsUp.length - 1].x - x0) * 100
            const x = linearInterpolator(mappedPtsUp, ratio, 100, speed)
            const currentStep = this.updateStep(x, mappedPtsUp)

            const points = []
            mappedPtsUp.forEach((pt, i) => {
              if (mappedPtsUp[i].x <= x) {
                points.push({
                  x: mappedPtsUp[i].x,
                  up: mappedPtsUp[i].y,
                  lower: mappedPtsBottom[i].y,
                })
              }
            })
            //-------------------------------------------------
            // draw the fill area by faux
            //-------------------------------------------------
            const vdom = ReactFauxDOM.createElement('g')
            const area = d3Area()
              .x((d) => (d.x))
              .y0((d) => (d.lower))
              .y1((d) => (d.up))

            select(vdom)
              .append('path')
              .datum(points)
              .attr('className', 'fillArea')
              .attr('d', area)
              .attr('opacity', opacity)
              .attr('fill', color)

            return (<g>{vdom.toReact()}</g>)
          }
        }
      </Motion>
    )
  }
}
