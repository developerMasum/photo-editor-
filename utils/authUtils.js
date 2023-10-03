import { isClient } from './isClient'

export const getCookies = () => {
  const _cookies = {}
  if (isClient && document.cookie) {
    let cookies = document.cookie.split(';')
    for (let cookie of cookies) {
      cookie = cookie.trim()
      let [key, value] = cookie.split('=')
      _cookies[key] = value
    }
  }
  return _cookies
}
