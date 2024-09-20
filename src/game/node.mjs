import { EventDispatcher } from "./eventdispatcher.mjs"
import { Transform } from './transform.mjs'

export class Node extends EventDispatcher {
  constructor () {
    super()
    this.active = true
    this.transform = new Transform(this)
    this.bounds = null
  }

  _update (params) {
    this.update(params)
    this.fire('update', params)
  }
  update (params) {}

  hit (globalPoint) {
    if (!this.bounds) return false

    const point = this.transform.globalToLocal(globalPoint)
    return this.bounds.contains(point)
  }

  get x () {
    return this.transform.x
  }
  set x (value) {
    this.transform.x = value
  }
  get y () {
    return this.transform.y
  }
  set y (value) {
    this.transform.y = value
  }
  get rotation () {
    return this.transform.rotation
  }
  set rotation (value) {
    this.transform.rotation = value
  }
  get scaleX () {
    return this.transform.scaleX
  }
  set scaleX (value) {
    this.transform.scaleX = value
  }
  get scaleY () {
    return this.transform.scaleY
  }
  set scaleY (value) {
    this.transform.scaleY = value
  }

  addChild (child) {
    this.transform.addChild(child)
  }
  removeChild (child) {
    this.transform.removeChild(child)
  }
  get parent () {
    return this.transform.parent?.gameObject
  }
  get children () {
    return this.transform.children.map(_ => _.gameObject)
  }

}
