import React, { Component, PropTypes } from 'react'
import styles from './reports.css'
import CSSModules from 'react-css-modules'
import down_arr from './images/down_arr.png'
import eq_arr from './images/eq_arr.png'
import raise_arr from './images/raise_arr.png'
import non_arr from './images/non_arr.png'
import moment from 'moment'
import { ConcentricCircles } from '../ItemsChart/ItemsChart'

@CSSModules(styles)
export default class Reports extends Component {
  static defaultProps = {
    currentItemIdx: 0
  }

  static propTypes = {
    l: PropTypes.func,
    currentItemIdx: PropTypes.number,
    date: PropTypes.number,
    clickCallback: PropTypes.func,
    selectedItemId: PropTypes.string,
    data: PropTypes.object,
    display: PropTypes.bool,
  }

  static statics = {
    arrowIcon: [non_arr, raise_arr, eq_arr, down_arr],
    columns: ['status', 'name', 'tendency', 'value'],
  }

  onClick = (tiId) => () => {
    this.props.clickCallback(tiId)
  }

  render() {
    const { l, selectedItemId, date, data, display } = this.props
    const { arrowIcon, columns } = Reports.statics

    let dateOfTrId = ''
    if (date) {
      dateOfTrId = moment(date, 'x').format('YYYY-MM-DD')
    }

    const titles = [l('Status2'), l('Item2'), l('Tendency '), l('Value2')]
    return (
      <div>
        <div styleName="table-wrapper">
          <div styleName="table-date">
          {
            (display)
            ? <div>{dateOfTrId}</div>
            : <span />
          }
          </div>
          <div styleName="table-head">
            {
              titles.map(
                (title, idx) => (
                  <div key={`abtitle-${idx}`} styleName="table-cell">
                    <span styleName="table-title-text">{title}</span>
                  </div>
                )
              )
            }
          </div>
          <div styleName="table-body">
            <div styleName="table-rows">
            {
              (display)
              ? data.map((row, idx) => (
                <div key={`exrow-${idx}`}
                  styleName={
                    (row.get('ti_id') === selectedItemId) ?
                    'table-body-row-selected' :
                    'table-body-row'
                  }
                  onClick={this.onClick(row.get('ti_id'))} >
                  {
                    columns.map((col, idx) => (
                      <div key={`excol-${col}-${idx}`} styleName="table-cell">
                        {
                          (idx === 0) ? <Circle status={row.get(col)} /> :
                          (idx === 2) ? <img src={arrowIcon[row.get(col)]} /> :
                          (idx === 3) && (row.get(col) !== '-') ?
                              <div>{`${row.get(col)} (${row.get('unit')})`}</div> :
                              <div>{row.get(col)}</div>
                        }
                      </div>
                    ))
                  }
                </div>
              ))
              : <span />
            }
            </div>
          </div>
        </div>
      </div>
    )
  }
}

const Circle = (props) => {
  const fill = ['#269338', '#bb0625', '#bb0625', '#aaa']
  const stroke = ['#91c710', '#e0362b', '#e0362b', '#ccc']
  const idx = (props.status <= 3) ? props.status : 3

  return (
    <svg width="20" height="20" viewBox="0 0 20 20" version="1.1"
      xmlns="http://www.w3.org/2000/svg">
      <circle cx="10" cy="10" r="7" strokeWidth="3"
        fill={fill[idx]} stroke={stroke[idx]} />
      { idx == 2
        ? <circle cx="10" cy="10" r="6" strokeWidth="1"
        fill={fill[idx]} stroke="white" />
        : null
      }
    </svg>
  )
}
