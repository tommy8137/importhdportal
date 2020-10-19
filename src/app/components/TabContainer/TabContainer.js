import React, { PureComponent } from 'react'
import styles from './tab-container.css'
import CSSModules from 'react-css-modules'
import { findDOMNode } from 'react-dom'
import { Motion, spring } from 'react-motion'
import { browserHistory } from 'react-router'
import withLocation from 'app/utils/with-location'

@withLocation
@CSSModules(styles)
export default class extends PureComponent {
  state = {
    currentLeft: null,
    currentPosition: null,
  }

  componentDidMount() {
    this.componentWillReceiveProps(this.props)
  }

  componentWillReceiveProps(newProps) {
    const { location } = newProps
    this.props.children.forEach((c, i) => {
      if (location.pathname.toUpperCase().indexOf(c.props.to.toUpperCase()) > -1) {
        // console.log(location.pathname.toUpperCase(), c.props.to.toUpperCase())
        this.setState({
          currentLeft: findDOMNode(this.refs[`tab-${i}`]).offsetLeft,
          currentPosition: i,
        })
      }
    })
  }

  handleTabClick = (i) => (e) => {
    this.setState({
      currentLeft: findDOMNode(this.refs[`tab-${i}`]).offsetLeft,
      currentPosition: i,
    })
    // this.setState({
    //   currentLeft: findDOMNode(this.refs[`tab-${i}`]).offsetLeft,
    //   currentPosition: i,
    // }, () => browserHistory.push(this.props.children[i].props.to || '/'))
  };

  gotoLink = () => {
    const { currentPosition } = this.state
    browserHistory.push(this.props.children[currentPosition].props.to || '/')
  };

  render() {
    const { currentLeft, currentPosition } = this.state
    return (
      <div styleName="container">
        {
          (currentLeft !== null) &&
          <Motion style={{ left: spring(currentLeft, { stiffness: 300, damping: 20, precision: 1 }) }} onRest={this.gotoLink}>
          {
            interpolator => <div style={{ left: interpolator.left }} className={styles['current-box']}></div>
          }
          </Motion>
        }
        {this.props.children && this.props.children.map((c,i) => {
          return React.cloneElement(c, { key: `tab-${i}`, ref: `tab-${i}`, onClick: this.handleTabClick(i) })
        })}
      </div>
    )
  }
}
