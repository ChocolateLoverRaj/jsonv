/* eslint-env mocha */
import jsonv from '../lib/index'
import { strictEqual, deepStrictEqual } from 'assert'
import { transform, parser } from '@programmerraj/json-transformer'
import { Json } from '@programmerraj/json-transformer/dist/umd/json'
import fromEntries from 'object.fromentries'

const parse = (json: Json, vars: Json = {}): Json => transform(json, [
  jsonv(fromEntries(Object.entries(vars as object).map(([key, value]) => [key, parser(value)])))
])

describe('no vars', () => {
  it('boolean', () => {
    strictEqual(parse(true), true)
  })

  it('number', () => {
    strictEqual(parse(3), 3)
  })

  describe('object', () => {
    it('null', () => {
      strictEqual(parse(null), null)
    })

    it('array', () => {
      deepStrictEqual(parse([false, 0]), [false, 0])
    })

    it('object', () => {
      deepStrictEqual(parse({ a: {}, b: [] }), { a: {}, b: [] })
    })
  })
})

describe('vars', () => {
  it('given', () => {
    strictEqual(parse({ $jsonv: 'a' }, { a: true }), true)
  })

  it('declared', () => {
    deepStrictEqual(
      parse({
        $jsonv: {
          a: []
        },
        a: { $jsonv: 'a' },
        b: [{ $jsonv: 'a' }, { $jsonv: 'a' }]
      }),
      {
        a: [],
        b: [[], []]
      }
    )
  })

  it('local', () => {
    deepStrictEqual(
      parse({
        $jsonv: {
          a: 'hi'
        },
        a: { $jsonv: 'a' },
        obj1: {
          $jsonv: {
            a: 'hello'
          },
          a: { $jsonv: 'a' }
        },
        obj2: {
          a: { $jsonv: 'a' }
        }
      }),
      {
        a: 'hi',
        obj1: {
          a: 'hello'
        },
        obj2: {
          a: 'hi'
        }
      }
    )
  })

  it('Object var', () => {
    deepStrictEqual(
      parse({
        $jsonv: {
          a: { obj: true }
        },
        a: { $jsonv: 'a' },
        b: [
          { $jsonv: 'a' },
          { $jsonv: 'a' }
        ]
      }),
      {
        a: { obj: true },
        b: [{ obj: true }, { obj: true }]
      }
    )
  })
})
