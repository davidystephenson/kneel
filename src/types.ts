import { ZodSchema, z } from 'zod'

export interface RequestPayloadProps <
  RequestBody, InputSchema extends ZodSchema<RequestBody>
> {
  body: z.infer<InputSchema>
  encoding?: 'application/json' | 'application/x-www-form-urlencoded' | 'multipart/form-data' | 'text/plain'
  input: InputSchema
}
export interface NotRequestPayloadProps {
  body?: undefined
  encoding?: undefined
  input?: undefined
}
export type MaybeRequestPayloadProps <
  Input, InputSchema extends ZodSchema<Input>
> = RequestPayloadProps<Input, InputSchema>
| NotRequestPayloadProps

export interface FetchProps <ResponseBody> {
  debug?: boolean
  headers?: HeadersInit
  method?: string
  output?: ZodSchema<ResponseBody>
  url: string
}

export type KneelProps <
  RequestBody,
  InputSchema extends ZodSchema<RequestBody>,
  ResponseBody
> = FetchProps<ResponseBody> & MaybeRequestPayloadProps<RequestBody, InputSchema>

export type KneelMake = <
  RequestBody,
  InputSchema extends ZodSchema<RequestBody>,
  ResponseBody = void
> (
  props: KneelProps<RequestBody, InputSchema, ResponseBody>
) => KneelProps<RequestBody, InputSchema, ResponseBody>

export type Kneel = <
  RequestBody,
  InputSchema extends ZodSchema<RequestBody>,
  ResponseBody = void
> (
  props: KneelProps<RequestBody, InputSchema, ResponseBody>
) => Promise<ResponseBody>
