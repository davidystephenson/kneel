import { ZodSchema } from 'zod'
import { KneelProps } from '.'
import { Kneel, KneelMake } from './types'
import kneel from './kneel'

export default function kneelMaker (props: {
  debug?: boolean
  make: KneelMake
}): Kneel {
  const debug = props.debug ?? false
  async function madeKneel<Input, InputSchema extends ZodSchema<Input>, Output = void> (input: KneelProps<Input, InputSchema, Output>): Promise<Output> {
    if (debug) {
      console.info('kneelMaker input', input)
    }
    const output = props.make(input)
    if (debug) {
      console.info('kneelMaker output', output)
    }
    return await kneel(output)
  }
  return madeKneel
}
