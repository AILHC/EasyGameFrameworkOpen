/*! *****************************************************************************
Copyright (c) Microsoft Corporation. All rights reserved.
Licensed under the Apache License, Version 2.0 (the "License"); you may not use
this file except in compliance with the License. You may obtain a copy of the
License at http://www.apache.org/licenses/LICENSE-2.0

THIS CODE IS PROVIDED ON AN *AS IS* BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
KIND, EITHER EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION ANY IMPLIED
WARRANTIES OR CONDITIONS OF TITLE, FITNESS FOR A PARTICULAR PURPOSE,
MERCHANTABLITY OR NON-INFRINGEMENT.

See the Apache Version 2.0 License for specific language governing permissions
and limitations under the License.
***************************************************************************** */

function __awaiter(thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
}

function __generator(thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
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
}

var App = /** @class */ (function () {
    function App() {
        this._state = 0;
        this._moduleMap = {};
    }
    Object.defineProperty(App.prototype, "state", {
        get: function () {
            return this._state;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(App.prototype, "moduleMap", {
        get: function () {
            return this._moduleMap;
        },
        enumerable: false,
        configurable: true
    });
    App.prototype.bootstrap = function (bootLoaders) {
        return __awaiter(this, void 0, void 0, function () {
            var bootPromises, _loop_1, i, e_1;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.setState(App.BOOTING);
                        if (!bootLoaders || bootLoaders.length <= 0) {
                            this.setState(App.BOOTEND);
                            return [2 /*return*/, true];
                        }
                        if (!(bootLoaders && bootLoaders.length > 0)) return [3 /*break*/, 4];
                        bootPromises = [];
                        _loop_1 = function (i) {
                            var bootLoader = bootLoaders[i];
                            bootPromises.push(new Promise(function (res, rej) {
                                bootLoader.onBoot(_this, function (isOk) {
                                    if (isOk) {
                                        res();
                                    }
                                    else {
                                        rej();
                                    }
                                });
                            }));
                        };
                        for (i = 0; i < bootLoaders.length; i++) {
                            _loop_1(i);
                        }
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, Promise.all(bootPromises)];
                    case 2:
                        _a.sent();
                        this.setState(App.BOOTEND);
                        return [2 /*return*/, true];
                    case 3:
                        e_1 = _a.sent();
                        console.error(e_1);
                        this.setState(App.BOOTEND);
                        return [2 /*return*/, false];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    App.prototype.init = function () {
        var moduleMap = this._moduleMap;
        var moduleIns;
        if (this.state === App.RUNING)
            return;
        for (var key in moduleMap) {
            moduleIns = moduleMap[key];
            moduleIns.onInit && moduleIns.onInit(this);
        }
        for (var key in moduleMap) {
            moduleIns = moduleMap[key];
            moduleIns.onAfterInit && moduleIns.onAfterInit(this);
        }
        this.setState(App.RUNING);
    };
    App.prototype.loadModule = function (moduleIns, key) {
        if (this._state === App.STOP)
            return false;
        var res = false;
        if (!key) {
            key = moduleIns.key;
        }
        if (key && typeof key === "string") {
            if (moduleIns) {
                if (!this._moduleMap[key]) {
                    this._moduleMap[key] = moduleIns;
                    res = true;
                    if (this._state === App.RUNING) {
                        moduleIns.onInit && moduleIns.onInit(this);
                        moduleIns.onAfterInit && moduleIns.onAfterInit();
                    }
                }
                else {
                    this._log("\u52A0\u8F7D\u6A21\u5757:\u6A21\u5757:" + key + "\u5DF2\u7ECF\u5B58\u5728,\u4E0D\u91CD\u590D\u52A0\u8F7D");
                }
            }
            else {
                this._log("\u52A0\u8F7D\u6A21\u5757:\u6A21\u5757:" + key + "\u5B9E\u4F8B\u4E3A\u7A7A");
            }
        }
        else {
            this._log("\u52A0\u8F7D\u6A21\u5757:\u6A21\u5757key\u4E3A\u7A7A");
        }
        return res;
    };
    App.prototype.hasModule = function (moduleKey) {
        return !!this._moduleMap[moduleKey];
    };
    App.prototype.stop = function () {
        var moduleMap = this._moduleMap;
        var moduleIns;
        this.setState(App.STOP);
        for (var key in moduleMap) {
            moduleIns = moduleMap[key];
            moduleIns.onStop && moduleIns.onStop();
        }
    };
    App.prototype.getModule = function (moduleKey) {
        return this._moduleMap[moduleKey];
    };
    App.prototype.setState = function (state) {
        this._state = state;
    };
    /**
     * 输出
     * @param level 1 warn 2 error
     * @param msg
     */
    App.prototype._log = function (msg, level) {
        switch (level) {
            case 1:
                console.warn("\u3010\u4E3B\u7A0B\u5E8F\u3011" + msg);
                break;
            case 2:
                console.error("\u3010\u4E3B\u7A0B\u5E8F\u3011" + msg);
                break;
            default:
                console.warn("\u3010\u4E3B\u7A0B\u5E8F\u3011" + msg);
                break;
        }
    };
    App.UN_RUN = 0;
    App.BOOTING = 1;
    App.BOOTEND = 2;
    App.RUNING = 3;
    App.STOP = 4;
    return App;
}());

export { App };
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXgubWpzIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvZWdmLWFwcC50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJleHBvcnQgY2xhc3MgQXBwPE1vZHVsZU1hcCA9IGFueT4gaW1wbGVtZW50cyBlZ2YuSUFwcDxNb2R1bGVNYXA+IHtcbiAgICBwdWJsaWMgc3RhdGljIHJlYWRvbmx5IFVOX1JVTjogbnVtYmVyID0gMDtcbiAgICBwdWJsaWMgc3RhdGljIHJlYWRvbmx5IEJPT1RJTkc6IG51bWJlciA9IDE7XG4gICAgcHVibGljIHN0YXRpYyByZWFkb25seSBCT09URU5EOiBudW1iZXIgPSAyO1xuICAgIHB1YmxpYyBzdGF0aWMgcmVhZG9ubHkgUlVOSU5HOiBudW1iZXIgPSAzO1xuICAgIHB1YmxpYyBzdGF0aWMgcmVhZG9ubHkgU1RPUDogbnVtYmVyID0gNDtcbiAgICBwcm90ZWN0ZWQgX3N0YXRlOiBudW1iZXIgPSAwO1xuICAgIHByb3RlY3RlZCBfbW9kdWxlTWFwOiB7IFtrZXk6IHN0cmluZ106IGVnZi5JTW9kdWxlIH0gPSB7fTtcbiAgICBwdWJsaWMgZ2V0IHN0YXRlKCk6IG51bWJlciB7XG4gICAgICAgIHJldHVybiB0aGlzLl9zdGF0ZTtcbiAgICB9XG4gICAgcHVibGljIGdldCBtb2R1bGVNYXAoKTogTW9kdWxlTWFwIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX21vZHVsZU1hcCBhcyBhbnk7XG4gICAgfVxuICAgIHB1YmxpYyBhc3luYyBib290c3RyYXAoYm9vdExvYWRlcnM/OiBlZ2YuSUJvb3RMb2FkZXJbXSk6IFByb21pc2U8Ym9vbGVhbj4ge1xuICAgICAgICB0aGlzLnNldFN0YXRlKEFwcC5CT09USU5HKTtcbiAgICAgICAgaWYgKCFib290TG9hZGVycyB8fCBib290TG9hZGVycy5sZW5ndGggPD0gMCkge1xuICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZShBcHAuQk9PVEVORCk7XG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoYm9vdExvYWRlcnMgJiYgYm9vdExvYWRlcnMubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgY29uc3QgYm9vdFByb21pc2VzOiBQcm9taXNlPGJvb2xlYW4+W10gPSBbXTtcbiAgICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgYm9vdExvYWRlcnMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICBjb25zdCBib290TG9hZGVyOiBlZ2YuSUJvb3RMb2FkZXIgPSBib290TG9hZGVyc1tpXTtcbiAgICAgICAgICAgICAgICBib290UHJvbWlzZXMucHVzaChuZXcgUHJvbWlzZSgocmVzLCByZWopID0+IHtcbiAgICAgICAgICAgICAgICAgICAgYm9vdExvYWRlci5vbkJvb3QodGhpcyBhcyBhbnksIChpc09rKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoaXNPaykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlcygpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZWooKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfSkpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICBhd2FpdCBQcm9taXNlLmFsbChib290UHJvbWlzZXMpO1xuICAgICAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoQXBwLkJPT1RFTkQpO1xuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmVycm9yKGUpO1xuICAgICAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoQXBwLkJPT1RFTkQpO1xuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIHB1YmxpYyBpbml0KCk6IHZvaWQge1xuICAgICAgICBjb25zdCBtb2R1bGVNYXAgPSB0aGlzLl9tb2R1bGVNYXA7XG4gICAgICAgIGxldCBtb2R1bGVJbnM6IGVnZi5JTW9kdWxlO1xuICAgICAgICBpZiAodGhpcy5zdGF0ZSA9PT0gQXBwLlJVTklORykgcmV0dXJuO1xuICAgICAgICBmb3IgKGNvbnN0IGtleSBpbiBtb2R1bGVNYXApIHtcbiAgICAgICAgICAgIG1vZHVsZUlucyA9IG1vZHVsZU1hcFtrZXldO1xuICAgICAgICAgICAgbW9kdWxlSW5zLm9uSW5pdCAmJiBtb2R1bGVJbnMub25Jbml0KHRoaXMgYXMgYW55KTtcbiAgICAgICAgfVxuICAgICAgICBmb3IgKGNvbnN0IGtleSBpbiBtb2R1bGVNYXApIHtcbiAgICAgICAgICAgIG1vZHVsZUlucyA9IG1vZHVsZU1hcFtrZXldO1xuICAgICAgICAgICAgbW9kdWxlSW5zLm9uQWZ0ZXJJbml0ICYmIG1vZHVsZUlucy5vbkFmdGVySW5pdCh0aGlzIGFzIGFueSk7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5zZXRTdGF0ZShBcHAuUlVOSU5HKTtcbiAgICB9XG4gICAgcHVibGljIGxvYWRNb2R1bGUobW9kdWxlSW5zOiBhbnkgfCBlZ2YuSU1vZHVsZSwga2V5Pzoga2V5b2YgTW9kdWxlTWFwKTogYm9vbGVhbiB7XG4gICAgICAgIGlmICh0aGlzLl9zdGF0ZSA9PT0gQXBwLlNUT1ApIHJldHVybiBmYWxzZTtcbiAgICAgICAgbGV0IHJlczogYm9vbGVhbiA9IGZhbHNlO1xuICAgICAgICBpZiAoIWtleSkge1xuICAgICAgICAgICAga2V5ID0gbW9kdWxlSW5zLmtleSBhcyBuZXZlcjtcbiAgICAgICAgfVxuICAgICAgICBpZiAoa2V5ICYmIHR5cGVvZiBrZXkgPT09IFwic3RyaW5nXCIpIHtcbiAgICAgICAgICAgIGlmIChtb2R1bGVJbnMpIHtcbiAgICAgICAgICAgICAgICBpZiAoIXRoaXMuX21vZHVsZU1hcFtrZXldKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX21vZHVsZU1hcFtrZXldID0gbW9kdWxlSW5zO1xuICAgICAgICAgICAgICAgICAgICByZXMgPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICBpZiAodGhpcy5fc3RhdGUgPT09IEFwcC5SVU5JTkcpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIG1vZHVsZUlucy5vbkluaXQgJiYgbW9kdWxlSW5zLm9uSW5pdCh0aGlzKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIG1vZHVsZUlucy5vbkFmdGVySW5pdCAmJiBtb2R1bGVJbnMub25BZnRlckluaXQoKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX2xvZyhg5Yqg6L295qih5Z2XOuaooeWdlzoke2tleX3lt7Lnu4/lrZjlnKgs5LiN6YeN5aSN5Yqg6L29YCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICB0aGlzLl9sb2coYOWKoOi9veaooeWdlzrmqKHlnZc6JHtrZXl95a6e5L6L5Li656m6YCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLl9sb2coYOWKoOi9veaooeWdlzrmqKHlnZdrZXnkuLrnqbpgKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcmVzO1xuICAgIH1cbiAgICBwdWJsaWMgaGFzTW9kdWxlKG1vZHVsZUtleToga2V5b2YgTW9kdWxlTWFwKTogYm9vbGVhbiB7XG4gICAgICAgIHJldHVybiAhIXRoaXMuX21vZHVsZU1hcFttb2R1bGVLZXkgYXMgYW55XTtcbiAgICB9XG4gICAgcHVibGljIHN0b3AoKTogdm9pZCB7XG4gICAgICAgIGNvbnN0IG1vZHVsZU1hcCA9IHRoaXMuX21vZHVsZU1hcDtcbiAgICAgICAgbGV0IG1vZHVsZUluczogZWdmLklNb2R1bGU7XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoQXBwLlNUT1ApO1xuICAgICAgICBmb3IgKGNvbnN0IGtleSBpbiBtb2R1bGVNYXApIHtcbiAgICAgICAgICAgIG1vZHVsZUlucyA9IG1vZHVsZU1hcFtrZXldO1xuICAgICAgICAgICAgbW9kdWxlSW5zLm9uU3RvcCAmJiBtb2R1bGVJbnMub25TdG9wKCk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgcHVibGljIGdldE1vZHVsZTxLIGV4dGVuZHMga2V5b2YgTW9kdWxlTWFwPihtb2R1bGVLZXk6IEspOiBNb2R1bGVNYXBbS10ge1xuICAgICAgICByZXR1cm4gdGhpcy5fbW9kdWxlTWFwW21vZHVsZUtleSBhcyBhbnldIGFzIGFueTtcbiAgICB9XG5cbiAgICBwcm90ZWN0ZWQgc2V0U3RhdGUoc3RhdGU6IG51bWJlcikge1xuICAgICAgICB0aGlzLl9zdGF0ZSA9IHN0YXRlO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiDovpPlh7pcbiAgICAgKiBAcGFyYW0gbGV2ZWwgMSB3YXJuIDIgZXJyb3JcbiAgICAgKiBAcGFyYW0gbXNnIFxuICAgICAqL1xuICAgIHByb3RlY3RlZCBfbG9nKG1zZzogc3RyaW5nLCBsZXZlbD86IG51bWJlcik6IHZvaWQge1xuICAgICAgICBzd2l0Y2ggKGxldmVsKSB7XG4gICAgICAgICAgICBjYXNlIDE6XG4gICAgICAgICAgICAgICAgY29uc29sZS53YXJuKGDjgJDkuLvnqIvluo/jgJEke21zZ31gKTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgMjpcbiAgICAgICAgICAgICAgICBjb25zb2xlLmVycm9yKGDjgJDkuLvnqIvluo/jgJEke21zZ31gKTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAgICAgY29uc29sZS53YXJuKGDjgJDkuLvnqIvluo/jgJEke21zZ31gKTtcbiAgICAgICAgICAg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
