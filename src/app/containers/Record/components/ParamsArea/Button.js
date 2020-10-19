import React, { Component, PropTypes } from 'react'
import CSSModules from 'react-css-modules'
import styles from './params-area.css'
import Icon from 'components/Svg/Symbol'

@CSSModules(styles)
export default class Button extends Component {
  static propTypes = {
    l: PropTypes.func,
    name: PropTypes.string,
    type: PropTypes.number,
    toggled: PropTypes.bool,
    unit: PropTypes.string,
    callback: PropTypes.func,
  };

  static defaultProps = {
    value: '--',
    toggled: true,
  };

  componentWillMount() {

  }

  handleClick = (e) => {

  };

  render() {
    const { l, type, name, unit, value, toggled, callback } = this.props
    const btnClass = toggled? `button-${type}`: 'button-inactive'
    const iconInactive = toggled? null: { stroke: 'gray', fill: 'gray' }

    return (
      <button styleName={btnClass} onClick={callback}>
        <svg styleName="icon" width={12} height={12}>
          <Icon type={type} {...iconInactive}/>
        </svg>
        <div styleName="type-block">
          <span>{l(name)}</span>
          <span>{unit}</span>
        </div>
        <span styleName="value">{value}</span>
      </button>
    )
  }
}
