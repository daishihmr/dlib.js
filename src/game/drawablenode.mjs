import { Node } from './node.mjs'

export class DrawableNode extends Node {
  constructor () {
    super()
    this.position = [0, 0]
    this.rotation = 0
    this.scale = [1, 1]
  }

  get x () {
    return this.position[0]
  }
  set x (value) {
    this.position[0] = value
  }

  get y () {
    return this.position[1]
  }
  set y (value) {
    this.position[1] = value
  }

  get scaleX () {
    return this.scale[0]
  }
  set scaleX (value) {
    this.scale[0] = value
  }

  get scaleY () {
    return this.scale[1]
  }
  set scaleY (value) {
    this.scale[1] = value
  }

  _update (params) {
    this.update(params)
    this.fire('update', params)
    this.children.forEach((c) => {
      c._update(params)
    })
  }

  _draw (params) {
    const context = params.context
    context.save()
    context.translate(this.position[0], this.position[1])
    context.rotate(this.rotation)
    context.scale(this.scale[0], this.scale[1])
    this.draw(params)
    this.children.forEach((c) => {
      if (c._draw) c._draw(params)
    })
    context.restore()
  }

  draw ({ canvas, context }) {}
}
