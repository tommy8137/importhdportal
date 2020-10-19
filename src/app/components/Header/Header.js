import React, { Component } from 'react'
import { Link, IndexLink } from 'react-router'
import styles from './header.css'
import logo from './images/BestShape_s.png'
import cx from 'classnames'
import moment from 'moment'
import CSSModules from 'react-css-modules'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { actions } from 'containers/Login'
import { switchLang } from 'actions/app-action'
import Select from 'react-select'
import { browserHistory } from 'react-router'
import { localeSelector } from 'reducers/locale-reducer'

const { logout } = actions
const NavItem = (props) => {
  const { text, to } = props
  // const pathname = props.to
  const words = text.split('\\n').map((w, i) => {
    const br = (i == 0) ? null: <br/>
    return (
      <div key={i}>
        {w}
      </div>
    )
  })
  const pathname = typeof to === 'string'? to: to.pathname
  const disabled = /null/.test(pathname)
  return (
    <Link
      className={styles[`${props.image}`]}
      activeClassName={styles['selected']}
      to={to}
      disabled={disabled}>
      <div className={styles['nav-text']}>{words}</div>
    </Link>
  )
}

@connect(
  (state, ownProps) => ({
    username: state.auth.get('displayName'),
    currentTime: state.app.get('currentTime')? moment(state.app.get('currentTime')).format('YYYY-MM-DD HH:mm a'): '--:--',
    isAdmin: state.auth.get('scope')? state.auth.get('scope').includes('admin'): false,
    l: localeSelector(state),
    lang: state.locale.get('name'),
    patientId: state.patient.get('patient_id'),
    recordId: state.patient.get('record').get('record_id'),
  }),
  dispatch => ({ actions: bindActionCreators({ logout, switchLang }, dispatch) })
)
@CSSModules(styles)
export default class extends Component {
  static propTypes = {
    pathname: React.PropTypes.string.isRequired, // very weird behavior, i need to pass this information from Home, o.w. it will be fucked up
  };

  componentDidMount() {

  }
  componentWillUnmount() {

  }

  handleScroll(e) {

  }

  handleClickNav = (i, e) => {

  };

  handleLangSwitch = (changed) => {
    const { actions: { switchLang } } = this.props
    switchLang(changed.value)
  };

  gotoProfile = () => {
    browserHistory.push('/profile')
  };

  gotoAdmin = () => {
    browserHistory.push('/admin/settings')
  };

  renderNavBar = () => {
    const { l, patientId, recordId, isAdmin } = this.props

    return (
      <div styleName="nav-bar">
        {/*<IndexLink
          className={styles.patient}
          activeClassName={styles.selected}
          to={'/'}>
          <div styleName="nav-text">病患總覽</div>
        </IndexLink>*/}
        <NavItem text={l('Patients Overview')} image="patient" to="/overview" />
        <NavItem text={l('Dashboard')} image="dashboard" to={`/patient/${patientId}/dashboard/${recordId}`} />
        <NavItem text={l('Dialyze Records')} image="report" to={{ pathname: `/patient/${patientId}/record/${recordId}` }} />
        <NavItem text={l('Lab Data')} image="check" to={`/patient/${patientId}/examination/${recordId}`} />
        <NavItem text={l('Risk Analysis')} image="risk" to={`/patient/${patientId}/risk/${recordId}?c_id=1&m_id=2`} />
        {isAdmin && <NavItem text={l('Report')} image="effective" to="/effective" />}
      </div>
    )
  };

  renderRightSection = () => {
    const { currentTime, isAdmin, l, lang, actions: { switchLang } } = this.props
    return (
      <div styleName="right-section">
        <div styleName="info">
          <span>{l('Hi')}, {this.props.username}&nbsp;&nbsp;{currentTime}</span>
        </div>
        <div styleName="widgets-bar">
          <Select
            clearable={false}
            searchable={false}
            placeholder=""
            styleName="locale"
            options={[{ label: l('zh-tw'), value: 'zh-tw' }, { label: l('zh-cn'), value: 'zh-cn' }, { label: l('en'), value: 'en' }]}
            value={lang}
            onChange={this.handleLangSwitch}
            />
          {isAdmin && <img styleName="admin-setting" onClick={this.gotoAdmin}/>}
          <img styleName="personal" onClick={this.gotoProfile}/>
          <img styleName="logout" onClick={this.props.actions.logout}/>
        </div>
      </div>
    )
  };

  render() {
    // console.log(this.props.records, this.props.recordId)
    return (
      <div styleName="header-container">
        <div styleName="header">
          <img styleName="logo" src={logo}/>
          {this.renderNavBar()}
          {this.renderRightSection()}
        </div>
      </div>
    )
  }
}
