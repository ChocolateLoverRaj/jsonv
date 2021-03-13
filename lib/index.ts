import { Visitor } from '@programmerraj/json-transformer/dist/umd/visitor'
import { Node, ObjectEntryNode, ObjectNode, StringNode } from '@programmerraj/json-transformer/dist/umd/node'
import never from 'never'
import { traverse } from '@programmerraj/json-transformer'

interface Vars {
  [key: string]: Node
}

const jsonv = (givenVars: Vars = {}): Visitor => {
  const vars = { ...givenVars }
  let topLevel = true
  return {
    Object: {
      enter: path => {
        const handleSubObjects = (): void => {
          if (!topLevel) {
            traverse(path.node, jsonv(vars), path)
            path.skipChildren = true
          } else {
            topLevel = false
          }
        }
        if ((path.node as ObjectNode).entries.length === 1) {
          const [{ key, value }] = (path.node as ObjectNode).entries
          if (key === '$jsonv') {
            const name = (value as StringNode).value
            path.replace(vars[name] ?? never(`No variable with name: '${name}'`))
            path.skipChildren = true
          } else {
            handleSubObjects()
          }
        } else {
          handleSubObjects()
        }
      }
    },
    ObjectEntry: {
      enter: path => {
        const { key, value } = path.node as ObjectEntryNode
        if (key === '$jsonv') {
          traverse(value, {
            ObjectEntry: {
              enter: path => {
                const { key, value } = path.node as ObjectEntryNode
                vars[key] = traverse(value, jsonv(vars), path).node
                path.skipChildren = true
              }
            }
          }, path)
          path.remove()
        }
      }
    }
  }
}

export default jsonv
