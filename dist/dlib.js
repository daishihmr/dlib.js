var dlib = (function (exports, glMatrix) {
  'use strict';

  class EventDispatcher {
    constructor () {
      this.handlers = {};
    }

    on (eventType, listener) {
      if (this.handlers[eventType] === undefined) {
        this.handlers[eventType] = [];
      }

      this.handlers[eventType].push(listener);

      return this
    }

    addEventListener (...args) {
      return this.on(...args)
    }

    off (eventType, listener) {
      if (this.handlers[eventType]) {
        const index = this.handlers[eventType].indexOf(listener);
        if (index >= 0) {
          this.handlers[eventType].splice(index, 1);
        }
      }

      return this
    }

    removeEventListener (...args) {
      return this.off(args)
    }

    once (eventType, listener) {
      const w = () => {
        listener();
        this.off(eventType, w);
      };
      return this.on(eventType, w)
    }

    clearEventListener (eventType) {
      this.handlers[eventType] = [];
      return this
    }

    fire (eventType, params) {
      if (this.handlers[eventType]) {
        this.handlers[eventType].forEach(_ => _(params));
      }

      return this
    }
  }

  class Transform {
    constructor () {
      this._position = glMatrix.vec2.fromValues(0, 0);
      this._rotation = 0;
      this._scale = glMatrix.vec2.fromValues(1, 1);
      this._dirty = true;
      this._matrix = glMatrix.mat2d.create();
      this._invMatrix = glMatrix.mat2d.create();

      this.parent = null;
      this.children = [];
    }

    update (parentMatrix) {
      glMatrix.mat2d.copy(this._matrix, parentMatrix);
      glMatrix.mat2d.translate(this._matrix, this._matrix, this._position);
      glMatrix.mat2d.rotate(this._matrix, this._matrix, this.rotation);
      glMatrix.mat2d.scale(this._matrix, this._matrix, this._scale);
      this.children.forEach((child) => {
        child.update(this._matrix);
      });
    }

    get matrix () {
      if (this.parent) {
        glMatrix.mat2d.copy(this._matrix, this.parent._matrix);
      } else {
        glMatrix.mat2d.identity(this._matrix);
      }

      glMatrix.mat2d.translate(this._matrix, this._matrix, this._position);
      glMatrix.mat2d.rotate(this._matrix, this._matrix, this.rotation);
      glMatrix.mat2d.scale(this._matrix, this._matrix, this._scale);

      return this._matrix
    }

    globalToLocal (point, refreshMatrix = false) {
      const ret = glMatrix.vec2.create();
      if (refreshMatrix) {
        glMatrix.mat2d.invert(this._invMatrix, this.matrix);
      } else {
        glMatrix.mat2d.invert(this._invMatrix, this._matrix);
      }
      glMatrix.vec2.transformMat2d(ret, point, this._invMatrix);
      return ret
    }

    localToGlobal (point, refreshMatrix = false) {
      const ret = glMatrix.vec2.create();
      if (refreshMatrix) {
        glMatrix.vec2.transformMat2d(ret, point, this.matrix);
      } else {
        glMatrix.vec2.transformMat2d(ret, point, this._matrix);
      }
      return ret
    }

    addChild (child) {
      this.children.push(child);
      child.parent = this;
    }
    addChildTo (parent) {
      parent.addChild(this);
      return this
    }

    removeChild (child) {
      const index = this.children.indexOf(child);
      if (index < 0) {
        return
      }
      this.children(index, 1);
      child.parent = null;
    }
    removeChildFrom (parent) {
      if (parent) {
        parent.removeChild(this);
      }
      return this
    }

    get x () {
      return this._position[0]
    }
    set x (value) {
      this._position[0] = value;
      this._dirty = true;
    }
    get y () {
      return this._position[1]
    }
    set y (value) {
      this._position[1] = value;
      this._dirty = true;
    }
    get rotation () {
      return this._rotation
    }
    set rotation (value) {
      this._rotation = value;
      this._dirty = true;
    }
    get scaleX () {
      return this._scale[0]
    }
    set scaleX (value) {
      this._scale[0] = value;
      this._dirty = true;
    }
    get scaleY () {
      return this._scale[1]
    }
    set scaleY (value) {
      this._scale[1] = value;
      this._dirty = true;
    }

  }

  class Node extends EventDispatcher {
    constructor () {
      super();
      this.active = true;
      this.transform = new Transform();
      this.bounds = null;
    }

    _update (params) {
      this.update(params);
      this.fire('update', params);
    }
    update (params) {}

    addChild (child) {
      this.transform.addChild(child.transform);
    }
    removeChild (child) {
      this.transform.removeChild(child.transform);
    }

    hit (globalPoint) {
      if (!this.bounds) return false

      const point = this.transform.globalToLocal(globalPoint);
      return this.bounds.contains(point)
    }

    get x () {
      return this.transform.x
    }
    set x (value) {
      this.transform.x = value;
    }
    get y () {
      return this.transform.y
    }
    set y (value) {
      this.transform.y = value;
    }
    get rotation () {
      return this.transform.rotation
    }
    set rotation (value) {
      this.transform.rotation = value;
    }
    get scaleX () {
      return this.transform.scaleX
    }
    set scaleX (value) {
      this.transform.scaleX = value;
    }
    get scaleY () {
      return this.transform.scaleY
    }
    set scaleY (value) {
      this.transform.scaleY = value;
    }

  }

  class Mouse {
    constructor (canvas) {
      this.position = glMatrix.vec2.create();
      this.down = [];
      this.up = [];
      for (let i = 0; i < 10; i++) {
        this.down.push({
          position: glMatrix.vec2.create(),
          flag: 0,
        });
        this.up.push({
          position: glMatrix.vec2.create(),
          flag: 0,
        });
      }

      canvas.addEventListener('mouseover', (e) => {
        this.position.set([
          e.offsetX * canvas.width / canvas.offsetWidth,
          e.offsetY * canvas.height / canvas.offsetHeight,
        ]);
      });
      canvas.addEventListener('mousemove', (e) => {
        this.position.set([
          e.offsetX * canvas.width / canvas.offsetWidth,
          e.offsetY * canvas.height / canvas.offsetHeight,
        ]);
      });
      canvas.addEventListener('mouseleave', (e) => {
        this.position.set([
          e.offsetX * canvas.width / canvas.offsetWidth,
          e.offsetY * canvas.height / canvas.offsetHeight,
        ]);
      });
      canvas.addEventListener('mousedown', (e) => {
        const down = this.down[e.button];
        down.position.set([
          e.offsetX * canvas.width / canvas.offsetWidth,
          e.offsetY * canvas.height / canvas.offsetHeight,
        ]);
        down.flag = 1;

        this.up[e.button].flag = 0;
      });
      canvas.addEventListener('mouseup', (e) => {
        const up = this.up[e.button];
        up.position.set([
          e.offsetX * canvas.width / canvas.offsetWidth,
          e.offsetY * canvas.height / canvas.offsetHeight,
        ]);
        up.flag = 1;

        this.down[e.button].flag = 0;
      });
      canvas.addEventListener('wheel', (e) => {

      });
    }

    isDown (buttonIndex = 0) {
      return this.down[buttonIndex].flag === 1
    }
    isPress (buttonIndex = 0) {
      return this.down[buttonIndex].flag === 2
    }
    isUp (buttonIndex = 0) {
      return this.up[buttonIndex].flag === 1
    }

    get x () {
      return this.position[0]
    }
    set x (value) {
      this.position[0] = value;
    }

    get y () {
      return this.position[1]
    }
    set y (value) {
      this.position[1] = value;
    }

    update (game) {
      this.down.forEach((down, button) => {
        if (down.flag === 1) {
          game.fire('mousedown', { button, position: down.position });
        }
      });
      this.up.forEach((up, button) => {
        if (up.flag === 1) {
          game.fire('mouseup', { button, position: up.position });
        }
      });
    }

    lateUpdate () {
      this.down.forEach((down) => {
        if (down.flag === 1) {
          down.flag = 2;
        }
      });
      this.up.forEach((up) => {
        if (up.flag === 1) {
          up.flag = 2;
        }
      });
    }
  }

  class Game extends EventDispatcher {
    constructor (canvas) {
      super();

      this.canvas = canvas;
      this.context = canvas.getContext('2d');
      this.background = 'transparent';

      this.mouse = new Mouse(canvas);

      this.currentScene = null;
      this._running = false;
      this.time = 0;
      this.deltaTime = 0;
    }

    get background () {
      return this.canvas.style.backgroundColor
    }
    set background (value) {
      this.canvas.style.backgroundColor = value;
    }

    get width () {
      return this.canvas.width
    }
    set width (value) {
      this.canvas.width = value;
    }

    get height () {
      return this.canvas.height
    }
    set height (value) {
      this.canvas.height = value;
    }

    start () {
      this._running = true;
      this.time = Date.now();
      this.deltaTime = 0;
      this._tick();
    }

    stop () {
      this._running = false;
    }

    _tick () {
      this.mouse.update(this);

      if (this._running) {
        this.deltaTime = Date.now() - this.time;
        this.time += this.deltaTime;

        this.context.resetTransform();
        this.context.clearRect(0, 0, this.width, this.height);

        const params = {
          game: this,
          canvas: this.canvas,
          context: this.context,
          mouse: this.mouse,
        };

        if (this.currentScene) {
          this.currentScene.update(params);
        }
        this.fire('update', params);
        requestAnimationFrame(() => this._tick());
      }

      this.mouse.lateUpdate(this);
    }

    switchScene (scene) {
      this.currentScene = scene;
    }
  }

  class Scene extends EventDispatcher {
    constructor () {
      super();
      this.gameObjects = [];
      this.rootMatrix = glMatrix.mat2d.create();
    }

    update (params) {
      this.fire('update', params);

      this.gameObjects.forEach((node) => {
        if (node.active) {
          node._update(params);

          // rootに直接配置されているノードのみtransformを再計算
          if (!node.transform.parent) {
            node.transform.update(this.rootMatrix);
          }

          if (node.visible && node._draw) {
            node._draw(params);
          }
        }
      });
    }

    add (node) {
      this.gameObjects.push(node);
    }

    remove (node) {
      const index = this.gameObjects.indexOf(node);
      if (index >= 0) {
        this.gameObjects.splice(index, 1);
      }
    }
  }

  class DrawableNode extends Node {
    constructor () {
      super();
      this.visible = true;
    }

    _draw (params) {
      const context = params.context;
      const m = this.transform._matrix;
      context.setTransform(m[0], m[1], m[2], m[3], m[4], m[5]);
      this.draw(params);
      this.fire('draw', params);
    }

    draw (params) {}
  }

  class AssetManager {
    constructor () {
      this.assets = {};
    }

    async load (spec) {
      return new Promise((resolve, reject) => {
        const tasks = [];
        Object.keys(spec).forEach((assetType) => {
          this.assets[assetType] = {};
          return Object.keys(spec[assetType]).map((assetName) => {
            const url = spec[assetType][assetName];
            if (!AssetLoaders.loaders[assetType]) {
              reject('unknown assetType');
              return
            }
            const task = AssetLoaders.loaders[assetType]({ assetType, assetName, url })
              .then((asset) => {
                this.assets[assetType][assetName] = asset;
              })
              .catch(reject);
            tasks.push(task);
          })
        });
        Promise.all(tasks).then(resolve);
      })
    }

    get (assetType, assetName) {
      return this.assets[assetType][assetName]
    }
  }

  class AssetLoaders {
    static loaders = {
      image: ({ url }) => {
        return new Promise((resolve, reject) => {
          try {
            const image = new Image();
            image.onload = () => resolve(image);
            image.src = url;
          } catch (e) {
            reject(e);
          }
        })
      },

      text: async ({ url }) => {
        const res = await fetch(url);
        return await res.text()
      },

      json: async ({ url }) => {
        const res = await fetch(url);
        return await res.json()
      }
    }
  }

  class Sprite extends DrawableNode {
    constructor ({ image, sx, sy, sw, sh, width, height }) {
      super();
      this.image = image;
      this.sx = sx || 0;
      this.sy = sy || 0;
      this.sw = sw || (image ? image.width : 0);
      this.sh = sh || (image ? image.height : 0);
      this.width = width || (image ? image.width : 100);
      this.height = height || (image ? image.height : 100);
      this.interactive = false;
      this.origin = glMatrix.vec2.fromValues(0.5, 0.5);
    }

    get originX () {
      return this.origin[0]
    }
    set originX (value) {
      this.origin[0] = value;
    }
    get originY () {
      return this.origin[1]
    }
    set originY (value) {
      this.origin[1] = value;
    }

    draw ({ context }) {
      if (this.image) {
        context.drawImage(
          this.image,
          this.sx,
          this.sy,
          this.sw,
          this.sh,
          this.width * this.origin[0] * -0.5,
          this.height * this.origin[1] * -0.5,
          this.width,
          this.height
        );
      }
    }

    hit (point) {

    }
  }

  exports.AssetLoaders = AssetLoaders;
  exports.AssetManager = AssetManager;
  exports.DrawableNode = DrawableNode;
  exports.EventDispatcher = EventDispatcher;
  exports.Game = Game;
  exports.Mouse = Mouse;
  exports.Node = Node;
  exports.Scene = Scene;
  exports.Sprite = Sprite;
  exports.Transform = Transform;

  return exports;

})({}, glMatrix);
//# sourceMappingURL=dlib.js.map
