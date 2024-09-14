import { vec2 } from "gl-matrix"

export class Bounds {
  constructor () {
    this.enable = false
    this.center = vec2.create()
  }

  get centerX () {
    return this.center[0]
  }
  set centerX (value) {
    this.center[0] = value
  }
  get centerY () {
    return this.center[1]
  }
  set centerY (value) {
    this.center[1] = value
  }

  contains (point) {
    return false
  }
}
