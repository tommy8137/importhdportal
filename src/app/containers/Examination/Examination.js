import React, { Component, PropTypes } from 'react'
import styles from './examination.css'
import CSSModules from 'react-css-modules'
import UserBar from 'components/UserBar'
import { actionCreators, preload } from './actions'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import Reports from './components/Reports'
import ItemsChart from './components/ItemsChart'
import { browserHistory } from 'react-router'
import { selector } from './selector'
import Helmet from 'react-helmet'

const mapDispatchToProps = (dispatch) => (
  { actions: bindActionCreators({ ...actionCreators }, dispatch) }
)

@connect(selector, mapDispatchToProps)
@CSSModules(styles)
export default class Examination extends Component {
  static preloader = [preload];
  static propTypes = {
    l: PropTypes.func,
    actions: PropTypes.object,
    location: PropTypes.object,
    date: PropTypes.number,
    chartData: PropTypes.object,
    tableData: PropTypes.object,
    display: PropTypes.bool,
    trId: PropTypes.string,
    tiId: PropTypes.string,
    tiName: PropTypes.string,
    tiUnit: PropTypes.string,
  }

  setURLQuery = (tiId, trId) => {
    browserHistory.push({
      pathname: this.props.location.pathname,
      query: { ti_id: tiId, tr_id: trId },
    })
  }

  tableClickCallback = (tiId) => {
    const { trId } = this.props
    this.setURLQuery(tiId, trId)
  }

  chartClickCallback = (trId) => {
    const tiId = this.props.location.query.ti_id || this.props.tiId
    this.setURLQuery(tiId, trId)
  }

  render() {
    const {
      date,
      chartData,
      tableData,
      display,
      trId,
      tiId,
      tiName,
      tiUnit,
      l,
      status,
    } = this.props
    return (
      <div styleName="container">
        <Helmet title="Lab Data" />
        <UserBar />
        <div styleName="main">
          <div styleName="left">
            <div styleName="current-item-name-label-wrapper">
              <div styleName="current-item-name-label">
                {tiName}
              </div>
            </div>
            <div styleName="chart">
              <ItemsChart
                key={`item-chart-${trId}-${tiId}`}
                l={l}
                display={display}
                date={date}
                unit={tiUnit}
                data={chartData}
                status={status}
                clickCallback={this.chartClickCallback} />
            </div>
          </div>
          <div styleName="right">
            <Reports
              key={`report-${trId}-${tiId}`}
              l={l}
              display={display}
              date={date}
              data={tableData}
              selectedItemId={tiId}
              clickCallback={this.tableClickCallback} />
          </div>
        </div>
      </div>
    )
  }
}
