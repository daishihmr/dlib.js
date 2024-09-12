import { Node } from "./node.mjs";

export class Scene extends Node {
  constructor () {
    super()
  }

  _update (params) {
    this.update(params)
    this.fire('update', params)
    this.children.forEach((c) => {
      c._update(params)
      if (c._draw) c._draw(params)
    })
  }
}
