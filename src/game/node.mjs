import { EventDispatcher } from "./eventdispatcher.mjs"

export class Node extends EventDispatcher {
  constructor () {
    super()
    this.parent = null
    this.children = []
  }

  _update (params) {
    this.update(params)
    this.fire('update', params)
    this.children.forEach((c) => {
      c._update(params)
    })
  }

  update (params) {}

  addChild (node) {
    this.children.push(node)
    node.parent = this
  }

  removeChild (node) {
    const index = this.children.indexOf(node)
    if (index < 0) {
      return
    }
    this.children(index, 1)
    node.parent = null
  }

  addChildTo (parent) {
    parent.addChild(this)
    return this
  }

  remove () {
    if (this.parent) {
      this.parent.removeChild(this)
    }
    return this
  }

}
