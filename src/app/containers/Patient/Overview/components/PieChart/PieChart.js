import React, { Component, PropTypes } from 'react'
import { pie as d3Pie, arc as d3Arc } from 'd3-shape'
import { scaleOrdinal } from 'd3-scale'
import { TransitionMotion, Motion, spring } from 'react-motion'
import {
  CategoryLeaderLine,
  CategoryArea,
  CategoryCounts,
  CategoryNames,
  CenterCircle,
} from './widgets'

export default class MotionPieChart extends Component {
  static propTypes = {
    data: PropTypes.array,
    clickCallback: PropTypes.func,
    width: PropTypes.number,
    height: PropTypes.number,
    outerRadius: PropTypes.number,
    ringWidth: PropTypes.number,
    middleCirclePadding: PropTypes.number,
    borderWidth: PropTypes.number,
    abnormalTypeAndColors: PropTypes.object,
    BPTypeAndColors: PropTypes.object,
    selectedClass: PropTypes.string,
    endAngle: PropTypes.number,
    pieChartText: PropTypes.string,
  }

  willEnter = () => ({ endAngle: -90 })

  willLeave = () => ({ endAngle: spring(-90, { stiffness: 150, damping: 20, precision: 0.1 }) })

  render() {
    const { shift, abnormalTypeAndColors, data, clickCallback, BPTypeAndColors, selectedClass, pieChartText, ...rest } = this.props
    return (
      <TransitionMotion
        styles={
          [{
            key: `pie-${shift}`,
            style: {
              endAngle: 270,
            }
          }]
        }
        willEnter={this.willEnter}
        willLeave={this.willLeave} >
          {
            (items) => {
              if (items.length) {
                const { key, style } = items[0]
                return (
                  <PieChart
                    key={key}
                    endAngle={style.endAngle}
                    abnormalTypeAndColors={abnormalTypeAndColors}
                    BPTypeAndColors={BPTypeAndColors}
                    selectedClass={selectedClass}
                    rest={rest}
                    data={data}
                    pieChartText={pieChartText}
                    clickCallback={clickCallback} />
                )
              }
              return null
          }}
      </TransitionMotion>
    )
  }
}

class PieChart extends Component {
  static propTypes = {
    // dataset
    data: PropTypes.array,
    clickCallback: PropTypes.func,
    endAngle: PropTypes.number,
    abnormalTypeAndColors: PropTypes.object,
    BPTypeAndColors: PropTypes.object,
    selectedClass: PropTypes.string,
    pieChartText: PropTypes.string,
    // size config
    rest: PropTypes.object,
  }

  static defaultProps = {
    data: [],
  }

  //---------------------------------------------------------------------------
  // click handler click circle one part or center all
  //---------------------------------------------------------------------------
  abnormalSelect = (selected) => {
    this.props.clickCallback(selected)
  }

  //---------------------------------------------------------------------------
  // if data not valid, grey the centeral circle
  //---------------------------------------------------------------------------
  isAtLeastOneDataValid = (data) => {
    // if all of the c_name is invalid, show 'all' but fill grey color
    return data.reduce(
      (previousValue, currentValue) => (previousValue || currentValue),
      false
    )
  }


  //---------------------------------------------------------------------------
  // transfrom degree to rad
  //---------------------------------------------------------------------------
  degree = (x) => (x * Math.PI / 180)

  //---------------------------------------------------------------------------
  render() {
    const {
      rest: {
        width,
        height,
        borderWidth,
        outerRadius,
        ringWidth,
        middleCirclePadding,
        middleCircleText,
      },
      endAngle,
      data,
      abnormalTypeAndColors,
      selectedClass,
      BPTypeAndColors,
      pieChartText,
    } = this.props
    //---------------------------------------------------------------------------
    // init before each render
    //---------------------------------------------------------------------------
    // large than 100 degree, show text and line
    const displayText = (endAngle > 100)
    const atLeastOneDataValid = this.isAtLeastOneDataValid(data)
    const color = scaleOrdinal()
      .domain(abnormalTypeAndColors.types)
      .range(abnormalTypeAndColors.colors)
    const bpColor = scaleOrdinal()
      .domain(BPTypeAndColors.types)
      .range(BPTypeAndColors.colors)
    const innerRadius = outerRadius - ringWidth
    const middleCircleRadius = ringWidth - middleCirclePadding

    return (
      <svg width={width} height={height} >
        <Motion
          defaultStyle={{ endAngle: -90 }}
          style={{ endAngle: spring(endAngle) }} >
          {
            (value) => {
              const pie = d3Pie()
                .sort(null)
                .value((d) => (d.number))
                .startAngle(this.degree(-90))
                .endAngle(this.degree(value.endAngle))
              const arc = d3Arc()
                .innerRadius(innerRadius)
                .outerRadius(outerRadius)
              let pieData = pie(data)
              return (
                <g transform={`translate(${width / 2}, ${height / 2})`}>
                  {
                    pieData.filter((item) => item.data.number > 0).map(
                      (pie, idx) => (
                        <g
                          key={`pie-partition-${idx}`}
                          onClick={this.abnormalSelect.bind(this, pie.data[pieChartText])}>
                          {
                            (displayText) &&
                            <CategoryLeaderLine
                              pie={pie}
                              arc={arc}
                              strokeWidth={borderWidth}
                              outerRadius={outerRadius} />
                          }
                          <CategoryArea
                            d={arc(pie)}
                            strokeWidth={borderWidth}
                            fill={pie.data[pieChartText] == selectedClass ? bpColor('selected') : bpColor('normal') } />
                          {
                            (displayText) &&
                            <CategoryNames
                              pie={pie}
                              arc={arc}
                              title={pie.data.c_text}
                              color={{ selected: bpColor('selected'), normal : bpColor('normal') }}
                              select={pie.data[pieChartText] == selectedClass ?
                                { color: bpColor('selected'), type: 'selected' } :
                                { color: bpColor('normal'), type: 'normal' }}
                              outerRadius={outerRadius} />
                          }
                          {
                            (displayText) &&
                            <CategoryCounts
                              transform={`translate(${arc.centroid(pie)})`}
                              count={pie.data.number} />
                          }
                        </g>
                      )
                    )
                  }
                  <CenterCircle
                    r={middleCircleRadius}
                    middleCircleText={middleCircleText}
                    fill={atLeastOneDataValid ? (selectedClass == 'all' ? bpColor('selected') : bpColor('normal')) : '#AAA'}
                    strokeWidth={borderWidth}
                    onClick={this.abnormalSelect.bind(this, 'all')} />
                </g>
              )
            }
          }
        </Motion>
      </svg>
    )
  }
}
