import React, { Component, PropTypes } from 'react'
import CSSModules from 'react-css-modules'
import styles from './Search.css'
import { connect } from 'react-redux'
import { actionCreators, preload } from './actions'
import { bindActionCreators } from 'redux'
import SearchResultTable, { statics } from './components/SearchResultTable'
import SearchBlock from './components/SearchBlock'
import moment from 'moment'
import { createSelector } from 'reselect'
import { selectPatient } from 'actions/patient-action'
import { DIRECTION } from 'app/libs/redux-table'

const searchSelector = (state) => (state.overview.search.get('schedulePatients'))
const selector = createSelector(
  (state) => (state.overview.overview.get('shifts')),
  searchSelector,
  (shifts, searchState) => {
    const data = searchState.toJS()
    const firstItem = data[0] || {}
    const columns = Object.keys(firstItem)
    const idxOfRecordId = columns.indexOf('r_id')
    if (idxOfRecordId > -1) {
      columns.splice(idxOfRecordId, 1)
    }
    return { data, columns, shifts }
  }
)

const mapDispatchToProps = (dispatch) => {
  return { actions: bindActionCreators({ ...actionCreators, selectPatient }, dispatch) }
}

@connect(selector, mapDispatchToProps)
@CSSModules(styles)
export default class extends Component {
  static preloader = preload;
  static propTypes = {
    actions: PropTypes.object,
  }

  state = {
    resetScroll: false,
    loadedPages: 2,
    tableHeight: 5 * statics.SINGLE_RECORD_HEIGHT,
    startDate: moment().format('YYYY-MM-DD'),
    endDate: moment().format('YYYY-MM-DD'),
    optional: {
      offset: 0,
      limit: 10,
      q: '',
    }
  }

  componentDidMount() {
    this.onResize()
    window.addEventListener('resize', this.onResize)
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.onResize)
  }
  //-----------------------------------------------------------------------------
  // callbacks send to child components
  //-----------------------------------------------------------------------------
  onResize = (e) => {
    const { SINGLE_RECORD_HEIGHT } = statics
    const { tableHeight } = this.state

    const newTableHeight = 5 * SINGLE_RECORD_HEIGHT
      + parseInt((window.innerHeight - 647) / SINGLE_RECORD_HEIGHT)
      * SINGLE_RECORD_HEIGHT
    if (newTableHeight !== tableHeight) {
      this.setState({ tableHeight: newTableHeight })
    }
  }

  orderCallback = (column, direction) => {
    const { optional } = this.state
    this.setState({
      resetScroll: true,
    })
    let orderByColumn = column
    if (direction === DIRECTION.DESC) {
      orderByColumn = `-${column}`
    }
    const newOptional = {
      ...optional,
      sort: orderByColumn,
      offset: 20,
      limit: 10,
    }

    // re-fetch each pages, to prevent fetch huge data once when sorting
    this.fetchNewPage(newOptional)
  }

  searchCallback = (q) => {
    const { optional } = this.state
    this.setState({
      resetScroll: true,
    })
    const newOptional = {
      ...optional,
      q,
      offset: 20,
      limit: 10,
    }

    this.fetchNewPage(newOptional)
  }

  fetchNewPage = (newOptional) => {
    const { startDate, endDate, optional } = this.state

    // fetch 2 page once, not change the limit size,
    // so won't be updated to state
    this.setState({
      loadedPages: 2,
      optional: newOptional,
    })

    const fetchOptional = Object.assign(
      {}, newOptional, { offset: 0, limit: 20 }
    )

    this.props.actions.fetchSearchSchedule(startDate, endDate, fetchOptional)
  }

  scrollCallback = (fetchPage) => {
    const { startDate, endDate, optional } = this.state
    const newOptional = {
      ...optional,
      offset: fetchPage * 10,
      limit: 10,
    }

    this.setState({
      resetScroll: false,
      loadedPages: fetchPage + 1,
      optional: newOptional
    })
    this.props.actions.nextPageSearchSchedule(startDate, endDate, newOptional)
  }

  dateChangeCallback = (date) => {
    this.setState({ ...date })
  }

  patientSelectCallback = (patient) => {
    this.props.actions.selectPatient(patient)
  }

  //-----------------------------------------------------------------------------
  // render
  //-----------------------------------------------------------------------------
  render() {
    const { data, columns, shifts } = this.props
    const { loadedPages, tableHeight, resetScroll, optional: { limit, offset } } = this.state

    return (
      <div>
        <SearchBlock
          dateChangeCallback={this.dateChangeCallback}
          searchCallback={this.searchCallback} />
        <SearchResultTable
          shifts={shifts}
          resetScroll={resetScroll}
          loadedPages={loadedPages}
          tableHeight={tableHeight}
          data={data}
          columns={columns}
          patientSelectCallback={this.patientSelectCallback}
          orderCallback={this.orderCallback}
          scrollCallback={this.scrollCallback}
          limit={limit}
          offset={offset} />
      </div>
    )
  }
}
