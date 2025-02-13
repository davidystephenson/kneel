import { ZodSchema } from 'zod'
import { KneelProps } from '.'
import { Kneel, KneelMake } from './types'
import kneel from './kneel'

export default function kneelMaker (props: {
  make: KneelMake
}): Kneel {
  async function madeKneel <I, Schema extends ZodSchema<I>, O = void> (kneelProps: KneelProps<I, Schema, O>): Promise<O> {
    const made = props.make(kneelProps)
    return await kneel(made)
  }
  return madeKneel
}
