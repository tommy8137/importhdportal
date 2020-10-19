import React, { Component, PropTypes } from 'react'
import CSSModules from 'react-css-modules'
import styles from './checkbox.css'

@CSSModules(styles)
export default class Checkbox extends Component {
  static _counter = 0;
  static propTypes = {
    id: PropTypes.string,
  };

  render() {
    const id = this.props.id? this.props.id: `Checkbox-${Checkbox._counter++}`
    return (
      <div>
        <input styleName="checkbox" type="checkbox" id={id} {...this.props}/>
        <label styleName="label" htmlFor={id}>{this.props.label}</label>
      </div>
    );
  }
}
