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
        var m = typeof Symbol === "function" && o[Symbol.iterator],
            i = 0;
        if (m) return m.call(o);
        return {
          next: function () {
            if (o && i >= o.length) o = void 0;
            return {
              value: o && o[i++],
              done: !o
            };
          }
        };
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

      function isActor(item) {
        try {
          return typeof item.send === 'function';
        } catch (e) {
          return false;
        }
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

          maybeNextState.historyValue = nextState.historyValue;
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

      function getDevTools() {
        var w = window;

        if (!!w.__xstate__) {
          return w.__xstate__;
        }

        return undefined;
      }

      function registerService(service) {
        if (IS_PRODUCTION || typeof window === 'undefined') {
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
            var target = isParent ? _this.parent : isActor(to) ? to : _this.children.get(to) || registry.get(to);

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
                  }
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
          } else if (isActor(entity)) {
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
              var unsubscribed = false;
              promise.then(function (response) {
                if (unsubscribed) {
                  return;
                }

                next && next(response);

                if (unsubscribed) {
                  return;
                }

                complete && complete();
              }, function (err) {
                if (unsubscribed) {
                  return;
                }

                handleError(err);
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

            _this.send(e);
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
          if (this.options.devTools && typeof window !== 'undefined') {
            if (window.__REDUX_DEVTOOLS_EXTENSION__) {
              var devToolsOptions = typeof this.options.devTools === 'object' ? this.options.devTools : undefined;
              this.devTools = window.__REDUX_DEVTOOLS_EXTENSION__.connect(__assign(__assign({
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
                return global.setTimeout.call(null, fn, ms);
              },
              clearTimeout: function (id) {
                return global.clearTimeout.call(null, id);
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL25vZGVfbW9kdWxlcy94c3RhdGUvZXMvX3ZpcnR1YWwvX3RzbGliLmpzIiwiLi4vLi4vLi4vLi4vLi4vbm9kZV9tb2R1bGVzL3hzdGF0ZS9lcy9jb25zdGFudHMuanMiLCIuLi8uLi8uLi8uLi8uLi9ub2RlX21vZHVsZXMveHN0YXRlL2VzL2Vudmlyb25tZW50LmpzIiwiLi4vLi4vLi4vLi4vLi4vbm9kZV9tb2R1bGVzL3hzdGF0ZS9lcy91dGlscy5qcyIsIi4uLy4uLy4uLy4uLy4uL25vZGVfbW9kdWxlcy94c3RhdGUvZXMvbWFwU3RhdGUuanMiLCIuLi8uLi8uLi8uLi8uLi9ub2RlX21vZHVsZXMveHN0YXRlL2VzL3R5cGVzLmpzIiwiLi4vLi4vLi4vLi4vLi4vbm9kZV9tb2R1bGVzL3hzdGF0ZS9lcy9hY3Rpb25UeXBlcy5qcyIsIi4uLy4uLy4uLy4uLy4uL25vZGVfbW9kdWxlcy94c3RhdGUvZXMvYWN0aW9ucy5qcyIsIi4uLy4uLy4uLy4uLy4uL25vZGVfbW9kdWxlcy94c3RhdGUvZXMvc3RhdGVVdGlscy5qcyIsIi4uLy4uLy4uLy4uLy4uL25vZGVfbW9kdWxlcy94c3RhdGUvZXMvU3RhdGUuanMiLCIuLi8uLi8uLi8uLi8uLi9ub2RlX21vZHVsZXMveHN0YXRlL2VzL3NlcnZpY2VTY29wZS5qcyIsIi4uLy4uLy4uLy4uLy4uL25vZGVfbW9kdWxlcy94c3RhdGUvZXMvQWN0b3IuanMiLCIuLi8uLi8uLi8uLi8uLi9ub2RlX21vZHVsZXMveHN0YXRlL2VzL2ludm9rZVV0aWxzLmpzIiwiLi4vLi4vLi4vLi4vLi4vbm9kZV9tb2R1bGVzL3hzdGF0ZS9lcy9TdGF0ZU5vZGUuanMiLCIuLi8uLi8uLi8uLi8uLi9ub2RlX21vZHVsZXMveHN0YXRlL2VzL01hY2hpbmUuanMiLCIuLi8uLi8uLi8uLi8uLi9ub2RlX21vZHVsZXMveHN0YXRlL2VzL3NjaGVkdWxlci5qcyIsIi4uLy4uLy4uLy4uLy4uL25vZGVfbW9kdWxlcy94c3RhdGUvZXMvcmVnaXN0cnkuanMiLCIuLi8uLi8uLi8uLi8uLi9ub2RlX21vZHVsZXMveHN0YXRlL2VzL2RldlRvb2xzLmpzIiwiLi4vLi4vLi4vLi4vLi4vbm9kZV9tb2R1bGVzL3hzdGF0ZS9lcy9pbnRlcnByZXRlci5qcyIsIi4uLy4uLy4uLy4uLy4uL25vZGVfbW9kdWxlcy94c3RhdGUvZXMvbWF0Y2guanMiLCIuLi8uLi8uLi8uLi8uLi9ub2RlX21vZHVsZXMveHN0YXRlL2VzL2luZGV4LmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8qISAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxyXG5Db3B5cmlnaHQgKGMpIE1pY3Jvc29mdCBDb3Jwb3JhdGlvbi4gQWxsIHJpZ2h0cyByZXNlcnZlZC5cclxuTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTsgeW91IG1heSBub3QgdXNlXHJcbnRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLiBZb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlXHJcbkxpY2Vuc2UgYXQgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXHJcblxyXG5USElTIENPREUgSVMgUFJPVklERUQgT04gQU4gKkFTIElTKiBCQVNJUywgV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZXHJcbktJTkQsIEVJVEhFUiBFWFBSRVNTIE9SIElNUExJRUQsIElOQ0xVRElORyBXSVRIT1VUIExJTUlUQVRJT04gQU5ZIElNUExJRURcclxuV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIFRJVExFLCBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRSxcclxuTUVSQ0hBTlRBQkxJVFkgT1IgTk9OLUlORlJJTkdFTUVOVC5cclxuXHJcblNlZSB0aGUgQXBhY2hlIFZlcnNpb24gMi4wIExpY2Vuc2UgZm9yIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9uc1xyXG5hbmQgbGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXHJcbioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqICovXG52YXIgX19hc3NpZ24gPSBmdW5jdGlvbiAoKSB7XG4gIF9fYXNzaWduID0gT2JqZWN0LmFzc2lnbiB8fCBmdW5jdGlvbiBfX2Fzc2lnbih0KSB7XG4gICAgZm9yICh2YXIgcywgaSA9IDEsIG4gPSBhcmd1bWVudHMubGVuZ3RoOyBpIDwgbjsgaSsrKSB7XG4gICAgICBzID0gYXJndW1lbnRzW2ldO1xuXG4gICAgICBmb3IgKHZhciBwIGluIHMpIGlmIChPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwocywgcCkpIHRbcF0gPSBzW3BdO1xuICAgIH1cblxuICAgIHJldHVybiB0O1xuICB9O1xuXG4gIHJldHVybiBfX2Fzc2lnbi5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xufTtcblxuZnVuY3Rpb24gX19yZXN0KHMsIGUpIHtcbiAgdmFyIHQgPSB7fTtcblxuICBmb3IgKHZhciBwIGluIHMpIGlmIChPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwocywgcCkgJiYgZS5pbmRleE9mKHApIDwgMCkgdFtwXSA9IHNbcF07XG5cbiAgaWYgKHMgIT0gbnVsbCAmJiB0eXBlb2YgT2JqZWN0LmdldE93blByb3BlcnR5U3ltYm9scyA9PT0gXCJmdW5jdGlvblwiKSBmb3IgKHZhciBpID0gMCwgcCA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eVN5bWJvbHMocyk7IGkgPCBwLmxlbmd0aDsgaSsrKSB7XG4gICAgaWYgKGUuaW5kZXhPZihwW2ldKSA8IDAgJiYgT2JqZWN0LnByb3RvdHlwZS5wcm9wZXJ0eUlzRW51bWVyYWJsZS5jYWxsKHMsIHBbaV0pKSB0W3BbaV1dID0gc1twW2ldXTtcbiAgfVxuICByZXR1cm4gdDtcbn1cblxuZnVuY3Rpb24gX192YWx1ZXMobykge1xuICB2YXIgbSA9IHR5cGVvZiBTeW1ib2wgPT09IFwiZnVuY3Rpb25cIiAmJiBvW1N5bWJvbC5pdGVyYXRvcl0sXG4gICAgICBpID0gMDtcbiAgaWYgKG0pIHJldHVybiBtLmNhbGwobyk7XG4gIHJldHVybiB7XG4gICAgbmV4dDogZnVuY3Rpb24gKCkge1xuICAgICAgaWYgKG8gJiYgaSA+PSBvLmxlbmd0aCkgbyA9IHZvaWQgMDtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIHZhbHVlOiBvICYmIG9baSsrXSxcbiAgICAgICAgZG9uZTogIW9cbiAgICAgIH07XG4gICAgfVxuICB9O1xufVxuXG5mdW5jdGlvbiBfX3JlYWQobywgbikge1xuICB2YXIgbSA9IHR5cGVvZiBTeW1ib2wgPT09IFwiZnVuY3Rpb25cIiAmJiBvW1N5bWJvbC5pdGVyYXRvcl07XG4gIGlmICghbSkgcmV0dXJuIG87XG4gIHZhciBpID0gbS5jYWxsKG8pLFxuICAgICAgcixcbiAgICAgIGFyID0gW10sXG4gICAgICBlO1xuXG4gIHRyeSB7XG4gICAgd2hpbGUgKChuID09PSB2b2lkIDAgfHwgbi0tID4gMCkgJiYgIShyID0gaS5uZXh0KCkpLmRvbmUpIGFyLnB1c2goci52YWx1ZSk7XG4gIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgZSA9IHtcbiAgICAgIGVycm9yOiBlcnJvclxuICAgIH07XG4gIH0gZmluYWxseSB7XG4gICAgdHJ5IHtcbiAgICAgIGlmIChyICYmICFyLmRvbmUgJiYgKG0gPSBpW1wicmV0dXJuXCJdKSkgbS5jYWxsKGkpO1xuICAgIH0gZmluYWxseSB7XG4gICAgICBpZiAoZSkgdGhyb3cgZS5lcnJvcjtcbiAgICB9XG4gIH1cblxuICByZXR1cm4gYXI7XG59XG5cbmZ1bmN0aW9uIF9fc3ByZWFkKCkge1xuICBmb3IgKHZhciBhciA9IFtdLCBpID0gMDsgaSA8IGFyZ3VtZW50cy5sZW5ndGg7IGkrKykgYXIgPSBhci5jb25jYXQoX19yZWFkKGFyZ3VtZW50c1tpXSkpO1xuXG4gIHJldHVybiBhcjtcbn1cblxuZXhwb3J0IHsgX19hc3NpZ24sIF9fcmVhZCwgX19yZXN0LCBfX3NwcmVhZCwgX192YWx1ZXMgfTsiLCJ2YXIgU1RBVEVfREVMSU1JVEVSID0gJy4nO1xudmFyIEVNUFRZX0FDVElWSVRZX01BUCA9IHt9O1xudmFyIERFRkFVTFRfR1VBUkRfVFlQRSA9ICd4c3RhdGUuZ3VhcmQnO1xudmFyIFRBUkdFVExFU1NfS0VZID0gJyc7XG5leHBvcnQgeyBERUZBVUxUX0dVQVJEX1RZUEUsIEVNUFRZX0FDVElWSVRZX01BUCwgU1RBVEVfREVMSU1JVEVSLCBUQVJHRVRMRVNTX0tFWSB9OyIsInZhciBJU19QUk9EVUNUSU9OID0gcHJvY2Vzcy5lbnYuTk9ERV9FTlYgPT09ICdwcm9kdWN0aW9uJztcbmV4cG9ydCB7IElTX1BST0RVQ1RJT04gfTsiLCJpbXBvcnQgeyBfX3NwcmVhZCwgX192YWx1ZXMsIF9fcmVhZCwgX19hc3NpZ24gfSBmcm9tICcuL192aXJ0dWFsL190c2xpYi5qcyc7XG5pbXBvcnQgeyBERUZBVUxUX0dVQVJEX1RZUEUsIFRBUkdFVExFU1NfS0VZLCBTVEFURV9ERUxJTUlURVIgfSBmcm9tICcuL2NvbnN0YW50cy5qcyc7XG5pbXBvcnQgeyBJU19QUk9EVUNUSU9OIH0gZnJvbSAnLi9lbnZpcm9ubWVudC5qcyc7XG5cbmZ1bmN0aW9uIGtleXModmFsdWUpIHtcbiAgcmV0dXJuIE9iamVjdC5rZXlzKHZhbHVlKTtcbn1cblxuZnVuY3Rpb24gbWF0Y2hlc1N0YXRlKHBhcmVudFN0YXRlSWQsIGNoaWxkU3RhdGVJZCwgZGVsaW1pdGVyKSB7XG4gIGlmIChkZWxpbWl0ZXIgPT09IHZvaWQgMCkge1xuICAgIGRlbGltaXRlciA9IFNUQVRFX0RFTElNSVRFUjtcbiAgfVxuXG4gIHZhciBwYXJlbnRTdGF0ZVZhbHVlID0gdG9TdGF0ZVZhbHVlKHBhcmVudFN0YXRlSWQsIGRlbGltaXRlcik7XG4gIHZhciBjaGlsZFN0YXRlVmFsdWUgPSB0b1N0YXRlVmFsdWUoY2hpbGRTdGF0ZUlkLCBkZWxpbWl0ZXIpO1xuXG4gIGlmIChpc1N0cmluZyhjaGlsZFN0YXRlVmFsdWUpKSB7XG4gICAgaWYgKGlzU3RyaW5nKHBhcmVudFN0YXRlVmFsdWUpKSB7XG4gICAgICByZXR1cm4gY2hpbGRTdGF0ZVZhbHVlID09PSBwYXJlbnRTdGF0ZVZhbHVlO1xuICAgIH0gLy8gUGFyZW50IG1vcmUgc3BlY2lmaWMgdGhhbiBjaGlsZFxuXG5cbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICBpZiAoaXNTdHJpbmcocGFyZW50U3RhdGVWYWx1ZSkpIHtcbiAgICByZXR1cm4gcGFyZW50U3RhdGVWYWx1ZSBpbiBjaGlsZFN0YXRlVmFsdWU7XG4gIH1cblxuICByZXR1cm4ga2V5cyhwYXJlbnRTdGF0ZVZhbHVlKS5ldmVyeShmdW5jdGlvbiAoa2V5KSB7XG4gICAgaWYgKCEoa2V5IGluIGNoaWxkU3RhdGVWYWx1ZSkpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICByZXR1cm4gbWF0Y2hlc1N0YXRlKHBhcmVudFN0YXRlVmFsdWVba2V5XSwgY2hpbGRTdGF0ZVZhbHVlW2tleV0pO1xuICB9KTtcbn1cblxuZnVuY3Rpb24gZ2V0RXZlbnRUeXBlKGV2ZW50KSB7XG4gIHRyeSB7XG4gICAgcmV0dXJuIGlzU3RyaW5nKGV2ZW50KSB8fCB0eXBlb2YgZXZlbnQgPT09ICdudW1iZXInID8gXCJcIiArIGV2ZW50IDogZXZlbnQudHlwZTtcbiAgfSBjYXRjaCAoZSkge1xuICAgIHRocm93IG5ldyBFcnJvcignRXZlbnRzIG11c3QgYmUgc3RyaW5ncyBvciBvYmplY3RzIHdpdGggYSBzdHJpbmcgZXZlbnQudHlwZSBwcm9wZXJ0eS4nKTtcbiAgfVxufVxuXG5mdW5jdGlvbiB0b1N0YXRlUGF0aChzdGF0ZUlkLCBkZWxpbWl0ZXIpIHtcbiAgdHJ5IHtcbiAgICBpZiAoaXNBcnJheShzdGF0ZUlkKSkge1xuICAgICAgcmV0dXJuIHN0YXRlSWQ7XG4gICAgfVxuXG4gICAgcmV0dXJuIHN0YXRlSWQudG9TdHJpbmcoKS5zcGxpdChkZWxpbWl0ZXIpO1xuICB9IGNhdGNoIChlKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKFwiJ1wiICsgc3RhdGVJZCArIFwiJyBpcyBub3QgYSB2YWxpZCBzdGF0ZSBwYXRoLlwiKTtcbiAgfVxufVxuXG5mdW5jdGlvbiBpc1N0YXRlTGlrZShzdGF0ZSkge1xuICByZXR1cm4gdHlwZW9mIHN0YXRlID09PSAnb2JqZWN0JyAmJiAndmFsdWUnIGluIHN0YXRlICYmICdjb250ZXh0JyBpbiBzdGF0ZSAmJiAnZXZlbnQnIGluIHN0YXRlICYmICdfZXZlbnQnIGluIHN0YXRlO1xufVxuXG5mdW5jdGlvbiB0b1N0YXRlVmFsdWUoc3RhdGVWYWx1ZSwgZGVsaW1pdGVyKSB7XG4gIGlmIChpc1N0YXRlTGlrZShzdGF0ZVZhbHVlKSkge1xuICAgIHJldHVybiBzdGF0ZVZhbHVlLnZhbHVlO1xuICB9XG5cbiAgaWYgKGlzQXJyYXkoc3RhdGVWYWx1ZSkpIHtcbiAgICByZXR1cm4gcGF0aFRvU3RhdGVWYWx1ZShzdGF0ZVZhbHVlKTtcbiAgfVxuXG4gIGlmICh0eXBlb2Ygc3RhdGVWYWx1ZSAhPT0gJ3N0cmluZycpIHtcbiAgICByZXR1cm4gc3RhdGVWYWx1ZTtcbiAgfVxuXG4gIHZhciBzdGF0ZVBhdGggPSB0b1N0YXRlUGF0aChzdGF0ZVZhbHVlLCBkZWxpbWl0ZXIpO1xuICByZXR1cm4gcGF0aFRvU3RhdGVWYWx1ZShzdGF0ZVBhdGgpO1xufVxuXG5mdW5jdGlvbiBwYXRoVG9TdGF0ZVZhbHVlKHN0YXRlUGF0aCkge1xuICBpZiAoc3RhdGVQYXRoLmxlbmd0aCA9PT0gMSkge1xuICAgIHJldHVybiBzdGF0ZVBhdGhbMF07XG4gIH1cblxuICB2YXIgdmFsdWUgPSB7fTtcbiAgdmFyIG1hcmtlciA9IHZhbHVlO1xuXG4gIGZvciAodmFyIGkgPSAwOyBpIDwgc3RhdGVQYXRoLmxlbmd0aCAtIDE7IGkrKykge1xuICAgIGlmIChpID09PSBzdGF0ZVBhdGgubGVuZ3RoIC0gMikge1xuICAgICAgbWFya2VyW3N0YXRlUGF0aFtpXV0gPSBzdGF0ZVBhdGhbaSArIDFdO1xuICAgIH0gZWxzZSB7XG4gICAgICBtYXJrZXJbc3RhdGVQYXRoW2ldXSA9IHt9O1xuICAgICAgbWFya2VyID0gbWFya2VyW3N0YXRlUGF0aFtpXV07XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIHZhbHVlO1xufVxuXG5mdW5jdGlvbiBtYXBWYWx1ZXMoY29sbGVjdGlvbiwgaXRlcmF0ZWUpIHtcbiAgdmFyIHJlc3VsdCA9IHt9O1xuICB2YXIgY29sbGVjdGlvbktleXMgPSBrZXlzKGNvbGxlY3Rpb24pO1xuXG4gIGZvciAodmFyIGkgPSAwOyBpIDwgY29sbGVjdGlvbktleXMubGVuZ3RoOyBpKyspIHtcbiAgICB2YXIga2V5ID0gY29sbGVjdGlvbktleXNbaV07XG4gICAgcmVzdWx0W2tleV0gPSBpdGVyYXRlZShjb2xsZWN0aW9uW2tleV0sIGtleSwgY29sbGVjdGlvbiwgaSk7XG4gIH1cblxuICByZXR1cm4gcmVzdWx0O1xufVxuXG5mdW5jdGlvbiBtYXBGaWx0ZXJWYWx1ZXMoY29sbGVjdGlvbiwgaXRlcmF0ZWUsIHByZWRpY2F0ZSkge1xuICB2YXIgZV8xLCBfYTtcblxuICB2YXIgcmVzdWx0ID0ge307XG5cbiAgdHJ5IHtcbiAgICBmb3IgKHZhciBfYiA9IF9fdmFsdWVzKGtleXMoY29sbGVjdGlvbikpLCBfYyA9IF9iLm5leHQoKTsgIV9jLmRvbmU7IF9jID0gX2IubmV4dCgpKSB7XG4gICAgICB2YXIga2V5ID0gX2MudmFsdWU7XG4gICAgICB2YXIgaXRlbSA9IGNvbGxlY3Rpb25ba2V5XTtcblxuICAgICAgaWYgKCFwcmVkaWNhdGUoaXRlbSkpIHtcbiAgICAgICAgY29udGludWU7XG4gICAgICB9XG5cbiAgICAgIHJlc3VsdFtrZXldID0gaXRlcmF0ZWUoaXRlbSwga2V5LCBjb2xsZWN0aW9uKTtcbiAgICB9XG4gIH0gY2F0Y2ggKGVfMV8xKSB7XG4gICAgZV8xID0ge1xuICAgICAgZXJyb3I6IGVfMV8xXG4gICAgfTtcbiAgfSBmaW5hbGx5IHtcbiAgICB0cnkge1xuICAgICAgaWYgKF9jICYmICFfYy5kb25lICYmIChfYSA9IF9iLnJldHVybikpIF9hLmNhbGwoX2IpO1xuICAgIH0gZmluYWxseSB7XG4gICAgICBpZiAoZV8xKSB0aHJvdyBlXzEuZXJyb3I7XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIHJlc3VsdDtcbn1cbi8qKlxyXG4gKiBSZXRyaWV2ZXMgYSB2YWx1ZSBhdCB0aGUgZ2l2ZW4gcGF0aC5cclxuICogQHBhcmFtIHByb3BzIFRoZSBkZWVwIHBhdGggdG8gdGhlIHByb3Agb2YgdGhlIGRlc2lyZWQgdmFsdWVcclxuICovXG5cblxudmFyIHBhdGggPSBmdW5jdGlvbiAocHJvcHMpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uIChvYmplY3QpIHtcbiAgICB2YXIgZV8yLCBfYTtcblxuICAgIHZhciByZXN1bHQgPSBvYmplY3Q7XG5cbiAgICB0cnkge1xuICAgICAgZm9yICh2YXIgcHJvcHNfMSA9IF9fdmFsdWVzKHByb3BzKSwgcHJvcHNfMV8xID0gcHJvcHNfMS5uZXh0KCk7ICFwcm9wc18xXzEuZG9uZTsgcHJvcHNfMV8xID0gcHJvcHNfMS5uZXh0KCkpIHtcbiAgICAgICAgdmFyIHByb3AgPSBwcm9wc18xXzEudmFsdWU7XG4gICAgICAgIHJlc3VsdCA9IHJlc3VsdFtwcm9wXTtcbiAgICAgIH1cbiAgICB9IGNhdGNoIChlXzJfMSkge1xuICAgICAgZV8yID0ge1xuICAgICAgICBlcnJvcjogZV8yXzFcbiAgICAgIH07XG4gICAgfSBmaW5hbGx5IHtcbiAgICAgIHRyeSB7XG4gICAgICAgIGlmIChwcm9wc18xXzEgJiYgIXByb3BzXzFfMS5kb25lICYmIChfYSA9IHByb3BzXzEucmV0dXJuKSkgX2EuY2FsbChwcm9wc18xKTtcbiAgICAgIH0gZmluYWxseSB7XG4gICAgICAgIGlmIChlXzIpIHRocm93IGVfMi5lcnJvcjtcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gcmVzdWx0O1xuICB9O1xufTtcbi8qKlxyXG4gKiBSZXRyaWV2ZXMgYSB2YWx1ZSBhdCB0aGUgZ2l2ZW4gcGF0aCB2aWEgdGhlIG5lc3RlZCBhY2Nlc3NvciBwcm9wLlxyXG4gKiBAcGFyYW0gcHJvcHMgVGhlIGRlZXAgcGF0aCB0byB0aGUgcHJvcCBvZiB0aGUgZGVzaXJlZCB2YWx1ZVxyXG4gKi9cblxuXG5mdW5jdGlvbiBuZXN0ZWRQYXRoKHByb3BzLCBhY2Nlc3NvclByb3ApIHtcbiAgcmV0dXJuIGZ1bmN0aW9uIChvYmplY3QpIHtcbiAgICB2YXIgZV8zLCBfYTtcblxuICAgIHZhciByZXN1bHQgPSBvYmplY3Q7XG5cbiAgICB0cnkge1xuICAgICAgZm9yICh2YXIgcHJvcHNfMiA9IF9fdmFsdWVzKHByb3BzKSwgcHJvcHNfMl8xID0gcHJvcHNfMi5uZXh0KCk7ICFwcm9wc18yXzEuZG9uZTsgcHJvcHNfMl8xID0gcHJvcHNfMi5uZXh0KCkpIHtcbiAgICAgICAgdmFyIHByb3AgPSBwcm9wc18yXzEudmFsdWU7XG4gICAgICAgIHJlc3VsdCA9IHJlc3VsdFthY2Nlc3NvclByb3BdW3Byb3BdO1xuICAgICAgfVxuICAgIH0gY2F0Y2ggKGVfM18xKSB7XG4gICAgICBlXzMgPSB7XG4gICAgICAgIGVycm9yOiBlXzNfMVxuICAgICAgfTtcbiAgICB9IGZpbmFsbHkge1xuICAgICAgdHJ5IHtcbiAgICAgICAgaWYgKHByb3BzXzJfMSAmJiAhcHJvcHNfMl8xLmRvbmUgJiYgKF9hID0gcHJvcHNfMi5yZXR1cm4pKSBfYS5jYWxsKHByb3BzXzIpO1xuICAgICAgfSBmaW5hbGx5IHtcbiAgICAgICAgaWYgKGVfMykgdGhyb3cgZV8zLmVycm9yO1xuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiByZXN1bHQ7XG4gIH07XG59XG5cbmZ1bmN0aW9uIHRvU3RhdGVQYXRocyhzdGF0ZVZhbHVlKSB7XG4gIGlmICghc3RhdGVWYWx1ZSkge1xuICAgIHJldHVybiBbW11dO1xuICB9XG5cbiAgaWYgKGlzU3RyaW5nKHN0YXRlVmFsdWUpKSB7XG4gICAgcmV0dXJuIFtbc3RhdGVWYWx1ZV1dO1xuICB9XG5cbiAgdmFyIHJlc3VsdCA9IGZsYXR0ZW4oa2V5cyhzdGF0ZVZhbHVlKS5tYXAoZnVuY3Rpb24gKGtleSkge1xuICAgIHZhciBzdWJTdGF0ZVZhbHVlID0gc3RhdGVWYWx1ZVtrZXldO1xuXG4gICAgaWYgKHR5cGVvZiBzdWJTdGF0ZVZhbHVlICE9PSAnc3RyaW5nJyAmJiAoIXN1YlN0YXRlVmFsdWUgfHwgIU9iamVjdC5rZXlzKHN1YlN0YXRlVmFsdWUpLmxlbmd0aCkpIHtcbiAgICAgIHJldHVybiBbW2tleV1dO1xuICAgIH1cblxuICAgIHJldHVybiB0b1N0YXRlUGF0aHMoc3RhdGVWYWx1ZVtrZXldKS5tYXAoZnVuY3Rpb24gKHN1YlBhdGgpIHtcbiAgICAgIHJldHVybiBba2V5XS5jb25jYXQoc3ViUGF0aCk7XG4gICAgfSk7XG4gIH0pKTtcbiAgcmV0dXJuIHJlc3VsdDtcbn1cblxuZnVuY3Rpb24gZmxhdHRlbihhcnJheSkge1xuICB2YXIgX2E7XG5cbiAgcmV0dXJuIChfYSA9IFtdKS5jb25jYXQuYXBwbHkoX2EsIF9fc3ByZWFkKGFycmF5KSk7XG59XG5cbmZ1bmN0aW9uIHRvQXJyYXlTdHJpY3QodmFsdWUpIHtcbiAgaWYgKGlzQXJyYXkodmFsdWUpKSB7XG4gICAgcmV0dXJuIHZhbHVlO1xuICB9XG5cbiAgcmV0dXJuIFt2YWx1ZV07XG59XG5cbmZ1bmN0aW9uIHRvQXJyYXkodmFsdWUpIHtcbiAgaWYgKHZhbHVlID09PSB1bmRlZmluZWQpIHtcbiAgICByZXR1cm4gW107XG4gIH1cblxuICByZXR1cm4gdG9BcnJheVN0cmljdCh2YWx1ZSk7XG59XG5cbmZ1bmN0aW9uIG1hcENvbnRleHQobWFwcGVyLCBjb250ZXh0LCBfZXZlbnQpIHtcbiAgdmFyIGVfNSwgX2E7XG5cbiAgaWYgKGlzRnVuY3Rpb24obWFwcGVyKSkge1xuICAgIHJldHVybiBtYXBwZXIoY29udGV4dCwgX2V2ZW50LmRhdGEpO1xuICB9XG5cbiAgdmFyIHJlc3VsdCA9IHt9O1xuXG4gIHRyeSB7XG4gICAgZm9yICh2YXIgX2IgPSBfX3ZhbHVlcyhPYmplY3Qua2V5cyhtYXBwZXIpKSwgX2MgPSBfYi5uZXh0KCk7ICFfYy5kb25lOyBfYyA9IF9iLm5leHQoKSkge1xuICAgICAgdmFyIGtleSA9IF9jLnZhbHVlO1xuICAgICAgdmFyIHN1Yk1hcHBlciA9IG1hcHBlcltrZXldO1xuXG4gICAgICBpZiAoaXNGdW5jdGlvbihzdWJNYXBwZXIpKSB7XG4gICAgICAgIHJlc3VsdFtrZXldID0gc3ViTWFwcGVyKGNvbnRleHQsIF9ldmVudC5kYXRhKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJlc3VsdFtrZXldID0gc3ViTWFwcGVyO1xuICAgICAgfVxuICAgIH1cbiAgfSBjYXRjaCAoZV81XzEpIHtcbiAgICBlXzUgPSB7XG4gICAgICBlcnJvcjogZV81XzFcbiAgICB9O1xuICB9IGZpbmFsbHkge1xuICAgIHRyeSB7XG4gICAgICBpZiAoX2MgJiYgIV9jLmRvbmUgJiYgKF9hID0gX2IucmV0dXJuKSkgX2EuY2FsbChfYik7XG4gICAgfSBmaW5hbGx5IHtcbiAgICAgIGlmIChlXzUpIHRocm93IGVfNS5lcnJvcjtcbiAgICB9XG4gIH1cblxuICByZXR1cm4gcmVzdWx0O1xufVxuXG5mdW5jdGlvbiBpc0J1aWx0SW5FdmVudChldmVudFR5cGUpIHtcbiAgcmV0dXJuIC9eKGRvbmV8ZXJyb3IpXFwuLy50ZXN0KGV2ZW50VHlwZSk7XG59XG5cbmZ1bmN0aW9uIGlzUHJvbWlzZUxpa2UodmFsdWUpIHtcbiAgaWYgKHZhbHVlIGluc3RhbmNlb2YgUHJvbWlzZSkge1xuICAgIHJldHVybiB0cnVlO1xuICB9IC8vIENoZWNrIGlmIHNoYXBlIG1hdGNoZXMgdGhlIFByb21pc2UvQSsgc3BlY2lmaWNhdGlvbiBmb3IgYSBcInRoZW5hYmxlXCIuXG5cblxuICBpZiAodmFsdWUgIT09IG51bGwgJiYgKGlzRnVuY3Rpb24odmFsdWUpIHx8IHR5cGVvZiB2YWx1ZSA9PT0gJ29iamVjdCcpICYmIGlzRnVuY3Rpb24odmFsdWUudGhlbikpIHtcbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxuXG4gIHJldHVybiBmYWxzZTtcbn1cblxuZnVuY3Rpb24gcGFydGl0aW9uKGl0ZW1zLCBwcmVkaWNhdGUpIHtcbiAgdmFyIGVfNiwgX2E7XG5cbiAgdmFyIF9iID0gX19yZWFkKFtbXSwgW11dLCAyKSxcbiAgICAgIHRydXRoeSA9IF9iWzBdLFxuICAgICAgZmFsc3kgPSBfYlsxXTtcblxuICB0cnkge1xuICAgIGZvciAodmFyIGl0ZW1zXzEgPSBfX3ZhbHVlcyhpdGVtcyksIGl0ZW1zXzFfMSA9IGl0ZW1zXzEubmV4dCgpOyAhaXRlbXNfMV8xLmRvbmU7IGl0ZW1zXzFfMSA9IGl0ZW1zXzEubmV4dCgpKSB7XG4gICAgICB2YXIgaXRlbSA9IGl0ZW1zXzFfMS52YWx1ZTtcblxuICAgICAgaWYgKHByZWRpY2F0ZShpdGVtKSkge1xuICAgICAgICB0cnV0aHkucHVzaChpdGVtKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGZhbHN5LnB1c2goaXRlbSk7XG4gICAgICB9XG4gICAgfVxuICB9IGNhdGNoIChlXzZfMSkge1xuICAgIGVfNiA9IHtcbiAgICAgIGVycm9yOiBlXzZfMVxuICAgIH07XG4gIH0gZmluYWxseSB7XG4gICAgdHJ5IHtcbiAgICAgIGlmIChpdGVtc18xXzEgJiYgIWl0ZW1zXzFfMS5kb25lICYmIChfYSA9IGl0ZW1zXzEucmV0dXJuKSkgX2EuY2FsbChpdGVtc18xKTtcbiAgICB9IGZpbmFsbHkge1xuICAgICAgaWYgKGVfNikgdGhyb3cgZV82LmVycm9yO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiBbdHJ1dGh5LCBmYWxzeV07XG59XG5cbmZ1bmN0aW9uIHVwZGF0ZUhpc3RvcnlTdGF0ZXMoaGlzdCwgc3RhdGVWYWx1ZSkge1xuICByZXR1cm4gbWFwVmFsdWVzKGhpc3Quc3RhdGVzLCBmdW5jdGlvbiAoc3ViSGlzdCwga2V5KSB7XG4gICAgaWYgKCFzdWJIaXN0KSB7XG4gICAgICByZXR1cm4gdW5kZWZpbmVkO1xuICAgIH1cblxuICAgIHZhciBzdWJTdGF0ZVZhbHVlID0gKGlzU3RyaW5nKHN0YXRlVmFsdWUpID8gdW5kZWZpbmVkIDogc3RhdGVWYWx1ZVtrZXldKSB8fCAoc3ViSGlzdCA/IHN1Ykhpc3QuY3VycmVudCA6IHVuZGVmaW5lZCk7XG5cbiAgICBpZiAoIXN1YlN0YXRlVmFsdWUpIHtcbiAgICAgIHJldHVybiB1bmRlZmluZWQ7XG4gICAgfVxuXG4gICAgcmV0dXJuIHtcbiAgICAgIGN1cnJlbnQ6IHN1YlN0YXRlVmFsdWUsXG4gICAgICBzdGF0ZXM6IHVwZGF0ZUhpc3RvcnlTdGF0ZXMoc3ViSGlzdCwgc3ViU3RhdGVWYWx1ZSlcbiAgICB9O1xuICB9KTtcbn1cblxuZnVuY3Rpb24gdXBkYXRlSGlzdG9yeVZhbHVlKGhpc3QsIHN0YXRlVmFsdWUpIHtcbiAgcmV0dXJuIHtcbiAgICBjdXJyZW50OiBzdGF0ZVZhbHVlLFxuICAgIHN0YXRlczogdXBkYXRlSGlzdG9yeVN0YXRlcyhoaXN0LCBzdGF0ZVZhbHVlKVxuICB9O1xufVxuXG5mdW5jdGlvbiB1cGRhdGVDb250ZXh0KGNvbnRleHQsIF9ldmVudCwgYXNzaWduQWN0aW9ucywgc3RhdGUpIHtcbiAgaWYgKCFJU19QUk9EVUNUSU9OKSB7XG4gICAgd2FybighIWNvbnRleHQsICdBdHRlbXB0aW5nIHRvIHVwZGF0ZSB1bmRlZmluZWQgY29udGV4dCcpO1xuICB9XG5cbiAgdmFyIHVwZGF0ZWRDb250ZXh0ID0gY29udGV4dCA/IGFzc2lnbkFjdGlvbnMucmVkdWNlKGZ1bmN0aW9uIChhY2MsIGFzc2lnbkFjdGlvbikge1xuICAgIHZhciBlXzcsIF9hO1xuXG4gICAgdmFyIGFzc2lnbm1lbnQgPSBhc3NpZ25BY3Rpb24uYXNzaWdubWVudDtcbiAgICB2YXIgbWV0YSA9IHtcbiAgICAgIHN0YXRlOiBzdGF0ZSxcbiAgICAgIGFjdGlvbjogYXNzaWduQWN0aW9uLFxuICAgICAgX2V2ZW50OiBfZXZlbnRcbiAgICB9O1xuICAgIHZhciBwYXJ0aWFsVXBkYXRlID0ge307XG5cbiAgICBpZiAoaXNGdW5jdGlvbihhc3NpZ25tZW50KSkge1xuICAgICAgcGFydGlhbFVwZGF0ZSA9IGFzc2lnbm1lbnQoYWNjLCBfZXZlbnQuZGF0YSwgbWV0YSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRyeSB7XG4gICAgICAgIGZvciAodmFyIF9iID0gX192YWx1ZXMoa2V5cyhhc3NpZ25tZW50KSksIF9jID0gX2IubmV4dCgpOyAhX2MuZG9uZTsgX2MgPSBfYi5uZXh0KCkpIHtcbiAgICAgICAgICB2YXIga2V5ID0gX2MudmFsdWU7XG4gICAgICAgICAgdmFyIHByb3BBc3NpZ25tZW50ID0gYXNzaWdubWVudFtrZXldO1xuICAgICAgICAgIHBhcnRpYWxVcGRhdGVba2V5XSA9IGlzRnVuY3Rpb24ocHJvcEFzc2lnbm1lbnQpID8gcHJvcEFzc2lnbm1lbnQoYWNjLCBfZXZlbnQuZGF0YSwgbWV0YSkgOiBwcm9wQXNzaWdubWVudDtcbiAgICAgICAgfVxuICAgICAgfSBjYXRjaCAoZV83XzEpIHtcbiAgICAgICAgZV83ID0ge1xuICAgICAgICAgIGVycm9yOiBlXzdfMVxuICAgICAgICB9O1xuICAgICAgfSBmaW5hbGx5IHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICBpZiAoX2MgJiYgIV9jLmRvbmUgJiYgKF9hID0gX2IucmV0dXJuKSkgX2EuY2FsbChfYik7XG4gICAgICAgIH0gZmluYWxseSB7XG4gICAgICAgICAgaWYgKGVfNykgdGhyb3cgZV83LmVycm9yO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIE9iamVjdC5hc3NpZ24oe30sIGFjYywgcGFydGlhbFVwZGF0ZSk7XG4gIH0sIGNvbnRleHQpIDogY29udGV4dDtcbiAgcmV0dXJuIHVwZGF0ZWRDb250ZXh0O1xufSAvLyB0c2xpbnQ6ZGlzYWJsZS1uZXh0LWxpbmU6bm8tZW1wdHlcblxuXG52YXIgd2FybiA9IGZ1bmN0aW9uICgpIHt9O1xuXG5pZiAoIUlTX1BST0RVQ1RJT04pIHtcbiAgd2FybiA9IGZ1bmN0aW9uIChjb25kaXRpb24sIG1lc3NhZ2UpIHtcbiAgICB2YXIgZXJyb3IgPSBjb25kaXRpb24gaW5zdGFuY2VvZiBFcnJvciA/IGNvbmRpdGlvbiA6IHVuZGVmaW5lZDtcblxuICAgIGlmICghZXJyb3IgJiYgY29uZGl0aW9uKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgaWYgKGNvbnNvbGUgIT09IHVuZGVmaW5lZCkge1xuICAgICAgdmFyIGFyZ3MgPSBbXCJXYXJuaW5nOiBcIiArIG1lc3NhZ2VdO1xuXG4gICAgICBpZiAoZXJyb3IpIHtcbiAgICAgICAgYXJncy5wdXNoKGVycm9yKTtcbiAgICAgIH0gLy8gdHNsaW50OmRpc2FibGUtbmV4dC1saW5lOm5vLWNvbnNvbGVcblxuXG4gICAgICBjb25zb2xlLndhcm4uYXBwbHkoY29uc29sZSwgYXJncyk7XG4gICAgfVxuICB9O1xufVxuXG5mdW5jdGlvbiBpc0FycmF5KHZhbHVlKSB7XG4gIHJldHVybiBBcnJheS5pc0FycmF5KHZhbHVlKTtcbn0gLy8gdHNsaW50OmRpc2FibGUtbmV4dC1saW5lOmJhbi10eXBlc1xuXG5cbmZ1bmN0aW9uIGlzRnVuY3Rpb24odmFsdWUpIHtcbiAgcmV0dXJuIHR5cGVvZiB2YWx1ZSA9PT0gJ2Z1bmN0aW9uJztcbn1cblxuZnVuY3Rpb24gaXNTdHJpbmcodmFsdWUpIHtcbiAgcmV0dXJuIHR5cGVvZiB2YWx1ZSA9PT0gJ3N0cmluZyc7XG59IC8vIGV4cG9ydCBmdW5jdGlvbiBtZW1vaXplZEdldHRlcjxULCBUUCBleHRlbmRzIHsgcHJvdG90eXBlOiBvYmplY3QgfT4oXG4vLyAgIG86IFRQLFxuLy8gICBwcm9wZXJ0eTogc3RyaW5nLFxuLy8gICBnZXR0ZXI6ICgpID0+IFRcbi8vICk6IHZvaWQge1xuLy8gICBPYmplY3QuZGVmaW5lUHJvcGVydHkoby5wcm90b3R5cGUsIHByb3BlcnR5LCB7XG4vLyAgICAgZ2V0OiBnZXR0ZXIsXG4vLyAgICAgZW51bWVyYWJsZTogZmFsc2UsXG4vLyAgICAgY29uZmlndXJhYmxlOiBmYWxzZVxuLy8gICB9KTtcbi8vIH1cblxuXG5mdW5jdGlvbiB0b0d1YXJkKGNvbmRpdGlvbiwgZ3VhcmRNYXApIHtcbiAgaWYgKCFjb25kaXRpb24pIHtcbiAgICByZXR1cm4gdW5kZWZpbmVkO1xuICB9XG5cbiAgaWYgKGlzU3RyaW5nKGNvbmRpdGlvbikpIHtcbiAgICByZXR1cm4ge1xuICAgICAgdHlwZTogREVGQVVMVF9HVUFSRF9UWVBFLFxuICAgICAgbmFtZTogY29uZGl0aW9uLFxuICAgICAgcHJlZGljYXRlOiBndWFyZE1hcCA/IGd1YXJkTWFwW2NvbmRpdGlvbl0gOiB1bmRlZmluZWRcbiAgICB9O1xuICB9XG5cbiAgaWYgKGlzRnVuY3Rpb24oY29uZGl0aW9uKSkge1xuICAgIHJldHVybiB7XG4gICAgICB0eXBlOiBERUZBVUxUX0dVQVJEX1RZUEUsXG4gICAgICBuYW1lOiBjb25kaXRpb24ubmFtZSxcbiAgICAgIHByZWRpY2F0ZTogY29uZGl0aW9uXG4gICAgfTtcbiAgfVxuXG4gIHJldHVybiBjb25kaXRpb247XG59XG5cbmZ1bmN0aW9uIGlzT2JzZXJ2YWJsZSh2YWx1ZSkge1xuICB0cnkge1xuICAgIHJldHVybiAnc3Vic2NyaWJlJyBpbiB2YWx1ZSAmJiBpc0Z1bmN0aW9uKHZhbHVlLnN1YnNjcmliZSk7XG4gIH0gY2F0Y2ggKGUpIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cbn1cblxudmFyIHN5bWJvbE9ic2VydmFibGUgPSAvKiNfX1BVUkVfXyovZnVuY3Rpb24gKCkge1xuICByZXR1cm4gdHlwZW9mIFN5bWJvbCA9PT0gJ2Z1bmN0aW9uJyAmJiBTeW1ib2wub2JzZXJ2YWJsZSB8fCAnQEBvYnNlcnZhYmxlJztcbn0oKTtcblxuZnVuY3Rpb24gaXNNYWNoaW5lKHZhbHVlKSB7XG4gIHRyeSB7XG4gICAgcmV0dXJuICdfX3hzdGF0ZW5vZGUnIGluIHZhbHVlO1xuICB9IGNhdGNoIChlKSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG59XG5cbnZhciB1bmlxdWVJZCA9IC8qI19fUFVSRV9fKi9mdW5jdGlvbiAoKSB7XG4gIHZhciBjdXJyZW50SWQgPSAwO1xuICByZXR1cm4gZnVuY3Rpb24gKCkge1xuICAgIGN1cnJlbnRJZCsrO1xuICAgIHJldHVybiBjdXJyZW50SWQudG9TdHJpbmcoMTYpO1xuICB9O1xufSgpO1xuXG5mdW5jdGlvbiB0b0V2ZW50T2JqZWN0KGV2ZW50LCBwYXlsb2FkIC8vIGlkPzogVEV2ZW50Wyd0eXBlJ11cbikge1xuICBpZiAoaXNTdHJpbmcoZXZlbnQpIHx8IHR5cGVvZiBldmVudCA9PT0gJ251bWJlcicpIHtcbiAgICByZXR1cm4gX19hc3NpZ24oe1xuICAgICAgdHlwZTogZXZlbnRcbiAgICB9LCBwYXlsb2FkKTtcbiAgfVxuXG4gIHJldHVybiBldmVudDtcbn1cblxuZnVuY3Rpb24gdG9TQ1hNTEV2ZW50KGV2ZW50LCBzY3htbEV2ZW50KSB7XG4gIGlmICghaXNTdHJpbmcoZXZlbnQpICYmICckJHR5cGUnIGluIGV2ZW50ICYmIGV2ZW50LiQkdHlwZSA9PT0gJ3NjeG1sJykge1xuICAgIHJldHVybiBldmVudDtcbiAgfVxuXG4gIHZhciBldmVudE9iamVjdCA9IHRvRXZlbnRPYmplY3QoZXZlbnQpO1xuICByZXR1cm4gX19hc3NpZ24oe1xuICAgIG5hbWU6IGV2ZW50T2JqZWN0LnR5cGUsXG4gICAgZGF0YTogZXZlbnRPYmplY3QsXG4gICAgJCR0eXBlOiAnc2N4bWwnLFxuICAgIHR5cGU6ICdleHRlcm5hbCdcbiAgfSwgc2N4bWxFdmVudCk7XG59XG5cbmZ1bmN0aW9uIHRvVHJhbnNpdGlvbkNvbmZpZ0FycmF5KGV2ZW50LCBjb25maWdMaWtlKSB7XG4gIHZhciB0cmFuc2l0aW9ucyA9IHRvQXJyYXlTdHJpY3QoY29uZmlnTGlrZSkubWFwKGZ1bmN0aW9uICh0cmFuc2l0aW9uTGlrZSkge1xuICAgIGlmICh0eXBlb2YgdHJhbnNpdGlvbkxpa2UgPT09ICd1bmRlZmluZWQnIHx8IHR5cGVvZiB0cmFuc2l0aW9uTGlrZSA9PT0gJ3N0cmluZycgfHwgaXNNYWNoaW5lKHRyYW5zaXRpb25MaWtlKSkge1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgdGFyZ2V0OiB0cmFuc2l0aW9uTGlrZSxcbiAgICAgICAgZXZlbnQ6IGV2ZW50XG4gICAgICB9O1xuICAgIH1cblxuICAgIHJldHVybiBfX2Fzc2lnbihfX2Fzc2lnbih7fSwgdHJhbnNpdGlvbkxpa2UpLCB7XG4gICAgICBldmVudDogZXZlbnRcbiAgICB9KTtcbiAgfSk7XG4gIHJldHVybiB0cmFuc2l0aW9ucztcbn1cblxuZnVuY3Rpb24gbm9ybWFsaXplVGFyZ2V0KHRhcmdldCkge1xuICBpZiAodGFyZ2V0ID09PSB1bmRlZmluZWQgfHwgdGFyZ2V0ID09PSBUQVJHRVRMRVNTX0tFWSkge1xuICAgIHJldHVybiB1bmRlZmluZWQ7XG4gIH1cblxuICByZXR1cm4gdG9BcnJheSh0YXJnZXQpO1xufVxuXG5mdW5jdGlvbiByZXBvcnRVbmhhbmRsZWRFeGNlcHRpb25Pbkludm9jYXRpb24ob3JpZ2luYWxFcnJvciwgY3VycmVudEVycm9yLCBpZCkge1xuICBpZiAoIUlTX1BST0RVQ1RJT04pIHtcbiAgICB2YXIgb3JpZ2luYWxTdGFja1RyYWNlID0gb3JpZ2luYWxFcnJvci5zdGFjayA/IFwiIFN0YWNrdHJhY2Ugd2FzICdcIiArIG9yaWdpbmFsRXJyb3Iuc3RhY2sgKyBcIidcIiA6ICcnO1xuXG4gICAgaWYgKG9yaWdpbmFsRXJyb3IgPT09IGN1cnJlbnRFcnJvcikge1xuICAgICAgLy8gdHNsaW50OmRpc2FibGUtbmV4dC1saW5lOm5vLWNvbnNvbGVcbiAgICAgIGNvbnNvbGUuZXJyb3IoXCJNaXNzaW5nIG9uRXJyb3IgaGFuZGxlciBmb3IgaW52b2NhdGlvbiAnXCIgKyBpZCArIFwiJywgZXJyb3Igd2FzICdcIiArIG9yaWdpbmFsRXJyb3IgKyBcIicuXCIgKyBvcmlnaW5hbFN0YWNrVHJhY2UpO1xuICAgIH0gZWxzZSB7XG4gICAgICB2YXIgc3RhY2tUcmFjZSA9IGN1cnJlbnRFcnJvci5zdGFjayA/IFwiIFN0YWNrdHJhY2Ugd2FzICdcIiArIGN1cnJlbnRFcnJvci5zdGFjayArIFwiJ1wiIDogJyc7IC8vIHRzbGludDpkaXNhYmxlLW5leHQtbGluZTpuby1jb25zb2xlXG5cbiAgICAgIGNvbnNvbGUuZXJyb3IoXCJNaXNzaW5nIG9uRXJyb3IgaGFuZGxlciBhbmQvb3IgdW5oYW5kbGVkIGV4Y2VwdGlvbi9wcm9taXNlIHJlamVjdGlvbiBmb3IgaW52b2NhdGlvbiAnXCIgKyBpZCArIFwiJy4gXCIgKyAoXCJPcmlnaW5hbCBlcnJvcjogJ1wiICsgb3JpZ2luYWxFcnJvciArIFwiJy4gXCIgKyBvcmlnaW5hbFN0YWNrVHJhY2UgKyBcIiBDdXJyZW50IGVycm9yIGlzICdcIiArIGN1cnJlbnRFcnJvciArIFwiJy5cIiArIHN0YWNrVHJhY2UpKTtcbiAgICB9XG4gIH1cbn1cblxuZnVuY3Rpb24gZXZhbHVhdGVHdWFyZChtYWNoaW5lLCBndWFyZCwgY29udGV4dCwgX2V2ZW50LCBzdGF0ZSkge1xuICB2YXIgZ3VhcmRzID0gbWFjaGluZS5vcHRpb25zLmd1YXJkcztcbiAgdmFyIGd1YXJkTWV0YSA9IHtcbiAgICBzdGF0ZTogc3RhdGUsXG4gICAgY29uZDogZ3VhcmQsXG4gICAgX2V2ZW50OiBfZXZlbnRcbiAgfTsgLy8gVE9ETzogZG8gbm90IGhhcmRjb2RlIVxuXG4gIGlmIChndWFyZC50eXBlID09PSBERUZBVUxUX0dVQVJEX1RZUEUpIHtcbiAgICByZXR1cm4gZ3VhcmQucHJlZGljYXRlKGNvbnRleHQsIF9ldmVudC5kYXRhLCBndWFyZE1ldGEpO1xuICB9XG5cbiAgdmFyIGNvbmRGbiA9IGd1YXJkc1tndWFyZC50eXBlXTtcblxuICBpZiAoIWNvbmRGbikge1xuICAgIHRocm93IG5ldyBFcnJvcihcIkd1YXJkICdcIiArIGd1YXJkLnR5cGUgKyBcIicgaXMgbm90IGltcGxlbWVudGVkIG9uIG1hY2hpbmUgJ1wiICsgbWFjaGluZS5pZCArIFwiJy5cIik7XG4gIH1cblxuICByZXR1cm4gY29uZEZuKGNvbnRleHQsIF9ldmVudC5kYXRhLCBndWFyZE1ldGEpO1xufVxuXG5mdW5jdGlvbiB0b0ludm9rZVNvdXJjZShzcmMpIHtcbiAgaWYgKHR5cGVvZiBzcmMgPT09ICdzdHJpbmcnKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIHR5cGU6IHNyY1xuICAgIH07XG4gIH1cblxuICByZXR1cm4gc3JjO1xufVxuXG5leHBvcnQgeyBldmFsdWF0ZUd1YXJkLCBmbGF0dGVuLCBnZXRFdmVudFR5cGUsIGlzQXJyYXksIGlzQnVpbHRJbkV2ZW50LCBpc0Z1bmN0aW9uLCBpc01hY2hpbmUsIGlzT2JzZXJ2YWJsZSwgaXNQcm9taXNlTGlrZSwgaXNTdGF0ZUxpa2UsIGlzU3RyaW5nLCBrZXlzLCBtYXBDb250ZXh0LCBtYXBGaWx0ZXJWYWx1ZXMsIG1hcFZhbHVlcywgbWF0Y2hlc1N0YXRlLCBuZXN0ZWRQYXRoLCBub3JtYWxpemVUYXJnZXQsIHBhcnRpdGlvbiwgcGF0aCwgcGF0aFRvU3RhdGVWYWx1ZSwgcmVwb3J0VW5oYW5kbGVkRXhjZXB0aW9uT25JbnZvY2F0aW9uLCBzeW1ib2xPYnNlcnZhYmxlLCB0b0FycmF5LCB0b0FycmF5U3RyaWN0LCB0b0V2ZW50T2JqZWN0LCB0b0d1YXJkLCB0b0ludm9rZVNvdXJjZSwgdG9TQ1hNTEV2ZW50LCB0b1N0YXRlUGF0aCwgdG9TdGF0ZVBhdGhzLCB0b1N0YXRlVmFsdWUsIHRvVHJhbnNpdGlvbkNvbmZpZ0FycmF5LCB1bmlxdWVJZCwgdXBkYXRlQ29udGV4dCwgdXBkYXRlSGlzdG9yeVN0YXRlcywgdXBkYXRlSGlzdG9yeVZhbHVlLCB3YXJuIH07IiwiaW1wb3J0IHsgX192YWx1ZXMgfSBmcm9tICcuL192aXJ0dWFsL190c2xpYi5qcyc7XG5pbXBvcnQgeyBrZXlzLCBtYXRjaGVzU3RhdGUgfSBmcm9tICcuL3V0aWxzLmpzJztcblxuZnVuY3Rpb24gbWFwU3RhdGUoc3RhdGVNYXAsIHN0YXRlSWQpIHtcbiAgdmFyIGVfMSwgX2E7XG5cbiAgdmFyIGZvdW5kU3RhdGVJZDtcblxuICB0cnkge1xuICAgIGZvciAodmFyIF9iID0gX192YWx1ZXMoa2V5cyhzdGF0ZU1hcCkpLCBfYyA9IF9iLm5leHQoKTsgIV9jLmRvbmU7IF9jID0gX2IubmV4dCgpKSB7XG4gICAgICB2YXIgbWFwcGVkU3RhdGVJZCA9IF9jLnZhbHVlO1xuXG4gICAgICBpZiAobWF0Y2hlc1N0YXRlKG1hcHBlZFN0YXRlSWQsIHN0YXRlSWQpICYmICghZm91bmRTdGF0ZUlkIHx8IHN0YXRlSWQubGVuZ3RoID4gZm91bmRTdGF0ZUlkLmxlbmd0aCkpIHtcbiAgICAgICAgZm91bmRTdGF0ZUlkID0gbWFwcGVkU3RhdGVJZDtcbiAgICAgIH1cbiAgICB9XG4gIH0gY2F0Y2ggKGVfMV8xKSB7XG4gICAgZV8xID0ge1xuICAgICAgZXJyb3I6IGVfMV8xXG4gICAgfTtcbiAgfSBmaW5hbGx5IHtcbiAgICB0cnkge1xuICAgICAgaWYgKF9jICYmICFfYy5kb25lICYmIChfYSA9IF9iLnJldHVybikpIF9hLmNhbGwoX2IpO1xuICAgIH0gZmluYWxseSB7XG4gICAgICBpZiAoZV8xKSB0aHJvdyBlXzEuZXJyb3I7XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIHN0YXRlTWFwW2ZvdW5kU3RhdGVJZF07XG59XG5cbmV4cG9ydCB7IG1hcFN0YXRlIH07IiwidmFyIEFjdGlvblR5cGVzO1xuXG4oZnVuY3Rpb24gKEFjdGlvblR5cGVzKSB7XG4gIEFjdGlvblR5cGVzW1wiU3RhcnRcIl0gPSBcInhzdGF0ZS5zdGFydFwiO1xuICBBY3Rpb25UeXBlc1tcIlN0b3BcIl0gPSBcInhzdGF0ZS5zdG9wXCI7XG4gIEFjdGlvblR5cGVzW1wiUmFpc2VcIl0gPSBcInhzdGF0ZS5yYWlzZVwiO1xuICBBY3Rpb25UeXBlc1tcIlNlbmRcIl0gPSBcInhzdGF0ZS5zZW5kXCI7XG4gIEFjdGlvblR5cGVzW1wiQ2FuY2VsXCJdID0gXCJ4c3RhdGUuY2FuY2VsXCI7XG4gIEFjdGlvblR5cGVzW1wiTnVsbEV2ZW50XCJdID0gXCJcIjtcbiAgQWN0aW9uVHlwZXNbXCJBc3NpZ25cIl0gPSBcInhzdGF0ZS5hc3NpZ25cIjtcbiAgQWN0aW9uVHlwZXNbXCJBZnRlclwiXSA9IFwieHN0YXRlLmFmdGVyXCI7XG4gIEFjdGlvblR5cGVzW1wiRG9uZVN0YXRlXCJdID0gXCJkb25lLnN0YXRlXCI7XG4gIEFjdGlvblR5cGVzW1wiRG9uZUludm9rZVwiXSA9IFwiZG9uZS5pbnZva2VcIjtcbiAgQWN0aW9uVHlwZXNbXCJMb2dcIl0gPSBcInhzdGF0ZS5sb2dcIjtcbiAgQWN0aW9uVHlwZXNbXCJJbml0XCJdID0gXCJ4c3RhdGUuaW5pdFwiO1xuICBBY3Rpb25UeXBlc1tcIkludm9rZVwiXSA9IFwieHN0YXRlLmludm9rZVwiO1xuICBBY3Rpb25UeXBlc1tcIkVycm9yRXhlY3V0aW9uXCJdID0gXCJlcnJvci5leGVjdXRpb25cIjtcbiAgQWN0aW9uVHlwZXNbXCJFcnJvckNvbW11bmljYXRpb25cIl0gPSBcImVycm9yLmNvbW11bmljYXRpb25cIjtcbiAgQWN0aW9uVHlwZXNbXCJFcnJvclBsYXRmb3JtXCJdID0gXCJlcnJvci5wbGF0Zm9ybVwiO1xuICBBY3Rpb25UeXBlc1tcIkVycm9yQ3VzdG9tXCJdID0gXCJ4c3RhdGUuZXJyb3JcIjtcbiAgQWN0aW9uVHlwZXNbXCJVcGRhdGVcIl0gPSBcInhzdGF0ZS51cGRhdGVcIjtcbiAgQWN0aW9uVHlwZXNbXCJQdXJlXCJdID0gXCJ4c3RhdGUucHVyZVwiO1xuICBBY3Rpb25UeXBlc1tcIkNob29zZVwiXSA9IFwieHN0YXRlLmNob29zZVwiO1xufSkoQWN0aW9uVHlwZXMgfHwgKEFjdGlvblR5cGVzID0ge30pKTtcblxudmFyIFNwZWNpYWxUYXJnZXRzO1xuXG4oZnVuY3Rpb24gKFNwZWNpYWxUYXJnZXRzKSB7XG4gIFNwZWNpYWxUYXJnZXRzW1wiUGFyZW50XCJdID0gXCIjX3BhcmVudFwiO1xuICBTcGVjaWFsVGFyZ2V0c1tcIkludGVybmFsXCJdID0gXCIjX2ludGVybmFsXCI7XG59KShTcGVjaWFsVGFyZ2V0cyB8fCAoU3BlY2lhbFRhcmdldHMgPSB7fSkpO1xuXG5leHBvcnQgeyBBY3Rpb25UeXBlcywgU3BlY2lhbFRhcmdldHMgfTsiLCJpbXBvcnQgeyBBY3Rpb25UeXBlcyB9IGZyb20gJy4vdHlwZXMuanMnOyAvLyB4c3RhdGUtc3BlY2lmaWMgYWN0aW9uIHR5cGVzXG5cbnZhciBzdGFydCA9IEFjdGlvblR5cGVzLlN0YXJ0O1xudmFyIHN0b3AgPSBBY3Rpb25UeXBlcy5TdG9wO1xudmFyIHJhaXNlID0gQWN0aW9uVHlwZXMuUmFpc2U7XG52YXIgc2VuZCA9IEFjdGlvblR5cGVzLlNlbmQ7XG52YXIgY2FuY2VsID0gQWN0aW9uVHlwZXMuQ2FuY2VsO1xudmFyIG51bGxFdmVudCA9IEFjdGlvblR5cGVzLk51bGxFdmVudDtcbnZhciBhc3NpZ24gPSBBY3Rpb25UeXBlcy5Bc3NpZ247XG52YXIgYWZ0ZXIgPSBBY3Rpb25UeXBlcy5BZnRlcjtcbnZhciBkb25lU3RhdGUgPSBBY3Rpb25UeXBlcy5Eb25lU3RhdGU7XG52YXIgbG9nID0gQWN0aW9uVHlwZXMuTG9nO1xudmFyIGluaXQgPSBBY3Rpb25UeXBlcy5Jbml0O1xudmFyIGludm9rZSA9IEFjdGlvblR5cGVzLkludm9rZTtcbnZhciBlcnJvckV4ZWN1dGlvbiA9IEFjdGlvblR5cGVzLkVycm9yRXhlY3V0aW9uO1xudmFyIGVycm9yUGxhdGZvcm0gPSBBY3Rpb25UeXBlcy5FcnJvclBsYXRmb3JtO1xudmFyIGVycm9yID0gQWN0aW9uVHlwZXMuRXJyb3JDdXN0b207XG52YXIgdXBkYXRlID0gQWN0aW9uVHlwZXMuVXBkYXRlO1xudmFyIGNob29zZSA9IEFjdGlvblR5cGVzLkNob29zZTtcbnZhciBwdXJlID0gQWN0aW9uVHlwZXMuUHVyZTtcbmV4cG9ydCB7IGFmdGVyLCBhc3NpZ24sIGNhbmNlbCwgY2hvb3NlLCBkb25lU3RhdGUsIGVycm9yLCBlcnJvckV4ZWN1dGlvbiwgZXJyb3JQbGF0Zm9ybSwgaW5pdCwgaW52b2tlLCBsb2csIG51bGxFdmVudCwgcHVyZSwgcmFpc2UsIHNlbmQsIHN0YXJ0LCBzdG9wLCB1cGRhdGUgfTsiLCJpbXBvcnQgeyBfX2Fzc2lnbiwgX19yZWFkIH0gZnJvbSAnLi9fdmlydHVhbC9fdHNsaWIuanMnO1xuaW1wb3J0IHsgSVNfUFJPRFVDVElPTiB9IGZyb20gJy4vZW52aXJvbm1lbnQuanMnO1xuaW1wb3J0IHsgdG9TQ1hNTEV2ZW50LCBpc0Z1bmN0aW9uLCB0b0V2ZW50T2JqZWN0LCBnZXRFdmVudFR5cGUsIGlzU3RyaW5nLCBwYXJ0aXRpb24sIHVwZGF0ZUNvbnRleHQsIGZsYXR0ZW4sIHRvQXJyYXksIHRvR3VhcmQsIGV2YWx1YXRlR3VhcmQsIHdhcm4sIGlzQXJyYXkgfSBmcm9tICcuL3V0aWxzLmpzJztcbmltcG9ydCB7IFNwZWNpYWxUYXJnZXRzLCBBY3Rpb25UeXBlcyB9IGZyb20gJy4vdHlwZXMuanMnO1xuaW1wb3J0IHsgc2VuZCBhcyBzZW5kJDEsIHVwZGF0ZSwgYXNzaWduIGFzIGFzc2lnbiQxLCBpbml0LCByYWlzZSBhcyByYWlzZSQxLCBsb2cgYXMgbG9nJDEsIGNhbmNlbCBhcyBjYW5jZWwkMSwgZXJyb3IgYXMgZXJyb3IkMSwgc3RvcCBhcyBzdG9wJDEsIHB1cmUgYXMgcHVyZSQxLCBjaG9vc2UgYXMgY2hvb3NlJDEgfSBmcm9tICcuL2FjdGlvblR5cGVzLmpzJztcbnZhciBpbml0RXZlbnQgPSAvKiNfX1BVUkVfXyovdG9TQ1hNTEV2ZW50KHtcbiAgdHlwZTogaW5pdFxufSk7XG5cbmZ1bmN0aW9uIGdldEFjdGlvbkZ1bmN0aW9uKGFjdGlvblR5cGUsIGFjdGlvbkZ1bmN0aW9uTWFwKSB7XG4gIHJldHVybiBhY3Rpb25GdW5jdGlvbk1hcCA/IGFjdGlvbkZ1bmN0aW9uTWFwW2FjdGlvblR5cGVdIHx8IHVuZGVmaW5lZCA6IHVuZGVmaW5lZDtcbn1cblxuZnVuY3Rpb24gdG9BY3Rpb25PYmplY3QoYWN0aW9uLCBhY3Rpb25GdW5jdGlvbk1hcCkge1xuICB2YXIgYWN0aW9uT2JqZWN0O1xuXG4gIGlmIChpc1N0cmluZyhhY3Rpb24pIHx8IHR5cGVvZiBhY3Rpb24gPT09ICdudW1iZXInKSB7XG4gICAgdmFyIGV4ZWMgPSBnZXRBY3Rpb25GdW5jdGlvbihhY3Rpb24sIGFjdGlvbkZ1bmN0aW9uTWFwKTtcblxuICAgIGlmIChpc0Z1bmN0aW9uKGV4ZWMpKSB7XG4gICAgICBhY3Rpb25PYmplY3QgPSB7XG4gICAgICAgIHR5cGU6IGFjdGlvbixcbiAgICAgICAgZXhlYzogZXhlY1xuICAgICAgfTtcbiAgICB9IGVsc2UgaWYgKGV4ZWMpIHtcbiAgICAgIGFjdGlvbk9iamVjdCA9IGV4ZWM7XG4gICAgfSBlbHNlIHtcbiAgICAgIGFjdGlvbk9iamVjdCA9IHtcbiAgICAgICAgdHlwZTogYWN0aW9uLFxuICAgICAgICBleGVjOiB1bmRlZmluZWRcbiAgICAgIH07XG4gICAgfVxuICB9IGVsc2UgaWYgKGlzRnVuY3Rpb24oYWN0aW9uKSkge1xuICAgIGFjdGlvbk9iamVjdCA9IHtcbiAgICAgIC8vIENvbnZlcnQgYWN0aW9uIHRvIHN0cmluZyBpZiB1bm5hbWVkXG4gICAgICB0eXBlOiBhY3Rpb24ubmFtZSB8fCBhY3Rpb24udG9TdHJpbmcoKSxcbiAgICAgIGV4ZWM6IGFjdGlvblxuICAgIH07XG4gIH0gZWxzZSB7XG4gICAgdmFyIGV4ZWMgPSBnZXRBY3Rpb25GdW5jdGlvbihhY3Rpb24udHlwZSwgYWN0aW9uRnVuY3Rpb25NYXApO1xuXG4gICAgaWYgKGlzRnVuY3Rpb24oZXhlYykpIHtcbiAgICAgIGFjdGlvbk9iamVjdCA9IF9fYXNzaWduKF9fYXNzaWduKHt9LCBhY3Rpb24pLCB7XG4gICAgICAgIGV4ZWM6IGV4ZWNcbiAgICAgIH0pO1xuICAgIH0gZWxzZSBpZiAoZXhlYykge1xuICAgICAgdmFyIGFjdGlvblR5cGUgPSBleGVjLnR5cGUgfHwgYWN0aW9uLnR5cGU7XG4gICAgICBhY3Rpb25PYmplY3QgPSBfX2Fzc2lnbihfX2Fzc2lnbihfX2Fzc2lnbih7fSwgZXhlYyksIGFjdGlvbiksIHtcbiAgICAgICAgdHlwZTogYWN0aW9uVHlwZVxuICAgICAgfSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGFjdGlvbk9iamVjdCA9IGFjdGlvbjtcbiAgICB9XG4gIH1cblxuICBPYmplY3QuZGVmaW5lUHJvcGVydHkoYWN0aW9uT2JqZWN0LCAndG9TdHJpbmcnLCB7XG4gICAgdmFsdWU6IGZ1bmN0aW9uICgpIHtcbiAgICAgIHJldHVybiBhY3Rpb25PYmplY3QudHlwZTtcbiAgICB9LFxuICAgIGVudW1lcmFibGU6IGZhbHNlLFxuICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZVxuICB9KTtcbiAgcmV0dXJuIGFjdGlvbk9iamVjdDtcbn1cblxudmFyIHRvQWN0aW9uT2JqZWN0cyA9IGZ1bmN0aW9uIChhY3Rpb24sIGFjdGlvbkZ1bmN0aW9uTWFwKSB7XG4gIGlmICghYWN0aW9uKSB7XG4gICAgcmV0dXJuIFtdO1xuICB9XG5cbiAgdmFyIGFjdGlvbnMgPSBpc0FycmF5KGFjdGlvbikgPyBhY3Rpb24gOiBbYWN0aW9uXTtcbiAgcmV0dXJuIGFjdGlvbnMubWFwKGZ1bmN0aW9uIChzdWJBY3Rpb24pIHtcbiAgICByZXR1cm4gdG9BY3Rpb25PYmplY3Qoc3ViQWN0aW9uLCBhY3Rpb25GdW5jdGlvbk1hcCk7XG4gIH0pO1xufTtcblxuZnVuY3Rpb24gdG9BY3Rpdml0eURlZmluaXRpb24oYWN0aW9uKSB7XG4gIHZhciBhY3Rpb25PYmplY3QgPSB0b0FjdGlvbk9iamVjdChhY3Rpb24pO1xuICByZXR1cm4gX19hc3NpZ24oX19hc3NpZ24oe1xuICAgIGlkOiBpc1N0cmluZyhhY3Rpb24pID8gYWN0aW9uIDogYWN0aW9uT2JqZWN0LmlkXG4gIH0sIGFjdGlvbk9iamVjdCksIHtcbiAgICB0eXBlOiBhY3Rpb25PYmplY3QudHlwZVxuICB9KTtcbn1cbi8qKlxyXG4gKiBSYWlzZXMgYW4gZXZlbnQuIFRoaXMgcGxhY2VzIHRoZSBldmVudCBpbiB0aGUgaW50ZXJuYWwgZXZlbnQgcXVldWUsIHNvIHRoYXRcclxuICogdGhlIGV2ZW50IGlzIGltbWVkaWF0ZWx5IGNvbnN1bWVkIGJ5IHRoZSBtYWNoaW5lIGluIHRoZSBjdXJyZW50IHN0ZXAuXHJcbiAqXHJcbiAqIEBwYXJhbSBldmVudFR5cGUgVGhlIGV2ZW50IHRvIHJhaXNlLlxyXG4gKi9cblxuXG5mdW5jdGlvbiByYWlzZShldmVudCkge1xuICBpZiAoIWlzU3RyaW5nKGV2ZW50KSkge1xuICAgIHJldHVybiBzZW5kKGV2ZW50LCB7XG4gICAgICB0bzogU3BlY2lhbFRhcmdldHMuSW50ZXJuYWxcbiAgICB9KTtcbiAgfVxuXG4gIHJldHVybiB7XG4gICAgdHlwZTogcmFpc2UkMSxcbiAgICBldmVudDogZXZlbnRcbiAgfTtcbn1cblxuZnVuY3Rpb24gcmVzb2x2ZVJhaXNlKGFjdGlvbikge1xuICByZXR1cm4ge1xuICAgIHR5cGU6IHJhaXNlJDEsXG4gICAgX2V2ZW50OiB0b1NDWE1MRXZlbnQoYWN0aW9uLmV2ZW50KVxuICB9O1xufVxuLyoqXHJcbiAqIFNlbmRzIGFuIGV2ZW50LiBUaGlzIHJldHVybnMgYW4gYWN0aW9uIHRoYXQgd2lsbCBiZSByZWFkIGJ5IGFuIGludGVycHJldGVyIHRvXHJcbiAqIHNlbmQgdGhlIGV2ZW50IGluIHRoZSBuZXh0IHN0ZXAsIGFmdGVyIHRoZSBjdXJyZW50IHN0ZXAgaXMgZmluaXNoZWQgZXhlY3V0aW5nLlxyXG4gKlxyXG4gKiBAcGFyYW0gZXZlbnQgVGhlIGV2ZW50IHRvIHNlbmQuXHJcbiAqIEBwYXJhbSBvcHRpb25zIE9wdGlvbnMgdG8gcGFzcyBpbnRvIHRoZSBzZW5kIGV2ZW50OlxyXG4gKiAgLSBgaWRgIC0gVGhlIHVuaXF1ZSBzZW5kIGV2ZW50IGlkZW50aWZpZXIgKHVzZWQgd2l0aCBgY2FuY2VsKClgKS5cclxuICogIC0gYGRlbGF5YCAtIFRoZSBudW1iZXIgb2YgbWlsbGlzZWNvbmRzIHRvIGRlbGF5IHRoZSBzZW5kaW5nIG9mIHRoZSBldmVudC5cclxuICogIC0gYHRvYCAtIFRoZSB0YXJnZXQgb2YgdGhpcyBldmVudCAoYnkgZGVmYXVsdCwgdGhlIG1hY2hpbmUgdGhlIGV2ZW50IHdhcyBzZW50IGZyb20pLlxyXG4gKi9cblxuXG5mdW5jdGlvbiBzZW5kKGV2ZW50LCBvcHRpb25zKSB7XG4gIHJldHVybiB7XG4gICAgdG86IG9wdGlvbnMgPyBvcHRpb25zLnRvIDogdW5kZWZpbmVkLFxuICAgIHR5cGU6IHNlbmQkMSxcbiAgICBldmVudDogaXNGdW5jdGlvbihldmVudCkgPyBldmVudCA6IHRvRXZlbnRPYmplY3QoZXZlbnQpLFxuICAgIGRlbGF5OiBvcHRpb25zID8gb3B0aW9ucy5kZWxheSA6IHVuZGVmaW5lZCxcbiAgICBpZDogb3B0aW9ucyAmJiBvcHRpb25zLmlkICE9PSB1bmRlZmluZWQgPyBvcHRpb25zLmlkIDogaXNGdW5jdGlvbihldmVudCkgPyBldmVudC5uYW1lIDogZ2V0RXZlbnRUeXBlKGV2ZW50KVxuICB9O1xufVxuXG5mdW5jdGlvbiByZXNvbHZlU2VuZChhY3Rpb24sIGN0eCwgX2V2ZW50LCBkZWxheXNNYXApIHtcbiAgdmFyIG1ldGEgPSB7XG4gICAgX2V2ZW50OiBfZXZlbnRcbiAgfTsgLy8gVE9ETzogaGVscGVyIGZ1bmN0aW9uIGZvciByZXNvbHZpbmcgRXhwclxuXG4gIHZhciByZXNvbHZlZEV2ZW50ID0gdG9TQ1hNTEV2ZW50KGlzRnVuY3Rpb24oYWN0aW9uLmV2ZW50KSA/IGFjdGlvbi5ldmVudChjdHgsIF9ldmVudC5kYXRhLCBtZXRhKSA6IGFjdGlvbi5ldmVudCk7XG4gIHZhciByZXNvbHZlZERlbGF5O1xuXG4gIGlmIChpc1N0cmluZyhhY3Rpb24uZGVsYXkpKSB7XG4gICAgdmFyIGNvbmZpZ0RlbGF5ID0gZGVsYXlzTWFwICYmIGRlbGF5c01hcFthY3Rpb24uZGVsYXldO1xuICAgIHJlc29sdmVkRGVsYXkgPSBpc0Z1bmN0aW9uKGNvbmZpZ0RlbGF5KSA/IGNvbmZpZ0RlbGF5KGN0eCwgX2V2ZW50LmRhdGEsIG1ldGEpIDogY29uZmlnRGVsYXk7XG4gIH0gZWxzZSB7XG4gICAgcmVzb2x2ZWREZWxheSA9IGlzRnVuY3Rpb24oYWN0aW9uLmRlbGF5KSA/IGFjdGlvbi5kZWxheShjdHgsIF9ldmVudC5kYXRhLCBtZXRhKSA6IGFjdGlvbi5kZWxheTtcbiAgfVxuXG4gIHZhciByZXNvbHZlZFRhcmdldCA9IGlzRnVuY3Rpb24oYWN0aW9uLnRvKSA/IGFjdGlvbi50byhjdHgsIF9ldmVudC5kYXRhLCBtZXRhKSA6IGFjdGlvbi50bztcbiAgcmV0dXJuIF9fYXNzaWduKF9fYXNzaWduKHt9LCBhY3Rpb24pLCB7XG4gICAgdG86IHJlc29sdmVkVGFyZ2V0LFxuICAgIF9ldmVudDogcmVzb2x2ZWRFdmVudCxcbiAgICBldmVudDogcmVzb2x2ZWRFdmVudC5kYXRhLFxuICAgIGRlbGF5OiByZXNvbHZlZERlbGF5XG4gIH0pO1xufVxuLyoqXHJcbiAqIFNlbmRzIGFuIGV2ZW50IHRvIHRoaXMgbWFjaGluZSdzIHBhcmVudC5cclxuICpcclxuICogQHBhcmFtIGV2ZW50IFRoZSBldmVudCB0byBzZW5kIHRvIHRoZSBwYXJlbnQgbWFjaGluZS5cclxuICogQHBhcmFtIG9wdGlvbnMgT3B0aW9ucyB0byBwYXNzIGludG8gdGhlIHNlbmQgZXZlbnQuXHJcbiAqL1xuXG5cbmZ1bmN0aW9uIHNlbmRQYXJlbnQoZXZlbnQsIG9wdGlvbnMpIHtcbiAgcmV0dXJuIHNlbmQoZXZlbnQsIF9fYXNzaWduKF9fYXNzaWduKHt9LCBvcHRpb25zKSwge1xuICAgIHRvOiBTcGVjaWFsVGFyZ2V0cy5QYXJlbnRcbiAgfSkpO1xufVxuLyoqXHJcbiAqIFNlbmRzIGFuIHVwZGF0ZSBldmVudCB0byB0aGlzIG1hY2hpbmUncyBwYXJlbnQuXHJcbiAqL1xuXG5cbmZ1bmN0aW9uIHNlbmRVcGRhdGUoKSB7XG4gIHJldHVybiBzZW5kUGFyZW50KHVwZGF0ZSk7XG59XG4vKipcclxuICogU2VuZHMgYW4gZXZlbnQgYmFjayB0byB0aGUgc2VuZGVyIG9mIHRoZSBvcmlnaW5hbCBldmVudC5cclxuICpcclxuICogQHBhcmFtIGV2ZW50IFRoZSBldmVudCB0byBzZW5kIGJhY2sgdG8gdGhlIHNlbmRlclxyXG4gKiBAcGFyYW0gb3B0aW9ucyBPcHRpb25zIHRvIHBhc3MgaW50byB0aGUgc2VuZCBldmVudFxyXG4gKi9cblxuXG5mdW5jdGlvbiByZXNwb25kKGV2ZW50LCBvcHRpb25zKSB7XG4gIHJldHVybiBzZW5kKGV2ZW50LCBfX2Fzc2lnbihfX2Fzc2lnbih7fSwgb3B0aW9ucyksIHtcbiAgICB0bzogZnVuY3Rpb24gKF8sIF9fLCBfYSkge1xuICAgICAgdmFyIF9ldmVudCA9IF9hLl9ldmVudDtcbiAgICAgIHJldHVybiBfZXZlbnQub3JpZ2luOyAvLyBUT0RPOiBoYW5kbGUgd2hlbiBfZXZlbnQub3JpZ2luIGlzIHVuZGVmaW5lZFxuICAgIH1cbiAgfSkpO1xufVxuXG52YXIgZGVmYXVsdExvZ0V4cHIgPSBmdW5jdGlvbiAoY29udGV4dCwgZXZlbnQpIHtcbiAgcmV0dXJuIHtcbiAgICBjb250ZXh0OiBjb250ZXh0LFxuICAgIGV2ZW50OiBldmVudFxuICB9O1xufTtcbi8qKlxyXG4gKlxyXG4gKiBAcGFyYW0gZXhwciBUaGUgZXhwcmVzc2lvbiBmdW5jdGlvbiB0byBldmFsdWF0ZSB3aGljaCB3aWxsIGJlIGxvZ2dlZC5cclxuICogIFRha2VzIGluIDIgYXJndW1lbnRzOlxyXG4gKiAgLSBgY3R4YCAtIHRoZSBjdXJyZW50IHN0YXRlIGNvbnRleHRcclxuICogIC0gYGV2ZW50YCAtIHRoZSBldmVudCB0aGF0IGNhdXNlZCB0aGlzIGFjdGlvbiB0byBiZSBleGVjdXRlZC5cclxuICogQHBhcmFtIGxhYmVsIFRoZSBsYWJlbCB0byBnaXZlIHRvIHRoZSBsb2dnZWQgZXhwcmVzc2lvbi5cclxuICovXG5cblxuZnVuY3Rpb24gbG9nKGV4cHIsIGxhYmVsKSB7XG4gIGlmIChleHByID09PSB2b2lkIDApIHtcbiAgICBleHByID0gZGVmYXVsdExvZ0V4cHI7XG4gIH1cblxuICByZXR1cm4ge1xuICAgIHR5cGU6IGxvZyQxLFxuICAgIGxhYmVsOiBsYWJlbCxcbiAgICBleHByOiBleHByXG4gIH07XG59XG5cbnZhciByZXNvbHZlTG9nID0gZnVuY3Rpb24gKGFjdGlvbiwgY3R4LCBfZXZlbnQpIHtcbiAgcmV0dXJuIF9fYXNzaWduKF9fYXNzaWduKHt9LCBhY3Rpb24pLCB7XG4gICAgdmFsdWU6IGlzU3RyaW5nKGFjdGlvbi5leHByKSA/IGFjdGlvbi5leHByIDogYWN0aW9uLmV4cHIoY3R4LCBfZXZlbnQuZGF0YSwge1xuICAgICAgX2V2ZW50OiBfZXZlbnRcbiAgICB9KVxuICB9KTtcbn07XG4vKipcclxuICogQ2FuY2VscyBhbiBpbi1mbGlnaHQgYHNlbmQoLi4uKWAgYWN0aW9uLiBBIGNhbmNlbGVkIHNlbnQgYWN0aW9uIHdpbGwgbm90XHJcbiAqIGJlIGV4ZWN1dGVkLCBub3Igd2lsbCBpdHMgZXZlbnQgYmUgc2VudCwgdW5sZXNzIGl0IGhhcyBhbHJlYWR5IGJlZW4gc2VudFxyXG4gKiAoZS5nLiwgaWYgYGNhbmNlbCguLi4pYCBpcyBjYWxsZWQgYWZ0ZXIgdGhlIGBzZW5kKC4uLilgIGFjdGlvbidzIGBkZWxheWApLlxyXG4gKlxyXG4gKiBAcGFyYW0gc2VuZElkIFRoZSBgaWRgIG9mIHRoZSBgc2VuZCguLi4pYCBhY3Rpb24gdG8gY2FuY2VsLlxyXG4gKi9cblxuXG52YXIgY2FuY2VsID0gZnVuY3Rpb24gKHNlbmRJZCkge1xuICByZXR1cm4ge1xuICAgIHR5cGU6IGNhbmNlbCQxLFxuICAgIHNlbmRJZDogc2VuZElkXG4gIH07XG59O1xuLyoqXHJcbiAqIFN0YXJ0cyBhbiBhY3Rpdml0eS5cclxuICpcclxuICogQHBhcmFtIGFjdGl2aXR5IFRoZSBhY3Rpdml0eSB0byBzdGFydC5cclxuICovXG5cblxuZnVuY3Rpb24gc3RhcnQoYWN0aXZpdHkpIHtcbiAgdmFyIGFjdGl2aXR5RGVmID0gdG9BY3Rpdml0eURlZmluaXRpb24oYWN0aXZpdHkpO1xuICByZXR1cm4ge1xuICAgIHR5cGU6IEFjdGlvblR5cGVzLlN0YXJ0LFxuICAgIGFjdGl2aXR5OiBhY3Rpdml0eURlZixcbiAgICBleGVjOiB1bmRlZmluZWRcbiAgfTtcbn1cbi8qKlxyXG4gKiBTdG9wcyBhbiBhY3Rpdml0eS5cclxuICpcclxuICogQHBhcmFtIGFjdG9yUmVmIFRoZSBhY3Rpdml0eSB0byBzdG9wLlxyXG4gKi9cblxuXG5mdW5jdGlvbiBzdG9wKGFjdG9yUmVmKSB7XG4gIHZhciBhY3Rpdml0eSA9IGlzRnVuY3Rpb24oYWN0b3JSZWYpID8gYWN0b3JSZWYgOiB0b0FjdGl2aXR5RGVmaW5pdGlvbihhY3RvclJlZik7XG4gIHJldHVybiB7XG4gICAgdHlwZTogQWN0aW9uVHlwZXMuU3RvcCxcbiAgICBhY3Rpdml0eTogYWN0aXZpdHksXG4gICAgZXhlYzogdW5kZWZpbmVkXG4gIH07XG59XG5cbmZ1bmN0aW9uIHJlc29sdmVTdG9wKGFjdGlvbiwgY29udGV4dCwgX2V2ZW50KSB7XG4gIHZhciBhY3RvclJlZk9yU3RyaW5nID0gaXNGdW5jdGlvbihhY3Rpb24uYWN0aXZpdHkpID8gYWN0aW9uLmFjdGl2aXR5KGNvbnRleHQsIF9ldmVudC5kYXRhKSA6IGFjdGlvbi5hY3Rpdml0eTtcbiAgdmFyIHJlc29sdmVkQWN0b3JSZWYgPSB0eXBlb2YgYWN0b3JSZWZPclN0cmluZyA9PT0gJ3N0cmluZycgPyB7XG4gICAgaWQ6IGFjdG9yUmVmT3JTdHJpbmdcbiAgfSA6IGFjdG9yUmVmT3JTdHJpbmc7XG4gIHZhciBhY3Rpb25PYmplY3QgPSB7XG4gICAgdHlwZTogQWN0aW9uVHlwZXMuU3RvcCxcbiAgICBhY3Rpdml0eTogcmVzb2x2ZWRBY3RvclJlZlxuICB9O1xuICByZXR1cm4gYWN0aW9uT2JqZWN0O1xufVxuLyoqXHJcbiAqIFVwZGF0ZXMgdGhlIGN1cnJlbnQgY29udGV4dCBvZiB0aGUgbWFjaGluZS5cclxuICpcclxuICogQHBhcmFtIGFzc2lnbm1lbnQgQW4gb2JqZWN0IHRoYXQgcmVwcmVzZW50cyB0aGUgcGFydGlhbCBjb250ZXh0IHRvIHVwZGF0ZS5cclxuICovXG5cblxudmFyIGFzc2lnbiA9IGZ1bmN0aW9uIChhc3NpZ25tZW50KSB7XG4gIHJldHVybiB7XG4gICAgdHlwZTogYXNzaWduJDEsXG4gICAgYXNzaWdubWVudDogYXNzaWdubWVudFxuICB9O1xufTtcbi8qKlxyXG4gKiBSZXR1cm5zIGFuIGV2ZW50IHR5cGUgdGhhdCByZXByZXNlbnRzIGFuIGltcGxpY2l0IGV2ZW50IHRoYXRcclxuICogaXMgc2VudCBhZnRlciB0aGUgc3BlY2lmaWVkIGBkZWxheWAuXHJcbiAqXHJcbiAqIEBwYXJhbSBkZWxheVJlZiBUaGUgZGVsYXkgaW4gbWlsbGlzZWNvbmRzXHJcbiAqIEBwYXJhbSBpZCBUaGUgc3RhdGUgbm9kZSBJRCB3aGVyZSB0aGlzIGV2ZW50IGlzIGhhbmRsZWRcclxuICovXG5cblxuZnVuY3Rpb24gYWZ0ZXIoZGVsYXlSZWYsIGlkKSB7XG4gIHZhciBpZFN1ZmZpeCA9IGlkID8gXCIjXCIgKyBpZCA6ICcnO1xuICByZXR1cm4gQWN0aW9uVHlwZXMuQWZ0ZXIgKyBcIihcIiArIGRlbGF5UmVmICsgXCIpXCIgKyBpZFN1ZmZpeDtcbn1cbi8qKlxyXG4gKiBSZXR1cm5zIGFuIGV2ZW50IHRoYXQgcmVwcmVzZW50cyB0aGF0IGEgZmluYWwgc3RhdGUgbm9kZVxyXG4gKiBoYXMgYmVlbiByZWFjaGVkIGluIHRoZSBwYXJlbnQgc3RhdGUgbm9kZS5cclxuICpcclxuICogQHBhcmFtIGlkIFRoZSBmaW5hbCBzdGF0ZSBub2RlJ3MgcGFyZW50IHN0YXRlIG5vZGUgYGlkYFxyXG4gKiBAcGFyYW0gZGF0YSBUaGUgZGF0YSB0byBwYXNzIGludG8gdGhlIGV2ZW50XHJcbiAqL1xuXG5cbmZ1bmN0aW9uIGRvbmUoaWQsIGRhdGEpIHtcbiAgdmFyIHR5cGUgPSBBY3Rpb25UeXBlcy5Eb25lU3RhdGUgKyBcIi5cIiArIGlkO1xuICB2YXIgZXZlbnRPYmplY3QgPSB7XG4gICAgdHlwZTogdHlwZSxcbiAgICBkYXRhOiBkYXRhXG4gIH07XG5cbiAgZXZlbnRPYmplY3QudG9TdHJpbmcgPSBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIHR5cGU7XG4gIH07XG5cbiAgcmV0dXJuIGV2ZW50T2JqZWN0O1xufVxuLyoqXHJcbiAqIFJldHVybnMgYW4gZXZlbnQgdGhhdCByZXByZXNlbnRzIHRoYXQgYW4gaW52b2tlZCBzZXJ2aWNlIGhhcyB0ZXJtaW5hdGVkLlxyXG4gKlxyXG4gKiBBbiBpbnZva2VkIHNlcnZpY2UgaXMgdGVybWluYXRlZCB3aGVuIGl0IGhhcyByZWFjaGVkIGEgdG9wLWxldmVsIGZpbmFsIHN0YXRlIG5vZGUsXHJcbiAqIGJ1dCBub3Qgd2hlbiBpdCBpcyBjYW5jZWxlZC5cclxuICpcclxuICogQHBhcmFtIGlkIFRoZSBmaW5hbCBzdGF0ZSBub2RlIElEXHJcbiAqIEBwYXJhbSBkYXRhIFRoZSBkYXRhIHRvIHBhc3MgaW50byB0aGUgZXZlbnRcclxuICovXG5cblxuZnVuY3Rpb24gZG9uZUludm9rZShpZCwgZGF0YSkge1xuICB2YXIgdHlwZSA9IEFjdGlvblR5cGVzLkRvbmVJbnZva2UgKyBcIi5cIiArIGlkO1xuICB2YXIgZXZlbnRPYmplY3QgPSB7XG4gICAgdHlwZTogdHlwZSxcbiAgICBkYXRhOiBkYXRhXG4gIH07XG5cbiAgZXZlbnRPYmplY3QudG9TdHJpbmcgPSBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIHR5cGU7XG4gIH07XG5cbiAgcmV0dXJuIGV2ZW50T2JqZWN0O1xufVxuXG5mdW5jdGlvbiBlcnJvcihpZCwgZGF0YSkge1xuICB2YXIgdHlwZSA9IEFjdGlvblR5cGVzLkVycm9yUGxhdGZvcm0gKyBcIi5cIiArIGlkO1xuICB2YXIgZXZlbnRPYmplY3QgPSB7XG4gICAgdHlwZTogdHlwZSxcbiAgICBkYXRhOiBkYXRhXG4gIH07XG5cbiAgZXZlbnRPYmplY3QudG9TdHJpbmcgPSBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIHR5cGU7XG4gIH07XG5cbiAgcmV0dXJuIGV2ZW50T2JqZWN0O1xufVxuXG5mdW5jdGlvbiBwdXJlKGdldEFjdGlvbnMpIHtcbiAgcmV0dXJuIHtcbiAgICB0eXBlOiBBY3Rpb25UeXBlcy5QdXJlLFxuICAgIGdldDogZ2V0QWN0aW9uc1xuICB9O1xufVxuLyoqXHJcbiAqIEZvcndhcmRzIChzZW5kcykgYW4gZXZlbnQgdG8gYSBzcGVjaWZpZWQgc2VydmljZS5cclxuICpcclxuICogQHBhcmFtIHRhcmdldCBUaGUgdGFyZ2V0IHNlcnZpY2UgdG8gZm9yd2FyZCB0aGUgZXZlbnQgdG8uXHJcbiAqIEBwYXJhbSBvcHRpb25zIE9wdGlvbnMgdG8gcGFzcyBpbnRvIHRoZSBzZW5kIGFjdGlvbiBjcmVhdG9yLlxyXG4gKi9cblxuXG5mdW5jdGlvbiBmb3J3YXJkVG8odGFyZ2V0LCBvcHRpb25zKSB7XG4gIHJldHVybiBzZW5kKGZ1bmN0aW9uIChfLCBldmVudCkge1xuICAgIHJldHVybiBldmVudDtcbiAgfSwgX19hc3NpZ24oX19hc3NpZ24oe30sIG9wdGlvbnMpLCB7XG4gICAgdG86IHRhcmdldFxuICB9KSk7XG59XG4vKipcclxuICogRXNjYWxhdGVzIGFuIGVycm9yIGJ5IHNlbmRpbmcgaXQgYXMgYW4gZXZlbnQgdG8gdGhpcyBtYWNoaW5lJ3MgcGFyZW50LlxyXG4gKlxyXG4gKiBAcGFyYW0gZXJyb3JEYXRhIFRoZSBlcnJvciBkYXRhIHRvIHNlbmQsIG9yIHRoZSBleHByZXNzaW9uIGZ1bmN0aW9uIHRoYXRcclxuICogdGFrZXMgaW4gdGhlIGBjb250ZXh0YCwgYGV2ZW50YCwgYW5kIGBtZXRhYCwgYW5kIHJldHVybnMgdGhlIGVycm9yIGRhdGEgdG8gc2VuZC5cclxuICogQHBhcmFtIG9wdGlvbnMgT3B0aW9ucyB0byBwYXNzIGludG8gdGhlIHNlbmQgYWN0aW9uIGNyZWF0b3IuXHJcbiAqL1xuXG5cbmZ1bmN0aW9uIGVzY2FsYXRlKGVycm9yRGF0YSwgb3B0aW9ucykge1xuICByZXR1cm4gc2VuZFBhcmVudChmdW5jdGlvbiAoY29udGV4dCwgZXZlbnQsIG1ldGEpIHtcbiAgICByZXR1cm4ge1xuICAgICAgdHlwZTogZXJyb3IkMSxcbiAgICAgIGRhdGE6IGlzRnVuY3Rpb24oZXJyb3JEYXRhKSA/IGVycm9yRGF0YShjb250ZXh0LCBldmVudCwgbWV0YSkgOiBlcnJvckRhdGFcbiAgICB9O1xuICB9LCBfX2Fzc2lnbihfX2Fzc2lnbih7fSwgb3B0aW9ucyksIHtcbiAgICB0bzogU3BlY2lhbFRhcmdldHMuUGFyZW50XG4gIH0pKTtcbn1cblxuZnVuY3Rpb24gY2hvb3NlKGNvbmRzKSB7XG4gIHJldHVybiB7XG4gICAgdHlwZTogQWN0aW9uVHlwZXMuQ2hvb3NlLFxuICAgIGNvbmRzOiBjb25kc1xuICB9O1xufVxuXG5mdW5jdGlvbiByZXNvbHZlQWN0aW9ucyhtYWNoaW5lLCBjdXJyZW50U3RhdGUsIGN1cnJlbnRDb250ZXh0LCBfZXZlbnQsIGFjdGlvbnMpIHtcbiAgdmFyIF9hID0gX19yZWFkKHBhcnRpdGlvbihhY3Rpb25zLCBmdW5jdGlvbiAoYWN0aW9uKSB7XG4gICAgcmV0dXJuIGFjdGlvbi50eXBlID09PSBhc3NpZ24kMTtcbiAgfSksIDIpLFxuICAgICAgYXNzaWduQWN0aW9ucyA9IF9hWzBdLFxuICAgICAgb3RoZXJBY3Rpb25zID0gX2FbMV07XG5cbiAgdmFyIHVwZGF0ZWRDb250ZXh0ID0gYXNzaWduQWN0aW9ucy5sZW5ndGggPyB1cGRhdGVDb250ZXh0KGN1cnJlbnRDb250ZXh0LCBfZXZlbnQsIGFzc2lnbkFjdGlvbnMsIGN1cnJlbnRTdGF0ZSkgOiBjdXJyZW50Q29udGV4dDtcbiAgdmFyIHJlc29sdmVkQWN0aW9ucyA9IGZsYXR0ZW4ob3RoZXJBY3Rpb25zLm1hcChmdW5jdGlvbiAoYWN0aW9uT2JqZWN0KSB7XG4gICAgdmFyIF9hO1xuXG4gICAgc3dpdGNoIChhY3Rpb25PYmplY3QudHlwZSkge1xuICAgICAgY2FzZSByYWlzZSQxOlxuICAgICAgICByZXR1cm4gcmVzb2x2ZVJhaXNlKGFjdGlvbk9iamVjdCk7XG5cbiAgICAgIGNhc2Ugc2VuZCQxOlxuICAgICAgICB2YXIgc2VuZEFjdGlvbiA9IHJlc29sdmVTZW5kKGFjdGlvbk9iamVjdCwgdXBkYXRlZENvbnRleHQsIF9ldmVudCwgbWFjaGluZS5vcHRpb25zLmRlbGF5cyk7IC8vIFRPRE86IGZpeCBBY3Rpb25UeXBlcy5Jbml0XG5cbiAgICAgICAgaWYgKCFJU19QUk9EVUNUSU9OKSB7XG4gICAgICAgICAgLy8gd2FybiBhZnRlciByZXNvbHZpbmcgYXMgd2UgY2FuIGNyZWF0ZSBiZXR0ZXIgY29udGV4dHVhbCBtZXNzYWdlIGhlcmVcbiAgICAgICAgICB3YXJuKCFpc1N0cmluZyhhY3Rpb25PYmplY3QuZGVsYXkpIHx8IHR5cGVvZiBzZW5kQWN0aW9uLmRlbGF5ID09PSAnbnVtYmVyJywgLy8gdHNsaW50OmRpc2FibGUtbmV4dC1saW5lOm1heC1saW5lLWxlbmd0aFxuICAgICAgICAgIFwiTm8gZGVsYXkgcmVmZXJlbmNlIGZvciBkZWxheSBleHByZXNzaW9uICdcIiArIGFjdGlvbk9iamVjdC5kZWxheSArIFwiJyB3YXMgZm91bmQgb24gbWFjaGluZSAnXCIgKyBtYWNoaW5lLmlkICsgXCInXCIpO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHNlbmRBY3Rpb247XG5cbiAgICAgIGNhc2UgbG9nJDE6XG4gICAgICAgIHJldHVybiByZXNvbHZlTG9nKGFjdGlvbk9iamVjdCwgdXBkYXRlZENvbnRleHQsIF9ldmVudCk7XG5cbiAgICAgIGNhc2UgY2hvb3NlJDE6XG4gICAgICAgIHtcbiAgICAgICAgICB2YXIgY2hvb3NlQWN0aW9uID0gYWN0aW9uT2JqZWN0O1xuICAgICAgICAgIHZhciBtYXRjaGVkQWN0aW9ucyA9IChfYSA9IGNob29zZUFjdGlvbi5jb25kcy5maW5kKGZ1bmN0aW9uIChjb25kaXRpb24pIHtcbiAgICAgICAgICAgIHZhciBndWFyZCA9IHRvR3VhcmQoY29uZGl0aW9uLmNvbmQsIG1hY2hpbmUub3B0aW9ucy5ndWFyZHMpO1xuICAgICAgICAgICAgcmV0dXJuICFndWFyZCB8fCBldmFsdWF0ZUd1YXJkKG1hY2hpbmUsIGd1YXJkLCB1cGRhdGVkQ29udGV4dCwgX2V2ZW50LCBjdXJyZW50U3RhdGUpO1xuICAgICAgICAgIH0pKSA9PT0gbnVsbCB8fCBfYSA9PT0gdm9pZCAwID8gdm9pZCAwIDogX2EuYWN0aW9ucztcblxuICAgICAgICAgIGlmICghbWF0Y2hlZEFjdGlvbnMpIHtcbiAgICAgICAgICAgIHJldHVybiBbXTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICB2YXIgcmVzb2x2ZWQgPSByZXNvbHZlQWN0aW9ucyhtYWNoaW5lLCBjdXJyZW50U3RhdGUsIHVwZGF0ZWRDb250ZXh0LCBfZXZlbnQsIHRvQWN0aW9uT2JqZWN0cyh0b0FycmF5KG1hdGNoZWRBY3Rpb25zKSwgbWFjaGluZS5vcHRpb25zLmFjdGlvbnMpKTtcbiAgICAgICAgICB1cGRhdGVkQ29udGV4dCA9IHJlc29sdmVkWzFdO1xuICAgICAgICAgIHJldHVybiByZXNvbHZlZFswXTtcbiAgICAgICAgfVxuXG4gICAgICBjYXNlIHB1cmUkMTpcbiAgICAgICAge1xuICAgICAgICAgIHZhciBtYXRjaGVkQWN0aW9ucyA9IGFjdGlvbk9iamVjdC5nZXQodXBkYXRlZENvbnRleHQsIF9ldmVudC5kYXRhKTtcblxuICAgICAgICAgIGlmICghbWF0Y2hlZEFjdGlvbnMpIHtcbiAgICAgICAgICAgIHJldHVybiBbXTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICB2YXIgcmVzb2x2ZWQgPSByZXNvbHZlQWN0aW9ucyhtYWNoaW5lLCBjdXJyZW50U3RhdGUsIHVwZGF0ZWRDb250ZXh0LCBfZXZlbnQsIHRvQWN0aW9uT2JqZWN0cyh0b0FycmF5KG1hdGNoZWRBY3Rpb25zKSwgbWFjaGluZS5vcHRpb25zLmFjdGlvbnMpKTtcbiAgICAgICAgICB1cGRhdGVkQ29udGV4dCA9IHJlc29sdmVkWzFdO1xuICAgICAgICAgIHJldHVybiByZXNvbHZlZFswXTtcbiAgICAgICAgfVxuXG4gICAgICBjYXNlIHN0b3AkMTpcbiAgICAgICAge1xuICAgICAgICAgIHJldHVybiByZXNvbHZlU3RvcChhY3Rpb25PYmplY3QsIHVwZGF0ZWRDb250ZXh0LCBfZXZlbnQpO1xuICAgICAgICB9XG5cbiAgICAgIGRlZmF1bHQ6XG4gICAgICAgIHJldHVybiB0b0FjdGlvbk9iamVjdChhY3Rpb25PYmplY3QsIG1hY2hpbmUub3B0aW9ucy5hY3Rpb25zKTtcbiAgICB9XG4gIH0pKTtcbiAgcmV0dXJuIFtyZXNvbHZlZEFjdGlvbnMsIHVwZGF0ZWRDb250ZXh0XTtcbn1cblxuZXhwb3J0IHsgYWZ0ZXIsIGFzc2lnbiwgY2FuY2VsLCBjaG9vc2UsIGRvbmUsIGRvbmVJbnZva2UsIGVycm9yLCBlc2NhbGF0ZSwgZm9yd2FyZFRvLCBnZXRBY3Rpb25GdW5jdGlvbiwgaW5pdEV2ZW50LCBsb2csIHB1cmUsIHJhaXNlLCByZXNvbHZlQWN0aW9ucywgcmVzb2x2ZUxvZywgcmVzb2x2ZVJhaXNlLCByZXNvbHZlU2VuZCwgcmVzb2x2ZVN0b3AsIHJlc3BvbmQsIHNlbmQsIHNlbmRQYXJlbnQsIHNlbmRVcGRhdGUsIHN0YXJ0LCBzdG9wLCB0b0FjdGlvbk9iamVjdCwgdG9BY3Rpb25PYmplY3RzLCB0b0FjdGl2aXR5RGVmaW5pdGlvbiB9OyIsImltcG9ydCB7IF9fdmFsdWVzLCBfX3NwcmVhZCB9IGZyb20gJy4vX3ZpcnR1YWwvX3RzbGliLmpzJztcbmltcG9ydCB7IGtleXMsIGZsYXR0ZW4gfSBmcm9tICcuL3V0aWxzLmpzJztcblxudmFyIGlzTGVhZk5vZGUgPSBmdW5jdGlvbiAoc3RhdGVOb2RlKSB7XG4gIHJldHVybiBzdGF0ZU5vZGUudHlwZSA9PT0gJ2F0b21pYycgfHwgc3RhdGVOb2RlLnR5cGUgPT09ICdmaW5hbCc7XG59O1xuXG5mdW5jdGlvbiBnZXRDaGlsZHJlbihzdGF0ZU5vZGUpIHtcbiAgcmV0dXJuIGtleXMoc3RhdGVOb2RlLnN0YXRlcykubWFwKGZ1bmN0aW9uIChrZXkpIHtcbiAgICByZXR1cm4gc3RhdGVOb2RlLnN0YXRlc1trZXldO1xuICB9KTtcbn1cblxuZnVuY3Rpb24gZ2V0QWxsU3RhdGVOb2RlcyhzdGF0ZU5vZGUpIHtcbiAgdmFyIHN0YXRlTm9kZXMgPSBbc3RhdGVOb2RlXTtcblxuICBpZiAoaXNMZWFmTm9kZShzdGF0ZU5vZGUpKSB7XG4gICAgcmV0dXJuIHN0YXRlTm9kZXM7XG4gIH1cblxuICByZXR1cm4gc3RhdGVOb2Rlcy5jb25jYXQoZmxhdHRlbihnZXRDaGlsZHJlbihzdGF0ZU5vZGUpLm1hcChnZXRBbGxTdGF0ZU5vZGVzKSkpO1xufVxuXG5mdW5jdGlvbiBnZXRDb25maWd1cmF0aW9uKHByZXZTdGF0ZU5vZGVzLCBzdGF0ZU5vZGVzKSB7XG4gIHZhciBlXzEsIF9hLCBlXzIsIF9iLCBlXzMsIF9jLCBlXzQsIF9kO1xuXG4gIHZhciBwcmV2Q29uZmlndXJhdGlvbiA9IG5ldyBTZXQocHJldlN0YXRlTm9kZXMpO1xuICB2YXIgcHJldkFkakxpc3QgPSBnZXRBZGpMaXN0KHByZXZDb25maWd1cmF0aW9uKTtcbiAgdmFyIGNvbmZpZ3VyYXRpb24gPSBuZXcgU2V0KHN0YXRlTm9kZXMpO1xuXG4gIHRyeSB7XG4gICAgLy8gYWRkIGFsbCBhbmNlc3RvcnNcbiAgICBmb3IgKHZhciBjb25maWd1cmF0aW9uXzEgPSBfX3ZhbHVlcyhjb25maWd1cmF0aW9uKSwgY29uZmlndXJhdGlvbl8xXzEgPSBjb25maWd1cmF0aW9uXzEubmV4dCgpOyAhY29uZmlndXJhdGlvbl8xXzEuZG9uZTsgY29uZmlndXJhdGlvbl8xXzEgPSBjb25maWd1cmF0aW9uXzEubmV4dCgpKSB7XG4gICAgICB2YXIgcyA9IGNvbmZpZ3VyYXRpb25fMV8xLnZhbHVlO1xuICAgICAgdmFyIG0gPSBzLnBhcmVudDtcblxuICAgICAgd2hpbGUgKG0gJiYgIWNvbmZpZ3VyYXRpb24uaGFzKG0pKSB7XG4gICAgICAgIGNvbmZpZ3VyYXRpb24uYWRkKG0pO1xuICAgICAgICBtID0gbS5wYXJlbnQ7XG4gICAgICB9XG4gICAgfVxuICB9IGNhdGNoIChlXzFfMSkge1xuICAgIGVfMSA9IHtcbiAgICAgIGVycm9yOiBlXzFfMVxuICAgIH07XG4gIH0gZmluYWxseSB7XG4gICAgdHJ5IHtcbiAgICAgIGlmIChjb25maWd1cmF0aW9uXzFfMSAmJiAhY29uZmlndXJhdGlvbl8xXzEuZG9uZSAmJiAoX2EgPSBjb25maWd1cmF0aW9uXzEucmV0dXJuKSkgX2EuY2FsbChjb25maWd1cmF0aW9uXzEpO1xuICAgIH0gZmluYWxseSB7XG4gICAgICBpZiAoZV8xKSB0aHJvdyBlXzEuZXJyb3I7XG4gICAgfVxuICB9XG5cbiAgdmFyIGFkakxpc3QgPSBnZXRBZGpMaXN0KGNvbmZpZ3VyYXRpb24pO1xuXG4gIHRyeSB7XG4gICAgLy8gYWRkIGRlc2NlbmRhbnRzXG4gICAgZm9yICh2YXIgY29uZmlndXJhdGlvbl8yID0gX192YWx1ZXMoY29uZmlndXJhdGlvbiksIGNvbmZpZ3VyYXRpb25fMl8xID0gY29uZmlndXJhdGlvbl8yLm5leHQoKTsgIWNvbmZpZ3VyYXRpb25fMl8xLmRvbmU7IGNvbmZpZ3VyYXRpb25fMl8xID0gY29uZmlndXJhdGlvbl8yLm5leHQoKSkge1xuICAgICAgdmFyIHMgPSBjb25maWd1cmF0aW9uXzJfMS52YWx1ZTsgLy8gaWYgcHJldmlvdXNseSBhY3RpdmUsIGFkZCBleGlzdGluZyBjaGlsZCBub2Rlc1xuXG4gICAgICBpZiAocy50eXBlID09PSAnY29tcG91bmQnICYmICghYWRqTGlzdC5nZXQocykgfHwgIWFkakxpc3QuZ2V0KHMpLmxlbmd0aCkpIHtcbiAgICAgICAgaWYgKHByZXZBZGpMaXN0LmdldChzKSkge1xuICAgICAgICAgIHByZXZBZGpMaXN0LmdldChzKS5mb3JFYWNoKGZ1bmN0aW9uIChzbikge1xuICAgICAgICAgICAgcmV0dXJuIGNvbmZpZ3VyYXRpb24uYWRkKHNuKTtcbiAgICAgICAgICB9KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBzLmluaXRpYWxTdGF0ZU5vZGVzLmZvckVhY2goZnVuY3Rpb24gKHNuKSB7XG4gICAgICAgICAgICByZXR1cm4gY29uZmlndXJhdGlvbi5hZGQoc24pO1xuICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBpZiAocy50eXBlID09PSAncGFyYWxsZWwnKSB7XG4gICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGZvciAodmFyIF9lID0gKGVfMyA9IHZvaWQgMCwgX192YWx1ZXMoZ2V0Q2hpbGRyZW4ocykpKSwgX2YgPSBfZS5uZXh0KCk7ICFfZi5kb25lOyBfZiA9IF9lLm5leHQoKSkge1xuICAgICAgICAgICAgICB2YXIgY2hpbGQgPSBfZi52YWx1ZTtcblxuICAgICAgICAgICAgICBpZiAoY2hpbGQudHlwZSA9PT0gJ2hpc3RvcnknKSB7XG4gICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICBpZiAoIWNvbmZpZ3VyYXRpb24uaGFzKGNoaWxkKSkge1xuICAgICAgICAgICAgICAgIGNvbmZpZ3VyYXRpb24uYWRkKGNoaWxkKTtcblxuICAgICAgICAgICAgICAgIGlmIChwcmV2QWRqTGlzdC5nZXQoY2hpbGQpKSB7XG4gICAgICAgICAgICAgICAgICBwcmV2QWRqTGlzdC5nZXQoY2hpbGQpLmZvckVhY2goZnVuY3Rpb24gKHNuKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBjb25maWd1cmF0aW9uLmFkZChzbik7XG4gICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgY2hpbGQuaW5pdGlhbFN0YXRlTm9kZXMuZm9yRWFjaChmdW5jdGlvbiAoc24pIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGNvbmZpZ3VyYXRpb24uYWRkKHNuKTtcbiAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgIH0gY2F0Y2ggKGVfM18xKSB7XG4gICAgICAgICAgICBlXzMgPSB7XG4gICAgICAgICAgICAgIGVycm9yOiBlXzNfMVxuICAgICAgICAgICAgfTtcbiAgICAgICAgICB9IGZpbmFsbHkge1xuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgaWYgKF9mICYmICFfZi5kb25lICYmIChfYyA9IF9lLnJldHVybikpIF9jLmNhbGwoX2UpO1xuICAgICAgICAgICAgfSBmaW5hbGx5IHtcbiAgICAgICAgICAgICAgaWYgKGVfMykgdGhyb3cgZV8zLmVycm9yO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfSBjYXRjaCAoZV8yXzEpIHtcbiAgICBlXzIgPSB7XG4gICAgICBlcnJvcjogZV8yXzFcbiAgICB9O1xuICB9IGZpbmFsbHkge1xuICAgIHRyeSB7XG4gICAgICBpZiAoY29uZmlndXJhdGlvbl8yXzEgJiYgIWNvbmZpZ3VyYXRpb25fMl8xLmRvbmUgJiYgKF9iID0gY29uZmlndXJhdGlvbl8yLnJldHVybikpIF9iLmNhbGwoY29uZmlndXJhdGlvbl8yKTtcbiAgICB9IGZpbmFsbHkge1xuICAgICAgaWYgKGVfMikgdGhyb3cgZV8yLmVycm9yO1xuICAgIH1cbiAgfVxuXG4gIHRyeSB7XG4gICAgLy8gYWRkIGFsbCBhbmNlc3RvcnNcbiAgICBmb3IgKHZhciBjb25maWd1cmF0aW9uXzMgPSBfX3ZhbHVlcyhjb25maWd1cmF0aW9uKSwgY29uZmlndXJhdGlvbl8zXzEgPSBjb25maWd1cmF0aW9uXzMubmV4dCgpOyAhY29uZmlndXJhdGlvbl8zXzEuZG9uZTsgY29uZmlndXJhdGlvbl8zXzEgPSBjb25maWd1cmF0aW9uXzMubmV4dCgpKSB7XG4gICAgICB2YXIgcyA9IGNvbmZpZ3VyYXRpb25fM18xLnZhbHVlO1xuICAgICAgdmFyIG0gPSBzLnBhcmVudDtcblxuICAgICAgd2hpbGUgKG0gJiYgIWNvbmZpZ3VyYXRpb24uaGFzKG0pKSB7XG4gICAgICAgIGNvbmZpZ3VyYXRpb24uYWRkKG0pO1xuICAgICAgICBtID0gbS5wYXJlbnQ7XG4gICAgICB9XG4gICAgfVxuICB9IGNhdGNoIChlXzRfMSkge1xuICAgIGVfNCA9IHtcbiAgICAgIGVycm9yOiBlXzRfMVxuICAgIH07XG4gIH0gZmluYWxseSB7XG4gICAgdHJ5IHtcbiAgICAgIGlmIChjb25maWd1cmF0aW9uXzNfMSAmJiAhY29uZmlndXJhdGlvbl8zXzEuZG9uZSAmJiAoX2QgPSBjb25maWd1cmF0aW9uXzMucmV0dXJuKSkgX2QuY2FsbChjb25maWd1cmF0aW9uXzMpO1xuICAgIH0gZmluYWxseSB7XG4gICAgICBpZiAoZV80KSB0aHJvdyBlXzQuZXJyb3I7XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIGNvbmZpZ3VyYXRpb247XG59XG5cbmZ1bmN0aW9uIGdldFZhbHVlRnJvbUFkaihiYXNlTm9kZSwgYWRqTGlzdCkge1xuICB2YXIgY2hpbGRTdGF0ZU5vZGVzID0gYWRqTGlzdC5nZXQoYmFzZU5vZGUpO1xuXG4gIGlmICghY2hpbGRTdGF0ZU5vZGVzKSB7XG4gICAgcmV0dXJuIHt9OyAvLyB0b2RvOiBmaXg/XG4gIH1cblxuICBpZiAoYmFzZU5vZGUudHlwZSA9PT0gJ2NvbXBvdW5kJykge1xuICAgIHZhciBjaGlsZFN0YXRlTm9kZSA9IGNoaWxkU3RhdGVOb2Rlc1swXTtcblxuICAgIGlmIChjaGlsZFN0YXRlTm9kZSkge1xuICAgICAgaWYgKGlzTGVhZk5vZGUoY2hpbGRTdGF0ZU5vZGUpKSB7XG4gICAgICAgIHJldHVybiBjaGlsZFN0YXRlTm9kZS5rZXk7XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiB7fTtcbiAgICB9XG4gIH1cblxuICB2YXIgc3RhdGVWYWx1ZSA9IHt9O1xuICBjaGlsZFN0YXRlTm9kZXMuZm9yRWFjaChmdW5jdGlvbiAoY3NuKSB7XG4gICAgc3RhdGVWYWx1ZVtjc24ua2V5XSA9IGdldFZhbHVlRnJvbUFkaihjc24sIGFkakxpc3QpO1xuICB9KTtcbiAgcmV0dXJuIHN0YXRlVmFsdWU7XG59XG5cbmZ1bmN0aW9uIGdldEFkakxpc3QoY29uZmlndXJhdGlvbikge1xuICB2YXIgZV81LCBfYTtcblxuICB2YXIgYWRqTGlzdCA9IG5ldyBNYXAoKTtcblxuICB0cnkge1xuICAgIGZvciAodmFyIGNvbmZpZ3VyYXRpb25fNCA9IF9fdmFsdWVzKGNvbmZpZ3VyYXRpb24pLCBjb25maWd1cmF0aW9uXzRfMSA9IGNvbmZpZ3VyYXRpb25fNC5uZXh0KCk7ICFjb25maWd1cmF0aW9uXzRfMS5kb25lOyBjb25maWd1cmF0aW9uXzRfMSA9IGNvbmZpZ3VyYXRpb25fNC5uZXh0KCkpIHtcbiAgICAgIHZhciBzID0gY29uZmlndXJhdGlvbl80XzEudmFsdWU7XG5cbiAgICAgIGlmICghYWRqTGlzdC5oYXMocykpIHtcbiAgICAgICAgYWRqTGlzdC5zZXQocywgW10pO1xuICAgICAgfVxuXG4gICAgICBpZiAocy5wYXJlbnQpIHtcbiAgICAgICAgaWYgKCFhZGpMaXN0LmhhcyhzLnBhcmVudCkpIHtcbiAgICAgICAgICBhZGpMaXN0LnNldChzLnBhcmVudCwgW10pO1xuICAgICAgICB9XG5cbiAgICAgICAgYWRqTGlzdC5nZXQocy5wYXJlbnQpLnB1c2gocyk7XG4gICAgICB9XG4gICAgfVxuICB9IGNhdGNoIChlXzVfMSkge1xuICAgIGVfNSA9IHtcbiAgICAgIGVycm9yOiBlXzVfMVxuICAgIH07XG4gIH0gZmluYWxseSB7XG4gICAgdHJ5IHtcbiAgICAgIGlmIChjb25maWd1cmF0aW9uXzRfMSAmJiAhY29uZmlndXJhdGlvbl80XzEuZG9uZSAmJiAoX2EgPSBjb25maWd1cmF0aW9uXzQucmV0dXJuKSkgX2EuY2FsbChjb25maWd1cmF0aW9uXzQpO1xuICAgIH0gZmluYWxseSB7XG4gICAgICBpZiAoZV81KSB0aHJvdyBlXzUuZXJyb3I7XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIGFkakxpc3Q7XG59XG5cbmZ1bmN0aW9uIGdldFZhbHVlKHJvb3ROb2RlLCBjb25maWd1cmF0aW9uKSB7XG4gIHZhciBjb25maWcgPSBnZXRDb25maWd1cmF0aW9uKFtyb290Tm9kZV0sIGNvbmZpZ3VyYXRpb24pO1xuICByZXR1cm4gZ2V0VmFsdWVGcm9tQWRqKHJvb3ROb2RlLCBnZXRBZGpMaXN0KGNvbmZpZykpO1xufVxuXG5mdW5jdGlvbiBoYXMoaXRlcmFibGUsIGl0ZW0pIHtcbiAgaWYgKEFycmF5LmlzQXJyYXkoaXRlcmFibGUpKSB7XG4gICAgcmV0dXJuIGl0ZXJhYmxlLnNvbWUoZnVuY3Rpb24gKG1lbWJlcikge1xuICAgICAgcmV0dXJuIG1lbWJlciA9PT0gaXRlbTtcbiAgICB9KTtcbiAgfVxuXG4gIGlmIChpdGVyYWJsZSBpbnN0YW5jZW9mIFNldCkge1xuICAgIHJldHVybiBpdGVyYWJsZS5oYXMoaXRlbSk7XG4gIH1cblxuICByZXR1cm4gZmFsc2U7IC8vIFRPRE86IGZpeFxufVxuXG5mdW5jdGlvbiBuZXh0RXZlbnRzKGNvbmZpZ3VyYXRpb24pIHtcbiAgcmV0dXJuIGZsYXR0ZW4oX19zcHJlYWQobmV3IFNldChjb25maWd1cmF0aW9uLm1hcChmdW5jdGlvbiAoc24pIHtcbiAgICByZXR1cm4gc24ub3duRXZlbnRzO1xuICB9KSkpKTtcbn1cblxuZnVuY3Rpb24gaXNJbkZpbmFsU3RhdGUoY29uZmlndXJhdGlvbiwgc3RhdGVOb2RlKSB7XG4gIGlmIChzdGF0ZU5vZGUudHlwZSA9PT0gJ2NvbXBvdW5kJykge1xuICAgIHJldHVybiBnZXRDaGlsZHJlbihzdGF0ZU5vZGUpLnNvbWUoZnVuY3Rpb24gKHMpIHtcbiAgICAgIHJldHVybiBzLnR5cGUgPT09ICdmaW5hbCcgJiYgaGFzKGNvbmZpZ3VyYXRpb24sIHMpO1xuICAgIH0pO1xuICB9XG5cbiAgaWYgKHN0YXRlTm9kZS50eXBlID09PSAncGFyYWxsZWwnKSB7XG4gICAgcmV0dXJuIGdldENoaWxkcmVuKHN0YXRlTm9kZSkuZXZlcnkoZnVuY3Rpb24gKHNuKSB7XG4gICAgICByZXR1cm4gaXNJbkZpbmFsU3RhdGUoY29uZmlndXJhdGlvbiwgc24pO1xuICAgIH0pO1xuICB9XG5cbiAgcmV0dXJuIGZhbHNlO1xufVxuXG5leHBvcnQgeyBnZXRBZGpMaXN0LCBnZXRBbGxTdGF0ZU5vZGVzLCBnZXRDaGlsZHJlbiwgZ2V0Q29uZmlndXJhdGlvbiwgZ2V0VmFsdWUsIGhhcywgaXNJbkZpbmFsU3RhdGUsIGlzTGVhZk5vZGUsIG5leHRFdmVudHMgfTsiLCJpbXBvcnQgeyBfX3NwcmVhZCwgX19yZXN0LCBfX2Fzc2lnbiB9IGZyb20gJy4vX3ZpcnR1YWwvX3RzbGliLmpzJztcbmltcG9ydCB7IEVNUFRZX0FDVElWSVRZX01BUCB9IGZyb20gJy4vY29uc3RhbnRzLmpzJztcbmltcG9ydCB7IGlzU3RyaW5nLCBtYXRjaGVzU3RhdGUsIGtleXMgfSBmcm9tICcuL3V0aWxzLmpzJztcbmltcG9ydCB7IG5leHRFdmVudHMgfSBmcm9tICcuL3N0YXRlVXRpbHMuanMnO1xuaW1wb3J0IHsgaW5pdEV2ZW50IH0gZnJvbSAnLi9hY3Rpb25zLmpzJztcblxuZnVuY3Rpb24gc3RhdGVWYWx1ZXNFcXVhbChhLCBiKSB7XG4gIGlmIChhID09PSBiKSB7XG4gICAgcmV0dXJuIHRydWU7XG4gIH1cblxuICBpZiAoYSA9PT0gdW5kZWZpbmVkIHx8IGIgPT09IHVuZGVmaW5lZCkge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIGlmIChpc1N0cmluZyhhKSB8fCBpc1N0cmluZyhiKSkge1xuICAgIHJldHVybiBhID09PSBiO1xuICB9XG5cbiAgdmFyIGFLZXlzID0ga2V5cyhhKTtcbiAgdmFyIGJLZXlzID0ga2V5cyhiKTtcbiAgcmV0dXJuIGFLZXlzLmxlbmd0aCA9PT0gYktleXMubGVuZ3RoICYmIGFLZXlzLmV2ZXJ5KGZ1bmN0aW9uIChrZXkpIHtcbiAgICByZXR1cm4gc3RhdGVWYWx1ZXNFcXVhbChhW2tleV0sIGJba2V5XSk7XG4gIH0pO1xufVxuXG5mdW5jdGlvbiBpc1N0YXRlKHN0YXRlKSB7XG4gIGlmIChpc1N0cmluZyhzdGF0ZSkpIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICByZXR1cm4gJ3ZhbHVlJyBpbiBzdGF0ZSAmJiAnaGlzdG9yeScgaW4gc3RhdGU7XG59XG5cbmZ1bmN0aW9uIGJpbmRBY3Rpb25Ub1N0YXRlKGFjdGlvbiwgc3RhdGUpIHtcbiAgdmFyIGV4ZWMgPSBhY3Rpb24uZXhlYztcblxuICB2YXIgYm91bmRBY3Rpb24gPSBfX2Fzc2lnbihfX2Fzc2lnbih7fSwgYWN0aW9uKSwge1xuICAgIGV4ZWM6IGV4ZWMgIT09IHVuZGVmaW5lZCA/IGZ1bmN0aW9uICgpIHtcbiAgICAgIHJldHVybiBleGVjKHN0YXRlLmNvbnRleHQsIHN0YXRlLmV2ZW50LCB7XG4gICAgICAgIGFjdGlvbjogYWN0aW9uLFxuICAgICAgICBzdGF0ZTogc3RhdGUsXG4gICAgICAgIF9ldmVudDogc3RhdGUuX2V2ZW50XG4gICAgICB9KTtcbiAgICB9IDogdW5kZWZpbmVkXG4gIH0pO1xuXG4gIHJldHVybiBib3VuZEFjdGlvbjtcbn1cblxudmFyIFN0YXRlID1cbi8qI19fUFVSRV9fKi9cblxuLyoqIEBjbGFzcyAqL1xuZnVuY3Rpb24gKCkge1xuICAvKipcclxuICAgKiBDcmVhdGVzIGEgbmV3IFN0YXRlIGluc3RhbmNlLlxyXG4gICAqIEBwYXJhbSB2YWx1ZSBUaGUgc3RhdGUgdmFsdWVcclxuICAgKiBAcGFyYW0gY29udGV4dCBUaGUgZXh0ZW5kZWQgc3RhdGVcclxuICAgKiBAcGFyYW0gaGlzdG9yeVZhbHVlIFRoZSB0cmVlIHJlcHJlc2VudGluZyBoaXN0b3JpY2FsIHZhbHVlcyBvZiB0aGUgc3RhdGUgbm9kZXNcclxuICAgKiBAcGFyYW0gaGlzdG9yeSBUaGUgcHJldmlvdXMgc3RhdGVcclxuICAgKiBAcGFyYW0gYWN0aW9ucyBBbiBhcnJheSBvZiBhY3Rpb24gb2JqZWN0cyB0byBleGVjdXRlIGFzIHNpZGUtZWZmZWN0c1xyXG4gICAqIEBwYXJhbSBhY3Rpdml0aWVzIEEgbWFwcGluZyBvZiBhY3Rpdml0aWVzIGFuZCB3aGV0aGVyIHRoZXkgYXJlIHN0YXJ0ZWQgKGB0cnVlYCkgb3Igc3RvcHBlZCAoYGZhbHNlYCkuXHJcbiAgICogQHBhcmFtIG1ldGFcclxuICAgKiBAcGFyYW0gZXZlbnRzIEludGVybmFsIGV2ZW50IHF1ZXVlLiBTaG91bGQgYmUgZW1wdHkgd2l0aCBydW4tdG8tY29tcGxldGlvbiBzZW1hbnRpY3MuXHJcbiAgICogQHBhcmFtIGNvbmZpZ3VyYXRpb25cclxuICAgKi9cbiAgZnVuY3Rpb24gU3RhdGUoY29uZmlnKSB7XG4gICAgdmFyIF90aGlzID0gdGhpcztcblxuICAgIHRoaXMuYWN0aW9ucyA9IFtdO1xuICAgIHRoaXMuYWN0aXZpdGllcyA9IEVNUFRZX0FDVElWSVRZX01BUDtcbiAgICB0aGlzLm1ldGEgPSB7fTtcbiAgICB0aGlzLmV2ZW50cyA9IFtdO1xuICAgIHRoaXMudmFsdWUgPSBjb25maWcudmFsdWU7XG4gICAgdGhpcy5jb250ZXh0ID0gY29uZmlnLmNvbnRleHQ7XG4gICAgdGhpcy5fZXZlbnQgPSBjb25maWcuX2V2ZW50O1xuICAgIHRoaXMuX3Nlc3Npb25pZCA9IGNvbmZpZy5fc2Vzc2lvbmlkO1xuICAgIHRoaXMuZXZlbnQgPSB0aGlzLl9ldmVudC5kYXRhO1xuICAgIHRoaXMuaGlzdG9yeVZhbHVlID0gY29uZmlnLmhpc3RvcnlWYWx1ZTtcbiAgICB0aGlzLmhpc3RvcnkgPSBjb25maWcuaGlzdG9yeTtcbiAgICB0aGlzLmFjdGlvbnMgPSBjb25maWcuYWN0aW9ucyB8fCBbXTtcbiAgICB0aGlzLmFjdGl2aXRpZXMgPSBjb25maWcuYWN0aXZpdGllcyB8fCBFTVBUWV9BQ1RJVklUWV9NQVA7XG4gICAgdGhpcy5tZXRhID0gY29uZmlnLm1ldGEgfHwge307XG4gICAgdGhpcy5ldmVudHMgPSBjb25maWcuZXZlbnRzIHx8IFtdO1xuICAgIHRoaXMubWF0Y2hlcyA9IHRoaXMubWF0Y2hlcy5iaW5kKHRoaXMpO1xuICAgIHRoaXMudG9TdHJpbmdzID0gdGhpcy50b1N0cmluZ3MuYmluZCh0aGlzKTtcbiAgICB0aGlzLmNvbmZpZ3VyYXRpb24gPSBjb25maWcuY29uZmlndXJhdGlvbjtcbiAgICB0aGlzLnRyYW5zaXRpb25zID0gY29uZmlnLnRyYW5zaXRpb25zO1xuICAgIHRoaXMuY2hpbGRyZW4gPSBjb25maWcuY2hpbGRyZW47XG4gICAgdGhpcy5kb25lID0gISFjb25maWcuZG9uZTtcbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkodGhpcywgJ25leHRFdmVudHMnLCB7XG4gICAgICBnZXQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmV0dXJuIG5leHRFdmVudHMoX3RoaXMuY29uZmlndXJhdGlvbik7XG4gICAgICB9XG4gICAgfSk7XG4gIH1cbiAgLyoqXHJcbiAgICogQ3JlYXRlcyBhIG5ldyBTdGF0ZSBpbnN0YW5jZSBmb3IgdGhlIGdpdmVuIGBzdGF0ZVZhbHVlYCBhbmQgYGNvbnRleHRgLlxyXG4gICAqIEBwYXJhbSBzdGF0ZVZhbHVlXHJcbiAgICogQHBhcmFtIGNvbnRleHRcclxuICAgKi9cblxuXG4gIFN0YXRlLmZyb20gPSBmdW5jdGlvbiAoc3RhdGVWYWx1ZSwgY29udGV4dCkge1xuICAgIGlmIChzdGF0ZVZhbHVlIGluc3RhbmNlb2YgU3RhdGUpIHtcbiAgICAgIGlmIChzdGF0ZVZhbHVlLmNvbnRleHQgIT09IGNvbnRleHQpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBTdGF0ZSh7XG4gICAgICAgICAgdmFsdWU6IHN0YXRlVmFsdWUudmFsdWUsXG4gICAgICAgICAgY29udGV4dDogY29udGV4dCxcbiAgICAgICAgICBfZXZlbnQ6IHN0YXRlVmFsdWUuX2V2ZW50LFxuICAgICAgICAgIF9zZXNzaW9uaWQ6IG51bGwsXG4gICAgICAgICAgaGlzdG9yeVZhbHVlOiBzdGF0ZVZhbHVlLmhpc3RvcnlWYWx1ZSxcbiAgICAgICAgICBoaXN0b3J5OiBzdGF0ZVZhbHVlLmhpc3RvcnksXG4gICAgICAgICAgYWN0aW9uczogW10sXG4gICAgICAgICAgYWN0aXZpdGllczogc3RhdGVWYWx1ZS5hY3Rpdml0aWVzLFxuICAgICAgICAgIG1ldGE6IHt9LFxuICAgICAgICAgIGV2ZW50czogW10sXG4gICAgICAgICAgY29uZmlndXJhdGlvbjogW10sXG4gICAgICAgICAgdHJhbnNpdGlvbnM6IFtdLFxuICAgICAgICAgIGNoaWxkcmVuOiB7fVxuICAgICAgICB9KTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHN0YXRlVmFsdWU7XG4gICAgfVxuXG4gICAgdmFyIF9ldmVudCA9IGluaXRFdmVudDtcbiAgICByZXR1cm4gbmV3IFN0YXRlKHtcbiAgICAgIHZhbHVlOiBzdGF0ZVZhbHVlLFxuICAgICAgY29udGV4dDogY29udGV4dCxcbiAgICAgIF9ldmVudDogX2V2ZW50LFxuICAgICAgX3Nlc3Npb25pZDogbnVsbCxcbiAgICAgIGhpc3RvcnlWYWx1ZTogdW5kZWZpbmVkLFxuICAgICAgaGlzdG9yeTogdW5kZWZpbmVkLFxuICAgICAgYWN0aW9uczogW10sXG4gICAgICBhY3Rpdml0aWVzOiB1bmRlZmluZWQsXG4gICAgICBtZXRhOiB1bmRlZmluZWQsXG4gICAgICBldmVudHM6IFtdLFxuICAgICAgY29uZmlndXJhdGlvbjogW10sXG4gICAgICB0cmFuc2l0aW9uczogW10sXG4gICAgICBjaGlsZHJlbjoge31cbiAgICB9KTtcbiAgfTtcbiAgLyoqXHJcbiAgICogQ3JlYXRlcyBhIG5ldyBTdGF0ZSBpbnN0YW5jZSBmb3IgdGhlIGdpdmVuIGBjb25maWdgLlxyXG4gICAqIEBwYXJhbSBjb25maWcgVGhlIHN0YXRlIGNvbmZpZ1xyXG4gICAqL1xuXG5cbiAgU3RhdGUuY3JlYXRlID0gZnVuY3Rpb24gKGNvbmZpZykge1xuICAgIHJldHVybiBuZXcgU3RhdGUoY29uZmlnKTtcbiAgfTtcbiAgLyoqXHJcbiAgICogQ3JlYXRlcyBhIG5ldyBgU3RhdGVgIGluc3RhbmNlIGZvciB0aGUgZ2l2ZW4gYHN0YXRlVmFsdWVgIGFuZCBgY29udGV4dGAgd2l0aCBubyBhY3Rpb25zIChzaWRlLWVmZmVjdHMpLlxyXG4gICAqIEBwYXJhbSBzdGF0ZVZhbHVlXHJcbiAgICogQHBhcmFtIGNvbnRleHRcclxuICAgKi9cblxuXG4gIFN0YXRlLmluZXJ0ID0gZnVuY3Rpb24gKHN0YXRlVmFsdWUsIGNvbnRleHQpIHtcbiAgICBpZiAoc3RhdGVWYWx1ZSBpbnN0YW5jZW9mIFN0YXRlKSB7XG4gICAgICBpZiAoIXN0YXRlVmFsdWUuYWN0aW9ucy5sZW5ndGgpIHtcbiAgICAgICAgcmV0dXJuIHN0YXRlVmFsdWU7XG4gICAgICB9XG5cbiAgICAgIHZhciBfZXZlbnQgPSBpbml0RXZlbnQ7XG4gICAgICByZXR1cm4gbmV3IFN0YXRlKHtcbiAgICAgICAgdmFsdWU6IHN0YXRlVmFsdWUudmFsdWUsXG4gICAgICAgIGNvbnRleHQ6IGNvbnRleHQsXG4gICAgICAgIF9ldmVudDogX2V2ZW50LFxuICAgICAgICBfc2Vzc2lvbmlkOiBudWxsLFxuICAgICAgICBoaXN0b3J5VmFsdWU6IHN0YXRlVmFsdWUuaGlzdG9yeVZhbHVlLFxuICAgICAgICBoaXN0b3J5OiBzdGF0ZVZhbHVlLmhpc3RvcnksXG4gICAgICAgIGFjdGl2aXRpZXM6IHN0YXRlVmFsdWUuYWN0aXZpdGllcyxcbiAgICAgICAgY29uZmlndXJhdGlvbjogc3RhdGVWYWx1ZS5jb25maWd1cmF0aW9uLFxuICAgICAgICB0cmFuc2l0aW9uczogW10sXG4gICAgICAgIGNoaWxkcmVuOiB7fVxuICAgICAgfSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIFN0YXRlLmZyb20oc3RhdGVWYWx1ZSwgY29udGV4dCk7XG4gIH07XG4gIC8qKlxyXG4gICAqIFJldHVybnMgYW4gYXJyYXkgb2YgYWxsIHRoZSBzdHJpbmcgbGVhZiBzdGF0ZSBub2RlIHBhdGhzLlxyXG4gICAqIEBwYXJhbSBzdGF0ZVZhbHVlXHJcbiAgICogQHBhcmFtIGRlbGltaXRlciBUaGUgY2hhcmFjdGVyKHMpIHRoYXQgc2VwYXJhdGUgZWFjaCBzdWJwYXRoIGluIHRoZSBzdHJpbmcgc3RhdGUgbm9kZSBwYXRoLlxyXG4gICAqL1xuXG5cbiAgU3RhdGUucHJvdG90eXBlLnRvU3RyaW5ncyA9IGZ1bmN0aW9uIChzdGF0ZVZhbHVlLCBkZWxpbWl0ZXIpIHtcbiAgICB2YXIgX3RoaXMgPSB0aGlzO1xuXG4gICAgaWYgKHN0YXRlVmFsdWUgPT09IHZvaWQgMCkge1xuICAgICAgc3RhdGVWYWx1ZSA9IHRoaXMudmFsdWU7XG4gICAgfVxuXG4gICAgaWYgKGRlbGltaXRlciA9PT0gdm9pZCAwKSB7XG4gICAgICBkZWxpbWl0ZXIgPSAnLic7XG4gICAgfVxuXG4gICAgaWYgKGlzU3RyaW5nKHN0YXRlVmFsdWUpKSB7XG4gICAgICByZXR1cm4gW3N0YXRlVmFsdWVdO1xuICAgIH1cblxuICAgIHZhciB2YWx1ZUtleXMgPSBrZXlzKHN0YXRlVmFsdWUpO1xuICAgIHJldHVybiB2YWx1ZUtleXMuY29uY2F0LmFwcGx5KHZhbHVlS2V5cywgX19zcHJlYWQodmFsdWVLZXlzLm1hcChmdW5jdGlvbiAoa2V5KSB7XG4gICAgICByZXR1cm4gX3RoaXMudG9TdHJpbmdzKHN0YXRlVmFsdWVba2V5XSwgZGVsaW1pdGVyKS5tYXAoZnVuY3Rpb24gKHMpIHtcbiAgICAgICAgcmV0dXJuIGtleSArIGRlbGltaXRlciArIHM7XG4gICAgICB9KTtcbiAgICB9KSkpO1xuICB9O1xuXG4gIFN0YXRlLnByb3RvdHlwZS50b0pTT04gPSBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIF9hID0gdGhpcyxcbiAgICAgICAgY29uZmlndXJhdGlvbiA9IF9hLmNvbmZpZ3VyYXRpb24sXG4gICAgICAgIHRyYW5zaXRpb25zID0gX2EudHJhbnNpdGlvbnMsXG4gICAgICAgIGpzb25WYWx1ZXMgPSBfX3Jlc3QoX2EsIFtcImNvbmZpZ3VyYXRpb25cIiwgXCJ0cmFuc2l0aW9uc1wiXSk7XG5cbiAgICByZXR1cm4ganNvblZhbHVlcztcbiAgfTtcbiAgLyoqXHJcbiAgICogV2hldGhlciB0aGUgY3VycmVudCBzdGF0ZSB2YWx1ZSBpcyBhIHN1YnNldCBvZiB0aGUgZ2l2ZW4gcGFyZW50IHN0YXRlIHZhbHVlLlxyXG4gICAqIEBwYXJhbSBwYXJlbnRTdGF0ZVZhbHVlXHJcbiAgICovXG5cblxuICBTdGF0ZS5wcm90b3R5cGUubWF0Y2hlcyA9IGZ1bmN0aW9uIChwYXJlbnRTdGF0ZVZhbHVlKSB7XG4gICAgcmV0dXJuIG1hdGNoZXNTdGF0ZShwYXJlbnRTdGF0ZVZhbHVlLCB0aGlzLnZhbHVlKTtcbiAgfTtcblxuICByZXR1cm4gU3RhdGU7XG59KCk7XG5cbmV4cG9ydCB7IFN0YXRlLCBiaW5kQWN0aW9uVG9TdGF0ZSwgaXNTdGF0ZSwgc3RhdGVWYWx1ZXNFcXVhbCB9OyIsIi8qKlxyXG4gKiBNYWludGFpbnMgYSBzdGFjayBvZiB0aGUgY3VycmVudCBzZXJ2aWNlIGluIHNjb3BlLlxyXG4gKiBUaGlzIGlzIHVzZWQgdG8gcHJvdmlkZSB0aGUgY29ycmVjdCBzZXJ2aWNlIHRvIHNwYXduKCkuXHJcbiAqL1xudmFyIHNlcnZpY2VTdGFjayA9IFtdO1xuXG52YXIgcHJvdmlkZSA9IGZ1bmN0aW9uIChzZXJ2aWNlLCBmbikge1xuICBzZXJ2aWNlU3RhY2sucHVzaChzZXJ2aWNlKTtcbiAgdmFyIHJlc3VsdCA9IGZuKHNlcnZpY2UpO1xuICBzZXJ2aWNlU3RhY2sucG9wKCk7XG4gIHJldHVybiByZXN1bHQ7XG59O1xuXG52YXIgY29uc3VtZSA9IGZ1bmN0aW9uIChmbikge1xuICByZXR1cm4gZm4oc2VydmljZVN0YWNrW3NlcnZpY2VTdGFjay5sZW5ndGggLSAxXSk7XG59O1xuXG5leHBvcnQgeyBjb25zdW1lLCBwcm92aWRlIH07IiwiaW1wb3J0IHsgdG9JbnZva2VTb3VyY2UsIG1hcENvbnRleHQsIGlzTWFjaGluZSB9IGZyb20gJy4vdXRpbHMuanMnO1xuaW1wb3J0IHsgcHJvdmlkZSB9IGZyb20gJy4vc2VydmljZVNjb3BlLmpzJztcblxuZnVuY3Rpb24gY3JlYXRlTnVsbEFjdG9yKGlkKSB7XG4gIHJldHVybiB7XG4gICAgaWQ6IGlkLFxuICAgIHNlbmQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgIHJldHVybiB2b2lkIDA7XG4gICAgfSxcbiAgICBzdWJzY3JpYmU6IGZ1bmN0aW9uICgpIHtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIHVuc3Vic2NyaWJlOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgcmV0dXJuIHZvaWQgMDtcbiAgICAgICAgfVxuICAgICAgfTtcbiAgICB9LFxuICAgIHRvSlNPTjogZnVuY3Rpb24gKCkge1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgaWQ6IGlkXG4gICAgICB9O1xuICAgIH1cbiAgfTtcbn1cbi8qKlxyXG4gKiBDcmVhdGVzIGEgZGVmZXJyZWQgYWN0b3IgdGhhdCBpcyBhYmxlIHRvIGJlIGludm9rZWQgZ2l2ZW4gdGhlIHByb3ZpZGVkXHJcbiAqIGludm9jYXRpb24gaW5mb3JtYXRpb24gaW4gaXRzIGAubWV0YWAgdmFsdWUuXHJcbiAqXHJcbiAqIEBwYXJhbSBpbnZva2VEZWZpbml0aW9uIFRoZSBtZXRhIGluZm9ybWF0aW9uIG5lZWRlZCB0byBpbnZva2UgdGhlIGFjdG9yLlxyXG4gKi9cblxuXG5mdW5jdGlvbiBjcmVhdGVJbnZvY2FibGVBY3RvcihpbnZva2VEZWZpbml0aW9uLCBtYWNoaW5lLCBjb250ZXh0LCBfZXZlbnQpIHtcbiAgdmFyIF9hO1xuXG4gIHZhciBpbnZva2VTcmMgPSB0b0ludm9rZVNvdXJjZShpbnZva2VEZWZpbml0aW9uLnNyYyk7XG4gIHZhciBzZXJ2aWNlQ3JlYXRvciA9IChfYSA9IG1hY2hpbmUgPT09IG51bGwgfHwgbWFjaGluZSA9PT0gdm9pZCAwID8gdm9pZCAwIDogbWFjaGluZS5vcHRpb25zLnNlcnZpY2VzKSA9PT0gbnVsbCB8fCBfYSA9PT0gdm9pZCAwID8gdm9pZCAwIDogX2FbaW52b2tlU3JjLnR5cGVdO1xuICB2YXIgcmVzb2x2ZWREYXRhID0gaW52b2tlRGVmaW5pdGlvbi5kYXRhID8gbWFwQ29udGV4dChpbnZva2VEZWZpbml0aW9uLmRhdGEsIGNvbnRleHQsIF9ldmVudCkgOiB1bmRlZmluZWQ7XG4gIHZhciB0ZW1wQWN0b3IgPSBzZXJ2aWNlQ3JlYXRvciA/IGNyZWF0ZURlZmVycmVkQWN0b3Ioc2VydmljZUNyZWF0b3IsIGludm9rZURlZmluaXRpb24uaWQsIHJlc29sdmVkRGF0YSkgOiBjcmVhdGVOdWxsQWN0b3IoaW52b2tlRGVmaW5pdGlvbi5pZCk7XG4gIHRlbXBBY3Rvci5tZXRhID0gaW52b2tlRGVmaW5pdGlvbjtcbiAgcmV0dXJuIHRlbXBBY3Rvcjtcbn1cblxuZnVuY3Rpb24gY3JlYXRlRGVmZXJyZWRBY3RvcihlbnRpdHksIGlkLCBkYXRhKSB7XG4gIHZhciB0ZW1wQWN0b3IgPSBjcmVhdGVOdWxsQWN0b3IoaWQpO1xuICB0ZW1wQWN0b3IuZGVmZXJyZWQgPSB0cnVlO1xuXG4gIGlmIChpc01hY2hpbmUoZW50aXR5KSkge1xuICAgIC8vIFwibXV0ZVwiIHRoZSBleGlzdGluZyBzZXJ2aWNlIHNjb3BlIHNvIHBvdGVudGlhbCBzcGF3bmVkIGFjdG9ycyB3aXRoaW4gdGhlIGAuaW5pdGlhbFN0YXRlYCBzdGF5IGRlZmVycmVkIGhlcmVcbiAgICB0ZW1wQWN0b3Iuc3RhdGUgPSBwcm92aWRlKHVuZGVmaW5lZCwgZnVuY3Rpb24gKCkge1xuICAgICAgcmV0dXJuIChkYXRhID8gZW50aXR5LndpdGhDb250ZXh0KGRhdGEpIDogZW50aXR5KS5pbml0aWFsU3RhdGU7XG4gICAgfSk7XG4gIH1cblxuICByZXR1cm4gdGVtcEFjdG9yO1xufVxuXG5mdW5jdGlvbiBpc0FjdG9yKGl0ZW0pIHtcbiAgdHJ5IHtcbiAgICByZXR1cm4gdHlwZW9mIGl0ZW0uc2VuZCA9PT0gJ2Z1bmN0aW9uJztcbiAgfSBjYXRjaCAoZSkge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxufVxuXG5leHBvcnQgeyBjcmVhdGVEZWZlcnJlZEFjdG9yLCBjcmVhdGVJbnZvY2FibGVBY3RvciwgY3JlYXRlTnVsbEFjdG9yLCBpc0FjdG9yIH07IiwiaW1wb3J0IHsgX19hc3NpZ24sIF9fcmVzdCB9IGZyb20gJy4vX3ZpcnR1YWwvX3RzbGliLmpzJztcbmltcG9ydCB7IGludm9rZSB9IGZyb20gJy4vYWN0aW9uVHlwZXMuanMnO1xuaW1wb3J0ICcuL2FjdGlvbnMuanMnO1xuXG5mdW5jdGlvbiB0b0ludm9rZVNvdXJjZShzcmMpIHtcbiAgaWYgKHR5cGVvZiBzcmMgPT09ICdzdHJpbmcnKSB7XG4gICAgdmFyIHNpbXBsZVNyYyA9IHtcbiAgICAgIHR5cGU6IHNyY1xuICAgIH07XG5cbiAgICBzaW1wbGVTcmMudG9TdHJpbmcgPSBmdW5jdGlvbiAoKSB7XG4gICAgICByZXR1cm4gc3JjO1xuICAgIH07IC8vIHY0IGNvbXBhdCAtIFRPRE86IHJlbW92ZSBpbiB2NVxuXG5cbiAgICByZXR1cm4gc2ltcGxlU3JjO1xuICB9XG5cbiAgcmV0dXJuIHNyYztcbn1cblxuZnVuY3Rpb24gdG9JbnZva2VEZWZpbml0aW9uKGludm9rZUNvbmZpZykge1xuICByZXR1cm4gX19hc3NpZ24oX19hc3NpZ24oe1xuICAgIHR5cGU6IGludm9rZVxuICB9LCBpbnZva2VDb25maWcpLCB7XG4gICAgdG9KU09OOiBmdW5jdGlvbiAoKSB7XG4gICAgICB2YXIgb25Eb25lID0gaW52b2tlQ29uZmlnLm9uRG9uZSxcbiAgICAgICAgICBvbkVycm9yID0gaW52b2tlQ29uZmlnLm9uRXJyb3IsXG4gICAgICAgICAgaW52b2tlRGVmID0gX19yZXN0KGludm9rZUNvbmZpZywgW1wib25Eb25lXCIsIFwib25FcnJvclwiXSk7XG5cbiAgICAgIHJldHVybiBfX2Fzc2lnbihfX2Fzc2lnbih7fSwgaW52b2tlRGVmKSwge1xuICAgICAgICB0eXBlOiBpbnZva2UsXG4gICAgICAgIHNyYzogdG9JbnZva2VTb3VyY2UoaW52b2tlQ29uZmlnLnNyYylcbiAgICAgIH0pO1xuICAgIH1cbiAgfSk7XG59XG5cbmV4cG9ydCB7IHRvSW52b2tlRGVmaW5pdGlvbiwgdG9JbnZva2VTb3VyY2UgfTsiLCJpbXBvcnQgeyBfX2Fzc2lnbiwgX192YWx1ZXMsIF9fc3ByZWFkLCBfX3JlYWQsIF9fcmVzdCB9IGZyb20gJy4vX3ZpcnR1YWwvX3RzbGliLmpzJztcbmltcG9ydCB7IFNUQVRFX0RFTElNSVRFUiB9IGZyb20gJy4vY29uc3RhbnRzLmpzJztcbmltcG9ydCB7IElTX1BST0RVQ1RJT04gfSBmcm9tICcuL2Vudmlyb25tZW50LmpzJztcbmltcG9ydCB7IG1hcFZhbHVlcywgaXNBcnJheSwgZmxhdHRlbiwga2V5cywgdG9BcnJheSwgdG9TdGF0ZVZhbHVlLCBpc1N0cmluZywgZ2V0RXZlbnRUeXBlLCBtYXRjaGVzU3RhdGUsIHBhdGgsIGV2YWx1YXRlR3VhcmQsIG1hcENvbnRleHQsIHRvU0NYTUxFdmVudCwgcGF0aFRvU3RhdGVWYWx1ZSwgaXNCdWlsdEluRXZlbnQsIHBhcnRpdGlvbiwgdXBkYXRlSGlzdG9yeVZhbHVlLCB0b1N0YXRlUGF0aCwgbWFwRmlsdGVyVmFsdWVzLCB3YXJuLCB0b1N0YXRlUGF0aHMsIG5lc3RlZFBhdGgsIG5vcm1hbGl6ZVRhcmdldCwgdG9HdWFyZCwgdG9UcmFuc2l0aW9uQ29uZmlnQXJyYXksIGlzTWFjaGluZSwgaXNGdW5jdGlvbiB9IGZyb20gJy4vdXRpbHMuanMnO1xuaW1wb3J0IHsgU3BlY2lhbFRhcmdldHMgfSBmcm9tICcuL3R5cGVzLmpzJztcbmltcG9ydCB7IGdldEFsbFN0YXRlTm9kZXMsIGdldENvbmZpZ3VyYXRpb24sIGhhcywgZ2V0Q2hpbGRyZW4sIGlzSW5GaW5hbFN0YXRlLCBnZXRWYWx1ZSwgaXNMZWFmTm9kZSB9IGZyb20gJy4vc3RhdGVVdGlscy5qcyc7XG5pbXBvcnQgeyBzdGFydCBhcyBzdGFydCQxLCBzdG9wIGFzIHN0b3AkMSwgaW52b2tlLCB1cGRhdGUsIG51bGxFdmVudCwgcmFpc2UgYXMgcmFpc2UkMSwgc2VuZCBhcyBzZW5kJDEgfSBmcm9tICcuL2FjdGlvblR5cGVzLmpzJztcbmltcG9ydCB7IGRvbmUsIHN0YXJ0LCByYWlzZSwgc3RvcCwgdG9BY3Rpb25PYmplY3RzLCByZXNvbHZlQWN0aW9ucywgZG9uZUludm9rZSwgZXJyb3IsIHRvQWN0aW9uT2JqZWN0LCB0b0FjdGl2aXR5RGVmaW5pdGlvbiwgYWZ0ZXIsIHNlbmQsIGNhbmNlbCwgaW5pdEV2ZW50IH0gZnJvbSAnLi9hY3Rpb25zLmpzJztcbmltcG9ydCB7IFN0YXRlLCBzdGF0ZVZhbHVlc0VxdWFsIH0gZnJvbSAnLi9TdGF0ZS5qcyc7XG5pbXBvcnQgeyBjcmVhdGVJbnZvY2FibGVBY3RvciB9IGZyb20gJy4vQWN0b3IuanMnO1xuaW1wb3J0IHsgdG9JbnZva2VEZWZpbml0aW9uIH0gZnJvbSAnLi9pbnZva2VVdGlscy5qcyc7XG52YXIgTlVMTF9FVkVOVCA9ICcnO1xudmFyIFNUQVRFX0lERU5USUZJRVIgPSAnIyc7XG52YXIgV0lMRENBUkQgPSAnKic7XG52YXIgRU1QVFlfT0JKRUNUID0ge307XG5cbnZhciBpc1N0YXRlSWQgPSBmdW5jdGlvbiAoc3RyKSB7XG4gIHJldHVybiBzdHJbMF0gPT09IFNUQVRFX0lERU5USUZJRVI7XG59O1xuXG52YXIgY3JlYXRlRGVmYXVsdE9wdGlvbnMgPSBmdW5jdGlvbiAoKSB7XG4gIHJldHVybiB7XG4gICAgYWN0aW9uczoge30sXG4gICAgZ3VhcmRzOiB7fSxcbiAgICBzZXJ2aWNlczoge30sXG4gICAgYWN0aXZpdGllczoge30sXG4gICAgZGVsYXlzOiB7fVxuICB9O1xufTtcblxudmFyIHZhbGlkYXRlQXJyYXlpZmllZFRyYW5zaXRpb25zID0gZnVuY3Rpb24gKHN0YXRlTm9kZSwgZXZlbnQsIHRyYW5zaXRpb25zKSB7XG4gIHZhciBoYXNOb25MYXN0VW5ndWFyZGVkVGFyZ2V0ID0gdHJhbnNpdGlvbnMuc2xpY2UoMCwgLTEpLnNvbWUoZnVuY3Rpb24gKHRyYW5zaXRpb24pIHtcbiAgICByZXR1cm4gISgnY29uZCcgaW4gdHJhbnNpdGlvbikgJiYgISgnaW4nIGluIHRyYW5zaXRpb24pICYmIChpc1N0cmluZyh0cmFuc2l0aW9uLnRhcmdldCkgfHwgaXNNYWNoaW5lKHRyYW5zaXRpb24udGFyZ2V0KSk7XG4gIH0pO1xuICB2YXIgZXZlbnRUZXh0ID0gZXZlbnQgPT09IE5VTExfRVZFTlQgPyAndGhlIHRyYW5zaWVudCBldmVudCcgOiBcImV2ZW50ICdcIiArIGV2ZW50ICsgXCInXCI7XG4gIHdhcm4oIWhhc05vbkxhc3RVbmd1YXJkZWRUYXJnZXQsIFwiT25lIG9yIG1vcmUgdHJhbnNpdGlvbnMgZm9yIFwiICsgZXZlbnRUZXh0ICsgXCIgb24gc3RhdGUgJ1wiICsgc3RhdGVOb2RlLmlkICsgXCInIGFyZSB1bnJlYWNoYWJsZS4gXCIgKyBcIk1ha2Ugc3VyZSB0aGF0IHRoZSBkZWZhdWx0IHRyYW5zaXRpb24gaXMgdGhlIGxhc3Qgb25lIGRlZmluZWQuXCIpO1xufTtcblxudmFyIFN0YXRlTm9kZSA9XG4vKiNfX1BVUkVfXyovXG5cbi8qKiBAY2xhc3MgKi9cbmZ1bmN0aW9uICgpIHtcbiAgZnVuY3Rpb24gU3RhdGVOb2RlKFxuICAvKipcclxuICAgKiBUaGUgcmF3IGNvbmZpZyB1c2VkIHRvIGNyZWF0ZSB0aGUgbWFjaGluZS5cclxuICAgKi9cbiAgY29uZmlnLCBvcHRpb25zLFxuICAvKipcclxuICAgKiBUaGUgaW5pdGlhbCBleHRlbmRlZCBzdGF0ZVxyXG4gICAqL1xuICBjb250ZXh0KSB7XG4gICAgdmFyIF90aGlzID0gdGhpcztcblxuICAgIHRoaXMuY29uZmlnID0gY29uZmlnO1xuICAgIHRoaXMuY29udGV4dCA9IGNvbnRleHQ7XG4gICAgLyoqXHJcbiAgICAgKiBUaGUgb3JkZXIgdGhpcyBzdGF0ZSBub2RlIGFwcGVhcnMuIENvcnJlc3BvbmRzIHRvIHRoZSBpbXBsaWNpdCBTQ1hNTCBkb2N1bWVudCBvcmRlci5cclxuICAgICAqL1xuXG4gICAgdGhpcy5vcmRlciA9IC0xO1xuICAgIHRoaXMuX194c3RhdGVub2RlID0gdHJ1ZTtcbiAgICB0aGlzLl9fY2FjaGUgPSB7XG4gICAgICBldmVudHM6IHVuZGVmaW5lZCxcbiAgICAgIHJlbGF0aXZlVmFsdWU6IG5ldyBNYXAoKSxcbiAgICAgIGluaXRpYWxTdGF0ZVZhbHVlOiB1bmRlZmluZWQsXG4gICAgICBpbml0aWFsU3RhdGU6IHVuZGVmaW5lZCxcbiAgICAgIG9uOiB1bmRlZmluZWQsXG4gICAgICB0cmFuc2l0aW9uczogdW5kZWZpbmVkLFxuICAgICAgY2FuZGlkYXRlczoge30sXG4gICAgICBkZWxheWVkVHJhbnNpdGlvbnM6IHVuZGVmaW5lZFxuICAgIH07XG4gICAgdGhpcy5pZE1hcCA9IHt9O1xuICAgIHRoaXMub3B0aW9ucyA9IE9iamVjdC5hc3NpZ24oY3JlYXRlRGVmYXVsdE9wdGlvbnMoKSwgb3B0aW9ucyk7XG4gICAgdGhpcy5wYXJlbnQgPSB0aGlzLm9wdGlvbnMuX3BhcmVudDtcbiAgICB0aGlzLmtleSA9IHRoaXMuY29uZmlnLmtleSB8fCB0aGlzLm9wdGlvbnMuX2tleSB8fCB0aGlzLmNvbmZpZy5pZCB8fCAnKG1hY2hpbmUpJztcbiAgICB0aGlzLm1hY2hpbmUgPSB0aGlzLnBhcmVudCA/IHRoaXMucGFyZW50Lm1hY2hpbmUgOiB0aGlzO1xuICAgIHRoaXMucGF0aCA9IHRoaXMucGFyZW50ID8gdGhpcy5wYXJlbnQucGF0aC5jb25jYXQodGhpcy5rZXkpIDogW107XG4gICAgdGhpcy5kZWxpbWl0ZXIgPSB0aGlzLmNvbmZpZy5kZWxpbWl0ZXIgfHwgKHRoaXMucGFyZW50ID8gdGhpcy5wYXJlbnQuZGVsaW1pdGVyIDogU1RBVEVfREVMSU1JVEVSKTtcbiAgICB0aGlzLmlkID0gdGhpcy5jb25maWcuaWQgfHwgX19zcHJlYWQoW3RoaXMubWFjaGluZS5rZXldLCB0aGlzLnBhdGgpLmpvaW4odGhpcy5kZWxpbWl0ZXIpO1xuICAgIHRoaXMudmVyc2lvbiA9IHRoaXMucGFyZW50ID8gdGhpcy5wYXJlbnQudmVyc2lvbiA6IHRoaXMuY29uZmlnLnZlcnNpb247XG4gICAgdGhpcy50eXBlID0gdGhpcy5jb25maWcudHlwZSB8fCAodGhpcy5jb25maWcucGFyYWxsZWwgPyAncGFyYWxsZWwnIDogdGhpcy5jb25maWcuc3RhdGVzICYmIGtleXModGhpcy5jb25maWcuc3RhdGVzKS5sZW5ndGggPyAnY29tcG91bmQnIDogdGhpcy5jb25maWcuaGlzdG9yeSA/ICdoaXN0b3J5JyA6ICdhdG9taWMnKTtcblxuICAgIGlmICghSVNfUFJPRFVDVElPTikge1xuICAgICAgd2FybighKCdwYXJhbGxlbCcgaW4gdGhpcy5jb25maWcpLCBcIlRoZSBcXFwicGFyYWxsZWxcXFwiIHByb3BlcnR5IGlzIGRlcHJlY2F0ZWQgYW5kIHdpbGwgYmUgcmVtb3ZlZCBpbiB2ZXJzaW9uIDQuMS4gXCIgKyAodGhpcy5jb25maWcucGFyYWxsZWwgPyBcIlJlcGxhY2Ugd2l0aCBgdHlwZTogJ3BhcmFsbGVsJ2BcIiA6IFwiVXNlIGB0eXBlOiAnXCIgKyB0aGlzLnR5cGUgKyBcIidgXCIpICsgXCIgaW4gdGhlIGNvbmZpZyBmb3Igc3RhdGUgbm9kZSAnXCIgKyB0aGlzLmlkICsgXCInIGluc3RlYWQuXCIpO1xuICAgIH1cblxuICAgIHRoaXMuaW5pdGlhbCA9IHRoaXMuY29uZmlnLmluaXRpYWw7XG4gICAgdGhpcy5zdGF0ZXMgPSB0aGlzLmNvbmZpZy5zdGF0ZXMgPyBtYXBWYWx1ZXModGhpcy5jb25maWcuc3RhdGVzLCBmdW5jdGlvbiAoc3RhdGVDb25maWcsIGtleSkge1xuICAgICAgdmFyIF9hO1xuXG4gICAgICB2YXIgc3RhdGVOb2RlID0gbmV3IFN0YXRlTm9kZShzdGF0ZUNvbmZpZywge1xuICAgICAgICBfcGFyZW50OiBfdGhpcyxcbiAgICAgICAgX2tleToga2V5XG4gICAgICB9KTtcbiAgICAgIE9iamVjdC5hc3NpZ24oX3RoaXMuaWRNYXAsIF9fYXNzaWduKChfYSA9IHt9LCBfYVtzdGF0ZU5vZGUuaWRdID0gc3RhdGVOb2RlLCBfYSksIHN0YXRlTm9kZS5pZE1hcCkpO1xuICAgICAgcmV0dXJuIHN0YXRlTm9kZTtcbiAgICB9KSA6IEVNUFRZX09CSkVDVDsgLy8gRG9jdW1lbnQgb3JkZXJcblxuICAgIHZhciBvcmRlciA9IDA7XG5cbiAgICBmdW5jdGlvbiBkZnMoc3RhdGVOb2RlKSB7XG4gICAgICB2YXIgZV8xLCBfYTtcblxuICAgICAgc3RhdGVOb2RlLm9yZGVyID0gb3JkZXIrKztcblxuICAgICAgdHJ5IHtcbiAgICAgICAgZm9yICh2YXIgX2IgPSBfX3ZhbHVlcyhnZXRDaGlsZHJlbihzdGF0ZU5vZGUpKSwgX2MgPSBfYi5uZXh0KCk7ICFfYy5kb25lOyBfYyA9IF9iLm5leHQoKSkge1xuICAgICAgICAgIHZhciBjaGlsZCA9IF9jLnZhbHVlO1xuICAgICAgICAgIGRmcyhjaGlsZCk7XG4gICAgICAgIH1cbiAgICAgIH0gY2F0Y2ggKGVfMV8xKSB7XG4gICAgICAgIGVfMSA9IHtcbiAgICAgICAgICBlcnJvcjogZV8xXzFcbiAgICAgICAgfTtcbiAgICAgIH0gZmluYWxseSB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgaWYgKF9jICYmICFfYy5kb25lICYmIChfYSA9IF9iLnJldHVybikpIF9hLmNhbGwoX2IpO1xuICAgICAgICB9IGZpbmFsbHkge1xuICAgICAgICAgIGlmIChlXzEpIHRocm93IGVfMS5lcnJvcjtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIGRmcyh0aGlzKTsgLy8gSGlzdG9yeSBjb25maWdcblxuICAgIHRoaXMuaGlzdG9yeSA9IHRoaXMuY29uZmlnLmhpc3RvcnkgPT09IHRydWUgPyAnc2hhbGxvdycgOiB0aGlzLmNvbmZpZy5oaXN0b3J5IHx8IGZhbHNlO1xuICAgIHRoaXMuX3RyYW5zaWVudCA9ICEhdGhpcy5jb25maWcuYWx3YXlzIHx8ICghdGhpcy5jb25maWcub24gPyBmYWxzZSA6IEFycmF5LmlzQXJyYXkodGhpcy5jb25maWcub24pID8gdGhpcy5jb25maWcub24uc29tZShmdW5jdGlvbiAoX2EpIHtcbiAgICAgIHZhciBldmVudCA9IF9hLmV2ZW50O1xuICAgICAgcmV0dXJuIGV2ZW50ID09PSBOVUxMX0VWRU5UO1xuICAgIH0pIDogTlVMTF9FVkVOVCBpbiB0aGlzLmNvbmZpZy5vbik7XG4gICAgdGhpcy5zdHJpY3QgPSAhIXRoaXMuY29uZmlnLnN0cmljdDsgLy8gVE9ETzogZGVwcmVjYXRlIChlbnRyeSlcblxuICAgIHRoaXMub25FbnRyeSA9IHRvQXJyYXkodGhpcy5jb25maWcuZW50cnkgfHwgdGhpcy5jb25maWcub25FbnRyeSkubWFwKGZ1bmN0aW9uIChhY3Rpb24pIHtcbiAgICAgIHJldHVybiB0b0FjdGlvbk9iamVjdChhY3Rpb24pO1xuICAgIH0pOyAvLyBUT0RPOiBkZXByZWNhdGUgKGV4aXQpXG5cbiAgICB0aGlzLm9uRXhpdCA9IHRvQXJyYXkodGhpcy5jb25maWcuZXhpdCB8fCB0aGlzLmNvbmZpZy5vbkV4aXQpLm1hcChmdW5jdGlvbiAoYWN0aW9uKSB7XG4gICAgICByZXR1cm4gdG9BY3Rpb25PYmplY3QoYWN0aW9uKTtcbiAgICB9KTtcbiAgICB0aGlzLm1ldGEgPSB0aGlzLmNvbmZpZy5tZXRhO1xuICAgIHRoaXMuZG9uZURhdGEgPSB0aGlzLnR5cGUgPT09ICdmaW5hbCcgPyB0aGlzLmNvbmZpZy5kYXRhIDogdW5kZWZpbmVkO1xuICAgIHRoaXMuaW52b2tlID0gdG9BcnJheSh0aGlzLmNvbmZpZy5pbnZva2UpLm1hcChmdW5jdGlvbiAoaW52b2tlQ29uZmlnLCBpKSB7XG4gICAgICB2YXIgX2EsIF9iO1xuXG4gICAgICBpZiAoaXNNYWNoaW5lKGludm9rZUNvbmZpZykpIHtcbiAgICAgICAgX3RoaXMubWFjaGluZS5vcHRpb25zLnNlcnZpY2VzID0gX19hc3NpZ24oKF9hID0ge30sIF9hW2ludm9rZUNvbmZpZy5pZF0gPSBpbnZva2VDb25maWcsIF9hKSwgX3RoaXMubWFjaGluZS5vcHRpb25zLnNlcnZpY2VzKTtcbiAgICAgICAgcmV0dXJuIHRvSW52b2tlRGVmaW5pdGlvbih7XG4gICAgICAgICAgc3JjOiBpbnZva2VDb25maWcuaWQsXG4gICAgICAgICAgaWQ6IGludm9rZUNvbmZpZy5pZFxuICAgICAgICB9KTtcbiAgICAgIH0gZWxzZSBpZiAoaXNTdHJpbmcoaW52b2tlQ29uZmlnLnNyYykpIHtcbiAgICAgICAgcmV0dXJuIHRvSW52b2tlRGVmaW5pdGlvbihfX2Fzc2lnbihfX2Fzc2lnbih7fSwgaW52b2tlQ29uZmlnKSwge1xuICAgICAgICAgIGlkOiBpbnZva2VDb25maWcuaWQgfHwgaW52b2tlQ29uZmlnLnNyYyxcbiAgICAgICAgICBzcmM6IGludm9rZUNvbmZpZy5zcmNcbiAgICAgICAgfSkpO1xuICAgICAgfSBlbHNlIGlmIChpc01hY2hpbmUoaW52b2tlQ29uZmlnLnNyYykgfHwgaXNGdW5jdGlvbihpbnZva2VDb25maWcuc3JjKSkge1xuICAgICAgICB2YXIgaW52b2tlU3JjID0gX3RoaXMuaWQgKyBcIjppbnZvY2F0aW9uW1wiICsgaSArIFwiXVwiOyAvLyBUT0RPOiB1dGlsIGZ1bmN0aW9uXG5cbiAgICAgICAgX3RoaXMubWFjaGluZS5vcHRpb25zLnNlcnZpY2VzID0gX19hc3NpZ24oKF9iID0ge30sIF9iW2ludm9rZVNyY10gPSBpbnZva2VDb25maWcuc3JjLCBfYiksIF90aGlzLm1hY2hpbmUub3B0aW9ucy5zZXJ2aWNlcyk7XG4gICAgICAgIHJldHVybiB0b0ludm9rZURlZmluaXRpb24oX19hc3NpZ24oX19hc3NpZ24oe1xuICAgICAgICAgIGlkOiBpbnZva2VTcmNcbiAgICAgICAgfSwgaW52b2tlQ29uZmlnKSwge1xuICAgICAgICAgIHNyYzogaW52b2tlU3JjXG4gICAgICAgIH0pKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHZhciBpbnZva2VTb3VyY2UgPSBpbnZva2VDb25maWcuc3JjO1xuICAgICAgICByZXR1cm4gdG9JbnZva2VEZWZpbml0aW9uKF9fYXNzaWduKF9fYXNzaWduKHtcbiAgICAgICAgICBpZDogaW52b2tlU291cmNlLnR5cGVcbiAgICAgICAgfSwgaW52b2tlQ29uZmlnKSwge1xuICAgICAgICAgIHNyYzogaW52b2tlU291cmNlXG4gICAgICAgIH0pKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgICB0aGlzLmFjdGl2aXRpZXMgPSB0b0FycmF5KHRoaXMuY29uZmlnLmFjdGl2aXRpZXMpLmNvbmNhdCh0aGlzLmludm9rZSkubWFwKGZ1bmN0aW9uIChhY3Rpdml0eSkge1xuICAgICAgcmV0dXJuIHRvQWN0aXZpdHlEZWZpbml0aW9uKGFjdGl2aXR5KTtcbiAgICB9KTtcbiAgICB0aGlzLnRyYW5zaXRpb24gPSB0aGlzLnRyYW5zaXRpb24uYmluZCh0aGlzKTsgLy8gVE9ETzogdGhpcyBpcyB0aGUgcmVhbCBmaXggZm9yIGluaXRpYWxpemF0aW9uIG9uY2VcbiAgICAvLyBzdGF0ZSBub2RlIGdldHRlcnMgYXJlIGRlcHJlY2F0ZWRcbiAgICAvLyBpZiAoIXRoaXMucGFyZW50KSB7XG4gICAgLy8gICB0aGlzLl9pbml0KCk7XG4gICAgLy8gfVxuICB9XG5cbiAgU3RhdGVOb2RlLnByb3RvdHlwZS5faW5pdCA9IGZ1bmN0aW9uICgpIHtcbiAgICBpZiAodGhpcy5fX2NhY2hlLnRyYW5zaXRpb25zKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgZ2V0QWxsU3RhdGVOb2Rlcyh0aGlzKS5mb3JFYWNoKGZ1bmN0aW9uIChzdGF0ZU5vZGUpIHtcbiAgICAgIHJldHVybiBzdGF0ZU5vZGUub247XG4gICAgfSk7XG4gIH07XG4gIC8qKlxyXG4gICAqIENsb25lcyB0aGlzIHN0YXRlIG1hY2hpbmUgd2l0aCBjdXN0b20gb3B0aW9ucyBhbmQgY29udGV4dC5cclxuICAgKlxyXG4gICAqIEBwYXJhbSBvcHRpb25zIE9wdGlvbnMgKGFjdGlvbnMsIGd1YXJkcywgYWN0aXZpdGllcywgc2VydmljZXMpIHRvIHJlY3Vyc2l2ZWx5IG1lcmdlIHdpdGggdGhlIGV4aXN0aW5nIG9wdGlvbnMuXHJcbiAgICogQHBhcmFtIGNvbnRleHQgQ3VzdG9tIGNvbnRleHQgKHdpbGwgb3ZlcnJpZGUgcHJlZGVmaW5lZCBjb250ZXh0KVxyXG4gICAqL1xuXG5cbiAgU3RhdGVOb2RlLnByb3RvdHlwZS53aXRoQ29uZmlnID0gZnVuY3Rpb24gKG9wdGlvbnMsIGNvbnRleHQpIHtcbiAgICBpZiAoY29udGV4dCA9PT0gdm9pZCAwKSB7XG4gICAgICBjb250ZXh0ID0gdGhpcy5jb250ZXh0O1xuICAgIH1cblxuICAgIHZhciBfYSA9IHRoaXMub3B0aW9ucyxcbiAgICAgICAgYWN0aW9ucyA9IF9hLmFjdGlvbnMsXG4gICAgICAgIGFjdGl2aXRpZXMgPSBfYS5hY3Rpdml0aWVzLFxuICAgICAgICBndWFyZHMgPSBfYS5ndWFyZHMsXG4gICAgICAgIHNlcnZpY2VzID0gX2Euc2VydmljZXMsXG4gICAgICAgIGRlbGF5cyA9IF9hLmRlbGF5cztcbiAgICByZXR1cm4gbmV3IFN0YXRlTm9kZSh0aGlzLmNvbmZpZywge1xuICAgICAgYWN0aW9uczogX19hc3NpZ24oX19hc3NpZ24oe30sIGFjdGlvbnMpLCBvcHRpb25zLmFjdGlvbnMpLFxuICAgICAgYWN0aXZpdGllczogX19hc3NpZ24oX19hc3NpZ24oe30sIGFjdGl2aXRpZXMpLCBvcHRpb25zLmFjdGl2aXRpZXMpLFxuICAgICAgZ3VhcmRzOiBfX2Fzc2lnbihfX2Fzc2lnbih7fSwgZ3VhcmRzKSwgb3B0aW9ucy5ndWFyZHMpLFxuICAgICAgc2VydmljZXM6IF9fYXNzaWduKF9fYXNzaWduKHt9LCBzZXJ2aWNlcyksIG9wdGlvbnMuc2VydmljZXMpLFxuICAgICAgZGVsYXlzOiBfX2Fzc2lnbihfX2Fzc2lnbih7fSwgZGVsYXlzKSwgb3B0aW9ucy5kZWxheXMpXG4gICAgfSwgY29udGV4dCk7XG4gIH07XG4gIC8qKlxyXG4gICAqIENsb25lcyB0aGlzIHN0YXRlIG1hY2hpbmUgd2l0aCBjdXN0b20gY29udGV4dC5cclxuICAgKlxyXG4gICAqIEBwYXJhbSBjb250ZXh0IEN1c3RvbSBjb250ZXh0ICh3aWxsIG92ZXJyaWRlIHByZWRlZmluZWQgY29udGV4dCwgbm90IHJlY3Vyc2l2ZSlcclxuICAgKi9cblxuXG4gIFN0YXRlTm9kZS5wcm90b3R5cGUud2l0aENvbnRleHQgPSBmdW5jdGlvbiAoY29udGV4dCkge1xuICAgIHJldHVybiBuZXcgU3RhdGVOb2RlKHRoaXMuY29uZmlnLCB0aGlzLm9wdGlvbnMsIGNvbnRleHQpO1xuICB9O1xuXG4gIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShTdGF0ZU5vZGUucHJvdG90eXBlLCBcImRlZmluaXRpb25cIiwge1xuICAgIC8qKlxyXG4gICAgICogVGhlIHdlbGwtc3RydWN0dXJlZCBzdGF0ZSBub2RlIGRlZmluaXRpb24uXHJcbiAgICAgKi9cbiAgICBnZXQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIGlkOiB0aGlzLmlkLFxuICAgICAgICBrZXk6IHRoaXMua2V5LFxuICAgICAgICB2ZXJzaW9uOiB0aGlzLnZlcnNpb24sXG4gICAgICAgIGNvbnRleHQ6IHRoaXMuY29udGV4dCxcbiAgICAgICAgdHlwZTogdGhpcy50eXBlLFxuICAgICAgICBpbml0aWFsOiB0aGlzLmluaXRpYWwsXG4gICAgICAgIGhpc3Rvcnk6IHRoaXMuaGlzdG9yeSxcbiAgICAgICAgc3RhdGVzOiBtYXBWYWx1ZXModGhpcy5zdGF0ZXMsIGZ1bmN0aW9uIChzdGF0ZSkge1xuICAgICAgICAgIHJldHVybiBzdGF0ZS5kZWZpbml0aW9uO1xuICAgICAgICB9KSxcbiAgICAgICAgb246IHRoaXMub24sXG4gICAgICAgIHRyYW5zaXRpb25zOiB0aGlzLnRyYW5zaXRpb25zLFxuICAgICAgICBlbnRyeTogdGhpcy5vbkVudHJ5LFxuICAgICAgICBleGl0OiB0aGlzLm9uRXhpdCxcbiAgICAgICAgYWN0aXZpdGllczogdGhpcy5hY3Rpdml0aWVzIHx8IFtdLFxuICAgICAgICBtZXRhOiB0aGlzLm1ldGEsXG4gICAgICAgIG9yZGVyOiB0aGlzLm9yZGVyIHx8IC0xLFxuICAgICAgICBkYXRhOiB0aGlzLmRvbmVEYXRhLFxuICAgICAgICBpbnZva2U6IHRoaXMuaW52b2tlXG4gICAgICB9O1xuICAgIH0sXG4gICAgZW51bWVyYWJsZTogZmFsc2UsXG4gICAgY29uZmlndXJhYmxlOiB0cnVlXG4gIH0pO1xuXG4gIFN0YXRlTm9kZS5wcm90b3R5cGUudG9KU09OID0gZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiB0aGlzLmRlZmluaXRpb247XG4gIH07XG5cbiAgT2JqZWN0LmRlZmluZVByb3BlcnR5KFN0YXRlTm9kZS5wcm90b3R5cGUsIFwib25cIiwge1xuICAgIC8qKlxyXG4gICAgICogVGhlIG1hcHBpbmcgb2YgZXZlbnRzIHRvIHRyYW5zaXRpb25zLlxyXG4gICAgICovXG4gICAgZ2V0OiBmdW5jdGlvbiAoKSB7XG4gICAgICBpZiAodGhpcy5fX2NhY2hlLm9uKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9fY2FjaGUub247XG4gICAgICB9XG5cbiAgICAgIHZhciB0cmFuc2l0aW9ucyA9IHRoaXMudHJhbnNpdGlvbnM7XG4gICAgICByZXR1cm4gdGhpcy5fX2NhY2hlLm9uID0gdHJhbnNpdGlvbnMucmVkdWNlKGZ1bmN0aW9uIChtYXAsIHRyYW5zaXRpb24pIHtcbiAgICAgICAgbWFwW3RyYW5zaXRpb24uZXZlbnRUeXBlXSA9IG1hcFt0cmFuc2l0aW9uLmV2ZW50VHlwZV0gfHwgW107XG4gICAgICAgIG1hcFt0cmFuc2l0aW9uLmV2ZW50VHlwZV0ucHVzaCh0cmFuc2l0aW9uKTtcbiAgICAgICAgcmV0dXJuIG1hcDtcbiAgICAgIH0sIHt9KTtcbiAgICB9LFxuICAgIGVudW1lcmFibGU6IGZhbHNlLFxuICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZVxuICB9KTtcbiAgT2JqZWN0LmRlZmluZVByb3BlcnR5KFN0YXRlTm9kZS5wcm90b3R5cGUsIFwiYWZ0ZXJcIiwge1xuICAgIGdldDogZnVuY3Rpb24gKCkge1xuICAgICAgcmV0dXJuIHRoaXMuX19jYWNoZS5kZWxheWVkVHJhbnNpdGlvbnMgfHwgKHRoaXMuX19jYWNoZS5kZWxheWVkVHJhbnNpdGlvbnMgPSB0aGlzLmdldERlbGF5ZWRUcmFuc2l0aW9ucygpLCB0aGlzLl9fY2FjaGUuZGVsYXllZFRyYW5zaXRpb25zKTtcbiAgICB9LFxuICAgIGVudW1lcmFibGU6IGZhbHNlLFxuICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZVxuICB9KTtcbiAgT2JqZWN0LmRlZmluZVByb3BlcnR5KFN0YXRlTm9kZS5wcm90b3R5cGUsIFwidHJhbnNpdGlvbnNcIiwge1xuICAgIC8qKlxyXG4gICAgICogQWxsIHRoZSB0cmFuc2l0aW9ucyB0aGF0IGNhbiBiZSB0YWtlbiBmcm9tIHRoaXMgc3RhdGUgbm9kZS5cclxuICAgICAqL1xuICAgIGdldDogZnVuY3Rpb24gKCkge1xuICAgICAgcmV0dXJuIHRoaXMuX19jYWNoZS50cmFuc2l0aW9ucyB8fCAodGhpcy5fX2NhY2hlLnRyYW5zaXRpb25zID0gdGhpcy5mb3JtYXRUcmFuc2l0aW9ucygpLCB0aGlzLl9fY2FjaGUudHJhbnNpdGlvbnMpO1xuICAgIH0sXG4gICAgZW51bWVyYWJsZTogZmFsc2UsXG4gICAgY29uZmlndXJhYmxlOiB0cnVlXG4gIH0pO1xuXG4gIFN0YXRlTm9kZS5wcm90b3R5cGUuZ2V0Q2FuZGlkYXRlcyA9IGZ1bmN0aW9uIChldmVudE5hbWUpIHtcbiAgICBpZiAodGhpcy5fX2NhY2hlLmNhbmRpZGF0ZXNbZXZlbnROYW1lXSkge1xuICAgICAgcmV0dXJuIHRoaXMuX19jYWNoZS5jYW5kaWRhdGVzW2V2ZW50TmFtZV07XG4gICAgfVxuXG4gICAgdmFyIHRyYW5zaWVudCA9IGV2ZW50TmFtZSA9PT0gTlVMTF9FVkVOVDtcbiAgICB2YXIgY2FuZGlkYXRlcyA9IHRoaXMudHJhbnNpdGlvbnMuZmlsdGVyKGZ1bmN0aW9uICh0cmFuc2l0aW9uKSB7XG4gICAgICB2YXIgc2FtZUV2ZW50VHlwZSA9IHRyYW5zaXRpb24uZXZlbnRUeXBlID09PSBldmVudE5hbWU7IC8vIG51bGwgZXZlbnRzIHNob3VsZCBvbmx5IG1hdGNoIGFnYWluc3QgZXZlbnRsZXNzIHRyYW5zaXRpb25zXG5cbiAgICAgIHJldHVybiB0cmFuc2llbnQgPyBzYW1lRXZlbnRUeXBlIDogc2FtZUV2ZW50VHlwZSB8fCB0cmFuc2l0aW9uLmV2ZW50VHlwZSA9PT0gV0lMRENBUkQ7XG4gICAgfSk7XG4gICAgdGhpcy5fX2NhY2hlLmNhbmRpZGF0ZXNbZXZlbnROYW1lXSA9IGNhbmRpZGF0ZXM7XG4gICAgcmV0dXJuIGNhbmRpZGF0ZXM7XG4gIH07XG4gIC8qKlxyXG4gICAqIEFsbCBkZWxheWVkIHRyYW5zaXRpb25zIGZyb20gdGhlIGNvbmZpZy5cclxuICAgKi9cblxuXG4gIFN0YXRlTm9kZS5wcm90b3R5cGUuZ2V0RGVsYXllZFRyYW5zaXRpb25zID0gZnVuY3Rpb24gKCkge1xuICAgIHZhciBfdGhpcyA9IHRoaXM7XG5cbiAgICB2YXIgYWZ0ZXJDb25maWcgPSB0aGlzLmNvbmZpZy5hZnRlcjtcblxuICAgIGlmICghYWZ0ZXJDb25maWcpIHtcbiAgICAgIHJldHVybiBbXTtcbiAgICB9XG5cbiAgICB2YXIgbXV0YXRlRW50cnlFeGl0ID0gZnVuY3Rpb24gKGRlbGF5LCBpKSB7XG4gICAgICB2YXIgZGVsYXlSZWYgPSBpc0Z1bmN0aW9uKGRlbGF5KSA/IF90aGlzLmlkICsgXCI6ZGVsYXlbXCIgKyBpICsgXCJdXCIgOiBkZWxheTtcbiAgICAgIHZhciBldmVudFR5cGUgPSBhZnRlcihkZWxheVJlZiwgX3RoaXMuaWQpO1xuXG4gICAgICBfdGhpcy5vbkVudHJ5LnB1c2goc2VuZChldmVudFR5cGUsIHtcbiAgICAgICAgZGVsYXk6IGRlbGF5XG4gICAgICB9KSk7XG5cbiAgICAgIF90aGlzLm9uRXhpdC5wdXNoKGNhbmNlbChldmVudFR5cGUpKTtcblxuICAgICAgcmV0dXJuIGV2ZW50VHlwZTtcbiAgICB9O1xuXG4gICAgdmFyIGRlbGF5ZWRUcmFuc2l0aW9ucyA9IGlzQXJyYXkoYWZ0ZXJDb25maWcpID8gYWZ0ZXJDb25maWcubWFwKGZ1bmN0aW9uICh0cmFuc2l0aW9uLCBpKSB7XG4gICAgICB2YXIgZXZlbnRUeXBlID0gbXV0YXRlRW50cnlFeGl0KHRyYW5zaXRpb24uZGVsYXksIGkpO1xuICAgICAgcmV0dXJuIF9fYXNzaWduKF9fYXNzaWduKHt9LCB0cmFuc2l0aW9uKSwge1xuICAgICAgICBldmVudDogZXZlbnRUeXBlXG4gICAgICB9KTtcbiAgICB9KSA6IGZsYXR0ZW4oa2V5cyhhZnRlckNvbmZpZykubWFwKGZ1bmN0aW9uIChkZWxheSwgaSkge1xuICAgICAgdmFyIGNvbmZpZ1RyYW5zaXRpb24gPSBhZnRlckNvbmZpZ1tkZWxheV07XG4gICAgICB2YXIgcmVzb2x2ZWRUcmFuc2l0aW9uID0gaXNTdHJpbmcoY29uZmlnVHJhbnNpdGlvbikgPyB7XG4gICAgICAgIHRhcmdldDogY29uZmlnVHJhbnNpdGlvblxuICAgICAgfSA6IGNvbmZpZ1RyYW5zaXRpb247XG4gICAgICB2YXIgcmVzb2x2ZWREZWxheSA9ICFpc05hTigrZGVsYXkpID8gK2RlbGF5IDogZGVsYXk7XG4gICAgICB2YXIgZXZlbnRUeXBlID0gbXV0YXRlRW50cnlFeGl0KHJlc29sdmVkRGVsYXksIGkpO1xuICAgICAgcmV0dXJuIHRvQXJyYXkocmVzb2x2ZWRUcmFuc2l0aW9uKS5tYXAoZnVuY3Rpb24gKHRyYW5zaXRpb24pIHtcbiAgICAgICAgcmV0dXJuIF9fYXNzaWduKF9fYXNzaWduKHt9LCB0cmFuc2l0aW9uKSwge1xuICAgICAgICAgIGV2ZW50OiBldmVudFR5cGUsXG4gICAgICAgICAgZGVsYXk6IHJlc29sdmVkRGVsYXlcbiAgICAgICAgfSk7XG4gICAgICB9KTtcbiAgICB9KSk7XG4gICAgcmV0dXJuIGRlbGF5ZWRUcmFuc2l0aW9ucy5tYXAoZnVuY3Rpb24gKGRlbGF5ZWRUcmFuc2l0aW9uKSB7XG4gICAgICB2YXIgZGVsYXkgPSBkZWxheWVkVHJhbnNpdGlvbi5kZWxheTtcbiAgICAgIHJldHVybiBfX2Fzc2lnbihfX2Fzc2lnbih7fSwgX3RoaXMuZm9ybWF0VHJhbnNpdGlvbihkZWxheWVkVHJhbnNpdGlvbikpLCB7XG4gICAgICAgIGRlbGF5OiBkZWxheVxuICAgICAgfSk7XG4gICAgfSk7XG4gIH07XG4gIC8qKlxyXG4gICAqIFJldHVybnMgdGhlIHN0YXRlIG5vZGVzIHJlcHJlc2VudGVkIGJ5IHRoZSBjdXJyZW50IHN0YXRlIHZhbHVlLlxyXG4gICAqXHJcbiAgICogQHBhcmFtIHN0YXRlIFRoZSBzdGF0ZSB2YWx1ZSBvciBTdGF0ZSBpbnN0YW5jZVxyXG4gICAqL1xuXG5cbiAgU3RhdGVOb2RlLnByb3RvdHlwZS5nZXRTdGF0ZU5vZGVzID0gZnVuY3Rpb24gKHN0YXRlKSB7XG4gICAgdmFyIF9hO1xuXG4gICAgdmFyIF90aGlzID0gdGhpcztcblxuICAgIGlmICghc3RhdGUpIHtcbiAgICAgIHJldHVybiBbXTtcbiAgICB9XG5cbiAgICB2YXIgc3RhdGVWYWx1ZSA9IHN0YXRlIGluc3RhbmNlb2YgU3RhdGUgPyBzdGF0ZS52YWx1ZSA6IHRvU3RhdGVWYWx1ZShzdGF0ZSwgdGhpcy5kZWxpbWl0ZXIpO1xuXG4gICAgaWYgKGlzU3RyaW5nKHN0YXRlVmFsdWUpKSB7XG4gICAgICB2YXIgaW5pdGlhbFN0YXRlVmFsdWUgPSB0aGlzLmdldFN0YXRlTm9kZShzdGF0ZVZhbHVlKS5pbml0aWFsO1xuICAgICAgcmV0dXJuIGluaXRpYWxTdGF0ZVZhbHVlICE9PSB1bmRlZmluZWQgPyB0aGlzLmdldFN0YXRlTm9kZXMoKF9hID0ge30sIF9hW3N0YXRlVmFsdWVdID0gaW5pdGlhbFN0YXRlVmFsdWUsIF9hKSkgOiBbdGhpcy5zdGF0ZXNbc3RhdGVWYWx1ZV1dO1xuICAgIH1cblxuICAgIHZhciBzdWJTdGF0ZUtleXMgPSBrZXlzKHN0YXRlVmFsdWUpO1xuICAgIHZhciBzdWJTdGF0ZU5vZGVzID0gc3ViU3RhdGVLZXlzLm1hcChmdW5jdGlvbiAoc3ViU3RhdGVLZXkpIHtcbiAgICAgIHJldHVybiBfdGhpcy5nZXRTdGF0ZU5vZGUoc3ViU3RhdGVLZXkpO1xuICAgIH0pO1xuICAgIHJldHVybiBzdWJTdGF0ZU5vZGVzLmNvbmNhdChzdWJTdGF0ZUtleXMucmVkdWNlKGZ1bmN0aW9uIChhbGxTdWJTdGF0ZU5vZGVzLCBzdWJTdGF0ZUtleSkge1xuICAgICAgdmFyIHN1YlN0YXRlTm9kZSA9IF90aGlzLmdldFN0YXRlTm9kZShzdWJTdGF0ZUtleSkuZ2V0U3RhdGVOb2RlcyhzdGF0ZVZhbHVlW3N1YlN0YXRlS2V5XSk7XG5cbiAgICAgIHJldHVybiBhbGxTdWJTdGF0ZU5vZGVzLmNvbmNhdChzdWJTdGF0ZU5vZGUpO1xuICAgIH0sIFtdKSk7XG4gIH07XG4gIC8qKlxyXG4gICAqIFJldHVybnMgYHRydWVgIGlmIHRoaXMgc3RhdGUgbm9kZSBleHBsaWNpdGx5IGhhbmRsZXMgdGhlIGdpdmVuIGV2ZW50LlxyXG4gICAqXHJcbiAgICogQHBhcmFtIGV2ZW50IFRoZSBldmVudCBpbiBxdWVzdGlvblxyXG4gICAqL1xuXG5cbiAgU3RhdGVOb2RlLnByb3RvdHlwZS5oYW5kbGVzID0gZnVuY3Rpb24gKGV2ZW50KSB7XG4gICAgdmFyIGV2ZW50VHlwZSA9IGdldEV2ZW50VHlwZShldmVudCk7XG4gICAgcmV0dXJuIHRoaXMuZXZlbnRzLmluY2x1ZGVzKGV2ZW50VHlwZSk7XG4gIH07XG4gIC8qKlxyXG4gICAqIFJlc29sdmVzIHRoZSBnaXZlbiBgc3RhdGVgIHRvIGEgbmV3IGBTdGF0ZWAgaW5zdGFuY2UgcmVsYXRpdmUgdG8gdGhpcyBtYWNoaW5lLlxyXG4gICAqXHJcbiAgICogVGhpcyBlbnN1cmVzIHRoYXQgYC5ldmVudHNgIGFuZCBgLm5leHRFdmVudHNgIHJlcHJlc2VudCB0aGUgY29ycmVjdCB2YWx1ZXMuXHJcbiAgICpcclxuICAgKiBAcGFyYW0gc3RhdGUgVGhlIHN0YXRlIHRvIHJlc29sdmVcclxuICAgKi9cblxuXG4gIFN0YXRlTm9kZS5wcm90b3R5cGUucmVzb2x2ZVN0YXRlID0gZnVuY3Rpb24gKHN0YXRlKSB7XG4gICAgdmFyIGNvbmZpZ3VyYXRpb24gPSBBcnJheS5mcm9tKGdldENvbmZpZ3VyYXRpb24oW10sIHRoaXMuZ2V0U3RhdGVOb2RlcyhzdGF0ZS52YWx1ZSkpKTtcbiAgICByZXR1cm4gbmV3IFN0YXRlKF9fYXNzaWduKF9fYXNzaWduKHt9LCBzdGF0ZSksIHtcbiAgICAgIHZhbHVlOiB0aGlzLnJlc29sdmUoc3RhdGUudmFsdWUpLFxuICAgICAgY29uZmlndXJhdGlvbjogY29uZmlndXJhdGlvblxuICAgIH0pKTtcbiAgfTtcblxuICBTdGF0ZU5vZGUucHJvdG90eXBlLnRyYW5zaXRpb25MZWFmTm9kZSA9IGZ1bmN0aW9uIChzdGF0ZVZhbHVlLCBzdGF0ZSwgX2V2ZW50KSB7XG4gICAgdmFyIHN0YXRlTm9kZSA9IHRoaXMuZ2V0U3RhdGVOb2RlKHN0YXRlVmFsdWUpO1xuICAgIHZhciBuZXh0ID0gc3RhdGVOb2RlLm5leHQoc3RhdGUsIF9ldmVudCk7XG5cbiAgICBpZiAoIW5leHQgfHwgIW5leHQudHJhbnNpdGlvbnMubGVuZ3RoKSB7XG4gICAgICByZXR1cm4gdGhpcy5uZXh0KHN0YXRlLCBfZXZlbnQpO1xuICAgIH1cblxuICAgIHJldHVybiBuZXh0O1xuICB9O1xuXG4gIFN0YXRlTm9kZS5wcm90b3R5cGUudHJhbnNpdGlvbkNvbXBvdW5kTm9kZSA9IGZ1bmN0aW9uIChzdGF0ZVZhbHVlLCBzdGF0ZSwgX2V2ZW50KSB7XG4gICAgdmFyIHN1YlN0YXRlS2V5cyA9IGtleXMoc3RhdGVWYWx1ZSk7XG4gICAgdmFyIHN0YXRlTm9kZSA9IHRoaXMuZ2V0U3RhdGVOb2RlKHN1YlN0YXRlS2V5c1swXSk7XG5cbiAgICB2YXIgbmV4dCA9IHN0YXRlTm9kZS5fdHJhbnNpdGlvbihzdGF0ZVZhbHVlW3N1YlN0YXRlS2V5c1swXV0sIHN0YXRlLCBfZXZlbnQpO1xuXG4gICAgaWYgKCFuZXh0IHx8ICFuZXh0LnRyYW5zaXRpb25zLmxlbmd0aCkge1xuICAgICAgcmV0dXJuIHRoaXMubmV4dChzdGF0ZSwgX2V2ZW50KTtcbiAgICB9XG5cbiAgICByZXR1cm4gbmV4dDtcbiAgfTtcblxuICBTdGF0ZU5vZGUucHJvdG90eXBlLnRyYW5zaXRpb25QYXJhbGxlbE5vZGUgPSBmdW5jdGlvbiAoc3RhdGVWYWx1ZSwgc3RhdGUsIF9ldmVudCkge1xuICAgIHZhciBlXzIsIF9hO1xuXG4gICAgdmFyIHRyYW5zaXRpb25NYXAgPSB7fTtcblxuICAgIHRyeSB7XG4gICAgICBmb3IgKHZhciBfYiA9IF9fdmFsdWVzKGtleXMoc3RhdGVWYWx1ZSkpLCBfYyA9IF9iLm5leHQoKTsgIV9jLmRvbmU7IF9jID0gX2IubmV4dCgpKSB7XG4gICAgICAgIHZhciBzdWJTdGF0ZUtleSA9IF9jLnZhbHVlO1xuICAgICAgICB2YXIgc3ViU3RhdGVWYWx1ZSA9IHN0YXRlVmFsdWVbc3ViU3RhdGVLZXldO1xuXG4gICAgICAgIGlmICghc3ViU3RhdGVWYWx1ZSkge1xuICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICB9XG5cbiAgICAgICAgdmFyIHN1YlN0YXRlTm9kZSA9IHRoaXMuZ2V0U3RhdGVOb2RlKHN1YlN0YXRlS2V5KTtcblxuICAgICAgICB2YXIgbmV4dCA9IHN1YlN0YXRlTm9kZS5fdHJhbnNpdGlvbihzdWJTdGF0ZVZhbHVlLCBzdGF0ZSwgX2V2ZW50KTtcblxuICAgICAgICBpZiAobmV4dCkge1xuICAgICAgICAgIHRyYW5zaXRpb25NYXBbc3ViU3RhdGVLZXldID0gbmV4dDtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0gY2F0Y2ggKGVfMl8xKSB7XG4gICAgICBlXzIgPSB7XG4gICAgICAgIGVycm9yOiBlXzJfMVxuICAgICAgfTtcbiAgICB9IGZpbmFsbHkge1xuICAgICAgdHJ5IHtcbiAgICAgICAgaWYgKF9jICYmICFfYy5kb25lICYmIChfYSA9IF9iLnJldHVybikpIF9hLmNhbGwoX2IpO1xuICAgICAgfSBmaW5hbGx5IHtcbiAgICAgICAgaWYgKGVfMikgdGhyb3cgZV8yLmVycm9yO1xuICAgICAgfVxuICAgIH1cblxuICAgIHZhciBzdGF0ZVRyYW5zaXRpb25zID0ga2V5cyh0cmFuc2l0aW9uTWFwKS5tYXAoZnVuY3Rpb24gKGtleSkge1xuICAgICAgcmV0dXJuIHRyYW5zaXRpb25NYXBba2V5XTtcbiAgICB9KTtcbiAgICB2YXIgZW5hYmxlZFRyYW5zaXRpb25zID0gZmxhdHRlbihzdGF0ZVRyYW5zaXRpb25zLm1hcChmdW5jdGlvbiAoc3QpIHtcbiAgICAgIHJldHVybiBzdC50cmFuc2l0aW9ucztcbiAgICB9KSk7XG4gICAgdmFyIHdpbGxUcmFuc2l0aW9uID0gc3RhdGVUcmFuc2l0aW9ucy5zb21lKGZ1bmN0aW9uIChzdCkge1xuICAgICAgcmV0dXJuIHN0LnRyYW5zaXRpb25zLmxlbmd0aCA+IDA7XG4gICAgfSk7XG5cbiAgICBpZiAoIXdpbGxUcmFuc2l0aW9uKSB7XG4gICAgICByZXR1cm4gdGhpcy5uZXh0KHN0YXRlLCBfZXZlbnQpO1xuICAgIH1cblxuICAgIHZhciBlbnRyeU5vZGVzID0gZmxhdHRlbihzdGF0ZVRyYW5zaXRpb25zLm1hcChmdW5jdGlvbiAodCkge1xuICAgICAgcmV0dXJuIHQuZW50cnlTZXQ7XG4gICAgfSkpO1xuICAgIHZhciBjb25maWd1cmF0aW9uID0gZmxhdHRlbihrZXlzKHRyYW5zaXRpb25NYXApLm1hcChmdW5jdGlvbiAoa2V5KSB7XG4gICAgICByZXR1cm4gdHJhbnNpdGlvbk1hcFtrZXldLmNvbmZpZ3VyYXRpb247XG4gICAgfSkpO1xuICAgIHJldHVybiB7XG4gICAgICB0cmFuc2l0aW9uczogZW5hYmxlZFRyYW5zaXRpb25zLFxuICAgICAgZW50cnlTZXQ6IGVudHJ5Tm9kZXMsXG4gICAgICBleGl0U2V0OiBmbGF0dGVuKHN0YXRlVHJhbnNpdGlvbnMubWFwKGZ1bmN0aW9uICh0KSB7XG4gICAgICAgIHJldHVybiB0LmV4aXRTZXQ7XG4gICAgICB9KSksXG4gICAgICBjb25maWd1cmF0aW9uOiBjb25maWd1cmF0aW9uLFxuICAgICAgc291cmNlOiBzdGF0ZSxcbiAgICAgIGFjdGlvbnM6IGZsYXR0ZW4oa2V5cyh0cmFuc2l0aW9uTWFwKS5tYXAoZnVuY3Rpb24gKGtleSkge1xuICAgICAgICByZXR1cm4gdHJhbnNpdGlvbk1hcFtrZXldLmFjdGlvbnM7XG4gICAgICB9KSlcbiAgICB9O1xuICB9O1xuXG4gIFN0YXRlTm9kZS5wcm90b3R5cGUuX3RyYW5zaXRpb24gPSBmdW5jdGlvbiAoc3RhdGVWYWx1ZSwgc3RhdGUsIF9ldmVudCkge1xuICAgIC8vIGxlYWYgbm9kZVxuICAgIGlmIChpc1N0cmluZyhzdGF0ZVZhbHVlKSkge1xuICAgICAgcmV0dXJuIHRoaXMudHJhbnNpdGlvbkxlYWZOb2RlKHN0YXRlVmFsdWUsIHN0YXRlLCBfZXZlbnQpO1xuICAgIH0gLy8gaGllcmFyY2hpY2FsIG5vZGVcblxuXG4gICAgaWYgKGtleXMoc3RhdGVWYWx1ZSkubGVuZ3RoID09PSAxKSB7XG4gICAgICByZXR1cm4gdGhpcy50cmFuc2l0aW9uQ29tcG91bmROb2RlKHN0YXRlVmFsdWUsIHN0YXRlLCBfZXZlbnQpO1xuICAgIH0gLy8gb3J0aG9nb25hbCBub2RlXG5cblxuICAgIHJldHVybiB0aGlzLnRyYW5zaXRpb25QYXJhbGxlbE5vZGUoc3RhdGVWYWx1ZSwgc3RhdGUsIF9ldmVudCk7XG4gIH07XG5cbiAgU3RhdGVOb2RlLnByb3RvdHlwZS5uZXh0ID0gZnVuY3Rpb24gKHN0YXRlLCBfZXZlbnQpIHtcbiAgICB2YXIgZV8zLCBfYTtcblxuICAgIHZhciBfdGhpcyA9IHRoaXM7XG5cbiAgICB2YXIgZXZlbnROYW1lID0gX2V2ZW50Lm5hbWU7XG4gICAgdmFyIGFjdGlvbnMgPSBbXTtcbiAgICB2YXIgbmV4dFN0YXRlTm9kZXMgPSBbXTtcbiAgICB2YXIgc2VsZWN0ZWRUcmFuc2l0aW9uO1xuXG4gICAgdHJ5IHtcbiAgICAgIGZvciAodmFyIF9iID0gX192YWx1ZXModGhpcy5nZXRDYW5kaWRhdGVzKGV2ZW50TmFtZSkpLCBfYyA9IF9iLm5leHQoKTsgIV9jLmRvbmU7IF9jID0gX2IubmV4dCgpKSB7XG4gICAgICAgIHZhciBjYW5kaWRhdGUgPSBfYy52YWx1ZTtcbiAgICAgICAgdmFyIGNvbmQgPSBjYW5kaWRhdGUuY29uZCxcbiAgICAgICAgICAgIHN0YXRlSW4gPSBjYW5kaWRhdGUuaW47XG4gICAgICAgIHZhciByZXNvbHZlZENvbnRleHQgPSBzdGF0ZS5jb250ZXh0O1xuICAgICAgICB2YXIgaXNJblN0YXRlID0gc3RhdGVJbiA/IGlzU3RyaW5nKHN0YXRlSW4pICYmIGlzU3RhdGVJZChzdGF0ZUluKSA/IC8vIENoZWNrIGlmIGluIHN0YXRlIGJ5IElEXG4gICAgICAgIHN0YXRlLm1hdGNoZXModG9TdGF0ZVZhbHVlKHRoaXMuZ2V0U3RhdGVOb2RlQnlJZChzdGF0ZUluKS5wYXRoLCB0aGlzLmRlbGltaXRlcikpIDogLy8gQ2hlY2sgaWYgaW4gc3RhdGUgYnkgcmVsYXRpdmUgZ3JhbmRwYXJlbnRcbiAgICAgICAgbWF0Y2hlc1N0YXRlKHRvU3RhdGVWYWx1ZShzdGF0ZUluLCB0aGlzLmRlbGltaXRlciksIHBhdGgodGhpcy5wYXRoLnNsaWNlKDAsIC0yKSkoc3RhdGUudmFsdWUpKSA6IHRydWU7XG4gICAgICAgIHZhciBndWFyZFBhc3NlZCA9IGZhbHNlO1xuXG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgZ3VhcmRQYXNzZWQgPSAhY29uZCB8fCBldmFsdWF0ZUd1YXJkKHRoaXMubWFjaGluZSwgY29uZCwgcmVzb2x2ZWRDb250ZXh0LCBfZXZlbnQsIHN0YXRlKTtcbiAgICAgICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiVW5hYmxlIHRvIGV2YWx1YXRlIGd1YXJkICdcIiArIChjb25kLm5hbWUgfHwgY29uZC50eXBlKSArIFwiJyBpbiB0cmFuc2l0aW9uIGZvciBldmVudCAnXCIgKyBldmVudE5hbWUgKyBcIicgaW4gc3RhdGUgbm9kZSAnXCIgKyB0aGlzLmlkICsgXCInOlxcblwiICsgZXJyLm1lc3NhZ2UpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGd1YXJkUGFzc2VkICYmIGlzSW5TdGF0ZSkge1xuICAgICAgICAgIGlmIChjYW5kaWRhdGUudGFyZ2V0ICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgIG5leHRTdGF0ZU5vZGVzID0gY2FuZGlkYXRlLnRhcmdldDtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBhY3Rpb25zLnB1c2guYXBwbHkoYWN0aW9ucywgX19zcHJlYWQoY2FuZGlkYXRlLmFjdGlvbnMpKTtcbiAgICAgICAgICBzZWxlY3RlZFRyYW5zaXRpb24gPSBjYW5kaWRhdGU7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9IGNhdGNoIChlXzNfMSkge1xuICAgICAgZV8zID0ge1xuICAgICAgICBlcnJvcjogZV8zXzFcbiAgICAgIH07XG4gICAgfSBmaW5hbGx5IHtcbiAgICAgIHRyeSB7XG4gICAgICAgIGlmIChfYyAmJiAhX2MuZG9uZSAmJiAoX2EgPSBfYi5yZXR1cm4pKSBfYS5jYWxsKF9iKTtcbiAgICAgIH0gZmluYWxseSB7XG4gICAgICAgIGlmIChlXzMpIHRocm93IGVfMy5lcnJvcjtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAoIXNlbGVjdGVkVHJhbnNpdGlvbikge1xuICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgICB9XG5cbiAgICBpZiAoIW5leHRTdGF0ZU5vZGVzLmxlbmd0aCkge1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgdHJhbnNpdGlvbnM6IFtzZWxlY3RlZFRyYW5zaXRpb25dLFxuICAgICAgICBlbnRyeVNldDogW10sXG4gICAgICAgIGV4aXRTZXQ6IFtdLFxuICAgICAgICBjb25maWd1cmF0aW9uOiBzdGF0ZS52YWx1ZSA/IFt0aGlzXSA6IFtdLFxuICAgICAgICBzb3VyY2U6IHN0YXRlLFxuICAgICAgICBhY3Rpb25zOiBhY3Rpb25zXG4gICAgICB9O1xuICAgIH1cblxuICAgIHZhciBhbGxOZXh0U3RhdGVOb2RlcyA9IGZsYXR0ZW4obmV4dFN0YXRlTm9kZXMubWFwKGZ1bmN0aW9uIChzdGF0ZU5vZGUpIHtcbiAgICAgIHJldHVybiBfdGhpcy5nZXRSZWxhdGl2ZVN0YXRlTm9kZXMoc3RhdGVOb2RlLCBzdGF0ZS5oaXN0b3J5VmFsdWUpO1xuICAgIH0pKTtcbiAgICB2YXIgaXNJbnRlcm5hbCA9ICEhc2VsZWN0ZWRUcmFuc2l0aW9uLmludGVybmFsO1xuICAgIHZhciByZWVudHJ5Tm9kZXMgPSBpc0ludGVybmFsID8gW10gOiBmbGF0dGVuKGFsbE5leHRTdGF0ZU5vZGVzLm1hcChmdW5jdGlvbiAobikge1xuICAgICAgcmV0dXJuIF90aGlzLm5vZGVzRnJvbUNoaWxkKG4pO1xuICAgIH0pKTtcbiAgICByZXR1cm4ge1xuICAgICAgdHJhbnNpdGlvbnM6IFtzZWxlY3RlZFRyYW5zaXRpb25dLFxuICAgICAgZW50cnlTZXQ6IHJlZW50cnlOb2RlcyxcbiAgICAgIGV4aXRTZXQ6IGlzSW50ZXJuYWwgPyBbXSA6IFt0aGlzXSxcbiAgICAgIGNvbmZpZ3VyYXRpb246IGFsbE5leHRTdGF0ZU5vZGVzLFxuICAgICAgc291cmNlOiBzdGF0ZSxcbiAgICAgIGFjdGlvbnM6IGFjdGlvbnNcbiAgICB9O1xuICB9O1xuXG4gIFN0YXRlTm9kZS5wcm90b3R5cGUubm9kZXNGcm9tQ2hpbGQgPSBmdW5jdGlvbiAoY2hpbGRTdGF0ZU5vZGUpIHtcbiAgICBpZiAoY2hpbGRTdGF0ZU5vZGUuZXNjYXBlcyh0aGlzKSkge1xuICAgICAgcmV0dXJuIFtdO1xuICAgIH1cblxuICAgIHZhciBub2RlcyA9IFtdO1xuICAgIHZhciBtYXJrZXIgPSBjaGlsZFN0YXRlTm9kZTtcblxuICAgIHdoaWxlIChtYXJrZXIgJiYgbWFya2VyICE9PSB0aGlzKSB7XG4gICAgICBub2Rlcy5wdXNoKG1hcmtlcik7XG4gICAgICBtYXJrZXIgPSBtYXJrZXIucGFyZW50O1xuICAgIH1cblxuICAgIG5vZGVzLnB1c2godGhpcyk7IC8vIGluY2x1c2l2ZVxuXG4gICAgcmV0dXJuIG5vZGVzO1xuICB9O1xuICAvKipcclxuICAgKiBXaGV0aGVyIHRoZSBnaXZlbiBzdGF0ZSBub2RlIFwiZXNjYXBlc1wiIHRoaXMgc3RhdGUgbm9kZS4gSWYgdGhlIGBzdGF0ZU5vZGVgIGlzIGVxdWFsIHRvIG9yIHRoZSBwYXJlbnQgb2ZcclxuICAgKiB0aGlzIHN0YXRlIG5vZGUsIGl0IGRvZXMgbm90IGVzY2FwZS5cclxuICAgKi9cblxuXG4gIFN0YXRlTm9kZS5wcm90b3R5cGUuZXNjYXBlcyA9IGZ1bmN0aW9uIChzdGF0ZU5vZGUpIHtcbiAgICBpZiAodGhpcyA9PT0gc3RhdGVOb2RlKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgdmFyIHBhcmVudCA9IHRoaXMucGFyZW50O1xuXG4gICAgd2hpbGUgKHBhcmVudCkge1xuICAgICAgaWYgKHBhcmVudCA9PT0gc3RhdGVOb2RlKSB7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgIH1cblxuICAgICAgcGFyZW50ID0gcGFyZW50LnBhcmVudDtcbiAgICB9XG5cbiAgICByZXR1cm4gdHJ1ZTtcbiAgfTtcblxuICBTdGF0ZU5vZGUucHJvdG90eXBlLmdldEFjdGlvbnMgPSBmdW5jdGlvbiAodHJhbnNpdGlvbiwgY3VycmVudENvbnRleHQsIF9ldmVudCwgcHJldlN0YXRlKSB7XG4gICAgdmFyIGVfNCwgX2EsIGVfNSwgX2I7XG5cbiAgICB2YXIgcHJldkNvbmZpZyA9IGdldENvbmZpZ3VyYXRpb24oW10sIHByZXZTdGF0ZSA/IHRoaXMuZ2V0U3RhdGVOb2RlcyhwcmV2U3RhdGUudmFsdWUpIDogW3RoaXNdKTtcbiAgICB2YXIgcmVzb2x2ZWRDb25maWcgPSB0cmFuc2l0aW9uLmNvbmZpZ3VyYXRpb24ubGVuZ3RoID8gZ2V0Q29uZmlndXJhdGlvbihwcmV2Q29uZmlnLCB0cmFuc2l0aW9uLmNvbmZpZ3VyYXRpb24pIDogcHJldkNvbmZpZztcblxuICAgIHRyeSB7XG4gICAgICBmb3IgKHZhciByZXNvbHZlZENvbmZpZ18xID0gX192YWx1ZXMocmVzb2x2ZWRDb25maWcpLCByZXNvbHZlZENvbmZpZ18xXzEgPSByZXNvbHZlZENvbmZpZ18xLm5leHQoKTsgIXJlc29sdmVkQ29uZmlnXzFfMS5kb25lOyByZXNvbHZlZENvbmZpZ18xXzEgPSByZXNvbHZlZENvbmZpZ18xLm5leHQoKSkge1xuICAgICAgICB2YXIgc24gPSByZXNvbHZlZENvbmZpZ18xXzEudmFsdWU7XG5cbiAgICAgICAgaWYgKCFoYXMocHJldkNvbmZpZywgc24pKSB7XG4gICAgICAgICAgdHJhbnNpdGlvbi5lbnRyeVNldC5wdXNoKHNuKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0gY2F0Y2ggKGVfNF8xKSB7XG4gICAgICBlXzQgPSB7XG4gICAgICAgIGVycm9yOiBlXzRfMVxuICAgICAgfTtcbiAgICB9IGZpbmFsbHkge1xuICAgICAgdHJ5IHtcbiAgICAgICAgaWYgKHJlc29sdmVkQ29uZmlnXzFfMSAmJiAhcmVzb2x2ZWRDb25maWdfMV8xLmRvbmUgJiYgKF9hID0gcmVzb2x2ZWRDb25maWdfMS5yZXR1cm4pKSBfYS5jYWxsKHJlc29sdmVkQ29uZmlnXzEpO1xuICAgICAgfSBmaW5hbGx5IHtcbiAgICAgICAgaWYgKGVfNCkgdGhyb3cgZV80LmVycm9yO1xuICAgICAgfVxuICAgIH1cblxuICAgIHRyeSB7XG4gICAgICBmb3IgKHZhciBwcmV2Q29uZmlnXzEgPSBfX3ZhbHVlcyhwcmV2Q29uZmlnKSwgcHJldkNvbmZpZ18xXzEgPSBwcmV2Q29uZmlnXzEubmV4dCgpOyAhcHJldkNvbmZpZ18xXzEuZG9uZTsgcHJldkNvbmZpZ18xXzEgPSBwcmV2Q29uZmlnXzEubmV4dCgpKSB7XG4gICAgICAgIHZhciBzbiA9IHByZXZDb25maWdfMV8xLnZhbHVlO1xuXG4gICAgICAgIGlmICghaGFzKHJlc29sdmVkQ29uZmlnLCBzbikgfHwgaGFzKHRyYW5zaXRpb24uZXhpdFNldCwgc24ucGFyZW50KSkge1xuICAgICAgICAgIHRyYW5zaXRpb24uZXhpdFNldC5wdXNoKHNuKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0gY2F0Y2ggKGVfNV8xKSB7XG4gICAgICBlXzUgPSB7XG4gICAgICAgIGVycm9yOiBlXzVfMVxuICAgICAgfTtcbiAgICB9IGZpbmFsbHkge1xuICAgICAgdHJ5IHtcbiAgICAgICAgaWYgKHByZXZDb25maWdfMV8xICYmICFwcmV2Q29uZmlnXzFfMS5kb25lICYmIChfYiA9IHByZXZDb25maWdfMS5yZXR1cm4pKSBfYi5jYWxsKHByZXZDb25maWdfMSk7XG4gICAgICB9IGZpbmFsbHkge1xuICAgICAgICBpZiAoZV81KSB0aHJvdyBlXzUuZXJyb3I7XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKCF0cmFuc2l0aW9uLnNvdXJjZSkge1xuICAgICAgdHJhbnNpdGlvbi5leGl0U2V0ID0gW107IC8vIEVuc3VyZSB0aGF0IHJvb3QgU3RhdGVOb2RlIChtYWNoaW5lKSBpcyBlbnRlcmVkXG5cbiAgICAgIHRyYW5zaXRpb24uZW50cnlTZXQucHVzaCh0aGlzKTtcbiAgICB9XG5cbiAgICB2YXIgZG9uZUV2ZW50cyA9IGZsYXR0ZW4odHJhbnNpdGlvbi5lbnRyeVNldC5tYXAoZnVuY3Rpb24gKHNuKSB7XG4gICAgICB2YXIgZXZlbnRzID0gW107XG5cbiAgICAgIGlmIChzbi50eXBlICE9PSAnZmluYWwnKSB7XG4gICAgICAgIHJldHVybiBldmVudHM7XG4gICAgICB9XG5cbiAgICAgIHZhciBwYXJlbnQgPSBzbi5wYXJlbnQ7XG5cbiAgICAgIGlmICghcGFyZW50LnBhcmVudCkge1xuICAgICAgICByZXR1cm4gZXZlbnRzO1xuICAgICAgfVxuXG4gICAgICBldmVudHMucHVzaChkb25lKHNuLmlkLCBzbi5kb25lRGF0YSksIC8vIFRPRE86IGRlcHJlY2F0ZSAtIGZpbmFsIHN0YXRlcyBzaG91bGQgbm90IGVtaXQgZG9uZSBldmVudHMgZm9yIHRoZWlyIG93biBzdGF0ZS5cbiAgICAgIGRvbmUocGFyZW50LmlkLCBzbi5kb25lRGF0YSA/IG1hcENvbnRleHQoc24uZG9uZURhdGEsIGN1cnJlbnRDb250ZXh0LCBfZXZlbnQpIDogdW5kZWZpbmVkKSk7XG4gICAgICB2YXIgZ3JhbmRwYXJlbnQgPSBwYXJlbnQucGFyZW50O1xuXG4gICAgICBpZiAoZ3JhbmRwYXJlbnQudHlwZSA9PT0gJ3BhcmFsbGVsJykge1xuICAgICAgICBpZiAoZ2V0Q2hpbGRyZW4oZ3JhbmRwYXJlbnQpLmV2ZXJ5KGZ1bmN0aW9uIChwYXJlbnROb2RlKSB7XG4gICAgICAgICAgcmV0dXJuIGlzSW5GaW5hbFN0YXRlKHRyYW5zaXRpb24uY29uZmlndXJhdGlvbiwgcGFyZW50Tm9kZSk7XG4gICAgICAgIH0pKSB7XG4gICAgICAgICAgZXZlbnRzLnB1c2goZG9uZShncmFuZHBhcmVudC5pZCkpO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBldmVudHM7XG4gICAgfSkpO1xuICAgIHRyYW5zaXRpb24uZXhpdFNldC5zb3J0KGZ1bmN0aW9uIChhLCBiKSB7XG4gICAgICByZXR1cm4gYi5vcmRlciAtIGEub3JkZXI7XG4gICAgfSk7XG4gICAgdHJhbnNpdGlvbi5lbnRyeVNldC5zb3J0KGZ1bmN0aW9uIChhLCBiKSB7XG4gICAgICByZXR1cm4gYS5vcmRlciAtIGIub3JkZXI7XG4gICAgfSk7XG4gICAgdmFyIGVudHJ5U3RhdGVzID0gbmV3IFNldCh0cmFuc2l0aW9uLmVudHJ5U2V0KTtcbiAgICB2YXIgZXhpdFN0YXRlcyA9IG5ldyBTZXQodHJhbnNpdGlvbi5leGl0U2V0KTtcblxuICAgIHZhciBfYyA9IF9fcmVhZChbZmxhdHRlbihBcnJheS5mcm9tKGVudHJ5U3RhdGVzKS5tYXAoZnVuY3Rpb24gKHN0YXRlTm9kZSkge1xuICAgICAgcmV0dXJuIF9fc3ByZWFkKHN0YXRlTm9kZS5hY3Rpdml0aWVzLm1hcChmdW5jdGlvbiAoYWN0aXZpdHkpIHtcbiAgICAgICAgcmV0dXJuIHN0YXJ0KGFjdGl2aXR5KTtcbiAgICAgIH0pLCBzdGF0ZU5vZGUub25FbnRyeSk7XG4gICAgfSkpLmNvbmNhdChkb25lRXZlbnRzLm1hcChyYWlzZSkpLCBmbGF0dGVuKEFycmF5LmZyb20oZXhpdFN0YXRlcykubWFwKGZ1bmN0aW9uIChzdGF0ZU5vZGUpIHtcbiAgICAgIHJldHVybiBfX3NwcmVhZChzdGF0ZU5vZGUub25FeGl0LCBzdGF0ZU5vZGUuYWN0aXZpdGllcy5tYXAoZnVuY3Rpb24gKGFjdGl2aXR5KSB7XG4gICAgICAgIHJldHVybiBzdG9wKGFjdGl2aXR5KTtcbiAgICAgIH0pKTtcbiAgICB9KSldLCAyKSxcbiAgICAgICAgZW50cnlBY3Rpb25zID0gX2NbMF0sXG4gICAgICAgIGV4aXRBY3Rpb25zID0gX2NbMV07XG5cbiAgICB2YXIgYWN0aW9ucyA9IHRvQWN0aW9uT2JqZWN0cyhleGl0QWN0aW9ucy5jb25jYXQodHJhbnNpdGlvbi5hY3Rpb25zKS5jb25jYXQoZW50cnlBY3Rpb25zKSwgdGhpcy5tYWNoaW5lLm9wdGlvbnMuYWN0aW9ucyk7XG4gICAgcmV0dXJuIGFjdGlvbnM7XG4gIH07XG4gIC8qKlxyXG4gICAqIERldGVybWluZXMgdGhlIG5leHQgc3RhdGUgZ2l2ZW4gdGhlIGN1cnJlbnQgYHN0YXRlYCBhbmQgc2VudCBgZXZlbnRgLlxyXG4gICAqXHJcbiAgICogQHBhcmFtIHN0YXRlIFRoZSBjdXJyZW50IFN0YXRlIGluc3RhbmNlIG9yIHN0YXRlIHZhbHVlXHJcbiAgICogQHBhcmFtIGV2ZW50IFRoZSBldmVudCB0aGF0IHdhcyBzZW50IGF0IHRoZSBjdXJyZW50IHN0YXRlXHJcbiAgICogQHBhcmFtIGNvbnRleHQgVGhlIGN1cnJlbnQgY29udGV4dCAoZXh0ZW5kZWQgc3RhdGUpIG9mIHRoZSBjdXJyZW50IHN0YXRlXHJcbiAgICovXG5cblxuICBTdGF0ZU5vZGUucHJvdG90eXBlLnRyYW5zaXRpb24gPSBmdW5jdGlvbiAoc3RhdGUsIGV2ZW50LCBjb250ZXh0KSB7XG4gICAgaWYgKHN0YXRlID09PSB2b2lkIDApIHtcbiAgICAgIHN0YXRlID0gdGhpcy5pbml0aWFsU3RhdGU7XG4gICAgfVxuXG4gICAgdmFyIF9ldmVudCA9IHRvU0NYTUxFdmVudChldmVudCk7XG5cbiAgICB2YXIgY3VycmVudFN0YXRlO1xuXG4gICAgaWYgKHN0YXRlIGluc3RhbmNlb2YgU3RhdGUpIHtcbiAgICAgIGN1cnJlbnRTdGF0ZSA9IGNvbnRleHQgPT09IHVuZGVmaW5lZCA/IHN0YXRlIDogdGhpcy5yZXNvbHZlU3RhdGUoU3RhdGUuZnJvbShzdGF0ZSwgY29udGV4dCkpO1xuICAgIH0gZWxzZSB7XG4gICAgICB2YXIgcmVzb2x2ZWRTdGF0ZVZhbHVlID0gaXNTdHJpbmcoc3RhdGUpID8gdGhpcy5yZXNvbHZlKHBhdGhUb1N0YXRlVmFsdWUodGhpcy5nZXRSZXNvbHZlZFBhdGgoc3RhdGUpKSkgOiB0aGlzLnJlc29sdmUoc3RhdGUpO1xuICAgICAgdmFyIHJlc29sdmVkQ29udGV4dCA9IGNvbnRleHQgPyBjb250ZXh0IDogdGhpcy5tYWNoaW5lLmNvbnRleHQ7XG4gICAgICBjdXJyZW50U3RhdGUgPSB0aGlzLnJlc29sdmVTdGF0ZShTdGF0ZS5mcm9tKHJlc29sdmVkU3RhdGVWYWx1ZSwgcmVzb2x2ZWRDb250ZXh0KSk7XG4gICAgfVxuXG4gICAgaWYgKCFJU19QUk9EVUNUSU9OICYmIF9ldmVudC5uYW1lID09PSBXSUxEQ0FSRCkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKFwiQW4gZXZlbnQgY2Fubm90IGhhdmUgdGhlIHdpbGRjYXJkIHR5cGUgKCdcIiArIFdJTERDQVJEICsgXCInKVwiKTtcbiAgICB9XG5cbiAgICBpZiAodGhpcy5zdHJpY3QpIHtcbiAgICAgIGlmICghdGhpcy5ldmVudHMuaW5jbHVkZXMoX2V2ZW50Lm5hbWUpICYmICFpc0J1aWx0SW5FdmVudChfZXZlbnQubmFtZSkpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiTWFjaGluZSAnXCIgKyB0aGlzLmlkICsgXCInIGRvZXMgbm90IGFjY2VwdCBldmVudCAnXCIgKyBfZXZlbnQubmFtZSArIFwiJ1wiKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICB2YXIgc3RhdGVUcmFuc2l0aW9uID0gdGhpcy5fdHJhbnNpdGlvbihjdXJyZW50U3RhdGUudmFsdWUsIGN1cnJlbnRTdGF0ZSwgX2V2ZW50KSB8fCB7XG4gICAgICB0cmFuc2l0aW9uczogW10sXG4gICAgICBjb25maWd1cmF0aW9uOiBbXSxcbiAgICAgIGVudHJ5U2V0OiBbXSxcbiAgICAgIGV4aXRTZXQ6IFtdLFxuICAgICAgc291cmNlOiBjdXJyZW50U3RhdGUsXG4gICAgICBhY3Rpb25zOiBbXVxuICAgIH07XG4gICAgdmFyIHByZXZDb25maWcgPSBnZXRDb25maWd1cmF0aW9uKFtdLCB0aGlzLmdldFN0YXRlTm9kZXMoY3VycmVudFN0YXRlLnZhbHVlKSk7XG4gICAgdmFyIHJlc29sdmVkQ29uZmlnID0gc3RhdGVUcmFuc2l0aW9uLmNvbmZpZ3VyYXRpb24ubGVuZ3RoID8gZ2V0Q29uZmlndXJhdGlvbihwcmV2Q29uZmlnLCBzdGF0ZVRyYW5zaXRpb24uY29uZmlndXJhdGlvbikgOiBwcmV2Q29uZmlnO1xuICAgIHN0YXRlVHJhbnNpdGlvbi5jb25maWd1cmF0aW9uID0gX19zcHJlYWQocmVzb2x2ZWRDb25maWcpO1xuICAgIHJldHVybiB0aGlzLnJlc29sdmVUcmFuc2l0aW9uKHN0YXRlVHJhbnNpdGlvbiwgY3VycmVudFN0YXRlLCBfZXZlbnQpO1xuICB9O1xuXG4gIFN0YXRlTm9kZS5wcm90b3R5cGUucmVzb2x2ZVJhaXNlZFRyYW5zaXRpb24gPSBmdW5jdGlvbiAoc3RhdGUsIF9ldmVudCwgb3JpZ2luYWxFdmVudCkge1xuICAgIHZhciBfYTtcblxuICAgIHZhciBjdXJyZW50QWN0aW9ucyA9IHN0YXRlLmFjdGlvbnM7XG4gICAgc3RhdGUgPSB0aGlzLnRyYW5zaXRpb24oc3RhdGUsIF9ldmVudCk7IC8vIFNhdmUgb3JpZ2luYWwgZXZlbnQgdG8gc3RhdGVcbiAgICAvLyBUT0RPOiB0aGlzIHNob3VsZCBiZSB0aGUgcmFpc2VkIGV2ZW50ISBEZWxldGUgaW4gVjUgKGJyZWFraW5nKVxuXG4gICAgc3RhdGUuX2V2ZW50ID0gb3JpZ2luYWxFdmVudDtcbiAgICBzdGF0ZS5ldmVudCA9IG9yaWdpbmFsRXZlbnQuZGF0YTtcblxuICAgIChfYSA9IHN0YXRlLmFjdGlvbnMpLnVuc2hpZnQuYXBwbHkoX2EsIF9fc3ByZWFkKGN1cnJlbnRBY3Rpb25zKSk7XG5cbiAgICByZXR1cm4gc3RhdGU7XG4gIH07XG5cbiAgU3RhdGVOb2RlLnByb3RvdHlwZS5yZXNvbHZlVHJhbnNpdGlvbiA9IGZ1bmN0aW9uIChzdGF0ZVRyYW5zaXRpb24sIGN1cnJlbnRTdGF0ZSwgX2V2ZW50LCBjb250ZXh0KSB7XG4gICAgdmFyIGVfNiwgX2E7XG5cbiAgICB2YXIgX3RoaXMgPSB0aGlzO1xuXG4gICAgaWYgKF9ldmVudCA9PT0gdm9pZCAwKSB7XG4gICAgICBfZXZlbnQgPSBpbml0RXZlbnQ7XG4gICAgfVxuXG4gICAgaWYgKGNvbnRleHQgPT09IHZvaWQgMCkge1xuICAgICAgY29udGV4dCA9IHRoaXMubWFjaGluZS5jb250ZXh0O1xuICAgIH1cblxuICAgIHZhciBjb25maWd1cmF0aW9uID0gc3RhdGVUcmFuc2l0aW9uLmNvbmZpZ3VyYXRpb247IC8vIFRyYW5zaXRpb24gd2lsbCBcImFwcGx5XCIgaWY6XG4gICAgLy8gLSB0aGlzIGlzIHRoZSBpbml0aWFsIHN0YXRlICh0aGVyZSBpcyBubyBjdXJyZW50IHN0YXRlKVxuICAgIC8vIC0gT1IgdGhlcmUgYXJlIHRyYW5zaXRpb25zXG5cbiAgICB2YXIgd2lsbFRyYW5zaXRpb24gPSAhY3VycmVudFN0YXRlIHx8IHN0YXRlVHJhbnNpdGlvbi50cmFuc2l0aW9ucy5sZW5ndGggPiAwO1xuICAgIHZhciByZXNvbHZlZFN0YXRlVmFsdWUgPSB3aWxsVHJhbnNpdGlvbiA/IGdldFZhbHVlKHRoaXMubWFjaGluZSwgY29uZmlndXJhdGlvbikgOiB1bmRlZmluZWQ7XG4gICAgdmFyIGhpc3RvcnlWYWx1ZSA9IGN1cnJlbnRTdGF0ZSA/IGN1cnJlbnRTdGF0ZS5oaXN0b3J5VmFsdWUgPyBjdXJyZW50U3RhdGUuaGlzdG9yeVZhbHVlIDogc3RhdGVUcmFuc2l0aW9uLnNvdXJjZSA/IHRoaXMubWFjaGluZS5oaXN0b3J5VmFsdWUoY3VycmVudFN0YXRlLnZhbHVlKSA6IHVuZGVmaW5lZCA6IHVuZGVmaW5lZDtcbiAgICB2YXIgY3VycmVudENvbnRleHQgPSBjdXJyZW50U3RhdGUgPyBjdXJyZW50U3RhdGUuY29udGV4dCA6IGNvbnRleHQ7XG4gICAgdmFyIGFjdGlvbnMgPSB0aGlzLmdldEFjdGlvbnMoc3RhdGVUcmFuc2l0aW9uLCBjdXJyZW50Q29udGV4dCwgX2V2ZW50LCBjdXJyZW50U3RhdGUpO1xuICAgIHZhciBhY3Rpdml0aWVzID0gY3VycmVudFN0YXRlID8gX19hc3NpZ24oe30sIGN1cnJlbnRTdGF0ZS5hY3Rpdml0aWVzKSA6IHt9O1xuXG4gICAgdHJ5IHtcbiAgICAgIGZvciAodmFyIGFjdGlvbnNfMSA9IF9fdmFsdWVzKGFjdGlvbnMpLCBhY3Rpb25zXzFfMSA9IGFjdGlvbnNfMS5uZXh0KCk7ICFhY3Rpb25zXzFfMS5kb25lOyBhY3Rpb25zXzFfMSA9IGFjdGlvbnNfMS5uZXh0KCkpIHtcbiAgICAgICAgdmFyIGFjdGlvbiA9IGFjdGlvbnNfMV8xLnZhbHVlO1xuXG4gICAgICAgIGlmIChhY3Rpb24udHlwZSA9PT0gc3RhcnQkMSkge1xuICAgICAgICAgIGFjdGl2aXRpZXNbYWN0aW9uLmFjdGl2aXR5LmlkIHx8IGFjdGlvbi5hY3Rpdml0eS50eXBlXSA9IGFjdGlvbjtcbiAgICAgICAgfSBlbHNlIGlmIChhY3Rpb24udHlwZSA9PT0gc3RvcCQxKSB7XG4gICAgICAgICAgYWN0aXZpdGllc1thY3Rpb24uYWN0aXZpdHkuaWQgfHwgYWN0aW9uLmFjdGl2aXR5LnR5cGVdID0gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9IGNhdGNoIChlXzZfMSkge1xuICAgICAgZV82ID0ge1xuICAgICAgICBlcnJvcjogZV82XzFcbiAgICAgIH07XG4gICAgfSBmaW5hbGx5IHtcbiAgICAgIHRyeSB7XG4gICAgICAgIGlmIChhY3Rpb25zXzFfMSAmJiAhYWN0aW9uc18xXzEuZG9uZSAmJiAoX2EgPSBhY3Rpb25zXzEucmV0dXJuKSkgX2EuY2FsbChhY3Rpb25zXzEpO1xuICAgICAgfSBmaW5hbGx5IHtcbiAgICAgICAgaWYgKGVfNikgdGhyb3cgZV82LmVycm9yO1xuICAgICAgfVxuICAgIH1cblxuICAgIHZhciBfYiA9IF9fcmVhZChyZXNvbHZlQWN0aW9ucyh0aGlzLCBjdXJyZW50U3RhdGUsIGN1cnJlbnRDb250ZXh0LCBfZXZlbnQsIGFjdGlvbnMpLCAyKSxcbiAgICAgICAgcmVzb2x2ZWRBY3Rpb25zID0gX2JbMF0sXG4gICAgICAgIHVwZGF0ZWRDb250ZXh0ID0gX2JbMV07XG5cbiAgICB2YXIgX2MgPSBfX3JlYWQocGFydGl0aW9uKHJlc29sdmVkQWN0aW9ucywgZnVuY3Rpb24gKGFjdGlvbikge1xuICAgICAgcmV0dXJuIGFjdGlvbi50eXBlID09PSByYWlzZSQxIHx8IGFjdGlvbi50eXBlID09PSBzZW5kJDEgJiYgYWN0aW9uLnRvID09PSBTcGVjaWFsVGFyZ2V0cy5JbnRlcm5hbDtcbiAgICB9KSwgMiksXG4gICAgICAgIHJhaXNlZEV2ZW50cyA9IF9jWzBdLFxuICAgICAgICBub25SYWlzZWRBY3Rpb25zID0gX2NbMV07XG5cbiAgICB2YXIgaW52b2tlQWN0aW9ucyA9IHJlc29sdmVkQWN0aW9ucy5maWx0ZXIoZnVuY3Rpb24gKGFjdGlvbikge1xuICAgICAgdmFyIF9hO1xuXG4gICAgICByZXR1cm4gYWN0aW9uLnR5cGUgPT09IHN0YXJ0JDEgJiYgKChfYSA9IGFjdGlvbi5hY3Rpdml0eSkgPT09IG51bGwgfHwgX2EgPT09IHZvaWQgMCA/IHZvaWQgMCA6IF9hLnR5cGUpID09PSBpbnZva2U7XG4gICAgfSk7XG4gICAgdmFyIGNoaWxkcmVuID0gaW52b2tlQWN0aW9ucy5yZWR1Y2UoZnVuY3Rpb24gKGFjYywgYWN0aW9uKSB7XG4gICAgICBhY2NbYWN0aW9uLmFjdGl2aXR5LmlkXSA9IGNyZWF0ZUludm9jYWJsZUFjdG9yKGFjdGlvbi5hY3Rpdml0eSwgX3RoaXMubWFjaGluZSwgdXBkYXRlZENvbnRleHQsIF9ldmVudCk7XG4gICAgICByZXR1cm4gYWNjO1xuICAgIH0sIGN1cnJlbnRTdGF0ZSA/IF9fYXNzaWduKHt9LCBjdXJyZW50U3RhdGUuY2hpbGRyZW4pIDoge30pO1xuICAgIHZhciByZXNvbHZlZENvbmZpZ3VyYXRpb24gPSByZXNvbHZlZFN0YXRlVmFsdWUgPyBzdGF0ZVRyYW5zaXRpb24uY29uZmlndXJhdGlvbiA6IGN1cnJlbnRTdGF0ZSA/IGN1cnJlbnRTdGF0ZS5jb25maWd1cmF0aW9uIDogW107XG4gICAgdmFyIG1ldGEgPSByZXNvbHZlZENvbmZpZ3VyYXRpb24ucmVkdWNlKGZ1bmN0aW9uIChhY2MsIHN0YXRlTm9kZSkge1xuICAgICAgaWYgKHN0YXRlTm9kZS5tZXRhICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgYWNjW3N0YXRlTm9kZS5pZF0gPSBzdGF0ZU5vZGUubWV0YTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIGFjYztcbiAgICB9LCB7fSk7XG4gICAgdmFyIGlzRG9uZSA9IGlzSW5GaW5hbFN0YXRlKHJlc29sdmVkQ29uZmlndXJhdGlvbiwgdGhpcyk7XG4gICAgdmFyIG5leHRTdGF0ZSA9IG5ldyBTdGF0ZSh7XG4gICAgICB2YWx1ZTogcmVzb2x2ZWRTdGF0ZVZhbHVlIHx8IGN1cnJlbnRTdGF0ZS52YWx1ZSxcbiAgICAgIGNvbnRleHQ6IHVwZGF0ZWRDb250ZXh0LFxuICAgICAgX2V2ZW50OiBfZXZlbnQsXG4gICAgICAvLyBQZXJzaXN0IF9zZXNzaW9uaWQgYmV0d2VlbiBzdGF0ZXNcbiAgICAgIF9zZXNzaW9uaWQ6IGN1cnJlbnRTdGF0ZSA/IGN1cnJlbnRTdGF0ZS5fc2Vzc2lvbmlkIDogbnVsbCxcbiAgICAgIGhpc3RvcnlWYWx1ZTogcmVzb2x2ZWRTdGF0ZVZhbHVlID8gaGlzdG9yeVZhbHVlID8gdXBkYXRlSGlzdG9yeVZhbHVlKGhpc3RvcnlWYWx1ZSwgcmVzb2x2ZWRTdGF0ZVZhbHVlKSA6IHVuZGVmaW5lZCA6IGN1cnJlbnRTdGF0ZSA/IGN1cnJlbnRTdGF0ZS5oaXN0b3J5VmFsdWUgOiB1bmRlZmluZWQsXG4gICAgICBoaXN0b3J5OiAhcmVzb2x2ZWRTdGF0ZVZhbHVlIHx8IHN0YXRlVHJhbnNpdGlvbi5zb3VyY2UgPyBjdXJyZW50U3RhdGUgOiB1bmRlZmluZWQsXG4gICAgICBhY3Rpb25zOiByZXNvbHZlZFN0YXRlVmFsdWUgPyBub25SYWlzZWRBY3Rpb25zIDogW10sXG4gICAgICBhY3Rpdml0aWVzOiByZXNvbHZlZFN0YXRlVmFsdWUgPyBhY3Rpdml0aWVzIDogY3VycmVudFN0YXRlID8gY3VycmVudFN0YXRlLmFjdGl2aXRpZXMgOiB7fSxcbiAgICAgIG1ldGE6IHJlc29sdmVkU3RhdGVWYWx1ZSA/IG1ldGEgOiBjdXJyZW50U3RhdGUgPyBjdXJyZW50U3RhdGUubWV0YSA6IHVuZGVmaW5lZCxcbiAgICAgIGV2ZW50czogW10sXG4gICAgICBjb25maWd1cmF0aW9uOiByZXNvbHZlZENvbmZpZ3VyYXRpb24sXG4gICAgICB0cmFuc2l0aW9uczogc3RhdGVUcmFuc2l0aW9uLnRyYW5zaXRpb25zLFxuICAgICAgY2hpbGRyZW46IGNoaWxkcmVuLFxuICAgICAgZG9uZTogaXNEb25lXG4gICAgfSk7XG4gICAgdmFyIGRpZFVwZGF0ZUNvbnRleHQgPSBjdXJyZW50Q29udGV4dCAhPT0gdXBkYXRlZENvbnRleHQ7XG4gICAgbmV4dFN0YXRlLmNoYW5nZWQgPSBfZXZlbnQubmFtZSA9PT0gdXBkYXRlIHx8IGRpZFVwZGF0ZUNvbnRleHQ7IC8vIERpc3Bvc2Ugb2YgcGVudWx0aW1hdGUgaGlzdG9yaWVzIHRvIHByZXZlbnQgbWVtb3J5IGxlYWtzXG5cbiAgICB2YXIgaGlzdG9yeSA9IG5leHRTdGF0ZS5oaXN0b3J5O1xuXG4gICAgaWYgKGhpc3RvcnkpIHtcbiAgICAgIGRlbGV0ZSBoaXN0b3J5Lmhpc3Rvcnk7XG4gICAgfVxuXG4gICAgaWYgKCFyZXNvbHZlZFN0YXRlVmFsdWUpIHtcbiAgICAgIHJldHVybiBuZXh0U3RhdGU7XG4gICAgfVxuXG4gICAgdmFyIG1heWJlTmV4dFN0YXRlID0gbmV4dFN0YXRlO1xuXG4gICAgaWYgKCFpc0RvbmUpIHtcbiAgICAgIHZhciBpc1RyYW5zaWVudCA9IHRoaXMuX3RyYW5zaWVudCB8fCBjb25maWd1cmF0aW9uLnNvbWUoZnVuY3Rpb24gKHN0YXRlTm9kZSkge1xuICAgICAgICByZXR1cm4gc3RhdGVOb2RlLl90cmFuc2llbnQ7XG4gICAgICB9KTtcblxuICAgICAgaWYgKGlzVHJhbnNpZW50KSB7XG4gICAgICAgIG1heWJlTmV4dFN0YXRlID0gdGhpcy5yZXNvbHZlUmFpc2VkVHJhbnNpdGlvbihtYXliZU5leHRTdGF0ZSwge1xuICAgICAgICAgIHR5cGU6IG51bGxFdmVudFxuICAgICAgICB9LCBfZXZlbnQpO1xuICAgICAgfVxuXG4gICAgICB3aGlsZSAocmFpc2VkRXZlbnRzLmxlbmd0aCkge1xuICAgICAgICB2YXIgcmFpc2VkRXZlbnQgPSByYWlzZWRFdmVudHMuc2hpZnQoKTtcbiAgICAgICAgbWF5YmVOZXh0U3RhdGUgPSB0aGlzLnJlc29sdmVSYWlzZWRUcmFuc2l0aW9uKG1heWJlTmV4dFN0YXRlLCByYWlzZWRFdmVudC5fZXZlbnQsIF9ldmVudCk7XG4gICAgICB9XG4gICAgfSAvLyBEZXRlY3QgaWYgc3RhdGUgY2hhbmdlZFxuXG5cbiAgICB2YXIgY2hhbmdlZCA9IG1heWJlTmV4dFN0YXRlLmNoYW5nZWQgfHwgKGhpc3RvcnkgPyAhIW1heWJlTmV4dFN0YXRlLmFjdGlvbnMubGVuZ3RoIHx8IGRpZFVwZGF0ZUNvbnRleHQgfHwgdHlwZW9mIGhpc3RvcnkudmFsdWUgIT09IHR5cGVvZiBtYXliZU5leHRTdGF0ZS52YWx1ZSB8fCAhc3RhdGVWYWx1ZXNFcXVhbChtYXliZU5leHRTdGF0ZS52YWx1ZSwgaGlzdG9yeS52YWx1ZSkgOiB1bmRlZmluZWQpO1xuICAgIG1heWJlTmV4dFN0YXRlLmNoYW5nZWQgPSBjaGFuZ2VkOyAvLyBQcmVzZXJ2ZSBvcmlnaW5hbCBoaXN0b3J5IGFmdGVyIHJhaXNlZCBldmVudHNcblxuICAgIG1heWJlTmV4dFN0YXRlLmhpc3RvcnlWYWx1ZSA9IG5leHRTdGF0ZS5oaXN0b3J5VmFsdWU7XG4gICAgbWF5YmVOZXh0U3RhdGUuaGlzdG9yeSA9IGhpc3Rvcnk7XG4gICAgcmV0dXJuIG1heWJlTmV4dFN0YXRlO1xuICB9O1xuICAvKipcclxuICAgKiBSZXR1cm5zIHRoZSBjaGlsZCBzdGF0ZSBub2RlIGZyb20gaXRzIHJlbGF0aXZlIGBzdGF0ZUtleWAsIG9yIHRocm93cy5cclxuICAgKi9cblxuXG4gIFN0YXRlTm9kZS5wcm90b3R5cGUuZ2V0U3RhdGVOb2RlID0gZnVuY3Rpb24gKHN0YXRlS2V5KSB7XG4gICAgaWYgKGlzU3RhdGVJZChzdGF0ZUtleSkpIHtcbiAgICAgIHJldHVybiB0aGlzLm1hY2hpbmUuZ2V0U3RhdGVOb2RlQnlJZChzdGF0ZUtleSk7XG4gICAgfVxuXG4gICAgaWYgKCF0aGlzLnN0YXRlcykge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKFwiVW5hYmxlIHRvIHJldHJpZXZlIGNoaWxkIHN0YXRlICdcIiArIHN0YXRlS2V5ICsgXCInIGZyb20gJ1wiICsgdGhpcy5pZCArIFwiJzsgbm8gY2hpbGQgc3RhdGVzIGV4aXN0LlwiKTtcbiAgICB9XG5cbiAgICB2YXIgcmVzdWx0ID0gdGhpcy5zdGF0ZXNbc3RhdGVLZXldO1xuXG4gICAgaWYgKCFyZXN1bHQpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihcIkNoaWxkIHN0YXRlICdcIiArIHN0YXRlS2V5ICsgXCInIGRvZXMgbm90IGV4aXN0IG9uICdcIiArIHRoaXMuaWQgKyBcIidcIik7XG4gICAgfVxuXG4gICAgcmV0dXJuIHJlc3VsdDtcbiAgfTtcbiAgLyoqXHJcbiAgICogUmV0dXJucyB0aGUgc3RhdGUgbm9kZSB3aXRoIHRoZSBnaXZlbiBgc3RhdGVJZGAsIG9yIHRocm93cy5cclxuICAgKlxyXG4gICAqIEBwYXJhbSBzdGF0ZUlkIFRoZSBzdGF0ZSBJRC4gVGhlIHByZWZpeCBcIiNcIiBpcyByZW1vdmVkLlxyXG4gICAqL1xuXG5cbiAgU3RhdGVOb2RlLnByb3RvdHlwZS5nZXRTdGF0ZU5vZGVCeUlkID0gZnVuY3Rpb24gKHN0YXRlSWQpIHtcbiAgICB2YXIgcmVzb2x2ZWRTdGF0ZUlkID0gaXNTdGF0ZUlkKHN0YXRlSWQpID8gc3RhdGVJZC5zbGljZShTVEFURV9JREVOVElGSUVSLmxlbmd0aCkgOiBzdGF0ZUlkO1xuXG4gICAgaWYgKHJlc29sdmVkU3RhdGVJZCA9PT0gdGhpcy5pZCkge1xuICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgdmFyIHN0YXRlTm9kZSA9IHRoaXMubWFjaGluZS5pZE1hcFtyZXNvbHZlZFN0YXRlSWRdO1xuXG4gICAgaWYgKCFzdGF0ZU5vZGUpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihcIkNoaWxkIHN0YXRlIG5vZGUgJyNcIiArIHJlc29sdmVkU3RhdGVJZCArIFwiJyBkb2VzIG5vdCBleGlzdCBvbiBtYWNoaW5lICdcIiArIHRoaXMuaWQgKyBcIidcIik7XG4gICAgfVxuXG4gICAgcmV0dXJuIHN0YXRlTm9kZTtcbiAgfTtcbiAgLyoqXHJcbiAgICogUmV0dXJucyB0aGUgcmVsYXRpdmUgc3RhdGUgbm9kZSBmcm9tIHRoZSBnaXZlbiBgc3RhdGVQYXRoYCwgb3IgdGhyb3dzLlxyXG4gICAqXHJcbiAgICogQHBhcmFtIHN0YXRlUGF0aCBUaGUgc3RyaW5nIG9yIHN0cmluZyBhcnJheSByZWxhdGl2ZSBwYXRoIHRvIHRoZSBzdGF0ZSBub2RlLlxyXG4gICAqL1xuXG5cbiAgU3RhdGVOb2RlLnByb3RvdHlwZS5nZXRTdGF0ZU5vZGVCeVBhdGggPSBmdW5jdGlvbiAoc3RhdGVQYXRoKSB7XG4gICAgaWYgKHR5cGVvZiBzdGF0ZVBhdGggPT09ICdzdHJpbmcnICYmIGlzU3RhdGVJZChzdGF0ZVBhdGgpKSB7XG4gICAgICB0cnkge1xuICAgICAgICByZXR1cm4gdGhpcy5nZXRTdGF0ZU5vZGVCeUlkKHN0YXRlUGF0aC5zbGljZSgxKSk7XG4gICAgICB9IGNhdGNoIChlKSB7Ly8gdHJ5IGluZGl2aWR1YWwgcGF0aHNcbiAgICAgICAgLy8gdGhyb3cgZTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICB2YXIgYXJyYXlTdGF0ZVBhdGggPSB0b1N0YXRlUGF0aChzdGF0ZVBhdGgsIHRoaXMuZGVsaW1pdGVyKS5zbGljZSgpO1xuICAgIHZhciBjdXJyZW50U3RhdGVOb2RlID0gdGhpcztcblxuICAgIHdoaWxlIChhcnJheVN0YXRlUGF0aC5sZW5ndGgpIHtcbiAgICAgIHZhciBrZXkgPSBhcnJheVN0YXRlUGF0aC5zaGlmdCgpO1xuXG4gICAgICBpZiAoIWtleS5sZW5ndGgpIHtcbiAgICAgICAgYnJlYWs7XG4gICAgICB9XG5cbiAgICAgIGN1cnJlbnRTdGF0ZU5vZGUgPSBjdXJyZW50U3RhdGVOb2RlLmdldFN0YXRlTm9kZShrZXkpO1xuICAgIH1cblxuICAgIHJldHVybiBjdXJyZW50U3RhdGVOb2RlO1xuICB9O1xuICAvKipcclxuICAgKiBSZXNvbHZlcyBhIHBhcnRpYWwgc3RhdGUgdmFsdWUgd2l0aCBpdHMgZnVsbCByZXByZXNlbnRhdGlvbiBpbiB0aGlzIG1hY2hpbmUuXHJcbiAgICpcclxuICAgKiBAcGFyYW0gc3RhdGVWYWx1ZSBUaGUgcGFydGlhbCBzdGF0ZSB2YWx1ZSB0byByZXNvbHZlLlxyXG4gICAqL1xuXG5cbiAgU3RhdGVOb2RlLnByb3RvdHlwZS5yZXNvbHZlID0gZnVuY3Rpb24gKHN0YXRlVmFsdWUpIHtcbiAgICB2YXIgX2E7XG5cbiAgICB2YXIgX3RoaXMgPSB0aGlzO1xuXG4gICAgaWYgKCFzdGF0ZVZhbHVlKSB7XG4gICAgICByZXR1cm4gdGhpcy5pbml0aWFsU3RhdGVWYWx1ZSB8fCBFTVBUWV9PQkpFQ1Q7IC8vIFRPRE86IHR5cGUtc3BlY2lmaWMgcHJvcGVydGllc1xuICAgIH1cblxuICAgIHN3aXRjaCAodGhpcy50eXBlKSB7XG4gICAgICBjYXNlICdwYXJhbGxlbCc6XG4gICAgICAgIHJldHVybiBtYXBWYWx1ZXModGhpcy5pbml0aWFsU3RhdGVWYWx1ZSwgZnVuY3Rpb24gKHN1YlN0YXRlVmFsdWUsIHN1YlN0YXRlS2V5KSB7XG4gICAgICAgICAgcmV0dXJuIHN1YlN0YXRlVmFsdWUgPyBfdGhpcy5nZXRTdGF0ZU5vZGUoc3ViU3RhdGVLZXkpLnJlc29sdmUoc3RhdGVWYWx1ZVtzdWJTdGF0ZUtleV0gfHwgc3ViU3RhdGVWYWx1ZSkgOiBFTVBUWV9PQkpFQ1Q7XG4gICAgICAgIH0pO1xuXG4gICAgICBjYXNlICdjb21wb3VuZCc6XG4gICAgICAgIGlmIChpc1N0cmluZyhzdGF0ZVZhbHVlKSkge1xuICAgICAgICAgIHZhciBzdWJTdGF0ZU5vZGUgPSB0aGlzLmdldFN0YXRlTm9kZShzdGF0ZVZhbHVlKTtcblxuICAgICAgICAgIGlmIChzdWJTdGF0ZU5vZGUudHlwZSA9PT0gJ3BhcmFsbGVsJyB8fCBzdWJTdGF0ZU5vZGUudHlwZSA9PT0gJ2NvbXBvdW5kJykge1xuICAgICAgICAgICAgcmV0dXJuIF9hID0ge30sIF9hW3N0YXRlVmFsdWVdID0gc3ViU3RhdGVOb2RlLmluaXRpYWxTdGF0ZVZhbHVlLCBfYTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICByZXR1cm4gc3RhdGVWYWx1ZTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICgha2V5cyhzdGF0ZVZhbHVlKS5sZW5ndGgpIHtcbiAgICAgICAgICByZXR1cm4gdGhpcy5pbml0aWFsU3RhdGVWYWx1ZSB8fCB7fTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBtYXBWYWx1ZXMoc3RhdGVWYWx1ZSwgZnVuY3Rpb24gKHN1YlN0YXRlVmFsdWUsIHN1YlN0YXRlS2V5KSB7XG4gICAgICAgICAgcmV0dXJuIHN1YlN0YXRlVmFsdWUgPyBfdGhpcy5nZXRTdGF0ZU5vZGUoc3ViU3RhdGVLZXkpLnJlc29sdmUoc3ViU3RhdGVWYWx1ZSkgOiBFTVBUWV9PQkpFQ1Q7XG4gICAgICAgIH0pO1xuXG4gICAgICBkZWZhdWx0OlxuICAgICAgICByZXR1cm4gc3RhdGVWYWx1ZSB8fCBFTVBUWV9PQkpFQ1Q7XG4gICAgfVxuICB9O1xuXG4gIFN0YXRlTm9kZS5wcm90b3R5cGUuZ2V0UmVzb2x2ZWRQYXRoID0gZnVuY3Rpb24gKHN0YXRlSWRlbnRpZmllcikge1xuICAgIGlmIChpc1N0YXRlSWQoc3RhdGVJZGVudGlmaWVyKSkge1xuICAgICAgdmFyIHN0YXRlTm9kZSA9IHRoaXMubWFjaGluZS5pZE1hcFtzdGF0ZUlkZW50aWZpZXIuc2xpY2UoU1RBVEVfSURFTlRJRklFUi5sZW5ndGgpXTtcblxuICAgICAgaWYgKCFzdGF0ZU5vZGUpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiVW5hYmxlIHRvIGZpbmQgc3RhdGUgbm9kZSAnXCIgKyBzdGF0ZUlkZW50aWZpZXIgKyBcIidcIik7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBzdGF0ZU5vZGUucGF0aDtcbiAgICB9XG5cbiAgICByZXR1cm4gdG9TdGF0ZVBhdGgoc3RhdGVJZGVudGlmaWVyLCB0aGlzLmRlbGltaXRlcik7XG4gIH07XG5cbiAgT2JqZWN0LmRlZmluZVByb3BlcnR5KFN0YXRlTm9kZS5wcm90b3R5cGUsIFwiaW5pdGlhbFN0YXRlVmFsdWVcIiwge1xuICAgIGdldDogZnVuY3Rpb24gKCkge1xuICAgICAgdmFyIF9hO1xuXG4gICAgICBpZiAodGhpcy5fX2NhY2hlLmluaXRpYWxTdGF0ZVZhbHVlKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9fY2FjaGUuaW5pdGlhbFN0YXRlVmFsdWU7XG4gICAgICB9XG5cbiAgICAgIHZhciBpbml0aWFsU3RhdGVWYWx1ZTtcblxuICAgICAgaWYgKHRoaXMudHlwZSA9PT0gJ3BhcmFsbGVsJykge1xuICAgICAgICBpbml0aWFsU3RhdGVWYWx1ZSA9IG1hcEZpbHRlclZhbHVlcyh0aGlzLnN0YXRlcywgZnVuY3Rpb24gKHN0YXRlKSB7XG4gICAgICAgICAgcmV0dXJuIHN0YXRlLmluaXRpYWxTdGF0ZVZhbHVlIHx8IEVNUFRZX09CSkVDVDtcbiAgICAgICAgfSwgZnVuY3Rpb24gKHN0YXRlTm9kZSkge1xuICAgICAgICAgIHJldHVybiAhKHN0YXRlTm9kZS50eXBlID09PSAnaGlzdG9yeScpO1xuICAgICAgICB9KTtcbiAgICAgIH0gZWxzZSBpZiAodGhpcy5pbml0aWFsICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgaWYgKCF0aGlzLnN0YXRlc1t0aGlzLmluaXRpYWxdKSB7XG4gICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiSW5pdGlhbCBzdGF0ZSAnXCIgKyB0aGlzLmluaXRpYWwgKyBcIicgbm90IGZvdW5kIG9uICdcIiArIHRoaXMua2V5ICsgXCInXCIpO1xuICAgICAgICB9XG5cbiAgICAgICAgaW5pdGlhbFN0YXRlVmFsdWUgPSBpc0xlYWZOb2RlKHRoaXMuc3RhdGVzW3RoaXMuaW5pdGlhbF0pID8gdGhpcy5pbml0aWFsIDogKF9hID0ge30sIF9hW3RoaXMuaW5pdGlhbF0gPSB0aGlzLnN0YXRlc1t0aGlzLmluaXRpYWxdLmluaXRpYWxTdGF0ZVZhbHVlLCBfYSk7XG4gICAgICB9XG5cbiAgICAgIHRoaXMuX19jYWNoZS5pbml0aWFsU3RhdGVWYWx1ZSA9IGluaXRpYWxTdGF0ZVZhbHVlO1xuICAgICAgcmV0dXJuIHRoaXMuX19jYWNoZS5pbml0aWFsU3RhdGVWYWx1ZTtcbiAgICB9LFxuICAgIGVudW1lcmFibGU6IGZhbHNlLFxuICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZVxuICB9KTtcblxuICBTdGF0ZU5vZGUucHJvdG90eXBlLmdldEluaXRpYWxTdGF0ZSA9IGZ1bmN0aW9uIChzdGF0ZVZhbHVlLCBjb250ZXh0KSB7XG4gICAgdmFyIGNvbmZpZ3VyYXRpb24gPSB0aGlzLmdldFN0YXRlTm9kZXMoc3RhdGVWYWx1ZSk7XG4gICAgcmV0dXJuIHRoaXMucmVzb2x2ZVRyYW5zaXRpb24oe1xuICAgICAgY29uZmlndXJhdGlvbjogY29uZmlndXJhdGlvbixcbiAgICAgIGVudHJ5U2V0OiBjb25maWd1cmF0aW9uLFxuICAgICAgZXhpdFNldDogW10sXG4gICAgICB0cmFuc2l0aW9uczogW10sXG4gICAgICBzb3VyY2U6IHVuZGVmaW5lZCxcbiAgICAgIGFjdGlvbnM6IFtdXG4gICAgfSwgdW5kZWZpbmVkLCB1bmRlZmluZWQsIGNvbnRleHQpO1xuICB9O1xuXG4gIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShTdGF0ZU5vZGUucHJvdG90eXBlLCBcImluaXRpYWxTdGF0ZVwiLCB7XG4gICAgLyoqXHJcbiAgICAgKiBUaGUgaW5pdGlhbCBTdGF0ZSBpbnN0YW5jZSwgd2hpY2ggaW5jbHVkZXMgYWxsIGFjdGlvbnMgdG8gYmUgZXhlY3V0ZWQgZnJvbVxyXG4gICAgICogZW50ZXJpbmcgdGhlIGluaXRpYWwgc3RhdGUuXHJcbiAgICAgKi9cbiAgICBnZXQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgIHRoaXMuX2luaXQoKTsgLy8gVE9ETzogdGhpcyBzaG91bGQgYmUgaW4gdGhlIGNvbnN0cnVjdG9yIChzZWUgbm90ZSBpbiBjb25zdHJ1Y3RvcilcblxuXG4gICAgICB2YXIgaW5pdGlhbFN0YXRlVmFsdWUgPSB0aGlzLmluaXRpYWxTdGF0ZVZhbHVlO1xuXG4gICAgICBpZiAoIWluaXRpYWxTdGF0ZVZhbHVlKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcIkNhbm5vdCByZXRyaWV2ZSBpbml0aWFsIHN0YXRlIGZyb20gc2ltcGxlIHN0YXRlICdcIiArIHRoaXMuaWQgKyBcIicuXCIpO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gdGhpcy5nZXRJbml0aWFsU3RhdGUoaW5pdGlhbFN0YXRlVmFsdWUpO1xuICAgIH0sXG4gICAgZW51bWVyYWJsZTogZmFsc2UsXG4gICAgY29uZmlndXJhYmxlOiB0cnVlXG4gIH0pO1xuICBPYmplY3QuZGVmaW5lUHJvcGVydHkoU3RhdGVOb2RlLnByb3RvdHlwZSwgXCJ0YXJnZXRcIiwge1xuICAgIC8qKlxyXG4gICAgICogVGhlIHRhcmdldCBzdGF0ZSB2YWx1ZSBvZiB0aGUgaGlzdG9yeSBzdGF0ZSBub2RlLCBpZiBpdCBleGlzdHMuIFRoaXMgcmVwcmVzZW50cyB0aGVcclxuICAgICAqIGRlZmF1bHQgc3RhdGUgdmFsdWUgdG8gdHJhbnNpdGlvbiB0byBpZiBubyBoaXN0b3J5IHZhbHVlIGV4aXN0cyB5ZXQuXHJcbiAgICAgKi9cbiAgICBnZXQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgIHZhciB0YXJnZXQ7XG5cbiAgICAgIGlmICh0aGlzLnR5cGUgPT09ICdoaXN0b3J5Jykge1xuICAgICAgICB2YXIgaGlzdG9yeUNvbmZpZyA9IHRoaXMuY29uZmlnO1xuXG4gICAgICAgIGlmIChpc1N0cmluZyhoaXN0b3J5Q29uZmlnLnRhcmdldCkpIHtcbiAgICAgICAgICB0YXJnZXQgPSBpc1N0YXRlSWQoaGlzdG9yeUNvbmZpZy50YXJnZXQpID8gcGF0aFRvU3RhdGVWYWx1ZSh0aGlzLm1hY2hpbmUuZ2V0U3RhdGVOb2RlQnlJZChoaXN0b3J5Q29uZmlnLnRhcmdldCkucGF0aC5zbGljZSh0aGlzLnBhdGgubGVuZ3RoIC0gMSkpIDogaGlzdG9yeUNvbmZpZy50YXJnZXQ7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgdGFyZ2V0ID0gaGlzdG9yeUNvbmZpZy50YXJnZXQ7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHRhcmdldDtcbiAgICB9LFxuICAgIGVudW1lcmFibGU6IGZhbHNlLFxuICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZVxuICB9KTtcbiAgLyoqXHJcbiAgICogUmV0dXJucyB0aGUgbGVhZiBub2RlcyBmcm9tIGEgc3RhdGUgcGF0aCByZWxhdGl2ZSB0byB0aGlzIHN0YXRlIG5vZGUuXHJcbiAgICpcclxuICAgKiBAcGFyYW0gcmVsYXRpdmVTdGF0ZUlkIFRoZSByZWxhdGl2ZSBzdGF0ZSBwYXRoIHRvIHJldHJpZXZlIHRoZSBzdGF0ZSBub2Rlc1xyXG4gICAqIEBwYXJhbSBoaXN0b3J5IFRoZSBwcmV2aW91cyBzdGF0ZSB0byByZXRyaWV2ZSBoaXN0b3J5XHJcbiAgICogQHBhcmFtIHJlc29sdmUgV2hldGhlciBzdGF0ZSBub2RlcyBzaG91bGQgcmVzb2x2ZSB0byBpbml0aWFsIGNoaWxkIHN0YXRlIG5vZGVzXHJcbiAgICovXG5cbiAgU3RhdGVOb2RlLnByb3RvdHlwZS5nZXRSZWxhdGl2ZVN0YXRlTm9kZXMgPSBmdW5jdGlvbiAocmVsYXRpdmVTdGF0ZUlkLCBoaXN0b3J5VmFsdWUsIHJlc29sdmUpIHtcbiAgICBpZiAocmVzb2x2ZSA9PT0gdm9pZCAwKSB7XG4gICAgICByZXNvbHZlID0gdHJ1ZTtcbiAgICB9XG5cbiAgICByZXR1cm4gcmVzb2x2ZSA/IHJlbGF0aXZlU3RhdGVJZC50eXBlID09PSAnaGlzdG9yeScgPyByZWxhdGl2ZVN0YXRlSWQucmVzb2x2ZUhpc3RvcnkoaGlzdG9yeVZhbHVlKSA6IHJlbGF0aXZlU3RhdGVJZC5pbml0aWFsU3RhdGVOb2RlcyA6IFtyZWxhdGl2ZVN0YXRlSWRdO1xuICB9O1xuXG4gIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShTdGF0ZU5vZGUucHJvdG90eXBlLCBcImluaXRpYWxTdGF0ZU5vZGVzXCIsIHtcbiAgICBnZXQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgIHZhciBfdGhpcyA9IHRoaXM7XG5cbiAgICAgIGlmIChpc0xlYWZOb2RlKHRoaXMpKSB7XG4gICAgICAgIHJldHVybiBbdGhpc107XG4gICAgICB9IC8vIENhc2Ugd2hlbiBzdGF0ZSBub2RlIGlzIGNvbXBvdW5kIGJ1dCBubyBpbml0aWFsIHN0YXRlIGlzIGRlZmluZWRcblxuXG4gICAgICBpZiAodGhpcy50eXBlID09PSAnY29tcG91bmQnICYmICF0aGlzLmluaXRpYWwpIHtcbiAgICAgICAgaWYgKCFJU19QUk9EVUNUSU9OKSB7XG4gICAgICAgICAgd2FybihmYWxzZSwgXCJDb21wb3VuZCBzdGF0ZSBub2RlICdcIiArIHRoaXMuaWQgKyBcIicgaGFzIG5vIGluaXRpYWwgc3RhdGUuXCIpO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIFt0aGlzXTtcbiAgICAgIH1cblxuICAgICAgdmFyIGluaXRpYWxTdGF0ZU5vZGVQYXRocyA9IHRvU3RhdGVQYXRocyh0aGlzLmluaXRpYWxTdGF0ZVZhbHVlKTtcbiAgICAgIHJldHVybiBmbGF0dGVuKGluaXRpYWxTdGF0ZU5vZGVQYXRocy5tYXAoZnVuY3Rpb24gKGluaXRpYWxQYXRoKSB7XG4gICAgICAgIHJldHVybiBfdGhpcy5nZXRGcm9tUmVsYXRpdmVQYXRoKGluaXRpYWxQYXRoKTtcbiAgICAgIH0pKTtcbiAgICB9LFxuICAgIGVudW1lcmFibGU6IGZhbHNlLFxuICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZVxuICB9KTtcbiAgLyoqXHJcbiAgICogUmV0cmlldmVzIHN0YXRlIG5vZGVzIGZyb20gYSByZWxhdGl2ZSBwYXRoIHRvIHRoaXMgc3RhdGUgbm9kZS5cclxuICAgKlxyXG4gICAqIEBwYXJhbSByZWxhdGl2ZVBhdGggVGhlIHJlbGF0aXZlIHBhdGggZnJvbSB0aGlzIHN0YXRlIG5vZGVcclxuICAgKiBAcGFyYW0gaGlzdG9yeVZhbHVlXHJcbiAgICovXG5cbiAgU3RhdGVOb2RlLnByb3RvdHlwZS5nZXRGcm9tUmVsYXRpdmVQYXRoID0gZnVuY3Rpb24gKHJlbGF0aXZlUGF0aCkge1xuICAgIGlmICghcmVsYXRpdmVQYXRoLmxlbmd0aCkge1xuICAgICAgcmV0dXJuIFt0aGlzXTtcbiAgICB9XG5cbiAgICB2YXIgX2EgPSBfX3JlYWQocmVsYXRpdmVQYXRoKSxcbiAgICAgICAgc3RhdGVLZXkgPSBfYVswXSxcbiAgICAgICAgY2hpbGRTdGF0ZVBhdGggPSBfYS5zbGljZSgxKTtcblxuICAgIGlmICghdGhpcy5zdGF0ZXMpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihcIkNhbm5vdCByZXRyaWV2ZSBzdWJQYXRoICdcIiArIHN0YXRlS2V5ICsgXCInIGZyb20gbm9kZSB3aXRoIG5vIHN0YXRlc1wiKTtcbiAgICB9XG5cbiAgICB2YXIgY2hpbGRTdGF0ZU5vZGUgPSB0aGlzLmdldFN0YXRlTm9kZShzdGF0ZUtleSk7XG5cbiAgICBpZiAoY2hpbGRTdGF0ZU5vZGUudHlwZSA9PT0gJ2hpc3RvcnknKSB7XG4gICAgICByZXR1cm4gY2hpbGRTdGF0ZU5vZGUucmVzb2x2ZUhpc3RvcnkoKTtcbiAgICB9XG5cbiAgICBpZiAoIXRoaXMuc3RhdGVzW3N0YXRlS2V5XSkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKFwiQ2hpbGQgc3RhdGUgJ1wiICsgc3RhdGVLZXkgKyBcIicgZG9lcyBub3QgZXhpc3Qgb24gJ1wiICsgdGhpcy5pZCArIFwiJ1wiKTtcbiAgICB9XG5cbiAgICByZXR1cm4gdGhpcy5zdGF0ZXNbc3RhdGVLZXldLmdldEZyb21SZWxhdGl2ZVBhdGgoY2hpbGRTdGF0ZVBhdGgpO1xuICB9O1xuXG4gIFN0YXRlTm9kZS5wcm90b3R5cGUuaGlzdG9yeVZhbHVlID0gZnVuY3Rpb24gKHJlbGF0aXZlU3RhdGVWYWx1ZSkge1xuICAgIGlmICgha2V5cyh0aGlzLnN0YXRlcykubGVuZ3RoKSB7XG4gICAgICByZXR1cm4gdW5kZWZpbmVkO1xuICAgIH1cblxuICAgIHJldHVybiB7XG4gICAgICBjdXJyZW50OiByZWxhdGl2ZVN0YXRlVmFsdWUgfHwgdGhpcy5pbml0aWFsU3RhdGVWYWx1ZSxcbiAgICAgIHN0YXRlczogbWFwRmlsdGVyVmFsdWVzKHRoaXMuc3RhdGVzLCBmdW5jdGlvbiAoc3RhdGVOb2RlLCBrZXkpIHtcbiAgICAgICAgaWYgKCFyZWxhdGl2ZVN0YXRlVmFsdWUpIHtcbiAgICAgICAgICByZXR1cm4gc3RhdGVOb2RlLmhpc3RvcnlWYWx1ZSgpO1xuICAgICAgICB9XG5cbiAgICAgICAgdmFyIHN1YlN0YXRlVmFsdWUgPSBpc1N0cmluZyhyZWxhdGl2ZVN0YXRlVmFsdWUpID8gdW5kZWZpbmVkIDogcmVsYXRpdmVTdGF0ZVZhbHVlW2tleV07XG4gICAgICAgIHJldHVybiBzdGF0ZU5vZGUuaGlzdG9yeVZhbHVlKHN1YlN0YXRlVmFsdWUgfHwgc3RhdGVOb2RlLmluaXRpYWxTdGF0ZVZhbHVlKTtcbiAgICAgIH0sIGZ1bmN0aW9uIChzdGF0ZU5vZGUpIHtcbiAgICAgICAgcmV0dXJuICFzdGF0ZU5vZGUuaGlzdG9yeTtcbiAgICAgIH0pXG4gICAgfTtcbiAgfTtcbiAgLyoqXHJcbiAgICogUmVzb2x2ZXMgdG8gdGhlIGhpc3RvcmljYWwgdmFsdWUocykgb2YgdGhlIHBhcmVudCBzdGF0ZSBub2RlLFxyXG4gICAqIHJlcHJlc2VudGVkIGJ5IHN0YXRlIG5vZGVzLlxyXG4gICAqXHJcbiAgICogQHBhcmFtIGhpc3RvcnlWYWx1ZVxyXG4gICAqL1xuXG5cbiAgU3RhdGVOb2RlLnByb3RvdHlwZS5yZXNvbHZlSGlzdG9yeSA9IGZ1bmN0aW9uIChoaXN0b3J5VmFsdWUpIHtcbiAgICB2YXIgX3RoaXMgPSB0aGlzO1xuXG4gICAgaWYgKHRoaXMudHlwZSAhPT0gJ2hpc3RvcnknKSB7XG4gICAgICByZXR1cm4gW3RoaXNdO1xuICAgIH1cblxuICAgIHZhciBwYXJlbnQgPSB0aGlzLnBhcmVudDtcblxuICAgIGlmICghaGlzdG9yeVZhbHVlKSB7XG4gICAgICB2YXIgaGlzdG9yeVRhcmdldCA9IHRoaXMudGFyZ2V0O1xuICAgICAgcmV0dXJuIGhpc3RvcnlUYXJnZXQgPyBmbGF0dGVuKHRvU3RhdGVQYXRocyhoaXN0b3J5VGFyZ2V0KS5tYXAoZnVuY3Rpb24gKHJlbGF0aXZlQ2hpbGRQYXRoKSB7XG4gICAgICAgIHJldHVybiBwYXJlbnQuZ2V0RnJvbVJlbGF0aXZlUGF0aChyZWxhdGl2ZUNoaWxkUGF0aCk7XG4gICAgICB9KSkgOiBwYXJlbnQuaW5pdGlhbFN0YXRlTm9kZXM7XG4gICAgfVxuXG4gICAgdmFyIHN1Ykhpc3RvcnlWYWx1ZSA9IG5lc3RlZFBhdGgocGFyZW50LnBhdGgsICdzdGF0ZXMnKShoaXN0b3J5VmFsdWUpLmN1cnJlbnQ7XG5cbiAgICBpZiAoaXNTdHJpbmcoc3ViSGlzdG9yeVZhbHVlKSkge1xuICAgICAgcmV0dXJuIFtwYXJlbnQuZ2V0U3RhdGVOb2RlKHN1Ykhpc3RvcnlWYWx1ZSldO1xuICAgIH1cblxuICAgIHJldHVybiBmbGF0dGVuKHRvU3RhdGVQYXRocyhzdWJIaXN0b3J5VmFsdWUpLm1hcChmdW5jdGlvbiAoc3ViU3RhdGVQYXRoKSB7XG4gICAgICByZXR1cm4gX3RoaXMuaGlzdG9yeSA9PT0gJ2RlZXAnID8gcGFyZW50LmdldEZyb21SZWxhdGl2ZVBhdGgoc3ViU3RhdGVQYXRoKSA6IFtwYXJlbnQuc3RhdGVzW3N1YlN0YXRlUGF0aFswXV1dO1xuICAgIH0pKTtcbiAgfTtcblxuICBPYmplY3QuZGVmaW5lUHJvcGVydHkoU3RhdGVOb2RlLnByb3RvdHlwZSwgXCJzdGF0ZUlkc1wiLCB7XG4gICAgLyoqXHJcbiAgICAgKiBBbGwgdGhlIHN0YXRlIG5vZGUgSURzIG9mIHRoaXMgc3RhdGUgbm9kZSBhbmQgaXRzIGRlc2NlbmRhbnQgc3RhdGUgbm9kZXMuXHJcbiAgICAgKi9cbiAgICBnZXQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgIHZhciBfdGhpcyA9IHRoaXM7XG5cbiAgICAgIHZhciBjaGlsZFN0YXRlSWRzID0gZmxhdHRlbihrZXlzKHRoaXMuc3RhdGVzKS5tYXAoZnVuY3Rpb24gKHN0YXRlS2V5KSB7XG4gICAgICAgIHJldHVybiBfdGhpcy5zdGF0ZXNbc3RhdGVLZXldLnN0YXRlSWRzO1xuICAgICAgfSkpO1xuICAgICAgcmV0dXJuIFt0aGlzLmlkXS5jb25jYXQoY2hpbGRTdGF0ZUlkcyk7XG4gICAgfSxcbiAgICBlbnVtZXJhYmxlOiBmYWxzZSxcbiAgICBjb25maWd1cmFibGU6IHRydWVcbiAgfSk7XG4gIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShTdGF0ZU5vZGUucHJvdG90eXBlLCBcImV2ZW50c1wiLCB7XG4gICAgLyoqXHJcbiAgICAgKiBBbGwgdGhlIGV2ZW50IHR5cGVzIGFjY2VwdGVkIGJ5IHRoaXMgc3RhdGUgbm9kZSBhbmQgaXRzIGRlc2NlbmRhbnRzLlxyXG4gICAgICovXG4gICAgZ2V0OiBmdW5jdGlvbiAoKSB7XG4gICAgICB2YXIgZV83LCBfYSwgZV84LCBfYjtcblxuICAgICAgaWYgKHRoaXMuX19jYWNoZS5ldmVudHMpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX19jYWNoZS5ldmVudHM7XG4gICAgICB9XG5cbiAgICAgIHZhciBzdGF0ZXMgPSB0aGlzLnN0YXRlcztcbiAgICAgIHZhciBldmVudHMgPSBuZXcgU2V0KHRoaXMub3duRXZlbnRzKTtcblxuICAgICAgaWYgKHN0YXRlcykge1xuICAgICAgICB0cnkge1xuICAgICAgICAgIGZvciAodmFyIF9jID0gX192YWx1ZXMoa2V5cyhzdGF0ZXMpKSwgX2QgPSBfYy5uZXh0KCk7ICFfZC5kb25lOyBfZCA9IF9jLm5leHQoKSkge1xuICAgICAgICAgICAgdmFyIHN0YXRlSWQgPSBfZC52YWx1ZTtcbiAgICAgICAgICAgIHZhciBzdGF0ZSA9IHN0YXRlc1tzdGF0ZUlkXTtcblxuICAgICAgICAgICAgaWYgKHN0YXRlLnN0YXRlcykge1xuICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgIGZvciAodmFyIF9lID0gKGVfOCA9IHZvaWQgMCwgX192YWx1ZXMoc3RhdGUuZXZlbnRzKSksIF9mID0gX2UubmV4dCgpOyAhX2YuZG9uZTsgX2YgPSBfZS5uZXh0KCkpIHtcbiAgICAgICAgICAgICAgICAgIHZhciBldmVudF8xID0gX2YudmFsdWU7XG4gICAgICAgICAgICAgICAgICBldmVudHMuYWRkKFwiXCIgKyBldmVudF8xKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIH0gY2F0Y2ggKGVfOF8xKSB7XG4gICAgICAgICAgICAgICAgZV84ID0ge1xuICAgICAgICAgICAgICAgICAgZXJyb3I6IGVfOF8xXG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgfSBmaW5hbGx5IHtcbiAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgaWYgKF9mICYmICFfZi5kb25lICYmIChfYiA9IF9lLnJldHVybikpIF9iLmNhbGwoX2UpO1xuICAgICAgICAgICAgICAgIH0gZmluYWxseSB7XG4gICAgICAgICAgICAgICAgICBpZiAoZV84KSB0aHJvdyBlXzguZXJyb3I7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9IGNhdGNoIChlXzdfMSkge1xuICAgICAgICAgIGVfNyA9IHtcbiAgICAgICAgICAgIGVycm9yOiBlXzdfMVxuICAgICAgICAgIH07XG4gICAgICAgIH0gZmluYWxseSB7XG4gICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGlmIChfZCAmJiAhX2QuZG9uZSAmJiAoX2EgPSBfYy5yZXR1cm4pKSBfYS5jYWxsKF9jKTtcbiAgICAgICAgICB9IGZpbmFsbHkge1xuICAgICAgICAgICAgaWYgKGVfNykgdGhyb3cgZV83LmVycm9yO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICByZXR1cm4gdGhpcy5fX2NhY2hlLmV2ZW50cyA9IEFycmF5LmZyb20oZXZlbnRzKTtcbiAgICB9LFxuICAgIGVudW1lcmFibGU6IGZhbHNlLFxuICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZVxuICB9KTtcbiAgT2JqZWN0LmRlZmluZVByb3BlcnR5KFN0YXRlTm9kZS5wcm90b3R5cGUsIFwib3duRXZlbnRzXCIsIHtcbiAgICAvKipcclxuICAgICAqIEFsbCB0aGUgZXZlbnRzIHRoYXQgaGF2ZSB0cmFuc2l0aW9ucyBkaXJlY3RseSBmcm9tIHRoaXMgc3RhdGUgbm9kZS5cclxuICAgICAqXHJcbiAgICAgKiBFeGNsdWRlcyBhbnkgaW5lcnQgZXZlbnRzLlxyXG4gICAgICovXG4gICAgZ2V0OiBmdW5jdGlvbiAoKSB7XG4gICAgICB2YXIgZXZlbnRzID0gbmV3IFNldCh0aGlzLnRyYW5zaXRpb25zLmZpbHRlcihmdW5jdGlvbiAodHJhbnNpdGlvbikge1xuICAgICAgICByZXR1cm4gISghdHJhbnNpdGlvbi50YXJnZXQgJiYgIXRyYW5zaXRpb24uYWN0aW9ucy5sZW5ndGggJiYgdHJhbnNpdGlvbi5pbnRlcm5hbCk7XG4gICAgICB9KS5tYXAoZnVuY3Rpb24gKHRyYW5zaXRpb24pIHtcbiAgICAgICAgcmV0dXJuIHRyYW5zaXRpb24uZXZlbnRUeXBlO1xuICAgICAgfSkpO1xuICAgICAgcmV0dXJuIEFycmF5LmZyb20oZXZlbnRzKTtcbiAgICB9LFxuICAgIGVudW1lcmFibGU6IGZhbHNlLFxuICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZVxuICB9KTtcblxuICBTdGF0ZU5vZGUucHJvdG90eXBlLnJlc29sdmVUYXJnZXQgPSBmdW5jdGlvbiAoX3RhcmdldCkge1xuICAgIHZhciBfdGhpcyA9IHRoaXM7XG5cbiAgICBpZiAoX3RhcmdldCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAvLyBhbiB1bmRlZmluZWQgdGFyZ2V0IHNpZ25hbHMgdGhhdCB0aGUgc3RhdGUgbm9kZSBzaG91bGQgbm90IHRyYW5zaXRpb24gZnJvbSB0aGF0IHN0YXRlIHdoZW4gcmVjZWl2aW5nIHRoYXQgZXZlbnRcbiAgICAgIHJldHVybiB1bmRlZmluZWQ7XG4gICAgfVxuXG4gICAgcmV0dXJuIF90YXJnZXQubWFwKGZ1bmN0aW9uICh0YXJnZXQpIHtcbiAgICAgIGlmICghaXNTdHJpbmcodGFyZ2V0KSkge1xuICAgICAgICByZXR1cm4gdGFyZ2V0O1xuICAgICAgfVxuXG4gICAgICB2YXIgaXNJbnRlcm5hbFRhcmdldCA9IHRhcmdldFswXSA9PT0gX3RoaXMuZGVsaW1pdGVyOyAvLyBJZiBpbnRlcm5hbCB0YXJnZXQgaXMgZGVmaW5lZCBvbiBtYWNoaW5lLFxuICAgICAgLy8gZG8gbm90IGluY2x1ZGUgbWFjaGluZSBrZXkgb24gdGFyZ2V0XG5cbiAgICAgIGlmIChpc0ludGVybmFsVGFyZ2V0ICYmICFfdGhpcy5wYXJlbnQpIHtcbiAgICAgICAgcmV0dXJuIF90aGlzLmdldFN0YXRlTm9kZUJ5UGF0aCh0YXJnZXQuc2xpY2UoMSkpO1xuICAgICAgfVxuXG4gICAgICB2YXIgcmVzb2x2ZWRUYXJnZXQgPSBpc0ludGVybmFsVGFyZ2V0ID8gX3RoaXMua2V5ICsgdGFyZ2V0IDogdGFyZ2V0O1xuXG4gICAgICBpZiAoX3RoaXMucGFyZW50KSB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgdmFyIHRhcmdldFN0YXRlTm9kZSA9IF90aGlzLnBhcmVudC5nZXRTdGF0ZU5vZGVCeVBhdGgocmVzb2x2ZWRUYXJnZXQpO1xuXG4gICAgICAgICAgcmV0dXJuIHRhcmdldFN0YXRlTm9kZTtcbiAgICAgICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiSW52YWxpZCB0cmFuc2l0aW9uIGRlZmluaXRpb24gZm9yIHN0YXRlIG5vZGUgJ1wiICsgX3RoaXMuaWQgKyBcIic6XFxuXCIgKyBlcnIubWVzc2FnZSk7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiBfdGhpcy5nZXRTdGF0ZU5vZGVCeVBhdGgocmVzb2x2ZWRUYXJnZXQpO1xuICAgICAgfVxuICAgIH0pO1xuICB9O1xuXG4gIFN0YXRlTm9kZS5wcm90b3R5cGUuZm9ybWF0VHJhbnNpdGlvbiA9IGZ1bmN0aW9uICh0cmFuc2l0aW9uQ29uZmlnKSB7XG4gICAgdmFyIF90aGlzID0gdGhpcztcblxuICAgIHZhciBub3JtYWxpemVkVGFyZ2V0ID0gbm9ybWFsaXplVGFyZ2V0KHRyYW5zaXRpb25Db25maWcudGFyZ2V0KTtcbiAgICB2YXIgaW50ZXJuYWwgPSAnaW50ZXJuYWwnIGluIHRyYW5zaXRpb25Db25maWcgPyB0cmFuc2l0aW9uQ29uZmlnLmludGVybmFsIDogbm9ybWFsaXplZFRhcmdldCA/IG5vcm1hbGl6ZWRUYXJnZXQuc29tZShmdW5jdGlvbiAoX3RhcmdldCkge1xuICAgICAgcmV0dXJuIGlzU3RyaW5nKF90YXJnZXQpICYmIF90YXJnZXRbMF0gPT09IF90aGlzLmRlbGltaXRlcjtcbiAgICB9KSA6IHRydWU7XG4gICAgdmFyIGd1YXJkcyA9IHRoaXMubWFjaGluZS5vcHRpb25zLmd1YXJkcztcbiAgICB2YXIgdGFyZ2V0ID0gdGhpcy5yZXNvbHZlVGFyZ2V0KG5vcm1hbGl6ZWRUYXJnZXQpO1xuXG4gICAgdmFyIHRyYW5zaXRpb24gPSBfX2Fzc2lnbihfX2Fzc2lnbih7fSwgdHJhbnNpdGlvbkNvbmZpZyksIHtcbiAgICAgIGFjdGlvbnM6IHRvQWN0aW9uT2JqZWN0cyh0b0FycmF5KHRyYW5zaXRpb25Db25maWcuYWN0aW9ucykpLFxuICAgICAgY29uZDogdG9HdWFyZCh0cmFuc2l0aW9uQ29uZmlnLmNvbmQsIGd1YXJkcyksXG4gICAgICB0YXJnZXQ6IHRhcmdldCxcbiAgICAgIHNvdXJjZTogdGhpcyxcbiAgICAgIGludGVybmFsOiBpbnRlcm5hbCxcbiAgICAgIGV2ZW50VHlwZTogdHJhbnNpdGlvbkNvbmZpZy5ldmVudCxcbiAgICAgIHRvSlNPTjogZnVuY3Rpb24gKCkge1xuICAgICAgICByZXR1cm4gX19hc3NpZ24oX19hc3NpZ24oe30sIHRyYW5zaXRpb24pLCB7XG4gICAgICAgICAgdGFyZ2V0OiB0cmFuc2l0aW9uLnRhcmdldCA/IHRyYW5zaXRpb24udGFyZ2V0Lm1hcChmdW5jdGlvbiAodCkge1xuICAgICAgICAgICAgcmV0dXJuIFwiI1wiICsgdC5pZDtcbiAgICAgICAgICB9KSA6IHVuZGVmaW5lZCxcbiAgICAgICAgICBzb3VyY2U6IFwiI1wiICsgX3RoaXMuaWRcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICByZXR1cm4gdHJhbnNpdGlvbjtcbiAgfTtcblxuICBTdGF0ZU5vZGUucHJvdG90eXBlLmZvcm1hdFRyYW5zaXRpb25zID0gZnVuY3Rpb24gKCkge1xuICAgIHZhciBlXzksIF9hO1xuXG4gICAgdmFyIF90aGlzID0gdGhpcztcblxuICAgIHZhciBvbkNvbmZpZztcblxuICAgIGlmICghdGhpcy5jb25maWcub24pIHtcbiAgICAgIG9uQ29uZmlnID0gW107XG4gICAgfSBlbHNlIGlmIChBcnJheS5pc0FycmF5KHRoaXMuY29uZmlnLm9uKSkge1xuICAgICAgb25Db25maWcgPSB0aGlzLmNvbmZpZy5vbjtcbiAgICB9IGVsc2Uge1xuICAgICAgdmFyIF9iID0gdGhpcy5jb25maWcub24sXG4gICAgICAgICAgX2MgPSBXSUxEQ0FSRCxcbiAgICAgICAgICBfZCA9IF9iW19jXSxcbiAgICAgICAgICB3aWxkY2FyZENvbmZpZ3MgPSBfZCA9PT0gdm9pZCAwID8gW10gOiBfZCxcbiAgICAgICAgICBzdHJpY3RUcmFuc2l0aW9uQ29uZmlnc18xID0gX19yZXN0KF9iLCBbdHlwZW9mIF9jID09PSBcInN5bWJvbFwiID8gX2MgOiBfYyArIFwiXCJdKTtcblxuICAgICAgb25Db25maWcgPSBmbGF0dGVuKGtleXMoc3RyaWN0VHJhbnNpdGlvbkNvbmZpZ3NfMSkubWFwKGZ1bmN0aW9uIChrZXkpIHtcbiAgICAgICAgaWYgKCFJU19QUk9EVUNUSU9OICYmIGtleSA9PT0gTlVMTF9FVkVOVCkge1xuICAgICAgICAgIHdhcm4oZmFsc2UsIFwiRW1wdHkgc3RyaW5nIHRyYW5zaXRpb24gY29uZmlncyAoZS5nLiwgYHsgb246IHsgJyc6IC4uLiB9fWApIGZvciB0cmFuc2llbnQgdHJhbnNpdGlvbnMgYXJlIGRlcHJlY2F0ZWQuIFNwZWNpZnkgdGhlIHRyYW5zaXRpb24gaW4gdGhlIGB7IGFsd2F5czogLi4uIH1gIHByb3BlcnR5IGluc3RlYWQuIFwiICsgKFwiUGxlYXNlIGNoZWNrIHRoZSBgb25gIGNvbmZpZ3VyYXRpb24gZm9yIFxcXCIjXCIgKyBfdGhpcy5pZCArIFwiXFxcIi5cIikpO1xuICAgICAgICB9XG5cbiAgICAgICAgdmFyIHRyYW5zaXRpb25Db25maWdBcnJheSA9IHRvVHJhbnNpdGlvbkNvbmZpZ0FycmF5KGtleSwgc3RyaWN0VHJhbnNpdGlvbkNvbmZpZ3NfMVtrZXldKTtcblxuICAgICAgICBpZiAoIUlTX1BST0RVQ1RJT04pIHtcbiAgICAgICAgICB2YWxpZGF0ZUFycmF5aWZpZWRUcmFuc2l0aW9ucyhfdGhpcywga2V5LCB0cmFuc2l0aW9uQ29uZmlnQXJyYXkpO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHRyYW5zaXRpb25Db25maWdBcnJheTtcbiAgICAgIH0pLmNvbmNhdCh0b1RyYW5zaXRpb25Db25maWdBcnJheShXSUxEQ0FSRCwgd2lsZGNhcmRDb25maWdzKSkpO1xuICAgIH1cblxuICAgIHZhciBldmVudGxlc3NDb25maWcgPSB0aGlzLmNvbmZpZy5hbHdheXMgPyB0b1RyYW5zaXRpb25Db25maWdBcnJheSgnJywgdGhpcy5jb25maWcuYWx3YXlzKSA6IFtdO1xuICAgIHZhciBkb25lQ29uZmlnID0gdGhpcy5jb25maWcub25Eb25lID8gdG9UcmFuc2l0aW9uQ29uZmlnQXJyYXkoU3RyaW5nKGRvbmUodGhpcy5pZCkpLCB0aGlzLmNvbmZpZy5vbkRvbmUpIDogW107XG5cbiAgICBpZiAoIUlTX1BST0RVQ1RJT04pIHtcbiAgICAgIHdhcm4oISh0aGlzLmNvbmZpZy5vbkRvbmUgJiYgIXRoaXMucGFyZW50KSwgXCJSb290IG5vZGVzIGNhbm5vdCBoYXZlIGFuIFxcXCIub25Eb25lXFxcIiB0cmFuc2l0aW9uLiBQbGVhc2UgY2hlY2sgdGhlIGNvbmZpZyBvZiBcXFwiXCIgKyB0aGlzLmlkICsgXCJcXFwiLlwiKTtcbiAgICB9XG5cbiAgICB2YXIgaW52b2tlQ29uZmlnID0gZmxhdHRlbih0aGlzLmludm9rZS5tYXAoZnVuY3Rpb24gKGludm9rZURlZikge1xuICAgICAgdmFyIHNldHRsZVRyYW5zaXRpb25zID0gW107XG5cbiAgICAgIGlmIChpbnZva2VEZWYub25Eb25lKSB7XG4gICAgICAgIHNldHRsZVRyYW5zaXRpb25zLnB1c2guYXBwbHkoc2V0dGxlVHJhbnNpdGlvbnMsIF9fc3ByZWFkKHRvVHJhbnNpdGlvbkNvbmZpZ0FycmF5KFN0cmluZyhkb25lSW52b2tlKGludm9rZURlZi5pZCkpLCBpbnZva2VEZWYub25Eb25lKSkpO1xuICAgICAgfVxuXG4gICAgICBpZiAoaW52b2tlRGVmLm9uRXJyb3IpIHtcbiAgICAgICAgc2V0dGxlVHJhbnNpdGlvbnMucHVzaC5hcHBseShzZXR0bGVUcmFuc2l0aW9ucywgX19zcHJlYWQodG9UcmFuc2l0aW9uQ29uZmlnQXJyYXkoU3RyaW5nKGVycm9yKGludm9rZURlZi5pZCkpLCBpbnZva2VEZWYub25FcnJvcikpKTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHNldHRsZVRyYW5zaXRpb25zO1xuICAgIH0pKTtcbiAgICB2YXIgZGVsYXllZFRyYW5zaXRpb25zID0gdGhpcy5hZnRlcjtcbiAgICB2YXIgZm9ybWF0dGVkVHJhbnNpdGlvbnMgPSBmbGF0dGVuKF9fc3ByZWFkKGRvbmVDb25maWcsIGludm9rZUNvbmZpZywgb25Db25maWcsIGV2ZW50bGVzc0NvbmZpZykubWFwKGZ1bmN0aW9uICh0cmFuc2l0aW9uQ29uZmlnKSB7XG4gICAgICByZXR1cm4gdG9BcnJheSh0cmFuc2l0aW9uQ29uZmlnKS5tYXAoZnVuY3Rpb24gKHRyYW5zaXRpb24pIHtcbiAgICAgICAgcmV0dXJuIF90aGlzLmZvcm1hdFRyYW5zaXRpb24odHJhbnNpdGlvbik7XG4gICAgICB9KTtcbiAgICB9KSk7XG5cbiAgICB0cnkge1xuICAgICAgZm9yICh2YXIgZGVsYXllZFRyYW5zaXRpb25zXzEgPSBfX3ZhbHVlcyhkZWxheWVkVHJhbnNpdGlvbnMpLCBkZWxheWVkVHJhbnNpdGlvbnNfMV8xID0gZGVsYXllZFRyYW5zaXRpb25zXzEubmV4dCgpOyAhZGVsYXllZFRyYW5zaXRpb25zXzFfMS5kb25lOyBkZWxheWVkVHJhbnNpdGlvbnNfMV8xID0gZGVsYXllZFRyYW5zaXRpb25zXzEubmV4dCgpKSB7XG4gICAgICAgIHZhciBkZWxheWVkVHJhbnNpdGlvbiA9IGRlbGF5ZWRUcmFuc2l0aW9uc18xXzEudmFsdWU7XG4gICAgICAgIGZvcm1hdHRlZFRyYW5zaXRpb25zLnB1c2goZGVsYXllZFRyYW5zaXRpb24pO1xuICAgICAgfVxuICAgIH0gY2F0Y2ggKGVfOV8xKSB7XG4gICAgICBlXzkgPSB7XG4gICAgICAgIGVycm9yOiBlXzlfMVxuICAgICAgfTtcbiAgICB9IGZpbmFsbHkge1xuICAgICAgdHJ5IHtcbiAgICAgICAgaWYgKGRlbGF5ZWRUcmFuc2l0aW9uc18xXzEgJiYgIWRlbGF5ZWRUcmFuc2l0aW9uc18xXzEuZG9uZSAmJiAoX2EgPSBkZWxheWVkVHJhbnNpdGlvbnNfMS5yZXR1cm4pKSBfYS5jYWxsKGRlbGF5ZWRUcmFuc2l0aW9uc18xKTtcbiAgICAgIH0gZmluYWxseSB7XG4gICAgICAgIGlmIChlXzkpIHRocm93IGVfOS5lcnJvcjtcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gZm9ybWF0dGVkVHJhbnNpdGlvbnM7XG4gIH07XG5cbiAgcmV0dXJuIFN0YXRlTm9kZTtcbn0oKTtcblxuZXhwb3J0IHsgU3RhdGVOb2RlIH07IiwiaW1wb3J0IHsgU3RhdGVOb2RlIH0gZnJvbSAnLi9TdGF0ZU5vZGUuanMnO1xuXG5mdW5jdGlvbiBNYWNoaW5lKGNvbmZpZywgb3B0aW9ucywgaW5pdGlhbENvbnRleHQpIHtcbiAgaWYgKGluaXRpYWxDb250ZXh0ID09PSB2b2lkIDApIHtcbiAgICBpbml0aWFsQ29udGV4dCA9IGNvbmZpZy5jb250ZXh0O1xuICB9XG5cbiAgdmFyIHJlc29sdmVkSW5pdGlhbENvbnRleHQgPSB0eXBlb2YgaW5pdGlhbENvbnRleHQgPT09ICdmdW5jdGlvbicgPyBpbml0aWFsQ29udGV4dCgpIDogaW5pdGlhbENvbnRleHQ7XG4gIHJldHVybiBuZXcgU3RhdGVOb2RlKGNvbmZpZywgb3B0aW9ucywgcmVzb2x2ZWRJbml0aWFsQ29udGV4dCk7XG59XG5cbmZ1bmN0aW9uIGNyZWF0ZU1hY2hpbmUoY29uZmlnLCBvcHRpb25zKSB7XG4gIHZhciByZXNvbHZlZEluaXRpYWxDb250ZXh0ID0gdHlwZW9mIGNvbmZpZy5jb250ZXh0ID09PSAnZnVuY3Rpb24nID8gY29uZmlnLmNvbnRleHQoKSA6IGNvbmZpZy5jb250ZXh0O1xuICByZXR1cm4gbmV3IFN0YXRlTm9kZShjb25maWcsIG9wdGlvbnMsIHJlc29sdmVkSW5pdGlhbENvbnRleHQpO1xufVxuXG5leHBvcnQgeyBNYWNoaW5lLCBjcmVhdGVNYWNoaW5lIH07IiwiaW1wb3J0IHsgX19hc3NpZ24gfSBmcm9tICcuL192aXJ0dWFsL190c2xpYi5qcyc7XG52YXIgZGVmYXVsdE9wdGlvbnMgPSB7XG4gIGRlZmVyRXZlbnRzOiBmYWxzZVxufTtcblxudmFyIFNjaGVkdWxlciA9XG4vKiNfX1BVUkVfXyovXG5cbi8qKiBAY2xhc3MgKi9cbmZ1bmN0aW9uICgpIHtcbiAgZnVuY3Rpb24gU2NoZWR1bGVyKG9wdGlvbnMpIHtcbiAgICB0aGlzLnByb2Nlc3NpbmdFdmVudCA9IGZhbHNlO1xuICAgIHRoaXMucXVldWUgPSBbXTtcbiAgICB0aGlzLmluaXRpYWxpemVkID0gZmFsc2U7XG4gICAgdGhpcy5vcHRpb25zID0gX19hc3NpZ24oX19hc3NpZ24oe30sIGRlZmF1bHRPcHRpb25zKSwgb3B0aW9ucyk7XG4gIH1cblxuICBTY2hlZHVsZXIucHJvdG90eXBlLmluaXRpYWxpemUgPSBmdW5jdGlvbiAoY2FsbGJhY2spIHtcbiAgICB0aGlzLmluaXRpYWxpemVkID0gdHJ1ZTtcblxuICAgIGlmIChjYWxsYmFjaykge1xuICAgICAgaWYgKCF0aGlzLm9wdGlvbnMuZGVmZXJFdmVudHMpIHtcbiAgICAgICAgdGhpcy5zY2hlZHVsZShjYWxsYmFjayk7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgdGhpcy5wcm9jZXNzKGNhbGxiYWNrKTtcbiAgICB9XG5cbiAgICB0aGlzLmZsdXNoRXZlbnRzKCk7XG4gIH07XG5cbiAgU2NoZWR1bGVyLnByb3RvdHlwZS5zY2hlZHVsZSA9IGZ1bmN0aW9uICh0YXNrKSB7XG4gICAgaWYgKCF0aGlzLmluaXRpYWxpemVkIHx8IHRoaXMucHJvY2Vzc2luZ0V2ZW50KSB7XG4gICAgICB0aGlzLnF1ZXVlLnB1c2godGFzayk7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgaWYgKHRoaXMucXVldWUubGVuZ3RoICE9PSAwKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ0V2ZW50IHF1ZXVlIHNob3VsZCBiZSBlbXB0eSB3aGVuIGl0IGlzIG5vdCBwcm9jZXNzaW5nIGV2ZW50cycpO1xuICAgIH1cblxuICAgIHRoaXMucHJvY2Vzcyh0YXNrKTtcbiAgICB0aGlzLmZsdXNoRXZlbnRzKCk7XG4gIH07XG5cbiAgU2NoZWR1bGVyLnByb3RvdHlwZS5jbGVhciA9IGZ1bmN0aW9uICgpIHtcbiAgICB0aGlzLnF1ZXVlID0gW107XG4gIH07XG5cbiAgU2NoZWR1bGVyLnByb3RvdHlwZS5mbHVzaEV2ZW50cyA9IGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgbmV4dENhbGxiYWNrID0gdGhpcy5xdWV1ZS5zaGlmdCgpO1xuXG4gICAgd2hpbGUgKG5leHRDYWxsYmFjaykge1xuICAgICAgdGhpcy5wcm9jZXNzKG5leHRDYWxsYmFjayk7XG4gICAgICBuZXh0Q2FsbGJhY2sgPSB0aGlzLnF1ZXVlLnNoaWZ0KCk7XG4gICAgfVxuICB9O1xuXG4gIFNjaGVkdWxlci5wcm90b3R5cGUucHJvY2VzcyA9IGZ1bmN0aW9uIChjYWxsYmFjaykge1xuICAgIHRoaXMucHJvY2Vzc2luZ0V2ZW50ID0gdHJ1ZTtcblxuICAgIHRyeSB7XG4gICAgICBjYWxsYmFjaygpO1xuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgIC8vIHRoZXJlIGlzIG5vIHVzZSB0byBrZWVwIHRoZSBmdXR1cmUgZXZlbnRzXG4gICAgICAvLyBhcyB0aGUgc2l0dWF0aW9uIGlzIG5vdCBhbnltb3JlIHRoZSBzYW1lXG4gICAgICB0aGlzLmNsZWFyKCk7XG4gICAgICB0aHJvdyBlO1xuICAgIH0gZmluYWxseSB7XG4gICAgICB0aGlzLnByb2Nlc3NpbmdFdmVudCA9IGZhbHNlO1xuICAgIH1cbiAgfTtcblxuICByZXR1cm4gU2NoZWR1bGVyO1xufSgpO1xuXG5leHBvcnQgeyBTY2hlZHVsZXIgfTsiLCJ2YXIgY2hpbGRyZW4gPSAvKiNfX1BVUkVfXyovbmV3IE1hcCgpO1xudmFyIHNlc3Npb25JZEluZGV4ID0gMDtcbnZhciByZWdpc3RyeSA9IHtcbiAgYm9va0lkOiBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIFwieDpcIiArIHNlc3Npb25JZEluZGV4Kys7XG4gIH0sXG4gIHJlZ2lzdGVyOiBmdW5jdGlvbiAoaWQsIGFjdG9yKSB7XG4gICAgY2hpbGRyZW4uc2V0KGlkLCBhY3Rvcik7XG4gICAgcmV0dXJuIGlkO1xuICB9LFxuICBnZXQ6IGZ1bmN0aW9uIChpZCkge1xuICAgIHJldHVybiBjaGlsZHJlbi5nZXQoaWQpO1xuICB9LFxuICBmcmVlOiBmdW5jdGlvbiAoaWQpIHtcbiAgICBjaGlsZHJlbi5kZWxldGUoaWQpO1xuICB9XG59O1xuZXhwb3J0IHsgcmVnaXN0cnkgfTsiLCJpbXBvcnQgeyBJU19QUk9EVUNUSU9OIH0gZnJvbSAnLi9lbnZpcm9ubWVudC5qcyc7XG5cbmZ1bmN0aW9uIGdldERldlRvb2xzKCkge1xuICB2YXIgdyA9IHdpbmRvdztcblxuICBpZiAoISF3Ll9feHN0YXRlX18pIHtcbiAgICByZXR1cm4gdy5fX3hzdGF0ZV9fO1xuICB9XG5cbiAgcmV0dXJuIHVuZGVmaW5lZDtcbn1cblxuZnVuY3Rpb24gcmVnaXN0ZXJTZXJ2aWNlKHNlcnZpY2UpIHtcbiAgaWYgKElTX1BST0RVQ1RJT04gfHwgdHlwZW9mIHdpbmRvdyA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICByZXR1cm47XG4gIH1cblxuICB2YXIgZGV2VG9vbHMgPSBnZXREZXZUb29scygpO1xuXG4gIGlmIChkZXZUb29scykge1xuICAgIGRldlRvb2xzLnJlZ2lzdGVyKHNlcnZpY2UpO1xuICB9XG59XG5cbmV4cG9ydCB7IHJlZ2lzdGVyU2VydmljZSB9OyIsImltcG9ydCB7IF9fdmFsdWVzLCBfX2Fzc2lnbiwgX19zcHJlYWQgfSBmcm9tICcuL192aXJ0dWFsL190c2xpYi5qcyc7XG5pbXBvcnQgeyBJU19QUk9EVUNUSU9OIH0gZnJvbSAnLi9lbnZpcm9ubWVudC5qcyc7XG5pbXBvcnQgeyB3YXJuLCBtYXBDb250ZXh0LCBpc0Z1bmN0aW9uLCBrZXlzLCB0b1NDWE1MRXZlbnQsIHRvSW52b2tlU291cmNlLCBpc1Byb21pc2VMaWtlLCBpc09ic2VydmFibGUsIGlzTWFjaGluZSwgcmVwb3J0VW5oYW5kbGVkRXhjZXB0aW9uT25JbnZvY2F0aW9uLCBzeW1ib2xPYnNlcnZhYmxlLCBpc0FycmF5LCB0b0V2ZW50T2JqZWN0LCBpc1N0cmluZywgdW5pcXVlSWQgfSBmcm9tICcuL3V0aWxzLmpzJztcbmltcG9ydCB7IEFjdGlvblR5cGVzLCBTcGVjaWFsVGFyZ2V0cyB9IGZyb20gJy4vdHlwZXMuanMnO1xuaW1wb3J0IHsgaXNJbkZpbmFsU3RhdGUgfSBmcm9tICcuL3N0YXRlVXRpbHMuanMnO1xuaW1wb3J0IHsgZXJyb3JQbGF0Zm9ybSwgbG9nLCBzdG9wLCBzdGFydCwgY2FuY2VsLCBzZW5kLCB1cGRhdGUsIGVycm9yIGFzIGVycm9yJDEgfSBmcm9tICcuL2FjdGlvblR5cGVzLmpzJztcbmltcG9ydCB7IGRvbmVJbnZva2UsIGluaXRFdmVudCwgZ2V0QWN0aW9uRnVuY3Rpb24sIGVycm9yIH0gZnJvbSAnLi9hY3Rpb25zLmpzJztcbmltcG9ydCB7IGlzU3RhdGUsIFN0YXRlLCBiaW5kQWN0aW9uVG9TdGF0ZSB9IGZyb20gJy4vU3RhdGUuanMnO1xuaW1wb3J0IHsgcHJvdmlkZSwgY29uc3VtZSB9IGZyb20gJy4vc2VydmljZVNjb3BlLmpzJztcbmltcG9ydCB7IGlzQWN0b3IsIGNyZWF0ZURlZmVycmVkQWN0b3IgfSBmcm9tICcuL0FjdG9yLmpzJztcbmltcG9ydCB7IFNjaGVkdWxlciB9IGZyb20gJy4vc2NoZWR1bGVyLmpzJztcbmltcG9ydCB7IHJlZ2lzdHJ5IH0gZnJvbSAnLi9yZWdpc3RyeS5qcyc7XG5pbXBvcnQgeyByZWdpc3RlclNlcnZpY2UgfSBmcm9tICcuL2RldlRvb2xzLmpzJztcbnZhciBERUZBVUxUX1NQQVdOX09QVElPTlMgPSB7XG4gIHN5bmM6IGZhbHNlLFxuICBhdXRvRm9yd2FyZDogZmFsc2Vcbn07XG52YXIgSW50ZXJwcmV0ZXJTdGF0dXM7XG5cbihmdW5jdGlvbiAoSW50ZXJwcmV0ZXJTdGF0dXMpIHtcbiAgSW50ZXJwcmV0ZXJTdGF0dXNbSW50ZXJwcmV0ZXJTdGF0dXNbXCJOb3RTdGFydGVkXCJdID0gMF0gPSBcIk5vdFN0YXJ0ZWRcIjtcbiAgSW50ZXJwcmV0ZXJTdGF0dXNbSW50ZXJwcmV0ZXJTdGF0dXNbXCJSdW5uaW5nXCJdID0gMV0gPSBcIlJ1bm5pbmdcIjtcbiAgSW50ZXJwcmV0ZXJTdGF0dXNbSW50ZXJwcmV0ZXJTdGF0dXNbXCJTdG9wcGVkXCJdID0gMl0gPSBcIlN0b3BwZWRcIjtcbn0pKEludGVycHJldGVyU3RhdHVzIHx8IChJbnRlcnByZXRlclN0YXR1cyA9IHt9KSk7XG5cbnZhciBJbnRlcnByZXRlciA9XG4vKiNfX1BVUkVfXyovXG5cbi8qKiBAY2xhc3MgKi9cbmZ1bmN0aW9uICgpIHtcbiAgLyoqXHJcbiAgICogQ3JlYXRlcyBhIG5ldyBJbnRlcnByZXRlciBpbnN0YW5jZSAoaS5lLiwgc2VydmljZSkgZm9yIHRoZSBnaXZlbiBtYWNoaW5lIHdpdGggdGhlIHByb3ZpZGVkIG9wdGlvbnMsIGlmIGFueS5cclxuICAgKlxyXG4gICAqIEBwYXJhbSBtYWNoaW5lIFRoZSBtYWNoaW5lIHRvIGJlIGludGVycHJldGVkXHJcbiAgICogQHBhcmFtIG9wdGlvbnMgSW50ZXJwcmV0ZXIgb3B0aW9uc1xyXG4gICAqL1xuICBmdW5jdGlvbiBJbnRlcnByZXRlcihtYWNoaW5lLCBvcHRpb25zKSB7XG4gICAgdmFyIF90aGlzID0gdGhpcztcblxuICAgIGlmIChvcHRpb25zID09PSB2b2lkIDApIHtcbiAgICAgIG9wdGlvbnMgPSBJbnRlcnByZXRlci5kZWZhdWx0T3B0aW9ucztcbiAgICB9XG5cbiAgICB0aGlzLm1hY2hpbmUgPSBtYWNoaW5lO1xuICAgIHRoaXMuc2NoZWR1bGVyID0gbmV3IFNjaGVkdWxlcigpO1xuICAgIHRoaXMuZGVsYXllZEV2ZW50c01hcCA9IHt9O1xuICAgIHRoaXMubGlzdGVuZXJzID0gbmV3IFNldCgpO1xuICAgIHRoaXMuY29udGV4dExpc3RlbmVycyA9IG5ldyBTZXQoKTtcbiAgICB0aGlzLnN0b3BMaXN0ZW5lcnMgPSBuZXcgU2V0KCk7XG4gICAgdGhpcy5kb25lTGlzdGVuZXJzID0gbmV3IFNldCgpO1xuICAgIHRoaXMuZXZlbnRMaXN0ZW5lcnMgPSBuZXcgU2V0KCk7XG4gICAgdGhpcy5zZW5kTGlzdGVuZXJzID0gbmV3IFNldCgpO1xuICAgIC8qKlxyXG4gICAgICogV2hldGhlciB0aGUgc2VydmljZSBpcyBzdGFydGVkLlxyXG4gICAgICovXG5cbiAgICB0aGlzLmluaXRpYWxpemVkID0gZmFsc2U7XG4gICAgdGhpcy5zdGF0dXMgPSBJbnRlcnByZXRlclN0YXR1cy5Ob3RTdGFydGVkO1xuICAgIHRoaXMuY2hpbGRyZW4gPSBuZXcgTWFwKCk7XG4gICAgdGhpcy5mb3J3YXJkVG8gPSBuZXcgU2V0KCk7XG4gICAgLyoqXHJcbiAgICAgKiBBbGlhcyBmb3IgSW50ZXJwcmV0ZXIucHJvdG90eXBlLnN0YXJ0XHJcbiAgICAgKi9cblxuICAgIHRoaXMuaW5pdCA9IHRoaXMuc3RhcnQ7XG4gICAgLyoqXHJcbiAgICAgKiBTZW5kcyBhbiBldmVudCB0byB0aGUgcnVubmluZyBpbnRlcnByZXRlciB0byB0cmlnZ2VyIGEgdHJhbnNpdGlvbi5cclxuICAgICAqXHJcbiAgICAgKiBBbiBhcnJheSBvZiBldmVudHMgKGJhdGNoZWQpIGNhbiBiZSBzZW50IGFzIHdlbGwsIHdoaWNoIHdpbGwgc2VuZCBhbGxcclxuICAgICAqIGJhdGNoZWQgZXZlbnRzIHRvIHRoZSBydW5uaW5nIGludGVycHJldGVyLiBUaGUgbGlzdGVuZXJzIHdpbGwgYmVcclxuICAgICAqIG5vdGlmaWVkIG9ubHkgKipvbmNlKiogd2hlbiBhbGwgZXZlbnRzIGFyZSBwcm9jZXNzZWQuXHJcbiAgICAgKlxyXG4gICAgICogQHBhcmFtIGV2ZW50IFRoZSBldmVudChzKSB0byBzZW5kXHJcbiAgICAgKi9cblxuICAgIHRoaXMuc2VuZCA9IGZ1bmN0aW9uIChldmVudCwgcGF5bG9hZCkge1xuICAgICAgaWYgKGlzQXJyYXkoZXZlbnQpKSB7XG4gICAgICAgIF90aGlzLmJhdGNoKGV2ZW50KTtcblxuICAgICAgICByZXR1cm4gX3RoaXMuc3RhdGU7XG4gICAgICB9XG5cbiAgICAgIHZhciBfZXZlbnQgPSB0b1NDWE1MRXZlbnQodG9FdmVudE9iamVjdChldmVudCwgcGF5bG9hZCkpO1xuXG4gICAgICBpZiAoX3RoaXMuc3RhdHVzID09PSBJbnRlcnByZXRlclN0YXR1cy5TdG9wcGVkKSB7XG4gICAgICAgIC8vIGRvIG5vdGhpbmdcbiAgICAgICAgaWYgKCFJU19QUk9EVUNUSU9OKSB7XG4gICAgICAgICAgd2FybihmYWxzZSwgXCJFdmVudCBcXFwiXCIgKyBfZXZlbnQubmFtZSArIFwiXFxcIiB3YXMgc2VudCB0byBzdG9wcGVkIHNlcnZpY2UgXFxcIlwiICsgX3RoaXMubWFjaGluZS5pZCArIFwiXFxcIi4gVGhpcyBzZXJ2aWNlIGhhcyBhbHJlYWR5IHJlYWNoZWQgaXRzIGZpbmFsIHN0YXRlLCBhbmQgd2lsbCBub3QgdHJhbnNpdGlvbi5cXG5FdmVudDogXCIgKyBKU09OLnN0cmluZ2lmeShfZXZlbnQuZGF0YSkpO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIF90aGlzLnN0YXRlO1xuICAgICAgfVxuXG4gICAgICBpZiAoX3RoaXMuc3RhdHVzICE9PSBJbnRlcnByZXRlclN0YXR1cy5SdW5uaW5nICYmICFfdGhpcy5vcHRpb25zLmRlZmVyRXZlbnRzKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcIkV2ZW50IFxcXCJcIiArIF9ldmVudC5uYW1lICsgXCJcXFwiIHdhcyBzZW50IHRvIHVuaW5pdGlhbGl6ZWQgc2VydmljZSBcXFwiXCIgKyBfdGhpcy5tYWNoaW5lLmlkICsgXCJcXFwiLiBNYWtlIHN1cmUgLnN0YXJ0KCkgaXMgY2FsbGVkIGZvciB0aGlzIHNlcnZpY2UsIG9yIHNldCB7IGRlZmVyRXZlbnRzOiB0cnVlIH0gaW4gdGhlIHNlcnZpY2Ugb3B0aW9ucy5cXG5FdmVudDogXCIgKyBKU09OLnN0cmluZ2lmeShfZXZlbnQuZGF0YSkpO1xuICAgICAgfVxuXG4gICAgICBfdGhpcy5zY2hlZHVsZXIuc2NoZWR1bGUoZnVuY3Rpb24gKCkge1xuICAgICAgICAvLyBGb3J3YXJkIGNvcHkgb2YgZXZlbnQgdG8gY2hpbGQgYWN0b3JzXG4gICAgICAgIF90aGlzLmZvcndhcmQoX2V2ZW50KTtcblxuICAgICAgICB2YXIgbmV4dFN0YXRlID0gX3RoaXMubmV4dFN0YXRlKF9ldmVudCk7XG5cbiAgICAgICAgX3RoaXMudXBkYXRlKG5leHRTdGF0ZSwgX2V2ZW50KTtcbiAgICAgIH0pO1xuXG4gICAgICByZXR1cm4gX3RoaXMuX3N0YXRlOyAvLyBUT0RPOiBkZXByZWNhdGUgKHNob3VsZCByZXR1cm4gdm9pZClcbiAgICAgIC8vIHRzbGludDpkaXNhYmxlLW5leHQtbGluZTpzZW1pY29sb25cbiAgICB9O1xuXG4gICAgdGhpcy5zZW5kVG8gPSBmdW5jdGlvbiAoZXZlbnQsIHRvKSB7XG4gICAgICB2YXIgaXNQYXJlbnQgPSBfdGhpcy5wYXJlbnQgJiYgKHRvID09PSBTcGVjaWFsVGFyZ2V0cy5QYXJlbnQgfHwgX3RoaXMucGFyZW50LmlkID09PSB0byk7XG4gICAgICB2YXIgdGFyZ2V0ID0gaXNQYXJlbnQgPyBfdGhpcy5wYXJlbnQgOiBpc0FjdG9yKHRvKSA/IHRvIDogX3RoaXMuY2hpbGRyZW4uZ2V0KHRvKSB8fCByZWdpc3RyeS5nZXQodG8pO1xuXG4gICAgICBpZiAoIXRhcmdldCkge1xuICAgICAgICBpZiAoIWlzUGFyZW50KSB7XG4gICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiVW5hYmxlIHRvIHNlbmQgZXZlbnQgdG8gY2hpbGQgJ1wiICsgdG8gKyBcIicgZnJvbSBzZXJ2aWNlICdcIiArIF90aGlzLmlkICsgXCInLlwiKTtcbiAgICAgICAgfSAvLyB0c2xpbnQ6ZGlzYWJsZS1uZXh0LWxpbmU6bm8tY29uc29sZVxuXG5cbiAgICAgICAgaWYgKCFJU19QUk9EVUNUSU9OKSB7XG4gICAgICAgICAgd2FybihmYWxzZSwgXCJTZXJ2aWNlICdcIiArIF90aGlzLmlkICsgXCInIGhhcyBubyBwYXJlbnQ6IHVuYWJsZSB0byBzZW5kIGV2ZW50IFwiICsgZXZlbnQudHlwZSk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIGlmICgnbWFjaGluZScgaW4gdGFyZ2V0KSB7XG4gICAgICAgIC8vIFNlbmQgU0NYTUwgZXZlbnRzIHRvIG1hY2hpbmVzXG4gICAgICAgIHRhcmdldC5zZW5kKF9fYXNzaWduKF9fYXNzaWduKHt9LCBldmVudCksIHtcbiAgICAgICAgICBuYW1lOiBldmVudC5uYW1lID09PSBlcnJvciQxID8gXCJcIiArIGVycm9yKF90aGlzLmlkKSA6IGV2ZW50Lm5hbWUsXG4gICAgICAgICAgb3JpZ2luOiBfdGhpcy5zZXNzaW9uSWRcbiAgICAgICAgfSkpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgLy8gU2VuZCBub3JtYWwgZXZlbnRzIHRvIG90aGVyIHRhcmdldHNcbiAgICAgICAgdGFyZ2V0LnNlbmQoZXZlbnQuZGF0YSk7XG4gICAgICB9XG4gICAgfTtcblxuICAgIHZhciByZXNvbHZlZE9wdGlvbnMgPSBfX2Fzc2lnbihfX2Fzc2lnbih7fSwgSW50ZXJwcmV0ZXIuZGVmYXVsdE9wdGlvbnMpLCBvcHRpb25zKTtcblxuICAgIHZhciBjbG9jayA9IHJlc29sdmVkT3B0aW9ucy5jbG9jayxcbiAgICAgICAgbG9nZ2VyID0gcmVzb2x2ZWRPcHRpb25zLmxvZ2dlcixcbiAgICAgICAgcGFyZW50ID0gcmVzb2x2ZWRPcHRpb25zLnBhcmVudCxcbiAgICAgICAgaWQgPSByZXNvbHZlZE9wdGlvbnMuaWQ7XG4gICAgdmFyIHJlc29sdmVkSWQgPSBpZCAhPT0gdW5kZWZpbmVkID8gaWQgOiBtYWNoaW5lLmlkO1xuICAgIHRoaXMuaWQgPSByZXNvbHZlZElkO1xuICAgIHRoaXMubG9nZ2VyID0gbG9nZ2VyO1xuICAgIHRoaXMuY2xvY2sgPSBjbG9jaztcbiAgICB0aGlzLnBhcmVudCA9IHBhcmVudDtcbiAgICB0aGlzLm9wdGlvbnMgPSByZXNvbHZlZE9wdGlvbnM7XG4gICAgdGhpcy5zY2hlZHVsZXIgPSBuZXcgU2NoZWR1bGVyKHtcbiAgICAgIGRlZmVyRXZlbnRzOiB0aGlzLm9wdGlvbnMuZGVmZXJFdmVudHNcbiAgICB9KTtcbiAgICB0aGlzLnNlc3Npb25JZCA9IHJlZ2lzdHJ5LmJvb2tJZCgpO1xuICB9XG5cbiAgT2JqZWN0LmRlZmluZVByb3BlcnR5KEludGVycHJldGVyLnByb3RvdHlwZSwgXCJpbml0aWFsU3RhdGVcIiwge1xuICAgIGdldDogZnVuY3Rpb24gKCkge1xuICAgICAgdmFyIF90aGlzID0gdGhpcztcblxuICAgICAgaWYgKHRoaXMuX2luaXRpYWxTdGF0ZSkge1xuICAgICAgICByZXR1cm4gdGhpcy5faW5pdGlhbFN0YXRlO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gcHJvdmlkZSh0aGlzLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgIF90aGlzLl9pbml0aWFsU3RhdGUgPSBfdGhpcy5tYWNoaW5lLmluaXRpYWxTdGF0ZTtcbiAgICAgICAgcmV0dXJuIF90aGlzLl9pbml0aWFsU3RhdGU7XG4gICAgICB9KTtcbiAgICB9LFxuICAgIGVudW1lcmFibGU6IGZhbHNlLFxuICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZVxuICB9KTtcbiAgT2JqZWN0LmRlZmluZVByb3BlcnR5KEludGVycHJldGVyLnByb3RvdHlwZSwgXCJzdGF0ZVwiLCB7XG4gICAgZ2V0OiBmdW5jdGlvbiAoKSB7XG4gICAgICBpZiAoIUlTX1BST0RVQ1RJT04pIHtcbiAgICAgICAgd2Fybih0aGlzLnN0YXR1cyAhPT0gSW50ZXJwcmV0ZXJTdGF0dXMuTm90U3RhcnRlZCwgXCJBdHRlbXB0ZWQgdG8gcmVhZCBzdGF0ZSBmcm9tIHVuaW5pdGlhbGl6ZWQgc2VydmljZSAnXCIgKyB0aGlzLmlkICsgXCInLiBNYWtlIHN1cmUgdGhlIHNlcnZpY2UgaXMgc3RhcnRlZCBmaXJzdC5cIik7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiB0aGlzLl9zdGF0ZTtcbiAgICB9LFxuICAgIGVudW1lcmFibGU6IGZhbHNlLFxuICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZVxuICB9KTtcbiAgLyoqXHJcbiAgICogRXhlY3V0ZXMgdGhlIGFjdGlvbnMgb2YgdGhlIGdpdmVuIHN0YXRlLCB3aXRoIHRoYXQgc3RhdGUncyBgY29udGV4dGAgYW5kIGBldmVudGAuXHJcbiAgICpcclxuICAgKiBAcGFyYW0gc3RhdGUgVGhlIHN0YXRlIHdob3NlIGFjdGlvbnMgd2lsbCBiZSBleGVjdXRlZFxyXG4gICAqIEBwYXJhbSBhY3Rpb25zQ29uZmlnIFRoZSBhY3Rpb24gaW1wbGVtZW50YXRpb25zIHRvIHVzZVxyXG4gICAqL1xuXG4gIEludGVycHJldGVyLnByb3RvdHlwZS5leGVjdXRlID0gZnVuY3Rpb24gKHN0YXRlLCBhY3Rpb25zQ29uZmlnKSB7XG4gICAgdmFyIGVfMSwgX2E7XG5cbiAgICB0cnkge1xuICAgICAgZm9yICh2YXIgX2IgPSBfX3ZhbHVlcyhzdGF0ZS5hY3Rpb25zKSwgX2MgPSBfYi5uZXh0KCk7ICFfYy5kb25lOyBfYyA9IF9iLm5leHQoKSkge1xuICAgICAgICB2YXIgYWN0aW9uID0gX2MudmFsdWU7XG4gICAgICAgIHRoaXMuZXhlYyhhY3Rpb24sIHN0YXRlLCBhY3Rpb25zQ29uZmlnKTtcbiAgICAgIH1cbiAgICB9IGNhdGNoIChlXzFfMSkge1xuICAgICAgZV8xID0ge1xuICAgICAgICBlcnJvcjogZV8xXzFcbiAgICAgIH07XG4gICAgfSBmaW5hbGx5IHtcbiAgICAgIHRyeSB7XG4gICAgICAgIGlmIChfYyAmJiAhX2MuZG9uZSAmJiAoX2EgPSBfYi5yZXR1cm4pKSBfYS5jYWxsKF9iKTtcbiAgICAgIH0gZmluYWxseSB7XG4gICAgICAgIGlmIChlXzEpIHRocm93IGVfMS5lcnJvcjtcbiAgICAgIH1cbiAgICB9XG4gIH07XG5cbiAgSW50ZXJwcmV0ZXIucHJvdG90eXBlLnVwZGF0ZSA9IGZ1bmN0aW9uIChzdGF0ZSwgX2V2ZW50KSB7XG4gICAgdmFyIGVfMiwgX2EsIGVfMywgX2IsIGVfNCwgX2MsIGVfNSwgX2Q7XG5cbiAgICB2YXIgX3RoaXMgPSB0aGlzOyAvLyBBdHRhY2ggc2Vzc2lvbiBJRCB0byBzdGF0ZVxuXG5cbiAgICBzdGF0ZS5fc2Vzc2lvbmlkID0gdGhpcy5zZXNzaW9uSWQ7IC8vIFVwZGF0ZSBzdGF0ZVxuXG4gICAgdGhpcy5fc3RhdGUgPSBzdGF0ZTsgLy8gRXhlY3V0ZSBhY3Rpb25zXG5cbiAgICBpZiAodGhpcy5vcHRpb25zLmV4ZWN1dGUpIHtcbiAgICAgIHRoaXMuZXhlY3V0ZSh0aGlzLnN0YXRlKTtcbiAgICB9IC8vIFVwZGF0ZSBjaGlsZHJlblxuXG5cbiAgICB0aGlzLmNoaWxkcmVuLmZvckVhY2goZnVuY3Rpb24gKGNoaWxkKSB7XG4gICAgICBfdGhpcy5zdGF0ZS5jaGlsZHJlbltjaGlsZC5pZF0gPSBjaGlsZDtcbiAgICB9KTsgLy8gRGV2IHRvb2xzXG5cbiAgICBpZiAodGhpcy5kZXZUb29scykge1xuICAgICAgdGhpcy5kZXZUb29scy5zZW5kKF9ldmVudC5kYXRhLCBzdGF0ZSk7XG4gICAgfSAvLyBFeGVjdXRlIGxpc3RlbmVyc1xuXG5cbiAgICBpZiAoc3RhdGUuZXZlbnQpIHtcbiAgICAgIHRyeSB7XG4gICAgICAgIGZvciAodmFyIF9lID0gX192YWx1ZXModGhpcy5ldmVudExpc3RlbmVycyksIF9mID0gX2UubmV4dCgpOyAhX2YuZG9uZTsgX2YgPSBfZS5uZXh0KCkpIHtcbiAgICAgICAgICB2YXIgbGlzdGVuZXIgPSBfZi52YWx1ZTtcbiAgICAgICAgICBsaXN0ZW5lcihzdGF0ZS5ldmVudCk7XG4gICAgICAgIH1cbiAgICAgIH0gY2F0Y2ggKGVfMl8xKSB7XG4gICAgICAgIGVfMiA9IHtcbiAgICAgICAgICBlcnJvcjogZV8yXzFcbiAgICAgICAgfTtcbiAgICAgIH0gZmluYWxseSB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgaWYgKF9mICYmICFfZi5kb25lICYmIChfYSA9IF9lLnJldHVybikpIF9hLmNhbGwoX2UpO1xuICAgICAgICB9IGZpbmFsbHkge1xuICAgICAgICAgIGlmIChlXzIpIHRocm93IGVfMi5lcnJvcjtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIHRyeSB7XG4gICAgICBmb3IgKHZhciBfZyA9IF9fdmFsdWVzKHRoaXMubGlzdGVuZXJzKSwgX2ggPSBfZy5uZXh0KCk7ICFfaC5kb25lOyBfaCA9IF9nLm5leHQoKSkge1xuICAgICAgICB2YXIgbGlzdGVuZXIgPSBfaC52YWx1ZTtcbiAgICAgICAgbGlzdGVuZXIoc3RhdGUsIHN0YXRlLmV2ZW50KTtcbiAgICAgIH1cbiAgICB9IGNhdGNoIChlXzNfMSkge1xuICAgICAgZV8zID0ge1xuICAgICAgICBlcnJvcjogZV8zXzFcbiAgICAgIH07XG4gICAgfSBmaW5hbGx5IHtcbiAgICAgIHRyeSB7XG4gICAgICAgIGlmIChfaCAmJiAhX2guZG9uZSAmJiAoX2IgPSBfZy5yZXR1cm4pKSBfYi5jYWxsKF9nKTtcbiAgICAgIH0gZmluYWxseSB7XG4gICAgICAgIGlmIChlXzMpIHRocm93IGVfMy5lcnJvcjtcbiAgICAgIH1cbiAgICB9XG5cbiAgICB0cnkge1xuICAgICAgZm9yICh2YXIgX2ogPSBfX3ZhbHVlcyh0aGlzLmNvbnRleHRMaXN0ZW5lcnMpLCBfayA9IF9qLm5leHQoKTsgIV9rLmRvbmU7IF9rID0gX2oubmV4dCgpKSB7XG4gICAgICAgIHZhciBjb250ZXh0TGlzdGVuZXIgPSBfay52YWx1ZTtcbiAgICAgICAgY29udGV4dExpc3RlbmVyKHRoaXMuc3RhdGUuY29udGV4dCwgdGhpcy5zdGF0ZS5oaXN0b3J5ID8gdGhpcy5zdGF0ZS5oaXN0b3J5LmNvbnRleHQgOiB1bmRlZmluZWQpO1xuICAgICAgfVxuICAgIH0gY2F0Y2ggKGVfNF8xKSB7XG4gICAgICBlXzQgPSB7XG4gICAgICAgIGVycm9yOiBlXzRfMVxuICAgICAgfTtcbiAgICB9IGZpbmFsbHkge1xuICAgICAgdHJ5IHtcbiAgICAgICAgaWYgKF9rICYmICFfay5kb25lICYmIChfYyA9IF9qLnJldHVybikpIF9jLmNhbGwoX2opO1xuICAgICAgfSBmaW5hbGx5IHtcbiAgICAgICAgaWYgKGVfNCkgdGhyb3cgZV80LmVycm9yO1xuICAgICAgfVxuICAgIH1cblxuICAgIHZhciBpc0RvbmUgPSBpc0luRmluYWxTdGF0ZShzdGF0ZS5jb25maWd1cmF0aW9uIHx8IFtdLCB0aGlzLm1hY2hpbmUpO1xuXG4gICAgaWYgKHRoaXMuc3RhdGUuY29uZmlndXJhdGlvbiAmJiBpc0RvbmUpIHtcbiAgICAgIC8vIGdldCBmaW5hbCBjaGlsZCBzdGF0ZSBub2RlXG4gICAgICB2YXIgZmluYWxDaGlsZFN0YXRlTm9kZSA9IHN0YXRlLmNvbmZpZ3VyYXRpb24uZmluZChmdW5jdGlvbiAoc24pIHtcbiAgICAgICAgcmV0dXJuIHNuLnR5cGUgPT09ICdmaW5hbCcgJiYgc24ucGFyZW50ID09PSBfdGhpcy5tYWNoaW5lO1xuICAgICAgfSk7XG4gICAgICB2YXIgZG9uZURhdGEgPSBmaW5hbENoaWxkU3RhdGVOb2RlICYmIGZpbmFsQ2hpbGRTdGF0ZU5vZGUuZG9uZURhdGEgPyBtYXBDb250ZXh0KGZpbmFsQ2hpbGRTdGF0ZU5vZGUuZG9uZURhdGEsIHN0YXRlLmNvbnRleHQsIF9ldmVudCkgOiB1bmRlZmluZWQ7XG5cbiAgICAgIHRyeSB7XG4gICAgICAgIGZvciAodmFyIF9sID0gX192YWx1ZXModGhpcy5kb25lTGlzdGVuZXJzKSwgX20gPSBfbC5uZXh0KCk7ICFfbS5kb25lOyBfbSA9IF9sLm5leHQoKSkge1xuICAgICAgICAgIHZhciBsaXN0ZW5lciA9IF9tLnZhbHVlO1xuICAgICAgICAgIGxpc3RlbmVyKGRvbmVJbnZva2UodGhpcy5pZCwgZG9uZURhdGEpKTtcbiAgICAgICAgfVxuICAgICAgfSBjYXRjaCAoZV81XzEpIHtcbiAgICAgICAgZV81ID0ge1xuICAgICAgICAgIGVycm9yOiBlXzVfMVxuICAgICAgICB9O1xuICAgICAgfSBmaW5hbGx5IHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICBpZiAoX20gJiYgIV9tLmRvbmUgJiYgKF9kID0gX2wucmV0dXJuKSkgX2QuY2FsbChfbCk7XG4gICAgICAgIH0gZmluYWxseSB7XG4gICAgICAgICAgaWYgKGVfNSkgdGhyb3cgZV81LmVycm9yO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIHRoaXMuc3RvcCgpO1xuICAgIH1cbiAgfTtcbiAgLypcclxuICAgKiBBZGRzIGEgbGlzdGVuZXIgdGhhdCBpcyBub3RpZmllZCB3aGVuZXZlciBhIHN0YXRlIHRyYW5zaXRpb24gaGFwcGVucy4gVGhlIGxpc3RlbmVyIGlzIGNhbGxlZCB3aXRoXHJcbiAgICogdGhlIG5leHQgc3RhdGUgYW5kIHRoZSBldmVudCBvYmplY3QgdGhhdCBjYXVzZWQgdGhlIHN0YXRlIHRyYW5zaXRpb24uXHJcbiAgICpcclxuICAgKiBAcGFyYW0gbGlzdGVuZXIgVGhlIHN0YXRlIGxpc3RlbmVyXHJcbiAgICovXG5cblxuICBJbnRlcnByZXRlci5wcm90b3R5cGUub25UcmFuc2l0aW9uID0gZnVuY3Rpb24gKGxpc3RlbmVyKSB7XG4gICAgdGhpcy5saXN0ZW5lcnMuYWRkKGxpc3RlbmVyKTsgLy8gU2VuZCBjdXJyZW50IHN0YXRlIHRvIGxpc3RlbmVyXG5cbiAgICBpZiAodGhpcy5zdGF0dXMgPT09IEludGVycHJldGVyU3RhdHVzLlJ1bm5pbmcpIHtcbiAgICAgIGxpc3RlbmVyKHRoaXMuc3RhdGUsIHRoaXMuc3RhdGUuZXZlbnQpO1xuICAgIH1cblxuICAgIHJldHVybiB0aGlzO1xuICB9O1xuXG4gIEludGVycHJldGVyLnByb3RvdHlwZS5zdWJzY3JpYmUgPSBmdW5jdGlvbiAobmV4dExpc3RlbmVyT3JPYnNlcnZlciwgXywgLy8gVE9ETzogZXJyb3IgbGlzdGVuZXJcbiAgY29tcGxldGVMaXN0ZW5lcikge1xuICAgIHZhciBfdGhpcyA9IHRoaXM7XG5cbiAgICBpZiAoIW5leHRMaXN0ZW5lck9yT2JzZXJ2ZXIpIHtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIHVuc3Vic2NyaWJlOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgcmV0dXJuIHZvaWQgMDtcbiAgICAgICAgfVxuICAgICAgfTtcbiAgICB9XG5cbiAgICB2YXIgbGlzdGVuZXI7XG4gICAgdmFyIHJlc29sdmVkQ29tcGxldGVMaXN0ZW5lciA9IGNvbXBsZXRlTGlzdGVuZXI7XG5cbiAgICBpZiAodHlwZW9mIG5leHRMaXN0ZW5lck9yT2JzZXJ2ZXIgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgIGxpc3RlbmVyID0gbmV4dExpc3RlbmVyT3JPYnNlcnZlcjtcbiAgICB9IGVsc2Uge1xuICAgICAgbGlzdGVuZXIgPSBuZXh0TGlzdGVuZXJPck9ic2VydmVyLm5leHQuYmluZChuZXh0TGlzdGVuZXJPck9ic2VydmVyKTtcbiAgICAgIHJlc29sdmVkQ29tcGxldGVMaXN0ZW5lciA9IG5leHRMaXN0ZW5lck9yT2JzZXJ2ZXIuY29tcGxldGUuYmluZChuZXh0TGlzdGVuZXJPck9ic2VydmVyKTtcbiAgICB9XG5cbiAgICB0aGlzLmxpc3RlbmVycy5hZGQobGlzdGVuZXIpOyAvLyBTZW5kIGN1cnJlbnQgc3RhdGUgdG8gbGlzdGVuZXJcblxuICAgIGlmICh0aGlzLnN0YXR1cyA9PT0gSW50ZXJwcmV0ZXJTdGF0dXMuUnVubmluZykge1xuICAgICAgbGlzdGVuZXIodGhpcy5zdGF0ZSk7XG4gICAgfVxuXG4gICAgaWYgKHJlc29sdmVkQ29tcGxldGVMaXN0ZW5lcikge1xuICAgICAgdGhpcy5vbkRvbmUocmVzb2x2ZWRDb21wbGV0ZUxpc3RlbmVyKTtcbiAgICB9XG5cbiAgICByZXR1cm4ge1xuICAgICAgdW5zdWJzY3JpYmU6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgbGlzdGVuZXIgJiYgX3RoaXMubGlzdGVuZXJzLmRlbGV0ZShsaXN0ZW5lcik7XG4gICAgICAgIHJlc29sdmVkQ29tcGxldGVMaXN0ZW5lciAmJiBfdGhpcy5kb25lTGlzdGVuZXJzLmRlbGV0ZShyZXNvbHZlZENvbXBsZXRlTGlzdGVuZXIpO1xuICAgICAgfVxuICAgIH07XG4gIH07XG4gIC8qKlxyXG4gICAqIEFkZHMgYW4gZXZlbnQgbGlzdGVuZXIgdGhhdCBpcyBub3RpZmllZCB3aGVuZXZlciBhbiBldmVudCBpcyBzZW50IHRvIHRoZSBydW5uaW5nIGludGVycHJldGVyLlxyXG4gICAqIEBwYXJhbSBsaXN0ZW5lciBUaGUgZXZlbnQgbGlzdGVuZXJcclxuICAgKi9cblxuXG4gIEludGVycHJldGVyLnByb3RvdHlwZS5vbkV2ZW50ID0gZnVuY3Rpb24gKGxpc3RlbmVyKSB7XG4gICAgdGhpcy5ldmVudExpc3RlbmVycy5hZGQobGlzdGVuZXIpO1xuICAgIHJldHVybiB0aGlzO1xuICB9O1xuICAvKipcclxuICAgKiBBZGRzIGFuIGV2ZW50IGxpc3RlbmVyIHRoYXQgaXMgbm90aWZpZWQgd2hlbmV2ZXIgYSBgc2VuZGAgZXZlbnQgb2NjdXJzLlxyXG4gICAqIEBwYXJhbSBsaXN0ZW5lciBUaGUgZXZlbnQgbGlzdGVuZXJcclxuICAgKi9cblxuXG4gIEludGVycHJldGVyLnByb3RvdHlwZS5vblNlbmQgPSBmdW5jdGlvbiAobGlzdGVuZXIpIHtcbiAgICB0aGlzLnNlbmRMaXN0ZW5lcnMuYWRkKGxpc3RlbmVyKTtcbiAgICByZXR1cm4gdGhpcztcbiAgfTtcbiAgLyoqXHJcbiAgICogQWRkcyBhIGNvbnRleHQgbGlzdGVuZXIgdGhhdCBpcyBub3RpZmllZCB3aGVuZXZlciB0aGUgc3RhdGUgY29udGV4dCBjaGFuZ2VzLlxyXG4gICAqIEBwYXJhbSBsaXN0ZW5lciBUaGUgY29udGV4dCBsaXN0ZW5lclxyXG4gICAqL1xuXG5cbiAgSW50ZXJwcmV0ZXIucHJvdG90eXBlLm9uQ2hhbmdlID0gZnVuY3Rpb24gKGxpc3RlbmVyKSB7XG4gICAgdGhpcy5jb250ZXh0TGlzdGVuZXJzLmFkZChsaXN0ZW5lcik7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH07XG4gIC8qKlxyXG4gICAqIEFkZHMgYSBsaXN0ZW5lciB0aGF0IGlzIG5vdGlmaWVkIHdoZW4gdGhlIG1hY2hpbmUgaXMgc3RvcHBlZC5cclxuICAgKiBAcGFyYW0gbGlzdGVuZXIgVGhlIGxpc3RlbmVyXHJcbiAgICovXG5cblxuICBJbnRlcnByZXRlci5wcm90b3R5cGUub25TdG9wID0gZnVuY3Rpb24gKGxpc3RlbmVyKSB7XG4gICAgdGhpcy5zdG9wTGlzdGVuZXJzLmFkZChsaXN0ZW5lcik7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH07XG4gIC8qKlxyXG4gICAqIEFkZHMgYSBzdGF0ZSBsaXN0ZW5lciB0aGF0IGlzIG5vdGlmaWVkIHdoZW4gdGhlIHN0YXRlY2hhcnQgaGFzIHJlYWNoZWQgaXRzIGZpbmFsIHN0YXRlLlxyXG4gICAqIEBwYXJhbSBsaXN0ZW5lciBUaGUgc3RhdGUgbGlzdGVuZXJcclxuICAgKi9cblxuXG4gIEludGVycHJldGVyLnByb3RvdHlwZS5vbkRvbmUgPSBmdW5jdGlvbiAobGlzdGVuZXIpIHtcbiAgICB0aGlzLmRvbmVMaXN0ZW5lcnMuYWRkKGxpc3RlbmVyKTtcbiAgICByZXR1cm4gdGhpcztcbiAgfTtcbiAgLyoqXHJcbiAgICogUmVtb3ZlcyBhIGxpc3RlbmVyLlxyXG4gICAqIEBwYXJhbSBsaXN0ZW5lciBUaGUgbGlzdGVuZXIgdG8gcmVtb3ZlXHJcbiAgICovXG5cblxuICBJbnRlcnByZXRlci5wcm90b3R5cGUub2ZmID0gZnVuY3Rpb24gKGxpc3RlbmVyKSB7XG4gICAgdGhpcy5saXN0ZW5lcnMuZGVsZXRlKGxpc3RlbmVyKTtcbiAgICB0aGlzLmV2ZW50TGlzdGVuZXJzLmRlbGV0ZShsaXN0ZW5lcik7XG4gICAgdGhpcy5zZW5kTGlzdGVuZXJzLmRlbGV0ZShsaXN0ZW5lcik7XG4gICAgdGhpcy5zdG9wTGlzdGVuZXJzLmRlbGV0ZShsaXN0ZW5lcik7XG4gICAgdGhpcy5kb25lTGlzdGVuZXJzLmRlbGV0ZShsaXN0ZW5lcik7XG4gICAgdGhpcy5jb250ZXh0TGlzdGVuZXJzLmRlbGV0ZShsaXN0ZW5lcik7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH07XG4gIC8qKlxyXG4gICAqIFN0YXJ0cyB0aGUgaW50ZXJwcmV0ZXIgZnJvbSB0aGUgZ2l2ZW4gc3RhdGUsIG9yIHRoZSBpbml0aWFsIHN0YXRlLlxyXG4gICAqIEBwYXJhbSBpbml0aWFsU3RhdGUgVGhlIHN0YXRlIHRvIHN0YXJ0IHRoZSBzdGF0ZWNoYXJ0IGZyb21cclxuICAgKi9cblxuXG4gIEludGVycHJldGVyLnByb3RvdHlwZS5zdGFydCA9IGZ1bmN0aW9uIChpbml0aWFsU3RhdGUpIHtcbiAgICB2YXIgX3RoaXMgPSB0aGlzO1xuXG4gICAgaWYgKHRoaXMuc3RhdHVzID09PSBJbnRlcnByZXRlclN0YXR1cy5SdW5uaW5nKSB7XG4gICAgICAvLyBEbyBub3QgcmVzdGFydCB0aGUgc2VydmljZSBpZiBpdCBpcyBhbHJlYWR5IHN0YXJ0ZWRcbiAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIHJlZ2lzdHJ5LnJlZ2lzdGVyKHRoaXMuc2Vzc2lvbklkLCB0aGlzKTtcbiAgICB0aGlzLmluaXRpYWxpemVkID0gdHJ1ZTtcbiAgICB0aGlzLnN0YXR1cyA9IEludGVycHJldGVyU3RhdHVzLlJ1bm5pbmc7XG4gICAgdmFyIHJlc29sdmVkU3RhdGUgPSBpbml0aWFsU3RhdGUgPT09IHVuZGVmaW5lZCA/IHRoaXMuaW5pdGlhbFN0YXRlIDogcHJvdmlkZSh0aGlzLCBmdW5jdGlvbiAoKSB7XG4gICAgICByZXR1cm4gaXNTdGF0ZShpbml0aWFsU3RhdGUpID8gX3RoaXMubWFjaGluZS5yZXNvbHZlU3RhdGUoaW5pdGlhbFN0YXRlKSA6IF90aGlzLm1hY2hpbmUucmVzb2x2ZVN0YXRlKFN0YXRlLmZyb20oaW5pdGlhbFN0YXRlLCBfdGhpcy5tYWNoaW5lLmNvbnRleHQpKTtcbiAgICB9KTtcblxuICAgIGlmICh0aGlzLm9wdGlvbnMuZGV2VG9vbHMpIHtcbiAgICAgIHRoaXMuYXR0YWNoRGV2KCk7XG4gICAgfVxuXG4gICAgdGhpcy5zY2hlZHVsZXIuaW5pdGlhbGl6ZShmdW5jdGlvbiAoKSB7XG4gICAgICBfdGhpcy51cGRhdGUocmVzb2x2ZWRTdGF0ZSwgaW5pdEV2ZW50KTtcbiAgICB9KTtcbiAgICByZXR1cm4gdGhpcztcbiAgfTtcbiAgLyoqXHJcbiAgICogU3RvcHMgdGhlIGludGVycHJldGVyIGFuZCB1bnN1YnNjcmliZSBhbGwgbGlzdGVuZXJzLlxyXG4gICAqXHJcbiAgICogVGhpcyB3aWxsIGFsc28gbm90aWZ5IHRoZSBgb25TdG9wYCBsaXN0ZW5lcnMuXHJcbiAgICovXG5cblxuICBJbnRlcnByZXRlci5wcm90b3R5cGUuc3RvcCA9IGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgZV82LCBfYSwgZV83LCBfYiwgZV84LCBfYywgZV85LCBfZCwgZV8xMCwgX2U7XG5cbiAgICB2YXIgX3RoaXMgPSB0aGlzO1xuXG4gICAgdHJ5IHtcbiAgICAgIGZvciAodmFyIF9mID0gX192YWx1ZXModGhpcy5saXN0ZW5lcnMpLCBfZyA9IF9mLm5leHQoKTsgIV9nLmRvbmU7IF9nID0gX2YubmV4dCgpKSB7XG4gICAgICAgIHZhciBsaXN0ZW5lciA9IF9nLnZhbHVlO1xuICAgICAgICB0aGlzLmxpc3RlbmVycy5kZWxldGUobGlzdGVuZXIpO1xuICAgICAgfVxuICAgIH0gY2F0Y2ggKGVfNl8xKSB7XG4gICAgICBlXzYgPSB7XG4gICAgICAgIGVycm9yOiBlXzZfMVxuICAgICAgfTtcbiAgICB9IGZpbmFsbHkge1xuICAgICAgdHJ5IHtcbiAgICAgICAgaWYgKF9nICYmICFfZy5kb25lICYmIChfYSA9IF9mLnJldHVybikpIF9hLmNhbGwoX2YpO1xuICAgICAgfSBmaW5hbGx5IHtcbiAgICAgICAgaWYgKGVfNikgdGhyb3cgZV82LmVycm9yO1xuICAgICAgfVxuICAgIH1cblxuICAgIHRyeSB7XG4gICAgICBmb3IgKHZhciBfaCA9IF9fdmFsdWVzKHRoaXMuc3RvcExpc3RlbmVycyksIF9qID0gX2gubmV4dCgpOyAhX2ouZG9uZTsgX2ogPSBfaC5uZXh0KCkpIHtcbiAgICAgICAgdmFyIGxpc3RlbmVyID0gX2oudmFsdWU7IC8vIGNhbGwgbGlzdGVuZXIsIHRoZW4gcmVtb3ZlXG5cbiAgICAgICAgbGlzdGVuZXIoKTtcbiAgICAgICAgdGhpcy5zdG9wTGlzdGVuZXJzLmRlbGV0ZShsaXN0ZW5lcik7XG4gICAgICB9XG4gICAgfSBjYXRjaCAoZV83XzEpIHtcbiAgICAgIGVfNyA9IHtcbiAgICAgICAgZXJyb3I6IGVfN18xXG4gICAgICB9O1xuICAgIH0gZmluYWxseSB7XG4gICAgICB0cnkge1xuICAgICAgICBpZiAoX2ogJiYgIV9qLmRvbmUgJiYgKF9iID0gX2gucmV0dXJuKSkgX2IuY2FsbChfaCk7XG4gICAgICB9IGZpbmFsbHkge1xuICAgICAgICBpZiAoZV83KSB0aHJvdyBlXzcuZXJyb3I7XG4gICAgICB9XG4gICAgfVxuXG4gICAgdHJ5IHtcbiAgICAgIGZvciAodmFyIF9rID0gX192YWx1ZXModGhpcy5jb250ZXh0TGlzdGVuZXJzKSwgX2wgPSBfay5uZXh0KCk7ICFfbC5kb25lOyBfbCA9IF9rLm5leHQoKSkge1xuICAgICAgICB2YXIgbGlzdGVuZXIgPSBfbC52YWx1ZTtcbiAgICAgICAgdGhpcy5jb250ZXh0TGlzdGVuZXJzLmRlbGV0ZShsaXN0ZW5lcik7XG4gICAgICB9XG4gICAgfSBjYXRjaCAoZV84XzEpIHtcbiAgICAgIGVfOCA9IHtcbiAgICAgICAgZXJyb3I6IGVfOF8xXG4gICAgICB9O1xuICAgIH0gZmluYWxseSB7XG4gICAgICB0cnkge1xuICAgICAgICBpZiAoX2wgJiYgIV9sLmRvbmUgJiYgKF9jID0gX2sucmV0dXJuKSkgX2MuY2FsbChfayk7XG4gICAgICB9IGZpbmFsbHkge1xuICAgICAgICBpZiAoZV84KSB0aHJvdyBlXzguZXJyb3I7XG4gICAgICB9XG4gICAgfVxuXG4gICAgdHJ5IHtcbiAgICAgIGZvciAodmFyIF9tID0gX192YWx1ZXModGhpcy5kb25lTGlzdGVuZXJzKSwgX28gPSBfbS5uZXh0KCk7ICFfby5kb25lOyBfbyA9IF9tLm5leHQoKSkge1xuICAgICAgICB2YXIgbGlzdGVuZXIgPSBfby52YWx1ZTtcbiAgICAgICAgdGhpcy5kb25lTGlzdGVuZXJzLmRlbGV0ZShsaXN0ZW5lcik7XG4gICAgICB9XG4gICAgfSBjYXRjaCAoZV85XzEpIHtcbiAgICAgIGVfOSA9IHtcbiAgICAgICAgZXJyb3I6IGVfOV8xXG4gICAgICB9O1xuICAgIH0gZmluYWxseSB7XG4gICAgICB0cnkge1xuICAgICAgICBpZiAoX28gJiYgIV9vLmRvbmUgJiYgKF9kID0gX20ucmV0dXJuKSkgX2QuY2FsbChfbSk7XG4gICAgICB9IGZpbmFsbHkge1xuICAgICAgICBpZiAoZV85KSB0aHJvdyBlXzkuZXJyb3I7XG4gICAgICB9XG4gICAgfVxuXG4gICAgdGhpcy5zdGF0ZS5jb25maWd1cmF0aW9uLmZvckVhY2goZnVuY3Rpb24gKHN0YXRlTm9kZSkge1xuICAgICAgdmFyIGVfMTEsIF9hO1xuXG4gICAgICB0cnkge1xuICAgICAgICBmb3IgKHZhciBfYiA9IF9fdmFsdWVzKHN0YXRlTm9kZS5kZWZpbml0aW9uLmV4aXQpLCBfYyA9IF9iLm5leHQoKTsgIV9jLmRvbmU7IF9jID0gX2IubmV4dCgpKSB7XG4gICAgICAgICAgdmFyIGFjdGlvbiA9IF9jLnZhbHVlO1xuXG4gICAgICAgICAgX3RoaXMuZXhlYyhhY3Rpb24sIF90aGlzLnN0YXRlKTtcbiAgICAgICAgfVxuICAgICAgfSBjYXRjaCAoZV8xMV8xKSB7XG4gICAgICAgIGVfMTEgPSB7XG4gICAgICAgICAgZXJyb3I6IGVfMTFfMVxuICAgICAgICB9O1xuICAgICAgfSBmaW5hbGx5IHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICBpZiAoX2MgJiYgIV9jLmRvbmUgJiYgKF9hID0gX2IucmV0dXJuKSkgX2EuY2FsbChfYik7XG4gICAgICAgIH0gZmluYWxseSB7XG4gICAgICAgICAgaWYgKGVfMTEpIHRocm93IGVfMTEuZXJyb3I7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9KTsgLy8gU3RvcCBhbGwgY2hpbGRyZW5cblxuICAgIHRoaXMuY2hpbGRyZW4uZm9yRWFjaChmdW5jdGlvbiAoY2hpbGQpIHtcbiAgICAgIGlmIChpc0Z1bmN0aW9uKGNoaWxkLnN0b3ApKSB7XG4gICAgICAgIGNoaWxkLnN0b3AoKTtcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIHRyeSB7XG4gICAgICAvLyBDYW5jZWwgYWxsIGRlbGF5ZWQgZXZlbnRzXG4gICAgICBmb3IgKHZhciBfcCA9IF9fdmFsdWVzKGtleXModGhpcy5kZWxheWVkRXZlbnRzTWFwKSksIF9xID0gX3AubmV4dCgpOyAhX3EuZG9uZTsgX3EgPSBfcC5uZXh0KCkpIHtcbiAgICAgICAgdmFyIGtleSA9IF9xLnZhbHVlO1xuICAgICAgICB0aGlzLmNsb2NrLmNsZWFyVGltZW91dCh0aGlzLmRlbGF5ZWRFdmVudHNNYXBba2V5XSk7XG4gICAgICB9XG4gICAgfSBjYXRjaCAoZV8xMF8xKSB7XG4gICAgICBlXzEwID0ge1xuICAgICAgICBlcnJvcjogZV8xMF8xXG4gICAgICB9O1xuICAgIH0gZmluYWxseSB7XG4gICAgICB0cnkge1xuICAgICAgICBpZiAoX3EgJiYgIV9xLmRvbmUgJiYgKF9lID0gX3AucmV0dXJuKSkgX2UuY2FsbChfcCk7XG4gICAgICB9IGZpbmFsbHkge1xuICAgICAgICBpZiAoZV8xMCkgdGhyb3cgZV8xMC5lcnJvcjtcbiAgICAgIH1cbiAgICB9XG5cbiAgICB0aGlzLnNjaGVkdWxlci5jbGVhcigpO1xuICAgIHRoaXMuaW5pdGlhbGl6ZWQgPSBmYWxzZTtcbiAgICB0aGlzLnN0YXR1cyA9IEludGVycHJldGVyU3RhdHVzLlN0b3BwZWQ7XG4gICAgcmVnaXN0cnkuZnJlZSh0aGlzLnNlc3Npb25JZCk7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH07XG5cbiAgSW50ZXJwcmV0ZXIucHJvdG90eXBlLmJhdGNoID0gZnVuY3Rpb24gKGV2ZW50cykge1xuICAgIHZhciBfdGhpcyA9IHRoaXM7XG5cbiAgICBpZiAodGhpcy5zdGF0dXMgPT09IEludGVycHJldGVyU3RhdHVzLk5vdFN0YXJ0ZWQgJiYgdGhpcy5vcHRpb25zLmRlZmVyRXZlbnRzKSB7XG4gICAgICAvLyB0c2xpbnQ6ZGlzYWJsZS1uZXh0LWxpbmU6bm8tY29uc29sZVxuICAgICAgaWYgKCFJU19QUk9EVUNUSU9OKSB7XG4gICAgICAgIHdhcm4oZmFsc2UsIGV2ZW50cy5sZW5ndGggKyBcIiBldmVudChzKSB3ZXJlIHNlbnQgdG8gdW5pbml0aWFsaXplZCBzZXJ2aWNlIFxcXCJcIiArIHRoaXMubWFjaGluZS5pZCArIFwiXFxcIiBhbmQgYXJlIGRlZmVycmVkLiBNYWtlIHN1cmUgLnN0YXJ0KCkgaXMgY2FsbGVkIGZvciB0aGlzIHNlcnZpY2UuXFxuRXZlbnQ6IFwiICsgSlNPTi5zdHJpbmdpZnkoZXZlbnQpKTtcbiAgICAgIH1cbiAgICB9IGVsc2UgaWYgKHRoaXMuc3RhdHVzICE9PSBJbnRlcnByZXRlclN0YXR1cy5SdW5uaW5nKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoIC8vIHRzbGludDpkaXNhYmxlLW5leHQtbGluZTptYXgtbGluZS1sZW5ndGhcbiAgICAgIGV2ZW50cy5sZW5ndGggKyBcIiBldmVudChzKSB3ZXJlIHNlbnQgdG8gdW5pbml0aWFsaXplZCBzZXJ2aWNlIFxcXCJcIiArIHRoaXMubWFjaGluZS5pZCArIFwiXFxcIi4gTWFrZSBzdXJlIC5zdGFydCgpIGlzIGNhbGxlZCBmb3IgdGhpcyBzZXJ2aWNlLCBvciBzZXQgeyBkZWZlckV2ZW50czogdHJ1ZSB9IGluIHRoZSBzZXJ2aWNlIG9wdGlvbnMuXCIpO1xuICAgIH1cblxuICAgIHRoaXMuc2NoZWR1bGVyLnNjaGVkdWxlKGZ1bmN0aW9uICgpIHtcbiAgICAgIHZhciBlXzEyLCBfYTtcblxuICAgICAgdmFyIG5leHRTdGF0ZSA9IF90aGlzLnN0YXRlO1xuICAgICAgdmFyIGJhdGNoQ2hhbmdlZCA9IGZhbHNlO1xuICAgICAgdmFyIGJhdGNoZWRBY3Rpb25zID0gW107XG5cbiAgICAgIHZhciBfbG9vcF8xID0gZnVuY3Rpb24gKGV2ZW50XzEpIHtcbiAgICAgICAgdmFyIF9ldmVudCA9IHRvU0NYTUxFdmVudChldmVudF8xKTtcblxuICAgICAgICBfdGhpcy5mb3J3YXJkKF9ldmVudCk7XG5cbiAgICAgICAgbmV4dFN0YXRlID0gcHJvdmlkZShfdGhpcywgZnVuY3Rpb24gKCkge1xuICAgICAgICAgIHJldHVybiBfdGhpcy5tYWNoaW5lLnRyYW5zaXRpb24obmV4dFN0YXRlLCBfZXZlbnQpO1xuICAgICAgICB9KTtcbiAgICAgICAgYmF0Y2hlZEFjdGlvbnMucHVzaC5hcHBseShiYXRjaGVkQWN0aW9ucywgX19zcHJlYWQobmV4dFN0YXRlLmFjdGlvbnMubWFwKGZ1bmN0aW9uIChhKSB7XG4gICAgICAgICAgcmV0dXJuIGJpbmRBY3Rpb25Ub1N0YXRlKGEsIG5leHRTdGF0ZSk7XG4gICAgICAgIH0pKSk7XG4gICAgICAgIGJhdGNoQ2hhbmdlZCA9IGJhdGNoQ2hhbmdlZCB8fCAhIW5leHRTdGF0ZS5jaGFuZ2VkO1xuICAgICAgfTtcblxuICAgICAgdHJ5IHtcbiAgICAgICAgZm9yICh2YXIgZXZlbnRzXzEgPSBfX3ZhbHVlcyhldmVudHMpLCBldmVudHNfMV8xID0gZXZlbnRzXzEubmV4dCgpOyAhZXZlbnRzXzFfMS5kb25lOyBldmVudHNfMV8xID0gZXZlbnRzXzEubmV4dCgpKSB7XG4gICAgICAgICAgdmFyIGV2ZW50XzEgPSBldmVudHNfMV8xLnZhbHVlO1xuXG4gICAgICAgICAgX2xvb3BfMShldmVudF8xKTtcbiAgICAgICAgfVxuICAgICAgfSBjYXRjaCAoZV8xMl8xKSB7XG4gICAgICAgIGVfMTIgPSB7XG4gICAgICAgICAgZXJyb3I6IGVfMTJfMVxuICAgICAgICB9O1xuICAgICAgfSBmaW5hbGx5IHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICBpZiAoZXZlbnRzXzFfMSAmJiAhZXZlbnRzXzFfMS5kb25lICYmIChfYSA9IGV2ZW50c18xLnJldHVybikpIF9hLmNhbGwoZXZlbnRzXzEpO1xuICAgICAgICB9IGZpbmFsbHkge1xuICAgICAgICAgIGlmIChlXzEyKSB0aHJvdyBlXzEyLmVycm9yO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIG5leHRTdGF0ZS5jaGFuZ2VkID0gYmF0Y2hDaGFuZ2VkO1xuICAgICAgbmV4dFN0YXRlLmFjdGlvbnMgPSBiYXRjaGVkQWN0aW9ucztcblxuICAgICAgX3RoaXMudXBkYXRlKG5leHRTdGF0ZSwgdG9TQ1hNTEV2ZW50KGV2ZW50c1tldmVudHMubGVuZ3RoIC0gMV0pKTtcbiAgICB9KTtcbiAgfTtcbiAgLyoqXHJcbiAgICogUmV0dXJucyBhIHNlbmQgZnVuY3Rpb24gYm91bmQgdG8gdGhpcyBpbnRlcnByZXRlciBpbnN0YW5jZS5cclxuICAgKlxyXG4gICAqIEBwYXJhbSBldmVudCBUaGUgZXZlbnQgdG8gYmUgc2VudCBieSB0aGUgc2VuZGVyLlxyXG4gICAqL1xuXG5cbiAgSW50ZXJwcmV0ZXIucHJvdG90eXBlLnNlbmRlciA9IGZ1bmN0aW9uIChldmVudCkge1xuICAgIHJldHVybiB0aGlzLnNlbmQuYmluZCh0aGlzLCBldmVudCk7XG4gIH07XG4gIC8qKlxyXG4gICAqIFJldHVybnMgdGhlIG5leHQgc3RhdGUgZ2l2ZW4gdGhlIGludGVycHJldGVyJ3MgY3VycmVudCBzdGF0ZSBhbmQgdGhlIGV2ZW50LlxyXG4gICAqXHJcbiAgICogVGhpcyBpcyBhIHB1cmUgbWV0aG9kIHRoYXQgZG9lcyBfbm90XyB1cGRhdGUgdGhlIGludGVycHJldGVyJ3Mgc3RhdGUuXHJcbiAgICpcclxuICAgKiBAcGFyYW0gZXZlbnQgVGhlIGV2ZW50IHRvIGRldGVybWluZSB0aGUgbmV4dCBzdGF0ZVxyXG4gICAqL1xuXG5cbiAgSW50ZXJwcmV0ZXIucHJvdG90eXBlLm5leHRTdGF0ZSA9IGZ1bmN0aW9uIChldmVudCkge1xuICAgIHZhciBfdGhpcyA9IHRoaXM7XG5cbiAgICB2YXIgX2V2ZW50ID0gdG9TQ1hNTEV2ZW50KGV2ZW50KTtcblxuICAgIGlmIChfZXZlbnQubmFtZS5pbmRleE9mKGVycm9yUGxhdGZvcm0pID09PSAwICYmICF0aGlzLnN0YXRlLm5leHRFdmVudHMuc29tZShmdW5jdGlvbiAobmV4dEV2ZW50KSB7XG4gICAgICByZXR1cm4gbmV4dEV2ZW50LmluZGV4T2YoZXJyb3JQbGF0Zm9ybSkgPT09IDA7XG4gICAgfSkpIHtcbiAgICAgIHRocm93IF9ldmVudC5kYXRhLmRhdGE7XG4gICAgfVxuXG4gICAgdmFyIG5leHRTdGF0ZSA9IHByb3ZpZGUodGhpcywgZnVuY3Rpb24gKCkge1xuICAgICAgcmV0dXJuIF90aGlzLm1hY2hpbmUudHJhbnNpdGlvbihfdGhpcy5zdGF0ZSwgX2V2ZW50KTtcbiAgICB9KTtcbiAgICByZXR1cm4gbmV4dFN0YXRlO1xuICB9O1xuXG4gIEludGVycHJldGVyLnByb3RvdHlwZS5mb3J3YXJkID0gZnVuY3Rpb24gKGV2ZW50KSB7XG4gICAgdmFyIGVfMTMsIF9hO1xuXG4gICAgdHJ5IHtcbiAgICAgIGZvciAodmFyIF9iID0gX192YWx1ZXModGhpcy5mb3J3YXJkVG8pLCBfYyA9IF9iLm5leHQoKTsgIV9jLmRvbmU7IF9jID0gX2IubmV4dCgpKSB7XG4gICAgICAgIHZhciBpZCA9IF9jLnZhbHVlO1xuICAgICAgICB2YXIgY2hpbGQgPSB0aGlzLmNoaWxkcmVuLmdldChpZCk7XG5cbiAgICAgICAgaWYgKCFjaGlsZCkge1xuICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIlVuYWJsZSB0byBmb3J3YXJkIGV2ZW50ICdcIiArIGV2ZW50ICsgXCInIGZyb20gaW50ZXJwcmV0ZXIgJ1wiICsgdGhpcy5pZCArIFwiJyB0byBub25leGlzdGFudCBjaGlsZCAnXCIgKyBpZCArIFwiJy5cIik7XG4gICAgICAgIH1cblxuICAgICAgICBjaGlsZC5zZW5kKGV2ZW50KTtcbiAgICAgIH1cbiAgICB9IGNhdGNoIChlXzEzXzEpIHtcbiAgICAgIGVfMTMgPSB7XG4gICAgICAgIGVycm9yOiBlXzEzXzFcbiAgICAgIH07XG4gICAgfSBmaW5hbGx5IHtcbiAgICAgIHRyeSB7XG4gICAgICAgIGlmIChfYyAmJiAhX2MuZG9uZSAmJiAoX2EgPSBfYi5yZXR1cm4pKSBfYS5jYWxsKF9iKTtcbiAgICAgIH0gZmluYWxseSB7XG4gICAgICAgIGlmIChlXzEzKSB0aHJvdyBlXzEzLmVycm9yO1xuICAgICAgfVxuICAgIH1cbiAgfTtcblxuICBJbnRlcnByZXRlci5wcm90b3R5cGUuZGVmZXIgPSBmdW5jdGlvbiAoc2VuZEFjdGlvbikge1xuICAgIHZhciBfdGhpcyA9IHRoaXM7XG5cbiAgICB0aGlzLmRlbGF5ZWRFdmVudHNNYXBbc2VuZEFjdGlvbi5pZF0gPSB0aGlzLmNsb2NrLnNldFRpbWVvdXQoZnVuY3Rpb24gKCkge1xuICAgICAgaWYgKHNlbmRBY3Rpb24udG8pIHtcbiAgICAgICAgX3RoaXMuc2VuZFRvKHNlbmRBY3Rpb24uX2V2ZW50LCBzZW5kQWN0aW9uLnRvKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIF90aGlzLnNlbmQoc2VuZEFjdGlvbi5fZXZlbnQpO1xuICAgICAgfVxuICAgIH0sIHNlbmRBY3Rpb24uZGVsYXkpO1xuICB9O1xuXG4gIEludGVycHJldGVyLnByb3RvdHlwZS5jYW5jZWwgPSBmdW5jdGlvbiAoc2VuZElkKSB7XG4gICAgdGhpcy5jbG9jay5jbGVhclRpbWVvdXQodGhpcy5kZWxheWVkRXZlbnRzTWFwW3NlbmRJZF0pO1xuICAgIGRlbGV0ZSB0aGlzLmRlbGF5ZWRFdmVudHNNYXBbc2VuZElkXTtcbiAgfTtcblxuICBJbnRlcnByZXRlci5wcm90b3R5cGUuZXhlYyA9IGZ1bmN0aW9uIChhY3Rpb24sIHN0YXRlLCBhY3Rpb25GdW5jdGlvbk1hcCkge1xuICAgIGlmIChhY3Rpb25GdW5jdGlvbk1hcCA9PT0gdm9pZCAwKSB7XG4gICAgICBhY3Rpb25GdW5jdGlvbk1hcCA9IHRoaXMubWFjaGluZS5vcHRpb25zLmFjdGlvbnM7XG4gICAgfVxuXG4gICAgdmFyIGNvbnRleHQgPSBzdGF0ZS5jb250ZXh0LFxuICAgICAgICBfZXZlbnQgPSBzdGF0ZS5fZXZlbnQ7XG4gICAgdmFyIGFjdGlvbk9yRXhlYyA9IGFjdGlvbi5leGVjIHx8IGdldEFjdGlvbkZ1bmN0aW9uKGFjdGlvbi50eXBlLCBhY3Rpb25GdW5jdGlvbk1hcCk7XG4gICAgdmFyIGV4ZWMgPSBpc0Z1bmN0aW9uKGFjdGlvbk9yRXhlYykgPyBhY3Rpb25PckV4ZWMgOiBhY3Rpb25PckV4ZWMgPyBhY3Rpb25PckV4ZWMuZXhlYyA6IGFjdGlvbi5leGVjO1xuXG4gICAgaWYgKGV4ZWMpIHtcbiAgICAgIHRyeSB7XG4gICAgICAgIHJldHVybiBleGVjKGNvbnRleHQsIF9ldmVudC5kYXRhLCB7XG4gICAgICAgICAgYWN0aW9uOiBhY3Rpb24sXG4gICAgICAgICAgc3RhdGU6IHRoaXMuc3RhdGUsXG4gICAgICAgICAgX2V2ZW50OiBfZXZlbnRcbiAgICAgICAgfSk7XG4gICAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgICAgaWYgKHRoaXMucGFyZW50KSB7XG4gICAgICAgICAgdGhpcy5wYXJlbnQuc2VuZCh7XG4gICAgICAgICAgICB0eXBlOiAneHN0YXRlLmVycm9yJyxcbiAgICAgICAgICAgIGRhdGE6IGVyclxuICAgICAgICAgIH0pO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhyb3cgZXJyO1xuICAgICAgfVxuICAgIH1cblxuICAgIHN3aXRjaCAoYWN0aW9uLnR5cGUpIHtcbiAgICAgIGNhc2Ugc2VuZDpcbiAgICAgICAgdmFyIHNlbmRBY3Rpb24gPSBhY3Rpb247XG5cbiAgICAgICAgaWYgKHR5cGVvZiBzZW5kQWN0aW9uLmRlbGF5ID09PSAnbnVtYmVyJykge1xuICAgICAgICAgIHRoaXMuZGVmZXIoc2VuZEFjdGlvbik7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGlmIChzZW5kQWN0aW9uLnRvKSB7XG4gICAgICAgICAgICB0aGlzLnNlbmRUbyhzZW5kQWN0aW9uLl9ldmVudCwgc2VuZEFjdGlvbi50byk7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMuc2VuZChzZW5kQWN0aW9uLl9ldmVudCk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgYnJlYWs7XG5cbiAgICAgIGNhc2UgY2FuY2VsOlxuICAgICAgICB0aGlzLmNhbmNlbChhY3Rpb24uc2VuZElkKTtcbiAgICAgICAgYnJlYWs7XG5cbiAgICAgIGNhc2Ugc3RhcnQ6XG4gICAgICAgIHtcbiAgICAgICAgICB2YXIgYWN0aXZpdHkgPSBhY3Rpb24uYWN0aXZpdHk7IC8vIElmIHRoZSBhY3Rpdml0eSB3aWxsIGJlIHN0b3BwZWQgcmlnaHQgYWZ0ZXIgaXQncyBzdGFydGVkXG4gICAgICAgICAgLy8gKHN1Y2ggYXMgaW4gdHJhbnNpZW50IHN0YXRlcylcbiAgICAgICAgICAvLyBkb24ndCBib3RoZXIgc3RhcnRpbmcgdGhlIGFjdGl2aXR5LlxuXG4gICAgICAgICAgaWYgKCF0aGlzLnN0YXRlLmFjdGl2aXRpZXNbYWN0aXZpdHkuaWQgfHwgYWN0aXZpdHkudHlwZV0pIHtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIH0gLy8gSW52b2tlZCBzZXJ2aWNlc1xuXG5cbiAgICAgICAgICBpZiAoYWN0aXZpdHkudHlwZSA9PT0gQWN0aW9uVHlwZXMuSW52b2tlKSB7XG4gICAgICAgICAgICB2YXIgaW52b2tlU291cmNlID0gdG9JbnZva2VTb3VyY2UoYWN0aXZpdHkuc3JjKTtcbiAgICAgICAgICAgIHZhciBzZXJ2aWNlQ3JlYXRvciA9IHRoaXMubWFjaGluZS5vcHRpb25zLnNlcnZpY2VzID8gdGhpcy5tYWNoaW5lLm9wdGlvbnMuc2VydmljZXNbaW52b2tlU291cmNlLnR5cGVdIDogdW5kZWZpbmVkO1xuICAgICAgICAgICAgdmFyIGlkID0gYWN0aXZpdHkuaWQsXG4gICAgICAgICAgICAgICAgZGF0YSA9IGFjdGl2aXR5LmRhdGE7XG5cbiAgICAgICAgICAgIGlmICghSVNfUFJPRFVDVElPTikge1xuICAgICAgICAgICAgICB3YXJuKCEoJ2ZvcndhcmQnIGluIGFjdGl2aXR5KSwgLy8gdHNsaW50OmRpc2FibGUtbmV4dC1saW5lOm1heC1saW5lLWxlbmd0aFxuICAgICAgICAgICAgICBcImBmb3J3YXJkYCBwcm9wZXJ0eSBpcyBkZXByZWNhdGVkIChmb3VuZCBpbiBpbnZvY2F0aW9uIG9mICdcIiArIGFjdGl2aXR5LnNyYyArIFwiJyBpbiBpbiBtYWNoaW5lICdcIiArIHRoaXMubWFjaGluZS5pZCArIFwiJykuIFwiICsgXCJQbGVhc2UgdXNlIGBhdXRvRm9yd2FyZGAgaW5zdGVhZC5cIik7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHZhciBhdXRvRm9yd2FyZCA9ICdhdXRvRm9yd2FyZCcgaW4gYWN0aXZpdHkgPyBhY3Rpdml0eS5hdXRvRm9yd2FyZCA6ICEhYWN0aXZpdHkuZm9yd2FyZDtcblxuICAgICAgICAgICAgaWYgKCFzZXJ2aWNlQ3JlYXRvcikge1xuICAgICAgICAgICAgICAvLyB0c2xpbnQ6ZGlzYWJsZS1uZXh0LWxpbmU6bm8tY29uc29sZVxuICAgICAgICAgICAgICBpZiAoIUlTX1BST0RVQ1RJT04pIHtcbiAgICAgICAgICAgICAgICB3YXJuKGZhbHNlLCBcIk5vIHNlcnZpY2UgZm91bmQgZm9yIGludm9jYXRpb24gJ1wiICsgYWN0aXZpdHkuc3JjICsgXCInIGluIG1hY2hpbmUgJ1wiICsgdGhpcy5tYWNoaW5lLmlkICsgXCInLlwiKTtcbiAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdmFyIHJlc29sdmVkRGF0YSA9IGRhdGEgPyBtYXBDb250ZXh0KGRhdGEsIGNvbnRleHQsIF9ldmVudCkgOiB1bmRlZmluZWQ7XG4gICAgICAgICAgICB2YXIgc291cmNlID0gaXNGdW5jdGlvbihzZXJ2aWNlQ3JlYXRvcikgPyBzZXJ2aWNlQ3JlYXRvcihjb250ZXh0LCBfZXZlbnQuZGF0YSwge1xuICAgICAgICAgICAgICBkYXRhOiByZXNvbHZlZERhdGEsXG4gICAgICAgICAgICAgIHNyYzogaW52b2tlU291cmNlXG4gICAgICAgICAgICB9KSA6IHNlcnZpY2VDcmVhdG9yO1xuXG4gICAgICAgICAgICBpZiAoaXNQcm9taXNlTGlrZShzb3VyY2UpKSB7XG4gICAgICAgICAgICAgIHRoaXMuc3Bhd25Qcm9taXNlKFByb21pc2UucmVzb2x2ZShzb3VyY2UpLCBpZCk7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKGlzRnVuY3Rpb24oc291cmNlKSkge1xuICAgICAgICAgICAgICB0aGlzLnNwYXduQ2FsbGJhY2soc291cmNlLCBpZCk7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKGlzT2JzZXJ2YWJsZShzb3VyY2UpKSB7XG4gICAgICAgICAgICAgIHRoaXMuc3Bhd25PYnNlcnZhYmxlKHNvdXJjZSwgaWQpO1xuICAgICAgICAgICAgfSBlbHNlIGlmIChpc01hY2hpbmUoc291cmNlKSkge1xuICAgICAgICAgICAgICAvLyBUT0RPOiB0cnkvY2F0Y2ggaGVyZVxuICAgICAgICAgICAgICB0aGlzLnNwYXduTWFjaGluZShyZXNvbHZlZERhdGEgPyBzb3VyY2Uud2l0aENvbnRleHQocmVzb2x2ZWREYXRhKSA6IHNvdXJjZSwge1xuICAgICAgICAgICAgICAgIGlkOiBpZCxcbiAgICAgICAgICAgICAgICBhdXRvRm9yd2FyZDogYXV0b0ZvcndhcmRcbiAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMuc3Bhd25BY3Rpdml0eShhY3Rpdml0eSk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cblxuICAgICAgY2FzZSBzdG9wOlxuICAgICAgICB7XG4gICAgICAgICAgdGhpcy5zdG9wQ2hpbGQoYWN0aW9uLmFjdGl2aXR5LmlkKTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuXG4gICAgICBjYXNlIGxvZzpcbiAgICAgICAgdmFyIGxhYmVsID0gYWN0aW9uLmxhYmVsLFxuICAgICAgICAgICAgdmFsdWUgPSBhY3Rpb24udmFsdWU7XG5cbiAgICAgICAgaWYgKGxhYmVsKSB7XG4gICAgICAgICAgdGhpcy5sb2dnZXIobGFiZWwsIHZhbHVlKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB0aGlzLmxvZ2dlcih2YWx1ZSk7XG4gICAgICAgIH1cblxuICAgICAgICBicmVhaztcblxuICAgICAgZGVmYXVsdDpcbiAgICAgICAgaWYgKCFJU19QUk9EVUNUSU9OKSB7XG4gICAgICAgICAgd2FybihmYWxzZSwgXCJObyBpbXBsZW1lbnRhdGlvbiBmb3VuZCBmb3IgYWN0aW9uIHR5cGUgJ1wiICsgYWN0aW9uLnR5cGUgKyBcIidcIik7XG4gICAgICAgIH1cblxuICAgICAgICBicmVhaztcbiAgICB9XG5cbiAgICByZXR1cm4gdW5kZWZpbmVkO1xuICB9O1xuXG4gIEludGVycHJldGVyLnByb3RvdHlwZS5yZW1vdmVDaGlsZCA9IGZ1bmN0aW9uIChjaGlsZElkKSB7XG4gICAgdGhpcy5jaGlsZHJlbi5kZWxldGUoY2hpbGRJZCk7XG4gICAgdGhpcy5mb3J3YXJkVG8uZGVsZXRlKGNoaWxkSWQpO1xuICAgIGRlbGV0ZSB0aGlzLnN0YXRlLmNoaWxkcmVuW2NoaWxkSWRdO1xuICB9O1xuXG4gIEludGVycHJldGVyLnByb3RvdHlwZS5zdG9wQ2hpbGQgPSBmdW5jdGlvbiAoY2hpbGRJZCkge1xuICAgIHZhciBjaGlsZCA9IHRoaXMuY2hpbGRyZW4uZ2V0KGNoaWxkSWQpO1xuXG4gICAgaWYgKCFjaGlsZCkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHRoaXMucmVtb3ZlQ2hpbGQoY2hpbGRJZCk7XG5cbiAgICBpZiAoaXNGdW5jdGlvbihjaGlsZC5zdG9wKSkge1xuICAgICAgY2hpbGQuc3RvcCgpO1xuICAgIH1cbiAgfTtcblxuICBJbnRlcnByZXRlci5wcm90b3R5cGUuc3Bhd24gPSBmdW5jdGlvbiAoZW50aXR5LCBuYW1lLCBvcHRpb25zKSB7XG4gICAgaWYgKGlzUHJvbWlzZUxpa2UoZW50aXR5KSkge1xuICAgICAgcmV0dXJuIHRoaXMuc3Bhd25Qcm9taXNlKFByb21pc2UucmVzb2x2ZShlbnRpdHkpLCBuYW1lKTtcbiAgICB9IGVsc2UgaWYgKGlzRnVuY3Rpb24oZW50aXR5KSkge1xuICAgICAgcmV0dXJuIHRoaXMuc3Bhd25DYWxsYmFjayhlbnRpdHksIG5hbWUpO1xuICAgIH0gZWxzZSBpZiAoaXNBY3RvcihlbnRpdHkpKSB7XG4gICAgICByZXR1cm4gdGhpcy5zcGF3bkFjdG9yKGVudGl0eSk7XG4gICAgfSBlbHNlIGlmIChpc09ic2VydmFibGUoZW50aXR5KSkge1xuICAgICAgcmV0dXJuIHRoaXMuc3Bhd25PYnNlcnZhYmxlKGVudGl0eSwgbmFtZSk7XG4gICAgfSBlbHNlIGlmIChpc01hY2hpbmUoZW50aXR5KSkge1xuICAgICAgcmV0dXJuIHRoaXMuc3Bhd25NYWNoaW5lKGVudGl0eSwgX19hc3NpZ24oX19hc3NpZ24oe30sIG9wdGlvbnMpLCB7XG4gICAgICAgIGlkOiBuYW1lXG4gICAgICB9KSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihcIlVuYWJsZSB0byBzcGF3biBlbnRpdHkgXFxcIlwiICsgbmFtZSArIFwiXFxcIiBvZiB0eXBlIFxcXCJcIiArIHR5cGVvZiBlbnRpdHkgKyBcIlxcXCIuXCIpO1xuICAgIH1cbiAgfTtcblxuICBJbnRlcnByZXRlci5wcm90b3R5cGUuc3Bhd25NYWNoaW5lID0gZnVuY3Rpb24gKG1hY2hpbmUsIG9wdGlvbnMpIHtcbiAgICB2YXIgX3RoaXMgPSB0aGlzO1xuXG4gICAgaWYgKG9wdGlvbnMgPT09IHZvaWQgMCkge1xuICAgICAgb3B0aW9ucyA9IHt9O1xuICAgIH1cblxuICAgIHZhciBjaGlsZFNlcnZpY2UgPSBuZXcgSW50ZXJwcmV0ZXIobWFjaGluZSwgX19hc3NpZ24oX19hc3NpZ24oe30sIHRoaXMub3B0aW9ucyksIHtcbiAgICAgIHBhcmVudDogdGhpcyxcbiAgICAgIGlkOiBvcHRpb25zLmlkIHx8IG1hY2hpbmUuaWRcbiAgICB9KSk7XG5cbiAgICB2YXIgcmVzb2x2ZWRPcHRpb25zID0gX19hc3NpZ24oX19hc3NpZ24oe30sIERFRkFVTFRfU1BBV05fT1BUSU9OUyksIG9wdGlvbnMpO1xuXG4gICAgaWYgKHJlc29sdmVkT3B0aW9ucy5zeW5jKSB7XG4gICAgICBjaGlsZFNlcnZpY2Uub25UcmFuc2l0aW9uKGZ1bmN0aW9uIChzdGF0ZSkge1xuICAgICAgICBfdGhpcy5zZW5kKHVwZGF0ZSwge1xuICAgICAgICAgIHN0YXRlOiBzdGF0ZSxcbiAgICAgICAgICBpZDogY2hpbGRTZXJ2aWNlLmlkXG4gICAgICAgIH0pO1xuICAgICAgfSk7XG4gICAgfVxuXG4gICAgdmFyIGFjdG9yID0gY2hpbGRTZXJ2aWNlO1xuICAgIHRoaXMuY2hpbGRyZW4uc2V0KGNoaWxkU2VydmljZS5pZCwgYWN0b3IpO1xuXG4gICAgaWYgKHJlc29sdmVkT3B0aW9ucy5hdXRvRm9yd2FyZCkge1xuICAgICAgdGhpcy5mb3J3YXJkVG8uYWRkKGNoaWxkU2VydmljZS5pZCk7XG4gICAgfVxuXG4gICAgY2hpbGRTZXJ2aWNlLm9uRG9uZShmdW5jdGlvbiAoZG9uZUV2ZW50KSB7XG4gICAgICBfdGhpcy5yZW1vdmVDaGlsZChjaGlsZFNlcnZpY2UuaWQpO1xuXG4gICAgICBfdGhpcy5zZW5kKHRvU0NYTUxFdmVudChkb25lRXZlbnQsIHtcbiAgICAgICAgb3JpZ2luOiBjaGlsZFNlcnZpY2UuaWRcbiAgICAgIH0pKTtcbiAgICB9KS5zdGFydCgpO1xuICAgIHJldHVybiBhY3RvcjtcbiAgfTtcblxuICBJbnRlcnByZXRlci5wcm90b3R5cGUuc3Bhd25Qcm9taXNlID0gZnVuY3Rpb24gKHByb21pc2UsIGlkKSB7XG4gICAgdmFyIF90aGlzID0gdGhpcztcblxuICAgIHZhciBjYW5jZWxlZCA9IGZhbHNlO1xuICAgIHByb21pc2UudGhlbihmdW5jdGlvbiAocmVzcG9uc2UpIHtcbiAgICAgIGlmICghY2FuY2VsZWQpIHtcbiAgICAgICAgX3RoaXMucmVtb3ZlQ2hpbGQoaWQpO1xuXG4gICAgICAgIF90aGlzLnNlbmQodG9TQ1hNTEV2ZW50KGRvbmVJbnZva2UoaWQsIHJlc3BvbnNlKSwge1xuICAgICAgICAgIG9yaWdpbjogaWRcbiAgICAgICAgfSkpO1xuICAgICAgfVxuICAgIH0sIGZ1bmN0aW9uIChlcnJvckRhdGEpIHtcbiAgICAgIGlmICghY2FuY2VsZWQpIHtcbiAgICAgICAgX3RoaXMucmVtb3ZlQ2hpbGQoaWQpO1xuXG4gICAgICAgIHZhciBlcnJvckV2ZW50ID0gZXJyb3IoaWQsIGVycm9yRGF0YSk7XG5cbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAvLyBTZW5kIFwiZXJyb3IucGxhdGZvcm0uaWRcIiB0byB0aGlzIChwYXJlbnQpLlxuICAgICAgICAgIF90aGlzLnNlbmQodG9TQ1hNTEV2ZW50KGVycm9yRXZlbnQsIHtcbiAgICAgICAgICAgIG9yaWdpbjogaWRcbiAgICAgICAgICB9KSk7XG4gICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgcmVwb3J0VW5oYW5kbGVkRXhjZXB0aW9uT25JbnZvY2F0aW9uKGVycm9yRGF0YSwgZXJyb3IsIGlkKTtcblxuICAgICAgICAgIGlmIChfdGhpcy5kZXZUb29scykge1xuICAgICAgICAgICAgX3RoaXMuZGV2VG9vbHMuc2VuZChlcnJvckV2ZW50LCBfdGhpcy5zdGF0ZSk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgaWYgKF90aGlzLm1hY2hpbmUuc3RyaWN0KSB7XG4gICAgICAgICAgICAvLyBpdCB3b3VsZCBiZSBiZXR0ZXIgdG8gYWx3YXlzIHN0b3AgdGhlIHN0YXRlIG1hY2hpbmUgaWYgdW5oYW5kbGVkXG4gICAgICAgICAgICAvLyBleGNlcHRpb24vcHJvbWlzZSByZWplY3Rpb24gaGFwcGVucyBidXQgYmVjYXVzZSB3ZSBkb24ndCB3YW50IHRvXG4gICAgICAgICAgICAvLyBicmVhayBleGlzdGluZyBjb2RlIHNvIGVuZm9yY2UgaXQgb24gc3RyaWN0IG1vZGUgb25seSBlc3BlY2lhbGx5IHNvXG4gICAgICAgICAgICAvLyBiZWNhdXNlIGRvY3VtZW50YXRpb24gc2F5cyB0aGF0IG9uRXJyb3IgaXMgb3B0aW9uYWxcbiAgICAgICAgICAgIF90aGlzLnN0b3AoKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9KTtcbiAgICB2YXIgYWN0b3IgPSB7XG4gICAgICBpZDogaWQsXG4gICAgICBzZW5kOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJldHVybiB2b2lkIDA7XG4gICAgICB9LFxuICAgICAgc3Vic2NyaWJlOiBmdW5jdGlvbiAobmV4dCwgaGFuZGxlRXJyb3IsIGNvbXBsZXRlKSB7XG4gICAgICAgIHZhciB1bnN1YnNjcmliZWQgPSBmYWxzZTtcbiAgICAgICAgcHJvbWlzZS50aGVuKGZ1bmN0aW9uIChyZXNwb25zZSkge1xuICAgICAgICAgIGlmICh1bnN1YnNjcmliZWQpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBuZXh0ICYmIG5leHQocmVzcG9uc2UpO1xuXG4gICAgICAgICAgaWYgKHVuc3Vic2NyaWJlZCkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIGNvbXBsZXRlICYmIGNvbXBsZXRlKCk7XG4gICAgICAgIH0sIGZ1bmN0aW9uIChlcnIpIHtcbiAgICAgICAgICBpZiAodW5zdWJzY3JpYmVkKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgaGFuZGxlRXJyb3IoZXJyKTtcbiAgICAgICAgfSk7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgdW5zdWJzY3JpYmU6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHJldHVybiB1bnN1YnNjcmliZWQgPSB0cnVlO1xuICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICAgIH0sXG4gICAgICBzdG9wOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIGNhbmNlbGVkID0gdHJ1ZTtcbiAgICAgIH0sXG4gICAgICB0b0pTT046IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICBpZDogaWRcbiAgICAgICAgfTtcbiAgICAgIH1cbiAgICB9O1xuICAgIHRoaXMuY2hpbGRyZW4uc2V0KGlkLCBhY3Rvcik7XG4gICAgcmV0dXJuIGFjdG9yO1xuICB9O1xuXG4gIEludGVycHJldGVyLnByb3RvdHlwZS5zcGF3bkNhbGxiYWNrID0gZnVuY3Rpb24gKGNhbGxiYWNrLCBpZCkge1xuICAgIHZhciBfdGhpcyA9IHRoaXM7XG5cbiAgICB2YXIgY2FuY2VsZWQgPSBmYWxzZTtcbiAgICB2YXIgcmVjZWl2ZXJzID0gbmV3IFNldCgpO1xuICAgIHZhciBsaXN0ZW5lcnMgPSBuZXcgU2V0KCk7XG5cbiAgICB2YXIgcmVjZWl2ZSA9IGZ1bmN0aW9uIChlKSB7XG4gICAgICBsaXN0ZW5lcnMuZm9yRWFjaChmdW5jdGlvbiAobGlzdGVuZXIpIHtcbiAgICAgICAgcmV0dXJuIGxpc3RlbmVyKGUpO1xuICAgICAgfSk7XG5cbiAgICAgIGlmIChjYW5jZWxlZCkge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIF90aGlzLnNlbmQoZSk7XG4gICAgfTtcblxuICAgIHZhciBjYWxsYmFja1N0b3A7XG5cbiAgICB0cnkge1xuICAgICAgY2FsbGJhY2tTdG9wID0gY2FsbGJhY2socmVjZWl2ZSwgZnVuY3Rpb24gKG5ld0xpc3RlbmVyKSB7XG4gICAgICAgIHJlY2VpdmVycy5hZGQobmV3TGlzdGVuZXIpO1xuICAgICAgfSk7XG4gICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICB0aGlzLnNlbmQoZXJyb3IoaWQsIGVycikpO1xuICAgIH1cblxuICAgIGlmIChpc1Byb21pc2VMaWtlKGNhbGxiYWNrU3RvcCkpIHtcbiAgICAgIC8vIGl0IHR1cm5lZCBvdXQgdG8gYmUgYW4gYXN5bmMgZnVuY3Rpb24sIGNhbid0IHJlbGlhYmx5IGNoZWNrIHRoaXMgYmVmb3JlIGNhbGxpbmcgYGNhbGxiYWNrYFxuICAgICAgLy8gYmVjYXVzZSB0cmFuc3BpbGVkIGFzeW5jIGZ1bmN0aW9ucyBhcmUgbm90IHJlY29nbml6YWJsZVxuICAgICAgcmV0dXJuIHRoaXMuc3Bhd25Qcm9taXNlKGNhbGxiYWNrU3RvcCwgaWQpO1xuICAgIH1cblxuICAgIHZhciBhY3RvciA9IHtcbiAgICAgIGlkOiBpZCxcbiAgICAgIHNlbmQ6IGZ1bmN0aW9uIChldmVudCkge1xuICAgICAgICByZXR1cm4gcmVjZWl2ZXJzLmZvckVhY2goZnVuY3Rpb24gKHJlY2VpdmVyKSB7XG4gICAgICAgICAgcmV0dXJuIHJlY2VpdmVyKGV2ZW50KTtcbiAgICAgICAgfSk7XG4gICAgICB9LFxuICAgICAgc3Vic2NyaWJlOiBmdW5jdGlvbiAobmV4dCkge1xuICAgICAgICBsaXN0ZW5lcnMuYWRkKG5leHQpO1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgIHVuc3Vic2NyaWJlOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBsaXN0ZW5lcnMuZGVsZXRlKG5leHQpO1xuICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICAgIH0sXG4gICAgICBzdG9wOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIGNhbmNlbGVkID0gdHJ1ZTtcblxuICAgICAgICBpZiAoaXNGdW5jdGlvbihjYWxsYmFja1N0b3ApKSB7XG4gICAgICAgICAgY2FsbGJhY2tTdG9wKCk7XG4gICAgICAgIH1cbiAgICAgIH0sXG4gICAgICB0b0pTT046IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICBpZDogaWRcbiAgICAgICAgfTtcbiAgICAgIH1cbiAgICB9O1xuICAgIHRoaXMuY2hpbGRyZW4uc2V0KGlkLCBhY3Rvcik7XG4gICAgcmV0dXJuIGFjdG9yO1xuICB9O1xuXG4gIEludGVycHJldGVyLnByb3RvdHlwZS5zcGF3bk9ic2VydmFibGUgPSBmdW5jdGlvbiAoc291cmNlLCBpZCkge1xuICAgIHZhciBfdGhpcyA9IHRoaXM7XG5cbiAgICB2YXIgc3Vic2NyaXB0aW9uID0gc291cmNlLnN1YnNjcmliZShmdW5jdGlvbiAodmFsdWUpIHtcbiAgICAgIF90aGlzLnNlbmQodG9TQ1hNTEV2ZW50KHZhbHVlLCB7XG4gICAgICAgIG9yaWdpbjogaWRcbiAgICAgIH0pKTtcbiAgICB9LCBmdW5jdGlvbiAoZXJyKSB7XG4gICAgICBfdGhpcy5yZW1vdmVDaGlsZChpZCk7XG5cbiAgICAgIF90aGlzLnNlbmQodG9TQ1hNTEV2ZW50KGVycm9yKGlkLCBlcnIpLCB7XG4gICAgICAgIG9yaWdpbjogaWRcbiAgICAgIH0pKTtcbiAgICB9LCBmdW5jdGlvbiAoKSB7XG4gICAgICBfdGhpcy5yZW1vdmVDaGlsZChpZCk7XG5cbiAgICAgIF90aGlzLnNlbmQodG9TQ1hNTEV2ZW50KGRvbmVJbnZva2UoaWQpLCB7XG4gICAgICAgIG9yaWdpbjogaWRcbiAgICAgIH0pKTtcbiAgICB9KTtcbiAgICB2YXIgYWN0b3IgPSB7XG4gICAgICBpZDogaWQsXG4gICAgICBzZW5kOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJldHVybiB2b2lkIDA7XG4gICAgICB9LFxuICAgICAgc3Vic2NyaWJlOiBmdW5jdGlvbiAobmV4dCwgaGFuZGxlRXJyb3IsIGNvbXBsZXRlKSB7XG4gICAgICAgIHJldHVybiBzb3VyY2Uuc3Vic2NyaWJlKG5leHQsIGhhbmRsZUVycm9yLCBjb21wbGV0ZSk7XG4gICAgICB9LFxuICAgICAgc3RvcDogZnVuY3Rpb24gKCkge1xuICAgICAgICByZXR1cm4gc3Vic2NyaXB0aW9uLnVuc3Vic2NyaWJlKCk7XG4gICAgICB9LFxuICAgICAgdG9KU09OOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgaWQ6IGlkXG4gICAgICAgIH07XG4gICAgICB9XG4gICAgfTtcbiAgICB0aGlzLmNoaWxkcmVuLnNldChpZCwgYWN0b3IpO1xuICAgIHJldHVybiBhY3RvcjtcbiAgfTtcblxuICBJbnRlcnByZXRlci5wcm90b3R5cGUuc3Bhd25BY3RvciA9IGZ1bmN0aW9uIChhY3Rvcikge1xuICAgIHRoaXMuY2hpbGRyZW4uc2V0KGFjdG9yLmlkLCBhY3Rvcik7XG4gICAgcmV0dXJuIGFjdG9yO1xuICB9O1xuXG4gIEludGVycHJldGVyLnByb3RvdHlwZS5zcGF3bkFjdGl2aXR5ID0gZnVuY3Rpb24gKGFjdGl2aXR5KSB7XG4gICAgdmFyIGltcGxlbWVudGF0aW9uID0gdGhpcy5tYWNoaW5lLm9wdGlvbnMgJiYgdGhpcy5tYWNoaW5lLm9wdGlvbnMuYWN0aXZpdGllcyA/IHRoaXMubWFjaGluZS5vcHRpb25zLmFjdGl2aXRpZXNbYWN0aXZpdHkudHlwZV0gOiB1bmRlZmluZWQ7XG5cbiAgICBpZiAoIWltcGxlbWVudGF0aW9uKSB7XG4gICAgICBpZiAoIUlTX1BST0RVQ1RJT04pIHtcbiAgICAgICAgd2FybihmYWxzZSwgXCJObyBpbXBsZW1lbnRhdGlvbiBmb3VuZCBmb3IgYWN0aXZpdHkgJ1wiICsgYWN0aXZpdHkudHlwZSArIFwiJ1wiKTtcbiAgICAgIH0gLy8gdHNsaW50OmRpc2FibGUtbmV4dC1saW5lOm5vLWNvbnNvbGVcblxuXG4gICAgICByZXR1cm47XG4gICAgfSAvLyBTdGFydCBpbXBsZW1lbnRhdGlvblxuXG5cbiAgICB2YXIgZGlzcG9zZSA9IGltcGxlbWVudGF0aW9uKHRoaXMuc3RhdGUuY29udGV4dCwgYWN0aXZpdHkpO1xuICAgIHRoaXMuc3Bhd25FZmZlY3QoYWN0aXZpdHkuaWQsIGRpc3Bvc2UpO1xuICB9O1xuXG4gIEludGVycHJldGVyLnByb3RvdHlwZS5zcGF3bkVmZmVjdCA9IGZ1bmN0aW9uIChpZCwgZGlzcG9zZSkge1xuICAgIHRoaXMuY2hpbGRyZW4uc2V0KGlkLCB7XG4gICAgICBpZDogaWQsXG4gICAgICBzZW5kOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJldHVybiB2b2lkIDA7XG4gICAgICB9LFxuICAgICAgc3Vic2NyaWJlOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgdW5zdWJzY3JpYmU6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHJldHVybiB2b2lkIDA7XG4gICAgICAgICAgfVxuICAgICAgICB9O1xuICAgICAgfSxcbiAgICAgIHN0b3A6IGRpc3Bvc2UgfHwgdW5kZWZpbmVkLFxuICAgICAgdG9KU09OOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgaWQ6IGlkXG4gICAgICAgIH07XG4gICAgICB9XG4gICAgfSk7XG4gIH07XG5cbiAgSW50ZXJwcmV0ZXIucHJvdG90eXBlLmF0dGFjaERldiA9IGZ1bmN0aW9uICgpIHtcbiAgICBpZiAodGhpcy5vcHRpb25zLmRldlRvb2xzICYmIHR5cGVvZiB3aW5kb3cgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICBpZiAod2luZG93Ll9fUkVEVVhfREVWVE9PTFNfRVhURU5TSU9OX18pIHtcbiAgICAgICAgdmFyIGRldlRvb2xzT3B0aW9ucyA9IHR5cGVvZiB0aGlzLm9wdGlvbnMuZGV2VG9vbHMgPT09ICdvYmplY3QnID8gdGhpcy5vcHRpb25zLmRldlRvb2xzIDogdW5kZWZpbmVkO1xuICAgICAgICB0aGlzLmRldlRvb2xzID0gd2luZG93Ll9fUkVEVVhfREVWVE9PTFNfRVhURU5TSU9OX18uY29ubmVjdChfX2Fzc2lnbihfX2Fzc2lnbih7XG4gICAgICAgICAgbmFtZTogdGhpcy5pZCxcbiAgICAgICAgICBhdXRvUGF1c2U6IHRydWUsXG4gICAgICAgICAgc3RhdGVTYW5pdGl6ZXI6IGZ1bmN0aW9uIChzdGF0ZSkge1xuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgdmFsdWU6IHN0YXRlLnZhbHVlLFxuICAgICAgICAgICAgICBjb250ZXh0OiBzdGF0ZS5jb250ZXh0LFxuICAgICAgICAgICAgICBhY3Rpb25zOiBzdGF0ZS5hY3Rpb25zXG4gICAgICAgICAgICB9O1xuICAgICAgICAgIH1cbiAgICAgICAgfSwgZGV2VG9vbHNPcHRpb25zKSwge1xuICAgICAgICAgIGZlYXR1cmVzOiBfX2Fzc2lnbih7XG4gICAgICAgICAgICBqdW1wOiBmYWxzZSxcbiAgICAgICAgICAgIHNraXA6IGZhbHNlXG4gICAgICAgICAgfSwgZGV2VG9vbHNPcHRpb25zID8gZGV2VG9vbHNPcHRpb25zLmZlYXR1cmVzIDogdW5kZWZpbmVkKVxuICAgICAgICB9KSwgdGhpcy5tYWNoaW5lKTtcbiAgICAgICAgdGhpcy5kZXZUb29scy5pbml0KHRoaXMuc3RhdGUpO1xuICAgICAgfSAvLyBhZGQgWFN0YXRlLXNwZWNpZmljIGRldiB0b29saW5nIGhvb2tcblxuXG4gICAgICByZWdpc3RlclNlcnZpY2UodGhpcyk7XG4gICAgfVxuICB9O1xuXG4gIEludGVycHJldGVyLnByb3RvdHlwZS50b0pTT04gPSBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIGlkOiB0aGlzLmlkXG4gICAgfTtcbiAgfTtcblxuICBJbnRlcnByZXRlci5wcm90b3R5cGVbc3ltYm9sT2JzZXJ2YWJsZV0gPSBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH07XG4gIC8qKlxyXG4gICAqIFRoZSBkZWZhdWx0IGludGVycHJldGVyIG9wdGlvbnM6XHJcbiAgICpcclxuICAgKiAtIGBjbG9ja2AgdXNlcyB0aGUgZ2xvYmFsIGBzZXRUaW1lb3V0YCBhbmQgYGNsZWFyVGltZW91dGAgZnVuY3Rpb25zXHJcbiAgICogLSBgbG9nZ2VyYCB1c2VzIHRoZSBnbG9iYWwgYGNvbnNvbGUubG9nKClgIG1ldGhvZFxyXG4gICAqL1xuXG5cbiAgSW50ZXJwcmV0ZXIuZGVmYXVsdE9wdGlvbnMgPSAvKiNfX1BVUkVfXyovZnVuY3Rpb24gKGdsb2JhbCkge1xuICAgIHJldHVybiB7XG4gICAgICBleGVjdXRlOiB0cnVlLFxuICAgICAgZGVmZXJFdmVudHM6IHRydWUsXG4gICAgICBjbG9jazoge1xuICAgICAgICBzZXRUaW1lb3V0OiBmdW5jdGlvbiAoZm4sIG1zKSB7XG4gICAgICAgICAgcmV0dXJuIGdsb2JhbC5zZXRUaW1lb3V0LmNhbGwobnVsbCwgZm4sIG1zKTtcbiAgICAgICAgfSxcbiAgICAgICAgY2xlYXJUaW1lb3V0OiBmdW5jdGlvbiAoaWQpIHtcbiAgICAgICAgICByZXR1cm4gZ2xvYmFsLmNsZWFyVGltZW91dC5jYWxsKG51bGwsIGlkKTtcbiAgICAgICAgfVxuICAgICAgfSxcbiAgICAgIGxvZ2dlcjogZ2xvYmFsLmNvbnNvbGUubG9nLmJpbmQoY29uc29sZSksXG4gICAgICBkZXZUb29sczogZmFsc2VcbiAgICB9O1xuICB9KHR5cGVvZiBzZWxmICE9PSAndW5kZWZpbmVkJyA/IHNlbGYgOiBnbG9iYWwpO1xuXG4gIEludGVycHJldGVyLmludGVycHJldCA9IGludGVycHJldDtcbiAgcmV0dXJuIEludGVycHJldGVyO1xufSgpO1xuXG52YXIgcmVzb2x2ZVNwYXduT3B0aW9ucyA9IGZ1bmN0aW9uIChuYW1lT3JPcHRpb25zKSB7XG4gIGlmIChpc1N0cmluZyhuYW1lT3JPcHRpb25zKSkge1xuICAgIHJldHVybiBfX2Fzc2lnbihfX2Fzc2lnbih7fSwgREVGQVVMVF9TUEFXTl9PUFRJT05TKSwge1xuICAgICAgbmFtZTogbmFtZU9yT3B0aW9uc1xuICAgIH0pO1xuICB9XG5cbiAgcmV0dXJuIF9fYXNzaWduKF9fYXNzaWduKF9fYXNzaWduKHt9LCBERUZBVUxUX1NQQVdOX09QVElPTlMpLCB7XG4gICAgbmFtZTogdW5pcXVlSWQoKVxuICB9KSwgbmFtZU9yT3B0aW9ucyk7XG59O1xuXG5mdW5jdGlvbiBzcGF3bihlbnRpdHksIG5hbWVPck9wdGlvbnMpIHtcbiAgdmFyIHJlc29sdmVkT3B0aW9ucyA9IHJlc29sdmVTcGF3bk9wdGlvbnMobmFtZU9yT3B0aW9ucyk7XG4gIHJldHVybiBjb25zdW1lKGZ1bmN0aW9uIChzZXJ2aWNlKSB7XG4gICAgaWYgKCFJU19QUk9EVUNUSU9OKSB7XG4gICAgICB2YXIgaXNMYXp5RW50aXR5ID0gaXNNYWNoaW5lKGVudGl0eSkgfHwgaXNGdW5jdGlvbihlbnRpdHkpO1xuICAgICAgd2FybighIXNlcnZpY2UgfHwgaXNMYXp5RW50aXR5LCBcIkF0dGVtcHRlZCB0byBzcGF3biBhbiBBY3RvciAoSUQ6IFxcXCJcIiArIChpc01hY2hpbmUoZW50aXR5KSA/IGVudGl0eS5pZCA6ICd1bmRlZmluZWQnKSArIFwiXFxcIikgb3V0c2lkZSBvZiBhIHNlcnZpY2UuIFRoaXMgd2lsbCBoYXZlIG5vIGVmZmVjdC5cIik7XG4gICAgfVxuXG4gICAgaWYgKHNlcnZpY2UpIHtcbiAgICAgIHJldHVybiBzZXJ2aWNlLnNwYXduKGVudGl0eSwgcmVzb2x2ZWRPcHRpb25zLm5hbWUsIHJlc29sdmVkT3B0aW9ucyk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBjcmVhdGVEZWZlcnJlZEFjdG9yKGVudGl0eSwgcmVzb2x2ZWRPcHRpb25zLm5hbWUpO1xuICAgIH1cbiAgfSk7XG59XG4vKipcclxuICogQ3JlYXRlcyBhIG5ldyBJbnRlcnByZXRlciBpbnN0YW5jZSBmb3IgdGhlIGdpdmVuIG1hY2hpbmUgd2l0aCB0aGUgcHJvdmlkZWQgb3B0aW9ucywgaWYgYW55LlxyXG4gKlxyXG4gKiBAcGFyYW0gbWFjaGluZSBUaGUgbWFjaGluZSB0byBpbnRlcnByZXRcclxuICogQHBhcmFtIG9wdGlvbnMgSW50ZXJwcmV0ZXIgb3B0aW9uc1xyXG4gKi9cblxuXG5mdW5jdGlvbiBpbnRlcnByZXQobWFjaGluZSwgb3B0aW9ucykge1xuICB2YXIgaW50ZXJwcmV0ZXIgPSBuZXcgSW50ZXJwcmV0ZXIobWFjaGluZSwgb3B0aW9ucyk7XG4gIHJldHVybiBpbnRlcnByZXRlcjtcbn1cblxuZXhwb3J0IHsgSW50ZXJwcmV0ZXIsIEludGVycHJldGVyU3RhdHVzLCBpbnRlcnByZXQsIHNwYXduIH07IiwiaW1wb3J0IHsgX192YWx1ZXMsIF9fcmVhZCB9IGZyb20gJy4vX3ZpcnR1YWwvX3RzbGliLmpzJztcbmltcG9ydCB7IFN0YXRlIH0gZnJvbSAnLi9TdGF0ZS5qcyc7XG5cbmZ1bmN0aW9uIG1hdGNoU3RhdGUoc3RhdGUsIHBhdHRlcm5zLCBkZWZhdWx0VmFsdWUpIHtcbiAgdmFyIGVfMSwgX2E7XG5cbiAgdmFyIHJlc29sdmVkU3RhdGUgPSBTdGF0ZS5mcm9tKHN0YXRlLCBzdGF0ZSBpbnN0YW5jZW9mIFN0YXRlID8gc3RhdGUuY29udGV4dCA6IHVuZGVmaW5lZCk7XG5cbiAgdHJ5IHtcbiAgICBmb3IgKHZhciBwYXR0ZXJuc18xID0gX192YWx1ZXMocGF0dGVybnMpLCBwYXR0ZXJuc18xXzEgPSBwYXR0ZXJuc18xLm5leHQoKTsgIXBhdHRlcm5zXzFfMS5kb25lOyBwYXR0ZXJuc18xXzEgPSBwYXR0ZXJuc18xLm5leHQoKSkge1xuICAgICAgdmFyIF9iID0gX19yZWFkKHBhdHRlcm5zXzFfMS52YWx1ZSwgMiksXG4gICAgICAgICAgc3RhdGVWYWx1ZSA9IF9iWzBdLFxuICAgICAgICAgIGdldFZhbHVlID0gX2JbMV07XG5cbiAgICAgIGlmIChyZXNvbHZlZFN0YXRlLm1hdGNoZXMoc3RhdGVWYWx1ZSkpIHtcbiAgICAgICAgcmV0dXJuIGdldFZhbHVlKHJlc29sdmVkU3RhdGUpO1xuICAgICAgfVxuICAgIH1cbiAgfSBjYXRjaCAoZV8xXzEpIHtcbiAgICBlXzEgPSB7XG4gICAgICBlcnJvcjogZV8xXzFcbiAgICB9O1xuICB9IGZpbmFsbHkge1xuICAgIHRyeSB7XG4gICAgICBpZiAocGF0dGVybnNfMV8xICYmICFwYXR0ZXJuc18xXzEuZG9uZSAmJiAoX2EgPSBwYXR0ZXJuc18xLnJldHVybikpIF9hLmNhbGwocGF0dGVybnNfMSk7XG4gICAgfSBmaW5hbGx5IHtcbiAgICAgIGlmIChlXzEpIHRocm93IGVfMS5lcnJvcjtcbiAgICB9XG4gIH1cblxuICByZXR1cm4gZGVmYXVsdFZhbHVlKHJlc29sdmVkU3RhdGUpO1xufVxuXG5leHBvcnQgeyBtYXRjaFN0YXRlIH07IiwiZXhwb3J0IHsgbWF0Y2hlc1N0YXRlIH0gZnJvbSAnLi91dGlscy5qcyc7XG5leHBvcnQgeyBtYXBTdGF0ZSB9IGZyb20gJy4vbWFwU3RhdGUuanMnO1xuZXhwb3J0IHsgQWN0aW9uVHlwZXMsIFNwZWNpYWxUYXJnZXRzIH0gZnJvbSAnLi90eXBlcy5qcyc7XG5pbXBvcnQgeyByYWlzZSwgc2VuZCwgc2VuZFBhcmVudCwgc2VuZFVwZGF0ZSwgbG9nLCBjYW5jZWwsIHN0YXJ0LCBzdG9wLCBhc3NpZ24sIGFmdGVyLCBkb25lLCByZXNwb25kLCBmb3J3YXJkVG8sIGVzY2FsYXRlLCBjaG9vc2UsIHB1cmUgfSBmcm9tICcuL2FjdGlvbnMuanMnO1xuZXhwb3J0IHsgYXNzaWduLCBkb25lSW52b2tlLCBmb3J3YXJkVG8sIHNlbmQsIHNlbmRQYXJlbnQsIHNlbmRVcGRhdGUgfSBmcm9tICcuL2FjdGlvbnMuanMnO1xuZXhwb3J0IHsgU3RhdGUgfSBmcm9tICcuL1N0YXRlLmpzJztcbmV4cG9ydCB7IFN0YXRlTm9kZSB9IGZyb20gJy4vU3RhdGVOb2RlLmpzJztcbmV4cG9ydCB7IE1hY2hpbmUsIGNyZWF0ZU1hY2hpbmUgfSBmcm9tICcuL01hY2hpbmUuanMnO1xuZXhwb3J0IHsgSW50ZXJwcmV0ZXIsIEludGVycHJldGVyU3RhdHVzLCBpbnRlcnByZXQsIHNwYXduIH0gZnJvbSAnLi9pbnRlcnByZXRlci5qcyc7XG5leHBvcnQgeyBtYXRjaFN0YXRlIH0gZnJvbSAnLi9tYXRjaC5qcyc7XG52YXIgYWN0aW9ucyA9IHtcbiAgcmFpc2U6IHJhaXNlLFxuICBzZW5kOiBzZW5kLFxuICBzZW5kUGFyZW50OiBzZW5kUGFyZW50LFxuICBzZW5kVXBkYXRlOiBzZW5kVXBkYXRlLFxuICBsb2c6IGxvZyxcbiAgY2FuY2VsOiBjYW5jZWwsXG4gIHN0YXJ0OiBzdGFydCxcbiAgc3RvcDogc3RvcCxcbiAgYXNzaWduOiBhc3NpZ24sXG4gIGFmdGVyOiBhZnRlcixcbiAgZG9uZTogZG9uZSxcbiAgcmVzcG9uZDogcmVzcG9uZCxcbiAgZm9yd2FyZFRvOiBmb3J3YXJkVG8sXG4gIGVzY2FsYXRlOiBlc2NhbGF0ZSxcbiAgY2hvb3NlOiBjaG9vc2UsXG4gIHB1cmU6IHB1cmVcbn07XG5leHBvcnQgeyBhY3Rpb25zIH07Il0sIm5hbWVzIjpbInJhaXNlIiwic2VuZCIsInJhaXNlJDEiLCJzZW5kJDEiLCJsb2ciLCJsb2ckMSIsImNhbmNlbCIsImNhbmNlbCQxIiwic3RhcnQiLCJzdG9wIiwiYXNzaWduIiwiYXNzaWduJDEiLCJhZnRlciIsImVycm9yIiwicHVyZSIsImVycm9yJDEiLCJjaG9vc2UiLCJjaG9vc2UkMSIsInB1cmUkMSIsInN0b3AkMSIsInRvSW52b2tlU291cmNlIiwic3RhcnQkMSJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7TUFBQTtNQUNBO01BQ0E7TUFDQTtNQUNBO0FBQ0E7TUFDQTtNQUNBO01BQ0E7TUFDQTtBQUNBO01BQ0E7TUFDQTtNQUNBO01BQ0EsSUFBSSxRQUFRLEdBQUcsWUFBWTtNQUMzQixFQUFFLFFBQVEsR0FBRyxNQUFNLENBQUMsTUFBTSxJQUFJLFNBQVMsUUFBUSxDQUFDLENBQUMsRUFBRTtNQUNuRCxJQUFJLEtBQUssSUFBSSxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsU0FBUyxDQUFDLE1BQU0sRUFBRSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFO01BQ3pELE1BQU0sQ0FB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LElBQUksQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUM7TUFDN0YsSUFBSSxJQUFJLENBQUMsT0FBTyxHQUFHLElBQUksQ0FBQyxNQUFNLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxPQUFPLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUM7TUFDM0UsSUFBSSxJQUFJLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxLQUFLLElBQUksQ0FBQyxNQUFNLENBQUMsUUFBUSxHQUFHLFVBQVUsR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLE1BQU0sSUFBSSxJQUFJLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQyxNQUFNLEdBQUcsVUFBVSxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsT0FBTyxHQUFHLFNBQVMsR0FBRyxRQUFRLENBQUMsQ0FBQztBQUMxTDtNQUNBLElBQUksSUFBSSxDQUFDLGFBQWEsRUFBRTtNQUN4QixNQUFNLElBQUksQ0FBQyxFQUFFLFVBQVUsSUFBSSxJQUFJLENBQUMsTUFBTSxDQUFDLEVBQUUsOEVBQThFLElBQUksSUFBSSxDQUFDLE1BQU0sQ0FBQyxRQUFRLEdBQUcsaUNBQWlDLEdBQUcsY0FBYyxHQUFHLElBQUksQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDLEdBQUcsaUNBQWlDLEdBQUcsSUFBSSxDQUFDLEVBQUUsR0FBRyxZQUFZLENBQUMsQ0FBQztNQUN2UixLQUFLO0FBQ0w7TUFDQSxJQUFJLElBQUksQ0FBQyxPQUFPLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUM7TUFDdkMsSUFBSSxJQUFJLENBQUMsTUFBTSxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsTUFBTSxHQUFHLFNBQVMsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLE1BQU0sRUFBRSxVQUFVLFdBQVcsRUFBRSxHQUFHLEVBQUU7TUFDakcsTUFBTSxJQUFJLEVBQUUsQ0FBQztBQUNiO01BQ0EsTUFBTSxJQUFJLFNBQVMsR0FBRyxJQUFJLFNBQVMsQ0FBQyxXQUFXLEVBQUU7TUFDakQsUUFBUSxPQUFPLEVBQUUsS0FBSztNQUN0QixRQUFRLElBQUksRUFBRSxHQUFHO01BQ2pCLE9BQU8sQ0FBQyxDQUFDO01BQ1QsTUFBTSxNQUFNLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxLQUFLLEVBQUUsUUFBUSxFQUFFLEVBQUUsR0FBRyxFQUFFLEVBQUUsRUFBRSxDQUFDLFNBQVMsQ0FBQyxFQUFFLENBQUMsR0FBRyxTQUFTLEVBQUUsRUFBRSxHQUFHLFNBQVMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDO01BQ3pHLE1BQU0sT0FBTyxTQUFTLENBQUM7TUFDdkIsS0FBSyxDQUFDLEdBQUcsWUFBWSxDQUFDO0FBQ3RCO01BQ0EsSUFBSSxJQUFJLEtBQUssR0FBRyxDQUFDLENBQUM7QUFDbEI7TUFDQSxJQUFJLFNBQVMsR0FBRyxDQUFDLFNBQVMsRUFBRTtNQUM1QixNQUFNLElBQUksR0FBRyxFQUFFLEVBQUUsQ0FBQztBQUNsQjtNQUNBLE1BQU0sU0FBUyxDQUFDLEtBQUssR0FBRyxLQUFLLEVBQUUsQ0FBQztBQUNoQztNQUNBLE1BQU0sSUFBSTtNQUNWLFFBQVEsS0FBSyxJQUFJLEVBQUUsR0FBRyxRQUFRLENBQUMsV0FBVyxDQUFDLFNBQVMsQ0FBQyxDQUFDLEVBQUUsRUFBRSxHQUFHLEVBQUUsQ0FBQyxJQUFJLEVBQUUsRUFBRSxDQUFDLEVBQUUsQ0FBQyxJQUFJLEVBQUUsRUFBRSxHQUFHLEVBQUUsQ0FBQyxJQUFJLEVBQUUsRUFBRTtNQUNsRyxVQUFVLElBQUksS0FBSyxHQUFHLEVBQUUsQ0FBQyxLQUFLLENBQUM7TUFDL0IsVUFBVSxHQUFHLENBQUMsS0FBSyxDQUFDLENBQUM7TUFDckIsU0FBUztNQUNULE9BQU8sQ0FBQyxPQUFPLEtBQUssRUFBRTtNQUN0QixRQUFRLEdBQUcsR0FBRztNQUNkLFVBQVUsS0FBSyxFQUFFLEtBQUs7TUFDdEIsU0FBUyxDQUFDO01BQ1YsT0FBTyxTQUFTO01BQ2hCLFFBQVEsSUFBSTtNQUNaLFVBQVUsSUFBSSxFQUFFLElBQUksQ0FBQyxFQUFFLENBQUMsSUFBSSxLQUFLLEVBQUUsR0FBRyxFQUFFLENBQUMsTUFBTSxDQUFDLEVBQUUsRUFBRSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQztNQUM5RCxTQUFTLFNBQVM7TUFDbEIsVUFBVSxJQUFJLEdBQUcsRUFBRSxNQUFNLEdBQUcsQ0FBQyxLQUFLLENBQUM7TUFDbkMsU0FBUztNQUNULE9BQU87TUFDUCxLQUFLO0FBQ0w7TUFDQSxJQUFJLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUNkO01BQ0EsSUFBSSxJQUFJLENBQUMsT0FBTyxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsT0FBTyxLQUFLLElBQUksR0FBRyxTQUFTLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxPQUFPLElBQUksS0FBSyxDQUFDO01BQzNGLElBQUksSUFBSSxDQUFDLFVBQVUsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxNQUFNLEtBQUssQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLEVBQUUsR0FBRyxLQUFLLEdBQUcsS0FBSyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQyxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxVQUFVLEVBQUUsRUFBRTtNQUMzSSxNQUFNLElBQUksS0FBSyxHQUFHLEVBQUUsQ0FBQyxLQUFLLENBQUM7TUFDM0IsTUFBTSxPQUFPLEtBQUssS0FBSyxVQUFVLENBQUM7TUFDbEMsS0FBSyxDQUFDLEdBQUcsVUFBVSxJQUFJLElBQUksQ0FBQyxNQUFNLENBQUMsRUFBRSxDQUFDLENBQUM7TUFDdkMsSUFBSSxJQUFJLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQztBQUN2QztNQUNBLElBQUksSUFBSSxDQUFDLE9BQU8sR0FBRyxPQUFPLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxL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QUMsRUFBRTtNQUM1QixNQUFNLE9BQU8sR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDO01BQzdCLEtBQUs7QUFDTDtNQUNBLElBQUksSUFBSSxFQUFFLEdBQUcsSUFBSSxDQUFDLE9BQU87TUFDekIsUUFBUSxPQUFPLEdBQUcsRUFBRSxDQUFDLE9BQU87TUFDNUIsUUFBUSxVQUFVLEdBQUcsRUFBRSxDQUFDLFVBQVU7TUFDbEMsUUFBUSxNQUFNLEdBQUcsRUFBRSxDQUFDLE1BQU07TUFDMUIsUUFBUSxRQUFRLEdBQUcsRUFBRSxDQUFDLFFBQVE7TUFDOUIsUUFBUSxNQUFNLEdBQUcsRUFBRSxDQUFDLE1BQU0sQ0FBQztNQUMzQixJQUFJLE9BQU8sSUFBSSxTQUFTLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRTtNQUN0QyxNQUFNLE9BQU8sRUFBRSxRQUFRLENBQUMsUUFBUSxDQUFDLEVBQUUsRUFBRSxPQUFPLENBQUMsRUFBRSxPQUFPLENBQUMsT0FBTyxDQUFDO01BQy9ELE1BQU0sVUFBVSxFQUFFLFFBQVEsQ0FBQyxRQUFRLENBQUMsRUFBRSxFQUFFLFVBQVUsQ0FBQyxFQUFFLE9BQU8sQ0FBQyxVQUFVLENBQUM7TUFDeEUsTUFBTSxNQUFNLEVBQUUsUUFBUSxDQUFDLFFBQVEsQ0FBQyxFQUFFLEVBQUUsTUFBTSxDQUFDLEVBQUUsT0FBTyxDQUFDLE1BQU0sQ0FBQztNQUM1RCxNQUFNLFFBQVEsRUFBRSxRQUFRLENBQUMsUUFBUSxDQUFDLEVBQUUsRUFBRSxRQUFRLENBQUMsRUFBRSxPQUFPLENBQUMsUUFBUSxDQUFDO01BQ2xFLE1BQU0sTUFBTSxFQUFFLFFBQVEsQ0FBQyxRQUFRLENBQUMsRUFBRSxFQUFFLE1BQU0sQ0FBQyxFQUFFLE9BQU8sQ0FBQyxNQUFNLENBQUM7TUFDNUQsS0FBSyxFQUFFLE9BQU8sQ0FBQyxDQUFDO01BQ2hCLEdBQUcsQ0FBQztNQUNKO01BQ0E7TUFDQTtNQUNBO01BQ0E7QUFDQTtBQUNBO01BQ0EsRUFBRSxTQUFTLENBQUMsU0FBUyxDQUFDLFdBQVcsR0FBRyxVQUFVLE9B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
