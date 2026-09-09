/* globals PopStateEvent, Node, location, URLPattern */

import UriTemplate from './uri-template.js'

/**
 * @typedef {import('./uri-template.js').Params} Params
 */

/**
 * @typedef {(params: Params) => void} Handler
 */

/**
 * @typedef {(path: string) => Params | undefined} Predicate
 */

/**
 * How a route pattern given as a plain string is interpreted: parsed by
 * `URLPattern` (the default) or as an RFC 6570 URI Template. A `URLPattern`
 * instance is always used as-is regardless of this setting.
 * @typedef {'urlpattern'|'uritemplate'} PatternSyntax
 */

/** @type {PatternSyntax} */
const defaultPatternSyntax = 'urlpattern'

// Base used to resolve the (path-only) strings passed to `trigger`, and any
// relative pattern strings, into the absolute URLs that `URLPattern` expects.
// The origin is irrelevant since routes are matched on `pathname`, `search`,
// and `hash` only.
const urlPatternBase = 'http://localhost/'

// URL components that can carry named/indexed groups worth exposing as params.
const urlPatternComponents = /** @type {const} */ (['pathname', 'search', 'hash'])

/**
 * Brand check for a `URLPattern` instance. Prefers the `Symbol.toStringTag`
 * value that Web IDL puts on the interface prototype (rather than `instanceof`,
 * which breaks across realms such as an `iframe` and throws where the
 * `URLPattern` global is absent), then falls back to duck-typing the members
 * this module uses because Node — through at least v26 — omits that tag.
 * @param {unknown} value
 * @returns {value is URLPattern}
 */
function isUrlPattern (value) {
  if (Object.prototype.toString.call(value) === '[object URLPattern]') {
    return true
  }
  // We can drop the following upon https://github.com/nodejs/node/issues/65924
  const candidate = /** @type {Partial<URLPattern>} */ (value)
  return typeof candidate === 'object' && candidate !== null &&
    typeof candidate.exec === 'function' &&
    typeof candidate.test === 'function' &&
    typeof candidate.pathname === 'string'
}

/**
 * Wraps a `URLPattern` so it behaves like `UriTemplate.prototype.fromUri`,
 * returning a flat map of matched group values or `undefined` when the path
 * does not match.
 * @param {URLPattern} pattern
 * @returns {Predicate}
 */
function fromUrlPattern (pattern) {
  return (path) => {
    const match = pattern.exec(path, urlPatternBase)
    if (match === null) {
      return undefined
    }

    /** @type {Params} */
    const params = {}
    for (const component of urlPatternComponents) {
      // An unconstrained component matches as a bare `*` wildcard and only
      // contributes a synthetic unnamed group; skip it so parts of the URL the
      // caller did not describe do not leak into the params.
      if (pattern[component] === '*') {
        continue
      }
      for (const [key, value] of Object.entries(match[component].groups)) {
        if (value !== undefined) {
          params[key] = value
        }
      }
    }
    return params
  }
}

/**
 * Turns a route pattern into the predicate used to match paths against it.
 * @param {string|URLPattern} pattern
 * @param {PatternSyntax} syntax How a string `pattern` is interpreted.
 * @returns {Predicate}
 */
function toPredicate (pattern, syntax) {
  if (isUrlPattern(pattern)) {
    return fromUrlPattern(pattern)
  }
  return syntax === 'uritemplate'
    ? new UriTemplate(pattern).fromUri
    : fromUrlPattern(new URLPattern(pattern, urlPatternBase))
}

export default class Router {
  /**
   * @param {Map<string|URLPattern, Handler>} routes
   * @param {(path: string) => void} fallback
   * @param {{patterns?: PatternSyntax}} [options] `patterns` chooses how a
   *   route pattern given as a plain string is interpreted; it defaults to
   *   `'urlpattern'`. A `URLPattern` instance is always honoured directly.
   */
  constructor (routes = new Map(), fallback = () => {}, { patterns = defaultPatternSyntax } = {}) {
    this.routes = new Map()
    this.fallback = fallback
    /** @type {PatternSyntax} */
    this.patterns = patterns
    /** @type {string|undefined} */
    this.path = undefined

    for (const [pattern, handler] of routes) {
      this.route(pattern, handler)
    }

    /**
     * @param {Event} event
     */
    const clickListener = (event) => {
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
    }

    /**
     * @param {Event} event
     */
    const popstateListener = (event) => {
      this.trigger(location)
    }

    document.addEventListener('click', clickListener)
    window.addEventListener('popstate', popstateListener)

    this.close = () => {
      document.removeEventListener('click', clickListener)
      window.removeEventListener('popstate', popstateListener)
    }

    if (document.readyState === 'interactive' ||
        document.readyState === 'complete'
    ) {
      window.setTimeout(() => this.trigger(location), 0)
    }
  }

  /**
   * Registers a route. The `pattern` may be a `URLPattern` instance, a string
   * parsed by `URLPattern`, or (when `syntax` is `'uritemplate'`) an RFC 6570
   * URI Template string. It is reduced to a predicate mapping a path to its
   * matched parameters, or `undefined` when it does not match.
   * @param {string|URLPattern} pattern
   * @param {Handler} handler
   * @param {PatternSyntax} [syntax] Overrides the instance's `patterns` setting
   *   for this one route.
   */
  route (pattern, handler, syntax = this.patterns) {
    this.routes.set(toPredicate(pattern, syntax), handler)
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
