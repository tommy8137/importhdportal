const cache = require('memory-cache')

const recordTime = 7*24*60*60*1000
export function* recordUser(id, loginTime) {
  let userInfo = `${id}+${loginTime}`
  if (cache.get(userInfo) === null) {
    cache.put(userInfo, '', recordTime)
  }
}

export function* removeUser(id, loginTime){
  let userInfo = `${id}+${loginTime}`
  if (cache.size() < 0 || cache.get(userInfo) === null) {
    return false
  } else {
    cache.del(userInfo)
    return true
  }
}

export function findUser(id, loginTime){
  let userInfo = `${id}+${loginTime}`
  return new Promise(function(resolve, reject){
    if (cache.size() < 0 || cache.get(userInfo) === null) {
      resolve(false)
    } else {
      resolve(true)
    }
  })
}

export function* refreshUser(id, loginTime){
  let userInfo = `${id}+${loginTime}`
  if (cache.size() < 0 || cache.get(userInfo) === null) {
    return false
  } else {
    cache.put(userInfo, '', recordTime)
    return true
  }
}

export function* recordRefreshToken(id, loginTime, token){
  let userInfo = `${id}+${loginTime}`
  cache.put(userInfo, token, recordTime)
  return
}

export function* getRefreshToken(id, loginTime){
  let userInfo = `${id}+${loginTime}`
  if (cache.size() < 0 || cache.get(userInfo) === null || cache.get(userInfo) == '') {
    return null
  } else {
    let refreshToken = cache.get(userInfo)
    cache.put(userInfo, '', recordTime)
    return refreshToken
  }
}
