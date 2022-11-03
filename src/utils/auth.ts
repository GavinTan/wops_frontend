import Cookies from 'js-cookie'

const TokenKey = 'wops_token'

export function getToken() {
  return Cookies.get(TokenKey)
}

export function setToken(token: string, day?: number) {
  if (day) {
    return Cookies.set(TokenKey, token, {expires: day})
  }
  return Cookies.set(TokenKey, token)

}

export function removeToken() {
  return Cookies.remove(TokenKey)
}
