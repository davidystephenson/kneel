import addContentType from './addContentType'
import { KneelProps } from './types'

export { KneelProps } from './types'

export default async function kneel<Request, Response> (
  props: KneelProps<Request, Response>
): Promise<Response> {
  const debug = props.debug ?? false
  console.log('kneel debug', debug)
  const init: RequestInit = {}
  if (props.method != null) {
    init.method = props.method
  }
  if (props.headers != null) {
    init.headers = props.headers
  }
  if ('request' in props) {
    console.log('request debug', debug)
    if (init.method == null) {
      init.method = 'POST'
    }
    if (debug) {
      console.debug('kneel request body', props.request)
    }
    try {
      const body = props.request.parse(props.body)
      const encoding = props.encoding ?? 'application/json'
      switch (encoding) {
        case 'application/json': {
          init.body = JSON.stringify(body)
          break
        }
        case 'application/x-www-form-urlencoded': {
          init.body = new URLSearchParams()
          for (const key in body) {
            const value = body[key]
            const string = String(value)
            init.body.append(key, string)
          }
          break
        }
        case 'multipart/form-data': {
          init.body = new FormData()
          for (const key in body) {
            const value = body[key]
            if (
              !(value instanceof Blob) &&
              typeof value !== 'string'
            ) {
              throw new Error(`Unsupported value type: ${String(value)}`)
            }
            init.body.append(key, value)
          }
          break
        }
        case 'text/plain': {
          init.body = String(body)
          break
        }
        default: throw new Error(`Unsupported encoding: ${String(props.encoding)}`)
      }
      addContentType({
        headers: init.headers,
        value: encoding
      })
    } catch (error) {
      if (debug) {
        console.error('kneel request body error', error)
      }
      throw error
    }
  }
  const response = await fetch(props.url, init)
  const json: unknown = await response.json()
  if (debug) {
    console.debug('kneel json', json)
  }
  const payload = props.response.parse(json)
  return payload
}
