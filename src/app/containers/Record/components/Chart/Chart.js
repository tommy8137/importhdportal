import React, { Component, PropTypes } from 'react'
import CSSModules from 'react-css-modules'
import styles from './chart.css'
import moment from 'moment'
import ReactFauxDOM from 'react-faux-dom'
import Line from 'components/Svg/Line'
import symbolGenerator from './symbol-generator'
import { PanelLineLabel } from '../widgets'
import { min as d3Min, max as d3Max } from 'd3-array'
import { scaleLinear, scaleTime } from 'd3-scale'
import { Motion, spring } from 'react-motion'
import ToggleLine from './components/ToggleLine'
import XAxis from './components/XAxis'
import GridLines from './components/GridLines'

const makeSymbols = (times, selectedTime, index) => times.map((t, idx) => ({
  component: symbolGenerator(index),
  showNode: t == selectedTime,
  showText: t == selectedTime,
  labelAlign: index % 2 == 0 ? 'right' : 'right',
  selectedLabelStyle: {
    fill: 'red',
  }
}))

@CSSModules(styles)
export default class Chart extends Component {
  static propTypes = {
    width: PropTypes.number,
    height: PropTypes.number,
    margins: PropTypes.shape({
      left: PropTypes.number,
      top: PropTypes.number,
      right: PropTypes.number,
      bottom: PropTypes.number,
    }),
    paddings: PropTypes.shape({
      left: PropTypes.number,
      top: PropTypes.number,
      right: PropTypes.number,
      bottom: PropTypes.number,
    }),
    xScale: PropTypes.func,
  }
  static defaultProps = {
    width: 500,
    height: 500,
    margins: {
      left: 10,
      top: 10,
      right: 10,
      bottom: 0,
    },
    paddings: {
      left: 20,
      top: 10,
      right: 20,
      bottom: 10,
    },
    zoomRatio: 100,
    panDistance: {
      x: 0,
      y: 0,
    },
  }
  state = {
    chart: null,
    showNavLine: false,
  }
  static linesNumber = 7
  static axisLabelHeight = 15

  constructor(props) {
    super(props)
  }

  componentDidMount() {
    this.componentWillReceiveProps(this.props)
  }

  componentWillReceiveProps(nextProps) {
    const { datas, toggled, selectedTime, xScale } = nextProps
    if (selectedTime != this.props.selectedTime && this.state.chart) {
      this.setState({
        chart: this.state.chart.map(c => ({ ...c, symbols: makeSymbols(c.times, selectedTime, c.index) }))
      })
    } else if (datas != this.props.datas || toggled != this.props.toggled || !this.state.chart) {
      this.setState({ chart: this.prepareData(nextProps) })
    } else if (xScale != this.props.xScale) {
      this.setState({ chart: this.reScale(nextProps) })
    }
  }

  prepareData(props) {
    const { startTime, endTime, datas, selectedTime, toggled } = props
    const { xScale } = props

    if (!xScale) {
      return null
    }

    const filtered = Object.keys(datas).filter(key => toggled.get(datas[key].id))
    const chart = filtered.map((key, idx) => {
      const data = datas[key]
      const { values, times, index, id, recordId } = data
      const yScale = this.getYScale(data.values, idx, filtered.length)
      return {
        key: `${recordId}-${id}`,
        points: data.points.map(p =>({ x: p.time, y: p.value })),
        selectedNodes: data.highlights,
        values,
        times,
        index,
        symbols: makeSymbols(times, selectedTime, index),
        xScale,
        yScale,
      }
    }) || []

    return chart
  }

  reScale(props) {
    const { chart } = this.state
    const { xScale } = props
    return chart.map(c => ({ ...c, xScale }))
  }

  get paintingZone() {
    const { width, height } = this.props
    const { left, top, right, bottom } = this.props.margins
    // const { top,height } = this.paintingZone
    const { axisLabelHeight, linesNumber } = Chart
    return {
      left: left,
      top: top,
      right: width - right,
      bottom: height - bottom,
      bottomForLine: top + height * (linesNumber - 1) / linesNumber,
      width: width - right - left,
      height: height - bottom - top,
      paddings: this.props.paddings,
    }
  }

  getYRange(idx = 0, totalSize = 1) {
    const { linesNumber, axisLabelHeight } = Chart
    const { left, top, right, bottom, width, height } = this.paintingZone
    let yMin = top + 10
    let originYMin = yMin
    let yMax = top + (height - axisLabelHeight) * (linesNumber - 1) / linesNumber
    if (totalSize > 1) {
      let range = yMax - yMin
      yMin = originYMin + idx / totalSize * range
      yMax = originYMin + (idx + 1) / totalSize * range
      // let offset = range * 0.3
      // yMin = yMin + idx * offset / (totalSize - 1)
      // yMax = yMax - (totalSize - 1 - idx) * offset / (totalSize - 1)
    }
    return scaleLinear().range([yMin, yMax])
  }

