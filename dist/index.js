"use strict";
/**
 * @typedef {import('./choreographer.js').SceneCallback} SceneCallback
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Choreographer = exports.Router = exports.UriTemplate = void 0;
/**
 * @typedef {import('./choreographer.js').Scene} Scene
 */
/**
 * @typedef {import('./choreographer.js').SceneOptions} SceneOptions
 */
var uri_template_js_1 = require("./uri-template.js");
Object.defineProperty(exports, "UriTemplate", { enumerable: true, get: function () { return __importDefault(uri_template_js_1).default; } });
var router_js_1 = require("./router.js");
Object.defineProperty(exports, "Router", { enumerable: true, get: function () { return __importDefault(router_js_1).default; } });
var choreographer_js_1 = require("./choreographer.js");
Object.defineProperty(exports, "Choreographer", { enumerable: true, get: function () { return __importDefault(choreographer_js_1).default; } });
