import { EventDispatcher } from "../game/eventdispatcher.mjs";
import { Ease } from "./Ease.mjs";

export class Tween extends EventDispatcher {
  constructor (
    target,
    toValues,
    {
      duration,
      delay = 0,
      ease = Ease.None,
    }
  ) {
    super()
    
    this.target = target
    this.toValues = toValues
    this.duration = duration

    if (typeof(ease) === 'function') {
      this.ease = ease
    } else {
      this.ease = Ease.funcs[ease]
    }
    
    this.keys = Object.keys(this.toValues)
    this.fromValues = {}
    this.deltas = {}

    this.time = -delay
    this.paused = false
    this.started = false
    this.ended = false
  }

  resetFromValues () {
    this.keys.map((key) => {
      this.fromValues[key] = this.target[key]
      this.deltas[key] = this.toValues[key] - this.fromValues[key]
    })
  }

  update ({ deltaTime }) {
    if (this.ended) return

    if (!this.paused) {
      this.time += deltaTime
      if (this.time >= 0 && !this.started) {
        this.resetFromValues()
        this.fire('start')
        this.started = true
      }
    }

    if (this.time < 0) return

    const t = Math.max(0, this.time) / this.duration
    if (t < 1.0) {
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
      this.ended = true
    }
  }

  pause () {
    this.paused = true
  }
  resume () {
    this.paused = false
  }
  kill () {
    this.fire('complete')
    this.ended = true
  }
}
