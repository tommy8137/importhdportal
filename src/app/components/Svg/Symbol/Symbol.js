import React, { Component } from 'react'
import CSSModules from 'react-css-modules'
import styles from './symbol.css'
import cssVar from 'app/css/variables-with-js'

function SymbolRaw({ type = 0, ...props }) {
  let { fill = cssVar[`color${type}`], stroke = cssVar[`color${type}`]} = props

  switch (type) {
    default:
    case 0:
      return (
        <g {...props} strokeWidth={0} stroke={stroke} fill={fill}>
          <path fill="#FFFFFF" d="M6,10c-2.2,0-4-1.8-4-4s1.8-4,4-4s4,1.8,4,4S8.2,10,6,10z"/>
          <path d="M6,3c1.7,0,3,1.3,3,3S7.7,9,6,9S3,7.7,3,6S4.3,3,6,3 M6,1C3.2,1,1,3.2,1,6c0,2.8,2.2,5,5,5c2.8,0,5-2.2,5-5
            C11,3.2,8.8,1,6,1L6,1z"/>
        </g>
      )
    case 1:
      return (
        <g {...props} strokeWidth={0} stroke={stroke} fill={fill}>
          <circle cx="5.9" cy="7" r="5"/>
        </g>
      )
    case 2:
      return (
        <g {...props} strokeWidth={0} stroke={stroke} fill={fill}>
          <rect x="2.5" y="2.7" fill="#FFFFFF" width="7" height="7"/>
          <path fill={fill} d="M8.5,3.7v5h-5v-5H8.5 M10.5,1.7h-9v9h9V1.7L10.5,1.7z"/>
        </g>
      )
    case 3:
      return (
        <g {...props} stroke={stroke} fill={fill}>
          <rect x="1.6" y="1.6" width="9" height="9"/>
        </g>
      )
    case 4:
      return (
        <g {...props} stroke={stroke} fill={fill}>
          <polygon fill="#FFFFFF" points="2.2,11 4.2,7 6.1,3.4 10,11  "/>
          <path d="M6.1,5.6l1,1.9L8.4,10H6.1H3.9l1.3-2.5L6.1,5.6 M6.1,2C5.9,2,5.6,2.1,5.5,2.4L3.4,6.6l-2.1,4.2
            C0.9,11.3,1.3,12,1.9,12h4.3h4.3c0.6,0,0.9-0.7,0.6-1.3L8.9,6.6L6.8,2.4C6.6,2.1,6.4,2,6.1,2L6.1,2z"/>
        </g>
      )
    case 5:
      return (
        <g {...props} stroke={stroke} fill={fill}>
          <path d="M6.1,12H1.8c-0.6,0-0.9-0.7-0.6-1.3l2.1-4.2l2.1-4.2c0.3-0.6,1-0.6,1.3,0l2.1,4.2l2.1,4.2
            c0.3,0.6-0.1,1.3-0.6,1.3H6.1z"/>
        </g>
      )
    case 6:
      return (
        <g {...props} stroke={stroke} fill={fill}>
          <rect x="3.7" y="3.7" transform="matrix(-0.7071 0.7071 -0.7071 -0.7071 15.6918 6.5002)" fill="#FFFFFF" width="5.6" height="5.6"/>
          <path d="M6.5,4.1l2.4,2.4L6.5,8.9L4.1,6.5L6.5,4.1 M6.5,1L1,6.5L6.5,12L12,6.5L6.5,1L6.5,1z"/>
        </g>
      )
    case 7:
      return (
        <g {...props} stroke={stroke} fill={fill}>
          <rect x="2.6" y="2.6" transform="matrix(-0.7071 -0.7071 0.7071 -0.7071 6.5 15.6924)"  width="7.8" height="7.8"/>
        </g>
      )
    case 8:
      return (
        <g {...props} stroke={stroke} fill={fill}>
          <path fill="#FFFFFF" d="M6,10.8c-1.7,0-3-1.4-3-3c0-0.3,0-0.6,0.1-0.9c0.1-0.3,0.2-0.5,0.3-0.7L6,2.9l2.6,3.3
            c0.1,0.2,0.2,0.5,0.3,0.7C9,7.2,9,7.5,9,7.8C9,9.5,7.6,10.8,6,10.8z"/>
          <path d="M6,4.8l0.4,0.5l0.8,1.1l0.4,0.6C7.7,7,7.7,7.1,7.8,7.3c0.1,0.2,0.1,0.4,0.1,0.5c0,1-0.8,1.9-1.9,1.9
            c-1,0-1.9-0.8-1.9-1.9c0-0.2,0-0.4,0.1-0.5c0-0.1,0.1-0.3,0.2-0.4l0.4-0.6l0.8-1.1L6,4.8 M6,1L3.8,3.8L2.9,4.9L2.4,5.6
            C2.2,5.9,2,6.2,1.9,6.6C1.8,7,1.8,7.4,1.8,7.8C1.8,10.1,3.6,12,6,12s4.2-1.9,4.2-4.2c0-0.4-0.1-0.8-0.2-1.2
            C9.9,6.2,9.7,5.9,9.5,5.6L9,4.9L8.2,3.8L6,1L6,1z"/>
        </g>
      )
    case 9:
      return (
        <g {...props} stroke={stroke} fill={fill}>
          <path d="M10,6.6C9.9,6.2,9.8,5.9,9.6,5.6L9,4.9L8.2,3.8L6,1L3.8,3.8L3,4.9L2.4,5.6C2.2,5.9,2.1,6.2,2,6.6
            C1.9,7,1.8,7.4,1.8,7.8C1.8,10.1,3.7,12,6,12c2.3,0,4.2-1.9,4.2-4.2C10.2,7.4,10.1,7,10,6.6z"/>
        </g>
      )
    case 10:
      return (
        <g {...props} stroke={stroke} fill={fill}>
          <polygon points="2.9,11 1,5.1 6,1.5 11,5.1 9.1,11 "/>
        </g>
      )
    case 11:
      return (
        <g {...props} stroke={stroke} fill={fill}>
          <polygon fill="#FFFFFF" points="4,10 2.5,5.5 6.3,2.7 10.2,5.5 8.7,10  "/>
          <path d="M6.3,4L9,5.9L8,9H4.7l-1-3.1L6.3,4 M6.3,1.5l-5,3.6L3.2,11h6.2l1.9-5.9L6.3,1.5L6.3,1.5z"/>
        </g>
      )
    case 12:
      return (
        <g {...props} stroke={stroke} fill={fill}>
          <polygon points="3,2 9,2 11,11 1,11 "/>
        </g>
      )
    case 13:
      return (
        <g {...props} stroke={stroke} fill={fill}>
          <polygon fill="#FFFFFF" points="2.3,9.8 3.8,2.8 8.2,2.8 9.8,9.8   "/>
          <path d="M7.4,3.8l1.1,5h-5l1.1-5H7.4 M9,1.8H3l-2,9h10L9,1.8L9,1.8z"/>
        </g>
      )
    case 14:
      return (
        <g {...props} stroke={stroke} fill={fill}>
          <ellipse cx="6.2" cy="6.3" rx="5.5" ry="3.5"/>
        </g>
      )
    case 15:
      return (
        <g {...props} stroke={stroke} fill={fill}>
          <path fill="#FFFFFF" d="M6.2,9C3.5,9,1.7,7.7,1.7,6.5S3.5,4,6.2,4s4.5,1.3,4.5,2.5S8.8,9,6.2,9z"/>
          <path d="M6.2,5C8.4,5,9.7,6,9.7,6.5S8.4,8,6.2,8S2.7,6.9,2.7,6.5S3.9,5,6.2,5 M6.2,3c-3,0-5.5,1.6-5.5,3.5
            S3.1,10,6.2,10s5.5-1.6,5.5-3.5S9.2,3,6.2,3L6.2,3z"/>
        </g>
      )
    case 16:
      return (
        <g {...props} stroke={stroke} fill={fill}>
          <polygon points="4.2,4.4 6.2,0.8 8.1,4.4 11.7,6.3 8.1,8.3 6.2,11.8 4.2,8.3 0.7,6.3 "/>
        </g>
      )
    case 17:
      return (
        <g {...props} stroke={stroke} fill={fill}>
          <polygon fill="#FFFFFF" stroke-width="1.5657" stroke-miterlimit="10" points="4.5,4.5 6.1,1.7 7.6,4.5 10.4,6
            7.6,7.5 6.1,10.3 4.5,7.5 1.8,6 "/>
        </g>
      )
    case 18:
      return (
        <g {...props} stroke={stroke} fill={fill}>
          <path d="M10.6,1.6L10.6,1.6l-9-0.1c1.1,1.2,1.8,2.8,1.8,4.5c0,1.7-0.7,3.3-1.8,4.5h9v-0.1C9.6,9.3,8.9,7.8,8.9,6.1
            S9.6,2.8,10.6,1.6z"/>
        </g>
      )
    case 19:
      return (
        <g {...props} stroke={stroke} fill={fill}>
          <path fill="#FFFFFF" d="M3.5,9.8c0.6-1.1,0.9-2.3,0.9-3.5S4.1,3.8,3.5,2.8h5.2C8.2,3.8,7.9,5,7.9,6.3s0.3,2.4,0.9,3.5H3.5z"/>
          <g>
            <path d="M7.3,3.8C7,4.6,6.9,5.4,6.9,6.3S7,8,7.3,8.8H5C5.3,8,5.4,7.1,5.4,6.3c0-0.9-0.1-1.7-0.4-2.5H7.3 M10.6,1.8
              h-9c1.1,1.2,1.8,2.8,1.8,4.5c0,1.7-0.7,3.3-1.8,4.5h9v-0.1C9.6,9.5,8.9,8,8.9,6.3S9.6,3,10.6,1.8L10.6,1.8L10.6,1.8z"/>
          </g>
        </g>
      )
  }
}

export default CSSModules(styles)(SymbolRaw)
