# choreographer-router 💃🕺

A client-side router for web apps using Web Components and URI Templates.

## Usage

```js
const choreographer = new Choreographer({
  stage: document.body,
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
})
```

## Modules

### UriTemplate

Code: [source/uri-template.js](./source/uri-template.js)

Source: https://github.com/geraintluff/uri-templates

URI Templates (RFC6570) implementation.

### Router

Code: [source/router.js](./source/router.js)

The History API and link click trapping. Emits a `route` event whenever a navigation occurs.

### Choreographer

Code: [source/choreographer.js](./source/choreographer.js)

Associates Web Component element names with specific routes. Creates and removes Web Components (custom HTML elements) as scenes on the stage.

## See Also

- [Commons Host website dashboard](https://gitlab.com/commonshost/website) uses Choreographer for client side routing.
