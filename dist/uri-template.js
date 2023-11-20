"use strict";
// Source: https://github.com/geraintluff/uri-templates
// Adapted only to export using the ECMAScript module syntax and for TS support.
/* eslint-disable */
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * @typedef {{[key: string]: string}} Params
 */
/**
 * @typedef {{
 *   truncate: number | null;
 *   name: string;
 *   suffices: {'*'?: true|undefined};
 * }} VarSpec
 */
/**
 * @typedef {((
 *   valueFunction: (s: string) => null|undefined|string[]|{[key: string]: string}|string
 * ) => string) & {
 *   varNames: string[]
 * }} SubFunction
 */
/**
 * @typedef {(stringValue: string|string[], resultObj: any) => void|null} GuessFunction
 */
const uriTemplateGlobalModifiers = {
    "+": true,
    "#": true,
    ".": true,
    "/": true,
    ";": true,
    "?": true,
    "&": true
};
const uriTemplateSuffices = {
    "*": true
};
/**
 * @param {string} string
 */
function notReallyPercentEncode(string) {
    return encodeURI(string).replaceAll(/%25[0-9][0-9]/g, function (doubleEncoded) {
        return "%" + doubleEncoded.slice(3);
    });
}
/**
 * @param {string} spec
 */
function uriTemplateSubstitution(spec) {
    let modifier = "";
    if (uriTemplateGlobalModifiers[
    /** @type {keyof uriTemplateGlobalModifiers} */ (spec.charAt(0))]) {
        modifier = spec.charAt(0);
        spec = spec.slice(1);
    }
    let separator = "";
    let prefix = "";
    let shouldEscape = true;
    let showVariables = false;
    let trimEmptyString = false;
    if (modifier == '+') {
        shouldEscape = false;
    }
    else if (modifier == ".") {
        prefix = ".";
        separator = ".";
    }
    else if (modifier == "/") {
        prefix = "/";
        separator = "/";
    }
    else if (modifier == '#') {
        prefix = "#";
        shouldEscape = false;
    }
    else if (modifier == ';') {
        prefix = ";";
        separator = ";",
            showVariables = true;
        trimEmptyString = true;
    }
    else if (modifier == '?') {
        prefix = "?";
        separator = "&",
            showVariables = true;
    }
    else if (modifier == '&') {
        prefix = "&";
        separator = "&",
            showVariables = true;
    }
    /** @type {string[]} */
    const varNames = [];
    const varList = spec.split(",");
    /** @type {VarSpec[]} */
    const varSpecs = [];
    /** @type {{[key: string]: VarSpec}} */
    const varSpecMap = {};
    for (let varName of varList) {
        let truncate = null;
        if (varName.includes(":")) {
            const parts = varName.split(":");
            varName = parts[0];
            truncate = parseInt(parts[1]);
        }
        /** @type {{[key in keyof uriTemplateSuffices]?: true}} */
        const suffices = {};
        while (uriTemplateSuffices[
        /** @type {keyof uriTemplateSuffices} */
        (varName.charAt(varName.length - 1))]) {
            suffices[ /** @type {keyof uriTemplateSuffices} */(varName.charAt(varName.length - 1))] = true;
            varName = varName.substring(0, varName.length - 1);
        }
        const varSpec = {
            truncate: truncate,
            name: varName,
            suffices: suffices
        };
        varSpecs.push(varSpec);
        varSpecMap[varName] = varSpec;
        varNames.push(varName);
    }
    /** @type {SubFunction} */
    const subFunction = function (valueFunction) {
        let result = "";
        let startIndex = 0;
        for (let i = 0; i < varSpecs.length; i++) {
            const varSpec = varSpecs[i];
            let value = valueFunction(varSpec.name);
            if (value == null || (Array.isArray(value) && value.length == 0) || (typeof value == 'object' && Object.keys(value).length == 0)) {
                startIndex++;
                continue;
            }
            if (i == startIndex) {
                result += prefix;
            }
            else {
                result += (separator || ",");
            }
            if (Array.isArray(value)) {
                if (showVariables) {
                    result += varSpec.name + "=";
                }
                for (let j = 0; j < value.length; j++) {
                    if (j > 0) {
                        result += varSpec.suffices['*'] ? (separator || ",") : ",";
                        if (varSpec.suffices['*'] && showVariables) {
                            result += varSpec.name + "=";
                        }
                    }
                    result += shouldEscape ? encodeURIComponent(value[j]).replace(/!/g, "%21") : notReallyPercentEncode(value[j]);
                }
            }
            else if (typeof value == "object") {
                if (showVariables && !varSpec.suffices['*']) {
                    result += varSpec.name + "=";
                }
                let first = true;
                for (const key in value) {
                    if (!first) {
                        result += varSpec.suffices['*'] ? (separator || ",") : ",";
                    }
                    first = false;
                    result += shouldEscape ? encodeURIComponent(key).replace(/!/g, "%21") : notReallyPercentEncode(key);
                    result += varSpec.suffices['*'] ? '=' : ",";
                    result += shouldEscape ? encodeURIComponent(value[key]).replace(/!/g, "%21") : notReallyPercentEncode(value[key]);
                }
            }
            else {
                if (showVariables) {
                    result += varSpec.name;
                    if (!trimEmptyString || value != "") {
                        result += "=";
                    }
                }
                if (varSpec.truncate != null) {
                    value = value.substring(0, varSpec.truncate);
                }
                result += shouldEscape ? encodeURIComponent(value).replace(/!/g, "%21") : notReallyPercentEncode(value);
            }
        }
        return result;
    };
    /** @type {GuessFunction} */
    const guessFunction = function (theStringValue, resultObj) {
        let stringValue = theStringValue;
        if (prefix) {
            if ( /** @type {string} */(stringValue).substring(0, prefix.length) == prefix) {
                stringValue = /** @type {string} */ (stringValue).slice(prefix.length);
            }
            else {
                return null;
            }
        }
        if (varSpecs.length == 1 && varSpecs[0].suffices['*']) {
            const varSpec = varSpecs[0];
            const varName = varSpec.name;
            /** @type {(string|string[])[]} */
            const arrayValue = varSpec.suffices['*'] ? /** @type {string} */ (stringValue).split(separator || ",") : [stringValue];
            let hasEquals = (shouldEscape && stringValue.indexOf('=') != -1); // There's otherwise no way to distinguish between "{value*}" for arrays and objects
            for (let i = 1; i < arrayValue.length; i++) {
                stringValue = arrayValue[i];
                if (hasEquals && stringValue.indexOf('=') == -1) {
                    // Bit of a hack - if we're expecting "=" for key/value pairs, and values can't contain "=", then assume a value has been accidentally split
                    arrayValue[i - 1] += (separator || ",") + stringValue;
                    arrayValue.splice(i, 1);
                    i--;
                }
            }
            for (let i = 0; i < arrayValue.length; i++) {
                stringValue = arrayValue[i];
                if (shouldEscape && stringValue.indexOf('=') != -1) {
                    hasEquals = true;
                }
                const innerArrayValue = /** @type {string} */ (stringValue).split(",");
                for (let j = 0; j < innerArrayValue.length; j++) {
                    if (shouldEscape) {
                        innerArrayValue[j] = decodeURIComponent(innerArrayValue[j]);
                    }
                }
                if (innerArrayValue.length == 1) {
                    arrayValue[i] = innerArrayValue[0];
                }
                else {
                    arrayValue[i] = innerArrayValue;
                }
            }
            if (showVariables || hasEquals) {
                const objectValue = resultObj[varName] || {};
                for (let j = 0; j < arrayValue.length; j++) {
                    /** @type {string|string[]} */
                    let innerValue = stringValue;
                    if (showVariables && !innerValue) {
                        // The empty string isn't a valid variable, so if our value is zero-length we have nothing
                        continue;
                    }
                    let innerVarName;
                    if (typeof arrayValue[j] == "string") {
                        stringValue = arrayValue[j];
                        innerVarName = /** @type {string} */ (stringValue).split("=", 1)[0];
                        stringValue = /** @type {string|string[]} */ ( /** @type {string} */(stringValue).slice(innerVarName.length + 1));
                        innerValue = stringValue;
                    }
                    else {
                        stringValue = /** @type {string|string[]} */ (arrayValue[j][0]);
                        innerVarName = /** @type {string} */ (stringValue).split("=", 1)[0];
                        stringValue = /** @type {string|string[]} */ (
                        /** @type {string} */ (stringValue).slice(innerVarName.length + 1));
                        /** @type {string[]} */ (arrayValue[j])[0] = /** @type {string} */ (stringValue);
                        innerValue = arrayValue[j];
                    }
                    if (objectValue[innerVarName] !== undefined) {
                        if (Array.isArray(objectValue[innerVarName])) {
                            objectValue[innerVarName].push(innerValue);
                        }
                        else {
                            objectValue[innerVarName] = [objectValue[innerVarName], innerValue];
                        }
                    }
                    else {
                        objectValue[innerVarName] = innerValue;
                    }
                }
                if (Object.keys(objectValue).length == 1 && objectValue[varName] !== undefined) {
                    resultObj[varName] = objectValue[varName];
                }
                else {
                    resultObj[varName] = objectValue;
                }
            }
            else {
                if (resultObj[varName] !== undefined) {
                    if (Array.isArray(resultObj[varName])) {
                        resultObj[varName] = resultObj[varName].concat(arrayValue);
                    }
                    else {
                        resultObj[varName] = [resultObj[varName]].concat(arrayValue);
                    }
                }
                else {
                    if (arrayValue.length == 1 && !varSpec.suffices['*']) {
                        resultObj[varName] = arrayValue[0];
                    }
                    else {
                        resultObj[varName] = arrayValue;
                    }
                }
            }
        }
        else {
            /** @type {(string|string[])[]} */
            const arrayValue = (varSpecs.length == 1) ? [stringValue] : /** @type {string} */ (stringValue).split(separator || ",");
            /** @type {{[key: number]: number}} */
            const specIndexMap = {};
            for (let i = 0; i < arrayValue.length; i++) {
                // Try from beginning
                let firstStarred = 0;
                for (; firstStarred < varSpecs.length - 1 && firstStarred < i; firstStarred++) {
                    if (varSpecs[firstStarred].suffices['*']) {
                        break;
                    }
                }
                if (firstStarred == i) {
                    // The first [i] of them have no "*" suffix
                    specIndexMap[i] = i;
                    continue;
                }
                else {
                    // Try from the end
                    let lastStarred;
                    for (lastStarred = varSpecs.length - 1; lastStarred > 0 && (varSpecs.length - lastStarred) < (arrayValue.length - i); lastStarred--) {
                        if (varSpecs[lastStarred].suffices['*']) {
                            break;
                        }
                    }
                    if ((varSpecs.length - lastStarred) == (arrayValue.length - i)) {
                        // The last [length - i] of them have no "*" suffix
                        specIndexMap[i] = lastStarred;
                        continue;
                    }
                }
                // Just give up and use the first one
                specIndexMap[i] = firstStarred;
            }
            for (let i = 0; i < arrayValue.length; i++) {
                stringValue = arrayValue[i];
                if (!stringValue && showVariables) {
                    // The empty string isn't a valid variable, so if our value is zero-length we have nothing
                    continue;
                }
                const innerArrayValue = /** @type {string} */ (stringValue).split(",");
                let hasEquals = false;
                let varName;
                let varSpec;
                if (showVariables) {
                    stringValue = /** @type {string|string[]} */ (innerArrayValue[0]); // using innerArrayValue
                    varName = /** @type {string} */ (stringValue).split("=", 1)[0];
                    stringValue = /** @type {string|string[]} */ ( /** @type {string} */(stringValue).slice(varName.length + 1));
                    innerArrayValue[0] = /** @type {string} */ (stringValue);
                    varSpec = varSpecMap[varName] || varSpecs[0];
                }
                else {
                    varSpec = varSpecs[specIndexMap[i]];
                    varName = varSpec.name;
                }
                for (let j = 0; j < innerArrayValue.length; j++) {
                    if (shouldEscape) {
                        innerArrayValue[j] = decodeURIComponent(innerArrayValue[j]);
                    }
                }
                if ((showVariables || varSpec.suffices['*']) && resultObj[varName] !== undefined) {
                    if (Array.isArray(resultObj[varName])) {
                        resultObj[varName] = resultObj[varName].concat(innerArrayValue);
                    }
                    else {
                        resultObj[varName] = [resultObj[varName]].concat(innerArrayValue);
                    }
                }
                else {
                    if (innerArrayValue.length == 1 && !varSpec.suffices['*']) {
                        resultObj[varName] = innerArrayValue[0];
                    }
                    else {
                        resultObj[varName] = innerArrayValue;
                    }
                }
            }
        }
    };
    subFunction.varNames = varNames;
    return {
        prefix: prefix,
        substitution: subFunction,
        unSubstitution: guessFunction
    };
}
/**
 * @param {string} template
 */
