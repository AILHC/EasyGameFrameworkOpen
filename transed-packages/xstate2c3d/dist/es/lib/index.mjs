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
  after: after$1,
  done: done,
  respond: respond,
  forwardTo: forwardTo,
  escalate: escalate,
  choose: choose$1,
  pure: pure$1
};

export { ActionTypes, Interpreter, InterpreterStatus, Machine, SpecialTargets, State, StateNode, actions, assign$1 as assign, createMachine, doneInvoke, forwardTo, interpret, mapState, matchState, matchesState, send$1 as send, sendParent, sendUpdate, spawn };

    
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXgubWpzIiwic291cmNlcyI6WyJFOi9mcmFtZXdvcmtfc3BhY2UvRWFzeUdhbWVGcmFtZXdvcmtPcGVuL25vZGVfbW9kdWxlcy94c3RhdGUvZXMvX3ZpcnR1YWwvX3RzbGliLmpzIiwiRTovZnJhbWV3b3JrX3NwYWNlL0Vhc3lHYW1lRnJhbWV3b3JrT3Blbi9ub2RlX21vZHVsZXMveHN0YXRlL2VzL2NvbnN0YW50cy5qcyIsIkU6L2ZyYW1ld29ya19zcGFjZS9FYXN5R2FtZUZyYW1ld29ya09wZW4vbm9kZV9tb2R1bGVzL3hzdGF0ZS9lcy9lbnZpcm9ubWVudC5qcyIsIkU6L2ZyYW1ld29ya19zcGFjZS9FYXN5R2FtZUZyYW1ld29ya09wZW4vbm9kZV9tb2R1bGVzL3hzdGF0ZS9lcy91dGlscy5qcyIsIkU6L2ZyYW1ld29ya19zcGFjZS9FYXN5R2FtZUZyYW1ld29ya09wZW4vbm9kZV9tb2R1bGVzL3hzdGF0ZS9lcy9tYXBTdGF0ZS5qcyIsIkU6L2ZyYW1ld29ya19zcGFjZS9FYXN5R2FtZUZyYW1ld29ya09wZW4vbm9kZV9tb2R1bGVzL3hzdGF0ZS9lcy90eXBlcy5qcyIsIkU6L2ZyYW1ld29ya19zcGFjZS9FYXN5R2FtZUZyYW1ld29ya09wZW4vbm9kZV9tb2R1bGVzL3hzdGF0ZS9lcy9hY3Rpb25UeXBlcy5qcyIsIkU6L2ZyYW1ld29ya19zcGFjZS9FYXN5R2FtZUZyYW1ld29ya09wZW4vbm9kZV9tb2R1bGVzL3hzdGF0ZS9lcy9hY3Rpb25zLmpzIiwiRTovZnJhbWV3b3JrX3NwYWNlL0Vhc3lHYW1lRnJhbWV3b3JrT3Blbi9ub2RlX21vZHVsZXMveHN0YXRlL2VzL3N0YXRlVXRpbHMuanMiLCJFOi9mcmFtZXdvcmtfc3BhY2UvRWFzeUdhbWVGcmFtZXdvcmtPcGVuL25vZGVfbW9kdWxlcy94c3RhdGUvZXMvU3RhdGUuanMiLCJFOi9mcmFtZXdvcmtfc3BhY2UvRWFzeUdhbWVGcmFtZXdvcmtPcGVuL25vZGVfbW9kdWxlcy94c3RhdGUvZXMvc2VydmljZVNjb3BlLmpzIiwiRTovZnJhbWV3b3JrX3NwYWNlL0Vhc3lHYW1lRnJhbWV3b3JrT3Blbi9ub2RlX21vZHVsZXMveHN0YXRlL2VzL0FjdG9yLmpzIiwiRTovZnJhbWV3b3JrX3NwYWNlL0Vhc3lHYW1lRnJhbWV3b3JrT3Blbi9ub2RlX21vZHVsZXMveHN0YXRlL2VzL2ludm9rZVV0aWxzLmpzIiwiRTovZnJhbWV3b3JrX3NwYWNlL0Vhc3lHYW1lRnJhbWV3b3JrT3Blbi9ub2RlX21vZHVsZXMveHN0YXRlL2VzL1N0YXRlTm9kZS5qcyIsIkU6L2ZyYW1ld29ya19zcGFjZS9FYXN5R2FtZUZyYW1ld29ya09wZW4vbm9kZV9tb2R1bGVzL3hzdGF0ZS9lcy9NYWNoaW5lLmpzIiwiRTovZnJhbWV3b3JrX3NwYWNlL0Vhc3lHYW1lRnJhbWV3b3JrT3Blbi9ub2RlX21vZHVsZXMveHN0YXRlL2VzL3NjaGVkdWxlci5qcyIsIkU6L2ZyYW1ld29ya19zcGFjZS9FYXN5R2FtZUZyYW1ld29ya09wZW4vbm9kZV9tb2R1bGVzL3hzdGF0ZS9lcy9yZWdpc3RyeS5qcyIsIkU6L2ZyYW1ld29ya19zcGFjZS9FYXN5R2FtZUZyYW1ld29ya09wZW4vbm9kZV9tb2R1bGVzL3hzdGF0ZS9lcy9kZXZUb29scy5qcyIsIkU6L2ZyYW1ld29ya19zcGFjZS9FYXN5R2FtZUZyYW1ld29ya09wZW4vbm9kZV9tb2R1bGVzL3hzdGF0ZS9lcy9pbnRlcnByZXRlci5qcyIsIkU6L2ZyYW1ld29ya19zcGFjZS9FYXN5R2FtZUZyYW1ld29ya09wZW4vbm9kZV9tb2R1bGVzL3hzdGF0ZS9lcy9tYXRjaC5qcyIsIkU6L2ZyYW1ld29ya19zcGFjZS9FYXN5R2FtZUZyYW1ld29ya09wZW4vbm9kZV9tb2R1bGVzL3hzdGF0ZS9lcy9pbmRleC5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvKiEgKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKipcclxuQ29weXJpZ2h0IChjKSBNaWNyb3NvZnQgQ29ycG9yYXRpb24uXHJcblxyXG5QZXJtaXNzaW9uIHRvIHVzZSwgY29weSwgbW9kaWZ5LCBhbmQvb3IgZGlzdHJpYnV0ZSB0aGlzIHNvZnR3YXJlIGZvciBhbnlcclxucHVycG9zZSB3aXRoIG9yIHdpdGhvdXQgZmVlIGlzIGhlcmVieSBncmFudGVkLlxyXG5cclxuVEhFIFNPRlRXQVJFIElTIFBST1ZJREVEIFwiQVMgSVNcIiBBTkQgVEhFIEFVVEhPUiBESVNDTEFJTVMgQUxMIFdBUlJBTlRJRVMgV0lUSFxyXG5SRUdBUkQgVE8gVEhJUyBTT0ZUV0FSRSBJTkNMVURJTkcgQUxMIElNUExJRUQgV0FSUkFOVElFUyBPRiBNRVJDSEFOVEFCSUxJVFlcclxuQU5EIEZJVE5FU1MuIElOIE5PIEVWRU5UIFNIQUxMIFRIRSBBVVRIT1IgQkUgTElBQkxFIEZPUiBBTlkgU1BFQ0lBTCwgRElSRUNULFxyXG5JTkRJUkVDVCwgT1IgQ09OU0VRVUVOVElBTCBEQU1BR0VTIE9SIEFOWSBEQU1BR0VTIFdIQVRTT0VWRVIgUkVTVUxUSU5HIEZST01cclxuTE9TUyBPRiBVU0UsIERBVEEgT1IgUFJPRklUUywgV0hFVEhFUiBJTiBBTiBBQ1RJT04gT0YgQ09OVFJBQ1QsIE5FR0xJR0VOQ0UgT1JcclxuT1RIRVIgVE9SVElPVVMgQUNUSU9OLCBBUklTSU5HIE9VVCBPRiBPUiBJTiBDT05ORUNUSU9OIFdJVEggVEhFIFVTRSBPUlxyXG5QRVJGT1JNQU5DRSBPRiBUSElTIFNPRlRXQVJFLlxyXG4qKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiAqL1xudmFyIF9fYXNzaWduID0gZnVuY3Rpb24gKCkge1xuICBfX2Fzc2lnbiA9IE9iamVjdC5hc3NpZ24gfHwgZnVuY3Rpb24gX19hc3NpZ24odCkge1xuICAgIGZvciAodmFyIHMsIGkgPSAxLCBuID0gYXJndW1lbnRzLmxlbmd0aDsgaSA8IG47IGkrKykge1xuICAgICAgcyA9IGFyZ3VtZW50c1tpXTtcblxuICAgICAgZm9yICh2YXIgcCBpbiBzKSBpZiAoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKHMsIHApKSB0W3BdID0gc1twXTtcbiAgICB9XG5cbiAgICByZXR1cm4gdDtcbiAgfTtcblxuICByZXR1cm4gX19hc3NpZ24uYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbn07XG5cbmZ1bmN0aW9uIF9fcmVzdChzLCBlKSB7XG4gIHZhciB0ID0ge307XG5cbiAgZm9yICh2YXIgcCBpbiBzKSBpZiAoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKHMsIHApICYmIGUuaW5kZXhPZihwKSA8IDApIHRbcF0gPSBzW3BdO1xuXG4gIGlmIChzICE9IG51bGwgJiYgdHlwZW9mIE9iamVjdC5nZXRPd25Qcm9wZXJ0eVN5bWJvbHMgPT09IFwiZnVuY3Rpb25cIikgZm9yICh2YXIgaSA9IDAsIHAgPSBPYmplY3QuZ2V0T3duUHJvcGVydHlTeW1ib2xzKHMpOyBpIDwgcC5sZW5ndGg7IGkrKykge1xuICAgIGlmIChlLmluZGV4T2YocFtpXSkgPCAwICYmIE9iamVjdC5wcm90b3R5cGUucHJvcGVydHlJc0VudW1lcmFibGUuY2FsbChzLCBwW2ldKSkgdFtwW2ldXSA9IHNbcFtpXV07XG4gIH1cbiAgcmV0dXJuIHQ7XG59XG5cbmZ1bmN0aW9uIF9fdmFsdWVzKG8pIHtcbiAgdmFyIHMgPSB0eXBlb2YgU3ltYm9sID09PSBcImZ1bmN0aW9uXCIgJiYgU3ltYm9sLml0ZXJhdG9yLFxuICAgICAgbSA9IHMgJiYgb1tzXSxcbiAgICAgIGkgPSAwO1xuICBpZiAobSkgcmV0dXJuIG0uY2FsbChvKTtcbiAgaWYgKG8gJiYgdHlwZW9mIG8ubGVuZ3RoID09PSBcIm51bWJlclwiKSByZXR1cm4ge1xuICAgIG5leHQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgIGlmIChvICYmIGkgPj0gby5sZW5ndGgpIG8gPSB2b2lkIDA7XG4gICAgICByZXR1cm4ge1xuICAgICAgICB2YWx1ZTogbyAmJiBvW2krK10sXG4gICAgICAgIGRvbmU6ICFvXG4gICAgICB9O1xuICAgIH1cbiAgfTtcbiAgdGhyb3cgbmV3IFR5cGVFcnJvcihzID8gXCJPYmplY3QgaXMgbm90IGl0ZXJhYmxlLlwiIDogXCJTeW1ib2wuaXRlcmF0b3IgaXMgbm90IGRlZmluZWQuXCIpO1xufVxuXG5mdW5jdGlvbiBfX3JlYWQobywgbikge1xuICB2YXIgbSA9IHR5cGVvZiBTeW1ib2wgPT09IFwiZnVuY3Rpb25cIiAmJiBvW1N5bWJvbC5pdGVyYXRvcl07XG4gIGlmICghbSkgcmV0dXJuIG87XG4gIHZhciBpID0gbS5jYWxsKG8pLFxuICAgICAgcixcbiAgICAgIGFyID0gW10sXG4gICAgICBlO1xuXG4gIHRyeSB7XG4gICAgd2hpbGUgKChuID09PSB2b2lkIDAgfHwgbi0tID4gMCkgJiYgIShyID0gaS5uZXh0KCkpLmRvbmUpIGFyLnB1c2goci52YWx1ZSk7XG4gIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgZSA9IHtcbiAgICAgIGVycm9yOiBlcnJvclxuICAgIH07XG4gIH0gZmluYWxseSB7XG4gICAgdHJ5IHtcbiAgICAgIGlmIChyICYmICFyLmRvbmUgJiYgKG0gPSBpW1wicmV0dXJuXCJdKSkgbS5jYWxsKGkpO1xuICAgIH0gZmluYWxseSB7XG4gICAgICBpZiAoZSkgdGhyb3cgZS5lcnJvcjtcbiAgICB9XG4gIH1cblxuICByZXR1cm4gYXI7XG59XG5cbmZ1bmN0aW9uIF9fc3ByZWFkKCkge1xuICBmb3IgKHZhciBhciA9IFtdLCBpID0gMDsgaSA8IGFyZ3VtZW50cy5sZW5ndGg7IGkrKykgYXIgPSBhci5jb25jYXQoX19yZWFkKGFyZ3VtZW50c1tpXSkpO1xuXG4gIHJldHVybiBhcjtcbn1cblxuZXhwb3J0IHsgX19hc3NpZ24sIF9fcmVhZCwgX19yZXN0LCBfX3NwcmVhZCwgX192YWx1ZXMgfTsiLCJ2YXIgU1RBVEVfREVMSU1JVEVSID0gJy4nO1xudmFyIEVNUFRZX0FDVElWSVRZX01BUCA9IHt9O1xudmFyIERFRkFVTFRfR1VBUkRfVFlQRSA9ICd4c3RhdGUuZ3VhcmQnO1xudmFyIFRBUkdFVExFU1NfS0VZID0gJyc7XG5leHBvcnQgeyBERUZBVUxUX0dVQVJEX1RZUEUsIEVNUFRZX0FDVElWSVRZX01BUCwgU1RBVEVfREVMSU1JVEVSLCBUQVJHRVRMRVNTX0tFWSB9OyIsInZhciBJU19QUk9EVUNUSU9OID0gcHJvY2Vzcy5lbnYuTk9ERV9FTlYgPT09ICdwcm9kdWN0aW9uJztcbmV4cG9ydCB7IElTX1BST0RVQ1RJT04gfTsiLCJpbXBvcnQgeyBfX3NwcmVhZCwgX192YWx1ZXMsIF9fcmVhZCwgX19hc3NpZ24gfSBmcm9tICcuL192aXJ0dWFsL190c2xpYi5qcyc7XG5pbXBvcnQgeyBERUZBVUxUX0dVQVJEX1RZUEUsIFRBUkdFVExFU1NfS0VZLCBTVEFURV9ERUxJTUlURVIgfSBmcm9tICcuL2NvbnN0YW50cy5qcyc7XG5pbXBvcnQgeyBJU19QUk9EVUNUSU9OIH0gZnJvbSAnLi9lbnZpcm9ubWVudC5qcyc7XG5cbmZ1bmN0aW9uIGtleXModmFsdWUpIHtcbiAgcmV0dXJuIE9iamVjdC5rZXlzKHZhbHVlKTtcbn1cblxuZnVuY3Rpb24gbWF0Y2hlc1N0YXRlKHBhcmVudFN0YXRlSWQsIGNoaWxkU3RhdGVJZCwgZGVsaW1pdGVyKSB7XG4gIGlmIChkZWxpbWl0ZXIgPT09IHZvaWQgMCkge1xuICAgIGRlbGltaXRlciA9IFNUQVRFX0RFTElNSVRFUjtcbiAgfVxuXG4gIHZhciBwYXJlbnRTdGF0ZVZhbHVlID0gdG9TdGF0ZVZhbHVlKHBhcmVudFN0YXRlSWQsIGRlbGltaXRlcik7XG4gIHZhciBjaGlsZFN0YXRlVmFsdWUgPSB0b1N0YXRlVmFsdWUoY2hpbGRTdGF0ZUlkLCBkZWxpbWl0ZXIpO1xuXG4gIGlmIChpc1N0cmluZyhjaGlsZFN0YXRlVmFsdWUpKSB7XG4gICAgaWYgKGlzU3RyaW5nKHBhcmVudFN0YXRlVmFsdWUpKSB7XG4gICAgICByZXR1cm4gY2hpbGRTdGF0ZVZhbHVlID09PSBwYXJlbnRTdGF0ZVZhbHVlO1xuICAgIH0gLy8gUGFyZW50IG1vcmUgc3BlY2lmaWMgdGhhbiBjaGlsZFxuXG5cbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICBpZiAoaXNTdHJpbmcocGFyZW50U3RhdGVWYWx1ZSkpIHtcbiAgICByZXR1cm4gcGFyZW50U3RhdGVWYWx1ZSBpbiBjaGlsZFN0YXRlVmFsdWU7XG4gIH1cblxuICByZXR1cm4ga2V5cyhwYXJlbnRTdGF0ZVZhbHVlKS5ldmVyeShmdW5jdGlvbiAoa2V5KSB7XG4gICAgaWYgKCEoa2V5IGluIGNoaWxkU3RhdGVWYWx1ZSkpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICByZXR1cm4gbWF0Y2hlc1N0YXRlKHBhcmVudFN0YXRlVmFsdWVba2V5XSwgY2hpbGRTdGF0ZVZhbHVlW2tleV0pO1xuICB9KTtcbn1cblxuZnVuY3Rpb24gZ2V0RXZlbnRUeXBlKGV2ZW50KSB7XG4gIHRyeSB7XG4gICAgcmV0dXJuIGlzU3RyaW5nKGV2ZW50KSB8fCB0eXBlb2YgZXZlbnQgPT09ICdudW1iZXInID8gXCJcIiArIGV2ZW50IDogZXZlbnQudHlwZTtcbiAgfSBjYXRjaCAoZSkge1xuICAgIHRocm93IG5ldyBFcnJvcignRXZlbnRzIG11c3QgYmUgc3RyaW5ncyBvciBvYmplY3RzIHdpdGggYSBzdHJpbmcgZXZlbnQudHlwZSBwcm9wZXJ0eS4nKTtcbiAgfVxufVxuXG5mdW5jdGlvbiB0b1N0YXRlUGF0aChzdGF0ZUlkLCBkZWxpbWl0ZXIpIHtcbiAgdHJ5IHtcbiAgICBpZiAoaXNBcnJheShzdGF0ZUlkKSkge1xuICAgICAgcmV0dXJuIHN0YXRlSWQ7XG4gICAgfVxuXG4gICAgcmV0dXJuIHN0YXRlSWQudG9TdHJpbmcoKS5zcGxpdChkZWxpbWl0ZXIpO1xuICB9IGNhdGNoIChlKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKFwiJ1wiICsgc3RhdGVJZCArIFwiJyBpcyBub3QgYSB2YWxpZCBzdGF0ZSBwYXRoLlwiKTtcbiAgfVxufVxuXG5mdW5jdGlvbiBpc1N0YXRlTGlrZShzdGF0ZSkge1xuICByZXR1cm4gdHlwZW9mIHN0YXRlID09PSAnb2JqZWN0JyAmJiAndmFsdWUnIGluIHN0YXRlICYmICdjb250ZXh0JyBpbiBzdGF0ZSAmJiAnZXZlbnQnIGluIHN0YXRlICYmICdfZXZlbnQnIGluIHN0YXRlO1xufVxuXG5mdW5jdGlvbiB0b1N0YXRlVmFsdWUoc3RhdGVWYWx1ZSwgZGVsaW1pdGVyKSB7XG4gIGlmIChpc1N0YXRlTGlrZShzdGF0ZVZhbHVlKSkge1xuICAgIHJldHVybiBzdGF0ZVZhbHVlLnZhbHVlO1xuICB9XG5cbiAgaWYgKGlzQXJyYXkoc3RhdGVWYWx1ZSkpIHtcbiAgICByZXR1cm4gcGF0aFRvU3RhdGVWYWx1ZShzdGF0ZVZhbHVlKTtcbiAgfVxuXG4gIGlmICh0eXBlb2Ygc3RhdGVWYWx1ZSAhPT0gJ3N0cmluZycpIHtcbiAgICByZXR1cm4gc3RhdGVWYWx1ZTtcbiAgfVxuXG4gIHZhciBzdGF0ZVBhdGggPSB0b1N0YXRlUGF0aChzdGF0ZVZhbHVlLCBkZWxpbWl0ZXIpO1xuICByZXR1cm4gcGF0aFRvU3RhdGVWYWx1ZShzdGF0ZVBhdGgpO1xufVxuXG5mdW5jdGlvbiBwYXRoVG9TdGF0ZVZhbHVlKHN0YXRlUGF0aCkge1xuICBpZiAoc3RhdGVQYXRoLmxlbmd0aCA9PT0gMSkge1xuICAgIHJldHVybiBzdGF0ZVBhdGhbMF07XG4gIH1cblxuICB2YXIgdmFsdWUgPSB7fTtcbiAgdmFyIG1hcmtlciA9IHZhbHVlO1xuXG4gIGZvciAodmFyIGkgPSAwOyBpIDwgc3RhdGVQYXRoLmxlbmd0aCAtIDE7IGkrKykge1xuICAgIGlmIChpID09PSBzdGF0ZVBhdGgubGVuZ3RoIC0gMikge1xuICAgICAgbWFya2VyW3N0YXRlUGF0aFtpXV0gPSBzdGF0ZVBhdGhbaSArIDFdO1xuICAgIH0gZWxzZSB7XG4gICAgICBtYXJrZXJbc3RhdGVQYXRoW2ldXSA9IHt9O1xuICAgICAgbWFya2VyID0gbWFya2VyW3N0YXRlUGF0aFtpXV07XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIHZhbHVlO1xufVxuXG5mdW5jdGlvbiBtYXBWYWx1ZXMoY29sbGVjdGlvbiwgaXRlcmF0ZWUpIHtcbiAgdmFyIHJlc3VsdCA9IHt9O1xuICB2YXIgY29sbGVjdGlvbktleXMgPSBrZXlzKGNvbGxlY3Rpb24pO1xuXG4gIGZvciAodmFyIGkgPSAwOyBpIDwgY29sbGVjdGlvbktleXMubGVuZ3RoOyBpKyspIHtcbiAgICB2YXIga2V5ID0gY29sbGVjdGlvbktleXNbaV07XG4gICAgcmVzdWx0W2tleV0gPSBpdGVyYXRlZShjb2xsZWN0aW9uW2tleV0sIGtleSwgY29sbGVjdGlvbiwgaSk7XG4gIH1cblxuICByZXR1cm4gcmVzdWx0O1xufVxuXG5mdW5jdGlvbiBtYXBGaWx0ZXJWYWx1ZXMoY29sbGVjdGlvbiwgaXRlcmF0ZWUsIHByZWRpY2F0ZSkge1xuICB2YXIgZV8xLCBfYTtcblxuICB2YXIgcmVzdWx0ID0ge307XG5cbiAgdHJ5IHtcbiAgICBmb3IgKHZhciBfYiA9IF9fdmFsdWVzKGtleXMoY29sbGVjdGlvbikpLCBfYyA9IF9iLm5leHQoKTsgIV9jLmRvbmU7IF9jID0gX2IubmV4dCgpKSB7XG4gICAgICB2YXIga2V5ID0gX2MudmFsdWU7XG4gICAgICB2YXIgaXRlbSA9IGNvbGxlY3Rpb25ba2V5XTtcblxuICAgICAgaWYgKCFwcmVkaWNhdGUoaXRlbSkpIHtcbiAgICAgICAgY29udGludWU7XG4gICAgICB9XG5cbiAgICAgIHJlc3VsdFtrZXldID0gaXRlcmF0ZWUoaXRlbSwga2V5LCBjb2xsZWN0aW9uKTtcbiAgICB9XG4gIH0gY2F0Y2ggKGVfMV8xKSB7XG4gICAgZV8xID0ge1xuICAgICAgZXJyb3I6IGVfMV8xXG4gICAgfTtcbiAgfSBmaW5hbGx5IHtcbiAgICB0cnkge1xuICAgICAgaWYgKF9jICYmICFfYy5kb25lICYmIChfYSA9IF9iLnJldHVybikpIF9hLmNhbGwoX2IpO1xuICAgIH0gZmluYWxseSB7XG4gICAgICBpZiAoZV8xKSB0aHJvdyBlXzEuZXJyb3I7XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIHJlc3VsdDtcbn1cbi8qKlxyXG4gKiBSZXRyaWV2ZXMgYSB2YWx1ZSBhdCB0aGUgZ2l2ZW4gcGF0aC5cclxuICogQHBhcmFtIHByb3BzIFRoZSBkZWVwIHBhdGggdG8gdGhlIHByb3Agb2YgdGhlIGRlc2lyZWQgdmFsdWVcclxuICovXG5cblxudmFyIHBhdGggPSBmdW5jdGlvbiAocHJvcHMpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uIChvYmplY3QpIHtcbiAgICB2YXIgZV8yLCBfYTtcblxuICAgIHZhciByZXN1bHQgPSBvYmplY3Q7XG5cbiAgICB0cnkge1xuICAgICAgZm9yICh2YXIgcHJvcHNfMSA9IF9fdmFsdWVzKHByb3BzKSwgcHJvcHNfMV8xID0gcHJvcHNfMS5uZXh0KCk7ICFwcm9wc18xXzEuZG9uZTsgcHJvcHNfMV8xID0gcHJvcHNfMS5uZXh0KCkpIHtcbiAgICAgICAgdmFyIHByb3AgPSBwcm9wc18xXzEudmFsdWU7XG4gICAgICAgIHJlc3VsdCA9IHJlc3VsdFtwcm9wXTtcbiAgICAgIH1cbiAgICB9IGNhdGNoIChlXzJfMSkge1xuICAgICAgZV8yID0ge1xuICAgICAgICBlcnJvcjogZV8yXzFcbiAgICAgIH07XG4gICAgfSBmaW5hbGx5IHtcbiAgICAgIHRyeSB7XG4gICAgICAgIGlmIChwcm9wc18xXzEgJiYgIXByb3BzXzFfMS5kb25lICYmIChfYSA9IHByb3BzXzEucmV0dXJuKSkgX2EuY2FsbChwcm9wc18xKTtcbiAgICAgIH0gZmluYWxseSB7XG4gICAgICAgIGlmIChlXzIpIHRocm93IGVfMi5lcnJvcjtcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gcmVzdWx0O1xuICB9O1xufTtcbi8qKlxyXG4gKiBSZXRyaWV2ZXMgYSB2YWx1ZSBhdCB0aGUgZ2l2ZW4gcGF0aCB2aWEgdGhlIG5lc3RlZCBhY2Nlc3NvciBwcm9wLlxyXG4gKiBAcGFyYW0gcHJvcHMgVGhlIGRlZXAgcGF0aCB0byB0aGUgcHJvcCBvZiB0aGUgZGVzaXJlZCB2YWx1ZVxyXG4gKi9cblxuXG5mdW5jdGlvbiBuZXN0ZWRQYXRoKHByb3BzLCBhY2Nlc3NvclByb3ApIHtcbiAgcmV0dXJuIGZ1bmN0aW9uIChvYmplY3QpIHtcbiAgICB2YXIgZV8zLCBfYTtcblxuICAgIHZhciByZXN1bHQgPSBvYmplY3Q7XG5cbiAgICB0cnkge1xuICAgICAgZm9yICh2YXIgcHJvcHNfMiA9IF9fdmFsdWVzKHByb3BzKSwgcHJvcHNfMl8xID0gcHJvcHNfMi5uZXh0KCk7ICFwcm9wc18yXzEuZG9uZTsgcHJvcHNfMl8xID0gcHJvcHNfMi5uZXh0KCkpIHtcbiAgICAgICAgdmFyIHByb3AgPSBwcm9wc18yXzEudmFsdWU7XG4gICAgICAgIHJlc3VsdCA9IHJlc3VsdFthY2Nlc3NvclByb3BdW3Byb3BdO1xuICAgICAgfVxuICAgIH0gY2F0Y2ggKGVfM18xKSB7XG4gICAgICBlXzMgPSB7XG4gICAgICAgIGVycm9yOiBlXzNfMVxuICAgICAgfTtcbiAgICB9IGZpbmFsbHkge1xuICAgICAgdHJ5IHtcbiAgICAgICAgaWYgKHByb3BzXzJfMSAmJiAhcHJvcHNfMl8xLmRvbmUgJiYgKF9hID0gcHJvcHNfMi5yZXR1cm4pKSBfYS5jYWxsKHByb3BzXzIpO1xuICAgICAgfSBmaW5hbGx5IHtcbiAgICAgICAgaWYgKGVfMykgdGhyb3cgZV8zLmVycm9yO1xuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiByZXN1bHQ7XG4gIH07XG59XG5cbmZ1bmN0aW9uIHRvU3RhdGVQYXRocyhzdGF0ZVZhbHVlKSB7XG4gIGlmICghc3RhdGVWYWx1ZSkge1xuICAgIHJldHVybiBbW11dO1xuICB9XG5cbiAgaWYgKGlzU3RyaW5nKHN0YXRlVmFsdWUpKSB7XG4gICAgcmV0dXJuIFtbc3RhdGVWYWx1ZV1dO1xuICB9XG5cbiAgdmFyIHJlc3VsdCA9IGZsYXR0ZW4oa2V5cyhzdGF0ZVZhbHVlKS5tYXAoZnVuY3Rpb24gKGtleSkge1xuICAgIHZhciBzdWJTdGF0ZVZhbHVlID0gc3RhdGVWYWx1ZVtrZXldO1xuXG4gICAgaWYgKHR5cGVvZiBzdWJTdGF0ZVZhbHVlICE9PSAnc3RyaW5nJyAmJiAoIXN1YlN0YXRlVmFsdWUgfHwgIU9iamVjdC5rZXlzKHN1YlN0YXRlVmFsdWUpLmxlbmd0aCkpIHtcbiAgICAgIHJldHVybiBbW2tleV1dO1xuICAgIH1cblxuICAgIHJldHVybiB0b1N0YXRlUGF0aHMoc3RhdGVWYWx1ZVtrZXldKS5tYXAoZnVuY3Rpb24gKHN1YlBhdGgpIHtcbiAgICAgIHJldHVybiBba2V5XS5jb25jYXQoc3ViUGF0aCk7XG4gICAgfSk7XG4gIH0pKTtcbiAgcmV0dXJuIHJlc3VsdDtcbn1cblxuZnVuY3Rpb24gZmxhdHRlbihhcnJheSkge1xuICB2YXIgX2E7XG5cbiAgcmV0dXJuIChfYSA9IFtdKS5jb25jYXQuYXBwbHkoX2EsIF9fc3ByZWFkKGFycmF5KSk7XG59XG5cbmZ1bmN0aW9uIHRvQXJyYXlTdHJpY3QodmFsdWUpIHtcbiAgaWYgKGlzQXJyYXkodmFsdWUpKSB7XG4gICAgcmV0dXJuIHZhbHVlO1xuICB9XG5cbiAgcmV0dXJuIFt2YWx1ZV07XG59XG5cbmZ1bmN0aW9uIHRvQXJyYXkodmFsdWUpIHtcbiAgaWYgKHZhbHVlID09PSB1bmRlZmluZWQpIHtcbiAgICByZXR1cm4gW107XG4gIH1cblxuICByZXR1cm4gdG9BcnJheVN0cmljdCh2YWx1ZSk7XG59XG5cbmZ1bmN0aW9uIG1hcENvbnRleHQobWFwcGVyLCBjb250ZXh0LCBfZXZlbnQpIHtcbiAgdmFyIGVfNSwgX2E7XG5cbiAgaWYgKGlzRnVuY3Rpb24obWFwcGVyKSkge1xuICAgIHJldHVybiBtYXBwZXIoY29udGV4dCwgX2V2ZW50LmRhdGEpO1xuICB9XG5cbiAgdmFyIHJlc3VsdCA9IHt9O1xuXG4gIHRyeSB7XG4gICAgZm9yICh2YXIgX2IgPSBfX3ZhbHVlcyhPYmplY3Qua2V5cyhtYXBwZXIpKSwgX2MgPSBfYi5uZXh0KCk7ICFfYy5kb25lOyBfYyA9IF9iLm5leHQoKSkge1xuICAgICAgdmFyIGtleSA9IF9jLnZhbHVlO1xuICAgICAgdmFyIHN1Yk1hcHBlciA9IG1hcHBlcltrZXldO1xuXG4gICAgICBpZiAoaXNGdW5jdGlvbihzdWJNYXBwZXIpKSB7XG4gICAgICAgIHJlc3VsdFtrZXldID0gc3ViTWFwcGVyKGNvbnRleHQsIF9ldmVudC5kYXRhKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJlc3VsdFtrZXldID0gc3ViTWFwcGVyO1xuICAgICAgfVxuICAgIH1cbiAgfSBjYXRjaCAoZV81XzEpIHtcbiAgICBlXzUgPSB7XG4gICAgICBlcnJvcjogZV81XzFcbiAgICB9O1xuICB9IGZpbmFsbHkge1xuICAgIHRyeSB7XG4gICAgICBpZiAoX2MgJiYgIV9jLmRvbmUgJiYgKF9hID0gX2IucmV0dXJuKSkgX2EuY2FsbChfYik7XG4gICAgfSBmaW5hbGx5IHtcbiAgICAgIGlmIChlXzUpIHRocm93IGVfNS5lcnJvcjtcbiAgICB9XG4gIH1cblxuICByZXR1cm4gcmVzdWx0O1xufVxuXG5mdW5jdGlvbiBpc0J1aWx0SW5FdmVudChldmVudFR5cGUpIHtcbiAgcmV0dXJuIC9eKGRvbmV8ZXJyb3IpXFwuLy50ZXN0KGV2ZW50VHlwZSk7XG59XG5cbmZ1bmN0aW9uIGlzUHJvbWlzZUxpa2UodmFsdWUpIHtcbiAgaWYgKHZhbHVlIGluc3RhbmNlb2YgUHJvbWlzZSkge1xuICAgIHJldHVybiB0cnVlO1xuICB9IC8vIENoZWNrIGlmIHNoYXBlIG1hdGNoZXMgdGhlIFByb21pc2UvQSsgc3BlY2lmaWNhdGlvbiBmb3IgYSBcInRoZW5hYmxlXCIuXG5cblxuICBpZiAodmFsdWUgIT09IG51bGwgJiYgKGlzRnVuY3Rpb24odmFsdWUpIHx8IHR5cGVvZiB2YWx1ZSA9PT0gJ29iamVjdCcpICYmIGlzRnVuY3Rpb24odmFsdWUudGhlbikpIHtcbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxuXG4gIHJldHVybiBmYWxzZTtcbn1cblxuZnVuY3Rpb24gcGFydGl0aW9uKGl0ZW1zLCBwcmVkaWNhdGUpIHtcbiAgdmFyIGVfNiwgX2E7XG5cbiAgdmFyIF9iID0gX19yZWFkKFtbXSwgW11dLCAyKSxcbiAgICAgIHRydXRoeSA9IF9iWzBdLFxuICAgICAgZmFsc3kgPSBfYlsxXTtcblxuICB0cnkge1xuICAgIGZvciAodmFyIGl0ZW1zXzEgPSBfX3ZhbHVlcyhpdGVtcyksIGl0ZW1zXzFfMSA9IGl0ZW1zXzEubmV4dCgpOyAhaXRlbXNfMV8xLmRvbmU7IGl0ZW1zXzFfMSA9IGl0ZW1zXzEubmV4dCgpKSB7XG4gICAgICB2YXIgaXRlbSA9IGl0ZW1zXzFfMS52YWx1ZTtcblxuICAgICAgaWYgKHByZWRpY2F0ZShpdGVtKSkge1xuICAgICAgICB0cnV0aHkucHVzaChpdGVtKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGZhbHN5LnB1c2goaXRlbSk7XG4gICAgICB9XG4gICAgfVxuICB9IGNhdGNoIChlXzZfMSkge1xuICAgIGVfNiA9IHtcbiAgICAgIGVycm9yOiBlXzZfMVxuICAgIH07XG4gIH0gZmluYWxseSB7XG4gICAgdHJ5IHtcbiAgICAgIGlmIChpdGVtc18xXzEgJiYgIWl0ZW1zXzFfMS5kb25lICYmIChfYSA9IGl0ZW1zXzEucmV0dXJuKSkgX2EuY2FsbChpdGVtc18xKTtcbiAgICB9IGZpbmFsbHkge1xuICAgICAgaWYgKGVfNikgdGhyb3cgZV82LmVycm9yO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiBbdHJ1dGh5LCBmYWxzeV07XG59XG5cbmZ1bmN0aW9uIHVwZGF0ZUhpc3RvcnlTdGF0ZXMoaGlzdCwgc3RhdGVWYWx1ZSkge1xuICByZXR1cm4gbWFwVmFsdWVzKGhpc3Quc3RhdGVzLCBmdW5jdGlvbiAoc3ViSGlzdCwga2V5KSB7XG4gICAgaWYgKCFzdWJIaXN0KSB7XG4gICAgICByZXR1cm4gdW5kZWZpbmVkO1xuICAgIH1cblxuICAgIHZhciBzdWJTdGF0ZVZhbHVlID0gKGlzU3RyaW5nKHN0YXRlVmFsdWUpID8gdW5kZWZpbmVkIDogc3RhdGVWYWx1ZVtrZXldKSB8fCAoc3ViSGlzdCA/IHN1Ykhpc3QuY3VycmVudCA6IHVuZGVmaW5lZCk7XG5cbiAgICBpZiAoIXN1YlN0YXRlVmFsdWUpIHtcbiAgICAgIHJldHVybiB1bmRlZmluZWQ7XG4gICAgfVxuXG4gICAgcmV0dXJuIHtcbiAgICAgIGN1cnJlbnQ6IHN1YlN0YXRlVmFsdWUsXG4gICAgICBzdGF0ZXM6IHVwZGF0ZUhpc3RvcnlTdGF0ZXMoc3ViSGlzdCwgc3ViU3RhdGVWYWx1ZSlcbiAgICB9O1xuICB9KTtcbn1cblxuZnVuY3Rpb24gdXBkYXRlSGlzdG9yeVZhbHVlKGhpc3QsIHN0YXRlVmFsdWUpIHtcbiAgcmV0dXJuIHtcbiAgICBjdXJyZW50OiBzdGF0ZVZhbHVlLFxuICAgIHN0YXRlczogdXBkYXRlSGlzdG9yeVN0YXRlcyhoaXN0LCBzdGF0ZVZhbHVlKVxuICB9O1xufVxuXG5mdW5jdGlvbiB1cGRhdGVDb250ZXh0KGNvbnRleHQsIF9ldmVudCwgYXNzaWduQWN0aW9ucywgc3RhdGUpIHtcbiAgaWYgKCFJU19QUk9EVUNUSU9OKSB7XG4gICAgd2FybighIWNvbnRleHQsICdBdHRlbXB0aW5nIHRvIHVwZGF0ZSB1bmRlZmluZWQgY29udGV4dCcpO1xuICB9XG5cbiAgdmFyIHVwZGF0ZWRDb250ZXh0ID0gY29udGV4dCA/IGFzc2lnbkFjdGlvbnMucmVkdWNlKGZ1bmN0aW9uIChhY2MsIGFzc2lnbkFjdGlvbikge1xuICAgIHZhciBlXzcsIF9hO1xuXG4gICAgdmFyIGFzc2lnbm1lbnQgPSBhc3NpZ25BY3Rpb24uYXNzaWdubWVudDtcbiAgICB2YXIgbWV0YSA9IHtcbiAgICAgIHN0YXRlOiBzdGF0ZSxcbiAgICAgIGFjdGlvbjogYXNzaWduQWN0aW9uLFxuICAgICAgX2V2ZW50OiBfZXZlbnRcbiAgICB9O1xuICAgIHZhciBwYXJ0aWFsVXBkYXRlID0ge307XG5cbiAgICBpZiAoaXNGdW5jdGlvbihhc3NpZ25tZW50KSkge1xuICAgICAgcGFydGlhbFVwZGF0ZSA9IGFzc2lnbm1lbnQoYWNjLCBfZXZlbnQuZGF0YSwgbWV0YSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRyeSB7XG4gICAgICAgIGZvciAodmFyIF9iID0gX192YWx1ZXMoa2V5cyhhc3NpZ25tZW50KSksIF9jID0gX2IubmV4dCgpOyAhX2MuZG9uZTsgX2MgPSBfYi5uZXh0KCkpIHtcbiAgICAgICAgICB2YXIga2V5ID0gX2MudmFsdWU7XG4gICAgICAgICAgdmFyIHByb3BBc3NpZ25tZW50ID0gYXNzaWdubWVudFtrZXldO1xuICAgICAgICAgIHBhcnRpYWxVcGRhdGVba2V5XSA9IGlzRnVuY3Rpb24ocHJvcEFzc2lnbm1lbnQpID8gcHJvcEFzc2lnbm1lbnQoYWNjLCBfZXZlbnQuZGF0YSwgbWV0YSkgOiBwcm9wQXNzaWdubWVudDtcbiAgICAgICAgfVxuICAgICAgfSBjYXRjaCAoZV83XzEpIHtcbiAgICAgICAgZV83ID0ge1xuICAgICAgICAgIGVycm9yOiBlXzdfMVxuICAgICAgICB9O1xuICAgICAgfSBmaW5hbGx5IHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICBpZiAoX2MgJiYgIV9jLmRvbmUgJiYgKF9hID0gX2IucmV0dXJuKSkgX2EuY2FsbChfYik7XG4gICAgICAgIH0gZmluYWxseSB7XG4gICAgICAgICAgaWYgKGVfNykgdGhyb3cgZV83LmVycm9yO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIE9iamVjdC5hc3NpZ24oe30sIGFjYywgcGFydGlhbFVwZGF0ZSk7XG4gIH0sIGNvbnRleHQpIDogY29udGV4dDtcbiAgcmV0dXJuIHVwZGF0ZWRDb250ZXh0O1xufSAvLyB0c2xpbnQ6ZGlzYWJsZS1uZXh0LWxpbmU6bm8tZW1wdHlcblxuXG52YXIgd2FybiA9IGZ1bmN0aW9uICgpIHt9O1xuXG5pZiAoIUlTX1BST0RVQ1RJT04pIHtcbiAgd2FybiA9IGZ1bmN0aW9uIChjb25kaXRpb24sIG1lc3NhZ2UpIHtcbiAgICB2YXIgZXJyb3IgPSBjb25kaXRpb24gaW5zdGFuY2VvZiBFcnJvciA/IGNvbmRpdGlvbiA6IHVuZGVmaW5lZDtcblxuICAgIGlmICghZXJyb3IgJiYgY29uZGl0aW9uKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgaWYgKGNvbnNvbGUgIT09IHVuZGVmaW5lZCkge1xuICAgICAgdmFyIGFyZ3MgPSBbXCJXYXJuaW5nOiBcIiArIG1lc3NhZ2VdO1xuXG4gICAgICBpZiAoZXJyb3IpIHtcbiAgICAgICAgYXJncy5wdXNoKGVycm9yKTtcbiAgICAgIH0gLy8gdHNsaW50OmRpc2FibGUtbmV4dC1saW5lOm5vLWNvbnNvbGVcblxuXG4gICAgICBjb25zb2xlLndhcm4uYXBwbHkoY29uc29sZSwgYXJncyk7XG4gICAgfVxuICB9O1xufVxuXG5mdW5jdGlvbiBpc0FycmF5KHZhbHVlKSB7XG4gIHJldHVybiBBcnJheS5pc0FycmF5KHZhbHVlKTtcbn0gLy8gdHNsaW50OmRpc2FibGUtbmV4dC1saW5lOmJhbi10eXBlc1xuXG5cbmZ1bmN0aW9uIGlzRnVuY3Rpb24odmFsdWUpIHtcbiAgcmV0dXJuIHR5cGVvZiB2YWx1ZSA9PT0gJ2Z1bmN0aW9uJztcbn1cblxuZnVuY3Rpb24gaXNTdHJpbmcodmFsdWUpIHtcbiAgcmV0dXJuIHR5cGVvZiB2YWx1ZSA9PT0gJ3N0cmluZyc7XG59IC8vIGV4cG9ydCBmdW5jdGlvbiBtZW1vaXplZEdldHRlcjxULCBUUCBleHRlbmRzIHsgcHJvdG90eXBlOiBvYmplY3QgfT4oXG4vLyAgIG86IFRQLFxuLy8gICBwcm9wZXJ0eTogc3RyaW5nLFxuLy8gICBnZXR0ZXI6ICgpID0+IFRcbi8vICk6IHZvaWQge1xuLy8gICBPYmplY3QuZGVmaW5lUHJvcGVydHkoby5wcm90b3R5cGUsIHByb3BlcnR5LCB7XG4vLyAgICAgZ2V0OiBnZXR0ZXIsXG4vLyAgICAgZW51bWVyYWJsZTogZmFsc2UsXG4vLyAgICAgY29uZmlndXJhYmxlOiBmYWxzZVxuLy8gICB9KTtcbi8vIH1cblxuXG5mdW5jdGlvbiB0b0d1YXJkKGNvbmRpdGlvbiwgZ3VhcmRNYXApIHtcbiAgaWYgKCFjb25kaXRpb24pIHtcbiAgICByZXR1cm4gdW5kZWZpbmVkO1xuICB9XG5cbiAgaWYgKGlzU3RyaW5nKGNvbmRpdGlvbikpIHtcbiAgICByZXR1cm4ge1xuICAgICAgdHlwZTogREVGQVVMVF9HVUFSRF9UWVBFLFxuICAgICAgbmFtZTogY29uZGl0aW9uLFxuICAgICAgcHJlZGljYXRlOiBndWFyZE1hcCA/IGd1YXJkTWFwW2NvbmRpdGlvbl0gOiB1bmRlZmluZWRcbiAgICB9O1xuICB9XG5cbiAgaWYgKGlzRnVuY3Rpb24oY29uZGl0aW9uKSkge1xuICAgIHJldHVybiB7XG4gICAgICB0eXBlOiBERUZBVUxUX0dVQVJEX1RZUEUsXG4gICAgICBuYW1lOiBjb25kaXRpb24ubmFtZSxcbiAgICAgIHByZWRpY2F0ZTogY29uZGl0aW9uXG4gICAgfTtcbiAgfVxuXG4gIHJldHVybiBjb25kaXRpb247XG59XG5cbmZ1bmN0aW9uIGlzT2JzZXJ2YWJsZSh2YWx1ZSkge1xuICB0cnkge1xuICAgIHJldHVybiAnc3Vic2NyaWJlJyBpbiB2YWx1ZSAmJiBpc0Z1bmN0aW9uKHZhbHVlLnN1YnNjcmliZSk7XG4gIH0gY2F0Y2ggKGUpIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cbn1cblxudmFyIHN5bWJvbE9ic2VydmFibGUgPSAvKiNfX1BVUkVfXyovZnVuY3Rpb24gKCkge1xuICByZXR1cm4gdHlwZW9mIFN5bWJvbCA9PT0gJ2Z1bmN0aW9uJyAmJiBTeW1ib2wub2JzZXJ2YWJsZSB8fCAnQEBvYnNlcnZhYmxlJztcbn0oKTtcblxuZnVuY3Rpb24gaXNNYWNoaW5lKHZhbHVlKSB7XG4gIHRyeSB7XG4gICAgcmV0dXJuICdfX3hzdGF0ZW5vZGUnIGluIHZhbHVlO1xuICB9IGNhdGNoIChlKSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG59XG5cbmZ1bmN0aW9uIGlzQWN0b3IodmFsdWUpIHtcbiAgcmV0dXJuICEhdmFsdWUgJiYgdHlwZW9mIHZhbHVlLnNlbmQgPT09ICdmdW5jdGlvbic7XG59XG5cbnZhciB1bmlxdWVJZCA9IC8qI19fUFVSRV9fKi9mdW5jdGlvbiAoKSB7XG4gIHZhciBjdXJyZW50SWQgPSAwO1xuICByZXR1cm4gZnVuY3Rpb24gKCkge1xuICAgIGN1cnJlbnRJZCsrO1xuICAgIHJldHVybiBjdXJyZW50SWQudG9TdHJpbmcoMTYpO1xuICB9O1xufSgpO1xuXG5mdW5jdGlvbiB0b0V2ZW50T2JqZWN0KGV2ZW50LCBwYXlsb2FkIC8vIGlkPzogVEV2ZW50Wyd0eXBlJ11cbikge1xuICBpZiAoaXNTdHJpbmcoZXZlbnQpIHx8IHR5cGVvZiBldmVudCA9PT0gJ251bWJlcicpIHtcbiAgICByZXR1cm4gX19hc3NpZ24oe1xuICAgICAgdHlwZTogZXZlbnRcbiAgICB9LCBwYXlsb2FkKTtcbiAgfVxuXG4gIHJldHVybiBldmVudDtcbn1cblxuZnVuY3Rpb24gdG9TQ1hNTEV2ZW50KGV2ZW50LCBzY3htbEV2ZW50KSB7XG4gIGlmICghaXNTdHJpbmcoZXZlbnQpICYmICckJHR5cGUnIGluIGV2ZW50ICYmIGV2ZW50LiQkdHlwZSA9PT0gJ3NjeG1sJykge1xuICAgIHJldHVybiBldmVudDtcbiAgfVxuXG4gIHZhciBldmVudE9iamVjdCA9IHRvRXZlbnRPYmplY3QoZXZlbnQpO1xuICByZXR1cm4gX19hc3NpZ24oe1xuICAgIG5hbWU6IGV2ZW50T2JqZWN0LnR5cGUsXG4gICAgZGF0YTogZXZlbnRPYmplY3QsXG4gICAgJCR0eXBlOiAnc2N4bWwnLFxuICAgIHR5cGU6ICdleHRlcm5hbCdcbiAgfSwgc2N4bWxFdmVudCk7XG59XG5cbmZ1bmN0aW9uIHRvVHJhbnNpdGlvbkNvbmZpZ0FycmF5KGV2ZW50LCBjb25maWdMaWtlKSB7XG4gIHZhciB0cmFuc2l0aW9ucyA9IHRvQXJyYXlTdHJpY3QoY29uZmlnTGlrZSkubWFwKGZ1bmN0aW9uICh0cmFuc2l0aW9uTGlrZSkge1xuICAgIGlmICh0eXBlb2YgdHJhbnNpdGlvbkxpa2UgPT09ICd1bmRlZmluZWQnIHx8IHR5cGVvZiB0cmFuc2l0aW9uTGlrZSA9PT0gJ3N0cmluZycgfHwgaXNNYWNoaW5lKHRyYW5zaXRpb25MaWtlKSkge1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgdGFyZ2V0OiB0cmFuc2l0aW9uTGlrZSxcbiAgICAgICAgZXZlbnQ6IGV2ZW50XG4gICAgICB9O1xuICAgIH1cblxuICAgIHJldHVybiBfX2Fzc2lnbihfX2Fzc2lnbih7fSwgdHJhbnNpdGlvbkxpa2UpLCB7XG4gICAgICBldmVudDogZXZlbnRcbiAgICB9KTtcbiAgfSk7XG4gIHJldHVybiB0cmFuc2l0aW9ucztcbn1cblxuZnVuY3Rpb24gbm9ybWFsaXplVGFyZ2V0KHRhcmdldCkge1xuICBpZiAodGFyZ2V0ID09PSB1bmRlZmluZWQgfHwgdGFyZ2V0ID09PSBUQVJHRVRMRVNTX0tFWSkge1xuICAgIHJldHVybiB1bmRlZmluZWQ7XG4gIH1cblxuICByZXR1cm4gdG9BcnJheSh0YXJnZXQpO1xufVxuXG5mdW5jdGlvbiByZXBvcnRVbmhhbmRsZWRFeGNlcHRpb25Pbkludm9jYXRpb24ob3JpZ2luYWxFcnJvciwgY3VycmVudEVycm9yLCBpZCkge1xuICBpZiAoIUlTX1BST0RVQ1RJT04pIHtcbiAgICB2YXIgb3JpZ2luYWxTdGFja1RyYWNlID0gb3JpZ2luYWxFcnJvci5zdGFjayA/IFwiIFN0YWNrdHJhY2Ugd2FzICdcIiArIG9yaWdpbmFsRXJyb3Iuc3RhY2sgKyBcIidcIiA6ICcnO1xuXG4gICAgaWYgKG9yaWdpbmFsRXJyb3IgPT09IGN1cnJlbnRFcnJvcikge1xuICAgICAgLy8gdHNsaW50OmRpc2FibGUtbmV4dC1saW5lOm5vLWNvbnNvbGVcbiAgICAgIGNvbnNvbGUuZXJyb3IoXCJNaXNzaW5nIG9uRXJyb3IgaGFuZGxlciBmb3IgaW52b2NhdGlvbiAnXCIgKyBpZCArIFwiJywgZXJyb3Igd2FzICdcIiArIG9yaWdpbmFsRXJyb3IgKyBcIicuXCIgKyBvcmlnaW5hbFN0YWNrVHJhY2UpO1xuICAgIH0gZWxzZSB7XG4gICAgICB2YXIgc3RhY2tUcmFjZSA9IGN1cnJlbnRFcnJvci5zdGFjayA/IFwiIFN0YWNrdHJhY2Ugd2FzICdcIiArIGN1cnJlbnRFcnJvci5zdGFjayArIFwiJ1wiIDogJyc7IC8vIHRzbGludDpkaXNhYmxlLW5leHQtbGluZTpuby1jb25zb2xlXG5cbiAgICAgIGNvbnNvbGUuZXJyb3IoXCJNaXNzaW5nIG9uRXJyb3IgaGFuZGxlciBhbmQvb3IgdW5oYW5kbGVkIGV4Y2VwdGlvbi9wcm9taXNlIHJlamVjdGlvbiBmb3IgaW52b2NhdGlvbiAnXCIgKyBpZCArIFwiJy4gXCIgKyAoXCJPcmlnaW5hbCBlcnJvcjogJ1wiICsgb3JpZ2luYWxFcnJvciArIFwiJy4gXCIgKyBvcmlnaW5hbFN0YWNrVHJhY2UgKyBcIiBDdXJyZW50IGVycm9yIGlzICdcIiArIGN1cnJlbnRFcnJvciArIFwiJy5cIiArIHN0YWNrVHJhY2UpKTtcbiAgICB9XG4gIH1cbn1cblxuZnVuY3Rpb24gZXZhbHVhdGVHdWFyZChtYWNoaW5lLCBndWFyZCwgY29udGV4dCwgX2V2ZW50LCBzdGF0ZSkge1xuICB2YXIgZ3VhcmRzID0gbWFjaGluZS5vcHRpb25zLmd1YXJkcztcbiAgdmFyIGd1YXJkTWV0YSA9IHtcbiAgICBzdGF0ZTogc3RhdGUsXG4gICAgY29uZDogZ3VhcmQsXG4gICAgX2V2ZW50OiBfZXZlbnRcbiAgfTsgLy8gVE9ETzogZG8gbm90IGhhcmRjb2RlIVxuXG4gIGlmIChndWFyZC50eXBlID09PSBERUZBVUxUX0dVQVJEX1RZUEUpIHtcbiAgICByZXR1cm4gZ3VhcmQucHJlZGljYXRlKGNvbnRleHQsIF9ldmVudC5kYXRhLCBndWFyZE1ldGEpO1xuICB9XG5cbiAgdmFyIGNvbmRGbiA9IGd1YXJkc1tndWFyZC50eXBlXTtcblxuICBpZiAoIWNvbmRGbikge1xuICAgIHRocm93IG5ldyBFcnJvcihcIkd1YXJkICdcIiArIGd1YXJkLnR5cGUgKyBcIicgaXMgbm90IGltcGxlbWVudGVkIG9uIG1hY2hpbmUgJ1wiICsgbWFjaGluZS5pZCArIFwiJy5cIik7XG4gIH1cblxuICByZXR1cm4gY29uZEZuKGNvbnRleHQsIF9ldmVudC5kYXRhLCBndWFyZE1ldGEpO1xufVxuXG5mdW5jdGlvbiB0b0ludm9rZVNvdXJjZShzcmMpIHtcbiAgaWYgKHR5cGVvZiBzcmMgPT09ICdzdHJpbmcnKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIHR5cGU6IHNyY1xuICAgIH07XG4gIH1cblxuICByZXR1cm4gc3JjO1xufVxuXG5mdW5jdGlvbiB0b09ic2VydmVyKG5leHRIYW5kbGVyLCBlcnJvckhhbmRsZXIsIGNvbXBsZXRpb25IYW5kbGVyKSB7XG4gIGlmICh0eXBlb2YgbmV4dEhhbmRsZXIgPT09ICdvYmplY3QnKSB7XG4gICAgcmV0dXJuIG5leHRIYW5kbGVyO1xuICB9XG5cbiAgdmFyIG5vb3AgPSBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIHZvaWQgMDtcbiAgfTtcblxuICByZXR1cm4ge1xuICAgIG5leHQ6IG5leHRIYW5kbGVyLFxuICAgIGVycm9yOiBlcnJvckhhbmRsZXIgfHwgbm9vcCxcbiAgICBjb21wbGV0ZTogY29tcGxldGlvbkhhbmRsZXIgfHwgbm9vcFxuICB9O1xufVxuXG5leHBvcnQgeyBldmFsdWF0ZUd1YXJkLCBmbGF0dGVuLCBnZXRFdmVudFR5cGUsIGlzQWN0b3IsIGlzQXJyYXksIGlzQnVpbHRJbkV2ZW50LCBpc0Z1bmN0aW9uLCBpc01hY2hpbmUsIGlzT2JzZXJ2YWJsZSwgaXNQcm9taXNlTGlrZSwgaXNTdGF0ZUxpa2UsIGlzU3RyaW5nLCBrZXlzLCBtYXBDb250ZXh0LCBtYXBGaWx0ZXJWYWx1ZXMsIG1hcFZhbHVlcywgbWF0Y2hlc1N0YXRlLCBuZXN0ZWRQYXRoLCBub3JtYWxpemVUYXJnZXQsIHBhcnRpdGlvbiwgcGF0aCwgcGF0aFRvU3RhdGVWYWx1ZSwgcmVwb3J0VW5oYW5kbGVkRXhjZXB0aW9uT25JbnZvY2F0aW9uLCBzeW1ib2xPYnNlcnZhYmxlLCB0b0FycmF5LCB0b0FycmF5U3RyaWN0LCB0b0V2ZW50T2JqZWN0LCB0b0d1YXJkLCB0b0ludm9rZVNvdXJjZSwgdG9PYnNlcnZlciwgdG9TQ1hNTEV2ZW50LCB0b1N0YXRlUGF0aCwgdG9TdGF0ZVBhdGhzLCB0b1N0YXRlVmFsdWUsIHRvVHJhbnNpdGlvbkNvbmZpZ0FycmF5LCB1bmlxdWVJZCwgdXBkYXRlQ29udGV4dCwgdXBkYXRlSGlzdG9yeVN0YXRlcywgdXBkYXRlSGlzdG9yeVZhbHVlLCB3YXJuIH07IiwiaW1wb3J0IHsgX192YWx1ZXMgfSBmcm9tICcuL192aXJ0dWFsL190c2xpYi5qcyc7XG5pbXBvcnQgeyBrZXlzLCBtYXRjaGVzU3RhdGUgfSBmcm9tICcuL3V0aWxzLmpzJztcblxuZnVuY3Rpb24gbWFwU3RhdGUoc3RhdGVNYXAsIHN0YXRlSWQpIHtcbiAgdmFyIGVfMSwgX2E7XG5cbiAgdmFyIGZvdW5kU3RhdGVJZDtcblxuICB0cnkge1xuICAgIGZvciAodmFyIF9iID0gX192YWx1ZXMoa2V5cyhzdGF0ZU1hcCkpLCBfYyA9IF9iLm5leHQoKTsgIV9jLmRvbmU7IF9jID0gX2IubmV4dCgpKSB7XG4gICAgICB2YXIgbWFwcGVkU3RhdGVJZCA9IF9jLnZhbHVlO1xuXG4gICAgICBpZiAobWF0Y2hlc1N0YXRlKG1hcHBlZFN0YXRlSWQsIHN0YXRlSWQpICYmICghZm91bmRTdGF0ZUlkIHx8IHN0YXRlSWQubGVuZ3RoID4gZm91bmRTdGF0ZUlkLmxlbmd0aCkpIHtcbiAgICAgICAgZm91bmRTdGF0ZUlkID0gbWFwcGVkU3RhdGVJZDtcbiAgICAgIH1cbiAgICB9XG4gIH0gY2F0Y2ggKGVfMV8xKSB7XG4gICAgZV8xID0ge1xuICAgICAgZXJyb3I6IGVfMV8xXG4gICAgfTtcbiAgfSBmaW5hbGx5IHtcbiAgICB0cnkge1xuICAgICAgaWYgKF9jICYmICFfYy5kb25lICYmIChfYSA9IF9iLnJldHVybikpIF9hLmNhbGwoX2IpO1xuICAgIH0gZmluYWxseSB7XG4gICAgICBpZiAoZV8xKSB0aHJvdyBlXzEuZXJyb3I7XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIHN0YXRlTWFwW2ZvdW5kU3RhdGVJZF07XG59XG5cbmV4cG9ydCB7IG1hcFN0YXRlIH07IiwidmFyIEFjdGlvblR5cGVzO1xuXG4oZnVuY3Rpb24gKEFjdGlvblR5cGVzKSB7XG4gIEFjdGlvblR5cGVzW1wiU3RhcnRcIl0gPSBcInhzdGF0ZS5zdGFydFwiO1xuICBBY3Rpb25UeXBlc1tcIlN0b3BcIl0gPSBcInhzdGF0ZS5zdG9wXCI7XG4gIEFjdGlvblR5cGVzW1wiUmFpc2VcIl0gPSBcInhzdGF0ZS5yYWlzZVwiO1xuICBBY3Rpb25UeXBlc1tcIlNlbmRcIl0gPSBcInhzdGF0ZS5zZW5kXCI7XG4gIEFjdGlvblR5cGVzW1wiQ2FuY2VsXCJdID0gXCJ4c3RhdGUuY2FuY2VsXCI7XG4gIEFjdGlvblR5cGVzW1wiTnVsbEV2ZW50XCJdID0gXCJcIjtcbiAgQWN0aW9uVHlwZXNbXCJBc3NpZ25cIl0gPSBcInhzdGF0ZS5hc3NpZ25cIjtcbiAgQWN0aW9uVHlwZXNbXCJBZnRlclwiXSA9IFwieHN0YXRlLmFmdGVyXCI7XG4gIEFjdGlvblR5cGVzW1wiRG9uZVN0YXRlXCJdID0gXCJkb25lLnN0YXRlXCI7XG4gIEFjdGlvblR5cGVzW1wiRG9uZUludm9rZVwiXSA9IFwiZG9uZS5pbnZva2VcIjtcbiAgQWN0aW9uVHlwZXNbXCJMb2dcIl0gPSBcInhzdGF0ZS5sb2dcIjtcbiAgQWN0aW9uVHlwZXNbXCJJbml0XCJdID0gXCJ4c3RhdGUuaW5pdFwiO1xuICBBY3Rpb25UeXBlc1tcIkludm9rZVwiXSA9IFwieHN0YXRlLmludm9rZVwiO1xuICBBY3Rpb25UeXBlc1tcIkVycm9yRXhlY3V0aW9uXCJdID0gXCJlcnJvci5leGVjdXRpb25cIjtcbiAgQWN0aW9uVHlwZXNbXCJFcnJvckNvbW11bmljYXRpb25cIl0gPSBcImVycm9yLmNvbW11bmljYXRpb25cIjtcbiAgQWN0aW9uVHlwZXNbXCJFcnJvclBsYXRmb3JtXCJdID0gXCJlcnJvci5wbGF0Zm9ybVwiO1xuICBBY3Rpb25UeXBlc1tcIkVycm9yQ3VzdG9tXCJdID0gXCJ4c3RhdGUuZXJyb3JcIjtcbiAgQWN0aW9uVHlwZXNbXCJVcGRhdGVcIl0gPSBcInhzdGF0ZS51cGRhdGVcIjtcbiAgQWN0aW9uVHlwZXNbXCJQdXJlXCJdID0gXCJ4c3RhdGUucHVyZVwiO1xuICBBY3Rpb25UeXBlc1tcIkNob29zZVwiXSA9IFwieHN0YXRlLmNob29zZVwiO1xufSkoQWN0aW9uVHlwZXMgfHwgKEFjdGlvblR5cGVzID0ge30pKTtcblxudmFyIFNwZWNpYWxUYXJnZXRzO1xuXG4oZnVuY3Rpb24gKFNwZWNpYWxUYXJnZXRzKSB7XG4gIFNwZWNpYWxUYXJnZXRzW1wiUGFyZW50XCJdID0gXCIjX3BhcmVudFwiO1xuICBTcGVjaWFsVGFyZ2V0c1tcIkludGVybmFsXCJdID0gXCIjX2ludGVybmFsXCI7XG59KShTcGVjaWFsVGFyZ2V0cyB8fCAoU3BlY2lhbFRhcmdldHMgPSB7fSkpO1xuXG5leHBvcnQgeyBBY3Rpb25UeXBlcywgU3BlY2lhbFRhcmdldHMgfTsiLCJpbXBvcnQgeyBBY3Rpb25UeXBlcyB9IGZyb20gJy4vdHlwZXMuanMnOyAvLyB4c3RhdGUtc3BlY2lmaWMgYWN0aW9uIHR5cGVzXG5cbnZhciBzdGFydCA9IEFjdGlvblR5cGVzLlN0YXJ0O1xudmFyIHN0b3AgPSBBY3Rpb25UeXBlcy5TdG9wO1xudmFyIHJhaXNlID0gQWN0aW9uVHlwZXMuUmFpc2U7XG52YXIgc2VuZCA9IEFjdGlvblR5cGVzLlNlbmQ7XG52YXIgY2FuY2VsID0gQWN0aW9uVHlwZXMuQ2FuY2VsO1xudmFyIG51bGxFdmVudCA9IEFjdGlvblR5cGVzLk51bGxFdmVudDtcbnZhciBhc3NpZ24gPSBBY3Rpb25UeXBlcy5Bc3NpZ247XG52YXIgYWZ0ZXIgPSBBY3Rpb25UeXBlcy5BZnRlcjtcbnZhciBkb25lU3RhdGUgPSBBY3Rpb25UeXBlcy5Eb25lU3RhdGU7XG52YXIgbG9nID0gQWN0aW9uVHlwZXMuTG9nO1xudmFyIGluaXQgPSBBY3Rpb25UeXBlcy5Jbml0O1xudmFyIGludm9rZSA9IEFjdGlvblR5cGVzLkludm9rZTtcbnZhciBlcnJvckV4ZWN1dGlvbiA9IEFjdGlvblR5cGVzLkVycm9yRXhlY3V0aW9uO1xudmFyIGVycm9yUGxhdGZvcm0gPSBBY3Rpb25UeXBlcy5FcnJvclBsYXRmb3JtO1xudmFyIGVycm9yID0gQWN0aW9uVHlwZXMuRXJyb3JDdXN0b207XG52YXIgdXBkYXRlID0gQWN0aW9uVHlwZXMuVXBkYXRlO1xudmFyIGNob29zZSA9IEFjdGlvblR5cGVzLkNob29zZTtcbnZhciBwdXJlID0gQWN0aW9uVHlwZXMuUHVyZTtcbmV4cG9ydCB7IGFmdGVyLCBhc3NpZ24sIGNhbmNlbCwgY2hvb3NlLCBkb25lU3RhdGUsIGVycm9yLCBlcnJvckV4ZWN1dGlvbiwgZXJyb3JQbGF0Zm9ybSwgaW5pdCwgaW52b2tlLCBsb2csIG51bGxFdmVudCwgcHVyZSwgcmFpc2UsIHNlbmQsIHN0YXJ0LCBzdG9wLCB1cGRhdGUgfTsiLCJpbXBvcnQgeyBfX2Fzc2lnbiwgX19yZWFkIH0gZnJvbSAnLi9fdmlydHVhbC9fdHNsaWIuanMnO1xuaW1wb3J0IHsgSVNfUFJPRFVDVElPTiB9IGZyb20gJy4vZW52aXJvbm1lbnQuanMnO1xuaW1wb3J0IHsgdG9TQ1hNTEV2ZW50LCBpc0Z1bmN0aW9uLCB0b0V2ZW50T2JqZWN0LCBnZXRFdmVudFR5cGUsIGlzU3RyaW5nLCBwYXJ0aXRpb24sIHVwZGF0ZUNvbnRleHQsIGZsYXR0ZW4sIHRvQXJyYXksIHRvR3VhcmQsIGV2YWx1YXRlR3VhcmQsIHdhcm4sIGlzQXJyYXkgfSBmcm9tICcuL3V0aWxzLmpzJztcbmltcG9ydCB7IFNwZWNpYWxUYXJnZXRzLCBBY3Rpb25UeXBlcyB9IGZyb20gJy4vdHlwZXMuanMnO1xuaW1wb3J0IHsgc2VuZCBhcyBzZW5kJDEsIHVwZGF0ZSwgYXNzaWduIGFzIGFzc2lnbiQxLCBpbml0LCByYWlzZSBhcyByYWlzZSQxLCBsb2cgYXMgbG9nJDEsIGNhbmNlbCBhcyBjYW5jZWwkMSwgZXJyb3IgYXMgZXJyb3IkMSwgc3RvcCBhcyBzdG9wJDEsIHB1cmUgYXMgcHVyZSQxLCBjaG9vc2UgYXMgY2hvb3NlJDEgfSBmcm9tICcuL2FjdGlvblR5cGVzLmpzJztcbnZhciBpbml0RXZlbnQgPSAvKiNfX1BVUkVfXyovdG9TQ1hNTEV2ZW50KHtcbiAgdHlwZTogaW5pdFxufSk7XG5cbmZ1bmN0aW9uIGdldEFjdGlvbkZ1bmN0aW9uKGFjdGlvblR5cGUsIGFjdGlvbkZ1bmN0aW9uTWFwKSB7XG4gIHJldHVybiBhY3Rpb25GdW5jdGlvbk1hcCA/IGFjdGlvbkZ1bmN0aW9uTWFwW2FjdGlvblR5cGVdIHx8IHVuZGVmaW5lZCA6IHVuZGVmaW5lZDtcbn1cblxuZnVuY3Rpb24gdG9BY3Rpb25PYmplY3QoYWN0aW9uLCBhY3Rpb25GdW5jdGlvbk1hcCkge1xuICB2YXIgYWN0aW9uT2JqZWN0O1xuXG4gIGlmIChpc1N0cmluZyhhY3Rpb24pIHx8IHR5cGVvZiBhY3Rpb24gPT09ICdudW1iZXInKSB7XG4gICAgdmFyIGV4ZWMgPSBnZXRBY3Rpb25GdW5jdGlvbihhY3Rpb24sIGFjdGlvbkZ1bmN0aW9uTWFwKTtcblxuICAgIGlmIChpc0Z1bmN0aW9uKGV4ZWMpKSB7XG4gICAgICBhY3Rpb25PYmplY3QgPSB7XG4gICAgICAgIHR5cGU6IGFjdGlvbixcbiAgICAgICAgZXhlYzogZXhlY1xuICAgICAgfTtcbiAgICB9IGVsc2UgaWYgKGV4ZWMpIHtcbiAgICAgIGFjdGlvbk9iamVjdCA9IGV4ZWM7XG4gICAgfSBlbHNlIHtcbiAgICAgIGFjdGlvbk9iamVjdCA9IHtcbiAgICAgICAgdHlwZTogYWN0aW9uLFxuICAgICAgICBleGVjOiB1bmRlZmluZWRcbiAgICAgIH07XG4gICAgfVxuICB9IGVsc2UgaWYgKGlzRnVuY3Rpb24oYWN0aW9uKSkge1xuICAgIGFjdGlvbk9iamVjdCA9IHtcbiAgICAgIC8vIENvbnZlcnQgYWN0aW9uIHRvIHN0cmluZyBpZiB1bm5hbWVkXG4gICAgICB0eXBlOiBhY3Rpb24ubmFtZSB8fCBhY3Rpb24udG9TdHJpbmcoKSxcbiAgICAgIGV4ZWM6IGFjdGlvblxuICAgIH07XG4gIH0gZWxzZSB7XG4gICAgdmFyIGV4ZWMgPSBnZXRBY3Rpb25GdW5jdGlvbihhY3Rpb24udHlwZSwgYWN0aW9uRnVuY3Rpb25NYXApO1xuXG4gICAgaWYgKGlzRnVuY3Rpb24oZXhlYykpIHtcbiAgICAgIGFjdGlvbk9iamVjdCA9IF9fYXNzaWduKF9fYXNzaWduKHt9LCBhY3Rpb24pLCB7XG4gICAgICAgIGV4ZWM6IGV4ZWNcbiAgICAgIH0pO1xuICAgIH0gZWxzZSBpZiAoZXhlYykge1xuICAgICAgdmFyIGFjdGlvblR5cGUgPSBleGVjLnR5cGUgfHwgYWN0aW9uLnR5cGU7XG4gICAgICBhY3Rpb25PYmplY3QgPSBfX2Fzc2lnbihfX2Fzc2lnbihfX2Fzc2lnbih7fSwgZXhlYyksIGFjdGlvbiksIHtcbiAgICAgICAgdHlwZTogYWN0aW9uVHlwZVxuICAgICAgfSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGFjdGlvbk9iamVjdCA9IGFjdGlvbjtcbiAgICB9XG4gIH1cblxuICBPYmplY3QuZGVmaW5lUHJvcGVydHkoYWN0aW9uT2JqZWN0LCAndG9TdHJpbmcnLCB7XG4gICAgdmFsdWU6IGZ1bmN0aW9uICgpIHtcbiAgICAgIHJldHVybiBhY3Rpb25PYmplY3QudHlwZTtcbiAgICB9LFxuICAgIGVudW1lcmFibGU6IGZhbHNlLFxuICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZVxuICB9KTtcbiAgcmV0dXJuIGFjdGlvbk9iamVjdDtcbn1cblxudmFyIHRvQWN0aW9uT2JqZWN0cyA9IGZ1bmN0aW9uIChhY3Rpb24sIGFjdGlvbkZ1bmN0aW9uTWFwKSB7XG4gIGlmICghYWN0aW9uKSB7XG4gICAgcmV0dXJuIFtdO1xuICB9XG5cbiAgdmFyIGFjdGlvbnMgPSBpc0FycmF5KGFjdGlvbikgPyBhY3Rpb24gOiBbYWN0aW9uXTtcbiAgcmV0dXJuIGFjdGlvbnMubWFwKGZ1bmN0aW9uIChzdWJBY3Rpb24pIHtcbiAgICByZXR1cm4gdG9BY3Rpb25PYmplY3Qoc3ViQWN0aW9uLCBhY3Rpb25GdW5jdGlvbk1hcCk7XG4gIH0pO1xufTtcblxuZnVuY3Rpb24gdG9BY3Rpdml0eURlZmluaXRpb24oYWN0aW9uKSB7XG4gIHZhciBhY3Rpb25PYmplY3QgPSB0b0FjdGlvbk9iamVjdChhY3Rpb24pO1xuICByZXR1cm4gX19hc3NpZ24oX19hc3NpZ24oe1xuICAgIGlkOiBpc1N0cmluZyhhY3Rpb24pID8gYWN0aW9uIDogYWN0aW9uT2JqZWN0LmlkXG4gIH0sIGFjdGlvbk9iamVjdCksIHtcbiAgICB0eXBlOiBhY3Rpb25PYmplY3QudHlwZVxuICB9KTtcbn1cbi8qKlxyXG4gKiBSYWlzZXMgYW4gZXZlbnQuIFRoaXMgcGxhY2VzIHRoZSBldmVudCBpbiB0aGUgaW50ZXJuYWwgZXZlbnQgcXVldWUsIHNvIHRoYXRcclxuICogdGhlIGV2ZW50IGlzIGltbWVkaWF0ZWx5IGNvbnN1bWVkIGJ5IHRoZSBtYWNoaW5lIGluIHRoZSBjdXJyZW50IHN0ZXAuXHJcbiAqXHJcbiAqIEBwYXJhbSBldmVudFR5cGUgVGhlIGV2ZW50IHRvIHJhaXNlLlxyXG4gKi9cblxuXG5mdW5jdGlvbiByYWlzZShldmVudCkge1xuICBpZiAoIWlzU3RyaW5nKGV2ZW50KSkge1xuICAgIHJldHVybiBzZW5kKGV2ZW50LCB7XG4gICAgICB0bzogU3BlY2lhbFRhcmdldHMuSW50ZXJuYWxcbiAgICB9KTtcbiAgfVxuXG4gIHJldHVybiB7XG4gICAgdHlwZTogcmFpc2UkMSxcbiAgICBldmVudDogZXZlbnRcbiAgfTtcbn1cblxuZnVuY3Rpb24gcmVzb2x2ZVJhaXNlKGFjdGlvbikge1xuICByZXR1cm4ge1xuICAgIHR5cGU6IHJhaXNlJDEsXG4gICAgX2V2ZW50OiB0b1NDWE1MRXZlbnQoYWN0aW9uLmV2ZW50KVxuICB9O1xufVxuLyoqXHJcbiAqIFNlbmRzIGFuIGV2ZW50LiBUaGlzIHJldHVybnMgYW4gYWN0aW9uIHRoYXQgd2lsbCBiZSByZWFkIGJ5IGFuIGludGVycHJldGVyIHRvXHJcbiAqIHNlbmQgdGhlIGV2ZW50IGluIHRoZSBuZXh0IHN0ZXAsIGFmdGVyIHRoZSBjdXJyZW50IHN0ZXAgaXMgZmluaXNoZWQgZXhlY3V0aW5nLlxyXG4gKlxyXG4gKiBAcGFyYW0gZXZlbnQgVGhlIGV2ZW50IHRvIHNlbmQuXHJcbiAqIEBwYXJhbSBvcHRpb25zIE9wdGlvbnMgdG8gcGFzcyBpbnRvIHRoZSBzZW5kIGV2ZW50OlxyXG4gKiAgLSBgaWRgIC0gVGhlIHVuaXF1ZSBzZW5kIGV2ZW50IGlkZW50aWZpZXIgKHVzZWQgd2l0aCBgY2FuY2VsKClgKS5cclxuICogIC0gYGRlbGF5YCAtIFRoZSBudW1iZXIgb2YgbWlsbGlzZWNvbmRzIHRvIGRlbGF5IHRoZSBzZW5kaW5nIG9mIHRoZSBldmVudC5cclxuICogIC0gYHRvYCAtIFRoZSB0YXJnZXQgb2YgdGhpcyBldmVudCAoYnkgZGVmYXVsdCwgdGhlIG1hY2hpbmUgdGhlIGV2ZW50IHdhcyBzZW50IGZyb20pLlxyXG4gKi9cblxuXG5mdW5jdGlvbiBzZW5kKGV2ZW50LCBvcHRpb25zKSB7XG4gIHJldHVybiB7XG4gICAgdG86IG9wdGlvbnMgPyBvcHRpb25zLnRvIDogdW5kZWZpbmVkLFxuICAgIHR5cGU6IHNlbmQkMSxcbiAgICBldmVudDogaXNGdW5jdGlvbihldmVudCkgPyBldmVudCA6IHRvRXZlbnRPYmplY3QoZXZlbnQpLFxuICAgIGRlbGF5OiBvcHRpb25zID8gb3B0aW9ucy5kZWxheSA6IHVuZGVmaW5lZCxcbiAgICBpZDogb3B0aW9ucyAmJiBvcHRpb25zLmlkICE9PSB1bmRlZmluZWQgPyBvcHRpb25zLmlkIDogaXNGdW5jdGlvbihldmVudCkgPyBldmVudC5uYW1lIDogZ2V0RXZlbnRUeXBlKGV2ZW50KVxuICB9O1xufVxuXG5mdW5jdGlvbiByZXNvbHZlU2VuZChhY3Rpb24sIGN0eCwgX2V2ZW50LCBkZWxheXNNYXApIHtcbiAgdmFyIG1ldGEgPSB7XG4gICAgX2V2ZW50OiBfZXZlbnRcbiAgfTsgLy8gVE9ETzogaGVscGVyIGZ1bmN0aW9uIGZvciByZXNvbHZpbmcgRXhwclxuXG4gIHZhciByZXNvbHZlZEV2ZW50ID0gdG9TQ1hNTEV2ZW50KGlzRnVuY3Rpb24oYWN0aW9uLmV2ZW50KSA/IGFjdGlvbi5ldmVudChjdHgsIF9ldmVudC5kYXRhLCBtZXRhKSA6IGFjdGlvbi5ldmVudCk7XG4gIHZhciByZXNvbHZlZERlbGF5O1xuXG4gIGlmIChpc1N0cmluZyhhY3Rpb24uZGVsYXkpKSB7XG4gICAgdmFyIGNvbmZpZ0RlbGF5ID0gZGVsYXlzTWFwICYmIGRlbGF5c01hcFthY3Rpb24uZGVsYXldO1xuICAgIHJlc29sdmVkRGVsYXkgPSBpc0Z1bmN0aW9uKGNvbmZpZ0RlbGF5KSA/IGNvbmZpZ0RlbGF5KGN0eCwgX2V2ZW50LmRhdGEsIG1ldGEpIDogY29uZmlnRGVsYXk7XG4gIH0gZWxzZSB7XG4gICAgcmVzb2x2ZWREZWxheSA9IGlzRnVuY3Rpb24oYWN0aW9uLmRlbGF5KSA/IGFjdGlvbi5kZWxheShjdHgsIF9ldmVudC5kYXRhLCBtZXRhKSA6IGFjdGlvbi5kZWxheTtcbiAgfVxuXG4gIHZhciByZXNvbHZlZFRhcmdldCA9IGlzRnVuY3Rpb24oYWN0aW9uLnRvKSA/IGFjdGlvbi50byhjdHgsIF9ldmVudC5kYXRhLCBtZXRhKSA6IGFjdGlvbi50bztcbiAgcmV0dXJuIF9fYXNzaWduKF9fYXNzaWduKHt9LCBhY3Rpb24pLCB7XG4gICAgdG86IHJlc29sdmVkVGFyZ2V0LFxuICAgIF9ldmVudDogcmVzb2x2ZWRFdmVudCxcbiAgICBldmVudDogcmVzb2x2ZWRFdmVudC5kYXRhLFxuICAgIGRlbGF5OiByZXNvbHZlZERlbGF5XG4gIH0pO1xufVxuLyoqXHJcbiAqIFNlbmRzIGFuIGV2ZW50IHRvIHRoaXMgbWFjaGluZSdzIHBhcmVudC5cclxuICpcclxuICogQHBhcmFtIGV2ZW50IFRoZSBldmVudCB0byBzZW5kIHRvIHRoZSBwYXJlbnQgbWFjaGluZS5cclxuICogQHBhcmFtIG9wdGlvbnMgT3B0aW9ucyB0byBwYXNzIGludG8gdGhlIHNlbmQgZXZlbnQuXHJcbiAqL1xuXG5cbmZ1bmN0aW9uIHNlbmRQYXJlbnQoZXZlbnQsIG9wdGlvbnMpIHtcbiAgcmV0dXJuIHNlbmQoZXZlbnQsIF9fYXNzaWduKF9fYXNzaWduKHt9LCBvcHRpb25zKSwge1xuICAgIHRvOiBTcGVjaWFsVGFyZ2V0cy5QYXJlbnRcbiAgfSkpO1xufVxuLyoqXHJcbiAqIFNlbmRzIGFuIHVwZGF0ZSBldmVudCB0byB0aGlzIG1hY2hpbmUncyBwYXJlbnQuXHJcbiAqL1xuXG5cbmZ1bmN0aW9uIHNlbmRVcGRhdGUoKSB7XG4gIHJldHVybiBzZW5kUGFyZW50KHVwZGF0ZSk7XG59XG4vKipcclxuICogU2VuZHMgYW4gZXZlbnQgYmFjayB0byB0aGUgc2VuZGVyIG9mIHRoZSBvcmlnaW5hbCBldmVudC5cclxuICpcclxuICogQHBhcmFtIGV2ZW50IFRoZSBldmVudCB0byBzZW5kIGJhY2sgdG8gdGhlIHNlbmRlclxyXG4gKiBAcGFyYW0gb3B0aW9ucyBPcHRpb25zIHRvIHBhc3MgaW50byB0aGUgc2VuZCBldmVudFxyXG4gKi9cblxuXG5mdW5jdGlvbiByZXNwb25kKGV2ZW50LCBvcHRpb25zKSB7XG4gIHJldHVybiBzZW5kKGV2ZW50LCBfX2Fzc2lnbihfX2Fzc2lnbih7fSwgb3B0aW9ucyksIHtcbiAgICB0bzogZnVuY3Rpb24gKF8sIF9fLCBfYSkge1xuICAgICAgdmFyIF9ldmVudCA9IF9hLl9ldmVudDtcbiAgICAgIHJldHVybiBfZXZlbnQub3JpZ2luOyAvLyBUT0RPOiBoYW5kbGUgd2hlbiBfZXZlbnQub3JpZ2luIGlzIHVuZGVmaW5lZFxuICAgIH1cbiAgfSkpO1xufVxuXG52YXIgZGVmYXVsdExvZ0V4cHIgPSBmdW5jdGlvbiAoY29udGV4dCwgZXZlbnQpIHtcbiAgcmV0dXJuIHtcbiAgICBjb250ZXh0OiBjb250ZXh0LFxuICAgIGV2ZW50OiBldmVudFxuICB9O1xufTtcbi8qKlxyXG4gKlxyXG4gKiBAcGFyYW0gZXhwciBUaGUgZXhwcmVzc2lvbiBmdW5jdGlvbiB0byBldmFsdWF0ZSB3aGljaCB3aWxsIGJlIGxvZ2dlZC5cclxuICogIFRha2VzIGluIDIgYXJndW1lbnRzOlxyXG4gKiAgLSBgY3R4YCAtIHRoZSBjdXJyZW50IHN0YXRlIGNvbnRleHRcclxuICogIC0gYGV2ZW50YCAtIHRoZSBldmVudCB0aGF0IGNhdXNlZCB0aGlzIGFjdGlvbiB0byBiZSBleGVjdXRlZC5cclxuICogQHBhcmFtIGxhYmVsIFRoZSBsYWJlbCB0byBnaXZlIHRvIHRoZSBsb2dnZWQgZXhwcmVzc2lvbi5cclxuICovXG5cblxuZnVuY3Rpb24gbG9nKGV4cHIsIGxhYmVsKSB7XG4gIGlmIChleHByID09PSB2b2lkIDApIHtcbiAgICBleHByID0gZGVmYXVsdExvZ0V4cHI7XG4gIH1cblxuICByZXR1cm4ge1xuICAgIHR5cGU6IGxvZyQxLFxuICAgIGxhYmVsOiBsYWJlbCxcbiAgICBleHByOiBleHByXG4gIH07XG59XG5cbnZhciByZXNvbHZlTG9nID0gZnVuY3Rpb24gKGFjdGlvbiwgY3R4LCBfZXZlbnQpIHtcbiAgcmV0dXJuIF9fYXNzaWduKF9fYXNzaWduKHt9LCBhY3Rpb24pLCB7XG4gICAgdmFsdWU6IGlzU3RyaW5nKGFjdGlvbi5leHByKSA/IGFjdGlvbi5leHByIDogYWN0aW9uLmV4cHIoY3R4LCBfZXZlbnQuZGF0YSwge1xuICAgICAgX2V2ZW50OiBfZXZlbnRcbiAgICB9KVxuICB9KTtcbn07XG4vKipcclxuICogQ2FuY2VscyBhbiBpbi1mbGlnaHQgYHNlbmQoLi4uKWAgYWN0aW9uLiBBIGNhbmNlbGVkIHNlbnQgYWN0aW9uIHdpbGwgbm90XHJcbiAqIGJlIGV4ZWN1dGVkLCBub3Igd2lsbCBpdHMgZXZlbnQgYmUgc2VudCwgdW5sZXNzIGl0IGhhcyBhbHJlYWR5IGJlZW4gc2VudFxyXG4gKiAoZS5nLiwgaWYgYGNhbmNlbCguLi4pYCBpcyBjYWxsZWQgYWZ0ZXIgdGhlIGBzZW5kKC4uLilgIGFjdGlvbidzIGBkZWxheWApLlxyXG4gKlxyXG4gKiBAcGFyYW0gc2VuZElkIFRoZSBgaWRgIG9mIHRoZSBgc2VuZCguLi4pYCBhY3Rpb24gdG8gY2FuY2VsLlxyXG4gKi9cblxuXG52YXIgY2FuY2VsID0gZnVuY3Rpb24gKHNlbmRJZCkge1xuICByZXR1cm4ge1xuICAgIHR5cGU6IGNhbmNlbCQxLFxuICAgIHNlbmRJZDogc2VuZElkXG4gIH07XG59O1xuLyoqXHJcbiAqIFN0YXJ0cyBhbiBhY3Rpdml0eS5cclxuICpcclxuICogQHBhcmFtIGFjdGl2aXR5IFRoZSBhY3Rpdml0eSB0byBzdGFydC5cclxuICovXG5cblxuZnVuY3Rpb24gc3RhcnQoYWN0aXZpdHkpIHtcbiAgdmFyIGFjdGl2aXR5RGVmID0gdG9BY3Rpdml0eURlZmluaXRpb24oYWN0aXZpdHkpO1xuICByZXR1cm4ge1xuICAgIHR5cGU6IEFjdGlvblR5cGVzLlN0YXJ0LFxuICAgIGFjdGl2aXR5OiBhY3Rpdml0eURlZixcbiAgICBleGVjOiB1bmRlZmluZWRcbiAgfTtcbn1cbi8qKlxyXG4gKiBTdG9wcyBhbiBhY3Rpdml0eS5cclxuICpcclxuICogQHBhcmFtIGFjdG9yUmVmIFRoZSBhY3Rpdml0eSB0byBzdG9wLlxyXG4gKi9cblxuXG5mdW5jdGlvbiBzdG9wKGFjdG9yUmVmKSB7XG4gIHZhciBhY3Rpdml0eSA9IGlzRnVuY3Rpb24oYWN0b3JSZWYpID8gYWN0b3JSZWYgOiB0b0FjdGl2aXR5RGVmaW5pdGlvbihhY3RvclJlZik7XG4gIHJldHVybiB7XG4gICAgdHlwZTogQWN0aW9uVHlwZXMuU3RvcCxcbiAgICBhY3Rpdml0eTogYWN0aXZpdHksXG4gICAgZXhlYzogdW5kZWZpbmVkXG4gIH07XG59XG5cbmZ1bmN0aW9uIHJlc29sdmVTdG9wKGFjdGlvbiwgY29udGV4dCwgX2V2ZW50KSB7XG4gIHZhciBhY3RvclJlZk9yU3RyaW5nID0gaXNGdW5jdGlvbihhY3Rpb24uYWN0aXZpdHkpID8gYWN0aW9uLmFjdGl2aXR5KGNvbnRleHQsIF9ldmVudC5kYXRhKSA6IGFjdGlvbi5hY3Rpdml0eTtcbiAgdmFyIHJlc29sdmVkQWN0b3JSZWYgPSB0eXBlb2YgYWN0b3JSZWZPclN0cmluZyA9PT0gJ3N0cmluZycgPyB7XG4gICAgaWQ6IGFjdG9yUmVmT3JTdHJpbmdcbiAgfSA6IGFjdG9yUmVmT3JTdHJpbmc7XG4gIHZhciBhY3Rpb25PYmplY3QgPSB7XG4gICAgdHlwZTogQWN0aW9uVHlwZXMuU3RvcCxcbiAgICBhY3Rpdml0eTogcmVzb2x2ZWRBY3RvclJlZlxuICB9O1xuICByZXR1cm4gYWN0aW9uT2JqZWN0O1xufVxuLyoqXHJcbiAqIFVwZGF0ZXMgdGhlIGN1cnJlbnQgY29udGV4dCBvZiB0aGUgbWFjaGluZS5cclxuICpcclxuICogQHBhcmFtIGFzc2lnbm1lbnQgQW4gb2JqZWN0IHRoYXQgcmVwcmVzZW50cyB0aGUgcGFydGlhbCBjb250ZXh0IHRvIHVwZGF0ZS5cclxuICovXG5cblxudmFyIGFzc2lnbiA9IGZ1bmN0aW9uIChhc3NpZ25tZW50KSB7XG4gIHJldHVybiB7XG4gICAgdHlwZTogYXNzaWduJDEsXG4gICAgYXNzaWdubWVudDogYXNzaWdubWVudFxuICB9O1xufTtcbi8qKlxyXG4gKiBSZXR1cm5zIGFuIGV2ZW50IHR5cGUgdGhhdCByZXByZXNlbnRzIGFuIGltcGxpY2l0IGV2ZW50IHRoYXRcclxuICogaXMgc2VudCBhZnRlciB0aGUgc3BlY2lmaWVkIGBkZWxheWAuXHJcbiAqXHJcbiAqIEBwYXJhbSBkZWxheVJlZiBUaGUgZGVsYXkgaW4gbWlsbGlzZWNvbmRzXHJcbiAqIEBwYXJhbSBpZCBUaGUgc3RhdGUgbm9kZSBJRCB3aGVyZSB0aGlzIGV2ZW50IGlzIGhhbmRsZWRcclxuICovXG5cblxuZnVuY3Rpb24gYWZ0ZXIoZGVsYXlSZWYsIGlkKSB7XG4gIHZhciBpZFN1ZmZpeCA9IGlkID8gXCIjXCIgKyBpZCA6ICcnO1xuICByZXR1cm4gQWN0aW9uVHlwZXMuQWZ0ZXIgKyBcIihcIiArIGRlbGF5UmVmICsgXCIpXCIgKyBpZFN1ZmZpeDtcbn1cbi8qKlxyXG4gKiBSZXR1cm5zIGFuIGV2ZW50IHRoYXQgcmVwcmVzZW50cyB0aGF0IGEgZmluYWwgc3RhdGUgbm9kZVxyXG4gKiBoYXMgYmVlbiByZWFjaGVkIGluIHRoZSBwYXJlbnQgc3RhdGUgbm9kZS5cclxuICpcclxuICogQHBhcmFtIGlkIFRoZSBmaW5hbCBzdGF0ZSBub2RlJ3MgcGFyZW50IHN0YXRlIG5vZGUgYGlkYFxyXG4gKiBAcGFyYW0gZGF0YSBUaGUgZGF0YSB0byBwYXNzIGludG8gdGhlIGV2ZW50XHJcbiAqL1xuXG5cbmZ1bmN0aW9uIGRvbmUoaWQsIGRhdGEpIHtcbiAgdmFyIHR5cGUgPSBBY3Rpb25UeXBlcy5Eb25lU3RhdGUgKyBcIi5cIiArIGlkO1xuICB2YXIgZXZlbnRPYmplY3QgPSB7XG4gICAgdHlwZTogdHlwZSxcbiAgICBkYXRhOiBkYXRhXG4gIH07XG5cbiAgZXZlbnRPYmplY3QudG9TdHJpbmcgPSBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIHR5cGU7XG4gIH07XG5cbiAgcmV0dXJuIGV2ZW50T2JqZWN0O1xufVxuLyoqXHJcbiAqIFJldHVybnMgYW4gZXZlbnQgdGhhdCByZXByZXNlbnRzIHRoYXQgYW4gaW52b2tlZCBzZXJ2aWNlIGhhcyB0ZXJtaW5hdGVkLlxyXG4gKlxyXG4gKiBBbiBpbnZva2VkIHNlcnZpY2UgaXMgdGVybWluYXRlZCB3aGVuIGl0IGhhcyByZWFjaGVkIGEgdG9wLWxldmVsIGZpbmFsIHN0YXRlIG5vZGUsXHJcbiAqIGJ1dCBub3Qgd2hlbiBpdCBpcyBjYW5jZWxlZC5cclxuICpcclxuICogQHBhcmFtIGlkIFRoZSBmaW5hbCBzdGF0ZSBub2RlIElEXHJcbiAqIEBwYXJhbSBkYXRhIFRoZSBkYXRhIHRvIHBhc3MgaW50byB0aGUgZXZlbnRcclxuICovXG5cblxuZnVuY3Rpb24gZG9uZUludm9rZShpZCwgZGF0YSkge1xuICB2YXIgdHlwZSA9IEFjdGlvblR5cGVzLkRvbmVJbnZva2UgKyBcIi5cIiArIGlkO1xuICB2YXIgZXZlbnRPYmplY3QgPSB7XG4gICAgdHlwZTogdHlwZSxcbiAgICBkYXRhOiBkYXRhXG4gIH07XG5cbiAgZXZlbnRPYmplY3QudG9TdHJpbmcgPSBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIHR5cGU7XG4gIH07XG5cbiAgcmV0dXJuIGV2ZW50T2JqZWN0O1xufVxuXG5mdW5jdGlvbiBlcnJvcihpZCwgZGF0YSkge1xuICB2YXIgdHlwZSA9IEFjdGlvblR5cGVzLkVycm9yUGxhdGZvcm0gKyBcIi5cIiArIGlkO1xuICB2YXIgZXZlbnRPYmplY3QgPSB7XG4gICAgdHlwZTogdHlwZSxcbiAgICBkYXRhOiBkYXRhXG4gIH07XG5cbiAgZXZlbnRPYmplY3QudG9TdHJpbmcgPSBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIHR5cGU7XG4gIH07XG5cbiAgcmV0dXJuIGV2ZW50T2JqZWN0O1xufVxuXG5mdW5jdGlvbiBwdXJlKGdldEFjdGlvbnMpIHtcbiAgcmV0dXJuIHtcbiAgICB0eXBlOiBBY3Rpb25UeXBlcy5QdXJlLFxuICAgIGdldDogZ2V0QWN0aW9uc1xuICB9O1xufVxuLyoqXHJcbiAqIEZvcndhcmRzIChzZW5kcykgYW4gZXZlbnQgdG8gYSBzcGVjaWZpZWQgc2VydmljZS5cclxuICpcclxuICogQHBhcmFtIHRhcmdldCBUaGUgdGFyZ2V0IHNlcnZpY2UgdG8gZm9yd2FyZCB0aGUgZXZlbnQgdG8uXHJcbiAqIEBwYXJhbSBvcHRpb25zIE9wdGlvbnMgdG8gcGFzcyBpbnRvIHRoZSBzZW5kIGFjdGlvbiBjcmVhdG9yLlxyXG4gKi9cblxuXG5mdW5jdGlvbiBmb3J3YXJkVG8odGFyZ2V0LCBvcHRpb25zKSB7XG4gIHJldHVybiBzZW5kKGZ1bmN0aW9uIChfLCBldmVudCkge1xuICAgIHJldHVybiBldmVudDtcbiAgfSwgX19hc3NpZ24oX19hc3NpZ24oe30sIG9wdGlvbnMpLCB7XG4gICAgdG86IHRhcmdldFxuICB9KSk7XG59XG4vKipcclxuICogRXNjYWxhdGVzIGFuIGVycm9yIGJ5IHNlbmRpbmcgaXQgYXMgYW4gZXZlbnQgdG8gdGhpcyBtYWNoaW5lJ3MgcGFyZW50LlxyXG4gKlxyXG4gKiBAcGFyYW0gZXJyb3JEYXRhIFRoZSBlcnJvciBkYXRhIHRvIHNlbmQsIG9yIHRoZSBleHByZXNzaW9uIGZ1bmN0aW9uIHRoYXRcclxuICogdGFrZXMgaW4gdGhlIGBjb250ZXh0YCwgYGV2ZW50YCwgYW5kIGBtZXRhYCwgYW5kIHJldHVybnMgdGhlIGVycm9yIGRhdGEgdG8gc2VuZC5cclxuICogQHBhcmFtIG9wdGlvbnMgT3B0aW9ucyB0byBwYXNzIGludG8gdGhlIHNlbmQgYWN0aW9uIGNyZWF0b3IuXHJcbiAqL1xuXG5cbmZ1bmN0aW9uIGVzY2FsYXRlKGVycm9yRGF0YSwgb3B0aW9ucykge1xuICByZXR1cm4gc2VuZFBhcmVudChmdW5jdGlvbiAoY29udGV4dCwgZXZlbnQsIG1ldGEpIHtcbiAgICByZXR1cm4ge1xuICAgICAgdHlwZTogZXJyb3IkMSxcbiAgICAgIGRhdGE6IGlzRnVuY3Rpb24oZXJyb3JEYXRhKSA/IGVycm9yRGF0YShjb250ZXh0LCBldmVudCwgbWV0YSkgOiBlcnJvckRhdGFcbiAgICB9O1xuICB9LCBfX2Fzc2lnbihfX2Fzc2lnbih7fSwgb3B0aW9ucyksIHtcbiAgICB0bzogU3BlY2lhbFRhcmdldHMuUGFyZW50XG4gIH0pKTtcbn1cblxuZnVuY3Rpb24gY2hvb3NlKGNvbmRzKSB7XG4gIHJldHVybiB7XG4gICAgdHlwZTogQWN0aW9uVHlwZXMuQ2hvb3NlLFxuICAgIGNvbmRzOiBjb25kc1xuICB9O1xufVxuXG5mdW5jdGlvbiByZXNvbHZlQWN0aW9ucyhtYWNoaW5lLCBjdXJyZW50U3RhdGUsIGN1cnJlbnRDb250ZXh0LCBfZXZlbnQsIGFjdGlvbnMpIHtcbiAgdmFyIF9hID0gX19yZWFkKHBhcnRpdGlvbihhY3Rpb25zLCBmdW5jdGlvbiAoYWN0aW9uKSB7XG4gICAgcmV0dXJuIGFjdGlvbi50eXBlID09PSBhc3NpZ24kMTtcbiAgfSksIDIpLFxuICAgICAgYXNzaWduQWN0aW9ucyA9IF9hWzBdLFxuICAgICAgb3RoZXJBY3Rpb25zID0gX2FbMV07XG5cbiAgdmFyIHVwZGF0ZWRDb250ZXh0ID0gYXNzaWduQWN0aW9ucy5sZW5ndGggPyB1cGRhdGVDb250ZXh0KGN1cnJlbnRDb250ZXh0LCBfZXZlbnQsIGFzc2lnbkFjdGlvbnMsIGN1cnJlbnRTdGF0ZSkgOiBjdXJyZW50Q29udGV4dDtcbiAgdmFyIHJlc29sdmVkQWN0aW9ucyA9IGZsYXR0ZW4ob3RoZXJBY3Rpb25zLm1hcChmdW5jdGlvbiAoYWN0aW9uT2JqZWN0KSB7XG4gICAgdmFyIF9hO1xuXG4gICAgc3dpdGNoIChhY3Rpb25PYmplY3QudHlwZSkge1xuICAgICAgY2FzZSByYWlzZSQxOlxuICAgICAgICByZXR1cm4gcmVzb2x2ZVJhaXNlKGFjdGlvbk9iamVjdCk7XG5cbiAgICAgIGNhc2Ugc2VuZCQxOlxuICAgICAgICB2YXIgc2VuZEFjdGlvbiA9IHJlc29sdmVTZW5kKGFjdGlvbk9iamVjdCwgdXBkYXRlZENvbnRleHQsIF9ldmVudCwgbWFjaGluZS5vcHRpb25zLmRlbGF5cyk7IC8vIFRPRE86IGZpeCBBY3Rpb25UeXBlcy5Jbml0XG5cbiAgICAgICAgaWYgKCFJU19QUk9EVUNUSU9OKSB7XG4gICAgICAgICAgLy8gd2FybiBhZnRlciByZXNvbHZpbmcgYXMgd2UgY2FuIGNyZWF0ZSBiZXR0ZXIgY29udGV4dHVhbCBtZXNzYWdlIGhlcmVcbiAgICAgICAgICB3YXJuKCFpc1N0cmluZyhhY3Rpb25PYmplY3QuZGVsYXkpIHx8IHR5cGVvZiBzZW5kQWN0aW9uLmRlbGF5ID09PSAnbnVtYmVyJywgLy8gdHNsaW50OmRpc2FibGUtbmV4dC1saW5lOm1heC1saW5lLWxlbmd0aFxuICAgICAgICAgIFwiTm8gZGVsYXkgcmVmZXJlbmNlIGZvciBkZWxheSBleHByZXNzaW9uICdcIiArIGFjdGlvbk9iamVjdC5kZWxheSArIFwiJyB3YXMgZm91bmQgb24gbWFjaGluZSAnXCIgKyBtYWNoaW5lLmlkICsgXCInXCIpO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHNlbmRBY3Rpb247XG5cbiAgICAgIGNhc2UgbG9nJDE6XG4gICAgICAgIHJldHVybiByZXNvbHZlTG9nKGFjdGlvbk9iamVjdCwgdXBkYXRlZENvbnRleHQsIF9ldmVudCk7XG5cbiAgICAgIGNhc2UgY2hvb3NlJDE6XG4gICAgICAgIHtcbiAgICAgICAgICB2YXIgY2hvb3NlQWN0aW9uID0gYWN0aW9uT2JqZWN0O1xuICAgICAgICAgIHZhciBtYXRjaGVkQWN0aW9ucyA9IChfYSA9IGNob29zZUFjdGlvbi5jb25kcy5maW5kKGZ1bmN0aW9uIChjb25kaXRpb24pIHtcbiAgICAgICAgICAgIHZhciBndWFyZCA9IHRvR3VhcmQoY29uZGl0aW9uLmNvbmQsIG1hY2hpbmUub3B0aW9ucy5ndWFyZHMpO1xuICAgICAgICAgICAgcmV0dXJuICFndWFyZCB8fCBldmFsdWF0ZUd1YXJkKG1hY2hpbmUsIGd1YXJkLCB1cGRhdGVkQ29udGV4dCwgX2V2ZW50LCBjdXJyZW50U3RhdGUpO1xuICAgICAgICAgIH0pKSA9PT0gbnVsbCB8fCBfYSA9PT0gdm9pZCAwID8gdm9pZCAwIDogX2EuYWN0aW9ucztcblxuICAgICAgICAgIGlmICghbWF0Y2hlZEFjdGlvbnMpIHtcbiAgICAgICAgICAgIHJldHVybiBbXTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICB2YXIgcmVzb2x2ZWQgPSByZXNvbHZlQWN0aW9ucyhtYWNoaW5lLCBjdXJyZW50U3RhdGUsIHVwZGF0ZWRDb250ZXh0LCBfZXZlbnQsIHRvQWN0aW9uT2JqZWN0cyh0b0FycmF5KG1hdGNoZWRBY3Rpb25zKSwgbWFjaGluZS5vcHRpb25zLmFjdGlvbnMpKTtcbiAgICAgICAgICB1cGRhdGVkQ29udGV4dCA9IHJlc29sdmVkWzFdO1xuICAgICAgICAgIHJldHVybiByZXNvbHZlZFswXTtcbiAgICAgICAgfVxuXG4gICAgICBjYXNlIHB1cmUkMTpcbiAgICAgICAge1xuICAgICAgICAgIHZhciBtYXRjaGVkQWN0aW9ucyA9IGFjdGlvbk9iamVjdC5nZXQodXBkYXRlZENvbnRleHQsIF9ldmVudC5kYXRhKTtcblxuICAgICAgICAgIGlmICghbWF0Y2hlZEFjdGlvbnMpIHtcbiAgICAgICAgICAgIHJldHVybiBbXTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICB2YXIgcmVzb2x2ZWQgPSByZXNvbHZlQWN0aW9ucyhtYWNoaW5lLCBjdXJyZW50U3RhdGUsIHVwZGF0ZWRDb250ZXh0LCBfZXZlbnQsIHRvQWN0aW9uT2JqZWN0cyh0b0FycmF5KG1hdGNoZWRBY3Rpb25zKSwgbWFjaGluZS5vcHRpb25zLmFjdGlvbnMpKTtcbiAgICAgICAgICB1cGRhdGVkQ29udGV4dCA9IHJlc29sdmVkWzFdO1xuICAgICAgICAgIHJldHVybiByZXNvbHZlZFswXTtcbiAgICAgICAgfVxuXG4gICAgICBjYXNlIHN0b3AkMTpcbiAgICAgICAge1xuICAgICAgICAgIHJldHVybiByZXNvbHZlU3RvcChhY3Rpb25PYmplY3QsIHVwZGF0ZWRDb250ZXh0LCBfZXZlbnQpO1xuICAgICAgICB9XG5cbiAgICAgIGRlZmF1bHQ6XG4gICAgICAgIHJldHVybiB0b0FjdGlvbk9iamVjdChhY3Rpb25PYmplY3QsIG1hY2hpbmUub3B0aW9ucy5hY3Rpb25zKTtcbiAgICB9XG4gIH0pKTtcbiAgcmV0dXJuIFtyZXNvbHZlZEFjdGlvbnMsIHVwZGF0ZWRDb250ZXh0XTtcbn1cblxuZXhwb3J0IHsgYWZ0ZXIsIGFzc2lnbiwgY2FuY2VsLCBjaG9vc2UsIGRvbmUsIGRvbmVJbnZva2UsIGVycm9yLCBlc2NhbGF0ZSwgZm9yd2FyZFRvLCBnZXRBY3Rpb25GdW5jdGlvbiwgaW5pdEV2ZW50LCBsb2csIHB1cmUsIHJhaXNlLCByZXNvbHZlQWN0aW9ucywgcmVzb2x2ZUxvZywgcmVzb2x2ZVJhaXNlLCByZXNvbHZlU2VuZCwgcmVzb2x2ZVN0b3AsIHJlc3BvbmQsIHNlbmQsIHNlbmRQYXJlbnQsIHNlbmRVcGRhdGUsIHN0YXJ0LCBzdG9wLCB0b0FjdGlvbk9iamVjdCwgdG9BY3Rpb25PYmplY3RzLCB0b0FjdGl2aXR5RGVmaW5pdGlvbiB9OyIsImltcG9ydCB7IF9fdmFsdWVzLCBfX3NwcmVhZCB9IGZyb20gJy4vX3ZpcnR1YWwvX3RzbGliLmpzJztcbmltcG9ydCB7IGtleXMsIGZsYXR0ZW4gfSBmcm9tICcuL3V0aWxzLmpzJztcblxudmFyIGlzTGVhZk5vZGUgPSBmdW5jdGlvbiAoc3RhdGVOb2RlKSB7XG4gIHJldHVybiBzdGF0ZU5vZGUudHlwZSA9PT0gJ2F0b21pYycgfHwgc3RhdGVOb2RlLnR5cGUgPT09ICdmaW5hbCc7XG59O1xuXG5mdW5jdGlvbiBnZXRDaGlsZHJlbihzdGF0ZU5vZGUpIHtcbiAgcmV0dXJuIGtleXMoc3RhdGVOb2RlLnN0YXRlcykubWFwKGZ1bmN0aW9uIChrZXkpIHtcbiAgICByZXR1cm4gc3RhdGVOb2RlLnN0YXRlc1trZXldO1xuICB9KTtcbn1cblxuZnVuY3Rpb24gZ2V0QWxsU3RhdGVOb2RlcyhzdGF0ZU5vZGUpIHtcbiAgdmFyIHN0YXRlTm9kZXMgPSBbc3RhdGVOb2RlXTtcblxuICBpZiAoaXNMZWFmTm9kZShzdGF0ZU5vZGUpKSB7XG4gICAgcmV0dXJuIHN0YXRlTm9kZXM7XG4gIH1cblxuICByZXR1cm4gc3RhdGVOb2Rlcy5jb25jYXQoZmxhdHRlbihnZXRDaGlsZHJlbihzdGF0ZU5vZGUpLm1hcChnZXRBbGxTdGF0ZU5vZGVzKSkpO1xufVxuXG5mdW5jdGlvbiBnZXRDb25maWd1cmF0aW9uKHByZXZTdGF0ZU5vZGVzLCBzdGF0ZU5vZGVzKSB7XG4gIHZhciBlXzEsIF9hLCBlXzIsIF9iLCBlXzMsIF9jLCBlXzQsIF9kO1xuXG4gIHZhciBwcmV2Q29uZmlndXJhdGlvbiA9IG5ldyBTZXQocHJldlN0YXRlTm9kZXMpO1xuICB2YXIgcHJldkFkakxpc3QgPSBnZXRBZGpMaXN0KHByZXZDb25maWd1cmF0aW9uKTtcbiAgdmFyIGNvbmZpZ3VyYXRpb24gPSBuZXcgU2V0KHN0YXRlTm9kZXMpO1xuXG4gIHRyeSB7XG4gICAgLy8gYWRkIGFsbCBhbmNlc3RvcnNcbiAgICBmb3IgKHZhciBjb25maWd1cmF0aW9uXzEgPSBfX3ZhbHVlcyhjb25maWd1cmF0aW9uKSwgY29uZmlndXJhdGlvbl8xXzEgPSBjb25maWd1cmF0aW9uXzEubmV4dCgpOyAhY29uZmlndXJhdGlvbl8xXzEuZG9uZTsgY29uZmlndXJhdGlvbl8xXzEgPSBjb25maWd1cmF0aW9uXzEubmV4dCgpKSB7XG4gICAgICB2YXIgcyA9IGNvbmZpZ3VyYXRpb25fMV8xLnZhbHVlO1xuICAgICAgdmFyIG0gPSBzLnBhcmVudDtcblxuICAgICAgd2hpbGUgKG0gJiYgIWNvbmZpZ3VyYXRpb24uaGFzKG0pKSB7XG4gICAgICAgIGNvbmZpZ3VyYXRpb24uYWRkKG0pO1xuICAgICAgICBtID0gbS5wYXJlbnQ7XG4gICAgICB9XG4gICAgfVxuICB9IGNhdGNoIChlXzFfMSkge1xuICAgIGVfMSA9IHtcbiAgICAgIGVycm9yOiBlXzFfMVxuICAgIH07XG4gIH0gZmluYWxseSB7XG4gICAgdHJ5IHtcbiAgICAgIGlmIChjb25maWd1cmF0aW9uXzFfMSAmJiAhY29uZmlndXJhdGlvbl8xXzEuZG9uZSAmJiAoX2EgPSBjb25maWd1cmF0aW9uXzEucmV0dXJuKSkgX2EuY2FsbChjb25maWd1cmF0aW9uXzEpO1xuICAgIH0gZmluYWxseSB7XG4gICAgICBpZiAoZV8xKSB0aHJvdyBlXzEuZXJyb3I7XG4gICAgfVxuICB9XG5cbiAgdmFyIGFkakxpc3QgPSBnZXRBZGpMaXN0KGNvbmZpZ3VyYXRpb24pO1xuXG4gIHRyeSB7XG4gICAgLy8gYWRkIGRlc2NlbmRhbnRzXG4gICAgZm9yICh2YXIgY29uZmlndXJhdGlvbl8yID0gX192YWx1ZXMoY29uZmlndXJhdGlvbiksIGNvbmZpZ3VyYXRpb25fMl8xID0gY29uZmlndXJhdGlvbl8yLm5leHQoKTsgIWNvbmZpZ3VyYXRpb25fMl8xLmRvbmU7IGNvbmZpZ3VyYXRpb25fMl8xID0gY29uZmlndXJhdGlvbl8yLm5leHQoKSkge1xuICAgICAgdmFyIHMgPSBjb25maWd1cmF0aW9uXzJfMS52YWx1ZTsgLy8gaWYgcHJldmlvdXNseSBhY3RpdmUsIGFkZCBleGlzdGluZyBjaGlsZCBub2Rlc1xuXG4gICAgICBpZiAocy50eXBlID09PSAnY29tcG91bmQnICYmICghYWRqTGlzdC5nZXQocykgfHwgIWFkakxpc3QuZ2V0KHMpLmxlbmd0aCkpIHtcbiAgICAgICAgaWYgKHByZXZBZGpMaXN0LmdldChzKSkge1xuICAgICAgICAgIHByZXZBZGpMaXN0LmdldChzKS5mb3JFYWNoKGZ1bmN0aW9uIChzbikge1xuICAgICAgICAgICAgcmV0dXJuIGNvbmZpZ3VyYXRpb24uYWRkKHNuKTtcbiAgICAgICAgICB9KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBzLmluaXRpYWxTdGF0ZU5vZGVzLmZvckVhY2goZnVuY3Rpb24gKHNuKSB7XG4gICAgICAgICAgICByZXR1cm4gY29uZmlndXJhdGlvbi5hZGQoc24pO1xuICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBpZiAocy50eXBlID09PSAncGFyYWxsZWwnKSB7XG4gICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGZvciAodmFyIF9lID0gKGVfMyA9IHZvaWQgMCwgX192YWx1ZXMoZ2V0Q2hpbGRyZW4ocykpKSwgX2YgPSBfZS5uZXh0KCk7ICFfZi5kb25lOyBfZiA9IF9lLm5leHQoKSkge1xuICAgICAgICAgICAgICB2YXIgY2hpbGQgPSBfZi52YWx1ZTtcblxuICAgICAgICAgICAgICBpZiAoY2hpbGQudHlwZSA9PT0gJ2hpc3RvcnknKSB7XG4gICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICBpZiAoIWNvbmZpZ3VyYXRpb24uaGFzKGNoaWxkKSkge1xuICAgICAgICAgICAgICAgIGNvbmZpZ3VyYXRpb24uYWRkKGNoaWxkKTtcblxuICAgICAgICAgICAgICAgIGlmIChwcmV2QWRqTGlzdC5nZXQoY2hpbGQpKSB7XG4gICAgICAgICAgICAgICAgICBwcmV2QWRqTGlzdC5nZXQoY2hpbGQpLmZvckVhY2goZnVuY3Rpb24gKHNuKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBjb25maWd1cmF0aW9uLmFkZChzbik7XG4gICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgY2hpbGQuaW5pdGlhbFN0YXRlTm9kZXMuZm9yRWFjaChmdW5jdGlvbiAoc24pIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGNvbmZpZ3VyYXRpb24uYWRkKHNuKTtcbiAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgIH0gY2F0Y2ggKGVfM18xKSB7XG4gICAgICAgICAgICBlXzMgPSB7XG4gICAgICAgICAgICAgIGVycm9yOiBlXzNfMVxuICAgICAgICAgICAgfTtcbiAgICAgICAgICB9IGZpbmFsbHkge1xuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgaWYgKF9mICYmICFfZi5kb25lICYmIChfYyA9IF9lLnJldHVybikpIF9jLmNhbGwoX2UpO1xuICAgICAgICAgICAgfSBmaW5hbGx5IHtcbiAgICAgICAgICAgICAgaWYgKGVfMykgdGhyb3cgZV8zLmVycm9yO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfSBjYXRjaCAoZV8yXzEpIHtcbiAgICBlXzIgPSB7XG4gICAgICBlcnJvcjogZV8yXzFcbiAgICB9O1xuICB9IGZpbmFsbHkge1xuICAgIHRyeSB7XG4gICAgICBpZiAoY29uZmlndXJhdGlvbl8yXzEgJiYgIWNvbmZpZ3VyYXRpb25fMl8xLmRvbmUgJiYgKF9iID0gY29uZmlndXJhdGlvbl8yLnJldHVybikpIF9iLmNhbGwoY29uZmlndXJhdGlvbl8yKTtcbiAgICB9IGZpbmFsbHkge1xuICAgICAgaWYgKGVfMikgdGhyb3cgZV8yLmVycm9yO1xuICAgIH1cbiAgfVxuXG4gIHRyeSB7XG4gICAgLy8gYWRkIGFsbCBhbmNlc3RvcnNcbiAgICBmb3IgKHZhciBjb25maWd1cmF0aW9uXzMgPSBfX3ZhbHVlcyhjb25maWd1cmF0aW9uKSwgY29uZmlndXJhdGlvbl8zXzEgPSBjb25maWd1cmF0aW9uXzMubmV4dCgpOyAhY29uZmlndXJhdGlvbl8zXzEuZG9uZTsgY29uZmlndXJhdGlvbl8zXzEgPSBjb25maWd1cmF0aW9uXzMubmV4dCgpKSB7XG4gICAgICB2YXIgcyA9IGNvbmZpZ3VyYXRpb25fM18xLnZhbHVlO1xuICAgICAgdmFyIG0gPSBzLnBhcmVudDtcblxuICAgICAgd2hpbGUgKG0gJiYgIWNvbmZpZ3VyYXRpb24uaGFzKG0pKSB7XG4gICAgICAgIGNvbmZpZ3VyYXRpb24uYWRkKG0pO1xuICAgICAgICBtID0gbS5wYXJlbnQ7XG4gICAgICB9XG4gICAgfVxuICB9IGNhdGNoIChlXzRfMSkge1xuICAgIGVfNCA9IHtcbiAgICAgIGVycm9yOiBlXzRfMVxuICAgIH07XG4gIH0gZmluYWxseSB7XG4gICAgdHJ5IHtcbiAgICAgIGlmIChjb25maWd1cmF0aW9uXzNfMSAmJiAhY29uZmlndXJhdGlvbl8zXzEuZG9uZSAmJiAoX2QgPSBjb25maWd1cmF0aW9uXzMucmV0dXJuKSkgX2QuY2FsbChjb25maWd1cmF0aW9uXzMpO1xuICAgIH0gZmluYWxseSB7XG4gICAgICBpZiAoZV80KSB0aHJvdyBlXzQuZXJyb3I7XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIGNvbmZpZ3VyYXRpb247XG59XG5cbmZ1bmN0aW9uIGdldFZhbHVlRnJvbUFkaihiYXNlTm9kZSwgYWRqTGlzdCkge1xuICB2YXIgY2hpbGRTdGF0ZU5vZGVzID0gYWRqTGlzdC5nZXQoYmFzZU5vZGUpO1xuXG4gIGlmICghY2hpbGRTdGF0ZU5vZGVzKSB7XG4gICAgcmV0dXJuIHt9OyAvLyB0b2RvOiBmaXg/XG4gIH1cblxuICBpZiAoYmFzZU5vZGUudHlwZSA9PT0gJ2NvbXBvdW5kJykge1xuICAgIHZhciBjaGlsZFN0YXRlTm9kZSA9IGNoaWxkU3RhdGVOb2Rlc1swXTtcblxuICAgIGlmIChjaGlsZFN0YXRlTm9kZSkge1xuICAgICAgaWYgKGlzTGVhZk5vZGUoY2hpbGRTdGF0ZU5vZGUpKSB7XG4gICAgICAgIHJldHVybiBjaGlsZFN0YXRlTm9kZS5rZXk7XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiB7fTtcbiAgICB9XG4gIH1cblxuICB2YXIgc3RhdGVWYWx1ZSA9IHt9O1xuICBjaGlsZFN0YXRlTm9kZXMuZm9yRWFjaChmdW5jdGlvbiAoY3NuKSB7XG4gICAgc3RhdGVWYWx1ZVtjc24ua2V5XSA9IGdldFZhbHVlRnJvbUFkaihjc24sIGFkakxpc3QpO1xuICB9KTtcbiAgcmV0dXJuIHN0YXRlVmFsdWU7XG59XG5cbmZ1bmN0aW9uIGdldEFkakxpc3QoY29uZmlndXJhdGlvbikge1xuICB2YXIgZV81LCBfYTtcblxuICB2YXIgYWRqTGlzdCA9IG5ldyBNYXAoKTtcblxuICB0cnkge1xuICAgIGZvciAodmFyIGNvbmZpZ3VyYXRpb25fNCA9IF9fdmFsdWVzKGNvbmZpZ3VyYXRpb24pLCBjb25maWd1cmF0aW9uXzRfMSA9IGNvbmZpZ3VyYXRpb25fNC5uZXh0KCk7ICFjb25maWd1cmF0aW9uXzRfMS5kb25lOyBjb25maWd1cmF0aW9uXzRfMSA9IGNvbmZpZ3VyYXRpb25fNC5uZXh0KCkpIHtcbiAgICAgIHZhciBzID0gY29uZmlndXJhdGlvbl80XzEudmFsdWU7XG5cbiAgICAgIGlmICghYWRqTGlzdC5oYXMocykpIHtcbiAgICAgICAgYWRqTGlzdC5zZXQocywgW10pO1xuICAgICAgfVxuXG4gICAgICBpZiAocy5wYXJlbnQpIHtcbiAgICAgICAgaWYgKCFhZGpMaXN0LmhhcyhzLnBhcmVudCkpIHtcbiAgICAgICAgICBhZGpMaXN0LnNldChzLnBhcmVudCwgW10pO1xuICAgICAgICB9XG5cbiAgICAgICAgYWRqTGlzdC5nZXQocy5wYXJlbnQpLnB1c2gocyk7XG4gICAgICB9XG4gICAgfVxuICB9IGNhdGNoIChlXzVfMSkge1xuICAgIGVfNSA9IHtcbiAgICAgIGVycm9yOiBlXzVfMVxuICAgIH07XG4gIH0gZmluYWxseSB7XG4gICAgdHJ5IHtcbiAgICAgIGlmIChjb25maWd1cmF0aW9uXzRfMSAmJiAhY29uZmlndXJhdGlvbl80XzEuZG9uZSAmJiAoX2EgPSBjb25maWd1cmF0aW9uXzQucmV0dXJuKSkgX2EuY2FsbChjb25maWd1cmF0aW9uXzQpO1xuICAgIH0gZmluYWxseSB7XG4gICAgICBpZiAoZV81KSB0aHJvdyBlXzUuZXJyb3I7XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIGFkakxpc3Q7XG59XG5cbmZ1bmN0aW9uIGdldFZhbHVlKHJvb3ROb2RlLCBjb25maWd1cmF0aW9uKSB7XG4gIHZhciBjb25maWcgPSBnZXRDb25maWd1cmF0aW9uKFtyb290Tm9kZV0sIGNvbmZpZ3VyYXRpb24pO1xuICByZXR1cm4gZ2V0VmFsdWVGcm9tQWRqKHJvb3ROb2RlLCBnZXRBZGpMaXN0KGNvbmZpZykpO1xufVxuXG5mdW5jdGlvbiBoYXMoaXRlcmFibGUsIGl0ZW0pIHtcbiAgaWYgKEFycmF5LmlzQXJyYXkoaXRlcmFibGUpKSB7XG4gICAgcmV0dXJuIGl0ZXJhYmxlLnNvbWUoZnVuY3Rpb24gKG1lbWJlcikge1xuICAgICAgcmV0dXJuIG1lbWJlciA9PT0gaXRlbTtcbiAgICB9KTtcbiAgfVxuXG4gIGlmIChpdGVyYWJsZSBpbnN0YW5jZW9mIFNldCkge1xuICAgIHJldHVybiBpdGVyYWJsZS5oYXMoaXRlbSk7XG4gIH1cblxuICByZXR1cm4gZmFsc2U7IC8vIFRPRE86IGZpeFxufVxuXG5mdW5jdGlvbiBuZXh0RXZlbnRzKGNvbmZpZ3VyYXRpb24pIHtcbiAgcmV0dXJuIGZsYXR0ZW4oX19zcHJlYWQobmV3IFNldChjb25maWd1cmF0aW9uLm1hcChmdW5jdGlvbiAoc24pIHtcbiAgICByZXR1cm4gc24ub3duRXZlbnRzO1xuICB9KSkpKTtcbn1cblxuZnVuY3Rpb24gaXNJbkZpbmFsU3RhdGUoY29uZmlndXJhdGlvbiwgc3RhdGVOb2RlKSB7XG4gIGlmIChzdGF0ZU5vZGUudHlwZSA9PT0gJ2NvbXBvdW5kJykge1xuICAgIHJldHVybiBnZXRDaGlsZHJlbihzdGF0ZU5vZGUpLnNvbWUoZnVuY3Rpb24gKHMpIHtcbiAgICAgIHJldHVybiBzLnR5cGUgPT09ICdmaW5hbCcgJiYgaGFzKGNvbmZpZ3VyYXRpb24sIHMpO1xuICAgIH0pO1xuICB9XG5cbiAgaWYgKHN0YXRlTm9kZS50eXBlID09PSAncGFyYWxsZWwnKSB7XG4gICAgcmV0dXJuIGdldENoaWxkcmVuKHN0YXRlTm9kZSkuZXZlcnkoZnVuY3Rpb24gKHNuKSB7XG4gICAgICByZXR1cm4gaXNJbkZpbmFsU3RhdGUoY29uZmlndXJhdGlvbiwgc24pO1xuICAgIH0pO1xuICB9XG5cbiAgcmV0dXJuIGZhbHNlO1xufVxuXG5leHBvcnQgeyBnZXRBZGpMaXN0LCBnZXRBbGxTdGF0ZU5vZGVzLCBnZXRDaGlsZHJlbiwgZ2V0Q29uZmlndXJhdGlvbiwgZ2V0VmFsdWUsIGhhcywgaXNJbkZpbmFsU3RhdGUsIGlzTGVhZk5vZGUsIG5leHRFdmVudHMgfTsiLCJpbXBvcnQgeyBfX3NwcmVhZCwgX19yZXN0LCBfX2Fzc2lnbiB9IGZyb20gJy4vX3ZpcnR1YWwvX3RzbGliLmpzJztcbmltcG9ydCB7IEVNUFRZX0FDVElWSVRZX01BUCB9IGZyb20gJy4vY29uc3RhbnRzLmpzJztcbmltcG9ydCB7IGlzU3RyaW5nLCBtYXRjaGVzU3RhdGUsIGtleXMgfSBmcm9tICcuL3V0aWxzLmpzJztcbmltcG9ydCB7IG5leHRFdmVudHMgfSBmcm9tICcuL3N0YXRlVXRpbHMuanMnO1xuaW1wb3J0IHsgaW5pdEV2ZW50IH0gZnJvbSAnLi9hY3Rpb25zLmpzJztcblxuZnVuY3Rpb24gc3RhdGVWYWx1ZXNFcXVhbChhLCBiKSB7XG4gIGlmIChhID09PSBiKSB7XG4gICAgcmV0dXJuIHRydWU7XG4gIH1cblxuICBpZiAoYSA9PT0gdW5kZWZpbmVkIHx8IGIgPT09IHVuZGVmaW5lZCkge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIGlmIChpc1N0cmluZyhhKSB8fCBpc1N0cmluZyhiKSkge1xuICAgIHJldHVybiBhID09PSBiO1xuICB9XG5cbiAgdmFyIGFLZXlzID0ga2V5cyhhKTtcbiAgdmFyIGJLZXlzID0ga2V5cyhiKTtcbiAgcmV0dXJuIGFLZXlzLmxlbmd0aCA9PT0gYktleXMubGVuZ3RoICYmIGFLZXlzLmV2ZXJ5KGZ1bmN0aW9uIChrZXkpIHtcbiAgICByZXR1cm4gc3RhdGVWYWx1ZXNFcXVhbChhW2tleV0sIGJba2V5XSk7XG4gIH0pO1xufVxuXG5mdW5jdGlvbiBpc1N0YXRlKHN0YXRlKSB7XG4gIGlmIChpc1N0cmluZyhzdGF0ZSkpIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICByZXR1cm4gJ3ZhbHVlJyBpbiBzdGF0ZSAmJiAnaGlzdG9yeScgaW4gc3RhdGU7XG59XG5cbmZ1bmN0aW9uIGJpbmRBY3Rpb25Ub1N0YXRlKGFjdGlvbiwgc3RhdGUpIHtcbiAgdmFyIGV4ZWMgPSBhY3Rpb24uZXhlYztcblxuICB2YXIgYm91bmRBY3Rpb24gPSBfX2Fzc2lnbihfX2Fzc2lnbih7fSwgYWN0aW9uKSwge1xuICAgIGV4ZWM6IGV4ZWMgIT09IHVuZGVmaW5lZCA/IGZ1bmN0aW9uICgpIHtcbiAgICAgIHJldHVybiBleGVjKHN0YXRlLmNvbnRleHQsIHN0YXRlLmV2ZW50LCB7XG4gICAgICAgIGFjdGlvbjogYWN0aW9uLFxuICAgICAgICBzdGF0ZTogc3RhdGUsXG4gICAgICAgIF9ldmVudDogc3RhdGUuX2V2ZW50XG4gICAgICB9KTtcbiAgICB9IDogdW5kZWZpbmVkXG4gIH0pO1xuXG4gIHJldHVybiBib3VuZEFjdGlvbjtcbn1cblxudmFyIFN0YXRlID1cbi8qI19fUFVSRV9fKi9cblxuLyoqIEBjbGFzcyAqL1xuZnVuY3Rpb24gKCkge1xuICAvKipcclxuICAgKiBDcmVhdGVzIGEgbmV3IFN0YXRlIGluc3RhbmNlLlxyXG4gICAqIEBwYXJhbSB2YWx1ZSBUaGUgc3RhdGUgdmFsdWVcclxuICAgKiBAcGFyYW0gY29udGV4dCBUaGUgZXh0ZW5kZWQgc3RhdGVcclxuICAgKiBAcGFyYW0gaGlzdG9yeVZhbHVlIFRoZSB0cmVlIHJlcHJlc2VudGluZyBoaXN0b3JpY2FsIHZhbHVlcyBvZiB0aGUgc3RhdGUgbm9kZXNcclxuICAgKiBAcGFyYW0gaGlzdG9yeSBUaGUgcHJldmlvdXMgc3RhdGVcclxuICAgKiBAcGFyYW0gYWN0aW9ucyBBbiBhcnJheSBvZiBhY3Rpb24gb2JqZWN0cyB0byBleGVjdXRlIGFzIHNpZGUtZWZmZWN0c1xyXG4gICAqIEBwYXJhbSBhY3Rpdml0aWVzIEEgbWFwcGluZyBvZiBhY3Rpdml0aWVzIGFuZCB3aGV0aGVyIHRoZXkgYXJlIHN0YXJ0ZWQgKGB0cnVlYCkgb3Igc3RvcHBlZCAoYGZhbHNlYCkuXHJcbiAgICogQHBhcmFtIG1ldGFcclxuICAgKiBAcGFyYW0gZXZlbnRzIEludGVybmFsIGV2ZW50IHF1ZXVlLiBTaG91bGQgYmUgZW1wdHkgd2l0aCBydW4tdG8tY29tcGxldGlvbiBzZW1hbnRpY3MuXHJcbiAgICogQHBhcmFtIGNvbmZpZ3VyYXRpb25cclxuICAgKi9cbiAgZnVuY3Rpb24gU3RhdGUoY29uZmlnKSB7XG4gICAgdmFyIF90aGlzID0gdGhpcztcblxuICAgIHRoaXMuYWN0aW9ucyA9IFtdO1xuICAgIHRoaXMuYWN0aXZpdGllcyA9IEVNUFRZX0FDVElWSVRZX01BUDtcbiAgICB0aGlzLm1ldGEgPSB7fTtcbiAgICB0aGlzLmV2ZW50cyA9IFtdO1xuICAgIHRoaXMudmFsdWUgPSBjb25maWcudmFsdWU7XG4gICAgdGhpcy5jb250ZXh0ID0gY29uZmlnLmNvbnRleHQ7XG4gICAgdGhpcy5fZXZlbnQgPSBjb25maWcuX2V2ZW50O1xuICAgIHRoaXMuX3Nlc3Npb25pZCA9IGNvbmZpZy5fc2Vzc2lvbmlkO1xuICAgIHRoaXMuZXZlbnQgPSB0aGlzLl9ldmVudC5kYXRhO1xuICAgIHRoaXMuaGlzdG9yeVZhbHVlID0gY29uZmlnLmhpc3RvcnlWYWx1ZTtcbiAgICB0aGlzLmhpc3RvcnkgPSBjb25maWcuaGlzdG9yeTtcbiAgICB0aGlzLmFjdGlvbnMgPSBjb25maWcuYWN0aW9ucyB8fCBbXTtcbiAgICB0aGlzLmFjdGl2aXRpZXMgPSBjb25maWcuYWN0aXZpdGllcyB8fCBFTVBUWV9BQ1RJVklUWV9NQVA7XG4gICAgdGhpcy5tZXRhID0gY29uZmlnLm1ldGEgfHwge307XG4gICAgdGhpcy5ldmVudHMgPSBjb25maWcuZXZlbnRzIHx8IFtdO1xuICAgIHRoaXMubWF0Y2hlcyA9IHRoaXMubWF0Y2hlcy5iaW5kKHRoaXMpO1xuICAgIHRoaXMudG9TdHJpbmdzID0gdGhpcy50b1N0cmluZ3MuYmluZCh0aGlzKTtcbiAgICB0aGlzLmNvbmZpZ3VyYXRpb24gPSBjb25maWcuY29uZmlndXJhdGlvbjtcbiAgICB0aGlzLnRyYW5zaXRpb25zID0gY29uZmlnLnRyYW5zaXRpb25zO1xuICAgIHRoaXMuY2hpbGRyZW4gPSBjb25maWcuY2hpbGRyZW47XG4gICAgdGhpcy5kb25lID0gISFjb25maWcuZG9uZTtcbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkodGhpcywgJ25leHRFdmVudHMnLCB7XG4gICAgICBnZXQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmV0dXJuIG5leHRFdmVudHMoX3RoaXMuY29uZmlndXJhdGlvbik7XG4gICAgICB9XG4gICAgfSk7XG4gIH1cbiAgLyoqXHJcbiAgICogQ3JlYXRlcyBhIG5ldyBTdGF0ZSBpbnN0YW5jZSBmb3IgdGhlIGdpdmVuIGBzdGF0ZVZhbHVlYCBhbmQgYGNvbnRleHRgLlxyXG4gICAqIEBwYXJhbSBzdGF0ZVZhbHVlXHJcbiAgICogQHBhcmFtIGNvbnRleHRcclxuICAgKi9cblxuXG4gIFN0YXRlLmZyb20gPSBmdW5jdGlvbiAoc3RhdGVWYWx1ZSwgY29udGV4dCkge1xuICAgIGlmIChzdGF0ZVZhbHVlIGluc3RhbmNlb2YgU3RhdGUpIHtcbiAgICAgIGlmIChzdGF0ZVZhbHVlLmNvbnRleHQgIT09IGNvbnRleHQpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBTdGF0ZSh7XG4gICAgICAgICAgdmFsdWU6IHN0YXRlVmFsdWUudmFsdWUsXG4gICAgICAgICAgY29udGV4dDogY29udGV4dCxcbiAgICAgICAgICBfZXZlbnQ6IHN0YXRlVmFsdWUuX2V2ZW50LFxuICAgICAgICAgIF9zZXNzaW9uaWQ6IG51bGwsXG4gICAgICAgICAgaGlzdG9yeVZhbHVlOiBzdGF0ZVZhbHVlLmhpc3RvcnlWYWx1ZSxcbiAgICAgICAgICBoaXN0b3J5OiBzdGF0ZVZhbHVlLmhpc3RvcnksXG4gICAgICAgICAgYWN0aW9uczogW10sXG4gICAgICAgICAgYWN0aXZpdGllczogc3RhdGVWYWx1ZS5hY3Rpdml0aWVzLFxuICAgICAgICAgIG1ldGE6IHt9LFxuICAgICAgICAgIGV2ZW50czogW10sXG4gICAgICAgICAgY29uZmlndXJhdGlvbjogW10sXG4gICAgICAgICAgdHJhbnNpdGlvbnM6IFtdLFxuICAgICAgICAgIGNoaWxkcmVuOiB7fVxuICAgICAgICB9KTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHN0YXRlVmFsdWU7XG4gICAgfVxuXG4gICAgdmFyIF9ldmVudCA9IGluaXRFdmVudDtcbiAgICByZXR1cm4gbmV3IFN0YXRlKHtcbiAgICAgIHZhbHVlOiBzdGF0ZVZhbHVlLFxuICAgICAgY29udGV4dDogY29udGV4dCxcbiAgICAgIF9ldmVudDogX2V2ZW50LFxuICAgICAgX3Nlc3Npb25pZDogbnVsbCxcbiAgICAgIGhpc3RvcnlWYWx1ZTogdW5kZWZpbmVkLFxuICAgICAgaGlzdG9yeTogdW5kZWZpbmVkLFxuICAgICAgYWN0aW9uczogW10sXG4gICAgICBhY3Rpdml0aWVzOiB1bmRlZmluZWQsXG4gICAgICBtZXRhOiB1bmRlZmluZWQsXG4gICAgICBldmVudHM6IFtdLFxuICAgICAgY29uZmlndXJhdGlvbjogW10sXG4gICAgICB0cmFuc2l0aW9uczogW10sXG4gICAgICBjaGlsZHJlbjoge31cbiAgICB9KTtcbiAgfTtcbiAgLyoqXHJcbiAgICogQ3JlYXRlcyBhIG5ldyBTdGF0ZSBpbnN0YW5jZSBmb3IgdGhlIGdpdmVuIGBjb25maWdgLlxyXG4gICAqIEBwYXJhbSBjb25maWcgVGhlIHN0YXRlIGNvbmZpZ1xyXG4gICAqL1xuXG5cbiAgU3RhdGUuY3JlYXRlID0gZnVuY3Rpb24gKGNvbmZpZykge1xuICAgIHJldHVybiBuZXcgU3RhdGUoY29uZmlnKTtcbiAgfTtcbiAgLyoqXHJcbiAgICogQ3JlYXRlcyBhIG5ldyBgU3RhdGVgIGluc3RhbmNlIGZvciB0aGUgZ2l2ZW4gYHN0YXRlVmFsdWVgIGFuZCBgY29udGV4dGAgd2l0aCBubyBhY3Rpb25zIChzaWRlLWVmZmVjdHMpLlxyXG4gICAqIEBwYXJhbSBzdGF0ZVZhbHVlXHJcbiAgICogQHBhcmFtIGNvbnRleHRcclxuICAgKi9cblxuXG4gIFN0YXRlLmluZXJ0ID0gZnVuY3Rpb24gKHN0YXRlVmFsdWUsIGNvbnRleHQpIHtcbiAgICBpZiAoc3RhdGVWYWx1ZSBpbnN0YW5jZW9mIFN0YXRlKSB7XG4gICAgICBpZiAoIXN0YXRlVmFsdWUuYWN0aW9ucy5sZW5ndGgpIHtcbiAgICAgICAgcmV0dXJuIHN0YXRlVmFsdWU7XG4gICAgICB9XG5cbiAgICAgIHZhciBfZXZlbnQgPSBpbml0RXZlbnQ7XG4gICAgICByZXR1cm4gbmV3IFN0YXRlKHtcbiAgICAgICAgdmFsdWU6IHN0YXRlVmFsdWUudmFsdWUsXG4gICAgICAgIGNvbnRleHQ6IGNvbnRleHQsXG4gICAgICAgIF9ldmVudDogX2V2ZW50LFxuICAgICAgICBfc2Vzc2lvbmlkOiBudWxsLFxuICAgICAgICBoaXN0b3J5VmFsdWU6IHN0YXRlVmFsdWUuaGlzdG9yeVZhbHVlLFxuICAgICAgICBoaXN0b3J5OiBzdGF0ZVZhbHVlLmhpc3RvcnksXG4gICAgICAgIGFjdGl2aXRpZXM6IHN0YXRlVmFsdWUuYWN0aXZpdGllcyxcbiAgICAgICAgY29uZmlndXJhdGlvbjogc3RhdGVWYWx1ZS5jb25maWd1cmF0aW9uLFxuICAgICAgICB0cmFuc2l0aW9uczogW10sXG4gICAgICAgIGNoaWxkcmVuOiB7fVxuICAgICAgfSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIFN0YXRlLmZyb20oc3RhdGVWYWx1ZSwgY29udGV4dCk7XG4gIH07XG4gIC8qKlxyXG4gICAqIFJldHVybnMgYW4gYXJyYXkgb2YgYWxsIHRoZSBzdHJpbmcgbGVhZiBzdGF0ZSBub2RlIHBhdGhzLlxyXG4gICAqIEBwYXJhbSBzdGF0ZVZhbHVlXHJcbiAgICogQHBhcmFtIGRlbGltaXRlciBUaGUgY2hhcmFjdGVyKHMpIHRoYXQgc2VwYXJhdGUgZWFjaCBzdWJwYXRoIGluIHRoZSBzdHJpbmcgc3RhdGUgbm9kZSBwYXRoLlxyXG4gICAqL1xuXG5cbiAgU3RhdGUucHJvdG90eXBlLnRvU3RyaW5ncyA9IGZ1bmN0aW9uIChzdGF0ZVZhbHVlLCBkZWxpbWl0ZXIpIHtcbiAgICB2YXIgX3RoaXMgPSB0aGlzO1xuXG4gICAgaWYgKHN0YXRlVmFsdWUgPT09IHZvaWQgMCkge1xuICAgICAgc3RhdGVWYWx1ZSA9IHRoaXMudmFsdWU7XG4gICAgfVxuXG4gICAgaWYgKGRlbGltaXRlciA9PT0gdm9pZCAwKSB7XG4gICAgICBkZWxpbWl0ZXIgPSAnLic7XG4gICAgfVxuXG4gICAgaWYgKGlzU3RyaW5nKHN0YXRlVmFsdWUpKSB7XG4gICAgICByZXR1cm4gW3N0YXRlVmFsdWVdO1xuICAgIH1cblxuICAgIHZhciB2YWx1ZUtleXMgPSBrZXlzKHN0YXRlVmFsdWUpO1xuICAgIHJldHVybiB2YWx1ZUtleXMuY29uY2F0LmFwcGx5KHZhbHVlS2V5cywgX19zcHJlYWQodmFsdWVLZXlzLm1hcChmdW5jdGlvbiAoa2V5KSB7XG4gICAgICByZXR1cm4gX3RoaXMudG9TdHJpbmdzKHN0YXRlVmFsdWVba2V5XSwgZGVsaW1pdGVyKS5tYXAoZnVuY3Rpb24gKHMpIHtcbiAgICAgICAgcmV0dXJuIGtleSArIGRlbGltaXRlciArIHM7XG4gICAgICB9KTtcbiAgICB9KSkpO1xuICB9O1xuXG4gIFN0YXRlLnByb3RvdHlwZS50b0pTT04gPSBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIF9hID0gdGhpcyxcbiAgICAgICAgY29uZmlndXJhdGlvbiA9IF9hLmNvbmZpZ3VyYXRpb24sXG4gICAgICAgIHRyYW5zaXRpb25zID0gX2EudHJhbnNpdGlvbnMsXG4gICAgICAgIGpzb25WYWx1ZXMgPSBfX3Jlc3QoX2EsIFtcImNvbmZpZ3VyYXRpb25cIiwgXCJ0cmFuc2l0aW9uc1wiXSk7XG5cbiAgICByZXR1cm4ganNvblZhbHVlcztcbiAgfTtcbiAgLyoqXHJcbiAgICogV2hldGhlciB0aGUgY3VycmVudCBzdGF0ZSB2YWx1ZSBpcyBhIHN1YnNldCBvZiB0aGUgZ2l2ZW4gcGFyZW50IHN0YXRlIHZhbHVlLlxyXG4gICAqIEBwYXJhbSBwYXJlbnRTdGF0ZVZhbHVlXHJcbiAgICovXG5cblxuICBTdGF0ZS5wcm90b3R5cGUubWF0Y2hlcyA9IGZ1bmN0aW9uIChwYXJlbnRTdGF0ZVZhbHVlKSB7XG4gICAgcmV0dXJuIG1hdGNoZXNTdGF0ZShwYXJlbnRTdGF0ZVZhbHVlLCB0aGlzLnZhbHVlKTtcbiAgfTtcblxuICByZXR1cm4gU3RhdGU7XG59KCk7XG5cbmV4cG9ydCB7IFN0YXRlLCBiaW5kQWN0aW9uVG9TdGF0ZSwgaXNTdGF0ZSwgc3RhdGVWYWx1ZXNFcXVhbCB9OyIsIi8qKlxyXG4gKiBNYWludGFpbnMgYSBzdGFjayBvZiB0aGUgY3VycmVudCBzZXJ2aWNlIGluIHNjb3BlLlxyXG4gKiBUaGlzIGlzIHVzZWQgdG8gcHJvdmlkZSB0aGUgY29ycmVjdCBzZXJ2aWNlIHRvIHNwYXduKCkuXHJcbiAqL1xudmFyIHNlcnZpY2VTdGFjayA9IFtdO1xuXG52YXIgcHJvdmlkZSA9IGZ1bmN0aW9uIChzZXJ2aWNlLCBmbikge1xuICBzZXJ2aWNlU3RhY2sucHVzaChzZXJ2aWNlKTtcbiAgdmFyIHJlc3VsdCA9IGZuKHNlcnZpY2UpO1xuICBzZXJ2aWNlU3RhY2sucG9wKCk7XG4gIHJldHVybiByZXN1bHQ7XG59O1xuXG52YXIgY29uc3VtZSA9IGZ1bmN0aW9uIChmbikge1xuICByZXR1cm4gZm4oc2VydmljZVN0YWNrW3NlcnZpY2VTdGFjay5sZW5ndGggLSAxXSk7XG59O1xuXG5leHBvcnQgeyBjb25zdW1lLCBwcm92aWRlIH07IiwiaW1wb3J0IHsgdG9JbnZva2VTb3VyY2UsIG1hcENvbnRleHQsIGlzTWFjaGluZSB9IGZyb20gJy4vdXRpbHMuanMnO1xuaW1wb3J0IHsgcHJvdmlkZSB9IGZyb20gJy4vc2VydmljZVNjb3BlLmpzJztcblxuZnVuY3Rpb24gY3JlYXRlTnVsbEFjdG9yKGlkKSB7XG4gIHJldHVybiB7XG4gICAgaWQ6IGlkLFxuICAgIHNlbmQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgIHJldHVybiB2b2lkIDA7XG4gICAgfSxcbiAgICBzdWJzY3JpYmU6IGZ1bmN0aW9uICgpIHtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIHVuc3Vic2NyaWJlOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgcmV0dXJuIHZvaWQgMDtcbiAgICAgICAgfVxuICAgICAgfTtcbiAgICB9LFxuICAgIHRvSlNPTjogZnVuY3Rpb24gKCkge1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgaWQ6IGlkXG4gICAgICB9O1xuICAgIH1cbiAgfTtcbn1cbi8qKlxyXG4gKiBDcmVhdGVzIGEgZGVmZXJyZWQgYWN0b3IgdGhhdCBpcyBhYmxlIHRvIGJlIGludm9rZWQgZ2l2ZW4gdGhlIHByb3ZpZGVkXHJcbiAqIGludm9jYXRpb24gaW5mb3JtYXRpb24gaW4gaXRzIGAubWV0YWAgdmFsdWUuXHJcbiAqXHJcbiAqIEBwYXJhbSBpbnZva2VEZWZpbml0aW9uIFRoZSBtZXRhIGluZm9ybWF0aW9uIG5lZWRlZCB0byBpbnZva2UgdGhlIGFjdG9yLlxyXG4gKi9cblxuXG5mdW5jdGlvbiBjcmVhdGVJbnZvY2FibGVBY3RvcihpbnZva2VEZWZpbml0aW9uLCBtYWNoaW5lLCBjb250ZXh0LCBfZXZlbnQpIHtcbiAgdmFyIF9hO1xuXG4gIHZhciBpbnZva2VTcmMgPSB0b0ludm9rZVNvdXJjZShpbnZva2VEZWZpbml0aW9uLnNyYyk7XG4gIHZhciBzZXJ2aWNlQ3JlYXRvciA9IChfYSA9IG1hY2hpbmUgPT09IG51bGwgfHwgbWFjaGluZSA9PT0gdm9pZCAwID8gdm9pZCAwIDogbWFjaGluZS5vcHRpb25zLnNlcnZpY2VzKSA9PT0gbnVsbCB8fCBfYSA9PT0gdm9pZCAwID8gdm9pZCAwIDogX2FbaW52b2tlU3JjLnR5cGVdO1xuICB2YXIgcmVzb2x2ZWREYXRhID0gaW52b2tlRGVmaW5pdGlvbi5kYXRhID8gbWFwQ29udGV4dChpbnZva2VEZWZpbml0aW9uLmRhdGEsIGNvbnRleHQsIF9ldmVudCkgOiB1bmRlZmluZWQ7XG4gIHZhciB0ZW1wQWN0b3IgPSBzZXJ2aWNlQ3JlYXRvciA/IGNyZWF0ZURlZmVycmVkQWN0b3Ioc2VydmljZUNyZWF0b3IsIGludm9rZURlZmluaXRpb24uaWQsIHJlc29sdmVkRGF0YSkgOiBjcmVhdGVOdWxsQWN0b3IoaW52b2tlRGVmaW5pdGlvbi5pZCk7XG4gIHRlbXBBY3Rvci5tZXRhID0gaW52b2tlRGVmaW5pdGlvbjtcbiAgcmV0dXJuIHRlbXBBY3Rvcjtcbn1cblxuZnVuY3Rpb24gY3JlYXRlRGVmZXJyZWRBY3RvcihlbnRpdHksIGlkLCBkYXRhKSB7XG4gIHZhciB0ZW1wQWN0b3IgPSBjcmVhdGVOdWxsQWN0b3IoaWQpO1xuICB0ZW1wQWN0b3IuZGVmZXJyZWQgPSB0cnVlO1xuXG4gIGlmIChpc01hY2hpbmUoZW50aXR5KSkge1xuICAgIC8vIFwibXV0ZVwiIHRoZSBleGlzdGluZyBzZXJ2aWNlIHNjb3BlIHNvIHBvdGVudGlhbCBzcGF3bmVkIGFjdG9ycyB3aXRoaW4gdGhlIGAuaW5pdGlhbFN0YXRlYCBzdGF5IGRlZmVycmVkIGhlcmVcbiAgICB0ZW1wQWN0b3Iuc3RhdGUgPSBwcm92aWRlKHVuZGVmaW5lZCwgZnVuY3Rpb24gKCkge1xuICAgICAgcmV0dXJuIChkYXRhID8gZW50aXR5LndpdGhDb250ZXh0KGRhdGEpIDogZW50aXR5KS5pbml0aWFsU3RhdGU7XG4gICAgfSk7XG4gIH1cblxuICByZXR1cm4gdGVtcEFjdG9yO1xufVxuXG5mdW5jdGlvbiBpc0FjdG9yKGl0ZW0pIHtcbiAgdHJ5IHtcbiAgICByZXR1cm4gdHlwZW9mIGl0ZW0uc2VuZCA9PT0gJ2Z1bmN0aW9uJztcbiAgfSBjYXRjaCAoZSkge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxufVxuXG5mdW5jdGlvbiBpc1NwYXduZWRBY3RvcihpdGVtKSB7XG4gIHJldHVybiBpc0FjdG9yKGl0ZW0pICYmICdpZCcgaW4gaXRlbTtcbn1cblxuZXhwb3J0IHsgY3JlYXRlRGVmZXJyZWRBY3RvciwgY3JlYXRlSW52b2NhYmxlQWN0b3IsIGNyZWF0ZU51bGxBY3RvciwgaXNBY3RvciwgaXNTcGF3bmVkQWN0b3IgfTsiLCJpbXBvcnQgeyBfX2Fzc2lnbiwgX19yZXN0IH0gZnJvbSAnLi9fdmlydHVhbC9fdHNsaWIuanMnO1xuaW1wb3J0IHsgaW52b2tlIH0gZnJvbSAnLi9hY3Rpb25UeXBlcy5qcyc7XG5pbXBvcnQgJy4vYWN0aW9ucy5qcyc7XG5cbmZ1bmN0aW9uIHRvSW52b2tlU291cmNlKHNyYykge1xuICBpZiAodHlwZW9mIHNyYyA9PT0gJ3N0cmluZycpIHtcbiAgICB2YXIgc2ltcGxlU3JjID0ge1xuICAgICAgdHlwZTogc3JjXG4gICAgfTtcblxuICAgIHNpbXBsZVNyYy50b1N0cmluZyA9IGZ1bmN0aW9uICgpIHtcbiAgICAgIHJldHVybiBzcmM7XG4gICAgfTsgLy8gdjQgY29tcGF0IC0gVE9ETzogcmVtb3ZlIGluIHY1XG5cblxuICAgIHJldHVybiBzaW1wbGVTcmM7XG4gIH1cblxuICByZXR1cm4gc3JjO1xufVxuXG5mdW5jdGlvbiB0b0ludm9rZURlZmluaXRpb24oaW52b2tlQ29uZmlnKSB7XG4gIHJldHVybiBfX2Fzc2lnbihfX2Fzc2lnbih7XG4gICAgdHlwZTogaW52b2tlXG4gIH0sIGludm9rZUNvbmZpZyksIHtcbiAgICB0b0pTT046IGZ1bmN0aW9uICgpIHtcbiAgICAgIHZhciBvbkRvbmUgPSBpbnZva2VDb25maWcub25Eb25lLFxuICAgICAgICAgIG9uRXJyb3IgPSBpbnZva2VDb25maWcub25FcnJvcixcbiAgICAgICAgICBpbnZva2VEZWYgPSBfX3Jlc3QoaW52b2tlQ29uZmlnLCBbXCJvbkRvbmVcIiwgXCJvbkVycm9yXCJdKTtcblxuICAgICAgcmV0dXJuIF9fYXNzaWduKF9fYXNzaWduKHt9LCBpbnZva2VEZWYpLCB7XG4gICAgICAgIHR5cGU6IGludm9rZSxcbiAgICAgICAgc3JjOiB0b0ludm9rZVNvdXJjZShpbnZva2VDb25maWcuc3JjKVxuICAgICAgfSk7XG4gICAgfVxuICB9KTtcbn1cblxuZXhwb3J0IHsgdG9JbnZva2VEZWZpbml0aW9uLCB0b0ludm9rZVNvdXJjZSB9OyIsImltcG9ydCB7IF9fYXNzaWduLCBfX3ZhbHVlcywgX19zcHJlYWQsIF9fcmVhZCwgX19yZXN0IH0gZnJvbSAnLi9fdmlydHVhbC9fdHNsaWIuanMnO1xuaW1wb3J0IHsgU1RBVEVfREVMSU1JVEVSIH0gZnJvbSAnLi9jb25zdGFudHMuanMnO1xuaW1wb3J0IHsgSVNfUFJPRFVDVElPTiB9IGZyb20gJy4vZW52aXJvbm1lbnQuanMnO1xuaW1wb3J0IHsgbWFwVmFsdWVzLCBpc0FycmF5LCBmbGF0dGVuLCBrZXlzLCB0b0FycmF5LCB0b1N0YXRlVmFsdWUsIGlzU3RyaW5nLCBnZXRFdmVudFR5cGUsIG1hdGNoZXNTdGF0ZSwgcGF0aCwgZXZhbHVhdGVHdWFyZCwgbWFwQ29udGV4dCwgdG9TQ1hNTEV2ZW50LCBwYXRoVG9TdGF0ZVZhbHVlLCBpc0J1aWx0SW5FdmVudCwgcGFydGl0aW9uLCB1cGRhdGVIaXN0b3J5VmFsdWUsIHRvU3RhdGVQYXRoLCBtYXBGaWx0ZXJWYWx1ZXMsIHdhcm4sIHRvU3RhdGVQYXRocywgbmVzdGVkUGF0aCwgbm9ybWFsaXplVGFyZ2V0LCB0b0d1YXJkLCB0b1RyYW5zaXRpb25Db25maWdBcnJheSwgaXNNYWNoaW5lLCBpc0Z1bmN0aW9uIH0gZnJvbSAnLi91dGlscy5qcyc7XG5pbXBvcnQgeyBTcGVjaWFsVGFyZ2V0cyB9IGZyb20gJy4vdHlwZXMuanMnO1xuaW1wb3J0IHsgZ2V0QWxsU3RhdGVOb2RlcywgZ2V0Q29uZmlndXJhdGlvbiwgaGFzLCBnZXRDaGlsZHJlbiwgaXNJbkZpbmFsU3RhdGUsIGdldFZhbHVlLCBpc0xlYWZOb2RlIH0gZnJvbSAnLi9zdGF0ZVV0aWxzLmpzJztcbmltcG9ydCB7IHN0YXJ0IGFzIHN0YXJ0JDEsIHN0b3AgYXMgc3RvcCQxLCBpbnZva2UsIHVwZGF0ZSwgbnVsbEV2ZW50LCByYWlzZSBhcyByYWlzZSQxLCBzZW5kIGFzIHNlbmQkMSB9IGZyb20gJy4vYWN0aW9uVHlwZXMuanMnO1xuaW1wb3J0IHsgZG9uZSwgc3RhcnQsIHJhaXNlLCBzdG9wLCB0b0FjdGlvbk9iamVjdHMsIHJlc29sdmVBY3Rpb25zLCBkb25lSW52b2tlLCBlcnJvciwgdG9BY3Rpb25PYmplY3QsIHRvQWN0aXZpdHlEZWZpbml0aW9uLCBhZnRlciwgc2VuZCwgY2FuY2VsLCBpbml0RXZlbnQgfSBmcm9tICcuL2FjdGlvbnMuanMnO1xuaW1wb3J0IHsgU3RhdGUsIHN0YXRlVmFsdWVzRXF1YWwgfSBmcm9tICcuL1N0YXRlLmpzJztcbmltcG9ydCB7IGNyZWF0ZUludm9jYWJsZUFjdG9yIH0gZnJvbSAnLi9BY3Rvci5qcyc7XG5pbXBvcnQgeyB0b0ludm9rZURlZmluaXRpb24gfSBmcm9tICcuL2ludm9rZVV0aWxzLmpzJztcbnZhciBOVUxMX0VWRU5UID0gJyc7XG52YXIgU1RBVEVfSURFTlRJRklFUiA9ICcjJztcbnZhciBXSUxEQ0FSRCA9ICcqJztcbnZhciBFTVBUWV9PQkpFQ1QgPSB7fTtcblxudmFyIGlzU3RhdGVJZCA9IGZ1bmN0aW9uIChzdHIpIHtcbiAgcmV0dXJuIHN0clswXSA9PT0gU1RBVEVfSURFTlRJRklFUjtcbn07XG5cbnZhciBjcmVhdGVEZWZhdWx0T3B0aW9ucyA9IGZ1bmN0aW9uICgpIHtcbiAgcmV0dXJuIHtcbiAgICBhY3Rpb25zOiB7fSxcbiAgICBndWFyZHM6IHt9LFxuICAgIHNlcnZpY2VzOiB7fSxcbiAgICBhY3Rpdml0aWVzOiB7fSxcbiAgICBkZWxheXM6IHt9XG4gIH07XG59O1xuXG52YXIgdmFsaWRhdGVBcnJheWlmaWVkVHJhbnNpdGlvbnMgPSBmdW5jdGlvbiAoc3RhdGVOb2RlLCBldmVudCwgdHJhbnNpdGlvbnMpIHtcbiAgdmFyIGhhc05vbkxhc3RVbmd1YXJkZWRUYXJnZXQgPSB0cmFuc2l0aW9ucy5zbGljZSgwLCAtMSkuc29tZShmdW5jdGlvbiAodHJhbnNpdGlvbikge1xuICAgIHJldHVybiAhKCdjb25kJyBpbiB0cmFuc2l0aW9uKSAmJiAhKCdpbicgaW4gdHJhbnNpdGlvbikgJiYgKGlzU3RyaW5nKHRyYW5zaXRpb24udGFyZ2V0KSB8fCBpc01hY2hpbmUodHJhbnNpdGlvbi50YXJnZXQpKTtcbiAgfSk7XG4gIHZhciBldmVudFRleHQgPSBldmVudCA9PT0gTlVMTF9FVkVOVCA/ICd0aGUgdHJhbnNpZW50IGV2ZW50JyA6IFwiZXZlbnQgJ1wiICsgZXZlbnQgKyBcIidcIjtcbiAgd2FybighaGFzTm9uTGFzdFVuZ3VhcmRlZFRhcmdldCwgXCJPbmUgb3IgbW9yZSB0cmFuc2l0aW9ucyBmb3IgXCIgKyBldmVudFRleHQgKyBcIiBvbiBzdGF0ZSAnXCIgKyBzdGF0ZU5vZGUuaWQgKyBcIicgYXJlIHVucmVhY2hhYmxlLiBcIiArIFwiTWFrZSBzdXJlIHRoYXQgdGhlIGRlZmF1bHQgdHJhbnNpdGlvbiBpcyB0aGUgbGFzdCBvbmUgZGVmaW5lZC5cIik7XG59O1xuXG52YXIgU3RhdGVOb2RlID1cbi8qI19fUFVSRV9fKi9cblxuLyoqIEBjbGFzcyAqL1xuZnVuY3Rpb24gKCkge1xuICBmdW5jdGlvbiBTdGF0ZU5vZGUoXG4gIC8qKlxyXG4gICAqIFRoZSByYXcgY29uZmlnIHVzZWQgdG8gY3JlYXRlIHRoZSBtYWNoaW5lLlxyXG4gICAqL1xuICBjb25maWcsIG9wdGlvbnMsXG4gIC8qKlxyXG4gICAqIFRoZSBpbml0aWFsIGV4dGVuZGVkIHN0YXRlXHJcbiAgICovXG4gIGNvbnRleHQpIHtcbiAgICB2YXIgX3RoaXMgPSB0aGlzO1xuXG4gICAgdGhpcy5jb25maWcgPSBjb25maWc7XG4gICAgdGhpcy5jb250ZXh0ID0gY29udGV4dDtcbiAgICAvKipcclxuICAgICAqIFRoZSBvcmRlciB0aGlzIHN0YXRlIG5vZGUgYXBwZWFycy4gQ29ycmVzcG9uZHMgdG8gdGhlIGltcGxpY2l0IFNDWE1MIGRvY3VtZW50IG9yZGVyLlxyXG4gICAgICovXG5cbiAgICB0aGlzLm9yZGVyID0gLTE7XG4gICAgdGhpcy5fX3hzdGF0ZW5vZGUgPSB0cnVlO1xuICAgIHRoaXMuX19jYWNoZSA9IHtcbiAgICAgIGV2ZW50czogdW5kZWZpbmVkLFxuICAgICAgcmVsYXRpdmVWYWx1ZTogbmV3IE1hcCgpLFxuICAgICAgaW5pdGlhbFN0YXRlVmFsdWU6IHVuZGVmaW5lZCxcbiAgICAgIGluaXRpYWxTdGF0ZTogdW5kZWZpbmVkLFxuICAgICAgb246IHVuZGVmaW5lZCxcbiAgICAgIHRyYW5zaXRpb25zOiB1bmRlZmluZWQsXG4gICAgICBjYW5kaWRhdGVzOiB7fSxcbiAgICAgIGRlbGF5ZWRUcmFuc2l0aW9uczogdW5kZWZpbmVkXG4gICAgfTtcbiAgICB0aGlzLmlkTWFwID0ge307XG4gICAgdGhpcy5vcHRpb25zID0gT2JqZWN0LmFzc2lnbihjcmVhdGVEZWZhdWx0T3B0aW9ucygpLCBvcHRpb25zKTtcbiAgICB0aGlzLnBhcmVudCA9IHRoaXMub3B0aW9ucy5fcGFyZW50O1xuICAgIHRoaXMua2V5ID0gdGhpcy5jb25maWcua2V5IHx8IHRoaXMub3B0aW9ucy5fa2V5IHx8IHRoaXMuY29uZmlnLmlkIHx8ICcobWFjaGluZSknO1xuICAgIHRoaXMubWFjaGluZSA9IHRoaXMucGFyZW50ID8gdGhpcy5wYXJlbnQubWFjaGluZSA6IHRoaXM7XG4gICAgdGhpcy5wYXRoID0gdGhpcy5wYXJlbnQgPyB0aGlzLnBhcmVudC5wYXRoLmNvbmNhdCh0aGlzLmtleSkgOiBbXTtcbiAgICB0aGlzLmRlbGltaXRlciA9IHRoaXMuY29uZmlnLmRlbGltaXRlciB8fCAodGhpcy5wYXJlbnQgPyB0aGlzLnBhcmVudC5kZWxpbWl0ZXIgOiBTVEFURV9ERUxJTUlURVIpO1xuICAgIHRoaXMuaWQgPSB0aGlzLmNvbmZpZy5pZCB8fCBfX3NwcmVhZChbdGhpcy5tYWNoaW5lLmtleV0sIHRoaXMucGF0aCkuam9pbih0aGlzLmRlbGltaXRlcik7XG4gICAgdGhpcy52ZXJzaW9uID0gdGhpcy5wYXJlbnQgPyB0aGlzLnBhcmVudC52ZXJzaW9uIDogdGhpcy5jb25maWcudmVyc2lvbjtcbiAgICB0aGlzLnR5cGUgPSB0aGlzLmNvbmZpZy50eXBlIHx8ICh0aGlzLmNvbmZpZy5wYXJhbGxlbCA/ICdwYXJhbGxlbCcgOiB0aGlzLmNvbmZpZy5zdGF0ZXMgJiYga2V5cyh0aGlzLmNvbmZpZy5zdGF0ZXMpLmxlbmd0aCA/ICdjb21wb3VuZCcgOiB0aGlzLmNvbmZpZy5oaXN0b3J5ID8gJ2hpc3RvcnknIDogJ2F0b21pYycpO1xuXG4gICAgaWYgKCFJU19QUk9EVUNUSU9OKSB7XG4gICAgICB3YXJuKCEoJ3BhcmFsbGVsJyBpbiB0aGlzLmNvbmZpZyksIFwiVGhlIFxcXCJwYXJhbGxlbFxcXCIgcHJvcGVydHkgaXMgZGVwcmVjYXRlZCBhbmQgd2lsbCBiZSByZW1vdmVkIGluIHZlcnNpb24gNC4xLiBcIiArICh0aGlzLmNvbmZpZy5wYXJhbGxlbCA/IFwiUmVwbGFjZSB3aXRoIGB0eXBlOiAncGFyYWxsZWwnYFwiIDogXCJVc2UgYHR5cGU6ICdcIiArIHRoaXMudHlwZSArIFwiJ2BcIikgKyBcIiBpbiB0aGUgY29uZmlnIGZvciBzdGF0ZSBub2RlICdcIiArIHRoaXMuaWQgKyBcIicgaW5zdGVhZC5cIik7XG4gICAgfVxuXG4gICAgdGhpcy5pbml0aWFsID0gdGhpcy5jb25maWcuaW5pdGlhbDtcbiAgICB0aGlzLnN0YXRlcyA9IHRoaXMuY29uZmlnLnN0YXRlcyA/IG1hcFZhbHVlcyh0aGlzLmNvbmZpZy5zdGF0ZXMsIGZ1bmN0aW9uIChzdGF0ZUNvbmZpZywga2V5KSB7XG4gICAgICB2YXIgX2E7XG5cbiAgICAgIHZhciBzdGF0ZU5vZGUgPSBuZXcgU3RhdGVOb2RlKHN0YXRlQ29uZmlnLCB7XG4gICAgICAgIF9wYXJlbnQ6IF90aGlzLFxuICAgICAgICBfa2V5OiBrZXlcbiAgICAgIH0pO1xuICAgICAgT2JqZWN0LmFzc2lnbihfdGhpcy5pZE1hcCwgX19hc3NpZ24oKF9hID0ge30sIF9hW3N0YXRlTm9kZS5pZF0gPSBzdGF0ZU5vZGUsIF9hKSwgc3RhdGVOb2RlLmlkTWFwKSk7XG4gICAgICByZXR1cm4gc3RhdGVOb2RlO1xuICAgIH0pIDogRU1QVFlfT0JKRUNUOyAvLyBEb2N1bWVudCBvcmRlclxuXG4gICAgdmFyIG9yZGVyID0gMDtcblxuICAgIGZ1bmN0aW9uIGRmcyhzdGF0ZU5vZGUpIHtcbiAgICAgIHZhciBlXzEsIF9hO1xuXG4gICAgICBzdGF0ZU5vZGUub3JkZXIgPSBvcmRlcisrO1xuXG4gICAgICB0cnkge1xuICAgICAgICBmb3IgKHZhciBfYiA9IF9fdmFsdWVzKGdldENoaWxkcmVuKHN0YXRlTm9kZSkpLCBfYyA9IF9iLm5leHQoKTsgIV9jLmRvbmU7IF9jID0gX2IubmV4dCgpKSB7XG4gICAgICAgICAgdmFyIGNoaWxkID0gX2MudmFsdWU7XG4gICAgICAgICAgZGZzKGNoaWxkKTtcbiAgICAgICAgfVxuICAgICAgfSBjYXRjaCAoZV8xXzEpIHtcbiAgICAgICAgZV8xID0ge1xuICAgICAgICAgIGVycm9yOiBlXzFfMVxuICAgICAgICB9O1xuICAgICAgfSBmaW5hbGx5IHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICBpZiAoX2MgJiYgIV9jLmRvbmUgJiYgKF9hID0gX2IucmV0dXJuKSkgX2EuY2FsbChfYik7XG4gICAgICAgIH0gZmluYWxseSB7XG4gICAgICAgICAgaWYgKGVfMSkgdGhyb3cgZV8xLmVycm9yO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgZGZzKHRoaXMpOyAvLyBIaXN0b3J5IGNvbmZpZ1xuXG4gICAgdGhpcy5oaXN0b3J5ID0gdGhpcy5jb25maWcuaGlzdG9yeSA9PT0gdHJ1ZSA/ICdzaGFsbG93JyA6IHRoaXMuY29uZmlnLmhpc3RvcnkgfHwgZmFsc2U7XG4gICAgdGhpcy5fdHJhbnNpZW50ID0gISF0aGlzLmNvbmZpZy5hbHdheXMgfHwgKCF0aGlzLmNvbmZpZy5vbiA/IGZhbHNlIDogQXJyYXkuaXNBcnJheSh0aGlzLmNvbmZpZy5vbikgPyB0aGlzLmNvbmZpZy5vbi5zb21lKGZ1bmN0aW9uIChfYSkge1xuICAgICAgdmFyIGV2ZW50ID0gX2EuZXZlbnQ7XG4gICAgICByZXR1cm4gZXZlbnQgPT09IE5VTExfRVZFTlQ7XG4gICAgfSkgOiBOVUxMX0VWRU5UIGluIHRoaXMuY29uZmlnLm9uKTtcbiAgICB0aGlzLnN0cmljdCA9ICEhdGhpcy5jb25maWcuc3RyaWN0OyAvLyBUT0RPOiBkZXByZWNhdGUgKGVudHJ5KVxuXG4gICAgdGhpcy5vbkVudHJ5ID0gdG9BcnJheSh0aGlzLmNvbmZpZy5lbnRyeSB8fCB0aGlzLmNvbmZpZy5vbkVudHJ5KS5tYXAoZnVuY3Rpb24gKGFjdGlvbikge1xuICAgICAgcmV0dXJuIHRvQWN0aW9uT2JqZWN0KGFjdGlvbik7XG4gICAgfSk7IC8vIFRPRE86IGRlcHJlY2F0ZSAoZXhpdClcblxuICAgIHRoaXMub25FeGl0ID0gdG9BcnJheSh0aGlzLmNvbmZpZy5leGl0IHx8IHRoaXMuY29uZmlnLm9uRXhpdCkubWFwKGZ1bmN0aW9uIChhY3Rpb24pIHtcbiAgICAgIHJldHVybiB0b0FjdGlvbk9iamVjdChhY3Rpb24pO1xuICAgIH0pO1xuICAgIHRoaXMubWV0YSA9IHRoaXMuY29uZmlnLm1ldGE7XG4gICAgdGhpcy5kb25lRGF0YSA9IHRoaXMudHlwZSA9PT0gJ2ZpbmFsJyA/IHRoaXMuY29uZmlnLmRhdGEgOiB1bmRlZmluZWQ7XG4gICAgdGhpcy5pbnZva2UgPSB0b0FycmF5KHRoaXMuY29uZmlnLmludm9rZSkubWFwKGZ1bmN0aW9uIChpbnZva2VDb25maWcsIGkpIHtcbiAgICAgIHZhciBfYSwgX2I7XG5cbiAgICAgIGlmIChpc01hY2hpbmUoaW52b2tlQ29uZmlnKSkge1xuICAgICAgICBfdGhpcy5tYWNoaW5lLm9wdGlvbnMuc2VydmljZXMgPSBfX2Fzc2lnbigoX2EgPSB7fSwgX2FbaW52b2tlQ29uZmlnLmlkXSA9IGludm9rZUNvbmZpZywgX2EpLCBfdGhpcy5tYWNoaW5lLm9wdGlvbnMuc2VydmljZXMpO1xuICAgICAgICByZXR1cm4gdG9JbnZva2VEZWZpbml0aW9uKHtcbiAgICAgICAgICBzcmM6IGludm9rZUNvbmZpZy5pZCxcbiAgICAgICAgICBpZDogaW52b2tlQ29uZmlnLmlkXG4gICAgICAgIH0pO1xuICAgICAgfSBlbHNlIGlmIChpc1N0cmluZyhpbnZva2VDb25maWcuc3JjKSkge1xuICAgICAgICByZXR1cm4gdG9JbnZva2VEZWZpbml0aW9uKF9fYXNzaWduKF9fYXNzaWduKHt9LCBpbnZva2VDb25maWcpLCB7XG4gICAgICAgICAgaWQ6IGludm9rZUNvbmZpZy5pZCB8fCBpbnZva2VDb25maWcuc3JjLFxuICAgICAgICAgIHNyYzogaW52b2tlQ29uZmlnLnNyY1xuICAgICAgICB9KSk7XG4gICAgICB9IGVsc2UgaWYgKGlzTWFjaGluZShpbnZva2VDb25maWcuc3JjKSB8fCBpc0Z1bmN0aW9uKGludm9rZUNvbmZpZy5zcmMpKSB7XG4gICAgICAgIHZhciBpbnZva2VTcmMgPSBfdGhpcy5pZCArIFwiOmludm9jYXRpb25bXCIgKyBpICsgXCJdXCI7IC8vIFRPRE86IHV0aWwgZnVuY3Rpb25cblxuICAgICAgICBfdGhpcy5tYWNoaW5lLm9wdGlvbnMuc2VydmljZXMgPSBfX2Fzc2lnbigoX2IgPSB7fSwgX2JbaW52b2tlU3JjXSA9IGludm9rZUNvbmZpZy5zcmMsIF9iKSwgX3RoaXMubWFjaGluZS5vcHRpb25zLnNlcnZpY2VzKTtcbiAgICAgICAgcmV0dXJuIHRvSW52b2tlRGVmaW5pdGlvbihfX2Fzc2lnbihfX2Fzc2lnbih7XG4gICAgICAgICAgaWQ6IGludm9rZVNyY1xuICAgICAgICB9LCBpbnZva2VDb25maWcpLCB7XG4gICAgICAgICAgc3JjOiBpbnZva2VTcmNcbiAgICAgICAgfSkpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdmFyIGludm9rZVNvdXJjZSA9IGludm9rZUNvbmZpZy5zcmM7XG4gICAgICAgIHJldHVybiB0b0ludm9rZURlZmluaXRpb24oX19hc3NpZ24oX19hc3NpZ24oe1xuICAgICAgICAgIGlkOiBpbnZva2VTb3VyY2UudHlwZVxuICAgICAgICB9LCBpbnZva2VDb25maWcpLCB7XG4gICAgICAgICAgc3JjOiBpbnZva2VTb3VyY2VcbiAgICAgICAgfSkpO1xuICAgICAgfVxuICAgIH0pO1xuICAgIHRoaXMuYWN0aXZpdGllcyA9IHRvQXJyYXkodGhpcy5jb25maWcuYWN0aXZpdGllcykuY29uY2F0KHRoaXMuaW52b2tlKS5tYXAoZnVuY3Rpb24gKGFjdGl2aXR5KSB7XG4gICAgICByZXR1cm4gdG9BY3Rpdml0eURlZmluaXRpb24oYWN0aXZpdHkpO1xuICAgIH0pO1xuICAgIHRoaXMudHJhbnNpdGlvbiA9IHRoaXMudHJhbnNpdGlvbi5iaW5kKHRoaXMpOyAvLyBUT0RPOiB0aGlzIGlzIHRoZSByZWFsIGZpeCBmb3IgaW5pdGlhbGl6YXRpb24gb25jZVxuICAgIC8vIHN0YXRlIG5vZGUgZ2V0dGVycyBhcmUgZGVwcmVjYXRlZFxuICAgIC8vIGlmICghdGhpcy5wYXJlbnQpIHtcbiAgICAvLyAgIHRoaXMuX2luaXQoKTtcbiAgICAvLyB9XG4gIH1cblxuICBTdGF0ZU5vZGUucHJvdG90eXBlLl9pbml0ID0gZnVuY3Rpb24gKCkge1xuICAgIGlmICh0aGlzLl9fY2FjaGUudHJhbnNpdGlvbnMpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBnZXRBbGxTdGF0ZU5vZGVzKHRoaXMpLmZvckVhY2goZnVuY3Rpb24gKHN0YXRlTm9kZSkge1xuICAgICAgcmV0dXJuIHN0YXRlTm9kZS5vbjtcbiAgICB9KTtcbiAgfTtcbiAgLyoqXHJcbiAgICogQ2xvbmVzIHRoaXMgc3RhdGUgbWFjaGluZSB3aXRoIGN1c3RvbSBvcHRpb25zIGFuZCBjb250ZXh0LlxyXG4gICAqXHJcbiAgICogQHBhcmFtIG9wdGlvbnMgT3B0aW9ucyAoYWN0aW9ucywgZ3VhcmRzLCBhY3Rpdml0aWVzLCBzZXJ2aWNlcykgdG8gcmVjdXJzaXZlbHkgbWVyZ2Ugd2l0aCB0aGUgZXhpc3Rpbmcgb3B0aW9ucy5cclxuICAgKiBAcGFyYW0gY29udGV4dCBDdXN0b20gY29udGV4dCAod2lsbCBvdmVycmlkZSBwcmVkZWZpbmVkIGNvbnRleHQpXHJcbiAgICovXG5cblxuICBTdGF0ZU5vZGUucHJvdG90eXBlLndpdGhDb25maWcgPSBmdW5jdGlvbiAob3B0aW9ucywgY29udGV4dCkge1xuICAgIGlmIChjb250ZXh0ID09PSB2b2lkIDApIHtcbiAgICAgIGNvbnRleHQgPSB0aGlzLmNvbnRleHQ7XG4gICAgfVxuXG4gICAgdmFyIF9hID0gdGhpcy5vcHRpb25zLFxuICAgICAgICBhY3Rpb25zID0gX2EuYWN0aW9ucyxcbiAgICAgICAgYWN0aXZpdGllcyA9IF9hLmFjdGl2aXRpZXMsXG4gICAgICAgIGd1YXJkcyA9IF9hLmd1YXJkcyxcbiAgICAgICAgc2VydmljZXMgPSBfYS5zZXJ2aWNlcyxcbiAgICAgICAgZGVsYXlzID0gX2EuZGVsYXlzO1xuICAgIHJldHVybiBuZXcgU3RhdGVOb2RlKHRoaXMuY29uZmlnLCB7XG4gICAgICBhY3Rpb25zOiBfX2Fzc2lnbihfX2Fzc2lnbih7fSwgYWN0aW9ucyksIG9wdGlvbnMuYWN0aW9ucyksXG4gICAgICBhY3Rpdml0aWVzOiBfX2Fzc2lnbihfX2Fzc2lnbih7fSwgYWN0aXZpdGllcyksIG9wdGlvbnMuYWN0aXZpdGllcyksXG4gICAgICBndWFyZHM6IF9fYXNzaWduKF9fYXNzaWduKHt9LCBndWFyZHMpLCBvcHRpb25zLmd1YXJkcyksXG4gICAgICBzZXJ2aWNlczogX19hc3NpZ24oX19hc3NpZ24oe30sIHNlcnZpY2VzKSwgb3B0aW9ucy5zZXJ2aWNlcyksXG4gICAgICBkZWxheXM6IF9fYXNzaWduKF9fYXNzaWduKHt9LCBkZWxheXMpLCBvcHRpb25zLmRlbGF5cylcbiAgICB9LCBjb250ZXh0KTtcbiAgfTtcbiAgLyoqXHJcbiAgICogQ2xvbmVzIHRoaXMgc3RhdGUgbWFjaGluZSB3aXRoIGN1c3RvbSBjb250ZXh0LlxyXG4gICAqXHJcbiAgICogQHBhcmFtIGNvbnRleHQgQ3VzdG9tIGNvbnRleHQgKHdpbGwgb3ZlcnJpZGUgcHJlZGVmaW5lZCBjb250ZXh0LCBub3QgcmVjdXJzaXZlKVxyXG4gICAqL1xuXG5cbiAgU3RhdGVOb2RlLnByb3RvdHlwZS53aXRoQ29udGV4dCA9IGZ1bmN0aW9uIChjb250ZXh0KSB7XG4gICAgcmV0dXJuIG5ldyBTdGF0ZU5vZGUodGhpcy5jb25maWcsIHRoaXMub3B0aW9ucywgY29udGV4dCk7XG4gIH07XG5cbiAgT2JqZWN0LmRlZmluZVByb3BlcnR5KFN0YXRlTm9kZS5wcm90b3R5cGUsIFwiZGVmaW5pdGlvblwiLCB7XG4gICAgLyoqXHJcbiAgICAgKiBUaGUgd2VsbC1zdHJ1Y3R1cmVkIHN0YXRlIG5vZGUgZGVmaW5pdGlvbi5cclxuICAgICAqL1xuICAgIGdldDogZnVuY3Rpb24gKCkge1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgaWQ6IHRoaXMuaWQsXG4gICAgICAgIGtleTogdGhpcy5rZXksXG4gICAgICAgIHZlcnNpb246IHRoaXMudmVyc2lvbixcbiAgICAgICAgY29udGV4dDogdGhpcy5jb250ZXh0LFxuICAgICAgICB0eXBlOiB0aGlzLnR5cGUsXG4gICAgICAgIGluaXRpYWw6IHRoaXMuaW5pdGlhbCxcbiAgICAgICAgaGlzdG9yeTogdGhpcy5oaXN0b3J5LFxuICAgICAgICBzdGF0ZXM6IG1hcFZhbHVlcyh0aGlzLnN0YXRlcywgZnVuY3Rpb24gKHN0YXRlKSB7XG4gICAgICAgICAgcmV0dXJuIHN0YXRlLmRlZmluaXRpb247XG4gICAgICAgIH0pLFxuICAgICAgICBvbjogdGhpcy5vbixcbiAgICAgICAgdHJhbnNpdGlvbnM6IHRoaXMudHJhbnNpdGlvbnMsXG4gICAgICAgIGVudHJ5OiB0aGlzLm9uRW50cnksXG4gICAgICAgIGV4aXQ6IHRoaXMub25FeGl0LFxuICAgICAgICBhY3Rpdml0aWVzOiB0aGlzLmFjdGl2aXRpZXMgfHwgW10sXG4gICAgICAgIG1ldGE6IHRoaXMubWV0YSxcbiAgICAgICAgb3JkZXI6IHRoaXMub3JkZXIgfHwgLTEsXG4gICAgICAgIGRhdGE6IHRoaXMuZG9uZURhdGEsXG4gICAgICAgIGludm9rZTogdGhpcy5pbnZva2VcbiAgICAgIH07XG4gICAgfSxcbiAgICBlbnVtZXJhYmxlOiBmYWxzZSxcbiAgICBjb25maWd1cmFibGU6IHRydWVcbiAgfSk7XG5cbiAgU3RhdGVOb2RlLnByb3RvdHlwZS50b0pTT04gPSBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIHRoaXMuZGVmaW5pdGlvbjtcbiAgfTtcblxuICBPYmplY3QuZGVmaW5lUHJvcGVydHkoU3RhdGVOb2RlLnByb3RvdHlwZSwgXCJvblwiLCB7XG4gICAgLyoqXHJcbiAgICAgKiBUaGUgbWFwcGluZyBvZiBldmVudHMgdG8gdHJhbnNpdGlvbnMuXHJcbiAgICAgKi9cbiAgICBnZXQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgIGlmICh0aGlzLl9fY2FjaGUub24pIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX19jYWNoZS5vbjtcbiAgICAgIH1cblxuICAgICAgdmFyIHRyYW5zaXRpb25zID0gdGhpcy50cmFuc2l0aW9ucztcbiAgICAgIHJldHVybiB0aGlzLl9fY2FjaGUub24gPSB0cmFuc2l0aW9ucy5yZWR1Y2UoZnVuY3Rpb24gKG1hcCwgdHJhbnNpdGlvbikge1xuICAgICAgICBtYXBbdHJhbnNpdGlvbi5ldmVudFR5cGVdID0gbWFwW3RyYW5zaXRpb24uZXZlbnRUeXBlXSB8fCBbXTtcbiAgICAgICAgbWFwW3RyYW5zaXRpb24uZXZlbnRUeXBlXS5wdXNoKHRyYW5zaXRpb24pO1xuICAgICAgICByZXR1cm4gbWFwO1xuICAgICAgfSwge30pO1xuICAgIH0sXG4gICAgZW51bWVyYWJsZTogZmFsc2UsXG4gICAgY29uZmlndXJhYmxlOiB0cnVlXG4gIH0pO1xuICBPYmplY3QuZGVmaW5lUHJvcGVydHkoU3RhdGVOb2RlLnByb3RvdHlwZSwgXCJhZnRlclwiLCB7XG4gICAgZ2V0OiBmdW5jdGlvbiAoKSB7XG4gICAgICByZXR1cm4gdGhpcy5fX2NhY2hlLmRlbGF5ZWRUcmFuc2l0aW9ucyB8fCAodGhpcy5fX2NhY2hlLmRlbGF5ZWRUcmFuc2l0aW9ucyA9IHRoaXMuZ2V0RGVsYXllZFRyYW5zaXRpb25zKCksIHRoaXMuX19jYWNoZS5kZWxheWVkVHJhbnNpdGlvbnMpO1xuICAgIH0sXG4gICAgZW51bWVyYWJsZTogZmFsc2UsXG4gICAgY29uZmlndXJhYmxlOiB0cnVlXG4gIH0pO1xuICBPYmplY3QuZGVmaW5lUHJvcGVydHkoU3RhdGVOb2RlLnByb3RvdHlwZSwgXCJ0cmFuc2l0aW9uc1wiLCB7XG4gICAgLyoqXHJcbiAgICAgKiBBbGwgdGhlIHRyYW5zaXRpb25zIHRoYXQgY2FuIGJlIHRha2VuIGZyb20gdGhpcyBzdGF0ZSBub2RlLlxyXG4gICAgICovXG4gICAgZ2V0OiBmdW5jdGlvbiAoKSB7XG4gICAgICByZXR1cm4gdGhpcy5fX2NhY2hlLnRyYW5zaXRpb25zIHx8ICh0aGlzLl9fY2FjaGUudHJhbnNpdGlvbnMgPSB0aGlzLmZvcm1hdFRyYW5zaXRpb25zKCksIHRoaXMuX19jYWNoZS50cmFuc2l0aW9ucyk7XG4gICAgfSxcbiAgICBlbnVtZXJhYmxlOiBmYWxzZSxcbiAgICBjb25maWd1cmFibGU6IHRydWVcbiAgfSk7XG5cbiAgU3RhdGVOb2RlLnByb3RvdHlwZS5nZXRDYW5kaWRhdGVzID0gZnVuY3Rpb24gKGV2ZW50TmFtZSkge1xuICAgIGlmICh0aGlzLl9fY2FjaGUuY2FuZGlkYXRlc1tldmVudE5hbWVdKSB7XG4gICAgICByZXR1cm4gdGhpcy5fX2NhY2hlLmNhbmRpZGF0ZXNbZXZlbnROYW1lXTtcbiAgICB9XG5cbiAgICB2YXIgdHJhbnNpZW50ID0gZXZlbnROYW1lID09PSBOVUxMX0VWRU5UO1xuICAgIHZhciBjYW5kaWRhdGVzID0gdGhpcy50cmFuc2l0aW9ucy5maWx0ZXIoZnVuY3Rpb24gKHRyYW5zaXRpb24pIHtcbiAgICAgIHZhciBzYW1lRXZlbnRUeXBlID0gdHJhbnNpdGlvbi5ldmVudFR5cGUgPT09IGV2ZW50TmFtZTsgLy8gbnVsbCBldmVudHMgc2hvdWxkIG9ubHkgbWF0Y2ggYWdhaW5zdCBldmVudGxlc3MgdHJhbnNpdGlvbnNcblxuICAgICAgcmV0dXJuIHRyYW5zaWVudCA/IHNhbWVFdmVudFR5cGUgOiBzYW1lRXZlbnRUeXBlIHx8IHRyYW5zaXRpb24uZXZlbnRUeXBlID09PSBXSUxEQ0FSRDtcbiAgICB9KTtcbiAgICB0aGlzLl9fY2FjaGUuY2FuZGlkYXRlc1tldmVudE5hbWVdID0gY2FuZGlkYXRlcztcbiAgICByZXR1cm4gY2FuZGlkYXRlcztcbiAgfTtcbiAgLyoqXHJcbiAgICogQWxsIGRlbGF5ZWQgdHJhbnNpdGlvbnMgZnJvbSB0aGUgY29uZmlnLlxyXG4gICAqL1xuXG5cbiAgU3RhdGVOb2RlLnByb3RvdHlwZS5nZXREZWxheWVkVHJhbnNpdGlvbnMgPSBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIF90aGlzID0gdGhpcztcblxuICAgIHZhciBhZnRlckNvbmZpZyA9IHRoaXMuY29uZmlnLmFmdGVyO1xuXG4gICAgaWYgKCFhZnRlckNvbmZpZykge1xuICAgICAgcmV0dXJuIFtdO1xuICAgIH1cblxuICAgIHZhciBtdXRhdGVFbnRyeUV4aXQgPSBmdW5jdGlvbiAoZGVsYXksIGkpIHtcbiAgICAgIHZhciBkZWxheVJlZiA9IGlzRnVuY3Rpb24oZGVsYXkpID8gX3RoaXMuaWQgKyBcIjpkZWxheVtcIiArIGkgKyBcIl1cIiA6IGRlbGF5O1xuICAgICAgdmFyIGV2ZW50VHlwZSA9IGFmdGVyKGRlbGF5UmVmLCBfdGhpcy5pZCk7XG5cbiAgICAgIF90aGlzLm9uRW50cnkucHVzaChzZW5kKGV2ZW50VHlwZSwge1xuICAgICAgICBkZWxheTogZGVsYXlcbiAgICAgIH0pKTtcblxuICAgICAgX3RoaXMub25FeGl0LnB1c2goY2FuY2VsKGV2ZW50VHlwZSkpO1xuXG4gICAgICByZXR1cm4gZXZlbnRUeXBlO1xuICAgIH07XG5cbiAgICB2YXIgZGVsYXllZFRyYW5zaXRpb25zID0gaXNBcnJheShhZnRlckNvbmZpZykgPyBhZnRlckNvbmZpZy5tYXAoZnVuY3Rpb24gKHRyYW5zaXRpb24sIGkpIHtcbiAgICAgIHZhciBldmVudFR5cGUgPSBtdXRhdGVFbnRyeUV4aXQodHJhbnNpdGlvbi5kZWxheSwgaSk7XG4gICAgICByZXR1cm4gX19hc3NpZ24oX19hc3NpZ24oe30sIHRyYW5zaXRpb24pLCB7XG4gICAgICAgIGV2ZW50OiBldmVudFR5cGVcbiAgICAgIH0pO1xuICAgIH0pIDogZmxhdHRlbihrZXlzKGFmdGVyQ29uZmlnKS5tYXAoZnVuY3Rpb24gKGRlbGF5LCBpKSB7XG4gICAgICB2YXIgY29uZmlnVHJhbnNpdGlvbiA9IGFmdGVyQ29uZmlnW2RlbGF5XTtcbiAgICAgIHZhciByZXNvbHZlZFRyYW5zaXRpb24gPSBpc1N0cmluZyhjb25maWdUcmFuc2l0aW9uKSA/IHtcbiAgICAgICAgdGFyZ2V0OiBjb25maWdUcmFuc2l0aW9uXG4gICAgICB9IDogY29uZmlnVHJhbnNpdGlvbjtcbiAgICAgIHZhciByZXNvbHZlZERlbGF5ID0gIWlzTmFOKCtkZWxheSkgPyArZGVsYXkgOiBkZWxheTtcbiAgICAgIHZhciBldmVudFR5cGUgPSBtdXRhdGVFbnRyeUV4aXQocmVzb2x2ZWREZWxheSwgaSk7XG4gICAgICByZXR1cm4gdG9BcnJheShyZXNvbHZlZFRyYW5zaXRpb24pLm1hcChmdW5jdGlvbiAodHJhbnNpdGlvbikge1xuICAgICAgICByZXR1cm4gX19hc3NpZ24oX19hc3NpZ24oe30sIHRyYW5zaXRpb24pLCB7XG4gICAgICAgICAgZXZlbnQ6IGV2ZW50VHlwZSxcbiAgICAgICAgICBkZWxheTogcmVzb2x2ZWREZWxheVxuICAgICAgICB9KTtcbiAgICAgIH0pO1xuICAgIH0pKTtcbiAgICByZXR1cm4gZGVsYXllZFRyYW5zaXRpb25zLm1hcChmdW5jdGlvbiAoZGVsYXllZFRyYW5zaXRpb24pIHtcbiAgICAgIHZhciBkZWxheSA9IGRlbGF5ZWRUcmFuc2l0aW9uLmRlbGF5O1xuICAgICAgcmV0dXJuIF9fYXNzaWduKF9fYXNzaWduKHt9LCBfdGhpcy5mb3JtYXRUcmFuc2l0aW9uKGRlbGF5ZWRUcmFuc2l0aW9uKSksIHtcbiAgICAgICAgZGVsYXk6IGRlbGF5XG4gICAgICB9KTtcbiAgICB9KTtcbiAgfTtcbiAgLyoqXHJcbiAgICogUmV0dXJucyB0aGUgc3RhdGUgbm9kZXMgcmVwcmVzZW50ZWQgYnkgdGhlIGN1cnJlbnQgc3RhdGUgdmFsdWUuXHJcbiAgICpcclxuICAgKiBAcGFyYW0gc3RhdGUgVGhlIHN0YXRlIHZhbHVlIG9yIFN0YXRlIGluc3RhbmNlXHJcbiAgICovXG5cblxuICBTdGF0ZU5vZGUucHJvdG90eXBlLmdldFN0YXRlTm9kZXMgPSBmdW5jdGlvbiAoc3RhdGUpIHtcbiAgICB2YXIgX2E7XG5cbiAgICB2YXIgX3RoaXMgPSB0aGlzO1xuXG4gICAgaWYgKCFzdGF0ZSkge1xuICAgICAgcmV0dXJuIFtdO1xuICAgIH1cblxuICAgIHZhciBzdGF0ZVZhbHVlID0gc3RhdGUgaW5zdGFuY2VvZiBTdGF0ZSA/IHN0YXRlLnZhbHVlIDogdG9TdGF0ZVZhbHVlKHN0YXRlLCB0aGlzLmRlbGltaXRlcik7XG5cbiAgICBpZiAoaXNTdHJpbmcoc3RhdGVWYWx1ZSkpIHtcbiAgICAgIHZhciBpbml0aWFsU3RhdGVWYWx1ZSA9IHRoaXMuZ2V0U3RhdGVOb2RlKHN0YXRlVmFsdWUpLmluaXRpYWw7XG4gICAgICByZXR1cm4gaW5pdGlhbFN0YXRlVmFsdWUgIT09IHVuZGVmaW5lZCA/IHRoaXMuZ2V0U3RhdGVOb2RlcygoX2EgPSB7fSwgX2Fbc3RhdGVWYWx1ZV0gPSBpbml0aWFsU3RhdGVWYWx1ZSwgX2EpKSA6IFt0aGlzLnN0YXRlc1tzdGF0ZVZhbHVlXV07XG4gICAgfVxuXG4gICAgdmFyIHN1YlN0YXRlS2V5cyA9IGtleXMoc3RhdGVWYWx1ZSk7XG4gICAgdmFyIHN1YlN0YXRlTm9kZXMgPSBzdWJTdGF0ZUtleXMubWFwKGZ1bmN0aW9uIChzdWJTdGF0ZUtleSkge1xuICAgICAgcmV0dXJuIF90aGlzLmdldFN0YXRlTm9kZShzdWJTdGF0ZUtleSk7XG4gICAgfSk7XG4gICAgcmV0dXJuIHN1YlN0YXRlTm9kZXMuY29uY2F0KHN1YlN0YXRlS2V5cy5yZWR1Y2UoZnVuY3Rpb24gKGFsbFN1YlN0YXRlTm9kZXMsIHN1YlN0YXRlS2V5KSB7XG4gICAgICB2YXIgc3ViU3RhdGVOb2RlID0gX3RoaXMuZ2V0U3RhdGVOb2RlKHN1YlN0YXRlS2V5KS5nZXRTdGF0ZU5vZGVzKHN0YXRlVmFsdWVbc3ViU3RhdGVLZXldKTtcblxuICAgICAgcmV0dXJuIGFsbFN1YlN0YXRlTm9kZXMuY29uY2F0KHN1YlN0YXRlTm9kZSk7XG4gICAgfSwgW10pKTtcbiAgfTtcbiAgLyoqXHJcbiAgICogUmV0dXJucyBgdHJ1ZWAgaWYgdGhpcyBzdGF0ZSBub2RlIGV4cGxpY2l0bHkgaGFuZGxlcyB0aGUgZ2l2ZW4gZXZlbnQuXHJcbiAgICpcclxuICAgKiBAcGFyYW0gZXZlbnQgVGhlIGV2ZW50IGluIHF1ZXN0aW9uXHJcbiAgICovXG5cblxuICBTdGF0ZU5vZGUucHJvdG90eXBlLmhhbmRsZXMgPSBmdW5jdGlvbiAoZXZlbnQpIHtcbiAgICB2YXIgZXZlbnRUeXBlID0gZ2V0RXZlbnRUeXBlKGV2ZW50KTtcbiAgICByZXR1cm4gdGhpcy5ldmVudHMuaW5jbHVkZXMoZXZlbnRUeXBlKTtcbiAgfTtcbiAgLyoqXHJcbiAgICogUmVzb2x2ZXMgdGhlIGdpdmVuIGBzdGF0ZWAgdG8gYSBuZXcgYFN0YXRlYCBpbnN0YW5jZSByZWxhdGl2ZSB0byB0aGlzIG1hY2hpbmUuXHJcbiAgICpcclxuICAgKiBUaGlzIGVuc3VyZXMgdGhhdCBgLmV2ZW50c2AgYW5kIGAubmV4dEV2ZW50c2AgcmVwcmVzZW50IHRoZSBjb3JyZWN0IHZhbHVlcy5cclxuICAgKlxyXG4gICAqIEBwYXJhbSBzdGF0ZSBUaGUgc3RhdGUgdG8gcmVzb2x2ZVxyXG4gICAqL1xuXG5cbiAgU3RhdGVOb2RlLnByb3RvdHlwZS5yZXNvbHZlU3RhdGUgPSBmdW5jdGlvbiAoc3RhdGUpIHtcbiAgICB2YXIgY29uZmlndXJhdGlvbiA9IEFycmF5LmZyb20oZ2V0Q29uZmlndXJhdGlvbihbXSwgdGhpcy5nZXRTdGF0ZU5vZGVzKHN0YXRlLnZhbHVlKSkpO1xuICAgIHJldHVybiBuZXcgU3RhdGUoX19hc3NpZ24oX19hc3NpZ24oe30sIHN0YXRlKSwge1xuICAgICAgdmFsdWU6IHRoaXMucmVzb2x2ZShzdGF0ZS52YWx1ZSksXG4gICAgICBjb25maWd1cmF0aW9uOiBjb25maWd1cmF0aW9uXG4gICAgfSkpO1xuICB9O1xuXG4gIFN0YXRlTm9kZS5wcm90b3R5cGUudHJhbnNpdGlvbkxlYWZOb2RlID0gZnVuY3Rpb24gKHN0YXRlVmFsdWUsIHN0YXRlLCBfZXZlbnQpIHtcbiAgICB2YXIgc3RhdGVOb2RlID0gdGhpcy5nZXRTdGF0ZU5vZGUoc3RhdGVWYWx1ZSk7XG4gICAgdmFyIG5leHQgPSBzdGF0ZU5vZGUubmV4dChzdGF0ZSwgX2V2ZW50KTtcblxuICAgIGlmICghbmV4dCB8fCAhbmV4dC50cmFuc2l0aW9ucy5sZW5ndGgpIHtcbiAgICAgIHJldHVybiB0aGlzLm5leHQoc3RhdGUsIF9ldmVudCk7XG4gICAgfVxuXG4gICAgcmV0dXJuIG5leHQ7XG4gIH07XG5cbiAgU3RhdGVOb2RlLnByb3RvdHlwZS50cmFuc2l0aW9uQ29tcG91bmROb2RlID0gZnVuY3Rpb24gKHN0YXRlVmFsdWUsIHN0YXRlLCBfZXZlbnQpIHtcbiAgICB2YXIgc3ViU3RhdGVLZXlzID0ga2V5cyhzdGF0ZVZhbHVlKTtcbiAgICB2YXIgc3RhdGVOb2RlID0gdGhpcy5nZXRTdGF0ZU5vZGUoc3ViU3RhdGVLZXlzWzBdKTtcblxuICAgIHZhciBuZXh0ID0gc3RhdGVOb2RlLl90cmFuc2l0aW9uKHN0YXRlVmFsdWVbc3ViU3RhdGVLZXlzWzBdXSwgc3RhdGUsIF9ldmVudCk7XG5cbiAgICBpZiAoIW5leHQgfHwgIW5leHQudHJhbnNpdGlvbnMubGVuZ3RoKSB7XG4gICAgICByZXR1cm4gdGhpcy5uZXh0KHN0YXRlLCBfZXZlbnQpO1xuICAgIH1cblxuICAgIHJldHVybiBuZXh0O1xuICB9O1xuXG4gIFN0YXRlTm9kZS5wcm90b3R5cGUudHJhbnNpdGlvblBhcmFsbGVsTm9kZSA9IGZ1bmN0aW9uIChzdGF0ZVZhbHVlLCBzdGF0ZSwgX2V2ZW50KSB7XG4gICAgdmFyIGVfMiwgX2E7XG5cbiAgICB2YXIgdHJhbnNpdGlvbk1hcCA9IHt9O1xuXG4gICAgdHJ5IHtcbiAgICAgIGZvciAodmFyIF9iID0gX192YWx1ZXMoa2V5cyhzdGF0ZVZhbHVlKSksIF9jID0gX2IubmV4dCgpOyAhX2MuZG9uZTsgX2MgPSBfYi5uZXh0KCkpIHtcbiAgICAgICAgdmFyIHN1YlN0YXRlS2V5ID0gX2MudmFsdWU7XG4gICAgICAgIHZhciBzdWJTdGF0ZVZhbHVlID0gc3RhdGVWYWx1ZVtzdWJTdGF0ZUtleV07XG5cbiAgICAgICAgaWYgKCFzdWJTdGF0ZVZhbHVlKSB7XG4gICAgICAgICAgY29udGludWU7XG4gICAgICAgIH1cblxuICAgICAgICB2YXIgc3ViU3RhdGVOb2RlID0gdGhpcy5nZXRTdGF0ZU5vZGUoc3ViU3RhdGVLZXkpO1xuXG4gICAgICAgIHZhciBuZXh0ID0gc3ViU3RhdGVOb2RlLl90cmFuc2l0aW9uKHN1YlN0YXRlVmFsdWUsIHN0YXRlLCBfZXZlbnQpO1xuXG4gICAgICAgIGlmIChuZXh0KSB7XG4gICAgICAgICAgdHJhbnNpdGlvbk1hcFtzdWJTdGF0ZUtleV0gPSBuZXh0O1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSBjYXRjaCAoZV8yXzEpIHtcbiAgICAgIGVfMiA9IHtcbiAgICAgICAgZXJyb3I6IGVfMl8xXG4gICAgICB9O1xuICAgIH0gZmluYWxseSB7XG4gICAgICB0cnkge1xuICAgICAgICBpZiAoX2MgJiYgIV9jLmRvbmUgJiYgKF9hID0gX2IucmV0dXJuKSkgX2EuY2FsbChfYik7XG4gICAgICB9IGZpbmFsbHkge1xuICAgICAgICBpZiAoZV8yKSB0aHJvdyBlXzIuZXJyb3I7XG4gICAgICB9XG4gICAgfVxuXG4gICAgdmFyIHN0YXRlVHJhbnNpdGlvbnMgPSBrZXlzKHRyYW5zaXRpb25NYXApLm1hcChmdW5jdGlvbiAoa2V5KSB7XG4gICAgICByZXR1cm4gdHJhbnNpdGlvbk1hcFtrZXldO1xuICAgIH0pO1xuICAgIHZhciBlbmFibGVkVHJhbnNpdGlvbnMgPSBmbGF0dGVuKHN0YXRlVHJhbnNpdGlvbnMubWFwKGZ1bmN0aW9uIChzdCkge1xuICAgICAgcmV0dXJuIHN0LnRyYW5zaXRpb25zO1xuICAgIH0pKTtcbiAgICB2YXIgd2lsbFRyYW5zaXRpb24gPSBzdGF0ZVRyYW5zaXRpb25zLnNvbWUoZnVuY3Rpb24gKHN0KSB7XG4gICAgICByZXR1cm4gc3QudHJhbnNpdGlvbnMubGVuZ3RoID4gMDtcbiAgICB9KTtcblxuICAgIGlmICghd2lsbFRyYW5zaXRpb24pIHtcbiAgICAgIHJldHVybiB0aGlzLm5leHQoc3RhdGUsIF9ldmVudCk7XG4gICAgfVxuXG4gICAgdmFyIGVudHJ5Tm9kZXMgPSBmbGF0dGVuKHN0YXRlVHJhbnNpdGlvbnMubWFwKGZ1bmN0aW9uICh0KSB7XG4gICAgICByZXR1cm4gdC5lbnRyeVNldDtcbiAgICB9KSk7XG4gICAgdmFyIGNvbmZpZ3VyYXRpb24gPSBmbGF0dGVuKGtleXModHJhbnNpdGlvbk1hcCkubWFwKGZ1bmN0aW9uIChrZXkpIHtcbiAgICAgIHJldHVybiB0cmFuc2l0aW9uTWFwW2tleV0uY29uZmlndXJhdGlvbjtcbiAgICB9KSk7XG4gICAgcmV0dXJuIHtcbiAgICAgIHRyYW5zaXRpb25zOiBlbmFibGVkVHJhbnNpdGlvbnMsXG4gICAgICBlbnRyeVNldDogZW50cnlOb2RlcyxcbiAgICAgIGV4aXRTZXQ6IGZsYXR0ZW4oc3RhdGVUcmFuc2l0aW9ucy5tYXAoZnVuY3Rpb24gKHQpIHtcbiAgICAgICAgcmV0dXJuIHQuZXhpdFNldDtcbiAgICAgIH0pKSxcbiAgICAgIGNvbmZpZ3VyYXRpb246IGNvbmZpZ3VyYXRpb24sXG4gICAgICBzb3VyY2U6IHN0YXRlLFxuICAgICAgYWN0aW9uczogZmxhdHRlbihrZXlzKHRyYW5zaXRpb25NYXApLm1hcChmdW5jdGlvbiAoa2V5KSB7XG4gICAgICAgIHJldHVybiB0cmFuc2l0aW9uTWFwW2tleV0uYWN0aW9ucztcbiAgICAgIH0pKVxuICAgIH07XG4gIH07XG5cbiAgU3RhdGVOb2RlLnByb3RvdHlwZS5fdHJhbnNpdGlvbiA9IGZ1bmN0aW9uIChzdGF0ZVZhbHVlLCBzdGF0ZSwgX2V2ZW50KSB7XG4gICAgLy8gbGVhZiBub2RlXG4gICAgaWYgKGlzU3RyaW5nKHN0YXRlVmFsdWUpKSB7XG4gICAgICByZXR1cm4gdGhpcy50cmFuc2l0aW9uTGVhZk5vZGUoc3RhdGVWYWx1ZSwgc3RhdGUsIF9ldmVudCk7XG4gICAgfSAvLyBoaWVyYXJjaGljYWwgbm9kZVxuXG5cbiAgICBpZiAoa2V5cyhzdGF0ZVZhbHVlKS5sZW5ndGggPT09IDEpIHtcbiAgICAgIHJldHVybiB0aGlzLnRyYW5zaXRpb25Db21wb3VuZE5vZGUoc3RhdGVWYWx1ZSwgc3RhdGUsIF9ldmVudCk7XG4gICAgfSAvLyBvcnRob2dvbmFsIG5vZGVcblxuXG4gICAgcmV0dXJuIHRoaXMudHJhbnNpdGlvblBhcmFsbGVsTm9kZShzdGF0ZVZhbHVlLCBzdGF0ZSwgX2V2ZW50KTtcbiAgfTtcblxuICBTdGF0ZU5vZGUucHJvdG90eXBlLm5leHQgPSBmdW5jdGlvbiAoc3RhdGUsIF9ldmVudCkge1xuICAgIHZhciBlXzMsIF9hO1xuXG4gICAgdmFyIF90aGlzID0gdGhpcztcblxuICAgIHZhciBldmVudE5hbWUgPSBfZXZlbnQubmFtZTtcbiAgICB2YXIgYWN0aW9ucyA9IFtdO1xuICAgIHZhciBuZXh0U3RhdGVOb2RlcyA9IFtdO1xuICAgIHZhciBzZWxlY3RlZFRyYW5zaXRpb247XG5cbiAgICB0cnkge1xuICAgICAgZm9yICh2YXIgX2IgPSBfX3ZhbHVlcyh0aGlzLmdldENhbmRpZGF0ZXMoZXZlbnROYW1lKSksIF9jID0gX2IubmV4dCgpOyAhX2MuZG9uZTsgX2MgPSBfYi5uZXh0KCkpIHtcbiAgICAgICAgdmFyIGNhbmRpZGF0ZSA9IF9jLnZhbHVlO1xuICAgICAgICB2YXIgY29uZCA9IGNhbmRpZGF0ZS5jb25kLFxuICAgICAgICAgICAgc3RhdGVJbiA9IGNhbmRpZGF0ZS5pbjtcbiAgICAgICAgdmFyIHJlc29sdmVkQ29udGV4dCA9IHN0YXRlLmNvbnRleHQ7XG4gICAgICAgIHZhciBpc0luU3RhdGUgPSBzdGF0ZUluID8gaXNTdHJpbmcoc3RhdGVJbikgJiYgaXNTdGF0ZUlkKHN0YXRlSW4pID8gLy8gQ2hlY2sgaWYgaW4gc3RhdGUgYnkgSURcbiAgICAgICAgc3RhdGUubWF0Y2hlcyh0b1N0YXRlVmFsdWUodGhpcy5nZXRTdGF0ZU5vZGVCeUlkKHN0YXRlSW4pLnBhdGgsIHRoaXMuZGVsaW1pdGVyKSkgOiAvLyBDaGVjayBpZiBpbiBzdGF0ZSBieSByZWxhdGl2ZSBncmFuZHBhcmVudFxuICAgICAgICBtYXRjaGVzU3RhdGUodG9TdGF0ZVZhbHVlKHN0YXRlSW4sIHRoaXMuZGVsaW1pdGVyKSwgcGF0aCh0aGlzLnBhdGguc2xpY2UoMCwgLTIpKShzdGF0ZS52YWx1ZSkpIDogdHJ1ZTtcbiAgICAgICAgdmFyIGd1YXJkUGFzc2VkID0gZmFsc2U7XG5cbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICBndWFyZFBhc3NlZCA9ICFjb25kIHx8IGV2YWx1YXRlR3VhcmQodGhpcy5tYWNoaW5lLCBjb25kLCByZXNvbHZlZENvbnRleHQsIF9ldmVudCwgc3RhdGUpO1xuICAgICAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJVbmFibGUgdG8gZXZhbHVhdGUgZ3VhcmQgJ1wiICsgKGNvbmQubmFtZSB8fCBjb25kLnR5cGUpICsgXCInIGluIHRyYW5zaXRpb24gZm9yIGV2ZW50ICdcIiArIGV2ZW50TmFtZSArIFwiJyBpbiBzdGF0ZSBub2RlICdcIiArIHRoaXMuaWQgKyBcIic6XFxuXCIgKyBlcnIubWVzc2FnZSk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoZ3VhcmRQYXNzZWQgJiYgaXNJblN0YXRlKSB7XG4gICAgICAgICAgaWYgKGNhbmRpZGF0ZS50YXJnZXQgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgbmV4dFN0YXRlTm9kZXMgPSBjYW5kaWRhdGUudGFyZ2V0O1xuICAgICAgICAgIH1cblxuICAgICAgICAgIGFjdGlvbnMucHVzaC5hcHBseShhY3Rpb25zLCBfX3NwcmVhZChjYW5kaWRhdGUuYWN0aW9ucykpO1xuICAgICAgICAgIHNlbGVjdGVkVHJhbnNpdGlvbiA9IGNhbmRpZGF0ZTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0gY2F0Y2ggKGVfM18xKSB7XG4gICAgICBlXzMgPSB7XG4gICAgICAgIGVycm9yOiBlXzNfMVxuICAgICAgfTtcbiAgICB9IGZpbmFsbHkge1xuICAgICAgdHJ5IHtcbiAgICAgICAgaWYgKF9jICYmICFfYy5kb25lICYmIChfYSA9IF9iLnJldHVybikpIF9hLmNhbGwoX2IpO1xuICAgICAgfSBmaW5hbGx5IHtcbiAgICAgICAgaWYgKGVfMykgdGhyb3cgZV8zLmVycm9yO1xuICAgICAgfVxuICAgIH1cblxuICAgIGlmICghc2VsZWN0ZWRUcmFuc2l0aW9uKSB7XG4gICAgICByZXR1cm4gdW5kZWZpbmVkO1xuICAgIH1cblxuICAgIGlmICghbmV4dFN0YXRlTm9kZXMubGVuZ3RoKSB7XG4gICAgICByZXR1cm4ge1xuICAgICAgICB0cmFuc2l0aW9uczogW3NlbGVjdGVkVHJhbnNpdGlvbl0sXG4gICAgICAgIGVudHJ5U2V0OiBbXSxcbiAgICAgICAgZXhpdFNldDogW10sXG4gICAgICAgIGNvbmZpZ3VyYXRpb246IHN0YXRlLnZhbHVlID8gW3RoaXNdIDogW10sXG4gICAgICAgIHNvdXJjZTogc3RhdGUsXG4gICAgICAgIGFjdGlvbnM6IGFjdGlvbnNcbiAgICAgIH07XG4gICAgfVxuXG4gICAgdmFyIGFsbE5leHRTdGF0ZU5vZGVzID0gZmxhdHRlbihuZXh0U3RhdGVOb2Rlcy5tYXAoZnVuY3Rpb24gKHN0YXRlTm9kZSkge1xuICAgICAgcmV0dXJuIF90aGlzLmdldFJlbGF0aXZlU3RhdGVOb2RlcyhzdGF0ZU5vZGUsIHN0YXRlLmhpc3RvcnlWYWx1ZSk7XG4gICAgfSkpO1xuICAgIHZhciBpc0ludGVybmFsID0gISFzZWxlY3RlZFRyYW5zaXRpb24uaW50ZXJuYWw7XG4gICAgdmFyIHJlZW50cnlOb2RlcyA9IGlzSW50ZXJuYWwgPyBbXSA6IGZsYXR0ZW4oYWxsTmV4dFN0YXRlTm9kZXMubWFwKGZ1bmN0aW9uIChuKSB7XG4gICAgICByZXR1cm4gX3RoaXMubm9kZXNGcm9tQ2hpbGQobik7XG4gICAgfSkpO1xuICAgIHJldHVybiB7XG4gICAgICB0cmFuc2l0aW9uczogW3NlbGVjdGVkVHJhbnNpdGlvbl0sXG4gICAgICBlbnRyeVNldDogcmVlbnRyeU5vZGVzLFxuICAgICAgZXhpdFNldDogaXNJbnRlcm5hbCA/IFtdIDogW3RoaXNdLFxuICAgICAgY29uZmlndXJhdGlvbjogYWxsTmV4dFN0YXRlTm9kZXMsXG4gICAgICBzb3VyY2U6IHN0YXRlLFxuICAgICAgYWN0aW9uczogYWN0aW9uc1xuICAgIH07XG4gIH07XG5cbiAgU3RhdGVOb2RlLnByb3RvdHlwZS5ub2Rlc0Zyb21DaGlsZCA9IGZ1bmN0aW9uIChjaGlsZFN0YXRlTm9kZSkge1xuICAgIGlmIChjaGlsZFN0YXRlTm9kZS5lc2NhcGVzKHRoaXMpKSB7XG4gICAgICByZXR1cm4gW107XG4gICAgfVxuXG4gICAgdmFyIG5vZGVzID0gW107XG4gICAgdmFyIG1hcmtlciA9IGNoaWxkU3RhdGVOb2RlO1xuXG4gICAgd2hpbGUgKG1hcmtlciAmJiBtYXJrZXIgIT09IHRoaXMpIHtcbiAgICAgIG5vZGVzLnB1c2gobWFya2VyKTtcbiAgICAgIG1hcmtlciA9IG1hcmtlci5wYXJlbnQ7XG4gICAgfVxuXG4gICAgbm9kZXMucHVzaCh0aGlzKTsgLy8gaW5jbHVzaXZlXG5cbiAgICByZXR1cm4gbm9kZXM7XG4gIH07XG4gIC8qKlxyXG4gICAqIFdoZXRoZXIgdGhlIGdpdmVuIHN0YXRlIG5vZGUgXCJlc2NhcGVzXCIgdGhpcyBzdGF0ZSBub2RlLiBJZiB0aGUgYHN0YXRlTm9kZWAgaXMgZXF1YWwgdG8gb3IgdGhlIHBhcmVudCBvZlxyXG4gICAqIHRoaXMgc3RhdGUgbm9kZSwgaXQgZG9lcyBub3QgZXNjYXBlLlxyXG4gICAqL1xuXG5cbiAgU3RhdGVOb2RlLnByb3RvdHlwZS5lc2NhcGVzID0gZnVuY3Rpb24gKHN0YXRlTm9kZSkge1xuICAgIGlmICh0aGlzID09PSBzdGF0ZU5vZGUpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICB2YXIgcGFyZW50ID0gdGhpcy5wYXJlbnQ7XG5cbiAgICB3aGlsZSAocGFyZW50KSB7XG4gICAgICBpZiAocGFyZW50ID09PSBzdGF0ZU5vZGUpIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgfVxuXG4gICAgICBwYXJlbnQgPSBwYXJlbnQucGFyZW50O1xuICAgIH1cblxuICAgIHJldHVybiB0cnVlO1xuICB9O1xuXG4gIFN0YXRlTm9kZS5wcm90b3R5cGUuZ2V0QWN0aW9ucyA9IGZ1bmN0aW9uICh0cmFuc2l0aW9uLCBjdXJyZW50Q29udGV4dCwgX2V2ZW50LCBwcmV2U3RhdGUpIHtcbiAgICB2YXIgZV80LCBfYSwgZV81LCBfYjtcblxuICAgIHZhciBwcmV2Q29uZmlnID0gZ2V0Q29uZmlndXJhdGlvbihbXSwgcHJldlN0YXRlID8gdGhpcy5nZXRTdGF0ZU5vZGVzKHByZXZTdGF0ZS52YWx1ZSkgOiBbdGhpc10pO1xuICAgIHZhciByZXNvbHZlZENvbmZpZyA9IHRyYW5zaXRpb24uY29uZmlndXJhdGlvbi5sZW5ndGggPyBnZXRDb25maWd1cmF0aW9uKHByZXZDb25maWcsIHRyYW5zaXRpb24uY29uZmlndXJhdGlvbikgOiBwcmV2Q29uZmlnO1xuXG4gICAgdHJ5IHtcbiAgICAgIGZvciAodmFyIHJlc29sdmVkQ29uZmlnXzEgPSBfX3ZhbHVlcyhyZXNvbHZlZENvbmZpZyksIHJlc29sdmVkQ29uZmlnXzFfMSA9IHJlc29sdmVkQ29uZmlnXzEubmV4dCgpOyAhcmVzb2x2ZWRDb25maWdfMV8xLmRvbmU7IHJlc29sdmVkQ29uZmlnXzFfMSA9IHJlc29sdmVkQ29uZmlnXzEubmV4dCgpKSB7XG4gICAgICAgIHZhciBzbiA9IHJlc29sdmVkQ29uZmlnXzFfMS52YWx1ZTtcblxuICAgICAgICBpZiAoIWhhcyhwcmV2Q29uZmlnLCBzbikpIHtcbiAgICAgICAgICB0cmFuc2l0aW9uLmVudHJ5U2V0LnB1c2goc24pO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSBjYXRjaCAoZV80XzEpIHtcbiAgICAgIGVfNCA9IHtcbiAgICAgICAgZXJyb3I6IGVfNF8xXG4gICAgICB9O1xuICAgIH0gZmluYWxseSB7XG4gICAgICB0cnkge1xuICAgICAgICBpZiAocmVzb2x2ZWRDb25maWdfMV8xICYmICFyZXNvbHZlZENvbmZpZ18xXzEuZG9uZSAmJiAoX2EgPSByZXNvbHZlZENvbmZpZ18xLnJldHVybikpIF9hLmNhbGwocmVzb2x2ZWRDb25maWdfMSk7XG4gICAgICB9IGZpbmFsbHkge1xuICAgICAgICBpZiAoZV80KSB0aHJvdyBlXzQuZXJyb3I7XG4gICAgICB9XG4gICAgfVxuXG4gICAgdHJ5IHtcbiAgICAgIGZvciAodmFyIHByZXZDb25maWdfMSA9IF9fdmFsdWVzKHByZXZDb25maWcpLCBwcmV2Q29uZmlnXzFfMSA9IHByZXZDb25maWdfMS5uZXh0KCk7ICFwcmV2Q29uZmlnXzFfMS5kb25lOyBwcmV2Q29uZmlnXzFfMSA9IHByZXZDb25maWdfMS5uZXh0KCkpIHtcbiAgICAgICAgdmFyIHNuID0gcHJldkNvbmZpZ18xXzEudmFsdWU7XG5cbiAgICAgICAgaWYgKCFoYXMocmVzb2x2ZWRDb25maWcsIHNuKSB8fCBoYXModHJhbnNpdGlvbi5leGl0U2V0LCBzbi5wYXJlbnQpKSB7XG4gICAgICAgICAgdHJhbnNpdGlvbi5leGl0U2V0LnB1c2goc24pO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSBjYXRjaCAoZV81XzEpIHtcbiAgICAgIGVfNSA9IHtcbiAgICAgICAgZXJyb3I6IGVfNV8xXG4gICAgICB9O1xuICAgIH0gZmluYWxseSB7XG4gICAgICB0cnkge1xuICAgICAgICBpZiAocHJldkNvbmZpZ18xXzEgJiYgIXByZXZDb25maWdfMV8xLmRvbmUgJiYgKF9iID0gcHJldkNvbmZpZ18xLnJldHVybikpIF9iLmNhbGwocHJldkNvbmZpZ18xKTtcbiAgICAgIH0gZmluYWxseSB7XG4gICAgICAgIGlmIChlXzUpIHRocm93IGVfNS5lcnJvcjtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAoIXRyYW5zaXRpb24uc291cmNlKSB7XG4gICAgICB0cmFuc2l0aW9uLmV4aXRTZXQgPSBbXTsgLy8gRW5zdXJlIHRoYXQgcm9vdCBTdGF0ZU5vZGUgKG1hY2hpbmUpIGlzIGVudGVyZWRcblxuICAgICAgdHJhbnNpdGlvbi5lbnRyeVNldC5wdXNoKHRoaXMpO1xuICAgIH1cblxuICAgIHZhciBkb25lRXZlbnRzID0gZmxhdHRlbih0cmFuc2l0aW9uLmVudHJ5U2V0Lm1hcChmdW5jdGlvbiAoc24pIHtcbiAgICAgIHZhciBldmVudHMgPSBbXTtcblxuICAgICAgaWYgKHNuLnR5cGUgIT09ICdmaW5hbCcpIHtcbiAgICAgICAgcmV0dXJuIGV2ZW50cztcbiAgICAgIH1cblxuICAgICAgdmFyIHBhcmVudCA9IHNuLnBhcmVudDtcblxuICAgICAgaWYgKCFwYXJlbnQucGFyZW50KSB7XG4gICAgICAgIHJldHVybiBldmVudHM7XG4gICAgICB9XG5cbiAgICAgIGV2ZW50cy5wdXNoKGRvbmUoc24uaWQsIHNuLmRvbmVEYXRhKSwgLy8gVE9ETzogZGVwcmVjYXRlIC0gZmluYWwgc3RhdGVzIHNob3VsZCBub3QgZW1pdCBkb25lIGV2ZW50cyBmb3IgdGhlaXIgb3duIHN0YXRlLlxuICAgICAgZG9uZShwYXJlbnQuaWQsIHNuLmRvbmVEYXRhID8gbWFwQ29udGV4dChzbi5kb25lRGF0YSwgY3VycmVudENvbnRleHQsIF9ldmVudCkgOiB1bmRlZmluZWQpKTtcbiAgICAgIHZhciBncmFuZHBhcmVudCA9IHBhcmVudC5wYXJlbnQ7XG5cbiAgICAgIGlmIChncmFuZHBhcmVudC50eXBlID09PSAncGFyYWxsZWwnKSB7XG4gICAgICAgIGlmIChnZXRDaGlsZHJlbihncmFuZHBhcmVudCkuZXZlcnkoZnVuY3Rpb24gKHBhcmVudE5vZGUpIHtcbiAgICAgICAgICByZXR1cm4gaXNJbkZpbmFsU3RhdGUodHJhbnNpdGlvbi5jb25maWd1cmF0aW9uLCBwYXJlbnROb2RlKTtcbiAgICAgICAgfSkpIHtcbiAgICAgICAgICBldmVudHMucHVzaChkb25lKGdyYW5kcGFyZW50LmlkKSk7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgcmV0dXJuIGV2ZW50cztcbiAgICB9KSk7XG4gICAgdHJhbnNpdGlvbi5leGl0U2V0LnNvcnQoZnVuY3Rpb24gKGEsIGIpIHtcbiAgICAgIHJldHVybiBiLm9yZGVyIC0gYS5vcmRlcjtcbiAgICB9KTtcbiAgICB0cmFuc2l0aW9uLmVudHJ5U2V0LnNvcnQoZnVuY3Rpb24gKGEsIGIpIHtcbiAgICAgIHJldHVybiBhLm9yZGVyIC0gYi5vcmRlcjtcbiAgICB9KTtcbiAgICB2YXIgZW50cnlTdGF0ZXMgPSBuZXcgU2V0KHRyYW5zaXRpb24uZW50cnlTZXQpO1xuICAgIHZhciBleGl0U3RhdGVzID0gbmV3IFNldCh0cmFuc2l0aW9uLmV4aXRTZXQpO1xuXG4gICAgdmFyIF9jID0gX19yZWFkKFtmbGF0dGVuKEFycmF5LmZyb20oZW50cnlTdGF0ZXMpLm1hcChmdW5jdGlvbiAoc3RhdGVOb2RlKSB7XG4gICAgICByZXR1cm4gX19zcHJlYWQoc3RhdGVOb2RlLmFjdGl2aXRpZXMubWFwKGZ1bmN0aW9uIChhY3Rpdml0eSkge1xuICAgICAgICByZXR1cm4gc3RhcnQoYWN0aXZpdHkpO1xuICAgICAgfSksIHN0YXRlTm9kZS5vbkVudHJ5KTtcbiAgICB9KSkuY29uY2F0KGRvbmVFdmVudHMubWFwKHJhaXNlKSksIGZsYXR0ZW4oQXJyYXkuZnJvbShleGl0U3RhdGVzKS5tYXAoZnVuY3Rpb24gKHN0YXRlTm9kZSkge1xuICAgICAgcmV0dXJuIF9fc3ByZWFkKHN0YXRlTm9kZS5vbkV4aXQsIHN0YXRlTm9kZS5hY3Rpdml0aWVzLm1hcChmdW5jdGlvbiAoYWN0aXZpdHkpIHtcbiAgICAgICAgcmV0dXJuIHN0b3AoYWN0aXZpdHkpO1xuICAgICAgfSkpO1xuICAgIH0pKV0sIDIpLFxuICAgICAgICBlbnRyeUFjdGlvbnMgPSBfY1swXSxcbiAgICAgICAgZXhpdEFjdGlvbnMgPSBfY1sxXTtcblxuICAgIHZhciBhY3Rpb25zID0gdG9BY3Rpb25PYmplY3RzKGV4aXRBY3Rpb25zLmNvbmNhdCh0cmFuc2l0aW9uLmFjdGlvbnMpLmNvbmNhdChlbnRyeUFjdGlvbnMpLCB0aGlzLm1hY2hpbmUub3B0aW9ucy5hY3Rpb25zKTtcbiAgICByZXR1cm4gYWN0aW9ucztcbiAgfTtcbiAgLyoqXHJcbiAgICogRGV0ZXJtaW5lcyB0aGUgbmV4dCBzdGF0ZSBnaXZlbiB0aGUgY3VycmVudCBgc3RhdGVgIGFuZCBzZW50IGBldmVudGAuXHJcbiAgICpcclxuICAgKiBAcGFyYW0gc3RhdGUgVGhlIGN1cnJlbnQgU3RhdGUgaW5zdGFuY2Ugb3Igc3RhdGUgdmFsdWVcclxuICAgKiBAcGFyYW0gZXZlbnQgVGhlIGV2ZW50IHRoYXQgd2FzIHNlbnQgYXQgdGhlIGN1cnJlbnQgc3RhdGVcclxuICAgKiBAcGFyYW0gY29udGV4dCBUaGUgY3VycmVudCBjb250ZXh0IChleHRlbmRlZCBzdGF0ZSkgb2YgdGhlIGN1cnJlbnQgc3RhdGVcclxuICAgKi9cblxuXG4gIFN0YXRlTm9kZS5wcm90b3R5cGUudHJhbnNpdGlvbiA9IGZ1bmN0aW9uIChzdGF0ZSwgZXZlbnQsIGNvbnRleHQpIHtcbiAgICBpZiAoc3RhdGUgPT09IHZvaWQgMCkge1xuICAgICAgc3RhdGUgPSB0aGlzLmluaXRpYWxTdGF0ZTtcbiAgICB9XG5cbiAgICB2YXIgX2V2ZW50ID0gdG9TQ1hNTEV2ZW50KGV2ZW50KTtcblxuICAgIHZhciBjdXJyZW50U3RhdGU7XG5cbiAgICBpZiAoc3RhdGUgaW5zdGFuY2VvZiBTdGF0ZSkge1xuICAgICAgY3VycmVudFN0YXRlID0gY29udGV4dCA9PT0gdW5kZWZpbmVkID8gc3RhdGUgOiB0aGlzLnJlc29sdmVTdGF0ZShTdGF0ZS5mcm9tKHN0YXRlLCBjb250ZXh0KSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHZhciByZXNvbHZlZFN0YXRlVmFsdWUgPSBpc1N0cmluZyhzdGF0ZSkgPyB0aGlzLnJlc29sdmUocGF0aFRvU3RhdGVWYWx1ZSh0aGlzLmdldFJlc29sdmVkUGF0aChzdGF0ZSkpKSA6IHRoaXMucmVzb2x2ZShzdGF0ZSk7XG4gICAgICB2YXIgcmVzb2x2ZWRDb250ZXh0ID0gY29udGV4dCA/IGNvbnRleHQgOiB0aGlzLm1hY2hpbmUuY29udGV4dDtcbiAgICAgIGN1cnJlbnRTdGF0ZSA9IHRoaXMucmVzb2x2ZVN0YXRlKFN0YXRlLmZyb20ocmVzb2x2ZWRTdGF0ZVZhbHVlLCByZXNvbHZlZENvbnRleHQpKTtcbiAgICB9XG5cbiAgICBpZiAoIUlTX1BST0RVQ1RJT04gJiYgX2V2ZW50Lm5hbWUgPT09IFdJTERDQVJEKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXCJBbiBldmVudCBjYW5ub3QgaGF2ZSB0aGUgd2lsZGNhcmQgdHlwZSAoJ1wiICsgV0lMRENBUkQgKyBcIicpXCIpO1xuICAgIH1cblxuICAgIGlmICh0aGlzLnN0cmljdCkge1xuICAgICAgaWYgKCF0aGlzLmV2ZW50cy5pbmNsdWRlcyhfZXZlbnQubmFtZSkgJiYgIWlzQnVpbHRJbkV2ZW50KF9ldmVudC5uYW1lKSkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJNYWNoaW5lICdcIiArIHRoaXMuaWQgKyBcIicgZG9lcyBub3QgYWNjZXB0IGV2ZW50ICdcIiArIF9ldmVudC5uYW1lICsgXCInXCIpO1xuICAgICAgfVxuICAgIH1cblxuICAgIHZhciBzdGF0ZVRyYW5zaXRpb24gPSB0aGlzLl90cmFuc2l0aW9uKGN1cnJlbnRTdGF0ZS52YWx1ZSwgY3VycmVudFN0YXRlLCBfZXZlbnQpIHx8IHtcbiAgICAgIHRyYW5zaXRpb25zOiBbXSxcbiAgICAgIGNvbmZpZ3VyYXRpb246IFtdLFxuICAgICAgZW50cnlTZXQ6IFtdLFxuICAgICAgZXhpdFNldDogW10sXG4gICAgICBzb3VyY2U6IGN1cnJlbnRTdGF0ZSxcbiAgICAgIGFjdGlvbnM6IFtdXG4gICAgfTtcbiAgICB2YXIgcHJldkNvbmZpZyA9IGdldENvbmZpZ3VyYXRpb24oW10sIHRoaXMuZ2V0U3RhdGVOb2RlcyhjdXJyZW50U3RhdGUudmFsdWUpKTtcbiAgICB2YXIgcmVzb2x2ZWRDb25maWcgPSBzdGF0ZVRyYW5zaXRpb24uY29uZmlndXJhdGlvbi5sZW5ndGggPyBnZXRDb25maWd1cmF0aW9uKHByZXZDb25maWcsIHN0YXRlVHJhbnNpdGlvbi5jb25maWd1cmF0aW9uKSA6IHByZXZDb25maWc7XG4gICAgc3RhdGVUcmFuc2l0aW9uLmNvbmZpZ3VyYXRpb24gPSBfX3NwcmVhZChyZXNvbHZlZENvbmZpZyk7XG4gICAgcmV0dXJuIHRoaXMucmVzb2x2ZVRyYW5zaXRpb24oc3RhdGVUcmFuc2l0aW9uLCBjdXJyZW50U3RhdGUsIF9ldmVudCk7XG4gIH07XG5cbiAgU3RhdGVOb2RlLnByb3RvdHlwZS5yZXNvbHZlUmFpc2VkVHJhbnNpdGlvbiA9IGZ1bmN0aW9uIChzdGF0ZSwgX2V2ZW50LCBvcmlnaW5hbEV2ZW50KSB7XG4gICAgdmFyIF9hO1xuXG4gICAgdmFyIGN1cnJlbnRBY3Rpb25zID0gc3RhdGUuYWN0aW9ucztcbiAgICBzdGF0ZSA9IHRoaXMudHJhbnNpdGlvbihzdGF0ZSwgX2V2ZW50KTsgLy8gU2F2ZSBvcmlnaW5hbCBldmVudCB0byBzdGF0ZVxuICAgIC8vIFRPRE86IHRoaXMgc2hvdWxkIGJlIHRoZSByYWlzZWQgZXZlbnQhIERlbGV0ZSBpbiBWNSAoYnJlYWtpbmcpXG5cbiAgICBzdGF0ZS5fZXZlbnQgPSBvcmlnaW5hbEV2ZW50O1xuICAgIHN0YXRlLmV2ZW50ID0gb3JpZ2luYWxFdmVudC5kYXRhO1xuXG4gICAgKF9hID0gc3RhdGUuYWN0aW9ucykudW5zaGlmdC5hcHBseShfYSwgX19zcHJlYWQoY3VycmVudEFjdGlvbnMpKTtcblxuICAgIHJldHVybiBzdGF0ZTtcbiAgfTtcblxuICBTdGF0ZU5vZGUucHJvdG90eXBlLnJlc29sdmVUcmFuc2l0aW9uID0gZnVuY3Rpb24gKHN0YXRlVHJhbnNpdGlvbiwgY3VycmVudFN0YXRlLCBfZXZlbnQsIGNvbnRleHQpIHtcbiAgICB2YXIgZV82LCBfYTtcblxuICAgIHZhciBfdGhpcyA9IHRoaXM7XG5cbiAgICBpZiAoX2V2ZW50ID09PSB2b2lkIDApIHtcbiAgICAgIF9ldmVudCA9IGluaXRFdmVudDtcbiAgICB9XG5cbiAgICBpZiAoY29udGV4dCA9PT0gdm9pZCAwKSB7XG4gICAgICBjb250ZXh0ID0gdGhpcy5tYWNoaW5lLmNvbnRleHQ7XG4gICAgfVxuXG4gICAgdmFyIGNvbmZpZ3VyYXRpb24gPSBzdGF0ZVRyYW5zaXRpb24uY29uZmlndXJhdGlvbjsgLy8gVHJhbnNpdGlvbiB3aWxsIFwiYXBwbHlcIiBpZjpcbiAgICAvLyAtIHRoaXMgaXMgdGhlIGluaXRpYWwgc3RhdGUgKHRoZXJlIGlzIG5vIGN1cnJlbnQgc3RhdGUpXG4gICAgLy8gLSBPUiB0aGVyZSBhcmUgdHJhbnNpdGlvbnNcblxuICAgIHZhciB3aWxsVHJhbnNpdGlvbiA9ICFjdXJyZW50U3RhdGUgfHwgc3RhdGVUcmFuc2l0aW9uLnRyYW5zaXRpb25zLmxlbmd0aCA+IDA7XG4gICAgdmFyIHJlc29sdmVkU3RhdGVWYWx1ZSA9IHdpbGxUcmFuc2l0aW9uID8gZ2V0VmFsdWUodGhpcy5tYWNoaW5lLCBjb25maWd1cmF0aW9uKSA6IHVuZGVmaW5lZDtcbiAgICB2YXIgaGlzdG9yeVZhbHVlID0gY3VycmVudFN0YXRlID8gY3VycmVudFN0YXRlLmhpc3RvcnlWYWx1ZSA/IGN1cnJlbnRTdGF0ZS5oaXN0b3J5VmFsdWUgOiBzdGF0ZVRyYW5zaXRpb24uc291cmNlID8gdGhpcy5tYWNoaW5lLmhpc3RvcnlWYWx1ZShjdXJyZW50U3RhdGUudmFsdWUpIDogdW5kZWZpbmVkIDogdW5kZWZpbmVkO1xuICAgIHZhciBjdXJyZW50Q29udGV4dCA9IGN1cnJlbnRTdGF0ZSA/IGN1cnJlbnRTdGF0ZS5jb250ZXh0IDogY29udGV4dDtcbiAgICB2YXIgYWN0aW9ucyA9IHRoaXMuZ2V0QWN0aW9ucyhzdGF0ZVRyYW5zaXRpb24sIGN1cnJlbnRDb250ZXh0LCBfZXZlbnQsIGN1cnJlbnRTdGF0ZSk7XG4gICAgdmFyIGFjdGl2aXRpZXMgPSBjdXJyZW50U3RhdGUgPyBfX2Fzc2lnbih7fSwgY3VycmVudFN0YXRlLmFjdGl2aXRpZXMpIDoge307XG5cbiAgICB0cnkge1xuICAgICAgZm9yICh2YXIgYWN0aW9uc18xID0gX192YWx1ZXMoYWN0aW9ucyksIGFjdGlvbnNfMV8xID0gYWN0aW9uc18xLm5leHQoKTsgIWFjdGlvbnNfMV8xLmRvbmU7IGFjdGlvbnNfMV8xID0gYWN0aW9uc18xLm5leHQoKSkge1xuICAgICAgICB2YXIgYWN0aW9uID0gYWN0aW9uc18xXzEudmFsdWU7XG5cbiAgICAgICAgaWYgKGFjdGlvbi50eXBlID09PSBzdGFydCQxKSB7XG4gICAgICAgICAgYWN0aXZpdGllc1thY3Rpb24uYWN0aXZpdHkuaWQgfHwgYWN0aW9uLmFjdGl2aXR5LnR5cGVdID0gYWN0aW9uO1xuICAgICAgICB9IGVsc2UgaWYgKGFjdGlvbi50eXBlID09PSBzdG9wJDEpIHtcbiAgICAgICAgICBhY3Rpdml0aWVzW2FjdGlvbi5hY3Rpdml0eS5pZCB8fCBhY3Rpb24uYWN0aXZpdHkudHlwZV0gPSBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0gY2F0Y2ggKGVfNl8xKSB7XG4gICAgICBlXzYgPSB7XG4gICAgICAgIGVycm9yOiBlXzZfMVxuICAgICAgfTtcbiAgICB9IGZpbmFsbHkge1xuICAgICAgdHJ5IHtcbiAgICAgICAgaWYgKGFjdGlvbnNfMV8xICYmICFhY3Rpb25zXzFfMS5kb25lICYmIChfYSA9IGFjdGlvbnNfMS5yZXR1cm4pKSBfYS5jYWxsKGFjdGlvbnNfMSk7XG4gICAgICB9IGZpbmFsbHkge1xuICAgICAgICBpZiAoZV82KSB0aHJvdyBlXzYuZXJyb3I7XG4gICAgICB9XG4gICAgfVxuXG4gICAgdmFyIF9iID0gX19yZWFkKHJlc29sdmVBY3Rpb25zKHRoaXMsIGN1cnJlbnRTdGF0ZSwgY3VycmVudENvbnRleHQsIF9ldmVudCwgYWN0aW9ucyksIDIpLFxuICAgICAgICByZXNvbHZlZEFjdGlvbnMgPSBfYlswXSxcbiAgICAgICAgdXBkYXRlZENvbnRleHQgPSBfYlsxXTtcblxuICAgIHZhciBfYyA9IF9fcmVhZChwYXJ0aXRpb24ocmVzb2x2ZWRBY3Rpb25zLCBmdW5jdGlvbiAoYWN0aW9uKSB7XG4gICAgICByZXR1cm4gYWN0aW9uLnR5cGUgPT09IHJhaXNlJDEgfHwgYWN0aW9uLnR5cGUgPT09IHNlbmQkMSAmJiBhY3Rpb24udG8gPT09IFNwZWNpYWxUYXJnZXRzLkludGVybmFsO1xuICAgIH0pLCAyKSxcbiAgICAgICAgcmFpc2VkRXZlbnRzID0gX2NbMF0sXG4gICAgICAgIG5vblJhaXNlZEFjdGlvbnMgPSBfY1sxXTtcblxuICAgIHZhciBpbnZva2VBY3Rpb25zID0gcmVzb2x2ZWRBY3Rpb25zLmZpbHRlcihmdW5jdGlvbiAoYWN0aW9uKSB7XG4gICAgICB2YXIgX2E7XG5cbiAgICAgIHJldHVybiBhY3Rpb24udHlwZSA9PT0gc3RhcnQkMSAmJiAoKF9hID0gYWN0aW9uLmFjdGl2aXR5KSA9PT0gbnVsbCB8fCBfYSA9PT0gdm9pZCAwID8gdm9pZCAwIDogX2EudHlwZSkgPT09IGludm9rZTtcbiAgICB9KTtcbiAgICB2YXIgY2hpbGRyZW4gPSBpbnZva2VBY3Rpb25zLnJlZHVjZShmdW5jdGlvbiAoYWNjLCBhY3Rpb24pIHtcbiAgICAgIGFjY1thY3Rpb24uYWN0aXZpdHkuaWRdID0gY3JlYXRlSW52b2NhYmxlQWN0b3IoYWN0aW9uLmFjdGl2aXR5LCBfdGhpcy5tYWNoaW5lLCB1cGRhdGVkQ29udGV4dCwgX2V2ZW50KTtcbiAgICAgIHJldHVybiBhY2M7XG4gICAgfSwgY3VycmVudFN0YXRlID8gX19hc3NpZ24oe30sIGN1cnJlbnRTdGF0ZS5jaGlsZHJlbikgOiB7fSk7XG4gICAgdmFyIHJlc29sdmVkQ29uZmlndXJhdGlvbiA9IHJlc29sdmVkU3RhdGVWYWx1ZSA/IHN0YXRlVHJhbnNpdGlvbi5jb25maWd1cmF0aW9uIDogY3VycmVudFN0YXRlID8gY3VycmVudFN0YXRlLmNvbmZpZ3VyYXRpb24gOiBbXTtcbiAgICB2YXIgbWV0YSA9IHJlc29sdmVkQ29uZmlndXJhdGlvbi5yZWR1Y2UoZnVuY3Rpb24gKGFjYywgc3RhdGVOb2RlKSB7XG4gICAgICBpZiAoc3RhdGVOb2RlLm1ldGEgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICBhY2Nbc3RhdGVOb2RlLmlkXSA9IHN0YXRlTm9kZS5tZXRhO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gYWNjO1xuICAgIH0sIHt9KTtcbiAgICB2YXIgaXNEb25lID0gaXNJbkZpbmFsU3RhdGUocmVzb2x2ZWRDb25maWd1cmF0aW9uLCB0aGlzKTtcbiAgICB2YXIgbmV4dFN0YXRlID0gbmV3IFN0YXRlKHtcbiAgICAgIHZhbHVlOiByZXNvbHZlZFN0YXRlVmFsdWUgfHwgY3VycmVudFN0YXRlLnZhbHVlLFxuICAgICAgY29udGV4dDogdXBkYXRlZENvbnRleHQsXG4gICAgICBfZXZlbnQ6IF9ldmVudCxcbiAgICAgIC8vIFBlcnNpc3QgX3Nlc3Npb25pZCBiZXR3ZWVuIHN0YXRlc1xuICAgICAgX3Nlc3Npb25pZDogY3VycmVudFN0YXRlID8gY3VycmVudFN0YXRlLl9zZXNzaW9uaWQgOiBudWxsLFxuICAgICAgaGlzdG9yeVZhbHVlOiByZXNvbHZlZFN0YXRlVmFsdWUgPyBoaXN0b3J5VmFsdWUgPyB1cGRhdGVIaXN0b3J5VmFsdWUoaGlzdG9yeVZhbHVlLCByZXNvbHZlZFN0YXRlVmFsdWUpIDogdW5kZWZpbmVkIDogY3VycmVudFN0YXRlID8gY3VycmVudFN0YXRlLmhpc3RvcnlWYWx1ZSA6IHVuZGVmaW5lZCxcbiAgICAgIGhpc3Rvcnk6ICFyZXNvbHZlZFN0YXRlVmFsdWUgfHwgc3RhdGVUcmFuc2l0aW9uLnNvdXJjZSA/IGN1cnJlbnRTdGF0ZSA6IHVuZGVmaW5lZCxcbiAgICAgIGFjdGlvbnM6IHJlc29sdmVkU3RhdGVWYWx1ZSA/IG5vblJhaXNlZEFjdGlvbnMgOiBbXSxcbiAgICAgIGFjdGl2aXRpZXM6IHJlc29sdmVkU3RhdGVWYWx1ZSA/IGFjdGl2aXRpZXMgOiBjdXJyZW50U3RhdGUgPyBjdXJyZW50U3RhdGUuYWN0aXZpdGllcyA6IHt9LFxuICAgICAgbWV0YTogcmVzb2x2ZWRTdGF0ZVZhbHVlID8gbWV0YSA6IGN1cnJlbnRTdGF0ZSA/IGN1cnJlbnRTdGF0ZS5tZXRhIDogdW5kZWZpbmVkLFxuICAgICAgZXZlbnRzOiBbXSxcbiAgICAgIGNvbmZpZ3VyYXRpb246IHJlc29sdmVkQ29uZmlndXJhdGlvbixcbiAgICAgIHRyYW5zaXRpb25zOiBzdGF0ZVRyYW5zaXRpb24udHJhbnNpdGlvbnMsXG4gICAgICBjaGlsZHJlbjogY2hpbGRyZW4sXG4gICAgICBkb25lOiBpc0RvbmVcbiAgICB9KTtcbiAgICB2YXIgZGlkVXBkYXRlQ29udGV4dCA9IGN1cnJlbnRDb250ZXh0ICE9PSB1cGRhdGVkQ29udGV4dDtcbiAgICBuZXh0U3RhdGUuY2hhbmdlZCA9IF9ldmVudC5uYW1lID09PSB1cGRhdGUgfHwgZGlkVXBkYXRlQ29udGV4dDsgLy8gRGlzcG9zZSBvZiBwZW51bHRpbWF0ZSBoaXN0b3JpZXMgdG8gcHJldmVudCBtZW1vcnkgbGVha3NcblxuICAgIHZhciBoaXN0b3J5ID0gbmV4dFN0YXRlLmhpc3Rvcnk7XG5cbiAgICBpZiAoaGlzdG9yeSkge1xuICAgICAgZGVsZXRlIGhpc3RvcnkuaGlzdG9yeTtcbiAgICB9XG5cbiAgICBpZiAoIXJlc29sdmVkU3RhdGVWYWx1ZSkge1xuICAgICAgcmV0dXJuIG5leHRTdGF0ZTtcbiAgICB9XG5cbiAgICB2YXIgbWF5YmVOZXh0U3RhdGUgPSBuZXh0U3RhdGU7XG5cbiAgICBpZiAoIWlzRG9uZSkge1xuICAgICAgdmFyIGlzVHJhbnNpZW50ID0gdGhpcy5fdHJhbnNpZW50IHx8IGNvbmZpZ3VyYXRpb24uc29tZShmdW5jdGlvbiAoc3RhdGVOb2RlKSB7XG4gICAgICAgIHJldHVybiBzdGF0ZU5vZGUuX3RyYW5zaWVudDtcbiAgICAgIH0pO1xuXG4gICAgICBpZiAoaXNUcmFuc2llbnQpIHtcbiAgICAgICAgbWF5YmVOZXh0U3RhdGUgPSB0aGlzLnJlc29sdmVSYWlzZWRUcmFuc2l0aW9uKG1heWJlTmV4dFN0YXRlLCB7XG4gICAgICAgICAgdHlwZTogbnVsbEV2ZW50XG4gICAgICAgIH0sIF9ldmVudCk7XG4gICAgICB9XG5cbiAgICAgIHdoaWxlIChyYWlzZWRFdmVudHMubGVuZ3RoKSB7XG4gICAgICAgIHZhciByYWlzZWRFdmVudCA9IHJhaXNlZEV2ZW50cy5zaGlmdCgpO1xuICAgICAgICBtYXliZU5leHRTdGF0ZSA9IHRoaXMucmVzb2x2ZVJhaXNlZFRyYW5zaXRpb24obWF5YmVOZXh0U3RhdGUsIHJhaXNlZEV2ZW50Ll9ldmVudCwgX2V2ZW50KTtcbiAgICAgIH1cbiAgICB9IC8vIERldGVjdCBpZiBzdGF0ZSBjaGFuZ2VkXG5cblxuICAgIHZhciBjaGFuZ2VkID0gbWF5YmVOZXh0U3RhdGUuY2hhbmdlZCB8fCAoaGlzdG9yeSA/ICEhbWF5YmVOZXh0U3RhdGUuYWN0aW9ucy5sZW5ndGggfHwgZGlkVXBkYXRlQ29udGV4dCB8fCB0eXBlb2YgaGlzdG9yeS52YWx1ZSAhPT0gdHlwZW9mIG1heWJlTmV4dFN0YXRlLnZhbHVlIHx8ICFzdGF0ZVZhbHVlc0VxdWFsKG1heWJlTmV4dFN0YXRlLnZhbHVlLCBoaXN0b3J5LnZhbHVlKSA6IHVuZGVmaW5lZCk7XG4gICAgbWF5YmVOZXh0U3RhdGUuY2hhbmdlZCA9IGNoYW5nZWQ7IC8vIFByZXNlcnZlIG9yaWdpbmFsIGhpc3RvcnkgYWZ0ZXIgcmFpc2VkIGV2ZW50c1xuXG4gICAgbWF5YmVOZXh0U3RhdGUuaGlzdG9yeSA9IGhpc3Rvcnk7XG4gICAgcmV0dXJuIG1heWJlTmV4dFN0YXRlO1xuICB9O1xuICAvKipcclxuICAgKiBSZXR1cm5zIHRoZSBjaGlsZCBzdGF0ZSBub2RlIGZyb20gaXRzIHJlbGF0aXZlIGBzdGF0ZUtleWAsIG9yIHRocm93cy5cclxuICAgKi9cblxuXG4gIFN0YXRlTm9kZS5wcm90b3R5cGUuZ2V0U3RhdGVOb2RlID0gZnVuY3Rpb24gKHN0YXRlS2V5KSB7XG4gICAgaWYgKGlzU3RhdGVJZChzdGF0ZUtleSkpIHtcbiAgICAgIHJldHVybiB0aGlzLm1hY2hpbmUuZ2V0U3RhdGVOb2RlQnlJZChzdGF0ZUtleSk7XG4gICAgfVxuXG4gICAgaWYgKCF0aGlzLnN0YXRlcykge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKFwiVW5hYmxlIHRvIHJldHJpZXZlIGNoaWxkIHN0YXRlICdcIiArIHN0YXRlS2V5ICsgXCInIGZyb20gJ1wiICsgdGhpcy5pZCArIFwiJzsgbm8gY2hpbGQgc3RhdGVzIGV4aXN0LlwiKTtcbiAgICB9XG5cbiAgICB2YXIgcmVzdWx0ID0gdGhpcy5zdGF0ZXNbc3RhdGVLZXldO1xuXG4gICAgaWYgKCFyZXN1bHQpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihcIkNoaWxkIHN0YXRlICdcIiArIHN0YXRlS2V5ICsgXCInIGRvZXMgbm90IGV4aXN0IG9uICdcIiArIHRoaXMuaWQgKyBcIidcIik7XG4gICAgfVxuXG4gICAgcmV0dXJuIHJlc3VsdDtcbiAgfTtcbiAgLyoqXHJcbiAgICogUmV0dXJucyB0aGUgc3RhdGUgbm9kZSB3aXRoIHRoZSBnaXZlbiBgc3RhdGVJZGAsIG9yIHRocm93cy5cclxuICAgKlxyXG4gICAqIEBwYXJhbSBzdGF0ZUlkIFRoZSBzdGF0ZSBJRC4gVGhlIHByZWZpeCBcIiNcIiBpcyByZW1vdmVkLlxyXG4gICAqL1xuXG5cbiAgU3RhdGVOb2RlLnByb3RvdHlwZS5nZXRTdGF0ZU5vZGVCeUlkID0gZnVuY3Rpb24gKHN0YXRlSWQpIHtcbiAgICB2YXIgcmVzb2x2ZWRTdGF0ZUlkID0gaXNTdGF0ZUlkKHN0YXRlSWQpID8gc3RhdGVJZC5zbGljZShTVEFURV9JREVOVElGSUVSLmxlbmd0aCkgOiBzdGF0ZUlkO1xuXG4gICAgaWYgKHJlc29sdmVkU3RhdGVJZCA9PT0gdGhpcy5pZCkge1xuICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgdmFyIHN0YXRlTm9kZSA9IHRoaXMubWFjaGluZS5pZE1hcFtyZXNvbHZlZFN0YXRlSWRdO1xuXG4gICAgaWYgKCFzdGF0ZU5vZGUpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihcIkNoaWxkIHN0YXRlIG5vZGUgJyNcIiArIHJlc29sdmVkU3RhdGVJZCArIFwiJyBkb2VzIG5vdCBleGlzdCBvbiBtYWNoaW5lICdcIiArIHRoaXMuaWQgKyBcIidcIik7XG4gICAgfVxuXG4gICAgcmV0dXJuIHN0YXRlTm9kZTtcbiAgfTtcbiAgLyoqXHJcbiAgICogUmV0dXJucyB0aGUgcmVsYXRpdmUgc3RhdGUgbm9kZSBmcm9tIHRoZSBnaXZlbiBgc3RhdGVQYXRoYCwgb3IgdGhyb3dzLlxyXG4gICAqXHJcbiAgICogQHBhcmFtIHN0YXRlUGF0aCBUaGUgc3RyaW5nIG9yIHN0cmluZyBhcnJheSByZWxhdGl2ZSBwYXRoIHRvIHRoZSBzdGF0ZSBub2RlLlxyXG4gICAqL1xuXG5cbiAgU3RhdGVOb2RlLnByb3RvdHlwZS5nZXRTdGF0ZU5vZGVCeVBhdGggPSBmdW5jdGlvbiAoc3RhdGVQYXRoKSB7XG4gICAgaWYgKHR5cGVvZiBzdGF0ZVBhdGggPT09ICdzdHJpbmcnICYmIGlzU3RhdGVJZChzdGF0ZVBhdGgpKSB7XG4gICAgICB0cnkge1xuICAgICAgICByZXR1cm4gdGhpcy5nZXRTdGF0ZU5vZGVCeUlkKHN0YXRlUGF0aC5zbGljZSgxKSk7XG4gICAgICB9IGNhdGNoIChlKSB7Ly8gdHJ5IGluZGl2aWR1YWwgcGF0aHNcbiAgICAgICAgLy8gdGhyb3cgZTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICB2YXIgYXJyYXlTdGF0ZVBhdGggPSB0b1N0YXRlUGF0aChzdGF0ZVBhdGgsIHRoaXMuZGVsaW1pdGVyKS5zbGljZSgpO1xuICAgIHZhciBjdXJyZW50U3RhdGVOb2RlID0gdGhpcztcblxuICAgIHdoaWxlIChhcnJheVN0YXRlUGF0aC5sZW5ndGgpIHtcbiAgICAgIHZhciBrZXkgPSBhcnJheVN0YXRlUGF0aC5zaGlmdCgpO1xuXG4gICAgICBpZiAoIWtleS5sZW5ndGgpIHtcbiAgICAgICAgYnJlYWs7XG4gICAgICB9XG5cbiAgICAgIGN1cnJlbnRTdGF0ZU5vZGUgPSBjdXJyZW50U3RhdGVOb2RlLmdldFN0YXRlTm9kZShrZXkpO1xuICAgIH1cblxuICAgIHJldHVybiBjdXJyZW50U3RhdGVOb2RlO1xuICB9O1xuICAvKipcclxuICAgKiBSZXNvbHZlcyBhIHBhcnRpYWwgc3RhdGUgdmFsdWUgd2l0aCBpdHMgZnVsbCByZXByZXNlbnRhdGlvbiBpbiB0aGlzIG1hY2hpbmUuXHJcbiAgICpcclxuICAgKiBAcGFyYW0gc3RhdGVWYWx1ZSBUaGUgcGFydGlhbCBzdGF0ZSB2YWx1ZSB0byByZXNvbHZlLlxyXG4gICAqL1xuXG5cbiAgU3RhdGVOb2RlLnByb3RvdHlwZS5yZXNvbHZlID0gZnVuY3Rpb24gKHN0YXRlVmFsdWUpIHtcbiAgICB2YXIgX2E7XG5cbiAgICB2YXIgX3RoaXMgPSB0aGlzO1xuXG4gICAgaWYgKCFzdGF0ZVZhbHVlKSB7XG4gICAgICByZXR1cm4gdGhpcy5pbml0aWFsU3RhdGVWYWx1ZSB8fCBFTVBUWV9PQkpFQ1Q7IC8vIFRPRE86IHR5cGUtc3BlY2lmaWMgcHJvcGVydGllc1xuICAgIH1cblxuICAgIHN3aXRjaCAodGhpcy50eXBlKSB7XG4gICAgICBjYXNlICdwYXJhbGxlbCc6XG4gICAgICAgIHJldHVybiBtYXBWYWx1ZXModGhpcy5pbml0aWFsU3RhdGVWYWx1ZSwgZnVuY3Rpb24gKHN1YlN0YXRlVmFsdWUsIHN1YlN0YXRlS2V5KSB7XG4gICAgICAgICAgcmV0dXJuIHN1YlN0YXRlVmFsdWUgPyBfdGhpcy5nZXRTdGF0ZU5vZGUoc3ViU3RhdGVLZXkpLnJlc29sdmUoc3RhdGVWYWx1ZVtzdWJTdGF0ZUtleV0gfHwgc3ViU3RhdGVWYWx1ZSkgOiBFTVBUWV9PQkpFQ1Q7XG4gICAgICAgIH0pO1xuXG4gICAgICBjYXNlICdjb21wb3VuZCc6XG4gICAgICAgIGlmIChpc1N0cmluZyhzdGF0ZVZhbHVlKSkge1xuICAgICAgICAgIHZhciBzdWJTdGF0ZU5vZGUgPSB0aGlzLmdldFN0YXRlTm9kZShzdGF0ZVZhbHVlKTtcblxuICAgICAgICAgIGlmIChzdWJTdGF0ZU5vZGUudHlwZSA9PT0gJ3BhcmFsbGVsJyB8fCBzdWJTdGF0ZU5vZGUudHlwZSA9PT0gJ2NvbXBvdW5kJykge1xuICAgICAgICAgICAgcmV0dXJuIF9hID0ge30sIF9hW3N0YXRlVmFsdWVdID0gc3ViU3RhdGVOb2RlLmluaXRpYWxTdGF0ZVZhbHVlLCBfYTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICByZXR1cm4gc3RhdGVWYWx1ZTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICgha2V5cyhzdGF0ZVZhbHVlKS5sZW5ndGgpIHtcbiAgICAgICAgICByZXR1cm4gdGhpcy5pbml0aWFsU3RhdGVWYWx1ZSB8fCB7fTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBtYXBWYWx1ZXMoc3RhdGVWYWx1ZSwgZnVuY3Rpb24gKHN1YlN0YXRlVmFsdWUsIHN1YlN0YXRlS2V5KSB7XG4gICAgICAgICAgcmV0dXJuIHN1YlN0YXRlVmFsdWUgPyBfdGhpcy5nZXRTdGF0ZU5vZGUoc3ViU3RhdGVLZXkpLnJlc29sdmUoc3ViU3RhdGVWYWx1ZSkgOiBFTVBUWV9PQkpFQ1Q7XG4gICAgICAgIH0pO1xuXG4gICAgICBkZWZhdWx0OlxuICAgICAgICByZXR1cm4gc3RhdGVWYWx1ZSB8fCBFTVBUWV9PQkpFQ1Q7XG4gICAgfVxuICB9O1xuXG4gIFN0YXRlTm9kZS5wcm90b3R5cGUuZ2V0UmVzb2x2ZWRQYXRoID0gZnVuY3Rpb24gKHN0YXRlSWRlbnRpZmllcikge1xuICAgIGlmIChpc1N0YXRlSWQoc3RhdGVJZGVudGlmaWVyKSkge1xuICAgICAgdmFyIHN0YXRlTm9kZSA9IHRoaXMubWFjaGluZS5pZE1hcFtzdGF0ZUlkZW50aWZpZXIuc2xpY2UoU1RBVEVfSURFTlRJRklFUi5sZW5ndGgpXTtcblxuICAgICAgaWYgKCFzdGF0ZU5vZGUpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiVW5hYmxlIHRvIGZpbmQgc3RhdGUgbm9kZSAnXCIgKyBzdGF0ZUlkZW50aWZpZXIgKyBcIidcIik7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBzdGF0ZU5vZGUucGF0aDtcbiAgICB9XG5cbiAgICByZXR1cm4gdG9TdGF0ZVBhdGgoc3RhdGVJZGVudGlmaWVyLCB0aGlzLmRlbGltaXRlcik7XG4gIH07XG5cbiAgT2JqZWN0LmRlZmluZVByb3BlcnR5KFN0YXRlTm9kZS5wcm90b3R5cGUsIFwiaW5pdGlhbFN0YXRlVmFsdWVcIiwge1xuICAgIGdldDogZnVuY3Rpb24gKCkge1xuICAgICAgdmFyIF9hO1xuXG4gICAgICBpZiAodGhpcy5fX2NhY2hlLmluaXRpYWxTdGF0ZVZhbHVlKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9fY2FjaGUuaW5pdGlhbFN0YXRlVmFsdWU7XG4gICAgICB9XG5cbiAgICAgIHZhciBpbml0aWFsU3RhdGVWYWx1ZTtcblxuICAgICAgaWYgKHRoaXMudHlwZSA9PT0gJ3BhcmFsbGVsJykge1xuICAgICAgICBpbml0aWFsU3RhdGVWYWx1ZSA9IG1hcEZpbHRlclZhbHVlcyh0aGlzLnN0YXRlcywgZnVuY3Rpb24gKHN0YXRlKSB7XG4gICAgICAgICAgcmV0dXJuIHN0YXRlLmluaXRpYWxTdGF0ZVZhbHVlIHx8IEVNUFRZX09CSkVDVDtcbiAgICAgICAgfSwgZnVuY3Rpb24gKHN0YXRlTm9kZSkge1xuICAgICAgICAgIHJldHVybiAhKHN0YXRlTm9kZS50eXBlID09PSAnaGlzdG9yeScpO1xuICAgICAgICB9KTtcbiAgICAgIH0gZWxzZSBpZiAodGhpcy5pbml0aWFsICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgaWYgKCF0aGlzLnN0YXRlc1t0aGlzLmluaXRpYWxdKSB7XG4gICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiSW5pdGlhbCBzdGF0ZSAnXCIgKyB0aGlzLmluaXRpYWwgKyBcIicgbm90IGZvdW5kIG9uICdcIiArIHRoaXMua2V5ICsgXCInXCIpO1xuICAgICAgICB9XG5cbiAgICAgICAgaW5pdGlhbFN0YXRlVmFsdWUgPSBpc0xlYWZOb2RlKHRoaXMuc3RhdGVzW3RoaXMuaW5pdGlhbF0pID8gdGhpcy5pbml0aWFsIDogKF9hID0ge30sIF9hW3RoaXMuaW5pdGlhbF0gPSB0aGlzLnN0YXRlc1t0aGlzLmluaXRpYWxdLmluaXRpYWxTdGF0ZVZhbHVlLCBfYSk7XG4gICAgICB9XG5cbiAgICAgIHRoaXMuX19jYWNoZS5pbml0aWFsU3RhdGVWYWx1ZSA9IGluaXRpYWxTdGF0ZVZhbHVlO1xuICAgICAgcmV0dXJuIHRoaXMuX19jYWNoZS5pbml0aWFsU3RhdGVWYWx1ZTtcbiAgICB9LFxuICAgIGVudW1lcmFibGU6IGZhbHNlLFxuICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZVxuICB9KTtcblxuICBTdGF0ZU5vZGUucHJvdG90eXBlLmdldEluaXRpYWxTdGF0ZSA9IGZ1bmN0aW9uIChzdGF0ZVZhbHVlLCBjb250ZXh0KSB7XG4gICAgdmFyIGNvbmZpZ3VyYXRpb24gPSB0aGlzLmdldFN0YXRlTm9kZXMoc3RhdGVWYWx1ZSk7XG4gICAgcmV0dXJuIHRoaXMucmVzb2x2ZVRyYW5zaXRpb24oe1xuICAgICAgY29uZmlndXJhdGlvbjogY29uZmlndXJhdGlvbixcbiAgICAgIGVudHJ5U2V0OiBjb25maWd1cmF0aW9uLFxuICAgICAgZXhpdFNldDogW10sXG4gICAgICB0cmFuc2l0aW9uczogW10sXG4gICAgICBzb3VyY2U6IHVuZGVmaW5lZCxcbiAgICAgIGFjdGlvbnM6IFtdXG4gICAgfSwgdW5kZWZpbmVkLCB1bmRlZmluZWQsIGNvbnRleHQpO1xuICB9O1xuXG4gIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShTdGF0ZU5vZGUucHJvdG90eXBlLCBcImluaXRpYWxTdGF0ZVwiLCB7XG4gICAgLyoqXHJcbiAgICAgKiBUaGUgaW5pdGlhbCBTdGF0ZSBpbnN0YW5jZSwgd2hpY2ggaW5jbHVkZXMgYWxsIGFjdGlvbnMgdG8gYmUgZXhlY3V0ZWQgZnJvbVxyXG4gICAgICogZW50ZXJpbmcgdGhlIGluaXRpYWwgc3RhdGUuXHJcbiAgICAgKi9cbiAgICBnZXQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgIHRoaXMuX2luaXQoKTsgLy8gVE9ETzogdGhpcyBzaG91bGQgYmUgaW4gdGhlIGNvbnN0cnVjdG9yIChzZWUgbm90ZSBpbiBjb25zdHJ1Y3RvcilcblxuXG4gICAgICB2YXIgaW5pdGlhbFN0YXRlVmFsdWUgPSB0aGlzLmluaXRpYWxTdGF0ZVZhbHVlO1xuXG4gICAgICBpZiAoIWluaXRpYWxTdGF0ZVZhbHVlKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcIkNhbm5vdCByZXRyaWV2ZSBpbml0aWFsIHN0YXRlIGZyb20gc2ltcGxlIHN0YXRlICdcIiArIHRoaXMuaWQgKyBcIicuXCIpO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gdGhpcy5nZXRJbml0aWFsU3RhdGUoaW5pdGlhbFN0YXRlVmFsdWUpO1xuICAgIH0sXG4gICAgZW51bWVyYWJsZTogZmFsc2UsXG4gICAgY29uZmlndXJhYmxlOiB0cnVlXG4gIH0pO1xuICBPYmplY3QuZGVmaW5lUHJvcGVydHkoU3RhdGVOb2RlLnByb3RvdHlwZSwgXCJ0YXJnZXRcIiwge1xuICAgIC8qKlxyXG4gICAgICogVGhlIHRhcmdldCBzdGF0ZSB2YWx1ZSBvZiB0aGUgaGlzdG9yeSBzdGF0ZSBub2RlLCBpZiBpdCBleGlzdHMuIFRoaXMgcmVwcmVzZW50cyB0aGVcclxuICAgICAqIGRlZmF1bHQgc3RhdGUgdmFsdWUgdG8gdHJhbnNpdGlvbiB0byBpZiBubyBoaXN0b3J5IHZhbHVlIGV4aXN0cyB5ZXQuXHJcbiAgICAgKi9cbiAgICBnZXQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgIHZhciB0YXJnZXQ7XG5cbiAgICAgIGlmICh0aGlzLnR5cGUgPT09ICdoaXN0b3J5Jykge1xuICAgICAgICB2YXIgaGlzdG9yeUNvbmZpZyA9IHRoaXMuY29uZmlnO1xuXG4gICAgICAgIGlmIChpc1N0cmluZyhoaXN0b3J5Q29uZmlnLnRhcmdldCkpIHtcbiAgICAgICAgICB0YXJnZXQgPSBpc1N0YXRlSWQoaGlzdG9yeUNvbmZpZy50YXJnZXQpID8gcGF0aFRvU3RhdGVWYWx1ZSh0aGlzLm1hY2hpbmUuZ2V0U3RhdGVOb2RlQnlJZChoaXN0b3J5Q29uZmlnLnRhcmdldCkucGF0aC5zbGljZSh0aGlzLnBhdGgubGVuZ3RoIC0gMSkpIDogaGlzdG9yeUNvbmZpZy50YXJnZXQ7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgdGFyZ2V0ID0gaGlzdG9yeUNvbmZpZy50YXJnZXQ7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHRhcmdldDtcbiAgICB9LFxuICAgIGVudW1lcmFibGU6IGZhbHNlLFxuICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZVxuICB9KTtcbiAgLyoqXHJcbiAgICogUmV0dXJucyB0aGUgbGVhZiBub2RlcyBmcm9tIGEgc3RhdGUgcGF0aCByZWxhdGl2ZSB0byB0aGlzIHN0YXRlIG5vZGUuXHJcbiAgICpcclxuICAgKiBAcGFyYW0gcmVsYXRpdmVTdGF0ZUlkIFRoZSByZWxhdGl2ZSBzdGF0ZSBwYXRoIHRvIHJldHJpZXZlIHRoZSBzdGF0ZSBub2Rlc1xyXG4gICAqIEBwYXJhbSBoaXN0b3J5IFRoZSBwcmV2aW91cyBzdGF0ZSB0byByZXRyaWV2ZSBoaXN0b3J5XHJcbiAgICogQHBhcmFtIHJlc29sdmUgV2hldGhlciBzdGF0ZSBub2RlcyBzaG91bGQgcmVzb2x2ZSB0byBpbml0aWFsIGNoaWxkIHN0YXRlIG5vZGVzXHJcbiAgICovXG5cbiAgU3RhdGVOb2RlLnByb3RvdHlwZS5nZXRSZWxhdGl2ZVN0YXRlTm9kZXMgPSBmdW5jdGlvbiAocmVsYXRpdmVTdGF0ZUlkLCBoaXN0b3J5VmFsdWUsIHJlc29sdmUpIHtcbiAgICBpZiAocmVzb2x2ZSA9PT0gdm9pZCAwKSB7XG4gICAgICByZXNvbHZlID0gdHJ1ZTtcbiAgICB9XG5cbiAgICByZXR1cm4gcmVzb2x2ZSA/IHJlbGF0aXZlU3RhdGVJZC50eXBlID09PSAnaGlzdG9yeScgPyByZWxhdGl2ZVN0YXRlSWQucmVzb2x2ZUhpc3RvcnkoaGlzdG9yeVZhbHVlKSA6IHJlbGF0aXZlU3RhdGVJZC5pbml0aWFsU3RhdGVOb2RlcyA6IFtyZWxhdGl2ZVN0YXRlSWRdO1xuICB9O1xuXG4gIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShTdGF0ZU5vZGUucHJvdG90eXBlLCBcImluaXRpYWxTdGF0ZU5vZGVzXCIsIHtcbiAgICBnZXQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgIHZhciBfdGhpcyA9IHRoaXM7XG5cbiAgICAgIGlmIChpc0xlYWZOb2RlKHRoaXMpKSB7XG4gICAgICAgIHJldHVybiBbdGhpc107XG4gICAgICB9IC8vIENhc2Ugd2hlbiBzdGF0ZSBub2RlIGlzIGNvbXBvdW5kIGJ1dCBubyBpbml0aWFsIHN0YXRlIGlzIGRlZmluZWRcblxuXG4gICAgICBpZiAodGhpcy50eXBlID09PSAnY29tcG91bmQnICYmICF0aGlzLmluaXRpYWwpIHtcbiAgICAgICAgaWYgKCFJU19QUk9EVUNUSU9OKSB7XG4gICAgICAgICAgd2FybihmYWxzZSwgXCJDb21wb3VuZCBzdGF0ZSBub2RlICdcIiArIHRoaXMuaWQgKyBcIicgaGFzIG5vIGluaXRpYWwgc3RhdGUuXCIpO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIFt0aGlzXTtcbiAgICAgIH1cblxuICAgICAgdmFyIGluaXRpYWxTdGF0ZU5vZGVQYXRocyA9IHRvU3RhdGVQYXRocyh0aGlzLmluaXRpYWxTdGF0ZVZhbHVlKTtcbiAgICAgIHJldHVybiBmbGF0dGVuKGluaXRpYWxTdGF0ZU5vZGVQYXRocy5tYXAoZnVuY3Rpb24gKGluaXRpYWxQYXRoKSB7XG4gICAgICAgIHJldHVybiBfdGhpcy5nZXRGcm9tUmVsYXRpdmVQYXRoKGluaXRpYWxQYXRoKTtcbiAgICAgIH0pKTtcbiAgICB9LFxuICAgIGVudW1lcmFibGU6IGZhbHNlLFxuICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZVxuICB9KTtcbiAgLyoqXHJcbiAgICogUmV0cmlldmVzIHN0YXRlIG5vZGVzIGZyb20gYSByZWxhdGl2ZSBwYXRoIHRvIHRoaXMgc3RhdGUgbm9kZS5cclxuICAgKlxyXG4gICAqIEBwYXJhbSByZWxhdGl2ZVBhdGggVGhlIHJlbGF0aXZlIHBhdGggZnJvbSB0aGlzIHN0YXRlIG5vZGVcclxuICAgKiBAcGFyYW0gaGlzdG9yeVZhbHVlXHJcbiAgICovXG5cbiAgU3RhdGVOb2RlLnByb3RvdHlwZS5nZXRGcm9tUmVsYXRpdmVQYXRoID0gZnVuY3Rpb24gKHJlbGF0aXZlUGF0aCkge1xuICAgIGlmICghcmVsYXRpdmVQYXRoLmxlbmd0aCkge1xuICAgICAgcmV0dXJuIFt0aGlzXTtcbiAgICB9XG5cbiAgICB2YXIgX2EgPSBfX3JlYWQocmVsYXRpdmVQYXRoKSxcbiAgICAgICAgc3RhdGVLZXkgPSBfYVswXSxcbiAgICAgICAgY2hpbGRTdGF0ZVBhdGggPSBfYS5zbGljZSgxKTtcblxuICAgIGlmICghdGhpcy5zdGF0ZXMpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihcIkNhbm5vdCByZXRyaWV2ZSBzdWJQYXRoICdcIiArIHN0YXRlS2V5ICsgXCInIGZyb20gbm9kZSB3aXRoIG5vIHN0YXRlc1wiKTtcbiAgICB9XG5cbiAgICB2YXIgY2hpbGRTdGF0ZU5vZGUgPSB0aGlzLmdldFN0YXRlTm9kZShzdGF0ZUtleSk7XG5cbiAgICBpZiAoY2hpbGRTdGF0ZU5vZGUudHlwZSA9PT0gJ2hpc3RvcnknKSB7XG4gICAgICByZXR1cm4gY2hpbGRTdGF0ZU5vZGUucmVzb2x2ZUhpc3RvcnkoKTtcbiAgICB9XG5cbiAgICBpZiAoIXRoaXMuc3RhdGVzW3N0YXRlS2V5XSkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKFwiQ2hpbGQgc3RhdGUgJ1wiICsgc3RhdGVLZXkgKyBcIicgZG9lcyBub3QgZXhpc3Qgb24gJ1wiICsgdGhpcy5pZCArIFwiJ1wiKTtcbiAgICB9XG5cbiAgICByZXR1cm4gdGhpcy5zdGF0ZXNbc3RhdGVLZXldLmdldEZyb21SZWxhdGl2ZVBhdGgoY2hpbGRTdGF0ZVBhdGgpO1xuICB9O1xuXG4gIFN0YXRlTm9kZS5wcm90b3R5cGUuaGlzdG9yeVZhbHVlID0gZnVuY3Rpb24gKHJlbGF0aXZlU3RhdGVWYWx1ZSkge1xuICAgIGlmICgha2V5cyh0aGlzLnN0YXRlcykubGVuZ3RoKSB7XG4gICAgICByZXR1cm4gdW5kZWZpbmVkO1xuICAgIH1cblxuICAgIHJldHVybiB7XG4gICAgICBjdXJyZW50OiByZWxhdGl2ZVN0YXRlVmFsdWUgfHwgdGhpcy5pbml0aWFsU3RhdGVWYWx1ZSxcbiAgICAgIHN0YXRlczogbWFwRmlsdGVyVmFsdWVzKHRoaXMuc3RhdGVzLCBmdW5jdGlvbiAoc3RhdGVOb2RlLCBrZXkpIHtcbiAgICAgICAgaWYgKCFyZWxhdGl2ZVN0YXRlVmFsdWUpIHtcbiAgICAgICAgICByZXR1cm4gc3RhdGVOb2RlLmhpc3RvcnlWYWx1ZSgpO1xuICAgICAgICB9XG5cbiAgICAgICAgdmFyIHN1YlN0YXRlVmFsdWUgPSBpc1N0cmluZyhyZWxhdGl2ZVN0YXRlVmFsdWUpID8gdW5kZWZpbmVkIDogcmVsYXRpdmVTdGF0ZVZhbHVlW2tleV07XG4gICAgICAgIHJldHVybiBzdGF0ZU5vZGUuaGlzdG9yeVZhbHVlKHN1YlN0YXRlVmFsdWUgfHwgc3RhdGVOb2RlLmluaXRpYWxTdGF0ZVZhbHVlKTtcbiAgICAgIH0sIGZ1bmN0aW9uIChzdGF0ZU5vZGUpIHtcbiAgICAgICAgcmV0dXJuICFzdGF0ZU5vZGUuaGlzdG9yeTtcbiAgICAgIH0pXG4gICAgfTtcbiAgfTtcbiAgLyoqXHJcbiAgICogUmVzb2x2ZXMgdG8gdGhlIGhpc3RvcmljYWwgdmFsdWUocykgb2YgdGhlIHBhcmVudCBzdGF0ZSBub2RlLFxyXG4gICAqIHJlcHJlc2VudGVkIGJ5IHN0YXRlIG5vZGVzLlxyXG4gICAqXHJcbiAgICogQHBhcmFtIGhpc3RvcnlWYWx1ZVxyXG4gICAqL1xuXG5cbiAgU3RhdGVOb2RlLnByb3RvdHlwZS5yZXNvbHZlSGlzdG9yeSA9IGZ1bmN0aW9uIChoaXN0b3J5VmFsdWUpIHtcbiAgICB2YXIgX3RoaXMgPSB0aGlzO1xuXG4gICAgaWYgKHRoaXMudHlwZSAhPT0gJ2hpc3RvcnknKSB7XG4gICAgICByZXR1cm4gW3RoaXNdO1xuICAgIH1cblxuICAgIHZhciBwYXJlbnQgPSB0aGlzLnBhcmVudDtcblxuICAgIGlmICghaGlzdG9yeVZhbHVlKSB7XG4gICAgICB2YXIgaGlzdG9yeVRhcmdldCA9IHRoaXMudGFyZ2V0O1xuICAgICAgcmV0dXJuIGhpc3RvcnlUYXJnZXQgPyBmbGF0dGVuKHRvU3RhdGVQYXRocyhoaXN0b3J5VGFyZ2V0KS5tYXAoZnVuY3Rpb24gKHJlbGF0aXZlQ2hpbGRQYXRoKSB7XG4gICAgICAgIHJldHVybiBwYXJlbnQuZ2V0RnJvbVJlbGF0aXZlUGF0aChyZWxhdGl2ZUNoaWxkUGF0aCk7XG4gICAgICB9KSkgOiBwYXJlbnQuaW5pdGlhbFN0YXRlTm9kZXM7XG4gICAgfVxuXG4gICAgdmFyIHN1Ykhpc3RvcnlWYWx1ZSA9IG5lc3RlZFBhdGgocGFyZW50LnBhdGgsICdzdGF0ZXMnKShoaXN0b3J5VmFsdWUpLmN1cnJlbnQ7XG5cbiAgICBpZiAoaXNTdHJpbmcoc3ViSGlzdG9yeVZhbHVlKSkge1xuICAgICAgcmV0dXJuIFtwYXJlbnQuZ2V0U3RhdGVOb2RlKHN1Ykhpc3RvcnlWYWx1ZSldO1xuICAgIH1cblxuICAgIHJldHVybiBmbGF0dGVuKHRvU3RhdGVQYXRocyhzdWJIaXN0b3J5VmFsdWUpLm1hcChmdW5jdGlvbiAoc3ViU3RhdGVQYXRoKSB7XG4gICAgICByZXR1cm4gX3RoaXMuaGlzdG9yeSA9PT0gJ2RlZXAnID8gcGFyZW50LmdldEZyb21SZWxhdGl2ZVBhdGgoc3ViU3RhdGVQYXRoKSA6IFtwYXJlbnQuc3RhdGVzW3N1YlN0YXRlUGF0aFswXV1dO1xuICAgIH0pKTtcbiAgfTtcblxuICBPYmplY3QuZGVmaW5lUHJvcGVydHkoU3RhdGVOb2RlLnByb3RvdHlwZSwgXCJzdGF0ZUlkc1wiLCB7XG4gICAgLyoqXHJcbiAgICAgKiBBbGwgdGhlIHN0YXRlIG5vZGUgSURzIG9mIHRoaXMgc3RhdGUgbm9kZSBhbmQgaXRzIGRlc2NlbmRhbnQgc3RhdGUgbm9kZXMuXHJcbiAgICAgKi9cbiAgICBnZXQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgIHZhciBfdGhpcyA9IHRoaXM7XG5cbiAgICAgIHZhciBjaGlsZFN0YXRlSWRzID0gZmxhdHRlbihrZXlzKHRoaXMuc3RhdGVzKS5tYXAoZnVuY3Rpb24gKHN0YXRlS2V5KSB7XG4gICAgICAgIHJldHVybiBfdGhpcy5zdGF0ZXNbc3RhdGVLZXldLnN0YXRlSWRzO1xuICAgICAgfSkpO1xuICAgICAgcmV0dXJuIFt0aGlzLmlkXS5jb25jYXQoY2hpbGRTdGF0ZUlkcyk7XG4gICAgfSxcbiAgICBlbnVtZXJhYmxlOiBmYWxzZSxcbiAgICBjb25maWd1cmFibGU6IHRydWVcbiAgfSk7XG4gIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShTdGF0ZU5vZGUucHJvdG90eXBlLCBcImV2ZW50c1wiLCB7XG4gICAgLyoqXHJcbiAgICAgKiBBbGwgdGhlIGV2ZW50IHR5cGVzIGFjY2VwdGVkIGJ5IHRoaXMgc3RhdGUgbm9kZSBhbmQgaXRzIGRlc2NlbmRhbnRzLlxyXG4gICAgICovXG4gICAgZ2V0OiBmdW5jdGlvbiAoKSB7XG4gICAgICB2YXIgZV83LCBfYSwgZV84LCBfYjtcblxuICAgICAgaWYgKHRoaXMuX19jYWNoZS5ldmVudHMpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX19jYWNoZS5ldmVudHM7XG4gICAgICB9XG5cbiAgICAgIHZhciBzdGF0ZXMgPSB0aGlzLnN0YXRlcztcbiAgICAgIHZhciBldmVudHMgPSBuZXcgU2V0KHRoaXMub3duRXZlbnRzKTtcblxuICAgICAgaWYgKHN0YXRlcykge1xuICAgICAgICB0cnkge1xuICAgICAgICAgIGZvciAodmFyIF9jID0gX192YWx1ZXMoa2V5cyhzdGF0ZXMpKSwgX2QgPSBfYy5uZXh0KCk7ICFfZC5kb25lOyBfZCA9IF9jLm5leHQoKSkge1xuICAgICAgICAgICAgdmFyIHN0YXRlSWQgPSBfZC52YWx1ZTtcbiAgICAgICAgICAgIHZhciBzdGF0ZSA9IHN0YXRlc1tzdGF0ZUlkXTtcblxuICAgICAgICAgICAgaWYgKHN0YXRlLnN0YXRlcykge1xuICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgIGZvciAodmFyIF9lID0gKGVfOCA9IHZvaWQgMCwgX192YWx1ZXMoc3RhdGUuZXZlbnRzKSksIF9mID0gX2UubmV4dCgpOyAhX2YuZG9uZTsgX2YgPSBfZS5uZXh0KCkpIHtcbiAgICAgICAgICAgICAgICAgIHZhciBldmVudF8xID0gX2YudmFsdWU7XG4gICAgICAgICAgICAgICAgICBldmVudHMuYWRkKFwiXCIgKyBldmVudF8xKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIH0gY2F0Y2ggKGVfOF8xKSB7XG4gICAgICAgICAgICAgICAgZV84ID0ge1xuICAgICAgICAgICAgICAgICAgZXJyb3I6IGVfOF8xXG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgfSBmaW5hbGx5IHtcbiAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgaWYgKF9mICYmICFfZi5kb25lICYmIChfYiA9IF9lLnJldHVybikpIF9iLmNhbGwoX2UpO1xuICAgICAgICAgICAgICAgIH0gZmluYWxseSB7XG4gICAgICAgICAgICAgICAgICBpZiAoZV84KSB0aHJvdyBlXzguZXJyb3I7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9IGNhdGNoIChlXzdfMSkge1xuICAgICAgICAgIGVfNyA9IHtcbiAgICAgICAgICAgIGVycm9yOiBlXzdfMVxuICAgICAgICAgIH07XG4gICAgICAgIH0gZmluYWxseSB7XG4gICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGlmIChfZCAmJiAhX2QuZG9uZSAmJiAoX2EgPSBfYy5yZXR1cm4pKSBfYS5jYWxsKF9jKTtcbiAgICAgICAgICB9IGZpbmFsbHkge1xuICAgICAgICAgICAgaWYgKGVfNykgdGhyb3cgZV83LmVycm9yO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICByZXR1cm4gdGhpcy5fX2NhY2hlLmV2ZW50cyA9IEFycmF5LmZyb20oZXZlbnRzKTtcbiAgICB9LFxuICAgIGVudW1lcmFibGU6IGZhbHNlLFxuICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZVxuICB9KTtcbiAgT2JqZWN0LmRlZmluZVByb3BlcnR5KFN0YXRlTm9kZS5wcm90b3R5cGUsIFwib3duRXZlbnRzXCIsIHtcbiAgICAvKipcclxuICAgICAqIEFsbCB0aGUgZXZlbnRzIHRoYXQgaGF2ZSB0cmFuc2l0aW9ucyBkaXJlY3RseSBmcm9tIHRoaXMgc3RhdGUgbm9kZS5cclxuICAgICAqXHJcbiAgICAgKiBFeGNsdWRlcyBhbnkgaW5lcnQgZXZlbnRzLlxyXG4gICAgICovXG4gICAgZ2V0OiBmdW5jdGlvbiAoKSB7XG4gICAgICB2YXIgZXZlbnRzID0gbmV3IFNldCh0aGlzLnRyYW5zaXRpb25zLmZpbHRlcihmdW5jdGlvbiAodHJhbnNpdGlvbikge1xuICAgICAgICByZXR1cm4gISghdHJhbnNpdGlvbi50YXJnZXQgJiYgIXRyYW5zaXRpb24uYWN0aW9ucy5sZW5ndGggJiYgdHJhbnNpdGlvbi5pbnRlcm5hbCk7XG4gICAgICB9KS5tYXAoZnVuY3Rpb24gKHRyYW5zaXRpb24pIHtcbiAgICAgICAgcmV0dXJuIHRyYW5zaXRpb24uZXZlbnRUeXBlO1xuICAgICAgfSkpO1xuICAgICAgcmV0dXJuIEFycmF5LmZyb20oZXZlbnRzKTtcbiAgICB9LFxuICAgIGVudW1lcmFibGU6IGZhbHNlLFxuICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZVxuICB9KTtcblxuICBTdGF0ZU5vZGUucHJvdG90eXBlLnJlc29sdmVUYXJnZXQgPSBmdW5jdGlvbiAoX3RhcmdldCkge1xuICAgIHZhciBfdGhpcyA9IHRoaXM7XG5cbiAgICBpZiAoX3RhcmdldCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAvLyBhbiB1bmRlZmluZWQgdGFyZ2V0IHNpZ25hbHMgdGhhdCB0aGUgc3RhdGUgbm9kZSBzaG91bGQgbm90IHRyYW5zaXRpb24gZnJvbSB0aGF0IHN0YXRlIHdoZW4gcmVjZWl2aW5nIHRoYXQgZXZlbnRcbiAgICAgIHJldHVybiB1bmRlZmluZWQ7XG4gICAgfVxuXG4gICAgcmV0dXJuIF90YXJnZXQubWFwKGZ1bmN0aW9uICh0YXJnZXQpIHtcbiAgICAgIGlmICghaXNTdHJpbmcodGFyZ2V0KSkge1xuICAgICAgICByZXR1cm4gdGFyZ2V0O1xuICAgICAgfVxuXG4gICAgICB2YXIgaXNJbnRlcm5hbFRhcmdldCA9IHRhcmdldFswXSA9PT0gX3RoaXMuZGVsaW1pdGVyOyAvLyBJZiBpbnRlcm5hbCB0YXJnZXQgaXMgZGVmaW5lZCBvbiBtYWNoaW5lLFxuICAgICAgLy8gZG8gbm90IGluY2x1ZGUgbWFjaGluZSBrZXkgb24gdGFyZ2V0XG5cbiAgICAgIGlmIChpc0ludGVybmFsVGFyZ2V0ICYmICFfdGhpcy5wYXJlbnQpIHtcbiAgICAgICAgcmV0dXJuIF90aGlzLmdldFN0YXRlTm9kZUJ5UGF0aCh0YXJnZXQuc2xpY2UoMSkpO1xuICAgICAgfVxuXG4gICAgICB2YXIgcmVzb2x2ZWRUYXJnZXQgPSBpc0ludGVybmFsVGFyZ2V0ID8gX3RoaXMua2V5ICsgdGFyZ2V0IDogdGFyZ2V0O1xuXG4gICAgICBpZiAoX3RoaXMucGFyZW50KSB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgdmFyIHRhcmdldFN0YXRlTm9kZSA9IF90aGlzLnBhcmVudC5nZXRTdGF0ZU5vZGVCeVBhdGgocmVzb2x2ZWRUYXJnZXQpO1xuXG4gICAgICAgICAgcmV0dXJuIHRhcmdldFN0YXRlTm9kZTtcbiAgICAgICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiSW52YWxpZCB0cmFuc2l0aW9uIGRlZmluaXRpb24gZm9yIHN0YXRlIG5vZGUgJ1wiICsgX3RoaXMuaWQgKyBcIic6XFxuXCIgKyBlcnIubWVzc2FnZSk7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiBfdGhpcy5nZXRTdGF0ZU5vZGVCeVBhdGgocmVzb2x2ZWRUYXJnZXQpO1xuICAgICAgfVxuICAgIH0pO1xuICB9O1xuXG4gIFN0YXRlTm9kZS5wcm90b3R5cGUuZm9ybWF0VHJhbnNpdGlvbiA9IGZ1bmN0aW9uICh0cmFuc2l0aW9uQ29uZmlnKSB7XG4gICAgdmFyIF90aGlzID0gdGhpcztcblxuICAgIHZhciBub3JtYWxpemVkVGFyZ2V0ID0gbm9ybWFsaXplVGFyZ2V0KHRyYW5zaXRpb25Db25maWcudGFyZ2V0KTtcbiAgICB2YXIgaW50ZXJuYWwgPSAnaW50ZXJuYWwnIGluIHRyYW5zaXRpb25Db25maWcgPyB0cmFuc2l0aW9uQ29uZmlnLmludGVybmFsIDogbm9ybWFsaXplZFRhcmdldCA/IG5vcm1hbGl6ZWRUYXJnZXQuc29tZShmdW5jdGlvbiAoX3RhcmdldCkge1xuICAgICAgcmV0dXJuIGlzU3RyaW5nKF90YXJnZXQpICYmIF90YXJnZXRbMF0gPT09IF90aGlzLmRlbGltaXRlcjtcbiAgICB9KSA6IHRydWU7XG4gICAgdmFyIGd1YXJkcyA9IHRoaXMubWFjaGluZS5vcHRpb25zLmd1YXJkcztcbiAgICB2YXIgdGFyZ2V0ID0gdGhpcy5yZXNvbHZlVGFyZ2V0KG5vcm1hbGl6ZWRUYXJnZXQpO1xuXG4gICAgdmFyIHRyYW5zaXRpb24gPSBfX2Fzc2lnbihfX2Fzc2lnbih7fSwgdHJhbnNpdGlvbkNvbmZpZyksIHtcbiAgICAgIGFjdGlvbnM6IHRvQWN0aW9uT2JqZWN0cyh0b0FycmF5KHRyYW5zaXRpb25Db25maWcuYWN0aW9ucykpLFxuICAgICAgY29uZDogdG9HdWFyZCh0cmFuc2l0aW9uQ29uZmlnLmNvbmQsIGd1YXJkcyksXG4gICAgICB0YXJnZXQ6IHRhcmdldCxcbiAgICAgIHNvdXJjZTogdGhpcyxcbiAgICAgIGludGVybmFsOiBpbnRlcm5hbCxcbiAgICAgIGV2ZW50VHlwZTogdHJhbnNpdGlvbkNvbmZpZy5ldmVudCxcbiAgICAgIHRvSlNPTjogZnVuY3Rpb24gKCkge1xuICAgICAgICByZXR1cm4gX19hc3NpZ24oX19hc3NpZ24oe30sIHRyYW5zaXRpb24pLCB7XG4gICAgICAgICAgdGFyZ2V0OiB0cmFuc2l0aW9uLnRhcmdldCA/IHRyYW5zaXRpb24udGFyZ2V0Lm1hcChmdW5jdGlvbiAodCkge1xuICAgICAgICAgICAgcmV0dXJuIFwiI1wiICsgdC5pZDtcbiAgICAgICAgICB9KSA6IHVuZGVmaW5lZCxcbiAgICAgICAgICBzb3VyY2U6IFwiI1wiICsgX3RoaXMuaWRcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICByZXR1cm4gdHJhbnNpdGlvbjtcbiAgfTtcblxuICBTdGF0ZU5vZGUucHJvdG90eXBlLmZvcm1hdFRyYW5zaXRpb25zID0gZnVuY3Rpb24gKCkge1xuICAgIHZhciBlXzksIF9hO1xuXG4gICAgdmFyIF90aGlzID0gdGhpcztcblxuICAgIHZhciBvbkNvbmZpZztcblxuICAgIGlmICghdGhpcy5jb25maWcub24pIHtcbiAgICAgIG9uQ29uZmlnID0gW107XG4gICAgfSBlbHNlIGlmIChBcnJheS5pc0FycmF5KHRoaXMuY29uZmlnLm9uKSkge1xuICAgICAgb25Db25maWcgPSB0aGlzLmNvbmZpZy5vbjtcbiAgICB9IGVsc2Uge1xuICAgICAgdmFyIF9iID0gdGhpcy5jb25maWcub24sXG4gICAgICAgICAgX2MgPSBXSUxEQ0FSRCxcbiAgICAgICAgICBfZCA9IF9iW19jXSxcbiAgICAgICAgICB3aWxkY2FyZENvbmZpZ3MgPSBfZCA9PT0gdm9pZCAwID8gW10gOiBfZCxcbiAgICAgICAgICBzdHJpY3RUcmFuc2l0aW9uQ29uZmlnc18xID0gX19yZXN0KF9iLCBbdHlwZW9mIF9jID09PSBcInN5bWJvbFwiID8gX2MgOiBfYyArIFwiXCJdKTtcblxuICAgICAgb25Db25maWcgPSBmbGF0dGVuKGtleXMoc3RyaWN0VHJhbnNpdGlvbkNvbmZpZ3NfMSkubWFwKGZ1bmN0aW9uIChrZXkpIHtcbiAgICAgICAgaWYgKCFJU19QUk9EVUNUSU9OICYmIGtleSA9PT0gTlVMTF9FVkVOVCkge1xuICAgICAgICAgIHdhcm4oZmFsc2UsIFwiRW1wdHkgc3RyaW5nIHRyYW5zaXRpb24gY29uZmlncyAoZS5nLiwgYHsgb246IHsgJyc6IC4uLiB9fWApIGZvciB0cmFuc2llbnQgdHJhbnNpdGlvbnMgYXJlIGRlcHJlY2F0ZWQuIFNwZWNpZnkgdGhlIHRyYW5zaXRpb24gaW4gdGhlIGB7IGFsd2F5czogLi4uIH1gIHByb3BlcnR5IGluc3RlYWQuIFwiICsgKFwiUGxlYXNlIGNoZWNrIHRoZSBgb25gIGNvbmZpZ3VyYXRpb24gZm9yIFxcXCIjXCIgKyBfdGhpcy5pZCArIFwiXFxcIi5cIikpO1xuICAgICAgICB9XG5cbiAgICAgICAgdmFyIHRyYW5zaXRpb25Db25maWdBcnJheSA9IHRvVHJhbnNpdGlvbkNvbmZpZ0FycmF5KGtleSwgc3RyaWN0VHJhbnNpdGlvbkNvbmZpZ3NfMVtrZXldKTtcblxuICAgICAgICBpZiAoIUlTX1BST0RVQ1RJT04pIHtcbiAgICAgICAgICB2YWxpZGF0ZUFycmF5aWZpZWRUcmFuc2l0aW9ucyhfdGhpcywga2V5LCB0cmFuc2l0aW9uQ29uZmlnQXJyYXkpO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHRyYW5zaXRpb25Db25maWdBcnJheTtcbiAgICAgIH0pLmNvbmNhdCh0b1RyYW5zaXRpb25Db25maWdBcnJheShXSUxEQ0FSRCwgd2lsZGNhcmRDb25maWdzKSkpO1xuICAgIH1cblxuICAgIHZhciBldmVudGxlc3NDb25maWcgPSB0aGlzLmNvbmZpZy5hbHdheXMgPyB0b1RyYW5zaXRpb25Db25maWdBcnJheSgnJywgdGhpcy5jb25maWcuYWx3YXlzKSA6IFtdO1xuICAgIHZhciBkb25lQ29uZmlnID0gdGhpcy5jb25maWcub25Eb25lID8gdG9UcmFuc2l0aW9uQ29uZmlnQXJyYXkoU3RyaW5nKGRvbmUodGhpcy5pZCkpLCB0aGlzLmNvbmZpZy5vbkRvbmUpIDogW107XG5cbiAgICBpZiAoIUlTX1BST0RVQ1RJT04pIHtcbiAgICAgIHdhcm4oISh0aGlzLmNvbmZpZy5vbkRvbmUgJiYgIXRoaXMucGFyZW50KSwgXCJSb290IG5vZGVzIGNhbm5vdCBoYXZlIGFuIFxcXCIub25Eb25lXFxcIiB0cmFuc2l0aW9uLiBQbGVhc2UgY2hlY2sgdGhlIGNvbmZpZyBvZiBcXFwiXCIgKyB0aGlzLmlkICsgXCJcXFwiLlwiKTtcbiAgICB9XG5cbiAgICB2YXIgaW52b2tlQ29uZmlnID0gZmxhdHRlbih0aGlzLmludm9rZS5tYXAoZnVuY3Rpb24gKGludm9rZURlZikge1xuICAgICAgdmFyIHNldHRsZVRyYW5zaXRpb25zID0gW107XG5cbiAgICAgIGlmIChpbnZva2VEZWYub25Eb25lKSB7XG4gICAgICAgIHNldHRsZVRyYW5zaXRpb25zLnB1c2guYXBwbHkoc2V0dGxlVHJhbnNpdGlvbnMsIF9fc3ByZWFkKHRvVHJhbnNpdGlvbkNvbmZpZ0FycmF5KFN0cmluZyhkb25lSW52b2tlKGludm9rZURlZi5pZCkpLCBpbnZva2VEZWYub25Eb25lKSkpO1xuICAgICAgfVxuXG4gICAgICBpZiAoaW52b2tlRGVmLm9uRXJyb3IpIHtcbiAgICAgICAgc2V0dGxlVHJhbnNpdGlvbnMucHVzaC5hcHBseShzZXR0bGVUcmFuc2l0aW9ucywgX19zcHJlYWQodG9UcmFuc2l0aW9uQ29uZmlnQXJyYXkoU3RyaW5nKGVycm9yKGludm9rZURlZi5pZCkpLCBpbnZva2VEZWYub25FcnJvcikpKTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHNldHRsZVRyYW5zaXRpb25zO1xuICAgIH0pKTtcbiAgICB2YXIgZGVsYXllZFRyYW5zaXRpb25zID0gdGhpcy5hZnRlcjtcbiAgICB2YXIgZm9ybWF0dGVkVHJhbnNpdGlvbnMgPSBmbGF0dGVuKF9fc3ByZWFkKGRvbmVDb25maWcsIGludm9rZUNvbmZpZywgb25Db25maWcsIGV2ZW50bGVzc0NvbmZpZykubWFwKGZ1bmN0aW9uICh0cmFuc2l0aW9uQ29uZmlnKSB7XG4gICAgICByZXR1cm4gdG9BcnJheSh0cmFuc2l0aW9uQ29uZmlnKS5tYXAoZnVuY3Rpb24gKHRyYW5zaXRpb24pIHtcbiAgICAgICAgcmV0dXJuIF90aGlzLmZvcm1hdFRyYW5zaXRpb24odHJhbnNpdGlvbik7XG4gICAgICB9KTtcbiAgICB9KSk7XG5cbiAgICB0cnkge1xuICAgICAgZm9yICh2YXIgZGVsYXllZFRyYW5zaXRpb25zXzEgPSBfX3ZhbHVlcyhkZWxheWVkVHJhbnNpdGlvbnMpLCBkZWxheWVkVHJhbnNpdGlvbnNfMV8xID0gZGVsYXllZFRyYW5zaXRpb25zXzEubmV4dCgpOyAhZGVsYXllZFRyYW5zaXRpb25zXzFfMS5kb25lOyBkZWxheWVkVHJhbnNpdGlvbnNfMV8xID0gZGVsYXllZFRyYW5zaXRpb25zXzEubmV4dCgpKSB7XG4gICAgICAgIHZhciBkZWxheWVkVHJhbnNpdGlvbiA9IGRlbGF5ZWRUcmFuc2l0aW9uc18xXzEudmFsdWU7XG4gICAgICAgIGZvcm1hdHRlZFRyYW5zaXRpb25zLnB1c2goZGVsYXllZFRyYW5zaXRpb24pO1xuICAgICAgfVxuICAgIH0gY2F0Y2ggKGVfOV8xKSB7XG4gICAgICBlXzkgPSB7XG4gICAgICAgIGVycm9yOiBlXzlfMVxuICAgICAgfTtcbiAgICB9IGZpbmFsbHkge1xuICAgICAgdHJ5IHtcbiAgICAgICAgaWYgKGRlbGF5ZWRUcmFuc2l0aW9uc18xXzEgJiYgIWRlbGF5ZWRUcmFuc2l0aW9uc18xXzEuZG9uZSAmJiAoX2EgPSBkZWxheWVkVHJhbnNpdGlvbnNfMS5yZXR1cm4pKSBfYS5jYWxsKGRlbGF5ZWRUcmFuc2l0aW9uc18xKTtcbiAgICAgIH0gZmluYWxseSB7XG4gICAgICAgIGlmIChlXzkpIHRocm93IGVfOS5lcnJvcjtcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gZm9ybWF0dGVkVHJhbnNpdGlvbnM7XG4gIH07XG5cbiAgcmV0dXJuIFN0YXRlTm9kZTtcbn0oKTtcblxuZXhwb3J0IHsgU3RhdGVOb2RlIH07IiwiaW1wb3J0IHsgU3RhdGVOb2RlIH0gZnJvbSAnLi9TdGF0ZU5vZGUuanMnO1xuXG5mdW5jdGlvbiBNYWNoaW5lKGNvbmZpZywgb3B0aW9ucywgaW5pdGlhbENvbnRleHQpIHtcbiAgaWYgKGluaXRpYWxDb250ZXh0ID09PSB2b2lkIDApIHtcbiAgICBpbml0aWFsQ29udGV4dCA9IGNvbmZpZy5jb250ZXh0O1xuICB9XG5cbiAgdmFyIHJlc29sdmVkSW5pdGlhbENvbnRleHQgPSB0eXBlb2YgaW5pdGlhbENvbnRleHQgPT09ICdmdW5jdGlvbicgPyBpbml0aWFsQ29udGV4dCgpIDogaW5pdGlhbENvbnRleHQ7XG4gIHJldHVybiBuZXcgU3RhdGVOb2RlKGNvbmZpZywgb3B0aW9ucywgcmVzb2x2ZWRJbml0aWFsQ29udGV4dCk7XG59XG5cbmZ1bmN0aW9uIGNyZWF0ZU1hY2hpbmUoY29uZmlnLCBvcHRpb25zKSB7XG4gIHZhciByZXNvbHZlZEluaXRpYWxDb250ZXh0ID0gdHlwZW9mIGNvbmZpZy5jb250ZXh0ID09PSAnZnVuY3Rpb24nID8gY29uZmlnLmNvbnRleHQoKSA6IGNvbmZpZy5jb250ZXh0O1xuICByZXR1cm4gbmV3IFN0YXRlTm9kZShjb25maWcsIG9wdGlvbnMsIHJlc29sdmVkSW5pdGlhbENvbnRleHQpO1xufVxuXG5leHBvcnQgeyBNYWNoaW5lLCBjcmVhdGVNYWNoaW5lIH07IiwiaW1wb3J0IHsgX19hc3NpZ24gfSBmcm9tICcuL192aXJ0dWFsL190c2xpYi5qcyc7XG52YXIgZGVmYXVsdE9wdGlvbnMgPSB7XG4gIGRlZmVyRXZlbnRzOiBmYWxzZVxufTtcblxudmFyIFNjaGVkdWxlciA9XG4vKiNfX1BVUkVfXyovXG5cbi8qKiBAY2xhc3MgKi9cbmZ1bmN0aW9uICgpIHtcbiAgZnVuY3Rpb24gU2NoZWR1bGVyKG9wdGlvbnMpIHtcbiAgICB0aGlzLnByb2Nlc3NpbmdFdmVudCA9IGZhbHNlO1xuICAgIHRoaXMucXVldWUgPSBbXTtcbiAgICB0aGlzLmluaXRpYWxpemVkID0gZmFsc2U7XG4gICAgdGhpcy5vcHRpb25zID0gX19hc3NpZ24oX19hc3NpZ24oe30sIGRlZmF1bHRPcHRpb25zKSwgb3B0aW9ucyk7XG4gIH1cblxuICBTY2hlZHVsZXIucHJvdG90eXBlLmluaXRpYWxpemUgPSBmdW5jdGlvbiAoY2FsbGJhY2spIHtcbiAgICB0aGlzLmluaXRpYWxpemVkID0gdHJ1ZTtcblxuICAgIGlmIChjYWxsYmFjaykge1xuICAgICAgaWYgKCF0aGlzLm9wdGlvbnMuZGVmZXJFdmVudHMpIHtcbiAgICAgICAgdGhpcy5zY2hlZHVsZShjYWxsYmFjayk7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgdGhpcy5wcm9jZXNzKGNhbGxiYWNrKTtcbiAgICB9XG5cbiAgICB0aGlzLmZsdXNoRXZlbnRzKCk7XG4gIH07XG5cbiAgU2NoZWR1bGVyLnByb3RvdHlwZS5zY2hlZHVsZSA9IGZ1bmN0aW9uICh0YXNrKSB7XG4gICAgaWYgKCF0aGlzLmluaXRpYWxpemVkIHx8IHRoaXMucHJvY2Vzc2luZ0V2ZW50KSB7XG4gICAgICB0aGlzLnF1ZXVlLnB1c2godGFzayk7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgaWYgKHRoaXMucXVldWUubGVuZ3RoICE9PSAwKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ0V2ZW50IHF1ZXVlIHNob3VsZCBiZSBlbXB0eSB3aGVuIGl0IGlzIG5vdCBwcm9jZXNzaW5nIGV2ZW50cycpO1xuICAgIH1cblxuICAgIHRoaXMucHJvY2Vzcyh0YXNrKTtcbiAgICB0aGlzLmZsdXNoRXZlbnRzKCk7XG4gIH07XG5cbiAgU2NoZWR1bGVyLnByb3RvdHlwZS5jbGVhciA9IGZ1bmN0aW9uICgpIHtcbiAgICB0aGlzLnF1ZXVlID0gW107XG4gIH07XG5cbiAgU2NoZWR1bGVyLnByb3RvdHlwZS5mbHVzaEV2ZW50cyA9IGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgbmV4dENhbGxiYWNrID0gdGhpcy5xdWV1ZS5zaGlmdCgpO1xuXG4gICAgd2hpbGUgKG5leHRDYWxsYmFjaykge1xuICAgICAgdGhpcy5wcm9jZXNzKG5leHRDYWxsYmFjayk7XG4gICAgICBuZXh0Q2FsbGJhY2sgPSB0aGlzLnF1ZXVlLnNoaWZ0KCk7XG4gICAgfVxuICB9O1xuXG4gIFNjaGVkdWxlci5wcm90b3R5cGUucHJvY2VzcyA9IGZ1bmN0aW9uIChjYWxsYmFjaykge1xuICAgIHRoaXMucHJvY2Vzc2luZ0V2ZW50ID0gdHJ1ZTtcblxuICAgIHRyeSB7XG4gICAgICBjYWxsYmFjaygpO1xuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgIC8vIHRoZXJlIGlzIG5vIHVzZSB0byBrZWVwIHRoZSBmdXR1cmUgZXZlbnRzXG4gICAgICAvLyBhcyB0aGUgc2l0dWF0aW9uIGlzIG5vdCBhbnltb3JlIHRoZSBzYW1lXG4gICAgICB0aGlzLmNsZWFyKCk7XG4gICAgICB0aHJvdyBlO1xuICAgIH0gZmluYWxseSB7XG4gICAgICB0aGlzLnByb2Nlc3NpbmdFdmVudCA9IGZhbHNlO1xuICAgIH1cbiAgfTtcblxuICByZXR1cm4gU2NoZWR1bGVyO1xufSgpO1xuXG5leHBvcnQgeyBTY2hlZHVsZXIgfTsiLCJ2YXIgY2hpbGRyZW4gPSAvKiNfX1BVUkVfXyovbmV3IE1hcCgpO1xudmFyIHNlc3Npb25JZEluZGV4ID0gMDtcbnZhciByZWdpc3RyeSA9IHtcbiAgYm9va0lkOiBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIFwieDpcIiArIHNlc3Npb25JZEluZGV4Kys7XG4gIH0sXG4gIHJlZ2lzdGVyOiBmdW5jdGlvbiAoaWQsIGFjdG9yKSB7XG4gICAgY2hpbGRyZW4uc2V0KGlkLCBhY3Rvcik7XG4gICAgcmV0dXJuIGlkO1xuICB9LFxuICBnZXQ6IGZ1bmN0aW9uIChpZCkge1xuICAgIHJldHVybiBjaGlsZHJlbi5nZXQoaWQpO1xuICB9LFxuICBmcmVlOiBmdW5jdGlvbiAoaWQpIHtcbiAgICBjaGlsZHJlbi5kZWxldGUoaWQpO1xuICB9XG59O1xuZXhwb3J0IHsgcmVnaXN0cnkgfTsiLCJpbXBvcnQgeyBJU19QUk9EVUNUSU9OIH0gZnJvbSAnLi9lbnZpcm9ubWVudC5qcyc7IC8vIEZyb20gaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZW4tVVMvZG9jcy9XZWIvSmF2YVNjcmlwdC9SZWZlcmVuY2UvR2xvYmFsX09iamVjdHMvZ2xvYmFsVGhpc1xuXG5mdW5jdGlvbiBnZXRHbG9iYWwoKSB7XG4gIGlmICh0eXBlb2Ygc2VsZiAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICByZXR1cm4gc2VsZjtcbiAgfVxuXG4gIGlmICh0eXBlb2Ygd2luZG93ICE9PSAndW5kZWZpbmVkJykge1xuICAgIHJldHVybiB3aW5kb3c7XG4gIH1cblxuICBpZiAodHlwZW9mIGdsb2JhbCAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICByZXR1cm4gZ2xvYmFsO1xuICB9XG5cbiAgcmV0dXJuIHVuZGVmaW5lZDtcbn1cblxuZnVuY3Rpb24gZ2V0RGV2VG9vbHMoKSB7XG4gIHZhciBnbG9iYWwgPSBnZXRHbG9iYWwoKTtcblxuICBpZiAoZ2xvYmFsICYmICdfX3hzdGF0ZV9fJyBpbiBnbG9iYWwpIHtcbiAgICByZXR1cm4gZ2xvYmFsLl9feHN0YXRlX187XG4gIH1cblxuICByZXR1cm4gdW5kZWZpbmVkO1xufVxuXG5mdW5jdGlvbiByZWdpc3RlclNlcnZpY2Uoc2VydmljZSkge1xuICBpZiAoSVNfUFJPRFVDVElPTiB8fCAhZ2V0R2xvYmFsKCkpIHtcbiAgICByZXR1cm47XG4gIH1cblxuICB2YXIgZGV2VG9vbHMgPSBnZXREZXZUb29scygpO1xuXG4gIGlmIChkZXZUb29scykge1xuICAgIGRldlRvb2xzLnJlZ2lzdGVyKHNlcnZpY2UpO1xuICB9XG59XG5cbmV4cG9ydCB7IGdldEdsb2JhbCwgcmVnaXN0ZXJTZXJ2aWNlIH07IiwiaW1wb3J0IHsgX192YWx1ZXMsIF9fYXNzaWduLCBfX3NwcmVhZCB9IGZyb20gJy4vX3ZpcnR1YWwvX3RzbGliLmpzJztcbmltcG9ydCB7IElTX1BST0RVQ1RJT04gfSBmcm9tICcuL2Vudmlyb25tZW50LmpzJztcbmltcG9ydCB7IHdhcm4sIG1hcENvbnRleHQsIGlzRnVuY3Rpb24sIGtleXMsIHRvU0NYTUxFdmVudCwgdG9JbnZva2VTb3VyY2UsIGlzUHJvbWlzZUxpa2UsIGlzT2JzZXJ2YWJsZSwgaXNNYWNoaW5lLCByZXBvcnRVbmhhbmRsZWRFeGNlcHRpb25Pbkludm9jYXRpb24sIHN5bWJvbE9ic2VydmFibGUsIGlzQXJyYXksIHRvRXZlbnRPYmplY3QsIGlzU3RyaW5nLCBpc0FjdG9yLCB1bmlxdWVJZCwgdG9PYnNlcnZlciB9IGZyb20gJy4vdXRpbHMuanMnO1xuaW1wb3J0IHsgQWN0aW9uVHlwZXMsIFNwZWNpYWxUYXJnZXRzIH0gZnJvbSAnLi90eXBlcy5qcyc7XG5pbXBvcnQgeyBpc0luRmluYWxTdGF0ZSB9IGZyb20gJy4vc3RhdGVVdGlscy5qcyc7XG5pbXBvcnQgeyBlcnJvclBsYXRmb3JtLCBsb2csIHN0b3AsIHN0YXJ0LCBjYW5jZWwsIHNlbmQsIHVwZGF0ZSwgZXJyb3IgYXMgZXJyb3IkMSB9IGZyb20gJy4vYWN0aW9uVHlwZXMuanMnO1xuaW1wb3J0IHsgZG9uZUludm9rZSwgaW5pdEV2ZW50LCBnZXRBY3Rpb25GdW5jdGlvbiwgZXJyb3IgfSBmcm9tICcuL2FjdGlvbnMuanMnO1xuaW1wb3J0IHsgaXNTdGF0ZSwgU3RhdGUsIGJpbmRBY3Rpb25Ub1N0YXRlIH0gZnJvbSAnLi9TdGF0ZS5qcyc7XG5pbXBvcnQgeyBwcm92aWRlLCBjb25zdW1lIH0gZnJvbSAnLi9zZXJ2aWNlU2NvcGUuanMnO1xuaW1wb3J0IHsgaXNTcGF3bmVkQWN0b3IsIGNyZWF0ZURlZmVycmVkQWN0b3IgfSBmcm9tICcuL0FjdG9yLmpzJztcbmltcG9ydCB7IFNjaGVkdWxlciB9IGZyb20gJy4vc2NoZWR1bGVyLmpzJztcbmltcG9ydCB7IHJlZ2lzdHJ5IH0gZnJvbSAnLi9yZWdpc3RyeS5qcyc7XG5pbXBvcnQgeyByZWdpc3RlclNlcnZpY2UsIGdldEdsb2JhbCB9IGZyb20gJy4vZGV2VG9vbHMuanMnO1xudmFyIERFRkFVTFRfU1BBV05fT1BUSU9OUyA9IHtcbiAgc3luYzogZmFsc2UsXG4gIGF1dG9Gb3J3YXJkOiBmYWxzZVxufTtcbnZhciBJbnRlcnByZXRlclN0YXR1cztcblxuKGZ1bmN0aW9uIChJbnRlcnByZXRlclN0YXR1cykge1xuICBJbnRlcnByZXRlclN0YXR1c1tJbnRlcnByZXRlclN0YXR1c1tcIk5vdFN0YXJ0ZWRcIl0gPSAwXSA9IFwiTm90U3RhcnRlZFwiO1xuICBJbnRlcnByZXRlclN0YXR1c1tJbnRlcnByZXRlclN0YXR1c1tcIlJ1bm5pbmdcIl0gPSAxXSA9IFwiUnVubmluZ1wiO1xuICBJbnRlcnByZXRlclN0YXR1c1tJbnRlcnByZXRlclN0YXR1c1tcIlN0b3BwZWRcIl0gPSAyXSA9IFwiU3RvcHBlZFwiO1xufSkoSW50ZXJwcmV0ZXJTdGF0dXMgfHwgKEludGVycHJldGVyU3RhdHVzID0ge30pKTtcblxudmFyIEludGVycHJldGVyID1cbi8qI19fUFVSRV9fKi9cblxuLyoqIEBjbGFzcyAqL1xuZnVuY3Rpb24gKCkge1xuICAvKipcclxuICAgKiBDcmVhdGVzIGEgbmV3IEludGVycHJldGVyIGluc3RhbmNlIChpLmUuLCBzZXJ2aWNlKSBmb3IgdGhlIGdpdmVuIG1hY2hpbmUgd2l0aCB0aGUgcHJvdmlkZWQgb3B0aW9ucywgaWYgYW55LlxyXG4gICAqXHJcbiAgICogQHBhcmFtIG1hY2hpbmUgVGhlIG1hY2hpbmUgdG8gYmUgaW50ZXJwcmV0ZWRcclxuICAgKiBAcGFyYW0gb3B0aW9ucyBJbnRlcnByZXRlciBvcHRpb25zXHJcbiAgICovXG4gIGZ1bmN0aW9uIEludGVycHJldGVyKG1hY2hpbmUsIG9wdGlvbnMpIHtcbiAgICB2YXIgX3RoaXMgPSB0aGlzO1xuXG4gICAgaWYgKG9wdGlvbnMgPT09IHZvaWQgMCkge1xuICAgICAgb3B0aW9ucyA9IEludGVycHJldGVyLmRlZmF1bHRPcHRpb25zO1xuICAgIH1cblxuICAgIHRoaXMubWFjaGluZSA9IG1hY2hpbmU7XG4gICAgdGhpcy5zY2hlZHVsZXIgPSBuZXcgU2NoZWR1bGVyKCk7XG4gICAgdGhpcy5kZWxheWVkRXZlbnRzTWFwID0ge307XG4gICAgdGhpcy5saXN0ZW5lcnMgPSBuZXcgU2V0KCk7XG4gICAgdGhpcy5jb250ZXh0TGlzdGVuZXJzID0gbmV3IFNldCgpO1xuICAgIHRoaXMuc3RvcExpc3RlbmVycyA9IG5ldyBTZXQoKTtcbiAgICB0aGlzLmRvbmVMaXN0ZW5lcnMgPSBuZXcgU2V0KCk7XG4gICAgdGhpcy5ldmVudExpc3RlbmVycyA9IG5ldyBTZXQoKTtcbiAgICB0aGlzLnNlbmRMaXN0ZW5lcnMgPSBuZXcgU2V0KCk7XG4gICAgLyoqXHJcbiAgICAgKiBXaGV0aGVyIHRoZSBzZXJ2aWNlIGlzIHN0YXJ0ZWQuXHJcbiAgICAgKi9cblxuICAgIHRoaXMuaW5pdGlhbGl6ZWQgPSBmYWxzZTtcbiAgICB0aGlzLnN0YXR1cyA9IEludGVycHJldGVyU3RhdHVzLk5vdFN0YXJ0ZWQ7XG4gICAgdGhpcy5jaGlsZHJlbiA9IG5ldyBNYXAoKTtcbiAgICB0aGlzLmZvcndhcmRUbyA9IG5ldyBTZXQoKTtcbiAgICAvKipcclxuICAgICAqIEFsaWFzIGZvciBJbnRlcnByZXRlci5wcm90b3R5cGUuc3RhcnRcclxuICAgICAqL1xuXG4gICAgdGhpcy5pbml0ID0gdGhpcy5zdGFydDtcbiAgICAvKipcclxuICAgICAqIFNlbmRzIGFuIGV2ZW50IHRvIHRoZSBydW5uaW5nIGludGVycHJldGVyIHRvIHRyaWdnZXIgYSB0cmFuc2l0aW9uLlxyXG4gICAgICpcclxuICAgICAqIEFuIGFycmF5IG9mIGV2ZW50cyAoYmF0Y2hlZCkgY2FuIGJlIHNlbnQgYXMgd2VsbCwgd2hpY2ggd2lsbCBzZW5kIGFsbFxyXG4gICAgICogYmF0Y2hlZCBldmVudHMgdG8gdGhlIHJ1bm5pbmcgaW50ZXJwcmV0ZXIuIFRoZSBsaXN0ZW5lcnMgd2lsbCBiZVxyXG4gICAgICogbm90aWZpZWQgb25seSAqKm9uY2UqKiB3aGVuIGFsbCBldmVudHMgYXJlIHByb2Nlc3NlZC5cclxuICAgICAqXHJcbiAgICAgKiBAcGFyYW0gZXZlbnQgVGhlIGV2ZW50KHMpIHRvIHNlbmRcclxuICAgICAqL1xuXG4gICAgdGhpcy5zZW5kID0gZnVuY3Rpb24gKGV2ZW50LCBwYXlsb2FkKSB7XG4gICAgICBpZiAoaXNBcnJheShldmVudCkpIHtcbiAgICAgICAgX3RoaXMuYmF0Y2goZXZlbnQpO1xuXG4gICAgICAgIHJldHVybiBfdGhpcy5zdGF0ZTtcbiAgICAgIH1cblxuICAgICAgdmFyIF9ldmVudCA9IHRvU0NYTUxFdmVudCh0b0V2ZW50T2JqZWN0KGV2ZW50LCBwYXlsb2FkKSk7XG5cbiAgICAgIGlmIChfdGhpcy5zdGF0dXMgPT09IEludGVycHJldGVyU3RhdHVzLlN0b3BwZWQpIHtcbiAgICAgICAgLy8gZG8gbm90aGluZ1xuICAgICAgICBpZiAoIUlTX1BST0RVQ1RJT04pIHtcbiAgICAgICAgICB3YXJuKGZhbHNlLCBcIkV2ZW50IFxcXCJcIiArIF9ldmVudC5uYW1lICsgXCJcXFwiIHdhcyBzZW50IHRvIHN0b3BwZWQgc2VydmljZSBcXFwiXCIgKyBfdGhpcy5tYWNoaW5lLmlkICsgXCJcXFwiLiBUaGlzIHNlcnZpY2UgaGFzIGFscmVhZHkgcmVhY2hlZCBpdHMgZmluYWwgc3RhdGUsIGFuZCB3aWxsIG5vdCB0cmFuc2l0aW9uLlxcbkV2ZW50OiBcIiArIEpTT04uc3RyaW5naWZ5KF9ldmVudC5kYXRhKSk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gX3RoaXMuc3RhdGU7XG4gICAgICB9XG5cbiAgICAgIGlmIChfdGhpcy5zdGF0dXMgIT09IEludGVycHJldGVyU3RhdHVzLlJ1bm5pbmcgJiYgIV90aGlzLm9wdGlvbnMuZGVmZXJFdmVudHMpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiRXZlbnQgXFxcIlwiICsgX2V2ZW50Lm5hbWUgKyBcIlxcXCIgd2FzIHNlbnQgdG8gdW5pbml0aWFsaXplZCBzZXJ2aWNlIFxcXCJcIiArIF90aGlzLm1hY2hpbmUuaWQgKyBcIlxcXCIuIE1ha2Ugc3VyZSAuc3RhcnQoKSBpcyBjYWxsZWQgZm9yIHRoaXMgc2VydmljZSwgb3Igc2V0IHsgZGVmZXJFdmVudHM6IHRydWUgfSBpbiB0aGUgc2VydmljZSBvcHRpb25zLlxcbkV2ZW50OiBcIiArIEpTT04uc3RyaW5naWZ5KF9ldmVudC5kYXRhKSk7XG4gICAgICB9XG5cbiAgICAgIF90aGlzLnNjaGVkdWxlci5zY2hlZHVsZShmdW5jdGlvbiAoKSB7XG4gICAgICAgIC8vIEZvcndhcmQgY29weSBvZiBldmVudCB0byBjaGlsZCBhY3RvcnNcbiAgICAgICAgX3RoaXMuZm9yd2FyZChfZXZlbnQpO1xuXG4gICAgICAgIHZhciBuZXh0U3RhdGUgPSBfdGhpcy5uZXh0U3RhdGUoX2V2ZW50KTtcblxuICAgICAgICBfdGhpcy51cGRhdGUobmV4dFN0YXRlLCBfZXZlbnQpO1xuICAgICAgfSk7XG5cbiAgICAgIHJldHVybiBfdGhpcy5fc3RhdGU7IC8vIFRPRE86IGRlcHJlY2F0ZSAoc2hvdWxkIHJldHVybiB2b2lkKVxuICAgICAgLy8gdHNsaW50OmRpc2FibGUtbmV4dC1saW5lOnNlbWljb2xvblxuICAgIH07XG5cbiAgICB0aGlzLnNlbmRUbyA9IGZ1bmN0aW9uIChldmVudCwgdG8pIHtcbiAgICAgIHZhciBpc1BhcmVudCA9IF90aGlzLnBhcmVudCAmJiAodG8gPT09IFNwZWNpYWxUYXJnZXRzLlBhcmVudCB8fCBfdGhpcy5wYXJlbnQuaWQgPT09IHRvKTtcbiAgICAgIHZhciB0YXJnZXQgPSBpc1BhcmVudCA/IF90aGlzLnBhcmVudCA6IGlzU3RyaW5nKHRvKSA/IF90aGlzLmNoaWxkcmVuLmdldCh0bykgfHwgcmVnaXN0cnkuZ2V0KHRvKSA6IGlzQWN0b3IodG8pID8gdG8gOiB1bmRlZmluZWQ7XG5cbiAgICAgIGlmICghdGFyZ2V0KSB7XG4gICAgICAgIGlmICghaXNQYXJlbnQpIHtcbiAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJVbmFibGUgdG8gc2VuZCBldmVudCB0byBjaGlsZCAnXCIgKyB0byArIFwiJyBmcm9tIHNlcnZpY2UgJ1wiICsgX3RoaXMuaWQgKyBcIicuXCIpO1xuICAgICAgICB9IC8vIHRzbGludDpkaXNhYmxlLW5leHQtbGluZTpuby1jb25zb2xlXG5cblxuICAgICAgICBpZiAoIUlTX1BST0RVQ1RJT04pIHtcbiAgICAgICAgICB3YXJuKGZhbHNlLCBcIlNlcnZpY2UgJ1wiICsgX3RoaXMuaWQgKyBcIicgaGFzIG5vIHBhcmVudDogdW5hYmxlIHRvIHNlbmQgZXZlbnQgXCIgKyBldmVudC50eXBlKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgaWYgKCdtYWNoaW5lJyBpbiB0YXJnZXQpIHtcbiAgICAgICAgLy8gU2VuZCBTQ1hNTCBldmVudHMgdG8gbWFjaGluZXNcbiAgICAgICAgdGFyZ2V0LnNlbmQoX19hc3NpZ24oX19hc3NpZ24oe30sIGV2ZW50KSwge1xuICAgICAgICAgIG5hbWU6IGV2ZW50Lm5hbWUgPT09IGVycm9yJDEgPyBcIlwiICsgZXJyb3IoX3RoaXMuaWQpIDogZXZlbnQubmFtZSxcbiAgICAgICAgICBvcmlnaW46IF90aGlzLnNlc3Npb25JZFxuICAgICAgICB9KSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICAvLyBTZW5kIG5vcm1hbCBldmVudHMgdG8gb3RoZXIgdGFyZ2V0c1xuICAgICAgICB0YXJnZXQuc2VuZChldmVudC5kYXRhKTtcbiAgICAgIH1cbiAgICB9O1xuXG4gICAgdmFyIHJlc29sdmVkT3B0aW9ucyA9IF9fYXNzaWduKF9fYXNzaWduKHt9LCBJbnRlcnByZXRlci5kZWZhdWx0T3B0aW9ucyksIG9wdGlvbnMpO1xuXG4gICAgdmFyIGNsb2NrID0gcmVzb2x2ZWRPcHRpb25zLmNsb2NrLFxuICAgICAgICBsb2dnZXIgPSByZXNvbHZlZE9wdGlvbnMubG9nZ2VyLFxuICAgICAgICBwYXJlbnQgPSByZXNvbHZlZE9wdGlvbnMucGFyZW50LFxuICAgICAgICBpZCA9IHJlc29sdmVkT3B0aW9ucy5pZDtcbiAgICB2YXIgcmVzb2x2ZWRJZCA9IGlkICE9PSB1bmRlZmluZWQgPyBpZCA6IG1hY2hpbmUuaWQ7XG4gICAgdGhpcy5pZCA9IHJlc29sdmVkSWQ7XG4gICAgdGhpcy5sb2dnZXIgPSBsb2dnZXI7XG4gICAgdGhpcy5jbG9jayA9IGNsb2NrO1xuICAgIHRoaXMucGFyZW50ID0gcGFyZW50O1xuICAgIHRoaXMub3B0aW9ucyA9IHJlc29sdmVkT3B0aW9ucztcbiAgICB0aGlzLnNjaGVkdWxlciA9IG5ldyBTY2hlZHVsZXIoe1xuICAgICAgZGVmZXJFdmVudHM6IHRoaXMub3B0aW9ucy5kZWZlckV2ZW50c1xuICAgIH0pO1xuICAgIHRoaXMuc2Vzc2lvbklkID0gcmVnaXN0cnkuYm9va0lkKCk7XG4gIH1cblxuICBPYmplY3QuZGVmaW5lUHJvcGVydHkoSW50ZXJwcmV0ZXIucHJvdG90eXBlLCBcImluaXRpYWxTdGF0ZVwiLCB7XG4gICAgZ2V0OiBmdW5jdGlvbiAoKSB7XG4gICAgICB2YXIgX3RoaXMgPSB0aGlzO1xuXG4gICAgICBpZiAodGhpcy5faW5pdGlhbFN0YXRlKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9pbml0aWFsU3RhdGU7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBwcm92aWRlKHRoaXMsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgX3RoaXMuX2luaXRpYWxTdGF0ZSA9IF90aGlzLm1hY2hpbmUuaW5pdGlhbFN0YXRlO1xuICAgICAgICByZXR1cm4gX3RoaXMuX2luaXRpYWxTdGF0ZTtcbiAgICAgIH0pO1xuICAgIH0sXG4gICAgZW51bWVyYWJsZTogZmFsc2UsXG4gICAgY29uZmlndXJhYmxlOiB0cnVlXG4gIH0pO1xuICBPYmplY3QuZGVmaW5lUHJvcGVydHkoSW50ZXJwcmV0ZXIucHJvdG90eXBlLCBcInN0YXRlXCIsIHtcbiAgICBnZXQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgIGlmICghSVNfUFJPRFVDVElPTikge1xuICAgICAgICB3YXJuKHRoaXMuc3RhdHVzICE9PSBJbnRlcnByZXRlclN0YXR1cy5Ob3RTdGFydGVkLCBcIkF0dGVtcHRlZCB0byByZWFkIHN0YXRlIGZyb20gdW5pbml0aWFsaXplZCBzZXJ2aWNlICdcIiArIHRoaXMuaWQgKyBcIicuIE1ha2Ugc3VyZSB0aGUgc2VydmljZSBpcyBzdGFydGVkIGZpcnN0LlwiKTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHRoaXMuX3N0YXRlO1xuICAgIH0sXG4gICAgZW51bWVyYWJsZTogZmFsc2UsXG4gICAgY29uZmlndXJhYmxlOiB0cnVlXG4gIH0pO1xuICAvKipcclxuICAgKiBFeGVjdXRlcyB0aGUgYWN0aW9ucyBvZiB0aGUgZ2l2ZW4gc3RhdGUsIHdpdGggdGhhdCBzdGF0ZSdzIGBjb250ZXh0YCBhbmQgYGV2ZW50YC5cclxuICAgKlxyXG4gICAqIEBwYXJhbSBzdGF0ZSBUaGUgc3RhdGUgd2hvc2UgYWN0aW9ucyB3aWxsIGJlIGV4ZWN1dGVkXHJcbiAgICogQHBhcmFtIGFjdGlvbnNDb25maWcgVGhlIGFjdGlvbiBpbXBsZW1lbnRhdGlvbnMgdG8gdXNlXHJcbiAgICovXG5cbiAgSW50ZXJwcmV0ZXIucHJvdG90eXBlLmV4ZWN1dGUgPSBmdW5jdGlvbiAoc3RhdGUsIGFjdGlvbnNDb25maWcpIHtcbiAgICB2YXIgZV8xLCBfYTtcblxuICAgIHRyeSB7XG4gICAgICBmb3IgKHZhciBfYiA9IF9fdmFsdWVzKHN0YXRlLmFjdGlvbnMpLCBfYyA9IF9iLm5leHQoKTsgIV9jLmRvbmU7IF9jID0gX2IubmV4dCgpKSB7XG4gICAgICAgIHZhciBhY3Rpb24gPSBfYy52YWx1ZTtcbiAgICAgICAgdGhpcy5leGVjKGFjdGlvbiwgc3RhdGUsIGFjdGlvbnNDb25maWcpO1xuICAgICAgfVxuICAgIH0gY2F0Y2ggKGVfMV8xKSB7XG4gICAgICBlXzEgPSB7XG4gICAgICAgIGVycm9yOiBlXzFfMVxuICAgICAgfTtcbiAgICB9IGZpbmFsbHkge1xuICAgICAgdHJ5IHtcbiAgICAgICAgaWYgKF9jICYmICFfYy5kb25lICYmIChfYSA9IF9iLnJldHVybikpIF9hLmNhbGwoX2IpO1xuICAgICAgfSBmaW5hbGx5IHtcbiAgICAgICAgaWYgKGVfMSkgdGhyb3cgZV8xLmVycm9yO1xuICAgICAgfVxuICAgIH1cbiAgfTtcblxuICBJbnRlcnByZXRlci5wcm90b3R5cGUudXBkYXRlID0gZnVuY3Rpb24gKHN0YXRlLCBfZXZlbnQpIHtcbiAgICB2YXIgZV8yLCBfYSwgZV8zLCBfYiwgZV80LCBfYywgZV81LCBfZDtcblxuICAgIHZhciBfdGhpcyA9IHRoaXM7IC8vIEF0dGFjaCBzZXNzaW9uIElEIHRvIHN0YXRlXG5cblxuICAgIHN0YXRlLl9zZXNzaW9uaWQgPSB0aGlzLnNlc3Npb25JZDsgLy8gVXBkYXRlIHN0YXRlXG5cbiAgICB0aGlzLl9zdGF0ZSA9IHN0YXRlOyAvLyBFeGVjdXRlIGFjdGlvbnNcblxuICAgIGlmICh0aGlzLm9wdGlvbnMuZXhlY3V0ZSkge1xuICAgICAgdGhpcy5leGVjdXRlKHRoaXMuc3RhdGUpO1xuICAgIH0gLy8gVXBkYXRlIGNoaWxkcmVuXG5cblxuICAgIHRoaXMuY2hpbGRyZW4uZm9yRWFjaChmdW5jdGlvbiAoY2hpbGQpIHtcbiAgICAgIF90aGlzLnN0YXRlLmNoaWxkcmVuW2NoaWxkLmlkXSA9IGNoaWxkO1xuICAgIH0pOyAvLyBEZXYgdG9vbHNcblxuICAgIGlmICh0aGlzLmRldlRvb2xzKSB7XG4gICAgICB0aGlzLmRldlRvb2xzLnNlbmQoX2V2ZW50LmRhdGEsIHN0YXRlKTtcbiAgICB9IC8vIEV4ZWN1dGUgbGlzdGVuZXJzXG5cblxuICAgIGlmIChzdGF0ZS5ldmVudCkge1xuICAgICAgdHJ5IHtcbiAgICAgICAgZm9yICh2YXIgX2UgPSBfX3ZhbHVlcyh0aGlzLmV2ZW50TGlzdGVuZXJzKSwgX2YgPSBfZS5uZXh0KCk7ICFfZi5kb25lOyBfZiA9IF9lLm5leHQoKSkge1xuICAgICAgICAgIHZhciBsaXN0ZW5lciA9IF9mLnZhbHVlO1xuICAgICAgICAgIGxpc3RlbmVyKHN0YXRlLmV2ZW50KTtcbiAgICAgICAgfVxuICAgICAgfSBjYXRjaCAoZV8yXzEpIHtcbiAgICAgICAgZV8yID0ge1xuICAgICAgICAgIGVycm9yOiBlXzJfMVxuICAgICAgICB9O1xuICAgICAgfSBmaW5hbGx5IHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICBpZiAoX2YgJiYgIV9mLmRvbmUgJiYgKF9hID0gX2UucmV0dXJuKSkgX2EuY2FsbChfZSk7XG4gICAgICAgIH0gZmluYWxseSB7XG4gICAgICAgICAgaWYgKGVfMikgdGhyb3cgZV8yLmVycm9yO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgdHJ5IHtcbiAgICAgIGZvciAodmFyIF9nID0gX192YWx1ZXModGhpcy5saXN0ZW5lcnMpLCBfaCA9IF9nLm5leHQoKTsgIV9oLmRvbmU7IF9oID0gX2cubmV4dCgpKSB7XG4gICAgICAgIHZhciBsaXN0ZW5lciA9IF9oLnZhbHVlO1xuICAgICAgICBsaXN0ZW5lcihzdGF0ZSwgc3RhdGUuZXZlbnQpO1xuICAgICAgfVxuICAgIH0gY2F0Y2ggKGVfM18xKSB7XG4gICAgICBlXzMgPSB7XG4gICAgICAgIGVycm9yOiBlXzNfMVxuICAgICAgfTtcbiAgICB9IGZpbmFsbHkge1xuICAgICAgdHJ5IHtcbiAgICAgICAgaWYgKF9oICYmICFfaC5kb25lICYmIChfYiA9IF9nLnJldHVybikpIF9iLmNhbGwoX2cpO1xuICAgICAgfSBmaW5hbGx5IHtcbiAgICAgICAgaWYgKGVfMykgdGhyb3cgZV8zLmVycm9yO1xuICAgICAgfVxuICAgIH1cblxuICAgIHRyeSB7XG4gICAgICBmb3IgKHZhciBfaiA9IF9fdmFsdWVzKHRoaXMuY29udGV4dExpc3RlbmVycyksIF9rID0gX2oubmV4dCgpOyAhX2suZG9uZTsgX2sgPSBfai5uZXh0KCkpIHtcbiAgICAgICAgdmFyIGNvbnRleHRMaXN0ZW5lciA9IF9rLnZhbHVlO1xuICAgICAgICBjb250ZXh0TGlzdGVuZXIodGhpcy5zdGF0ZS5jb250ZXh0LCB0aGlzLnN0YXRlLmhpc3RvcnkgPyB0aGlzLnN0YXRlLmhpc3RvcnkuY29udGV4dCA6IHVuZGVmaW5lZCk7XG4gICAgICB9XG4gICAgfSBjYXRjaCAoZV80XzEpIHtcbiAgICAgIGVfNCA9IHtcbiAgICAgICAgZXJyb3I6IGVfNF8xXG4gICAgICB9O1xuICAgIH0gZmluYWxseSB7XG4gICAgICB0cnkge1xuICAgICAgICBpZiAoX2sgJiYgIV9rLmRvbmUgJiYgKF9jID0gX2oucmV0dXJuKSkgX2MuY2FsbChfaik7XG4gICAgICB9IGZpbmFsbHkge1xuICAgICAgICBpZiAoZV80KSB0aHJvdyBlXzQuZXJyb3I7XG4gICAgICB9XG4gICAgfVxuXG4gICAgdmFyIGlzRG9uZSA9IGlzSW5GaW5hbFN0YXRlKHN0YXRlLmNvbmZpZ3VyYXRpb24gfHwgW10sIHRoaXMubWFjaGluZSk7XG5cbiAgICBpZiAodGhpcy5zdGF0ZS5jb25maWd1cmF0aW9uICYmIGlzRG9uZSkge1xuICAgICAgLy8gZ2V0IGZpbmFsIGNoaWxkIHN0YXRlIG5vZGVcbiAgICAgIHZhciBmaW5hbENoaWxkU3RhdGVOb2RlID0gc3RhdGUuY29uZmlndXJhdGlvbi5maW5kKGZ1bmN0aW9uIChzbikge1xuICAgICAgICByZXR1cm4gc24udHlwZSA9PT0gJ2ZpbmFsJyAmJiBzbi5wYXJlbnQgPT09IF90aGlzLm1hY2hpbmU7XG4gICAgICB9KTtcbiAgICAgIHZhciBkb25lRGF0YSA9IGZpbmFsQ2hpbGRTdGF0ZU5vZGUgJiYgZmluYWxDaGlsZFN0YXRlTm9kZS5kb25lRGF0YSA/IG1hcENvbnRleHQoZmluYWxDaGlsZFN0YXRlTm9kZS5kb25lRGF0YSwgc3RhdGUuY29udGV4dCwgX2V2ZW50KSA6IHVuZGVmaW5lZDtcblxuICAgICAgdHJ5IHtcbiAgICAgICAgZm9yICh2YXIgX2wgPSBfX3ZhbHVlcyh0aGlzLmRvbmVMaXN0ZW5lcnMpLCBfbSA9IF9sLm5leHQoKTsgIV9tLmRvbmU7IF9tID0gX2wubmV4dCgpKSB7XG4gICAgICAgICAgdmFyIGxpc3RlbmVyID0gX20udmFsdWU7XG4gICAgICAgICAgbGlzdGVuZXIoZG9uZUludm9rZSh0aGlzLmlkLCBkb25lRGF0YSkpO1xuICAgICAgICB9XG4gICAgICB9IGNhdGNoIChlXzVfMSkge1xuICAgICAgICBlXzUgPSB7XG4gICAgICAgICAgZXJyb3I6IGVfNV8xXG4gICAgICAgIH07XG4gICAgICB9IGZpbmFsbHkge1xuICAgICAgICB0cnkge1xuICAgICAgICAgIGlmIChfbSAmJiAhX20uZG9uZSAmJiAoX2QgPSBfbC5yZXR1cm4pKSBfZC5jYWxsKF9sKTtcbiAgICAgICAgfSBmaW5hbGx5IHtcbiAgICAgICAgICBpZiAoZV81KSB0aHJvdyBlXzUuZXJyb3I7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgdGhpcy5zdG9wKCk7XG4gICAgfVxuICB9O1xuICAvKlxyXG4gICAqIEFkZHMgYSBsaXN0ZW5lciB0aGF0IGlzIG5vdGlmaWVkIHdoZW5ldmVyIGEgc3RhdGUgdHJhbnNpdGlvbiBoYXBwZW5zLiBUaGUgbGlzdGVuZXIgaXMgY2FsbGVkIHdpdGhcclxuICAgKiB0aGUgbmV4dCBzdGF0ZSBhbmQgdGhlIGV2ZW50IG9iamVjdCB0aGF0IGNhdXNlZCB0aGUgc3RhdGUgdHJhbnNpdGlvbi5cclxuICAgKlxyXG4gICAqIEBwYXJhbSBsaXN0ZW5lciBUaGUgc3RhdGUgbGlzdGVuZXJcclxuICAgKi9cblxuXG4gIEludGVycHJldGVyLnByb3RvdHlwZS5vblRyYW5zaXRpb24gPSBmdW5jdGlvbiAobGlzdGVuZXIpIHtcbiAgICB0aGlzLmxpc3RlbmVycy5hZGQobGlzdGVuZXIpOyAvLyBTZW5kIGN1cnJlbnQgc3RhdGUgdG8gbGlzdGVuZXJcblxuICAgIGlmICh0aGlzLnN0YXR1cyA9PT0gSW50ZXJwcmV0ZXJTdGF0dXMuUnVubmluZykge1xuICAgICAgbGlzdGVuZXIodGhpcy5zdGF0ZSwgdGhpcy5zdGF0ZS5ldmVudCk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXM7XG4gIH07XG5cbiAgSW50ZXJwcmV0ZXIucHJvdG90eXBlLnN1YnNjcmliZSA9IGZ1bmN0aW9uIChuZXh0TGlzdGVuZXJPck9ic2VydmVyLCBfLCAvLyBUT0RPOiBlcnJvciBsaXN0ZW5lclxuICBjb21wbGV0ZUxpc3RlbmVyKSB7XG4gICAgdmFyIF90aGlzID0gdGhpcztcblxuICAgIGlmICghbmV4dExpc3RlbmVyT3JPYnNlcnZlcikge1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgdW5zdWJzY3JpYmU6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICByZXR1cm4gdm9pZCAwO1xuICAgICAgICB9XG4gICAgICB9O1xuICAgIH1cblxuICAgIHZhciBsaXN0ZW5lcjtcbiAgICB2YXIgcmVzb2x2ZWRDb21wbGV0ZUxpc3RlbmVyID0gY29tcGxldGVMaXN0ZW5lcjtcblxuICAgIGlmICh0eXBlb2YgbmV4dExpc3RlbmVyT3JPYnNlcnZlciA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgbGlzdGVuZXIgPSBuZXh0TGlzdGVuZXJPck9ic2VydmVyO1xuICAgIH0gZWxzZSB7XG4gICAgICBsaXN0ZW5lciA9IG5leHRMaXN0ZW5lck9yT2JzZXJ2ZXIubmV4dC5iaW5kKG5leHRMaXN0ZW5lck9yT2JzZXJ2ZXIpO1xuICAgICAgcmVzb2x2ZWRDb21wbGV0ZUxpc3RlbmVyID0gbmV4dExpc3RlbmVyT3JPYnNlcnZlci5jb21wbGV0ZS5iaW5kKG5leHRMaXN0ZW5lck9yT2JzZXJ2ZXIpO1xuICAgIH1cblxuICAgIHRoaXMubGlzdGVuZXJzLmFkZChsaXN0ZW5lcik7IC8vIFNlbmQgY3VycmVudCBzdGF0ZSB0byBsaXN0ZW5lclxuXG4gICAgaWYgKHRoaXMuc3RhdHVzID09PSBJbnRlcnByZXRlclN0YXR1cy5SdW5uaW5nKSB7XG4gICAgICBsaXN0ZW5lcih0aGlzLnN0YXRlKTtcbiAgICB9XG5cbiAgICBpZiAocmVzb2x2ZWRDb21wbGV0ZUxpc3RlbmVyKSB7XG4gICAgICB0aGlzLm9uRG9uZShyZXNvbHZlZENvbXBsZXRlTGlzdGVuZXIpO1xuICAgIH1cblxuICAgIHJldHVybiB7XG4gICAgICB1bnN1YnNjcmliZTogZnVuY3Rpb24gKCkge1xuICAgICAgICBsaXN0ZW5lciAmJiBfdGhpcy5saXN0ZW5lcnMuZGVsZXRlKGxpc3RlbmVyKTtcbiAgICAgICAgcmVzb2x2ZWRDb21wbGV0ZUxpc3RlbmVyICYmIF90aGlzLmRvbmVMaXN0ZW5lcnMuZGVsZXRlKHJlc29sdmVkQ29tcGxldGVMaXN0ZW5lcik7XG4gICAgICB9XG4gICAgfTtcbiAgfTtcbiAgLyoqXHJcbiAgICogQWRkcyBhbiBldmVudCBsaXN0ZW5lciB0aGF0IGlzIG5vdGlmaWVkIHdoZW5ldmVyIGFuIGV2ZW50IGlzIHNlbnQgdG8gdGhlIHJ1bm5pbmcgaW50ZXJwcmV0ZXIuXHJcbiAgICogQHBhcmFtIGxpc3RlbmVyIFRoZSBldmVudCBsaXN0ZW5lclxyXG4gICAqL1xuXG5cbiAgSW50ZXJwcmV0ZXIucHJvdG90eXBlLm9uRXZlbnQgPSBmdW5jdGlvbiAobGlzdGVuZXIpIHtcbiAgICB0aGlzLmV2ZW50TGlzdGVuZXJzLmFkZChsaXN0ZW5lcik7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH07XG4gIC8qKlxyXG4gICAqIEFkZHMgYW4gZXZlbnQgbGlzdGVuZXIgdGhhdCBpcyBub3RpZmllZCB3aGVuZXZlciBhIGBzZW5kYCBldmVudCBvY2N1cnMuXHJcbiAgICogQHBhcmFtIGxpc3RlbmVyIFRoZSBldmVudCBsaXN0ZW5lclxyXG4gICAqL1xuXG5cbiAgSW50ZXJwcmV0ZXIucHJvdG90eXBlLm9uU2VuZCA9IGZ1bmN0aW9uIChsaXN0ZW5lcikge1xuICAgIHRoaXMuc2VuZExpc3RlbmVycy5hZGQobGlzdGVuZXIpO1xuICAgIHJldHVybiB0aGlzO1xuICB9O1xuICAvKipcclxuICAgKiBBZGRzIGEgY29udGV4dCBsaXN0ZW5lciB0aGF0IGlzIG5vdGlmaWVkIHdoZW5ldmVyIHRoZSBzdGF0ZSBjb250ZXh0IGNoYW5nZXMuXHJcbiAgICogQHBhcmFtIGxpc3RlbmVyIFRoZSBjb250ZXh0IGxpc3RlbmVyXHJcbiAgICovXG5cblxuICBJbnRlcnByZXRlci5wcm90b3R5cGUub25DaGFuZ2UgPSBmdW5jdGlvbiAobGlzdGVuZXIpIHtcbiAgICB0aGlzLmNvbnRleHRMaXN0ZW5lcnMuYWRkKGxpc3RlbmVyKTtcbiAgICByZXR1cm4gdGhpcztcbiAgfTtcbiAgLyoqXHJcbiAgICogQWRkcyBhIGxpc3RlbmVyIHRoYXQgaXMgbm90aWZpZWQgd2hlbiB0aGUgbWFjaGluZSBpcyBzdG9wcGVkLlxyXG4gICAqIEBwYXJhbSBsaXN0ZW5lciBUaGUgbGlzdGVuZXJcclxuICAgKi9cblxuXG4gIEludGVycHJldGVyLnByb3RvdHlwZS5vblN0b3AgPSBmdW5jdGlvbiAobGlzdGVuZXIpIHtcbiAgICB0aGlzLnN0b3BMaXN0ZW5lcnMuYWRkKGxpc3RlbmVyKTtcbiAgICByZXR1cm4gdGhpcztcbiAgfTtcbiAgLyoqXHJcbiAgICogQWRkcyBhIHN0YXRlIGxpc3RlbmVyIHRoYXQgaXMgbm90aWZpZWQgd2hlbiB0aGUgc3RhdGVjaGFydCBoYXMgcmVhY2hlZCBpdHMgZmluYWwgc3RhdGUuXHJcbiAgICogQHBhcmFtIGxpc3RlbmVyIFRoZSBzdGF0ZSBsaXN0ZW5lclxyXG4gICAqL1xuXG5cbiAgSW50ZXJwcmV0ZXIucHJvdG90eXBlLm9uRG9uZSA9IGZ1bmN0aW9uIChsaXN0ZW5lcikge1xuICAgIHRoaXMuZG9uZUxpc3RlbmVycy5hZGQobGlzdGVuZXIpO1xuICAgIHJldHVybiB0aGlzO1xuICB9O1xuICAvKipcclxuICAgKiBSZW1vdmVzIGEgbGlzdGVuZXIuXHJcbiAgICogQHBhcmFtIGxpc3RlbmVyIFRoZSBsaXN0ZW5lciB0byByZW1vdmVcclxuICAgKi9cblxuXG4gIEludGVycHJldGVyLnByb3RvdHlwZS5vZmYgPSBmdW5jdGlvbiAobGlzdGVuZXIpIHtcbiAgICB0aGlzLmxpc3RlbmVycy5kZWxldGUobGlzdGVuZXIpO1xuICAgIHRoaXMuZXZlbnRMaXN0ZW5lcnMuZGVsZXRlKGxpc3RlbmVyKTtcbiAgICB0aGlzLnNlbmRMaXN0ZW5lcnMuZGVsZXRlKGxpc3RlbmVyKTtcbiAgICB0aGlzLnN0b3BMaXN0ZW5lcnMuZGVsZXRlKGxpc3RlbmVyKTtcbiAgICB0aGlzLmRvbmVMaXN0ZW5lcnMuZGVsZXRlKGxpc3RlbmVyKTtcbiAgICB0aGlzLmNvbnRleHRMaXN0ZW5lcnMuZGVsZXRlKGxpc3RlbmVyKTtcbiAgICByZXR1cm4gdGhpcztcbiAgfTtcbiAgLyoqXHJcbiAgICogU3RhcnRzIHRoZSBpbnRlcnByZXRlciBmcm9tIHRoZSBnaXZlbiBzdGF0ZSwgb3IgdGhlIGluaXRpYWwgc3RhdGUuXHJcbiAgICogQHBhcmFtIGluaXRpYWxTdGF0ZSBUaGUgc3RhdGUgdG8gc3RhcnQgdGhlIHN0YXRlY2hhcnQgZnJvbVxyXG4gICAqL1xuXG5cbiAgSW50ZXJwcmV0ZXIucHJvdG90eXBlLnN0YXJ0ID0gZnVuY3Rpb24gKGluaXRpYWxTdGF0ZSkge1xuICAgIHZhciBfdGhpcyA9IHRoaXM7XG5cbiAgICBpZiAodGhpcy5zdGF0dXMgPT09IEludGVycHJldGVyU3RhdHVzLlJ1bm5pbmcpIHtcbiAgICAgIC8vIERvIG5vdCByZXN0YXJ0IHRoZSBzZXJ2aWNlIGlmIGl0IGlzIGFscmVhZHkgc3RhcnRlZFxuICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgcmVnaXN0cnkucmVnaXN0ZXIodGhpcy5zZXNzaW9uSWQsIHRoaXMpO1xuICAgIHRoaXMuaW5pdGlhbGl6ZWQgPSB0cnVlO1xuICAgIHRoaXMuc3RhdHVzID0gSW50ZXJwcmV0ZXJTdGF0dXMuUnVubmluZztcbiAgICB2YXIgcmVzb2x2ZWRTdGF0ZSA9IGluaXRpYWxTdGF0ZSA9PT0gdW5kZWZpbmVkID8gdGhpcy5pbml0aWFsU3RhdGUgOiBwcm92aWRlKHRoaXMsIGZ1bmN0aW9uICgpIHtcbiAgICAgIHJldHVybiBpc1N0YXRlKGluaXRpYWxTdGF0ZSkgPyBfdGhpcy5tYWNoaW5lLnJlc29sdmVTdGF0ZShpbml0aWFsU3RhdGUpIDogX3RoaXMubWFjaGluZS5yZXNvbHZlU3RhdGUoU3RhdGUuZnJvbShpbml0aWFsU3RhdGUsIF90aGlzLm1hY2hpbmUuY29udGV4dCkpO1xuICAgIH0pO1xuXG4gICAgaWYgKHRoaXMub3B0aW9ucy5kZXZUb29scykge1xuICAgICAgdGhpcy5hdHRhY2hEZXYoKTtcbiAgICB9XG5cbiAgICB0aGlzLnNjaGVkdWxlci5pbml0aWFsaXplKGZ1bmN0aW9uICgpIHtcbiAgICAgIF90aGlzLnVwZGF0ZShyZXNvbHZlZFN0YXRlLCBpbml0RXZlbnQpO1xuICAgIH0pO1xuICAgIHJldHVybiB0aGlzO1xuICB9O1xuICAvKipcclxuICAgKiBTdG9wcyB0aGUgaW50ZXJwcmV0ZXIgYW5kIHVuc3Vic2NyaWJlIGFsbCBsaXN0ZW5lcnMuXHJcbiAgICpcclxuICAgKiBUaGlzIHdpbGwgYWxzbyBub3RpZnkgdGhlIGBvblN0b3BgIGxpc3RlbmVycy5cclxuICAgKi9cblxuXG4gIEludGVycHJldGVyLnByb3RvdHlwZS5zdG9wID0gZnVuY3Rpb24gKCkge1xuICAgIHZhciBlXzYsIF9hLCBlXzcsIF9iLCBlXzgsIF9jLCBlXzksIF9kLCBlXzEwLCBfZTtcblxuICAgIHZhciBfdGhpcyA9IHRoaXM7XG5cbiAgICB0cnkge1xuICAgICAgZm9yICh2YXIgX2YgPSBfX3ZhbHVlcyh0aGlzLmxpc3RlbmVycyksIF9nID0gX2YubmV4dCgpOyAhX2cuZG9uZTsgX2cgPSBfZi5uZXh0KCkpIHtcbiAgICAgICAgdmFyIGxpc3RlbmVyID0gX2cudmFsdWU7XG4gICAgICAgIHRoaXMubGlzdGVuZXJzLmRlbGV0ZShsaXN0ZW5lcik7XG4gICAgICB9XG4gICAgfSBjYXRjaCAoZV82XzEpIHtcbiAgICAgIGVfNiA9IHtcbiAgICAgICAgZXJyb3I6IGVfNl8xXG4gICAgICB9O1xuICAgIH0gZmluYWxseSB7XG4gICAgICB0cnkge1xuICAgICAgICBpZiAoX2cgJiYgIV9nLmRvbmUgJiYgKF9hID0gX2YucmV0dXJuKSkgX2EuY2FsbChfZik7XG4gICAgICB9IGZpbmFsbHkge1xuICAgICAgICBpZiAoZV82KSB0aHJvdyBlXzYuZXJyb3I7XG4gICAgICB9XG4gICAgfVxuXG4gICAgdHJ5IHtcbiAgICAgIGZvciAodmFyIF9oID0gX192YWx1ZXModGhpcy5zdG9wTGlzdGVuZXJzKSwgX2ogPSBfaC5uZXh0KCk7ICFfai5kb25lOyBfaiA9IF9oLm5leHQoKSkge1xuICAgICAgICB2YXIgbGlzdGVuZXIgPSBfai52YWx1ZTsgLy8gY2FsbCBsaXN0ZW5lciwgdGhlbiByZW1vdmVcblxuICAgICAgICBsaXN0ZW5lcigpO1xuICAgICAgICB0aGlzLnN0b3BMaXN0ZW5lcnMuZGVsZXRlKGxpc3RlbmVyKTtcbiAgICAgIH1cbiAgICB9IGNhdGNoIChlXzdfMSkge1xuICAgICAgZV83ID0ge1xuICAgICAgICBlcnJvcjogZV83XzFcbiAgICAgIH07XG4gICAgfSBmaW5hbGx5IHtcbiAgICAgIHRyeSB7XG4gICAgICAgIGlmIChfaiAmJiAhX2ouZG9uZSAmJiAoX2IgPSBfaC5yZXR1cm4pKSBfYi5jYWxsKF9oKTtcbiAgICAgIH0gZmluYWxseSB7XG4gICAgICAgIGlmIChlXzcpIHRocm93IGVfNy5lcnJvcjtcbiAgICAgIH1cbiAgICB9XG5cbiAgICB0cnkge1xuICAgICAgZm9yICh2YXIgX2sgPSBfX3ZhbHVlcyh0aGlzLmNvbnRleHRMaXN0ZW5lcnMpLCBfbCA9IF9rLm5leHQoKTsgIV9sLmRvbmU7IF9sID0gX2submV4dCgpKSB7XG4gICAgICAgIHZhciBsaXN0ZW5lciA9IF9sLnZhbHVlO1xuICAgICAgICB0aGlzLmNvbnRleHRMaXN0ZW5lcnMuZGVsZXRlKGxpc3RlbmVyKTtcbiAgICAgIH1cbiAgICB9IGNhdGNoIChlXzhfMSkge1xuICAgICAgZV84ID0ge1xuICAgICAgICBlcnJvcjogZV84XzFcbiAgICAgIH07XG4gICAgfSBmaW5hbGx5IHtcbiAgICAgIHRyeSB7XG4gICAgICAgIGlmIChfbCAmJiAhX2wuZG9uZSAmJiAoX2MgPSBfay5yZXR1cm4pKSBfYy5jYWxsKF9rKTtcbiAgICAgIH0gZmluYWxseSB7XG4gICAgICAgIGlmIChlXzgpIHRocm93IGVfOC5lcnJvcjtcbiAgICAgIH1cbiAgICB9XG5cbiAgICB0cnkge1xuICAgICAgZm9yICh2YXIgX20gPSBfX3ZhbHVlcyh0aGlzLmRvbmVMaXN0ZW5lcnMpLCBfbyA9IF9tLm5leHQoKTsgIV9vLmRvbmU7IF9vID0gX20ubmV4dCgpKSB7XG4gICAgICAgIHZhciBsaXN0ZW5lciA9IF9vLnZhbHVlO1xuICAgICAgICB0aGlzLmRvbmVMaXN0ZW5lcnMuZGVsZXRlKGxpc3RlbmVyKTtcbiAgICAgIH1cbiAgICB9IGNhdGNoIChlXzlfMSkge1xuICAgICAgZV85ID0ge1xuICAgICAgICBlcnJvcjogZV85XzFcbiAgICAgIH07XG4gICAgfSBmaW5hbGx5IHtcbiAgICAgIHRyeSB7XG4gICAgICAgIGlmIChfbyAmJiAhX28uZG9uZSAmJiAoX2QgPSBfbS5yZXR1cm4pKSBfZC5jYWxsKF9tKTtcbiAgICAgIH0gZmluYWxseSB7XG4gICAgICAgIGlmIChlXzkpIHRocm93IGVfOS5lcnJvcjtcbiAgICAgIH1cbiAgICB9XG5cbiAgICB0aGlzLnN0YXRlLmNvbmZpZ3VyYXRpb24uZm9yRWFjaChmdW5jdGlvbiAoc3RhdGVOb2RlKSB7XG4gICAgICB2YXIgZV8xMSwgX2E7XG5cbiAgICAgIHRyeSB7XG4gICAgICAgIGZvciAodmFyIF9iID0gX192YWx1ZXMoc3RhdGVOb2RlLmRlZmluaXRpb24uZXhpdCksIF9jID0gX2IubmV4dCgpOyAhX2MuZG9uZTsgX2MgPSBfYi5uZXh0KCkpIHtcbiAgICAgICAgICB2YXIgYWN0aW9uID0gX2MudmFsdWU7XG5cbiAgICAgICAgICBfdGhpcy5leGVjKGFjdGlvbiwgX3RoaXMuc3RhdGUpO1xuICAgICAgICB9XG4gICAgICB9IGNhdGNoIChlXzExXzEpIHtcbiAgICAgICAgZV8xMSA9IHtcbiAgICAgICAgICBlcnJvcjogZV8xMV8xXG4gICAgICAgIH07XG4gICAgICB9IGZpbmFsbHkge1xuICAgICAgICB0cnkge1xuICAgICAgICAgIGlmIChfYyAmJiAhX2MuZG9uZSAmJiAoX2EgPSBfYi5yZXR1cm4pKSBfYS5jYWxsKF9iKTtcbiAgICAgICAgfSBmaW5hbGx5IHtcbiAgICAgICAgICBpZiAoZV8xMSkgdGhyb3cgZV8xMS5lcnJvcjtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0pOyAvLyBTdG9wIGFsbCBjaGlsZHJlblxuXG4gICAgdGhpcy5jaGlsZHJlbi5mb3JFYWNoKGZ1bmN0aW9uIChjaGlsZCkge1xuICAgICAgaWYgKGlzRnVuY3Rpb24oY2hpbGQuc3RvcCkpIHtcbiAgICAgICAgY2hpbGQuc3RvcCgpO1xuICAgICAgfVxuICAgIH0pO1xuXG4gICAgdHJ5IHtcbiAgICAgIC8vIENhbmNlbCBhbGwgZGVsYXllZCBldmVudHNcbiAgICAgIGZvciAodmFyIF9wID0gX192YWx1ZXMoa2V5cyh0aGlzLmRlbGF5ZWRFdmVudHNNYXApKSwgX3EgPSBfcC5uZXh0KCk7ICFfcS5kb25lOyBfcSA9IF9wLm5leHQoKSkge1xuICAgICAgICB2YXIga2V5ID0gX3EudmFsdWU7XG4gICAgICAgIHRoaXMuY2xvY2suY2xlYXJUaW1lb3V0KHRoaXMuZGVsYXllZEV2ZW50c01hcFtrZXldKTtcbiAgICAgIH1cbiAgICB9IGNhdGNoIChlXzEwXzEpIHtcbiAgICAgIGVfMTAgPSB7XG4gICAgICAgIGVycm9yOiBlXzEwXzFcbiAgICAgIH07XG4gICAgfSBmaW5hbGx5IHtcbiAgICAgIHRyeSB7XG4gICAgICAgIGlmIChfcSAmJiAhX3EuZG9uZSAmJiAoX2UgPSBfcC5yZXR1cm4pKSBfZS5jYWxsKF9wKTtcbiAgICAgIH0gZmluYWxseSB7XG4gICAgICAgIGlmIChlXzEwKSB0aHJvdyBlXzEwLmVycm9yO1xuICAgICAgfVxuICAgIH1cblxuICAgIHRoaXMuc2NoZWR1bGVyLmNsZWFyKCk7XG4gICAgdGhpcy5pbml0aWFsaXplZCA9IGZhbHNlO1xuICAgIHRoaXMuc3RhdHVzID0gSW50ZXJwcmV0ZXJTdGF0dXMuU3RvcHBlZDtcbiAgICByZWdpc3RyeS5mcmVlKHRoaXMuc2Vzc2lvbklkKTtcbiAgICByZXR1cm4gdGhpcztcbiAgfTtcblxuICBJbnRlcnByZXRlci5wcm90b3R5cGUuYmF0Y2ggPSBmdW5jdGlvbiAoZXZlbnRzKSB7XG4gICAgdmFyIF90aGlzID0gdGhpcztcblxuICAgIGlmICh0aGlzLnN0YXR1cyA9PT0gSW50ZXJwcmV0ZXJTdGF0dXMuTm90U3RhcnRlZCAmJiB0aGlzLm9wdGlvbnMuZGVmZXJFdmVudHMpIHtcbiAgICAgIC8vIHRzbGludDpkaXNhYmxlLW5leHQtbGluZTpuby1jb25zb2xlXG4gICAgICBpZiAoIUlTX1BST0RVQ1RJT04pIHtcbiAgICAgICAgd2FybihmYWxzZSwgZXZlbnRzLmxlbmd0aCArIFwiIGV2ZW50KHMpIHdlcmUgc2VudCB0byB1bmluaXRpYWxpemVkIHNlcnZpY2UgXFxcIlwiICsgdGhpcy5tYWNoaW5lLmlkICsgXCJcXFwiIGFuZCBhcmUgZGVmZXJyZWQuIE1ha2Ugc3VyZSAuc3RhcnQoKSBpcyBjYWxsZWQgZm9yIHRoaXMgc2VydmljZS5cXG5FdmVudDogXCIgKyBKU09OLnN0cmluZ2lmeShldmVudCkpO1xuICAgICAgfVxuICAgIH0gZWxzZSBpZiAodGhpcy5zdGF0dXMgIT09IEludGVycHJldGVyU3RhdHVzLlJ1bm5pbmcpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvciggLy8gdHNsaW50OmRpc2FibGUtbmV4dC1saW5lOm1heC1saW5lLWxlbmd0aFxuICAgICAgZXZlbnRzLmxlbmd0aCArIFwiIGV2ZW50KHMpIHdlcmUgc2VudCB0byB1bmluaXRpYWxpemVkIHNlcnZpY2UgXFxcIlwiICsgdGhpcy5tYWNoaW5lLmlkICsgXCJcXFwiLiBNYWtlIHN1cmUgLnN0YXJ0KCkgaXMgY2FsbGVkIGZvciB0aGlzIHNlcnZpY2UsIG9yIHNldCB7IGRlZmVyRXZlbnRzOiB0cnVlIH0gaW4gdGhlIHNlcnZpY2Ugb3B0aW9ucy5cIik7XG4gICAgfVxuXG4gICAgdGhpcy5zY2hlZHVsZXIuc2NoZWR1bGUoZnVuY3Rpb24gKCkge1xuICAgICAgdmFyIGVfMTIsIF9hO1xuXG4gICAgICB2YXIgbmV4dFN0YXRlID0gX3RoaXMuc3RhdGU7XG4gICAgICB2YXIgYmF0Y2hDaGFuZ2VkID0gZmFsc2U7XG4gICAgICB2YXIgYmF0Y2hlZEFjdGlvbnMgPSBbXTtcblxuICAgICAgdmFyIF9sb29wXzEgPSBmdW5jdGlvbiAoZXZlbnRfMSkge1xuICAgICAgICB2YXIgX2V2ZW50ID0gdG9TQ1hNTEV2ZW50KGV2ZW50XzEpO1xuXG4gICAgICAgIF90aGlzLmZvcndhcmQoX2V2ZW50KTtcblxuICAgICAgICBuZXh0U3RhdGUgPSBwcm92aWRlKF90aGlzLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgcmV0dXJuIF90aGlzLm1hY2hpbmUudHJhbnNpdGlvbihuZXh0U3RhdGUsIF9ldmVudCk7XG4gICAgICAgIH0pO1xuICAgICAgICBiYXRjaGVkQWN0aW9ucy5wdXNoLmFwcGx5KGJhdGNoZWRBY3Rpb25zLCBfX3NwcmVhZChuZXh0U3RhdGUuYWN0aW9ucy5tYXAoZnVuY3Rpb24gKGEpIHtcbiAgICAgICAgICByZXR1cm4gYmluZEFjdGlvblRvU3RhdGUoYSwgbmV4dFN0YXRlKTtcbiAgICAgICAgfSkpKTtcbiAgICAgICAgYmF0Y2hDaGFuZ2VkID0gYmF0Y2hDaGFuZ2VkIHx8ICEhbmV4dFN0YXRlLmNoYW5nZWQ7XG4gICAgICB9O1xuXG4gICAgICB0cnkge1xuICAgICAgICBmb3IgKHZhciBldmVudHNfMSA9IF9fdmFsdWVzKGV2ZW50cyksIGV2ZW50c18xXzEgPSBldmVudHNfMS5uZXh0KCk7ICFldmVudHNfMV8xLmRvbmU7IGV2ZW50c18xXzEgPSBldmVudHNfMS5uZXh0KCkpIHtcbiAgICAgICAgICB2YXIgZXZlbnRfMSA9IGV2ZW50c18xXzEudmFsdWU7XG5cbiAgICAgICAgICBfbG9vcF8xKGV2ZW50XzEpO1xuICAgICAgICB9XG4gICAgICB9IGNhdGNoIChlXzEyXzEpIHtcbiAgICAgICAgZV8xMiA9IHtcbiAgICAgICAgICBlcnJvcjogZV8xMl8xXG4gICAgICAgIH07XG4gICAgICB9IGZpbmFsbHkge1xuICAgICAgICB0cnkge1xuICAgICAgICAgIGlmIChldmVudHNfMV8xICYmICFldmVudHNfMV8xLmRvbmUgJiYgKF9hID0gZXZlbnRzXzEucmV0dXJuKSkgX2EuY2FsbChldmVudHNfMSk7XG4gICAgICAgIH0gZmluYWxseSB7XG4gICAgICAgICAgaWYgKGVfMTIpIHRocm93IGVfMTIuZXJyb3I7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgbmV4dFN0YXRlLmNoYW5nZWQgPSBiYXRjaENoYW5nZWQ7XG4gICAgICBuZXh0U3RhdGUuYWN0aW9ucyA9IGJhdGNoZWRBY3Rpb25zO1xuXG4gICAgICBfdGhpcy51cGRhdGUobmV4dFN0YXRlLCB0b1NDWE1MRXZlbnQoZXZlbnRzW2V2ZW50cy5sZW5ndGggLSAxXSkpO1xuICAgIH0pO1xuICB9O1xuICAvKipcclxuICAgKiBSZXR1cm5zIGEgc2VuZCBmdW5jdGlvbiBib3VuZCB0byB0aGlzIGludGVycHJldGVyIGluc3RhbmNlLlxyXG4gICAqXHJcbiAgICogQHBhcmFtIGV2ZW50IFRoZSBldmVudCB0byBiZSBzZW50IGJ5IHRoZSBzZW5kZXIuXHJcbiAgICovXG5cblxuICBJbnRlcnByZXRlci5wcm90b3R5cGUuc2VuZGVyID0gZnVuY3Rpb24gKGV2ZW50KSB7XG4gICAgcmV0dXJuIHRoaXMuc2VuZC5iaW5kKHRoaXMsIGV2ZW50KTtcbiAgfTtcbiAgLyoqXHJcbiAgICogUmV0dXJucyB0aGUgbmV4dCBzdGF0ZSBnaXZlbiB0aGUgaW50ZXJwcmV0ZXIncyBjdXJyZW50IHN0YXRlIGFuZCB0aGUgZXZlbnQuXHJcbiAgICpcclxuICAgKiBUaGlzIGlzIGEgcHVyZSBtZXRob2QgdGhhdCBkb2VzIF9ub3RfIHVwZGF0ZSB0aGUgaW50ZXJwcmV0ZXIncyBzdGF0ZS5cclxuICAgKlxyXG4gICAqIEBwYXJhbSBldmVudCBUaGUgZXZlbnQgdG8gZGV0ZXJtaW5lIHRoZSBuZXh0IHN0YXRlXHJcbiAgICovXG5cblxuICBJbnRlcnByZXRlci5wcm90b3R5cGUubmV4dFN0YXRlID0gZnVuY3Rpb24gKGV2ZW50KSB7XG4gICAgdmFyIF90aGlzID0gdGhpcztcblxuICAgIHZhciBfZXZlbnQgPSB0b1NDWE1MRXZlbnQoZXZlbnQpO1xuXG4gICAgaWYgKF9ldmVudC5uYW1lLmluZGV4T2YoZXJyb3JQbGF0Zm9ybSkgPT09IDAgJiYgIXRoaXMuc3RhdGUubmV4dEV2ZW50cy5zb21lKGZ1bmN0aW9uIChuZXh0RXZlbnQpIHtcbiAgICAgIHJldHVybiBuZXh0RXZlbnQuaW5kZXhPZihlcnJvclBsYXRmb3JtKSA9PT0gMDtcbiAgICB9KSkge1xuICAgICAgdGhyb3cgX2V2ZW50LmRhdGEuZGF0YTtcbiAgICB9XG5cbiAgICB2YXIgbmV4dFN0YXRlID0gcHJvdmlkZSh0aGlzLCBmdW5jdGlvbiAoKSB7XG4gICAgICByZXR1cm4gX3RoaXMubWFjaGluZS50cmFuc2l0aW9uKF90aGlzLnN0YXRlLCBfZXZlbnQpO1xuICAgIH0pO1xuICAgIHJldHVybiBuZXh0U3RhdGU7XG4gIH07XG5cbiAgSW50ZXJwcmV0ZXIucHJvdG90eXBlLmZvcndhcmQgPSBmdW5jdGlvbiAoZXZlbnQpIHtcbiAgICB2YXIgZV8xMywgX2E7XG5cbiAgICB0cnkge1xuICAgICAgZm9yICh2YXIgX2IgPSBfX3ZhbHVlcyh0aGlzLmZvcndhcmRUbyksIF9jID0gX2IubmV4dCgpOyAhX2MuZG9uZTsgX2MgPSBfYi5uZXh0KCkpIHtcbiAgICAgICAgdmFyIGlkID0gX2MudmFsdWU7XG4gICAgICAgIHZhciBjaGlsZCA9IHRoaXMuY2hpbGRyZW4uZ2V0KGlkKTtcblxuICAgICAgICBpZiAoIWNoaWxkKSB7XG4gICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiVW5hYmxlIHRvIGZvcndhcmQgZXZlbnQgJ1wiICsgZXZlbnQgKyBcIicgZnJvbSBpbnRlcnByZXRlciAnXCIgKyB0aGlzLmlkICsgXCInIHRvIG5vbmV4aXN0YW50IGNoaWxkICdcIiArIGlkICsgXCInLlwiKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGNoaWxkLnNlbmQoZXZlbnQpO1xuICAgICAgfVxuICAgIH0gY2F0Y2ggKGVfMTNfMSkge1xuICAgICAgZV8xMyA9IHtcbiAgICAgICAgZXJyb3I6IGVfMTNfMVxuICAgICAgfTtcbiAgICB9IGZpbmFsbHkge1xuICAgICAgdHJ5IHtcbiAgICAgICAgaWYgKF9jICYmICFfYy5kb25lICYmIChfYSA9IF9iLnJldHVybikpIF9hLmNhbGwoX2IpO1xuICAgICAgfSBmaW5hbGx5IHtcbiAgICAgICAgaWYgKGVfMTMpIHRocm93IGVfMTMuZXJyb3I7XG4gICAgICB9XG4gICAgfVxuICB9O1xuXG4gIEludGVycHJldGVyLnByb3RvdHlwZS5kZWZlciA9IGZ1bmN0aW9uIChzZW5kQWN0aW9uKSB7XG4gICAgdmFyIF90aGlzID0gdGhpcztcblxuICAgIHRoaXMuZGVsYXllZEV2ZW50c01hcFtzZW5kQWN0aW9uLmlkXSA9IHRoaXMuY2xvY2suc2V0VGltZW91dChmdW5jdGlvbiAoKSB7XG4gICAgICBpZiAoc2VuZEFjdGlvbi50bykge1xuICAgICAgICBfdGhpcy5zZW5kVG8oc2VuZEFjdGlvbi5fZXZlbnQsIHNlbmRBY3Rpb24udG8pO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgX3RoaXMuc2VuZChzZW5kQWN0aW9uLl9ldmVudCk7XG4gICAgICB9XG4gICAgfSwgc2VuZEFjdGlvbi5kZWxheSk7XG4gIH07XG5cbiAgSW50ZXJwcmV0ZXIucHJvdG90eXBlLmNhbmNlbCA9IGZ1bmN0aW9uIChzZW5kSWQpIHtcbiAgICB0aGlzLmNsb2NrLmNsZWFyVGltZW91dCh0aGlzLmRlbGF5ZWRFdmVudHNNYXBbc2VuZElkXSk7XG4gICAgZGVsZXRlIHRoaXMuZGVsYXllZEV2ZW50c01hcFtzZW5kSWRdO1xuICB9O1xuXG4gIEludGVycHJldGVyLnByb3RvdHlwZS5leGVjID0gZnVuY3Rpb24gKGFjdGlvbiwgc3RhdGUsIGFjdGlvbkZ1bmN0aW9uTWFwKSB7XG4gICAgaWYgKGFjdGlvbkZ1bmN0aW9uTWFwID09PSB2b2lkIDApIHtcbiAgICAgIGFjdGlvbkZ1bmN0aW9uTWFwID0gdGhpcy5tYWNoaW5lLm9wdGlvbnMuYWN0aW9ucztcbiAgICB9XG5cbiAgICB2YXIgY29udGV4dCA9IHN0YXRlLmNvbnRleHQsXG4gICAgICAgIF9ldmVudCA9IHN0YXRlLl9ldmVudDtcbiAgICB2YXIgYWN0aW9uT3JFeGVjID0gYWN0aW9uLmV4ZWMgfHwgZ2V0QWN0aW9uRnVuY3Rpb24oYWN0aW9uLnR5cGUsIGFjdGlvbkZ1bmN0aW9uTWFwKTtcbiAgICB2YXIgZXhlYyA9IGlzRnVuY3Rpb24oYWN0aW9uT3JFeGVjKSA/IGFjdGlvbk9yRXhlYyA6IGFjdGlvbk9yRXhlYyA/IGFjdGlvbk9yRXhlYy5leGVjIDogYWN0aW9uLmV4ZWM7XG5cbiAgICBpZiAoZXhlYykge1xuICAgICAgdHJ5IHtcbiAgICAgICAgcmV0dXJuIGV4ZWMoY29udGV4dCwgX2V2ZW50LmRhdGEsIHtcbiAgICAgICAgICBhY3Rpb246IGFjdGlvbixcbiAgICAgICAgICBzdGF0ZTogdGhpcy5zdGF0ZSxcbiAgICAgICAgICBfZXZlbnQ6IF9ldmVudFxuICAgICAgICB9KTtcbiAgICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICBpZiAodGhpcy5wYXJlbnQpIHtcbiAgICAgICAgICB0aGlzLnBhcmVudC5zZW5kKHtcbiAgICAgICAgICAgIHR5cGU6ICd4c3RhdGUuZXJyb3InLFxuICAgICAgICAgICAgZGF0YTogZXJyXG4gICAgICAgICAgfSk7XG4gICAgICAgIH1cblxuICAgICAgICB0aHJvdyBlcnI7XG4gICAgICB9XG4gICAgfVxuXG4gICAgc3dpdGNoIChhY3Rpb24udHlwZSkge1xuICAgICAgY2FzZSBzZW5kOlxuICAgICAgICB2YXIgc2VuZEFjdGlvbiA9IGFjdGlvbjtcblxuICAgICAgICBpZiAodHlwZW9mIHNlbmRBY3Rpb24uZGVsYXkgPT09ICdudW1iZXInKSB7XG4gICAgICAgICAgdGhpcy5kZWZlcihzZW5kQWN0aW9uKTtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgaWYgKHNlbmRBY3Rpb24udG8pIHtcbiAgICAgICAgICAgIHRoaXMuc2VuZFRvKHNlbmRBY3Rpb24uX2V2ZW50LCBzZW5kQWN0aW9uLnRvKTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5zZW5kKHNlbmRBY3Rpb24uX2V2ZW50KTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBicmVhaztcblxuICAgICAgY2FzZSBjYW5jZWw6XG4gICAgICAgIHRoaXMuY2FuY2VsKGFjdGlvbi5zZW5kSWQpO1xuICAgICAgICBicmVhaztcblxuICAgICAgY2FzZSBzdGFydDpcbiAgICAgICAge1xuICAgICAgICAgIHZhciBhY3Rpdml0eSA9IGFjdGlvbi5hY3Rpdml0eTsgLy8gSWYgdGhlIGFjdGl2aXR5IHdpbGwgYmUgc3RvcHBlZCByaWdodCBhZnRlciBpdCdzIHN0YXJ0ZWRcbiAgICAgICAgICAvLyAoc3VjaCBhcyBpbiB0cmFuc2llbnQgc3RhdGVzKVxuICAgICAgICAgIC8vIGRvbid0IGJvdGhlciBzdGFydGluZyB0aGUgYWN0aXZpdHkuXG5cbiAgICAgICAgICBpZiAoIXRoaXMuc3RhdGUuYWN0aXZpdGllc1thY3Rpdml0eS5pZCB8fCBhY3Rpdml0eS50eXBlXSkge1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgfSAvLyBJbnZva2VkIHNlcnZpY2VzXG5cblxuICAgICAgICAgIGlmIChhY3Rpdml0eS50eXBlID09PSBBY3Rpb25UeXBlcy5JbnZva2UpIHtcbiAgICAgICAgICAgIHZhciBpbnZva2VTb3VyY2UgPSB0b0ludm9rZVNvdXJjZShhY3Rpdml0eS5zcmMpO1xuICAgICAgICAgICAgdmFyIHNlcnZpY2VDcmVhdG9yID0gdGhpcy5tYWNoaW5lLm9wdGlvbnMuc2VydmljZXMgPyB0aGlzLm1hY2hpbmUub3B0aW9ucy5zZXJ2aWNlc1tpbnZva2VTb3VyY2UudHlwZV0gOiB1bmRlZmluZWQ7XG4gICAgICAgICAgICB2YXIgaWQgPSBhY3Rpdml0eS5pZCxcbiAgICAgICAgICAgICAgICBkYXRhID0gYWN0aXZpdHkuZGF0YTtcblxuICAgICAgICAgICAgaWYgKCFJU19QUk9EVUNUSU9OKSB7XG4gICAgICAgICAgICAgIHdhcm4oISgnZm9yd2FyZCcgaW4gYWN0aXZpdHkpLCAvLyB0c2xpbnQ6ZGlzYWJsZS1uZXh0LWxpbmU6bWF4LWxpbmUtbGVuZ3RoXG4gICAgICAgICAgICAgIFwiYGZvcndhcmRgIHByb3BlcnR5IGlzIGRlcHJlY2F0ZWQgKGZvdW5kIGluIGludm9jYXRpb24gb2YgJ1wiICsgYWN0aXZpdHkuc3JjICsgXCInIGluIGluIG1hY2hpbmUgJ1wiICsgdGhpcy5tYWNoaW5lLmlkICsgXCInKS4gXCIgKyBcIlBsZWFzZSB1c2UgYGF1dG9Gb3J3YXJkYCBpbnN0ZWFkLlwiKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdmFyIGF1dG9Gb3J3YXJkID0gJ2F1dG9Gb3J3YXJkJyBpbiBhY3Rpdml0eSA/IGFjdGl2aXR5LmF1dG9Gb3J3YXJkIDogISFhY3Rpdml0eS5mb3J3YXJkO1xuXG4gICAgICAgICAgICBpZiAoIXNlcnZpY2VDcmVhdG9yKSB7XG4gICAgICAgICAgICAgIC8vIHRzbGludDpkaXNhYmxlLW5leHQtbGluZTpuby1jb25zb2xlXG4gICAgICAgICAgICAgIGlmICghSVNfUFJPRFVDVElPTikge1xuICAgICAgICAgICAgICAgIHdhcm4oZmFsc2UsIFwiTm8gc2VydmljZSBmb3VuZCBmb3IgaW52b2NhdGlvbiAnXCIgKyBhY3Rpdml0eS5zcmMgKyBcIicgaW4gbWFjaGluZSAnXCIgKyB0aGlzLm1hY2hpbmUuaWQgKyBcIicuXCIpO1xuICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB2YXIgcmVzb2x2ZWREYXRhID0gZGF0YSA/IG1hcENvbnRleHQoZGF0YSwgY29udGV4dCwgX2V2ZW50KSA6IHVuZGVmaW5lZDtcbiAgICAgICAgICAgIHZhciBzb3VyY2UgPSBpc0Z1bmN0aW9uKHNlcnZpY2VDcmVhdG9yKSA/IHNlcnZpY2VDcmVhdG9yKGNvbnRleHQsIF9ldmVudC5kYXRhLCB7XG4gICAgICAgICAgICAgIGRhdGE6IHJlc29sdmVkRGF0YSxcbiAgICAgICAgICAgICAgc3JjOiBpbnZva2VTb3VyY2VcbiAgICAgICAgICAgIH0pIDogc2VydmljZUNyZWF0b3I7XG5cbiAgICAgICAgICAgIGlmIChpc1Byb21pc2VMaWtlKHNvdXJjZSkpIHtcbiAgICAgICAgICAgICAgdGhpcy5zcGF3blByb21pc2UoUHJvbWlzZS5yZXNvbHZlKHNvdXJjZSksIGlkKTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoaXNGdW5jdGlvbihzb3VyY2UpKSB7XG4gICAgICAgICAgICAgIHRoaXMuc3Bhd25DYWxsYmFjayhzb3VyY2UsIGlkKTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoaXNPYnNlcnZhYmxlKHNvdXJjZSkpIHtcbiAgICAgICAgICAgICAgdGhpcy5zcGF3bk9ic2VydmFibGUoc291cmNlLCBpZCk7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKGlzTWFjaGluZShzb3VyY2UpKSB7XG4gICAgICAgICAgICAgIC8vIFRPRE86IHRyeS9jYXRjaCBoZXJlXG4gICAgICAgICAgICAgIHRoaXMuc3Bhd25NYWNoaW5lKHJlc29sdmVkRGF0YSA/IHNvdXJjZS53aXRoQ29udGV4dChyZXNvbHZlZERhdGEpIDogc291cmNlLCB7XG4gICAgICAgICAgICAgICAgaWQ6IGlkLFxuICAgICAgICAgICAgICAgIGF1dG9Gb3J3YXJkOiBhdXRvRm9yd2FyZFxuICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0gZWxzZSA7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMuc3Bhd25BY3Rpdml0eShhY3Rpdml0eSk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cblxuICAgICAgY2FzZSBzdG9wOlxuICAgICAgICB7XG4gICAgICAgICAgdGhpcy5zdG9wQ2hpbGQoYWN0aW9uLmFjdGl2aXR5LmlkKTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuXG4gICAgICBjYXNlIGxvZzpcbiAgICAgICAgdmFyIGxhYmVsID0gYWN0aW9uLmxhYmVsLFxuICAgICAgICAgICAgdmFsdWUgPSBhY3Rpb24udmFsdWU7XG5cbiAgICAgICAgaWYgKGxhYmVsKSB7XG4gICAgICAgICAgdGhpcy5sb2dnZXIobGFiZWwsIHZhbHVlKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB0aGlzLmxvZ2dlcih2YWx1ZSk7XG4gICAgICAgIH1cblxuICAgICAgICBicmVhaztcblxuICAgICAgZGVmYXVsdDpcbiAgICAgICAgaWYgKCFJU19QUk9EVUNUSU9OKSB7XG4gICAgICAgICAgd2FybihmYWxzZSwgXCJObyBpbXBsZW1lbnRhdGlvbiBmb3VuZCBmb3IgYWN0aW9uIHR5cGUgJ1wiICsgYWN0aW9uLnR5cGUgKyBcIidcIik7XG4gICAgICAgIH1cblxuICAgICAgICBicmVhaztcbiAgICB9XG5cbiAgICByZXR1cm4gdW5kZWZpbmVkO1xuICB9O1xuXG4gIEludGVycHJldGVyLnByb3RvdHlwZS5yZW1vdmVDaGlsZCA9IGZ1bmN0aW9uIChjaGlsZElkKSB7XG4gICAgdGhpcy5jaGlsZHJlbi5kZWxldGUoY2hpbGRJZCk7XG4gICAgdGhpcy5mb3J3YXJkVG8uZGVsZXRlKGNoaWxkSWQpO1xuICAgIGRlbGV0ZSB0aGlzLnN0YXRlLmNoaWxkcmVuW2NoaWxkSWRdO1xuICB9O1xuXG4gIEludGVycHJldGVyLnByb3RvdHlwZS5zdG9wQ2hpbGQgPSBmdW5jdGlvbiAoY2hpbGRJZCkge1xuICAgIHZhciBjaGlsZCA9IHRoaXMuY2hpbGRyZW4uZ2V0KGNoaWxkSWQpO1xuXG4gICAgaWYgKCFjaGlsZCkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHRoaXMucmVtb3ZlQ2hpbGQoY2hpbGRJZCk7XG5cbiAgICBpZiAoaXNGdW5jdGlvbihjaGlsZC5zdG9wKSkge1xuICAgICAgY2hpbGQuc3RvcCgpO1xuICAgIH1cbiAgfTtcblxuICBJbnRlcnByZXRlci5wcm90b3R5cGUuc3Bhd24gPSBmdW5jdGlvbiAoZW50aXR5LCBuYW1lLCBvcHRpb25zKSB7XG4gICAgaWYgKGlzUHJvbWlzZUxpa2UoZW50aXR5KSkge1xuICAgICAgcmV0dXJuIHRoaXMuc3Bhd25Qcm9taXNlKFByb21pc2UucmVzb2x2ZShlbnRpdHkpLCBuYW1lKTtcbiAgICB9IGVsc2UgaWYgKGlzRnVuY3Rpb24oZW50aXR5KSkge1xuICAgICAgcmV0dXJuIHRoaXMuc3Bhd25DYWxsYmFjayhlbnRpdHksIG5hbWUpO1xuICAgIH0gZWxzZSBpZiAoaXNTcGF3bmVkQWN0b3IoZW50aXR5KSkge1xuICAgICAgcmV0dXJuIHRoaXMuc3Bhd25BY3RvcihlbnRpdHkpO1xuICAgIH0gZWxzZSBpZiAoaXNPYnNlcnZhYmxlKGVudGl0eSkpIHtcbiAgICAgIHJldHVybiB0aGlzLnNwYXduT2JzZXJ2YWJsZShlbnRpdHksIG5hbWUpO1xuICAgIH0gZWxzZSBpZiAoaXNNYWNoaW5lKGVudGl0eSkpIHtcbiAgICAgIHJldHVybiB0aGlzLnNwYXduTWFjaGluZShlbnRpdHksIF9fYXNzaWduKF9fYXNzaWduKHt9LCBvcHRpb25zKSwge1xuICAgICAgICBpZDogbmFtZVxuICAgICAgfSkpO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXCJVbmFibGUgdG8gc3Bhd24gZW50aXR5IFxcXCJcIiArIG5hbWUgKyBcIlxcXCIgb2YgdHlwZSBcXFwiXCIgKyB0eXBlb2YgZW50aXR5ICsgXCJcXFwiLlwiKTtcbiAgICB9XG4gIH07XG5cbiAgSW50ZXJwcmV0ZXIucHJvdG90eXBlLnNwYXduTWFjaGluZSA9IGZ1bmN0aW9uIChtYWNoaW5lLCBvcHRpb25zKSB7XG4gICAgdmFyIF90aGlzID0gdGhpcztcblxuICAgIGlmIChvcHRpb25zID09PSB2b2lkIDApIHtcbiAgICAgIG9wdGlvbnMgPSB7fTtcbiAgICB9XG5cbiAgICB2YXIgY2hpbGRTZXJ2aWNlID0gbmV3IEludGVycHJldGVyKG1hY2hpbmUsIF9fYXNzaWduKF9fYXNzaWduKHt9LCB0aGlzLm9wdGlvbnMpLCB7XG4gICAgICBwYXJlbnQ6IHRoaXMsXG4gICAgICBpZDogb3B0aW9ucy5pZCB8fCBtYWNoaW5lLmlkXG4gICAgfSkpO1xuXG4gICAgdmFyIHJlc29sdmVkT3B0aW9ucyA9IF9fYXNzaWduKF9fYXNzaWduKHt9LCBERUZBVUxUX1NQQVdOX09QVElPTlMpLCBvcHRpb25zKTtcblxuICAgIGlmIChyZXNvbHZlZE9wdGlvbnMuc3luYykge1xuICAgICAgY2hpbGRTZXJ2aWNlLm9uVHJhbnNpdGlvbihmdW5jdGlvbiAoc3RhdGUpIHtcbiAgICAgICAgX3RoaXMuc2VuZCh1cGRhdGUsIHtcbiAgICAgICAgICBzdGF0ZTogc3RhdGUsXG4gICAgICAgICAgaWQ6IGNoaWxkU2VydmljZS5pZFxuICAgICAgICB9KTtcbiAgICAgIH0pO1xuICAgIH1cblxuICAgIHZhciBhY3RvciA9IGNoaWxkU2VydmljZTtcbiAgICB0aGlzLmNoaWxkcmVuLnNldChjaGlsZFNlcnZpY2UuaWQsIGFjdG9yKTtcblxuICAgIGlmIChyZXNvbHZlZE9wdGlvbnMuYXV0b0ZvcndhcmQpIHtcbiAgICAgIHRoaXMuZm9yd2FyZFRvLmFkZChjaGlsZFNlcnZpY2UuaWQpO1xuICAgIH1cblxuICAgIGNoaWxkU2VydmljZS5vbkRvbmUoZnVuY3Rpb24gKGRvbmVFdmVudCkge1xuICAgICAgX3RoaXMucmVtb3ZlQ2hpbGQoY2hpbGRTZXJ2aWNlLmlkKTtcblxuICAgICAgX3RoaXMuc2VuZCh0b1NDWE1MRXZlbnQoZG9uZUV2ZW50LCB7XG4gICAgICAgIG9yaWdpbjogY2hpbGRTZXJ2aWNlLmlkXG4gICAgICB9KSk7XG4gICAgfSkuc3RhcnQoKTtcbiAgICByZXR1cm4gYWN0b3I7XG4gIH07XG5cbiAgSW50ZXJwcmV0ZXIucHJvdG90eXBlLnNwYXduUHJvbWlzZSA9IGZ1bmN0aW9uIChwcm9taXNlLCBpZCkge1xuICAgIHZhciBfdGhpcyA9IHRoaXM7XG5cbiAgICB2YXIgY2FuY2VsZWQgPSBmYWxzZTtcbiAgICBwcm9taXNlLnRoZW4oZnVuY3Rpb24gKHJlc3BvbnNlKSB7XG4gICAgICBpZiAoIWNhbmNlbGVkKSB7XG4gICAgICAgIF90aGlzLnJlbW92ZUNoaWxkKGlkKTtcblxuICAgICAgICBfdGhpcy5zZW5kKHRvU0NYTUxFdmVudChkb25lSW52b2tlKGlkLCByZXNwb25zZSksIHtcbiAgICAgICAgICBvcmlnaW46IGlkXG4gICAgICAgIH0pKTtcbiAgICAgIH1cbiAgICB9LCBmdW5jdGlvbiAoZXJyb3JEYXRhKSB7XG4gICAgICBpZiAoIWNhbmNlbGVkKSB7XG4gICAgICAgIF90aGlzLnJlbW92ZUNoaWxkKGlkKTtcblxuICAgICAgICB2YXIgZXJyb3JFdmVudCA9IGVycm9yKGlkLCBlcnJvckRhdGEpO1xuXG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgLy8gU2VuZCBcImVycm9yLnBsYXRmb3JtLmlkXCIgdG8gdGhpcyAocGFyZW50KS5cbiAgICAgICAgICBfdGhpcy5zZW5kKHRvU0NYTUxFdmVudChlcnJvckV2ZW50LCB7XG4gICAgICAgICAgICBvcmlnaW46IGlkXG4gICAgICAgICAgfSkpO1xuICAgICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICAgIHJlcG9ydFVuaGFuZGxlZEV4Y2VwdGlvbk9uSW52b2NhdGlvbihlcnJvckRhdGEsIGVycm9yLCBpZCk7XG5cbiAgICAgICAgICBpZiAoX3RoaXMuZGV2VG9vbHMpIHtcbiAgICAgICAgICAgIF90aGlzLmRldlRvb2xzLnNlbmQoZXJyb3JFdmVudCwgX3RoaXMuc3RhdGUpO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIGlmIChfdGhpcy5tYWNoaW5lLnN0cmljdCkge1xuICAgICAgICAgICAgLy8gaXQgd291bGQgYmUgYmV0dGVyIHRvIGFsd2F5cyBzdG9wIHRoZSBzdGF0ZSBtYWNoaW5lIGlmIHVuaGFuZGxlZFxuICAgICAgICAgICAgLy8gZXhjZXB0aW9uL3Byb21pc2UgcmVqZWN0aW9uIGhhcHBlbnMgYnV0IGJlY2F1c2Ugd2UgZG9uJ3Qgd2FudCB0b1xuICAgICAgICAgICAgLy8gYnJlYWsgZXhpc3RpbmcgY29kZSBzbyBlbmZvcmNlIGl0IG9uIHN0cmljdCBtb2RlIG9ubHkgZXNwZWNpYWxseSBzb1xuICAgICAgICAgICAgLy8gYmVjYXVzZSBkb2N1bWVudGF0aW9uIHNheXMgdGhhdCBvbkVycm9yIGlzIG9wdGlvbmFsXG4gICAgICAgICAgICBfdGhpcy5zdG9wKCk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfSk7XG4gICAgdmFyIGFjdG9yID0ge1xuICAgICAgaWQ6IGlkLFxuICAgICAgc2VuZDogZnVuY3Rpb24gKCkge1xuICAgICAgICByZXR1cm4gdm9pZCAwO1xuICAgICAgfSxcbiAgICAgIHN1YnNjcmliZTogZnVuY3Rpb24gKG5leHQsIGhhbmRsZUVycm9yLCBjb21wbGV0ZSkge1xuICAgICAgICB2YXIgb2JzZXJ2ZXIgPSB0b09ic2VydmVyKG5leHQsIGhhbmRsZUVycm9yLCBjb21wbGV0ZSk7XG4gICAgICAgIHZhciB1bnN1YnNjcmliZWQgPSBmYWxzZTtcbiAgICAgICAgcHJvbWlzZS50aGVuKGZ1bmN0aW9uIChyZXNwb25zZSkge1xuICAgICAgICAgIGlmICh1bnN1YnNjcmliZWQpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBvYnNlcnZlci5uZXh0KHJlc3BvbnNlKTtcblxuICAgICAgICAgIGlmICh1bnN1YnNjcmliZWQpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBvYnNlcnZlci5jb21wbGV0ZSgpO1xuICAgICAgICB9LCBmdW5jdGlvbiAoZXJyKSB7XG4gICAgICAgICAgaWYgKHVuc3Vic2NyaWJlZCkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIG9ic2VydmVyLmVycm9yKGVycik7XG4gICAgICAgIH0pO1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgIHVuc3Vic2NyaWJlOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICByZXR1cm4gdW5zdWJzY3JpYmVkID0gdHJ1ZTtcbiAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgICB9LFxuICAgICAgc3RvcDogZnVuY3Rpb24gKCkge1xuICAgICAgICBjYW5jZWxlZCA9IHRydWU7XG4gICAgICB9LFxuICAgICAgdG9KU09OOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgaWQ6IGlkXG4gICAgICAgIH07XG4gICAgICB9XG4gICAgfTtcbiAgICB0aGlzLmNoaWxkcmVuLnNldChpZCwgYWN0b3IpO1xuICAgIHJldHVybiBhY3RvcjtcbiAgfTtcblxuICBJbnRlcnByZXRlci5wcm90b3R5cGUuc3Bhd25DYWxsYmFjayA9IGZ1bmN0aW9uIChjYWxsYmFjaywgaWQpIHtcbiAgICB2YXIgX3RoaXMgPSB0aGlzO1xuXG4gICAgdmFyIGNhbmNlbGVkID0gZmFsc2U7XG4gICAgdmFyIHJlY2VpdmVycyA9IG5ldyBTZXQoKTtcbiAgICB2YXIgbGlzdGVuZXJzID0gbmV3IFNldCgpO1xuXG4gICAgdmFyIHJlY2VpdmUgPSBmdW5jdGlvbiAoZSkge1xuICAgICAgbGlzdGVuZXJzLmZvckVhY2goZnVuY3Rpb24gKGxpc3RlbmVyKSB7XG4gICAgICAgIHJldHVybiBsaXN0ZW5lcihlKTtcbiAgICAgIH0pO1xuXG4gICAgICBpZiAoY2FuY2VsZWQpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICBfdGhpcy5zZW5kKHRvU0NYTUxFdmVudChlLCB7XG4gICAgICAgIG9yaWdpbjogaWRcbiAgICAgIH0pKTtcbiAgICB9O1xuXG4gICAgdmFyIGNhbGxiYWNrU3RvcDtcblxuICAgIHRyeSB7XG4gICAgICBjYWxsYmFja1N0b3AgPSBjYWxsYmFjayhyZWNlaXZlLCBmdW5jdGlvbiAobmV3TGlzdGVuZXIpIHtcbiAgICAgICAgcmVjZWl2ZXJzLmFkZChuZXdMaXN0ZW5lcik7XG4gICAgICB9KTtcbiAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgIHRoaXMuc2VuZChlcnJvcihpZCwgZXJyKSk7XG4gICAgfVxuXG4gICAgaWYgKGlzUHJvbWlzZUxpa2UoY2FsbGJhY2tTdG9wKSkge1xuICAgICAgLy8gaXQgdHVybmVkIG91dCB0byBiZSBhbiBhc3luYyBmdW5jdGlvbiwgY2FuJ3QgcmVsaWFibHkgY2hlY2sgdGhpcyBiZWZvcmUgY2FsbGluZyBgY2FsbGJhY2tgXG4gICAgICAvLyBiZWNhdXNlIHRyYW5zcGlsZWQgYXN5bmMgZnVuY3Rpb25zIGFyZSBub3QgcmVjb2duaXphYmxlXG4gICAgICByZXR1cm4gdGhpcy5zcGF3blByb21pc2UoY2FsbGJhY2tTdG9wLCBpZCk7XG4gICAgfVxuXG4gICAgdmFyIGFjdG9yID0ge1xuICAgICAgaWQ6IGlkLFxuICAgICAgc2VuZDogZnVuY3Rpb24gKGV2ZW50KSB7XG4gICAgICAgIHJldHVybiByZWNlaXZlcnMuZm9yRWFjaChmdW5jdGlvbiAocmVjZWl2ZXIpIHtcbiAgICAgICAgICByZXR1cm4gcmVjZWl2ZXIoZXZlbnQpO1xuICAgICAgICB9KTtcbiAgICAgIH0sXG4gICAgICBzdWJzY3JpYmU6IGZ1bmN0aW9uIChuZXh0KSB7XG4gICAgICAgIGxpc3RlbmVycy5hZGQobmV4dCk7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgdW5zdWJzY3JpYmU6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIGxpc3RlbmVycy5kZWxldGUobmV4dCk7XG4gICAgICAgICAgfVxuICAgICAgICB9O1xuICAgICAgfSxcbiAgICAgIHN0b3A6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgY2FuY2VsZWQgPSB0cnVlO1xuXG4gICAgICAgIGlmIChpc0Z1bmN0aW9uKGNhbGxiYWNrU3RvcCkpIHtcbiAgICAgICAgICBjYWxsYmFja1N0b3AoKTtcbiAgICAgICAgfVxuICAgICAgfSxcbiAgICAgIHRvSlNPTjogZnVuY3Rpb24gKCkge1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgIGlkOiBpZFxuICAgICAgICB9O1xuICAgICAgfVxuICAgIH07XG4gICAgdGhpcy5jaGlsZHJlbi5zZXQoaWQsIGFjdG9yKTtcbiAgICByZXR1cm4gYWN0b3I7XG4gIH07XG5cbiAgSW50ZXJwcmV0ZXIucHJvdG90eXBlLnNwYXduT2JzZXJ2YWJsZSA9IGZ1bmN0aW9uIChzb3VyY2UsIGlkKSB7XG4gICAgdmFyIF90aGlzID0gdGhpcztcblxuICAgIHZhciBzdWJzY3JpcHRpb24gPSBzb3VyY2Uuc3Vic2NyaWJlKGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgICAgX3RoaXMuc2VuZCh0b1NDWE1MRXZlbnQodmFsdWUsIHtcbiAgICAgICAgb3JpZ2luOiBpZFxuICAgICAgfSkpO1xuICAgIH0sIGZ1bmN0aW9uIChlcnIpIHtcbiAgICAgIF90aGlzLnJlbW92ZUNoaWxkKGlkKTtcblxuICAgICAgX3RoaXMuc2VuZCh0b1NDWE1MRXZlbnQoZXJyb3IoaWQsIGVyciksIHtcbiAgICAgICAgb3JpZ2luOiBpZFxuICAgICAgfSkpO1xuICAgIH0sIGZ1bmN0aW9uICgpIHtcbiAgICAgIF90aGlzLnJlbW92ZUNoaWxkKGlkKTtcblxuICAgICAgX3RoaXMuc2VuZCh0b1NDWE1MRXZlbnQoZG9uZUludm9rZShpZCksIHtcbiAgICAgICAgb3JpZ2luOiBpZFxuICAgICAgfSkpO1xuICAgIH0pO1xuICAgIHZhciBhY3RvciA9IHtcbiAgICAgIGlkOiBpZCxcbiAgICAgIHNlbmQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmV0dXJuIHZvaWQgMDtcbiAgICAgIH0sXG4gICAgICBzdWJzY3JpYmU6IGZ1bmN0aW9uIChuZXh0LCBoYW5kbGVFcnJvciwgY29tcGxldGUpIHtcbiAgICAgICAgcmV0dXJuIHNvdXJjZS5zdWJzY3JpYmUobmV4dCwgaGFuZGxlRXJyb3IsIGNvbXBsZXRlKTtcbiAgICAgIH0sXG4gICAgICBzdG9wOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJldHVybiBzdWJzY3JpcHRpb24udW5zdWJzY3JpYmUoKTtcbiAgICAgIH0sXG4gICAgICB0b0pTT046IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICBpZDogaWRcbiAgICAgICAgfTtcbiAgICAgIH1cbiAgICB9O1xuICAgIHRoaXMuY2hpbGRyZW4uc2V0KGlkLCBhY3Rvcik7XG4gICAgcmV0dXJuIGFjdG9yO1xuICB9O1xuXG4gIEludGVycHJldGVyLnByb3RvdHlwZS5zcGF3bkFjdG9yID0gZnVuY3Rpb24gKGFjdG9yKSB7XG4gICAgdGhpcy5jaGlsZHJlbi5zZXQoYWN0b3IuaWQsIGFjdG9yKTtcbiAgICByZXR1cm4gYWN0b3I7XG4gIH07XG5cbiAgSW50ZXJwcmV0ZXIucHJvdG90eXBlLnNwYXduQWN0aXZpdHkgPSBmdW5jdGlvbiAoYWN0aXZpdHkpIHtcbiAgICB2YXIgaW1wbGVtZW50YXRpb24gPSB0aGlzLm1hY2hpbmUub3B0aW9ucyAmJiB0aGlzLm1hY2hpbmUub3B0aW9ucy5hY3Rpdml0aWVzID8gdGhpcy5tYWNoaW5lLm9wdGlvbnMuYWN0aXZpdGllc1thY3Rpdml0eS50eXBlXSA6IHVuZGVmaW5lZDtcblxuICAgIGlmICghaW1wbGVtZW50YXRpb24pIHtcbiAgICAgIGlmICghSVNfUFJPRFVDVElPTikge1xuICAgICAgICB3YXJuKGZhbHNlLCBcIk5vIGltcGxlbWVudGF0aW9uIGZvdW5kIGZvciBhY3Rpdml0eSAnXCIgKyBhY3Rpdml0eS50eXBlICsgXCInXCIpO1xuICAgICAgfSAvLyB0c2xpbnQ6ZGlzYWJsZS1uZXh0LWxpbmU6bm8tY29uc29sZVxuXG5cbiAgICAgIHJldHVybjtcbiAgICB9IC8vIFN0YXJ0IGltcGxlbWVudGF0aW9uXG5cblxuICAgIHZhciBkaXNwb3NlID0gaW1wbGVtZW50YXRpb24odGhpcy5zdGF0ZS5jb250ZXh0LCBhY3Rpdml0eSk7XG4gICAgdGhpcy5zcGF3bkVmZmVjdChhY3Rpdml0eS5pZCwgZGlzcG9zZSk7XG4gIH07XG5cbiAgSW50ZXJwcmV0ZXIucHJvdG90eXBlLnNwYXduRWZmZWN0ID0gZnVuY3Rpb24gKGlkLCBkaXNwb3NlKSB7XG4gICAgdGhpcy5jaGlsZHJlbi5zZXQoaWQsIHtcbiAgICAgIGlkOiBpZCxcbiAgICAgIHNlbmQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmV0dXJuIHZvaWQgMDtcbiAgICAgIH0sXG4gICAgICBzdWJzY3JpYmU6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICB1bnN1YnNjcmliZTogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgcmV0dXJuIHZvaWQgMDtcbiAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgICB9LFxuICAgICAgc3RvcDogZGlzcG9zZSB8fCB1bmRlZmluZWQsXG4gICAgICB0b0pTT046IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICBpZDogaWRcbiAgICAgICAgfTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfTtcblxuICBJbnRlcnByZXRlci5wcm90b3R5cGUuYXR0YWNoRGV2ID0gZnVuY3Rpb24gKCkge1xuICAgIHZhciBnbG9iYWwgPSBnZXRHbG9iYWwoKTtcblxuICAgIGlmICh0aGlzLm9wdGlvbnMuZGV2VG9vbHMgJiYgZ2xvYmFsKSB7XG4gICAgICBpZiAoZ2xvYmFsLl9fUkVEVVhfREVWVE9PTFNfRVhURU5TSU9OX18pIHtcbiAgICAgICAgdmFyIGRldlRvb2xzT3B0aW9ucyA9IHR5cGVvZiB0aGlzLm9wdGlvbnMuZGV2VG9vbHMgPT09ICdvYmplY3QnID8gdGhpcy5vcHRpb25zLmRldlRvb2xzIDogdW5kZWZpbmVkO1xuICAgICAgICB0aGlzLmRldlRvb2xzID0gZ2xvYmFsLl9fUkVEVVhfREVWVE9PTFNfRVhURU5TSU9OX18uY29ubmVjdChfX2Fzc2lnbihfX2Fzc2lnbih7XG4gICAgICAgICAgbmFtZTogdGhpcy5pZCxcbiAgICAgICAgICBhdXRvUGF1c2U6IHRydWUsXG4gICAgICAgICAgc3RhdGVTYW5pdGl6ZXI6IGZ1bmN0aW9uIChzdGF0ZSkge1xuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgdmFsdWU6IHN0YXRlLnZhbHVlLFxuICAgICAgICAgICAgICBjb250ZXh0OiBzdGF0ZS5jb250ZXh0LFxuICAgICAgICAgICAgICBhY3Rpb25zOiBzdGF0ZS5hY3Rpb25zXG4gICAgICAgICAgICB9O1xuICAgICAgICAgIH1cbiAgICAgICAgfSwgZGV2VG9vbHNPcHRpb25zKSwge1xuICAgICAgICAgIGZlYXR1cmVzOiBfX2Fzc2lnbih7XG4gICAgICAgICAgICBqdW1wOiBmYWxzZSxcbiAgICAgICAgICAgIHNraXA6IGZhbHNlXG4gICAgICAgICAgfSwgZGV2VG9vbHNPcHRpb25zID8gZGV2VG9vbHNPcHRpb25zLmZlYXR1cmVzIDogdW5kZWZpbmVkKVxuICAgICAgICB9KSwgdGhpcy5tYWNoaW5lKTtcbiAgICAgICAgdGhpcy5kZXZUb29scy5pbml0KHRoaXMuc3RhdGUpO1xuICAgICAgfSAvLyBhZGQgWFN0YXRlLXNwZWNpZmljIGRldiB0b29saW5nIGhvb2tcblxuXG4gICAgICByZWdpc3RlclNlcnZpY2UodGhpcyk7XG4gICAgfVxuICB9O1xuXG4gIEludGVycHJldGVyLnByb3RvdHlwZS50b0pTT04gPSBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIGlkOiB0aGlzLmlkXG4gICAgfTtcbiAgfTtcblxuICBJbnRlcnByZXRlci5wcm90b3R5cGVbc3ltYm9sT2JzZXJ2YWJsZV0gPSBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH07XG4gIC8qKlxyXG4gICAqIFRoZSBkZWZhdWx0IGludGVycHJldGVyIG9wdGlvbnM6XHJcbiAgICpcclxuICAgKiAtIGBjbG9ja2AgdXNlcyB0aGUgZ2xvYmFsIGBzZXRUaW1lb3V0YCBhbmQgYGNsZWFyVGltZW91dGAgZnVuY3Rpb25zXHJcbiAgICogLSBgbG9nZ2VyYCB1c2VzIHRoZSBnbG9iYWwgYGNvbnNvbGUubG9nKClgIG1ldGhvZFxyXG4gICAqL1xuXG5cbiAgSW50ZXJwcmV0ZXIuZGVmYXVsdE9wdGlvbnMgPSAvKiNfX1BVUkVfXyovZnVuY3Rpb24gKGdsb2JhbCkge1xuICAgIHJldHVybiB7XG4gICAgICBleGVjdXRlOiB0cnVlLFxuICAgICAgZGVmZXJFdmVudHM6IHRydWUsXG4gICAgICBjbG9jazoge1xuICAgICAgICBzZXRUaW1lb3V0OiBmdW5jdGlvbiAoZm4sIG1zKSB7XG4gICAgICAgICAgcmV0dXJuIHNldFRpbWVvdXQoZm4sIG1zKTtcbiAgICAgICAgfSxcbiAgICAgICAgY2xlYXJUaW1lb3V0OiBmdW5jdGlvbiAoaWQpIHtcbiAgICAgICAgICByZXR1cm4gY2xlYXJUaW1lb3V0KGlkKTtcbiAgICAgICAgfVxuICAgICAgfSxcbiAgICAgIGxvZ2dlcjogZ2xvYmFsLmNvbnNvbGUubG9nLmJpbmQoY29uc29sZSksXG4gICAgICBkZXZUb29sczogZmFsc2VcbiAgICB9O1xuICB9KHR5cGVvZiBzZWxmICE9PSAndW5kZWZpbmVkJyA/IHNlbGYgOiBnbG9iYWwpO1xuXG4gIEludGVycHJldGVyLmludGVycHJldCA9IGludGVycHJldDtcbiAgcmV0dXJuIEludGVycHJldGVyO1xufSgpO1xuXG52YXIgcmVzb2x2ZVNwYXduT3B0aW9ucyA9IGZ1bmN0aW9uIChuYW1lT3JPcHRpb25zKSB7XG4gIGlmIChpc1N0cmluZyhuYW1lT3JPcHRpb25zKSkge1xuICAgIHJldHVybiBfX2Fzc2lnbihfX2Fzc2lnbih7fSwgREVGQVVMVF9TUEFXTl9PUFRJT05TKSwge1xuICAgICAgbmFtZTogbmFtZU9yT3B0aW9uc1xuICAgIH0pO1xuICB9XG5cbiAgcmV0dXJuIF9fYXNzaWduKF9fYXNzaWduKF9fYXNzaWduKHt9LCBERUZBVUxUX1NQQVdOX09QVElPTlMpLCB7XG4gICAgbmFtZTogdW5pcXVlSWQoKVxuICB9KSwgbmFtZU9yT3B0aW9ucyk7XG59O1xuXG5mdW5jdGlvbiBzcGF3bihlbnRpdHksIG5hbWVPck9wdGlvbnMpIHtcbiAgdmFyIHJlc29sdmVkT3B0aW9ucyA9IHJlc29sdmVTcGF3bk9wdGlvbnMobmFtZU9yT3B0aW9ucyk7XG4gIHJldHVybiBjb25zdW1lKGZ1bmN0aW9uIChzZXJ2aWNlKSB7XG4gICAgaWYgKCFJU19QUk9EVUNUSU9OKSB7XG4gICAgICB2YXIgaXNMYXp5RW50aXR5ID0gaXNNYWNoaW5lKGVudGl0eSkgfHwgaXNGdW5jdGlvbihlbnRpdHkpO1xuICAgICAgd2FybighIXNlcnZpY2UgfHwgaXNMYXp5RW50aXR5LCBcIkF0dGVtcHRlZCB0byBzcGF3biBhbiBBY3RvciAoSUQ6IFxcXCJcIiArIChpc01hY2hpbmUoZW50aXR5KSA/IGVudGl0eS5pZCA6ICd1bmRlZmluZWQnKSArIFwiXFxcIikgb3V0c2lkZSBvZiBhIHNlcnZpY2UuIFRoaXMgd2lsbCBoYXZlIG5vIGVmZmVjdC5cIik7XG4gICAgfVxuXG4gICAgaWYgKHNlcnZpY2UpIHtcbiAgICAgIHJldHVybiBzZXJ2aWNlLnNwYXduKGVudGl0eSwgcmVzb2x2ZWRPcHRpb25zLm5hbWUsIHJlc29sdmVkT3B0aW9ucyk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBjcmVhdGVEZWZlcnJlZEFjdG9yKGVudGl0eSwgcmVzb2x2ZWRPcHRpb25zLm5hbWUpO1xuICAgIH1cbiAgfSk7XG59XG4vKipcclxuICogQ3JlYXRlcyBhIG5ldyBJbnRlcnByZXRlciBpbnN0YW5jZSBmb3IgdGhlIGdpdmVuIG1hY2hpbmUgd2l0aCB0aGUgcHJvdmlkZWQgb3B0aW9ucywgaWYgYW55LlxyXG4gKlxyXG4gKiBAcGFyYW0gbWFjaGluZSBUaGUgbWFjaGluZSB0byBpbnRlcnByZXRcclxuICogQHBhcmFtIG9wdGlvbnMgSW50ZXJwcmV0ZXIgb3B0aW9uc1xyXG4gKi9cblxuXG5mdW5jdGlvbiBpbnRlcnByZXQobWFjaGluZSwgb3B0aW9ucykge1xuICB2YXIgaW50ZXJwcmV0ZXIgPSBuZXcgSW50ZXJwcmV0ZXIobWFjaGluZSwgb3B0aW9ucyk7XG4gIHJldHVybiBpbnRlcnByZXRlcjtcbn1cblxuZXhwb3J0IHsgSW50ZXJwcmV0ZXIsIEludGVycHJldGVyU3RhdHVzLCBpbnRlcnByZXQsIHNwYXduIH07IiwiaW1wb3J0IHsgX192YWx1ZXMsIF9fcmVhZCB9IGZyb20gJy4vX3ZpcnR1YWwvX3RzbGliLmpzJztcbmltcG9ydCB7IFN0YXRlIH0gZnJvbSAnLi9TdGF0ZS5qcyc7XG5cbmZ1bmN0aW9uIG1hdGNoU3RhdGUoc3RhdGUsIHBhdHRlcm5zLCBkZWZhdWx0VmFsdWUpIHtcbiAgdmFyIGVfMSwgX2E7XG5cbiAgdmFyIHJlc29sdmVkU3RhdGUgPSBTdGF0ZS5mcm9tKHN0YXRlLCBzdGF0ZSBpbnN0YW5jZW9mIFN0YXRlID8gc3RhdGUuY29udGV4dCA6IHVuZGVmaW5lZCk7XG5cbiAgdHJ5IHtcbiAgICBmb3IgKHZhciBwYXR0ZXJuc18xID0gX192YWx1ZXMocGF0dGVybnMpLCBwYXR0ZXJuc18xXzEgPSBwYXR0ZXJuc18xLm5leHQoKTsgIXBhdHRlcm5zXzFfMS5kb25lOyBwYXR0ZXJuc18xXzEgPSBwYXR0ZXJuc18xLm5leHQoKSkge1xuICAgICAgdmFyIF9iID0gX19yZWFkKHBhdHRlcm5zXzFfMS52YWx1ZSwgMiksXG4gICAgICAgICAgc3RhdGVWYWx1ZSA9IF9iWzBdLFxuICAgICAgICAgIGdldFZhbHVlID0gX2JbMV07XG5cbiAgICAgIGlmIChyZXNvbHZlZFN0YXRlLm1hdGNoZXMoc3RhdGVWYWx1ZSkpIHtcbiAgICAgICAgcmV0dXJuIGdldFZhbHVlKHJlc29sdmVkU3RhdGUpO1xuICAgICAgfVxuICAgIH1cbiAgfSBjYXRjaCAoZV8xXzEpIHtcbiAgICBlXzEgPSB7XG4gICAgICBlcnJvcjogZV8xXzFcbiAgICB9O1xuICB9IGZpbmFsbHkge1xuICAgIHRyeSB7XG4gICAgICBpZiAocGF0dGVybnNfMV8xICYmICFwYXR0ZXJuc18xXzEuZG9uZSAmJiAoX2EgPSBwYXR0ZXJuc18xLnJldHVybikpIF9hLmNhbGwocGF0dGVybnNfMSk7XG4gICAgfSBmaW5hbGx5IHtcbiAgICAgIGlmIChlXzEpIHRocm93IGVfMS5lcnJvcjtcbiAgICB9XG4gIH1cblxuICByZXR1cm4gZGVmYXVsdFZhbHVlKHJlc29sdmVkU3RhdGUpO1xufVxuXG5leHBvcnQgeyBtYXRjaFN0YXRlIH07IiwiZXhwb3J0IHsgbWF0Y2hlc1N0YXRlIH0gZnJvbSAnLi91dGlscy5qcyc7XG5leHBvcnQgeyBtYXBTdGF0ZSB9IGZyb20gJy4vbWFwU3RhdGUuanMnO1xuZXhwb3J0IHsgQWN0aW9uVHlwZXMsIFNwZWNpYWxUYXJnZXRzIH0gZnJvbSAnLi90eXBlcy5qcyc7XG5pbXBvcnQgeyByYWlzZSwgc2VuZCwgc2VuZFBhcmVudCwgc2VuZFVwZGF0ZSwgbG9nLCBjYW5jZWwsIHN0YXJ0LCBzdG9wLCBhc3NpZ24sIGFmdGVyLCBkb25lLCByZXNwb25kLCBmb3J3YXJkVG8sIGVzY2FsYXRlLCBjaG9vc2UsIHB1cmUgfSBmcm9tICcuL2FjdGlvbnMuanMnO1xuZXhwb3J0IHsgYXNzaWduLCBkb25lSW52b2tlLCBmb3J3YXJkVG8sIHNlbmQsIHNlbmRQYXJlbnQsIHNlbmRVcGRhdGUgfSBmcm9tICcuL2FjdGlvbnMuanMnO1xuZXhwb3J0IHsgU3RhdGUgfSBmcm9tICcuL1N0YXRlLmpzJztcbmV4cG9ydCB7IFN0YXRlTm9kZSB9IGZyb20gJy4vU3RhdGVOb2RlLmpzJztcbmV4cG9ydCB7IE1hY2hpbmUsIGNyZWF0ZU1hY2hpbmUgfSBmcm9tICcuL01hY2hpbmUuanMnO1xuZXhwb3J0IHsgSW50ZXJwcmV0ZXIsIEludGVycHJldGVyU3RhdHVzLCBpbnRlcnByZXQsIHNwYXduIH0gZnJvbSAnLi9pbnRlcnByZXRlci5qcyc7XG5leHBvcnQgeyBtYXRjaFN0YXRlIH0gZnJvbSAnLi9tYXRjaC5qcyc7XG52YXIgYWN0aW9ucyA9IHtcbiAgcmFpc2U6IHJhaXNlLFxuICBzZW5kOiBzZW5kLFxuICBzZW5kUGFyZW50OiBzZW5kUGFyZW50LFxuICBzZW5kVXBkYXRlOiBzZW5kVXBkYXRlLFxuICBsb2c6IGxvZyxcbiAgY2FuY2VsOiBjYW5jZWwsXG4gIHN0YXJ0OiBzdGFydCxcbiAgc3RvcDogc3RvcCxcbiAgYXNzaWduOiBhc3NpZ24sXG4gIGFmdGVyOiBhZnRlcixcbiAgZG9uZTogZG9uZSxcbiAgcmVzcG9uZDogcmVzcG9uZCxcbiAgZm9yd2FyZFRvOiBmb3J3YXJkVG8sXG4gIGVzY2FsYXRlOiBlc2NhbGF0ZSxcbiAgY2hvb3NlOiBjaG9vc2UsXG4gIHB1cmU6IHB1cmVcbn07XG5leHBvcnQgeyBhY3Rpb25zIH07Il0sIm5hbWVzIjpbInJhaXNlIiwic2VuZCIsInJhaXNlJDEiLCJzZW5kJDEiLCJsb2ciLCJsb2ckMSIsImNhbmNlbCIsImNhbmNlbCQxIiwic3RhcnQiLCJzdG9wIiwiYXNzaWduIiwiYXNzaWduJDEiLCJhZnRlciIsImVycm9yIiwicHVyZSIsImVycm9yJDEiLCJjaG9vc2UiLCJjaG9vc2UkMSIsInB1cmUkMSIsInN0b3AkMSIsImlzQWN0b3IiLCJ0b0ludm9rZVNvdXJjZSIsInN0YXJ0JDEiXSwibWFwcGluZ3MiOiJBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxJQUFJLFFBQVEsR0FBRyxZQUFZO0FBQzNCLEVBQUUsUUFBUSxHQUFHLE1BQU0sQ0FBQyxNQUFNLElBQUksU0FBUyxRQUFRLENBQUMsQ0FBQyxFQUFFO0FBQ25ELElBQUksS0FBSyxJQUFJLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxTQUFTLENBQUMsTUFBTSxFQUFFLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUU7QUFDekQsTUFBTSxDQUFDLEdBQUcsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQ3ZCO0FBQ0EsTUFBTSxLQUFLLElBQUksQ0FBQyxJQUFJLENBQUMsRUFBRSxJQUFJLE1BQU0sQ0FBQyxTQUFTLENBQUMsY0FBYyxD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SSxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUM7QUFDdkMsSUFBSSxJQUFJLENBQUMsR0FBRyxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBRyxJQUFJLElBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxJQUFJLElBQUksQ0FBQyxNQUFNLENBQUMsRUFBRSxJQUFJLFdBQVcsQ0FBQztBQUNyRixJQUFJLElBQUksQ0FBQyxPQUFPLEdBQUcsSUFBSSxDQUFDLE1BQU0sR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLE9BQU8sR0FBRyxJQUFJLENBQUM7QUFDNUQsSUFBSSxJQUFJLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQyxNQUFNLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsR0FBRyxFQUFFLENBQUM7QUFDckUsSUFBSSxJQUFJLENBQUMsU0FBUyxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsU0FBUyxLQUFLLElBQUksQ0FBQyxNQUFNLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxTQUFTLEdBQUcsZUFBZSxDQUFDLENBQUM7QUFDdEcsSUFBSSxJQUFJLENBQUMsRUFBRSxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsRUFBRSxJQUFJLFFBQVEsQ0FBQyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLEVBQUUsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUM7QUFDN0YsSUFBSSxJQUFJLENBQUMsT0FBTyxHQUFHLElBQUksQ0FBQyxNQUFNLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxPQUFPLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUM7QUFDM0UsSUFBSSxJQUFJLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxLQUFLLElBQUksQ0FBQyxNQUFNLENBQUMsUUFBUSxHQUFHLFVBQVUsR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLE1BQU0sSUFBSSxJQUFJLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQyxNQUFNLEdBQUcsVUFBVSxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsT0FBTyxHQUFHLFNBQVMsR0FBRyxRQUFRLENBQUMsQ0FBQztBQUMxTDtBQUNBLElBQUksSUFBSSxDQUFDLGFBQWEsRUFBRTtBQUN4QixNQUFNLElBQUksQ0FBQyxFQUFFLFVBQVUsSUFBSSxJQUFJLENBQUMsTUFBTSxDQUFDLEVBQUUsOEVBQThFLElBQUksSUFBSSxDQUFDLE1BQU0sQ0FBQyxRQUFRLEdBQUcsaUNBQWlDLEdBQUcsY0FBYyxHQUFHLElBQUksQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDLEdBQUcsaUNBQWlDLEdBQUcsSUFBSSxDQUFDLEVBQUUsR0FBRyxZQUFZLENBQUMsQ0FBQztBQUN2UixLQUFLO0FBQ0w7QUFDQSxJQUFJLElBQUksQ0FBQyxPQUFPLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUM7QUFDdkMsSUFBSSxJQUFJLENBQUMsTUFBTSxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsTUFBTSxHQUFHLFNBQVMsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLE1BQU0sRUFBRSxVQUFVLFdBQVcsRUFBRSxHQUFHLEVBQUU7QUFDakcsTUFBTSxJQUFJLEVBQUUsQ0FBQztBQUNiO0FBQ0EsTUFBTSxJQUFJLFNBQVMsR0FBRyxJQUFJLFNBQVMsQ0FBQyxXQUFXLEVBQUU7QUFDakQsUUFBUSxPQUFPLEVBQUUsS0FBSztBQUN0QixRQUFRLElBQUksRUFBRSxHQUFHO0FBQ2pCLE9BQU8sQ0FBQyxDQUFDO0FBQ1QsTUFBTSxNQUFNLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxLQUFLLEVBQUUsUUFBUSxFQUFFLEVBQUUsR0FBRyxFQUFFLEVBQUUsRUFBRSxDQUFDLFNBQVMsQ0FBQyxFQUFFLENBQUMsR0FBRyxTQUFTLEVBQUUsRUFBRSxHQUFHLFNBQVMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDO0FBQ3pHLE1BQU0sT0FBTyxTQUFTLENBQUM7QUFDdkIsS0FBSyxDQUFDLEdBQUcsWUFBWSxDQUFDO0FBQ3RCO0FBQ0EsSUFBSSxJQUFJLEtBQUssR0FBRyxDQUFDLENBQUM7QUFDbEI7QUFDQSxJQUFJLFNBQVMsR0FBRyxDQUFDLFNBQVMsRUFBRTtBQUM1QixNQUFNLElBQUksR0FBRyxFQUFFLEVBQUUsQ0FBQztBQUNsQjtBQUNBLE1BQU0sU0FBUyxDQUFDLEtBQUssR0FBRyxLQUFLLEVBQUUsQ0FBQztBQUNoQztBQUNBLE1BQU0sSUFBSTtBQUNWLFFBQVEsS0FBSyxJQUFJLEVBQUUsR0FBRyxRQUFRLENBQUMsV0FBVyxDQUFDLFNBQVMsQ0FBQyxDQUFDLEVBQUUsRUFBRSxHQUFHLEVBQUUsQ0FBQyxJQUFJLEVBQUUsRUFBRSxDQUFDLEVBQUUsQ0FBQyxJQUFJLEVBQUUsRUFBRSxHQUFHLEVBQUUsQ0FBQyxJQUFJLEVBQUUsRUFBRTtBQUNsRyxVQUFVLElBQUksS0FBSyxHQUFHLEVBQUUsQ0FBQyxLQUFLLENBQUM7QUFDL0IsVUFBVSxHQUFHLENBQUMsS0FBSyxDQUFDLENBQUM7QUFDckIsU0FBUztBQUNULE9BQU8sQ0FBQyxPQUFPLEtBQUssRUFBRTtBQUN0QixRQUFRLEdBQUcsR0FBRztBQUNkLFVBQVUsS0FBSyxFQUFFLEtBQUs7QUFDdEIsU0FBUyxDQUFDO0FBQ1YsT0FBTyxTQUFTO0FBQ2hCLFFBQVEsSUFBSTtBQUNaLFVBQVUsSUFBSSxFQUFFLElBQUksQ0FBQyxFQUFFLENBQUMsSUFBSSxLQUFLLEVBQUUsR0FBRyxFQUFFLENBQUMsTUFBTSxDQUFDLEVBQUUsRUFBRSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQztBQUM5RCxTQUFTLFNBQVM7QUFDbEIsVUFBVSxJQUFJLEdBQUcsRUFBRSxNQUFNLEdBQUcsQ0FBQyxLQUFLLENBQUM7QUFDbkMsU0FBUztBQUNULE9BQU87QUFDUCxLQUFLO0FBQ0w7QUFDQSxJQUFJLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUNkO0FBQ0EsSUFBSSxJQUFJLENBQUMsT0FBTyxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsT0FBTyxLQUFLLElBQUksR0FBRyxTQUFTLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxPQUFPLElBQUksS0FBSyxDQUFDO0FBQzNGLElBQUksSUFBSSxDQUFDLFVBQVUsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxNQUFNLEtBQUssQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLEVBQUUsR0FBRyxLQUFLLEdBQUcsS0FBSyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQyxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxVQUFVLEVBQUUsRUFBRTtBQUMzSSxNQUFNLElBQUksS0FBSyxHQUFHLEVBQUUsQ0FBQyxLQUFLLENBQUM7QUFDM0IsTUFBTSxPQUFPLEtBQUssS0FBSyxVQUFVLENBQUM7QUFDbEMsS0FBSyxDQUFDLEdBQUcsVUFBVSxJQUFJLElBQUksQ0FBQyxNQUFNLENBQUMsRUFBRSxDQUFDLENBQUM7QUFDdkMsSUFBSSxJQUFJLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQztBQUN2QztBQUNBLElBQUksSUFBSSxDQUFDLE9BQU8sR0FBRyxPQUFPLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxLQUFLLElBQUksSUFBSSxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsQ0FBQyxHQUFHLENBQUMsVUFBVSxNQUFNLEVBQUU7QUFDM0YsTUFBTSxPQUFPLGNBQWMsQ0FBQyxNQUFNLENBQUMsQ0FBQztBQUNwQyxLQUFLLENBQUMsQ0FBQztBQUNQO0FBQ0EsSUFBSSxJQUFJLENBQUMsTUFBTSxHQUFHLE9BQU8sQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksSUFBSSxJQUFJLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxDQUFDLEdBQUcsQ0FBQyxVQUFVLE1BQU0sRUFBRTtBQUN4RixNQUFNLE9BQU8sY0FBYyxDQUFDLE1BQU0sQ0FBQyxDQUFDO0FBQ3BDLEtBQUssQ0FBQyxDQUFDO0FBQ1AsSUFBSSxJQUFJLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDO0FBQ2pDLElBQUksSUFBSSxDQUFDLFFBQVEsR0FBRyxJQUFJLENBQUMsSUFBSSxLQUFLLE9BQU8sR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksR0FBRyxTQUFTLENBQUM7QUFDekUsSUFBSSxJQUFJLENBQUMsTUFBTSxHQUFHLE9BQU8sQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxDQUFDLEdBQUcsQ0FBQyxVQUFVLFlBQVksRUFBRSxDQUFDLEVBQUU7QUFDN0UsTUFBTSxJQUFJLEVBQUUsRUFBRSxFQUFFLENBQUM7QUFDakI7QUFDQSxNQUFNLElBQUksU0FBUyxDQUFDLFlBQVksQ0FBQyxFQUFFO0FBQ25DLFFBQVEsS0FBSyxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsUUFBUSxHQUFHLFFBQVEsRUFBRSxFQUFFLEdBQUcsRUFBRSxFQUFFLEVBQUUsQ0FBQyxZQUFZLENBQUMsRUFBRSxDQUFDLEdBQUcsWUFBWSxFQUFFLEVBQUUsR0FBRyxLQUFLLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxRQUFRLENBQUMsQ0FBQztBQUNySSxRQUFRLE9BQU8sa0JBQWtCLENBQUM7QUFDbEMsVUFBVSxHQUFHLEVBQUUsWUFBWSxDQUFDLEVBQUU7QUFDOUIsVUFBVSxFQUFFLEVBQUUsWUFBWSxDQUFDLEVBQUU7QUFDN0IsU0FBUyxDQUFDLENBQUM7QUFDWCxPQUFPLE1BQU0sSUFBSSxRQUFRLENBQUMsWUFBWSxDQUFDLEdBQUcsQ0FBQyxFQUFFO0FBQzdDLFFBQVEsT0FBTyxrQkFBa0IsQ0FBQyxRQUFRLENBQUMsUUFBUSxDQUFDLEVBQUUsRUFBRSxZQUFZLENBQUMsRUFBRTtBQUN2RSxVQUFVLEVBQUUsRUFBRSxZQUFZLENBQUMsRUFBRSxJQUFJLFlBQVksQ0FBQyxHQUFHO0FBQ2pELFVBQVUsR0FBRyxFQUFFLFlBQVksQ0FBQyxHQUFHO0FBQy9CLFNBQVMsQ0FBQyxDQUFDLENBQUM7QUFDWixPQUFPLE1BQU0sSUFBSSxTQUFTLENBQUMsWUFBWSxDQUFDLEdBQUcsQ0FBQyxJQUFJLFVBQVUsQ0FBQyxZQUFZLENBQUMsR0FBRyxDQUFDLEVBQUU7QUFDOUUsUUFBUSxJQUFJLFNBQVMsR0FBRyxLQUFLLENBQUMsRUFBRSxHQUFHLGNBQWMsR0FBRyxDQUFDLEdBQUcsR0FBRyxDQUFDO0FBQzVEO0FBQ0EsUUFBUSxLQUFLLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxRQUFRLEdBQUcsUUFBUSxFQUFFLEVBQUUsR0FBRyxFQUFFLEVBQUUsRUFBRSxDQUFDLFNBQVMsQ0FBQyxHQUFHLFlBQVksQ0FBQyxHQUFHLEVBQUUsRUFBRSxHQUFHLEtBQUssQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQyxDQUFDO0FBQ25JLFFBQVEsT0FBTyxrQkFBa0IsQ0FBQyxRQUFRLENBQUMsUUFBUSxDQUFDO0FBQ3BELFVBQVUsRUFBRSxFQUFFLFNBQVM7QUFDdkIsU0FBUyxFQUFFLFlBQVksQ0FBQyxFQUFFO0FBQzFCLFVBQVUsR0FBRyxFQUFFLFNBQVM7QUFDeEIsU0FBUyxDQUFDLENBQUMsQ0FBQztBQUNaLE9BQU8sTUFBTTtBQUNiLFFBQVEsSUFBSSxZQUFZLEdBQUcsWUFBWSxDQUFDLEdBQUcsQ0FBQztBQUM1QyxRQUFRLE9BQU8sa0JBQWtCLENBQUMsUUFBUSxDQUFDLFFBQVEsQ0FBQztBQUNwRCxVQUFVLEVBQUUsRUFBRSxZQUFZLENBQUMsSUFBSTtBQUMvQixTQUFTLEVBQUUsWUFBWSxDQUFDLEVBQUU7QUFDMUIsVUFBVSxHQUFHLEVBQUUsWUFBWTtBQUMzQixTQUFTLENBQUMsQ0FBQyxDQUFDO0FBQ1osT0FBTztBQUNQLEtBQUssQ0FBQyxDQUFDO0FBQ1AsSUFBSSxJQUFJLENBQUMsVUFBVSxHQUFHLE9BQU8sQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLFVBQVUsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsR0FBRyxDQUFDLFVBQVUsUUFBUSxFQUFFO0FBQ2xHLE1BQU0sT0FBTyxvQkFBb0IsQ0FBQyxRQUFRLENBQUMsQ0FBQztBQUM1QyxLQUFLLENBQUMsQ0FBQztBQUNQLElBQUksSUFBSSxDQUFDLFVBQVUsR0FBRyxJQUFJLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUNqRDtBQUNBO0FBQ0E7QUFDQTtBQUNBLEdBQUc7QUFDSDtBQUNBLEVBQUUsU0FBUyxDQUFDLFNBQVMsQ0FBQyxLQUFLLEdBQUcsWUFBWTtBQUMxQyxJQUFJLElBQUksSUFBSSxDQUFDLE9BQU8sQ0FBQyxXQUFXLEVBQUU7QUFDbEMsTUFBTSxPQUFPO0FBQ2IsS0FBSztBQUNMO0FBQ0EsSUFBSSxnQkFBZ0IsQ0FBQyxJQUFJLENBQUMsQ0FBQyxPQUFPLENBQUMsVUFBVSxTQUFTLEVBQUU7QUFDeEQsTUFBTSxPQUFPLFNBQVMsQ0FBQyxFQUFFLENBQUM7QUFDMUIsS0FBSyxDQUFDLENBQUM7QUFDUCxHQUFHLENBQUM7QUFDSjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsRUFBRSxTQUFTLENBQUMsU0FBUyxDQUFDLFVBQVUsR0FBRyxVQUFVLE9BQU8sRUFBRSxPQUFPLEVBQUU7QUFDL0QsSUFBSSxJQUFJLE9BQU8sS0FBSyxLQUFLLENBQUMsRUFBRTtBQUM1QixNQUFNLE9BQU8sR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDO0FBQzdCLEtBQUs7QUFDTDtBQUNBLElBQUksSUFBSSxFQUFFLEdBQUcsSUFBSSxDQUFDLE9BQU87QUFDekIsUUFBUSxPQUFPLEdBQUcsRUFBRSxDQUFDLE9BQU87QUFDNUIsUUFBUSxVQUFVLEdBQUcsRUFBRSxDQUFDLFVBQVU7QUFDbEMsUUFBUSxNQUFNLEdBQUcsRUFBRSxDQUFDLE1BQU07QUFDMUIsUUFBUSxRQUFRLEdBQUcsRUFBRSxDQUFDLFFBQVE7QUFDOUIsUUFBUSxNQUFNLEdBQUcsRUFBRSxDQUFDLE1BQU0sQ0FBQztBQUMzQixJQUFJLE9BQU8sSUFBSSxTQUFTLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRTtBQUN0QyxNQUFNLE9BQU8sRUFBRSxRQUFRLENBQUMsUUFBUSxDQUFDLEVBQUUsRUFBRSxPQUFPLENBQUMsRUFBRSxPQUFPLENBQUMsT0FBTyxDQUFDO0FBQy9ELE1BQU0sVUFBVSxFQUFFLFFBQVEsQ0FBQyxRQUFRLENBQUMsRUFBRSxFQUFFLFVBQVUsQ0FBQyxFQUFFLE9BQU8sQ0FBQyxVQUFVLENBQUM7QUFDeEUsTUFBTSxNQUFNLEVBQUUsUUFBUSxDQUFDLFFBQVEsQ0FBQyxFQUFFLEVBQUUsTUFBTSxDQUFDLEVBQUUsT0FBTyxDQUFDLE1BQU0sQ0FBQztBQUM1RCxNQUFNLFFBQVEsRUFBRSxRQUFRLENBQUMsUUFBUSxDQUFDLEVBQUUsRUFBRSxRQUFRLENBQUMsRUFBRSxPQUFPLENBQUMsUUFBUSxDQUFDO0FBQ2xFLE1BQU0sTUFBTSxFQUFFLFFBQVEsQ0FBQyxRQUFRLENBQUMsRUFBRSxFQUFFLE1BQU0sQ0FBQyxFQUFFLE9BQU8sQ0FBQyxNQUFNLENBQUM7QUFDNUQsS0FBSyxFQUFFLE9BQU8sQ0FBQyxDQUFDO0FBQ2hCLEdBQUcsQ0FBQztBQUNKO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsRUFBRSxTQUFTLENBQUMsU0FBUyxDQUFDLFdBQVcsR0FBRyxVQUFVLE9BQU8sRUFBRTtBQUN2RCxJQUFJLE9BQU8sSUFBSSxTQUFTLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRSxJQUFJLENBQUMsT0FBTyxFQUFFLE9BQU8sQ0FBQyxDQUFDO0FBQzdELEdBQUcsQ0FBQztBQUNKO0FBQ0EsRUFBRSxNQUFNLENBQUMsY0FBYyxDQUFDLFNBQVMsQ0FBQyxTQUFTLEVBQUUsWUFBWSxFQUFFO0FBQzNEO0FBQ0E7QUFDQTtBQUNBLElBQUksR0FBRyxFQUFFLFlBQVk7QUFDckIsTUFBTSxPQUFPO0FBQ2IsUUFBUSxFQUFFLEVBQUUsSUFBSSxDQUFDLEVBQUU7QUFDbkIsUUFBUSxHQUFHLEVBQUUsSUFBSSxDQUFDLEdBQUc7QUFDckIsUUFBUSxPQUFPLEVBQUUsSUFBSSxDQUFDLE9BQU87QUFDN0IsUUFBUSxPQUFPLEVBQUUsSUFBSSxDQUFDLE9BQU87QUFDN0IsUUFBUSxJQUFJLEVBQUUsSUFBSSxDQUFDLElBQUk7QUFDdkIsUUFBUSxPQUFPLEVBQUUsSUFBSSxDQUFDLE9BQU87QUFDN0IsUUFBUSxPQUFPLEVBQUUsSUFBSSxDQUFDLE9BQU87QUFDN0IsUUFBUSxNQUFNLEVBQUUsU0FBUyxDQUFDLElBQUksQ0FBQyxNQUFNLEVBQUUsVUFBVSxLQUFLLEVBQUU7QUFDeEQsVUFBVSxPQUFPLEtBQUssQ0FBQyxVQUFVLENBQUM7QUFDbEMsU0FBUyxDQUFDO0FBQ1YsUUFBUSxFQUFFLEVBQUUsSUFBSSxDQUFDLEVBQUU7QUFDbkIsUUFBUSxXQUFXLEVBQUUsSUFBSSxDQUFDLFdBQVc7QUFDckMsUUFBUSxLQUFLLEVBQUUsSUFBSSxDQUFDLE9BQU87QUFDM0IsUUFBUSxJQUFJLEVBQUUsSUFBSSxDQUFDLE1BQU07QUFDekIsUUFBUSxVQUFVLEVBQUUsSUFBSSxDQUFDLFVBQVUsSUFBSSxFQUFFO0FBQ3pDLFFBQVEsSUFBSSxFQUFFLElBQUksQ0FBQyxJQUFJO0FBQ3ZCLFFBQVEsS0FBSyxFQUFFLElBQUksQ0FBQyxLQUFLLElBQUksQ0FBQyxDQUFDO0FBQy9CLFFBQVEsSUFBSSxFQUFFLElBQUksQ0FBQyxRQUFRO0FBQzNCLFFBQVEsTUFBTSxFQUFFLElBQUksQ0FBQyxNQUFNO0FBQzNCLE9BQU8sQ0FBQztBQUNSLEtBQUs7QUFDTCxJQUFJLFVBQVUsRUFBRSxLQUFLO0FBQ3JCLElBQUksWUFBWSxFQUFFLElBQUk7QUFDdEIsR0FBRyxDQUFDLENBQUM7QUFDTDtBQUNBLEVBQUUsU0FBUyxDQUFDLFNBQVMsQ0FBQyxNQUFNLEdBQUcsWUFBWTtBQUMzQyxJQUFJLE9BQU8sSUFBSSxDQUFDLFVBQVUsQ0FBQztBQUMzQixHQUFHLENBQUM7QUFDSjtBQUNBLEVBQUUsTUFBTSxDQUFDLGNBQWMsQ0FBQyxTQUFTLENBQUMsU0FBUyxFQUFFLElBQUksRUFBRTtBQUNuRDtBQUNBO0FBQ0E7QUFDQSxJQUFJLEdBQUcsRUFBRSxZQUFZO0FBQ3JCLE1BQU0sSUFBSSxJQUFJLENBQUMsT0FBTyxDQUFDLEVBQUUsRUFBRTtBQUMzQixRQUFRLE9BQU8sSUFBSSxDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUM7QUFDL0IsT0FBTztBQUNQO0FBQ0EsTUFBTSxJQUFJLFdBQVcsR0FBRyxJQUFJLENBQUMsV0FBVyxDQUFDO0FBQ3pDLE1BQU0sT0FBTyxJQUFJLENBQUMsT0FBTyxDQUFDLEVBQUUsR0FBRyxXQUFXLENBQUMsTUFBTSxDQUFDLFVBQVUsR0FBRyxFQUFFLFVBQVUsRUFBRTtBQUM3RSxRQUFRLEdBQUcsQ0FBQyxVQUFVLENBQUMsU0FBUyxDQUFDLEdBQUcsR0FBRyxDQUFDLFVBQVUsQ0FBQyxTQUFTLENBQUMsSUFBSSxFQUFFLENBQUM7QUFDcEUsUUFBUSxHQUFHLENBQUMsVUFBVSxDQUFDLFNBQVMsQ0FBQyxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQztBQUNuRCxRQUFRLE9BQU8sR0FBRyxDQUFDO0FBQ25CLE9BQU8sRUFBRSxFQUFFLENBQUMsQ0FBQztBQUNiLEtBQUs7QUFDTCxJQUFJLFVBQVUsRUFBRSxLQUFLO0FBQ3JCLElBQUksWUFBWSxFQUFFLElBQUk7QUFDdEIsR0FBRyxDQUFDLENBQUM7QUFDTCxFQUFFLE1BQU0sQ0FBQyxjQUFjLENBQUMsU0FBUyxDQUFDLFNBQVMsRUFBRSxPQUFPLEVBQUU7QUFDdEQsSUFBSSxHQUFHLEVBQUUsWUFBWTtBQUNyQixNQUFNLE9BQU8sSUFBSSxDQUFDLE9BQU8sQ0FBQyxrQkFBa0IsS0FBSyxJQUFJLENBQUMsT0FBTyxDQUFDLGtCQUFrQixHQUFHLElBQUksQ0FBQyxxQkFBcUIsRUFBRSxFQUFFLElBQUksQ0FBQyxPQUFPLENBQUMsa0JBQWtCLENBQUMsQ0FBQztBQUNsSixLQUFLO0FBQ0wsSUFBSSxVQUFVLEVBQUUsS0FBSztBQUNyQixJQUFJLFlBQVksRUFBRSxJQUFJO0FBQ3RCLEdBQUcsQ0FBQyxDQUFDO0FBQ0wsRUFBRSxNQUFNLENBQUMsY0FBYyxDQUFDLFNBQVMsQ0FBQyxTQUFTLEVBQUUsYUFBYSxFQUFFO0FBQzVEO0FBQ0E7QUFDQTtBQUNBLElBQUksR0FBRyxFQUFFLFlBQVk7QUFDckIsTUFBTSxPQUFPLElBQUksQ0FBQyxPQUFPLENBQUMsV0FBVyxLQUFLLElBQUksQ0FBQyxPQUFPLENBQUMsV0FBVyxHQUFHLElBQUksQ0FBQyxpQkFBaUIsRUFBRSxFQUFFLElBQUksQ0FBQyxPQUFPLENBQUMsV0FBVyxDQUFDLENBQUM7QUFDekgsS0FBSztBQUNMLElBQUksVUFBVSxFQUFFLEtBQUs7QUFDckIsSUFBSSxZQUFZLEVBQUUsSUFBSTtBQUN0QixHQUFHLENBQUMsQ0FBQztBQUNMO0FBQ0EsRUFBRSxTQUFTLENBQUMsU0FBUyxDQUFDLGFBQWEsR0FBRyxVQUFVLFNBQVMsRUFBRTtBQUMzRCxJQUFJLElBQUksSUFBSSxDQUFDLE9BQU8sQ0FBQyxVQUFVLENBQUMsU0FBUyxDQUFDLEVBQUU7QUFDNUMsTUFBTSxPQUFPLElBQUksQ0FBQyxPQUFPLENBQUMsVUFBVSxDQUFDLFNBQVMsQ0FBQyxDQUFDO0FBQ2hELEtBQUs7QUFDTDtBQUNBLElBQUksSUFBSSxTQUFTLEdBQUcsU0FBUyxLQUFLLFVBQVUsQ0FBQztBQUM3QyxJQUFJLElBQUksVUFBVSxHQUFHLElBQUksQ0FBQyxXQUFXLENBQUMsTUFBTSxDQUFDLFVBQVUsVUFBVSxFQUFFO0FBQ25FLE1BQU0sSUFBSSxhQUFhLEdBQUcsVUFBVSxDQUFDLFNBQVMsS0FBSyxTQUFTLENBQUM7QUFDN0Q7QUFDQSxNQUFNLE9BQU8sU0FBUyxHQUFHLGFBQWEsR0FBRyxhQUFhLElBQUksVUFBVSxDQUFDLFNBQVMsS0FBSyxRQUFRLENBQUM7QUFDNUYsS0FBSyxDQUFDLENBQUM7QUFDUCxJQUFJLElBQUksQ0FBQyxPQUFPLENBQUMsVUFBVSxDQUFDLFNBQVMsQ0FBQyxHQUFHLFVBQVUsQ0FBQztBQUNwRCxJQUFJLE9BQU8sVUFBVSxDQUFDO0FBQ3RCLEdBQUcsQ0FBQztBQUNKO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxFQUFFLFNBQVMsQ0FBQyxTQUFTLENBQUMscUJBQXFCLEdBQUcsWUFBWTtBQUMxRCxJQUFJLElBQUksS0FBSyxHQUFHLElBQUksQ0FBQztBQUNyQjtBQUNBLElBQUksSUFBSSxXQUFXLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUM7QUFDeEM7QUFDQSxJQUFJLElBQUksQ0FBQyxXQUFXLEVBQUU7QUFDdEIsTUFBTSxPQUFPLEVBQUUsQ0FBQztBQUNoQixLQUFLO0FBQ0w7QUFDQSxJQUFJLElBQUksZUFBZSxHQUFHLFVBQVUsS0FBSyxFQUFFLENBQUMsRUFBRTtBQUM5QyxNQUFNLElBQUksUUFBUSxHQUFHLFVBQVUsQ0FBQyxLQUFLLENBQUMsR0FBRyxLQUFLLENBQUMsRUFBRSxHQUFHLFNBQVMsR0FBRyxDQUFDLEdBQUcsR0FBRyxHQUFHLEtBQUssQ0FBQztBQUNoRixNQUFNLElBQUksU0FBUyxHQUFHVCxPQUFLLENBQUMsUUFBUSxFQUFFLEtBQUssQ0FBQyxFQUFFLENBQUMsQ0FBQztBQUNoRDtBQUNBLE1BQU0sS0FBSyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUNYLE1BQUksQ0FBQyxTQUFTLEVBQUU7QUFDekMsUUFBUSxLQUFLLEVBQUUsS0FBSztBQUNwQixPQUFPLENBQUMsQ0FBQyxDQUFDO0FBQ1Y7QUFDQSxNQUFNLEtBQUssQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDSyxRQUFNLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQztBQUMzQztBQUNBLE1BQU0sT0FBTyxTQUFTLENBQUM7QUFDdkIsS0FBSyxDQUFDO0FBQ047QUFDQSxJQUFJLElBQUksa0JBQWtCLEdBQUcsT0FBTyxDQUFDLFdBQVcsQ0FBQyxHQUFHLFdBQVcsQ0FBQyxHQUFHLENBQUMsVUFBVSxVQUFVLEVBQUUsQ0FBQyxFQUFFO0FBQzdGLE1BQU0sSUFBSSxTQUFTLEdBQUcsZUFBZSxDQUFDLFVBQVUsQ0FBQyxLQUFLLEVBQUUsQ0FBQyxDQUFDLENBQUM7QUFDM0QsTUFBTSxPQUFPLFFBQVEsQ0FBQyxRQUFRLENBQUMsRUFBRSxFQUFFLFVBQVUsQ0FBQyxFQUFFO0FBQ2hELFFBQVEsS0FBSyxFQUFFLFNBQVM7QUFDeEIsT0FBTyxDQUFDLENBQUM7QUFDVCxLQUFLLENBQUMsR0FBRyxPQUFPLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxVQUFVLEtBQUssRUFBRSxDQUFDLEVBQUU7QUFDM0QsTUFBTSxJQUFJLGdCQUFnQixHQUFHLFdBQVcsQ0FBQyxLQUFLLENBQUMsQ0FBQztBQUNoRCxNQUFNLElBQUksa0JBQWtCLEdBQUcsUUFBUSxDQUFDLGdCQUFnQixDQUFDLEdBQUc7QUFDNUQsUUFBUSxNQUFNLEVBQUUsZ0JBQWdCO0FBQ2hDLE9BQU8sR0FBRyxnQkFBZ0IsQ0FBQztBQUMzQixNQUFNLElBQUksYUFBYSxHQUFHLENBQUMsS0FBSyxDQUFDLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxLQUFLLEdBQUcsS0FBSyxDQUFDO0FBQzFELE1BQU0sSUFBSSxTQUFTLEdBQUcsZUFBZSxDQUFDLGFBQWEsRUFBRSxDQUFDLENBQUMsQ0FBQztBQUN4RCxNQUFNLE9BQU8sT0FBTyxDQUFDLGtCQUFrQixDQUFDLENBQUMsR0FBRyxDQUFDLFVBQVUsVUFBVSxFQUFFO0FBQ25FLFFBQVEsT0FBTyxRQUFRLENBQUMsUUFBUSxDQUFDLEVBQUUsRUFBRSxVQUFVLENBQUMsRUFBRTtBQUNsRCxVQUFVLEtBQUssRUFBRSxTQUFTO0FBQzFCLFVBQVUsS0FBSyxFQUFFLGFBQWE7QUFDOUIsU0FBUyxDQUFDLENBQUM7QUFDWCxPQUFPLENBQUMsQ0FBQztBQUNULEtBQUssQ0FBQyxDQUFDLENBQUM7QUFDUixJQUFJLE9BQU8sa0JBQWtCLENBQUMsR0FBRyxDQUFDLFVBQVUsaUJBQWlCLEVBQUU7QUFDL0QsTUFBTSxJQUFJLEtBQUssR0FBRyxpQkFBaUIsQ0FBQyxLQUFLLENBQUM7QUFDMUMsTUFBTSxPQUFPLFFBQVEsQ0FBQyxRQUFRLENBQUMsRUFBRSxFQUFFLEtBQUssQ0FBQyxnQkFBZ0IsQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDLEVBQUU7QUFDL0UsUUFBUSxLQUFLLEVBQUUsS0FBSztBQUNwQixPQUFPLENBQUMsQ0FBQztBQUNULEtBQUssQ0FBQyxDQUFDO0FBQ1AsR0FBRyxDQUFDO0FBQ0o7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxFQUFFLFNBQVMsQ0FBQyxTQUFTLENBQUMsYUFBYSxHQUFHLFVBQVUsS0FBSyxFQUFFO0FBQ3ZELElBQUksSUFBSSxFQUFFLENBQUM7QUFDWDtBQUNBLElBQUksSUFBSSxLQUFLLEdBQUcsSUFBSSxDQUFDO0FBQ3JCO0FBQ0EsSUFBSSxJQUFJLENBQUMsS0FBSyxFQUFFO0FBQ2hCLE1BQU0sT0FBTyxFQUFFLENBQUM7QUFDaEIsS0FBSztBQUNMO0FBQ0EsSUFBSSxJQUFJLFVBQVUsR0FBRyxLQUFLLFlBQVksS0FBSyxHQUFHLEtBQUssQ0FBQyxLQUFLLEdBQUcsWUFBWSxDQUFDLEtBQUssRUFBRSxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUM7QUFDaEc7QUFDQSxJQUFJLElBQUksUUFBUSxDQUFDLFVBQVUsQ0FBQyxFQUFFO0FBQzlCLE1BQU0sSUFBSSxpQkFBaUIsR0FBRyxJQUFJLENBQUMsWUFBWSxDQUFDLFVBQVUsQ0FBQyxDQUFDLE9BQU8sQ0FBQztBQUNwRSxNQUFNLE9BQU8saUJBQWlCLEtBQUssU0FBUyxHQUFHLElBQUksQ0FBQyxhQUFhLEVBQUUsRUFBRSxHQUFHLEVBQUUsRUFBRSxFQUFFLENBQUMsVUFBVSxDQUFDLEdBQUcsaUJBQWlCLEVBQUUsRUFBRSxFQUFFLEdBQUcsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUM7QUFDakosS0FBSztBQUNMO0FBQ0EsSUFBSSxJQUFJLFlBQVksR0FBRyxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUM7QUFDeEMsSUFBSSxJQUFJLGFBQWEsR0FBRyxZQUFZLENBQUMsR0FBRyxDQUFDLFVBQVUsV0FBVyxFQUFFO0FBQ2hFLE1BQU0sT0FBTyxLQUFLLENBQUMsWUFBWSxDQUFDLFdBQVcsQ0FBQyxDQUFDO0FBQzdDLEtBQUssQ0FBQyxDQUFDO0FBQ1AsSUFBSSxPQUFPLGFBQWEsQ0FBQyxNQUFNLENBQUMsWUFBWSxDQUFDLE1BQU0sQ0FBQyxVQUFVLGdCQUFnQixFQUFFLFdBQVcsRUFBRTtBQUM3RixNQUFNLElBQUksWUFBWSxHQUFHLEtBQUssQ0FBQyxZQUFZLENBQUMsV0FBVyxDQUFDLENBQUMsYUFBYSxDQUFDLFVBQVUsQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDO0FBQ2hHO0FBQ0EsTUFBTSxPQUFPLGdCQUFnQixDQUFDLE1BQU0sQ0FBQyxZQUFZLENBQUMsQ0FBQztBQUNuRCxLQUFLLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQztBQUNaLEdBQUcsQ0FBQztBQUNKO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsRUFBRSxTQUFTLENBQUMsU0FBUyxDQUFDLE9BQU8sR0FBRyxVQUFVLEtBQUssRUFBRTtBQUNqRCxJQUFJLElBQUksU0FBUyxHQUFHLFlBQVksQ0FBQyxLQUFLLENBQUMsQ0FBQztBQUN4QyxJQUFJLE9BQU8sSUFBSSxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsU0FBUyxDQUFDLENBQUM7QUFDM0MsR0FBRyxDQUFDO0FBQ0o7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsRUFBRSxTQUFTLENBQUMsU0FBUyxDQUFDLFlBQVksR0FBRyxVQUFVLEtBQUssRUFBRTtBQUN0RCxJQUFJLElBQUksYUFBYSxHQUFHLEtBQUssQ0FBQyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsRUFBRSxFQUFFLElBQUksQ0FBQyxhQUFhLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUMxRixJQUFJLE9BQU8sSUFBSSxLQUFLLENBQUMsUUFBUSxDQUFDLFFBQVEsQ0FBQyxFQUFFLEVBQUUsS0FBSyxDQUFDLEVBQUU7QUFDbkQsTUFBTSxLQUFLLEVBQUUsSUFBSSxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDO0FBQ3RDLE1BQU0sYUFBYSxFQUFFLGFBQWE7QUFDbEMsS0FBSyxDQUFDLENBQUMsQ0FBQztBQUNSLEdBQUcsQ0FBQztBQUNKO0FBQ0EsRUFBRSxTQUFTLENBQUMsU0FBUyxDQUFDLGtCQUFrQixHQUFHLFVBQVUsVUFBVSxFQUFFLEtBQUssRUFBRSxNQUFNLEVBQUU7QUFDaEYsSUFBSSxJQUFJLFNBQVMsR0FBRyxJQUFJLENBQUMsWUFBWSxDQUFDLFVBQVUsQ0FBQyxDQUFDO0FBQ2xELElBQUksSUFBSSxJQUFJLEdBQUcsU0FBUyxDQUFDLElBQUksQ0FBQyxLQUFLLEVBQUUsTUFBTSxDQUFDLENBQUM7QUFDN0M7QUFDQSxJQUFJLElBQUksQ0FBQyxJQUFJLElBQUksQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLE1BQU0sRUFBRTtBQUMzQyxNQUFNLE9BQU8sSUFBSSxDQUFDLElBQUksQ0FBQyxLQUFLLEVBQUUsTUFBTSxDQUFDLENBQUM7QUFDdEMsS0FBSztBQUNMO0FBQ0EsSUFBSSxPQUFPLElBQUksQ0FBQztBQUNoQixHQUFHLENBQUM7QUFDSjtBQUNBLEVBQUUsU0FBUyxDQUFDLFNBQVMsQ0FBQyxzQkFBc0IsR0FBRyxVQUFVLFVBQVUsRUFBRSxLQUFLLEVBQUUsTUFBTSxFQUFFO0FBQ3BGLElBQUksSUFBSSxZQUFZLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDO0FBQ3hDLElBQUksSUFBSSxTQUFTLEdBQUcsSUFBSSxDQUFDLFlBQVksQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUN2RDtBQUNBLElBQUksSUFBSSxJQUFJLEdBQUcsU0FBUyxDQUFDLFdBQVcsQ0FBQyxVQUFVLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsS0FBSyxFQUFFLE1BQU0sQ0FBQyxDQUFDO0FBQ2pGO0FBQ0EsSUFBSSxJQUFJLENBQUMsSUFBSSxJQUFJLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxNQUFNLEVBQUU7QUFDM0MsTUFBTSxPQUFPLElBQUksQ0FBQyxJQUFJLENBQUMsS0FBSyxFQUFFLE1BQU0sQ0FBQyxDQUFDO0FBQ3RDLEtBQUs7QUFDTDtBQUNBLElBQUksT0FBTyxJQUFJLENBQUM7QUFDaEIsR0FBRyxDQUFDO0FBQ0o7QUFDQSxFQUFFLFNBQVMsQ0FBQyxTQUFTLENBQUMsc0JBQXNCLEdBQUcsVUFBVSxVQUFVLEVBQUUsS0FBSyxFQUFFLE1BQU0sRUFBRTtBQUNwRixJQUFJLElBQUksR0FBRyxFQUFFLEVBQUUsQ0FBQztBQUNoQjtBQUNBLElBQUksSUFBSSxhQUFhLEdBQUcsRUFBRSxDQUFDO0FBQzNCO0FBQ0EsSUFBSSxJQUFJO0FBQ1IsTUFBTSxLQUFLLElBQUksRUFBRSxHQUFHLFFBQVEsQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUMsRUFBRSxFQUFFLEdBQUcsRUFBRSxDQUFDLElBQUksRUFBRSxFQUFFLENBQUMsRUFBRSxDQUFDLElBQUksRUFBRSxFQUFFLEdBQUcsRUFBRSxDQUFDLElBQUksRUFBRSxFQUFFO0FBQzFGLFFBQVEsSUFBSSxXQUFXLEdBQUcsRUFBRSxDQUFDLEtBQUssQ0FBQztBQUNuQyxRQUFRLElBQUksYUFBYSxHQUFHLFVBQVUsQ0FBQyxXQUFXLENBQUMsQ0FBQztBQUNwRDtBQUNBLFFBQVEsSUFBSSxDQUFDLGFBQWEsRUFBRTtBQUM1QixVQUFVLFNBQVM7QUFDbkIsU0FBUztBQUNUO0FBQ0EsUUFBUSxJQUFJLFlBQVksR0FBRyxJQUFJLENBQUMsWUFBWSxDQUFDLFdBQVcsQ0FBQyxDQUFDO0FBQzFEO0FBQ0EsUUFBUSxJQUFJLElBQUksR0FBRyxZQUFZLENBQUMsV0FBVyxDQUFDLGFBQWEsRUFBRSxLQUFLLEVBQUUsTUFBTSxDQUFDLENBQUM7QUFDMUU7QUFDQSxRQUFRLElBQUksSUFBSSxFQUFFO0FBQ2xCLFVBQVUsYUFBYSxDQUFDLFdBQVcsQ0FBQyxHQUFHLElBQUksQ0FBQztBQUM1QyxTQUFTO0FBQ1QsT0FBTztBQUNQLEtBQUssQ0FBQyxPQUFPLEtBQUssRUFBRTtBQUNwQixNQUFNLEdBQUcsR0FBRztBQUNaLFFBQVEsS0FBSyxFQUFFLEtBQUs7QUFDcEIsT0FBTyxDQUFDO0FBQ1IsS0FBSyxTQUFTO0FBQ2QsTUFBTSxJQUFJO0FBQ1YsUUFBUSxJQUFJLEVBQUUsSUFBSSxDQUFDLEVBQUUsQ0FBQyxJQUFJLEtBQUssRUFBRSxHQUFHLEVBQUUsQ0FBQyxNQUFNLENBQUMsRUFBRSxFQUFFLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDO0FBQzVELE9BQU8sU0FBUztBQUNoQixRQUFRLElBQUksR0FBRyxFQUFFLE1BQU0sR0FBRyxDQUFDLEtBQUssQ0FBQztBQUNqQyxPQUFPO0FBQ1AsS0FBSztBQUNMO0FBQ0EsSUFBSSxJQUFJLGdCQUFnQixHQUFHLElBQUksQ0FBQyxhQUFhLENBQUMsQ0FBQyxHQUFHLENBQUMsVUFBVSxHQUFHLEVBQUU7QUFDbEUsTUFBTSxPQUFPLGFBQWEsQ0FBQyxHQUFHLENBQUMsQ0FBQztBQUNoQyxLQUFLLENBQUMsQ0FBQztBQUNQLElBQUksSUFBSSxrQkFBa0IsR0FBRyxPQUFPLENBQUMsZ0JBQWdCLENBQUMsR0FBRyxDQUFDLFVBQVUsRUFBRSxFQUFFO0FBQ3hFLE1BQU0sT0FBTyxFQUFFLENBQUMsV0FBVyxDQUFDO0FBQzVCLEtBQUssQ0FBQyxDQUFDLENBQUM7QUFDUixJQUFJLElBQUksY0FBYyxHQUFHLGdCQUFnQixDQUFDLElBQUksQ0FBQyxVQUFVLEVBQUUsRUFBRTtBQUM3RCxNQUFNLE9BQU8sRUFBRSxDQUFDLFdBQVcsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDO0FBQ3ZDLEtBQUssQ0FBQyxDQUFDO0FBQ1A7QUFDQSxJQUFJLElBQUksQ0FBQyxjQUFjLEVBQUU7QUFDekIsTUFBTSxPQUFPLElBQUksQ0FBQyxJQUFJLENBQUMsS0FBSyxFQUFFLE1BQU0sQ0FBQyxDQUFDO0FBQ3RDLEtBQUs7QUFDTDtBQUNBLElBQUksSUFBSSxVQUFVLEdBQUcsT0FBTyxDQUFDLGdCQUFnQixDQUFDLEdBQUcsQ0FBQyxVQUFVLENBQUMsRUFBRTtBQUMvRCxNQUFNLE9BQU8sQ0FBQyxDQUFDLFFBQVEsQ0FBQztBQUN4QixLQUFLLENBQUMsQ0FBQyxDQUFDO0FBQ1IsSUFBSSxJQUFJLGFBQWEsR0FBRyxPQUFPLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxVQUFVLEdBQUcsRUFBRTtBQUN2RSxNQUFNLE9BQU8sYUFBYSxDQUFDLEdBQUcsQ0FBQyxDQUFDLGFBQWEsQ0FBQztBQUM5QyxLQUFLLENBQUMsQ0FBQyxDQUFDO0FBQ1IsSUFBSSxPQUFPO0FBQ1gsTUFBTSxXQUFXLEVBQUUsa0JBQWtCO0FBQ3JDLE1BQU0sUUFBUSxFQUFFLFVBQVU7QUFDMUIsTUFBTSxPQUFPLEVBQUUsT0FBTyxDQUFDLGdCQUFnQixDQUFDLEdBQUcsQ0FBQyxVQUFVLENBQUMsRUFBRTtBQUN6RCxRQUFRLE9BQU8sQ0FBQyxDQUFDLE9BQU8sQ0FBQztBQUN6QixPQUFPLENBQUMsQ0FBQztBQUNULE1BQU0sYUFBYSxFQUFFLGFBQWE7QUFDbEMsTUFBTSxNQUFNLEVBQUUsS0FBSztBQUNuQixNQUFNLE9BQU8sRUFBRSxPQUFPLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxVQUFVLEdBQUcsRUFBRTtBQUM5RCxRQUFRLE9BQU8sYUFBYSxDQUFDLEdBQUcsQ0FBQyxDQUFDLE9BQU8sQ0FBQztBQUMxQyxPQUFPLENBQUMsQ0FBQztBQUNULEtBQUssQ0FBQztBQUNOLEdBQUcsQ0FBQztBQUNKO0FBQ0EsRUFBRSxTQUFTLENBQUMsU0FBUyxDQUFDLFdBQVcsR0FBRyxVQUFVLFVBQVUsRUFBRSxLQUFLLEVBQUUsTUFBTSxFQUFFO0FBQ3pFO0FBQ0EsSUFBSSxJQUFJLFFBQVEsQ0FBQyxVQUFVLENBQUMsRUFBRTtBQUM5QixNQUFNLE9BQU8sSUFBSSxDQUFDLGtCQUFrQixDQUFDLFVBQVUsRUFBRSxLQUFLLEVBQUUsTUFBTSxDQUFDLENBQUM7QUFDaEUsS0FBSztBQUNMO0FBQ0E7QUFDQSxJQUFJLElBQUksSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDLE1BQU0sS0FBSyxDQUFDLEVBQUU7QUFDdkMsTUFBTSxPQUFPLElBQUksQ0FBQyxzQkFBc0IsQ0FBQyxVQUFVLEVBQUUsS0FBSyxFQUFFLE1BQU0sQ0FBQyxDQUFDO0FBQ3BFLEtBQUs7QUFDTDtBQUNBO0FBQ0EsSUFBSSxPQUFPLElBQUksQ0FBQyxzQkFBc0IsQ0FBQyxVQUFVLEVBQUUsS0FBSyxFQUFFLE1BQU0sQ0FBQyxDQUFDO0FBQ2xFLEdBQUcsQ0FBQztBQUNKO0FBQ0EsRUFBRSxTQUFTLENBQUMsU0FBUyxDQUFDLElBQUksR0FBRyxVQUFVLEtBQUssRUFBRSxNQUFNLEVBQUU7QUFDdEQsSUFBSSxJQUFJLEdBQUcsRUFBRSxFQUFFLENBQUM7QUFDaEI7QUFDQSxJQUFJLElBQUksS0FBSyxHQUFHLElBQUksQ0FBQztBQUNyQjtBQUNBLElBQUksSUFBSSxTQUFTLEdBQUcsTUFBTSxDQUFDLElBQUksQ0FBQztBQUNoQyxJQUFJLElBQUksT0FBTyxHQUFHLEVBQUUsQ0FBQztBQUNyQixJQUFJLElBQUksY0FBYyxHQUFHLEVBQUUsQ0FBQztBQUM1QixJQUFJLElBQUksa0JBQWtCLENBQUM7QUFDM0I7QUFDQSxJQUFJLElBQUk7QUFDUixNQUFNLEtBQUssSUFBSSxFQUFFLEdBQUcsUUFBUSxDQUFDLElBQUksQ0FBQyxhQUFhLENBQUMsU0FBUyxDQUFDLENBQUMsRUFBRSxFQUFFLEdBQUcsRUFBRSxDQUFDLElBQUksRUFBRSxFQUFFLENBQUMsRUFBRSxDQUFDLElBQUksRUFBRSxFQUFFLEdBQUcsRUFBRSxDQUFDLElBQUksRUFBRSxFQUFFO0FBQ3ZHLFFBQVEsSUFBSSxTQUFTLEdBQUcsRUFBRSxDQUFDLEtBQUssQ0FBQztBQUNqQyxRQUFRLElBQUksSUFBSSxHQUFHLFNBQVMsQ0FBQyxJQUFJO0FBQ2pDLFlBQVksT0FBTyxHQUFHLFNBQVMsQ0FBQyxFQUFFLENBQUM7QUFDbkMsUUFBUSxJQUFJLGVBQWUsR0FBRyxLQUFLLENBQUMsT0FBTyxDQUFDO0FBQzVDLFFBQVEsSUFBSSxTQUFTLEdBQUcsT0FBTyxHQUFHLFFBQVEsQ0FBQyxPQUFPLENBQUMsSUFBSSxTQUFTLENBQUMsT0FBTyxDQUFDO0FBQ3pFLFFBQVEsS0FBSyxDQUFDLE9BQU8sQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLGdCQUFnQixDQUFDLE9BQU8sQ0FBQyxDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUM7QUFDeEYsUUFBUSxZQUFZLENBQUMsWUFBWSxDQUFDLE9BQU8sRUFBRSxJQUFJLENBQUMsU0FBUyxDQUFDLEVBQUUsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDO0FBQzlHLFFBQVEsSUFBSSxXQUFXLEdBQUcsS0FBSyxDQUFDO0FBQ2hDO0FBQ0EsUUFBUSxJQUFJO0FBQ1osVUFBVSxXQUFXLEdBQUcsQ0FBQyxJQUFJLElBQUksYUFBYSxDQUFDLElBQUksQ0FBQyxPQUFPLEVBQUUsSUFBSSxFQUFFLGVBQWUsRUFBRSxNQUFNLEVBQUUsS0FBSyxDQUFDLENBQUM7QUFDbkcsU0FBUyxDQUFDLE9BQU8sR0FBRyxFQUFFO0FBQ3RCLFVBQVUsTUFBTSxJQUFJLEtBQUssQ0FBQyw0QkFBNEIsSUFBSSxJQUFJLENBQUMsSUFBSSxJQUFJLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyw2QkFBNkIsR0FBRyxTQUFTLEdBQUcsbUJBQW1CLEdBQUcsSUFBSSxDQUFDLEVBQUUsR0FBRyxNQUFNLEdBQUcsR0FBRyxDQUFDLE9BQU8sQ0FBQyxDQUFDO0FBQ3RMLFNBQVM7QUFDVDtBQUNBLFFBQVEsSUFBSSxXQUFXLElBQUksU0FBUyxFQUFFO0FBQ3RDLFVBQVUsSUFBSSxTQUFTLENBQUMsTUFBTSxLQUFLLFNBQVMsRUFBRTtBQUM5QyxZQUFZLGNBQWMsR0FBRyxTQUFTLENBQUMsTUFBTSxDQUFDO0FBQzlDLFdBQVc7QUFDWDtBQUNBLFVBQVUsT0FBTyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxFQUFFLFFBQVEsQ0FBQyxTQUFTLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQztBQUNuRSxVQUFVLGtCQUFrQixHQUFHLFNBQVMsQ0FBQztBQUN6QyxVQUFVLE1BQU07QUFDaEIsU0FBUztBQUNULE9BQU87QUFDUCxLQUFLLENBQUMsT0FBTyxLQUFLLEVBQUU7QUFDcEIsTUFBTSxHQUFHLEdBQUc7QUFDWixRQUFRLEtBQUssRUFBRSxLQUFLO0FBQ3BCLE9BQU8sQ0FBQztBQUNSLEtBQUssU0FBUztBQUNkLE1BQU0sSUFBSTtBQUNWLFFBQVEsSUFBSSxFQUFFLElBQUksQ0FBQyxFQUFFLENBQUMsSUFBSSxLQUFLLEVBQUUsR0FBRyxFQUFFLENBQUMsTUFBTSxDQUFDLEVBQUUsRUFBRSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQztBQUM1RCxPQUFPLFNBQVM7QUFDaEIsUUFBUSxJQUFJLEdBQUcsRUFBRSxNQUFNLEdBQUcsQ0FBQyxLQUFLLENBQUM7QUFDakMsT0FBTztBQUNQLEtBQUs7QUFDTDtBQUNBLElBQUksSUFBSSxDQUFDLGtCQUFrQixFQUFFO0FBQzdCLE1BQU0sT0FBTyxTQUFTLENBQUM7QUFDdkIsS0FBSztBQUNMO0FBQ0EsSUFBSSxJQUFJLENBQUMsY0FBYyxDQUFDLE1BQU0sRUFBRTtBQUNoQyxNQUFNLE9BQU87QUFDYixRQUFRLFdBQVcsRUFBRSxDQUFDLGtCQUFrQixDQUFDO0FBQ3pDLFFBQVEsUUFBUSxFQUFFLEVBQUU7QUFDcEIsUUFBUSxPQUFPLEVBQUUsRUFBRTtBQUNuQixRQUFRLGFBQWEsRUFBRSxLQUFLLENBQUMsS0FBSyxHQUFHLENBQUMsSUFBSSxDQUFDLEdBQUcsRUFBRTtBQUNoRCxRQUFRLE1BQU0sRUFBRSxLQUFLO0FBQ3JCLFFBQVEsT0FBTyxFQUFFLE9BQU87QUFDeEIsT0FBTyxDQUFDO0FBQ1IsS0FBSztBQUNMO0FBQ0EsSUFBSSxJQUFJLGlCQUFpQixHQUFHLE9BQU8sQ0FBQyxjQUFjLENBQUMsR0FBRyxDQUFDLFVBQVUsU0FBUyxFQUFFO0FBQzVFLE1BQU0sT0FBTyxLQUFLLENBQUMscUJBQXFCLENBQUMsU0FBUyxFQUFFLEtBQUssQ0FBQyxZQUFZLENBQUMsQ0FBQztBQUN4RSxLQUFLLENBQUMsQ0FBQyxDQUFDO0FBQ1IsSUFBSSxJQUFJLFVBQVUsR0FBRyxDQUFDLENBQUMsa0JBQWtCLENBQUMsUUFBUSxDQUFDO0FBQ25ELElBQUksSUFBSSxZQUFZLEdBQUcsVUFBVSxHQUFHLEVBQUUsR0FBRyxPQUFPLENBQUMsaUJBQWlCLENBQUMsR0FBRyxDQUFDLFVBQVUsQ0FBQyxFQUFFO0FBQ3BGLE1BQU0sT0FBTyxLQUFLLENBQUMsY0FBYyxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQ3JDLEtBQUssQ0FBQyxDQUFDLENBQUM7QUFDUixJQUFJLE9BQU87QUFDWCxNQUFNLFdBQVcsRUFBRSxDQUFDLGtCQUFrQixDQUFDO0FBQ3ZDLE1BQU0sUUFBUSxFQUFFLFlBQVk7QUFDNUIsTUFBTSxPQUFPLEVBQUUsVUFBVSxHQUFHLEVBQUUsR0FBRyxDQUFDLElBQUksQ0FBQztBQUN2QyxNQUFNLGFBQWEsRUFBRSxpQkFBaUI7QUFDdEMsTUFBTSxNQUFNLEVBQUUsS0FBSztBQUNuQixNQUFNLE9BQU8sRUFBRSxPQUFPO0FBQ3RCLEtBQUssQ0FBQztBQUNOLEdBQUcsQ0FBQztBQUNKO0FBQ0EsRUFBRSxTQUFTLENBQUMsU0FBUyxDQUFDLGNBQWMsR0FBRyxVQUFVLGNBQWMsRUFBRTtBQUNqRSxJQUFJLElBQUksY0FBYyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsRUFBRTtBQUN0QyxNQUFNLE9BQU8sRUFBRSxDQUFDO0FBQ2hCLEtBQUs7QUFDTDtBQUNBLElBQUksSUFBSSxLQUFLLEdBQUcsRUFBRSxDQUFDO0FBQ25CLElBQUksSUFBSSxNQUFNLEdBQUcsY0FBYyxDQUFDO0FBQ2hDO0FBQ0EsSUFBSSxPQUFPLE1BQU0sSUFBSSxNQUFNLEtBQUssSUFBSSxFQUFFO0FBQ3RDLE1BQU0sS0FBSyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQztBQUN6QixNQUFNLE1BQU0sR0FBRyxNQUFNLENBQUMsTUFBTSxDQUFDO0FBQzdCLEtBQUs7QUFDTDtBQUNBLElBQUksS0FBSyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUNyQjtBQUNBLElBQUksT0FBTyxLQUFLLENBQUM7QUFDakIsR0FBRyxDQUFDO0FBQ0o7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsRUFBRSxTQUFTLENBQUMsU0FBUyxDQUFDLE9BQU8sR0FBRyxVQUFVLFNBQVMsRUFBRTtBQUNyRCxJQUFJLElBQUksSUFBSSxLQUFLLFNBQVMsRUFBRTtBQUM1QixNQUFNLE9BQU8sS0FBSyxDQUFDO0FBQ25CLEtBQUs7QUFDTDtBQUNBLElBQUksSUFBSSxNQUFNLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQztBQUM3QjtBQUNBLElBQUksT0FBTyxNQUFNLEVBQUU7QUFDbkIsTUFBTSxJQUFJLE1BQU0sS0FBSyxTQUFTLEVBQUU7QUFDaEMsUUFBUSxPQUFPLEtBQUssQ0FBQztBQUNyQixPQUFPO0FBQ1A7QUFDQSxNQUFNLE1BQU0sR0FBRyxNQUFNLENBQUMsTUFBTSxDQUFDO0FBQzdCLEtBQUs7QUFDTDtBQUNBLElBQUksT0FBTyxJQUFJLENBQUM7QUFDaEIsR0FBRyxDQUFDO0FBQ0o7QUFDQSxFQUFFLFNBQVMsQ0FBQyxTQUFTLENBQUMsVUFBVSxHQUFHLFVBQVUsVUFBVSxFQUFFLGNBQWMsRUFBRSxNQUFNLEVBQUUsU0FBUyxFQUFFO0FBQzVGLElBQUksSUFBSSxHQUFHLEVBQUUsRUFBRSxFQUFFLEdBQUcsRUFBRSxFQUFFLENBQUM7QUFDekI7QUFDQSxJQUFJLElBQUksVUFBVSxHQUFHLGdCQUFnQixDQUFDLEVBQUUsRUFBRSxTQUFTLEdBQUcsSUFBSSxDQUFDLGFBQWEsQ0FBQyxTQUFTLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO0FBQ3BHLElBQUksSUFBSSxjQUFjLEdBQUcsVUFBVSxDQUFDLGFBQWEsQ0FBQyxNQUFNLEdBQUcsZ0JBQWdCLENBQUMsVUFBVSxFQUFFLFVBQVUsQ0FBQyxhQUFhLENBQUMsR0FBRyxVQUFVLENBQUM7QUFDL0g7QUFDQSxJQUFJLElBQUk7QUFDUixNQUFNLEtBQUssSUFBSSxnQkFBZ0IsR0FBRyxRQUFRLENBQUMsY0FBYyxDQUFDLEVBQUUsa0JBQWtCLEdBQUcsZ0JBQWdCLENBQUMsSUFBSSxFQUFFLEVBQUUsQ0FBQyxrQkFBa0IsQ0FBQyxJQUFJLEVBQUUsa0JBQWtCLEdBQUcsZ0JBQWdCLENBQUMsSUFBSSxFQUFFLEVBQUU7QUFDbEwsUUFBUSxJQUFJLEVBQUUsR0FBRyxrQkFBa0IsQ0FBQyxLQUFLLENBQUM7QUFDMUM7QUFDQSxRQUFRLElBQUksQ0FBQyxHQUFHLENBQUMsVUFBVSxFQUFFLEVBQUUsQ0FBQyxFQUFFO0FBQ2xDLFVBQVUsVUFBVSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUM7QUFDdkMsU0FBUztBQUNULE9BQU87QUFDUCxLQUFLLENBQUMsT0FBTyxLQUFLLEVBQUU7QUFDcEIsTUFBTSxHQUFHLEdBQUc7QUFDWixRQUFRLEtBQUssRUFBRSxLQUFLO0FBQ3BCLE9BQU8sQ0FBQztBQUNSLEtBQUssU0FBUztBQUNkLE1BQU0sSUFBSTtBQUNWLFFBQVEsSUFBSSxrQkFBa0IsSUFBSSxDQUFDLGtCQUFrQixDQUFDLElBQUksS0FBSyxFQUFFLEdBQUcsZ0JBQWdCLENBQUMsTUFBTSxDQUFDLEVBQUUsRUFBRSxDQUFDLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDO0FBQ3hILE9BQU8sU0FBUztBQUNoQixRQUFRLElBQUksR0FBRyxFQUFFLE1BQU0sR0FBRyxDQUFDLEtBQUssQ0FBQztBQUNqQyxPQUFPO0FBQ1AsS0FBSztBQUNMO0FBQ0EsSUFBSSxJQUFJO0FBQ1IsTUFBTSxLQUFLLElBQUksWUFBWSxHQUFHLFFBQVEsQ0FBQyxVQUFVLENBQUMsRUFBRSxjQUFjLEdBQUcsWUFBWSxDQUFDLElBQUksRUFBRSxFQUFFLENBQUMsY0FBYyxDQUFDLElBQUksRUFBRSxjQUFjLEdBQUcsWUFBWSxDQUFDLElBQUksRUFBRSxFQUFFO0FBQ3RKLFFBQVEsSUFBSSxFQUFFLEdBQUcsY0FBYyxDQUFDLEtBQUssQ0FBQztBQUN0QztBQUNBLFFBQVEsSUFBSSxDQUFDLEdBQUcsQ0FBQyxjQUFjLEVBQUUsRUFBRSxDQUFDLElBQUksR0FBRyxDQUFDLFVBQVUsQ0FBQyxPQUFPLEVBQUUsRUFBRSxDQUFDLE1BQU0sQ0FBQyxFQUFFO0FBQzVFLFVBQVUsVUFBVSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUM7QUFDdEMsU0FBUztBQUNULE9BQU87QUFDUCxLQUFLLENBQUMsT0FBTyxLQUFLLEVBQUU7QUFDcEIsTUFBTSxHQUFHLEdBQUc7QUFDWixRQUFRLEtBQUssRUFBRSxLQUFLO0FBQ3BCLE9BQU8sQ0FBQztBQUNSLEtBQUssU0FBUztBQUNkLE1BQU0sSUFBSTtBQUNWLFFBQVEsSUFBSSxjQUFjLElBQUksQ0FBQyxjQUFjLENBQUMsSUFBSSxLQUFLLEVBQUUsR0FBRyxZQUFZLENBQUMsTUFBTSxDQUFDLEVBQUUsRUFBRSxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsQ0FBQztBQUN4RyxPQUFPLFNBQVM7QUFDaEIsUUFBUSxJQUFJLEdBQUcsRUFBRSxNQUFNLEdBQUcsQ0FBQyxLQUFLLENBQUM7QUFDakMsT0FBTztBQUNQLEtBQUs7QUFDTDtBQUNBLElBQUksSUFBSSxDQUFDLFVBQVUsQ0FBQyxNQUFNLEVBQUU7QUFDNUIsTUFBTSxVQUFVLENBQUMsT0FBTyxHQUFHLEVBQUUsQ0FBQztBQUM5QjtBQUNBLE1BQU0sVUFBVSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7QUFDckMsS0FBSztBQUNMO0FBQ0EsSUFBSSxJQUFJLFVBQVUsR0FBRyxPQUFPLENBQUMsVUFBVSxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsVUFBVSxFQUFFLEVBQUU7QUFDbkUsTUFBTSxJQUFJLE1BQU0sR0FBRyxFQUFFLENBQUM7QUFDdEI7QUFDQSxNQUFNLElBQUksRUFBRSxDQUFDLElBQUksS0FBSyxPQUFPLEVBQUU7QUFDL0IsUUFBUSxPQUFPLE1BQU0sQ0FBQztBQUN0QixPQUFPO0FBQ1A7QUFDQSxNQUFNLElBQUksTUFBTSxHQUFHLEVBQUUsQ0FBQyxNQUFNLENBQUM7QUFDN0I7QUFDQSxNQUFNLElBQUksQ0FBQyxNQUFNLENBQUMsTUFBTSxFQUFFO0FBQzFCLFFBQVEsT0FBTyxNQUFNLENBQUM7QUFDdEIsT0FBTztBQUNQO0FBQ0EsTUFBTSxNQUFNLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFLEVBQUUsQ0FBQyxRQUFRLENBQUM7QUFDMUMsTUFBTSxJQUFJLENBQUMsTUFBTSxDQUFDLEVBQUUsRUFBRSxFQUFFLENBQUMsUUFBUSxHQUFHLFVBQVUsQ0FBQyxFQUFFLENBQUMsUUFBUSxFQUFFLGNBQWMsRUFBRSxNQUFNLENBQUMsR0FBRyxTQUFTLENBQUMsQ0FBQyxDQUFDO0FBQ2xHLE1BQU0sSUFBSSxXQUFXLEdBQUcsTUFBTSxDQUFDLE1BQU0sQ0FBQztBQUN0QztBQUNBLE1BQU0sSUFBSSxXQUFXLENBQUMsSUFBSSxLQUFLLFVBQVUsRUFBRTtBQUMzQyxRQUFRLElBQUksV0FBVyxDQUFDLFdBQVcsQ0FBQyxDQUFDLEtBQUssQ0FBQyxVQUFVLFVBQVUsRUFBRTtBQUNqRSxVQUFVLE9BQU8sY0FBYyxDQUFDLFVBQVUsQ0FBQyxhQUFhLEVBQUUsVUFBVSxDQUFDLENBQUM7QUFDdEUsU0FBUyxDQUFDLEVBQUU7QUFDWixVQUFVLE1BQU0sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO0FBQzVDLFNBQVM7QUFDVCxPQUFPO0FBQ1A7QUFDQSxNQUFNLE9BQU8sTUFBTSxDQUFDO0FBQ3BCLEtBQUssQ0FBQyxDQUFDLENBQUM7QUFDUixJQUFJLFVBQVUsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxFQUFFLENBQUMsRUFBRTtBQUM1QyxNQUFNLE9BQU8sQ0FBQyxDQUFDLEtBQUssR0FBRyxDQUFDLENBQUMsS0FBSyxDQUFDO0FBQy9CLEtBQUssQ0FBQyxDQUFDO0FBQ1AsSUFBSSxVQUFVLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsRUFBRSxDQUFDLEVBQUU7QUFDN0MsTUFBTSxPQUFPLENBQUMsQ0FBQyxLQUFLLEdBQUcsQ0FBQyxDQUFDLEtBQUssQ0FBQztBQUMvQixLQUFLLENBQUMsQ0FBQztBQUNQLElBQUksSUFBSSxXQUFXLEdBQUcsSUFBSSxHQUFHLENBQUMsVUFBVSxDQUFDLFFBQVEsQ0FBQyxDQUFDO0FBQ25ELElBQUksSUFBSSxVQUFVLEdBQUcsSUFBSSxHQUFHLENBQUMsVUFBVSxDQUFDLE9BQU8sQ0FBQyxDQUFDO0FBQ2pEO0FBQ0EsSUFBSSxJQUFJLEVBQUUsR0FBRyxNQUFNLENBQUMsQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsQ0FBQyxHQUFHLENBQUMsVUFBVSxTQUFTLEVBQUU7QUFDOUUsTUFBTSxPQUFPLFFBQVEsQ0FBQyxTQUFTLENBQUMsVUFBVSxDQUFDLEdBQUcsQ0FBQyxVQUFVLFFBQVEsRUFBRTtBQUNuRSxRQUFRLE9BQU9FLE9BQUssQ0FBQyxRQUFRLENBQUMsQ0FBQztBQUMvQixPQUFPLENBQUMsRUFBRSxTQUFTLENBQUMsT0FBTyxDQUFDLENBQUM7QUFDN0IsS0FBSyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsVUFBVSxDQUFDLEdBQUcsQ0FBQ1IsT0FBSyxDQUFDLENBQUMsRUFBRSxPQUFPLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQyxHQUFHLENBQUMsVUFBVSxTQUFTLEVBQUU7QUFDL0YsTUFBTSxPQUFPLFFBQVEsQ0FBQyxTQUFTLENBQUMsTUFBTSxFQUFFLFNBQVMsQ0FBQyxVQUFVLENBQUMsR0FBRyxDQUFDLFVBQVUsUUFBUSxFQUFFO0FBQ3JGLFFBQVEsT0FBT1MsTUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDO0FBQzlCLE9BQU8sQ0FBQyxDQUFDLENBQUM7QUFDVixLQUFLLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDO0FBQ1osUUFBUSxZQUFZLEdBQUcsRUFBRSxDQUFDLENBQUMsQ0FBQztBQUM1QixRQUFRLFdBQVcsR0FBRyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDNUI7QUFDQSxJQUFJLElBQUksT0FBTyxHQUFHLGVBQWUsQ0FBQyxXQUFXLENBQUMsTUFBTSxDQUFDLFVBQVUsQ0FBQyxPQUFPLENBQUMsQ0FBQyxNQUFNLENBQUMsWUFBWSxDQUFDLEVBQUUsSUFBSSxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLENBQUM7QUFDN0gsSUFBSSxPQUFPLE9BQU8sQ0FBQztBQUNuQixHQUFHLENBQUM7QUFDSjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxFQUFFLFNBQVMsQ0FBQyxTQUFTLENBQUMsVUFBVSxHQUFHLFVBQVUsS0FBSyxFQUFFLEtBQUssRUFBRSxPQUFPLEVBQUU7QUFDcEUsSUFBSSxJQUFJLEtBQUssS0FBSyxLQUFLLENBQUMsRUFBRTtBQUMxQixNQUFNLEtBQUssR0FBRyxJQUFJLENBQUMsWUFBWSxDQUFDO0FBQ2hDLEtBQUs7QUFDTDtBQUNBLElBQUksSUFBSSxNQUFNLEdBQUcsWUFBWSxDQUFDLEtBQUssQ0FBQyxDQUFDO0FBQ3JDO0FBQ0EsSUFBSSxJQUFJLFlBQVksQ0FBQztBQUNyQjtBQUNBLElBQUksSUFBSSxLQUFLLFlBQVksS0FBSyxFQUFFO0FBQ2hDLE1BQU0sWUFBWSxHQUFHLE9BQU8sS0FBSyxTQUFTLEdBQUcsS0FBSyxHQUFHLElBQUksQ0FBQyxZQUFZLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxLQUFLLEVBQUUsT0FBTyxDQUFDLENBQUMsQ0FBQztBQUNuRyxLQUFLLE1BQU07QUFDWCxNQUFNLElBQUksa0JBQWtCLEdBQUcsUUFBUSxDQUFDLEtBQUssQ0FBQyxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsZ0JBQWdCLENBQUMsSUFBSSxDQUFDLGVBQWUsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQztBQUNuSSxNQUFNLElBQUksZUFBZSxHQUFHLE9BQU8sR0FBRyxPQUFPLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUM7QUFDckUsTUFBTSxZQUFZLEdBQUcsSUFBSSxDQUFDLFlBQVksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLGtCQUFrQixFQUFFLGVBQWUsQ0FBQyxDQUFDLENBQUM7QUFDeEYsS0FBSztBQUNMO0FBQ0EsSUFBSSxJQUFJLENBQUMsYUFBYSxJQUFJLE1BQU0sQ0FBQyxJQUFJLEtBQUssUUFBUSxFQUFFO0FBQ3BELE1BQU0sTUFBTSxJQUFJLEtBQUssQ0FBQywyQ0FBMkMsR0FBRyxRQUFRLEdBQUcsSUFBSSxDQUFDLENBQUM7QUFDckYsS0FBSztBQUNMO0FBQ0EsSUFBSSxJQUFJLElBQUksQ0FBQyxNQUFNLEVBQUU7QUFDckIsTUFBTSxJQUFJLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsY0FBYyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsRUFBRTtBQUM5RSxRQUFRLE1BQU0sSUFBSSxLQUFLLENBQUMsV0FBVyxHQUFHLElBQUksQ0FBQyxFQUFFLEdBQUcsMkJBQTJCLEdBQUcsTUFBTSxDQUFDLElBQUksR0FBRyxHQUFHLENBQUMsQ0FBQztBQUNqRyxPQUFPO0FBQ1AsS0FBSztBQUNMO0FBQ0EsSUFBSSxJQUFJLGVBQWUsR0FBRyxJQUFJLENBQUMsV0FBVyxDQUFDLFlBQVksQ0FBQyxLQUFLLEVBQUUsWUFBWSxFQUFFLE1BQU0sQ0FBQyxJQUFJO0FBQ3hGLE1BQU0sV0FBVyxFQUFFLEVBQUU7QUFDckIsTUFBTSxhQUFhLEVBQUUsRUFBRTtBQUN2QixNQUFNLFFBQVEsRUFBRSxFQUFFO0FBQ2xCLE1BQU0sT0FBTyxFQUFFLEVBQUU7QUFDakIsTUFBTSxNQUFNLEVBQUUsWUFBWTtBQUMxQixNQUFNLE9BQU8sRUFBRSxFQUFFO0FBQ2pCLEtBQUssQ0FBQztBQUNOLElBQUksSUFBSSxVQUFVLEdBQUcsZ0JBQWdCLENBQUMsRUFBRSxFQUFFLElBQUksQ0FBQyxhQUFhLENBQUMsWUFBWSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUM7QUFDbEYsSUFBSSxJQUFJLGNBQWMsR0FBRyxlQUFlLENBQUMsYUFBYSxDQUFDLE1BQU0sR0FBRyxnQkFBZ0IsQ0FBQyxVQUFVLEVBQUUsZUFBZSxDQUFDLGFBQWEsQ0FBQyxHQUFHLFVBQVUsQ0FBQztBQUN6SSxJQUFJLGVBQWUsQ0FBQyxhQUFhLEdBQUcsUUFBUSxDQUFDLGNBQWMsQ0FBQyxDQUFDO0FBQzdELElBQUksT0FBTyxJQUFJLENBQUMsaUJBQWlCLENBQUMsZUFBZSxFQUFFLFlBQVksRUFBRSxNQUFNLENBQUMsQ0FBQztBQUN6RSxHQUFHLENBQUM7QUFDSjtBQUNBLEVBQUUsU0FBUyxDQUFDLFNBQVMsQ0FBQyx1QkFBdUIsR0FBRyxVQUFVLEtBQUssRUFBRSxNQUFNLEVBQUUsYUFBYSxFQUFFO0FBQ3hGLElBQUksSUFBSSxFQUFFLENBQUM7QUFDWDtBQUNBLElBQUksSUFBSSxjQUFjLEdBQUcsS0FBSyxDQUFDLE9BQU8sQ0FBQztBQUN2QyxJQUFJLEtBQUssR0FBRyxJQUFJLENBQUMsVUFBVSxDQUFDLEtBQUssRUFBRSxNQUFNLENBQUMsQ0FBQztBQUMzQztBQUNBO0FBQ0EsSUFBSSxLQUFLLENBQUMsTUFBTSxHQUFHLGFBQWEsQ0FBQztBQUNqQyxJQUFJLEtBQUssQ0FBQyxLQUFLLEdBQUcsYUFBYSxDQUFDLElBQUksQ0FBQztBQUNyQztBQUNBLElBQUksQ0FBQyxFQUFFLEdBQUcsS0FBSyxDQUFDLE9BQU8sRUFBRSxPQUFPLENBQUMsS0FBSyxDQUFDLEVBQUUsRUFBRSxRQUFRLENBQUMsY0FBYyxDQUFDLENBQUMsQ0FBQztBQUNyRTtBQUNBLElBQUksT0FBTyxLQUFLLENBQUM7QUFDakIsR0FBRyxDQUFDO0FBQ0o7QUFDQSxFQUFFLFNBQVMsQ0FBQyxTQUFTLENBQUMsaUJBQWlCLEdBQUcsVUFBVSxlQUFlLEVBQUUsWUFBWSxFQUFFLE1BQU0sRUFBRSxPQUFPLEVBQUU7QUFDcEcsSUFBSSxJQUFJLEdBQUcsRUFBRSxFQUFFLENBQUM7QUFDaEI7QUFDQSxJQUFJLElBQUksS0FBSyxHQUFHLElBQUksQ0FBQztBQUNyQjtBQUNBLElBQUksSUFBSSxNQUFNLEtBQUssS0FBSyxDQUFDLEVBQUU7QUFDM0IsTUFBTSxNQUFNLEdBQUcsU0FBUyxDQUFDO0FBQ3pCLEtBQUs7QUFDTDtBQUNBLElBQUksSUFBSSxPQUFPLEtBQUssS0FBSyxDQUFDLEVBQUU7QUFDNUIsTUFBTSxPQUFPLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUM7QUFDckMsS0FBSztBQUNMO0FBQ0EsSUFBSSxJQUFJLGFBQWEsR0FBRyxlQUFlLENBQUMsYUFBYSxDQUFDO0FBQ3REO0FBQ0E7QUFDQTtBQUNBLElBQUksSUFBSSxjQUFjLEdBQUcsQ0FBQyxZQUFZLElBQUksZUFBZSxDQUFDLFdBQVcsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDO0FBQ2pGLElBQUksSUFBSSxrQkFBa0IsR0FBRyxjQUFjLEdBQUcsUUFBUSxDQUFDLElBQUksQ0FBQyxPQUFPLEVBQUUsYUFBYSxDQUFDLEdBQUcsU0FBUyxDQUFDO0FBQ2hHLElBQUksSUFBSSxZQUFZLEdBQUcsWUFBWSxHQUFHLFlBQVksQ0FBQyxZQUFZLEdBQUcsWUFBWSxDQUFDLFlBQVksR0FBRyxlQUFlLENBQUMsTUFBTSxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsWUFBWSxDQUFDLFlBQVksQ0FBQyxLQUFLLENBQUMsR0FBRyxTQUFTLEdBQUcsU0FBUyxDQUFDO0FBQzdMLElBQUksSUFBSSxjQUFjLEdBQUcsWUFBWSxHQUFHLFlBQVksQ0FBQyxPQUFPLEdBQUcsT0FBTyxDQUFDO0FBQ3ZFLElBQUksSUFBSSxPQUFPLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBQyxlQUFlLEVBQUUsY0FBYyxFQUFFLE1BQU0sRUFBRSxZQUFZLENBQUMsQ0FBQztBQUN6RixJQUFJLElBQUksVUFBVSxHQUFHLFlBQVksR0FBRyxRQUFRLENBQUMsRUFBRSxFQUFFLFlBQVksQ0FBQyxVQUFVLENBQUMsR0FBRyxFQUFFLENBQUM7QUFDL0U7QUFDQSxJQUFJLElBQUk7QUFDUixNQUFNLEtBQUssSUFBSSxTQUFTLEdBQUcsUUFBUSxDQUFDLE9BQU8sQ0FBQyxFQUFFLFdBQVcsR0FBRyxTQUFTLENBQUMsSUFBSSxFQUFFLEVBQUUsQ0FBQyxXQUFXLENBQUMsSUFBSSxFQUFFLFdBQVcsR0FBRyxTQUFTLENBQUMsSUFBSSxFQUFFLEVBQUU7QUFDakksUUFBUSxJQUFJLE1BQU0sR0FBRyxXQUFXLENBQUMsS0FBSyxDQUFDO0FBQ3ZDO0FBQ0EsUUFBUSxJQUFJLE1BQU0sQ0FBQyxJQUFJLEtBQUthLEtBQU8sRUFBRTtBQUNyQyxVQUFVLFVBQVUsQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLEVBQUUsSUFBSSxNQUFNLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxHQUFHLE1BQU0sQ0FBQztBQUMxRSxTQUFTLE1BQU0sSUFBSSxNQUFNLENBQUMsSUFBSSxLQUFLSCxJQUFNLEVBQUU7QUFDM0MsVUFBVSxVQUFVLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxFQUFFLElBQUksTUFBTSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsR0FBRyxLQUFLLENBQUM7QUFDekUsU0FBUztBQUNULE9BQU87QUFDUCxLQUFLLENBQUMsT0FBTyxLQUFLLEVBQUU7QUFDcEIsTUFBTSxHQUFHLEdBQUc7QUFDWixRQUFRLEtBQUssRUFBRSxLQUFLO0FBQ3BCLE9BQU8sQ0FBQztBQUNSLEtBQUssU0FBUztBQUNkLE1BQU0sSUFBSTtBQUNWLFFBQVEsSUFBSSxXQUFXLElBQUksQ0FBQyxXQUFXLENBQUMsSUFBSSxLQUFLLEVBQUUsR0FBRyxTQUFTLENBQUMsTUFBTSxDQUFDLEVBQUUsRUFBRSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQztBQUM1RixPQUFPLFNBQVM7QUFDaEIsUUFBUSxJQUFJLEdBQUcsRUFBRSxNQUFNLEdBQUcsQ0FBQyxLQUFLLENBQUM7QUFDakMsT0FBTztBQUNQLEtBQUs7QUFDTDtBQUNBLElBQUksSUFBSSxFQUFFLEdBQUcsTUFBTSxDQUFDLGNBQWMsQ0FBQyxJQUFJLEVBQUUsWUFBWSxFQUFFLGNBQWMsRUFBRSxNQUFNLEVBQUUsT0FBTyxDQUFDLEVBQUUsQ0FBQyxDQUFDO0FBQzNGLFFBQVEsZUFBZSxHQUFHLEVBQUUsQ0FBQyxDQUFDLENBQUM7QUFDL0IsUUFBUSxjQUFjLEdBQUcsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQy9CO0FBQ0EsSUFBSSxJQUFJLEVBQUUsR0FBRyxNQUFNLENBQUMsU0FBUyxDQUFDLGVBQWUsRUFBRSxVQUFVLE1BQU0sRUFBRTtBQUNqRSxNQUFNLE9BQU8sTUFBTSxDQUFDLElBQUksS0FBS2pCLEtBQU8sSUFBSSxNQUFNLENBQUMsSUFBSSxLQUFLQyxJQUFNLElBQUksTUFBTSxDQUFDLEVBQUUsS0FBSyxjQUFjLENBQUMsUUFBUSxDQUFDO0FBQ3hHLEtBQUssQ0FBQyxFQUFFLENBQUMsQ0FBQztBQUNWLFFBQVEsWUFBWSxHQUFHLEVBQUUsQ0FBQyxDQUFDLENBQUM7QUFDNUIsUUFBUSxnQkFBZ0IsR0FBRyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDakM7QUFDQSxJQUFJLElBQUksYUFBYSxHQUFHLGVBQWUsQ0FBQyxNQUFNLENBQUMsVUFBVSxNQUFNLEVBQUU7QUFDakUsTUFBTSxJQUFJLEVBQUUsQ0FBQztBQUNiO0FBQ0EsTUFBTSxPQUFPLE1BQU0sQ0FBQyxJQUFJLEtBQUttQixLQUFPLElBQUksQ0FBQyxDQUFDLEVBQUUsR0FBRyxNQUFNLENBQUMsUUFBUSxNQUFNLElBQUksSUFBSSxFQUFFLEtBQUssS0FBSyxDQUFDLEdBQUcsS0FBSyxDQUFDLEdBQUcsRUFBRSxDQUFDLElBQUksTUFBTSxNQUFNLENBQUM7QUFDekgsS0FBSyxDQUFDLENBQUM7QUFDUCxJQUFJLElBQUksUUFBUSxHQUFHLGFBQWEsQ0FBQyxNQUFNLENBQUMsVUFBVSxHQUFHLEVBQUUsTUFBTSxFQUFFO0FBQy9ELE1BQU0sR0FBRyxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsRUFBRSxDQUFDLEdBQUcsb0JBQW9CLENBQUMsTUFBTSxDQUFDLFFBQVEsRUFBRSxLQUFLLENBQUMsT0FBTyxFQUFFLGNBQWMsRUFBRSxNQUFNLENBQUMsQ0FBQztBQUM3RyxNQUFNLE9BQU8sR0FBRyxDQUFDO0FBQ2pCLEtBQUssRUFBRSxZQUFZLEdBQUcsUUFBUSxDQUFDLEVBQUUsRUFBRSxZQUFZLENBQUMsUUFBUSxDQUFDLEdBQUcsRUFBRSxDQUFDLENBQUM7QUFDaEUsSUFBSSxJQUFJLHFCQUFxQixHQUFHLGtCQUFrQixHQUFHLGVBQWUsQ0FBQyxhQUFhLEdBQUcsWUFBWSxHQUFHLFlBQVksQ0FBQyxhQUFhLEdBQUcsRUFBRSxDQUFDO0FBQ3BJLElBQUksSUFBSSxJQUFJLEdBQUcscUJBQXFCLENBQUMsTUFBTSxDQUFDLFVBQVUsR0FBRyxFQUFFLFNBQVMsRUFBRTtBQUN0RSxNQUFNLElBQUksU0FBUyxDQUFDLElBQUksS0FBSyxTQUFTLEVBQUU7QUFDeEMsUUFBUSxHQUFHLENBQUMsU0FBUyxDQUFDLEVBQUUsQ0FBQyxHQUFHLFNBQVMsQ0FBQyxJQUFJLENBQUM7QUFDM0MsT0FBTztBQUNQO0FBQ0EsTUFBTSxPQUFPLEdBQUcsQ0FBQztBQUNqQixLQUFLLEVBQUUsRUFBRSxDQUFDLENBQUM7QUFDWCxJQUFJLElBQUksTUFBTSxHQUFHLGNBQWMsQ0FBQyxxQkFBcUIsRUFBRSxJQUFJLENBQUMsQ0FBQztBQUM3RCxJQUFJLElBQUksU0FBUyxHQUFHLElBQUksS0FBSyxDQUFDO0FBQzlCLE1BQU0sS0FBSyxFQUFFLGtCQUFrQixJQUFJLFlBQVksQ0FBQyxLQUFLO0FBQ3JELE1BQU0sT0FBTyxFQUFFLGNBQWM7QUFDN0IsTUFBTSxNQUFNLEVBQUUsTUFBTTtBQUNwQjtBQUNBLE1BQU0sVUFBVSxFQUFFLFlBQVksR0FBRyxZQUFZLENBQUMsVUFBVSxHQUFHLElBQUk7QUFDL0QsTUFBTSxZQUFZLEVBQUUsa0JBQWtCLEdBQUcsWUFBWSxHQUFHLGtCQUFrQixDQUFDLFlBQVksRUFBRSxrQkFBa0IsQ0FBQyxHQUFHLFNBQVMsR0FBRyxZQUFZLEdBQUcsWUFBWSxDQUFDLFlBQVksR0FBRyxTQUFTO0FBQy9LLE1BQU0sT0FBTyxFQUFFLENBQUMsa0JBQWtCLElBQUksZUFBZSxDQUFDLE1BQU0sR0FBRyxZQUFZLEdBQUcsU0FBUztBQUN2RixNQUFNLE9BQU8sRUFBRSxrQkFBa0IsR0FBRyxnQkFBZ0IsR0FBRyxFQUFFO0FBQ3pELE1BQU0sVUFBVSxFQUFFLGtCQUFrQixHQUFHLFVBQVUsR0FBRyxZQUFZLEdBQUcsWUFBWSxDQUFDLFVBQVUsR0FBRyxFQUFFO0FBQy9GLE1BQU0sSUFBSSxFQUFFLGtCQUFrQixHQUFHLElBQUksR0FBRyxZQUFZLEdBQUcsWUFBWSxDQUFDLElBQUksR0FBRyxTQUFTO0FBQ3BGLE1BQU0sTUFBTSxFQUFFLEVBQUU7QUFDaEIsTUFBTSxhQUFhLEVBQUUscUJBQXFCO0FBQzFDLE1BQU0sV0FBVyxFQUFFLGVBQWUsQ0FBQyxXQUFXO0FBQzlDLE1BQU0sUUFBUSxFQUFFLFFBQVE7QUFDeEIsTUFBTSxJQUFJLEVBQUUsTUFBTTtBQUNsQixLQUFLLENBQUMsQ0FBQztBQUNQLElBQUksSUFBSSxnQkFBZ0IsR0FBRyxjQUFjLEtBQUssY0FBYyxDQUFDO0FBQzdELElBQUksU0FBUyxDQUFDLE9BQU8sR0FBRyxNQUFNLENBQUMsSUFBSSxLQUFLLE1BQU0sSUFBSSxnQkFBZ0IsQ0FBQztBQUNuRTtBQUNBLElBQUksSUFBSSxPQUFPLEdBQUcsU0FBUyxDQUFDLE9BQU8sQ0FBQztBQUNwQztBQUNBLElBQUksSUFBSSxPQUFPLEVBQUU7QUFDakIsTUFBTSxPQUFPLE9BQU8sQ0FBQyxPQUFPLENBQUM7QUFDN0IsS0FBSztBQUNMO0FBQ0EsSUFBSSxJQUFJLENBQUMsa0JBQWtCLEVBQUU7QUFDN0IsTUFBTSxPQUFPLFNBQVMsQ0FBQztBQUN2QixLQUFLO0FBQ0w7QUFDQSxJQUFJLElBQUksY0FBYyxHQUFHLFNBQVMsQ0FBQztBQUNuQztBQUNBLElBQUksSUFBSSxDQUFDLE1BQU0sRUFBRTtBQUNqQixNQUFNLElBQUksV0FBVyxHQUFHLElBQUksQ0FBQyxVQUFVLElBQUksYUFBYSxDQUFDLElBQUksQ0FBQyxVQUFVLFNBQVMsRUFBRTtBQUNuRixRQUFRLE9BQU8sU0FBUyxDQUFDLFVBQVUsQ0FBQztBQUNwQyxPQUFPLENBQUMsQ0FBQztBQUNUO0FBQ0EsTUFBTSxJQUFJLFdBQVcsRUFBRTtBQUN2QixRQUFRLGNBQWMsR0FBRyxJQUFJLENBQUMsdUJBQXVCLENBQUMsY0FBYyxFQUFFO0FBQ3RFLFVBQVUsSUFBSSxFQUFFLFNBQVM7QUFDekIsU0FBUyxFQUFFLE1BQU0sQ0FBQyxDQUFDO0FBQ25CLE9BQU87QUFDUDtBQUNBLE1BQU0sT0FBTyxZQUFZLENBQUMsTUFBTSxFQUFFO0FBQ2xDLFFBQVEsSUFBSSxXQUFXLEdBQUcsWUFBWSxDQUFDLEtBQUssRUFBRSxDQUFDO0FBQy9DLFFBQVEsY0FBYyxHQUFHLElBQUksQ0FBQyx1QkFBdUIsQ0FBQyxjQUFjLEVBQUUsV0FBVyxDQUFDLE1BQU0sRUFBRSxNQUFNLENBQUMsQ0FBQztBQUNsRyxPQUFPO0FBQ1AsS0FBSztBQUNMO0FBQ0E7QUFDQSxJQUFJLElBQUksT0FBTyxHQUFHLGNBQWMsQ0FBQyxPQUFPLEtBQUssT0FBTyxHQUFHLENBQUMsQ0FBQyxjQUFjLENBQUMsT0FBTyxDQUFDLE1BQU0sSUFBSSxnQkFBZ0IsSUFBSSxPQUFPLE9BQU8sQ0FBQyxLQUFLLEtBQUssT0FBTyxjQUFjLENBQUMsS0FBSyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsY0FBYyxDQUFDLEtBQUssRUFBRSxPQUFPLENBQUMsS0FBSyxDQUFDLEdBQUcsU0FBUyxDQUFDLENBQUM7QUFDMU8sSUFBSSxjQUFjLENBQUMsT0FBTyxHQUFHLE9BQU8sQ0FBQztBQUNyQztBQUNBLElBQUksY0FBYyxDQUFDLE9BQU8sR0FBRyxPQUFPLENBQUM7QUFDckMsSUFBSSxPQUFPLGNBQWMsQ0FBQztBQUMxQixHQUFHLENBQUM7QUFDSjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsRUFBRSxTQUFTLENBQUMsU0FBUyxDQUFDLFlBQVksR0FBRyxVQUFVLFFBQVEsRUFBRTtBQUN6RCxJQUFJLElBQUksU0FBUyxDQUFDLFFBQVEsQ0FBQyxFQUFFO0FBQzdCLE1BQU0sT0FBTyxJQUFJLENBQUMsT0FBTyxDQUFDLGdCQUFnQixDQUFDLFFBQVEsQ0FBQyxDQUFDO0FBQ3JELEtBQUs7QUFDTDtBQUNBLElBQUksSUFBSSxDQUFDLElBQUksQ0FBQyxNQUFNLEVBQUU7QUFDdEIsTUFBTSxNQUFNLElBQUksS0FBSyxDQUFDLGtDQUFrQyxHQUFHLFFBQVEsR0FBRyxVQUFVLEdBQUcsSUFBSSxDQUFDLEVBQUUsR0FBRywyQkFBMkIsQ0FBQyxDQUFDO0FBQzFILEtBQUs7QUFDTDtBQUNBLElBQUksSUFBSSxNQUFNLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsQ0FBQztBQUN2QztBQUNBLElBQUksSUFBSSxDQUFDLE1BQU0sRUFBRTtBQUNqQixNQUFNLE1BQU0sSUFBSSxLQUFLLENBQUMsZUFBZSxHQUFHLFFBQVEsR0FBRyx1QkFBdUIsR0FBRyxJQUFJLENBQUMsRUFBRSxHQUFHLEdBQUcsQ0FBQyxDQUFDO0FBQzVGLEtBQUs7QUFDTDtBQUNBLElBQUksT0FBTyxNQUFNLENBQUM7QUFDbEIsR0FBRyxDQUFDO0FBQ0o7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxFQUFFLFNBQVMsQ0FBQyxTQUFTLENBQUMsZ0JBQWdCLEdBQUcsVUFBVSxPQUFPLEVBQUU7QUFDNUQsSUFBSSxJQUFJLGVBQWUsR0FBRyxTQUFTLENBQUMsT0FBTyxDQUFDLEdBQUcsT0FBTyxDQUFDLEtBQUssQ0FBQyxnQkFBZ0IsQ0FBQyxNQUFNLENBQUMsR0FBRyxPQUFPLENBQUM7QUFDaEc7QUFDQSxJQUFJLElBQUksZUFBZSxLQUFLLElBQUksQ0FBQyxFQUFFLEVBQUU7QUFDckMsTUFBTSxPQUFPLElBQUksQ0FBQztBQUNsQixLQUFLO0FBQ0w7QUFDQSxJQUFJLElBQUksU0FBUyxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLGVBQWUsQ0FBQyxDQUFDO0FBQ3hEO0FBQ0EsSUFBSSxJQUFJLENBQUMsU0FBUyxFQUFFO0FBQ3BCLE1BQU0sTUFBTSxJQUFJLEtBQUssQ0FBQyxxQkFBcUIsR0FBRyxlQUFlLEdBQUcsK0JBQStCLEdBQUcsSUFBSSxDQUFDLEVBQUUsR0FBRyxHQUFHLENBQUMsQ0FBQztBQUNqSCxLQUFLO0FBQ0w7QUFDQSxJQUFJLE9BQU8sU0FBUyxDQUFDO0FBQ3JCLEdBQUcsQ0FBQztBQUNKO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsRUFBRSxTQUFTLENBQUMsU0FBUyxDQUFDLGtCQUFrQixHQUFHLFVBQVUsU0FBUyxFQUFFO0FBQ2hFLElBQUksSUFBSSxPQUFPLFNBQVMsS0FBSyxRQUFRLElBQUksU0FBUyxDQUFDLFNBQVMsQ0FBQyxFQUFFO0FBQy9ELE1BQU0sSUFBSTtBQUNWLFFBQVEsT0FBTyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsU0FBUyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQ3pELE9BQU8sQ0FBQyxPQUFPLENBQUMsRUFBRTtBQUNsQjtBQUNBLE9BQU87QUFDUCxLQUFLO0FBQ0w7QUFDQSxJQUFJLElBQUksY0FBYyxHQUFHLFdBQVcsQ0FBQyxTQUFTLEVBQUUsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDLEtBQUssRUFBRSxDQUFDO0FBQ3hFLElBQUksSUFBSSxnQkFBZ0IsR0FBRyxJQUFJLENBQUM7QUFDaEM7QUFDQSxJQUFJLE9BQU8sY0FBYyxDQUFDLE1BQU0sRUFBRTtBQUNsQyxNQUFNLElBQUksR0FBRyxHQUFHLGNBQWMsQ0FBQyxLQUFLLEVBQUUsQ0FBQztBQUN2QztBQUNBLE1BQU0sSUFBSSxDQUFDLEdBQUcsQ0FBQyxNQUFNLEVBQUU7QUFDdkIsUUFBUSxNQUFNO0FBQ2QsT0FBTztBQUNQO0FBQ0EsTUFBTSxnQkFBZ0IsR0FBRyxnQkFBZ0IsQ0FBQyxZQUFZLENBQUMsR0FBRyxDQUFDLENBQUM7QUFDNUQsS0FBSztBQUNMO0FBQ0EsSUFBSSxPQUFPLGdCQUFnQixDQUFDO0FBQzVCLEdBQUcsQ0FBQztBQUNKO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsRUFBRSxTQUFTLENBQUMsU0FBUyxDQUFDLE9BQU8sR0FBRyxVQUFVLFVBQVUsRUFBRTtBQUN0RCxJQUFJLElBQUksRUFBRSxDQUFDO0FBQ1g7QUFDQSxJQUFJLElBQUksS0FBSyxHQUFHLElBQUksQ0FBQztBQUNyQjtBQUNBLElBQUksSUFBSSxDQUFDLFVBQVUsRUFBRTtBQUNyQixNQUFNLE9BQU8sSUFBSSxDQUFDLGlCQUFpQixJQUFJLFlBQVksQ0FBQztBQUNwRCxLQUFLO0FBQ0w7QUFDQSxJQUFJLFFBQVEsSUFBSSxDQUFDLElBQUk7QUFDckIsTUFBTSxLQUFLLFVBQVU7QUFDckIsUUFBUSxPQUFPLFNBQVMsQ0FBQyxJQUFJLENBQUMsaUJBQWlCLEVBQUUsVUFBVSxhQUFhLEVBQUUsV0FBVyxFQUFFO0FBQ3ZGLFVBQVUsT0FBTyxhQUFhLEdBQUcsS0FBSyxDQUFDLFlBQVksQ0FBQyxXQUFXLENBQUMsQ0FBQyxPQUFPLENBQUMsVUFBVSxDQUFDLFdBQVcsQ0FBQyxJQUFJLGFBQWEsQ0FBQyxHQUFHLFlBQVksQ0FBQztBQUNsSSxTQUFTLENBQUMsQ0FBQztBQUNYO0FBQ0EsTUFBTSxLQUFLLFVBQVU7QUFDckIsUUFBUSxJQUFJLFFBQVEsQ0FBQyxVQUFVLENBQUMsRUFBRTtBQUNsQyxVQUFVLElBQUksWUFBWSxHQUFHLElBQUksQ0FBQyxZQUFZLENBQUMsVUFBVSxDQUFDLENBQUM7QUFDM0Q7QUFDQSxVQUFVLElBQUksWUFBWSxDQUFDLElBQUksS0FBSyxVQUFVLElBQUksWUFBWSxDQUFDLElBQUksS0FBSyxVQUFVLEVBQUU7QUFDcEYsWUFBWSxPQUFPLEVBQUUsR0FBRyxFQUFFLEVBQUUsRUFBRSxDQUFDLFVBQVUsQ0FBQyxHQUFHLFlBQVksQ0FBQyxpQkFBaUIsRUFBRSxFQUFFLENBQUM7QUFDaEYsV0FBVztBQUNYO0FBQ0EsVUFBVSxPQUFPLFVBQVUsQ0FBQztBQUM1QixTQUFTO0FBQ1Q7QUFDQSxRQUFRLElBQUksQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUMsTUFBTSxFQUFFO0FBQ3RDLFVBQVUsT0FBTyxJQUFJLENBQUMsaUJBQWlCLElBQUksRUFBRSxDQUFDO0FBQzlDLFNBQVM7QUFDVDtBQUNBLFFBQVEsT0FBTyxTQUFTLENBQUMsVUFBVSxFQUFFLFVBQVUsYUFBYSxFQUFFLFdBQVcsRUFBRTtBQUMzRSxVQUFVLE9BQU8sYUFBYSxHQUFHLEtBQUssQ0FBQyxZQUFZLENBQUMsV0FBVyxDQUFDLENBQUMsT0FBTyxDQUFDLGFBQWEsQ0FBQyxHQUFHLFlBQVksQ0FBQztBQUN2RyxTQUFTLENBQUMsQ0FBQztBQUNYO0FBQ0EsTUFBTTtBQUNOLFFBQVEsT0FBTyxVQUFVLElBQUksWUFBWSxDQUFDO0FBQzFDLEtBQUs7QUFDTCxHQUFHLENBQUM7QUFDSjtBQUNBLEVBQUUsU0FBUyxDQUFDLFNBQVMsQ0FBQyxlQUFlLEdBQUcsVUFBVSxlQUFlLEVBQUU7QUFDbkUsSUFBSSxJQUFJLFNBQVMsQ0FBQyxlQUFlLENBQUMsRUFBRTtBQUNwQyxNQUFNLElBQUksU0FBUyxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLGVBQWUsQ0FBQyxLQUFLLENBQUMsZ0JBQWdCLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQztBQUN6RjtBQUNBLE1BQU0sSUFBSSxDQUFDLFNBQVMsRUFBRTtBQUN0QixRQUFRLE1BQU0sSUFBSSxLQUFLLENBQUMsNkJBQTZCLEdBQUcsZUFBZSxHQUFHLEdBQUcsQ0FBQyxDQUFDO0FBQy9FLE9BQU87QUFDUDtBQUNBLE1BQU0sT0FBTyxTQUFTLENBQUMsSUFBSSxDQUFDO0FBQzVCLEtBQUs7QUFDTDtBQUNBLElBQUksT0FBTyxXQUFXLENBQUMsZUFBZSxFQUFFLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQztBQUN4RCxHQUFHLENBQUM7QUFDSjtBQUNBLEVBQUUsTUFBTSxDQUFDLGNBQWMsQ0FBQyxTQUFTLENBQUMsU0FBUyxFQUFFLG1CQUFtQixFQUFFO0FBQ2xFLElBQUksR0FBRyxFQUFFLFlBQVk7QUFDckIsTUFBTSxJQUFJLEVBQUUsQ0FBQztBQUNiO0FBQ0EsTUFBTSxJQUFJLElBQUksQ0FBQyxPQUFPLENBQUMsaUJBQWlCLEVBQUU7QUFDMUMsUUFBUSxPQUFPLElBQUksQ0FBQyxPQUFPLENBQUMsaUJBQWlCLENBQUM7QUFDOUMsT0FBTztBQUNQO0FBQ0EsTUFBTSxJQUFJLGlCQUFpQixDQUFDO0FBQzVCO0FBQ0EsTUFBTSxJQUFJLElBQUksQ0FBQyxJQUFJLEtBQUssVUFBVSxFQUFFO0FBQ3BDLFFBQVEsaUJBQWlCLEdBQUcsZUFBZSxDQUFDLElBQUksQ0FBQyxNQUFNLEVBQUUsVUFBVSxLQUFLLEVBQUU7QUFDMUUsVUFBVSxPQUFPLEtBQUssQ0FBQyxpQkFBaUIsSUFBSSxZQUFZLENBQUM7QUFDekQsU0FBUyxFQUFFLFVBQVUsU0FBUyxFQUFFO0FBQ2hDLFVBQVUsT0FBTyxFQUFFLFNBQVMsQ0FBQyxJQUFJLEtBQUssU0FBUyxDQUFDLENBQUM7QUFDakQsU0FBUyxDQUFDLENBQUM7QUFDWCxPQUFPLE1BQU0sSUFBSSxJQUFJLENBQUMsT0FBTyxLQUFLLFNBQVMsRUFBRTtBQUM3QyxRQUFRLElBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsRUFBRTtBQUN4QyxVQUFVLE1BQU0sSUFBSSxLQUFLLENBQUMsaUJBQWlCLEdBQUcsSUFBSSxDQUFDLE9BQU8sR0FBRyxrQkFBa0IsR0FBRyxJQUFJLENBQUMsR0FBRyxHQUFHLEdBQUcsQ0FBQyxDQUFDO0FBQ2xHLFNBQVM7QUFDVDtBQUNBLFFBQVEsaUJBQWlCLEdBQUcsVUFBVSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLE9BQU8sSUFBSSxFQUFFLEdBQUcsRUFBRSxFQUFFLEVBQUUsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUMsaUJBQWlCLEVBQUUsRUFBRSxDQUFDLENBQUM7QUFDakssT0FBTztBQUNQO0FBQ0EsTUFBTSxJQUFJLENBQUMsT0FBTyxDQUFDLGlCQUFpQixHQUFHLGlCQUFpQixDQUFDO0FBQ3pELE1BQU0sT0FBTyxJQUFJLENBQUMsT0FBTyxDQUFDLGlCQUFpQixDQUFDO0FBQzVDLEtBQUs7QUFDTCxJQUFJLFVBQVUsRUFBRSxLQUFLO0FBQ3JCLElBQUksWUFBWSxFQUFFLElBQUk7QUFDdEIsR0FBRyxDQUFDLENBQUM7QUFDTDtBQUNBLEVBQUUsU0FBUyxDQUFDLFNBQVMsQ0FBQyxlQUFlLEdBQUcsVUFBVSxVQUFVLEVBQUUsT0FBTyxFQUFFO0FBQ3ZFLElBQUksSUFBSSxhQUFhLEdBQUcsSUFBSSxDQUFDLGFBQWEsQ0FBQyxVQUFVLENBQUMsQ0FBQztBQUN2RCxJQUFJLE9BQU8sSUFBSSxDQUFDLGlCQUFpQixDQUFDO0FBQ2xDLE1BQU0sYUFBYSxFQUFFLGFBQWE7QUFDbEMsTUFBTSxRQUFRLEVBQUUsYUFBYTtBQUM3QixNQUFNLE9BQU8sRUFBRSxFQUFFO0FBQ2pCLE1BQU0sV0FBVyxFQUFFLEVBQUU7QUFDckIsTUFBTSxNQUFNLEVBQUUsU0FBUztBQUN2QixNQUFNLE9BQU8sRUFBRSxFQUFFO0FBQ2pCLEtBQUssRUFBRSxTQUFTLEVBQUUsU0FBUyxFQUFFLE9BQU8sQ0FBQyxDQUFDO0FBQ3RDLEdBQUcsQ0FBQztBQUNKO0FBQ0EsRUFBRSxNQUFNLENBQUMsY0FBYyxDQUFDLFNBQVMsQ0FBQyxTQUFTLEVBQUUsY0FBYyxFQUFFO0FBQzdEO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsSUFBSSxHQUFHLEVBQUUsWUFBWTtBQUNyQixNQUFNLElBQUksQ0FBQyxLQUFLLEVBQUUsQ0FBQztBQUNuQjtBQUNBO0FBQ0EsTUFBTSxJQUFJLGlCQUFpQixHQUFHLElBQUksQ0FBQyxpQkFBaUIsQ0FBQztBQUNyRDtBQUNBLE1BQU0sSUFBSSxDQUFDLGlCQUFpQixFQUFFO0FBQzlCLFFBQVEsTUFBTSxJQUFJLEtBQUssQ0FBQyxtREFBbUQsR0FBRyxJQUFJLENBQUMsRUFBRSxHQUFHLElBQUksQ0FBQyxDQUFDO0FBQzlGLE9BQU87QUFDUDtBQUNBLE1BQU0sT0FBTyxJQUFJLENBQUMsZUFBZSxDQUFDLGlCQUFpQixDQUFDLENBQUM7QUFDckQsS0FBSztBQUNMLElBQUksVUFBVSxFQUFFLEtBQUs7QUFDckIsSUFBSSxZQUFZLEVBQUUsSUFBSTtBQUN0QixHQUFHLENBQUMsQ0FBQztBQUNMLEVBQUUsTUFBTSxDQUFDLGNBQWMsQ0FBQyxTQUFTLENBQUMsU0FBUyxFQUFFLFFBQVEsRUFBRTtBQUN2RDtBQUNBO0FBQ0E7QUFDQTtBQUNBLElBQUksR0FBRyxFQUFFLFlBQVk7QUFDckIsTUFBTSxJQUFJLE1BQU0sQ0FBQztBQUNqQjtBQUNBLE1BQU0sSUFBSSxJQUFJLENBQUMsSUFBSSxLQUFLLFNBQVMsRUFBRTtBQUNuQyxRQUFRLElBQUksYUFBYSxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUM7QUFDeEM7QUFDQSxRQUFRLElBQUksUUFBUSxDQUFDLGFBQWEsQ0FBQyxNQUFNLENBQUMsRUFBRTtBQUM1QyxVQUFVLE1BQU0sR0FBRyxTQUFTLENBQUMsYUFBYSxDQUFDLE1BQU0sQ0FBQyxHQUFHLGdCQUFnQixDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsZ0JBQWdCLENBQUMsYUFBYSxDQUFDLE1BQU0sQ0FBQyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxhQUFhLENBQUMsTUFBTSxDQUFDO0FBQ25MLFNBQVMsTUFBTTtBQUNmLFVBQVUsTUFBTSxHQUFHLGFBQWEsQ0FBQyxNQUFNLENBQUM7QUFDeEMsU0FBUztBQUNULE9BQU87QUFDUDtBQUNBLE1BQU0sT0FBTyxNQUFNLENBQUM7QUFDcEIsS0FBSztBQUNMLElBQUksVUFBVSxFQUFFLEtBQUs7QUFDckIsSUFBSSxZQUFZLEVBQUUsSUFBSTtBQUN0QixHQUFHLENBQUMsQ0FBQztBQUNMO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxFQUFFLFNBQVMsQ0FBQyxTQUFTLENBQUMscUJBQXFCLEdBQUcsVUFBVSxlQUFlLEVBQUUsWUFBWSxFQUFFLE9BQU8sRUFBRTtBQUNoRyxJQUFJLElBQUksT0FBTyxLQUFLLEtBQUssQ0FBQyxFQUFFO0FBQzVCLE1BQU0sT0FBTyxHQUFHLElBQUksQ0FBQztBQUNyQixLQUFLO0FBQ0w7QUFDQSxJQUFJLE9BQU8sT0FBTyxHQUFHLGVBQWUsQ0FBQyxJQUFJLEtBQUssU0FBUyxHQUFHLGVBQWUsQ0FBQyxjQUFjLENBQUMsWUFBWSxDQUFDLEdBQUcsZUFBZSxDQUFDLGlCQUFpQixHQUFHLENBQUMsZUFBZSxDQUFDLENBQUM7QUFDL0osR0FBRyxDQUFDO0FBQ0o7QUFDQSxFQUFFLE1BQU0sQ0FBQyxjQUFjLENBQUMsU0FBUyxDQUFDLFNBQVMsRUFBRSxtQkFBbUIsRUFBRTtBQUNsRSxJQUFJLEdBQUcsRUFBRSxZQUFZO0FBQ3JCLE1BQU0sSUFBSSxLQUFLLEdBQUcsSUFBSSxDQUFDO0FBQ3ZCO0FBQ0EsTUFBTSxJQUFJLFVBQVUsQ0FBQyxJQUFJLENBQUMsRUFBRTtBQUM1QixRQUFRLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUN0QixPQUFPO0FBQ1A7QUFDQTtBQUNBLE1BQU0sSUFBSSxJQUFJLENBQUMsSUFBSSxLQUFLLFVBQVUsSUFBSSxDQUFDLElBQUksQ0FBQyxPQUFPLEVBQUU7QUFDckQsUUFBUSxJQUFJLENBQUMsYUFBYSxFQUFFO0FBQzVCLFVBQVUsSUFBSSxDQUFDLEtBQUssRUFBRSx1QkFBdUIsR0FBRyxJQUFJLENBQUMsRUFBRSxHQUFHLHlCQUF5QixDQUFDLENBQUM7QUFDckYsU0FBUztBQUNUO0FBQ0EsUUFBUSxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUM7QUFDdEIsT0FBTztBQUNQO0FBQ0EsTUFBTSxJQUFJLHFCQUFxQixHQUFHLFlBQVksQ0FBQyxJQUFJLENBQUMsaUJBQWlCLENBQUMsQ0FBQztBQUN2RSxNQUFNLE9BQU8sT0FBTyxDQUFDLHFCQUFxQixDQUFDLEdBQUcsQ0FBQyxVQUFVLFdBQVcsRUFBRTtBQUN0RSxRQUFRLE9BQU8sS0FBSyxDQUFDLG1CQUFtQixDQUFDLFdBQVcsQ0FBQyxDQUFDO0FBQ3RELE9BQU8sQ0FBQyxDQUFDLENBQUM7QUFDVixLQUFLO0FBQ0wsSUFBSSxVQUFVLEVBQUUsS0FBSztBQUNyQixJQUFJLFlBQVksRUFBRSxJQUFJO0FBQ3RCLEdBQUcsQ0FBQyxDQUFDO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxFQUFFLFNBQVMsQ0FBQyxTQUFTLENBQUMsbUJBQW1CLEdBQUcsVUFBVSxZQUFZLEVBQUU7QUFDcEUsSUFBSSxJQUFJLENBQUMsWUFBWSxDQUFDLE1BQU0sRUFBRTtBQUM5QixNQUFNLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUNwQixLQUFLO0FBQ0w7QUFDQSxJQUFJLElBQUksRUFBRSxHQUFHLE1BQU0sQ0FBQyxZQUFZLENBQUM7QUFDakMsUUFBUSxRQUFRLEdBQUcsRUFBRSxDQUFDLENBQUMsQ0FBQztBQUN4QixRQUFRLGNBQWMsR0FBRyxFQUFFLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQ3JDO0FBQ0EsSUFBSSxJQUFJLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRTtBQUN0QixNQUFNLE1BQU0sSUFBSSxLQUFLLENBQUMsMkJBQTJCLEdBQUcsUUFBUSxHQUFHLDRCQUE0QixDQUFDLENBQUM7QUFDN0YsS0FBSztBQUNMO0FBQ0EsSUFBSSxJQUFJLGNBQWMsR0FBRyxJQUFJLENBQUMsWUFBWSxDQUFDLFFBQVEsQ0FBQyxDQUFDO0FBQ3JEO0FBQ0EsSUFBSSxJQUFJLGNBQWMsQ0FBQyxJQUFJLEtBQUssU0FBUyxFQUFFO0FBQzNDLE1BQU0sT0FBTyxjQUFjLENBQUMsY0FBYyxFQUFFLENBQUM7QUFDN0MsS0FBSztBQUNMO0FBQ0EsSUFBSSxJQUFJLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsRUFBRTtBQUNoQyxNQUFNLE1BQU0sSUFBSSxLQUFLLENBQUMsZUFBZSxHQUFHLFFBQVEsR0FBRyx1QkFBdUIsR0FBRyxJQUFJLENBQUMsRUFBRSxHQUFHLEdBQUcsQ0FBQyxDQUFDO0FBQzVGLEtBQUs7QUFDTDtBQUNBLElBQUksT0FBTyxJQUFJLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxDQUFDLG1CQUFtQixDQUFDLGNBQWMsQ0FBQyxDQUFDO0FBQ3JFLEdBQUcsQ0FBQztBQUNKO0FBQ0EsRUFBRSxTQUFTLENBQUMsU0FBUyxDQUFDLFlBQVksR0FBRyxVQUFVLGtCQUFrQixFQUFFO0FBQ25FLElBQUksSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsTUFBTSxFQUFFO0FBQ25DLE1BQU0sT0FBTyxTQUFTLENBQUM7QUFDdkIsS0FBSztBQUNMO0FBQ0EsSUFBSSxPQUFPO0FBQ1gsTUFBTSxPQUFPLEVBQUUsa0JBQWtCLElBQUksSUFBSSxDQUFDLGlCQUFpQjtBQUMzRCxNQUFNLE1BQU0sRUFBRSxlQUFlLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRSxVQUFVLFNBQVMsRUFBRSxHQUFHLEVBQUU7QUFDckUsUUFBUSxJQUFJLENBQUMsa0JBQWtCLEVBQUU7QUFDakMsVUFBVSxPQUFPLFNBQVMsQ0FBQyxZQUFZLEVBQUUsQ0FBQztBQUMxQyxTQUFTO0FBQ1Q7QUFDQSxRQUFRLElBQUksYUFBYSxHQUFHLFFBQVEsQ0FBQyxrQkFBa0IsQ0FBQyxHQUFHLFNBQVMsR0FBRyxrQkFBa0IsQ0FBQyxHQUFHLENBQUMsQ0FBQztBQUMvRixRQUFRLE9BQU8sU0FBUyxDQUFDLFlBQVksQ0FBQyxhQUFhLElBQUksU0FBUyxDQUFDLGlCQUFpQixDQUFDLENBQUM7QUFDcEYsT0FBTyxFQUFFLFVBQVUsU0FBUyxFQUFFO0FBQzlCLFFBQVEsT0FBTyxDQUFDLFNBQVMsQ0FBQyxPQUFPLENBQUM7QUFDbEMsT0FBTyxDQUFDO0FBQ1IsS0FBSyxDQUFDO0FBQ04sR0FBRyxDQUFDO0FBQ0o7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEVBQUUsU0FBUyxDQUFDLFNBQVMsQ0FBQyxjQUFjLEdBQUcsVUFBVSxZQUFZLEVBQUU7QUFDL0QsSUFBSSxJQUFJLEtBQUssR0FBRyxJQUFJLENBQUM7QUFDckI7QUFDQSxJQUFJLElBQUksSUFBSSxDQUFDLElBQUksS0FBSyxTQUFTLEVBQUU7QUFDakMsTUFBTSxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUM7QUFDcEIsS0FBSztBQUNMO0FBQ0EsSUFBSSxJQUFJLE1BQU0sR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDO0FBQzdCO0FBQ0EsSUFBSSxJQUFJLENBQUMsWUFBWSxFQUFFO0FBQ3ZCLE1BQU0sSUFBSSxhQUFhLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQztBQUN0QyxNQUFNLE9BQU8sYUFBYSxHQUFHLE9BQU8sQ0FBQyxZQUFZLENBQUMsYUFBYSxDQUFDLENBQUMsR0FBRyxDQUFDLFVBQVUsaUJBQWlCLEVBQUU7QUFDbEcsUUFBUSxPQUFPLE1BQU0sQ0FBQyxtQkFBbUIsQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDO0FBQzdELE9BQU8sQ0FBQyxDQUFDLEdBQUcsTUFBTSxDQUFDLGlCQUFpQixDQUFDO0FBQ3JDLEtBQUs7QUFDTDtBQUNBLElBQUksSUFBSSxlQUFlLEdBQUcsVUFBVSxDQUFDLE1BQU0sQ0FBQyxJQUFJLEVBQUUsUUFBUSxDQUFDLENBQUMsWUFBWSxDQUFDLENBQUMsT0FBTyxDQUFDO0FBQ2xGO0FBQ0EsSUFBSSxJQUFJLFFBQVEsQ0FBQyxlQUFlLENBQUMsRUFBRTtBQUNuQyxNQUFNLE9BQU8sQ0FBQyxNQUFNLENBQUMsWUFBWSxDQUFDLGVBQWUsQ0FBQyxDQUFDLENBQUM7QUFDcEQsS0FBSztBQUNMO0FBQ0EsSUFBSSxPQUFPLE9BQU8sQ0FBQyxZQUFZLENBQUMsZUFBZSxDQUFDLENBQUMsR0FBRyxDQUFDLFVBQVUsWUFBWSxFQUFFO0FBQzdFLE1BQU0sT0FBTyxLQUFLLENBQUMsT0FBTyxLQUFLLE1BQU0sR0FBRyxNQUFNLENBQUMsbUJBQW1CLENBQUMsWUFBWSxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDcEgsS0FBSyxDQUFDLENBQUMsQ0FBQztBQUNSLEdBQUcsQ0FBQztBQUNKO0FBQ0EsRUFBRSxNQUFNLENBQUMsY0FBYyxDQUFDLFNBQVMsQ0FBQyxTQUFTLEVBQUUsVUFBVSxFQUFFO0FBQ3pEO0FBQ0E7QUFDQTtBQUNBLElBQUksR0FBRyxFQUFFLFlBQVk7QUFDckIsTUFBTSxJQUFJLEtBQUssR0FBRyxJQUFJLENBQUM7QUFDdkI7QUFDQSxNQUFNLElBQUksYUFBYSxHQUFHLE9BQU8sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLEdBQUcsQ0FBQyxVQUFVLFFBQVEsRUFBRTtBQUM1RSxRQUFRLE9BQU8sS0FBSyxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsQ0FBQyxRQUFRLENBQUM7QUFDL0MsT0FBTyxDQUFDLENBQUMsQ0FBQztBQUNWLE1BQU0sT0FBTyxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQyxNQUFNLENBQUMsYUFBYSxDQUFDLENBQUM7QUFDN0MsS0FBSztBQUNMLElBQUksVUFBVSxFQUFFLEtBQUs7QUFDckIsSUFBSSxZQUFZLEVBQUUsSUFBSTtBQUN0QixHQUFHLENBQUMsQ0FBQztBQUNMLEVBQUUsTUFBTSxDQUFDLGNBQWMsQ0FBQyxTQUFTLENBQUMsU0FBUyxFQUFFLFFBQVEsRUFBRTtBQUN2RDtBQUNBO0FBQ0E7QUFDQSxJQUFJLEdBQUcsRUFBRSxZQUFZO0FBQ3JCLE1BQU0sSUFBSSxHQUFHLEVBQUUsRUFBRSxFQUFFLEdBQUcsRUFBRSxFQUFFLENBQUM7QUFDM0I7QUFDQSxNQUFNLElBQUksSUFBSSxDQUFDLE9BQU8sQ0FBQyxNQUFNLEVBQUU7QUFDL0IsUUFBUSxPQUFPLElBQUksQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDO0FBQ25DLE9BQU87QUFDUDtBQUNBLE1BQU0sSUFBSSxNQUFNLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQztBQUMvQixNQUFNLElBQUksTUFBTSxHQUFHLElBQUksR0FBRyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQztBQUMzQztBQUNBLE1BQU0sSUFBSSxNQUFNLEVBQUU7QUFDbEIsUUFBUSxJQUFJO0FBQ1osVUFBVSxLQUFLLElBQUksRUFBRSxHQUFHLFFBQVEsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsRUFBRSxFQUFFLEdBQUcsRUFBRSxDQUFDLElBQUksRUFBRSxFQUFFLENBQUMsRUFBRSxDQUFDLElBQUksRUFBRSxFQUFFLEdBQUcsRUFBRSxDQUFDLElBQUksRUFBRSxFQUFFO0FBQzFGLFlBQVksSUFBSSxPQUFPLEdBQUcsRUFBRSxDQUFDLEtBQUssQ0FBQztBQUNuQyxZQUFZLElBQUksS0FBSyxHQUFHLE1BQU0sQ0FBQyxPQUFPLENBQUMsQ0FBQztBQUN4QztBQUNBLFlBQVksSUFBSSxLQUFLLENBQUMsTUFBTSxFQUFFO0FBQzlCLGNBQWMsSUFBSTtBQUNsQixnQkFBZ0IsS0FBSyxJQUFJLEVBQUUsSUFBSSxHQUFHLEdBQUcsS0FBSyxDQUFDLEVBQUUsUUFBUSxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsQ0FBQyxFQUFFLEVBQUUsR0FBRyxFQUFFLENBQUMsSUFBSSxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUMsSUFBSSxFQUFFLEVBQUUsR0FBRyxFQUFFLENBQUMsSUFBSSxFQUFFLEVBQUU7QUFDaEgsa0JBQWtCLElBQUksT0FBTyxHQUFHLEVBQUUsQ0FBQyxLQUFLLENBQUM7QUFDekMsa0JBQWtCLE1BQU0sQ0FBQyxHQUFHLENBQUMsRUFBRSxHQUFHLE9BQU8sQ0FBQyxDQUFDO0FBQzNDLGlCQUFpQjtBQUNqQixlQUFlLENBQUMsT0FBTyxLQUFLLEVBQUU7QUFDOUIsZ0JBQWdCLEdBQUcsR0FBRztBQUN0QixrQkFBa0IsS0FBSyxFQUFFLEtBQUs7QUFDOUIsaUJBQWlCLENBQUM7QUFDbEIsZUFBZSxTQUFTO0FBQ3hCLGdCQUFnQixJQUFJO0FBQ3BCLGtCQUFrQixJQUFJLEVBQUUsSUFBSSxDQUFDLEVBQUUsQ0FBQyxJQUFJLEtBQUssRUFBRSxHQUFHLEVBQUUsQ0FBQyxNQUFNLENBQUMsRUFBRSxFQUFFLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDO0FBQ3RFLGlCQUFpQixTQUFTO0FBQzFCLGtCQUFrQixJQUFJLEdBQUcsRUFBRSxNQUFNLEdBQUcsQ0FBQyxLQUFLLENBQUM7QUFDM0MsaUJBQWlCO0FBQ2pCLGVBQWU7QUFDZixhQUFhO0FBQ2IsV0FBVztBQUNYLFNBQVMsQ0FBQyxPQUFPLEtBQUssRUFBRTtBQUN4QixVQUFVLEdBQUcsR0FBRztBQUNoQixZQUFZLEtBQUssRUFBRSxLQUFLO0FBQ3hCLFdBQVcsQ0FBQztBQUNaLFNBQVMsU0FBUztBQUNsQixVQUFVLElBQUk7QUFDZCxZQUFZLElBQUksRUFBRSxJQUFJLENBQUMsRUFBRSxDQUFDLElBQUksS0FBSyxFQUFFLEdBQUcsRUFBRSxDQUFDLE1BQU0sQ0FBQyxFQUFFLEVBQUUsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUM7QUFDaEUsV0FBVyxTQUFTO0FBQ3BCLFlBQVksSUFBSSxHQUFHLEVBQUUsTUFBTSxHQUFHLENBQUMsS0FBSyxDQUFDO0FBQ3JDLFdBQVc7QUFDWCxTQUFTO0FBQ1QsT0FBTztBQUNQO0FBQ0EsTUFBTSxPQUFPLElBQUksQ0FBQyxPQUFPLENBQUMsTUFBTSxHQUFHLEtBQUssQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUM7QUFDdEQsS0FBSztBQUNMLElBQUksVUFBVSxFQUFFLEtBQUs7QUFDckIsSUFBSSxZQUFZLEVBQUUsSUFBSTtBQUN0QixHQUFHLENBQUMsQ0FBQztBQUNMLEVBQUUsTUFBTSxDQUFDLGNBQWMsQ0FBQyxTQUFTLENBQUMsU0FBUyxFQUFFLFdBQVcsRUFBRTtBQUMxRDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsSUFBSSxHQUFHLEVBQUUsWUFBWTtBQUNyQixNQUFNLElBQUksTUFBTSxHQUFHLElBQUksR0FBRyxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsTUFBTSxDQUFDLFVBQVUsVUFBVSxFQUFFO0FBQ3pFLFFBQVEsT0FBTyxFQUFFLENBQUMsVUFBVSxDQUFDLE1BQU0sSUFBSSxDQUFDLFVBQVUsQ0FBQyxPQUFPLENBQUMsTUFBTSxJQUFJLFVBQVUsQ0FBQyxRQUFRLENBQUMsQ0FBQztBQUMxRixPQUFPLENBQUMsQ0FBQyxHQUFHLENBQUMsVUFBVSxVQUFVLEVBQUU7QUFDbkMsUUFBUSxPQUFPLFVBQVUsQ0FBQyxTQUFTLENBQUM7QUFDcEMsT0FBTyxDQUFDLENBQUMsQ0FBQztBQUNWLE1BQU0sT0FBTyxLQUFLLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDO0FBQ2hDLEtBQUs7QUFDTCxJQUFJLFVBQVUsRUFBRSxLQUFLO0FBQ3JCLElBQUksWUFBWSxFQUFFLElBQUk7QUFDdEIsR0FBRyxDQUFDLENBQUM7QUFDTDtBQUNBLEVBQUUsU0FBUyxDQUFDLFNBQVMsQ0FBQyxhQUFhLEdBQUcsVUFBVSxPQUFPLEVBQUU7QUFDekQsSUFBSSxJQUFJLEtBQUssR0FBRyxJQUFJLENBQUM7QUFDckI7QUFDQSxJQUFJLElBQUksT0FBTyxLQUFLLFNBQVMsRUFBRTtBQUMvQjtBQUNBLE1BQU0sT0FBTyxTQUFTLENBQUM7QUFDdkIsS0FBSztBQUNMO0FBQ0EsSUFBSSxPQUFPLE9BQU8sQ0FBQyxHQUFHLENBQUMsVUFBVSxNQUFNLEVBQUU7QUFDekMsTUFBTSxJQUFJLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQyxFQUFFO0FBQzdCLFFBQVEsT0FBTyxNQUFNLENBQUM7QUFDdEIsT0FBTztBQUNQO0FBQ0EsTUFBTSxJQUFJLGdCQUFnQixHQUFHLE1BQU0sQ0FBQyxDQUFDLENBQUMsS0FBSyxLQUFLLENBQUMsU0FBUyxDQUFDO0FBQzNEO0FBQ0E7QUFDQSxNQUFNLElBQUksZ0JBQWdCLElBQUksQ0FBQyxLQUFLLENBQUMsTUFBTSxFQUFFO0FBQzdDLFFBQVEsT0FBTyxLQUFLLENBQUMsa0JBQWtCLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQ3pELE9BQU87QUFDUDtBQUNBLE1BQU0sSUFBSSxjQUFjLEdBQUcsZ0JBQWdCLEdBQUcsS0FBSyxDQUFDLEdBQUcsR0FBRyxNQUFNLEdBQUcsTUFBTSxDQUFDO0FBQzFFO0FBQ0EsTUFBTSxJQUFJLEtBQUssQ0FBQyxNQUFNLEVBQUU7QUFDeEIsUUFBUSxJQUFJO0FBQ1osVUFBVSxJQUFJLGVBQWUsR0FBRyxLQUFLLENBQUMsTUFBTSxDQUFDLGtCQUFrQixDQUFDLGNBQWMsQ0FBQyxDQUFDO0FBQ2hGO0FBQ0EsVUFBVSxPQUFPLGVBQWUsQ0FBQztBQUNqQyxTQUFTLENBQUMsT0FBTyxHQUFHLEVBQUU7QUFDdEIsVUFBVSxNQUFNLElBQUksS0FBSyxDQUFDLGdEQUFnRCxHQUFHLEtBQUssQ0FBQyxFQUFFLEdBQUcsTUFBTSxHQUFHLEdBQUcsQ0FBQyxPQUFPLENBQUMsQ0FBQztBQUM5RyxTQUFTO0FBQ1QsT0FBTyxNQUFNO0FBQ2IsUUFBUSxPQUFPLEtBQUssQ0FBQyxrQkFBa0IsQ0FBQyxjQUFjLENBQUMsQ0FBQztBQUN4RCxPQUFPO0FBQ1AsS0FBSyxDQUFDLENBQUM7QUFDUCxHQUFHLENBQUM7QUFDSjtBQUNBLEVBQUUsU0FBUyxDQUFDLFNBQVMsQ0FBQyxnQkFBZ0IsR0FBRyxVQUFVLGdCQUFnQixFQUFFO0FBQ3JFLElBQUksSUFBSSxLQUFLLEdBQUcsSUFBSSxDQUFDO0FBQ3JCO0FBQ0EsSUFBSSxJQUFJLGdCQUFnQixHQUFHLGVBQWUsQ0FBQyxnQkFBZ0IsQ0FBQyxNQUFNLENBQUMsQ0FBQztBQUNwRSxJQUFJLElBQUksUUFBUSxHQUFHLFVBQVUsSUFBSSxnQkFBZ0IsR0FBRyxnQkFBZ0IsQ0FBQyxRQUFRLEdBQUcsZ0JBQWdCLEdBQUcsZ0JBQWdCLENBQUMsSUFBSSxDQUFDLFVBQVUsT0FBTyxFQUFFO0FBQzVJLE1BQU0sT0FBTyxRQUFRLENBQUMsT0FBTyxDQUFDLElBQUksT0FBTyxDQUFDLENBQUMsQ0FBQyxLQUFLLEtBQUssQ0FBQyxTQUFTLENBQUM7QUFDakUsS0FBSyxDQUFDLEdBQUcsSUFBSSxDQUFDO0FBQ2QsSUFBSSxJQUFJLE1BQU0sR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUM7QUFDN0MsSUFBSSxJQUFJLE1BQU0sR0FBRyxJQUFJLENBQUMsYUFBYSxDQUFDLGdCQUFnQixDQUFDLENBQUM7QUFDdEQ7QUFDQSxJQUFJLElBQUksVUFBVSxHQUFHLFFBQVEsQ0FBQyxRQUFRLENBQUMsRUFBRSxFQUFFLGdCQUFnQixDQUFDLEVBQUU7QUFDOUQsTUFBTSxPQUFPLEVBQUUsZUFBZSxDQUFDLE9BQU8sQ0FBQyxnQkFBZ0IsQ0FBQyxPQUFPLENBQUMsQ0FBQztBQUNqRSxNQUFNLElBQUksRUFBRSxPQUFPLENBQUMsZ0JBQWdCLENBQUMsSUFBSSxFQUFFLE1BQU0sQ0FBQztBQUNsRCxNQUFNLE1BQU0sRUFBRSxNQUFNO0FBQ3BCLE1BQU0sTUFBTSxFQUFFLElBQUk7QUFDbEIsTUFBTSxRQUFRLEVBQUUsUUFBUTtBQUN4QixNQUFNLFNBQVMsRUFBRSxnQkFBZ0IsQ0FBQyxLQUFLO0FBQ3ZDLE1BQU0sTUFBTSxFQUFFLFlBQVk7QUFDMUIsUUFBUSxPQUFPLFFBQVEsQ0FBQyxRQUFRLENBQUMsRUFBRSxFQUFFLFVBQVUsQ0FBQyxFQUFFO0FBQ2xELFVBQVUsTUFBTSxFQUFFLFVBQVUsQ0FBQyxNQUFNLEdBQUcsVUFBVSxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsVUFBVSxDQUFDLEVBQUU7QUFDekUsWUFBWSxPQUFPLEdBQUcsR0FBRyxDQUFDLENBQUMsRUFBRSxDQUFDO0FBQzlCLFdBQVcsQ0FBQyxHQUFHLFNBQVM7QUFDeEIsVUFBVSxNQUFNLEVBQUUsR0FBRyxHQUFHLEtBQUssQ0FBQyxFQUFFO0FBQ2hDLFNBQVMsQ0FBQyxDQUFDO0FBQ1gsT0FBTztBQUNQLEtBQUssQ0FBQyxDQUFDO0FBQ1A7QUFDQSxJQUFJLE9BQU8sVUFBVSxDQUFDO0FBQ3RCLEdBQUcsQ0FBQztBQUNKO0FBQ0EsRUFBRSxTQUFTLENBQUMsU0FBUyxDQUFDLGlCQUFpQixHQUFHLFlBQVk7QUFDdEQsSUFBSSxJQUFJLEdBQUcsRUFBRSxFQUFFLENBQUM7QUFDaEI7QUFDQSxJQUFJLElBQUksS0FBSyxHQUFHLElBQUksQ0FBQztBQUNyQjtBQUNBLElBQUksSUFBSSxRQUFRLENBQUM7QUFDakI7QUFDQSxJQUFJLElBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLEVBQUUsRUFBRTtBQUN6QixNQUFNLFFBQVEsR0FBRyxFQUFFLENBQUM7QUFDcEIsS0FBSyxNQUFNLElBQUksS0FBSyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQyxFQUFFO0FBQzlDLE1BQU0sUUFBUSxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsRUFBRSxDQUFDO0FBQ2hDLEtBQUssTUFBTTtBQUNYLE1BQU0sSUFBSSxFQUFFLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxFQUFFO0FBQzdCLFVBQVUsRUFBRSxHQUFHLFFBQVE7QUFDdkIsVUFBVSxFQUFFLEdBQUcsRUFBRSxDQUFDLEVBQUUsQ0FBQztBQUNyQixVQUFVLGVBQWUsR0FBRyxFQUFFLEtBQUssS0FBSyxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUU7QUFDbkQsVUFBVSx5QkFBeUIsR0FBRyxNQUFNLENBQUMsRUFBRSxFQUFFLENBQUMsT0FBTyxFQUFFLEtBQUssUUFBUSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxDQUFDLENBQUMsQ0FBQztBQUMxRjtBQUNBLE1BQU0sUUFBUSxHQUFHLE9BQU8sQ0FBQyxJQUFJLENBQUMseUJBQXlCLENBQUMsQ0FBQyxHQUFHLENBQUMsVUFBVSxHQUFHLEVBQUU7QUFDNUUsUUFBUSxJQUFJLENBQUMsYUFBYSxJQUFJLEdBQUcsS0FBSyxVQUFVLEVBQUU7QUFDbEQsVUFBVSxJQUFJLENBQUMsS0FBSyxFQUFFLDJLQUEySyxJQUFJLDZDQUE2QyxHQUFHLEtBQUssQ0FBQyxFQUFFLEdBQUcsS0FBSyxDQUFDLENBQUMsQ0FBQztBQUN4USxTQUFTO0FBQ1Q7QUFDQSxRQUFRLElBQUkscUJBQXFCLEdBQUcsdUJBQXVCLENBQUMsR0FBRyxFQUFFLHlCQUF5QixDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7QUFDakc7QUFDQSxRQUFRLElBQUksQ0FBQyxhQUFhLEVBQUU7QUFDNUIsVUFBVSw2QkFBNkIsQ0FBQyxLQUFLLEVBQUUsR0FBRyxFQUFFLHFCQUFxQixDQUFDLENBQUM7QUFDM0UsU0FBUztBQUNUO0FBQ0EsUUFBUSxPQUFPLHFCQUFxQixDQUFDO0FBQ3JDLE9BQU8sQ0FBQyxDQUFDLE1BQU0sQ0FBQyx1QkFBdUIsQ0FBQyxRQUFRLEVBQUUsZUFBZSxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQ3JFLEtBQUs7QUFDTDtBQUNBLElBQUksSUFBSSxlQUFlLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxNQUFNLEdBQUcsdUJBQXVCLENBQUMsRUFBRSxFQUFFLElBQUksQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLEdBQUcsRUFBRSxDQUFDO0FBQ3BHLElBQUksSUFBSSxVQUFVLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxNQUFNLEdBQUcsdUJBQXVCLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxHQUFHLEVBQUUsQ0FBQztBQUNsSDtBQUNBLElBQUksSUFBSSxDQUFDLGFBQWEsRUFBRTtBQUN4QixNQUFNLElBQUksQ0FBQyxFQUFFLElBQUksQ0FBQyxNQUFNLENBQUMsTUFBTSxJQUFJLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxFQUFFLGlGQUFpRixHQUFHLElBQUksQ0FBQyxFQUFFLEdBQUcsS0FBSyxDQUFDLENBQUM7QUFDdkosS0FBSztBQUNMO0FBQ0EsSUFBSSxJQUFJLFlBQVksR0FBRyxPQUFPLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsVUFBVSxTQUFTLEVBQUU7QUFDcEUsTUFBTSxJQUFJLGlCQUFpQixHQUFHLEVBQUUsQ0FBQztBQUNqQztBQUNBLE1BQU0sSUFBSSxTQUFTLENBQUMsTUFBTSxFQUFFO0FBQzVCLFFBQVEsaUJBQWlCLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxpQkFBaUIsRUFBRSxRQUFRLENBQUMsdUJBQXVCLENBQUMsTUFBTSxDQUFDLFVBQVUsQ0FBQyxTQUFTLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxTQUFTLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQy9JLE9BQU87QUFDUDtBQUNBLE1BQU0sSUFBSSxTQUFTLENBQUMsT0FBTyxFQUFFO0FBQzdCLFFBQVEsaUJBQWlCLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxpQkFBaUIsRUFBRSxRQUFRLENBQUMsdUJBQXVCLENBQUMsTUFBTSxDQUFDVCxPQUFLLENBQUMsU0FBUyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsU0FBUyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUMzSSxPQUFPO0FBQ1A7QUFDQSxNQUFNLE9BQU8saUJBQWlCLENBQUM7QUFDL0IsS0FBSyxDQUFDLENBQUMsQ0FBQztBQUNSLElBQUksSUFBSSxrQkFBa0IsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDO0FBQ3hDLElBQUksSUFBSSxvQkFBb0IsR0FBRyxPQUFPLENBQUMsUUFBUSxDQUFDLFVBQVUsRUFBRSxZQUFZLEVBQUUsUUFBUSxFQUFFLGVBQWUsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxVQUFVLGdCQUFnQixFQUFFO0FBQ3JJLE1BQU0sT0FBTyxPQUFPLENBQUMsZ0JBQWdCLENBQUMsQ0FBQyxHQUFHLENBQUMsVUFBVSxVQUFVLEVBQUU7QUFDakUsUUFBUSxPQUFPLEtBQUssQ0FBQyxnQkFBZ0IsQ0FBQyxVQUFVLENBQUMsQ0FBQztBQUNsRCxPQUFPLENBQUMsQ0FBQztBQUNULEtBQUssQ0FBQyxDQUFDLENBQUM7QUFDUjtBQUNBLElBQUksSUFBSTtBQUNSLE1BQU0sS0FBSyxJQUFJLG9CQUFvQixHQUFHLFFBQVEsQ0FBQyxrQkFBa0IsQ0FBQyxFQUFFLHNCQUFzQixHQUFHLG9CQUFvQixDQUFDLElBQUksRUFBRSxFQUFFLENBQUMsc0JBQXNCLENBQUMsSUFBSSxFQUFFLHNCQUFzQixHQUFHLG9CQUFvQixDQUFDLElBQUksRUFBRSxFQUFFO0FBQzlNLFFBQVEsSUFBSSxpQkFBaUIsR0FBRyxzQkFBc0IsQ0FBQyxLQUFLLENBQUM7QUFDN0QsUUFBUSxvQkFBb0IsQ0FBQyxJQUFJLENBQUMsaUJBQWlCLENBQUMsQ0FBQztBQUNyRCxPQUFPO0FBQ1AsS0FBSyxDQUFDLE9BQU8sS0FBSyxFQUFFO0FBQ3BCLE1BQU0sR0FBRyxHQUFHO0FBQ1osUUFBUSxLQUFLLEVBQUUsS0FBSztBQUNwQixPQUFPLENBQUM7QUFDUixLQUFLLFNBQVM7QUFDZCxNQUFNLElBQUk7QUFDVixRQUFRLElBQUksc0JBQXNCLElBQUksQ0FBQyxzQkFBc0IsQ0FBQyxJQUFJLEtBQUssRUFBRSxHQUFHLG9CQUFvQixDQUFDLE1BQU0sQ0FBQyxFQUFFLEVBQUUsQ0FBQyxJQUFJLENBQUMsb0JBQW9CLENBQUMsQ0FBQztBQUN4SSxPQUFPLFNBQVM7QUFDaEIsUUFBUSxJQUFJLEdBQUcsRUFBRSxNQUFNLEdBQUcsQ0FBQyxLQUFLLENBQUM7QUFDakMsT0FBTztBQUNQLEtBQUs7QUFDTDtBQUNBLElBQUksT0FBTyxvQkFBb0IsQ0FBQztBQUNoQyxHQUFHLENBQUM7QUFDSjtBQUNBLEVBQUUsT0FBTyxTQUFTLENBQUM7QUFDbkIsQ0FBQzs7QUN0Z0RELFNBQVMsT0FBTyxDQUFDLE1BQU0sRUFBRSxPQUFPLEVBQUUsY0FBYyxFQUFFO0FBQ2xELEVBQUUsSUFBSSxjQUFjLEtBQUssS0FBSyxDQUFDLEVBQUU7QUFDakMsSUFBSSxjQUFjLEdBQUcsTUFBTSxDQUFDLE9BQU8sQ0FBQztBQUNwQyxHQUFHO0FBQ0g7QUFDQSxFQUFFLElBQUksc0JBQXNCLEdBQUcsT0FBTyxjQUFjLEtBQUssVUFBVSxHQUFHLGNBQWMsRUFBRSxHQUFHLGNBQWMsQ0FBQztBQUN4RyxFQUFFLE9BQU8sSUFBSSxTQUFTLENBQUMsTUFBTSxFQUFFLE9BQU8sRUFBRSxzQkFBc0IsQ0FBQyxDQUFDO0FBQ2hFLENBQUM7QUFDRDtBQUNBLFNBQVMsYUFBYSxDQUFDLE1BQU0sRUFBRSxPQUFPLEVBQUU7QUFDeEMsRUFBRSxJQUFJLHNCQUFzQixHQUFHLE9BQU8sTUFBTSxDQUFDLE9BQU8sS0FBSyxVQUFVLEdBQUcsTUFBTSxDQUFDLE9BQU8sRUFBRSxHQUFHLE1BQU0sQ0FBQyxPQUFPLENBQUM7QUFDeEcsRUFBRSxPQUFPLElBQUksU0FBUyxDQUFDLE1BQU0sRUFBRSxPQUFPLEVBQUUsc0JBQXNCLENBQUMsQ0FBQztBQUNoRTs7QUNiQSxJQUFJLGNBQWMsR0FBRztBQUNyQixFQUFFLFdBQVcsRUFBRSxLQUFLO0FBQ3BCLENBQUMsQ0FBQztBQUNGO0FBQ0EsSUFBSSxTQUFTO0FBQ2I7QUFDQTtBQUNBO0FBQ0EsWUFBWTtBQUNaLEVBQUUsU0FBUyxTQUFTLENBQUMsT0FBTyxFQUFFO0FBQzlCLElBQUksSUFBSSxDQUFDLGVBQWUsR0FBRyxLQUFLLENBQUM7QUFDakMsSUFBSSxJQUFJLENBQUMsS0FBSyxHQUFHLEVBQUUsQ0FBQztBQUNwQixJQUFJLElBQUksQ0FBQyxXQUFXLEdBQUcsS0FBSyxDQUFDO0FBQzdCLElBQUksSUFBSSxDQUFDLE9BQU8sR0FBRyxRQUFRLENBQUMsUUFBUSxDQUFDLEVBQUUsRUFBRSxjQUFjLENBQUMsRUFBRSxPQUFPLENBQUMsQ0FBQztBQUNuRSxHQUFHO0FBQ0g7QUFDQSxFQUFFLFNBQVMsQ0FBQyxTQUFTLENBQUMsVUFBVSxHQUFHLFVBQVUsUUFBUSxFQUFFO0FBQ3ZELElBQUksSUFBSSxDQUFDLFdBQVcsR0FBRyxJQUFJLENBQUM7QUFDNUI7QUFDQSxJQUFJLElBQUksUUFBUSxFQUFFO0FBQ2xCLE1BQU0sSUFBSSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsV0FBVyxFQUFFO0FBQ3JDLFFBQVEsSUFBSSxDQUFDLFFBQVEsQ0FBQyxRQUFRLENBQUMsQ0FBQztBQUNoQyxRQUFRLE9BQU87QUFDZixPQUFPO0FBQ1A7QUFDQSxNQUFNLElBQUksQ0FBQyxPQUFPLENBQUMsUUFBUSxDQUFDLENBQUM7QUFDN0IsS0FBSztBQUNMO0FBQ0EsSUFBSSxJQUFJLENBQUMsV0FBVyxFQUFFLENBQUM7QUFDdkIsR0FBRyxDQUFDO0FBQ0o7QUFDQSxFQUFFLFNBQVMsQ0FBQyxTQUFTLENBQUMsUUFBUSxHQUFHLFVBQVUsSUFBSSxFQUFFO0FBQ2pELElBQUksSUFBSSxDQUFDLElBQUksQ0FBQyxXQUFXLElBQUksSUFBSSxDQUFDLGVBQWUsRUFBRTtBQUNuRCxNQUFNLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO0FBQzVCLE1BQU0sT0FBTztBQUNiLEtBQUs7QUFDTDtBQUNBLElBQUksSUFBSSxJQUFJLENBQUMsS0FBSyxDQUFDLE1BQU0sS0FBSyxDQUFDLEVBQUU7QUFDakMsTUFBTSxNQUFNLElBQUksS0FBSyxDQUFDLDhEQUE4RCxDQUFDLENBQUM7QUFDdEYsS0FBSztBQUNMO0FBQ0EsSUFBSSxJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDO0FBQ3ZCLElBQUksSUFBSSxDQUFDLFdBQVcsRUFBRSxDQUFDO0FBQ3ZCLEdBQUcsQ0FBQztBQUNKO0FBQ0EsRUFBRSxTQUFTLENBQUMsU0FBUyxDQUFDLEtBQUssR0FBRyxZQUFZO0FBQzFDLElBQUksSUFBSSxDQUFDLEtBQUssR0FBRyxFQUFFLENBQUM7QUFDcEIsR0FBRyxDQUFDO0FBQ0o7QUFDQSxFQUFFLFNBQVMsQ0FBQyxTQUFTLENBQUMsV0FBVyxHQUFHLFlBQVk7QUFDaEQsSUFBSSxJQUFJLFlBQVksR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLEtBQUssRUFBRSxDQUFDO0FBQzFDO0FBQ0EsSUFBSSxPQUFPLFlBQVksRUFBRTtBQUN6QixNQUFNLElBQUksQ0FBQyxPQUFPLENBQUMsWUFBWSxDQUFDLENBQUM7QUFDakMsTUFBTSxZQUFZLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxLQUFLLEVBQUUsQ0FBQztBQUN4QyxLQUFLO0FBQ0wsR0FBRyxDQUFDO0FBQ0o7QUFDQSxFQUFFLFNBQVMsQ0FBQyxTQUFTLENBQUMsT0FBTyxHQUFHLFVBQVUsUUFBUSxFQUFFO0FBQ3BELElBQUksSUFBSSxDQUFDLGVBQWUsR0FBRyxJQUFJLENBQUM7QUFDaEM7QUFDQSxJQUFJLElBQUk7QUFDUixNQUFNLFFBQVEsRUFBRSxDQUFDO0FBQ2pCLEtBQUssQ0FBQyxPQUFPLENBQUMsRUFBRTtBQUNoQjtBQUNBO0FBQ0EsTUFBTSxJQUFJLENBQUMsS0FBSyxFQUFFLENBQUM7QUFDbkIsTUFBTSxNQUFNLENBQUMsQ0FBQztBQUNkLEtBQUssU0FBUztBQUNkLE1BQU0sSUFBSSxDQUFDLGVBQWUsR0FBRyxLQUFLLENBQUM7QUFDbkMsS0FBSztBQUNMLEdBQUcsQ0FBQztBQUNKO0FBQ0EsRUFBRSxPQUFPLFNBQVMsQ0FBQztBQUNuQixDQUFDLEVBQUU7O0FDM0VILElBQUksUUFBUSxnQkFBZ0IsSUFBSSxHQUFHLEVBQUUsQ0FBQztBQUN0QyxJQUFJLGNBQWMsR0FBRyxDQUFDLENBQUM7QUFDdkIsSUFBSSxRQUFRLEdBQUc7QUFDZixFQUFFLE1BQU0sRUFBRSxZQUFZO0FBQ3RCLElBQUksT0FBTyxJQUFJLEdBQUcsY0FBYyxFQUFFLENBQUM7QUFDbkMsR0FBRztBQUNILEVBQUUsUUFBUSxFQUFFLFVBQVUsRUFBRSxFQUFFLEtBQUssRUFBRTtBQUNqQyxJQUFJLFFBQVEsQ0FBQyxHQUFHLENBQUMsRUFBRSxFQUFFLEtBQUssQ0FBQyxDQUFDO0FBQzVCLElBQUksT0FBTyxFQUFFLENBQUM7QUFDZCxHQUFHO0FBQ0gsRUFBRSxHQUFHLEVBQUUsVUFBVSxFQUFFLEVBQUU7QUFDckIsSUFBSSxPQUFPLFFBQVEsQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLENBQUM7QUFDNUIsR0FBRztBQUNILEVBQUUsSUFBSSxFQUFFLFVBQVUsRUFBRSxFQUFFO0FBQ3RCLElBQUksUUFBUSxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUMsQ0FBQztBQUN4QixHQUFHO0FBQ0gsQ0FBQzs7QUNkRCxTQUFTLFNBQVMsR0FBRztBQUNyQixFQUFFLElBQUksT0FBTyxJQUFJLEtBQUssV0FBVyxFQUFFO0FBQ25DLElBQUksT0FBTyxJQUFJLENBQUM7QUFDaEIsR0FBRztBQUNIO0FBQ0EsRUFBRSxJQUFJLE9BQU8sTUFBTSxLQUFLLFdBQVcsRUFBRTtBQUNyQyxJQUFJLE9BQU8sTUFBTSxDQUFDO0FBQ2xCLEdBQUc7QUFDSDtBQUNBLEVBQUUsSUFBSSxPQUFPLE1BQU0sS0FBSyxXQUFXLEVBQUU7QUFDckMsSUFBSSxPQUFPLE1BQU0sQ0FBQztBQUNsQixHQUFHO0FBQ0g7QUFDQSxFQUFFLE9BQU8sU0FBUyxDQUFDO0FBQ25CLENBQUM7QUFDRDtBQUNBLFNBQVMsV0FBVyxHQUFHO0FBQ3ZCLEVBQUUsSUFBSSxNQUFNLEdBQUcsU0FBUyxFQUFFLENBQUM7QUFDM0I7QUFDQSxFQUFFLElBQUksTUFBTSxJQUFJLFlBQVksSUFBSSxNQUFNLEVBQUU7QUFDeEMsSUFBSSxPQUFPLE1BQU0sQ0FBQyxVQUFVLENBQUM7QUFDN0IsR0FBRztBQUNIO0FBQ0EsRUFBRSxPQUFPLFNBQVMsQ0FBQztBQUNuQixDQUFDO0FBQ0Q7QUFDQSxTQUFTLGVBQWUsQ0FBQyxPQUFPLEVBQUU7QUFDbEMsRUFBRSxJQUFJLGFBQWEsSUFBSSxDQUFDLFNBQVMsRUFBRSxFQUFFO0FBQ3JDLElBQUksT0FBTztBQUNYLEdBQUc7QUFDSDtBQUNBLEVBQUUsSUFBSSxRQUFRLEdBQUcsV0FBVyxFQUFFLENBQUM7QUFDL0I7QUFDQSxFQUFFLElBQUksUUFBUSxFQUFFO0FBQ2hCLElBQUksUUFBUSxDQUFDLFFBQVEsQ0FBQyxPQUFPLENBQUMsQ0FBQztBQUMvQixHQUFHO0FBQ0g7O0FDekJBLElBQUkscUJBQXFCLEdBQUc7QUFDNUIsRUFBRSxJQUFJLEVBQUUsS0FBSztBQUNiLEVBQUUsV0FBVyxFQUFFLEtBQUs7QUFDcEIsQ0FBQyxDQUFDO0FBQ0MsSUFBQyxrQkFBa0I7QUFDdEI7QUFDQSxDQUFDLFVBQVUsaUJBQWlCLEVBQUU7QUFDOUIsRUFBRSxpQkFBaUIsQ0FBQyxpQkFBaUIsQ0FBQyxZQUFZLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxZQUFZLENBQUM7QUFDeEUsRUFBRSxpQkFBaUIsQ0FBQyxpQkFBaUIsQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxTQUFTLENBQUM7QUFDbEUsRUFBRSxpQkFBaUIsQ0FBQyxpQkFBaUIsQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxTQUFTLENBQUM7QUFDbEUsQ0FBQyxFQUFFLGlCQUFpQixLQUFLLGlCQUFpQixHQUFHLEVBQUUsQ0FBQyxDQUFDLENBQUM7QUFDbEQ7QUFDRyxJQUFDLFdBQVc7QUFDZjtBQUNBO0FBQ0E7QUFDQSxZQUFZO0FBQ1o7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsRUFBRSxTQUFTLFdBQVcsQ0FBQyxPQUFPLEVBQUUsT0FBTyxFQUFFO0FBQ3pDLElBQUksSUFBSSxLQUFLLEdBQUcsSUFBSSxDQUFDO0FBQ3JCO0FBQ0EsSUFBSSxJQUFJLE9BQU8sS0FBSyxLQUFLLENBQUMsRUFBRTtBQUM1QixNQUFNLE9BQU8sR0FBRyxXQUFXLENBQUMsY0FBYyxDQUFDO0FBQzNDLEtBQUs7QUFDTDtBQUNBLElBQUksSUFBSSxDQUFDLE9BQU8sR0FBRyxPQUFPLENBQUM7QUFDM0IsSUFBSSxJQUFJLENBQUMsU0FBUyxHQUFHLElBQUksU0FBUyxFQUFFLENBQUM7QUFDckMsSUFBSSxJQUFJLENBQUMsZ0JBQWdCLEdBQUcsRUFBRSxDQUFDO0FBQy9CLElBQUksSUFBSSxDQUFDLFNBQVMsR0FBRyxJQUFJLEdBQUcsRUFBRSxDQUFDO0FBQy9CLElBQUksSUFBSSxDQUFDLGdCQUFnQixHQUFHLElBQUksR0FBRyxFQUFFLENBQUM7QUFDdEMsSUFBSSxJQUFJLENBQUMsYUFBYSxHQUFHLElBQUksR0FBRyxFQUFFLENBQUM7QUFDbkMsSUFBSSxJQUFJLENBQUMsYUFBYSxHQUFHLElBQUksR0FBRyxFQUFFLENBQUM7QUFDbkMsSUFBSSxJQUFJLENBQUMsY0FBYyxHQUFHLElBQUksR0FBRyxFQUFFLENBQUM7QUFDcEMsSUFBSSxJQUFJLENBQUMsYUFBYSxHQUFHLElBQUksR0FBRyxFQUFFLENBQUM7QUFDbkM7QUFDQTtBQUNBO0FBQ0E7QUFDQSxJQUFJLElBQUksQ0FBQyxXQUFXLEdBQUcsS0FBSyxDQUFDO0FBQzdCLElBQUksSUFBSSxDQUFDLE1BQU0sR0FBRyxpQkFBaUIsQ0FBQyxVQUFVLENBQUM7QUFDL0MsSUFBSSxJQUFJLENBQUMsUUFBUSxHQUFHLElBQUksR0FBRyxFQUFFLENBQUM7QUFDOUIsSUFBSSxJQUFJLENBQUMsU0FBUyxHQUFHLElBQUksR0FBRyxFQUFFLENBQUM7QUFDL0I7QUFDQTtBQUNBO0FBQ0E7QUFDQSxJQUFJLElBQUksQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQztBQUMzQjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLElBQUksSUFBSSxDQUFDLElBQUksR0FBRyxVQUFVLEtBQUssRUFBRSxPQUFPLEVBQUU7QUFDMUMsTUFBTSxJQUFJLE9BQU8sQ0FBQyxLQUFLLENBQUMsRUFBRTtBQUMxQixRQUFRLEtBQUssQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLENBQUM7QUFDM0I7QUFDQSxRQUFRLE9BQU8sS0FBSyxDQUFDLEtBQUssQ0FBQztBQUMzQixPQUFPO0FBQ1A7QUFDQSxNQUFNLElBQUksTUFBTSxHQUFHLFlBQVksQ0FBQyxhQUFhLENBQUMsS0FBSyxFQUFFLE9BQU8sQ0FBQyxDQUFDLENBQUM7QUFDL0Q7QUFDQSxNQUFNLElBQUksS0FBSyxDQUFDLE1BQU0sS0FBSyxpQkFBaUIsQ0FBQyxPQUFPLEVBQUU7QUFDdEQ7QUFDQSxRQUFRLElBQUksQ0FBQyxhQUFhLEVBQUU7QUFDNUIsVUFBVSxJQUFJLENBQUMsS0FBSyxFQUFFLFVBQVUsR0FBRyxNQUFNLENBQUMsSUFBSSxHQUFHLG1DQUFtQyxHQUFHLEtBQUssQ0FBQyxPQUFPLENBQUMsRUFBRSxHQUFHLHlGQUF5RixHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7QUFDbk8sU0FBUztBQUNUO0FBQ0EsUUFBUSxPQUFPLEtBQUssQ0FBQyxLQUFLLENBQUM7QUFDM0IsT0FBTztBQUNQO0FBQ0EsTUFBTSxJQUFJLEtBQUssQ0FBQyxNQUFNLEtBQUssaUJBQWlCLENBQUMsT0FBTyxJQUFJLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxXQUFXLEVBQUU7QUFDcEYsUUFBUSxNQUFNLElBQUksS0FBSyxDQUFDLFVBQVUsR0FBRyxNQUFNLENBQUMsSUFBSSxHQUFHLHlDQUF5QyxHQUFHLEtBQUssQ0FBQyxPQUFPLENBQUMsRUFBRSxHQUFHLGtIQUFrSCxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7QUFDcFEsT0FBTztBQUNQO0FBQ0EsTUFBTSxLQUFLLENBQUMsU0FBUyxDQUFDLFFBQVEsQ0FBQyxZQUFZO0FBQzNDO0FBQ0EsUUFBUSxLQUFLLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxDQUFDO0FBQzlCO0FBQ0EsUUFBUSxJQUFJLFNBQVMsR0FBRyxLQUFLLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBQyxDQUFDO0FBQ2hEO0FBQ0EsUUFBUSxLQUFLLENBQUMsTUFBTSxDQUFDLFNBQVMsRUFBRSxNQUFNLENBQUMsQ0FBQztBQUN4QyxPQUFPLENBQUMsQ0FBQztBQUNUO0FBQ0EsTUFBTSxPQUFPLEtBQUssQ0FBQyxNQUFNLENBQUM7QUFDMUI7QUFDQSxLQUFLLENBQUM7QUFDTjtBQUNBLElBQUksSUFBSSxDQUFDLE1BQU0sR0FBRyxVQUFVLEtBQUssRUFBRSxFQUFFLEVBQUU7QUFDdkMsTUFBTSxJQUFJLFFBQVEsR0FBRyxLQUFLLENBQUMsTUFBTSxLQUFLLEVBQUUsS0FBSyxjQUFjLENBQUMsTUFBTSxJQUFJLEtBQUssQ0FBQyxNQUFNLENBQUMsRUFBRSxLQUFLLEVBQUUsQ0FBQyxDQUFDO0FBQzlGLE1BQU0sSUFBSSxNQUFNLEdBQUcsUUFBUSxHQUFHLEtBQUssQ0FBQyxNQUFNLEdBQUcsUUFBUSxDQUFDLEVBQUUsQ0FBQyxHQUFHLEtBQUssQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxJQUFJLFFBQVEsQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsT0FBTyxDQUFDLEVBQUUsQ0FBQyxHQUFHLEVBQUUsR0FBRyxTQUFTLENBQUM7QUFDdEk7QUFDQSxNQUFNLElBQUksQ0FBQyxNQUFNLEVBQUU7QUFDbkIsUUFBUSxJQUFJLENBQUMsUUFBUSxFQUFFO0FBQ3ZCLFVBQVUsTUFBTSxJQUFJLEtBQUssQ0FBQyxpQ0FBaUMsR0FBRyxFQUFFLEdBQUcsa0JBQWtCLEdBQUcsS0FBSyxDQUFDLEVBQUUsR0FBRyxJQUFJLENBQUMsQ0FBQztBQUN6RyxTQUFTO0FBQ1Q7QUFDQTtBQUNBLFFBQVEsSUFBSSxDQUFDLGFBQWEsRUFBRTtBQUM1QixVQUFVLElBQUksQ0FBQyxLQUFLLEVBQUUsV0FBVyxHQUFHLEtBQUssQ0FBQyxFQUFFLEdBQUcsd0NBQXdDLEdBQUcsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDO0FBQ3RHLFNBQVM7QUFDVDtBQUNBLFFBQVEsT0FBTztBQUNmLE9BQU87QUFDUDtBQUNBLE1BQU0sSUFBSSxTQUFTLElBQUksTUFBTSxFQUFFO0FBQy9CO0FBQ0EsUUFBUSxNQUFNLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxRQUFRLENBQUMsRUFBRSxFQUFFLEtBQUssQ0FBQyxFQUFFO0FBQ2xELFVBQVUsSUFBSSxFQUFFLEtBQUssQ0FBQyxJQUFJLEtBQUtFLEtBQU8sR0FBRyxFQUFFLEdBQUdGLE9BQUssQ0FBQyxLQUFLLENBQUMsRUFBRSxDQUFDLEdBQUcsS0FBSyxDQUFDLElBQUk7QUFDMUUsVUFBVSxNQUFNLEVBQUUsS0FBSyxDQUFDLFNBQVM7QUFDakMsU0FBUyxDQUFDLENBQUMsQ0FBQztBQUNaLE9BQU8sTUFBTTtBQUNiO0FBQ0EsUUFBUSxNQUFNLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUNoQyxPQUFPO0FBQ1AsS0FBSyxDQUFDO0FBQ047QUFDQSxJQUFJLElBQUksZUFBZSxHQUFHLFFBQVEsQ0FBQyxRQUFRLENBQUMsRUFBRSxFQUFFLFdBQVcsQ0FBQyxjQUFjLENBQUMsRUFBRSxPQUFPLENBQUMsQ0FBQztBQUN0RjtBQUNBLElBQUksSUFBSSxLQUFLLEdBQUcsZUFBZSxDQUFDLEtBQUs7QUFDckMsUUFBUSxNQUFNLEdBQUcsZUFBZSxDQUFDLE1BQU07QUFDdkMsUUFBUSxNQUFNLEdBQUcsZUFBZSxDQUFDLE1BQU07QUFDdkMsUUFBUSxFQUFFLEdBQUcsZUFBZSxDQUFDLEVBQUUsQ0FBQztBQUNoQyxJQUFJLElBQUksVUFBVSxHQUFHLEVBQUUsS0FBSyxTQUFTLEdBQUcsRUFBRSxHQUFHLE9BQU8sQ0FBQyxFQUFFLENBQUM7QUFDeEQsSUFBSSxJQUFJLENBQUMsRUFBRSxHQUFHLFVBQVUsQ0FBQztBQUN6QixJQUFJLElBQUksQ0FBQyxNQUFNLEdBQUcsTUFBTSxDQUFDO0FBQ3pCLElBQUksSUFBSSxDQUFDLEtBQUssR0FBRyxLQUFLLENBQUM7QUFDdkIsSUFBSSxJQUFJLENBQUMsTUFBTSxHQUFHLE1BQU0sQ0FBQztBQUN6QixJQUFJLElBQUksQ0FBQyxPQUFPLEdBQUcsZUFBZSxDQUFDO0FBQ25DLElBQUksSUFBSSxDQUFDLFNBQVMsR0FBRyxJQUFJLFNBQVMsQ0FBQztBQUNuQyxNQUFNLFdBQVcsRUFBRSxJQUFJLENBQUMsT0FBTyxDQUFDLFdBQVc7QUFDM0MsS0FBSyxDQUFDLENBQUM7QUFDUCxJQUFJLElBQUksQ0FBQyxTQUFTLEdBQUcsUUFBUSxDQUFDLE1BQU0sRUFBRSxDQUFDO0FBQ3ZDLEdBQUc7QUFDSDtBQUNBLEVBQUUsTUFBTSxDQUFDLGNBQWMsQ0FBQyxXQUFXLENBQUMsU0FBUyxFQUFFLGNBQWMsRUFBRTtBQUMvRCxJQUFJLEdBQUcsRUFBRSxZQUFZO0FBQ3JCLE1BQU0sSUFBSSxLQUFLLEdBQUcsSUFBSSxDQUFDO0FBQ3ZCO0FBQ0EsTUFBTSxJQUFJLElBQUksQ0FBQyxhQUFhLEVBQUU7QUFDOUIsUUFBUSxPQUFPLElBQUksQ0FBQyxhQUFhLENBQUM7QUFDbEMsT0FBTztBQUNQO0FBQ0EsTUFBTSxPQUFPLE9BQU8sQ0FBQyxJQUFJLEVBQUUsWUFBWTtBQUN2QyxRQUFRLEtBQUssQ0FBQyxhQUFhLEdBQUcsS0FBSyxDQUFDLE9BQU8sQ0FBQyxZQUFZLENBQUM7QUFDekQsUUFBUSxPQUFPLEtBQUssQ0FBQyxhQUFhLENBQUM7QUFDbkMsT0FBTyxDQUFDLENBQUM7QUFDVCxLQUFLO0FBQ0wsSUFBSSxVQUFVLEVBQUUsS0FBSztBQUNyQixJQUFJLFlBQVksRUFBRSxJQUFJO0FBQ3RCLEdBQUcsQ0FBQyxDQUFDO0FBQ0wsRUFBRSxNQUFNLENBQUMsY0FBYyxDQUFDLFdBQVcsQ0FBQyxTQUFTLEVBQUUsT0FBTyxFQUFFO0FBQ3hELElBQUksR0FBRyxFQUFFLFlBQVk7QUFDckIsTUFBTSxJQUFJLENBQUMsYUFBYSxFQUFFO0FBQzFCLFFBQVEsSUFBSSxDQUFDLElBQUksQ0FBQyxNQUFNLEtBQUssaUJBQWlCLENBQUMsVUFBVSxFQUFFLHNEQUFzRCxHQUFHLElBQUksQ0FBQyxFQUFFLEdBQUcsNENBQTRDLENBQUMsQ0FBQztBQUM1SyxPQUFPO0FBQ1A7QUFDQSxNQUFNLE9BQU8sSUFBSSxDQUFDLE1BQU0sQ0FBQztBQUN6QixLQUFLO0FBQ0wsSUFBSSxVQUFVLEVBQUUsS0FBSztBQUNyQixJQUFJLFlBQVksRUFBRSxJQUFJO0FBQ3RCLEdBQUcsQ0FBQyxDQUFDO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxFQUFFLFdBQVcsQ0FBQyxTQUFTLENBQUMsT0FBTyxHQUFHLFVBQVUsS0FBSyxFQUFFLGFBQWEsRUFBRTtBQUNsRSxJQUFJLElBQUksR0FBRyxFQUFFLEVBQUUsQ0FBQztBQUNoQjtBQUNBLElBQUksSUFBSTtBQUNSLE1BQU0sS0FBSyxJQUFJLEVBQUUsR0FBRyxRQUFRLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxFQUFFLEVBQUUsR0FBRyxFQUFFLENBQUMsSUFBSSxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUMsSUFBSSxFQUFFLEVBQUUsR0FBRyxFQUFFLENBQUMsSUFBSSxFQUFFLEVBQUU7QUFDdkYsUUFBUSxJQUFJLE1BQU0sR0FBRyxFQUFFLENBQUMsS0FBSyxDQUFDO0FBQzlCLFFBQVEsSUFBSSxDQUFDLElBQUksQ0FBQyxNQUFNLEVBQUUsS0FBSyxFQUFFLGFBQWEsQ0FBQyxDQUFDO0FBQ2hELE9BQU87QUFDUCxLQUFLLENBQUMsT0FBTyxLQUFLLEVBQUU7QUFDcEIsTUFBTSxHQUFHLEdBQUc7QUFDWixRQUFRLEtBQUssRUFBRSxLQUFLO0FBQ3BCLE9BQU8sQ0FBQztBQUNSLEtBQUssU0FBUztBQUNkLE1BQU0sSUFBSTtBQUNWLFFBQVEsSUFBSSxFQUFFLElBQUksQ0FBQyxFQUFFLENBQUMsSUFBSSxLQUFLLEVBQUUsR0FBRyxFQUFFLENBQUMsTUFBTSxDQUFDLEVBQUUsRUFBRSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQztBQUM1RCxPQUFPLFNBQVM7QUFDaEIsUUFBUSxJQUFJLEdBQUcsRUFBRSxNQUFNLEdBQUcsQ0FBQyxLQUFLLENBQUM7QUFDakMsT0FBTztBQUNQLEtBQUs7QUFDTCxHQUFHLENBQUM7QUFDSjtBQUNBLEVBQUUsV0FBVyxDQUFDLFNBQVMsQ0FBQyxNQUFNLEdBQUcsVUFBVSxLQUFLLEVBQUUsTUFBTSxFQUFFO0FBQzFELElBQUksSUFBSSxHQUFHLEVBQUUsRUFBRSxFQUFFLEdBQUcsRUFBRSxFQUFFLEVBQUUsR0FBRyxFQUFFLEVBQUUsRUFBRSxHQUFHLEVBQUUsRUFBRSxDQUFDO0FBQzNDO0FBQ0EsSUFBSSxJQUFJLEtBQUssR0FBRyxJQUFJLENBQUM7QUFDckI7QUFDQTtBQUNBLElBQUksS0FBSyxDQUFDLFVBQVUsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDO0FBQ3RDO0FBQ0EsSUFBSSxJQUFJLENBQUMsTUFBTSxHQUFHLEtBQUssQ0FBQztBQUN4QjtBQUNBLElBQUksSUFBSSxJQUFJLENBQUMsT0FBTyxDQUFDLE9BQU8sRUFBRTtBQUM5QixNQUFNLElBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDO0FBQy9CLEtBQUs7QUFDTDtBQUNBO0FBQ0EsSUFBSSxJQUFJLENBQUMsUUFBUSxDQUFDLE9BQU8sQ0FBQyxVQUFVLEtBQUssRUFBRTtBQUMzQyxNQUFNLEtBQUssQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxFQUFFLENBQUMsR0FBRyxLQUFLLENBQUM7QUFDN0MsS0FBSyxDQUFDLENBQUM7QUFDUDtBQUNBLElBQUksSUFBSSxJQUFJLENBQUMsUUFBUSxFQUFFO0FBQ3ZCLE1BQU0sSUFBSSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksRUFBRSxLQUFLLENBQUMsQ0FBQztBQUM3QyxLQUFLO0FBQ0w7QUFDQTtBQUNBLElBQUksSUFBSSxLQUFLLENBQUMsS0FBSyxFQUFFO0FBQ3JCLE1BQU0sSUFBSTtBQUNWLFFBQVEsS0FBSyxJQUFJLEVBQUUsR0FBRyxRQUFRLENBQUMsSUFBSSxDQUFDLGNBQWMsQ0FBQyxFQUFFLEVBQUUsR0FBRyxFQUFFLENBQUMsSUFBSSxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUMsSUFBSSxFQUFFLEVBQUUsR0FBRyxFQUFFLENBQUMsSUFBSSxFQUFFLEVBQUU7QUFDL0YsVUFBVSxJQUFJLFFBQVEsR0FBRyxFQUFFLENBQUMsS0FBSyxDQUFDO0FBQ2xDLFVBQVUsUUFBUSxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsQ0FBQztBQUNoQyxTQUFTO0FBQ1QsT0FBTyxDQUFDLE9BQU8sS0FBSyxFQUFFO0FBQ3RCLFFBQVEsR0FBRyxHQUFHO0FBQ2QsVUFBVSxLQUFLLEVBQUUsS0FBSztBQUN0QixTQUFTLENBQUM7QUFDVixPQUFPLFNBQVM7QUFDaEIsUUFBUSxJQUFJO0FBQ1osVUFBVSxJQUFJLEVBQUUsSUFBSSxDQUFDLEVBQUUsQ0FBQyxJQUFJLEtBQUssRUFBRSxHQUFHLEVBQUUsQ0FBQyxNQUFNLENBQUMsRUFBRSxFQUFFLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDO0FBQzlELFNBQVMsU0FBUztBQUNsQixVQUFVLElBQUksR0FBRyxFQUFFLE1BQU0sR0FBRyxDQUFDLEtBQUssQ0FBQztBQUNuQyxTQUFTO0FBQ1QsT0FBTztBQUNQLEtBQUs7QUFDTDtBQUNBLElBQUksSUFBSTtBQUNSLE1BQU0sS0FBSyxJQUFJLEVBQUUsR0FBRyxRQUFRLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxFQUFFLEVBQUUsR0FBRyxFQUFFLENBQUMsSUFBSSxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUMsSUFBSSxFQUFFLEVBQUUsR0FBRyxFQUFFLENBQUMsSUFBSSxFQUFFLEVBQUU7QUFDeEYsUUFBUSxJQUFJLFFBQVEsR0FBRyxFQUFFLENBQUMsS0FBSyxDQUFDO0FBQ2hDLFFBQVEsUUFBUSxDQUFDLEtBQUssRUFBRSxLQUFLLENBQUMsS0FBSyxDQUFDLENBQUM7QUFDckMsT0FBTztBQUNQLEtBQUssQ0FBQyxPQUFPLEtBQUssRUFBRTtBQUNwQixNQUFNLEdBQUcsR0FBRztBQUNaLFFBQVEsS0FBSyxFQUFFLEtBQUs7QUFDcEIsT0FBTyxDQUFDO0FBQ1IsS0FBSyxTQUFTO0FBQ2QsTUFBTSxJQUFJO0FBQ1YsUUFBUSxJQUFJLEVBQUUsSUFBSSxDQUFDLEVBQUUsQ0FBQyxJQUFJLEtBQUssRUFBRSxHQUFHLEVBQUUsQ0FBQyxNQUFNLENBQUMsRUFBRSxFQUFFLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDO0FBQzVELE9BQU8sU0FBUztBQUNoQixRQUFRLElBQUksR0FBRyxFQUFFLE1BQU0sR0FBRyxDQUFDLEtBQUssQ0FBQztBQUNqQyxPQUFPO0FBQ1AsS0FBSztBQUNMO0FBQ0EsSUFBSSxJQUFJO0FBQ1IsTUFBTSxLQUFLLElBQUksRUFBRSxHQUFHLFFBQVEsQ0FBQyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsRUFBRSxFQUFFLEdBQUcsRUFBRSxDQUFDLElBQUksRUFBRSxFQUFFLENBQUMsRUFBRSxDQUFDLElBQUksRUFBRSxFQUFFLEdBQUcsRUFBRSxDQUFDLElBQUksRUFBRSxFQUFFO0FBQy9GLFFBQVEsSUFBSSxlQUFlLEdBQUcsRUFBRSxDQUFDLEtBQUssQ0FBQztBQUN2QyxRQUFRLGVBQWUsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLE9BQU8sRUFBRSxJQUFJLENBQUMsS0FBSyxDQUFDLE9BQU8sR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxPQUFPLEdBQUcsU0FBUyxDQUFDLENBQUM7QUFDekcsT0FBTztBQUNQLEtBQUssQ0FBQyxPQUFPLEtBQUssRUFBRTtBQUNwQixNQUFNLEdBQUcsR0FBRztBQUNaLFFBQVEsS0FBSyxFQUFFLEtBQUs7QUFDcEIsT0FBTyxDQUFDO0FBQ1IsS0FBSyxTQUFTO0FBQ2QsTUFBTSxJQUFJO0FBQ1YsUUFBUSxJQUFJLEVBQUUsSUFBSSxDQUFDLEVBQUUsQ0FBQyxJQUFJLEtBQUssRUFBRSxHQUFHLEVBQUUsQ0FBQyxNQUFNLENBQUMsRUFBRSxFQUFFLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDO0FBQzVELE9BQU8sU0FBUztBQUNoQixRQUFRLElBQUksR0FBRyxFQUFFLE1BQU0sR0FBRyxDQUFDLEtBQUssQ0FBQztBQUNqQyxPQUFPO0FBQ1AsS0FBSztBQUNMO0FBQ0EsSUFBSSxJQUFJLE1BQU0sR0FBRyxjQUFjLENBQUMsS0FBSyxDQUFDLGFBQWEsSUFBSSxFQUFFLEVBQUUsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDO0FBQ3pFO0FBQ0EsSUFBSSxJQUFJLElBQUksQ0FBQyxLQUFLLENBQUMsYUFBYSxJQUFJLE1BQU0sRUFBRTtBQUM1QztBQUNBLE1BQU0sSUFBSSxtQkFBbUIsR0FBRyxLQUFLLENBQUMsYUFBYSxDQUFDLElBQUksQ0FBQyxVQUFVLEVBQUUsRUFBRTtBQUN2RSxRQUFRLE9BQU8sRUFBRSxDQUFDLElBQUksS0FBSyxPQUFPLElBQUksRUFBRSxDQUFDLE1BQU0sS0FBSyxLQUFLLENBQUMsT0FBTyxDQUFDO0FBQ2xFLE9BQU8sQ0FBQyxDQUFDO0FBQ1QsTUFBTSxJQUFJLFFBQVEsR0FBRyxtQkFBbUIsSUFBSSxtQkFBbUIsQ0FBQyxRQUFRLEdBQUcsVUFBVSxDQUFDLG1CQUFtQixDQUFDLFFBQVEsRUFBRSxLQUFLLENBQUMsT0FBTyxFQUFFLE1BQU0sQ0FBQyxHQUFHLFNBQVMsQ0FBQztBQUN2SjtBQUNBLE1BQU0sSUFBSTtBQUNWLFFBQVEsS0FBSyxJQUFJLEVBQUUsR0FBRyxRQUFRLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxFQUFFLEVBQUUsR0FBRyxFQUFFLENBQUMsSUFBSSxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUMsSUFBSSxFQUFFLEVBQUUsR0FBRyxFQUFFLENBQUMsSUFBSSxFQUFFLEVBQUU7QUFDOUYsVUFBVSxJQUFJLFFBQVEsR0FBRyxFQUFFLENBQUMsS0FBSyxDQUFDO0FBQ2xDLFVBQVUsUUFBUSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsRUFBRSxFQUFFLFFBQVEsQ0FBQyxDQUFDLENBQUM7QUFDbEQsU0FBUztBQUNULE9BQU8sQ0FBQyxPQUFPLEtBQUssRUFBRTtBQUN0QixRQUFRLEdBQUcsR0FBRztBQUNkLFVBQVUsS0FBSyxFQUFFLEtBQUs7QUFDdEIsU0FBUyxDQUFDO0FBQ1YsT0FBTyxTQUFTO0FBQ2hCLFFBQVEsSUFBSTtBQUNaLFVBQVUsSUFBSSxFQUFFLElBQUksQ0FBQyxFQUFFLENBQUMsSUFBSSxLQUFLLEVBQUUsR0FBRyxFQUFFLENBQUMsTUFBTSxDQUFDLEVBQUUsRUFBRSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQztBQUM5RCxTQUFTLFNBQVM7QUFDbEIsVUFBVSxJQUFJLEdBQUcsRUFBRSxNQUFNLEdBQUcsQ0FBQyxLQUFLLENBQUM7QUFDbkMsU0FBUztBQUNULE9BQU87QUFDUDtBQUNBLE1BQU0sSUFBSSxDQUFDLElBQUksRUFBRSxDQUFDO0FBQ2xCLEtBQUs7QUFDTCxHQUFHLENBQUM7QUFDSjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsRUFBRSxXQUFXLENBQUMsU0FBUyxDQUFDLFlBQVksR0FBRyxVQUFVLFFBQVEsRUFBRTtBQUMzRCxJQUFJLElBQUksQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxDQUFDO0FBQ2pDO0FBQ0EsSUFBSSxJQUFJLElBQUksQ0FBQyxNQUFNLEtBQUssaUJBQWlCLENBQUMsT0FBTyxFQUFFO0FBQ25ELE1BQU0sUUFBUSxDQUFDLElBQUksQ0FBQyxLQUFLLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsQ0FBQztBQUM3QyxLQUFLO0FBQ0w7QUFDQSxJQUFJLE9BQU8sSUFBSSxDQUFDO0FBQ2hCLEdBQUcsQ0FBQztBQUNKO0FBQ0EsRUFBRSxXQUFXLENBQUMsU0FBUyxDQUFDLFNBQVMsR0FBRyxVQUFVLHNCQUFzQixFQUFFLENBQUM7QUFDdkUsRUFBRSxnQkFBZ0IsRUFBRTtBQUNwQixJQUFJLElBQUksS0FBSyxHQUFHLElBQUksQ0FBQztBQUNyQjtBQUNBLElBQUksSUFBSSxDQUFDLHNCQUFzQixFQUFFO0FBQ2pDLE1BQU0sT0FBTztBQUNiLFFBQVEsV0FBVyxFQUFFLFlBQVk7QUFDakMsVUFBVSxPQUFPLEtBQUssQ0FBQyxDQUFDO0FBQ3hCLFNBQVM7QUFDVCxPQUFPLENBQUM7QUFDUixLQUFLO0FBQ0w7QUFDQSxJQUFJLElBQUksUUFBUSxDQUFDO0FBQ2pCLElBQUksSUFBSSx3QkFBd0IsR0FBRyxnQkFBZ0IsQ0FBQztBQUNwRDtBQUNBLElBQUksSUFBSSxPQUFPLHNCQUFzQixLQUFLLFVBQVUsRUFBRTtBQUN0RCxNQUFNLFFBQVEsR0FBRyxzQkFBc0IsQ0FBQztBQUN4QyxLQUFLLE1BQU07QUFDWCxNQUFNLFFBQVEsR0FBRyxzQkFBc0IsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLHNCQUFzQixDQUFDLENBQUM7QUFDMUUsTUFBTSx3QkFBd0IsR0FBRyxzQkFBc0IsQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLHNCQUFzQixDQUFDLENBQUM7QUFDOUYsS0FBSztBQUNMO0FBQ0EsSUFBSSxJQUFJLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsQ0FBQztBQUNqQztBQUNBLElBQUksSUFBSSxJQUFJLENBQUMsTUFBTSxLQUFLLGlCQUFpQixDQUFDLE9BQU8sRUFBRTtBQUNuRCxNQUFNLFFBQVEsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUM7QUFDM0IsS0FBSztBQUNMO0FBQ0EsSUFBSSxJQUFJLHdCQUF3QixFQUFFO0FBQ2xDLE1BQU0sSUFBSSxDQUFDLE1BQU0sQ0FBQyx3QkFBd0IsQ0FBQyxDQUFDO0FBQzVDLEtBQUs7QUFDTDtBQUNBLElBQUksT0FBTztBQUNYLE1BQU0sV0FBVyxFQUFFLFlBQVk7QUFDL0IsUUFBUSxRQUFRLElBQUksS0FBSyxDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLENBQUM7QUFDckQsUUFBUSx3QkFBd0IsSUFBSSxLQUFLLENBQUMsYUFBYSxDQUFDLE1BQU0sQ0FBQyx3QkFBd0IsQ0FBQyxDQUFDO0FBQ3pGLE9BQU87QUFDUCxLQUFLLENBQUM7QUFDTixHQUFHLENBQUM7QUFDSjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxFQUFFLFdBQVcsQ0FBQyxTQUFTLENBQUMsT0FBTyxHQUFHLFVBQVUsUUFBUSxFQUFFO0FBQ3RELElBQUksSUFBSSxDQUFDLGNBQWMsQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLENBQUM7QUFDdEMsSUFBSSxPQUFPLElBQUksQ0FBQztBQUNoQixHQUFHLENBQUM7QUFDSjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxFQUFFLFdBQVcsQ0FBQyxTQUFTLENBQUMsTUFBTSxHQUFHLFVBQVUsUUFBUSxFQUFFO0FBQ3JELElBQUksSUFBSSxDQUFDLGFBQWEsQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLENBQUM7QUFDckMsSUFBSSxPQUFPLElBQUksQ0FBQztBQUNoQixHQUFHLENBQUM7QUFDSjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxFQUFFLFdBQVcsQ0FBQyxTQUFTLENBQUMsUUFBUSxHQUFHLFVBQVUsUUFBUSxFQUFFO0FBQ3ZELElBQUksSUFBSSxDQUFDLGdCQUFnQixDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsQ0FBQztBQUN4QyxJQUFJLE9BQU8sSUFBSSxDQUFDO0FBQ2hCLEdBQUcsQ0FBQztBQUNKO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEVBQUUsV0FBVyxDQUFDLFNBQVMsQ0FBQyxNQUFNLEdBQUcsVUFBVSxRQUFRLEVBQUU7QUFDckQsSUFBSSxJQUFJLENBQUMsYUFBYSxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsQ0FBQztBQUNyQyxJQUFJLE9BQU8sSUFBSSxDQUFDO0FBQ2hCLEdBQUcsQ0FBQztBQUNKO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEVBQUUsV0FBVyxDQUFDLFNBQVMsQ0FBQyxNQUFNLEdBQUcsVUFBVSxRQUFRLEVBQUU7QUFDckQsSUFBSSxJQUFJLENBQUMsYUFBYSxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsQ0FBQztBQUNyQyxJQUFJLE9BQU8sSUFBSSxDQUFDO0FBQ2hCLEdBQUcsQ0FBQztBQUNKO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEVBQUUsV0FBVyxDQUFDLFNBQVMsQ0FBQyxHQUFHLEdBQUcsVUFBVSxRQUFRLEVBQUU7QUFDbEQsSUFBSSxJQUFJLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsQ0FBQztBQUNwQyxJQUFJLElBQUksQ0FBQyxjQUFjLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxDQUFDO0FBQ3pDLElBQUksSUFBSSxDQUFDLGFBQWEsQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLENBQUM7QUFDeEMsSUFBSSxJQUFJLENBQUMsYUFBYSxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsQ0FBQztBQUN4QyxJQUFJLElBQUksQ0FBQyxhQUFhLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxDQUFDO0FBQ3hDLElBQUksSUFBSSxDQUFDLGdCQUFnQixDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsQ0FBQztBQUMzQyxJQUFJLE9BQU8sSUFBSSxDQUFDO0FBQ2hCLEdBQUcsQ0FBQztBQUNKO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEVBQUUsV0FBVyxDQUFDLFNBQVMsQ0FBQyxLQUFLLEdBQUcsVUFBVSxZQUFZLEVBQUU7QUFDeEQsSUFBSSxJQUFJLEtBQUssR0FBRyxJQUFJLENBQUM7QUFDckI7QUFDQSxJQUFJLElBQUksSUFBSSxDQUFDLE1BQU0sS0FBSyxpQkFBaUIsQ0FBQyxPQUFPLEVBQUU7QUFDbkQ7QUFDQSxNQUFNLE9BQU8sSUFBSSxDQUFDO0FBQ2xCLEtBQUs7QUFDTDtBQUNBLElBQUksUUFBUSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsU0FBUyxFQUFFLElBQUksQ0FBQyxDQUFDO0FBQzVDLElBQUksSUFBSSxDQUFDLFdBQVcsR0FBRyxJQUFJLENBQUM7QUFDNUIsSUFBSSxJQUFJLENBQUMsTUFBTSxHQUFHLGlCQUFpQixDQUFDLE9BQU8sQ0FBQztBQUM1QyxJQUFJLElBQUksYUFBYSxHQUFHLFlBQVksS0FBSyxTQUFTLEdBQUcsSUFBSSxDQUFDLFlBQVksR0FBRyxPQUFPLENBQUMsSUFBSSxFQUFFLFlBQVk7QUFDbkcsTUFBTSxPQUFPLE9BQU8sQ0FBQyxZQUFZLENBQUMsR0FBRyxLQUFLLENBQUMsT0FBTyxDQUFDLFlBQVksQ0FBQyxZQUFZLENBQUMsR0FBRyxLQUFLLENBQUMsT0FBTyxDQUFDLFlBQVksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLFlBQVksRUFBRSxLQUFLLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUM7QUFDNUosS0FBSyxDQUFDLENBQUM7QUFDUDtBQUNBLElBQUksSUFBSSxJQUFJLENBQUMsT0FBTyxDQUFDLFFBQVEsRUFBRTtBQUMvQixNQUFNLElBQUksQ0FBQyxTQUFTLEVBQUUsQ0FBQztBQUN2QixLQUFLO0FBQ0w7QUFDQSxJQUFJLElBQUksQ0FBQyxTQUFTLENBQUMsVUFBVSxDQUFDLFlBQVk7QUFDMUMsTUFBTSxLQUFLLENBQUMsTUFBTSxDQUFDLGFBQWEsRUFBRSxTQUFTLENBQUMsQ0FBQztBQUM3QyxLQUFLLENBQUMsQ0FBQztBQUNQLElBQUksT0FBTyxJQUFJLENBQUM7QUFDaEIsR0FBRyxDQUFDO0FBQ0o7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxFQUFFLFdBQVcsQ0FBQyxTQUFTLENBQUMsSUFBSSxHQUFHLFlBQVk7QUFDM0MsSUFBSSxJQUFJLEdBQUcsRUFBRSxFQUFFLEVBQUUsR0FBRyxFQUFFLEVBQUUsRUFBRSxHQUFHLEVBQUUsRUFBRSxFQUFFLEdBQUcsRUFBRSxFQUFFLEVBQUUsSUFBSSxFQUFFLEVBQUUsQ0FBQztBQUNyRDtBQUNBLElBQUksSUFBSSxLQUFLLEdBQUcsSUFBSSxDQUFDO0FBQ3JCO0FBQ0EsSUFBSSxJQUFJO0FBQ1IsTUFBTSxLQUFLLElBQUksRUFBRSxHQUFHLFFBQVEsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLEVBQUUsRUFBRSxHQUFHLEVBQUUsQ0FBQyxJQUFJLEVBQUUsRUFBRSxDQUFDLEVBQUUsQ0FBQyxJQUFJLEVBQUUsRUFBRSxHQUFHLEVBQUUsQ0FBQyxJQUFJLEVBQUUsRUFBRTtBQUN4RixRQUFRLElBQUksUUFBUSxHQUFHLEVBQUUsQ0FBQyxLQUFLLENBQUM7QUFDaEMsUUFBUSxJQUFJLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsQ0FBQztBQUN4QyxPQUFPO0FBQ1AsS0FBSyxDQUFDLE9BQU8sS0FBSyxFQUFFO0FBQ3BCLE1BQU0sR0FBRyxHQUFHO0FBQ1osUUFBUSxLQUFLLEVBQUUsS0FBSztBQUNwQixPQUFPLENBQUM7QUFDUixLQUFLLFNBQVM7QUFDZCxNQUFNLElBQUk7QUFDVixRQUFRLElBQUksRUFBRSxJQUFJLENBQUMsRUFBRSxDQUFDLElBQUksS0FBSyxFQUFFLEdBQUcsRUFBRSxDQUFDLE1BQU0sQ0FBQyxFQUFFLEVBQUUsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUM7QUFDNUQsT0FBTyxTQUFTO0FBQ2hCLFFBQVEsSUFBSSxHQUFHLEVBQUUsTUFBTSxHQUFHLENBQUMsS0FBSyxDQUFDO0FBQ2pDLE9BQU87QUFDUCxLQUFLO0FBQ0w7QUFDQSxJQUFJLElBQUk7QUFDUixNQUFNLEtBQUssSUFBSSxFQUFFLEdBQUcsUUFBUSxDQUFDLElBQUksQ0FBQyxhQUFhLENBQUMsRUFBRSxFQUFFLEdBQUcsRUFBRSxDQUFDLElBQUksRUFBRSxFQUFFLENBQUMsRUFBRSxDQUFDLElBQUksRUFBRSxFQUFFLEdBQUcsRUFBRSxDQUFDLElBQUksRUFBRSxFQUFFO0FBQzVGLFFBQVEsSUFBSSxRQUFRLEdBQUcsRUFBRSxDQUFDLEtBQUssQ0FBQztBQUNoQztBQUNBLFFBQVEsUUFBUSxFQUFFLENBQUM7QUFDbkIsUUFBUSxJQUFJLENBQUMsYUFBYSxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsQ0FBQztBQUM1QyxPQUFPO0FBQ1AsS0FBSyxDQUFDLE9BQU8sS0FBSyxFQUFFO0FBQ3BCLE1BQU0sR0FBRyxHQUFHO0FBQ1osUUFBUSxLQUFLLEVBQUUsS0FBSztBQUNwQixPQUFPLENBQUM7QUFDUixLQUFLLFNBQVM7QUFDZCxNQUFNLElBQUk7QUFDVixRQUFRLElBQUksRUFBRSxJQUFJLENBQUMsRUFBRSxDQUFDLElBQUksS0FBSyxFQUFFLEdBQUcsRUFBRSxDQUFDLE1BQU0sQ0FBQyxFQUFFLEVBQUUsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUM7QUFDNUQsT0FBTyxTQUFTO0FBQ2hCLFFBQVEsSUFBSSxHQUFHLEVBQUUsTUFBTSxHQUFHLENBQUMsS0FBSyxDQUFDO0FBQ2pDLE9BQU87QUFDUCxLQUFLO0FBQ0w7QUFDQSxJQUFJLElBQUk7QUFDUixNQUFNLEtBQUssSUFBSSxFQUFFLEdBQUcsUUFBUSxDQUFDLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxFQUFFLEVBQUUsR0FBRyxFQUFFLENBQUMsSUFBSSxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUMsSUFBSSxFQUFFLEVBQUUsR0FBRyxFQUFFLENBQUMsSUFBSSxFQUFFLEVBQUU7QUFDL0YsUUFBUSxJQUFJLFFBQVEsR0FBRyxFQUFFLENBQUMsS0FBSyxDQUFDO0FBQ2hDLFFBQVEsSUFBSSxDQUFDLGdCQUFnQixDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsQ0FBQztBQUMvQyxPQUFPO0FBQ1AsS0FBSyxDQUFDLE9BQU8sS0FBSyxFQUFFO0FBQ3BCLE1BQU0sR0FBRyxHQUFHO0FBQ1osUUFBUSxLQUFLLEVBQUUsS0FBSztBQUNwQixPQUFPLENBQUM7QUFDUixLQUFLLFNBQVM7QUFDZCxNQUFNLElBQUk7QUFDVixRQUFRLElBQUksRUFBRSxJQUFJLENBQUMsRUFBRSxDQUFDLElBQUksS0FBSyxFQUFFLEdBQUcsRUFBRSxDQUFDLE1BQU0sQ0FBQyxFQUFFLEVBQUUsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUM7QUFDNUQsT0FBTyxTQUFTO0FBQ2hCLFFBQVEsSUFBSSxHQUFHLEVBQUUsTUFBTSxHQUFHLENBQUMsS0FBSyxDQUFDO0FBQ2pDLE9BQU87QUFDUCxLQUFLO0FBQ0w7QUFDQSxJQUFJLElBQUk7QUFDUixNQUFNLEtBQUssSUFBSSxFQUFFLEdBQUcsUUFBUSxDQUFDLElBQUksQ0FBQyxhQUFhLENBQUMsRUFBRSxFQUFFLEdBQUcsRUFBRSxDQUFDLElBQUksRUFBRSxFQUFFLENBQUMsRUFBRSxDQUFDLElBQUksRUFBRSxFQUFFLEdBQUcsRUFBRSxDQUFDLElBQUksRUFBRSxFQUFFO0FBQzVGLFFBQVEsSUFBSSxRQUFRLEdBQUcsRUFBRSxDQUFDLEtBQUssQ0FBQztBQUNoQyxRQUFRLElBQUksQ0FBQyxhQUFhLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxDQUFDO0FBQzVDLE9BQU87QUFDUCxLQUFLLENBQUMsT0FBTyxLQUFLLEVBQUU7QUFDcEIsTUFBTSxHQUFHLEdBQUc7QUFDWixRQUFRLEtBQUssRUFBRSxLQUFLO0FBQ3BCLE9BQU8sQ0FBQztBQUNSLEtBQUssU0FBUztBQUNkLE1BQU0sSUFBSTtBQUNWLFFBQVEsSUFBSSxFQUFFLElBQUksQ0FBQyxFQUFFLENBQUMsSUFBSSxLQUFLLEVBQUUsR0FBRyxFQUFFLENBQUMsTUFBTSxDQUFDLEVBQUUsRUFBRSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQztBQUM1RCxPQUFPLFNBQVM7QUFDaEIsUUFBUSxJQUFJLEdBQUcsRUFBRSxNQUFNLEdBQUcsQ0FBQyxLQUFLLENBQUM7QUFDakMsT0FBTztBQUNQLEtBQUs7QUFDTDtBQUNBLElBQUksSUFBSSxDQUFDLEtBQUssQ0FBQyxhQUFhLENBQUMsT0FBTyxDQUFDLFVBQVUsU0FBUyxFQUFFO0FBQzFELE1BQU0sSUFBSSxJQUFJLEVBQUUsRUFBRSxDQUFDO0FBQ25CO0FBQ0EsTUFBTSxJQUFJO0FBQ1YsUUFBUSxLQUFLLElBQUksRUFBRSxHQUFHLFFBQVEsQ0FBQyxTQUFTLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxFQUFFLEVBQUUsR0FBRyxFQUFFLENBQUMsSUFBSSxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUMsSUFBSSxFQUFFLEVBQUUsR0FBRyxFQUFFLENBQUMsSUFBSSxFQUFFLEVBQUU7QUFDckcsVUFBVSxJQUFJLE1BQU0sR0FBRyxFQUFFLENBQUMsS0FBSyxDQUFDO0FBQ2hDO0FBQ0EsVUFBVSxLQUFLLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRSxLQUFLLENBQUMsS0FBSyxDQUFDLENBQUM7QUFDMUMsU0FBUztBQUNULE9BQU8sQ0FBQyxPQUFPLE1BQU0sRUFBRTtBQUN2QixRQUFRLElBQUksR0FBRztBQUNmLFVBQVUsS0FBSyxFQUFFLE1BQU07QUFDdkIsU0FBUyxDQUFDO0FBQ1YsT0FBTyxTQUFTO0FBQ2hCLFFBQVEsSUFBSTtBQUNaLFVBQVUsSUFBSSxFQUFFLElBQUksQ0FBQyxFQUFFLENBQUMsSUFBSSxLQUFLLEVBQUUsR0FBRyxFQUFFLENBQUMsTUFBTSxDQUFDLEVBQUUsRUFBRSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQztBQUM5RCxTQUFTLFNBQVM7QUFDbEIsVUFBVSxJQUFJLElBQUksRUFBRSxNQUFNLElBQUksQ0FBQyxLQUFLLENBQUM7QUFDckMsU0FBUztBQUNULE9BQU87QUFDUCxLQUFLLENBQUMsQ0FBQztBQUNQO0FBQ0EsSUFBSSxJQUFJLENBQUMsUUFBUSxDQUFDLE9BQU8sQ0FBQyxVQUFVLEtBQUssRUFBRTtBQUMzQyxNQUFNLElBQUksVUFBVSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsRUFBRTtBQUNsQyxRQUFRLEtBQUssQ0FBQyxJQUFJLEVBQUUsQ0FBQztBQUNyQixPQUFPO0FBQ1AsS0FBSyxDQUFDLENBQUM7QUFDUDtBQUNBLElBQUksSUFBSTtBQUNSO0FBQ0EsTUFBTSxLQUFLLElBQUksRUFBRSxHQUFHLFFBQVEsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLGdCQUFnQixDQUFDLENBQUMsRUFBRSxFQUFFLEdBQUcsRUFBRSxDQUFDLElBQUksRUFBRSxFQUFFLENBQUMsRUFBRSxDQUFDLElBQUksRUFBRSxFQUFFLEdBQUcsRUFBRSxDQUFDLElBQUksRUFBRSxFQUFFO0FBQ3JHLFFBQVEsSUFBSSxHQUFHLEdBQUcsRUFBRSxDQUFDLEtBQUssQ0FBQztBQUMzQixRQUFRLElBQUksQ0FBQyxLQUFLLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO0FBQzVELE9BQU87QUFDUCxLQUFLLENBQUMsT0FBTyxNQUFNLEVBQUU7QUFDckIsTUFBTSxJQUFJLEdBQUc7QUFDYixRQUFRLEtBQUssRUFBRSxNQUFNO0FBQ3JCLE9BQU8sQ0FBQztBQUNSLEtBQUssU0FBUztBQUNkLE1BQU0sSUFBSTtBQUNWLFFBQVEsSUFBSSxFQUFFLElBQUksQ0FBQyxFQUFFLENBQUMsSUFBSSxLQUFLLEVBQUUsR0FBRyxFQUFFLENBQUMsTUFBTSxDQUFDLEVBQUUsRUFBRSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQztBQUM1RCxPQUFPLFNBQVM7QUFDaEIsUUFBUSxJQUFJLElBQUksRUFBRSxNQUFNLElBQUksQ0FBQyxLQUFLLENBQUM7QUFDbkMsT0FBTztBQUNQLEtBQUs7QUFDTDtBQUNBLElBQUksSUFBSSxDQUFDLFNBQVMsQ0FBQyxLQUFLLEVBQUUsQ0FBQztBQUMzQixJQUFJLElBQUksQ0FBQyxXQUFXLEdBQUcsS0FBSyxDQUFDO0FBQzdCLElBQUksSUFBSSxDQUFDLE1BQU0sR0FBRyxpQkFBaUIsQ0FBQyxPQUFPLENBQUM7QUFDNUMsSUFBSSxRQUFRLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQztBQUNsQyxJQUFJLE9BQU8sSUFBSSxDQUFDO0FBQ2hCLEdBQUcsQ0FBQztBQUNKO0FBQ0EsRUFBRSxXQUFXLENBQUMsU0FBUyxDQUFDLEtBQUssR0FBRyxVQUFVLE1BQU0sRUFBRTtBQUNsRCxJQUFJLElBQUksS0FBSyxHQUFHLElBQUksQ0FBQztBQUNyQjtBQUNBLElBQUksSUFBSSxJQUFJLENBQUMsTUFBTSxLQUFLLGlCQUFpQixDQUFDLFVBQVUsSUFBSSxJQUFJLENBQUMsT0FBTyxDQUFDLFdBQVcsRUFBRTtBQUNsRjtBQUNBLE1BQU0sSUFBSSxDQUFDLGFBQWEsRUFBRTtBQUMxQixRQUFRLElBQUksQ0FBQyxLQUFLLEVBQUUsTUFBTSxDQUFDLE1BQU0sR0FBRyxpREFBaUQsR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLEVBQUUsR0FBRyw4RUFBOEUsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUM7QUFDbE4sT0FBTztBQUNQLEtBQUssTUFBTSxJQUFJLElBQUksQ0FBQyxNQUFNLEtBQUssaUJBQWlCLENBQUMsT0FBTyxFQUFFO0FBQzFELE1BQU0sTUFBTSxJQUFJLEtBQUs7QUFDckIsTUFBTSxNQUFNLENBQUMsTUFBTSxHQUFHLGlEQUFpRCxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsRUFBRSxHQUFHLHlHQUF5RyxDQUFDLENBQUM7QUFDdk0sS0FBSztBQUNMO0FBQ0EsSUFBSSxJQUFJLENBQUMsU0FBUyxDQUFDLFFBQVEsQ0FBQyxZQUFZO0FBQ3hDLE1BQU0sSUFBSSxJQUFJLEVBQUUsRUFBRSxDQUFDO0FBQ25CO0FBQ0EsTUFBTSxJQUFJLFNBQVMsR0FBRyxLQUFLLENBQUMsS0FBSyxDQUFDO0FBQ2xDLE1BQU0sSUFBSSxZQUFZLEdBQUcsS0FBSyxDQUFDO0FBQy9CLE1BQU0sSUFBSSxjQUFjLEdBQUcsRUFBRSxDQUFDO0FBQzlCO0FBQ0EsTUFBTSxJQUFJLE9BQU8sR0FBRyxVQUFVLE9BQU8sRUFBRTtBQUN2QyxRQUFRLElBQUksTUFBTSxHQUFHLFlBQVksQ0FBQyxPQUFPLENBQUMsQ0FBQztBQUMzQztBQUNBLFFBQVEsS0FBSyxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQztBQUM5QjtBQUNBLFFBQVEsU0FBUyxHQUFHLE9BQU8sQ0FBQyxLQUFLLEVBQUUsWUFBWTtBQUMvQyxVQUFVLE9BQU8sS0FBSyxDQUFDLE9BQU8sQ0FBQyxVQUFVLENBQUMsU0FBUyxFQUFFLE1BQU0sQ0FBQyxDQUFDO0FBQzdELFNBQVMsQ0FBQyxDQUFDO0FBQ1gsUUFBUSxjQUFjLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxjQUFjLEVBQUUsUUFBUSxDQUFDLFNBQVMsQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLFVBQVUsQ0FBQyxFQUFFO0FBQzlGLFVBQVUsT0FBTyxpQkFBaUIsQ0FBQyxDQUFDLEVBQUUsU0FBUyxDQUFDLENBQUM7QUFDakQsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQ2IsUUFBUSxZQUFZLEdBQUcsWUFBWSxJQUFJLENBQUMsQ0FBQyxTQUFTLENBQUMsT0FBTyxDQUFDO0FBQzNELE9BQU8sQ0FBQztBQUNSO0FBQ0EsTUFBTSxJQUFJO0FBQ1YsUUFBUSxLQUFLLElBQUksUUFBUSxHQUFHLFFBQVEsQ0FBQyxNQUFNLENBQUMsRUFBRSxVQUFVLEdBQUcsUUFBUSxDQUFDLElBQUksRUFBRSxFQUFFLENBQUMsVUFBVSxDQUFDLElBQUksRUFBRSxVQUFVLEdBQUcsUUFBUSxDQUFDLElBQUksRUFBRSxFQUFFO0FBQzVILFVBQVUsSUFBSSxPQUFPLEdBQUcsVUFBVSxDQUFDLEtBQUssQ0FBQztBQUN6QztBQUNBLFVBQVUsT0FBTyxDQUFDLE9BQU8sQ0FBQyxDQUFDO0FBQzNCLFNBQVM7QUFDVCxPQUFPLENBQUMsT0FBTyxNQUFNLEVBQUU7QUFDdkIsUUFBUSxJQUFJLEdBQUc7QUFDZixVQUFVLEtBQUssRUFBRSxNQUFNO0FBQ3ZCLFNBQVMsQ0FBQztBQUNWLE9BQU8sU0FBUztBQUNoQixRQUFRLElBQUk7QUFDWixVQUFVLElBQUksVUFBVSxJQUFJLENBQUMsVUFBVSxDQUFDLElBQUksS0FBSyxFQUFFLEdBQUcsUUFBUSxDQUFDLE1BQU0sQ0FBQyxFQUFFLEVBQUUsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUM7QUFDMUYsU0FBUyxTQUFTO0FBQ2xCLFVBQVUsSUFBSSxJQUFJLEVBQUUsTUFBTSxJQUFJLENBQUMsS0FBSyxDQUFDO0FBQ3JDLFNBQVM7QUFDVCxPQUFPO0FBQ1A7QUFDQSxNQUFNLFNBQVMsQ0FBQyxPQUFPLEdBQUcsWUFBWSxDQUFDO0FBQ3ZDLE1BQU0sU0FBUyxDQUFDLE9BQU8sR0FBRyxjQUFjLENBQUM7QUFDekM7QUFDQSxNQUFNLEtBQUssQ0FBQyxNQUFNLENBQUMsU0FBUyxFQUFFLFlBQVksQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDdkUsS0FBSyxDQUFDLENBQUM7QUFDUCxHQUFHLENBQUM7QUFDSjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEVBQUUsV0FBVyxDQUFDLFNBQVMsQ0FBQyxNQUFNLEdBQUcsVUFBVSxLQUFLLEVBQUU7QUFDbEQsSUFBSSxPQUFPLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRSxLQUFLLENBQUMsQ0FBQztBQUN2QyxHQUFHLENBQUM7QUFDSjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxFQUFFLFdBQVcsQ0FBQyxTQUFTLENBQUMsU0FBUyxHQUFHLFVBQVUsS0FBSyxFQUFFO0FBQ3JELElBQUksSUFBSSxLQUFLLEdBQUcsSUFBSSxDQUFDO0FBQ3JCO0FBQ0EsSUFBSSxJQUFJLE1BQU0sR0FBRyxZQUFZLENBQUMsS0FBSyxDQUFDLENBQUM7QUFDckM7QUFDQSxJQUFJLElBQUksTUFBTSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsYUFBYSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLFVBQVUsU0FBUyxFQUFFO0FBQ3JHLE1BQU0sT0FBTyxTQUFTLENBQUMsT0FBTyxDQUFDLGFBQWEsQ0FBQyxLQUFLLENBQUMsQ0FBQztBQUNwRCxLQUFLLENBQUMsRUFBRTtBQUNSLE1BQU0sTUFBTSxNQUFNLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQztBQUM3QixLQUFLO0FBQ0w7QUFDQSxJQUFJLElBQUksU0FBUyxHQUFHLE9BQU8sQ0FBQyxJQUFJLEVBQUUsWUFBWTtBQUM5QyxNQUFNLE9BQU8sS0FBSyxDQUFDLE9BQU8sQ0FBQyxVQUFVLENBQUMsS0FBSyxDQUFDLEtBQUssRUFBRSxNQUFNLENBQUMsQ0FBQztBQUMzRCxLQUFLLENBQUMsQ0FBQztBQUNQLElBQUksT0FBTyxTQUFTLENBQUM7QUFDckIsR0FBRyxDQUFDO0FBQ0o7QUFDQSxFQUFFLFdBQVcsQ0FBQyxTQUFTLENBQUMsT0FBTyxHQUFHLFVBQVUsS0FBSyxFQUFFO0FBQ25ELElBQUksSUFBSSxJQUFJLEVBQUUsRUFBRSxDQUFDO0FBQ2pCO0FBQ0EsSUFBSSxJQUFJO0FBQ1IsTUFBTSxLQUFLLElBQUksRUFBRSxHQUFHLFFBQVEsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLEVBQUUsRUFBRSxHQUFHLEVBQUUsQ0FBQyxJQUFJLEVBQUUsRUFBRSxDQUFDLEVBQUUsQ0FBQyxJQUFJLEVBQUUsRUFBRSxHQUFHLEVBQUUsQ0FBQyxJQUFJLEVBQUUsRUFBRTtBQUN4RixRQUFRLElBQUksRUFBRSxHQUFHLEVBQUUsQ0FBQyxLQUFLLENBQUM7QUFDMUIsUUFBUSxJQUFJLEtBQUssR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsQ0FBQztBQUMxQztBQUNBLFFBQVEsSUFBSSxDQUFDLEtBQUssRUFBRTtBQUNwQixVQUFVLE1BQU0sSUFBSSxLQUFLLENBQUMsMkJBQTJCLEdBQUcsS0FBSyxHQUFHLHNCQUFzQixHQUFHLElBQUksQ0FBQyxFQUFFLEdBQUcsMEJBQTBCLEdBQUcsRUFBRSxHQUFHLElBQUksQ0FBQyxDQUFDO0FBQzNJLFNBQVM7QUFDVDtBQUNBLFFBQVEsS0FBSyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQztBQUMxQixPQUFPO0FBQ1AsS0FBSyxDQUFDLE9BQU8sTUFBTSxFQUFFO0FBQ3JCLE1BQU0sSUFBSSxHQUFHO0FBQ2IsUUFBUSxLQUFLLEVBQUUsTUFBTTtBQUNyQixPQUFPLENBQUM7QUFDUixLQUFLLFNBQVM7QUFDZCxNQUFNLElBQUk7QUFDVixRQUFRLElBQUksRUFBRSxJQUFJLENBQUMsRUFBRSxDQUFDLElBQUksS0FBSyxFQUFFLEdBQUcsRUFBRSxDQUFDLE1BQU0sQ0FBQyxFQUFFLEVBQUUsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUM7QUFDNUQsT0FBTyxTQUFTO0FBQ2hCLFFBQVEsSUFBSSxJQUFJLEVBQUUsTUFBTSxJQUFJLENBQUMsS0FBSyxDQUFDO0FBQ25DLE9BQU87QUFDUCxLQUFLO0FBQ0wsR0FBRyxDQUFDO0FBQ0o7QUFDQSxFQUFFLFdBQVcsQ0FBQyxTQUFTLENBQUMsS0FBSyxHQUFHLFVBQVUsVUFBVSxFQUFFO0FBQ3RELElBQUksSUFBSSxLQUFLLEdBQUcsSUFBSSxDQUFDO0FBQ3JCO0FBQ0EsSUFBSSxJQUFJLENBQUMsZ0JBQWdCLENBQUMsVUFBVSxDQUFDLEVBQUUsQ0FBQyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsVUFBVSxDQUFDLFlBQVk7QUFDN0UsTUFBTSxJQUFJLFVBQVUsQ0FBQyxFQUFFLEVBQUU7QUFDekIsUUFBUSxLQUFLLENBQUMsTUFBTSxDQUFDLFVBQVUsQ0FBQyxNQUFNLEVBQUUsVUFBVSxDQUFDLEVBQUUsQ0FBQyxDQUFDO0FBQ3ZELE9BQU8sTUFBTTtBQUNiLFFBQVEsS0FBSyxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsTUFBTSxDQUFDLENBQUM7QUFDdEMsT0FBTztBQUNQLEtBQUssRUFBRSxVQUFVLENBQUMsS0FBSyxDQUFDLENBQUM7QUFDekIsR0FBRyxDQUFDO0FBQ0o7QUFDQSxFQUFFLFdBQVcsQ0FBQyxTQUFTLENBQUMsTUFBTSxHQUFHLFVBQVUsTUFBTSxFQUFFO0FBQ25ELElBQUksSUFBSSxDQUFDLEtBQUssQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLGdCQUFnQixDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUM7QUFDM0QsSUFBSSxPQUFPLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxNQUFNLENBQUMsQ0FBQztBQUN6QyxHQUFHLENBQUM7QUFDSjtBQUNBLEVBQUUsV0FBVyxDQUFDLFNBQVMsQ0FBQyxJQUFJLEdBQUcsVUFBVSxNQUFNLEVBQUUsS0FBSyxFQUFFLGlCQUFpQixFQUFFO0FBQzNFLElBQUksSUFBSSxpQkFBaUIsS0FBSyxLQUFLLENBQUMsRUFBRTtBQUN0QyxNQUFNLGlCQUFpQixHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQztBQUN2RCxLQUFLO0FBQ0w7QUFDQSxJQUFJLElBQUksT0FBTyxHQUFHLEtBQUssQ0FBQyxPQUFPO0FBQy9CLFFBQVEsTUFBTSxHQUFHLEtBQUssQ0FBQyxNQUFNLENBQUM7QUFDOUIsSUFBSSxJQUFJLFlBQVksR0FBRyxNQUFNLENBQUMsSUFBSSxJQUFJLGlCQUFpQixDQUFDLE1BQU0sQ0FBQyxJQUFJLEVBQUUsaUJBQWlCLENBQUMsQ0FBQztBQUN4RixJQUFJLElBQUksSUFBSSxHQUFHLFVBQVUsQ0FBQyxZQUFZLENBQUMsR0FBRyxZQUFZLEdBQUcsWUFBWSxHQUFHLFlBQVksQ0FBQyxJQUFJLEdBQUcsTUFBTSxDQUFDLElBQUksQ0FBQztBQUN4RztBQUNBLElBQUksSUFBSSxJQUFJLEVBQUU7QUFDZCxNQUFNLElBQUk7QUFDVixRQUFRLE9BQU8sSUFBSSxDQUFDLE9BQU8sRUFBRSxNQUFNLENBQUMsSUFBSSxFQUFFO0FBQzFDLFVBQVUsTUFBTSxFQUFFLE1BQU07QUFDeEIsVUFBVSxLQUFLLEVBQUUsSUFBSSxDQUFDLEtBQUs7QUFDM0IsVUFBVSxNQUFNLEVBQUUsTUFBTTtBQUN4QixTQUFTLENBQUMsQ0FBQztBQUNYLE9BQU8sQ0FBQyxPQUFPLEdBQUcsRUFBRTtBQUNwQixRQUFRLElBQUksSUFBSSxDQUFDLE1BQU0sRUFBRTtBQUN6QixVQUFVLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDO0FBQzNCLFlBQVksSUFBSSxFQUFFLGNBQWM7QUFDaEMsWUFBWSxJQUFJLEVBQUUsR0FBRztBQUNyQixXQUFXLENBQUMsQ0FBQztBQUNiLFNBQVM7QUFDVDtBQUNBLFFBQVEsTUFBTSxHQUFHLENBQUM7QUFDbEIsT0FBTztBQUNQLEtBQUs7QUFDTDtBQUNBLElBQUksUUFBUSxNQUFNLENBQUMsSUFBSTtBQUN2QixNQUFNLEtBQUssSUFBSTtBQUNmLFFBQVEsSUFBSSxVQUFVLEdBQUcsTUFBTSxDQUFDO0FBQ2hDO0FBQ0EsUUFBUSxJQUFJLE9BQU8sVUFBVSxDQUFDLEtBQUssS0FBSyxRQUFRLEVBQUU7QUFDbEQsVUFBVSxJQUFJLENBQUMsS0FBSyxDQUFDLFVBQVUsQ0FBQyxDQUFDO0FBQ2pDLFVBQVUsT0FBTztBQUNqQixTQUFTLE1BQU07QUFDZixVQUFVLElBQUksVUFBVSxDQUFDLEVBQUUsRUFBRTtBQUM3QixZQUFZLElBQUksQ0FBQyxNQUFNLENBQUMsVUFBVSxDQUFDLE1BQU0sRUFBRSxVQUFVLENBQUMsRUFBRSxDQUFDLENBQUM7QUFDMUQsV0FBVyxNQUFNO0FBQ2pCLFlBQVksSUFBSSxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsTUFBTSxDQUFDLENBQUM7QUFDekMsV0FBVztBQUNYLFNBQVM7QUFDVDtBQUNBLFFBQVEsTUFBTTtBQUNkO0FBQ0EsTUFBTSxLQUFLLE1BQU07QUFDakIsUUFBUSxJQUFJLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQztBQUNuQyxRQUFRLE1BQU07QUFDZDtBQUNBLE1BQU0sS0FBSyxLQUFLO0FBQ2hCLFFBQVE7QUFDUixVQUFVLElBQUksUUFBUSxHQUFHLE1BQU0sQ0FBQyxRQUFRLENBQUM7QUFDekM7QUFDQTtBQUNBO0FBQ0EsVUFBVSxJQUFJLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxVQUFVLENBQUMsUUFBUSxDQUFDLEVBQUUsSUFBSSxRQUFRLENBQUMsSUFBSSxDQUFDLEVBQUU7QUFDcEUsWUFBWSxNQUFNO0FBQ2xCLFdBQVc7QUFDWDtBQUNBO0FBQ0EsVUFBVSxJQUFJLFFBQVEsQ0FBQyxJQUFJLEtBQUssV0FBVyxDQUFDLE1BQU0sRUFBRTtBQUNwRCxZQUFZLElBQUksWUFBWSxHQUFHLGNBQWMsQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLENBQUM7QUFDNUQsWUFBWSxJQUFJLGNBQWMsR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxRQUFRLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsUUFBUSxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsR0FBRyxTQUFTLENBQUM7QUFDOUgsWUFBWSxJQUFJLEVBQUUsR0FBRyxRQUFRLENBQUMsRUFBRTtBQUNoQyxnQkFBZ0IsSUFBSSxHQUFHLFFBQVEsQ0FBQyxJQUFJLENBQUM7QUFDckM7QUFDQSxZQUFZLElBQUksQ0FBQyxhQUFhLEVBQUU7QUFDaEMsY0FBYyxJQUFJLENBQUMsRUFBRSxTQUFTLElBQUksUUFBUSxDQUFDO0FBQzNDLGNBQWMsNERBQTRELEdBQUcsUUFBUSxDQUFDLEdBQUcsR0FBRyxtQkFBbUIsR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLEVBQUUsR0FBRyxNQUFNLEdBQUcsbUNBQW1DLENBQUMsQ0FBQztBQUNsTCxhQUFhO0FBQ2I7QUFDQSxZQUFZLElBQUksV0FBVyxHQUFHLGFBQWEsSUFBSSxRQUFRLEdBQUcsUUFBUSxDQUFDLFdBQVcsR0FBRyxDQUFDLENBQUMsUUFBUSxDQUFDLE9BQU8sQ0FBQztBQUNwRztBQUNBLFlBQVksSUFBSSxDQUFDLGNBQWMsRUFBRTtBQUNqQztBQUNBLGNBQWMsSUFBSSxDQUFDLGFBQWEsRUFBRTtBQUNsQyxnQkFBZ0IsSUFBSSxDQUFDLEtBQUssRUFBRSxtQ0FBbUMsR0FBRyxRQUFRLENBQUMsR0FBRyxHQUFHLGdCQUFnQixHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsRUFBRSxHQUFHLElBQUksQ0FBQyxDQUFDO0FBQzVILGVBQWU7QUFDZjtBQUNBLGNBQWMsT0FBTztBQUNyQixhQUFhO0FBQ2I7QUFDQSxZQUFZLElBQUksWUFBWSxHQUFHLElBQUksR0FBRyxVQUFVLENBQUMsSUFBSSxFQUFFLE9BQU8sRUFBRSxNQUFNLENBQUMsR0FBRyxTQUFTLENBQUM7QUFDcEYsWUFBWSxJQUFJLE1BQU0sR0FBRyxVQUFVLENBQUMsY0FBYyxDQUFDLEdBQUcsY0FBYyxDQUFDLE9BQU8sRUFBRSxNQUFNLENBQUMsSUFBSSxFQUFFO0FBQzNGLGNBQWMsSUFBSSxFQUFFLFlBQVk7QUFDaEMsY0FBYyxHQUFHLEVBQUUsWUFBWTtBQUMvQixhQUFhLENBQUMsR0FBRyxjQUFjLENBQUM7QUFDaEM7QUFDQSxZQUFZLElBQUksYUFBYSxDQUFDLE1BQU0sQ0FBQyxFQUFFO0FBQ3ZDLGNBQWMsSUFBSSxDQUFDLFlBQVksQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDO0FBQzdELGFBQWEsTUFBTSxJQUFJLFVBQVUsQ0FBQyxNQUFNLENBQUMsRUFBRTtBQUMzQyxjQUFjLElBQUksQ0FBQyxhQUFhLENBQUMsTUFBTSxFQUFFLEVBQUUsQ0FBQyxDQUFDO0FBQzdDLGFBQWEsTUFBTSxJQUFJLFlBQVksQ0FBQyxNQUFNLENBQUMsRUFBRTtBQUM3QyxjQUFjLElBQUksQ0FBQyxlQUFlLENBQUMsTUFBTSxFQUFFLEVBQUUsQ0FBQyxDQUFDO0FBQy9DLGFBQWEsTUFBTSxJQUFJLFNBQVMsQ0FBQyxNQUFNLENBQUMsRUFBRTtBQUMxQztBQUNBLGNBQWMsSUFBSSxDQUFDLFlBQVksQ0FBQyxZQUFZLEdBQUcsTUFBTSxDQUFDLFdBQVcsQ0FBQyxZQUFZLENBQUMsR0FBRyxNQUFNLEVBQUU7QUFDMUYsZ0JBQWdCLEVBQUUsRUFBRSxFQUFFO0FBQ3RCLGdCQUFnQixXQUFXLEVBQUUsV0FBVztBQUN4QyxlQUFlLENBQUMsQ0FBQztBQUNqQixhQUFhLE1BQU0sQ0FBQztBQUNwQixXQUFXLE1BQU07QUFDakIsWUFBWSxJQUFJLENBQUMsYUFBYSxDQUFDLFFBQVEsQ0FBQyxDQUFDO0FBQ3pDLFdBQVc7QUFDWDtBQUNBLFVBQVUsTUFBTTtBQUNoQixTQUFTO0FBQ1Q7QUFDQSxNQUFNLEtBQUssSUFBSTtBQUNmLFFBQVE7QUFDUixVQUFVLElBQUksQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxFQUFFLENBQUMsQ0FBQztBQUM3QyxVQUFVLE1BQU07QUFDaEIsU0FBUztBQUNUO0FBQ0EsTUFBTSxLQUFLLEdBQUc7QUFDZCxRQUFRLElBQUksS0FBSyxHQUFHLE1BQU0sQ0FBQyxLQUFLO0FBQ2hDLFlBQVksS0FBSyxHQUFHLE1BQU0sQ0FBQyxLQUFLLENBQUM7QUFDakM7QUFDQSxRQUFRLElBQUksS0FBSyxFQUFFO0FBQ25CLFVBQVUsSUFBSSxDQUFDLE1BQU0sQ0FBQyxLQUFLLEVBQUUsS0FBSyxDQUFDLENBQUM7QUFDcEMsU0FBUyxNQUFNO0FBQ2YsVUFBVSxJQUFJLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDO0FBQzdCLFNBQVM7QUFDVDtBQUNBLFFBQVEsTUFBTTtBQUNkO0FBQ0EsTUFBTTtBQUNOLFFBQVEsSUFBSSxDQUFDLGFBQWEsRUFBRTtBQUM1QixVQUFVLElBQUksQ0FBQyxLQUFLLEVBQUUsMkNBQTJDLEdBQUcsTUFBTSxDQUFDLElBQUksR0FBRyxHQUFHLENBQUMsQ0FBQztBQUN2RixTQUFTO0FBQ1Q7QUFDQSxRQUFRLE1BQU07QUFDZCxLQUFLO0FBQ0w7QUFDQSxJQUFJLE9BQU8sU0FBUyxDQUFDO0FBQ3JCLEdBQUcsQ0FBQztBQUNKO0FBQ0EsRUFBRSxXQUFXLENBQUMsU0FBUyxDQUFDLFdBQVcsR0FBRyxVQUFVLE9BQU8sRUFBRTtBQUN6RCxJQUFJLElBQUksQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxDQUFDO0FBQ2xDLElBQUksSUFBSSxDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLENBQUM7QUFDbkMsSUFBSSxPQUFPLElBQUksQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUFDLE9BQU8sQ0FBQyxDQUFDO0FBQ3hDLEdBQUcsQ0FBQztBQUNKO0FBQ0EsRUFBRSxXQUFXLENBQUMsU0FBUyxDQUFDLFNBQVMsR0FBRyxVQUFVLE9BQU8sRUFBRTtBQUN2RCxJQUFJLElBQUksS0FBSyxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxDQUFDO0FBQzNDO0FBQ0EsSUFBSSxJQUFJLENBQUMsS0FBSyxFQUFFO0FBQ2hCLE1BQU0sT0FBTztBQUNiLEtBQUs7QUFDTDtBQUNBLElBQUksSUFBSSxDQUFDLFdBQVcsQ0FBQyxPQUFPLENBQUMsQ0FBQztBQUM5QjtBQUNBLElBQUksSUFBSSxVQUFVLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxFQUFFO0FBQ2hDLE1BQU0sS0FBSyxDQUFDLElBQUksRUFBRSxDQUFDO0FBQ25CLEtBQUs7QUFDTCxHQUFHLENBQUM7QUFDSjtBQUNBLEVBQUUsV0FBVyxDQUFDLFNBQVMsQ0FBQyxLQUFLLEdBQUcsVUFBVSxNQUFNLEVBQUUsSUFBSSxFQUFFLE9BQU8sRUFBRTtBQUNqRSxJQUFJLElBQUksYUFBYSxDQUFDLE1BQU0sQ0FBQyxFQUFFO0FBQy9CLE1BQU0sT0FBTyxJQUFJLENBQUMsWUFBWSxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLEVBQUUsSUFBSSxDQUFDLENBQUM7QUFDOUQsS0FBSyxNQUFNLElBQUksVUFBVSxDQUFDLE1BQU0sQ0FBQyxFQUFFO0FBQ25DLE1BQU0sT0FBTyxJQUFJLENBQUMsYUFBYSxDQUFDLE1BQU0sRUFBRSxJQUFJLENBQUMsQ0FBQztBQUM5QyxLQUFLLE1BQU0sSUFBSSxjQUFjLENBQUMsTUFBTSxDQUFDLEVBQUU7QUFDdkMsTUFBTSxPQUFPLElBQUksQ0FBQyxVQUFVLENBQUMsTUFBTSxDQUFDLENBQUM7QUFDckMsS0FBSyxNQUFNLElBQUksWUFBWSxDQUFDLE1BQU0sQ0FBQyxFQUFFO0FBQ3JDLE1BQU0sT0FBTyxJQUFJLENBQUMsZUFBZSxDQUFDLE1BQU0sRUFBRSxJQUFJLENBQUMsQ0FBQztBQUNoRCxLQUFLLE1BQU0sSUFBSSxTQUFTLENBQUMsTUFBTSxDQUFDLEVBQUU7QUFDbEMsTUFBTSxPQUFPLElBQUksQ0FBQyxZQUFZLENBQUMsTUFBTSxFQUFFLFFBQVEsQ0FBQyxRQUFRLENBQUMsRUFBRSxFQUFFLE9BQU8sQ0FBQyxFQUFFO0FBQ3ZFLFFBQVEsRUFBRSxFQUFFLElBQUk7QUFDaEIsT0FBTyxDQUFDLENBQUMsQ0FBQztBQUNWLEtBQUssTUFBTTtBQUNYLE1BQU0sTUFBTSxJQUFJLEtBQUssQ0FBQywyQkFBMkIsR0FBRyxJQUFJLEdBQUcsZUFBZSxHQUFHLE9BQU8sTUFBTSxHQUFHLEtBQUssQ0FBQyxDQUFDO0FBQ3BHLEtBQUs7QUFDTCxHQUFHLENBQUM7QUFDSjtBQUNBLEVBQUUsV0FBVyxDQUFDLFNBQVMsQ0FBQyxZQUFZLEdBQUcsVUFBVSxPQUFPLEVBQUUsT0FBTyxFQUFFO0FBQ25FLElBQUksSUFBSSxLQUFLLEdBQUcsSUFBSSxDQUFDO0FBQ3JCO0FBQ0EsSUFBSSxJQUFJLE9BQU8sS0FBSyxLQUFLLENBQUMsRUFBRTtBQUM1QixNQUFNLE9BQU8sR0FBRyxFQUFFLENBQUM7QUFDbkIsS0FBSztBQUNMO0FBQ0EsSUFBSSxJQUFJLFlBQVksR0FBRyxJQUFJLFdBQVcsQ0FBQyxPQUFPLEVBQUUsUUFBUSxDQUFDLFFBQVEsQ0FBQyxFQUFFLEVBQUUsSUFBSSxDQUFDLE9BQU8sQ0FBQyxFQUFFO0FBQ3JGLE1BQU0sTUFBTSxFQUFFLElBQUk7QUFDbEIsTUFBTSxFQUFFLEVBQUUsT0FBTyxDQUFDLEVBQUUsSUFBSSxPQUFPLENBQUMsRUFBRTtBQUNsQyxLQUFLLENBQUMsQ0FBQyxDQUFDO0FBQ1I7QUFDQSxJQUFJLElBQUksZUFBZSxHQUFHLFFBQVEsQ0FBQyxRQUFRLENBQUMsRUFBRSxFQUFFLHFCQUFxQixDQUFDLEVBQUUsT0FBTyxDQUFDLENBQUM7QUFDakY7QUFDQSxJQUFJLElBQUksZUFBZSxDQUFDLElBQUksRUFBRTtBQUM5QixNQUFNLFlBQVksQ0FBQyxZQUFZLENBQUMsVUFBVSxLQUFLLEVBQUU7QUFDakQsUUFBUSxLQUFLLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRTtBQUMzQixVQUFVLEtBQUssRUFBRSxLQUFLO0FBQ3RCLFVBQVUsRUFBRSxFQUFFLFlBQVksQ0FBQyxFQUFFO0FBQzdCLFNBQVMsQ0FBQyxDQUFDO0FBQ1gsT0FBTyxDQUFDLENBQUM7QUFDVCxLQUFLO0FBQ0w7QUFDQSxJQUFJLElBQUksS0FBSyxHQUFHLFlBQVksQ0FBQztBQUM3QixJQUFJLElBQUksQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLFlBQVksQ0FBQyxFQUFFLEVBQUUsS0FBSyxDQUFDLENBQUM7QUFDOUM7QUFDQSxJQUFJLElBQUksZUFBZSxDQUFDLFdBQVcsRUFBRTtBQUNyQyxNQUFNLElBQUksQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLFlBQVksQ0FBQyxFQUFFLENBQUMsQ0FBQztBQUMxQyxLQUFLO0FBQ0w7QUFDQSxJQUFJLFlBQVksQ0FBQyxNQUFNLENBQUMsVUFBVSxTQUFTLEVBQUU7QUFDN0MsTUFBTSxLQUFLLENBQUMsV0FBVyxDQUFDLFlBQVksQ0FBQyxFQUFFLENBQUMsQ0FBQztBQUN6QztBQUNBLE1BQU0sS0FBSyxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsU0FBUyxFQUFFO0FBQ3pDLFFBQVEsTUFBTSxFQUFFLFlBQVksQ0FBQyxFQUFFO0FBQy9CLE9BQU8sQ0FBQyxDQUFDLENBQUM7QUFDVixLQUFLLENBQUMsQ0FBQyxLQUFLLEVBQUUsQ0FBQztBQUNmLElBQUksT0FBTyxLQUFLLENBQUM7QUFDakIsR0FBRyxDQUFDO0FBQ0o7QUFDQSxFQUFFLFdBQVcsQ0FBQyxTQUFTLENBQUMsWUFBWSxHQUFHLFVBQVUsT0FBTyxFQUFFLEVBQUUsRUFBRTtBQUM5RCxJQUFJLElBQUksS0FBSyxHQUFHLElBQUksQ0FBQztBQUNyQjtBQUNBLElBQUksSUFBSSxRQUFRLEdBQUcsS0FBSyxDQUFDO0FBQ3pCLElBQUksT0FBTyxDQUFDLElBQUksQ0FBQyxVQUFVLFFBQVEsRUFBRTtBQUNyQyxNQUFNLElBQUksQ0FBQyxRQUFRLEVBQUU7QUFDckIsUUFBUSxLQUFLLENBQUMsV0FBVyxDQUFDLEVBQUUsQ0FBQyxDQUFDO0FBQzlCO0FBQ0EsUUFBUSxLQUFLLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxVQUFVLENBQUMsRUFBRSxFQUFFLFFBQVEsQ0FBQyxFQUFFO0FBQzFELFVBQVUsTUFBTSxFQUFFLEVBQUU7QUFDcEIsU0FBUyxDQUFDLENBQUMsQ0FBQztBQUNaLE9BQU87QUFDUCxLQUFLLEVBQUUsVUFBVSxTQUFTLEVBQUU7QUFDNUIsTUFBTSxJQUFJLENBQUMsUUFBUSxFQUFFO0FBQ3JCLFFBQVEsS0FBSyxDQUFDLFdBQVcsQ0FBQyxFQUFFLENBQUMsQ0FBQztBQUM5QjtBQUNBLFFBQVEsSUFBSSxVQUFVLEdBQUdBLE9BQUssQ0FBQyxFQUFFLEVBQUUsU0FBUyxDQUFDLENBQUM7QUFDOUM7QUFDQSxRQUFRLElBQUk7QUFDWjtBQUNBLFVBQVUsS0FBSyxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsVUFBVSxFQUFFO0FBQzlDLFlBQVksTUFBTSxFQUFFLEVBQUU7QUFDdEIsV0FBVyxDQUFDLENBQUMsQ0FBQztBQUNkLFNBQVMsQ0FBQyxPQUFPLEtBQUssRUFBRTtBQUN4QixVQUFVLG9DQUFvQyxDQUFDLFNBQVMsRUFBRSxLQUFLLEVBQUUsRUFBRSxDQUFDLENBQUM7QUFDckU7QUFDQSxVQUFVLElBQUksS0FBSyxDQUFDLFFBQVEsRUFBRTtBQUM5QixZQUFZLEtBQUssQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLFVBQVUsRUFBRSxLQUFLLENBQUMsS0FBSyxDQUFDLENBQUM7QUFDekQsV0FBVztBQUNYO0FBQ0EsVUFBVSxJQUFJLEtBQUssQ0FBQyxPQUFPLENBQUMsTUFBTSxFQUFFO0FBQ3BDO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsWUFBWSxLQUFLLENBQUMsSUFBSSxFQUFFLENBQUM7QUFDekIsV0FBVztBQUNYLFNBQVM7QUFDVCxPQUFPO0FBQ1AsS0FBSyxDQUFDLENBQUM7QUFDUCxJQUFJLElBQUksS0FBSyxHQUFHO0FBQ2hCLE1BQU0sRUFBRSxFQUFFLEVBQUU7QUFDWixNQUFNLElBQUksRUFBRSxZQUFZO0FBQ3hCLFFBQVEsT0FBTyxLQUFLLENBQUMsQ0FBQztBQUN0QixPQUFPO0FBQ1AsTUFBTSxTQUFTLEVBQUUsVUFBVSxJQUFJLEVBQUUsV0FBVyxFQUFFLFFBQVEsRUFBRTtBQUN4RCxRQUFRLElBQUksUUFBUSxHQUFHLFVBQVUsQ0FBQyxJQUFJLEVBQUUsV0FBVyxFQUFFLFFBQVEsQ0FBQyxDQUFDO0FBQy9ELFFBQVEsSUFBSSxZQUFZLEdBQUcsS0FBSyxDQUFDO0FBQ2pDLFFBQVEsT0FBTyxDQUFDLElBQUksQ0FBQyxVQUFVLFFBQVEsRUFBRTtBQUN6QyxVQUFVLElBQUksWUFBWSxFQUFFO0FBQzVCLFlBQVksT0FBTztBQUNuQixXQUFXO0FBQ1g7QUFDQSxVQUFVLFFBQVEsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUM7QUFDbEM7QUFDQSxVQUFVLElBQUksWUFBWSxFQUFFO0FBQzVCLFlBQVksT0FBTztBQUNuQixXQUFXO0FBQ1g7QUFDQSxVQUFVLFFBQVEsQ0FBQyxRQUFRLEVBQUUsQ0FBQztBQUM5QixTQUFTLEVBQUUsVUFBVSxHQUFHLEVBQUU7QUFDMUIsVUFBVSxJQUFJLFlBQVksRUFBRTtBQUM1QixZQUFZLE9BQU87QUFDbkIsV0FBVztBQUNYO0FBQ0EsVUFBVSxRQUFRLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0FBQzlCLFNBQVMsQ0FBQyxDQUFDO0FBQ1gsUUFBUSxPQUFPO0FBQ2YsVUFBVSxXQUFXLEVBQUUsWUFBWTtBQUNuQyxZQUFZLE9BQU8sWUFBWSxHQUFHLElBQUksQ0FBQztBQUN2QyxXQUFXO0FBQ1gsU0FBUyxDQUFDO0FBQ1YsT0FBTztBQUNQLE1BQU0sSUFBSSxFQUFFLFlBQVk7QUFDeEIsUUFBUSxRQUFRLEdBQUcsSUFBSSxDQUFDO0FBQ3hCLE9BQU87QUFDUCxNQUFNLE1BQU0sRUFBRSxZQUFZO0FBQzFCLFFBQVEsT0FBTztBQUNmLFVBQVUsRUFBRSxFQUFFLEVBQUU7QUFDaEIsU0FBUyxDQUFDO0FBQ1YsT0FBTztBQUNQLEtBQUssQ0FBQztBQUNOLElBQUksSUFBSSxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsRUFBRSxFQUFFLEtBQUssQ0FBQyxDQUFDO0FBQ2pDLElBQUksT0FBTyxLQUFLLENBQUM7QUFDakIsR0FBRyxDQUFDO0FBQ0o7QUFDQSxFQUFFLFdBQVcsQ0FBQyxTQUFTLENBQUMsYUFBYSxHQUFHLFVBQVUsUUFBUSxFQUFFLEVBQUUsRUFBRTtBQUNoRSxJQUFJLElBQUksS0FBSyxHQUFHLElBQUksQ0FBQztBQUNyQjtBQUNBLElBQUksSUFBSSxRQUFRLEdBQUcsS0FBSyxDQUFDO0FBQ3pCLElBQUksSUFBSSxTQUFTLEdBQUcsSUFBSSxHQUFHLEVBQUUsQ0FBQztBQUM5QixJQUFJLElBQUksU0FBUyxHQUFHLElBQUksR0FBRyxFQUFFLENBQUM7QUFDOUI7QUFDQSxJQUFJLElBQUksT0FBTyxHQUFHLFVBQVUsQ0FBQyxFQUFFO0FBQy9CLE1BQU0sU0FBUyxDQUFDLE9BQU8sQ0FBQyxVQUFVLFFBQVEsRUFBRTtBQUM1QyxRQUFRLE9BQU8sUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQzNCLE9BQU8sQ0FBQyxDQUFDO0FBQ1Q7QUFDQSxNQUFNLElBQUksUUFBUSxFQUFFO0FBQ3BCLFFBQVEsT0FBTztBQUNmLE9BQU87QUFDUDtBQUNBLE1BQU0sS0FBSyxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsQ0FBQyxFQUFFO0FBQ2pDLFFBQVEsTUFBTSxFQUFFLEVBQUU7QUFDbEIsT0FBTyxDQUFDLENBQUMsQ0FBQztBQUNWLEtBQUssQ0FBQztBQUNOO0FBQ0EsSUFBSSxJQUFJLFlBQVksQ0FBQztBQUNyQjtBQUNBLElBQUksSUFBSTtBQUNSLE1BQU0sWUFBWSxHQUFHLFFBQVEsQ0FBQyxPQUFPLEVBQUUsVUFBVSxXQUFXLEVBQUU7QUFDOUQsUUFBUSxTQUFTLENBQUMsR0FBRyxDQUFDLFdBQVcsQ0FBQyxDQUFDO0FBQ25DLE9BQU8sQ0FBQyxDQUFDO0FBQ1QsS0FBSyxDQUFDLE9BQU8sR0FBRyxFQUFFO0FBQ2xCLE1BQU0sSUFBSSxDQUFDLElBQUksQ0FBQ0EsT0FBSyxDQUFDLEVBQUUsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDO0FBQ2hDLEtBQUs7QUFDTDtBQUNBLElBQUksSUFBSSxhQUFhLENBQUMsWUFBWSxDQUFDLEVBQUU7QUFDckM7QUFDQTtBQUNBLE1BQU0sT0FBTyxJQUFJLENBQUMsWUFBWSxDQUFDLFlBQVksRUFBRSxFQUFFLENBQUMsQ0FBQztBQUNqRCxLQUFLO0FBQ0w7QUFDQSxJQUFJLElBQUksS0FBSyxHQUFHO0FBQ2hCLE1BQU0sRUFBRSxFQUFFLEVBQUU7QUFDWixNQUFNLElBQUksRUFBRSxVQUFVLEtBQUssRUFBRTtBQUM3QixRQUFRLE9BQU8sU0FBUyxDQUFDLE9BQU8sQ0FBQyxVQUFVLFFBQVEsRUFBRTtBQUNyRCxVQUFVLE9BQU8sUUFBUSxDQUFDLEtBQUssQ0FBQyxDQUFDO0FBQ2pDLFNBQVMsQ0FBQyxDQUFDO0FBQ1gsT0FBTztBQUNQLE1BQU0sU0FBUyxFQUFFLFVBQVUsSUFBSSxFQUFFO0FBQ2pDLFFBQVEsU0FBUyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUM1QixRQUFRLE9BQU87QUFDZixVQUFVLFdBQVcsRUFBRSxZQUFZO0FBQ25DLFlBQVksU0FBUyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUNuQyxXQUFXO0FBQ1gsU0FBUyxDQUFDO0FBQ1YsT0FBTztBQUNQLE1BQU0sSUFBSSxFQUFFLFlBQVk7QUFDeEIsUUFBUSxRQUFRLEdBQUcsSUFBSSxDQUFDO0FBQ3hCO0FBQ0EsUUFBUSxJQUFJLFVBQVUsQ0FBQyxZQUFZLENBQUMsRUFBRTtBQUN0QyxVQUFVLFlBQVksRUFBRSxDQUFDO0FBQ3pCLFNBQVM7QUFDVCxPQUFPO0FBQ1AsTUFBTSxNQUFNLEVBQUUsWUFBWTtBQUMxQixRQUFRLE9BQU87QUFDZixVQUFVLEVBQUUsRUFBRSxFQUFFO0FBQ2hCLFNBQVMsQ0FBQztBQUNWLE9BQU87QUFDUCxLQUFLLENBQUM7QUFDTixJQUFJLElBQUksQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLEVBQUUsRUFBRSxLQUFLLENBQUMsQ0FBQztBQUNqQyxJQUFJLE9BQU8sS0FBSyxDQUFDO0FBQ2pCLEdBQUcsQ0FBQztBQUNKO0FBQ0EsRUFBRSxXQUFXLENBQUMsU0FBUyxDQUFDLGVBQWUsR0FBRyxVQUFVLE1BQU0sRUFBRSxFQUFFLEVBQUU7QUFDaEUsSUFBSSxJQUFJLEtBQUssR0FBRyxJQUFJLENBQUM7QUFDckI7QUFDQSxJQUFJLElBQUksWUFBWSxHQUFHLE1BQU0sQ0FBQyxTQUFTLENBQUMsVUFBVSxLQUFLLEVBQUU7QUFDekQsTUFBTSxLQUFLLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxLQUFLLEVBQUU7QUFDckMsUUFBUSxNQUFNLEVBQUUsRUFBRTtBQUNsQixPQUFPLENBQUMsQ0FBQyxDQUFDO0FBQ1YsS0FBSyxFQUFFLFVBQVUsR0FBRyxFQUFFO0FBQ3RCLE1BQU0sS0FBSyxDQUFDLFdBQVcsQ0FBQyxFQUFFLENBQUMsQ0FBQztBQUM1QjtBQUNBLE1BQU0sS0FBSyxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUNBLE9BQUssQ0FBQyxFQUFFLEVBQUUsR0FBRyxDQUFDLEVBQUU7QUFDOUMsUUFBUSxNQUFNLEVBQUUsRUFBRTtBQUNsQixPQUFPLENBQUMsQ0FBQyxDQUFDO0FBQ1YsS0FBSyxFQUFFLFlBQVk7QUFDbkIsTUFBTSxLQUFLLENBQUMsV0FBVyxDQUFDLEVBQUUsQ0FBQyxDQUFDO0FBQzVCO0FBQ0EsTUFBTSxLQUFLLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxVQUFVLENBQUMsRUFBRSxDQUFDLEVBQUU7QUFDOUMsUUFBUSxNQUFNLEVBQUUsRUFBRTtBQUNsQixPQUFPLENBQUMsQ0FBQyxDQUFDO0FBQ1YsS0FBSyxDQUFDLENBQUM7QUFDUCxJQUFJLElBQUksS0FBSyxHQUFHO0FBQ2hCLE1BQU0sRUFBRSxFQUFFLEVBQUU7QUFDWixNQUFNLElBQUksRUFBRSxZQUFZO0FBQ3hCLFFBQVEsT0FBTyxLQUFLLENBQUMsQ0FBQztBQUN0QixPQUFPO0FBQ1AsTUFBTSxTQUFTLEVBQUUsVUFBVSxJQUFJLEVBQUUsV0FBVyxFQUFFLFFBQVEsRUFBRTtBQUN4RCxRQUFRLE9BQU8sTUFBTSxDQUFDLFNBQVMsQ0FBQyxJQUFJLEVBQUUsV0FBVyxFQUFFLFFBQVEsQ0FBQyxDQUFDO0FBQzdELE9BQU87QUFDUCxNQUFNLElBQUksRUFBRSxZQUFZO0FBQ3hCLFFBQVEsT0FBTyxZQUFZLENBQUMsV0FBVyxFQUFFLENBQUM7QUFDMUMsT0FBTztBQUNQLE1BQU0sTUFBTSxFQUFFLFlBQVk7QUFDMUIsUUFBUSxPQUFPO0FBQ2YsVUFBVSxFQUFFLEVBQUUsRUFBRTtBQUNoQixTQUFTLENBQUM7QUFDVixPQUFPO0FBQ1AsS0FBSyxDQUFDO0FBQ04sSUFBSSxJQUFJLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxFQUFFLEVBQUUsS0FBSyxDQUFDLENBQUM7QUFDakMsSUFBSSxPQUFPLEtBQUssQ0FBQztBQUNqQixHQUFHLENBQUM7QUFDSjtBQUNBLEVBQUUsV0FBVyxDQUFDLFNBQVMsQ0FBQyxVQUFVLEdBQUcsVUFBVSxLQUFLLEVBQUU7QUFDdEQsSUFBSSxJQUFJLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsRUFBRSxFQUFFLEtBQUssQ0FBQyxDQUFDO0FBQ3ZDLElBQUksT0FBTyxLQUFLLENBQUM7QUFDakIsR0FBRyxDQUFDO0FBQ0o7QUFDQSxFQUFFLFdBQVcsQ0FBQyxTQUFTLENBQUMsYUFBYSxHQUFHLFVBQVUsUUFBUSxFQUFFO0FBQzVELElBQUksSUFBSSxjQUFjLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxPQUFPLElBQUksSUFBSSxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsVUFBVSxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLFVBQVUsQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLEdBQUcsU0FBUyxDQUFDO0FBQzlJO0FBQ0EsSUFBSSxJQUFJLENBQUMsY0FBYyxFQUFFO0FBQ3pCLE1BQU0sSUFBSSxDQUFDLGFBQWEsRUFBRTtBQUMxQixRQUFRLElBQUksQ0FBQyxLQUFLLEVBQUUsd0NBQXdDLEdBQUcsUUFBUSxDQUFDLElBQUksR0FBRyxHQUFHLENBQUMsQ0FBQztBQUNwRixPQUFPO0FBQ1A7QUFDQTtBQUNBLE1BQU0sT0FBTztBQUNiLEtBQUs7QUFDTDtBQUNBO0FBQ0EsSUFBSSxJQUFJLE9BQU8sR0FBRyxjQUFjLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLEVBQUUsUUFBUSxDQUFDLENBQUM7QUFDL0QsSUFBSSxJQUFJLENBQUMsV0FBVyxDQUFDLFFBQVEsQ0FBQyxFQUFFLEVBQUUsT0FBTyxDQUFDLENBQUM7QUFDM0MsR0FBRyxDQUFDO0FBQ0o7QUFDQSxFQUFFLFdBQVcsQ0FBQyxTQUFTLENBQUMsV0FBVyxHQUFHLFVBQVUsRUFBRSxFQUFFLE9BQU8sRUFBRTtBQUM3RCxJQUFJLElBQUksQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLEVBQUUsRUFBRTtBQUMxQixNQUFNLEVBQUUsRUFBRSxFQUFFO0FBQ1osTUFBTSxJQUFJLEVBQUUsWUFBWTtBQUN4QixRQUFRLE9BQU8sS0FBSyxDQUFDLENBQUM7QUFDdEIsT0FBTztBQUNQLE1BQU0sU0FBUyxFQUFFLFlBQVk7QUFDN0IsUUFBUSxPQUFPO0FBQ2YsVUFBVSxXQUFXLEVBQUUsWUFBWTtBQUNuQyxZQUFZLE9BQU8sS0FBSyxDQUFDLENBQUM7QUFDMUIsV0FBVztBQUNYLFNBQVMsQ0FBQztBQUNWLE9BQU87QUFDUCxNQUFNLElBQUksRUFBRSxPQUFPLElBQUksU0FBUztBQUNoQyxNQUFNLE1BQU0sRUFBRSxZQUFZO0FBQzFCLFFBQVEsT0FBTztBQUNmLFVBQVUsRUFBRSxFQUFFLEVBQUU7QUFDaEIsU0FBUyxDQUFDO0FBQ1YsT0FBTztBQUNQLEtBQUssQ0FBQyxDQUFDO0FBQ1AsR0FBRyxDQUFDO0FBQ0o7QUFDQSxFQUFFLFdBQVcsQ0FBQyxTQUFTLENBQUMsU0FBUyxHQUFHLFlBQVk7QUFDaEQsSUFBSSxJQUFJLE1BQU0sR0FBRyxTQUFTLEVBQUUsQ0FBQztBQUM3QjtBQUNBLElBQUksSUFBSSxJQUFJLENBQUMsT0FBTyxDQUFDLFFBQVEsSUFBSSxNQUFNLEVBQUU7QUFDekMsTUFBTSxJQUFJLE1BQU0sQ0FBQyw0QkFBNEIsRUFBRTtBQUMvQyxRQUFRLElBQUksZUFBZSxHQUFHLE9BQU8sSUFBSSxDQUFDLE9BQU8sQ0FBQyxRQUFRLEtBQUssUUFBUSxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsUUFBUSxHQUFHLFNBQVMsQ0FBQztBQUM1RyxRQUFRLElBQUksQ0FBQyxRQUFRLEdBQUcsTUFBTSxDQUFDLDRCQUE0QixDQUFDLE9BQU8sQ0FBQyxRQUFRLENBQUMsUUFBUSxDQUFDO0FBQ3RGLFVBQVUsSUFBSSxFQUFFLElBQUksQ0FBQyxFQUFFO0FBQ3ZCLFVBQVUsU0FBUyxFQUFFLElBQUk7QUFDekIsVUFBVSxjQUFjLEVBQUUsVUFBVSxLQUFLLEVBQUU7QUFDM0MsWUFBWSxPQUFPO0FBQ25CLGNBQWMsS0FBSyxFQUFFLEtBQUssQ0FBQyxLQUFLO0FBQ2hDLGNBQWMsT0FBTyxFQUFFLEtBQUssQ0FBQyxPQUFPO0FBQ3BDLGNBQWMsT0FBTyxFQUFFLEtBQUssQ0FBQyxPQUFPO0FBQ3BDLGFBQWEsQ0FBQztBQUNkLFdBQVc7QUFDWCxTQUFTLEVBQUUsZUFBZSxDQUFDLEVBQUU7QUFDN0IsVUFBVSxRQUFRLEVBQUUsUUFBUSxDQUFDO0FBQzdCLFlBQVksSUFBSSxFQUFFLEtBQUs7QUFDdkIsWUFBWSxJQUFJLEVBQUUsS0FBSztBQUN2QixXQUFXLEVBQUUsZUFBZSxHQUFHLGVBQWUsQ0FBQyxRQUFRLEdBQUcsU0FBUyxDQUFDO0FBQ3BFLFNBQVMsQ0FBQyxFQUFFLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQztBQUMxQixRQUFRLElBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQztBQUN2QyxPQUFPO0FBQ1A7QUFDQTtBQUNBLE1BQU0sZUFBZSxDQUFDLElBQUksQ0FBQyxDQUFDO0FBQzVCLEtBQUs7QUFDTCxHQUFHLENBQUM7QUFDSjtBQUNBLEVBQUUsV0FBVyxDQUFDLFNBQVMsQ0FBQyxNQUFNLEdBQUcsWUFBWTtBQUM3QyxJQUFJLE9BQU87QUFDWCxNQUFNLEVBQUUsRUFBRSxJQUFJLENBQUMsRUFBRTtBQUNqQixLQUFLLENBQUM7QUFDTixHQUFHLENBQUM7QUFDSjtBQUNBLEVBQUUsV0FBVyxDQUFDLFNBQVMsQ0FBQyxnQkFBZ0IsQ0FBQyxHQUFHLFlBQVk7QUFDeEQsSUFBSSxPQUFPLElBQUksQ0FBQztBQUNoQixHQUFHLENBQUM7QUFDSjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsRUFBRSxXQUFXLENBQUMsY0FBYyxnQkFBZ0IsVUFBVSxNQUFNLEVBQUU7QUFDOUQsSUFBSSxPQUFPO0FBQ1gsTUFBTSxPQUFPLEVBQUUsSUFBSTtBQUNuQixNQUFNLFdBQVcsRUFBRSxJQUFJO0FBQ3ZCLE1BQU0sS0FBSyxFQUFFO0FBQ2IsUUFBUSxVQUFVLEVBQUUsVUFBVSxFQUFFLEVBQUUsRUFBRSxFQUFFO0FBQ3RDLFVBQVUsT0FBTyxVQUFVLENBQUMsRUFBRSxFQUFFLEVBQUUsQ0FBQyxDQUFDO0FBQ3BDLFNBQVM7QUFDVCxRQUFRLFlBQVksRUFBRSxVQUFVLEVBQUUsRUFBRTtBQUNwQyxVQUFVLE9BQU8sWUFBWSxDQUFDLEVBQUUsQ0FBQyxDQUFDO0FBQ2xDLFNBQVM7QUFDVCxPQUFPO0FBQ1AsTUFBTSxNQUFNLEVBQUUsTUFBTSxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQztBQUM5QyxNQUFNLFFBQVEsRUFBRSxLQUFLO0FBQ3JCLEtBQUssQ0FBQztBQUNOLEdBQUcsQ0FBQyxPQUFPLElBQUksS0FBSyxXQUFXLEdBQUcsSUFBSSxHQUFHLE1BQU0sQ0FBQyxDQUFDO0FBQ2pEO0FBQ0EsRUFBRSxXQUFXLENBQUMsU0FBUyxHQUFHLFNBQVMsQ0FBQztBQUNwQyxFQUFFLE9BQU8sV0FBVyxDQUFDO0FBQ3JCLENBQUMsR0FBRztBQUNKO0FBQ0EsSUFBSSxtQkFBbUIsR0FBRyxVQUFVLGFBQWEsRUFBRTtBQUNuRCxFQUFFLElBQUksUUFBUSxDQUFDLGFBQWEsQ0FBQyxFQUFFO0FBQy9CLElBQUksT0FBTyxRQUFRLENBQUMsUUFBUSxDQUFDLEVBQUUsRUFBRSxxQkFBcUIsQ0FBQyxFQUFFO0FBQ3pELE1BQU0sSUFBSSxFQUFFLGFBQWE7QUFDekIsS0FBSyxDQUFDLENBQUM7QUFDUCxHQUFHO0FBQ0g7QUFDQSxFQUFFLE9BQU8sUUFBUSxDQUFDLFFBQVEsQ0FBQyxRQUFRLENBQUMsRUFBRSxFQUFFLHFCQUFxQixDQUFDLEVBQUU7QUFDaEUsSUFBSSxJQUFJLEVBQUUsUUFBUSxFQUFFO0FBQ3BCLEdBQUcsQ0FBQyxFQUFFLGFBQWEsQ0FBQyxDQUFDO0FBQ3JCLENBQUMsQ0FBQztBQUNGO0FBQ0EsU0FBUyxLQUFLLENBQUMsTUFBTSxFQUFFLGFBQWEsRUFBRTtBQUN0QyxFQUFFLElBQUksZUFBZSxHQUFHLG1CQUFtQixDQUFDLGFBQWEsQ0FBQyxDQUFDO0FBQzNELEVBQUUsT0FBTyxPQUFPLENBQUMsVUFBVSxPQUFPLEVBQUU7QUFDcEMsSUFBSSxJQUFJLENBQUMsYUFBYSxFQUFFO0FBQ3hCLE1BQU0sSUFBSSxZQUFZLEdBQUcsU0FBUyxDQUFDLE1BQU0sQ0FBQyxJQUFJLFVBQVUsQ0FBQyxNQUFNLENBQUMsQ0FBQztBQUNqRSxNQUFNLElBQUksQ0FBQyxDQUFDLENBQUMsT0FBTyxJQUFJLFlBQVksRUFBRSxxQ0FBcUMsSUFBSSxTQUFTLENBQUMsTUFBTSxDQUFDLEdBQUcsTUFBTSxDQUFDLEVBQUUsR0FBRyxXQUFXLENBQUMsR0FBRyxxREFBcUQsQ0FBQyxDQUFDO0FBQ3JMLEtBQUs7QUFDTDtBQUNBLElBQUksSUFBSSxPQUFPLEVBQUU7QUFDakIsTUFBTSxPQUFPLE9BQU8sQ0FBQyxLQUFLLENBQUMsTUFBTSxFQUFFLGVBQWUsQ0FBQyxJQUFJLEVBQUUsZUFBZSxDQUFDLENBQUM7QUFDMUUsS0FBSyxNQUFNO0FBQ1gsTUFBTSxPQUFPLG1CQUFtQixDQUFDLE1BQU0sRUFBRSxlQUFlLENBQUMsSUFBSSxDQUFDLENBQUM7QUFDL0QsS0FBSztBQUNMLEdBQUcsQ0FBQyxDQUFDO0FBQ0wsQ0FBQztBQUNEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxTQUFTLFNBQVMsQ0FBQyxPQUFPLEVBQUUsT0FBTyxFQUFFO0FBQ3JDLEVBQUUsSUFBSSxXQUFXLEdBQUcsSUFBSSxXQUFXLENBQUMsT0FBTyxFQUFFLE9BQU8sQ0FBQyxDQUFDO0FBQ3RELEVBQUUsT0FBTyxXQUFXLENBQUM7QUFDckI7O0FDdHhDQSxTQUFTLFVBQVUsQ0FBQyxLQUFLLEVBQUUsUUFBUSxFQUFFLFlBQVksRUFBRTtBQUNuRCxFQUFFLElBQUksR0FBRyxFQUFFLEVBQUUsQ0FBQztBQUNkO0FBQ0EsRUFBRSxJQUFJLGFBQWEsR0FBRyxLQUFLLENBQUMsSUFBSSxDQUFDLEtBQUssRUFBRSxLQUFLLFlBQVksS0FBSyxHQUFHLEtBQUssQ0FBQyxPQUFPLEdBQUcsU0FBUyxDQUFDLENBQUM7QUFDNUY7QUFDQSxFQUFFLElBQUk7QUFDTixJQUFJLEtBQUssSUFBSSxVQUFVLEdBQUcsUUFBUSxDQUFDLFFBQVEsQ0FBQyxFQUFFLFlBQVksR0FBRyxVQUFVLENBQUMsSUFBSSxFQUFFLEVBQUUsQ0FBQyxZQUFZLENBQUMsSUFBSSxFQUFFLFlBQVksR0FBRyxVQUFVLENBQUMsSUFBSSxFQUFFLEVBQUU7QUFDdEksTUFBTSxJQUFJLEVBQUUsR0FBRyxNQUFNLENBQUMsWUFBWSxDQUFDLEtBQUssRUFBRSxDQUFDLENBQUM7QUFDNUMsVUFBVSxVQUFVLEdBQUcsRUFBRSxDQUFDLENBQUMsQ0FBQztBQUM1QixVQUFVLFFBQVEsR0FBRyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDM0I7QUFDQSxNQUFNLElBQUksYUFBYSxDQUFDLE9BQU8sQ0FBQyxVQUFVLENBQUMsRUFBRTtBQUM3QyxRQUFRLE9BQU8sUUFBUSxDQUFDLGFBQWEsQ0FBQyxDQUFDO0FBQ3ZDLE9BQU87QUFDUCxLQUFLO0FBQ0wsR0FBRyxDQUFDLE9BQU8sS0FBSyxFQUFFO0FBQ2xCLElBQUksR0FBRyxHQUFHO0FBQ1YsTUFBTSxLQUFLLEVBQUUsS0FBSztBQUNsQixLQUFLLENBQUM7QUFDTixHQUFHLFNBQVM7QUFDWixJQUFJLElBQUk7QUFDUixNQUFNLElBQUksWUFBWSxJQUFJLENBQUMsWUFBWSxDQUFDLElBQUksS0FBSyxFQUFFLEdBQUcsVUFBVSxDQUFDLE1BQU0sQ0FBQyxFQUFFLEVBQUUsQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUM7QUFDOUYsS0FBSyxTQUFTO0FBQ2QsTUFBTSxJQUFJLEdBQUcsRUFBRSxNQUFNLEdBQUcsQ0FBQyxLQUFLLENBQUM7QUFDL0IsS0FBSztBQUNMLEdBQUc7QUFDSDtBQUNBLEVBQUUsT0FBTyxZQUFZLENBQUMsYUFBYSxDQUFDLENBQUM7QUFDckM7O0FDckJHLElBQUMsT0FBTyxHQUFHO0FBQ2QsRUFBRSxLQUFLLEVBQUViLE9BQUs7QUFDZCxFQUFFLElBQUksRUFBRUMsTUFBSTtBQUNaLEVBQUUsVUFBVSxFQUFFLFVBQVU7QUFDeEIsRUFBRSxVQUFVLEVBQUUsVUFBVTtBQUN4QixFQUFFLEdBQUcsRUFBRUcsS0FBRztBQUNWLEVBQUUsTUFBTSxFQUFFRSxRQUFNO0FBQ2hCLEVBQUUsS0FBSyxFQUFFRSxPQUFLO0FBQ2QsRUFBRSxJQUFJLEVBQUVDLE1BQUk7QUFDWixFQUFFLE1BQU0sRUFBRUMsUUFBTTtBQUNoQixFQUFFLEtBQUssRUFBRUUsT0FBSztBQUNkLEVBQUUsSUFBSSxFQUFFLElBQUk7QUFDWixFQUFFLE9BQU8sRUFBRSxPQUFPO0FBQ2xCLEVBQUUsU0FBUyxFQUFFLFNBQVM7QUFDdEIsRUFBRSxRQUFRLEVBQUUsUUFBUTtBQUNwQixFQUFFLE1BQU0sRUFBRUksUUFBTTtBQUNoQixFQUFFLElBQUksRUFBRUYsTUFBSTtBQUNaOzs7Ozs7OzsifQ==
