import React, { Component, PropTypes } from 'react'
import styles from './items-chart.css'
import CSSModules from 'react-css-modules'
import { scaleLinear } from 'd3-scale'
import Line from 'components/Svg/Line'
import XAxis from './components/XAxis'

@CSSModules(styles)
export default class ItemsChart extends Component {
  static statics = {
    WIDTH: 820,
    HEIGHT: 410,
    OFFSET: 48,
    FONT_HEIGHT: 16,
    LINE_WIDTH: 2,
    RECT_WIDTH: 80,
    RECT_HEIGHT: 25,
    GREEN_COLOR: '#50b4aa',
    DARK_GREY_COLOR: '#aaa',
    LIGHT_GREY_COLOR: '#ccc',
    STATUS_SYMBOLS: ['normal', 'abnormal', 'critical', 'no-data'],
  }

  static propTypes = {
    l: PropTypes.func,
    clickCallback: PropTypes.func,
    unit: PropTypes.string,
    date: PropTypes.number,
    status: PropTypes.number,
    data: PropTypes.object,
    display: PropTypes.bool,
  }

  state = {
    idx: null,
    displaySelected: false,
  }

  clickCallback = (date, idx) => {
    const { data: { trIds } } = this.props
    this.setState({ idx })
    this.props.clickCallback(trIds.get(idx))
  }

  initDataSet = () => {
    const { WIDTH, OFFSET, HEIGHT } = ItemsChart.statics
    const { data } = this.props

    const hozLineYPositions = Array.from(Array(5).keys()).map(
      (idx) => ((HEIGHT % (HEIGHT / 5)) + (HEIGHT / 5) * idx))
    const xRange = scaleLinear().range([OFFSET * 2, WIDTH - OFFSET * 2])
    const yRange = scaleLinear().range([hozLineYPositions[0] + OFFSET, hozLineYPositions[4]])

    const yMin = Math.min(...data.value)
    const yMax = (Math.max(...data.value) === yMin) ? 100 : Math.max(...data.value)

    const xScaleFunc = (data.value.length === 1) ? xRange.domain([0, 1]) : xRange.domain([0, data.value.length - 1])
    const yScaleFunc = yRange.domain([yMax, yMin])

    const xPositions = data.date.map((date, idx) => (xScaleFunc(idx)))
    const yPositions = data.value.map((y) => yScaleFunc(y))

    return {
      ...data,
      xPositions,
      yPositions,
      hozLineYPositions,
      xScaleFunc,
    }
  }

  animationCompletedCallback = () => {
    this.setState({ displaySelected: true })
  }

  render() {
    const {
      WIDTH,
      HEIGHT,
      OFFSET,
      FONT_HEIGHT,
      GREEN_COLOR,
      DARK_GREY_COLOR,
      LIGHT_GREY_COLOR,
      LINE_WIDTH,
      RECT_WIDTH,
      RECT_HEIGHT,
      STATUS_SYMBOLS,
    } = ItemsChart.statics
    const { unit, display, status } = this.props
    const currentSelectDate = this.props.date
    const {
      value,
      date,
      xPositions,
      yPositions,
      hozLineYPositions,
      xScaleFunc,
    } = this.initDataSet()
    const selectedNodes = [date.indexOf(currentSelectDate)]
    const points = xPositions.map((x, idx) => ({ x, y: yPositions[idx] }))
    const symbols = []
    for (let i = 0; i < value.length; i++) {
      symbols.push({
        component: Circle,
        customClassName: STATUS_SYMBOLS[status],
        showNode: true,
        showText: true,
      })
    }

    return (
      <svg width={WIDTH} height={HEIGHT}>
        <LeftVertLine h={HEIGHT} fontH={FONT_HEIGHT} color={LIGHT_GREY_COLOR} w={LINE_WIDTH} />
        <Unit y={FONT_HEIGHT} fill={DARK_GREY_COLOR} unit={unit} />
        <SelectedVertLine
          animationCompleted={this.state.displaySelected}
          selectedNodes={selectedNodes}
          xPositions={xPositions}
          yPositions={yPositions}
          height={`${HEIGHT - 3}`}
          fill={GREEN_COLOR}
          fontH={FONT_HEIGHT}
          strokeW={LINE_WIDTH}/>
        <HozDashLines
          positions={hozLineYPositions}
          offset={OFFSET}
          w={WIDTH}
          color={DARK_GREY_COLOR}
          strokeW={LINE_WIDTH} />
        {
          (display)
          ? <g>
              <Line
                key={'items-chart-line'}
                callback={this.clickCallback}
                width={LINE_WIDTH}
                stroke={GREEN_COLOR}
                times={date}
                points={points}
                values={value}
                type={'solid'}
                selectedNodes={selectedNodes}
                animationCompletedCallback={this.animationCompletedCallback}
                symbols={symbols}
              />
              <g transform={`translate(0, -1)`}>
                {
                  (xPositions) && <XAxis
                    xPositions={xPositions}
                    yPositions={yPositions}
                    rectH={RECT_HEIGHT}
                    rectW={RECT_WIDTH}
                    rectFill={GREEN_COLOR}
                    xScaleFunc={xScaleFunc}
                    times={date}
                    scaleY={yPositions}
                    callback={this.clickCallback}
                    width={WIDTH} height={HEIGHT}
                    currentTime={(this.state.displaySelected) ? currentSelectDate : 0} />
                }
              </g>
            </g>
          : <g />

        }
      </svg>
    )
  }
}

