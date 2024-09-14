import { vec2 } from "gl-matrix"
import { DrawableNode } from "../game/drawablenode.mjs"

export class Sprite extends DrawableNode {
  constructor ({ image, sx, sy, sw, sh, width, height }) {
    super()
    this.image = image
    this.sx = sx || 0
    this.sy = sy || 0
    this.sw = sw || (image ? image.width : 0)
    this.sh = sh || (image ? image.height : 0)
    this.width = width || (image ? image.width : 100)
    this.height = height || (image ? image.height : 100)
    this.interactive = false
    this.origin = vec2.fromValues(0.5, 0.5)
  }

  get originX () {
    return this.origin[0]
  }
  set originX (value) {
    this.origin[0] = value
  }
  get originY () {
    return this.origin[1]
  }
  set originY (value) {
    this.origin[1] = value
  }

  draw ({ context }) {
    if (this.image) {
      context.drawImage(
        this.image,
        this.sx,
        this.sy,
        this.sw,
        this.sh,
        this.width * this.origin[0] * -0.5,
        this.height * this.origin[1] * -0.5,
        this.width,
        this.height
      )
    }
  }

  hit (point) {

  }
}
