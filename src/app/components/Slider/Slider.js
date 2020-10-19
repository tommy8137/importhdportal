import React, { Component, PropTypes } from 'react'
import styles from './slider.css'
import CSSModules from 'react-css-modules'
import PureRenderMixin from 'react-addons-pure-render-mixin'
import { Subject } from 'rxjs/Subject'
import { Observable } from 'rxjs/Observable'
import 'rxjs/add/observable/timer'
import 'rxjs/add/operator/debounce'

const DEFAULT_VALUE = 100

@CSSModules(styles)
export default class Slider extends Component {
  static propTypes = {
    min: PropTypes.number.isRequired,
    max: PropTypes.number.isRequired,
    step: PropTypes.number.isRequired,
    value: PropTypes.number,
    callback: PropTypes.func,
    // orientation: PropTypes.oneOf(['vertical', 'horizontal']), // currently no use this
  }

  static defaultProps = {
    min: DEFAULT_VALUE,
    max: 200,
    step: 10,
    value: DEFAULT_VALUE,
    // orientation: 'vertical',
  }

  state = {
    value: null,
  }

  constructor(props) {
    super(props)
    this.shouldComponentUpdate = PureRenderMixin.shouldComponentUpdate.bind(this)
  }

  componentWillMount() {
    this.componentWillReceiveProps(this.props)
  }

  componentDidMount() {
    this.changed$ = new Subject()
    this.debounce$ = this.changed$.debounce(() => Observable.timer(50))
    this.debounce$.subscribe(value => {
      if (this.props.callback) {
        this.props.callback(value)
      }
    })
  }

  componentWillReceiveProps(newProps) {
    if (newProps.value != this.state.value) {
      this.setState({ value: newProps.value })
    }
  }

  changeZoom = (value) => {
    value = Math.min(value, this.props.max)
    value = Math.max(value, this.props.min)

    this.setState({ value: value })
    this.changed$.next(value)
  }

  handleChange = (e) => {
    this.changeZoom(parseInt(e.target.value))
  }

  handleWheel = (e) => {
    e.preventDefault()
    const step = e.deltaY < 0? this.props.step: -this.props.step
    this.changeZoom(this.state.value + step)
  }

  handleBtnClick = (step) => (e) => {
    this.changeZoom(this.state.value + step)
  }

  render() {
    const { min, max, step } = this.props
    return (
      <div styleName="container">
        <span>{this.state.value}%</span>
        <button styleName="btn" onClick={this.handleBtnClick(step)}>+</button>
        <div styleName="slider" onWheel={this.handleWheel}>
          <input
            type="range"
            styleName="input"
            min={min}
            max={max}
            step={step}
            value={this.state.value}
            onChange={this.handleChange}/>
        </div>
        <button styleName="btn" onClick={this.handleBtnClick(-step)}>-</button>
      </div>
    )
  }
}
