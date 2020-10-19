// import schedule from 'node-schedule'
// import Cipher from 'cipher'
// import fs from'fs'
// import path from 'path'
// import { keyPath, licenseFilePath, licensePwd, licenseHmacPwd } from '../config'

// const pwd = {
//   licensePwd: licensePwd,
//   licenseHmacPwd: licenseHmacPwd,
// }
// const crypto = new Cipher(pwd)

// // execute everyday at 00:00
// const rule = new schedule.RecurrenceRule()
// rule.hour = 0
// rule.minute = 0

// // schedule the job
// const job = schedule.scheduleJob(rule, () => {
//   try {
//     // check if file exists
//     fs.accessSync(licenseFilePath, fs.R_OK | fs.W_OK)
//     // read, decrypt and minus 1 the counter
//     const counter = crypto.decrypt(fs.readFileSync(licenseFilePath, 'utf-8')) - 1
//     console.log(`license counter: ${counter} encrypt: ${crypto.encrypt(counter.toString())}`)
//     // write couner to file
//     fs.writeFileSync(licenseFilePath, crypto.encrypt(counter.toString()), 'utf8')
//     console.info('cron job completed')
//   }
//   catch(e) {
//     console.error(`Cron job update fail: ${e}`)
//   }
// })

// export default job
