import { Sound } from "../sound/Sound.mjs"
import { Atlas } from "../sprite/atlas.mjs"

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
            reject(new Error(`unknown assetType ${ assetType }`))
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
    },

    atlas: async ({ url }) => {
      const spec = await AssetLoaders.loaders.json({ url })
      const path = url.indexOf('/') < 0 ? './' : url.substring(0, url.lastIndexOf('/'))
      const image = await AssetLoaders.loaders.image({ url: path + '/' + spec.meta.image })
      return new Atlas({ spec, image })
    },

    sound: async ({ url }) => {
      const res = await fetch(url)
      const buffer = await res.arrayBuffer()
      const decodedData = await Sound.context.decodeAudioData(buffer)
      return new Sound(decodedData)
    },
  }
}
