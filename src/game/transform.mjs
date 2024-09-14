import { vec2, mat2d } from 'gl-matrix'

export class Transform {
  constructor () {
    this._position = vec2.fromValues(0, 0)
    this._rotation = 0
    this._scale = vec2.fromValues(1, 1)
    this._dirty = true
    this._matrix = mat2d.create()
    this._invMatrix = mat2d.create()

    this.parent = null
    this.children = []
  }

  update (parentMatrix) {
    mat2d.copy(this._matrix, parentMatrix)
    mat2d.translate(this._matrix, this._matrix, this._position)
    mat2d.rotate(this._matrix, this._matrix, this.rotation)
    mat2d.scale(this._matrix, this._matrix, this._scale)
    this.children.forEach((child) => {
      child.update(this._matrix)
    })
  }

  get matrix () {
    if (this.parent) {
      mat2d.copy(this._matrix, this.parent._matrix)
    } else {
      mat2d.identity(this._matrix)
    }

    mat2d.translate(this._matrix, this._matrix, this._position)
    mat2d.rotate(this._matrix, this._matrix, this.rotation)
    mat2d.scale(this._matrix, this._matrix, this._scale)

    return this._matrix
  }

  globalToLocal (point, refreshMatrix = false) {
    const ret = vec2.create()
    if (refreshMatrix) {
      mat2d.invert(this._invMatrix, this.matrix)
    } else {
      mat2d.invert(this._invMatrix, this._matrix)
    }
    vec2.transformMat2d(ret, point, this._invMatrix)
    return ret
  }

  localToGlobal (point, refreshMatrix = false) {
    const ret = vec2.create()
    if (refreshMatrix) {
      vec2.transformMat2d(ret, point, this.matrix)
    } else {
      vec2.transformMat2d(ret, point, this._matrix)
    }
    return ret
  }

  addChild (child) {
    this.children.push(child)
    child.parent = this
  }
  addChildTo (parent) {
    parent.addChild(this)
    return this
  }

  removeChild (child) {
    const index = this.children.indexOf(child)
    if (index < 0) {
      return
    }
    this.children(index, 1)
    child.parent = null
  }
  removeChildFrom (parent) {
    if (parent) {
      parent.removeChild(this)
    }
    return this
  }

  get x () {
    return this._position[0]
  }
  set x (value) {
    this._position[0] = value
    this._dirty = true
  }
  get y () {
    return this._position[1]
  }
  set y (value) {
    this._position[1] = value
    this._dirty = true
  }
  get rotation () {
    return this._rotation
  }
  set rotation (value) {
    this._rotation = value
    this._dirty = true
  }
  get scaleX () {
    return this._scale[0]
  }
  set scaleX (value) {
    this._scale[0] = value
    this._dirty = true
  }
  get scaleY () {
    return this._scale[1]
  }
  set scaleY (value) {
    this._scale[1] = value
    this._dirty = true
  }

}
