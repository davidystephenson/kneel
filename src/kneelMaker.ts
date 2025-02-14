import { ZodSchema } from 'zod'
import { KneelProps } from '.'
import { Kneel, KneelMake } from './types'
import kneel from './kneel'

export default function kneelMaker (props: {
  debug?: boolean
  make: KneelMake
}): Kneel {
  const debug = props.debug ?? false
  async function madeKneel<I, Schema extends ZodSchema<I>, O = void> (input: KneelProps<I, Schema, O>): Promise<O> {
    if (debug) {
      console.debug('kneelMaker input', input)
    }
    const output = props.make(input)
    if (debug) {
      console.debug('kneelMaker output', output)
    }
    return await kneel(output)
  }
  return madeKneel
}
