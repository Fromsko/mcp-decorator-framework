"use strict";
/**
 * Plugin System
 *
 * Interfaces and loader for MCP command plugins
 */
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadPlugins = loadPlugins;
exports.getLoadedPlugins = getLoadedPlugins;
exports.destroyPlugins = destroyPlugins;
/**
 * Loaded plugin references for lifecycle management
 */
var loadedPlugins = [];
/**
 * Load and register plugins
 *
 * @param plugins - Array of plugin instances to load
 * @throws Error if plugin fails to load
 */
function loadPlugins(plugins) {
    return __awaiter(this, void 0, void 0, function () {
        var _i, plugins_1, plugin, commandClasses, _a, commandClasses_1, CommandClass, error_1, errorMessage;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _i = 0, plugins_1 = plugins;
                    _b.label = 1;
                case 1:
                    if (!(_i < plugins_1.length)) return [3 /*break*/, 7];
                    plugin = plugins_1[_i];
                    _b.label = 2;
                case 2:
                    _b.trys.push([2, 5, , 6]);
                    if (!plugin.init) return [3 /*break*/, 4];
                    return [4 /*yield*/, plugin.init()];
                case 3:
                    _b.sent();
                    _b.label = 4;
                case 4:
                    commandClasses = plugin.register();
                    // Instantiate each command class to trigger @Command decorator
                    for (_a = 0, commandClasses_1 = commandClasses; _a < commandClasses_1.length; _a++) {
                        CommandClass = commandClasses_1[_a];
                        new CommandClass();
                    }
                    // Store plugin reference for lifecycle management
                    loadedPlugins.push(plugin);
                    return [3 /*break*/, 6];
                case 5:
                    error_1 = _b.sent();
                    errorMessage = error_1 instanceof Error ? error_1.message : String(error_1);
                    throw new Error("Failed to load plugin \"".concat(plugin.name, "\": ").concat(errorMessage));
                case 6:
                    _i++;
                    return [3 /*break*/, 1];
                case 7: return [2 /*return*/];
            }
        });
    });
}
/**
 * Get all loaded plugins
 */
function getLoadedPlugins() {
    return __spreadArray([], loadedPlugins, true);
}
/**
 * Destroy all loaded plugins
 */
function destroyPlugins() {
    return __awaiter(this, void 0, void 0, function () {
        var _i, loadedPlugins_1, plugin;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _i = 0, loadedPlugins_1 = loadedPlugins;
                    _a.label = 1;
                case 1:
                    if (!(_i < loadedPlugins_1.length)) return [3 /*break*/, 4];
                    plugin = loadedPlugins_1[_i];
                    if (!plugin.destroy) return [3 /*break*/, 3];
                    return [4 /*yield*/, plugin.destroy()];
                case 2:
                    _a.sent();
                    _a.label = 3;
                case 3:
                    _i++;
                    return [3 /*break*/, 1];
                case 4:
                    loadedPlugins.length = 0;
                    return [2 /*return*/];
            }
        });
    });
}
