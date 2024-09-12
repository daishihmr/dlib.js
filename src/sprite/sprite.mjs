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
  }

  draw ({ game }) {
    if (this.image) {
      game.context.drawImage(
        this.image,
        this.sx,
        this.sy,
        this.sw,
        this.sh,
        -this.width / 2,
        -this.height / 2,
        this.width,
        this.height
      )
    }
  }

  hit (x, y) {

  }
}
