import React, { Component } from 'react'
import ReactCSSTransitionGroup  from 'react-addons-css-transition-group'
// import styles_default from './MMH.css'
// import styles_ECK from './ECK.css'
import Select from 'react-select'
import CSSModules from 'react-css-modules'
import { connect } from 'react-redux'
import Modal from 'react-modal'
import { closeModal } from 'actions/app-action'
import modalStyles from './modal.css'
import { localeSelector } from 'reducers/locale-reducer'
import Button from 'components/Buttons/ButtonDefault'
import {Motion, spring, StaggeredMotion} from 'react-motion'
import AlarmPhraseModal from 'containers/Risk/Modules/Sbp/Range/components/AlarmPhraseModal'
let styles = null;
if (backgroundPic === 'ECK'){
  styles = require('./ECK.css');
}else {
  styles = require('./MMH.css');
}
@connect(
  state => ({
    isBusy: state.app.get('isBusy'),
    modal: state.app.get('modal'),
    l: localeSelector(state),
  })
)
@CSSModules(styles)
export default class Root extends Component {
  componentDidMount() {
    //preload popup Images first
    const images = [require('./images/icon_alert.png'), require('./images/icon_info.png'), require('./images/icon_warnning.png')]
    images.forEach(img => {
      const element = new Image()
      element.src = img
    })
  }

  closeModal = (e) => {
    this.props.dispatch(closeModal())
  }

  renderNotificationModal() {
    const { modal, l } = this.props
    let {
      ['modal-class']: modalClass,
      ['modal-content']: contentClass,
      ['modal-container']: modalContainer,
      ['overlay-class']: overlayClass,
      ['modal-title']: modalTitle,
      ['icon-close']: iconClose,
      ['button-confirm']: btnClass,
    } = modalStyles
    iconClose += ' remove icon large'

    let iconClass
    switch(modal.get('modalType')) {
      case 'alert':
        iconClass = modalStyles['icon-alert']
        break
      case 'warning':
        iconClass = modalStyles['icon-warning']
        break
      default:
        iconClass = modalStyles['icon-info']
        break
    }

    return (
      <Modal
        isOpen={modal.get('visible')}
        className={modalClass}
        overlayClassName={overlayClass}
        onRequestClose={this.closeModal}
        closeTimeoutMS={300}
        contentLabel="Modal">
        <div className={iconClass}/>
        <div className={contentClass}>{modal.get('content')}</div>
        <Button className={btnClass} onClick={this.closeModal}>{l('Confirm')}</Button>
      </Modal>
    )
  }

  renderModal() {
    const { modal, l } = this.props
    let modalContent = null
    if (modal.get('visible')) {
      const modalType = modal.get('modalType')
      switch(modalType) {
        case 'alert':
        case 'warning':
        case 'info':
          modalContent = this.renderNotificationModal()
          break
        case 'alarmPharse':
          modalContent = <AlarmPhraseModal modal={modal} l={l} closeModal={this.closeModal} />
          break
        default:
          modalContent = null
      }
    }
    return modalContent
  }

  render() {
    return (
      <div styleName={this.props.isBusy? "root-loading" : "root"}>
        <ReactCSSTransitionGroup
          transitionAppear={false}
          transitionName={styles}
          transitionEnterTimeout={300}
          transitionLeaveTimeout={300}>
          <div
            styleName="container"
            key={this.props.children.type.displayName || this.props.children.type.name}>
            {this.props.children}
          </div>
        </ReactCSSTransitionGroup>
        {this.props.isBusy && <div styleName="loader"><i className="huge spinner loading icon"></i><ProgressValue /></div>}
        {this.renderModal()}
      </div>
    )
  }
}

@CSSModules(styles)
class ProgressValue extends Component {
  render () {
    const randomEndValue = 90 + Date.now() % 5 + Math.random() * 5
    return (
      <div styleName="count">
        <Motion defaultStyle={{ x: 0 }} style={{ x: spring(randomEndValue, { stiffness: 3, damping: 4, precision: 0.01 } ) }}>
          {
            value =>
            <div>
              <div>{`${(value.x).toFixed(2)}%`}</div>
            </div>
          }
        </Motion>
      </div>
    )
  }
}
