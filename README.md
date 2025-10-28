# `kneel`

Fetch with Zod.

## Installation

```sh
npm install kneel
```

## Usage

```ts
import kneel from 'kneel'
import { z } from 'zod'

const response = await kneel({
  url: 'http://localhost:3000',
  output: z.object({ names: z.array(z.string()) })
})
const uppercaseNames = response.names.map((name) => name.toUpperCase())

const writeResponse = await kneel({
  url: 'http://localhost:3000',
  inputSchema: z.object({ name: z.string() }),
  input: { name: 'Zelda Fitzgerald' },
  outputSchema: z.object({ count: z.number() })
})
```

## Problem

Making validation functional can require patterns like annotating with `unknown`.

### Without `kneel`

```ts
import { z } from 'zod'

const outputSchema = z.object({ count: z.number() })
type Output = z.infer<typeof schema>
async function read (): Promise<Output> {
  const response = await fetch('http://localhost:3000')
  // Don't use the unvalidated data
  const json: unknown = await response.json()
  return outputSchema.parse(json)
}

const inputSchema = z.object({ name: z.string() })
type Input = z.infer<typeof schema>
async function write (input: Input): Promise<Output> {
  const body = inputSchema.parse(input)
  const response = await fetch('http://localhost:3000', {
    method: 'POST',
    body: JSON.stringify(body)
  })
  const json: unknown = await response.json()
  return outputSchema.parse(json)
}
```

## Solution

`kneel` requires a Zod schema for a usable response. It also requires a schema if you include a body.

### With `kneel`

```ts
import kneel from 'kneel'
import { z } from 'zod'

const outputSchema = z.object({ count: z.number() })
type Output = z.infer<typeof outputSchema>
async function read (input: Input): Promise<Output> {
  return kneel({
    url: 'http://localhost:3000',
    outputSchema
  })
}

const inputSchema = z.object({ name: z.string() })
type Input = z.infer<typeof inputSchema>
async function write (input: Input): Promise<Output> {
  return kneel({
    url: 'http://localhost:3000',
    input,
    inputSchema,
    outputSchema
  })
}
```

## Parameters

<table>
<tr>
<th>Parameter</th>
<th>Type</th>
<th>Description</th>
<th>Required</th>
<th>Default</th>
<th>Example</th>
</tr>
<tr>
<td>

```ts
url
```

</td>
<td>

```ts
string
```

</td>
<td>URL to fetch</td>
<td>Yes</td>
<td></td>
<td>

```ts
'http://localhost:3000'
```

</td>
</tr>
<tr>
<td>

```ts
inputSchema
```

</td>
<td>

```ts
ZodSchema
```

</td>
<td>Request body schema</td>
<td>No</td>
<td></td>
<td>

```ts
z.object({
  name: z.string()
})
```

</td>
</tr>
<tr>
<td>

```ts
outputSchema
```

</td>
<td>

```ts
ZodSchema
```

</td>
<td>Response body schema</td>
<td>No</td>
<td></td>
<td>

```ts
z.object({
  count: z.number()
})
```

</td>
</tr>
<tr>
<td>

```ts
input
```

</td>
<td>

```ts
z.infer<typeof input>
```

</td>
<td>Request body</td>
<td>

If `inputSchema` is set

</td>
<td></td>
<td>

```ts
{ name: 'Ada' }
```

</td>
</tr>
<tr>
<td>

```ts
method
```

</td>
<td>

```ts
'GET'
| 'POST'
| 'PUT'
| 'DELETE'
| 'PATCH'
```

</td>
<td>The HTTP method</td>
<td>No</td>
<td>

`'GET'`,
`'POST'` if `inputSchema` is set

</td>
<td>

```ts
'PUT'
```

</td>
</tr>
<tr>
<td>

```ts
headers
```

</td>
<td>

```ts
HeadersInit
```

</td>
<td>Request headers</td>
<td>No</td>
<td></td>
<td>

```ts
{ 'x-api-key': 'token' }
```

</td>
</tr>
<tr>
<td>

```ts
contentType
```

</td>
<td>

```ts
'application/x-www-form-urlencoded'
| 'multipart/form-data'
| 'text/plain'
| 'application/json'
```

</td>
<td>`Content-Type` header</td>
<td>No</td>
<td>

```ts
'application/json'
```

if `inputSchema` is set

</td>
<td>

```ts
'text/plain'
```

</td>
</tr>
<tr>
<td>

```ts
debug
```

</td>
<td>

```ts
boolean
```

</td>
<td>Print request, response, and errors</td>
<td>No</td>
<td>

```ts
false
```

</td>
<td>

```ts
true
```

</td>
</tr>
</table>

