import React, { Component, PropTypes } from 'react'
import CSSModules from 'react-css-modules'
import styles from './panels.css'
import Content from './Content'

@CSSModules(styles)
export default class Panels extends Component {
  static propTypes = {
    l: PropTypes.func,
    selectPanelItem: PropTypes.func,
  };

  componentWillMount() {
    this.componentWillReceiveProps(this.props)
  }

  componentWillReceiveProps(nextProps) {
    const { piId } = this.state
    if (nextProps.piId && nextProps.piId != piId) {
      const { intra, pre, post } = this.props
      let selected =
        pre.filter(item => item.get('pi_id') == nextProps.piId).first()
        ? 'pre'
        : post.filter(item => item.get('pi_id') == nextProps.piId).first()
        ? 'post'
        : intra.filter(item => item.get('pi_id') == nextProps.piId).first()
        ? 'intra'
        : this.state.selected
      this.setState({
        piId: nextProps.piId,
        selected,
      })
    }
  }

  state = {
    piId: null,
    selected: 'intra',
    panelClicked: false,
  };

  switchPanel = (switchTo) => {
    this.setState({ selected: switchTo, panelClicked: true })
  };

  render() {
    const { l, intra, pre, post, piId, selectPanelItem, notesformat } = this.props
    const { selected, panelClicked } = this.state
    return (
      <div styleName="container">
        <div styleName="panels-switchor">
          <button styleName={selected == 'intra' ? 'button-selected': 'button'} onClick={this.switchPanel.bind(this, 'intra')}>{l('Intra Record')}</button>
          {/* <button styleName={selected == 'pre'? 'button-selected': 'button'} onClick={this.switchPanel.bind(this, 'pre')}>{l('Pre')}</button>*/}
          {/* <button styleName={selected == 'post'? 'button-selected': 'button'} onClick={this.switchPanel.bind(this, 'post')}>{l('Post')}</button>*/}
        </div>
        <Content
          l={l}
          current={selected}
          piId={piId}
          intra={intra}
          pre={pre}
          post={post}
          notesformat={notesformat}
          selectPanelItem={selectPanelItem} />
      </div>
    )
  }
}
