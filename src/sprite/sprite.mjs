import { DrawableNode } from "../game/drawablenode.mjs"

export class Sprite extends DrawableNode {
  constructor ({ image, sx, sy, sw, sh, width, height }) {
    super()
    this.image = image
    this.sx = sx || 0
    this.sy = sy || 0
    this.sw = sw || image.width
    this.sh = sh || image.height
    this.width = width || image.width || 100
    this.height = height || image.height || 100
  }

  draw ({ context }) {
    context.drawImage(this.image, this.sx, this.sy, this.sw, this.sh, -this.width / 2, -this.height / 2, this.width, this.height)
  }
}
