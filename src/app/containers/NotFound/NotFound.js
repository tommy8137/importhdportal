import React, { Component } from 'react'
import ErrorHandler from 'components/ErrorHandler'

export default class extends Component {
  render() {
    const details = `Looks like the page you're trying to visit doesn't exist,
          Please check the URL and try your luck again.`
    const title = 'Sorry! The page you were looking for could not be found.'
    return (
      <ErrorHandler
        status="404"
        title={title}
        details={details} />
    )
  }
}

