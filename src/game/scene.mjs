import { Node } from "./node.mjs";

export class Scene extends Node {
  constructor (canvas) {
    super()
    this.canvas = canvas
    this.context = canvas.getContext('2d')
    this.background = 'transparent'
  }

  get background () {
    return this.canvas.style.backgroundColor
  }
  set background (value) {
    this.canvas.style.backgroundColor = value
  }

  get width () {
    return this.canvas.width
  }
  set width (value) {
    this.canvas.width = value
  }

  get height () {
    return this.canvas.height
  }
  set height (value) {
    this.canvas.height = value
  }

  _update (params) {
    params.canvas = this.canvas
    params.context = this.context

    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height)

    this.update(params)
    this.fire('update', params)
    this.children.forEach((c) => {
      c._update(params)
      if (c._draw) c._draw(params)
    })
  }
}
