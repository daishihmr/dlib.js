import { Ease } from "./Ease.mjs"
import { Tween } from "./Tween.mjs"

export class Anim {
  constructor (game) {
    this.game = game
  }

  to (target, toValues, { duration, delay = 0, ease = Ease.None, onStart, onComplete }) {
    return new Promise((resolve) => {
      const tween = new Tween(
        target,
        toValues,
        {
          duration,
          delay,
          ease,
        }
      )
      if (onStart) {
        tween.on('start', onStart)
      }
      if (onComplete) {
        tween.on('complete', onComplete)
      }
  
      tween.on('complete', () => {
        const index = this.game.tweens.indexOf(tween)
        if (index >= 0) {
          this.game.tweens.splice(index, 1)
        }
        resolve(tween)
      })
      
      this.game.tweens.push(tween)
    })
  }
}