@CSSModules(styles)
class Circle extends Component {
  static propTypes = {
    x: PropTypes.number,
    y: PropTypes.number,
    fill: PropTypes.string,
    stroke: PropTypes.string,
    selected: PropTypes.bool,
    customClassName: PropTypes.string,
    strokeWidth: PropTypes.number,
  }

  render() {
    const { x, y, customClassName, selected, ...styleAttrs } = this.props
    return (
    <g>
    {
      customClassName === 'critical' && selected
      ? <CriticalCircle x={x} y={y} />
      : <circle
          {...styleAttrs}
          styleName={'node-circle'}
          className={(selected) && styles[customClassName]}
          cx={x}
          cy={y}
          fill={'white'}
          strokeWidth={4} />
    }
    </g>
    )
  }
}

function CriticalCircle({ x, y }) {
  return (
    <ConcentricCircles
      className={styles['node-circle-critical']}
      x={x}
      y={y}
      outer={{
        r: '9',
        strokeWidth: '2',
        fill: 'none',
        stroke: '#e0362b',
      }}
      inner={{
        r: '8',
        strokeWidth: '1',
        fill: '#bb0625',
        stroke: 'white',
      }}
    />
  )
}

export function ConcentricCircles({ x, y, outer, inner, className }) {
  return (
    <g className={className}>
      <circle cx={x} cy={y} r={outer.r} strokeWidth={outer.strokeWidth}
        fill={outer.fill} stroke={outer.stroke} />
      <circle cx={x} cy={y} r={inner.r} strokeWidth={inner.strokeWidth}
        fill={inner.fill} stroke={inner.stroke} />
    </g>
  )
}

const LeftVertLine = (props) => {
  const { h, fontH, color, w } = props
  return (
    <line
      x1={ItemsChart.statics.OFFSET}
      x2={ItemsChart.statics.OFFSET}
      y1={0}
      y2={h - fontH}
      stroke={color}
      fill="transparent"
      strokeWidth={w} />
  )
}


const Unit = (props) => {
  const { y, fill, unit } = props
  return (
    <text x={0} y={y} fill={fill} >{unit}</text>
  )
}

const SelectedVertLine = CSSModules(styles)((props) => {
  const {
    animationCompleted,
    selectedNodes,
    xPositions,
    yPositions,
    height,
    fill,
    fontH,
    strokeW,
  } = props
  return (
    <g>
    {
      animationCompleted && selectedNodes.map(
        (idx) => (
          <g key={`pointer${idx}`}>
            <line
              x1={xPositions[idx]}
              x2={xPositions[idx]}
              y1={yPositions[idx]}
              y2={height - fontH}
              stroke={fill}
              strokeDasharray={'5, 5'}
              fill="transparent"
              strokeWidth={strokeW}/>
          </g>
        )
      )
    }
    </g>
  )
})

const HozDashLines = (props) => {
  const { positions, offset, w, color, strokeW } = props
  return (
    <g>
    {
      positions.map(
        (value, idx) => (
          <line key={`hozLine${idx}`}
            x1={offset + 10}
            x2={w - offset}
            y1={value}
            y2={value}
            stroke={color}
            strokeDasharray={'5, 5'}
            fill="transparent"
            strokeWidth={strokeW} />
        )
      )
    }
    </g>
  )
}
