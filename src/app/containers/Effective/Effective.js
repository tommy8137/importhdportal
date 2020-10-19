import React, { Component } from 'react'
import CSSModules from 'react-css-modules'
import Helmet from 'react-helmet'
import moment from 'moment'
import { bindActionCreators } from 'redux'
// -----------------------------------------------------------------------------
//  data flow dependency
// -----------------------------------------------------------------------------
import { connect } from 'react-redux'
import { selector } from './selector'
import { preloader, exportReport } from './actions'
// -----------------------------------------------------------------------------
//  UI dependency
// -----------------------------------------------------------------------------
import styles from './style.css'
import Select from 'react-select'
import Button from 'components/Buttons/ButtonDefault'
// -----------------------------------------------------------------------------
//  component
// -----------------------------------------------------------------------------
@connect(
  selector,
  (dispatch) => ({
    actions: bindActionCreators({ exportReport }, dispatch),
  })
)
@CSSModules(styles)
export default class extends Component {
  static preloader = preloader
  state = {
    year: null,
  }

  componentWillReceiveProps(nextProps) {
    let propYear = nextProps.years.toJS()
    if (propYear.length > 0 && (this.state.year == null || this.state.year != propYear[0])) {
      this.setState({ year: propYear[0] })
    }
  }

  // -----------------------------------------------------------------------------
  //  event handler
  // -----------------------------------------------------------------------------
  selectYear = (selection) => {
    this.setState({ year: selection.value })
  }

  submitExportReport = (e) => {
    e.preventDefault()
    const { exportReport } = this.props.actions
    exportReport(this.state.year, 'zh-tw')
  }

  render() {
    const { l, years } = this.props
    const reportList = years.map(year => ({ label: `${year}`, value: `${year}` })).toJS()
    return (
      <div styleName="container">
        <Helmet title="Effective" />
        <div styleName="main-content">
          <div styleName="modal-block">
            <div styleName="modal-top-block">
              <span styleName="title">{l('System Performance Analysis Report')}</span>
            </div>
            <div styleName="modal-mid2-block">
              <div styleName="text-period">{l('Period')}</div>
              <div styleName="select-div">
                <Select
                  clearable={false}
                  searchable={false}
                  placeholder={l('No Information')}
                  noResultsText={false}
                  styleName="dropdown"
                  options={reportList}
                  value={this.state.year}
                  onChange={this.selectYear} />
              </div>
            </div>
            <div styleName="modal-buttom-block">
              <Button
                id="exportButton"
                disabled={!this.state.year}
                onClick={this.submitExportReport}>
                  {l('Export')}
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }
}
