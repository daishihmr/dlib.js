import { EventDispatcher } from './eventdispatcher.mjs'
import { Keyboard } from './keyboard.mjs'
import { Mouse } from "./mouse.mjs"

export class Game extends EventDispatcher {
  constructor (canvas) {
    super()

    this.canvas = canvas
    this.context = canvas.getContext('2d')
    this.background = 'transparent'

    this.mouse = new Mouse(canvas)
    this.keyboard = new Keyboard()

    this.currentScene = null
    this._running = false
    this.time = 0
    this.deltaTime = 0
  }

  get background () {
    return this.canvas.style.backgroundColor
  }
  set background (value) {
    this.canvas.style.backgroundColor = value
  }

  get width () {
    return this.canvas.width
  }
  set width (value) {
    this.canvas.width = value
  }

  get height () {
    return this.canvas.height
  }
  set height (value) {
    this.canvas.height = value
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

  fitWindow () {
    const fit = () => {
      this.canvas.style.position = 'absolute'
      const aspect = this.canvas.width / this.canvas.height
      const windowAspect = window.innerWidth / window.innerHeight
      if (aspect <= windowAspect) {
        const w = window.innerHeight * aspect
        this.canvas.style.width = Math.floor(w) + 'px'
        this.canvas.style.height = Math.floor(window.innerHeight) + 'px'
        this.canvas.style.left = Math.floor((window.innerWidth - w) * 0.5) + 'px'
        this.canvas.style.top = '0px'
      } else {
        const h = window.innerWidth / aspect
        this.canvas.style.width = Math.floor(window.innerWidth) + 'px'
        this.canvas.style.height = Math.floor(h) + 'px'
        this.canvas.style.left = '0px'
        this.canvas.style.top = Math.floor((window.innerHeight - h) * 0.5) + 'px'
      }
    }
    fit()
    window.addEventListener('resize', fit)
  }

  _tick () {
    this.mouse.update(this)
    this.keyboard.update(this)

    if (this._running) {
      this.deltaTime = Date.now() - this.time
      this.time += this.deltaTime

      this.context.resetTransform()
      this.context.clearRect(0, 0, this.width, this.height)

      const params = {
        game: this,
        deltaTime: this.deltaTime,
        time: this.time,
        canvas: this.canvas,
        context: this.context,
        mouse: this.mouse,
        keyboard: this.keyboard,
      }

      if (this.currentScene) {
        this.currentScene.update(params)
      }
      this.fire('update', params)
      requestAnimationFrame(() => this._tick())
    }

    this.mouse.lateUpdate()
    this.keyboard.lateUpdate()
  }

  switchScene (scene) {
    this.currentScene = scene
  }
}
