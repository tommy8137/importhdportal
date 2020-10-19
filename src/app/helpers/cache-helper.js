export default class CacheHelper {
  static getCache(url) {
    // return localCache[url]? localCache[url].data: null
    const data = sessionStorage.getItem(`${url}:data`)
    return data ? JSON.parse(data): null
  }

  static getEtag(url) {
    // return localCache[url]? localCache[url].etag: null
    return sessionStorage.getItem(`${url}:e-tag`)
  }

  static saveCache(url, etag, result) {
    // localCache[url] = { etag, data: result }
    sessionStorage.setItem(`${url}:e-tag`, etag)
    // localCache[url] = result
    sessionStorage.setItem(`${url}:data`, JSON.stringify(result))
  }
}
