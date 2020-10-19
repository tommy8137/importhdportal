import React, { Component, PropTypes } from 'react'


export function passLocation(WrappedComponent) {
  return class extends Component {
    static childContextTypes = {
      location: React.PropTypes.object
    };

    getChildContext() {
      return { location: this.props.location }
    }

    render() {
      return <WrappedComponent {...this.props}/>
    }
  }
}

export default function withLocation(WrappedComponent) {
  return class extends Component {
    static contextTypes = {
      location: PropTypes.object,
    };

    render() {
      return <WrappedComponent {...this.props} location={this.context.location} pathname={this.context.location.pathname}/>
    }
  }
}
