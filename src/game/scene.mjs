import { mat2d } from 'gl-matrix'
import { EventDispatcher } from './eventdispatcher.mjs'

export class Scene extends EventDispatcher {
  constructor () {
    super()
    this.gameObjects = []
    this.gameObjectMap = {}
    this.rootMatrix = mat2d.create()
  }

  update (params) {
    this.fire('update', params)

    Array.from(this.gameObjects).forEach((obj) => {
      if (obj.active) {
        obj._update(params)

        // rootに直接配置されているオブジェクトのみtransformを再計算
        if (!obj.transform.parent) {
          obj.transform.update(this.rootMatrix)
        }
      }
    })
    Array.from(this.gameObjects).sort((lhs, rhs) => lhs.zOrder - rhs.zOrder).forEach((obj) => {
      if (obj.visible && obj._draw) {
        obj._draw(params)
      }
    })
  }

  add (gameObject, name) {
    this.gameObjects.push(gameObject)
    if (name) {
      gameObject.name = name
      this.gameObjectMap[name] = gameObject
    }
  }

  remove (gameObject) {
    const index = this.gameObjects.indexOf(gameObject)
    if (index >= 0) {
      this.gameObjects.splice(index, 1)
    }
    if (gameObject.name) {
      this.gameObjectMap[gameObject.name] = null
    }
  }

  get (name) {
    return this.gameObjectMap[name]
  }
}
