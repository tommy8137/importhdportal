import React, { Component, PropTypes } from 'react'
import CSSModules from 'react-css-modules'
import styles from './module-switcher.css'
import chartBg from './chart-bg.png'

@CSSModules(styles)
export default class ModuleSwitcher extends Component {
  static propTypes = {
    cId: PropTypes.string,
    mId: PropTypes.string,
  }

  render() {
    const { cId, mId, ModuleContainer } = this.props

    return (
      <div styleName="content">
        {ModuleContainer? <ModuleContainer cId={cId} mId={mId} />: <img styleName="background-image" style={{ paddingBottom: '1rem' }} src={chartBg}/>}
      </div>
    )
  }
}