`kneel` takes a single object with one required parameter:

* `url`, a string

You can optionally set:

* `method`, a string
* `headers`, matching the native `fetch` headers

### Output

You can optionaly set an output schema with:

* `outputSchema`, a `zod` schema

If there is an `outputSchema`, kneel will parse the response body with `.json()`and `outputSchema.parse()`, then return it. If there is no `outputSchema`, `kneel` will return `void`.

### Input

You can optionally include a request payload with:

* `inputSchema`, a `zod` schema
* `input`, a value matching the `i` schema

The `input` will be `parse`d by the `inputSchema`. By default including `input` sets the method to `'POST'`.

#### Content Type

By default the request body will be encoded with `JSON.stringify()` and the `Content-Type` header will be set to `application/json`. You can override this with:

* `encoding`, which must be either `'application/x-www-form-urlencoded'`, `'multipart/form-data'`, `'text/plain'`, or `'application/json'`.

```ts
const inputSchema = z.object({ value: z.string() })
const response = await kneel({
  url: 'http://localhost:3000',
  input: { value: 'hello' },
  inputSchema,
  contentType: 'application/x-www-form-urlencoded',
})
```

The `contentType` becomes the value of the `Content-Type` header. `application/x-www-form-urlencoded` encodes the body with `new URLSearchParams()`. `multipart/form-data` uses `new FormData()`. `text/plain` uses `String()`.

### `KneelProps`

You can import the `KneelProps` type to match the parameters of `kneel`.

```ts
import kneel, { KneelProps } from 'kneel'
import { z, ZodSchema } from 'zod'

const fetchAndLog = async <
  RequestBody,
  InputSchema extends ZodSchema<RequestBody>,
  ResponseBody = void
>(props: KneelProps<RequestBody, InputSchema, ResponseBody>) => {
  const response = await kneel(props)
  console.log('Response:', response)
}

await fetchAndLog({
  url: 'http://localhost:3000/hello',
  outputSchema: z.literal('world')
})
// 'Response: world'
```

`KneelProps` takes three generic parameters:

<table>
<tr>
<th>Parameter</th>
<th>Extends</th>
<th>Description</th>
<th>Default</th>
<th>Example</th>
</tr>
<tr>
<td>

```ts
RequestBody
```

</td>
<td>
</td>
<td>Request body</td>
<td></td>
<td>

```ts
{ name: string }
```

</td>
</tr>
<tr>
<td>

```ts
InputSchema
```

</td>
<td>

```ts
ZodSchema<RequestBody>
```

</td>
<td>Request body schema</td>
<td></td>
<td>

```ts
ZodObject<{ name: ZodString }>
```

</td>
</tr>
<tr>
<td>

```ts
ResponseBody
```

</td>
<td>
</td>
<td>Response body</td>
<td>

```ts
void
```

</td>
<td>

```ts
{ count: number }
```

</td>
</tr>
</table>

## `kneelMaker`

You can create a `kneel` function with custom parameter middleware using `kneelMaker`.

```ts
import { kneelMaker } from 'kneel'
import { z } from 'zod'

const kneelHere = kneelMaker({
  make: ({ url, ...rest }) => {
    return { url: `http://localhost:3000${url}`, ...rest }
  }
})
const outputSchema = z.literal('world')
const response = await kneelHere({
  url: '/hello', // Request is sent to 'http://localhost:3000/hello'
  outputSchema 
})
console.log(response) // 'world' 
```

<table>
<tr>
<th>Parameter</th>
<th>Type</th>
<th>Description</th>
<th>Required</th>
<th>Default</th>
<th>Example</th>
</tr>
<tr>
<td>

```ts
make
```

</td>
<td>

```ts
<
  RequestBody,
  InputSchema extends ZodSchema<RequestBody>,
  ResponseBody = void
> (
  props: KneelProps<RequestBody, InputSchema, ResponseBody>
) => KneelProps<RequestBody, InputSchema, ResponseBody>
```

</td>
<td>Custom props callback</td>
<td>Yes</td>
<td></td>
<td>

```ts
props => {
  const { url, ...rest } = props
  const urlHere = `http://localhost:3000${url}`
  return { url: urlHere, ...rest }
}
```

</td>
</tr>
<tr>
<td>

```ts
debug
```

</td>
<td>

```ts
boolean
```

</td>
<td>Print input and output props</td>
<td>No</td>
<td>

```ts
false
```

</td>
<td>

```ts
true
```

</td>
</tr>
</table>

`kneelMaker` returns a custom function with the same parameters as `kneel`.
Each time the custom function is called, the props will be passed to the `make` callback, and the props `make` returns will be passed to `kneel`.
