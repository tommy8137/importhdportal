import React, { PureComponent, PropTypes } from 'react'
import Line from 'components/Svg/Line'
import PredictLine from './components/PredictLine'
import XTimeAxis from './components/XTimeAxis'
import YTimeAxis from './components/YTimeAxis'
import YGridLine from './components/YGridLine'
import SBPAlarmThresholdLine from './components/SBPAlarmThresholdLine'
import moment from 'moment'
import { scaleTime, scaleLinear } from 'd3-scale'
import PureRenderMixin from 'react-addons-pure-render-mixin'
import NavPoints from 'components/NavPoints'
import withPanZoom from 'app/utils/with-panzoom'

//-------------------------------------------------------------------------
// Blood Presure Constant Values
//-------------------------------------------------------------------------
const MAX_BLOOD_PRESURE_BOUND = 170
const MIN_BLOOD_PRESURE_BOUND = 70

function generateYScale(paintingZone, [yMin, yMax] = [MIN_BLOOD_PRESURE_BOUND, MAX_BLOOD_PRESURE_BOUND]) {
  yMin = Math.min(yMin, MIN_BLOOD_PRESURE_BOUND)
  yMax = Math.max(yMax, MAX_BLOOD_PRESURE_BOUND)
  const { left, top, bottom, paddings } = paintingZone
  const yRange = scaleLinear().range([top, bottom - paddings.bottom])
  return { yScale: yRange.domain([yMax, yMin]), yMin, yMax }
}

class SimulatorChart extends PureComponent {
  static propTypes = {
    width: PropTypes.number,
    height: PropTypes.number,
    startTime: PropTypes.number,
    endTime: PropTypes.number,
    greenLine: PropTypes.object,
    symbols: PropTypes.array,
    predictPoints: PropTypes.object,
    simulatePoints: PropTypes.object,
    clickTimeCallback: PropTypes.func,
    selectedTime: PropTypes.number,
  }
  static defaultProps = {
    width: 750,
    height: 350,
    greenLine: null,
    predictPoints: null,
    simulatePoints: null,
    margins: {
      left: 10,
      top: 10,
      right: 10,
      bottom: 0,
    },
    paddings: {
      left: 40,
      top: 10,
      right: 30,
      bottom: 30,
    },
  }
  state = {
    points: null,
    greenLine: null,
    predictions: null,
    simulation: null,
    simKey: null,
    yScale: null,
  }

  get paintingZone() {
    const { width, height, margins, paddings } = this.props
    const { left, top, right, bottom } = margins

    return {
      left: left,
      top: top,
      right: width - right,
      bottom: height - bottom,
      width: width - right - left,
      height: height - bottom - top,
      paddings,
    }
  }

  componentWillMount() {
    this.componentWillReceiveProps(this.props)
  }

  componentWillReceiveProps(newProps) {
    if (!newProps.xScale) {
      return
    }
    this.calculateYScale(newProps)
    if (newProps.simulation != this.props.simulation) {
      this.setState({
        simKey: 'simulation-' + new Date().valueOf()
      })
    }
  }

  calculateYScale(newProps) {
    const { predictions, greenLine, simulation } = newProps
    const { sbpMaxBloodUpper, sbpMaxBloodLower } = this.props
    if (greenLine == this.props.greenLine && predictions == this.props.predictions && this.state.yScale) {
      return this.state.yScale
    }
    const { values } = greenLine
    let yMin, yMax
    if (predictions) {
      const UBUBs = predictions.ub_ub.map(uu => uu.y)
      const LBLBs = predictions.lb_lb.map(ll => ll.y)
      let SIMLBLBs
      if (simulation) {
        SIMLBLBs = simulation.lb_lb.map(ll => ll.y)
        yMin = Math.min(...values, ...LBLBs, sbpMaxBloodLower, ...SIMLBLBs) - 10
      } else {
        yMin = Math.min(...values, ...LBLBs, sbpMaxBloodLower) - 10
      }
      yMax = Math.max(...values, ...UBUBs, sbpMaxBloodUpper) + 10
    } else {
      yMin = Math.min(...values) - 10
      yMax = Math.max(...values) + 10
    }
    let yScale
    ({ yScale, yMin, yMax } = generateYScale(this.paintingZone, [yMin, yMax]))
    if (yScale != this.state.yScale) {
      this.setState({ yScale, yMin, yMax })
    }
    return yScale
  }

  renderPredictions() {
    const { greenLine } = this.props
    const { predictions } = this.props
    if (!predictions || ! greenLine.key) {
      return null
    }
    return (
      <PredictLine
        key={greenLine.key + '-predict'}
        uprPoints={predictions.ub}
        lwrPoints={predictions.lb}
        upUprPoints={predictions.ub_ub}
        lwLwrPoints={predictions.lb_lb}
        color={'#e61673'}
        opacity={0.1}
        xScale={this.props.xScale}
        yScale={this.state.yScale}/>
    )
  }

