import { EventDispatcher } from "../game/eventdispatcher.mjs"

export class Sound extends EventDispatcher {
  static context = new AudioContext()

  constructor (audiobuffer) {
    super()
    this.source = null
    this.audiobuffer = audiobuffer
    this.gainNode = new GainNode(Sound.context)
    this.gainNode.connect(Sound.context.destination)
  }

  createNewSource () {
    this.source = new AudioBufferSourceNode(Sound.context)
    this.source.connect(this.gainNode)
    this.source.buffer = this.audiobuffer
    this.source.addEventListener('ended', (e) => {
      this.fire('ended', e)
      this.source.disconnect()
      this.source = null
    })
    return this.source
  }

  start ({ when, offset, duration, loop = false, loopStart = 0, loopEnd = 0 }) {
    const source = this.createNewSource()
    source.loop = loop
    source.loopStart = loopStart
    source.loopEnd = loopEnd
    if (duration) {
      source.start(when, offset, duration)
    } else {
      source.start(when, offset)
    }
  }
  stop () {
    if (this.source) this.source.stop()
  }

  get volume () {
    return this.gainNode.gain.value
  }
  set volume (value) {
    this.gainNode.gain.value = value
  }
}
