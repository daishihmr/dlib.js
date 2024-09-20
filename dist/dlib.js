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
        Array.from(this.handlers[eventType]).forEach(_ => _(params));
      }

      return this
    }
  }

  class Transform {
    constructor (gameObject) {
      this.gameObject = gameObject;

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
      child.zOrder = this.zOrder + 1;
    }

    removeChild (child) {
      const index = this.children.indexOf(child);
      if (index < 0) {
        return
      }
      this.children(index, 1);
      child.parent = null;
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
      this.transform = new Transform(this);
      this.bounds = null;
    }

    _update (params) {
      this.update(params);
      this.fire('update', params);
    }
    update (params) {}

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

    addChild (child) {
      this.transform.addChild(child);
    }
    removeChild (child) {
      this.transform.removeChild(child);
    }
    get parent () {
      return this.transform.parent?.gameObject
    }
    get children () {
      return this.transform.children.map(_ => _.gameObject)
    }

  }

  class Ease {
    static None = x => x
    static InSine = (x) => {
      return 1 - Math.cos((x * Math.PI) / 2)
    }
    static OutSine = (x) => {
      return Math.sin((x * Math.PI) / 2)
    }
    static InOutSine = (x) => {
      return -(Math.cos(Math.PI * x) - 1) / 2
    }
    static InQuad = (x) => {
      return x * x
    }
    static OutQuad = (x) => {
      return 1 - (1 - x) * (1 - x)
    }
    static InOutQuad = (x) => {
      return x < 0.5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2
    }
    static InCubic = (x) => {
      return x * x * x
    }
    static OutCubic = (x) => {
      return 1 - Math.pow(1 - x, 3)
    }
    static InOutCubic = (x) => {
      return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2
    }
    static InQuart = (x) => {
      return x * x * x * x
    }
    static OutQuart = (x) => {
      return 1 - Math.pow(1 - x, 4)
    }
    static InOutQuart = (x) => {
      return x < 0.5 ? 8 * x * x * x * x : 1 - Math.pow(-2 * x + 2, 4) / 2
    }
    static InQuint = (x) => {
      return x * x * x * x * x
    }
    static OutQuint = (x) => {
      return 1 - Math.pow(1 - x, 5)
    }
    static InOutQuint = (x) => {
      return x < 0.5 ? 16 * x * x * x * x * x : 1 - Math.pow(-2 * x + 2, 5) / 2
    }
    static InExpo = (x) => {
      return x === 0 ? 0 : Math.pow(2, 10 * x - 10)
    }
    static OutExpo = (x) => {
      return x === 1 ? 1 : 1 - Math.pow(2, -10 * x)
    }
    static InOutExpo = (x) => {
      return x === 0
        ? 0
        : x === 1
        ? 1
        : x < 0.5 ? Math.pow(2, 20 * x - 10) / 2
        : (2 - Math.pow(2, -20 * x + 10)) / 2
    }
    static InCirc = (x) => {
      return 1 - Math.sqrt(1 - Math.pow(x, 2))
    }
    static OutCirc = (x) => {
      return Math.sqrt(1 - Math.pow(x - 1, 2))
    }
    static InOutCirc = (x) => {
      return x < 0.5
        ? (1 - Math.sqrt(1 - Math.pow(2 * x, 2))) / 2
        : (Math.sqrt(1 - Math.pow(-2 * x + 2, 2)) + 1) / 2
    }
    static InBack = (x) => {
      const c1 = 1.70158;
      const c3 = c1 + 1;

      return c3 * x * x * x - c1 * x * x
    }
    static OutBack = (x) => {
      const c1 = 1.70158;
      const c3 = c1 + 1;

      return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2)
    }
    static InOutBack = (x) => {
      const c1 = 1.70158;
      const c2 = c1 * 1.525;

      return x < 0.5
        ? (Math.pow(2 * x, 2) * ((c2 + 1) * 2 * x - c2)) / 2
        : (Math.pow(2 * x - 2, 2) * ((c2 + 1) * (x * 2 - 2) + c2) + 2) / 2
    }
    static InElastic = (x) => {
      const c4 = (2 * Math.PI) / 3;

      return x === 0
        ? 0
        : x === 1
        ? 1
        : -Math.pow(2, 10 * x - 10) * Math.sin((x * 10 - 10.75) * c4)
    }
    static OutElastic = (x) => {
      const c4 = (2 * Math.PI) / 3;

      return x === 0
        ? 0
        : x === 1
        ? 1
        : Math.pow(2, -10 * x) * Math.sin((x * 10 - 0.75) * c4) + 1
    }
    static InOutElastic = (x) => {
      const c5 = (2 * Math.PI) / 4.5;

      return x === 0
        ? 0
        : x === 1
        ? 1
        : x < 0.5
        ? -(Math.pow(2, 20 * x - 10) * Math.sin((20 * x - 11.125) * c5)) / 2
        : (Math.pow(2, -20 * x + 10) * Math.sin((20 * x - 11.125) * c5)) / 2 + 1
    }
    static InBounce = (x) => {
      return 1 - Ease.OutBounce(1 - x)
    }
    static OutBounce = (x) => {
      const n1 = 7.5625;
      const d1 = 2.75;

      if (x < 1 / d1) {
          return n1 * x * x
      } else if (x < 2 / d1) {
          return n1 * (x -= 1.5 / d1) * x + 0.75
      } else if (x < 2.5 / d1) {
          return n1 * (x -= 2.25 / d1) * x + 0.9375
      } else {
          return n1 * (x -= 2.625 / d1) * x + 0.984375
      }
    }
    static InOutBounce = (x) => {
      return x < 0.5
        ? (1 - Ease.OutBounce(1 - 2 * x)) / 2
        : (1 + Ease.OutBounce(2 * x - 1)) / 2
    }

    static funcs = {
      'none': Ease.None,
      'inSine': Ease.InSine,
      'outSine': Ease.OutSine,
      'inOutSine': Ease.InOutSine,
      'inQuad': Ease.InQuad,
      'outQuad': Ease.OutQuad,
      'inOutQuad': Ease.InOutQuad,
      'inCubic': Ease.InCubic,
      'outCubic': Ease.OutCubic,
      'inOutCubic': Ease.InOutCubic,
      'inQuart': Ease.InQuart,
      'outQuart': Ease.OutQuart,
      'inOutQuart': Ease.InOutQuart,
      'inQuint': Ease.InQuint,
      'outQuint': Ease.OutQuint,
      'inOutQuint': Ease.InOutQuint,
      'inExpo': Ease.InExpo,
      'outExpo': Ease.OutExpo,
      'inOutExpo': Ease.InOutExpo,
      'inCirc': Ease.InCirc,
      'outCirc': Ease.OutCirc,
      'inOutCirc': Ease.InOutCirc,
      'inBack': Ease.InBack,
      'outBack': Ease.OutBack,
      'inOutBack': Ease.InOutBack,
      'inElastic': Ease.InElastic,
      'outElastic': Ease.OutElastic,
      'inOutElastic': Ease.InOutElastic,
      'inBounce': Ease.InBounce,
      'outBounce': Ease.OutBounce,
      'inOutBounce': Ease.InOutBounce,
    }
  }

  class Tween extends EventDispatcher {
    constructor (
      target,
      toValues,
      {
        duration,
        delay = 0,
        ease = Ease.None,
      }
    ) {
      super();
      
      this.target = target;
      this.toValues = toValues;
      this.duration = duration;

      if (typeof(ease) === 'function') {
        this.ease = ease;
      } else {
        this.ease = Ease.funcs[ease];
      }
      
      this.keys = Object.keys(this.toValues);
      this.fromValues = {};
      this.deltas = {};

      this.time = -delay;
      this.paused = false;
      this.started = false;
      this.ended = false;
    }

    resetFromValues () {
      this.keys.map((key) => {
        this.fromValues[key] = this.target[key];
        this.deltas[key] = this.toValues[key] - this.fromValues[key];
      });
    }

    update ({ deltaTime }) {
      if (this.ended) return

      if (!this.paused) {
        this.time += deltaTime;
        if (this.time >= 0 && !this.started) {
          this.resetFromValues();
          this.fire('start');
          this.started = true;
        }
      }

      if (this.time < 0) return

      const t = Math.max(0, this.time) / this.duration;
      if (t < 1.0) {
        const v = this.ease(t);
        this.keys.forEach((key) => {
          const delta = this.deltas[key];
          this.target[key] = this.fromValues[key] + delta * v;
        });
      } else {
        this.keys.forEach((key) => {
          this.target[key] = this.toValues[key];
        });
        this.fire('complete');
        this.ended = true;
      }
    }

    pause () {
      this.paused = true;
    }
    resume () {
      this.paused = false;
    }
    kill () {
      this.fire('complete');
      this.ended = true;
    }
  }

  class Anim {
    constructor (game) {
      this.game = game;
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
        );
        if (onStart) {
          tween.on('start', onStart);
        }
        if (onComplete) {
          tween.on('complete', onComplete);
        }
    
        tween.on('complete', () => {
          const index = this.game.tweens.indexOf(tween);
          if (index >= 0) {
            this.game.tweens.splice(index, 1);
          }
          resolve(tween);
        });
        
        this.game.tweens.push(tween);
      })
    }
  }

  const Q = Math.sin(45 * Math.PI / 180);

  class Keyboard {
    constructor () {
      this.keys = {};
      this.shiftKey = false;
      this.ctrlKey = false;
      this.altKey = false;
      this.metaKey = false;
      this.direction = glMatrix.vec2.create();

      document.addEventListener('keydown', (e) => {
        if (!e.repeat) {
          this.keys[e.code] = 1;
          this.shiftKey = e.shiftKey;
          this.ctrlKey = e.ctrlKey;
          this.altKey = e.altKey;
          this.metaKey = e.metaKey;
        }
      });
      document.addEventListener('keyup', (e) => {
        this.keys[e.code] = 3;
        this.shiftKey = e.shiftKey;
        this.ctrlKey = e.ctrlKey;
        this.altKey = e.altKey;
        this.metaKey = e.metaKey;
      });
    }

    update (game) {
      Object.keys(this.keys).forEach((code) => {
        if (this.keys[code] === 1) {
          game.fire('keydown', { code });
        } else if (this.keys[code] === 3) {
          game.fire('keyup', { code });
        }
      });
    }

    lateUpdate () {
      Object.keys(this.keys).forEach((code) => {
        if (this.keys[code] === 1) {
          this.keys[code] = 2;
        } else if (this.keys[code] === 3) {
          this.keys[code] = 0;
        }
      });
    }

    isDown (code) {
      return this.keys[code] === 1
    }
    isPress (code) {
      return this.keys[code] === 2
    }
    isUp (code) {
      return this.keys[code] === 3
    }

    getDirection () {
      if (this.isPress('KeyA') && this.isPress('KeyW')) {
        return glMatrix.vec2.set(this.direction, -Q, -Q)
      } else if (this.isPress('KeyD') && this.isPress('KeyW')) {
        return glMatrix.vec2.set(this.direction, Q, -Q)
      } else if (this.isPress('KeyD') && this.isPress('KeyS')) {
        return glMatrix.vec2.set(this.direction, Q, Q)
      } else if (this.isPress('KeyA') && this.isPress('KeyS')) {
        return glMatrix.vec2.set(this.direction, -Q, Q)
      } else if (this.isPress('KeyA')) {
        return glMatrix.vec2.set(this.direction, -1, 0)
      } else if (this.isPress('KeyD')) {
        return glMatrix.vec2.set(this.direction, 1, 0)
      } else if (this.isPress('KeyW')) {
        return glMatrix.vec2.set(this.direction, 0, -1)
      } else if (this.isPress('KeyS')) {
        return glMatrix.vec2.set(this.direction, 0, 1)
      } else {
        return glMatrix.vec2.set(this.direction, 0, 0)
      }
    }
  }

  class Mouse {
    constructor (canvas) {
      this.position = glMatrix.vec2.create();
      this.deltaPosition = glMatrix.vec2.create();
      this.beforePosition = glMatrix.vec2.create();

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
      glMatrix.vec2.sub(this.deltaPosition, this.position, this.beforePosition);

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
      glMatrix.vec2.copy(this.beforePosition, this.position);
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

      if (!canvas) {
        canvas = document.createElement('canvas');
        document.body.appendChild(canvas);
      }
      this.canvas = canvas;
      this.context = canvas.getContext('2d');
      this.background = 'transparent';

      this.mouse = new Mouse(canvas);
      this.keyboard = new Keyboard();

      this.currentScene = null;
      this._running = false;
      this.time = 0;
      this.deltaTime = 0;

      this.anim = new Anim(this);
      this.tweens = [];
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

    fitWindow () {
      const fit = () => {
        this.canvas.style.position = 'absolute';
        const gameAspect = this.canvas.width / this.canvas.height;
        const windowAspect = window.innerWidth / window.innerHeight;
        if (gameAspect <= windowAspect) {
          const w = window.innerHeight * gameAspect;
          this.canvas.style.width = Math.floor(w) + 'px';
          this.canvas.style.height = Math.floor(window.innerHeight) + 'px';
          this.canvas.style.left = Math.floor((window.innerWidth - w) * 0.5) + 'px';
          this.canvas.style.top = '0px';
        } else {
          const h = window.innerWidth / gameAspect;
          this.canvas.style.width = Math.floor(window.innerWidth) + 'px';
          this.canvas.style.height = Math.floor(h) + 'px';
          this.canvas.style.left = '0px';
          this.canvas.style.top = Math.floor((window.innerHeight - h) * 0.5) + 'px';
        }
      };
      fit();
      window.addEventListener('resize', fit);
    }

    _tick () {
      this.mouse.update(this);
      this.keyboard.update(this);

      if (this._running) {
        this.deltaTime = Date.now() - this.time;
        this.time += this.deltaTime;

        this.context.resetTransform();
        this.context.clearRect(0, 0, this.width, this.height);

        const params = {
          game: this,
          deltaTime: this.deltaTime,
          time: this.time,
          canvas: this.canvas,
          context: this.context,
          mouse: this.mouse,
          keyboard: this.keyboard,
        };

        if (this.currentScene) {
          this.currentScene.update(params);
        }
        Array.from(this.tweens).forEach(t => t.update(params));

        this.fire('update', params);
        requestAnimationFrame(() => this._tick());
      }

      this.mouse.lateUpdate();
      this.keyboard.lateUpdate();
    }

    switchScene (scene) {
      this.currentScene = scene;
    }
  }

  class Scene extends EventDispatcher {
    constructor () {
      super();
      this.gameObjects = [];
      this.gameObjectMap = {};
      this.rootMatrix = glMatrix.mat2d.create();
    }

    update (params) {
      this.fire('update', params);

      Array.from(this.gameObjects).forEach((obj) => {
        if (obj.active) {
          obj._update(params);

          // rootに直接配置されているオブジェクトのみtransformを再計算
          if (!obj.transform.parent) {
            obj.transform.update(this.rootMatrix);
          }
        }
      });
      Array.from(this.gameObjects).sort((lhs, rhs) => lhs.zOrder - rhs.zOrder).forEach((obj) => {
        if (obj.visible && obj._draw) {
          obj._draw(params);
        }
      });
    }

    add (gameObject, name) {
      this.gameObjects.push(gameObject);
      if (name) {
        gameObject.name = name;
        this.gameObjectMap[name] = gameObject;
      }
    }

    remove (gameObject) {
      const index = this.gameObjects.indexOf(gameObject);
      if (index >= 0) {
        this.gameObjects.splice(index, 1);
      }
      if (gameObject.name) {
        this.gameObjectMap[gameObject.name] = null;
      }
    }

    get (name) {
      return this.gameObjectMap[name]
    }
  }

  class DrawableNode extends Node {
    constructor () {
      super();
      this.visible = true;
      this.globalAlpha = 1;
      this.globalCompositeOperation = 'source-over';
      this.zOrder = 0;
    }

    _draw (params) {
      const context = params.context;
      context.globalCompositeOperation = this.globalCompositeOperation;
      context.globalAlpha = this.globalAlpha;
      const m = this.transform._matrix;
      context.setTransform(m[0], m[1], m[2], m[3], m[4], m[5]);
      this.draw(params);
      this.fire('draw', params);
    }

    draw (params) {}
  }

  class Bounds {
    constructor () {
      this.enable = false;
      this.center = glMatrix.vec2.create();
    }

    get centerX () {
      return this.center[0]
    }
    set centerX (value) {
      this.center[0] = value;
    }
    get centerY () {
      return this.center[1]
    }
    set centerY (value) {
      this.center[1] = value;
    }

    contains (point) {
      return false
    }
  }

  class BoundingCircle extends Bounds {
    constructor () {
      super();
      this.radius = 0;
      this.origin = glMatrix.vec2.create();
    }

    contains (point) {
      if (!this.enable) return false
      if (this.radius === 0) return false
      return glMatrix.vec2.squaredDistance(this.origin, point) <= this.radius * this.radius
    }
  }

  class BoundingRect extends Bounds {
    constructor () {
      super();
      this.size = glMatrix.vec2.create();
    }

    get width () {
      return this.size[0]
    }
    set width (value) {
      this.size[0] = value;
    }
    get height () {
      return this.size[1]
    }
    set height (value) {
      this.size[1] = value;
    }

    contains (point) {
      if (!this.enable) return false
      if (this.size[0] === 0 || this.size[1] === 0) return false
      return this.center[0] + this.size * -0.5 <= point[0] &&
        point[0] < this.center[0] + this.size * 0.5 &&
        this.center[1] + this.size * -0.5 <= point[1] &&
        point[1] < this.center[1] + this.size * 0.5
    }
    
  }

  class Sound extends EventDispatcher {
    static context = new AudioContext()

    constructor (audiobuffer) {
      super();
      this.source = null;
      this.audiobuffer = audiobuffer;
      this.gainNode = new GainNode(Sound.context);
      this.gainNode.connect(Sound.context.destination);
    }

    createNewSource () {
      this.source = new AudioBufferSourceNode(Sound.context);
      this.source.connect(this.gainNode);
      this.source.buffer = this.audiobuffer;
      this.source.addEventListener('ended', (e) => {
        this.fire('ended', e);
        this.source.disconnect();
        this.source = null;
      });
      return this.source
    }

    start ({ when, offset, duration, loop = false, loopStart = 0, loopEnd = 0 }) {
      const source = this.createNewSource();
      source.loop = loop;
      source.loopStart = loopStart;
      source.loopEnd = loopEnd;
      if (duration) {
        source.start(when, offset, duration);
      } else {
        source.start(when, offset);
      }
    }
    stop () {
      if (this.source) this.source.stop();
    }

    get volume () {
      return this.gainNode.gain.value
    }
    set volume (value) {
      this.gainNode.gain.value = value;
    }
  }

  class Atlas {
    constructor ({ spec, image }) {
      this.spec = spec;
      this.image = image;
    }

    get (frameName) {
      return this.spec.frames[frameName]
    }
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
      },

      atlas: async ({ url }) => {
        const spec = await AssetLoaders.loaders.json({ url });
        const path = url.indexOf('/') < 0 ? './' : url.substring(0, url.lastIndexOf('/'));
        const image = await AssetLoaders.loaders.image({ url: path + '/' + spec.meta.image });
        return new Atlas({ spec, image })
      },

      sound: async ({ url }) => {
        const res = await fetch(url);
        const buffer = await res.arrayBuffer();
        const decodedData = await Sound.context.decodeAudioData(buffer);
        return new Sound(decodedData)
      },
    }
  }

  class Sprite extends DrawableNode {
    constructor ({ image, sx, sy, sw, sh, dx, dy, dw, dh, width, height, atlas, px, py }) {
      super();
      this.image = atlas ? atlas.image : image;
      this.sx = sx || 0;
      this.sy = sy || 0;
      this.sw = sw || (image ? image.width : 0);
      this.sh = sh || (image ? image.height : 0);
      this.dx = dx || 0;
      this.dy = dy || 0;
      this.dw = dw || (image ? image.width : 0);
      this.dh = dh || (image ? image.height : 0);
      this.px = px || 0;
      this.py = py || 0;
      this.width = width || (image ? image.width : 100);
      this.height = height || (image ? image.height : 100);
      this.origin = glMatrix.vec2.fromValues(0.5, 0.5);
      this.atlas = atlas;
      this.frameName = null;
      this.rotated = false;
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

    get frame () {
      return this.frameName
    }
    set frame (value) {
      this.setFrame(value);
    }

    draw ({ context }) {
      if (this.image) {
        if (this.rotated) {
          context.rotate(-90 * Math.PI / 180);
          context.drawImage(
            this.image,
            this.sx,
            this.sy,
            this.sh,
            this.sw,
            this.height * -this.origin[1] + this.dy,
            this.width * -this.origin[0] + this.dx,
            this.dh,
            this.dw,
          );
          context.rotate(90 * Math.PI / 180);
        } else {
          context.drawImage(
            this.image,
            this.sx,
            this.sy,
            this.sw,
            this.sh,
            this.width * -this.origin[0] + this.dx,
            this.height * -this.origin[1] + this.dy,
            this.dw,
            this.dh
          );
        }
      }
    }

    setFrame (frameName) {
      this.frameName = frameName;
      if (!this.atlas) return

      const frame = this.atlas.get(this.frameName);
      this.sx = frame.frame.x;
      this.sy = frame.frame.y;
      this.sw = frame.frame.w;
      this.sh = frame.frame.h;
      this.dx = frame.spriteSourceSize.x;
      this.dy = frame.spriteSourceSize.y;
      this.dw = frame.spriteSourceSize.w;
      this.dh = frame.spriteSourceSize.h;
      this.px = frame.pivot.x;
      this.py = frame.pivot.y;
      this.width = frame.sourceSize.w;
      this.height = frame.sourceSize.h;
      this.rotated = frame.rotated;
    }

  }

  class NodeTree {
    static build (nodeSpec, scene) {
      const obj = new window.dlib[nodeSpec.className](...(nodeSpec.arguments || []));
      if (nodeSpec.properties) {
        Object.assign(obj, nodeSpec.properties);
      }
      if (scene) {
        scene.add(obj, nodeSpec.name);
      }
      if (nodeSpec.children) {
        nodeSpec.children.forEach((childSpec) => {
          const child = NodeTree.build(childSpec, scene);
          obj.transform.addChild(child.transform);
        });
      }
      return obj
    }
  }

  exports.Anim = Anim;
  exports.AssetLoaders = AssetLoaders;
  exports.AssetManager = AssetManager;
  exports.Atlas = Atlas;
  exports.BoundingCircle = BoundingCircle;
  exports.BoundingRect = BoundingRect;
  exports.Bounds = Bounds;
  exports.DrawableNode = DrawableNode;
  exports.Ease = Ease;
  exports.EventDispatcher = EventDispatcher;
  exports.Game = Game;
  exports.Keyboard = Keyboard;
  exports.Mouse = Mouse;
  exports.Node = Node;
  exports.NodeTree = NodeTree;
  exports.Scene = Scene;
  exports.Sound = Sound;
  exports.Sprite = Sprite;
  exports.Transform = Transform;
  exports.Tween = Tween;

  return exports;

})({}, glMatrix);
//# sourceMappingURL=dlib.js.map
