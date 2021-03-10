import { Visitor } from '@programmerraj/json-transformer/dist/umd/visitor'
import last from 'last-element'
import { Node, ObjectEntryNode, ObjectNode, StringNode } from '@programmerraj/json-transformer/dist/umd/node'
import fromEntries from 'object.fromentries'

enum ObjectTypes {
  DECLARATION,
  REFERENCE,
  NONE
}

interface Vars {
  [key: string]: Node
}

const jsonv = (vars: Vars = {}): Visitor => {
  const scopes: Vars[] = [vars]
  const objectTypes: ObjectTypes[] = []
  let multipleKeys = false

  const getVar = (name: string): Node => {
    for (const vars of scopes.reverse()) {
      if (vars[name] !== undefined) return vars[name]
    }
    throw new Error(`No variable with name: ${name}`)
  }

  return {
    Object: {
      enter: path => {
        if (path.node.type === 'Object') {
          // if (last(objectTypes) !== ObjectTypes.DECLARATION) {
          objectTypes.push(ObjectTypes.NONE)
          // }
          multipleKeys = path.node.entries.length > 1
        }
      },
      exit: path => {
        switch (last(objectTypes)) {
          case ObjectTypes.DECLARATION:
            /* path.remove() */
            break
          case ObjectTypes.REFERENCE:
            path.replace(getVar(((path.node as ObjectNode).entries[0].value as StringNode).value))
            console.log('replaced node', path.node)
            objectTypes.pop()
            break
          default:
            objectTypes.pop()
        }
      }
    },
    ObjectEntry: {
      enter: path => {
        if (path.node.type === 'ObjectEntry' && path.node.key === '$jsonv') {
          switch (path.node.value.type) {
            case 'Object':
              objectTypes[objectTypes.length - 1] = ObjectTypes.DECLARATION
              break
            case 'String':
              if (multipleKeys) throw new Error('When $jsonv is used as a string, no other properties are allowed')
              objectTypes[objectTypes.length - 1] = ObjectTypes.REFERENCE
              break
            default:
              throw new Error('Unrecognized $jsonv value')
          }
        }
      },
      exit: path => {
        console.log(objectTypes)
        switch (last(objectTypes)) {
          case ObjectTypes.DECLARATION:
            // console.log((path.node as ObjectEntryNode).value)
            scopes.push(fromEntries(((path.node as ObjectEntryNode).value as ObjectNode).entries.map(({ key, value }) => [key, value])))
            objectTypes.pop()
            path.remove()
            break
        }
      }
    }
  }
}

export default jsonv
