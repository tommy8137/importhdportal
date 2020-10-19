import React, { PureComponent } from 'react'
import CSSModules from 'react-css-modules'
import styles from './record.css'
import UserBar from 'components/UserBar'
import { connect } from 'react-redux'
import { TextItem } from './components/widgets'
import ParamsArea from './components/ParamsArea'
import selector from './selector'
import { bindActionCreators } from 'redux'
import * as actions from './actions'
import Chart from './components/Chart'
import Helmet from 'react-helmet'
import { browserHistory } from 'react-router'
import Panels from './components/Panels'
import PanZoom from 'components/PanZoom'
import NavPoints from 'components/NavPoints'

@connect(
  // (state) => selector(state),
  selector,
  (dispatch) => ({ actions: bindActionCreators(actions, dispatch) })
)
@CSSModules(styles)
export default class Record extends PureComponent {
  static preloader = actions.preload;

  componentDidMount() {
    const { location } = this.props
    this.componentWillReceiveProps(this.props)
  }

  componentWillReceiveProps(newProps) {
    const { location: { query: { pi_id } } } = newProps
  }

  selectPanelItem = (piId) => {
    const { location: { pathname, query } } = this.props
    if (query.pi_id != piId) {
      browserHistory.push({
        pathname: pathname,
        query: {
          pi_id: piId,
        },
      })
    } else {
      const { selectPanelItem } = this.props.actions
      selectPanelItem(piId)
    }
  }

  render() {
    const {
      l,
      recordId,
      selectedTime,
      params,
      panels,
      text,
      datas,
      toggled,
      startTime,
      endTime,
      timesOfDialyze,
      distinctTimes,
      notesformat,
      location: { query: { pi_id } },
      actions: { toggleParam, selectTime },
    } = this.props

    const width = 500
    const left = Chart.defaultProps.margins.left + Chart.defaultProps.paddings.left
    const right = width - Chart.defaultProps.margins.right - Chart.defaultProps.paddings.right
    let date = new Date(selectedTime)
    let selectedDate = ('0' + (date.getHours())).slice(-2) + ':' + ('0' + date.getMinutes()).slice(-2) + ':' + ('0' + date.getSeconds()).slice(-2)
    if (distinctTimes == 0)
      selectedDate = ''

    return (
      <div styleName="container">
        <Helmet title="Record" />
        <UserBar />
        <div styleName="status-bar">
          {text.map((t, i) => (
            <TextItem
              key={`${t.get('name')}-${i}`}
              label={l(t.get('name'))}
              startValue={t.get('data').size > 0 ? t.get('data').first().get('value') : '--'}
              currentValue={selectedTime && t.get('data').find(d => d.get('time') == selectedTime)
                ? t.get('data').find(d => d.get('time') == selectedTime).get('value')
                : '--'}
              unit={t.get('unit')} />
          ))}
        </div>
        <div styleName="main-row">
          <ParamsArea l={l} params={params} toggleParam={toggleParam} selectedTime={selectedTime} timesOfDialyze={timesOfDialyze} />
          <div styleName="col-2">
            <div styleName="Nav">
              <div styleName="selectedDate">{selectedDate}</div>
              <NavPoints
                l={l}
                selectTime={selectTime}
                selectedTime={selectedTime}
                distinctTimes={distinctTimes} />
            </div>

            <PanZoom
              startTime={startTime}
              endTime={endTime}
              centralTime={selectedTime || endTime}
              left={left}
              right={right}
              key={recordId}
              step={50}
              max={500}
              selectTime={selectTime}
              distinctTimes={distinctTimes}>
              {({ triggerPan, handleWheel, xScale }) =>
                <Chart
                  width={width}
                  height={500}
                  datas={datas}
                  toggled={toggled}
                  {...panels}
                  piId={pi_id}
                  selectTime={selectTime}
                  selectedTime={selectedTime}
                  selectPanelItem={this.selectPanelItem}
                  startTime={startTime}
                  endTime={endTime}
                  distinctTimes={distinctTimes}
                  triggerPan={triggerPan}
                  handleWheel={handleWheel}
                  xScale={xScale} />
              }
            </PanZoom>
          </div>
          <Panels l={l} {...panels} piId={pi_id} selectPanelItem={this.selectPanelItem} notesformat={notesformat} />
        </div>
      </div>
    )
  }
}
