import { EventDispatcher } from "../game/eventdispatcher.mjs";

export class Tween extends EventDispatcher {
  constructor (
    target,
    fromValues,
    toValues,
    startTime,
    duration,
    ease
  ) {
    super()
    
    this.target = target
    this.fromValues = fromValues
    this.toValues = toValues
    this.startTime = startTime
    this.duration = duration
    this.ease = ease
    
    this.keys = Object.keys(this.fromValues)
    this.deltas = {}
    this.keys.map((key) => {
      this.deltas[key] = toValues[key] - fromValues[key]
    })

    this.time = 0
    this.paused = false
  }

  update ({ deltaTime }) {
    if (!this.paused) {
      this.time += deltaTime
    }
    const t = (this.time - this.startTime) / this.duration
    if (t < 1) {
      const v = this.ease(t)
      this.keys.forEach((key) => {
        const delta = this.deltas[key]
        this.target[key] = this.fromValues[key] + delta * v
      })
    } else {
      this.keys.forEach((key) => {
        this.target[key] = this.toValues[key]
      })
      this.fire('complete')
    }
  }

  pause () {
    this.paused = true
  }
  resume () {
    this.paused = false
  }
}
