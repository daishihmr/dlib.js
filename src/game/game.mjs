export class Game {
  constructor () {
    this.currentScene = null
    this._running = false
    this.time = 0
    this.deltaTime = 0
  }

  start () {
    this._running = true
    this.time = Date.now()
    this.deltaTime = 0
    this._tick()
  }

  stop () {
    this._running = false
  }

  _tick () {
    if (this._running) {
      this.deltaTime = Date.now() - this.time
      this.time += this.deltaTime
      if (this.currentScene) this.currentScene._update({ game: this })
      requestAnimationFrame(() => this._tick())
    }
  }

  switchScene (scene) {
    this.currentScene = scene
  }
}
