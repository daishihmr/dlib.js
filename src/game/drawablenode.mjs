import { Node } from './node.mjs'

export class DrawableNode extends Node {
  constructor () {
    super()
    this.visible = true
  }

  _draw (params) {
    const context = params.context
    const m = this.transform._matrix
    context.setTransform(m[0], m[1], m[2], m[3], m[4], m[5])
    this.draw(params)
    this.fire('draw', params)
  }

  draw (params) {}
}
