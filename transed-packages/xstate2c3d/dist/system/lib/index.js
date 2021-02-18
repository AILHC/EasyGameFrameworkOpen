System.register('@ailhc/xstate2c3d', [], function (exports) {
  'use strict';
  return {
    execute: function () {

      exports({
        ActionTypes: void 0,
        InterpreterStatus: void 0,
        Machine: Machine,
        SpecialTargets: void 0,
        createMachine: createMachine,
        doneInvoke: doneInvoke,
        forwardTo: forwardTo,
        interpret: interpret,
        mapState: mapState,
        matchState: matchState,
        matchesState: matchesState,
        send: send$1,
        sendParent: sendParent,
        sendUpdate: sendUpdate,
        spawn: spawn
      });

      /*! *****************************************************************************
      Copyright (c) Microsoft Corporation.

      Permission to use, copy, modify, and/or distribute this software for any
      purpose with or without fee is hereby granted.

      THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
      REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
      AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
      INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
      LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
      OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
      PERFORMANCE OF THIS SOFTWARE.
      ***************************************************************************** */
      var __assign = function () {
        __assign = Object.assign || function __assign(t) {
          for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];

            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
          }

          return t;
        };

        return __assign.apply(this, arguments);
      };

      function __rest(s, e) {
        var t = {};

        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0) t[p] = s[p];

        if (s != null && typeof Object.getOwnPropertySymbols === "function") for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
          if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i])) t[p[i]] = s[p[i]];
        }
        return t;
      }

      function __values(o) {
        var s = typeof Symbol === "function" && Symbol.iterator,
            m = s && o[s],
            i = 0;
        if (m) return m.call(o);
        if (o && typeof o.length === "number") return {
          next: function () {
            if (o && i >= o.length) o = void 0;
            return {
              value: o && o[i++],
              done: !o
            };
          }
        };
        throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
      }

      function __read(o, n) {
        var m = typeof Symbol === "function" && o[Symbol.iterator];
        if (!m) return o;
        var i = m.call(o),
            r,
            ar = [],
            e;

        try {
          while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
        } catch (error) {
          e = {
            error: error
          };
        } finally {
          try {
            if (r && !r.done && (m = i["return"])) m.call(i);
          } finally {
            if (e) throw e.error;
          }
        }

        return ar;
      }

      function __spread() {
        for (var ar = [], i = 0; i < arguments.length; i++) ar = ar.concat(__read(arguments[i]));

        return ar;
      }

      var STATE_DELIMITER = '.';
      var EMPTY_ACTIVITY_MAP = {};
      var DEFAULT_GUARD_TYPE = 'xstate.guard';
      var TARGETLESS_KEY = '';

      var IS_PRODUCTION = process.env.NODE_ENV === 'production';

      function keys(value) {
        return Object.keys(value);
      }

      function matchesState(parentStateId, childStateId, delimiter) {
        if (delimiter === void 0) {
          delimiter = STATE_DELIMITER;
        }

        var parentStateValue = toStateValue(parentStateId, delimiter);
        var childStateValue = toStateValue(childStateId, delimiter);

        if (isString(childStateValue)) {
          if (isString(parentStateValue)) {
            return childStateValue === parentStateValue;
          } // Parent more specific than child


          return false;
        }

        if (isString(parentStateValue)) {
          return parentStateValue in childStateValue;
        }

        return keys(parentStateValue).every(function (key) {
          if (!(key in childStateValue)) {
            return false;
          }

          return matchesState(parentStateValue[key], childStateValue[key]);
        });
      }

      function getEventType(event) {
        try {
          return isString(event) || typeof event === 'number' ? "" + event : event.type;
        } catch (e) {
          throw new Error('Events must be strings or objects with a string event.type property.');
        }
      }

      function toStatePath(stateId, delimiter) {
        try {
          if (isArray(stateId)) {
            return stateId;
          }

          return stateId.toString().split(delimiter);
        } catch (e) {
          throw new Error("'" + stateId + "' is not a valid state path.");
        }
      }

      function isStateLike(state) {
        return typeof state === 'object' && 'value' in state && 'context' in state && 'event' in state && '_event' in state;
      }

      function toStateValue(stateValue, delimiter) {
        if (isStateLike(stateValue)) {
          return stateValue.value;
        }

        if (isArray(stateValue)) {
          return pathToStateValue(stateValue);
        }

        if (typeof stateValue !== 'string') {
          return stateValue;
        }

        var statePath = toStatePath(stateValue, delimiter);
        return pathToStateValue(statePath);
      }

      function pathToStateValue(statePath) {
        if (statePath.length === 1) {
          return statePath[0];
        }

        var value = {};
        var marker = value;

        for (var i = 0; i < statePath.length - 1; i++) {
          if (i === statePath.length - 2) {
            marker[statePath[i]] = statePath[i + 1];
          } else {
            marker[statePath[i]] = {};
            marker = marker[statePath[i]];
          }
        }

        return value;
      }

      function mapValues(collection, iteratee) {
        var result = {};
        var collectionKeys = keys(collection);

        for (var i = 0; i < collectionKeys.length; i++) {
          var key = collectionKeys[i];
          result[key] = iteratee(collection[key], key, collection, i);
        }

        return result;
      }

      function mapFilterValues(collection, iteratee, predicate) {
        var e_1, _a;

        var result = {};

        try {
          for (var _b = __values(keys(collection)), _c = _b.next(); !_c.done; _c = _b.next()) {
            var key = _c.value;
            var item = collection[key];

            if (!predicate(item)) {
              continue;
            }

            result[key] = iteratee(item, key, collection);
          }
        } catch (e_1_1) {
          e_1 = {
            error: e_1_1
          };
        } finally {
          try {
            if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
          } finally {
            if (e_1) throw e_1.error;
          }
        }

        return result;
      }
      /**
       * Retrieves a value at the given path.
       * @param props The deep path to the prop of the desired value
       */


      var path = function (props) {
        return function (object) {
          var e_2, _a;

          var result = object;

          try {
            for (var props_1 = __values(props), props_1_1 = props_1.next(); !props_1_1.done; props_1_1 = props_1.next()) {
              var prop = props_1_1.value;
              result = result[prop];
            }
          } catch (e_2_1) {
            e_2 = {
              error: e_2_1
            };
          } finally {
            try {
              if (props_1_1 && !props_1_1.done && (_a = props_1.return)) _a.call(props_1);
            } finally {
              if (e_2) throw e_2.error;
            }
          }

          return result;
        };
      };
      /**
       * Retrieves a value at the given path via the nested accessor prop.
       * @param props The deep path to the prop of the desired value
       */


      function nestedPath(props, accessorProp) {
        return function (object) {
          var e_3, _a;

          var result = object;

          try {
            for (var props_2 = __values(props), props_2_1 = props_2.next(); !props_2_1.done; props_2_1 = props_2.next()) {
              var prop = props_2_1.value;
              result = result[accessorProp][prop];
            }
          } catch (e_3_1) {
            e_3 = {
              error: e_3_1
            };
          } finally {
            try {
              if (props_2_1 && !props_2_1.done && (_a = props_2.return)) _a.call(props_2);
            } finally {
              if (e_3) throw e_3.error;
            }
          }

          return result;
        };
      }

      function toStatePaths(stateValue) {
        if (!stateValue) {
          return [[]];
        }

        if (isString(stateValue)) {
          return [[stateValue]];
        }

        var result = flatten(keys(stateValue).map(function (key) {
          var subStateValue = stateValue[key];

          if (typeof subStateValue !== 'string' && (!subStateValue || !Object.keys(subStateValue).length)) {
            return [[key]];
          }

          return toStatePaths(stateValue[key]).map(function (subPath) {
            return [key].concat(subPath);
          });
        }));
        return result;
      }

      function flatten(array) {
        var _a;

        return (_a = []).concat.apply(_a, __spread(array));
      }

      function toArrayStrict(value) {
        if (isArray(value)) {
          return value;
        }

        return [value];
      }

      function toArray(value) {
        if (value === undefined) {
          return [];
        }

        return toArrayStrict(value);
      }

      function mapContext(mapper, context, _event) {
        var e_5, _a;

        if (isFunction(mapper)) {
          return mapper(context, _event.data);
        }

        var result = {};

        try {
          for (var _b = __values(Object.keys(mapper)), _c = _b.next(); !_c.done; _c = _b.next()) {
            var key = _c.value;
            var subMapper = mapper[key];

            if (isFunction(subMapper)) {
              result[key] = subMapper(context, _event.data);
            } else {
              result[key] = subMapper;
            }
          }
        } catch (e_5_1) {
          e_5 = {
            error: e_5_1
          };
        } finally {
          try {
            if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
          } finally {
            if (e_5) throw e_5.error;
          }
        }

        return result;
      }

      function isBuiltInEvent(eventType) {
        return /^(done|error)\./.test(eventType);
      }

      function isPromiseLike(value) {
        if (value instanceof Promise) {
          return true;
        } // Check if shape matches the Promise/A+ specification for a "thenable".


        if (value !== null && (isFunction(value) || typeof value === 'object') && isFunction(value.then)) {
          return true;
        }

        return false;
      }

      function partition(items, predicate) {
        var e_6, _a;

        var _b = __read([[], []], 2),
            truthy = _b[0],
            falsy = _b[1];

        try {
          for (var items_1 = __values(items), items_1_1 = items_1.next(); !items_1_1.done; items_1_1 = items_1.next()) {
            var item = items_1_1.value;

            if (predicate(item)) {
              truthy.push(item);
            } else {
              falsy.push(item);
            }
          }
        } catch (e_6_1) {
          e_6 = {
            error: e_6_1
          };
        } finally {
          try {
            if (items_1_1 && !items_1_1.done && (_a = items_1.return)) _a.call(items_1);
          } finally {
            if (e_6) throw e_6.error;
          }
        }

        return [truthy, falsy];
      }

      function updateHistoryStates(hist, stateValue) {
        return mapValues(hist.states, function (subHist, key) {
          if (!subHist) {
            return undefined;
          }

          var subStateValue = (isString(stateValue) ? undefined : stateValue[key]) || (subHist ? subHist.current : undefined);

          if (!subStateValue) {
            return undefined;
          }

          return {
            current: subStateValue,
            states: updateHistoryStates(subHist, subStateValue)
          };
        });
      }

      function updateHistoryValue(hist, stateValue) {
        return {
          current: stateValue,
          states: updateHistoryStates(hist, stateValue)
        };
      }

      function updateContext(context, _event, assignActions, state) {
        if (!IS_PRODUCTION) {
          warn(!!context, 'Attempting to update undefined context');
        }

        var updatedContext = context ? assignActions.reduce(function (acc, assignAction) {
          var e_7, _a;

          var assignment = assignAction.assignment;
          var meta = {
            state: state,
            action: assignAction,
            _event: _event
          };
          var partialUpdate = {};

          if (isFunction(assignment)) {
            partialUpdate = assignment(acc, _event.data, meta);
          } else {
            try {
              for (var _b = __values(keys(assignment)), _c = _b.next(); !_c.done; _c = _b.next()) {
                var key = _c.value;
                var propAssignment = assignment[key];
                partialUpdate[key] = isFunction(propAssignment) ? propAssignment(acc, _event.data, meta) : propAssignment;
              }
            } catch (e_7_1) {
              e_7 = {
                error: e_7_1
              };
            } finally {
              try {
                if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
              } finally {
                if (e_7) throw e_7.error;
              }
            }
          }

          return Object.assign({}, acc, partialUpdate);
        }, context) : context;
        return updatedContext;
      } // tslint:disable-next-line:no-empty


      var warn = function () {};

      if (!IS_PRODUCTION) {
        warn = function (condition, message) {
          var error = condition instanceof Error ? condition : undefined;

          if (!error && condition) {
            return;
          }

          if (console !== undefined) {
            var args = ["Warning: " + message];

            if (error) {
              args.push(error);
            } // tslint:disable-next-line:no-console


            console.warn.apply(console, args);
          }
        };
      }

      function isArray(value) {
        return Array.isArray(value);
      } // tslint:disable-next-line:ban-types


      function isFunction(value) {
        return typeof value === 'function';
      }

      function isString(value) {
        return typeof value === 'string';
      } // export function memoizedGetter<T, TP extends { prototype: object }>(
      //   o: TP,
      //   property: string,
      //   getter: () => T
      // ): void {
      //   Object.defineProperty(o.prototype, property, {
      //     get: getter,
      //     enumerable: false,
      //     configurable: false
      //   });
      // }


      function toGuard(condition, guardMap) {
        if (!condition) {
          return undefined;
        }

        if (isString(condition)) {
          return {
            type: DEFAULT_GUARD_TYPE,
            name: condition,
            predicate: guardMap ? guardMap[condition] : undefined
          };
        }

        if (isFunction(condition)) {
          return {
            type: DEFAULT_GUARD_TYPE,
            name: condition.name,
            predicate: condition
          };
        }

        return condition;
      }

      function isObservable(value) {
        try {
          return 'subscribe' in value && isFunction(value.subscribe);
        } catch (e) {
          return false;
        }
      }

      var symbolObservable = /*#__PURE__*/function () {
        return typeof Symbol === 'function' && Symbol.observable || '@@observable';
      }();

      function isMachine(value) {
        try {
          return '__xstatenode' in value;
        } catch (e) {
          return false;
        }
      }

      function isActor(value) {
        return !!value && typeof value.send === 'function';
      }

      var uniqueId = /*#__PURE__*/function () {
        var currentId = 0;
        return function () {
          currentId++;
          return currentId.toString(16);
        };
      }();

      function toEventObject(event, payload // id?: TEvent['type']
      ) {
        if (isString(event) || typeof event === 'number') {
          return __assign({
            type: event
          }, payload);
        }

        return event;
      }

      function toSCXMLEvent(event, scxmlEvent) {
        if (!isString(event) && '$$type' in event && event.$$type === 'scxml') {
          return event;
        }

        var eventObject = toEventObject(event);
        return __assign({
          name: eventObject.type,
          data: eventObject,
          $$type: 'scxml',
          type: 'external'
        }, scxmlEvent);
      }

      function toTransitionConfigArray(event, configLike) {
        var transitions = toArrayStrict(configLike).map(function (transitionLike) {
          if (typeof transitionLike === 'undefined' || typeof transitionLike === 'string' || isMachine(transitionLike)) {
            return {
              target: transitionLike,
              event: event
            };
          }

          return __assign(__assign({}, transitionLike), {
            event: event
          });
        });
        return transitions;
      }

      function normalizeTarget(target) {
        if (target === undefined || target === TARGETLESS_KEY) {
          return undefined;
        }

        return toArray(target);
      }

      function reportUnhandledExceptionOnInvocation(originalError, currentError, id) {
        if (!IS_PRODUCTION) {
          var originalStackTrace = originalError.stack ? " Stacktrace was '" + originalError.stack + "'" : '';

          if (originalError === currentError) {
            // tslint:disable-next-line:no-console
            console.error("Missing onError handler for invocation '" + id + "', error was '" + originalError + "'." + originalStackTrace);
          } else {
            var stackTrace = currentError.stack ? " Stacktrace was '" + currentError.stack + "'" : ''; // tslint:disable-next-line:no-console

            console.error("Missing onError handler and/or unhandled exception/promise rejection for invocation '" + id + "'. " + ("Original error: '" + originalError + "'. " + originalStackTrace + " Current error is '" + currentError + "'." + stackTrace));
          }
        }
      }

      function evaluateGuard(machine, guard, context, _event, state) {
        var guards = machine.options.guards;
        var guardMeta = {
          state: state,
          cond: guard,
          _event: _event
        }; // TODO: do not hardcode!

        if (guard.type === DEFAULT_GUARD_TYPE) {
          return guard.predicate(context, _event.data, guardMeta);
        }

        var condFn = guards[guard.type];

        if (!condFn) {
          throw new Error("Guard '" + guard.type + "' is not implemented on machine '" + machine.id + "'.");
        }

        return condFn(context, _event.data, guardMeta);
      }

      function toInvokeSource(src) {
        if (typeof src === 'string') {
          return {
            type: src
          };
        }

        return src;
      }

      function toObserver(nextHandler, errorHandler, completionHandler) {
        if (typeof nextHandler === 'object') {
          return nextHandler;
        }

        var noop = function () {
          return void 0;
        };

        return {
          next: nextHandler,
          error: errorHandler || noop,
          complete: completionHandler || noop
        };
      }

      function mapState(stateMap, stateId) {
        var e_1, _a;

        var foundStateId;

        try {
          for (var _b = __values(keys(stateMap)), _c = _b.next(); !_c.done; _c = _b.next()) {
            var mappedStateId = _c.value;

            if (matchesState(mappedStateId, stateId) && (!foundStateId || stateId.length > foundStateId.length)) {
              foundStateId = mappedStateId;
            }
          }
        } catch (e_1_1) {
          e_1 = {
            error: e_1_1
          };
        } finally {
          try {
            if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
          } finally {
            if (e_1) throw e_1.error;
          }
        }

        return stateMap[foundStateId];
      }

      var ActionTypes;

      (function (ActionTypes) {
        ActionTypes["Start"] = "xstate.start";
        ActionTypes["Stop"] = "xstate.stop";
        ActionTypes["Raise"] = "xstate.raise";
        ActionTypes["Send"] = "xstate.send";
        ActionTypes["Cancel"] = "xstate.cancel";
        ActionTypes["NullEvent"] = "";
        ActionTypes["Assign"] = "xstate.assign";
        ActionTypes["After"] = "xstate.after";
        ActionTypes["DoneState"] = "done.state";
        ActionTypes["DoneInvoke"] = "done.invoke";
        ActionTypes["Log"] = "xstate.log";
        ActionTypes["Init"] = "xstate.init";
        ActionTypes["Invoke"] = "xstate.invoke";
        ActionTypes["ErrorExecution"] = "error.execution";
        ActionTypes["ErrorCommunication"] = "error.communication";
        ActionTypes["ErrorPlatform"] = "error.platform";
        ActionTypes["ErrorCustom"] = "xstate.error";
        ActionTypes["Update"] = "xstate.update";
        ActionTypes["Pure"] = "xstate.pure";
        ActionTypes["Choose"] = "xstate.choose";
      })(ActionTypes || (ActionTypes = exports('ActionTypes', {})));

      var SpecialTargets;

      (function (SpecialTargets) {
        SpecialTargets["Parent"] = "#_parent";
        SpecialTargets["Internal"] = "#_internal";
      })(SpecialTargets || (SpecialTargets = exports('SpecialTargets', {})));

      var start = ActionTypes.Start;
      var stop = ActionTypes.Stop;
      var raise = ActionTypes.Raise;
      var send = ActionTypes.Send;
      var cancel = ActionTypes.Cancel;
      var nullEvent = ActionTypes.NullEvent;
      var assign = ActionTypes.Assign;
      ActionTypes.After;
      ActionTypes.DoneState;
      var log = ActionTypes.Log;
      var init = ActionTypes.Init;
      var invoke = ActionTypes.Invoke;
      ActionTypes.ErrorExecution;
      var errorPlatform = ActionTypes.ErrorPlatform;
      var error = ActionTypes.ErrorCustom;
      var update = ActionTypes.Update;
      var choose = ActionTypes.Choose;
      var pure = ActionTypes.Pure;

      var initEvent = /*#__PURE__*/toSCXMLEvent({
        type: init
      });

      function getActionFunction(actionType, actionFunctionMap) {
        return actionFunctionMap ? actionFunctionMap[actionType] || undefined : undefined;
      }

      function toActionObject(action, actionFunctionMap) {
        var actionObject;

        if (isString(action) || typeof action === 'number') {
          var exec = getActionFunction(action, actionFunctionMap);

          if (isFunction(exec)) {
            actionObject = {
              type: action,
              exec: exec
            };
          } else if (exec) {
            actionObject = exec;
          } else {
            actionObject = {
              type: action,
              exec: undefined
            };
          }
        } else if (isFunction(action)) {
          actionObject = {
            // Convert action to string if unnamed
            type: action.name || action.toString(),
            exec: action
          };
        } else {
          var exec = getActionFunction(action.type, actionFunctionMap);

          if (isFunction(exec)) {
            actionObject = __assign(__assign({}, action), {
              exec: exec
            });
          } else if (exec) {
            var actionType = exec.type || action.type;
            actionObject = __assign(__assign(__assign({}, exec), action), {
              type: actionType
            });
          } else {
            actionObject = action;
          }
        }

        Object.defineProperty(actionObject, 'toString', {
          value: function () {
            return actionObject.type;
          },
          enumerable: false,
          configurable: true
        });
        return actionObject;
      }

      var toActionObjects = function (action, actionFunctionMap) {
        if (!action) {
          return [];
        }

        var actions = isArray(action) ? action : [action];
        return actions.map(function (subAction) {
          return toActionObject(subAction, actionFunctionMap);
        });
      };

      function toActivityDefinition(action) {
        var actionObject = toActionObject(action);
        return __assign(__assign({
          id: isString(action) ? action : actionObject.id
        }, actionObject), {
          type: actionObject.type
        });
      }
      /**
       * Raises an event. This places the event in the internal event queue, so that
       * the event is immediately consumed by the machine in the current step.
       *
       * @param eventType The event to raise.
       */


      function raise$1(event) {
        if (!isString(event)) {
          return send$1(event, {
            to: SpecialTargets.Internal
          });
        }

        return {
          type: raise,
          event: event
        };
      }

      function resolveRaise(action) {
        return {
          type: raise,
          _event: toSCXMLEvent(action.event)
        };
      }
      /**
       * Sends an event. This returns an action that will be read by an interpreter to
       * send the event in the next step, after the current step is finished executing.
       *
       * @param event The event to send.
       * @param options Options to pass into the send event:
       *  - `id` - The unique send event identifier (used with `cancel()`).
       *  - `delay` - The number of milliseconds to delay the sending of the event.
       *  - `to` - The target of this event (by default, the machine the event was sent from).
       */


      function send$1(event, options) {
        return {
          to: options ? options.to : undefined,
          type: send,
          event: isFunction(event) ? event : toEventObject(event),
          delay: options ? options.delay : undefined,
          id: options && options.id !== undefined ? options.id : isFunction(event) ? event.name : getEventType(event)
        };
      }

      function resolveSend(action, ctx, _event, delaysMap) {
        var meta = {
          _event: _event
        }; // TODO: helper function for resolving Expr

        var resolvedEvent = toSCXMLEvent(isFunction(action.event) ? action.event(ctx, _event.data, meta) : action.event);
        var resolvedDelay;

        if (isString(action.delay)) {
          var configDelay = delaysMap && delaysMap[action.delay];
          resolvedDelay = isFunction(configDelay) ? configDelay(ctx, _event.data, meta) : configDelay;
        } else {
          resolvedDelay = isFunction(action.delay) ? action.delay(ctx, _event.data, meta) : action.delay;
        }

        var resolvedTarget = isFunction(action.to) ? action.to(ctx, _event.data, meta) : action.to;
        return __assign(__assign({}, action), {
          to: resolvedTarget,
          _event: resolvedEvent,
          event: resolvedEvent.data,
          delay: resolvedDelay
        });
      }
      /**
       * Sends an event to this machine's parent.
       *
       * @param event The event to send to the parent machine.
       * @param options Options to pass into the send event.
       */


      function sendParent(event, options) {
        return send$1(event, __assign(__assign({}, options), {
          to: SpecialTargets.Parent
        }));
      }
      /**
       * Sends an update event to this machine's parent.
       */


      function sendUpdate() {
        return sendParent(update);
      }
      /**
       * Sends an event back to the sender of the original event.
       *
       * @param event The event to send back to the sender
       * @param options Options to pass into the send event
       */


      function respond(event, options) {
        return send$1(event, __assign(__assign({}, options), {
          to: function (_, __, _a) {
            var _event = _a._event;
            return _event.origin; // TODO: handle when _event.origin is undefined
          }
        }));
      }

      var defaultLogExpr = function (context, event) {
        return {
          context: context,
          event: event
        };
      };
      /**
       *
       * @param expr The expression function to evaluate which will be logged.
       *  Takes in 2 arguments:
       *  - `ctx` - the current state context
       *  - `event` - the event that caused this action to be executed.
       * @param label The label to give to the logged expression.
       */


      function log$1(expr, label) {
        if (expr === void 0) {
          expr = defaultLogExpr;
        }

        return {
          type: log,
          label: label,
          expr: expr
        };
      }

      var resolveLog = function (action, ctx, _event) {
        return __assign(__assign({}, action), {
          value: isString(action.expr) ? action.expr : action.expr(ctx, _event.data, {
            _event: _event
          })
        });
      };
      /**
       * Cancels an in-flight `send(...)` action. A canceled sent action will not
       * be executed, nor will its event be sent, unless it has already been sent
       * (e.g., if `cancel(...)` is called after the `send(...)` action's `delay`).
       *
       * @param sendId The `id` of the `send(...)` action to cancel.
       */


      var cancel$1 = function (sendId) {
        return {
          type: cancel,
          sendId: sendId
        };
      };
      /**
       * Starts an activity.
       *
       * @param activity The activity to start.
       */


      function start$1(activity) {
        var activityDef = toActivityDefinition(activity);
        return {
          type: ActionTypes.Start,
          activity: activityDef,
          exec: undefined
        };
      }
      /**
       * Stops an activity.
       *
       * @param actorRef The activity to stop.
       */


      function stop$1(actorRef) {
        var activity = isFunction(actorRef) ? actorRef : toActivityDefinition(actorRef);
        return {
          type: ActionTypes.Stop,
          activity: activity,
          exec: undefined
        };
      }

      function resolveStop(action, context, _event) {
        var actorRefOrString = isFunction(action.activity) ? action.activity(context, _event.data) : action.activity;
        var resolvedActorRef = typeof actorRefOrString === 'string' ? {
          id: actorRefOrString
        } : actorRefOrString;
        var actionObject = {
          type: ActionTypes.Stop,
          activity: resolvedActorRef
        };
        return actionObject;
      }
      /**
       * Updates the current context of the machine.
       *
       * @param assignment An object that represents the partial context to update.
       */


      var assign$1 = exports('assign', function (assignment) {
        return {
          type: assign,
          assignment: assignment
        };
      });
      /**
       * Returns an event type that represents an implicit event that
       * is sent after the specified `delay`.
       *
       * @param delayRef The delay in milliseconds
       * @param id The state node ID where this event is handled
       */


      function after(delayRef, id) {
        var idSuffix = id ? "#" + id : '';
        return ActionTypes.After + "(" + delayRef + ")" + idSuffix;
      }
      /**
       * Returns an event that represents that a final state node
       * has been reached in the parent state node.
       *
       * @param id The final state node's parent state node `id`
       * @param data The data to pass into the event
       */


      function done(id, data) {
        var type = ActionTypes.DoneState + "." + id;
        var eventObject = {
          type: type,
          data: data
        };

        eventObject.toString = function () {
          return type;
        };

        return eventObject;
      }
      /**
       * Returns an event that represents that an invoked service has terminated.
       *
       * An invoked service is terminated when it has reached a top-level final state node,
       * but not when it is canceled.
       *
       * @param id The final state node ID
       * @param data The data to pass into the event
       */


      function doneInvoke(id, data) {
        var type = ActionTypes.DoneInvoke + "." + id;
        var eventObject = {
          type: type,
          data: data
        };

        eventObject.toString = function () {
          return type;
        };

        return eventObject;
      }

      function error$1(id, data) {
        var type = ActionTypes.ErrorPlatform + "." + id;
        var eventObject = {
          type: type,
          data: data
        };

        eventObject.toString = function () {
          return type;
        };

        return eventObject;
      }

      function pure$1(getActions) {
        return {
          type: ActionTypes.Pure,
          get: getActions
        };
      }
      /**
       * Forwards (sends) an event to a specified service.
       *
       * @param target The target service to forward the event to.
       * @param options Options to pass into the send action creator.
       */


      function forwardTo(target, options) {
        return send$1(function (_, event) {
          return event;
        }, __assign(__assign({}, options), {
          to: target
        }));
      }
      /**
       * Escalates an error by sending it as an event to this machine's parent.
       *
       * @param errorData The error data to send, or the expression function that
       * takes in the `context`, `event`, and `meta`, and returns the error data to send.
       * @param options Options to pass into the send action creator.
       */


      function escalate(errorData, options) {
        return sendParent(function (context, event, meta) {
          return {
            type: error,
            data: isFunction(errorData) ? errorData(context, event, meta) : errorData
          };
        }, __assign(__assign({}, options), {
          to: SpecialTargets.Parent
        }));
      }

      function choose$1(conds) {
        return {
          type: ActionTypes.Choose,
          conds: conds
        };
      }

      function resolveActions(machine, currentState, currentContext, _event, actions) {
        var _a = __read(partition(actions, function (action) {
          return action.type === assign;
        }), 2),
            assignActions = _a[0],
            otherActions = _a[1];

        var updatedContext = assignActions.length ? updateContext(currentContext, _event, assignActions, currentState) : currentContext;
        var resolvedActions = flatten(otherActions.map(function (actionObject) {
          var _a;

          switch (actionObject.type) {
            case raise:
              return resolveRaise(actionObject);

            case send:
              var sendAction = resolveSend(actionObject, updatedContext, _event, machine.options.delays); // TODO: fix ActionTypes.Init

              if (!IS_PRODUCTION) {
                // warn after resolving as we can create better contextual message here
                warn(!isString(actionObject.delay) || typeof sendAction.delay === 'number', // tslint:disable-next-line:max-line-length
                "No delay reference for delay expression '" + actionObject.delay + "' was found on machine '" + machine.id + "'");
              }

              return sendAction;

            case log:
              return resolveLog(actionObject, updatedContext, _event);

            case choose:
              {
                var chooseAction = actionObject;
                var matchedActions = (_a = chooseAction.conds.find(function (condition) {
                  var guard = toGuard(condition.cond, machine.options.guards);
                  return !guard || evaluateGuard(machine, guard, updatedContext, _event, currentState);
                })) === null || _a === void 0 ? void 0 : _a.actions;

                if (!matchedActions) {
                  return [];
                }

                var resolved = resolveActions(machine, currentState, updatedContext, _event, toActionObjects(toArray(matchedActions), machine.options.actions));
                updatedContext = resolved[1];
                return resolved[0];
              }

            case pure:
              {
                var matchedActions = actionObject.get(updatedContext, _event.data);

                if (!matchedActions) {
                  return [];
                }

                var resolved = resolveActions(machine, currentState, updatedContext, _event, toActionObjects(toArray(matchedActions), machine.options.actions));
                updatedContext = resolved[1];
                return resolved[0];
              }

            case stop:
              {
                return resolveStop(actionObject, updatedContext, _event);
              }

            default:
              return toActionObject(actionObject, machine.options.actions);
          }
        }));
        return [resolvedActions, updatedContext];
      }

      var isLeafNode = function (stateNode) {
        return stateNode.type === 'atomic' || stateNode.type === 'final';
      };

      function getChildren(stateNode) {
        return keys(stateNode.states).map(function (key) {
          return stateNode.states[key];
        });
      }

      function getAllStateNodes(stateNode) {
        var stateNodes = [stateNode];

        if (isLeafNode(stateNode)) {
          return stateNodes;
        }

        return stateNodes.concat(flatten(getChildren(stateNode).map(getAllStateNodes)));
      }

      function getConfiguration(prevStateNodes, stateNodes) {
        var e_1, _a, e_2, _b, e_3, _c, e_4, _d;

        var prevConfiguration = new Set(prevStateNodes);
        var prevAdjList = getAdjList(prevConfiguration);
        var configuration = new Set(stateNodes);

        try {
          // add all ancestors
          for (var configuration_1 = __values(configuration), configuration_1_1 = configuration_1.next(); !configuration_1_1.done; configuration_1_1 = configuration_1.next()) {
            var s = configuration_1_1.value;
            var m = s.parent;

            while (m && !configuration.has(m)) {
              configuration.add(m);
              m = m.parent;
            }
          }
        } catch (e_1_1) {
          e_1 = {
            error: e_1_1
          };
        } finally {
          try {
            if (configuration_1_1 && !configuration_1_1.done && (_a = configuration_1.return)) _a.call(configuration_1);
          } finally {
            if (e_1) throw e_1.error;
          }
        }

        var adjList = getAdjList(configuration);

        try {
          // add descendants
          for (var configuration_2 = __values(configuration), configuration_2_1 = configuration_2.next(); !configuration_2_1.done; configuration_2_1 = configuration_2.next()) {
            var s = configuration_2_1.value; // if previously active, add existing child nodes

            if (s.type === 'compound' && (!adjList.get(s) || !adjList.get(s).length)) {
              if (prevAdjList.get(s)) {
                prevAdjList.get(s).forEach(function (sn) {
                  return configuration.add(sn);
                });
              } else {
                s.initialStateNodes.forEach(function (sn) {
                  return configuration.add(sn);
                });
              }
            } else {
              if (s.type === 'parallel') {
                try {
                  for (var _e = (e_3 = void 0, __values(getChildren(s))), _f = _e.next(); !_f.done; _f = _e.next()) {
                    var child = _f.value;

                    if (child.type === 'history') {
                      continue;
                    }

                    if (!configuration.has(child)) {
                      configuration.add(child);

                      if (prevAdjList.get(child)) {
                        prevAdjList.get(child).forEach(function (sn) {
                          return configuration.add(sn);
                        });
                      } else {
                        child.initialStateNodes.forEach(function (sn) {
                          return configuration.add(sn);
                        });
                      }
                    }
                  }
                } catch (e_3_1) {
                  e_3 = {
                    error: e_3_1
                  };
                } finally {
                  try {
                    if (_f && !_f.done && (_c = _e.return)) _c.call(_e);
                  } finally {
                    if (e_3) throw e_3.error;
                  }
                }
              }
            }
          }
        } catch (e_2_1) {
          e_2 = {
            error: e_2_1
          };
        } finally {
          try {
            if (configuration_2_1 && !configuration_2_1.done && (_b = configuration_2.return)) _b.call(configuration_2);
          } finally {
            if (e_2) throw e_2.error;
          }
        }

        try {
          // add all ancestors
          for (var configuration_3 = __values(configuration), configuration_3_1 = configuration_3.next(); !configuration_3_1.done; configuration_3_1 = configuration_3.next()) {
            var s = configuration_3_1.value;
            var m = s.parent;

            while (m && !configuration.has(m)) {
              configuration.add(m);
              m = m.parent;
            }
          }
        } catch (e_4_1) {
          e_4 = {
            error: e_4_1
          };
        } finally {
          try {
            if (configuration_3_1 && !configuration_3_1.done && (_d = configuration_3.return)) _d.call(configuration_3);
          } finally {
            if (e_4) throw e_4.error;
          }
        }

        return configuration;
      }

      function getValueFromAdj(baseNode, adjList) {
        var childStateNodes = adjList.get(baseNode);

        if (!childStateNodes) {
          return {}; // todo: fix?
        }

        if (baseNode.type === 'compound') {
          var childStateNode = childStateNodes[0];

          if (childStateNode) {
            if (isLeafNode(childStateNode)) {
              return childStateNode.key;
            }
          } else {
            return {};
          }
        }

        var stateValue = {};
        childStateNodes.forEach(function (csn) {
          stateValue[csn.key] = getValueFromAdj(csn, adjList);
        });
        return stateValue;
      }

      function getAdjList(configuration) {
        var e_5, _a;

        var adjList = new Map();

        try {
          for (var configuration_4 = __values(configuration), configuration_4_1 = configuration_4.next(); !configuration_4_1.done; configuration_4_1 = configuration_4.next()) {
            var s = configuration_4_1.value;

            if (!adjList.has(s)) {
              adjList.set(s, []);
            }

            if (s.parent) {
              if (!adjList.has(s.parent)) {
                adjList.set(s.parent, []);
              }

              adjList.get(s.parent).push(s);
            }
          }
        } catch (e_5_1) {
          e_5 = {
            error: e_5_1
          };
        } finally {
          try {
            if (configuration_4_1 && !configuration_4_1.done && (_a = configuration_4.return)) _a.call(configuration_4);
          } finally {
            if (e_5) throw e_5.error;
          }
        }

        return adjList;
      }

      function getValue(rootNode, configuration) {
        var config = getConfiguration([rootNode], configuration);
        return getValueFromAdj(rootNode, getAdjList(config));
      }

      function has(iterable, item) {
        if (Array.isArray(iterable)) {
          return iterable.some(function (member) {
            return member === item;
          });
        }

        if (iterable instanceof Set) {
          return iterable.has(item);
        }

        return false; // TODO: fix
      }

      function nextEvents(configuration) {
        return flatten(__spread(new Set(configuration.map(function (sn) {
          return sn.ownEvents;
        }))));
      }

      function isInFinalState(configuration, stateNode) {
        if (stateNode.type === 'compound') {
          return getChildren(stateNode).some(function (s) {
            return s.type === 'final' && has(configuration, s);
          });
        }

        if (stateNode.type === 'parallel') {
          return getChildren(stateNode).every(function (sn) {
            return isInFinalState(configuration, sn);
          });
        }

        return false;
      }

      function stateValuesEqual(a, b) {
        if (a === b) {
          return true;
        }

        if (a === undefined || b === undefined) {
          return false;
        }

        if (isString(a) || isString(b)) {
          return a === b;
        }

        var aKeys = keys(a);
        var bKeys = keys(b);
        return aKeys.length === bKeys.length && aKeys.every(function (key) {
          return stateValuesEqual(a[key], b[key]);
        });
      }

      function isState(state) {
        if (isString(state)) {
          return false;
        }

        return 'value' in state && 'history' in state;
      }

      function bindActionToState(action, state) {
        var exec = action.exec;

        var boundAction = __assign(__assign({}, action), {
          exec: exec !== undefined ? function () {
            return exec(state.context, state.event, {
              action: action,
              state: state,
              _event: state._event
            });
          } : undefined
        });

        return boundAction;
      }

      var State =
exports('State',       /*#__PURE__*/

      /** @class */
      function () {
        /**
         * Creates a new State instance.
         * @param value The state value
         * @param context The extended state
         * @param historyValue The tree representing historical values of the state nodes
         * @param history The previous state
         * @param actions An array of action objects to execute as side-effects
         * @param activities A mapping of activities and whether they are started (`true`) or stopped (`false`).
         * @param meta
         * @param events Internal event queue. Should be empty with run-to-completion semantics.
         * @param configuration
         */
        function State(config) {
          var _this = this;

          this.actions = [];
          this.activities = EMPTY_ACTIVITY_MAP;
          this.meta = {};
          this.events = [];
          this.value = config.value;
          this.context = config.context;
          this._event = config._event;
          this._sessionid = config._sessionid;
          this.event = this._event.data;
          this.historyValue = config.historyValue;
          this.history = config.history;
          this.actions = config.actions || [];
          this.activities = config.activities || EMPTY_ACTIVITY_MAP;
          this.meta = config.meta || {};
          this.events = config.events || [];
          this.matches = this.matches.bind(this);
          this.toStrings = this.toStrings.bind(this);
          this.configuration = config.configuration;
          this.transitions = config.transitions;
          this.children = config.children;
          this.done = !!config.done;
          Object.defineProperty(this, 'nextEvents', {
            get: function () {
              return nextEvents(_this.configuration);
            }
          });
        }
        /**
         * Creates a new State instance for the given `stateValue` and `context`.
         * @param stateValue
         * @param context
         */


        State.from = function (stateValue, context) {
          if (stateValue instanceof State) {
            if (stateValue.context !== context) {
              return new State({
                value: stateValue.value,
                context: context,
                _event: stateValue._event,
                _sessionid: null,
                historyValue: stateValue.historyValue,
                history: stateValue.history,
                actions: [],
                activities: stateValue.activities,
                meta: {},
                events: [],
                configuration: [],
                transitions: [],
                children: {}
              });
            }

            return stateValue;
          }

          var _event = initEvent;
          return new State({
            value: stateValue,
            context: context,
            _event: _event,
            _sessionid: null,
            historyValue: undefined,
            history: undefined,
            actions: [],
            activities: undefined,
            meta: undefined,
            events: [],
            configuration: [],
            transitions: [],
            children: {}
          });
        };
        /**
         * Creates a new State instance for the given `config`.
         * @param config The state config
         */


        State.create = function (config) {
          return new State(config);
        };
        /**
         * Creates a new `State` instance for the given `stateValue` and `context` with no actions (side-effects).
         * @param stateValue
         * @param context
         */


        State.inert = function (stateValue, context) {
          if (stateValue instanceof State) {
            if (!stateValue.actions.length) {
              return stateValue;
            }

            var _event = initEvent;
            return new State({
              value: stateValue.value,
              context: context,
              _event: _event,
              _sessionid: null,
              historyValue: stateValue.historyValue,
              history: stateValue.history,
              activities: stateValue.activities,
              configuration: stateValue.configuration,
              transitions: [],
              children: {}
            });
          }

          return State.from(stateValue, context);
        };
        /**
         * Returns an array of all the string leaf state node paths.
         * @param stateValue
         * @param delimiter The character(s) that separate each subpath in the string state node path.
         */


        State.prototype.toStrings = function (stateValue, delimiter) {
          var _this = this;

          if (stateValue === void 0) {
            stateValue = this.value;
          }

          if (delimiter === void 0) {
            delimiter = '.';
          }

          if (isString(stateValue)) {
            return [stateValue];
          }

          var valueKeys = keys(stateValue);
          return valueKeys.concat.apply(valueKeys, __spread(valueKeys.map(function (key) {
            return _this.toStrings(stateValue[key], delimiter).map(function (s) {
              return key + delimiter + s;
            });
          })));
        };

        State.prototype.toJSON = function () {
          var _a = this;
              _a.configuration;
              _a.transitions;
              var jsonValues = __rest(_a, ["configuration", "transitions"]);

          return jsonValues;
        };
        /**
         * Whether the current state value is a subset of the given parent state value.
         * @param parentStateValue
         */


        State.prototype.matches = function (parentStateValue) {
          return matchesState(parentStateValue, this.value);
        };

        return State;
      }());

      /**
       * Maintains a stack of the current service in scope.
       * This is used to provide the correct service to spawn().
       */
      var serviceStack = [];

      var provide = function (service, fn) {
        serviceStack.push(service);
        var result = fn(service);
        serviceStack.pop();
        return result;
      };

      var consume = function (fn) {
        return fn(serviceStack[serviceStack.length - 1]);
      };

      function createNullActor(id) {
        return {
          id: id,
          send: function () {
            return void 0;
          },
          subscribe: function () {
            return {
              unsubscribe: function () {
                return void 0;
              }
            };
          },
          toJSON: function () {
            return {
              id: id
            };
          }
        };
      }
      /**
       * Creates a deferred actor that is able to be invoked given the provided
       * invocation information in its `.meta` value.
       *
       * @param invokeDefinition The meta information needed to invoke the actor.
       */


      function createInvocableActor(invokeDefinition, machine, context, _event) {
        var _a;

        var invokeSrc = toInvokeSource(invokeDefinition.src);
        var serviceCreator = (_a = machine === null || machine === void 0 ? void 0 : machine.options.services) === null || _a === void 0 ? void 0 : _a[invokeSrc.type];
        var resolvedData = invokeDefinition.data ? mapContext(invokeDefinition.data, context, _event) : undefined;
        var tempActor = serviceCreator ? createDeferredActor(serviceCreator, invokeDefinition.id, resolvedData) : createNullActor(invokeDefinition.id);
        tempActor.meta = invokeDefinition;
        return tempActor;
      }

      function createDeferredActor(entity, id, data) {
        var tempActor = createNullActor(id);
        tempActor.deferred = true;

        if (isMachine(entity)) {
          // "mute" the existing service scope so potential spawned actors within the `.initialState` stay deferred here
          tempActor.state = provide(undefined, function () {
            return (data ? entity.withContext(data) : entity).initialState;
          });
        }

        return tempActor;
      }

      function isActor$1(item) {
        try {
          return typeof item.send === 'function';
        } catch (e) {
          return false;
        }
      }

      function isSpawnedActor(item) {
        return isActor$1(item) && 'id' in item;
      }

      function toInvokeSource$1(src) {
        if (typeof src === 'string') {
          var simpleSrc = {
            type: src
          };

          simpleSrc.toString = function () {
            return src;
          }; // v4 compat - TODO: remove in v5


          return simpleSrc;
        }

        return src;
      }

      function toInvokeDefinition(invokeConfig) {
        return __assign(__assign({
          type: invoke
        }, invokeConfig), {
          toJSON: function () {
            invokeConfig.onDone;
                invokeConfig.onError;
                var invokeDef = __rest(invokeConfig, ["onDone", "onError"]);

            return __assign(__assign({}, invokeDef), {
              type: invoke,
              src: toInvokeSource$1(invokeConfig.src)
            });
          }
        });
      }

      var NULL_EVENT = '';
      var STATE_IDENTIFIER = '#';
      var WILDCARD = '*';
      var EMPTY_OBJECT = {};

      var isStateId = function (str) {
        return str[0] === STATE_IDENTIFIER;
      };

      var createDefaultOptions = function () {
        return {
          actions: {},
          guards: {},
          services: {},
          activities: {},
          delays: {}
        };
      };

      var validateArrayifiedTransitions = function (stateNode, event, transitions) {
        var hasNonLastUnguardedTarget = transitions.slice(0, -1).some(function (transition) {
          return !('cond' in transition) && !('in' in transition) && (isString(transition.target) || isMachine(transition.target));
        });
        var eventText = event === NULL_EVENT ? 'the transient event' : "event '" + event + "'";
        warn(!hasNonLastUnguardedTarget, "One or more transitions for " + eventText + " on state '" + stateNode.id + "' are unreachable. " + "Make sure that the default transition is the last one defined.");
      };

      var StateNode =
exports('StateNode',       /*#__PURE__*/

      /** @class */
      function () {
        function StateNode(
        /**
         * The raw config used to create the machine.
         */
        config, options,
        /**
         * The initial extended state
         */
        context) {
          var _this = this;

          this.config = config;
          this.context = context;
          /**
           * The order this state node appears. Corresponds to the implicit SCXML document order.
           */

          this.order = -1;
          this.__xstatenode = true;
          this.__cache = {
            events: undefined,
            relativeValue: new Map(),
            initialStateValue: undefined,
            initialState: undefined,
            on: undefined,
            transitions: undefined,
            candidates: {},
            delayedTransitions: undefined
          };
          this.idMap = {};
          this.options = Object.assign(createDefaultOptions(), options);
          this.parent = this.options._parent;
          this.key = this.config.key || this.options._key || this.config.id || '(machine)';
          this.machine = this.parent ? this.parent.machine : this;
          this.path = this.parent ? this.parent.path.concat(this.key) : [];
          this.delimiter = this.config.delimiter || (this.parent ? this.parent.delimiter : STATE_DELIMITER);
          this.id = this.config.id || __spread([this.machine.key], this.path).join(this.delimiter);
          this.version = this.parent ? this.parent.version : this.config.version;
          this.type = this.config.type || (this.config.parallel ? 'parallel' : this.config.states && keys(this.config.states).length ? 'compound' : this.config.history ? 'history' : 'atomic');

          if (!IS_PRODUCTION) {
            warn(!('parallel' in this.config), "The \"parallel\" property is deprecated and will be removed in version 4.1. " + (this.config.parallel ? "Replace with `type: 'parallel'`" : "Use `type: '" + this.type + "'`") + " in the config for state node '" + this.id + "' instead.");
          }

          this.initial = this.config.initial;
          this.states = this.config.states ? mapValues(this.config.states, function (stateConfig, key) {
            var _a;

            var stateNode = new StateNode(stateConfig, {
              _parent: _this,
              _key: key
            });
            Object.assign(_this.idMap, __assign((_a = {}, _a[stateNode.id] = stateNode, _a), stateNode.idMap));
            return stateNode;
          }) : EMPTY_OBJECT; // Document order

          var order = 0;

          function dfs(stateNode) {
            var e_1, _a;

            stateNode.order = order++;

            try {
              for (var _b = __values(getChildren(stateNode)), _c = _b.next(); !_c.done; _c = _b.next()) {
                var child = _c.value;
                dfs(child);
              }
            } catch (e_1_1) {
              e_1 = {
                error: e_1_1
              };
            } finally {
              try {
                if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
              } finally {
                if (e_1) throw e_1.error;
              }
            }
          }

          dfs(this); // History config

          this.history = this.config.history === true ? 'shallow' : this.config.history || false;
          this._transient = !!this.config.always || (!this.config.on ? false : Array.isArray(this.config.on) ? this.config.on.some(function (_a) {
            var event = _a.event;
            return event === NULL_EVENT;
          }) : NULL_EVENT in this.config.on);
          this.strict = !!this.config.strict; // TODO: deprecate (entry)

          this.onEntry = toArray(this.config.entry || this.config.onEntry).map(function (action) {
            return toActionObject(action);
          }); // TODO: deprecate (exit)

          this.onExit = toArray(this.config.exit || this.config.onExit).map(function (action) {
            return toActionObject(action);
          });
          this.meta = this.config.meta;
          this.doneData = this.type === 'final' ? this.config.data : undefined;
          this.invoke = toArray(this.config.invoke).map(function (invokeConfig, i) {
            var _a, _b;

            if (isMachine(invokeConfig)) {
              _this.machine.options.services = __assign((_a = {}, _a[invokeConfig.id] = invokeConfig, _a), _this.machine.options.services);
              return toInvokeDefinition({
                src: invokeConfig.id,
                id: invokeConfig.id
              });
            } else if (isString(invokeConfig.src)) {
              return toInvokeDefinition(__assign(__assign({}, invokeConfig), {
                id: invokeConfig.id || invokeConfig.src,
                src: invokeConfig.src
              }));
            } else if (isMachine(invokeConfig.src) || isFunction(invokeConfig.src)) {
              var invokeSrc = _this.id + ":invocation[" + i + "]"; // TODO: util function

              _this.machine.options.services = __assign((_b = {}, _b[invokeSrc] = invokeConfig.src, _b), _this.machine.options.services);
              return toInvokeDefinition(__assign(__assign({
                id: invokeSrc
              }, invokeConfig), {
                src: invokeSrc
              }));
            } else {
              var invokeSource = invokeConfig.src;
              return toInvokeDefinition(__assign(__assign({
                id: invokeSource.type
              }, invokeConfig), {
                src: invokeSource
              }));
            }
          });
          this.activities = toArray(this.config.activities).concat(this.invoke).map(function (activity) {
            return toActivityDefinition(activity);
          });
          this.transition = this.transition.bind(this); // TODO: this is the real fix for initialization once
          // state node getters are deprecated
          // if (!this.parent) {
          //   this._init();
          // }
        }

        StateNode.prototype._init = function () {
          if (this.__cache.transitions) {
            return;
          }

          getAllStateNodes(this).forEach(function (stateNode) {
            return stateNode.on;
          });
        };
        /**
         * Clones this state machine with custom options and context.
         *
         * @param options Options (actions, guards, activities, services) to recursively merge with the existing options.
         * @param context Custom context (will override predefined context)
         */


        StateNode.prototype.withConfig = function (options, context) {
          if (context === void 0) {
            context = this.context;
          }

          var _a = this.options,
              actions = _a.actions,
              activities = _a.activities,
              guards = _a.guards,
              services = _a.services,
              delays = _a.delays;
          return new StateNode(this.config, {
            actions: __assign(__assign({}, actions), options.actions),
            activities: __assign(__assign({}, activities), options.activities),
            guards: __assign(__assign({}, guards), options.guards),
            services: __assign(__assign({}, services), options.services),
            delays: __assign(__assign({}, delays), options.delays)
          }, context);
        };
        /**
         * Clones this state machine with custom context.
         *
         * @param context Custom context (will override predefined context, not recursive)
         */


        StateNode.prototype.withContext = function (context) {
          return new StateNode(this.config, this.options, context);
        };

        Object.defineProperty(StateNode.prototype, "definition", {
          /**
           * The well-structured state node definition.
           */
          get: function () {
            return {
              id: this.id,
              key: this.key,
              version: this.version,
              context: this.context,
              type: this.type,
              initial: this.initial,
              history: this.history,
              states: mapValues(this.states, function (state) {
                return state.definition;
              }),
              on: this.on,
              transitions: this.transitions,
              entry: this.onEntry,
              exit: this.onExit,
              activities: this.activities || [],
              meta: this.meta,
              order: this.order || -1,
              data: this.doneData,
              invoke: this.invoke
            };
          },
          enumerable: false,
          configurable: true
        });

        StateNode.prototype.toJSON = function () {
          return this.definition;
        };

        Object.defineProperty(StateNode.prototype, "on", {
          /**
           * The mapping of events to transitions.
           */
          get: function () {
            if (this.__cache.on) {
              return this.__cache.on;
            }

            var transitions = this.transitions;
            return this.__cache.on = transitions.reduce(function (map, transition) {
              map[transition.eventType] = map[transition.eventType] || [];
              map[transition.eventType].push(transition);
              return map;
            }, {});
          },
          enumerable: false,
          configurable: true
        });
        Object.defineProperty(StateNode.prototype, "after", {
          get: function () {
            return this.__cache.delayedTransitions || (this.__cache.delayedTransitions = this.getDelayedTransitions(), this.__cache.delayedTransitions);
          },
          enumerable: false,
          configurable: true
        });
        Object.defineProperty(StateNode.prototype, "transitions", {
          /**
           * All the transitions that can be taken from this state node.
           */
          get: function () {
            return this.__cache.transitions || (this.__cache.transitions = this.formatTransitions(), this.__cache.transitions);
          },
          enumerable: false,
          configurable: true
        });

        StateNode.prototype.getCandidates = function (eventName) {
          if (this.__cache.candidates[eventName]) {
            return this.__cache.candidates[eventName];
          }

          var transient = eventName === NULL_EVENT;
          var candidates = this.transitions.filter(function (transition) {
            var sameEventType = transition.eventType === eventName; // null events should only match against eventless transitions

            return transient ? sameEventType : sameEventType || transition.eventType === WILDCARD;
          });
          this.__cache.candidates[eventName] = candidates;
          return candidates;
        };
        /**
         * All delayed transitions from the config.
         */


        StateNode.prototype.getDelayedTransitions = function () {
          var _this = this;

          var afterConfig = this.config.after;

          if (!afterConfig) {
            return [];
          }

          var mutateEntryExit = function (delay, i) {
            var delayRef = isFunction(delay) ? _this.id + ":delay[" + i + "]" : delay;
            var eventType = after(delayRef, _this.id);

            _this.onEntry.push(send$1(eventType, {
              delay: delay
            }));

            _this.onExit.push(cancel$1(eventType));

            return eventType;
          };

          var delayedTransitions = isArray(afterConfig) ? afterConfig.map(function (transition, i) {
            var eventType = mutateEntryExit(transition.delay, i);
            return __assign(__assign({}, transition), {
              event: eventType
            });
          }) : flatten(keys(afterConfig).map(function (delay, i) {
            var configTransition = afterConfig[delay];
            var resolvedTransition = isString(configTransition) ? {
              target: configTransition
            } : configTransition;
            var resolvedDelay = !isNaN(+delay) ? +delay : delay;
            var eventType = mutateEntryExit(resolvedDelay, i);
            return toArray(resolvedTransition).map(function (transition) {
              return __assign(__assign({}, transition), {
                event: eventType,
                delay: resolvedDelay
              });
            });
          }));
          return delayedTransitions.map(function (delayedTransition) {
            var delay = delayedTransition.delay;
            return __assign(__assign({}, _this.formatTransition(delayedTransition)), {
              delay: delay
            });
          });
        };
        /**
         * Returns the state nodes represented by the current state value.
         *
         * @param state The state value or State instance
         */


        StateNode.prototype.getStateNodes = function (state) {
          var _a;

          var _this = this;

          if (!state) {
            return [];
          }

          var stateValue = state instanceof State ? state.value : toStateValue(state, this.delimiter);

          if (isString(stateValue)) {
            var initialStateValue = this.getStateNode(stateValue).initial;
            return initialStateValue !== undefined ? this.getStateNodes((_a = {}, _a[stateValue] = initialStateValue, _a)) : [this.states[stateValue]];
          }

          var subStateKeys = keys(stateValue);
          var subStateNodes = subStateKeys.map(function (subStateKey) {
            return _this.getStateNode(subStateKey);
          });
          return subStateNodes.concat(subStateKeys.reduce(function (allSubStateNodes, subStateKey) {
            var subStateNode = _this.getStateNode(subStateKey).getStateNodes(stateValue[subStateKey]);

            return allSubStateNodes.concat(subStateNode);
          }, []));
        };
        /**
         * Returns `true` if this state node explicitly handles the given event.
         *
         * @param event The event in question
         */


        StateNode.prototype.handles = function (event) {
          var eventType = getEventType(event);
          return this.events.includes(eventType);
        };
        /**
         * Resolves the given `state` to a new `State` instance relative to this machine.
         *
         * This ensures that `.events` and `.nextEvents` represent the correct values.
         *
         * @param state The state to resolve
         */


        StateNode.prototype.resolveState = function (state) {
          var configuration = Array.from(getConfiguration([], this.getStateNodes(state.value)));
          return new State(__assign(__assign({}, state), {
            value: this.resolve(state.value),
            configuration: configuration,
            done: isInFinalState(configuration, this)
          }));
        };

        StateNode.prototype.transitionLeafNode = function (stateValue, state, _event) {
          var stateNode = this.getStateNode(stateValue);
          var next = stateNode.next(state, _event);

          if (!next || !next.transitions.length) {
            return this.next(state, _event);
          }

          return next;
        };

        StateNode.prototype.transitionCompoundNode = function (stateValue, state, _event) {
          var subStateKeys = keys(stateValue);
          var stateNode = this.getStateNode(subStateKeys[0]);

          var next = stateNode._transition(stateValue[subStateKeys[0]], state, _event);

          if (!next || !next.transitions.length) {
            return this.next(state, _event);
          }

          return next;
        };

        StateNode.prototype.transitionParallelNode = function (stateValue, state, _event) {
          var e_2, _a;

          var transitionMap = {};

          try {
            for (var _b = __values(keys(stateValue)), _c = _b.next(); !_c.done; _c = _b.next()) {
              var subStateKey = _c.value;
              var subStateValue = stateValue[subStateKey];

              if (!subStateValue) {
                continue;
              }

              var subStateNode = this.getStateNode(subStateKey);

              var next = subStateNode._transition(subStateValue, state, _event);

              if (next) {
                transitionMap[subStateKey] = next;
              }
            }
          } catch (e_2_1) {
            e_2 = {
              error: e_2_1
            };
          } finally {
            try {
              if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
            } finally {
              if (e_2) throw e_2.error;
            }
          }

          var stateTransitions = keys(transitionMap).map(function (key) {
            return transitionMap[key];
          });
          var enabledTransitions = flatten(stateTransitions.map(function (st) {
            return st.transitions;
          }));
          var willTransition = stateTransitions.some(function (st) {
            return st.transitions.length > 0;
          });

          if (!willTransition) {
            return this.next(state, _event);
          }

          var entryNodes = flatten(stateTransitions.map(function (t) {
            return t.entrySet;
          }));
          var configuration = flatten(keys(transitionMap).map(function (key) {
            return transitionMap[key].configuration;
          }));
          return {
            transitions: enabledTransitions,
            entrySet: entryNodes,
            exitSet: flatten(stateTransitions.map(function (t) {
              return t.exitSet;
            })),
            configuration: configuration,
            source: state,
            actions: flatten(keys(transitionMap).map(function (key) {
              return transitionMap[key].actions;
            }))
          };
        };

        StateNode.prototype._transition = function (stateValue, state, _event) {
          // leaf node
          if (isString(stateValue)) {
            return this.transitionLeafNode(stateValue, state, _event);
          } // hierarchical node


          if (keys(stateValue).length === 1) {
            return this.transitionCompoundNode(stateValue, state, _event);
          } // orthogonal node


          return this.transitionParallelNode(stateValue, state, _event);
        };

        StateNode.prototype.next = function (state, _event) {
          var e_3, _a;

          var _this = this;

          var eventName = _event.name;
          var actions = [];
          var nextStateNodes = [];
          var selectedTransition;

          try {
            for (var _b = __values(this.getCandidates(eventName)), _c = _b.next(); !_c.done; _c = _b.next()) {
              var candidate = _c.value;
              var cond = candidate.cond,
                  stateIn = candidate.in;
              var resolvedContext = state.context;
              var isInState = stateIn ? isString(stateIn) && isStateId(stateIn) ? // Check if in state by ID
              state.matches(toStateValue(this.getStateNodeById(stateIn).path, this.delimiter)) : // Check if in state by relative grandparent
              matchesState(toStateValue(stateIn, this.delimiter), path(this.path.slice(0, -2))(state.value)) : true;
              var guardPassed = false;

              try {
                guardPassed = !cond || evaluateGuard(this.machine, cond, resolvedContext, _event, state);
              } catch (err) {
                throw new Error("Unable to evaluate guard '" + (cond.name || cond.type) + "' in transition for event '" + eventName + "' in state node '" + this.id + "':\n" + err.message);
              }

              if (guardPassed && isInState) {
                if (candidate.target !== undefined) {
                  nextStateNodes = candidate.target;
                }

                actions.push.apply(actions, __spread(candidate.actions));
                selectedTransition = candidate;
                break;
              }
            }
          } catch (e_3_1) {
            e_3 = {
              error: e_3_1
            };
          } finally {
            try {
              if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
            } finally {
              if (e_3) throw e_3.error;
            }
          }

          if (!selectedTransition) {
            return undefined;
          }

          if (!nextStateNodes.length) {
            return {
              transitions: [selectedTransition],
              entrySet: [],
              exitSet: [],
              configuration: state.value ? [this] : [],
              source: state,
              actions: actions
            };
          }

          var allNextStateNodes = flatten(nextStateNodes.map(function (stateNode) {
            return _this.getRelativeStateNodes(stateNode, state.historyValue);
          }));
          var isInternal = !!selectedTransition.internal;
          var reentryNodes = isInternal ? [] : flatten(allNextStateNodes.map(function (n) {
            return _this.nodesFromChild(n);
          }));
          return {
            transitions: [selectedTransition],
            entrySet: reentryNodes,
            exitSet: isInternal ? [] : [this],
            configuration: allNextStateNodes,
            source: state,
            actions: actions
          };
        };

        StateNode.prototype.nodesFromChild = function (childStateNode) {
          if (childStateNode.escapes(this)) {
            return [];
          }

          var nodes = [];
          var marker = childStateNode;

          while (marker && marker !== this) {
            nodes.push(marker);
            marker = marker.parent;
          }

          nodes.push(this); // inclusive

          return nodes;
        };
        /**
         * Whether the given state node "escapes" this state node. If the `stateNode` is equal to or the parent of
         * this state node, it does not escape.
         */


        StateNode.prototype.escapes = function (stateNode) {
          if (this === stateNode) {
            return false;
          }

          var parent = this.parent;

          while (parent) {
            if (parent === stateNode) {
              return false;
            }

            parent = parent.parent;
          }

          return true;
        };

        StateNode.prototype.getActions = function (transition, currentContext, _event, prevState) {
          var e_4, _a, e_5, _b;

          var prevConfig = getConfiguration([], prevState ? this.getStateNodes(prevState.value) : [this]);
          var resolvedConfig = transition.configuration.length ? getConfiguration(prevConfig, transition.configuration) : prevConfig;

          try {
            for (var resolvedConfig_1 = __values(resolvedConfig), resolvedConfig_1_1 = resolvedConfig_1.next(); !resolvedConfig_1_1.done; resolvedConfig_1_1 = resolvedConfig_1.next()) {
              var sn = resolvedConfig_1_1.value;

              if (!has(prevConfig, sn)) {
                transition.entrySet.push(sn);
              }
            }
          } catch (e_4_1) {
            e_4 = {
              error: e_4_1
            };
          } finally {
            try {
              if (resolvedConfig_1_1 && !resolvedConfig_1_1.done && (_a = resolvedConfig_1.return)) _a.call(resolvedConfig_1);
            } finally {
              if (e_4) throw e_4.error;
            }
          }

          try {
            for (var prevConfig_1 = __values(prevConfig), prevConfig_1_1 = prevConfig_1.next(); !prevConfig_1_1.done; prevConfig_1_1 = prevConfig_1.next()) {
              var sn = prevConfig_1_1.value;

              if (!has(resolvedConfig, sn) || has(transition.exitSet, sn.parent)) {
                transition.exitSet.push(sn);
              }
            }
          } catch (e_5_1) {
            e_5 = {
              error: e_5_1
            };
          } finally {
            try {
              if (prevConfig_1_1 && !prevConfig_1_1.done && (_b = prevConfig_1.return)) _b.call(prevConfig_1);
            } finally {
              if (e_5) throw e_5.error;
            }
          }

          if (!transition.source) {
            transition.exitSet = []; // Ensure that root StateNode (machine) is entered

            transition.entrySet.push(this);
          }

          var doneEvents = flatten(transition.entrySet.map(function (sn) {
            var events = [];

            if (sn.type !== 'final') {
              return events;
            }

            var parent = sn.parent;

            if (!parent.parent) {
              return events;
            }

            events.push(done(sn.id, sn.doneData), // TODO: deprecate - final states should not emit done events for their own state.
            done(parent.id, sn.doneData ? mapContext(sn.doneData, currentContext, _event) : undefined));
            var grandparent = parent.parent;

            if (grandparent.type === 'parallel') {
              if (getChildren(grandparent).every(function (parentNode) {
                return isInFinalState(transition.configuration, parentNode);
              })) {
                events.push(done(grandparent.id));
              }
            }

            return events;
          }));
          transition.exitSet.sort(function (a, b) {
            return b.order - a.order;
          });
          transition.entrySet.sort(function (a, b) {
            return a.order - b.order;
          });
          var entryStates = new Set(transition.entrySet);
          var exitStates = new Set(transition.exitSet);

          var _c = __read([flatten(Array.from(entryStates).map(function (stateNode) {
            return __spread(stateNode.activities.map(function (activity) {
              return start$1(activity);
            }), stateNode.onEntry);
          })).concat(doneEvents.map(raise$1)), flatten(Array.from(exitStates).map(function (stateNode) {
            return __spread(stateNode.onExit, stateNode.activities.map(function (activity) {
              return stop$1(activity);
            }));
          }))], 2),
              entryActions = _c[0],
              exitActions = _c[1];

          var actions = toActionObjects(exitActions.concat(transition.actions).concat(entryActions), this.machine.options.actions);
          return actions;
        };
        /**
         * Determines the next state given the current `state` and sent `event`.
         *
         * @param state The current State instance or state value
         * @param event The event that was sent at the current state
         * @param context The current context (extended state) of the current state
         */


        StateNode.prototype.transition = function (state, event, context) {
          if (state === void 0) {
            state = this.initialState;
          }

          var _event = toSCXMLEvent(event);

          var currentState;

          if (state instanceof State) {
            currentState = context === undefined ? state : this.resolveState(State.from(state, context));
          } else {
            var resolvedStateValue = isString(state) ? this.resolve(pathToStateValue(this.getResolvedPath(state))) : this.resolve(state);
            var resolvedContext = context ? context : this.machine.context;
            currentState = this.resolveState(State.from(resolvedStateValue, resolvedContext));
          }

          if (!IS_PRODUCTION && _event.name === WILDCARD) {
            throw new Error("An event cannot have the wildcard type ('" + WILDCARD + "')");
          }

          if (this.strict) {
            if (!this.events.includes(_event.name) && !isBuiltInEvent(_event.name)) {
              throw new Error("Machine '" + this.id + "' does not accept event '" + _event.name + "'");
            }
          }

          var stateTransition = this._transition(currentState.value, currentState, _event) || {
            transitions: [],
            configuration: [],
            entrySet: [],
            exitSet: [],
            source: currentState,
            actions: []
          };
          var prevConfig = getConfiguration([], this.getStateNodes(currentState.value));
          var resolvedConfig = stateTransition.configuration.length ? getConfiguration(prevConfig, stateTransition.configuration) : prevConfig;
          stateTransition.configuration = __spread(resolvedConfig);
          return this.resolveTransition(stateTransition, currentState, _event);
        };

        StateNode.prototype.resolveRaisedTransition = function (state, _event, originalEvent) {
          var _a;

          var currentActions = state.actions;
          state = this.transition(state, _event); // Save original event to state
          // TODO: this should be the raised event! Delete in V5 (breaking)

          state._event = originalEvent;
          state.event = originalEvent.data;

          (_a = state.actions).unshift.apply(_a, __spread(currentActions));

          return state;
        };

        StateNode.prototype.resolveTransition = function (stateTransition, currentState, _event, context) {
          var e_6, _a;

          var _this = this;

          if (_event === void 0) {
            _event = initEvent;
          }

          if (context === void 0) {
            context = this.machine.context;
          }

          var configuration = stateTransition.configuration; // Transition will "apply" if:
          // - this is the initial state (there is no current state)
          // - OR there are transitions

          var willTransition = !currentState || stateTransition.transitions.length > 0;
          var resolvedStateValue = willTransition ? getValue(this.machine, configuration) : undefined;
          var historyValue = currentState ? currentState.historyValue ? currentState.historyValue : stateTransition.source ? this.machine.historyValue(currentState.value) : undefined : undefined;
          var currentContext = currentState ? currentState.context : context;
          var actions = this.getActions(stateTransition, currentContext, _event, currentState);
          var activities = currentState ? __assign({}, currentState.activities) : {};

          try {
            for (var actions_1 = __values(actions), actions_1_1 = actions_1.next(); !actions_1_1.done; actions_1_1 = actions_1.next()) {
              var action = actions_1_1.value;

              if (action.type === start) {
                activities[action.activity.id || action.activity.type] = action;
              } else if (action.type === stop) {
                activities[action.activity.id || action.activity.type] = false;
              }
            }
          } catch (e_6_1) {
            e_6 = {
              error: e_6_1
            };
          } finally {
            try {
              if (actions_1_1 && !actions_1_1.done && (_a = actions_1.return)) _a.call(actions_1);
            } finally {
              if (e_6) throw e_6.error;
            }
          }

          var _b = __read(resolveActions(this, currentState, currentContext, _event, actions), 2),
              resolvedActions = _b[0],
              updatedContext = _b[1];

          var _c = __read(partition(resolvedActions, function (action) {
            return action.type === raise || action.type === send && action.to === SpecialTargets.Internal;
          }), 2),
              raisedEvents = _c[0],
              nonRaisedActions = _c[1];

          var invokeActions = resolvedActions.filter(function (action) {
            var _a;

            return action.type === start && ((_a = action.activity) === null || _a === void 0 ? void 0 : _a.type) === invoke;
          });
          var children = invokeActions.reduce(function (acc, action) {
            acc[action.activity.id] = createInvocableActor(action.activity, _this.machine, updatedContext, _event);
            return acc;
          }, currentState ? __assign({}, currentState.children) : {});
          var resolvedConfiguration = resolvedStateValue ? stateTransition.configuration : currentState ? currentState.configuration : [];
          var meta = resolvedConfiguration.reduce(function (acc, stateNode) {
            if (stateNode.meta !== undefined) {
              acc[stateNode.id] = stateNode.meta;
            }

            return acc;
          }, {});
          var isDone = isInFinalState(resolvedConfiguration, this);
          var nextState = new State({
            value: resolvedStateValue || currentState.value,
            context: updatedContext,
            _event: _event,
            // Persist _sessionid between states
            _sessionid: currentState ? currentState._sessionid : null,
            historyValue: resolvedStateValue ? historyValue ? updateHistoryValue(historyValue, resolvedStateValue) : undefined : currentState ? currentState.historyValue : undefined,
            history: !resolvedStateValue || stateTransition.source ? currentState : undefined,
            actions: resolvedStateValue ? nonRaisedActions : [],
            activities: resolvedStateValue ? activities : currentState ? currentState.activities : {},
            meta: resolvedStateValue ? meta : currentState ? currentState.meta : undefined,
            events: [],
            configuration: resolvedConfiguration,
            transitions: stateTransition.transitions,
            children: children,
            done: isDone
          });
          var didUpdateContext = currentContext !== updatedContext;
          nextState.changed = _event.name === update || didUpdateContext; // Dispose of penultimate histories to prevent memory leaks

          var history = nextState.history;

          if (history) {
            delete history.history;
          }

          if (!resolvedStateValue) {
            return nextState;
          }

          var maybeNextState = nextState;

          if (!isDone) {
            var isTransient = this._transient || configuration.some(function (stateNode) {
              return stateNode._transient;
            });

            if (isTransient) {
              maybeNextState = this.resolveRaisedTransition(maybeNextState, {
                type: nullEvent
              }, _event);
            }

            while (raisedEvents.length) {
              var raisedEvent = raisedEvents.shift();
              maybeNextState = this.resolveRaisedTransition(maybeNextState, raisedEvent._event, _event);
            }
          } // Detect if state changed


          var changed = maybeNextState.changed || (history ? !!maybeNextState.actions.length || didUpdateContext || typeof history.value !== typeof maybeNextState.value || !stateValuesEqual(maybeNextState.value, history.value) : undefined);
          maybeNextState.changed = changed; // Preserve original history after raised events

          maybeNextState.history = history;
          return maybeNextState;
        };
        /**
         * Returns the child state node from its relative `stateKey`, or throws.
         */


        StateNode.prototype.getStateNode = function (stateKey) {
          if (isStateId(stateKey)) {
            return this.machine.getStateNodeById(stateKey);
          }

          if (!this.states) {
            throw new Error("Unable to retrieve child state '" + stateKey + "' from '" + this.id + "'; no child states exist.");
          }

          var result = this.states[stateKey];

          if (!result) {
            throw new Error("Child state '" + stateKey + "' does not exist on '" + this.id + "'");
          }

          return result;
        };
        /**
         * Returns the state node with the given `stateId`, or throws.
         *
         * @param stateId The state ID. The prefix "#" is removed.
         */


        StateNode.prototype.getStateNodeById = function (stateId) {
          var resolvedStateId = isStateId(stateId) ? stateId.slice(STATE_IDENTIFIER.length) : stateId;

          if (resolvedStateId === this.id) {
            return this;
          }

          var stateNode = this.machine.idMap[resolvedStateId];

          if (!stateNode) {
            throw new Error("Child state node '#" + resolvedStateId + "' does not exist on machine '" + this.id + "'");
          }

          return stateNode;
        };
        /**
         * Returns the relative state node from the given `statePath`, or throws.
         *
         * @param statePath The string or string array relative path to the state node.
         */


        StateNode.prototype.getStateNodeByPath = function (statePath) {
          if (typeof statePath === 'string' && isStateId(statePath)) {
            try {
              return this.getStateNodeById(statePath.slice(1));
            } catch (e) {// try individual paths
              // throw e;
            }
          }

          var arrayStatePath = toStatePath(statePath, this.delimiter).slice();
          var currentStateNode = this;

          while (arrayStatePath.length) {
            var key = arrayStatePath.shift();

            if (!key.length) {
              break;
            }

            currentStateNode = currentStateNode.getStateNode(key);
          }

          return currentStateNode;
        };
        /**
         * Resolves a partial state value with its full representation in this machine.
         *
         * @param stateValue The partial state value to resolve.
         */


        StateNode.prototype.resolve = function (stateValue) {
          var _a;

          var _this = this;

          if (!stateValue) {
            return this.initialStateValue || EMPTY_OBJECT; // TODO: type-specific properties
          }

          switch (this.type) {
            case 'parallel':
              return mapValues(this.initialStateValue, function (subStateValue, subStateKey) {
                return subStateValue ? _this.getStateNode(subStateKey).resolve(stateValue[subStateKey] || subStateValue) : EMPTY_OBJECT;
              });

            case 'compound':
              if (isString(stateValue)) {
                var subStateNode = this.getStateNode(stateValue);

                if (subStateNode.type === 'parallel' || subStateNode.type === 'compound') {
                  return _a = {}, _a[stateValue] = subStateNode.initialStateValue, _a;
                }

                return stateValue;
              }

              if (!keys(stateValue).length) {
                return this.initialStateValue || {};
              }

              return mapValues(stateValue, function (subStateValue, subStateKey) {
                return subStateValue ? _this.getStateNode(subStateKey).resolve(subStateValue) : EMPTY_OBJECT;
              });

            default:
              return stateValue || EMPTY_OBJECT;
          }
        };

        StateNode.prototype.getResolvedPath = function (stateIdentifier) {
          if (isStateId(stateIdentifier)) {
            var stateNode = this.machine.idMap[stateIdentifier.slice(STATE_IDENTIFIER.length)];

            if (!stateNode) {
              throw new Error("Unable to find state node '" + stateIdentifier + "'");
            }

            return stateNode.path;
          }

          return toStatePath(stateIdentifier, this.delimiter);
        };

        Object.defineProperty(StateNode.prototype, "initialStateValue", {
          get: function () {
            var _a;

            if (this.__cache.initialStateValue) {
              return this.__cache.initialStateValue;
            }

            var initialStateValue;

            if (this.type === 'parallel') {
              initialStateValue = mapFilterValues(this.states, function (state) {
                return state.initialStateValue || EMPTY_OBJECT;
              }, function (stateNode) {
                return !(stateNode.type === 'history');
              });
            } else if (this.initial !== undefined) {
              if (!this.states[this.initial]) {
                throw new Error("Initial state '" + this.initial + "' not found on '" + this.key + "'");
              }

              initialStateValue = isLeafNode(this.states[this.initial]) ? this.initial : (_a = {}, _a[this.initial] = this.states[this.initial].initialStateValue, _a);
            }

            this.__cache.initialStateValue = initialStateValue;
            return this.__cache.initialStateValue;
          },
          enumerable: false,
          configurable: true
        });

        StateNode.prototype.getInitialState = function (stateValue, context) {
          var configuration = this.getStateNodes(stateValue);
          return this.resolveTransition({
            configuration: configuration,
            entrySet: configuration,
            exitSet: [],
            transitions: [],
            source: undefined,
            actions: []
          }, undefined, undefined, context);
        };

        Object.defineProperty(StateNode.prototype, "initialState", {
          /**
           * The initial State instance, which includes all actions to be executed from
           * entering the initial state.
           */
          get: function () {
            this._init(); // TODO: this should be in the constructor (see note in constructor)


            var initialStateValue = this.initialStateValue;

            if (!initialStateValue) {
              throw new Error("Cannot retrieve initial state from simple state '" + this.id + "'.");
            }

            return this.getInitialState(initialStateValue);
          },
          enumerable: false,
          configurable: true
        });
        Object.defineProperty(StateNode.prototype, "target", {
          /**
           * The target state value of the history state node, if it exists. This represents the
           * default state value to transition to if no history value exists yet.
           */
          get: function () {
            var target;

            if (this.type === 'history') {
              var historyConfig = this.config;

              if (isString(historyConfig.target)) {
                target = isStateId(historyConfig.target) ? pathToStateValue(this.machine.getStateNodeById(historyConfig.target).path.slice(this.path.length - 1)) : historyConfig.target;
              } else {
                target = historyConfig.target;
              }
            }

            return target;
          },
          enumerable: false,
          configurable: true
        });
        /**
         * Returns the leaf nodes from a state path relative to this state node.
         *
         * @param relativeStateId The relative state path to retrieve the state nodes
         * @param history The previous state to retrieve history
         * @param resolve Whether state nodes should resolve to initial child state nodes
         */

        StateNode.prototype.getRelativeStateNodes = function (relativeStateId, historyValue, resolve) {
          if (resolve === void 0) {
            resolve = true;
          }

          return resolve ? relativeStateId.type === 'history' ? relativeStateId.resolveHistory(historyValue) : relativeStateId.initialStateNodes : [relativeStateId];
        };

        Object.defineProperty(StateNode.prototype, "initialStateNodes", {
          get: function () {
            var _this = this;

            if (isLeafNode(this)) {
              return [this];
            } // Case when state node is compound but no initial state is defined


            if (this.type === 'compound' && !this.initial) {
              if (!IS_PRODUCTION) {
                warn(false, "Compound state node '" + this.id + "' has no initial state.");
              }

              return [this];
            }

            var initialStateNodePaths = toStatePaths(this.initialStateValue);
            return flatten(initialStateNodePaths.map(function (initialPath) {
              return _this.getFromRelativePath(initialPath);
            }));
          },
          enumerable: false,
          configurable: true
        });
        /**
         * Retrieves state nodes from a relative path to this state node.
         *
         * @param relativePath The relative path from this state node
         * @param historyValue
         */

        StateNode.prototype.getFromRelativePath = function (relativePath) {
          if (!relativePath.length) {
            return [this];
          }

          var _a = __read(relativePath),
              stateKey = _a[0],
              childStatePath = _a.slice(1);

          if (!this.states) {
            throw new Error("Cannot retrieve subPath '" + stateKey + "' from node with no states");
          }

          var childStateNode = this.getStateNode(stateKey);

          if (childStateNode.type === 'history') {
            return childStateNode.resolveHistory();
          }

          if (!this.states[stateKey]) {
            throw new Error("Child state '" + stateKey + "' does not exist on '" + this.id + "'");
          }

          return this.states[stateKey].getFromRelativePath(childStatePath);
        };

        StateNode.prototype.historyValue = function (relativeStateValue) {
          if (!keys(this.states).length) {
            return undefined;
          }

          return {
            current: relativeStateValue || this.initialStateValue,
            states: mapFilterValues(this.states, function (stateNode, key) {
              if (!relativeStateValue) {
                return stateNode.historyValue();
              }

              var subStateValue = isString(relativeStateValue) ? undefined : relativeStateValue[key];
              return stateNode.historyValue(subStateValue || stateNode.initialStateValue);
            }, function (stateNode) {
              return !stateNode.history;
            })
          };
        };
        /**
         * Resolves to the historical value(s) of the parent state node,
         * represented by state nodes.
         *
         * @param historyValue
         */


        StateNode.prototype.resolveHistory = function (historyValue) {
          var _this = this;

          if (this.type !== 'history') {
            return [this];
          }

          var parent = this.parent;

          if (!historyValue) {
            var historyTarget = this.target;
            return historyTarget ? flatten(toStatePaths(historyTarget).map(function (relativeChildPath) {
              return parent.getFromRelativePath(relativeChildPath);
            })) : parent.initialStateNodes;
          }

          var subHistoryValue = nestedPath(parent.path, 'states')(historyValue).current;

          if (isString(subHistoryValue)) {
            return [parent.getStateNode(subHistoryValue)];
          }

          return flatten(toStatePaths(subHistoryValue).map(function (subStatePath) {
            return _this.history === 'deep' ? parent.getFromRelativePath(subStatePath) : [parent.states[subStatePath[0]]];
          }));
        };

        Object.defineProperty(StateNode.prototype, "stateIds", {
          /**
           * All the state node IDs of this state node and its descendant state nodes.
           */
          get: function () {
            var _this = this;

            var childStateIds = flatten(keys(this.states).map(function (stateKey) {
              return _this.states[stateKey].stateIds;
            }));
            return [this.id].concat(childStateIds);
          },
          enumerable: false,
          configurable: true
        });
        Object.defineProperty(StateNode.prototype, "events", {
          /**
           * All the event types accepted by this state node and its descendants.
           */
          get: function () {
            var e_7, _a, e_8, _b;

            if (this.__cache.events) {
              return this.__cache.events;
            }

            var states = this.states;
            var events = new Set(this.ownEvents);

            if (states) {
              try {
                for (var _c = __values(keys(states)), _d = _c.next(); !_d.done; _d = _c.next()) {
                  var stateId = _d.value;
                  var state = states[stateId];

                  if (state.states) {
                    try {
                      for (var _e = (e_8 = void 0, __values(state.events)), _f = _e.next(); !_f.done; _f = _e.next()) {
                        var event_1 = _f.value;
                        events.add("" + event_1);
                      }
                    } catch (e_8_1) {
                      e_8 = {
                        error: e_8_1
                      };
                    } finally {
                      try {
                        if (_f && !_f.done && (_b = _e.return)) _b.call(_e);
                      } finally {
                        if (e_8) throw e_8.error;
                      }
                    }
                  }
                }
              } catch (e_7_1) {
                e_7 = {
                  error: e_7_1
                };
              } finally {
                try {
                  if (_d && !_d.done && (_a = _c.return)) _a.call(_c);
                } finally {
                  if (e_7) throw e_7.error;
                }
              }
            }

            return this.__cache.events = Array.from(events);
          },
          enumerable: false,
          configurable: true
        });
        Object.defineProperty(StateNode.prototype, "ownEvents", {
          /**
           * All the events that have transitions directly from this state node.
           *
           * Excludes any inert events.
           */
          get: function () {
            var events = new Set(this.transitions.filter(function (transition) {
              return !(!transition.target && !transition.actions.length && transition.internal);
            }).map(function (transition) {
              return transition.eventType;
            }));
            return Array.from(events);
          },
          enumerable: false,
          configurable: true
        });

        StateNode.prototype.resolveTarget = function (_target) {
          var _this = this;

          if (_target === undefined) {
            // an undefined target signals that the state node should not transition from that state when receiving that event
            return undefined;
          }

          return _target.map(function (target) {
            if (!isString(target)) {
              return target;
            }

            var isInternalTarget = target[0] === _this.delimiter; // If internal target is defined on machine,
            // do not include machine key on target

            if (isInternalTarget && !_this.parent) {
              return _this.getStateNodeByPath(target.slice(1));
            }

            var resolvedTarget = isInternalTarget ? _this.key + target : target;

            if (_this.parent) {
              try {
                var targetStateNode = _this.parent.getStateNodeByPath(resolvedTarget);

                return targetStateNode;
              } catch (err) {
                throw new Error("Invalid transition definition for state node '" + _this.id + "':\n" + err.message);
              }
            } else {
              return _this.getStateNodeByPath(resolvedTarget);
            }
          });
        };

        StateNode.prototype.formatTransition = function (transitionConfig) {
          var _this = this;

          var normalizedTarget = normalizeTarget(transitionConfig.target);
          var internal = 'internal' in transitionConfig ? transitionConfig.internal : normalizedTarget ? normalizedTarget.some(function (_target) {
            return isString(_target) && _target[0] === _this.delimiter;
          }) : true;
          var guards = this.machine.options.guards;
          var target = this.resolveTarget(normalizedTarget);

          var transition = __assign(__assign({}, transitionConfig), {
            actions: toActionObjects(toArray(transitionConfig.actions)),
            cond: toGuard(transitionConfig.cond, guards),
            target: target,
            source: this,
            internal: internal,
            eventType: transitionConfig.event,
            toJSON: function () {
              return __assign(__assign({}, transition), {
                target: transition.target ? transition.target.map(function (t) {
                  return "#" + t.id;
                }) : undefined,
                source: "#" + _this.id
              });
            }
          });

          return transition;
        };

        StateNode.prototype.formatTransitions = function () {
          var e_9, _a;

          var _this = this;

          var onConfig;

          if (!this.config.on) {
            onConfig = [];
          } else if (Array.isArray(this.config.on)) {
            onConfig = this.config.on;
          } else {
            var _b = this.config.on,
                _c = WILDCARD,
                _d = _b[_c],
                wildcardConfigs = _d === void 0 ? [] : _d,
                strictTransitionConfigs_1 = __rest(_b, [typeof _c === "symbol" ? _c : _c + ""]);

            onConfig = flatten(keys(strictTransitionConfigs_1).map(function (key) {
              if (!IS_PRODUCTION && key === NULL_EVENT) {
                warn(false, "Empty string transition configs (e.g., `{ on: { '': ... }}`) for transient transitions are deprecated. Specify the transition in the `{ always: ... }` property instead. " + ("Please check the `on` configuration for \"#" + _this.id + "\"."));
              }

              var transitionConfigArray = toTransitionConfigArray(key, strictTransitionConfigs_1[key]);

              if (!IS_PRODUCTION) {
                validateArrayifiedTransitions(_this, key, transitionConfigArray);
              }

              return transitionConfigArray;
            }).concat(toTransitionConfigArray(WILDCARD, wildcardConfigs)));
          }

          var eventlessConfig = this.config.always ? toTransitionConfigArray('', this.config.always) : [];
          var doneConfig = this.config.onDone ? toTransitionConfigArray(String(done(this.id)), this.config.onDone) : [];

          if (!IS_PRODUCTION) {
            warn(!(this.config.onDone && !this.parent), "Root nodes cannot have an \".onDone\" transition. Please check the config of \"" + this.id + "\".");
          }

          var invokeConfig = flatten(this.invoke.map(function (invokeDef) {
            var settleTransitions = [];

            if (invokeDef.onDone) {
              settleTransitions.push.apply(settleTransitions, __spread(toTransitionConfigArray(String(doneInvoke(invokeDef.id)), invokeDef.onDone)));
            }

            if (invokeDef.onError) {
              settleTransitions.push.apply(settleTransitions, __spread(toTransitionConfigArray(String(error$1(invokeDef.id)), invokeDef.onError)));
            }

            return settleTransitions;
          }));
          var delayedTransitions = this.after;
          var formattedTransitions = flatten(__spread(doneConfig, invokeConfig, onConfig, eventlessConfig).map(function (transitionConfig) {
            return toArray(transitionConfig).map(function (transition) {
              return _this.formatTransition(transition);
            });
          }));

          try {
            for (var delayedTransitions_1 = __values(delayedTransitions), delayedTransitions_1_1 = delayedTransitions_1.next(); !delayedTransitions_1_1.done; delayedTransitions_1_1 = delayedTransitions_1.next()) {
              var delayedTransition = delayedTransitions_1_1.value;
              formattedTransitions.push(delayedTransition);
            }
          } catch (e_9_1) {
            e_9 = {
              error: e_9_1
            };
          } finally {
            try {
              if (delayedTransitions_1_1 && !delayedTransitions_1_1.done && (_a = delayedTransitions_1.return)) _a.call(delayedTransitions_1);
            } finally {
              if (e_9) throw e_9.error;
            }
          }

          return formattedTransitions;
        };

        return StateNode;
      }());

      function Machine(config, options, initialContext) {
        if (initialContext === void 0) {
          initialContext = config.context;
        }

        var resolvedInitialContext = typeof initialContext === 'function' ? initialContext() : initialContext;
        return new StateNode(config, options, resolvedInitialContext);
      }

      function createMachine(config, options) {
        var resolvedInitialContext = typeof config.context === 'function' ? config.context() : config.context;
        return new StateNode(config, options, resolvedInitialContext);
      }

      var defaultOptions = {
        deferEvents: false
      };

      var Scheduler =
      /*#__PURE__*/

      /** @class */
      function () {
        function Scheduler(options) {
          this.processingEvent = false;
          this.queue = [];
          this.initialized = false;
          this.options = __assign(__assign({}, defaultOptions), options);
        }

        Scheduler.prototype.initialize = function (callback) {
          this.initialized = true;

          if (callback) {
            if (!this.options.deferEvents) {
              this.schedule(callback);
              return;
            }

            this.process(callback);
          }

          this.flushEvents();
        };

        Scheduler.prototype.schedule = function (task) {
          if (!this.initialized || this.processingEvent) {
            this.queue.push(task);
            return;
          }

          if (this.queue.length !== 0) {
            throw new Error('Event queue should be empty when it is not processing events');
          }

          this.process(task);
          this.flushEvents();
        };

        Scheduler.prototype.clear = function () {
          this.queue = [];
        };

        Scheduler.prototype.flushEvents = function () {
          var nextCallback = this.queue.shift();

          while (nextCallback) {
            this.process(nextCallback);
            nextCallback = this.queue.shift();
          }
        };

        Scheduler.prototype.process = function (callback) {
          this.processingEvent = true;

          try {
            callback();
          } catch (e) {
            // there is no use to keep the future events
            // as the situation is not anymore the same
            this.clear();
            throw e;
          } finally {
            this.processingEvent = false;
          }
        };

        return Scheduler;
      }();

      var children = /*#__PURE__*/new Map();
      var sessionIdIndex = 0;
      var registry = {
        bookId: function () {
          return "x:" + sessionIdIndex++;
        },
        register: function (id, actor) {
          children.set(id, actor);
          return id;
        },
        get: function (id) {
          return children.get(id);
        },
        free: function (id) {
          children.delete(id);
        }
      };

      function getGlobal() {
        if (typeof self !== 'undefined') {
          return self;
        }

        if (typeof window !== 'undefined') {
          return window;
        }

        if (typeof global !== 'undefined') {
          return global;
        }

        return undefined;
      }

      function getDevTools() {
        var global = getGlobal();

        if (global && '__xstate__' in global) {
          return global.__xstate__;
        }

        return undefined;
      }

      function registerService(service) {
        if (IS_PRODUCTION || !getGlobal()) {
          return;
        }

        var devTools = getDevTools();

        if (devTools) {
          devTools.register(service);
        }
      }

      var DEFAULT_SPAWN_OPTIONS = {
        sync: false,
        autoForward: false
      };
      var InterpreterStatus;

      (function (InterpreterStatus) {
        InterpreterStatus[InterpreterStatus["NotStarted"] = 0] = "NotStarted";
        InterpreterStatus[InterpreterStatus["Running"] = 1] = "Running";
        InterpreterStatus[InterpreterStatus["Stopped"] = 2] = "Stopped";
      })(InterpreterStatus || (InterpreterStatus = exports('InterpreterStatus', {})));

      var Interpreter =
exports('Interpreter',       /*#__PURE__*/

      /** @class */
      function () {
        /**
         * Creates a new Interpreter instance (i.e., service) for the given machine with the provided options, if any.
         *
         * @param machine The machine to be interpreted
         * @param options Interpreter options
         */
        function Interpreter(machine, options) {
          var _this = this;

          if (options === void 0) {
            options = Interpreter.defaultOptions;
          }

          this.machine = machine;
          this.scheduler = new Scheduler();
          this.delayedEventsMap = {};
          this.listeners = new Set();
          this.contextListeners = new Set();
          this.stopListeners = new Set();
          this.doneListeners = new Set();
          this.eventListeners = new Set();
          this.sendListeners = new Set();
          /**
           * Whether the service is started.
           */

          this.initialized = false;
          this.status = InterpreterStatus.NotStarted;
          this.children = new Map();
          this.forwardTo = new Set();
          /**
           * Alias for Interpreter.prototype.start
           */

          this.init = this.start;
          /**
           * Sends an event to the running interpreter to trigger a transition.
           *
           * An array of events (batched) can be sent as well, which will send all
           * batched events to the running interpreter. The listeners will be
           * notified only **once** when all events are processed.
           *
           * @param event The event(s) to send
           */

          this.send = function (event, payload) {
            if (isArray(event)) {
              _this.batch(event);

              return _this.state;
            }

            var _event = toSCXMLEvent(toEventObject(event, payload));

            if (_this.status === InterpreterStatus.Stopped) {
              // do nothing
              if (!IS_PRODUCTION) {
                warn(false, "Event \"" + _event.name + "\" was sent to stopped service \"" + _this.machine.id + "\". This service has already reached its final state, and will not transition.\nEvent: " + JSON.stringify(_event.data));
              }

              return _this.state;
            }

            if (_this.status !== InterpreterStatus.Running && !_this.options.deferEvents) {
              throw new Error("Event \"" + _event.name + "\" was sent to uninitialized service \"" + _this.machine.id + "\". Make sure .start() is called for this service, or set { deferEvents: true } in the service options.\nEvent: " + JSON.stringify(_event.data));
            }

            _this.scheduler.schedule(function () {
              // Forward copy of event to child actors
              _this.forward(_event);

              var nextState = _this.nextState(_event);

              _this.update(nextState, _event);
            });

            return _this._state; // TODO: deprecate (should return void)
            // tslint:disable-next-line:semicolon
          };

          this.sendTo = function (event, to) {
            var isParent = _this.parent && (to === SpecialTargets.Parent || _this.parent.id === to);
            var target = isParent ? _this.parent : isString(to) ? _this.children.get(to) || registry.get(to) : isActor(to) ? to : undefined;

            if (!target) {
              if (!isParent) {
                throw new Error("Unable to send event to child '" + to + "' from service '" + _this.id + "'.");
              } // tslint:disable-next-line:no-console


              if (!IS_PRODUCTION) {
                warn(false, "Service '" + _this.id + "' has no parent: unable to send event " + event.type);
              }

              return;
            }

            if ('machine' in target) {
              // Send SCXML events to machines
              target.send(__assign(__assign({}, event), {
                name: event.name === error ? "" + error$1(_this.id) : event.name,
                origin: _this.sessionId
              }));
            } else {
              // Send normal events to other targets
              target.send(event.data);
            }
          };

          var resolvedOptions = __assign(__assign({}, Interpreter.defaultOptions), options);

          var clock = resolvedOptions.clock,
              logger = resolvedOptions.logger,
              parent = resolvedOptions.parent,
              id = resolvedOptions.id;
          var resolvedId = id !== undefined ? id : machine.id;
          this.id = resolvedId;
          this.logger = logger;
          this.clock = clock;
          this.parent = parent;
          this.options = resolvedOptions;
          this.scheduler = new Scheduler({
            deferEvents: this.options.deferEvents
          });
          this.sessionId = registry.bookId();
        }

        Object.defineProperty(Interpreter.prototype, "initialState", {
          get: function () {
            var _this = this;

            if (this._initialState) {
              return this._initialState;
            }

            return provide(this, function () {
              _this._initialState = _this.machine.initialState;
              return _this._initialState;
            });
          },
          enumerable: false,
          configurable: true
        });
        Object.defineProperty(Interpreter.prototype, "state", {
          get: function () {
            if (!IS_PRODUCTION) {
              warn(this.status !== InterpreterStatus.NotStarted, "Attempted to read state from uninitialized service '" + this.id + "'. Make sure the service is started first.");
            }

            return this._state;
          },
          enumerable: false,
          configurable: true
        });
        /**
         * Executes the actions of the given state, with that state's `context` and `event`.
         *
         * @param state The state whose actions will be executed
         * @param actionsConfig The action implementations to use
         */

        Interpreter.prototype.execute = function (state, actionsConfig) {
          var e_1, _a;

          try {
            for (var _b = __values(state.actions), _c = _b.next(); !_c.done; _c = _b.next()) {
              var action = _c.value;
              this.exec(action, state, actionsConfig);
            }
          } catch (e_1_1) {
            e_1 = {
              error: e_1_1
            };
          } finally {
            try {
              if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
            } finally {
              if (e_1) throw e_1.error;
            }
          }
        };

        Interpreter.prototype.update = function (state, _event) {
          var e_2, _a, e_3, _b, e_4, _c, e_5, _d;

          var _this = this; // Attach session ID to state


          state._sessionid = this.sessionId; // Update state

          this._state = state; // Execute actions

          if (this.options.execute) {
            this.execute(this.state);
          } // Update children


          this.children.forEach(function (child) {
            _this.state.children[child.id] = child;
          }); // Dev tools

          if (this.devTools) {
            this.devTools.send(_event.data, state);
          } // Execute listeners


          if (state.event) {
            try {
              for (var _e = __values(this.eventListeners), _f = _e.next(); !_f.done; _f = _e.next()) {
                var listener = _f.value;
                listener(state.event);
              }
            } catch (e_2_1) {
              e_2 = {
                error: e_2_1
              };
            } finally {
              try {
                if (_f && !_f.done && (_a = _e.return)) _a.call(_e);
              } finally {
                if (e_2) throw e_2.error;
              }
            }
          }

          try {
            for (var _g = __values(this.listeners), _h = _g.next(); !_h.done; _h = _g.next()) {
              var listener = _h.value;
              listener(state, state.event);
            }
          } catch (e_3_1) {
            e_3 = {
              error: e_3_1
            };
          } finally {
            try {
              if (_h && !_h.done && (_b = _g.return)) _b.call(_g);
            } finally {
              if (e_3) throw e_3.error;
            }
          }

          try {
            for (var _j = __values(this.contextListeners), _k = _j.next(); !_k.done; _k = _j.next()) {
              var contextListener = _k.value;
              contextListener(this.state.context, this.state.history ? this.state.history.context : undefined);
            }
          } catch (e_4_1) {
            e_4 = {
              error: e_4_1
            };
          } finally {
            try {
              if (_k && !_k.done && (_c = _j.return)) _c.call(_j);
            } finally {
              if (e_4) throw e_4.error;
            }
          }

          var isDone = isInFinalState(state.configuration || [], this.machine);

          if (this.state.configuration && isDone) {
            // get final child state node
            var finalChildStateNode = state.configuration.find(function (sn) {
              return sn.type === 'final' && sn.parent === _this.machine;
            });
            var doneData = finalChildStateNode && finalChildStateNode.doneData ? mapContext(finalChildStateNode.doneData, state.context, _event) : undefined;

            try {
              for (var _l = __values(this.doneListeners), _m = _l.next(); !_m.done; _m = _l.next()) {
                var listener = _m.value;
                listener(doneInvoke(this.id, doneData));
              }
            } catch (e_5_1) {
              e_5 = {
                error: e_5_1
              };
            } finally {
              try {
                if (_m && !_m.done && (_d = _l.return)) _d.call(_l);
              } finally {
                if (e_5) throw e_5.error;
              }
            }

            this.stop();
          }
        };
        /*
         * Adds a listener that is notified whenever a state transition happens. The listener is called with
         * the next state and the event object that caused the state transition.
         *
         * @param listener The state listener
         */


        Interpreter.prototype.onTransition = function (listener) {
          this.listeners.add(listener); // Send current state to listener

          if (this.status === InterpreterStatus.Running) {
            listener(this.state, this.state.event);
          }

          return this;
        };

        Interpreter.prototype.subscribe = function (nextListenerOrObserver, _, // TODO: error listener
        completeListener) {
          var _this = this;

          if (!nextListenerOrObserver) {
            return {
              unsubscribe: function () {
                return void 0;
              }
            };
          }

          var listener;
          var resolvedCompleteListener = completeListener;

          if (typeof nextListenerOrObserver === 'function') {
            listener = nextListenerOrObserver;
          } else {
            listener = nextListenerOrObserver.next.bind(nextListenerOrObserver);
            resolvedCompleteListener = nextListenerOrObserver.complete.bind(nextListenerOrObserver);
          }

          this.listeners.add(listener); // Send current state to listener

          if (this.status === InterpreterStatus.Running) {
            listener(this.state);
          }

          if (resolvedCompleteListener) {
            this.onDone(resolvedCompleteListener);
          }

          return {
            unsubscribe: function () {
              listener && _this.listeners.delete(listener);
              resolvedCompleteListener && _this.doneListeners.delete(resolvedCompleteListener);
            }
          };
        };
        /**
         * Adds an event listener that is notified whenever an event is sent to the running interpreter.
         * @param listener The event listener
         */


        Interpreter.prototype.onEvent = function (listener) {
          this.eventListeners.add(listener);
          return this;
        };
        /**
         * Adds an event listener that is notified whenever a `send` event occurs.
         * @param listener The event listener
         */


        Interpreter.prototype.onSend = function (listener) {
          this.sendListeners.add(listener);
          return this;
        };
        /**
         * Adds a context listener that is notified whenever the state context changes.
         * @param listener The context listener
         */


        Interpreter.prototype.onChange = function (listener) {
          this.contextListeners.add(listener);
          return this;
        };
        /**
         * Adds a listener that is notified when the machine is stopped.
         * @param listener The listener
         */


        Interpreter.prototype.onStop = function (listener) {
          this.stopListeners.add(listener);
          return this;
        };
        /**
         * Adds a state listener that is notified when the statechart has reached its final state.
         * @param listener The state listener
         */


        Interpreter.prototype.onDone = function (listener) {
          this.doneListeners.add(listener);
          return this;
        };
        /**
         * Removes a listener.
         * @param listener The listener to remove
         */


        Interpreter.prototype.off = function (listener) {
          this.listeners.delete(listener);
          this.eventListeners.delete(listener);
          this.sendListeners.delete(listener);
          this.stopListeners.delete(listener);
          this.doneListeners.delete(listener);
          this.contextListeners.delete(listener);
          return this;
        };
        /**
         * Starts the interpreter from the given state, or the initial state.
         * @param initialState The state to start the statechart from
         */


        Interpreter.prototype.start = function (initialState) {
          var _this = this;

          if (this.status === InterpreterStatus.Running) {
            // Do not restart the service if it is already started
            return this;
          }

          registry.register(this.sessionId, this);
          this.initialized = true;
          this.status = InterpreterStatus.Running;
          var resolvedState = initialState === undefined ? this.initialState : provide(this, function () {
            return isState(initialState) ? _this.machine.resolveState(initialState) : _this.machine.resolveState(State.from(initialState, _this.machine.context));
          });

          if (this.options.devTools) {
            this.attachDev();
          }

          this.scheduler.initialize(function () {
            _this.update(resolvedState, initEvent);
          });
          return this;
        };
        /**
         * Stops the interpreter and unsubscribe all listeners.
         *
         * This will also notify the `onStop` listeners.
         */


        Interpreter.prototype.stop = function () {
          var e_6, _a, e_7, _b, e_8, _c, e_9, _d, e_10, _e;

          var _this = this;

          try {
            for (var _f = __values(this.listeners), _g = _f.next(); !_g.done; _g = _f.next()) {
              var listener = _g.value;
              this.listeners.delete(listener);
            }
          } catch (e_6_1) {
            e_6 = {
              error: e_6_1
            };
          } finally {
            try {
              if (_g && !_g.done && (_a = _f.return)) _a.call(_f);
            } finally {
              if (e_6) throw e_6.error;
            }
          }

          try {
            for (var _h = __values(this.stopListeners), _j = _h.next(); !_j.done; _j = _h.next()) {
              var listener = _j.value; // call listener, then remove

              listener();
              this.stopListeners.delete(listener);
            }
          } catch (e_7_1) {
            e_7 = {
              error: e_7_1
            };
          } finally {
            try {
              if (_j && !_j.done && (_b = _h.return)) _b.call(_h);
            } finally {
              if (e_7) throw e_7.error;
            }
          }

          try {
            for (var _k = __values(this.contextListeners), _l = _k.next(); !_l.done; _l = _k.next()) {
              var listener = _l.value;
              this.contextListeners.delete(listener);
            }
          } catch (e_8_1) {
            e_8 = {
              error: e_8_1
            };
          } finally {
            try {
              if (_l && !_l.done && (_c = _k.return)) _c.call(_k);
            } finally {
              if (e_8) throw e_8.error;
            }
          }

          try {
            for (var _m = __values(this.doneListeners), _o = _m.next(); !_o.done; _o = _m.next()) {
              var listener = _o.value;
              this.doneListeners.delete(listener);
            }
          } catch (e_9_1) {
            e_9 = {
              error: e_9_1
            };
          } finally {
            try {
              if (_o && !_o.done && (_d = _m.return)) _d.call(_m);
            } finally {
              if (e_9) throw e_9.error;
            }
          }

          if (!this.initialized) {
            // Interpreter already stopped; do nothing
            return this;
          }

          this.state.configuration.forEach(function (stateNode) {
            var e_11, _a;

            try {
              for (var _b = __values(stateNode.definition.exit), _c = _b.next(); !_c.done; _c = _b.next()) {
                var action = _c.value;

                _this.exec(action, _this.state);
              }
            } catch (e_11_1) {
              e_11 = {
                error: e_11_1
              };
            } finally {
              try {
                if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
              } finally {
                if (e_11) throw e_11.error;
              }
            }
          }); // Stop all children

          this.children.forEach(function (child) {
            if (isFunction(child.stop)) {
              child.stop();
            }
          });

          try {
            // Cancel all delayed events
            for (var _p = __values(keys(this.delayedEventsMap)), _q = _p.next(); !_q.done; _q = _p.next()) {
              var key = _q.value;
              this.clock.clearTimeout(this.delayedEventsMap[key]);
            }
          } catch (e_10_1) {
            e_10 = {
              error: e_10_1
            };
          } finally {
            try {
              if (_q && !_q.done && (_e = _p.return)) _e.call(_p);
            } finally {
              if (e_10) throw e_10.error;
            }
          }

          this.scheduler.clear();
          this.initialized = false;
          this.status = InterpreterStatus.Stopped;
          registry.free(this.sessionId);
          return this;
        };

        Interpreter.prototype.batch = function (events) {
          var _this = this;

          if (this.status === InterpreterStatus.NotStarted && this.options.deferEvents) {
            // tslint:disable-next-line:no-console
            if (!IS_PRODUCTION) {
              warn(false, events.length + " event(s) were sent to uninitialized service \"" + this.machine.id + "\" and are deferred. Make sure .start() is called for this service.\nEvent: " + JSON.stringify(event));
            }
          } else if (this.status !== InterpreterStatus.Running) {
            throw new Error( // tslint:disable-next-line:max-line-length
            events.length + " event(s) were sent to uninitialized service \"" + this.machine.id + "\". Make sure .start() is called for this service, or set { deferEvents: true } in the service options.");
          }

          this.scheduler.schedule(function () {
            var e_12, _a;

            var nextState = _this.state;
            var batchChanged = false;
            var batchedActions = [];

            var _loop_1 = function (event_1) {
              var _event = toSCXMLEvent(event_1);

              _this.forward(_event);

              nextState = provide(_this, function () {
                return _this.machine.transition(nextState, _event);
              });
              batchedActions.push.apply(batchedActions, __spread(nextState.actions.map(function (a) {
                return bindActionToState(a, nextState);
              })));
              batchChanged = batchChanged || !!nextState.changed;
            };

            try {
              for (var events_1 = __values(events), events_1_1 = events_1.next(); !events_1_1.done; events_1_1 = events_1.next()) {
                var event_1 = events_1_1.value;

                _loop_1(event_1);
              }
            } catch (e_12_1) {
              e_12 = {
                error: e_12_1
              };
            } finally {
              try {
                if (events_1_1 && !events_1_1.done && (_a = events_1.return)) _a.call(events_1);
              } finally {
                if (e_12) throw e_12.error;
              }
            }

            nextState.changed = batchChanged;
            nextState.actions = batchedActions;

            _this.update(nextState, toSCXMLEvent(events[events.length - 1]));
          });
        };
        /**
         * Returns a send function bound to this interpreter instance.
         *
         * @param event The event to be sent by the sender.
         */


        Interpreter.prototype.sender = function (event) {
          return this.send.bind(this, event);
        };
        /**
         * Returns the next state given the interpreter's current state and the event.
         *
         * This is a pure method that does _not_ update the interpreter's state.
         *
         * @param event The event to determine the next state
         */


        Interpreter.prototype.nextState = function (event) {
          var _this = this;

          var _event = toSCXMLEvent(event);

          if (_event.name.indexOf(errorPlatform) === 0 && !this.state.nextEvents.some(function (nextEvent) {
            return nextEvent.indexOf(errorPlatform) === 0;
          })) {
            throw _event.data.data;
          }

          var nextState = provide(this, function () {
            return _this.machine.transition(_this.state, _event);
          });
          return nextState;
        };

        Interpreter.prototype.forward = function (event) {
          var e_13, _a;

          try {
            for (var _b = __values(this.forwardTo), _c = _b.next(); !_c.done; _c = _b.next()) {
              var id = _c.value;
              var child = this.children.get(id);

              if (!child) {
                throw new Error("Unable to forward event '" + event + "' from interpreter '" + this.id + "' to nonexistant child '" + id + "'.");
              }

              child.send(event);
            }
          } catch (e_13_1) {
            e_13 = {
              error: e_13_1
            };
          } finally {
            try {
              if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
            } finally {
              if (e_13) throw e_13.error;
            }
          }
        };

        Interpreter.prototype.defer = function (sendAction) {
          var _this = this;

          this.delayedEventsMap[sendAction.id] = this.clock.setTimeout(function () {
            if (sendAction.to) {
              _this.sendTo(sendAction._event, sendAction.to);
            } else {
              _this.send(sendAction._event);
            }
          }, sendAction.delay);
        };

        Interpreter.prototype.cancel = function (sendId) {
          this.clock.clearTimeout(this.delayedEventsMap[sendId]);
          delete this.delayedEventsMap[sendId];
        };

        Interpreter.prototype.exec = function (action, state, actionFunctionMap) {
          if (actionFunctionMap === void 0) {
            actionFunctionMap = this.machine.options.actions;
          }

          var context = state.context,
              _event = state._event;
          var actionOrExec = action.exec || getActionFunction(action.type, actionFunctionMap);
          var exec = isFunction(actionOrExec) ? actionOrExec : actionOrExec ? actionOrExec.exec : action.exec;

          if (exec) {
            try {
              return exec(context, _event.data, {
                action: action,
                state: this.state,
                _event: _event
              });
            } catch (err) {
              if (this.parent) {
                this.parent.send({
                  type: 'xstate.error',
                  data: err
                });
              }

              throw err;
            }
          }

          switch (action.type) {
            case send:
              var sendAction = action;

              if (typeof sendAction.delay === 'number') {
                this.defer(sendAction);
                return;
              } else {
                if (sendAction.to) {
                  this.sendTo(sendAction._event, sendAction.to);
                } else {
                  this.send(sendAction._event);
                }
              }

              break;

            case cancel:
              this.cancel(action.sendId);
              break;

            case start:
              {
                var activity = action.activity; // If the activity will be stopped right after it's started
                // (such as in transient states)
                // don't bother starting the activity.

                if (!this.state.activities[activity.id || activity.type]) {
                  break;
                } // Invoked services


                if (activity.type === ActionTypes.Invoke) {
                  var invokeSource = toInvokeSource(activity.src);
                  var serviceCreator = this.machine.options.services ? this.machine.options.services[invokeSource.type] : undefined;
                  var id = activity.id,
                      data = activity.data;

                  if (!IS_PRODUCTION) {
                    warn(!('forward' in activity), // tslint:disable-next-line:max-line-length
                    "`forward` property is deprecated (found in invocation of '" + activity.src + "' in in machine '" + this.machine.id + "'). " + "Please use `autoForward` instead.");
                  }

                  var autoForward = 'autoForward' in activity ? activity.autoForward : !!activity.forward;

                  if (!serviceCreator) {
                    // tslint:disable-next-line:no-console
                    if (!IS_PRODUCTION) {
                      warn(false, "No service found for invocation '" + activity.src + "' in machine '" + this.machine.id + "'.");
                    }

                    return;
                  }

                  var resolvedData = data ? mapContext(data, context, _event) : undefined;
                  var source = isFunction(serviceCreator) ? serviceCreator(context, _event.data, {
                    data: resolvedData,
                    src: invokeSource
                  }) : serviceCreator;

                  if (isPromiseLike(source)) {
                    this.spawnPromise(Promise.resolve(source), id);
                  } else if (isFunction(source)) {
                    this.spawnCallback(source, id);
                  } else if (isObservable(source)) {
                    this.spawnObservable(source, id);
                  } else if (isMachine(source)) {
                    // TODO: try/catch here
                    this.spawnMachine(resolvedData ? source.withContext(resolvedData) : source, {
                      id: id,
                      autoForward: autoForward
                    });
                  } else ;
                } else {
                  this.spawnActivity(activity);
                }

                break;
              }

            case stop:
              {
                this.stopChild(action.activity.id);
                break;
              }

            case log:
              var label = action.label,
                  value = action.value;

              if (label) {
                this.logger(label, value);
              } else {
                this.logger(value);
              }

              break;

            default:
              if (!IS_PRODUCTION) {
                warn(false, "No implementation found for action type '" + action.type + "'");
              }

              break;
          }

          return undefined;
        };

        Interpreter.prototype.removeChild = function (childId) {
          this.children.delete(childId);
          this.forwardTo.delete(childId);
          delete this.state.children[childId];
        };

        Interpreter.prototype.stopChild = function (childId) {
          var child = this.children.get(childId);

          if (!child) {
            return;
          }

          this.removeChild(childId);

          if (isFunction(child.stop)) {
            child.stop();
          }
        };

        Interpreter.prototype.spawn = function (entity, name, options) {
          if (isPromiseLike(entity)) {
            return this.spawnPromise(Promise.resolve(entity), name);
          } else if (isFunction(entity)) {
            return this.spawnCallback(entity, name);
          } else if (isSpawnedActor(entity)) {
            return this.spawnActor(entity);
          } else if (isObservable(entity)) {
            return this.spawnObservable(entity, name);
          } else if (isMachine(entity)) {
            return this.spawnMachine(entity, __assign(__assign({}, options), {
              id: name
            }));
          } else {
            throw new Error("Unable to spawn entity \"" + name + "\" of type \"" + typeof entity + "\".");
          }
        };

        Interpreter.prototype.spawnMachine = function (machine, options) {
          var _this = this;

          if (options === void 0) {
            options = {};
          }

          var childService = new Interpreter(machine, __assign(__assign({}, this.options), {
            parent: this,
            id: options.id || machine.id
          }));

          var resolvedOptions = __assign(__assign({}, DEFAULT_SPAWN_OPTIONS), options);

          if (resolvedOptions.sync) {
            childService.onTransition(function (state) {
              _this.send(update, {
                state: state,
                id: childService.id
              });
            });
          }

          var actor = childService;
          this.children.set(childService.id, actor);

          if (resolvedOptions.autoForward) {
            this.forwardTo.add(childService.id);
          }

          childService.onDone(function (doneEvent) {
            _this.removeChild(childService.id);

            _this.send(toSCXMLEvent(doneEvent, {
              origin: childService.id
            }));
          }).start();
          return actor;
        };

        Interpreter.prototype.spawnPromise = function (promise, id) {
          var _this = this;

          var canceled = false;
          promise.then(function (response) {
            if (!canceled) {
              _this.removeChild(id);

              _this.send(toSCXMLEvent(doneInvoke(id, response), {
                origin: id
              }));
            }
          }, function (errorData) {
            if (!canceled) {
              _this.removeChild(id);

              var errorEvent = error$1(id, errorData);

              try {
                // Send "error.platform.id" to this (parent).
                _this.send(toSCXMLEvent(errorEvent, {
                  origin: id
                }));
              } catch (error) {
                reportUnhandledExceptionOnInvocation(errorData, error, id);

                if (_this.devTools) {
                  _this.devTools.send(errorEvent, _this.state);
                }

                if (_this.machine.strict) {
                  // it would be better to always stop the state machine if unhandled
                  // exception/promise rejection happens but because we don't want to
                  // break existing code so enforce it on strict mode only especially so
                  // because documentation says that onError is optional
                  _this.stop();
                }
              }
            }
          });
          var actor = {
            id: id,
            send: function () {
              return void 0;
            },
            subscribe: function (next, handleError, complete) {
              var observer = toObserver(next, handleError, complete);
              var unsubscribed = false;
              promise.then(function (response) {
                if (unsubscribed) {
                  return;
                }

                observer.next(response);

                if (unsubscribed) {
                  return;
                }

                observer.complete();
              }, function (err) {
                if (unsubscribed) {
                  return;
                }

                observer.error(err);
              });
              return {
                unsubscribe: function () {
                  return unsubscribed = true;
                }
              };
            },
            stop: function () {
              canceled = true;
            },
            toJSON: function () {
              return {
                id: id
              };
            }
          };
          this.children.set(id, actor);
          return actor;
        };

        Interpreter.prototype.spawnCallback = function (callback, id) {
          var _this = this;

          var canceled = false;
          var receivers = new Set();
          var listeners = new Set();

          var receive = function (e) {
            listeners.forEach(function (listener) {
              return listener(e);
            });

            if (canceled) {
              return;
            }

            _this.send(toSCXMLEvent(e, {
              origin: id
            }));
          };

          var callbackStop;

          try {
            callbackStop = callback(receive, function (newListener) {
              receivers.add(newListener);
            });
          } catch (err) {
            this.send(error$1(id, err));
          }

          if (isPromiseLike(callbackStop)) {
            // it turned out to be an async function, can't reliably check this before calling `callback`
            // because transpiled async functions are not recognizable
            return this.spawnPromise(callbackStop, id);
          }

          var actor = {
            id: id,
            send: function (event) {
              return receivers.forEach(function (receiver) {
                return receiver(event);
              });
            },
            subscribe: function (next) {
              listeners.add(next);
              return {
                unsubscribe: function () {
                  listeners.delete(next);
                }
              };
            },
            stop: function () {
              canceled = true;

              if (isFunction(callbackStop)) {
                callbackStop();
              }
            },
            toJSON: function () {
              return {
                id: id
              };
            }
          };
          this.children.set(id, actor);
          return actor;
        };

        Interpreter.prototype.spawnObservable = function (source, id) {
          var _this = this;

          var subscription = source.subscribe(function (value) {
            _this.send(toSCXMLEvent(value, {
              origin: id
            }));
          }, function (err) {
            _this.removeChild(id);

            _this.send(toSCXMLEvent(error$1(id, err), {
              origin: id
            }));
          }, function () {
            _this.removeChild(id);

            _this.send(toSCXMLEvent(doneInvoke(id), {
              origin: id
            }));
          });
          var actor = {
            id: id,
            send: function () {
              return void 0;
            },
            subscribe: function (next, handleError, complete) {
              return source.subscribe(next, handleError, complete);
            },
            stop: function () {
              return subscription.unsubscribe();
            },
            toJSON: function () {
              return {
                id: id
              };
            }
          };
          this.children.set(id, actor);
          return actor;
        };

        Interpreter.prototype.spawnActor = function (actor) {
          this.children.set(actor.id, actor);
          return actor;
        };

        Interpreter.prototype.spawnActivity = function (activity) {
          var implementation = this.machine.options && this.machine.options.activities ? this.machine.options.activities[activity.type] : undefined;

          if (!implementation) {
            if (!IS_PRODUCTION) {
              warn(false, "No implementation found for activity '" + activity.type + "'");
            } // tslint:disable-next-line:no-console


            return;
          } // Start implementation


          var dispose = implementation(this.state.context, activity);
          this.spawnEffect(activity.id, dispose);
        };

        Interpreter.prototype.spawnEffect = function (id, dispose) {
          this.children.set(id, {
            id: id,
            send: function () {
              return void 0;
            },
            subscribe: function () {
              return {
                unsubscribe: function () {
                  return void 0;
                }
              };
            },
            stop: dispose || undefined,
            toJSON: function () {
              return {
                id: id
              };
            }
          });
        };

        Interpreter.prototype.attachDev = function () {
          var global = getGlobal();

          if (this.options.devTools && global) {
            if (global.__REDUX_DEVTOOLS_EXTENSION__) {
              var devToolsOptions = typeof this.options.devTools === 'object' ? this.options.devTools : undefined;
              this.devTools = global.__REDUX_DEVTOOLS_EXTENSION__.connect(__assign(__assign({
                name: this.id,
                autoPause: true,
                stateSanitizer: function (state) {
                  return {
                    value: state.value,
                    context: state.context,
                    actions: state.actions
                  };
                }
              }, devToolsOptions), {
                features: __assign({
                  jump: false,
                  skip: false
                }, devToolsOptions ? devToolsOptions.features : undefined)
              }), this.machine);
              this.devTools.init(this.state);
            } // add XState-specific dev tooling hook


            registerService(this);
          }
        };

        Interpreter.prototype.toJSON = function () {
          return {
            id: this.id
          };
        };

        Interpreter.prototype[symbolObservable] = function () {
          return this;
        };
        /**
         * The default interpreter options:
         *
         * - `clock` uses the global `setTimeout` and `clearTimeout` functions
         * - `logger` uses the global `console.log()` method
         */


        Interpreter.defaultOptions = /*#__PURE__*/function (global) {
          return {
            execute: true,
            deferEvents: true,
            clock: {
              setTimeout: function (fn, ms) {
                return setTimeout(fn, ms);
              },
              clearTimeout: function (id) {
                return clearTimeout(id);
              }
            },
            logger: global.console.log.bind(console),
            devTools: false
          };
        }(typeof self !== 'undefined' ? self : global);

        Interpreter.interpret = interpret;
        return Interpreter;
      }());

      var resolveSpawnOptions = function (nameOrOptions) {
        if (isString(nameOrOptions)) {
          return __assign(__assign({}, DEFAULT_SPAWN_OPTIONS), {
            name: nameOrOptions
          });
        }

        return __assign(__assign(__assign({}, DEFAULT_SPAWN_OPTIONS), {
          name: uniqueId()
        }), nameOrOptions);
      };

      function spawn(entity, nameOrOptions) {
        var resolvedOptions = resolveSpawnOptions(nameOrOptions);
        return consume(function (service) {
          if (!IS_PRODUCTION) {
            var isLazyEntity = isMachine(entity) || isFunction(entity);
            warn(!!service || isLazyEntity, "Attempted to spawn an Actor (ID: \"" + (isMachine(entity) ? entity.id : 'undefined') + "\") outside of a service. This will have no effect.");
          }

          if (service) {
            return service.spawn(entity, resolvedOptions.name, resolvedOptions);
          } else {
            return createDeferredActor(entity, resolvedOptions.name);
          }
        });
      }
      /**
       * Creates a new Interpreter instance for the given machine with the provided options, if any.
       *
       * @param machine The machine to interpret
       * @param options Interpreter options
       */


      function interpret(machine, options) {
        var interpreter = new Interpreter(machine, options);
        return interpreter;
      }

      function matchState(state, patterns, defaultValue) {
        var e_1, _a;

        var resolvedState = State.from(state, state instanceof State ? state.context : undefined);

        try {
          for (var patterns_1 = __values(patterns), patterns_1_1 = patterns_1.next(); !patterns_1_1.done; patterns_1_1 = patterns_1.next()) {
            var _b = __read(patterns_1_1.value, 2),
                stateValue = _b[0],
                getValue = _b[1];

            if (resolvedState.matches(stateValue)) {
              return getValue(resolvedState);
            }
          }
        } catch (e_1_1) {
          e_1 = {
            error: e_1_1
          };
        } finally {
          try {
            if (patterns_1_1 && !patterns_1_1.done && (_a = patterns_1.return)) _a.call(patterns_1);
          } finally {
            if (e_1) throw e_1.error;
          }
        }

        return defaultValue(resolvedState);
      }

      var actions = exports('actions', {
        raise: raise$1,
        send: send$1,
        sendParent: sendParent,
        sendUpdate: sendUpdate,
        log: log$1,
        cancel: cancel$1,
        start: start$1,
        stop: stop$1,
        assign: assign$1,
        after: after,
        done: done,
        respond: respond,
        forwardTo: forwardTo,
        escalate: escalate,
        choose: choose$1,
        pure: pure$1
      });

    }
  };
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL25vZGVfbW9kdWxlcy94c3RhdGUvZXMvX3ZpcnR1YWwvX3RzbGliLmpzIiwiLi4vLi4vLi4vLi4vLi4vbm9kZV9tb2R1bGVzL3hzdGF0ZS9lcy9jb25zdGFudHMuanMiLCIuLi8uLi8uLi8uLi8uLi9ub2RlX21vZHVsZXMveHN0YXRlL2VzL2Vudmlyb25tZW50LmpzIiwiLi4vLi4vLi4vLi4vLi4vbm9kZV9tb2R1bGVzL3hzdGF0ZS9lcy91dGlscy5qcyIsIi4uLy4uLy4uLy4uLy4uL25vZGVfbW9kdWxlcy94c3RhdGUvZXMvbWFwU3RhdGUuanMiLCIuLi8uLi8uLi8uLi8uLi9ub2RlX21vZHVsZXMveHN0YXRlL2VzL3R5cGVzLmpzIiwiLi4vLi4vLi4vLi4vLi4vbm9kZV9tb2R1bGVzL3hzdGF0ZS9lcy9hY3Rpb25UeXBlcy5qcyIsIi4uLy4uLy4uLy4uLy4uL25vZGVfbW9kdWxlcy94c3RhdGUvZXMvYWN0aW9ucy5qcyIsIi4uLy4uLy4uLy4uLy4uL25vZGVfbW9kdWxlcy94c3RhdGUvZXMvc3RhdGVVdGlscy5qcyIsIi4uLy4uLy4uLy4uLy4uL25vZGVfbW9kdWxlcy94c3RhdGUvZXMvU3RhdGUuanMiLCIuLi8uLi8uLi8uLi8uLi9ub2RlX21vZHVsZXMveHN0YXRlL2VzL3NlcnZpY2VTY29wZS5qcyIsIi4uLy4uLy4uLy4uLy4uL25vZGVfbW9kdWxlcy94c3RhdGUvZXMvQWN0b3IuanMiLCIuLi8uLi8uLi8uLi8uLi9ub2RlX21vZHVsZXMveHN0YXRlL2VzL2ludm9rZVV0aWxzLmpzIiwiLi4vLi4vLi4vLi4vLi4vbm9kZV9tb2R1bGVzL3hzdGF0ZS9lcy9TdGF0ZU5vZGUuanMiLCIuLi8uLi8uLi8uLi8uLi9ub2RlX21vZHVsZXMveHN0YXRlL2VzL01hY2hpbmUuanMiLCIuLi8uLi8uLi8uLi8uLi9ub2RlX21vZHVsZXMveHN0YXRlL2VzL3NjaGVkdWxlci5qcyIsIi4uLy4uLy4uLy4uLy4uL25vZGVfbW9kdWxlcy94c3RhdGUvZXMvcmVnaXN0cnkuanMiLCIuLi8uLi8uLi8uLi8uLi9ub2RlX21vZHVsZXMveHN0YXRlL2VzL2RldlRvb2xzLmpzIiwiLi4vLi4vLi4vLi4vLi4vbm9kZV9tb2R1bGVzL3hzdGF0ZS9lcy9pbnRlcnByZXRlci5qcyIsIi4uLy4uLy4uLy4uLy4uL25vZGVfbW9kdWxlcy94c3RhdGUvZXMvbWF0Y2guanMiLCIuLi8uLi8uLi8uLi8uLi9ub2RlX21vZHVsZXMveHN0YXRlL2VzL2luZGV4LmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8qISAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxyXG5Db3B5cmlnaHQgKGMpIE1pY3Jvc29mdCBDb3Jwb3JhdGlvbi5cclxuXHJcblBlcm1pc3Npb24gdG8gdXNlLCBjb3B5LCBtb2RpZnksIGFuZC9vciBkaXN0cmlidXRlIHRoaXMgc29mdHdhcmUgZm9yIGFueVxyXG5wdXJwb3NlIHdpdGggb3Igd2l0aG91dCBmZWUgaXMgaGVyZWJ5IGdyYW50ZWQuXHJcblxyXG5USEUgU09GVFdBUkUgSVMgUFJPVklERUQgXCJBUyBJU1wiIEFORCBUSEUgQVVUSE9SIERJU0NMQUlNUyBBTEwgV0FSUkFOVElFUyBXSVRIXHJcblJFR0FSRCBUTyBUSElTIFNPRlRXQVJFIElOQ0xVRElORyBBTEwgSU1QTElFRCBXQVJSQU5USUVTIE9GIE1FUkNIQU5UQUJJTElUWVxyXG5BTkQgRklUTkVTUy4gSU4gTk8gRVZFTlQgU0hBTEwgVEhFIEFVVEhPUiBCRSBMSUFCTEUgRk9SIEFOWSBTUEVDSUFMLCBESVJFQ1QsXHJcbklORElSRUNULCBPUiBDT05TRVFVRU5USUFMIERBTUFHRVMgT1IgQU5ZIERBTUFHRVMgV0hBVFNPRVZFUiBSRVNVTFRJTkcgRlJPTVxyXG5MT1NTIE9GIFVTRSwgREFUQSBPUiBQUk9GSVRTLCBXSEVUSEVSIElOIEFOIEFDVElPTiBPRiBDT05UUkFDVCwgTkVHTElHRU5DRSBPUlxyXG5PVEhFUiBUT1JUSU9VUyBBQ1RJT04sIEFSSVNJTkcgT1VUIE9GIE9SIElOIENPTk5FQ1RJT04gV0lUSCBUSEUgVVNFIE9SXHJcblBFUkZPUk1BTkNFIE9GIFRISVMgU09GVFdBUkUuXHJcbioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqICovXG52YXIgX19hc3NpZ24gPSBmdW5jdGlvbiAoKSB7XG4gIF9fYXNzaWduID0gT2JqZWN0LmFzc2lnbiB8fCBmdW5jdGlvbiBfX2Fzc2lnbih0KSB7XG4gICAgZm9yICh2YXIgcywgaSA9IDEsIG4gPSBhcmd1bWVudHMubGVuZ3RoOyBpIDwgbjsgaSsrKSB7XG4gICAgICBzID0gYXJndW1lbnRzW2ldO1xuXG4gICAgICBmb3IgKHZhciBwIGluIHMpIGlmIChPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwocywgcCkpIHRbcF0gPSBzW3BdO1xuICAgIH1cblxuICAgIHJldHVybiB0O1xuICB9O1xuXG4gIHJldHVybiBfX2Fzc2lnbi5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xufTtcblxuZnVuY3Rpb24gX19yZXN0KHMsIGUpIHtcbiAgdmFyIHQgPSB7fTtcblxuICBmb3IgKHZhciBwIGluIHMpIGlmIChPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwocywgcCkgJiYgZS5pbmRleE9mKHApIDwgMCkgdFtwXSA9IHNbcF07XG5cbiAgaWYgKHMgIT0gbnVsbCAmJiB0eXBlb2YgT2JqZWN0LmdldE93blByb3BlcnR5U3ltYm9scyA9PT0gXCJmdW5jdGlvblwiKSBmb3IgKHZhciBpID0gMCwgcCA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eVN5bWJvbHMocyk7IGkgPCBwLmxlbmd0aDsgaSsrKSB7XG4gICAgaWYgKGUuaW5kZXhPZihwW2ldKSA8IDAgJiYgT2JqZWN0LnByb3RvdHlwZS5wcm9wZXJ0eUlzRW51bWVyYWJsZS5jYWxsKHMsIHBbaV0pKSB0W3BbaV1dID0gc1twW2ldXTtcbiAgfVxuICByZXR1cm4gdDtcbn1cblxuZnVuY3Rpb24gX192YWx1ZXMobykge1xuICB2YXIgcyA9IHR5cGVvZiBTeW1ib2wgPT09IFwiZnVuY3Rpb25cIiAmJiBTeW1ib2wuaXRlcmF0b3IsXG4gICAgICBtID0gcyAmJiBvW3NdLFxuICAgICAgaSA9IDA7XG4gIGlmIChtKSByZXR1cm4gbS5jYWxsKG8pO1xuICBpZiAobyAmJiB0eXBlb2Ygby5sZW5ndGggPT09IFwibnVtYmVyXCIpIHJldHVybiB7XG4gICAgbmV4dDogZnVuY3Rpb24gKCkge1xuICAgICAgaWYgKG8gJiYgaSA+PSBvLmxlbmd0aCkgbyA9IHZvaWQgMDtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIHZhbHVlOiBvICYmIG9baSsrXSxcbiAgICAgICAgZG9uZTogIW9cbiAgICAgIH07XG4gICAgfVxuICB9O1xuICB0aHJvdyBuZXcgVHlwZUVycm9yKHMgPyBcIk9iamVjdCBpcyBub3QgaXRlcmFibGUuXCIgOiBcIlN5bWJvbC5pdGVyYXRvciBpcyBub3QgZGVmaW5lZC5cIik7XG59XG5cbmZ1bmN0aW9uIF9fcmVhZChvLCBuKSB7XG4gIHZhciBtID0gdHlwZW9mIFN5bWJvbCA9PT0gXCJmdW5jdGlvblwiICYmIG9bU3ltYm9sLml0ZXJhdG9yXTtcbiAgaWYgKCFtKSByZXR1cm4gbztcbiAgdmFyIGkgPSBtLmNhbGwobyksXG4gICAgICByLFxuICAgICAgYXIgPSBbXSxcbiAgICAgIGU7XG5cbiAgdHJ5IHtcbiAgICB3aGlsZSAoKG4gPT09IHZvaWQgMCB8fCBuLS0gPiAwKSAmJiAhKHIgPSBpLm5leHQoKSkuZG9uZSkgYXIucHVzaChyLnZhbHVlKTtcbiAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICBlID0ge1xuICAgICAgZXJyb3I6IGVycm9yXG4gICAgfTtcbiAgfSBmaW5hbGx5IHtcbiAgICB0cnkge1xuICAgICAgaWYgKHIgJiYgIXIuZG9uZSAmJiAobSA9IGlbXCJyZXR1cm5cIl0pKSBtLmNhbGwoaSk7XG4gICAgfSBmaW5hbGx5IHtcbiAgICAgIGlmIChlKSB0aHJvdyBlLmVycm9yO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiBhcjtcbn1cblxuZnVuY3Rpb24gX19zcHJlYWQoKSB7XG4gIGZvciAodmFyIGFyID0gW10sIGkgPSAwOyBpIDwgYXJndW1lbnRzLmxlbmd0aDsgaSsrKSBhciA9IGFyLmNvbmNhdChfX3JlYWQoYXJndW1lbnRzW2ldKSk7XG5cbiAgcmV0dXJuIGFyO1xufVxuXG5leHBvcnQgeyBfX2Fzc2lnbiwgX19yZWFkLCBfX3Jlc3QsIF9fc3ByZWFkLCBfX3ZhbHVlcyB9OyIsInZhciBTVEFURV9ERUxJTUlURVIgPSAnLic7XG52YXIgRU1QVFlfQUNUSVZJVFlfTUFQID0ge307XG52YXIgREVGQVVMVF9HVUFSRF9UWVBFID0gJ3hzdGF0ZS5ndWFyZCc7XG52YXIgVEFSR0VUTEVTU19LRVkgPSAnJztcbmV4cG9ydCB7IERFRkFVTFRfR1VBUkRfVFlQRSwgRU1QVFlfQUNUSVZJVFlfTUFQLCBTVEFURV9ERUxJTUlURVIsIFRBUkdFVExFU1NfS0VZIH07IiwidmFyIElTX1BST0RVQ1RJT04gPSBwcm9jZXNzLmVudi5OT0RFX0VOViA9PT0gJ3Byb2R1Y3Rpb24nO1xuZXhwb3J0IHsgSVNfUFJPRFVDVElPTiB9OyIsImltcG9ydCB7IF9fc3ByZWFkLCBfX3ZhbHVlcywgX19yZWFkLCBfX2Fzc2lnbiB9IGZyb20gJy4vX3ZpcnR1YWwvX3RzbGliLmpzJztcbmltcG9ydCB7IERFRkFVTFRfR1VBUkRfVFlQRSwgVEFSR0VUTEVTU19LRVksIFNUQVRFX0RFTElNSVRFUiB9IGZyb20gJy4vY29uc3RhbnRzLmpzJztcbmltcG9ydCB7IElTX1BST0RVQ1RJT04gfSBmcm9tICcuL2Vudmlyb25tZW50LmpzJztcblxuZnVuY3Rpb24ga2V5cyh2YWx1ZSkge1xuICByZXR1cm4gT2JqZWN0LmtleXModmFsdWUpO1xufVxuXG5mdW5jdGlvbiBtYXRjaGVzU3RhdGUocGFyZW50U3RhdGVJZCwgY2hpbGRTdGF0ZUlkLCBkZWxpbWl0ZXIpIHtcbiAgaWYgKGRlbGltaXRlciA9PT0gdm9pZCAwKSB7XG4gICAgZGVsaW1pdGVyID0gU1RBVEVfREVMSU1JVEVSO1xuICB9XG5cbiAgdmFyIHBhcmVudFN0YXRlVmFsdWUgPSB0b1N0YXRlVmFsdWUocGFyZW50U3RhdGVJZCwgZGVsaW1pdGVyKTtcbiAgdmFyIGNoaWxkU3RhdGVWYWx1ZSA9IHRvU3RhdGVWYWx1ZShjaGlsZFN0YXRlSWQsIGRlbGltaXRlcik7XG5cbiAgaWYgKGlzU3RyaW5nKGNoaWxkU3RhdGVWYWx1ZSkpIHtcbiAgICBpZiAoaXNTdHJpbmcocGFyZW50U3RhdGVWYWx1ZSkpIHtcbiAgICAgIHJldHVybiBjaGlsZFN0YXRlVmFsdWUgPT09IHBhcmVudFN0YXRlVmFsdWU7XG4gICAgfSAvLyBQYXJlbnQgbW9yZSBzcGVjaWZpYyB0aGFuIGNoaWxkXG5cblxuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIGlmIChpc1N0cmluZyhwYXJlbnRTdGF0ZVZhbHVlKSkge1xuICAgIHJldHVybiBwYXJlbnRTdGF0ZVZhbHVlIGluIGNoaWxkU3RhdGVWYWx1ZTtcbiAgfVxuXG4gIHJldHVybiBrZXlzKHBhcmVudFN0YXRlVmFsdWUpLmV2ZXJ5KGZ1bmN0aW9uIChrZXkpIHtcbiAgICBpZiAoIShrZXkgaW4gY2hpbGRTdGF0ZVZhbHVlKSkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIHJldHVybiBtYXRjaGVzU3RhdGUocGFyZW50U3RhdGVWYWx1ZVtrZXldLCBjaGlsZFN0YXRlVmFsdWVba2V5XSk7XG4gIH0pO1xufVxuXG5mdW5jdGlvbiBnZXRFdmVudFR5cGUoZXZlbnQpIHtcbiAgdHJ5IHtcbiAgICByZXR1cm4gaXNTdHJpbmcoZXZlbnQpIHx8IHR5cGVvZiBldmVudCA9PT0gJ251bWJlcicgPyBcIlwiICsgZXZlbnQgOiBldmVudC50eXBlO1xuICB9IGNhdGNoIChlKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdFdmVudHMgbXVzdCBiZSBzdHJpbmdzIG9yIG9iamVjdHMgd2l0aCBhIHN0cmluZyBldmVudC50eXBlIHByb3BlcnR5LicpO1xuICB9XG59XG5cbmZ1bmN0aW9uIHRvU3RhdGVQYXRoKHN0YXRlSWQsIGRlbGltaXRlcikge1xuICB0cnkge1xuICAgIGlmIChpc0FycmF5KHN0YXRlSWQpKSB7XG4gICAgICByZXR1cm4gc3RhdGVJZDtcbiAgICB9XG5cbiAgICByZXR1cm4gc3RhdGVJZC50b1N0cmluZygpLnNwbGl0KGRlbGltaXRlcik7XG4gIH0gY2F0Y2ggKGUpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoXCInXCIgKyBzdGF0ZUlkICsgXCInIGlzIG5vdCBhIHZhbGlkIHN0YXRlIHBhdGguXCIpO1xuICB9XG59XG5cbmZ1bmN0aW9uIGlzU3RhdGVMaWtlKHN0YXRlKSB7XG4gIHJldHVybiB0eXBlb2Ygc3RhdGUgPT09ICdvYmplY3QnICYmICd2YWx1ZScgaW4gc3RhdGUgJiYgJ2NvbnRleHQnIGluIHN0YXRlICYmICdldmVudCcgaW4gc3RhdGUgJiYgJ19ldmVudCcgaW4gc3RhdGU7XG59XG5cbmZ1bmN0aW9uIHRvU3RhdGVWYWx1ZShzdGF0ZVZhbHVlLCBkZWxpbWl0ZXIpIHtcbiAgaWYgKGlzU3RhdGVMaWtlKHN0YXRlVmFsdWUpKSB7XG4gICAgcmV0dXJuIHN0YXRlVmFsdWUudmFsdWU7XG4gIH1cblxuICBpZiAoaXNBcnJheShzdGF0ZVZhbHVlKSkge1xuICAgIHJldHVybiBwYXRoVG9TdGF0ZVZhbHVlKHN0YXRlVmFsdWUpO1xuICB9XG5cbiAgaWYgKHR5cGVvZiBzdGF0ZVZhbHVlICE9PSAnc3RyaW5nJykge1xuICAgIHJldHVybiBzdGF0ZVZhbHVlO1xuICB9XG5cbiAgdmFyIHN0YXRlUGF0aCA9IHRvU3RhdGVQYXRoKHN0YXRlVmFsdWUsIGRlbGltaXRlcik7XG4gIHJldHVybiBwYXRoVG9TdGF0ZVZhbHVlKHN0YXRlUGF0aCk7XG59XG5cbmZ1bmN0aW9uIHBhdGhUb1N0YXRlVmFsdWUoc3RhdGVQYXRoKSB7XG4gIGlmIChzdGF0ZVBhdGgubGVuZ3RoID09PSAxKSB7XG4gICAgcmV0dXJuIHN0YXRlUGF0aFswXTtcbiAgfVxuXG4gIHZhciB2YWx1ZSA9IHt9O1xuICB2YXIgbWFya2VyID0gdmFsdWU7XG5cbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBzdGF0ZVBhdGgubGVuZ3RoIC0gMTsgaSsrKSB7XG4gICAgaWYgKGkgPT09IHN0YXRlUGF0aC5sZW5ndGggLSAyKSB7XG4gICAgICBtYXJrZXJbc3RhdGVQYXRoW2ldXSA9IHN0YXRlUGF0aFtpICsgMV07XG4gICAgfSBlbHNlIHtcbiAgICAgIG1hcmtlcltzdGF0ZVBhdGhbaV1dID0ge307XG4gICAgICBtYXJrZXIgPSBtYXJrZXJbc3RhdGVQYXRoW2ldXTtcbiAgICB9XG4gIH1cblxuICByZXR1cm4gdmFsdWU7XG59XG5cbmZ1bmN0aW9uIG1hcFZhbHVlcyhjb2xsZWN0aW9uLCBpdGVyYXRlZSkge1xuICB2YXIgcmVzdWx0ID0ge307XG4gIHZhciBjb2xsZWN0aW9uS2V5cyA9IGtleXMoY29sbGVjdGlvbik7XG5cbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBjb2xsZWN0aW9uS2V5cy5sZW5ndGg7IGkrKykge1xuICAgIHZhciBrZXkgPSBjb2xsZWN0aW9uS2V5c1tpXTtcbiAgICByZXN1bHRba2V5XSA9IGl0ZXJhdGVlKGNvbGxlY3Rpb25ba2V5XSwga2V5LCBjb2xsZWN0aW9uLCBpKTtcbiAgfVxuXG4gIHJldHVybiByZXN1bHQ7XG59XG5cbmZ1bmN0aW9uIG1hcEZpbHRlclZhbHVlcyhjb2xsZWN0aW9uLCBpdGVyYXRlZSwgcHJlZGljYXRlKSB7XG4gIHZhciBlXzEsIF9hO1xuXG4gIHZhciByZXN1bHQgPSB7fTtcblxuICB0cnkge1xuICAgIGZvciAodmFyIF9iID0gX192YWx1ZXMoa2V5cyhjb2xsZWN0aW9uKSksIF9jID0gX2IubmV4dCgpOyAhX2MuZG9uZTsgX2MgPSBfYi5uZXh0KCkpIHtcbiAgICAgIHZhciBrZXkgPSBfYy52YWx1ZTtcbiAgICAgIHZhciBpdGVtID0gY29sbGVjdGlvbltrZXldO1xuXG4gICAgICBpZiAoIXByZWRpY2F0ZShpdGVtKSkge1xuICAgICAgICBjb250aW51ZTtcbiAgICAgIH1cblxuICAgICAgcmVzdWx0W2tleV0gPSBpdGVyYXRlZShpdGVtLCBrZXksIGNvbGxlY3Rpb24pO1xuICAgIH1cbiAgfSBjYXRjaCAoZV8xXzEpIHtcbiAgICBlXzEgPSB7XG4gICAgICBlcnJvcjogZV8xXzFcbiAgICB9O1xuICB9IGZpbmFsbHkge1xuICAgIHRyeSB7XG4gICAgICBpZiAoX2MgJiYgIV9jLmRvbmUgJiYgKF9hID0gX2IucmV0dXJuKSkgX2EuY2FsbChfYik7XG4gICAgfSBmaW5hbGx5IHtcbiAgICAgIGlmIChlXzEpIHRocm93IGVfMS5lcnJvcjtcbiAgICB9XG4gIH1cblxuICByZXR1cm4gcmVzdWx0O1xufVxuLyoqXHJcbiAqIFJldHJpZXZlcyBhIHZhbHVlIGF0IHRoZSBnaXZlbiBwYXRoLlxyXG4gKiBAcGFyYW0gcHJvcHMgVGhlIGRlZXAgcGF0aCB0byB0aGUgcHJvcCBvZiB0aGUgZGVzaXJlZCB2YWx1ZVxyXG4gKi9cblxuXG52YXIgcGF0aCA9IGZ1bmN0aW9uIChwcm9wcykge1xuICByZXR1cm4gZnVuY3Rpb24gKG9iamVjdCkge1xuICAgIHZhciBlXzIsIF9hO1xuXG4gICAgdmFyIHJlc3VsdCA9IG9iamVjdDtcblxuICAgIHRyeSB7XG4gICAgICBmb3IgKHZhciBwcm9wc18xID0gX192YWx1ZXMocHJvcHMpLCBwcm9wc18xXzEgPSBwcm9wc18xLm5leHQoKTsgIXByb3BzXzFfMS5kb25lOyBwcm9wc18xXzEgPSBwcm9wc18xLm5leHQoKSkge1xuICAgICAgICB2YXIgcHJvcCA9IHByb3BzXzFfMS52YWx1ZTtcbiAgICAgICAgcmVzdWx0ID0gcmVzdWx0W3Byb3BdO1xuICAgICAgfVxuICAgIH0gY2F0Y2ggKGVfMl8xKSB7XG4gICAgICBlXzIgPSB7XG4gICAgICAgIGVycm9yOiBlXzJfMVxuICAgICAgfTtcbiAgICB9IGZpbmFsbHkge1xuICAgICAgdHJ5IHtcbiAgICAgICAgaWYgKHByb3BzXzFfMSAmJiAhcHJvcHNfMV8xLmRvbmUgJiYgKF9hID0gcHJvcHNfMS5yZXR1cm4pKSBfYS5jYWxsKHByb3BzXzEpO1xuICAgICAgfSBmaW5hbGx5IHtcbiAgICAgICAgaWYgKGVfMikgdGhyb3cgZV8yLmVycm9yO1xuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiByZXN1bHQ7XG4gIH07XG59O1xuLyoqXHJcbiAqIFJldHJpZXZlcyBhIHZhbHVlIGF0IHRoZSBnaXZlbiBwYXRoIHZpYSB0aGUgbmVzdGVkIGFjY2Vzc29yIHByb3AuXHJcbiAqIEBwYXJhbSBwcm9wcyBUaGUgZGVlcCBwYXRoIHRvIHRoZSBwcm9wIG9mIHRoZSBkZXNpcmVkIHZhbHVlXHJcbiAqL1xuXG5cbmZ1bmN0aW9uIG5lc3RlZFBhdGgocHJvcHMsIGFjY2Vzc29yUHJvcCkge1xuICByZXR1cm4gZnVuY3Rpb24gKG9iamVjdCkge1xuICAgIHZhciBlXzMsIF9hO1xuXG4gICAgdmFyIHJlc3VsdCA9IG9iamVjdDtcblxuICAgIHRyeSB7XG4gICAgICBmb3IgKHZhciBwcm9wc18yID0gX192YWx1ZXMocHJvcHMpLCBwcm9wc18yXzEgPSBwcm9wc18yLm5leHQoKTsgIXByb3BzXzJfMS5kb25lOyBwcm9wc18yXzEgPSBwcm9wc18yLm5leHQoKSkge1xuICAgICAgICB2YXIgcHJvcCA9IHByb3BzXzJfMS52YWx1ZTtcbiAgICAgICAgcmVzdWx0ID0gcmVzdWx0W2FjY2Vzc29yUHJvcF1bcHJvcF07XG4gICAgICB9XG4gICAgfSBjYXRjaCAoZV8zXzEpIHtcbiAgICAgIGVfMyA9IHtcbiAgICAgICAgZXJyb3I6IGVfM18xXG4gICAgICB9O1xuICAgIH0gZmluYWxseSB7XG4gICAgICB0cnkge1xuICAgICAgICBpZiAocHJvcHNfMl8xICYmICFwcm9wc18yXzEuZG9uZSAmJiAoX2EgPSBwcm9wc18yLnJldHVybikpIF9hLmNhbGwocHJvcHNfMik7XG4gICAgICB9IGZpbmFsbHkge1xuICAgICAgICBpZiAoZV8zKSB0aHJvdyBlXzMuZXJyb3I7XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIHJlc3VsdDtcbiAgfTtcbn1cblxuZnVuY3Rpb24gdG9TdGF0ZVBhdGhzKHN0YXRlVmFsdWUpIHtcbiAgaWYgKCFzdGF0ZVZhbHVlKSB7XG4gICAgcmV0dXJuIFtbXV07XG4gIH1cblxuICBpZiAoaXNTdHJpbmcoc3RhdGVWYWx1ZSkpIHtcbiAgICByZXR1cm4gW1tzdGF0ZVZhbHVlXV07XG4gIH1cblxuICB2YXIgcmVzdWx0ID0gZmxhdHRlbihrZXlzKHN0YXRlVmFsdWUpLm1hcChmdW5jdGlvbiAoa2V5KSB7XG4gICAgdmFyIHN1YlN0YXRlVmFsdWUgPSBzdGF0ZVZhbHVlW2tleV07XG5cbiAgICBpZiAodHlwZW9mIHN1YlN0YXRlVmFsdWUgIT09ICdzdHJpbmcnICYmICghc3ViU3RhdGVWYWx1ZSB8fCAhT2JqZWN0LmtleXMoc3ViU3RhdGVWYWx1ZSkubGVuZ3RoKSkge1xuICAgICAgcmV0dXJuIFtba2V5XV07XG4gICAgfVxuXG4gICAgcmV0dXJuIHRvU3RhdGVQYXRocyhzdGF0ZVZhbHVlW2tleV0pLm1hcChmdW5jdGlvbiAoc3ViUGF0aCkge1xuICAgICAgcmV0dXJuIFtrZXldLmNvbmNhdChzdWJQYXRoKTtcbiAgICB9KTtcbiAgfSkpO1xuICByZXR1cm4gcmVzdWx0O1xufVxuXG5mdW5jdGlvbiBmbGF0dGVuKGFycmF5KSB7XG4gIHZhciBfYTtcblxuICByZXR1cm4gKF9hID0gW10pLmNvbmNhdC5hcHBseShfYSwgX19zcHJlYWQoYXJyYXkpKTtcbn1cblxuZnVuY3Rpb24gdG9BcnJheVN0cmljdCh2YWx1ZSkge1xuICBpZiAoaXNBcnJheSh2YWx1ZSkpIHtcbiAgICByZXR1cm4gdmFsdWU7XG4gIH1cblxuICByZXR1cm4gW3ZhbHVlXTtcbn1cblxuZnVuY3Rpb24gdG9BcnJheSh2YWx1ZSkge1xuICBpZiAodmFsdWUgPT09IHVuZGVmaW5lZCkge1xuICAgIHJldHVybiBbXTtcbiAgfVxuXG4gIHJldHVybiB0b0FycmF5U3RyaWN0KHZhbHVlKTtcbn1cblxuZnVuY3Rpb24gbWFwQ29udGV4dChtYXBwZXIsIGNvbnRleHQsIF9ldmVudCkge1xuICB2YXIgZV81LCBfYTtcblxuICBpZiAoaXNGdW5jdGlvbihtYXBwZXIpKSB7XG4gICAgcmV0dXJuIG1hcHBlcihjb250ZXh0LCBfZXZlbnQuZGF0YSk7XG4gIH1cblxuICB2YXIgcmVzdWx0ID0ge307XG5cbiAgdHJ5IHtcbiAgICBmb3IgKHZhciBfYiA9IF9fdmFsdWVzKE9iamVjdC5rZXlzKG1hcHBlcikpLCBfYyA9IF9iLm5leHQoKTsgIV9jLmRvbmU7IF9jID0gX2IubmV4dCgpKSB7XG4gICAgICB2YXIga2V5ID0gX2MudmFsdWU7XG4gICAgICB2YXIgc3ViTWFwcGVyID0gbWFwcGVyW2tleV07XG5cbiAgICAgIGlmIChpc0Z1bmN0aW9uKHN1Yk1hcHBlcikpIHtcbiAgICAgICAgcmVzdWx0W2tleV0gPSBzdWJNYXBwZXIoY29udGV4dCwgX2V2ZW50LmRhdGEpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmVzdWx0W2tleV0gPSBzdWJNYXBwZXI7XG4gICAgICB9XG4gICAgfVxuICB9IGNhdGNoIChlXzVfMSkge1xuICAgIGVfNSA9IHtcbiAgICAgIGVycm9yOiBlXzVfMVxuICAgIH07XG4gIH0gZmluYWxseSB7XG4gICAgdHJ5IHtcbiAgICAgIGlmIChfYyAmJiAhX2MuZG9uZSAmJiAoX2EgPSBfYi5yZXR1cm4pKSBfYS5jYWxsKF9iKTtcbiAgICB9IGZpbmFsbHkge1xuICAgICAgaWYgKGVfNSkgdGhyb3cgZV81LmVycm9yO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiByZXN1bHQ7XG59XG5cbmZ1bmN0aW9uIGlzQnVpbHRJbkV2ZW50KGV2ZW50VHlwZSkge1xuICByZXR1cm4gL14oZG9uZXxlcnJvcilcXC4vLnRlc3QoZXZlbnRUeXBlKTtcbn1cblxuZnVuY3Rpb24gaXNQcm9taXNlTGlrZSh2YWx1ZSkge1xuICBpZiAodmFsdWUgaW5zdGFuY2VvZiBQcm9taXNlKSB7XG4gICAgcmV0dXJuIHRydWU7XG4gIH0gLy8gQ2hlY2sgaWYgc2hhcGUgbWF0Y2hlcyB0aGUgUHJvbWlzZS9BKyBzcGVjaWZpY2F0aW9uIGZvciBhIFwidGhlbmFibGVcIi5cblxuXG4gIGlmICh2YWx1ZSAhPT0gbnVsbCAmJiAoaXNGdW5jdGlvbih2YWx1ZSkgfHwgdHlwZW9mIHZhbHVlID09PSAnb2JqZWN0JykgJiYgaXNGdW5jdGlvbih2YWx1ZS50aGVuKSkge1xuICAgIHJldHVybiB0cnVlO1xuICB9XG5cbiAgcmV0dXJuIGZhbHNlO1xufVxuXG5mdW5jdGlvbiBwYXJ0aXRpb24oaXRlbXMsIHByZWRpY2F0ZSkge1xuICB2YXIgZV82LCBfYTtcblxuICB2YXIgX2IgPSBfX3JlYWQoW1tdLCBbXV0sIDIpLFxuICAgICAgdHJ1dGh5ID0gX2JbMF0sXG4gICAgICBmYWxzeSA9IF9iWzFdO1xuXG4gIHRyeSB7XG4gICAgZm9yICh2YXIgaXRlbXNfMSA9IF9fdmFsdWVzKGl0ZW1zKSwgaXRlbXNfMV8xID0gaXRlbXNfMS5uZXh0KCk7ICFpdGVtc18xXzEuZG9uZTsgaXRlbXNfMV8xID0gaXRlbXNfMS5uZXh0KCkpIHtcbiAgICAgIHZhciBpdGVtID0gaXRlbXNfMV8xLnZhbHVlO1xuXG4gICAgICBpZiAocHJlZGljYXRlKGl0ZW0pKSB7XG4gICAgICAgIHRydXRoeS5wdXNoKGl0ZW0pO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgZmFsc3kucHVzaChpdGVtKTtcbiAgICAgIH1cbiAgICB9XG4gIH0gY2F0Y2ggKGVfNl8xKSB7XG4gICAgZV82ID0ge1xuICAgICAgZXJyb3I6IGVfNl8xXG4gICAgfTtcbiAgfSBmaW5hbGx5IHtcbiAgICB0cnkge1xuICAgICAgaWYgKGl0ZW1zXzFfMSAmJiAhaXRlbXNfMV8xLmRvbmUgJiYgKF9hID0gaXRlbXNfMS5yZXR1cm4pKSBfYS5jYWxsKGl0ZW1zXzEpO1xuICAgIH0gZmluYWxseSB7XG4gICAgICBpZiAoZV82KSB0aHJvdyBlXzYuZXJyb3I7XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIFt0cnV0aHksIGZhbHN5XTtcbn1cblxuZnVuY3Rpb24gdXBkYXRlSGlzdG9yeVN0YXRlcyhoaXN0LCBzdGF0ZVZhbHVlKSB7XG4gIHJldHVybiBtYXBWYWx1ZXMoaGlzdC5zdGF0ZXMsIGZ1bmN0aW9uIChzdWJIaXN0LCBrZXkpIHtcbiAgICBpZiAoIXN1Ykhpc3QpIHtcbiAgICAgIHJldHVybiB1bmRlZmluZWQ7XG4gICAgfVxuXG4gICAgdmFyIHN1YlN0YXRlVmFsdWUgPSAoaXNTdHJpbmcoc3RhdGVWYWx1ZSkgPyB1bmRlZmluZWQgOiBzdGF0ZVZhbHVlW2tleV0pIHx8IChzdWJIaXN0ID8gc3ViSGlzdC5jdXJyZW50IDogdW5kZWZpbmVkKTtcblxuICAgIGlmICghc3ViU3RhdGVWYWx1ZSkge1xuICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgICB9XG5cbiAgICByZXR1cm4ge1xuICAgICAgY3VycmVudDogc3ViU3RhdGVWYWx1ZSxcbiAgICAgIHN0YXRlczogdXBkYXRlSGlzdG9yeVN0YXRlcyhzdWJIaXN0LCBzdWJTdGF0ZVZhbHVlKVxuICAgIH07XG4gIH0pO1xufVxuXG5mdW5jdGlvbiB1cGRhdGVIaXN0b3J5VmFsdWUoaGlzdCwgc3RhdGVWYWx1ZSkge1xuICByZXR1cm4ge1xuICAgIGN1cnJlbnQ6IHN0YXRlVmFsdWUsXG4gICAgc3RhdGVzOiB1cGRhdGVIaXN0b3J5U3RhdGVzKGhpc3QsIHN0YXRlVmFsdWUpXG4gIH07XG59XG5cbmZ1bmN0aW9uIHVwZGF0ZUNvbnRleHQoY29udGV4dCwgX2V2ZW50LCBhc3NpZ25BY3Rpb25zLCBzdGF0ZSkge1xuICBpZiAoIUlTX1BST0RVQ1RJT04pIHtcbiAgICB3YXJuKCEhY29udGV4dCwgJ0F0dGVtcHRpbmcgdG8gdXBkYXRlIHVuZGVmaW5lZCBjb250ZXh0Jyk7XG4gIH1cblxuICB2YXIgdXBkYXRlZENvbnRleHQgPSBjb250ZXh0ID8gYXNzaWduQWN0aW9ucy5yZWR1Y2UoZnVuY3Rpb24gKGFjYywgYXNzaWduQWN0aW9uKSB7XG4gICAgdmFyIGVfNywgX2E7XG5cbiAgICB2YXIgYXNzaWdubWVudCA9IGFzc2lnbkFjdGlvbi5hc3NpZ25tZW50O1xuICAgIHZhciBtZXRhID0ge1xuICAgICAgc3RhdGU6IHN0YXRlLFxuICAgICAgYWN0aW9uOiBhc3NpZ25BY3Rpb24sXG4gICAgICBfZXZlbnQ6IF9ldmVudFxuICAgIH07XG4gICAgdmFyIHBhcnRpYWxVcGRhdGUgPSB7fTtcblxuICAgIGlmIChpc0Z1bmN0aW9uKGFzc2lnbm1lbnQpKSB7XG4gICAgICBwYXJ0aWFsVXBkYXRlID0gYXNzaWdubWVudChhY2MsIF9ldmVudC5kYXRhLCBtZXRhKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdHJ5IHtcbiAgICAgICAgZm9yICh2YXIgX2IgPSBfX3ZhbHVlcyhrZXlzKGFzc2lnbm1lbnQpKSwgX2MgPSBfYi5uZXh0KCk7ICFfYy5kb25lOyBfYyA9IF9iLm5leHQoKSkge1xuICAgICAgICAgIHZhciBrZXkgPSBfYy52YWx1ZTtcbiAgICAgICAgICB2YXIgcHJvcEFzc2lnbm1lbnQgPSBhc3NpZ25tZW50W2tleV07XG4gICAgICAgICAgcGFydGlhbFVwZGF0ZVtrZXldID0gaXNGdW5jdGlvbihwcm9wQXNzaWdubWVudCkgPyBwcm9wQXNzaWdubWVudChhY2MsIF9ldmVudC5kYXRhLCBtZXRhKSA6IHByb3BBc3NpZ25tZW50O1xuICAgICAgICB9XG4gICAgICB9IGNhdGNoIChlXzdfMSkge1xuICAgICAgICBlXzcgPSB7XG4gICAgICAgICAgZXJyb3I6IGVfN18xXG4gICAgICAgIH07XG4gICAgICB9IGZpbmFsbHkge1xuICAgICAgICB0cnkge1xuICAgICAgICAgIGlmIChfYyAmJiAhX2MuZG9uZSAmJiAoX2EgPSBfYi5yZXR1cm4pKSBfYS5jYWxsKF9iKTtcbiAgICAgICAgfSBmaW5hbGx5IHtcbiAgICAgICAgICBpZiAoZV83KSB0aHJvdyBlXzcuZXJyb3I7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gT2JqZWN0LmFzc2lnbih7fSwgYWNjLCBwYXJ0aWFsVXBkYXRlKTtcbiAgfSwgY29udGV4dCkgOiBjb250ZXh0O1xuICByZXR1cm4gdXBkYXRlZENvbnRleHQ7XG59IC8vIHRzbGludDpkaXNhYmxlLW5leHQtbGluZTpuby1lbXB0eVxuXG5cbnZhciB3YXJuID0gZnVuY3Rpb24gKCkge307XG5cbmlmICghSVNfUFJPRFVDVElPTikge1xuICB3YXJuID0gZnVuY3Rpb24gKGNvbmRpdGlvbiwgbWVzc2FnZSkge1xuICAgIHZhciBlcnJvciA9IGNvbmRpdGlvbiBpbnN0YW5jZW9mIEVycm9yID8gY29uZGl0aW9uIDogdW5kZWZpbmVkO1xuXG4gICAgaWYgKCFlcnJvciAmJiBjb25kaXRpb24pIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBpZiAoY29uc29sZSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICB2YXIgYXJncyA9IFtcIldhcm5pbmc6IFwiICsgbWVzc2FnZV07XG5cbiAgICAgIGlmIChlcnJvcikge1xuICAgICAgICBhcmdzLnB1c2goZXJyb3IpO1xuICAgICAgfSAvLyB0c2xpbnQ6ZGlzYWJsZS1uZXh0LWxpbmU6bm8tY29uc29sZVxuXG5cbiAgICAgIGNvbnNvbGUud2Fybi5hcHBseShjb25zb2xlLCBhcmdzKTtcbiAgICB9XG4gIH07XG59XG5cbmZ1bmN0aW9uIGlzQXJyYXkodmFsdWUpIHtcbiAgcmV0dXJuIEFycmF5LmlzQXJyYXkodmFsdWUpO1xufSAvLyB0c2xpbnQ6ZGlzYWJsZS1uZXh0LWxpbmU6YmFuLXR5cGVzXG5cblxuZnVuY3Rpb24gaXNGdW5jdGlvbih2YWx1ZSkge1xuICByZXR1cm4gdHlwZW9mIHZhbHVlID09PSAnZnVuY3Rpb24nO1xufVxuXG5mdW5jdGlvbiBpc1N0cmluZyh2YWx1ZSkge1xuICByZXR1cm4gdHlwZW9mIHZhbHVlID09PSAnc3RyaW5nJztcbn0gLy8gZXhwb3J0IGZ1bmN0aW9uIG1lbW9pemVkR2V0dGVyPFQsIFRQIGV4dGVuZHMgeyBwcm90b3R5cGU6IG9iamVjdCB9Pihcbi8vICAgbzogVFAsXG4vLyAgIHByb3BlcnR5OiBzdHJpbmcsXG4vLyAgIGdldHRlcjogKCkgPT4gVFxuLy8gKTogdm9pZCB7XG4vLyAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShvLnByb3RvdHlwZSwgcHJvcGVydHksIHtcbi8vICAgICBnZXQ6IGdldHRlcixcbi8vICAgICBlbnVtZXJhYmxlOiBmYWxzZSxcbi8vICAgICBjb25maWd1cmFibGU6IGZhbHNlXG4vLyAgIH0pO1xuLy8gfVxuXG5cbmZ1bmN0aW9uIHRvR3VhcmQoY29uZGl0aW9uLCBndWFyZE1hcCkge1xuICBpZiAoIWNvbmRpdGlvbikge1xuICAgIHJldHVybiB1bmRlZmluZWQ7XG4gIH1cblxuICBpZiAoaXNTdHJpbmcoY29uZGl0aW9uKSkge1xuICAgIHJldHVybiB7XG4gICAgICB0eXBlOiBERUZBVUxUX0dVQVJEX1RZUEUsXG4gICAgICBuYW1lOiBjb25kaXRpb24sXG4gICAgICBwcmVkaWNhdGU6IGd1YXJkTWFwID8gZ3VhcmRNYXBbY29uZGl0aW9uXSA6IHVuZGVmaW5lZFxuICAgIH07XG4gIH1cblxuICBpZiAoaXNGdW5jdGlvbihjb25kaXRpb24pKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIHR5cGU6IERFRkFVTFRfR1VBUkRfVFlQRSxcbiAgICAgIG5hbWU6IGNvbmRpdGlvbi5uYW1lLFxuICAgICAgcHJlZGljYXRlOiBjb25kaXRpb25cbiAgICB9O1xuICB9XG5cbiAgcmV0dXJuIGNvbmRpdGlvbjtcbn1cblxuZnVuY3Rpb24gaXNPYnNlcnZhYmxlKHZhbHVlKSB7XG4gIHRyeSB7XG4gICAgcmV0dXJuICdzdWJzY3JpYmUnIGluIHZhbHVlICYmIGlzRnVuY3Rpb24odmFsdWUuc3Vic2NyaWJlKTtcbiAgfSBjYXRjaCAoZSkge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxufVxuXG52YXIgc3ltYm9sT2JzZXJ2YWJsZSA9IC8qI19fUFVSRV9fKi9mdW5jdGlvbiAoKSB7XG4gIHJldHVybiB0eXBlb2YgU3ltYm9sID09PSAnZnVuY3Rpb24nICYmIFN5bWJvbC5vYnNlcnZhYmxlIHx8ICdAQG9ic2VydmFibGUnO1xufSgpO1xuXG5mdW5jdGlvbiBpc01hY2hpbmUodmFsdWUpIHtcbiAgdHJ5IHtcbiAgICByZXR1cm4gJ19feHN0YXRlbm9kZScgaW4gdmFsdWU7XG4gIH0gY2F0Y2ggKGUpIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cbn1cblxuZnVuY3Rpb24gaXNBY3Rvcih2YWx1ZSkge1xuICByZXR1cm4gISF2YWx1ZSAmJiB0eXBlb2YgdmFsdWUuc2VuZCA9PT0gJ2Z1bmN0aW9uJztcbn1cblxudmFyIHVuaXF1ZUlkID0gLyojX19QVVJFX18qL2Z1bmN0aW9uICgpIHtcbiAgdmFyIGN1cnJlbnRJZCA9IDA7XG4gIHJldHVybiBmdW5jdGlvbiAoKSB7XG4gICAgY3VycmVudElkKys7XG4gICAgcmV0dXJuIGN1cnJlbnRJZC50b1N0cmluZygxNik7XG4gIH07XG59KCk7XG5cbmZ1bmN0aW9uIHRvRXZlbnRPYmplY3QoZXZlbnQsIHBheWxvYWQgLy8gaWQ/OiBURXZlbnRbJ3R5cGUnXVxuKSB7XG4gIGlmIChpc1N0cmluZyhldmVudCkgfHwgdHlwZW9mIGV2ZW50ID09PSAnbnVtYmVyJykge1xuICAgIHJldHVybiBfX2Fzc2lnbih7XG4gICAgICB0eXBlOiBldmVudFxuICAgIH0sIHBheWxvYWQpO1xuICB9XG5cbiAgcmV0dXJuIGV2ZW50O1xufVxuXG5mdW5jdGlvbiB0b1NDWE1MRXZlbnQoZXZlbnQsIHNjeG1sRXZlbnQpIHtcbiAgaWYgKCFpc1N0cmluZyhldmVudCkgJiYgJyQkdHlwZScgaW4gZXZlbnQgJiYgZXZlbnQuJCR0eXBlID09PSAnc2N4bWwnKSB7XG4gICAgcmV0dXJuIGV2ZW50O1xuICB9XG5cbiAgdmFyIGV2ZW50T2JqZWN0ID0gdG9FdmVudE9iamVjdChldmVudCk7XG4gIHJldHVybiBfX2Fzc2lnbih7XG4gICAgbmFtZTogZXZlbnRPYmplY3QudHlwZSxcbiAgICBkYXRhOiBldmVudE9iamVjdCxcbiAgICAkJHR5cGU6ICdzY3htbCcsXG4gICAgdHlwZTogJ2V4dGVybmFsJ1xuICB9LCBzY3htbEV2ZW50KTtcbn1cblxuZnVuY3Rpb24gdG9UcmFuc2l0aW9uQ29uZmlnQXJyYXkoZXZlbnQsIGNvbmZpZ0xpa2UpIHtcbiAgdmFyIHRyYW5zaXRpb25zID0gdG9BcnJheVN0cmljdChjb25maWdMaWtlKS5tYXAoZnVuY3Rpb24gKHRyYW5zaXRpb25MaWtlKSB7XG4gICAgaWYgKHR5cGVvZiB0cmFuc2l0aW9uTGlrZSA9PT0gJ3VuZGVmaW5lZCcgfHwgdHlwZW9mIHRyYW5zaXRpb25MaWtlID09PSAnc3RyaW5nJyB8fCBpc01hY2hpbmUodHJhbnNpdGlvbkxpa2UpKSB7XG4gICAgICByZXR1cm4ge1xuICAgICAgICB0YXJnZXQ6IHRyYW5zaXRpb25MaWtlLFxuICAgICAgICBldmVudDogZXZlbnRcbiAgICAgIH07XG4gICAgfVxuXG4gICAgcmV0dXJuIF9fYXNzaWduKF9fYXNzaWduKHt9LCB0cmFuc2l0aW9uTGlrZSksIHtcbiAgICAgIGV2ZW50OiBldmVudFxuICAgIH0pO1xuICB9KTtcbiAgcmV0dXJuIHRyYW5zaXRpb25zO1xufVxuXG5mdW5jdGlvbiBub3JtYWxpemVUYXJnZXQodGFyZ2V0KSB7XG4gIGlmICh0YXJnZXQgPT09IHVuZGVmaW5lZCB8fCB0YXJnZXQgPT09IFRBUkdFVExFU1NfS0VZKSB7XG4gICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgfVxuXG4gIHJldHVybiB0b0FycmF5KHRhcmdldCk7XG59XG5cbmZ1bmN0aW9uIHJlcG9ydFVuaGFuZGxlZEV4Y2VwdGlvbk9uSW52b2NhdGlvbihvcmlnaW5hbEVycm9yLCBjdXJyZW50RXJyb3IsIGlkKSB7XG4gIGlmICghSVNfUFJPRFVDVElPTikge1xuICAgIHZhciBvcmlnaW5hbFN0YWNrVHJhY2UgPSBvcmlnaW5hbEVycm9yLnN0YWNrID8gXCIgU3RhY2t0cmFjZSB3YXMgJ1wiICsgb3JpZ2luYWxFcnJvci5zdGFjayArIFwiJ1wiIDogJyc7XG5cbiAgICBpZiAob3JpZ2luYWxFcnJvciA9PT0gY3VycmVudEVycm9yKSB7XG4gICAgICAvLyB0c2xpbnQ6ZGlzYWJsZS1uZXh0LWxpbmU6bm8tY29uc29sZVxuICAgICAgY29uc29sZS5lcnJvcihcIk1pc3Npbmcgb25FcnJvciBoYW5kbGVyIGZvciBpbnZvY2F0aW9uICdcIiArIGlkICsgXCInLCBlcnJvciB3YXMgJ1wiICsgb3JpZ2luYWxFcnJvciArIFwiJy5cIiArIG9yaWdpbmFsU3RhY2tUcmFjZSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHZhciBzdGFja1RyYWNlID0gY3VycmVudEVycm9yLnN0YWNrID8gXCIgU3RhY2t0cmFjZSB3YXMgJ1wiICsgY3VycmVudEVycm9yLnN0YWNrICsgXCInXCIgOiAnJzsgLy8gdHNsaW50OmRpc2FibGUtbmV4dC1saW5lOm5vLWNvbnNvbGVcblxuICAgICAgY29uc29sZS5lcnJvcihcIk1pc3Npbmcgb25FcnJvciBoYW5kbGVyIGFuZC9vciB1bmhhbmRsZWQgZXhjZXB0aW9uL3Byb21pc2UgcmVqZWN0aW9uIGZvciBpbnZvY2F0aW9uICdcIiArIGlkICsgXCInLiBcIiArIChcIk9yaWdpbmFsIGVycm9yOiAnXCIgKyBvcmlnaW5hbEVycm9yICsgXCInLiBcIiArIG9yaWdpbmFsU3RhY2tUcmFjZSArIFwiIEN1cnJlbnQgZXJyb3IgaXMgJ1wiICsgY3VycmVudEVycm9yICsgXCInLlwiICsgc3RhY2tUcmFjZSkpO1xuICAgIH1cbiAgfVxufVxuXG5mdW5jdGlvbiBldmFsdWF0ZUd1YXJkKG1hY2hpbmUsIGd1YXJkLCBjb250ZXh0LCBfZXZlbnQsIHN0YXRlKSB7XG4gIHZhciBndWFyZHMgPSBtYWNoaW5lLm9wdGlvbnMuZ3VhcmRzO1xuICB2YXIgZ3VhcmRNZXRhID0ge1xuICAgIHN0YXRlOiBzdGF0ZSxcbiAgICBjb25kOiBndWFyZCxcbiAgICBfZXZlbnQ6IF9ldmVudFxuICB9OyAvLyBUT0RPOiBkbyBub3QgaGFyZGNvZGUhXG5cbiAgaWYgKGd1YXJkLnR5cGUgPT09IERFRkFVTFRfR1VBUkRfVFlQRSkge1xuICAgIHJldHVybiBndWFyZC5wcmVkaWNhdGUoY29udGV4dCwgX2V2ZW50LmRhdGEsIGd1YXJkTWV0YSk7XG4gIH1cblxuICB2YXIgY29uZEZuID0gZ3VhcmRzW2d1YXJkLnR5cGVdO1xuXG4gIGlmICghY29uZEZuKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKFwiR3VhcmQgJ1wiICsgZ3VhcmQudHlwZSArIFwiJyBpcyBub3QgaW1wbGVtZW50ZWQgb24gbWFjaGluZSAnXCIgKyBtYWNoaW5lLmlkICsgXCInLlwiKTtcbiAgfVxuXG4gIHJldHVybiBjb25kRm4oY29udGV4dCwgX2V2ZW50LmRhdGEsIGd1YXJkTWV0YSk7XG59XG5cbmZ1bmN0aW9uIHRvSW52b2tlU291cmNlKHNyYykge1xuICBpZiAodHlwZW9mIHNyYyA9PT0gJ3N0cmluZycpIHtcbiAgICByZXR1cm4ge1xuICAgICAgdHlwZTogc3JjXG4gICAgfTtcbiAgfVxuXG4gIHJldHVybiBzcmM7XG59XG5cbmZ1bmN0aW9uIHRvT2JzZXJ2ZXIobmV4dEhhbmRsZXIsIGVycm9ySGFuZGxlciwgY29tcGxldGlvbkhhbmRsZXIpIHtcbiAgaWYgKHR5cGVvZiBuZXh0SGFuZGxlciA9PT0gJ29iamVjdCcpIHtcbiAgICByZXR1cm4gbmV4dEhhbmRsZXI7XG4gIH1cblxuICB2YXIgbm9vcCA9IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gdm9pZCAwO1xuICB9O1xuXG4gIHJldHVybiB7XG4gICAgbmV4dDogbmV4dEhhbmRsZXIsXG4gICAgZXJyb3I6IGVycm9ySGFuZGxlciB8fCBub29wLFxuICAgIGNvbXBsZXRlOiBjb21wbGV0aW9uSGFuZGxlciB8fCBub29wXG4gIH07XG59XG5cbmV4cG9ydCB7IGV2YWx1YXRlR3VhcmQsIGZsYXR0ZW4sIGdldEV2ZW50VHlwZSwgaXNBY3RvciwgaXNBcnJheSwgaXNCdWlsdEluRXZlbnQsIGlzRnVuY3Rpb24sIGlzTWFjaGluZSwgaXNPYnNlcnZhYmxlLCBpc1Byb21pc2VMaWtlLCBpc1N0YXRlTGlrZSwgaXNTdHJpbmcsIGtleXMsIG1hcENvbnRleHQsIG1hcEZpbHRlclZhbHVlcywgbWFwVmFsdWVzLCBtYXRjaGVzU3RhdGUsIG5lc3RlZFBhdGgsIG5vcm1hbGl6ZVRhcmdldCwgcGFydGl0aW9uLCBwYXRoLCBwYXRoVG9TdGF0ZVZhbHVlLCByZXBvcnRVbmhhbmRsZWRFeGNlcHRpb25Pbkludm9jYXRpb24sIHN5bWJvbE9ic2VydmFibGUsIHRvQXJyYXksIHRvQXJyYXlTdHJpY3QsIHRvRXZlbnRPYmplY3QsIHRvR3VhcmQsIHRvSW52b2tlU291cmNlLCB0b09ic2VydmVyLCB0b1NDWE1MRXZlbnQsIHRvU3RhdGVQYXRoLCB0b1N0YXRlUGF0aHMsIHRvU3RhdGVWYWx1ZSwgdG9UcmFuc2l0aW9uQ29uZmlnQXJyYXksIHVuaXF1ZUlkLCB1cGRhdGVDb250ZXh0LCB1cGRhdGVIaXN0b3J5U3RhdGVzLCB1cGRhdGVIaXN0b3J5VmFsdWUsIHdhcm4gfTsiLCJpbXBvcnQgeyBfX3ZhbHVlcyB9IGZyb20gJy4vX3ZpcnR1YWwvX3RzbGliLmpzJztcbmltcG9ydCB7IGtleXMsIG1hdGNoZXNTdGF0ZSB9IGZyb20gJy4vdXRpbHMuanMnO1xuXG5mdW5jdGlvbiBtYXBTdGF0ZShzdGF0ZU1hcCwgc3RhdGVJZCkge1xuICB2YXIgZV8xLCBfYTtcblxuICB2YXIgZm91bmRTdGF0ZUlkO1xuXG4gIHRyeSB7XG4gICAgZm9yICh2YXIgX2IgPSBfX3ZhbHVlcyhrZXlzKHN0YXRlTWFwKSksIF9jID0gX2IubmV4dCgpOyAhX2MuZG9uZTsgX2MgPSBfYi5uZXh0KCkpIHtcbiAgICAgIHZhciBtYXBwZWRTdGF0ZUlkID0gX2MudmFsdWU7XG5cbiAgICAgIGlmIChtYXRjaGVzU3RhdGUobWFwcGVkU3RhdGVJZCwgc3RhdGVJZCkgJiYgKCFmb3VuZFN0YXRlSWQgfHwgc3RhdGVJZC5sZW5ndGggPiBmb3VuZFN0YXRlSWQubGVuZ3RoKSkge1xuICAgICAgICBmb3VuZFN0YXRlSWQgPSBtYXBwZWRTdGF0ZUlkO1xuICAgICAgfVxuICAgIH1cbiAgfSBjYXRjaCAoZV8xXzEpIHtcbiAgICBlXzEgPSB7XG4gICAgICBlcnJvcjogZV8xXzFcbiAgICB9O1xuICB9IGZpbmFsbHkge1xuICAgIHRyeSB7XG4gICAgICBpZiAoX2MgJiYgIV9jLmRvbmUgJiYgKF9hID0gX2IucmV0dXJuKSkgX2EuY2FsbChfYik7XG4gICAgfSBmaW5hbGx5IHtcbiAgICAgIGlmIChlXzEpIHRocm93IGVfMS5lcnJvcjtcbiAgICB9XG4gIH1cblxuICByZXR1cm4gc3RhdGVNYXBbZm91bmRTdGF0ZUlkXTtcbn1cblxuZXhwb3J0IHsgbWFwU3RhdGUgfTsiLCJ2YXIgQWN0aW9uVHlwZXM7XG5cbihmdW5jdGlvbiAoQWN0aW9uVHlwZXMpIHtcbiAgQWN0aW9uVHlwZXNbXCJTdGFydFwiXSA9IFwieHN0YXRlLnN0YXJ0XCI7XG4gIEFjdGlvblR5cGVzW1wiU3RvcFwiXSA9IFwieHN0YXRlLnN0b3BcIjtcbiAgQWN0aW9uVHlwZXNbXCJSYWlzZVwiXSA9IFwieHN0YXRlLnJhaXNlXCI7XG4gIEFjdGlvblR5cGVzW1wiU2VuZFwiXSA9IFwieHN0YXRlLnNlbmRcIjtcbiAgQWN0aW9uVHlwZXNbXCJDYW5jZWxcIl0gPSBcInhzdGF0ZS5jYW5jZWxcIjtcbiAgQWN0aW9uVHlwZXNbXCJOdWxsRXZlbnRcIl0gPSBcIlwiO1xuICBBY3Rpb25UeXBlc1tcIkFzc2lnblwiXSA9IFwieHN0YXRlLmFzc2lnblwiO1xuICBBY3Rpb25UeXBlc1tcIkFmdGVyXCJdID0gXCJ4c3RhdGUuYWZ0ZXJcIjtcbiAgQWN0aW9uVHlwZXNbXCJEb25lU3RhdGVcIl0gPSBcImRvbmUuc3RhdGVcIjtcbiAgQWN0aW9uVHlwZXNbXCJEb25lSW52b2tlXCJdID0gXCJkb25lLmludm9rZVwiO1xuICBBY3Rpb25UeXBlc1tcIkxvZ1wiXSA9IFwieHN0YXRlLmxvZ1wiO1xuICBBY3Rpb25UeXBlc1tcIkluaXRcIl0gPSBcInhzdGF0ZS5pbml0XCI7XG4gIEFjdGlvblR5cGVzW1wiSW52b2tlXCJdID0gXCJ4c3RhdGUuaW52b2tlXCI7XG4gIEFjdGlvblR5cGVzW1wiRXJyb3JFeGVjdXRpb25cIl0gPSBcImVycm9yLmV4ZWN1dGlvblwiO1xuICBBY3Rpb25UeXBlc1tcIkVycm9yQ29tbXVuaWNhdGlvblwiXSA9IFwiZXJyb3IuY29tbXVuaWNhdGlvblwiO1xuICBBY3Rpb25UeXBlc1tcIkVycm9yUGxhdGZvcm1cIl0gPSBcImVycm9yLnBsYXRmb3JtXCI7XG4gIEFjdGlvblR5cGVzW1wiRXJyb3JDdXN0b21cIl0gPSBcInhzdGF0ZS5lcnJvclwiO1xuICBBY3Rpb25UeXBlc1tcIlVwZGF0ZVwiXSA9IFwieHN0YXRlLnVwZGF0ZVwiO1xuICBBY3Rpb25UeXBlc1tcIlB1cmVcIl0gPSBcInhzdGF0ZS5wdXJlXCI7XG4gIEFjdGlvblR5cGVzW1wiQ2hvb3NlXCJdID0gXCJ4c3RhdGUuY2hvb3NlXCI7XG59KShBY3Rpb25UeXBlcyB8fCAoQWN0aW9uVHlwZXMgPSB7fSkpO1xuXG52YXIgU3BlY2lhbFRhcmdldHM7XG5cbihmdW5jdGlvbiAoU3BlY2lhbFRhcmdldHMpIHtcbiAgU3BlY2lhbFRhcmdldHNbXCJQYXJlbnRcIl0gPSBcIiNfcGFyZW50XCI7XG4gIFNwZWNpYWxUYXJnZXRzW1wiSW50ZXJuYWxcIl0gPSBcIiNfaW50ZXJuYWxcIjtcbn0pKFNwZWNpYWxUYXJnZXRzIHx8IChTcGVjaWFsVGFyZ2V0cyA9IHt9KSk7XG5cbmV4cG9ydCB7IEFjdGlvblR5cGVzLCBTcGVjaWFsVGFyZ2V0cyB9OyIsImltcG9ydCB7IEFjdGlvblR5cGVzIH0gZnJvbSAnLi90eXBlcy5qcyc7IC8vIHhzdGF0ZS1zcGVjaWZpYyBhY3Rpb24gdHlwZXNcblxudmFyIHN0YXJ0ID0gQWN0aW9uVHlwZXMuU3RhcnQ7XG52YXIgc3RvcCA9IEFjdGlvblR5cGVzLlN0b3A7XG52YXIgcmFpc2UgPSBBY3Rpb25UeXBlcy5SYWlzZTtcbnZhciBzZW5kID0gQWN0aW9uVHlwZXMuU2VuZDtcbnZhciBjYW5jZWwgPSBBY3Rpb25UeXBlcy5DYW5jZWw7XG52YXIgbnVsbEV2ZW50ID0gQWN0aW9uVHlwZXMuTnVsbEV2ZW50O1xudmFyIGFzc2lnbiA9IEFjdGlvblR5cGVzLkFzc2lnbjtcbnZhciBhZnRlciA9IEFjdGlvblR5cGVzLkFmdGVyO1xudmFyIGRvbmVTdGF0ZSA9IEFjdGlvblR5cGVzLkRvbmVTdGF0ZTtcbnZhciBsb2cgPSBBY3Rpb25UeXBlcy5Mb2c7XG52YXIgaW5pdCA9IEFjdGlvblR5cGVzLkluaXQ7XG52YXIgaW52b2tlID0gQWN0aW9uVHlwZXMuSW52b2tlO1xudmFyIGVycm9yRXhlY3V0aW9uID0gQWN0aW9uVHlwZXMuRXJyb3JFeGVjdXRpb247XG52YXIgZXJyb3JQbGF0Zm9ybSA9IEFjdGlvblR5cGVzLkVycm9yUGxhdGZvcm07XG52YXIgZXJyb3IgPSBBY3Rpb25UeXBlcy5FcnJvckN1c3RvbTtcbnZhciB1cGRhdGUgPSBBY3Rpb25UeXBlcy5VcGRhdGU7XG52YXIgY2hvb3NlID0gQWN0aW9uVHlwZXMuQ2hvb3NlO1xudmFyIHB1cmUgPSBBY3Rpb25UeXBlcy5QdXJlO1xuZXhwb3J0IHsgYWZ0ZXIsIGFzc2lnbiwgY2FuY2VsLCBjaG9vc2UsIGRvbmVTdGF0ZSwgZXJyb3IsIGVycm9yRXhlY3V0aW9uLCBlcnJvclBsYXRmb3JtLCBpbml0LCBpbnZva2UsIGxvZywgbnVsbEV2ZW50LCBwdXJlLCByYWlzZSwgc2VuZCwgc3RhcnQsIHN0b3AsIHVwZGF0ZSB9OyIsImltcG9ydCB7IF9fYXNzaWduLCBfX3JlYWQgfSBmcm9tICcuL192aXJ0dWFsL190c2xpYi5qcyc7XG5pbXBvcnQgeyBJU19QUk9EVUNUSU9OIH0gZnJvbSAnLi9lbnZpcm9ubWVudC5qcyc7XG5pbXBvcnQgeyB0b1NDWE1MRXZlbnQsIGlzRnVuY3Rpb24sIHRvRXZlbnRPYmplY3QsIGdldEV2ZW50VHlwZSwgaXNTdHJpbmcsIHBhcnRpdGlvbiwgdXBkYXRlQ29udGV4dCwgZmxhdHRlbiwgdG9BcnJheSwgdG9HdWFyZCwgZXZhbHVhdGVHdWFyZCwgd2FybiwgaXNBcnJheSB9IGZyb20gJy4vdXRpbHMuanMnO1xuaW1wb3J0IHsgU3BlY2lhbFRhcmdldHMsIEFjdGlvblR5cGVzIH0gZnJvbSAnLi90eXBlcy5qcyc7XG5pbXBvcnQgeyBzZW5kIGFzIHNlbmQkMSwgdXBkYXRlLCBhc3NpZ24gYXMgYXNzaWduJDEsIGluaXQsIHJhaXNlIGFzIHJhaXNlJDEsIGxvZyBhcyBsb2ckMSwgY2FuY2VsIGFzIGNhbmNlbCQxLCBlcnJvciBhcyBlcnJvciQxLCBzdG9wIGFzIHN0b3AkMSwgcHVyZSBhcyBwdXJlJDEsIGNob29zZSBhcyBjaG9vc2UkMSB9IGZyb20gJy4vYWN0aW9uVHlwZXMuanMnO1xudmFyIGluaXRFdmVudCA9IC8qI19fUFVSRV9fKi90b1NDWE1MRXZlbnQoe1xuICB0eXBlOiBpbml0XG59KTtcblxuZnVuY3Rpb24gZ2V0QWN0aW9uRnVuY3Rpb24oYWN0aW9uVHlwZSwgYWN0aW9uRnVuY3Rpb25NYXApIHtcbiAgcmV0dXJuIGFjdGlvbkZ1bmN0aW9uTWFwID8gYWN0aW9uRnVuY3Rpb25NYXBbYWN0aW9uVHlwZV0gfHwgdW5kZWZpbmVkIDogdW5kZWZpbmVkO1xufVxuXG5mdW5jdGlvbiB0b0FjdGlvbk9iamVjdChhY3Rpb24sIGFjdGlvbkZ1bmN0aW9uTWFwKSB7XG4gIHZhciBhY3Rpb25PYmplY3Q7XG5cbiAgaWYgKGlzU3RyaW5nKGFjdGlvbikgfHwgdHlwZW9mIGFjdGlvbiA9PT0gJ251bWJlcicpIHtcbiAgICB2YXIgZXhlYyA9IGdldEFjdGlvbkZ1bmN0aW9uKGFjdGlvbiwgYWN0aW9uRnVuY3Rpb25NYXApO1xuXG4gICAgaWYgKGlzRnVuY3Rpb24oZXhlYykpIHtcbiAgICAgIGFjdGlvbk9iamVjdCA9IHtcbiAgICAgICAgdHlwZTogYWN0aW9uLFxuICAgICAgICBleGVjOiBleGVjXG4gICAgICB9O1xuICAgIH0gZWxzZSBpZiAoZXhlYykge1xuICAgICAgYWN0aW9uT2JqZWN0ID0gZXhlYztcbiAgICB9IGVsc2Uge1xuICAgICAgYWN0aW9uT2JqZWN0ID0ge1xuICAgICAgICB0eXBlOiBhY3Rpb24sXG4gICAgICAgIGV4ZWM6IHVuZGVmaW5lZFxuICAgICAgfTtcbiAgICB9XG4gIH0gZWxzZSBpZiAoaXNGdW5jdGlvbihhY3Rpb24pKSB7XG4gICAgYWN0aW9uT2JqZWN0ID0ge1xuICAgICAgLy8gQ29udmVydCBhY3Rpb24gdG8gc3RyaW5nIGlmIHVubmFtZWRcbiAgICAgIHR5cGU6IGFjdGlvbi5uYW1lIHx8IGFjdGlvbi50b1N0cmluZygpLFxuICAgICAgZXhlYzogYWN0aW9uXG4gICAgfTtcbiAgfSBlbHNlIHtcbiAgICB2YXIgZXhlYyA9IGdldEFjdGlvbkZ1bmN0aW9uKGFjdGlvbi50eXBlLCBhY3Rpb25GdW5jdGlvbk1hcCk7XG5cbiAgICBpZiAoaXNGdW5jdGlvbihleGVjKSkge1xuICAgICAgYWN0aW9uT2JqZWN0ID0gX19hc3NpZ24oX19hc3NpZ24oe30sIGFjdGlvbiksIHtcbiAgICAgICAgZXhlYzogZXhlY1xuICAgICAgfSk7XG4gICAgfSBlbHNlIGlmIChleGVjKSB7XG4gICAgICB2YXIgYWN0aW9uVHlwZSA9IGV4ZWMudHlwZSB8fCBhY3Rpb24udHlwZTtcbiAgICAgIGFjdGlvbk9iamVjdCA9IF9fYXNzaWduKF9fYXNzaWduKF9fYXNzaWduKHt9LCBleGVjKSwgYWN0aW9uKSwge1xuICAgICAgICB0eXBlOiBhY3Rpb25UeXBlXG4gICAgICB9KTtcbiAgICB9IGVsc2Uge1xuICAgICAgYWN0aW9uT2JqZWN0ID0gYWN0aW9uO1xuICAgIH1cbiAgfVxuXG4gIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShhY3Rpb25PYmplY3QsICd0b1N0cmluZycsIHtcbiAgICB2YWx1ZTogZnVuY3Rpb24gKCkge1xuICAgICAgcmV0dXJuIGFjdGlvbk9iamVjdC50eXBlO1xuICAgIH0sXG4gICAgZW51bWVyYWJsZTogZmFsc2UsXG4gICAgY29uZmlndXJhYmxlOiB0cnVlXG4gIH0pO1xuICByZXR1cm4gYWN0aW9uT2JqZWN0O1xufVxuXG52YXIgdG9BY3Rpb25PYmplY3RzID0gZnVuY3Rpb24gKGFjdGlvbiwgYWN0aW9uRnVuY3Rpb25NYXApIHtcbiAgaWYgKCFhY3Rpb24pIHtcbiAgICByZXR1cm4gW107XG4gIH1cblxuICB2YXIgYWN0aW9ucyA9IGlzQXJyYXkoYWN0aW9uKSA/IGFjdGlvbiA6IFthY3Rpb25dO1xuICByZXR1cm4gYWN0aW9ucy5tYXAoZnVuY3Rpb24gKHN1YkFjdGlvbikge1xuICAgIHJldHVybiB0b0FjdGlvbk9iamVjdChzdWJBY3Rpb24sIGFjdGlvbkZ1bmN0aW9uTWFwKTtcbiAgfSk7XG59O1xuXG5mdW5jdGlvbiB0b0FjdGl2aXR5RGVmaW5pdGlvbihhY3Rpb24pIHtcbiAgdmFyIGFjdGlvbk9iamVjdCA9IHRvQWN0aW9uT2JqZWN0KGFjdGlvbik7XG4gIHJldHVybiBfX2Fzc2lnbihfX2Fzc2lnbih7XG4gICAgaWQ6IGlzU3RyaW5nKGFjdGlvbikgPyBhY3Rpb24gOiBhY3Rpb25PYmplY3QuaWRcbiAgfSwgYWN0aW9uT2JqZWN0KSwge1xuICAgIHR5cGU6IGFjdGlvbk9iamVjdC50eXBlXG4gIH0pO1xufVxuLyoqXHJcbiAqIFJhaXNlcyBhbiBldmVudC4gVGhpcyBwbGFjZXMgdGhlIGV2ZW50IGluIHRoZSBpbnRlcm5hbCBldmVudCBxdWV1ZSwgc28gdGhhdFxyXG4gKiB0aGUgZXZlbnQgaXMgaW1tZWRpYXRlbHkgY29uc3VtZWQgYnkgdGhlIG1hY2hpbmUgaW4gdGhlIGN1cnJlbnQgc3RlcC5cclxuICpcclxuICogQHBhcmFtIGV2ZW50VHlwZSBUaGUgZXZlbnQgdG8gcmFpc2UuXHJcbiAqL1xuXG5cbmZ1bmN0aW9uIHJhaXNlKGV2ZW50KSB7XG4gIGlmICghaXNTdHJpbmcoZXZlbnQpKSB7XG4gICAgcmV0dXJuIHNlbmQoZXZlbnQsIHtcbiAgICAgIHRvOiBTcGVjaWFsVGFyZ2V0cy5JbnRlcm5hbFxuICAgIH0pO1xuICB9XG5cbiAgcmV0dXJuIHtcbiAgICB0eXBlOiByYWlzZSQxLFxuICAgIGV2ZW50OiBldmVudFxuICB9O1xufVxuXG5mdW5jdGlvbiByZXNvbHZlUmFpc2UoYWN0aW9uKSB7XG4gIHJldHVybiB7XG4gICAgdHlwZTogcmFpc2UkMSxcbiAgICBfZXZlbnQ6IHRvU0NYTUxFdmVudChhY3Rpb24uZXZlbnQpXG4gIH07XG59XG4vKipcclxuICogU2VuZHMgYW4gZXZlbnQuIFRoaXMgcmV0dXJucyBhbiBhY3Rpb24gdGhhdCB3aWxsIGJlIHJlYWQgYnkgYW4gaW50ZXJwcmV0ZXIgdG9cclxuICogc2VuZCB0aGUgZXZlbnQgaW4gdGhlIG5leHQgc3RlcCwgYWZ0ZXIgdGhlIGN1cnJlbnQgc3RlcCBpcyBmaW5pc2hlZCBleGVjdXRpbmcuXHJcbiAqXHJcbiAqIEBwYXJhbSBldmVudCBUaGUgZXZlbnQgdG8gc2VuZC5cclxuICogQHBhcmFtIG9wdGlvbnMgT3B0aW9ucyB0byBwYXNzIGludG8gdGhlIHNlbmQgZXZlbnQ6XHJcbiAqICAtIGBpZGAgLSBUaGUgdW5pcXVlIHNlbmQgZXZlbnQgaWRlbnRpZmllciAodXNlZCB3aXRoIGBjYW5jZWwoKWApLlxyXG4gKiAgLSBgZGVsYXlgIC0gVGhlIG51bWJlciBvZiBtaWxsaXNlY29uZHMgdG8gZGVsYXkgdGhlIHNlbmRpbmcgb2YgdGhlIGV2ZW50LlxyXG4gKiAgLSBgdG9gIC0gVGhlIHRhcmdldCBvZiB0aGlzIGV2ZW50IChieSBkZWZhdWx0LCB0aGUgbWFjaGluZSB0aGUgZXZlbnQgd2FzIHNlbnQgZnJvbSkuXHJcbiAqL1xuXG5cbmZ1bmN0aW9uIHNlbmQoZXZlbnQsIG9wdGlvbnMpIHtcbiAgcmV0dXJuIHtcbiAgICB0bzogb3B0aW9ucyA/IG9wdGlvbnMudG8gOiB1bmRlZmluZWQsXG4gICAgdHlwZTogc2VuZCQxLFxuICAgIGV2ZW50OiBpc0Z1bmN0aW9uKGV2ZW50KSA/IGV2ZW50IDogdG9FdmVudE9iamVjdChldmVudCksXG4gICAgZGVsYXk6IG9wdGlvbnMgPyBvcHRpb25zLmRlbGF5IDogdW5kZWZpbmVkLFxuICAgIGlkOiBvcHRpb25zICYmIG9wdGlvbnMuaWQgIT09IHVuZGVmaW5lZCA/IG9wdGlvbnMuaWQgOiBpc0Z1bmN0aW9uKGV2ZW50KSA/IGV2ZW50Lm5hbWUgOiBnZXRFdmVudFR5cGUoZXZlbnQpXG4gIH07XG59XG5cbmZ1bmN0aW9uIHJlc29sdmVTZW5kKGFjdGlvbiwgY3R4LCBfZXZlbnQsIGRlbGF5c01hcCkge1xuICB2YXIgbWV0YSA9IHtcbiAgICBfZXZlbnQ6IF9ldmVudFxuICB9OyAvLyBUT0RPOiBoZWxwZXIgZnVuY3Rpb24gZm9yIHJlc29sdmluZyBFeHByXG5cbiAgdmFyIHJlc29sdmVkRXZlbnQgPSB0b1NDWE1MRXZlbnQoaXNGdW5jdGlvbihhY3Rpb24uZXZlbnQpID8gYWN0aW9uLmV2ZW50KGN0eCwgX2V2ZW50LmRhdGEsIG1ldGEpIDogYWN0aW9uLmV2ZW50KTtcbiAgdmFyIHJlc29sdmVkRGVsYXk7XG5cbiAgaWYgKGlzU3RyaW5nKGFjdGlvbi5kZWxheSkpIHtcbiAgICB2YXIgY29uZmlnRGVsYXkgPSBkZWxheXNNYXAgJiYgZGVsYXlzTWFwW2FjdGlvbi5kZWxheV07XG4gICAgcmVzb2x2ZWREZWxheSA9IGlzRnVuY3Rpb24oY29uZmlnRGVsYXkpID8gY29uZmlnRGVsYXkoY3R4LCBfZXZlbnQuZGF0YSwgbWV0YSkgOiBjb25maWdEZWxheTtcbiAgfSBlbHNlIHtcbiAgICByZXNvbHZlZERlbGF5ID0gaXNGdW5jdGlvbihhY3Rpb24uZGVsYXkpID8gYWN0aW9uLmRlbGF5KGN0eCwgX2V2ZW50LmRhdGEsIG1ldGEpIDogYWN0aW9uLmRlbGF5O1xuICB9XG5cbiAgdmFyIHJlc29sdmVkVGFyZ2V0ID0gaXNGdW5jdGlvbihhY3Rpb24udG8pID8gYWN0aW9uLnRvKGN0eCwgX2V2ZW50LmRhdGEsIG1ldGEpIDogYWN0aW9uLnRvO1xuICByZXR1cm4gX19hc3NpZ24oX19hc3NpZ24oe30sIGFjdGlvbiksIHtcbiAgICB0bzogcmVzb2x2ZWRUYXJnZXQsXG4gICAgX2V2ZW50OiByZXNvbHZlZEV2ZW50LFxuICAgIGV2ZW50OiByZXNvbHZlZEV2ZW50LmRhdGEsXG4gICAgZGVsYXk6IHJlc29sdmVkRGVsYXlcbiAgfSk7XG59XG4vKipcclxuICogU2VuZHMgYW4gZXZlbnQgdG8gdGhpcyBtYWNoaW5lJ3MgcGFyZW50LlxyXG4gKlxyXG4gKiBAcGFyYW0gZXZlbnQgVGhlIGV2ZW50IHRvIHNlbmQgdG8gdGhlIHBhcmVudCBtYWNoaW5lLlxyXG4gKiBAcGFyYW0gb3B0aW9ucyBPcHRpb25zIHRvIHBhc3MgaW50byB0aGUgc2VuZCBldmVudC5cclxuICovXG5cblxuZnVuY3Rpb24gc2VuZFBhcmVudChldmVudCwgb3B0aW9ucykge1xuICByZXR1cm4gc2VuZChldmVudCwgX19hc3NpZ24oX19hc3NpZ24oe30sIG9wdGlvbnMpLCB7XG4gICAgdG86IFNwZWNpYWxUYXJnZXRzLlBhcmVudFxuICB9KSk7XG59XG4vKipcclxuICogU2VuZHMgYW4gdXBkYXRlIGV2ZW50IHRvIHRoaXMgbWFjaGluZSdzIHBhcmVudC5cclxuICovXG5cblxuZnVuY3Rpb24gc2VuZFVwZGF0ZSgpIHtcbiAgcmV0dXJuIHNlbmRQYXJlbnQodXBkYXRlKTtcbn1cbi8qKlxyXG4gKiBTZW5kcyBhbiBldmVudCBiYWNrIHRvIHRoZSBzZW5kZXIgb2YgdGhlIG9yaWdpbmFsIGV2ZW50LlxyXG4gKlxyXG4gKiBAcGFyYW0gZXZlbnQgVGhlIGV2ZW50IHRvIHNlbmQgYmFjayB0byB0aGUgc2VuZGVyXHJcbiAqIEBwYXJhbSBvcHRpb25zIE9wdGlvbnMgdG8gcGFzcyBpbnRvIHRoZSBzZW5kIGV2ZW50XHJcbiAqL1xuXG5cbmZ1bmN0aW9uIHJlc3BvbmQoZXZlbnQsIG9wdGlvbnMpIHtcbiAgcmV0dXJuIHNlbmQoZXZlbnQsIF9fYXNzaWduKF9fYXNzaWduKHt9LCBvcHRpb25zKSwge1xuICAgIHRvOiBmdW5jdGlvbiAoXywgX18sIF9hKSB7XG4gICAgICB2YXIgX2V2ZW50ID0gX2EuX2V2ZW50O1xuICAgICAgcmV0dXJuIF9ldmVudC5vcmlnaW47IC8vIFRPRE86IGhhbmRsZSB3aGVuIF9ldmVudC5vcmlnaW4gaXMgdW5kZWZpbmVkXG4gICAgfVxuICB9KSk7XG59XG5cbnZhciBkZWZhdWx0TG9nRXhwciA9IGZ1bmN0aW9uIChjb250ZXh0LCBldmVudCkge1xuICByZXR1cm4ge1xuICAgIGNvbnRleHQ6IGNvbnRleHQsXG4gICAgZXZlbnQ6IGV2ZW50XG4gIH07XG59O1xuLyoqXHJcbiAqXHJcbiAqIEBwYXJhbSBleHByIFRoZSBleHByZXNzaW9uIGZ1bmN0aW9uIHRvIGV2YWx1YXRlIHdoaWNoIHdpbGwgYmUgbG9nZ2VkLlxyXG4gKiAgVGFrZXMgaW4gMiBhcmd1bWVudHM6XHJcbiAqICAtIGBjdHhgIC0gdGhlIGN1cnJlbnQgc3RhdGUgY29udGV4dFxyXG4gKiAgLSBgZXZlbnRgIC0gdGhlIGV2ZW50IHRoYXQgY2F1c2VkIHRoaXMgYWN0aW9uIHRvIGJlIGV4ZWN1dGVkLlxyXG4gKiBAcGFyYW0gbGFiZWwgVGhlIGxhYmVsIHRvIGdpdmUgdG8gdGhlIGxvZ2dlZCBleHByZXNzaW9uLlxyXG4gKi9cblxuXG5mdW5jdGlvbiBsb2coZXhwciwgbGFiZWwpIHtcbiAgaWYgKGV4cHIgPT09IHZvaWQgMCkge1xuICAgIGV4cHIgPSBkZWZhdWx0TG9nRXhwcjtcbiAgfVxuXG4gIHJldHVybiB7XG4gICAgdHlwZTogbG9nJDEsXG4gICAgbGFiZWw6IGxhYmVsLFxuICAgIGV4cHI6IGV4cHJcbiAgfTtcbn1cblxudmFyIHJlc29sdmVMb2cgPSBmdW5jdGlvbiAoYWN0aW9uLCBjdHgsIF9ldmVudCkge1xuICByZXR1cm4gX19hc3NpZ24oX19hc3NpZ24oe30sIGFjdGlvbiksIHtcbiAgICB2YWx1ZTogaXNTdHJpbmcoYWN0aW9uLmV4cHIpID8gYWN0aW9uLmV4cHIgOiBhY3Rpb24uZXhwcihjdHgsIF9ldmVudC5kYXRhLCB7XG4gICAgICBfZXZlbnQ6IF9ldmVudFxuICAgIH0pXG4gIH0pO1xufTtcbi8qKlxyXG4gKiBDYW5jZWxzIGFuIGluLWZsaWdodCBgc2VuZCguLi4pYCBhY3Rpb24uIEEgY2FuY2VsZWQgc2VudCBhY3Rpb24gd2lsbCBub3RcclxuICogYmUgZXhlY3V0ZWQsIG5vciB3aWxsIGl0cyBldmVudCBiZSBzZW50LCB1bmxlc3MgaXQgaGFzIGFscmVhZHkgYmVlbiBzZW50XHJcbiAqIChlLmcuLCBpZiBgY2FuY2VsKC4uLilgIGlzIGNhbGxlZCBhZnRlciB0aGUgYHNlbmQoLi4uKWAgYWN0aW9uJ3MgYGRlbGF5YCkuXHJcbiAqXHJcbiAqIEBwYXJhbSBzZW5kSWQgVGhlIGBpZGAgb2YgdGhlIGBzZW5kKC4uLilgIGFjdGlvbiB0byBjYW5jZWwuXHJcbiAqL1xuXG5cbnZhciBjYW5jZWwgPSBmdW5jdGlvbiAoc2VuZElkKSB7XG4gIHJldHVybiB7XG4gICAgdHlwZTogY2FuY2VsJDEsXG4gICAgc2VuZElkOiBzZW5kSWRcbiAgfTtcbn07XG4vKipcclxuICogU3RhcnRzIGFuIGFjdGl2aXR5LlxyXG4gKlxyXG4gKiBAcGFyYW0gYWN0aXZpdHkgVGhlIGFjdGl2aXR5IHRvIHN0YXJ0LlxyXG4gKi9cblxuXG5mdW5jdGlvbiBzdGFydChhY3Rpdml0eSkge1xuICB2YXIgYWN0aXZpdHlEZWYgPSB0b0FjdGl2aXR5RGVmaW5pdGlvbihhY3Rpdml0eSk7XG4gIHJldHVybiB7XG4gICAgdHlwZTogQWN0aW9uVHlwZXMuU3RhcnQsXG4gICAgYWN0aXZpdHk6IGFjdGl2aXR5RGVmLFxuICAgIGV4ZWM6IHVuZGVmaW5lZFxuICB9O1xufVxuLyoqXHJcbiAqIFN0b3BzIGFuIGFjdGl2aXR5LlxyXG4gKlxyXG4gKiBAcGFyYW0gYWN0b3JSZWYgVGhlIGFjdGl2aXR5IHRvIHN0b3AuXHJcbiAqL1xuXG5cbmZ1bmN0aW9uIHN0b3AoYWN0b3JSZWYpIHtcbiAgdmFyIGFjdGl2aXR5ID0gaXNGdW5jdGlvbihhY3RvclJlZikgPyBhY3RvclJlZiA6IHRvQWN0aXZpdHlEZWZpbml0aW9uKGFjdG9yUmVmKTtcbiAgcmV0dXJuIHtcbiAgICB0eXBlOiBBY3Rpb25UeXBlcy5TdG9wLFxuICAgIGFjdGl2aXR5OiBhY3Rpdml0eSxcbiAgICBleGVjOiB1bmRlZmluZWRcbiAgfTtcbn1cblxuZnVuY3Rpb24gcmVzb2x2ZVN0b3AoYWN0aW9uLCBjb250ZXh0LCBfZXZlbnQpIHtcbiAgdmFyIGFjdG9yUmVmT3JTdHJpbmcgPSBpc0Z1bmN0aW9uKGFjdGlvbi5hY3Rpdml0eSkgPyBhY3Rpb24uYWN0aXZpdHkoY29udGV4dCwgX2V2ZW50LmRhdGEpIDogYWN0aW9uLmFjdGl2aXR5O1xuICB2YXIgcmVzb2x2ZWRBY3RvclJlZiA9IHR5cGVvZiBhY3RvclJlZk9yU3RyaW5nID09PSAnc3RyaW5nJyA/IHtcbiAgICBpZDogYWN0b3JSZWZPclN0cmluZ1xuICB9IDogYWN0b3JSZWZPclN0cmluZztcbiAgdmFyIGFjdGlvbk9iamVjdCA9IHtcbiAgICB0eXBlOiBBY3Rpb25UeXBlcy5TdG9wLFxuICAgIGFjdGl2aXR5OiByZXNvbHZlZEFjdG9yUmVmXG4gIH07XG4gIHJldHVybiBhY3Rpb25PYmplY3Q7XG59XG4vKipcclxuICogVXBkYXRlcyB0aGUgY3VycmVudCBjb250ZXh0IG9mIHRoZSBtYWNoaW5lLlxyXG4gKlxyXG4gKiBAcGFyYW0gYXNzaWdubWVudCBBbiBvYmplY3QgdGhhdCByZXByZXNlbnRzIHRoZSBwYXJ0aWFsIGNvbnRleHQgdG8gdXBkYXRlLlxyXG4gKi9cblxuXG52YXIgYXNzaWduID0gZnVuY3Rpb24gKGFzc2lnbm1lbnQpIHtcbiAgcmV0dXJuIHtcbiAgICB0eXBlOiBhc3NpZ24kMSxcbiAgICBhc3NpZ25tZW50OiBhc3NpZ25tZW50XG4gIH07XG59O1xuLyoqXHJcbiAqIFJldHVybnMgYW4gZXZlbnQgdHlwZSB0aGF0IHJlcHJlc2VudHMgYW4gaW1wbGljaXQgZXZlbnQgdGhhdFxyXG4gKiBpcyBzZW50IGFmdGVyIHRoZSBzcGVjaWZpZWQgYGRlbGF5YC5cclxuICpcclxuICogQHBhcmFtIGRlbGF5UmVmIFRoZSBkZWxheSBpbiBtaWxsaXNlY29uZHNcclxuICogQHBhcmFtIGlkIFRoZSBzdGF0ZSBub2RlIElEIHdoZXJlIHRoaXMgZXZlbnQgaXMgaGFuZGxlZFxyXG4gKi9cblxuXG5mdW5jdGlvbiBhZnRlcihkZWxheVJlZiwgaWQpIHtcbiAgdmFyIGlkU3VmZml4ID0gaWQgPyBcIiNcIiArIGlkIDogJyc7XG4gIHJldHVybiBBY3Rpb25UeXBlcy5BZnRlciArIFwiKFwiICsgZGVsYXlSZWYgKyBcIilcIiArIGlkU3VmZml4O1xufVxuLyoqXHJcbiAqIFJldHVybnMgYW4gZXZlbnQgdGhhdCByZXByZXNlbnRzIHRoYXQgYSBmaW5hbCBzdGF0ZSBub2RlXHJcbiAqIGhhcyBiZWVuIHJlYWNoZWQgaW4gdGhlIHBhcmVudCBzdGF0ZSBub2RlLlxyXG4gKlxyXG4gKiBAcGFyYW0gaWQgVGhlIGZpbmFsIHN0YXRlIG5vZGUncyBwYXJlbnQgc3RhdGUgbm9kZSBgaWRgXHJcbiAqIEBwYXJhbSBkYXRhIFRoZSBkYXRhIHRvIHBhc3MgaW50byB0aGUgZXZlbnRcclxuICovXG5cblxuZnVuY3Rpb24gZG9uZShpZCwgZGF0YSkge1xuICB2YXIgdHlwZSA9IEFjdGlvblR5cGVzLkRvbmVTdGF0ZSArIFwiLlwiICsgaWQ7XG4gIHZhciBldmVudE9iamVjdCA9IHtcbiAgICB0eXBlOiB0eXBlLFxuICAgIGRhdGE6IGRhdGFcbiAgfTtcblxuICBldmVudE9iamVjdC50b1N0cmluZyA9IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gdHlwZTtcbiAgfTtcblxuICByZXR1cm4gZXZlbnRPYmplY3Q7XG59XG4vKipcclxuICogUmV0dXJucyBhbiBldmVudCB0aGF0IHJlcHJlc2VudHMgdGhhdCBhbiBpbnZva2VkIHNlcnZpY2UgaGFzIHRlcm1pbmF0ZWQuXHJcbiAqXHJcbiAqIEFuIGludm9rZWQgc2VydmljZSBpcyB0ZXJtaW5hdGVkIHdoZW4gaXQgaGFzIHJlYWNoZWQgYSB0b3AtbGV2ZWwgZmluYWwgc3RhdGUgbm9kZSxcclxuICogYnV0IG5vdCB3aGVuIGl0IGlzIGNhbmNlbGVkLlxyXG4gKlxyXG4gKiBAcGFyYW0gaWQgVGhlIGZpbmFsIHN0YXRlIG5vZGUgSURcclxuICogQHBhcmFtIGRhdGEgVGhlIGRhdGEgdG8gcGFzcyBpbnRvIHRoZSBldmVudFxyXG4gKi9cblxuXG5mdW5jdGlvbiBkb25lSW52b2tlKGlkLCBkYXRhKSB7XG4gIHZhciB0eXBlID0gQWN0aW9uVHlwZXMuRG9uZUludm9rZSArIFwiLlwiICsgaWQ7XG4gIHZhciBldmVudE9iamVjdCA9IHtcbiAgICB0eXBlOiB0eXBlLFxuICAgIGRhdGE6IGRhdGFcbiAgfTtcblxuICBldmVudE9iamVjdC50b1N0cmluZyA9IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gdHlwZTtcbiAgfTtcblxuICByZXR1cm4gZXZlbnRPYmplY3Q7XG59XG5cbmZ1bmN0aW9uIGVycm9yKGlkLCBkYXRhKSB7XG4gIHZhciB0eXBlID0gQWN0aW9uVHlwZXMuRXJyb3JQbGF0Zm9ybSArIFwiLlwiICsgaWQ7XG4gIHZhciBldmVudE9iamVjdCA9IHtcbiAgICB0eXBlOiB0eXBlLFxuICAgIGRhdGE6IGRhdGFcbiAgfTtcblxuICBldmVudE9iamVjdC50b1N0cmluZyA9IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gdHlwZTtcbiAgfTtcblxuICByZXR1cm4gZXZlbnRPYmplY3Q7XG59XG5cbmZ1bmN0aW9uIHB1cmUoZ2V0QWN0aW9ucykge1xuICByZXR1cm4ge1xuICAgIHR5cGU6IEFjdGlvblR5cGVzLlB1cmUsXG4gICAgZ2V0OiBnZXRBY3Rpb25zXG4gIH07XG59XG4vKipcclxuICogRm9yd2FyZHMgKHNlbmRzKSBhbiBldmVudCB0byBhIHNwZWNpZmllZCBzZXJ2aWNlLlxyXG4gKlxyXG4gKiBAcGFyYW0gdGFyZ2V0IFRoZSB0YXJnZXQgc2VydmljZSB0byBmb3J3YXJkIHRoZSBldmVudCB0by5cclxuICogQHBhcmFtIG9wdGlvbnMgT3B0aW9ucyB0byBwYXNzIGludG8gdGhlIHNlbmQgYWN0aW9uIGNyZWF0b3IuXHJcbiAqL1xuXG5cbmZ1bmN0aW9uIGZvcndhcmRUbyh0YXJnZXQsIG9wdGlvbnMpIHtcbiAgcmV0dXJuIHNlbmQoZnVuY3Rpb24gKF8sIGV2ZW50KSB7XG4gICAgcmV0dXJuIGV2ZW50O1xuICB9LCBfX2Fzc2lnbihfX2Fzc2lnbih7fSwgb3B0aW9ucyksIHtcbiAgICB0bzogdGFyZ2V0XG4gIH0pKTtcbn1cbi8qKlxyXG4gKiBFc2NhbGF0ZXMgYW4gZXJyb3IgYnkgc2VuZGluZyBpdCBhcyBhbiBldmVudCB0byB0aGlzIG1hY2hpbmUncyBwYXJlbnQuXHJcbiAqXHJcbiAqIEBwYXJhbSBlcnJvckRhdGEgVGhlIGVycm9yIGRhdGEgdG8gc2VuZCwgb3IgdGhlIGV4cHJlc3Npb24gZnVuY3Rpb24gdGhhdFxyXG4gKiB0YWtlcyBpbiB0aGUgYGNvbnRleHRgLCBgZXZlbnRgLCBhbmQgYG1ldGFgLCBhbmQgcmV0dXJucyB0aGUgZXJyb3IgZGF0YSB0byBzZW5kLlxyXG4gKiBAcGFyYW0gb3B0aW9ucyBPcHRpb25zIHRvIHBhc3MgaW50byB0aGUgc2VuZCBhY3Rpb24gY3JlYXRvci5cclxuICovXG5cblxuZnVuY3Rpb24gZXNjYWxhdGUoZXJyb3JEYXRhLCBvcHRpb25zKSB7XG4gIHJldHVybiBzZW5kUGFyZW50KGZ1bmN0aW9uIChjb250ZXh0LCBldmVudCwgbWV0YSkge1xuICAgIHJldHVybiB7XG4gICAgICB0eXBlOiBlcnJvciQxLFxuICAgICAgZGF0YTogaXNGdW5jdGlvbihlcnJvckRhdGEpID8gZXJyb3JEYXRhKGNvbnRleHQsIGV2ZW50LCBtZXRhKSA6IGVycm9yRGF0YVxuICAgIH07XG4gIH0sIF9fYXNzaWduKF9fYXNzaWduKHt9LCBvcHRpb25zKSwge1xuICAgIHRvOiBTcGVjaWFsVGFyZ2V0cy5QYXJlbnRcbiAgfSkpO1xufVxuXG5mdW5jdGlvbiBjaG9vc2UoY29uZHMpIHtcbiAgcmV0dXJuIHtcbiAgICB0eXBlOiBBY3Rpb25UeXBlcy5DaG9vc2UsXG4gICAgY29uZHM6IGNvbmRzXG4gIH07XG59XG5cbmZ1bmN0aW9uIHJlc29sdmVBY3Rpb25zKG1hY2hpbmUsIGN1cnJlbnRTdGF0ZSwgY3VycmVudENvbnRleHQsIF9ldmVudCwgYWN0aW9ucykge1xuICB2YXIgX2EgPSBfX3JlYWQocGFydGl0aW9uKGFjdGlvbnMsIGZ1bmN0aW9uIChhY3Rpb24pIHtcbiAgICByZXR1cm4gYWN0aW9uLnR5cGUgPT09IGFzc2lnbiQxO1xuICB9KSwgMiksXG4gICAgICBhc3NpZ25BY3Rpb25zID0gX2FbMF0sXG4gICAgICBvdGhlckFjdGlvbnMgPSBfYVsxXTtcblxuICB2YXIgdXBkYXRlZENvbnRleHQgPSBhc3NpZ25BY3Rpb25zLmxlbmd0aCA/IHVwZGF0ZUNvbnRleHQoY3VycmVudENvbnRleHQsIF9ldmVudCwgYXNzaWduQWN0aW9ucywgY3VycmVudFN0YXRlKSA6IGN1cnJlbnRDb250ZXh0O1xuICB2YXIgcmVzb2x2ZWRBY3Rpb25zID0gZmxhdHRlbihvdGhlckFjdGlvbnMubWFwKGZ1bmN0aW9uIChhY3Rpb25PYmplY3QpIHtcbiAgICB2YXIgX2E7XG5cbiAgICBzd2l0Y2ggKGFjdGlvbk9iamVjdC50eXBlKSB7XG4gICAgICBjYXNlIHJhaXNlJDE6XG4gICAgICAgIHJldHVybiByZXNvbHZlUmFpc2UoYWN0aW9uT2JqZWN0KTtcblxuICAgICAgY2FzZSBzZW5kJDE6XG4gICAgICAgIHZhciBzZW5kQWN0aW9uID0gcmVzb2x2ZVNlbmQoYWN0aW9uT2JqZWN0LCB1cGRhdGVkQ29udGV4dCwgX2V2ZW50LCBtYWNoaW5lLm9wdGlvbnMuZGVsYXlzKTsgLy8gVE9ETzogZml4IEFjdGlvblR5cGVzLkluaXRcblxuICAgICAgICBpZiAoIUlTX1BST0RVQ1RJT04pIHtcbiAgICAgICAgICAvLyB3YXJuIGFmdGVyIHJlc29sdmluZyBhcyB3ZSBjYW4gY3JlYXRlIGJldHRlciBjb250ZXh0dWFsIG1lc3NhZ2UgaGVyZVxuICAgICAgICAgIHdhcm4oIWlzU3RyaW5nKGFjdGlvbk9iamVjdC5kZWxheSkgfHwgdHlwZW9mIHNlbmRBY3Rpb24uZGVsYXkgPT09ICdudW1iZXInLCAvLyB0c2xpbnQ6ZGlzYWJsZS1uZXh0LWxpbmU6bWF4LWxpbmUtbGVuZ3RoXG4gICAgICAgICAgXCJObyBkZWxheSByZWZlcmVuY2UgZm9yIGRlbGF5IGV4cHJlc3Npb24gJ1wiICsgYWN0aW9uT2JqZWN0LmRlbGF5ICsgXCInIHdhcyBmb3VuZCBvbiBtYWNoaW5lICdcIiArIG1hY2hpbmUuaWQgKyBcIidcIik7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gc2VuZEFjdGlvbjtcblxuICAgICAgY2FzZSBsb2ckMTpcbiAgICAgICAgcmV0dXJuIHJlc29sdmVMb2coYWN0aW9uT2JqZWN0LCB1cGRhdGVkQ29udGV4dCwgX2V2ZW50KTtcblxuICAgICAgY2FzZSBjaG9vc2UkMTpcbiAgICAgICAge1xuICAgICAgICAgIHZhciBjaG9vc2VBY3Rpb24gPSBhY3Rpb25PYmplY3Q7XG4gICAgICAgICAgdmFyIG1hdGNoZWRBY3Rpb25zID0gKF9hID0gY2hvb3NlQWN0aW9uLmNvbmRzLmZpbmQoZnVuY3Rpb24gKGNvbmRpdGlvbikge1xuICAgICAgICAgICAgdmFyIGd1YXJkID0gdG9HdWFyZChjb25kaXRpb24uY29uZCwgbWFjaGluZS5vcHRpb25zLmd1YXJkcyk7XG4gICAgICAgICAgICByZXR1cm4gIWd1YXJkIHx8IGV2YWx1YXRlR3VhcmQobWFjaGluZSwgZ3VhcmQsIHVwZGF0ZWRDb250ZXh0LCBfZXZlbnQsIGN1cnJlbnRTdGF0ZSk7XG4gICAgICAgICAgfSkpID09PSBudWxsIHx8IF9hID09PSB2b2lkIDAgPyB2b2lkIDAgOiBfYS5hY3Rpb25zO1xuXG4gICAgICAgICAgaWYgKCFtYXRjaGVkQWN0aW9ucykge1xuICAgICAgICAgICAgcmV0dXJuIFtdO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIHZhciByZXNvbHZlZCA9IHJlc29sdmVBY3Rpb25zKG1hY2hpbmUsIGN1cnJlbnRTdGF0ZSwgdXBkYXRlZENvbnRleHQsIF9ldmVudCwgdG9BY3Rpb25PYmplY3RzKHRvQXJyYXkobWF0Y2hlZEFjdGlvbnMpLCBtYWNoaW5lLm9wdGlvbnMuYWN0aW9ucykpO1xuICAgICAgICAgIHVwZGF0ZWRDb250ZXh0ID0gcmVzb2x2ZWRbMV07XG4gICAgICAgICAgcmV0dXJuIHJlc29sdmVkWzBdO1xuICAgICAgICB9XG5cbiAgICAgIGNhc2UgcHVyZSQxOlxuICAgICAgICB7XG4gICAgICAgICAgdmFyIG1hdGNoZWRBY3Rpb25zID0gYWN0aW9uT2JqZWN0LmdldCh1cGRhdGVkQ29udGV4dCwgX2V2ZW50LmRhdGEpO1xuXG4gICAgICAgICAgaWYgKCFtYXRjaGVkQWN0aW9ucykge1xuICAgICAgICAgICAgcmV0dXJuIFtdO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIHZhciByZXNvbHZlZCA9IHJlc29sdmVBY3Rpb25zKG1hY2hpbmUsIGN1cnJlbnRTdGF0ZSwgdXBkYXRlZENvbnRleHQsIF9ldmVudCwgdG9BY3Rpb25PYmplY3RzKHRvQXJyYXkobWF0Y2hlZEFjdGlvbnMpLCBtYWNoaW5lLm9wdGlvbnMuYWN0aW9ucykpO1xuICAgICAgICAgIHVwZGF0ZWRDb250ZXh0ID0gcmVzb2x2ZWRbMV07XG4gICAgICAgICAgcmV0dXJuIHJlc29sdmVkWzBdO1xuICAgICAgICB9XG5cbiAgICAgIGNhc2Ugc3RvcCQxOlxuICAgICAgICB7XG4gICAgICAgICAgcmV0dXJuIHJlc29sdmVTdG9wKGFjdGlvbk9iamVjdCwgdXBkYXRlZENvbnRleHQsIF9ldmVudCk7XG4gICAgICAgIH1cblxuICAgICAgZGVmYXVsdDpcbiAgICAgICAgcmV0dXJuIHRvQWN0aW9uT2JqZWN0KGFjdGlvbk9iamVjdCwgbWFjaGluZS5vcHRpb25zLmFjdGlvbnMpO1xuICAgIH1cbiAgfSkpO1xuICByZXR1cm4gW3Jlc29sdmVkQWN0aW9ucywgdXBkYXRlZENvbnRleHRdO1xufVxuXG5leHBvcnQgeyBhZnRlciwgYXNzaWduLCBjYW5jZWwsIGNob29zZSwgZG9uZSwgZG9uZUludm9rZSwgZXJyb3IsIGVzY2FsYXRlLCBmb3J3YXJkVG8sIGdldEFjdGlvbkZ1bmN0aW9uLCBpbml0RXZlbnQsIGxvZywgcHVyZSwgcmFpc2UsIHJlc29sdmVBY3Rpb25zLCByZXNvbHZlTG9nLCByZXNvbHZlUmFpc2UsIHJlc29sdmVTZW5kLCByZXNvbHZlU3RvcCwgcmVzcG9uZCwgc2VuZCwgc2VuZFBhcmVudCwgc2VuZFVwZGF0ZSwgc3RhcnQsIHN0b3AsIHRvQWN0aW9uT2JqZWN0LCB0b0FjdGlvbk9iamVjdHMsIHRvQWN0aXZpdHlEZWZpbml0aW9uIH07IiwiaW1wb3J0IHsgX192YWx1ZXMsIF9fc3ByZWFkIH0gZnJvbSAnLi9fdmlydHVhbC9fdHNsaWIuanMnO1xuaW1wb3J0IHsga2V5cywgZmxhdHRlbiB9IGZyb20gJy4vdXRpbHMuanMnO1xuXG52YXIgaXNMZWFmTm9kZSA9IGZ1bmN0aW9uIChzdGF0ZU5vZGUpIHtcbiAgcmV0dXJuIHN0YXRlTm9kZS50eXBlID09PSAnYXRvbWljJyB8fCBzdGF0ZU5vZGUudHlwZSA9PT0gJ2ZpbmFsJztcbn07XG5cbmZ1bmN0aW9uIGdldENoaWxkcmVuKHN0YXRlTm9kZSkge1xuICByZXR1cm4ga2V5cyhzdGF0ZU5vZGUuc3RhdGVzKS5tYXAoZnVuY3Rpb24gKGtleSkge1xuICAgIHJldHVybiBzdGF0ZU5vZGUuc3RhdGVzW2tleV07XG4gIH0pO1xufVxuXG5mdW5jdGlvbiBnZXRBbGxTdGF0ZU5vZGVzKHN0YXRlTm9kZSkge1xuICB2YXIgc3RhdGVOb2RlcyA9IFtzdGF0ZU5vZGVdO1xuXG4gIGlmIChpc0xlYWZOb2RlKHN0YXRlTm9kZSkpIHtcbiAgICByZXR1cm4gc3RhdGVOb2RlcztcbiAgfVxuXG4gIHJldHVybiBzdGF0ZU5vZGVzLmNvbmNhdChmbGF0dGVuKGdldENoaWxkcmVuKHN0YXRlTm9kZSkubWFwKGdldEFsbFN0YXRlTm9kZXMpKSk7XG59XG5cbmZ1bmN0aW9uIGdldENvbmZpZ3VyYXRpb24ocHJldlN0YXRlTm9kZXMsIHN0YXRlTm9kZXMpIHtcbiAgdmFyIGVfMSwgX2EsIGVfMiwgX2IsIGVfMywgX2MsIGVfNCwgX2Q7XG5cbiAgdmFyIHByZXZDb25maWd1cmF0aW9uID0gbmV3IFNldChwcmV2U3RhdGVOb2Rlcyk7XG4gIHZhciBwcmV2QWRqTGlzdCA9IGdldEFkakxpc3QocHJldkNvbmZpZ3VyYXRpb24pO1xuICB2YXIgY29uZmlndXJhdGlvbiA9IG5ldyBTZXQoc3RhdGVOb2Rlcyk7XG5cbiAgdHJ5IHtcbiAgICAvLyBhZGQgYWxsIGFuY2VzdG9yc1xuICAgIGZvciAodmFyIGNvbmZpZ3VyYXRpb25fMSA9IF9fdmFsdWVzKGNvbmZpZ3VyYXRpb24pLCBjb25maWd1cmF0aW9uXzFfMSA9IGNvbmZpZ3VyYXRpb25fMS5uZXh0KCk7ICFjb25maWd1cmF0aW9uXzFfMS5kb25lOyBjb25maWd1cmF0aW9uXzFfMSA9IGNvbmZpZ3VyYXRpb25fMS5uZXh0KCkpIHtcbiAgICAgIHZhciBzID0gY29uZmlndXJhdGlvbl8xXzEudmFsdWU7XG4gICAgICB2YXIgbSA9IHMucGFyZW50O1xuXG4gICAgICB3aGlsZSAobSAmJiAhY29uZmlndXJhdGlvbi5oYXMobSkpIHtcbiAgICAgICAgY29uZmlndXJhdGlvbi5hZGQobSk7XG4gICAgICAgIG0gPSBtLnBhcmVudDtcbiAgICAgIH1cbiAgICB9XG4gIH0gY2F0Y2ggKGVfMV8xKSB7XG4gICAgZV8xID0ge1xuICAgICAgZXJyb3I6IGVfMV8xXG4gICAgfTtcbiAgfSBmaW5hbGx5IHtcbiAgICB0cnkge1xuICAgICAgaWYgKGNvbmZpZ3VyYXRpb25fMV8xICYmICFjb25maWd1cmF0aW9uXzFfMS5kb25lICYmIChfYSA9IGNvbmZpZ3VyYXRpb25fMS5yZXR1cm4pKSBfYS5jYWxsKGNvbmZpZ3VyYXRpb25fMSk7XG4gICAgfSBmaW5hbGx5IHtcbiAgICAgIGlmIChlXzEpIHRocm93IGVfMS5lcnJvcjtcbiAgICB9XG4gIH1cblxuICB2YXIgYWRqTGlzdCA9IGdldEFkakxpc3QoY29uZmlndXJhdGlvbik7XG5cbiAgdHJ5IHtcbiAgICAvLyBhZGQgZGVzY2VuZGFudHNcbiAgICBmb3IgKHZhciBjb25maWd1cmF0aW9uXzIgPSBfX3ZhbHVlcyhjb25maWd1cmF0aW9uKSwgY29uZmlndXJhdGlvbl8yXzEgPSBjb25maWd1cmF0aW9uXzIubmV4dCgpOyAhY29uZmlndXJhdGlvbl8yXzEuZG9uZTsgY29uZmlndXJhdGlvbl8yXzEgPSBjb25maWd1cmF0aW9uXzIubmV4dCgpKSB7XG4gICAgICB2YXIgcyA9IGNvbmZpZ3VyYXRpb25fMl8xLnZhbHVlOyAvLyBpZiBwcmV2aW91c2x5IGFjdGl2ZSwgYWRkIGV4aXN0aW5nIGNoaWxkIG5vZGVzXG5cbiAgICAgIGlmIChzLnR5cGUgPT09ICdjb21wb3VuZCcgJiYgKCFhZGpMaXN0LmdldChzKSB8fCAhYWRqTGlzdC5nZXQocykubGVuZ3RoKSkge1xuICAgICAgICBpZiAocHJldkFkakxpc3QuZ2V0KHMpKSB7XG4gICAgICAgICAgcHJldkFkakxpc3QuZ2V0KHMpLmZvckVhY2goZnVuY3Rpb24gKHNuKSB7XG4gICAgICAgICAgICByZXR1cm4gY29uZmlndXJhdGlvbi5hZGQoc24pO1xuICAgICAgICAgIH0pO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHMuaW5pdGlhbFN0YXRlTm9kZXMuZm9yRWFjaChmdW5jdGlvbiAoc24pIHtcbiAgICAgICAgICAgIHJldHVybiBjb25maWd1cmF0aW9uLmFkZChzbik7XG4gICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGlmIChzLnR5cGUgPT09ICdwYXJhbGxlbCcpIHtcbiAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgZm9yICh2YXIgX2UgPSAoZV8zID0gdm9pZCAwLCBfX3ZhbHVlcyhnZXRDaGlsZHJlbihzKSkpLCBfZiA9IF9lLm5leHQoKTsgIV9mLmRvbmU7IF9mID0gX2UubmV4dCgpKSB7XG4gICAgICAgICAgICAgIHZhciBjaGlsZCA9IF9mLnZhbHVlO1xuXG4gICAgICAgICAgICAgIGlmIChjaGlsZC50eXBlID09PSAnaGlzdG9yeScpIHtcbiAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgIGlmICghY29uZmlndXJhdGlvbi5oYXMoY2hpbGQpKSB7XG4gICAgICAgICAgICAgICAgY29uZmlndXJhdGlvbi5hZGQoY2hpbGQpO1xuXG4gICAgICAgICAgICAgICAgaWYgKHByZXZBZGpMaXN0LmdldChjaGlsZCkpIHtcbiAgICAgICAgICAgICAgICAgIHByZXZBZGpMaXN0LmdldChjaGlsZCkuZm9yRWFjaChmdW5jdGlvbiAoc24pIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGNvbmZpZ3VyYXRpb24uYWRkKHNuKTtcbiAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICBjaGlsZC5pbml0aWFsU3RhdGVOb2Rlcy5mb3JFYWNoKGZ1bmN0aW9uIChzbikge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gY29uZmlndXJhdGlvbi5hZGQoc24pO1xuICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSBjYXRjaCAoZV8zXzEpIHtcbiAgICAgICAgICAgIGVfMyA9IHtcbiAgICAgICAgICAgICAgZXJyb3I6IGVfM18xXG4gICAgICAgICAgICB9O1xuICAgICAgICAgIH0gZmluYWxseSB7XG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICBpZiAoX2YgJiYgIV9mLmRvbmUgJiYgKF9jID0gX2UucmV0dXJuKSkgX2MuY2FsbChfZSk7XG4gICAgICAgICAgICB9IGZpbmFsbHkge1xuICAgICAgICAgICAgICBpZiAoZV8zKSB0aHJvdyBlXzMuZXJyb3I7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICB9IGNhdGNoIChlXzJfMSkge1xuICAgIGVfMiA9IHtcbiAgICAgIGVycm9yOiBlXzJfMVxuICAgIH07XG4gIH0gZmluYWxseSB7XG4gICAgdHJ5IHtcbiAgICAgIGlmIChjb25maWd1cmF0aW9uXzJfMSAmJiAhY29uZmlndXJhdGlvbl8yXzEuZG9uZSAmJiAoX2IgPSBjb25maWd1cmF0aW9uXzIucmV0dXJuKSkgX2IuY2FsbChjb25maWd1cmF0aW9uXzIpO1xuICAgIH0gZmluYWxseSB7XG4gICAgICBpZiAoZV8yKSB0aHJvdyBlXzIuZXJyb3I7XG4gICAgfVxuICB9XG5cbiAgdHJ5IHtcbiAgICAvLyBhZGQgYWxsIGFuY2VzdG9yc1xuICAgIGZvciAodmFyIGNvbmZpZ3VyYXRpb25fMyA9IF9fdmFsdWVzKGNvbmZpZ3VyYXRpb24pLCBjb25maWd1cmF0aW9uXzNfMSA9IGNvbmZpZ3VyYXRpb25fMy5uZXh0KCk7ICFjb25maWd1cmF0aW9uXzNfMS5kb25lOyBjb25maWd1cmF0aW9uXzNfMSA9IGNvbmZpZ3VyYXRpb25fMy5uZXh0KCkpIHtcbiAgICAgIHZhciBzID0gY29uZmlndXJhdGlvbl8zXzEudmFsdWU7XG4gICAgICB2YXIgbSA9IHMucGFyZW50O1xuXG4gICAgICB3aGlsZSAobSAmJiAhY29uZmlndXJhdGlvbi5oYXMobSkpIHtcbiAgICAgICAgY29uZmlndXJhdGlvbi5hZGQobSk7XG4gICAgICAgIG0gPSBtLnBhcmVudDtcbiAgICAgIH1cbiAgICB9XG4gIH0gY2F0Y2ggKGVfNF8xKSB7XG4gICAgZV80ID0ge1xuICAgICAgZXJyb3I6IGVfNF8xXG4gICAgfTtcbiAgfSBmaW5hbGx5IHtcbiAgICB0cnkge1xuICAgICAgaWYgKGNvbmZpZ3VyYXRpb25fM18xICYmICFjb25maWd1cmF0aW9uXzNfMS5kb25lICYmIChfZCA9IGNvbmZpZ3VyYXRpb25fMy5yZXR1cm4pKSBfZC5jYWxsKGNvbmZpZ3VyYXRpb25fMyk7XG4gICAgfSBmaW5hbGx5IHtcbiAgICAgIGlmIChlXzQpIHRocm93IGVfNC5lcnJvcjtcbiAgICB9XG4gIH1cblxuICByZXR1cm4gY29uZmlndXJhdGlvbjtcbn1cblxuZnVuY3Rpb24gZ2V0VmFsdWVGcm9tQWRqKGJhc2VOb2RlLCBhZGpMaXN0KSB7XG4gIHZhciBjaGlsZFN0YXRlTm9kZXMgPSBhZGpMaXN0LmdldChiYXNlTm9kZSk7XG5cbiAgaWYgKCFjaGlsZFN0YXRlTm9kZXMpIHtcbiAgICByZXR1cm4ge307IC8vIHRvZG86IGZpeD9cbiAgfVxuXG4gIGlmIChiYXNlTm9kZS50eXBlID09PSAnY29tcG91bmQnKSB7XG4gICAgdmFyIGNoaWxkU3RhdGVOb2RlID0gY2hpbGRTdGF0ZU5vZGVzWzBdO1xuXG4gICAgaWYgKGNoaWxkU3RhdGVOb2RlKSB7XG4gICAgICBpZiAoaXNMZWFmTm9kZShjaGlsZFN0YXRlTm9kZSkpIHtcbiAgICAgICAgcmV0dXJuIGNoaWxkU3RhdGVOb2RlLmtleTtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIHt9O1xuICAgIH1cbiAgfVxuXG4gIHZhciBzdGF0ZVZhbHVlID0ge307XG4gIGNoaWxkU3RhdGVOb2Rlcy5mb3JFYWNoKGZ1bmN0aW9uIChjc24pIHtcbiAgICBzdGF0ZVZhbHVlW2Nzbi5rZXldID0gZ2V0VmFsdWVGcm9tQWRqKGNzbiwgYWRqTGlzdCk7XG4gIH0pO1xuICByZXR1cm4gc3RhdGVWYWx1ZTtcbn1cblxuZnVuY3Rpb24gZ2V0QWRqTGlzdChjb25maWd1cmF0aW9uKSB7XG4gIHZhciBlXzUsIF9hO1xuXG4gIHZhciBhZGpMaXN0ID0gbmV3IE1hcCgpO1xuXG4gIHRyeSB7XG4gICAgZm9yICh2YXIgY29uZmlndXJhdGlvbl80ID0gX192YWx1ZXMoY29uZmlndXJhdGlvbiksIGNvbmZpZ3VyYXRpb25fNF8xID0gY29uZmlndXJhdGlvbl80Lm5leHQoKTsgIWNvbmZpZ3VyYXRpb25fNF8xLmRvbmU7IGNvbmZpZ3VyYXRpb25fNF8xID0gY29uZmlndXJhdGlvbl80Lm5leHQoKSkge1xuICAgICAgdmFyIHMgPSBjb25maWd1cmF0aW9uXzRfMS52YWx1ZTtcblxuICAgICAgaWYgKCFhZGpMaXN0LmhhcyhzKSkge1xuICAgICAgICBhZGpMaXN0LnNldChzLCBbXSk7XG4gICAgICB9XG5cbiAgICAgIGlmIChzLnBhcmVudCkge1xuICAgICAgICBpZiAoIWFkakxpc3QuaGFzKHMucGFyZW50KSkge1xuICAgICAgICAgIGFkakxpc3Quc2V0KHMucGFyZW50LCBbXSk7XG4gICAgICAgIH1cblxuICAgICAgICBhZGpMaXN0LmdldChzLnBhcmVudCkucHVzaChzKTtcbiAgICAgIH1cbiAgICB9XG4gIH0gY2F0Y2ggKGVfNV8xKSB7XG4gICAgZV81ID0ge1xuICAgICAgZXJyb3I6IGVfNV8xXG4gICAgfTtcbiAgfSBmaW5hbGx5IHtcbiAgICB0cnkge1xuICAgICAgaWYgKGNvbmZpZ3VyYXRpb25fNF8xICYmICFjb25maWd1cmF0aW9uXzRfMS5kb25lICYmIChfYSA9IGNvbmZpZ3VyYXRpb25fNC5yZXR1cm4pKSBfYS5jYWxsKGNvbmZpZ3VyYXRpb25fNCk7XG4gICAgfSBmaW5hbGx5IHtcbiAgICAgIGlmIChlXzUpIHRocm93IGVfNS5lcnJvcjtcbiAgICB9XG4gIH1cblxuICByZXR1cm4gYWRqTGlzdDtcbn1cblxuZnVuY3Rpb24gZ2V0VmFsdWUocm9vdE5vZGUsIGNvbmZpZ3VyYXRpb24pIHtcbiAgdmFyIGNvbmZpZyA9IGdldENvbmZpZ3VyYXRpb24oW3Jvb3ROb2RlXSwgY29uZmlndXJhdGlvbik7XG4gIHJldHVybiBnZXRWYWx1ZUZyb21BZGoocm9vdE5vZGUsIGdldEFkakxpc3QoY29uZmlnKSk7XG59XG5cbmZ1bmN0aW9uIGhhcyhpdGVyYWJsZSwgaXRlbSkge1xuICBpZiAoQXJyYXkuaXNBcnJheShpdGVyYWJsZSkpIHtcbiAgICByZXR1cm4gaXRlcmFibGUuc29tZShmdW5jdGlvbiAobWVtYmVyKSB7XG4gICAgICByZXR1cm4gbWVtYmVyID09PSBpdGVtO1xuICAgIH0pO1xuICB9XG5cbiAgaWYgKGl0ZXJhYmxlIGluc3RhbmNlb2YgU2V0KSB7XG4gICAgcmV0dXJuIGl0ZXJhYmxlLmhhcyhpdGVtKTtcbiAgfVxuXG4gIHJldHVybiBmYWxzZTsgLy8gVE9ETzogZml4XG59XG5cbmZ1bmN0aW9uIG5leHRFdmVudHMoY29uZmlndXJhdGlvbikge1xuICByZXR1cm4gZmxhdHRlbihfX3NwcmVhZChuZXcgU2V0KGNvbmZpZ3VyYXRpb24ubWFwKGZ1bmN0aW9uIChzbikge1xuICAgIHJldHVybiBzbi5vd25FdmVudHM7XG4gIH0pKSkpO1xufVxuXG5mdW5jdGlvbiBpc0luRmluYWxTdGF0ZShjb25maWd1cmF0aW9uLCBzdGF0ZU5vZGUpIHtcbiAgaWYgKHN0YXRlTm9kZS50eXBlID09PSAnY29tcG91bmQnKSB7XG4gICAgcmV0dXJuIGdldENoaWxkcmVuKHN0YXRlTm9kZSkuc29tZShmdW5jdGlvbiAocykge1xuICAgICAgcmV0dXJuIHMudHlwZSA9PT0gJ2ZpbmFsJyAmJiBoYXMoY29uZmlndXJhdGlvbiwgcyk7XG4gICAgfSk7XG4gIH1cblxuICBpZiAoc3RhdGVOb2RlLnR5cGUgPT09ICdwYXJhbGxlbCcpIHtcbiAgICByZXR1cm4gZ2V0Q2hpbGRyZW4oc3RhdGVOb2RlKS5ldmVyeShmdW5jdGlvbiAoc24pIHtcbiAgICAgIHJldHVybiBpc0luRmluYWxTdGF0ZShjb25maWd1cmF0aW9uLCBzbik7XG4gICAgfSk7XG4gIH1cblxuICByZXR1cm4gZmFsc2U7XG59XG5cbmV4cG9ydCB7IGdldEFkakxpc3QsIGdldEFsbFN0YXRlTm9kZXMsIGdldENoaWxkcmVuLCBnZXRDb25maWd1cmF0aW9uLCBnZXRWYWx1ZSwgaGFzLCBpc0luRmluYWxTdGF0ZSwgaXNMZWFmTm9kZSwgbmV4dEV2ZW50cyB9OyIsImltcG9ydCB7IF9fc3ByZWFkLCBfX3Jlc3QsIF9fYXNzaWduIH0gZnJvbSAnLi9fdmlydHVhbC9fdHNsaWIuanMnO1xuaW1wb3J0IHsgRU1QVFlfQUNUSVZJVFlfTUFQIH0gZnJvbSAnLi9jb25zdGFudHMuanMnO1xuaW1wb3J0IHsgaXNTdHJpbmcsIG1hdGNoZXNTdGF0ZSwga2V5cyB9IGZyb20gJy4vdXRpbHMuanMnO1xuaW1wb3J0IHsgbmV4dEV2ZW50cyB9IGZyb20gJy4vc3RhdGVVdGlscy5qcyc7XG5pbXBvcnQgeyBpbml0RXZlbnQgfSBmcm9tICcuL2FjdGlvbnMuanMnO1xuXG5mdW5jdGlvbiBzdGF0ZVZhbHVlc0VxdWFsKGEsIGIpIHtcbiAgaWYgKGEgPT09IGIpIHtcbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxuXG4gIGlmIChhID09PSB1bmRlZmluZWQgfHwgYiA9PT0gdW5kZWZpbmVkKSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgaWYgKGlzU3RyaW5nKGEpIHx8IGlzU3RyaW5nKGIpKSB7XG4gICAgcmV0dXJuIGEgPT09IGI7XG4gIH1cblxuICB2YXIgYUtleXMgPSBrZXlzKGEpO1xuICB2YXIgYktleXMgPSBrZXlzKGIpO1xuICByZXR1cm4gYUtleXMubGVuZ3RoID09PSBiS2V5cy5sZW5ndGggJiYgYUtleXMuZXZlcnkoZnVuY3Rpb24gKGtleSkge1xuICAgIHJldHVybiBzdGF0ZVZhbHVlc0VxdWFsKGFba2V5XSwgYltrZXldKTtcbiAgfSk7XG59XG5cbmZ1bmN0aW9uIGlzU3RhdGUoc3RhdGUpIHtcbiAgaWYgKGlzU3RyaW5nKHN0YXRlKSkge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIHJldHVybiAndmFsdWUnIGluIHN0YXRlICYmICdoaXN0b3J5JyBpbiBzdGF0ZTtcbn1cblxuZnVuY3Rpb24gYmluZEFjdGlvblRvU3RhdGUoYWN0aW9uLCBzdGF0ZSkge1xuICB2YXIgZXhlYyA9IGFjdGlvbi5leGVjO1xuXG4gIHZhciBib3VuZEFjdGlvbiA9IF9fYXNzaWduKF9fYXNzaWduKHt9LCBhY3Rpb24pLCB7XG4gICAgZXhlYzogZXhlYyAhPT0gdW5kZWZpbmVkID8gZnVuY3Rpb24gKCkge1xuICAgICAgcmV0dXJuIGV4ZWMoc3RhdGUuY29udGV4dCwgc3RhdGUuZXZlbnQsIHtcbiAgICAgICAgYWN0aW9uOiBhY3Rpb24sXG4gICAgICAgIHN0YXRlOiBzdGF0ZSxcbiAgICAgICAgX2V2ZW50OiBzdGF0ZS5fZXZlbnRcbiAgICAgIH0pO1xuICAgIH0gOiB1bmRlZmluZWRcbiAgfSk7XG5cbiAgcmV0dXJuIGJvdW5kQWN0aW9uO1xufVxuXG52YXIgU3RhdGUgPVxuLyojX19QVVJFX18qL1xuXG4vKiogQGNsYXNzICovXG5mdW5jdGlvbiAoKSB7XG4gIC8qKlxyXG4gICAqIENyZWF0ZXMgYSBuZXcgU3RhdGUgaW5zdGFuY2UuXHJcbiAgICogQHBhcmFtIHZhbHVlIFRoZSBzdGF0ZSB2YWx1ZVxyXG4gICAqIEBwYXJhbSBjb250ZXh0IFRoZSBleHRlbmRlZCBzdGF0ZVxyXG4gICAqIEBwYXJhbSBoaXN0b3J5VmFsdWUgVGhlIHRyZWUgcmVwcmVzZW50aW5nIGhpc3RvcmljYWwgdmFsdWVzIG9mIHRoZSBzdGF0ZSBub2Rlc1xyXG4gICAqIEBwYXJhbSBoaXN0b3J5IFRoZSBwcmV2aW91cyBzdGF0ZVxyXG4gICAqIEBwYXJhbSBhY3Rpb25zIEFuIGFycmF5IG9mIGFjdGlvbiBvYmplY3RzIHRvIGV4ZWN1dGUgYXMgc2lkZS1lZmZlY3RzXHJcbiAgICogQHBhcmFtIGFjdGl2aXRpZXMgQSBtYXBwaW5nIG9mIGFjdGl2aXRpZXMgYW5kIHdoZXRoZXIgdGhleSBhcmUgc3RhcnRlZCAoYHRydWVgKSBvciBzdG9wcGVkIChgZmFsc2VgKS5cclxuICAgKiBAcGFyYW0gbWV0YVxyXG4gICAqIEBwYXJhbSBldmVudHMgSW50ZXJuYWwgZXZlbnQgcXVldWUuIFNob3VsZCBiZSBlbXB0eSB3aXRoIHJ1bi10by1jb21wbGV0aW9uIHNlbWFudGljcy5cclxuICAgKiBAcGFyYW0gY29uZmlndXJhdGlvblxyXG4gICAqL1xuICBmdW5jdGlvbiBTdGF0ZShjb25maWcpIHtcbiAgICB2YXIgX3RoaXMgPSB0aGlzO1xuXG4gICAgdGhpcy5hY3Rpb25zID0gW107XG4gICAgdGhpcy5hY3Rpdml0aWVzID0gRU1QVFlfQUNUSVZJVFlfTUFQO1xuICAgIHRoaXMubWV0YSA9IHt9O1xuICAgIHRoaXMuZXZlbnRzID0gW107XG4gICAgdGhpcy52YWx1ZSA9IGNvbmZpZy52YWx1ZTtcbiAgICB0aGlzLmNvbnRleHQgPSBjb25maWcuY29udGV4dDtcbiAgICB0aGlzLl9ldmVudCA9IGNvbmZpZy5fZXZlbnQ7XG4gICAgdGhpcy5fc2Vzc2lvbmlkID0gY29uZmlnLl9zZXNzaW9uaWQ7XG4gICAgdGhpcy5ldmVudCA9IHRoaXMuX2V2ZW50LmRhdGE7XG4gICAgdGhpcy5oaXN0b3J5VmFsdWUgPSBjb25maWcuaGlzdG9yeVZhbHVlO1xuICAgIHRoaXMuaGlzdG9yeSA9IGNvbmZpZy5oaXN0b3J5O1xuICAgIHRoaXMuYWN0aW9ucyA9IGNvbmZpZy5hY3Rpb25zIHx8IFtdO1xuICAgIHRoaXMuYWN0aXZpdGllcyA9IGNvbmZpZy5hY3Rpdml0aWVzIHx8IEVNUFRZX0FDVElWSVRZX01BUDtcbiAgICB0aGlzLm1ldGEgPSBjb25maWcubWV0YSB8fCB7fTtcbiAgICB0aGlzLmV2ZW50cyA9IGNvbmZpZy5ldmVudHMgfHwgW107XG4gICAgdGhpcy5tYXRjaGVzID0gdGhpcy5tYXRjaGVzLmJpbmQodGhpcyk7XG4gICAgdGhpcy50b1N0cmluZ3MgPSB0aGlzLnRvU3RyaW5ncy5iaW5kKHRoaXMpO1xuICAgIHRoaXMuY29uZmlndXJhdGlvbiA9IGNvbmZpZy5jb25maWd1cmF0aW9uO1xuICAgIHRoaXMudHJhbnNpdGlvbnMgPSBjb25maWcudHJhbnNpdGlvbnM7XG4gICAgdGhpcy5jaGlsZHJlbiA9IGNvbmZpZy5jaGlsZHJlbjtcbiAgICB0aGlzLmRvbmUgPSAhIWNvbmZpZy5kb25lO1xuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0aGlzLCAnbmV4dEV2ZW50cycsIHtcbiAgICAgIGdldDogZnVuY3Rpb24gKCkge1xuICAgICAgICByZXR1cm4gbmV4dEV2ZW50cyhfdGhpcy5jb25maWd1cmF0aW9uKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuICAvKipcclxuICAgKiBDcmVhdGVzIGEgbmV3IFN0YXRlIGluc3RhbmNlIGZvciB0aGUgZ2l2ZW4gYHN0YXRlVmFsdWVgIGFuZCBgY29udGV4dGAuXHJcbiAgICogQHBhcmFtIHN0YXRlVmFsdWVcclxuICAgKiBAcGFyYW0gY29udGV4dFxyXG4gICAqL1xuXG5cbiAgU3RhdGUuZnJvbSA9IGZ1bmN0aW9uIChzdGF0ZVZhbHVlLCBjb250ZXh0KSB7XG4gICAgaWYgKHN0YXRlVmFsdWUgaW5zdGFuY2VvZiBTdGF0ZSkge1xuICAgICAgaWYgKHN0YXRlVmFsdWUuY29udGV4dCAhPT0gY29udGV4dCkge1xuICAgICAgICByZXR1cm4gbmV3IFN0YXRlKHtcbiAgICAgICAgICB2YWx1ZTogc3RhdGVWYWx1ZS52YWx1ZSxcbiAgICAgICAgICBjb250ZXh0OiBjb250ZXh0LFxuICAgICAgICAgIF9ldmVudDogc3RhdGVWYWx1ZS5fZXZlbnQsXG4gICAgICAgICAgX3Nlc3Npb25pZDogbnVsbCxcbiAgICAgICAgICBoaXN0b3J5VmFsdWU6IHN0YXRlVmFsdWUuaGlzdG9yeVZhbHVlLFxuICAgICAgICAgIGhpc3Rvcnk6IHN0YXRlVmFsdWUuaGlzdG9yeSxcbiAgICAgICAgICBhY3Rpb25zOiBbXSxcbiAgICAgICAgICBhY3Rpdml0aWVzOiBzdGF0ZVZhbHVlLmFjdGl2aXRpZXMsXG4gICAgICAgICAgbWV0YToge30sXG4gICAgICAgICAgZXZlbnRzOiBbXSxcbiAgICAgICAgICBjb25maWd1cmF0aW9uOiBbXSxcbiAgICAgICAgICB0cmFuc2l0aW9uczogW10sXG4gICAgICAgICAgY2hpbGRyZW46IHt9XG4gICAgICAgIH0pO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gc3RhdGVWYWx1ZTtcbiAgICB9XG5cbiAgICB2YXIgX2V2ZW50ID0gaW5pdEV2ZW50O1xuICAgIHJldHVybiBuZXcgU3RhdGUoe1xuICAgICAgdmFsdWU6IHN0YXRlVmFsdWUsXG4gICAgICBjb250ZXh0OiBjb250ZXh0LFxuICAgICAgX2V2ZW50OiBfZXZlbnQsXG4gICAgICBfc2Vzc2lvbmlkOiBudWxsLFxuICAgICAgaGlzdG9yeVZhbHVlOiB1bmRlZmluZWQsXG4gICAgICBoaXN0b3J5OiB1bmRlZmluZWQsXG4gICAgICBhY3Rpb25zOiBbXSxcbiAgICAgIGFjdGl2aXRpZXM6IHVuZGVmaW5lZCxcbiAgICAgIG1ldGE6IHVuZGVmaW5lZCxcbiAgICAgIGV2ZW50czogW10sXG4gICAgICBjb25maWd1cmF0aW9uOiBbXSxcbiAgICAgIHRyYW5zaXRpb25zOiBbXSxcbiAgICAgIGNoaWxkcmVuOiB7fVxuICAgIH0pO1xuICB9O1xuICAvKipcclxuICAgKiBDcmVhdGVzIGEgbmV3IFN0YXRlIGluc3RhbmNlIGZvciB0aGUgZ2l2ZW4gYGNvbmZpZ2AuXHJcbiAgICogQHBhcmFtIGNvbmZpZyBUaGUgc3RhdGUgY29uZmlnXHJcbiAgICovXG5cblxuICBTdGF0ZS5jcmVhdGUgPSBmdW5jdGlvbiAoY29uZmlnKSB7XG4gICAgcmV0dXJuIG5ldyBTdGF0ZShjb25maWcpO1xuICB9O1xuICAvKipcclxuICAgKiBDcmVhdGVzIGEgbmV3IGBTdGF0ZWAgaW5zdGFuY2UgZm9yIHRoZSBnaXZlbiBgc3RhdGVWYWx1ZWAgYW5kIGBjb250ZXh0YCB3aXRoIG5vIGFjdGlvbnMgKHNpZGUtZWZmZWN0cykuXHJcbiAgICogQHBhcmFtIHN0YXRlVmFsdWVcclxuICAgKiBAcGFyYW0gY29udGV4dFxyXG4gICAqL1xuXG5cbiAgU3RhdGUuaW5lcnQgPSBmdW5jdGlvbiAoc3RhdGVWYWx1ZSwgY29udGV4dCkge1xuICAgIGlmIChzdGF0ZVZhbHVlIGluc3RhbmNlb2YgU3RhdGUpIHtcbiAgICAgIGlmICghc3RhdGVWYWx1ZS5hY3Rpb25zLmxlbmd0aCkge1xuICAgICAgICByZXR1cm4gc3RhdGVWYWx1ZTtcbiAgICAgIH1cblxuICAgICAgdmFyIF9ldmVudCA9IGluaXRFdmVudDtcbiAgICAgIHJldHVybiBuZXcgU3RhdGUoe1xuICAgICAgICB2YWx1ZTogc3RhdGVWYWx1ZS52YWx1ZSxcbiAgICAgICAgY29udGV4dDogY29udGV4dCxcbiAgICAgICAgX2V2ZW50OiBfZXZlbnQsXG4gICAgICAgIF9zZXNzaW9uaWQ6IG51bGwsXG4gICAgICAgIGhpc3RvcnlWYWx1ZTogc3RhdGVWYWx1ZS5oaXN0b3J5VmFsdWUsXG4gICAgICAgIGhpc3Rvcnk6IHN0YXRlVmFsdWUuaGlzdG9yeSxcbiAgICAgICAgYWN0aXZpdGllczogc3RhdGVWYWx1ZS5hY3Rpdml0aWVzLFxuICAgICAgICBjb25maWd1cmF0aW9uOiBzdGF0ZVZhbHVlLmNvbmZpZ3VyYXRpb24sXG4gICAgICAgIHRyYW5zaXRpb25zOiBbXSxcbiAgICAgICAgY2hpbGRyZW46IHt9XG4gICAgICB9KTtcbiAgICB9XG5cbiAgICByZXR1cm4gU3RhdGUuZnJvbShzdGF0ZVZhbHVlLCBjb250ZXh0KTtcbiAgfTtcbiAgLyoqXHJcbiAgICogUmV0dXJucyBhbiBhcnJheSBvZiBhbGwgdGhlIHN0cmluZyBsZWFmIHN0YXRlIG5vZGUgcGF0aHMuXHJcbiAgICogQHBhcmFtIHN0YXRlVmFsdWVcclxuICAgKiBAcGFyYW0gZGVsaW1pdGVyIFRoZSBjaGFyYWN0ZXIocykgdGhhdCBzZXBhcmF0ZSBlYWNoIHN1YnBhdGggaW4gdGhlIHN0cmluZyBzdGF0ZSBub2RlIHBhdGguXHJcbiAgICovXG5cblxuICBTdGF0ZS5wcm90b3R5cGUudG9TdHJpbmdzID0gZnVuY3Rpb24gKHN0YXRlVmFsdWUsIGRlbGltaXRlcikge1xuICAgIHZhciBfdGhpcyA9IHRoaXM7XG5cbiAgICBpZiAoc3RhdGVWYWx1ZSA9PT0gdm9pZCAwKSB7XG4gICAgICBzdGF0ZVZhbHVlID0gdGhpcy52YWx1ZTtcbiAgICB9XG5cbiAgICBpZiAoZGVsaW1pdGVyID09PSB2b2lkIDApIHtcbiAgICAgIGRlbGltaXRlciA9ICcuJztcbiAgICB9XG5cbiAgICBpZiAoaXNTdHJpbmcoc3RhdGVWYWx1ZSkpIHtcbiAgICAgIHJldHVybiBbc3RhdGVWYWx1ZV07XG4gICAgfVxuXG4gICAgdmFyIHZhbHVlS2V5cyA9IGtleXMoc3RhdGVWYWx1ZSk7XG4gICAgcmV0dXJuIHZhbHVlS2V5cy5jb25jYXQuYXBwbHkodmFsdWVLZXlzLCBfX3NwcmVhZCh2YWx1ZUtleXMubWFwKGZ1bmN0aW9uIChrZXkpIHtcbiAgICAgIHJldHVybiBfdGhpcy50b1N0cmluZ3Moc3RhdGVWYWx1ZVtrZXldLCBkZWxpbWl0ZXIpLm1hcChmdW5jdGlvbiAocykge1xuICAgICAgICByZXR1cm4ga2V5ICsgZGVsaW1pdGVyICsgcztcbiAgICAgIH0pO1xuICAgIH0pKSk7XG4gIH07XG5cbiAgU3RhdGUucHJvdG90eXBlLnRvSlNPTiA9IGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgX2EgPSB0aGlzLFxuICAgICAgICBjb25maWd1cmF0aW9uID0gX2EuY29uZmlndXJhdGlvbixcbiAgICAgICAgdHJhbnNpdGlvbnMgPSBfYS50cmFuc2l0aW9ucyxcbiAgICAgICAganNvblZhbHVlcyA9IF9fcmVzdChfYSwgW1wiY29uZmlndXJhdGlvblwiLCBcInRyYW5zaXRpb25zXCJdKTtcblxuICAgIHJldHVybiBqc29uVmFsdWVzO1xuICB9O1xuICAvKipcclxuICAgKiBXaGV0aGVyIHRoZSBjdXJyZW50IHN0YXRlIHZhbHVlIGlzIGEgc3Vic2V0IG9mIHRoZSBnaXZlbiBwYXJlbnQgc3RhdGUgdmFsdWUuXHJcbiAgICogQHBhcmFtIHBhcmVudFN0YXRlVmFsdWVcclxuICAgKi9cblxuXG4gIFN0YXRlLnByb3RvdHlwZS5tYXRjaGVzID0gZnVuY3Rpb24gKHBhcmVudFN0YXRlVmFsdWUpIHtcbiAgICByZXR1cm4gbWF0Y2hlc1N0YXRlKHBhcmVudFN0YXRlVmFsdWUsIHRoaXMudmFsdWUpO1xuICB9O1xuXG4gIHJldHVybiBTdGF0ZTtcbn0oKTtcblxuZXhwb3J0IHsgU3RhdGUsIGJpbmRBY3Rpb25Ub1N0YXRlLCBpc1N0YXRlLCBzdGF0ZVZhbHVlc0VxdWFsIH07IiwiLyoqXHJcbiAqIE1haW50YWlucyBhIHN0YWNrIG9mIHRoZSBjdXJyZW50IHNlcnZpY2UgaW4gc2NvcGUuXHJcbiAqIFRoaXMgaXMgdXNlZCB0byBwcm92aWRlIHRoZSBjb3JyZWN0IHNlcnZpY2UgdG8gc3Bhd24oKS5cclxuICovXG52YXIgc2VydmljZVN0YWNrID0gW107XG5cbnZhciBwcm92aWRlID0gZnVuY3Rpb24gKHNlcnZpY2UsIGZuKSB7XG4gIHNlcnZpY2VTdGFjay5wdXNoKHNlcnZpY2UpO1xuICB2YXIgcmVzdWx0ID0gZm4oc2VydmljZSk7XG4gIHNlcnZpY2VTdGFjay5wb3AoKTtcbiAgcmV0dXJuIHJlc3VsdDtcbn07XG5cbnZhciBjb25zdW1lID0gZnVuY3Rpb24gKGZuKSB7XG4gIHJldHVybiBmbihzZXJ2aWNlU3RhY2tbc2VydmljZVN0YWNrLmxlbmd0aCAtIDFdKTtcbn07XG5cbmV4cG9ydCB7IGNvbnN1bWUsIHByb3ZpZGUgfTsiLCJpbXBvcnQgeyB0b0ludm9rZVNvdXJjZSwgbWFwQ29udGV4dCwgaXNNYWNoaW5lIH0gZnJvbSAnLi91dGlscy5qcyc7XG5pbXBvcnQgeyBwcm92aWRlIH0gZnJvbSAnLi9zZXJ2aWNlU2NvcGUuanMnO1xuXG5mdW5jdGlvbiBjcmVhdGVOdWxsQWN0b3IoaWQpIHtcbiAgcmV0dXJuIHtcbiAgICBpZDogaWQsXG4gICAgc2VuZDogZnVuY3Rpb24gKCkge1xuICAgICAgcmV0dXJuIHZvaWQgMDtcbiAgICB9LFxuICAgIHN1YnNjcmliZTogZnVuY3Rpb24gKCkge1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgdW5zdWJzY3JpYmU6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICByZXR1cm4gdm9pZCAwO1xuICAgICAgICB9XG4gICAgICB9O1xuICAgIH0sXG4gICAgdG9KU09OOiBmdW5jdGlvbiAoKSB7XG4gICAgICByZXR1cm4ge1xuICAgICAgICBpZDogaWRcbiAgICAgIH07XG4gICAgfVxuICB9O1xufVxuLyoqXHJcbiAqIENyZWF0ZXMgYSBkZWZlcnJlZCBhY3RvciB0aGF0IGlzIGFibGUgdG8gYmUgaW52b2tlZCBnaXZlbiB0aGUgcHJvdmlkZWRcclxuICogaW52b2NhdGlvbiBpbmZvcm1hdGlvbiBpbiBpdHMgYC5tZXRhYCB2YWx1ZS5cclxuICpcclxuICogQHBhcmFtIGludm9rZURlZmluaXRpb24gVGhlIG1ldGEgaW5mb3JtYXRpb24gbmVlZGVkIHRvIGludm9rZSB0aGUgYWN0b3IuXHJcbiAqL1xuXG5cbmZ1bmN0aW9uIGNyZWF0ZUludm9jYWJsZUFjdG9yKGludm9rZURlZmluaXRpb24sIG1hY2hpbmUsIGNvbnRleHQsIF9ldmVudCkge1xuICB2YXIgX2E7XG5cbiAgdmFyIGludm9rZVNyYyA9IHRvSW52b2tlU291cmNlKGludm9rZURlZmluaXRpb24uc3JjKTtcbiAgdmFyIHNlcnZpY2VDcmVhdG9yID0gKF9hID0gbWFjaGluZSA9PT0gbnVsbCB8fCBtYWNoaW5lID09PSB2b2lkIDAgPyB2b2lkIDAgOiBtYWNoaW5lLm9wdGlvbnMuc2VydmljZXMpID09PSBudWxsIHx8IF9hID09PSB2b2lkIDAgPyB2b2lkIDAgOiBfYVtpbnZva2VTcmMudHlwZV07XG4gIHZhciByZXNvbHZlZERhdGEgPSBpbnZva2VEZWZpbml0aW9uLmRhdGEgPyBtYXBDb250ZXh0KGludm9rZURlZmluaXRpb24uZGF0YSwgY29udGV4dCwgX2V2ZW50KSA6IHVuZGVmaW5lZDtcbiAgdmFyIHRlbXBBY3RvciA9IHNlcnZpY2VDcmVhdG9yID8gY3JlYXRlRGVmZXJyZWRBY3RvcihzZXJ2aWNlQ3JlYXRvciwgaW52b2tlRGVmaW5pdGlvbi5pZCwgcmVzb2x2ZWREYXRhKSA6IGNyZWF0ZU51bGxBY3RvcihpbnZva2VEZWZpbml0aW9uLmlkKTtcbiAgdGVtcEFjdG9yLm1ldGEgPSBpbnZva2VEZWZpbml0aW9uO1xuICByZXR1cm4gdGVtcEFjdG9yO1xufVxuXG5mdW5jdGlvbiBjcmVhdGVEZWZlcnJlZEFjdG9yKGVudGl0eSwgaWQsIGRhdGEpIHtcbiAgdmFyIHRlbXBBY3RvciA9IGNyZWF0ZU51bGxBY3RvcihpZCk7XG4gIHRlbXBBY3Rvci5kZWZlcnJlZCA9IHRydWU7XG5cbiAgaWYgKGlzTWFjaGluZShlbnRpdHkpKSB7XG4gICAgLy8gXCJtdXRlXCIgdGhlIGV4aXN0aW5nIHNlcnZpY2Ugc2NvcGUgc28gcG90ZW50aWFsIHNwYXduZWQgYWN0b3JzIHdpdGhpbiB0aGUgYC5pbml0aWFsU3RhdGVgIHN0YXkgZGVmZXJyZWQgaGVyZVxuICAgIHRlbXBBY3Rvci5zdGF0ZSA9IHByb3ZpZGUodW5kZWZpbmVkLCBmdW5jdGlvbiAoKSB7XG4gICAgICByZXR1cm4gKGRhdGEgPyBlbnRpdHkud2l0aENvbnRleHQoZGF0YSkgOiBlbnRpdHkpLmluaXRpYWxTdGF0ZTtcbiAgICB9KTtcbiAgfVxuXG4gIHJldHVybiB0ZW1wQWN0b3I7XG59XG5cbmZ1bmN0aW9uIGlzQWN0b3IoaXRlbSkge1xuICB0cnkge1xuICAgIHJldHVybiB0eXBlb2YgaXRlbS5zZW5kID09PSAnZnVuY3Rpb24nO1xuICB9IGNhdGNoIChlKSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG59XG5cbmZ1bmN0aW9uIGlzU3Bhd25lZEFjdG9yKGl0ZW0pIHtcbiAgcmV0dXJuIGlzQWN0b3IoaXRlbSkgJiYgJ2lkJyBpbiBpdGVtO1xufVxuXG5leHBvcnQgeyBjcmVhdGVEZWZlcnJlZEFjdG9yLCBjcmVhdGVJbnZvY2FibGVBY3RvciwgY3JlYXRlTnVsbEFjdG9yLCBpc0FjdG9yLCBpc1NwYXduZWRBY3RvciB9OyIsImltcG9ydCB7IF9fYXNzaWduLCBfX3Jlc3QgfSBmcm9tICcuL192aXJ0dWFsL190c2xpYi5qcyc7XG5pbXBvcnQgeyBpbnZva2UgfSBmcm9tICcuL2FjdGlvblR5cGVzLmpzJztcbmltcG9ydCAnLi9hY3Rpb25zLmpzJztcblxuZnVuY3Rpb24gdG9JbnZva2VTb3VyY2Uoc3JjKSB7XG4gIGlmICh0eXBlb2Ygc3JjID09PSAnc3RyaW5nJykge1xuICAgIHZhciBzaW1wbGVTcmMgPSB7XG4gICAgICB0eXBlOiBzcmNcbiAgICB9O1xuXG4gICAgc2ltcGxlU3JjLnRvU3RyaW5nID0gZnVuY3Rpb24gKCkge1xuICAgICAgcmV0dXJuIHNyYztcbiAgICB9OyAvLyB2NCBjb21wYXQgLSBUT0RPOiByZW1vdmUgaW4gdjVcblxuXG4gICAgcmV0dXJuIHNpbXBsZVNyYztcbiAgfVxuXG4gIHJldHVybiBzcmM7XG59XG5cbmZ1bmN0aW9uIHRvSW52b2tlRGVmaW5pdGlvbihpbnZva2VDb25maWcpIHtcbiAgcmV0dXJuIF9fYXNzaWduKF9fYXNzaWduKHtcbiAgICB0eXBlOiBpbnZva2VcbiAgfSwgaW52b2tlQ29uZmlnKSwge1xuICAgIHRvSlNPTjogZnVuY3Rpb24gKCkge1xuICAgICAgdmFyIG9uRG9uZSA9IGludm9rZUNvbmZpZy5vbkRvbmUsXG4gICAgICAgICAgb25FcnJvciA9IGludm9rZUNvbmZpZy5vbkVycm9yLFxuICAgICAgICAgIGludm9rZURlZiA9IF9fcmVzdChpbnZva2VDb25maWcsIFtcIm9uRG9uZVwiLCBcIm9uRXJyb3JcIl0pO1xuXG4gICAgICByZXR1cm4gX19hc3NpZ24oX19hc3NpZ24oe30sIGludm9rZURlZiksIHtcbiAgICAgICAgdHlwZTogaW52b2tlLFxuICAgICAgICBzcmM6IHRvSW52b2tlU291cmNlKGludm9rZUNvbmZpZy5zcmMpXG4gICAgICB9KTtcbiAgICB9XG4gIH0pO1xufVxuXG5leHBvcnQgeyB0b0ludm9rZURlZmluaXRpb24sIHRvSW52b2tlU291cmNlIH07IiwiaW1wb3J0IHsgX19hc3NpZ24sIF9fdmFsdWVzLCBfX3NwcmVhZCwgX19yZWFkLCBfX3Jlc3QgfSBmcm9tICcuL192aXJ0dWFsL190c2xpYi5qcyc7XG5pbXBvcnQgeyBTVEFURV9ERUxJTUlURVIgfSBmcm9tICcuL2NvbnN0YW50cy5qcyc7XG5pbXBvcnQgeyBJU19QUk9EVUNUSU9OIH0gZnJvbSAnLi9lbnZpcm9ubWVudC5qcyc7XG5pbXBvcnQgeyBtYXBWYWx1ZXMsIGlzQXJyYXksIGZsYXR0ZW4sIGtleXMsIHRvQXJyYXksIHRvU3RhdGVWYWx1ZSwgaXNTdHJpbmcsIGdldEV2ZW50VHlwZSwgbWF0Y2hlc1N0YXRlLCBwYXRoLCBldmFsdWF0ZUd1YXJkLCBtYXBDb250ZXh0LCB0b1NDWE1MRXZlbnQsIHBhdGhUb1N0YXRlVmFsdWUsIGlzQnVpbHRJbkV2ZW50LCBwYXJ0aXRpb24sIHVwZGF0ZUhpc3RvcnlWYWx1ZSwgdG9TdGF0ZVBhdGgsIG1hcEZpbHRlclZhbHVlcywgd2FybiwgdG9TdGF0ZVBhdGhzLCBuZXN0ZWRQYXRoLCBub3JtYWxpemVUYXJnZXQsIHRvR3VhcmQsIHRvVHJhbnNpdGlvbkNvbmZpZ0FycmF5LCBpc01hY2hpbmUsIGlzRnVuY3Rpb24gfSBmcm9tICcuL3V0aWxzLmpzJztcbmltcG9ydCB7IFNwZWNpYWxUYXJnZXRzIH0gZnJvbSAnLi90eXBlcy5qcyc7XG5pbXBvcnQgeyBnZXRBbGxTdGF0ZU5vZGVzLCBnZXRDb25maWd1cmF0aW9uLCBpc0luRmluYWxTdGF0ZSwgaGFzLCBnZXRDaGlsZHJlbiwgZ2V0VmFsdWUsIGlzTGVhZk5vZGUgfSBmcm9tICcuL3N0YXRlVXRpbHMuanMnO1xuaW1wb3J0IHsgc3RhcnQgYXMgc3RhcnQkMSwgc3RvcCBhcyBzdG9wJDEsIGludm9rZSwgdXBkYXRlLCBudWxsRXZlbnQsIHJhaXNlIGFzIHJhaXNlJDEsIHNlbmQgYXMgc2VuZCQxIH0gZnJvbSAnLi9hY3Rpb25UeXBlcy5qcyc7XG5pbXBvcnQgeyBkb25lLCBzdGFydCwgcmFpc2UsIHN0b3AsIHRvQWN0aW9uT2JqZWN0cywgcmVzb2x2ZUFjdGlvbnMsIGRvbmVJbnZva2UsIGVycm9yLCB0b0FjdGlvbk9iamVjdCwgdG9BY3Rpdml0eURlZmluaXRpb24sIGFmdGVyLCBzZW5kLCBjYW5jZWwsIGluaXRFdmVudCB9IGZyb20gJy4vYWN0aW9ucy5qcyc7XG5pbXBvcnQgeyBTdGF0ZSwgc3RhdGVWYWx1ZXNFcXVhbCB9IGZyb20gJy4vU3RhdGUuanMnO1xuaW1wb3J0IHsgY3JlYXRlSW52b2NhYmxlQWN0b3IgfSBmcm9tICcuL0FjdG9yLmpzJztcbmltcG9ydCB7IHRvSW52b2tlRGVmaW5pdGlvbiB9IGZyb20gJy4vaW52b2tlVXRpbHMuanMnO1xudmFyIE5VTExfRVZFTlQgPSAnJztcbnZhciBTVEFURV9JREVOVElGSUVSID0gJyMnO1xudmFyIFdJTERDQVJEID0gJyonO1xudmFyIEVNUFRZX09CSkVDVCA9IHt9O1xuXG52YXIgaXNTdGF0ZUlkID0gZnVuY3Rpb24gKHN0cikge1xuICByZXR1cm4gc3RyWzBdID09PSBTVEFURV9JREVOVElGSUVSO1xufTtcblxudmFyIGNyZWF0ZURlZmF1bHRPcHRpb25zID0gZnVuY3Rpb24gKCkge1xuICByZXR1cm4ge1xuICAgIGFjdGlvbnM6IHt9LFxuICAgIGd1YXJkczoge30sXG4gICAgc2VydmljZXM6IHt9LFxuICAgIGFjdGl2aXRpZXM6IHt9LFxuICAgIGRlbGF5czoge31cbiAgfTtcbn07XG5cbnZhciB2YWxpZGF0ZUFycmF5aWZpZWRUcmFuc2l0aW9ucyA9IGZ1bmN0aW9uIChzdGF0ZU5vZGUsIGV2ZW50LCB0cmFuc2l0aW9ucykge1xuICB2YXIgaGFzTm9uTGFzdFVuZ3VhcmRlZFRhcmdldCA9IHRyYW5zaXRpb25zLnNsaWNlKDAsIC0xKS5zb21lKGZ1bmN0aW9uICh0cmFuc2l0aW9uKSB7XG4gICAgcmV0dXJuICEoJ2NvbmQnIGluIHRyYW5zaXRpb24pICYmICEoJ2luJyBpbiB0cmFuc2l0aW9uKSAmJiAoaXNTdHJpbmcodHJhbnNpdGlvbi50YXJnZXQpIHx8IGlzTWFjaGluZSh0cmFuc2l0aW9uLnRhcmdldCkpO1xuICB9KTtcbiAgdmFyIGV2ZW50VGV4dCA9IGV2ZW50ID09PSBOVUxMX0VWRU5UID8gJ3RoZSB0cmFuc2llbnQgZXZlbnQnIDogXCJldmVudCAnXCIgKyBldmVudCArIFwiJ1wiO1xuICB3YXJuKCFoYXNOb25MYXN0VW5ndWFyZGVkVGFyZ2V0LCBcIk9uZSBvciBtb3JlIHRyYW5zaXRpb25zIGZvciBcIiArIGV2ZW50VGV4dCArIFwiIG9uIHN0YXRlICdcIiArIHN0YXRlTm9kZS5pZCArIFwiJyBhcmUgdW5yZWFjaGFibGUuIFwiICsgXCJNYWtlIHN1cmUgdGhhdCB0aGUgZGVmYXVsdCB0cmFuc2l0aW9uIGlzIHRoZSBsYXN0IG9uZSBkZWZpbmVkLlwiKTtcbn07XG5cbnZhciBTdGF0ZU5vZGUgPVxuLyojX19QVVJFX18qL1xuXG4vKiogQGNsYXNzICovXG5mdW5jdGlvbiAoKSB7XG4gIGZ1bmN0aW9uIFN0YXRlTm9kZShcbiAgLyoqXHJcbiAgICogVGhlIHJhdyBjb25maWcgdXNlZCB0byBjcmVhdGUgdGhlIG1hY2hpbmUuXHJcbiAgICovXG4gIGNvbmZpZywgb3B0aW9ucyxcbiAgLyoqXHJcbiAgICogVGhlIGluaXRpYWwgZXh0ZW5kZWQgc3RhdGVcclxuICAgKi9cbiAgY29udGV4dCkge1xuICAgIHZhciBfdGhpcyA9IHRoaXM7XG5cbiAgICB0aGlzLmNvbmZpZyA9IGNvbmZpZztcbiAgICB0aGlzLmNvbnRleHQgPSBjb250ZXh0O1xuICAgIC8qKlxyXG4gICAgICogVGhlIG9yZGVyIHRoaXMgc3RhdGUgbm9kZSBhcHBlYXJzLiBDb3JyZXNwb25kcyB0byB0aGUgaW1wbGljaXQgU0NYTUwgZG9jdW1lbnQgb3JkZXIuXHJcbiAgICAgKi9cblxuICAgIHRoaXMub3JkZXIgPSAtMTtcbiAgICB0aGlzLl9feHN0YXRlbm9kZSA9IHRydWU7XG4gICAgdGhpcy5fX2NhY2hlID0ge1xuICAgICAgZXZlbnRzOiB1bmRlZmluZWQsXG4gICAgICByZWxhdGl2ZVZhbHVlOiBuZXcgTWFwKCksXG4gICAgICBpbml0aWFsU3RhdGVWYWx1ZTogdW5kZWZpbmVkLFxuICAgICAgaW5pdGlhbFN0YXRlOiB1bmRlZmluZWQsXG4gICAgICBvbjogdW5kZWZpbmVkLFxuICAgICAgdHJhbnNpdGlvbnM6IHVuZGVmaW5lZCxcbiAgICAgIGNhbmRpZGF0ZXM6IHt9LFxuICAgICAgZGVsYXllZFRyYW5zaXRpb25zOiB1bmRlZmluZWRcbiAgICB9O1xuICAgIHRoaXMuaWRNYXAgPSB7fTtcbiAgICB0aGlzLm9wdGlvbnMgPSBPYmplY3QuYXNzaWduKGNyZWF0ZURlZmF1bHRPcHRpb25zKCksIG9wdGlvbnMpO1xuICAgIHRoaXMucGFyZW50ID0gdGhpcy5vcHRpb25zLl9wYXJlbnQ7XG4gICAgdGhpcy5rZXkgPSB0aGlzLmNvbmZpZy5rZXkgfHwgdGhpcy5vcHRpb25zLl9rZXkgfHwgdGhpcy5jb25maWcuaWQgfHwgJyhtYWNoaW5lKSc7XG4gICAgdGhpcy5tYWNoaW5lID0gdGhpcy5wYXJlbnQgPyB0aGlzLnBhcmVudC5tYWNoaW5lIDogdGhpcztcbiAgICB0aGlzLnBhdGggPSB0aGlzLnBhcmVudCA/IHRoaXMucGFyZW50LnBhdGguY29uY2F0KHRoaXMua2V5KSA6IFtdO1xuICAgIHRoaXMuZGVsaW1pdGVyID0gdGhpcy5jb25maWcuZGVsaW1pdGVyIHx8ICh0aGlzLnBhcmVudCA/IHRoaXMucGFyZW50LmRlbGltaXRlciA6IFNUQVRFX0RFTElNSVRFUik7XG4gICAgdGhpcy5pZCA9IHRoaXMuY29uZmlnLmlkIHx8IF9fc3ByZWFkKFt0aGlzLm1hY2hpbmUua2V5XSwgdGhpcy5wYXRoKS5qb2luKHRoaXMuZGVsaW1pdGVyKTtcbiAgICB0aGlzLnZlcnNpb24gPSB0aGlzLnBhcmVudCA/IHRoaXMucGFyZW50LnZlcnNpb24gOiB0aGlzLmNvbmZpZy52ZXJzaW9uO1xuICAgIHRoaXMudHlwZSA9IHRoaXMuY29uZmlnLnR5cGUgfHwgKHRoaXMuY29uZmlnLnBhcmFsbGVsID8gJ3BhcmFsbGVsJyA6IHRoaXMuY29uZmlnLnN0YXRlcyAmJiBrZXlzKHRoaXMuY29uZmlnLnN0YXRlcykubGVuZ3RoID8gJ2NvbXBvdW5kJyA6IHRoaXMuY29uZmlnLmhpc3RvcnkgPyAnaGlzdG9yeScgOiAnYXRvbWljJyk7XG5cbiAgICBpZiAoIUlTX1BST0RVQ1RJT04pIHtcbiAgICAgIHdhcm4oISgncGFyYWxsZWwnIGluIHRoaXMuY29uZmlnKSwgXCJUaGUgXFxcInBhcmFsbGVsXFxcIiBwcm9wZXJ0eSBpcyBkZXByZWNhdGVkIGFuZCB3aWxsIGJlIHJlbW92ZWQgaW4gdmVyc2lvbiA0LjEuIFwiICsgKHRoaXMuY29uZmlnLnBhcmFsbGVsID8gXCJSZXBsYWNlIHdpdGggYHR5cGU6ICdwYXJhbGxlbCdgXCIgOiBcIlVzZSBgdHlwZTogJ1wiICsgdGhpcy50eXBlICsgXCInYFwiKSArIFwiIGluIHRoZSBjb25maWcgZm9yIHN0YXRlIG5vZGUgJ1wiICsgdGhpcy5pZCArIFwiJyBpbnN0ZWFkLlwiKTtcbiAgICB9XG5cbiAgICB0aGlzLmluaXRpYWwgPSB0aGlzLmNvbmZpZy5pbml0aWFsO1xuICAgIHRoaXMuc3RhdGVzID0gdGhpcy5jb25maWcuc3RhdGVzID8gbWFwVmFsdWVzKHRoaXMuY29uZmlnLnN0YXRlcywgZnVuY3Rpb24gKHN0YXRlQ29uZmlnLCBrZXkpIHtcbiAgICAgIHZhciBfYTtcblxuICAgICAgdmFyIHN0YXRlTm9kZSA9IG5ldyBTdGF0ZU5vZGUoc3RhdGVDb25maWcsIHtcbiAgICAgICAgX3BhcmVudDogX3RoaXMsXG4gICAgICAgIF9rZXk6IGtleVxuICAgICAgfSk7XG4gICAgICBPYmplY3QuYXNzaWduKF90aGlzLmlkTWFwLCBfX2Fzc2lnbigoX2EgPSB7fSwgX2Fbc3RhdGVOb2RlLmlkXSA9IHN0YXRlTm9kZSwgX2EpLCBzdGF0ZU5vZGUuaWRNYXApKTtcbiAgICAgIHJldHVybiBzdGF0ZU5vZGU7XG4gICAgfSkgOiBFTVBUWV9PQkpFQ1Q7IC8vIERvY3VtZW50IG9yZGVyXG5cbiAgICB2YXIgb3JkZXIgPSAwO1xuXG4gICAgZnVuY3Rpb24gZGZzKHN0YXRlTm9kZSkge1xuICAgICAgdmFyIGVfMSwgX2E7XG5cbiAgICAgIHN0YXRlTm9kZS5vcmRlciA9IG9yZGVyKys7XG5cbiAgICAgIHRyeSB7XG4gICAgICAgIGZvciAodmFyIF9iID0gX192YWx1ZXMoZ2V0Q2hpbGRyZW4oc3RhdGVOb2RlKSksIF9jID0gX2IubmV4dCgpOyAhX2MuZG9uZTsgX2MgPSBfYi5uZXh0KCkpIHtcbiAgICAgICAgICB2YXIgY2hpbGQgPSBfYy52YWx1ZTtcbiAgICAgICAgICBkZnMoY2hpbGQpO1xuICAgICAgICB9XG4gICAgICB9IGNhdGNoIChlXzFfMSkge1xuICAgICAgICBlXzEgPSB7XG4gICAgICAgICAgZXJyb3I6IGVfMV8xXG4gICAgICAgIH07XG4gICAgICB9IGZpbmFsbHkge1xuICAgICAgICB0cnkge1xuICAgICAgICAgIGlmIChfYyAmJiAhX2MuZG9uZSAmJiAoX2EgPSBfYi5yZXR1cm4pKSBfYS5jYWxsKF9iKTtcbiAgICAgICAgfSBmaW5hbGx5IHtcbiAgICAgICAgICBpZiAoZV8xKSB0aHJvdyBlXzEuZXJyb3I7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICBkZnModGhpcyk7IC8vIEhpc3RvcnkgY29uZmlnXG5cbiAgICB0aGlzLmhpc3RvcnkgPSB0aGlzLmNvbmZpZy5oaXN0b3J5ID09PSB0cnVlID8gJ3NoYWxsb3cnIDogdGhpcy5jb25maWcuaGlzdG9yeSB8fCBmYWxzZTtcbiAgICB0aGlzLl90cmFuc2llbnQgPSAhIXRoaXMuY29uZmlnLmFsd2F5cyB8fCAoIXRoaXMuY29uZmlnLm9uID8gZmFsc2UgOiBBcnJheS5pc0FycmF5KHRoaXMuY29uZmlnLm9uKSA/IHRoaXMuY29uZmlnLm9uLnNvbWUoZnVuY3Rpb24gKF9hKSB7XG4gICAgICB2YXIgZXZlbnQgPSBfYS5ldmVudDtcbiAgICAgIHJldHVybiBldmVudCA9PT0gTlVMTF9FVkVOVDtcbiAgICB9KSA6IE5VTExfRVZFTlQgaW4gdGhpcy5jb25maWcub24pO1xuICAgIHRoaXMuc3RyaWN0ID0gISF0aGlzLmNvbmZpZy5zdHJpY3Q7IC8vIFRPRE86IGRlcHJlY2F0ZSAoZW50cnkpXG5cbiAgICB0aGlzLm9uRW50cnkgPSB0b0FycmF5KHRoaXMuY29uZmlnLmVudHJ5IHx8IHRoaXMuY29uZmlnLm9uRW50cnkpLm1hcChmdW5jdGlvbiAoYWN0aW9uKSB7XG4gICAgICByZXR1cm4gdG9BY3Rpb25PYmplY3QoYWN0aW9uKTtcbiAgICB9KTsgLy8gVE9ETzogZGVwcmVjYXRlIChleGl0KVxuXG4gICAgdGhpcy5vbkV4aXQgPSB0b0FycmF5KHRoaXMuY29uZmlnLmV4aXQgfHwgdGhpcy5jb25maWcub25FeGl0KS5tYXAoZnVuY3Rpb24gKGFjdGlvbikge1xuICAgICAgcmV0dXJuIHRvQWN0aW9uT2JqZWN0KGFjdGlvbik7XG4gICAgfSk7XG4gICAgdGhpcy5tZXRhID0gdGhpcy5jb25maWcubWV0YTtcbiAgICB0aGlzLmRvbmVEYXRhID0gdGhpcy50eXBlID09PSAnZmluYWwnID8gdGhpcy5jb25maWcuZGF0YSA6IHVuZGVmaW5lZDtcbiAgICB0aGlzLmludm9rZSA9IHRvQXJyYXkodGhpcy5jb25maWcuaW52b2tlKS5tYXAoZnVuY3Rpb24gKGludm9rZUNvbmZpZywgaSkge1xuICAgICAgdmFyIF9hLCBfYjtcblxuICAgICAgaWYgKGlzTWFjaGluZShpbnZva2VDb25maWcpKSB7XG4gICAgICAgIF90aGlzLm1hY2hpbmUub3B0aW9ucy5zZXJ2aWNlcyA9IF9fYXNzaWduKChfYSA9IHt9LCBfYVtpbnZva2VDb25maWcuaWRdID0gaW52b2tlQ29uZmlnLCBfYSksIF90aGlzLm1hY2hpbmUub3B0aW9ucy5zZXJ2aWNlcyk7XG4gICAgICAgIHJldHVybiB0b0ludm9rZURlZmluaXRpb24oe1xuICAgICAgICAgIHNyYzogaW52b2tlQ29uZmlnLmlkLFxuICAgICAgICAgIGlkOiBpbnZva2VDb25maWcuaWRcbiAgICAgICAgfSk7XG4gICAgICB9IGVsc2UgaWYgKGlzU3RyaW5nKGludm9rZUNvbmZpZy5zcmMpKSB7XG4gICAgICAgIHJldHVybiB0b0ludm9rZURlZmluaXRpb24oX19hc3NpZ24oX19hc3NpZ24oe30sIGludm9rZUNvbmZpZyksIHtcbiAgICAgICAgICBpZDogaW52b2tlQ29uZmlnLmlkIHx8IGludm9rZUNvbmZpZy5zcmMsXG4gICAgICAgICAgc3JjOiBpbnZva2VDb25maWcuc3JjXG4gICAgICAgIH0pKTtcbiAgICAgIH0gZWxzZSBpZiAoaXNNYWNoaW5lKGludm9rZUNvbmZpZy5zcmMpIHx8IGlzRnVuY3Rpb24oaW52b2tlQ29uZmlnLnNyYykpIHtcbiAgICAgICAgdmFyIGludm9rZVNyYyA9IF90aGlzLmlkICsgXCI6aW52b2NhdGlvbltcIiArIGkgKyBcIl1cIjsgLy8gVE9ETzogdXRpbCBmdW5jdGlvblxuXG4gICAgICAgIF90aGlzLm1hY2hpbmUub3B0aW9ucy5zZXJ2aWNlcyA9IF9fYXNzaWduKChfYiA9IHt9LCBfYltpbnZva2VTcmNdID0gaW52b2tlQ29uZmlnLnNyYywgX2IpLCBfdGhpcy5tYWNoaW5lLm9wdGlvbnMuc2VydmljZXMpO1xuICAgICAgICByZXR1cm4gdG9JbnZva2VEZWZpbml0aW9uKF9fYXNzaWduKF9fYXNzaWduKHtcbiAgICAgICAgICBpZDogaW52b2tlU3JjXG4gICAgICAgIH0sIGludm9rZUNvbmZpZyksIHtcbiAgICAgICAgICBzcmM6IGludm9rZVNyY1xuICAgICAgICB9KSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB2YXIgaW52b2tlU291cmNlID0gaW52b2tlQ29uZmlnLnNyYztcbiAgICAgICAgcmV0dXJuIHRvSW52b2tlRGVmaW5pdGlvbihfX2Fzc2lnbihfX2Fzc2lnbih7XG4gICAgICAgICAgaWQ6IGludm9rZVNvdXJjZS50eXBlXG4gICAgICAgIH0sIGludm9rZUNvbmZpZyksIHtcbiAgICAgICAgICBzcmM6IGludm9rZVNvdXJjZVxuICAgICAgICB9KSk7XG4gICAgICB9XG4gICAgfSk7XG4gICAgdGhpcy5hY3Rpdml0aWVzID0gdG9BcnJheSh0aGlzLmNvbmZpZy5hY3Rpdml0aWVzKS5jb25jYXQodGhpcy5pbnZva2UpLm1hcChmdW5jdGlvbiAoYWN0aXZpdHkpIHtcbiAgICAgIHJldHVybiB0b0FjdGl2aXR5RGVmaW5pdGlvbihhY3Rpdml0eSk7XG4gICAgfSk7XG4gICAgdGhpcy50cmFuc2l0aW9uID0gdGhpcy50cmFuc2l0aW9uLmJpbmQodGhpcyk7IC8vIFRPRE86IHRoaXMgaXMgdGhlIHJlYWwgZml4IGZvciBpbml0aWFsaXphdGlvbiBvbmNlXG4gICAgLy8gc3RhdGUgbm9kZSBnZXR0ZXJzIGFyZSBkZXByZWNhdGVkXG4gICAgLy8gaWYgKCF0aGlzLnBhcmVudCkge1xuICAgIC8vICAgdGhpcy5faW5pdCgpO1xuICAgIC8vIH1cbiAgfVxuXG4gIFN0YXRlTm9kZS5wcm90b3R5cGUuX2luaXQgPSBmdW5jdGlvbiAoKSB7XG4gICAgaWYgKHRoaXMuX19jYWNoZS50cmFuc2l0aW9ucykge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGdldEFsbFN0YXRlTm9kZXModGhpcykuZm9yRWFjaChmdW5jdGlvbiAoc3RhdGVOb2RlKSB7XG4gICAgICByZXR1cm4gc3RhdGVOb2RlLm9uO1xuICAgIH0pO1xuICB9O1xuICAvKipcclxuICAgKiBDbG9uZXMgdGhpcyBzdGF0ZSBtYWNoaW5lIHdpdGggY3VzdG9tIG9wdGlvbnMgYW5kIGNvbnRleHQuXHJcbiAgICpcclxuICAgKiBAcGFyYW0gb3B0aW9ucyBPcHRpb25zIChhY3Rpb25zLCBndWFyZHMsIGFjdGl2aXRpZXMsIHNlcnZpY2VzKSB0byByZWN1cnNpdmVseSBtZXJnZSB3aXRoIHRoZSBleGlzdGluZyBvcHRpb25zLlxyXG4gICAqIEBwYXJhbSBjb250ZXh0IEN1c3RvbSBjb250ZXh0ICh3aWxsIG92ZXJyaWRlIHByZWRlZmluZWQgY29udGV4dClcclxuICAgKi9cblxuXG4gIFN0YXRlTm9kZS5wcm90b3R5cGUud2l0aENvbmZpZyA9IGZ1bmN0aW9uIChvcHRpb25zLCBjb250ZXh0KSB7XG4gICAgaWYgKGNvbnRleHQgPT09IHZvaWQgMCkge1xuICAgICAgY29udGV4dCA9IHRoaXMuY29udGV4dDtcbiAgICB9XG5cbiAgICB2YXIgX2EgPSB0aGlzLm9wdGlvbnMsXG4gICAgICAgIGFjdGlvbnMgPSBfYS5hY3Rpb25zLFxuICAgICAgICBhY3Rpdml0aWVzID0gX2EuYWN0aXZpdGllcyxcbiAgICAgICAgZ3VhcmRzID0gX2EuZ3VhcmRzLFxuICAgICAgICBzZXJ2aWNlcyA9IF9hLnNlcnZpY2VzLFxuICAgICAgICBkZWxheXMgPSBfYS5kZWxheXM7XG4gICAgcmV0dXJuIG5ldyBTdGF0ZU5vZGUodGhpcy5jb25maWcsIHtcbiAgICAgIGFjdGlvbnM6IF9fYXNzaWduKF9fYXNzaWduKHt9LCBhY3Rpb25zKSwgb3B0aW9ucy5hY3Rpb25zKSxcbiAgICAgIGFjdGl2aXRpZXM6IF9fYXNzaWduKF9fYXNzaWduKHt9LCBhY3Rpdml0aWVzKSwgb3B0aW9ucy5hY3Rpdml0aWVzKSxcbiAgICAgIGd1YXJkczogX19hc3NpZ24oX19hc3NpZ24oe30sIGd1YXJkcyksIG9wdGlvbnMuZ3VhcmRzKSxcbiAgICAgIHNlcnZpY2VzOiBfX2Fzc2lnbihfX2Fzc2lnbih7fSwgc2VydmljZXMpLCBvcHRpb25zLnNlcnZpY2VzKSxcbiAgICAgIGRlbGF5czogX19hc3NpZ24oX19hc3NpZ24oe30sIGRlbGF5cyksIG9wdGlvbnMuZGVsYXlzKVxuICAgIH0sIGNvbnRleHQpO1xuICB9O1xuICAvKipcclxuICAgKiBDbG9uZXMgdGhpcyBzdGF0ZSBtYWNoaW5lIHdpdGggY3VzdG9tIGNvbnRleHQuXHJcbiAgICpcclxuICAgKiBAcGFyYW0gY29udGV4dCBDdXN0b20gY29udGV4dCAod2lsbCBvdmVycmlkZSBwcmVkZWZpbmVkIGNvbnRleHQsIG5vdCByZWN1cnNpdmUpXHJcbiAgICovXG5cblxuICBTdGF0ZU5vZGUucHJvdG90eXBlLndpdGhDb250ZXh0ID0gZnVuY3Rpb24gKGNvbnRleHQpIHtcbiAgICByZXR1cm4gbmV3IFN0YXRlTm9kZSh0aGlzLmNvbmZpZywgdGhpcy5vcHRpb25zLCBjb250ZXh0KTtcbiAgfTtcblxuICBPYmplY3QuZGVmaW5lUHJvcGVydHkoU3RhdGVOb2RlLnByb3RvdHlwZSwgXCJkZWZpbml0aW9uXCIsIHtcbiAgICAvKipcclxuICAgICAqIFRoZSB3ZWxsLXN0cnVjdHVyZWQgc3RhdGUgbm9kZSBkZWZpbml0aW9uLlxyXG4gICAgICovXG4gICAgZ2V0OiBmdW5jdGlvbiAoKSB7XG4gICAgICByZXR1cm4ge1xuICAgICAgICBpZDogdGhpcy5pZCxcbiAgICAgICAga2V5OiB0aGlzLmtleSxcbiAgICAgICAgdmVyc2lvbjogdGhpcy52ZXJzaW9uLFxuICAgICAgICBjb250ZXh0OiB0aGlzLmNvbnRleHQsXG4gICAgICAgIHR5cGU6IHRoaXMudHlwZSxcbiAgICAgICAgaW5pdGlhbDogdGhpcy5pbml0aWFsLFxuICAgICAgICBoaXN0b3J5OiB0aGlzLmhpc3RvcnksXG4gICAgICAgIHN0YXRlczogbWFwVmFsdWVzKHRoaXMuc3RhdGVzLCBmdW5jdGlvbiAoc3RhdGUpIHtcbiAgICAgICAgICByZXR1cm4gc3RhdGUuZGVmaW5pdGlvbjtcbiAgICAgICAgfSksXG4gICAgICAgIG9uOiB0aGlzLm9uLFxuICAgICAgICB0cmFuc2l0aW9uczogdGhpcy50cmFuc2l0aW9ucyxcbiAgICAgICAgZW50cnk6IHRoaXMub25FbnRyeSxcbiAgICAgICAgZXhpdDogdGhpcy5vbkV4aXQsXG4gICAgICAgIGFjdGl2aXRpZXM6IHRoaXMuYWN0aXZpdGllcyB8fCBbXSxcbiAgICAgICAgbWV0YTogdGhpcy5tZXRhLFxuICAgICAgICBvcmRlcjogdGhpcy5vcmRlciB8fCAtMSxcbiAgICAgICAgZGF0YTogdGhpcy5kb25lRGF0YSxcbiAgICAgICAgaW52b2tlOiB0aGlzLmludm9rZVxuICAgICAgfTtcbiAgICB9LFxuICAgIGVudW1lcmFibGU6IGZhbHNlLFxuICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZVxuICB9KTtcblxuICBTdGF0ZU5vZGUucHJvdG90eXBlLnRvSlNPTiA9IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gdGhpcy5kZWZpbml0aW9uO1xuICB9O1xuXG4gIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShTdGF0ZU5vZGUucHJvdG90eXBlLCBcIm9uXCIsIHtcbiAgICAvKipcclxuICAgICAqIFRoZSBtYXBwaW5nIG9mIGV2ZW50cyB0byB0cmFuc2l0aW9ucy5cclxuICAgICAqL1xuICAgIGdldDogZnVuY3Rpb24gKCkge1xuICAgICAgaWYgKHRoaXMuX19jYWNoZS5vbikge1xuICAgICAgICByZXR1cm4gdGhpcy5fX2NhY2hlLm9uO1xuICAgICAgfVxuXG4gICAgICB2YXIgdHJhbnNpdGlvbnMgPSB0aGlzLnRyYW5zaXRpb25zO1xuICAgICAgcmV0dXJuIHRoaXMuX19jYWNoZS5vbiA9IHRyYW5zaXRpb25zLnJlZHVjZShmdW5jdGlvbiAobWFwLCB0cmFuc2l0aW9uKSB7XG4gICAgICAgIG1hcFt0cmFuc2l0aW9uLmV2ZW50VHlwZV0gPSBtYXBbdHJhbnNpdGlvbi5ldmVudFR5cGVdIHx8IFtdO1xuICAgICAgICBtYXBbdHJhbnNpdGlvbi5ldmVudFR5cGVdLnB1c2godHJhbnNpdGlvbik7XG4gICAgICAgIHJldHVybiBtYXA7XG4gICAgICB9LCB7fSk7XG4gICAgfSxcbiAgICBlbnVtZXJhYmxlOiBmYWxzZSxcbiAgICBjb25maWd1cmFibGU6IHRydWVcbiAgfSk7XG4gIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShTdGF0ZU5vZGUucHJvdG90eXBlLCBcImFmdGVyXCIsIHtcbiAgICBnZXQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgIHJldHVybiB0aGlzLl9fY2FjaGUuZGVsYXllZFRyYW5zaXRpb25zIHx8ICh0aGlzLl9fY2FjaGUuZGVsYXllZFRyYW5zaXRpb25zID0gdGhpcy5nZXREZWxheWVkVHJhbnNpdGlvbnMoKSwgdGhpcy5fX2NhY2hlLmRlbGF5ZWRUcmFuc2l0aW9ucyk7XG4gICAgfSxcbiAgICBlbnVtZXJhYmxlOiBmYWxzZSxcbiAgICBjb25maWd1cmFibGU6IHRydWVcbiAgfSk7XG4gIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShTdGF0ZU5vZGUucHJvdG90eXBlLCBcInRyYW5zaXRpb25zXCIsIHtcbiAgICAvKipcclxuICAgICAqIEFsbCB0aGUgdHJhbnNpdGlvbnMgdGhhdCBjYW4gYmUgdGFrZW4gZnJvbSB0aGlzIHN0YXRlIG5vZGUuXHJcbiAgICAgKi9cbiAgICBnZXQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgIHJldHVybiB0aGlzLl9fY2FjaGUudHJhbnNpdGlvbnMgfHwgKHRoaXMuX19jYWNoZS50cmFuc2l0aW9ucyA9IHRoaXMuZm9ybWF0VHJhbnNpdGlvbnMoKSwgdGhpcy5fX2NhY2hlLnRyYW5zaXRpb25zKTtcbiAgICB9LFxuICAgIGVudW1lcmFibGU6IGZhbHNlLFxuICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZVxuICB9KTtcblxuICBTdGF0ZU5vZGUucHJvdG90eXBlLmdldENhbmRpZGF0ZXMgPSBmdW5jdGlvbiAoZXZlbnROYW1lKSB7XG4gICAgaWYgKHRoaXMuX19jYWNoZS5jYW5kaWRhdGVzW2V2ZW50TmFtZV0pIHtcbiAgICAgIHJldHVybiB0aGlzLl9fY2FjaGUuY2FuZGlkYXRlc1tldmVudE5hbWVdO1xuICAgIH1cblxuICAgIHZhciB0cmFuc2llbnQgPSBldmVudE5hbWUgPT09IE5VTExfRVZFTlQ7XG4gICAgdmFyIGNhbmRpZGF0ZXMgPSB0aGlzLnRyYW5zaXRpb25zLmZpbHRlcihmdW5jdGlvbiAodHJhbnNpdGlvbikge1xuICAgICAgdmFyIHNhbWVFdmVudFR5cGUgPSB0cmFuc2l0aW9uLmV2ZW50VHlwZSA9PT0gZXZlbnROYW1lOyAvLyBudWxsIGV2ZW50cyBzaG91bGQgb25seSBtYXRjaCBhZ2FpbnN0IGV2ZW50bGVzcyB0cmFuc2l0aW9uc1xuXG4gICAgICByZXR1cm4gdHJhbnNpZW50ID8gc2FtZUV2ZW50VHlwZSA6IHNhbWVFdmVudFR5cGUgfHwgdHJhbnNpdGlvbi5ldmVudFR5cGUgPT09IFdJTERDQVJEO1xuICAgIH0pO1xuICAgIHRoaXMuX19jYWNoZS5jYW5kaWRhdGVzW2V2ZW50TmFtZV0gPSBjYW5kaWRhdGVzO1xuICAgIHJldHVybiBjYW5kaWRhdGVzO1xuICB9O1xuICAvKipcclxuICAgKiBBbGwgZGVsYXllZCB0cmFuc2l0aW9ucyBmcm9tIHRoZSBjb25maWcuXHJcbiAgICovXG5cblxuICBTdGF0ZU5vZGUucHJvdG90eXBlLmdldERlbGF5ZWRUcmFuc2l0aW9ucyA9IGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgX3RoaXMgPSB0aGlzO1xuXG4gICAgdmFyIGFmdGVyQ29uZmlnID0gdGhpcy5jb25maWcuYWZ0ZXI7XG5cbiAgICBpZiAoIWFmdGVyQ29uZmlnKSB7XG4gICAgICByZXR1cm4gW107XG4gICAgfVxuXG4gICAgdmFyIG11dGF0ZUVudHJ5RXhpdCA9IGZ1bmN0aW9uIChkZWxheSwgaSkge1xuICAgICAgdmFyIGRlbGF5UmVmID0gaXNGdW5jdGlvbihkZWxheSkgPyBfdGhpcy5pZCArIFwiOmRlbGF5W1wiICsgaSArIFwiXVwiIDogZGVsYXk7XG4gICAgICB2YXIgZXZlbnRUeXBlID0gYWZ0ZXIoZGVsYXlSZWYsIF90aGlzLmlkKTtcblxuICAgICAgX3RoaXMub25FbnRyeS5wdXNoKHNlbmQoZXZlbnRUeXBlLCB7XG4gICAgICAgIGRlbGF5OiBkZWxheVxuICAgICAgfSkpO1xuXG4gICAgICBfdGhpcy5vbkV4aXQucHVzaChjYW5jZWwoZXZlbnRUeXBlKSk7XG5cbiAgICAgIHJldHVybiBldmVudFR5cGU7XG4gICAgfTtcblxuICAgIHZhciBkZWxheWVkVHJhbnNpdGlvbnMgPSBpc0FycmF5KGFmdGVyQ29uZmlnKSA/IGFmdGVyQ29uZmlnLm1hcChmdW5jdGlvbiAodHJhbnNpdGlvbiwgaSkge1xuICAgICAgdmFyIGV2ZW50VHlwZSA9IG11dGF0ZUVudHJ5RXhpdCh0cmFuc2l0aW9uLmRlbGF5LCBpKTtcbiAgICAgIHJldHVybiBfX2Fzc2lnbihfX2Fzc2lnbih7fSwgdHJhbnNpdGlvbiksIHtcbiAgICAgICAgZXZlbnQ6IGV2ZW50VHlwZVxuICAgICAgfSk7XG4gICAgfSkgOiBmbGF0dGVuKGtleXMoYWZ0ZXJDb25maWcpLm1hcChmdW5jdGlvbiAoZGVsYXksIGkpIHtcbiAgICAgIHZhciBjb25maWdUcmFuc2l0aW9uID0gYWZ0ZXJDb25maWdbZGVsYXldO1xuICAgICAgdmFyIHJlc29sdmVkVHJhbnNpdGlvbiA9IGlzU3RyaW5nKGNvbmZpZ1RyYW5zaXRpb24pID8ge1xuICAgICAgICB0YXJnZXQ6IGNvbmZpZ1RyYW5zaXRpb25cbiAgICAgIH0gOiBjb25maWdUcmFuc2l0aW9uO1xuICAgICAgdmFyIHJlc29sdmVkRGVsYXkgPSAhaXNOYU4oK2RlbGF5KSA/ICtkZWxheSA6IGRlbGF5O1xuICAgICAgdmFyIGV2ZW50VHlwZSA9IG11dGF0ZUVudHJ5RXhpdChyZXNvbHZlZERlbGF5LCBpKTtcbiAgICAgIHJldHVybiB0b0FycmF5KHJlc29sdmVkVHJhbnNpdGlvbikubWFwKGZ1bmN0aW9uICh0cmFuc2l0aW9uKSB7XG4gICAgICAgIHJldHVybiBfX2Fzc2lnbihfX2Fzc2lnbih7fSwgdHJhbnNpdGlvbiksIHtcbiAgICAgICAgICBldmVudDogZXZlbnRUeXBlLFxuICAgICAgICAgIGRlbGF5OiByZXNvbHZlZERlbGF5XG4gICAgICAgIH0pO1xuICAgICAgfSk7XG4gICAgfSkpO1xuICAgIHJldHVybiBkZWxheWVkVHJhbnNpdGlvbnMubWFwKGZ1bmN0aW9uIChkZWxheWVkVHJhbnNpdGlvbikge1xuICAgICAgdmFyIGRlbGF5ID0gZGVsYXllZFRyYW5zaXRpb24uZGVsYXk7XG4gICAgICByZXR1cm4gX19hc3NpZ24oX19hc3NpZ24oe30sIF90aGlzLmZvcm1hdFRyYW5zaXRpb24oZGVsYXllZFRyYW5zaXRpb24pKSwge1xuICAgICAgICBkZWxheTogZGVsYXlcbiAgICAgIH0pO1xuICAgIH0pO1xuICB9O1xuICAvKipcclxuICAgKiBSZXR1cm5zIHRoZSBzdGF0ZSBub2RlcyByZXByZXNlbnRlZCBieSB0aGUgY3VycmVudCBzdGF0ZSB2YWx1ZS5cclxuICAgKlxyXG4gICAqIEBwYXJhbSBzdGF0ZSBUaGUgc3RhdGUgdmFsdWUgb3IgU3RhdGUgaW5zdGFuY2VcclxuICAgKi9cblxuXG4gIFN0YXRlTm9kZS5wcm90b3R5cGUuZ2V0U3RhdGVOb2RlcyA9IGZ1bmN0aW9uIChzdGF0ZSkge1xuICAgIHZhciBfYTtcblxuICAgIHZhciBfdGhpcyA9IHRoaXM7XG5cbiAgICBpZiAoIXN0YXRlKSB7XG4gICAgICByZXR1cm4gW107XG4gICAgfVxuXG4gICAgdmFyIHN0YXRlVmFsdWUgPSBzdGF0ZSBpbnN0YW5jZW9mIFN0YXRlID8gc3RhdGUudmFsdWUgOiB0b1N0YXRlVmFsdWUoc3RhdGUsIHRoaXMuZGVsaW1pdGVyKTtcblxuICAgIGlmIChpc1N0cmluZyhzdGF0ZVZhbHVlKSkge1xuICAgICAgdmFyIGluaXRpYWxTdGF0ZVZhbHVlID0gdGhpcy5nZXRTdGF0ZU5vZGUoc3RhdGVWYWx1ZSkuaW5pdGlhbDtcbiAgICAgIHJldHVybiBpbml0aWFsU3RhdGVWYWx1ZSAhPT0gdW5kZWZpbmVkID8gdGhpcy5nZXRTdGF0ZU5vZGVzKChfYSA9IHt9LCBfYVtzdGF0ZVZhbHVlXSA9IGluaXRpYWxTdGF0ZVZhbHVlLCBfYSkpIDogW3RoaXMuc3RhdGVzW3N0YXRlVmFsdWVdXTtcbiAgICB9XG5cbiAgICB2YXIgc3ViU3RhdGVLZXlzID0ga2V5cyhzdGF0ZVZhbHVlKTtcbiAgICB2YXIgc3ViU3RhdGVOb2RlcyA9IHN1YlN0YXRlS2V5cy5tYXAoZnVuY3Rpb24gKHN1YlN0YXRlS2V5KSB7XG4gICAgICByZXR1cm4gX3RoaXMuZ2V0U3RhdGVOb2RlKHN1YlN0YXRlS2V5KTtcbiAgICB9KTtcbiAgICByZXR1cm4gc3ViU3RhdGVOb2Rlcy5jb25jYXQoc3ViU3RhdGVLZXlzLnJlZHVjZShmdW5jdGlvbiAoYWxsU3ViU3RhdGVOb2Rlcywgc3ViU3RhdGVLZXkpIHtcbiAgICAgIHZhciBzdWJTdGF0ZU5vZGUgPSBfdGhpcy5nZXRTdGF0ZU5vZGUoc3ViU3RhdGVLZXkpLmdldFN0YXRlTm9kZXMoc3RhdGVWYWx1ZVtzdWJTdGF0ZUtleV0pO1xuXG4gICAgICByZXR1cm4gYWxsU3ViU3RhdGVOb2Rlcy5jb25jYXQoc3ViU3RhdGVOb2RlKTtcbiAgICB9LCBbXSkpO1xuICB9O1xuICAvKipcclxuICAgKiBSZXR1cm5zIGB0cnVlYCBpZiB0aGlzIHN0YXRlIG5vZGUgZXhwbGljaXRseSBoYW5kbGVzIHRoZSBnaXZlbiBldmVudC5cclxuICAgKlxyXG4gICAqIEBwYXJhbSBldmVudCBUaGUgZXZlbnQgaW4gcXVlc3Rpb25cclxuICAgKi9cblxuXG4gIFN0YXRlTm9kZS5wcm90b3R5cGUuaGFuZGxlcyA9IGZ1bmN0aW9uIChldmVudCkge1xuICAgIHZhciBldmVudFR5cGUgPSBnZXRFdmVudFR5cGUoZXZlbnQpO1xuICAgIHJldHVybiB0aGlzLmV2ZW50cy5pbmNsdWRlcyhldmVudFR5cGUpO1xuICB9O1xuICAvKipcclxuICAgKiBSZXNvbHZlcyB0aGUgZ2l2ZW4gYHN0YXRlYCB0byBhIG5ldyBgU3RhdGVgIGluc3RhbmNlIHJlbGF0aXZlIHRvIHRoaXMgbWFjaGluZS5cclxuICAgKlxyXG4gICAqIFRoaXMgZW5zdXJlcyB0aGF0IGAuZXZlbnRzYCBhbmQgYC5uZXh0RXZlbnRzYCByZXByZXNlbnQgdGhlIGNvcnJlY3QgdmFsdWVzLlxyXG4gICAqXHJcbiAgICogQHBhcmFtIHN0YXRlIFRoZSBzdGF0ZSB0byByZXNvbHZlXHJcbiAgICovXG5cblxuICBTdGF0ZU5vZGUucHJvdG90eXBlLnJlc29sdmVTdGF0ZSA9IGZ1bmN0aW9uIChzdGF0ZSkge1xuICAgIHZhciBjb25maWd1cmF0aW9uID0gQXJyYXkuZnJvbShnZXRDb25maWd1cmF0aW9uKFtdLCB0aGlzLmdldFN0YXRlTm9kZXMoc3RhdGUudmFsdWUpKSk7XG4gICAgcmV0dXJuIG5ldyBTdGF0ZShfX2Fzc2lnbihfX2Fzc2lnbih7fSwgc3RhdGUpLCB7XG4gICAgICB2YWx1ZTogdGhpcy5yZXNvbHZlKHN0YXRlLnZhbHVlKSxcbiAgICAgIGNvbmZpZ3VyYXRpb246IGNvbmZpZ3VyYXRpb24sXG4gICAgICBkb25lOiBpc0luRmluYWxTdGF0ZShjb25maWd1cmF0aW9uLCB0aGlzKVxuICAgIH0pKTtcbiAgfTtcblxuICBTdGF0ZU5vZGUucHJvdG90eXBlLnRyYW5zaXRpb25MZWFmTm9kZSA9IGZ1bmN0aW9uIChzdGF0ZVZhbHVlLCBzdGF0ZSwgX2V2ZW50KSB7XG4gICAgdmFyIHN0YXRlTm9kZSA9IHRoaXMuZ2V0U3RhdGVOb2RlKHN0YXRlVmFsdWUpO1xuICAgIHZhciBuZXh0ID0gc3RhdGVOb2RlLm5leHQoc3RhdGUsIF9ldmVudCk7XG5cbiAgICBpZiAoIW5leHQgfHwgIW5leHQudHJhbnNpdGlvbnMubGVuZ3RoKSB7XG4gICAgICByZXR1cm4gdGhpcy5uZXh0KHN0YXRlLCBfZXZlbnQpO1xuICAgIH1cblxuICAgIHJldHVybiBuZXh0O1xuICB9O1xuXG4gIFN0YXRlTm9kZS5wcm90b3R5cGUudHJhbnNpdGlvbkNvbXBvdW5kTm9kZSA9IGZ1bmN0aW9uIChzdGF0ZVZhbHVlLCBzdGF0ZSwgX2V2ZW50KSB7XG4gICAgdmFyIHN1YlN0YXRlS2V5cyA9IGtleXMoc3RhdGVWYWx1ZSk7XG4gICAgdmFyIHN0YXRlTm9kZSA9IHRoaXMuZ2V0U3RhdGVOb2RlKHN1YlN0YXRlS2V5c1swXSk7XG5cbiAgICB2YXIgbmV4dCA9IHN0YXRlTm9kZS5fdHJhbnNpdGlvbihzdGF0ZVZhbHVlW3N1YlN0YXRlS2V5c1swXV0sIHN0YXRlLCBfZXZlbnQpO1xuXG4gICAgaWYgKCFuZXh0IHx8ICFuZXh0LnRyYW5zaXRpb25zLmxlbmd0aCkge1xuICAgICAgcmV0dXJuIHRoaXMubmV4dChzdGF0ZSwgX2V2ZW50KTtcbiAgICB9XG5cbiAgICByZXR1cm4gbmV4dDtcbiAgfTtcblxuICBTdGF0ZU5vZGUucHJvdG90eXBlLnRyYW5zaXRpb25QYXJhbGxlbE5vZGUgPSBmdW5jdGlvbiAoc3RhdGVWYWx1ZSwgc3RhdGUsIF9ldmVudCkge1xuICAgIHZhciBlXzIsIF9hO1xuXG4gICAgdmFyIHRyYW5zaXRpb25NYXAgPSB7fTtcblxuICAgIHRyeSB7XG4gICAgICBmb3IgKHZhciBfYiA9IF9fdmFsdWVzKGtleXMoc3RhdGVWYWx1ZSkpLCBfYyA9IF9iLm5leHQoKTsgIV9jLmRvbmU7IF9jID0gX2IubmV4dCgpKSB7XG4gICAgICAgIHZhciBzdWJTdGF0ZUtleSA9IF9jLnZhbHVlO1xuICAgICAgICB2YXIgc3ViU3RhdGVWYWx1ZSA9IHN0YXRlVmFsdWVbc3ViU3RhdGVLZXldO1xuXG4gICAgICAgIGlmICghc3ViU3RhdGVWYWx1ZSkge1xuICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICB9XG5cbiAgICAgICAgdmFyIHN1YlN0YXRlTm9kZSA9IHRoaXMuZ2V0U3RhdGVOb2RlKHN1YlN0YXRlS2V5KTtcblxuICAgICAgICB2YXIgbmV4dCA9IHN1YlN0YXRlTm9kZS5fdHJhbnNpdGlvbihzdWJTdGF0ZVZhbHVlLCBzdGF0ZSwgX2V2ZW50KTtcblxuICAgICAgICBpZiAobmV4dCkge1xuICAgICAgICAgIHRyYW5zaXRpb25NYXBbc3ViU3RhdGVLZXldID0gbmV4dDtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0gY2F0Y2ggKGVfMl8xKSB7XG4gICAgICBlXzIgPSB7XG4gICAgICAgIGVycm9yOiBlXzJfMVxuICAgICAgfTtcbiAgICB9IGZpbmFsbHkge1xuICAgICAgdHJ5IHtcbiAgICAgICAgaWYgKF9jICYmICFfYy5kb25lICYmIChfYSA9IF9iLnJldHVybikpIF9hLmNhbGwoX2IpO1xuICAgICAgfSBmaW5hbGx5IHtcbiAgICAgICAgaWYgKGVfMikgdGhyb3cgZV8yLmVycm9yO1xuICAgICAgfVxuICAgIH1cblxuICAgIHZhciBzdGF0ZVRyYW5zaXRpb25zID0ga2V5cyh0cmFuc2l0aW9uTWFwKS5tYXAoZnVuY3Rpb24gKGtleSkge1xuICAgICAgcmV0dXJuIHRyYW5zaXRpb25NYXBba2V5XTtcbiAgICB9KTtcbiAgICB2YXIgZW5hYmxlZFRyYW5zaXRpb25zID0gZmxhdHRlbihzdGF0ZVRyYW5zaXRpb25zLm1hcChmdW5jdGlvbiAoc3QpIHtcbiAgICAgIHJldHVybiBzdC50cmFuc2l0aW9ucztcbiAgICB9KSk7XG4gICAgdmFyIHdpbGxUcmFuc2l0aW9uID0gc3RhdGVUcmFuc2l0aW9ucy5zb21lKGZ1bmN0aW9uIChzdCkge1xuICAgICAgcmV0dXJuIHN0LnRyYW5zaXRpb25zLmxlbmd0aCA+IDA7XG4gICAgfSk7XG5cbiAgICBpZiAoIXdpbGxUcmFuc2l0aW9uKSB7XG4gICAgICByZXR1cm4gdGhpcy5uZXh0KHN0YXRlLCBfZXZlbnQpO1xuICAgIH1cblxuICAgIHZhciBlbnRyeU5vZGVzID0gZmxhdHRlbihzdGF0ZVRyYW5zaXRpb25zLm1hcChmdW5jdGlvbiAodCkge1xuICAgICAgcmV0dXJuIHQuZW50cnlTZXQ7XG4gICAgfSkpO1xuICAgIHZhciBjb25maWd1cmF0aW9uID0gZmxhdHRlbihrZXlzKHRyYW5zaXRpb25NYXApLm1hcChmdW5jdGlvbiAoa2V5KSB7XG4gICAgICByZXR1cm4gdHJhbnNpdGlvbk1hcFtrZXldLmNvbmZpZ3VyYXRpb247XG4gICAgfSkpO1xuICAgIHJldHVybiB7XG4gICAgICB0cmFuc2l0aW9uczogZW5hYmxlZFRyYW5zaXRpb25zLFxuICAgICAgZW50cnlTZXQ6IGVudHJ5Tm9kZXMsXG4gICAgICBleGl0U2V0OiBmbGF0dGVuKHN0YXRlVHJhbnNpdGlvbnMubWFwKGZ1bmN0aW9uICh0KSB7XG4gICAgICAgIHJldHVybiB0LmV4aXRTZXQ7XG4gICAgICB9KSksXG4gICAgICBjb25maWd1cmF0aW9uOiBjb25maWd1cmF0aW9uLFxuICAgICAgc291cmNlOiBzdGF0ZSxcbiAgICAgIGFjdGlvbnM6IGZsYXR0ZW4oa2V5cyh0cmFuc2l0aW9uTWFwKS5tYXAoZnVuY3Rpb24gKGtleSkge1xuICAgICAgICByZXR1cm4gdHJhbnNpdGlvbk1hcFtrZXldLmFjdGlvbnM7XG4gICAgICB9KSlcbiAgICB9O1xuICB9O1xuXG4gIFN0YXRlTm9kZS5wcm90b3R5cGUuX3RyYW5zaXRpb24gPSBmdW5jdGlvbiAoc3RhdGVWYWx1ZSwgc3RhdGUsIF9ldmVudCkge1xuICAgIC8vIGxlYWYgbm9kZVxuICAgIGlmIChpc1N0cmluZyhzdGF0ZVZhbHVlKSkge1xuICAgICAgcmV0dXJuIHRoaXMudHJhbnNpdGlvbkxlYWZOb2RlKHN0YXRlVmFsdWUsIHN0YXRlLCBfZXZlbnQpO1xuICAgIH0gLy8gaGllcmFyY2hpY2FsIG5vZGVcblxuXG4gICAgaWYgKGtleXMoc3RhdGVWYWx1ZSkubGVuZ3RoID09PSAxKSB7XG4gICAgICByZXR1cm4gdGhpcy50cmFuc2l0aW9uQ29tcG91bmROb2RlKHN0YXRlVmFsdWUsIHN0YXRlLCBfZXZlbnQpO1xuICAgIH0gLy8gb3J0aG9nb25hbCBub2RlXG5cblxuICAgIHJldHVybiB0aGlzLnRyYW5zaXRpb25QYXJhbGxlbE5vZGUoc3RhdGVWYWx1ZSwgc3RhdGUsIF9ldmVudCk7XG4gIH07XG5cbiAgU3RhdGVOb2RlLnByb3RvdHlwZS5uZXh0ID0gZnVuY3Rpb24gKHN0YXRlLCBfZXZlbnQpIHtcbiAgICB2YXIgZV8zLCBfYTtcblxuICAgIHZhciBfdGhpcyA9IHRoaXM7XG5cbiAgICB2YXIgZXZlbnROYW1lID0gX2V2ZW50Lm5hbWU7XG4gICAgdmFyIGFjdGlvbnMgPSBbXTtcbiAgICB2YXIgbmV4dFN0YXRlTm9kZXMgPSBbXTtcbiAgICB2YXIgc2VsZWN0ZWRUcmFuc2l0aW9uO1xuXG4gICAgdHJ5IHtcbiAgICAgIGZvciAodmFyIF9iID0gX192YWx1ZXModGhpcy5nZXRDYW5kaWRhdGVzKGV2ZW50TmFtZSkpLCBfYyA9IF9iLm5leHQoKTsgIV9jLmRvbmU7IF9jID0gX2IubmV4dCgpKSB7XG4gICAgICAgIHZhciBjYW5kaWRhdGUgPSBfYy52YWx1ZTtcbiAgICAgICAgdmFyIGNvbmQgPSBjYW5kaWRhdGUuY29uZCxcbiAgICAgICAgICAgIHN0YXRlSW4gPSBjYW5kaWRhdGUuaW47XG4gICAgICAgIHZhciByZXNvbHZlZENvbnRleHQgPSBzdGF0ZS5jb250ZXh0O1xuICAgICAgICB2YXIgaXNJblN0YXRlID0gc3RhdGVJbiA/IGlzU3RyaW5nKHN0YXRlSW4pICYmIGlzU3RhdGVJZChzdGF0ZUluKSA/IC8vIENoZWNrIGlmIGluIHN0YXRlIGJ5IElEXG4gICAgICAgIHN0YXRlLm1hdGNoZXModG9TdGF0ZVZhbHVlKHRoaXMuZ2V0U3RhdGVOb2RlQnlJZChzdGF0ZUluKS5wYXRoLCB0aGlzLmRlbGltaXRlcikpIDogLy8gQ2hlY2sgaWYgaW4gc3RhdGUgYnkgcmVsYXRpdmUgZ3JhbmRwYXJlbnRcbiAgICAgICAgbWF0Y2hlc1N0YXRlKHRvU3RhdGVWYWx1ZShzdGF0ZUluLCB0aGlzLmRlbGltaXRlciksIHBhdGgodGhpcy5wYXRoLnNsaWNlKDAsIC0yKSkoc3RhdGUudmFsdWUpKSA6IHRydWU7XG4gICAgICAgIHZhciBndWFyZFBhc3NlZCA9IGZhbHNlO1xuXG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgZ3VhcmRQYXNzZWQgPSAhY29uZCB8fCBldmFsdWF0ZUd1YXJkKHRoaXMubWFjaGluZSwgY29uZCwgcmVzb2x2ZWRDb250ZXh0LCBfZXZlbnQsIHN0YXRlKTtcbiAgICAgICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiVW5hYmxlIHRvIGV2YWx1YXRlIGd1YXJkICdcIiArIChjb25kLm5hbWUgfHwgY29uZC50eXBlKSArIFwiJyBpbiB0cmFuc2l0aW9uIGZvciBldmVudCAnXCIgKyBldmVudE5hbWUgKyBcIicgaW4gc3RhdGUgbm9kZSAnXCIgKyB0aGlzLmlkICsgXCInOlxcblwiICsgZXJyLm1lc3NhZ2UpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGd1YXJkUGFzc2VkICYmIGlzSW5TdGF0ZSkge1xuICAgICAgICAgIGlmIChjYW5kaWRhdGUudGFyZ2V0ICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgIG5leHRTdGF0ZU5vZGVzID0gY2FuZGlkYXRlLnRhcmdldDtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBhY3Rpb25zLnB1c2guYXBwbHkoYWN0aW9ucywgX19zcHJlYWQoY2FuZGlkYXRlLmFjdGlvbnMpKTtcbiAgICAgICAgICBzZWxlY3RlZFRyYW5zaXRpb24gPSBjYW5kaWRhdGU7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9IGNhdGNoIChlXzNfMSkge1xuICAgICAgZV8zID0ge1xuICAgICAgICBlcnJvcjogZV8zXzFcbiAgICAgIH07XG4gICAgfSBmaW5hbGx5IHtcbiAgICAgIHRyeSB7XG4gICAgICAgIGlmIChfYyAmJiAhX2MuZG9uZSAmJiAoX2EgPSBfYi5yZXR1cm4pKSBfYS5jYWxsKF9iKTtcbiAgICAgIH0gZmluYWxseSB7XG4gICAgICAgIGlmIChlXzMpIHRocm93IGVfMy5lcnJvcjtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAoIXNlbGVjdGVkVHJhbnNpdGlvbikge1xuICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgICB9XG5cbiAgICBpZiAoIW5leHRTdGF0ZU5vZGVzLmxlbmd0aCkge1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgdHJhbnNpdGlvbnM6IFtzZWxlY3RlZFRyYW5zaXRpb25dLFxuICAgICAgICBlbnRyeVNldDogW10sXG4gICAgICAgIGV4aXRTZXQ6IFtdLFxuICAgICAgICBjb25maWd1cmF0aW9uOiBzdGF0ZS52YWx1ZSA/IFt0aGlzXSA6IFtdLFxuICAgICAgICBzb3VyY2U6IHN0YXRlLFxuICAgICAgICBhY3Rpb25zOiBhY3Rpb25zXG4gICAgICB9O1xuICAgIH1cblxuICAgIHZhciBhbGxOZXh0U3RhdGVOb2RlcyA9IGZsYXR0ZW4obmV4dFN0YXRlTm9kZXMubWFwKGZ1bmN0aW9uIChzdGF0ZU5vZGUpIHtcbiAgICAgIHJldHVybiBfdGhpcy5nZXRSZWxhdGl2ZVN0YXRlTm9kZXMoc3RhdGVOb2RlLCBzdGF0ZS5oaXN0b3J5VmFsdWUpO1xuICAgIH0pKTtcbiAgICB2YXIgaXNJbnRlcm5hbCA9ICEhc2VsZWN0ZWRUcmFuc2l0aW9uLmludGVybmFsO1xuICAgIHZhciByZWVudHJ5Tm9kZXMgPSBpc0ludGVybmFsID8gW10gOiBmbGF0dGVuKGFsbE5leHRTdGF0ZU5vZGVzLm1hcChmdW5jdGlvbiAobikge1xuICAgICAgcmV0dXJuIF90aGlzLm5vZGVzRnJvbUNoaWxkKG4pO1xuICAgIH0pKTtcbiAgICByZXR1cm4ge1xuICAgICAgdHJhbnNpdGlvbnM6IFtzZWxlY3RlZFRyYW5zaXRpb25dLFxuICAgICAgZW50cnlTZXQ6IHJlZW50cnlOb2RlcyxcbiAgICAgIGV4aXRTZXQ6IGlzSW50ZXJuYWwgPyBbXSA6IFt0aGlzXSxcbiAgICAgIGNvbmZpZ3VyYXRpb246IGFsbE5leHRTdGF0ZU5vZGVzLFxuICAgICAgc291cmNlOiBzdGF0ZSxcbiAgICAgIGFjdGlvbnM6IGFjdGlvbnNcbiAgICB9O1xuICB9O1xuXG4gIFN0YXRlTm9kZS5wcm90b3R5cGUubm9kZXNGcm9tQ2hpbGQgPSBmdW5jdGlvbiAoY2hpbGRTdGF0ZU5vZGUpIHtcbiAgICBpZiAoY2hpbGRTdGF0ZU5vZGUuZXNjYXBlcyh0aGlzKSkge1xuICAgICAgcmV0dXJuIFtdO1xuICAgIH1cblxuICAgIHZhciBub2RlcyA9IFtdO1xuICAgIHZhciBtYXJrZXIgPSBjaGlsZFN0YXRlTm9kZTtcblxuICAgIHdoaWxlIChtYXJrZXIgJiYgbWFya2VyICE9PSB0aGlzKSB7XG4gICAgICBub2Rlcy5wdXNoKG1hcmtlcik7XG4gICAgICBtYXJrZXIgPSBtYXJrZXIucGFyZW50O1xuICAgIH1cblxuICAgIG5vZGVzLnB1c2godGhpcyk7IC8vIGluY2x1c2l2ZVxuXG4gICAgcmV0dXJuIG5vZGVzO1xuICB9O1xuICAvKipcclxuICAgKiBXaGV0aGVyIHRoZSBnaXZlbiBzdGF0ZSBub2RlIFwiZXNjYXBlc1wiIHRoaXMgc3RhdGUgbm9kZS4gSWYgdGhlIGBzdGF0ZU5vZGVgIGlzIGVxdWFsIHRvIG9yIHRoZSBwYXJlbnQgb2ZcclxuICAgKiB0aGlzIHN0YXRlIG5vZGUsIGl0IGRvZXMgbm90IGVzY2FwZS5cclxuICAgKi9cblxuXG4gIFN0YXRlTm9kZS5wcm90b3R5cGUuZXNjYXBlcyA9IGZ1bmN0aW9uIChzdGF0ZU5vZGUpIHtcbiAgICBpZiAodGhpcyA9PT0gc3RhdGVOb2RlKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgdmFyIHBhcmVudCA9IHRoaXMucGFyZW50O1xuXG4gICAgd2hpbGUgKHBhcmVudCkge1xuICAgICAgaWYgKHBhcmVudCA9PT0gc3RhdGVOb2RlKSB7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgIH1cblxuICAgICAgcGFyZW50ID0gcGFyZW50LnBhcmVudDtcbiAgICB9XG5cbiAgICByZXR1cm4gdHJ1ZTtcbiAgfTtcblxuICBTdGF0ZU5vZGUucHJvdG90eXBlLmdldEFjdGlvbnMgPSBmdW5jdGlvbiAodHJhbnNpdGlvbiwgY3VycmVudENvbnRleHQsIF9ldmVudCwgcHJldlN0YXRlKSB7XG4gICAgdmFyIGVfNCwgX2EsIGVfNSwgX2I7XG5cbiAgICB2YXIgcHJldkNvbmZpZyA9IGdldENvbmZpZ3VyYXRpb24oW10sIHByZXZTdGF0ZSA/IHRoaXMuZ2V0U3RhdGVOb2RlcyhwcmV2U3RhdGUudmFsdWUpIDogW3RoaXNdKTtcbiAgICB2YXIgcmVzb2x2ZWRDb25maWcgPSB0cmFuc2l0aW9uLmNvbmZpZ3VyYXRpb24ubGVuZ3RoID8gZ2V0Q29uZmlndXJhdGlvbihwcmV2Q29uZmlnLCB0cmFuc2l0aW9uLmNvbmZpZ3VyYXRpb24pIDogcHJldkNvbmZpZztcblxuICAgIHRyeSB7XG4gICAgICBmb3IgKHZhciByZXNvbHZlZENvbmZpZ18xID0gX192YWx1ZXMocmVzb2x2ZWRDb25maWcpLCByZXNvbHZlZENvbmZpZ18xXzEgPSByZXNvbHZlZENvbmZpZ18xLm5leHQoKTsgIXJlc29sdmVkQ29uZmlnXzFfMS5kb25lOyByZXNvbHZlZENvbmZpZ18xXzEgPSByZXNvbHZlZENvbmZpZ18xLm5leHQoKSkge1xuICAgICAgICB2YXIgc24gPSByZXNvbHZlZENvbmZpZ18xXzEudmFsdWU7XG5cbiAgICAgICAgaWYgKCFoYXMocHJldkNvbmZpZywgc24pKSB7XG4gICAgICAgICAgdHJhbnNpdGlvbi5lbnRyeVNldC5wdXNoKHNuKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0gY2F0Y2ggKGVfNF8xKSB7XG4gICAgICBlXzQgPSB7XG4gICAgICAgIGVycm9yOiBlXzRfMVxuICAgICAgfTtcbiAgICB9IGZpbmFsbHkge1xuICAgICAgdHJ5IHtcbiAgICAgICAgaWYgKHJlc29sdmVkQ29uZmlnXzFfMSAmJiAhcmVzb2x2ZWRDb25maWdfMV8xLmRvbmUgJiYgKF9hID0gcmVzb2x2ZWRDb25maWdfMS5yZXR1cm4pKSBfYS5jYWxsKHJlc29sdmVkQ29uZmlnXzEpO1xuICAgICAgfSBmaW5hbGx5IHtcbiAgICAgICAgaWYgKGVfNCkgdGhyb3cgZV80LmVycm9yO1xuICAgICAgfVxuICAgIH1cblxuICAgIHRyeSB7XG4gICAgICBmb3IgKHZhciBwcmV2Q29uZmlnXzEgPSBfX3ZhbHVlcyhwcmV2Q29uZmlnKSwgcHJldkNvbmZpZ18xXzEgPSBwcmV2Q29uZmlnXzEubmV4dCgpOyAhcHJldkNvbmZpZ18xXzEuZG9uZTsgcHJldkNvbmZpZ18xXzEgPSBwcmV2Q29uZmlnXzEubmV4dCgpKSB7XG4gICAgICAgIHZhciBzbiA9IHByZXZDb25maWdfMV8xLnZhbHVlO1xuXG4gICAgICAgIGlmICghaGFzKHJlc29sdmVkQ29uZmlnLCBzbikgfHwgaGFzKHRyYW5zaXRpb24uZXhpdFNldCwgc24ucGFyZW50KSkge1xuICAgICAgICAgIHRyYW5zaXRpb24uZXhpdFNldC5wdXNoKHNuKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0gY2F0Y2ggKGVfNV8xKSB7XG4gICAgICBlXzUgPSB7XG4gICAgICAgIGVycm9yOiBlXzVfMVxuICAgICAgfTtcbiAgICB9IGZpbmFsbHkge1xuICAgICAgdHJ5IHtcbiAgICAgICAgaWYgKHByZXZDb25maWdfMV8xICYmICFwcmV2Q29uZmlnXzFfMS5kb25lICYmIChfYiA9IHByZXZDb25maWdfMS5yZXR1cm4pKSBfYi5jYWxsKHByZXZDb25maWdfMSk7XG4gICAgICB9IGZpbmFsbHkge1xuICAgICAgICBpZiAoZV81KSB0aHJvdyBlXzUuZXJyb3I7XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKCF0cmFuc2l0aW9uLnNvdXJjZSkge1xuICAgICAgdHJhbnNpdGlvbi5leGl0U2V0ID0gW107IC8vIEVuc3VyZSB0aGF0IHJvb3QgU3RhdGVOb2RlIChtYWNoaW5lKSBpcyBlbnRlcmVkXG5cbiAgICAgIHRyYW5zaXRpb24uZW50cnlTZXQucHVzaCh0aGlzKTtcbiAgICB9XG5cbiAgICB2YXIgZG9uZUV2ZW50cyA9IGZsYXR0ZW4odHJhbnNpdGlvbi5lbnRyeVNldC5tYXAoZnVuY3Rpb24gKHNuKSB7XG4gICAgICB2YXIgZXZlbnRzID0gW107XG5cbiAgICAgIGlmIChzbi50eXBlICE9PSAnZmluYWwnKSB7XG4gICAgICAgIHJldHVybiBldmVudHM7XG4gICAgICB9XG5cbiAgICAgIHZhciBwYXJlbnQgPSBzbi5wYXJlbnQ7XG5cbiAgICAgIGlmICghcGFyZW50LnBhcmVudCkge1xuICAgICAgICByZXR1cm4gZXZlbnRzO1xuICAgICAgfVxuXG4gICAgICBldmVudHMucHVzaChkb25lKHNuLmlkLCBzbi5kb25lRGF0YSksIC8vIFRPRE86IGRlcHJlY2F0ZSAtIGZpbmFsIHN0YXRlcyBzaG91bGQgbm90IGVtaXQgZG9uZSBldmVudHMgZm9yIHRoZWlyIG93biBzdGF0ZS5cbiAgICAgIGRvbmUocGFyZW50LmlkLCBzbi5kb25lRGF0YSA/IG1hcENvbnRleHQoc24uZG9uZURhdGEsIGN1cnJlbnRDb250ZXh0LCBfZXZlbnQpIDogdW5kZWZpbmVkKSk7XG4gICAgICB2YXIgZ3JhbmRwYXJlbnQgPSBwYXJlbnQucGFyZW50O1xuXG4gICAgICBpZiAoZ3JhbmRwYXJlbnQudHlwZSA9PT0gJ3BhcmFsbGVsJykge1xuICAgICAgICBpZiAoZ2V0Q2hpbGRyZW4oZ3JhbmRwYXJlbnQpLmV2ZXJ5KGZ1bmN0aW9uIChwYXJlbnROb2RlKSB7XG4gICAgICAgICAgcmV0dXJuIGlzSW5GaW5hbFN0YXRlKHRyYW5zaXRpb24uY29uZmlndXJhdGlvbiwgcGFyZW50Tm9kZSk7XG4gICAgICAgIH0pKSB7XG4gICAgICAgICAgZXZlbnRzLnB1c2goZG9uZShncmFuZHBhcmVudC5pZCkpO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBldmVudHM7XG4gICAgfSkpO1xuICAgIHRyYW5zaXRpb24uZXhpdFNldC5zb3J0KGZ1bmN0aW9uIChhLCBiKSB7XG4gICAgICByZXR1cm4gYi5vcmRlciAtIGEub3JkZXI7XG4gICAgfSk7XG4gICAgdHJhbnNpdGlvbi5lbnRyeVNldC5zb3J0KGZ1bmN0aW9uIChhLCBiKSB7XG4gICAgICByZXR1cm4gYS5vcmRlciAtIGIub3JkZXI7XG4gICAgfSk7XG4gICAgdmFyIGVudHJ5U3RhdGVzID0gbmV3IFNldCh0cmFuc2l0aW9uLmVudHJ5U2V0KTtcbiAgICB2YXIgZXhpdFN0YXRlcyA9IG5ldyBTZXQodHJhbnNpdGlvbi5leGl0U2V0KTtcblxuICAgIHZhciBfYyA9IF9fcmVhZChbZmxhdHRlbihBcnJheS5mcm9tKGVudHJ5U3RhdGVzKS5tYXAoZnVuY3Rpb24gKHN0YXRlTm9kZSkge1xuICAgICAgcmV0dXJuIF9fc3ByZWFkKHN0YXRlTm9kZS5hY3Rpdml0aWVzLm1hcChmdW5jdGlvbiAoYWN0aXZpdHkpIHtcbiAgICAgICAgcmV0dXJuIHN0YXJ0KGFjdGl2aXR5KTtcbiAgICAgIH0pLCBzdGF0ZU5vZGUub25FbnRyeSk7XG4gICAgfSkpLmNvbmNhdChkb25lRXZlbnRzLm1hcChyYWlzZSkpLCBmbGF0dGVuKEFycmF5LmZyb20oZXhpdFN0YXRlcykubWFwKGZ1bmN0aW9uIChzdGF0ZU5vZGUpIHtcbiAgICAgIHJldHVybiBfX3NwcmVhZChzdGF0ZU5vZGUub25FeGl0LCBzdGF0ZU5vZGUuYWN0aXZpdGllcy5tYXAoZnVuY3Rpb24gKGFjdGl2aXR5KSB7XG4gICAgICAgIHJldHVybiBzdG9wKGFjdGl2aXR5KTtcbiAgICAgIH0pKTtcbiAgICB9KSldLCAyKSxcbiAgICAgICAgZW50cnlBY3Rpb25zID0gX2NbMF0sXG4gICAgICAgIGV4aXRBY3Rpb25zID0gX2NbMV07XG5cbiAgICB2YXIgYWN0aW9ucyA9IHRvQWN0aW9uT2JqZWN0cyhleGl0QWN0aW9ucy5jb25jYXQodHJhbnNpdGlvbi5hY3Rpb25zKS5jb25jYXQoZW50cnlBY3Rpb25zKSwgdGhpcy5tYWNoaW5lLm9wdGlvbnMuYWN0aW9ucyk7XG4gICAgcmV0dXJuIGFjdGlvbnM7XG4gIH07XG4gIC8qKlxyXG4gICAqIERldGVybWluZXMgdGhlIG5leHQgc3RhdGUgZ2l2ZW4gdGhlIGN1cnJlbnQgYHN0YXRlYCBhbmQgc2VudCBgZXZlbnRgLlxyXG4gICAqXHJcbiAgICogQHBhcmFtIHN0YXRlIFRoZSBjdXJyZW50IFN0YXRlIGluc3RhbmNlIG9yIHN0YXRlIHZhbHVlXHJcbiAgICogQHBhcmFtIGV2ZW50IFRoZSBldmVudCB0aGF0IHdhcyBzZW50IGF0IHRoZSBjdXJyZW50IHN0YXRlXHJcbiAgICogQHBhcmFtIGNvbnRleHQgVGhlIGN1cnJlbnQgY29udGV4dCAoZXh0ZW5kZWQgc3RhdGUpIG9mIHRoZSBjdXJyZW50IHN0YXRlXHJcbiAgICovXG5cblxuICBTdGF0ZU5vZGUucHJvdG90eXBlLnRyYW5zaXRpb24gPSBmdW5jdGlvbiAoc3RhdGUsIGV2ZW50LCBjb250ZXh0KSB7XG4gICAgaWYgKHN0YXRlID09PSB2b2lkIDApIHtcbiAgICAgIHN0YXRlID0gdGhpcy5pbml0aWFsU3RhdGU7XG4gICAgfVxuXG4gICAgdmFyIF9ldmVudCA9IHRvU0NYTUxFdmVudChldmVudCk7XG5cbiAgICB2YXIgY3VycmVudFN0YXRlO1xuXG4gICAgaWYgKHN0YXRlIGluc3RhbmNlb2YgU3RhdGUpIHtcbiAgICAgIGN1cnJlbnRTdGF0ZSA9IGNvbnRleHQgPT09IHVuZGVmaW5lZCA/IHN0YXRlIDogdGhpcy5yZXNvbHZlU3RhdGUoU3RhdGUuZnJvbShzdGF0ZSwgY29udGV4dCkpO1xuICAgIH0gZWxzZSB7XG4gICAgICB2YXIgcmVzb2x2ZWRTdGF0ZVZhbHVlID0gaXNTdHJpbmcoc3RhdGUpID8gdGhpcy5yZXNvbHZlKHBhdGhUb1N0YXRlVmFsdWUodGhpcy5nZXRSZXNvbHZlZFBhdGgoc3RhdGUpKSkgOiB0aGlzLnJlc29sdmUoc3RhdGUpO1xuICAgICAgdmFyIHJlc29sdmVkQ29udGV4dCA9IGNvbnRleHQgPyBjb250ZXh0IDogdGhpcy5tYWNoaW5lLmNvbnRleHQ7XG4gICAgICBjdXJyZW50U3RhdGUgPSB0aGlzLnJlc29sdmVTdGF0ZShTdGF0ZS5mcm9tKHJlc29sdmVkU3RhdGVWYWx1ZSwgcmVzb2x2ZWRDb250ZXh0KSk7XG4gICAgfVxuXG4gICAgaWYgKCFJU19QUk9EVUNUSU9OICYmIF9ldmVudC5uYW1lID09PSBXSUxEQ0FSRCkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKFwiQW4gZXZlbnQgY2Fubm90IGhhdmUgdGhlIHdpbGRjYXJkIHR5cGUgKCdcIiArIFdJTERDQVJEICsgXCInKVwiKTtcbiAgICB9XG5cbiAgICBpZiAodGhpcy5zdHJpY3QpIHtcbiAgICAgIGlmICghdGhpcy5ldmVudHMuaW5jbHVkZXMoX2V2ZW50Lm5hbWUpICYmICFpc0J1aWx0SW5FdmVudChfZXZlbnQubmFtZSkpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiTWFjaGluZSAnXCIgKyB0aGlzLmlkICsgXCInIGRvZXMgbm90IGFjY2VwdCBldmVudCAnXCIgKyBfZXZlbnQubmFtZSArIFwiJ1wiKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICB2YXIgc3RhdGVUcmFuc2l0aW9uID0gdGhpcy5fdHJhbnNpdGlvbihjdXJyZW50U3RhdGUudmFsdWUsIGN1cnJlbnRTdGF0ZSwgX2V2ZW50KSB8fCB7XG4gICAgICB0cmFuc2l0aW9uczogW10sXG4gICAgICBjb25maWd1cmF0aW9uOiBbXSxcbiAgICAgIGVudHJ5U2V0OiBbXSxcbiAgICAgIGV4aXRTZXQ6IFtdLFxuICAgICAgc291cmNlOiBjdXJyZW50U3RhdGUsXG4gICAgICBhY3Rpb25zOiBbXVxuICAgIH07XG4gICAgdmFyIHByZXZDb25maWcgPSBnZXRDb25maWd1cmF0aW9uKFtdLCB0aGlzLmdldFN0YXRlTm9kZXMoY3VycmVudFN0YXRlLnZhbHVlKSk7XG4gICAgdmFyIHJlc29sdmVkQ29uZmlnID0gc3RhdGVUcmFuc2l0aW9uLmNvbmZpZ3VyYXRpb24ubGVuZ3RoID8gZ2V0Q29uZmlndXJhdGlvbihwcmV2Q29uZmlnLCBzdGF0ZVRyYW5zaXRpb24uY29uZmlndXJhdGlvbikgOiBwcmV2Q29uZmlnO1xuICAgIHN0YXRlVHJhbnNpdGlvbi5jb25maWd1cmF0aW9uID0gX19zcHJlYWQocmVzb2x2ZWRDb25maWcpO1xuICAgIHJldHVybiB0aGlzLnJlc29sdmVUcmFuc2l0aW9uKHN0YXRlVHJhbnNpdGlvbiwgY3VycmVudFN0YXRlLCBfZXZlbnQpO1xuICB9O1xuXG4gIFN0YXRlTm9kZS5wcm90b3R5cGUucmVzb2x2ZVJhaXNlZFRyYW5zaXRpb24gPSBmdW5jdGlvbiAoc3RhdGUsIF9ldmVudCwgb3JpZ2luYWxFdmVudCkge1xuICAgIHZhciBfYTtcblxuICAgIHZhciBjdXJyZW50QWN0aW9ucyA9IHN0YXRlLmFjdGlvbnM7XG4gICAgc3RhdGUgPSB0aGlzLnRyYW5zaXRpb24oc3RhdGUsIF9ldmVudCk7IC8vIFNhdmUgb3JpZ2luYWwgZXZlbnQgdG8gc3RhdGVcbiAgICAvLyBUT0RPOiB0aGlzIHNob3VsZCBiZSB0aGUgcmFpc2VkIGV2ZW50ISBEZWxldGUgaW4gVjUgKGJyZWFraW5nKVxuXG4gICAgc3RhdGUuX2V2ZW50ID0gb3JpZ2luYWxFdmVudDtcbiAgICBzdGF0ZS5ldmVudCA9IG9yaWdpbmFsRXZlbnQuZGF0YTtcblxuICAgIChfYSA9IHN0YXRlLmFjdGlvbnMpLnVuc2hpZnQuYXBwbHkoX2EsIF9fc3ByZWFkKGN1cnJlbnRBY3Rpb25zKSk7XG5cbiAgICByZXR1cm4gc3RhdGU7XG4gIH07XG5cbiAgU3RhdGVOb2RlLnByb3RvdHlwZS5yZXNvbHZlVHJhbnNpdGlvbiA9IGZ1bmN0aW9uIChzdGF0ZVRyYW5zaXRpb24sIGN1cnJlbnRTdGF0ZSwgX2V2ZW50LCBjb250ZXh0KSB7XG4gICAgdmFyIGVfNiwgX2E7XG5cbiAgICB2YXIgX3RoaXMgPSB0aGlzO1xuXG4gICAgaWYgKF9ldmVudCA9PT0gdm9pZCAwKSB7XG4gICAgICBfZXZlbnQgPSBpbml0RXZlbnQ7XG4gICAgfVxuXG4gICAgaWYgKGNvbnRleHQgPT09IHZvaWQgMCkge1xuICAgICAgY29udGV4dCA9IHRoaXMubWFjaGluZS5jb250ZXh0O1xuICAgIH1cblxuICAgIHZhciBjb25maWd1cmF0aW9uID0gc3RhdGVUcmFuc2l0aW9uLmNvbmZpZ3VyYXRpb247IC8vIFRyYW5zaXRpb24gd2lsbCBcImFwcGx5XCIgaWY6XG4gICAgLy8gLSB0aGlzIGlzIHRoZSBpbml0aWFsIHN0YXRlICh0aGVyZSBpcyBubyBjdXJyZW50IHN0YXRlKVxuICAgIC8vIC0gT1IgdGhlcmUgYXJlIHRyYW5zaXRpb25zXG5cbiAgICB2YXIgd2lsbFRyYW5zaXRpb24gPSAhY3VycmVudFN0YXRlIHx8IHN0YXRlVHJhbnNpdGlvbi50cmFuc2l0aW9ucy5sZW5ndGggPiAwO1xuICAgIHZhciByZXNvbHZlZFN0YXRlVmFsdWUgPSB3aWxsVHJhbnNpdGlvbiA/IGdldFZhbHVlKHRoaXMubWFjaGluZSwgY29uZmlndXJhdGlvbikgOiB1bmRlZmluZWQ7XG4gICAgdmFyIGhpc3RvcnlWYWx1ZSA9IGN1cnJlbnRTdGF0ZSA/IGN1cnJlbnRTdGF0ZS5oaXN0b3J5VmFsdWUgPyBjdXJyZW50U3RhdGUuaGlzdG9yeVZhbHVlIDogc3RhdGVUcmFuc2l0aW9uLnNvdXJjZSA/IHRoaXMubWFjaGluZS5oaXN0b3J5VmFsdWUoY3VycmVudFN0YXRlLnZhbHVlKSA6IHVuZGVmaW5lZCA6IHVuZGVmaW5lZDtcbiAgICB2YXIgY3VycmVudENvbnRleHQgPSBjdXJyZW50U3RhdGUgPyBjdXJyZW50U3RhdGUuY29udGV4dCA6IGNvbnRleHQ7XG4gICAgdmFyIGFjdGlvbnMgPSB0aGlzLmdldEFjdGlvbnMoc3RhdGVUcmFuc2l0aW9uLCBjdXJyZW50Q29udGV4dCwgX2V2ZW50LCBjdXJyZW50U3RhdGUpO1xuICAgIHZhciBhY3Rpdml0aWVzID0gY3VycmVudFN0YXRlID8gX19hc3NpZ24oe30sIGN1cnJlbnRTdGF0ZS5hY3Rpdml0aWVzKSA6IHt9O1xuXG4gICAgdHJ5IHtcbiAgICAgIGZvciAodmFyIGFjdGlvbnNfMSA9IF9fdmFsdWVzKGFjdGlvbnMpLCBhY3Rpb25zXzFfMSA9IGFjdGlvbnNfMS5uZXh0KCk7ICFhY3Rpb25zXzFfMS5kb25lOyBhY3Rpb25zXzFfMSA9IGFjdGlvbnNfMS5uZXh0KCkpIHtcbiAgICAgICAgdmFyIGFjdGlvbiA9IGFjdGlvbnNfMV8xLnZhbHVlO1xuXG4gICAgICAgIGlmIChhY3Rpb24udHlwZSA9PT0gc3RhcnQkMSkge1xuICAgICAgICAgIGFjdGl2aXRpZXNbYWN0aW9uLmFjdGl2aXR5LmlkIHx8IGFjdGlvbi5hY3Rpdml0eS50eXBlXSA9IGFjdGlvbjtcbiAgICAgICAgfSBlbHNlIGlmIChhY3Rpb24udHlwZSA9PT0gc3RvcCQxKSB7XG4gICAgICAgICAgYWN0aXZpdGllc1thY3Rpb24uYWN0aXZpdHkuaWQgfHwgYWN0aW9uLmFjdGl2aXR5LnR5cGVdID0gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9IGNhdGNoIChlXzZfMSkge1xuICAgICAgZV82ID0ge1xuICAgICAgICBlcnJvcjogZV82XzFcbiAgICAgIH07XG4gICAgfSBmaW5hbGx5IHtcbiAgICAgIHRyeSB7XG4gICAgICAgIGlmIChhY3Rpb25zXzFfMSAmJiAhYWN0aW9uc18xXzEuZG9uZSAmJiAoX2EgPSBhY3Rpb25zXzEucmV0dXJuKSkgX2EuY2FsbChhY3Rpb25zXzEpO1xuICAgICAgfSBmaW5hbGx5IHtcbiAgICAgICAgaWYgKGVfNikgdGhyb3cgZV82LmVycm9yO1xuICAgICAgfVxuICAgIH1cblxuICAgIHZhciBfYiA9IF9fcmVhZChyZXNvbHZlQWN0aW9ucyh0aGlzLCBjdXJyZW50U3RhdGUsIGN1cnJlbnRDb250ZXh0LCBfZXZlbnQsIGFjdGlvbnMpLCAyKSxcbiAgICAgICAgcmVzb2x2ZWRBY3Rpb25zID0gX2JbMF0sXG4gICAgICAgIHVwZGF0ZWRDb250ZXh0ID0gX2JbMV07XG5cbiAgICB2YXIgX2MgPSBfX3JlYWQocGFydGl0aW9uKHJlc29sdmVkQWN0aW9ucywgZnVuY3Rpb24gKGFjdGlvbikge1xuICAgICAgcmV0dXJuIGFjdGlvbi50eXBlID09PSByYWlzZSQxIHx8IGFjdGlvbi50eXBlID09PSBzZW5kJDEgJiYgYWN0aW9uLnRvID09PSBTcGVjaWFsVGFyZ2V0cy5JbnRlcm5hbDtcbiAgICB9KSwgMiksXG4gICAgICAgIHJhaXNlZEV2ZW50cyA9IF9jWzBdLFxuICAgICAgICBub25SYWlzZWRBY3Rpb25zID0gX2NbMV07XG5cbiAgICB2YXIgaW52b2tlQWN0aW9ucyA9IHJlc29sdmVkQWN0aW9ucy5maWx0ZXIoZnVuY3Rpb24gKGFjdGlvbikge1xuICAgICAgdmFyIF9hO1xuXG4gICAgICByZXR1cm4gYWN0aW9uLnR5cGUgPT09IHN0YXJ0JDEgJiYgKChfYSA9IGFjdGlvbi5hY3Rpdml0eSkgPT09IG51bGwgfHwgX2EgPT09IHZvaWQgMCA/IHZvaWQgMCA6IF9hLnR5cGUpID09PSBpbnZva2U7XG4gICAgfSk7XG4gICAgdmFyIGNoaWxkcmVuID0gaW52b2tlQWN0aW9ucy5yZWR1Y2UoZnVuY3Rpb24gKGFjYywgYWN0aW9uKSB7XG4gICAgICBhY2NbYWN0aW9uLmFjdGl2aXR5LmlkXSA9IGNyZWF0ZUludm9jYWJsZUFjdG9yKGFjdGlvbi5hY3Rpdml0eSwgX3RoaXMubWFjaGluZSwgdXBkYXRlZENvbnRleHQsIF9ldmVudCk7XG4gICAgICByZXR1cm4gYWNjO1xuICAgIH0sIGN1cnJlbnRTdGF0ZSA/IF9fYXNzaWduKHt9LCBjdXJyZW50U3RhdGUuY2hpbGRyZW4pIDoge30pO1xuICAgIHZhciByZXNvbHZlZENvbmZpZ3VyYXRpb24gPSByZXNvbHZlZFN0YXRlVmFsdWUgPyBzdGF0ZVRyYW5zaXRpb24uY29uZmlndXJhdGlvbiA6IGN1cnJlbnRTdGF0ZSA/IGN1cnJlbnRTdGF0ZS5jb25maWd1cmF0aW9uIDogW107XG4gICAgdmFyIG1ldGEgPSByZXNvbHZlZENvbmZpZ3VyYXRpb24ucmVkdWNlKGZ1bmN0aW9uIChhY2MsIHN0YXRlTm9kZSkge1xuICAgICAgaWYgKHN0YXRlTm9kZS5tZXRhICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgYWNjW3N0YXRlTm9kZS5pZF0gPSBzdGF0ZU5vZGUubWV0YTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIGFjYztcbiAgICB9LCB7fSk7XG4gICAgdmFyIGlzRG9uZSA9IGlzSW5GaW5hbFN0YXRlKHJlc29sdmVkQ29uZmlndXJhdGlvbiwgdGhpcyk7XG4gICAgdmFyIG5leHRTdGF0ZSA9IG5ldyBTdGF0ZSh7XG4gICAgICB2YWx1ZTogcmVzb2x2ZWRTdGF0ZVZhbHVlIHx8IGN1cnJlbnRTdGF0ZS52YWx1ZSxcbiAgICAgIGNvbnRleHQ6IHVwZGF0ZWRDb250ZXh0LFxuICAgICAgX2V2ZW50OiBfZXZlbnQsXG4gICAgICAvLyBQZXJzaXN0IF9zZXNzaW9uaWQgYmV0d2VlbiBzdGF0ZXNcbiAgICAgIF9zZXNzaW9uaWQ6IGN1cnJlbnRTdGF0ZSA/IGN1cnJlbnRTdGF0ZS5fc2Vzc2lvbmlkIDogbnVsbCxcbiAgICAgIGhpc3RvcnlWYWx1ZTogcmVzb2x2ZWRTdGF0ZVZhbHVlID8gaGlzdG9yeVZhbHVlID8gdXBkYXRlSGlzdG9yeVZhbHVlKGhpc3RvcnlWYWx1ZSwgcmVzb2x2ZWRTdGF0ZVZhbHVlKSA6IHVuZGVmaW5lZCA6IGN1cnJlbnRTdGF0ZSA/IGN1cnJlbnRTdGF0ZS5oaXN0b3J5VmFsdWUgOiB1bmRlZmluZWQsXG4gICAgICBoaXN0b3J5OiAhcmVzb2x2ZWRTdGF0ZVZhbHVlIHx8IHN0YXRlVHJhbnNpdGlvbi5zb3VyY2UgPyBjdXJyZW50U3RhdGUgOiB1bmRlZmluZWQsXG4gICAgICBhY3Rpb25zOiByZXNvbHZlZFN0YXRlVmFsdWUgPyBub25SYWlzZWRBY3Rpb25zIDogW10sXG4gICAgICBhY3Rpdml0aWVzOiByZXNvbHZlZFN0YXRlVmFsdWUgPyBhY3Rpdml0aWVzIDogY3VycmVudFN0YXRlID8gY3VycmVudFN0YXRlLmFjdGl2aXRpZXMgOiB7fSxcbiAgICAgIG1ldGE6IHJlc29sdmVkU3RhdGVWYWx1ZSA/IG1ldGEgOiBjdXJyZW50U3RhdGUgPyBjdXJyZW50U3RhdGUubWV0YSA6IHVuZGVmaW5lZCxcbiAgICAgIGV2ZW50czogW10sXG4gICAgICBjb25maWd1cmF0aW9uOiByZXNvbHZlZENvbmZpZ3VyYXRpb24sXG4gICAgICB0cmFuc2l0aW9uczogc3RhdGVUcmFuc2l0aW9uLnRyYW5zaXRpb25zLFxuICAgICAgY2hpbGRyZW46IGNoaWxkcmVuLFxuICAgICAgZG9uZTogaXNEb25lXG4gICAgfSk7XG4gICAgdmFyIGRpZFVwZGF0ZUNvbnRleHQgPSBjdXJyZW50Q29udGV4dCAhPT0gdXBkYXRlZENvbnRleHQ7XG4gICAgbmV4dFN0YXRlLmNoYW5nZWQgPSBfZXZlbnQubmFtZSA9PT0gdXBkYXRlIHx8IGRpZFVwZGF0ZUNvbnRleHQ7IC8vIERpc3Bvc2Ugb2YgcGVudWx0aW1hdGUgaGlzdG9yaWVzIHRvIHByZXZlbnQgbWVtb3J5IGxlYWtzXG5cbiAgICB2YXIgaGlzdG9yeSA9IG5leHRTdGF0ZS5oaXN0b3J5O1xuXG4gICAgaWYgKGhpc3RvcnkpIHtcbiAgICAgIGRlbGV0ZSBoaXN0b3J5Lmhpc3Rvcnk7XG4gICAgfVxuXG4gICAgaWYgKCFyZXNvbHZlZFN0YXRlVmFsdWUpIHtcbiAgICAgIHJldHVybiBuZXh0U3RhdGU7XG4gICAgfVxuXG4gICAgdmFyIG1heWJlTmV4dFN0YXRlID0gbmV4dFN0YXRlO1xuXG4gICAgaWYgKCFpc0RvbmUpIHtcbiAgICAgIHZhciBpc1RyYW5zaWVudCA9IHRoaXMuX3RyYW5zaWVudCB8fCBjb25maWd1cmF0aW9uLnNvbWUoZnVuY3Rpb24gKHN0YXRlTm9kZSkge1xuICAgICAgICByZXR1cm4gc3RhdGVOb2RlLl90cmFuc2llbnQ7XG4gICAgICB9KTtcblxuICAgICAgaWYgKGlzVHJhbnNpZW50KSB7XG4gICAgICAgIG1heWJlTmV4dFN0YXRlID0gdGhpcy5yZXNvbHZlUmFpc2VkVHJhbnNpdGlvbihtYXliZU5leHRTdGF0ZSwge1xuICAgICAgICAgIHR5cGU6IG51bGxFdmVudFxuICAgICAgICB9LCBfZXZlbnQpO1xuICAgICAgfVxuXG4gICAgICB3aGlsZSAocmFpc2VkRXZlbnRzLmxlbmd0aCkge1xuICAgICAgICB2YXIgcmFpc2VkRXZlbnQgPSByYWlzZWRFdmVudHMuc2hpZnQoKTtcbiAgICAgICAgbWF5YmVOZXh0U3RhdGUgPSB0aGlzLnJlc29sdmVSYWlzZWRUcmFuc2l0aW9uKG1heWJlTmV4dFN0YXRlLCByYWlzZWRFdmVudC5fZXZlbnQsIF9ldmVudCk7XG4gICAgICB9XG4gICAgfSAvLyBEZXRlY3QgaWYgc3RhdGUgY2hhbmdlZFxuXG5cbiAgICB2YXIgY2hhbmdlZCA9IG1heWJlTmV4dFN0YXRlLmNoYW5nZWQgfHwgKGhpc3RvcnkgPyAhIW1heWJlTmV4dFN0YXRlLmFjdGlvbnMubGVuZ3RoIHx8IGRpZFVwZGF0ZUNvbnRleHQgfHwgdHlwZW9mIGhpc3RvcnkudmFsdWUgIT09IHR5cGVvZiBtYXliZU5leHRTdGF0ZS52YWx1ZSB8fCAhc3RhdGVWYWx1ZXNFcXVhbChtYXliZU5leHRTdGF0ZS52YWx1ZSwgaGlzdG9yeS52YWx1ZSkgOiB1bmRlZmluZWQpO1xuICAgIG1heWJlTmV4dFN0YXRlLmNoYW5nZWQgPSBjaGFuZ2VkOyAvLyBQcmVzZXJ2ZSBvcmlnaW5hbCBoaXN0b3J5IGFmdGVyIHJhaXNlZCBldmVudHNcblxuICAgIG1heWJlTmV4dFN0YXRlLmhpc3RvcnkgPSBoaXN0b3J5O1xuICAgIHJldHVybiBtYXliZU5leHRTdGF0ZTtcbiAgfTtcbiAgLyoqXHJcbiAgICogUmV0dXJucyB0aGUgY2hpbGQgc3RhdGUgbm9kZSBmcm9tIGl0cyByZWxhdGl2ZSBgc3RhdGVLZXlgLCBvciB0aHJvd3MuXHJcbiAgICovXG5cblxuICBTdGF0ZU5vZGUucHJvdG90eXBlLmdldFN0YXRlTm9kZSA9IGZ1bmN0aW9uIChzdGF0ZUtleSkge1xuICAgIGlmIChpc1N0YXRlSWQoc3RhdGVLZXkpKSB7XG4gICAgICByZXR1cm4gdGhpcy5tYWNoaW5lLmdldFN0YXRlTm9kZUJ5SWQoc3RhdGVLZXkpO1xuICAgIH1cblxuICAgIGlmICghdGhpcy5zdGF0ZXMpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihcIlVuYWJsZSB0byByZXRyaWV2ZSBjaGlsZCBzdGF0ZSAnXCIgKyBzdGF0ZUtleSArIFwiJyBmcm9tICdcIiArIHRoaXMuaWQgKyBcIic7IG5vIGNoaWxkIHN0YXRlcyBleGlzdC5cIik7XG4gICAgfVxuXG4gICAgdmFyIHJlc3VsdCA9IHRoaXMuc3RhdGVzW3N0YXRlS2V5XTtcblxuICAgIGlmICghcmVzdWx0KSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXCJDaGlsZCBzdGF0ZSAnXCIgKyBzdGF0ZUtleSArIFwiJyBkb2VzIG5vdCBleGlzdCBvbiAnXCIgKyB0aGlzLmlkICsgXCInXCIpO1xuICAgIH1cblxuICAgIHJldHVybiByZXN1bHQ7XG4gIH07XG4gIC8qKlxyXG4gICAqIFJldHVybnMgdGhlIHN0YXRlIG5vZGUgd2l0aCB0aGUgZ2l2ZW4gYHN0YXRlSWRgLCBvciB0aHJvd3MuXHJcbiAgICpcclxuICAgKiBAcGFyYW0gc3RhdGVJZCBUaGUgc3RhdGUgSUQuIFRoZSBwcmVmaXggXCIjXCIgaXMgcmVtb3ZlZC5cclxuICAgKi9cblxuXG4gIFN0YXRlTm9kZS5wcm90b3R5cGUuZ2V0U3RhdGVOb2RlQnlJZCA9IGZ1bmN0aW9uIChzdGF0ZUlkKSB7XG4gICAgdmFyIHJlc29sdmVkU3RhdGVJZCA9IGlzU3RhdGVJZChzdGF0ZUlkKSA/IHN0YXRlSWQuc2xpY2UoU1RBVEVfSURFTlRJRklFUi5sZW5ndGgpIDogc3RhdGVJZDtcblxuICAgIGlmIChyZXNvbHZlZFN0YXRlSWQgPT09IHRoaXMuaWQpIHtcbiAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIHZhciBzdGF0ZU5vZGUgPSB0aGlzLm1hY2hpbmUuaWRNYXBbcmVzb2x2ZWRTdGF0ZUlkXTtcblxuICAgIGlmICghc3RhdGVOb2RlKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXCJDaGlsZCBzdGF0ZSBub2RlICcjXCIgKyByZXNvbHZlZFN0YXRlSWQgKyBcIicgZG9lcyBub3QgZXhpc3Qgb24gbWFjaGluZSAnXCIgKyB0aGlzLmlkICsgXCInXCIpO1xuICAgIH1cblxuICAgIHJldHVybiBzdGF0ZU5vZGU7XG4gIH07XG4gIC8qKlxyXG4gICAqIFJldHVybnMgdGhlIHJlbGF0aXZlIHN0YXRlIG5vZGUgZnJvbSB0aGUgZ2l2ZW4gYHN0YXRlUGF0aGAsIG9yIHRocm93cy5cclxuICAgKlxyXG4gICAqIEBwYXJhbSBzdGF0ZVBhdGggVGhlIHN0cmluZyBvciBzdHJpbmcgYXJyYXkgcmVsYXRpdmUgcGF0aCB0byB0aGUgc3RhdGUgbm9kZS5cclxuICAgKi9cblxuXG4gIFN0YXRlTm9kZS5wcm90b3R5cGUuZ2V0U3RhdGVOb2RlQnlQYXRoID0gZnVuY3Rpb24gKHN0YXRlUGF0aCkge1xuICAgIGlmICh0eXBlb2Ygc3RhdGVQYXRoID09PSAnc3RyaW5nJyAmJiBpc1N0YXRlSWQoc3RhdGVQYXRoKSkge1xuICAgICAgdHJ5IHtcbiAgICAgICAgcmV0dXJuIHRoaXMuZ2V0U3RhdGVOb2RlQnlJZChzdGF0ZVBhdGguc2xpY2UoMSkpO1xuICAgICAgfSBjYXRjaCAoZSkgey8vIHRyeSBpbmRpdmlkdWFsIHBhdGhzXG4gICAgICAgIC8vIHRocm93IGU7XG4gICAgICB9XG4gICAgfVxuXG4gICAgdmFyIGFycmF5U3RhdGVQYXRoID0gdG9TdGF0ZVBhdGgoc3RhdGVQYXRoLCB0aGlzLmRlbGltaXRlcikuc2xpY2UoKTtcbiAgICB2YXIgY3VycmVudFN0YXRlTm9kZSA9IHRoaXM7XG5cbiAgICB3aGlsZSAoYXJyYXlTdGF0ZVBhdGgubGVuZ3RoKSB7XG4gICAgICB2YXIga2V5ID0gYXJyYXlTdGF0ZVBhdGguc2hpZnQoKTtcblxuICAgICAgaWYgKCFrZXkubGVuZ3RoKSB7XG4gICAgICAgIGJyZWFrO1xuICAgICAgfVxuXG4gICAgICBjdXJyZW50U3RhdGVOb2RlID0gY3VycmVudFN0YXRlTm9kZS5nZXRTdGF0ZU5vZGUoa2V5KTtcbiAgICB9XG5cbiAgICByZXR1cm4gY3VycmVudFN0YXRlTm9kZTtcbiAgfTtcbiAgLyoqXHJcbiAgICogUmVzb2x2ZXMgYSBwYXJ0aWFsIHN0YXRlIHZhbHVlIHdpdGggaXRzIGZ1bGwgcmVwcmVzZW50YXRpb24gaW4gdGhpcyBtYWNoaW5lLlxyXG4gICAqXHJcbiAgICogQHBhcmFtIHN0YXRlVmFsdWUgVGhlIHBhcnRpYWwgc3RhdGUgdmFsdWUgdG8gcmVzb2x2ZS5cclxuICAgKi9cblxuXG4gIFN0YXRlTm9kZS5wcm90b3R5cGUucmVzb2x2ZSA9IGZ1bmN0aW9uIChzdGF0ZVZhbHVlKSB7XG4gICAgdmFyIF9hO1xuXG4gICAgdmFyIF90aGlzID0gdGhpcztcblxuICAgIGlmICghc3RhdGVWYWx1ZSkge1xuICAgICAgcmV0dXJuIHRoaXMuaW5pdGlhbFN0YXRlVmFsdWUgfHwgRU1QVFlfT0JKRUNUOyAvLyBUT0RPOiB0eXBlLXNwZWNpZmljIHByb3BlcnRpZXNcbiAgICB9XG5cbiAgICBzd2l0Y2ggKHRoaXMudHlwZSkge1xuICAgICAgY2FzZSAncGFyYWxsZWwnOlxuICAgICAgICByZXR1cm4gbWFwVmFsdWVzKHRoaXMuaW5pdGlhbFN0YXRlVmFsdWUsIGZ1bmN0aW9uIChzdWJTdGF0ZVZhbHVlLCBzdWJTdGF0ZUtleSkge1xuICAgICAgICAgIHJldHVybiBzdWJTdGF0ZVZhbHVlID8gX3RoaXMuZ2V0U3RhdGVOb2RlKHN1YlN0YXRlS2V5KS5yZXNvbHZlKHN0YXRlVmFsdWVbc3ViU3RhdGVLZXldIHx8IHN1YlN0YXRlVmFsdWUpIDogRU1QVFlfT0JKRUNUO1xuICAgICAgICB9KTtcblxuICAgICAgY2FzZSAnY29tcG91bmQnOlxuICAgICAgICBpZiAoaXNTdHJpbmcoc3RhdGVWYWx1ZSkpIHtcbiAgICAgICAgICB2YXIgc3ViU3RhdGVOb2RlID0gdGhpcy5nZXRTdGF0ZU5vZGUoc3RhdGVWYWx1ZSk7XG5cbiAgICAgICAgICBpZiAoc3ViU3RhdGVOb2RlLnR5cGUgPT09ICdwYXJhbGxlbCcgfHwgc3ViU3RhdGVOb2RlLnR5cGUgPT09ICdjb21wb3VuZCcpIHtcbiAgICAgICAgICAgIHJldHVybiBfYSA9IHt9LCBfYVtzdGF0ZVZhbHVlXSA9IHN1YlN0YXRlTm9kZS5pbml0aWFsU3RhdGVWYWx1ZSwgX2E7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgcmV0dXJuIHN0YXRlVmFsdWU7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoIWtleXMoc3RhdGVWYWx1ZSkubGVuZ3RoKSB7XG4gICAgICAgICAgcmV0dXJuIHRoaXMuaW5pdGlhbFN0YXRlVmFsdWUgfHwge307XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gbWFwVmFsdWVzKHN0YXRlVmFsdWUsIGZ1bmN0aW9uIChzdWJTdGF0ZVZhbHVlLCBzdWJTdGF0ZUtleSkge1xuICAgICAgICAgIHJldHVybiBzdWJTdGF0ZVZhbHVlID8gX3RoaXMuZ2V0U3RhdGVOb2RlKHN1YlN0YXRlS2V5KS5yZXNvbHZlKHN1YlN0YXRlVmFsdWUpIDogRU1QVFlfT0JKRUNUO1xuICAgICAgICB9KTtcblxuICAgICAgZGVmYXVsdDpcbiAgICAgICAgcmV0dXJuIHN0YXRlVmFsdWUgfHwgRU1QVFlfT0JKRUNUO1xuICAgIH1cbiAgfTtcblxuICBTdGF0ZU5vZGUucHJvdG90eXBlLmdldFJlc29sdmVkUGF0aCA9IGZ1bmN0aW9uIChzdGF0ZUlkZW50aWZpZXIpIHtcbiAgICBpZiAoaXNTdGF0ZUlkKHN0YXRlSWRlbnRpZmllcikpIHtcbiAgICAgIHZhciBzdGF0ZU5vZGUgPSB0aGlzLm1hY2hpbmUuaWRNYXBbc3RhdGVJZGVudGlmaWVyLnNsaWNlKFNUQVRFX0lERU5USUZJRVIubGVuZ3RoKV07XG5cbiAgICAgIGlmICghc3RhdGVOb2RlKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcIlVuYWJsZSB0byBmaW5kIHN0YXRlIG5vZGUgJ1wiICsgc3RhdGVJZGVudGlmaWVyICsgXCInXCIpO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gc3RhdGVOb2RlLnBhdGg7XG4gICAgfVxuXG4gICAgcmV0dXJuIHRvU3RhdGVQYXRoKHN0YXRlSWRlbnRpZmllciwgdGhpcy5kZWxpbWl0ZXIpO1xuICB9O1xuXG4gIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShTdGF0ZU5vZGUucHJvdG90eXBlLCBcImluaXRpYWxTdGF0ZVZhbHVlXCIsIHtcbiAgICBnZXQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgIHZhciBfYTtcblxuICAgICAgaWYgKHRoaXMuX19jYWNoZS5pbml0aWFsU3RhdGVWYWx1ZSkge1xuICAgICAgICByZXR1cm4gdGhpcy5fX2NhY2hlLmluaXRpYWxTdGF0ZVZhbHVlO1xuICAgICAgfVxuXG4gICAgICB2YXIgaW5pdGlhbFN0YXRlVmFsdWU7XG5cbiAgICAgIGlmICh0aGlzLnR5cGUgPT09ICdwYXJhbGxlbCcpIHtcbiAgICAgICAgaW5pdGlhbFN0YXRlVmFsdWUgPSBtYXBGaWx0ZXJWYWx1ZXModGhpcy5zdGF0ZXMsIGZ1bmN0aW9uIChzdGF0ZSkge1xuICAgICAgICAgIHJldHVybiBzdGF0ZS5pbml0aWFsU3RhdGVWYWx1ZSB8fCBFTVBUWV9PQkpFQ1Q7XG4gICAgICAgIH0sIGZ1bmN0aW9uIChzdGF0ZU5vZGUpIHtcbiAgICAgICAgICByZXR1cm4gIShzdGF0ZU5vZGUudHlwZSA9PT0gJ2hpc3RvcnknKTtcbiAgICAgICAgfSk7XG4gICAgICB9IGVsc2UgaWYgKHRoaXMuaW5pdGlhbCAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIGlmICghdGhpcy5zdGF0ZXNbdGhpcy5pbml0aWFsXSkge1xuICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIkluaXRpYWwgc3RhdGUgJ1wiICsgdGhpcy5pbml0aWFsICsgXCInIG5vdCBmb3VuZCBvbiAnXCIgKyB0aGlzLmtleSArIFwiJ1wiKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGluaXRpYWxTdGF0ZVZhbHVlID0gaXNMZWFmTm9kZSh0aGlzLnN0YXRlc1t0aGlzLmluaXRpYWxdKSA/IHRoaXMuaW5pdGlhbCA6IChfYSA9IHt9LCBfYVt0aGlzLmluaXRpYWxdID0gdGhpcy5zdGF0ZXNbdGhpcy5pbml0aWFsXS5pbml0aWFsU3RhdGVWYWx1ZSwgX2EpO1xuICAgICAgfVxuXG4gICAgICB0aGlzLl9fY2FjaGUuaW5pdGlhbFN0YXRlVmFsdWUgPSBpbml0aWFsU3RhdGVWYWx1ZTtcbiAgICAgIHJldHVybiB0aGlzLl9fY2FjaGUuaW5pdGlhbFN0YXRlVmFsdWU7XG4gICAgfSxcbiAgICBlbnVtZXJhYmxlOiBmYWxzZSxcbiAgICBjb25maWd1cmFibGU6IHRydWVcbiAgfSk7XG5cbiAgU3RhdGVOb2RlLnByb3RvdHlwZS5nZXRJbml0aWFsU3RhdGUgPSBmdW5jdGlvbiAoc3RhdGVWYWx1ZSwgY29udGV4dCkge1xuICAgIHZhciBjb25maWd1cmF0aW9uID0gdGhpcy5nZXRTdGF0ZU5vZGVzKHN0YXRlVmFsdWUpO1xuICAgIHJldHVybiB0aGlzLnJlc29sdmVUcmFuc2l0aW9uKHtcbiAgICAgIGNvbmZpZ3VyYXRpb246IGNvbmZpZ3VyYXRpb24sXG4gICAgICBlbnRyeVNldDogY29uZmlndXJhdGlvbixcbiAgICAgIGV4aXRTZXQ6IFtdLFxuICAgICAgdHJhbnNpdGlvbnM6IFtdLFxuICAgICAgc291cmNlOiB1bmRlZmluZWQsXG4gICAgICBhY3Rpb25zOiBbXVxuICAgIH0sIHVuZGVmaW5lZCwgdW5kZWZpbmVkLCBjb250ZXh0KTtcbiAgfTtcblxuICBPYmplY3QuZGVmaW5lUHJvcGVydHkoU3RhdGVOb2RlLnByb3RvdHlwZSwgXCJpbml0aWFsU3RhdGVcIiwge1xuICAgIC8qKlxyXG4gICAgICogVGhlIGluaXRpYWwgU3RhdGUgaW5zdGFuY2UsIHdoaWNoIGluY2x1ZGVzIGFsbCBhY3Rpb25zIHRvIGJlIGV4ZWN1dGVkIGZyb21cclxuICAgICAqIGVudGVyaW5nIHRoZSBpbml0aWFsIHN0YXRlLlxyXG4gICAgICovXG4gICAgZ2V0OiBmdW5jdGlvbiAoKSB7XG4gICAgICB0aGlzLl9pbml0KCk7IC8vIFRPRE86IHRoaXMgc2hvdWxkIGJlIGluIHRoZSBjb25zdHJ1Y3RvciAoc2VlIG5vdGUgaW4gY29uc3RydWN0b3IpXG5cblxuICAgICAgdmFyIGluaXRpYWxTdGF0ZVZhbHVlID0gdGhpcy5pbml0aWFsU3RhdGVWYWx1ZTtcblxuICAgICAgaWYgKCFpbml0aWFsU3RhdGVWYWx1ZSkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJDYW5ub3QgcmV0cmlldmUgaW5pdGlhbCBzdGF0ZSBmcm9tIHNpbXBsZSBzdGF0ZSAnXCIgKyB0aGlzLmlkICsgXCInLlwiKTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHRoaXMuZ2V0SW5pdGlhbFN0YXRlKGluaXRpYWxTdGF0ZVZhbHVlKTtcbiAgICB9LFxuICAgIGVudW1lcmFibGU6IGZhbHNlLFxuICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZVxuICB9KTtcbiAgT2JqZWN0LmRlZmluZVByb3BlcnR5KFN0YXRlTm9kZS5wcm90b3R5cGUsIFwidGFyZ2V0XCIsIHtcbiAgICAvKipcclxuICAgICAqIFRoZSB0YXJnZXQgc3RhdGUgdmFsdWUgb2YgdGhlIGhpc3Rvcnkgc3RhdGUgbm9kZSwgaWYgaXQgZXhpc3RzLiBUaGlzIHJlcHJlc2VudHMgdGhlXHJcbiAgICAgKiBkZWZhdWx0IHN0YXRlIHZhbHVlIHRvIHRyYW5zaXRpb24gdG8gaWYgbm8gaGlzdG9yeSB2YWx1ZSBleGlzdHMgeWV0LlxyXG4gICAgICovXG4gICAgZ2V0OiBmdW5jdGlvbiAoKSB7XG4gICAgICB2YXIgdGFyZ2V0O1xuXG4gICAgICBpZiAodGhpcy50eXBlID09PSAnaGlzdG9yeScpIHtcbiAgICAgICAgdmFyIGhpc3RvcnlDb25maWcgPSB0aGlzLmNvbmZpZztcblxuICAgICAgICBpZiAoaXNTdHJpbmcoaGlzdG9yeUNvbmZpZy50YXJnZXQpKSB7XG4gICAgICAgICAgdGFyZ2V0ID0gaXNTdGF0ZUlkKGhpc3RvcnlDb25maWcudGFyZ2V0KSA/IHBhdGhUb1N0YXRlVmFsdWUodGhpcy5tYWNoaW5lLmdldFN0YXRlTm9kZUJ5SWQoaGlzdG9yeUNvbmZpZy50YXJnZXQpLnBhdGguc2xpY2UodGhpcy5wYXRoLmxlbmd0aCAtIDEpKSA6IGhpc3RvcnlDb25maWcudGFyZ2V0O1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHRhcmdldCA9IGhpc3RvcnlDb25maWcudGFyZ2V0O1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIHJldHVybiB0YXJnZXQ7XG4gICAgfSxcbiAgICBlbnVtZXJhYmxlOiBmYWxzZSxcbiAgICBjb25maWd1cmFibGU6IHRydWVcbiAgfSk7XG4gIC8qKlxyXG4gICAqIFJldHVybnMgdGhlIGxlYWYgbm9kZXMgZnJvbSBhIHN0YXRlIHBhdGggcmVsYXRpdmUgdG8gdGhpcyBzdGF0ZSBub2RlLlxyXG4gICAqXHJcbiAgICogQHBhcmFtIHJlbGF0aXZlU3RhdGVJZCBUaGUgcmVsYXRpdmUgc3RhdGUgcGF0aCB0byByZXRyaWV2ZSB0aGUgc3RhdGUgbm9kZXNcclxuICAgKiBAcGFyYW0gaGlzdG9yeSBUaGUgcHJldmlvdXMgc3RhdGUgdG8gcmV0cmlldmUgaGlzdG9yeVxyXG4gICAqIEBwYXJhbSByZXNvbHZlIFdoZXRoZXIgc3RhdGUgbm9kZXMgc2hvdWxkIHJlc29sdmUgdG8gaW5pdGlhbCBjaGlsZCBzdGF0ZSBub2Rlc1xyXG4gICAqL1xuXG4gIFN0YXRlTm9kZS5wcm90b3R5cGUuZ2V0UmVsYXRpdmVTdGF0ZU5vZGVzID0gZnVuY3Rpb24gKHJlbGF0aXZlU3RhdGVJZCwgaGlzdG9yeVZhbHVlLCByZXNvbHZlKSB7XG4gICAgaWYgKHJlc29sdmUgPT09IHZvaWQgMCkge1xuICAgICAgcmVzb2x2ZSA9IHRydWU7XG4gICAgfVxuXG4gICAgcmV0dXJuIHJlc29sdmUgPyByZWxhdGl2ZVN0YXRlSWQudHlwZSA9PT0gJ2hpc3RvcnknID8gcmVsYXRpdmVTdGF0ZUlkLnJlc29sdmVIaXN0b3J5KGhpc3RvcnlWYWx1ZSkgOiByZWxhdGl2ZVN0YXRlSWQuaW5pdGlhbFN0YXRlTm9kZXMgOiBbcmVsYXRpdmVTdGF0ZUlkXTtcbiAgfTtcblxuICBPYmplY3QuZGVmaW5lUHJvcGVydHkoU3RhdGVOb2RlLnByb3RvdHlwZSwgXCJpbml0aWFsU3RhdGVOb2Rlc1wiLCB7XG4gICAgZ2V0OiBmdW5jdGlvbiAoKSB7XG4gICAgICB2YXIgX3RoaXMgPSB0aGlzO1xuXG4gICAgICBpZiAoaXNMZWFmTm9kZSh0aGlzKSkge1xuICAgICAgICByZXR1cm4gW3RoaXNdO1xuICAgICAgfSAvLyBDYXNlIHdoZW4gc3RhdGUgbm9kZSBpcyBjb21wb3VuZCBidXQgbm8gaW5pdGlhbCBzdGF0ZSBpcyBkZWZpbmVkXG5cblxuICAgICAgaWYgKHRoaXMudHlwZSA9PT0gJ2NvbXBvdW5kJyAmJiAhdGhpcy5pbml0aWFsKSB7XG4gICAgICAgIGlmICghSVNfUFJPRFVDVElPTikge1xuICAgICAgICAgIHdhcm4oZmFsc2UsIFwiQ29tcG91bmQgc3RhdGUgbm9kZSAnXCIgKyB0aGlzLmlkICsgXCInIGhhcyBubyBpbml0aWFsIHN0YXRlLlwiKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBbdGhpc107XG4gICAgICB9XG5cbiAgICAgIHZhciBpbml0aWFsU3RhdGVOb2RlUGF0aHMgPSB0b1N0YXRlUGF0aHModGhpcy5pbml0aWFsU3RhdGVWYWx1ZSk7XG4gICAgICByZXR1cm4gZmxhdHRlbihpbml0aWFsU3RhdGVOb2RlUGF0aHMubWFwKGZ1bmN0aW9uIChpbml0aWFsUGF0aCkge1xuICAgICAgICByZXR1cm4gX3RoaXMuZ2V0RnJvbVJlbGF0aXZlUGF0aChpbml0aWFsUGF0aCk7XG4gICAgICB9KSk7XG4gICAgfSxcbiAgICBlbnVtZXJhYmxlOiBmYWxzZSxcbiAgICBjb25maWd1cmFibGU6IHRydWVcbiAgfSk7XG4gIC8qKlxyXG4gICAqIFJldHJpZXZlcyBzdGF0ZSBub2RlcyBmcm9tIGEgcmVsYXRpdmUgcGF0aCB0byB0aGlzIHN0YXRlIG5vZGUuXHJcbiAgICpcclxuICAgKiBAcGFyYW0gcmVsYXRpdmVQYXRoIFRoZSByZWxhdGl2ZSBwYXRoIGZyb20gdGhpcyBzdGF0ZSBub2RlXHJcbiAgICogQHBhcmFtIGhpc3RvcnlWYWx1ZVxyXG4gICAqL1xuXG4gIFN0YXRlTm9kZS5wcm90b3R5cGUuZ2V0RnJvbVJlbGF0aXZlUGF0aCA9IGZ1bmN0aW9uIChyZWxhdGl2ZVBhdGgpIHtcbiAgICBpZiAoIXJlbGF0aXZlUGF0aC5sZW5ndGgpIHtcbiAgICAgIHJldHVybiBbdGhpc107XG4gICAgfVxuXG4gICAgdmFyIF9hID0gX19yZWFkKHJlbGF0aXZlUGF0aCksXG4gICAgICAgIHN0YXRlS2V5ID0gX2FbMF0sXG4gICAgICAgIGNoaWxkU3RhdGVQYXRoID0gX2Euc2xpY2UoMSk7XG5cbiAgICBpZiAoIXRoaXMuc3RhdGVzKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXCJDYW5ub3QgcmV0cmlldmUgc3ViUGF0aCAnXCIgKyBzdGF0ZUtleSArIFwiJyBmcm9tIG5vZGUgd2l0aCBubyBzdGF0ZXNcIik7XG4gICAgfVxuXG4gICAgdmFyIGNoaWxkU3RhdGVOb2RlID0gdGhpcy5nZXRTdGF0ZU5vZGUoc3RhdGVLZXkpO1xuXG4gICAgaWYgKGNoaWxkU3RhdGVOb2RlLnR5cGUgPT09ICdoaXN0b3J5Jykge1xuICAgICAgcmV0dXJuIGNoaWxkU3RhdGVOb2RlLnJlc29sdmVIaXN0b3J5KCk7XG4gICAgfVxuXG4gICAgaWYgKCF0aGlzLnN0YXRlc1tzdGF0ZUtleV0pIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihcIkNoaWxkIHN0YXRlICdcIiArIHN0YXRlS2V5ICsgXCInIGRvZXMgbm90IGV4aXN0IG9uICdcIiArIHRoaXMuaWQgKyBcIidcIik7XG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXMuc3RhdGVzW3N0YXRlS2V5XS5nZXRGcm9tUmVsYXRpdmVQYXRoKGNoaWxkU3RhdGVQYXRoKTtcbiAgfTtcblxuICBTdGF0ZU5vZGUucHJvdG90eXBlLmhpc3RvcnlWYWx1ZSA9IGZ1bmN0aW9uIChyZWxhdGl2ZVN0YXRlVmFsdWUpIHtcbiAgICBpZiAoIWtleXModGhpcy5zdGF0ZXMpLmxlbmd0aCkge1xuICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgICB9XG5cbiAgICByZXR1cm4ge1xuICAgICAgY3VycmVudDogcmVsYXRpdmVTdGF0ZVZhbHVlIHx8IHRoaXMuaW5pdGlhbFN0YXRlVmFsdWUsXG4gICAgICBzdGF0ZXM6IG1hcEZpbHRlclZhbHVlcyh0aGlzLnN0YXRlcywgZnVuY3Rpb24gKHN0YXRlTm9kZSwga2V5KSB7XG4gICAgICAgIGlmICghcmVsYXRpdmVTdGF0ZVZhbHVlKSB7XG4gICAgICAgICAgcmV0dXJuIHN0YXRlTm9kZS5oaXN0b3J5VmFsdWUoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHZhciBzdWJTdGF0ZVZhbHVlID0gaXNTdHJpbmcocmVsYXRpdmVTdGF0ZVZhbHVlKSA/IHVuZGVmaW5lZCA6IHJlbGF0aXZlU3RhdGVWYWx1ZVtrZXldO1xuICAgICAgICByZXR1cm4gc3RhdGVOb2RlLmhpc3RvcnlWYWx1ZShzdWJTdGF0ZVZhbHVlIHx8IHN0YXRlTm9kZS5pbml0aWFsU3RhdGVWYWx1ZSk7XG4gICAgICB9LCBmdW5jdGlvbiAoc3RhdGVOb2RlKSB7XG4gICAgICAgIHJldHVybiAhc3RhdGVOb2RlLmhpc3Rvcnk7XG4gICAgICB9KVxuICAgIH07XG4gIH07XG4gIC8qKlxyXG4gICAqIFJlc29sdmVzIHRvIHRoZSBoaXN0b3JpY2FsIHZhbHVlKHMpIG9mIHRoZSBwYXJlbnQgc3RhdGUgbm9kZSxcclxuICAgKiByZXByZXNlbnRlZCBieSBzdGF0ZSBub2Rlcy5cclxuICAgKlxyXG4gICAqIEBwYXJhbSBoaXN0b3J5VmFsdWVcclxuICAgKi9cblxuXG4gIFN0YXRlTm9kZS5wcm90b3R5cGUucmVzb2x2ZUhpc3RvcnkgPSBmdW5jdGlvbiAoaGlzdG9yeVZhbHVlKSB7XG4gICAgdmFyIF90aGlzID0gdGhpcztcblxuICAgIGlmICh0aGlzLnR5cGUgIT09ICdoaXN0b3J5Jykge1xuICAgICAgcmV0dXJuIFt0aGlzXTtcbiAgICB9XG5cbiAgICB2YXIgcGFyZW50ID0gdGhpcy5wYXJlbnQ7XG5cbiAgICBpZiAoIWhpc3RvcnlWYWx1ZSkge1xuICAgICAgdmFyIGhpc3RvcnlUYXJnZXQgPSB0aGlzLnRhcmdldDtcbiAgICAgIHJldHVybiBoaXN0b3J5VGFyZ2V0ID8gZmxhdHRlbih0b1N0YXRlUGF0aHMoaGlzdG9yeVRhcmdldCkubWFwKGZ1bmN0aW9uIChyZWxhdGl2ZUNoaWxkUGF0aCkge1xuICAgICAgICByZXR1cm4gcGFyZW50LmdldEZyb21SZWxhdGl2ZVBhdGgocmVsYXRpdmVDaGlsZFBhdGgpO1xuICAgICAgfSkpIDogcGFyZW50LmluaXRpYWxTdGF0ZU5vZGVzO1xuICAgIH1cblxuICAgIHZhciBzdWJIaXN0b3J5VmFsdWUgPSBuZXN0ZWRQYXRoKHBhcmVudC5wYXRoLCAnc3RhdGVzJykoaGlzdG9yeVZhbHVlKS5jdXJyZW50O1xuXG4gICAgaWYgKGlzU3RyaW5nKHN1Ykhpc3RvcnlWYWx1ZSkpIHtcbiAgICAgIHJldHVybiBbcGFyZW50LmdldFN0YXRlTm9kZShzdWJIaXN0b3J5VmFsdWUpXTtcbiAgICB9XG5cbiAgICByZXR1cm4gZmxhdHRlbih0b1N0YXRlUGF0aHMoc3ViSGlzdG9yeVZhbHVlKS5tYXAoZnVuY3Rpb24gKHN1YlN0YXRlUGF0aCkge1xuICAgICAgcmV0dXJuIF90aGlzLmhpc3RvcnkgPT09ICdkZWVwJyA/IHBhcmVudC5nZXRGcm9tUmVsYXRpdmVQYXRoKHN1YlN0YXRlUGF0aCkgOiBbcGFyZW50LnN0YXRlc1tzdWJTdGF0ZVBhdGhbMF1dXTtcbiAgICB9KSk7XG4gIH07XG5cbiAgT2JqZWN0LmRlZmluZVByb3BlcnR5KFN0YXRlTm9kZS5wcm90b3R5cGUsIFwic3RhdGVJZHNcIiwge1xuICAgIC8qKlxyXG4gICAgICogQWxsIHRoZSBzdGF0ZSBub2RlIElEcyBvZiB0aGlzIHN0YXRlIG5vZGUgYW5kIGl0cyBkZXNjZW5kYW50IHN0YXRlIG5vZGVzLlxyXG4gICAgICovXG4gICAgZ2V0OiBmdW5jdGlvbiAoKSB7XG4gICAgICB2YXIgX3RoaXMgPSB0aGlzO1xuXG4gICAgICB2YXIgY2hpbGRTdGF0ZUlkcyA9IGZsYXR0ZW4oa2V5cyh0aGlzLnN0YXRlcykubWFwKGZ1bmN0aW9uIChzdGF0ZUtleSkge1xuICAgICAgICByZXR1cm4gX3RoaXMuc3RhdGVzW3N0YXRlS2V5XS5zdGF0ZUlkcztcbiAgICAgIH0pKTtcbiAgICAgIHJldHVybiBbdGhpcy5pZF0uY29uY2F0KGNoaWxkU3RhdGVJZHMpO1xuICAgIH0sXG4gICAgZW51bWVyYWJsZTogZmFsc2UsXG4gICAgY29uZmlndXJhYmxlOiB0cnVlXG4gIH0pO1xuICBPYmplY3QuZGVmaW5lUHJvcGVydHkoU3RhdGVOb2RlLnByb3RvdHlwZSwgXCJldmVudHNcIiwge1xuICAgIC8qKlxyXG4gICAgICogQWxsIHRoZSBldmVudCB0eXBlcyBhY2NlcHRlZCBieSB0aGlzIHN0YXRlIG5vZGUgYW5kIGl0cyBkZXNjZW5kYW50cy5cclxuICAgICAqL1xuICAgIGdldDogZnVuY3Rpb24gKCkge1xuICAgICAgdmFyIGVfNywgX2EsIGVfOCwgX2I7XG5cbiAgICAgIGlmICh0aGlzLl9fY2FjaGUuZXZlbnRzKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9fY2FjaGUuZXZlbnRzO1xuICAgICAgfVxuXG4gICAgICB2YXIgc3RhdGVzID0gdGhpcy5zdGF0ZXM7XG4gICAgICB2YXIgZXZlbnRzID0gbmV3IFNldCh0aGlzLm93bkV2ZW50cyk7XG5cbiAgICAgIGlmIChzdGF0ZXMpIHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICBmb3IgKHZhciBfYyA9IF9fdmFsdWVzKGtleXMoc3RhdGVzKSksIF9kID0gX2MubmV4dCgpOyAhX2QuZG9uZTsgX2QgPSBfYy5uZXh0KCkpIHtcbiAgICAgICAgICAgIHZhciBzdGF0ZUlkID0gX2QudmFsdWU7XG4gICAgICAgICAgICB2YXIgc3RhdGUgPSBzdGF0ZXNbc3RhdGVJZF07XG5cbiAgICAgICAgICAgIGlmIChzdGF0ZS5zdGF0ZXMpIHtcbiAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICBmb3IgKHZhciBfZSA9IChlXzggPSB2b2lkIDAsIF9fdmFsdWVzKHN0YXRlLmV2ZW50cykpLCBfZiA9IF9lLm5leHQoKTsgIV9mLmRvbmU7IF9mID0gX2UubmV4dCgpKSB7XG4gICAgICAgICAgICAgICAgICB2YXIgZXZlbnRfMSA9IF9mLnZhbHVlO1xuICAgICAgICAgICAgICAgICAgZXZlbnRzLmFkZChcIlwiICsgZXZlbnRfMSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICB9IGNhdGNoIChlXzhfMSkge1xuICAgICAgICAgICAgICAgIGVfOCA9IHtcbiAgICAgICAgICAgICAgICAgIGVycm9yOiBlXzhfMVxuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgIH0gZmluYWxseSB7XG4gICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgIGlmIChfZiAmJiAhX2YuZG9uZSAmJiAoX2IgPSBfZS5yZXR1cm4pKSBfYi5jYWxsKF9lKTtcbiAgICAgICAgICAgICAgICB9IGZpbmFsbHkge1xuICAgICAgICAgICAgICAgICAgaWYgKGVfOCkgdGhyb3cgZV84LmVycm9yO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfSBjYXRjaCAoZV83XzEpIHtcbiAgICAgICAgICBlXzcgPSB7XG4gICAgICAgICAgICBlcnJvcjogZV83XzFcbiAgICAgICAgICB9O1xuICAgICAgICB9IGZpbmFsbHkge1xuICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICBpZiAoX2QgJiYgIV9kLmRvbmUgJiYgKF9hID0gX2MucmV0dXJuKSkgX2EuY2FsbChfYyk7XG4gICAgICAgICAgfSBmaW5hbGx5IHtcbiAgICAgICAgICAgIGlmIChlXzcpIHRocm93IGVfNy5lcnJvcjtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHRoaXMuX19jYWNoZS5ldmVudHMgPSBBcnJheS5mcm9tKGV2ZW50cyk7XG4gICAgfSxcbiAgICBlbnVtZXJhYmxlOiBmYWxzZSxcbiAgICBjb25maWd1cmFibGU6IHRydWVcbiAgfSk7XG4gIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShTdGF0ZU5vZGUucHJvdG90eXBlLCBcIm93bkV2ZW50c1wiLCB7XG4gICAgLyoqXHJcbiAgICAgKiBBbGwgdGhlIGV2ZW50cyB0aGF0IGhhdmUgdHJhbnNpdGlvbnMgZGlyZWN0bHkgZnJvbSB0aGlzIHN0YXRlIG5vZGUuXHJcbiAgICAgKlxyXG4gICAgICogRXhjbHVkZXMgYW55IGluZXJ0IGV2ZW50cy5cclxuICAgICAqL1xuICAgIGdldDogZnVuY3Rpb24gKCkge1xuICAgICAgdmFyIGV2ZW50cyA9IG5ldyBTZXQodGhpcy50cmFuc2l0aW9ucy5maWx0ZXIoZnVuY3Rpb24gKHRyYW5zaXRpb24pIHtcbiAgICAgICAgcmV0dXJuICEoIXRyYW5zaXRpb24udGFyZ2V0ICYmICF0cmFuc2l0aW9uLmFjdGlvbnMubGVuZ3RoICYmIHRyYW5zaXRpb24uaW50ZXJuYWwpO1xuICAgICAgfSkubWFwKGZ1bmN0aW9uICh0cmFuc2l0aW9uKSB7XG4gICAgICAgIHJldHVybiB0cmFuc2l0aW9uLmV2ZW50VHlwZTtcbiAgICAgIH0pKTtcbiAgICAgIHJldHVybiBBcnJheS5mcm9tKGV2ZW50cyk7XG4gICAgfSxcbiAgICBlbnVtZXJhYmxlOiBmYWxzZSxcbiAgICBjb25maWd1cmFibGU6IHRydWVcbiAgfSk7XG5cbiAgU3RhdGVOb2RlLnByb3RvdHlwZS5yZXNvbHZlVGFyZ2V0ID0gZnVuY3Rpb24gKF90YXJnZXQpIHtcbiAgICB2YXIgX3RoaXMgPSB0aGlzO1xuXG4gICAgaWYgKF90YXJnZXQgPT09IHVuZGVmaW5lZCkge1xuICAgICAgLy8gYW4gdW5kZWZpbmVkIHRhcmdldCBzaWduYWxzIHRoYXQgdGhlIHN0YXRlIG5vZGUgc2hvdWxkIG5vdCB0cmFuc2l0aW9uIGZyb20gdGhhdCBzdGF0ZSB3aGVuIHJlY2VpdmluZyB0aGF0IGV2ZW50XG4gICAgICByZXR1cm4gdW5kZWZpbmVkO1xuICAgIH1cblxuICAgIHJldHVybiBfdGFyZ2V0Lm1hcChmdW5jdGlvbiAodGFyZ2V0KSB7XG4gICAgICBpZiAoIWlzU3RyaW5nKHRhcmdldCkpIHtcbiAgICAgICAgcmV0dXJuIHRhcmdldDtcbiAgICAgIH1cblxuICAgICAgdmFyIGlzSW50ZXJuYWxUYXJnZXQgPSB0YXJnZXRbMF0gPT09IF90aGlzLmRlbGltaXRlcjsgLy8gSWYgaW50ZXJuYWwgdGFyZ2V0IGlzIGRlZmluZWQgb24gbWFjaGluZSxcbiAgICAgIC8vIGRvIG5vdCBpbmNsdWRlIG1hY2hpbmUga2V5IG9uIHRhcmdldFxuXG4gICAgICBpZiAoaXNJbnRlcm5hbFRhcmdldCAmJiAhX3RoaXMucGFyZW50KSB7XG4gICAgICAgIHJldHVybiBfdGhpcy5nZXRTdGF0ZU5vZGVCeVBhdGgodGFyZ2V0LnNsaWNlKDEpKTtcbiAgICAgIH1cblxuICAgICAgdmFyIHJlc29sdmVkVGFyZ2V0ID0gaXNJbnRlcm5hbFRhcmdldCA/IF90aGlzLmtleSArIHRhcmdldCA6IHRhcmdldDtcblxuICAgICAgaWYgKF90aGlzLnBhcmVudCkge1xuICAgICAgICB0cnkge1xuICAgICAgICAgIHZhciB0YXJnZXRTdGF0ZU5vZGUgPSBfdGhpcy5wYXJlbnQuZ2V0U3RhdGVOb2RlQnlQYXRoKHJlc29sdmVkVGFyZ2V0KTtcblxuICAgICAgICAgIHJldHVybiB0YXJnZXRTdGF0ZU5vZGU7XG4gICAgICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIkludmFsaWQgdHJhbnNpdGlvbiBkZWZpbml0aW9uIGZvciBzdGF0ZSBub2RlICdcIiArIF90aGlzLmlkICsgXCInOlxcblwiICsgZXJyLm1lc3NhZ2UpO1xuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gX3RoaXMuZ2V0U3RhdGVOb2RlQnlQYXRoKHJlc29sdmVkVGFyZ2V0KTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfTtcblxuICBTdGF0ZU5vZGUucHJvdG90eXBlLmZvcm1hdFRyYW5zaXRpb24gPSBmdW5jdGlvbiAodHJhbnNpdGlvbkNvbmZpZykge1xuICAgIHZhciBfdGhpcyA9IHRoaXM7XG5cbiAgICB2YXIgbm9ybWFsaXplZFRhcmdldCA9IG5vcm1hbGl6ZVRhcmdldCh0cmFuc2l0aW9uQ29uZmlnLnRhcmdldCk7XG4gICAgdmFyIGludGVybmFsID0gJ2ludGVybmFsJyBpbiB0cmFuc2l0aW9uQ29uZmlnID8gdHJhbnNpdGlvbkNvbmZpZy5pbnRlcm5hbCA6IG5vcm1hbGl6ZWRUYXJnZXQgPyBub3JtYWxpemVkVGFyZ2V0LnNvbWUoZnVuY3Rpb24gKF90YXJnZXQpIHtcbiAgICAgIHJldHVybiBpc1N0cmluZyhfdGFyZ2V0KSAmJiBfdGFyZ2V0WzBdID09PSBfdGhpcy5kZWxpbWl0ZXI7XG4gICAgfSkgOiB0cnVlO1xuICAgIHZhciBndWFyZHMgPSB0aGlzLm1hY2hpbmUub3B0aW9ucy5ndWFyZHM7XG4gICAgdmFyIHRhcmdldCA9IHRoaXMucmVzb2x2ZVRhcmdldChub3JtYWxpemVkVGFyZ2V0KTtcblxuICAgIHZhciB0cmFuc2l0aW9uID0gX19hc3NpZ24oX19hc3NpZ24oe30sIHRyYW5zaXRpb25Db25maWcpLCB7XG4gICAgICBhY3Rpb25zOiB0b0FjdGlvbk9iamVjdHModG9BcnJheSh0cmFuc2l0aW9uQ29uZmlnLmFjdGlvbnMpKSxcbiAgICAgIGNvbmQ6IHRvR3VhcmQodHJhbnNpdGlvbkNvbmZpZy5jb25kLCBndWFyZHMpLFxuICAgICAgdGFyZ2V0OiB0YXJnZXQsXG4gICAgICBzb3VyY2U6IHRoaXMsXG4gICAgICBpbnRlcm5hbDogaW50ZXJuYWwsXG4gICAgICBldmVudFR5cGU6IHRyYW5zaXRpb25Db25maWcuZXZlbnQsXG4gICAgICB0b0pTT046IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmV0dXJuIF9fYXNzaWduKF9fYXNzaWduKHt9LCB0cmFuc2l0aW9uKSwge1xuICAgICAgICAgIHRhcmdldDogdHJhbnNpdGlvbi50YXJnZXQgPyB0cmFuc2l0aW9uLnRhcmdldC5tYXAoZnVuY3Rpb24gKHQpIHtcbiAgICAgICAgICAgIHJldHVybiBcIiNcIiArIHQuaWQ7XG4gICAgICAgICAgfSkgOiB1bmRlZmluZWQsXG4gICAgICAgICAgc291cmNlOiBcIiNcIiArIF90aGlzLmlkXG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgIH0pO1xuXG4gICAgcmV0dXJuIHRyYW5zaXRpb247XG4gIH07XG5cbiAgU3RhdGVOb2RlLnByb3RvdHlwZS5mb3JtYXRUcmFuc2l0aW9ucyA9IGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgZV85LCBfYTtcblxuICAgIHZhciBfdGhpcyA9IHRoaXM7XG5cbiAgICB2YXIgb25Db25maWc7XG5cbiAgICBpZiAoIXRoaXMuY29uZmlnLm9uKSB7XG4gICAgICBvbkNvbmZpZyA9IFtdO1xuICAgIH0gZWxzZSBpZiAoQXJyYXkuaXNBcnJheSh0aGlzLmNvbmZpZy5vbikpIHtcbiAgICAgIG9uQ29uZmlnID0gdGhpcy5jb25maWcub247XG4gICAgfSBlbHNlIHtcbiAgICAgIHZhciBfYiA9IHRoaXMuY29uZmlnLm9uLFxuICAgICAgICAgIF9jID0gV0lMRENBUkQsXG4gICAgICAgICAgX2QgPSBfYltfY10sXG4gICAgICAgICAgd2lsZGNhcmRDb25maWdzID0gX2QgPT09IHZvaWQgMCA/IFtdIDogX2QsXG4gICAgICAgICAgc3RyaWN0VHJhbnNpdGlvbkNvbmZpZ3NfMSA9IF9fcmVzdChfYiwgW3R5cGVvZiBfYyA9PT0gXCJzeW1ib2xcIiA/IF9jIDogX2MgKyBcIlwiXSk7XG5cbiAgICAgIG9uQ29uZmlnID0gZmxhdHRlbihrZXlzKHN0cmljdFRyYW5zaXRpb25Db25maWdzXzEpLm1hcChmdW5jdGlvbiAoa2V5KSB7XG4gICAgICAgIGlmICghSVNfUFJPRFVDVElPTiAmJiBrZXkgPT09IE5VTExfRVZFTlQpIHtcbiAgICAgICAgICB3YXJuKGZhbHNlLCBcIkVtcHR5IHN0cmluZyB0cmFuc2l0aW9uIGNvbmZpZ3MgKGUuZy4sIGB7IG9uOiB7ICcnOiAuLi4gfX1gKSBmb3IgdHJhbnNpZW50IHRyYW5zaXRpb25zIGFyZSBkZXByZWNhdGVkLiBTcGVjaWZ5IHRoZSB0cmFuc2l0aW9uIGluIHRoZSBgeyBhbHdheXM6IC4uLiB9YCBwcm9wZXJ0eSBpbnN0ZWFkLiBcIiArIChcIlBsZWFzZSBjaGVjayB0aGUgYG9uYCBjb25maWd1cmF0aW9uIGZvciBcXFwiI1wiICsgX3RoaXMuaWQgKyBcIlxcXCIuXCIpKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHZhciB0cmFuc2l0aW9uQ29uZmlnQXJyYXkgPSB0b1RyYW5zaXRpb25Db25maWdBcnJheShrZXksIHN0cmljdFRyYW5zaXRpb25Db25maWdzXzFba2V5XSk7XG5cbiAgICAgICAgaWYgKCFJU19QUk9EVUNUSU9OKSB7XG4gICAgICAgICAgdmFsaWRhdGVBcnJheWlmaWVkVHJhbnNpdGlvbnMoX3RoaXMsIGtleSwgdHJhbnNpdGlvbkNvbmZpZ0FycmF5KTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiB0cmFuc2l0aW9uQ29uZmlnQXJyYXk7XG4gICAgICB9KS5jb25jYXQodG9UcmFuc2l0aW9uQ29uZmlnQXJyYXkoV0lMRENBUkQsIHdpbGRjYXJkQ29uZmlncykpKTtcbiAgICB9XG5cbiAgICB2YXIgZXZlbnRsZXNzQ29uZmlnID0gdGhpcy5jb25maWcuYWx3YXlzID8gdG9UcmFuc2l0aW9uQ29uZmlnQXJyYXkoJycsIHRoaXMuY29uZmlnLmFsd2F5cykgOiBbXTtcbiAgICB2YXIgZG9uZUNvbmZpZyA9IHRoaXMuY29uZmlnLm9uRG9uZSA/IHRvVHJhbnNpdGlvbkNvbmZpZ0FycmF5KFN0cmluZyhkb25lKHRoaXMuaWQpKSwgdGhpcy5jb25maWcub25Eb25lKSA6IFtdO1xuXG4gICAgaWYgKCFJU19QUk9EVUNUSU9OKSB7XG4gICAgICB3YXJuKCEodGhpcy5jb25maWcub25Eb25lICYmICF0aGlzLnBhcmVudCksIFwiUm9vdCBub2RlcyBjYW5ub3QgaGF2ZSBhbiBcXFwiLm9uRG9uZVxcXCIgdHJhbnNpdGlvbi4gUGxlYXNlIGNoZWNrIHRoZSBjb25maWcgb2YgXFxcIlwiICsgdGhpcy5pZCArIFwiXFxcIi5cIik7XG4gICAgfVxuXG4gICAgdmFyIGludm9rZUNvbmZpZyA9IGZsYXR0ZW4odGhpcy5pbnZva2UubWFwKGZ1bmN0aW9uIChpbnZva2VEZWYpIHtcbiAgICAgIHZhciBzZXR0bGVUcmFuc2l0aW9ucyA9IFtdO1xuXG4gICAgICBpZiAoaW52b2tlRGVmLm9uRG9uZSkge1xuICAgICAgICBzZXR0bGVUcmFuc2l0aW9ucy5wdXNoLmFwcGx5KHNldHRsZVRyYW5zaXRpb25zLCBfX3NwcmVhZCh0b1RyYW5zaXRpb25Db25maWdBcnJheShTdHJpbmcoZG9uZUludm9rZShpbnZva2VEZWYuaWQpKSwgaW52b2tlRGVmLm9uRG9uZSkpKTtcbiAgICAgIH1cblxuICAgICAgaWYgKGludm9rZURlZi5vbkVycm9yKSB7XG4gICAgICAgIHNldHRsZVRyYW5zaXRpb25zLnB1c2guYXBwbHkoc2V0dGxlVHJhbnNpdGlvbnMsIF9fc3ByZWFkKHRvVHJhbnNpdGlvbkNvbmZpZ0FycmF5KFN0cmluZyhlcnJvcihpbnZva2VEZWYuaWQpKSwgaW52b2tlRGVmLm9uRXJyb3IpKSk7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBzZXR0bGVUcmFuc2l0aW9ucztcbiAgICB9KSk7XG4gICAgdmFyIGRlbGF5ZWRUcmFuc2l0aW9ucyA9IHRoaXMuYWZ0ZXI7XG4gICAgdmFyIGZvcm1hdHRlZFRyYW5zaXRpb25zID0gZmxhdHRlbihfX3NwcmVhZChkb25lQ29uZmlnLCBpbnZva2VDb25maWcsIG9uQ29uZmlnLCBldmVudGxlc3NDb25maWcpLm1hcChmdW5jdGlvbiAodHJhbnNpdGlvbkNvbmZpZykge1xuICAgICAgcmV0dXJuIHRvQXJyYXkodHJhbnNpdGlvbkNvbmZpZykubWFwKGZ1bmN0aW9uICh0cmFuc2l0aW9uKSB7XG4gICAgICAgIHJldHVybiBfdGhpcy5mb3JtYXRUcmFuc2l0aW9uKHRyYW5zaXRpb24pO1xuICAgICAgfSk7XG4gICAgfSkpO1xuXG4gICAgdHJ5IHtcbiAgICAgIGZvciAodmFyIGRlbGF5ZWRUcmFuc2l0aW9uc18xID0gX192YWx1ZXMoZGVsYXllZFRyYW5zaXRpb25zKSwgZGVsYXllZFRyYW5zaXRpb25zXzFfMSA9IGRlbGF5ZWRUcmFuc2l0aW9uc18xLm5leHQoKTsgIWRlbGF5ZWRUcmFuc2l0aW9uc18xXzEuZG9uZTsgZGVsYXllZFRyYW5zaXRpb25zXzFfMSA9IGRlbGF5ZWRUcmFuc2l0aW9uc18xLm5leHQoKSkge1xuICAgICAgICB2YXIgZGVsYXllZFRyYW5zaXRpb24gPSBkZWxheWVkVHJhbnNpdGlvbnNfMV8xLnZhbHVlO1xuICAgICAgICBmb3JtYXR0ZWRUcmFuc2l0aW9ucy5wdXNoKGRlbGF5ZWRUcmFuc2l0aW9uKTtcbiAgICAgIH1cbiAgICB9IGNhdGNoIChlXzlfMSkge1xuICAgICAgZV85ID0ge1xuICAgICAgICBlcnJvcjogZV85XzFcbiAgICAgIH07XG4gICAgfSBmaW5hbGx5IHtcbiAgICAgIHRyeSB7XG4gICAgICAgIGlmIChkZWxheWVkVHJhbnNpdGlvbnNfMV8xICYmICFkZWxheWVkVHJhbnNpdGlvbnNfMV8xLmRvbmUgJiYgKF9hID0gZGVsYXllZFRyYW5zaXRpb25zXzEucmV0dXJuKSkgX2EuY2FsbChkZWxheWVkVHJhbnNpdGlvbnNfMSk7XG4gICAgICB9IGZpbmFsbHkge1xuICAgICAgICBpZiAoZV85KSB0aHJvdyBlXzkuZXJyb3I7XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIGZvcm1hdHRlZFRyYW5zaXRpb25zO1xuICB9O1xuXG4gIHJldHVybiBTdGF0ZU5vZGU7XG59KCk7XG5cbmV4cG9ydCB7IFN0YXRlTm9kZSB9OyIsImltcG9ydCB7IFN0YXRlTm9kZSB9IGZyb20gJy4vU3RhdGVOb2RlLmpzJztcblxuZnVuY3Rpb24gTWFjaGluZShjb25maWcsIG9wdGlvbnMsIGluaXRpYWxDb250ZXh0KSB7XG4gIGlmIChpbml0aWFsQ29udGV4dCA9PT0gdm9pZCAwKSB7XG4gICAgaW5pdGlhbENvbnRleHQgPSBjb25maWcuY29udGV4dDtcbiAgfVxuXG4gIHZhciByZXNvbHZlZEluaXRpYWxDb250ZXh0ID0gdHlwZW9mIGluaXRpYWxDb250ZXh0ID09PSAnZnVuY3Rpb24nID8gaW5pdGlhbENvbnRleHQoKSA6IGluaXRpYWxDb250ZXh0O1xuICByZXR1cm4gbmV3IFN0YXRlTm9kZShjb25maWcsIG9wdGlvbnMsIHJlc29sdmVkSW5pdGlhbENvbnRleHQpO1xufVxuXG5mdW5jdGlvbiBjcmVhdGVNYWNoaW5lKGNvbmZpZywgb3B0aW9ucykge1xuICB2YXIgcmVzb2x2ZWRJbml0aWFsQ29udGV4dCA9IHR5cGVvZiBjb25maWcuY29udGV4dCA9PT0gJ2Z1bmN0aW9uJyA/IGNvbmZpZy5jb250ZXh0KCkgOiBjb25maWcuY29udGV4dDtcbiAgcmV0dXJuIG5ldyBTdGF0ZU5vZGUoY29uZmlnLCBvcHRpb25zLCByZXNvbHZlZEluaXRpYWxDb250ZXh0KTtcbn1cblxuZXhwb3J0IHsgTWFjaGluZSwgY3JlYXRlTWFjaGluZSB9OyIsImltcG9ydCB7IF9fYXNzaWduIH0gZnJvbSAnLi9fdmlydHVhbC9fdHNsaWIuanMnO1xudmFyIGRlZmF1bHRPcHRpb25zID0ge1xuICBkZWZlckV2ZW50czogZmFsc2Vcbn07XG5cbnZhciBTY2hlZHVsZXIgPVxuLyojX19QVVJFX18qL1xuXG4vKiogQGNsYXNzICovXG5mdW5jdGlvbiAoKSB7XG4gIGZ1bmN0aW9uIFNjaGVkdWxlcihvcHRpb25zKSB7XG4gICAgdGhpcy5wcm9jZXNzaW5nRXZlbnQgPSBmYWxzZTtcbiAgICB0aGlzLnF1ZXVlID0gW107XG4gICAgdGhpcy5pbml0aWFsaXplZCA9IGZhbHNlO1xuICAgIHRoaXMub3B0aW9ucyA9IF9fYXNzaWduKF9fYXNzaWduKHt9LCBkZWZhdWx0T3B0aW9ucyksIG9wdGlvbnMpO1xuICB9XG5cbiAgU2NoZWR1bGVyLnByb3RvdHlwZS5pbml0aWFsaXplID0gZnVuY3Rpb24gKGNhbGxiYWNrKSB7XG4gICAgdGhpcy5pbml0aWFsaXplZCA9IHRydWU7XG5cbiAgICBpZiAoY2FsbGJhY2spIHtcbiAgICAgIGlmICghdGhpcy5vcHRpb25zLmRlZmVyRXZlbnRzKSB7XG4gICAgICAgIHRoaXMuc2NoZWR1bGUoY2FsbGJhY2spO1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIHRoaXMucHJvY2VzcyhjYWxsYmFjayk7XG4gICAgfVxuXG4gICAgdGhpcy5mbHVzaEV2ZW50cygpO1xuICB9O1xuXG4gIFNjaGVkdWxlci5wcm90b3R5cGUuc2NoZWR1bGUgPSBmdW5jdGlvbiAodGFzaykge1xuICAgIGlmICghdGhpcy5pbml0aWFsaXplZCB8fCB0aGlzLnByb2Nlc3NpbmdFdmVudCkge1xuICAgICAgdGhpcy5xdWV1ZS5wdXNoKHRhc2spO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGlmICh0aGlzLnF1ZXVlLmxlbmd0aCAhPT0gMCkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdFdmVudCBxdWV1ZSBzaG91bGQgYmUgZW1wdHkgd2hlbiBpdCBpcyBub3QgcHJvY2Vzc2luZyBldmVudHMnKTtcbiAgICB9XG5cbiAgICB0aGlzLnByb2Nlc3ModGFzayk7XG4gICAgdGhpcy5mbHVzaEV2ZW50cygpO1xuICB9O1xuXG4gIFNjaGVkdWxlci5wcm90b3R5cGUuY2xlYXIgPSBmdW5jdGlvbiAoKSB7XG4gICAgdGhpcy5xdWV1ZSA9IFtdO1xuICB9O1xuXG4gIFNjaGVkdWxlci5wcm90b3R5cGUuZmx1c2hFdmVudHMgPSBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIG5leHRDYWxsYmFjayA9IHRoaXMucXVldWUuc2hpZnQoKTtcblxuICAgIHdoaWxlIChuZXh0Q2FsbGJhY2spIHtcbiAgICAgIHRoaXMucHJvY2VzcyhuZXh0Q2FsbGJhY2spO1xuICAgICAgbmV4dENhbGxiYWNrID0gdGhpcy5xdWV1ZS5zaGlmdCgpO1xuICAgIH1cbiAgfTtcblxuICBTY2hlZHVsZXIucHJvdG90eXBlLnByb2Nlc3MgPSBmdW5jdGlvbiAoY2FsbGJhY2spIHtcbiAgICB0aGlzLnByb2Nlc3NpbmdFdmVudCA9IHRydWU7XG5cbiAgICB0cnkge1xuICAgICAgY2FsbGJhY2soKTtcbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICAvLyB0aGVyZSBpcyBubyB1c2UgdG8ga2VlcCB0aGUgZnV0dXJlIGV2ZW50c1xuICAgICAgLy8gYXMgdGhlIHNpdHVhdGlvbiBpcyBub3QgYW55bW9yZSB0aGUgc2FtZVxuICAgICAgdGhpcy5jbGVhcigpO1xuICAgICAgdGhyb3cgZTtcbiAgICB9IGZpbmFsbHkge1xuICAgICAgdGhpcy5wcm9jZXNzaW5nRXZlbnQgPSBmYWxzZTtcbiAgICB9XG4gIH07XG5cbiAgcmV0dXJuIFNjaGVkdWxlcjtcbn0oKTtcblxuZXhwb3J0IHsgU2NoZWR1bGVyIH07IiwidmFyIGNoaWxkcmVuID0gLyojX19QVVJFX18qL25ldyBNYXAoKTtcbnZhciBzZXNzaW9uSWRJbmRleCA9IDA7XG52YXIgcmVnaXN0cnkgPSB7XG4gIGJvb2tJZDogZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiBcIng6XCIgKyBzZXNzaW9uSWRJbmRleCsrO1xuICB9LFxuICByZWdpc3RlcjogZnVuY3Rpb24gKGlkLCBhY3Rvcikge1xuICAgIGNoaWxkcmVuLnNldChpZCwgYWN0b3IpO1xuICAgIHJldHVybiBpZDtcbiAgfSxcbiAgZ2V0OiBmdW5jdGlvbiAoaWQpIHtcbiAgICByZXR1cm4gY2hpbGRyZW4uZ2V0KGlkKTtcbiAgfSxcbiAgZnJlZTogZnVuY3Rpb24gKGlkKSB7XG4gICAgY2hpbGRyZW4uZGVsZXRlKGlkKTtcbiAgfVxufTtcbmV4cG9ydCB7IHJlZ2lzdHJ5IH07IiwiaW1wb3J0IHsgSVNfUFJPRFVDVElPTiB9IGZyb20gJy4vZW52aXJvbm1lbnQuanMnOyAvLyBGcm9tIGh0dHBzOi8vZGV2ZWxvcGVyLm1vemlsbGEub3JnL2VuLVVTL2RvY3MvV2ViL0phdmFTY3JpcHQvUmVmZXJlbmNlL0dsb2JhbF9PYmplY3RzL2dsb2JhbFRoaXNcblxuZnVuY3Rpb24gZ2V0R2xvYmFsKCkge1xuICBpZiAodHlwZW9mIHNlbGYgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgcmV0dXJuIHNlbGY7XG4gIH1cblxuICBpZiAodHlwZW9mIHdpbmRvdyAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICByZXR1cm4gd2luZG93O1xuICB9XG5cbiAgaWYgKHR5cGVvZiBnbG9iYWwgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgcmV0dXJuIGdsb2JhbDtcbiAgfVxuXG4gIHJldHVybiB1bmRlZmluZWQ7XG59XG5cbmZ1bmN0aW9uIGdldERldlRvb2xzKCkge1xuICB2YXIgZ2xvYmFsID0gZ2V0R2xvYmFsKCk7XG5cbiAgaWYgKGdsb2JhbCAmJiAnX194c3RhdGVfXycgaW4gZ2xvYmFsKSB7XG4gICAgcmV0dXJuIGdsb2JhbC5fX3hzdGF0ZV9fO1xuICB9XG5cbiAgcmV0dXJuIHVuZGVmaW5lZDtcbn1cblxuZnVuY3Rpb24gcmVnaXN0ZXJTZXJ2aWNlKHNlcnZpY2UpIHtcbiAgaWYgKElTX1BST0RVQ1RJT04gfHwgIWdldEdsb2JhbCgpKSB7XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgdmFyIGRldlRvb2xzID0gZ2V0RGV2VG9vbHMoKTtcblxuICBpZiAoZGV2VG9vbHMpIHtcbiAgICBkZXZUb29scy5yZWdpc3RlcihzZXJ2aWNlKTtcbiAgfVxufVxuXG5leHBvcnQgeyBnZXRHbG9iYWwsIHJlZ2lzdGVyU2VydmljZSB9OyIsImltcG9ydCB7IF9fdmFsdWVzLCBfX2Fzc2lnbiwgX19zcHJlYWQgfSBmcm9tICcuL192aXJ0dWFsL190c2xpYi5qcyc7XG5pbXBvcnQgeyBJU19QUk9EVUNUSU9OIH0gZnJvbSAnLi9lbnZpcm9ubWVudC5qcyc7XG5pbXBvcnQgeyB3YXJuLCBtYXBDb250ZXh0LCBpc0Z1bmN0aW9uLCBrZXlzLCB0b1NDWE1MRXZlbnQsIHRvSW52b2tlU291cmNlLCBpc1Byb21pc2VMaWtlLCBpc09ic2VydmFibGUsIGlzTWFjaGluZSwgcmVwb3J0VW5oYW5kbGVkRXhjZXB0aW9uT25JbnZvY2F0aW9uLCBzeW1ib2xPYnNlcnZhYmxlLCBpc0FycmF5LCB0b0V2ZW50T2JqZWN0LCBpc1N0cmluZywgaXNBY3RvciwgdW5pcXVlSWQsIHRvT2JzZXJ2ZXIgfSBmcm9tICcuL3V0aWxzLmpzJztcbmltcG9ydCB7IEFjdGlvblR5cGVzLCBTcGVjaWFsVGFyZ2V0cyB9IGZyb20gJy4vdHlwZXMuanMnO1xuaW1wb3J0IHsgaXNJbkZpbmFsU3RhdGUgfSBmcm9tICcuL3N0YXRlVXRpbHMuanMnO1xuaW1wb3J0IHsgZXJyb3JQbGF0Zm9ybSwgbG9nLCBzdG9wLCBzdGFydCwgY2FuY2VsLCBzZW5kLCB1cGRhdGUsIGVycm9yIGFzIGVycm9yJDEgfSBmcm9tICcuL2FjdGlvblR5cGVzLmpzJztcbmltcG9ydCB7IGRvbmVJbnZva2UsIGluaXRFdmVudCwgZ2V0QWN0aW9uRnVuY3Rpb24sIGVycm9yIH0gZnJvbSAnLi9hY3Rpb25zLmpzJztcbmltcG9ydCB7IGlzU3RhdGUsIFN0YXRlLCBiaW5kQWN0aW9uVG9TdGF0ZSB9IGZyb20gJy4vU3RhdGUuanMnO1xuaW1wb3J0IHsgcHJvdmlkZSwgY29uc3VtZSB9IGZyb20gJy4vc2VydmljZVNjb3BlLmpzJztcbmltcG9ydCB7IGlzU3Bhd25lZEFjdG9yLCBjcmVhdGVEZWZlcnJlZEFjdG9yIH0gZnJvbSAnLi9BY3Rvci5qcyc7XG5pbXBvcnQgeyBTY2hlZHVsZXIgfSBmcm9tICcuL3NjaGVkdWxlci5qcyc7XG5pbXBvcnQgeyByZWdpc3RyeSB9IGZyb20gJy4vcmVnaXN0cnkuanMnO1xuaW1wb3J0IHsgcmVnaXN0ZXJTZXJ2aWNlLCBnZXRHbG9iYWwgfSBmcm9tICcuL2RldlRvb2xzLmpzJztcbnZhciBERUZBVUxUX1NQQVdOX09QVElPTlMgPSB7XG4gIHN5bmM6IGZhbHNlLFxuICBhdXRvRm9yd2FyZDogZmFsc2Vcbn07XG52YXIgSW50ZXJwcmV0ZXJTdGF0dXM7XG5cbihmdW5jdGlvbiAoSW50ZXJwcmV0ZXJTdGF0dXMpIHtcbiAgSW50ZXJwcmV0ZXJTdGF0dXNbSW50ZXJwcmV0ZXJTdGF0dXNbXCJOb3RTdGFydGVkXCJdID0gMF0gPSBcIk5vdFN0YXJ0ZWRcIjtcbiAgSW50ZXJwcmV0ZXJTdGF0dXNbSW50ZXJwcmV0ZXJTdGF0dXNbXCJSdW5uaW5nXCJdID0gMV0gPSBcIlJ1bm5pbmdcIjtcbiAgSW50ZXJwcmV0ZXJTdGF0dXNbSW50ZXJwcmV0ZXJTdGF0dXNbXCJTdG9wcGVkXCJdID0gMl0gPSBcIlN0b3BwZWRcIjtcbn0pKEludGVycHJldGVyU3RhdHVzIHx8IChJbnRlcnByZXRlclN0YXR1cyA9IHt9KSk7XG5cbnZhciBJbnRlcnByZXRlciA9XG4vKiNfX1BVUkVfXyovXG5cbi8qKiBAY2xhc3MgKi9cbmZ1bmN0aW9uICgpIHtcbiAgLyoqXHJcbiAgICogQ3JlYXRlcyBhIG5ldyBJbnRlcnByZXRlciBpbnN0YW5jZSAoaS5lLiwgc2VydmljZSkgZm9yIHRoZSBnaXZlbiBtYWNoaW5lIHdpdGggdGhlIHByb3ZpZGVkIG9wdGlvbnMsIGlmIGFueS5cclxuICAgKlxyXG4gICAqIEBwYXJhbSBtYWNoaW5lIFRoZSBtYWNoaW5lIHRvIGJlIGludGVycHJldGVkXHJcbiAgICogQHBhcmFtIG9wdGlvbnMgSW50ZXJwcmV0ZXIgb3B0aW9uc1xyXG4gICAqL1xuICBmdW5jdGlvbiBJbnRlcnByZXRlcihtYWNoaW5lLCBvcHRpb25zKSB7XG4gICAgdmFyIF90aGlzID0gdGhpcztcblxuICAgIGlmIChvcHRpb25zID09PSB2b2lkIDApIHtcbiAgICAgIG9wdGlvbnMgPSBJbnRlcnByZXRlci5kZWZhdWx0T3B0aW9ucztcbiAgICB9XG5cbiAgICB0aGlzLm1hY2hpbmUgPSBtYWNoaW5lO1xuICAgIHRoaXMuc2NoZWR1bGVyID0gbmV3IFNjaGVkdWxlcigpO1xuICAgIHRoaXMuZGVsYXllZEV2ZW50c01hcCA9IHt9O1xuICAgIHRoaXMubGlzdGVuZXJzID0gbmV3IFNldCgpO1xuICAgIHRoaXMuY29udGV4dExpc3RlbmVycyA9IG5ldyBTZXQoKTtcbiAgICB0aGlzLnN0b3BMaXN0ZW5lcnMgPSBuZXcgU2V0KCk7XG4gICAgdGhpcy5kb25lTGlzdGVuZXJzID0gbmV3IFNldCgpO1xuICAgIHRoaXMuZXZlbnRMaXN0ZW5lcnMgPSBuZXcgU2V0KCk7XG4gICAgdGhpcy5zZW5kTGlzdGVuZXJzID0gbmV3IFNldCgpO1xuICAgIC8qKlxyXG4gICAgICogV2hldGhlciB0aGUgc2VydmljZSBpcyBzdGFydGVkLlxyXG4gICAgICovXG5cbiAgICB0aGlzLmluaXRpYWxpemVkID0gZmFsc2U7XG4gICAgdGhpcy5zdGF0dXMgPSBJbnRlcnByZXRlclN0YXR1cy5Ob3RTdGFydGVkO1xuICAgIHRoaXMuY2hpbGRyZW4gPSBuZXcgTWFwKCk7XG4gICAgdGhpcy5mb3J3YXJkVG8gPSBuZXcgU2V0KCk7XG4gICAgLyoqXHJcbiAgICAgKiBBbGlhcyBmb3IgSW50ZXJwcmV0ZXIucHJvdG90eXBlLnN0YXJ0XHJcbiAgICAgKi9cblxuICAgIHRoaXMuaW5pdCA9IHRoaXMuc3RhcnQ7XG4gICAgLyoqXHJcbiAgICAgKiBTZW5kcyBhbiBldmVudCB0byB0aGUgcnVubmluZyBpbnRlcnByZXRlciB0byB0cmlnZ2VyIGEgdHJhbnNpdGlvbi5cclxuICAgICAqXHJcbiAgICAgKiBBbiBhcnJheSBvZiBldmVudHMgKGJhdGNoZWQpIGNhbiBiZSBzZW50IGFzIHdlbGwsIHdoaWNoIHdpbGwgc2VuZCBhbGxcclxuICAgICAqIGJhdGNoZWQgZXZlbnRzIHRvIHRoZSBydW5uaW5nIGludGVycHJldGVyLiBUaGUgbGlzdGVuZXJzIHdpbGwgYmVcclxuICAgICAqIG5vdGlmaWVkIG9ubHkgKipvbmNlKiogd2hlbiBhbGwgZXZlbnRzIGFyZSBwcm9jZXNzZWQuXHJcbiAgICAgKlxyXG4gICAgICogQHBhcmFtIGV2ZW50IFRoZSBldmVudChzKSB0byBzZW5kXHJcbiAgICAgKi9cblxuICAgIHRoaXMuc2VuZCA9IGZ1bmN0aW9uIChldmVudCwgcGF5bG9hZCkge1xuICAgICAgaWYgKGlzQXJyYXkoZXZlbnQpKSB7XG4gICAgICAgIF90aGlzLmJhdGNoKGV2ZW50KTtcblxuICAgICAgICByZXR1cm4gX3RoaXMuc3RhdGU7XG4gICAgICB9XG5cbiAgICAgIHZhciBfZXZlbnQgPSB0b1NDWE1MRXZlbnQodG9FdmVudE9iamVjdChldmVudCwgcGF5bG9hZCkpO1xuXG4gICAgICBpZiAoX3RoaXMuc3RhdHVzID09PSBJbnRlcnByZXRlclN0YXR1cy5TdG9wcGVkKSB7XG4gICAgICAgIC8vIGRvIG5vdGhpbmdcbiAgICAgICAgaWYgKCFJU19QUk9EVUNUSU9OKSB7XG4gICAgICAgICAgd2FybihmYWxzZSwgXCJFdmVudCBcXFwiXCIgKyBfZXZlbnQubmFtZSArIFwiXFxcIiB3YXMgc2VudCB0byBzdG9wcGVkIHNlcnZpY2UgXFxcIlwiICsgX3RoaXMubWFjaGluZS5pZCArIFwiXFxcIi4gVGhpcyBzZXJ2aWNlIGhhcyBhbHJlYWR5IHJlYWNoZWQgaXRzIGZpbmFsIHN0YXRlLCBhbmQgd2lsbCBub3QgdHJhbnNpdGlvbi5cXG5FdmVudDogXCIgKyBKU09OLnN0cmluZ2lmeShfZXZlbnQuZGF0YSkpO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIF90aGlzLnN0YXRlO1xuICAgICAgfVxuXG4gICAgICBpZiAoX3RoaXMuc3RhdHVzICE9PSBJbnRlcnByZXRlclN0YXR1cy5SdW5uaW5nICYmICFfdGhpcy5vcHRpb25zLmRlZmVyRXZlbnRzKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcIkV2ZW50IFxcXCJcIiArIF9ldmVudC5uYW1lICsgXCJcXFwiIHdhcyBzZW50IHRvIHVuaW5pdGlhbGl6ZWQgc2VydmljZSBcXFwiXCIgKyBfdGhpcy5tYWNoaW5lLmlkICsgXCJcXFwiLiBNYWtlIHN1cmUgLnN0YXJ0KCkgaXMgY2FsbGVkIGZvciB0aGlzIHNlcnZpY2UsIG9yIHNldCB7IGRlZmVyRXZlbnRzOiB0cnVlIH0gaW4gdGhlIHNlcnZpY2Ugb3B0aW9ucy5cXG5FdmVudDogXCIgKyBKU09OLnN0cmluZ2lmeShfZXZlbnQuZGF0YSkpO1xuICAgICAgfVxuXG4gICAgICBfdGhpcy5zY2hlZHVsZXIuc2NoZWR1bGUoZnVuY3Rpb24gKCkge1xuICAgICAgICAvLyBGb3J3YXJkIGNvcHkgb2YgZXZlbnQgdG8gY2hpbGQgYWN0b3JzXG4gICAgICAgIF90aGlzLmZvcndhcmQoX2V2ZW50KTtcblxuICAgICAgICB2YXIgbmV4dFN0YXRlID0gX3RoaXMubmV4dFN0YXRlKF9ldmVudCk7XG5cbiAgICAgICAgX3RoaXMudXBkYXRlKG5leHRTdGF0ZSwgX2V2ZW50KTtcbiAgICAgIH0pO1xuXG4gICAgICByZXR1cm4gX3RoaXMuX3N0YXRlOyAvLyBUT0RPOiBkZXByZWNhdGUgKHNob3VsZCByZXR1cm4gdm9pZClcbiAgICAgIC8vIHRzbGludDpkaXNhYmxlLW5leHQtbGluZTpzZW1pY29sb25cbiAgICB9O1xuXG4gICAgdGhpcy5zZW5kVG8gPSBmdW5jdGlvbiAoZXZlbnQsIHRvKSB7XG4gICAgICB2YXIgaXNQYXJlbnQgPSBfdGhpcy5wYXJlbnQgJiYgKHRvID09PSBTcGVjaWFsVGFyZ2V0cy5QYXJlbnQgfHwgX3RoaXMucGFyZW50LmlkID09PSB0byk7XG4gICAgICB2YXIgdGFyZ2V0ID0gaXNQYXJlbnQgPyBfdGhpcy5wYXJlbnQgOiBpc1N0cmluZyh0bykgPyBfdGhpcy5jaGlsZHJlbi5nZXQodG8pIHx8IHJlZ2lzdHJ5LmdldCh0bykgOiBpc0FjdG9yKHRvKSA/IHRvIDogdW5kZWZpbmVkO1xuXG4gICAgICBpZiAoIXRhcmdldCkge1xuICAgICAgICBpZiAoIWlzUGFyZW50KSB7XG4gICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiVW5hYmxlIHRvIHNlbmQgZXZlbnQgdG8gY2hpbGQgJ1wiICsgdG8gKyBcIicgZnJvbSBzZXJ2aWNlICdcIiArIF90aGlzLmlkICsgXCInLlwiKTtcbiAgICAgICAgfSAvLyB0c2xpbnQ6ZGlzYWJsZS1uZXh0LWxpbmU6bm8tY29uc29sZVxuXG5cbiAgICAgICAgaWYgKCFJU19QUk9EVUNUSU9OKSB7XG4gICAgICAgICAgd2FybihmYWxzZSwgXCJTZXJ2aWNlICdcIiArIF90aGlzLmlkICsgXCInIGhhcyBubyBwYXJlbnQ6IHVuYWJsZSB0byBzZW5kIGV2ZW50IFwiICsgZXZlbnQudHlwZSk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIGlmICgnbWFjaGluZScgaW4gdGFyZ2V0KSB7XG4gICAgICAgIC8vIFNlbmQgU0NYTUwgZXZlbnRzIHRvIG1hY2hpbmVzXG4gICAgICAgIHRhcmdldC5zZW5kKF9fYXNzaWduKF9fYXNzaWduKHt9LCBldmVudCksIHtcbiAgICAgICAgICBuYW1lOiBldmVudC5uYW1lID09PSBlcnJvciQxID8gXCJcIiArIGVycm9yKF90aGlzLmlkKSA6IGV2ZW50Lm5hbWUsXG4gICAgICAgICAgb3JpZ2luOiBfdGhpcy5zZXNzaW9uSWRcbiAgICAgICAgfSkpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgLy8gU2VuZCBub3JtYWwgZXZlbnRzIHRvIG90aGVyIHRhcmdldHNcbiAgICAgICAgdGFyZ2V0LnNlbmQoZXZlbnQuZGF0YSk7XG4gICAgICB9XG4gICAgfTtcblxuICAgIHZhciByZXNvbHZlZE9wdGlvbnMgPSBfX2Fzc2lnbihfX2Fzc2lnbih7fSwgSW50ZXJwcmV0ZXIuZGVmYXVsdE9wdGlvbnMpLCBvcHRpb25zKTtcblxuICAgIHZhciBjbG9jayA9IHJlc29sdmVkT3B0aW9ucy5jbG9jayxcbiAgICAgICAgbG9nZ2VyID0gcmVzb2x2ZWRPcHRpb25zLmxvZ2dlcixcbiAgICAgICAgcGFyZW50ID0gcmVzb2x2ZWRPcHRpb25zLnBhcmVudCxcbiAgICAgICAgaWQgPSByZXNvbHZlZE9wdGlvbnMuaWQ7XG4gICAgdmFyIHJlc29sdmVkSWQgPSBpZCAhPT0gdW5kZWZpbmVkID8gaWQgOiBtYWNoaW5lLmlkO1xuICAgIHRoaXMuaWQgPSByZXNvbHZlZElkO1xuICAgIHRoaXMubG9nZ2VyID0gbG9nZ2VyO1xuICAgIHRoaXMuY2xvY2sgPSBjbG9jaztcbiAgICB0aGlzLnBhcmVudCA9IHBhcmVudDtcbiAgICB0aGlzLm9wdGlvbnMgPSByZXNvbHZlZE9wdGlvbnM7XG4gICAgdGhpcy5zY2hlZHVsZXIgPSBuZXcgU2NoZWR1bGVyKHtcbiAgICAgIGRlZmVyRXZlbnRzOiB0aGlzLm9wdGlvbnMuZGVmZXJFdmVudHNcbiAgICB9KTtcbiAgICB0aGlzLnNlc3Npb25JZCA9IHJlZ2lzdHJ5LmJvb2tJZCgpO1xuICB9XG5cbiAgT2JqZWN0LmRlZmluZVByb3BlcnR5KEludGVycHJldGVyLnByb3RvdHlwZSwgXCJpbml0aWFsU3RhdGVcIiwge1xuICAgIGdldDogZnVuY3Rpb24gKCkge1xuICAgICAgdmFyIF90aGlzID0gdGhpcztcblxuICAgICAgaWYgKHRoaXMuX2luaXRpYWxTdGF0ZSkge1xuICAgICAgICByZXR1cm4gdGhpcy5faW5pdGlhbFN0YXRlO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gcHJvdmlkZSh0aGlzLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgIF90aGlzLl9pbml0aWFsU3RhdGUgPSBfdGhpcy5tYWNoaW5lLmluaXRpYWxTdGF0ZTtcbiAgICAgICAgcmV0dXJuIF90aGlzLl9pbml0aWFsU3RhdGU7XG4gICAgICB9KTtcbiAgICB9LFxuICAgIGVudW1lcmFibGU6IGZhbHNlLFxuICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZVxuICB9KTtcbiAgT2JqZWN0LmRlZmluZVByb3BlcnR5KEludGVycHJldGVyLnByb3RvdHlwZSwgXCJzdGF0ZVwiLCB7XG4gICAgZ2V0OiBmdW5jdGlvbiAoKSB7XG4gICAgICBpZiAoIUlTX1BST0RVQ1RJT04pIHtcbiAgICAgICAgd2Fybih0aGlzLnN0YXR1cyAhPT0gSW50ZXJwcmV0ZXJTdGF0dXMuTm90U3RhcnRlZCwgXCJBdHRlbXB0ZWQgdG8gcmVhZCBzdGF0ZSBmcm9tIHVuaW5pdGlhbGl6ZWQgc2VydmljZSAnXCIgKyB0aGlzLmlkICsgXCInLiBNYWtlIHN1cmUgdGhlIHNlcnZpY2UgaXMgc3RhcnRlZCBmaXJzdC5cIik7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiB0aGlzLl9zdGF0ZTtcbiAgICB9LFxuICAgIGVudW1lcmFibGU6IGZhbHNlLFxuICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZVxuICB9KTtcbiAgLyoqXHJcbiAgICogRXhlY3V0ZXMgdGhlIGFjdGlvbnMgb2YgdGhlIGdpdmVuIHN0YXRlLCB3aXRoIHRoYXQgc3RhdGUncyBgY29udGV4dGAgYW5kIGBldmVudGAuXHJcbiAgICpcclxuICAgKiBAcGFyYW0gc3RhdGUgVGhlIHN0YXRlIHdob3NlIGFjdGlvbnMgd2lsbCBiZSBleGVjdXRlZFxyXG4gICAqIEBwYXJhbSBhY3Rpb25zQ29uZmlnIFRoZSBhY3Rpb24gaW1wbGVtZW50YXRpb25zIHRvIHVzZVxyXG4gICAqL1xuXG4gIEludGVycHJldGVyLnByb3RvdHlwZS5leGVjdXRlID0gZnVuY3Rpb24gKHN0YXRlLCBhY3Rpb25zQ29uZmlnKSB7XG4gICAgdmFyIGVfMSwgX2E7XG5cbiAgICB0cnkge1xuICAgICAgZm9yICh2YXIgX2IgPSBfX3ZhbHVlcyhzdGF0ZS5hY3Rpb25zKSwgX2MgPSBfYi5uZXh0KCk7ICFfYy5kb25lOyBfYyA9IF9iLm5leHQoKSkge1xuICAgICAgICB2YXIgYWN0aW9uID0gX2MudmFsdWU7XG4gICAgICAgIHRoaXMuZXhlYyhhY3Rpb24sIHN0YXRlLCBhY3Rpb25zQ29uZmlnKTtcbiAgICAgIH1cbiAgICB9IGNhdGNoIChlXzFfMSkge1xuICAgICAgZV8xID0ge1xuICAgICAgICBlcnJvcjogZV8xXzFcbiAgICAgIH07XG4gICAgfSBmaW5hbGx5IHtcbiAgICAgIHRyeSB7XG4gICAgICAgIGlmIChfYyAmJiAhX2MuZG9uZSAmJiAoX2EgPSBfYi5yZXR1cm4pKSBfYS5jYWxsKF9iKTtcbiAgICAgIH0gZmluYWxseSB7XG4gICAgICAgIGlmIChlXzEpIHRocm93IGVfMS5lcnJvcjtcbiAgICAgIH1cbiAgICB9XG4gIH07XG5cbiAgSW50ZXJwcmV0ZXIucHJvdG90eXBlLnVwZGF0ZSA9IGZ1bmN0aW9uIChzdGF0ZSwgX2V2ZW50KSB7XG4gICAgdmFyIGVfMiwgX2EsIGVfMywgX2IsIGVfNCwgX2MsIGVfNSwgX2Q7XG5cbiAgICB2YXIgX3RoaXMgPSB0aGlzOyAvLyBBdHRhY2ggc2Vzc2lvbiBJRCB0byBzdGF0ZVxuXG5cbiAgICBzdGF0ZS5fc2Vzc2lvbmlkID0gdGhpcy5zZXNzaW9uSWQ7IC8vIFVwZGF0ZSBzdGF0ZVxuXG4gICAgdGhpcy5fc3RhdGUgPSBzdGF0ZTsgLy8gRXhlY3V0ZSBhY3Rpb25zXG5cbiAgICBpZiAodGhpcy5vcHRpb25zLmV4ZWN1dGUpIHtcbiAgICAgIHRoaXMuZXhlY3V0ZSh0aGlzLnN0YXRlKTtcbiAgICB9IC8vIFVwZGF0ZSBjaGlsZHJlblxuXG5cbiAgICB0aGlzLmNoaWxkcmVuLmZvckVhY2goZnVuY3Rpb24gKGNoaWxkKSB7XG4gICAgICBfdGhpcy5zdGF0ZS5jaGlsZHJlbltjaGlsZC5pZF0gPSBjaGlsZDtcbiAgICB9KTsgLy8gRGV2IHRvb2xzXG5cbiAgICBpZiAodGhpcy5kZXZUb29scykge1xuICAgICAgdGhpcy5kZXZUb29scy5zZW5kKF9ldmVudC5kYXRhLCBzdGF0ZSk7XG4gICAgfSAvLyBFeGVjdXRlIGxpc3RlbmVyc1xuXG5cbiAgICBpZiAoc3RhdGUuZXZlbnQpIHtcbiAgICAgIHRyeSB7XG4gICAgICAgIGZvciAodmFyIF9lID0gX192YWx1ZXModGhpcy5ldmVudExpc3RlbmVycyksIF9mID0gX2UubmV4dCgpOyAhX2YuZG9uZTsgX2YgPSBfZS5uZXh0KCkpIHtcbiAgICAgICAgICB2YXIgbGlzdGVuZXIgPSBfZi52YWx1ZTtcbiAgICAgICAgICBsaXN0ZW5lcihzdGF0ZS5ldmVudCk7XG4gICAgICAgIH1cbiAgICAgIH0gY2F0Y2ggKGVfMl8xKSB7XG4gICAgICAgIGVfMiA9IHtcbiAgICAgICAgICBlcnJvcjogZV8yXzFcbiAgICAgICAgfTtcbiAgICAgIH0gZmluYWxseSB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgaWYgKF9mICYmICFfZi5kb25lICYmIChfYSA9IF9lLnJldHVybikpIF9hLmNhbGwoX2UpO1xuICAgICAgICB9IGZpbmFsbHkge1xuICAgICAgICAgIGlmIChlXzIpIHRocm93IGVfMi5lcnJvcjtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIHRyeSB7XG4gICAgICBmb3IgKHZhciBfZyA9IF9fdmFsdWVzKHRoaXMubGlzdGVuZXJzKSwgX2ggPSBfZy5uZXh0KCk7ICFfaC5kb25lOyBfaCA9IF9nLm5leHQoKSkge1xuICAgICAgICB2YXIgbGlzdGVuZXIgPSBfaC52YWx1ZTtcbiAgICAgICAgbGlzdGVuZXIoc3RhdGUsIHN0YXRlLmV2ZW50KTtcbiAgICAgIH1cbiAgICB9IGNhdGNoIChlXzNfMSkge1xuICAgICAgZV8zID0ge1xuICAgICAgICBlcnJvcjogZV8zXzFcbiAgICAgIH07XG4gICAgfSBmaW5hbGx5IHtcbiAgICAgIHRyeSB7XG4gICAgICAgIGlmIChfaCAmJiAhX2guZG9uZSAmJiAoX2IgPSBfZy5yZXR1cm4pKSBfYi5jYWxsKF9nKTtcbiAgICAgIH0gZmluYWxseSB7XG4gICAgICAgIGlmIChlXzMpIHRocm93IGVfMy5lcnJvcjtcbiAgICAgIH1cbiAgICB9XG5cbiAgICB0cnkge1xuICAgICAgZm9yICh2YXIgX2ogPSBfX3ZhbHVlcyh0aGlzLmNvbnRleHRMaXN0ZW5lcnMpLCBfayA9IF9qLm5leHQoKTsgIV9rLmRvbmU7IF9rID0gX2oubmV4dCgpKSB7XG4gICAgICAgIHZhciBjb250ZXh0TGlzdGVuZXIgPSBfay52YWx1ZTtcbiAgICAgICAgY29udGV4dExpc3RlbmVyKHRoaXMuc3RhdGUuY29udGV4dCwgdGhpcy5zdGF0ZS5oaXN0b3J5ID8gdGhpcy5zdGF0ZS5oaXN0b3J5LmNvbnRleHQgOiB1bmRlZmluZWQpO1xuICAgICAgfVxuICAgIH0gY2F0Y2ggKGVfNF8xKSB7XG4gICAgICBlXzQgPSB7XG4gICAgICAgIGVycm9yOiBlXzRfMVxuICAgICAgfTtcbiAgICB9IGZpbmFsbHkge1xuICAgICAgdHJ5IHtcbiAgICAgICAgaWYgKF9rICYmICFfay5kb25lICYmIChfYyA9IF9qLnJldHVybikpIF9jLmNhbGwoX2opO1xuICAgICAgfSBmaW5hbGx5IHtcbiAgICAgICAgaWYgKGVfNCkgdGhyb3cgZV80LmVycm9yO1xuICAgICAgfVxuICAgIH1cblxuICAgIHZhciBpc0RvbmUgPSBpc0luRmluYWxTdGF0ZShzdGF0ZS5jb25maWd1cmF0aW9uIHx8IFtdLCB0aGlzLm1hY2hpbmUpO1xuXG4gICAgaWYgKHRoaXMuc3RhdGUuY29uZmlndXJhdGlvbiAmJiBpc0RvbmUpIHtcbiAgICAgIC8vIGdldCBmaW5hbCBjaGlsZCBzdGF0ZSBub2RlXG4gICAgICB2YXIgZmluYWxDaGlsZFN0YXRlTm9kZSA9IHN0YXRlLmNvbmZpZ3VyYXRpb24uZmluZChmdW5jdGlvbiAoc24pIHtcbiAgICAgICAgcmV0dXJuIHNuLnR5cGUgPT09ICdmaW5hbCcgJiYgc24ucGFyZW50ID09PSBfdGhpcy5tYWNoaW5lO1xuICAgICAgfSk7XG4gICAgICB2YXIgZG9uZURhdGEgPSBmaW5hbENoaWxkU3RhdGVOb2RlICYmIGZpbmFsQ2hpbGRTdGF0ZU5vZGUuZG9uZURhdGEgPyBtYXBDb250ZXh0KGZpbmFsQ2hpbGRTdGF0ZU5vZGUuZG9uZURhdGEsIHN0YXRlLmNvbnRleHQsIF9ldmVudCkgOiB1bmRlZmluZWQ7XG5cbiAgICAgIHRyeSB7XG4gICAgICAgIGZvciAodmFyIF9sID0gX192YWx1ZXModGhpcy5kb25lTGlzdGVuZXJzKSwgX20gPSBfbC5uZXh0KCk7ICFfbS5kb25lOyBfbSA9IF9sLm5leHQoKSkge1xuICAgICAgICAgIHZhciBsaXN0ZW5lciA9IF9tLnZhbHVlO1xuICAgICAgICAgIGxpc3RlbmVyKGRvbmVJbnZva2UodGhpcy5pZCwgZG9uZURhdGEpKTtcbiAgICAgICAgfVxuICAgICAgfSBjYXRjaCAoZV81XzEpIHtcbiAgICAgICAgZV81ID0ge1xuICAgICAgICAgIGVycm9yOiBlXzVfMVxuICAgICAgICB9O1xuICAgICAgfSBmaW5hbGx5IHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICBpZiAoX20gJiYgIV9tLmRvbmUgJiYgKF9kID0gX2wucmV0dXJuKSkgX2QuY2FsbChfbCk7XG4gICAgICAgIH0gZmluYWxseSB7XG4gICAgICAgICAgaWYgKGVfNSkgdGhyb3cgZV81LmVycm9yO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIHRoaXMuc3RvcCgpO1xuICAgIH1cbiAgfTtcbiAgLypcclxuICAgKiBBZGRzIGEgbGlzdGVuZXIgdGhhdCBpcyBub3RpZmllZCB3aGVuZXZlciBhIHN0YXRlIHRyYW5zaXRpb24gaGFwcGVucy4gVGhlIGxpc3RlbmVyIGlzIGNhbGxlZCB3aXRoXHJcbiAgICogdGhlIG5leHQgc3RhdGUgYW5kIHRoZSBldmVudCBvYmplY3QgdGhhdCBjYXVzZWQgdGhlIHN0YXRlIHRyYW5zaXRpb24uXHJcbiAgICpcclxuICAgKiBAcGFyYW0gbGlzdGVuZXIgVGhlIHN0YXRlIGxpc3RlbmVyXHJcbiAgICovXG5cblxuICBJbnRlcnByZXRlci5wcm90b3R5cGUub25UcmFuc2l0aW9uID0gZnVuY3Rpb24gKGxpc3RlbmVyKSB7XG4gICAgdGhpcy5saXN0ZW5lcnMuYWRkKGxpc3RlbmVyKTsgLy8gU2VuZCBjdXJyZW50IHN0YXRlIHRvIGxpc3RlbmVyXG5cbiAgICBpZiAodGhpcy5zdGF0dXMgPT09IEludGVycHJldGVyU3RhdHVzLlJ1bm5pbmcpIHtcbiAgICAgIGxpc3RlbmVyKHRoaXMuc3RhdGUsIHRoaXMuc3RhdGUuZXZlbnQpO1xuICAgIH1cblxuICAgIHJldHVybiB0aGlzO1xuICB9O1xuXG4gIEludGVycHJldGVyLnByb3RvdHlwZS5zdWJzY3JpYmUgPSBmdW5jdGlvbiAobmV4dExpc3RlbmVyT3JPYnNlcnZlciwgXywgLy8gVE9ETzogZXJyb3IgbGlzdGVuZXJcbiAgY29tcGxldGVMaXN0ZW5lcikge1xuICAgIHZhciBfdGhpcyA9IHRoaXM7XG5cbiAgICBpZiAoIW5leHRMaXN0ZW5lck9yT2JzZXJ2ZXIpIHtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIHVuc3Vic2NyaWJlOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgcmV0dXJuIHZvaWQgMDtcbiAgICAgICAgfVxuICAgICAgfTtcbiAgICB9XG5cbiAgICB2YXIgbGlzdGVuZXI7XG4gICAgdmFyIHJlc29sdmVkQ29tcGxldGVMaXN0ZW5lciA9IGNvbXBsZXRlTGlzdGVuZXI7XG5cbiAgICBpZiAodHlwZW9mIG5leHRMaXN0ZW5lck9yT2JzZXJ2ZXIgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgIGxpc3RlbmVyID0gbmV4dExpc3RlbmVyT3JPYnNlcnZlcjtcbiAgICB9IGVsc2Uge1xuICAgICAgbGlzdGVuZXIgPSBuZXh0TGlzdGVuZXJPck9ic2VydmVyLm5leHQuYmluZChuZXh0TGlzdGVuZXJPck9ic2VydmVyKTtcbiAgICAgIHJlc29sdmVkQ29tcGxldGVMaXN0ZW5lciA9IG5leHRMaXN0ZW5lck9yT2JzZXJ2ZXIuY29tcGxldGUuYmluZChuZXh0TGlzdGVuZXJPck9ic2VydmVyKTtcbiAgICB9XG5cbiAgICB0aGlzLmxpc3RlbmVycy5hZGQobGlzdGVuZXIpOyAvLyBTZW5kIGN1cnJlbnQgc3RhdGUgdG8gbGlzdGVuZXJcblxuICAgIGlmICh0aGlzLnN0YXR1cyA9PT0gSW50ZXJwcmV0ZXJTdGF0dXMuUnVubmluZykge1xuICAgICAgbGlzdGVuZXIodGhpcy5zdGF0ZSk7XG4gICAgfVxuXG4gICAgaWYgKHJlc29sdmVkQ29tcGxldGVMaXN0ZW5lcikge1xuICAgICAgdGhpcy5vbkRvbmUocmVzb2x2ZWRDb21wbGV0ZUxpc3RlbmVyKTtcbiAgICB9XG5cbiAgICByZXR1cm4ge1xuICAgICAgdW5zdWJzY3JpYmU6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgbGlzdGVuZXIgJiYgX3RoaXMubGlzdGVuZXJzLmRlbGV0ZShsaXN0ZW5lcik7XG4gICAgICAgIHJlc29sdmVkQ29tcGxldGVMaXN0ZW5lciAmJiBfdGhpcy5kb25lTGlzdGVuZXJzLmRlbGV0ZShyZXNvbHZlZENvbXBsZXRlTGlzdGVuZXIpO1xuICAgICAgfVxuICAgIH07XG4gIH07XG4gIC8qKlxyXG4gICAqIEFkZHMgYW4gZXZlbnQgbGlzdGVuZXIgdGhhdCBpcyBub3RpZmllZCB3aGVuZXZlciBhbiBldmVudCBpcyBzZW50IHRvIHRoZSBydW5uaW5nIGludGVycHJldGVyLlxyXG4gICAqIEBwYXJhbSBsaXN0ZW5lciBUaGUgZXZlbnQgbGlzdGVuZXJcclxuICAgKi9cblxuXG4gIEludGVycHJldGVyLnByb3RvdHlwZS5vbkV2ZW50ID0gZnVuY3Rpb24gKGxpc3RlbmVyKSB7XG4gICAgdGhpcy5ldmVudExpc3RlbmVycy5hZGQobGlzdGVuZXIpO1xuICAgIHJldHVybiB0aGlzO1xuICB9O1xuICAvKipcclxuICAgKiBBZGRzIGFuIGV2ZW50IGxpc3RlbmVyIHRoYXQgaXMgbm90aWZpZWQgd2hlbmV2ZXIgYSBgc2VuZGAgZXZlbnQgb2NjdXJzLlxyXG4gICAqIEBwYXJhbSBsaXN0ZW5lciBUaGUgZXZlbnQgbGlzdGVuZXJcclxuICAgKi9cblxuXG4gIEludGVycHJldGVyLnByb3RvdHlwZS5vblNlbmQgPSBmdW5jdGlvbiAobGlzdGVuZXIpIHtcbiAgICB0aGlzLnNlbmRMaXN0ZW5lcnMuYWRkKGxpc3RlbmVyKTtcbiAgICByZXR1cm4gdGhpcztcbiAgfTtcbiAgLyoqXHJcbiAgICogQWRkcyBhIGNvbnRleHQgbGlzdGVuZXIgdGhhdCBpcyBub3RpZmllZCB3aGVuZXZlciB0aGUgc3RhdGUgY29udGV4dCBjaGFuZ2VzLlxyXG4gICAqIEBwYXJhbSBsaXN0ZW5lciBUaGUgY29udGV4dCBsaXN0ZW5lclxyXG4gICAqL1xuXG5cbiAgSW50ZXJwcmV0ZXIucHJvdG90eXBlLm9uQ2hhbmdlID0gZnVuY3Rpb24gKGxpc3RlbmVyKSB7XG4gICAgdGhpcy5jb250ZXh0TGlzdGVuZXJzLmFkZChsaXN0ZW5lcik7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH07XG4gIC8qKlxyXG4gICAqIEFkZHMgYSBsaXN0ZW5lciB0aGF0IGlzIG5vdGlmaWVkIHdoZW4gdGhlIG1hY2hpbmUgaXMgc3RvcHBlZC5cclxuICAgKiBAcGFyYW0gbGlzdGVuZXIgVGhlIGxpc3RlbmVyXHJcbiAgICovXG5cblxuICBJbnRlcnByZXRlci5wcm90b3R5cGUub25TdG9wID0gZnVuY3Rpb24gKGxpc3RlbmVyKSB7XG4gICAgdGhpcy5zdG9wTGlzdGVuZXJzLmFkZChsaXN0ZW5lcik7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH07XG4gIC8qKlxyXG4gICAqIEFkZHMgYSBzdGF0ZSBsaXN0ZW5lciB0aGF0IGlzIG5vdGlmaWVkIHdoZW4gdGhlIHN0YXRlY2hhcnQgaGFzIHJlYWNoZWQgaXRzIGZpbmFsIHN0YXRlLlxyXG4gICAqIEBwYXJhbSBsaXN0ZW5lciBUaGUgc3RhdGUgbGlzdGVuZXJcclxuICAgKi9cblxuXG4gIEludGVycHJldGVyLnByb3RvdHlwZS5vbkRvbmUgPSBmdW5jdGlvbiAobGlzdGVuZXIpIHtcbiAgICB0aGlzLmRvbmVMaXN0ZW5lcnMuYWRkKGxpc3RlbmVyKTtcbiAgICByZXR1cm4gdGhpcztcbiAgfTtcbiAgLyoqXHJcbiAgICogUmVtb3ZlcyBhIGxpc3RlbmVyLlxyXG4gICAqIEBwYXJhbSBsaXN0ZW5lciBUaGUgbGlzdGVuZXIgdG8gcmVtb3ZlXHJcbiAgICovXG5cblxuICBJbnRlcnByZXRlci5wcm90b3R5cGUub2ZmID0gZnVuY3Rpb24gKGxpc3RlbmVyKSB7XG4gICAgdGhpcy5saXN0ZW5lcnMuZGVsZXRlKGxpc3RlbmVyKTtcbiAgICB0aGlzLmV2ZW50TGlzdGVuZXJzLmRlbGV0ZShsaXN0ZW5lcik7XG4gICAgdGhpcy5zZW5kTGlzdGVuZXJzLmRlbGV0ZShsaXN0ZW5lcik7XG4gICAgdGhpcy5zdG9wTGlzdGVuZXJzLmRlbGV0ZShsaXN0ZW5lcik7XG4gICAgdGhpcy5kb25lTGlzdGVuZXJzLmRlbGV0ZShsaXN0ZW5lcik7XG4gICAgdGhpcy5jb250ZXh0TGlzdGVuZXJzLmRlbGV0ZShsaXN0ZW5lcik7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH07XG4gIC8qKlxyXG4gICAqIFN0YXJ0cyB0aGUgaW50ZXJwcmV0ZXIgZnJvbSB0aGUgZ2l2ZW4gc3RhdGUsIG9yIHRoZSBpbml0aWFsIHN0YXRlLlxyXG4gICAqIEBwYXJhbSBpbml0aWFsU3RhdGUgVGhlIHN0YXRlIHRvIHN0YXJ0IHRoZSBzdGF0ZWNoYXJ0IGZyb21cclxuICAgKi9cblxuXG4gIEludGVycHJldGVyLnByb3RvdHlwZS5zdGFydCA9IGZ1bmN0aW9uIChpbml0aWFsU3RhdGUpIHtcbiAgICB2YXIgX3RoaXMgPSB0aGlzO1xuXG4gICAgaWYgKHRoaXMuc3RhdHVzID09PSBJbnRlcnByZXRlclN0YXR1cy5SdW5uaW5nKSB7XG4gICAgICAvLyBEbyBub3QgcmVzdGFydCB0aGUgc2VydmljZSBpZiBpdCBpcyBhbHJlYWR5IHN0YXJ0ZWRcbiAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIHJlZ2lzdHJ5LnJlZ2lzdGVyKHRoaXMuc2Vzc2lvbklkLCB0aGlzKTtcbiAgICB0aGlzLmluaXRpYWxpemVkID0gdHJ1ZTtcbiAgICB0aGlzLnN0YXR1cyA9IEludGVycHJldGVyU3RhdHVzLlJ1bm5pbmc7XG4gICAgdmFyIHJlc29sdmVkU3RhdGUgPSBpbml0aWFsU3RhdGUgPT09IHVuZGVmaW5lZCA/IHRoaXMuaW5pdGlhbFN0YXRlIDogcHJvdmlkZSh0aGlzLCBmdW5jdGlvbiAoKSB7XG4gICAgICByZXR1cm4gaXNTdGF0ZShpbml0aWFsU3RhdGUpID8gX3RoaXMubWFjaGluZS5yZXNvbHZlU3RhdGUoaW5pdGlhbFN0YXRlKSA6IF90aGlzLm1hY2hpbmUucmVzb2x2ZVN0YXRlKFN0YXRlLmZyb20oaW5pdGlhbFN0YXRlLCBfdGhpcy5tYWNoaW5lLmNvbnRleHQpKTtcbiAgICB9KTtcblxuICAgIGlmICh0aGlzLm9wdGlvbnMuZGV2VG9vbHMpIHtcbiAgICAgIHRoaXMuYXR0YWNoRGV2KCk7XG4gICAgfVxuXG4gICAgdGhpcy5zY2hlZHVsZXIuaW5pdGlhbGl6ZShmdW5jdGlvbiAoKSB7XG4gICAgICBfdGhpcy51cGRhdGUocmVzb2x2ZWRTdGF0ZSwgaW5pdEV2ZW50KTtcbiAgICB9KTtcbiAgICByZXR1cm4gdGhpcztcbiAgfTtcbiAgLyoqXHJcbiAgICogU3RvcHMgdGhlIGludGVycHJldGVyIGFuZCB1bnN1YnNjcmliZSBhbGwgbGlzdGVuZXJzLlxyXG4gICAqXHJcbiAgICogVGhpcyB3aWxsIGFsc28gbm90aWZ5IHRoZSBgb25TdG9wYCBsaXN0ZW5lcnMuXHJcbiAgICovXG5cblxuICBJbnRlcnByZXRlci5wcm90b3R5cGUuc3RvcCA9IGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgZV82LCBfYSwgZV83LCBfYiwgZV84LCBfYywgZV85LCBfZCwgZV8xMCwgX2U7XG5cbiAgICB2YXIgX3RoaXMgPSB0aGlzO1xuXG4gICAgdHJ5IHtcbiAgICAgIGZvciAodmFyIF9mID0gX192YWx1ZXModGhpcy5saXN0ZW5lcnMpLCBfZyA9IF9mLm5leHQoKTsgIV9nLmRvbmU7IF9nID0gX2YubmV4dCgpKSB7XG4gICAgICAgIHZhciBsaXN0ZW5lciA9IF9nLnZhbHVlO1xuICAgICAgICB0aGlzLmxpc3RlbmVycy5kZWxldGUobGlzdGVuZXIpO1xuICAgICAgfVxuICAgIH0gY2F0Y2ggKGVfNl8xKSB7XG4gICAgICBlXzYgPSB7XG4gICAgICAgIGVycm9yOiBlXzZfMVxuICAgICAgfTtcbiAgICB9IGZpbmFsbHkge1xuICAgICAgdHJ5IHtcbiAgICAgICAgaWYgKF9nICYmICFfZy5kb25lICYmIChfYSA9IF9mLnJldHVybikpIF9hLmNhbGwoX2YpO1xuICAgICAgfSBmaW5hbGx5IHtcbiAgICAgICAgaWYgKGVfNikgdGhyb3cgZV82LmVycm9yO1xuICAgICAgfVxuICAgIH1cblxuICAgIHRyeSB7XG4gICAgICBmb3IgKHZhciBfaCA9IF9fdmFsdWVzKHRoaXMuc3RvcExpc3RlbmVycyksIF9qID0gX2gubmV4dCgpOyAhX2ouZG9uZTsgX2ogPSBfaC5uZXh0KCkpIHtcbiAgICAgICAgdmFyIGxpc3RlbmVyID0gX2oudmFsdWU7IC8vIGNhbGwgbGlzdGVuZXIsIHRoZW4gcmVtb3ZlXG5cbiAgICAgICAgbGlzdGVuZXIoKTtcbiAgICAgICAgdGhpcy5zdG9wTGlzdGVuZXJzLmRlbGV0ZShsaXN0ZW5lcik7XG4gICAgICB9XG4gICAgfSBjYXRjaCAoZV83XzEpIHtcbiAgICAgIGVfNyA9IHtcbiAgICAgICAgZXJyb3I6IGVfN18xXG4gICAgICB9O1xuICAgIH0gZmluYWxseSB7XG4gICAgICB0cnkge1xuICAgICAgICBpZiAoX2ogJiYgIV9qLmRvbmUgJiYgKF9iID0gX2gucmV0dXJuKSkgX2IuY2FsbChfaCk7XG4gICAgICB9IGZpbmFsbHkge1xuICAgICAgICBpZiAoZV83KSB0aHJvdyBlXzcuZXJyb3I7XG4gICAgICB9XG4gICAgfVxuXG4gICAgdHJ5IHtcbiAgICAgIGZvciAodmFyIF9rID0gX192YWx1ZXModGhpcy5jb250ZXh0TGlzdGVuZXJzKSwgX2wgPSBfay5uZXh0KCk7ICFfbC5kb25lOyBfbCA9IF9rLm5leHQoKSkge1xuICAgICAgICB2YXIgbGlzdGVuZXIgPSBfbC52YWx1ZTtcbiAgICAgICAgdGhpcy5jb250ZXh0TGlzdGVuZXJzLmRlbGV0ZShsaXN0ZW5lcik7XG4gICAgICB9XG4gICAgfSBjYXRjaCAoZV84XzEpIHtcbiAgICAgIGVfOCA9IHtcbiAgICAgICAgZXJyb3I6IGVfOF8xXG4gICAgICB9O1xuICAgIH0gZmluYWxseSB7XG4gICAgICB0cnkge1xuICAgICAgICBpZiAoX2wgJiYgIV9sLmRvbmUgJiYgKF9jID0gX2sucmV0dXJuKSkgX2MuY2FsbChfayk7XG4gICAgICB9IGZpbmFsbHkge1xuICAgICAgICBpZiAoZV84KSB0aHJvdyBlXzguZXJyb3I7XG4gICAgICB9XG4gICAgfVxuXG4gICAgdHJ5IHtcbiAgICAgIGZvciAodmFyIF9tID0gX192YWx1ZXModGhpcy5kb25lTGlzdGVuZXJzKSwgX28gPSBfbS5uZXh0KCk7ICFfby5kb25lOyBfbyA9IF9tLm5leHQoKSkge1xuICAgICAgICB2YXIgbGlzdGVuZXIgPSBfby52YWx1ZTtcbiAgICAgICAgdGhpcy5kb25lTGlzdGVuZXJzLmRlbGV0ZShsaXN0ZW5lcik7XG4gICAgICB9XG4gICAgfSBjYXRjaCAoZV85XzEpIHtcbiAgICAgIGVfOSA9IHtcbiAgICAgICAgZXJyb3I6IGVfOV8xXG4gICAgICB9O1xuICAgIH0gZmluYWxseSB7XG4gICAgICB0cnkge1xuICAgICAgICBpZiAoX28gJiYgIV9vLmRvbmUgJiYgKF9kID0gX20ucmV0dXJuKSkgX2QuY2FsbChfbSk7XG4gICAgICB9IGZpbmFsbHkge1xuICAgICAgICBpZiAoZV85KSB0aHJvdyBlXzkuZXJyb3I7XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKCF0aGlzLmluaXRpYWxpemVkKSB7XG4gICAgICAvLyBJbnRlcnByZXRlciBhbHJlYWR5IHN0b3BwZWQ7IGRvIG5vdGhpbmdcbiAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIHRoaXMuc3RhdGUuY29uZmlndXJhdGlvbi5mb3JFYWNoKGZ1bmN0aW9uIChzdGF0ZU5vZGUpIHtcbiAgICAgIHZhciBlXzExLCBfYTtcblxuICAgICAgdHJ5IHtcbiAgICAgICAgZm9yICh2YXIgX2IgPSBfX3ZhbHVlcyhzdGF0ZU5vZGUuZGVmaW5pdGlvbi5leGl0KSwgX2MgPSBfYi5uZXh0KCk7ICFfYy5kb25lOyBfYyA9IF9iLm5leHQoKSkge1xuICAgICAgICAgIHZhciBhY3Rpb24gPSBfYy52YWx1ZTtcblxuICAgICAgICAgIF90aGlzLmV4ZWMoYWN0aW9uLCBfdGhpcy5zdGF0ZSk7XG4gICAgICAgIH1cbiAgICAgIH0gY2F0Y2ggKGVfMTFfMSkge1xuICAgICAgICBlXzExID0ge1xuICAgICAgICAgIGVycm9yOiBlXzExXzFcbiAgICAgICAgfTtcbiAgICAgIH0gZmluYWxseSB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgaWYgKF9jICYmICFfYy5kb25lICYmIChfYSA9IF9iLnJldHVybikpIF9hLmNhbGwoX2IpO1xuICAgICAgICB9IGZpbmFsbHkge1xuICAgICAgICAgIGlmIChlXzExKSB0aHJvdyBlXzExLmVycm9yO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSk7IC8vIFN0b3AgYWxsIGNoaWxkcmVuXG5cbiAgICB0aGlzLmNoaWxkcmVuLmZvckVhY2goZnVuY3Rpb24gKGNoaWxkKSB7XG4gICAgICBpZiAoaXNGdW5jdGlvbihjaGlsZC5zdG9wKSkge1xuICAgICAgICBjaGlsZC5zdG9wKCk7XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICB0cnkge1xuICAgICAgLy8gQ2FuY2VsIGFsbCBkZWxheWVkIGV2ZW50c1xuICAgICAgZm9yICh2YXIgX3AgPSBfX3ZhbHVlcyhrZXlzKHRoaXMuZGVsYXllZEV2ZW50c01hcCkpLCBfcSA9IF9wLm5leHQoKTsgIV9xLmRvbmU7IF9xID0gX3AubmV4dCgpKSB7XG4gICAgICAgIHZhciBrZXkgPSBfcS52YWx1ZTtcbiAgICAgICAgdGhpcy5jbG9jay5jbGVhclRpbWVvdXQodGhpcy5kZWxheWVkRXZlbnRzTWFwW2tleV0pO1xuICAgICAgfVxuICAgIH0gY2F0Y2ggKGVfMTBfMSkge1xuICAgICAgZV8xMCA9IHtcbiAgICAgICAgZXJyb3I6IGVfMTBfMVxuICAgICAgfTtcbiAgICB9IGZpbmFsbHkge1xuICAgICAgdHJ5IHtcbiAgICAgICAgaWYgKF9xICYmICFfcS5kb25lICYmIChfZSA9IF9wLnJldHVybikpIF9lLmNhbGwoX3ApO1xuICAgICAgfSBmaW5hbGx5IHtcbiAgICAgICAgaWYgKGVfMTApIHRocm93IGVfMTAuZXJyb3I7XG4gICAgICB9XG4gICAgfVxuXG4gICAgdGhpcy5zY2hlZHVsZXIuY2xlYXIoKTtcbiAgICB0aGlzLmluaXRpYWxpemVkID0gZmFsc2U7XG4gICAgdGhpcy5zdGF0dXMgPSBJbnRlcnByZXRlclN0YXR1cy5TdG9wcGVkO1xuICAgIHJlZ2lzdHJ5LmZyZWUodGhpcy5zZXNzaW9uSWQpO1xuICAgIHJldHVybiB0aGlzO1xuICB9O1xuXG4gIEludGVycHJldGVyLnByb3RvdHlwZS5iYXRjaCA9IGZ1bmN0aW9uIChldmVudHMpIHtcbiAgICB2YXIgX3RoaXMgPSB0aGlzO1xuXG4gICAgaWYgKHRoaXMuc3RhdHVzID09PSBJbnRlcnByZXRlclN0YXR1cy5Ob3RTdGFydGVkICYmIHRoaXMub3B0aW9ucy5kZWZlckV2ZW50cykge1xuICAgICAgLy8gdHNsaW50OmRpc2FibGUtbmV4dC1saW5lOm5vLWNvbnNvbGVcbiAgICAgIGlmICghSVNfUFJPRFVDVElPTikge1xuICAgICAgICB3YXJuKGZhbHNlLCBldmVudHMubGVuZ3RoICsgXCIgZXZlbnQocykgd2VyZSBzZW50IHRvIHVuaW5pdGlhbGl6ZWQgc2VydmljZSBcXFwiXCIgKyB0aGlzLm1hY2hpbmUuaWQgKyBcIlxcXCIgYW5kIGFyZSBkZWZlcnJlZC4gTWFrZSBzdXJlIC5zdGFydCgpIGlzIGNhbGxlZCBmb3IgdGhpcyBzZXJ2aWNlLlxcbkV2ZW50OiBcIiArIEpTT04uc3RyaW5naWZ5KGV2ZW50KSk7XG4gICAgICB9XG4gICAgfSBlbHNlIGlmICh0aGlzLnN0YXR1cyAhPT0gSW50ZXJwcmV0ZXJTdGF0dXMuUnVubmluZykge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCAvLyB0c2xpbnQ6ZGlzYWJsZS1uZXh0LWxpbmU6bWF4LWxpbmUtbGVuZ3RoXG4gICAgICBldmVudHMubGVuZ3RoICsgXCIgZXZlbnQocykgd2VyZSBzZW50IHRvIHVuaW5pdGlhbGl6ZWQgc2VydmljZSBcXFwiXCIgKyB0aGlzLm1hY2hpbmUuaWQgKyBcIlxcXCIuIE1ha2Ugc3VyZSAuc3RhcnQoKSBpcyBjYWxsZWQgZm9yIHRoaXMgc2VydmljZSwgb3Igc2V0IHsgZGVmZXJFdmVudHM6IHRydWUgfSBpbiB0aGUgc2VydmljZSBvcHRpb25zLlwiKTtcbiAgICB9XG5cbiAgICB0aGlzLnNjaGVkdWxlci5zY2hlZHVsZShmdW5jdGlvbiAoKSB7XG4gICAgICB2YXIgZV8xMiwgX2E7XG5cbiAgICAgIHZhciBuZXh0U3RhdGUgPSBfdGhpcy5zdGF0ZTtcbiAgICAgIHZhciBiYXRjaENoYW5nZWQgPSBmYWxzZTtcbiAgICAgIHZhciBiYXRjaGVkQWN0aW9ucyA9IFtdO1xuXG4gICAgICB2YXIgX2xvb3BfMSA9IGZ1bmN0aW9uIChldmVudF8xKSB7XG4gICAgICAgIHZhciBfZXZlbnQgPSB0b1NDWE1MRXZlbnQoZXZlbnRfMSk7XG5cbiAgICAgICAgX3RoaXMuZm9yd2FyZChfZXZlbnQpO1xuXG4gICAgICAgIG5leHRTdGF0ZSA9IHByb3ZpZGUoX3RoaXMsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICByZXR1cm4gX3RoaXMubWFjaGluZS50cmFuc2l0aW9uKG5leHRTdGF0ZSwgX2V2ZW50KTtcbiAgICAgICAgfSk7XG4gICAgICAgIGJhdGNoZWRBY3Rpb25zLnB1c2guYXBwbHkoYmF0Y2hlZEFjdGlvbnMsIF9fc3ByZWFkKG5leHRTdGF0ZS5hY3Rpb25zLm1hcChmdW5jdGlvbiAoYSkge1xuICAgICAgICAgIHJldHVybiBiaW5kQWN0aW9uVG9TdGF0ZShhLCBuZXh0U3RhdGUpO1xuICAgICAgICB9KSkpO1xuICAgICAgICBiYXRjaENoYW5nZWQgPSBiYXRjaENoYW5nZWQgfHwgISFuZXh0U3RhdGUuY2hhbmdlZDtcbiAgICAgIH07XG5cbiAgICAgIHRyeSB7XG4gICAgICAgIGZvciAodmFyIGV2ZW50c18xID0gX192YWx1ZXMoZXZlbnRzKSwgZXZlbnRzXzFfMSA9IGV2ZW50c18xLm5leHQoKTsgIWV2ZW50c18xXzEuZG9uZTsgZXZlbnRzXzFfMSA9IGV2ZW50c18xLm5leHQoKSkge1xuICAgICAgICAgIHZhciBldmVudF8xID0gZXZlbnRzXzFfMS52YWx1ZTtcblxuICAgICAgICAgIF9sb29wXzEoZXZlbnRfMSk7XG4gICAgICAgIH1cbiAgICAgIH0gY2F0Y2ggKGVfMTJfMSkge1xuICAgICAgICBlXzEyID0ge1xuICAgICAgICAgIGVycm9yOiBlXzEyXzFcbiAgICAgICAgfTtcbiAgICAgIH0gZmluYWxseSB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgaWYgKGV2ZW50c18xXzEgJiYgIWV2ZW50c18xXzEuZG9uZSAmJiAoX2EgPSBldmVudHNfMS5yZXR1cm4pKSBfYS5jYWxsKGV2ZW50c18xKTtcbiAgICAgICAgfSBmaW5hbGx5IHtcbiAgICAgICAgICBpZiAoZV8xMikgdGhyb3cgZV8xMi5lcnJvcjtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBuZXh0U3RhdGUuY2hhbmdlZCA9IGJhdGNoQ2hhbmdlZDtcbiAgICAgIG5leHRTdGF0ZS5hY3Rpb25zID0gYmF0Y2hlZEFjdGlvbnM7XG5cbiAgICAgIF90aGlzLnVwZGF0ZShuZXh0U3RhdGUsIHRvU0NYTUxFdmVudChldmVudHNbZXZlbnRzLmxlbmd0aCAtIDFdKSk7XG4gICAgfSk7XG4gIH07XG4gIC8qKlxyXG4gICAqIFJldHVybnMgYSBzZW5kIGZ1bmN0aW9uIGJvdW5kIHRvIHRoaXMgaW50ZXJwcmV0ZXIgaW5zdGFuY2UuXHJcbiAgICpcclxuICAgKiBAcGFyYW0gZXZlbnQgVGhlIGV2ZW50IHRvIGJlIHNlbnQgYnkgdGhlIHNlbmRlci5cclxuICAgKi9cblxuXG4gIEludGVycHJldGVyLnByb3RvdHlwZS5zZW5kZXIgPSBmdW5jdGlvbiAoZXZlbnQpIHtcbiAgICByZXR1cm4gdGhpcy5zZW5kLmJpbmQodGhpcywgZXZlbnQpO1xuICB9O1xuICAvKipcclxuICAgKiBSZXR1cm5zIHRoZSBuZXh0IHN0YXRlIGdpdmVuIHRoZSBpbnRlcnByZXRlcidzIGN1cnJlbnQgc3RhdGUgYW5kIHRoZSBldmVudC5cclxuICAgKlxyXG4gICAqIFRoaXMgaXMgYSBwdXJlIG1ldGhvZCB0aGF0IGRvZXMgX25vdF8gdXBkYXRlIHRoZSBpbnRlcnByZXRlcidzIHN0YXRlLlxyXG4gICAqXHJcbiAgICogQHBhcmFtIGV2ZW50IFRoZSBldmVudCB0byBkZXRlcm1pbmUgdGhlIG5leHQgc3RhdGVcclxuICAgKi9cblxuXG4gIEludGVycHJldGVyLnByb3RvdHlwZS5uZXh0U3RhdGUgPSBmdW5jdGlvbiAoZXZlbnQpIHtcbiAgICB2YXIgX3RoaXMgPSB0aGlzO1xuXG4gICAgdmFyIF9ldmVudCA9IHRvU0NYTUxFdmVudChldmVudCk7XG5cbiAgICBpZiAoX2V2ZW50Lm5hbWUuaW5kZXhPZihlcnJvclBsYXRmb3JtKSA9PT0gMCAmJiAhdGhpcy5zdGF0ZS5uZXh0RXZlbnRzLnNvbWUoZnVuY3Rpb24gKG5leHRFdmVudCkge1xuICAgICAgcmV0dXJuIG5leHRFdmVudC5pbmRleE9mKGVycm9yUGxhdGZvcm0pID09PSAwO1xuICAgIH0pKSB7XG4gICAgICB0aHJvdyBfZXZlbnQuZGF0YS5kYXRhO1xuICAgIH1cblxuICAgIHZhciBuZXh0U3RhdGUgPSBwcm92aWRlKHRoaXMsIGZ1bmN0aW9uICgpIHtcbiAgICAgIHJldHVybiBfdGhpcy5tYWNoaW5lLnRyYW5zaXRpb24oX3RoaXMuc3RhdGUsIF9ldmVudCk7XG4gICAgfSk7XG4gICAgcmV0dXJuIG5leHRTdGF0ZTtcbiAgfTtcblxuICBJbnRlcnByZXRlci5wcm90b3R5cGUuZm9yd2FyZCA9IGZ1bmN0aW9uIChldmVudCkge1xuICAgIHZhciBlXzEzLCBfYTtcblxuICAgIHRyeSB7XG4gICAgICBmb3IgKHZhciBfYiA9IF9fdmFsdWVzKHRoaXMuZm9yd2FyZFRvKSwgX2MgPSBfYi5uZXh0KCk7ICFfYy5kb25lOyBfYyA9IF9iLm5leHQoKSkge1xuICAgICAgICB2YXIgaWQgPSBfYy52YWx1ZTtcbiAgICAgICAgdmFyIGNoaWxkID0gdGhpcy5jaGlsZHJlbi5nZXQoaWQpO1xuXG4gICAgICAgIGlmICghY2hpbGQpIHtcbiAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJVbmFibGUgdG8gZm9yd2FyZCBldmVudCAnXCIgKyBldmVudCArIFwiJyBmcm9tIGludGVycHJldGVyICdcIiArIHRoaXMuaWQgKyBcIicgdG8gbm9uZXhpc3RhbnQgY2hpbGQgJ1wiICsgaWQgKyBcIicuXCIpO1xuICAgICAgICB9XG5cbiAgICAgICAgY2hpbGQuc2VuZChldmVudCk7XG4gICAgICB9XG4gICAgfSBjYXRjaCAoZV8xM18xKSB7XG4gICAgICBlXzEzID0ge1xuICAgICAgICBlcnJvcjogZV8xM18xXG4gICAgICB9O1xuICAgIH0gZmluYWxseSB7XG4gICAgICB0cnkge1xuICAgICAgICBpZiAoX2MgJiYgIV9jLmRvbmUgJiYgKF9hID0gX2IucmV0dXJuKSkgX2EuY2FsbChfYik7XG4gICAgICB9IGZpbmFsbHkge1xuICAgICAgICBpZiAoZV8xMykgdGhyb3cgZV8xMy5lcnJvcjtcbiAgICAgIH1cbiAgICB9XG4gIH07XG5cbiAgSW50ZXJwcmV0ZXIucHJvdG90eXBlLmRlZmVyID0gZnVuY3Rpb24gKHNlbmRBY3Rpb24pIHtcbiAgICB2YXIgX3RoaXMgPSB0aGlzO1xuXG4gICAgdGhpcy5kZWxheWVkRXZlbnRzTWFwW3NlbmRBY3Rpb24uaWRdID0gdGhpcy5jbG9jay5zZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHtcbiAgICAgIGlmIChzZW5kQWN0aW9uLnRvKSB7XG4gICAgICAgIF90aGlzLnNlbmRUbyhzZW5kQWN0aW9uLl9ldmVudCwgc2VuZEFjdGlvbi50byk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBfdGhpcy5zZW5kKHNlbmRBY3Rpb24uX2V2ZW50KTtcbiAgICAgIH1cbiAgICB9LCBzZW5kQWN0aW9uLmRlbGF5KTtcbiAgfTtcblxuICBJbnRlcnByZXRlci5wcm90b3R5cGUuY2FuY2VsID0gZnVuY3Rpb24gKHNlbmRJZCkge1xuICAgIHRoaXMuY2xvY2suY2xlYXJUaW1lb3V0KHRoaXMuZGVsYXllZEV2ZW50c01hcFtzZW5kSWRdKTtcbiAgICBkZWxldGUgdGhpcy5kZWxheWVkRXZlbnRzTWFwW3NlbmRJZF07XG4gIH07XG5cbiAgSW50ZXJwcmV0ZXIucHJvdG90eXBlLmV4ZWMgPSBmdW5jdGlvbiAoYWN0aW9uLCBzdGF0ZSwgYWN0aW9uRnVuY3Rpb25NYXApIHtcbiAgICBpZiAoYWN0aW9uRnVuY3Rpb25NYXAgPT09IHZvaWQgMCkge1xuICAgICAgYWN0aW9uRnVuY3Rpb25NYXAgPSB0aGlzLm1hY2hpbmUub3B0aW9ucy5hY3Rpb25zO1xuICAgIH1cblxuICAgIHZhciBjb250ZXh0ID0gc3RhdGUuY29udGV4dCxcbiAgICAgICAgX2V2ZW50ID0gc3RhdGUuX2V2ZW50O1xuICAgIHZhciBhY3Rpb25PckV4ZWMgPSBhY3Rpb24uZXhlYyB8fCBnZXRBY3Rpb25GdW5jdGlvbihhY3Rpb24udHlwZSwgYWN0aW9uRnVuY3Rpb25NYXApO1xuICAgIHZhciBleGVjID0gaXNGdW5jdGlvbihhY3Rpb25PckV4ZWMpID8gYWN0aW9uT3JFeGVjIDogYWN0aW9uT3JFeGVjID8gYWN0aW9uT3JFeGVjLmV4ZWMgOiBhY3Rpb24uZXhlYztcblxuICAgIGlmIChleGVjKSB7XG4gICAgICB0cnkge1xuICAgICAgICByZXR1cm4gZXhlYyhjb250ZXh0LCBfZXZlbnQuZGF0YSwge1xuICAgICAgICAgIGFjdGlvbjogYWN0aW9uLFxuICAgICAgICAgIHN0YXRlOiB0aGlzLnN0YXRlLFxuICAgICAgICAgIF9ldmVudDogX2V2ZW50XG4gICAgICAgIH0pO1xuICAgICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAgIGlmICh0aGlzLnBhcmVudCkge1xuICAgICAgICAgIHRoaXMucGFyZW50LnNlbmQoe1xuICAgICAgICAgICAgdHlwZTogJ3hzdGF0ZS5lcnJvcicsXG4gICAgICAgICAgICBkYXRhOiBlcnJcbiAgICAgICAgICB9KTtcbiAgICAgICAgfVxuXG4gICAgICAgIHRocm93IGVycjtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBzd2l0Y2ggKGFjdGlvbi50eXBlKSB7XG4gICAgICBjYXNlIHNlbmQ6XG4gICAgICAgIHZhciBzZW5kQWN0aW9uID0gYWN0aW9uO1xuXG4gICAgICAgIGlmICh0eXBlb2Ygc2VuZEFjdGlvbi5kZWxheSA9PT0gJ251bWJlcicpIHtcbiAgICAgICAgICB0aGlzLmRlZmVyKHNlbmRBY3Rpb24pO1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBpZiAoc2VuZEFjdGlvbi50bykge1xuICAgICAgICAgICAgdGhpcy5zZW5kVG8oc2VuZEFjdGlvbi5fZXZlbnQsIHNlbmRBY3Rpb24udG8pO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLnNlbmQoc2VuZEFjdGlvbi5fZXZlbnQpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGJyZWFrO1xuXG4gICAgICBjYXNlIGNhbmNlbDpcbiAgICAgICAgdGhpcy5jYW5jZWwoYWN0aW9uLnNlbmRJZCk7XG4gICAgICAgIGJyZWFrO1xuXG4gICAgICBjYXNlIHN0YXJ0OlxuICAgICAgICB7XG4gICAgICAgICAgdmFyIGFjdGl2aXR5ID0gYWN0aW9uLmFjdGl2aXR5OyAvLyBJZiB0aGUgYWN0aXZpdHkgd2lsbCBiZSBzdG9wcGVkIHJpZ2h0IGFmdGVyIGl0J3Mgc3RhcnRlZFxuICAgICAgICAgIC8vIChzdWNoIGFzIGluIHRyYW5zaWVudCBzdGF0ZXMpXG4gICAgICAgICAgLy8gZG9uJ3QgYm90aGVyIHN0YXJ0aW5nIHRoZSBhY3Rpdml0eS5cblxuICAgICAgICAgIGlmICghdGhpcy5zdGF0ZS5hY3Rpdml0aWVzW2FjdGl2aXR5LmlkIHx8IGFjdGl2aXR5LnR5cGVdKSB7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICB9IC8vIEludm9rZWQgc2VydmljZXNcblxuXG4gICAgICAgICAgaWYgKGFjdGl2aXR5LnR5cGUgPT09IEFjdGlvblR5cGVzLkludm9rZSkge1xuICAgICAgICAgICAgdmFyIGludm9rZVNvdXJjZSA9IHRvSW52b2tlU291cmNlKGFjdGl2aXR5LnNyYyk7XG4gICAgICAgICAgICB2YXIgc2VydmljZUNyZWF0b3IgPSB0aGlzLm1hY2hpbmUub3B0aW9ucy5zZXJ2aWNlcyA/IHRoaXMubWFjaGluZS5vcHRpb25zLnNlcnZpY2VzW2ludm9rZVNvdXJjZS50eXBlXSA6IHVuZGVmaW5lZDtcbiAgICAgICAgICAgIHZhciBpZCA9IGFjdGl2aXR5LmlkLFxuICAgICAgICAgICAgICAgIGRhdGEgPSBhY3Rpdml0eS5kYXRhO1xuXG4gICAgICAgICAgICBpZiAoIUlTX1BST0RVQ1RJT04pIHtcbiAgICAgICAgICAgICAgd2FybighKCdmb3J3YXJkJyBpbiBhY3Rpdml0eSksIC8vIHRzbGludDpkaXNhYmxlLW5leHQtbGluZTptYXgtbGluZS1sZW5ndGhcbiAgICAgICAgICAgICAgXCJgZm9yd2FyZGAgcHJvcGVydHkgaXMgZGVwcmVjYXRlZCAoZm91bmQgaW4gaW52b2NhdGlvbiBvZiAnXCIgKyBhY3Rpdml0eS5zcmMgKyBcIicgaW4gaW4gbWFjaGluZSAnXCIgKyB0aGlzLm1hY2hpbmUuaWQgKyBcIicpLiBcIiArIFwiUGxlYXNlIHVzZSBgYXV0b0ZvcndhcmRgIGluc3RlYWQuXCIpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB2YXIgYXV0b0ZvcndhcmQgPSAnYXV0b0ZvcndhcmQnIGluIGFjdGl2aXR5ID8gYWN0aXZpdHkuYXV0b0ZvcndhcmQgOiAhIWFjdGl2aXR5LmZvcndhcmQ7XG5cbiAgICAgICAgICAgIGlmICghc2VydmljZUNyZWF0b3IpIHtcbiAgICAgICAgICAgICAgLy8gdHNsaW50OmRpc2FibGUtbmV4dC1saW5lOm5vLWNvbnNvbGVcbiAgICAgICAgICAgICAgaWYgKCFJU19QUk9EVUNUSU9OKSB7XG4gICAgICAgICAgICAgICAgd2FybihmYWxzZSwgXCJObyBzZXJ2aWNlIGZvdW5kIGZvciBpbnZvY2F0aW9uICdcIiArIGFjdGl2aXR5LnNyYyArIFwiJyBpbiBtYWNoaW5lICdcIiArIHRoaXMubWFjaGluZS5pZCArIFwiJy5cIik7XG4gICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHZhciByZXNvbHZlZERhdGEgPSBkYXRhID8gbWFwQ29udGV4dChkYXRhLCBjb250ZXh0LCBfZXZlbnQpIDogdW5kZWZpbmVkO1xuICAgICAgICAgICAgdmFyIHNvdXJjZSA9IGlzRnVuY3Rpb24oc2VydmljZUNyZWF0b3IpID8gc2VydmljZUNyZWF0b3IoY29udGV4dCwgX2V2ZW50LmRhdGEsIHtcbiAgICAgICAgICAgICAgZGF0YTogcmVzb2x2ZWREYXRhLFxuICAgICAgICAgICAgICBzcmM6IGludm9rZVNvdXJjZVxuICAgICAgICAgICAgfSkgOiBzZXJ2aWNlQ3JlYXRvcjtcblxuICAgICAgICAgICAgaWYgKGlzUHJvbWlzZUxpa2Uoc291cmNlKSkge1xuICAgICAgICAgICAgICB0aGlzLnNwYXduUHJvbWlzZShQcm9taXNlLnJlc29sdmUoc291cmNlKSwgaWQpO1xuICAgICAgICAgICAgfSBlbHNlIGlmIChpc0Z1bmN0aW9uKHNvdXJjZSkpIHtcbiAgICAgICAgICAgICAgdGhpcy5zcGF3bkNhbGxiYWNrKHNvdXJjZSwgaWQpO1xuICAgICAgICAgICAgfSBlbHNlIGlmIChpc09ic2VydmFibGUoc291cmNlKSkge1xuICAgICAgICAgICAgICB0aGlzLnNwYXduT2JzZXJ2YWJsZShzb3VyY2UsIGlkKTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoaXNNYWNoaW5lKHNvdXJjZSkpIHtcbiAgICAgICAgICAgICAgLy8gVE9ETzogdHJ5L2NhdGNoIGhlcmVcbiAgICAgICAgICAgICAgdGhpcy5zcGF3bk1hY2hpbmUocmVzb2x2ZWREYXRhID8gc291cmNlLndpdGhDb250ZXh0KHJlc29sdmVkRGF0YSkgOiBzb3VyY2UsIHtcbiAgICAgICAgICAgICAgICBpZDogaWQsXG4gICAgICAgICAgICAgICAgYXV0b0ZvcndhcmQ6IGF1dG9Gb3J3YXJkXG4gICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSBlbHNlIDtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5zcGF3bkFjdGl2aXR5KGFjdGl2aXR5KTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuXG4gICAgICBjYXNlIHN0b3A6XG4gICAgICAgIHtcbiAgICAgICAgICB0aGlzLnN0b3BDaGlsZChhY3Rpb24uYWN0aXZpdHkuaWQpO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG5cbiAgICAgIGNhc2UgbG9nOlxuICAgICAgICB2YXIgbGFiZWwgPSBhY3Rpb24ubGFiZWwsXG4gICAgICAgICAgICB2YWx1ZSA9IGFjdGlvbi52YWx1ZTtcblxuICAgICAgICBpZiAobGFiZWwpIHtcbiAgICAgICAgICB0aGlzLmxvZ2dlcihsYWJlbCwgdmFsdWUpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHRoaXMubG9nZ2VyKHZhbHVlKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGJyZWFrO1xuXG4gICAgICBkZWZhdWx0OlxuICAgICAgICBpZiAoIUlTX1BST0RVQ1RJT04pIHtcbiAgICAgICAgICB3YXJuKGZhbHNlLCBcIk5vIGltcGxlbWVudGF0aW9uIGZvdW5kIGZvciBhY3Rpb24gdHlwZSAnXCIgKyBhY3Rpb24udHlwZSArIFwiJ1wiKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGJyZWFrO1xuICAgIH1cblxuICAgIHJldHVybiB1bmRlZmluZWQ7XG4gIH07XG5cbiAgSW50ZXJwcmV0ZXIucHJvdG90eXBlLnJlbW92ZUNoaWxkID0gZnVuY3Rpb24gKGNoaWxkSWQpIHtcbiAgICB0aGlzLmNoaWxkcmVuLmRlbGV0ZShjaGlsZElkKTtcbiAgICB0aGlzLmZvcndhcmRUby5kZWxldGUoY2hpbGRJZCk7XG4gICAgZGVsZXRlIHRoaXMuc3RhdGUuY2hpbGRyZW5bY2hpbGRJZF07XG4gIH07XG5cbiAgSW50ZXJwcmV0ZXIucHJvdG90eXBlLnN0b3BDaGlsZCA9IGZ1bmN0aW9uIChjaGlsZElkKSB7XG4gICAgdmFyIGNoaWxkID0gdGhpcy5jaGlsZHJlbi5nZXQoY2hpbGRJZCk7XG5cbiAgICBpZiAoIWNoaWxkKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgdGhpcy5yZW1vdmVDaGlsZChjaGlsZElkKTtcblxuICAgIGlmIChpc0Z1bmN0aW9uKGNoaWxkLnN0b3ApKSB7XG4gICAgICBjaGlsZC5zdG9wKCk7XG4gICAgfVxuICB9O1xuXG4gIEludGVycHJldGVyLnByb3RvdHlwZS5zcGF3biA9IGZ1bmN0aW9uIChlbnRpdHksIG5hbWUsIG9wdGlvbnMpIHtcbiAgICBpZiAoaXNQcm9taXNlTGlrZShlbnRpdHkpKSB7XG4gICAgICByZXR1cm4gdGhpcy5zcGF3blByb21pc2UoUHJvbWlzZS5yZXNvbHZlKGVudGl0eSksIG5hbWUpO1xuICAgIH0gZWxzZSBpZiAoaXNGdW5jdGlvbihlbnRpdHkpKSB7XG4gICAgICByZXR1cm4gdGhpcy5zcGF3bkNhbGxiYWNrKGVudGl0eSwgbmFtZSk7XG4gICAgfSBlbHNlIGlmIChpc1NwYXduZWRBY3RvcihlbnRpdHkpKSB7XG4gICAgICByZXR1cm4gdGhpcy5zcGF3bkFjdG9yKGVudGl0eSk7XG4gICAgfSBlbHNlIGlmIChpc09ic2VydmFibGUoZW50aXR5KSkge1xuICAgICAgcmV0dXJuIHRoaXMuc3Bhd25PYnNlcnZhYmxlKGVudGl0eSwgbmFtZSk7XG4gICAgfSBlbHNlIGlmIChpc01hY2hpbmUoZW50aXR5KSkge1xuICAgICAgcmV0dXJuIHRoaXMuc3Bhd25NYWNoaW5lKGVudGl0eSwgX19hc3NpZ24oX19hc3NpZ24oe30sIG9wdGlvbnMpLCB7XG4gICAgICAgIGlkOiBuYW1lXG4gICAgICB9KSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihcIlVuYWJsZSB0byBzcGF3biBlbnRpdHkgXFxcIlwiICsgbmFtZSArIFwiXFxcIiBvZiB0eXBlIFxcXCJcIiArIHR5cGVvZiBlbnRpdHkgKyBcIlxcXCIuXCIpO1xuICAgIH1cbiAgfTtcblxuICBJbnRlcnByZXRlci5wcm90b3R5cGUuc3Bhd25NYWNoaW5lID0gZnVuY3Rpb24gKG1hY2hpbmUsIG9wdGlvbnMpIHtcbiAgICB2YXIgX3RoaXMgPSB0aGlzO1xuXG4gICAgaWYgKG9wdGlvbnMgPT09IHZvaWQgMCkge1xuICAgICAgb3B0aW9ucyA9IHt9O1xuICAgIH1cblxuICAgIHZhciBjaGlsZFNlcnZpY2UgPSBuZXcgSW50ZXJwcmV0ZXIobWFjaGluZSwgX19hc3NpZ24oX19hc3NpZ24oe30sIHRoaXMub3B0aW9ucyksIHtcbiAgICAgIHBhcmVudDogdGhpcyxcbiAgICAgIGlkOiBvcHRpb25zLmlkIHx8IG1hY2hpbmUuaWRcbiAgICB9KSk7XG5cbiAgICB2YXIgcmVzb2x2ZWRPcHRpb25zID0gX19hc3NpZ24oX19hc3NpZ24oe30sIERFRkFVTFRfU1BBV05fT1BUSU9OUyksIG9wdGlvbnMpO1xuXG4gICAgaWYgKHJlc29sdmVkT3B0aW9ucy5zeW5jKSB7XG4gICAgICBjaGlsZFNlcnZpY2Uub25UcmFuc2l0aW9uKGZ1bmN0aW9uIChzdGF0ZSkge1xuICAgICAgICBfdGhpcy5zZW5kKHVwZGF0ZSwge1xuICAgICAgICAgIHN0YXRlOiBzdGF0ZSxcbiAgICAgICAgICBpZDogY2hpbGRTZXJ2aWNlLmlkXG4gICAgICAgIH0pO1xuICAgICAgfSk7XG4gICAgfVxuXG4gICAgdmFyIGFjdG9yID0gY2hpbGRTZXJ2aWNlO1xuICAgIHRoaXMuY2hpbGRyZW4uc2V0KGNoaWxkU2VydmljZS5pZCwgYWN0b3IpO1xuXG4gICAgaWYgKHJlc29sdmVkT3B0aW9ucy5hdXRvRm9yd2FyZCkge1xuICAgICAgdGhpcy5mb3J3YXJkVG8uYWRkKGNoaWxkU2VydmljZS5pZCk7XG4gICAgfVxuXG4gICAgY2hpbGRTZXJ2aWNlLm9uRG9uZShmdW5jdGlvbiAoZG9uZUV2ZW50KSB7XG4gICAgICBfdGhpcy5yZW1vdmVDaGlsZChjaGlsZFNlcnZpY2UuaWQpO1xuXG4gICAgICBfdGhpcy5zZW5kKHRvU0NYTUxFdmVudChkb25lRXZlbnQsIHtcbiAgICAgICAgb3JpZ2luOiBjaGlsZFNlcnZpY2UuaWRcbiAgICAgIH0pKTtcbiAgICB9KS5zdGFydCgpO1xuICAgIHJldHVybiBhY3RvcjtcbiAgfTtcblxuICBJbnRlcnByZXRlci5wcm90b3R5cGUuc3Bhd25Qcm9taXNlID0gZnVuY3Rpb24gKHByb21pc2UsIGlkKSB7XG4gICAgdmFyIF90aGlzID0gdGhpcztcblxuICAgIHZhciBjYW5jZWxlZCA9IGZhbHNlO1xuICAgIHByb21pc2UudGhlbihmdW5jdGlvbiAocmVzcG9uc2UpIHtcbiAgICAgIGlmICghY2FuY2VsZWQpIHtcbiAgICAgICAgX3RoaXMucmVtb3ZlQ2hpbGQoaWQpO1xuXG4gICAgICAgIF90aGlzLnNlbmQodG9TQ1hNTEV2ZW50KGRvbmVJbnZva2UoaWQsIHJlc3BvbnNlKSwge1xuICAgICAgICAgIG9yaWdpbjogaWRcbiAgICAgICAgfSkpO1xuICAgICAgfVxuICAgIH0sIGZ1bmN0aW9uIChlcnJvckRhdGEpIHtcbiAgICAgIGlmICghY2FuY2VsZWQpIHtcbiAgICAgICAgX3RoaXMucmVtb3ZlQ2hpbGQoaWQpO1xuXG4gICAgICAgIHZhciBlcnJvckV2ZW50ID0gZXJyb3IoaWQsIGVycm9yRGF0YSk7XG5cbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAvLyBTZW5kIFwiZXJyb3IucGxhdGZvcm0uaWRcIiB0byB0aGlzIChwYXJlbnQpLlxuICAgICAgICAgIF90aGlzLnNlbmQodG9TQ1hNTEV2ZW50KGVycm9yRXZlbnQsIHtcbiAgICAgICAgICAgIG9yaWdpbjogaWRcbiAgICAgICAgICB9KSk7XG4gICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgcmVwb3J0VW5oYW5kbGVkRXhjZXB0aW9uT25JbnZvY2F0aW9uKGVycm9yRGF0YSwgZXJyb3IsIGlkKTtcblxuICAgICAgICAgIGlmIChfdGhpcy5kZXZUb29scykge1xuICAgICAgICAgICAgX3RoaXMuZGV2VG9vbHMuc2VuZChlcnJvckV2ZW50LCBfdGhpcy5zdGF0ZSk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgaWYgKF90aGlzLm1hY2hpbmUuc3RyaWN0KSB7XG4gICAgICAgICAgICAvLyBpdCB3b3VsZCBiZSBiZXR0ZXIgdG8gYWx3YXlzIHN0b3AgdGhlIHN0YXRlIG1hY2hpbmUgaWYgdW5oYW5kbGVkXG4gICAgICAgICAgICAvLyBleGNlcHRpb24vcHJvbWlzZSByZWplY3Rpb24gaGFwcGVucyBidXQgYmVjYXVzZSB3ZSBkb24ndCB3YW50IHRvXG4gICAgICAgICAgICAvLyBicmVhayBleGlzdGluZyBjb2RlIHNvIGVuZm9yY2UgaXQgb24gc3RyaWN0IG1vZGUgb25seSBlc3BlY2lhbGx5IHNvXG4gICAgICAgICAgICAvLyBiZWNhdXNlIGRvY3VtZW50YXRpb24gc2F5cyB0aGF0IG9uRXJyb3IgaXMgb3B0aW9uYWxcbiAgICAgICAgICAgIF90aGlzLnN0b3AoKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9KTtcbiAgICB2YXIgYWN0b3IgPSB7XG4gICAgICBpZDogaWQsXG4gICAgICBzZW5kOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJldHVybiB2b2lkIDA7XG4gICAgICB9LFxuICAgICAgc3Vic2NyaWJlOiBmdW5jdGlvbiAobmV4dCwgaGFuZGxlRXJyb3IsIGNvbXBsZXRlKSB7XG4gICAgICAgIHZhciBvYnNlcnZlciA9IHRvT2JzZXJ2ZXIobmV4dCwgaGFuZGxlRXJyb3IsIGNvbXBsZXRlKTtcbiAgICAgICAgdmFyIHVuc3Vic2NyaWJlZCA9IGZhbHNlO1xuICAgICAgICBwcm9taXNlLnRoZW4oZnVuY3Rpb24gKHJlc3BvbnNlKSB7XG4gICAgICAgICAgaWYgKHVuc3Vic2NyaWJlZCkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIG9ic2VydmVyLm5leHQocmVzcG9uc2UpO1xuXG4gICAgICAgICAgaWYgKHVuc3Vic2NyaWJlZCkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIG9ic2VydmVyLmNvbXBsZXRlKCk7XG4gICAgICAgIH0sIGZ1bmN0aW9uIChlcnIpIHtcbiAgICAgICAgICBpZiAodW5zdWJzY3JpYmVkKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgb2JzZXJ2ZXIuZXJyb3IoZXJyKTtcbiAgICAgICAgfSk7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgdW5zdWJzY3JpYmU6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHJldHVybiB1bnN1YnNjcmliZWQgPSB0cnVlO1xuICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICAgIH0sXG4gICAgICBzdG9wOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIGNhbmNlbGVkID0gdHJ1ZTtcbiAgICAgIH0sXG4gICAgICB0b0pTT046IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICBpZDogaWRcbiAgICAgICAgfTtcbiAgICAgIH1cbiAgICB9O1xuICAgIHRoaXMuY2hpbGRyZW4uc2V0KGlkLCBhY3Rvcik7XG4gICAgcmV0dXJuIGFjdG9yO1xuICB9O1xuXG4gIEludGVycHJldGVyLnByb3RvdHlwZS5zcGF3bkNhbGxiYWNrID0gZnVuY3Rpb24gKGNhbGxiYWNrLCBpZCkge1xuICAgIHZhciBfdGhpcyA9IHRoaXM7XG5cbiAgICB2YXIgY2FuY2VsZWQgPSBmYWxzZTtcbiAgICB2YXIgcmVjZWl2ZXJzID0gbmV3IFNldCgpO1xuICAgIHZhciBsaXN0ZW5lcnMgPSBuZXcgU2V0KCk7XG5cbiAgICB2YXIgcmVjZWl2ZSA9IGZ1bmN0aW9uIChlKSB7XG4gICAgICBsaXN0ZW5lcnMuZm9yRWFjaChmdW5jdGlvbiAobGlzdGVuZXIpIHtcbiAgICAgICAgcmV0dXJuIGxpc3RlbmVyKGUpO1xuICAgICAgfSk7XG5cbiAgICAgIGlmIChjYW5jZWxlZCkge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIF90aGlzLnNlbmQodG9TQ1hNTEV2ZW50KGUsIHtcbiAgICAgICAgb3JpZ2luOiBpZFxuICAgICAgfSkpO1xuICAgIH07XG5cbiAgICB2YXIgY2FsbGJhY2tTdG9wO1xuXG4gICAgdHJ5IHtcbiAgICAgIGNhbGxiYWNrU3RvcCA9IGNhbGxiYWNrKHJlY2VpdmUsIGZ1bmN0aW9uIChuZXdMaXN0ZW5lcikge1xuICAgICAgICByZWNlaXZlcnMuYWRkKG5ld0xpc3RlbmVyKTtcbiAgICAgIH0pO1xuICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgdGhpcy5zZW5kKGVycm9yKGlkLCBlcnIpKTtcbiAgICB9XG5cbiAgICBpZiAoaXNQcm9taXNlTGlrZShjYWxsYmFja1N0b3ApKSB7XG4gICAgICAvLyBpdCB0dXJuZWQgb3V0IHRvIGJlIGFuIGFzeW5jIGZ1bmN0aW9uLCBjYW4ndCByZWxpYWJseSBjaGVjayB0aGlzIGJlZm9yZSBjYWxsaW5nIGBjYWxsYmFja2BcbiAgICAgIC8vIGJlY2F1c2UgdHJhbnNwaWxlZCBhc3luYyBmdW5jdGlvbnMgYXJlIG5vdCByZWNvZ25pemFibGVcbiAgICAgIHJldHVybiB0aGlzLnNwYXduUHJvbWlzZShjYWxsYmFja1N0b3AsIGlkKTtcbiAgICB9XG5cbiAgICB2YXIgYWN0b3IgPSB7XG4gICAgICBpZDogaWQsXG4gICAgICBzZW5kOiBmdW5jdGlvbiAoZXZlbnQpIHtcbiAgICAgICAgcmV0dXJuIHJlY2VpdmVycy5mb3JFYWNoKGZ1bmN0aW9uIChyZWNlaXZlcikge1xuICAgICAgICAgIHJldHVybiByZWNlaXZlcihldmVudCk7XG4gICAgICAgIH0pO1xuICAgICAgfSxcbiAgICAgIHN1YnNjcmliZTogZnVuY3Rpb24gKG5leHQpIHtcbiAgICAgICAgbGlzdGVuZXJzLmFkZChuZXh0KTtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICB1bnN1YnNjcmliZTogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgbGlzdGVuZXJzLmRlbGV0ZShuZXh0KTtcbiAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgICB9LFxuICAgICAgc3RvcDogZnVuY3Rpb24gKCkge1xuICAgICAgICBjYW5jZWxlZCA9IHRydWU7XG5cbiAgICAgICAgaWYgKGlzRnVuY3Rpb24oY2FsbGJhY2tTdG9wKSkge1xuICAgICAgICAgIGNhbGxiYWNrU3RvcCgpO1xuICAgICAgICB9XG4gICAgICB9LFxuICAgICAgdG9KU09OOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgaWQ6IGlkXG4gICAgICAgIH07XG4gICAgICB9XG4gICAgfTtcbiAgICB0aGlzLmNoaWxkcmVuLnNldChpZCwgYWN0b3IpO1xuICAgIHJldHVybiBhY3RvcjtcbiAgfTtcblxuICBJbnRlcnByZXRlci5wcm90b3R5cGUuc3Bhd25PYnNlcnZhYmxlID0gZnVuY3Rpb24gKHNvdXJjZSwgaWQpIHtcbiAgICB2YXIgX3RoaXMgPSB0aGlzO1xuXG4gICAgdmFyIHN1YnNjcmlwdGlvbiA9IHNvdXJjZS5zdWJzY3JpYmUoZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgICBfdGhpcy5zZW5kKHRvU0NYTUxFdmVudCh2YWx1ZSwge1xuICAgICAgICBvcmlnaW46IGlkXG4gICAgICB9KSk7XG4gICAgfSwgZnVuY3Rpb24gKGVycikge1xuICAgICAgX3RoaXMucmVtb3ZlQ2hpbGQoaWQpO1xuXG4gICAgICBfdGhpcy5zZW5kKHRvU0NYTUxFdmVudChlcnJvcihpZCwgZXJyKSwge1xuICAgICAgICBvcmlnaW46IGlkXG4gICAgICB9KSk7XG4gICAgfSwgZnVuY3Rpb24gKCkge1xuICAgICAgX3RoaXMucmVtb3ZlQ2hpbGQoaWQpO1xuXG4gICAgICBfdGhpcy5zZW5kKHRvU0NYTUxFdmVudChkb25lSW52b2tlKGlkKSwge1xuICAgICAgICBvcmlnaW46IGlkXG4gICAgICB9KSk7XG4gICAgfSk7XG4gICAgdmFyIGFjdG9yID0ge1xuICAgICAgaWQ6IGlkLFxuICAgICAgc2VuZDogZnVuY3Rpb24gKCkge1xuICAgICAgICByZXR1cm4gdm9pZCAwO1xuICAgICAgfSxcbiAgICAgIHN1YnNjcmliZTogZnVuY3Rpb24gKG5leHQsIGhhbmRsZUVycm9yLCBjb21wbGV0ZSkge1xuICAgICAgICByZXR1cm4gc291cmNlLnN1YnNjcmliZShuZXh0LCBoYW5kbGVFcnJvciwgY29tcGxldGUpO1xuICAgICAgfSxcbiAgICAgIHN0b3A6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmV0dXJuIHN1YnNjcmlwdGlvbi51bnN1YnNjcmliZSgpO1xuICAgICAgfSxcbiAgICAgIHRvSlNPTjogZnVuY3Rpb24gKCkge1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgIGlkOiBpZFxuICAgICAgICB9O1xuICAgICAgfVxuICAgIH07XG4gICAgdGhpcy5jaGlsZHJlbi5zZXQoaWQsIGFjdG9yKTtcbiAgICByZXR1cm4gYWN0b3I7XG4gIH07XG5cbiAgSW50ZXJwcmV0ZXIucHJvdG90eXBlLnNwYXduQWN0b3IgPSBmdW5jdGlvbiAoYWN0b3IpIHtcbiAgICB0aGlzLmNoaWxkcmVuLnNldChhY3Rvci5pZCwgYWN0b3IpO1xuICAgIHJldHVybiBhY3RvcjtcbiAgfTtcblxuICBJbnRlcnByZXRlci5wcm90b3R5cGUuc3Bhd25BY3Rpdml0eSA9IGZ1bmN0aW9uIChhY3Rpdml0eSkge1xuICAgIHZhciBpbXBsZW1lbnRhdGlvbiA9IHRoaXMubWFjaGluZS5vcHRpb25zICYmIHRoaXMubWFjaGluZS5vcHRpb25zLmFjdGl2aXRpZXMgPyB0aGlzLm1hY2hpbmUub3B0aW9ucy5hY3Rpdml0aWVzW2FjdGl2aXR5LnR5cGVdIDogdW5kZWZpbmVkO1xuXG4gICAgaWYgKCFpbXBsZW1lbnRhdGlvbikge1xuICAgICAgaWYgKCFJU19QUk9EVUNUSU9OKSB7XG4gICAgICAgIHdhcm4oZmFsc2UsIFwiTm8gaW1wbGVtZW50YXRpb24gZm91bmQgZm9yIGFjdGl2aXR5ICdcIiArIGFjdGl2aXR5LnR5cGUgKyBcIidcIik7XG4gICAgICB9IC8vIHRzbGludDpkaXNhYmxlLW5leHQtbGluZTpuby1jb25zb2xlXG5cblxuICAgICAgcmV0dXJuO1xuICAgIH0gLy8gU3RhcnQgaW1wbGVtZW50YXRpb25cblxuXG4gICAgdmFyIGRpc3Bvc2UgPSBpbXBsZW1lbnRhdGlvbih0aGlzLnN0YXRlLmNvbnRleHQsIGFjdGl2aXR5KTtcbiAgICB0aGlzLnNwYXduRWZmZWN0KGFjdGl2aXR5LmlkLCBkaXNwb3NlKTtcbiAgfTtcblxuICBJbnRlcnByZXRlci5wcm90b3R5cGUuc3Bhd25FZmZlY3QgPSBmdW5jdGlvbiAoaWQsIGRpc3Bvc2UpIHtcbiAgICB0aGlzLmNoaWxkcmVuLnNldChpZCwge1xuICAgICAgaWQ6IGlkLFxuICAgICAgc2VuZDogZnVuY3Rpb24gKCkge1xuICAgICAgICByZXR1cm4gdm9pZCAwO1xuICAgICAgfSxcbiAgICAgIHN1YnNjcmliZTogZnVuY3Rpb24gKCkge1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgIHVuc3Vic2NyaWJlOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICByZXR1cm4gdm9pZCAwO1xuICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICAgIH0sXG4gICAgICBzdG9wOiBkaXNwb3NlIHx8IHVuZGVmaW5lZCxcbiAgICAgIHRvSlNPTjogZnVuY3Rpb24gKCkge1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgIGlkOiBpZFxuICAgICAgICB9O1xuICAgICAgfVxuICAgIH0pO1xuICB9O1xuXG4gIEludGVycHJldGVyLnByb3RvdHlwZS5hdHRhY2hEZXYgPSBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIGdsb2JhbCA9IGdldEdsb2JhbCgpO1xuXG4gICAgaWYgKHRoaXMub3B0aW9ucy5kZXZUb29scyAmJiBnbG9iYWwpIHtcbiAgICAgIGlmIChnbG9iYWwuX19SRURVWF9ERVZUT09MU19FWFRFTlNJT05fXykge1xuICAgICAgICB2YXIgZGV2VG9vbHNPcHRpb25zID0gdHlwZW9mIHRoaXMub3B0aW9ucy5kZXZUb29scyA9PT0gJ29iamVjdCcgPyB0aGlzLm9wdGlvbnMuZGV2VG9vbHMgOiB1bmRlZmluZWQ7XG4gICAgICAgIHRoaXMuZGV2VG9vbHMgPSBnbG9iYWwuX19SRURVWF9ERVZUT09MU19FWFRFTlNJT05fXy5jb25uZWN0KF9fYXNzaWduKF9fYXNzaWduKHtcbiAgICAgICAgICBuYW1lOiB0aGlzLmlkLFxuICAgICAgICAgIGF1dG9QYXVzZTogdHJ1ZSxcbiAgICAgICAgICBzdGF0ZVNhbml0aXplcjogZnVuY3Rpb24gKHN0YXRlKSB7XG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICB2YWx1ZTogc3RhdGUudmFsdWUsXG4gICAgICAgICAgICAgIGNvbnRleHQ6IHN0YXRlLmNvbnRleHQsXG4gICAgICAgICAgICAgIGFjdGlvbnM6IHN0YXRlLmFjdGlvbnNcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgfVxuICAgICAgICB9LCBkZXZUb29sc09wdGlvbnMpLCB7XG4gICAgICAgICAgZmVhdHVyZXM6IF9fYXNzaWduKHtcbiAgICAgICAgICAgIGp1bXA6IGZhbHNlLFxuICAgICAgICAgICAgc2tpcDogZmFsc2VcbiAgICAgICAgICB9LCBkZXZUb29sc09wdGlvbnMgPyBkZXZUb29sc09wdGlvbnMuZmVhdHVyZXMgOiB1bmRlZmluZWQpXG4gICAgICAgIH0pLCB0aGlzLm1hY2hpbmUpO1xuICAgICAgICB0aGlzLmRldlRvb2xzLmluaXQodGhpcy5zdGF0ZSk7XG4gICAgICB9IC8vIGFkZCBYU3RhdGUtc3BlY2lmaWMgZGV2IHRvb2xpbmcgaG9va1xuXG5cbiAgICAgIHJlZ2lzdGVyU2VydmljZSh0aGlzKTtcbiAgICB9XG4gIH07XG5cbiAgSW50ZXJwcmV0ZXIucHJvdG90eXBlLnRvSlNPTiA9IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4ge1xuICAgICAgaWQ6IHRoaXMuaWRcbiAgICB9O1xuICB9O1xuXG4gIEludGVycHJldGVyLnByb3RvdHlwZVtzeW1ib2xPYnNlcnZhYmxlXSA9IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gdGhpcztcbiAgfTtcbiAgLyoqXHJcbiAgICogVGhlIGRlZmF1bHQgaW50ZXJwcmV0ZXIgb3B0aW9uczpcclxuICAgKlxyXG4gICAqIC0gYGNsb2NrYCB1c2VzIHRoZSBnbG9iYWwgYHNldFRpbWVvdXRgIGFuZCBgY2xlYXJUaW1lb3V0YCBmdW5jdGlvbnNcclxuICAgKiAtIGBsb2dnZXJgIHVzZXMgdGhlIGdsb2JhbCBgY29uc29sZS5sb2coKWAgbWV0aG9kXHJcbiAgICovXG5cblxuICBJbnRlcnByZXRlci5kZWZhdWx0T3B0aW9ucyA9IC8qI19fUFVSRV9fKi9mdW5jdGlvbiAoZ2xvYmFsKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIGV4ZWN1dGU6IHRydWUsXG4gICAgICBkZWZlckV2ZW50czogdHJ1ZSxcbiAgICAgIGNsb2NrOiB7XG4gICAgICAgIHNldFRpbWVvdXQ6IGZ1bmN0aW9uIChmbiwgbXMpIHtcbiAgICAgICAgICByZXR1cm4gc2V0VGltZW91dChmbiwgbXMpO1xuICAgICAgICB9LFxuICAgICAgICBjbGVhclRpbWVvdXQ6IGZ1bmN0aW9uIChpZCkge1xuICAgICAgICAgIHJldHVybiBjbGVhclRpbWVvdXQoaWQpO1xuICAgICAgICB9XG4gICAgICB9LFxuICAgICAgbG9nZ2VyOiBnbG9iYWwuY29uc29sZS5sb2cuYmluZChjb25zb2xlKSxcbiAgICAgIGRldlRvb2xzOiBmYWxzZVxuICAgIH07XG4gIH0odHlwZW9mIHNlbGYgIT09ICd1bmRlZmluZWQnID8gc2VsZiA6IGdsb2JhbCk7XG5cbiAgSW50ZXJwcmV0ZXIuaW50ZXJwcmV0ID0gaW50ZXJwcmV0O1xuICByZXR1cm4gSW50ZXJwcmV0ZXI7XG59KCk7XG5cbnZhciByZXNvbHZlU3Bhd25PcHRpb25zID0gZnVuY3Rpb24gKG5hbWVPck9wdGlvbnMpIHtcbiAgaWYgKGlzU3RyaW5nKG5hbWVPck9wdGlvbnMpKSB7XG4gICAgcmV0dXJuIF9fYXNzaWduKF9fYXNzaWduKHt9LCBERUZBVUxUX1NQQVdOX09QVElPTlMpLCB7XG4gICAgICBuYW1lOiBuYW1lT3JPcHRpb25zXG4gICAgfSk7XG4gIH1cblxuICByZXR1cm4gX19hc3NpZ24oX19hc3NpZ24oX19hc3NpZ24oe30sIERFRkFVTFRfU1BBV05fT1BUSU9OUyksIHtcbiAgICBuYW1lOiB1bmlxdWVJZCgpXG4gIH0pLCBuYW1lT3JPcHRpb25zKTtcbn07XG5cbmZ1bmN0aW9uIHNwYXduKGVudGl0eSwgbmFtZU9yT3B0aW9ucykge1xuICB2YXIgcmVzb2x2ZWRPcHRpb25zID0gcmVzb2x2ZVNwYXduT3B0aW9ucyhuYW1lT3JPcHRpb25zKTtcbiAgcmV0dXJuIGNvbnN1bWUoZnVuY3Rpb24gKHNlcnZpY2UpIHtcbiAgICBpZiAoIUlTX1BST0RVQ1RJT04pIHtcbiAgICAgIHZhciBpc0xhenlFbnRpdHkgPSBpc01hY2hpbmUoZW50aXR5KSB8fCBpc0Z1bmN0aW9uKGVudGl0eSk7XG4gICAgICB3YXJuKCEhc2VydmljZSB8fCBpc0xhenlFbnRpdHksIFwiQXR0ZW1wdGVkIHRvIHNwYXduIGFuIEFjdG9yIChJRDogXFxcIlwiICsgKGlzTWFjaGluZShlbnRpdHkpID8gZW50aXR5LmlkIDogJ3VuZGVmaW5lZCcpICsgXCJcXFwiKSBvdXRzaWRlIG9mIGEgc2VydmljZS4gVGhpcyB3aWxsIGhhdmUgbm8gZWZmZWN0LlwiKTtcbiAgICB9XG5cbiAgICBpZiAoc2VydmljZSkge1xuICAgICAgcmV0dXJuIHNlcnZpY2Uuc3Bhd24oZW50aXR5LCByZXNvbHZlZE9wdGlvbnMubmFtZSwgcmVzb2x2ZWRPcHRpb25zKTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIGNyZWF0ZURlZmVycmVkQWN0b3IoZW50aXR5LCByZXNvbHZlZE9wdGlvbnMubmFtZSk7XG4gICAgfVxuICB9KTtcbn1cbi8qKlxyXG4gKiBDcmVhdGVzIGEgbmV3IEludGVycHJldGVyIGluc3RhbmNlIGZvciB0aGUgZ2l2ZW4gbWFjaGluZSB3aXRoIHRoZSBwcm92aWRlZCBvcHRpb25zLCBpZiBhbnkuXHJcbiAqXHJcbiAqIEBwYXJhbSBtYWNoaW5lIFRoZSBtYWNoaW5lIHRvIGludGVycHJldFxyXG4gKiBAcGFyYW0gb3B0aW9ucyBJbnRlcnByZXRlciBvcHRpb25zXHJcbiAqL1xuXG5cbmZ1bmN0aW9uIGludGVycHJldChtYWNoaW5lLCBvcHRpb25zKSB7XG4gIHZhciBpbnRlcnByZXRlciA9IG5ldyBJbnRlcnByZXRlcihtYWNoaW5lLCBvcHRpb25zKTtcbiAgcmV0dXJuIGludGVycHJldGVyO1xufVxuXG5leHBvcnQgeyBJbnRlcnByZXRlciwgSW50ZXJwcmV0ZXJTdGF0dXMsIGludGVycHJldCwgc3Bhd24gfTsiLCJpbXBvcnQgeyBfX3ZhbHVlcywgX19yZWFkIH0gZnJvbSAnLi9fdmlydHVhbC9fdHNsaWIuanMnO1xuaW1wb3J0IHsgU3RhdGUgfSBmcm9tICcuL1N0YXRlLmpzJztcblxuZnVuY3Rpb24gbWF0Y2hTdGF0ZShzdGF0ZSwgcGF0dGVybnMsIGRlZmF1bHRWYWx1ZSkge1xuICB2YXIgZV8xLCBfYTtcblxuICB2YXIgcmVzb2x2ZWRTdGF0ZSA9IFN0YXRlLmZyb20oc3RhdGUsIHN0YXRlIGluc3RhbmNlb2YgU3RhdGUgPyBzdGF0ZS5jb250ZXh0IDogdW5kZWZpbmVkKTtcblxuICB0cnkge1xuICAgIGZvciAodmFyIHBhdHRlcm5zXzEgPSBfX3ZhbHVlcyhwYXR0ZXJucyksIHBhdHRlcm5zXzFfMSA9IHBhdHRlcm5zXzEubmV4dCgpOyAhcGF0dGVybnNfMV8xLmRvbmU7IHBhdHRlcm5zXzFfMSA9IHBhdHRlcm5zXzEubmV4dCgpKSB7XG4gICAgICB2YXIgX2IgPSBfX3JlYWQocGF0dGVybnNfMV8xLnZhbHVlLCAyKSxcbiAgICAgICAgICBzdGF0ZVZhbHVlID0gX2JbMF0sXG4gICAgICAgICAgZ2V0VmFsdWUgPSBfYlsxXTtcblxuICAgICAgaWYgKHJlc29sdmVkU3RhdGUubWF0Y2hlcyhzdGF0ZVZhbHVlKSkge1xuICAgICAgICByZXR1cm4gZ2V0VmFsdWUocmVzb2x2ZWRTdGF0ZSk7XG4gICAgICB9XG4gICAgfVxuICB9IGNhdGNoIChlXzFfMSkge1xuICAgIGVfMSA9IHtcbiAgICAgIGVycm9yOiBlXzFfMVxuICAgIH07XG4gIH0gZmluYWxseSB7XG4gICAgdHJ5IHtcbiAgICAgIGlmIChwYXR0ZXJuc18xXzEgJiYgIXBhdHRlcm5zXzFfMS5kb25lICYmIChfYSA9IHBhdHRlcm5zXzEucmV0dXJuKSkgX2EuY2FsbChwYXR0ZXJuc18xKTtcbiAgICB9IGZpbmFsbHkge1xuICAgICAgaWYgKGVfMSkgdGhyb3cgZV8xLmVycm9yO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiBkZWZhdWx0VmFsdWUocmVzb2x2ZWRTdGF0ZSk7XG59XG5cbmV4cG9ydCB7IG1hdGNoU3RhdGUgfTsiLCJleHBvcnQgeyBtYXRjaGVzU3RhdGUgfSBmcm9tICcuL3V0aWxzLmpzJztcbmV4cG9ydCB7IG1hcFN0YXRlIH0gZnJvbSAnLi9tYXBTdGF0ZS5qcyc7XG5leHBvcnQgeyBBY3Rpb25UeXBlcywgU3BlY2lhbFRhcmdldHMgfSBmcm9tICcuL3R5cGVzLmpzJztcbmltcG9ydCB7IHJhaXNlLCBzZW5kLCBzZW5kUGFyZW50LCBzZW5kVXBkYXRlLCBsb2csIGNhbmNlbCwgc3RhcnQsIHN0b3AsIGFzc2lnbiwgYWZ0ZXIsIGRvbmUsIHJlc3BvbmQsIGZvcndhcmRUbywgZXNjYWxhdGUsIGNob29zZSwgcHVyZSB9IGZyb20gJy4vYWN0aW9ucy5qcyc7XG5leHBvcnQgeyBhc3NpZ24sIGRvbmVJbnZva2UsIGZvcndhcmRUbywgc2VuZCwgc2VuZFBhcmVudCwgc2VuZFVwZGF0ZSB9IGZyb20gJy4vYWN0aW9ucy5qcyc7XG5leHBvcnQgeyBTdGF0ZSB9IGZyb20gJy4vU3RhdGUuanMnO1xuZXhwb3J0IHsgU3RhdGVOb2RlIH0gZnJvbSAnLi9TdGF0ZU5vZGUuanMnO1xuZXhwb3J0IHsgTWFjaGluZSwgY3JlYXRlTWFjaGluZSB9IGZyb20gJy4vTWFjaGluZS5qcyc7XG5leHBvcnQgeyBJbnRlcnByZXRlciwgSW50ZXJwcmV0ZXJTdGF0dXMsIGludGVycHJldCwgc3Bhd24gfSBmcm9tICcuL2ludGVycHJldGVyLmpzJztcbmV4cG9ydCB7IG1hdGNoU3RhdGUgfSBmcm9tICcuL21hdGNoLmpzJztcbnZhciBhY3Rpb25zID0ge1xuICByYWlzZTogcmFpc2UsXG4gIHNlbmQ6IHNlbmQsXG4gIHNlbmRQYXJlbnQ6IHNlbmRQYXJlbnQsXG4gIHNlbmRVcGRhdGU6IHNlbmRVcGRhdGUsXG4gIGxvZzogbG9nLFxuICBjYW5jZWw6IGNhbmNlbCxcbiAgc3RhcnQ6IHN0YXJ0LFxuICBzdG9wOiBzdG9wLFxuICBhc3NpZ246IGFzc2lnbixcbiAgYWZ0ZXI6IGFmdGVyLFxuICBkb25lOiBkb25lLFxuICByZXNwb25kOiByZXNwb25kLFxuICBmb3J3YXJkVG86IGZvcndhcmRUbyxcbiAgZXNjYWxhdGU6IGVzY2FsYXRlLFxuICBjaG9vc2U6IGNob29zZSxcbiAgcHVyZTogcHVyZVxufTtcbmV4cG9ydCB7IGFjdGlvbnMgfTsiXSwibmFtZXMiOlsicmFpc2UiLCJzZW5kIiwicmFpc2UkMSIsInNlbmQkMSIsImxvZyIsImxvZyQxIiwiY2FuY2VsIiwiY2FuY2VsJDEiLCJzdGFydCIsInN0b3AiLCJhc3NpZ24iLCJhc3NpZ24kMSIsImVycm9yIiwicHVyZSIsImVycm9yJDEiLCJjaG9vc2UiLCJjaG9vc2UkMSIsInB1cmUkMSIsInN0b3AkMSIsImlzQWN0b3IiLCJ0b0ludm9rZVNvdXJjZSIsInN0YXJ0JDEiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O01BQUE7TUFDQTtBQUNBO01BQ0E7TUFDQTtBQUNBO01BQ0E7TUFDQTtNQUNBO01BQ0E7TUFDQTtNQUNBO01BQ0E7TUFDQTtNQUNBLElBQUksUUFBUSxHQUFHLFlBQVk7TUFDM0IsRUFBRSxRQUFRLEdBQUcsTUFBTSxDQUFDLE1BQU0sSUFBSSxTQUFTLFFBQVEsQ0FBQyxDQUFDLEVBQUU7TUFDbkQsSUFBSSxLQUFLLElBQUksQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLFNBQVMsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRTtNQUN6RCxNQUFNLENBQUMsR0FBRyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDdkI7TUFDQSxNQUFNLEtBQUssSUFBSSxDQUFDLElBQUksQ0FBQyxFQUFFLElBQUksTUFBTSxDQUFDLFNBQVMsQ0FBQyxjQUFjLENBQUMsSUFBSSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO01BQ25GLEtBQUs7QUFDTDtNQUNBLElBQUksT0FBTyxDQUFDLENBQUM7TUFDYixHQUFHLENBQUM7QUFDSjtNQUNBLEVBQUUsT0FBTyxRQUFRLENBQUMsS0FBSyxDQUFDLElBQUksRUFBRSxTQUFTLENBQUMsQ0FBQztNQUN6QyxDQUFDLENBQUM7QUFDRjtNQUNBLFNBQVMsTUFBTSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUU7TUFDdEIsRUFBRSxJQUFJLENBQUMsR0FBRyxFQUFFLENBQUM7QUFDYjtNQUNBLEVBQUUsS0FBSyxJQUFJLENBQUMsSUFBSSxDQUFDLEVBQUUsSUFBSSxNQUFNLENBQUMsU0FBUyxDQUFDLGNBQWMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDbkc7TUFDQSxFQUFFLElBQUksQ0FBQyxJQUFJLElBQUksSUFBSSxPQUFPLE1BQU0sQ0FBQyxxQkFBcUIsS0FBSyxVQUFVLEVBQUUsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLE1BQU0sQ0FBQyxxQkFBcUIsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsRUFBRTtNQUMvSSxJQUFJLElBQUksQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLElBQUksTUFBTSxDQUFDLFNBQVMsQ0FBQyxvQkFBb0IsQ0FBQyxJQUFJLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7TUFDdEcsR0FBRztNQUNILEVBQUUsT0FBTyxDQUFDLENBQUM7TUFDWCxDQUFDO0FBQ0Q7TUFDQSxTQUFTLFFBQVEsQ0FBQyxDQUFDLEVBQUU7TUFDckIsRUFBRSxJQUFJLENBQUMsR0FBRyxPQUFPLE1BQU0sS0FBSyxVQUFVLElBQUksTUFBTSxDQUFDLFFBQVE7TUFDekQsTUFBTSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7TUFDbkIsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDO01BQ1osRUFBRSxJQUFJLENBQUMsRUFBRSxPQUFPLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7TUFDMUIsRUFBRSxJQUFJLENBQUMsSUFB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QUFNLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxTQUFTLEdBQUcsZUFBZSxDQUFDLENBQUM7TUFDdEcsSUFBSSxJQUFJLENBQUMsRUFBRSxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsRUFBRSxJQUFJLFFBQVEsQ0FBQyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLEVBQUUsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUM7TUFDN0YsSUFBSSxJQUFJLENBQUMsT0FBTyxHQUFHLElBQUksQ0FBQyxNQUFNLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxPQUFPLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUM7TUFDM0UsSUFBSSxJQUFJLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxLQUFLLElBQUksQ0FBQyxNQUFNLENBQUMsUUFBUSxHQUFHLFVBQVUsR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLE1BQU0sSUFBSSxJQUFJLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQyxNQUFNLEdBQUcsVUFBVSxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsT0FBTyxHQUFHLFNBQVMsR0FBRyxRQUFRLENBQUMsQ0FBQztBQUMxTDtNQUNBLElBQUksSUFBSSxDQUFDLGFBQWEsRUFBRTtNQUN4QixNQUFNLElBQUksQ0FBQyxFQUFFLFVBQVUsSUFBSSxJQUFJLENBQUMsTUFBTSxDQUFDLEVBQUUsOEVBQThFLElBQUksSUFBSSxDQUFDLE1BQU0sQ0FBQyxRQUFRLEdBQUcsaUNBQWlDLEdBQUcsY0FBYyxHQUFHLElBQUksQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDLEdBQUcsaUNBQWlDLEdBQUcsSUFBSSxDQUFDLEVBQUUsR0FBRyxZQUFZLENBQUMsQ0FBQztNQUN2UixLQUFLO0FBQ0w7TUFDQSxJQUFJLElBQUksQ0FBQyxPQUFPLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxPQUFP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TUFDMUIsS0FBSyxDQUFDLENBQUM7TUFDUCxHQUFHLENBQUM7TUFDSjtNQUNBO01BQ0E7TUFDQTtNQUNBO01BQ0E7QUFDQTtBQUNBO01BQ0EsRUFBRSxTQUFTLENBQUMsU0FBUyxDQUFDLFVBQVUsR0FBRyxVQUFVLE9BQU8sRUFBRSxPQUFPLEVBQUU7TUFDL0QsSUFBSSxJQUFJLE9BQU8sS0FBSyxLQUFLLENBQUMsRUFBRTtNQUM1QixNQUFNLE9BQU8sR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDO01BQzdCLEtBQUs7QUFDTDtNQUNBLElBQUksSUFBSSxFQUFFLEdBQUcsSUFBSSxDQUFDLE9BQU87TUFDekIsUUFBUSxPQUFPLEdBQUcsRUFBRSxDQUFDLE9BQU87TUFDNUIsUUFBUSxVQUFVLEdBQUcsRUFBRSxDQUFDLFVBQVU7TUFDbEMsUUFBUSxNQUFNLEdBQUcsRUFBRSxDQUFDLE1BQU07TUFDMUIsUUFBUSxRQUFRLEdBQUcsRUFBRSxDQUFDLFFBQVE7TUFDOUIsUUFBUSxNQUFNLEdBQUcsRUFBRSxDQUFDLE1BQU0sQ0FBQztNQUMzQixJQUFJLE9BQU8sSUFBSSxTQUFTLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRTtNQUN0QyxNQUFNLE9BQU8sRUFBRSxRQUFRLENBQUMsUUFBUSxDQUFDLEVBQUUsRUFBRSxPQUFPLENBQUMsRUFBRSxPQUFPLENBQUMsT0FBTyxDQUFDO01BQy9ELE1BQU0sVUFBVSxFQUFFLFFBQVEsQ0FBQyxRQUFRLENBQUMsRUFBRSxFQUFFLFVBQVUsQ0FBQyxFQUFFLE9BQU8sQ0FBQyxVQUFVLENBQUM7TUFDeEUsTUFBTSxNQUFNLEVBQUUsUUFBUSxDQUFDLFFBQVEsQ0FBQyxFQUFFLEVBQUUsTUFBTSxDQUFDLEVBQUUsT0FBTyxDQUFDLE1BQU0sQ0FBQztNQUM1RCxNQUFNLFFBQVEsRUFBRSxRQUFRLENBQUMsUUFBUSxDQUFDLEVBQUUsRUFBRSxRQUFRLENBQUMsRUFBRSxPQUFPLENBQUMsUUFBUSxDQUFDO01BQ2xFLE1BQU0sTUFBTSxFQUFFLFFBQVEsQ0FBQyxRQUFRLENBQUMs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
