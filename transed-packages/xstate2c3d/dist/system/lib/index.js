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
      var after = ActionTypes.After;
      var doneState = ActionTypes.DoneState;
      var log = ActionTypes.Log;
      var init = ActionTypes.Init;
      var invoke = ActionTypes.Invoke;
      var errorExecution = ActionTypes.ErrorExecution;
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


      function after$1(delayRef, id) {
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
          var _a = this,
              configuration = _a.configuration,
              transitions = _a.transitions,
              jsonValues = __rest(_a, ["configuration", "transitions"]);

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
            var onDone = invokeConfig.onDone,
                onError = invokeConfig.onError,
                invokeDef = __rest(invokeConfig, ["onDone", "onError"]);

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
            var eventType = after$1(delayRef, _this.id);

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
            configuration: configuration
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
        after: after$1,
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL25vZGVfbW9kdWxlcy94c3RhdGUvZXMvX3ZpcnR1YWwvX3RzbGliLmpzIiwiLi4vLi4vLi4vLi4vLi4vbm9kZV9tb2R1bGVzL3hzdGF0ZS9lcy9jb25zdGFudHMuanMiLCIuLi8uLi8uLi8uLi8uLi9ub2RlX21vZHVsZXMveHN0YXRlL2VzL2Vudmlyb25tZW50LmpzIiwiLi4vLi4vLi4vLi4vLi4vbm9kZV9tb2R1bGVzL3hzdGF0ZS9lcy91dGlscy5qcyIsIi4uLy4uLy4uLy4uLy4uL25vZGVfbW9kdWxlcy94c3RhdGUvZXMvbWFwU3RhdGUuanMiLCIuLi8uLi8uLi8uLi8uLi9ub2RlX21vZHVsZXMveHN0YXRlL2VzL3R5cGVzLmpzIiwiLi4vLi4vLi4vLi4vLi4vbm9kZV9tb2R1bGVzL3hzdGF0ZS9lcy9hY3Rpb25UeXBlcy5qcyIsIi4uLy4uLy4uLy4uLy4uL25vZGVfbW9kdWxlcy94c3RhdGUvZXMvYWN0aW9ucy5qcyIsIi4uLy4uLy4uLy4uLy4uL25vZGVfbW9kdWxlcy94c3RhdGUvZXMvc3RhdGVVdGlscy5qcyIsIi4uLy4uLy4uLy4uLy4uL25vZGVfbW9kdWxlcy94c3RhdGUvZXMvU3RhdGUuanMiLCIuLi8uLi8uLi8uLi8uLi9ub2RlX21vZHVsZXMveHN0YXRlL2VzL3NlcnZpY2VTY29wZS5qcyIsIi4uLy4uLy4uLy4uLy4uL25vZGVfbW9kdWxlcy94c3RhdGUvZXMvQWN0b3IuanMiLCIuLi8uLi8uLi8uLi8uLi9ub2RlX21vZHVsZXMveHN0YXRlL2VzL2ludm9rZVV0aWxzLmpzIiwiLi4vLi4vLi4vLi4vLi4vbm9kZV9tb2R1bGVzL3hzdGF0ZS9lcy9TdGF0ZU5vZGUuanMiLCIuLi8uLi8uLi8uLi8uLi9ub2RlX21vZHVsZXMveHN0YXRlL2VzL01hY2hpbmUuanMiLCIuLi8uLi8uLi8uLi8uLi9ub2RlX21vZHVsZXMveHN0YXRlL2VzL3NjaGVkdWxlci5qcyIsIi4uLy4uLy4uLy4uLy4uL25vZGVfbW9kdWxlcy94c3RhdGUvZXMvcmVnaXN0cnkuanMiLCIuLi8uLi8uLi8uLi8uLi9ub2RlX21vZHVsZXMveHN0YXRlL2VzL2RldlRvb2xzLmpzIiwiLi4vLi4vLi4vLi4vLi4vbm9kZV9tb2R1bGVzL3hzdGF0ZS9lcy9pbnRlcnByZXRlci5qcyIsIi4uLy4uLy4uLy4uLy4uL25vZGVfbW9kdWxlcy94c3RhdGUvZXMvbWF0Y2guanMiLCIuLi8uLi8uLi8uLi8uLi9ub2RlX21vZHVsZXMveHN0YXRlL2VzL2luZGV4LmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8qISAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxyXG5Db3B5cmlnaHQgKGMpIE1pY3Jvc29mdCBDb3Jwb3JhdGlvbi5cclxuXHJcblBlcm1pc3Npb24gdG8gdXNlLCBjb3B5LCBtb2RpZnksIGFuZC9vciBkaXN0cmlidXRlIHRoaXMgc29mdHdhcmUgZm9yIGFueVxyXG5wdXJwb3NlIHdpdGggb3Igd2l0aG91dCBmZWUgaXMgaGVyZWJ5IGdyYW50ZWQuXHJcblxyXG5USEUgU09GVFdBUkUgSVMgUFJPVklERUQgXCJBUyBJU1wiIEFORCBUSEUgQVVUSE9SIERJU0NMQUlNUyBBTEwgV0FSUkFOVElFUyBXSVRIXHJcblJFR0FSRCBUTyBUSElTIFNPRlRXQVJFIElOQ0xVRElORyBBTEwgSU1QTElFRCBXQVJSQU5USUVTIE9GIE1FUkNIQU5UQUJJTElUWVxyXG5BTkQgRklUTkVTUy4gSU4gTk8gRVZFTlQgU0hBTEwgVEhFIEFVVEhPUiBCRSBMSUFCTEUgRk9SIEFOWSBTUEVDSUFMLCBESVJFQ1QsXHJcbklORElSRUNULCBPUiBDT05TRVFVRU5USUFMIERBTUFHRVMgT1IgQU5ZIERBTUFHRVMgV0hBVFNPRVZFUiBSRVNVTFRJTkcgRlJPTVxyXG5MT1NTIE9GIFVTRSwgREFUQSBPUiBQUk9GSVRTLCBXSEVUSEVSIElOIEFOIEFDVElPTiBPRiBDT05UUkFDVCwgTkVHTElHRU5DRSBPUlxyXG5PVEhFUiBUT1JUSU9VUyBBQ1RJT04sIEFSSVNJTkcgT1VUIE9GIE9SIElOIENPTk5FQ1RJT04gV0lUSCBUSEUgVVNFIE9SXHJcblBFUkZPUk1BTkNFIE9GIFRISVMgU09GVFdBUkUuXHJcbioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqICovXG52YXIgX19hc3NpZ24gPSBmdW5jdGlvbiAoKSB7XG4gIF9fYXNzaWduID0gT2JqZWN0LmFzc2lnbiB8fCBmdW5jdGlvbiBfX2Fzc2lnbih0KSB7XG4gICAgZm9yICh2YXIgcywgaSA9IDEsIG4gPSBhcmd1bWVudHMubGVuZ3RoOyBpIDwgbjsgaSsrKSB7XG4gICAgICBzID0gYXJndW1lbnRzW2ldO1xuXG4gICAgICBmb3IgKHZhciBwIGluIHMpIGlmIChPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwocywgcCkpIHRbcF0gPSBzW3BdO1xuICAgIH1cblxuICAgIHJldHVybiB0O1xuICB9O1xuXG4gIHJldHVybiBfX2Fzc2lnbi5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xufTtcblxuZnVuY3Rpb24gX19yZXN0KHMsIGUpIHtcbiAgdmFyIHQgPSB7fTtcblxuICBmb3IgKHZhciBwIGluIHMpIGlmIChPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwocywgcCkgJiYgZS5pbmRleE9mKHApIDwgMCkgdFtwXSA9IHNbcF07XG5cbiAgaWYgKHMgIT0gbnVsbCAmJiB0eXBlb2YgT2JqZWN0LmdldE93blByb3BlcnR5U3ltYm9scyA9PT0gXCJmdW5jdGlvblwiKSBmb3IgKHZhciBpID0gMCwgcCA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eVN5bWJvbHMocyk7IGkgPCBwLmxlbmd0aDsgaSsrKSB7XG4gICAgaWYgKGUuaW5kZXhPZihwW2ldKSA8IDAgJiYgT2JqZWN0LnByb3RvdHlwZS5wcm9wZXJ0eUlzRW51bWVyYWJsZS5jYWxsKHMsIHBbaV0pKSB0W3BbaV1dID0gc1twW2ldXTtcbiAgfVxuICByZXR1cm4gdDtcbn1cblxuZnVuY3Rpb24gX192YWx1ZXMobykge1xuICB2YXIgcyA9IHR5cGVvZiBTeW1ib2wgPT09IFwiZnVuY3Rpb25cIiAmJiBTeW1ib2wuaXRlcmF0b3IsXG4gICAgICBtID0gcyAmJiBvW3NdLFxuICAgICAgaSA9IDA7XG4gIGlmIChtKSByZXR1cm4gbS5jYWxsKG8pO1xuICBpZiAobyAmJiB0eXBlb2Ygby5sZW5ndGggPT09IFwibnVtYmVyXCIpIHJldHVybiB7XG4gICAgbmV4dDogZnVuY3Rpb24gKCkge1xuICAgICAgaWYgKG8gJiYgaSA+PSBvLmxlbmd0aCkgbyA9IHZvaWQgMDtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIHZhbHVlOiBvICYmIG9baSsrXSxcbiAgICAgICAgZG9uZTogIW9cbiAgICAgIH07XG4gICAgfVxuICB9O1xuICB0aHJvdyBuZXcgVHlwZUVycm9yKHMgPyBcIk9iamVjdCBpcyBub3QgaXRlcmFibGUuXCIgOiBcIlN5bWJvbC5pdGVyYXRvciBpcyBub3QgZGVmaW5lZC5cIik7XG59XG5cbmZ1bmN0aW9uIF9fcmVhZChvLCBuKSB7XG4gIHZhciBtID0gdHlwZW9mIFN5bWJvbCA9PT0gXCJmdW5jdGlvblwiICYmIG9bU3ltYm9sLml0ZXJhdG9yXTtcbiAgaWYgKCFtKSByZXR1cm4gbztcbiAgdmFyIGkgPSBtLmNhbGwobyksXG4gICAgICByLFxuICAgICAgYXIgPSBbXSxcbiAgICAgIGU7XG5cbiAgdHJ5IHtcbiAgICB3aGlsZSAoKG4gPT09IHZvaWQgMCB8fCBuLS0gPiAwKSAmJiAhKHIgPSBpLm5leHQoKSkuZG9uZSkgYXIucHVzaChyLnZhbHVlKTtcbiAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICBlID0ge1xuICAgICAgZXJyb3I6IGVycm9yXG4gICAgfTtcbiAgfSBmaW5hbGx5IHtcbiAgICB0cnkge1xuICAgICAgaWYgKHIgJiYgIXIuZG9uZSAmJiAobSA9IGlbXCJyZXR1cm5cIl0pKSBtLmNhbGwoaSk7XG4gICAgfSBmaW5hbGx5IHtcbiAgICAgIGlmIChlKSB0aHJvdyBlLmVycm9yO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiBhcjtcbn1cblxuZnVuY3Rpb24gX19zcHJlYWQoKSB7XG4gIGZvciAodmFyIGFyID0gW10sIGkgPSAwOyBpIDwgYXJndW1lbnRzLmxlbmd0aDsgaSsrKSBhciA9IGFyLmNvbmNhdChfX3JlYWQoYXJndW1lbnRzW2ldKSk7XG5cbiAgcmV0dXJuIGFyO1xufVxuXG5leHBvcnQgeyBfX2Fzc2lnbiwgX19yZWFkLCBfX3Jlc3QsIF9fc3ByZWFkLCBfX3ZhbHVlcyB9OyIsInZhciBTVEFURV9ERUxJTUlURVIgPSAnLic7XG52YXIgRU1QVFlfQUNUSVZJVFlfTUFQID0ge307XG52YXIgREVGQVVMVF9HVUFSRF9UWVBFID0gJ3hzdGF0ZS5ndWFyZCc7XG52YXIgVEFSR0VUTEVTU19LRVkgPSAnJztcbmV4cG9ydCB7IERFRkFVTFRfR1VBUkRfVFlQRSwgRU1QVFlfQUNUSVZJVFlfTUFQLCBTVEFURV9ERUxJTUlURVIsIFRBUkdFVExFU1NfS0VZIH07IiwidmFyIElTX1BST0RVQ1RJT04gPSBwcm9jZXNzLmVudi5OT0RFX0VOViA9PT0gJ3Byb2R1Y3Rpb24nO1xuZXhwb3J0IHsgSVNfUFJPRFVDVElPTiB9OyIsImltcG9ydCB7IF9fc3ByZWFkLCBfX3ZhbHVlcywgX19yZWFkLCBfX2Fzc2lnbiB9IGZyb20gJy4vX3ZpcnR1YWwvX3RzbGliLmpzJztcbmltcG9ydCB7IERFRkFVTFRfR1VBUkRfVFlQRSwgVEFSR0VUTEVTU19LRVksIFNUQVRFX0RFTElNSVRFUiB9IGZyb20gJy4vY29uc3RhbnRzLmpzJztcbmltcG9ydCB7IElTX1BST0RVQ1RJT04gfSBmcm9tICcuL2Vudmlyb25tZW50LmpzJztcblxuZnVuY3Rpb24ga2V5cyh2YWx1ZSkge1xuICByZXR1cm4gT2JqZWN0LmtleXModmFsdWUpO1xufVxuXG5mdW5jdGlvbiBtYXRjaGVzU3RhdGUocGFyZW50U3RhdGVJZCwgY2hpbGRTdGF0ZUlkLCBkZWxpbWl0ZXIpIHtcbiAgaWYgKGRlbGltaXRlciA9PT0gdm9pZCAwKSB7XG4gICAgZGVsaW1pdGVyID0gU1RBVEVfREVMSU1JVEVSO1xuICB9XG5cbiAgdmFyIHBhcmVudFN0YXRlVmFsdWUgPSB0b1N0YXRlVmFsdWUocGFyZW50U3RhdGVJZCwgZGVsaW1pdGVyKTtcbiAgdmFyIGNoaWxkU3RhdGVWYWx1ZSA9IHRvU3RhdGVWYWx1ZShjaGlsZFN0YXRlSWQsIGRlbGltaXRlcik7XG5cbiAgaWYgKGlzU3RyaW5nKGNoaWxkU3RhdGVWYWx1ZSkpIHtcbiAgICBpZiAoaXNTdHJpbmcocGFyZW50U3RhdGVWYWx1ZSkpIHtcbiAgICAgIHJldHVybiBjaGlsZFN0YXRlVmFsdWUgPT09IHBhcmVudFN0YXRlVmFsdWU7XG4gICAgfSAvLyBQYXJlbnQgbW9yZSBzcGVjaWZpYyB0aGFuIGNoaWxkXG5cblxuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIGlmIChpc1N0cmluZyhwYXJlbnRTdGF0ZVZhbHVlKSkge1xuICAgIHJldHVybiBwYXJlbnRTdGF0ZVZhbHVlIGluIGNoaWxkU3RhdGVWYWx1ZTtcbiAgfVxuXG4gIHJldHVybiBrZXlzKHBhcmVudFN0YXRlVmFsdWUpLmV2ZXJ5KGZ1bmN0aW9uIChrZXkpIHtcbiAgICBpZiAoIShrZXkgaW4gY2hpbGRTdGF0ZVZhbHVlKSkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIHJldHVybiBtYXRjaGVzU3RhdGUocGFyZW50U3RhdGVWYWx1ZVtrZXldLCBjaGlsZFN0YXRlVmFsdWVba2V5XSk7XG4gIH0pO1xufVxuXG5mdW5jdGlvbiBnZXRFdmVudFR5cGUoZXZlbnQpIHtcbiAgdHJ5IHtcbiAgICByZXR1cm4gaXNTdHJpbmcoZXZlbnQpIHx8IHR5cGVvZiBldmVudCA9PT0gJ251bWJlcicgPyBcIlwiICsgZXZlbnQgOiBldmVudC50eXBlO1xuICB9IGNhdGNoIChlKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdFdmVudHMgbXVzdCBiZSBzdHJpbmdzIG9yIG9iamVjdHMgd2l0aCBhIHN0cmluZyBldmVudC50eXBlIHByb3BlcnR5LicpO1xuICB9XG59XG5cbmZ1bmN0aW9uIHRvU3RhdGVQYXRoKHN0YXRlSWQsIGRlbGltaXRlcikge1xuICB0cnkge1xuICAgIGlmIChpc0FycmF5KHN0YXRlSWQpKSB7XG4gICAgICByZXR1cm4gc3RhdGVJZDtcbiAgICB9XG5cbiAgICByZXR1cm4gc3RhdGVJZC50b1N0cmluZygpLnNwbGl0KGRlbGltaXRlcik7XG4gIH0gY2F0Y2ggKGUpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoXCInXCIgKyBzdGF0ZUlkICsgXCInIGlzIG5vdCBhIHZhbGlkIHN0YXRlIHBhdGguXCIpO1xuICB9XG59XG5cbmZ1bmN0aW9uIGlzU3RhdGVMaWtlKHN0YXRlKSB7XG4gIHJldHVybiB0eXBlb2Ygc3RhdGUgPT09ICdvYmplY3QnICYmICd2YWx1ZScgaW4gc3RhdGUgJiYgJ2NvbnRleHQnIGluIHN0YXRlICYmICdldmVudCcgaW4gc3RhdGUgJiYgJ19ldmVudCcgaW4gc3RhdGU7XG59XG5cbmZ1bmN0aW9uIHRvU3RhdGVWYWx1ZShzdGF0ZVZhbHVlLCBkZWxpbWl0ZXIpIHtcbiAgaWYgKGlzU3RhdGVMaWtlKHN0YXRlVmFsdWUpKSB7XG4gICAgcmV0dXJuIHN0YXRlVmFsdWUudmFsdWU7XG4gIH1cblxuICBpZiAoaXNBcnJheShzdGF0ZVZhbHVlKSkge1xuICAgIHJldHVybiBwYXRoVG9TdGF0ZVZhbHVlKHN0YXRlVmFsdWUpO1xuICB9XG5cbiAgaWYgKHR5cGVvZiBzdGF0ZVZhbHVlICE9PSAnc3RyaW5nJykge1xuICAgIHJldHVybiBzdGF0ZVZhbHVlO1xuICB9XG5cbiAgdmFyIHN0YXRlUGF0aCA9IHRvU3RhdGVQYXRoKHN0YXRlVmFsdWUsIGRlbGltaXRlcik7XG4gIHJldHVybiBwYXRoVG9TdGF0ZVZhbHVlKHN0YXRlUGF0aCk7XG59XG5cbmZ1bmN0aW9uIHBhdGhUb1N0YXRlVmFsdWUoc3RhdGVQYXRoKSB7XG4gIGlmIChzdGF0ZVBhdGgubGVuZ3RoID09PSAxKSB7XG4gICAgcmV0dXJuIHN0YXRlUGF0aFswXTtcbiAgfVxuXG4gIHZhciB2YWx1ZSA9IHt9O1xuICB2YXIgbWFya2VyID0gdmFsdWU7XG5cbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBzdGF0ZVBhdGgubGVuZ3RoIC0gMTsgaSsrKSB7XG4gICAgaWYgKGkgPT09IHN0YXRlUGF0aC5sZW5ndGggLSAyKSB7XG4gICAgICBtYXJrZXJbc3RhdGVQYXRoW2ldXSA9IHN0YXRlUGF0aFtpICsgMV07XG4gICAgfSBlbHNlIHtcbiAgICAgIG1hcmtlcltzdGF0ZVBhdGhbaV1dID0ge307XG4gICAgICBtYXJrZXIgPSBtYXJrZXJbc3RhdGVQYXRoW2ldXTtcbiAgICB9XG4gIH1cblxuICByZXR1cm4gdmFsdWU7XG59XG5cbmZ1bmN0aW9uIG1hcFZhbHVlcyhjb2xsZWN0aW9uLCBpdGVyYXRlZSkge1xuICB2YXIgcmVzdWx0ID0ge307XG4gIHZhciBjb2xsZWN0aW9uS2V5cyA9IGtleXMoY29sbGVjdGlvbik7XG5cbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBjb2xsZWN0aW9uS2V5cy5sZW5ndGg7IGkrKykge1xuICAgIHZhciBrZXkgPSBjb2xsZWN0aW9uS2V5c1tpXTtcbiAgICByZXN1bHRba2V5XSA9IGl0ZXJhdGVlKGNvbGxlY3Rpb25ba2V5XSwga2V5LCBjb2xsZWN0aW9uLCBpKTtcbiAgfVxuXG4gIHJldHVybiByZXN1bHQ7XG59XG5cbmZ1bmN0aW9uIG1hcEZpbHRlclZhbHVlcyhjb2xsZWN0aW9uLCBpdGVyYXRlZSwgcHJlZGljYXRlKSB7XG4gIHZhciBlXzEsIF9hO1xuXG4gIHZhciByZXN1bHQgPSB7fTtcblxuICB0cnkge1xuICAgIGZvciAodmFyIF9iID0gX192YWx1ZXMoa2V5cyhjb2xsZWN0aW9uKSksIF9jID0gX2IubmV4dCgpOyAhX2MuZG9uZTsgX2MgPSBfYi5uZXh0KCkpIHtcbiAgICAgIHZhciBrZXkgPSBfYy52YWx1ZTtcbiAgICAgIHZhciBpdGVtID0gY29sbGVjdGlvbltrZXldO1xuXG4gICAgICBpZiAoIXByZWRpY2F0ZShpdGVtKSkge1xuICAgICAgICBjb250aW51ZTtcbiAgICAgIH1cblxuICAgICAgcmVzdWx0W2tleV0gPSBpdGVyYXRlZShpdGVtLCBrZXksIGNvbGxlY3Rpb24pO1xuICAgIH1cbiAgfSBjYXRjaCAoZV8xXzEpIHtcbiAgICBlXzEgPSB7XG4gICAgICBlcnJvcjogZV8xXzFcbiAgICB9O1xuICB9IGZpbmFsbHkge1xuICAgIHRyeSB7XG4gICAgICBpZiAoX2MgJiYgIV9jLmRvbmUgJiYgKF9hID0gX2IucmV0dXJuKSkgX2EuY2FsbChfYik7XG4gICAgfSBmaW5hbGx5IHtcbiAgICAgIGlmIChlXzEpIHRocm93IGVfMS5lcnJvcjtcbiAgICB9XG4gIH1cblxuICByZXR1cm4gcmVzdWx0O1xufVxuLyoqXHJcbiAqIFJldHJpZXZlcyBhIHZhbHVlIGF0IHRoZSBnaXZlbiBwYXRoLlxyXG4gKiBAcGFyYW0gcHJvcHMgVGhlIGRlZXAgcGF0aCB0byB0aGUgcHJvcCBvZiB0aGUgZGVzaXJlZCB2YWx1ZVxyXG4gKi9cblxuXG52YXIgcGF0aCA9IGZ1bmN0aW9uIChwcm9wcykge1xuICByZXR1cm4gZnVuY3Rpb24gKG9iamVjdCkge1xuICAgIHZhciBlXzIsIF9hO1xuXG4gICAgdmFyIHJlc3VsdCA9IG9iamVjdDtcblxuICAgIHRyeSB7XG4gICAgICBmb3IgKHZhciBwcm9wc18xID0gX192YWx1ZXMocHJvcHMpLCBwcm9wc18xXzEgPSBwcm9wc18xLm5leHQoKTsgIXByb3BzXzFfMS5kb25lOyBwcm9wc18xXzEgPSBwcm9wc18xLm5leHQoKSkge1xuICAgICAgICB2YXIgcHJvcCA9IHByb3BzXzFfMS52YWx1ZTtcbiAgICAgICAgcmVzdWx0ID0gcmVzdWx0W3Byb3BdO1xuICAgICAgfVxuICAgIH0gY2F0Y2ggKGVfMl8xKSB7XG4gICAgICBlXzIgPSB7XG4gICAgICAgIGVycm9yOiBlXzJfMVxuICAgICAgfTtcbiAgICB9IGZpbmFsbHkge1xuICAgICAgdHJ5IHtcbiAgICAgICAgaWYgKHByb3BzXzFfMSAmJiAhcHJvcHNfMV8xLmRvbmUgJiYgKF9hID0gcHJvcHNfMS5yZXR1cm4pKSBfYS5jYWxsKHByb3BzXzEpO1xuICAgICAgfSBmaW5hbGx5IHtcbiAgICAgICAgaWYgKGVfMikgdGhyb3cgZV8yLmVycm9yO1xuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiByZXN1bHQ7XG4gIH07XG59O1xuLyoqXHJcbiAqIFJldHJpZXZlcyBhIHZhbHVlIGF0IHRoZSBnaXZlbiBwYXRoIHZpYSB0aGUgbmVzdGVkIGFjY2Vzc29yIHByb3AuXHJcbiAqIEBwYXJhbSBwcm9wcyBUaGUgZGVlcCBwYXRoIHRvIHRoZSBwcm9wIG9mIHRoZSBkZXNpcmVkIHZhbHVlXHJcbiAqL1xuXG5cbmZ1bmN0aW9uIG5lc3RlZFBhdGgocHJvcHMsIGFjY2Vzc29yUHJvcCkge1xuICByZXR1cm4gZnVuY3Rpb24gKG9iamVjdCkge1xuICAgIHZhciBlXzMsIF9hO1xuXG4gICAgdmFyIHJlc3VsdCA9IG9iamVjdDtcblxuICAgIHRyeSB7XG4gICAgICBmb3IgKHZhciBwcm9wc18yID0gX192YWx1ZXMocHJvcHMpLCBwcm9wc18yXzEgPSBwcm9wc18yLm5leHQoKTsgIXByb3BzXzJfMS5kb25lOyBwcm9wc18yXzEgPSBwcm9wc18yLm5leHQoKSkge1xuICAgICAgICB2YXIgcHJvcCA9IHByb3BzXzJfMS52YWx1ZTtcbiAgICAgICAgcmVzdWx0ID0gcmVzdWx0W2FjY2Vzc29yUHJvcF1bcHJvcF07XG4gICAgICB9XG4gICAgfSBjYXRjaCAoZV8zXzEpIHtcbiAgICAgIGVfMyA9IHtcbiAgICAgICAgZXJyb3I6IGVfM18xXG4gICAgICB9O1xuICAgIH0gZmluYWxseSB7XG4gICAgICB0cnkge1xuICAgICAgICBpZiAocHJvcHNfMl8xICYmICFwcm9wc18yXzEuZG9uZSAmJiAoX2EgPSBwcm9wc18yLnJldHVybikpIF9hLmNhbGwocHJvcHNfMik7XG4gICAgICB9IGZpbmFsbHkge1xuICAgICAgICBpZiAoZV8zKSB0aHJvdyBlXzMuZXJyb3I7XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIHJlc3VsdDtcbiAgfTtcbn1cblxuZnVuY3Rpb24gdG9TdGF0ZVBhdGhzKHN0YXRlVmFsdWUpIHtcbiAgaWYgKCFzdGF0ZVZhbHVlKSB7XG4gICAgcmV0dXJuIFtbXV07XG4gIH1cblxuICBpZiAoaXNTdHJpbmcoc3RhdGVWYWx1ZSkpIHtcbiAgICByZXR1cm4gW1tzdGF0ZVZhbHVlXV07XG4gIH1cblxuICB2YXIgcmVzdWx0ID0gZmxhdHRlbihrZXlzKHN0YXRlVmFsdWUpLm1hcChmdW5jdGlvbiAoa2V5KSB7XG4gICAgdmFyIHN1YlN0YXRlVmFsdWUgPSBzdGF0ZVZhbHVlW2tleV07XG5cbiAgICBpZiAodHlwZW9mIHN1YlN0YXRlVmFsdWUgIT09ICdzdHJpbmcnICYmICghc3ViU3RhdGVWYWx1ZSB8fCAhT2JqZWN0LmtleXMoc3ViU3RhdGVWYWx1ZSkubGVuZ3RoKSkge1xuICAgICAgcmV0dXJuIFtba2V5XV07XG4gICAgfVxuXG4gICAgcmV0dXJuIHRvU3RhdGVQYXRocyhzdGF0ZVZhbHVlW2tleV0pLm1hcChmdW5jdGlvbiAoc3ViUGF0aCkge1xuICAgICAgcmV0dXJuIFtrZXldLmNvbmNhdChzdWJQYXRoKTtcbiAgICB9KTtcbiAgfSkpO1xuICByZXR1cm4gcmVzdWx0O1xufVxuXG5mdW5jdGlvbiBmbGF0dGVuKGFycmF5KSB7XG4gIHZhciBfYTtcblxuICByZXR1cm4gKF9hID0gW10pLmNvbmNhdC5hcHBseShfYSwgX19zcHJlYWQoYXJyYXkpKTtcbn1cblxuZnVuY3Rpb24gdG9BcnJheVN0cmljdCh2YWx1ZSkge1xuICBpZiAoaXNBcnJheSh2YWx1ZSkpIHtcbiAgICByZXR1cm4gdmFsdWU7XG4gIH1cblxuICByZXR1cm4gW3ZhbHVlXTtcbn1cblxuZnVuY3Rpb24gdG9BcnJheSh2YWx1ZSkge1xuICBpZiAodmFsdWUgPT09IHVuZGVmaW5lZCkge1xuICAgIHJldHVybiBbXTtcbiAgfVxuXG4gIHJldHVybiB0b0FycmF5U3RyaWN0KHZhbHVlKTtcbn1cblxuZnVuY3Rpb24gbWFwQ29udGV4dChtYXBwZXIsIGNvbnRleHQsIF9ldmVudCkge1xuICB2YXIgZV81LCBfYTtcblxuICBpZiAoaXNGdW5jdGlvbihtYXBwZXIpKSB7XG4gICAgcmV0dXJuIG1hcHBlcihjb250ZXh0LCBfZXZlbnQuZGF0YSk7XG4gIH1cblxuICB2YXIgcmVzdWx0ID0ge307XG5cbiAgdHJ5IHtcbiAgICBmb3IgKHZhciBfYiA9IF9fdmFsdWVzKE9iamVjdC5rZXlzKG1hcHBlcikpLCBfYyA9IF9iLm5leHQoKTsgIV9jLmRvbmU7IF9jID0gX2IubmV4dCgpKSB7XG4gICAgICB2YXIga2V5ID0gX2MudmFsdWU7XG4gICAgICB2YXIgc3ViTWFwcGVyID0gbWFwcGVyW2tleV07XG5cbiAgICAgIGlmIChpc0Z1bmN0aW9uKHN1Yk1hcHBlcikpIHtcbiAgICAgICAgcmVzdWx0W2tleV0gPSBzdWJNYXBwZXIoY29udGV4dCwgX2V2ZW50LmRhdGEpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmVzdWx0W2tleV0gPSBzdWJNYXBwZXI7XG4gICAgICB9XG4gICAgfVxuICB9IGNhdGNoIChlXzVfMSkge1xuICAgIGVfNSA9IHtcbiAgICAgIGVycm9yOiBlXzVfMVxuICAgIH07XG4gIH0gZmluYWxseSB7XG4gICAgdHJ5IHtcbiAgICAgIGlmIChfYyAmJiAhX2MuZG9uZSAmJiAoX2EgPSBfYi5yZXR1cm4pKSBfYS5jYWxsKF9iKTtcbiAgICB9IGZpbmFsbHkge1xuICAgICAgaWYgKGVfNSkgdGhyb3cgZV81LmVycm9yO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiByZXN1bHQ7XG59XG5cbmZ1bmN0aW9uIGlzQnVpbHRJbkV2ZW50KGV2ZW50VHlwZSkge1xuICByZXR1cm4gL14oZG9uZXxlcnJvcilcXC4vLnRlc3QoZXZlbnRUeXBlKTtcbn1cblxuZnVuY3Rpb24gaXNQcm9taXNlTGlrZSh2YWx1ZSkge1xuICBpZiAodmFsdWUgaW5zdGFuY2VvZiBQcm9taXNlKSB7XG4gICAgcmV0dXJuIHRydWU7XG4gIH0gLy8gQ2hlY2sgaWYgc2hhcGUgbWF0Y2hlcyB0aGUgUHJvbWlzZS9BKyBzcGVjaWZpY2F0aW9uIGZvciBhIFwidGhlbmFibGVcIi5cblxuXG4gIGlmICh2YWx1ZSAhPT0gbnVsbCAmJiAoaXNGdW5jdGlvbih2YWx1ZSkgfHwgdHlwZW9mIHZhbHVlID09PSAnb2JqZWN0JykgJiYgaXNGdW5jdGlvbih2YWx1ZS50aGVuKSkge1xuICAgIHJldHVybiB0cnVlO1xuICB9XG5cbiAgcmV0dXJuIGZhbHNlO1xufVxuXG5mdW5jdGlvbiBwYXJ0aXRpb24oaXRlbXMsIHByZWRpY2F0ZSkge1xuICB2YXIgZV82LCBfYTtcblxuICB2YXIgX2IgPSBfX3JlYWQoW1tdLCBbXV0sIDIpLFxuICAgICAgdHJ1dGh5ID0gX2JbMF0sXG4gICAgICBmYWxzeSA9IF9iWzFdO1xuXG4gIHRyeSB7XG4gICAgZm9yICh2YXIgaXRlbXNfMSA9IF9fdmFsdWVzKGl0ZW1zKSwgaXRlbXNfMV8xID0gaXRlbXNfMS5uZXh0KCk7ICFpdGVtc18xXzEuZG9uZTsgaXRlbXNfMV8xID0gaXRlbXNfMS5uZXh0KCkpIHtcbiAgICAgIHZhciBpdGVtID0gaXRlbXNfMV8xLnZhbHVlO1xuXG4gICAgICBpZiAocHJlZGljYXRlKGl0ZW0pKSB7XG4gICAgICAgIHRydXRoeS5wdXNoKGl0ZW0pO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgZmFsc3kucHVzaChpdGVtKTtcbiAgICAgIH1cbiAgICB9XG4gIH0gY2F0Y2ggKGVfNl8xKSB7XG4gICAgZV82ID0ge1xuICAgICAgZXJyb3I6IGVfNl8xXG4gICAgfTtcbiAgfSBmaW5hbGx5IHtcbiAgICB0cnkge1xuICAgICAgaWYgKGl0ZW1zXzFfMSAmJiAhaXRlbXNfMV8xLmRvbmUgJiYgKF9hID0gaXRlbXNfMS5yZXR1cm4pKSBfYS5jYWxsKGl0ZW1zXzEpO1xuICAgIH0gZmluYWxseSB7XG4gICAgICBpZiAoZV82KSB0aHJvdyBlXzYuZXJyb3I7XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIFt0cnV0aHksIGZhbHN5XTtcbn1cblxuZnVuY3Rpb24gdXBkYXRlSGlzdG9yeVN0YXRlcyhoaXN0LCBzdGF0ZVZhbHVlKSB7XG4gIHJldHVybiBtYXBWYWx1ZXMoaGlzdC5zdGF0ZXMsIGZ1bmN0aW9uIChzdWJIaXN0LCBrZXkpIHtcbiAgICBpZiAoIXN1Ykhpc3QpIHtcbiAgICAgIHJldHVybiB1bmRlZmluZWQ7XG4gICAgfVxuXG4gICAgdmFyIHN1YlN0YXRlVmFsdWUgPSAoaXNTdHJpbmcoc3RhdGVWYWx1ZSkgPyB1bmRlZmluZWQgOiBzdGF0ZVZhbHVlW2tleV0pIHx8IChzdWJIaXN0ID8gc3ViSGlzdC5jdXJyZW50IDogdW5kZWZpbmVkKTtcblxuICAgIGlmICghc3ViU3RhdGVWYWx1ZSkge1xuICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgICB9XG5cbiAgICByZXR1cm4ge1xuICAgICAgY3VycmVudDogc3ViU3RhdGVWYWx1ZSxcbiAgICAgIHN0YXRlczogdXBkYXRlSGlzdG9yeVN0YXRlcyhzdWJIaXN0LCBzdWJTdGF0ZVZhbHVlKVxuICAgIH07XG4gIH0pO1xufVxuXG5mdW5jdGlvbiB1cGRhdGVIaXN0b3J5VmFsdWUoaGlzdCwgc3RhdGVWYWx1ZSkge1xuICByZXR1cm4ge1xuICAgIGN1cnJlbnQ6IHN0YXRlVmFsdWUsXG4gICAgc3RhdGVzOiB1cGRhdGVIaXN0b3J5U3RhdGVzKGhpc3QsIHN0YXRlVmFsdWUpXG4gIH07XG59XG5cbmZ1bmN0aW9uIHVwZGF0ZUNvbnRleHQoY29udGV4dCwgX2V2ZW50LCBhc3NpZ25BY3Rpb25zLCBzdGF0ZSkge1xuICBpZiAoIUlTX1BST0RVQ1RJT04pIHtcbiAgICB3YXJuKCEhY29udGV4dCwgJ0F0dGVtcHRpbmcgdG8gdXBkYXRlIHVuZGVmaW5lZCBjb250ZXh0Jyk7XG4gIH1cblxuICB2YXIgdXBkYXRlZENvbnRleHQgPSBjb250ZXh0ID8gYXNzaWduQWN0aW9ucy5yZWR1Y2UoZnVuY3Rpb24gKGFjYywgYXNzaWduQWN0aW9uKSB7XG4gICAgdmFyIGVfNywgX2E7XG5cbiAgICB2YXIgYXNzaWdubWVudCA9IGFzc2lnbkFjdGlvbi5hc3NpZ25tZW50O1xuICAgIHZhciBtZXRhID0ge1xuICAgICAgc3RhdGU6IHN0YXRlLFxuICAgICAgYWN0aW9uOiBhc3NpZ25BY3Rpb24sXG4gICAgICBfZXZlbnQ6IF9ldmVudFxuICAgIH07XG4gICAgdmFyIHBhcnRpYWxVcGRhdGUgPSB7fTtcblxuICAgIGlmIChpc0Z1bmN0aW9uKGFzc2lnbm1lbnQpKSB7XG4gICAgICBwYXJ0aWFsVXBkYXRlID0gYXNzaWdubWVudChhY2MsIF9ldmVudC5kYXRhLCBtZXRhKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdHJ5IHtcbiAgICAgICAgZm9yICh2YXIgX2IgPSBfX3ZhbHVlcyhrZXlzKGFzc2lnbm1lbnQpKSwgX2MgPSBfYi5uZXh0KCk7ICFfYy5kb25lOyBfYyA9IF9iLm5leHQoKSkge1xuICAgICAgICAgIHZhciBrZXkgPSBfYy52YWx1ZTtcbiAgICAgICAgICB2YXIgcHJvcEFzc2lnbm1lbnQgPSBhc3NpZ25tZW50W2tleV07XG4gICAgICAgICAgcGFydGlhbFVwZGF0ZVtrZXldID0gaXNGdW5jdGlvbihwcm9wQXNzaWdubWVudCkgPyBwcm9wQXNzaWdubWVudChhY2MsIF9ldmVudC5kYXRhLCBtZXRhKSA6IHByb3BBc3NpZ25tZW50O1xuICAgICAgICB9XG4gICAgICB9IGNhdGNoIChlXzdfMSkge1xuICAgICAgICBlXzcgPSB7XG4gICAgICAgICAgZXJyb3I6IGVfN18xXG4gICAgICAgIH07XG4gICAgICB9IGZpbmFsbHkge1xuICAgICAgICB0cnkge1xuICAgICAgICAgIGlmIChfYyAmJiAhX2MuZG9uZSAmJiAoX2EgPSBfYi5yZXR1cm4pKSBfYS5jYWxsKF9iKTtcbiAgICAgICAgfSBmaW5hbGx5IHtcbiAgICAgICAgICBpZiAoZV83KSB0aHJvdyBlXzcuZXJyb3I7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gT2JqZWN0LmFzc2lnbih7fSwgYWNjLCBwYXJ0aWFsVXBkYXRlKTtcbiAgfSwgY29udGV4dCkgOiBjb250ZXh0O1xuICByZXR1cm4gdXBkYXRlZENvbnRleHQ7XG59IC8vIHRzbGludDpkaXNhYmxlLW5leHQtbGluZTpuby1lbXB0eVxuXG5cbnZhciB3YXJuID0gZnVuY3Rpb24gKCkge307XG5cbmlmICghSVNfUFJPRFVDVElPTikge1xuICB3YXJuID0gZnVuY3Rpb24gKGNvbmRpdGlvbiwgbWVzc2FnZSkge1xuICAgIHZhciBlcnJvciA9IGNvbmRpdGlvbiBpbnN0YW5jZW9mIEVycm9yID8gY29uZGl0aW9uIDogdW5kZWZpbmVkO1xuXG4gICAgaWYgKCFlcnJvciAmJiBjb25kaXRpb24pIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBpZiAoY29uc29sZSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICB2YXIgYXJncyA9IFtcIldhcm5pbmc6IFwiICsgbWVzc2FnZV07XG5cbiAgICAgIGlmIChlcnJvcikge1xuICAgICAgICBhcmdzLnB1c2goZXJyb3IpO1xuICAgICAgfSAvLyB0c2xpbnQ6ZGlzYWJsZS1uZXh0LWxpbmU6bm8tY29uc29sZVxuXG5cbiAgICAgIGNvbnNvbGUud2Fybi5hcHBseShjb25zb2xlLCBhcmdzKTtcbiAgICB9XG4gIH07XG59XG5cbmZ1bmN0aW9uIGlzQXJyYXkodmFsdWUpIHtcbiAgcmV0dXJuIEFycmF5LmlzQXJyYXkodmFsdWUpO1xufSAvLyB0c2xpbnQ6ZGlzYWJsZS1uZXh0LWxpbmU6YmFuLXR5cGVzXG5cblxuZnVuY3Rpb24gaXNGdW5jdGlvbih2YWx1ZSkge1xuICByZXR1cm4gdHlwZW9mIHZhbHVlID09PSAnZnVuY3Rpb24nO1xufVxuXG5mdW5jdGlvbiBpc1N0cmluZyh2YWx1ZSkge1xuICByZXR1cm4gdHlwZW9mIHZhbHVlID09PSAnc3RyaW5nJztcbn0gLy8gZXhwb3J0IGZ1bmN0aW9uIG1lbW9pemVkR2V0dGVyPFQsIFRQIGV4dGVuZHMgeyBwcm90b3R5cGU6IG9iamVjdCB9Pihcbi8vICAgbzogVFAsXG4vLyAgIHByb3BlcnR5OiBzdHJpbmcsXG4vLyAgIGdldHRlcjogKCkgPT4gVFxuLy8gKTogdm9pZCB7XG4vLyAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShvLnByb3RvdHlwZSwgcHJvcGVydHksIHtcbi8vICAgICBnZXQ6IGdldHRlcixcbi8vICAgICBlbnVtZXJhYmxlOiBmYWxzZSxcbi8vICAgICBjb25maWd1cmFibGU6IGZhbHNlXG4vLyAgIH0pO1xuLy8gfVxuXG5cbmZ1bmN0aW9uIHRvR3VhcmQoY29uZGl0aW9uLCBndWFyZE1hcCkge1xuICBpZiAoIWNvbmRpdGlvbikge1xuICAgIHJldHVybiB1bmRlZmluZWQ7XG4gIH1cblxuICBpZiAoaXNTdHJpbmcoY29uZGl0aW9uKSkge1xuICAgIHJldHVybiB7XG4gICAgICB0eXBlOiBERUZBVUxUX0dVQVJEX1RZUEUsXG4gICAgICBuYW1lOiBjb25kaXRpb24sXG4gICAgICBwcmVkaWNhdGU6IGd1YXJkTWFwID8gZ3VhcmRNYXBbY29uZGl0aW9uXSA6IHVuZGVmaW5lZFxuICAgIH07XG4gIH1cblxuICBpZiAoaXNGdW5jdGlvbihjb25kaXRpb24pKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIHR5cGU6IERFRkFVTFRfR1VBUkRfVFlQRSxcbiAgICAgIG5hbWU6IGNvbmRpdGlvbi5uYW1lLFxuICAgICAgcHJlZGljYXRlOiBjb25kaXRpb25cbiAgICB9O1xuICB9XG5cbiAgcmV0dXJuIGNvbmRpdGlvbjtcbn1cblxuZnVuY3Rpb24gaXNPYnNlcnZhYmxlKHZhbHVlKSB7XG4gIHRyeSB7XG4gICAgcmV0dXJuICdzdWJzY3JpYmUnIGluIHZhbHVlICYmIGlzRnVuY3Rpb24odmFsdWUuc3Vic2NyaWJlKTtcbiAgfSBjYXRjaCAoZSkge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxufVxuXG52YXIgc3ltYm9sT2JzZXJ2YWJsZSA9IC8qI19fUFVSRV9fKi9mdW5jdGlvbiAoKSB7XG4gIHJldHVybiB0eXBlb2YgU3ltYm9sID09PSAnZnVuY3Rpb24nICYmIFN5bWJvbC5vYnNlcnZhYmxlIHx8ICdAQG9ic2VydmFibGUnO1xufSgpO1xuXG5mdW5jdGlvbiBpc01hY2hpbmUodmFsdWUpIHtcbiAgdHJ5IHtcbiAgICByZXR1cm4gJ19feHN0YXRlbm9kZScgaW4gdmFsdWU7XG4gIH0gY2F0Y2ggKGUpIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cbn1cblxuZnVuY3Rpb24gaXNBY3Rvcih2YWx1ZSkge1xuICByZXR1cm4gISF2YWx1ZSAmJiB0eXBlb2YgdmFsdWUuc2VuZCA9PT0gJ2Z1bmN0aW9uJztcbn1cblxudmFyIHVuaXF1ZUlkID0gLyojX19QVVJFX18qL2Z1bmN0aW9uICgpIHtcbiAgdmFyIGN1cnJlbnRJZCA9IDA7XG4gIHJldHVybiBmdW5jdGlvbiAoKSB7XG4gICAgY3VycmVudElkKys7XG4gICAgcmV0dXJuIGN1cnJlbnRJZC50b1N0cmluZygxNik7XG4gIH07XG59KCk7XG5cbmZ1bmN0aW9uIHRvRXZlbnRPYmplY3QoZXZlbnQsIHBheWxvYWQgLy8gaWQ/OiBURXZlbnRbJ3R5cGUnXVxuKSB7XG4gIGlmIChpc1N0cmluZyhldmVudCkgfHwgdHlwZW9mIGV2ZW50ID09PSAnbnVtYmVyJykge1xuICAgIHJldHVybiBfX2Fzc2lnbih7XG4gICAgICB0eXBlOiBldmVudFxuICAgIH0sIHBheWxvYWQpO1xuICB9XG5cbiAgcmV0dXJuIGV2ZW50O1xufVxuXG5mdW5jdGlvbiB0b1NDWE1MRXZlbnQoZXZlbnQsIHNjeG1sRXZlbnQpIHtcbiAgaWYgKCFpc1N0cmluZyhldmVudCkgJiYgJyQkdHlwZScgaW4gZXZlbnQgJiYgZXZlbnQuJCR0eXBlID09PSAnc2N4bWwnKSB7XG4gICAgcmV0dXJuIGV2ZW50O1xuICB9XG5cbiAgdmFyIGV2ZW50T2JqZWN0ID0gdG9FdmVudE9iamVjdChldmVudCk7XG4gIHJldHVybiBfX2Fzc2lnbih7XG4gICAgbmFtZTogZXZlbnRPYmplY3QudHlwZSxcbiAgICBkYXRhOiBldmVudE9iamVjdCxcbiAgICAkJHR5cGU6ICdzY3htbCcsXG4gICAgdHlwZTogJ2V4dGVybmFsJ1xuICB9LCBzY3htbEV2ZW50KTtcbn1cblxuZnVuY3Rpb24gdG9UcmFuc2l0aW9uQ29uZmlnQXJyYXkoZXZlbnQsIGNvbmZpZ0xpa2UpIHtcbiAgdmFyIHRyYW5zaXRpb25zID0gdG9BcnJheVN0cmljdChjb25maWdMaWtlKS5tYXAoZnVuY3Rpb24gKHRyYW5zaXRpb25MaWtlKSB7XG4gICAgaWYgKHR5cGVvZiB0cmFuc2l0aW9uTGlrZSA9PT0gJ3VuZGVmaW5lZCcgfHwgdHlwZW9mIHRyYW5zaXRpb25MaWtlID09PSAnc3RyaW5nJyB8fCBpc01hY2hpbmUodHJhbnNpdGlvbkxpa2UpKSB7XG4gICAgICByZXR1cm4ge1xuICAgICAgICB0YXJnZXQ6IHRyYW5zaXRpb25MaWtlLFxuICAgICAgICBldmVudDogZXZlbnRcbiAgICAgIH07XG4gICAgfVxuXG4gICAgcmV0dXJuIF9fYXNzaWduKF9fYXNzaWduKHt9LCB0cmFuc2l0aW9uTGlrZSksIHtcbiAgICAgIGV2ZW50OiBldmVudFxuICAgIH0pO1xuICB9KTtcbiAgcmV0dXJuIHRyYW5zaXRpb25zO1xufVxuXG5mdW5jdGlvbiBub3JtYWxpemVUYXJnZXQodGFyZ2V0KSB7XG4gIGlmICh0YXJnZXQgPT09IHVuZGVmaW5lZCB8fCB0YXJnZXQgPT09IFRBUkdFVExFU1NfS0VZKSB7XG4gICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgfVxuXG4gIHJldHVybiB0b0FycmF5KHRhcmdldCk7XG59XG5cbmZ1bmN0aW9uIHJlcG9ydFVuaGFuZGxlZEV4Y2VwdGlvbk9uSW52b2NhdGlvbihvcmlnaW5hbEVycm9yLCBjdXJyZW50RXJyb3IsIGlkKSB7XG4gIGlmICghSVNfUFJPRFVDVElPTikge1xuICAgIHZhciBvcmlnaW5hbFN0YWNrVHJhY2UgPSBvcmlnaW5hbEVycm9yLnN0YWNrID8gXCIgU3RhY2t0cmFjZSB3YXMgJ1wiICsgb3JpZ2luYWxFcnJvci5zdGFjayArIFwiJ1wiIDogJyc7XG5cbiAgICBpZiAob3JpZ2luYWxFcnJvciA9PT0gY3VycmVudEVycm9yKSB7XG4gICAgICAvLyB0c2xpbnQ6ZGlzYWJsZS1uZXh0LWxpbmU6bm8tY29uc29sZVxuICAgICAgY29uc29sZS5lcnJvcihcIk1pc3Npbmcgb25FcnJvciBoYW5kbGVyIGZvciBpbnZvY2F0aW9uICdcIiArIGlkICsgXCInLCBlcnJvciB3YXMgJ1wiICsgb3JpZ2luYWxFcnJvciArIFwiJy5cIiArIG9yaWdpbmFsU3RhY2tUcmFjZSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHZhciBzdGFja1RyYWNlID0gY3VycmVudEVycm9yLnN0YWNrID8gXCIgU3RhY2t0cmFjZSB3YXMgJ1wiICsgY3VycmVudEVycm9yLnN0YWNrICsgXCInXCIgOiAnJzsgLy8gdHNsaW50OmRpc2FibGUtbmV4dC1saW5lOm5vLWNvbnNvbGVcblxuICAgICAgY29uc29sZS5lcnJvcihcIk1pc3Npbmcgb25FcnJvciBoYW5kbGVyIGFuZC9vciB1bmhhbmRsZWQgZXhjZXB0aW9uL3Byb21pc2UgcmVqZWN0aW9uIGZvciBpbnZvY2F0aW9uICdcIiArIGlkICsgXCInLiBcIiArIChcIk9yaWdpbmFsIGVycm9yOiAnXCIgKyBvcmlnaW5hbEVycm9yICsgXCInLiBcIiArIG9yaWdpbmFsU3RhY2tUcmFjZSArIFwiIEN1cnJlbnQgZXJyb3IgaXMgJ1wiICsgY3VycmVudEVycm9yICsgXCInLlwiICsgc3RhY2tUcmFjZSkpO1xuICAgIH1cbiAgfVxufVxuXG5mdW5jdGlvbiBldmFsdWF0ZUd1YXJkKG1hY2hpbmUsIGd1YXJkLCBjb250ZXh0LCBfZXZlbnQsIHN0YXRlKSB7XG4gIHZhciBndWFyZHMgPSBtYWNoaW5lLm9wdGlvbnMuZ3VhcmRzO1xuICB2YXIgZ3VhcmRNZXRhID0ge1xuICAgIHN0YXRlOiBzdGF0ZSxcbiAgICBjb25kOiBndWFyZCxcbiAgICBfZXZlbnQ6IF9ldmVudFxuICB9OyAvLyBUT0RPOiBkbyBub3QgaGFyZGNvZGUhXG5cbiAgaWYgKGd1YXJkLnR5cGUgPT09IERFRkFVTFRfR1VBUkRfVFlQRSkge1xuICAgIHJldHVybiBndWFyZC5wcmVkaWNhdGUoY29udGV4dCwgX2V2ZW50LmRhdGEsIGd1YXJkTWV0YSk7XG4gIH1cblxuICB2YXIgY29uZEZuID0gZ3VhcmRzW2d1YXJkLnR5cGVdO1xuXG4gIGlmICghY29uZEZuKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKFwiR3VhcmQgJ1wiICsgZ3VhcmQudHlwZSArIFwiJyBpcyBub3QgaW1wbGVtZW50ZWQgb24gbWFjaGluZSAnXCIgKyBtYWNoaW5lLmlkICsgXCInLlwiKTtcbiAgfVxuXG4gIHJldHVybiBjb25kRm4oY29udGV4dCwgX2V2ZW50LmRhdGEsIGd1YXJkTWV0YSk7XG59XG5cbmZ1bmN0aW9uIHRvSW52b2tlU291cmNlKHNyYykge1xuICBpZiAodHlwZW9mIHNyYyA9PT0gJ3N0cmluZycpIHtcbiAgICByZXR1cm4ge1xuICAgICAgdHlwZTogc3JjXG4gICAgfTtcbiAgfVxuXG4gIHJldHVybiBzcmM7XG59XG5cbmZ1bmN0aW9uIHRvT2JzZXJ2ZXIobmV4dEhhbmRsZXIsIGVycm9ySGFuZGxlciwgY29tcGxldGlvbkhhbmRsZXIpIHtcbiAgaWYgKHR5cGVvZiBuZXh0SGFuZGxlciA9PT0gJ29iamVjdCcpIHtcbiAgICByZXR1cm4gbmV4dEhhbmRsZXI7XG4gIH1cblxuICB2YXIgbm9vcCA9IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gdm9pZCAwO1xuICB9O1xuXG4gIHJldHVybiB7XG4gICAgbmV4dDogbmV4dEhhbmRsZXIsXG4gICAgZXJyb3I6IGVycm9ySGFuZGxlciB8fCBub29wLFxuICAgIGNvbXBsZXRlOiBjb21wbGV0aW9uSGFuZGxlciB8fCBub29wXG4gIH07XG59XG5cbmV4cG9ydCB7IGV2YWx1YXRlR3VhcmQsIGZsYXR0ZW4sIGdldEV2ZW50VHlwZSwgaXNBY3RvciwgaXNBcnJheSwgaXNCdWlsdEluRXZlbnQsIGlzRnVuY3Rpb24sIGlzTWFjaGluZSwgaXNPYnNlcnZhYmxlLCBpc1Byb21pc2VMaWtlLCBpc1N0YXRlTGlrZSwgaXNTdHJpbmcsIGtleXMsIG1hcENvbnRleHQsIG1hcEZpbHRlclZhbHVlcywgbWFwVmFsdWVzLCBtYXRjaGVzU3RhdGUsIG5lc3RlZFBhdGgsIG5vcm1hbGl6ZVRhcmdldCwgcGFydGl0aW9uLCBwYXRoLCBwYXRoVG9TdGF0ZVZhbHVlLCByZXBvcnRVbmhhbmRsZWRFeGNlcHRpb25Pbkludm9jYXRpb24sIHN5bWJvbE9ic2VydmFibGUsIHRvQXJyYXksIHRvQXJyYXlTdHJpY3QsIHRvRXZlbnRPYmplY3QsIHRvR3VhcmQsIHRvSW52b2tlU291cmNlLCB0b09ic2VydmVyLCB0b1NDWE1MRXZlbnQsIHRvU3RhdGVQYXRoLCB0b1N0YXRlUGF0aHMsIHRvU3RhdGVWYWx1ZSwgdG9UcmFuc2l0aW9uQ29uZmlnQXJyYXksIHVuaXF1ZUlkLCB1cGRhdGVDb250ZXh0LCB1cGRhdGVIaXN0b3J5U3RhdGVzLCB1cGRhdGVIaXN0b3J5VmFsdWUsIHdhcm4gfTsiLCJpbXBvcnQgeyBfX3ZhbHVlcyB9IGZyb20gJy4vX3ZpcnR1YWwvX3RzbGliLmpzJztcbmltcG9ydCB7IGtleXMsIG1hdGNoZXNTdGF0ZSB9IGZyb20gJy4vdXRpbHMuanMnO1xuXG5mdW5jdGlvbiBtYXBTdGF0ZShzdGF0ZU1hcCwgc3RhdGVJZCkge1xuICB2YXIgZV8xLCBfYTtcblxuICB2YXIgZm91bmRTdGF0ZUlkO1xuXG4gIHRyeSB7XG4gICAgZm9yICh2YXIgX2IgPSBfX3ZhbHVlcyhrZXlzKHN0YXRlTWFwKSksIF9jID0gX2IubmV4dCgpOyAhX2MuZG9uZTsgX2MgPSBfYi5uZXh0KCkpIHtcbiAgICAgIHZhciBtYXBwZWRTdGF0ZUlkID0gX2MudmFsdWU7XG5cbiAgICAgIGlmIChtYXRjaGVzU3RhdGUobWFwcGVkU3RhdGVJZCwgc3RhdGVJZCkgJiYgKCFmb3VuZFN0YXRlSWQgfHwgc3RhdGVJZC5sZW5ndGggPiBmb3VuZFN0YXRlSWQubGVuZ3RoKSkge1xuICAgICAgICBmb3VuZFN0YXRlSWQgPSBtYXBwZWRTdGF0ZUlkO1xuICAgICAgfVxuICAgIH1cbiAgfSBjYXRjaCAoZV8xXzEpIHtcbiAgICBlXzEgPSB7XG4gICAgICBlcnJvcjogZV8xXzFcbiAgICB9O1xuICB9IGZpbmFsbHkge1xuICAgIHRyeSB7XG4gICAgICBpZiAoX2MgJiYgIV9jLmRvbmUgJiYgKF9hID0gX2IucmV0dXJuKSkgX2EuY2FsbChfYik7XG4gICAgfSBmaW5hbGx5IHtcbiAgICAgIGlmIChlXzEpIHRocm93IGVfMS5lcnJvcjtcbiAgICB9XG4gIH1cblxuICByZXR1cm4gc3RhdGVNYXBbZm91bmRTdGF0ZUlkXTtcbn1cblxuZXhwb3J0IHsgbWFwU3RhdGUgfTsiLCJ2YXIgQWN0aW9uVHlwZXM7XG5cbihmdW5jdGlvbiAoQWN0aW9uVHlwZXMpIHtcbiAgQWN0aW9uVHlwZXNbXCJTdGFydFwiXSA9IFwieHN0YXRlLnN0YXJ0XCI7XG4gIEFjdGlvblR5cGVzW1wiU3RvcFwiXSA9IFwieHN0YXRlLnN0b3BcIjtcbiAgQWN0aW9uVHlwZXNbXCJSYWlzZVwiXSA9IFwieHN0YXRlLnJhaXNlXCI7XG4gIEFjdGlvblR5cGVzW1wiU2VuZFwiXSA9IFwieHN0YXRlLnNlbmRcIjtcbiAgQWN0aW9uVHlwZXNbXCJDYW5jZWxcIl0gPSBcInhzdGF0ZS5jYW5jZWxcIjtcbiAgQWN0aW9uVHlwZXNbXCJOdWxsRXZlbnRcIl0gPSBcIlwiO1xuICBBY3Rpb25UeXBlc1tcIkFzc2lnblwiXSA9IFwieHN0YXRlLmFzc2lnblwiO1xuICBBY3Rpb25UeXBlc1tcIkFmdGVyXCJdID0gXCJ4c3RhdGUuYWZ0ZXJcIjtcbiAgQWN0aW9uVHlwZXNbXCJEb25lU3RhdGVcIl0gPSBcImRvbmUuc3RhdGVcIjtcbiAgQWN0aW9uVHlwZXNbXCJEb25lSW52b2tlXCJdID0gXCJkb25lLmludm9rZVwiO1xuICBBY3Rpb25UeXBlc1tcIkxvZ1wiXSA9IFwieHN0YXRlLmxvZ1wiO1xuICBBY3Rpb25UeXBlc1tcIkluaXRcIl0gPSBcInhzdGF0ZS5pbml0XCI7XG4gIEFjdGlvblR5cGVzW1wiSW52b2tlXCJdID0gXCJ4c3RhdGUuaW52b2tlXCI7XG4gIEFjdGlvblR5cGVzW1wiRXJyb3JFeGVjdXRpb25cIl0gPSBcImVycm9yLmV4ZWN1dGlvblwiO1xuICBBY3Rpb25UeXBlc1tcIkVycm9yQ29tbXVuaWNhdGlvblwiXSA9IFwiZXJyb3IuY29tbXVuaWNhdGlvblwiO1xuICBBY3Rpb25UeXBlc1tcIkVycm9yUGxhdGZvcm1cIl0gPSBcImVycm9yLnBsYXRmb3JtXCI7XG4gIEFjdGlvblR5cGVzW1wiRXJyb3JDdXN0b21cIl0gPSBcInhzdGF0ZS5lcnJvclwiO1xuICBBY3Rpb25UeXBlc1tcIlVwZGF0ZVwiXSA9IFwieHN0YXRlLnVwZGF0ZVwiO1xuICBBY3Rpb25UeXBlc1tcIlB1cmVcIl0gPSBcInhzdGF0ZS5wdXJlXCI7XG4gIEFjdGlvblR5cGVzW1wiQ2hvb3NlXCJdID0gXCJ4c3RhdGUuY2hvb3NlXCI7XG59KShBY3Rpb25UeXBlcyB8fCAoQWN0aW9uVHlwZXMgPSB7fSkpO1xuXG52YXIgU3BlY2lhbFRhcmdldHM7XG5cbihmdW5jdGlvbiAoU3BlY2lhbFRhcmdldHMpIHtcbiAgU3BlY2lhbFRhcmdldHNbXCJQYXJlbnRcIl0gPSBcIiNfcGFyZW50XCI7XG4gIFNwZWNpYWxUYXJnZXRzW1wiSW50ZXJuYWxcIl0gPSBcIiNfaW50ZXJuYWxcIjtcbn0pKFNwZWNpYWxUYXJnZXRzIHx8IChTcGVjaWFsVGFyZ2V0cyA9IHt9KSk7XG5cbmV4cG9ydCB7IEFjdGlvblR5cGVzLCBTcGVjaWFsVGFyZ2V0cyB9OyIsImltcG9ydCB7IEFjdGlvblR5cGVzIH0gZnJvbSAnLi90eXBlcy5qcyc7IC8vIHhzdGF0ZS1zcGVjaWZpYyBhY3Rpb24gdHlwZXNcblxudmFyIHN0YXJ0ID0gQWN0aW9uVHlwZXMuU3RhcnQ7XG52YXIgc3RvcCA9IEFjdGlvblR5cGVzLlN0b3A7XG52YXIgcmFpc2UgPSBBY3Rpb25UeXBlcy5SYWlzZTtcbnZhciBzZW5kID0gQWN0aW9uVHlwZXMuU2VuZDtcbnZhciBjYW5jZWwgPSBBY3Rpb25UeXBlcy5DYW5jZWw7XG52YXIgbnVsbEV2ZW50ID0gQWN0aW9uVHlwZXMuTnVsbEV2ZW50O1xudmFyIGFzc2lnbiA9IEFjdGlvblR5cGVzLkFzc2lnbjtcbnZhciBhZnRlciA9IEFjdGlvblR5cGVzLkFmdGVyO1xudmFyIGRvbmVTdGF0ZSA9IEFjdGlvblR5cGVzLkRvbmVTdGF0ZTtcbnZhciBsb2cgPSBBY3Rpb25UeXBlcy5Mb2c7XG52YXIgaW5pdCA9IEFjdGlvblR5cGVzLkluaXQ7XG52YXIgaW52b2tlID0gQWN0aW9uVHlwZXMuSW52b2tlO1xudmFyIGVycm9yRXhlY3V0aW9uID0gQWN0aW9uVHlwZXMuRXJyb3JFeGVjdXRpb247XG52YXIgZXJyb3JQbGF0Zm9ybSA9IEFjdGlvblR5cGVzLkVycm9yUGxhdGZvcm07XG52YXIgZXJyb3IgPSBBY3Rpb25UeXBlcy5FcnJvckN1c3RvbTtcbnZhciB1cGRhdGUgPSBBY3Rpb25UeXBlcy5VcGRhdGU7XG52YXIgY2hvb3NlID0gQWN0aW9uVHlwZXMuQ2hvb3NlO1xudmFyIHB1cmUgPSBBY3Rpb25UeXBlcy5QdXJlO1xuZXhwb3J0IHsgYWZ0ZXIsIGFzc2lnbiwgY2FuY2VsLCBjaG9vc2UsIGRvbmVTdGF0ZSwgZXJyb3IsIGVycm9yRXhlY3V0aW9uLCBlcnJvclBsYXRmb3JtLCBpbml0LCBpbnZva2UsIGxvZywgbnVsbEV2ZW50LCBwdXJlLCByYWlzZSwgc2VuZCwgc3RhcnQsIHN0b3AsIHVwZGF0ZSB9OyIsImltcG9ydCB7IF9fYXNzaWduLCBfX3JlYWQgfSBmcm9tICcuL192aXJ0dWFsL190c2xpYi5qcyc7XG5pbXBvcnQgeyBJU19QUk9EVUNUSU9OIH0gZnJvbSAnLi9lbnZpcm9ubWVudC5qcyc7XG5pbXBvcnQgeyB0b1NDWE1MRXZlbnQsIGlzRnVuY3Rpb24sIHRvRXZlbnRPYmplY3QsIGdldEV2ZW50VHlwZSwgaXNTdHJpbmcsIHBhcnRpdGlvbiwgdXBkYXRlQ29udGV4dCwgZmxhdHRlbiwgdG9BcnJheSwgdG9HdWFyZCwgZXZhbHVhdGVHdWFyZCwgd2FybiwgaXNBcnJheSB9IGZyb20gJy4vdXRpbHMuanMnO1xuaW1wb3J0IHsgU3BlY2lhbFRhcmdldHMsIEFjdGlvblR5cGVzIH0gZnJvbSAnLi90eXBlcy5qcyc7XG5pbXBvcnQgeyBzZW5kIGFzIHNlbmQkMSwgdXBkYXRlLCBhc3NpZ24gYXMgYXNzaWduJDEsIGluaXQsIHJhaXNlIGFzIHJhaXNlJDEsIGxvZyBhcyBsb2ckMSwgY2FuY2VsIGFzIGNhbmNlbCQxLCBlcnJvciBhcyBlcnJvciQxLCBzdG9wIGFzIHN0b3AkMSwgcHVyZSBhcyBwdXJlJDEsIGNob29zZSBhcyBjaG9vc2UkMSB9IGZyb20gJy4vYWN0aW9uVHlwZXMuanMnO1xudmFyIGluaXRFdmVudCA9IC8qI19fUFVSRV9fKi90b1NDWE1MRXZlbnQoe1xuICB0eXBlOiBpbml0XG59KTtcblxuZnVuY3Rpb24gZ2V0QWN0aW9uRnVuY3Rpb24oYWN0aW9uVHlwZSwgYWN0aW9uRnVuY3Rpb25NYXApIHtcbiAgcmV0dXJuIGFjdGlvbkZ1bmN0aW9uTWFwID8gYWN0aW9uRnVuY3Rpb25NYXBbYWN0aW9uVHlwZV0gfHwgdW5kZWZpbmVkIDogdW5kZWZpbmVkO1xufVxuXG5mdW5jdGlvbiB0b0FjdGlvbk9iamVjdChhY3Rpb24sIGFjdGlvbkZ1bmN0aW9uTWFwKSB7XG4gIHZhciBhY3Rpb25PYmplY3Q7XG5cbiAgaWYgKGlzU3RyaW5nKGFjdGlvbikgfHwgdHlwZW9mIGFjdGlvbiA9PT0gJ251bWJlcicpIHtcbiAgICB2YXIgZXhlYyA9IGdldEFjdGlvbkZ1bmN0aW9uKGFjdGlvbiwgYWN0aW9uRnVuY3Rpb25NYXApO1xuXG4gICAgaWYgKGlzRnVuY3Rpb24oZXhlYykpIHtcbiAgICAgIGFjdGlvbk9iamVjdCA9IHtcbiAgICAgICAgdHlwZTogYWN0aW9uLFxuICAgICAgICBleGVjOiBleGVjXG4gICAgICB9O1xuICAgIH0gZWxzZSBpZiAoZXhlYykge1xuICAgICAgYWN0aW9uT2JqZWN0ID0gZXhlYztcbiAgICB9IGVsc2Uge1xuICAgICAgYWN0aW9uT2JqZWN0ID0ge1xuICAgICAgICB0eXBlOiBhY3Rpb24sXG4gICAgICAgIGV4ZWM6IHVuZGVmaW5lZFxuICAgICAgfTtcbiAgICB9XG4gIH0gZWxzZSBpZiAoaXNGdW5jdGlvbihhY3Rpb24pKSB7XG4gICAgYWN0aW9uT2JqZWN0ID0ge1xuICAgICAgLy8gQ29udmVydCBhY3Rpb24gdG8gc3RyaW5nIGlmIHVubmFtZWRcbiAgICAgIHR5cGU6IGFjdGlvbi5uYW1lIHx8IGFjdGlvbi50b1N0cmluZygpLFxuICAgICAgZXhlYzogYWN0aW9uXG4gICAgfTtcbiAgfSBlbHNlIHtcbiAgICB2YXIgZXhlYyA9IGdldEFjdGlvbkZ1bmN0aW9uKGFjdGlvbi50eXBlLCBhY3Rpb25GdW5jdGlvbk1hcCk7XG5cbiAgICBpZiAoaXNGdW5jdGlvbihleGVjKSkge1xuICAgICAgYWN0aW9uT2JqZWN0ID0gX19hc3NpZ24oX19hc3NpZ24oe30sIGFjdGlvbiksIHtcbiAgICAgICAgZXhlYzogZXhlY1xuICAgICAgfSk7XG4gICAgfSBlbHNlIGlmIChleGVjKSB7XG4gICAgICB2YXIgYWN0aW9uVHlwZSA9IGV4ZWMudHlwZSB8fCBhY3Rpb24udHlwZTtcbiAgICAgIGFjdGlvbk9iamVjdCA9IF9fYXNzaWduKF9fYXNzaWduKF9fYXNzaWduKHt9LCBleGVjKSwgYWN0aW9uKSwge1xuICAgICAgICB0eXBlOiBhY3Rpb25UeXBlXG4gICAgICB9KTtcbiAgICB9IGVsc2Uge1xuICAgICAgYWN0aW9uT2JqZWN0ID0gYWN0aW9uO1xuICAgIH1cbiAgfVxuXG4gIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShhY3Rpb25PYmplY3QsICd0b1N0cmluZycsIHtcbiAgICB2YWx1ZTogZnVuY3Rpb24gKCkge1xuICAgICAgcmV0dXJuIGFjdGlvbk9iamVjdC50eXBlO1xuICAgIH0sXG4gICAgZW51bWVyYWJsZTogZmFsc2UsXG4gICAgY29uZmlndXJhYmxlOiB0cnVlXG4gIH0pO1xuICByZXR1cm4gYWN0aW9uT2JqZWN0O1xufVxuXG52YXIgdG9BY3Rpb25PYmplY3RzID0gZnVuY3Rpb24gKGFjdGlvbiwgYWN0aW9uRnVuY3Rpb25NYXApIHtcbiAgaWYgKCFhY3Rpb24pIHtcbiAgICByZXR1cm4gW107XG4gIH1cblxuICB2YXIgYWN0aW9ucyA9IGlzQXJyYXkoYWN0aW9uKSA/IGFjdGlvbiA6IFthY3Rpb25dO1xuICByZXR1cm4gYWN0aW9ucy5tYXAoZnVuY3Rpb24gKHN1YkFjdGlvbikge1xuICAgIHJldHVybiB0b0FjdGlvbk9iamVjdChzdWJBY3Rpb24sIGFjdGlvbkZ1bmN0aW9uTWFwKTtcbiAgfSk7XG59O1xuXG5mdW5jdGlvbiB0b0FjdGl2aXR5RGVmaW5pdGlvbihhY3Rpb24pIHtcbiAgdmFyIGFjdGlvbk9iamVjdCA9IHRvQWN0aW9uT2JqZWN0KGFjdGlvbik7XG4gIHJldHVybiBfX2Fzc2lnbihfX2Fzc2lnbih7XG4gICAgaWQ6IGlzU3RyaW5nKGFjdGlvbikgPyBhY3Rpb24gOiBhY3Rpb25PYmplY3QuaWRcbiAgfSwgYWN0aW9uT2JqZWN0KSwge1xuICAgIHR5cGU6IGFjdGlvbk9iamVjdC50eXBlXG4gIH0pO1xufVxuLyoqXHJcbiAqIFJhaXNlcyBhbiBldmVudC4gVGhpcyBwbGFjZXMgdGhlIGV2ZW50IGluIHRoZSBpbnRlcm5hbCBldmVudCBxdWV1ZSwgc28gdGhhdFxyXG4gKiB0aGUgZXZlbnQgaXMgaW1tZWRpYXRlbHkgY29uc3VtZWQgYnkgdGhlIG1hY2hpbmUgaW4gdGhlIGN1cnJlbnQgc3RlcC5cclxuICpcclxuICogQHBhcmFtIGV2ZW50VHlwZSBUaGUgZXZlbnQgdG8gcmFpc2UuXHJcbiAqL1xuXG5cbmZ1bmN0aW9uIHJhaXNlKGV2ZW50KSB7XG4gIGlmICghaXNTdHJpbmcoZXZlbnQpKSB7XG4gICAgcmV0dXJuIHNlbmQoZXZlbnQsIHtcbiAgICAgIHRvOiBTcGVjaWFsVGFyZ2V0cy5JbnRlcm5hbFxuICAgIH0pO1xuICB9XG5cbiAgcmV0dXJuIHtcbiAgICB0eXBlOiByYWlzZSQxLFxuICAgIGV2ZW50OiBldmVudFxuICB9O1xufVxuXG5mdW5jdGlvbiByZXNvbHZlUmFpc2UoYWN0aW9uKSB7XG4gIHJldHVybiB7XG4gICAgdHlwZTogcmFpc2UkMSxcbiAgICBfZXZlbnQ6IHRvU0NYTUxFdmVudChhY3Rpb24uZXZlbnQpXG4gIH07XG59XG4vKipcclxuICogU2VuZHMgYW4gZXZlbnQuIFRoaXMgcmV0dXJucyBhbiBhY3Rpb24gdGhhdCB3aWxsIGJlIHJlYWQgYnkgYW4gaW50ZXJwcmV0ZXIgdG9cclxuICogc2VuZCB0aGUgZXZlbnQgaW4gdGhlIG5leHQgc3RlcCwgYWZ0ZXIgdGhlIGN1cnJlbnQgc3RlcCBpcyBmaW5pc2hlZCBleGVjdXRpbmcuXHJcbiAqXHJcbiAqIEBwYXJhbSBldmVudCBUaGUgZXZlbnQgdG8gc2VuZC5cclxuICogQHBhcmFtIG9wdGlvbnMgT3B0aW9ucyB0byBwYXNzIGludG8gdGhlIHNlbmQgZXZlbnQ6XHJcbiAqICAtIGBpZGAgLSBUaGUgdW5pcXVlIHNlbmQgZXZlbnQgaWRlbnRpZmllciAodXNlZCB3aXRoIGBjYW5jZWwoKWApLlxyXG4gKiAgLSBgZGVsYXlgIC0gVGhlIG51bWJlciBvZiBtaWxsaXNlY29uZHMgdG8gZGVsYXkgdGhlIHNlbmRpbmcgb2YgdGhlIGV2ZW50LlxyXG4gKiAgLSBgdG9gIC0gVGhlIHRhcmdldCBvZiB0aGlzIGV2ZW50IChieSBkZWZhdWx0LCB0aGUgbWFjaGluZSB0aGUgZXZlbnQgd2FzIHNlbnQgZnJvbSkuXHJcbiAqL1xuXG5cbmZ1bmN0aW9uIHNlbmQoZXZlbnQsIG9wdGlvbnMpIHtcbiAgcmV0dXJuIHtcbiAgICB0bzogb3B0aW9ucyA/IG9wdGlvbnMudG8gOiB1bmRlZmluZWQsXG4gICAgdHlwZTogc2VuZCQxLFxuICAgIGV2ZW50OiBpc0Z1bmN0aW9uKGV2ZW50KSA/IGV2ZW50IDogdG9FdmVudE9iamVjdChldmVudCksXG4gICAgZGVsYXk6IG9wdGlvbnMgPyBvcHRpb25zLmRlbGF5IDogdW5kZWZpbmVkLFxuICAgIGlkOiBvcHRpb25zICYmIG9wdGlvbnMuaWQgIT09IHVuZGVmaW5lZCA/IG9wdGlvbnMuaWQgOiBpc0Z1bmN0aW9uKGV2ZW50KSA/IGV2ZW50Lm5hbWUgOiBnZXRFdmVudFR5cGUoZXZlbnQpXG4gIH07XG59XG5cbmZ1bmN0aW9uIHJlc29sdmVTZW5kKGFjdGlvbiwgY3R4LCBfZXZlbnQsIGRlbGF5c01hcCkge1xuICB2YXIgbWV0YSA9IHtcbiAgICBfZXZlbnQ6IF9ldmVudFxuICB9OyAvLyBUT0RPOiBoZWxwZXIgZnVuY3Rpb24gZm9yIHJlc29sdmluZyBFeHByXG5cbiAgdmFyIHJlc29sdmVkRXZlbnQgPSB0b1NDWE1MRXZlbnQoaXNGdW5jdGlvbihhY3Rpb24uZXZlbnQpID8gYWN0aW9uLmV2ZW50KGN0eCwgX2V2ZW50LmRhdGEsIG1ldGEpIDogYWN0aW9uLmV2ZW50KTtcbiAgdmFyIHJlc29sdmVkRGVsYXk7XG5cbiAgaWYgKGlzU3RyaW5nKGFjdGlvbi5kZWxheSkpIHtcbiAgICB2YXIgY29uZmlnRGVsYXkgPSBkZWxheXNNYXAgJiYgZGVsYXlzTWFwW2FjdGlvbi5kZWxheV07XG4gICAgcmVzb2x2ZWREZWxheSA9IGlzRnVuY3Rpb24oY29uZmlnRGVsYXkpID8gY29uZmlnRGVsYXkoY3R4LCBfZXZlbnQuZGF0YSwgbWV0YSkgOiBjb25maWdEZWxheTtcbiAgfSBlbHNlIHtcbiAgICByZXNvbHZlZERlbGF5ID0gaXNGdW5jdGlvbihhY3Rpb24uZGVsYXkpID8gYWN0aW9uLmRlbGF5KGN0eCwgX2V2ZW50LmRhdGEsIG1ldGEpIDogYWN0aW9uLmRlbGF5O1xuICB9XG5cbiAgdmFyIHJlc29sdmVkVGFyZ2V0ID0gaXNGdW5jdGlvbihhY3Rpb24udG8pID8gYWN0aW9uLnRvKGN0eCwgX2V2ZW50LmRhdGEsIG1ldGEpIDogYWN0aW9uLnRvO1xuICByZXR1cm4gX19hc3NpZ24oX19hc3NpZ24oe30sIGFjdGlvbiksIHtcbiAgICB0bzogcmVzb2x2ZWRUYXJnZXQsXG4gICAgX2V2ZW50OiByZXNvbHZlZEV2ZW50LFxuICAgIGV2ZW50OiByZXNvbHZlZEV2ZW50LmRhdGEsXG4gICAgZGVsYXk6IHJlc29sdmVkRGVsYXlcbiAgfSk7XG59XG4vKipcclxuICogU2VuZHMgYW4gZXZlbnQgdG8gdGhpcyBtYWNoaW5lJ3MgcGFyZW50LlxyXG4gKlxyXG4gKiBAcGFyYW0gZXZlbnQgVGhlIGV2ZW50IHRvIHNlbmQgdG8gdGhlIHBhcmVudCBtYWNoaW5lLlxyXG4gKiBAcGFyYW0gb3B0aW9ucyBPcHRpb25zIHRvIHBhc3MgaW50byB0aGUgc2VuZCBldmVudC5cclxuICovXG5cblxuZnVuY3Rpb24gc2VuZFBhcmVudChldmVudCwgb3B0aW9ucykge1xuICByZXR1cm4gc2VuZChldmVudCwgX19hc3NpZ24oX19hc3NpZ24oe30sIG9wdGlvbnMpLCB7XG4gICAgdG86IFNwZWNpYWxUYXJnZXRzLlBhcmVudFxuICB9KSk7XG59XG4vKipcclxuICogU2VuZHMgYW4gdXBkYXRlIGV2ZW50IHRvIHRoaXMgbWFjaGluZSdzIHBhcmVudC5cclxuICovXG5cblxuZnVuY3Rpb24gc2VuZFVwZGF0ZSgpIHtcbiAgcmV0dXJuIHNlbmRQYXJlbnQodXBkYXRlKTtcbn1cbi8qKlxyXG4gKiBTZW5kcyBhbiBldmVudCBiYWNrIHRvIHRoZSBzZW5kZXIgb2YgdGhlIG9yaWdpbmFsIGV2ZW50LlxyXG4gKlxyXG4gKiBAcGFyYW0gZXZlbnQgVGhlIGV2ZW50IHRvIHNlbmQgYmFjayB0byB0aGUgc2VuZGVyXHJcbiAqIEBwYXJhbSBvcHRpb25zIE9wdGlvbnMgdG8gcGFzcyBpbnRvIHRoZSBzZW5kIGV2ZW50XHJcbiAqL1xuXG5cbmZ1bmN0aW9uIHJlc3BvbmQoZXZlbnQsIG9wdGlvbnMpIHtcbiAgcmV0dXJuIHNlbmQoZXZlbnQsIF9fYXNzaWduKF9fYXNzaWduKHt9LCBvcHRpb25zKSwge1xuICAgIHRvOiBmdW5jdGlvbiAoXywgX18sIF9hKSB7XG4gICAgICB2YXIgX2V2ZW50ID0gX2EuX2V2ZW50O1xuICAgICAgcmV0dXJuIF9ldmVudC5vcmlnaW47IC8vIFRPRE86IGhhbmRsZSB3aGVuIF9ldmVudC5vcmlnaW4gaXMgdW5kZWZpbmVkXG4gICAgfVxuICB9KSk7XG59XG5cbnZhciBkZWZhdWx0TG9nRXhwciA9IGZ1bmN0aW9uIChjb250ZXh0LCBldmVudCkge1xuICByZXR1cm4ge1xuICAgIGNvbnRleHQ6IGNvbnRleHQsXG4gICAgZXZlbnQ6IGV2ZW50XG4gIH07XG59O1xuLyoqXHJcbiAqXHJcbiAqIEBwYXJhbSBleHByIFRoZSBleHByZXNzaW9uIGZ1bmN0aW9uIHRvIGV2YWx1YXRlIHdoaWNoIHdpbGwgYmUgbG9nZ2VkLlxyXG4gKiAgVGFrZXMgaW4gMiBhcmd1bWVudHM6XHJcbiAqICAtIGBjdHhgIC0gdGhlIGN1cnJlbnQgc3RhdGUgY29udGV4dFxyXG4gKiAgLSBgZXZlbnRgIC0gdGhlIGV2ZW50IHRoYXQgY2F1c2VkIHRoaXMgYWN0aW9uIHRvIGJlIGV4ZWN1dGVkLlxyXG4gKiBAcGFyYW0gbGFiZWwgVGhlIGxhYmVsIHRvIGdpdmUgdG8gdGhlIGxvZ2dlZCBleHByZXNzaW9uLlxyXG4gKi9cblxuXG5mdW5jdGlvbiBsb2coZXhwciwgbGFiZWwpIHtcbiAgaWYgKGV4cHIgPT09IHZvaWQgMCkge1xuICAgIGV4cHIgPSBkZWZhdWx0TG9nRXhwcjtcbiAgfVxuXG4gIHJldHVybiB7XG4gICAgdHlwZTogbG9nJDEsXG4gICAgbGFiZWw6IGxhYmVsLFxuICAgIGV4cHI6IGV4cHJcbiAgfTtcbn1cblxudmFyIHJlc29sdmVMb2cgPSBmdW5jdGlvbiAoYWN0aW9uLCBjdHgsIF9ldmVudCkge1xuICByZXR1cm4gX19hc3NpZ24oX19hc3NpZ24oe30sIGFjdGlvbiksIHtcbiAgICB2YWx1ZTogaXNTdHJpbmcoYWN0aW9uLmV4cHIpID8gYWN0aW9uLmV4cHIgOiBhY3Rpb24uZXhwcihjdHgsIF9ldmVudC5kYXRhLCB7XG4gICAgICBfZXZlbnQ6IF9ldmVudFxuICAgIH0pXG4gIH0pO1xufTtcbi8qKlxyXG4gKiBDYW5jZWxzIGFuIGluLWZsaWdodCBgc2VuZCguLi4pYCBhY3Rpb24uIEEgY2FuY2VsZWQgc2VudCBhY3Rpb24gd2lsbCBub3RcclxuICogYmUgZXhlY3V0ZWQsIG5vciB3aWxsIGl0cyBldmVudCBiZSBzZW50LCB1bmxlc3MgaXQgaGFzIGFscmVhZHkgYmVlbiBzZW50XHJcbiAqIChlLmcuLCBpZiBgY2FuY2VsKC4uLilgIGlzIGNhbGxlZCBhZnRlciB0aGUgYHNlbmQoLi4uKWAgYWN0aW9uJ3MgYGRlbGF5YCkuXHJcbiAqXHJcbiAqIEBwYXJhbSBzZW5kSWQgVGhlIGBpZGAgb2YgdGhlIGBzZW5kKC4uLilgIGFjdGlvbiB0byBjYW5jZWwuXHJcbiAqL1xuXG5cbnZhciBjYW5jZWwgPSBmdW5jdGlvbiAoc2VuZElkKSB7XG4gIHJldHVybiB7XG4gICAgdHlwZTogY2FuY2VsJDEsXG4gICAgc2VuZElkOiBzZW5kSWRcbiAgfTtcbn07XG4vKipcclxuICogU3RhcnRzIGFuIGFjdGl2aXR5LlxyXG4gKlxyXG4gKiBAcGFyYW0gYWN0aXZpdHkgVGhlIGFjdGl2aXR5IHRvIHN0YXJ0LlxyXG4gKi9cblxuXG5mdW5jdGlvbiBzdGFydChhY3Rpdml0eSkge1xuICB2YXIgYWN0aXZpdHlEZWYgPSB0b0FjdGl2aXR5RGVmaW5pdGlvbihhY3Rpdml0eSk7XG4gIHJldHVybiB7XG4gICAgdHlwZTogQWN0aW9uVHlwZXMuU3RhcnQsXG4gICAgYWN0aXZpdHk6IGFjdGl2aXR5RGVmLFxuICAgIGV4ZWM6IHVuZGVmaW5lZFxuICB9O1xufVxuLyoqXHJcbiAqIFN0b3BzIGFuIGFjdGl2aXR5LlxyXG4gKlxyXG4gKiBAcGFyYW0gYWN0b3JSZWYgVGhlIGFjdGl2aXR5IHRvIHN0b3AuXHJcbiAqL1xuXG5cbmZ1bmN0aW9uIHN0b3AoYWN0b3JSZWYpIHtcbiAgdmFyIGFjdGl2aXR5ID0gaXNGdW5jdGlvbihhY3RvclJlZikgPyBhY3RvclJlZiA6IHRvQWN0aXZpdHlEZWZpbml0aW9uKGFjdG9yUmVmKTtcbiAgcmV0dXJuIHtcbiAgICB0eXBlOiBBY3Rpb25UeXBlcy5TdG9wLFxuICAgIGFjdGl2aXR5OiBhY3Rpdml0eSxcbiAgICBleGVjOiB1bmRlZmluZWRcbiAgfTtcbn1cblxuZnVuY3Rpb24gcmVzb2x2ZVN0b3AoYWN0aW9uLCBjb250ZXh0LCBfZXZlbnQpIHtcbiAgdmFyIGFjdG9yUmVmT3JTdHJpbmcgPSBpc0Z1bmN0aW9uKGFjdGlvbi5hY3Rpdml0eSkgPyBhY3Rpb24uYWN0aXZpdHkoY29udGV4dCwgX2V2ZW50LmRhdGEpIDogYWN0aW9uLmFjdGl2aXR5O1xuICB2YXIgcmVzb2x2ZWRBY3RvclJlZiA9IHR5cGVvZiBhY3RvclJlZk9yU3RyaW5nID09PSAnc3RyaW5nJyA/IHtcbiAgICBpZDogYWN0b3JSZWZPclN0cmluZ1xuICB9IDogYWN0b3JSZWZPclN0cmluZztcbiAgdmFyIGFjdGlvbk9iamVjdCA9IHtcbiAgICB0eXBlOiBBY3Rpb25UeXBlcy5TdG9wLFxuICAgIGFjdGl2aXR5OiByZXNvbHZlZEFjdG9yUmVmXG4gIH07XG4gIHJldHVybiBhY3Rpb25PYmplY3Q7XG59XG4vKipcclxuICogVXBkYXRlcyB0aGUgY3VycmVudCBjb250ZXh0IG9mIHRoZSBtYWNoaW5lLlxyXG4gKlxyXG4gKiBAcGFyYW0gYXNzaWdubWVudCBBbiBvYmplY3QgdGhhdCByZXByZXNlbnRzIHRoZSBwYXJ0aWFsIGNvbnRleHQgdG8gdXBkYXRlLlxyXG4gKi9cblxuXG52YXIgYXNzaWduID0gZnVuY3Rpb24gKGFzc2lnbm1lbnQpIHtcbiAgcmV0dXJuIHtcbiAgICB0eXBlOiBhc3NpZ24kMSxcbiAgICBhc3NpZ25tZW50OiBhc3NpZ25tZW50XG4gIH07XG59O1xuLyoqXHJcbiAqIFJldHVybnMgYW4gZXZlbnQgdHlwZSB0aGF0IHJlcHJlc2VudHMgYW4gaW1wbGljaXQgZXZlbnQgdGhhdFxyXG4gKiBpcyBzZW50IGFmdGVyIHRoZSBzcGVjaWZpZWQgYGRlbGF5YC5cclxuICpcclxuICogQHBhcmFtIGRlbGF5UmVmIFRoZSBkZWxheSBpbiBtaWxsaXNlY29uZHNcclxuICogQHBhcmFtIGlkIFRoZSBzdGF0ZSBub2RlIElEIHdoZXJlIHRoaXMgZXZlbnQgaXMgaGFuZGxlZFxyXG4gKi9cblxuXG5mdW5jdGlvbiBhZnRlcihkZWxheVJlZiwgaWQpIHtcbiAgdmFyIGlkU3VmZml4ID0gaWQgPyBcIiNcIiArIGlkIDogJyc7XG4gIHJldHVybiBBY3Rpb25UeXBlcy5BZnRlciArIFwiKFwiICsgZGVsYXlSZWYgKyBcIilcIiArIGlkU3VmZml4O1xufVxuLyoqXHJcbiAqIFJldHVybnMgYW4gZXZlbnQgdGhhdCByZXByZXNlbnRzIHRoYXQgYSBmaW5hbCBzdGF0ZSBub2RlXHJcbiAqIGhhcyBiZWVuIHJlYWNoZWQgaW4gdGhlIHBhcmVudCBzdGF0ZSBub2RlLlxyXG4gKlxyXG4gKiBAcGFyYW0gaWQgVGhlIGZpbmFsIHN0YXRlIG5vZGUncyBwYXJlbnQgc3RhdGUgbm9kZSBgaWRgXHJcbiAqIEBwYXJhbSBkYXRhIFRoZSBkYXRhIHRvIHBhc3MgaW50byB0aGUgZXZlbnRcclxuICovXG5cblxuZnVuY3Rpb24gZG9uZShpZCwgZGF0YSkge1xuICB2YXIgdHlwZSA9IEFjdGlvblR5cGVzLkRvbmVTdGF0ZSArIFwiLlwiICsgaWQ7XG4gIHZhciBldmVudE9iamVjdCA9IHtcbiAgICB0eXBlOiB0eXBlLFxuICAgIGRhdGE6IGRhdGFcbiAgfTtcblxuICBldmVudE9iamVjdC50b1N0cmluZyA9IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gdHlwZTtcbiAgfTtcblxuICByZXR1cm4gZXZlbnRPYmplY3Q7XG59XG4vKipcclxuICogUmV0dXJucyBhbiBldmVudCB0aGF0IHJlcHJlc2VudHMgdGhhdCBhbiBpbnZva2VkIHNlcnZpY2UgaGFzIHRlcm1pbmF0ZWQuXHJcbiAqXHJcbiAqIEFuIGludm9rZWQgc2VydmljZSBpcyB0ZXJtaW5hdGVkIHdoZW4gaXQgaGFzIHJlYWNoZWQgYSB0b3AtbGV2ZWwgZmluYWwgc3RhdGUgbm9kZSxcclxuICogYnV0IG5vdCB3aGVuIGl0IGlzIGNhbmNlbGVkLlxyXG4gKlxyXG4gKiBAcGFyYW0gaWQgVGhlIGZpbmFsIHN0YXRlIG5vZGUgSURcclxuICogQHBhcmFtIGRhdGEgVGhlIGRhdGEgdG8gcGFzcyBpbnRvIHRoZSBldmVudFxyXG4gKi9cblxuXG5mdW5jdGlvbiBkb25lSW52b2tlKGlkLCBkYXRhKSB7XG4gIHZhciB0eXBlID0gQWN0aW9uVHlwZXMuRG9uZUludm9rZSArIFwiLlwiICsgaWQ7XG4gIHZhciBldmVudE9iamVjdCA9IHtcbiAgICB0eXBlOiB0eXBlLFxuICAgIGRhdGE6IGRhdGFcbiAgfTtcblxuICBldmVudE9iamVjdC50b1N0cmluZyA9IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gdHlwZTtcbiAgfTtcblxuICByZXR1cm4gZXZlbnRPYmplY3Q7XG59XG5cbmZ1bmN0aW9uIGVycm9yKGlkLCBkYXRhKSB7XG4gIHZhciB0eXBlID0gQWN0aW9uVHlwZXMuRXJyb3JQbGF0Zm9ybSArIFwiLlwiICsgaWQ7XG4gIHZhciBldmVudE9iamVjdCA9IHtcbiAgICB0eXBlOiB0eXBlLFxuICAgIGRhdGE6IGRhdGFcbiAgfTtcblxuICBldmVudE9iamVjdC50b1N0cmluZyA9IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gdHlwZTtcbiAgfTtcblxuICByZXR1cm4gZXZlbnRPYmplY3Q7XG59XG5cbmZ1bmN0aW9uIHB1cmUoZ2V0QWN0aW9ucykge1xuICByZXR1cm4ge1xuICAgIHR5cGU6IEFjdGlvblR5cGVzLlB1cmUsXG4gICAgZ2V0OiBnZXRBY3Rpb25zXG4gIH07XG59XG4vKipcclxuICogRm9yd2FyZHMgKHNlbmRzKSBhbiBldmVudCB0byBhIHNwZWNpZmllZCBzZXJ2aWNlLlxyXG4gKlxyXG4gKiBAcGFyYW0gdGFyZ2V0IFRoZSB0YXJnZXQgc2VydmljZSB0byBmb3J3YXJkIHRoZSBldmVudCB0by5cclxuICogQHBhcmFtIG9wdGlvbnMgT3B0aW9ucyB0byBwYXNzIGludG8gdGhlIHNlbmQgYWN0aW9uIGNyZWF0b3IuXHJcbiAqL1xuXG5cbmZ1bmN0aW9uIGZvcndhcmRUbyh0YXJnZXQsIG9wdGlvbnMpIHtcbiAgcmV0dXJuIHNlbmQoZnVuY3Rpb24gKF8sIGV2ZW50KSB7XG4gICAgcmV0dXJuIGV2ZW50O1xuICB9LCBfX2Fzc2lnbihfX2Fzc2lnbih7fSwgb3B0aW9ucyksIHtcbiAgICB0bzogdGFyZ2V0XG4gIH0pKTtcbn1cbi8qKlxyXG4gKiBFc2NhbGF0ZXMgYW4gZXJyb3IgYnkgc2VuZGluZyBpdCBhcyBhbiBldmVudCB0byB0aGlzIG1hY2hpbmUncyBwYXJlbnQuXHJcbiAqXHJcbiAqIEBwYXJhbSBlcnJvckRhdGEgVGhlIGVycm9yIGRhdGEgdG8gc2VuZCwgb3IgdGhlIGV4cHJlc3Npb24gZnVuY3Rpb24gdGhhdFxyXG4gKiB0YWtlcyBpbiB0aGUgYGNvbnRleHRgLCBgZXZlbnRgLCBhbmQgYG1ldGFgLCBhbmQgcmV0dXJucyB0aGUgZXJyb3IgZGF0YSB0byBzZW5kLlxyXG4gKiBAcGFyYW0gb3B0aW9ucyBPcHRpb25zIHRvIHBhc3MgaW50byB0aGUgc2VuZCBhY3Rpb24gY3JlYXRvci5cclxuICovXG5cblxuZnVuY3Rpb24gZXNjYWxhdGUoZXJyb3JEYXRhLCBvcHRpb25zKSB7XG4gIHJldHVybiBzZW5kUGFyZW50KGZ1bmN0aW9uIChjb250ZXh0LCBldmVudCwgbWV0YSkge1xuICAgIHJldHVybiB7XG4gICAgICB0eXBlOiBlcnJvciQxLFxuICAgICAgZGF0YTogaXNGdW5jdGlvbihlcnJvckRhdGEpID8gZXJyb3JEYXRhKGNvbnRleHQsIGV2ZW50LCBtZXRhKSA6IGVycm9yRGF0YVxuICAgIH07XG4gIH0sIF9fYXNzaWduKF9fYXNzaWduKHt9LCBvcHRpb25zKSwge1xuICAgIHRvOiBTcGVjaWFsVGFyZ2V0cy5QYXJlbnRcbiAgfSkpO1xufVxuXG5mdW5jdGlvbiBjaG9vc2UoY29uZHMpIHtcbiAgcmV0dXJuIHtcbiAgICB0eXBlOiBBY3Rpb25UeXBlcy5DaG9vc2UsXG4gICAgY29uZHM6IGNvbmRzXG4gIH07XG59XG5cbmZ1bmN0aW9uIHJlc29sdmVBY3Rpb25zKG1hY2hpbmUsIGN1cnJlbnRTdGF0ZSwgY3VycmVudENvbnRleHQsIF9ldmVudCwgYWN0aW9ucykge1xuICB2YXIgX2EgPSBfX3JlYWQocGFydGl0aW9uKGFjdGlvbnMsIGZ1bmN0aW9uIChhY3Rpb24pIHtcbiAgICByZXR1cm4gYWN0aW9uLnR5cGUgPT09IGFzc2lnbiQxO1xuICB9KSwgMiksXG4gICAgICBhc3NpZ25BY3Rpb25zID0gX2FbMF0sXG4gICAgICBvdGhlckFjdGlvbnMgPSBfYVsxXTtcblxuICB2YXIgdXBkYXRlZENvbnRleHQgPSBhc3NpZ25BY3Rpb25zLmxlbmd0aCA/IHVwZGF0ZUNvbnRleHQoY3VycmVudENvbnRleHQsIF9ldmVudCwgYXNzaWduQWN0aW9ucywgY3VycmVudFN0YXRlKSA6IGN1cnJlbnRDb250ZXh0O1xuICB2YXIgcmVzb2x2ZWRBY3Rpb25zID0gZmxhdHRlbihvdGhlckFjdGlvbnMubWFwKGZ1bmN0aW9uIChhY3Rpb25PYmplY3QpIHtcbiAgICB2YXIgX2E7XG5cbiAgICBzd2l0Y2ggKGFjdGlvbk9iamVjdC50eXBlKSB7XG4gICAgICBjYXNlIHJhaXNlJDE6XG4gICAgICAgIHJldHVybiByZXNvbHZlUmFpc2UoYWN0aW9uT2JqZWN0KTtcblxuICAgICAgY2FzZSBzZW5kJDE6XG4gICAgICAgIHZhciBzZW5kQWN0aW9uID0gcmVzb2x2ZVNlbmQoYWN0aW9uT2JqZWN0LCB1cGRhdGVkQ29udGV4dCwgX2V2ZW50LCBtYWNoaW5lLm9wdGlvbnMuZGVsYXlzKTsgLy8gVE9ETzogZml4IEFjdGlvblR5cGVzLkluaXRcblxuICAgICAgICBpZiAoIUlTX1BST0RVQ1RJT04pIHtcbiAgICAgICAgICAvLyB3YXJuIGFmdGVyIHJlc29sdmluZyBhcyB3ZSBjYW4gY3JlYXRlIGJldHRlciBjb250ZXh0dWFsIG1lc3NhZ2UgaGVyZVxuICAgICAgICAgIHdhcm4oIWlzU3RyaW5nKGFjdGlvbk9iamVjdC5kZWxheSkgfHwgdHlwZW9mIHNlbmRBY3Rpb24uZGVsYXkgPT09ICdudW1iZXInLCAvLyB0c2xpbnQ6ZGlzYWJsZS1uZXh0LWxpbmU6bWF4LWxpbmUtbGVuZ3RoXG4gICAgICAgICAgXCJObyBkZWxheSByZWZlcmVuY2UgZm9yIGRlbGF5IGV4cHJlc3Npb24gJ1wiICsgYWN0aW9uT2JqZWN0LmRlbGF5ICsgXCInIHdhcyBmb3VuZCBvbiBtYWNoaW5lICdcIiArIG1hY2hpbmUuaWQgKyBcIidcIik7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gc2VuZEFjdGlvbjtcblxuICAgICAgY2FzZSBsb2ckMTpcbiAgICAgICAgcmV0dXJuIHJlc29sdmVMb2coYWN0aW9uT2JqZWN0LCB1cGRhdGVkQ29udGV4dCwgX2V2ZW50KTtcblxuICAgICAgY2FzZSBjaG9vc2UkMTpcbiAgICAgICAge1xuICAgICAgICAgIHZhciBjaG9vc2VBY3Rpb24gPSBhY3Rpb25PYmplY3Q7XG4gICAgICAgICAgdmFyIG1hdGNoZWRBY3Rpb25zID0gKF9hID0gY2hvb3NlQWN0aW9uLmNvbmRzLmZpbmQoZnVuY3Rpb24gKGNvbmRpdGlvbikge1xuICAgICAgICAgICAgdmFyIGd1YXJkID0gdG9HdWFyZChjb25kaXRpb24uY29uZCwgbWFjaGluZS5vcHRpb25zLmd1YXJkcyk7XG4gICAgICAgICAgICByZXR1cm4gIWd1YXJkIHx8IGV2YWx1YXRlR3VhcmQobWFjaGluZSwgZ3VhcmQsIHVwZGF0ZWRDb250ZXh0LCBfZXZlbnQsIGN1cnJlbnRTdGF0ZSk7XG4gICAgICAgICAgfSkpID09PSBudWxsIHx8IF9hID09PSB2b2lkIDAgPyB2b2lkIDAgOiBfYS5hY3Rpb25zO1xuXG4gICAgICAgICAgaWYgKCFtYXRjaGVkQWN0aW9ucykge1xuICAgICAgICAgICAgcmV0dXJuIFtdO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIHZhciByZXNvbHZlZCA9IHJlc29sdmVBY3Rpb25zKG1hY2hpbmUsIGN1cnJlbnRTdGF0ZSwgdXBkYXRlZENvbnRleHQsIF9ldmVudCwgdG9BY3Rpb25PYmplY3RzKHRvQXJyYXkobWF0Y2hlZEFjdGlvbnMpLCBtYWNoaW5lLm9wdGlvbnMuYWN0aW9ucykpO1xuICAgICAgICAgIHVwZGF0ZWRDb250ZXh0ID0gcmVzb2x2ZWRbMV07XG4gICAgICAgICAgcmV0dXJuIHJlc29sdmVkWzBdO1xuICAgICAgICB9XG5cbiAgICAgIGNhc2UgcHVyZSQxOlxuICAgICAgICB7XG4gICAgICAgICAgdmFyIG1hdGNoZWRBY3Rpb25zID0gYWN0aW9uT2JqZWN0LmdldCh1cGRhdGVkQ29udGV4dCwgX2V2ZW50LmRhdGEpO1xuXG4gICAgICAgICAgaWYgKCFtYXRjaGVkQWN0aW9ucykge1xuICAgICAgICAgICAgcmV0dXJuIFtdO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIHZhciByZXNvbHZlZCA9IHJlc29sdmVBY3Rpb25zKG1hY2hpbmUsIGN1cnJlbnRTdGF0ZSwgdXBkYXRlZENvbnRleHQsIF9ldmVudCwgdG9BY3Rpb25PYmplY3RzKHRvQXJyYXkobWF0Y2hlZEFjdGlvbnMpLCBtYWNoaW5lLm9wdGlvbnMuYWN0aW9ucykpO1xuICAgICAgICAgIHVwZGF0ZWRDb250ZXh0ID0gcmVzb2x2ZWRbMV07XG4gICAgICAgICAgcmV0dXJuIHJlc29sdmVkWzBdO1xuICAgICAgICB9XG5cbiAgICAgIGNhc2Ugc3RvcCQxOlxuICAgICAgICB7XG4gICAgICAgICAgcmV0dXJuIHJlc29sdmVTdG9wKGFjdGlvbk9iamVjdCwgdXBkYXRlZENvbnRleHQsIF9ldmVudCk7XG4gICAgICAgIH1cblxuICAgICAgZGVmYXVsdDpcbiAgICAgICAgcmV0dXJuIHRvQWN0aW9uT2JqZWN0KGFjdGlvbk9iamVjdCwgbWFjaGluZS5vcHRpb25zLmFjdGlvbnMpO1xuICAgIH1cbiAgfSkpO1xuICByZXR1cm4gW3Jlc29sdmVkQWN0aW9ucywgdXBkYXRlZENvbnRleHRdO1xufVxuXG5leHBvcnQgeyBhZnRlciwgYXNzaWduLCBjYW5jZWwsIGNob29zZSwgZG9uZSwgZG9uZUludm9rZSwgZXJyb3IsIGVzY2FsYXRlLCBmb3J3YXJkVG8sIGdldEFjdGlvbkZ1bmN0aW9uLCBpbml0RXZlbnQsIGxvZywgcHVyZSwgcmFpc2UsIHJlc29sdmVBY3Rpb25zLCByZXNvbHZlTG9nLCByZXNvbHZlUmFpc2UsIHJlc29sdmVTZW5kLCByZXNvbHZlU3RvcCwgcmVzcG9uZCwgc2VuZCwgc2VuZFBhcmVudCwgc2VuZFVwZGF0ZSwgc3RhcnQsIHN0b3AsIHRvQWN0aW9uT2JqZWN0LCB0b0FjdGlvbk9iamVjdHMsIHRvQWN0aXZpdHlEZWZpbml0aW9uIH07IiwiaW1wb3J0IHsgX192YWx1ZXMsIF9fc3ByZWFkIH0gZnJvbSAnLi9fdmlydHVhbC9fdHNsaWIuanMnO1xuaW1wb3J0IHsga2V5cywgZmxhdHRlbiB9IGZyb20gJy4vdXRpbHMuanMnO1xuXG52YXIgaXNMZWFmTm9kZSA9IGZ1bmN0aW9uIChzdGF0ZU5vZGUpIHtcbiAgcmV0dXJuIHN0YXRlTm9kZS50eXBlID09PSAnYXRvbWljJyB8fCBzdGF0ZU5vZGUudHlwZSA9PT0gJ2ZpbmFsJztcbn07XG5cbmZ1bmN0aW9uIGdldENoaWxkcmVuKHN0YXRlTm9kZSkge1xuICByZXR1cm4ga2V5cyhzdGF0ZU5vZGUuc3RhdGVzKS5tYXAoZnVuY3Rpb24gKGtleSkge1xuICAgIHJldHVybiBzdGF0ZU5vZGUuc3RhdGVzW2tleV07XG4gIH0pO1xufVxuXG5mdW5jdGlvbiBnZXRBbGxTdGF0ZU5vZGVzKHN0YXRlTm9kZSkge1xuICB2YXIgc3RhdGVOb2RlcyA9IFtzdGF0ZU5vZGVdO1xuXG4gIGlmIChpc0xlYWZOb2RlKHN0YXRlTm9kZSkpIHtcbiAgICByZXR1cm4gc3RhdGVOb2RlcztcbiAgfVxuXG4gIHJldHVybiBzdGF0ZU5vZGVzLmNvbmNhdChmbGF0dGVuKGdldENoaWxkcmVuKHN0YXRlTm9kZSkubWFwKGdldEFsbFN0YXRlTm9kZXMpKSk7XG59XG5cbmZ1bmN0aW9uIGdldENvbmZpZ3VyYXRpb24ocHJldlN0YXRlTm9kZXMsIHN0YXRlTm9kZXMpIHtcbiAgdmFyIGVfMSwgX2EsIGVfMiwgX2IsIGVfMywgX2MsIGVfNCwgX2Q7XG5cbiAgdmFyIHByZXZDb25maWd1cmF0aW9uID0gbmV3IFNldChwcmV2U3RhdGVOb2Rlcyk7XG4gIHZhciBwcmV2QWRqTGlzdCA9IGdldEFkakxpc3QocHJldkNvbmZpZ3VyYXRpb24pO1xuICB2YXIgY29uZmlndXJhdGlvbiA9IG5ldyBTZXQoc3RhdGVOb2Rlcyk7XG5cbiAgdHJ5IHtcbiAgICAvLyBhZGQgYWxsIGFuY2VzdG9yc1xuICAgIGZvciAodmFyIGNvbmZpZ3VyYXRpb25fMSA9IF9fdmFsdWVzKGNvbmZpZ3VyYXRpb24pLCBjb25maWd1cmF0aW9uXzFfMSA9IGNvbmZpZ3VyYXRpb25fMS5uZXh0KCk7ICFjb25maWd1cmF0aW9uXzFfMS5kb25lOyBjb25maWd1cmF0aW9uXzFfMSA9IGNvbmZpZ3VyYXRpb25fMS5uZXh0KCkpIHtcbiAgICAgIHZhciBzID0gY29uZmlndXJhdGlvbl8xXzEudmFsdWU7XG4gICAgICB2YXIgbSA9IHMucGFyZW50O1xuXG4gICAgICB3aGlsZSAobSAmJiAhY29uZmlndXJhdGlvbi5oYXMobSkpIHtcbiAgICAgICAgY29uZmlndXJhdGlvbi5hZGQobSk7XG4gICAgICAgIG0gPSBtLnBhcmVudDtcbiAgICAgIH1cbiAgICB9XG4gIH0gY2F0Y2ggKGVfMV8xKSB7XG4gICAgZV8xID0ge1xuICAgICAgZXJyb3I6IGVfMV8xXG4gICAgfTtcbiAgfSBmaW5hbGx5IHtcbiAgICB0cnkge1xuICAgICAgaWYgKGNvbmZpZ3VyYXRpb25fMV8xICYmICFjb25maWd1cmF0aW9uXzFfMS5kb25lICYmIChfYSA9IGNvbmZpZ3VyYXRpb25fMS5yZXR1cm4pKSBfYS5jYWxsKGNvbmZpZ3VyYXRpb25fMSk7XG4gICAgfSBmaW5hbGx5IHtcbiAgICAgIGlmIChlXzEpIHRocm93IGVfMS5lcnJvcjtcbiAgICB9XG4gIH1cblxuICB2YXIgYWRqTGlzdCA9IGdldEFkakxpc3QoY29uZmlndXJhdGlvbik7XG5cbiAgdHJ5IHtcbiAgICAvLyBhZGQgZGVzY2VuZGFudHNcbiAgICBmb3IgKHZhciBjb25maWd1cmF0aW9uXzIgPSBfX3ZhbHVlcyhjb25maWd1cmF0aW9uKSwgY29uZmlndXJhdGlvbl8yXzEgPSBjb25maWd1cmF0aW9uXzIubmV4dCgpOyAhY29uZmlndXJhdGlvbl8yXzEuZG9uZTsgY29uZmlndXJhdGlvbl8yXzEgPSBjb25maWd1cmF0aW9uXzIubmV4dCgpKSB7XG4gICAgICB2YXIgcyA9IGNvbmZpZ3VyYXRpb25fMl8xLnZhbHVlOyAvLyBpZiBwcmV2aW91c2x5IGFjdGl2ZSwgYWRkIGV4aXN0aW5nIGNoaWxkIG5vZGVzXG5cbiAgICAgIGlmIChzLnR5cGUgPT09ICdjb21wb3VuZCcgJiYgKCFhZGpMaXN0LmdldChzKSB8fCAhYWRqTGlzdC5nZXQocykubGVuZ3RoKSkge1xuICAgICAgICBpZiAocHJldkFkakxpc3QuZ2V0KHMpKSB7XG4gICAgICAgICAgcHJldkFkakxpc3QuZ2V0KHMpLmZvckVhY2goZnVuY3Rpb24gKHNuKSB7XG4gICAgICAgICAgICByZXR1cm4gY29uZmlndXJhdGlvbi5hZGQoc24pO1xuICAgICAgICAgIH0pO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHMuaW5pdGlhbFN0YXRlTm9kZXMuZm9yRWFjaChmdW5jdGlvbiAoc24pIHtcbiAgICAgICAgICAgIHJldHVybiBjb25maWd1cmF0aW9uLmFkZChzbik7XG4gICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGlmIChzLnR5cGUgPT09ICdwYXJhbGxlbCcpIHtcbiAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgZm9yICh2YXIgX2UgPSAoZV8zID0gdm9pZCAwLCBfX3ZhbHVlcyhnZXRDaGlsZHJlbihzKSkpLCBfZiA9IF9lLm5leHQoKTsgIV9mLmRvbmU7IF9mID0gX2UubmV4dCgpKSB7XG4gICAgICAgICAgICAgIHZhciBjaGlsZCA9IF9mLnZhbHVlO1xuXG4gICAgICAgICAgICAgIGlmIChjaGlsZC50eXBlID09PSAnaGlzdG9yeScpIHtcbiAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgIGlmICghY29uZmlndXJhdGlvbi5oYXMoY2hpbGQpKSB7XG4gICAgICAgICAgICAgICAgY29uZmlndXJhdGlvbi5hZGQoY2hpbGQpO1xuXG4gICAgICAgICAgICAgICAgaWYgKHByZXZBZGpMaXN0LmdldChjaGlsZCkpIHtcbiAgICAgICAgICAgICAgICAgIHByZXZBZGpMaXN0LmdldChjaGlsZCkuZm9yRWFjaChmdW5jdGlvbiAoc24pIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGNvbmZpZ3VyYXRpb24uYWRkKHNuKTtcbiAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICBjaGlsZC5pbml0aWFsU3RhdGVOb2Rlcy5mb3JFYWNoKGZ1bmN0aW9uIChzbikge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gY29uZmlndXJhdGlvbi5hZGQoc24pO1xuICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSBjYXRjaCAoZV8zXzEpIHtcbiAgICAgICAgICAgIGVfMyA9IHtcbiAgICAgICAgICAgICAgZXJyb3I6IGVfM18xXG4gICAgICAgICAgICB9O1xuICAgICAgICAgIH0gZmluYWxseSB7XG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICBpZiAoX2YgJiYgIV9mLmRvbmUgJiYgKF9jID0gX2UucmV0dXJuKSkgX2MuY2FsbChfZSk7XG4gICAgICAgICAgICB9IGZpbmFsbHkge1xuICAgICAgICAgICAgICBpZiAoZV8zKSB0aHJvdyBlXzMuZXJyb3I7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICB9IGNhdGNoIChlXzJfMSkge1xuICAgIGVfMiA9IHtcbiAgICAgIGVycm9yOiBlXzJfMVxuICAgIH07XG4gIH0gZmluYWxseSB7XG4gICAgdHJ5IHtcbiAgICAgIGlmIChjb25maWd1cmF0aW9uXzJfMSAmJiAhY29uZmlndXJhdGlvbl8yXzEuZG9uZSAmJiAoX2IgPSBjb25maWd1cmF0aW9uXzIucmV0dXJuKSkgX2IuY2FsbChjb25maWd1cmF0aW9uXzIpO1xuICAgIH0gZmluYWxseSB7XG4gICAgICBpZiAoZV8yKSB0aHJvdyBlXzIuZXJyb3I7XG4gICAgfVxuICB9XG5cbiAgdHJ5IHtcbiAgICAvLyBhZGQgYWxsIGFuY2VzdG9yc1xuICAgIGZvciAodmFyIGNvbmZpZ3VyYXRpb25fMyA9IF9fdmFsdWVzKGNvbmZpZ3VyYXRpb24pLCBjb25maWd1cmF0aW9uXzNfMSA9IGNvbmZpZ3VyYXRpb25fMy5uZXh0KCk7ICFjb25maWd1cmF0aW9uXzNfMS5kb25lOyBjb25maWd1cmF0aW9uXzNfMSA9IGNvbmZpZ3VyYXRpb25fMy5uZXh0KCkpIHtcbiAgICAgIHZhciBzID0gY29uZmlndXJhdGlvbl8zXzEudmFsdWU7XG4gICAgICB2YXIgbSA9IHMucGFyZW50O1xuXG4gICAgICB3aGlsZSAobSAmJiAhY29uZmlndXJhdGlvbi5oYXMobSkpIHtcbiAgICAgICAgY29uZmlndXJhdGlvbi5hZGQobSk7XG4gICAgICAgIG0gPSBtLnBhcmVudDtcbiAgICAgIH1cbiAgICB9XG4gIH0gY2F0Y2ggKGVfNF8xKSB7XG4gICAgZV80ID0ge1xuICAgICAgZXJyb3I6IGVfNF8xXG4gICAgfTtcbiAgfSBmaW5hbGx5IHtcbiAgICB0cnkge1xuICAgICAgaWYgKGNvbmZpZ3VyYXRpb25fM18xICYmICFjb25maWd1cmF0aW9uXzNfMS5kb25lICYmIChfZCA9IGNvbmZpZ3VyYXRpb25fMy5yZXR1cm4pKSBfZC5jYWxsKGNvbmZpZ3VyYXRpb25fMyk7XG4gICAgfSBmaW5hbGx5IHtcbiAgICAgIGlmIChlXzQpIHRocm93IGVfNC5lcnJvcjtcbiAgICB9XG4gIH1cblxuICByZXR1cm4gY29uZmlndXJhdGlvbjtcbn1cblxuZnVuY3Rpb24gZ2V0VmFsdWVGcm9tQWRqKGJhc2VOb2RlLCBhZGpMaXN0KSB7XG4gIHZhciBjaGlsZFN0YXRlTm9kZXMgPSBhZGpMaXN0LmdldChiYXNlTm9kZSk7XG5cbiAgaWYgKCFjaGlsZFN0YXRlTm9kZXMpIHtcbiAgICByZXR1cm4ge307IC8vIHRvZG86IGZpeD9cbiAgfVxuXG4gIGlmIChiYXNlTm9kZS50eXBlID09PSAnY29tcG91bmQnKSB7XG4gICAgdmFyIGNoaWxkU3RhdGVOb2RlID0gY2hpbGRTdGF0ZU5vZGVzWzBdO1xuXG4gICAgaWYgKGNoaWxkU3RhdGVOb2RlKSB7XG4gICAgICBpZiAoaXNMZWFmTm9kZShjaGlsZFN0YXRlTm9kZSkpIHtcbiAgICAgICAgcmV0dXJuIGNoaWxkU3RhdGVOb2RlLmtleTtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIHt9O1xuICAgIH1cbiAgfVxuXG4gIHZhciBzdGF0ZVZhbHVlID0ge307XG4gIGNoaWxkU3RhdGVOb2Rlcy5mb3JFYWNoKGZ1bmN0aW9uIChjc24pIHtcbiAgICBzdGF0ZVZhbHVlW2Nzbi5rZXldID0gZ2V0VmFsdWVGcm9tQWRqKGNzbiwgYWRqTGlzdCk7XG4gIH0pO1xuICByZXR1cm4gc3RhdGVWYWx1ZTtcbn1cblxuZnVuY3Rpb24gZ2V0QWRqTGlzdChjb25maWd1cmF0aW9uKSB7XG4gIHZhciBlXzUsIF9hO1xuXG4gIHZhciBhZGpMaXN0ID0gbmV3IE1hcCgpO1xuXG4gIHRyeSB7XG4gICAgZm9yICh2YXIgY29uZmlndXJhdGlvbl80ID0gX192YWx1ZXMoY29uZmlndXJhdGlvbiksIGNvbmZpZ3VyYXRpb25fNF8xID0gY29uZmlndXJhdGlvbl80Lm5leHQoKTsgIWNvbmZpZ3VyYXRpb25fNF8xLmRvbmU7IGNvbmZpZ3VyYXRpb25fNF8xID0gY29uZmlndXJhdGlvbl80Lm5leHQoKSkge1xuICAgICAgdmFyIHMgPSBjb25maWd1cmF0aW9uXzRfMS52YWx1ZTtcblxuICAgICAgaWYgKCFhZGpMaXN0LmhhcyhzKSkge1xuICAgICAgICBhZGpMaXN0LnNldChzLCBbXSk7XG4gICAgICB9XG5cbiAgICAgIGlmIChzLnBhcmVudCkge1xuICAgICAgICBpZiAoIWFkakxpc3QuaGFzKHMucGFyZW50KSkge1xuICAgICAgICAgIGFkakxpc3Quc2V0KHMucGFyZW50LCBbXSk7XG4gICAgICAgIH1cblxuICAgICAgICBhZGpMaXN0LmdldChzLnBhcmVudCkucHVzaChzKTtcbiAgICAgIH1cbiAgICB9XG4gIH0gY2F0Y2ggKGVfNV8xKSB7XG4gICAgZV81ID0ge1xuICAgICAgZXJyb3I6IGVfNV8xXG4gICAgfTtcbiAgfSBmaW5hbGx5IHtcbiAgICB0cnkge1xuICAgICAgaWYgKGNvbmZpZ3VyYXRpb25fNF8xICYmICFjb25maWd1cmF0aW9uXzRfMS5kb25lICYmIChfYSA9IGNvbmZpZ3VyYXRpb25fNC5yZXR1cm4pKSBfYS5jYWxsKGNvbmZpZ3VyYXRpb25fNCk7XG4gICAgfSBmaW5hbGx5IHtcbiAgICAgIGlmIChlXzUpIHRocm93IGVfNS5lcnJvcjtcbiAgICB9XG4gIH1cblxuICByZXR1cm4gYWRqTGlzdDtcbn1cblxuZnVuY3Rpb24gZ2V0VmFsdWUocm9vdE5vZGUsIGNvbmZpZ3VyYXRpb24pIHtcbiAgdmFyIGNvbmZpZyA9IGdldENvbmZpZ3VyYXRpb24oW3Jvb3ROb2RlXSwgY29uZmlndXJhdGlvbik7XG4gIHJldHVybiBnZXRWYWx1ZUZyb21BZGoocm9vdE5vZGUsIGdldEFkakxpc3QoY29uZmlnKSk7XG59XG5cbmZ1bmN0aW9uIGhhcyhpdGVyYWJsZSwgaXRlbSkge1xuICBpZiAoQXJyYXkuaXNBcnJheShpdGVyYWJsZSkpIHtcbiAgICByZXR1cm4gaXRlcmFibGUuc29tZShmdW5jdGlvbiAobWVtYmVyKSB7XG4gICAgICByZXR1cm4gbWVtYmVyID09PSBpdGVtO1xuICAgIH0pO1xuICB9XG5cbiAgaWYgKGl0ZXJhYmxlIGluc3RhbmNlb2YgU2V0KSB7XG4gICAgcmV0dXJuIGl0ZXJhYmxlLmhhcyhpdGVtKTtcbiAgfVxuXG4gIHJldHVybiBmYWxzZTsgLy8gVE9ETzogZml4XG59XG5cbmZ1bmN0aW9uIG5leHRFdmVudHMoY29uZmlndXJhdGlvbikge1xuICByZXR1cm4gZmxhdHRlbihfX3NwcmVhZChuZXcgU2V0KGNvbmZpZ3VyYXRpb24ubWFwKGZ1bmN0aW9uIChzbikge1xuICAgIHJldHVybiBzbi5vd25FdmVudHM7XG4gIH0pKSkpO1xufVxuXG5mdW5jdGlvbiBpc0luRmluYWxTdGF0ZShjb25maWd1cmF0aW9uLCBzdGF0ZU5vZGUpIHtcbiAgaWYgKHN0YXRlTm9kZS50eXBlID09PSAnY29tcG91bmQnKSB7XG4gICAgcmV0dXJuIGdldENoaWxkcmVuKHN0YXRlTm9kZSkuc29tZShmdW5jdGlvbiAocykge1xuICAgICAgcmV0dXJuIHMudHlwZSA9PT0gJ2ZpbmFsJyAmJiBoYXMoY29uZmlndXJhdGlvbiwgcyk7XG4gICAgfSk7XG4gIH1cblxuICBpZiAoc3RhdGVOb2RlLnR5cGUgPT09ICdwYXJhbGxlbCcpIHtcbiAgICByZXR1cm4gZ2V0Q2hpbGRyZW4oc3RhdGVOb2RlKS5ldmVyeShmdW5jdGlvbiAoc24pIHtcbiAgICAgIHJldHVybiBpc0luRmluYWxTdGF0ZShjb25maWd1cmF0aW9uLCBzbik7XG4gICAgfSk7XG4gIH1cblxuICByZXR1cm4gZmFsc2U7XG59XG5cbmV4cG9ydCB7IGdldEFkakxpc3QsIGdldEFsbFN0YXRlTm9kZXMsIGdldENoaWxkcmVuLCBnZXRDb25maWd1cmF0aW9uLCBnZXRWYWx1ZSwgaGFzLCBpc0luRmluYWxTdGF0ZSwgaXNMZWFmTm9kZSwgbmV4dEV2ZW50cyB9OyIsImltcG9ydCB7IF9fc3ByZWFkLCBfX3Jlc3QsIF9fYXNzaWduIH0gZnJvbSAnLi9fdmlydHVhbC9fdHNsaWIuanMnO1xuaW1wb3J0IHsgRU1QVFlfQUNUSVZJVFlfTUFQIH0gZnJvbSAnLi9jb25zdGFudHMuanMnO1xuaW1wb3J0IHsgaXNTdHJpbmcsIG1hdGNoZXNTdGF0ZSwga2V5cyB9IGZyb20gJy4vdXRpbHMuanMnO1xuaW1wb3J0IHsgbmV4dEV2ZW50cyB9IGZyb20gJy4vc3RhdGVVdGlscy5qcyc7XG5pbXBvcnQgeyBpbml0RXZlbnQgfSBmcm9tICcuL2FjdGlvbnMuanMnO1xuXG5mdW5jdGlvbiBzdGF0ZVZhbHVlc0VxdWFsKGEsIGIpIHtcbiAgaWYgKGEgPT09IGIpIHtcbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxuXG4gIGlmIChhID09PSB1bmRlZmluZWQgfHwgYiA9PT0gdW5kZWZpbmVkKSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgaWYgKGlzU3RyaW5nKGEpIHx8IGlzU3RyaW5nKGIpKSB7XG4gICAgcmV0dXJuIGEgPT09IGI7XG4gIH1cblxuICB2YXIgYUtleXMgPSBrZXlzKGEpO1xuICB2YXIgYktleXMgPSBrZXlzKGIpO1xuICByZXR1cm4gYUtleXMubGVuZ3RoID09PSBiS2V5cy5sZW5ndGggJiYgYUtleXMuZXZlcnkoZnVuY3Rpb24gKGtleSkge1xuICAgIHJldHVybiBzdGF0ZVZhbHVlc0VxdWFsKGFba2V5XSwgYltrZXldKTtcbiAgfSk7XG59XG5cbmZ1bmN0aW9uIGlzU3RhdGUoc3RhdGUpIHtcbiAgaWYgKGlzU3RyaW5nKHN0YXRlKSkge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIHJldHVybiAndmFsdWUnIGluIHN0YXRlICYmICdoaXN0b3J5JyBpbiBzdGF0ZTtcbn1cblxuZnVuY3Rpb24gYmluZEFjdGlvblRvU3RhdGUoYWN0aW9uLCBzdGF0ZSkge1xuICB2YXIgZXhlYyA9IGFjdGlvbi5leGVjO1xuXG4gIHZhciBib3VuZEFjdGlvbiA9IF9fYXNzaWduKF9fYXNzaWduKHt9LCBhY3Rpb24pLCB7XG4gICAgZXhlYzogZXhlYyAhPT0gdW5kZWZpbmVkID8gZnVuY3Rpb24gKCkge1xuICAgICAgcmV0dXJuIGV4ZWMoc3RhdGUuY29udGV4dCwgc3RhdGUuZXZlbnQsIHtcbiAgICAgICAgYWN0aW9uOiBhY3Rpb24sXG4gICAgICAgIHN0YXRlOiBzdGF0ZSxcbiAgICAgICAgX2V2ZW50OiBzdGF0ZS5fZXZlbnRcbiAgICAgIH0pO1xuICAgIH0gOiB1bmRlZmluZWRcbiAgfSk7XG5cbiAgcmV0dXJuIGJvdW5kQWN0aW9uO1xufVxuXG52YXIgU3RhdGUgPVxuLyojX19QVVJFX18qL1xuXG4vKiogQGNsYXNzICovXG5mdW5jdGlvbiAoKSB7XG4gIC8qKlxyXG4gICAqIENyZWF0ZXMgYSBuZXcgU3RhdGUgaW5zdGFuY2UuXHJcbiAgICogQHBhcmFtIHZhbHVlIFRoZSBzdGF0ZSB2YWx1ZVxyXG4gICAqIEBwYXJhbSBjb250ZXh0IFRoZSBleHRlbmRlZCBzdGF0ZVxyXG4gICAqIEBwYXJhbSBoaXN0b3J5VmFsdWUgVGhlIHRyZWUgcmVwcmVzZW50aW5nIGhpc3RvcmljYWwgdmFsdWVzIG9mIHRoZSBzdGF0ZSBub2Rlc1xyXG4gICAqIEBwYXJhbSBoaXN0b3J5IFRoZSBwcmV2aW91cyBzdGF0ZVxyXG4gICAqIEBwYXJhbSBhY3Rpb25zIEFuIGFycmF5IG9mIGFjdGlvbiBvYmplY3RzIHRvIGV4ZWN1dGUgYXMgc2lkZS1lZmZlY3RzXHJcbiAgICogQHBhcmFtIGFjdGl2aXRpZXMgQSBtYXBwaW5nIG9mIGFjdGl2aXRpZXMgYW5kIHdoZXRoZXIgdGhleSBhcmUgc3RhcnRlZCAoYHRydWVgKSBvciBzdG9wcGVkIChgZmFsc2VgKS5cclxuICAgKiBAcGFyYW0gbWV0YVxyXG4gICAqIEBwYXJhbSBldmVudHMgSW50ZXJuYWwgZXZlbnQgcXVldWUuIFNob3VsZCBiZSBlbXB0eSB3aXRoIHJ1bi10by1jb21wbGV0aW9uIHNlbWFudGljcy5cclxuICAgKiBAcGFyYW0gY29uZmlndXJhdGlvblxyXG4gICAqL1xuICBmdW5jdGlvbiBTdGF0ZShjb25maWcpIHtcbiAgICB2YXIgX3RoaXMgPSB0aGlzO1xuXG4gICAgdGhpcy5hY3Rpb25zID0gW107XG4gICAgdGhpcy5hY3Rpdml0aWVzID0gRU1QVFlfQUNUSVZJVFlfTUFQO1xuICAgIHRoaXMubWV0YSA9IHt9O1xuICAgIHRoaXMuZXZlbnRzID0gW107XG4gICAgdGhpcy52YWx1ZSA9IGNvbmZpZy52YWx1ZTtcbiAgICB0aGlzLmNvbnRleHQgPSBjb25maWcuY29udGV4dDtcbiAgICB0aGlzLl9ldmVudCA9IGNvbmZpZy5fZXZlbnQ7XG4gICAgdGhpcy5fc2Vzc2lvbmlkID0gY29uZmlnLl9zZXNzaW9uaWQ7XG4gICAgdGhpcy5ldmVudCA9IHRoaXMuX2V2ZW50LmRhdGE7XG4gICAgdGhpcy5oaXN0b3J5VmFsdWUgPSBjb25maWcuaGlzdG9yeVZhbHVlO1xuICAgIHRoaXMuaGlzdG9yeSA9IGNvbmZpZy5oaXN0b3J5O1xuICAgIHRoaXMuYWN0aW9ucyA9IGNvbmZpZy5hY3Rpb25zIHx8IFtdO1xuICAgIHRoaXMuYWN0aXZpdGllcyA9IGNvbmZpZy5hY3Rpdml0aWVzIHx8IEVNUFRZX0FDVElWSVRZX01BUDtcbiAgICB0aGlzLm1ldGEgPSBjb25maWcubWV0YSB8fCB7fTtcbiAgICB0aGlzLmV2ZW50cyA9IGNvbmZpZy5ldmVudHMgfHwgW107XG4gICAgdGhpcy5tYXRjaGVzID0gdGhpcy5tYXRjaGVzLmJpbmQodGhpcyk7XG4gICAgdGhpcy50b1N0cmluZ3MgPSB0aGlzLnRvU3RyaW5ncy5iaW5kKHRoaXMpO1xuICAgIHRoaXMuY29uZmlndXJhdGlvbiA9IGNvbmZpZy5jb25maWd1cmF0aW9uO1xuICAgIHRoaXMudHJhbnNpdGlvbnMgPSBjb25maWcudHJhbnNpdGlvbnM7XG4gICAgdGhpcy5jaGlsZHJlbiA9IGNvbmZpZy5jaGlsZHJlbjtcbiAgICB0aGlzLmRvbmUgPSAhIWNvbmZpZy5kb25lO1xuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0aGlzLCAnbmV4dEV2ZW50cycsIHtcbiAgICAgIGdldDogZnVuY3Rpb24gKCkge1xuICAgICAgICByZXR1cm4gbmV4dEV2ZW50cyhfdGhpcy5jb25maWd1cmF0aW9uKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuICAvKipcclxuICAgKiBDcmVhdGVzIGEgbmV3IFN0YXRlIGluc3RhbmNlIGZvciB0aGUgZ2l2ZW4gYHN0YXRlVmFsdWVgIGFuZCBgY29udGV4dGAuXHJcbiAgICogQHBhcmFtIHN0YXRlVmFsdWVcclxuICAgKiBAcGFyYW0gY29udGV4dFxyXG4gICAqL1xuXG5cbiAgU3RhdGUuZnJvbSA9IGZ1bmN0aW9uIChzdGF0ZVZhbHVlLCBjb250ZXh0KSB7XG4gICAgaWYgKHN0YXRlVmFsdWUgaW5zdGFuY2VvZiBTdGF0ZSkge1xuICAgICAgaWYgKHN0YXRlVmFsdWUuY29udGV4dCAhPT0gY29udGV4dCkge1xuICAgICAgICByZXR1cm4gbmV3IFN0YXRlKHtcbiAgICAgICAgICB2YWx1ZTogc3RhdGVWYWx1ZS52YWx1ZSxcbiAgICAgICAgICBjb250ZXh0OiBjb250ZXh0LFxuICAgICAgICAgIF9ldmVudDogc3RhdGVWYWx1ZS5fZXZlbnQsXG4gICAgICAgICAgX3Nlc3Npb25pZDogbnVsbCxcbiAgICAgICAgICBoaXN0b3J5VmFsdWU6IHN0YXRlVmFsdWUuaGlzdG9yeVZhbHVlLFxuICAgICAgICAgIGhpc3Rvcnk6IHN0YXRlVmFsdWUuaGlzdG9yeSxcbiAgICAgICAgICBhY3Rpb25zOiBbXSxcbiAgICAgICAgICBhY3Rpdml0aWVzOiBzdGF0ZVZhbHVlLmFjdGl2aXRpZXMsXG4gICAgICAgICAgbWV0YToge30sXG4gICAgICAgICAgZXZlbnRzOiBbXSxcbiAgICAgICAgICBjb25maWd1cmF0aW9uOiBbXSxcbiAgICAgICAgICB0cmFuc2l0aW9uczogW10sXG4gICAgICAgICAgY2hpbGRyZW46IHt9XG4gICAgICAgIH0pO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gc3RhdGVWYWx1ZTtcbiAgICB9XG5cbiAgICB2YXIgX2V2ZW50ID0gaW5pdEV2ZW50O1xuICAgIHJldHVybiBuZXcgU3RhdGUoe1xuICAgICAgdmFsdWU6IHN0YXRlVmFsdWUsXG4gICAgICBjb250ZXh0OiBjb250ZXh0LFxuICAgICAgX2V2ZW50OiBfZXZlbnQsXG4gICAgICBfc2Vzc2lvbmlkOiBudWxsLFxuICAgICAgaGlzdG9yeVZhbHVlOiB1bmRlZmluZWQsXG4gICAgICBoaXN0b3J5OiB1bmRlZmluZWQsXG4gICAgICBhY3Rpb25zOiBbXSxcbiAgICAgIGFjdGl2aXRpZXM6IHVuZGVmaW5lZCxcbiAgICAgIG1ldGE6IHVuZGVmaW5lZCxcbiAgICAgIGV2ZW50czogW10sXG4gICAgICBjb25maWd1cmF0aW9uOiBbXSxcbiAgICAgIHRyYW5zaXRpb25zOiBbXSxcbiAgICAgIGNoaWxkcmVuOiB7fVxuICAgIH0pO1xuICB9O1xuICAvKipcclxuICAgKiBDcmVhdGVzIGEgbmV3IFN0YXRlIGluc3RhbmNlIGZvciB0aGUgZ2l2ZW4gYGNvbmZpZ2AuXHJcbiAgICogQHBhcmFtIGNvbmZpZyBUaGUgc3RhdGUgY29uZmlnXHJcbiAgICovXG5cblxuICBTdGF0ZS5jcmVhdGUgPSBmdW5jdGlvbiAoY29uZmlnKSB7XG4gICAgcmV0dXJuIG5ldyBTdGF0ZShjb25maWcpO1xuICB9O1xuICAvKipcclxuICAgKiBDcmVhdGVzIGEgbmV3IGBTdGF0ZWAgaW5zdGFuY2UgZm9yIHRoZSBnaXZlbiBgc3RhdGVWYWx1ZWAgYW5kIGBjb250ZXh0YCB3aXRoIG5vIGFjdGlvbnMgKHNpZGUtZWZmZWN0cykuXHJcbiAgICogQHBhcmFtIHN0YXRlVmFsdWVcclxuICAgKiBAcGFyYW0gY29udGV4dFxyXG4gICAqL1xuXG5cbiAgU3RhdGUuaW5lcnQgPSBmdW5jdGlvbiAoc3RhdGVWYWx1ZSwgY29udGV4dCkge1xuICAgIGlmIChzdGF0ZVZhbHVlIGluc3RhbmNlb2YgU3RhdGUpIHtcbiAgICAgIGlmICghc3RhdGVWYWx1ZS5hY3Rpb25zLmxlbmd0aCkge1xuICAgICAgICByZXR1cm4gc3RhdGVWYWx1ZTtcbiAgICAgIH1cblxuICAgICAgdmFyIF9ldmVudCA9IGluaXRFdmVudDtcbiAgICAgIHJldHVybiBuZXcgU3RhdGUoe1xuICAgICAgICB2YWx1ZTogc3RhdGVWYWx1ZS52YWx1ZSxcbiAgICAgICAgY29udGV4dDogY29udGV4dCxcbiAgICAgICAgX2V2ZW50OiBfZXZlbnQsXG4gICAgICAgIF9zZXNzaW9uaWQ6IG51bGwsXG4gICAgICAgIGhpc3RvcnlWYWx1ZTogc3RhdGVWYWx1ZS5oaXN0b3J5VmFsdWUsXG4gICAgICAgIGhpc3Rvcnk6IHN0YXRlVmFsdWUuaGlzdG9yeSxcbiAgICAgICAgYWN0aXZpdGllczogc3RhdGVWYWx1ZS5hY3Rpdml0aWVzLFxuICAgICAgICBjb25maWd1cmF0aW9uOiBzdGF0ZVZhbHVlLmNvbmZpZ3VyYXRpb24sXG4gICAgICAgIHRyYW5zaXRpb25zOiBbXSxcbiAgICAgICAgY2hpbGRyZW46IHt9XG4gICAgICB9KTtcbiAgICB9XG5cbiAgICByZXR1cm4gU3RhdGUuZnJvbShzdGF0ZVZhbHVlLCBjb250ZXh0KTtcbiAgfTtcbiAgLyoqXHJcbiAgICogUmV0dXJucyBhbiBhcnJheSBvZiBhbGwgdGhlIHN0cmluZyBsZWFmIHN0YXRlIG5vZGUgcGF0aHMuXHJcbiAgICogQHBhcmFtIHN0YXRlVmFsdWVcclxuICAgKiBAcGFyYW0gZGVsaW1pdGVyIFRoZSBjaGFyYWN0ZXIocykgdGhhdCBzZXBhcmF0ZSBlYWNoIHN1YnBhdGggaW4gdGhlIHN0cmluZyBzdGF0ZSBub2RlIHBhdGguXHJcbiAgICovXG5cblxuICBTdGF0ZS5wcm90b3R5cGUudG9TdHJpbmdzID0gZnVuY3Rpb24gKHN0YXRlVmFsdWUsIGRlbGltaXRlcikge1xuICAgIHZhciBfdGhpcyA9IHRoaXM7XG5cbiAgICBpZiAoc3RhdGVWYWx1ZSA9PT0gdm9pZCAwKSB7XG4gICAgICBzdGF0ZVZhbHVlID0gdGhpcy52YWx1ZTtcbiAgICB9XG5cbiAgICBpZiAoZGVsaW1pdGVyID09PSB2b2lkIDApIHtcbiAgICAgIGRlbGltaXRlciA9ICcuJztcbiAgICB9XG5cbiAgICBpZiAoaXNTdHJpbmcoc3RhdGVWYWx1ZSkpIHtcbiAgICAgIHJldHVybiBbc3RhdGVWYWx1ZV07XG4gICAgfVxuXG4gICAgdmFyIHZhbHVlS2V5cyA9IGtleXMoc3RhdGVWYWx1ZSk7XG4gICAgcmV0dXJuIHZhbHVlS2V5cy5jb25jYXQuYXBwbHkodmFsdWVLZXlzLCBfX3NwcmVhZCh2YWx1ZUtleXMubWFwKGZ1bmN0aW9uIChrZXkpIHtcbiAgICAgIHJldHVybiBfdGhpcy50b1N0cmluZ3Moc3RhdGVWYWx1ZVtrZXldLCBkZWxpbWl0ZXIpLm1hcChmdW5jdGlvbiAocykge1xuICAgICAgICByZXR1cm4ga2V5ICsgZGVsaW1pdGVyICsgcztcbiAgICAgIH0pO1xuICAgIH0pKSk7XG4gIH07XG5cbiAgU3RhdGUucHJvdG90eXBlLnRvSlNPTiA9IGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgX2EgPSB0aGlzLFxuICAgICAgICBjb25maWd1cmF0aW9uID0gX2EuY29uZmlndXJhdGlvbixcbiAgICAgICAgdHJhbnNpdGlvbnMgPSBfYS50cmFuc2l0aW9ucyxcbiAgICAgICAganNvblZhbHVlcyA9IF9fcmVzdChfYSwgW1wiY29uZmlndXJhdGlvblwiLCBcInRyYW5zaXRpb25zXCJdKTtcblxuICAgIHJldHVybiBqc29uVmFsdWVzO1xuICB9O1xuICAvKipcclxuICAgKiBXaGV0aGVyIHRoZSBjdXJyZW50IHN0YXRlIHZhbHVlIGlzIGEgc3Vic2V0IG9mIHRoZSBnaXZlbiBwYXJlbnQgc3RhdGUgdmFsdWUuXHJcbiAgICogQHBhcmFtIHBhcmVudFN0YXRlVmFsdWVcclxuICAgKi9cblxuXG4gIFN0YXRlLnByb3RvdHlwZS5tYXRjaGVzID0gZnVuY3Rpb24gKHBhcmVudFN0YXRlVmFsdWUpIHtcbiAgICByZXR1cm4gbWF0Y2hlc1N0YXRlKHBhcmVudFN0YXRlVmFsdWUsIHRoaXMudmFsdWUpO1xuICB9O1xuXG4gIHJldHVybiBTdGF0ZTtcbn0oKTtcblxuZXhwb3J0IHsgU3RhdGUsIGJpbmRBY3Rpb25Ub1N0YXRlLCBpc1N0YXRlLCBzdGF0ZVZhbHVlc0VxdWFsIH07IiwiLyoqXHJcbiAqIE1haW50YWlucyBhIHN0YWNrIG9mIHRoZSBjdXJyZW50IHNlcnZpY2UgaW4gc2NvcGUuXHJcbiAqIFRoaXMgaXMgdXNlZCB0byBwcm92aWRlIHRoZSBjb3JyZWN0IHNlcnZpY2UgdG8gc3Bhd24oKS5cclxuICovXG52YXIgc2VydmljZVN0YWNrID0gW107XG5cbnZhciBwcm92aWRlID0gZnVuY3Rpb24gKHNlcnZpY2UsIGZuKSB7XG4gIHNlcnZpY2VTdGFjay5wdXNoKHNlcnZpY2UpO1xuICB2YXIgcmVzdWx0ID0gZm4oc2VydmljZSk7XG4gIHNlcnZpY2VTdGFjay5wb3AoKTtcbiAgcmV0dXJuIHJlc3VsdDtcbn07XG5cbnZhciBjb25zdW1lID0gZnVuY3Rpb24gKGZuKSB7XG4gIHJldHVybiBmbihzZXJ2aWNlU3RhY2tbc2VydmljZVN0YWNrLmxlbmd0aCAtIDFdKTtcbn07XG5cbmV4cG9ydCB7IGNvbnN1bWUsIHByb3ZpZGUgfTsiLCJpbXBvcnQgeyB0b0ludm9rZVNvdXJjZSwgbWFwQ29udGV4dCwgaXNNYWNoaW5lIH0gZnJvbSAnLi91dGlscy5qcyc7XG5pbXBvcnQgeyBwcm92aWRlIH0gZnJvbSAnLi9zZXJ2aWNlU2NvcGUuanMnO1xuXG5mdW5jdGlvbiBjcmVhdGVOdWxsQWN0b3IoaWQpIHtcbiAgcmV0dXJuIHtcbiAgICBpZDogaWQsXG4gICAgc2VuZDogZnVuY3Rpb24gKCkge1xuICAgICAgcmV0dXJuIHZvaWQgMDtcbiAgICB9LFxuICAgIHN1YnNjcmliZTogZnVuY3Rpb24gKCkge1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgdW5zdWJzY3JpYmU6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICByZXR1cm4gdm9pZCAwO1xuICAgICAgICB9XG4gICAgICB9O1xuICAgIH0sXG4gICAgdG9KU09OOiBmdW5jdGlvbiAoKSB7XG4gICAgICByZXR1cm4ge1xuICAgICAgICBpZDogaWRcbiAgICAgIH07XG4gICAgfVxuICB9O1xufVxuLyoqXHJcbiAqIENyZWF0ZXMgYSBkZWZlcnJlZCBhY3RvciB0aGF0IGlzIGFibGUgdG8gYmUgaW52b2tlZCBnaXZlbiB0aGUgcHJvdmlkZWRcclxuICogaW52b2NhdGlvbiBpbmZvcm1hdGlvbiBpbiBpdHMgYC5tZXRhYCB2YWx1ZS5cclxuICpcclxuICogQHBhcmFtIGludm9rZURlZmluaXRpb24gVGhlIG1ldGEgaW5mb3JtYXRpb24gbmVlZGVkIHRvIGludm9rZSB0aGUgYWN0b3IuXHJcbiAqL1xuXG5cbmZ1bmN0aW9uIGNyZWF0ZUludm9jYWJsZUFjdG9yKGludm9rZURlZmluaXRpb24sIG1hY2hpbmUsIGNvbnRleHQsIF9ldmVudCkge1xuICB2YXIgX2E7XG5cbiAgdmFyIGludm9rZVNyYyA9IHRvSW52b2tlU291cmNlKGludm9rZURlZmluaXRpb24uc3JjKTtcbiAgdmFyIHNlcnZpY2VDcmVhdG9yID0gKF9hID0gbWFjaGluZSA9PT0gbnVsbCB8fCBtYWNoaW5lID09PSB2b2lkIDAgPyB2b2lkIDAgOiBtYWNoaW5lLm9wdGlvbnMuc2VydmljZXMpID09PSBudWxsIHx8IF9hID09PSB2b2lkIDAgPyB2b2lkIDAgOiBfYVtpbnZva2VTcmMudHlwZV07XG4gIHZhciByZXNvbHZlZERhdGEgPSBpbnZva2VEZWZpbml0aW9uLmRhdGEgPyBtYXBDb250ZXh0KGludm9rZURlZmluaXRpb24uZGF0YSwgY29udGV4dCwgX2V2ZW50KSA6IHVuZGVmaW5lZDtcbiAgdmFyIHRlbXBBY3RvciA9IHNlcnZpY2VDcmVhdG9yID8gY3JlYXRlRGVmZXJyZWRBY3RvcihzZXJ2aWNlQ3JlYXRvciwgaW52b2tlRGVmaW5pdGlvbi5pZCwgcmVzb2x2ZWREYXRhKSA6IGNyZWF0ZU51bGxBY3RvcihpbnZva2VEZWZpbml0aW9uLmlkKTtcbiAgdGVtcEFjdG9yLm1ldGEgPSBpbnZva2VEZWZpbml0aW9uO1xuICByZXR1cm4gdGVtcEFjdG9yO1xufVxuXG5mdW5jdGlvbiBjcmVhdGVEZWZlcnJlZEFjdG9yKGVudGl0eSwgaWQsIGRhdGEpIHtcbiAgdmFyIHRlbXBBY3RvciA9IGNyZWF0ZU51bGxBY3RvcihpZCk7XG4gIHRlbXBBY3Rvci5kZWZlcnJlZCA9IHRydWU7XG5cbiAgaWYgKGlzTWFjaGluZShlbnRpdHkpKSB7XG4gICAgLy8gXCJtdXRlXCIgdGhlIGV4aXN0aW5nIHNlcnZpY2Ugc2NvcGUgc28gcG90ZW50aWFsIHNwYXduZWQgYWN0b3JzIHdpdGhpbiB0aGUgYC5pbml0aWFsU3RhdGVgIHN0YXkgZGVmZXJyZWQgaGVyZVxuICAgIHRlbXBBY3Rvci5zdGF0ZSA9IHByb3ZpZGUodW5kZWZpbmVkLCBmdW5jdGlvbiAoKSB7XG4gICAgICByZXR1cm4gKGRhdGEgPyBlbnRpdHkud2l0aENvbnRleHQoZGF0YSkgOiBlbnRpdHkpLmluaXRpYWxTdGF0ZTtcbiAgICB9KTtcbiAgfVxuXG4gIHJldHVybiB0ZW1wQWN0b3I7XG59XG5cbmZ1bmN0aW9uIGlzQWN0b3IoaXRlbSkge1xuICB0cnkge1xuICAgIHJldHVybiB0eXBlb2YgaXRlbS5zZW5kID09PSAnZnVuY3Rpb24nO1xuICB9IGNhdGNoIChlKSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG59XG5cbmZ1bmN0aW9uIGlzU3Bhd25lZEFjdG9yKGl0ZW0pIHtcbiAgcmV0dXJuIGlzQWN0b3IoaXRlbSkgJiYgJ2lkJyBpbiBpdGVtO1xufVxuXG5leHBvcnQgeyBjcmVhdGVEZWZlcnJlZEFjdG9yLCBjcmVhdGVJbnZvY2FibGVBY3RvciwgY3JlYXRlTnVsbEFjdG9yLCBpc0FjdG9yLCBpc1NwYXduZWRBY3RvciB9OyIsImltcG9ydCB7IF9fYXNzaWduLCBfX3Jlc3QgfSBmcm9tICcuL192aXJ0dWFsL190c2xpYi5qcyc7XG5pbXBvcnQgeyBpbnZva2UgfSBmcm9tICcuL2FjdGlvblR5cGVzLmpzJztcbmltcG9ydCAnLi9hY3Rpb25zLmpzJztcblxuZnVuY3Rpb24gdG9JbnZva2VTb3VyY2Uoc3JjKSB7XG4gIGlmICh0eXBlb2Ygc3JjID09PSAnc3RyaW5nJykge1xuICAgIHZhciBzaW1wbGVTcmMgPSB7XG4gICAgICB0eXBlOiBzcmNcbiAgICB9O1xuXG4gICAgc2ltcGxlU3JjLnRvU3RyaW5nID0gZnVuY3Rpb24gKCkge1xuICAgICAgcmV0dXJuIHNyYztcbiAgICB9OyAvLyB2NCBjb21wYXQgLSBUT0RPOiByZW1vdmUgaW4gdjVcblxuXG4gICAgcmV0dXJuIHNpbXBsZVNyYztcbiAgfVxuXG4gIHJldHVybiBzcmM7XG59XG5cbmZ1bmN0aW9uIHRvSW52b2tlRGVmaW5pdGlvbihpbnZva2VDb25maWcpIHtcbiAgcmV0dXJuIF9fYXNzaWduKF9fYXNzaWduKHtcbiAgICB0eXBlOiBpbnZva2VcbiAgfSwgaW52b2tlQ29uZmlnKSwge1xuICAgIHRvSlNPTjogZnVuY3Rpb24gKCkge1xuICAgICAgdmFyIG9uRG9uZSA9IGludm9rZUNvbmZpZy5vbkRvbmUsXG4gICAgICAgICAgb25FcnJvciA9IGludm9rZUNvbmZpZy5vbkVycm9yLFxuICAgICAgICAgIGludm9rZURlZiA9IF9fcmVzdChpbnZva2VDb25maWcsIFtcIm9uRG9uZVwiLCBcIm9uRXJyb3JcIl0pO1xuXG4gICAgICByZXR1cm4gX19hc3NpZ24oX19hc3NpZ24oe30sIGludm9rZURlZiksIHtcbiAgICAgICAgdHlwZTogaW52b2tlLFxuICAgICAgICBzcmM6IHRvSW52b2tlU291cmNlKGludm9rZUNvbmZpZy5zcmMpXG4gICAgICB9KTtcbiAgICB9XG4gIH0pO1xufVxuXG5leHBvcnQgeyB0b0ludm9rZURlZmluaXRpb24sIHRvSW52b2tlU291cmNlIH07IiwiaW1wb3J0IHsgX19hc3NpZ24sIF9fdmFsdWVzLCBfX3NwcmVhZCwgX19yZWFkLCBfX3Jlc3QgfSBmcm9tICcuL192aXJ0dWFsL190c2xpYi5qcyc7XG5pbXBvcnQgeyBTVEFURV9ERUxJTUlURVIgfSBmcm9tICcuL2NvbnN0YW50cy5qcyc7XG5pbXBvcnQgeyBJU19QUk9EVUNUSU9OIH0gZnJvbSAnLi9lbnZpcm9ubWVudC5qcyc7XG5pbXBvcnQgeyBtYXBWYWx1ZXMsIGlzQXJyYXksIGZsYXR0ZW4sIGtleXMsIHRvQXJyYXksIHRvU3RhdGVWYWx1ZSwgaXNTdHJpbmcsIGdldEV2ZW50VHlwZSwgbWF0Y2hlc1N0YXRlLCBwYXRoLCBldmFsdWF0ZUd1YXJkLCBtYXBDb250ZXh0LCB0b1NDWE1MRXZlbnQsIHBhdGhUb1N0YXRlVmFsdWUsIGlzQnVpbHRJbkV2ZW50LCBwYXJ0aXRpb24sIHVwZGF0ZUhpc3RvcnlWYWx1ZSwgdG9TdGF0ZVBhdGgsIG1hcEZpbHRlclZhbHVlcywgd2FybiwgdG9TdGF0ZVBhdGhzLCBuZXN0ZWRQYXRoLCBub3JtYWxpemVUYXJnZXQsIHRvR3VhcmQsIHRvVHJhbnNpdGlvbkNvbmZpZ0FycmF5LCBpc01hY2hpbmUsIGlzRnVuY3Rpb24gfSBmcm9tICcuL3V0aWxzLmpzJztcbmltcG9ydCB7IFNwZWNpYWxUYXJnZXRzIH0gZnJvbSAnLi90eXBlcy5qcyc7XG5pbXBvcnQgeyBnZXRBbGxTdGF0ZU5vZGVzLCBnZXRDb25maWd1cmF0aW9uLCBoYXMsIGdldENoaWxkcmVuLCBpc0luRmluYWxTdGF0ZSwgZ2V0VmFsdWUsIGlzTGVhZk5vZGUgfSBmcm9tICcuL3N0YXRlVXRpbHMuanMnO1xuaW1wb3J0IHsgc3RhcnQgYXMgc3RhcnQkMSwgc3RvcCBhcyBzdG9wJDEsIGludm9rZSwgdXBkYXRlLCBudWxsRXZlbnQsIHJhaXNlIGFzIHJhaXNlJDEsIHNlbmQgYXMgc2VuZCQxIH0gZnJvbSAnLi9hY3Rpb25UeXBlcy5qcyc7XG5pbXBvcnQgeyBkb25lLCBzdGFydCwgcmFpc2UsIHN0b3AsIHRvQWN0aW9uT2JqZWN0cywgcmVzb2x2ZUFjdGlvbnMsIGRvbmVJbnZva2UsIGVycm9yLCB0b0FjdGlvbk9iamVjdCwgdG9BY3Rpdml0eURlZmluaXRpb24sIGFmdGVyLCBzZW5kLCBjYW5jZWwsIGluaXRFdmVudCB9IGZyb20gJy4vYWN0aW9ucy5qcyc7XG5pbXBvcnQgeyBTdGF0ZSwgc3RhdGVWYWx1ZXNFcXVhbCB9IGZyb20gJy4vU3RhdGUuanMnO1xuaW1wb3J0IHsgY3JlYXRlSW52b2NhYmxlQWN0b3IgfSBmcm9tICcuL0FjdG9yLmpzJztcbmltcG9ydCB7IHRvSW52b2tlRGVmaW5pdGlvbiB9IGZyb20gJy4vaW52b2tlVXRpbHMuanMnO1xudmFyIE5VTExfRVZFTlQgPSAnJztcbnZhciBTVEFURV9JREVOVElGSUVSID0gJyMnO1xudmFyIFdJTERDQVJEID0gJyonO1xudmFyIEVNUFRZX09CSkVDVCA9IHt9O1xuXG52YXIgaXNTdGF0ZUlkID0gZnVuY3Rpb24gKHN0cikge1xuICByZXR1cm4gc3RyWzBdID09PSBTVEFURV9JREVOVElGSUVSO1xufTtcblxudmFyIGNyZWF0ZURlZmF1bHRPcHRpb25zID0gZnVuY3Rpb24gKCkge1xuICByZXR1cm4ge1xuICAgIGFjdGlvbnM6IHt9LFxuICAgIGd1YXJkczoge30sXG4gICAgc2VydmljZXM6IHt9LFxuICAgIGFjdGl2aXRpZXM6IHt9LFxuICAgIGRlbGF5czoge31cbiAgfTtcbn07XG5cbnZhciB2YWxpZGF0ZUFycmF5aWZpZWRUcmFuc2l0aW9ucyA9IGZ1bmN0aW9uIChzdGF0ZU5vZGUsIGV2ZW50LCB0cmFuc2l0aW9ucykge1xuICB2YXIgaGFzTm9uTGFzdFVuZ3VhcmRlZFRhcmdldCA9IHRyYW5zaXRpb25zLnNsaWNlKDAsIC0xKS5zb21lKGZ1bmN0aW9uICh0cmFuc2l0aW9uKSB7XG4gICAgcmV0dXJuICEoJ2NvbmQnIGluIHRyYW5zaXRpb24pICYmICEoJ2luJyBpbiB0cmFuc2l0aW9uKSAmJiAoaXNTdHJpbmcodHJhbnNpdGlvbi50YXJnZXQpIHx8IGlzTWFjaGluZSh0cmFuc2l0aW9uLnRhcmdldCkpO1xuICB9KTtcbiAgdmFyIGV2ZW50VGV4dCA9IGV2ZW50ID09PSBOVUxMX0VWRU5UID8gJ3RoZSB0cmFuc2llbnQgZXZlbnQnIDogXCJldmVudCAnXCIgKyBldmVudCArIFwiJ1wiO1xuICB3YXJuKCFoYXNOb25MYXN0VW5ndWFyZGVkVGFyZ2V0LCBcIk9uZSBvciBtb3JlIHRyYW5zaXRpb25zIGZvciBcIiArIGV2ZW50VGV4dCArIFwiIG9uIHN0YXRlICdcIiArIHN0YXRlTm9kZS5pZCArIFwiJyBhcmUgdW5yZWFjaGFibGUuIFwiICsgXCJNYWtlIHN1cmUgdGhhdCB0aGUgZGVmYXVsdCB0cmFuc2l0aW9uIGlzIHRoZSBsYXN0IG9uZSBkZWZpbmVkLlwiKTtcbn07XG5cbnZhciBTdGF0ZU5vZGUgPVxuLyojX19QVVJFX18qL1xuXG4vKiogQGNsYXNzICovXG5mdW5jdGlvbiAoKSB7XG4gIGZ1bmN0aW9uIFN0YXRlTm9kZShcbiAgLyoqXHJcbiAgICogVGhlIHJhdyBjb25maWcgdXNlZCB0byBjcmVhdGUgdGhlIG1hY2hpbmUuXHJcbiAgICovXG4gIGNvbmZpZywgb3B0aW9ucyxcbiAgLyoqXHJcbiAgICogVGhlIGluaXRpYWwgZXh0ZW5kZWQgc3RhdGVcclxuICAgKi9cbiAgY29udGV4dCkge1xuICAgIHZhciBfdGhpcyA9IHRoaXM7XG5cbiAgICB0aGlzLmNvbmZpZyA9IGNvbmZpZztcbiAgICB0aGlzLmNvbnRleHQgPSBjb250ZXh0O1xuICAgIC8qKlxyXG4gICAgICogVGhlIG9yZGVyIHRoaXMgc3RhdGUgbm9kZSBhcHBlYXJzLiBDb3JyZXNwb25kcyB0byB0aGUgaW1wbGljaXQgU0NYTUwgZG9jdW1lbnQgb3JkZXIuXHJcbiAgICAgKi9cblxuICAgIHRoaXMub3JkZXIgPSAtMTtcbiAgICB0aGlzLl9feHN0YXRlbm9kZSA9IHRydWU7XG4gICAgdGhpcy5fX2NhY2hlID0ge1xuICAgICAgZXZlbnRzOiB1bmRlZmluZWQsXG4gICAgICByZWxhdGl2ZVZhbHVlOiBuZXcgTWFwKCksXG4gICAgICBpbml0aWFsU3RhdGVWYWx1ZTogdW5kZWZpbmVkLFxuICAgICAgaW5pdGlhbFN0YXRlOiB1bmRlZmluZWQsXG4gICAgICBvbjogdW5kZWZpbmVkLFxuICAgICAgdHJhbnNpdGlvbnM6IHVuZGVmaW5lZCxcbiAgICAgIGNhbmRpZGF0ZXM6IHt9LFxuICAgICAgZGVsYXllZFRyYW5zaXRpb25zOiB1bmRlZmluZWRcbiAgICB9O1xuICAgIHRoaXMuaWRNYXAgPSB7fTtcbiAgICB0aGlzLm9wdGlvbnMgPSBPYmplY3QuYXNzaWduKGNyZWF0ZURlZmF1bHRPcHRpb25zKCksIG9wdGlvbnMpO1xuICAgIHRoaXMucGFyZW50ID0gdGhpcy5vcHRpb25zLl9wYXJlbnQ7XG4gICAgdGhpcy5rZXkgPSB0aGlzLmNvbmZpZy5rZXkgfHwgdGhpcy5vcHRpb25zLl9rZXkgfHwgdGhpcy5jb25maWcuaWQgfHwgJyhtYWNoaW5lKSc7XG4gICAgdGhpcy5tYWNoaW5lID0gdGhpcy5wYXJlbnQgPyB0aGlzLnBhcmVudC5tYWNoaW5lIDogdGhpcztcbiAgICB0aGlzLnBhdGggPSB0aGlzLnBhcmVudCA/IHRoaXMucGFyZW50LnBhdGguY29uY2F0KHRoaXMua2V5KSA6IFtdO1xuICAgIHRoaXMuZGVsaW1pdGVyID0gdGhpcy5jb25maWcuZGVsaW1pdGVyIHx8ICh0aGlzLnBhcmVudCA/IHRoaXMucGFyZW50LmRlbGltaXRlciA6IFNUQVRFX0RFTElNSVRFUik7XG4gICAgdGhpcy5pZCA9IHRoaXMuY29uZmlnLmlkIHx8IF9fc3ByZWFkKFt0aGlzLm1hY2hpbmUua2V5XSwgdGhpcy5wYXRoKS5qb2luKHRoaXMuZGVsaW1pdGVyKTtcbiAgICB0aGlzLnZlcnNpb24gPSB0aGlzLnBhcmVudCA/IHRoaXMucGFyZW50LnZlcnNpb24gOiB0aGlzLmNvbmZpZy52ZXJzaW9uO1xuICAgIHRoaXMudHlwZSA9IHRoaXMuY29uZmlnLnR5cGUgfHwgKHRoaXMuY29uZmlnLnBhcmFsbGVsID8gJ3BhcmFsbGVsJyA6IHRoaXMuY29uZmlnLnN0YXRlcyAmJiBrZXlzKHRoaXMuY29uZmlnLnN0YXRlcykubGVuZ3RoID8gJ2NvbXBvdW5kJyA6IHRoaXMuY29uZmlnLmhpc3RvcnkgPyAnaGlzdG9yeScgOiAnYXRvbWljJyk7XG5cbiAgICBpZiAoIUlTX1BST0RVQ1RJT04pIHtcbiAgICAgIHdhcm4oISgncGFyYWxsZWwnIGluIHRoaXMuY29uZmlnKSwgXCJUaGUgXFxcInBhcmFsbGVsXFxcIiBwcm9wZXJ0eSBpcyBkZXByZWNhdGVkIGFuZCB3aWxsIGJlIHJlbW92ZWQgaW4gdmVyc2lvbiA0LjEuIFwiICsgKHRoaXMuY29uZmlnLnBhcmFsbGVsID8gXCJSZXBsYWNlIHdpdGggYHR5cGU6ICdwYXJhbGxlbCdgXCIgOiBcIlVzZSBgdHlwZTogJ1wiICsgdGhpcy50eXBlICsgXCInYFwiKSArIFwiIGluIHRoZSBjb25maWcgZm9yIHN0YXRlIG5vZGUgJ1wiICsgdGhpcy5pZCArIFwiJyBpbnN0ZWFkLlwiKTtcbiAgICB9XG5cbiAgICB0aGlzLmluaXRpYWwgPSB0aGlzLmNvbmZpZy5pbml0aWFsO1xuICAgIHRoaXMuc3RhdGVzID0gdGhpcy5jb25maWcuc3RhdGVzID8gbWFwVmFsdWVzKHRoaXMuY29uZmlnLnN0YXRlcywgZnVuY3Rpb24gKHN0YXRlQ29uZmlnLCBrZXkpIHtcbiAgICAgIHZhciBfYTtcblxuICAgICAgdmFyIHN0YXRlTm9kZSA9IG5ldyBTdGF0ZU5vZGUoc3RhdGVDb25maWcsIHtcbiAgICAgICAgX3BhcmVudDogX3RoaXMsXG4gICAgICAgIF9rZXk6IGtleVxuICAgICAgfSk7XG4gICAgICBPYmplY3QuYXNzaWduKF90aGlzLmlkTWFwLCBfX2Fzc2lnbigoX2EgPSB7fSwgX2Fbc3RhdGVOb2RlLmlkXSA9IHN0YXRlTm9kZSwgX2EpLCBzdGF0ZU5vZGUuaWRNYXApKTtcbiAgICAgIHJldHVybiBzdGF0ZU5vZGU7XG4gICAgfSkgOiBFTVBUWV9PQkpFQ1Q7IC8vIERvY3VtZW50IG9yZGVyXG5cbiAgICB2YXIgb3JkZXIgPSAwO1xuXG4gICAgZnVuY3Rpb24gZGZzKHN0YXRlTm9kZSkge1xuICAgICAgdmFyIGVfMSwgX2E7XG5cbiAgICAgIHN0YXRlTm9kZS5vcmRlciA9IG9yZGVyKys7XG5cbiAgICAgIHRyeSB7XG4gICAgICAgIGZvciAodmFyIF9iID0gX192YWx1ZXMoZ2V0Q2hpbGRyZW4oc3RhdGVOb2RlKSksIF9jID0gX2IubmV4dCgpOyAhX2MuZG9uZTsgX2MgPSBfYi5uZXh0KCkpIHtcbiAgICAgICAgICB2YXIgY2hpbGQgPSBfYy52YWx1ZTtcbiAgICAgICAgICBkZnMoY2hpbGQpO1xuICAgICAgICB9XG4gICAgICB9IGNhdGNoIChlXzFfMSkge1xuICAgICAgICBlXzEgPSB7XG4gICAgICAgICAgZXJyb3I6IGVfMV8xXG4gICAgICAgIH07XG4gICAgICB9IGZpbmFsbHkge1xuICAgICAgICB0cnkge1xuICAgICAgICAgIGlmIChfYyAmJiAhX2MuZG9uZSAmJiAoX2EgPSBfYi5yZXR1cm4pKSBfYS5jYWxsKF9iKTtcbiAgICAgICAgfSBmaW5hbGx5IHtcbiAgICAgICAgICBpZiAoZV8xKSB0aHJvdyBlXzEuZXJyb3I7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICBkZnModGhpcyk7IC8vIEhpc3RvcnkgY29uZmlnXG5cbiAgICB0aGlzLmhpc3RvcnkgPSB0aGlzLmNvbmZpZy5oaXN0b3J5ID09PSB0cnVlID8gJ3NoYWxsb3cnIDogdGhpcy5jb25maWcuaGlzdG9yeSB8fCBmYWxzZTtcbiAgICB0aGlzLl90cmFuc2llbnQgPSAhIXRoaXMuY29uZmlnLmFsd2F5cyB8fCAoIXRoaXMuY29uZmlnLm9uID8gZmFsc2UgOiBBcnJheS5pc0FycmF5KHRoaXMuY29uZmlnLm9uKSA/IHRoaXMuY29uZmlnLm9uLnNvbWUoZnVuY3Rpb24gKF9hKSB7XG4gICAgICB2YXIgZXZlbnQgPSBfYS5ldmVudDtcbiAgICAgIHJldHVybiBldmVudCA9PT0gTlVMTF9FVkVOVDtcbiAgICB9KSA6IE5VTExfRVZFTlQgaW4gdGhpcy5jb25maWcub24pO1xuICAgIHRoaXMuc3RyaWN0ID0gISF0aGlzLmNvbmZpZy5zdHJpY3Q7IC8vIFRPRE86IGRlcHJlY2F0ZSAoZW50cnkpXG5cbiAgICB0aGlzLm9uRW50cnkgPSB0b0FycmF5KHRoaXMuY29uZmlnLmVudHJ5IHx8IHRoaXMuY29uZmlnLm9uRW50cnkpLm1hcChmdW5jdGlvbiAoYWN0aW9uKSB7XG4gICAgICByZXR1cm4gdG9BY3Rpb25PYmplY3QoYWN0aW9uKTtcbiAgICB9KTsgLy8gVE9ETzogZGVwcmVjYXRlIChleGl0KVxuXG4gICAgdGhpcy5vbkV4aXQgPSB0b0FycmF5KHRoaXMuY29uZmlnLmV4aXQgfHwgdGhpcy5jb25maWcub25FeGl0KS5tYXAoZnVuY3Rpb24gKGFjdGlvbikge1xuICAgICAgcmV0dXJuIHRvQWN0aW9uT2JqZWN0KGFjdGlvbik7XG4gICAgfSk7XG4gICAgdGhpcy5tZXRhID0gdGhpcy5jb25maWcubWV0YTtcbiAgICB0aGlzLmRvbmVEYXRhID0gdGhpcy50eXBlID09PSAnZmluYWwnID8gdGhpcy5jb25maWcuZGF0YSA6IHVuZGVmaW5lZDtcbiAgICB0aGlzLmludm9rZSA9IHRvQXJyYXkodGhpcy5jb25maWcuaW52b2tlKS5tYXAoZnVuY3Rpb24gKGludm9rZUNvbmZpZywgaSkge1xuICAgICAgdmFyIF9hLCBfYjtcblxuICAgICAgaWYgKGlzTWFjaGluZShpbnZva2VDb25maWcpKSB7XG4gICAgICAgIF90aGlzLm1hY2hpbmUub3B0aW9ucy5zZXJ2aWNlcyA9IF9fYXNzaWduKChfYSA9IHt9LCBfYVtpbnZva2VDb25maWcuaWRdID0gaW52b2tlQ29uZmlnLCBfYSksIF90aGlzLm1hY2hpbmUub3B0aW9ucy5zZXJ2aWNlcyk7XG4gICAgICAgIHJldHVybiB0b0ludm9rZURlZmluaXRpb24oe1xuICAgICAgICAgIHNyYzogaW52b2tlQ29uZmlnLmlkLFxuICAgICAgICAgIGlkOiBpbnZva2VDb25maWcuaWRcbiAgICAgICAgfSk7XG4gICAgICB9IGVsc2UgaWYgKGlzU3RyaW5nKGludm9rZUNvbmZpZy5zcmMpKSB7XG4gICAgICAgIHJldHVybiB0b0ludm9rZURlZmluaXRpb24oX19hc3NpZ24oX19hc3NpZ24oe30sIGludm9rZUNvbmZpZyksIHtcbiAgICAgICAgICBpZDogaW52b2tlQ29uZmlnLmlkIHx8IGludm9rZUNvbmZpZy5zcmMsXG4gICAgICAgICAgc3JjOiBpbnZva2VDb25maWcuc3JjXG4gICAgICAgIH0pKTtcbiAgICAgIH0gZWxzZSBpZiAoaXNNYWNoaW5lKGludm9rZUNvbmZpZy5zcmMpIHx8IGlzRnVuY3Rpb24oaW52b2tlQ29uZmlnLnNyYykpIHtcbiAgICAgICAgdmFyIGludm9rZVNyYyA9IF90aGlzLmlkICsgXCI6aW52b2NhdGlvbltcIiArIGkgKyBcIl1cIjsgLy8gVE9ETzogdXRpbCBmdW5jdGlvblxuXG4gICAgICAgIF90aGlzLm1hY2hpbmUub3B0aW9ucy5zZXJ2aWNlcyA9IF9fYXNzaWduKChfYiA9IHt9LCBfYltpbnZva2VTcmNdID0gaW52b2tlQ29uZmlnLnNyYywgX2IpLCBfdGhpcy5tYWNoaW5lLm9wdGlvbnMuc2VydmljZXMpO1xuICAgICAgICByZXR1cm4gdG9JbnZva2VEZWZpbml0aW9uKF9fYXNzaWduKF9fYXNzaWduKHtcbiAgICAgICAgICBpZDogaW52b2tlU3JjXG4gICAgICAgIH0sIGludm9rZUNvbmZpZyksIHtcbiAgICAgICAgICBzcmM6IGludm9rZVNyY1xuICAgICAgICB9KSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB2YXIgaW52b2tlU291cmNlID0gaW52b2tlQ29uZmlnLnNyYztcbiAgICAgICAgcmV0dXJuIHRvSW52b2tlRGVmaW5pdGlvbihfX2Fzc2lnbihfX2Fzc2lnbih7XG4gICAgICAgICAgaWQ6IGludm9rZVNvdXJjZS50eXBlXG4gICAgICAgIH0sIGludm9rZUNvbmZpZyksIHtcbiAgICAgICAgICBzcmM6IGludm9rZVNvdXJjZVxuICAgICAgICB9KSk7XG4gICAgICB9XG4gICAgfSk7XG4gICAgdGhpcy5hY3Rpdml0aWVzID0gdG9BcnJheSh0aGlzLmNvbmZpZy5hY3Rpdml0aWVzKS5jb25jYXQodGhpcy5pbnZva2UpLm1hcChmdW5jdGlvbiAoYWN0aXZpdHkpIHtcbiAgICAgIHJldHVybiB0b0FjdGl2aXR5RGVmaW5pdGlvbihhY3Rpdml0eSk7XG4gICAgfSk7XG4gICAgdGhpcy50cmFuc2l0aW9uID0gdGhpcy50cmFuc2l0aW9uLmJpbmQodGhpcyk7IC8vIFRPRE86IHRoaXMgaXMgdGhlIHJlYWwgZml4IGZvciBpbml0aWFsaXphdGlvbiBvbmNlXG4gICAgLy8gc3RhdGUgbm9kZSBnZXR0ZXJzIGFyZSBkZXByZWNhdGVkXG4gICAgLy8gaWYgKCF0aGlzLnBhcmVudCkge1xuICAgIC8vICAgdGhpcy5faW5pdCgpO1xuICAgIC8vIH1cbiAgfVxuXG4gIFN0YXRlTm9kZS5wcm90b3R5cGUuX2luaXQgPSBmdW5jdGlvbiAoKSB7XG4gICAgaWYgKHRoaXMuX19jYWNoZS50cmFuc2l0aW9ucykge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGdldEFsbFN0YXRlTm9kZXModGhpcykuZm9yRWFjaChmdW5jdGlvbiAoc3RhdGVOb2RlKSB7XG4gICAgICByZXR1cm4gc3RhdGVOb2RlLm9uO1xuICAgIH0pO1xuICB9O1xuICAvKipcclxuICAgKiBDbG9uZXMgdGhpcyBzdGF0ZSBtYWNoaW5lIHdpdGggY3VzdG9tIG9wdGlvbnMgYW5kIGNvbnRleHQuXHJcbiAgICpcclxuICAgKiBAcGFyYW0gb3B0aW9ucyBPcHRpb25zIChhY3Rpb25zLCBndWFyZHMsIGFjdGl2aXRpZXMsIHNlcnZpY2VzKSB0byByZWN1cnNpdmVseSBtZXJnZSB3aXRoIHRoZSBleGlzdGluZyBvcHRpb25zLlxyXG4gICAqIEBwYXJhbSBjb250ZXh0IEN1c3RvbSBjb250ZXh0ICh3aWxsIG92ZXJyaWRlIHByZWRlZmluZWQgY29udGV4dClcclxuICAgKi9cblxuXG4gIFN0YXRlTm9kZS5wcm90b3R5cGUud2l0aENvbmZpZyA9IGZ1bmN0aW9uIChvcHRpb25zLCBjb250ZXh0KSB7XG4gICAgaWYgKGNvbnRleHQgPT09IHZvaWQgMCkge1xuICAgICAgY29udGV4dCA9IHRoaXMuY29udGV4dDtcbiAgICB9XG5cbiAgICB2YXIgX2EgPSB0aGlzLm9wdGlvbnMsXG4gICAgICAgIGFjdGlvbnMgPSBfYS5hY3Rpb25zLFxuICAgICAgICBhY3Rpdml0aWVzID0gX2EuYWN0aXZpdGllcyxcbiAgICAgICAgZ3VhcmRzID0gX2EuZ3VhcmRzLFxuICAgICAgICBzZXJ2aWNlcyA9IF9hLnNlcnZpY2VzLFxuICAgICAgICBkZWxheXMgPSBfYS5kZWxheXM7XG4gICAgcmV0dXJuIG5ldyBTdGF0ZU5vZGUodGhpcy5jb25maWcsIHtcbiAgICAgIGFjdGlvbnM6IF9fYXNzaWduKF9fYXNzaWduKHt9LCBhY3Rpb25zKSwgb3B0aW9ucy5hY3Rpb25zKSxcbiAgICAgIGFjdGl2aXRpZXM6IF9fYXNzaWduKF9fYXNzaWduKHt9LCBhY3Rpdml0aWVzKSwgb3B0aW9ucy5hY3Rpdml0aWVzKSxcbiAgICAgIGd1YXJkczogX19hc3NpZ24oX19hc3NpZ24oe30sIGd1YXJkcyksIG9wdGlvbnMuZ3VhcmRzKSxcbiAgICAgIHNlcnZpY2VzOiBfX2Fzc2lnbihfX2Fzc2lnbih7fSwgc2VydmljZXMpLCBvcHRpb25zLnNlcnZpY2VzKSxcbiAgICAgIGRlbGF5czogX19hc3NpZ24oX19hc3NpZ24oe30sIGRlbGF5cyksIG9wdGlvbnMuZGVsYXlzKVxuICAgIH0sIGNvbnRleHQpO1xuICB9O1xuICAvKipcclxuICAgKiBDbG9uZXMgdGhpcyBzdGF0ZSBtYWNoaW5lIHdpdGggY3VzdG9tIGNvbnRleHQuXHJcbiAgICpcclxuICAgKiBAcGFyYW0gY29udGV4dCBDdXN0b20gY29udGV4dCAod2lsbCBvdmVycmlkZSBwcmVkZWZpbmVkIGNvbnRleHQsIG5vdCByZWN1cnNpdmUpXHJcbiAgICovXG5cblxuICBTdGF0ZU5vZGUucHJvdG90eXBlLndpdGhDb250ZXh0ID0gZnVuY3Rpb24gKGNvbnRleHQpIHtcbiAgICByZXR1cm4gbmV3IFN0YXRlTm9kZSh0aGlzLmNvbmZpZywgdGhpcy5vcHRpb25zLCBjb250ZXh0KTtcbiAgfTtcblxuICBPYmplY3QuZGVmaW5lUHJvcGVydHkoU3RhdGVOb2RlLnByb3RvdHlwZSwgXCJkZWZpbml0aW9uXCIsIHtcbiAgICAvKipcclxuICAgICAqIFRoZSB3ZWxsLXN0cnVjdHVyZWQgc3RhdGUgbm9kZSBkZWZpbml0aW9uLlxyXG4gICAgICovXG4gICAgZ2V0OiBmdW5jdGlvbiAoKSB7XG4gICAgICByZXR1cm4ge1xuICAgICAgICBpZDogdGhpcy5pZCxcbiAgICAgICAga2V5OiB0aGlzLmtleSxcbiAgICAgICAgdmVyc2lvbjogdGhpcy52ZXJzaW9uLFxuICAgICAgICBjb250ZXh0OiB0aGlzLmNvbnRleHQsXG4gICAgICAgIHR5cGU6IHRoaXMudHlwZSxcbiAgICAgICAgaW5pdGlhbDogdGhpcy5pbml0aWFsLFxuICAgICAgICBoaXN0b3J5OiB0aGlzLmhpc3RvcnksXG4gICAgICAgIHN0YXRlczogbWFwVmFsdWVzKHRoaXMuc3RhdGVzLCBmdW5jdGlvbiAoc3RhdGUpIHtcbiAgICAgICAgICByZXR1cm4gc3RhdGUuZGVmaW5pdGlvbjtcbiAgICAgICAgfSksXG4gICAgICAgIG9uOiB0aGlzLm9uLFxuICAgICAgICB0cmFuc2l0aW9uczogdGhpcy50cmFuc2l0aW9ucyxcbiAgICAgICAgZW50cnk6IHRoaXMub25FbnRyeSxcbiAgICAgICAgZXhpdDogdGhpcy5vbkV4aXQsXG4gICAgICAgIGFjdGl2aXRpZXM6IHRoaXMuYWN0aXZpdGllcyB8fCBbXSxcbiAgICAgICAgbWV0YTogdGhpcy5tZXRhLFxuICAgICAgICBvcmRlcjogdGhpcy5vcmRlciB8fCAtMSxcbiAgICAgICAgZGF0YTogdGhpcy5kb25lRGF0YSxcbiAgICAgICAgaW52b2tlOiB0aGlzLmludm9rZVxuICAgICAgfTtcbiAgICB9LFxuICAgIGVudW1lcmFibGU6IGZhbHNlLFxuICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZVxuICB9KTtcblxuICBTdGF0ZU5vZGUucHJvdG90eXBlLnRvSlNPTiA9IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gdGhpcy5kZWZpbml0aW9uO1xuICB9O1xuXG4gIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShTdGF0ZU5vZGUucHJvdG90eXBlLCBcIm9uXCIsIHtcbiAgICAvKipcclxuICAgICAqIFRoZSBtYXBwaW5nIG9mIGV2ZW50cyB0byB0cmFuc2l0aW9ucy5cclxuICAgICAqL1xuICAgIGdldDogZnVuY3Rpb24gKCkge1xuICAgICAgaWYgKHRoaXMuX19jYWNoZS5vbikge1xuICAgICAgICByZXR1cm4gdGhpcy5fX2NhY2hlLm9uO1xuICAgICAgfVxuXG4gICAgICB2YXIgdHJhbnNpdGlvbnMgPSB0aGlzLnRyYW5zaXRpb25zO1xuICAgICAgcmV0dXJuIHRoaXMuX19jYWNoZS5vbiA9IHRyYW5zaXRpb25zLnJlZHVjZShmdW5jdGlvbiAobWFwLCB0cmFuc2l0aW9uKSB7XG4gICAgICAgIG1hcFt0cmFuc2l0aW9uLmV2ZW50VHlwZV0gPSBtYXBbdHJhbnNpdGlvbi5ldmVudFR5cGVdIHx8IFtdO1xuICAgICAgICBtYXBbdHJhbnNpdGlvbi5ldmVudFR5cGVdLnB1c2godHJhbnNpdGlvbik7XG4gICAgICAgIHJldHVybiBtYXA7XG4gICAgICB9LCB7fSk7XG4gICAgfSxcbiAgICBlbnVtZXJhYmxlOiBmYWxzZSxcbiAgICBjb25maWd1cmFibGU6IHRydWVcbiAgfSk7XG4gIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShTdGF0ZU5vZGUucHJvdG90eXBlLCBcImFmdGVyXCIsIHtcbiAgICBnZXQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgIHJldHVybiB0aGlzLl9fY2FjaGUuZGVsYXllZFRyYW5zaXRpb25zIHx8ICh0aGlzLl9fY2FjaGUuZGVsYXllZFRyYW5zaXRpb25zID0gdGhpcy5nZXREZWxheWVkVHJhbnNpdGlvbnMoKSwgdGhpcy5fX2NhY2hlLmRlbGF5ZWRUcmFuc2l0aW9ucyk7XG4gICAgfSxcbiAgICBlbnVtZXJhYmxlOiBmYWxzZSxcbiAgICBjb25maWd1cmFibGU6IHRydWVcbiAgfSk7XG4gIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShTdGF0ZU5vZGUucHJvdG90eXBlLCBcInRyYW5zaXRpb25zXCIsIHtcbiAgICAvKipcclxuICAgICAqIEFsbCB0aGUgdHJhbnNpdGlvbnMgdGhhdCBjYW4gYmUgdGFrZW4gZnJvbSB0aGlzIHN0YXRlIG5vZGUuXHJcbiAgICAgKi9cbiAgICBnZXQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgIHJldHVybiB0aGlzLl9fY2FjaGUudHJhbnNpdGlvbnMgfHwgKHRoaXMuX19jYWNoZS50cmFuc2l0aW9ucyA9IHRoaXMuZm9ybWF0VHJhbnNpdGlvbnMoKSwgdGhpcy5fX2NhY2hlLnRyYW5zaXRpb25zKTtcbiAgICB9LFxuICAgIGVudW1lcmFibGU6IGZhbHNlLFxuICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZVxuICB9KTtcblxuICBTdGF0ZU5vZGUucHJvdG90eXBlLmdldENhbmRpZGF0ZXMgPSBmdW5jdGlvbiAoZXZlbnROYW1lKSB7XG4gICAgaWYgKHRoaXMuX19jYWNoZS5jYW5kaWRhdGVzW2V2ZW50TmFtZV0pIHtcbiAgICAgIHJldHVybiB0aGlzLl9fY2FjaGUuY2FuZGlkYXRlc1tldmVudE5hbWVdO1xuICAgIH1cblxuICAgIHZhciB0cmFuc2llbnQgPSBldmVudE5hbWUgPT09IE5VTExfRVZFTlQ7XG4gICAgdmFyIGNhbmRpZGF0ZXMgPSB0aGlzLnRyYW5zaXRpb25zLmZpbHRlcihmdW5jdGlvbiAodHJhbnNpdGlvbikge1xuICAgICAgdmFyIHNhbWVFdmVudFR5cGUgPSB0cmFuc2l0aW9uLmV2ZW50VHlwZSA9PT0gZXZlbnROYW1lOyAvLyBudWxsIGV2ZW50cyBzaG91bGQgb25seSBtYXRjaCBhZ2FpbnN0IGV2ZW50bGVzcyB0cmFuc2l0aW9uc1xuXG4gICAgICByZXR1cm4gdHJhbnNpZW50ID8gc2FtZUV2ZW50VHlwZSA6IHNhbWVFdmVudFR5cGUgfHwgdHJhbnNpdGlvbi5ldmVudFR5cGUgPT09IFdJTERDQVJEO1xuICAgIH0pO1xuICAgIHRoaXMuX19jYWNoZS5jYW5kaWRhdGVzW2V2ZW50TmFtZV0gPSBjYW5kaWRhdGVzO1xuICAgIHJldHVybiBjYW5kaWRhdGVzO1xuICB9O1xuICAvKipcclxuICAgKiBBbGwgZGVsYXllZCB0cmFuc2l0aW9ucyBmcm9tIHRoZSBjb25maWcuXHJcbiAgICovXG5cblxuICBTdGF0ZU5vZGUucHJvdG90eXBlLmdldERlbGF5ZWRUcmFuc2l0aW9ucyA9IGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgX3RoaXMgPSB0aGlzO1xuXG4gICAgdmFyIGFmdGVyQ29uZmlnID0gdGhpcy5jb25maWcuYWZ0ZXI7XG5cbiAgICBpZiAoIWFmdGVyQ29uZmlnKSB7XG4gICAgICByZXR1cm4gW107XG4gICAgfVxuXG4gICAgdmFyIG11dGF0ZUVudHJ5RXhpdCA9IGZ1bmN0aW9uIChkZWxheSwgaSkge1xuICAgICAgdmFyIGRlbGF5UmVmID0gaXNGdW5jdGlvbihkZWxheSkgPyBfdGhpcy5pZCArIFwiOmRlbGF5W1wiICsgaSArIFwiXVwiIDogZGVsYXk7XG4gICAgICB2YXIgZXZlbnRUeXBlID0gYWZ0ZXIoZGVsYXlSZWYsIF90aGlzLmlkKTtcblxuICAgICAgX3RoaXMub25FbnRyeS5wdXNoKHNlbmQoZXZlbnRUeXBlLCB7XG4gICAgICAgIGRlbGF5OiBkZWxheVxuICAgICAgfSkpO1xuXG4gICAgICBfdGhpcy5vbkV4aXQucHVzaChjYW5jZWwoZXZlbnRUeXBlKSk7XG5cbiAgICAgIHJldHVybiBldmVudFR5cGU7XG4gICAgfTtcblxuICAgIHZhciBkZWxheWVkVHJhbnNpdGlvbnMgPSBpc0FycmF5KGFmdGVyQ29uZmlnKSA/IGFmdGVyQ29uZmlnLm1hcChmdW5jdGlvbiAodHJhbnNpdGlvbiwgaSkge1xuICAgICAgdmFyIGV2ZW50VHlwZSA9IG11dGF0ZUVudHJ5RXhpdCh0cmFuc2l0aW9uLmRlbGF5LCBpKTtcbiAgICAgIHJldHVybiBfX2Fzc2lnbihfX2Fzc2lnbih7fSwgdHJhbnNpdGlvbiksIHtcbiAgICAgICAgZXZlbnQ6IGV2ZW50VHlwZVxuICAgICAgfSk7XG4gICAgfSkgOiBmbGF0dGVuKGtleXMoYWZ0ZXJDb25maWcpLm1hcChmdW5jdGlvbiAoZGVsYXksIGkpIHtcbiAgICAgIHZhciBjb25maWdUcmFuc2l0aW9uID0gYWZ0ZXJDb25maWdbZGVsYXldO1xuICAgICAgdmFyIHJlc29sdmVkVHJhbnNpdGlvbiA9IGlzU3RyaW5nKGNvbmZpZ1RyYW5zaXRpb24pID8ge1xuICAgICAgICB0YXJnZXQ6IGNvbmZpZ1RyYW5zaXRpb25cbiAgICAgIH0gOiBjb25maWdUcmFuc2l0aW9uO1xuICAgICAgdmFyIHJlc29sdmVkRGVsYXkgPSAhaXNOYU4oK2RlbGF5KSA/ICtkZWxheSA6IGRlbGF5O1xuICAgICAgdmFyIGV2ZW50VHlwZSA9IG11dGF0ZUVudHJ5RXhpdChyZXNvbHZlZERlbGF5LCBpKTtcbiAgICAgIHJldHVybiB0b0FycmF5KHJlc29sdmVkVHJhbnNpdGlvbikubWFwKGZ1bmN0aW9uICh0cmFuc2l0aW9uKSB7XG4gICAgICAgIHJldHVybiBfX2Fzc2lnbihfX2Fzc2lnbih7fSwgdHJhbnNpdGlvbiksIHtcbiAgICAgICAgICBldmVudDogZXZlbnRUeXBlLFxuICAgICAgICAgIGRlbGF5OiByZXNvbHZlZERlbGF5XG4gICAgICAgIH0pO1xuICAgICAgfSk7XG4gICAgfSkpO1xuICAgIHJldHVybiBkZWxheWVkVHJhbnNpdGlvbnMubWFwKGZ1bmN0aW9uIChkZWxheWVkVHJhbnNpdGlvbikge1xuICAgICAgdmFyIGRlbGF5ID0gZGVsYXllZFRyYW5zaXRpb24uZGVsYXk7XG4gICAgICByZXR1cm4gX19hc3NpZ24oX19hc3NpZ24oe30sIF90aGlzLmZvcm1hdFRyYW5zaXRpb24oZGVsYXllZFRyYW5zaXRpb24pKSwge1xuICAgICAgICBkZWxheTogZGVsYXlcbiAgICAgIH0pO1xuICAgIH0pO1xuICB9O1xuICAvKipcclxuICAgKiBSZXR1cm5zIHRoZSBzdGF0ZSBub2RlcyByZXByZXNlbnRlZCBieSB0aGUgY3VycmVudCBzdGF0ZSB2YWx1ZS5cclxuICAgKlxyXG4gICAqIEBwYXJhbSBzdGF0ZSBUaGUgc3RhdGUgdmFsdWUgb3IgU3RhdGUgaW5zdGFuY2VcclxuICAgKi9cblxuXG4gIFN0YXRlTm9kZS5wcm90b3R5cGUuZ2V0U3RhdGVOb2RlcyA9IGZ1bmN0aW9uIChzdGF0ZSkge1xuICAgIHZhciBfYTtcblxuICAgIHZhciBfdGhpcyA9IHRoaXM7XG5cbiAgICBpZiAoIXN0YXRlKSB7XG4gICAgICByZXR1cm4gW107XG4gICAgfVxuXG4gICAgdmFyIHN0YXRlVmFsdWUgPSBzdGF0ZSBpbnN0YW5jZW9mIFN0YXRlID8gc3RhdGUudmFsdWUgOiB0b1N0YXRlVmFsdWUoc3RhdGUsIHRoaXMuZGVsaW1pdGVyKTtcblxuICAgIGlmIChpc1N0cmluZyhzdGF0ZVZhbHVlKSkge1xuICAgICAgdmFyIGluaXRpYWxTdGF0ZVZhbHVlID0gdGhpcy5nZXRTdGF0ZU5vZGUoc3RhdGVWYWx1ZSkuaW5pdGlhbDtcbiAgICAgIHJldHVybiBpbml0aWFsU3RhdGVWYWx1ZSAhPT0gdW5kZWZpbmVkID8gdGhpcy5nZXRTdGF0ZU5vZGVzKChfYSA9IHt9LCBfYVtzdGF0ZVZhbHVlXSA9IGluaXRpYWxTdGF0ZVZhbHVlLCBfYSkpIDogW3RoaXMuc3RhdGVzW3N0YXRlVmFsdWVdXTtcbiAgICB9XG5cbiAgICB2YXIgc3ViU3RhdGVLZXlzID0ga2V5cyhzdGF0ZVZhbHVlKTtcbiAgICB2YXIgc3ViU3RhdGVOb2RlcyA9IHN1YlN0YXRlS2V5cy5tYXAoZnVuY3Rpb24gKHN1YlN0YXRlS2V5KSB7XG4gICAgICByZXR1cm4gX3RoaXMuZ2V0U3RhdGVOb2RlKHN1YlN0YXRlS2V5KTtcbiAgICB9KTtcbiAgICByZXR1cm4gc3ViU3RhdGVOb2Rlcy5jb25jYXQoc3ViU3RhdGVLZXlzLnJlZHVjZShmdW5jdGlvbiAoYWxsU3ViU3RhdGVOb2Rlcywgc3ViU3RhdGVLZXkpIHtcbiAgICAgIHZhciBzdWJTdGF0ZU5vZGUgPSBfdGhpcy5nZXRTdGF0ZU5vZGUoc3ViU3RhdGVLZXkpLmdldFN0YXRlTm9kZXMoc3RhdGVWYWx1ZVtzdWJTdGF0ZUtleV0pO1xuXG4gICAgICByZXR1cm4gYWxsU3ViU3RhdGVOb2Rlcy5jb25jYXQoc3ViU3RhdGVOb2RlKTtcbiAgICB9LCBbXSkpO1xuICB9O1xuICAvKipcclxuICAgKiBSZXR1cm5zIGB0cnVlYCBpZiB0aGlzIHN0YXRlIG5vZGUgZXhwbGljaXRseSBoYW5kbGVzIHRoZSBnaXZlbiBldmVudC5cclxuICAgKlxyXG4gICAqIEBwYXJhbSBldmVudCBUaGUgZXZlbnQgaW4gcXVlc3Rpb25cclxuICAgKi9cblxuXG4gIFN0YXRlTm9kZS5wcm90b3R5cGUuaGFuZGxlcyA9IGZ1bmN0aW9uIChldmVudCkge1xuICAgIHZhciBldmVudFR5cGUgPSBnZXRFdmVudFR5cGUoZXZlbnQpO1xuICAgIHJldHVybiB0aGlzLmV2ZW50cy5pbmNsdWRlcyhldmVudFR5cGUpO1xuICB9O1xuICAvKipcclxuICAgKiBSZXNvbHZlcyB0aGUgZ2l2ZW4gYHN0YXRlYCB0byBhIG5ldyBgU3RhdGVgIGluc3RhbmNlIHJlbGF0aXZlIHRvIHRoaXMgbWFjaGluZS5cclxuICAgKlxyXG4gICAqIFRoaXMgZW5zdXJlcyB0aGF0IGAuZXZlbnRzYCBhbmQgYC5uZXh0RXZlbnRzYCByZXByZXNlbnQgdGhlIGNvcnJlY3QgdmFsdWVzLlxyXG4gICAqXHJcbiAgICogQHBhcmFtIHN0YXRlIFRoZSBzdGF0ZSB0byByZXNvbHZlXHJcbiAgICovXG5cblxuICBTdGF0ZU5vZGUucHJvdG90eXBlLnJlc29sdmVTdGF0ZSA9IGZ1bmN0aW9uIChzdGF0ZSkge1xuICAgIHZhciBjb25maWd1cmF0aW9uID0gQXJyYXkuZnJvbShnZXRDb25maWd1cmF0aW9uKFtdLCB0aGlzLmdldFN0YXRlTm9kZXMoc3RhdGUudmFsdWUpKSk7XG4gICAgcmV0dXJuIG5ldyBTdGF0ZShfX2Fzc2lnbihfX2Fzc2lnbih7fSwgc3RhdGUpLCB7XG4gICAgICB2YWx1ZTogdGhpcy5yZXNvbHZlKHN0YXRlLnZhbHVlKSxcbiAgICAgIGNvbmZpZ3VyYXRpb246IGNvbmZpZ3VyYXRpb25cbiAgICB9KSk7XG4gIH07XG5cbiAgU3RhdGVOb2RlLnByb3RvdHlwZS50cmFuc2l0aW9uTGVhZk5vZGUgPSBmdW5jdGlvbiAoc3RhdGVWYWx1ZSwgc3RhdGUsIF9ldmVudCkge1xuICAgIHZhciBzdGF0ZU5vZGUgPSB0aGlzLmdldFN0YXRlTm9kZShzdGF0ZVZhbHVlKTtcbiAgICB2YXIgbmV4dCA9IHN0YXRlTm9kZS5uZXh0KHN0YXRlLCBfZXZlbnQpO1xuXG4gICAgaWYgKCFuZXh0IHx8ICFuZXh0LnRyYW5zaXRpb25zLmxlbmd0aCkge1xuICAgICAgcmV0dXJuIHRoaXMubmV4dChzdGF0ZSwgX2V2ZW50KTtcbiAgICB9XG5cbiAgICByZXR1cm4gbmV4dDtcbiAgfTtcblxuICBTdGF0ZU5vZGUucHJvdG90eXBlLnRyYW5zaXRpb25Db21wb3VuZE5vZGUgPSBmdW5jdGlvbiAoc3RhdGVWYWx1ZSwgc3RhdGUsIF9ldmVudCkge1xuICAgIHZhciBzdWJTdGF0ZUtleXMgPSBrZXlzKHN0YXRlVmFsdWUpO1xuICAgIHZhciBzdGF0ZU5vZGUgPSB0aGlzLmdldFN0YXRlTm9kZShzdWJTdGF0ZUtleXNbMF0pO1xuXG4gICAgdmFyIG5leHQgPSBzdGF0ZU5vZGUuX3RyYW5zaXRpb24oc3RhdGVWYWx1ZVtzdWJTdGF0ZUtleXNbMF1dLCBzdGF0ZSwgX2V2ZW50KTtcblxuICAgIGlmICghbmV4dCB8fCAhbmV4dC50cmFuc2l0aW9ucy5sZW5ndGgpIHtcbiAgICAgIHJldHVybiB0aGlzLm5leHQoc3RhdGUsIF9ldmVudCk7XG4gICAgfVxuXG4gICAgcmV0dXJuIG5leHQ7XG4gIH07XG5cbiAgU3RhdGVOb2RlLnByb3RvdHlwZS50cmFuc2l0aW9uUGFyYWxsZWxOb2RlID0gZnVuY3Rpb24gKHN0YXRlVmFsdWUsIHN0YXRlLCBfZXZlbnQpIHtcbiAgICB2YXIgZV8yLCBfYTtcblxuICAgIHZhciB0cmFuc2l0aW9uTWFwID0ge307XG5cbiAgICB0cnkge1xuICAgICAgZm9yICh2YXIgX2IgPSBfX3ZhbHVlcyhrZXlzKHN0YXRlVmFsdWUpKSwgX2MgPSBfYi5uZXh0KCk7ICFfYy5kb25lOyBfYyA9IF9iLm5leHQoKSkge1xuICAgICAgICB2YXIgc3ViU3RhdGVLZXkgPSBfYy52YWx1ZTtcbiAgICAgICAgdmFyIHN1YlN0YXRlVmFsdWUgPSBzdGF0ZVZhbHVlW3N1YlN0YXRlS2V5XTtcblxuICAgICAgICBpZiAoIXN1YlN0YXRlVmFsdWUpIHtcbiAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgfVxuXG4gICAgICAgIHZhciBzdWJTdGF0ZU5vZGUgPSB0aGlzLmdldFN0YXRlTm9kZShzdWJTdGF0ZUtleSk7XG5cbiAgICAgICAgdmFyIG5leHQgPSBzdWJTdGF0ZU5vZGUuX3RyYW5zaXRpb24oc3ViU3RhdGVWYWx1ZSwgc3RhdGUsIF9ldmVudCk7XG5cbiAgICAgICAgaWYgKG5leHQpIHtcbiAgICAgICAgICB0cmFuc2l0aW9uTWFwW3N1YlN0YXRlS2V5XSA9IG5leHQ7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9IGNhdGNoIChlXzJfMSkge1xuICAgICAgZV8yID0ge1xuICAgICAgICBlcnJvcjogZV8yXzFcbiAgICAgIH07XG4gICAgfSBmaW5hbGx5IHtcbiAgICAgIHRyeSB7XG4gICAgICAgIGlmIChfYyAmJiAhX2MuZG9uZSAmJiAoX2EgPSBfYi5yZXR1cm4pKSBfYS5jYWxsKF9iKTtcbiAgICAgIH0gZmluYWxseSB7XG4gICAgICAgIGlmIChlXzIpIHRocm93IGVfMi5lcnJvcjtcbiAgICAgIH1cbiAgICB9XG5cbiAgICB2YXIgc3RhdGVUcmFuc2l0aW9ucyA9IGtleXModHJhbnNpdGlvbk1hcCkubWFwKGZ1bmN0aW9uIChrZXkpIHtcbiAgICAgIHJldHVybiB0cmFuc2l0aW9uTWFwW2tleV07XG4gICAgfSk7XG4gICAgdmFyIGVuYWJsZWRUcmFuc2l0aW9ucyA9IGZsYXR0ZW4oc3RhdGVUcmFuc2l0aW9ucy5tYXAoZnVuY3Rpb24gKHN0KSB7XG4gICAgICByZXR1cm4gc3QudHJhbnNpdGlvbnM7XG4gICAgfSkpO1xuICAgIHZhciB3aWxsVHJhbnNpdGlvbiA9IHN0YXRlVHJhbnNpdGlvbnMuc29tZShmdW5jdGlvbiAoc3QpIHtcbiAgICAgIHJldHVybiBzdC50cmFuc2l0aW9ucy5sZW5ndGggPiAwO1xuICAgIH0pO1xuXG4gICAgaWYgKCF3aWxsVHJhbnNpdGlvbikge1xuICAgICAgcmV0dXJuIHRoaXMubmV4dChzdGF0ZSwgX2V2ZW50KTtcbiAgICB9XG5cbiAgICB2YXIgZW50cnlOb2RlcyA9IGZsYXR0ZW4oc3RhdGVUcmFuc2l0aW9ucy5tYXAoZnVuY3Rpb24gKHQpIHtcbiAgICAgIHJldHVybiB0LmVudHJ5U2V0O1xuICAgIH0pKTtcbiAgICB2YXIgY29uZmlndXJhdGlvbiA9IGZsYXR0ZW4oa2V5cyh0cmFuc2l0aW9uTWFwKS5tYXAoZnVuY3Rpb24gKGtleSkge1xuICAgICAgcmV0dXJuIHRyYW5zaXRpb25NYXBba2V5XS5jb25maWd1cmF0aW9uO1xuICAgIH0pKTtcbiAgICByZXR1cm4ge1xuICAgICAgdHJhbnNpdGlvbnM6IGVuYWJsZWRUcmFuc2l0aW9ucyxcbiAgICAgIGVudHJ5U2V0OiBlbnRyeU5vZGVzLFxuICAgICAgZXhpdFNldDogZmxhdHRlbihzdGF0ZVRyYW5zaXRpb25zLm1hcChmdW5jdGlvbiAodCkge1xuICAgICAgICByZXR1cm4gdC5leGl0U2V0O1xuICAgICAgfSkpLFxuICAgICAgY29uZmlndXJhdGlvbjogY29uZmlndXJhdGlvbixcbiAgICAgIHNvdXJjZTogc3RhdGUsXG4gICAgICBhY3Rpb25zOiBmbGF0dGVuKGtleXModHJhbnNpdGlvbk1hcCkubWFwKGZ1bmN0aW9uIChrZXkpIHtcbiAgICAgICAgcmV0dXJuIHRyYW5zaXRpb25NYXBba2V5XS5hY3Rpb25zO1xuICAgICAgfSkpXG4gICAgfTtcbiAgfTtcblxuICBTdGF0ZU5vZGUucHJvdG90eXBlLl90cmFuc2l0aW9uID0gZnVuY3Rpb24gKHN0YXRlVmFsdWUsIHN0YXRlLCBfZXZlbnQpIHtcbiAgICAvLyBsZWFmIG5vZGVcbiAgICBpZiAoaXNTdHJpbmcoc3RhdGVWYWx1ZSkpIHtcbiAgICAgIHJldHVybiB0aGlzLnRyYW5zaXRpb25MZWFmTm9kZShzdGF0ZVZhbHVlLCBzdGF0ZSwgX2V2ZW50KTtcbiAgICB9IC8vIGhpZXJhcmNoaWNhbCBub2RlXG5cblxuICAgIGlmIChrZXlzKHN0YXRlVmFsdWUpLmxlbmd0aCA9PT0gMSkge1xuICAgICAgcmV0dXJuIHRoaXMudHJhbnNpdGlvbkNvbXBvdW5kTm9kZShzdGF0ZVZhbHVlLCBzdGF0ZSwgX2V2ZW50KTtcbiAgICB9IC8vIG9ydGhvZ29uYWwgbm9kZVxuXG5cbiAgICByZXR1cm4gdGhpcy50cmFuc2l0aW9uUGFyYWxsZWxOb2RlKHN0YXRlVmFsdWUsIHN0YXRlLCBfZXZlbnQpO1xuICB9O1xuXG4gIFN0YXRlTm9kZS5wcm90b3R5cGUubmV4dCA9IGZ1bmN0aW9uIChzdGF0ZSwgX2V2ZW50KSB7XG4gICAgdmFyIGVfMywgX2E7XG5cbiAgICB2YXIgX3RoaXMgPSB0aGlzO1xuXG4gICAgdmFyIGV2ZW50TmFtZSA9IF9ldmVudC5uYW1lO1xuICAgIHZhciBhY3Rpb25zID0gW107XG4gICAgdmFyIG5leHRTdGF0ZU5vZGVzID0gW107XG4gICAgdmFyIHNlbGVjdGVkVHJhbnNpdGlvbjtcblxuICAgIHRyeSB7XG4gICAgICBmb3IgKHZhciBfYiA9IF9fdmFsdWVzKHRoaXMuZ2V0Q2FuZGlkYXRlcyhldmVudE5hbWUpKSwgX2MgPSBfYi5uZXh0KCk7ICFfYy5kb25lOyBfYyA9IF9iLm5leHQoKSkge1xuICAgICAgICB2YXIgY2FuZGlkYXRlID0gX2MudmFsdWU7XG4gICAgICAgIHZhciBjb25kID0gY2FuZGlkYXRlLmNvbmQsXG4gICAgICAgICAgICBzdGF0ZUluID0gY2FuZGlkYXRlLmluO1xuICAgICAgICB2YXIgcmVzb2x2ZWRDb250ZXh0ID0gc3RhdGUuY29udGV4dDtcbiAgICAgICAgdmFyIGlzSW5TdGF0ZSA9IHN0YXRlSW4gPyBpc1N0cmluZyhzdGF0ZUluKSAmJiBpc1N0YXRlSWQoc3RhdGVJbikgPyAvLyBDaGVjayBpZiBpbiBzdGF0ZSBieSBJRFxuICAgICAgICBzdGF0ZS5tYXRjaGVzKHRvU3RhdGVWYWx1ZSh0aGlzLmdldFN0YXRlTm9kZUJ5SWQoc3RhdGVJbikucGF0aCwgdGhpcy5kZWxpbWl0ZXIpKSA6IC8vIENoZWNrIGlmIGluIHN0YXRlIGJ5IHJlbGF0aXZlIGdyYW5kcGFyZW50XG4gICAgICAgIG1hdGNoZXNTdGF0ZSh0b1N0YXRlVmFsdWUoc3RhdGVJbiwgdGhpcy5kZWxpbWl0ZXIpLCBwYXRoKHRoaXMucGF0aC5zbGljZSgwLCAtMikpKHN0YXRlLnZhbHVlKSkgOiB0cnVlO1xuICAgICAgICB2YXIgZ3VhcmRQYXNzZWQgPSBmYWxzZTtcblxuICAgICAgICB0cnkge1xuICAgICAgICAgIGd1YXJkUGFzc2VkID0gIWNvbmQgfHwgZXZhbHVhdGVHdWFyZCh0aGlzLm1hY2hpbmUsIGNvbmQsIHJlc29sdmVkQ29udGV4dCwgX2V2ZW50LCBzdGF0ZSk7XG4gICAgICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIlVuYWJsZSB0byBldmFsdWF0ZSBndWFyZCAnXCIgKyAoY29uZC5uYW1lIHx8IGNvbmQudHlwZSkgKyBcIicgaW4gdHJhbnNpdGlvbiBmb3IgZXZlbnQgJ1wiICsgZXZlbnROYW1lICsgXCInIGluIHN0YXRlIG5vZGUgJ1wiICsgdGhpcy5pZCArIFwiJzpcXG5cIiArIGVyci5tZXNzYWdlKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChndWFyZFBhc3NlZCAmJiBpc0luU3RhdGUpIHtcbiAgICAgICAgICBpZiAoY2FuZGlkYXRlLnRhcmdldCAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICBuZXh0U3RhdGVOb2RlcyA9IGNhbmRpZGF0ZS50YXJnZXQ7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgYWN0aW9ucy5wdXNoLmFwcGx5KGFjdGlvbnMsIF9fc3ByZWFkKGNhbmRpZGF0ZS5hY3Rpb25zKSk7XG4gICAgICAgICAgc2VsZWN0ZWRUcmFuc2l0aW9uID0gY2FuZGlkYXRlO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSBjYXRjaCAoZV8zXzEpIHtcbiAgICAgIGVfMyA9IHtcbiAgICAgICAgZXJyb3I6IGVfM18xXG4gICAgICB9O1xuICAgIH0gZmluYWxseSB7XG4gICAgICB0cnkge1xuICAgICAgICBpZiAoX2MgJiYgIV9jLmRvbmUgJiYgKF9hID0gX2IucmV0dXJuKSkgX2EuY2FsbChfYik7XG4gICAgICB9IGZpbmFsbHkge1xuICAgICAgICBpZiAoZV8zKSB0aHJvdyBlXzMuZXJyb3I7XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKCFzZWxlY3RlZFRyYW5zaXRpb24pIHtcbiAgICAgIHJldHVybiB1bmRlZmluZWQ7XG4gICAgfVxuXG4gICAgaWYgKCFuZXh0U3RhdGVOb2Rlcy5sZW5ndGgpIHtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIHRyYW5zaXRpb25zOiBbc2VsZWN0ZWRUcmFuc2l0aW9uXSxcbiAgICAgICAgZW50cnlTZXQ6IFtdLFxuICAgICAgICBleGl0U2V0OiBbXSxcbiAgICAgICAgY29uZmlndXJhdGlvbjogc3RhdGUudmFsdWUgPyBbdGhpc10gOiBbXSxcbiAgICAgICAgc291cmNlOiBzdGF0ZSxcbiAgICAgICAgYWN0aW9uczogYWN0aW9uc1xuICAgICAgfTtcbiAgICB9XG5cbiAgICB2YXIgYWxsTmV4dFN0YXRlTm9kZXMgPSBmbGF0dGVuKG5leHRTdGF0ZU5vZGVzLm1hcChmdW5jdGlvbiAoc3RhdGVOb2RlKSB7XG4gICAgICByZXR1cm4gX3RoaXMuZ2V0UmVsYXRpdmVTdGF0ZU5vZGVzKHN0YXRlTm9kZSwgc3RhdGUuaGlzdG9yeVZhbHVlKTtcbiAgICB9KSk7XG4gICAgdmFyIGlzSW50ZXJuYWwgPSAhIXNlbGVjdGVkVHJhbnNpdGlvbi5pbnRlcm5hbDtcbiAgICB2YXIgcmVlbnRyeU5vZGVzID0gaXNJbnRlcm5hbCA/IFtdIDogZmxhdHRlbihhbGxOZXh0U3RhdGVOb2Rlcy5tYXAoZnVuY3Rpb24gKG4pIHtcbiAgICAgIHJldHVybiBfdGhpcy5ub2Rlc0Zyb21DaGlsZChuKTtcbiAgICB9KSk7XG4gICAgcmV0dXJuIHtcbiAgICAgIHRyYW5zaXRpb25zOiBbc2VsZWN0ZWRUcmFuc2l0aW9uXSxcbiAgICAgIGVudHJ5U2V0OiByZWVudHJ5Tm9kZXMsXG4gICAgICBleGl0U2V0OiBpc0ludGVybmFsID8gW10gOiBbdGhpc10sXG4gICAgICBjb25maWd1cmF0aW9uOiBhbGxOZXh0U3RhdGVOb2RlcyxcbiAgICAgIHNvdXJjZTogc3RhdGUsXG4gICAgICBhY3Rpb25zOiBhY3Rpb25zXG4gICAgfTtcbiAgfTtcblxuICBTdGF0ZU5vZGUucHJvdG90eXBlLm5vZGVzRnJvbUNoaWxkID0gZnVuY3Rpb24gKGNoaWxkU3RhdGVOb2RlKSB7XG4gICAgaWYgKGNoaWxkU3RhdGVOb2RlLmVzY2FwZXModGhpcykpIHtcbiAgICAgIHJldHVybiBbXTtcbiAgICB9XG5cbiAgICB2YXIgbm9kZXMgPSBbXTtcbiAgICB2YXIgbWFya2VyID0gY2hpbGRTdGF0ZU5vZGU7XG5cbiAgICB3aGlsZSAobWFya2VyICYmIG1hcmtlciAhPT0gdGhpcykge1xuICAgICAgbm9kZXMucHVzaChtYXJrZXIpO1xuICAgICAgbWFya2VyID0gbWFya2VyLnBhcmVudDtcbiAgICB9XG5cbiAgICBub2Rlcy5wdXNoKHRoaXMpOyAvLyBpbmNsdXNpdmVcblxuICAgIHJldHVybiBub2RlcztcbiAgfTtcbiAgLyoqXHJcbiAgICogV2hldGhlciB0aGUgZ2l2ZW4gc3RhdGUgbm9kZSBcImVzY2FwZXNcIiB0aGlzIHN0YXRlIG5vZGUuIElmIHRoZSBgc3RhdGVOb2RlYCBpcyBlcXVhbCB0byBvciB0aGUgcGFyZW50IG9mXHJcbiAgICogdGhpcyBzdGF0ZSBub2RlLCBpdCBkb2VzIG5vdCBlc2NhcGUuXHJcbiAgICovXG5cblxuICBTdGF0ZU5vZGUucHJvdG90eXBlLmVzY2FwZXMgPSBmdW5jdGlvbiAoc3RhdGVOb2RlKSB7XG4gICAgaWYgKHRoaXMgPT09IHN0YXRlTm9kZSkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIHZhciBwYXJlbnQgPSB0aGlzLnBhcmVudDtcblxuICAgIHdoaWxlIChwYXJlbnQpIHtcbiAgICAgIGlmIChwYXJlbnQgPT09IHN0YXRlTm9kZSkge1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICB9XG5cbiAgICAgIHBhcmVudCA9IHBhcmVudC5wYXJlbnQ7XG4gICAgfVxuXG4gICAgcmV0dXJuIHRydWU7XG4gIH07XG5cbiAgU3RhdGVOb2RlLnByb3RvdHlwZS5nZXRBY3Rpb25zID0gZnVuY3Rpb24gKHRyYW5zaXRpb24sIGN1cnJlbnRDb250ZXh0LCBfZXZlbnQsIHByZXZTdGF0ZSkge1xuICAgIHZhciBlXzQsIF9hLCBlXzUsIF9iO1xuXG4gICAgdmFyIHByZXZDb25maWcgPSBnZXRDb25maWd1cmF0aW9uKFtdLCBwcmV2U3RhdGUgPyB0aGlzLmdldFN0YXRlTm9kZXMocHJldlN0YXRlLnZhbHVlKSA6IFt0aGlzXSk7XG4gICAgdmFyIHJlc29sdmVkQ29uZmlnID0gdHJhbnNpdGlvbi5jb25maWd1cmF0aW9uLmxlbmd0aCA/IGdldENvbmZpZ3VyYXRpb24ocHJldkNvbmZpZywgdHJhbnNpdGlvbi5jb25maWd1cmF0aW9uKSA6IHByZXZDb25maWc7XG5cbiAgICB0cnkge1xuICAgICAgZm9yICh2YXIgcmVzb2x2ZWRDb25maWdfMSA9IF9fdmFsdWVzKHJlc29sdmVkQ29uZmlnKSwgcmVzb2x2ZWRDb25maWdfMV8xID0gcmVzb2x2ZWRDb25maWdfMS5uZXh0KCk7ICFyZXNvbHZlZENvbmZpZ18xXzEuZG9uZTsgcmVzb2x2ZWRDb25maWdfMV8xID0gcmVzb2x2ZWRDb25maWdfMS5uZXh0KCkpIHtcbiAgICAgICAgdmFyIHNuID0gcmVzb2x2ZWRDb25maWdfMV8xLnZhbHVlO1xuXG4gICAgICAgIGlmICghaGFzKHByZXZDb25maWcsIHNuKSkge1xuICAgICAgICAgIHRyYW5zaXRpb24uZW50cnlTZXQucHVzaChzbik7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9IGNhdGNoIChlXzRfMSkge1xuICAgICAgZV80ID0ge1xuICAgICAgICBlcnJvcjogZV80XzFcbiAgICAgIH07XG4gICAgfSBmaW5hbGx5IHtcbiAgICAgIHRyeSB7XG4gICAgICAgIGlmIChyZXNvbHZlZENvbmZpZ18xXzEgJiYgIXJlc29sdmVkQ29uZmlnXzFfMS5kb25lICYmIChfYSA9IHJlc29sdmVkQ29uZmlnXzEucmV0dXJuKSkgX2EuY2FsbChyZXNvbHZlZENvbmZpZ18xKTtcbiAgICAgIH0gZmluYWxseSB7XG4gICAgICAgIGlmIChlXzQpIHRocm93IGVfNC5lcnJvcjtcbiAgICAgIH1cbiAgICB9XG5cbiAgICB0cnkge1xuICAgICAgZm9yICh2YXIgcHJldkNvbmZpZ18xID0gX192YWx1ZXMocHJldkNvbmZpZyksIHByZXZDb25maWdfMV8xID0gcHJldkNvbmZpZ18xLm5leHQoKTsgIXByZXZDb25maWdfMV8xLmRvbmU7IHByZXZDb25maWdfMV8xID0gcHJldkNvbmZpZ18xLm5leHQoKSkge1xuICAgICAgICB2YXIgc24gPSBwcmV2Q29uZmlnXzFfMS52YWx1ZTtcblxuICAgICAgICBpZiAoIWhhcyhyZXNvbHZlZENvbmZpZywgc24pIHx8IGhhcyh0cmFuc2l0aW9uLmV4aXRTZXQsIHNuLnBhcmVudCkpIHtcbiAgICAgICAgICB0cmFuc2l0aW9uLmV4aXRTZXQucHVzaChzbik7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9IGNhdGNoIChlXzVfMSkge1xuICAgICAgZV81ID0ge1xuICAgICAgICBlcnJvcjogZV81XzFcbiAgICAgIH07XG4gICAgfSBmaW5hbGx5IHtcbiAgICAgIHRyeSB7XG4gICAgICAgIGlmIChwcmV2Q29uZmlnXzFfMSAmJiAhcHJldkNvbmZpZ18xXzEuZG9uZSAmJiAoX2IgPSBwcmV2Q29uZmlnXzEucmV0dXJuKSkgX2IuY2FsbChwcmV2Q29uZmlnXzEpO1xuICAgICAgfSBmaW5hbGx5IHtcbiAgICAgICAgaWYgKGVfNSkgdGhyb3cgZV81LmVycm9yO1xuICAgICAgfVxuICAgIH1cblxuICAgIGlmICghdHJhbnNpdGlvbi5zb3VyY2UpIHtcbiAgICAgIHRyYW5zaXRpb24uZXhpdFNldCA9IFtdOyAvLyBFbnN1cmUgdGhhdCByb290IFN0YXRlTm9kZSAobWFjaGluZSkgaXMgZW50ZXJlZFxuXG4gICAgICB0cmFuc2l0aW9uLmVudHJ5U2V0LnB1c2godGhpcyk7XG4gICAgfVxuXG4gICAgdmFyIGRvbmVFdmVudHMgPSBmbGF0dGVuKHRyYW5zaXRpb24uZW50cnlTZXQubWFwKGZ1bmN0aW9uIChzbikge1xuICAgICAgdmFyIGV2ZW50cyA9IFtdO1xuXG4gICAgICBpZiAoc24udHlwZSAhPT0gJ2ZpbmFsJykge1xuICAgICAgICByZXR1cm4gZXZlbnRzO1xuICAgICAgfVxuXG4gICAgICB2YXIgcGFyZW50ID0gc24ucGFyZW50O1xuXG4gICAgICBpZiAoIXBhcmVudC5wYXJlbnQpIHtcbiAgICAgICAgcmV0dXJuIGV2ZW50cztcbiAgICAgIH1cblxuICAgICAgZXZlbnRzLnB1c2goZG9uZShzbi5pZCwgc24uZG9uZURhdGEpLCAvLyBUT0RPOiBkZXByZWNhdGUgLSBmaW5hbCBzdGF0ZXMgc2hvdWxkIG5vdCBlbWl0IGRvbmUgZXZlbnRzIGZvciB0aGVpciBvd24gc3RhdGUuXG4gICAgICBkb25lKHBhcmVudC5pZCwgc24uZG9uZURhdGEgPyBtYXBDb250ZXh0KHNuLmRvbmVEYXRhLCBjdXJyZW50Q29udGV4dCwgX2V2ZW50KSA6IHVuZGVmaW5lZCkpO1xuICAgICAgdmFyIGdyYW5kcGFyZW50ID0gcGFyZW50LnBhcmVudDtcblxuICAgICAgaWYgKGdyYW5kcGFyZW50LnR5cGUgPT09ICdwYXJhbGxlbCcpIHtcbiAgICAgICAgaWYgKGdldENoaWxkcmVuKGdyYW5kcGFyZW50KS5ldmVyeShmdW5jdGlvbiAocGFyZW50Tm9kZSkge1xuICAgICAgICAgIHJldHVybiBpc0luRmluYWxTdGF0ZSh0cmFuc2l0aW9uLmNvbmZpZ3VyYXRpb24sIHBhcmVudE5vZGUpO1xuICAgICAgICB9KSkge1xuICAgICAgICAgIGV2ZW50cy5wdXNoKGRvbmUoZ3JhbmRwYXJlbnQuaWQpKTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICByZXR1cm4gZXZlbnRzO1xuICAgIH0pKTtcbiAgICB0cmFuc2l0aW9uLmV4aXRTZXQuc29ydChmdW5jdGlvbiAoYSwgYikge1xuICAgICAgcmV0dXJuIGIub3JkZXIgLSBhLm9yZGVyO1xuICAgIH0pO1xuICAgIHRyYW5zaXRpb24uZW50cnlTZXQuc29ydChmdW5jdGlvbiAoYSwgYikge1xuICAgICAgcmV0dXJuIGEub3JkZXIgLSBiLm9yZGVyO1xuICAgIH0pO1xuICAgIHZhciBlbnRyeVN0YXRlcyA9IG5ldyBTZXQodHJhbnNpdGlvbi5lbnRyeVNldCk7XG4gICAgdmFyIGV4aXRTdGF0ZXMgPSBuZXcgU2V0KHRyYW5zaXRpb24uZXhpdFNldCk7XG5cbiAgICB2YXIgX2MgPSBfX3JlYWQoW2ZsYXR0ZW4oQXJyYXkuZnJvbShlbnRyeVN0YXRlcykubWFwKGZ1bmN0aW9uIChzdGF0ZU5vZGUpIHtcbiAgICAgIHJldHVybiBfX3NwcmVhZChzdGF0ZU5vZGUuYWN0aXZpdGllcy5tYXAoZnVuY3Rpb24gKGFjdGl2aXR5KSB7XG4gICAgICAgIHJldHVybiBzdGFydChhY3Rpdml0eSk7XG4gICAgICB9KSwgc3RhdGVOb2RlLm9uRW50cnkpO1xuICAgIH0pKS5jb25jYXQoZG9uZUV2ZW50cy5tYXAocmFpc2UpKSwgZmxhdHRlbihBcnJheS5mcm9tKGV4aXRTdGF0ZXMpLm1hcChmdW5jdGlvbiAoc3RhdGVOb2RlKSB7XG4gICAgICByZXR1cm4gX19zcHJlYWQoc3RhdGVOb2RlLm9uRXhpdCwgc3RhdGVOb2RlLmFjdGl2aXRpZXMubWFwKGZ1bmN0aW9uIChhY3Rpdml0eSkge1xuICAgICAgICByZXR1cm4gc3RvcChhY3Rpdml0eSk7XG4gICAgICB9KSk7XG4gICAgfSkpXSwgMiksXG4gICAgICAgIGVudHJ5QWN0aW9ucyA9IF9jWzBdLFxuICAgICAgICBleGl0QWN0aW9ucyA9IF9jWzFdO1xuXG4gICAgdmFyIGFjdGlvbnMgPSB0b0FjdGlvbk9iamVjdHMoZXhpdEFjdGlvbnMuY29uY2F0KHRyYW5zaXRpb24uYWN0aW9ucykuY29uY2F0KGVudHJ5QWN0aW9ucyksIHRoaXMubWFjaGluZS5vcHRpb25zLmFjdGlvbnMpO1xuICAgIHJldHVybiBhY3Rpb25zO1xuICB9O1xuICAvKipcclxuICAgKiBEZXRlcm1pbmVzIHRoZSBuZXh0IHN0YXRlIGdpdmVuIHRoZSBjdXJyZW50IGBzdGF0ZWAgYW5kIHNlbnQgYGV2ZW50YC5cclxuICAgKlxyXG4gICAqIEBwYXJhbSBzdGF0ZSBUaGUgY3VycmVudCBTdGF0ZSBpbnN0YW5jZSBvciBzdGF0ZSB2YWx1ZVxyXG4gICAqIEBwYXJhbSBldmVudCBUaGUgZXZlbnQgdGhhdCB3YXMgc2VudCBhdCB0aGUgY3VycmVudCBzdGF0ZVxyXG4gICAqIEBwYXJhbSBjb250ZXh0IFRoZSBjdXJyZW50IGNvbnRleHQgKGV4dGVuZGVkIHN0YXRlKSBvZiB0aGUgY3VycmVudCBzdGF0ZVxyXG4gICAqL1xuXG5cbiAgU3RhdGVOb2RlLnByb3RvdHlwZS50cmFuc2l0aW9uID0gZnVuY3Rpb24gKHN0YXRlLCBldmVudCwgY29udGV4dCkge1xuICAgIGlmIChzdGF0ZSA9PT0gdm9pZCAwKSB7XG4gICAgICBzdGF0ZSA9IHRoaXMuaW5pdGlhbFN0YXRlO1xuICAgIH1cblxuICAgIHZhciBfZXZlbnQgPSB0b1NDWE1MRXZlbnQoZXZlbnQpO1xuXG4gICAgdmFyIGN1cnJlbnRTdGF0ZTtcblxuICAgIGlmIChzdGF0ZSBpbnN0YW5jZW9mIFN0YXRlKSB7XG4gICAgICBjdXJyZW50U3RhdGUgPSBjb250ZXh0ID09PSB1bmRlZmluZWQgPyBzdGF0ZSA6IHRoaXMucmVzb2x2ZVN0YXRlKFN0YXRlLmZyb20oc3RhdGUsIGNvbnRleHQpKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdmFyIHJlc29sdmVkU3RhdGVWYWx1ZSA9IGlzU3RyaW5nKHN0YXRlKSA/IHRoaXMucmVzb2x2ZShwYXRoVG9TdGF0ZVZhbHVlKHRoaXMuZ2V0UmVzb2x2ZWRQYXRoKHN0YXRlKSkpIDogdGhpcy5yZXNvbHZlKHN0YXRlKTtcbiAgICAgIHZhciByZXNvbHZlZENvbnRleHQgPSBjb250ZXh0ID8gY29udGV4dCA6IHRoaXMubWFjaGluZS5jb250ZXh0O1xuICAgICAgY3VycmVudFN0YXRlID0gdGhpcy5yZXNvbHZlU3RhdGUoU3RhdGUuZnJvbShyZXNvbHZlZFN0YXRlVmFsdWUsIHJlc29sdmVkQ29udGV4dCkpO1xuICAgIH1cblxuICAgIGlmICghSVNfUFJPRFVDVElPTiAmJiBfZXZlbnQubmFtZSA9PT0gV0lMRENBUkQpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihcIkFuIGV2ZW50IGNhbm5vdCBoYXZlIHRoZSB3aWxkY2FyZCB0eXBlICgnXCIgKyBXSUxEQ0FSRCArIFwiJylcIik7XG4gICAgfVxuXG4gICAgaWYgKHRoaXMuc3RyaWN0KSB7XG4gICAgICBpZiAoIXRoaXMuZXZlbnRzLmluY2x1ZGVzKF9ldmVudC5uYW1lKSAmJiAhaXNCdWlsdEluRXZlbnQoX2V2ZW50Lm5hbWUpKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcIk1hY2hpbmUgJ1wiICsgdGhpcy5pZCArIFwiJyBkb2VzIG5vdCBhY2NlcHQgZXZlbnQgJ1wiICsgX2V2ZW50Lm5hbWUgKyBcIidcIik7XG4gICAgICB9XG4gICAgfVxuXG4gICAgdmFyIHN0YXRlVHJhbnNpdGlvbiA9IHRoaXMuX3RyYW5zaXRpb24oY3VycmVudFN0YXRlLnZhbHVlLCBjdXJyZW50U3RhdGUsIF9ldmVudCkgfHwge1xuICAgICAgdHJhbnNpdGlvbnM6IFtdLFxuICAgICAgY29uZmlndXJhdGlvbjogW10sXG4gICAgICBlbnRyeVNldDogW10sXG4gICAgICBleGl0U2V0OiBbXSxcbiAgICAgIHNvdXJjZTogY3VycmVudFN0YXRlLFxuICAgICAgYWN0aW9uczogW11cbiAgICB9O1xuICAgIHZhciBwcmV2Q29uZmlnID0gZ2V0Q29uZmlndXJhdGlvbihbXSwgdGhpcy5nZXRTdGF0ZU5vZGVzKGN1cnJlbnRTdGF0ZS52YWx1ZSkpO1xuICAgIHZhciByZXNvbHZlZENvbmZpZyA9IHN0YXRlVHJhbnNpdGlvbi5jb25maWd1cmF0aW9uLmxlbmd0aCA/IGdldENvbmZpZ3VyYXRpb24ocHJldkNvbmZpZywgc3RhdGVUcmFuc2l0aW9uLmNvbmZpZ3VyYXRpb24pIDogcHJldkNvbmZpZztcbiAgICBzdGF0ZVRyYW5zaXRpb24uY29uZmlndXJhdGlvbiA9IF9fc3ByZWFkKHJlc29sdmVkQ29uZmlnKTtcbiAgICByZXR1cm4gdGhpcy5yZXNvbHZlVHJhbnNpdGlvbihzdGF0ZVRyYW5zaXRpb24sIGN1cnJlbnRTdGF0ZSwgX2V2ZW50KTtcbiAgfTtcblxuICBTdGF0ZU5vZGUucHJvdG90eXBlLnJlc29sdmVSYWlzZWRUcmFuc2l0aW9uID0gZnVuY3Rpb24gKHN0YXRlLCBfZXZlbnQsIG9yaWdpbmFsRXZlbnQpIHtcbiAgICB2YXIgX2E7XG5cbiAgICB2YXIgY3VycmVudEFjdGlvbnMgPSBzdGF0ZS5hY3Rpb25zO1xuICAgIHN0YXRlID0gdGhpcy50cmFuc2l0aW9uKHN0YXRlLCBfZXZlbnQpOyAvLyBTYXZlIG9yaWdpbmFsIGV2ZW50IHRvIHN0YXRlXG4gICAgLy8gVE9ETzogdGhpcyBzaG91bGQgYmUgdGhlIHJhaXNlZCBldmVudCEgRGVsZXRlIGluIFY1IChicmVha2luZylcblxuICAgIHN0YXRlLl9ldmVudCA9IG9yaWdpbmFsRXZlbnQ7XG4gICAgc3RhdGUuZXZlbnQgPSBvcmlnaW5hbEV2ZW50LmRhdGE7XG5cbiAgICAoX2EgPSBzdGF0ZS5hY3Rpb25zKS51bnNoaWZ0LmFwcGx5KF9hLCBfX3NwcmVhZChjdXJyZW50QWN0aW9ucykpO1xuXG4gICAgcmV0dXJuIHN0YXRlO1xuICB9O1xuXG4gIFN0YXRlTm9kZS5wcm90b3R5cGUucmVzb2x2ZVRyYW5zaXRpb24gPSBmdW5jdGlvbiAoc3RhdGVUcmFuc2l0aW9uLCBjdXJyZW50U3RhdGUsIF9ldmVudCwgY29udGV4dCkge1xuICAgIHZhciBlXzYsIF9hO1xuXG4gICAgdmFyIF90aGlzID0gdGhpcztcblxuICAgIGlmIChfZXZlbnQgPT09IHZvaWQgMCkge1xuICAgICAgX2V2ZW50ID0gaW5pdEV2ZW50O1xuICAgIH1cblxuICAgIGlmIChjb250ZXh0ID09PSB2b2lkIDApIHtcbiAgICAgIGNvbnRleHQgPSB0aGlzLm1hY2hpbmUuY29udGV4dDtcbiAgICB9XG5cbiAgICB2YXIgY29uZmlndXJhdGlvbiA9IHN0YXRlVHJhbnNpdGlvbi5jb25maWd1cmF0aW9uOyAvLyBUcmFuc2l0aW9uIHdpbGwgXCJhcHBseVwiIGlmOlxuICAgIC8vIC0gdGhpcyBpcyB0aGUgaW5pdGlhbCBzdGF0ZSAodGhlcmUgaXMgbm8gY3VycmVudCBzdGF0ZSlcbiAgICAvLyAtIE9SIHRoZXJlIGFyZSB0cmFuc2l0aW9uc1xuXG4gICAgdmFyIHdpbGxUcmFuc2l0aW9uID0gIWN1cnJlbnRTdGF0ZSB8fCBzdGF0ZVRyYW5zaXRpb24udHJhbnNpdGlvbnMubGVuZ3RoID4gMDtcbiAgICB2YXIgcmVzb2x2ZWRTdGF0ZVZhbHVlID0gd2lsbFRyYW5zaXRpb24gPyBnZXRWYWx1ZSh0aGlzLm1hY2hpbmUsIGNvbmZpZ3VyYXRpb24pIDogdW5kZWZpbmVkO1xuICAgIHZhciBoaXN0b3J5VmFsdWUgPSBjdXJyZW50U3RhdGUgPyBjdXJyZW50U3RhdGUuaGlzdG9yeVZhbHVlID8gY3VycmVudFN0YXRlLmhpc3RvcnlWYWx1ZSA6IHN0YXRlVHJhbnNpdGlvbi5zb3VyY2UgPyB0aGlzLm1hY2hpbmUuaGlzdG9yeVZhbHVlKGN1cnJlbnRTdGF0ZS52YWx1ZSkgOiB1bmRlZmluZWQgOiB1bmRlZmluZWQ7XG4gICAgdmFyIGN1cnJlbnRDb250ZXh0ID0gY3VycmVudFN0YXRlID8gY3VycmVudFN0YXRlLmNvbnRleHQgOiBjb250ZXh0O1xuICAgIHZhciBhY3Rpb25zID0gdGhpcy5nZXRBY3Rpb25zKHN0YXRlVHJhbnNpdGlvbiwgY3VycmVudENvbnRleHQsIF9ldmVudCwgY3VycmVudFN0YXRlKTtcbiAgICB2YXIgYWN0aXZpdGllcyA9IGN1cnJlbnRTdGF0ZSA/IF9fYXNzaWduKHt9LCBjdXJyZW50U3RhdGUuYWN0aXZpdGllcykgOiB7fTtcblxuICAgIHRyeSB7XG4gICAgICBmb3IgKHZhciBhY3Rpb25zXzEgPSBfX3ZhbHVlcyhhY3Rpb25zKSwgYWN0aW9uc18xXzEgPSBhY3Rpb25zXzEubmV4dCgpOyAhYWN0aW9uc18xXzEuZG9uZTsgYWN0aW9uc18xXzEgPSBhY3Rpb25zXzEubmV4dCgpKSB7XG4gICAgICAgIHZhciBhY3Rpb24gPSBhY3Rpb25zXzFfMS52YWx1ZTtcblxuICAgICAgICBpZiAoYWN0aW9uLnR5cGUgPT09IHN0YXJ0JDEpIHtcbiAgICAgICAgICBhY3Rpdml0aWVzW2FjdGlvbi5hY3Rpdml0eS5pZCB8fCBhY3Rpb24uYWN0aXZpdHkudHlwZV0gPSBhY3Rpb247XG4gICAgICAgIH0gZWxzZSBpZiAoYWN0aW9uLnR5cGUgPT09IHN0b3AkMSkge1xuICAgICAgICAgIGFjdGl2aXRpZXNbYWN0aW9uLmFjdGl2aXR5LmlkIHx8IGFjdGlvbi5hY3Rpdml0eS50eXBlXSA9IGZhbHNlO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSBjYXRjaCAoZV82XzEpIHtcbiAgICAgIGVfNiA9IHtcbiAgICAgICAgZXJyb3I6IGVfNl8xXG4gICAgICB9O1xuICAgIH0gZmluYWxseSB7XG4gICAgICB0cnkge1xuICAgICAgICBpZiAoYWN0aW9uc18xXzEgJiYgIWFjdGlvbnNfMV8xLmRvbmUgJiYgKF9hID0gYWN0aW9uc18xLnJldHVybikpIF9hLmNhbGwoYWN0aW9uc18xKTtcbiAgICAgIH0gZmluYWxseSB7XG4gICAgICAgIGlmIChlXzYpIHRocm93IGVfNi5lcnJvcjtcbiAgICAgIH1cbiAgICB9XG5cbiAgICB2YXIgX2IgPSBfX3JlYWQocmVzb2x2ZUFjdGlvbnModGhpcywgY3VycmVudFN0YXRlLCBjdXJyZW50Q29udGV4dCwgX2V2ZW50LCBhY3Rpb25zKSwgMiksXG4gICAgICAgIHJlc29sdmVkQWN0aW9ucyA9IF9iWzBdLFxuICAgICAgICB1cGRhdGVkQ29udGV4dCA9IF9iWzFdO1xuXG4gICAgdmFyIF9jID0gX19yZWFkKHBhcnRpdGlvbihyZXNvbHZlZEFjdGlvbnMsIGZ1bmN0aW9uIChhY3Rpb24pIHtcbiAgICAgIHJldHVybiBhY3Rpb24udHlwZSA9PT0gcmFpc2UkMSB8fCBhY3Rpb24udHlwZSA9PT0gc2VuZCQxICYmIGFjdGlvbi50byA9PT0gU3BlY2lhbFRhcmdldHMuSW50ZXJuYWw7XG4gICAgfSksIDIpLFxuICAgICAgICByYWlzZWRFdmVudHMgPSBfY1swXSxcbiAgICAgICAgbm9uUmFpc2VkQWN0aW9ucyA9IF9jWzFdO1xuXG4gICAgdmFyIGludm9rZUFjdGlvbnMgPSByZXNvbHZlZEFjdGlvbnMuZmlsdGVyKGZ1bmN0aW9uIChhY3Rpb24pIHtcbiAgICAgIHZhciBfYTtcblxuICAgICAgcmV0dXJuIGFjdGlvbi50eXBlID09PSBzdGFydCQxICYmICgoX2EgPSBhY3Rpb24uYWN0aXZpdHkpID09PSBudWxsIHx8IF9hID09PSB2b2lkIDAgPyB2b2lkIDAgOiBfYS50eXBlKSA9PT0gaW52b2tlO1xuICAgIH0pO1xuICAgIHZhciBjaGlsZHJlbiA9IGludm9rZUFjdGlvbnMucmVkdWNlKGZ1bmN0aW9uIChhY2MsIGFjdGlvbikge1xuICAgICAgYWNjW2FjdGlvbi5hY3Rpdml0eS5pZF0gPSBjcmVhdGVJbnZvY2FibGVBY3RvcihhY3Rpb24uYWN0aXZpdHksIF90aGlzLm1hY2hpbmUsIHVwZGF0ZWRDb250ZXh0LCBfZXZlbnQpO1xuICAgICAgcmV0dXJuIGFjYztcbiAgICB9LCBjdXJyZW50U3RhdGUgPyBfX2Fzc2lnbih7fSwgY3VycmVudFN0YXRlLmNoaWxkcmVuKSA6IHt9KTtcbiAgICB2YXIgcmVzb2x2ZWRDb25maWd1cmF0aW9uID0gcmVzb2x2ZWRTdGF0ZVZhbHVlID8gc3RhdGVUcmFuc2l0aW9uLmNvbmZpZ3VyYXRpb24gOiBjdXJyZW50U3RhdGUgPyBjdXJyZW50U3RhdGUuY29uZmlndXJhdGlvbiA6IFtdO1xuICAgIHZhciBtZXRhID0gcmVzb2x2ZWRDb25maWd1cmF0aW9uLnJlZHVjZShmdW5jdGlvbiAoYWNjLCBzdGF0ZU5vZGUpIHtcbiAgICAgIGlmIChzdGF0ZU5vZGUubWV0YSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIGFjY1tzdGF0ZU5vZGUuaWRdID0gc3RhdGVOb2RlLm1ldGE7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBhY2M7XG4gICAgfSwge30pO1xuICAgIHZhciBpc0RvbmUgPSBpc0luRmluYWxTdGF0ZShyZXNvbHZlZENvbmZpZ3VyYXRpb24sIHRoaXMpO1xuICAgIHZhciBuZXh0U3RhdGUgPSBuZXcgU3RhdGUoe1xuICAgICAgdmFsdWU6IHJlc29sdmVkU3RhdGVWYWx1ZSB8fCBjdXJyZW50U3RhdGUudmFsdWUsXG4gICAgICBjb250ZXh0OiB1cGRhdGVkQ29udGV4dCxcbiAgICAgIF9ldmVudDogX2V2ZW50LFxuICAgICAgLy8gUGVyc2lzdCBfc2Vzc2lvbmlkIGJldHdlZW4gc3RhdGVzXG4gICAgICBfc2Vzc2lvbmlkOiBjdXJyZW50U3RhdGUgPyBjdXJyZW50U3RhdGUuX3Nlc3Npb25pZCA6IG51bGwsXG4gICAgICBoaXN0b3J5VmFsdWU6IHJlc29sdmVkU3RhdGVWYWx1ZSA/IGhpc3RvcnlWYWx1ZSA/IHVwZGF0ZUhpc3RvcnlWYWx1ZShoaXN0b3J5VmFsdWUsIHJlc29sdmVkU3RhdGVWYWx1ZSkgOiB1bmRlZmluZWQgOiBjdXJyZW50U3RhdGUgPyBjdXJyZW50U3RhdGUuaGlzdG9yeVZhbHVlIDogdW5kZWZpbmVkLFxuICAgICAgaGlzdG9yeTogIXJlc29sdmVkU3RhdGVWYWx1ZSB8fCBzdGF0ZVRyYW5zaXRpb24uc291cmNlID8gY3VycmVudFN0YXRlIDogdW5kZWZpbmVkLFxuICAgICAgYWN0aW9uczogcmVzb2x2ZWRTdGF0ZVZhbHVlID8gbm9uUmFpc2VkQWN0aW9ucyA6IFtdLFxuICAgICAgYWN0aXZpdGllczogcmVzb2x2ZWRTdGF0ZVZhbHVlID8gYWN0aXZpdGllcyA6IGN1cnJlbnRTdGF0ZSA/IGN1cnJlbnRTdGF0ZS5hY3Rpdml0aWVzIDoge30sXG4gICAgICBtZXRhOiByZXNvbHZlZFN0YXRlVmFsdWUgPyBtZXRhIDogY3VycmVudFN0YXRlID8gY3VycmVudFN0YXRlLm1ldGEgOiB1bmRlZmluZWQsXG4gICAgICBldmVudHM6IFtdLFxuICAgICAgY29uZmlndXJhdGlvbjogcmVzb2x2ZWRDb25maWd1cmF0aW9uLFxuICAgICAgdHJhbnNpdGlvbnM6IHN0YXRlVHJhbnNpdGlvbi50cmFuc2l0aW9ucyxcbiAgICAgIGNoaWxkcmVuOiBjaGlsZHJlbixcbiAgICAgIGRvbmU6IGlzRG9uZVxuICAgIH0pO1xuICAgIHZhciBkaWRVcGRhdGVDb250ZXh0ID0gY3VycmVudENvbnRleHQgIT09IHVwZGF0ZWRDb250ZXh0O1xuICAgIG5leHRTdGF0ZS5jaGFuZ2VkID0gX2V2ZW50Lm5hbWUgPT09IHVwZGF0ZSB8fCBkaWRVcGRhdGVDb250ZXh0OyAvLyBEaXNwb3NlIG9mIHBlbnVsdGltYXRlIGhpc3RvcmllcyB0byBwcmV2ZW50IG1lbW9yeSBsZWFrc1xuXG4gICAgdmFyIGhpc3RvcnkgPSBuZXh0U3RhdGUuaGlzdG9yeTtcblxuICAgIGlmIChoaXN0b3J5KSB7XG4gICAgICBkZWxldGUgaGlzdG9yeS5oaXN0b3J5O1xuICAgIH1cblxuICAgIGlmICghcmVzb2x2ZWRTdGF0ZVZhbHVlKSB7XG4gICAgICByZXR1cm4gbmV4dFN0YXRlO1xuICAgIH1cblxuICAgIHZhciBtYXliZU5leHRTdGF0ZSA9IG5leHRTdGF0ZTtcblxuICAgIGlmICghaXNEb25lKSB7XG4gICAgICB2YXIgaXNUcmFuc2llbnQgPSB0aGlzLl90cmFuc2llbnQgfHwgY29uZmlndXJhdGlvbi5zb21lKGZ1bmN0aW9uIChzdGF0ZU5vZGUpIHtcbiAgICAgICAgcmV0dXJuIHN0YXRlTm9kZS5fdHJhbnNpZW50O1xuICAgICAgfSk7XG5cbiAgICAgIGlmIChpc1RyYW5zaWVudCkge1xuICAgICAgICBtYXliZU5leHRTdGF0ZSA9IHRoaXMucmVzb2x2ZVJhaXNlZFRyYW5zaXRpb24obWF5YmVOZXh0U3RhdGUsIHtcbiAgICAgICAgICB0eXBlOiBudWxsRXZlbnRcbiAgICAgICAgfSwgX2V2ZW50KTtcbiAgICAgIH1cblxuICAgICAgd2hpbGUgKHJhaXNlZEV2ZW50cy5sZW5ndGgpIHtcbiAgICAgICAgdmFyIHJhaXNlZEV2ZW50ID0gcmFpc2VkRXZlbnRzLnNoaWZ0KCk7XG4gICAgICAgIG1heWJlTmV4dFN0YXRlID0gdGhpcy5yZXNvbHZlUmFpc2VkVHJhbnNpdGlvbihtYXliZU5leHRTdGF0ZSwgcmFpc2VkRXZlbnQuX2V2ZW50LCBfZXZlbnQpO1xuICAgICAgfVxuICAgIH0gLy8gRGV0ZWN0IGlmIHN0YXRlIGNoYW5nZWRcblxuXG4gICAgdmFyIGNoYW5nZWQgPSBtYXliZU5leHRTdGF0ZS5jaGFuZ2VkIHx8IChoaXN0b3J5ID8gISFtYXliZU5leHRTdGF0ZS5hY3Rpb25zLmxlbmd0aCB8fCBkaWRVcGRhdGVDb250ZXh0IHx8IHR5cGVvZiBoaXN0b3J5LnZhbHVlICE9PSB0eXBlb2YgbWF5YmVOZXh0U3RhdGUudmFsdWUgfHwgIXN0YXRlVmFsdWVzRXF1YWwobWF5YmVOZXh0U3RhdGUudmFsdWUsIGhpc3RvcnkudmFsdWUpIDogdW5kZWZpbmVkKTtcbiAgICBtYXliZU5leHRTdGF0ZS5jaGFuZ2VkID0gY2hhbmdlZDsgLy8gUHJlc2VydmUgb3JpZ2luYWwgaGlzdG9yeSBhZnRlciByYWlzZWQgZXZlbnRzXG5cbiAgICBtYXliZU5leHRTdGF0ZS5oaXN0b3J5ID0gaGlzdG9yeTtcbiAgICByZXR1cm4gbWF5YmVOZXh0U3RhdGU7XG4gIH07XG4gIC8qKlxyXG4gICAqIFJldHVybnMgdGhlIGNoaWxkIHN0YXRlIG5vZGUgZnJvbSBpdHMgcmVsYXRpdmUgYHN0YXRlS2V5YCwgb3IgdGhyb3dzLlxyXG4gICAqL1xuXG5cbiAgU3RhdGVOb2RlLnByb3RvdHlwZS5nZXRTdGF0ZU5vZGUgPSBmdW5jdGlvbiAoc3RhdGVLZXkpIHtcbiAgICBpZiAoaXNTdGF0ZUlkKHN0YXRlS2V5KSkge1xuICAgICAgcmV0dXJuIHRoaXMubWFjaGluZS5nZXRTdGF0ZU5vZGVCeUlkKHN0YXRlS2V5KTtcbiAgICB9XG5cbiAgICBpZiAoIXRoaXMuc3RhdGVzKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXCJVbmFibGUgdG8gcmV0cmlldmUgY2hpbGQgc3RhdGUgJ1wiICsgc3RhdGVLZXkgKyBcIicgZnJvbSAnXCIgKyB0aGlzLmlkICsgXCInOyBubyBjaGlsZCBzdGF0ZXMgZXhpc3QuXCIpO1xuICAgIH1cblxuICAgIHZhciByZXN1bHQgPSB0aGlzLnN0YXRlc1tzdGF0ZUtleV07XG5cbiAgICBpZiAoIXJlc3VsdCkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKFwiQ2hpbGQgc3RhdGUgJ1wiICsgc3RhdGVLZXkgKyBcIicgZG9lcyBub3QgZXhpc3Qgb24gJ1wiICsgdGhpcy5pZCArIFwiJ1wiKTtcbiAgICB9XG5cbiAgICByZXR1cm4gcmVzdWx0O1xuICB9O1xuICAvKipcclxuICAgKiBSZXR1cm5zIHRoZSBzdGF0ZSBub2RlIHdpdGggdGhlIGdpdmVuIGBzdGF0ZUlkYCwgb3IgdGhyb3dzLlxyXG4gICAqXHJcbiAgICogQHBhcmFtIHN0YXRlSWQgVGhlIHN0YXRlIElELiBUaGUgcHJlZml4IFwiI1wiIGlzIHJlbW92ZWQuXHJcbiAgICovXG5cblxuICBTdGF0ZU5vZGUucHJvdG90eXBlLmdldFN0YXRlTm9kZUJ5SWQgPSBmdW5jdGlvbiAoc3RhdGVJZCkge1xuICAgIHZhciByZXNvbHZlZFN0YXRlSWQgPSBpc1N0YXRlSWQoc3RhdGVJZCkgPyBzdGF0ZUlkLnNsaWNlKFNUQVRFX0lERU5USUZJRVIubGVuZ3RoKSA6IHN0YXRlSWQ7XG5cbiAgICBpZiAocmVzb2x2ZWRTdGF0ZUlkID09PSB0aGlzLmlkKSB7XG4gICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICB2YXIgc3RhdGVOb2RlID0gdGhpcy5tYWNoaW5lLmlkTWFwW3Jlc29sdmVkU3RhdGVJZF07XG5cbiAgICBpZiAoIXN0YXRlTm9kZSkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKFwiQ2hpbGQgc3RhdGUgbm9kZSAnI1wiICsgcmVzb2x2ZWRTdGF0ZUlkICsgXCInIGRvZXMgbm90IGV4aXN0IG9uIG1hY2hpbmUgJ1wiICsgdGhpcy5pZCArIFwiJ1wiKTtcbiAgICB9XG5cbiAgICByZXR1cm4gc3RhdGVOb2RlO1xuICB9O1xuICAvKipcclxuICAgKiBSZXR1cm5zIHRoZSByZWxhdGl2ZSBzdGF0ZSBub2RlIGZyb20gdGhlIGdpdmVuIGBzdGF0ZVBhdGhgLCBvciB0aHJvd3MuXHJcbiAgICpcclxuICAgKiBAcGFyYW0gc3RhdGVQYXRoIFRoZSBzdHJpbmcgb3Igc3RyaW5nIGFycmF5IHJlbGF0aXZlIHBhdGggdG8gdGhlIHN0YXRlIG5vZGUuXHJcbiAgICovXG5cblxuICBTdGF0ZU5vZGUucHJvdG90eXBlLmdldFN0YXRlTm9kZUJ5UGF0aCA9IGZ1bmN0aW9uIChzdGF0ZVBhdGgpIHtcbiAgICBpZiAodHlwZW9mIHN0YXRlUGF0aCA9PT0gJ3N0cmluZycgJiYgaXNTdGF0ZUlkKHN0YXRlUGF0aCkpIHtcbiAgICAgIHRyeSB7XG4gICAgICAgIHJldHVybiB0aGlzLmdldFN0YXRlTm9kZUJ5SWQoc3RhdGVQYXRoLnNsaWNlKDEpKTtcbiAgICAgIH0gY2F0Y2ggKGUpIHsvLyB0cnkgaW5kaXZpZHVhbCBwYXRoc1xuICAgICAgICAvLyB0aHJvdyBlO1xuICAgICAgfVxuICAgIH1cblxuICAgIHZhciBhcnJheVN0YXRlUGF0aCA9IHRvU3RhdGVQYXRoKHN0YXRlUGF0aCwgdGhpcy5kZWxpbWl0ZXIpLnNsaWNlKCk7XG4gICAgdmFyIGN1cnJlbnRTdGF0ZU5vZGUgPSB0aGlzO1xuXG4gICAgd2hpbGUgKGFycmF5U3RhdGVQYXRoLmxlbmd0aCkge1xuICAgICAgdmFyIGtleSA9IGFycmF5U3RhdGVQYXRoLnNoaWZ0KCk7XG5cbiAgICAgIGlmICgha2V5Lmxlbmd0aCkge1xuICAgICAgICBicmVhaztcbiAgICAgIH1cblxuICAgICAgY3VycmVudFN0YXRlTm9kZSA9IGN1cnJlbnRTdGF0ZU5vZGUuZ2V0U3RhdGVOb2RlKGtleSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIGN1cnJlbnRTdGF0ZU5vZGU7XG4gIH07XG4gIC8qKlxyXG4gICAqIFJlc29sdmVzIGEgcGFydGlhbCBzdGF0ZSB2YWx1ZSB3aXRoIGl0cyBmdWxsIHJlcHJlc2VudGF0aW9uIGluIHRoaXMgbWFjaGluZS5cclxuICAgKlxyXG4gICAqIEBwYXJhbSBzdGF0ZVZhbHVlIFRoZSBwYXJ0aWFsIHN0YXRlIHZhbHVlIHRvIHJlc29sdmUuXHJcbiAgICovXG5cblxuICBTdGF0ZU5vZGUucHJvdG90eXBlLnJlc29sdmUgPSBmdW5jdGlvbiAoc3RhdGVWYWx1ZSkge1xuICAgIHZhciBfYTtcblxuICAgIHZhciBfdGhpcyA9IHRoaXM7XG5cbiAgICBpZiAoIXN0YXRlVmFsdWUpIHtcbiAgICAgIHJldHVybiB0aGlzLmluaXRpYWxTdGF0ZVZhbHVlIHx8IEVNUFRZX09CSkVDVDsgLy8gVE9ETzogdHlwZS1zcGVjaWZpYyBwcm9wZXJ0aWVzXG4gICAgfVxuXG4gICAgc3dpdGNoICh0aGlzLnR5cGUpIHtcbiAgICAgIGNhc2UgJ3BhcmFsbGVsJzpcbiAgICAgICAgcmV0dXJuIG1hcFZhbHVlcyh0aGlzLmluaXRpYWxTdGF0ZVZhbHVlLCBmdW5jdGlvbiAoc3ViU3RhdGVWYWx1ZSwgc3ViU3RhdGVLZXkpIHtcbiAgICAgICAgICByZXR1cm4gc3ViU3RhdGVWYWx1ZSA/IF90aGlzLmdldFN0YXRlTm9kZShzdWJTdGF0ZUtleSkucmVzb2x2ZShzdGF0ZVZhbHVlW3N1YlN0YXRlS2V5XSB8fCBzdWJTdGF0ZVZhbHVlKSA6IEVNUFRZX09CSkVDVDtcbiAgICAgICAgfSk7XG5cbiAgICAgIGNhc2UgJ2NvbXBvdW5kJzpcbiAgICAgICAgaWYgKGlzU3RyaW5nKHN0YXRlVmFsdWUpKSB7XG4gICAgICAgICAgdmFyIHN1YlN0YXRlTm9kZSA9IHRoaXMuZ2V0U3RhdGVOb2RlKHN0YXRlVmFsdWUpO1xuXG4gICAgICAgICAgaWYgKHN1YlN0YXRlTm9kZS50eXBlID09PSAncGFyYWxsZWwnIHx8IHN1YlN0YXRlTm9kZS50eXBlID09PSAnY29tcG91bmQnKSB7XG4gICAgICAgICAgICByZXR1cm4gX2EgPSB7fSwgX2Fbc3RhdGVWYWx1ZV0gPSBzdWJTdGF0ZU5vZGUuaW5pdGlhbFN0YXRlVmFsdWUsIF9hO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIHJldHVybiBzdGF0ZVZhbHVlO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKCFrZXlzKHN0YXRlVmFsdWUpLmxlbmd0aCkge1xuICAgICAgICAgIHJldHVybiB0aGlzLmluaXRpYWxTdGF0ZVZhbHVlIHx8IHt9O1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIG1hcFZhbHVlcyhzdGF0ZVZhbHVlLCBmdW5jdGlvbiAoc3ViU3RhdGVWYWx1ZSwgc3ViU3RhdGVLZXkpIHtcbiAgICAgICAgICByZXR1cm4gc3ViU3RhdGVWYWx1ZSA/IF90aGlzLmdldFN0YXRlTm9kZShzdWJTdGF0ZUtleSkucmVzb2x2ZShzdWJTdGF0ZVZhbHVlKSA6IEVNUFRZX09CSkVDVDtcbiAgICAgICAgfSk7XG5cbiAgICAgIGRlZmF1bHQ6XG4gICAgICAgIHJldHVybiBzdGF0ZVZhbHVlIHx8IEVNUFRZX09CSkVDVDtcbiAgICB9XG4gIH07XG5cbiAgU3RhdGVOb2RlLnByb3RvdHlwZS5nZXRSZXNvbHZlZFBhdGggPSBmdW5jdGlvbiAoc3RhdGVJZGVudGlmaWVyKSB7XG4gICAgaWYgKGlzU3RhdGVJZChzdGF0ZUlkZW50aWZpZXIpKSB7XG4gICAgICB2YXIgc3RhdGVOb2RlID0gdGhpcy5tYWNoaW5lLmlkTWFwW3N0YXRlSWRlbnRpZmllci5zbGljZShTVEFURV9JREVOVElGSUVSLmxlbmd0aCldO1xuXG4gICAgICBpZiAoIXN0YXRlTm9kZSkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJVbmFibGUgdG8gZmluZCBzdGF0ZSBub2RlICdcIiArIHN0YXRlSWRlbnRpZmllciArIFwiJ1wiKTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHN0YXRlTm9kZS5wYXRoO1xuICAgIH1cblxuICAgIHJldHVybiB0b1N0YXRlUGF0aChzdGF0ZUlkZW50aWZpZXIsIHRoaXMuZGVsaW1pdGVyKTtcbiAgfTtcblxuICBPYmplY3QuZGVmaW5lUHJvcGVydHkoU3RhdGVOb2RlLnByb3RvdHlwZSwgXCJpbml0aWFsU3RhdGVWYWx1ZVwiLCB7XG4gICAgZ2V0OiBmdW5jdGlvbiAoKSB7XG4gICAgICB2YXIgX2E7XG5cbiAgICAgIGlmICh0aGlzLl9fY2FjaGUuaW5pdGlhbFN0YXRlVmFsdWUpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX19jYWNoZS5pbml0aWFsU3RhdGVWYWx1ZTtcbiAgICAgIH1cblxuICAgICAgdmFyIGluaXRpYWxTdGF0ZVZhbHVlO1xuXG4gICAgICBpZiAodGhpcy50eXBlID09PSAncGFyYWxsZWwnKSB7XG4gICAgICAgIGluaXRpYWxTdGF0ZVZhbHVlID0gbWFwRmlsdGVyVmFsdWVzKHRoaXMuc3RhdGVzLCBmdW5jdGlvbiAoc3RhdGUpIHtcbiAgICAgICAgICByZXR1cm4gc3RhdGUuaW5pdGlhbFN0YXRlVmFsdWUgfHwgRU1QVFlfT0JKRUNUO1xuICAgICAgICB9LCBmdW5jdGlvbiAoc3RhdGVOb2RlKSB7XG4gICAgICAgICAgcmV0dXJuICEoc3RhdGVOb2RlLnR5cGUgPT09ICdoaXN0b3J5Jyk7XG4gICAgICAgIH0pO1xuICAgICAgfSBlbHNlIGlmICh0aGlzLmluaXRpYWwgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICBpZiAoIXRoaXMuc3RhdGVzW3RoaXMuaW5pdGlhbF0pIHtcbiAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJJbml0aWFsIHN0YXRlICdcIiArIHRoaXMuaW5pdGlhbCArIFwiJyBub3QgZm91bmQgb24gJ1wiICsgdGhpcy5rZXkgKyBcIidcIik7XG4gICAgICAgIH1cblxuICAgICAgICBpbml0aWFsU3RhdGVWYWx1ZSA9IGlzTGVhZk5vZGUodGhpcy5zdGF0ZXNbdGhpcy5pbml0aWFsXSkgPyB0aGlzLmluaXRpYWwgOiAoX2EgPSB7fSwgX2FbdGhpcy5pbml0aWFsXSA9IHRoaXMuc3RhdGVzW3RoaXMuaW5pdGlhbF0uaW5pdGlhbFN0YXRlVmFsdWUsIF9hKTtcbiAgICAgIH1cblxuICAgICAgdGhpcy5fX2NhY2hlLmluaXRpYWxTdGF0ZVZhbHVlID0gaW5pdGlhbFN0YXRlVmFsdWU7XG4gICAgICByZXR1cm4gdGhpcy5fX2NhY2hlLmluaXRpYWxTdGF0ZVZhbHVlO1xuICAgIH0sXG4gICAgZW51bWVyYWJsZTogZmFsc2UsXG4gICAgY29uZmlndXJhYmxlOiB0cnVlXG4gIH0pO1xuXG4gIFN0YXRlTm9kZS5wcm90b3R5cGUuZ2V0SW5pdGlhbFN0YXRlID0gZnVuY3Rpb24gKHN0YXRlVmFsdWUsIGNvbnRleHQpIHtcbiAgICB2YXIgY29uZmlndXJhdGlvbiA9IHRoaXMuZ2V0U3RhdGVOb2RlcyhzdGF0ZVZhbHVlKTtcbiAgICByZXR1cm4gdGhpcy5yZXNvbHZlVHJhbnNpdGlvbih7XG4gICAgICBjb25maWd1cmF0aW9uOiBjb25maWd1cmF0aW9uLFxuICAgICAgZW50cnlTZXQ6IGNvbmZpZ3VyYXRpb24sXG4gICAgICBleGl0U2V0OiBbXSxcbiAgICAgIHRyYW5zaXRpb25zOiBbXSxcbiAgICAgIHNvdXJjZTogdW5kZWZpbmVkLFxuICAgICAgYWN0aW9uczogW11cbiAgICB9LCB1bmRlZmluZWQsIHVuZGVmaW5lZCwgY29udGV4dCk7XG4gIH07XG5cbiAgT2JqZWN0LmRlZmluZVByb3BlcnR5KFN0YXRlTm9kZS5wcm90b3R5cGUsIFwiaW5pdGlhbFN0YXRlXCIsIHtcbiAgICAvKipcclxuICAgICAqIFRoZSBpbml0aWFsIFN0YXRlIGluc3RhbmNlLCB3aGljaCBpbmNsdWRlcyBhbGwgYWN0aW9ucyB0byBiZSBleGVjdXRlZCBmcm9tXHJcbiAgICAgKiBlbnRlcmluZyB0aGUgaW5pdGlhbCBzdGF0ZS5cclxuICAgICAqL1xuICAgIGdldDogZnVuY3Rpb24gKCkge1xuICAgICAgdGhpcy5faW5pdCgpOyAvLyBUT0RPOiB0aGlzIHNob3VsZCBiZSBpbiB0aGUgY29uc3RydWN0b3IgKHNlZSBub3RlIGluIGNvbnN0cnVjdG9yKVxuXG5cbiAgICAgIHZhciBpbml0aWFsU3RhdGVWYWx1ZSA9IHRoaXMuaW5pdGlhbFN0YXRlVmFsdWU7XG5cbiAgICAgIGlmICghaW5pdGlhbFN0YXRlVmFsdWUpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiQ2Fubm90IHJldHJpZXZlIGluaXRpYWwgc3RhdGUgZnJvbSBzaW1wbGUgc3RhdGUgJ1wiICsgdGhpcy5pZCArIFwiJy5cIik7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiB0aGlzLmdldEluaXRpYWxTdGF0ZShpbml0aWFsU3RhdGVWYWx1ZSk7XG4gICAgfSxcbiAgICBlbnVtZXJhYmxlOiBmYWxzZSxcbiAgICBjb25maWd1cmFibGU6IHRydWVcbiAgfSk7XG4gIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShTdGF0ZU5vZGUucHJvdG90eXBlLCBcInRhcmdldFwiLCB7XG4gICAgLyoqXHJcbiAgICAgKiBUaGUgdGFyZ2V0IHN0YXRlIHZhbHVlIG9mIHRoZSBoaXN0b3J5IHN0YXRlIG5vZGUsIGlmIGl0IGV4aXN0cy4gVGhpcyByZXByZXNlbnRzIHRoZVxyXG4gICAgICogZGVmYXVsdCBzdGF0ZSB2YWx1ZSB0byB0cmFuc2l0aW9uIHRvIGlmIG5vIGhpc3RvcnkgdmFsdWUgZXhpc3RzIHlldC5cclxuICAgICAqL1xuICAgIGdldDogZnVuY3Rpb24gKCkge1xuICAgICAgdmFyIHRhcmdldDtcblxuICAgICAgaWYgKHRoaXMudHlwZSA9PT0gJ2hpc3RvcnknKSB7XG4gICAgICAgIHZhciBoaXN0b3J5Q29uZmlnID0gdGhpcy5jb25maWc7XG5cbiAgICAgICAgaWYgKGlzU3RyaW5nKGhpc3RvcnlDb25maWcudGFyZ2V0KSkge1xuICAgICAgICAgIHRhcmdldCA9IGlzU3RhdGVJZChoaXN0b3J5Q29uZmlnLnRhcmdldCkgPyBwYXRoVG9TdGF0ZVZhbHVlKHRoaXMubWFjaGluZS5nZXRTdGF0ZU5vZGVCeUlkKGhpc3RvcnlDb25maWcudGFyZ2V0KS5wYXRoLnNsaWNlKHRoaXMucGF0aC5sZW5ndGggLSAxKSkgOiBoaXN0b3J5Q29uZmlnLnRhcmdldDtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB0YXJnZXQgPSBoaXN0b3J5Q29uZmlnLnRhcmdldDtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICByZXR1cm4gdGFyZ2V0O1xuICAgIH0sXG4gICAgZW51bWVyYWJsZTogZmFsc2UsXG4gICAgY29uZmlndXJhYmxlOiB0cnVlXG4gIH0pO1xuICAvKipcclxuICAgKiBSZXR1cm5zIHRoZSBsZWFmIG5vZGVzIGZyb20gYSBzdGF0ZSBwYXRoIHJlbGF0aXZlIHRvIHRoaXMgc3RhdGUgbm9kZS5cclxuICAgKlxyXG4gICAqIEBwYXJhbSByZWxhdGl2ZVN0YXRlSWQgVGhlIHJlbGF0aXZlIHN0YXRlIHBhdGggdG8gcmV0cmlldmUgdGhlIHN0YXRlIG5vZGVzXHJcbiAgICogQHBhcmFtIGhpc3RvcnkgVGhlIHByZXZpb3VzIHN0YXRlIHRvIHJldHJpZXZlIGhpc3RvcnlcclxuICAgKiBAcGFyYW0gcmVzb2x2ZSBXaGV0aGVyIHN0YXRlIG5vZGVzIHNob3VsZCByZXNvbHZlIHRvIGluaXRpYWwgY2hpbGQgc3RhdGUgbm9kZXNcclxuICAgKi9cblxuICBTdGF0ZU5vZGUucHJvdG90eXBlLmdldFJlbGF0aXZlU3RhdGVOb2RlcyA9IGZ1bmN0aW9uIChyZWxhdGl2ZVN0YXRlSWQsIGhpc3RvcnlWYWx1ZSwgcmVzb2x2ZSkge1xuICAgIGlmIChyZXNvbHZlID09PSB2b2lkIDApIHtcbiAgICAgIHJlc29sdmUgPSB0cnVlO1xuICAgIH1cblxuICAgIHJldHVybiByZXNvbHZlID8gcmVsYXRpdmVTdGF0ZUlkLnR5cGUgPT09ICdoaXN0b3J5JyA/IHJlbGF0aXZlU3RhdGVJZC5yZXNvbHZlSGlzdG9yeShoaXN0b3J5VmFsdWUpIDogcmVsYXRpdmVTdGF0ZUlkLmluaXRpYWxTdGF0ZU5vZGVzIDogW3JlbGF0aXZlU3RhdGVJZF07XG4gIH07XG5cbiAgT2JqZWN0LmRlZmluZVByb3BlcnR5KFN0YXRlTm9kZS5wcm90b3R5cGUsIFwiaW5pdGlhbFN0YXRlTm9kZXNcIiwge1xuICAgIGdldDogZnVuY3Rpb24gKCkge1xuICAgICAgdmFyIF90aGlzID0gdGhpcztcblxuICAgICAgaWYgKGlzTGVhZk5vZGUodGhpcykpIHtcbiAgICAgICAgcmV0dXJuIFt0aGlzXTtcbiAgICAgIH0gLy8gQ2FzZSB3aGVuIHN0YXRlIG5vZGUgaXMgY29tcG91bmQgYnV0IG5vIGluaXRpYWwgc3RhdGUgaXMgZGVmaW5lZFxuXG5cbiAgICAgIGlmICh0aGlzLnR5cGUgPT09ICdjb21wb3VuZCcgJiYgIXRoaXMuaW5pdGlhbCkge1xuICAgICAgICBpZiAoIUlTX1BST0RVQ1RJT04pIHtcbiAgICAgICAgICB3YXJuKGZhbHNlLCBcIkNvbXBvdW5kIHN0YXRlIG5vZGUgJ1wiICsgdGhpcy5pZCArIFwiJyBoYXMgbm8gaW5pdGlhbCBzdGF0ZS5cIik7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gW3RoaXNdO1xuICAgICAgfVxuXG4gICAgICB2YXIgaW5pdGlhbFN0YXRlTm9kZVBhdGhzID0gdG9TdGF0ZVBhdGhzKHRoaXMuaW5pdGlhbFN0YXRlVmFsdWUpO1xuICAgICAgcmV0dXJuIGZsYXR0ZW4oaW5pdGlhbFN0YXRlTm9kZVBhdGhzLm1hcChmdW5jdGlvbiAoaW5pdGlhbFBhdGgpIHtcbiAgICAgICAgcmV0dXJuIF90aGlzLmdldEZyb21SZWxhdGl2ZVBhdGgoaW5pdGlhbFBhdGgpO1xuICAgICAgfSkpO1xuICAgIH0sXG4gICAgZW51bWVyYWJsZTogZmFsc2UsXG4gICAgY29uZmlndXJhYmxlOiB0cnVlXG4gIH0pO1xuICAvKipcclxuICAgKiBSZXRyaWV2ZXMgc3RhdGUgbm9kZXMgZnJvbSBhIHJlbGF0aXZlIHBhdGggdG8gdGhpcyBzdGF0ZSBub2RlLlxyXG4gICAqXHJcbiAgICogQHBhcmFtIHJlbGF0aXZlUGF0aCBUaGUgcmVsYXRpdmUgcGF0aCBmcm9tIHRoaXMgc3RhdGUgbm9kZVxyXG4gICAqIEBwYXJhbSBoaXN0b3J5VmFsdWVcclxuICAgKi9cblxuICBTdGF0ZU5vZGUucHJvdG90eXBlLmdldEZyb21SZWxhdGl2ZVBhdGggPSBmdW5jdGlvbiAocmVsYXRpdmVQYXRoKSB7XG4gICAgaWYgKCFyZWxhdGl2ZVBhdGgubGVuZ3RoKSB7XG4gICAgICByZXR1cm4gW3RoaXNdO1xuICAgIH1cblxuICAgIHZhciBfYSA9IF9fcmVhZChyZWxhdGl2ZVBhdGgpLFxuICAgICAgICBzdGF0ZUtleSA9IF9hWzBdLFxuICAgICAgICBjaGlsZFN0YXRlUGF0aCA9IF9hLnNsaWNlKDEpO1xuXG4gICAgaWYgKCF0aGlzLnN0YXRlcykge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKFwiQ2Fubm90IHJldHJpZXZlIHN1YlBhdGggJ1wiICsgc3RhdGVLZXkgKyBcIicgZnJvbSBub2RlIHdpdGggbm8gc3RhdGVzXCIpO1xuICAgIH1cblxuICAgIHZhciBjaGlsZFN0YXRlTm9kZSA9IHRoaXMuZ2V0U3RhdGVOb2RlKHN0YXRlS2V5KTtcblxuICAgIGlmIChjaGlsZFN0YXRlTm9kZS50eXBlID09PSAnaGlzdG9yeScpIHtcbiAgICAgIHJldHVybiBjaGlsZFN0YXRlTm9kZS5yZXNvbHZlSGlzdG9yeSgpO1xuICAgIH1cblxuICAgIGlmICghdGhpcy5zdGF0ZXNbc3RhdGVLZXldKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXCJDaGlsZCBzdGF0ZSAnXCIgKyBzdGF0ZUtleSArIFwiJyBkb2VzIG5vdCBleGlzdCBvbiAnXCIgKyB0aGlzLmlkICsgXCInXCIpO1xuICAgIH1cblxuICAgIHJldHVybiB0aGlzLnN0YXRlc1tzdGF0ZUtleV0uZ2V0RnJvbVJlbGF0aXZlUGF0aChjaGlsZFN0YXRlUGF0aCk7XG4gIH07XG5cbiAgU3RhdGVOb2RlLnByb3RvdHlwZS5oaXN0b3J5VmFsdWUgPSBmdW5jdGlvbiAocmVsYXRpdmVTdGF0ZVZhbHVlKSB7XG4gICAgaWYgKCFrZXlzKHRoaXMuc3RhdGVzKS5sZW5ndGgpIHtcbiAgICAgIHJldHVybiB1bmRlZmluZWQ7XG4gICAgfVxuXG4gICAgcmV0dXJuIHtcbiAgICAgIGN1cnJlbnQ6IHJlbGF0aXZlU3RhdGVWYWx1ZSB8fCB0aGlzLmluaXRpYWxTdGF0ZVZhbHVlLFxuICAgICAgc3RhdGVzOiBtYXBGaWx0ZXJWYWx1ZXModGhpcy5zdGF0ZXMsIGZ1bmN0aW9uIChzdGF0ZU5vZGUsIGtleSkge1xuICAgICAgICBpZiAoIXJlbGF0aXZlU3RhdGVWYWx1ZSkge1xuICAgICAgICAgIHJldHVybiBzdGF0ZU5vZGUuaGlzdG9yeVZhbHVlKCk7XG4gICAgICAgIH1cblxuICAgICAgICB2YXIgc3ViU3RhdGVWYWx1ZSA9IGlzU3RyaW5nKHJlbGF0aXZlU3RhdGVWYWx1ZSkgPyB1bmRlZmluZWQgOiByZWxhdGl2ZVN0YXRlVmFsdWVba2V5XTtcbiAgICAgICAgcmV0dXJuIHN0YXRlTm9kZS5oaXN0b3J5VmFsdWUoc3ViU3RhdGVWYWx1ZSB8fCBzdGF0ZU5vZGUuaW5pdGlhbFN0YXRlVmFsdWUpO1xuICAgICAgfSwgZnVuY3Rpb24gKHN0YXRlTm9kZSkge1xuICAgICAgICByZXR1cm4gIXN0YXRlTm9kZS5oaXN0b3J5O1xuICAgICAgfSlcbiAgICB9O1xuICB9O1xuICAvKipcclxuICAgKiBSZXNvbHZlcyB0byB0aGUgaGlzdG9yaWNhbCB2YWx1ZShzKSBvZiB0aGUgcGFyZW50IHN0YXRlIG5vZGUsXHJcbiAgICogcmVwcmVzZW50ZWQgYnkgc3RhdGUgbm9kZXMuXHJcbiAgICpcclxuICAgKiBAcGFyYW0gaGlzdG9yeVZhbHVlXHJcbiAgICovXG5cblxuICBTdGF0ZU5vZGUucHJvdG90eXBlLnJlc29sdmVIaXN0b3J5ID0gZnVuY3Rpb24gKGhpc3RvcnlWYWx1ZSkge1xuICAgIHZhciBfdGhpcyA9IHRoaXM7XG5cbiAgICBpZiAodGhpcy50eXBlICE9PSAnaGlzdG9yeScpIHtcbiAgICAgIHJldHVybiBbdGhpc107XG4gICAgfVxuXG4gICAgdmFyIHBhcmVudCA9IHRoaXMucGFyZW50O1xuXG4gICAgaWYgKCFoaXN0b3J5VmFsdWUpIHtcbiAgICAgIHZhciBoaXN0b3J5VGFyZ2V0ID0gdGhpcy50YXJnZXQ7XG4gICAgICByZXR1cm4gaGlzdG9yeVRhcmdldCA/IGZsYXR0ZW4odG9TdGF0ZVBhdGhzKGhpc3RvcnlUYXJnZXQpLm1hcChmdW5jdGlvbiAocmVsYXRpdmVDaGlsZFBhdGgpIHtcbiAgICAgICAgcmV0dXJuIHBhcmVudC5nZXRGcm9tUmVsYXRpdmVQYXRoKHJlbGF0aXZlQ2hpbGRQYXRoKTtcbiAgICAgIH0pKSA6IHBhcmVudC5pbml0aWFsU3RhdGVOb2RlcztcbiAgICB9XG5cbiAgICB2YXIgc3ViSGlzdG9yeVZhbHVlID0gbmVzdGVkUGF0aChwYXJlbnQucGF0aCwgJ3N0YXRlcycpKGhpc3RvcnlWYWx1ZSkuY3VycmVudDtcblxuICAgIGlmIChpc1N0cmluZyhzdWJIaXN0b3J5VmFsdWUpKSB7XG4gICAgICByZXR1cm4gW3BhcmVudC5nZXRTdGF0ZU5vZGUoc3ViSGlzdG9yeVZhbHVlKV07XG4gICAgfVxuXG4gICAgcmV0dXJuIGZsYXR0ZW4odG9TdGF0ZVBhdGhzKHN1Ykhpc3RvcnlWYWx1ZSkubWFwKGZ1bmN0aW9uIChzdWJTdGF0ZVBhdGgpIHtcbiAgICAgIHJldHVybiBfdGhpcy5oaXN0b3J5ID09PSAnZGVlcCcgPyBwYXJlbnQuZ2V0RnJvbVJlbGF0aXZlUGF0aChzdWJTdGF0ZVBhdGgpIDogW3BhcmVudC5zdGF0ZXNbc3ViU3RhdGVQYXRoWzBdXV07XG4gICAgfSkpO1xuICB9O1xuXG4gIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShTdGF0ZU5vZGUucHJvdG90eXBlLCBcInN0YXRlSWRzXCIsIHtcbiAgICAvKipcclxuICAgICAqIEFsbCB0aGUgc3RhdGUgbm9kZSBJRHMgb2YgdGhpcyBzdGF0ZSBub2RlIGFuZCBpdHMgZGVzY2VuZGFudCBzdGF0ZSBub2Rlcy5cclxuICAgICAqL1xuICAgIGdldDogZnVuY3Rpb24gKCkge1xuICAgICAgdmFyIF90aGlzID0gdGhpcztcblxuICAgICAgdmFyIGNoaWxkU3RhdGVJZHMgPSBmbGF0dGVuKGtleXModGhpcy5zdGF0ZXMpLm1hcChmdW5jdGlvbiAoc3RhdGVLZXkpIHtcbiAgICAgICAgcmV0dXJuIF90aGlzLnN0YXRlc1tzdGF0ZUtleV0uc3RhdGVJZHM7XG4gICAgICB9KSk7XG4gICAgICByZXR1cm4gW3RoaXMuaWRdLmNvbmNhdChjaGlsZFN0YXRlSWRzKTtcbiAgICB9LFxuICAgIGVudW1lcmFibGU6IGZhbHNlLFxuICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZVxuICB9KTtcbiAgT2JqZWN0LmRlZmluZVByb3BlcnR5KFN0YXRlTm9kZS5wcm90b3R5cGUsIFwiZXZlbnRzXCIsIHtcbiAgICAvKipcclxuICAgICAqIEFsbCB0aGUgZXZlbnQgdHlwZXMgYWNjZXB0ZWQgYnkgdGhpcyBzdGF0ZSBub2RlIGFuZCBpdHMgZGVzY2VuZGFudHMuXHJcbiAgICAgKi9cbiAgICBnZXQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgIHZhciBlXzcsIF9hLCBlXzgsIF9iO1xuXG4gICAgICBpZiAodGhpcy5fX2NhY2hlLmV2ZW50cykge1xuICAgICAgICByZXR1cm4gdGhpcy5fX2NhY2hlLmV2ZW50cztcbiAgICAgIH1cblxuICAgICAgdmFyIHN0YXRlcyA9IHRoaXMuc3RhdGVzO1xuICAgICAgdmFyIGV2ZW50cyA9IG5ldyBTZXQodGhpcy5vd25FdmVudHMpO1xuXG4gICAgICBpZiAoc3RhdGVzKSB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgZm9yICh2YXIgX2MgPSBfX3ZhbHVlcyhrZXlzKHN0YXRlcykpLCBfZCA9IF9jLm5leHQoKTsgIV9kLmRvbmU7IF9kID0gX2MubmV4dCgpKSB7XG4gICAgICAgICAgICB2YXIgc3RhdGVJZCA9IF9kLnZhbHVlO1xuICAgICAgICAgICAgdmFyIHN0YXRlID0gc3RhdGVzW3N0YXRlSWRdO1xuXG4gICAgICAgICAgICBpZiAoc3RhdGUuc3RhdGVzKSB7XG4gICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgZm9yICh2YXIgX2UgPSAoZV84ID0gdm9pZCAwLCBfX3ZhbHVlcyhzdGF0ZS5ldmVudHMpKSwgX2YgPSBfZS5uZXh0KCk7ICFfZi5kb25lOyBfZiA9IF9lLm5leHQoKSkge1xuICAgICAgICAgICAgICAgICAgdmFyIGV2ZW50XzEgPSBfZi52YWx1ZTtcbiAgICAgICAgICAgICAgICAgIGV2ZW50cy5hZGQoXCJcIiArIGV2ZW50XzEpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgfSBjYXRjaCAoZV84XzEpIHtcbiAgICAgICAgICAgICAgICBlXzggPSB7XG4gICAgICAgICAgICAgICAgICBlcnJvcjogZV84XzFcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICB9IGZpbmFsbHkge1xuICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICBpZiAoX2YgJiYgIV9mLmRvbmUgJiYgKF9iID0gX2UucmV0dXJuKSkgX2IuY2FsbChfZSk7XG4gICAgICAgICAgICAgICAgfSBmaW5hbGx5IHtcbiAgICAgICAgICAgICAgICAgIGlmIChlXzgpIHRocm93IGVfOC5lcnJvcjtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH0gY2F0Y2ggKGVfN18xKSB7XG4gICAgICAgICAgZV83ID0ge1xuICAgICAgICAgICAgZXJyb3I6IGVfN18xXG4gICAgICAgICAgfTtcbiAgICAgICAgfSBmaW5hbGx5IHtcbiAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgaWYgKF9kICYmICFfZC5kb25lICYmIChfYSA9IF9jLnJldHVybikpIF9hLmNhbGwoX2MpO1xuICAgICAgICAgIH0gZmluYWxseSB7XG4gICAgICAgICAgICBpZiAoZV83KSB0aHJvdyBlXzcuZXJyb3I7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIHJldHVybiB0aGlzLl9fY2FjaGUuZXZlbnRzID0gQXJyYXkuZnJvbShldmVudHMpO1xuICAgIH0sXG4gICAgZW51bWVyYWJsZTogZmFsc2UsXG4gICAgY29uZmlndXJhYmxlOiB0cnVlXG4gIH0pO1xuICBPYmplY3QuZGVmaW5lUHJvcGVydHkoU3RhdGVOb2RlLnByb3RvdHlwZSwgXCJvd25FdmVudHNcIiwge1xuICAgIC8qKlxyXG4gICAgICogQWxsIHRoZSBldmVudHMgdGhhdCBoYXZlIHRyYW5zaXRpb25zIGRpcmVjdGx5IGZyb20gdGhpcyBzdGF0ZSBub2RlLlxyXG4gICAgICpcclxuICAgICAqIEV4Y2x1ZGVzIGFueSBpbmVydCBldmVudHMuXHJcbiAgICAgKi9cbiAgICBnZXQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgIHZhciBldmVudHMgPSBuZXcgU2V0KHRoaXMudHJhbnNpdGlvbnMuZmlsdGVyKGZ1bmN0aW9uICh0cmFuc2l0aW9uKSB7XG4gICAgICAgIHJldHVybiAhKCF0cmFuc2l0aW9uLnRhcmdldCAmJiAhdHJhbnNpdGlvbi5hY3Rpb25zLmxlbmd0aCAmJiB0cmFuc2l0aW9uLmludGVybmFsKTtcbiAgICAgIH0pLm1hcChmdW5jdGlvbiAodHJhbnNpdGlvbikge1xuICAgICAgICByZXR1cm4gdHJhbnNpdGlvbi5ldmVudFR5cGU7XG4gICAgICB9KSk7XG4gICAgICByZXR1cm4gQXJyYXkuZnJvbShldmVudHMpO1xuICAgIH0sXG4gICAgZW51bWVyYWJsZTogZmFsc2UsXG4gICAgY29uZmlndXJhYmxlOiB0cnVlXG4gIH0pO1xuXG4gIFN0YXRlTm9kZS5wcm90b3R5cGUucmVzb2x2ZVRhcmdldCA9IGZ1bmN0aW9uIChfdGFyZ2V0KSB7XG4gICAgdmFyIF90aGlzID0gdGhpcztcblxuICAgIGlmIChfdGFyZ2V0ID09PSB1bmRlZmluZWQpIHtcbiAgICAgIC8vIGFuIHVuZGVmaW5lZCB0YXJnZXQgc2lnbmFscyB0aGF0IHRoZSBzdGF0ZSBub2RlIHNob3VsZCBub3QgdHJhbnNpdGlvbiBmcm9tIHRoYXQgc3RhdGUgd2hlbiByZWNlaXZpbmcgdGhhdCBldmVudFxuICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgICB9XG5cbiAgICByZXR1cm4gX3RhcmdldC5tYXAoZnVuY3Rpb24gKHRhcmdldCkge1xuICAgICAgaWYgKCFpc1N0cmluZyh0YXJnZXQpKSB7XG4gICAgICAgIHJldHVybiB0YXJnZXQ7XG4gICAgICB9XG5cbiAgICAgIHZhciBpc0ludGVybmFsVGFyZ2V0ID0gdGFyZ2V0WzBdID09PSBfdGhpcy5kZWxpbWl0ZXI7IC8vIElmIGludGVybmFsIHRhcmdldCBpcyBkZWZpbmVkIG9uIG1hY2hpbmUsXG4gICAgICAvLyBkbyBub3QgaW5jbHVkZSBtYWNoaW5lIGtleSBvbiB0YXJnZXRcblxuICAgICAgaWYgKGlzSW50ZXJuYWxUYXJnZXQgJiYgIV90aGlzLnBhcmVudCkge1xuICAgICAgICByZXR1cm4gX3RoaXMuZ2V0U3RhdGVOb2RlQnlQYXRoKHRhcmdldC5zbGljZSgxKSk7XG4gICAgICB9XG5cbiAgICAgIHZhciByZXNvbHZlZFRhcmdldCA9IGlzSW50ZXJuYWxUYXJnZXQgPyBfdGhpcy5rZXkgKyB0YXJnZXQgOiB0YXJnZXQ7XG5cbiAgICAgIGlmIChfdGhpcy5wYXJlbnQpIHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICB2YXIgdGFyZ2V0U3RhdGVOb2RlID0gX3RoaXMucGFyZW50LmdldFN0YXRlTm9kZUJ5UGF0aChyZXNvbHZlZFRhcmdldCk7XG5cbiAgICAgICAgICByZXR1cm4gdGFyZ2V0U3RhdGVOb2RlO1xuICAgICAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJJbnZhbGlkIHRyYW5zaXRpb24gZGVmaW5pdGlvbiBmb3Igc3RhdGUgbm9kZSAnXCIgKyBfdGhpcy5pZCArIFwiJzpcXG5cIiArIGVyci5tZXNzYWdlKTtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIF90aGlzLmdldFN0YXRlTm9kZUJ5UGF0aChyZXNvbHZlZFRhcmdldCk7XG4gICAgICB9XG4gICAgfSk7XG4gIH07XG5cbiAgU3RhdGVOb2RlLnByb3RvdHlwZS5mb3JtYXRUcmFuc2l0aW9uID0gZnVuY3Rpb24gKHRyYW5zaXRpb25Db25maWcpIHtcbiAgICB2YXIgX3RoaXMgPSB0aGlzO1xuXG4gICAgdmFyIG5vcm1hbGl6ZWRUYXJnZXQgPSBub3JtYWxpemVUYXJnZXQodHJhbnNpdGlvbkNvbmZpZy50YXJnZXQpO1xuICAgIHZhciBpbnRlcm5hbCA9ICdpbnRlcm5hbCcgaW4gdHJhbnNpdGlvbkNvbmZpZyA/IHRyYW5zaXRpb25Db25maWcuaW50ZXJuYWwgOiBub3JtYWxpemVkVGFyZ2V0ID8gbm9ybWFsaXplZFRhcmdldC5zb21lKGZ1bmN0aW9uIChfdGFyZ2V0KSB7XG4gICAgICByZXR1cm4gaXNTdHJpbmcoX3RhcmdldCkgJiYgX3RhcmdldFswXSA9PT0gX3RoaXMuZGVsaW1pdGVyO1xuICAgIH0pIDogdHJ1ZTtcbiAgICB2YXIgZ3VhcmRzID0gdGhpcy5tYWNoaW5lLm9wdGlvbnMuZ3VhcmRzO1xuICAgIHZhciB0YXJnZXQgPSB0aGlzLnJlc29sdmVUYXJnZXQobm9ybWFsaXplZFRhcmdldCk7XG5cbiAgICB2YXIgdHJhbnNpdGlvbiA9IF9fYXNzaWduKF9fYXNzaWduKHt9LCB0cmFuc2l0aW9uQ29uZmlnKSwge1xuICAgICAgYWN0aW9uczogdG9BY3Rpb25PYmplY3RzKHRvQXJyYXkodHJhbnNpdGlvbkNvbmZpZy5hY3Rpb25zKSksXG4gICAgICBjb25kOiB0b0d1YXJkKHRyYW5zaXRpb25Db25maWcuY29uZCwgZ3VhcmRzKSxcbiAgICAgIHRhcmdldDogdGFyZ2V0LFxuICAgICAgc291cmNlOiB0aGlzLFxuICAgICAgaW50ZXJuYWw6IGludGVybmFsLFxuICAgICAgZXZlbnRUeXBlOiB0cmFuc2l0aW9uQ29uZmlnLmV2ZW50LFxuICAgICAgdG9KU09OOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJldHVybiBfX2Fzc2lnbihfX2Fzc2lnbih7fSwgdHJhbnNpdGlvbiksIHtcbiAgICAgICAgICB0YXJnZXQ6IHRyYW5zaXRpb24udGFyZ2V0ID8gdHJhbnNpdGlvbi50YXJnZXQubWFwKGZ1bmN0aW9uICh0KSB7XG4gICAgICAgICAgICByZXR1cm4gXCIjXCIgKyB0LmlkO1xuICAgICAgICAgIH0pIDogdW5kZWZpbmVkLFxuICAgICAgICAgIHNvdXJjZTogXCIjXCIgKyBfdGhpcy5pZFxuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIHJldHVybiB0cmFuc2l0aW9uO1xuICB9O1xuXG4gIFN0YXRlTm9kZS5wcm90b3R5cGUuZm9ybWF0VHJhbnNpdGlvbnMgPSBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIGVfOSwgX2E7XG5cbiAgICB2YXIgX3RoaXMgPSB0aGlzO1xuXG4gICAgdmFyIG9uQ29uZmlnO1xuXG4gICAgaWYgKCF0aGlzLmNvbmZpZy5vbikge1xuICAgICAgb25Db25maWcgPSBbXTtcbiAgICB9IGVsc2UgaWYgKEFycmF5LmlzQXJyYXkodGhpcy5jb25maWcub24pKSB7XG4gICAgICBvbkNvbmZpZyA9IHRoaXMuY29uZmlnLm9uO1xuICAgIH0gZWxzZSB7XG4gICAgICB2YXIgX2IgPSB0aGlzLmNvbmZpZy5vbixcbiAgICAgICAgICBfYyA9IFdJTERDQVJELFxuICAgICAgICAgIF9kID0gX2JbX2NdLFxuICAgICAgICAgIHdpbGRjYXJkQ29uZmlncyA9IF9kID09PSB2b2lkIDAgPyBbXSA6IF9kLFxuICAgICAgICAgIHN0cmljdFRyYW5zaXRpb25Db25maWdzXzEgPSBfX3Jlc3QoX2IsIFt0eXBlb2YgX2MgPT09IFwic3ltYm9sXCIgPyBfYyA6IF9jICsgXCJcIl0pO1xuXG4gICAgICBvbkNvbmZpZyA9IGZsYXR0ZW4oa2V5cyhzdHJpY3RUcmFuc2l0aW9uQ29uZmlnc18xKS5tYXAoZnVuY3Rpb24gKGtleSkge1xuICAgICAgICBpZiAoIUlTX1BST0RVQ1RJT04gJiYga2V5ID09PSBOVUxMX0VWRU5UKSB7XG4gICAgICAgICAgd2FybihmYWxzZSwgXCJFbXB0eSBzdHJpbmcgdHJhbnNpdGlvbiBjb25maWdzIChlLmcuLCBgeyBvbjogeyAnJzogLi4uIH19YCkgZm9yIHRyYW5zaWVudCB0cmFuc2l0aW9ucyBhcmUgZGVwcmVjYXRlZC4gU3BlY2lmeSB0aGUgdHJhbnNpdGlvbiBpbiB0aGUgYHsgYWx3YXlzOiAuLi4gfWAgcHJvcGVydHkgaW5zdGVhZC4gXCIgKyAoXCJQbGVhc2UgY2hlY2sgdGhlIGBvbmAgY29uZmlndXJhdGlvbiBmb3IgXFxcIiNcIiArIF90aGlzLmlkICsgXCJcXFwiLlwiKSk7XG4gICAgICAgIH1cblxuICAgICAgICB2YXIgdHJhbnNpdGlvbkNvbmZpZ0FycmF5ID0gdG9UcmFuc2l0aW9uQ29uZmlnQXJyYXkoa2V5LCBzdHJpY3RUcmFuc2l0aW9uQ29uZmlnc18xW2tleV0pO1xuXG4gICAgICAgIGlmICghSVNfUFJPRFVDVElPTikge1xuICAgICAgICAgIHZhbGlkYXRlQXJyYXlpZmllZFRyYW5zaXRpb25zKF90aGlzLCBrZXksIHRyYW5zaXRpb25Db25maWdBcnJheSk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gdHJhbnNpdGlvbkNvbmZpZ0FycmF5O1xuICAgICAgfSkuY29uY2F0KHRvVHJhbnNpdGlvbkNvbmZpZ0FycmF5KFdJTERDQVJELCB3aWxkY2FyZENvbmZpZ3MpKSk7XG4gICAgfVxuXG4gICAgdmFyIGV2ZW50bGVzc0NvbmZpZyA9IHRoaXMuY29uZmlnLmFsd2F5cyA/IHRvVHJhbnNpdGlvbkNvbmZpZ0FycmF5KCcnLCB0aGlzLmNvbmZpZy5hbHdheXMpIDogW107XG4gICAgdmFyIGRvbmVDb25maWcgPSB0aGlzLmNvbmZpZy5vbkRvbmUgPyB0b1RyYW5zaXRpb25Db25maWdBcnJheShTdHJpbmcoZG9uZSh0aGlzLmlkKSksIHRoaXMuY29uZmlnLm9uRG9uZSkgOiBbXTtcblxuICAgIGlmICghSVNfUFJPRFVDVElPTikge1xuICAgICAgd2FybighKHRoaXMuY29uZmlnLm9uRG9uZSAmJiAhdGhpcy5wYXJlbnQpLCBcIlJvb3Qgbm9kZXMgY2Fubm90IGhhdmUgYW4gXFxcIi5vbkRvbmVcXFwiIHRyYW5zaXRpb24uIFBsZWFzZSBjaGVjayB0aGUgY29uZmlnIG9mIFxcXCJcIiArIHRoaXMuaWQgKyBcIlxcXCIuXCIpO1xuICAgIH1cblxuICAgIHZhciBpbnZva2VDb25maWcgPSBmbGF0dGVuKHRoaXMuaW52b2tlLm1hcChmdW5jdGlvbiAoaW52b2tlRGVmKSB7XG4gICAgICB2YXIgc2V0dGxlVHJhbnNpdGlvbnMgPSBbXTtcblxuICAgICAgaWYgKGludm9rZURlZi5vbkRvbmUpIHtcbiAgICAgICAgc2V0dGxlVHJhbnNpdGlvbnMucHVzaC5hcHBseShzZXR0bGVUcmFuc2l0aW9ucywgX19zcHJlYWQodG9UcmFuc2l0aW9uQ29uZmlnQXJyYXkoU3RyaW5nKGRvbmVJbnZva2UoaW52b2tlRGVmLmlkKSksIGludm9rZURlZi5vbkRvbmUpKSk7XG4gICAgICB9XG5cbiAgICAgIGlmIChpbnZva2VEZWYub25FcnJvcikge1xuICAgICAgICBzZXR0bGVUcmFuc2l0aW9ucy5wdXNoLmFwcGx5KHNldHRsZVRyYW5zaXRpb25zLCBfX3NwcmVhZCh0b1RyYW5zaXRpb25Db25maWdBcnJheShTdHJpbmcoZXJyb3IoaW52b2tlRGVmLmlkKSksIGludm9rZURlZi5vbkVycm9yKSkpO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gc2V0dGxlVHJhbnNpdGlvbnM7XG4gICAgfSkpO1xuICAgIHZhciBkZWxheWVkVHJhbnNpdGlvbnMgPSB0aGlzLmFmdGVyO1xuICAgIHZhciBmb3JtYXR0ZWRUcmFuc2l0aW9ucyA9IGZsYXR0ZW4oX19zcHJlYWQoZG9uZUNvbmZpZywgaW52b2tlQ29uZmlnLCBvbkNvbmZpZywgZXZlbnRsZXNzQ29uZmlnKS5tYXAoZnVuY3Rpb24gKHRyYW5zaXRpb25Db25maWcpIHtcbiAgICAgIHJldHVybiB0b0FycmF5KHRyYW5zaXRpb25Db25maWcpLm1hcChmdW5jdGlvbiAodHJhbnNpdGlvbikge1xuICAgICAgICByZXR1cm4gX3RoaXMuZm9ybWF0VHJhbnNpdGlvbih0cmFuc2l0aW9uKTtcbiAgICAgIH0pO1xuICAgIH0pKTtcblxuICAgIHRyeSB7XG4gICAgICBmb3IgKHZhciBkZWxheWVkVHJhbnNpdGlvbnNfMSA9IF9fdmFsdWVzKGRlbGF5ZWRUcmFuc2l0aW9ucyksIGRlbGF5ZWRUcmFuc2l0aW9uc18xXzEgPSBkZWxheWVkVHJhbnNpdGlvbnNfMS5uZXh0KCk7ICFkZWxheWVkVHJhbnNpdGlvbnNfMV8xLmRvbmU7IGRlbGF5ZWRUcmFuc2l0aW9uc18xXzEgPSBkZWxheWVkVHJhbnNpdGlvbnNfMS5uZXh0KCkpIHtcbiAgICAgICAgdmFyIGRlbGF5ZWRUcmFuc2l0aW9uID0gZGVsYXllZFRyYW5zaXRpb25zXzFfMS52YWx1ZTtcbiAgICAgICAgZm9ybWF0dGVkVHJhbnNpdGlvbnMucHVzaChkZWxheWVkVHJhbnNpdGlvbik7XG4gICAgICB9XG4gICAgfSBjYXRjaCAoZV85XzEpIHtcbiAgICAgIGVfOSA9IHtcbiAgICAgICAgZXJyb3I6IGVfOV8xXG4gICAgICB9O1xuICAgIH0gZmluYWxseSB7XG4gICAgICB0cnkge1xuICAgICAgICBpZiAoZGVsYXllZFRyYW5zaXRpb25zXzFfMSAmJiAhZGVsYXllZFRyYW5zaXRpb25zXzFfMS5kb25lICYmIChfYSA9IGRlbGF5ZWRUcmFuc2l0aW9uc18xLnJldHVybikpIF9hLmNhbGwoZGVsYXllZFRyYW5zaXRpb25zXzEpO1xuICAgICAgfSBmaW5hbGx5IHtcbiAgICAgICAgaWYgKGVfOSkgdGhyb3cgZV85LmVycm9yO1xuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBmb3JtYXR0ZWRUcmFuc2l0aW9ucztcbiAgfTtcblxuICByZXR1cm4gU3RhdGVOb2RlO1xufSgpO1xuXG5leHBvcnQgeyBTdGF0ZU5vZGUgfTsiLCJpbXBvcnQgeyBTdGF0ZU5vZGUgfSBmcm9tICcuL1N0YXRlTm9kZS5qcyc7XG5cbmZ1bmN0aW9uIE1hY2hpbmUoY29uZmlnLCBvcHRpb25zLCBpbml0aWFsQ29udGV4dCkge1xuICBpZiAoaW5pdGlhbENvbnRleHQgPT09IHZvaWQgMCkge1xuICAgIGluaXRpYWxDb250ZXh0ID0gY29uZmlnLmNvbnRleHQ7XG4gIH1cblxuICB2YXIgcmVzb2x2ZWRJbml0aWFsQ29udGV4dCA9IHR5cGVvZiBpbml0aWFsQ29udGV4dCA9PT0gJ2Z1bmN0aW9uJyA/IGluaXRpYWxDb250ZXh0KCkgOiBpbml0aWFsQ29udGV4dDtcbiAgcmV0dXJuIG5ldyBTdGF0ZU5vZGUoY29uZmlnLCBvcHRpb25zLCByZXNvbHZlZEluaXRpYWxDb250ZXh0KTtcbn1cblxuZnVuY3Rpb24gY3JlYXRlTWFjaGluZShjb25maWcsIG9wdGlvbnMpIHtcbiAgdmFyIHJlc29sdmVkSW5pdGlhbENvbnRleHQgPSB0eXBlb2YgY29uZmlnLmNvbnRleHQgPT09ICdmdW5jdGlvbicgPyBjb25maWcuY29udGV4dCgpIDogY29uZmlnLmNvbnRleHQ7XG4gIHJldHVybiBuZXcgU3RhdGVOb2RlKGNvbmZpZywgb3B0aW9ucywgcmVzb2x2ZWRJbml0aWFsQ29udGV4dCk7XG59XG5cbmV4cG9ydCB7IE1hY2hpbmUsIGNyZWF0ZU1hY2hpbmUgfTsiLCJpbXBvcnQgeyBfX2Fzc2lnbiB9IGZyb20gJy4vX3ZpcnR1YWwvX3RzbGliLmpzJztcbnZhciBkZWZhdWx0T3B0aW9ucyA9IHtcbiAgZGVmZXJFdmVudHM6IGZhbHNlXG59O1xuXG52YXIgU2NoZWR1bGVyID1cbi8qI19fUFVSRV9fKi9cblxuLyoqIEBjbGFzcyAqL1xuZnVuY3Rpb24gKCkge1xuICBmdW5jdGlvbiBTY2hlZHVsZXIob3B0aW9ucykge1xuICAgIHRoaXMucHJvY2Vzc2luZ0V2ZW50ID0gZmFsc2U7XG4gICAgdGhpcy5xdWV1ZSA9IFtdO1xuICAgIHRoaXMuaW5pdGlhbGl6ZWQgPSBmYWxzZTtcbiAgICB0aGlzLm9wdGlvbnMgPSBfX2Fzc2lnbihfX2Fzc2lnbih7fSwgZGVmYXVsdE9wdGlvbnMpLCBvcHRpb25zKTtcbiAgfVxuXG4gIFNjaGVkdWxlci5wcm90b3R5cGUuaW5pdGlhbGl6ZSA9IGZ1bmN0aW9uIChjYWxsYmFjaykge1xuICAgIHRoaXMuaW5pdGlhbGl6ZWQgPSB0cnVlO1xuXG4gICAgaWYgKGNhbGxiYWNrKSB7XG4gICAgICBpZiAoIXRoaXMub3B0aW9ucy5kZWZlckV2ZW50cykge1xuICAgICAgICB0aGlzLnNjaGVkdWxlKGNhbGxiYWNrKTtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICB0aGlzLnByb2Nlc3MoY2FsbGJhY2spO1xuICAgIH1cblxuICAgIHRoaXMuZmx1c2hFdmVudHMoKTtcbiAgfTtcblxuICBTY2hlZHVsZXIucHJvdG90eXBlLnNjaGVkdWxlID0gZnVuY3Rpb24gKHRhc2spIHtcbiAgICBpZiAoIXRoaXMuaW5pdGlhbGl6ZWQgfHwgdGhpcy5wcm9jZXNzaW5nRXZlbnQpIHtcbiAgICAgIHRoaXMucXVldWUucHVzaCh0YXNrKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBpZiAodGhpcy5xdWV1ZS5sZW5ndGggIT09IDApIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignRXZlbnQgcXVldWUgc2hvdWxkIGJlIGVtcHR5IHdoZW4gaXQgaXMgbm90IHByb2Nlc3NpbmcgZXZlbnRzJyk7XG4gICAgfVxuXG4gICAgdGhpcy5wcm9jZXNzKHRhc2spO1xuICAgIHRoaXMuZmx1c2hFdmVudHMoKTtcbiAgfTtcblxuICBTY2hlZHVsZXIucHJvdG90eXBlLmNsZWFyID0gZnVuY3Rpb24gKCkge1xuICAgIHRoaXMucXVldWUgPSBbXTtcbiAgfTtcblxuICBTY2hlZHVsZXIucHJvdG90eXBlLmZsdXNoRXZlbnRzID0gZnVuY3Rpb24gKCkge1xuICAgIHZhciBuZXh0Q2FsbGJhY2sgPSB0aGlzLnF1ZXVlLnNoaWZ0KCk7XG5cbiAgICB3aGlsZSAobmV4dENhbGxiYWNrKSB7XG4gICAgICB0aGlzLnByb2Nlc3MobmV4dENhbGxiYWNrKTtcbiAgICAgIG5leHRDYWxsYmFjayA9IHRoaXMucXVldWUuc2hpZnQoKTtcbiAgICB9XG4gIH07XG5cbiAgU2NoZWR1bGVyLnByb3RvdHlwZS5wcm9jZXNzID0gZnVuY3Rpb24gKGNhbGxiYWNrKSB7XG4gICAgdGhpcy5wcm9jZXNzaW5nRXZlbnQgPSB0cnVlO1xuXG4gICAgdHJ5IHtcbiAgICAgIGNhbGxiYWNrKCk7XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgLy8gdGhlcmUgaXMgbm8gdXNlIHRvIGtlZXAgdGhlIGZ1dHVyZSBldmVudHNcbiAgICAgIC8vIGFzIHRoZSBzaXR1YXRpb24gaXMgbm90IGFueW1vcmUgdGhlIHNhbWVcbiAgICAgIHRoaXMuY2xlYXIoKTtcbiAgICAgIHRocm93IGU7XG4gICAgfSBmaW5hbGx5IHtcbiAgICAgIHRoaXMucHJvY2Vzc2luZ0V2ZW50ID0gZmFsc2U7XG4gICAgfVxuICB9O1xuXG4gIHJldHVybiBTY2hlZHVsZXI7XG59KCk7XG5cbmV4cG9ydCB7IFNjaGVkdWxlciB9OyIsInZhciBjaGlsZHJlbiA9IC8qI19fUFVSRV9fKi9uZXcgTWFwKCk7XG52YXIgc2Vzc2lvbklkSW5kZXggPSAwO1xudmFyIHJlZ2lzdHJ5ID0ge1xuICBib29rSWQ6IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gXCJ4OlwiICsgc2Vzc2lvbklkSW5kZXgrKztcbiAgfSxcbiAgcmVnaXN0ZXI6IGZ1bmN0aW9uIChpZCwgYWN0b3IpIHtcbiAgICBjaGlsZHJlbi5zZXQoaWQsIGFjdG9yKTtcbiAgICByZXR1cm4gaWQ7XG4gIH0sXG4gIGdldDogZnVuY3Rpb24gKGlkKSB7XG4gICAgcmV0dXJuIGNoaWxkcmVuLmdldChpZCk7XG4gIH0sXG4gIGZyZWU6IGZ1bmN0aW9uIChpZCkge1xuICAgIGNoaWxkcmVuLmRlbGV0ZShpZCk7XG4gIH1cbn07XG5leHBvcnQgeyByZWdpc3RyeSB9OyIsImltcG9ydCB7IElTX1BST0RVQ1RJT04gfSBmcm9tICcuL2Vudmlyb25tZW50LmpzJzsgLy8gRnJvbSBodHRwczovL2RldmVsb3Blci5tb3ppbGxhLm9yZy9lbi1VUy9kb2NzL1dlYi9KYXZhU2NyaXB0L1JlZmVyZW5jZS9HbG9iYWxfT2JqZWN0cy9nbG9iYWxUaGlzXG5cbmZ1bmN0aW9uIGdldEdsb2JhbCgpIHtcbiAgaWYgKHR5cGVvZiBzZWxmICE9PSAndW5kZWZpbmVkJykge1xuICAgIHJldHVybiBzZWxmO1xuICB9XG5cbiAgaWYgKHR5cGVvZiB3aW5kb3cgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgcmV0dXJuIHdpbmRvdztcbiAgfVxuXG4gIGlmICh0eXBlb2YgZ2xvYmFsICE9PSAndW5kZWZpbmVkJykge1xuICAgIHJldHVybiBnbG9iYWw7XG4gIH1cblxuICByZXR1cm4gdW5kZWZpbmVkO1xufVxuXG5mdW5jdGlvbiBnZXREZXZUb29scygpIHtcbiAgdmFyIGdsb2JhbCA9IGdldEdsb2JhbCgpO1xuXG4gIGlmIChnbG9iYWwgJiYgJ19feHN0YXRlX18nIGluIGdsb2JhbCkge1xuICAgIHJldHVybiBnbG9iYWwuX194c3RhdGVfXztcbiAgfVxuXG4gIHJldHVybiB1bmRlZmluZWQ7XG59XG5cbmZ1bmN0aW9uIHJlZ2lzdGVyU2VydmljZShzZXJ2aWNlKSB7XG4gIGlmIChJU19QUk9EVUNUSU9OIHx8ICFnZXRHbG9iYWwoKSkge1xuICAgIHJldHVybjtcbiAgfVxuXG4gIHZhciBkZXZUb29scyA9IGdldERldlRvb2xzKCk7XG5cbiAgaWYgKGRldlRvb2xzKSB7XG4gICAgZGV2VG9vbHMucmVnaXN0ZXIoc2VydmljZSk7XG4gIH1cbn1cblxuZXhwb3J0IHsgZ2V0R2xvYmFsLCByZWdpc3RlclNlcnZpY2UgfTsiLCJpbXBvcnQgeyBfX3ZhbHVlcywgX19hc3NpZ24sIF9fc3ByZWFkIH0gZnJvbSAnLi9fdmlydHVhbC9fdHNsaWIuanMnO1xuaW1wb3J0IHsgSVNfUFJPRFVDVElPTiB9IGZyb20gJy4vZW52aXJvbm1lbnQuanMnO1xuaW1wb3J0IHsgd2FybiwgbWFwQ29udGV4dCwgaXNGdW5jdGlvbiwga2V5cywgdG9TQ1hNTEV2ZW50LCB0b0ludm9rZVNvdXJjZSwgaXNQcm9taXNlTGlrZSwgaXNPYnNlcnZhYmxlLCBpc01hY2hpbmUsIHJlcG9ydFVuaGFuZGxlZEV4Y2VwdGlvbk9uSW52b2NhdGlvbiwgc3ltYm9sT2JzZXJ2YWJsZSwgaXNBcnJheSwgdG9FdmVudE9iamVjdCwgaXNTdHJpbmcsIGlzQWN0b3IsIHVuaXF1ZUlkLCB0b09ic2VydmVyIH0gZnJvbSAnLi91dGlscy5qcyc7XG5pbXBvcnQgeyBBY3Rpb25UeXBlcywgU3BlY2lhbFRhcmdldHMgfSBmcm9tICcuL3R5cGVzLmpzJztcbmltcG9ydCB7IGlzSW5GaW5hbFN0YXRlIH0gZnJvbSAnLi9zdGF0ZVV0aWxzLmpzJztcbmltcG9ydCB7IGVycm9yUGxhdGZvcm0sIGxvZywgc3RvcCwgc3RhcnQsIGNhbmNlbCwgc2VuZCwgdXBkYXRlLCBlcnJvciBhcyBlcnJvciQxIH0gZnJvbSAnLi9hY3Rpb25UeXBlcy5qcyc7XG5pbXBvcnQgeyBkb25lSW52b2tlLCBpbml0RXZlbnQsIGdldEFjdGlvbkZ1bmN0aW9uLCBlcnJvciB9IGZyb20gJy4vYWN0aW9ucy5qcyc7XG5pbXBvcnQgeyBpc1N0YXRlLCBTdGF0ZSwgYmluZEFjdGlvblRvU3RhdGUgfSBmcm9tICcuL1N0YXRlLmpzJztcbmltcG9ydCB7IHByb3ZpZGUsIGNvbnN1bWUgfSBmcm9tICcuL3NlcnZpY2VTY29wZS5qcyc7XG5pbXBvcnQgeyBpc1NwYXduZWRBY3RvciwgY3JlYXRlRGVmZXJyZWRBY3RvciB9IGZyb20gJy4vQWN0b3IuanMnO1xuaW1wb3J0IHsgU2NoZWR1bGVyIH0gZnJvbSAnLi9zY2hlZHVsZXIuanMnO1xuaW1wb3J0IHsgcmVnaXN0cnkgfSBmcm9tICcuL3JlZ2lzdHJ5LmpzJztcbmltcG9ydCB7IHJlZ2lzdGVyU2VydmljZSwgZ2V0R2xvYmFsIH0gZnJvbSAnLi9kZXZUb29scy5qcyc7XG52YXIgREVGQVVMVF9TUEFXTl9PUFRJT05TID0ge1xuICBzeW5jOiBmYWxzZSxcbiAgYXV0b0ZvcndhcmQ6IGZhbHNlXG59O1xudmFyIEludGVycHJldGVyU3RhdHVzO1xuXG4oZnVuY3Rpb24gKEludGVycHJldGVyU3RhdHVzKSB7XG4gIEludGVycHJldGVyU3RhdHVzW0ludGVycHJldGVyU3RhdHVzW1wiTm90U3RhcnRlZFwiXSA9IDBdID0gXCJOb3RTdGFydGVkXCI7XG4gIEludGVycHJldGVyU3RhdHVzW0ludGVycHJldGVyU3RhdHVzW1wiUnVubmluZ1wiXSA9IDFdID0gXCJSdW5uaW5nXCI7XG4gIEludGVycHJldGVyU3RhdHVzW0ludGVycHJldGVyU3RhdHVzW1wiU3RvcHBlZFwiXSA9IDJdID0gXCJTdG9wcGVkXCI7XG59KShJbnRlcnByZXRlclN0YXR1cyB8fCAoSW50ZXJwcmV0ZXJTdGF0dXMgPSB7fSkpO1xuXG52YXIgSW50ZXJwcmV0ZXIgPVxuLyojX19QVVJFX18qL1xuXG4vKiogQGNsYXNzICovXG5mdW5jdGlvbiAoKSB7XG4gIC8qKlxyXG4gICAqIENyZWF0ZXMgYSBuZXcgSW50ZXJwcmV0ZXIgaW5zdGFuY2UgKGkuZS4sIHNlcnZpY2UpIGZvciB0aGUgZ2l2ZW4gbWFjaGluZSB3aXRoIHRoZSBwcm92aWRlZCBvcHRpb25zLCBpZiBhbnkuXHJcbiAgICpcclxuICAgKiBAcGFyYW0gbWFjaGluZSBUaGUgbWFjaGluZSB0byBiZSBpbnRlcnByZXRlZFxyXG4gICAqIEBwYXJhbSBvcHRpb25zIEludGVycHJldGVyIG9wdGlvbnNcclxuICAgKi9cbiAgZnVuY3Rpb24gSW50ZXJwcmV0ZXIobWFjaGluZSwgb3B0aW9ucykge1xuICAgIHZhciBfdGhpcyA9IHRoaXM7XG5cbiAgICBpZiAob3B0aW9ucyA9PT0gdm9pZCAwKSB7XG4gICAgICBvcHRpb25zID0gSW50ZXJwcmV0ZXIuZGVmYXVsdE9wdGlvbnM7XG4gICAgfVxuXG4gICAgdGhpcy5tYWNoaW5lID0gbWFjaGluZTtcbiAgICB0aGlzLnNjaGVkdWxlciA9IG5ldyBTY2hlZHVsZXIoKTtcbiAgICB0aGlzLmRlbGF5ZWRFdmVudHNNYXAgPSB7fTtcbiAgICB0aGlzLmxpc3RlbmVycyA9IG5ldyBTZXQoKTtcbiAgICB0aGlzLmNvbnRleHRMaXN0ZW5lcnMgPSBuZXcgU2V0KCk7XG4gICAgdGhpcy5zdG9wTGlzdGVuZXJzID0gbmV3IFNldCgpO1xuICAgIHRoaXMuZG9uZUxpc3RlbmVycyA9IG5ldyBTZXQoKTtcbiAgICB0aGlzLmV2ZW50TGlzdGVuZXJzID0gbmV3IFNldCgpO1xuICAgIHRoaXMuc2VuZExpc3RlbmVycyA9IG5ldyBTZXQoKTtcbiAgICAvKipcclxuICAgICAqIFdoZXRoZXIgdGhlIHNlcnZpY2UgaXMgc3RhcnRlZC5cclxuICAgICAqL1xuXG4gICAgdGhpcy5pbml0aWFsaXplZCA9IGZhbHNlO1xuICAgIHRoaXMuc3RhdHVzID0gSW50ZXJwcmV0ZXJTdGF0dXMuTm90U3RhcnRlZDtcbiAgICB0aGlzLmNoaWxkcmVuID0gbmV3IE1hcCgpO1xuICAgIHRoaXMuZm9yd2FyZFRvID0gbmV3IFNldCgpO1xuICAgIC8qKlxyXG4gICAgICogQWxpYXMgZm9yIEludGVycHJldGVyLnByb3RvdHlwZS5zdGFydFxyXG4gICAgICovXG5cbiAgICB0aGlzLmluaXQgPSB0aGlzLnN0YXJ0O1xuICAgIC8qKlxyXG4gICAgICogU2VuZHMgYW4gZXZlbnQgdG8gdGhlIHJ1bm5pbmcgaW50ZXJwcmV0ZXIgdG8gdHJpZ2dlciBhIHRyYW5zaXRpb24uXHJcbiAgICAgKlxyXG4gICAgICogQW4gYXJyYXkgb2YgZXZlbnRzIChiYXRjaGVkKSBjYW4gYmUgc2VudCBhcyB3ZWxsLCB3aGljaCB3aWxsIHNlbmQgYWxsXHJcbiAgICAgKiBiYXRjaGVkIGV2ZW50cyB0byB0aGUgcnVubmluZyBpbnRlcnByZXRlci4gVGhlIGxpc3RlbmVycyB3aWxsIGJlXHJcbiAgICAgKiBub3RpZmllZCBvbmx5ICoqb25jZSoqIHdoZW4gYWxsIGV2ZW50cyBhcmUgcHJvY2Vzc2VkLlxyXG4gICAgICpcclxuICAgICAqIEBwYXJhbSBldmVudCBUaGUgZXZlbnQocykgdG8gc2VuZFxyXG4gICAgICovXG5cbiAgICB0aGlzLnNlbmQgPSBmdW5jdGlvbiAoZXZlbnQsIHBheWxvYWQpIHtcbiAgICAgIGlmIChpc0FycmF5KGV2ZW50KSkge1xuICAgICAgICBfdGhpcy5iYXRjaChldmVudCk7XG5cbiAgICAgICAgcmV0dXJuIF90aGlzLnN0YXRlO1xuICAgICAgfVxuXG4gICAgICB2YXIgX2V2ZW50ID0gdG9TQ1hNTEV2ZW50KHRvRXZlbnRPYmplY3QoZXZlbnQsIHBheWxvYWQpKTtcblxuICAgICAgaWYgKF90aGlzLnN0YXR1cyA9PT0gSW50ZXJwcmV0ZXJTdGF0dXMuU3RvcHBlZCkge1xuICAgICAgICAvLyBkbyBub3RoaW5nXG4gICAgICAgIGlmICghSVNfUFJPRFVDVElPTikge1xuICAgICAgICAgIHdhcm4oZmFsc2UsIFwiRXZlbnQgXFxcIlwiICsgX2V2ZW50Lm5hbWUgKyBcIlxcXCIgd2FzIHNlbnQgdG8gc3RvcHBlZCBzZXJ2aWNlIFxcXCJcIiArIF90aGlzLm1hY2hpbmUuaWQgKyBcIlxcXCIuIFRoaXMgc2VydmljZSBoYXMgYWxyZWFkeSByZWFjaGVkIGl0cyBmaW5hbCBzdGF0ZSwgYW5kIHdpbGwgbm90IHRyYW5zaXRpb24uXFxuRXZlbnQ6IFwiICsgSlNPTi5zdHJpbmdpZnkoX2V2ZW50LmRhdGEpKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBfdGhpcy5zdGF0ZTtcbiAgICAgIH1cblxuICAgICAgaWYgKF90aGlzLnN0YXR1cyAhPT0gSW50ZXJwcmV0ZXJTdGF0dXMuUnVubmluZyAmJiAhX3RoaXMub3B0aW9ucy5kZWZlckV2ZW50cykge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJFdmVudCBcXFwiXCIgKyBfZXZlbnQubmFtZSArIFwiXFxcIiB3YXMgc2VudCB0byB1bmluaXRpYWxpemVkIHNlcnZpY2UgXFxcIlwiICsgX3RoaXMubWFjaGluZS5pZCArIFwiXFxcIi4gTWFrZSBzdXJlIC5zdGFydCgpIGlzIGNhbGxlZCBmb3IgdGhpcyBzZXJ2aWNlLCBvciBzZXQgeyBkZWZlckV2ZW50czogdHJ1ZSB9IGluIHRoZSBzZXJ2aWNlIG9wdGlvbnMuXFxuRXZlbnQ6IFwiICsgSlNPTi5zdHJpbmdpZnkoX2V2ZW50LmRhdGEpKTtcbiAgICAgIH1cblxuICAgICAgX3RoaXMuc2NoZWR1bGVyLnNjaGVkdWxlKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgLy8gRm9yd2FyZCBjb3B5IG9mIGV2ZW50IHRvIGNoaWxkIGFjdG9yc1xuICAgICAgICBfdGhpcy5mb3J3YXJkKF9ldmVudCk7XG5cbiAgICAgICAgdmFyIG5leHRTdGF0ZSA9IF90aGlzLm5leHRTdGF0ZShfZXZlbnQpO1xuXG4gICAgICAgIF90aGlzLnVwZGF0ZShuZXh0U3RhdGUsIF9ldmVudCk7XG4gICAgICB9KTtcblxuICAgICAgcmV0dXJuIF90aGlzLl9zdGF0ZTsgLy8gVE9ETzogZGVwcmVjYXRlIChzaG91bGQgcmV0dXJuIHZvaWQpXG4gICAgICAvLyB0c2xpbnQ6ZGlzYWJsZS1uZXh0LWxpbmU6c2VtaWNvbG9uXG4gICAgfTtcblxuICAgIHRoaXMuc2VuZFRvID0gZnVuY3Rpb24gKGV2ZW50LCB0bykge1xuICAgICAgdmFyIGlzUGFyZW50ID0gX3RoaXMucGFyZW50ICYmICh0byA9PT0gU3BlY2lhbFRhcmdldHMuUGFyZW50IHx8IF90aGlzLnBhcmVudC5pZCA9PT0gdG8pO1xuICAgICAgdmFyIHRhcmdldCA9IGlzUGFyZW50ID8gX3RoaXMucGFyZW50IDogaXNTdHJpbmcodG8pID8gX3RoaXMuY2hpbGRyZW4uZ2V0KHRvKSB8fCByZWdpc3RyeS5nZXQodG8pIDogaXNBY3Rvcih0bykgPyB0byA6IHVuZGVmaW5lZDtcblxuICAgICAgaWYgKCF0YXJnZXQpIHtcbiAgICAgICAgaWYgKCFpc1BhcmVudCkge1xuICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIlVuYWJsZSB0byBzZW5kIGV2ZW50IHRvIGNoaWxkICdcIiArIHRvICsgXCInIGZyb20gc2VydmljZSAnXCIgKyBfdGhpcy5pZCArIFwiJy5cIik7XG4gICAgICAgIH0gLy8gdHNsaW50OmRpc2FibGUtbmV4dC1saW5lOm5vLWNvbnNvbGVcblxuXG4gICAgICAgIGlmICghSVNfUFJPRFVDVElPTikge1xuICAgICAgICAgIHdhcm4oZmFsc2UsIFwiU2VydmljZSAnXCIgKyBfdGhpcy5pZCArIFwiJyBoYXMgbm8gcGFyZW50OiB1bmFibGUgdG8gc2VuZCBldmVudCBcIiArIGV2ZW50LnR5cGUpO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICBpZiAoJ21hY2hpbmUnIGluIHRhcmdldCkge1xuICAgICAgICAvLyBTZW5kIFNDWE1MIGV2ZW50cyB0byBtYWNoaW5lc1xuICAgICAgICB0YXJnZXQuc2VuZChfX2Fzc2lnbihfX2Fzc2lnbih7fSwgZXZlbnQpLCB7XG4gICAgICAgICAgbmFtZTogZXZlbnQubmFtZSA9PT0gZXJyb3IkMSA/IFwiXCIgKyBlcnJvcihfdGhpcy5pZCkgOiBldmVudC5uYW1lLFxuICAgICAgICAgIG9yaWdpbjogX3RoaXMuc2Vzc2lvbklkXG4gICAgICAgIH0pKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIC8vIFNlbmQgbm9ybWFsIGV2ZW50cyB0byBvdGhlciB0YXJnZXRzXG4gICAgICAgIHRhcmdldC5zZW5kKGV2ZW50LmRhdGEpO1xuICAgICAgfVxuICAgIH07XG5cbiAgICB2YXIgcmVzb2x2ZWRPcHRpb25zID0gX19hc3NpZ24oX19hc3NpZ24oe30sIEludGVycHJldGVyLmRlZmF1bHRPcHRpb25zKSwgb3B0aW9ucyk7XG5cbiAgICB2YXIgY2xvY2sgPSByZXNvbHZlZE9wdGlvbnMuY2xvY2ssXG4gICAgICAgIGxvZ2dlciA9IHJlc29sdmVkT3B0aW9ucy5sb2dnZXIsXG4gICAgICAgIHBhcmVudCA9IHJlc29sdmVkT3B0aW9ucy5wYXJlbnQsXG4gICAgICAgIGlkID0gcmVzb2x2ZWRPcHRpb25zLmlkO1xuICAgIHZhciByZXNvbHZlZElkID0gaWQgIT09IHVuZGVmaW5lZCA/IGlkIDogbWFjaGluZS5pZDtcbiAgICB0aGlzLmlkID0gcmVzb2x2ZWRJZDtcbiAgICB0aGlzLmxvZ2dlciA9IGxvZ2dlcjtcbiAgICB0aGlzLmNsb2NrID0gY2xvY2s7XG4gICAgdGhpcy5wYXJlbnQgPSBwYXJlbnQ7XG4gICAgdGhpcy5vcHRpb25zID0gcmVzb2x2ZWRPcHRpb25zO1xuICAgIHRoaXMuc2NoZWR1bGVyID0gbmV3IFNjaGVkdWxlcih7XG4gICAgICBkZWZlckV2ZW50czogdGhpcy5vcHRpb25zLmRlZmVyRXZlbnRzXG4gICAgfSk7XG4gICAgdGhpcy5zZXNzaW9uSWQgPSByZWdpc3RyeS5ib29rSWQoKTtcbiAgfVxuXG4gIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShJbnRlcnByZXRlci5wcm90b3R5cGUsIFwiaW5pdGlhbFN0YXRlXCIsIHtcbiAgICBnZXQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgIHZhciBfdGhpcyA9IHRoaXM7XG5cbiAgICAgIGlmICh0aGlzLl9pbml0aWFsU3RhdGUpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2luaXRpYWxTdGF0ZTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHByb3ZpZGUodGhpcywgZnVuY3Rpb24gKCkge1xuICAgICAgICBfdGhpcy5faW5pdGlhbFN0YXRlID0gX3RoaXMubWFjaGluZS5pbml0aWFsU3RhdGU7XG4gICAgICAgIHJldHVybiBfdGhpcy5faW5pdGlhbFN0YXRlO1xuICAgICAgfSk7XG4gICAgfSxcbiAgICBlbnVtZXJhYmxlOiBmYWxzZSxcbiAgICBjb25maWd1cmFibGU6IHRydWVcbiAgfSk7XG4gIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShJbnRlcnByZXRlci5wcm90b3R5cGUsIFwic3RhdGVcIiwge1xuICAgIGdldDogZnVuY3Rpb24gKCkge1xuICAgICAgaWYgKCFJU19QUk9EVUNUSU9OKSB7XG4gICAgICAgIHdhcm4odGhpcy5zdGF0dXMgIT09IEludGVycHJldGVyU3RhdHVzLk5vdFN0YXJ0ZWQsIFwiQXR0ZW1wdGVkIHRvIHJlYWQgc3RhdGUgZnJvbSB1bmluaXRpYWxpemVkIHNlcnZpY2UgJ1wiICsgdGhpcy5pZCArIFwiJy4gTWFrZSBzdXJlIHRoZSBzZXJ2aWNlIGlzIHN0YXJ0ZWQgZmlyc3QuXCIpO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gdGhpcy5fc3RhdGU7XG4gICAgfSxcbiAgICBlbnVtZXJhYmxlOiBmYWxzZSxcbiAgICBjb25maWd1cmFibGU6IHRydWVcbiAgfSk7XG4gIC8qKlxyXG4gICAqIEV4ZWN1dGVzIHRoZSBhY3Rpb25zIG9mIHRoZSBnaXZlbiBzdGF0ZSwgd2l0aCB0aGF0IHN0YXRlJ3MgYGNvbnRleHRgIGFuZCBgZXZlbnRgLlxyXG4gICAqXHJcbiAgICogQHBhcmFtIHN0YXRlIFRoZSBzdGF0ZSB3aG9zZSBhY3Rpb25zIHdpbGwgYmUgZXhlY3V0ZWRcclxuICAgKiBAcGFyYW0gYWN0aW9uc0NvbmZpZyBUaGUgYWN0aW9uIGltcGxlbWVudGF0aW9ucyB0byB1c2VcclxuICAgKi9cblxuICBJbnRlcnByZXRlci5wcm90b3R5cGUuZXhlY3V0ZSA9IGZ1bmN0aW9uIChzdGF0ZSwgYWN0aW9uc0NvbmZpZykge1xuICAgIHZhciBlXzEsIF9hO1xuXG4gICAgdHJ5IHtcbiAgICAgIGZvciAodmFyIF9iID0gX192YWx1ZXMoc3RhdGUuYWN0aW9ucyksIF9jID0gX2IubmV4dCgpOyAhX2MuZG9uZTsgX2MgPSBfYi5uZXh0KCkpIHtcbiAgICAgICAgdmFyIGFjdGlvbiA9IF9jLnZhbHVlO1xuICAgICAgICB0aGlzLmV4ZWMoYWN0aW9uLCBzdGF0ZSwgYWN0aW9uc0NvbmZpZyk7XG4gICAgICB9XG4gICAgfSBjYXRjaCAoZV8xXzEpIHtcbiAgICAgIGVfMSA9IHtcbiAgICAgICAgZXJyb3I6IGVfMV8xXG4gICAgICB9O1xuICAgIH0gZmluYWxseSB7XG4gICAgICB0cnkge1xuICAgICAgICBpZiAoX2MgJiYgIV9jLmRvbmUgJiYgKF9hID0gX2IucmV0dXJuKSkgX2EuY2FsbChfYik7XG4gICAgICB9IGZpbmFsbHkge1xuICAgICAgICBpZiAoZV8xKSB0aHJvdyBlXzEuZXJyb3I7XG4gICAgICB9XG4gICAgfVxuICB9O1xuXG4gIEludGVycHJldGVyLnByb3RvdHlwZS51cGRhdGUgPSBmdW5jdGlvbiAoc3RhdGUsIF9ldmVudCkge1xuICAgIHZhciBlXzIsIF9hLCBlXzMsIF9iLCBlXzQsIF9jLCBlXzUsIF9kO1xuXG4gICAgdmFyIF90aGlzID0gdGhpczsgLy8gQXR0YWNoIHNlc3Npb24gSUQgdG8gc3RhdGVcblxuXG4gICAgc3RhdGUuX3Nlc3Npb25pZCA9IHRoaXMuc2Vzc2lvbklkOyAvLyBVcGRhdGUgc3RhdGVcblxuICAgIHRoaXMuX3N0YXRlID0gc3RhdGU7IC8vIEV4ZWN1dGUgYWN0aW9uc1xuXG4gICAgaWYgKHRoaXMub3B0aW9ucy5leGVjdXRlKSB7XG4gICAgICB0aGlzLmV4ZWN1dGUodGhpcy5zdGF0ZSk7XG4gICAgfSAvLyBVcGRhdGUgY2hpbGRyZW5cblxuXG4gICAgdGhpcy5jaGlsZHJlbi5mb3JFYWNoKGZ1bmN0aW9uIChjaGlsZCkge1xuICAgICAgX3RoaXMuc3RhdGUuY2hpbGRyZW5bY2hpbGQuaWRdID0gY2hpbGQ7XG4gICAgfSk7IC8vIERldiB0b29sc1xuXG4gICAgaWYgKHRoaXMuZGV2VG9vbHMpIHtcbiAgICAgIHRoaXMuZGV2VG9vbHMuc2VuZChfZXZlbnQuZGF0YSwgc3RhdGUpO1xuICAgIH0gLy8gRXhlY3V0ZSBsaXN0ZW5lcnNcblxuXG4gICAgaWYgKHN0YXRlLmV2ZW50KSB7XG4gICAgICB0cnkge1xuICAgICAgICBmb3IgKHZhciBfZSA9IF9fdmFsdWVzKHRoaXMuZXZlbnRMaXN0ZW5lcnMpLCBfZiA9IF9lLm5leHQoKTsgIV9mLmRvbmU7IF9mID0gX2UubmV4dCgpKSB7XG4gICAgICAgICAgdmFyIGxpc3RlbmVyID0gX2YudmFsdWU7XG4gICAgICAgICAgbGlzdGVuZXIoc3RhdGUuZXZlbnQpO1xuICAgICAgICB9XG4gICAgICB9IGNhdGNoIChlXzJfMSkge1xuICAgICAgICBlXzIgPSB7XG4gICAgICAgICAgZXJyb3I6IGVfMl8xXG4gICAgICAgIH07XG4gICAgICB9IGZpbmFsbHkge1xuICAgICAgICB0cnkge1xuICAgICAgICAgIGlmIChfZiAmJiAhX2YuZG9uZSAmJiAoX2EgPSBfZS5yZXR1cm4pKSBfYS5jYWxsKF9lKTtcbiAgICAgICAgfSBmaW5hbGx5IHtcbiAgICAgICAgICBpZiAoZV8yKSB0aHJvdyBlXzIuZXJyb3I7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICB0cnkge1xuICAgICAgZm9yICh2YXIgX2cgPSBfX3ZhbHVlcyh0aGlzLmxpc3RlbmVycyksIF9oID0gX2cubmV4dCgpOyAhX2guZG9uZTsgX2ggPSBfZy5uZXh0KCkpIHtcbiAgICAgICAgdmFyIGxpc3RlbmVyID0gX2gudmFsdWU7XG4gICAgICAgIGxpc3RlbmVyKHN0YXRlLCBzdGF0ZS5ldmVudCk7XG4gICAgICB9XG4gICAgfSBjYXRjaCAoZV8zXzEpIHtcbiAgICAgIGVfMyA9IHtcbiAgICAgICAgZXJyb3I6IGVfM18xXG4gICAgICB9O1xuICAgIH0gZmluYWxseSB7XG4gICAgICB0cnkge1xuICAgICAgICBpZiAoX2ggJiYgIV9oLmRvbmUgJiYgKF9iID0gX2cucmV0dXJuKSkgX2IuY2FsbChfZyk7XG4gICAgICB9IGZpbmFsbHkge1xuICAgICAgICBpZiAoZV8zKSB0aHJvdyBlXzMuZXJyb3I7XG4gICAgICB9XG4gICAgfVxuXG4gICAgdHJ5IHtcbiAgICAgIGZvciAodmFyIF9qID0gX192YWx1ZXModGhpcy5jb250ZXh0TGlzdGVuZXJzKSwgX2sgPSBfai5uZXh0KCk7ICFfay5kb25lOyBfayA9IF9qLm5leHQoKSkge1xuICAgICAgICB2YXIgY29udGV4dExpc3RlbmVyID0gX2sudmFsdWU7XG4gICAgICAgIGNvbnRleHRMaXN0ZW5lcih0aGlzLnN0YXRlLmNvbnRleHQsIHRoaXMuc3RhdGUuaGlzdG9yeSA/IHRoaXMuc3RhdGUuaGlzdG9yeS5jb250ZXh0IDogdW5kZWZpbmVkKTtcbiAgICAgIH1cbiAgICB9IGNhdGNoIChlXzRfMSkge1xuICAgICAgZV80ID0ge1xuICAgICAgICBlcnJvcjogZV80XzFcbiAgICAgIH07XG4gICAgfSBmaW5hbGx5IHtcbiAgICAgIHRyeSB7XG4gICAgICAgIGlmIChfayAmJiAhX2suZG9uZSAmJiAoX2MgPSBfai5yZXR1cm4pKSBfYy5jYWxsKF9qKTtcbiAgICAgIH0gZmluYWxseSB7XG4gICAgICAgIGlmIChlXzQpIHRocm93IGVfNC5lcnJvcjtcbiAgICAgIH1cbiAgICB9XG5cbiAgICB2YXIgaXNEb25lID0gaXNJbkZpbmFsU3RhdGUoc3RhdGUuY29uZmlndXJhdGlvbiB8fCBbXSwgdGhpcy5tYWNoaW5lKTtcblxuICAgIGlmICh0aGlzLnN0YXRlLmNvbmZpZ3VyYXRpb24gJiYgaXNEb25lKSB7XG4gICAgICAvLyBnZXQgZmluYWwgY2hpbGQgc3RhdGUgbm9kZVxuICAgICAgdmFyIGZpbmFsQ2hpbGRTdGF0ZU5vZGUgPSBzdGF0ZS5jb25maWd1cmF0aW9uLmZpbmQoZnVuY3Rpb24gKHNuKSB7XG4gICAgICAgIHJldHVybiBzbi50eXBlID09PSAnZmluYWwnICYmIHNuLnBhcmVudCA9PT0gX3RoaXMubWFjaGluZTtcbiAgICAgIH0pO1xuICAgICAgdmFyIGRvbmVEYXRhID0gZmluYWxDaGlsZFN0YXRlTm9kZSAmJiBmaW5hbENoaWxkU3RhdGVOb2RlLmRvbmVEYXRhID8gbWFwQ29udGV4dChmaW5hbENoaWxkU3RhdGVOb2RlLmRvbmVEYXRhLCBzdGF0ZS5jb250ZXh0LCBfZXZlbnQpIDogdW5kZWZpbmVkO1xuXG4gICAgICB0cnkge1xuICAgICAgICBmb3IgKHZhciBfbCA9IF9fdmFsdWVzKHRoaXMuZG9uZUxpc3RlbmVycyksIF9tID0gX2wubmV4dCgpOyAhX20uZG9uZTsgX20gPSBfbC5uZXh0KCkpIHtcbiAgICAgICAgICB2YXIgbGlzdGVuZXIgPSBfbS52YWx1ZTtcbiAgICAgICAgICBsaXN0ZW5lcihkb25lSW52b2tlKHRoaXMuaWQsIGRvbmVEYXRhKSk7XG4gICAgICAgIH1cbiAgICAgIH0gY2F0Y2ggKGVfNV8xKSB7XG4gICAgICAgIGVfNSA9IHtcbiAgICAgICAgICBlcnJvcjogZV81XzFcbiAgICAgICAgfTtcbiAgICAgIH0gZmluYWxseSB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgaWYgKF9tICYmICFfbS5kb25lICYmIChfZCA9IF9sLnJldHVybikpIF9kLmNhbGwoX2wpO1xuICAgICAgICB9IGZpbmFsbHkge1xuICAgICAgICAgIGlmIChlXzUpIHRocm93IGVfNS5lcnJvcjtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICB0aGlzLnN0b3AoKTtcbiAgICB9XG4gIH07XG4gIC8qXHJcbiAgICogQWRkcyBhIGxpc3RlbmVyIHRoYXQgaXMgbm90aWZpZWQgd2hlbmV2ZXIgYSBzdGF0ZSB0cmFuc2l0aW9uIGhhcHBlbnMuIFRoZSBsaXN0ZW5lciBpcyBjYWxsZWQgd2l0aFxyXG4gICAqIHRoZSBuZXh0IHN0YXRlIGFuZCB0aGUgZXZlbnQgb2JqZWN0IHRoYXQgY2F1c2VkIHRoZSBzdGF0ZSB0cmFuc2l0aW9uLlxyXG4gICAqXHJcbiAgICogQHBhcmFtIGxpc3RlbmVyIFRoZSBzdGF0ZSBsaXN0ZW5lclxyXG4gICAqL1xuXG5cbiAgSW50ZXJwcmV0ZXIucHJvdG90eXBlLm9uVHJhbnNpdGlvbiA9IGZ1bmN0aW9uIChsaXN0ZW5lcikge1xuICAgIHRoaXMubGlzdGVuZXJzLmFkZChsaXN0ZW5lcik7IC8vIFNlbmQgY3VycmVudCBzdGF0ZSB0byBsaXN0ZW5lclxuXG4gICAgaWYgKHRoaXMuc3RhdHVzID09PSBJbnRlcnByZXRlclN0YXR1cy5SdW5uaW5nKSB7XG4gICAgICBsaXN0ZW5lcih0aGlzLnN0YXRlLCB0aGlzLnN0YXRlLmV2ZW50KTtcbiAgICB9XG5cbiAgICByZXR1cm4gdGhpcztcbiAgfTtcblxuICBJbnRlcnByZXRlci5wcm90b3R5cGUuc3Vic2NyaWJlID0gZnVuY3Rpb24gKG5leHRMaXN0ZW5lck9yT2JzZXJ2ZXIsIF8sIC8vIFRPRE86IGVycm9yIGxpc3RlbmVyXG4gIGNvbXBsZXRlTGlzdGVuZXIpIHtcbiAgICB2YXIgX3RoaXMgPSB0aGlzO1xuXG4gICAgaWYgKCFuZXh0TGlzdGVuZXJPck9ic2VydmVyKSB7XG4gICAgICByZXR1cm4ge1xuICAgICAgICB1bnN1YnNjcmliZTogZnVuY3Rpb24gKCkge1xuICAgICAgICAgIHJldHVybiB2b2lkIDA7XG4gICAgICAgIH1cbiAgICAgIH07XG4gICAgfVxuXG4gICAgdmFyIGxpc3RlbmVyO1xuICAgIHZhciByZXNvbHZlZENvbXBsZXRlTGlzdGVuZXIgPSBjb21wbGV0ZUxpc3RlbmVyO1xuXG4gICAgaWYgKHR5cGVvZiBuZXh0TGlzdGVuZXJPck9ic2VydmVyID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICBsaXN0ZW5lciA9IG5leHRMaXN0ZW5lck9yT2JzZXJ2ZXI7XG4gICAgfSBlbHNlIHtcbiAgICAgIGxpc3RlbmVyID0gbmV4dExpc3RlbmVyT3JPYnNlcnZlci5uZXh0LmJpbmQobmV4dExpc3RlbmVyT3JPYnNlcnZlcik7XG4gICAgICByZXNvbHZlZENvbXBsZXRlTGlzdGVuZXIgPSBuZXh0TGlzdGVuZXJPck9ic2VydmVyLmNvbXBsZXRlLmJpbmQobmV4dExpc3RlbmVyT3JPYnNlcnZlcik7XG4gICAgfVxuXG4gICAgdGhpcy5saXN0ZW5lcnMuYWRkKGxpc3RlbmVyKTsgLy8gU2VuZCBjdXJyZW50IHN0YXRlIHRvIGxpc3RlbmVyXG5cbiAgICBpZiAodGhpcy5zdGF0dXMgPT09IEludGVycHJldGVyU3RhdHVzLlJ1bm5pbmcpIHtcbiAgICAgIGxpc3RlbmVyKHRoaXMuc3RhdGUpO1xuICAgIH1cblxuICAgIGlmIChyZXNvbHZlZENvbXBsZXRlTGlzdGVuZXIpIHtcbiAgICAgIHRoaXMub25Eb25lKHJlc29sdmVkQ29tcGxldGVMaXN0ZW5lcik7XG4gICAgfVxuXG4gICAgcmV0dXJuIHtcbiAgICAgIHVuc3Vic2NyaWJlOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIGxpc3RlbmVyICYmIF90aGlzLmxpc3RlbmVycy5kZWxldGUobGlzdGVuZXIpO1xuICAgICAgICByZXNvbHZlZENvbXBsZXRlTGlzdGVuZXIgJiYgX3RoaXMuZG9uZUxpc3RlbmVycy5kZWxldGUocmVzb2x2ZWRDb21wbGV0ZUxpc3RlbmVyKTtcbiAgICAgIH1cbiAgICB9O1xuICB9O1xuICAvKipcclxuICAgKiBBZGRzIGFuIGV2ZW50IGxpc3RlbmVyIHRoYXQgaXMgbm90aWZpZWQgd2hlbmV2ZXIgYW4gZXZlbnQgaXMgc2VudCB0byB0aGUgcnVubmluZyBpbnRlcnByZXRlci5cclxuICAgKiBAcGFyYW0gbGlzdGVuZXIgVGhlIGV2ZW50IGxpc3RlbmVyXHJcbiAgICovXG5cblxuICBJbnRlcnByZXRlci5wcm90b3R5cGUub25FdmVudCA9IGZ1bmN0aW9uIChsaXN0ZW5lcikge1xuICAgIHRoaXMuZXZlbnRMaXN0ZW5lcnMuYWRkKGxpc3RlbmVyKTtcbiAgICByZXR1cm4gdGhpcztcbiAgfTtcbiAgLyoqXHJcbiAgICogQWRkcyBhbiBldmVudCBsaXN0ZW5lciB0aGF0IGlzIG5vdGlmaWVkIHdoZW5ldmVyIGEgYHNlbmRgIGV2ZW50IG9jY3Vycy5cclxuICAgKiBAcGFyYW0gbGlzdGVuZXIgVGhlIGV2ZW50IGxpc3RlbmVyXHJcbiAgICovXG5cblxuICBJbnRlcnByZXRlci5wcm90b3R5cGUub25TZW5kID0gZnVuY3Rpb24gKGxpc3RlbmVyKSB7XG4gICAgdGhpcy5zZW5kTGlzdGVuZXJzLmFkZChsaXN0ZW5lcik7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH07XG4gIC8qKlxyXG4gICAqIEFkZHMgYSBjb250ZXh0IGxpc3RlbmVyIHRoYXQgaXMgbm90aWZpZWQgd2hlbmV2ZXIgdGhlIHN0YXRlIGNvbnRleHQgY2hhbmdlcy5cclxuICAgKiBAcGFyYW0gbGlzdGVuZXIgVGhlIGNvbnRleHQgbGlzdGVuZXJcclxuICAgKi9cblxuXG4gIEludGVycHJldGVyLnByb3RvdHlwZS5vbkNoYW5nZSA9IGZ1bmN0aW9uIChsaXN0ZW5lcikge1xuICAgIHRoaXMuY29udGV4dExpc3RlbmVycy5hZGQobGlzdGVuZXIpO1xuICAgIHJldHVybiB0aGlzO1xuICB9O1xuICAvKipcclxuICAgKiBBZGRzIGEgbGlzdGVuZXIgdGhhdCBpcyBub3RpZmllZCB3aGVuIHRoZSBtYWNoaW5lIGlzIHN0b3BwZWQuXHJcbiAgICogQHBhcmFtIGxpc3RlbmVyIFRoZSBsaXN0ZW5lclxyXG4gICAqL1xuXG5cbiAgSW50ZXJwcmV0ZXIucHJvdG90eXBlLm9uU3RvcCA9IGZ1bmN0aW9uIChsaXN0ZW5lcikge1xuICAgIHRoaXMuc3RvcExpc3RlbmVycy5hZGQobGlzdGVuZXIpO1xuICAgIHJldHVybiB0aGlzO1xuICB9O1xuICAvKipcclxuICAgKiBBZGRzIGEgc3RhdGUgbGlzdGVuZXIgdGhhdCBpcyBub3RpZmllZCB3aGVuIHRoZSBzdGF0ZWNoYXJ0IGhhcyByZWFjaGVkIGl0cyBmaW5hbCBzdGF0ZS5cclxuICAgKiBAcGFyYW0gbGlzdGVuZXIgVGhlIHN0YXRlIGxpc3RlbmVyXHJcbiAgICovXG5cblxuICBJbnRlcnByZXRlci5wcm90b3R5cGUub25Eb25lID0gZnVuY3Rpb24gKGxpc3RlbmVyKSB7XG4gICAgdGhpcy5kb25lTGlzdGVuZXJzLmFkZChsaXN0ZW5lcik7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH07XG4gIC8qKlxyXG4gICAqIFJlbW92ZXMgYSBsaXN0ZW5lci5cclxuICAgKiBAcGFyYW0gbGlzdGVuZXIgVGhlIGxpc3RlbmVyIHRvIHJlbW92ZVxyXG4gICAqL1xuXG5cbiAgSW50ZXJwcmV0ZXIucHJvdG90eXBlLm9mZiA9IGZ1bmN0aW9uIChsaXN0ZW5lcikge1xuICAgIHRoaXMubGlzdGVuZXJzLmRlbGV0ZShsaXN0ZW5lcik7XG4gICAgdGhpcy5ldmVudExpc3RlbmVycy5kZWxldGUobGlzdGVuZXIpO1xuICAgIHRoaXMuc2VuZExpc3RlbmVycy5kZWxldGUobGlzdGVuZXIpO1xuICAgIHRoaXMuc3RvcExpc3RlbmVycy5kZWxldGUobGlzdGVuZXIpO1xuICAgIHRoaXMuZG9uZUxpc3RlbmVycy5kZWxldGUobGlzdGVuZXIpO1xuICAgIHRoaXMuY29udGV4dExpc3RlbmVycy5kZWxldGUobGlzdGVuZXIpO1xuICAgIHJldHVybiB0aGlzO1xuICB9O1xuICAvKipcclxuICAgKiBTdGFydHMgdGhlIGludGVycHJldGVyIGZyb20gdGhlIGdpdmVuIHN0YXRlLCBvciB0aGUgaW5pdGlhbCBzdGF0ZS5cclxuICAgKiBAcGFyYW0gaW5pdGlhbFN0YXRlIFRoZSBzdGF0ZSB0byBzdGFydCB0aGUgc3RhdGVjaGFydCBmcm9tXHJcbiAgICovXG5cblxuICBJbnRlcnByZXRlci5wcm90b3R5cGUuc3RhcnQgPSBmdW5jdGlvbiAoaW5pdGlhbFN0YXRlKSB7XG4gICAgdmFyIF90aGlzID0gdGhpcztcblxuICAgIGlmICh0aGlzLnN0YXR1cyA9PT0gSW50ZXJwcmV0ZXJTdGF0dXMuUnVubmluZykge1xuICAgICAgLy8gRG8gbm90IHJlc3RhcnQgdGhlIHNlcnZpY2UgaWYgaXQgaXMgYWxyZWFkeSBzdGFydGVkXG4gICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICByZWdpc3RyeS5yZWdpc3Rlcih0aGlzLnNlc3Npb25JZCwgdGhpcyk7XG4gICAgdGhpcy5pbml0aWFsaXplZCA9IHRydWU7XG4gICAgdGhpcy5zdGF0dXMgPSBJbnRlcnByZXRlclN0YXR1cy5SdW5uaW5nO1xuICAgIHZhciByZXNvbHZlZFN0YXRlID0gaW5pdGlhbFN0YXRlID09PSB1bmRlZmluZWQgPyB0aGlzLmluaXRpYWxTdGF0ZSA6IHByb3ZpZGUodGhpcywgZnVuY3Rpb24gKCkge1xuICAgICAgcmV0dXJuIGlzU3RhdGUoaW5pdGlhbFN0YXRlKSA/IF90aGlzLm1hY2hpbmUucmVzb2x2ZVN0YXRlKGluaXRpYWxTdGF0ZSkgOiBfdGhpcy5tYWNoaW5lLnJlc29sdmVTdGF0ZShTdGF0ZS5mcm9tKGluaXRpYWxTdGF0ZSwgX3RoaXMubWFjaGluZS5jb250ZXh0KSk7XG4gICAgfSk7XG5cbiAgICBpZiAodGhpcy5vcHRpb25zLmRldlRvb2xzKSB7XG4gICAgICB0aGlzLmF0dGFjaERldigpO1xuICAgIH1cblxuICAgIHRoaXMuc2NoZWR1bGVyLmluaXRpYWxpemUoZnVuY3Rpb24gKCkge1xuICAgICAgX3RoaXMudXBkYXRlKHJlc29sdmVkU3RhdGUsIGluaXRFdmVudCk7XG4gICAgfSk7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH07XG4gIC8qKlxyXG4gICAqIFN0b3BzIHRoZSBpbnRlcnByZXRlciBhbmQgdW5zdWJzY3JpYmUgYWxsIGxpc3RlbmVycy5cclxuICAgKlxyXG4gICAqIFRoaXMgd2lsbCBhbHNvIG5vdGlmeSB0aGUgYG9uU3RvcGAgbGlzdGVuZXJzLlxyXG4gICAqL1xuXG5cbiAgSW50ZXJwcmV0ZXIucHJvdG90eXBlLnN0b3AgPSBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIGVfNiwgX2EsIGVfNywgX2IsIGVfOCwgX2MsIGVfOSwgX2QsIGVfMTAsIF9lO1xuXG4gICAgdmFyIF90aGlzID0gdGhpcztcblxuICAgIHRyeSB7XG4gICAgICBmb3IgKHZhciBfZiA9IF9fdmFsdWVzKHRoaXMubGlzdGVuZXJzKSwgX2cgPSBfZi5uZXh0KCk7ICFfZy5kb25lOyBfZyA9IF9mLm5leHQoKSkge1xuICAgICAgICB2YXIgbGlzdGVuZXIgPSBfZy52YWx1ZTtcbiAgICAgICAgdGhpcy5saXN0ZW5lcnMuZGVsZXRlKGxpc3RlbmVyKTtcbiAgICAgIH1cbiAgICB9IGNhdGNoIChlXzZfMSkge1xuICAgICAgZV82ID0ge1xuICAgICAgICBlcnJvcjogZV82XzFcbiAgICAgIH07XG4gICAgfSBmaW5hbGx5IHtcbiAgICAgIHRyeSB7XG4gICAgICAgIGlmIChfZyAmJiAhX2cuZG9uZSAmJiAoX2EgPSBfZi5yZXR1cm4pKSBfYS5jYWxsKF9mKTtcbiAgICAgIH0gZmluYWxseSB7XG4gICAgICAgIGlmIChlXzYpIHRocm93IGVfNi5lcnJvcjtcbiAgICAgIH1cbiAgICB9XG5cbiAgICB0cnkge1xuICAgICAgZm9yICh2YXIgX2ggPSBfX3ZhbHVlcyh0aGlzLnN0b3BMaXN0ZW5lcnMpLCBfaiA9IF9oLm5leHQoKTsgIV9qLmRvbmU7IF9qID0gX2gubmV4dCgpKSB7XG4gICAgICAgIHZhciBsaXN0ZW5lciA9IF9qLnZhbHVlOyAvLyBjYWxsIGxpc3RlbmVyLCB0aGVuIHJlbW92ZVxuXG4gICAgICAgIGxpc3RlbmVyKCk7XG4gICAgICAgIHRoaXMuc3RvcExpc3RlbmVycy5kZWxldGUobGlzdGVuZXIpO1xuICAgICAgfVxuICAgIH0gY2F0Y2ggKGVfN18xKSB7XG4gICAgICBlXzcgPSB7XG4gICAgICAgIGVycm9yOiBlXzdfMVxuICAgICAgfTtcbiAgICB9IGZpbmFsbHkge1xuICAgICAgdHJ5IHtcbiAgICAgICAgaWYgKF9qICYmICFfai5kb25lICYmIChfYiA9IF9oLnJldHVybikpIF9iLmNhbGwoX2gpO1xuICAgICAgfSBmaW5hbGx5IHtcbiAgICAgICAgaWYgKGVfNykgdGhyb3cgZV83LmVycm9yO1xuICAgICAgfVxuICAgIH1cblxuICAgIHRyeSB7XG4gICAgICBmb3IgKHZhciBfayA9IF9fdmFsdWVzKHRoaXMuY29udGV4dExpc3RlbmVycyksIF9sID0gX2submV4dCgpOyAhX2wuZG9uZTsgX2wgPSBfay5uZXh0KCkpIHtcbiAgICAgICAgdmFyIGxpc3RlbmVyID0gX2wudmFsdWU7XG4gICAgICAgIHRoaXMuY29udGV4dExpc3RlbmVycy5kZWxldGUobGlzdGVuZXIpO1xuICAgICAgfVxuICAgIH0gY2F0Y2ggKGVfOF8xKSB7XG4gICAgICBlXzggPSB7XG4gICAgICAgIGVycm9yOiBlXzhfMVxuICAgICAgfTtcbiAgICB9IGZpbmFsbHkge1xuICAgICAgdHJ5IHtcbiAgICAgICAgaWYgKF9sICYmICFfbC5kb25lICYmIChfYyA9IF9rLnJldHVybikpIF9jLmNhbGwoX2spO1xuICAgICAgfSBmaW5hbGx5IHtcbiAgICAgICAgaWYgKGVfOCkgdGhyb3cgZV84LmVycm9yO1xuICAgICAgfVxuICAgIH1cblxuICAgIHRyeSB7XG4gICAgICBmb3IgKHZhciBfbSA9IF9fdmFsdWVzKHRoaXMuZG9uZUxpc3RlbmVycyksIF9vID0gX20ubmV4dCgpOyAhX28uZG9uZTsgX28gPSBfbS5uZXh0KCkpIHtcbiAgICAgICAgdmFyIGxpc3RlbmVyID0gX28udmFsdWU7XG4gICAgICAgIHRoaXMuZG9uZUxpc3RlbmVycy5kZWxldGUobGlzdGVuZXIpO1xuICAgICAgfVxuICAgIH0gY2F0Y2ggKGVfOV8xKSB7XG4gICAgICBlXzkgPSB7XG4gICAgICAgIGVycm9yOiBlXzlfMVxuICAgICAgfTtcbiAgICB9IGZpbmFsbHkge1xuICAgICAgdHJ5IHtcbiAgICAgICAgaWYgKF9vICYmICFfby5kb25lICYmIChfZCA9IF9tLnJldHVybikpIF9kLmNhbGwoX20pO1xuICAgICAgfSBmaW5hbGx5IHtcbiAgICAgICAgaWYgKGVfOSkgdGhyb3cgZV85LmVycm9yO1xuICAgICAgfVxuICAgIH1cblxuICAgIHRoaXMuc3RhdGUuY29uZmlndXJhdGlvbi5mb3JFYWNoKGZ1bmN0aW9uIChzdGF0ZU5vZGUpIHtcbiAgICAgIHZhciBlXzExLCBfYTtcblxuICAgICAgdHJ5IHtcbiAgICAgICAgZm9yICh2YXIgX2IgPSBfX3ZhbHVlcyhzdGF0ZU5vZGUuZGVmaW5pdGlvbi5leGl0KSwgX2MgPSBfYi5uZXh0KCk7ICFfYy5kb25lOyBfYyA9IF9iLm5leHQoKSkge1xuICAgICAgICAgIHZhciBhY3Rpb24gPSBfYy52YWx1ZTtcblxuICAgICAgICAgIF90aGlzLmV4ZWMoYWN0aW9uLCBfdGhpcy5zdGF0ZSk7XG4gICAgICAgIH1cbiAgICAgIH0gY2F0Y2ggKGVfMTFfMSkge1xuICAgICAgICBlXzExID0ge1xuICAgICAgICAgIGVycm9yOiBlXzExXzFcbiAgICAgICAgfTtcbiAgICAgIH0gZmluYWxseSB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgaWYgKF9jICYmICFfYy5kb25lICYmIChfYSA9IF9iLnJldHVybikpIF9hLmNhbGwoX2IpO1xuICAgICAgICB9IGZpbmFsbHkge1xuICAgICAgICAgIGlmIChlXzExKSB0aHJvdyBlXzExLmVycm9yO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSk7IC8vIFN0b3AgYWxsIGNoaWxkcmVuXG5cbiAgICB0aGlzLmNoaWxkcmVuLmZvckVhY2goZnVuY3Rpb24gKGNoaWxkKSB7XG4gICAgICBpZiAoaXNGdW5jdGlvbihjaGlsZC5zdG9wKSkge1xuICAgICAgICBjaGlsZC5zdG9wKCk7XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICB0cnkge1xuICAgICAgLy8gQ2FuY2VsIGFsbCBkZWxheWVkIGV2ZW50c1xuICAgICAgZm9yICh2YXIgX3AgPSBfX3ZhbHVlcyhrZXlzKHRoaXMuZGVsYXllZEV2ZW50c01hcCkpLCBfcSA9IF9wLm5leHQoKTsgIV9xLmRvbmU7IF9xID0gX3AubmV4dCgpKSB7XG4gICAgICAgIHZhciBrZXkgPSBfcS52YWx1ZTtcbiAgICAgICAgdGhpcy5jbG9jay5jbGVhclRpbWVvdXQodGhpcy5kZWxheWVkRXZlbnRzTWFwW2tleV0pO1xuICAgICAgfVxuICAgIH0gY2F0Y2ggKGVfMTBfMSkge1xuICAgICAgZV8xMCA9IHtcbiAgICAgICAgZXJyb3I6IGVfMTBfMVxuICAgICAgfTtcbiAgICB9IGZpbmFsbHkge1xuICAgICAgdHJ5IHtcbiAgICAgICAgaWYgKF9xICYmICFfcS5kb25lICYmIChfZSA9IF9wLnJldHVybikpIF9lLmNhbGwoX3ApO1xuICAgICAgfSBmaW5hbGx5IHtcbiAgICAgICAgaWYgKGVfMTApIHRocm93IGVfMTAuZXJyb3I7XG4gICAgICB9XG4gICAgfVxuXG4gICAgdGhpcy5zY2hlZHVsZXIuY2xlYXIoKTtcbiAgICB0aGlzLmluaXRpYWxpemVkID0gZmFsc2U7XG4gICAgdGhpcy5zdGF0dXMgPSBJbnRlcnByZXRlclN0YXR1cy5TdG9wcGVkO1xuICAgIHJlZ2lzdHJ5LmZyZWUodGhpcy5zZXNzaW9uSWQpO1xuICAgIHJldHVybiB0aGlzO1xuICB9O1xuXG4gIEludGVycHJldGVyLnByb3RvdHlwZS5iYXRjaCA9IGZ1bmN0aW9uIChldmVudHMpIHtcbiAgICB2YXIgX3RoaXMgPSB0aGlzO1xuXG4gICAgaWYgKHRoaXMuc3RhdHVzID09PSBJbnRlcnByZXRlclN0YXR1cy5Ob3RTdGFydGVkICYmIHRoaXMub3B0aW9ucy5kZWZlckV2ZW50cykge1xuICAgICAgLy8gdHNsaW50OmRpc2FibGUtbmV4dC1saW5lOm5vLWNvbnNvbGVcbiAgICAgIGlmICghSVNfUFJPRFVDVElPTikge1xuICAgICAgICB3YXJuKGZhbHNlLCBldmVudHMubGVuZ3RoICsgXCIgZXZlbnQocykgd2VyZSBzZW50IHRvIHVuaW5pdGlhbGl6ZWQgc2VydmljZSBcXFwiXCIgKyB0aGlzLm1hY2hpbmUuaWQgKyBcIlxcXCIgYW5kIGFyZSBkZWZlcnJlZC4gTWFrZSBzdXJlIC5zdGFydCgpIGlzIGNhbGxlZCBmb3IgdGhpcyBzZXJ2aWNlLlxcbkV2ZW50OiBcIiArIEpTT04uc3RyaW5naWZ5KGV2ZW50KSk7XG4gICAgICB9XG4gICAgfSBlbHNlIGlmICh0aGlzLnN0YXR1cyAhPT0gSW50ZXJwcmV0ZXJTdGF0dXMuUnVubmluZykge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCAvLyB0c2xpbnQ6ZGlzYWJsZS1uZXh0LWxpbmU6bWF4LWxpbmUtbGVuZ3RoXG4gICAgICBldmVudHMubGVuZ3RoICsgXCIgZXZlbnQocykgd2VyZSBzZW50IHRvIHVuaW5pdGlhbGl6ZWQgc2VydmljZSBcXFwiXCIgKyB0aGlzLm1hY2hpbmUuaWQgKyBcIlxcXCIuIE1ha2Ugc3VyZSAuc3RhcnQoKSBpcyBjYWxsZWQgZm9yIHRoaXMgc2VydmljZSwgb3Igc2V0IHsgZGVmZXJFdmVudHM6IHRydWUgfSBpbiB0aGUgc2VydmljZSBvcHRpb25zLlwiKTtcbiAgICB9XG5cbiAgICB0aGlzLnNjaGVkdWxlci5zY2hlZHVsZShmdW5jdGlvbiAoKSB7XG4gICAgICB2YXIgZV8xMiwgX2E7XG5cbiAgICAgIHZhciBuZXh0U3RhdGUgPSBfdGhpcy5zdGF0ZTtcbiAgICAgIHZhciBiYXRjaENoYW5nZWQgPSBmYWxzZTtcbiAgICAgIHZhciBiYXRjaGVkQWN0aW9ucyA9IFtdO1xuXG4gICAgICB2YXIgX2xvb3BfMSA9IGZ1bmN0aW9uIChldmVudF8xKSB7XG4gICAgICAgIHZhciBfZXZlbnQgPSB0b1NDWE1MRXZlbnQoZXZlbnRfMSk7XG5cbiAgICAgICAgX3RoaXMuZm9yd2FyZChfZXZlbnQpO1xuXG4gICAgICAgIG5leHRTdGF0ZSA9IHByb3ZpZGUoX3RoaXMsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICByZXR1cm4gX3RoaXMubWFjaGluZS50cmFuc2l0aW9uKG5leHRTdGF0ZSwgX2V2ZW50KTtcbiAgICAgICAgfSk7XG4gICAgICAgIGJhdGNoZWRBY3Rpb25zLnB1c2guYXBwbHkoYmF0Y2hlZEFjdGlvbnMsIF9fc3ByZWFkKG5leHRTdGF0ZS5hY3Rpb25zLm1hcChmdW5jdGlvbiAoYSkge1xuICAgICAgICAgIHJldHVybiBiaW5kQWN0aW9uVG9TdGF0ZShhLCBuZXh0U3RhdGUpO1xuICAgICAgICB9KSkpO1xuICAgICAgICBiYXRjaENoYW5nZWQgPSBiYXRjaENoYW5nZWQgfHwgISFuZXh0U3RhdGUuY2hhbmdlZDtcbiAgICAgIH07XG5cbiAgICAgIHRyeSB7XG4gICAgICAgIGZvciAodmFyIGV2ZW50c18xID0gX192YWx1ZXMoZXZlbnRzKSwgZXZlbnRzXzFfMSA9IGV2ZW50c18xLm5leHQoKTsgIWV2ZW50c18xXzEuZG9uZTsgZXZlbnRzXzFfMSA9IGV2ZW50c18xLm5leHQoKSkge1xuICAgICAgICAgIHZhciBldmVudF8xID0gZXZlbnRzXzFfMS52YWx1ZTtcblxuICAgICAgICAgIF9sb29wXzEoZXZlbnRfMSk7XG4gICAgICAgIH1cbiAgICAgIH0gY2F0Y2ggKGVfMTJfMSkge1xuICAgICAgICBlXzEyID0ge1xuICAgICAgICAgIGVycm9yOiBlXzEyXzFcbiAgICAgICAgfTtcbiAgICAgIH0gZmluYWxseSB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgaWYgKGV2ZW50c18xXzEgJiYgIWV2ZW50c18xXzEuZG9uZSAmJiAoX2EgPSBldmVudHNfMS5yZXR1cm4pKSBfYS5jYWxsKGV2ZW50c18xKTtcbiAgICAgICAgfSBmaW5hbGx5IHtcbiAgICAgICAgICBpZiAoZV8xMikgdGhyb3cgZV8xMi5lcnJvcjtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBuZXh0U3RhdGUuY2hhbmdlZCA9IGJhdGNoQ2hhbmdlZDtcbiAgICAgIG5leHRTdGF0ZS5hY3Rpb25zID0gYmF0Y2hlZEFjdGlvbnM7XG5cbiAgICAgIF90aGlzLnVwZGF0ZShuZXh0U3RhdGUsIHRvU0NYTUxFdmVudChldmVudHNbZXZlbnRzLmxlbmd0aCAtIDFdKSk7XG4gICAgfSk7XG4gIH07XG4gIC8qKlxyXG4gICAqIFJldHVybnMgYSBzZW5kIGZ1bmN0aW9uIGJvdW5kIHRvIHRoaXMgaW50ZXJwcmV0ZXIgaW5zdGFuY2UuXHJcbiAgICpcclxuICAgKiBAcGFyYW0gZXZlbnQgVGhlIGV2ZW50IHRvIGJlIHNlbnQgYnkgdGhlIHNlbmRlci5cclxuICAgKi9cblxuXG4gIEludGVycHJldGVyLnByb3RvdHlwZS5zZW5kZXIgPSBmdW5jdGlvbiAoZXZlbnQpIHtcbiAgICByZXR1cm4gdGhpcy5zZW5kLmJpbmQodGhpcywgZXZlbnQpO1xuICB9O1xuICAvKipcclxuICAgKiBSZXR1cm5zIHRoZSBuZXh0IHN0YXRlIGdpdmVuIHRoZSBpbnRlcnByZXRlcidzIGN1cnJlbnQgc3RhdGUgYW5kIHRoZSBldmVudC5cclxuICAgKlxyXG4gICAqIFRoaXMgaXMgYSBwdXJlIG1ldGhvZCB0aGF0IGRvZXMgX25vdF8gdXBkYXRlIHRoZSBpbnRlcnByZXRlcidzIHN0YXRlLlxyXG4gICAqXHJcbiAgICogQHBhcmFtIGV2ZW50IFRoZSBldmVudCB0byBkZXRlcm1pbmUgdGhlIG5leHQgc3RhdGVcclxuICAgKi9cblxuXG4gIEludGVycHJldGVyLnByb3RvdHlwZS5uZXh0U3RhdGUgPSBmdW5jdGlvbiAoZXZlbnQpIHtcbiAgICB2YXIgX3RoaXMgPSB0aGlzO1xuXG4gICAgdmFyIF9ldmVudCA9IHRvU0NYTUxFdmVudChldmVudCk7XG5cbiAgICBpZiAoX2V2ZW50Lm5hbWUuaW5kZXhPZihlcnJvclBsYXRmb3JtKSA9PT0gMCAmJiAhdGhpcy5zdGF0ZS5uZXh0RXZlbnRzLnNvbWUoZnVuY3Rpb24gKG5leHRFdmVudCkge1xuICAgICAgcmV0dXJuIG5leHRFdmVudC5pbmRleE9mKGVycm9yUGxhdGZvcm0pID09PSAwO1xuICAgIH0pKSB7XG4gICAgICB0aHJvdyBfZXZlbnQuZGF0YS5kYXRhO1xuICAgIH1cblxuICAgIHZhciBuZXh0U3RhdGUgPSBwcm92aWRlKHRoaXMsIGZ1bmN0aW9uICgpIHtcbiAgICAgIHJldHVybiBfdGhpcy5tYWNoaW5lLnRyYW5zaXRpb24oX3RoaXMuc3RhdGUsIF9ldmVudCk7XG4gICAgfSk7XG4gICAgcmV0dXJuIG5leHRTdGF0ZTtcbiAgfTtcblxuICBJbnRlcnByZXRlci5wcm90b3R5cGUuZm9yd2FyZCA9IGZ1bmN0aW9uIChldmVudCkge1xuICAgIHZhciBlXzEzLCBfYTtcblxuICAgIHRyeSB7XG4gICAgICBmb3IgKHZhciBfYiA9IF9fdmFsdWVzKHRoaXMuZm9yd2FyZFRvKSwgX2MgPSBfYi5uZXh0KCk7ICFfYy5kb25lOyBfYyA9IF9iLm5leHQoKSkge1xuICAgICAgICB2YXIgaWQgPSBfYy52YWx1ZTtcbiAgICAgICAgdmFyIGNoaWxkID0gdGhpcy5jaGlsZHJlbi5nZXQoaWQpO1xuXG4gICAgICAgIGlmICghY2hpbGQpIHtcbiAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJVbmFibGUgdG8gZm9yd2FyZCBldmVudCAnXCIgKyBldmVudCArIFwiJyBmcm9tIGludGVycHJldGVyICdcIiArIHRoaXMuaWQgKyBcIicgdG8gbm9uZXhpc3RhbnQgY2hpbGQgJ1wiICsgaWQgKyBcIicuXCIpO1xuICAgICAgICB9XG5cbiAgICAgICAgY2hpbGQuc2VuZChldmVudCk7XG4gICAgICB9XG4gICAgfSBjYXRjaCAoZV8xM18xKSB7XG4gICAgICBlXzEzID0ge1xuICAgICAgICBlcnJvcjogZV8xM18xXG4gICAgICB9O1xuICAgIH0gZmluYWxseSB7XG4gICAgICB0cnkge1xuICAgICAgICBpZiAoX2MgJiYgIV9jLmRvbmUgJiYgKF9hID0gX2IucmV0dXJuKSkgX2EuY2FsbChfYik7XG4gICAgICB9IGZpbmFsbHkge1xuICAgICAgICBpZiAoZV8xMykgdGhyb3cgZV8xMy5lcnJvcjtcbiAgICAgIH1cbiAgICB9XG4gIH07XG5cbiAgSW50ZXJwcmV0ZXIucHJvdG90eXBlLmRlZmVyID0gZnVuY3Rpb24gKHNlbmRBY3Rpb24pIHtcbiAgICB2YXIgX3RoaXMgPSB0aGlzO1xuXG4gICAgdGhpcy5kZWxheWVkRXZlbnRzTWFwW3NlbmRBY3Rpb24uaWRdID0gdGhpcy5jbG9jay5zZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHtcbiAgICAgIGlmIChzZW5kQWN0aW9uLnRvKSB7XG4gICAgICAgIF90aGlzLnNlbmRUbyhzZW5kQWN0aW9uLl9ldmVudCwgc2VuZEFjdGlvbi50byk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBfdGhpcy5zZW5kKHNlbmRBY3Rpb24uX2V2ZW50KTtcbiAgICAgIH1cbiAgICB9LCBzZW5kQWN0aW9uLmRlbGF5KTtcbiAgfTtcblxuICBJbnRlcnByZXRlci5wcm90b3R5cGUuY2FuY2VsID0gZnVuY3Rpb24gKHNlbmRJZCkge1xuICAgIHRoaXMuY2xvY2suY2xlYXJUaW1lb3V0KHRoaXMuZGVsYXllZEV2ZW50c01hcFtzZW5kSWRdKTtcbiAgICBkZWxldGUgdGhpcy5kZWxheWVkRXZlbnRzTWFwW3NlbmRJZF07XG4gIH07XG5cbiAgSW50ZXJwcmV0ZXIucHJvdG90eXBlLmV4ZWMgPSBmdW5jdGlvbiAoYWN0aW9uLCBzdGF0ZSwgYWN0aW9uRnVuY3Rpb25NYXApIHtcbiAgICBpZiAoYWN0aW9uRnVuY3Rpb25NYXAgPT09IHZvaWQgMCkge1xuICAgICAgYWN0aW9uRnVuY3Rpb25NYXAgPSB0aGlzLm1hY2hpbmUub3B0aW9ucy5hY3Rpb25zO1xuICAgIH1cblxuICAgIHZhciBjb250ZXh0ID0gc3RhdGUuY29udGV4dCxcbiAgICAgICAgX2V2ZW50ID0gc3RhdGUuX2V2ZW50O1xuICAgIHZhciBhY3Rpb25PckV4ZWMgPSBhY3Rpb24uZXhlYyB8fCBnZXRBY3Rpb25GdW5jdGlvbihhY3Rpb24udHlwZSwgYWN0aW9uRnVuY3Rpb25NYXApO1xuICAgIHZhciBleGVjID0gaXNGdW5jdGlvbihhY3Rpb25PckV4ZWMpID8gYWN0aW9uT3JFeGVjIDogYWN0aW9uT3JFeGVjID8gYWN0aW9uT3JFeGVjLmV4ZWMgOiBhY3Rpb24uZXhlYztcblxuICAgIGlmIChleGVjKSB7XG4gICAgICB0cnkge1xuICAgICAgICByZXR1cm4gZXhlYyhjb250ZXh0LCBfZXZlbnQuZGF0YSwge1xuICAgICAgICAgIGFjdGlvbjogYWN0aW9uLFxuICAgICAgICAgIHN0YXRlOiB0aGlzLnN0YXRlLFxuICAgICAgICAgIF9ldmVudDogX2V2ZW50XG4gICAgICAgIH0pO1xuICAgICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAgIGlmICh0aGlzLnBhcmVudCkge1xuICAgICAgICAgIHRoaXMucGFyZW50LnNlbmQoe1xuICAgICAgICAgICAgdHlwZTogJ3hzdGF0ZS5lcnJvcicsXG4gICAgICAgICAgICBkYXRhOiBlcnJcbiAgICAgICAgICB9KTtcbiAgICAgICAgfVxuXG4gICAgICAgIHRocm93IGVycjtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBzd2l0Y2ggKGFjdGlvbi50eXBlKSB7XG4gICAgICBjYXNlIHNlbmQ6XG4gICAgICAgIHZhciBzZW5kQWN0aW9uID0gYWN0aW9uO1xuXG4gICAgICAgIGlmICh0eXBlb2Ygc2VuZEFjdGlvbi5kZWxheSA9PT0gJ251bWJlcicpIHtcbiAgICAgICAgICB0aGlzLmRlZmVyKHNlbmRBY3Rpb24pO1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBpZiAoc2VuZEFjdGlvbi50bykge1xuICAgICAgICAgICAgdGhpcy5zZW5kVG8oc2VuZEFjdGlvbi5fZXZlbnQsIHNlbmRBY3Rpb24udG8pO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLnNlbmQoc2VuZEFjdGlvbi5fZXZlbnQpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGJyZWFrO1xuXG4gICAgICBjYXNlIGNhbmNlbDpcbiAgICAgICAgdGhpcy5jYW5jZWwoYWN0aW9uLnNlbmRJZCk7XG4gICAgICAgIGJyZWFrO1xuXG4gICAgICBjYXNlIHN0YXJ0OlxuICAgICAgICB7XG4gICAgICAgICAgdmFyIGFjdGl2aXR5ID0gYWN0aW9uLmFjdGl2aXR5OyAvLyBJZiB0aGUgYWN0aXZpdHkgd2lsbCBiZSBzdG9wcGVkIHJpZ2h0IGFmdGVyIGl0J3Mgc3RhcnRlZFxuICAgICAgICAgIC8vIChzdWNoIGFzIGluIHRyYW5zaWVudCBzdGF0ZXMpXG4gICAgICAgICAgLy8gZG9uJ3QgYm90aGVyIHN0YXJ0aW5nIHRoZSBhY3Rpdml0eS5cblxuICAgICAgICAgIGlmICghdGhpcy5zdGF0ZS5hY3Rpdml0aWVzW2FjdGl2aXR5LmlkIHx8IGFjdGl2aXR5LnR5cGVdKSB7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICB9IC8vIEludm9rZWQgc2VydmljZXNcblxuXG4gICAgICAgICAgaWYgKGFjdGl2aXR5LnR5cGUgPT09IEFjdGlvblR5cGVzLkludm9rZSkge1xuICAgICAgICAgICAgdmFyIGludm9rZVNvdXJjZSA9IHRvSW52b2tlU291cmNlKGFjdGl2aXR5LnNyYyk7XG4gICAgICAgICAgICB2YXIgc2VydmljZUNyZWF0b3IgPSB0aGlzLm1hY2hpbmUub3B0aW9ucy5zZXJ2aWNlcyA/IHRoaXMubWFjaGluZS5vcHRpb25zLnNlcnZpY2VzW2ludm9rZVNvdXJjZS50eXBlXSA6IHVuZGVmaW5lZDtcbiAgICAgICAgICAgIHZhciBpZCA9IGFjdGl2aXR5LmlkLFxuICAgICAgICAgICAgICAgIGRhdGEgPSBhY3Rpdml0eS5kYXRhO1xuXG4gICAgICAgICAgICBpZiAoIUlTX1BST0RVQ1RJT04pIHtcbiAgICAgICAgICAgICAgd2FybighKCdmb3J3YXJkJyBpbiBhY3Rpdml0eSksIC8vIHRzbGludDpkaXNhYmxlLW5leHQtbGluZTptYXgtbGluZS1sZW5ndGhcbiAgICAgICAgICAgICAgXCJgZm9yd2FyZGAgcHJvcGVydHkgaXMgZGVwcmVjYXRlZCAoZm91bmQgaW4gaW52b2NhdGlvbiBvZiAnXCIgKyBhY3Rpdml0eS5zcmMgKyBcIicgaW4gaW4gbWFjaGluZSAnXCIgKyB0aGlzLm1hY2hpbmUuaWQgKyBcIicpLiBcIiArIFwiUGxlYXNlIHVzZSBgYXV0b0ZvcndhcmRgIGluc3RlYWQuXCIpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB2YXIgYXV0b0ZvcndhcmQgPSAnYXV0b0ZvcndhcmQnIGluIGFjdGl2aXR5ID8gYWN0aXZpdHkuYXV0b0ZvcndhcmQgOiAhIWFjdGl2aXR5LmZvcndhcmQ7XG5cbiAgICAgICAgICAgIGlmICghc2VydmljZUNyZWF0b3IpIHtcbiAgICAgICAgICAgICAgLy8gdHNsaW50OmRpc2FibGUtbmV4dC1saW5lOm5vLWNvbnNvbGVcbiAgICAgICAgICAgICAgaWYgKCFJU19QUk9EVUNUSU9OKSB7XG4gICAgICAgICAgICAgICAgd2FybihmYWxzZSwgXCJObyBzZXJ2aWNlIGZvdW5kIGZvciBpbnZvY2F0aW9uICdcIiArIGFjdGl2aXR5LnNyYyArIFwiJyBpbiBtYWNoaW5lICdcIiArIHRoaXMubWFjaGluZS5pZCArIFwiJy5cIik7XG4gICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHZhciByZXNvbHZlZERhdGEgPSBkYXRhID8gbWFwQ29udGV4dChkYXRhLCBjb250ZXh0LCBfZXZlbnQpIDogdW5kZWZpbmVkO1xuICAgICAgICAgICAgdmFyIHNvdXJjZSA9IGlzRnVuY3Rpb24oc2VydmljZUNyZWF0b3IpID8gc2VydmljZUNyZWF0b3IoY29udGV4dCwgX2V2ZW50LmRhdGEsIHtcbiAgICAgICAgICAgICAgZGF0YTogcmVzb2x2ZWREYXRhLFxuICAgICAgICAgICAgICBzcmM6IGludm9rZVNvdXJjZVxuICAgICAgICAgICAgfSkgOiBzZXJ2aWNlQ3JlYXRvcjtcblxuICAgICAgICAgICAgaWYgKGlzUHJvbWlzZUxpa2Uoc291cmNlKSkge1xuICAgICAgICAgICAgICB0aGlzLnNwYXduUHJvbWlzZShQcm9taXNlLnJlc29sdmUoc291cmNlKSwgaWQpO1xuICAgICAgICAgICAgfSBlbHNlIGlmIChpc0Z1bmN0aW9uKHNvdXJjZSkpIHtcbiAgICAgICAgICAgICAgdGhpcy5zcGF3bkNhbGxiYWNrKHNvdXJjZSwgaWQpO1xuICAgICAgICAgICAgfSBlbHNlIGlmIChpc09ic2VydmFibGUoc291cmNlKSkge1xuICAgICAgICAgICAgICB0aGlzLnNwYXduT2JzZXJ2YWJsZShzb3VyY2UsIGlkKTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoaXNNYWNoaW5lKHNvdXJjZSkpIHtcbiAgICAgICAgICAgICAgLy8gVE9ETzogdHJ5L2NhdGNoIGhlcmVcbiAgICAgICAgICAgICAgdGhpcy5zcGF3bk1hY2hpbmUocmVzb2x2ZWREYXRhID8gc291cmNlLndpdGhDb250ZXh0KHJlc29sdmVkRGF0YSkgOiBzb3VyY2UsIHtcbiAgICAgICAgICAgICAgICBpZDogaWQsXG4gICAgICAgICAgICAgICAgYXV0b0ZvcndhcmQ6IGF1dG9Gb3J3YXJkXG4gICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSBlbHNlIDtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5zcGF3bkFjdGl2aXR5KGFjdGl2aXR5KTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuXG4gICAgICBjYXNlIHN0b3A6XG4gICAgICAgIHtcbiAgICAgICAgICB0aGlzLnN0b3BDaGlsZChhY3Rpb24uYWN0aXZpdHkuaWQpO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG5cbiAgICAgIGNhc2UgbG9nOlxuICAgICAgICB2YXIgbGFiZWwgPSBhY3Rpb24ubGFiZWwsXG4gICAgICAgICAgICB2YWx1ZSA9IGFjdGlvbi52YWx1ZTtcblxuICAgICAgICBpZiAobGFiZWwpIHtcbiAgICAgICAgICB0aGlzLmxvZ2dlcihsYWJlbCwgdmFsdWUpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHRoaXMubG9nZ2VyKHZhbHVlKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGJyZWFrO1xuXG4gICAgICBkZWZhdWx0OlxuICAgICAgICBpZiAoIUlTX1BST0RVQ1RJT04pIHtcbiAgICAgICAgICB3YXJuKGZhbHNlLCBcIk5vIGltcGxlbWVudGF0aW9uIGZvdW5kIGZvciBhY3Rpb24gdHlwZSAnXCIgKyBhY3Rpb24udHlwZSArIFwiJ1wiKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGJyZWFrO1xuICAgIH1cblxuICAgIHJldHVybiB1bmRlZmluZWQ7XG4gIH07XG5cbiAgSW50ZXJwcmV0ZXIucHJvdG90eXBlLnJlbW92ZUNoaWxkID0gZnVuY3Rpb24gKGNoaWxkSWQpIHtcbiAgICB0aGlzLmNoaWxkcmVuLmRlbGV0ZShjaGlsZElkKTtcbiAgICB0aGlzLmZvcndhcmRUby5kZWxldGUoY2hpbGRJZCk7XG4gICAgZGVsZXRlIHRoaXMuc3RhdGUuY2hpbGRyZW5bY2hpbGRJZF07XG4gIH07XG5cbiAgSW50ZXJwcmV0ZXIucHJvdG90eXBlLnN0b3BDaGlsZCA9IGZ1bmN0aW9uIChjaGlsZElkKSB7XG4gICAgdmFyIGNoaWxkID0gdGhpcy5jaGlsZHJlbi5nZXQoY2hpbGRJZCk7XG5cbiAgICBpZiAoIWNoaWxkKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgdGhpcy5yZW1vdmVDaGlsZChjaGlsZElkKTtcblxuICAgIGlmIChpc0Z1bmN0aW9uKGNoaWxkLnN0b3ApKSB7XG4gICAgICBjaGlsZC5zdG9wKCk7XG4gICAgfVxuICB9O1xuXG4gIEludGVycHJldGVyLnByb3RvdHlwZS5zcGF3biA9IGZ1bmN0aW9uIChlbnRpdHksIG5hbWUsIG9wdGlvbnMpIHtcbiAgICBpZiAoaXNQcm9taXNlTGlrZShlbnRpdHkpKSB7XG4gICAgICByZXR1cm4gdGhpcy5zcGF3blByb21pc2UoUHJvbWlzZS5yZXNvbHZlKGVudGl0eSksIG5hbWUpO1xuICAgIH0gZWxzZSBpZiAoaXNGdW5jdGlvbihlbnRpdHkpKSB7XG4gICAgICByZXR1cm4gdGhpcy5zcGF3bkNhbGxiYWNrKGVudGl0eSwgbmFtZSk7XG4gICAgfSBlbHNlIGlmIChpc1NwYXduZWRBY3RvcihlbnRpdHkpKSB7XG4gICAgICByZXR1cm4gdGhpcy5zcGF3bkFjdG9yKGVudGl0eSk7XG4gICAgfSBlbHNlIGlmIChpc09ic2VydmFibGUoZW50aXR5KSkge1xuICAgICAgcmV0dXJuIHRoaXMuc3Bhd25PYnNlcnZhYmxlKGVudGl0eSwgbmFtZSk7XG4gICAgfSBlbHNlIGlmIChpc01hY2hpbmUoZW50aXR5KSkge1xuICAgICAgcmV0dXJuIHRoaXMuc3Bhd25NYWNoaW5lKGVudGl0eSwgX19hc3NpZ24oX19hc3NpZ24oe30sIG9wdGlvbnMpLCB7XG4gICAgICAgIGlkOiBuYW1lXG4gICAgICB9KSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihcIlVuYWJsZSB0byBzcGF3biBlbnRpdHkgXFxcIlwiICsgbmFtZSArIFwiXFxcIiBvZiB0eXBlIFxcXCJcIiArIHR5cGVvZiBlbnRpdHkgKyBcIlxcXCIuXCIpO1xuICAgIH1cbiAgfTtcblxuICBJbnRlcnByZXRlci5wcm90b3R5cGUuc3Bhd25NYWNoaW5lID0gZnVuY3Rpb24gKG1hY2hpbmUsIG9wdGlvbnMpIHtcbiAgICB2YXIgX3RoaXMgPSB0aGlzO1xuXG4gICAgaWYgKG9wdGlvbnMgPT09IHZvaWQgMCkge1xuICAgICAgb3B0aW9ucyA9IHt9O1xuICAgIH1cblxuICAgIHZhciBjaGlsZFNlcnZpY2UgPSBuZXcgSW50ZXJwcmV0ZXIobWFjaGluZSwgX19hc3NpZ24oX19hc3NpZ24oe30sIHRoaXMub3B0aW9ucyksIHtcbiAgICAgIHBhcmVudDogdGhpcyxcbiAgICAgIGlkOiBvcHRpb25zLmlkIHx8IG1hY2hpbmUuaWRcbiAgICB9KSk7XG5cbiAgICB2YXIgcmVzb2x2ZWRPcHRpb25zID0gX19hc3NpZ24oX19hc3NpZ24oe30sIERFRkFVTFRfU1BBV05fT1BUSU9OUyksIG9wdGlvbnMpO1xuXG4gICAgaWYgKHJlc29sdmVkT3B0aW9ucy5zeW5jKSB7XG4gICAgICBjaGlsZFNlcnZpY2Uub25UcmFuc2l0aW9uKGZ1bmN0aW9uIChzdGF0ZSkge1xuICAgICAgICBfdGhpcy5zZW5kKHVwZGF0ZSwge1xuICAgICAgICAgIHN0YXRlOiBzdGF0ZSxcbiAgICAgICAgICBpZDogY2hpbGRTZXJ2aWNlLmlkXG4gICAgICAgIH0pO1xuICAgICAgfSk7XG4gICAgfVxuXG4gICAgdmFyIGFjdG9yID0gY2hpbGRTZXJ2aWNlO1xuICAgIHRoaXMuY2hpbGRyZW4uc2V0KGNoaWxkU2VydmljZS5pZCwgYWN0b3IpO1xuXG4gICAgaWYgKHJlc29sdmVkT3B0aW9ucy5hdXRvRm9yd2FyZCkge1xuICAgICAgdGhpcy5mb3J3YXJkVG8uYWRkKGNoaWxkU2VydmljZS5pZCk7XG4gICAgfVxuXG4gICAgY2hpbGRTZXJ2aWNlLm9uRG9uZShmdW5jdGlvbiAoZG9uZUV2ZW50KSB7XG4gICAgICBfdGhpcy5yZW1vdmVDaGlsZChjaGlsZFNlcnZpY2UuaWQpO1xuXG4gICAgICBfdGhpcy5zZW5kKHRvU0NYTUxFdmVudChkb25lRXZlbnQsIHtcbiAgICAgICAgb3JpZ2luOiBjaGlsZFNlcnZpY2UuaWRcbiAgICAgIH0pKTtcbiAgICB9KS5zdGFydCgpO1xuICAgIHJldHVybiBhY3RvcjtcbiAgfTtcblxuICBJbnRlcnByZXRlci5wcm90b3R5cGUuc3Bhd25Qcm9taXNlID0gZnVuY3Rpb24gKHByb21pc2UsIGlkKSB7XG4gICAgdmFyIF90aGlzID0gdGhpcztcblxuICAgIHZhciBjYW5jZWxlZCA9IGZhbHNlO1xuICAgIHByb21pc2UudGhlbihmdW5jdGlvbiAocmVzcG9uc2UpIHtcbiAgICAgIGlmICghY2FuY2VsZWQpIHtcbiAgICAgICAgX3RoaXMucmVtb3ZlQ2hpbGQoaWQpO1xuXG4gICAgICAgIF90aGlzLnNlbmQodG9TQ1hNTEV2ZW50KGRvbmVJbnZva2UoaWQsIHJlc3BvbnNlKSwge1xuICAgICAgICAgIG9yaWdpbjogaWRcbiAgICAgICAgfSkpO1xuICAgICAgfVxuICAgIH0sIGZ1bmN0aW9uIChlcnJvckRhdGEpIHtcbiAgICAgIGlmICghY2FuY2VsZWQpIHtcbiAgICAgICAgX3RoaXMucmVtb3ZlQ2hpbGQoaWQpO1xuXG4gICAgICAgIHZhciBlcnJvckV2ZW50ID0gZXJyb3IoaWQsIGVycm9yRGF0YSk7XG5cbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAvLyBTZW5kIFwiZXJyb3IucGxhdGZvcm0uaWRcIiB0byB0aGlzIChwYXJlbnQpLlxuICAgICAgICAgIF90aGlzLnNlbmQodG9TQ1hNTEV2ZW50KGVycm9yRXZlbnQsIHtcbiAgICAgICAgICAgIG9yaWdpbjogaWRcbiAgICAgICAgICB9KSk7XG4gICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgcmVwb3J0VW5oYW5kbGVkRXhjZXB0aW9uT25JbnZvY2F0aW9uKGVycm9yRGF0YSwgZXJyb3IsIGlkKTtcblxuICAgICAgICAgIGlmIChfdGhpcy5kZXZUb29scykge1xuICAgICAgICAgICAgX3RoaXMuZGV2VG9vbHMuc2VuZChlcnJvckV2ZW50LCBfdGhpcy5zdGF0ZSk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgaWYgKF90aGlzLm1hY2hpbmUuc3RyaWN0KSB7XG4gICAgICAgICAgICAvLyBpdCB3b3VsZCBiZSBiZXR0ZXIgdG8gYWx3YXlzIHN0b3AgdGhlIHN0YXRlIG1hY2hpbmUgaWYgdW5oYW5kbGVkXG4gICAgICAgICAgICAvLyBleGNlcHRpb24vcHJvbWlzZSByZWplY3Rpb24gaGFwcGVucyBidXQgYmVjYXVzZSB3ZSBkb24ndCB3YW50IHRvXG4gICAgICAgICAgICAvLyBicmVhayBleGlzdGluZyBjb2RlIHNvIGVuZm9yY2UgaXQgb24gc3RyaWN0IG1vZGUgb25seSBlc3BlY2lhbGx5IHNvXG4gICAgICAgICAgICAvLyBiZWNhdXNlIGRvY3VtZW50YXRpb24gc2F5cyB0aGF0IG9uRXJyb3IgaXMgb3B0aW9uYWxcbiAgICAgICAgICAgIF90aGlzLnN0b3AoKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9KTtcbiAgICB2YXIgYWN0b3IgPSB7XG4gICAgICBpZDogaWQsXG4gICAgICBzZW5kOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJldHVybiB2b2lkIDA7XG4gICAgICB9LFxuICAgICAgc3Vic2NyaWJlOiBmdW5jdGlvbiAobmV4dCwgaGFuZGxlRXJyb3IsIGNvbXBsZXRlKSB7XG4gICAgICAgIHZhciBvYnNlcnZlciA9IHRvT2JzZXJ2ZXIobmV4dCwgaGFuZGxlRXJyb3IsIGNvbXBsZXRlKTtcbiAgICAgICAgdmFyIHVuc3Vic2NyaWJlZCA9IGZhbHNlO1xuICAgICAgICBwcm9taXNlLnRoZW4oZnVuY3Rpb24gKHJlc3BvbnNlKSB7XG4gICAgICAgICAgaWYgKHVuc3Vic2NyaWJlZCkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIG9ic2VydmVyLm5leHQocmVzcG9uc2UpO1xuXG4gICAgICAgICAgaWYgKHVuc3Vic2NyaWJlZCkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIG9ic2VydmVyLmNvbXBsZXRlKCk7XG4gICAgICAgIH0sIGZ1bmN0aW9uIChlcnIpIHtcbiAgICAgICAgICBpZiAodW5zdWJzY3JpYmVkKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgb2JzZXJ2ZXIuZXJyb3IoZXJyKTtcbiAgICAgICAgfSk7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgdW5zdWJzY3JpYmU6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHJldHVybiB1bnN1YnNjcmliZWQgPSB0cnVlO1xuICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICAgIH0sXG4gICAgICBzdG9wOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIGNhbmNlbGVkID0gdHJ1ZTtcbiAgICAgIH0sXG4gICAgICB0b0pTT046IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICBpZDogaWRcbiAgICAgICAgfTtcbiAgICAgIH1cbiAgICB9O1xuICAgIHRoaXMuY2hpbGRyZW4uc2V0KGlkLCBhY3Rvcik7XG4gICAgcmV0dXJuIGFjdG9yO1xuICB9O1xuXG4gIEludGVycHJldGVyLnByb3RvdHlwZS5zcGF3bkNhbGxiYWNrID0gZnVuY3Rpb24gKGNhbGxiYWNrLCBpZCkge1xuICAgIHZhciBfdGhpcyA9IHRoaXM7XG5cbiAgICB2YXIgY2FuY2VsZWQgPSBmYWxzZTtcbiAgICB2YXIgcmVjZWl2ZXJzID0gbmV3IFNldCgpO1xuICAgIHZhciBsaXN0ZW5lcnMgPSBuZXcgU2V0KCk7XG5cbiAgICB2YXIgcmVjZWl2ZSA9IGZ1bmN0aW9uIChlKSB7XG4gICAgICBsaXN0ZW5lcnMuZm9yRWFjaChmdW5jdGlvbiAobGlzdGVuZXIpIHtcbiAgICAgICAgcmV0dXJuIGxpc3RlbmVyKGUpO1xuICAgICAgfSk7XG5cbiAgICAgIGlmIChjYW5jZWxlZCkge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIF90aGlzLnNlbmQodG9TQ1hNTEV2ZW50KGUsIHtcbiAgICAgICAgb3JpZ2luOiBpZFxuICAgICAgfSkpO1xuICAgIH07XG5cbiAgICB2YXIgY2FsbGJhY2tTdG9wO1xuXG4gICAgdHJ5IHtcbiAgICAgIGNhbGxiYWNrU3RvcCA9IGNhbGxiYWNrKHJlY2VpdmUsIGZ1bmN0aW9uIChuZXdMaXN0ZW5lcikge1xuICAgICAgICByZWNlaXZlcnMuYWRkKG5ld0xpc3RlbmVyKTtcbiAgICAgIH0pO1xuICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgdGhpcy5zZW5kKGVycm9yKGlkLCBlcnIpKTtcbiAgICB9XG5cbiAgICBpZiAoaXNQcm9taXNlTGlrZShjYWxsYmFja1N0b3ApKSB7XG4gICAgICAvLyBpdCB0dXJuZWQgb3V0IHRvIGJlIGFuIGFzeW5jIGZ1bmN0aW9uLCBjYW4ndCByZWxpYWJseSBjaGVjayB0aGlzIGJlZm9yZSBjYWxsaW5nIGBjYWxsYmFja2BcbiAgICAgIC8vIGJlY2F1c2UgdHJhbnNwaWxlZCBhc3luYyBmdW5jdGlvbnMgYXJlIG5vdCByZWNvZ25pemFibGVcbiAgICAgIHJldHVybiB0aGlzLnNwYXduUHJvbWlzZShjYWxsYmFja1N0b3AsIGlkKTtcbiAgICB9XG5cbiAgICB2YXIgYWN0b3IgPSB7XG4gICAgICBpZDogaWQsXG4gICAgICBzZW5kOiBmdW5jdGlvbiAoZXZlbnQpIHtcbiAgICAgICAgcmV0dXJuIHJlY2VpdmVycy5mb3JFYWNoKGZ1bmN0aW9uIChyZWNlaXZlcikge1xuICAgICAgICAgIHJldHVybiByZWNlaXZlcihldmVudCk7XG4gICAgICAgIH0pO1xuICAgICAgfSxcbiAgICAgIHN1YnNjcmliZTogZnVuY3Rpb24gKG5leHQpIHtcbiAgICAgICAgbGlzdGVuZXJzLmFkZChuZXh0KTtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICB1bnN1YnNjcmliZTogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgbGlzdGVuZXJzLmRlbGV0ZShuZXh0KTtcbiAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgICB9LFxuICAgICAgc3RvcDogZnVuY3Rpb24gKCkge1xuICAgICAgICBjYW5jZWxlZCA9IHRydWU7XG5cbiAgICAgICAgaWYgKGlzRnVuY3Rpb24oY2FsbGJhY2tTdG9wKSkge1xuICAgICAgICAgIGNhbGxiYWNrU3RvcCgpO1xuICAgICAgICB9XG4gICAgICB9LFxuICAgICAgdG9KU09OOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgaWQ6IGlkXG4gICAgICAgIH07XG4gICAgICB9XG4gICAgfTtcbiAgICB0aGlzLmNoaWxkcmVuLnNldChpZCwgYWN0b3IpO1xuICAgIHJldHVybiBhY3RvcjtcbiAgfTtcblxuICBJbnRlcnByZXRlci5wcm90b3R5cGUuc3Bhd25PYnNlcnZhYmxlID0gZnVuY3Rpb24gKHNvdXJjZSwgaWQpIHtcbiAgICB2YXIgX3RoaXMgPSB0aGlzO1xuXG4gICAgdmFyIHN1YnNjcmlwdGlvbiA9IHNvdXJjZS5zdWJzY3JpYmUoZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgICBfdGhpcy5zZW5kKHRvU0NYTUxFdmVudCh2YWx1ZSwge1xuICAgICAgICBvcmlnaW46IGlkXG4gICAgICB9KSk7XG4gICAgfSwgZnVuY3Rpb24gKGVycikge1xuICAgICAgX3RoaXMucmVtb3ZlQ2hpbGQoaWQpO1xuXG4gICAgICBfdGhpcy5zZW5kKHRvU0NYTUxFdmVudChlcnJvcihpZCwgZXJyKSwge1xuICAgICAgICBvcmlnaW46IGlkXG4gICAgICB9KSk7XG4gICAgfSwgZnVuY3Rpb24gKCkge1xuICAgICAgX3RoaXMucmVtb3ZlQ2hpbGQoaWQpO1xuXG4gICAgICBfdGhpcy5zZW5kKHRvU0NYTUxFdmVudChkb25lSW52b2tlKGlkKSwge1xuICAgICAgICBvcmlnaW46IGlkXG4gICAgICB9KSk7XG4gICAgfSk7XG4gICAgdmFyIGFjdG9yID0ge1xuICAgICAgaWQ6IGlkLFxuICAgICAgc2VuZDogZnVuY3Rpb24gKCkge1xuICAgICAgICByZXR1cm4gdm9pZCAwO1xuICAgICAgfSxcbiAgICAgIHN1YnNjcmliZTogZnVuY3Rpb24gKG5leHQsIGhhbmRsZUVycm9yLCBjb21wbGV0ZSkge1xuICAgICAgICByZXR1cm4gc291cmNlLnN1YnNjcmliZShuZXh0LCBoYW5kbGVFcnJvciwgY29tcGxldGUpO1xuICAgICAgfSxcbiAgICAgIHN0b3A6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmV0dXJuIHN1YnNjcmlwdGlvbi51bnN1YnNjcmliZSgpO1xuICAgICAgfSxcbiAgICAgIHRvSlNPTjogZnVuY3Rpb24gKCkge1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgIGlkOiBpZFxuICAgICAgICB9O1xuICAgICAgfVxuICAgIH07XG4gICAgdGhpcy5jaGlsZHJlbi5zZXQoaWQsIGFjdG9yKTtcbiAgICByZXR1cm4gYWN0b3I7XG4gIH07XG5cbiAgSW50ZXJwcmV0ZXIucHJvdG90eXBlLnNwYXduQWN0b3IgPSBmdW5jdGlvbiAoYWN0b3IpIHtcbiAgICB0aGlzLmNoaWxkcmVuLnNldChhY3Rvci5pZCwgYWN0b3IpO1xuICAgIHJldHVybiBhY3RvcjtcbiAgfTtcblxuICBJbnRlcnByZXRlci5wcm90b3R5cGUuc3Bhd25BY3Rpdml0eSA9IGZ1bmN0aW9uIChhY3Rpdml0eSkge1xuICAgIHZhciBpbXBsZW1lbnRhdGlvbiA9IHRoaXMubWFjaGluZS5vcHRpb25zICYmIHRoaXMubWFjaGluZS5vcHRpb25zLmFjdGl2aXRpZXMgPyB0aGlzLm1hY2hpbmUub3B0aW9ucy5hY3Rpdml0aWVzW2FjdGl2aXR5LnR5cGVdIDogdW5kZWZpbmVkO1xuXG4gICAgaWYgKCFpbXBsZW1lbnRhdGlvbikge1xuICAgICAgaWYgKCFJU19QUk9EVUNUSU9OKSB7XG4gICAgICAgIHdhcm4oZmFsc2UsIFwiTm8gaW1wbGVtZW50YXRpb24gZm91bmQgZm9yIGFjdGl2aXR5ICdcIiArIGFjdGl2aXR5LnR5cGUgKyBcIidcIik7XG4gICAgICB9IC8vIHRzbGludDpkaXNhYmxlLW5leHQtbGluZTpuby1jb25zb2xlXG5cblxuICAgICAgcmV0dXJuO1xuICAgIH0gLy8gU3RhcnQgaW1wbGVtZW50YXRpb25cblxuXG4gICAgdmFyIGRpc3Bvc2UgPSBpbXBsZW1lbnRhdGlvbih0aGlzLnN0YXRlLmNvbnRleHQsIGFjdGl2aXR5KTtcbiAgICB0aGlzLnNwYXduRWZmZWN0KGFjdGl2aXR5LmlkLCBkaXNwb3NlKTtcbiAgfTtcblxuICBJbnRlcnByZXRlci5wcm90b3R5cGUuc3Bhd25FZmZlY3QgPSBmdW5jdGlvbiAoaWQsIGRpc3Bvc2UpIHtcbiAgICB0aGlzLmNoaWxkcmVuLnNldChpZCwge1xuICAgICAgaWQ6IGlkLFxuICAgICAgc2VuZDogZnVuY3Rpb24gKCkge1xuICAgICAgICByZXR1cm4gdm9pZCAwO1xuICAgICAgfSxcbiAgICAgIHN1YnNjcmliZTogZnVuY3Rpb24gKCkge1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgIHVuc3Vic2NyaWJlOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICByZXR1cm4gdm9pZCAwO1xuICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICAgIH0sXG4gICAgICBzdG9wOiBkaXNwb3NlIHx8IHVuZGVmaW5lZCxcbiAgICAgIHRvSlNPTjogZnVuY3Rpb24gKCkge1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgIGlkOiBpZFxuICAgICAgICB9O1xuICAgICAgfVxuICAgIH0pO1xuICB9O1xuXG4gIEludGVycHJldGVyLnByb3RvdHlwZS5hdHRhY2hEZXYgPSBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIGdsb2JhbCA9IGdldEdsb2JhbCgpO1xuXG4gICAgaWYgKHRoaXMub3B0aW9ucy5kZXZUb29scyAmJiBnbG9iYWwpIHtcbiAgICAgIGlmIChnbG9iYWwuX19SRURVWF9ERVZUT09MU19FWFRFTlNJT05fXykge1xuICAgICAgICB2YXIgZGV2VG9vbHNPcHRpb25zID0gdHlwZW9mIHRoaXMub3B0aW9ucy5kZXZUb29scyA9PT0gJ29iamVjdCcgPyB0aGlzLm9wdGlvbnMuZGV2VG9vbHMgOiB1bmRlZmluZWQ7XG4gICAgICAgIHRoaXMuZGV2VG9vbHMgPSBnbG9iYWwuX19SRURVWF9ERVZUT09MU19FWFRFTlNJT05fXy5jb25uZWN0KF9fYXNzaWduKF9fYXNzaWduKHtcbiAgICAgICAgICBuYW1lOiB0aGlzLmlkLFxuICAgICAgICAgIGF1dG9QYXVzZTogdHJ1ZSxcbiAgICAgICAgICBzdGF0ZVNhbml0aXplcjogZnVuY3Rpb24gKHN0YXRlKSB7XG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICB2YWx1ZTogc3RhdGUudmFsdWUsXG4gICAgICAgICAgICAgIGNvbnRleHQ6IHN0YXRlLmNvbnRleHQsXG4gICAgICAgICAgICAgIGFjdGlvbnM6IHN0YXRlLmFjdGlvbnNcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgfVxuICAgICAgICB9LCBkZXZUb29sc09wdGlvbnMpLCB7XG4gICAgICAgICAgZmVhdHVyZXM6IF9fYXNzaWduKHtcbiAgICAgICAgICAgIGp1bXA6IGZhbHNlLFxuICAgICAgICAgICAgc2tpcDogZmFsc2VcbiAgICAgICAgICB9LCBkZXZUb29sc09wdGlvbnMgPyBkZXZUb29sc09wdGlvbnMuZmVhdHVyZXMgOiB1bmRlZmluZWQpXG4gICAgICAgIH0pLCB0aGlzLm1hY2hpbmUpO1xuICAgICAgICB0aGlzLmRldlRvb2xzLmluaXQodGhpcy5zdGF0ZSk7XG4gICAgICB9IC8vIGFkZCBYU3RhdGUtc3BlY2lmaWMgZGV2IHRvb2xpbmcgaG9va1xuXG5cbiAgICAgIHJlZ2lzdGVyU2VydmljZSh0aGlzKTtcbiAgICB9XG4gIH07XG5cbiAgSW50ZXJwcmV0ZXIucHJvdG90eXBlLnRvSlNPTiA9IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4ge1xuICAgICAgaWQ6IHRoaXMuaWRcbiAgICB9O1xuICB9O1xuXG4gIEludGVycHJldGVyLnByb3RvdHlwZVtzeW1ib2xPYnNlcnZhYmxlXSA9IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gdGhpcztcbiAgfTtcbiAgLyoqXHJcbiAgICogVGhlIGRlZmF1bHQgaW50ZXJwcmV0ZXIgb3B0aW9uczpcclxuICAgKlxyXG4gICAqIC0gYGNsb2NrYCB1c2VzIHRoZSBnbG9iYWwgYHNldFRpbWVvdXRgIGFuZCBgY2xlYXJUaW1lb3V0YCBmdW5jdGlvbnNcclxuICAgKiAtIGBsb2dnZXJgIHVzZXMgdGhlIGdsb2JhbCBgY29uc29sZS5sb2coKWAgbWV0aG9kXHJcbiAgICovXG5cblxuICBJbnRlcnByZXRlci5kZWZhdWx0T3B0aW9ucyA9IC8qI19fUFVSRV9fKi9mdW5jdGlvbiAoZ2xvYmFsKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIGV4ZWN1dGU6IHRydWUsXG4gICAgICBkZWZlckV2ZW50czogdHJ1ZSxcbiAgICAgIGNsb2NrOiB7XG4gICAgICAgIHNldFRpbWVvdXQ6IGZ1bmN0aW9uIChmbiwgbXMpIHtcbiAgICAgICAgICByZXR1cm4gc2V0VGltZW91dChmbiwgbXMpO1xuICAgICAgICB9LFxuICAgICAgICBjbGVhclRpbWVvdXQ6IGZ1bmN0aW9uIChpZCkge1xuICAgICAgICAgIHJldHVybiBjbGVhclRpbWVvdXQoaWQpO1xuICAgICAgICB9XG4gICAgICB9LFxuICAgICAgbG9nZ2VyOiBnbG9iYWwuY29uc29sZS5sb2cuYmluZChjb25zb2xlKSxcbiAgICAgIGRldlRvb2xzOiBmYWxzZVxuICAgIH07XG4gIH0odHlwZW9mIHNlbGYgIT09ICd1bmRlZmluZWQnID8gc2VsZiA6IGdsb2JhbCk7XG5cbiAgSW50ZXJwcmV0ZXIuaW50ZXJwcmV0ID0gaW50ZXJwcmV0O1xuICByZXR1cm4gSW50ZXJwcmV0ZXI7XG59KCk7XG5cbnZhciByZXNvbHZlU3Bhd25PcHRpb25zID0gZnVuY3Rpb24gKG5hbWVPck9wdGlvbnMpIHtcbiAgaWYgKGlzU3RyaW5nKG5hbWVPck9wdGlvbnMpKSB7XG4gICAgcmV0dXJuIF9fYXNzaWduKF9fYXNzaWduKHt9LCBERUZBVUxUX1NQQVdOX09QVElPTlMpLCB7XG4gICAgICBuYW1lOiBuYW1lT3JPcHRpb25zXG4gICAgfSk7XG4gIH1cblxuICByZXR1cm4gX19hc3NpZ24oX19hc3NpZ24oX19hc3NpZ24oe30sIERFRkFVTFRfU1BBV05fT1BUSU9OUyksIHtcbiAgICBuYW1lOiB1bmlxdWVJZCgpXG4gIH0pLCBuYW1lT3JPcHRpb25zKTtcbn07XG5cbmZ1bmN0aW9uIHNwYXduKGVudGl0eSwgbmFtZU9yT3B0aW9ucykge1xuICB2YXIgcmVzb2x2ZWRPcHRpb25zID0gcmVzb2x2ZVNwYXduT3B0aW9ucyhuYW1lT3JPcHRpb25zKTtcbiAgcmV0dXJuIGNvbnN1bWUoZnVuY3Rpb24gKHNlcnZpY2UpIHtcbiAgICBpZiAoIUlTX1BST0RVQ1RJT04pIHtcbiAgICAgIHZhciBpc0xhenlFbnRpdHkgPSBpc01hY2hpbmUoZW50aXR5KSB8fCBpc0Z1bmN0aW9uKGVudGl0eSk7XG4gICAgICB3YXJuKCEhc2VydmljZSB8fCBpc0xhenlFbnRpdHksIFwiQXR0ZW1wdGVkIHRvIHNwYXduIGFuIEFjdG9yIChJRDogXFxcIlwiICsgKGlzTWFjaGluZShlbnRpdHkpID8gZW50aXR5LmlkIDogJ3VuZGVmaW5lZCcpICsgXCJcXFwiKSBvdXRzaWRlIG9mIGEgc2VydmljZS4gVGhpcyB3aWxsIGhhdmUgbm8gZWZmZWN0LlwiKTtcbiAgICB9XG5cbiAgICBpZiAoc2VydmljZSkge1xuICAgICAgcmV0dXJuIHNlcnZpY2Uuc3Bhd24oZW50aXR5LCByZXNvbHZlZE9wdGlvbnMubmFtZSwgcmVzb2x2ZWRPcHRpb25zKTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIGNyZWF0ZURlZmVycmVkQWN0b3IoZW50aXR5LCByZXNvbHZlZE9wdGlvbnMubmFtZSk7XG4gICAgfVxuICB9KTtcbn1cbi8qKlxyXG4gKiBDcmVhdGVzIGEgbmV3IEludGVycHJldGVyIGluc3RhbmNlIGZvciB0aGUgZ2l2ZW4gbWFjaGluZSB3aXRoIHRoZSBwcm92aWRlZCBvcHRpb25zLCBpZiBhbnkuXHJcbiAqXHJcbiAqIEBwYXJhbSBtYWNoaW5lIFRoZSBtYWNoaW5lIHRvIGludGVycHJldFxyXG4gKiBAcGFyYW0gb3B0aW9ucyBJbnRlcnByZXRlciBvcHRpb25zXHJcbiAqL1xuXG5cbmZ1bmN0aW9uIGludGVycHJldChtYWNoaW5lLCBvcHRpb25zKSB7XG4gIHZhciBpbnRlcnByZXRlciA9IG5ldyBJbnRlcnByZXRlcihtYWNoaW5lLCBvcHRpb25zKTtcbiAgcmV0dXJuIGludGVycHJldGVyO1xufVxuXG5leHBvcnQgeyBJbnRlcnByZXRlciwgSW50ZXJwcmV0ZXJTdGF0dXMsIGludGVycHJldCwgc3Bhd24gfTsiLCJpbXBvcnQgeyBfX3ZhbHVlcywgX19yZWFkIH0gZnJvbSAnLi9fdmlydHVhbC9fdHNsaWIuanMnO1xuaW1wb3J0IHsgU3RhdGUgfSBmcm9tICcuL1N0YXRlLmpzJztcblxuZnVuY3Rpb24gbWF0Y2hTdGF0ZShzdGF0ZSwgcGF0dGVybnMsIGRlZmF1bHRWYWx1ZSkge1xuICB2YXIgZV8xLCBfYTtcblxuICB2YXIgcmVzb2x2ZWRTdGF0ZSA9IFN0YXRlLmZyb20oc3RhdGUsIHN0YXRlIGluc3RhbmNlb2YgU3RhdGUgPyBzdGF0ZS5jb250ZXh0IDogdW5kZWZpbmVkKTtcblxuICB0cnkge1xuICAgIGZvciAodmFyIHBhdHRlcm5zXzEgPSBfX3ZhbHVlcyhwYXR0ZXJucyksIHBhdHRlcm5zXzFfMSA9IHBhdHRlcm5zXzEubmV4dCgpOyAhcGF0dGVybnNfMV8xLmRvbmU7IHBhdHRlcm5zXzFfMSA9IHBhdHRlcm5zXzEubmV4dCgpKSB7XG4gICAgICB2YXIgX2IgPSBfX3JlYWQocGF0dGVybnNfMV8xLnZhbHVlLCAyKSxcbiAgICAgICAgICBzdGF0ZVZhbHVlID0gX2JbMF0sXG4gICAgICAgICAgZ2V0VmFsdWUgPSBfYlsxXTtcblxuICAgICAgaWYgKHJlc29sdmVkU3RhdGUubWF0Y2hlcyhzdGF0ZVZhbHVlKSkge1xuICAgICAgICByZXR1cm4gZ2V0VmFsdWUocmVzb2x2ZWRTdGF0ZSk7XG4gICAgICB9XG4gICAgfVxuICB9IGNhdGNoIChlXzFfMSkge1xuICAgIGVfMSA9IHtcbiAgICAgIGVycm9yOiBlXzFfMVxuICAgIH07XG4gIH0gZmluYWxseSB7XG4gICAgdHJ5IHtcbiAgICAgIGlmIChwYXR0ZXJuc18xXzEgJiYgIXBhdHRlcm5zXzFfMS5kb25lICYmIChfYSA9IHBhdHRlcm5zXzEucmV0dXJuKSkgX2EuY2FsbChwYXR0ZXJuc18xKTtcbiAgICB9IGZpbmFsbHkge1xuICAgICAgaWYgKGVfMSkgdGhyb3cgZV8xLmVycm9yO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiBkZWZhdWx0VmFsdWUocmVzb2x2ZWRTdGF0ZSk7XG59XG5cbmV4cG9ydCB7IG1hdGNoU3RhdGUgfTsiLCJleHBvcnQgeyBtYXRjaGVzU3RhdGUgfSBmcm9tICcuL3V0aWxzLmpzJztcbmV4cG9ydCB7IG1hcFN0YXRlIH0gZnJvbSAnLi9tYXBTdGF0ZS5qcyc7XG5leHBvcnQgeyBBY3Rpb25UeXBlcywgU3BlY2lhbFRhcmdldHMgfSBmcm9tICcuL3R5cGVzLmpzJztcbmltcG9ydCB7IHJhaXNlLCBzZW5kLCBzZW5kUGFyZW50LCBzZW5kVXBkYXRlLCBsb2csIGNhbmNlbCwgc3RhcnQsIHN0b3AsIGFzc2lnbiwgYWZ0ZXIsIGRvbmUsIHJlc3BvbmQsIGZvcndhcmRUbywgZXNjYWxhdGUsIGNob29zZSwgcHVyZSB9IGZyb20gJy4vYWN0aW9ucy5qcyc7XG5leHBvcnQgeyBhc3NpZ24sIGRvbmVJbnZva2UsIGZvcndhcmRUbywgc2VuZCwgc2VuZFBhcmVudCwgc2VuZFVwZGF0ZSB9IGZyb20gJy4vYWN0aW9ucy5qcyc7XG5leHBvcnQgeyBTdGF0ZSB9IGZyb20gJy4vU3RhdGUuanMnO1xuZXhwb3J0IHsgU3RhdGVOb2RlIH0gZnJvbSAnLi9TdGF0ZU5vZGUuanMnO1xuZXhwb3J0IHsgTWFjaGluZSwgY3JlYXRlTWFjaGluZSB9IGZyb20gJy4vTWFjaGluZS5qcyc7XG5leHBvcnQgeyBJbnRlcnByZXRlciwgSW50ZXJwcmV0ZXJTdGF0dXMsIGludGVycHJldCwgc3Bhd24gfSBmcm9tICcuL2ludGVycHJldGVyLmpzJztcbmV4cG9ydCB7IG1hdGNoU3RhdGUgfSBmcm9tICcuL21hdGNoLmpzJztcbnZhciBhY3Rpb25zID0ge1xuICByYWlzZTogcmFpc2UsXG4gIHNlbmQ6IHNlbmQsXG4gIHNlbmRQYXJlbnQ6IHNlbmRQYXJlbnQsXG4gIHNlbmRVcGRhdGU6IHNlbmRVcGRhdGUsXG4gIGxvZzogbG9nLFxuICBjYW5jZWw6IGNhbmNlbCxcbiAgc3RhcnQ6IHN0YXJ0LFxuICBzdG9wOiBzdG9wLFxuICBhc3NpZ246IGFzc2lnbixcbiAgYWZ0ZXI6IGFmdGVyLFxuICBkb25lOiBkb25lLFxuICByZXNwb25kOiByZXNwb25kLFxuICBmb3J3YXJkVG86IGZvcndhcmRUbyxcbiAgZXNjYWxhdGU6IGVzY2FsYXRlLFxuICBjaG9vc2U6IGNob29zZSxcbiAgcHVyZTogcHVyZVxufTtcbmV4cG9ydCB7IGFjdGlvbnMgfTsiXSwibmFtZXMiOlsicmFpc2UiLCJzZW5kIiwicmFpc2UkMSIsInNlbmQkMSIsImxvZyIsImxvZyQxIiwiY2FuY2VsIiwiY2FuY2VsJDEiLCJzdGFydCIsInN0b3AiLCJhc3NpZ24iLCJhc3NpZ24kMSIsImFmdGVyIiwiZXJyb3IiLCJwdXJlIiwiZXJyb3IkMSIsImNob29zZSIsImNob29zZSQxIiwicHVyZSQxIiwic3RvcCQxIiwiaXNBY3RvciIsInRvSW52b2tlU291cmNlIiwic3RhcnQkMSJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7TUFBQTtNQUNBO0FBQ0E7TUFDQTtNQUNB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
