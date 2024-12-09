export default function addHeader (props: {
  headers: RequestInit['headers']
  key: string
  value: string
}): void {
  if (props.headers == null) {
    props.headers = { [props.key]: props.value }
  } else if (Array.isArray(props.headers)) {
    props.headers.push([props.key, props.value])
  } else if (props.headers instanceof Headers) {
    props.headers.set(props.key, props.value)
  } else {
    props.headers[props.key] = props.value
  }
}
