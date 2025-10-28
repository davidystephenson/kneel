import { ZodType, z } from 'zod'

export interface RequestPayloadProps <
  RequestBody, InputSchema extends ZodType<RequestBody>
> {
  input: z.infer<InputSchema>
  contentType?: 'application/json' | 'application/x-www-form-urlencoded' | 'multipart/form-data' | 'text/plain'
  inputSchema: InputSchema
}
export interface NotRequestPayloadProps {
  input?: undefined
  contentType?: undefined
  inputSchema?: undefined
}
export type MaybeRequestPayloadProps <
  Input, InputSchema extends ZodType<Input>
> = RequestPayloadProps<Input, InputSchema>
| NotRequestPayloadProps

export interface FetchProps <ResponseBody> {
  debug?: boolean
  headers?: HeadersInit
  method?: string
  outputSchema?: ZodType<ResponseBody>
  url: string
}

export type KneelProps <
  RequestBody,
  InputSchema extends ZodType<RequestBody>,
  ResponseBody
> = FetchProps<ResponseBody> & MaybeRequestPayloadProps<RequestBody, InputSchema>

export type KneelMake = <
  RequestBody,
  InputSchema extends ZodType<RequestBody>,
  ResponseBody = void
> (
  props: KneelProps<RequestBody, InputSchema, ResponseBody>
) => KneelProps<RequestBody, InputSchema, ResponseBody>

export type Kneel = <
  RequestBody,
  InputSchema extends ZodType<RequestBody>,
  ResponseBody = void
> (
  props: KneelProps<RequestBody, InputSchema, ResponseBody>
) => Promise<ResponseBody>
