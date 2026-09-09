# orchestrator-router 💃🕺

**This is a fork of [choregrapher-router](https://gitlab.com/sebdeckers/choreographer-router)**

A client-side router for web apps using Web Components and
[`URLPattern`](https://developer.mozilla.org/en-US/docs/Web/API/URLPattern)
(RFC 6570 URI Templates are still supported, see [String pattern syntax](#string-pattern-syntax)).

## Usage

```js
import {Orchestrator, Router, UriTemplate}
  from 'orchestrator-router';

const orchestrator = new Orchestrator({
  stage: document.body,
  scenes: [
    // Static route renders the <app-signup> custom element
    ['/signup', 'app-signup'],
    // Pass the `id` path segment as an `data-id` dataset property
    ['/users/:id', 'app-user'],
    // Match `/login?email=…` and pass `email` as a dataset property
    ['/login?email=:email', 'app-login'],
    // Match `/login` with or without a query string
    ['/login', 'app-login'],
    // Redirect to a URL
    ['/account', new URL('/account/profile', location)],
    // Catch-all fallback route showing a custom element
    ['/:pathname(.*)', 'app-404']
  ]
});
```

### String pattern syntax

By default a route pattern given as a plain string is parsed with `URLPattern`
(resolved against a dummy origin, so only `pathname`, `search`, and `hash`
matter). A `URLPattern` instance passed as a pattern is always used directly,
regardless of this setting.

### URI Templates

To parse string patterns as RFC 6570 [URI Templates](#class-uritemplate)
instead, pass `patterns: 'uritemplate'` to the `Orchestrator` config (or the
`Router` constructor, or as the third argument to `router.route`):

```js
const orchestrator = new Orchestrator({
  stage: document.body,
  patterns: 'uritemplate',
  scenes: [
    // Static route renders the <app-signup> custom element
    ['/signup', 'app-signup'],
    // Pass the `email` query string parameter as dataset property
    ['/login{?email,}', 'app-login'],
    // Redirect to a URL
    ['/account', new URL('/account/profile', location)],
    // Catch-all fallback route showing a custom element
    ['/{pathname}', 'app-404']
  ]
});

// or, for a plain Router:
const router = new Router(routes, fallback, {patterns: 'uritemplate'});
router.trigger(location);
```

`URLPattern` instances still work as scene keys even when `patterns` is
`'uritemplate'`.

## Modules

### Class: UriTemplate

Code: [src/uri-template.js](./src/uri-template.js)

Source: https://github.com/geraintluff/uri-templates

URI Templates (RFC6570) implementation.

### Class: Router

Code: [src/router.js](./src/router.js)

The History API and link click trapping. The [`popstate` event](https://developer.mozilla.org/en-US/docs/Web/API/Document/defaultView/popstate_event) is fired whenever a navigation occurs.

#### `router.route(pattern, handler, [syntax])`

`pattern` may be:

- A [**`URLPattern`**](https://developer.mozilla.org/en-US/docs/Web/API/URLPattern)
  instance.
- A **string**, parsed as a `URLPattern` (default) or, when `syntax` is
  `'uritemplate'`, as an RFC 6570 [URI Template](#class-uritemplate). `syntax`
  defaults to the `patterns` option given to the `Router`/`Orchestrator`
  constructor.

For `URLPattern` patterns, named groups from the `pathname`, `search`, and
`hash` components are merged into a single flat `params` object and passed to
`handler`, exactly as with a URI Template. Group values are returned as
`URLPattern` produces them (not percent-decoded).

Any component you don't specify defaults to `*`, which `URLPattern` compiles to
an unnamed group keyed `"0"`. To keep those out of `params`, a component whose
pattern is exactly `*` is skipped:

```js
const pattern = new URLPattern({pathname: '/users/:id'});
router.route(pattern, ({id}) => { /* ... */ });
// matching `/users/42?ref=nav` → { id: '42' }, not { id: '42', '0': 'ref=nav' }
```

The cost is that a component written as a bare `*` captures nothing; use a named
group (`/:rest(.*)`) or a non-bare wildcard (`/*`) to capture a catch-all.

```js
const router = new Router();
router.route(
  new URLPattern({pathname: '/users/:id/posts/:post'}),
  ({id, post}) => { /* ... */ }
);
router.route('/books/:isbn', ({isbn}) => { /* ... */ });
```

### Class: Orchestrator({ stage, scenes, patterns }, [fallback])

Code: [src/orchestrator.js](./src/orchestrator.js)

Associates Web Component element names with specific routes. Creates and removes Web Components (custom HTML elements) as scenes on the stage.

- `stage` is an container HTML element where the active *scene* element is appended.
- `scenes` is an Array or other iterable object whose elements are key-value pairs. Each key is a route pattern — a `URLPattern` instance or a string (see [String pattern syntax](#string-pattern-syntax)). Its value is the type of content to perform on the stage.
- `patterns` is `'urlpattern'` (default) or `'uritemplate'`, choosing how string keys are parsed.
- `fallback` is a function which will be called with the path if there are no scene matches.

Scene content can be:

- An absolute URL instance to which to redirect.
- A tag name to render, for example a custom element. If a route change renders the same tag name as the current scene, only its dataset attributes are updated without recreating the entire scene. Use the `attributeChangedCallback` hook of Custom Elements to handle these changes.
- A callback function to invoke with arguments `pattern` and `params`. The current stage will be cleared.
