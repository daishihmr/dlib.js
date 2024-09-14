import { vec2 } from "gl-matrix";
import { Bounds } from "./bounds.mjs";

export class BoundingRect extends Bounds {
  constructor () {
    super()
    this.size = vec2.create()
  }

  get width () {
    return this.size[0]
  }
  set width (value) {
    this.size[0] = value
  }
  get height () {
    return this.size[1]
  }
  set height (value) {
    this.size[1] = value
  }

  contains (point) {
    if (!this.enable) return false
    if (this.size[0] === 0 || this.size[1] === 0) return false
    return this.center[0] + this.size * -0.5 <= point[0] &&
      point[0] < this.center[0] + this.size * 0.5 &&
      this.center[1] + this.size * -0.5 <= point[1] &&
      point[1] < this.center[1] + this.size * 0.5
  }
  
}
