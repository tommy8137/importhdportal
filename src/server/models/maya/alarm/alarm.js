import { systemDB, hospitalDB } from 'server/helpers/database'

export default class Alarm {
  static* getAlarmList(notesformat) {

    switch (notesformat)
    {
      case "dart":
        const subject =  yield hospitalDB.Query('SELECT DISTINCT SUBJECT FROM vi_BigData_TYHD_TEXT_PACKAGE_DART', [])
        const dcontent = yield hospitalDB.Query('SELECT * FROM vi_BigData_TYHD_TEXT_PACKAGE_DART order by DSerial_ID', [])
        let dart_list = [], DContent, AContent, dart
        for(let i = 0;i < subject.rows.length; i++){     
          for(let j = 0;j < dcontent.rows.length; j++){
            if(subject.rows[i].SUBJECT === dcontent.rows[j].Subject) {
              if(dcontent.rows[j].DKind == 'D') {
                DContent = dcontent.rows[j].DContent
                dart = { Subject: subject.rows[i].SUBJECT, DContent: DContent, AContent: [] }
              } 
              if(dcontent.rows[j].DKind == 'A'){
                dart.AContent.push(dcontent.rows[j].DContent)
              }
            }
          }
          dart_list.push(dart)
        }
        return dart_list

      default: 
        const key =  yield hospitalDB.Query('SELECT DISTINCT TP_NAME FROM vi_BigData_TYHD_TEXT_PACKAGE', [])
        const text =  yield hospitalDB.Query('SELECT * FROM vi_BigData_TYHD_TEXT_PACKAGE ORDER BY TP_ID ASC', [])
        let list = []
        for(let i = 0;i < key.rows.length;i++){
          let symptoms = { alarm_phrase:key.rows[i].TP_NAME, alarm_process:[] }
            for(let j = 0;j < text.rows.length;j++){
              if(key.rows[i].TP_NAME === text.rows[j].TP_NAME) {
                symptoms.alarm_process.push( text.rows[j].TP_CONTENT)
              }
            }
          list.push(symptoms)
        }
        return list
    }
  }
}
