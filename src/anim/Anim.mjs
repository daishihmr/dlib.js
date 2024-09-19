import { Ease } from "./Ease.mjs"
import { Tween } from "./Tween.mjs"

export class Anim {
  constructor (game) {
    this.game = game
  }

  fromTo (target, fromValues, toValues, duration, ease = Ease.None) {
    const tween = new Tween(
      target,
      fromValues,
      toValues,
      this.game.time,
      duration,
      ease,
    )
    tween.on('complete', () => {
      const index = this.game.tweens.indexOf(tween)
      if (index >= 0) this.game.tweens.splice(index, 1)
    })
    this.game.tweens.push(tween)
    return tween
  }

  from (target, fromValues, duration, ease = Ease.None) {
    const toValues = {}
    Object.keys(toValues).forEach((key) => {
      toValues[key] = target[key]
    })
    return this.fromTo(fromValues, toValues, duration, ease)
  }

  to (target, toValues, duration, ease = Ease.None) {
    const fromValues = {}
    Object.keys(toValues).forEach((key) => {
      fromValues[key] = target[key]
    })
    return this.fromTo(fromValues, toValues, duration, ease)
  }
}
