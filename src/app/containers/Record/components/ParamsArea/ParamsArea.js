import React, { Component, PropTypes } from 'react'
import CSSModules from 'react-css-modules'
import styles from './params-area.css'
import Button from './Button'

@CSSModules(styles)
export default class ParamsArea extends Component {
  static propTypes = {
    l: PropTypes.func.isRequired,
    params: PropTypes.object,
    toggleParam: PropTypes.func,
    selectedTime: PropTypes.number,
    timesOfDialyze: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  };

  render() {
    const { l, params, toggleParam, selectedTime, timesOfDialyze } = this.props
    return (
      <div styleName="container">
        <div styleName="row-title">
          <span styleName="record-title">{l('Dialyze Records').replace('\\n', ' ')}</span>
          <span>{l('%s Dialysis in This Month').replace('%s', ` ${timesOfDialyze} `)}</span>
        </div>
        <div styleName="row-buttons">
        {
          params.map((param, idx) => (
            <Button
              key={idx}
              type={idx}
              l={l}
              name={param.get('name')}
              value={selectedTime && param.get('data').find(d => d.get('time') == selectedTime)
                ? param.get('data').find(d => d.get('time') == selectedTime).get('value')
                : '--'}
              unit={param.get('unit')}
              toggled={param.get('toggled')}
              callback={toggleParam.bind(null, param.get('ri_id'), null)}/>
          ))
        }
        </div>
        <div styleName="row-horizontal-center">
          <button styleName="button-clear" onClick={toggleParam.bind(null, 'all', false)}>{l('Clear All')}</button>
        </div>
      </div>
    )
  }
}
