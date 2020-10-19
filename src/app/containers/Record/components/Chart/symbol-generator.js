import React, { Component } from 'react'
import Symbol from 'app/components/Svg/Symbol'

export default function symbolGenerator(type) {
  return class WrappedSymbol extends Component {
    constructor(props) {
      super(props)
    }

    render() {
      const { x, y, props } = this.props
      const transform = `translate(${x - 9}, ${y - 9}) scale(1.5)`
      const abnormal = this.props.selected? { fill: 'red', stroke: 'red' }: null
      return <Symbol type={type} {...props} transform={transform} {...abnormal}/>
    }
  }
}