  renderSimulation() {
    const { greenLine, simulation } = this.props
    const { simKey } = this.state
    if (!simKey || !simulation || ! greenLine.key) {
      return null
    }
    return (
      <PredictLine
        key={simKey}
        uprPoints={simulation.ub}
        lwrPoints={simulation.lb}
        upUprPoints={simulation.ub_ub}
        lwLwrPoints={simulation.lb_lb}
        color={'#00a0e9'}
        opacity={0.2}
        speed={4}
        xScale={this.props.xScale}
        yScale={this.state.yScale}/>
    )
  }

  render() {
    const { width, height, selectedTime, l, clickTimeCallback } = this.props
    const { symbols } = this.props
    const { triggerPan, handleWheel, xScale, greenLine } = this.props
    const { left, right, top, bottom, paddings, height: pHeight } = this.paintingZone
    const { yScale, yMin, yMax } = this.state // starttime and endtime are for transion between different records
    const { startTime, endTime } = this.props
    const { sbpAlarmThreshold } = this.props
    const chart = (!this.props.xScale || !this.state.yScale || !startTime || !endTime)
      ? <svg width={width} height={height}/>
      : (
        <svg
          width={width}
          height={height}
          onWheel={handleWheel}
          onMouseDown={triggerPan}>
          <defs>
            <clipPath id="clipPath-params-simulator-chart">
              <rect
                x={left + paddings.left}
                y={top}
                width={right - left - paddings.left - paddings.right + 2}
                height={pHeight}/>
              <rect
                x={left + paddings.left - 20}
                y={bottom - paddings.bottom + 2}
                width={right - left - paddings.left - paddings.right + 40}
                height={paddings.bottom + 10}/>
            </clipPath>
          </defs>
          {
            (!!sbpAlarmThreshold && sbpAlarmThreshold <= yMax && sbpAlarmThreshold >= yMin ) &&
              <YTimeAxis
                yScale={yScale}
                x={left + paddings.left}
                y={0}
                sbpAlarmThreshold={sbpAlarmThreshold} />
          }
          <g clipPath={`url(#clipPath-params-simulator-chart)`}>
            <XTimeAxis
              bottom={bottom - paddings.bottom}
              xScaleFunc={xScale}
              startTime={startTime}
              endTime={endTime}
              callback={clickTimeCallback}
              width={width}
              height={bottom - top - paddings.bottom}
              left={left + paddings.left}
              right={right - paddings.right}
              currentTime={selectedTime} />
            {
              (!!sbpAlarmThreshold && sbpAlarmThreshold <= yMax && sbpAlarmThreshold >= yMin ) &&
                <SBPAlarmThresholdLine
                  left={left + paddings.left}
                  right={right - paddings.right}
                  yScaleFunc={yScale}
                  tuningValue={sbpAlarmThreshold} />
            }
            {this.renderPredictions()}
            {this.renderSimulation()}
            <Line
              key={greenLine.key}
              callback={clickTimeCallback}
              points={greenLine.points}
              times={greenLine.times}
              values={greenLine.values}
              symbols={symbols}
              xScale={xScale}
              yScale={yScale}
              type="solid"
              width={2}
              stroke="#50b4aa"/>
          </g>
        </svg>
      )

    return (
      <div>
        <NavPoints
          l={l}
          distinctTimes={greenLine.times}
          selectedTime={selectedTime}
          selectTime={clickTimeCallback}/>
        {chart}
      </div>
    )
  }
}

class Bound95Text extends PureComponent {
  static propTypes = {
    enable: PropTypes.bool,
    fill: PropTypes.string,
    xUp: PropTypes.number,
    yUp: PropTypes.number,
    textUp: PropTypes.string,
    xLow: PropTypes.number,
    yLow: PropTypes.number,
    textLow: PropTypes.string,
  }

  render() {
    const { enable, fill, xUp, yUp, textUp, xLow, yLow, textLow } = this.props
    if (enable === true) {
      return (
        <g>
          <text fill={fill} x={xUp} y={yUp}>{textUp}</text>
          <text fill={fill} x={xLow} y={yLow}>{textLow}</text>
        </g>
      )
    }

    return <g/>
  }
}

export default withPanZoom({
  left: SimulatorChart.defaultProps.margins.left + SimulatorChart.defaultProps.paddings.left,
  right: SimulatorChart.defaultProps.margins.right + SimulatorChart.defaultProps.paddings.right,
  width: SimulatorChart.defaultProps.width,
  selectTime: 'clickTimeCallback',
  distinctTimes: 'greenLine.times',
})(SimulatorChart)
