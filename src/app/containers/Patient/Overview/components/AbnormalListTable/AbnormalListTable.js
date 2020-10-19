import React, { Component, PropTypes } from 'react'
import reduxTable from 'app/libs/redux-table'
import CSSModules from 'react-css-modules'
import styles from './abnormal-list-table.css'
import Triangle from 'components/Triangle'
import { createSelector } from 'reselect'
import { fromJS } from 'immutable'
import NotYetProcess from './images/notyet.png'
import Handled from './images/handled.png'
import Observe from './images/observe.png'

export const STATUS_ICON_TABLE = {
  '0': NotYetProcess,
  '1': Observe,
  '2': Handled,
}

const selector = createSelector(
  (state) => state.overview.overview.get('abnormalList'),
  (data) => {
    const configData = []
    data.forEach((item) => {
      let categoryString = ''
      let itembpClass = ''
      if (item.get('category') && item.get('category').size > 0) {
        item.get('category').forEach(
          (category, idx) => {
            (categoryString += (`${category.get('c_name')}`))
            if (idx + 1 !== item.get('category').size) {
              categoryString += ', '
            }
            itembpClass = category.get('type')
          }
        )
      }
      configData.push({
        id: item.get('patientId'),
        name: item.get('name'),
        bedNo: item.get('bedNo'),
        gender: item.get('gender'),
        age: item.get('age'),
        category: categoryString,
        recordId: item.get('recordId'),
        bp_class: itembpClass,
        alarmStatus: item.get('alarmStatus'),
      })
    })
    return configData
  }
)

@reduxTable({
  table: 'AbnormalListTable',
  dataFrom: {
    selector,
  },
})
@CSSModules(styles)
export default class AbnormalListTable extends Component {
  static statics = {
    selected: ['name', 'bedNo', 'gender', 'age', 'category', 'alarmStatusIcon'],
  }

  static propTypes = {
    actions: PropTypes.object,
    // callback
    abnormalListClick: PropTypes.func,
    // reduxTable
    data: PropTypes.object,
    orderBy: PropTypes.object,
    columns: PropTypes.object,
    // locale
    l: PropTypes.func,
    // bp_class: PropTypes.string,
  }

  selectPatient = (user) => () => {
    this.props.abnormalListClick({ id: user.get('id'), recordId: user.get('recordId') })
  }

  orderBy = (col) => () => {
    this.props.actions.orderBy({ column: col })
  }

  render() {
    const { selected } = AbnormalListTable.statics
    const { l, orderBy, data, selectedBPClass } = this.props
    let orderByColumns = null
    let orderByDirecion = null
    if (orderBy) {
      if (orderBy.get('direction')) {
        orderByDirecion = orderBy.get('direction')
      }
      if (orderBy.get('column')) {
        orderByColumns = orderBy.get('column')
      }
    }

    const dataWithIcon = data.map((v) => {
      return v.set(
        'alarmStatusIcon',
        <img src={STATUS_ICON_TABLE[v.get('alarmStatus')]} />
      )
    })

    const titles = [l('Name'), l('Bed No.'), l('Gender'), l('Age'), l('Risk Category'), l('Process Status')]
    return (
      <div styleName="table-wrapper">
        <div styleName="table-head">
          <div>{l('Abnormal Case List')}</div>
        </div>
        <div styleName="table-sub-head">
          <div styleName="table-cell"></div>
          {
            titles.map(
              (title, idx) => (
                <div key={`abtitle-${idx}`}
                  styleName="table-cell" onClick={this.orderBy(selected[idx])} >
                  <span styleName="table-title-text">{title}</span>
                  <Triangle direction={orderByDirecion}
                    isUpdate={selected[idx] === orderByColumns}
                    isFocus={selected[idx] === orderByColumns}/>
                </div>
              )
            )
          }
        </div>
        <div styleName="table-body">
        {
          dataWithIcon.filter((item) => item.get('bp_class') == selectedBPClass || selectedBPClass == 'all' ).map((row, idx) => (
            <div key={`abrow-${idx}`} styleName="table-body-row" onClick={this.selectPatient(row)}>
              <div key={`abcol-id-${idx}`} styleName="table-cell">
                {idx + 1}
              </div>
              {
                selected.map((col, idx) => (
                   <div key={`abcol-${col}-${idx}`} styleName="table-cell">
                    {row.get(col)}
                  </div>
                ))
              }
            </div>
          ))
        }
        </div>
      </div>
    )
  }
}
