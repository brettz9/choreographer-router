import Router from './router'

function onRoute (pattern, params, { tagName, callback, redirect }) {
  if (callback) {
    if (this.scene !== undefined) {
      const scene = this.scene
      delete this.scene
      scene.remove()
    }
    callback.call(this, pattern, params)
  }

  if (redirect) {
    window.history.replaceState(null, '', redirect)
    window.dispatchEvent(new PopStateEvent('popstate'))
  }

  if (tagName) {
    if (this.scene !== undefined &&
      this.scene.localName === tagName
    ) {
      Object.assign(this.scene.dataset, params)
    } else {
      const scene = document.createElement(tagName)
      Object.assign(scene.dataset, params)
      if (this.scene === undefined) {
        this.stage.appendChild(scene)
      } else {
        this.stage.replaceChild(scene, this.scene)
      }
      this.scene = scene
    }
  }
}

function onFallback (url) {
  if (this.scene) {
    this.stage.removeChild(this.scene)
    delete this.scene
  }
}

export default class Choreographer extends Router {
  constructor ({ stage, scenes }) {
    const routes = new Map()
    for (let [pattern, options] of new Map(scenes).entries()) {
      if (typeof options === 'string') {
        options = { tagName: options }
      }
      if (options instanceof URL) {
        options = { redirect: options }
      }
      if (typeof options === 'function') {
        options = { callback: options }
      }
      const handler = (params) => onRoute.call(this, pattern, params, options)
      routes.set(pattern, handler)
    }
    super(routes, (url) => onFallback.call(this, url))
    this.stage = stage
    this.scene = undefined
  }
}
