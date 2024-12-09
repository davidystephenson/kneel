import addHeader from './addHeader'

export default function addContentType (props: {
  headers: RequestInit['headers']
  value: string
}): void {
  addHeader({ ...props, key: 'Content-Type' })
}
