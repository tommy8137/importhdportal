import React, { Component } from 'react'
import PanZoom from 'components/PanZoom'

const getNestedValue = (obj, key) => key.split(".").reduce((result, key) => {
  if (!result) {
    return null
  }
  return result[key]
}, obj)

export default (config = {}) => (WrappedComponent) => {
  const {
    step = 50,
    max = 500,
    left = 10,
    right = 10,
    // width = 500,
    selectTime = 'selectTime',
    distinctTimes = 'distinctTimes',
  } = config

  return class extends Component {
    render() {
      const { startTime, endTime, selectedTime } = this.props
      const selectTimeFunc = getNestedValue(this.props, selectTime)
      const distinctTimesValues = getNestedValue(this.props, distinctTimes)
      const width = this.props.width || config.width || 500

      return (
        <PanZoom
          startTime={startTime}
          endTime={endTime}
          centralTime={selectedTime || endTime}
          left={left}
          right={width - right}
          step={step}
          max={max}
          selectTime={selectTimeFunc}
          distinctTimes={distinctTimesValues}>
        {({ triggerPan, handleWheel, xScale }) =>
          <WrappedComponent
            {...this.props}
            triggerPan={triggerPan}
            handleWheel={handleWheel}
            xScale={xScale}/>
        }
        </PanZoom>
      )
      // return <WrappedComponent {...this.props}/>
    }
  }
}
