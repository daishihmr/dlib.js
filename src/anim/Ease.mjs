export class Ease {
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
    const c1 = 1.70158
    const c3 = c1 + 1

    return c3 * x * x * x - c1 * x * x
  }
  static OutBack = (x) => {
    const c1 = 1.70158
    const c3 = c1 + 1

    return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2)
  }
  static InOutBack = (x) => {
    const c1 = 1.70158
    const c2 = c1 * 1.525

    return x < 0.5
      ? (Math.pow(2 * x, 2) * ((c2 + 1) * 2 * x - c2)) / 2
      : (Math.pow(2 * x - 2, 2) * ((c2 + 1) * (x * 2 - 2) + c2) + 2) / 2
  }
  static InElastic = (x) => {
    const c4 = (2 * Math.PI) / 3

    return x === 0
      ? 0
      : x === 1
      ? 1
      : -Math.pow(2, 10 * x - 10) * Math.sin((x * 10 - 10.75) * c4)
  }
  static OutElastic = (x) => {
    const c4 = (2 * Math.PI) / 3

    return x === 0
      ? 0
      : x === 1
      ? 1
      : Math.pow(2, -10 * x) * Math.sin((x * 10 - 0.75) * c4) + 1
  }
  static InOutElastic = (x) => {
    const c5 = (2 * Math.PI) / 4.5

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
    const n1 = 7.5625
    const d1 = 2.75

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
}
