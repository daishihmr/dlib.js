import { vec2 } from "gl-matrix"

const Q = Math.sin(45 * Math.PI / 180)

export class Keyboard {
  constructor () {
    this.keys = {}
    this.shiftKey = false
    this.ctrlKey = false
    this.altKey = false
    this.metaKey = false
    this.direction = vec2.create()

    document.addEventListener('keydown', (e) => {
      if (!e.repeat) {
        this.keys[e.code] = 1
        this.shiftKey = e.shiftKey
        this.ctrlKey = e.ctrlKey
        this.altKey = e.altKey
        this.metaKey = e.metaKey
      }
    })
    document.addEventListener('keyup', (e) => {
      this.keys[e.code] = 3
      this.shiftKey = e.shiftKey
      this.ctrlKey = e.ctrlKey
      this.altKey = e.altKey
      this.metaKey = e.metaKey
    })
  }

  update (game) {
    Object.keys(this.keys).forEach((code) => {
      if (this.keys[code] === 1) {
        game.fire('keydown', { code })
      } else if (this.keys[code] === 3) {
        game.fire('keyup', { code })
      }
    })
  }

  lateUpdate () {
    Object.keys(this.keys).forEach((code) => {
      if (this.keys[code] === 1) {
        this.keys[code] = 2
      } else if (this.keys[code] === 3) {
        this.keys[code] = 0
      }
    })
  }

  isDown (code) {
    return this.keys[code] === 1
  }
  isPress (code) {
    return this.keys[code] === 2
  }
  isUp (code) {
    return this.keys[code] === 3
  }

  getDirection () {
    if (this.isPress('KeyA') && this.isPress('KeyW')) {
      return vec2.set(this.direction, -Q, -Q)
    } else if (this.isPress('KeyD') && this.isPress('KeyW')) {
      return vec2.set(this.direction, Q, -Q)
    } else if (this.isPress('KeyD') && this.isPress('KeyS')) {
      return vec2.set(this.direction, Q, Q)
    } else if (this.isPress('KeyA') && this.isPress('KeyS')) {
      return vec2.set(this.direction, -Q, Q)
    } else if (this.isPress('KeyA')) {
      return vec2.set(this.direction, -1, 0)
    } else if (this.isPress('KeyD')) {
      return vec2.set(this.direction, 1, 0)
    } else if (this.isPress('KeyW')) {
      return vec2.set(this.direction, 0, -1)
    } else if (this.isPress('KeyS')) {
      return vec2.set(this.direction, 0, 1)
    } else {
      return vec2.set(this.direction, 0, 0)
    }
  }
}
