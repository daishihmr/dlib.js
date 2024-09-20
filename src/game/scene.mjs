import { mat2d } from 'gl-matrix'
import { EventDispatcher } from './eventdispatcher.mjs'

export class Scene extends EventDispatcher {
  constructor () {
    super()
    this.gameObjects = []
    this.rootMatrix = mat2d.create()
  }

  update (params) {
    this.fire('update', params)

    Array.from(this.gameObjects).forEach((node) => {
      if (node.active) {
        node._update(params)

        // rootに直接配置されているノードのみtransformを再計算
        if (!node.transform.parent) {
          node.transform.update(this.rootMatrix)
        }

        if (node.visible && node._draw) {
          node._draw(params)
        }
      }
    })
  }

  add (node) {
    this.gameObjects.push(node)
  }

  remove (node) {
    const index = this.gameObjects.indexOf(node)
    if (index >= 0) {
      this.gameObjects.splice(index, 1)
    }
  }
}
