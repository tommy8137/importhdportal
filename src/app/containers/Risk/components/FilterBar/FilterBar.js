import React, { Component, PropTypes } from 'react'
import CSSModules from 'react-css-modules'
import TYPES from 'constants/action-types'
import styles from './filter-bar.css'
import Select from 'react-select'
import { browserHistory } from 'react-router'

@CSSModules(styles)
export default class FilterBar extends Component {
  selectCategory = (selected) => {
    const { pathname, query } = this.props
    const { value } = selected
    if (value == query.c_id) {
      return
    }
    browserHistory.push({
      pathname,
      query: {
        c_id: value,
      }
    })
  };

  selectModule = (selected) => {
    const { pathname, query, cId } = this.props
    const { value } = selected
    browserHistory.push({
      pathname,
      query: {
        c_id: cId,
        m_id: value,
      }
    })
  };

  render() {
    const { categories, modules, query, pathname, l, cId, mId } =  this.props

    return (
      <div styleName="filter-bar">
        <Select
          clearable={false}
          searchable={false}
          placeholder={l('Please Select')}
          styleName="dropdown"
          options={categories}
          value={cId}
          defaultValue={'1'}
          onChange={this.selectCategory}/>
        <Select
          disabled={!modules || modules.length <= 0}
          clearable={false}
          searchable={false}
          placeholder={l('Please Select')}
          styleName="dropdown"
          options={this.props.modules}
          value={mId}
          defaultValue={'2'}
          onChange={this.selectModule}/>
      </div>
    )
  }
}
