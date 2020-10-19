import React, { Component, PropTypes } from 'react'
import CSSModules from 'react-css-modules'
import styles from './risk-summary.css'
import PureRenderMixin from 'react-addons-pure-render-mixin'
import { Link } from 'react-router'
import { STATUS_ICON_TABLE } from 'containers/Patient/Overview/components/AbnormalListTable'
@CSSModules(styles)
export default class RiskSummary extends Component {
  static propTypes = {
    l: PropTypes.func.isRequired,
    categories: PropTypes.object.isRequired, // immutable list expected
    modules: PropTypes.object.isRequired,
    patientId: PropTypes.string,
    rId: PropTypes.string,
  };

  constructor(props) {
    super(props)
    this.shouldComponentUpdate = PureRenderMixin.shouldComponentUpdate.bind(this)
  }

  goToRiskAnalysis = (topic, module, e) => {
    console.log(topic, module)
  };

  selectPatientRisk = (patientId, rId, c_id, m_id) => () => {
    this.props.riskSummaryClick({ patientId, rId, c_id, m_id })
  }

  render() {
    const { l, categories, modules, patientId, rId } = this.props
    return (
      <div styleName="container">
        <div styleName="title">{l('Risk Summary')}</div>
        <div styleName="header-row">
          <div styleName="header-topic">{l('Risk Category')}</div>
          <div styleName="header-module">{l('Module')}</div>
        </div>
        <div styleName="body">
        {
          categories.map((category, idx) => (
            <div key={idx} styleName="row">
              <div styleName="item-number">{idx + 1}</div>
              <div styleName="item-topic">{l(category.get('category'))}</div>
              <div styleName="item-modules">
              {
                category.get('module').map((mId, mIdx) => (
                  <div key={mIdx} styleName="module" onClick={this.selectPatientRisk(patientId, rId, category.get('c_id'), mId)}>
                    <div styleName="riskList">
                      <div styleName="riskTime">{modules.get(mId).get('risk_time')}</div>
                      <div styleName="blackColon">：</div>
                      <div>{l(modules.get(mId).get('m_name'))}</div>
                      <div styleName="status-icon">
                        <img src={STATUS_ICON_TABLE[modules.get(mId).get('alarm_status')]}></img>
                      </div>
                    </div>
                  </div>
                ))
              }
              </div>
            </div>
          ))
        }
        </div>
      </div>
    )
  }
}
// //
// <div key={mIdx} styleName="module">
//                       {modules.get(mId).get('m_name')}
//                     </div>
