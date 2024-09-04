export default class Choreographer extends Router {
    /**
     * @param {{
     *   stage: Element,
     *   scenes: Scene[]
     * }} cfg
     */
    constructor({ stage, scenes }: {
        stage: Element;
        scenes: Scene[];
    });
    stage: Element;
    /** @type {HTMLElement|undefined} */
    scene: HTMLElement | undefined;
}
export type Params = import('./router.js').Params;
export type SceneOptions = string | Location | SceneCallback | {
    tagName: string;
} | {
    redirect: URL;
} | {
    callback: SceneCallback;
};
export type Scene = [
    pattern: string,
    options: SceneOptions
];
export type SceneCallback = (pattern: string, params: Params) => void;
import Router from './router.js';
//# sourceMappingURL=choreographer.d.ts.map