import React, { Component, PropTypes } from 'react'
import { DIRECTION } from 'app/libs/redux-table'
import CSSModules from 'react-css-modules'
import styles from './search-result-table.css'
import { connect } from 'react-redux'
import Triangle from 'components/Triangle'

@connect(
  state => ({
    l: (word) => state.locale.get('locale').get(word),
  })
)
@CSSModules(styles)
export default class SearchResultTable extends Component {
  static statics = {
    SINGLE_RECORD_HEIGHT: 40,
  }

  static propTypes = {
    actions: PropTypes.object,
    // dynamic data
    columns: PropTypes.array,
    limit: PropTypes.number,
    offset: PropTypes.number,
    // callbacks
    patientSelectCallback: PropTypes.func,
    orderCallback: PropTypes.func,
    scrollCallback: PropTypes.func,
    // locale
    l: PropTypes.func,
    // infinite load
    loadedPages: PropTypes.number,
    tableHeight: PropTypes.number,
    resetScroll: PropTypes.bool,
  }

  state = {
    orderDirection: DIRECTION.ASC,
    orderColumn: 'date',
  }

  //-----------------------------------------------------------------------------
  // event handler
  //-----------------------------------------------------------------------------
  onScroll = (e) => {
    const { SINGLE_RECORD_HEIGHT } = SearchResultTable.statics
    const { loadedPages, tableHeight } = this.props
    const tableVisibleRows = tableHeight / SINGLE_RECORD_HEIGHT
    const oneRequestPageRows = 10
    const fetchTriggerBufferHeight = 10
    const FIRST_FETCH_SCROLL_TOP_POSITION = (12 - tableVisibleRows) * SINGLE_RECORD_HEIGHT
    const { scrollTop } = e.target

    // 10px heigth for scroll fetch buffer
    if (loadedPages > 1 &&
      // scrollTop >= (FIRST_FETCH_SCROLL_TOP_POSITION + (loadedPages - 2) * SINGLE_RECORD_HEIGHT * oneRequestPageRows) &&
      // scrollTop < (FIRST_FETCH_SCROLL_TOP_POSITION + (loadedPages - 2) * SINGLE_RECORD_HEIGHT * oneRequestPageRows) + fetchTriggerBufferHeight
      scrollTop >= (FIRST_FETCH_SCROLL_TOP_POSITION + (loadedPages - 2) * SINGLE_RECORD_HEIGHT * oneRequestPageRows)
    ) {
      this.props.scrollCallback(loadedPages)
    }
  }

  onSort = (col) => () => {
    if (!col) {
      return false
    }
    let direction = DIRECTION.ASC
    if (this.state.orderDirection === DIRECTION.ASC) {
      direction = DIRECTION.DESC
    }
    this.setState({ orderColumn: col, orderDirection: direction })
    this.props.orderCallback(col, direction)
  }

  selectPatient = (patient) => () => {
    if ('r_id' in patient) {
      patient.recordId = patient.r_id
      delete patient.r_id
    }
    this.props.patientSelectCallback({ ...patient, id: patient.patient_id })
  }

  //-----------------------------------------------------------------------------
  // render and pre-render function
  //-----------------------------------------------------------------------------
  render() {
    const { l, data, columns, tableHeight, shifts } = this.props
    const titles = [
      l('Date'),
      l('Name'),
      l('Gender'),
      l('Record No'),
      l('Bed No.'),
      l('Schedule'),
      l('Status')
    ]

    // reset when re-fetch / sorting
    if (this.props.resetScroll) {
      this.refs.tableBody.scrollTop = 0
    }

    return (
      <div>
        <div styleName="table-wrapper">
          <div styleName="table-head">
            {
              titles.map(
                (title, idx) => (
                  <div key={`title-${idx}`}
                    styleName="table-cell" onClick={this.onSort(this.props.columns[idx])} >
                    <span styleName="table-title-text">{title}</span>
                    <Triangle direction={this.state.orderDirection}
                      isUpdate={this.props.columns[idx] === this.state.orderColumn}
                      isFocus={columns[idx] === this.state.orderColumn}/>
                  </div>
                )
              )
            }
          </div>
          <div ref="tableBody" styleName="table-body" style={{ height: tableHeight }} onScroll={this.onScroll}>
            {
              data.map((row, idx) => (
                <div key={`row-${idx}`} styleName="table-body-row" onClick={this.selectPatient(row)}>
                {
                  columns.map(
                    (col, idx) => {
                      let cell
                      if (col === 'schedule' && shifts) {
                        shifts.forEach((shift) => {
                          if (shift.get('s_id') === row[col]) {
                            cell = shift.get('s_name')
                          }
                        })
                      } else if (col === 'progress') {
                        cell = l(row[col])
                      } else {
                        cell = row[col]
                      }
                      return <div key={`col-${col}-${idx}`} styleName="table-cell">{cell}</div>
                    }
                  )
                }
                </div>
              ))
            }
          </div>
        </div>
      </div>
    )
  }
}
