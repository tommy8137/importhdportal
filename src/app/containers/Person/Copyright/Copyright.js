import React, { Component, PropTypes } from 'react'
import { findDOMNode } from 'react-dom'
import CSSModules from 'react-css-modules'
import styles from './copyright.css'
import { connect } from 'react-redux'
import Tw from './Tw'
import En from './En'
import Cn from './Cn'

@connect(
  (state) => ({ lang: state.locale.get('name') })
)
@CSSModules(styles)
export default class extends Component {
  static propTypes = {
    scrollToBottomCB: PropTypes.func,
  };
  state = {
    isBottomScrolledEver: false,
  };

  componentDidMount() {
    const scrollBody = findDOMNode(this.refs.scrollBody)
    scrollBody.addEventListener('scroll', this.handleScroll.bind(this))
  }

  componentWillUnmount() {
    const scrollBody = findDOMNode(this.refs.scrollBody)
    scrollBody.removeEventListener('scroll', this.handleScroll.bind(this))
  }

  handleScroll = (e) => {
    // const content = findDOMNode(this.refs.content)
    // const scrollBody = findDOMNode(this.refs.scrollBody)
    if (e.target.scrollTop + e.target.offsetHeight >= e.target.scrollHeight - 5 && this.state.isBottomScrolledEver !== true) {
      this.setState({ isBottomScrolledEver: true }, () => {
        (typeof this.props.scrollToBottomCB === 'function') && this.props.scrollToBottomCB()
      })
    }
  };

  render() {
    let content = null
    if (this.props.lang === 'en') {
      content = <En/>
    } else if (this.props.lang == 'zh-cn') {
      content = <Cn/>
    } else {
      content = <Tw/>
    }
    return (
      <div styleName="container">
        <div styleName="content">
          <div ref="scrollBody">
            <div ref="content">
              {content}
            </div>
          </div>
        </div>
        {this.props.children}
      </div>
    )
  }
}
