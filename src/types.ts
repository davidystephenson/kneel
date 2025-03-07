import { ZodSchema, z } from 'zod'

export interface RequestPayloadProps <Input, InputSchema extends ZodSchema<Input>> {
  body: z.infer<InputSchema>
  encoding?: 'application/json' | 'application/x-www-form-urlencoded' | 'multipart/form-data' | 'text/plain'
  i: InputSchema
}
export interface NotRequestPayloadProps {
  body?: undefined
  encoding?: undefined
  i?: undefined
}
export type MaybeRequestPayloadProps <
  Input, InputSchema extends ZodSchema<Input>
> = RequestPayloadProps<Input, InputSchema>
| NotRequestPayloadProps

export interface FetchProps <Response> {
  debug?: boolean
  headers?: HeadersInit
  method?: string
  o?: ZodSchema<Response>
  url: string
}

export type KneelProps <Input, InputSchema extends ZodSchema<Input>, Response> = FetchProps<Response> & MaybeRequestPayloadProps<Input, InputSchema>

export type KneelMake = <Input, InputSchema extends ZodSchema<Input>, Output = void> (props: KneelProps<Input, InputSchema, Output>) => KneelProps<Input, InputSchema, Output>

export type Kneel = <Input, InputSchema extends ZodSchema<Input>, Output = void> (props: KneelProps<Input, InputSchema, Output>) => Promise<Output>
