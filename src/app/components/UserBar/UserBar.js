import React, { Component } from 'react'
import CSSModules from 'react-css-modules'
import DatePicker from 'components/DatePicker'
import styles from './user-bar.css'
import moment from 'moment'
import { connect } from 'react-redux'
import PureRenderMixin from 'react-addons-pure-render-mixin'
import selector from './selector'
import { selectRecord } from 'actions/patient-action'
import { bindActionCreators } from 'redux'
import { browserHistory } from 'react-router'
import withLocation from 'app/utils/with-location'

const detectPageNeedQuery = (prefixUrl) => {
  if (/examination/i.test(prefixUrl)) {
    return false
  }
  return true
}

@connect(
  selector,
  (dispatch) => ({
    actions: bindActionCreators({ selectRecord }, dispatch),
  })
)
@withLocation
@CSSModules(styles)
export default class UserBar extends Component {
  constructor(props) {
    super(props)
    this.shouldComponentUpdate = PureRenderMixin.shouldComponentUpdate.bind(this)
  }

  selectRecord = (selectedRecord) => {
    const { location: { pathname, query } } = this.props
    const rule = /(\/.*)(\/).*/
    const prefix = rule.exec(pathname)[1]
    const { actions: { selectRecord } } = this.props
    selectRecord(selectedRecord, { pathname: `${prefix}/${selectedRecord}`, query: detectPageNeedQuery(prefix)? query: null })
  }

	render() {
    const { l, id, name, age, bedNo, diseases, records, currentRecord } = this.props
    const { actions: { selectRecord } } = this.props
		return (
			<div styleName="user-bar">
				<div styleName="user-info-container">
					<div styleName="user-info">
						<div>
							{l('Name')}:&nbsp;{name}  {l('Age')}:&nbsp;{age}  {l('Record No')}:&nbsp;{id}  {l('Bed No.')}:&nbsp;{bedNo}  {l('Chronic Disease:')}&nbsp;{diseases}
						</div>
					</div>
				</div>
        <DatePicker records={records} currentRecord={currentRecord} clickTimeCallback={this.selectRecord}/>
			</div>
		)
	}
}
