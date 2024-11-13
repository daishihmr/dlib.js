import { vec2 } from "gl-matrix"
import { DrawableNode } from "../game/drawablenode.mjs"

export class Sprite extends DrawableNode {
  constructor ({ image, sx, sy, sw, sh, dx, dy, dw, dh, width, height, atlas, px, py }) {
    super()
    this.image = atlas ? atlas.image : image
    this.sx = sx || 0
    this.sy = sy || 0
    this.sw = sw || (image ? image.width : 0)
    this.sh = sh || (image ? image.height : 0)
    this.dx = dx || 0
    this.dy = dy || 0
    this.dw = dw || (image ? image.width : 0)
    this.dh = dh || (image ? image.height : 0)
    this.px = px || 0
    this.py = py || 0
    this.width = width || (image ? image.width : 100)
    this.height = height || (image ? image.height : 100)
    this.origin = vec2.fromValues(0.5, 0.5)
    this.atlas = atlas
    this.frameName = null
    this.rotated = false
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

  get frame () {
    return this.frameName
  }
  set frame (value) {
    this.setFrame(value)
  }

  draw ({ context }) {
    if (this.image) {
      if (this.rotated) {
        context.save()
        context.rotate(-90 * Math.PI / 180)
        try {
          context.drawImage(
            this.image,
            this.sx,
            this.sy,
            this.sh,
            this.sw,
            this.height * -this.origin[1] + this.dy,
            this.width * -this.origin[0] + this.dx,
            this.dh,
            this.dw,
          )
        } finally {
          context.restore()
        }
      } else {
        context.drawImage(
          this.image,
          this.sx,
          this.sy,
          this.sw,
          this.sh,
          this.width * -this.origin[0] + this.dx,
          this.height * -this.origin[1] + this.dy,
          this.dw,
          this.dh
        )
      }
    }
  }

  setFrame (frameName) {
    this.frameName = frameName
    if (!this.atlas) return

    const frame = this.atlas.get(this.frameName)
    this.sx = frame.frame.x
    this.sy = frame.frame.y
    this.sw = frame.frame.w
    this.sh = frame.frame.h
    this.dx = frame.spriteSourceSize.x
    this.dy = frame.spriteSourceSize.y
    this.dw = frame.spriteSourceSize.w
    this.dh = frame.spriteSourceSize.h
    this.px = frame.pivot.x
    this.py = frame.pivot.y
    this.width = frame.sourceSize.w
    this.height = frame.sourceSize.h
    this.rotated = frame.rotated
  }

}