function UriTemplate(template) {
    if (!(this instanceof UriTemplate)) {
        return new UriTemplate(template);
    }
    const parts = template.split("{");
    const textParts = [/** @type {string} */ (parts.shift())];
    /** @type {string[]} */
    const prefixes = [];
    /** @type {SubFunction[]} */
    const substitutions = [];
    /** @type {GuessFunction[]} */
    const unSubstitutions = [];
    /** @type {string[]} */
    let varNames = [];
    while (parts.length > 0) {
        const part = /** @type {string} */ (parts.shift());
        const spec = part.split("}")[0];
        const remainder = part.slice(spec.length + 1);
        const funcs = uriTemplateSubstitution(spec);
        substitutions.push(funcs.substitution);
        unSubstitutions.push(funcs.unSubstitution);
        prefixes.push(funcs.prefix);
        textParts.push(remainder);
        varNames = varNames.concat(funcs.substitution.varNames);
    }
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
    this.fill = function (valueFunction) {
        if (valueFunction && typeof valueFunction !== 'function') {
            const value = valueFunction;
            valueFunction = function (varName) {
                return value[varName];
            };
        }
        let result = textParts[0];
        for (let i = 0; i < substitutions.length; i++) {
            const substitution = substitutions[i];
            result += substitution(valueFunction);
            result += textParts[i + 1];
        }
        return result;
    };
    /**
     * @param {string} substituted
     * @returns {Params | undefined}
     */
    this.fromUri = function (substituted) {
        /** @type {{[key: string]: string}} */
        const result = {};
        for (let i = 0; i < textParts.length; i++) {
            const part = textParts[i];
            if (substituted.substring(0, part.length) !== part) {
                return undefined;
            }
            substituted = substituted.slice(part.length);
            if (i >= textParts.length - 1) {
                if (substituted == "") {
                    break;
                }
                else {
                    return undefined;
                }
            }
            let nextPart = textParts[i + 1];
            let offset = i;
            let stringValue;
            while (true) {
                if (offset == textParts.length - 2) {
                    const endPart = substituted.slice(substituted.length - nextPart.length);
                    if (endPart !== nextPart) {
                        return undefined;
                    }
                    stringValue = substituted.substring(0, substituted.length - nextPart.length);
                    substituted = endPart;
                }
                else if (nextPart) {
                    const nextPartPos = substituted.indexOf(nextPart);
                    stringValue = substituted.substring(0, nextPartPos);
                    substituted = substituted.slice(nextPartPos);
                }
                else if (prefixes[offset + 1]) {
                    let nextPartPos = substituted.indexOf(prefixes[offset + 1]);
                    if (nextPartPos === -1)
                        nextPartPos = substituted.length;
                    stringValue = substituted.substring(0, nextPartPos);
                    substituted = substituted.slice(nextPartPos);
                }
                else if (textParts.length > offset + 2) {
                    // If the separator between this variable and the next is blank (with no prefix), continue onwards
                    offset++;
                    nextPart = textParts[offset + 1];
                    continue;
                }
                else {
                    stringValue = substituted;
                    substituted = "";
                }
                break;
            }
            unSubstitutions[i](stringValue, result);
        }
        return result;
    };
    this.varNames = varNames;
    /** @type {string} */
    this.template = template;
}
UriTemplate.prototype = {
    /**
     * @returns {string}
     */
    toString: function () {
        return this.template;
    },
    /**
     * @type {(vars: {[key: string]: undefined|string|{[key: string]: string}}) => string}
     */
    fillFromObject: function (obj) {
        return this.fill(obj);
    }
};
exports.default = UriTemplate;
