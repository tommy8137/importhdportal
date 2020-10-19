import moment from 'moment'

export default class Calculate {

  static datetoAge(birthday) {
    let dob, year, month, day
    year = birthday.getFullYear() - 100
    month = birthday.getMonth()
    day = birthday.getDay()
    dob = new Date(year, month, day)
    var now = moment()
    var yearDiff = moment.duration(now - dob).as('years')
    return Math.floor(yearDiff)
  }
}
