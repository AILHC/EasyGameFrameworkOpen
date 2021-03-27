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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9lZ2YtYXBwLnRzIl0sInNvdXJjZXNDb250ZW50IjpbImV4cG9ydCBjbGFzcyBBcHA8TW9kdWxlTWFwID0gYW55PiBpbXBsZW1lbnRzIGVnZi5JQXBwPE1vZHVsZU1hcD4ge1xuICAgIHB1YmxpYyBzdGF0aWMgcmVhZG9ubHkgVU5fUlVOOiBudW1iZXIgPSAwO1xuICAgIHB1YmxpYyBzdGF0aWMgcmVhZG9ubHkgQk9PVElORzogbnVtYmVyID0gMTtcbiAgICBwdWJsaWMgc3RhdGljIHJlYWRvbmx5IEJPT1RFTkQ6IG51bWJlciA9IDI7XG4gICAgcHVibGljIHN0YXRpYyByZWFkb25seSBSVU5JTkc6IG51bWJlciA9IDM7XG4gICAgcHVibGljIHN0YXRpYyByZWFkb25seSBTVE9QOiBudW1iZXIgPSA0O1xuICAgIHByb3RlY3RlZCBfc3RhdGU6IG51bWJlciA9IDA7XG4gICAgcHJvdGVjdGVkIF9tb2R1bGVNYXA6IHsgW2tleTogc3RyaW5nXTogZWdmLklNb2R1bGUgfSA9IHt9O1xuICAgIHB1YmxpYyBnZXQgc3RhdGUoKTogbnVtYmVyIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX3N0YXRlO1xuICAgIH1cbiAgICBwdWJsaWMgZ2V0IG1vZHVsZU1hcCgpOiBNb2R1bGVNYXAge1xuICAgICAgICByZXR1cm4gdGhpcy5fbW9kdWxlTWFwIGFzIGFueTtcbiAgICB9XG4gICAgcHVibGljIGFzeW5jIGJvb3RzdHJhcChib290TG9hZGVycz86IGVnZi5JQm9vdExvYWRlcltdKTogUHJvbWlzZTxib29sZWFuPiB7XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoQXBwLkJPT1RJTkcpO1xuICAgICAgICBpZiAoIWJvb3RMb2FkZXJzIHx8IGJvb3RMb2FkZXJzLmxlbmd0aCA8PSAwKSB7XG4gICAgICAgICAgICB0aGlzLnNldFN0YXRlKEFwcC5CT09URU5EKTtcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9XG4gICAgICAgIGlmIChib290TG9hZGVycyAmJiBib290TG9hZGVycy5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICBjb25zdCBib290UHJvbWlzZXM6IFByb21pc2U8dm9pZD5bXSA9IFtdO1xuICAgICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBib290TG9hZGVycy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgIGNvbnN0IGJvb3RMb2FkZXI6IGVnZi5JQm9vdExvYWRlciA9IGJvb3RMb2FkZXJzW2ldO1xuICAgICAgICAgICAgICAgIGJvb3RQcm9taXNlcy5wdXNoKFxuICAgICAgICAgICAgICAgICAgICBuZXcgUHJvbWlzZSgocmVzLCByZWopID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGJvb3RMb2FkZXIub25Cb290KHRoaXMgYXMgYW55LCAoaXNPaykgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChpc09rKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlcygpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlaigpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgIGF3YWl0IFByb21pc2UuYWxsKGJvb3RQcm9taXNlcyk7XG4gICAgICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZShBcHAuQk9PVEVORCk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgICAgICAgY29uc29sZS5lcnJvcihlKTtcbiAgICAgICAgICAgICAgICB0aGlzLnNldFN0YXRlKEFwcC5CT09URU5EKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwdWJsaWMgaW5pdCgpOiB2b2lkIHtcbiAgICAgICAgY29uc3QgbW9kdWxlTWFwID0gdGhpcy5fbW9kdWxlTWFwO1xuICAgICAgICBsZXQgbW9kdWxlSW5zOiBlZ2YuSU1vZHVsZTtcbiAgICAgICAgaWYgKHRoaXMuc3RhdGUgPT09IEFwcC5SVU5JTkcpIHJldHVybjtcbiAgICAgICAgZm9yIChjb25zdCBrZXkgaW4gbW9kdWxlTWFwKSB7XG4gICAgICAgICAgICBtb2R1bGVJbnMgPSBtb2R1bGVNYXBba2V5XTtcbiAgICAgICAgICAgIG1vZHVsZUlucy5vbkluaXQgJiYgbW9kdWxlSW5zLm9uSW5pdCh0aGlzIGFzIGFueSk7XG4gICAgICAgIH1cbiAgICAgICAgZm9yIChjb25zdCBrZXkgaW4gbW9kdWxlTWFwKSB7XG4gICAgICAgICAgICBtb2R1bGVJbnMgPSBtb2R1bGVNYXBba2V5XTtcbiAgICAgICAgICAgIG1vZHVsZUlucy5vbkFmdGVySW5pdCAmJiBtb2R1bGVJbnMub25BZnRlckluaXQodGhpcyBhcyBhbnkpO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoQXBwLlJVTklORyk7XG4gICAgfVxuICAgIHB1YmxpYyBsb2FkTW9kdWxlKG1vZHVsZUluczogYW55IHwgZWdmLklNb2R1bGUsIGtleT86IGtleW9mIE1vZHVsZU1hcCk6IGJvb2xlYW4ge1xuICAgICAgICBpZiAodGhpcy5fc3RhdGUgPT09IEFwcC5TVE9QKSByZXR1cm4gZmFsc2U7XG4gICAgICAgIGxldCByZXM6IGJvb2xlYW4gPSBmYWxzZTtcbiAgICAgICAgaWYgKCFrZXkpIHtcbiAgICAgICAgICAgIGtleSA9IG1vZHVsZUlucy5rZXkgYXMgbmV2ZXI7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGtleSAmJiB0eXBlb2Yga2V5ID09PSBcInN0cmluZ1wiKSB7XG4gICAgICAgICAgICBpZiAobW9kdWxlSW5zKSB7XG4gICAgICAgICAgICAgICAgaWYgKCF0aGlzLl9tb2R1bGVNYXBba2V5XSkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLl9tb2R1bGVNYXBba2V5XSA9IG1vZHVsZUlucztcbiAgICAgICAgICAgICAgICAgICAgcmVzID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHRoaXMuX3N0YXRlID09PSBBcHAuUlVOSU5HKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBtb2R1bGVJbnMub25Jbml0ICYmIG1vZHVsZUlucy5vbkluaXQodGhpcyk7XG4gICAgICAgICAgICAgICAgICAgICAgICBtb2R1bGVJbnMub25BZnRlckluaXQgJiYgbW9kdWxlSW5zLm9uQWZ0ZXJJbml0KCk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLl9sb2coYOWKoOi9veaooeWdlzrmqKHlnZc6JHtrZXl95bey57uP5a2Y5ZyoLOS4jemHjeWkjeWKoOi9vWApO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgdGhpcy5fbG9nKGDliqDovb3mqKHlnZc65qih5Z2XOiR7a2V5feWunuS+i+S4uuepumApO1xuICAgICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5fbG9nKGDliqDovb3mqKHlnZc65qih5Z2Xa2V55Li656m6YCk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHJlcztcbiAgICB9XG4gICAgcHVibGljIGhhc01vZHVsZShtb2R1bGVLZXk6IGtleW9mIE1vZHVsZU1hcCk6IGJvb2xlYW4ge1xuICAgICAgICByZXR1cm4gISF0aGlzLl9tb2R1bGVNYXBbbW9kdWxlS2V5IGFzIGFueV07XG4gICAgfVxuICAgIHB1YmxpYyBzdG9wKCk6IHZvaWQge1xuICAgICAgICBjb25zdCBtb2R1bGVNYXAgPSB0aGlzLl9tb2R1bGVNYXA7XG4gICAgICAgIGxldCBtb2R1bGVJbnM6IGVnZi5JTW9kdWxlO1xuICAgICAgICB0aGlzLnNldFN0YXRlKEFwcC5TVE9QKTtcbiAgICAgICAgZm9yIChjb25zdCBrZXkgaW4gbW9kdWxlTWFwKSB7XG4gICAgICAgICAgICBtb2R1bGVJbnMgPSBtb2R1bGVNYXBba2V5XTtcbiAgICAgICAgICAgIG1vZHVsZUlucy5vblN0b3AgJiYgbW9kdWxlSW5zLm9uU3RvcCgpO1xuICAgICAgICB9XG4gICAgfVxuICAgIHB1YmxpYyBnZXRNb2R1bGU8SyBleHRlbmRzIGtleW9mIE1vZHVsZU1hcD4obW9kdWxlS2V5OiBLKTogTW9kdWxlTWFwW0tdIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX21vZHVsZU1hcFttb2R1bGVLZXkgYXMgYW55XSBhcyBhbnk7XG4gICAgfVxuXG4gICAgcHJvdGVjdGVkIHNldFN0YXRlKHN0YXRlOiBudW1iZXIpIHtcbiAgICAgICAgaWYgKCFpc05hTih0aGlzLl9zdGF0ZSkpIHtcbiAgICAgICAgICAgIGlmICh0aGlzLl9zdGF0ZSA+PSBzdGF0ZSkgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuX3N0YXRlID0gc3RhdGU7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIOi+k+WHulxuICAgICAqIEBwYXJhbSBsZXZlbCAxIHdhcm4gMiBlcnJvclxuICAgICAqIEBwYXJhbSBtc2dcbiAgICAgKi9cbiAgICBwcm90ZWN0ZWQgX2xvZyhtc2c6IHN0cmluZywgbGV2ZWw/OiBudW1iZXIpOiB2b2lkIHtcbiAgICAgICAgc3dpdGNoIChsZXZlbCkge1xuICAgICAgICAgICAgY2FzZSAxOlxuICAgICAgICAgICAgICAgIGNvbnNvbGUud2Fybihg44CQ5Li756iL5bqP44CRJHttc2d9YCk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIDI6XG4gICAgICAgICAgICAgICAgY29uc29sZS5lcnJvcihg44CQ5Li756iL5bqP44CRJHttc2d9YCk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgICAgIGNvbnNvbGUud2Fybihg44CQ5Li756iL5bqP44CRJHttc2d9YCk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICB9XG59XG4iXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0lBQUE7UUFNYyxXQUFNLEdBQVcsQ0FBQyxDQUFDO1FBQ25CLGVBQVUsR0FBbUMsRUFBRSxDQUFDO0tBeUg3RDtJQXhIRyxzQkFBVyxzQkFBSzthQUFoQjtZQUNJLE9BQU8sSUFBSSxDQUFDLE1BQU0sQ0FBQztTQUN0Qjs7O09BQUE7SUFDRCxzQkFBVywwQkFBUzthQUFwQjtZQUNJLE9BQU8sSUFBSSxDQUFDLFVBQWlCLENBQUM7U0FDakM7OztPQUFBO0lBQ1ksdUJBQVMsR0FBdEIsVUFBdUIsV0FBK0I7Ozs7Ozs7d0JBQ2xELElBQUksQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxDQUFDO3dCQUMzQixJQUFJLENBQUMsV0FBVyxJQUFJLFdBQVcsQ0FBQyxNQUFNLElBQUksQ0FBQyxFQUFFOzRCQUN6QyxJQUFJLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsQ0FBQzs0QkFDM0IsV0FBTyxJQUFJLEVBQUM7eUJBQ2Y7OEJBQ0csV0FBVyxJQUFJLFdBQVcsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFBLEVBQXJDLGNBQXFDO3dCQUMvQixZQUFZLEdBQW9CLEVBQUUsQ0FBQzs0Q0FDaEMsQ0FBQzs0QkFDTixJQUFNLFVBQVUsR0FBb0IsV0FBVyxDQUFDLENBQUMsQ0FBQyxDQUFDOzRCQUNuRCxZQUFZLENBQUMsSUFBSSxDQUNiLElBQUksT0FBTyxDQUFDLFVBQUMsR0FBRyxFQUFFLEdBQUc7Z0NBQ2pC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
