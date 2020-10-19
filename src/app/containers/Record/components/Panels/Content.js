import React, { Component, PropTypes } from 'react'
import CSSModules from 'react-css-modules'
import styles from './panels.css'
import PanelItem from './PanelItem'

@CSSModules(styles)
export default class Content extends Component {
  static propTypes = {
    selectPanelItem: PropTypes.func,
  }
  static defaultProps = {
    current: 'intra',
  }

  renderPanel = (panel) => {
    const { l, piId, selectPanelItem, notesformat } = this.props
    return panel.filter(pi => pi.get('status') == 2).map((item, idx) =>
      <PanelItem
        notesformat={notesformat}
        key={item.get('pi_id')}
        item={item} l={l}
        number={item.get('number') }
        selected={piId == item.get('pi_id')}
        onClick={selectPanelItem.bind(null, item.get('pi_id'))} />)
  }

  render() {
    const { current, intra, pre, post } = this.props
    return (
      <div styleName="content">
        <div styleName={`go-to-${current}`}>
          <div styleName="panel-intra">
            {this.renderPanel(intra)}
          </div>
          <div styleName="panel-pre">
            {this.renderPanel(pre)}
          </div>
          <div styleName="panel-post">
            {this.renderPanel(post)}
          </div>
        </div>
      </div>
    )
  }
}
