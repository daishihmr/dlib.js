export class Atlas {
  constructor ({ spec, image }) {
    this.spec = spec
    this.image = image
  }

  get (frameName) {
    return this.spec.frames[frameName]
  }
}
