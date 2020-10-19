import React, { Component, PropTypes } from 'react'
import styles from './items-block.css'
import CSSModules from 'react-css-modules'
import { CircleSymbol } from '../widgets'
import { Link } from 'react-router'

const Item = CSSModules(styles)(({ level, children, type, patientId, rId, item, ...props }) => {
  if (!type) {
    return (
      <div styleName={level == 'orange' ? 'item-orange': 'item'} {...props}>
        <CircleSymbol level={level} size="1.2rem"/>
        <span styleName={level}>{children}</span>
      </div>
    )
  }
  let idField = (type == 'record')? 'pi_id': 'ti_id'
  let id = (type == 'record')? item.get('pi_id'): item.get('ti_id')
  let to = { pathname: `/patient/${patientId}/${type}/${rId}`, query: { [idField]: id } }
  return (
    <Link to={to}>
      <div styleName={level == 'orange' ? 'item-orange': 'item'} {...props}>
        <CircleSymbol level={level} size="1.2rem"/>
        <span styleName={level}>{children}</span>
      </div>
    </Link>
  )
})

const getItemWords = (item) => {
  let description = item.get('symptom')
  // if (item.get('treatment')) {
  //   description += '：' + item.get('treatment')
  // }
  return description
}

@CSSModules(styles)
export default class ItemsBlock extends Component {
  static propTypes = {
    label: PropTypes.string,
    level: PropTypes.string,
    items: PropTypes.object.isRequired, // immutable array
    canToggle: PropTypes.bool,
    userClick: PropTypes.func,
    getItemWords: PropTypes.func,
    type: PropTypes.string,
    patientId: PropTypes.string,
    rId: PropTypes.string,
    l: PropTypes.func,
  }

  static defaultProps = {
    level: 'red',
    canToggle: false,
    getItemWords,
  }

  state = {
    expanded: false,
  }

  handleToggle = (e) => {
    this.setState({
      expanded: !this.state.expanded
    })
  }

  render() {
    const { label, level, items, canToggle, userClick, getItemWords, type, patientId, rId, l } = this.props
    const { expanded } = this.state
    const firstItem = items.size > 0
    ? <Item level={level} type={type} patientId={patientId} rId={rId} item={items.first()}>
        {getItemWords(items.get(0))}
      </Item>
    : <Item level="gray">{l('N/A')}</Item>

    return (
      <div styleName="list-block">
        <div styleName="row">
          <CircleSymbol level={level} size="4rem" count={items.size} style={{ fontWeight: 'bolder' }}/>
          <span styleName="label">{label}</span>
        </div>
        {firstItem}
        <div styleName="toggle-list" style={{ maxHeight: expanded? `${(items.size - 1) * 3.5}rem`: '0px' }}>
        {items.filter((item, idx) => idx > 0).map((item, idx) => (
          <Item key={idx} level={level} type={type} patientId={patientId} rId={rId} item={item}>
            {getItemWords(item)}
          </Item>
        ))}
        </div>
        {canToggle && items.size > 1 &&
          <div styleName="toggle">
            <button styleName="toggle-button" onClick={this.handleToggle}>
              {!expanded
              ? <i styleName="toggle-icon" className="large caret down icon"></i>
              : <i styleName="toggle-icon" className="large caret up icon"></i>
              }
              <span>{expanded? l('Less'): l('More')}</span>
            </button>
          </div>
        }
      </div>
    )
  }
}
