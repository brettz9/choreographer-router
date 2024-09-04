export default UriTemplate;
export type Params = {
    [key: string]: string;
};
export type VarSpec = {
    truncate: number | null;
    name: string;
    suffices: {
        '*'?: true | undefined;
    };
};
export type SubFunction = ((valueFunction: (s: string) => string | string[] | {
    [key: string]: string;
} | null | undefined) => string) & {
    varNames: string[];
};
export type GuessFunction = (stringValue: string | string[], resultObj: any) => void | null;
/**
 * @param {string} template
 */
declare function UriTemplate(template: string): UriTemplate | undefined;
declare class UriTemplate {
    /**
     * @param {string} template
     */
    constructor(template: string);
    /**
     * @type {{
     *   (
     *     callback: (varName: string) => undefined | string | {[key: string]: string}
     *   ): string;
     *   (
     *     vars: {[key: string]: undefined | string | {[key: string]: string}}
     *   ): string
     * }}
     */
    fill: {
        (callback: (varName: string) => string | {
            [key: string]: string;
        } | undefined): string;
        (vars: {
            [key: string]: string | {
                [key: string]: string;
            } | undefined;
        }): string;
    };
    /**
     * @param {string} substituted
     * @returns {Params | undefined}
     */
    fromUri: ((substituted: string) => Params | undefined) | undefined;
    varNames: string[] | undefined;
    /** @type {string} */
    template: string;
    toString: () => string;
    fillFromObject: (vars: {
        [key: string]: string | {
            [key: string]: string;
        } | undefined;
    }) => string;
}
//# sourceMappingURL=uri-template.d.ts.map