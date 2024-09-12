export class Mouse {
  constructor (canvas) {
    this.position = [0, 0]
    this.down = [null, null, null, null, null]
    this.up = [null, null, null, null, null]
    canvas.addEventListener('mouseover', (e) => {
      this.x = e.offsetX * canvas.width / canvas.offsetWidth
      this.y = e.offsetY * canvas.height / canvas.offsetHeight
    })
    canvas.addEventListener('mousemove', (e) => {
      this.x = e.offsetX * canvas.width / canvas.offsetWidth
      this.y = e.offsetY * canvas.height / canvas.offsetHeight
    })
    canvas.addEventListener('mouseleave', (e) => {
      this.x = e.offsetX * canvas.width / canvas.offsetWidth
      this.y = e.offsetY * canvas.height / canvas.offsetHeight
    })
    canvas.addEventListener('mousedown', (e) => {
      this.down[e.button] = {
        x: e.offsetX * canvas.width / canvas.offsetWidth,
        y: e.offsetY * canvas.height / canvas.offsetHeight,
      }
    })
    canvas.addEventListener('mouseup', (e) => {
      this.up[e.button] = {
        x: e.offsetX * canvas.width / canvas.offsetWidth,
        y: e.offsetY * canvas.height / canvas.offsetHeight,
      }
    })
    canvas.addEventListener('wheel', (e) => {

    })
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
    this.down.forEach((down, button) => {
      if (down) {
        game.fire('mousedown', { button, x: down.x, y: down.y })
        this.down[button] = null
      }
    })
    this.up.forEach((up, button) => {
      if (up) {
        game.fire('mouseup', { button, x: up.x, y: up.y })
        this.up[button] = null
      }
    })
  }
}