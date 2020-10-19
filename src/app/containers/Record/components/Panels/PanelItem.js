import React, { Component, PropTypes } from 'react'
import CSSModules from 'react-css-modules'
import styles from './panel-item.css'
import moment from 'moment'

@CSSModules(styles)
export default class PanelItem extends Component {
  static propTypes = {
    item: PropTypes.object.isRequired,
    l: PropTypes.func.isRequired,
    selected: PropTypes.bool,
  };
  static defaultProps = {
    selected: false,
  };
  state = {
    toggled: true,
  };

  toggle = () => {
    this.setState({ toggled: !this.state.toggled })
  };

  render() {
    const { key, item, l, number, selected, onClick, notesformat } = this.props
    const { toggled } = this.state
    let title = l('Note')
    return (
      <div styleName="item">
        <div styleName={selected ? 'title-handled-selected' : 'title-handled'} onClick={onClick}>
          <span>{title + ' ' + number}</span>
          <span styleName="time">{moment(parseInt(item.get('time'))).format('HH:mm')}</span>
        </div>
        {
          (notesformat !== 'dart') ? (
            <div styleName="body">
              <section styleName="section">
                <div styleName="field">{l('Symptom') + '：'}</div>
                <div styleName="field-content">{item.get('symptom')}</div>
              </section>
              <section styleName="section">
                <div styleName="field">{l('Treatment') + '：'}</div>
                <div styleName="field-content">{item.get('treatment')}</div>
              </section>
              <section styleName="section">
                <div styleName="field">{l('Record Time') + '：'}</div>
                <div styleName="field-content">{item.get('rectime')}</div>
              </section>
            </div>
          ) : (
            <div styleName="body">
              <section styleName="section">
                <div styleName="field">{item.get('Subject')}</div>
                <div styleName="field-content">{}</div>
              </section>
              <section styleName="section">
                <div styleName="field">{'Data：'}</div>
                <div styleName="field-content">{item.get('DContent')}</div>
              </section>
              <section styleName="section">
                <div styleName="field">{'Action：'}</div>
                <div styleName="field-content">{item.get('AContent')}</div>
              </section>
              <section styleName="section">
                <div styleName="field">{'Response：'}</div>
                <div styleName="field-content">{item.get('RContent')}</div>
              </section>
              <section styleName="section">
                <div styleName="field">{'Teaching：'}</div>
                <div styleName="field-content">{item.get('TContent')}</div>
              </section>
              <section styleName="section">
                <div styleName="field">{l('Record Time') + '：'}</div>
                <div styleName="field-content">{item.get('rectime')}</div>
              </section>
            </div>
          )
        }
      </div>
    )
  }
}
