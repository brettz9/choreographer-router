# CHANGES for orchestrator-router

## 3.0.0

- feat: accept a `URLPattern` instance for `Router.prototype.route` patterns and
  `Orchestrator` scene keys
- feat!: plain string patterns are now parsed with `URLPattern` by default. Pass
  `{ patterns: 'uritemplate' }` to the `Router` constructor or `Orchestrator`
  config (or a third argument to `Router.prototype.route`) to keep RFC 6570 URI
  Template parsing for string patterns.
- **BREAKING**: existing URI Template route strings (e.g. `'/login{?email,}'`)
  no longer match unless `patterns: 'uritemplate'` is set.
- **BREAKING**: require Node >=24.16.0

## 2.0.3

- docs: point to source of fork

## 2.0.2

- fix: incomplete rename of default export class

## 2.0.1

- fix: ensure publishing latest types

## 2.0.0

- initial fork
