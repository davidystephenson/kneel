import { ZodSchema } from 'zod'
import { KneelProps } from '.'
import { Kneel, KneelMake } from './types'
import kneel from './kneel'

export default function kneelMaker (props: {
  debug?: boolean
  make: KneelMake
}): Kneel {
  const debug = props.debug ?? false
  async function madeKneel<
    RequestBody,
    InputSchema extends ZodSchema<RequestBody>,
    ResponseBody = void
  > (
    madeKneelProps: KneelProps<RequestBody, InputSchema, ResponseBody>
  ): Promise<ResponseBody> {
    if (debug) {
      console.info('kneelMaker input', madeKneelProps)
    }
    const made = props.make(madeKneelProps)
    if (debug) {
      console.info('kneelMaker output', made)
    }
    return await kneel(made)
  }
  return madeKneel
}
