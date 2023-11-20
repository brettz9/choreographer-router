import UriTemplate from './uri-template.js'

/**
 * @typedef {import('./uri-template.js').Params} Params
 */

/**
 * @typedef {(params: Params) => void} Handler
 */

export default class Router {
  /**
   * @param {Map<string, Handler>} routes
   * @param {(path: string) => void} fallback
   */
  constructor (routes = new Map(), fallback = () => {}) {
    this.routes = new Map()
    this.fallback = fallback

    for (const [pattern, handler] of routes) {
      this.route(pattern, handler)
    }

    document.addEventListener('click', (event) => {
      const elementNode = Node.ELEMENT_NODE
      for (const target of /** @type {(HTMLAnchorElement)[]} */ (event.composedPath())) {
        if (target.nodeType === elementNode && target.localName === 'a') {
          if (target.origin === window.origin) {
            event.preventDefault()
            window.history.pushState(null, '', target.href)
            window.dispatchEvent(new PopStateEvent('popstate'))
            break
          }
        }
      }
    })

    window.addEventListener('popstate', (event) => {
      this.trigger(location)
    })

    if (document.readyState === 'interactive' ||
        document.readyState === 'complete'
    ) {
      window.setTimeout(() => this.trigger(location), 0)
    }
  }

  /**
   * @param {string} pattern
   * @param {Handler} handler
   */
  route (pattern, handler) {
    const template = new UriTemplate(pattern)
    const predicate = template.fromUri
    this.routes.set(predicate, handler)
    return this
  }

  /**
   * @param {string|Location} url
   */
  trigger (url = '') {
    const path = typeof url === 'string'
      ? url
      : url.pathname + url.search + url.hash

    if (path === this.path) {
      return
    } else {
      /** @type {string} */
      this.path = path
    }

    for (const [predicate, handler] of this.routes) {
      const params = predicate(path)
      if (params !== undefined) {
        handler(params)
        return this
      }
    }

    this.fallback(path)
    return this
  }
}
