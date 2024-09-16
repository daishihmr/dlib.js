import { vec2 } from "gl-matrix"

export class Mouse {
  constructor (canvas) {
    this.position = vec2.create()
    this.deltaPosition = vec2.create()
    this.beforePosition = vec2.create()

    this.down = []
    this.up = []
    for (let i = 0; i < 10; i++) {
      this.down.push({
        position: vec2.create(),
        flag: 0,
      })
      this.up.push({
        position: vec2.create(),
        flag: 0,
      })
    }

    canvas.addEventListener('mouseover', (e) => {
      this.position.set([
        e.offsetX * canvas.width / canvas.offsetWidth,
        e.offsetY * canvas.height / canvas.offsetHeight,
      ])
    })
    canvas.addEventListener('mousemove', (e) => {
      this.position.set([
        e.offsetX * canvas.width / canvas.offsetWidth,
        e.offsetY * canvas.height / canvas.offsetHeight,
      ])
    })
    canvas.addEventListener('mouseleave', (e) => {
      this.position.set([
        e.offsetX * canvas.width / canvas.offsetWidth,
        e.offsetY * canvas.height / canvas.offsetHeight,
      ])
    })
    canvas.addEventListener('mousedown', (e) => {
      const down = this.down[e.button]
      down.position.set([
        e.offsetX * canvas.width / canvas.offsetWidth,
        e.offsetY * canvas.height / canvas.offsetHeight,
      ])
      down.flag = 1

      this.up[e.button].flag = 0
    })
    canvas.addEventListener('mouseup', (e) => {
      const up = this.up[e.button]
      up.position.set([
        e.offsetX * canvas.width / canvas.offsetWidth,
        e.offsetY * canvas.height / canvas.offsetHeight,
      ])
      up.flag = 1

      this.down[e.button].flag = 0
    })
    canvas.addEventListener('wheel', (e) => {

    })
  }

  isDown (buttonIndex = 0) {
    return this.down[buttonIndex].flag === 1
  }
  isPress (buttonIndex = 0) {
    return this.down[buttonIndex].flag === 2
  }
  isUp (buttonIndex = 0) {
    return this.up[buttonIndex].flag === 1
  }

  get x () {
    return this.position[0]
  }
  set x (value) {
    this.position[0] = value
  }

  get y () {
    return this.position[1]
  }
  set y (value) {
    this.position[1] = value
  }

  update (game) {
    vec2.sub(this.deltaPosition, this.position, this.beforePosition)

    this.down.forEach((down, button) => {
      if (down.flag === 1) {
        game.fire('mousedown', { button, position: down.position })
      }
    })
    this.up.forEach((up, button) => {
      if (up.flag === 1) {
        game.fire('mouseup', { button, position: up.position })
      }
    })
  }

  lateUpdate () {
    vec2.copy(this.beforePosition, this.position)
    this.down.forEach((down) => {
      if (down.flag === 1) {
        down.flag = 2
      }
    })
    this.up.forEach((up) => {
      if (up.flag === 1) {
        up.flag = 2
      }
    })
  }
}
