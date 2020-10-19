import React, { Component } from 'react'
import { connect } from 'react-redux'
import { selector, mapDispatchToProps } from './selector'
import { List, fromJS } from 'immutable'

export default (config) => (ChildComponent) => {
  let tableName = 'default'
  if (config) {
    if (config && config.table) {
      tableName = config.table
    } else {
      throw new Error('ReduxTable need a specific table name')
    }
  }

  //-------------------------------------------------------------------------
  // HOC
  //-------------------------------------------------------------------------
  @connect(
    selector(tableName, config),
    mapDispatchToProps(tableName),
  )
  class ReduxTable extends Component {
    componentWillMount () {
      const { selector, ...restDataFrom } = config.dataFrom
      const { createTable, updateTable, configData, data } = this.props
      if (!this.props.tableName) {
        const newDataFrom = Object.assign({}, restDataFrom)
        if (!List.isList(data) || data.size === 0) {
          newDataFrom.initData = configData
        }
        createTable(tableName, newDataFrom)
      } else {
        updateTable(tableName, configData)
      }
    }

    componentWillReceiveProps (nextProps) {
      const { updateTable } = this.props
      const isEqual = (nextProps.configData == this.props.configData)
      if (!isEqual) {
        updateTable(tableName, fromJS(nextProps.configData))
      }
      return true
    }

    render() {
      const { createTable, updateTable, configData, ...restProps } = this.props
      return (
        <ChildComponent {...restProps} />
      )
    }
  }
  return ReduxTable
}
