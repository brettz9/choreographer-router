# choreographer-router 💃🕺

A client-side router for web apps using Web Components and URI Templates.

## Usage

```js
import { Choreographer, Router, UriTemplate }
  from 'choreographer-router'

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

### Class: UriTemplate

Code: [source/uri-template.js](./source/uri-template.js)

Source: https://github.com/geraintluff/uri-templates

URI Templates (RFC6570) implementation.

### Class: Router

Code: [source/router.js](./source/router.js)

The History API and link click trapping. Emits a `route` event whenever a navigation occurs.

### Class: Choreographer({ stage, scenes })

Code: [source/choreographer.js](./source/choreographer.js)

Associates Web Component element names with specific routes. Creates and removes Web Components (custom HTML elements) as scenes on the stage.

- `stage` is an container HTML element where the active *scene* element is appended.
- `scenes` is an Array or other iterable object whose elements are key-value pairs. Each key is a URI Template of a route. Its value is the type of content to perform on the stage.

Scene content can be:

- An absolute URL instance to which to redirect.
- A tag name to render, for example a custom element. If a route change renders the same tag name as the current scene, only its dataset attributes are updated without recreating the entire scene. Use the `attributeChangedCallback` hook of Custom Elements to handle these changes.
- A callback function to invoke with arguments `pattern` and `params`. The current stage will be cleared.

## See Also

- [Commons Host website dashboard](https://gitlab.com/commonshost/website) uses Choreographer for client side routing.
