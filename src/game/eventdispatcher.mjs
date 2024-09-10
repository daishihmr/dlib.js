export class EventDispatcher {
  constructor () {
    this.handlers = {}
  }

  on (eventType, listener) {
    if (this.handlers[eventType] === undefined) {
      this.handlers[eventType] = []
    }

    this.handlers[eventType].push(listener)

    return this
  }

  addEventListener (...args) {
    return this.on(...args)
  }

  off (eventType, listener) {
    if (this.handlers[eventType]) {
      const index = this.handlers[eventType].indexOf(listener)
      if (index >= 0) {
        this.handlers[eventType].splice(index, 1)
      }
    }

    return this
  }

  removeEventListener (...args) {
    return this.off(args)
  }

  once (eventType, listener) {
    const w = () => {
      listener()
      this.off(eventType, w)
    }
    return this.on(eventType, w)
  }

  clearEventListener (eventType) {
    this.handlers[eventType] = []
    return this
  }

  fire (eventType, params) {
    if (this.handlers[eventType]) {
      this.handlers[eventType].forEach(_ => _(params))
    }

    return this
  }
}
