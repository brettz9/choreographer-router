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
    constructor(routes?: Map<string, Handler>, fallback?: (path: string) => void);
    routes: Map<any, any>;
    fallback: (path: string) => void;
    /**
     * @param {string} pattern
     * @param {Handler} handler
     */
    route(pattern: string, handler: Handler): this;
    /**
     * @param {string|Location} url
     */
    trigger(url?: string | Location): this | undefined;
    /** @type {string} */
    path: string | undefined;
}
export type Params = import('./uri-template.js').Params;
export type Handler = (params: Params) => void;
//# sourceMappingURL=router.d.ts.map