import React, { Component } from 'react'
import ErrorHandler from 'components/ErrorHandler'

export default class extends Component {
  render() {
    const title = 'Sorry! License has expired.'
    const details = 'Please contact with administrator.'
    return (
      <ErrorHandler
        status="403"
        title={title}
        details={details} />
    )
  }
}

