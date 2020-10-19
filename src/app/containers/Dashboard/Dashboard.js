import React, { Component } from 'react'
import UserBar from 'components/UserBar'
import CSSModules from 'react-css-modules'
import styles from './dashboard.css'
import { PatientStatus, CircleSymbol, InformBlock } from './components/widgets'
import { connect } from 'react-redux'
import Immutable, { fromJS } from 'immutable'
import ItemsBlock from './components/ItemsBlock'
import RiskSummary from './components/RiskSummary'
import { preload } from './actions'
import selector from './selector'
import { browserHistory } from 'react-router'
import Helmet from 'react-helmet'
import { selectPatientRisk } from 'actions/patient-action'
import { bindActionCreators } from 'redux'

const mapDispatchToProps = (dispatch) => (
  { actions: bindActionCreators({ selectPatientRisk }, dispatch) }
)

@connect(
  (state) => selector(state), mapDispatchToProps
)
@CSSModules(styles)
export default class Dashboard extends Component {
  static preloader = preload;

  goToRecordPage = () => {
    const {  params: { p_id, record } } = this.props
    browserHistory.push(`/patient/${p_id}/record/${record}`)
  };

  goToExamPage = () => {
    const {  params: { p_id, record } } = this.props
    browserHistory.push(`/patient/${p_id}/examination/${record}`)
  };

  riskSummaryClick = (user) => {
    this.props.actions.selectPatientRisk(user)
  }

  render() {
    const {
      l,
      status: { weight, heparinUsage, sbp, dbp },
      record,
      test,
      categories,
      modules,
    } = this.props

    const {  params: { p_id, record: rid } } = this.props
    return (
      <div styleName="container">
        <Helmet title="Dashboard"/>
        <UserBar/>
        <div styleName="patient-status">
          <div styleName="status-item">
            {l('Weight (Before/After)')}： {weight.get('pre')}/{weight.get('post')} kg
          </div>
          <div styleName="status-item">
            {l('Anticoagulation bolus dose')}：{heparinUsage.get('start')}iu&nbsp;&nbsp;
            {l('Continuous infusion')}：{heparinUsage.get('remain')}iu&nbsp;&nbsp;
            {l('Circulation')}：{heparinUsage.get('circulation')}iu
          </div>
          <div styleName="status-item">
            {l('BP (Pre-dialysis)')}：{sbp.get('pre')}/{dbp.get('pre')}&nbsp;mmHg
          </div>
          <div styleName="status-item">
            {l('BP (Post-Dialysis)')}：{sbp.get('post')}/{dbp.get('post')}&nbsp;mmHg
          </div>
        </div>
        <div styleName="main-content">
          <div styleName="col-1">
            <div styleName="title">{l('Dialyze Records').replace('\\n', ' ')}</div>
            <InformBlock l={l} red={record.abnormal.size} green={record.total - record.abnormal.size - record.handled.size} orange={record.handled.size}/>
            <ItemsBlock
              items={record.abnormal}
              label={l('Abnormal2')}
              l={l}
              level="red"
              canToggle={true}
              patientId={p_id}
              rId={rid}
              type="record"
            />
            <ItemsBlock
              items={record.handled}
              label={l('Handled ')}
              l={l}
              level="orange"
              canToggle={true}
              patientId={p_id}
              rId={rid}
              type="record"
            />
          </div>
          <div styleName="col-2">
            <div styleName="title">
              <span>{l('Lab Data').replace('\\n', ' ')}</span>
              <span styleName="test-date">{test.date}</span>
            </div>
            <InformBlock l={l} red={test.abnormal.size} green={test.total - test.abnormal.size - test.critical.size} critical={test.critical.size} />
            <ItemsBlock
              items={test.critical}
              label={l('Critical')}
              l={l}
              level="critical"
              getItemWords={item => item.get('name') + '：' + item.get('value')}
              patientId={p_id}
              rId={rid}
              canToggle={true}
              type="examination"
            />
            <ItemsBlock
              items={test.abnormal}
              label={l('Abnormal2')}
              l={l}
              level="red"
              getItemWords={item => item.get('name') + '：' + item.get('value')}
              patientId={p_id}
              rId={rid}
              canToggle={true}
              type="examination"
            />
          </div>
          <div styleName="col-3">
            <RiskSummary l={l} categories={categories} modules={modules} patientId={p_id} rId={rid} riskSummaryClick={this.riskSummaryClick}/>
          </div>
        </div>
      </div>
    )
  }
}
