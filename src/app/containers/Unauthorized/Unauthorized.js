import React, { Component } from 'react'
import ErrorHandler from 'components/ErrorHandler'

export default class extends Component {
  render() {
    const title = 'Sorry! Access is denied due to invalid token.'
    const details = 'Please redirection entry for requesting resources.'
    return (
      <ErrorHandler
        status="401"
        title={title}
        details={details} />
    )
  }
}

