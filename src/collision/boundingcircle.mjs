import { vec2 } from "gl-matrix";
import { Bounds } from "./bounds.mjs";

export class BoundingCircle extends Bounds {
  constructor () {
    super()
    this.radius = 0
    this.origin = vec2.create()
  }

  contains (point) {
    if (!this.enable) return false
    if (this.radius === 0) return false
    return vec2.squaredDistance(this.origin, point) <= this.radius * this.radius
  }
}
