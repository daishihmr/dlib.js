export class AssetManager {
  constructor () {
    this.assets = {}
  }

  async load (spec) {
    return new Promise((resolve, reject) => {
      const tasks = []
      Object.keys(spec).forEach((assetType) => {
        this.assets[assetType] = {}
        return Object.keys(spec[assetType]).map((assetName) => {
          const url = spec[assetType][assetName]
          if (!AssetLoaders.loaders[assetType]) {
            reject('unknown assetType')
            return
          }
          const task = AssetLoaders.loaders[assetType]({ assetType, assetName, url })
            .then((asset) => {
              this.assets[assetType][assetName] = asset
            })
            .catch(reject)
          tasks.push(task)
        })
      })
      Promise.all(tasks).then(resolve)
    })
  }

  get (assetType, assetName) {
    return this.assets[assetType][assetName]
  }
}

export class AssetLoaders {
  static loaders = {
    image: ({ url }) => {
      return new Promise((resolve, reject) => {
        try {
          const image = new Image()
          image.onload = () => resolve(image)
          image.src = url
        } catch (e) {
          reject(e)
        }
      })
    },

    text: async ({ url }) => {
      const res = await fetch(url)
      return await res.text()
    },

    json: async ({ url }) => {
      const res = await fetch(url)
      return await res.json()
    }
  }
}
