import React, { Component, cloneElement, PropTypes } from 'react'
import CSSModules from 'react-css-modules'
import styles from './pan-zoom.css'
import Slider from 'components/Slider'
import { fromJS } from 'immutable'
import { scaleLinear, scaleTime } from 'd3-scale'
import PureRenderMixin from 'react-addons-pure-render-mixin'

const initialDragState = fromJS({
  isDragging: false,
  initPosition: {},
  prevPosition: {},
  distance: { x: 0, y: 0 },
  absoluteDistance: { x: 0, y: 0 },
})

@CSSModules(styles)
export default class PanZoom extends Component {
  static propTypes = {
    startTime: PropTypes.number,
    endTime: PropTypes.number,
    centralTime: PropTypes.number,
    left: PropTypes.number,
    right: PropTypes.number,
    children: PropTypes.func.isRequired,
    selectTime: PropTypes.func,
    distinctTimes: PropTypes.array,
  }
  static defaultProps = {
    min: 100,
    max: 200,
    step: 10,
    left: 0,
    right: 0,
  }
  state = {
    zoomRatio: 100,
    drag: initialDragState,
    xScale: null,
  }

  constructor(props) {
    super(props)
    this.shouldComponentUpdate = PureRenderMixin.shouldComponentUpdate.bind(this)
  }

  componentWillMount() {
    this.componentWillReceiveProps(this.props)
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.startTime == this.props.startTime && nextProps.endTime == this.props.endTime && this.state.xScale) {
      return
    } else if (!nextProps.startTime || !nextProps.endTime) {
      return
    }

    if (nextProps.startTime != this.props.startTime || nextProps.endTime != this.props.endTime) {
      const { left, right, startTime, endTime } = nextProps
      const xScale = scaleTime().range([left , right]).domain([startTime, endTime])
      this.setState({
        zoomRatio: 100,
        drag: initialDragState,
        xScale,
      })
    } else {
      this.setState({
        xScale: this.adjustXScale(this.state.zoomRatio / 100, this.state.drag.getIn(['distance', 'x']), nextProps)
      })
    }
  }

  handleZooming = (value) => {
    if (value == this.state.zoomRatio) {
      return
    }

    this.setState({
      zoomRatio: value,
      drag: initialDragState,
      xScale: this.adjustXScale(value / 100, 0),
    })
  }

  handleDragStart = (e) => {
    window.addEventListener('mousemove', this.handleDragMove)
    window.addEventListener('mouseup', this.handleDragStop)
    this.setState({
      drag: this.state.drag.merge({
        isDragging: true,
        initPosition: { x: e.nativeEvent.offsetX, y: e.nativeEvent.offsetY },
        prevPosition: { x: e.clientX, y: e.clientY },
        absoluteDistance: { x: 0, y: 0, },
      }),
    })
  }

  handleDragMove = (e) => {
    const { drag } = this.state
    if (Math.abs(drag.getIn(['prevPosition', 'x']) - e.clientX) < 2) {
      return
    }
    if (document.getElementsByTagName('BODY')[0].className != styles.panning) {
      document.getElementsByTagName('BODY')[0].className = styles.panning
    }

    const offsetX = e.clientX - this.state.drag.getIn(['prevPosition', 'x'])
    this.setState({
      drag: this.state.drag.merge({
        prevPosition: { x: e.clientX, y: e.clientY },
        distance: {
          x: offsetX,
        },
        absoluteDistance: {
          x: this.state.drag.getIn(['absoluteDistance', 'x']) + Math.abs(offsetX),
        },
      }),
      xScale: this.adjustXScale(this.state.zoomRatio / 100, offsetX),
    })
  }

  handleDragStop = (e) => {
    window.removeEventListener('mousemove', this.handleDragMove)
    window.removeEventListener('mouseup', this.handleDragStop)
    document.getElementsByTagName('BODY')[0].className = ''

    if (this.state.drag.getIn(['absoluteDistance', 'x']) < 3) {
      this.selectTime(this.state.drag.getIn(['initPosition', 'x']))
    }
    this.setState({ drag: this.state.drag.set('isDragging', false) })
  }

  handleWheel = (e) => {
    const step = e.deltaY < 0? this.props.step: -this.props.step
    const value = Math.max(this.props.min, Math.min(this.props.max, this.state.zoomRatio + step))
    if (value == this.state.zoomRatio) {
      return
    }
    e.preventDefault()
    this.handleZooming(value)
  }

  adjustXScale = (zoomScale = 1, offsetX = 0, props = this.props) => {
    const { startTime, endTime, left, right, centralTime } = props
    if (!startTime || !endTime || !left || !right || !centralTime) {
      return null
    }
    const xScaleBase = scaleTime().range([left , right]).domain([startTime, endTime])
    const xScale = this.state.xScale || xScaleBase

    const width = right - left
    const centralX = xScale(centralTime)
    const adjLeft = xScale(startTime)
    const adjRight = xScale(endTime)
    const leftRatio = (centralX - adjLeft) / (adjRight - adjLeft)
    const rightRatio = 1 - leftRatio
    let rangeLeft = centralX - leftRatio * width * zoomScale + offsetX
    let rangeRight = centralX + rightRatio * width * zoomScale + offsetX
    if ( (rangeLeft > right - 10 * zoomScale && rangeLeft >= rangeLeft - offsetX)
      || (rangeRight < left + 10 * zoomScale && rangeRight <= rangeRight - offsetX)) {
      rangeLeft -= offsetX
      rangeRight -= offsetX
    }
    return scaleTime().range([rangeLeft, rangeRight]).domain([startTime, endTime])
  }

  selectTime = (x) => {
    const { distinctTimes } = this.props
    if (!distinctTimes || distinctTimes.length == 0) {
      return
    }

    const atTime = this.state.xScale.invert(x).valueOf()
    const nearestTime = distinctTimes.reduce((answer, t) => {
      if (Math.abs(t - atTime) < Math.abs(answer - atTime)) {
        return t
      }
      return answer
    }, 0)
    if (this.props.selectTime) {
      this.props.selectTime(nearestTime)
    }
  }

  render() {
    const { min, max, step } = this.props
    return (
      <div styleName="container">
        {this.props.children({
          triggerPan: this.handleDragStart,
          handleWheel: this.handleWheel,
          xScale: this.state.xScale,
        })}
        <Slider
          min={min}
          max={max}
          step={step}
          value={this.state.zoomRatio}
          callback={this.handleZooming}/>
      </div>
    )
  }
}
