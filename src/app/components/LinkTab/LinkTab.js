import React, { Component, PropTypes } from 'react'
import styles from './link-tab.css'
import CSSModules from 'react-css-modules'
import PureRenderMixin from 'react-addons-pure-render-mixin'

@CSSModules(styles)
export default class extends Component {
  static propTypes = {
    to: PropTypes.string.isRequired,
    onClick: PropTypes.func,
  };

  constructor(props) {
    super(props)
    this.shouldComponentUpdate = PureRenderMixin.shouldComponentUpdate.bind(this)
  }

  handleClick = (e) => {
    if (typeof this.props.onClick === 'function') {
      this.props.onClick(e)
    }
  };

  render() {
    return (
      <div styleName="tab">
        <div styleName="inner">
          <div styleName="tab-background"/>
          <div styleName="tab-foreground" onClick={this.handleClick}>{this.props.children}</div>
        </div>
        {/*<div styleName="tab-background" onClick={this.handleClick}>
        </div>
        <div styleName="tab-foreground">{this.props.children}</div>*/}
      </div>
    )
  }
}
