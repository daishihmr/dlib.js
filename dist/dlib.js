var dlib = (function (exports) {
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

  class Node extends EventDispatcher {
    constructor () {
      super();
      this.parent = null;
      this.children = [];
    }

    _update (params) {
      this.update(params);
      this.fire('update', params);
      this.children.forEach((c) => {
        c._update(params);
      });
    }

    update (params) {}

    addChild (node) {
      this.children.push(node);
      node.parent = this;
    }

    removeChild (node) {
      const index = this.children.indexOf(node);
      if (index < 0) {
        return
      }
      this.children(index, 1);
      node.parent = null;
    }

    addChildTo (parent) {
      parent.addChild(this);
      return this
    }

    remove () {
      if (this.parent) {
        this.parent.removeChild(this);
      }
      return this
    }

  }

  class Mouse {
    constructor (canvas) {
      this.position = [0, 0];
      this.down = [null, null, null, null, null];
      this.up = [null, null, null, null, null];
      canvas.addEventListener('mouseover', (e) => {
        this.x = e.offsetX * canvas.width / canvas.offsetWidth;
        this.y = e.offsetY * canvas.height / canvas.offsetHeight;
      });
      canvas.addEventListener('mousemove', (e) => {
        this.x = e.offsetX * canvas.width / canvas.offsetWidth;
        this.y = e.offsetY * canvas.height / canvas.offsetHeight;
      });
      canvas.addEventListener('mouseleave', (e) => {
        this.x = e.offsetX * canvas.width / canvas.offsetWidth;
        this.y = e.offsetY * canvas.height / canvas.offsetHeight;
      });
      canvas.addEventListener('mousedown', (e) => {
        this.down[e.button] = {
          x: e.offsetX * canvas.width / canvas.offsetWidth,
          y: e.offsetY * canvas.height / canvas.offsetHeight,
        };
      });
      canvas.addEventListener('mouseup', (e) => {
        this.up[e.button] = {
          x: e.offsetX * canvas.width / canvas.offsetWidth,
          y: e.offsetY * canvas.height / canvas.offsetHeight,
        };
      });
      canvas.addEventListener('wheel', (e) => {

      });
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
        if (down) {
          game.fire('mousedown', { button, x: down.x, y: down.y });
          this.down[button] = null;
        }
      });
      this.up.forEach((up, button) => {
        if (up) {
          game.fire('mouseup', { button, x: up.x, y: up.y });
          this.up[button] = null;
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
      if (this._running) {
        this.deltaTime = Date.now() - this.time;
        this.time += this.deltaTime;

        this.context.clearRect(0, 0, this.width, this.height);

        this.mouse.update(this);

        if (this.currentScene) {
          this.currentScene._update({
            game: this,
            canvas: this.canvas,
            context: this.context,
            mouse: this.mouse,
          });
        }
        requestAnimationFrame(() => this._tick());
      }
    }

    switchScene (scene) {
      this.currentScene = scene;
    }
  }

  class Scene extends Node {
    constructor () {
      super();
    }

    _update (params) {
      this.update(params);
      this.fire('update', params);
      this.children.forEach((c) => {
        c._update(params);
        if (c._draw) c._draw(params);
      });
    }
  }

  class DrawableNode extends Node {
    constructor () {
      super();
      this.position = [0, 0];
      this.rotation = 0;
      this.scale = [1, 1];
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

    get scaleX () {
      return this.scale[0]
    }
    set scaleX (value) {
      this.scale[0] = value;
    }

    get scaleY () {
      return this.scale[1]
    }
    set scaleY (value) {
      this.scale[1] = value;
    }

    _update (params) {
      this.update(params);
      this.fire('update', params);
      this.children.forEach((c) => {
        c._update(params);
      });
    }

    _draw (params) {
      const context = params.game.context;
      context.save();
      context.translate(this.position[0], this.position[1]);
      context.rotate(this.rotation);
      context.scale(this.scale[0], this.scale[1]);
      this.draw(params);
      this.children.forEach((c) => {
        if (c._draw) c._draw(params);
      });
      context.restore();
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
    }

    draw ({ game }) {
      if (this.image) {
        game.context.drawImage(
          this.image,
          this.sx,
          this.sy,
          this.sw,
          this.sh,
          -this.width / 2,
          -this.height / 2,
          this.width,
          this.height
        );
      }
    }

    hit (x, y) {

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

  return exports;

})({});
//# sourceMappingURL=dlib.js.map
