import { Visitor } from '@programmerraj/json-transformer/dist/umd/visitor'
import last from 'last-element'
import { Node, ObjectEntryNode, ObjectNode, StringNode } from '@programmerraj/json-transformer/dist/umd/node'

enum ObjectTypes {
  DECLARATION,
  REFERENCE,
  NONE,
  VARS
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
          if (last(objectTypes) === ObjectTypes.DECLARATION) {
            scopes.push({})
          }
          objectTypes.push(last(objectTypes) === ObjectTypes.DECLARATION
            ? ObjectTypes.VARS
            : ObjectTypes.NONE
          )
          multipleKeys = path.node.entries.length > 1
        }
      },
      exit: path => {
        switch (last(objectTypes)) {
          case ObjectTypes.REFERENCE:
            path.replace(getVar(((path.node as ObjectNode).entries[0].value as StringNode).value))
            break
        }
        objectTypes.pop()
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
        const { key, value } = path.node as ObjectEntryNode
        switch (last(objectTypes)) {
          case ObjectTypes.VARS:
            last(scopes)[key] = value
            // console.log('Var', path.node)
            break
          case ObjectTypes.DECLARATION:
            // console.log(path.node)
            objectTypes[objectTypes.length - 1] = ObjectTypes.NONE
            path.remove()
            break
        }
      }
    }
  }
}

export default jsonv