  getYScale(values, idx, totalSize) {
    let [yMin, yMax] = [d3Min(values), d3Max(values)]
    let range = (yMax != yMin)
      ? yMax - yMin
      : yMin
    yMin = yMin - range * ( 0.10 )
    yMax = yMax + range * ( 0.10 )
    return this.getYRange(idx, totalSize).domain([yMax, yMin])
  }

  renderTickLines() {
    const { linesNumber, axisLabelHeight } = Chart
    const { left, top, right, bottom, width, height } = this.paintingZone

    const lines = []

    for (let i = 0; i < linesNumber; i++) {
      let t = top + (height - axisLabelHeight) * i / linesNumber
      lines.push(
        <line key={i} styleName="bg-horizontal-line" x1={left} y1={t} x2={right} y2={t}/>
      )
    }

    return (
      <g>
        <line styleName="bg-line" x1={left} y1={top} x2={left} y2={bottom} />
        {lines}
      </g>
    )
  }

  renderLines() {
    const { selectTime, toggled, startTime, endTime } = this.props
    const { chart } = this.state
    if (!chart) {
      return null
    }
    const lines = chart.map(c => {
      return (
        <ToggleLine
          {...c}
          callback={selectTime}
          startAt={startTime}
          endAt={endTime}/>
      )
    })
    return lines
  }

  renderNavLine() {
    return null
  }

  renderPanelLines(pre, intra, post) {
    const { xScale } = this.props
    let idx = -1
    const { top, height, bottomForLine } = this.paintingZone
    const { piId, selectPanelItem } = this.props

    let ret = []
    const totals = intra.concat(pre, post)
    // for unknown reasen, map will produce one duplicated
    const piToLine = (pi, idx) => {
      const x = xScale(pi.get('time'))
      ret.push(
        <PanelLineLabel
          key={pi.get('pi_id')}
          x={x}
          top={top}
          bottom={bottomForLine}
          index={pi.get('number')}
          time={pi.get('time')}
          status={pi.get('status')}
          selected={piId && pi.get('pi_id') == piId}
          onClick={selectPanelItem.bind(null, pi.get('pi_id'))}/>
      )
    }
    // plot unselected lines first
    totals.filter(pi => !(piId && pi.get('pi_id') == piId))
      .forEach(piToLine)
    totals.filter(pi => piId && pi.get('pi_id') == piId)
      .forEach(piToLine)
    return ret
  }

  renderCurrentLine() { // the line of selectedTime
    const { selectedTime } = this.props
    if (!selectedTime) {
      return null
    }

    const { top, height, bottomForLine } = this.paintingZone
    const { xScale } = this.props
    const x = xScale(selectedTime)
    return (
      <line
        styleName="current-line"
        x1={x}
        x2={x}
        y1={top}
        y2={bottomForLine}/>
    )
  }

  render() {
    const { width, height, pre, intra, post, selectTime, selectedTime, margins, paddings } = this.props
    const { linesNumber, axisLabelHeight } = Chart
    const { left, top, right, bottom, height: pHeight, width: pWidth } = this.paintingZone
    const { xScale, handleWheel, triggerPan } = this.props // passed from PanZoom

    if (!xScale) {
      return <svg width={width} height={height}></svg>
    }
    return (
      <svg
        width={width}
        height={height}
        onMouseDown={triggerPan}
        onWheel={handleWheel}>
        <defs>
          <clipPath id="clipPath-params-chart">
            <rect
              x={left + paddings.left - 5}
              y={top}
              width={right - left - paddings.left - paddings.right + 10}
              height={height}/>
          </clipPath>
        </defs>
        <rect
          fill="#fff"
          fillOpacity="0.0"
          x={left}
          y={top}
          width={pWidth}
          height={pHeight}/>
        <XAxis bottom={bottom} axisLabelHeight={axisLabelHeight} xScale={xScale} callback={selectTime} selectedTime={selectedTime}/>
        <GridLines
          linesNumber={linesNumber}
          axisLabelHeight={axisLabelHeight}
          left={left}
          top={top}
          right={right}
          bottom={bottom}
          height={pHeight}/>
        <g clipPath={`url(#clipPath-params-chart)`}>
          {this.renderPanelLines(pre, intra, post)}
          {this.renderCurrentLine()}
          {this.renderLines()}
        </g>
        {this.renderNavLine()}
      </svg>
    )
  }
}
// ${top}px ${left + paddings.left}px ${right - paddings.right}px ${bottom}px
