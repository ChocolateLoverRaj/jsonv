import fromEntries from 'object.fromentries'

export interface JsonObject {
  [key: string]: Json
}

export type Json = boolean | number | null | JsonObject | Json[] | string

export interface JsonvObject {
  [key: string]: Jsonv
}

export interface JsonvObjectWithVars extends JsonvObject {
  $jsonv: JsonObject | string
}

export type Jsonv = boolean | number | null | JsonvObject | JsonvObjectWithVars | Jsonv[] | string

export const parse = (jsonv: Jsonv, vars: JsonObject = {}): Json => {
  if (typeof jsonv === 'object') {
    if (jsonv === null) {
      return jsonv
    } else if (jsonv instanceof Array) {
      return jsonv.map(jsonv => parse(jsonv, vars))
    } else {
      const localVars = jsonv.$jsonv
      if (typeof localVars === 'string') {
        // Here localVars is not actually vars, it is a reference to a variable
        const value = vars[localVars]
        if (value === undefined) throw new Error('No value for var')
        return value
      } else {
        if (
          localVars !== undefined && (
            typeof localVars !== 'object' ||
          localVars instanceof Array
          )
        ) {
          throw new Error('Local vars must be an object or undefined')
        }
        const accessibleVars = { ...vars, ...localVars }
        const parsedObj = fromEntries(Object.entries(jsonv)
          .filter(([key]) => key !== '$jsonv')
          .map(([key, jsonv]) => [key, parse(jsonv, accessibleVars)])
        )
        return parsedObj
      }
    }
  } else {
    return jsonv
  }
}
