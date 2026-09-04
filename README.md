# orchestrator-router 💃🕺

**This is a fork of [choregrapher-router](https://gitlab.com/sebdeckers/choreographer-router)**

A client-side router for web apps using Web Components and URI Templates.

## Usage

```js
import { Orchestrator, Router, UriTemplate }
  from 'orchestrator-router'

const orchestrator = new Orchestrator({
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

The History API and link click trapping. The [`popstate` event](https://developer.mozilla.org/en-US/docs/Web/API/Document/defaultView/popstate_event) is fired whenever a navigation occurs.

### Class: Orchestrator({ stage, scenes }, [fallback])

Code: [source/orchestrator.js](./source/orchestrator.js)

Associates Web Component element names with specific routes. Creates and removes Web Components (custom HTML elements) as scenes on the stage.

- `stage` is an container HTML element where the active *scene* element is appended.
- `scenes` is an Array or other iterable object whose elements are key-value pairs. Each key is a URI Template of a route. Its value is the type of content to perform on the stage.
- `fallback` is a function which will be called with the path if there are no scene matches.

Scene content can be:

- An absolute URL instance to which to redirect.
- A tag name to render, for example a custom element. If a route change renders the same tag name as the current scene, only its dataset attributes are updated without recreating the entire scene. Use the `attributeChangedCallback` hook of Custom Elements to handle these changes.
- A callback function to invoke with arguments `pattern` and `params`. The current stage will be cleared.
