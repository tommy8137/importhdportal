  import i18n from 'server/utils/i18n'

const locale = (lang, key) => {
   return  i18n(lang).get('locale').get(key)
}
const { reportPngPath } = global.config

export default function (paramet) {
  const {
    reportDate,
    startDate,
    endDate,
    // table
    SBPDrop: [dia_count_data, sbp_count_data, sbp_rate_data],
    // line chart
    ProcessRate,
    // bar chart
    AlarmThreat: [currentPercent, previousPercent],
    lang,
    maxblood_upper_tuning_value,
    maxblood_upper_tuning_unit,
    maxblood_middle_tuning_value,
    maxblood_middle_tuning_unit,
    maxblood_lower_tuning_value,
    maxblood_lower_tuning_unit,
    maxblood_upper,
    maxblood_lower,
    conductivity_threshold,
    dialysate_temp_threshold,
    urf_threshold,
    blood_flow_threshold,
  } = paramet

  const allLineCharArray = ProcessRate.map((v) => (v) ? (v * 100).toString().match(/^-?\d+(?:\.\d{0,1})?/)[0] : v)
  const prelineChartArray = allLineCharArray.filter((v, i) => i != 0)

  const labels = {
    reportTitle: locale(lang, 'System Performance Analysis Report'),
    pdfGenerateDate: locale(lang, 'Report Date'),
    pdfDataDuration: locale(lang, 'Analyze Data Period'),
    monthly: locale(lang, 'Monthly'),
    dialysisTimes: locale(lang, 'Dialysis Times'),
    bpEvents: locale(lang, 'Blood Pressure Events'),
    bpRate: locale(lang, 'Blood Pressure Rate'),
    prePeriod: locale(lang, 'Pre-Period'),
    exeRate: locale(lang, 'Execution Rate'),
    effectiveness: locale(lang, 'Effectiveness of Risk'),
    noAdjust: locale(lang, 'No Adjust Parameters'),
    adjust: locale(lang, 'Adjust Parameters'),
  }

  const styles = `
    <style>
      body {
        font-family: sans-serif;
        /*width: 595px;
        height: 842px;*/
        margin: 36px 26px 36px 26px;
      }
      text {
        font-family: sans-serif;
      }
      #print-canvas {
        background: #fff;

        /*
        display: -webkit-box
        display: -webkit-flex
        -webkit-flex-wrap: wrap
        flex-wrap: wrap
        display: flex;
        flex-direction: column;
        justify-content: flex-start;
        align-items: center;*/
      }

      .inside-canvas {
        width: 543px;
        /*height: 770px;*/
        /*margin: 36px 26px 36px 26px;*/
        margin: 0 auto;       /* workaround */
      }

      .logo-img {

        width: 147px;
        height: 42px;

        display: inline;      /* workaround */
        float: left;          /* workaround */
      }

      .logo-img img {
        max-width: 100%;
        max-height: 100%;
      }

      #header-section {

      }

      .header-content {
        /*
        display: -webkit-box
        display: -webkit-flex
        -webkit-flex-wrap: wrap
        flex-wrap: wrap
        display: flex;
        flex-direction: row;
        justify-content: space-between;
        align-items: center;
        */
        height: 40px;         /* workaround */
        text-align: center;   /* workaround */
      }

      .title-label {
        font-size: 22px;

        display: inline;      /* workaround */
      }

      .date-col {
        font-size: 8px;
        color: #777;
        float: right;         /* workaround */
        text-align: left;     /* workaround */
        display: inline;      /* workaround */
      }

      #table-section table {
        width: 100%;
        font-size: 12px;
        margin-top: 20px;
      }

      #table-section td {
        text-align: center;
      }

      #table-section th {
        font-weight: 500;
      }

      .table-first-head :first-child {
        border-top-left-radius:5px;
      }

      .table-first-head :last-child {
        border-top-right-radius:5px;

      }

      .table-dark-cell {
        font-size: 11px;
        background: #5daca2;
        text-align:center;
        color:#FFFFFF
      }

      .table-lite-cell {
        font-size: 10px;
        background: #c1dedc;
        text-align:center;
        color:#000
      }

      .desc-text {
        font-size: 8px;
        color: #777;
        padding-top: 10px;
      }

      .header-separator {
        border-bottom: 2px solid #5daca2;
      }

      #line-chart-section {
        padding-top: 33px;
      }
      .chart-separator{
        font-size: 14px;
        /*
        display: -webkit-box
        display: -webkit-flex
        -webkit-flex-wrap: wrap
        flex-wrap: wrap
        display: flex;
        flex-direction: row;
        justify-content: flex-start;
        align-items: center;
        */
        position: relative;     /* workaround */
      }
      .chart-separator-title {
        width: 80px;
        position: absolute;     /* workaround */
        background: white;      /* workaround */
        z-index: 10;            /* workaround */
      }
      .bar-chart-separator-title {
        width: 160px;
        position: absolute;     /* workaround */
        background: white;      /* workaround */
        z-index: 10;            /* workaround */
      }

      .chart-separator-line {
        height: 2px;
        width: 96%;
        border-top: 2px solid #ccc;
        position: absolute;     /* workaround */
        margin: 9px;            /* workaround */
      }

      #bar-chart-section {
        padding-top: 33px;
      }

      .chart-title {
        text-anchor: start;
      }
      .y-label {
        text-anchor: end;
      }

      .x-label {
        text-anchor: middle;
      }


    </style>
  `

  const head = `
      <div class="header-content">
        <div class="logo-img">
          <img src='file:///${reportPngPath}/BestShape_s.png'>
        </div>
        <div class="title-label">${labels.reportTitle}</div>
        <div class="date-col">
          <div>${labels.pdfGenerateDate}: ${reportDate}</div>
          <div>${labels.pdfDataDuration}: ${startDate} ~ ${endDate}</div>
        </div>
      </div>
      <div class="header-separator">
      </div>

      `

  const svgWidth = 543
  const svgHeight = 250

  const svgMinX = 10
  const svgMinY = svgHeight - 10
  const barMaxHeight = 150
  const chartWidth = 490
  const chartMinX = svgMinX + 35 //65
  const chartMinY = svgMinY - 10 //190
  const chartMaxX = chartMinX + chartWidth //435
  const chartMaxY = chartMinY - barMaxHeight //40
  const textY = chartMinY +15

  const calcRectTopPositionAndHeight = function(percent, maxPercent) {
    if (!percent &&  percent != 0) {
      return {
        height: 0,
        top: 0,
      }
    }

    const height = barMaxHeight * ( percent / 100 ) * (100 / maxPercent)
    const top = chartMaxY + barMaxHeight - height

    return {
      height,
      top,
    }
  }


  let monthValue = ''
  Array.from(Array(13).keys()).forEach((v, i) => {
    if (i == 0) {
      i = labels.prePeriod
    } else {
      i = (i < 10) ? `0${i}` : i
    }
    monthValue += `<th class="table-dark-cell">${i}</th>`
  })

  const dia_count = dia_count_data.map(v => `<td class="table-lite-cell">${(!v && v != 0) ? '--' : v}</td>`
  )
  const sbp_count = sbp_count_data.map(v => `<td class="table-lite-cell">${(!v && v != 0) ? '--' : v}</td>`
  )
  const sbp_rate = sbp_rate_data.map(v => `<td class="table-lite-cell">${(!v && v != 0) ? '--' : v}</td>`
  )
  const tableDesc = `
    <div class="desc-text">
      <div>掉血壓定義：<b>1.</b> 收縮壓 > ${maxblood_upper}時，下降${maxblood_upper_tuning_value} ${maxblood_upper_tuning_unit}；<b>2.</b>${maxblood_upper} >=收縮壓>= ${maxblood_lower}時，下降${maxblood_middle_tuning_value} ${maxblood_middle_tuning_unit}；<b>3.</b>收縮壓<${maxblood_lower}時，下降${maxblood_lower_tuning_value} ${maxblood_lower_tuning_unit}</div>
      <div>前期定義：系統導入第一年 - 以既有的VIP資料，計算上個月掉血壓的機率。系統使用第N年 - 以前一年度的資料，計算掉血壓機率。</div>
    </div>
  `
  const table = `

    <table>
      <tr class="table-first-head">
        <th class="table-dark-cell">${labels.monthly}</th>
        ${monthValue}
      </tr>
      <tr>
        <th class="table-dark-cell">${labels.dialysisTimes}</th>
        ${dia_count.join('')}

      </tr>
      <tr>
        <th class="table-dark-cell">${labels.bpEvents}</th>
        ${sbp_count.join('')}
      </tr>
      <tr>
        <th class="table-dark-cell">${labels.bpRate} (%)</th>
        ${sbp_rate.join('')}
      </tr>
    </table>
    ${tableDesc}
  `

  const cleanPrevPercent = previousPercent.filter((v) => (!!v && v != '0') )
  const cleanCurrentPercent = currentPercent.filter((v) => (!!v && v != '0') )
  let maxValue = 100
  if (cleanPrevPercent.length > 0 || cleanCurrentPercent.length > 0) {
    maxValue = Math.max(...cleanPrevPercent, ...cleanCurrentPercent) + 20
  }

  const range = (maxValue < 60) ? 5 : 10
  const maxPercent = Math.ceil(maxValue / range) * range
  const monthBaseArray = Array.from(Array(12).keys())

  const strMonArray = monthBaseArray.map(
    (v) => (++v >= 10) ? String(v) : `0${v}`
  )

  const barBaseArray = Array.from(Array(13).keys())
  const startX = chartMinX + 20
  const offset = (chartWidth - 20) / 13
  let barOffset = 12
  let barWidth = 10
  const barX = barBaseArray.map((v, i) => {
    return startX + i * offset
  })
  const cBarX = barBaseArray.map((v, i) => {
    return startX + i * offset + barOffset
  })
  const xlabelX = barBaseArray.map((v, i) => {
    return startX + i * offset + (barOffset + barWidth) / 2
  })

  const barY = previousPercent.map((v) => {
    return calcRectTopPositionAndHeight(v, maxPercent)
  })

  const cBarY = currentPercent.map((v) => {
    return calcRectTopPositionAndHeight(v, maxPercent)
  })

  const xLabelCount = maxPercent / range < 0 ? 0 : maxPercent / range
  const xLabelArrayBase = Array.from(Array(xLabelCount + 1).keys())
  const dotLabelArray = xLabelArrayBase.map((v, i) => {
    let y = barMaxHeight * (1 - i * range / maxPercent )
    let cnt = range * i > 100 ? '' : range * i + '%'
    let r =
      `<text
        class="y-label"
        x=${chartMinX - 10}
        y=${y + chartMaxY + 2}
        font-size="10px">
          ${cnt}
        </text>
      <line
        x1="${chartMinX}"
        y1="${y + chartMaxY }"
        x2="${chartMaxX}"
        y2="${y + chartMaxY}"
        fill="none"
        stroke="#aaa"
        stroke-dasharray="2,2" />
        `
    return r
  })

  const preBarMonArray = barBaseArray.map(
    (v, i) => (
     `<rect
        x="${barX[i]}"
        y="${barY[i].top}"
        width="${barWidth}"
        height="${barY[i].height}"
        rx="2"
        ry="2"
        style="fill:${
          (i == 0) ? '#c6553d' : '#f2704f'
        };" />`
    )
  )

  const currentBarMonArray = barBaseArray.map(
    (v, i) => (
     `<rect
        x="${cBarX[i]}"
        y="${cBarY[i].top}"
        width="${barWidth}"
        height="${cBarY[i].height}"
        rx="2"
        ry="2"
        style="fill:${
           (i == 0) ? '#858e15' : '#9aa628'
        };" />`
    )
  )

  const chartXlabels = [labels.prePeriod].concat(strMonArray)
  const xLabelXArray = barBaseArray.map(
    (v, i) => {
      let r =
        `<text
          class="x-label"
          x="${xlabelX[i]}"
          y="${textY}"
          text-anchor="middle"
          font-family="Verdana"
          font-size="10"
          fill="#666" >
          ${chartXlabels[i]}
        </text>`
      return r
    }
  )

  const lineY = allLineCharArray.map((v, i) => {
    return calcRectTopPositionAndHeight(v, 100)
  })

  const lineMaxPercent = 100
  const lineRange = 10
  const lineCharXLabelBase = Array.from(Array(11).keys())
  const lineChartDotLabelArray = lineCharXLabelBase.map((v, i) => {
    let y = barMaxHeight * (1 - i * lineRange / lineMaxPercent )
    let cnt = lineRange * i
    let r =
      `<text
        class="y-label"
        x=${chartMinX - 10}
        y=${y + chartMaxY}
        font-size="10px">
          ${cnt}%
        </text>
      <line
        x1="${chartMinX}"
        y1="${y + chartMaxY }"
        x2="${chartMaxX}"
        y2="${y + chartMaxY}"
        fill="none"
        stroke="#aaa"
        stroke-dasharray="2,2" />
        `
    return r
  })

  const lineChartToolTip = barBaseArray.map((v, i) => {
    if (!allLineCharArray[i] && allLineCharArray != 0) {
      let r =`<g></g>`
      return r
    }
    const labelBgWidth = 45
    let r =
      `<g>
        <rect
        x="${xlabelX[i] - labelBgWidth / 2}"
        y="${lineY[i].top - 27}"
        width="${labelBgWidth}"
        height="15"
        rx="5"
        ry="5"
        fill="#eee"
        >
        </rect>
        <circle
          cx="${xlabelX[i]}"
          cy="${lineY[i].top}"
          r="3"
          stroke-width="0"
          fill="#5bafa2"
        />
        <text
        x="${xlabelX[i]}"
        y="${lineY[i].top - 15}"
        font-family="Verdana"
        text-anchor="middle"
        font-weight="900"
        font-size="12"
        fill="#5e928b">
        ${allLineCharArray[i]}%
        </text>
      </g>
      `
    return r
  })

  let linePath = ''
  let lineStartPoint = false
  prelineChartArray.forEach((v, i) => {

    if (!lineStartPoint && !v && v != 0 ) {
      linePath += `M ${xlabelX[i + 1]} ${lineY[i + 1].top}  `
    } else if (!v && v != 0) {
      linePath += ` `
    }else {
      linePath +=
        (!lineStartPoint) ?
        `M ${xlabelX[i + 1]} ${lineY[i + 1].top} ` :
        `L ${xlabelX[i + 1]} ${lineY[i + 1].top} `
      lineStartPoint = true
    }

  })

  const lineChart = `
    <div class="chart-separator">
      <div class="chart-separator-title">${labels.exeRate}</div>
      <div class="chart-separator-line"></div>
    </div>
    <div id="line-chart" >
      <svg height=${svgHeight} width=${svgWidth}>
      <!--hoz and vertical line -->
      <line x1="${chartMinX}" y1="${chartMinY}" x2="${chartMinX}" y2="${chartMaxY}" style="stroke:#bbb;stroke-width:2" />
      <line x1="${chartMinX}" y1="${chartMinY}" x2="${chartMaxX}" y2="${chartMinY}" style="stroke:#bbb;stroke-width:2" />

      <!--dotted line -->
      ${lineChartDotLabelArray.join('')}

      <path
        d="${linePath}"
        stroke="#5bafa2"
        stroke-width="2"
        fill="none" />

      <!-- text in x -->
      ${xLabelXArray.join('')}
      <!-- percent number text -->
      ${lineChartToolTip.join('')}

      <!-- chart label meaning -->
      <g>
        <text
        x="${chartMaxX - 60}"
        y="${chartMaxY - 50}"
        font-family="Verdana"
        text-anchor="start"
        alignment-baseline="central"
        font-weight="900"
        font-size="12"
        fill="#777">
        ${labels.exeRate}
        </text>
        <rect
        x="${chartMaxX - 100}"
        y="${chartMaxY - 50}"
        width="30"
        height="2"
        fill="#5e928b"
        >
        </rect>
      </g>
    </div>

  `

  const barChartToolTip = previousPercent.map((percent, i) => {
    if (!percent && percent != 0) {
      let r =`<g></g>`
      return r
    }

    let r =
      `<g>
        <text
        x="${barX[i]}"
        y="${barY[i].top - 14}"
        font-family="Verdana"
        font-weight="900"
        font-size="10"
        text-anchor="start"
        transform="rotate(-90 ${barX[i]}, ${barY[i].top - 15}) translate(-10, 8)"
        fill="${(i == 0) ? '#c6553d' : '#f2704f'}">
        ${percent}%
        </text>
      </g>
      `
    return r
  })

  const cBarChartToolTip = currentPercent.map((percent, i) => {
    if (!percent && percent != 0) {
      let r = `<g></g>`
      return r
    }
    let r =
      `<g>
        <text
        text-anchor="start"
        x="${cBarX[i]}"
        y="${cBarY[i].top - 14}"
        transform="rotate(-90 ${cBarX[i]}, ${cBarY[i].top - 15}) translate(-10, 8)"
        font-family="Verdana"
        font-weight="900"
        font-size="10"
        fill="${(i == 0) ? '#858e15' : '#9aa628'}">
        ${percent}%
        </text>
      </g>
      `
    return r
  })

  const barChartDesc = `
    <div class="desc-text">參數調整判斷方式 : 電解質濃度↑${Math.abs(conductivity_threshold)}、機器溫度↓${Math.abs(dialysate_temp_threshold)}、脫水率↓${Math.abs(urf_threshold)}、血液流速↓${Math.abs(blood_flow_threshold)}</div>
  `
  const barChart =
  `
    <div class="chart-separator">
      <div class="bar-chart-separator-title">${labels.effectiveness}</div>
      <div class="chart-separator-line"></div>
    </div>
    <div id="chart" >
      <svg height=${svgHeight} width=${svgWidth}  scale(1)">
      <!--dotted line -->
      ${dotLabelArray.join('')}
      ${preBarMonArray.join('')}
      ${currentBarMonArray.join('')}
      <!-- text in x -->
      ${xLabelXArray.join('')}
      <!-- percent number text -->


      <!-- chart title -->
      <text
        class="chart-title"
        x="${svgMinX}"
        y="${chartMaxY - 20}"
        font-family="Verdana"
        font-size="14"
        fill="#666">${labels.bpRate}</text>

      <!--hoz and vertical line -->
      <line x1="${chartMinX}" y1="${chartMinY}" x2="${chartMinX}" y2="${chartMaxY}" style="stroke:#bbb;stroke-width:2" />
      <line x1="${chartMinX}" y1="${chartMinY}" x2="${chartMaxX}" y2="${chartMinY}" style="stroke:#bbb;stroke-width:2" />

      <!-- chart label meaning -->
      <g>
        <text
        x="${chartMaxX - 80}"
        y="${chartMaxY - 50}"
        font-family="Verdana"
        text-anchor="start"
        alignment-baseline="central"
        font-weight="900"
        font-size="12"
        fill="#777">
        ${labels.noAdjust}
        </text>
        <rect
        x="${chartMaxX - 100}"
        y="${chartMaxY - 50 - 12 / 2}"
        width="12"
        height="12"
        fill="#e47658"
        >
        </rect>
      </g>
      <g>
        <text
        x="${chartMaxX - 80}"
        y="${chartMaxY - 30}"
        font-family="Verdana"
        text-anchor="start"
        alignment-baseline="central"
        font-weight="900"
        font-size="12"
        fill="#777">
        ${labels.adjust}
        </text>
        <rect
        x="${chartMaxX - 100}"
        y="${chartMaxY - 30 - 12 / 2}"
        width="12"
        height="12"
        fill="#9da441"
        >
        </rect>
      </g>
      ${barChartToolTip.join('')}
      ${cBarChartToolTip.join('')}
    </div>
    ${barChartDesc}
  `

  const html = `

      <body>
        ${styles}
        <div id="print-canvas">
          <div class="inside-canvas">
            <section id="header-section">${head}</section>
            <section id="table-section">${table}</section>
            <section id="line-chart-section">${lineChart}</section>
            <section id="bar-chart-section">${barChart}</section>
          </div>
        </div>
      </body>
  `
  return html
}
