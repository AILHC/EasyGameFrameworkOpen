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
})(ActionTypes || (ActionTypes = {}));

var SpecialTargets;

(function (SpecialTargets) {
  SpecialTargets["Parent"] = "#_parent";
  SpecialTargets["Internal"] = "#_internal";
})(SpecialTargets || (SpecialTargets = {}));

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


var assign$1 = function (assignment) {
  return {
    type: assign,
    assignment: assignment
  };
};
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
/*#__PURE__*/

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
}();

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
/*#__PURE__*/

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
}();

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
})(InterpreterStatus || (InterpreterStatus = {}));

var Interpreter =
/*#__PURE__*/

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
}();

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

var actions = {
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
};

export { ActionTypes, Interpreter, InterpreterStatus, Machine, SpecialTargets, State, StateNode, actions, assign$1 as assign, createMachine, doneInvoke, forwardTo, interpret, mapState, matchState, matchesState, send$1 as send, sendParent, sendUpdate, spawn };
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXgubWpzIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9ub2RlX21vZHVsZXMveHN0YXRlL2VzL192aXJ0dWFsL190c2xpYi5qcyIsIi4uLy4uLy4uLy4uLy4uL25vZGVfbW9kdWxlcy94c3RhdGUvZXMvY29uc3RhbnRzLmpzIiwiLi4vLi4vLi4vLi4vLi4vbm9kZV9tb2R1bGVzL3hzdGF0ZS9lcy9lbnZpcm9ubWVudC5qcyIsIi4uLy4uLy4uLy4uLy4uL25vZGVfbW9kdWxlcy94c3RhdGUvZXMvdXRpbHMuanMiLCIuLi8uLi8uLi8uLi8uLi9ub2RlX21vZHVsZXMveHN0YXRlL2VzL21hcFN0YXRlLmpzIiwiLi4vLi4vLi4vLi4vLi4vbm9kZV9tb2R1bGVzL3hzdGF0ZS9lcy90eXBlcy5qcyIsIi4uLy4uLy4uLy4uLy4uL25vZGVfbW9kdWxlcy94c3RhdGUvZXMvYWN0aW9uVHlwZXMuanMiLCIuLi8uLi8uLi8uLi8uLi9ub2RlX21vZHVsZXMveHN0YXRlL2VzL2FjdGlvbnMuanMiLCIuLi8uLi8uLi8uLi8uLi9ub2RlX21vZHVsZXMveHN0YXRlL2VzL3N0YXRlVXRpbHMuanMiLCIuLi8uLi8uLi8uLi8uLi9ub2RlX21vZHVsZXMveHN0YXRlL2VzL1N0YXRlLmpzIiwiLi4vLi4vLi4vLi4vLi4vbm9kZV9tb2R1bGVzL3hzdGF0ZS9lcy9zZXJ2aWNlU2NvcGUuanMiLCIuLi8uLi8uLi8uLi8uLi9ub2RlX21vZHVsZXMveHN0YXRlL2VzL0FjdG9yLmpzIiwiLi4vLi4vLi4vLi4vLi4vbm9kZV9tb2R1bGVzL3hzdGF0ZS9lcy9pbnZva2VVdGlscy5qcyIsIi4uLy4uLy4uLy4uLy4uL25vZGVfbW9kdWxlcy94c3RhdGUvZXMvU3RhdGVOb2RlLmpzIiwiLi4vLi4vLi4vLi4vLi4vbm9kZV9tb2R1bGVzL3hzdGF0ZS9lcy9NYWNoaW5lLmpzIiwiLi4vLi4vLi4vLi4vLi4vbm9kZV9tb2R1bGVzL3hzdGF0ZS9lcy9zY2hlZHVsZXIuanMiLCIuLi8uLi8uLi8uLi8uLi9ub2RlX21vZHVsZXMveHN0YXRlL2VzL3JlZ2lzdHJ5LmpzIiwiLi4vLi4vLi4vLi4vLi4vbm9kZV9tb2R1bGVzL3hzdGF0ZS9lcy9kZXZUb29scy5qcyIsIi4uLy4uLy4uLy4uLy4uL25vZGVfbW9kdWxlcy94c3RhdGUvZXMvaW50ZXJwcmV0ZXIuanMiLCIuLi8uLi8uLi8uLi8uLi9ub2RlX21vZHVsZXMveHN0YXRlL2VzL21hdGNoLmpzIiwiLi4vLi4vLi4vLi4vLi4vbm9kZV9tb2R1bGVzL3hzdGF0ZS9lcy9pbmRleC5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvKiEgKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKipcclxuQ29weXJpZ2h0IChjKSBNaWNyb3NvZnQgQ29ycG9yYXRpb24uXHJcblxyXG5QZXJtaXNzaW9uIHRvIHVzZSwgY29weSwgbW9kaWZ5LCBhbmQvb3IgZGlzdHJpYnV0ZSB0aGlzIHNvZnR3YXJlIGZvciBhbnlcclxucHVycG9zZSB3aXRoIG9yIHdpdGhvdXQgZmVlIGlzIGhlcmVieSBncmFudGVkLlxyXG5cclxuVEhFIFNPRlRXQVJFIElTIFBST1ZJREVEIFwiQVMgSVNcIiBBTkQgVEhFIEFVVEhPUiBESVNDTEFJTVMgQUxMIFdBUlJBTlRJRVMgV0lUSFxyXG5SRUdBUkQgVE8gVEhJUyBTT0ZUV0FSRSBJTkNMVURJTkcgQUxMIElNUExJRUQgV0FSUkFOVElFUyBPRiBNRVJDSEFOVEFCSUxJVFlcclxuQU5EIEZJVE5FU1MuIElOIE5PIEVWRU5UIFNIQUxMIFRIRSBBVVRIT1IgQkUgTElBQkxFIEZPUiBBTlkgU1BFQ0lBTCwgRElSRUNULFxyXG5JTkRJUkVDVCwgT1IgQ09OU0VRVUVOVElBTCBEQU1BR0VTIE9SIEFOWSBEQU1BR0VTIFdIQVRTT0VWRVIgUkVTVUxUSU5HIEZST01cclxuTE9TUyBPRiBVU0UsIERBVEEgT1IgUFJPRklUUywgV0hFVEhFUiBJTiBBTiBBQ1RJT04gT0YgQ09OVFJBQ1QsIE5FR0xJR0VOQ0UgT1JcclxuT1RIRVIgVE9SVElPVVMgQUNUSU9OLCBBUklTSU5HIE9VVCBPRiBPUiBJTiBDT05ORUNUSU9OIFdJVEggVEhFIFVTRSBPUlxyXG5QRVJGT1JNQU5DRSBPRiBUSElTIFNPRlRXQVJFLlxyXG4qKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiAqL1xudmFyIF9fYXNzaWduID0gZnVuY3Rpb24gKCkge1xuICBfX2Fzc2lnbiA9IE9iamVjdC5hc3NpZ24gfHwgZnVuY3Rpb24gX19hc3NpZ24odCkge1xuICAgIGZvciAodmFyIHMsIGkgPSAxLCBuID0gYXJndW1lbnRzLmxlbmd0aDsgaSA8IG47IGkrKykge1xuICAgICAgcyA9IGFyZ3VtZW50c1tpXTtcblxuICAgICAgZm9yICh2YXIgcCBpbiBzKSBpZiAoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKHMsIHApKSB0W3BdID0gc1twXTtcbiAgICB9XG5cbiAgICByZXR1cm4gdDtcbiAgfTtcblxuICByZXR1cm4gX19hc3NpZ24uYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbn07XG5cbmZ1bmN0aW9uIF9fcmVzdChzLCBlKSB7XG4gIHZhciB0ID0ge307XG5cbiAgZm9yICh2YXIgcCBpbiBzKSBpZiAoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKHMsIHApICYmIGUuaW5kZXhPZihwKSA8IDApIHRbcF0gPSBzW3BdO1xuXG4gIGlmIChzICE9IG51bGwgJiYgdHlwZW9mIE9iamVjdC5nZXRPd25Qcm9wZXJ0eVN5bWJvbHMgPT09IFwiZnVuY3Rpb25cIikgZm9yICh2YXIgaSA9IDAsIHAgPSBPYmplY3QuZ2V0T3duUHJvcGVydHlTeW1ib2xzKHMpOyBpIDwgcC5sZW5ndGg7IGkrKykge1xuICAgIGlmIChlLmluZGV4T2YocFtpXSkgPCAwICYmIE9iamVjdC5wcm90b3R5cGUucHJvcGVydHlJc0VudW1lcmFibGUuY2FsbChzLCBwW2ldKSkgdFtwW2ldXSA9IHNbcFtpXV07XG4gIH1cbiAgcmV0dXJuIHQ7XG59XG5cbmZ1bmN0aW9uIF9fdmFsdWVzKG8pIHtcbiAgdmFyIHMgPSB0eXBlb2YgU3ltYm9sID09PSBcImZ1bmN0aW9uXCIgJiYgU3ltYm9sLml0ZXJhdG9yLFxuICAgICAgbSA9IHMgJiYgb1tzXSxcbiAgICAgIGkgPSAwO1xuICBpZiAobSkgcmV0dXJuIG0uY2FsbChvKTtcbiAgaWYgKG8gJiYgdHlwZW9mIG8ubGVuZ3RoID09PSBcIm51bWJlclwiKSByZXR1cm4ge1xuICAgIG5leHQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgIGlmIChvICYmIGkgPj0gby5sZW5ndGgpIG8gPSB2b2lkIDA7XG4gICAgICByZXR1cm4ge1xuICAgICAgICB2YWx1ZTogbyAmJiBvW2krK10sXG4gICAgICAgIGRvbmU6ICFvXG4gICAgICB9O1xuICAgIH1cbiAgfTtcbiAgdGhyb3cgbmV3IFR5cGVFcnJvcihzID8gXCJPYmplY3QgaXMgbm90IGl0ZXJhYmxlLlwiIDogXCJTeW1ib2wuaXRlcmF0b3IgaXMgbm90IGRlZmluZWQuXCIpO1xufVxuXG5mdW5jdGlvbiBfX3JlYWQobywgbikge1xuICB2YXIgbSA9IHR5cGVvZiBTeW1ib2wgPT09IFwiZnVuY3Rpb25cIiAmJiBvW1N5bWJvbC5pdGVyYXRvcl07XG4gIGlmICghbSkgcmV0dXJuIG87XG4gIHZhciBpID0gbS5jYWxsKG8pLFxuICAgICAgcixcbiAgICAgIGFyID0gW10sXG4gICAgICBlO1xuXG4gIHRyeSB7XG4gICAgd2hpbGUgKChuID09PSB2b2lkIDAgfHwgbi0tID4gMCkgJiYgIShyID0gaS5uZXh0KCkpLmRvbmUpIGFyLnB1c2goci52YWx1ZSk7XG4gIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgZSA9IHtcbiAgICAgIGVycm9yOiBlcnJvclxuICAgIH07XG4gIH0gZmluYWxseSB7XG4gICAgdHJ5IHtcbiAgICAgIGlmIChyICYmICFyLmRvbmUgJiYgKG0gPSBpW1wicmV0dXJuXCJdKSkgbS5jYWxsKGkpO1xuICAgIH0gZmluYWxseSB7XG4gICAgICBpZiAoZSkgdGhyb3cgZS5lcnJvcjtcbiAgICB9XG4gIH1cblxuICByZXR1cm4gYXI7XG59XG5cbmZ1bmN0aW9uIF9fc3ByZWFkKCkge1xuICBmb3IgKHZhciBhciA9IFtdLCBpID0gMDsgaSA8IGFyZ3VtZW50cy5sZW5ndGg7IGkrKykgYXIgPSBhci5jb25jYXQoX19yZWFkKGFyZ3VtZW50c1tpXSkpO1xuXG4gIHJldHVybiBhcjtcbn1cblxuZXhwb3J0IHsgX19hc3NpZ24sIF9fcmVhZCwgX19yZXN0LCBfX3NwcmVhZCwgX192YWx1ZXMgfTsiLCJ2YXIgU1RBVEVfREVMSU1JVEVSID0gJy4nO1xudmFyIEVNUFRZX0FDVElWSVRZX01BUCA9IHt9O1xudmFyIERFRkFVTFRfR1VBUkRfVFlQRSA9ICd4c3RhdGUuZ3VhcmQnO1xudmFyIFRBUkdFVExFU1NfS0VZID0gJyc7XG5leHBvcnQgeyBERUZBVUxUX0dVQVJEX1RZUEUsIEVNUFRZX0FDVElWSVRZX01BUCwgU1RBVEVfREVMSU1JVEVSLCBUQVJHRVRMRVNTX0tFWSB9OyIsInZhciBJU19QUk9EVUNUSU9OID0gcHJvY2Vzcy5lbnYuTk9ERV9FTlYgPT09ICdwcm9kdWN0aW9uJztcbmV4cG9ydCB7IElTX1BST0RVQ1RJT04gfTsiLCJpbXBvcnQgeyBfX3NwcmVhZCwgX192YWx1ZXMsIF9fcmVhZCwgX19hc3NpZ24gfSBmcm9tICcuL192aXJ0dWFsL190c2xpYi5qcyc7XG5pbXBvcnQgeyBERUZBVUxUX0dVQVJEX1RZUEUsIFRBUkdFVExFU1NfS0VZLCBTVEFURV9ERUxJTUlURVIgfSBmcm9tICcuL2NvbnN0YW50cy5qcyc7XG5pbXBvcnQgeyBJU19QUk9EVUNUSU9OIH0gZnJvbSAnLi9lbnZpcm9ubWVudC5qcyc7XG5cbmZ1bmN0aW9uIGtleXModmFsdWUpIHtcbiAgcmV0dXJuIE9iamVjdC5rZXlzKHZhbHVlKTtcbn1cblxuZnVuY3Rpb24gbWF0Y2hlc1N0YXRlKHBhcmVudFN0YXRlSWQsIGNoaWxkU3RhdGVJZCwgZGVsaW1pdGVyKSB7XG4gIGlmIChkZWxpbWl0ZXIgPT09IHZvaWQgMCkge1xuICAgIGRlbGltaXRlciA9IFNUQVRFX0RFTElNSVRFUjtcbiAgfVxuXG4gIHZhciBwYXJlbnRTdGF0ZVZhbHVlID0gdG9TdGF0ZVZhbHVlKHBhcmVudFN0YXRlSWQsIGRlbGltaXRlcik7XG4gIHZhciBjaGlsZFN0YXRlVmFsdWUgPSB0b1N0YXRlVmFsdWUoY2hpbGRTdGF0ZUlkLCBkZWxpbWl0ZXIpO1xuXG4gIGlmIChpc1N0cmluZyhjaGlsZFN0YXRlVmFsdWUpKSB7XG4gICAgaWYgKGlzU3RyaW5nKHBhcmVudFN0YXRlVmFsdWUpKSB7XG4gICAgICByZXR1cm4gY2hpbGRTdGF0ZVZhbHVlID09PSBwYXJlbnRTdGF0ZVZhbHVlO1xuICAgIH0gLy8gUGFyZW50IG1vcmUgc3BlY2lmaWMgdGhhbiBjaGlsZFxuXG5cbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICBpZiAoaXNTdHJpbmcocGFyZW50U3RhdGVWYWx1ZSkpIHtcbiAgICByZXR1cm4gcGFyZW50U3RhdGVWYWx1ZSBpbiBjaGlsZFN0YXRlVmFsdWU7XG4gIH1cblxuICByZXR1cm4ga2V5cyhwYXJlbnRTdGF0ZVZhbHVlKS5ldmVyeShmdW5jdGlvbiAoa2V5KSB7XG4gICAgaWYgKCEoa2V5IGluIGNoaWxkU3RhdGVWYWx1ZSkpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICByZXR1cm4gbWF0Y2hlc1N0YXRlKHBhcmVudFN0YXRlVmFsdWVba2V5XSwgY2hpbGRTdGF0ZVZhbHVlW2tleV0pO1xuICB9KTtcbn1cblxuZnVuY3Rpb24gZ2V0RXZlbnRUeXBlKGV2ZW50KSB7XG4gIHRyeSB7XG4gICAgcmV0dXJuIGlzU3RyaW5nKGV2ZW50KSB8fCB0eXBlb2YgZXZlbnQgPT09ICdudW1iZXInID8gXCJcIiArIGV2ZW50IDogZXZlbnQudHlwZTtcbiAgfSBjYXRjaCAoZSkge1xuICAgIHRocm93IG5ldyBFcnJvcignRXZlbnRzIG11c3QgYmUgc3RyaW5ncyBvciBvYmplY3RzIHdpdGggYSBzdHJpbmcgZXZlbnQudHlwZSBwcm9wZXJ0eS4nKTtcbiAgfVxufVxuXG5mdW5jdGlvbiB0b1N0YXRlUGF0aChzdGF0ZUlkLCBkZWxpbWl0ZXIpIHtcbiAgdHJ5IHtcbiAgICBpZiAoaXNBcnJheShzdGF0ZUlkKSkge1xuICAgICAgcmV0dXJuIHN0YXRlSWQ7XG4gICAgfVxuXG4gICAgcmV0dXJuIHN0YXRlSWQudG9TdHJpbmcoKS5zcGxpdChkZWxpbWl0ZXIpO1xuICB9IGNhdGNoIChlKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKFwiJ1wiICsgc3RhdGVJZCArIFwiJyBpcyBub3QgYSB2YWxpZCBzdGF0ZSBwYXRoLlwiKTtcbiAgfVxufVxuXG5mdW5jdGlvbiBpc1N0YXRlTGlrZShzdGF0ZSkge1xuICByZXR1cm4gdHlwZW9mIHN0YXRlID09PSAnb2JqZWN0JyAmJiAndmFsdWUnIGluIHN0YXRlICYmICdjb250ZXh0JyBpbiBzdGF0ZSAmJiAnZXZlbnQnIGluIHN0YXRlICYmICdfZXZlbnQnIGluIHN0YXRlO1xufVxuXG5mdW5jdGlvbiB0b1N0YXRlVmFsdWUoc3RhdGVWYWx1ZSwgZGVsaW1pdGVyKSB7XG4gIGlmIChpc1N0YXRlTGlrZShzdGF0ZVZhbHVlKSkge1xuICAgIHJldHVybiBzdGF0ZVZhbHVlLnZhbHVlO1xuICB9XG5cbiAgaWYgKGlzQXJyYXkoc3RhdGVWYWx1ZSkpIHtcbiAgICByZXR1cm4gcGF0aFRvU3RhdGVWYWx1ZShzdGF0ZVZhbHVlKTtcbiAgfVxuXG4gIGlmICh0eXBlb2Ygc3RhdGVWYWx1ZSAhPT0gJ3N0cmluZycpIHtcbiAgICByZXR1cm4gc3RhdGVWYWx1ZTtcbiAgfVxuXG4gIHZhciBzdGF0ZVBhdGggPSB0b1N0YXRlUGF0aChzdGF0ZVZhbHVlLCBkZWxpbWl0ZXIpO1xuICByZXR1cm4gcGF0aFRvU3RhdGVWYWx1ZShzdGF0ZVBhdGgpO1xufVxuXG5mdW5jdGlvbiBwYXRoVG9TdGF0ZVZhbHVlKHN0YXRlUGF0aCkge1xuICBpZiAoc3RhdGVQYXRoLmxlbmd0aCA9PT0gMSkge1xuICAgIHJldHVybiBzdGF0ZVBhdGhbMF07XG4gIH1cblxuICB2YXIgdmFsdWUgPSB7fTtcbiAgdmFyIG1hcmtlciA9IHZhbHVlO1xuXG4gIGZvciAodmFyIGkgPSAwOyBpIDwgc3RhdGVQYXRoLmxlbmd0aCAtIDE7IGkrKykge1xuICAgIGlmIChpID09PSBzdGF0ZVBhdGgubGVuZ3RoIC0gMikge1xuICAgICAgbWFya2VyW3N0YXRlUGF0aFtpXV0gPSBzdGF0ZVBhdGhbaSArIDFdO1xuICAgIH0gZWxzZSB7XG4gICAgICBtYXJrZXJbc3RhdGVQYXRoW2ldXSA9IHt9O1xuICAgICAgbWFya2VyID0gbWFya2VyW3N0YXRlUGF0aFtpXV07XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIHZhbHVlO1xufVxuXG5mdW5jdGlvbiBtYXBWYWx1ZXMoY29sbGVjdGlvbiwgaXRlcmF0ZWUpIHtcbiAgdmFyIHJlc3VsdCA9IHt9O1xuICB2YXIgY29sbGVjdGlvbktleXMgPSBrZXlzKGNvbGxlY3Rpb24pO1xuXG4gIGZvciAodmFyIGkgPSAwOyBpIDwgY29sbGVjdGlvbktleXMubGVuZ3RoOyBpKyspIHtcbiAgICB2YXIga2V5ID0gY29sbGVjdGlvbktleXNbaV07XG4gICAgcmVzdWx0W2tleV0gPSBpdGVyYXRlZShjb2xsZWN0aW9uW2tleV0sIGtleSwgY29sbGVjdGlvbiwgaSk7XG4gIH1cblxuICByZXR1cm4gcmVzdWx0O1xufVxuXG5mdW5jdGlvbiBtYXBGaWx0ZXJWYWx1ZXMoY29sbGVjdGlvbiwgaXRlcmF0ZWUsIHByZWRpY2F0ZSkge1xuICB2YXIgZV8xLCBfYTtcblxuICB2YXIgcmVzdWx0ID0ge307XG5cbiAgdHJ5IHtcbiAgICBmb3IgKHZhciBfYiA9IF9fdmFsdWVzKGtleXMoY29sbGVjdGlvbikpLCBfYyA9IF9iLm5leHQoKTsgIV9jLmRvbmU7IF9jID0gX2IubmV4dCgpKSB7XG4gICAgICB2YXIga2V5ID0gX2MudmFsdWU7XG4gICAgICB2YXIgaXRlbSA9IGNvbGxlY3Rpb25ba2V5XTtcblxuICAgICAgaWYgKCFwcmVkaWNhdGUoaXRlbSkpIHtcbiAgICAgICAgY29udGludWU7XG4gICAgICB9XG5cbiAgICAgIHJlc3VsdFtrZXldID0gaXRlcmF0ZWUoaXRlbSwga2V5LCBjb2xsZWN0aW9uKTtcbiAgICB9XG4gIH0gY2F0Y2ggKGVfMV8xKSB7XG4gICAgZV8xID0ge1xuICAgICAgZXJyb3I6IGVfMV8xXG4gICAgfTtcbiAgfSBmaW5hbGx5IHtcbiAgICB0cnkge1xuICAgICAgaWYgKF9jICYmICFfYy5kb25lICYmIChfYSA9IF9iLnJldHVybikpIF9hLmNhbGwoX2IpO1xuICAgIH0gZmluYWxseSB7XG4gICAgICBpZiAoZV8xKSB0aHJvdyBlXzEuZXJyb3I7XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIHJlc3VsdDtcbn1cbi8qKlxyXG4gKiBSZXRyaWV2ZXMgYSB2YWx1ZSBhdCB0aGUgZ2l2ZW4gcGF0aC5cclxuICogQHBhcmFtIHByb3BzIFRoZSBkZWVwIHBhdGggdG8gdGhlIHByb3Agb2YgdGhlIGRlc2lyZWQgdmFsdWVcclxuICovXG5cblxudmFyIHBhdGggPSBmdW5jdGlvbiAocHJvcHMpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uIChvYmplY3QpIHtcbiAgICB2YXIgZV8yLCBfYTtcblxuICAgIHZhciByZXN1bHQgPSBvYmplY3Q7XG5cbiAgICB0cnkge1xuICAgICAgZm9yICh2YXIgcHJvcHNfMSA9IF9fdmFsdWVzKHByb3BzKSwgcHJvcHNfMV8xID0gcHJvcHNfMS5uZXh0KCk7ICFwcm9wc18xXzEuZG9uZTsgcHJvcHNfMV8xID0gcHJvcHNfMS5uZXh0KCkpIHtcbiAgICAgICAgdmFyIHByb3AgPSBwcm9wc18xXzEudmFsdWU7XG4gICAgICAgIHJlc3VsdCA9IHJlc3VsdFtwcm9wXTtcbiAgICAgIH1cbiAgICB9IGNhdGNoIChlXzJfMSkge1xuICAgICAgZV8yID0ge1xuICAgICAgICBlcnJvcjogZV8yXzFcbiAgICAgIH07XG4gICAgfSBmaW5hbGx5IHtcbiAgICAgIHRyeSB7XG4gICAgICAgIGlmIChwcm9wc18xXzEgJiYgIXByb3BzXzFfMS5kb25lICYmIChfYSA9IHByb3BzXzEucmV0dXJuKSkgX2EuY2FsbChwcm9wc18xKTtcbiAgICAgIH0gZmluYWxseSB7XG4gICAgICAgIGlmIChlXzIpIHRocm93IGVfMi5lcnJvcjtcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gcmVzdWx0O1xuICB9O1xufTtcbi8qKlxyXG4gKiBSZXRyaWV2ZXMgYSB2YWx1ZSBhdCB0aGUgZ2l2ZW4gcGF0aCB2aWEgdGhlIG5lc3RlZCBhY2Nlc3NvciBwcm9wLlxyXG4gKiBAcGFyYW0gcHJvcHMgVGhlIGRlZXAgcGF0aCB0byB0aGUgcHJvcCBvZiB0aGUgZGVzaXJlZCB2YWx1ZVxyXG4gKi9cblxuXG5mdW5jdGlvbiBuZXN0ZWRQYXRoKHByb3BzLCBhY2Nlc3NvclByb3ApIHtcbiAgcmV0dXJuIGZ1bmN0aW9uIChvYmplY3QpIHtcbiAgICB2YXIgZV8zLCBfYTtcblxuICAgIHZhciByZXN1bHQgPSBvYmplY3Q7XG5cbiAgICB0cnkge1xuICAgICAgZm9yICh2YXIgcHJvcHNfMiA9IF9fdmFsdWVzKHByb3BzKSwgcHJvcHNfMl8xID0gcHJvcHNfMi5uZXh0KCk7ICFwcm9wc18yXzEuZG9uZTsgcHJvcHNfMl8xID0gcHJvcHNfMi5uZXh0KCkpIHtcbiAgICAgICAgdmFyIHByb3AgPSBwcm9wc18yXzEudmFsdWU7XG4gICAgICAgIHJlc3VsdCA9IHJlc3VsdFthY2Nlc3NvclByb3BdW3Byb3BdO1xuICAgICAgfVxuICAgIH0gY2F0Y2ggKGVfM18xKSB7XG4gICAgICBlXzMgPSB7XG4gICAgICAgIGVycm9yOiBlXzNfMVxuICAgICAgfTtcbiAgICB9IGZpbmFsbHkge1xuICAgICAgdHJ5IHtcbiAgICAgICAgaWYgKHByb3BzXzJfMSAmJiAhcHJvcHNfMl8xLmRvbmUgJiYgKF9hID0gcHJvcHNfMi5yZXR1cm4pKSBfYS5jYWxsKHByb3BzXzIpO1xuICAgICAgfSBmaW5hbGx5IHtcbiAgICAgICAgaWYgKGVfMykgdGhyb3cgZV8zLmVycm9yO1xuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiByZXN1bHQ7XG4gIH07XG59XG5cbmZ1bmN0aW9uIHRvU3RhdGVQYXRocyhzdGF0ZVZhbHVlKSB7XG4gIGlmICghc3RhdGVWYWx1ZSkge1xuICAgIHJldHVybiBbW11dO1xuICB9XG5cbiAgaWYgKGlzU3RyaW5nKHN0YXRlVmFsdWUpKSB7XG4gICAgcmV0dXJuIFtbc3RhdGVWYWx1ZV1dO1xuICB9XG5cbiAgdmFyIHJlc3VsdCA9IGZsYXR0ZW4oa2V5cyhzdGF0ZVZhbHVlKS5tYXAoZnVuY3Rpb24gKGtleSkge1xuICAgIHZhciBzdWJTdGF0ZVZhbHVlID0gc3RhdGVWYWx1ZVtrZXldO1xuXG4gICAgaWYgKHR5cGVvZiBzdWJTdGF0ZVZhbHVlICE9PSAnc3RyaW5nJyAmJiAoIXN1YlN0YXRlVmFsdWUgfHwgIU9iamVjdC5rZXlzKHN1YlN0YXRlVmFsdWUpLmxlbmd0aCkpIHtcbiAgICAgIHJldHVybiBbW2tleV1dO1xuICAgIH1cblxuICAgIHJldHVybiB0b1N0YXRlUGF0aHMoc3RhdGVWYWx1ZVtrZXldKS5tYXAoZnVuY3Rpb24gKHN1YlBhdGgpIHtcbiAgICAgIHJldHVybiBba2V5XS5jb25jYXQoc3ViUGF0aCk7XG4gICAgfSk7XG4gIH0pKTtcbiAgcmV0dXJuIHJlc3VsdDtcbn1cblxuZnVuY3Rpb24gZmxhdHRlbihhcnJheSkge1xuICB2YXIgX2E7XG5cbiAgcmV0dXJuIChfYSA9IFtdKS5jb25jYXQuYXBwbHkoX2EsIF9fc3ByZWFkKGFycmF5KSk7XG59XG5cbmZ1bmN0aW9uIHRvQXJyYXlTdHJpY3QodmFsdWUpIHtcbiAgaWYgKGlzQXJyYXkodmFsdWUpKSB7XG4gICAgcmV0dXJuIHZhbHVlO1xuICB9XG5cbiAgcmV0dXJuIFt2YWx1ZV07XG59XG5cbmZ1bmN0aW9uIHRvQXJyYXkodmFsdWUpIHtcbiAgaWYgKHZhbHVlID09PSB1bmRlZmluZWQpIHtcbiAgICByZXR1cm4gW107XG4gIH1cblxuICByZXR1cm4gdG9BcnJheVN0cmljdCh2YWx1ZSk7XG59XG5cbmZ1bmN0aW9uIG1hcENvbnRleHQobWFwcGVyLCBjb250ZXh0LCBfZXZlbnQpIHtcbiAgdmFyIGVfNSwgX2E7XG5cbiAgaWYgKGlzRnVuY3Rpb24obWFwcGVyKSkge1xuICAgIHJldHVybiBtYXBwZXIoY29udGV4dCwgX2V2ZW50LmRhdGEpO1xuICB9XG5cbiAgdmFyIHJlc3VsdCA9IHt9O1xuXG4gIHRyeSB7XG4gICAgZm9yICh2YXIgX2IgPSBfX3ZhbHVlcyhPYmplY3Qua2V5cyhtYXBwZXIpKSwgX2MgPSBfYi5uZXh0KCk7ICFfYy5kb25lOyBfYyA9IF9iLm5leHQoKSkge1xuICAgICAgdmFyIGtleSA9IF9jLnZhbHVlO1xuICAgICAgdmFyIHN1Yk1hcHBlciA9IG1hcHBlcltrZXldO1xuXG4gICAgICBpZiAoaXNGdW5jdGlvbihzdWJNYXBwZXIpKSB7XG4gICAgICAgIHJlc3VsdFtrZXldID0gc3ViTWFwcGVyKGNvbnRleHQsIF9ldmVudC5kYXRhKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJlc3VsdFtrZXldID0gc3ViTWFwcGVyO1xuICAgICAgfVxuICAgIH1cbiAgfSBjYXRjaCAoZV81XzEpIHtcbiAgICBlXzUgPSB7XG4gICAgICBlcnJvcjogZV81XzFcbiAgICB9O1xuICB9IGZpbmFsbHkge1xuICAgIHRyeSB7XG4gICAgICBpZiAoX2MgJiYgIV9jLmRvbmUgJiYgKF9hID0gX2IucmV0dXJuKSkgX2EuY2FsbChfYik7XG4gICAgfSBmaW5hbGx5IHtcbiAgICAgIGlmIChlXzUpIHRocm93IGVfNS5lcnJvcjtcbiAgICB9XG4gIH1cblxuICByZXR1cm4gcmVzdWx0O1xufVxuXG5mdW5jdGlvbiBpc0J1aWx0SW5FdmVudChldmVudFR5cGUpIHtcbiAgcmV0dXJuIC9eKGRvbmV8ZXJyb3IpXFwuLy50ZXN0KGV2ZW50VHlwZSk7XG59XG5cbmZ1bmN0aW9uIGlzUHJvbWlzZUxpa2UodmFsdWUpIHtcbiAgaWYgKHZhbHVlIGluc3RhbmNlb2YgUHJvbWlzZSkge1xuICAgIHJldHVybiB0cnVlO1xuICB9IC8vIENoZWNrIGlmIHNoYXBlIG1hdGNoZXMgdGhlIFByb21pc2UvQSsgc3BlY2lmaWNhdGlvbiBmb3IgYSBcInRoZW5hYmxlXCIuXG5cblxuICBpZiAodmFsdWUgIT09IG51bGwgJiYgKGlzRnVuY3Rpb24odmFsdWUpIHx8IHR5cGVvZiB2YWx1ZSA9PT0gJ29iamVjdCcpICYmIGlzRnVuY3Rpb24odmFsdWUudGhlbikpIHtcbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxuXG4gIHJldHVybiBmYWxzZTtcbn1cblxuZnVuY3Rpb24gcGFydGl0aW9uKGl0ZW1zLCBwcmVkaWNhdGUpIHtcbiAgdmFyIGVfNiwgX2E7XG5cbiAgdmFyIF9iID0gX19yZWFkKFtbXSwgW11dLCAyKSxcbiAgICAgIHRydXRoeSA9IF9iWzBdLFxuICAgICAgZmFsc3kgPSBfYlsxXTtcblxuICB0cnkge1xuICAgIGZvciAodmFyIGl0ZW1zXzEgPSBfX3ZhbHVlcyhpdGVtcyksIGl0ZW1zXzFfMSA9IGl0ZW1zXzEubmV4dCgpOyAhaXRlbXNfMV8xLmRvbmU7IGl0ZW1zXzFfMSA9IGl0ZW1zXzEubmV4dCgpKSB7XG4gICAgICB2YXIgaXRlbSA9IGl0ZW1zXzFfMS52YWx1ZTtcblxuICAgICAgaWYgKHByZWRpY2F0ZShpdGVtKSkge1xuICAgICAgICB0cnV0aHkucHVzaChpdGVtKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGZhbHN5LnB1c2goaXRlbSk7XG4gICAgICB9XG4gICAgfVxuICB9IGNhdGNoIChlXzZfMSkge1xuICAgIGVfNiA9IHtcbiAgICAgIGVycm9yOiBlXzZfMVxuICAgIH07XG4gIH0gZmluYWxseSB7XG4gICAgdHJ5IHtcbiAgICAgIGlmIChpdGVtc18xXzEgJiYgIWl0ZW1zXzFfMS5kb25lICYmIChfYSA9IGl0ZW1zXzEucmV0dXJuKSkgX2EuY2FsbChpdGVtc18xKTtcbiAgICB9IGZpbmFsbHkge1xuICAgICAgaWYgKGVfNikgdGhyb3cgZV82LmVycm9yO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiBbdHJ1dGh5LCBmYWxzeV07XG59XG5cbmZ1bmN0aW9uIHVwZGF0ZUhpc3RvcnlTdGF0ZXMoaGlzdCwgc3RhdGVWYWx1ZSkge1xuICByZXR1cm4gbWFwVmFsdWVzKGhpc3Quc3RhdGVzLCBmdW5jdGlvbiAoc3ViSGlzdCwga2V5KSB7XG4gICAgaWYgKCFzdWJIaXN0KSB7XG4gICAgICByZXR1cm4gdW5kZWZpbmVkO1xuICAgIH1cblxuICAgIHZhciBzdWJTdGF0ZVZhbHVlID0gKGlzU3RyaW5nKHN0YXRlVmFsdWUpID8gdW5kZWZpbmVkIDogc3RhdGVWYWx1ZVtrZXldKSB8fCAoc3ViSGlzdCA/IHN1Ykhpc3QuY3VycmVudCA6IHVuZGVmaW5lZCk7XG5cbiAgICBpZiAoIXN1YlN0YXRlVmFsdWUpIHtcbiAgICAgIHJldHVybiB1bmRlZmluZWQ7XG4gICAgfVxuXG4gICAgcmV0dXJuIHtcbiAgICAgIGN1cnJlbnQ6IHN1YlN0YXRlVmFsdWUsXG4gICAgICBzdGF0ZXM6IHVwZGF0ZUhpc3RvcnlTdGF0ZXMoc3ViSGlzdCwgc3ViU3RhdGVWYWx1ZSlcbiAgICB9O1xuICB9KTtcbn1cblxuZnVuY3Rpb24gdXBkYXRlSGlzdG9yeVZhbHVlKGhpc3QsIHN0YXRlVmFsdWUpIHtcbiAgcmV0dXJuIHtcbiAgICBjdXJyZW50OiBzdGF0ZVZhbHVlLFxuICAgIHN0YXRlczogdXBkYXRlSGlzdG9yeVN0YXRlcyhoaXN0LCBzdGF0ZVZhbHVlKVxuICB9O1xufVxuXG5mdW5jdGlvbiB1cGRhdGVDb250ZXh0KGNvbnRleHQsIF9ldmVudCwgYXNzaWduQWN0aW9ucywgc3RhdGUpIHtcbiAgaWYgKCFJU19QUk9EVUNUSU9OKSB7XG4gICAgd2FybighIWNvbnRleHQsICdBdHRlbXB0aW5nIHRvIHVwZGF0ZSB1bmRlZmluZWQgY29udGV4dCcpO1xuICB9XG5cbiAgdmFyIHVwZGF0ZWRDb250ZXh0ID0gY29udGV4dCA/IGFzc2lnbkFjdGlvbnMucmVkdWNlKGZ1bmN0aW9uIChhY2MsIGFzc2lnbkFjdGlvbikge1xuICAgIHZhciBlXzcsIF9hO1xuXG4gICAgdmFyIGFzc2lnbm1lbnQgPSBhc3NpZ25BY3Rpb24uYXNzaWdubWVudDtcbiAgICB2YXIgbWV0YSA9IHtcbiAgICAgIHN0YXRlOiBzdGF0ZSxcbiAgICAgIGFjdGlvbjogYXNzaWduQWN0aW9uLFxuICAgICAgX2V2ZW50OiBfZXZlbnRcbiAgICB9O1xuICAgIHZhciBwYXJ0aWFsVXBkYXRlID0ge307XG5cbiAgICBpZiAoaXNGdW5jdGlvbihhc3NpZ25tZW50KSkge1xuICAgICAgcGFydGlhbFVwZGF0ZSA9IGFzc2lnbm1lbnQoYWNjLCBfZXZlbnQuZGF0YSwgbWV0YSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRyeSB7XG4gICAgICAgIGZvciAodmFyIF9iID0gX192YWx1ZXMoa2V5cyhhc3NpZ25tZW50KSksIF9jID0gX2IubmV4dCgpOyAhX2MuZG9uZTsgX2MgPSBfYi5uZXh0KCkpIHtcbiAgICAgICAgICB2YXIga2V5ID0gX2MudmFsdWU7XG4gICAgICAgICAgdmFyIHByb3BBc3NpZ25tZW50ID0gYXNzaWdubWVudFtrZXldO1xuICAgICAgICAgIHBhcnRpYWxVcGRhdGVba2V5XSA9IGlzRnVuY3Rpb24ocHJvcEFzc2lnbm1lbnQpID8gcHJvcEFzc2lnbm1lbnQoYWNjLCBfZXZlbnQuZGF0YSwgbWV0YSkgOiBwcm9wQXNzaWdubWVudDtcbiAgICAgICAgfVxuICAgICAgfSBjYXRjaCAoZV83XzEpIHtcbiAgICAgICAgZV83ID0ge1xuICAgICAgICAgIGVycm9yOiBlXzdfMVxuICAgICAgICB9O1xuICAgICAgfSBmaW5hbGx5IHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICBpZiAoX2MgJiYgIV9jLmRvbmUgJiYgKF9hID0gX2IucmV0dXJuKSkgX2EuY2FsbChfYik7XG4gICAgICAgIH0gZmluYWxseSB7XG4gICAgICAgICAgaWYgKGVfNykgdGhyb3cgZV83LmVycm9yO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIE9iamVjdC5hc3NpZ24oe30sIGFjYywgcGFydGlhbFVwZGF0ZSk7XG4gIH0sIGNvbnRleHQpIDogY29udGV4dDtcbiAgcmV0dXJuIHVwZGF0ZWRDb250ZXh0O1xufSAvLyB0c2xpbnQ6ZGlzYWJsZS1uZXh0LWxpbmU6bm8tZW1wdHlcblxuXG52YXIgd2FybiA9IGZ1bmN0aW9uICgpIHt9O1xuXG5pZiAoIUlTX1BST0RVQ1RJT04pIHtcbiAgd2FybiA9IGZ1bmN0aW9uIChjb25kaXRpb24sIG1lc3NhZ2UpIHtcbiAgICB2YXIgZXJyb3IgPSBjb25kaXRpb24gaW5zdGFuY2VvZiBFcnJvciA/IGNvbmRpdGlvbiA6IHVuZGVmaW5lZDtcblxuICAgIGlmICghZXJyb3IgJiYgY29uZGl0aW9uKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgaWYgKGNvbnNvbGUgIT09IHVuZGVmaW5lZCkge1xuICAgICAgdmFyIGFyZ3MgPSBbXCJXYXJuaW5nOiBcIiArIG1lc3NhZ2VdO1xuXG4gICAgICBpZiAoZXJyb3IpIHtcbiAgICAgICAgYXJncy5wdXNoKGVycm9yKTtcbiAgICAgIH0gLy8gdHNsaW50OmRpc2FibGUtbmV4dC1saW5lOm5vLWNvbnNvbGVcblxuXG4gICAgICBjb25zb2xlLndhcm4uYXBwbHkoY29uc29sZSwgYXJncyk7XG4gICAgfVxuICB9O1xufVxuXG5mdW5jdGlvbiBpc0FycmF5KHZhbHVlKSB7XG4gIHJldHVybiBBcnJheS5pc0FycmF5KHZhbHVlKTtcbn0gLy8gdHNsaW50OmRpc2FibGUtbmV4dC1saW5lOmJhbi10eXBlc1xuXG5cbmZ1bmN0aW9uIGlzRnVuY3Rpb24odmFsdWUpIHtcbiAgcmV0dXJuIHR5cGVvZiB2YWx1ZSA9PT0gJ2Z1bmN0aW9uJztcbn1cblxuZnVuY3Rpb24gaXNTdHJpbmcodmFsdWUpIHtcbiAgcmV0dXJuIHR5cGVvZiB2YWx1ZSA9PT0gJ3N0cmluZyc7XG59IC8vIGV4cG9ydCBmdW5jdGlvbiBtZW1vaXplZEdldHRlcjxULCBUUCBleHRlbmRzIHsgcHJvdG90eXBlOiBvYmplY3QgfT4oXG4vLyAgIG86IFRQLFxuLy8gICBwcm9wZXJ0eTogc3RyaW5nLFxuLy8gICBnZXR0ZXI6ICgpID0+IFRcbi8vICk6IHZvaWQge1xuLy8gICBPYmplY3QuZGVmaW5lUHJvcGVydHkoby5wcm90b3R5cGUsIHByb3BlcnR5LCB7XG4vLyAgICAgZ2V0OiBnZXR0ZXIsXG4vLyAgICAgZW51bWVyYWJsZTogZmFsc2UsXG4vLyAgICAgY29uZmlndXJhYmxlOiBmYWxzZVxuLy8gICB9KTtcbi8vIH1cblxuXG5mdW5jdGlvbiB0b0d1YXJkKGNvbmRpdGlvbiwgZ3VhcmRNYXApIHtcbiAgaWYgKCFjb25kaXRpb24pIHtcbiAgICByZXR1cm4gdW5kZWZpbmVkO1xuICB9XG5cbiAgaWYgKGlzU3RyaW5nKGNvbmRpdGlvbikpIHtcbiAgICByZXR1cm4ge1xuICAgICAgdHlwZTogREVGQVVMVF9HVUFSRF9UWVBFLFxuICAgICAgbmFtZTogY29uZGl0aW9uLFxuICAgICAgcHJlZGljYXRlOiBndWFyZE1hcCA/IGd1YXJkTWFwW2NvbmRpdGlvbl0gOiB1bmRlZmluZWRcbiAgICB9O1xuICB9XG5cbiAgaWYgKGlzRnVuY3Rpb24oY29uZGl0aW9uKSkge1xuICAgIHJldHVybiB7XG4gICAgICB0eXBlOiBERUZBVUxUX0dVQVJEX1RZUEUsXG4gICAgICBuYW1lOiBjb25kaXRpb24ubmFtZSxcbiAgICAgIHByZWRpY2F0ZTogY29uZGl0aW9uXG4gICAgfTtcbiAgfVxuXG4gIHJldHVybiBjb25kaXRpb247XG59XG5cbmZ1bmN0aW9uIGlzT2JzZXJ2YWJsZSh2YWx1ZSkge1xuICB0cnkge1xuICAgIHJldHVybiAnc3Vic2NyaWJlJyBpbiB2YWx1ZSAmJiBpc0Z1bmN0aW9uKHZhbHVlLnN1YnNjcmliZSk7XG4gIH0gY2F0Y2ggKGUpIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cbn1cblxudmFyIHN5bWJvbE9ic2VydmFibGUgPSAvKiNfX1BVUkVfXyovZnVuY3Rpb24gKCkge1xuICByZXR1cm4gdHlwZW9mIFN5bWJvbCA9PT0gJ2Z1bmN0aW9uJyAmJiBTeW1ib2wub2JzZXJ2YWJsZSB8fCAnQEBvYnNlcnZhYmxlJztcbn0oKTtcblxuZnVuY3Rpb24gaXNNYWNoaW5lKHZhbHVlKSB7XG4gIHRyeSB7XG4gICAgcmV0dXJuICdfX3hzdGF0ZW5vZGUnIGluIHZhbHVlO1xuICB9IGNhdGNoIChlKSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG59XG5cbmZ1bmN0aW9uIGlzQWN0b3IodmFsdWUpIHtcbiAgcmV0dXJuICEhdmFsdWUgJiYgdHlwZW9mIHZhbHVlLnNlbmQgPT09ICdmdW5jdGlvbic7XG59XG5cbnZhciB1bmlxdWVJZCA9IC8qI19fUFVSRV9fKi9mdW5jdGlvbiAoKSB7XG4gIHZhciBjdXJyZW50SWQgPSAwO1xuICByZXR1cm4gZnVuY3Rpb24gKCkge1xuICAgIGN1cnJlbnRJZCsrO1xuICAgIHJldHVybiBjdXJyZW50SWQudG9TdHJpbmcoMTYpO1xuICB9O1xufSgpO1xuXG5mdW5jdGlvbiB0b0V2ZW50T2JqZWN0KGV2ZW50LCBwYXlsb2FkIC8vIGlkPzogVEV2ZW50Wyd0eXBlJ11cbikge1xuICBpZiAoaXNTdHJpbmcoZXZlbnQpIHx8IHR5cGVvZiBldmVudCA9PT0gJ251bWJlcicpIHtcbiAgICByZXR1cm4gX19hc3NpZ24oe1xuICAgICAgdHlwZTogZXZlbnRcbiAgICB9LCBwYXlsb2FkKTtcbiAgfVxuXG4gIHJldHVybiBldmVudDtcbn1cblxuZnVuY3Rpb24gdG9TQ1hNTEV2ZW50KGV2ZW50LCBzY3htbEV2ZW50KSB7XG4gIGlmICghaXNTdHJpbmcoZXZlbnQpICYmICckJHR5cGUnIGluIGV2ZW50ICYmIGV2ZW50LiQkdHlwZSA9PT0gJ3NjeG1sJykge1xuICAgIHJldHVybiBldmVudDtcbiAgfVxuXG4gIHZhciBldmVudE9iamVjdCA9IHRvRXZlbnRPYmplY3QoZXZlbnQpO1xuICByZXR1cm4gX19hc3NpZ24oe1xuICAgIG5hbWU6IGV2ZW50T2JqZWN0LnR5cGUsXG4gICAgZGF0YTogZXZlbnRPYmplY3QsXG4gICAgJCR0eXBlOiAnc2N4bWwnLFxuICAgIHR5cGU6ICdleHRlcm5hbCdcbiAgfSwgc2N4bWxFdmVudCk7XG59XG5cbmZ1bmN0aW9uIHRvVHJhbnNpdGlvbkNvbmZpZ0FycmF5KGV2ZW50LCBjb25maWdMaWtlKSB7XG4gIHZhciB0cmFuc2l0aW9ucyA9IHRvQXJyYXlTdHJpY3QoY29uZmlnTGlrZSkubWFwKGZ1bmN0aW9uICh0cmFuc2l0aW9uTGlrZSkge1xuICAgIGlmICh0eXBlb2YgdHJhbnNpdGlvbkxpa2UgPT09ICd1bmRlZmluZWQnIHx8IHR5cGVvZiB0cmFuc2l0aW9uTGlrZSA9PT0gJ3N0cmluZycgfHwgaXNNYWNoaW5lKHRyYW5zaXRpb25MaWtlKSkge1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgdGFyZ2V0OiB0cmFuc2l0aW9uTGlrZSxcbiAgICAgICAgZXZlbnQ6IGV2ZW50XG4gICAgICB9O1xuICAgIH1cblxuICAgIHJldHVybiBfX2Fzc2lnbihfX2Fzc2lnbih7fSwgdHJhbnNpdGlvbkxpa2UpLCB7XG4gICAgICBldmVudDogZXZlbnRcbiAgICB9KTtcbiAgfSk7XG4gIHJldHVybiB0cmFuc2l0aW9ucztcbn1cblxuZnVuY3Rpb24gbm9ybWFsaXplVGFyZ2V0KHRhcmdldCkge1xuICBpZiAodGFyZ2V0ID09PSB1bmRlZmluZWQgfHwgdGFyZ2V0ID09PSBUQVJHRVRMRVNTX0tFWSkge1xuICAgIHJldHVybiB1bmRlZmluZWQ7XG4gIH1cblxuICByZXR1cm4gdG9BcnJheSh0YXJnZXQpO1xufVxuXG5mdW5jdGlvbiByZXBvcnRVbmhhbmRsZWRFeGNlcHRpb25Pbkludm9jYXRpb24ob3JpZ2luYWxFcnJvciwgY3VycmVudEVycm9yLCBpZCkge1xuICBpZiAoIUlTX1BST0RVQ1RJT04pIHtcbiAgICB2YXIgb3JpZ2luYWxTdGFja1RyYWNlID0gb3JpZ2luYWxFcnJvci5zdGFjayA/IFwiIFN0YWNrdHJhY2Ugd2FzICdcIiArIG9yaWdpbmFsRXJyb3Iuc3RhY2sgKyBcIidcIiA6ICcnO1xuXG4gICAgaWYgKG9yaWdpbmFsRXJyb3IgPT09IGN1cnJlbnRFcnJvcikge1xuICAgICAgLy8gdHNsaW50OmRpc2FibGUtbmV4dC1saW5lOm5vLWNvbnNvbGVcbiAgICAgIGNvbnNvbGUuZXJyb3IoXCJNaXNzaW5nIG9uRXJyb3IgaGFuZGxlciBmb3IgaW52b2NhdGlvbiAnXCIgKyBpZCArIFwiJywgZXJyb3Igd2FzICdcIiArIG9yaWdpbmFsRXJyb3IgKyBcIicuXCIgKyBvcmlnaW5hbFN0YWNrVHJhY2UpO1xuICAgIH0gZWxzZSB7XG4gICAgICB2YXIgc3RhY2tUcmFjZSA9IGN1cnJlbnRFcnJvci5zdGFjayA/IFwiIFN0YWNrdHJhY2Ugd2FzICdcIiArIGN1cnJlbnRFcnJvci5zdGFjayArIFwiJ1wiIDogJyc7IC8vIHRzbGludDpkaXNhYmxlLW5leHQtbGluZTpuby1jb25zb2xlXG5cbiAgICAgIGNvbnNvbGUuZXJyb3IoXCJNaXNzaW5nIG9uRXJyb3IgaGFuZGxlciBhbmQvb3IgdW5oYW5kbGVkIGV4Y2VwdGlvbi9wcm9taXNlIHJlamVjdGlvbiBmb3IgaW52b2NhdGlvbiAnXCIgKyBpZCArIFwiJy4gXCIgKyAoXCJPcmlnaW5hbCBlcnJvcjogJ1wiICsgb3JpZ2luYWxFcnJvciArIFwiJy4gXCIgKyBvcmlnaW5hbFN0YWNrVHJhY2UgKyBcIiBDdXJyZW50IGVycm9yIGlzICdcIiArIGN1cnJlbnRFcnJvciArIFwiJy5cIiArIHN0YWNrVHJhY2UpKTtcbiAgICB9XG4gIH1cbn1cblxuZnVuY3Rpb24gZXZhbHVhdGVHdWFyZChtYWNoaW5lLCBndWFyZCwgY29udGV4dCwgX2V2ZW50LCBzdGF0ZSkge1xuICB2YXIgZ3VhcmRzID0gbWFjaGluZS5vcHRpb25zLmd1YXJkcztcbiAgdmFyIGd1YXJkTWV0YSA9IHtcbiAgICBzdGF0ZTogc3RhdGUsXG4gICAgY29uZDogZ3VhcmQsXG4gICAgX2V2ZW50OiBfZXZlbnRcbiAgfTsgLy8gVE9ETzogZG8gbm90IGhhcmRjb2RlIVxuXG4gIGlmIChndWFyZC50eXBlID09PSBERUZBVUxUX0dVQVJEX1RZUEUpIHtcbiAgICByZXR1cm4gZ3VhcmQucHJlZGljYXRlKGNvbnRleHQsIF9ldmVudC5kYXRhLCBndWFyZE1ldGEpO1xuICB9XG5cbiAgdmFyIGNvbmRGbiA9IGd1YXJkc1tndWFyZC50eXBlXTtcblxuICBpZiAoIWNvbmRGbikge1xuICAgIHRocm93IG5ldyBFcnJvcihcIkd1YXJkICdcIiArIGd1YXJkLnR5cGUgKyBcIicgaXMgbm90IGltcGxlbWVudGVkIG9uIG1hY2hpbmUgJ1wiICsgbWFjaGluZS5pZCArIFwiJy5cIik7XG4gIH1cblxuICByZXR1cm4gY29uZEZuKGNvbnRleHQsIF9ldmVudC5kYXRhLCBndWFyZE1ldGEpO1xufVxuXG5mdW5jdGlvbiB0b0ludm9rZVNvdXJjZShzcmMpIHtcbiAgaWYgKHR5cGVvZiBzcmMgPT09ICdzdHJpbmcnKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIHR5cGU6IHNyY1xuICAgIH07XG4gIH1cblxuICByZXR1cm4gc3JjO1xufVxuXG5mdW5jdGlvbiB0b09ic2VydmVyKG5leHRIYW5kbGVyLCBlcnJvckhhbmRsZXIsIGNvbXBsZXRpb25IYW5kbGVyKSB7XG4gIGlmICh0eXBlb2YgbmV4dEhhbmRsZXIgPT09ICdvYmplY3QnKSB7XG4gICAgcmV0dXJuIG5leHRIYW5kbGVyO1xuICB9XG5cbiAgdmFyIG5vb3AgPSBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIHZvaWQgMDtcbiAgfTtcblxuICByZXR1cm4ge1xuICAgIG5leHQ6IG5leHRIYW5kbGVyLFxuICAgIGVycm9yOiBlcnJvckhhbmRsZXIgfHwgbm9vcCxcbiAgICBjb21wbGV0ZTogY29tcGxldGlvbkhhbmRsZXIgfHwgbm9vcFxuICB9O1xufVxuXG5leHBvcnQgeyBldmFsdWF0ZUd1YXJkLCBmbGF0dGVuLCBnZXRFdmVudFR5cGUsIGlzQWN0b3IsIGlzQXJyYXksIGlzQnVpbHRJbkV2ZW50LCBpc0Z1bmN0aW9uLCBpc01hY2hpbmUsIGlzT2JzZXJ2YWJsZSwgaXNQcm9taXNlTGlrZSwgaXNTdGF0ZUxpa2UsIGlzU3RyaW5nLCBrZXlzLCBtYXBDb250ZXh0LCBtYXBGaWx0ZXJWYWx1ZXMsIG1hcFZhbHVlcywgbWF0Y2hlc1N0YXRlLCBuZXN0ZWRQYXRoLCBub3JtYWxpemVUYXJnZXQsIHBhcnRpdGlvbiwgcGF0aCwgcGF0aFRvU3RhdGVWYWx1ZSwgcmVwb3J0VW5oYW5kbGVkRXhjZXB0aW9uT25JbnZvY2F0aW9uLCBzeW1ib2xPYnNlcnZhYmxlLCB0b0FycmF5LCB0b0FycmF5U3RyaWN0LCB0b0V2ZW50T2JqZWN0LCB0b0d1YXJkLCB0b0ludm9rZVNvdXJjZSwgdG9PYnNlcnZlciwgdG9TQ1hNTEV2ZW50LCB0b1N0YXRlUGF0aCwgdG9TdGF0ZVBhdGhzLCB0b1N0YXRlVmFsdWUsIHRvVHJhbnNpdGlvbkNvbmZpZ0FycmF5LCB1bmlxdWVJZCwgdXBkYXRlQ29udGV4dCwgdXBkYXRlSGlzdG9yeVN0YXRlcywgdXBkYXRlSGlzdG9yeVZhbHVlLCB3YXJuIH07IiwiaW1wb3J0IHsgX192YWx1ZXMgfSBmcm9tICcuL192aXJ0dWFsL190c2xpYi5qcyc7XG5pbXBvcnQgeyBrZXlzLCBtYXRjaGVzU3RhdGUgfSBmcm9tICcuL3V0aWxzLmpzJztcblxuZnVuY3Rpb24gbWFwU3RhdGUoc3RhdGVNYXAsIHN0YXRlSWQpIHtcbiAgdmFyIGVfMSwgX2E7XG5cbiAgdmFyIGZvdW5kU3RhdGVJZDtcblxuICB0cnkge1xuICAgIGZvciAodmFyIF9iID0gX192YWx1ZXMoa2V5cyhzdGF0ZU1hcCkpLCBfYyA9IF9iLm5leHQoKTsgIV9jLmRvbmU7IF9jID0gX2IubmV4dCgpKSB7XG4gICAgICB2YXIgbWFwcGVkU3RhdGVJZCA9IF9jLnZhbHVlO1xuXG4gICAgICBpZiAobWF0Y2hlc1N0YXRlKG1hcHBlZFN0YXRlSWQsIHN0YXRlSWQpICYmICghZm91bmRTdGF0ZUlkIHx8IHN0YXRlSWQubGVuZ3RoID4gZm91bmRTdGF0ZUlkLmxlbmd0aCkpIHtcbiAgICAgICAgZm91bmRTdGF0ZUlkID0gbWFwcGVkU3RhdGVJZDtcbiAgICAgIH1cbiAgICB9XG4gIH0gY2F0Y2ggKGVfMV8xKSB7XG4gICAgZV8xID0ge1xuICAgICAgZXJyb3I6IGVfMV8xXG4gICAgfTtcbiAgfSBmaW5hbGx5IHtcbiAgICB0cnkge1xuICAgICAgaWYgKF9jICYmICFfYy5kb25lICYmIChfYSA9IF9iLnJldHVybikpIF9hLmNhbGwoX2IpO1xuICAgIH0gZmluYWxseSB7XG4gICAgICBpZiAoZV8xKSB0aHJvdyBlXzEuZXJyb3I7XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIHN0YXRlTWFwW2ZvdW5kU3RhdGVJZF07XG59XG5cbmV4cG9ydCB7IG1hcFN0YXRlIH07IiwidmFyIEFjdGlvblR5cGVzO1xuXG4oZnVuY3Rpb24gKEFjdGlvblR5cGVzKSB7XG4gIEFjdGlvblR5cGVzW1wiU3RhcnRcIl0gPSBcInhzdGF0ZS5zdGFydFwiO1xuICBBY3Rpb25UeXBlc1tcIlN0b3BcIl0gPSBcInhzdGF0ZS5zdG9wXCI7XG4gIEFjdGlvblR5cGVzW1wiUmFpc2VcIl0gPSBcInhzdGF0ZS5yYWlzZVwiO1xuICBBY3Rpb25UeXBlc1tcIlNlbmRcIl0gPSBcInhzdGF0ZS5zZW5kXCI7XG4gIEFjdGlvblR5cGVzW1wiQ2FuY2VsXCJdID0gXCJ4c3RhdGUuY2FuY2VsXCI7XG4gIEFjdGlvblR5cGVzW1wiTnVsbEV2ZW50XCJdID0gXCJcIjtcbiAgQWN0aW9uVHlwZXNbXCJBc3NpZ25cIl0gPSBcInhzdGF0ZS5hc3NpZ25cIjtcbiAgQWN0aW9uVHlwZXNbXCJBZnRlclwiXSA9IFwieHN0YXRlLmFmdGVyXCI7XG4gIEFjdGlvblR5cGVzW1wiRG9uZVN0YXRlXCJdID0gXCJkb25lLnN0YXRlXCI7XG4gIEFjdGlvblR5cGVzW1wiRG9uZUludm9rZVwiXSA9IFwiZG9uZS5pbnZva2VcIjtcbiAgQWN0aW9uVHlwZXNbXCJMb2dcIl0gPSBcInhzdGF0ZS5sb2dcIjtcbiAgQWN0aW9uVHlwZXNbXCJJbml0XCJdID0gXCJ4c3RhdGUuaW5pdFwiO1xuICBBY3Rpb25UeXBlc1tcIkludm9rZVwiXSA9IFwieHN0YXRlLmludm9rZVwiO1xuICBBY3Rpb25UeXBlc1tcIkVycm9yRXhlY3V0aW9uXCJdID0gXCJlcnJvci5leGVjdXRpb25cIjtcbiAgQWN0aW9uVHlwZXNbXCJFcnJvckNvbW11bmljYXRpb25cIl0gPSBcImVycm9yLmNvbW11bmljYXRpb25cIjtcbiAgQWN0aW9uVHlwZXNbXCJFcnJvclBsYXRmb3JtXCJdID0gXCJlcnJvci5wbGF0Zm9ybVwiO1xuICBBY3Rpb25UeXBlc1tcIkVycm9yQ3VzdG9tXCJdID0gXCJ4c3RhdGUuZXJyb3JcIjtcbiAgQWN0aW9uVHlwZXNbXCJVcGRhdGVcIl0gPSBcInhzdGF0ZS51cGRhdGVcIjtcbiAgQWN0aW9uVHlwZXNbXCJQdXJlXCJdID0gXCJ4c3RhdGUucHVyZVwiO1xuICBBY3Rpb25UeXBlc1tcIkNob29zZVwiXSA9IFwieHN0YXRlLmNob29zZVwiO1xufSkoQWN0aW9uVHlwZXMgfHwgKEFjdGlvblR5cGVzID0ge30pKTtcblxudmFyIFNwZWNpYWxUYXJnZXRzO1xuXG4oZnVuY3Rpb24gKFNwZWNpYWxUYXJnZXRzKSB7XG4gIFNwZWNpYWxUYXJnZXRzW1wiUGFyZW50XCJdID0gXCIjX3BhcmVudFwiO1xuICBTcGVjaWFsVGFyZ2V0c1tcIkludGVybmFsXCJdID0gXCIjX2ludGVybmFsXCI7XG59KShTcGVjaWFsVGFyZ2V0cyB8fCAoU3BlY2lhbFRhcmdldHMgPSB7fSkpO1xuXG5leHBvcnQgeyBBY3Rpb25UeXBlcywgU3BlY2lhbFRhcmdldHMgfTsiLCJpbXBvcnQgeyBBY3Rpb25UeXBlcyB9IGZyb20gJy4vdHlwZXMuanMnOyAvLyB4c3RhdGUtc3BlY2lmaWMgYWN0aW9uIHR5cGVzXG5cbnZhciBzdGFydCA9IEFjdGlvblR5cGVzLlN0YXJ0O1xudmFyIHN0b3AgPSBBY3Rpb25UeXBlcy5TdG9wO1xudmFyIHJhaXNlID0gQWN0aW9uVHlwZXMuUmFpc2U7XG52YXIgc2VuZCA9IEFjdGlvblR5cGVzLlNlbmQ7XG52YXIgY2FuY2VsID0gQWN0aW9uVHlwZXMuQ2FuY2VsO1xudmFyIG51bGxFdmVudCA9IEFjdGlvblR5cGVzLk51bGxFdmVudDtcbnZhciBhc3NpZ24gPSBBY3Rpb25UeXBlcy5Bc3NpZ247XG52YXIgYWZ0ZXIgPSBBY3Rpb25UeXBlcy5BZnRlcjtcbnZhciBkb25lU3RhdGUgPSBBY3Rpb25UeXBlcy5Eb25lU3RhdGU7XG52YXIgbG9nID0gQWN0aW9uVHlwZXMuTG9nO1xudmFyIGluaXQgPSBBY3Rpb25UeXBlcy5Jbml0O1xudmFyIGludm9rZSA9IEFjdGlvblR5cGVzLkludm9rZTtcbnZhciBlcnJvckV4ZWN1dGlvbiA9IEFjdGlvblR5cGVzLkVycm9yRXhlY3V0aW9uO1xudmFyIGVycm9yUGxhdGZvcm0gPSBBY3Rpb25UeXBlcy5FcnJvclBsYXRmb3JtO1xudmFyIGVycm9yID0gQWN0aW9uVHlwZXMuRXJyb3JDdXN0b207XG52YXIgdXBkYXRlID0gQWN0aW9uVHlwZXMuVXBkYXRlO1xudmFyIGNob29zZSA9IEFjdGlvblR5cGVzLkNob29zZTtcbnZhciBwdXJlID0gQWN0aW9uVHlwZXMuUHVyZTtcbmV4cG9ydCB7IGFmdGVyLCBhc3NpZ24sIGNhbmNlbCwgY2hvb3NlLCBkb25lU3RhdGUsIGVycm9yLCBlcnJvckV4ZWN1dGlvbiwgZXJyb3JQbGF0Zm9ybSwgaW5pdCwgaW52b2tlLCBsb2csIG51bGxFdmVudCwgcHVyZSwgcmFpc2UsIHNlbmQsIHN0YXJ0LCBzdG9wLCB1cGRhdGUgfTsiLCJpbXBvcnQgeyBfX2Fzc2lnbiwgX19yZWFkIH0gZnJvbSAnLi9fdmlydHVhbC9fdHNsaWIuanMnO1xuaW1wb3J0IHsgSVNfUFJPRFVDVElPTiB9IGZyb20gJy4vZW52aXJvbm1lbnQuanMnO1xuaW1wb3J0IHsgdG9TQ1hNTEV2ZW50LCBpc0Z1bmN0aW9uLCB0b0V2ZW50T2JqZWN0LCBnZXRFdmVudFR5cGUsIGlzU3RyaW5nLCBwYXJ0aXRpb24sIHVwZGF0ZUNvbnRleHQsIGZsYXR0ZW4sIHRvQXJyYXksIHRvR3VhcmQsIGV2YWx1YXRlR3VhcmQsIHdhcm4sIGlzQXJyYXkgfSBmcm9tICcuL3V0aWxzLmpzJztcbmltcG9ydCB7IFNwZWNpYWxUYXJnZXRzLCBBY3Rpb25UeXBlcyB9IGZyb20gJy4vdHlwZXMuanMnO1xuaW1wb3J0IHsgc2VuZCBhcyBzZW5kJDEsIHVwZGF0ZSwgYXNzaWduIGFzIGFzc2lnbiQxLCBpbml0LCByYWlzZSBhcyByYWlzZSQxLCBsb2cgYXMgbG9nJDEsIGNhbmNlbCBhcyBjYW5jZWwkMSwgZXJyb3IgYXMgZXJyb3IkMSwgc3RvcCBhcyBzdG9wJDEsIHB1cmUgYXMgcHVyZSQxLCBjaG9vc2UgYXMgY2hvb3NlJDEgfSBmcm9tICcuL2FjdGlvblR5cGVzLmpzJztcbnZhciBpbml0RXZlbnQgPSAvKiNfX1BVUkVfXyovdG9TQ1hNTEV2ZW50KHtcbiAgdHlwZTogaW5pdFxufSk7XG5cbmZ1bmN0aW9uIGdldEFjdGlvbkZ1bmN0aW9uKGFjdGlvblR5cGUsIGFjdGlvbkZ1bmN0aW9uTWFwKSB7XG4gIHJldHVybiBhY3Rpb25GdW5jdGlvbk1hcCA/IGFjdGlvbkZ1bmN0aW9uTWFwW2FjdGlvblR5cGVdIHx8IHVuZGVmaW5lZCA6IHVuZGVmaW5lZDtcbn1cblxuZnVuY3Rpb24gdG9BY3Rpb25PYmplY3QoYWN0aW9uLCBhY3Rpb25GdW5jdGlvbk1hcCkge1xuICB2YXIgYWN0aW9uT2JqZWN0O1xuXG4gIGlmIChpc1N0cmluZyhhY3Rpb24pIHx8IHR5cGVvZiBhY3Rpb24gPT09ICdudW1iZXInKSB7XG4gICAgdmFyIGV4ZWMgPSBnZXRBY3Rpb25GdW5jdGlvbihhY3Rpb24sIGFjdGlvbkZ1bmN0aW9uTWFwKTtcblxuICAgIGlmIChpc0Z1bmN0aW9uKGV4ZWMpKSB7XG4gICAgICBhY3Rpb25PYmplY3QgPSB7XG4gICAgICAgIHR5cGU6IGFjdGlvbixcbiAgICAgICAgZXhlYzogZXhlY1xuICAgICAgfTtcbiAgICB9IGVsc2UgaWYgKGV4ZWMpIHtcbiAgICAgIGFjdGlvbk9iamVjdCA9IGV4ZWM7XG4gICAgfSBlbHNlIHtcbiAgICAgIGFjdGlvbk9iamVjdCA9IHtcbiAgICAgICAgdHlwZTogYWN0aW9uLFxuICAgICAgICBleGVjOiB1bmRlZmluZWRcbiAgICAgIH07XG4gICAgfVxuICB9IGVsc2UgaWYgKGlzRnVuY3Rpb24oYWN0aW9uKSkge1xuICAgIGFjdGlvbk9iamVjdCA9IHtcbiAgICAgIC8vIENvbnZlcnQgYWN0aW9uIHRvIHN0cmluZyBpZiB1bm5hbWVkXG4gICAgICB0eXBlOiBhY3Rpb24ubmFtZSB8fCBhY3Rpb24udG9TdHJpbmcoKSxcbiAgICAgIGV4ZWM6IGFjdGlvblxuICAgIH07XG4gIH0gZWxzZSB7XG4gICAgdmFyIGV4ZWMgPSBnZXRBY3Rpb25GdW5jdGlvbihhY3Rpb24udHlwZSwgYWN0aW9uRnVuY3Rpb25NYXApO1xuXG4gICAgaWYgKGlzRnVuY3Rpb24oZXhlYykpIHtcbiAgICAgIGFjdGlvbk9iamVjdCA9IF9fYXNzaWduKF9fYXNzaWduKHt9LCBhY3Rpb24pLCB7XG4gICAgICAgIGV4ZWM6IGV4ZWNcbiAgICAgIH0pO1xuICAgIH0gZWxzZSBpZiAoZXhlYykge1xuICAgICAgdmFyIGFjdGlvblR5cGUgPSBleGVjLnR5cGUgfHwgYWN0aW9uLnR5cGU7XG4gICAgICBhY3Rpb25PYmplY3QgPSBfX2Fzc2lnbihfX2Fzc2lnbihfX2Fzc2lnbih7fSwgZXhlYyksIGFjdGlvbiksIHtcbiAgICAgICAgdHlwZTogYWN0aW9uVHlwZVxuICAgICAgfSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGFjdGlvbk9iamVjdCA9IGFjdGlvbjtcbiAgICB9XG4gIH1cblxuICBPYmplY3QuZGVmaW5lUHJvcGVydHkoYWN0aW9uT2JqZWN0LCAndG9TdHJpbmcnLCB7XG4gICAgdmFsdWU6IGZ1bmN0aW9uICgpIHtcbiAgICAgIHJldHVybiBhY3Rpb25PYmplY3QudHlwZTtcbiAgICB9LFxuICAgIGVudW1lcmFibGU6IGZhbHNlLFxuICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZVxuICB9KTtcbiAgcmV0dXJuIGFjdGlvbk9iamVjdDtcbn1cblxudmFyIHRvQWN0aW9uT2JqZWN0cyA9IGZ1bmN0aW9uIChhY3Rpb24sIGFjdGlvbkZ1bmN0aW9uTWFwKSB7XG4gIGlmICghYWN0aW9uKSB7XG4gICAgcmV0dXJuIFtdO1xuICB9XG5cbiAgdmFyIGFjdGlvbnMgPSBpc0FycmF5KGFjdGlvbikgPyBhY3Rpb24gOiBbYWN0aW9uXTtcbiAgcmV0dXJuIGFjdGlvbnMubWFwKGZ1bmN0aW9uIChzdWJBY3Rpb24pIHtcbiAgICByZXR1cm4gdG9BY3Rpb25PYmplY3Qoc3ViQWN0aW9uLCBhY3Rpb25GdW5jdGlvbk1hcCk7XG4gIH0pO1xufTtcblxuZnVuY3Rpb24gdG9BY3Rpdml0eURlZmluaXRpb24oYWN0aW9uKSB7XG4gIHZhciBhY3Rpb25PYmplY3QgPSB0b0FjdGlvbk9iamVjdChhY3Rpb24pO1xuICByZXR1cm4gX19hc3NpZ24oX19hc3NpZ24oe1xuICAgIGlkOiBpc1N0cmluZyhhY3Rpb24pID8gYWN0aW9uIDogYWN0aW9uT2JqZWN0LmlkXG4gIH0sIGFjdGlvbk9iamVjdCksIHtcbiAgICB0eXBlOiBhY3Rpb25PYmplY3QudHlwZVxuICB9KTtcbn1cbi8qKlxyXG4gKiBSYWlzZXMgYW4gZXZlbnQuIFRoaXMgcGxhY2VzIHRoZSBldmVudCBpbiB0aGUgaW50ZXJuYWwgZXZlbnQgcXVldWUsIHNvIHRoYXRcclxuICogdGhlIGV2ZW50IGlzIGltbWVkaWF0ZWx5IGNvbnN1bWVkIGJ5IHRoZSBtYWNoaW5lIGluIHRoZSBjdXJyZW50IHN0ZXAuXHJcbiAqXHJcbiAqIEBwYXJhbSBldmVudFR5cGUgVGhlIGV2ZW50IHRvIHJhaXNlLlxyXG4gKi9cblxuXG5mdW5jdGlvbiByYWlzZShldmVudCkge1xuICBpZiAoIWlzU3RyaW5nKGV2ZW50KSkge1xuICAgIHJldHVybiBzZW5kKGV2ZW50LCB7XG4gICAgICB0bzogU3BlY2lhbFRhcmdldHMuSW50ZXJuYWxcbiAgICB9KTtcbiAgfVxuXG4gIHJldHVybiB7XG4gICAgdHlwZTogcmFpc2UkMSxcbiAgICBldmVudDogZXZlbnRcbiAgfTtcbn1cblxuZnVuY3Rpb24gcmVzb2x2ZVJhaXNlKGFjdGlvbikge1xuICByZXR1cm4ge1xuICAgIHR5cGU6IHJhaXNlJDEsXG4gICAgX2V2ZW50OiB0b1NDWE1MRXZlbnQoYWN0aW9uLmV2ZW50KVxuICB9O1xufVxuLyoqXHJcbiAqIFNlbmRzIGFuIGV2ZW50LiBUaGlzIHJldHVybnMgYW4gYWN0aW9uIHRoYXQgd2lsbCBiZSByZWFkIGJ5IGFuIGludGVycHJldGVyIHRvXHJcbiAqIHNlbmQgdGhlIGV2ZW50IGluIHRoZSBuZXh0IHN0ZXAsIGFmdGVyIHRoZSBjdXJyZW50IHN0ZXAgaXMgZmluaXNoZWQgZXhlY3V0aW5nLlxyXG4gKlxyXG4gKiBAcGFyYW0gZXZlbnQgVGhlIGV2ZW50IHRvIHNlbmQuXHJcbiAqIEBwYXJhbSBvcHRpb25zIE9wdGlvbnMgdG8gcGFzcyBpbnRvIHRoZSBzZW5kIGV2ZW50OlxyXG4gKiAgLSBgaWRgIC0gVGhlIHVuaXF1ZSBzZW5kIGV2ZW50IGlkZW50aWZpZXIgKHVzZWQgd2l0aCBgY2FuY2VsKClgKS5cclxuICogIC0gYGRlbGF5YCAtIFRoZSBudW1iZXIgb2YgbWlsbGlzZWNvbmRzIHRvIGRlbGF5IHRoZSBzZW5kaW5nIG9mIHRoZSBldmVudC5cclxuICogIC0gYHRvYCAtIFRoZSB0YXJnZXQgb2YgdGhpcyBldmVudCAoYnkgZGVmYXVsdCwgdGhlIG1hY2hpbmUgdGhlIGV2ZW50IHdhcyBzZW50IGZyb20pLlxyXG4gKi9cblxuXG5mdW5jdGlvbiBzZW5kKGV2ZW50LCBvcHRpb25zKSB7XG4gIHJldHVybiB7XG4gICAgdG86IG9wdGlvbnMgPyBvcHRpb25zLnRvIDogdW5kZWZpbmVkLFxuICAgIHR5cGU6IHNlbmQkMSxcbiAgICBldmVudDogaXNGdW5jdGlvbihldmVudCkgPyBldmVudCA6IHRvRXZlbnRPYmplY3QoZXZlbnQpLFxuICAgIGRlbGF5OiBvcHRpb25zID8gb3B0aW9ucy5kZWxheSA6IHVuZGVmaW5lZCxcbiAgICBpZDogb3B0aW9ucyAmJiBvcHRpb25zLmlkICE9PSB1bmRlZmluZWQgPyBvcHRpb25zLmlkIDogaXNGdW5jdGlvbihldmVudCkgPyBldmVudC5uYW1lIDogZ2V0RXZlbnRUeXBlKGV2ZW50KVxuICB9O1xufVxuXG5mdW5jdGlvbiByZXNvbHZlU2VuZChhY3Rpb24sIGN0eCwgX2V2ZW50LCBkZWxheXNNYXApIHtcbiAgdmFyIG1ldGEgPSB7XG4gICAgX2V2ZW50OiBfZXZlbnRcbiAgfTsgLy8gVE9ETzogaGVscGVyIGZ1bmN0aW9uIGZvciByZXNvbHZpbmcgRXhwclxuXG4gIHZhciByZXNvbHZlZEV2ZW50ID0gdG9TQ1hNTEV2ZW50KGlzRnVuY3Rpb24oYWN0aW9uLmV2ZW50KSA/IGFjdGlvbi5ldmVudChjdHgsIF9ldmVudC5kYXRhLCBtZXRhKSA6IGFjdGlvbi5ldmVudCk7XG4gIHZhciByZXNvbHZlZERlbGF5O1xuXG4gIGlmIChpc1N0cmluZyhhY3Rpb24uZGVsYXkpKSB7XG4gICAgdmFyIGNvbmZpZ0RlbGF5ID0gZGVsYXlzTWFwICYmIGRlbGF5c01hcFthY3Rpb24uZGVsYXldO1xuICAgIHJlc29sdmVkRGVsYXkgPSBpc0Z1bmN0aW9uKGNvbmZpZ0RlbGF5KSA/IGNvbmZpZ0RlbGF5KGN0eCwgX2V2ZW50LmRhdGEsIG1ldGEpIDogY29uZmlnRGVsYXk7XG4gIH0gZWxzZSB7XG4gICAgcmVzb2x2ZWREZWxheSA9IGlzRnVuY3Rpb24oYWN0aW9uLmRlbGF5KSA/IGFjdGlvbi5kZWxheShjdHgsIF9ldmVudC5kYXRhLCBtZXRhKSA6IGFjdGlvbi5kZWxheTtcbiAgfVxuXG4gIHZhciByZXNvbHZlZFRhcmdldCA9IGlzRnVuY3Rpb24oYWN0aW9uLnRvKSA/IGFjdGlvbi50byhjdHgsIF9ldmVudC5kYXRhLCBtZXRhKSA6IGFjdGlvbi50bztcbiAgcmV0dXJuIF9fYXNzaWduKF9fYXNzaWduKHt9LCBhY3Rpb24pLCB7XG4gICAgdG86IHJlc29sdmVkVGFyZ2V0LFxuICAgIF9ldmVudDogcmVzb2x2ZWRFdmVudCxcbiAgICBldmVudDogcmVzb2x2ZWRFdmVudC5kYXRhLFxuICAgIGRlbGF5OiByZXNvbHZlZERlbGF5XG4gIH0pO1xufVxuLyoqXHJcbiAqIFNlbmRzIGFuIGV2ZW50IHRvIHRoaXMgbWFjaGluZSdzIHBhcmVudC5cclxuICpcclxuICogQHBhcmFtIGV2ZW50IFRoZSBldmVudCB0byBzZW5kIHRvIHRoZSBwYXJlbnQgbWFjaGluZS5cclxuICogQHBhcmFtIG9wdGlvbnMgT3B0aW9ucyB0byBwYXNzIGludG8gdGhlIHNlbmQgZXZlbnQuXHJcbiAqL1xuXG5cbmZ1bmN0aW9uIHNlbmRQYXJlbnQoZXZlbnQsIG9wdGlvbnMpIHtcbiAgcmV0dXJuIHNlbmQoZXZlbnQsIF9fYXNzaWduKF9fYXNzaWduKHt9LCBvcHRpb25zKSwge1xuICAgIHRvOiBTcGVjaWFsVGFyZ2V0cy5QYXJlbnRcbiAgfSkpO1xufVxuLyoqXHJcbiAqIFNlbmRzIGFuIHVwZGF0ZSBldmVudCB0byB0aGlzIG1hY2hpbmUncyBwYXJlbnQuXHJcbiAqL1xuXG5cbmZ1bmN0aW9uIHNlbmRVcGRhdGUoKSB7XG4gIHJldHVybiBzZW5kUGFyZW50KHVwZGF0ZSk7XG59XG4vKipcclxuICogU2VuZHMgYW4gZXZlbnQgYmFjayB0byB0aGUgc2VuZGVyIG9mIHRoZSBvcmlnaW5hbCBldmVudC5cclxuICpcclxuICogQHBhcmFtIGV2ZW50IFRoZSBldmVudCB0byBzZW5kIGJhY2sgdG8gdGhlIHNlbmRlclxyXG4gKiBAcGFyYW0gb3B0aW9ucyBPcHRpb25zIHRvIHBhc3MgaW50byB0aGUgc2VuZCBldmVudFxyXG4gKi9cblxuXG5mdW5jdGlvbiByZXNwb25kKGV2ZW50LCBvcHRpb25zKSB7XG4gIHJldHVybiBzZW5kKGV2ZW50LCBfX2Fzc2lnbihfX2Fzc2lnbih7fSwgb3B0aW9ucyksIHtcbiAgICB0bzogZnVuY3Rpb24gKF8sIF9fLCBfYSkge1xuICAgICAgdmFyIF9ldmVudCA9IF9hLl9ldmVudDtcbiAgICAgIHJldHVybiBfZXZlbnQub3JpZ2luOyAvLyBUT0RPOiBoYW5kbGUgd2hlbiBfZXZlbnQub3JpZ2luIGlzIHVuZGVmaW5lZFxuICAgIH1cbiAgfSkpO1xufVxuXG52YXIgZGVmYXVsdExvZ0V4cHIgPSBmdW5jdGlvbiAoY29udGV4dCwgZXZlbnQpIHtcbiAgcmV0dXJuIHtcbiAgICBjb250ZXh0OiBjb250ZXh0LFxuICAgIGV2ZW50OiBldmVudFxuICB9O1xufTtcbi8qKlxyXG4gKlxyXG4gKiBAcGFyYW0gZXhwciBUaGUgZXhwcmVzc2lvbiBmdW5jdGlvbiB0byBldmFsdWF0ZSB3aGljaCB3aWxsIGJlIGxvZ2dlZC5cclxuICogIFRha2VzIGluIDIgYXJndW1lbnRzOlxyXG4gKiAgLSBgY3R4YCAtIHRoZSBjdXJyZW50IHN0YXRlIGNvbnRleHRcclxuICogIC0gYGV2ZW50YCAtIHRoZSBldmVudCB0aGF0IGNhdXNlZCB0aGlzIGFjdGlvbiB0byBiZSBleGVjdXRlZC5cclxuICogQHBhcmFtIGxhYmVsIFRoZSBsYWJlbCB0byBnaXZlIHRvIHRoZSBsb2dnZWQgZXhwcmVzc2lvbi5cclxuICovXG5cblxuZnVuY3Rpb24gbG9nKGV4cHIsIGxhYmVsKSB7XG4gIGlmIChleHByID09PSB2b2lkIDApIHtcbiAgICBleHByID0gZGVmYXVsdExvZ0V4cHI7XG4gIH1cblxuICByZXR1cm4ge1xuICAgIHR5cGU6IGxvZyQxLFxuICAgIGxhYmVsOiBsYWJlbCxcbiAgICBleHByOiBleHByXG4gIH07XG59XG5cbnZhciByZXNvbHZlTG9nID0gZnVuY3Rpb24gKGFjdGlvbiwgY3R4LCBfZXZlbnQpIHtcbiAgcmV0dXJuIF9fYXNzaWduKF9fYXNzaWduKHt9LCBhY3Rpb24pLCB7XG4gICAgdmFsdWU6IGlzU3RyaW5nKGFjdGlvbi5leHByKSA/IGFjdGlvbi5leHByIDogYWN0aW9uLmV4cHIoY3R4LCBfZXZlbnQuZGF0YSwge1xuICAgICAgX2V2ZW50OiBfZXZlbnRcbiAgICB9KVxuICB9KTtcbn07XG4vKipcclxuICogQ2FuY2VscyBhbiBpbi1mbGlnaHQgYHNlbmQoLi4uKWAgYWN0aW9uLiBBIGNhbmNlbGVkIHNlbnQgYWN0aW9uIHdpbGwgbm90XHJcbiAqIGJlIGV4ZWN1dGVkLCBub3Igd2lsbCBpdHMgZXZlbnQgYmUgc2VudCwgdW5sZXNzIGl0IGhhcyBhbHJlYWR5IGJlZW4gc2VudFxyXG4gKiAoZS5nLiwgaWYgYGNhbmNlbCguLi4pYCBpcyBjYWxsZWQgYWZ0ZXIgdGhlIGBzZW5kKC4uLilgIGFjdGlvbidzIGBkZWxheWApLlxyXG4gKlxyXG4gKiBAcGFyYW0gc2VuZElkIFRoZSBgaWRgIG9mIHRoZSBgc2VuZCguLi4pYCBhY3Rpb24gdG8gY2FuY2VsLlxyXG4gKi9cblxuXG52YXIgY2FuY2VsID0gZnVuY3Rpb24gKHNlbmRJZCkge1xuICByZXR1cm4ge1xuICAgIHR5cGU6IGNhbmNlbCQxLFxuICAgIHNlbmRJZDogc2VuZElkXG4gIH07XG59O1xuLyoqXHJcbiAqIFN0YXJ0cyBhbiBhY3Rpdml0eS5cclxuICpcclxuICogQHBhcmFtIGFjdGl2aXR5IFRoZSBhY3Rpdml0eSB0byBzdGFydC5cclxuICovXG5cblxuZnVuY3Rpb24gc3RhcnQoYWN0aXZpdHkpIHtcbiAgdmFyIGFjdGl2aXR5RGVmID0gdG9BY3Rpdml0eURlZmluaXRpb24oYWN0aXZpdHkpO1xuICByZXR1cm4ge1xuICAgIHR5cGU6IEFjdGlvblR5cGVzLlN0YXJ0LFxuICAgIGFjdGl2aXR5OiBhY3Rpdml0eURlZixcbiAgICBleGVjOiB1bmRlZmluZWRcbiAgfTtcbn1cbi8qKlxyXG4gKiBTdG9wcyBhbiBhY3Rpdml0eS5cclxuICpcclxuICogQHBhcmFtIGFjdG9yUmVmIFRoZSBhY3Rpdml0eSB0byBzdG9wLlxyXG4gKi9cblxuXG5mdW5jdGlvbiBzdG9wKGFjdG9yUmVmKSB7XG4gIHZhciBhY3Rpdml0eSA9IGlzRnVuY3Rpb24oYWN0b3JSZWYpID8gYWN0b3JSZWYgOiB0b0FjdGl2aXR5RGVmaW5pdGlvbihhY3RvclJlZik7XG4gIHJldHVybiB7XG4gICAgdHlwZTogQWN0aW9uVHlwZXMuU3RvcCxcbiAgICBhY3Rpdml0eTogYWN0aXZpdHksXG4gICAgZXhlYzogdW5kZWZpbmVkXG4gIH07XG59XG5cbmZ1bmN0aW9uIHJlc29sdmVTdG9wKGFjdGlvbiwgY29udGV4dCwgX2V2ZW50KSB7XG4gIHZhciBhY3RvclJlZk9yU3RyaW5nID0gaXNGdW5jdGlvbihhY3Rpb24uYWN0aXZpdHkpID8gYWN0aW9uLmFjdGl2aXR5KGNvbnRleHQsIF9ldmVudC5kYXRhKSA6IGFjdGlvbi5hY3Rpdml0eTtcbiAgdmFyIHJlc29sdmVkQWN0b3JSZWYgPSB0eXBlb2YgYWN0b3JSZWZPclN0cmluZyA9PT0gJ3N0cmluZycgPyB7XG4gICAgaWQ6IGFjdG9yUmVmT3JTdHJpbmdcbiAgfSA6IGFjdG9yUmVmT3JTdHJpbmc7XG4gIHZhciBhY3Rpb25PYmplY3QgPSB7XG4gICAgdHlwZTogQWN0aW9uVHlwZXMuU3RvcCxcbiAgICBhY3Rpdml0eTogcmVzb2x2ZWRBY3RvclJlZlxuICB9O1xuICByZXR1cm4gYWN0aW9uT2JqZWN0O1xufVxuLyoqXHJcbiAqIFVwZGF0ZXMgdGhlIGN1cnJlbnQgY29udGV4dCBvZiB0aGUgbWFjaGluZS5cclxuICpcclxuICogQHBhcmFtIGFzc2lnbm1lbnQgQW4gb2JqZWN0IHRoYXQgcmVwcmVzZW50cyB0aGUgcGFydGlhbCBjb250ZXh0IHRvIHVwZGF0ZS5cclxuICovXG5cblxudmFyIGFzc2lnbiA9IGZ1bmN0aW9uIChhc3NpZ25tZW50KSB7XG4gIHJldHVybiB7XG4gICAgdHlwZTogYXNzaWduJDEsXG4gICAgYXNzaWdubWVudDogYXNzaWdubWVudFxuICB9O1xufTtcbi8qKlxyXG4gKiBSZXR1cm5zIGFuIGV2ZW50IHR5cGUgdGhhdCByZXByZXNlbnRzIGFuIGltcGxpY2l0IGV2ZW50IHRoYXRcclxuICogaXMgc2VudCBhZnRlciB0aGUgc3BlY2lmaWVkIGBkZWxheWAuXHJcbiAqXHJcbiAqIEBwYXJhbSBkZWxheVJlZiBUaGUgZGVsYXkgaW4gbWlsbGlzZWNvbmRzXHJcbiAqIEBwYXJhbSBpZCBUaGUgc3RhdGUgbm9kZSBJRCB3aGVyZSB0aGlzIGV2ZW50IGlzIGhhbmRsZWRcclxuICovXG5cblxuZnVuY3Rpb24gYWZ0ZXIoZGVsYXlSZWYsIGlkKSB7XG4gIHZhciBpZFN1ZmZpeCA9IGlkID8gXCIjXCIgKyBpZCA6ICcnO1xuICByZXR1cm4gQWN0aW9uVHlwZXMuQWZ0ZXIgKyBcIihcIiArIGRlbGF5UmVmICsgXCIpXCIgKyBpZFN1ZmZpeDtcbn1cbi8qKlxyXG4gKiBSZXR1cm5zIGFuIGV2ZW50IHRoYXQgcmVwcmVzZW50cyB0aGF0IGEgZmluYWwgc3RhdGUgbm9kZVxyXG4gKiBoYXMgYmVlbiByZWFjaGVkIGluIHRoZSBwYXJlbnQgc3RhdGUgbm9kZS5cclxuICpcclxuICogQHBhcmFtIGlkIFRoZSBmaW5hbCBzdGF0ZSBub2RlJ3MgcGFyZW50IHN0YXRlIG5vZGUgYGlkYFxyXG4gKiBAcGFyYW0gZGF0YSBUaGUgZGF0YSB0byBwYXNzIGludG8gdGhlIGV2ZW50XHJcbiAqL1xuXG5cbmZ1bmN0aW9uIGRvbmUoaWQsIGRhdGEpIHtcbiAgdmFyIHR5cGUgPSBBY3Rpb25UeXBlcy5Eb25lU3RhdGUgKyBcIi5cIiArIGlkO1xuICB2YXIgZXZlbnRPYmplY3QgPSB7XG4gICAgdHlwZTogdHlwZSxcbiAgICBkYXRhOiBkYXRhXG4gIH07XG5cbiAgZXZlbnRPYmplY3QudG9TdHJpbmcgPSBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIHR5cGU7XG4gIH07XG5cbiAgcmV0dXJuIGV2ZW50T2JqZWN0O1xufVxuLyoqXHJcbiAqIFJldHVybnMgYW4gZXZlbnQgdGhhdCByZXByZXNlbnRzIHRoYXQgYW4gaW52b2tlZCBzZXJ2aWNlIGhhcyB0ZXJtaW5hdGVkLlxyXG4gKlxyXG4gKiBBbiBpbnZva2VkIHNlcnZpY2UgaXMgdGVybWluYXRlZCB3aGVuIGl0IGhhcyByZWFjaGVkIGEgdG9wLWxldmVsIGZpbmFsIHN0YXRlIG5vZGUsXHJcbiAqIGJ1dCBub3Qgd2hlbiBpdCBpcyBjYW5jZWxlZC5cclxuICpcclxuICogQHBhcmFtIGlkIFRoZSBmaW5hbCBzdGF0ZSBub2RlIElEXHJcbiAqIEBwYXJhbSBkYXRhIFRoZSBkYXRhIHRvIHBhc3MgaW50byB0aGUgZXZlbnRcclxuICovXG5cblxuZnVuY3Rpb24gZG9uZUludm9rZShpZCwgZGF0YSkge1xuICB2YXIgdHlwZSA9IEFjdGlvblR5cGVzLkRvbmVJbnZva2UgKyBcIi5cIiArIGlkO1xuICB2YXIgZXZlbnRPYmplY3QgPSB7XG4gICAgdHlwZTogdHlwZSxcbiAgICBkYXRhOiBkYXRhXG4gIH07XG5cbiAgZXZlbnRPYmplY3QudG9TdHJpbmcgPSBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIHR5cGU7XG4gIH07XG5cbiAgcmV0dXJuIGV2ZW50T2JqZWN0O1xufVxuXG5mdW5jdGlvbiBlcnJvcihpZCwgZGF0YSkge1xuICB2YXIgdHlwZSA9IEFjdGlvblR5cGVzLkVycm9yUGxhdGZvcm0gKyBcIi5cIiArIGlkO1xuICB2YXIgZXZlbnRPYmplY3QgPSB7XG4gICAgdHlwZTogdHlwZSxcbiAgICBkYXRhOiBkYXRhXG4gIH07XG5cbiAgZXZlbnRPYmplY3QudG9TdHJpbmcgPSBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIHR5cGU7XG4gIH07XG5cbiAgcmV0dXJuIGV2ZW50T2JqZWN0O1xufVxuXG5mdW5jdGlvbiBwdXJlKGdldEFjdGlvbnMpIHtcbiAgcmV0dXJuIHtcbiAgICB0eXBlOiBBY3Rpb25UeXBlcy5QdXJlLFxuICAgIGdldDogZ2V0QWN0aW9uc1xuICB9O1xufVxuLyoqXHJcbiAqIEZvcndhcmRzIChzZW5kcykgYW4gZXZlbnQgdG8gYSBzcGVjaWZpZWQgc2VydmljZS5cclxuICpcclxuICogQHBhcmFtIHRhcmdldCBUaGUgdGFyZ2V0IHNlcnZpY2UgdG8gZm9yd2FyZCB0aGUgZXZlbnQgdG8uXHJcbiAqIEBwYXJhbSBvcHRpb25zIE9wdGlvbnMgdG8gcGFzcyBpbnRvIHRoZSBzZW5kIGFjdGlvbiBjcmVhdG9yLlxyXG4gKi9cblxuXG5mdW5jdGlvbiBmb3J3YXJkVG8odGFyZ2V0LCBvcHRpb25zKSB7XG4gIHJldHVybiBzZW5kKGZ1bmN0aW9uIChfLCBldmVudCkge1xuICAgIHJldHVybiBldmVudDtcbiAgfSwgX19hc3NpZ24oX19hc3NpZ24oe30sIG9wdGlvbnMpLCB7XG4gICAgdG86IHRhcmdldFxuICB9KSk7XG59XG4vKipcclxuICogRXNjYWxhdGVzIGFuIGVycm9yIGJ5IHNlbmRpbmcgaXQgYXMgYW4gZXZlbnQgdG8gdGhpcyBtYWNoaW5lJ3MgcGFyZW50LlxyXG4gKlxyXG4gKiBAcGFyYW0gZXJyb3JEYXRhIFRoZSBlcnJvciBkYXRhIHRvIHNlbmQsIG9yIHRoZSBleHByZXNzaW9uIGZ1bmN0aW9uIHRoYXRcclxuICogdGFrZXMgaW4gdGhlIGBjb250ZXh0YCwgYGV2ZW50YCwgYW5kIGBtZXRhYCwgYW5kIHJldHVybnMgdGhlIGVycm9yIGRhdGEgdG8gc2VuZC5cclxuICogQHBhcmFtIG9wdGlvbnMgT3B0aW9ucyB0byBwYXNzIGludG8gdGhlIHNlbmQgYWN0aW9uIGNyZWF0b3IuXHJcbiAqL1xuXG5cbmZ1bmN0aW9uIGVzY2FsYXRlKGVycm9yRGF0YSwgb3B0aW9ucykge1xuICByZXR1cm4gc2VuZFBhcmVudChmdW5jdGlvbiAoY29udGV4dCwgZXZlbnQsIG1ldGEpIHtcbiAgICByZXR1cm4ge1xuICAgICAgdHlwZTogZXJyb3IkMSxcbiAgICAgIGRhdGE6IGlzRnVuY3Rpb24oZXJyb3JEYXRhKSA/IGVycm9yRGF0YShjb250ZXh0LCBldmVudCwgbWV0YSkgOiBlcnJvckRhdGFcbiAgICB9O1xuICB9LCBfX2Fzc2lnbihfX2Fzc2lnbih7fSwgb3B0aW9ucyksIHtcbiAgICB0bzogU3BlY2lhbFRhcmdldHMuUGFyZW50XG4gIH0pKTtcbn1cblxuZnVuY3Rpb24gY2hvb3NlKGNvbmRzKSB7XG4gIHJldHVybiB7XG4gICAgdHlwZTogQWN0aW9uVHlwZXMuQ2hvb3NlLFxuICAgIGNvbmRzOiBjb25kc1xuICB9O1xufVxuXG5mdW5jdGlvbiByZXNvbHZlQWN0aW9ucyhtYWNoaW5lLCBjdXJyZW50U3RhdGUsIGN1cnJlbnRDb250ZXh0LCBfZXZlbnQsIGFjdGlvbnMpIHtcbiAgdmFyIF9hID0gX19yZWFkKHBhcnRpdGlvbihhY3Rpb25zLCBmdW5jdGlvbiAoYWN0aW9uKSB7XG4gICAgcmV0dXJuIGFjdGlvbi50eXBlID09PSBhc3NpZ24kMTtcbiAgfSksIDIpLFxuICAgICAgYXNzaWduQWN0aW9ucyA9IF9hWzBdLFxuICAgICAgb3RoZXJBY3Rpb25zID0gX2FbMV07XG5cbiAgdmFyIHVwZGF0ZWRDb250ZXh0ID0gYXNzaWduQWN0aW9ucy5sZW5ndGggPyB1cGRhdGVDb250ZXh0KGN1cnJlbnRDb250ZXh0LCBfZXZlbnQsIGFzc2lnbkFjdGlvbnMsIGN1cnJlbnRTdGF0ZSkgOiBjdXJyZW50Q29udGV4dDtcbiAgdmFyIHJlc29sdmVkQWN0aW9ucyA9IGZsYXR0ZW4ob3RoZXJBY3Rpb25zLm1hcChmdW5jdGlvbiAoYWN0aW9uT2JqZWN0KSB7XG4gICAgdmFyIF9hO1xuXG4gICAgc3dpdGNoIChhY3Rpb25PYmplY3QudHlwZSkge1xuICAgICAgY2FzZSByYWlzZSQxOlxuICAgICAgICByZXR1cm4gcmVzb2x2ZVJhaXNlKGFjdGlvbk9iamVjdCk7XG5cbiAgICAgIGNhc2Ugc2VuZCQxOlxuICAgICAgICB2YXIgc2VuZEFjdGlvbiA9IHJlc29sdmVTZW5kKGFjdGlvbk9iamVjdCwgdXBkYXRlZENvbnRleHQsIF9ldmVudCwgbWFjaGluZS5vcHRpb25zLmRlbGF5cyk7IC8vIFRPRE86IGZpeCBBY3Rpb25UeXBlcy5Jbml0XG5cbiAgICAgICAgaWYgKCFJU19QUk9EVUNUSU9OKSB7XG4gICAgICAgICAgLy8gd2FybiBhZnRlciByZXNvbHZpbmcgYXMgd2UgY2FuIGNyZWF0ZSBiZXR0ZXIgY29udGV4dHVhbCBtZXNzYWdlIGhlcmVcbiAgICAgICAgICB3YXJuKCFpc1N0cmluZyhhY3Rpb25PYmplY3QuZGVsYXkpIHx8IHR5cGVvZiBzZW5kQWN0aW9uLmRlbGF5ID09PSAnbnVtYmVyJywgLy8gdHNsaW50OmRpc2FibGUtbmV4dC1saW5lOm1heC1saW5lLWxlbmd0aFxuICAgICAgICAgIFwiTm8gZGVsYXkgcmVmZXJlbmNlIGZvciBkZWxheSBleHByZXNzaW9uICdcIiArIGFjdGlvbk9iamVjdC5kZWxheSArIFwiJyB3YXMgZm91bmQgb24gbWFjaGluZSAnXCIgKyBtYWNoaW5lLmlkICsgXCInXCIpO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHNlbmRBY3Rpb247XG5cbiAgICAgIGNhc2UgbG9nJDE6XG4gICAgICAgIHJldHVybiByZXNvbHZlTG9nKGFjdGlvbk9iamVjdCwgdXBkYXRlZENvbnRleHQsIF9ldmVudCk7XG5cbiAgICAgIGNhc2UgY2hvb3NlJDE6XG4gICAgICAgIHtcbiAgICAgICAgICB2YXIgY2hvb3NlQWN0aW9uID0gYWN0aW9uT2JqZWN0O1xuICAgICAgICAgIHZhciBtYXRjaGVkQWN0aW9ucyA9IChfYSA9IGNob29zZUFjdGlvbi5jb25kcy5maW5kKGZ1bmN0aW9uIChjb25kaXRpb24pIHtcbiAgICAgICAgICAgIHZhciBndWFyZCA9IHRvR3VhcmQoY29uZGl0aW9uLmNvbmQsIG1hY2hpbmUub3B0aW9ucy5ndWFyZHMpO1xuICAgICAgICAgICAgcmV0dXJuICFndWFyZCB8fCBldmFsdWF0ZUd1YXJkKG1hY2hpbmUsIGd1YXJkLCB1cGRhdGVkQ29udGV4dCwgX2V2ZW50LCBjdXJyZW50U3RhdGUpO1xuICAgICAgICAgIH0pKSA9PT0gbnVsbCB8fCBfYSA9PT0gdm9pZCAwID8gdm9pZCAwIDogX2EuYWN0aW9ucztcblxuICAgICAgICAgIGlmICghbWF0Y2hlZEFjdGlvbnMpIHtcbiAgICAgICAgICAgIHJldHVybiBbXTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICB2YXIgcmVzb2x2ZWQgPSByZXNvbHZlQWN0aW9ucyhtYWNoaW5lLCBjdXJyZW50U3RhdGUsIHVwZGF0ZWRDb250ZXh0LCBfZXZlbnQsIHRvQWN0aW9uT2JqZWN0cyh0b0FycmF5KG1hdGNoZWRBY3Rpb25zKSwgbWFjaGluZS5vcHRpb25zLmFjdGlvbnMpKTtcbiAgICAgICAgICB1cGRhdGVkQ29udGV4dCA9IHJlc29sdmVkWzFdO1xuICAgICAgICAgIHJldHVybiByZXNvbHZlZFswXTtcbiAgICAgICAgfVxuXG4gICAgICBjYXNlIHB1cmUkMTpcbiAgICAgICAge1xuICAgICAgICAgIHZhciBtYXRjaGVkQWN0aW9ucyA9IGFjdGlvbk9iamVjdC5nZXQodXBkYXRlZENvbnRleHQsIF9ldmVudC5kYXRhKTtcblxuICAgICAgICAgIGlmICghbWF0Y2hlZEFjdGlvbnMpIHtcbiAgICAgICAgICAgIHJldHVybiBbXTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICB2YXIgcmVzb2x2ZWQgPSByZXNvbHZlQWN0aW9ucyhtYWNoaW5lLCBjdXJyZW50U3RhdGUsIHVwZGF0ZWRDb250ZXh0LCBfZXZlbnQsIHRvQWN0aW9uT2JqZWN0cyh0b0FycmF5KG1hdGNoZWRBY3Rpb25zKSwgbWFjaGluZS5vcHRpb25zLmFjdGlvbnMpKTtcbiAgICAgICAgICB1cGRhdGVkQ29udGV4dCA9IHJlc29sdmVkWzFdO1xuICAgICAgICAgIHJldHVybiByZXNvbHZlZFswXTtcbiAgICAgICAgfVxuXG4gICAgICBjYXNlIHN0b3AkMTpcbiAgICAgICAge1xuICAgICAgICAgIHJldHVybiByZXNvbHZlU3RvcChhY3Rpb25PYmplY3QsIHVwZGF0ZWRDb250ZXh0LCBfZXZlbnQpO1xuICAgICAgICB9XG5cbiAgICAgIGRlZmF1bHQ6XG4gICAgICAgIHJldHVybiB0b0FjdGlvbk9iamVjdChhY3Rpb25PYmplY3QsIG1hY2hpbmUub3B0aW9ucy5hY3Rpb25zKTtcbiAgICB9XG4gIH0pKTtcbiAgcmV0dXJuIFtyZXNvbHZlZEFjdGlvbnMsIHVwZGF0ZWRDb250ZXh0XTtcbn1cblxuZXhwb3J0IHsgYWZ0ZXIsIGFzc2lnbiwgY2FuY2VsLCBjaG9vc2UsIGRvbmUsIGRvbmVJbnZva2UsIGVycm9yLCBlc2NhbGF0ZSwgZm9yd2FyZFRvLCBnZXRBY3Rpb25GdW5jdGlvbiwgaW5pdEV2ZW50LCBsb2csIHB1cmUsIHJhaXNlLCByZXNvbHZlQWN0aW9ucywgcmVzb2x2ZUxvZywgcmVzb2x2ZVJhaXNlLCByZXNvbHZlU2VuZCwgcmVzb2x2ZVN0b3AsIHJlc3BvbmQsIHNlbmQsIHNlbmRQYXJlbnQsIHNlbmRVcGRhdGUsIHN0YXJ0LCBzdG9wLCB0b0FjdGlvbk9iamVjdCwgdG9BY3Rpb25PYmplY3RzLCB0b0FjdGl2aXR5RGVmaW5pdGlvbiB9OyIsImltcG9ydCB7IF9fdmFsdWVzLCBfX3NwcmVhZCB9IGZyb20gJy4vX3ZpcnR1YWwvX3RzbGliLmpzJztcbmltcG9ydCB7IGtleXMsIGZsYXR0ZW4gfSBmcm9tICcuL3V0aWxzLmpzJztcblxudmFyIGlzTGVhZk5vZGUgPSBmdW5jdGlvbiAoc3RhdGVOb2RlKSB7XG4gIHJldHVybiBzdGF0ZU5vZGUudHlwZSA9PT0gJ2F0b21pYycgfHwgc3RhdGVOb2RlLnR5cGUgPT09ICdmaW5hbCc7XG59O1xuXG5mdW5jdGlvbiBnZXRDaGlsZHJlbihzdGF0ZU5vZGUpIHtcbiAgcmV0dXJuIGtleXMoc3RhdGVOb2RlLnN0YXRlcykubWFwKGZ1bmN0aW9uIChrZXkpIHtcbiAgICByZXR1cm4gc3RhdGVOb2RlLnN0YXRlc1trZXldO1xuICB9KTtcbn1cblxuZnVuY3Rpb24gZ2V0QWxsU3RhdGVOb2RlcyhzdGF0ZU5vZGUpIHtcbiAgdmFyIHN0YXRlTm9kZXMgPSBbc3RhdGVOb2RlXTtcblxuICBpZiAoaXNMZWFmTm9kZShzdGF0ZU5vZGUpKSB7XG4gICAgcmV0dXJuIHN0YXRlTm9kZXM7XG4gIH1cblxuICByZXR1cm4gc3RhdGVOb2Rlcy5jb25jYXQoZmxhdHRlbihnZXRDaGlsZHJlbihzdGF0ZU5vZGUpLm1hcChnZXRBbGxTdGF0ZU5vZGVzKSkpO1xufVxuXG5mdW5jdGlvbiBnZXRDb25maWd1cmF0aW9uKHByZXZTdGF0ZU5vZGVzLCBzdGF0ZU5vZGVzKSB7XG4gIHZhciBlXzEsIF9hLCBlXzIsIF9iLCBlXzMsIF9jLCBlXzQsIF9kO1xuXG4gIHZhciBwcmV2Q29uZmlndXJhdGlvbiA9IG5ldyBTZXQocHJldlN0YXRlTm9kZXMpO1xuICB2YXIgcHJldkFkakxpc3QgPSBnZXRBZGpMaXN0KHByZXZDb25maWd1cmF0aW9uKTtcbiAgdmFyIGNvbmZpZ3VyYXRpb24gPSBuZXcgU2V0KHN0YXRlTm9kZXMpO1xuXG4gIHRyeSB7XG4gICAgLy8gYWRkIGFsbCBhbmNlc3RvcnNcbiAgICBmb3IgKHZhciBjb25maWd1cmF0aW9uXzEgPSBfX3ZhbHVlcyhjb25maWd1cmF0aW9uKSwgY29uZmlndXJhdGlvbl8xXzEgPSBjb25maWd1cmF0aW9uXzEubmV4dCgpOyAhY29uZmlndXJhdGlvbl8xXzEuZG9uZTsgY29uZmlndXJhdGlvbl8xXzEgPSBjb25maWd1cmF0aW9uXzEubmV4dCgpKSB7XG4gICAgICB2YXIgcyA9IGNvbmZpZ3VyYXRpb25fMV8xLnZhbHVlO1xuICAgICAgdmFyIG0gPSBzLnBhcmVudDtcblxuICAgICAgd2hpbGUgKG0gJiYgIWNvbmZpZ3VyYXRpb24uaGFzKG0pKSB7XG4gICAgICAgIGNvbmZpZ3VyYXRpb24uYWRkKG0pO1xuICAgICAgICBtID0gbS5wYXJlbnQ7XG4gICAgICB9XG4gICAgfVxuICB9IGNhdGNoIChlXzFfMSkge1xuICAgIGVfMSA9IHtcbiAgICAgIGVycm9yOiBlXzFfMVxuICAgIH07XG4gIH0gZmluYWxseSB7XG4gICAgdHJ5IHtcbiAgICAgIGlmIChjb25maWd1cmF0aW9uXzFfMSAmJiAhY29uZmlndXJhdGlvbl8xXzEuZG9uZSAmJiAoX2EgPSBjb25maWd1cmF0aW9uXzEucmV0dXJuKSkgX2EuY2FsbChjb25maWd1cmF0aW9uXzEpO1xuICAgIH0gZmluYWxseSB7XG4gICAgICBpZiAoZV8xKSB0aHJvdyBlXzEuZXJyb3I7XG4gICAgfVxuICB9XG5cbiAgdmFyIGFkakxpc3QgPSBnZXRBZGpMaXN0KGNvbmZpZ3VyYXRpb24pO1xuXG4gIHRyeSB7XG4gICAgLy8gYWRkIGRlc2NlbmRhbnRzXG4gICAgZm9yICh2YXIgY29uZmlndXJhdGlvbl8yID0gX192YWx1ZXMoY29uZmlndXJhdGlvbiksIGNvbmZpZ3VyYXRpb25fMl8xID0gY29uZmlndXJhdGlvbl8yLm5leHQoKTsgIWNvbmZpZ3VyYXRpb25fMl8xLmRvbmU7IGNvbmZpZ3VyYXRpb25fMl8xID0gY29uZmlndXJhdGlvbl8yLm5leHQoKSkge1xuICAgICAgdmFyIHMgPSBjb25maWd1cmF0aW9uXzJfMS52YWx1ZTsgLy8gaWYgcHJldmlvdXNseSBhY3RpdmUsIGFkZCBleGlzdGluZyBjaGlsZCBub2Rlc1xuXG4gICAgICBpZiAocy50eXBlID09PSAnY29tcG91bmQnICYmICghYWRqTGlzdC5nZXQocykgfHwgIWFkakxpc3QuZ2V0KHMpLmxlbmd0aCkpIHtcbiAgICAgICAgaWYgKHByZXZBZGpMaXN0LmdldChzKSkge1xuICAgICAgICAgIHByZXZBZGpMaXN0LmdldChzKS5mb3JFYWNoKGZ1bmN0aW9uIChzbikge1xuICAgICAgICAgICAgcmV0dXJuIGNvbmZpZ3VyYXRpb24uYWRkKHNuKTtcbiAgICAgICAgICB9KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBzLmluaXRpYWxTdGF0ZU5vZGVzLmZvckVhY2goZnVuY3Rpb24gKHNuKSB7XG4gICAgICAgICAgICByZXR1cm4gY29uZmlndXJhdGlvbi5hZGQoc24pO1xuICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBpZiAocy50eXBlID09PSAncGFyYWxsZWwnKSB7XG4gICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGZvciAodmFyIF9lID0gKGVfMyA9IHZvaWQgMCwgX192YWx1ZXMoZ2V0Q2hpbGRyZW4ocykpKSwgX2YgPSBfZS5uZXh0KCk7ICFfZi5kb25lOyBfZiA9IF9lLm5leHQoKSkge1xuICAgICAgICAgICAgICB2YXIgY2hpbGQgPSBfZi52YWx1ZTtcblxuICAgICAgICAgICAgICBpZiAoY2hpbGQudHlwZSA9PT0gJ2hpc3RvcnknKSB7XG4gICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICBpZiAoIWNvbmZpZ3VyYXRpb24uaGFzKGNoaWxkKSkge1xuICAgICAgICAgICAgICAgIGNvbmZpZ3VyYXRpb24uYWRkKGNoaWxkKTtcblxuICAgICAgICAgICAgICAgIGlmIChwcmV2QWRqTGlzdC5nZXQoY2hpbGQpKSB7XG4gICAgICAgICAgICAgICAgICBwcmV2QWRqTGlzdC5nZXQoY2hpbGQpLmZvckVhY2goZnVuY3Rpb24gKHNuKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBjb25maWd1cmF0aW9uLmFkZChzbik7XG4gICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgY2hpbGQuaW5pdGlhbFN0YXRlTm9kZXMuZm9yRWFjaChmdW5jdGlvbiAoc24pIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGNvbmZpZ3VyYXRpb24uYWRkKHNuKTtcbiAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgIH0gY2F0Y2ggKGVfM18xKSB7XG4gICAgICAgICAgICBlXzMgPSB7XG4gICAgICAgICAgICAgIGVycm9yOiBlXzNfMVxuICAgICAgICAgICAgfTtcbiAgICAgICAgICB9IGZpbmFsbHkge1xuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgaWYgKF9mICYmICFfZi5kb25lICYmIChfYyA9IF9lLnJldHVybikpIF9jLmNhbGwoX2UpO1xuICAgICAgICAgICAgfSBmaW5hbGx5IHtcbiAgICAgICAgICAgICAgaWYgKGVfMykgdGhyb3cgZV8zLmVycm9yO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfSBjYXRjaCAoZV8yXzEpIHtcbiAgICBlXzIgPSB7XG4gICAgICBlcnJvcjogZV8yXzFcbiAgICB9O1xuICB9IGZpbmFsbHkge1xuICAgIHRyeSB7XG4gICAgICBpZiAoY29uZmlndXJhdGlvbl8yXzEgJiYgIWNvbmZpZ3VyYXRpb25fMl8xLmRvbmUgJiYgKF9iID0gY29uZmlndXJhdGlvbl8yLnJldHVybikpIF9iLmNhbGwoY29uZmlndXJhdGlvbl8yKTtcbiAgICB9IGZpbmFsbHkge1xuICAgICAgaWYgKGVfMikgdGhyb3cgZV8yLmVycm9yO1xuICAgIH1cbiAgfVxuXG4gIHRyeSB7XG4gICAgLy8gYWRkIGFsbCBhbmNlc3RvcnNcbiAgICBmb3IgKHZhciBjb25maWd1cmF0aW9uXzMgPSBfX3ZhbHVlcyhjb25maWd1cmF0aW9uKSwgY29uZmlndXJhdGlvbl8zXzEgPSBjb25maWd1cmF0aW9uXzMubmV4dCgpOyAhY29uZmlndXJhdGlvbl8zXzEuZG9uZTsgY29uZmlndXJhdGlvbl8zXzEgPSBjb25maWd1cmF0aW9uXzMubmV4dCgpKSB7XG4gICAgICB2YXIgcyA9IGNvbmZpZ3VyYXRpb25fM18xLnZhbHVlO1xuICAgICAgdmFyIG0gPSBzLnBhcmVudDtcblxuICAgICAgd2hpbGUgKG0gJiYgIWNvbmZpZ3VyYXRpb24uaGFzKG0pKSB7XG4gICAgICAgIGNvbmZpZ3VyYXRpb24uYWRkKG0pO1xuICAgICAgICBtID0gbS5wYXJlbnQ7XG4gICAgICB9XG4gICAgfVxuICB9IGNhdGNoIChlXzRfMSkge1xuICAgIGVfNCA9IHtcbiAgICAgIGVycm9yOiBlXzRfMVxuICAgIH07XG4gIH0gZmluYWxseSB7XG4gICAgdHJ5IHtcbiAgICAgIGlmIChjb25maWd1cmF0aW9uXzNfMSAmJiAhY29uZmlndXJhdGlvbl8zXzEuZG9uZSAmJiAoX2QgPSBjb25maWd1cmF0aW9uXzMucmV0dXJuKSkgX2QuY2FsbChjb25maWd1cmF0aW9uXzMpO1xuICAgIH0gZmluYWxseSB7XG4gICAgICBpZiAoZV80KSB0aHJvdyBlXzQuZXJyb3I7XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIGNvbmZpZ3VyYXRpb247XG59XG5cbmZ1bmN0aW9uIGdldFZhbHVlRnJvbUFkaihiYXNlTm9kZSwgYWRqTGlzdCkge1xuICB2YXIgY2hpbGRTdGF0ZU5vZGVzID0gYWRqTGlzdC5nZXQoYmFzZU5vZGUpO1xuXG4gIGlmICghY2hpbGRTdGF0ZU5vZGVzKSB7XG4gICAgcmV0dXJuIHt9OyAvLyB0b2RvOiBmaXg/XG4gIH1cblxuICBpZiAoYmFzZU5vZGUudHlwZSA9PT0gJ2NvbXBvdW5kJykge1xuICAgIHZhciBjaGlsZFN0YXRlTm9kZSA9IGNoaWxkU3RhdGVOb2Rlc1swXTtcblxuICAgIGlmIChjaGlsZFN0YXRlTm9kZSkge1xuICAgICAgaWYgKGlzTGVhZk5vZGUoY2hpbGRTdGF0ZU5vZGUpKSB7XG4gICAgICAgIHJldHVybiBjaGlsZFN0YXRlTm9kZS5rZXk7XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiB7fTtcbiAgICB9XG4gIH1cblxuICB2YXIgc3RhdGVWYWx1ZSA9IHt9O1xuICBjaGlsZFN0YXRlTm9kZXMuZm9yRWFjaChmdW5jdGlvbiAoY3NuKSB7XG4gICAgc3RhdGVWYWx1ZVtjc24ua2V5XSA9IGdldFZhbHVlRnJvbUFkaihjc24sIGFkakxpc3QpO1xuICB9KTtcbiAgcmV0dXJuIHN0YXRlVmFsdWU7XG59XG5cbmZ1bmN0aW9uIGdldEFkakxpc3QoY29uZmlndXJhdGlvbikge1xuICB2YXIgZV81LCBfYTtcblxuICB2YXIgYWRqTGlzdCA9IG5ldyBNYXAoKTtcblxuICB0cnkge1xuICAgIGZvciAodmFyIGNvbmZpZ3VyYXRpb25fNCA9IF9fdmFsdWVzKGNvbmZpZ3VyYXRpb24pLCBjb25maWd1cmF0aW9uXzRfMSA9IGNvbmZpZ3VyYXRpb25fNC5uZXh0KCk7ICFjb25maWd1cmF0aW9uXzRfMS5kb25lOyBjb25maWd1cmF0aW9uXzRfMSA9IGNvbmZpZ3VyYXRpb25fNC5uZXh0KCkpIHtcbiAgICAgIHZhciBzID0gY29uZmlndXJhdGlvbl80XzEudmFsdWU7XG5cbiAgICAgIGlmICghYWRqTGlzdC5oYXMocykpIHtcbiAgICAgICAgYWRqTGlzdC5zZXQocywgW10pO1xuICAgICAgfVxuXG4gICAgICBpZiAocy5wYXJlbnQpIHtcbiAgICAgICAgaWYgKCFhZGpMaXN0LmhhcyhzLnBhcmVudCkpIHtcbiAgICAgICAgICBhZGpMaXN0LnNldChzLnBhcmVudCwgW10pO1xuICAgICAgICB9XG5cbiAgICAgICAgYWRqTGlzdC5nZXQocy5wYXJlbnQpLnB1c2gocyk7XG4gICAgICB9XG4gICAgfVxuICB9IGNhdGNoIChlXzVfMSkge1xuICAgIGVfNSA9IHtcbiAgICAgIGVycm9yOiBlXzVfMVxuICAgIH07XG4gIH0gZmluYWxseSB7XG4gICAgdHJ5IHtcbiAgICAgIGlmIChjb25maWd1cmF0aW9uXzRfMSAmJiAhY29uZmlndXJhdGlvbl80XzEuZG9uZSAmJiAoX2EgPSBjb25maWd1cmF0aW9uXzQucmV0dXJuKSkgX2EuY2FsbChjb25maWd1cmF0aW9uXzQpO1xuICAgIH0gZmluYWxseSB7XG4gICAgICBpZiAoZV81KSB0aHJvdyBlXzUuZXJyb3I7XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIGFkakxpc3Q7XG59XG5cbmZ1bmN0aW9uIGdldFZhbHVlKHJvb3ROb2RlLCBjb25maWd1cmF0aW9uKSB7XG4gIHZhciBjb25maWcgPSBnZXRDb25maWd1cmF0aW9uKFtyb290Tm9kZV0sIGNvbmZpZ3VyYXRpb24pO1xuICByZXR1cm4gZ2V0VmFsdWVGcm9tQWRqKHJvb3ROb2RlLCBnZXRBZGpMaXN0KGNvbmZpZykpO1xufVxuXG5mdW5jdGlvbiBoYXMoaXRlcmFibGUsIGl0ZW0pIHtcbiAgaWYgKEFycmF5LmlzQXJyYXkoaXRlcmFibGUpKSB7XG4gICAgcmV0dXJuIGl0ZXJhYmxlLnNvbWUoZnVuY3Rpb24gKG1lbWJlcikge1xuICAgICAgcmV0dXJuIG1lbWJlciA9PT0gaXRlbTtcbiAgICB9KTtcbiAgfVxuXG4gIGlmIChpdGVyYWJsZSBpbnN0YW5jZW9mIFNldCkge1xuICAgIHJldHVybiBpdGVyYWJsZS5oYXMoaXRlbSk7XG4gIH1cblxuICByZXR1cm4gZmFsc2U7IC8vIFRPRE86IGZpeFxufVxuXG5mdW5jdGlvbiBuZXh0RXZlbnRzKGNvbmZpZ3VyYXRpb24pIHtcbiAgcmV0dXJuIGZsYXR0ZW4oX19zcHJlYWQobmV3IFNldChjb25maWd1cmF0aW9uLm1hcChmdW5jdGlvbiAoc24pIHtcbiAgICByZXR1cm4gc24ub3duRXZlbnRzO1xuICB9KSkpKTtcbn1cblxuZnVuY3Rpb24gaXNJbkZpbmFsU3RhdGUoY29uZmlndXJhdGlvbiwgc3RhdGVOb2RlKSB7XG4gIGlmIChzdGF0ZU5vZGUudHlwZSA9PT0gJ2NvbXBvdW5kJykge1xuICAgIHJldHVybiBnZXRDaGlsZHJlbihzdGF0ZU5vZGUpLnNvbWUoZnVuY3Rpb24gKHMpIHtcbiAgICAgIHJldHVybiBzLnR5cGUgPT09ICdmaW5hbCcgJiYgaGFzKGNvbmZpZ3VyYXRpb24sIHMpO1xuICAgIH0pO1xuICB9XG5cbiAgaWYgKHN0YXRlTm9kZS50eXBlID09PSAncGFyYWxsZWwnKSB7XG4gICAgcmV0dXJuIGdldENoaWxkcmVuKHN0YXRlTm9kZSkuZXZlcnkoZnVuY3Rpb24gKHNuKSB7XG4gICAgICByZXR1cm4gaXNJbkZpbmFsU3RhdGUoY29uZmlndXJhdGlvbiwgc24pO1xuICAgIH0pO1xuICB9XG5cbiAgcmV0dXJuIGZhbHNlO1xufVxuXG5leHBvcnQgeyBnZXRBZGpMaXN0LCBnZXRBbGxTdGF0ZU5vZGVzLCBnZXRDaGlsZHJlbiwgZ2V0Q29uZmlndXJhdGlvbiwgZ2V0VmFsdWUsIGhhcywgaXNJbkZpbmFsU3RhdGUsIGlzTGVhZk5vZGUsIG5leHRFdmVudHMgfTsiLCJpbXBvcnQgeyBfX3NwcmVhZCwgX19yZXN0LCBfX2Fzc2lnbiB9IGZyb20gJy4vX3ZpcnR1YWwvX3RzbGliLmpzJztcbmltcG9ydCB7IEVNUFRZX0FDVElWSVRZX01BUCB9IGZyb20gJy4vY29uc3RhbnRzLmpzJztcbmltcG9ydCB7IGlzU3RyaW5nLCBtYXRjaGVzU3RhdGUsIGtleXMgfSBmcm9tICcuL3V0aWxzLmpzJztcbmltcG9ydCB7IG5leHRFdmVudHMgfSBmcm9tICcuL3N0YXRlVXRpbHMuanMnO1xuaW1wb3J0IHsgaW5pdEV2ZW50IH0gZnJvbSAnLi9hY3Rpb25zLmpzJztcblxuZnVuY3Rpb24gc3RhdGVWYWx1ZXNFcXVhbChhLCBiKSB7XG4gIGlmIChhID09PSBiKSB7XG4gICAgcmV0dXJuIHRydWU7XG4gIH1cblxuICBpZiAoYSA9PT0gdW5kZWZpbmVkIHx8IGIgPT09IHVuZGVmaW5lZCkge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIGlmIChpc1N0cmluZyhhKSB8fCBpc1N0cmluZyhiKSkge1xuICAgIHJldHVybiBhID09PSBiO1xuICB9XG5cbiAgdmFyIGFLZXlzID0ga2V5cyhhKTtcbiAgdmFyIGJLZXlzID0ga2V5cyhiKTtcbiAgcmV0dXJuIGFLZXlzLmxlbmd0aCA9PT0gYktleXMubGVuZ3RoICYmIGFLZXlzLmV2ZXJ5KGZ1bmN0aW9uIChrZXkpIHtcbiAgICByZXR1cm4gc3RhdGVWYWx1ZXNFcXVhbChhW2tleV0sIGJba2V5XSk7XG4gIH0pO1xufVxuXG5mdW5jdGlvbiBpc1N0YXRlKHN0YXRlKSB7XG4gIGlmIChpc1N0cmluZyhzdGF0ZSkpIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICByZXR1cm4gJ3ZhbHVlJyBpbiBzdGF0ZSAmJiAnaGlzdG9yeScgaW4gc3RhdGU7XG59XG5cbmZ1bmN0aW9uIGJpbmRBY3Rpb25Ub1N0YXRlKGFjdGlvbiwgc3RhdGUpIHtcbiAgdmFyIGV4ZWMgPSBhY3Rpb24uZXhlYztcblxuICB2YXIgYm91bmRBY3Rpb24gPSBfX2Fzc2lnbihfX2Fzc2lnbih7fSwgYWN0aW9uKSwge1xuICAgIGV4ZWM6IGV4ZWMgIT09IHVuZGVmaW5lZCA/IGZ1bmN0aW9uICgpIHtcbiAgICAgIHJldHVybiBleGVjKHN0YXRlLmNvbnRleHQsIHN0YXRlLmV2ZW50LCB7XG4gICAgICAgIGFjdGlvbjogYWN0aW9uLFxuICAgICAgICBzdGF0ZTogc3RhdGUsXG4gICAgICAgIF9ldmVudDogc3RhdGUuX2V2ZW50XG4gICAgICB9KTtcbiAgICB9IDogdW5kZWZpbmVkXG4gIH0pO1xuXG4gIHJldHVybiBib3VuZEFjdGlvbjtcbn1cblxudmFyIFN0YXRlID1cbi8qI19fUFVSRV9fKi9cblxuLyoqIEBjbGFzcyAqL1xuZnVuY3Rpb24gKCkge1xuICAvKipcclxuICAgKiBDcmVhdGVzIGEgbmV3IFN0YXRlIGluc3RhbmNlLlxyXG4gICAqIEBwYXJhbSB2YWx1ZSBUaGUgc3RhdGUgdmFsdWVcclxuICAgKiBAcGFyYW0gY29udGV4dCBUaGUgZXh0ZW5kZWQgc3RhdGVcclxuICAgKiBAcGFyYW0gaGlzdG9yeVZhbHVlIFRoZSB0cmVlIHJlcHJlc2VudGluZyBoaXN0b3JpY2FsIHZhbHVlcyBvZiB0aGUgc3RhdGUgbm9kZXNcclxuICAgKiBAcGFyYW0gaGlzdG9yeSBUaGUgcHJldmlvdXMgc3RhdGVcclxuICAgKiBAcGFyYW0gYWN0aW9ucyBBbiBhcnJheSBvZiBhY3Rpb24gb2JqZWN0cyB0byBleGVjdXRlIGFzIHNpZGUtZWZmZWN0c1xyXG4gICAqIEBwYXJhbSBhY3Rpdml0aWVzIEEgbWFwcGluZyBvZiBhY3Rpdml0aWVzIGFuZCB3aGV0aGVyIHRoZXkgYXJlIHN0YXJ0ZWQgKGB0cnVlYCkgb3Igc3RvcHBlZCAoYGZhbHNlYCkuXHJcbiAgICogQHBhcmFtIG1ldGFcclxuICAgKiBAcGFyYW0gZXZlbnRzIEludGVybmFsIGV2ZW50IHF1ZXVlLiBTaG91bGQgYmUgZW1wdHkgd2l0aCBydW4tdG8tY29tcGxldGlvbiBzZW1hbnRpY3MuXHJcbiAgICogQHBhcmFtIGNvbmZpZ3VyYXRpb25cclxuICAgKi9cbiAgZnVuY3Rpb24gU3RhdGUoY29uZmlnKSB7XG4gICAgdmFyIF90aGlzID0gdGhpcztcblxuICAgIHRoaXMuYWN0aW9ucyA9IFtdO1xuICAgIHRoaXMuYWN0aXZpdGllcyA9IEVNUFRZX0FDVElWSVRZX01BUDtcbiAgICB0aGlzLm1ldGEgPSB7fTtcbiAgICB0aGlzLmV2ZW50cyA9IFtdO1xuICAgIHRoaXMudmFsdWUgPSBjb25maWcudmFsdWU7XG4gICAgdGhpcy5jb250ZXh0ID0gY29uZmlnLmNvbnRleHQ7XG4gICAgdGhpcy5fZXZlbnQgPSBjb25maWcuX2V2ZW50O1xuICAgIHRoaXMuX3Nlc3Npb25pZCA9IGNvbmZpZy5fc2Vzc2lvbmlkO1xuICAgIHRoaXMuZXZlbnQgPSB0aGlzLl9ldmVudC5kYXRhO1xuICAgIHRoaXMuaGlzdG9yeVZhbHVlID0gY29uZmlnLmhpc3RvcnlWYWx1ZTtcbiAgICB0aGlzLmhpc3RvcnkgPSBjb25maWcuaGlzdG9yeTtcbiAgICB0aGlzLmFjdGlvbnMgPSBjb25maWcuYWN0aW9ucyB8fCBbXTtcbiAgICB0aGlzLmFjdGl2aXRpZXMgPSBjb25maWcuYWN0aXZpdGllcyB8fCBFTVBUWV9BQ1RJVklUWV9NQVA7XG4gICAgdGhpcy5tZXRhID0gY29uZmlnLm1ldGEgfHwge307XG4gICAgdGhpcy5ldmVudHMgPSBjb25maWcuZXZlbnRzIHx8IFtdO1xuICAgIHRoaXMubWF0Y2hlcyA9IHRoaXMubWF0Y2hlcy5iaW5kKHRoaXMpO1xuICAgIHRoaXMudG9TdHJpbmdzID0gdGhpcy50b1N0cmluZ3MuYmluZCh0aGlzKTtcbiAgICB0aGlzLmNvbmZpZ3VyYXRpb24gPSBjb25maWcuY29uZmlndXJhdGlvbjtcbiAgICB0aGlzLnRyYW5zaXRpb25zID0gY29uZmlnLnRyYW5zaXRpb25zO1xuICAgIHRoaXMuY2hpbGRyZW4gPSBjb25maWcuY2hpbGRyZW47XG4gICAgdGhpcy5kb25lID0gISFjb25maWcuZG9uZTtcbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkodGhpcywgJ25leHRFdmVudHMnLCB7XG4gICAgICBnZXQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmV0dXJuIG5leHRFdmVudHMoX3RoaXMuY29uZmlndXJhdGlvbik7XG4gICAgICB9XG4gICAgfSk7XG4gIH1cbiAgLyoqXHJcbiAgICogQ3JlYXRlcyBhIG5ldyBTdGF0ZSBpbnN0YW5jZSBmb3IgdGhlIGdpdmVuIGBzdGF0ZVZhbHVlYCBhbmQgYGNvbnRleHRgLlxyXG4gICAqIEBwYXJhbSBzdGF0ZVZhbHVlXHJcbiAgICogQHBhcmFtIGNvbnRleHRcclxuICAgKi9cblxuXG4gIFN0YXRlLmZyb20gPSBmdW5jdGlvbiAoc3RhdGVWYWx1ZSwgY29udGV4dCkge1xuICAgIGlmIChzdGF0ZVZhbHVlIGluc3RhbmNlb2YgU3RhdGUpIHtcbiAgICAgIGlmIChzdGF0ZVZhbHVlLmNvbnRleHQgIT09IGNvbnRleHQpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBTdGF0ZSh7XG4gICAgICAgICAgdmFsdWU6IHN0YXRlVmFsdWUudmFsdWUsXG4gICAgICAgICAgY29udGV4dDogY29udGV4dCxcbiAgICAgICAgICBfZXZlbnQ6IHN0YXRlVmFsdWUuX2V2ZW50LFxuICAgICAgICAgIF9zZXNzaW9uaWQ6IG51bGwsXG4gICAgICAgICAgaGlzdG9yeVZhbHVlOiBzdGF0ZVZhbHVlLmhpc3RvcnlWYWx1ZSxcbiAgICAgICAgICBoaXN0b3J5OiBzdGF0ZVZhbHVlLmhpc3RvcnksXG4gICAgICAgICAgYWN0aW9uczogW10sXG4gICAgICAgICAgYWN0aXZpdGllczogc3RhdGVWYWx1ZS5hY3Rpdml0aWVzLFxuICAgICAgICAgIG1ldGE6IHt9LFxuICAgICAgICAgIGV2ZW50czogW10sXG4gICAgICAgICAgY29uZmlndXJhdGlvbjogW10sXG4gICAgICAgICAgdHJhbnNpdGlvbnM6IFtdLFxuICAgICAgICAgIGNoaWxkcmVuOiB7fVxuICAgICAgICB9KTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHN0YXRlVmFsdWU7XG4gICAgfVxuXG4gICAgdmFyIF9ldmVudCA9IGluaXRFdmVudDtcbiAgICByZXR1cm4gbmV3IFN0YXRlKHtcbiAgICAgIHZhbHVlOiBzdGF0ZVZhbHVlLFxuICAgICAgY29udGV4dDogY29udGV4dCxcbiAgICAgIF9ldmVudDogX2V2ZW50LFxuICAgICAgX3Nlc3Npb25pZDogbnVsbCxcbiAgICAgIGhpc3RvcnlWYWx1ZTogdW5kZWZpbmVkLFxuICAgICAgaGlzdG9yeTogdW5kZWZpbmVkLFxuICAgICAgYWN0aW9uczogW10sXG4gICAgICBhY3Rpdml0aWVzOiB1bmRlZmluZWQsXG4gICAgICBtZXRhOiB1bmRlZmluZWQsXG4gICAgICBldmVudHM6IFtdLFxuICAgICAgY29uZmlndXJhdGlvbjogW10sXG4gICAgICB0cmFuc2l0aW9uczogW10sXG4gICAgICBjaGlsZHJlbjoge31cbiAgICB9KTtcbiAgfTtcbiAgLyoqXHJcbiAgICogQ3JlYXRlcyBhIG5ldyBTdGF0ZSBpbnN0YW5jZSBmb3IgdGhlIGdpdmVuIGBjb25maWdgLlxyXG4gICAqIEBwYXJhbSBjb25maWcgVGhlIHN0YXRlIGNvbmZpZ1xyXG4gICAqL1xuXG5cbiAgU3RhdGUuY3JlYXRlID0gZnVuY3Rpb24gKGNvbmZpZykge1xuICAgIHJldHVybiBuZXcgU3RhdGUoY29uZmlnKTtcbiAgfTtcbiAgLyoqXHJcbiAgICogQ3JlYXRlcyBhIG5ldyBgU3RhdGVgIGluc3RhbmNlIGZvciB0aGUgZ2l2ZW4gYHN0YXRlVmFsdWVgIGFuZCBgY29udGV4dGAgd2l0aCBubyBhY3Rpb25zIChzaWRlLWVmZmVjdHMpLlxyXG4gICAqIEBwYXJhbSBzdGF0ZVZhbHVlXHJcbiAgICogQHBhcmFtIGNvbnRleHRcclxuICAgKi9cblxuXG4gIFN0YXRlLmluZXJ0ID0gZnVuY3Rpb24gKHN0YXRlVmFsdWUsIGNvbnRleHQpIHtcbiAgICBpZiAoc3RhdGVWYWx1ZSBpbnN0YW5jZW9mIFN0YXRlKSB7XG4gICAgICBpZiAoIXN0YXRlVmFsdWUuYWN0aW9ucy5sZW5ndGgpIHtcbiAgICAgICAgcmV0dXJuIHN0YXRlVmFsdWU7XG4gICAgICB9XG5cbiAgICAgIHZhciBfZXZlbnQgPSBpbml0RXZlbnQ7XG4gICAgICByZXR1cm4gbmV3IFN0YXRlKHtcbiAgICAgICAgdmFsdWU6IHN0YXRlVmFsdWUudmFsdWUsXG4gICAgICAgIGNvbnRleHQ6IGNvbnRleHQsXG4gICAgICAgIF9ldmVudDogX2V2ZW50LFxuICAgICAgICBfc2Vzc2lvbmlkOiBudWxsLFxuICAgICAgICBoaXN0b3J5VmFsdWU6IHN0YXRlVmFsdWUuaGlzdG9yeVZhbHVlLFxuICAgICAgICBoaXN0b3J5OiBzdGF0ZVZhbHVlLmhpc3RvcnksXG4gICAgICAgIGFjdGl2aXRpZXM6IHN0YXRlVmFsdWUuYWN0aXZpdGllcyxcbiAgICAgICAgY29uZmlndXJhdGlvbjogc3RhdGVWYWx1ZS5jb25maWd1cmF0aW9uLFxuICAgICAgICB0cmFuc2l0aW9uczogW10sXG4gICAgICAgIGNoaWxkcmVuOiB7fVxuICAgICAgfSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIFN0YXRlLmZyb20oc3RhdGVWYWx1ZSwgY29udGV4dCk7XG4gIH07XG4gIC8qKlxyXG4gICAqIFJldHVybnMgYW4gYXJyYXkgb2YgYWxsIHRoZSBzdHJpbmcgbGVhZiBzdGF0ZSBub2RlIHBhdGhzLlxyXG4gICAqIEBwYXJhbSBzdGF0ZVZhbHVlXHJcbiAgICogQHBhcmFtIGRlbGltaXRlciBUaGUgY2hhcmFjdGVyKHMpIHRoYXQgc2VwYXJhdGUgZWFjaCBzdWJwYXRoIGluIHRoZSBzdHJpbmcgc3RhdGUgbm9kZSBwYXRoLlxyXG4gICAqL1xuXG5cbiAgU3RhdGUucHJvdG90eXBlLnRvU3RyaW5ncyA9IGZ1bmN0aW9uIChzdGF0ZVZhbHVlLCBkZWxpbWl0ZXIpIHtcbiAgICB2YXIgX3RoaXMgPSB0aGlzO1xuXG4gICAgaWYgKHN0YXRlVmFsdWUgPT09IHZvaWQgMCkge1xuICAgICAgc3RhdGVWYWx1ZSA9IHRoaXMudmFsdWU7XG4gICAgfVxuXG4gICAgaWYgKGRlbGltaXRlciA9PT0gdm9pZCAwKSB7XG4gICAgICBkZWxpbWl0ZXIgPSAnLic7XG4gICAgfVxuXG4gICAgaWYgKGlzU3RyaW5nKHN0YXRlVmFsdWUpKSB7XG4gICAgICByZXR1cm4gW3N0YXRlVmFsdWVdO1xuICAgIH1cblxuICAgIHZhciB2YWx1ZUtleXMgPSBrZXlzKHN0YXRlVmFsdWUpO1xuICAgIHJldHVybiB2YWx1ZUtleXMuY29uY2F0LmFwcGx5KHZhbHVlS2V5cywgX19zcHJlYWQodmFsdWVLZXlzLm1hcChmdW5jdGlvbiAoa2V5KSB7XG4gICAgICByZXR1cm4gX3RoaXMudG9TdHJpbmdzKHN0YXRlVmFsdWVba2V5XSwgZGVsaW1pdGVyKS5tYXAoZnVuY3Rpb24gKHMpIHtcbiAgICAgICAgcmV0dXJuIGtleSArIGRlbGltaXRlciArIHM7XG4gICAgICB9KTtcbiAgICB9KSkpO1xuICB9O1xuXG4gIFN0YXRlLnByb3RvdHlwZS50b0pTT04gPSBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIF9hID0gdGhpcyxcbiAgICAgICAgY29uZmlndXJhdGlvbiA9IF9hLmNvbmZpZ3VyYXRpb24sXG4gICAgICAgIHRyYW5zaXRpb25zID0gX2EudHJhbnNpdGlvbnMsXG4gICAgICAgIGpzb25WYWx1ZXMgPSBfX3Jlc3QoX2EsIFtcImNvbmZpZ3VyYXRpb25cIiwgXCJ0cmFuc2l0aW9uc1wiXSk7XG5cbiAgICByZXR1cm4ganNvblZhbHVlcztcbiAgfTtcbiAgLyoqXHJcbiAgICogV2hldGhlciB0aGUgY3VycmVudCBzdGF0ZSB2YWx1ZSBpcyBhIHN1YnNldCBvZiB0aGUgZ2l2ZW4gcGFyZW50IHN0YXRlIHZhbHVlLlxyXG4gICAqIEBwYXJhbSBwYXJlbnRTdGF0ZVZhbHVlXHJcbiAgICovXG5cblxuICBTdGF0ZS5wcm90b3R5cGUubWF0Y2hlcyA9IGZ1bmN0aW9uIChwYXJlbnRTdGF0ZVZhbHVlKSB7XG4gICAgcmV0dXJuIG1hdGNoZXNTdGF0ZShwYXJlbnRTdGF0ZVZhbHVlLCB0aGlzLnZhbHVlKTtcbiAgfTtcblxuICByZXR1cm4gU3RhdGU7XG59KCk7XG5cbmV4cG9ydCB7IFN0YXRlLCBiaW5kQWN0aW9uVG9TdGF0ZSwgaXNTdGF0ZSwgc3RhdGVWYWx1ZXNFcXVhbCB9OyIsIi8qKlxyXG4gKiBNYWludGFpbnMgYSBzdGFjayBvZiB0aGUgY3VycmVudCBzZXJ2aWNlIGluIHNjb3BlLlxyXG4gKiBUaGlzIGlzIHVzZWQgdG8gcHJvdmlkZSB0aGUgY29ycmVjdCBzZXJ2aWNlIHRvIHNwYXduKCkuXHJcbiAqL1xudmFyIHNlcnZpY2VTdGFjayA9IFtdO1xuXG52YXIgcHJvdmlkZSA9IGZ1bmN0aW9uIChzZXJ2aWNlLCBmbikge1xuICBzZXJ2aWNlU3RhY2sucHVzaChzZXJ2aWNlKTtcbiAgdmFyIHJlc3VsdCA9IGZuKHNlcnZpY2UpO1xuICBzZXJ2aWNlU3RhY2sucG9wKCk7XG4gIHJldHVybiByZXN1bHQ7XG59O1xuXG52YXIgY29uc3VtZSA9IGZ1bmN0aW9uIChmbikge1xuICByZXR1cm4gZm4oc2VydmljZVN0YWNrW3NlcnZpY2VTdGFjay5sZW5ndGggLSAxXSk7XG59O1xuXG5leHBvcnQgeyBjb25zdW1lLCBwcm92aWRlIH07IiwiaW1wb3J0IHsgdG9JbnZva2VTb3VyY2UsIG1hcENvbnRleHQsIGlzTWFjaGluZSB9IGZyb20gJy4vdXRpbHMuanMnO1xuaW1wb3J0IHsgcHJvdmlkZSB9IGZyb20gJy4vc2VydmljZVNjb3BlLmpzJztcblxuZnVuY3Rpb24gY3JlYXRlTnVsbEFjdG9yKGlkKSB7XG4gIHJldHVybiB7XG4gICAgaWQ6IGlkLFxuICAgIHNlbmQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgIHJldHVybiB2b2lkIDA7XG4gICAgfSxcbiAgICBzdWJzY3JpYmU6IGZ1bmN0aW9uICgpIHtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIHVuc3Vic2NyaWJlOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgcmV0dXJuIHZvaWQgMDtcbiAgICAgICAgfVxuICAgICAgfTtcbiAgICB9LFxuICAgIHRvSlNPTjogZnVuY3Rpb24gKCkge1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgaWQ6IGlkXG4gICAgICB9O1xuICAgIH1cbiAgfTtcbn1cbi8qKlxyXG4gKiBDcmVhdGVzIGEgZGVmZXJyZWQgYWN0b3IgdGhhdCBpcyBhYmxlIHRvIGJlIGludm9rZWQgZ2l2ZW4gdGhlIHByb3ZpZGVkXHJcbiAqIGludm9jYXRpb24gaW5mb3JtYXRpb24gaW4gaXRzIGAubWV0YWAgdmFsdWUuXHJcbiAqXHJcbiAqIEBwYXJhbSBpbnZva2VEZWZpbml0aW9uIFRoZSBtZXRhIGluZm9ybWF0aW9uIG5lZWRlZCB0byBpbnZva2UgdGhlIGFjdG9yLlxyXG4gKi9cblxuXG5mdW5jdGlvbiBjcmVhdGVJbnZvY2FibGVBY3RvcihpbnZva2VEZWZpbml0aW9uLCBtYWNoaW5lLCBjb250ZXh0LCBfZXZlbnQpIHtcbiAgdmFyIF9hO1xuXG4gIHZhciBpbnZva2VTcmMgPSB0b0ludm9rZVNvdXJjZShpbnZva2VEZWZpbml0aW9uLnNyYyk7XG4gIHZhciBzZXJ2aWNlQ3JlYXRvciA9IChfYSA9IG1hY2hpbmUgPT09IG51bGwgfHwgbWFjaGluZSA9PT0gdm9pZCAwID8gdm9pZCAwIDogbWFjaGluZS5vcHRpb25zLnNlcnZpY2VzKSA9PT0gbnVsbCB8fCBfYSA9PT0gdm9pZCAwID8gdm9pZCAwIDogX2FbaW52b2tlU3JjLnR5cGVdO1xuICB2YXIgcmVzb2x2ZWREYXRhID0gaW52b2tlRGVmaW5pdGlvbi5kYXRhID8gbWFwQ29udGV4dChpbnZva2VEZWZpbml0aW9uLmRhdGEsIGNvbnRleHQsIF9ldmVudCkgOiB1bmRlZmluZWQ7XG4gIHZhciB0ZW1wQWN0b3IgPSBzZXJ2aWNlQ3JlYXRvciA/IGNyZWF0ZURlZmVycmVkQWN0b3Ioc2VydmljZUNyZWF0b3IsIGludm9rZURlZmluaXRpb24uaWQsIHJlc29sdmVkRGF0YSkgOiBjcmVhdGVOdWxsQWN0b3IoaW52b2tlRGVmaW5pdGlvbi5pZCk7XG4gIHRlbXBBY3Rvci5tZXRhID0gaW52b2tlRGVmaW5pdGlvbjtcbiAgcmV0dXJuIHRlbXBBY3Rvcjtcbn1cblxuZnVuY3Rpb24gY3JlYXRlRGVmZXJyZWRBY3RvcihlbnRpdHksIGlkLCBkYXRhKSB7XG4gIHZhciB0ZW1wQWN0b3IgPSBjcmVhdGVOdWxsQWN0b3IoaWQpO1xuICB0ZW1wQWN0b3IuZGVmZXJyZWQgPSB0cnVlO1xuXG4gIGlmIChpc01hY2hpbmUoZW50aXR5KSkge1xuICAgIC8vIFwibXV0ZVwiIHRoZSBleGlzdGluZyBzZXJ2aWNlIHNjb3BlIHNvIHBvdGVudGlhbCBzcGF3bmVkIGFjdG9ycyB3aXRoaW4gdGhlIGAuaW5pdGlhbFN0YXRlYCBzdGF5IGRlZmVycmVkIGhlcmVcbiAgICB0ZW1wQWN0b3Iuc3RhdGUgPSBwcm92aWRlKHVuZGVmaW5lZCwgZnVuY3Rpb24gKCkge1xuICAgICAgcmV0dXJuIChkYXRhID8gZW50aXR5LndpdGhDb250ZXh0KGRhdGEpIDogZW50aXR5KS5pbml0aWFsU3RhdGU7XG4gICAgfSk7XG4gIH1cblxuICByZXR1cm4gdGVtcEFjdG9yO1xufVxuXG5mdW5jdGlvbiBpc0FjdG9yKGl0ZW0pIHtcbiAgdHJ5IHtcbiAgICByZXR1cm4gdHlwZW9mIGl0ZW0uc2VuZCA9PT0gJ2Z1bmN0aW9uJztcbiAgfSBjYXRjaCAoZSkge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxufVxuXG5mdW5jdGlvbiBpc1NwYXduZWRBY3RvcihpdGVtKSB7XG4gIHJldHVybiBpc0FjdG9yKGl0ZW0pICYmICdpZCcgaW4gaXRlbTtcbn1cblxuZXhwb3J0IHsgY3JlYXRlRGVmZXJyZWRBY3RvciwgY3JlYXRlSW52b2NhYmxlQWN0b3IsIGNyZWF0ZU51bGxBY3RvciwgaXNBY3RvciwgaXNTcGF3bmVkQWN0b3IgfTsiLCJpbXBvcnQgeyBfX2Fzc2lnbiwgX19yZXN0IH0gZnJvbSAnLi9fdmlydHVhbC9fdHNsaWIuanMnO1xuaW1wb3J0IHsgaW52b2tlIH0gZnJvbSAnLi9hY3Rpb25UeXBlcy5qcyc7XG5pbXBvcnQgJy4vYWN0aW9ucy5qcyc7XG5cbmZ1bmN0aW9uIHRvSW52b2tlU291cmNlKHNyYykge1xuICBpZiAodHlwZW9mIHNyYyA9PT0gJ3N0cmluZycpIHtcbiAgICB2YXIgc2ltcGxlU3JjID0ge1xuICAgICAgdHlwZTogc3JjXG4gICAgfTtcblxuICAgIHNpbXBsZVNyYy50b1N0cmluZyA9IGZ1bmN0aW9uICgpIHtcbiAgICAgIHJldHVybiBzcmM7XG4gICAgfTsgLy8gdjQgY29tcGF0IC0gVE9ETzogcmVtb3ZlIGluIHY1XG5cblxuICAgIHJldHVybiBzaW1wbGVTcmM7XG4gIH1cblxuICByZXR1cm4gc3JjO1xufVxuXG5mdW5jdGlvbiB0b0ludm9rZURlZmluaXRpb24oaW52b2tlQ29uZmlnKSB7XG4gIHJldHVybiBfX2Fzc2lnbihfX2Fzc2lnbih7XG4gICAgdHlwZTogaW52b2tlXG4gIH0sIGludm9rZUNvbmZpZyksIHtcbiAgICB0b0pTT046IGZ1bmN0aW9uICgpIHtcbiAgICAgIHZhciBvbkRvbmUgPSBpbnZva2VDb25maWcub25Eb25lLFxuICAgICAgICAgIG9uRXJyb3IgPSBpbnZva2VDb25maWcub25FcnJvcixcbiAgICAgICAgICBpbnZva2VEZWYgPSBfX3Jlc3QoaW52b2tlQ29uZmlnLCBbXCJvbkRvbmVcIiwgXCJvbkVycm9yXCJdKTtcblxuICAgICAgcmV0dXJuIF9fYXNzaWduKF9fYXNzaWduKHt9LCBpbnZva2VEZWYpLCB7XG4gICAgICAgIHR5cGU6IGludm9rZSxcbiAgICAgICAgc3JjOiB0b0ludm9rZVNvdXJjZShpbnZva2VDb25maWcuc3JjKVxuICAgICAgfSk7XG4gICAgfVxuICB9KTtcbn1cblxuZXhwb3J0IHsgdG9JbnZva2VEZWZpbml0aW9uLCB0b0ludm9rZVNvdXJjZSB9OyIsImltcG9ydCB7IF9fYXNzaWduLCBfX3ZhbHVlcywgX19zcHJlYWQsIF9fcmVhZCwgX19yZXN0IH0gZnJvbSAnLi9fdmlydHVhbC9fdHNsaWIuanMnO1xuaW1wb3J0IHsgU1RBVEVfREVMSU1JVEVSIH0gZnJvbSAnLi9jb25zdGFudHMuanMnO1xuaW1wb3J0IHsgSVNfUFJPRFVDVElPTiB9IGZyb20gJy4vZW52aXJvbm1lbnQuanMnO1xuaW1wb3J0IHsgbWFwVmFsdWVzLCBpc0FycmF5LCBmbGF0dGVuLCBrZXlzLCB0b0FycmF5LCB0b1N0YXRlVmFsdWUsIGlzU3RyaW5nLCBnZXRFdmVudFR5cGUsIG1hdGNoZXNTdGF0ZSwgcGF0aCwgZXZhbHVhdGVHdWFyZCwgbWFwQ29udGV4dCwgdG9TQ1hNTEV2ZW50LCBwYXRoVG9TdGF0ZVZhbHVlLCBpc0J1aWx0SW5FdmVudCwgcGFydGl0aW9uLCB1cGRhdGVIaXN0b3J5VmFsdWUsIHRvU3RhdGVQYXRoLCBtYXBGaWx0ZXJWYWx1ZXMsIHdhcm4sIHRvU3RhdGVQYXRocywgbmVzdGVkUGF0aCwgbm9ybWFsaXplVGFyZ2V0LCB0b0d1YXJkLCB0b1RyYW5zaXRpb25Db25maWdBcnJheSwgaXNNYWNoaW5lLCBpc0Z1bmN0aW9uIH0gZnJvbSAnLi91dGlscy5qcyc7XG5pbXBvcnQgeyBTcGVjaWFsVGFyZ2V0cyB9IGZyb20gJy4vdHlwZXMuanMnO1xuaW1wb3J0IHsgZ2V0QWxsU3RhdGVOb2RlcywgZ2V0Q29uZmlndXJhdGlvbiwgaXNJbkZpbmFsU3RhdGUsIGhhcywgZ2V0Q2hpbGRyZW4sIGdldFZhbHVlLCBpc0xlYWZOb2RlIH0gZnJvbSAnLi9zdGF0ZVV0aWxzLmpzJztcbmltcG9ydCB7IHN0YXJ0IGFzIHN0YXJ0JDEsIHN0b3AgYXMgc3RvcCQxLCBpbnZva2UsIHVwZGF0ZSwgbnVsbEV2ZW50LCByYWlzZSBhcyByYWlzZSQxLCBzZW5kIGFzIHNlbmQkMSB9IGZyb20gJy4vYWN0aW9uVHlwZXMuanMnO1xuaW1wb3J0IHsgZG9uZSwgc3RhcnQsIHJhaXNlLCBzdG9wLCB0b0FjdGlvbk9iamVjdHMsIHJlc29sdmVBY3Rpb25zLCBkb25lSW52b2tlLCBlcnJvciwgdG9BY3Rpb25PYmplY3QsIHRvQWN0aXZpdHlEZWZpbml0aW9uLCBhZnRlciwgc2VuZCwgY2FuY2VsLCBpbml0RXZlbnQgfSBmcm9tICcuL2FjdGlvbnMuanMnO1xuaW1wb3J0IHsgU3RhdGUsIHN0YXRlVmFsdWVzRXF1YWwgfSBmcm9tICcuL1N0YXRlLmpzJztcbmltcG9ydCB7IGNyZWF0ZUludm9jYWJsZUFjdG9yIH0gZnJvbSAnLi9BY3Rvci5qcyc7XG5pbXBvcnQgeyB0b0ludm9rZURlZmluaXRpb24gfSBmcm9tICcuL2ludm9rZVV0aWxzLmpzJztcbnZhciBOVUxMX0VWRU5UID0gJyc7XG52YXIgU1RBVEVfSURFTlRJRklFUiA9ICcjJztcbnZhciBXSUxEQ0FSRCA9ICcqJztcbnZhciBFTVBUWV9PQkpFQ1QgPSB7fTtcblxudmFyIGlzU3RhdGVJZCA9IGZ1bmN0aW9uIChzdHIpIHtcbiAgcmV0dXJuIHN0clswXSA9PT0gU1RBVEVfSURFTlRJRklFUjtcbn07XG5cbnZhciBjcmVhdGVEZWZhdWx0T3B0aW9ucyA9IGZ1bmN0aW9uICgpIHtcbiAgcmV0dXJuIHtcbiAgICBhY3Rpb25zOiB7fSxcbiAgICBndWFyZHM6IHt9LFxuICAgIHNlcnZpY2VzOiB7fSxcbiAgICBhY3Rpdml0aWVzOiB7fSxcbiAgICBkZWxheXM6IHt9XG4gIH07XG59O1xuXG52YXIgdmFsaWRhdGVBcnJheWlmaWVkVHJhbnNpdGlvbnMgPSBmdW5jdGlvbiAoc3RhdGVOb2RlLCBldmVudCwgdHJhbnNpdGlvbnMpIHtcbiAgdmFyIGhhc05vbkxhc3RVbmd1YXJkZWRUYXJnZXQgPSB0cmFuc2l0aW9ucy5zbGljZSgwLCAtMSkuc29tZShmdW5jdGlvbiAodHJhbnNpdGlvbikge1xuICAgIHJldHVybiAhKCdjb25kJyBpbiB0cmFuc2l0aW9uKSAmJiAhKCdpbicgaW4gdHJhbnNpdGlvbikgJiYgKGlzU3RyaW5nKHRyYW5zaXRpb24udGFyZ2V0KSB8fCBpc01hY2hpbmUodHJhbnNpdGlvbi50YXJnZXQpKTtcbiAgfSk7XG4gIHZhciBldmVudFRleHQgPSBldmVudCA9PT0gTlVMTF9FVkVOVCA/ICd0aGUgdHJhbnNpZW50IGV2ZW50JyA6IFwiZXZlbnQgJ1wiICsgZXZlbnQgKyBcIidcIjtcbiAgd2FybighaGFzTm9uTGFzdFVuZ3VhcmRlZFRhcmdldCwgXCJPbmUgb3IgbW9yZSB0cmFuc2l0aW9ucyBmb3IgXCIgKyBldmVudFRleHQgKyBcIiBvbiBzdGF0ZSAnXCIgKyBzdGF0ZU5vZGUuaWQgKyBcIicgYXJlIHVucmVhY2hhYmxlLiBcIiArIFwiTWFrZSBzdXJlIHRoYXQgdGhlIGRlZmF1bHQgdHJhbnNpdGlvbiBpcyB0aGUgbGFzdCBvbmUgZGVmaW5lZC5cIik7XG59O1xuXG52YXIgU3RhdGVOb2RlID1cbi8qI19fUFVSRV9fKi9cblxuLyoqIEBjbGFzcyAqL1xuZnVuY3Rpb24gKCkge1xuICBmdW5jdGlvbiBTdGF0ZU5vZGUoXG4gIC8qKlxyXG4gICAqIFRoZSByYXcgY29uZmlnIHVzZWQgdG8gY3JlYXRlIHRoZSBtYWNoaW5lLlxyXG4gICAqL1xuICBjb25maWcsIG9wdGlvbnMsXG4gIC8qKlxyXG4gICAqIFRoZSBpbml0aWFsIGV4dGVuZGVkIHN0YXRlXHJcbiAgICovXG4gIGNvbnRleHQpIHtcbiAgICB2YXIgX3RoaXMgPSB0aGlzO1xuXG4gICAgdGhpcy5jb25maWcgPSBjb25maWc7XG4gICAgdGhpcy5jb250ZXh0ID0gY29udGV4dDtcbiAgICAvKipcclxuICAgICAqIFRoZSBvcmRlciB0aGlzIHN0YXRlIG5vZGUgYXBwZWFycy4gQ29ycmVzcG9uZHMgdG8gdGhlIGltcGxpY2l0IFNDWE1MIGRvY3VtZW50IG9yZGVyLlxyXG4gICAgICovXG5cbiAgICB0aGlzLm9yZGVyID0gLTE7XG4gICAgdGhpcy5fX3hzdGF0ZW5vZGUgPSB0cnVlO1xuICAgIHRoaXMuX19jYWNoZSA9IHtcbiAgICAgIGV2ZW50czogdW5kZWZpbmVkLFxuICAgICAgcmVsYXRpdmVWYWx1ZTogbmV3IE1hcCgpLFxuICAgICAgaW5pdGlhbFN0YXRlVmFsdWU6IHVuZGVmaW5lZCxcbiAgICAgIGluaXRpYWxTdGF0ZTogdW5kZWZpbmVkLFxuICAgICAgb246IHVuZGVmaW5lZCxcbiAgICAgIHRyYW5zaXRpb25zOiB1bmRlZmluZWQsXG4gICAgICBjYW5kaWRhdGVzOiB7fSxcbiAgICAgIGRlbGF5ZWRUcmFuc2l0aW9uczogdW5kZWZpbmVkXG4gICAgfTtcbiAgICB0aGlzLmlkTWFwID0ge307XG4gICAgdGhpcy5vcHRpb25zID0gT2JqZWN0LmFzc2lnbihjcmVhdGVEZWZhdWx0T3B0aW9ucygpLCBvcHRpb25zKTtcbiAgICB0aGlzLnBhcmVudCA9IHRoaXMub3B0aW9ucy5fcGFyZW50O1xuICAgIHRoaXMua2V5ID0gdGhpcy5jb25maWcua2V5IHx8IHRoaXMub3B0aW9ucy5fa2V5IHx8IHRoaXMuY29uZmlnLmlkIHx8ICcobWFjaGluZSknO1xuICAgIHRoaXMubWFjaGluZSA9IHRoaXMucGFyZW50ID8gdGhpcy5wYXJlbnQubWFjaGluZSA6IHRoaXM7XG4gICAgdGhpcy5wYXRoID0gdGhpcy5wYXJlbnQgPyB0aGlzLnBhcmVudC5wYXRoLmNvbmNhdCh0aGlzLmtleSkgOiBbXTtcbiAgICB0aGlzLmRlbGltaXRlciA9IHRoaXMuY29uZmlnLmRlbGltaXRlciB8fCAodGhpcy5wYXJlbnQgPyB0aGlzLnBhcmVudC5kZWxpbWl0ZXIgOiBTVEFURV9ERUxJTUlURVIpO1xuICAgIHRoaXMuaWQgPSB0aGlzLmNvbmZpZy5pZCB8fCBfX3NwcmVhZChbdGhpcy5tYWNoaW5lLmtleV0sIHRoaXMucGF0aCkuam9pbih0aGlzLmRlbGltaXRlcik7XG4gICAgdGhpcy52ZXJzaW9uID0gdGhpcy5wYXJlbnQgPyB0aGlzLnBhcmVudC52ZXJzaW9uIDogdGhpcy5jb25maWcudmVyc2lvbjtcbiAgICB0aGlzLnR5cGUgPSB0aGlzLmNvbmZpZy50eXBlIHx8ICh0aGlzLmNvbmZpZy5wYXJhbGxlbCA/ICdwYXJhbGxlbCcgOiB0aGlzLmNvbmZpZy5zdGF0ZXMgJiYga2V5cyh0aGlzLmNvbmZpZy5zdGF0ZXMpLmxlbmd0aCA/ICdjb21wb3VuZCcgOiB0aGlzLmNvbmZpZy5oaXN0b3J5ID8gJ2hpc3RvcnknIDogJ2F0b21pYycpO1xuXG4gICAgaWYgKCFJU19QUk9EVUNUSU9OKSB7XG4gICAgICB3YXJuKCEoJ3BhcmFsbGVsJyBpbiB0aGlzLmNvbmZpZyksIFwiVGhlIFxcXCJwYXJhbGxlbFxcXCIgcHJvcGVydHkgaXMgZGVwcmVjYXRlZCBhbmQgd2lsbCBiZSByZW1vdmVkIGluIHZlcnNpb24gNC4xLiBcIiArICh0aGlzLmNvbmZpZy5wYXJhbGxlbCA/IFwiUmVwbGFjZSB3aXRoIGB0eXBlOiAncGFyYWxsZWwnYFwiIDogXCJVc2UgYHR5cGU6ICdcIiArIHRoaXMudHlwZSArIFwiJ2BcIikgKyBcIiBpbiB0aGUgY29uZmlnIGZvciBzdGF0ZSBub2RlICdcIiArIHRoaXMuaWQgKyBcIicgaW5zdGVhZC5cIik7XG4gICAgfVxuXG4gICAgdGhpcy5pbml0aWFsID0gdGhpcy5jb25maWcuaW5pdGlhbDtcbiAgICB0aGlzLnN0YXRlcyA9IHRoaXMuY29uZmlnLnN0YXRlcyA/IG1hcFZhbHVlcyh0aGlzLmNvbmZpZy5zdGF0ZXMsIGZ1bmN0aW9uIChzdGF0ZUNvbmZpZywga2V5KSB7XG4gICAgICB2YXIgX2E7XG5cbiAgICAgIHZhciBzdGF0ZU5vZGUgPSBuZXcgU3RhdGVOb2RlKHN0YXRlQ29uZmlnLCB7XG4gICAgICAgIF9wYXJlbnQ6IF90aGlzLFxuICAgICAgICBfa2V5OiBrZXlcbiAgICAgIH0pO1xuICAgICAgT2JqZWN0LmFzc2lnbihfdGhpcy5pZE1hcCwgX19hc3NpZ24oKF9hID0ge30sIF9hW3N0YXRlTm9kZS5pZF0gPSBzdGF0ZU5vZGUsIF9hKSwgc3RhdGVOb2RlLmlkTWFwKSk7XG4gICAgICByZXR1cm4gc3RhdGVOb2RlO1xuICAgIH0pIDogRU1QVFlfT0JKRUNUOyAvLyBEb2N1bWVudCBvcmRlclxuXG4gICAgdmFyIG9yZGVyID0gMDtcblxuICAgIGZ1bmN0aW9uIGRmcyhzdGF0ZU5vZGUpIHtcbiAgICAgIHZhciBlXzEsIF9hO1xuXG4gICAgICBzdGF0ZU5vZGUub3JkZXIgPSBvcmRlcisrO1xuXG4gICAgICB0cnkge1xuICAgICAgICBmb3IgKHZhciBfYiA9IF9fdmFsdWVzKGdldENoaWxkcmVuKHN0YXRlTm9kZSkpLCBfYyA9IF9iLm5leHQoKTsgIV9jLmRvbmU7IF9jID0gX2IubmV4dCgpKSB7XG4gICAgICAgICAgdmFyIGNoaWxkID0gX2MudmFsdWU7XG4gICAgICAgICAgZGZzKGNoaWxkKTtcbiAgICAgICAgfVxuICAgICAgfSBjYXRjaCAoZV8xXzEpIHtcbiAgICAgICAgZV8xID0ge1xuICAgICAgICAgIGVycm9yOiBlXzFfMVxuICAgICAgICB9O1xuICAgICAgfSBmaW5hbGx5IHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICBpZiAoX2MgJiYgIV9jLmRvbmUgJiYgKF9hID0gX2IucmV0dXJuKSkgX2EuY2FsbChfYik7XG4gICAgICAgIH0gZmluYWxseSB7XG4gICAgICAgICAgaWYgKGVfMSkgdGhyb3cgZV8xLmVycm9yO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgZGZzKHRoaXMpOyAvLyBIaXN0b3J5IGNvbmZpZ1xuXG4gICAgdGhpcy5oaXN0b3J5ID0gdGhpcy5jb25maWcuaGlzdG9yeSA9PT0gdHJ1ZSA/ICdzaGFsbG93JyA6IHRoaXMuY29uZmlnLmhpc3RvcnkgfHwgZmFsc2U7XG4gICAgdGhpcy5fdHJhbnNpZW50ID0gISF0aGlzLmNvbmZpZy5hbHdheXMgfHwgKCF0aGlzLmNvbmZpZy5vbiA/IGZhbHNlIDogQXJyYXkuaXNBcnJheSh0aGlzLmNvbmZpZy5vbikgPyB0aGlzLmNvbmZpZy5vbi5zb21lKGZ1bmN0aW9uIChfYSkge1xuICAgICAgdmFyIGV2ZW50ID0gX2EuZXZlbnQ7XG4gICAgICByZXR1cm4gZXZlbnQgPT09IE5VTExfRVZFTlQ7XG4gICAgfSkgOiBOVUxMX0VWRU5UIGluIHRoaXMuY29uZmlnLm9uKTtcbiAgICB0aGlzLnN0cmljdCA9ICEhdGhpcy5jb25maWcuc3RyaWN0OyAvLyBUT0RPOiBkZXByZWNhdGUgKGVudHJ5KVxuXG4gICAgdGhpcy5vbkVudHJ5ID0gdG9BcnJheSh0aGlzLmNvbmZpZy5lbnRyeSB8fCB0aGlzLmNvbmZpZy5vbkVudHJ5KS5tYXAoZnVuY3Rpb24gKGFjdGlvbikge1xuICAgICAgcmV0dXJuIHRvQWN0aW9uT2JqZWN0KGFjdGlvbik7XG4gICAgfSk7IC8vIFRPRE86IGRlcHJlY2F0ZSAoZXhpdClcblxuICAgIHRoaXMub25FeGl0ID0gdG9BcnJheSh0aGlzLmNvbmZpZy5leGl0IHx8IHRoaXMuY29uZmlnLm9uRXhpdCkubWFwKGZ1bmN0aW9uIChhY3Rpb24pIHtcbiAgICAgIHJldHVybiB0b0FjdGlvbk9iamVjdChhY3Rpb24pO1xuICAgIH0pO1xuICAgIHRoaXMubWV0YSA9IHRoaXMuY29uZmlnLm1ldGE7XG4gICAgdGhpcy5kb25lRGF0YSA9IHRoaXMudHlwZSA9PT0gJ2ZpbmFsJyA/IHRoaXMuY29uZmlnLmRhdGEgOiB1bmRlZmluZWQ7XG4gICAgdGhpcy5pbnZva2UgPSB0b0FycmF5KHRoaXMuY29uZmlnLmludm9rZSkubWFwKGZ1bmN0aW9uIChpbnZva2VDb25maWcsIGkpIHtcbiAgICAgIHZhciBfYSwgX2I7XG5cbiAgICAgIGlmIChpc01hY2hpbmUoaW52b2tlQ29uZmlnKSkge1xuICAgICAgICBfdGhpcy5tYWNoaW5lLm9wdGlvbnMuc2VydmljZXMgPSBfX2Fzc2lnbigoX2EgPSB7fSwgX2FbaW52b2tlQ29uZmlnLmlkXSA9IGludm9rZUNvbmZpZywgX2EpLCBfdGhpcy5tYWNoaW5lLm9wdGlvbnMuc2VydmljZXMpO1xuICAgICAgICByZXR1cm4gdG9JbnZva2VEZWZpbml0aW9uKHtcbiAgICAgICAgICBzcmM6IGludm9rZUNvbmZpZy5pZCxcbiAgICAgICAgICBpZDogaW52b2tlQ29uZmlnLmlkXG4gICAgICAgIH0pO1xuICAgICAgfSBlbHNlIGlmIChpc1N0cmluZyhpbnZva2VDb25maWcuc3JjKSkge1xuICAgICAgICByZXR1cm4gdG9JbnZva2VEZWZpbml0aW9uKF9fYXNzaWduKF9fYXNzaWduKHt9LCBpbnZva2VDb25maWcpLCB7XG4gICAgICAgICAgaWQ6IGludm9rZUNvbmZpZy5pZCB8fCBpbnZva2VDb25maWcuc3JjLFxuICAgICAgICAgIHNyYzogaW52b2tlQ29uZmlnLnNyY1xuICAgICAgICB9KSk7XG4gICAgICB9IGVsc2UgaWYgKGlzTWFjaGluZShpbnZva2VDb25maWcuc3JjKSB8fCBpc0Z1bmN0aW9uKGludm9rZUNvbmZpZy5zcmMpKSB7XG4gICAgICAgIHZhciBpbnZva2VTcmMgPSBfdGhpcy5pZCArIFwiOmludm9jYXRpb25bXCIgKyBpICsgXCJdXCI7IC8vIFRPRE86IHV0aWwgZnVuY3Rpb25cblxuICAgICAgICBfdGhpcy5tYWNoaW5lLm9wdGlvbnMuc2VydmljZXMgPSBfX2Fzc2lnbigoX2IgPSB7fSwgX2JbaW52b2tlU3JjXSA9IGludm9rZUNvbmZpZy5zcmMsIF9iKSwgX3RoaXMubWFjaGluZS5vcHRpb25zLnNlcnZpY2VzKTtcbiAgICAgICAgcmV0dXJuIHRvSW52b2tlRGVmaW5pdGlvbihfX2Fzc2lnbihfX2Fzc2lnbih7XG4gICAgICAgICAgaWQ6IGludm9rZVNyY1xuICAgICAgICB9LCBpbnZva2VDb25maWcpLCB7XG4gICAgICAgICAgc3JjOiBpbnZva2VTcmNcbiAgICAgICAgfSkpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdmFyIGludm9rZVNvdXJjZSA9IGludm9rZUNvbmZpZy5zcmM7XG4gICAgICAgIHJldHVybiB0b0ludm9rZURlZmluaXRpb24oX19hc3NpZ24oX19hc3NpZ24oe1xuICAgICAgICAgIGlkOiBpbnZva2VTb3VyY2UudHlwZVxuICAgICAgICB9LCBpbnZva2VDb25maWcpLCB7XG4gICAgICAgICAgc3JjOiBpbnZva2VTb3VyY2VcbiAgICAgICAgfSkpO1xuICAgICAgfVxuICAgIH0pO1xuICAgIHRoaXMuYWN0aXZpdGllcyA9IHRvQXJyYXkodGhpcy5jb25maWcuYWN0aXZpdGllcykuY29uY2F0KHRoaXMuaW52b2tlKS5tYXAoZnVuY3Rpb24gKGFjdGl2aXR5KSB7XG4gICAgICByZXR1cm4gdG9BY3Rpdml0eURlZmluaXRpb24oYWN0aXZpdHkpO1xuICAgIH0pO1xuICAgIHRoaXMudHJhbnNpdGlvbiA9IHRoaXMudHJhbnNpdGlvbi5iaW5kKHRoaXMpOyAvLyBUT0RPOiB0aGlzIGlzIHRoZSByZWFsIGZpeCBmb3IgaW5pdGlhbGl6YXRpb24gb25jZVxuICAgIC8vIHN0YXRlIG5vZGUgZ2V0dGVycyBhcmUgZGVwcmVjYXRlZFxuICAgIC8vIGlmICghdGhpcy5wYXJlbnQpIHtcbiAgICAvLyAgIHRoaXMuX2luaXQoKTtcbiAgICAvLyB9XG4gIH1cblxuICBTdGF0ZU5vZGUucHJvdG90eXBlLl9pbml0ID0gZnVuY3Rpb24gKCkge1xuICAgIGlmICh0aGlzLl9fY2FjaGUudHJhbnNpdGlvbnMpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBnZXRBbGxTdGF0ZU5vZGVzKHRoaXMpLmZvckVhY2goZnVuY3Rpb24gKHN0YXRlTm9kZSkge1xuICAgICAgcmV0dXJuIHN0YXRlTm9kZS5vbjtcbiAgICB9KTtcbiAgfTtcbiAgLyoqXHJcbiAgICogQ2xvbmVzIHRoaXMgc3RhdGUgbWFjaGluZSB3aXRoIGN1c3RvbSBvcHRpb25zIGFuZCBjb250ZXh0LlxyXG4gICAqXHJcbiAgICogQHBhcmFtIG9wdGlvbnMgT3B0aW9ucyAoYWN0aW9ucywgZ3VhcmRzLCBhY3Rpdml0aWVzLCBzZXJ2aWNlcykgdG8gcmVjdXJzaXZlbHkgbWVyZ2Ugd2l0aCB0aGUgZXhpc3Rpbmcgb3B0aW9ucy5cclxuICAgKiBAcGFyYW0gY29udGV4dCBDdXN0b20gY29udGV4dCAod2lsbCBvdmVycmlkZSBwcmVkZWZpbmVkIGNvbnRleHQpXHJcbiAgICovXG5cblxuICBTdGF0ZU5vZGUucHJvdG90eXBlLndpdGhDb25maWcgPSBmdW5jdGlvbiAob3B0aW9ucywgY29udGV4dCkge1xuICAgIGlmIChjb250ZXh0ID09PSB2b2lkIDApIHtcbiAgICAgIGNvbnRleHQgPSB0aGlzLmNvbnRleHQ7XG4gICAgfVxuXG4gICAgdmFyIF9hID0gdGhpcy5vcHRpb25zLFxuICAgICAgICBhY3Rpb25zID0gX2EuYWN0aW9ucyxcbiAgICAgICAgYWN0aXZpdGllcyA9IF9hLmFjdGl2aXRpZXMsXG4gICAgICAgIGd1YXJkcyA9IF9hLmd1YXJkcyxcbiAgICAgICAgc2VydmljZXMgPSBfYS5zZXJ2aWNlcyxcbiAgICAgICAgZGVsYXlzID0gX2EuZGVsYXlzO1xuICAgIHJldHVybiBuZXcgU3RhdGVOb2RlKHRoaXMuY29uZmlnLCB7XG4gICAgICBhY3Rpb25zOiBfX2Fzc2lnbihfX2Fzc2lnbih7fSwgYWN0aW9ucyksIG9wdGlvbnMuYWN0aW9ucyksXG4gICAgICBhY3Rpdml0aWVzOiBfX2Fzc2lnbihfX2Fzc2lnbih7fSwgYWN0aXZpdGllcyksIG9wdGlvbnMuYWN0aXZpdGllcyksXG4gICAgICBndWFyZHM6IF9fYXNzaWduKF9fYXNzaWduKHt9LCBndWFyZHMpLCBvcHRpb25zLmd1YXJkcyksXG4gICAgICBzZXJ2aWNlczogX19hc3NpZ24oX19hc3NpZ24oe30sIHNlcnZpY2VzKSwgb3B0aW9ucy5zZXJ2aWNlcyksXG4gICAgICBkZWxheXM6IF9fYXNzaWduKF9fYXNzaWduKHt9LCBkZWxheXMpLCBvcHRpb25zLmRlbGF5cylcbiAgICB9LCBjb250ZXh0KTtcbiAgfTtcbiAgLyoqXHJcbiAgICogQ2xvbmVzIHRoaXMgc3RhdGUgbWFjaGluZSB3aXRoIGN1c3RvbSBjb250ZXh0LlxyXG4gICAqXHJcbiAgICogQHBhcmFtIGNvbnRleHQgQ3VzdG9tIGNvbnRleHQgKHdpbGwgb3ZlcnJpZGUgcHJlZGVmaW5lZCBjb250ZXh0LCBub3QgcmVjdXJzaXZlKVxyXG4gICAqL1xuXG5cbiAgU3RhdGVOb2RlLnByb3RvdHlwZS53aXRoQ29udGV4dCA9IGZ1bmN0aW9uIChjb250ZXh0KSB7XG4gICAgcmV0dXJuIG5ldyBTdGF0ZU5vZGUodGhpcy5jb25maWcsIHRoaXMub3B0aW9ucywgY29udGV4dCk7XG4gIH07XG5cbiAgT2JqZWN0LmRlZmluZVByb3BlcnR5KFN0YXRlTm9kZS5wcm90b3R5cGUsIFwiZGVmaW5pdGlvblwiLCB7XG4gICAgLyoqXHJcbiAgICAgKiBUaGUgd2VsbC1zdHJ1Y3R1cmVkIHN0YXRlIG5vZGUgZGVmaW5pdGlvbi5cclxuICAgICAqL1xuICAgIGdldDogZnVuY3Rpb24gKCkge1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgaWQ6IHRoaXMuaWQsXG4gICAgICAgIGtleTogdGhpcy5rZXksXG4gICAgICAgIHZlcnNpb246IHRoaXMudmVyc2lvbixcbiAgICAgICAgY29udGV4dDogdGhpcy5jb250ZXh0LFxuICAgICAgICB0eXBlOiB0aGlzLnR5cGUsXG4gICAgICAgIGluaXRpYWw6IHRoaXMuaW5pdGlhbCxcbiAgICAgICAgaGlzdG9yeTogdGhpcy5oaXN0b3J5LFxuICAgICAgICBzdGF0ZXM6IG1hcFZhbHVlcyh0aGlzLnN0YXRlcywgZnVuY3Rpb24gKHN0YXRlKSB7XG4gICAgICAgICAgcmV0dXJuIHN0YXRlLmRlZmluaXRpb247XG4gICAgICAgIH0pLFxuICAgICAgICBvbjogdGhpcy5vbixcbiAgICAgICAgdHJhbnNpdGlvbnM6IHRoaXMudHJhbnNpdGlvbnMsXG4gICAgICAgIGVudHJ5OiB0aGlzLm9uRW50cnksXG4gICAgICAgIGV4aXQ6IHRoaXMub25FeGl0LFxuICAgICAgICBhY3Rpdml0aWVzOiB0aGlzLmFjdGl2aXRpZXMgfHwgW10sXG4gICAgICAgIG1ldGE6IHRoaXMubWV0YSxcbiAgICAgICAgb3JkZXI6IHRoaXMub3JkZXIgfHwgLTEsXG4gICAgICAgIGRhdGE6IHRoaXMuZG9uZURhdGEsXG4gICAgICAgIGludm9rZTogdGhpcy5pbnZva2VcbiAgICAgIH07XG4gICAgfSxcbiAgICBlbnVtZXJhYmxlOiBmYWxzZSxcbiAgICBjb25maWd1cmFibGU6IHRydWVcbiAgfSk7XG5cbiAgU3RhdGVOb2RlLnByb3RvdHlwZS50b0pTT04gPSBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIHRoaXMuZGVmaW5pdGlvbjtcbiAgfTtcblxuICBPYmplY3QuZGVmaW5lUHJvcGVydHkoU3RhdGVOb2RlLnByb3RvdHlwZSwgXCJvblwiLCB7XG4gICAgLyoqXHJcbiAgICAgKiBUaGUgbWFwcGluZyBvZiBldmVudHMgdG8gdHJhbnNpdGlvbnMuXHJcbiAgICAgKi9cbiAgICBnZXQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgIGlmICh0aGlzLl9fY2FjaGUub24pIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX19jYWNoZS5vbjtcbiAgICAgIH1cblxuICAgICAgdmFyIHRyYW5zaXRpb25zID0gdGhpcy50cmFuc2l0aW9ucztcbiAgICAgIHJldHVybiB0aGlzLl9fY2FjaGUub24gPSB0cmFuc2l0aW9ucy5yZWR1Y2UoZnVuY3Rpb24gKG1hcCwgdHJhbnNpdGlvbikge1xuICAgICAgICBtYXBbdHJhbnNpdGlvbi5ldmVudFR5cGVdID0gbWFwW3RyYW5zaXRpb24uZXZlbnRUeXBlXSB8fCBbXTtcbiAgICAgICAgbWFwW3RyYW5zaXRpb24uZXZlbnRUeXBlXS5wdXNoKHRyYW5zaXRpb24pO1xuICAgICAgICByZXR1cm4gbWFwO1xuICAgICAgfSwge30pO1xuICAgIH0sXG4gICAgZW51bWVyYWJsZTogZmFsc2UsXG4gICAgY29uZmlndXJhYmxlOiB0cnVlXG4gIH0pO1xuICBPYmplY3QuZGVmaW5lUHJvcGVydHkoU3RhdGVOb2RlLnByb3RvdHlwZSwgXCJhZnRlclwiLCB7XG4gICAgZ2V0OiBmdW5jdGlvbiAoKSB7XG4gICAgICByZXR1cm4gdGhpcy5fX2NhY2hlLmRlbGF5ZWRUcmFuc2l0aW9ucyB8fCAodGhpcy5fX2NhY2hlLmRlbGF5ZWRUcmFuc2l0aW9ucyA9IHRoaXMuZ2V0RGVsYXllZFRyYW5zaXRpb25zKCksIHRoaXMuX19jYWNoZS5kZWxheWVkVHJhbnNpdGlvbnMpO1xuICAgIH0sXG4gICAgZW51bWVyYWJsZTogZmFsc2UsXG4gICAgY29uZmlndXJhYmxlOiB0cnVlXG4gIH0pO1xuICBPYmplY3QuZGVmaW5lUHJvcGVydHkoU3RhdGVOb2RlLnByb3RvdHlwZSwgXCJ0cmFuc2l0aW9uc1wiLCB7XG4gICAgLyoqXHJcbiAgICAgKiBBbGwgdGhlIHRyYW5zaXRpb25zIHRoYXQgY2FuIGJlIHRha2VuIGZyb20gdGhpcyBzdGF0ZSBub2RlLlxyXG4gICAgICovXG4gICAgZ2V0OiBmdW5jdGlvbiAoKSB7XG4gICAgICByZXR1cm4gdGhpcy5fX2NhY2hlLnRyYW5zaXRpb25zIHx8ICh0aGlzLl9fY2FjaGUudHJhbnNpdGlvbnMgPSB0aGlzLmZvcm1hdFRyYW5zaXRpb25zKCksIHRoaXMuX19jYWNoZS50cmFuc2l0aW9ucyk7XG4gICAgfSxcbiAgICBlbnVtZXJhYmxlOiBmYWxzZSxcbiAgICBjb25maWd1cmFibGU6IHRydWVcbiAgfSk7XG5cbiAgU3RhdGVOb2RlLnByb3RvdHlwZS5nZXRDYW5kaWRhdGVzID0gZnVuY3Rpb24gKGV2ZW50TmFtZSkge1xuICAgIGlmICh0aGlzLl9fY2FjaGUuY2FuZGlkYXRlc1tldmVudE5hbWVdKSB7XG4gICAgICByZXR1cm4gdGhpcy5fX2NhY2hlLmNhbmRpZGF0ZXNbZXZlbnROYW1lXTtcbiAgICB9XG5cbiAgICB2YXIgdHJhbnNpZW50ID0gZXZlbnROYW1lID09PSBOVUxMX0VWRU5UO1xuICAgIHZhciBjYW5kaWRhdGVzID0gdGhpcy50cmFuc2l0aW9ucy5maWx0ZXIoZnVuY3Rpb24gKHRyYW5zaXRpb24pIHtcbiAgICAgIHZhciBzYW1lRXZlbnRUeXBlID0gdHJhbnNpdGlvbi5ldmVudFR5cGUgPT09IGV2ZW50TmFtZTsgLy8gbnVsbCBldmVudHMgc2hvdWxkIG9ubHkgbWF0Y2ggYWdhaW5zdCBldmVudGxlc3MgdHJhbnNpdGlvbnNcblxuICAgICAgcmV0dXJuIHRyYW5zaWVudCA/IHNhbWVFdmVudFR5cGUgOiBzYW1lRXZlbnRUeXBlIHx8IHRyYW5zaXRpb24uZXZlbnRUeXBlID09PSBXSUxEQ0FSRDtcbiAgICB9KTtcbiAgICB0aGlzLl9fY2FjaGUuY2FuZGlkYXRlc1tldmVudE5hbWVdID0gY2FuZGlkYXRlcztcbiAgICByZXR1cm4gY2FuZGlkYXRlcztcbiAgfTtcbiAgLyoqXHJcbiAgICogQWxsIGRlbGF5ZWQgdHJhbnNpdGlvbnMgZnJvbSB0aGUgY29uZmlnLlxyXG4gICAqL1xuXG5cbiAgU3RhdGVOb2RlLnByb3RvdHlwZS5nZXREZWxheWVkVHJhbnNpdGlvbnMgPSBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIF90aGlzID0gdGhpcztcblxuICAgIHZhciBhZnRlckNvbmZpZyA9IHRoaXMuY29uZmlnLmFmdGVyO1xuXG4gICAgaWYgKCFhZnRlckNvbmZpZykge1xuICAgICAgcmV0dXJuIFtdO1xuICAgIH1cblxuICAgIHZhciBtdXRhdGVFbnRyeUV4aXQgPSBmdW5jdGlvbiAoZGVsYXksIGkpIHtcbiAgICAgIHZhciBkZWxheVJlZiA9IGlzRnVuY3Rpb24oZGVsYXkpID8gX3RoaXMuaWQgKyBcIjpkZWxheVtcIiArIGkgKyBcIl1cIiA6IGRlbGF5O1xuICAgICAgdmFyIGV2ZW50VHlwZSA9IGFmdGVyKGRlbGF5UmVmLCBfdGhpcy5pZCk7XG5cbiAgICAgIF90aGlzLm9uRW50cnkucHVzaChzZW5kKGV2ZW50VHlwZSwge1xuICAgICAgICBkZWxheTogZGVsYXlcbiAgICAgIH0pKTtcblxuICAgICAgX3RoaXMub25FeGl0LnB1c2goY2FuY2VsKGV2ZW50VHlwZSkpO1xuXG4gICAgICByZXR1cm4gZXZlbnRUeXBlO1xuICAgIH07XG5cbiAgICB2YXIgZGVsYXllZFRyYW5zaXRpb25zID0gaXNBcnJheShhZnRlckNvbmZpZykgPyBhZnRlckNvbmZpZy5tYXAoZnVuY3Rpb24gKHRyYW5zaXRpb24sIGkpIHtcbiAgICAgIHZhciBldmVudFR5cGUgPSBtdXRhdGVFbnRyeUV4aXQodHJhbnNpdGlvbi5kZWxheSwgaSk7XG4gICAgICByZXR1cm4gX19hc3NpZ24oX19hc3NpZ24oe30sIHRyYW5zaXRpb24pLCB7XG4gICAgICAgIGV2ZW50OiBldmVudFR5cGVcbiAgICAgIH0pO1xuICAgIH0pIDogZmxhdHRlbihrZXlzKGFmdGVyQ29uZmlnKS5tYXAoZnVuY3Rpb24gKGRlbGF5LCBpKSB7XG4gICAgICB2YXIgY29uZmlnVHJhbnNpdGlvbiA9IGFmdGVyQ29uZmlnW2RlbGF5XTtcbiAgICAgIHZhciByZXNvbHZlZFRyYW5zaXRpb24gPSBpc1N0cmluZyhjb25maWdUcmFuc2l0aW9uKSA/IHtcbiAgICAgICAgdGFyZ2V0OiBjb25maWdUcmFuc2l0aW9uXG4gICAgICB9IDogY29uZmlnVHJhbnNpdGlvbjtcbiAgICAgIHZhciByZXNvbHZlZERlbGF5ID0gIWlzTmFOKCtkZWxheSkgPyArZGVsYXkgOiBkZWxheTtcbiAgICAgIHZhciBldmVudFR5cGUgPSBtdXRhdGVFbnRyeUV4aXQocmVzb2x2ZWREZWxheSwgaSk7XG4gICAgICByZXR1cm4gdG9BcnJheShyZXNvbHZlZFRyYW5zaXRpb24pLm1hcChmdW5jdGlvbiAodHJhbnNpdGlvbikge1xuICAgICAgICByZXR1cm4gX19hc3NpZ24oX19hc3NpZ24oe30sIHRyYW5zaXRpb24pLCB7XG4gICAgICAgICAgZXZlbnQ6IGV2ZW50VHlwZSxcbiAgICAgICAgICBkZWxheTogcmVzb2x2ZWREZWxheVxuICAgICAgICB9KTtcbiAgICAgIH0pO1xuICAgIH0pKTtcbiAgICByZXR1cm4gZGVsYXllZFRyYW5zaXRpb25zLm1hcChmdW5jdGlvbiAoZGVsYXllZFRyYW5zaXRpb24pIHtcbiAgICAgIHZhciBkZWxheSA9IGRlbGF5ZWRUcmFuc2l0aW9uLmRlbGF5O1xuICAgICAgcmV0dXJuIF9fYXNzaWduKF9fYXNzaWduKHt9LCBfdGhpcy5mb3JtYXRUcmFuc2l0aW9uKGRlbGF5ZWRUcmFuc2l0aW9uKSksIHtcbiAgICAgICAgZGVsYXk6IGRlbGF5XG4gICAgICB9KTtcbiAgICB9KTtcbiAgfTtcbiAgLyoqXHJcbiAgICogUmV0dXJucyB0aGUgc3RhdGUgbm9kZXMgcmVwcmVzZW50ZWQgYnkgdGhlIGN1cnJlbnQgc3RhdGUgdmFsdWUuXHJcbiAgICpcclxuICAgKiBAcGFyYW0gc3RhdGUgVGhlIHN0YXRlIHZhbHVlIG9yIFN0YXRlIGluc3RhbmNlXHJcbiAgICovXG5cblxuICBTdGF0ZU5vZGUucHJvdG90eXBlLmdldFN0YXRlTm9kZXMgPSBmdW5jdGlvbiAoc3RhdGUpIHtcbiAgICB2YXIgX2E7XG5cbiAgICB2YXIgX3RoaXMgPSB0aGlzO1xuXG4gICAgaWYgKCFzdGF0ZSkge1xuICAgICAgcmV0dXJuIFtdO1xuICAgIH1cblxuICAgIHZhciBzdGF0ZVZhbHVlID0gc3RhdGUgaW5zdGFuY2VvZiBTdGF0ZSA/IHN0YXRlLnZhbHVlIDogdG9TdGF0ZVZhbHVlKHN0YXRlLCB0aGlzLmRlbGltaXRlcik7XG5cbiAgICBpZiAoaXNTdHJpbmcoc3RhdGVWYWx1ZSkpIHtcbiAgICAgIHZhciBpbml0aWFsU3RhdGVWYWx1ZSA9IHRoaXMuZ2V0U3RhdGVOb2RlKHN0YXRlVmFsdWUpLmluaXRpYWw7XG4gICAgICByZXR1cm4gaW5pdGlhbFN0YXRlVmFsdWUgIT09IHVuZGVmaW5lZCA/IHRoaXMuZ2V0U3RhdGVOb2RlcygoX2EgPSB7fSwgX2Fbc3RhdGVWYWx1ZV0gPSBpbml0aWFsU3RhdGVWYWx1ZSwgX2EpKSA6IFt0aGlzLnN0YXRlc1tzdGF0ZVZhbHVlXV07XG4gICAgfVxuXG4gICAgdmFyIHN1YlN0YXRlS2V5cyA9IGtleXMoc3RhdGVWYWx1ZSk7XG4gICAgdmFyIHN1YlN0YXRlTm9kZXMgPSBzdWJTdGF0ZUtleXMubWFwKGZ1bmN0aW9uIChzdWJTdGF0ZUtleSkge1xuICAgICAgcmV0dXJuIF90aGlzLmdldFN0YXRlTm9kZShzdWJTdGF0ZUtleSk7XG4gICAgfSk7XG4gICAgcmV0dXJuIHN1YlN0YXRlTm9kZXMuY29uY2F0KHN1YlN0YXRlS2V5cy5yZWR1Y2UoZnVuY3Rpb24gKGFsbFN1YlN0YXRlTm9kZXMsIHN1YlN0YXRlS2V5KSB7XG4gICAgICB2YXIgc3ViU3RhdGVOb2RlID0gX3RoaXMuZ2V0U3RhdGVOb2RlKHN1YlN0YXRlS2V5KS5nZXRTdGF0ZU5vZGVzKHN0YXRlVmFsdWVbc3ViU3RhdGVLZXldKTtcblxuICAgICAgcmV0dXJuIGFsbFN1YlN0YXRlTm9kZXMuY29uY2F0KHN1YlN0YXRlTm9kZSk7XG4gICAgfSwgW10pKTtcbiAgfTtcbiAgLyoqXHJcbiAgICogUmV0dXJucyBgdHJ1ZWAgaWYgdGhpcyBzdGF0ZSBub2RlIGV4cGxpY2l0bHkgaGFuZGxlcyB0aGUgZ2l2ZW4gZXZlbnQuXHJcbiAgICpcclxuICAgKiBAcGFyYW0gZXZlbnQgVGhlIGV2ZW50IGluIHF1ZXN0aW9uXHJcbiAgICovXG5cblxuICBTdGF0ZU5vZGUucHJvdG90eXBlLmhhbmRsZXMgPSBmdW5jdGlvbiAoZXZlbnQpIHtcbiAgICB2YXIgZXZlbnRUeXBlID0gZ2V0RXZlbnRUeXBlKGV2ZW50KTtcbiAgICByZXR1cm4gdGhpcy5ldmVudHMuaW5jbHVkZXMoZXZlbnRUeXBlKTtcbiAgfTtcbiAgLyoqXHJcbiAgICogUmVzb2x2ZXMgdGhlIGdpdmVuIGBzdGF0ZWAgdG8gYSBuZXcgYFN0YXRlYCBpbnN0YW5jZSByZWxhdGl2ZSB0byB0aGlzIG1hY2hpbmUuXHJcbiAgICpcclxuICAgKiBUaGlzIGVuc3VyZXMgdGhhdCBgLmV2ZW50c2AgYW5kIGAubmV4dEV2ZW50c2AgcmVwcmVzZW50IHRoZSBjb3JyZWN0IHZhbHVlcy5cclxuICAgKlxyXG4gICAqIEBwYXJhbSBzdGF0ZSBUaGUgc3RhdGUgdG8gcmVzb2x2ZVxyXG4gICAqL1xuXG5cbiAgU3RhdGVOb2RlLnByb3RvdHlwZS5yZXNvbHZlU3RhdGUgPSBmdW5jdGlvbiAoc3RhdGUpIHtcbiAgICB2YXIgY29uZmlndXJhdGlvbiA9IEFycmF5LmZyb20oZ2V0Q29uZmlndXJhdGlvbihbXSwgdGhpcy5nZXRTdGF0ZU5vZGVzKHN0YXRlLnZhbHVlKSkpO1xuICAgIHJldHVybiBuZXcgU3RhdGUoX19hc3NpZ24oX19hc3NpZ24oe30sIHN0YXRlKSwge1xuICAgICAgdmFsdWU6IHRoaXMucmVzb2x2ZShzdGF0ZS52YWx1ZSksXG4gICAgICBjb25maWd1cmF0aW9uOiBjb25maWd1cmF0aW9uLFxuICAgICAgZG9uZTogaXNJbkZpbmFsU3RhdGUoY29uZmlndXJhdGlvbiwgdGhpcylcbiAgICB9KSk7XG4gIH07XG5cbiAgU3RhdGVOb2RlLnByb3RvdHlwZS50cmFuc2l0aW9uTGVhZk5vZGUgPSBmdW5jdGlvbiAoc3RhdGVWYWx1ZSwgc3RhdGUsIF9ldmVudCkge1xuICAgIHZhciBzdGF0ZU5vZGUgPSB0aGlzLmdldFN0YXRlTm9kZShzdGF0ZVZhbHVlKTtcbiAgICB2YXIgbmV4dCA9IHN0YXRlTm9kZS5uZXh0KHN0YXRlLCBfZXZlbnQpO1xuXG4gICAgaWYgKCFuZXh0IHx8ICFuZXh0LnRyYW5zaXRpb25zLmxlbmd0aCkge1xuICAgICAgcmV0dXJuIHRoaXMubmV4dChzdGF0ZSwgX2V2ZW50KTtcbiAgICB9XG5cbiAgICByZXR1cm4gbmV4dDtcbiAgfTtcblxuICBTdGF0ZU5vZGUucHJvdG90eXBlLnRyYW5zaXRpb25Db21wb3VuZE5vZGUgPSBmdW5jdGlvbiAoc3RhdGVWYWx1ZSwgc3RhdGUsIF9ldmVudCkge1xuICAgIHZhciBzdWJTdGF0ZUtleXMgPSBrZXlzKHN0YXRlVmFsdWUpO1xuICAgIHZhciBzdGF0ZU5vZGUgPSB0aGlzLmdldFN0YXRlTm9kZShzdWJTdGF0ZUtleXNbMF0pO1xuXG4gICAgdmFyIG5leHQgPSBzdGF0ZU5vZGUuX3RyYW5zaXRpb24oc3RhdGVWYWx1ZVtzdWJTdGF0ZUtleXNbMF1dLCBzdGF0ZSwgX2V2ZW50KTtcblxuICAgIGlmICghbmV4dCB8fCAhbmV4dC50cmFuc2l0aW9ucy5sZW5ndGgpIHtcbiAgICAgIHJldHVybiB0aGlzLm5leHQoc3RhdGUsIF9ldmVudCk7XG4gICAgfVxuXG4gICAgcmV0dXJuIG5leHQ7XG4gIH07XG5cbiAgU3RhdGVOb2RlLnByb3RvdHlwZS50cmFuc2l0aW9uUGFyYWxsZWxOb2RlID0gZnVuY3Rpb24gKHN0YXRlVmFsdWUsIHN0YXRlLCBfZXZlbnQpIHtcbiAgICB2YXIgZV8yLCBfYTtcblxuICAgIHZhciB0cmFuc2l0aW9uTWFwID0ge307XG5cbiAgICB0cnkge1xuICAgICAgZm9yICh2YXIgX2IgPSBfX3ZhbHVlcyhrZXlzKHN0YXRlVmFsdWUpKSwgX2MgPSBfYi5uZXh0KCk7ICFfYy5kb25lOyBfYyA9IF9iLm5leHQoKSkge1xuICAgICAgICB2YXIgc3ViU3RhdGVLZXkgPSBfYy52YWx1ZTtcbiAgICAgICAgdmFyIHN1YlN0YXRlVmFsdWUgPSBzdGF0ZVZhbHVlW3N1YlN0YXRlS2V5XTtcblxuICAgICAgICBpZiAoIXN1YlN0YXRlVmFsdWUpIHtcbiAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgfVxuXG4gICAgICAgIHZhciBzdWJTdGF0ZU5vZGUgPSB0aGlzLmdldFN0YXRlTm9kZShzdWJTdGF0ZUtleSk7XG5cbiAgICAgICAgdmFyIG5leHQgPSBzdWJTdGF0ZU5vZGUuX3RyYW5zaXRpb24oc3ViU3RhdGVWYWx1ZSwgc3RhdGUsIF9ldmVudCk7XG5cbiAgICAgICAgaWYgKG5leHQpIHtcbiAgICAgICAgICB0cmFuc2l0aW9uTWFwW3N1YlN0YXRlS2V5XSA9IG5leHQ7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9IGNhdGNoIChlXzJfMSkge1xuICAgICAgZV8yID0ge1xuICAgICAgICBlcnJvcjogZV8yXzFcbiAgICAgIH07XG4gICAgfSBmaW5hbGx5IHtcbiAgICAgIHRyeSB7XG4gICAgICAgIGlmIChfYyAmJiAhX2MuZG9uZSAmJiAoX2EgPSBfYi5yZXR1cm4pKSBfYS5jYWxsKF9iKTtcbiAgICAgIH0gZmluYWxseSB7XG4gICAgICAgIGlmIChlXzIpIHRocm93IGVfMi5lcnJvcjtcbiAgICAgIH1cbiAgICB9XG5cbiAgICB2YXIgc3RhdGVUcmFuc2l0aW9ucyA9IGtleXModHJhbnNpdGlvbk1hcCkubWFwKGZ1bmN0aW9uIChrZXkpIHtcbiAgICAgIHJldHVybiB0cmFuc2l0aW9uTWFwW2tleV07XG4gICAgfSk7XG4gICAgdmFyIGVuYWJsZWRUcmFuc2l0aW9ucyA9IGZsYXR0ZW4oc3RhdGVUcmFuc2l0aW9ucy5tYXAoZnVuY3Rpb24gKHN0KSB7XG4gICAgICByZXR1cm4gc3QudHJhbnNpdGlvbnM7XG4gICAgfSkpO1xuICAgIHZhciB3aWxsVHJhbnNpdGlvbiA9IHN0YXRlVHJhbnNpdGlvbnMuc29tZShmdW5jdGlvbiAoc3QpIHtcbiAgICAgIHJldHVybiBzdC50cmFuc2l0aW9ucy5sZW5ndGggPiAwO1xuICAgIH0pO1xuXG4gICAgaWYgKCF3aWxsVHJhbnNpdGlvbikge1xuICAgICAgcmV0dXJuIHRoaXMubmV4dChzdGF0ZSwgX2V2ZW50KTtcbiAgICB9XG5cbiAgICB2YXIgZW50cnlOb2RlcyA9IGZsYXR0ZW4oc3RhdGVUcmFuc2l0aW9ucy5tYXAoZnVuY3Rpb24gKHQpIHtcbiAgICAgIHJldHVybiB0LmVudHJ5U2V0O1xuICAgIH0pKTtcbiAgICB2YXIgY29uZmlndXJhdGlvbiA9IGZsYXR0ZW4oa2V5cyh0cmFuc2l0aW9uTWFwKS5tYXAoZnVuY3Rpb24gKGtleSkge1xuICAgICAgcmV0dXJuIHRyYW5zaXRpb25NYXBba2V5XS5jb25maWd1cmF0aW9uO1xuICAgIH0pKTtcbiAgICByZXR1cm4ge1xuICAgICAgdHJhbnNpdGlvbnM6IGVuYWJsZWRUcmFuc2l0aW9ucyxcbiAgICAgIGVudHJ5U2V0OiBlbnRyeU5vZGVzLFxuICAgICAgZXhpdFNldDogZmxhdHRlbihzdGF0ZVRyYW5zaXRpb25zLm1hcChmdW5jdGlvbiAodCkge1xuICAgICAgICByZXR1cm4gdC5leGl0U2V0O1xuICAgICAgfSkpLFxuICAgICAgY29uZmlndXJhdGlvbjogY29uZmlndXJhdGlvbixcbiAgICAgIHNvdXJjZTogc3RhdGUsXG4gICAgICBhY3Rpb25zOiBmbGF0dGVuKGtleXModHJhbnNpdGlvbk1hcCkubWFwKGZ1bmN0aW9uIChrZXkpIHtcbiAgICAgICAgcmV0dXJuIHRyYW5zaXRpb25NYXBba2V5XS5hY3Rpb25zO1xuICAgICAgfSkpXG4gICAgfTtcbiAgfTtcblxuICBTdGF0ZU5vZGUucHJvdG90eXBlLl90cmFuc2l0aW9uID0gZnVuY3Rpb24gKHN0YXRlVmFsdWUsIHN0YXRlLCBfZXZlbnQpIHtcbiAgICAvLyBsZWFmIG5vZGVcbiAgICBpZiAoaXNTdHJpbmcoc3RhdGVWYWx1ZSkpIHtcbiAgICAgIHJldHVybiB0aGlzLnRyYW5zaXRpb25MZWFmTm9kZShzdGF0ZVZhbHVlLCBzdGF0ZSwgX2V2ZW50KTtcbiAgICB9IC8vIGhpZXJhcmNoaWNhbCBub2RlXG5cblxuICAgIGlmIChrZXlzKHN0YXRlVmFsdWUpLmxlbmd0aCA9PT0gMSkge1xuICAgICAgcmV0dXJuIHRoaXMudHJhbnNpdGlvbkNvbXBvdW5kTm9kZShzdGF0ZVZhbHVlLCBzdGF0ZSwgX2V2ZW50KTtcbiAgICB9IC8vIG9ydGhvZ29uYWwgbm9kZVxuXG5cbiAgICByZXR1cm4gdGhpcy50cmFuc2l0aW9uUGFyYWxsZWxOb2RlKHN0YXRlVmFsdWUsIHN0YXRlLCBfZXZlbnQpO1xuICB9O1xuXG4gIFN0YXRlTm9kZS5wcm90b3R5cGUubmV4dCA9IGZ1bmN0aW9uIChzdGF0ZSwgX2V2ZW50KSB7XG4gICAgdmFyIGVfMywgX2E7XG5cbiAgICB2YXIgX3RoaXMgPSB0aGlzO1xuXG4gICAgdmFyIGV2ZW50TmFtZSA9IF9ldmVudC5uYW1lO1xuICAgIHZhciBhY3Rpb25zID0gW107XG4gICAgdmFyIG5leHRTdGF0ZU5vZGVzID0gW107XG4gICAgdmFyIHNlbGVjdGVkVHJhbnNpdGlvbjtcblxuICAgIHRyeSB7XG4gICAgICBmb3IgKHZhciBfYiA9IF9fdmFsdWVzKHRoaXMuZ2V0Q2FuZGlkYXRlcyhldmVudE5hbWUpKSwgX2MgPSBfYi5uZXh0KCk7ICFfYy5kb25lOyBfYyA9IF9iLm5leHQoKSkge1xuICAgICAgICB2YXIgY2FuZGlkYXRlID0gX2MudmFsdWU7XG4gICAgICAgIHZhciBjb25kID0gY2FuZGlkYXRlLmNvbmQsXG4gICAgICAgICAgICBzdGF0ZUluID0gY2FuZGlkYXRlLmluO1xuICAgICAgICB2YXIgcmVzb2x2ZWRDb250ZXh0ID0gc3RhdGUuY29udGV4dDtcbiAgICAgICAgdmFyIGlzSW5TdGF0ZSA9IHN0YXRlSW4gPyBpc1N0cmluZyhzdGF0ZUluKSAmJiBpc1N0YXRlSWQoc3RhdGVJbikgPyAvLyBDaGVjayBpZiBpbiBzdGF0ZSBieSBJRFxuICAgICAgICBzdGF0ZS5tYXRjaGVzKHRvU3RhdGVWYWx1ZSh0aGlzLmdldFN0YXRlTm9kZUJ5SWQoc3RhdGVJbikucGF0aCwgdGhpcy5kZWxpbWl0ZXIpKSA6IC8vIENoZWNrIGlmIGluIHN0YXRlIGJ5IHJlbGF0aXZlIGdyYW5kcGFyZW50XG4gICAgICAgIG1hdGNoZXNTdGF0ZSh0b1N0YXRlVmFsdWUoc3RhdGVJbiwgdGhpcy5kZWxpbWl0ZXIpLCBwYXRoKHRoaXMucGF0aC5zbGljZSgwLCAtMikpKHN0YXRlLnZhbHVlKSkgOiB0cnVlO1xuICAgICAgICB2YXIgZ3VhcmRQYXNzZWQgPSBmYWxzZTtcblxuICAgICAgICB0cnkge1xuICAgICAgICAgIGd1YXJkUGFzc2VkID0gIWNvbmQgfHwgZXZhbHVhdGVHdWFyZCh0aGlzLm1hY2hpbmUsIGNvbmQsIHJlc29sdmVkQ29udGV4dCwgX2V2ZW50LCBzdGF0ZSk7XG4gICAgICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIlVuYWJsZSB0byBldmFsdWF0ZSBndWFyZCAnXCIgKyAoY29uZC5uYW1lIHx8IGNvbmQudHlwZSkgKyBcIicgaW4gdHJhbnNpdGlvbiBmb3IgZXZlbnQgJ1wiICsgZXZlbnROYW1lICsgXCInIGluIHN0YXRlIG5vZGUgJ1wiICsgdGhpcy5pZCArIFwiJzpcXG5cIiArIGVyci5tZXNzYWdlKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChndWFyZFBhc3NlZCAmJiBpc0luU3RhdGUpIHtcbiAgICAgICAgICBpZiAoY2FuZGlkYXRlLnRhcmdldCAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICBuZXh0U3RhdGVOb2RlcyA9IGNhbmRpZGF0ZS50YXJnZXQ7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgYWN0aW9ucy5wdXNoLmFwcGx5KGFjdGlvbnMsIF9fc3ByZWFkKGNhbmRpZGF0ZS5hY3Rpb25zKSk7XG4gICAgICAgICAgc2VsZWN0ZWRUcmFuc2l0aW9uID0gY2FuZGlkYXRlO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSBjYXRjaCAoZV8zXzEpIHtcbiAgICAgIGVfMyA9IHtcbiAgICAgICAgZXJyb3I6IGVfM18xXG4gICAgICB9O1xuICAgIH0gZmluYWxseSB7XG4gICAgICB0cnkge1xuICAgICAgICBpZiAoX2MgJiYgIV9jLmRvbmUgJiYgKF9hID0gX2IucmV0dXJuKSkgX2EuY2FsbChfYik7XG4gICAgICB9IGZpbmFsbHkge1xuICAgICAgICBpZiAoZV8zKSB0aHJvdyBlXzMuZXJyb3I7XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKCFzZWxlY3RlZFRyYW5zaXRpb24pIHtcbiAgICAgIHJldHVybiB1bmRlZmluZWQ7XG4gICAgfVxuXG4gICAgaWYgKCFuZXh0U3RhdGVOb2Rlcy5sZW5ndGgpIHtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIHRyYW5zaXRpb25zOiBbc2VsZWN0ZWRUcmFuc2l0aW9uXSxcbiAgICAgICAgZW50cnlTZXQ6IFtdLFxuICAgICAgICBleGl0U2V0OiBbXSxcbiAgICAgICAgY29uZmlndXJhdGlvbjogc3RhdGUudmFsdWUgPyBbdGhpc10gOiBbXSxcbiAgICAgICAgc291cmNlOiBzdGF0ZSxcbiAgICAgICAgYWN0aW9uczogYWN0aW9uc1xuICAgICAgfTtcbiAgICB9XG5cbiAgICB2YXIgYWxsTmV4dFN0YXRlTm9kZXMgPSBmbGF0dGVuKG5leHRTdGF0ZU5vZGVzLm1hcChmdW5jdGlvbiAoc3RhdGVOb2RlKSB7XG4gICAgICByZXR1cm4gX3RoaXMuZ2V0UmVsYXRpdmVTdGF0ZU5vZGVzKHN0YXRlTm9kZSwgc3RhdGUuaGlzdG9yeVZhbHVlKTtcbiAgICB9KSk7XG4gICAgdmFyIGlzSW50ZXJuYWwgPSAhIXNlbGVjdGVkVHJhbnNpdGlvbi5pbnRlcm5hbDtcbiAgICB2YXIgcmVlbnRyeU5vZGVzID0gaXNJbnRlcm5hbCA/IFtdIDogZmxhdHRlbihhbGxOZXh0U3RhdGVOb2Rlcy5tYXAoZnVuY3Rpb24gKG4pIHtcbiAgICAgIHJldHVybiBfdGhpcy5ub2Rlc0Zyb21DaGlsZChuKTtcbiAgICB9KSk7XG4gICAgcmV0dXJuIHtcbiAgICAgIHRyYW5zaXRpb25zOiBbc2VsZWN0ZWRUcmFuc2l0aW9uXSxcbiAgICAgIGVudHJ5U2V0OiByZWVudHJ5Tm9kZXMsXG4gICAgICBleGl0U2V0OiBpc0ludGVybmFsID8gW10gOiBbdGhpc10sXG4gICAgICBjb25maWd1cmF0aW9uOiBhbGxOZXh0U3RhdGVOb2RlcyxcbiAgICAgIHNvdXJjZTogc3RhdGUsXG4gICAgICBhY3Rpb25zOiBhY3Rpb25zXG4gICAgfTtcbiAgfTtcblxuICBTdGF0ZU5vZGUucHJvdG90eXBlLm5vZGVzRnJvbUNoaWxkID0gZnVuY3Rpb24gKGNoaWxkU3RhdGVOb2RlKSB7XG4gICAgaWYgKGNoaWxkU3RhdGVOb2RlLmVzY2FwZXModGhpcykpIHtcbiAgICAgIHJldHVybiBbXTtcbiAgICB9XG5cbiAgICB2YXIgbm9kZXMgPSBbXTtcbiAgICB2YXIgbWFya2VyID0gY2hpbGRTdGF0ZU5vZGU7XG5cbiAgICB3aGlsZSAobWFya2VyICYmIG1hcmtlciAhPT0gdGhpcykge1xuICAgICAgbm9kZXMucHVzaChtYXJrZXIpO1xuICAgICAgbWFya2VyID0gbWFya2VyLnBhcmVudDtcbiAgICB9XG5cbiAgICBub2Rlcy5wdXNoKHRoaXMpOyAvLyBpbmNsdXNpdmVcblxuICAgIHJldHVybiBub2RlcztcbiAgfTtcbiAgLyoqXHJcbiAgICogV2hldGhlciB0aGUgZ2l2ZW4gc3RhdGUgbm9kZSBcImVzY2FwZXNcIiB0aGlzIHN0YXRlIG5vZGUuIElmIHRoZSBgc3RhdGVOb2RlYCBpcyBlcXVhbCB0byBvciB0aGUgcGFyZW50IG9mXHJcbiAgICogdGhpcyBzdGF0ZSBub2RlLCBpdCBkb2VzIG5vdCBlc2NhcGUuXHJcbiAgICovXG5cblxuICBTdGF0ZU5vZGUucHJvdG90eXBlLmVzY2FwZXMgPSBmdW5jdGlvbiAoc3RhdGVOb2RlKSB7XG4gICAgaWYgKHRoaXMgPT09IHN0YXRlTm9kZSkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIHZhciBwYXJlbnQgPSB0aGlzLnBhcmVudDtcblxuICAgIHdoaWxlIChwYXJlbnQpIHtcbiAgICAgIGlmIChwYXJlbnQgPT09IHN0YXRlTm9kZSkge1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICB9XG5cbiAgICAgIHBhcmVudCA9IHBhcmVudC5wYXJlbnQ7XG4gICAgfVxuXG4gICAgcmV0dXJuIHRydWU7XG4gIH07XG5cbiAgU3RhdGVOb2RlLnByb3RvdHlwZS5nZXRBY3Rpb25zID0gZnVuY3Rpb24gKHRyYW5zaXRpb24sIGN1cnJlbnRDb250ZXh0LCBfZXZlbnQsIHByZXZTdGF0ZSkge1xuICAgIHZhciBlXzQsIF9hLCBlXzUsIF9iO1xuXG4gICAgdmFyIHByZXZDb25maWcgPSBnZXRDb25maWd1cmF0aW9uKFtdLCBwcmV2U3RhdGUgPyB0aGlzLmdldFN0YXRlTm9kZXMocHJldlN0YXRlLnZhbHVlKSA6IFt0aGlzXSk7XG4gICAgdmFyIHJlc29sdmVkQ29uZmlnID0gdHJhbnNpdGlvbi5jb25maWd1cmF0aW9uLmxlbmd0aCA/IGdldENvbmZpZ3VyYXRpb24ocHJldkNvbmZpZywgdHJhbnNpdGlvbi5jb25maWd1cmF0aW9uKSA6IHByZXZDb25maWc7XG5cbiAgICB0cnkge1xuICAgICAgZm9yICh2YXIgcmVzb2x2ZWRDb25maWdfMSA9IF9fdmFsdWVzKHJlc29sdmVkQ29uZmlnKSwgcmVzb2x2ZWRDb25maWdfMV8xID0gcmVzb2x2ZWRDb25maWdfMS5uZXh0KCk7ICFyZXNvbHZlZENvbmZpZ18xXzEuZG9uZTsgcmVzb2x2ZWRDb25maWdfMV8xID0gcmVzb2x2ZWRDb25maWdfMS5uZXh0KCkpIHtcbiAgICAgICAgdmFyIHNuID0gcmVzb2x2ZWRDb25maWdfMV8xLnZhbHVlO1xuXG4gICAgICAgIGlmICghaGFzKHByZXZDb25maWcsIHNuKSkge1xuICAgICAgICAgIHRyYW5zaXRpb24uZW50cnlTZXQucHVzaChzbik7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9IGNhdGNoIChlXzRfMSkge1xuICAgICAgZV80ID0ge1xuICAgICAgICBlcnJvcjogZV80XzFcbiAgICAgIH07XG4gICAgfSBmaW5hbGx5IHtcbiAgICAgIHRyeSB7XG4gICAgICAgIGlmIChyZXNvbHZlZENvbmZpZ18xXzEgJiYgIXJlc29sdmVkQ29uZmlnXzFfMS5kb25lICYmIChfYSA9IHJlc29sdmVkQ29uZmlnXzEucmV0dXJuKSkgX2EuY2FsbChyZXNvbHZlZENvbmZpZ18xKTtcbiAgICAgIH0gZmluYWxseSB7XG4gICAgICAgIGlmIChlXzQpIHRocm93IGVfNC5lcnJvcjtcbiAgICAgIH1cbiAgICB9XG5cbiAgICB0cnkge1xuICAgICAgZm9yICh2YXIgcHJldkNvbmZpZ18xID0gX192YWx1ZXMocHJldkNvbmZpZyksIHByZXZDb25maWdfMV8xID0gcHJldkNvbmZpZ18xLm5leHQoKTsgIXByZXZDb25maWdfMV8xLmRvbmU7IHByZXZDb25maWdfMV8xID0gcHJldkNvbmZpZ18xLm5leHQoKSkge1xuICAgICAgICB2YXIgc24gPSBwcmV2Q29uZmlnXzFfMS52YWx1ZTtcblxuICAgICAgICBpZiAoIWhhcyhyZXNvbHZlZENvbmZpZywgc24pIHx8IGhhcyh0cmFuc2l0aW9uLmV4aXRTZXQsIHNuLnBhcmVudCkpIHtcbiAgICAgICAgICB0cmFuc2l0aW9uLmV4aXRTZXQucHVzaChzbik7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9IGNhdGNoIChlXzVfMSkge1xuICAgICAgZV81ID0ge1xuICAgICAgICBlcnJvcjogZV81XzFcbiAgICAgIH07XG4gICAgfSBmaW5hbGx5IHtcbiAgICAgIHRyeSB7XG4gICAgICAgIGlmIChwcmV2Q29uZmlnXzFfMSAmJiAhcHJldkNvbmZpZ18xXzEuZG9uZSAmJiAoX2IgPSBwcmV2Q29uZmlnXzEucmV0dXJuKSkgX2IuY2FsbChwcmV2Q29uZmlnXzEpO1xuICAgICAgfSBmaW5hbGx5IHtcbiAgICAgICAgaWYgKGVfNSkgdGhyb3cgZV81LmVycm9yO1xuICAgICAgfVxuICAgIH1cblxuICAgIGlmICghdHJhbnNpdGlvbi5zb3VyY2UpIHtcbiAgICAgIHRyYW5zaXRpb24uZXhpdFNldCA9IFtdOyAvLyBFbnN1cmUgdGhhdCByb290IFN0YXRlTm9kZSAobWFjaGluZSkgaXMgZW50ZXJlZFxuXG4gICAgICB0cmFuc2l0aW9uLmVudHJ5U2V0LnB1c2godGhpcyk7XG4gICAgfVxuXG4gICAgdmFyIGRvbmVFdmVudHMgPSBmbGF0dGVuKHRyYW5zaXRpb24uZW50cnlTZXQubWFwKGZ1bmN0aW9uIChzbikge1xuICAgICAgdmFyIGV2ZW50cyA9IFtdO1xuXG4gICAgICBpZiAoc24udHlwZSAhPT0gJ2ZpbmFsJykge1xuICAgICAgICByZXR1cm4gZXZlbnRzO1xuICAgICAgfVxuXG4gICAgICB2YXIgcGFyZW50ID0gc24ucGFyZW50O1xuXG4gICAgICBpZiAoIXBhcmVudC5wYXJlbnQpIHtcbiAgICAgICAgcmV0dXJuIGV2ZW50cztcbiAgICAgIH1cblxuICAgICAgZXZlbnRzLnB1c2goZG9uZShzbi5pZCwgc24uZG9uZURhdGEpLCAvLyBUT0RPOiBkZXByZWNhdGUgLSBmaW5hbCBzdGF0ZXMgc2hvdWxkIG5vdCBlbWl0IGRvbmUgZXZlbnRzIGZvciB0aGVpciBvd24gc3RhdGUuXG4gICAgICBkb25lKHBhcmVudC5pZCwgc24uZG9uZURhdGEgPyBtYXBDb250ZXh0KHNuLmRvbmVEYXRhLCBjdXJyZW50Q29udGV4dCwgX2V2ZW50KSA6IHVuZGVmaW5lZCkpO1xuICAgICAgdmFyIGdyYW5kcGFyZW50ID0gcGFyZW50LnBhcmVudDtcblxuICAgICAgaWYgKGdyYW5kcGFyZW50LnR5cGUgPT09ICdwYXJhbGxlbCcpIHtcbiAgICAgICAgaWYgKGdldENoaWxkcmVuKGdyYW5kcGFyZW50KS5ldmVyeShmdW5jdGlvbiAocGFyZW50Tm9kZSkge1xuICAgICAgICAgIHJldHVybiBpc0luRmluYWxTdGF0ZSh0cmFuc2l0aW9uLmNvbmZpZ3VyYXRpb24sIHBhcmVudE5vZGUpO1xuICAgICAgICB9KSkge1xuICAgICAgICAgIGV2ZW50cy5wdXNoKGRvbmUoZ3JhbmRwYXJlbnQuaWQpKTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICByZXR1cm4gZXZlbnRzO1xuICAgIH0pKTtcbiAgICB0cmFuc2l0aW9uLmV4aXRTZXQuc29ydChmdW5jdGlvbiAoYSwgYikge1xuICAgICAgcmV0dXJuIGIub3JkZXIgLSBhLm9yZGVyO1xuICAgIH0pO1xuICAgIHRyYW5zaXRpb24uZW50cnlTZXQuc29ydChmdW5jdGlvbiAoYSwgYikge1xuICAgICAgcmV0dXJuIGEub3JkZXIgLSBiLm9yZGVyO1xuICAgIH0pO1xuICAgIHZhciBlbnRyeVN0YXRlcyA9IG5ldyBTZXQodHJhbnNpdGlvbi5lbnRyeVNldCk7XG4gICAgdmFyIGV4aXRTdGF0ZXMgPSBuZXcgU2V0KHRyYW5zaXRpb24uZXhpdFNldCk7XG5cbiAgICB2YXIgX2MgPSBfX3JlYWQoW2ZsYXR0ZW4oQXJyYXkuZnJvbShlbnRyeVN0YXRlcykubWFwKGZ1bmN0aW9uIChzdGF0ZU5vZGUpIHtcbiAgICAgIHJldHVybiBfX3NwcmVhZChzdGF0ZU5vZGUuYWN0aXZpdGllcy5tYXAoZnVuY3Rpb24gKGFjdGl2aXR5KSB7XG4gICAgICAgIHJldHVybiBzdGFydChhY3Rpdml0eSk7XG4gICAgICB9KSwgc3RhdGVOb2RlLm9uRW50cnkpO1xuICAgIH0pKS5jb25jYXQoZG9uZUV2ZW50cy5tYXAocmFpc2UpKSwgZmxhdHRlbihBcnJheS5mcm9tKGV4aXRTdGF0ZXMpLm1hcChmdW5jdGlvbiAoc3RhdGVOb2RlKSB7XG4gICAgICByZXR1cm4gX19zcHJlYWQoc3RhdGVOb2RlLm9uRXhpdCwgc3RhdGVOb2RlLmFjdGl2aXRpZXMubWFwKGZ1bmN0aW9uIChhY3Rpdml0eSkge1xuICAgICAgICByZXR1cm4gc3RvcChhY3Rpdml0eSk7XG4gICAgICB9KSk7XG4gICAgfSkpXSwgMiksXG4gICAgICAgIGVudHJ5QWN0aW9ucyA9IF9jWzBdLFxuICAgICAgICBleGl0QWN0aW9ucyA9IF9jWzFdO1xuXG4gICAgdmFyIGFjdGlvbnMgPSB0b0FjdGlvbk9iamVjdHMoZXhpdEFjdGlvbnMuY29uY2F0KHRyYW5zaXRpb24uYWN0aW9ucykuY29uY2F0KGVudHJ5QWN0aW9ucyksIHRoaXMubWFjaGluZS5vcHRpb25zLmFjdGlvbnMpO1xuICAgIHJldHVybiBhY3Rpb25zO1xuICB9O1xuICAvKipcclxuICAgKiBEZXRlcm1pbmVzIHRoZSBuZXh0IHN0YXRlIGdpdmVuIHRoZSBjdXJyZW50IGBzdGF0ZWAgYW5kIHNlbnQgYGV2ZW50YC5cclxuICAgKlxyXG4gICAqIEBwYXJhbSBzdGF0ZSBUaGUgY3VycmVudCBTdGF0ZSBpbnN0YW5jZSBvciBzdGF0ZSB2YWx1ZVxyXG4gICAqIEBwYXJhbSBldmVudCBUaGUgZXZlbnQgdGhhdCB3YXMgc2VudCBhdCB0aGUgY3VycmVudCBzdGF0ZVxyXG4gICAqIEBwYXJhbSBjb250ZXh0IFRoZSBjdXJyZW50IGNvbnRleHQgKGV4dGVuZGVkIHN0YXRlKSBvZiB0aGUgY3VycmVudCBzdGF0ZVxyXG4gICAqL1xuXG5cbiAgU3RhdGVOb2RlLnByb3RvdHlwZS50cmFuc2l0aW9uID0gZnVuY3Rpb24gKHN0YXRlLCBldmVudCwgY29udGV4dCkge1xuICAgIGlmIChzdGF0ZSA9PT0gdm9pZCAwKSB7XG4gICAgICBzdGF0ZSA9IHRoaXMuaW5pdGlhbFN0YXRlO1xuICAgIH1cblxuICAgIHZhciBfZXZlbnQgPSB0b1NDWE1MRXZlbnQoZXZlbnQpO1xuXG4gICAgdmFyIGN1cnJlbnRTdGF0ZTtcblxuICAgIGlmIChzdGF0ZSBpbnN0YW5jZW9mIFN0YXRlKSB7XG4gICAgICBjdXJyZW50U3RhdGUgPSBjb250ZXh0ID09PSB1bmRlZmluZWQgPyBzdGF0ZSA6IHRoaXMucmVzb2x2ZVN0YXRlKFN0YXRlLmZyb20oc3RhdGUsIGNvbnRleHQpKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdmFyIHJlc29sdmVkU3RhdGVWYWx1ZSA9IGlzU3RyaW5nKHN0YXRlKSA/IHRoaXMucmVzb2x2ZShwYXRoVG9TdGF0ZVZhbHVlKHRoaXMuZ2V0UmVzb2x2ZWRQYXRoKHN0YXRlKSkpIDogdGhpcy5yZXNvbHZlKHN0YXRlKTtcbiAgICAgIHZhciByZXNvbHZlZENvbnRleHQgPSBjb250ZXh0ID8gY29udGV4dCA6IHRoaXMubWFjaGluZS5jb250ZXh0O1xuICAgICAgY3VycmVudFN0YXRlID0gdGhpcy5yZXNvbHZlU3RhdGUoU3RhdGUuZnJvbShyZXNvbHZlZFN0YXRlVmFsdWUsIHJlc29sdmVkQ29udGV4dCkpO1xuICAgIH1cblxuICAgIGlmICghSVNfUFJPRFVDVElPTiAmJiBfZXZlbnQubmFtZSA9PT0gV0lMRENBUkQpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihcIkFuIGV2ZW50IGNhbm5vdCBoYXZlIHRoZSB3aWxkY2FyZCB0eXBlICgnXCIgKyBXSUxEQ0FSRCArIFwiJylcIik7XG4gICAgfVxuXG4gICAgaWYgKHRoaXMuc3RyaWN0KSB7XG4gICAgICBpZiAoIXRoaXMuZXZlbnRzLmluY2x1ZGVzKF9ldmVudC5uYW1lKSAmJiAhaXNCdWlsdEluRXZlbnQoX2V2ZW50Lm5hbWUpKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcIk1hY2hpbmUgJ1wiICsgdGhpcy5pZCArIFwiJyBkb2VzIG5vdCBhY2NlcHQgZXZlbnQgJ1wiICsgX2V2ZW50Lm5hbWUgKyBcIidcIik7XG4gICAgICB9XG4gICAgfVxuXG4gICAgdmFyIHN0YXRlVHJhbnNpdGlvbiA9IHRoaXMuX3RyYW5zaXRpb24oY3VycmVudFN0YXRlLnZhbHVlLCBjdXJyZW50U3RhdGUsIF9ldmVudCkgfHwge1xuICAgICAgdHJhbnNpdGlvbnM6IFtdLFxuICAgICAgY29uZmlndXJhdGlvbjogW10sXG4gICAgICBlbnRyeVNldDogW10sXG4gICAgICBleGl0U2V0OiBbXSxcbiAgICAgIHNvdXJjZTogY3VycmVudFN0YXRlLFxuICAgICAgYWN0aW9uczogW11cbiAgICB9O1xuICAgIHZhciBwcmV2Q29uZmlnID0gZ2V0Q29uZmlndXJhdGlvbihbXSwgdGhpcy5nZXRTdGF0ZU5vZGVzKGN1cnJlbnRTdGF0ZS52YWx1ZSkpO1xuICAgIHZhciByZXNvbHZlZENvbmZpZyA9IHN0YXRlVHJhbnNpdGlvbi5jb25maWd1cmF0aW9uLmxlbmd0aCA/IGdldENvbmZpZ3VyYXRpb24ocHJldkNvbmZpZywgc3RhdGVUcmFuc2l0aW9uLmNvbmZpZ3VyYXRpb24pIDogcHJldkNvbmZpZztcbiAgICBzdGF0ZVRyYW5zaXRpb24uY29uZmlndXJhdGlvbiA9IF9fc3ByZWFkKHJlc29sdmVkQ29uZmlnKTtcbiAgICByZXR1cm4gdGhpcy5yZXNvbHZlVHJhbnNpdGlvbihzdGF0ZVRyYW5zaXRpb24sIGN1cnJlbnRTdGF0ZSwgX2V2ZW50KTtcbiAgfTtcblxuICBTdGF0ZU5vZGUucHJvdG90eXBlLnJlc29sdmVSYWlzZWRUcmFuc2l0aW9uID0gZnVuY3Rpb24gKHN0YXRlLCBfZXZlbnQsIG9yaWdpbmFsRXZlbnQpIHtcbiAgICB2YXIgX2E7XG5cbiAgICB2YXIgY3VycmVudEFjdGlvbnMgPSBzdGF0ZS5hY3Rpb25zO1xuICAgIHN0YXRlID0gdGhpcy50cmFuc2l0aW9uKHN0YXRlLCBfZXZlbnQpOyAvLyBTYXZlIG9yaWdpbmFsIGV2ZW50IHRvIHN0YXRlXG4gICAgLy8gVE9ETzogdGhpcyBzaG91bGQgYmUgdGhlIHJhaXNlZCBldmVudCEgRGVsZXRlIGluIFY1IChicmVha2luZylcblxuICAgIHN0YXRlLl9ldmVudCA9IG9yaWdpbmFsRXZlbnQ7XG4gICAgc3RhdGUuZXZlbnQgPSBvcmlnaW5hbEV2ZW50LmRhdGE7XG5cbiAgICAoX2EgPSBzdGF0ZS5hY3Rpb25zKS51bnNoaWZ0LmFwcGx5KF9hLCBfX3NwcmVhZChjdXJyZW50QWN0aW9ucykpO1xuXG4gICAgcmV0dXJuIHN0YXRlO1xuICB9O1xuXG4gIFN0YXRlTm9kZS5wcm90b3R5cGUucmVzb2x2ZVRyYW5zaXRpb24gPSBmdW5jdGlvbiAoc3RhdGVUcmFuc2l0aW9uLCBjdXJyZW50U3RhdGUsIF9ldmVudCwgY29udGV4dCkge1xuICAgIHZhciBlXzYsIF9hO1xuXG4gICAgdmFyIF90aGlzID0gdGhpcztcblxuICAgIGlmIChfZXZlbnQgPT09IHZvaWQgMCkge1xuICAgICAgX2V2ZW50ID0gaW5pdEV2ZW50O1xuICAgIH1cblxuICAgIGlmIChjb250ZXh0ID09PSB2b2lkIDApIHtcbiAgICAgIGNvbnRleHQgPSB0aGlzLm1hY2hpbmUuY29udGV4dDtcbiAgICB9XG5cbiAgICB2YXIgY29uZmlndXJhdGlvbiA9IHN0YXRlVHJhbnNpdGlvbi5jb25maWd1cmF0aW9uOyAvLyBUcmFuc2l0aW9uIHdpbGwgXCJhcHBseVwiIGlmOlxuICAgIC8vIC0gdGhpcyBpcyB0aGUgaW5pdGlhbCBzdGF0ZSAodGhlcmUgaXMgbm8gY3VycmVudCBzdGF0ZSlcbiAgICAvLyAtIE9SIHRoZXJlIGFyZSB0cmFuc2l0aW9uc1xuXG4gICAgdmFyIHdpbGxUcmFuc2l0aW9uID0gIWN1cnJlbnRTdGF0ZSB8fCBzdGF0ZVRyYW5zaXRpb24udHJhbnNpdGlvbnMubGVuZ3RoID4gMDtcbiAgICB2YXIgcmVzb2x2ZWRTdGF0ZVZhbHVlID0gd2lsbFRyYW5zaXRpb24gPyBnZXRWYWx1ZSh0aGlzLm1hY2hpbmUsIGNvbmZpZ3VyYXRpb24pIDogdW5kZWZpbmVkO1xuICAgIHZhciBoaXN0b3J5VmFsdWUgPSBjdXJyZW50U3RhdGUgPyBjdXJyZW50U3RhdGUuaGlzdG9yeVZhbHVlID8gY3VycmVudFN0YXRlLmhpc3RvcnlWYWx1ZSA6IHN0YXRlVHJhbnNpdGlvbi5zb3VyY2UgPyB0aGlzLm1hY2hpbmUuaGlzdG9yeVZhbHVlKGN1cnJlbnRTdGF0ZS52YWx1ZSkgOiB1bmRlZmluZWQgOiB1bmRlZmluZWQ7XG4gICAgdmFyIGN1cnJlbnRDb250ZXh0ID0gY3VycmVudFN0YXRlID8gY3VycmVudFN0YXRlLmNvbnRleHQgOiBjb250ZXh0O1xuICAgIHZhciBhY3Rpb25zID0gdGhpcy5nZXRBY3Rpb25zKHN0YXRlVHJhbnNpdGlvbiwgY3VycmVudENvbnRleHQsIF9ldmVudCwgY3VycmVudFN0YXRlKTtcbiAgICB2YXIgYWN0aXZpdGllcyA9IGN1cnJlbnRTdGF0ZSA/IF9fYXNzaWduKHt9LCBjdXJyZW50U3RhdGUuYWN0aXZpdGllcykgOiB7fTtcblxuICAgIHRyeSB7XG4gICAgICBmb3IgKHZhciBhY3Rpb25zXzEgPSBfX3ZhbHVlcyhhY3Rpb25zKSwgYWN0aW9uc18xXzEgPSBhY3Rpb25zXzEubmV4dCgpOyAhYWN0aW9uc18xXzEuZG9uZTsgYWN0aW9uc18xXzEgPSBhY3Rpb25zXzEubmV4dCgpKSB7XG4gICAgICAgIHZhciBhY3Rpb24gPSBhY3Rpb25zXzFfMS52YWx1ZTtcblxuICAgICAgICBpZiAoYWN0aW9uLnR5cGUgPT09IHN0YXJ0JDEpIHtcbiAgICAgICAgICBhY3Rpdml0aWVzW2FjdGlvbi5hY3Rpdml0eS5pZCB8fCBhY3Rpb24uYWN0aXZpdHkudHlwZV0gPSBhY3Rpb247XG4gICAgICAgIH0gZWxzZSBpZiAoYWN0aW9uLnR5cGUgPT09IHN0b3AkMSkge1xuICAgICAgICAgIGFjdGl2aXRpZXNbYWN0aW9uLmFjdGl2aXR5LmlkIHx8IGFjdGlvbi5hY3Rpdml0eS50eXBlXSA9IGZhbHNlO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSBjYXRjaCAoZV82XzEpIHtcbiAgICAgIGVfNiA9IHtcbiAgICAgICAgZXJyb3I6IGVfNl8xXG4gICAgICB9O1xuICAgIH0gZmluYWxseSB7XG4gICAgICB0cnkge1xuICAgICAgICBpZiAoYWN0aW9uc18xXzEgJiYgIWFjdGlvbnNfMV8xLmRvbmUgJiYgKF9hID0gYWN0aW9uc18xLnJldHVybikpIF9hLmNhbGwoYWN0aW9uc18xKTtcbiAgICAgIH0gZmluYWxseSB7XG4gICAgICAgIGlmIChlXzYpIHRocm93IGVfNi5lcnJvcjtcbiAgICAgIH1cbiAgICB9XG5cbiAgICB2YXIgX2IgPSBfX3JlYWQocmVzb2x2ZUFjdGlvbnModGhpcywgY3VycmVudFN0YXRlLCBjdXJyZW50Q29udGV4dCwgX2V2ZW50LCBhY3Rpb25zKSwgMiksXG4gICAgICAgIHJlc29sdmVkQWN0aW9ucyA9IF9iWzBdLFxuICAgICAgICB1cGRhdGVkQ29udGV4dCA9IF9iWzFdO1xuXG4gICAgdmFyIF9jID0gX19yZWFkKHBhcnRpdGlvbihyZXNvbHZlZEFjdGlvbnMsIGZ1bmN0aW9uIChhY3Rpb24pIHtcbiAgICAgIHJldHVybiBhY3Rpb24udHlwZSA9PT0gcmFpc2UkMSB8fCBhY3Rpb24udHlwZSA9PT0gc2VuZCQxICYmIGFjdGlvbi50byA9PT0gU3BlY2lhbFRhcmdldHMuSW50ZXJuYWw7XG4gICAgfSksIDIpLFxuICAgICAgICByYWlzZWRFdmVudHMgPSBfY1swXSxcbiAgICAgICAgbm9uUmFpc2VkQWN0aW9ucyA9IF9jWzFdO1xuXG4gICAgdmFyIGludm9rZUFjdGlvbnMgPSByZXNvbHZlZEFjdGlvbnMuZmlsdGVyKGZ1bmN0aW9uIChhY3Rpb24pIHtcbiAgICAgIHZhciBfYTtcblxuICAgICAgcmV0dXJuIGFjdGlvbi50eXBlID09PSBzdGFydCQxICYmICgoX2EgPSBhY3Rpb24uYWN0aXZpdHkpID09PSBudWxsIHx8IF9hID09PSB2b2lkIDAgPyB2b2lkIDAgOiBfYS50eXBlKSA9PT0gaW52b2tlO1xuICAgIH0pO1xuICAgIHZhciBjaGlsZHJlbiA9IGludm9rZUFjdGlvbnMucmVkdWNlKGZ1bmN0aW9uIChhY2MsIGFjdGlvbikge1xuICAgICAgYWNjW2FjdGlvbi5hY3Rpdml0eS5pZF0gPSBjcmVhdGVJbnZvY2FibGVBY3RvcihhY3Rpb24uYWN0aXZpdHksIF90aGlzLm1hY2hpbmUsIHVwZGF0ZWRDb250ZXh0LCBfZXZlbnQpO1xuICAgICAgcmV0dXJuIGFjYztcbiAgICB9LCBjdXJyZW50U3RhdGUgPyBfX2Fzc2lnbih7fSwgY3VycmVudFN0YXRlLmNoaWxkcmVuKSA6IHt9KTtcbiAgICB2YXIgcmVzb2x2ZWRDb25maWd1cmF0aW9uID0gcmVzb2x2ZWRTdGF0ZVZhbHVlID8gc3RhdGVUcmFuc2l0aW9uLmNvbmZpZ3VyYXRpb24gOiBjdXJyZW50U3RhdGUgPyBjdXJyZW50U3RhdGUuY29uZmlndXJhdGlvbiA6IFtdO1xuICAgIHZhciBtZXRhID0gcmVzb2x2ZWRDb25maWd1cmF0aW9uLnJlZHVjZShmdW5jdGlvbiAoYWNjLCBzdGF0ZU5vZGUpIHtcbiAgICAgIGlmIChzdGF0ZU5vZGUubWV0YSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIGFjY1tzdGF0ZU5vZGUuaWRdID0gc3RhdGVOb2RlLm1ldGE7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBhY2M7XG4gICAgfSwge30pO1xuICAgIHZhciBpc0RvbmUgPSBpc0luRmluYWxTdGF0ZShyZXNvbHZlZENvbmZpZ3VyYXRpb24sIHRoaXMpO1xuICAgIHZhciBuZXh0U3RhdGUgPSBuZXcgU3RhdGUoe1xuICAgICAgdmFsdWU6IHJlc29sdmVkU3RhdGVWYWx1ZSB8fCBjdXJyZW50U3RhdGUudmFsdWUsXG4gICAgICBjb250ZXh0OiB1cGRhdGVkQ29udGV4dCxcbiAgICAgIF9ldmVudDogX2V2ZW50LFxuICAgICAgLy8gUGVyc2lzdCBfc2Vzc2lvbmlkIGJldHdlZW4gc3RhdGVzXG4gICAgICBfc2Vzc2lvbmlkOiBjdXJyZW50U3RhdGUgPyBjdXJyZW50U3RhdGUuX3Nlc3Npb25pZCA6IG51bGwsXG4gICAgICBoaXN0b3J5VmFsdWU6IHJlc29sdmVkU3RhdGVWYWx1ZSA/IGhpc3RvcnlWYWx1ZSA/IHVwZGF0ZUhpc3RvcnlWYWx1ZShoaXN0b3J5VmFsdWUsIHJlc29sdmVkU3RhdGVWYWx1ZSkgOiB1bmRlZmluZWQgOiBjdXJyZW50U3RhdGUgPyBjdXJyZW50U3RhdGUuaGlzdG9yeVZhbHVlIDogdW5kZWZpbmVkLFxuICAgICAgaGlzdG9yeTogIXJlc29sdmVkU3RhdGVWYWx1ZSB8fCBzdGF0ZVRyYW5zaXRpb24uc291cmNlID8gY3VycmVudFN0YXRlIDogdW5kZWZpbmVkLFxuICAgICAgYWN0aW9uczogcmVzb2x2ZWRTdGF0ZVZhbHVlID8gbm9uUmFpc2VkQWN0aW9ucyA6IFtdLFxuICAgICAgYWN0aXZpdGllczogcmVzb2x2ZWRTdGF0ZVZhbHVlID8gYWN0aXZpdGllcyA6IGN1cnJlbnRTdGF0ZSA/IGN1cnJlbnRTdGF0ZS5hY3Rpdml0aWVzIDoge30sXG4gICAgICBtZXRhOiByZXNvbHZlZFN0YXRlVmFsdWUgPyBtZXRhIDogY3VycmVudFN0YXRlID8gY3VycmVudFN0YXRlLm1ldGEgOiB1bmRlZmluZWQsXG4gICAgICBldmVudHM6IFtdLFxuICAgICAgY29uZmlndXJhdGlvbjogcmVzb2x2ZWRDb25maWd1cmF0aW9uLFxuICAgICAgdHJhbnNpdGlvbnM6IHN0YXRlVHJhbnNpdGlvbi50cmFuc2l0aW9ucyxcbiAgICAgIGNoaWxkcmVuOiBjaGlsZHJlbixcbiAgICAgIGRvbmU6IGlzRG9uZVxuICAgIH0pO1xuICAgIHZhciBkaWRVcGRhdGVDb250ZXh0ID0gY3VycmVudENvbnRleHQgIT09IHVwZGF0ZWRDb250ZXh0O1xuICAgIG5leHRTdGF0ZS5jaGFuZ2VkID0gX2V2ZW50Lm5hbWUgPT09IHVwZGF0ZSB8fCBkaWRVcGRhdGVDb250ZXh0OyAvLyBEaXNwb3NlIG9mIHBlbnVsdGltYXRlIGhpc3RvcmllcyB0byBwcmV2ZW50IG1lbW9yeSBsZWFrc1xuXG4gICAgdmFyIGhpc3RvcnkgPSBuZXh0U3RhdGUuaGlzdG9yeTtcblxuICAgIGlmIChoaXN0b3J5KSB7XG4gICAgICBkZWxldGUgaGlzdG9yeS5oaXN0b3J5O1xuICAgIH1cblxuICAgIGlmICghcmVzb2x2ZWRTdGF0ZVZhbHVlKSB7XG4gICAgICByZXR1cm4gbmV4dFN0YXRlO1xuICAgIH1cblxuICAgIHZhciBtYXliZU5leHRTdGF0ZSA9IG5leHRTdGF0ZTtcblxuICAgIGlmICghaXNEb25lKSB7XG4gICAgICB2YXIgaXNUcmFuc2llbnQgPSB0aGlzLl90cmFuc2llbnQgfHwgY29uZmlndXJhdGlvbi5zb21lKGZ1bmN0aW9uIChzdGF0ZU5vZGUpIHtcbiAgICAgICAgcmV0dXJuIHN0YXRlTm9kZS5fdHJhbnNpZW50O1xuICAgICAgfSk7XG5cbiAgICAgIGlmIChpc1RyYW5zaWVudCkge1xuICAgICAgICBtYXliZU5leHRTdGF0ZSA9IHRoaXMucmVzb2x2ZVJhaXNlZFRyYW5zaXRpb24obWF5YmVOZXh0U3RhdGUsIHtcbiAgICAgICAgICB0eXBlOiBudWxsRXZlbnRcbiAgICAgICAgfSwgX2V2ZW50KTtcbiAgICAgIH1cblxuICAgICAgd2hpbGUgKHJhaXNlZEV2ZW50cy5sZW5ndGgpIHtcbiAgICAgICAgdmFyIHJhaXNlZEV2ZW50ID0gcmFpc2VkRXZlbnRzLnNoaWZ0KCk7XG4gICAgICAgIG1heWJlTmV4dFN0YXRlID0gdGhpcy5yZXNvbHZlUmFpc2VkVHJhbnNpdGlvbihtYXliZU5leHRTdGF0ZSwgcmFpc2VkRXZlbnQuX2V2ZW50LCBfZXZlbnQpO1xuICAgICAgfVxuICAgIH0gLy8gRGV0ZWN0IGlmIHN0YXRlIGNoYW5nZWRcblxuXG4gICAgdmFyIGNoYW5nZWQgPSBtYXliZU5leHRTdGF0ZS5jaGFuZ2VkIHx8IChoaXN0b3J5ID8gISFtYXliZU5leHRTdGF0ZS5hY3Rpb25zLmxlbmd0aCB8fCBkaWRVcGRhdGVDb250ZXh0IHx8IHR5cGVvZiBoaXN0b3J5LnZhbHVlICE9PSB0eXBlb2YgbWF5YmVOZXh0U3RhdGUudmFsdWUgfHwgIXN0YXRlVmFsdWVzRXF1YWwobWF5YmVOZXh0U3RhdGUudmFsdWUsIGhpc3RvcnkudmFsdWUpIDogdW5kZWZpbmVkKTtcbiAgICBtYXliZU5leHRTdGF0ZS5jaGFuZ2VkID0gY2hhbmdlZDsgLy8gUHJlc2VydmUgb3JpZ2luYWwgaGlzdG9yeSBhZnRlciByYWlzZWQgZXZlbnRzXG5cbiAgICBtYXliZU5leHRTdGF0ZS5oaXN0b3J5ID0gaGlzdG9yeTtcbiAgICByZXR1cm4gbWF5YmVOZXh0U3RhdGU7XG4gIH07XG4gIC8qKlxyXG4gICAqIFJldHVybnMgdGhlIGNoaWxkIHN0YXRlIG5vZGUgZnJvbSBpdHMgcmVsYXRpdmUgYHN0YXRlS2V5YCwgb3IgdGhyb3dzLlxyXG4gICAqL1xuXG5cbiAgU3RhdGVOb2RlLnByb3RvdHlwZS5nZXRTdGF0ZU5vZGUgPSBmdW5jdGlvbiAoc3RhdGVLZXkpIHtcbiAgICBpZiAoaXNTdGF0ZUlkKHN0YXRlS2V5KSkge1xuICAgICAgcmV0dXJuIHRoaXMubWFjaGluZS5nZXRTdGF0ZU5vZGVCeUlkKHN0YXRlS2V5KTtcbiAgICB9XG5cbiAgICBpZiAoIXRoaXMuc3RhdGVzKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXCJVbmFibGUgdG8gcmV0cmlldmUgY2hpbGQgc3RhdGUgJ1wiICsgc3RhdGVLZXkgKyBcIicgZnJvbSAnXCIgKyB0aGlzLmlkICsgXCInOyBubyBjaGlsZCBzdGF0ZXMgZXhpc3QuXCIpO1xuICAgIH1cblxuICAgIHZhciByZXN1bHQgPSB0aGlzLnN0YXRlc1tzdGF0ZUtleV07XG5cbiAgICBpZiAoIXJlc3VsdCkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKFwiQ2hpbGQgc3RhdGUgJ1wiICsgc3RhdGVLZXkgKyBcIicgZG9lcyBub3QgZXhpc3Qgb24gJ1wiICsgdGhpcy5pZCArIFwiJ1wiKTtcbiAgICB9XG5cbiAgICByZXR1cm4gcmVzdWx0O1xuICB9O1xuICAvKipcclxuICAgKiBSZXR1cm5zIHRoZSBzdGF0ZSBub2RlIHdpdGggdGhlIGdpdmVuIGBzdGF0ZUlkYCwgb3IgdGhyb3dzLlxyXG4gICAqXHJcbiAgICogQHBhcmFtIHN0YXRlSWQgVGhlIHN0YXRlIElELiBUaGUgcHJlZml4IFwiI1wiIGlzIHJlbW92ZWQuXHJcbiAgICovXG5cblxuICBTdGF0ZU5vZGUucHJvdG90eXBlLmdldFN0YXRlTm9kZUJ5SWQgPSBmdW5jdGlvbiAoc3RhdGVJZCkge1xuICAgIHZhciByZXNvbHZlZFN0YXRlSWQgPSBpc1N0YXRlSWQoc3RhdGVJZCkgPyBzdGF0ZUlkLnNsaWNlKFNUQVRFX0lERU5USUZJRVIubGVuZ3RoKSA6IHN0YXRlSWQ7XG5cbiAgICBpZiAocmVzb2x2ZWRTdGF0ZUlkID09PSB0aGlzLmlkKSB7XG4gICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICB2YXIgc3RhdGVOb2RlID0gdGhpcy5tYWNoaW5lLmlkTWFwW3Jlc29sdmVkU3RhdGVJZF07XG5cbiAgICBpZiAoIXN0YXRlTm9kZSkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKFwiQ2hpbGQgc3RhdGUgbm9kZSAnI1wiICsgcmVzb2x2ZWRTdGF0ZUlkICsgXCInIGRvZXMgbm90IGV4aXN0IG9uIG1hY2hpbmUgJ1wiICsgdGhpcy5pZCArIFwiJ1wiKTtcbiAgICB9XG5cbiAgICByZXR1cm4gc3RhdGVOb2RlO1xuICB9O1xuICAvKipcclxuICAgKiBSZXR1cm5zIHRoZSByZWxhdGl2ZSBzdGF0ZSBub2RlIGZyb20gdGhlIGdpdmVuIGBzdGF0ZVBhdGhgLCBvciB0aHJvd3MuXHJcbiAgICpcclxuICAgKiBAcGFyYW0gc3RhdGVQYXRoIFRoZSBzdHJpbmcgb3Igc3RyaW5nIGFycmF5IHJlbGF0aXZlIHBhdGggdG8gdGhlIHN0YXRlIG5vZGUuXHJcbiAgICovXG5cblxuICBTdGF0ZU5vZGUucHJvdG90eXBlLmdldFN0YXRlTm9kZUJ5UGF0aCA9IGZ1bmN0aW9uIChzdGF0ZVBhdGgpIHtcbiAgICBpZiAodHlwZW9mIHN0YXRlUGF0aCA9PT0gJ3N0cmluZycgJiYgaXNTdGF0ZUlkKHN0YXRlUGF0aCkpIHtcbiAgICAgIHRyeSB7XG4gICAgICAgIHJldHVybiB0aGlzLmdldFN0YXRlTm9kZUJ5SWQoc3RhdGVQYXRoLnNsaWNlKDEpKTtcbiAgICAgIH0gY2F0Y2ggKGUpIHsvLyB0cnkgaW5kaXZpZHVhbCBwYXRoc1xuICAgICAgICAvLyB0aHJvdyBlO1xuICAgICAgfVxuICAgIH1cblxuICAgIHZhciBhcnJheVN0YXRlUGF0aCA9IHRvU3RhdGVQYXRoKHN0YXRlUGF0aCwgdGhpcy5kZWxpbWl0ZXIpLnNsaWNlKCk7XG4gICAgdmFyIGN1cnJlbnRTdGF0ZU5vZGUgPSB0aGlzO1xuXG4gICAgd2hpbGUgKGFycmF5U3RhdGVQYXRoLmxlbmd0aCkge1xuICAgICAgdmFyIGtleSA9IGFycmF5U3RhdGVQYXRoLnNoaWZ0KCk7XG5cbiAgICAgIGlmICgha2V5Lmxlbmd0aCkge1xuICAgICAgICBicmVhaztcbiAgICAgIH1cblxuICAgICAgY3VycmVudFN0YXRlTm9kZSA9IGN1cnJlbnRTdGF0ZU5vZGUuZ2V0U3RhdGVOb2RlKGtleSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIGN1cnJlbnRTdGF0ZU5vZGU7XG4gIH07XG4gIC8qKlxyXG4gICAqIFJlc29sdmVzIGEgcGFydGlhbCBzdGF0ZSB2YWx1ZSB3aXRoIGl0cyBmdWxsIHJlcHJlc2VudGF0aW9uIGluIHRoaXMgbWFjaGluZS5cclxuICAgKlxyXG4gICAqIEBwYXJhbSBzdGF0ZVZhbHVlIFRoZSBwYXJ0aWFsIHN0YXRlIHZhbHVlIHRvIHJlc29sdmUuXHJcbiAgICovXG5cblxuICBTdGF0ZU5vZGUucHJvdG90eXBlLnJlc29sdmUgPSBmdW5jdGlvbiAoc3RhdGVWYWx1ZSkge1xuICAgIHZhciBfYTtcblxuICAgIHZhciBfdGhpcyA9IHRoaXM7XG5cbiAgICBpZiAoIXN0YXRlVmFsdWUpIHtcbiAgICAgIHJldHVybiB0aGlzLmluaXRpYWxTdGF0ZVZhbHVlIHx8IEVNUFRZX09CSkVDVDsgLy8gVE9ETzogdHlwZS1zcGVjaWZpYyBwcm9wZXJ0aWVzXG4gICAgfVxuXG4gICAgc3dpdGNoICh0aGlzLnR5cGUpIHtcbiAgICAgIGNhc2UgJ3BhcmFsbGVsJzpcbiAgICAgICAgcmV0dXJuIG1hcFZhbHVlcyh0aGlzLmluaXRpYWxTdGF0ZVZhbHVlLCBmdW5jdGlvbiAoc3ViU3RhdGVWYWx1ZSwgc3ViU3RhdGVLZXkpIHtcbiAgICAgICAgICByZXR1cm4gc3ViU3RhdGVWYWx1ZSA/IF90aGlzLmdldFN0YXRlTm9kZShzdWJTdGF0ZUtleSkucmVzb2x2ZShzdGF0ZVZhbHVlW3N1YlN0YXRlS2V5XSB8fCBzdWJTdGF0ZVZhbHVlKSA6IEVNUFRZX09CSkVDVDtcbiAgICAgICAgfSk7XG5cbiAgICAgIGNhc2UgJ2NvbXBvdW5kJzpcbiAgICAgICAgaWYgKGlzU3RyaW5nKHN0YXRlVmFsdWUpKSB7XG4gICAgICAgICAgdmFyIHN1YlN0YXRlTm9kZSA9IHRoaXMuZ2V0U3RhdGVOb2RlKHN0YXRlVmFsdWUpO1xuXG4gICAgICAgICAgaWYgKHN1YlN0YXRlTm9kZS50eXBlID09PSAncGFyYWxsZWwnIHx8IHN1YlN0YXRlTm9kZS50eXBlID09PSAnY29tcG91bmQnKSB7XG4gICAgICAgICAgICByZXR1cm4gX2EgPSB7fSwgX2Fbc3RhdGVWYWx1ZV0gPSBzdWJTdGF0ZU5vZGUuaW5pdGlhbFN0YXRlVmFsdWUsIF9hO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIHJldHVybiBzdGF0ZVZhbHVlO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKCFrZXlzKHN0YXRlVmFsdWUpLmxlbmd0aCkge1xuICAgICAgICAgIHJldHVybiB0aGlzLmluaXRpYWxTdGF0ZVZhbHVlIHx8IHt9O1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIG1hcFZhbHVlcyhzdGF0ZVZhbHVlLCBmdW5jdGlvbiAoc3ViU3RhdGVWYWx1ZSwgc3ViU3RhdGVLZXkpIHtcbiAgICAgICAgICByZXR1cm4gc3ViU3RhdGVWYWx1ZSA/IF90aGlzLmdldFN0YXRlTm9kZShzdWJTdGF0ZUtleSkucmVzb2x2ZShzdWJTdGF0ZVZhbHVlKSA6IEVNUFRZX09CSkVDVDtcbiAgICAgICAgfSk7XG5cbiAgICAgIGRlZmF1bHQ6XG4gICAgICAgIHJldHVybiBzdGF0ZVZhbHVlIHx8IEVNUFRZX09CSkVDVDtcbiAgICB9XG4gIH07XG5cbiAgU3RhdGVOb2RlLnByb3RvdHlwZS5nZXRSZXNvbHZlZFBhdGggPSBmdW5jdGlvbiAoc3RhdGVJZGVudGlmaWVyKSB7XG4gICAgaWYgKGlzU3RhdGVJZChzdGF0ZUlkZW50aWZpZXIpKSB7XG4gICAgICB2YXIgc3RhdGVOb2RlID0gdGhpcy5tYWNoaW5lLmlkTWFwW3N0YXRlSWRlbnRpZmllci5zbGljZShTVEFURV9JREVOVElGSUVSLmxlbmd0aCldO1xuXG4gICAgICBpZiAoIXN0YXRlTm9kZSkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJVbmFibGUgdG8gZmluZCBzdGF0ZSBub2RlICdcIiArIHN0YXRlSWRlbnRpZmllciArIFwiJ1wiKTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHN0YXRlTm9kZS5wYXRoO1xuICAgIH1cblxuICAgIHJldHVybiB0b1N0YXRlUGF0aChzdGF0ZUlkZW50aWZpZXIsIHRoaXMuZGVsaW1pdGVyKTtcbiAgfTtcblxuICBPYmplY3QuZGVmaW5lUHJvcGVydHkoU3RhdGVOb2RlLnByb3RvdHlwZSwgXCJpbml0aWFsU3RhdGVWYWx1ZVwiLCB7XG4gICAgZ2V0OiBmdW5jdGlvbiAoKSB7XG4gICAgICB2YXIgX2E7XG5cbiAgICAgIGlmICh0aGlzLl9fY2FjaGUuaW5pdGlhbFN0YXRlVmFsdWUpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX19jYWNoZS5pbml0aWFsU3RhdGVWYWx1ZTtcbiAgICAgIH1cblxuICAgICAgdmFyIGluaXRpYWxTdGF0ZVZhbHVlO1xuXG4gICAgICBpZiAodGhpcy50eXBlID09PSAncGFyYWxsZWwnKSB7XG4gICAgICAgIGluaXRpYWxTdGF0ZVZhbHVlID0gbWFwRmlsdGVyVmFsdWVzKHRoaXMuc3RhdGVzLCBmdW5jdGlvbiAoc3RhdGUpIHtcbiAgICAgICAgICByZXR1cm4gc3RhdGUuaW5pdGlhbFN0YXRlVmFsdWUgfHwgRU1QVFlfT0JKRUNUO1xuICAgICAgICB9LCBmdW5jdGlvbiAoc3RhdGVOb2RlKSB7XG4gICAgICAgICAgcmV0dXJuICEoc3RhdGVOb2RlLnR5cGUgPT09ICdoaXN0b3J5Jyk7XG4gICAgICAgIH0pO1xuICAgICAgfSBlbHNlIGlmICh0aGlzLmluaXRpYWwgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICBpZiAoIXRoaXMuc3RhdGVzW3RoaXMuaW5pdGlhbF0pIHtcbiAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJJbml0aWFsIHN0YXRlICdcIiArIHRoaXMuaW5pdGlhbCArIFwiJyBub3QgZm91bmQgb24gJ1wiICsgdGhpcy5rZXkgKyBcIidcIik7XG4gICAgICAgIH1cblxuICAgICAgICBpbml0aWFsU3RhdGVWYWx1ZSA9IGlzTGVhZk5vZGUodGhpcy5zdGF0ZXNbdGhpcy5pbml0aWFsXSkgPyB0aGlzLmluaXRpYWwgOiAoX2EgPSB7fSwgX2FbdGhpcy5pbml0aWFsXSA9IHRoaXMuc3RhdGVzW3RoaXMuaW5pdGlhbF0uaW5pdGlhbFN0YXRlVmFsdWUsIF9hKTtcbiAgICAgIH1cblxuICAgICAgdGhpcy5fX2NhY2hlLmluaXRpYWxTdGF0ZVZhbHVlID0gaW5pdGlhbFN0YXRlVmFsdWU7XG4gICAgICByZXR1cm4gdGhpcy5fX2NhY2hlLmluaXRpYWxTdGF0ZVZhbHVlO1xuICAgIH0sXG4gICAgZW51bWVyYWJsZTogZmFsc2UsXG4gICAgY29uZmlndXJhYmxlOiB0cnVlXG4gIH0pO1xuXG4gIFN0YXRlTm9kZS5wcm90b3R5cGUuZ2V0SW5pdGlhbFN0YXRlID0gZnVuY3Rpb24gKHN0YXRlVmFsdWUsIGNvbnRleHQpIHtcbiAgICB2YXIgY29uZmlndXJhdGlvbiA9IHRoaXMuZ2V0U3RhdGVOb2RlcyhzdGF0ZVZhbHVlKTtcbiAgICByZXR1cm4gdGhpcy5yZXNvbHZlVHJhbnNpdGlvbih7XG4gICAgICBjb25maWd1cmF0aW9uOiBjb25maWd1cmF0aW9uLFxuICAgICAgZW50cnlTZXQ6IGNvbmZpZ3VyYXRpb24sXG4gICAgICBleGl0U2V0OiBbXSxcbiAgICAgIHRyYW5zaXRpb25zOiBbXSxcbiAgICAgIHNvdXJjZTogdW5kZWZpbmVkLFxuICAgICAgYWN0aW9uczogW11cbiAgICB9LCB1bmRlZmluZWQsIHVuZGVmaW5lZCwgY29udGV4dCk7XG4gIH07XG5cbiAgT2JqZWN0LmRlZmluZVByb3BlcnR5KFN0YXRlTm9kZS5wcm90b3R5cGUsIFwiaW5pdGlhbFN0YXRlXCIsIHtcbiAgICAvKipcclxuICAgICAqIFRoZSBpbml0aWFsIFN0YXRlIGluc3RhbmNlLCB3aGljaCBpbmNsdWRlcyBhbGwgYWN0aW9ucyB0byBiZSBleGVjdXRlZCBmcm9tXHJcbiAgICAgKiBlbnRlcmluZyB0aGUgaW5pdGlhbCBzdGF0ZS5cclxuICAgICAqL1xuICAgIGdldDogZnVuY3Rpb24gKCkge1xuICAgICAgdGhpcy5faW5pdCgpOyAvLyBUT0RPOiB0aGlzIHNob3VsZCBiZSBpbiB0aGUgY29uc3RydWN0b3IgKHNlZSBub3RlIGluIGNvbnN0cnVjdG9yKVxuXG5cbiAgICAgIHZhciBpbml0aWFsU3RhdGVWYWx1ZSA9IHRoaXMuaW5pdGlhbFN0YXRlVmFsdWU7XG5cbiAgICAgIGlmICghaW5pdGlhbFN0YXRlVmFsdWUpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiQ2Fubm90IHJldHJpZXZlIGluaXRpYWwgc3RhdGUgZnJvbSBzaW1wbGUgc3RhdGUgJ1wiICsgdGhpcy5pZCArIFwiJy5cIik7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiB0aGlzLmdldEluaXRpYWxTdGF0ZShpbml0aWFsU3RhdGVWYWx1ZSk7XG4gICAgfSxcbiAgICBlbnVtZXJhYmxlOiBmYWxzZSxcbiAgICBjb25maWd1cmFibGU6IHRydWVcbiAgfSk7XG4gIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShTdGF0ZU5vZGUucHJvdG90eXBlLCBcInRhcmdldFwiLCB7XG4gICAgLyoqXHJcbiAgICAgKiBUaGUgdGFyZ2V0IHN0YXRlIHZhbHVlIG9mIHRoZSBoaXN0b3J5IHN0YXRlIG5vZGUsIGlmIGl0IGV4aXN0cy4gVGhpcyByZXByZXNlbnRzIHRoZVxyXG4gICAgICogZGVmYXVsdCBzdGF0ZSB2YWx1ZSB0byB0cmFuc2l0aW9uIHRvIGlmIG5vIGhpc3RvcnkgdmFsdWUgZXhpc3RzIHlldC5cclxuICAgICAqL1xuICAgIGdldDogZnVuY3Rpb24gKCkge1xuICAgICAgdmFyIHRhcmdldDtcblxuICAgICAgaWYgKHRoaXMudHlwZSA9PT0gJ2hpc3RvcnknKSB7XG4gICAgICAgIHZhciBoaXN0b3J5Q29uZmlnID0gdGhpcy5jb25maWc7XG5cbiAgICAgICAgaWYgKGlzU3RyaW5nKGhpc3RvcnlDb25maWcudGFyZ2V0KSkge1xuICAgICAgICAgIHRhcmdldCA9IGlzU3RhdGVJZChoaXN0b3J5Q29uZmlnLnRhcmdldCkgPyBwYXRoVG9TdGF0ZVZhbHVlKHRoaXMubWFjaGluZS5nZXRTdGF0ZU5vZGVCeUlkKGhpc3RvcnlDb25maWcudGFyZ2V0KS5wYXRoLnNsaWNlKHRoaXMucGF0aC5sZW5ndGggLSAxKSkgOiBoaXN0b3J5Q29uZmlnLnRhcmdldDtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB0YXJnZXQgPSBoaXN0b3J5Q29uZmlnLnRhcmdldDtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICByZXR1cm4gdGFyZ2V0O1xuICAgIH0sXG4gICAgZW51bWVyYWJsZTogZmFsc2UsXG4gICAgY29uZmlndXJhYmxlOiB0cnVlXG4gIH0pO1xuICAvKipcclxuICAgKiBSZXR1cm5zIHRoZSBsZWFmIG5vZGVzIGZyb20gYSBzdGF0ZSBwYXRoIHJlbGF0aXZlIHRvIHRoaXMgc3RhdGUgbm9kZS5cclxuICAgKlxyXG4gICAqIEBwYXJhbSByZWxhdGl2ZVN0YXRlSWQgVGhlIHJlbGF0aXZlIHN0YXRlIHBhdGggdG8gcmV0cmlldmUgdGhlIHN0YXRlIG5vZGVzXHJcbiAgICogQHBhcmFtIGhpc3RvcnkgVGhlIHByZXZpb3VzIHN0YXRlIHRvIHJldHJpZXZlIGhpc3RvcnlcclxuICAgKiBAcGFyYW0gcmVzb2x2ZSBXaGV0aGVyIHN0YXRlIG5vZGVzIHNob3VsZCByZXNvbHZlIHRvIGluaXRpYWwgY2hpbGQgc3RhdGUgbm9kZXNcclxuICAgKi9cblxuICBTdGF0ZU5vZGUucHJvdG90eXBlLmdldFJlbGF0aXZlU3RhdGVOb2RlcyA9IGZ1bmN0aW9uIChyZWxhdGl2ZVN0YXRlSWQsIGhpc3RvcnlWYWx1ZSwgcmVzb2x2ZSkge1xuICAgIGlmIChyZXNvbHZlID09PSB2b2lkIDApIHtcbiAgICAgIHJlc29sdmUgPSB0cnVlO1xuICAgIH1cblxuICAgIHJldHVybiByZXNvbHZlID8gcmVsYXRpdmVTdGF0ZUlkLnR5cGUgPT09ICdoaXN0b3J5JyA/IHJlbGF0aXZlU3RhdGVJZC5yZXNvbHZlSGlzdG9yeShoaXN0b3J5VmFsdWUpIDogcmVsYXRpdmVTdGF0ZUlkLmluaXRpYWxTdGF0ZU5vZGVzIDogW3JlbGF0aXZlU3RhdGVJZF07XG4gIH07XG5cbiAgT2JqZWN0LmRlZmluZVByb3BlcnR5KFN0YXRlTm9kZS5wcm90b3R5cGUsIFwiaW5pdGlhbFN0YXRlTm9kZXNcIiwge1xuICAgIGdldDogZnVuY3Rpb24gKCkge1xuICAgICAgdmFyIF90aGlzID0gdGhpcztcblxuICAgICAgaWYgKGlzTGVhZk5vZGUodGhpcykpIHtcbiAgICAgICAgcmV0dXJuIFt0aGlzXTtcbiAgICAgIH0gLy8gQ2FzZSB3aGVuIHN0YXRlIG5vZGUgaXMgY29tcG91bmQgYnV0IG5vIGluaXRpYWwgc3RhdGUgaXMgZGVmaW5lZFxuXG5cbiAgICAgIGlmICh0aGlzLnR5cGUgPT09ICdjb21wb3VuZCcgJiYgIXRoaXMuaW5pdGlhbCkge1xuICAgICAgICBpZiAoIUlTX1BST0RVQ1RJT04pIHtcbiAgICAgICAgICB3YXJuKGZhbHNlLCBcIkNvbXBvdW5kIHN0YXRlIG5vZGUgJ1wiICsgdGhpcy5pZCArIFwiJyBoYXMgbm8gaW5pdGlhbCBzdGF0ZS5cIik7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gW3RoaXNdO1xuICAgICAgfVxuXG4gICAgICB2YXIgaW5pdGlhbFN0YXRlTm9kZVBhdGhzID0gdG9TdGF0ZVBhdGhzKHRoaXMuaW5pdGlhbFN0YXRlVmFsdWUpO1xuICAgICAgcmV0dXJuIGZsYXR0ZW4oaW5pdGlhbFN0YXRlTm9kZVBhdGhzLm1hcChmdW5jdGlvbiAoaW5pdGlhbFBhdGgpIHtcbiAgICAgICAgcmV0dXJuIF90aGlzLmdldEZyb21SZWxhdGl2ZVBhdGgoaW5pdGlhbFBhdGgpO1xuICAgICAgfSkpO1xuICAgIH0sXG4gICAgZW51bWVyYWJsZTogZmFsc2UsXG4gICAgY29uZmlndXJhYmxlOiB0cnVlXG4gIH0pO1xuICAvKipcclxuICAgKiBSZXRyaWV2ZXMgc3RhdGUgbm9kZXMgZnJvbSBhIHJlbGF0aXZlIHBhdGggdG8gdGhpcyBzdGF0ZSBub2RlLlxyXG4gICAqXHJcbiAgICogQHBhcmFtIHJlbGF0aXZlUGF0aCBUaGUgcmVsYXRpdmUgcGF0aCBmcm9tIHRoaXMgc3RhdGUgbm9kZVxyXG4gICAqIEBwYXJhbSBoaXN0b3J5VmFsdWVcclxuICAgKi9cblxuICBTdGF0ZU5vZGUucHJvdG90eXBlLmdldEZyb21SZWxhdGl2ZVBhdGggPSBmdW5jdGlvbiAocmVsYXRpdmVQYXRoKSB7XG4gICAgaWYgKCFyZWxhdGl2ZVBhdGgubGVuZ3RoKSB7XG4gICAgICByZXR1cm4gW3RoaXNdO1xuICAgIH1cblxuICAgIHZhciBfYSA9IF9fcmVhZChyZWxhdGl2ZVBhdGgpLFxuICAgICAgICBzdGF0ZUtleSA9IF9hWzBdLFxuICAgICAgICBjaGlsZFN0YXRlUGF0aCA9IF9hLnNsaWNlKDEpO1xuXG4gICAgaWYgKCF0aGlzLnN0YXRlcykge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKFwiQ2Fubm90IHJldHJpZXZlIHN1YlBhdGggJ1wiICsgc3RhdGVLZXkgKyBcIicgZnJvbSBub2RlIHdpdGggbm8gc3RhdGVzXCIpO1xuICAgIH1cblxuICAgIHZhciBjaGlsZFN0YXRlTm9kZSA9IHRoaXMuZ2V0U3RhdGVOb2RlKHN0YXRlS2V5KTtcblxuICAgIGlmIChjaGlsZFN0YXRlTm9kZS50eXBlID09PSAnaGlzdG9yeScpIHtcbiAgICAgIHJldHVybiBjaGlsZFN0YXRlTm9kZS5yZXNvbHZlSGlzdG9yeSgpO1xuICAgIH1cblxuICAgIGlmICghdGhpcy5zdGF0ZXNbc3RhdGVLZXldKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXCJDaGlsZCBzdGF0ZSAnXCIgKyBzdGF0ZUtleSArIFwiJyBkb2VzIG5vdCBleGlzdCBvbiAnXCIgKyB0aGlzLmlkICsgXCInXCIpO1xuICAgIH1cblxuICAgIHJldHVybiB0aGlzLnN0YXRlc1tzdGF0ZUtleV0uZ2V0RnJvbVJlbGF0aXZlUGF0aChjaGlsZFN0YXRlUGF0aCk7XG4gIH07XG5cbiAgU3RhdGVOb2RlLnByb3RvdHlwZS5oaXN0b3J5VmFsdWUgPSBmdW5jdGlvbiAocmVsYXRpdmVTdGF0ZVZhbHVlKSB7XG4gICAgaWYgKCFrZXlzKHRoaXMuc3RhdGVzKS5sZW5ndGgpIHtcbiAgICAgIHJldHVybiB1bmRlZmluZWQ7XG4gICAgfVxuXG4gICAgcmV0dXJuIHtcbiAgICAgIGN1cnJlbnQ6IHJlbGF0aXZlU3RhdGVWYWx1ZSB8fCB0aGlzLmluaXRpYWxTdGF0ZVZhbHVlLFxuICAgICAgc3RhdGVzOiBtYXBGaWx0ZXJWYWx1ZXModGhpcy5zdGF0ZXMsIGZ1bmN0aW9uIChzdGF0ZU5vZGUsIGtleSkge1xuICAgICAgICBpZiAoIXJlbGF0aXZlU3RhdGVWYWx1ZSkge1xuICAgICAgICAgIHJldHVybiBzdGF0ZU5vZGUuaGlzdG9yeVZhbHVlKCk7XG4gICAgICAgIH1cblxuICAgICAgICB2YXIgc3ViU3RhdGVWYWx1ZSA9IGlzU3RyaW5nKHJlbGF0aXZlU3RhdGVWYWx1ZSkgPyB1bmRlZmluZWQgOiByZWxhdGl2ZVN0YXRlVmFsdWVba2V5XTtcbiAgICAgICAgcmV0dXJuIHN0YXRlTm9kZS5oaXN0b3J5VmFsdWUoc3ViU3RhdGVWYWx1ZSB8fCBzdGF0ZU5vZGUuaW5pdGlhbFN0YXRlVmFsdWUpO1xuICAgICAgfSwgZnVuY3Rpb24gKHN0YXRlTm9kZSkge1xuICAgICAgICByZXR1cm4gIXN0YXRlTm9kZS5oaXN0b3J5O1xuICAgICAgfSlcbiAgICB9O1xuICB9O1xuICAvKipcclxuICAgKiBSZXNvbHZlcyB0byB0aGUgaGlzdG9yaWNhbCB2YWx1ZShzKSBvZiB0aGUgcGFyZW50IHN0YXRlIG5vZGUsXHJcbiAgICogcmVwcmVzZW50ZWQgYnkgc3RhdGUgbm9kZXMuXHJcbiAgICpcclxuICAgKiBAcGFyYW0gaGlzdG9yeVZhbHVlXHJcbiAgICovXG5cblxuICBTdGF0ZU5vZGUucHJvdG90eXBlLnJlc29sdmVIaXN0b3J5ID0gZnVuY3Rpb24gKGhpc3RvcnlWYWx1ZSkge1xuICAgIHZhciBfdGhpcyA9IHRoaXM7XG5cbiAgICBpZiAodGhpcy50eXBlICE9PSAnaGlzdG9yeScpIHtcbiAgICAgIHJldHVybiBbdGhpc107XG4gICAgfVxuXG4gICAgdmFyIHBhcmVudCA9IHRoaXMucGFyZW50O1xuXG4gICAgaWYgKCFoaXN0b3J5VmFsdWUpIHtcbiAgICAgIHZhciBoaXN0b3J5VGFyZ2V0ID0gdGhpcy50YXJnZXQ7XG4gICAgICByZXR1cm4gaGlzdG9yeVRhcmdldCA/IGZsYXR0ZW4odG9TdGF0ZVBhdGhzKGhpc3RvcnlUYXJnZXQpLm1hcChmdW5jdGlvbiAocmVsYXRpdmVDaGlsZFBhdGgpIHtcbiAgICAgICAgcmV0dXJuIHBhcmVudC5nZXRGcm9tUmVsYXRpdmVQYXRoKHJlbGF0aXZlQ2hpbGRQYXRoKTtcbiAgICAgIH0pKSA6IHBhcmVudC5pbml0aWFsU3RhdGVOb2RlcztcbiAgICB9XG5cbiAgICB2YXIgc3ViSGlzdG9yeVZhbHVlID0gbmVzdGVkUGF0aChwYXJlbnQucGF0aCwgJ3N0YXRlcycpKGhpc3RvcnlWYWx1ZSkuY3VycmVudDtcblxuICAgIGlmIChpc1N0cmluZyhzdWJIaXN0b3J5VmFsdWUpKSB7XG4gICAgICByZXR1cm4gW3BhcmVudC5nZXRTdGF0ZU5vZGUoc3ViSGlzdG9yeVZhbHVlKV07XG4gICAgfVxuXG4gICAgcmV0dXJuIGZsYXR0ZW4odG9TdGF0ZVBhdGhzKHN1Ykhpc3RvcnlWYWx1ZSkubWFwKGZ1bmN0aW9uIChzdWJTdGF0ZVBhdGgpIHtcbiAgICAgIHJldHVybiBfdGhpcy5oaXN0b3J5ID09PSAnZGVlcCcgPyBwYXJlbnQuZ2V0RnJvbVJlbGF0aXZlUGF0aChzdWJTdGF0ZVBhdGgpIDogW3BhcmVudC5zdGF0ZXNbc3ViU3RhdGVQYXRoWzBdXV07XG4gICAgfSkpO1xuICB9O1xuXG4gIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShTdGF0ZU5vZGUucHJvdG90eXBlLCBcInN0YXRlSWRzXCIsIHtcbiAgICAvKipcclxuICAgICAqIEFsbCB0aGUgc3RhdGUgbm9kZSBJRHMgb2YgdGhpcyBzdGF0ZSBub2RlIGFuZCBpdHMgZGVzY2VuZGFudCBzdGF0ZSBub2Rlcy5cclxuICAgICAqL1xuICAgIGdldDogZnVuY3Rpb24gKCkge1xuICAgICAgdmFyIF90aGlzID0gdGhpcztcblxuICAgICAgdmFyIGNoaWxkU3RhdGVJZHMgPSBmbGF0dGVuKGtleXModGhpcy5zdGF0ZXMpLm1hcChmdW5jdGlvbiAoc3RhdGVLZXkpIHtcbiAgICAgICAgcmV0dXJuIF90aGlzLnN0YXRlc1tzdGF0ZUtleV0uc3RhdGVJZHM7XG4gICAgICB9KSk7XG4gICAgICByZXR1cm4gW3RoaXMuaWRdLmNvbmNhdChjaGlsZFN0YXRlSWRzKTtcbiAgICB9LFxuICAgIGVudW1lcmFibGU6IGZhbHNlLFxuICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZVxuICB9KTtcbiAgT2JqZWN0LmRlZmluZVByb3BlcnR5KFN0YXRlTm9kZS5wcm90b3R5cGUsIFwiZXZlbnRzXCIsIHtcbiAgICAvKipcclxuICAgICAqIEFsbCB0aGUgZXZlbnQgdHlwZXMgYWNjZXB0ZWQgYnkgdGhpcyBzdGF0ZSBub2RlIGFuZCBpdHMgZGVzY2VuZGFudHMuXHJcbiAgICAgKi9cbiAgICBnZXQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgIHZhciBlXzcsIF9hLCBlXzgsIF9iO1xuXG4gICAgICBpZiAodGhpcy5fX2NhY2hlLmV2ZW50cykge1xuICAgICAgICByZXR1cm4gdGhpcy5fX2NhY2hlLmV2ZW50cztcbiAgICAgIH1cblxuICAgICAgdmFyIHN0YXRlcyA9IHRoaXMuc3RhdGVzO1xuICAgICAgdmFyIGV2ZW50cyA9IG5ldyBTZXQodGhpcy5vd25FdmVudHMpO1xuXG4gICAgICBpZiAoc3RhdGVzKSB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgZm9yICh2YXIgX2MgPSBfX3ZhbHVlcyhrZXlzKHN0YXRlcykpLCBfZCA9IF9jLm5leHQoKTsgIV9kLmRvbmU7IF9kID0gX2MubmV4dCgpKSB7XG4gICAgICAgICAgICB2YXIgc3RhdGVJZCA9IF9kLnZhbHVlO1xuICAgICAgICAgICAgdmFyIHN0YXRlID0gc3RhdGVzW3N0YXRlSWRdO1xuXG4gICAgICAgICAgICBpZiAoc3RhdGUuc3RhdGVzKSB7XG4gICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgZm9yICh2YXIgX2UgPSAoZV84ID0gdm9pZCAwLCBfX3ZhbHVlcyhzdGF0ZS5ldmVudHMpKSwgX2YgPSBfZS5uZXh0KCk7ICFfZi5kb25lOyBfZiA9IF9lLm5leHQoKSkge1xuICAgICAgICAgICAgICAgICAgdmFyIGV2ZW50XzEgPSBfZi52YWx1ZTtcbiAgICAgICAgICAgICAgICAgIGV2ZW50cy5hZGQoXCJcIiArIGV2ZW50XzEpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgfSBjYXRjaCAoZV84XzEpIHtcbiAgICAgICAgICAgICAgICBlXzggPSB7XG4gICAgICAgICAgICAgICAgICBlcnJvcjogZV84XzFcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICB9IGZpbmFsbHkge1xuICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICBpZiAoX2YgJiYgIV9mLmRvbmUgJiYgKF9iID0gX2UucmV0dXJuKSkgX2IuY2FsbChfZSk7XG4gICAgICAgICAgICAgICAgfSBmaW5hbGx5IHtcbiAgICAgICAgICAgICAgICAgIGlmIChlXzgpIHRocm93IGVfOC5lcnJvcjtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH0gY2F0Y2ggKGVfN18xKSB7XG4gICAgICAgICAgZV83ID0ge1xuICAgICAgICAgICAgZXJyb3I6IGVfN18xXG4gICAgICAgICAgfTtcbiAgICAgICAgfSBmaW5hbGx5IHtcbiAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgaWYgKF9kICYmICFfZC5kb25lICYmIChfYSA9IF9jLnJldHVybikpIF9hLmNhbGwoX2MpO1xuICAgICAgICAgIH0gZmluYWxseSB7XG4gICAgICAgICAgICBpZiAoZV83KSB0aHJvdyBlXzcuZXJyb3I7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIHJldHVybiB0aGlzLl9fY2FjaGUuZXZlbnRzID0gQXJyYXkuZnJvbShldmVudHMpO1xuICAgIH0sXG4gICAgZW51bWVyYWJsZTogZmFsc2UsXG4gICAgY29uZmlndXJhYmxlOiB0cnVlXG4gIH0pO1xuICBPYmplY3QuZGVmaW5lUHJvcGVydHkoU3RhdGVOb2RlLnByb3RvdHlwZSwgXCJvd25FdmVudHNcIiwge1xuICAgIC8qKlxyXG4gICAgICogQWxsIHRoZSBldmVudHMgdGhhdCBoYXZlIHRyYW5zaXRpb25zIGRpcmVjdGx5IGZyb20gdGhpcyBzdGF0ZSBub2RlLlxyXG4gICAgICpcclxuICAgICAqIEV4Y2x1ZGVzIGFueSBpbmVydCBldmVudHMuXHJcbiAgICAgKi9cbiAgICBnZXQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgIHZhciBldmVudHMgPSBuZXcgU2V0KHRoaXMudHJhbnNpdGlvbnMuZmlsdGVyKGZ1bmN0aW9uICh0cmFuc2l0aW9uKSB7XG4gICAgICAgIHJldHVybiAhKCF0cmFuc2l0aW9uLnRhcmdldCAmJiAhdHJhbnNpdGlvbi5hY3Rpb25zLmxlbmd0aCAmJiB0cmFuc2l0aW9uLmludGVybmFsKTtcbiAgICAgIH0pLm1hcChmdW5jdGlvbiAodHJhbnNpdGlvbikge1xuICAgICAgICByZXR1cm4gdHJhbnNpdGlvbi5ldmVudFR5cGU7XG4gICAgICB9KSk7XG4gICAgICByZXR1cm4gQXJyYXkuZnJvbShldmVudHMpO1xuICAgIH0sXG4gICAgZW51bWVyYWJsZTogZmFsc2UsXG4gICAgY29uZmlndXJhYmxlOiB0cnVlXG4gIH0pO1xuXG4gIFN0YXRlTm9kZS5wcm90b3R5cGUucmVzb2x2ZVRhcmdldCA9IGZ1bmN0aW9uIChfdGFyZ2V0KSB7XG4gICAgdmFyIF90aGlzID0gdGhpcztcblxuICAgIGlmIChfdGFyZ2V0ID09PSB1bmRlZmluZWQpIHtcbiAgICAgIC8vIGFuIHVuZGVmaW5lZCB0YXJnZXQgc2lnbmFscyB0aGF0IHRoZSBzdGF0ZSBub2RlIHNob3VsZCBub3QgdHJhbnNpdGlvbiBmcm9tIHRoYXQgc3RhdGUgd2hlbiByZWNlaXZpbmcgdGhhdCBldmVudFxuICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgICB9XG5cbiAgICByZXR1cm4gX3RhcmdldC5tYXAoZnVuY3Rpb24gKHRhcmdldCkge1xuICAgICAgaWYgKCFpc1N0cmluZyh0YXJnZXQpKSB7XG4gICAgICAgIHJldHVybiB0YXJnZXQ7XG4gICAgICB9XG5cbiAgICAgIHZhciBpc0ludGVybmFsVGFyZ2V0ID0gdGFyZ2V0WzBdID09PSBfdGhpcy5kZWxpbWl0ZXI7IC8vIElmIGludGVybmFsIHRhcmdldCBpcyBkZWZpbmVkIG9uIG1hY2hpbmUsXG4gICAgICAvLyBkbyBub3QgaW5jbHVkZSBtYWNoaW5lIGtleSBvbiB0YXJnZXRcblxuICAgICAgaWYgKGlzSW50ZXJuYWxUYXJnZXQgJiYgIV90aGlzLnBhcmVudCkge1xuICAgICAgICByZXR1cm4gX3RoaXMuZ2V0U3RhdGVOb2RlQnlQYXRoKHRhcmdldC5zbGljZSgxKSk7XG4gICAgICB9XG5cbiAgICAgIHZhciByZXNvbHZlZFRhcmdldCA9IGlzSW50ZXJuYWxUYXJnZXQgPyBfdGhpcy5rZXkgKyB0YXJnZXQgOiB0YXJnZXQ7XG5cbiAgICAgIGlmIChfdGhpcy5wYXJlbnQpIHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICB2YXIgdGFyZ2V0U3RhdGVOb2RlID0gX3RoaXMucGFyZW50LmdldFN0YXRlTm9kZUJ5UGF0aChyZXNvbHZlZFRhcmdldCk7XG5cbiAgICAgICAgICByZXR1cm4gdGFyZ2V0U3RhdGVOb2RlO1xuICAgICAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJJbnZhbGlkIHRyYW5zaXRpb24gZGVmaW5pdGlvbiBmb3Igc3RhdGUgbm9kZSAnXCIgKyBfdGhpcy5pZCArIFwiJzpcXG5cIiArIGVyci5tZXNzYWdlKTtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIF90aGlzLmdldFN0YXRlTm9kZUJ5UGF0aChyZXNvbHZlZFRhcmdldCk7XG4gICAgICB9XG4gICAgfSk7XG4gIH07XG5cbiAgU3RhdGVOb2RlLnByb3RvdHlwZS5mb3JtYXRUcmFuc2l0aW9uID0gZnVuY3Rpb24gKHRyYW5zaXRpb25Db25maWcpIHtcbiAgICB2YXIgX3RoaXMgPSB0aGlzO1xuXG4gICAgdmFyIG5vcm1hbGl6ZWRUYXJnZXQgPSBub3JtYWxpemVUYXJnZXQodHJhbnNpdGlvbkNvbmZpZy50YXJnZXQpO1xuICAgIHZhciBpbnRlcm5hbCA9ICdpbnRlcm5hbCcgaW4gdHJhbnNpdGlvbkNvbmZpZyA/IHRyYW5zaXRpb25Db25maWcuaW50ZXJuYWwgOiBub3JtYWxpemVkVGFyZ2V0ID8gbm9ybWFsaXplZFRhcmdldC5zb21lKGZ1bmN0aW9uIChfdGFyZ2V0KSB7XG4gICAgICByZXR1cm4gaXNTdHJpbmcoX3RhcmdldCkgJiYgX3RhcmdldFswXSA9PT0gX3RoaXMuZGVsaW1pdGVyO1xuICAgIH0pIDogdHJ1ZTtcbiAgICB2YXIgZ3VhcmRzID0gdGhpcy5tYWNoaW5lLm9wdGlvbnMuZ3VhcmRzO1xuICAgIHZhciB0YXJnZXQgPSB0aGlzLnJlc29sdmVUYXJnZXQobm9ybWFsaXplZFRhcmdldCk7XG5cbiAgICB2YXIgdHJhbnNpdGlvbiA9IF9fYXNzaWduKF9fYXNzaWduKHt9LCB0cmFuc2l0aW9uQ29uZmlnKSwge1xuICAgICAgYWN0aW9uczogdG9BY3Rpb25PYmplY3RzKHRvQXJyYXkodHJhbnNpdGlvbkNvbmZpZy5hY3Rpb25zKSksXG4gICAgICBjb25kOiB0b0d1YXJkKHRyYW5zaXRpb25Db25maWcuY29uZCwgZ3VhcmRzKSxcbiAgICAgIHRhcmdldDogdGFyZ2V0LFxuICAgICAgc291cmNlOiB0aGlzLFxuICAgICAgaW50ZXJuYWw6IGludGVybmFsLFxuICAgICAgZXZlbnRUeXBlOiB0cmFuc2l0aW9uQ29uZmlnLmV2ZW50LFxuICAgICAgdG9KU09OOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJldHVybiBfX2Fzc2lnbihfX2Fzc2lnbih7fSwgdHJhbnNpdGlvbiksIHtcbiAgICAgICAgICB0YXJnZXQ6IHRyYW5zaXRpb24udGFyZ2V0ID8gdHJhbnNpdGlvbi50YXJnZXQubWFwKGZ1bmN0aW9uICh0KSB7XG4gICAgICAgICAgICByZXR1cm4gXCIjXCIgKyB0LmlkO1xuICAgICAgICAgIH0pIDogdW5kZWZpbmVkLFxuICAgICAgICAgIHNvdXJjZTogXCIjXCIgKyBfdGhpcy5pZFxuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIHJldHVybiB0cmFuc2l0aW9uO1xuICB9O1xuXG4gIFN0YXRlTm9kZS5wcm90b3R5cGUuZm9ybWF0VHJhbnNpdGlvbnMgPSBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIGVfOSwgX2E7XG5cbiAgICB2YXIgX3RoaXMgPSB0aGlzO1xuXG4gICAgdmFyIG9uQ29uZmlnO1xuXG4gICAgaWYgKCF0aGlzLmNvbmZpZy5vbikge1xuICAgICAgb25Db25maWcgPSBbXTtcbiAgICB9IGVsc2UgaWYgKEFycmF5LmlzQXJyYXkodGhpcy5jb25maWcub24pKSB7XG4gICAgICBvbkNvbmZpZyA9IHRoaXMuY29uZmlnLm9uO1xuICAgIH0gZWxzZSB7XG4gICAgICB2YXIgX2IgPSB0aGlzLmNvbmZpZy5vbixcbiAgICAgICAgICBfYyA9IFdJTERDQVJELFxuICAgICAgICAgIF9kID0gX2JbX2NdLFxuICAgICAgICAgIHdpbGRjYXJkQ29uZmlncyA9IF9kID09PSB2b2lkIDAgPyBbXSA6IF9kLFxuICAgICAgICAgIHN0cmljdFRyYW5zaXRpb25Db25maWdzXzEgPSBfX3Jlc3QoX2IsIFt0eXBlb2YgX2MgPT09IFwic3ltYm9sXCIgPyBfYyA6IF9jICsgXCJcIl0pO1xuXG4gICAgICBvbkNvbmZpZyA9IGZsYXR0ZW4oa2V5cyhzdHJpY3RUcmFuc2l0aW9uQ29uZmlnc18xKS5tYXAoZnVuY3Rpb24gKGtleSkge1xuICAgICAgICBpZiAoIUlTX1BST0RVQ1RJT04gJiYga2V5ID09PSBOVUxMX0VWRU5UKSB7XG4gICAgICAgICAgd2FybihmYWxzZSwgXCJFbXB0eSBzdHJpbmcgdHJhbnNpdGlvbiBjb25maWdzIChlLmcuLCBgeyBvbjogeyAnJzogLi4uIH19YCkgZm9yIHRyYW5zaWVudCB0cmFuc2l0aW9ucyBhcmUgZGVwcmVjYXRlZC4gU3BlY2lmeSB0aGUgdHJhbnNpdGlvbiBpbiB0aGUgYHsgYWx3YXlzOiAuLi4gfWAgcHJvcGVydHkgaW5zdGVhZC4gXCIgKyAoXCJQbGVhc2UgY2hlY2sgdGhlIGBvbmAgY29uZmlndXJhdGlvbiBmb3IgXFxcIiNcIiArIF90aGlzLmlkICsgXCJcXFwiLlwiKSk7XG4gICAgICAgIH1cblxuICAgICAgICB2YXIgdHJhbnNpdGlvbkNvbmZpZ0FycmF5ID0gdG9UcmFuc2l0aW9uQ29uZmlnQXJyYXkoa2V5LCBzdHJpY3RUcmFuc2l0aW9uQ29uZmlnc18xW2tleV0pO1xuXG4gICAgICAgIGlmICghSVNfUFJPRFVDVElPTikge1xuICAgICAgICAgIHZhbGlkYXRlQXJyYXlpZmllZFRyYW5zaXRpb25zKF90aGlzLCBrZXksIHRyYW5zaXRpb25Db25maWdBcnJheSk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gdHJhbnNpdGlvbkNvbmZpZ0FycmF5O1xuICAgICAgfSkuY29uY2F0KHRvVHJhbnNpdGlvbkNvbmZpZ0FycmF5KFdJTERDQVJELCB3aWxkY2FyZENvbmZpZ3MpKSk7XG4gICAgfVxuXG4gICAgdmFyIGV2ZW50bGVzc0NvbmZpZyA9IHRoaXMuY29uZmlnLmFsd2F5cyA/IHRvVHJhbnNpdGlvbkNvbmZpZ0FycmF5KCcnLCB0aGlzLmNvbmZpZy5hbHdheXMpIDogW107XG4gICAgdmFyIGRvbmVDb25maWcgPSB0aGlzLmNvbmZpZy5vbkRvbmUgPyB0b1RyYW5zaXRpb25Db25maWdBcnJheShTdHJpbmcoZG9uZSh0aGlzLmlkKSksIHRoaXMuY29uZmlnLm9uRG9uZSkgOiBbXTtcblxuICAgIGlmICghSVNfUFJPRFVDVElPTikge1xuICAgICAgd2FybighKHRoaXMuY29uZmlnLm9uRG9uZSAmJiAhdGhpcy5wYXJlbnQpLCBcIlJvb3Qgbm9kZXMgY2Fubm90IGhhdmUgYW4gXFxcIi5vbkRvbmVcXFwiIHRyYW5zaXRpb24uIFBsZWFzZSBjaGVjayB0aGUgY29uZmlnIG9mIFxcXCJcIiArIHRoaXMuaWQgKyBcIlxcXCIuXCIpO1xuICAgIH1cblxuICAgIHZhciBpbnZva2VDb25maWcgPSBmbGF0dGVuKHRoaXMuaW52b2tlLm1hcChmdW5jdGlvbiAoaW52b2tlRGVmKSB7XG4gICAgICB2YXIgc2V0dGxlVHJhbnNpdGlvbnMgPSBbXTtcblxuICAgICAgaWYgKGludm9rZURlZi5vbkRvbmUpIHtcbiAgICAgICAgc2V0dGxlVHJhbnNpdGlvbnMucHVzaC5hcHBseShzZXR0bGVUcmFuc2l0aW9ucywgX19zcHJlYWQodG9UcmFuc2l0aW9uQ29uZmlnQXJyYXkoU3RyaW5nKGRvbmVJbnZva2UoaW52b2tlRGVmLmlkKSksIGludm9rZURlZi5vbkRvbmUpKSk7XG4gICAgICB9XG5cbiAgICAgIGlmIChpbnZva2VEZWYub25FcnJvcikge1xuICAgICAgICBzZXR0bGVUcmFuc2l0aW9ucy5wdXNoLmFwcGx5KHNldHRsZVRyYW5zaXRpb25zLCBfX3NwcmVhZCh0b1RyYW5zaXRpb25Db25maWdBcnJheShTdHJpbmcoZXJyb3IoaW52b2tlRGVmLmlkKSksIGludm9rZURlZi5vbkVycm9yKSkpO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gc2V0dGxlVHJhbnNpdGlvbnM7XG4gICAgfSkpO1xuICAgIHZhciBkZWxheWVkVHJhbnNpdGlvbnMgPSB0aGlzLmFmdGVyO1xuICAgIHZhciBmb3JtYXR0ZWRUcmFuc2l0aW9ucyA9IGZsYXR0ZW4oX19zcHJlYWQoZG9uZUNvbmZpZywgaW52b2tlQ29uZmlnLCBvbkNvbmZpZywgZXZlbnRsZXNzQ29uZmlnKS5tYXAoZnVuY3Rpb24gKHRyYW5zaXRpb25Db25maWcpIHtcbiAgICAgIHJldHVybiB0b0FycmF5KHRyYW5zaXRpb25Db25maWcpLm1hcChmdW5jdGlvbiAodHJhbnNpdGlvbikge1xuICAgICAgICByZXR1cm4gX3RoaXMuZm9ybWF0VHJhbnNpdGlvbih0cmFuc2l0aW9uKTtcbiAgICAgIH0pO1xuICAgIH0pKTtcblxuICAgIHRyeSB7XG4gICAgICBmb3IgKHZhciBkZWxheWVkVHJhbnNpdGlvbnNfMSA9IF9fdmFsdWVzKGRlbGF5ZWRUcmFuc2l0aW9ucyksIGRlbGF5ZWRUcmFuc2l0aW9uc18xXzEgPSBkZWxheWVkVHJhbnNpdGlvbnNfMS5uZXh0KCk7ICFkZWxheWVkVHJhbnNpdGlvbnNfMV8xLmRvbmU7IGRlbGF5ZWRUcmFuc2l0aW9uc18xXzEgPSBkZWxheWVkVHJhbnNpdGlvbnNfMS5uZXh0KCkpIHtcbiAgICAgICAgdmFyIGRlbGF5ZWRUcmFuc2l0aW9uID0gZGVsYXllZFRyYW5zaXRpb25zXzFfMS52YWx1ZTtcbiAgICAgICAgZm9ybWF0dGVkVHJhbnNpdGlvbnMucHVzaChkZWxheWVkVHJhbnNpdGlvbik7XG4gICAgICB9XG4gICAgfSBjYXRjaCAoZV85XzEpIHtcbiAgICAgIGVfOSA9IHtcbiAgICAgICAgZXJyb3I6IGVfOV8xXG4gICAgICB9O1xuICAgIH0gZmluYWxseSB7XG4gICAgICB0cnkge1xuICAgICAgICBpZiAoZGVsYXllZFRyYW5zaXRpb25zXzFfMSAmJiAhZGVsYXllZFRyYW5zaXRpb25zXzFfMS5kb25lICYmIChfYSA9IGRlbGF5ZWRUcmFuc2l0aW9uc18xLnJldHVybikpIF9hLmNhbGwoZGVsYXllZFRyYW5zaXRpb25zXzEpO1xuICAgICAgfSBmaW5hbGx5IHtcbiAgICAgICAgaWYgKGVfOSkgdGhyb3cgZV85LmVycm9yO1xuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBmb3JtYXR0ZWRUcmFuc2l0aW9ucztcbiAgfTtcblxuICByZXR1cm4gU3RhdGVOb2RlO1xufSgpO1xuXG5leHBvcnQgeyBTdGF0ZU5vZGUgfTsiLCJpbXBvcnQgeyBTdGF0ZU5vZGUgfSBmcm9tICcuL1N0YXRlTm9kZS5qcyc7XG5cbmZ1bmN0aW9uIE1hY2hpbmUoY29uZmlnLCBvcHRpb25zLCBpbml0aWFsQ29udGV4dCkge1xuICBpZiAoaW5pdGlhbENvbnRleHQgPT09IHZvaWQgMCkge1xuICAgIGluaXRpYWxDb250ZXh0ID0gY29uZmlnLmNvbnRleHQ7XG4gIH1cblxuICB2YXIgcmVzb2x2ZWRJbml0aWFsQ29udGV4dCA9IHR5cGVvZiBpbml0aWFsQ29udGV4dCA9PT0gJ2Z1bmN0aW9uJyA/IGluaXRpYWxDb250ZXh0KCkgOiBpbml0aWFsQ29udGV4dDtcbiAgcmV0dXJuIG5ldyBTdGF0ZU5vZGUoY29uZmlnLCBvcHRpb25zLCByZXNvbHZlZEluaXRpYWxDb250ZXh0KTtcbn1cblxuZnVuY3Rpb24gY3JlYXRlTWFjaGluZShjb25maWcsIG9wdGlvbnMpIHtcbiAgdmFyIHJlc29sdmVkSW5pdGlhbENvbnRleHQgPSB0eXBlb2YgY29uZmlnLmNvbnRleHQgPT09ICdmdW5jdGlvbicgPyBjb25maWcuY29udGV4dCgpIDogY29uZmlnLmNvbnRleHQ7XG4gIHJldHVybiBuZXcgU3RhdGVOb2RlKGNvbmZpZywgb3B0aW9ucywgcmVzb2x2ZWRJbml0aWFsQ29udGV4dCk7XG59XG5cbmV4cG9ydCB7IE1hY2hpbmUsIGNyZWF0ZU1hY2hpbmUgfTsiLCJpbXBvcnQgeyBfX2Fzc2lnbiB9IGZyb20gJy4vX3ZpcnR1YWwvX3RzbGliLmpzJztcbnZhciBkZWZhdWx0T3B0aW9ucyA9IHtcbiAgZGVmZXJFdmVudHM6IGZhbHNlXG59O1xuXG52YXIgU2NoZWR1bGVyID1cbi8qI19fUFVSRV9fKi9cblxuLyoqIEBjbGFzcyAqL1xuZnVuY3Rpb24gKCkge1xuICBmdW5jdGlvbiBTY2hlZHVsZXIob3B0aW9ucykge1xuICAgIHRoaXMucHJvY2Vzc2luZ0V2ZW50ID0gZmFsc2U7XG4gICAgdGhpcy5xdWV1ZSA9IFtdO1xuICAgIHRoaXMuaW5pdGlhbGl6ZWQgPSBmYWxzZTtcbiAgICB0aGlzLm9wdGlvbnMgPSBfX2Fzc2lnbihfX2Fzc2lnbih7fSwgZGVmYXVsdE9wdGlvbnMpLCBvcHRpb25zKTtcbiAgfVxuXG4gIFNjaGVkdWxlci5wcm90b3R5cGUuaW5pdGlhbGl6ZSA9IGZ1bmN0aW9uIChjYWxsYmFjaykge1xuICAgIHRoaXMuaW5pdGlhbGl6ZWQgPSB0cnVlO1xuXG4gICAgaWYgKGNhbGxiYWNrKSB7XG4gICAgICBpZiAoIXRoaXMub3B0aW9ucy5kZWZlckV2ZW50cykge1xuICAgICAgICB0aGlzLnNjaGVkdWxlKGNhbGxiYWNrKTtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICB0aGlzLnByb2Nlc3MoY2FsbGJhY2spO1xuICAgIH1cblxuICAgIHRoaXMuZmx1c2hFdmVudHMoKTtcbiAgfTtcblxuICBTY2hlZHVsZXIucHJvdG90eXBlLnNjaGVkdWxlID0gZnVuY3Rpb24gKHRhc2spIHtcbiAgICBpZiAoIXRoaXMuaW5pdGlhbGl6ZWQgfHwgdGhpcy5wcm9jZXNzaW5nRXZlbnQpIHtcbiAgICAgIHRoaXMucXVldWUucHVzaCh0YXNrKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBpZiAodGhpcy5xdWV1ZS5sZW5ndGggIT09IDApIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignRXZlbnQgcXVldWUgc2hvdWxkIGJlIGVtcHR5IHdoZW4gaXQgaXMgbm90IHByb2Nlc3NpbmcgZXZlbnRzJyk7XG4gICAgfVxuXG4gICAgdGhpcy5wcm9jZXNzKHRhc2spO1xuICAgIHRoaXMuZmx1c2hFdmVudHMoKTtcbiAgfTtcblxuICBTY2hlZHVsZXIucHJvdG90eXBlLmNsZWFyID0gZnVuY3Rpb24gKCkge1xuICAgIHRoaXMucXVldWUgPSBbXTtcbiAgfTtcblxuICBTY2hlZHVsZXIucHJvdG90eXBlLmZsdXNoRXZlbnRzID0gZnVuY3Rpb24gKCkge1xuICAgIHZhciBuZXh0Q2FsbGJhY2sgPSB0aGlzLnF1ZXVlLnNoaWZ0KCk7XG5cbiAgICB3aGlsZSAobmV4dENhbGxiYWNrKSB7XG4gICAgICB0aGlzLnByb2Nlc3MobmV4dENhbGxiYWNrKTtcbiAgICAgIG5leHRDYWxsYmFjayA9IHRoaXMucXVldWUuc2hpZnQoKTtcbiAgICB9XG4gIH07XG5cbiAgU2NoZWR1bGVyLnByb3RvdHlwZS5wcm9jZXNzID0gZnVuY3Rpb24gKGNhbGxiYWNrKSB7XG4gICAgdGhpcy5wcm9jZXNzaW5nRXZlbnQgPSB0cnVlO1xuXG4gICAgdHJ5IHtcbiAgICAgIGNhbGxiYWNrKCk7XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgLy8gdGhlcmUgaXMgbm8gdXNlIHRvIGtlZXAgdGhlIGZ1dHVyZSBldmVudHNcbiAgICAgIC8vIGFzIHRoZSBzaXR1YXRpb24gaXMgbm90IGFueW1vcmUgdGhlIHNhbWVcbiAgICAgIHRoaXMuY2xlYXIoKTtcbiAgICAgIHRocm93IGU7XG4gICAgfSBmaW5hbGx5IHtcbiAgICAgIHRoaXMucHJvY2Vzc2luZ0V2ZW50ID0gZmFsc2U7XG4gICAgfVxuICB9O1xuXG4gIHJldHVybiBTY2hlZHVsZXI7XG59KCk7XG5cbmV4cG9ydCB7IFNjaGVkdWxlciB9OyIsInZhciBjaGlsZHJlbiA9IC8qI19fUFVSRV9fKi9uZXcgTWFwKCk7XG52YXIgc2Vzc2lvbklkSW5kZXggPSAwO1xudmFyIHJlZ2lzdHJ5ID0ge1xuICBib29rSWQ6IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gXCJ4OlwiICsgc2Vzc2lvbklkSW5kZXgrKztcbiAgfSxcbiAgcmVnaXN0ZXI6IGZ1bmN0aW9uIChpZCwgYWN0b3IpIHtcbiAgICBjaGlsZHJlbi5zZXQoaWQsIGFjdG9yKTtcbiAgICByZXR1cm4gaWQ7XG4gIH0sXG4gIGdldDogZnVuY3Rpb24gKGlkKSB7XG4gICAgcmV0dXJuIGNoaWxkcmVuLmdldChpZCk7XG4gIH0sXG4gIGZyZWU6IGZ1bmN0aW9uIChpZCkge1xuICAgIGNoaWxkcmVuLmRlbGV0ZShpZCk7XG4gIH1cbn07XG5leHBvcnQgeyByZWdpc3RyeSB9OyIsImltcG9ydCB7IElTX1BST0RVQ1RJT04gfSBmcm9tICcuL2Vudmlyb25tZW50LmpzJzsgLy8gRnJvbSBodHRwczovL2RldmVsb3Blci5tb3ppbGxhLm9yZy9lbi1VUy9kb2NzL1dlYi9KYXZhU2NyaXB0L1JlZmVyZW5jZS9HbG9iYWxfT2JqZWN0cy9nbG9iYWxUaGlzXG5cbmZ1bmN0aW9uIGdldEdsb2JhbCgpIHtcbiAgaWYgKHR5cGVvZiBzZWxmICE9PSAndW5kZWZpbmVkJykge1xuICAgIHJldHVybiBzZWxmO1xuICB9XG5cbiAgaWYgKHR5cGVvZiB3aW5kb3cgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgcmV0dXJuIHdpbmRvdztcbiAgfVxuXG4gIGlmICh0eXBlb2YgZ2xvYmFsICE9PSAndW5kZWZpbmVkJykge1xuICAgIHJldHVybiBnbG9iYWw7XG4gIH1cblxuICByZXR1cm4gdW5kZWZpbmVkO1xufVxuXG5mdW5jdGlvbiBnZXREZXZUb29scygpIHtcbiAgdmFyIGdsb2JhbCA9IGdldEdsb2JhbCgpO1xuXG4gIGlmIChnbG9iYWwgJiYgJ19feHN0YXRlX18nIGluIGdsb2JhbCkge1xuICAgIHJldHVybiBnbG9iYWwuX194c3RhdGVfXztcbiAgfVxuXG4gIHJldHVybiB1bmRlZmluZWQ7XG59XG5cbmZ1bmN0aW9uIHJlZ2lzdGVyU2VydmljZShzZXJ2aWNlKSB7XG4gIGlmIChJU19QUk9EVUNUSU9OIHx8ICFnZXRHbG9iYWwoKSkge1xuICAgIHJldHVybjtcbiAgfVxuXG4gIHZhciBkZXZUb29scyA9IGdldERldlRvb2xzKCk7XG5cbiAgaWYgKGRldlRvb2xzKSB7XG4gICAgZGV2VG9vbHMucmVnaXN0ZXIoc2VydmljZSk7XG4gIH1cbn1cblxuZXhwb3J0IHsgZ2V0R2xvYmFsLCByZWdpc3RlclNlcnZpY2UgfTsiLCJpbXBvcnQgeyBfX3ZhbHVlcywgX19hc3NpZ24sIF9fc3ByZWFkIH0gZnJvbSAnLi9fdmlydHVhbC9fdHNsaWIuanMnO1xuaW1wb3J0IHsgSVNfUFJPRFVDVElPTiB9IGZyb20gJy4vZW52aXJvbm1lbnQuanMnO1xuaW1wb3J0IHsgd2FybiwgbWFwQ29udGV4dCwgaXNGdW5jdGlvbiwga2V5cywgdG9TQ1hNTEV2ZW50LCB0b0ludm9rZVNvdXJjZSwgaXNQcm9taXNlTGlrZSwgaXNPYnNlcnZhYmxlLCBpc01hY2hpbmUsIHJlcG9ydFVuaGFuZGxlZEV4Y2VwdGlvbk9uSW52b2NhdGlvbiwgc3ltYm9sT2JzZXJ2YWJsZSwgaXNBcnJheSwgdG9FdmVudE9iamVjdCwgaXNTdHJpbmcsIGlzQWN0b3IsIHVuaXF1ZUlkLCB0b09ic2VydmVyIH0gZnJvbSAnLi91dGlscy5qcyc7XG5pbXBvcnQgeyBBY3Rpb25UeXBlcywgU3BlY2lhbFRhcmdldHMgfSBmcm9tICcuL3R5cGVzLmpzJztcbmltcG9ydCB7IGlzSW5GaW5hbFN0YXRlIH0gZnJvbSAnLi9zdGF0ZVV0aWxzLmpzJztcbmltcG9ydCB7IGVycm9yUGxhdGZvcm0sIGxvZywgc3RvcCwgc3RhcnQsIGNhbmNlbCwgc2VuZCwgdXBkYXRlLCBlcnJvciBhcyBlcnJvciQxIH0gZnJvbSAnLi9hY3Rpb25UeXBlcy5qcyc7XG5pbXBvcnQgeyBkb25lSW52b2tlLCBpbml0RXZlbnQsIGdldEFjdGlvbkZ1bmN0aW9uLCBlcnJvciB9IGZyb20gJy4vYWN0aW9ucy5qcyc7XG5pbXBvcnQgeyBpc1N0YXRlLCBTdGF0ZSwgYmluZEFjdGlvblRvU3RhdGUgfSBmcm9tICcuL1N0YXRlLmpzJztcbmltcG9ydCB7IHByb3ZpZGUsIGNvbnN1bWUgfSBmcm9tICcuL3NlcnZpY2VTY29wZS5qcyc7XG5pbXBvcnQgeyBpc1NwYXduZWRBY3RvciwgY3JlYXRlRGVmZXJyZWRBY3RvciB9IGZyb20gJy4vQWN0b3IuanMnO1xuaW1wb3J0IHsgU2NoZWR1bGVyIH0gZnJvbSAnLi9zY2hlZHVsZXIuanMnO1xuaW1wb3J0IHsgcmVnaXN0cnkgfSBmcm9tICcuL3JlZ2lzdHJ5LmpzJztcbmltcG9ydCB7IHJlZ2lzdGVyU2VydmljZSwgZ2V0R2xvYmFsIH0gZnJvbSAnLi9kZXZUb29scy5qcyc7XG52YXIgREVGQVVMVF9TUEFXTl9PUFRJT05TID0ge1xuICBzeW5jOiBmYWxzZSxcbiAgYXV0b0ZvcndhcmQ6IGZhbHNlXG59O1xudmFyIEludGVycHJldGVyU3RhdHVzO1xuXG4oZnVuY3Rpb24gKEludGVycHJldGVyU3RhdHVzKSB7XG4gIEludGVycHJldGVyU3RhdHVzW0ludGVycHJldGVyU3RhdHVzW1wiTm90U3RhcnRlZFwiXSA9IDBdID0gXCJOb3RTdGFydGVkXCI7XG4gIEludGVycHJldGVyU3RhdHVzW0ludGVycHJldGVyU3RhdHVzW1wiUnVubmluZ1wiXSA9IDFdID0gXCJSdW5uaW5nXCI7XG4gIEludGVycHJldGVyU3RhdHVzW0ludGVycHJldGVyU3RhdHVzW1wiU3RvcHBlZFwiXSA9IDJdID0gXCJTdG9wcGVkXCI7XG59KShJbnRlcnByZXRlclN0YXR1cyB8fCAoSW50ZXJwcmV0ZXJTdGF0dXMgPSB7fSkpO1xuXG52YXIgSW50ZXJwcmV0ZXIgPVxuLyojX19QVVJFX18qL1xuXG4vKiogQGNsYXNzICovXG5mdW5jdGlvbiAoKSB7XG4gIC8qKlxyXG4gICAqIENyZWF0ZXMgYSBuZXcgSW50ZXJwcmV0ZXIgaW5zdGFuY2UgKGkuZS4sIHNlcnZpY2UpIGZvciB0aGUgZ2l2ZW4gbWFjaGluZSB3aXRoIHRoZSBwcm92aWRlZCBvcHRpb25zLCBpZiBhbnkuXHJcbiAgICpcclxuICAgKiBAcGFyYW0gbWFjaGluZSBUaGUgbWFjaGluZSB0byBiZSBpbnRlcnByZXRlZFxyXG4gICAqIEBwYXJhbSBvcHRpb25zIEludGVycHJldGVyIG9wdGlvbnNcclxuICAgKi9cbiAgZnVuY3Rpb24gSW50ZXJwcmV0ZXIobWFjaGluZSwgb3B0aW9ucykge1xuICAgIHZhciBfdGhpcyA9IHRoaXM7XG5cbiAgICBpZiAob3B0aW9ucyA9PT0gdm9pZCAwKSB7XG4gICAgICBvcHRpb25zID0gSW50ZXJwcmV0ZXIuZGVmYXVsdE9wdGlvbnM7XG4gICAgfVxuXG4gICAgdGhpcy5tYWNoaW5lID0gbWFjaGluZTtcbiAgICB0aGlzLnNjaGVkdWxlciA9IG5ldyBTY2hlZHVsZXIoKTtcbiAgICB0aGlzLmRlbGF5ZWRFdmVudHNNYXAgPSB7fTtcbiAgICB0aGlzLmxpc3RlbmVycyA9IG5ldyBTZXQoKTtcbiAgICB0aGlzLmNvbnRleHRMaXN0ZW5lcnMgPSBuZXcgU2V0KCk7XG4gICAgdGhpcy5zdG9wTGlzdGVuZXJzID0gbmV3IFNldCgpO1xuICAgIHRoaXMuZG9uZUxpc3RlbmVycyA9IG5ldyBTZXQoKTtcbiAgICB0aGlzLmV2ZW50TGlzdGVuZXJzID0gbmV3IFNldCgpO1xuICAgIHRoaXMuc2VuZExpc3RlbmVycyA9IG5ldyBTZXQoKTtcbiAgICAvKipcclxuICAgICAqIFdoZXRoZXIgdGhlIHNlcnZpY2UgaXMgc3RhcnRlZC5cclxuICAgICAqL1xuXG4gICAgdGhpcy5pbml0aWFsaXplZCA9IGZhbHNlO1xuICAgIHRoaXMuc3RhdHVzID0gSW50ZXJwcmV0ZXJTdGF0dXMuTm90U3RhcnRlZDtcbiAgICB0aGlzLmNoaWxkcmVuID0gbmV3IE1hcCgpO1xuICAgIHRoaXMuZm9yd2FyZFRvID0gbmV3IFNldCgpO1xuICAgIC8qKlxyXG4gICAgICogQWxpYXMgZm9yIEludGVycHJldGVyLnByb3RvdHlwZS5zdGFydFxyXG4gICAgICovXG5cbiAgICB0aGlzLmluaXQgPSB0aGlzLnN0YXJ0O1xuICAgIC8qKlxyXG4gICAgICogU2VuZHMgYW4gZXZlbnQgdG8gdGhlIHJ1bm5pbmcgaW50ZXJwcmV0ZXIgdG8gdHJpZ2dlciBhIHRyYW5zaXRpb24uXHJcbiAgICAgKlxyXG4gICAgICogQW4gYXJyYXkgb2YgZXZlbnRzIChiYXRjaGVkKSBjYW4gYmUgc2VudCBhcyB3ZWxsLCB3aGljaCB3aWxsIHNlbmQgYWxsXHJcbiAgICAgKiBiYXRjaGVkIGV2ZW50cyB0byB0aGUgcnVubmluZyBpbnRlcnByZXRlci4gVGhlIGxpc3RlbmVycyB3aWxsIGJlXHJcbiAgICAgKiBub3RpZmllZCBvbmx5ICoqb25jZSoqIHdoZW4gYWxsIGV2ZW50cyBhcmUgcHJvY2Vzc2VkLlxyXG4gICAgICpcclxuICAgICAqIEBwYXJhbSBldmVudCBUaGUgZXZlbnQocykgdG8gc2VuZFxyXG4gICAgICovXG5cbiAgICB0aGlzLnNlbmQgPSBmdW5jdGlvbiAoZXZlbnQsIHBheWxvYWQpIHtcbiAgICAgIGlmIChpc0FycmF5KGV2ZW50KSkge1xuICAgICAgICBfdGhpcy5iYXRjaChldmVudCk7XG5cbiAgICAgICAgcmV0dXJuIF90aGlzLnN0YXRlO1xuICAgICAgfVxuXG4gICAgICB2YXIgX2V2ZW50ID0gdG9TQ1hNTEV2ZW50KHRvRXZlbnRPYmplY3QoZXZlbnQsIHBheWxvYWQpKTtcblxuICAgICAgaWYgKF90aGlzLnN0YXR1cyA9PT0gSW50ZXJwcmV0ZXJTdGF0dXMuU3RvcHBlZCkge1xuICAgICAgICAvLyBkbyBub3RoaW5nXG4gICAgICAgIGlmICghSVNfUFJPRFVDVElPTikge1xuICAgICAgICAgIHdhcm4oZmFsc2UsIFwiRXZlbnQgXFxcIlwiICsgX2V2ZW50Lm5hbWUgKyBcIlxcXCIgd2FzIHNlbnQgdG8gc3RvcHBlZCBzZXJ2aWNlIFxcXCJcIiArIF90aGlzLm1hY2hpbmUuaWQgKyBcIlxcXCIuIFRoaXMgc2VydmljZSBoYXMgYWxyZWFkeSByZWFjaGVkIGl0cyBmaW5hbCBzdGF0ZSwgYW5kIHdpbGwgbm90IHRyYW5zaXRpb24uXFxuRXZlbnQ6IFwiICsgSlNPTi5zdHJpbmdpZnkoX2V2ZW50LmRhdGEpKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBfdGhpcy5zdGF0ZTtcbiAgICAgIH1cblxuICAgICAgaWYgKF90aGlzLnN0YXR1cyAhPT0gSW50ZXJwcmV0ZXJTdGF0dXMuUnVubmluZyAmJiAhX3RoaXMub3B0aW9ucy5kZWZlckV2ZW50cykge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJFdmVudCBcXFwiXCIgKyBfZXZlbnQubmFtZSArIFwiXFxcIiB3YXMgc2VudCB0byB1bmluaXRpYWxpemVkIHNlcnZpY2UgXFxcIlwiICsgX3RoaXMubWFjaGluZS5pZCArIFwiXFxcIi4gTWFrZSBzdXJlIC5zdGFydCgpIGlzIGNhbGxlZCBmb3IgdGhpcyBzZXJ2aWNlLCBvciBzZXQgeyBkZWZlckV2ZW50czogdHJ1ZSB9IGluIHRoZSBzZXJ2aWNlIG9wdGlvbnMuXFxuRXZlbnQ6IFwiICsgSlNPTi5zdHJpbmdpZnkoX2V2ZW50LmRhdGEpKTtcbiAgICAgIH1cblxuICAgICAgX3RoaXMuc2NoZWR1bGVyLnNjaGVkdWxlKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgLy8gRm9yd2FyZCBjb3B5IG9mIGV2ZW50IHRvIGNoaWxkIGFjdG9yc1xuICAgICAgICBfdGhpcy5mb3J3YXJkKF9ldmVudCk7XG5cbiAgICAgICAgdmFyIG5leHRTdGF0ZSA9IF90aGlzLm5leHRTdGF0ZShfZXZlbnQpO1xuXG4gICAgICAgIF90aGlzLnVwZGF0ZShuZXh0U3RhdGUsIF9ldmVudCk7XG4gICAgICB9KTtcblxuICAgICAgcmV0dXJuIF90aGlzLl9zdGF0ZTsgLy8gVE9ETzogZGVwcmVjYXRlIChzaG91bGQgcmV0dXJuIHZvaWQpXG4gICAgICAvLyB0c2xpbnQ6ZGlzYWJsZS1uZXh0LWxpbmU6c2VtaWNvbG9uXG4gICAgfTtcblxuICAgIHRoaXMuc2VuZFRvID0gZnVuY3Rpb24gKGV2ZW50LCB0bykge1xuICAgICAgdmFyIGlzUGFyZW50ID0gX3RoaXMucGFyZW50ICYmICh0byA9PT0gU3BlY2lhbFRhcmdldHMuUGFyZW50IHx8IF90aGlzLnBhcmVudC5pZCA9PT0gdG8pO1xuICAgICAgdmFyIHRhcmdldCA9IGlzUGFyZW50ID8gX3RoaXMucGFyZW50IDogaXNTdHJpbmcodG8pID8gX3RoaXMuY2hpbGRyZW4uZ2V0KHRvKSB8fCByZWdpc3RyeS5nZXQodG8pIDogaXNBY3Rvcih0bykgPyB0byA6IHVuZGVmaW5lZDtcblxuICAgICAgaWYgKCF0YXJnZXQpIHtcbiAgICAgICAgaWYgKCFpc1BhcmVudCkge1xuICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIlVuYWJsZSB0byBzZW5kIGV2ZW50IHRvIGNoaWxkICdcIiArIHRvICsgXCInIGZyb20gc2VydmljZSAnXCIgKyBfdGhpcy5pZCArIFwiJy5cIik7XG4gICAgICAgIH0gLy8gdHNsaW50OmRpc2FibGUtbmV4dC1saW5lOm5vLWNvbnNvbGVcblxuXG4gICAgICAgIGlmICghSVNfUFJPRFVDVElPTikge1xuICAgICAgICAgIHdhcm4oZmFsc2UsIFwiU2VydmljZSAnXCIgKyBfdGhpcy5pZCArIFwiJyBoYXMgbm8gcGFyZW50OiB1bmFibGUgdG8gc2VuZCBldmVudCBcIiArIGV2ZW50LnR5cGUpO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICBpZiAoJ21hY2hpbmUnIGluIHRhcmdldCkge1xuICAgICAgICAvLyBTZW5kIFNDWE1MIGV2ZW50cyB0byBtYWNoaW5lc1xuICAgICAgICB0YXJnZXQuc2VuZChfX2Fzc2lnbihfX2Fzc2lnbih7fSwgZXZlbnQpLCB7XG4gICAgICAgICAgbmFtZTogZXZlbnQubmFtZSA9PT0gZXJyb3IkMSA/IFwiXCIgKyBlcnJvcihfdGhpcy5pZCkgOiBldmVudC5uYW1lLFxuICAgICAgICAgIG9yaWdpbjogX3RoaXMuc2Vzc2lvbklkXG4gICAgICAgIH0pKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIC8vIFNlbmQgbm9ybWFsIGV2ZW50cyB0byBvdGhlciB0YXJnZXRzXG4gICAgICAgIHRhcmdldC5zZW5kKGV2ZW50LmRhdGEpO1xuICAgICAgfVxuICAgIH07XG5cbiAgICB2YXIgcmVzb2x2ZWRPcHRpb25zID0gX19hc3NpZ24oX19hc3NpZ24oe30sIEludGVycHJldGVyLmRlZmF1bHRPcHRpb25zKSwgb3B0aW9ucyk7XG5cbiAgICB2YXIgY2xvY2sgPSByZXNvbHZlZE9wdGlvbnMuY2xvY2ssXG4gICAgICAgIGxvZ2dlciA9IHJlc29sdmVkT3B0aW9ucy5sb2dnZXIsXG4gICAgICAgIHBhcmVudCA9IHJlc29sdmVkT3B0aW9ucy5wYXJlbnQsXG4gICAgICAgIGlkID0gcmVzb2x2ZWRPcHRpb25zLmlkO1xuICAgIHZhciByZXNvbHZlZElkID0gaWQgIT09IHVuZGVmaW5lZCA/IGlkIDogbWFjaGluZS5pZDtcbiAgICB0aGlzLmlkID0gcmVzb2x2ZWRJZDtcbiAgICB0aGlzLmxvZ2dlciA9IGxvZ2dlcjtcbiAgICB0aGlzLmNsb2NrID0gY2xvY2s7XG4gICAgdGhpcy5wYXJlbnQgPSBwYXJlbnQ7XG4gICAgdGhpcy5vcHRpb25zID0gcmVzb2x2ZWRPcHRpb25zO1xuICAgIHRoaXMuc2NoZWR1bGVyID0gbmV3IFNjaGVkdWxlcih7XG4gICAgICBkZWZlckV2ZW50czogdGhpcy5vcHRpb25zLmRlZmVyRXZlbnRzXG4gICAgfSk7XG4gICAgdGhpcy5zZXNzaW9uSWQgPSByZWdpc3RyeS5ib29rSWQoKTtcbiAgfVxuXG4gIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShJbnRlcnByZXRlci5wcm90b3R5cGUsIFwiaW5pdGlhbFN0YXRlXCIsIHtcbiAgICBnZXQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgIHZhciBfdGhpcyA9IHRoaXM7XG5cbiAgICAgIGlmICh0aGlzLl9pbml0aWFsU3RhdGUpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2luaXRpYWxTdGF0ZTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHByb3ZpZGUodGhpcywgZnVuY3Rpb24gKCkge1xuICAgICAgICBfdGhpcy5faW5pdGlhbFN0YXRlID0gX3RoaXMubWFjaGluZS5pbml0aWFsU3RhdGU7XG4gICAgICAgIHJldHVybiBfdGhpcy5faW5pdGlhbFN0YXRlO1xuICAgICAgfSk7XG4gICAgfSxcbiAgICBlbnVtZXJhYmxlOiBmYWxzZSxcbiAgICBjb25maWd1cmFibGU6IHRydWVcbiAgfSk7XG4gIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShJbnRlcnByZXRlci5wcm90b3R5cGUsIFwic3RhdGVcIiwge1xuICAgIGdldDogZnVuY3Rpb24gKCkge1xuICAgICAgaWYgKCFJU19QUk9EVUNUSU9OKSB7XG4gICAgICAgIHdhcm4odGhpcy5zdGF0dXMgIT09IEludGVycHJldGVyU3RhdHVzLk5vdFN0YXJ0ZWQsIFwiQXR0ZW1wdGVkIHRvIHJlYWQgc3RhdGUgZnJvbSB1bmluaXRpYWxpemVkIHNlcnZpY2UgJ1wiICsgdGhpcy5pZCArIFwiJy4gTWFrZSBzdXJlIHRoZSBzZXJ2aWNlIGlzIHN0YXJ0ZWQgZmlyc3QuXCIpO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gdGhpcy5fc3RhdGU7XG4gICAgfSxcbiAgICBlbnVtZXJhYmxlOiBmYWxzZSxcbiAgICBjb25maWd1cmFibGU6IHRydWVcbiAgfSk7XG4gIC8qKlxyXG4gICAqIEV4ZWN1dGVzIHRoZSBhY3Rpb25zIG9mIHRoZSBnaXZlbiBzdGF0ZSwgd2l0aCB0aGF0IHN0YXRlJ3MgYGNvbnRleHRgIGFuZCBgZXZlbnRgLlxyXG4gICAqXHJcbiAgICogQHBhcmFtIHN0YXRlIFRoZSBzdGF0ZSB3aG9zZSBhY3Rpb25zIHdpbGwgYmUgZXhlY3V0ZWRcclxuICAgKiBAcGFyYW0gYWN0aW9uc0NvbmZpZyBUaGUgYWN0aW9uIGltcGxlbWVudGF0aW9ucyB0byB1c2VcclxuICAgKi9cblxuICBJbnRlcnByZXRlci5wcm90b3R5cGUuZXhlY3V0ZSA9IGZ1bmN0aW9uIChzdGF0ZSwgYWN0aW9uc0NvbmZpZykge1xuICAgIHZhciBlXzEsIF9hO1xuXG4gICAgdHJ5IHtcbiAgICAgIGZvciAodmFyIF9iID0gX192YWx1ZXMoc3RhdGUuYWN0aW9ucyksIF9jID0gX2IubmV4dCgpOyAhX2MuZG9uZTsgX2MgPSBfYi5uZXh0KCkpIHtcbiAgICAgICAgdmFyIGFjdGlvbiA9IF9jLnZhbHVlO1xuICAgICAgICB0aGlzLmV4ZWMoYWN0aW9uLCBzdGF0ZSwgYWN0aW9uc0NvbmZpZyk7XG4gICAgICB9XG4gICAgfSBjYXRjaCAoZV8xXzEpIHtcbiAgICAgIGVfMSA9IHtcbiAgICAgICAgZXJyb3I6IGVfMV8xXG4gICAgICB9O1xuICAgIH0gZmluYWxseSB7XG4gICAgICB0cnkge1xuICAgICAgICBpZiAoX2MgJiYgIV9jLmRvbmUgJiYgKF9hID0gX2IucmV0dXJuKSkgX2EuY2FsbChfYik7XG4gICAgICB9IGZpbmFsbHkge1xuICAgICAgICBpZiAoZV8xKSB0aHJvdyBlXzEuZXJyb3I7XG4gICAgICB9XG4gICAgfVxuICB9O1xuXG4gIEludGVycHJldGVyLnByb3RvdHlwZS51cGRhdGUgPSBmdW5jdGlvbiAoc3RhdGUsIF9ldmVudCkge1xuICAgIHZhciBlXzIsIF9hLCBlXzMsIF9iLCBlXzQsIF9jLCBlXzUsIF9kO1xuXG4gICAgdmFyIF90aGlzID0gdGhpczsgLy8gQXR0YWNoIHNlc3Npb24gSUQgdG8gc3RhdGVcblxuXG4gICAgc3RhdGUuX3Nlc3Npb25pZCA9IHRoaXMuc2Vzc2lvbklkOyAvLyBVcGRhdGUgc3RhdGVcblxuICAgIHRoaXMuX3N0YXRlID0gc3RhdGU7IC8vIEV4ZWN1dGUgYWN0aW9uc1xuXG4gICAgaWYgKHRoaXMub3B0aW9ucy5leGVjdXRlKSB7XG4gICAgICB0aGlzLmV4ZWN1dGUodGhpcy5zdGF0ZSk7XG4gICAgfSAvLyBVcGRhdGUgY2hpbGRyZW5cblxuXG4gICAgdGhpcy5jaGlsZHJlbi5mb3JFYWNoKGZ1bmN0aW9uIChjaGlsZCkge1xuICAgICAgX3RoaXMuc3RhdGUuY2hpbGRyZW5bY2hpbGQuaWRdID0gY2hpbGQ7XG4gICAgfSk7IC8vIERldiB0b29sc1xuXG4gICAgaWYgKHRoaXMuZGV2VG9vbHMpIHtcbiAgICAgIHRoaXMuZGV2VG9vbHMuc2VuZChfZXZlbnQuZGF0YSwgc3RhdGUpO1xuICAgIH0gLy8gRXhlY3V0ZSBsaXN0ZW5lcnNcblxuXG4gICAgaWYgKHN0YXRlLmV2ZW50KSB7XG4gICAgICB0cnkge1xuICAgICAgICBmb3IgKHZhciBfZSA9IF9fdmFsdWVzKHRoaXMuZXZlbnRMaXN0ZW5lcnMpLCBfZiA9IF9lLm5leHQoKTsgIV9mLmRvbmU7IF9mID0gX2UubmV4dCgpKSB7XG4gICAgICAgICAgdmFyIGxpc3RlbmVyID0gX2YudmFsdWU7XG4gICAgICAgICAgbGlzdGVuZXIoc3RhdGUuZXZlbnQpO1xuICAgICAgICB9XG4gICAgICB9IGNhdGNoIChlXzJfMSkge1xuICAgICAgICBlXzIgPSB7XG4gICAgICAgICAgZXJyb3I6IGVfMl8xXG4gICAgICAgIH07XG4gICAgICB9IGZpbmFsbHkge1xuICAgICAgICB0cnkge1xuICAgICAgICAgIGlmIChfZiAmJiAhX2YuZG9uZSAmJiAoX2EgPSBfZS5yZXR1cm4pKSBfYS5jYWxsKF9lKTtcbiAgICAgICAgfSBmaW5hbGx5IHtcbiAgICAgICAgICBpZiAoZV8yKSB0aHJvdyBlXzIuZXJyb3I7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICB0cnkge1xuICAgICAgZm9yICh2YXIgX2cgPSBfX3ZhbHVlcyh0aGlzLmxpc3RlbmVycyksIF9oID0gX2cubmV4dCgpOyAhX2guZG9uZTsgX2ggPSBfZy5uZXh0KCkpIHtcbiAgICAgICAgdmFyIGxpc3RlbmVyID0gX2gudmFsdWU7XG4gICAgICAgIGxpc3RlbmVyKHN0YXRlLCBzdGF0ZS5ldmVudCk7XG4gICAgICB9XG4gICAgfSBjYXRjaCAoZV8zXzEpIHtcbiAgICAgIGVfMyA9IHtcbiAgICAgICAgZXJyb3I6IGVfM18xXG4gICAgICB9O1xuICAgIH0gZmluYWxseSB7XG4gICAgICB0cnkge1xuICAgICAgICBpZiAoX2ggJiYgIV9oLmRvbmUgJiYgKF9iID0gX2cucmV0dXJuKSkgX2IuY2FsbChfZyk7XG4gICAgICB9IGZpbmFsbHkge1xuICAgICAgICBpZiAoZV8zKSB0aHJvdyBlXzMuZXJyb3I7XG4gICAgICB9XG4gICAgfVxuXG4gICAgdHJ5IHtcbiAgICAgIGZvciAodmFyIF9qID0gX192YWx1ZXModGhpcy5jb250ZXh0TGlzdGVuZXJzKSwgX2sgPSBfai5uZXh0KCk7ICFfay5kb25lOyBfayA9IF9qLm5leHQoKSkge1xuICAgICAgICB2YXIgY29udGV4dExpc3RlbmVyID0gX2sudmFsdWU7XG4gICAgICAgIGNvbnRleHRMaXN0ZW5lcih0aGlzLnN0YXRlLmNvbnRleHQsIHRoaXMuc3RhdGUuaGlzdG9yeSA/IHRoaXMuc3RhdGUuaGlzdG9yeS5jb250ZXh0IDogdW5kZWZpbmVkKTtcbiAgICAgIH1cbiAgICB9IGNhdGNoIChlXzRfMSkge1xuICAgICAgZV80ID0ge1xuICAgICAgICBlcnJvcjogZV80XzFcbiAgICAgIH07XG4gICAgfSBmaW5hbGx5IHtcbiAgICAgIHRyeSB7XG4gICAgICAgIGlmIChfayAmJiAhX2suZG9uZSAmJiAoX2MgPSBfai5yZXR1cm4pKSBfYy5jYWxsKF9qKTtcbiAgICAgIH0gZmluYWxseSB7XG4gICAgICAgIGlmIChlXzQpIHRocm93IGVfNC5lcnJvcjtcbiAgICAgIH1cbiAgICB9XG5cbiAgICB2YXIgaXNEb25lID0gaXNJbkZpbmFsU3RhdGUoc3RhdGUuY29uZmlndXJhdGlvbiB8fCBbXSwgdGhpcy5tYWNoaW5lKTtcblxuICAgIGlmICh0aGlzLnN0YXRlLmNvbmZpZ3VyYXRpb24gJiYgaXNEb25lKSB7XG4gICAgICAvLyBnZXQgZmluYWwgY2hpbGQgc3RhdGUgbm9kZVxuICAgICAgdmFyIGZpbmFsQ2hpbGRTdGF0ZU5vZGUgPSBzdGF0ZS5jb25maWd1cmF0aW9uLmZpbmQoZnVuY3Rpb24gKHNuKSB7XG4gICAgICAgIHJldHVybiBzbi50eXBlID09PSAnZmluYWwnICYmIHNuLnBhcmVudCA9PT0gX3RoaXMubWFjaGluZTtcbiAgICAgIH0pO1xuICAgICAgdmFyIGRvbmVEYXRhID0gZmluYWxDaGlsZFN0YXRlTm9kZSAmJiBmaW5hbENoaWxkU3RhdGVOb2RlLmRvbmVEYXRhID8gbWFwQ29udGV4dChmaW5hbENoaWxkU3RhdGVOb2RlLmRvbmVEYXRhLCBzdGF0ZS5jb250ZXh0LCBfZXZlbnQpIDogdW5kZWZpbmVkO1xuXG4gICAgICB0cnkge1xuICAgICAgICBmb3IgKHZhciBfbCA9IF9fdmFsdWVzKHRoaXMuZG9uZUxpc3RlbmVycyksIF9tID0gX2wubmV4dCgpOyAhX20uZG9uZTsgX20gPSBfbC5uZXh0KCkpIHtcbiAgICAgICAgICB2YXIgbGlzdGVuZXIgPSBfbS52YWx1ZTtcbiAgICAgICAgICBsaXN0ZW5lcihkb25lSW52b2tlKHRoaXMuaWQsIGRvbmVEYXRhKSk7XG4gICAgICAgIH1cbiAgICAgIH0gY2F0Y2ggKGVfNV8xKSB7XG4gICAgICAgIGVfNSA9IHtcbiAgICAgICAgICBlcnJvcjogZV81XzFcbiAgICAgICAgfTtcbiAgICAgIH0gZmluYWxseSB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgaWYgKF9tICYmICFfbS5kb25lICYmIChfZCA9IF9sLnJldHVybikpIF9kLmNhbGwoX2wpO1xuICAgICAgICB9IGZpbmFsbHkge1xuICAgICAgICAgIGlmIChlXzUpIHRocm93IGVfNS5lcnJvcjtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICB0aGlzLnN0b3AoKTtcbiAgICB9XG4gIH07XG4gIC8qXHJcbiAgICogQWRkcyBhIGxpc3RlbmVyIHRoYXQgaXMgbm90aWZpZWQgd2hlbmV2ZXIgYSBzdGF0ZSB0cmFuc2l0aW9uIGhhcHBlbnMuIFRoZSBsaXN0ZW5lciBpcyBjYWxsZWQgd2l0aFxyXG4gICAqIHRoZSBuZXh0IHN0YXRlIGFuZCB0aGUgZXZlbnQgb2JqZWN0IHRoYXQgY2F1c2VkIHRoZSBzdGF0ZSB0cmFuc2l0aW9uLlxyXG4gICAqXHJcbiAgICogQHBhcmFtIGxpc3RlbmVyIFRoZSBzdGF0ZSBsaXN0ZW5lclxyXG4gICAqL1xuXG5cbiAgSW50ZXJwcmV0ZXIucHJvdG90eXBlLm9uVHJhbnNpdGlvbiA9IGZ1bmN0aW9uIChsaXN0ZW5lcikge1xuICAgIHRoaXMubGlzdGVuZXJzLmFkZChsaXN0ZW5lcik7IC8vIFNlbmQgY3VycmVudCBzdGF0ZSB0byBsaXN0ZW5lclxuXG4gICAgaWYgKHRoaXMuc3RhdHVzID09PSBJbnRlcnByZXRlclN0YXR1cy5SdW5uaW5nKSB7XG4gICAgICBsaXN0ZW5lcih0aGlzLnN0YXRlLCB0aGlzLnN0YXRlLmV2ZW50KTtcbiAgICB9XG5cbiAgICByZXR1cm4gdGhpcztcbiAgfTtcblxuICBJbnRlcnByZXRlci5wcm90b3R5cGUuc3Vic2NyaWJlID0gZnVuY3Rpb24gKG5leHRMaXN0ZW5lck9yT2JzZXJ2ZXIsIF8sIC8vIFRPRE86IGVycm9yIGxpc3RlbmVyXG4gIGNvbXBsZXRlTGlzdGVuZXIpIHtcbiAgICB2YXIgX3RoaXMgPSB0aGlzO1xuXG4gICAgaWYgKCFuZXh0TGlzdGVuZXJPck9ic2VydmVyKSB7XG4gICAgICByZXR1cm4ge1xuICAgICAgICB1bnN1YnNjcmliZTogZnVuY3Rpb24gKCkge1xuICAgICAgICAgIHJldHVybiB2b2lkIDA7XG4gICAgICAgIH1cbiAgICAgIH07XG4gICAgfVxuXG4gICAgdmFyIGxpc3RlbmVyO1xuICAgIHZhciByZXNvbHZlZENvbXBsZXRlTGlzdGVuZXIgPSBjb21wbGV0ZUxpc3RlbmVyO1xuXG4gICAgaWYgKHR5cGVvZiBuZXh0TGlzdGVuZXJPck9ic2VydmVyID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICBsaXN0ZW5lciA9IG5leHRMaXN0ZW5lck9yT2JzZXJ2ZXI7XG4gICAgfSBlbHNlIHtcbiAgICAgIGxpc3RlbmVyID0gbmV4dExpc3RlbmVyT3JPYnNlcnZlci5uZXh0LmJpbmQobmV4dExpc3RlbmVyT3JPYnNlcnZlcik7XG4gICAgICByZXNvbHZlZENvbXBsZXRlTGlzdGVuZXIgPSBuZXh0TGlzdGVuZXJPck9ic2VydmVyLmNvbXBsZXRlLmJpbmQobmV4dExpc3RlbmVyT3JPYnNlcnZlcik7XG4gICAgfVxuXG4gICAgdGhpcy5saXN0ZW5lcnMuYWRkKGxpc3RlbmVyKTsgLy8gU2VuZCBjdXJyZW50IHN0YXRlIHRvIGxpc3RlbmVyXG5cbiAgICBpZiAodGhpcy5zdGF0dXMgPT09IEludGVycHJldGVyU3RhdHVzLlJ1bm5pbmcpIHtcbiAgICAgIGxpc3RlbmVyKHRoaXMuc3RhdGUpO1xuICAgIH1cblxuICAgIGlmIChyZXNvbHZlZENvbXBsZXRlTGlzdGVuZXIpIHtcbiAgICAgIHRoaXMub25Eb25lKHJlc29sdmVkQ29tcGxldGVMaXN0ZW5lcik7XG4gICAgfVxuXG4gICAgcmV0dXJuIHtcbiAgICAgIHVuc3Vic2NyaWJlOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIGxpc3RlbmVyICYmIF90aGlzLmxpc3RlbmVycy5kZWxldGUobGlzdGVuZXIpO1xuICAgICAgICByZXNvbHZlZENvbXBsZXRlTGlzdGVuZXIgJiYgX3RoaXMuZG9uZUxpc3RlbmVycy5kZWxldGUocmVzb2x2ZWRDb21wbGV0ZUxpc3RlbmVyKTtcbiAgICAgIH1cbiAgICB9O1xuICB9O1xuICAvKipcclxuICAgKiBBZGRzIGFuIGV2ZW50IGxpc3RlbmVyIHRoYXQgaXMgbm90aWZpZWQgd2hlbmV2ZXIgYW4gZXZlbnQgaXMgc2VudCB0byB0aGUgcnVubmluZyBpbnRlcnByZXRlci5cclxuICAgKiBAcGFyYW0gbGlzdGVuZXIgVGhlIGV2ZW50IGxpc3RlbmVyXHJcbiAgICovXG5cblxuICBJbnRlcnByZXRlci5wcm90b3R5cGUub25FdmVudCA9IGZ1bmN0aW9uIChsaXN0ZW5lcikge1xuICAgIHRoaXMuZXZlbnRMaXN0ZW5lcnMuYWRkKGxpc3RlbmVyKTtcbiAgICByZXR1cm4gdGhpcztcbiAgfTtcbiAgLyoqXHJcbiAgICogQWRkcyBhbiBldmVudCBsaXN0ZW5lciB0aGF0IGlzIG5vdGlmaWVkIHdoZW5ldmVyIGEgYHNlbmRgIGV2ZW50IG9jY3Vycy5cclxuICAgKiBAcGFyYW0gbGlzdGVuZXIgVGhlIGV2ZW50IGxpc3RlbmVyXHJcbiAgICovXG5cblxuICBJbnRlcnByZXRlci5wcm90b3R5cGUub25TZW5kID0gZnVuY3Rpb24gKGxpc3RlbmVyKSB7XG4gICAgdGhpcy5zZW5kTGlzdGVuZXJzLmFkZChsaXN0ZW5lcik7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH07XG4gIC8qKlxyXG4gICAqIEFkZHMgYSBjb250ZXh0IGxpc3RlbmVyIHRoYXQgaXMgbm90aWZpZWQgd2hlbmV2ZXIgdGhlIHN0YXRlIGNvbnRleHQgY2hhbmdlcy5cclxuICAgKiBAcGFyYW0gbGlzdGVuZXIgVGhlIGNvbnRleHQgbGlzdGVuZXJcclxuICAgKi9cblxuXG4gIEludGVycHJldGVyLnByb3RvdHlwZS5vbkNoYW5nZSA9IGZ1bmN0aW9uIChsaXN0ZW5lcikge1xuICAgIHRoaXMuY29udGV4dExpc3RlbmVycy5hZGQobGlzdGVuZXIpO1xuICAgIHJldHVybiB0aGlzO1xuICB9O1xuICAvKipcclxuICAgKiBBZGRzIGEgbGlzdGVuZXIgdGhhdCBpcyBub3RpZmllZCB3aGVuIHRoZSBtYWNoaW5lIGlzIHN0b3BwZWQuXHJcbiAgICogQHBhcmFtIGxpc3RlbmVyIFRoZSBsaXN0ZW5lclxyXG4gICAqL1xuXG5cbiAgSW50ZXJwcmV0ZXIucHJvdG90eXBlLm9uU3RvcCA9IGZ1bmN0aW9uIChsaXN0ZW5lcikge1xuICAgIHRoaXMuc3RvcExpc3RlbmVycy5hZGQobGlzdGVuZXIpO1xuICAgIHJldHVybiB0aGlzO1xuICB9O1xuICAvKipcclxuICAgKiBBZGRzIGEgc3RhdGUgbGlzdGVuZXIgdGhhdCBpcyBub3RpZmllZCB3aGVuIHRoZSBzdGF0ZWNoYXJ0IGhhcyByZWFjaGVkIGl0cyBmaW5hbCBzdGF0ZS5cclxuICAgKiBAcGFyYW0gbGlzdGVuZXIgVGhlIHN0YXRlIGxpc3RlbmVyXHJcbiAgICovXG5cblxuICBJbnRlcnByZXRlci5wcm90b3R5cGUub25Eb25lID0gZnVuY3Rpb24gKGxpc3RlbmVyKSB7XG4gICAgdGhpcy5kb25lTGlzdGVuZXJzLmFkZChsaXN0ZW5lcik7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH07XG4gIC8qKlxyXG4gICAqIFJlbW92ZXMgYSBsaXN0ZW5lci5cclxuICAgKiBAcGFyYW0gbGlzdGVuZXIgVGhlIGxpc3RlbmVyIHRvIHJlbW92ZVxyXG4gICAqL1xuXG5cbiAgSW50ZXJwcmV0ZXIucHJvdG90eXBlLm9mZiA9IGZ1bmN0aW9uIChsaXN0ZW5lcikge1xuICAgIHRoaXMubGlzdGVuZXJzLmRlbGV0ZShsaXN0ZW5lcik7XG4gICAgdGhpcy5ldmVudExpc3RlbmVycy5kZWxldGUobGlzdGVuZXIpO1xuICAgIHRoaXMuc2VuZExpc3RlbmVycy5kZWxldGUobGlzdGVuZXIpO1xuICAgIHRoaXMuc3RvcExpc3RlbmVycy5kZWxldGUobGlzdGVuZXIpO1xuICAgIHRoaXMuZG9uZUxpc3RlbmVycy5kZWxldGUobGlzdGVuZXIpO1xuICAgIHRoaXMuY29udGV4dExpc3RlbmVycy5kZWxldGUobGlzdGVuZXIpO1xuICAgIHJldHVybiB0aGlzO1xuICB9O1xuICAvKipcclxuICAgKiBTdGFydHMgdGhlIGludGVycHJldGVyIGZyb20gdGhlIGdpdmVuIHN0YXRlLCBvciB0aGUgaW5pdGlhbCBzdGF0ZS5cclxuICAgKiBAcGFyYW0gaW5pdGlhbFN0YXRlIFRoZSBzdGF0ZSB0byBzdGFydCB0aGUgc3RhdGVjaGFydCBmcm9tXHJcbiAgICovXG5cblxuICBJbnRlcnByZXRlci5wcm90b3R5cGUuc3RhcnQgPSBmdW5jdGlvbiAoaW5pdGlhbFN0YXRlKSB7XG4gICAgdmFyIF90aGlzID0gdGhpcztcblxuICAgIGlmICh0aGlzLnN0YXR1cyA9PT0gSW50ZXJwcmV0ZXJTdGF0dXMuUnVubmluZykge1xuICAgICAgLy8gRG8gbm90IHJlc3RhcnQgdGhlIHNlcnZpY2UgaWYgaXQgaXMgYWxyZWFkeSBzdGFydGVkXG4gICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICByZWdpc3RyeS5yZWdpc3Rlcih0aGlzLnNlc3Npb25JZCwgdGhpcyk7XG4gICAgdGhpcy5pbml0aWFsaXplZCA9IHRydWU7XG4gICAgdGhpcy5zdGF0dXMgPSBJbnRlcnByZXRlclN0YXR1cy5SdW5uaW5nO1xuICAgIHZhciByZXNvbHZlZFN0YXRlID0gaW5pdGlhbFN0YXRlID09PSB1bmRlZmluZWQgPyB0aGlzLmluaXRpYWxTdGF0ZSA6IHByb3ZpZGUodGhpcywgZnVuY3Rpb24gKCkge1xuICAgICAgcmV0dXJuIGlzU3RhdGUoaW5pdGlhbFN0YXRlKSA/IF90aGlzLm1hY2hpbmUucmVzb2x2ZVN0YXRlKGluaXRpYWxTdGF0ZSkgOiBfdGhpcy5tYWNoaW5lLnJlc29sdmVTdGF0ZShTdGF0ZS5mcm9tKGluaXRpYWxTdGF0ZSwgX3RoaXMubWFjaGluZS5jb250ZXh0KSk7XG4gICAgfSk7XG5cbiAgICBpZiAodGhpcy5vcHRpb25zLmRldlRvb2xzKSB7XG4gICAgICB0aGlzLmF0dGFjaERldigpO1xuICAgIH1cblxuICAgIHRoaXMuc2NoZWR1bGVyLmluaXRpYWxpemUoZnVuY3Rpb24gKCkge1xuICAgICAgX3RoaXMudXBkYXRlKHJlc29sdmVkU3RhdGUsIGluaXRFdmVudCk7XG4gICAgfSk7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH07XG4gIC8qKlxyXG4gICAqIFN0b3BzIHRoZSBpbnRlcnByZXRlciBhbmQgdW5zdWJzY3JpYmUgYWxsIGxpc3RlbmVycy5cclxuICAgKlxyXG4gICAqIFRoaXMgd2lsbCBhbHNvIG5vdGlmeSB0aGUgYG9uU3RvcGAgbGlzdGVuZXJzLlxyXG4gICAqL1xuXG5cbiAgSW50ZXJwcmV0ZXIucHJvdG90eXBlLnN0b3AgPSBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIGVfNiwgX2EsIGVfNywgX2IsIGVfOCwgX2MsIGVfOSwgX2QsIGVfMTAsIF9lO1xuXG4gICAgdmFyIF90aGlzID0gdGhpcztcblxuICAgIHRyeSB7XG4gICAgICBmb3IgKHZhciBfZiA9IF9fdmFsdWVzKHRoaXMubGlzdGVuZXJzKSwgX2cgPSBfZi5uZXh0KCk7ICFfZy5kb25lOyBfZyA9IF9mLm5leHQoKSkge1xuICAgICAgICB2YXIgbGlzdGVuZXIgPSBfZy52YWx1ZTtcbiAgICAgICAgdGhpcy5saXN0ZW5lcnMuZGVsZXRlKGxpc3RlbmVyKTtcbiAgICAgIH1cbiAgICB9IGNhdGNoIChlXzZfMSkge1xuICAgICAgZV82ID0ge1xuICAgICAgICBlcnJvcjogZV82XzFcbiAgICAgIH07XG4gICAgfSBmaW5hbGx5IHtcbiAgICAgIHRyeSB7XG4gICAgICAgIGlmIChfZyAmJiAhX2cuZG9uZSAmJiAoX2EgPSBfZi5yZXR1cm4pKSBfYS5jYWxsKF9mKTtcbiAgICAgIH0gZmluYWxseSB7XG4gICAgICAgIGlmIChlXzYpIHRocm93IGVfNi5lcnJvcjtcbiAgICAgIH1cbiAgICB9XG5cbiAgICB0cnkge1xuICAgICAgZm9yICh2YXIgX2ggPSBfX3ZhbHVlcyh0aGlzLnN0b3BMaXN0ZW5lcnMpLCBfaiA9IF9oLm5leHQoKTsgIV9qLmRvbmU7IF9qID0gX2gubmV4dCgpKSB7XG4gICAgICAgIHZhciBsaXN0ZW5lciA9IF9qLnZhbHVlOyAvLyBjYWxsIGxpc3RlbmVyLCB0aGVuIHJlbW92ZVxuXG4gICAgICAgIGxpc3RlbmVyKCk7XG4gICAgICAgIHRoaXMuc3RvcExpc3RlbmVycy5kZWxldGUobGlzdGVuZXIpO1xuICAgICAgfVxuICAgIH0gY2F0Y2ggKGVfN18xKSB7XG4gICAgICBlXzcgPSB7XG4gICAgICAgIGVycm9yOiBlXzdfMVxuICAgICAgfTtcbiAgICB9IGZpbmFsbHkge1xuICAgICAgdHJ5IHtcbiAgICAgICAgaWYgKF9qICYmICFfai5kb25lICYmIChfYiA9IF9oLnJldHVybikpIF9iLmNhbGwoX2gpO1xuICAgICAgfSBmaW5hbGx5IHtcbiAgICAgICAgaWYgKGVfNykgdGhyb3cgZV83LmVycm9yO1xuICAgICAgfVxuICAgIH1cblxuICAgIHRyeSB7XG4gICAgICBmb3IgKHZhciBfayA9IF9fdmFsdWVzKHRoaXMuY29udGV4dExpc3RlbmVycyksIF9sID0gX2submV4dCgpOyAhX2wuZG9uZTsgX2wgPSBfay5uZXh0KCkpIHtcbiAgICAgICAgdmFyIGxpc3RlbmVyID0gX2wudmFsdWU7XG4gICAgICAgIHRoaXMuY29udGV4dExpc3RlbmVycy5kZWxldGUobGlzdGVuZXIpO1xuICAgICAgfVxuICAgIH0gY2F0Y2ggKGVfOF8xKSB7XG4gICAgICBlXzggPSB7XG4gICAgICAgIGVycm9yOiBlXzhfMVxuICAgICAgfTtcbiAgICB9IGZpbmFsbHkge1xuICAgICAgdHJ5IHtcbiAgICAgICAgaWYgKF9sICYmICFfbC5kb25lICYmIChfYyA9IF9rLnJldHVybikpIF9jLmNhbGwoX2spO1xuICAgICAgfSBmaW5hbGx5IHtcbiAgICAgICAgaWYgKGVfOCkgdGhyb3cgZV84LmVycm9yO1xuICAgICAgfVxuICAgIH1cblxuICAgIHRyeSB7XG4gICAgICBmb3IgKHZhciBfbSA9IF9fdmFsdWVzKHRoaXMuZG9uZUxpc3RlbmVycyksIF9vID0gX20ubmV4dCgpOyAhX28uZG9uZTsgX28gPSBfbS5uZXh0KCkpIHtcbiAgICAgICAgdmFyIGxpc3RlbmVyID0gX28udmFsdWU7XG4gICAgICAgIHRoaXMuZG9uZUxpc3RlbmVycy5kZWxldGUobGlzdGVuZXIpO1xuICAgICAgfVxuICAgIH0gY2F0Y2ggKGVfOV8xKSB7XG4gICAgICBlXzkgPSB7XG4gICAgICAgIGVycm9yOiBlXzlfMVxuICAgICAgfTtcbiAgICB9IGZpbmFsbHkge1xuICAgICAgdHJ5IHtcbiAgICAgICAgaWYgKF9vICYmICFfby5kb25lICYmIChfZCA9IF9tLnJldHVybikpIF9kLmNhbGwoX20pO1xuICAgICAgfSBmaW5hbGx5IHtcbiAgICAgICAgaWYgKGVfOSkgdGhyb3cgZV85LmVycm9yO1xuICAgICAgfVxuICAgIH1cblxuICAgIGlmICghdGhpcy5pbml0aWFsaXplZCkge1xuICAgICAgLy8gSW50ZXJwcmV0ZXIgYWxyZWFkeSBzdG9wcGVkOyBkbyBub3RoaW5nXG4gICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICB0aGlzLnN0YXRlLmNvbmZpZ3VyYXRpb24uZm9yRWFjaChmdW5jdGlvbiAoc3RhdGVOb2RlKSB7XG4gICAgICB2YXIgZV8xMSwgX2E7XG5cbiAgICAgIHRyeSB7XG4gICAgICAgIGZvciAodmFyIF9iID0gX192YWx1ZXMoc3RhdGVOb2RlLmRlZmluaXRpb24uZXhpdCksIF9jID0gX2IubmV4dCgpOyAhX2MuZG9uZTsgX2MgPSBfYi5uZXh0KCkpIHtcbiAgICAgICAgICB2YXIgYWN0aW9uID0gX2MudmFsdWU7XG5cbiAgICAgICAgICBfdGhpcy5leGVjKGFjdGlvbiwgX3RoaXMuc3RhdGUpO1xuICAgICAgICB9XG4gICAgICB9IGNhdGNoIChlXzExXzEpIHtcbiAgICAgICAgZV8xMSA9IHtcbiAgICAgICAgICBlcnJvcjogZV8xMV8xXG4gICAgICAgIH07XG4gICAgICB9IGZpbmFsbHkge1xuICAgICAgICB0cnkge1xuICAgICAgICAgIGlmIChfYyAmJiAhX2MuZG9uZSAmJiAoX2EgPSBfYi5yZXR1cm4pKSBfYS5jYWxsKF9iKTtcbiAgICAgICAgfSBmaW5hbGx5IHtcbiAgICAgICAgICBpZiAoZV8xMSkgdGhyb3cgZV8xMS5lcnJvcjtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0pOyAvLyBTdG9wIGFsbCBjaGlsZHJlblxuXG4gICAgdGhpcy5jaGlsZHJlbi5mb3JFYWNoKGZ1bmN0aW9uIChjaGlsZCkge1xuICAgICAgaWYgKGlzRnVuY3Rpb24oY2hpbGQuc3RvcCkpIHtcbiAgICAgICAgY2hpbGQuc3RvcCgpO1xuICAgICAgfVxuICAgIH0pO1xuXG4gICAgdHJ5IHtcbiAgICAgIC8vIENhbmNlbCBhbGwgZGVsYXllZCBldmVudHNcbiAgICAgIGZvciAodmFyIF9wID0gX192YWx1ZXMoa2V5cyh0aGlzLmRlbGF5ZWRFdmVudHNNYXApKSwgX3EgPSBfcC5uZXh0KCk7ICFfcS5kb25lOyBfcSA9IF9wLm5leHQoKSkge1xuICAgICAgICB2YXIga2V5ID0gX3EudmFsdWU7XG4gICAgICAgIHRoaXMuY2xvY2suY2xlYXJUaW1lb3V0KHRoaXMuZGVsYXllZEV2ZW50c01hcFtrZXldKTtcbiAgICAgIH1cbiAgICB9IGNhdGNoIChlXzEwXzEpIHtcbiAgICAgIGVfMTAgPSB7XG4gICAgICAgIGVycm9yOiBlXzEwXzFcbiAgICAgIH07XG4gICAgfSBmaW5hbGx5IHtcbiAgICAgIHRyeSB7XG4gICAgICAgIGlmIChfcSAmJiAhX3EuZG9uZSAmJiAoX2UgPSBfcC5yZXR1cm4pKSBfZS5jYWxsKF9wKTtcbiAgICAgIH0gZmluYWxseSB7XG4gICAgICAgIGlmIChlXzEwKSB0aHJvdyBlXzEwLmVycm9yO1xuICAgICAgfVxuICAgIH1cblxuICAgIHRoaXMuc2NoZWR1bGVyLmNsZWFyKCk7XG4gICAgdGhpcy5pbml0aWFsaXplZCA9IGZhbHNlO1xuICAgIHRoaXMuc3RhdHVzID0gSW50ZXJwcmV0ZXJTdGF0dXMuU3RvcHBlZDtcbiAgICByZWdpc3RyeS5mcmVlKHRoaXMuc2Vzc2lvbklkKTtcbiAgICByZXR1cm4gdGhpcztcbiAgfTtcblxuICBJbnRlcnByZXRlci5wcm90b3R5cGUuYmF0Y2ggPSBmdW5jdGlvbiAoZXZlbnRzKSB7XG4gICAgdmFyIF90aGlzID0gdGhpcztcblxuICAgIGlmICh0aGlzLnN0YXR1cyA9PT0gSW50ZXJwcmV0ZXJTdGF0dXMuTm90U3RhcnRlZCAmJiB0aGlzLm9wdGlvbnMuZGVmZXJFdmVudHMpIHtcbiAgICAgIC8vIHRzbGludDpkaXNhYmxlLW5leHQtbGluZTpuby1jb25zb2xlXG4gICAgICBpZiAoIUlTX1BST0RVQ1RJT04pIHtcbiAgICAgICAgd2FybihmYWxzZSwgZXZlbnRzLmxlbmd0aCArIFwiIGV2ZW50KHMpIHdlcmUgc2VudCB0byB1bmluaXRpYWxpemVkIHNlcnZpY2UgXFxcIlwiICsgdGhpcy5tYWNoaW5lLmlkICsgXCJcXFwiIGFuZCBhcmUgZGVmZXJyZWQuIE1ha2Ugc3VyZSAuc3RhcnQoKSBpcyBjYWxsZWQgZm9yIHRoaXMgc2VydmljZS5cXG5FdmVudDogXCIgKyBKU09OLnN0cmluZ2lmeShldmVudCkpO1xuICAgICAgfVxuICAgIH0gZWxzZSBpZiAodGhpcy5zdGF0dXMgIT09IEludGVycHJldGVyU3RhdHVzLlJ1bm5pbmcpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvciggLy8gdHNsaW50OmRpc2FibGUtbmV4dC1saW5lOm1heC1saW5lLWxlbmd0aFxuICAgICAgZXZlbnRzLmxlbmd0aCArIFwiIGV2ZW50KHMpIHdlcmUgc2VudCB0byB1bmluaXRpYWxpemVkIHNlcnZpY2UgXFxcIlwiICsgdGhpcy5tYWNoaW5lLmlkICsgXCJcXFwiLiBNYWtlIHN1cmUgLnN0YXJ0KCkgaXMgY2FsbGVkIGZvciB0aGlzIHNlcnZpY2UsIG9yIHNldCB7IGRlZmVyRXZlbnRzOiB0cnVlIH0gaW4gdGhlIHNlcnZpY2Ugb3B0aW9ucy5cIik7XG4gICAgfVxuXG4gICAgdGhpcy5zY2hlZHVsZXIuc2NoZWR1bGUoZnVuY3Rpb24gKCkge1xuICAgICAgdmFyIGVfMTIsIF9hO1xuXG4gICAgICB2YXIgbmV4dFN0YXRlID0gX3RoaXMuc3RhdGU7XG4gICAgICB2YXIgYmF0Y2hDaGFuZ2VkID0gZmFsc2U7XG4gICAgICB2YXIgYmF0Y2hlZEFjdGlvbnMgPSBbXTtcblxuICAgICAgdmFyIF9sb29wXzEgPSBmdW5jdGlvbiAoZXZlbnRfMSkge1xuICAgICAgICB2YXIgX2V2ZW50ID0gdG9TQ1hNTEV2ZW50KGV2ZW50XzEpO1xuXG4gICAgICAgIF90aGlzLmZvcndhcmQoX2V2ZW50KTtcblxuICAgICAgICBuZXh0U3RhdGUgPSBwcm92aWRlKF90aGlzLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgcmV0dXJuIF90aGlzLm1hY2hpbmUudHJhbnNpdGlvbihuZXh0U3RhdGUsIF9ldmVudCk7XG4gICAgICAgIH0pO1xuICAgICAgICBiYXRjaGVkQWN0aW9ucy5wdXNoLmFwcGx5KGJhdGNoZWRBY3Rpb25zLCBfX3NwcmVhZChuZXh0U3RhdGUuYWN0aW9ucy5tYXAoZnVuY3Rpb24gKGEpIHtcbiAgICAgICAgICByZXR1cm4gYmluZEFjdGlvblRvU3RhdGUoYSwgbmV4dFN0YXRlKTtcbiAgICAgICAgfSkpKTtcbiAgICAgICAgYmF0Y2hDaGFuZ2VkID0gYmF0Y2hDaGFuZ2VkIHx8ICEhbmV4dFN0YXRlLmNoYW5nZWQ7XG4gICAgICB9O1xuXG4gICAgICB0cnkge1xuICAgICAgICBmb3IgKHZhciBldmVudHNfMSA9IF9fdmFsdWVzKGV2ZW50cyksIGV2ZW50c18xXzEgPSBldmVudHNfMS5uZXh0KCk7ICFldmVudHNfMV8xLmRvbmU7IGV2ZW50c18xXzEgPSBldmVudHNfMS5uZXh0KCkpIHtcbiAgICAgICAgICB2YXIgZXZlbnRfMSA9IGV2ZW50c18xXzEudmFsdWU7XG5cbiAgICAgICAgICBfbG9vcF8xKGV2ZW50XzEpO1xuICAgICAgICB9XG4gICAgICB9IGNhdGNoIChlXzEyXzEpIHtcbiAgICAgICAgZV8xMiA9IHtcbiAgICAgICAgICBlcnJvcjogZV8xMl8xXG4gICAgICAgIH07XG4gICAgICB9IGZpbmFsbHkge1xuICAgICAgICB0cnkge1xuICAgICAgICAgIGlmIChldmVudHNfMV8xICYmICFldmVudHNfMV8xLmRvbmUgJiYgKF9hID0gZXZlbnRzXzEucmV0dXJuKSkgX2EuY2FsbChldmVudHNfMSk7XG4gICAgICAgIH0gZmluYWxseSB7XG4gICAgICAgICAgaWYgKGVfMTIpIHRocm93IGVfMTIuZXJyb3I7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgbmV4dFN0YXRlLmNoYW5nZWQgPSBiYXRjaENoYW5nZWQ7XG4gICAgICBuZXh0U3RhdGUuYWN0aW9ucyA9IGJhdGNoZWRBY3Rpb25zO1xuXG4gICAgICBfdGhpcy51cGRhdGUobmV4dFN0YXRlLCB0b1NDWE1MRXZlbnQoZXZlbnRzW2V2ZW50cy5sZW5ndGggLSAxXSkpO1xuICAgIH0pO1xuICB9O1xuICAvKipcclxuICAgKiBSZXR1cm5zIGEgc2VuZCBmdW5jdGlvbiBib3VuZCB0byB0aGlzIGludGVycHJldGVyIGluc3RhbmNlLlxyXG4gICAqXHJcbiAgICogQHBhcmFtIGV2ZW50IFRoZSBldmVudCB0byBiZSBzZW50IGJ5IHRoZSBzZW5kZXIuXHJcbiAgICovXG5cblxuICBJbnRlcnByZXRlci5wcm90b3R5cGUuc2VuZGVyID0gZnVuY3Rpb24gKGV2ZW50KSB7XG4gICAgcmV0dXJuIHRoaXMuc2VuZC5iaW5kKHRoaXMsIGV2ZW50KTtcbiAgfTtcbiAgLyoqXHJcbiAgICogUmV0dXJucyB0aGUgbmV4dCBzdGF0ZSBnaXZlbiB0aGUgaW50ZXJwcmV0ZXIncyBjdXJyZW50IHN0YXRlIGFuZCB0aGUgZXZlbnQuXHJcbiAgICpcclxuICAgKiBUaGlzIGlzIGEgcHVyZSBtZXRob2QgdGhhdCBkb2VzIF9ub3RfIHVwZGF0ZSB0aGUgaW50ZXJwcmV0ZXIncyBzdGF0ZS5cclxuICAgKlxyXG4gICAqIEBwYXJhbSBldmVudCBUaGUgZXZlbnQgdG8gZGV0ZXJtaW5lIHRoZSBuZXh0IHN0YXRlXHJcbiAgICovXG5cblxuICBJbnRlcnByZXRlci5wcm90b3R5cGUubmV4dFN0YXRlID0gZnVuY3Rpb24gKGV2ZW50KSB7XG4gICAgdmFyIF90aGlzID0gdGhpcztcblxuICAgIHZhciBfZXZlbnQgPSB0b1NDWE1MRXZlbnQoZXZlbnQpO1xuXG4gICAgaWYgKF9ldmVudC5uYW1lLmluZGV4T2YoZXJyb3JQbGF0Zm9ybSkgPT09IDAgJiYgIXRoaXMuc3RhdGUubmV4dEV2ZW50cy5zb21lKGZ1bmN0aW9uIChuZXh0RXZlbnQpIHtcbiAgICAgIHJldHVybiBuZXh0RXZlbnQuaW5kZXhPZihlcnJvclBsYXRmb3JtKSA9PT0gMDtcbiAgICB9KSkge1xuICAgICAgdGhyb3cgX2V2ZW50LmRhdGEuZGF0YTtcbiAgICB9XG5cbiAgICB2YXIgbmV4dFN0YXRlID0gcHJvdmlkZSh0aGlzLCBmdW5jdGlvbiAoKSB7XG4gICAgICByZXR1cm4gX3RoaXMubWFjaGluZS50cmFuc2l0aW9uKF90aGlzLnN0YXRlLCBfZXZlbnQpO1xuICAgIH0pO1xuICAgIHJldHVybiBuZXh0U3RhdGU7XG4gIH07XG5cbiAgSW50ZXJwcmV0ZXIucHJvdG90eXBlLmZvcndhcmQgPSBmdW5jdGlvbiAoZXZlbnQpIHtcbiAgICB2YXIgZV8xMywgX2E7XG5cbiAgICB0cnkge1xuICAgICAgZm9yICh2YXIgX2IgPSBfX3ZhbHVlcyh0aGlzLmZvcndhcmRUbyksIF9jID0gX2IubmV4dCgpOyAhX2MuZG9uZTsgX2MgPSBfYi5uZXh0KCkpIHtcbiAgICAgICAgdmFyIGlkID0gX2MudmFsdWU7XG4gICAgICAgIHZhciBjaGlsZCA9IHRoaXMuY2hpbGRyZW4uZ2V0KGlkKTtcblxuICAgICAgICBpZiAoIWNoaWxkKSB7XG4gICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiVW5hYmxlIHRvIGZvcndhcmQgZXZlbnQgJ1wiICsgZXZlbnQgKyBcIicgZnJvbSBpbnRlcnByZXRlciAnXCIgKyB0aGlzLmlkICsgXCInIHRvIG5vbmV4aXN0YW50IGNoaWxkICdcIiArIGlkICsgXCInLlwiKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGNoaWxkLnNlbmQoZXZlbnQpO1xuICAgICAgfVxuICAgIH0gY2F0Y2ggKGVfMTNfMSkge1xuICAgICAgZV8xMyA9IHtcbiAgICAgICAgZXJyb3I6IGVfMTNfMVxuICAgICAgfTtcbiAgICB9IGZpbmFsbHkge1xuICAgICAgdHJ5IHtcbiAgICAgICAgaWYgKF9jICYmICFfYy5kb25lICYmIChfYSA9IF9iLnJldHVybikpIF9hLmNhbGwoX2IpO1xuICAgICAgfSBmaW5hbGx5IHtcbiAgICAgICAgaWYgKGVfMTMpIHRocm93IGVfMTMuZXJyb3I7XG4gICAgICB9XG4gICAgfVxuICB9O1xuXG4gIEludGVycHJldGVyLnByb3RvdHlwZS5kZWZlciA9IGZ1bmN0aW9uIChzZW5kQWN0aW9uKSB7XG4gICAgdmFyIF90aGlzID0gdGhpcztcblxuICAgIHRoaXMuZGVsYXllZEV2ZW50c01hcFtzZW5kQWN0aW9uLmlkXSA9IHRoaXMuY2xvY2suc2V0VGltZW91dChmdW5jdGlvbiAoKSB7XG4gICAgICBpZiAoc2VuZEFjdGlvbi50bykge1xuICAgICAgICBfdGhpcy5zZW5kVG8oc2VuZEFjdGlvbi5fZXZlbnQsIHNlbmRBY3Rpb24udG8pO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgX3RoaXMuc2VuZChzZW5kQWN0aW9uLl9ldmVudCk7XG4gICAgICB9XG4gICAgfSwgc2VuZEFjdGlvbi5kZWxheSk7XG4gIH07XG5cbiAgSW50ZXJwcmV0ZXIucHJvdG90eXBlLmNhbmNlbCA9IGZ1bmN0aW9uIChzZW5kSWQpIHtcbiAgICB0aGlzLmNsb2NrLmNsZWFyVGltZW91dCh0aGlzLmRlbGF5ZWRFdmVudHNNYXBbc2VuZElkXSk7XG4gICAgZGVsZXRlIHRoaXMuZGVsYXllZEV2ZW50c01hcFtzZW5kSWRdO1xuICB9O1xuXG4gIEludGVycHJldGVyLnByb3RvdHlwZS5leGVjID0gZnVuY3Rpb24gKGFjdGlvbiwgc3RhdGUsIGFjdGlvbkZ1bmN0aW9uTWFwKSB7XG4gICAgaWYgKGFjdGlvbkZ1bmN0aW9uTWFwID09PSB2b2lkIDApIHtcbiAgICAgIGFjdGlvbkZ1bmN0aW9uTWFwID0gdGhpcy5tYWNoaW5lLm9wdGlvbnMuYWN0aW9ucztcbiAgICB9XG5cbiAgICB2YXIgY29udGV4dCA9IHN0YXRlLmNvbnRleHQsXG4gICAgICAgIF9ldmVudCA9IHN0YXRlLl9ldmVudDtcbiAgICB2YXIgYWN0aW9uT3JFeGVjID0gYWN0aW9uLmV4ZWMgfHwgZ2V0QWN0aW9uRnVuY3Rpb24oYWN0aW9uLnR5cGUsIGFjdGlvbkZ1bmN0aW9uTWFwKTtcbiAgICB2YXIgZXhlYyA9IGlzRnVuY3Rpb24oYWN0aW9uT3JFeGVjKSA/IGFjdGlvbk9yRXhlYyA6IGFjdGlvbk9yRXhlYyA/IGFjdGlvbk9yRXhlYy5leGVjIDogYWN0aW9uLmV4ZWM7XG5cbiAgICBpZiAoZXhlYykge1xuICAgICAgdHJ5IHtcbiAgICAgICAgcmV0dXJuIGV4ZWMoY29udGV4dCwgX2V2ZW50LmRhdGEsIHtcbiAgICAgICAgICBhY3Rpb246IGFjdGlvbixcbiAgICAgICAgICBzdGF0ZTogdGhpcy5zdGF0ZSxcbiAgICAgICAgICBfZXZlbnQ6IF9ldmVudFxuICAgICAgICB9KTtcbiAgICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICBpZiAodGhpcy5wYXJlbnQpIHtcbiAgICAgICAgICB0aGlzLnBhcmVudC5zZW5kKHtcbiAgICAgICAgICAgIHR5cGU6ICd4c3RhdGUuZXJyb3InLFxuICAgICAgICAgICAgZGF0YTogZXJyXG4gICAgICAgICAgfSk7XG4gICAgICAgIH1cblxuICAgICAgICB0aHJvdyBlcnI7XG4gICAgICB9XG4gICAgfVxuXG4gICAgc3dpdGNoIChhY3Rpb24udHlwZSkge1xuICAgICAgY2FzZSBzZW5kOlxuICAgICAgICB2YXIgc2VuZEFjdGlvbiA9IGFjdGlvbjtcblxuICAgICAgICBpZiAodHlwZW9mIHNlbmRBY3Rpb24uZGVsYXkgPT09ICdudW1iZXInKSB7XG4gICAgICAgICAgdGhpcy5kZWZlcihzZW5kQWN0aW9uKTtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgaWYgKHNlbmRBY3Rpb24udG8pIHtcbiAgICAgICAgICAgIHRoaXMuc2VuZFRvKHNlbmRBY3Rpb24uX2V2ZW50LCBzZW5kQWN0aW9uLnRvKTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5zZW5kKHNlbmRBY3Rpb24uX2V2ZW50KTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBicmVhaztcblxuICAgICAgY2FzZSBjYW5jZWw6XG4gICAgICAgIHRoaXMuY2FuY2VsKGFjdGlvbi5zZW5kSWQpO1xuICAgICAgICBicmVhaztcblxuICAgICAgY2FzZSBzdGFydDpcbiAgICAgICAge1xuICAgICAgICAgIHZhciBhY3Rpdml0eSA9IGFjdGlvbi5hY3Rpdml0eTsgLy8gSWYgdGhlIGFjdGl2aXR5IHdpbGwgYmUgc3RvcHBlZCByaWdodCBhZnRlciBpdCdzIHN0YXJ0ZWRcbiAgICAgICAgICAvLyAoc3VjaCBhcyBpbiB0cmFuc2llbnQgc3RhdGVzKVxuICAgICAgICAgIC8vIGRvbid0IGJvdGhlciBzdGFydGluZyB0aGUgYWN0aXZpdHkuXG5cbiAgICAgICAgICBpZiAoIXRoaXMuc3RhdGUuYWN0aXZpdGllc1thY3Rpdml0eS5pZCB8fCBhY3Rpdml0eS50eXBlXSkge1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgfSAvLyBJbnZva2VkIHNlcnZpY2VzXG5cblxuICAgICAgICAgIGlmIChhY3Rpdml0eS50eXBlID09PSBBY3Rpb25UeXBlcy5JbnZva2UpIHtcbiAgICAgICAgICAgIHZhciBpbnZva2VTb3VyY2UgPSB0b0ludm9rZVNvdXJjZShhY3Rpdml0eS5zcmMpO1xuICAgICAgICAgICAgdmFyIHNlcnZpY2VDcmVhdG9yID0gdGhpcy5tYWNoaW5lLm9wdGlvbnMuc2VydmljZXMgPyB0aGlzLm1hY2hpbmUub3B0aW9ucy5zZXJ2aWNlc1tpbnZva2VTb3VyY2UudHlwZV0gOiB1bmRlZmluZWQ7XG4gICAgICAgICAgICB2YXIgaWQgPSBhY3Rpdml0eS5pZCxcbiAgICAgICAgICAgICAgICBkYXRhID0gYWN0aXZpdHkuZGF0YTtcblxuICAgICAgICAgICAgaWYgKCFJU19QUk9EVUNUSU9OKSB7XG4gICAgICAgICAgICAgIHdhcm4oISgnZm9yd2FyZCcgaW4gYWN0aXZpdHkpLCAvLyB0c2xpbnQ6ZGlzYWJsZS1uZXh0LWxpbmU6bWF4LWxpbmUtbGVuZ3RoXG4gICAgICAgICAgICAgIFwiYGZvcndhcmRgIHByb3BlcnR5IGlzIGRlcHJlY2F0ZWQgKGZvdW5kIGluIGludm9jYXRpb24gb2YgJ1wiICsgYWN0aXZpdHkuc3JjICsgXCInIGluIGluIG1hY2hpbmUgJ1wiICsgdGhpcy5tYWNoaW5lLmlkICsgXCInKS4gXCIgKyBcIlBsZWFzZSB1c2UgYGF1dG9Gb3J3YXJkYCBpbnN0ZWFkLlwiKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdmFyIGF1dG9Gb3J3YXJkID0gJ2F1dG9Gb3J3YXJkJyBpbiBhY3Rpdml0eSA/IGFjdGl2aXR5LmF1dG9Gb3J3YXJkIDogISFhY3Rpdml0eS5mb3J3YXJkO1xuXG4gICAgICAgICAgICBpZiAoIXNlcnZpY2VDcmVhdG9yKSB7XG4gICAgICAgICAgICAgIC8vIHRzbGludDpkaXNhYmxlLW5leHQtbGluZTpuby1jb25zb2xlXG4gICAgICAgICAgICAgIGlmICghSVNfUFJPRFVDVElPTikge1xuICAgICAgICAgICAgICAgIHdhcm4oZmFsc2UsIFwiTm8gc2VydmljZSBmb3VuZCBmb3IgaW52b2NhdGlvbiAnXCIgKyBhY3Rpdml0eS5zcmMgKyBcIicgaW4gbWFjaGluZSAnXCIgKyB0aGlzLm1hY2hpbmUuaWQgKyBcIicuXCIpO1xuICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB2YXIgcmVzb2x2ZWREYXRhID0gZGF0YSA/IG1hcENvbnRleHQoZGF0YSwgY29udGV4dCwgX2V2ZW50KSA6IHVuZGVmaW5lZDtcbiAgICAgICAgICAgIHZhciBzb3VyY2UgPSBpc0Z1bmN0aW9uKHNlcnZpY2VDcmVhdG9yKSA/IHNlcnZpY2VDcmVhdG9yKGNvbnRleHQsIF9ldmVudC5kYXRhLCB7XG4gICAgICAgICAgICAgIGRhdGE6IHJlc29sdmVkRGF0YSxcbiAgICAgICAgICAgICAgc3JjOiBpbnZva2VTb3VyY2VcbiAgICAgICAgICAgIH0pIDogc2VydmljZUNyZWF0b3I7XG5cbiAgICAgICAgICAgIGlmIChpc1Byb21pc2VMaWtlKHNvdXJjZSkpIHtcbiAgICAgICAgICAgICAgdGhpcy5zcGF3blByb21pc2UoUHJvbWlzZS5yZXNvbHZlKHNvdXJjZSksIGlkKTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoaXNGdW5jdGlvbihzb3VyY2UpKSB7XG4gICAgICAgICAgICAgIHRoaXMuc3Bhd25DYWxsYmFjayhzb3VyY2UsIGlkKTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoaXNPYnNlcnZhYmxlKHNvdXJjZSkpIHtcbiAgICAgICAgICAgICAgdGhpcy5zcGF3bk9ic2VydmFibGUoc291cmNlLCBpZCk7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKGlzTWFjaGluZShzb3VyY2UpKSB7XG4gICAgICAgICAgICAgIC8vIFRPRE86IHRyeS9jYXRjaCBoZXJlXG4gICAgICAgICAgICAgIHRoaXMuc3Bhd25NYWNoaW5lKHJlc29sdmVkRGF0YSA/IHNvdXJjZS53aXRoQ29udGV4dChyZXNvbHZlZERhdGEpIDogc291cmNlLCB7XG4gICAgICAgICAgICAgICAgaWQ6IGlkLFxuICAgICAgICAgICAgICAgIGF1dG9Gb3J3YXJkOiBhdXRvRm9yd2FyZFxuICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0gZWxzZSA7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMuc3Bhd25BY3Rpdml0eShhY3Rpdml0eSk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cblxuICAgICAgY2FzZSBzdG9wOlxuICAgICAgICB7XG4gICAgICAgICAgdGhpcy5zdG9wQ2hpbGQoYWN0aW9uLmFjdGl2aXR5LmlkKTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuXG4gICAgICBjYXNlIGxvZzpcbiAgICAgICAgdmFyIGxhYmVsID0gYWN0aW9uLmxhYmVsLFxuICAgICAgICAgICAgdmFsdWUgPSBhY3Rpb24udmFsdWU7XG5cbiAgICAgICAgaWYgKGxhYmVsKSB7XG4gICAgICAgICAgdGhpcy5sb2dnZXIobGFiZWwsIHZhbHVlKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB0aGlzLmxvZ2dlcih2YWx1ZSk7XG4gICAgICAgIH1cblxuICAgICAgICBicmVhaztcblxuICAgICAgZGVmYXVsdDpcbiAgICAgICAgaWYgKCFJU19QUk9EVUNUSU9OKSB7XG4gICAgICAgICAgd2FybihmYWxzZSwgXCJObyBpbXBsZW1lbnRhdGlvbiBmb3VuZCBmb3IgYWN0aW9uIHR5cGUgJ1wiICsgYWN0aW9uLnR5cGUgKyBcIidcIik7XG4gICAgICAgIH1cblxuICAgICAgICBicmVhaztcbiAgICB9XG5cbiAgICByZXR1cm4gdW5kZWZpbmVkO1xuICB9O1xuXG4gIEludGVycHJldGVyLnByb3RvdHlwZS5yZW1vdmVDaGlsZCA9IGZ1bmN0aW9uIChjaGlsZElkKSB7XG4gICAgdGhpcy5jaGlsZHJlbi5kZWxldGUoY2hpbGRJZCk7XG4gICAgdGhpcy5mb3J3YXJkVG8uZGVsZXRlKGNoaWxkSWQpO1xuICAgIGRlbGV0ZSB0aGlzLnN0YXRlLmNoaWxkcmVuW2NoaWxkSWRdO1xuICB9O1xuXG4gIEludGVycHJldGVyLnByb3RvdHlwZS5zdG9wQ2hpbGQgPSBmdW5jdGlvbiAoY2hpbGRJZCkge1xuICAgIHZhciBjaGlsZCA9IHRoaXMuY2hpbGRyZW4uZ2V0KGNoaWxkSWQpO1xuXG4gICAgaWYgKCFjaGlsZCkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHRoaXMucmVtb3ZlQ2hpbGQoY2hpbGRJZCk7XG5cbiAgICBpZiAoaXNGdW5jdGlvbihjaGlsZC5zdG9wKSkge1xuICAgICAgY2hpbGQuc3RvcCgpO1xuICAgIH1cbiAgfTtcblxuICBJbnRlcnByZXRlci5wcm90b3R5cGUuc3Bhd24gPSBmdW5jdGlvbiAoZW50aXR5LCBuYW1lLCBvcHRpb25zKSB7XG4gICAgaWYgKGlzUHJvbWlzZUxpa2UoZW50aXR5KSkge1xuICAgICAgcmV0dXJuIHRoaXMuc3Bhd25Qcm9taXNlKFByb21pc2UucmVzb2x2ZShlbnRpdHkpLCBuYW1lKTtcbiAgICB9IGVsc2UgaWYgKGlzRnVuY3Rpb24oZW50aXR5KSkge1xuICAgICAgcmV0dXJuIHRoaXMuc3Bhd25DYWxsYmFjayhlbnRpdHksIG5hbWUpO1xuICAgIH0gZWxzZSBpZiAoaXNTcGF3bmVkQWN0b3IoZW50aXR5KSkge1xuICAgICAgcmV0dXJuIHRoaXMuc3Bhd25BY3RvcihlbnRpdHkpO1xuICAgIH0gZWxzZSBpZiAoaXNPYnNlcnZhYmxlKGVudGl0eSkpIHtcbiAgICAgIHJldHVybiB0aGlzLnNwYXduT2JzZXJ2YWJsZShlbnRpdHksIG5hbWUpO1xuICAgIH0gZWxzZSBpZiAoaXNNYWNoaW5lKGVudGl0eSkpIHtcbiAgICAgIHJldHVybiB0aGlzLnNwYXduTWFjaGluZShlbnRpdHksIF9fYXNzaWduKF9fYXNzaWduKHt9LCBvcHRpb25zKSwge1xuICAgICAgICBpZDogbmFtZVxuICAgICAgfSkpO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXCJVbmFibGUgdG8gc3Bhd24gZW50aXR5IFxcXCJcIiArIG5hbWUgKyBcIlxcXCIgb2YgdHlwZSBcXFwiXCIgKyB0eXBlb2YgZW50aXR5ICsgXCJcXFwiLlwiKTtcbiAgICB9XG4gIH07XG5cbiAgSW50ZXJwcmV0ZXIucHJvdG90eXBlLnNwYXduTWFjaGluZSA9IGZ1bmN0aW9uIChtYWNoaW5lLCBvcHRpb25zKSB7XG4gICAgdmFyIF90aGlzID0gdGhpcztcblxuICAgIGlmIChvcHRpb25zID09PSB2b2lkIDApIHtcbiAgICAgIG9wdGlvbnMgPSB7fTtcbiAgICB9XG5cbiAgICB2YXIgY2hpbGRTZXJ2aWNlID0gbmV3IEludGVycHJldGVyKG1hY2hpbmUsIF9fYXNzaWduKF9fYXNzaWduKHt9LCB0aGlzLm9wdGlvbnMpLCB7XG4gICAgICBwYXJlbnQ6IHRoaXMsXG4gICAgICBpZDogb3B0aW9ucy5pZCB8fCBtYWNoaW5lLmlkXG4gICAgfSkpO1xuXG4gICAgdmFyIHJlc29sdmVkT3B0aW9ucyA9IF9fYXNzaWduKF9fYXNzaWduKHt9LCBERUZBVUxUX1NQQVdOX09QVElPTlMpLCBvcHRpb25zKTtcblxuICAgIGlmIChyZXNvbHZlZE9wdGlvbnMuc3luYykge1xuICAgICAgY2hpbGRTZXJ2aWNlLm9uVHJhbnNpdGlvbihmdW5jdGlvbiAoc3RhdGUpIHtcbiAgICAgICAgX3RoaXMuc2VuZCh1cGRhdGUsIHtcbiAgICAgICAgICBzdGF0ZTogc3RhdGUsXG4gICAgICAgICAgaWQ6IGNoaWxkU2VydmljZS5pZFxuICAgICAgICB9KTtcbiAgICAgIH0pO1xuICAgIH1cblxuICAgIHZhciBhY3RvciA9IGNoaWxkU2VydmljZTtcbiAgICB0aGlzLmNoaWxkcmVuLnNldChjaGlsZFNlcnZpY2UuaWQsIGFjdG9yKTtcblxuICAgIGlmIChyZXNvbHZlZE9wdGlvbnMuYXV0b0ZvcndhcmQpIHtcbiAgICAgIHRoaXMuZm9yd2FyZFRvLmFkZChjaGlsZFNlcnZpY2UuaWQpO1xuICAgIH1cblxuICAgIGNoaWxkU2VydmljZS5vbkRvbmUoZnVuY3Rpb24gKGRvbmVFdmVudCkge1xuICAgICAgX3RoaXMucmVtb3ZlQ2hpbGQoY2hpbGRTZXJ2aWNlLmlkKTtcblxuICAgICAgX3RoaXMuc2VuZCh0b1NDWE1MRXZlbnQoZG9uZUV2ZW50LCB7XG4gICAgICAgIG9yaWdpbjogY2hpbGRTZXJ2aWNlLmlkXG4gICAgICB9KSk7XG4gICAgfSkuc3RhcnQoKTtcbiAgICByZXR1cm4gYWN0b3I7XG4gIH07XG5cbiAgSW50ZXJwcmV0ZXIucHJvdG90eXBlLnNwYXduUHJvbWlzZSA9IGZ1bmN0aW9uIChwcm9taXNlLCBpZCkge1xuICAgIHZhciBfdGhpcyA9IHRoaXM7XG5cbiAgICB2YXIgY2FuY2VsZWQgPSBmYWxzZTtcbiAgICBwcm9taXNlLnRoZW4oZnVuY3Rpb24gKHJlc3BvbnNlKSB7XG4gICAgICBpZiAoIWNhbmNlbGVkKSB7XG4gICAgICAgIF90aGlzLnJlbW92ZUNoaWxkKGlkKTtcblxuICAgICAgICBfdGhpcy5zZW5kKHRvU0NYTUxFdmVudChkb25lSW52b2tlKGlkLCByZXNwb25zZSksIHtcbiAgICAgICAgICBvcmlnaW46IGlkXG4gICAgICAgIH0pKTtcbiAgICAgIH1cbiAgICB9LCBmdW5jdGlvbiAoZXJyb3JEYXRhKSB7XG4gICAgICBpZiAoIWNhbmNlbGVkKSB7XG4gICAgICAgIF90aGlzLnJlbW92ZUNoaWxkKGlkKTtcblxuICAgICAgICB2YXIgZXJyb3JFdmVudCA9IGVycm9yKGlkLCBlcnJvckRhdGEpO1xuXG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgLy8gU2VuZCBcImVycm9yLnBsYXRmb3JtLmlkXCIgdG8gdGhpcyAocGFyZW50KS5cbiAgICAgICAgICBfdGhpcy5zZW5kKHRvU0NYTUxFdmVudChlcnJvckV2ZW50LCB7XG4gICAgICAgICAgICBvcmlnaW46IGlkXG4gICAgICAgICAgfSkpO1xuICAgICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICAgIHJlcG9ydFVuaGFuZGxlZEV4Y2VwdGlvbk9uSW52b2NhdGlvbihlcnJvckRhdGEsIGVycm9yLCBpZCk7XG5cbiAgICAgICAgICBpZiAoX3RoaXMuZGV2VG9vbHMpIHtcbiAgICAgICAgICAgIF90aGlzLmRldlRvb2xzLnNlbmQoZXJyb3JFdmVudCwgX3RoaXMuc3RhdGUpO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIGlmIChfdGhpcy5tYWNoaW5lLnN0cmljdCkge1xuICAgICAgICAgICAgLy8gaXQgd291bGQgYmUgYmV0dGVyIHRvIGFsd2F5cyBzdG9wIHRoZSBzdGF0ZSBtYWNoaW5lIGlmIHVuaGFuZGxlZFxuICAgICAgICAgICAgLy8gZXhjZXB0aW9uL3Byb21pc2UgcmVqZWN0aW9uIGhhcHBlbnMgYnV0IGJlY2F1c2Ugd2UgZG9uJ3Qgd2FudCB0b1xuICAgICAgICAgICAgLy8gYnJlYWsgZXhpc3RpbmcgY29kZSBzbyBlbmZvcmNlIGl0IG9uIHN0cmljdCBtb2RlIG9ubHkgZXNwZWNpYWxseSBzb1xuICAgICAgICAgICAgLy8gYmVjYXVzZSBkb2N1bWVudGF0aW9uIHNheXMgdGhhdCBvbkVycm9yIGlzIG9wdGlvbmFsXG4gICAgICAgICAgICBfdGhpcy5zdG9wKCk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfSk7XG4gICAgdmFyIGFjdG9yID0ge1xuICAgICAgaWQ6IGlkLFxuICAgICAgc2VuZDogZnVuY3Rpb24gKCkge1xuICAgICAgICByZXR1cm4gdm9pZCAwO1xuICAgICAgfSxcbiAgICAgIHN1YnNjcmliZTogZnVuY3Rpb24gKG5leHQsIGhhbmRsZUVycm9yLCBjb21wbGV0ZSkge1xuICAgICAgICB2YXIgb2JzZXJ2ZXIgPSB0b09ic2VydmVyKG5leHQsIGhhbmRsZUVycm9yLCBjb21wbGV0ZSk7XG4gICAgICAgIHZhciB1bnN1YnNjcmliZWQgPSBmYWxzZTtcbiAgICAgICAgcHJvbWlzZS50aGVuKGZ1bmN0aW9uIChyZXNwb25zZSkge1xuICAgICAgICAgIGlmICh1bnN1YnNjcmliZWQpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBvYnNlcnZlci5uZXh0KHJlc3BvbnNlKTtcblxuICAgICAgICAgIGlmICh1bnN1YnNjcmliZWQpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBvYnNlcnZlci5jb21wbGV0ZSgpO1xuICAgICAgICB9LCBmdW5jdGlvbiAoZXJyKSB7XG4gICAgICAgICAgaWYgKHVuc3Vic2NyaWJlZCkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIG9ic2VydmVyLmVycm9yKGVycik7XG4gICAgICAgIH0pO1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgIHVuc3Vic2NyaWJlOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICByZXR1cm4gdW5zdWJzY3JpYmVkID0gdHJ1ZTtcbiAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgICB9LFxuICAgICAgc3RvcDogZnVuY3Rpb24gKCkge1xuICAgICAgICBjYW5jZWxlZCA9IHRydWU7XG4gICAgICB9LFxuICAgICAgdG9KU09OOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgaWQ6IGlkXG4gICAgICAgIH07XG4gICAgICB9XG4gICAgfTtcbiAgICB0aGlzLmNoaWxkcmVuLnNldChpZCwgYWN0b3IpO1xuICAgIHJldHVybiBhY3RvcjtcbiAgfTtcblxuICBJbnRlcnByZXRlci5wcm90b3R5cGUuc3Bhd25DYWxsYmFjayA9IGZ1bmN0aW9uIChjYWxsYmFjaywgaWQpIHtcbiAgICB2YXIgX3RoaXMgPSB0aGlzO1xuXG4gICAgdmFyIGNhbmNlbGVkID0gZmFsc2U7XG4gICAgdmFyIHJlY2VpdmVycyA9IG5ldyBTZXQoKTtcbiAgICB2YXIgbGlzdGVuZXJzID0gbmV3IFNldCgpO1xuXG4gICAgdmFyIHJlY2VpdmUgPSBmdW5jdGlvbiAoZSkge1xuICAgICAgbGlzdGVuZXJzLmZvckVhY2goZnVuY3Rpb24gKGxpc3RlbmVyKSB7XG4gICAgICAgIHJldHVybiBsaXN0ZW5lcihlKTtcbiAgICAgIH0pO1xuXG4gICAgICBpZiAoY2FuY2VsZWQpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICBfdGhpcy5zZW5kKHRvU0NYTUxFdmVudChlLCB7XG4gICAgICAgIG9yaWdpbjogaWRcbiAgICAgIH0pKTtcbiAgICB9O1xuXG4gICAgdmFyIGNhbGxiYWNrU3RvcDtcblxuICAgIHRyeSB7XG4gICAgICBjYWxsYmFja1N0b3AgPSBjYWxsYmFjayhyZWNlaXZlLCBmdW5jdGlvbiAobmV3TGlzdGVuZXIpIHtcbiAgICAgICAgcmVjZWl2ZXJzLmFkZChuZXdMaXN0ZW5lcik7XG4gICAgICB9KTtcbiAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgIHRoaXMuc2VuZChlcnJvcihpZCwgZXJyKSk7XG4gICAgfVxuXG4gICAgaWYgKGlzUHJvbWlzZUxpa2UoY2FsbGJhY2tTdG9wKSkge1xuICAgICAgLy8gaXQgdHVybmVkIG91dCB0byBiZSBhbiBhc3luYyBmdW5jdGlvbiwgY2FuJ3QgcmVsaWFibHkgY2hlY2sgdGhpcyBiZWZvcmUgY2FsbGluZyBgY2FsbGJhY2tgXG4gICAgICAvLyBiZWNhdXNlIHRyYW5zcGlsZWQgYXN5bmMgZnVuY3Rpb25zIGFyZSBub3QgcmVjb2duaXphYmxlXG4gICAgICByZXR1cm4gdGhpcy5zcGF3blByb21pc2UoY2FsbGJhY2tTdG9wLCBpZCk7XG4gICAgfVxuXG4gICAgdmFyIGFjdG9yID0ge1xuICAgICAgaWQ6IGlkLFxuICAgICAgc2VuZDogZnVuY3Rpb24gKGV2ZW50KSB7XG4gICAgICAgIHJldHVybiByZWNlaXZlcnMuZm9yRWFjaChmdW5jdGlvbiAocmVjZWl2ZXIpIHtcbiAgICAgICAgICByZXR1cm4gcmVjZWl2ZXIoZXZlbnQpO1xuICAgICAgICB9KTtcbiAgICAgIH0sXG4gICAgICBzdWJzY3JpYmU6IGZ1bmN0aW9uIChuZXh0KSB7XG4gICAgICAgIGxpc3RlbmVycy5hZGQobmV4dCk7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgdW5zdWJzY3JpYmU6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIGxpc3RlbmVycy5kZWxldGUobmV4dCk7XG4gICAgICAgICAgfVxuICAgICAgICB9O1xuICAgICAgfSxcbiAgICAgIHN0b3A6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgY2FuY2VsZWQgPSB0cnVlO1xuXG4gICAgICAgIGlmIChpc0Z1bmN0aW9uKGNhbGxiYWNrU3RvcCkpIHtcbiAgICAgICAgICBjYWxsYmFja1N0b3AoKTtcbiAgICAgICAgfVxuICAgICAgfSxcbiAgICAgIHRvSlNPTjogZnVuY3Rpb24gKCkge1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgIGlkOiBpZFxuICAgICAgICB9O1xuICAgICAgfVxuICAgIH07XG4gICAgdGhpcy5jaGlsZHJlbi5zZXQoaWQsIGFjdG9yKTtcbiAgICByZXR1cm4gYWN0b3I7XG4gIH07XG5cbiAgSW50ZXJwcmV0ZXIucHJvdG90eXBlLnNwYXduT2JzZXJ2YWJsZSA9IGZ1bmN0aW9uIChzb3VyY2UsIGlkKSB7XG4gICAgdmFyIF90aGlzID0gdGhpcztcblxuICAgIHZhciBzdWJzY3JpcHRpb24gPSBzb3VyY2Uuc3Vic2NyaWJlKGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgICAgX3RoaXMuc2VuZCh0b1NDWE1MRXZlbnQodmFsdWUsIHtcbiAgICAgICAgb3JpZ2luOiBpZFxuICAgICAgfSkpO1xuICAgIH0sIGZ1bmN0aW9uIChlcnIpIHtcbiAgICAgIF90aGlzLnJlbW92ZUNoaWxkKGlkKTtcblxuICAgICAgX3RoaXMuc2VuZCh0b1NDWE1MRXZlbnQoZXJyb3IoaWQsIGVyciksIHtcbiAgICAgICAgb3JpZ2luOiBpZFxuICAgICAgfSkpO1xuICAgIH0sIGZ1bmN0aW9uICgpIHtcbiAgICAgIF90aGlzLnJlbW92ZUNoaWxkKGlkKTtcblxuICAgICAgX3RoaXMuc2VuZCh0b1NDWE1MRXZlbnQoZG9uZUludm9rZShpZCksIHtcbiAgICAgICAgb3JpZ2luOiBpZFxuICAgICAgfSkpO1xuICAgIH0pO1xuICAgIHZhciBhY3RvciA9IHtcbiAgICAgIGlkOiBpZCxcbiAgICAgIHNlbmQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmV0dXJuIHZvaWQgMDtcbiAgICAgIH0sXG4gICAgICBzdWJzY3JpYmU6IGZ1bmN0aW9uIChuZXh0LCBoYW5kbGVFcnJvciwgY29tcGxldGUpIHtcbiAgICAgICAgcmV0dXJuIHNvdXJjZS5zdWJzY3JpYmUobmV4dCwgaGFuZGxlRXJyb3IsIGNvbXBsZXRlKTtcbiAgICAgIH0sXG4gICAgICBzdG9wOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJldHVybiBzdWJzY3JpcHRpb24udW5zdWJzY3JpYmUoKTtcbiAgICAgIH0sXG4gICAgICB0b0pTT046IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICBpZDogaWRcbiAgICAgICAgfTtcbiAgICAgIH1cbiAgICB9O1xuICAgIHRoaXMuY2hpbGRyZW4uc2V0KGlkLCBhY3Rvcik7XG4gICAgcmV0dXJuIGFjdG9yO1xuICB9O1xuXG4gIEludGVycHJldGVyLnByb3RvdHlwZS5zcGF3bkFjdG9yID0gZnVuY3Rpb24gKGFjdG9yKSB7XG4gICAgdGhpcy5jaGlsZHJlbi5zZXQoYWN0b3IuaWQsIGFjdG9yKTtcbiAgICByZXR1cm4gYWN0b3I7XG4gIH07XG5cbiAgSW50ZXJwcmV0ZXIucHJvdG90eXBlLnNwYXduQWN0aXZpdHkgPSBmdW5jdGlvbiAoYWN0aXZpdHkpIHtcbiAgICB2YXIgaW1wbGVtZW50YXRpb24gPSB0aGlzLm1hY2hpbmUub3B0aW9ucyAmJiB0aGlzLm1hY2hpbmUub3B0aW9ucy5hY3Rpdml0aWVzID8gdGhpcy5tYWNoaW5lLm9wdGlvbnMuYWN0aXZpdGllc1thY3Rpdml0eS50eXBlXSA6IHVuZGVmaW5lZDtcblxuICAgIGlmICghaW1wbGVtZW50YXRpb24pIHtcbiAgICAgIGlmICghSVNfUFJPRFVDVElPTikge1xuICAgICAgICB3YXJuKGZhbHNlLCBcIk5vIGltcGxlbWVudGF0aW9uIGZvdW5kIGZvciBhY3Rpdml0eSAnXCIgKyBhY3Rpdml0eS50eXBlICsgXCInXCIpO1xuICAgICAgfSAvLyB0c2xpbnQ6ZGlzYWJsZS1uZXh0LWxpbmU6bm8tY29uc29sZVxuXG5cbiAgICAgIHJldHVybjtcbiAgICB9IC8vIFN0YXJ0IGltcGxlbWVudGF0aW9uXG5cblxuICAgIHZhciBkaXNwb3NlID0gaW1wbGVtZW50YXRpb24odGhpcy5zdGF0ZS5jb250ZXh0LCBhY3Rpdml0eSk7XG4gICAgdGhpcy5zcGF3bkVmZmVjdChhY3Rpdml0eS5pZCwgZGlzcG9zZSk7XG4gIH07XG5cbiAgSW50ZXJwcmV0ZXIucHJvdG90eXBlLnNwYXduRWZmZWN0ID0gZnVuY3Rpb24gKGlkLCBkaXNwb3NlKSB7XG4gICAgdGhpcy5jaGlsZHJlbi5zZXQoaWQsIHtcbiAgICAgIGlkOiBpZCxcbiAgICAgIHNlbmQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmV0dXJuIHZvaWQgMDtcbiAgICAgIH0sXG4gICAgICBzdWJzY3JpYmU6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICB1bnN1YnNjcmliZTogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgcmV0dXJuIHZvaWQgMDtcbiAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgICB9LFxuICAgICAgc3RvcDogZGlzcG9zZSB8fCB1bmRlZmluZWQsXG4gICAgICB0b0pTT046IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICBpZDogaWRcbiAgICAgICAgfTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfTtcblxuICBJbnRlcnByZXRlci5wcm90b3R5cGUuYXR0YWNoRGV2ID0gZnVuY3Rpb24gKCkge1xuICAgIHZhciBnbG9iYWwgPSBnZXRHbG9iYWwoKTtcblxuICAgIGlmICh0aGlzLm9wdGlvbnMuZGV2VG9vbHMgJiYgZ2xvYmFsKSB7XG4gICAgICBpZiAoZ2xvYmFsLl9fUkVEVVhfREVWVE9PTFNfRVhURU5TSU9OX18pIHtcbiAgICAgICAgdmFyIGRldlRvb2xzT3B0aW9ucyA9IHR5cGVvZiB0aGlzLm9wdGlvbnMuZGV2VG9vbHMgPT09ICdvYmplY3QnID8gdGhpcy5vcHRpb25zLmRldlRvb2xzIDogdW5kZWZpbmVkO1xuICAgICAgICB0aGlzLmRldlRvb2xzID0gZ2xvYmFsLl9fUkVEVVhfREVWVE9PTFNfRVhURU5TSU9OX18uY29ubmVjdChfX2Fzc2lnbihfX2Fzc2lnbih7XG4gICAgICAgICAgbmFtZTogdGhpcy5pZCxcbiAgICAgICAgICBhdXRvUGF1c2U6IHRydWUsXG4gICAgICAgICAgc3RhdGVTYW5pdGl6ZXI6IGZ1bmN0aW9uIChzdGF0ZSkge1xuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgdmFsdWU6IHN0YXRlLnZhbHVlLFxuICAgICAgICAgICAgICBjb250ZXh0OiBzdGF0ZS5jb250ZXh0LFxuICAgICAgICAgICAgICBhY3Rpb25zOiBzdGF0ZS5hY3Rpb25zXG4gICAgICAgICAgICB9O1xuICAgICAgICAgIH1cbiAgICAgICAgfSwgZGV2VG9vbHNPcHRpb25zKSwge1xuICAgICAgICAgIGZlYXR1cmVzOiBfX2Fzc2lnbih7XG4gICAgICAgICAgICBqdW1wOiBmYWxzZSxcbiAgICAgICAgICAgIHNraXA6IGZhbHNlXG4gICAgICAgICAgfSwgZGV2VG9vbHNPcHRpb25zID8gZGV2VG9vbHNPcHRpb25zLmZlYXR1cmVzIDogdW5kZWZpbmVkKVxuICAgICAgICB9KSwgdGhpcy5tYWNoaW5lKTtcbiAgICAgICAgdGhpcy5kZXZUb29scy5pbml0KHRoaXMuc3RhdGUpO1xuICAgICAgfSAvLyBhZGQgWFN0YXRlLXNwZWNpZmljIGRldiB0b29saW5nIGhvb2tcblxuXG4gICAgICByZWdpc3RlclNlcnZpY2UodGhpcyk7XG4gICAgfVxuICB9O1xuXG4gIEludGVycHJldGVyLnByb3RvdHlwZS50b0pTT04gPSBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIGlkOiB0aGlzLmlkXG4gICAgfTtcbiAgfTtcblxuICBJbnRlcnByZXRlci5wcm90b3R5cGVbc3ltYm9sT2JzZXJ2YWJsZV0gPSBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH07XG4gIC8qKlxyXG4gICAqIFRoZSBkZWZhdWx0IGludGVycHJldGVyIG9wdGlvbnM6XHJcbiAgICpcclxuICAgKiAtIGBjbG9ja2AgdXNlcyB0aGUgZ2xvYmFsIGBzZXRUaW1lb3V0YCBhbmQgYGNsZWFyVGltZW91dGAgZnVuY3Rpb25zXHJcbiAgICogLSBgbG9nZ2VyYCB1c2VzIHRoZSBnbG9iYWwgYGNvbnNvbGUubG9nKClgIG1ldGhvZFxyXG4gICAqL1xuXG5cbiAgSW50ZXJwcmV0ZXIuZGVmYXVsdE9wdGlvbnMgPSAvKiNfX1BVUkVfXyovZnVuY3Rpb24gKGdsb2JhbCkge1xuICAgIHJldHVybiB7XG4gICAgICBleGVjdXRlOiB0cnVlLFxuICAgICAgZGVmZXJFdmVudHM6IHRydWUsXG4gICAgICBjbG9jazoge1xuICAgICAgICBzZXRUaW1lb3V0OiBmdW5jdGlvbiAoZm4sIG1zKSB7XG4gICAgICAgICAgcmV0dXJuIHNldFRpbWVvdXQoZm4sIG1zKTtcbiAgICAgICAgfSxcbiAgICAgICAgY2xlYXJUaW1lb3V0OiBmdW5jdGlvbiAoaWQpIHtcbiAgICAgICAgICByZXR1cm4gY2xlYXJUaW1lb3V0KGlkKTtcbiAgICAgICAgfVxuICAgICAgfSxcbiAgICAgIGxvZ2dlcjogZ2xvYmFsLmNvbnNvbGUubG9nLmJpbmQoY29uc29sZSksXG4gICAgICBkZXZUb29sczogZmFsc2VcbiAgICB9O1xuICB9KHR5cGVvZiBzZWxmICE9PSAndW5kZWZpbmVkJyA/IHNlbGYgOiBnbG9iYWwpO1xuXG4gIEludGVycHJldGVyLmludGVycHJldCA9IGludGVycHJldDtcbiAgcmV0dXJuIEludGVycHJldGVyO1xufSgpO1xuXG52YXIgcmVzb2x2ZVNwYXduT3B0aW9ucyA9IGZ1bmN0aW9uIChuYW1lT3JPcHRpb25zKSB7XG4gIGlmIChpc1N0cmluZyhuYW1lT3JPcHRpb25zKSkge1xuICAgIHJldHVybiBfX2Fzc2lnbihfX2Fzc2lnbih7fSwgREVGQVVMVF9TUEFXTl9PUFRJT05TKSwge1xuICAgICAgbmFtZTogbmFtZU9yT3B0aW9uc1xuICAgIH0pO1xuICB9XG5cbiAgcmV0dXJuIF9fYXNzaWduKF9fYXNzaWduKF9fYXNzaWduKHt9LCBERUZBVUxUX1NQQVdOX09QVElPTlMpLCB7XG4gICAgbmFtZTogdW5pcXVlSWQoKVxuICB9KSwgbmFtZU9yT3B0aW9ucyk7XG59O1xuXG5mdW5jdGlvbiBzcGF3bihlbnRpdHksIG5hbWVPck9wdGlvbnMpIHtcbiAgdmFyIHJlc29sdmVkT3B0aW9ucyA9IHJlc29sdmVTcGF3bk9wdGlvbnMobmFtZU9yT3B0aW9ucyk7XG4gIHJldHVybiBjb25zdW1lKGZ1bmN0aW9uIChzZXJ2aWNlKSB7XG4gICAgaWYgKCFJU19QUk9EVUNUSU9OKSB7XG4gICAgICB2YXIgaXNMYXp5RW50aXR5ID0gaXNNYWNoaW5lKGVudGl0eSkgfHwgaXNGdW5jdGlvbihlbnRpdHkpO1xuICAgICAgd2FybighIXNlcnZpY2UgfHwgaXNMYXp5RW50aXR5LCBcIkF0dGVtcHRlZCB0byBzcGF3biBhbiBBY3RvciAoSUQ6IFxcXCJcIiArIChpc01hY2hpbmUoZW50aXR5KSA/IGVudGl0eS5pZCA6ICd1bmRlZmluZWQnKSArIFwiXFxcIikgb3V0c2lkZSBvZiBhIHNlcnZpY2UuIFRoaXMgd2lsbCBoYXZlIG5vIGVmZmVjdC5cIik7XG4gICAgfVxuXG4gICAgaWYgKHNlcnZpY2UpIHtcbiAgICAgIHJldHVybiBzZXJ2aWNlLnNwYXduKGVudGl0eSwgcmVzb2x2ZWRPcHRpb25zLm5hbWUsIHJlc29sdmVkT3B0aW9ucyk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBjcmVhdGVEZWZlcnJlZEFjdG9yKGVudGl0eSwgcmVzb2x2ZWRPcHRpb25zLm5hbWUpO1xuICAgIH1cbiAgfSk7XG59XG4vKipcclxuICogQ3JlYXRlcyBhIG5ldyBJbnRlcnByZXRlciBpbnN0YW5jZSBmb3IgdGhlIGdpdmVuIG1hY2hpbmUgd2l0aCB0aGUgcHJvdmlkZWQgb3B0aW9ucywgaWYgYW55LlxyXG4gKlxyXG4gKiBAcGFyYW0gbWFjaGluZSBUaGUgbWFjaGluZSB0byBpbnRlcnByZXRcclxuICogQHBhcmFtIG9wdGlvbnMgSW50ZXJwcmV0ZXIgb3B0aW9uc1xyXG4gKi9cblxuXG5mdW5jdGlvbiBpbnRlcnByZXQobWFjaGluZSwgb3B0aW9ucykge1xuICB2YXIgaW50ZXJwcmV0ZXIgPSBuZXcgSW50ZXJwcmV0ZXIobWFjaGluZSwgb3B0aW9ucyk7XG4gIHJldHVybiBpbnRlcnByZXRlcjtcbn1cblxuZXhwb3J0IHsgSW50ZXJwcmV0ZXIsIEludGVycHJldGVyU3RhdHVzLCBpbnRlcnByZXQsIHNwYXduIH07IiwiaW1wb3J0IHsgX192YWx1ZXMsIF9fcmVhZCB9IGZyb20gJy4vX3ZpcnR1YWwvX3RzbGliLmpzJztcbmltcG9ydCB7IFN0YXRlIH0gZnJvbSAnLi9TdGF0ZS5qcyc7XG5cbmZ1bmN0aW9uIG1hdGNoU3RhdGUoc3RhdGUsIHBhdHRlcm5zLCBkZWZhdWx0VmFsdWUpIHtcbiAgdmFyIGVfMSwgX2E7XG5cbiAgdmFyIHJlc29sdmVkU3RhdGUgPSBTdGF0ZS5mcm9tKHN0YXRlLCBzdGF0ZSBpbnN0YW5jZW9mIFN0YXRlID8gc3RhdGUuY29udGV4dCA6IHVuZGVmaW5lZCk7XG5cbiAgdHJ5IHtcbiAgICBmb3IgKHZhciBwYXR0ZXJuc18xID0gX192YWx1ZXMocGF0dGVybnMpLCBwYXR0ZXJuc18xXzEgPSBwYXR0ZXJuc18xLm5leHQoKTsgIXBhdHRlcm5zXzFfMS5kb25lOyBwYXR0ZXJuc18xXzEgPSBwYXR0ZXJuc18xLm5leHQoKSkge1xuICAgICAgdmFyIF9iID0gX19yZWFkKHBhdHRlcm5zXzFfMS52YWx1ZSwgMiksXG4gICAgICAgICAgc3RhdGVWYWx1ZSA9IF9iWzBdLFxuICAgICAgICAgIGdldFZhbHVlID0gX2JbMV07XG5cbiAgICAgIGlmIChyZXNvbHZlZFN0YXRlLm1hdGNoZXMoc3RhdGVWYWx1ZSkpIHtcbiAgICAgICAgcmV0dXJuIGdldFZhbHVlKHJlc29sdmVkU3RhdGUpO1xuICAgICAgfVxuICAgIH1cbiAgfSBjYXRjaCAoZV8xXzEpIHtcbiAgICBlXzEgPSB7XG4gICAgICBlcnJvcjogZV8xXzFcbiAgICB9O1xuICB9IGZpbmFsbHkge1xuICAgIHRyeSB7XG4gICAgICBpZiAocGF0dGVybnNfMV8xICYmICFwYXR0ZXJuc18xXzEuZG9uZSAmJiAoX2EgPSBwYXR0ZXJuc18xLnJldHVybikpIF9hLmNhbGwocGF0dGVybnNfMSk7XG4gICAgfSBmaW5hbGx5IHtcbiAgICAgIGlmIChlXzEpIHRocm93IGVfMS5lcnJvcjtcbiAgICB9XG4gIH1cblxuICByZXR1cm4gZGVmYXVsdFZhbHVlKHJlc29sdmVkU3RhdGUpO1xufVxuXG5leHBvcnQgeyBtYXRjaFN0YXRlIH07IiwiZXhwb3J0IHsgbWF0Y2hlc1N0YXRlIH0gZnJvbSAnLi91dGlscy5qcyc7XG5leHBvcnQgeyBtYXBTdGF0ZSB9IGZyb20gJy4vbWFwU3RhdGUuanMnO1xuZXhwb3J0IHsgQWN0aW9uVHlwZXMsIFNwZWNpYWxUYXJnZXRzIH0gZnJvbSAnLi90eXBlcy5qcyc7XG5pbXBvcnQgeyByYWlzZSwgc2VuZCwgc2VuZFBhcmVudCwgc2VuZFVwZGF0ZSwgbG9nLCBjYW5jZWwsIHN0YXJ0LCBzdG9wLCBhc3NpZ24sIGFmdGVyLCBkb25lLCByZXNwb25kLCBmb3J3YXJkVG8sIGVzY2FsYXRlLCBjaG9vc2UsIHB1cmUgfSBmcm9tICcuL2FjdGlvbnMuanMnO1xuZXhwb3J0IHsgYXNzaWduLCBkb25lSW52b2tlLCBmb3J3YXJkVG8sIHNlbmQsIHNlbmRQYXJlbnQsIHNlbmRVcGRhdGUgfSBmcm9tICcuL2FjdGlvbnMuanMnO1xuZXhwb3J0IHsgU3RhdGUgfSBmcm9tICcuL1N0YXRlLmpzJztcbmV4cG9ydCB7IFN0YXRlTm9kZSB9IGZyb20gJy4vU3RhdGVOb2RlLmpzJztcbmV4cG9ydCB7IE1hY2hpbmUsIGNyZWF0ZU1hY2hpbmUgfSBmcm9tICcuL01hY2hpbmUuanMnO1xuZXhwb3J0IHsgSW50ZXJwcmV0ZXIsIEludGVycHJldGVyU3RhdHVzLCBpbnRlcnByZXQsIHNwYXduIH0gZnJvbSAnLi9pbnRlcnByZXRlci5qcyc7XG5leHBvcnQgeyBtYXRjaFN0YXRlIH0gZnJvbSAnLi9tYXRjaC5qcyc7XG52YXIgYWN0aW9ucyA9IHtcbiAgcmFpc2U6IHJhaXNlLFxuICBzZW5kOiBzZW5kLFxuICBzZW5kUGFyZW50OiBzZW5kUGFyZW50LFxuICBzZW5kVXBkYXRlOiBzZW5kVXBkYXRlLFxuICBsb2c6IGxvZyxcbiAgY2FuY2VsOiBjYW5jZWwsXG4gIHN0YXJ0OiBzdGFydCxcbiAgc3RvcDogc3RvcCxcbiAgYXNzaWduOiBhc3NpZ24sXG4gIGFmdGVyOiBhZnRlcixcbiAgZG9uZTogZG9uZSxcbiAgcmVzcG9uZDogcmVzcG9uZCxcbiAgZm9yd2FyZFRvOiBmb3J3YXJkVG8sXG4gIGVzY2FsYXRlOiBlc2NhbGF0ZSxcbiAgY2hvb3NlOiBjaG9vc2UsXG4gIHB1cmU6IHB1cmVcbn07XG5leHBvcnQgeyBhY3Rpb25zIH07Il0sIm5hbWVzIjpbInJhaXNlIiwic2VuZCIsInJhaXNlJDEiLCJzZW5kJDEiLCJsb2ciLCJsb2ckMSIsImNhbmNlbCIsImNhbmNlbCQxIiwic3RhcnQiLCJzdG9wIiwiYXNzaWduIiwiYXNzaWduJDEiLCJlcnJvciIsInB1cmUiLCJlcnJvciQxIiwiY2hvb3NlIiwiY2hvb3NlJDEiLCJwdXJlJDEiLCJzdG9wJDEiLCJpc0FjdG9yIiwidG9JbnZva2VTb3VyY2UiLCJzdGFydCQxIl0sIm1hcHBpbmdzIjoiQUFBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsSUFBSSxRQUFRLEdBQUcsWUFBWTtBQUMzQixFQUFFLFFBQVEsR0FBRyxNQUFNLENBQUMsTUFBTSxJQUFJLFNBQVMsUUFBUSxDQUFDLENBQUMsRUFBRTtBQUNuRCxJQUFJLEtBQUssSUFBSSxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsU0FBUyxDQUFDLE1BQU0sRUFBRSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFO0FBQ3pELE1BQU0sQ0FBQyxHQUFHLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUN2QjtBQUNBLE1BQU0sS0FBSyxJQUFJLENBQUMsSUFBSSxDQUFDLEVBQUUsSUFBSSxNQUFNLENBQUMsU0FBUyxDQUFDLGNBQWMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDbkYsS0FBSztBQUNMO0FBQ0EsSUFBSSxPQUFPLENBQUMsQ0FBQztBQUNiLEdBQUcsQ0FBQztBQUNKO0FBQ0EsRUFBRSxPQUFPLFFBQVEsQ0FBQyxLQUFLLENBQUMsSUFBSSxFQUFFLFNBQVMsQ0FBQyxDQUFDO0FBQ3pDLENBQUMsQ0FBQztBQUNGO0FBQ0EsU0FBUyxNQUFNLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRTtBQUN0QixFQUFFLElBQUksQ0FBQyxHQUFHLEVBQUUsQ0FBQztBQUNiO0FBQ0EsRUFBRSxLQUFLLElBQUksQ0FBQyxJQUFJLENBQUMsRUFBRSxJQUFJLE1BQU0sQ0FBQyxTQUFTLENBQUMsY0FBYyxDQUFDLElBQUksQ0FB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QUNKO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxFQUFFLFNBQVMsQ0FBQyxTQUFTLENBQUMsVUFBVSxHQUFHLFVBQVUsT0FBTyxFQUFFLE9BQU8sRUFBRTtBQUMvRCxJQUFJLElBQUksT0FBTyxLQUFLLEtBQUssQ0FBQyxFQUFFO0FBQzVCLE1BQU0sT0FBTyxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUM7QUFDN0IsS0FBSztBQUNMO0FBQ0EsSUFBSSxJQUFJLEVBQUUsR0FBRyxJQUFJLENBQUMsT0FBTztBQUN6QixRQUFRLE9BQU8sR0FBRyxFQUFFLENBQUMsT0FBTztBQUM1QixRQUFRLFVBQVUsR0FBRyxFQUFFLENBQUMsVUFBVTtBQUNsQyxRQUFRLE1BQU0sR0FBRyxFQUFFLENBQUMsTUFBTTtBQUMxQixRQUFRLFFBQVEsR0FBRyxFQUFFLENBQUMsUUFBUTtBQUM5QixRQUFRLE1BQU0sR0FBRyxFQUFFLENBQUMsTUFBTSxDQUFDO0FBQzNCLElBQUksT0FBTyxJQUFJLFNBQVMsQ0FBQyxJQUFJLENBQUMsTUFBTSxFQUFFO0FBQ3RDLE1BQU0sT0FBTyxFQUFFLFFBQVEsQ0FBQyxRQUFRLENBQUMsRUFBRSxFQUFFLE9BQU8sQ0FBQyxFQUFFLE9BQU8sQ0FBQyxPQUFPLENBQUM7QUFDL0QsTUFBTSxVQUFVLEVBQUUsUUFBUSxDQUFDLFFBQVEsQ0FBQyxFQUFFLEVBQUUsVUFBVSxDQUFDLEVBQUUsT0FBTyxDQUFDLFVBQVUsQ0FBQztBQUN4RSxNQUFNLE1BQU0sRUFBRSxRQUFRLENBQUMsUUFBUSxDQUFDLEVBQUUsRUFBRSxNQUFNLENBQUMsRUFBRSxPQUFPLENBQUMsTUFBTSxDQUFDO0FBQzVELE1BQU0sUUFBUSxFQUFFLFFBQVEsQ0FBQyxRQUFRLENBQUMsRUFBRSxFQUFFLFFBQVEsQ0FBQyxFQUFFLE9BQU8sQ0FBQyxRQUFRLENBQUM7QUFDbEUsTUFBTSxNQUFNLEVBQUUsUUFBUSxDQUFDLFFBQVEsQ0FBQyxFQUFFLEVBQUUsTUFBTSxDQUFDLEVBQUUsT0FBTyxDQUFDLE1B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
