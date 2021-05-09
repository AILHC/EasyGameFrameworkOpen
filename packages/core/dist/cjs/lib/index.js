'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

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

var App = (function () {
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
                            return [2, true];
                        }
                        if (!(bootLoaders && bootLoaders.length > 0)) return [3, 4];
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
                        return [4, Promise.all(bootPromises)];
                    case 2:
                        _a.sent();
                        this.setState(App.BOOTEND);
                        return [2, true];
                    case 3:
                        e_1 = _a.sent();
                        console.error(e_1);
                        this.setState(App.BOOTEND);
                        return [2, false];
                    case 4: return [2];
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
        if (!isNaN(this._state)) {
            if (this._state >= state)
                return;
        }
        this._state = state;
    };
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

exports.App = App;

    
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VzIjpbIkBhaWxoYy9lZ2YtY29yZS9zcmMvZWdmLWFwcC50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJleHBvcnQgY2xhc3MgQXBwPE1vZHVsZU1hcCA9IGFueT4gaW1wbGVtZW50cyBlZ2YuSUFwcDxNb2R1bGVNYXA+IHtcbiAgICBwdWJsaWMgc3RhdGljIHJlYWRvbmx5IFVOX1JVTjogbnVtYmVyID0gMDtcbiAgICBwdWJsaWMgc3RhdGljIHJlYWRvbmx5IEJPT1RJTkc6IG51bWJlciA9IDE7XG4gICAgcHVibGljIHN0YXRpYyByZWFkb25seSBCT09URU5EOiBudW1iZXIgPSAyO1xuICAgIHB1YmxpYyBzdGF0aWMgcmVhZG9ubHkgUlVOSU5HOiBudW1iZXIgPSAzO1xuICAgIHB1YmxpYyBzdGF0aWMgcmVhZG9ubHkgU1RPUDogbnVtYmVyID0gNDtcbiAgICBwcm90ZWN0ZWQgX3N0YXRlOiBudW1iZXIgPSAwO1xuICAgIHByb3RlY3RlZCBfbW9kdWxlTWFwOiB7IFtrZXk6IHN0cmluZ106IGVnZi5JTW9kdWxlIH0gPSB7fTtcbiAgICBwdWJsaWMgZ2V0IHN0YXRlKCk6IG51bWJlciB7XG4gICAgICAgIHJldHVybiB0aGlzLl9zdGF0ZTtcbiAgICB9XG4gICAgcHVibGljIGdldCBtb2R1bGVNYXAoKTogTW9kdWxlTWFwIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX21vZHVsZU1hcCBhcyBhbnk7XG4gICAgfVxuICAgIHB1YmxpYyBhc3luYyBib290c3RyYXAoYm9vdExvYWRlcnM/OiBlZ2YuSUJvb3RMb2FkZXJbXSk6IFByb21pc2U8Ym9vbGVhbj4ge1xuICAgICAgICB0aGlzLnNldFN0YXRlKEFwcC5CT09USU5HKTtcbiAgICAgICAgaWYgKCFib290TG9hZGVycyB8fCBib290TG9hZGVycy5sZW5ndGggPD0gMCkge1xuICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZShBcHAuQk9PVEVORCk7XG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoYm9vdExvYWRlcnMgJiYgYm9vdExvYWRlcnMubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgY29uc3QgYm9vdFByb21pc2VzOiBQcm9taXNlPHZvaWQ+W10gPSBbXTtcbiAgICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgYm9vdExvYWRlcnMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICBjb25zdCBib290TG9hZGVyOiBlZ2YuSUJvb3RMb2FkZXIgPSBib290TG9hZGVyc1tpXTtcbiAgICAgICAgICAgICAgICBib290UHJvbWlzZXMucHVzaChcbiAgICAgICAgICAgICAgICAgICAgbmV3IFByb21pc2UoKHJlcywgcmVqKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBib290TG9hZGVyLm9uQm9vdCh0aGlzIGFzIGFueSwgKGlzT2spID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoaXNPaykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXMoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZWooKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICBhd2FpdCBQcm9taXNlLmFsbChib290UHJvbWlzZXMpO1xuICAgICAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoQXBwLkJPT1RFTkQpO1xuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoZSk7XG4gICAgICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZShBcHAuQk9PVEVORCk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHVibGljIGluaXQoKTogdm9pZCB7XG4gICAgICAgIGNvbnN0IG1vZHVsZU1hcCA9IHRoaXMuX21vZHVsZU1hcDtcbiAgICAgICAgbGV0IG1vZHVsZUluczogZWdmLklNb2R1bGU7XG4gICAgICAgIGlmICh0aGlzLnN0YXRlID09PSBBcHAuUlVOSU5HKSByZXR1cm47XG4gICAgICAgIGZvciAoY29uc3Qga2V5IGluIG1vZHVsZU1hcCkge1xuICAgICAgICAgICAgbW9kdWxlSW5zID0gbW9kdWxlTWFwW2tleV07XG4gICAgICAgICAgICBtb2R1bGVJbnMub25Jbml0ICYmIG1vZHVsZUlucy5vbkluaXQodGhpcyBhcyBhbnkpO1xuICAgICAgICB9XG4gICAgICAgIGZvciAoY29uc3Qga2V5IGluIG1vZHVsZU1hcCkge1xuICAgICAgICAgICAgbW9kdWxlSW5zID0gbW9kdWxlTWFwW2tleV07XG4gICAgICAgICAgICBtb2R1bGVJbnMub25BZnRlckluaXQgJiYgbW9kdWxlSW5zLm9uQWZ0ZXJJbml0KHRoaXMgYXMgYW55KTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLnNldFN0YXRlKEFwcC5SVU5JTkcpO1xuICAgIH1cbiAgICBwdWJsaWMgbG9hZE1vZHVsZShtb2R1bGVJbnM6IGFueSB8IGVnZi5JTW9kdWxlLCBrZXk/OiBrZXlvZiBNb2R1bGVNYXApOiBib29sZWFuIHtcbiAgICAgICAgaWYgKHRoaXMuX3N0YXRlID09PSBBcHAuU1RPUCkgcmV0dXJuIGZhbHNlO1xuICAgICAgICBsZXQgcmVzOiBib29sZWFuID0gZmFsc2U7XG4gICAgICAgIGlmICgha2V5KSB7XG4gICAgICAgICAgICBrZXkgPSBtb2R1bGVJbnMua2V5IGFzIG5ldmVyO1xuICAgICAgICB9XG4gICAgICAgIGlmIChrZXkgJiYgdHlwZW9mIGtleSA9PT0gXCJzdHJpbmdcIikge1xuICAgICAgICAgICAgaWYgKG1vZHVsZUlucykge1xuICAgICAgICAgICAgICAgIGlmICghdGhpcy5fbW9kdWxlTWFwW2tleV0pIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5fbW9kdWxlTWFwW2tleV0gPSBtb2R1bGVJbnM7XG4gICAgICAgICAgICAgICAgICAgIHJlcyA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgIGlmICh0aGlzLl9zdGF0ZSA9PT0gQXBwLlJVTklORykge1xuICAgICAgICAgICAgICAgICAgICAgICAgbW9kdWxlSW5zLm9uSW5pdCAmJiBtb2R1bGVJbnMub25Jbml0KHRoaXMpO1xuICAgICAgICAgICAgICAgICAgICAgICAgbW9kdWxlSW5zLm9uQWZ0ZXJJbml0ICYmIG1vZHVsZUlucy5vbkFmdGVySW5pdCgpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5fbG9nKGDliqDovb3mqKHlnZc65qih5Z2XOiR7a2V5feW3sue7j+WtmOWcqCzkuI3ph43lpI3liqDovb1gKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHRoaXMuX2xvZyhg5Yqg6L295qih5Z2XOuaooeWdlzoke2tleX3lrp7kvovkuLrnqbpgKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMuX2xvZyhg5Yqg6L295qih5Z2XOuaooeWdl2tleeS4uuepumApO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiByZXM7XG4gICAgfVxuICAgIHB1YmxpYyBoYXNNb2R1bGUobW9kdWxlS2V5OiBrZXlvZiBNb2R1bGVNYXApOiBib29sZWFuIHtcbiAgICAgICAgcmV0dXJuICEhdGhpcy5fbW9kdWxlTWFwW21vZHVsZUtleSBhcyBhbnldO1xuICAgIH1cbiAgICBwdWJsaWMgc3RvcCgpOiB2b2lkIHtcbiAgICAgICAgY29uc3QgbW9kdWxlTWFwID0gdGhpcy5fbW9kdWxlTWFwO1xuICAgICAgICBsZXQgbW9kdWxlSW5zOiBlZ2YuSU1vZHVsZTtcbiAgICAgICAgdGhpcy5zZXRTdGF0ZShBcHAuU1RPUCk7XG4gICAgICAgIGZvciAoY29uc3Qga2V5IGluIG1vZHVsZU1hcCkge1xuICAgICAgICAgICAgbW9kdWxlSW5zID0gbW9kdWxlTWFwW2tleV07XG4gICAgICAgICAgICBtb2R1bGVJbnMub25TdG9wICYmIG1vZHVsZUlucy5vblN0b3AoKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBwdWJsaWMgZ2V0TW9kdWxlPEsgZXh0ZW5kcyBrZXlvZiBNb2R1bGVNYXA+KG1vZHVsZUtleTogSyk6IE1vZHVsZU1hcFtLXSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9tb2R1bGVNYXBbbW9kdWxlS2V5IGFzIGFueV0gYXMgYW55O1xuICAgIH1cblxuICAgIHByb3RlY3RlZCBzZXRTdGF0ZShzdGF0ZTogbnVtYmVyKSB7XG4gICAgICAgIGlmICghaXNOYU4odGhpcy5fc3RhdGUpKSB7XG4gICAgICAgICAgICBpZiAodGhpcy5fc3RhdGUgPj0gc3RhdGUpIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLl9zdGF0ZSA9IHN0YXRlO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiDovpPlh7pcbiAgICAgKiBAcGFyYW0gbGV2ZWwgMSB3YXJuIDIgZXJyb3JcbiAgICAgKiBAcGFyYW0gbXNnXG4gICAgICovXG4gICAgcHJvdGVjdGVkIF9sb2cobXNnOiBzdHJpbmcsIGxldmVsPzogbnVtYmVyKTogdm9pZCB7XG4gICAgICAgIHN3aXRjaCAobGV2ZWwpIHtcbiAgICAgICAgICAgIGNhc2UgMTpcbiAgICAgICAgICAgICAgICBjb25zb2xlLndhcm4oYOOAkOS4u+eoi+W6j+OAkSR7bXNnfWApO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSAyOlxuICAgICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoYOOAkOS4u+eoi+W6j+OAkSR7bXNnfWApO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgICBjb25zb2xlLndhcm4oYOOAkOS4u+eoi+W6j+OAkSR7bXNnfWApO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgfVxufVxuIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztJQUFBO1FBTWMsV0FBTSxHQUFXLENBQUMsQ0FBQztRQUNuQixlQUFVLEdBQW1DLEVBQUUsQ0FBQztLQXlIN0Q7SUF4SEcsc0JBQVcsc0JBQUs7YUFBaEI7WUFDSSxPQUFPLElBQUksQ0FBQyxNQUFNLENBQUM7U0FDdEI7OztPQUFBO0lBQ0Qsc0JBQVcsMEJBQVM7YUFBcEI7WUFDSSxPQUFPLElBQUksQ0FBQyxVQUFpQixDQUFDO1NBQ2pDOzs7T0FBQTtJQUNZLHVCQUFTLEdBQXRCLFVBQXVCLFdBQStCOzs7Ozs7O3dCQUNsRCxJQUFJLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsQ0FBQzt3QkFDM0IsSUFBSSxDQUFDLFdBQVcsSUFBSSxXQUFXLENBQUMsTUFBTSxJQUFJLENBQUMsRUFBRTs0QkFDekMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLENBQUM7NEJBQzNCLFdBQU8sSUFBSSxFQUFDO3lCQUNmOzhCQUNHLFdBQVcsSUFBSSxXQUFXLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQSxFQUFyQyxjQUFxQzt3QkFDL0IsWUFBWSxHQUFvQixFQUFFLENBQUM7NENBQ2hDLENBQUM7NEJBQ04sSUFBTSxVQUFVLEdBQW9CLFdBQVcsQ0FBQyxDQUFDLENBQUMsQ0FBQzs0QkFDbkQsWUFBWSxDQUFDLElBQUksQ0FDYixJQUFJLE9BQU8sQ0FBQyxVQUFDLEdBQUcsRUFBRSxHQUFH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
