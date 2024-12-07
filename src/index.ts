import { KneelProps } from './types'

export { KneelProps } from './types'

const CONTENT_TYPE = 'Content-Type'
const FORM = 'application/x-www-form-urlencoded'

export default async function kneel<Request, Response> (props: KneelProps<Request, Response>): Promise<Response> {
  const debug = props.debug ?? false
  const init: RequestInit = {}
  if (props.method != null) {
    init.method = props.method
  }
  if (props.headers != null) {
    init.headers = props.headers
  }
  if ('request' in props) {
    if (init.method == null) {
      init.method = 'POST'
    }
    const payload = props.request.parse(props.body)
    if (props.formEncoded === true) {
      init.body = new URLSearchParams()
      for (const key in payload) {
        const value = payload[key]
        const string = String(value)
        init.body.append(key, string)
      }

      if (init.headers == null) {
        init.headers = { [CONTENT_TYPE]: FORM }
      } else if (Array.isArray(init.headers)) {
        init.headers.push([CONTENT_TYPE, FORM])
      } else if (init.headers instanceof Headers) {
        init.headers.set(CONTENT_TYPE, FORM)
      } else {
        init.headers[CONTENT_TYPE] = FORM
      }
    } else {
      init.body = JSON.stringify(payload)
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
