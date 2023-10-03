import get from 'lodash/get'
import { isClient } from './isClient'
import { axios } from '@/providers'

export const get_env = (title) => {
  if (isClient) {
    if (!get(window, '_env_')) {
      const getEnvUrl = `${window.location.origin}/api/sync-client-envs`
      axios({
        url: getEnvUrl,
        method: 'POST',
      })
        .then(() => {
          window.location.reload()
        })
        .catch((err) => {
          console.log(`[Error while calling set envs api] ${err}`)
        })
    } else {
      const env = get(window._env_, title, null)
      return env
    }
  }
  return null
}
