(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
// shim for using process in browser
var process = module.exports = {};

// cached from whatever global is present so that test runners that stub it
// don't break things.  But we need to wrap it in a try catch in case it is
// wrapped in strict mode code which doesn't define any globals.  It's inside a
// function because try/catches deoptimize in certain engines.

var cachedSetTimeout;
var cachedClearTimeout;

function defaultSetTimout() {
    throw new Error('setTimeout has not been defined');
}
function defaultClearTimeout () {
    throw new Error('clearTimeout has not been defined');
}
(function () {
    try {
        if (typeof setTimeout === 'function') {
            cachedSetTimeout = setTimeout;
        } else {
            cachedSetTimeout = defaultSetTimout;
        }
    } catch (e) {
        cachedSetTimeout = defaultSetTimout;
    }
    try {
        if (typeof clearTimeout === 'function') {
            cachedClearTimeout = clearTimeout;
        } else {
            cachedClearTimeout = defaultClearTimeout;
        }
    } catch (e) {
        cachedClearTimeout = defaultClearTimeout;
    }
} ())
function runTimeout(fun) {
    if (cachedSetTimeout === setTimeout) {
        //normal enviroments in sane situations
        return setTimeout(fun, 0);
    }
    // if setTimeout wasn't available but was latter defined
    if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
        cachedSetTimeout = setTimeout;
        return setTimeout(fun, 0);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedSetTimeout(fun, 0);
    } catch(e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
            return cachedSetTimeout.call(null, fun, 0);
        } catch(e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
            return cachedSetTimeout.call(this, fun, 0);
        }
    }


}
function runClearTimeout(marker) {
    if (cachedClearTimeout === clearTimeout) {
        //normal enviroments in sane situations
        return clearTimeout(marker);
    }
    // if clearTimeout wasn't available but was latter defined
    if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
        cachedClearTimeout = clearTimeout;
        return clearTimeout(marker);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedClearTimeout(marker);
    } catch (e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
            return cachedClearTimeout.call(null, marker);
        } catch (e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
            // Some versions of I.E. have different rules for clearTimeout vs setTimeout
            return cachedClearTimeout.call(this, marker);
        }
    }



}
var queue = [];
var draining = false;
var currentQueue;
var queueIndex = -1;

function cleanUpNextTick() {
    if (!draining || !currentQueue) {
        return;
    }
    draining = false;
    if (currentQueue.length) {
        queue = currentQueue.concat(queue);
    } else {
        queueIndex = -1;
    }
    if (queue.length) {
        drainQueue();
    }
}

function drainQueue() {
    if (draining) {
        return;
    }
    var timeout = runTimeout(cleanUpNextTick);
    draining = true;

    var len = queue.length;
    while(len) {
        currentQueue = queue;
        queue = [];
        while (++queueIndex < len) {
            if (currentQueue) {
                currentQueue[queueIndex].run();
            }
        }
        queueIndex = -1;
        len = queue.length;
    }
    currentQueue = null;
    draining = false;
    runClearTimeout(timeout);
}

process.nextTick = function (fun) {
    var args = new Array(arguments.length - 1);
    if (arguments.length > 1) {
        for (var i = 1; i < arguments.length; i++) {
            args[i - 1] = arguments[i];
        }
    }
    queue.push(new Item(fun, args));
    if (queue.length === 1 && !draining) {
        runTimeout(drainQueue);
    }
};

// v8 likes predictible objects
function Item(fun, array) {
    this.fun = fun;
    this.array = array;
}
Item.prototype.run = function () {
    this.fun.apply(null, this.array);
};
process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues
process.versions = {};

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;
process.prependListener = noop;
process.prependOnceListener = noop;

process.listeners = function (name) { return [] }

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };

},{}],2:[function(require,module,exports){
(function (process,global){
/*!
 * @overview RSVP - a tiny implementation of Promises/A+.
 * @copyright Copyright (c) 2016 Yehuda Katz, Tom Dale, Stefan Penner and contributors
 * @license   Licensed under MIT license
 *            See https://raw.githubusercontent.com/tildeio/rsvp.js/master/LICENSE
 * @version   3.6.2
 */

(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
	typeof define === 'function' && define.amd ? define(['exports'], factory) :
	(factory((global.RSVP = global.RSVP || {})));
}(this, (function (exports) { 'use strict';

function indexOf(callbacks, callback) {
  for (var i = 0, l = callbacks.length; i < l; i++) {
    if (callbacks[i] === callback) {
      return i;
    }
  }

  return -1;
}

function callbacksFor(object) {
  var callbacks = object._promiseCallbacks;

  if (!callbacks) {
    callbacks = object._promiseCallbacks = {};
  }

  return callbacks;
}

/**
  @class RSVP.EventTarget
*/
var EventTarget = {

  /**
    `RSVP.EventTarget.mixin` extends an object with EventTarget methods. For
    Example:
     ```javascript
    let object = {};
     RSVP.EventTarget.mixin(object);
     object.on('finished', function(event) {
      // handle event
    });
     object.trigger('finished', { detail: value });
    ```
     `EventTarget.mixin` also works with prototypes:
     ```javascript
    let Person = function() {};
    RSVP.EventTarget.mixin(Person.prototype);
     let yehuda = new Person();
    let tom = new Person();
     yehuda.on('poke', function(event) {
      console.log('Yehuda says OW');
    });
     tom.on('poke', function(event) {
      console.log('Tom says OW');
    });
     yehuda.trigger('poke');
    tom.trigger('poke');
    ```
     @method mixin
    @for RSVP.EventTarget
    @private
    @param {Object} object object to extend with EventTarget methods
  */
  mixin: function (object) {
    object['on'] = this['on'];
    object['off'] = this['off'];
    object['trigger'] = this['trigger'];
    object._promiseCallbacks = undefined;
    return object;
  },


  /**
    Registers a callback to be executed when `eventName` is triggered
     ```javascript
    object.on('event', function(eventInfo){
      // handle the event
    });
     object.trigger('event');
    ```
     @method on
    @for RSVP.EventTarget
    @private
    @param {String} eventName name of the event to listen for
    @param {Function} callback function to be called when the event is triggered.
  */
  on: function (eventName, callback) {
    if (typeof callback !== 'function') {
      throw new TypeError('Callback must be a function');
    }

    var allCallbacks = callbacksFor(this),
        callbacks = void 0;

    callbacks = allCallbacks[eventName];

    if (!callbacks) {
      callbacks = allCallbacks[eventName] = [];
    }

    if (indexOf(callbacks, callback) === -1) {
      callbacks.push(callback);
    }
  },


  /**
    You can use `off` to stop firing a particular callback for an event:
     ```javascript
    function doStuff() { // do stuff! }
    object.on('stuff', doStuff);
     object.trigger('stuff'); // doStuff will be called
     // Unregister ONLY the doStuff callback
    object.off('stuff', doStuff);
    object.trigger('stuff'); // doStuff will NOT be called
    ```
     If you don't pass a `callback` argument to `off`, ALL callbacks for the
    event will not be executed when the event fires. For example:
     ```javascript
    let callback1 = function(){};
    let callback2 = function(){};
     object.on('stuff', callback1);
    object.on('stuff', callback2);
     object.trigger('stuff'); // callback1 and callback2 will be executed.
     object.off('stuff');
    object.trigger('stuff'); // callback1 and callback2 will not be executed!
    ```
     @method off
    @for RSVP.EventTarget
    @private
    @param {String} eventName event to stop listening to
    @param {Function} callback optional argument. If given, only the function
    given will be removed from the event's callback queue. If no `callback`
    argument is given, all callbacks will be removed from the event's callback
    queue.
  */
  off: function (eventName, callback) {
    var allCallbacks = callbacksFor(this),
        callbacks = void 0,
        index = void 0;

    if (!callback) {
      allCallbacks[eventName] = [];
      return;
    }

    callbacks = allCallbacks[eventName];

    index = indexOf(callbacks, callback);

    if (index !== -1) {
      callbacks.splice(index, 1);
    }
  },


  /**
    Use `trigger` to fire custom events. For example:
     ```javascript
    object.on('foo', function(){
      console.log('foo event happened!');
    });
    object.trigger('foo');
    // 'foo event happened!' logged to the console
    ```
     You can also pass a value as a second argument to `trigger` that will be
    passed as an argument to all event listeners for the event:
     ```javascript
    object.on('foo', function(value){
      console.log(value.name);
    });
     object.trigger('foo', { name: 'bar' });
    // 'bar' logged to the console
    ```
     @method trigger
    @for RSVP.EventTarget
    @private
    @param {String} eventName name of the event to be triggered
    @param {*} options optional value to be passed to any event handlers for
    the given `eventName`
  */
  trigger: function (eventName, options, label) {
    var allCallbacks = callbacksFor(this),
        callbacks = void 0,
        callback = void 0;

    if (callbacks = allCallbacks[eventName]) {
      // Don't cache the callbacks.length since it may grow
      for (var i = 0; i < callbacks.length; i++) {
        callback = callbacks[i];

        callback(options, label);
      }
    }
  }
};

var config = {
  instrument: false
};

EventTarget['mixin'](config);

function configure(name, value) {
  if (arguments.length === 2) {
    config[name] = value;
  } else {
    return config[name];
  }
}

function objectOrFunction(x) {
  var type = typeof x;
  return x !== null && (type === 'object' || type === 'function');
}

function isFunction(x) {
  return typeof x === 'function';
}

function isObject(x) {
  return x !== null && typeof x === 'object';
}

function isMaybeThenable(x) {
  return x !== null && typeof x === 'object';
}

var _isArray = void 0;
if (Array.isArray) {
  _isArray = Array.isArray;
} else {
  _isArray = function (x) {
    return Object.prototype.toString.call(x) === '[object Array]';
  };
}

var isArray = _isArray;

// Date.now is not available in browsers < IE9
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/now#Compatibility
var now = Date.now || function () {
  return new Date().getTime();
};

var queue = [];

function scheduleFlush() {
  setTimeout(function () {
    for (var i = 0; i < queue.length; i++) {
      var entry = queue[i];

      var payload = entry.payload;

      payload.guid = payload.key + payload.id;
      payload.childGuid = payload.key + payload.childId;
      if (payload.error) {
        payload.stack = payload.error.stack;
      }

      config['trigger'](entry.name, entry.payload);
    }
    queue.length = 0;
  }, 50);
}

function instrument(eventName, promise, child) {
  if (1 === queue.push({
    name: eventName,
    payload: {
      key: promise._guidKey,
      id: promise._id,
      eventName: eventName,
      detail: promise._result,
      childId: child && child._id,
      label: promise._label,
      timeStamp: now(),
      error: config["instrument-with-stack"] ? new Error(promise._label) : null
    } })) {
    scheduleFlush();
  }
}

/**
  `RSVP.Promise.resolve` returns a promise that will become resolved with the
  passed `value`. It is shorthand for the following:

  ```javascript
  let promise = new RSVP.Promise(function(resolve, reject){
    resolve(1);
  });

  promise.then(function(value){
    // value === 1
  });
  ```

  Instead of writing the above, your code now simply becomes the following:

  ```javascript
  let promise = RSVP.Promise.resolve(1);

  promise.then(function(value){
    // value === 1
  });
  ```

  @method resolve
  @static
  @param {*} object value that the returned promise will be resolved with
  @param {String} label optional string for identifying the returned promise.
  Useful for tooling.
  @return {Promise} a promise that will become fulfilled with the given
  `value`
*/
function resolve$1(object, label) {
  /*jshint validthis:true */
  var Constructor = this;

  if (object && typeof object === 'object' && object.constructor === Constructor) {
    return object;
  }

  var promise = new Constructor(noop, label);
  resolve(promise, object);
  return promise;
}

function withOwnPromise() {
  return new TypeError('A promises callback cannot return that same promise.');
}

function noop() {}

var PENDING = void 0;
var FULFILLED = 1;
var REJECTED = 2;

var GET_THEN_ERROR = new ErrorObject();

function getThen(promise) {
  try {
    return promise.then;
  } catch (error) {
    GET_THEN_ERROR.error = error;
    return GET_THEN_ERROR;
  }
}

function tryThen(then$$1, value, fulfillmentHandler, rejectionHandler) {
  try {
    then$$1.call(value, fulfillmentHandler, rejectionHandler);
  } catch (e) {
    return e;
  }
}

function handleForeignThenable(promise, thenable, then$$1) {
  config.async(function (promise) {
    var sealed = false;
    var error = tryThen(then$$1, thenable, function (value) {
      if (sealed) {
        return;
      }
      sealed = true;
      if (thenable !== value) {
        resolve(promise, value, undefined);
      } else {
        fulfill(promise, value);
      }
    }, function (reason) {
      if (sealed) {
        return;
      }
      sealed = true;

      reject(promise, reason);
    }, 'Settle: ' + (promise._label || ' unknown promise'));

    if (!sealed && error) {
      sealed = true;
      reject(promise, error);
    }
  }, promise);
}

function handleOwnThenable(promise, thenable) {
  if (thenable._state === FULFILLED) {
    fulfill(promise, thenable._result);
  } else if (thenable._state === REJECTED) {
    thenable._onError = null;
    reject(promise, thenable._result);
  } else {
    subscribe(thenable, undefined, function (value) {
      if (thenable !== value) {
        resolve(promise, value, undefined);
      } else {
        fulfill(promise, value);
      }
    }, function (reason) {
      return reject(promise, reason);
    });
  }
}

function handleMaybeThenable(promise, maybeThenable, then$$1) {
  var isOwnThenable = maybeThenable.constructor === promise.constructor && then$$1 === then && promise.constructor.resolve === resolve$1;

  if (isOwnThenable) {
    handleOwnThenable(promise, maybeThenable);
  } else if (then$$1 === GET_THEN_ERROR) {
    reject(promise, GET_THEN_ERROR.error);
    GET_THEN_ERROR.error = null;
  } else if (isFunction(then$$1)) {
    handleForeignThenable(promise, maybeThenable, then$$1);
  } else {
    fulfill(promise, maybeThenable);
  }
}

function resolve(promise, value) {
  if (promise === value) {
    fulfill(promise, value);
  } else if (objectOrFunction(value)) {
    handleMaybeThenable(promise, value, getThen(value));
  } else {
    fulfill(promise, value);
  }
}

function publishRejection(promise) {
  if (promise._onError) {
    promise._onError(promise._result);
  }

  publish(promise);
}

function fulfill(promise, value) {
  if (promise._state !== PENDING) {
    return;
  }

  promise._result = value;
  promise._state = FULFILLED;

  if (promise._subscribers.length === 0) {
    if (config.instrument) {
      instrument('fulfilled', promise);
    }
  } else {
    config.async(publish, promise);
  }
}

function reject(promise, reason) {
  if (promise._state !== PENDING) {
    return;
  }
  promise._state = REJECTED;
  promise._result = reason;
  config.async(publishRejection, promise);
}

function subscribe(parent, child, onFulfillment, onRejection) {
  var subscribers = parent._subscribers;
  var length = subscribers.length;

  parent._onError = null;

  subscribers[length] = child;
  subscribers[length + FULFILLED] = onFulfillment;
  subscribers[length + REJECTED] = onRejection;

  if (length === 0 && parent._state) {
    config.async(publish, parent);
  }
}

function publish(promise) {
  var subscribers = promise._subscribers;
  var settled = promise._state;

  if (config.instrument) {
    instrument(settled === FULFILLED ? 'fulfilled' : 'rejected', promise);
  }

  if (subscribers.length === 0) {
    return;
  }

  var child = void 0,
      callback = void 0,
      result = promise._result;

  for (var i = 0; i < subscribers.length; i += 3) {
    child = subscribers[i];
    callback = subscribers[i + settled];

    if (child) {
      invokeCallback(settled, child, callback, result);
    } else {
      callback(result);
    }
  }

  promise._subscribers.length = 0;
}

function ErrorObject() {
  this.error = null;
}

var TRY_CATCH_ERROR = new ErrorObject();

function tryCatch(callback, result) {
  try {
    return callback(result);
  } catch (e) {
    TRY_CATCH_ERROR.error = e;
    return TRY_CATCH_ERROR;
  }
}

function invokeCallback(state, promise, callback, result) {
  var hasCallback = isFunction(callback);
  var value = void 0,
      error = void 0;

  if (hasCallback) {
    value = tryCatch(callback, result);

    if (value === TRY_CATCH_ERROR) {
      error = value.error;
      value.error = null; // release
    } else if (value === promise) {
      reject(promise, withOwnPromise());
      return;
    }
  } else {
    value = result;
  }

  if (promise._state !== PENDING) {
    // noop
  } else if (hasCallback && error === undefined) {
    resolve(promise, value);
  } else if (error !== undefined) {
    reject(promise, error);
  } else if (state === FULFILLED) {
    fulfill(promise, value);
  } else if (state === REJECTED) {
    reject(promise, value);
  }
}

function initializePromise(promise, resolver) {
  var resolved = false;
  try {
    resolver(function (value) {
      if (resolved) {
        return;
      }
      resolved = true;
      resolve(promise, value);
    }, function (reason) {
      if (resolved) {
        return;
      }
      resolved = true;
      reject(promise, reason);
    });
  } catch (e) {
    reject(promise, e);
  }
}

function then(onFulfillment, onRejection, label) {
  var parent = this;
  var state = parent._state;

  if (state === FULFILLED && !onFulfillment || state === REJECTED && !onRejection) {
    config.instrument && instrument('chained', parent, parent);
    return parent;
  }

  parent._onError = null;

  var child = new parent.constructor(noop, label);
  var result = parent._result;

  config.instrument && instrument('chained', parent, child);

  if (state === PENDING) {
    subscribe(parent, child, onFulfillment, onRejection);
  } else {
    var callback = state === FULFILLED ? onFulfillment : onRejection;
    config.async(function () {
      return invokeCallback(state, child, callback, result);
    });
  }

  return child;
}

var Enumerator = function () {
  function Enumerator(Constructor, input, abortOnReject, label) {
    this._instanceConstructor = Constructor;
    this.promise = new Constructor(noop, label);
    this._abortOnReject = abortOnReject;

    this._init.apply(this, arguments);
  }

  Enumerator.prototype._init = function _init(Constructor, input) {
    var len = input.length || 0;
    this.length = len;
    this._remaining = len;
    this._result = new Array(len);

    this._enumerate(input);
    if (this._remaining === 0) {
      fulfill(this.promise, this._result);
    }
  };

  Enumerator.prototype._enumerate = function _enumerate(input) {
    var length = this.length;
    var promise = this.promise;

    for (var i = 0; promise._state === PENDING && i < length; i++) {
      this._eachEntry(input[i], i);
    }
  };

  Enumerator.prototype._settleMaybeThenable = function _settleMaybeThenable(entry, i) {
    var c = this._instanceConstructor;
    var resolve$$1 = c.resolve;

    if (resolve$$1 === resolve$1) {
      var then$$1 = getThen(entry);

      if (then$$1 === then && entry._state !== PENDING) {
        entry._onError = null;
        this._settledAt(entry._state, i, entry._result);
      } else if (typeof then$$1 !== 'function') {
        this._remaining--;
        this._result[i] = this._makeResult(FULFILLED, i, entry);
      } else if (c === Promise) {
        var promise = new c(noop);
        handleMaybeThenable(promise, entry, then$$1);
        this._willSettleAt(promise, i);
      } else {
        this._willSettleAt(new c(function (resolve$$1) {
          return resolve$$1(entry);
        }), i);
      }
    } else {
      this._willSettleAt(resolve$$1(entry), i);
    }
  };

  Enumerator.prototype._eachEntry = function _eachEntry(entry, i) {
    if (isMaybeThenable(entry)) {
      this._settleMaybeThenable(entry, i);
    } else {
      this._remaining--;
      this._result[i] = this._makeResult(FULFILLED, i, entry);
    }
  };

  Enumerator.prototype._settledAt = function _settledAt(state, i, value) {
    var promise = this.promise;

    if (promise._state === PENDING) {
      if (this._abortOnReject && state === REJECTED) {
        reject(promise, value);
      } else {
        this._remaining--;
        this._result[i] = this._makeResult(state, i, value);
        if (this._remaining === 0) {
          fulfill(promise, this._result);
        }
      }
    }
  };

  Enumerator.prototype._makeResult = function _makeResult(state, i, value) {
    return value;
  };

  Enumerator.prototype._willSettleAt = function _willSettleAt(promise, i) {
    var enumerator = this;

    subscribe(promise, undefined, function (value) {
      return enumerator._settledAt(FULFILLED, i, value);
    }, function (reason) {
      return enumerator._settledAt(REJECTED, i, reason);
    });
  };

  return Enumerator;
}();

function makeSettledResult(state, position, value) {
  if (state === FULFILLED) {
    return {
      state: 'fulfilled',
      value: value
    };
  } else {
    return {
      state: 'rejected',
      reason: value
    };
  }
}

/**
  `RSVP.Promise.all` accepts an array of promises, and returns a new promise which
  is fulfilled with an array of fulfillment values for the passed promises, or
  rejected with the reason of the first passed promise to be rejected. It casts all
  elements of the passed iterable to promises as it runs this algorithm.

  Example:

  ```javascript
  let promise1 = RSVP.resolve(1);
  let promise2 = RSVP.resolve(2);
  let promise3 = RSVP.resolve(3);
  let promises = [ promise1, promise2, promise3 ];

  RSVP.Promise.all(promises).then(function(array){
    // The array here would be [ 1, 2, 3 ];
  });
  ```

  If any of the `promises` given to `RSVP.all` are rejected, the first promise
  that is rejected will be given as an argument to the returned promises's
  rejection handler. For example:

  Example:

  ```javascript
  let promise1 = RSVP.resolve(1);
  let promise2 = RSVP.reject(new Error("2"));
  let promise3 = RSVP.reject(new Error("3"));
  let promises = [ promise1, promise2, promise3 ];

  RSVP.Promise.all(promises).then(function(array){
    // Code here never runs because there are rejected promises!
  }, function(error) {
    // error.message === "2"
  });
  ```

  @method all
  @static
  @param {Array} entries array of promises
  @param {String} label optional string for labeling the promise.
  Useful for tooling.
  @return {Promise} promise that is fulfilled when all `promises` have been
  fulfilled, or rejected if any of them become rejected.
  @static
*/
function all(entries, label) {
  if (!isArray(entries)) {
    return this.reject(new TypeError("Promise.all must be called with an array"), label);
  }
  return new Enumerator(this, entries, true /* abort on reject */, label).promise;
}

/**
  `RSVP.Promise.race` returns a new promise which is settled in the same way as the
  first passed promise to settle.

  Example:

  ```javascript
  let promise1 = new RSVP.Promise(function(resolve, reject){
    setTimeout(function(){
      resolve('promise 1');
    }, 200);
  });

  let promise2 = new RSVP.Promise(function(resolve, reject){
    setTimeout(function(){
      resolve('promise 2');
    }, 100);
  });

  RSVP.Promise.race([promise1, promise2]).then(function(result){
    // result === 'promise 2' because it was resolved before promise1
    // was resolved.
  });
  ```

  `RSVP.Promise.race` is deterministic in that only the state of the first
  settled promise matters. For example, even if other promises given to the
  `promises` array argument are resolved, but the first settled promise has
  become rejected before the other promises became fulfilled, the returned
  promise will become rejected:

  ```javascript
  let promise1 = new RSVP.Promise(function(resolve, reject){
    setTimeout(function(){
      resolve('promise 1');
    }, 200);
  });

  let promise2 = new RSVP.Promise(function(resolve, reject){
    setTimeout(function(){
      reject(new Error('promise 2'));
    }, 100);
  });

  RSVP.Promise.race([promise1, promise2]).then(function(result){
    // Code here never runs
  }, function(reason){
    // reason.message === 'promise 2' because promise 2 became rejected before
    // promise 1 became fulfilled
  });
  ```

  An example real-world use case is implementing timeouts:

  ```javascript
  RSVP.Promise.race([ajax('foo.json'), timeout(5000)])
  ```

  @method race
  @static
  @param {Array} entries array of promises to observe
  @param {String} label optional string for describing the promise returned.
  Useful for tooling.
  @return {Promise} a promise which settles in the same way as the first passed
  promise to settle.
*/
function race(entries, label) {
  /*jshint validthis:true */
  var Constructor = this;

  var promise = new Constructor(noop, label);

  if (!isArray(entries)) {
    reject(promise, new TypeError('Promise.race must be called with an array'));
    return promise;
  }

  for (var i = 0; promise._state === PENDING && i < entries.length; i++) {
    subscribe(Constructor.resolve(entries[i]), undefined, function (value) {
      return resolve(promise, value);
    }, function (reason) {
      return reject(promise, reason);
    });
  }

  return promise;
}

/**
  `RSVP.Promise.reject` returns a promise rejected with the passed `reason`.
  It is shorthand for the following:

  ```javascript
  let promise = new RSVP.Promise(function(resolve, reject){
    reject(new Error('WHOOPS'));
  });

  promise.then(function(value){
    // Code here doesn't run because the promise is rejected!
  }, function(reason){
    // reason.message === 'WHOOPS'
  });
  ```

  Instead of writing the above, your code now simply becomes the following:

  ```javascript
  let promise = RSVP.Promise.reject(new Error('WHOOPS'));

  promise.then(function(value){
    // Code here doesn't run because the promise is rejected!
  }, function(reason){
    // reason.message === 'WHOOPS'
  });
  ```

  @method reject
  @static
  @param {*} reason value that the returned promise will be rejected with.
  @param {String} label optional string for identifying the returned promise.
  Useful for tooling.
  @return {Promise} a promise rejected with the given `reason`.
*/
function reject$1(reason, label) {
  /*jshint validthis:true */
  var Constructor = this;
  var promise = new Constructor(noop, label);
  reject(promise, reason);
  return promise;
}

var guidKey = 'rsvp_' + now() + '-';
var counter = 0;

function needsResolver() {
  throw new TypeError('You must pass a resolver function as the first argument to the promise constructor');
}

function needsNew() {
  throw new TypeError("Failed to construct 'Promise': Please use the 'new' operator, this object constructor cannot be called as a function.");
}

/**
  Promise objects represent the eventual result of an asynchronous operation. The
  primary way of interacting with a promise is through its `then` method, which
  registers callbacks to receive either a promise’s eventual value or the reason
  why the promise cannot be fulfilled.

  Terminology
  -----------

  - `promise` is an object or function with a `then` method whose behavior conforms to this specification.
  - `thenable` is an object or function that defines a `then` method.
  - `value` is any legal JavaScript value (including undefined, a thenable, or a promise).
  - `exception` is a value that is thrown using the throw statement.
  - `reason` is a value that indicates why a promise was rejected.
  - `settled` the final resting state of a promise, fulfilled or rejected.

  A promise can be in one of three states: pending, fulfilled, or rejected.

  Promises that are fulfilled have a fulfillment value and are in the fulfilled
  state.  Promises that are rejected have a rejection reason and are in the
  rejected state.  A fulfillment value is never a thenable.

  Promises can also be said to *resolve* a value.  If this value is also a
  promise, then the original promise's settled state will match the value's
  settled state.  So a promise that *resolves* a promise that rejects will
  itself reject, and a promise that *resolves* a promise that fulfills will
  itself fulfill.


  Basic Usage:
  ------------

  ```js
  let promise = new Promise(function(resolve, reject) {
    // on success
    resolve(value);

    // on failure
    reject(reason);
  });

  promise.then(function(value) {
    // on fulfillment
  }, function(reason) {
    // on rejection
  });
  ```

  Advanced Usage:
  ---------------

  Promises shine when abstracting away asynchronous interactions such as
  `XMLHttpRequest`s.

  ```js
  function getJSON(url) {
    return new Promise(function(resolve, reject){
      let xhr = new XMLHttpRequest();

      xhr.open('GET', url);
      xhr.onreadystatechange = handler;
      xhr.responseType = 'json';
      xhr.setRequestHeader('Accept', 'application/json');
      xhr.send();

      function handler() {
        if (this.readyState === this.DONE) {
          if (this.status === 200) {
            resolve(this.response);
          } else {
            reject(new Error('getJSON: `' + url + '` failed with status: [' + this.status + ']'));
          }
        }
      };
    });
  }

  getJSON('/posts.json').then(function(json) {
    // on fulfillment
  }, function(reason) {
    // on rejection
  });
  ```

  Unlike callbacks, promises are great composable primitives.

  ```js
  Promise.all([
    getJSON('/posts'),
    getJSON('/comments')
  ]).then(function(values){
    values[0] // => postsJSON
    values[1] // => commentsJSON

    return values;
  });
  ```

  @class RSVP.Promise
  @param {function} resolver
  @param {String} label optional string for labeling the promise.
  Useful for tooling.
  @constructor
*/

var Promise = function () {
  function Promise(resolver, label) {
    this._id = counter++;
    this._label = label;
    this._state = undefined;
    this._result = undefined;
    this._subscribers = [];

    config.instrument && instrument('created', this);

    if (noop !== resolver) {
      typeof resolver !== 'function' && needsResolver();
      this instanceof Promise ? initializePromise(this, resolver) : needsNew();
    }
  }

  Promise.prototype._onError = function _onError(reason) {
    var _this = this;

    config.after(function () {
      if (_this._onError) {
        config.trigger('error', reason, _this._label);
      }
    });
  };

  /**
    `catch` is simply sugar for `then(undefined, onRejection)` which makes it the same
    as the catch block of a try/catch statement.
  
    ```js
    function findAuthor(){
      throw new Error('couldn\'t find that author');
    }
  
    // synchronous
    try {
      findAuthor();
    } catch(reason) {
      // something went wrong
    }
  
    // async with promises
    findAuthor().catch(function(reason){
      // something went wrong
    });
    ```
  
    @method catch
    @param {Function} onRejection
    @param {String} label optional string for labeling the promise.
    Useful for tooling.
    @return {Promise}
  */


  Promise.prototype.catch = function _catch(onRejection, label) {
    return this.then(undefined, onRejection, label);
  };

  /**
    `finally` will be invoked regardless of the promise's fate just as native
    try/catch/finally behaves
  
    Synchronous example:
  
    ```js
    findAuthor() {
      if (Math.random() > 0.5) {
        throw new Error();
      }
      return new Author();
    }
  
    try {
      return findAuthor(); // succeed or fail
    } catch(error) {
      return findOtherAuthor();
    } finally {
      // always runs
      // doesn't affect the return value
    }
    ```
  
    Asynchronous example:
  
    ```js
    findAuthor().catch(function(reason){
      return findOtherAuthor();
    }).finally(function(){
      // author was either found, or not
    });
    ```
  
    @method finally
    @param {Function} callback
    @param {String} label optional string for labeling the promise.
    Useful for tooling.
    @return {Promise}
  */


  Promise.prototype.finally = function _finally(callback, label) {
    var promise = this;
    var constructor = promise.constructor;

    return promise.then(function (value) {
      return constructor.resolve(callback()).then(function () {
        return value;
      });
    }, function (reason) {
      return constructor.resolve(callback()).then(function () {
        throw reason;
      });
    }, label);
  };

  return Promise;
}();



Promise.cast = resolve$1; // deprecated
Promise.all = all;
Promise.race = race;
Promise.resolve = resolve$1;
Promise.reject = reject$1;

Promise.prototype._guidKey = guidKey;

/**
  The primary way of interacting with a promise is through its `then` method,
  which registers callbacks to receive either a promise's eventual value or the
  reason why the promise cannot be fulfilled.

  ```js
  findUser().then(function(user){
    // user is available
  }, function(reason){
    // user is unavailable, and you are given the reason why
  });
  ```

  Chaining
  --------

  The return value of `then` is itself a promise.  This second, 'downstream'
  promise is resolved with the return value of the first promise's fulfillment
  or rejection handler, or rejected if the handler throws an exception.

  ```js
  findUser().then(function (user) {
    return user.name;
  }, function (reason) {
    return 'default name';
  }).then(function (userName) {
    // If `findUser` fulfilled, `userName` will be the user's name, otherwise it
    // will be `'default name'`
  });

  findUser().then(function (user) {
    throw new Error('Found user, but still unhappy');
  }, function (reason) {
    throw new Error('`findUser` rejected and we\'re unhappy');
  }).then(function (value) {
    // never reached
  }, function (reason) {
    // if `findUser` fulfilled, `reason` will be 'Found user, but still unhappy'.
    // If `findUser` rejected, `reason` will be '`findUser` rejected and we\'re unhappy'.
  });
  ```
  If the downstream promise does not specify a rejection handler, rejection reasons will be propagated further downstream.

  ```js
  findUser().then(function (user) {
    throw new PedagogicalException('Upstream error');
  }).then(function (value) {
    // never reached
  }).then(function (value) {
    // never reached
  }, function (reason) {
    // The `PedgagocialException` is propagated all the way down to here
  });
  ```

  Assimilation
  ------------

  Sometimes the value you want to propagate to a downstream promise can only be
  retrieved asynchronously. This can be achieved by returning a promise in the
  fulfillment or rejection handler. The downstream promise will then be pending
  until the returned promise is settled. This is called *assimilation*.

  ```js
  findUser().then(function (user) {
    return findCommentsByAuthor(user);
  }).then(function (comments) {
    // The user's comments are now available
  });
  ```

  If the assimliated promise rejects, then the downstream promise will also reject.

  ```js
  findUser().then(function (user) {
    return findCommentsByAuthor(user);
  }).then(function (comments) {
    // If `findCommentsByAuthor` fulfills, we'll have the value here
  }, function (reason) {
    // If `findCommentsByAuthor` rejects, we'll have the reason here
  });
  ```

  Simple Example
  --------------

  Synchronous Example

  ```javascript
  let result;

  try {
    result = findResult();
    // success
  } catch(reason) {
    // failure
  }
  ```

  Errback Example

  ```js
  findResult(function(result, err){
    if (err) {
      // failure
    } else {
      // success
    }
  });
  ```

  Promise Example;

  ```javascript
  findResult().then(function(result){
    // success
  }, function(reason){
    // failure
  });
  ```

  Advanced Example
  --------------

  Synchronous Example

  ```javascript
  let author, books;

  try {
    author = findAuthor();
    books  = findBooksByAuthor(author);
    // success
  } catch(reason) {
    // failure
  }
  ```

  Errback Example

  ```js

  function foundBooks(books) {

  }

  function failure(reason) {

  }

  findAuthor(function(author, err){
    if (err) {
      failure(err);
      // failure
    } else {
      try {
        findBoooksByAuthor(author, function(books, err) {
          if (err) {
            failure(err);
          } else {
            try {
              foundBooks(books);
            } catch(reason) {
              failure(reason);
            }
          }
        });
      } catch(error) {
        failure(err);
      }
      // success
    }
  });
  ```

  Promise Example;

  ```javascript
  findAuthor().
    then(findBooksByAuthor).
    then(function(books){
      // found books
  }).catch(function(reason){
    // something went wrong
  });
  ```

  @method then
  @param {Function} onFulfillment
  @param {Function} onRejection
  @param {String} label optional string for labeling the promise.
  Useful for tooling.
  @return {Promise}
*/
Promise.prototype.then = then;

function Result() {
  this.value = undefined;
}

var ERROR = new Result();
var GET_THEN_ERROR$1 = new Result();

function getThen$1(obj) {
  try {
    return obj.then;
  } catch (error) {
    ERROR.value = error;
    return ERROR;
  }
}

function tryApply(f, s, a) {
  try {
    f.apply(s, a);
  } catch (error) {
    ERROR.value = error;
    return ERROR;
  }
}

function makeObject(_, argumentNames) {
  var obj = {};
  var length = _.length;
  var args = new Array(length);

  for (var x = 0; x < length; x++) {
    args[x] = _[x];
  }

  for (var i = 0; i < argumentNames.length; i++) {
    var name = argumentNames[i];
    obj[name] = args[i + 1];
  }

  return obj;
}

function arrayResult(_) {
  var length = _.length;
  var args = new Array(length - 1);

  for (var i = 1; i < length; i++) {
    args[i - 1] = _[i];
  }

  return args;
}

function wrapThenable(then, promise) {
  return {
    then: function (onFulFillment, onRejection) {
      return then.call(promise, onFulFillment, onRejection);
    }
  };
}

/**
  `RSVP.denodeify` takes a 'node-style' function and returns a function that
  will return an `RSVP.Promise`. You can use `denodeify` in Node.js or the
  browser when you'd prefer to use promises over using callbacks. For example,
  `denodeify` transforms the following:

  ```javascript
  let fs = require('fs');

  fs.readFile('myfile.txt', function(err, data){
    if (err) return handleError(err);
    handleData(data);
  });
  ```

  into:

  ```javascript
  let fs = require('fs');
  let readFile = RSVP.denodeify(fs.readFile);

  readFile('myfile.txt').then(handleData, handleError);
  ```

  If the node function has multiple success parameters, then `denodeify`
  just returns the first one:

  ```javascript
  let request = RSVP.denodeify(require('request'));

  request('http://example.com').then(function(res) {
    // ...
  });
  ```

  However, if you need all success parameters, setting `denodeify`'s
  second parameter to `true` causes it to return all success parameters
  as an array:

  ```javascript
  let request = RSVP.denodeify(require('request'), true);

  request('http://example.com').then(function(result) {
    // result[0] -> res
    // result[1] -> body
  });
  ```

  Or if you pass it an array with names it returns the parameters as a hash:

  ```javascript
  let request = RSVP.denodeify(require('request'), ['res', 'body']);

  request('http://example.com').then(function(result) {
    // result.res
    // result.body
  });
  ```

  Sometimes you need to retain the `this`:

  ```javascript
  let app = require('express')();
  let render = RSVP.denodeify(app.render.bind(app));
  ```

  The denodified function inherits from the original function. It works in all
  environments, except IE 10 and below. Consequently all properties of the original
  function are available to you. However, any properties you change on the
  denodeified function won't be changed on the original function. Example:

  ```javascript
  let request = RSVP.denodeify(require('request')),
      cookieJar = request.jar(); // <- Inheritance is used here

  request('http://example.com', {jar: cookieJar}).then(function(res) {
    // cookieJar.cookies holds now the cookies returned by example.com
  });
  ```

  Using `denodeify` makes it easier to compose asynchronous operations instead
  of using callbacks. For example, instead of:

  ```javascript
  let fs = require('fs');

  fs.readFile('myfile.txt', function(err, data){
    if (err) { ... } // Handle error
    fs.writeFile('myfile2.txt', data, function(err){
      if (err) { ... } // Handle error
      console.log('done')
    });
  });
  ```

  you can chain the operations together using `then` from the returned promise:

  ```javascript
  let fs = require('fs');
  let readFile = RSVP.denodeify(fs.readFile);
  let writeFile = RSVP.denodeify(fs.writeFile);

  readFile('myfile.txt').then(function(data){
    return writeFile('myfile2.txt', data);
  }).then(function(){
    console.log('done')
  }).catch(function(error){
    // Handle error
  });
  ```

  @method denodeify
  @static
  @for RSVP
  @param {Function} nodeFunc a 'node-style' function that takes a callback as
  its last argument. The callback expects an error to be passed as its first
  argument (if an error occurred, otherwise null), and the value from the
  operation as its second argument ('function(err, value){ }').
  @param {Boolean|Array} [options] An optional paramter that if set
  to `true` causes the promise to fulfill with the callback's success arguments
  as an array. This is useful if the node function has multiple success
  paramters. If you set this paramter to an array with names, the promise will
  fulfill with a hash with these names as keys and the success parameters as
  values.
  @return {Function} a function that wraps `nodeFunc` to return an
  `RSVP.Promise`
  @static
*/
function denodeify(nodeFunc, options) {
  var fn = function () {
    var self = this;
    var l = arguments.length;
    var args = new Array(l + 1);
    var promiseInput = false;

    for (var i = 0; i < l; ++i) {
      var arg = arguments[i];

      if (!promiseInput) {
        // TODO: clean this up
        promiseInput = needsPromiseInput(arg);
        if (promiseInput === GET_THEN_ERROR$1) {
          var p = new Promise(noop);
          reject(p, GET_THEN_ERROR$1.value);
          return p;
        } else if (promiseInput && promiseInput !== true) {
          arg = wrapThenable(promiseInput, arg);
        }
      }
      args[i] = arg;
    }

    var promise = new Promise(noop);

    args[l] = function (err, val) {
      if (err) reject(promise, err);else if (options === undefined) resolve(promise, val);else if (options === true) resolve(promise, arrayResult(arguments));else if (isArray(options)) resolve(promise, makeObject(arguments, options));else resolve(promise, val);
    };

    if (promiseInput) {
      return handlePromiseInput(promise, args, nodeFunc, self);
    } else {
      return handleValueInput(promise, args, nodeFunc, self);
    }
  };

  fn.__proto__ = nodeFunc;

  return fn;
}

function handleValueInput(promise, args, nodeFunc, self) {
  var result = tryApply(nodeFunc, self, args);
  if (result === ERROR) {
    reject(promise, result.value);
  }
  return promise;
}

function handlePromiseInput(promise, args, nodeFunc, self) {
  return Promise.all(args).then(function (args) {
    var result = tryApply(nodeFunc, self, args);
    if (result === ERROR) {
      reject(promise, result.value);
    }
    return promise;
  });
}

function needsPromiseInput(arg) {
  if (arg && typeof arg === 'object') {
    if (arg.constructor === Promise) {
      return true;
    } else {
      return getThen$1(arg);
    }
  } else {
    return false;
  }
}

/**
  This is a convenient alias for `RSVP.Promise.all`.

  @method all
  @static
  @for RSVP
  @param {Array} array Array of promises.
  @param {String} label An optional label. This is useful
  for tooling.
*/
function all$1(array, label) {
  return Promise.all(array, label);
}

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var AllSettled = function (_Enumerator) {
  _inherits(AllSettled, _Enumerator);

  function AllSettled(Constructor, entries, label) {
    return _possibleConstructorReturn(this, _Enumerator.call(this, Constructor, entries, false /* don't abort on reject */, label));
  }

  return AllSettled;
}(Enumerator);

AllSettled.prototype._makeResult = makeSettledResult;

/**
`RSVP.allSettled` is similar to `RSVP.all`, but instead of implementing
a fail-fast method, it waits until all the promises have returned and
shows you all the results. This is useful if you want to handle multiple
promises' failure states together as a set.
 Returns a promise that is fulfilled when all the given promises have been
settled. The return promise is fulfilled with an array of the states of
the promises passed into the `promises` array argument.
 Each state object will either indicate fulfillment or rejection, and
provide the corresponding value or reason. The states will take one of
the following formats:
 ```javascript
{ state: 'fulfilled', value: value }
  or
{ state: 'rejected', reason: reason }
```
 Example:
 ```javascript
let promise1 = RSVP.Promise.resolve(1);
let promise2 = RSVP.Promise.reject(new Error('2'));
let promise3 = RSVP.Promise.reject(new Error('3'));
let promises = [ promise1, promise2, promise3 ];
 RSVP.allSettled(promises).then(function(array){
  // array == [
  //   { state: 'fulfilled', value: 1 },
  //   { state: 'rejected', reason: Error },
  //   { state: 'rejected', reason: Error }
  // ]
  // Note that for the second item, reason.message will be '2', and for the
  // third item, reason.message will be '3'.
}, function(error) {
  // Not run. (This block would only be called if allSettled had failed,
  // for instance if passed an incorrect argument type.)
});
```
 @method allSettled
@static
@for RSVP
@param {Array} entries
@param {String} label - optional string that describes the promise.
Useful for tooling.
@return {Promise} promise that is fulfilled with an array of the settled
states of the constituent promises.
*/

function allSettled(entries, label) {
  if (!isArray(entries)) {
    return Promise.reject(new TypeError("Promise.allSettled must be called with an array"), label);
  }

  return new AllSettled(Promise, entries, label).promise;
}

/**
  This is a convenient alias for `RSVP.Promise.race`.

  @method race
  @static
  @for RSVP
  @param {Array} array Array of promises.
  @param {String} label An optional label. This is useful
  for tooling.
 */
function race$1(array, label) {
  return Promise.race(array, label);
}

function _possibleConstructorReturn$1(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits$1(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var hasOwnProperty = Object.prototype.hasOwnProperty;

var PromiseHash = function (_Enumerator) {
  _inherits$1(PromiseHash, _Enumerator);

  function PromiseHash(Constructor, object) {
    var abortOnReject = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : true;
    var label = arguments[3];
    return _possibleConstructorReturn$1(this, _Enumerator.call(this, Constructor, object, abortOnReject, label));
  }

  PromiseHash.prototype._init = function _init(Constructor, object) {
    this._result = {};

    this._enumerate(object);
    if (this._remaining === 0) {
      fulfill(this.promise, this._result);
    }
  };

  PromiseHash.prototype._enumerate = function _enumerate(input) {
    var promise = this.promise;
    var results = [];

    for (var key in input) {
      if (hasOwnProperty.call(input, key)) {
        results.push({
          position: key,
          entry: input[key]
        });
      }
    }

    var length = results.length;
    this._remaining = length;
    var result = void 0;

    for (var i = 0; promise._state === PENDING && i < length; i++) {
      result = results[i];
      this._eachEntry(result.entry, result.position);
    }
  };

  return PromiseHash;
}(Enumerator);

/**
  `RSVP.hash` is similar to `RSVP.all`, but takes an object instead of an array
  for its `promises` argument.

  Returns a promise that is fulfilled when all the given promises have been
  fulfilled, or rejected if any of them become rejected. The returned promise
  is fulfilled with a hash that has the same key names as the `promises` object
  argument. If any of the values in the object are not promises, they will
  simply be copied over to the fulfilled object.

  Example:

  ```javascript
  let promises = {
    myPromise: RSVP.resolve(1),
    yourPromise: RSVP.resolve(2),
    theirPromise: RSVP.resolve(3),
    notAPromise: 4
  };

  RSVP.hash(promises).then(function(hash){
    // hash here is an object that looks like:
    // {
    //   myPromise: 1,
    //   yourPromise: 2,
    //   theirPromise: 3,
    //   notAPromise: 4
    // }
  });
  ````

  If any of the `promises` given to `RSVP.hash` are rejected, the first promise
  that is rejected will be given as the reason to the rejection handler.

  Example:

  ```javascript
  let promises = {
    myPromise: RSVP.resolve(1),
    rejectedPromise: RSVP.reject(new Error('rejectedPromise')),
    anotherRejectedPromise: RSVP.reject(new Error('anotherRejectedPromise')),
  };

  RSVP.hash(promises).then(function(hash){
    // Code here never runs because there are rejected promises!
  }, function(reason) {
    // reason.message === 'rejectedPromise'
  });
  ```

  An important note: `RSVP.hash` is intended for plain JavaScript objects that
  are just a set of keys and values. `RSVP.hash` will NOT preserve prototype
  chains.

  Example:

  ```javascript
  function MyConstructor(){
    this.example = RSVP.resolve('Example');
  }

  MyConstructor.prototype = {
    protoProperty: RSVP.resolve('Proto Property')
  };

  let myObject = new MyConstructor();

  RSVP.hash(myObject).then(function(hash){
    // protoProperty will not be present, instead you will just have an
    // object that looks like:
    // {
    //   example: 'Example'
    // }
    //
    // hash.hasOwnProperty('protoProperty'); // false
    // 'undefined' === typeof hash.protoProperty
  });
  ```

  @method hash
  @static
  @for RSVP
  @param {Object} object
  @param {String} label optional string that describes the promise.
  Useful for tooling.
  @return {Promise} promise that is fulfilled when all properties of `promises`
  have been fulfilled, or rejected if any of them become rejected.
*/
function hash(object, label) {
  if (!isObject(object)) {
    return Promise.reject(new TypeError("Promise.hash must be called with an object"), label);
  }

  return new PromiseHash(Promise, object, label).promise;
}

function _possibleConstructorReturn$2(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits$2(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var HashSettled = function (_PromiseHash) {
  _inherits$2(HashSettled, _PromiseHash);

  function HashSettled(Constructor, object, label) {
    return _possibleConstructorReturn$2(this, _PromiseHash.call(this, Constructor, object, false, label));
  }

  return HashSettled;
}(PromiseHash);

HashSettled.prototype._makeResult = makeSettledResult;

/**
  `RSVP.hashSettled` is similar to `RSVP.allSettled`, but takes an object
  instead of an array for its `promises` argument.

  Unlike `RSVP.all` or `RSVP.hash`, which implement a fail-fast method,
  but like `RSVP.allSettled`, `hashSettled` waits until all the
  constituent promises have returned and then shows you all the results
  with their states and values/reasons. This is useful if you want to
  handle multiple promises' failure states together as a set.

  Returns a promise that is fulfilled when all the given promises have been
  settled, or rejected if the passed parameters are invalid.

  The returned promise is fulfilled with a hash that has the same key names as
  the `promises` object argument. If any of the values in the object are not
  promises, they will be copied over to the fulfilled object and marked with state
  'fulfilled'.

  Example:

  ```javascript
  let promises = {
    myPromise: RSVP.Promise.resolve(1),
    yourPromise: RSVP.Promise.resolve(2),
    theirPromise: RSVP.Promise.resolve(3),
    notAPromise: 4
  };

  RSVP.hashSettled(promises).then(function(hash){
    // hash here is an object that looks like:
    // {
    //   myPromise: { state: 'fulfilled', value: 1 },
    //   yourPromise: { state: 'fulfilled', value: 2 },
    //   theirPromise: { state: 'fulfilled', value: 3 },
    //   notAPromise: { state: 'fulfilled', value: 4 }
    // }
  });
  ```

  If any of the `promises` given to `RSVP.hash` are rejected, the state will
  be set to 'rejected' and the reason for rejection provided.

  Example:

  ```javascript
  let promises = {
    myPromise: RSVP.Promise.resolve(1),
    rejectedPromise: RSVP.Promise.reject(new Error('rejection')),
    anotherRejectedPromise: RSVP.Promise.reject(new Error('more rejection')),
  };

  RSVP.hashSettled(promises).then(function(hash){
    // hash here is an object that looks like:
    // {
    //   myPromise:              { state: 'fulfilled', value: 1 },
    //   rejectedPromise:        { state: 'rejected', reason: Error },
    //   anotherRejectedPromise: { state: 'rejected', reason: Error },
    // }
    // Note that for rejectedPromise, reason.message == 'rejection',
    // and for anotherRejectedPromise, reason.message == 'more rejection'.
  });
  ```

  An important note: `RSVP.hashSettled` is intended for plain JavaScript objects that
  are just a set of keys and values. `RSVP.hashSettled` will NOT preserve prototype
  chains.

  Example:

  ```javascript
  function MyConstructor(){
    this.example = RSVP.Promise.resolve('Example');
  }

  MyConstructor.prototype = {
    protoProperty: RSVP.Promise.resolve('Proto Property')
  };

  let myObject = new MyConstructor();

  RSVP.hashSettled(myObject).then(function(hash){
    // protoProperty will not be present, instead you will just have an
    // object that looks like:
    // {
    //   example: { state: 'fulfilled', value: 'Example' }
    // }
    //
    // hash.hasOwnProperty('protoProperty'); // false
    // 'undefined' === typeof hash.protoProperty
  });
  ```

  @method hashSettled
  @for RSVP
  @param {Object} object
  @param {String} label optional string that describes the promise.
  Useful for tooling.
  @return {Promise} promise that is fulfilled when when all properties of `promises`
  have been settled.
  @static
*/

function hashSettled(object, label) {
  if (!isObject(object)) {
    return Promise.reject(new TypeError("RSVP.hashSettled must be called with an object"), label);
  }

  return new HashSettled(Promise, object, false, label).promise;
}

/**
  `RSVP.rethrow` will rethrow an error on the next turn of the JavaScript event
  loop in order to aid debugging.

  Promises A+ specifies that any exceptions that occur with a promise must be
  caught by the promises implementation and bubbled to the last handler. For
  this reason, it is recommended that you always specify a second rejection
  handler function to `then`. However, `RSVP.rethrow` will throw the exception
  outside of the promise, so it bubbles up to your console if in the browser,
  or domain/cause uncaught exception in Node. `rethrow` will also throw the
  error again so the error can be handled by the promise per the spec.

  ```javascript
  function throws(){
    throw new Error('Whoops!');
  }

  let promise = new RSVP.Promise(function(resolve, reject){
    throws();
  });

  promise.catch(RSVP.rethrow).then(function(){
    // Code here doesn't run because the promise became rejected due to an
    // error!
  }, function (err){
    // handle the error here
  });
  ```

  The 'Whoops' error will be thrown on the next turn of the event loop
  and you can watch for it in your console. You can also handle it using a
  rejection handler given to `.then` or `.catch` on the returned promise.

  @method rethrow
  @static
  @for RSVP
  @param {Error} reason reason the promise became rejected.
  @throws Error
  @static
*/
function rethrow(reason) {
  setTimeout(function () {
    throw reason;
  });
  throw reason;
}

/**
  `RSVP.defer` returns an object similar to jQuery's `$.Deferred`.
  `RSVP.defer` should be used when porting over code reliant on `$.Deferred`'s
  interface. New code should use the `RSVP.Promise` constructor instead.

  The object returned from `RSVP.defer` is a plain object with three properties:

  * promise - an `RSVP.Promise`.
  * reject - a function that causes the `promise` property on this object to
    become rejected
  * resolve - a function that causes the `promise` property on this object to
    become fulfilled.

  Example:

   ```javascript
   let deferred = RSVP.defer();

   deferred.resolve("Success!");

   deferred.promise.then(function(value){
     // value here is "Success!"
   });
   ```

  @method defer
  @static
  @for RSVP
  @param {String} label optional string for labeling the promise.
  Useful for tooling.
  @return {Object}
 */

function defer(label) {
  var deferred = { resolve: undefined, reject: undefined };

  deferred.promise = new Promise(function (resolve, reject) {
    deferred.resolve = resolve;
    deferred.reject = reject;
  }, label);

  return deferred;
}

/**
 `RSVP.map` is similar to JavaScript's native `map` method, except that it
  waits for all promises to become fulfilled before running the `mapFn` on
  each item in given to `promises`. `RSVP.map` returns a promise that will
  become fulfilled with the result of running `mapFn` on the values the promises
  become fulfilled with.

  For example:

  ```javascript

  let promise1 = RSVP.resolve(1);
  let promise2 = RSVP.resolve(2);
  let promise3 = RSVP.resolve(3);
  let promises = [ promise1, promise2, promise3 ];

  let mapFn = function(item){
    return item + 1;
  };

  RSVP.map(promises, mapFn).then(function(result){
    // result is [ 2, 3, 4 ]
  });
  ```

  If any of the `promises` given to `RSVP.map` are rejected, the first promise
  that is rejected will be given as an argument to the returned promise's
  rejection handler. For example:

  ```javascript
  let promise1 = RSVP.resolve(1);
  let promise2 = RSVP.reject(new Error('2'));
  let promise3 = RSVP.reject(new Error('3'));
  let promises = [ promise1, promise2, promise3 ];

  let mapFn = function(item){
    return item + 1;
  };

  RSVP.map(promises, mapFn).then(function(array){
    // Code here never runs because there are rejected promises!
  }, function(reason) {
    // reason.message === '2'
  });
  ```

  `RSVP.map` will also wait if a promise is returned from `mapFn`. For example,
  say you want to get all comments from a set of blog posts, but you need
  the blog posts first because they contain a url to those comments.

  ```javscript

  let mapFn = function(blogPost){
    // getComments does some ajax and returns an RSVP.Promise that is fulfilled
    // with some comments data
    return getComments(blogPost.comments_url);
  };

  // getBlogPosts does some ajax and returns an RSVP.Promise that is fulfilled
  // with some blog post data
  RSVP.map(getBlogPosts(), mapFn).then(function(comments){
    // comments is the result of asking the server for the comments
    // of all blog posts returned from getBlogPosts()
  });
  ```

  @method map
  @static
  @for RSVP
  @param {Array} promises
  @param {Function} mapFn function to be called on each fulfilled promise.
  @param {String} label optional string for labeling the promise.
  Useful for tooling.
  @return {Promise} promise that is fulfilled with the result of calling
  `mapFn` on each fulfilled promise or value when they become fulfilled.
   The promise will be rejected if any of the given `promises` become rejected.
  @static
*/
function map(promises, mapFn, label) {
  if (!isArray(promises)) {
    return Promise.reject(new TypeError("RSVP.map must be called with an array"), label);
  }

  if (!isFunction(mapFn)) {
    return Promise.reject(new TypeError("RSVP.map expects a function as a second argument"), label);
  }

  return Promise.all(promises, label).then(function (values) {
    var length = values.length;
    var results = new Array(length);

    for (var i = 0; i < length; i++) {
      results[i] = mapFn(values[i]);
    }

    return Promise.all(results, label);
  });
}

/**
  This is a convenient alias for `RSVP.Promise.resolve`.

  @method resolve
  @static
  @for RSVP
  @param {*} value value that the returned promise will be resolved with
  @param {String} label optional string for identifying the returned promise.
  Useful for tooling.
  @return {Promise} a promise that will become fulfilled with the given
  `value`
*/
function resolve$2(value, label) {
  return Promise.resolve(value, label);
}

/**
  This is a convenient alias for `RSVP.Promise.reject`.

  @method reject
  @static
  @for RSVP
  @param {*} reason value that the returned promise will be rejected with.
  @param {String} label optional string for identifying the returned promise.
  Useful for tooling.
  @return {Promise} a promise rejected with the given `reason`.
*/
function reject$2(reason, label) {
  return Promise.reject(reason, label);
}

/**
 `RSVP.filter` is similar to JavaScript's native `filter` method, except that it
  waits for all promises to become fulfilled before running the `filterFn` on
  each item in given to `promises`. `RSVP.filter` returns a promise that will
  become fulfilled with the result of running `filterFn` on the values the
  promises become fulfilled with.

  For example:

  ```javascript

  let promise1 = RSVP.resolve(1);
  let promise2 = RSVP.resolve(2);
  let promise3 = RSVP.resolve(3);

  let promises = [promise1, promise2, promise3];

  let filterFn = function(item){
    return item > 1;
  };

  RSVP.filter(promises, filterFn).then(function(result){
    // result is [ 2, 3 ]
  });
  ```

  If any of the `promises` given to `RSVP.filter` are rejected, the first promise
  that is rejected will be given as an argument to the returned promise's
  rejection handler. For example:

  ```javascript
  let promise1 = RSVP.resolve(1);
  let promise2 = RSVP.reject(new Error('2'));
  let promise3 = RSVP.reject(new Error('3'));
  let promises = [ promise1, promise2, promise3 ];

  let filterFn = function(item){
    return item > 1;
  };

  RSVP.filter(promises, filterFn).then(function(array){
    // Code here never runs because there are rejected promises!
  }, function(reason) {
    // reason.message === '2'
  });
  ```

  `RSVP.filter` will also wait for any promises returned from `filterFn`.
  For instance, you may want to fetch a list of users then return a subset
  of those users based on some asynchronous operation:

  ```javascript

  let alice = { name: 'alice' };
  let bob   = { name: 'bob' };
  let users = [ alice, bob ];

  let promises = users.map(function(user){
    return RSVP.resolve(user);
  });

  let filterFn = function(user){
    // Here, Alice has permissions to create a blog post, but Bob does not.
    return getPrivilegesForUser(user).then(function(privs){
      return privs.can_create_blog_post === true;
    });
  };
  RSVP.filter(promises, filterFn).then(function(users){
    // true, because the server told us only Alice can create a blog post.
    users.length === 1;
    // false, because Alice is the only user present in `users`
    users[0] === bob;
  });
  ```

  @method filter
  @static
  @for RSVP
  @param {Array} promises
  @param {Function} filterFn - function to be called on each resolved value to
  filter the final results.
  @param {String} label optional string describing the promise. Useful for
  tooling.
  @return {Promise}
*/

function resolveAll(promises, label) {
  return Promise.all(promises, label);
}

function resolveSingle(promise, label) {
  return Promise.resolve(promise, label).then(function (promises) {
    return resolveAll(promises, label);
  });
}

function filter(promises, filterFn, label) {
  if (!isArray(promises) && !(isObject(promises) && promises.then !== undefined)) {
    return Promise.reject(new TypeError("RSVP.filter must be called with an array or promise"), label);
  }

  if (!isFunction(filterFn)) {
    return Promise.reject(new TypeError("RSVP.filter expects function as a second argument"), label);
  }

  var promise = isArray(promises) ? resolveAll(promises, label) : resolveSingle(promises, label);
  return promise.then(function (values) {
    var length = values.length;
    var filtered = new Array(length);

    for (var i = 0; i < length; i++) {
      filtered[i] = filterFn(values[i]);
    }

    return resolveAll(filtered, label).then(function (filtered) {
      var results = new Array(length);
      var newLength = 0;

      for (var _i = 0; _i < length; _i++) {
        if (filtered[_i]) {
          results[newLength] = values[_i];
          newLength++;
        }
      }

      results.length = newLength;

      return results;
    });
  });
}

var len = 0;
var vertxNext = void 0;
function asap(callback, arg) {
  queue$1[len] = callback;
  queue$1[len + 1] = arg;
  len += 2;
  if (len === 2) {
    // If len is 1, that means that we need to schedule an async flush.
    // If additional callbacks are queued before the queue is flushed, they
    // will be processed by this flush that we are scheduling.
    scheduleFlush$1();
  }
}

var browserWindow = typeof window !== 'undefined' ? window : undefined;
var browserGlobal = browserWindow || {};
var BrowserMutationObserver = browserGlobal.MutationObserver || browserGlobal.WebKitMutationObserver;
var isNode = typeof self === 'undefined' && typeof process !== 'undefined' && {}.toString.call(process) === '[object process]';

// test for web worker but not in IE10
var isWorker = typeof Uint8ClampedArray !== 'undefined' && typeof importScripts !== 'undefined' && typeof MessageChannel !== 'undefined';

// node
function useNextTick() {
  var nextTick = process.nextTick;
  // node version 0.10.x displays a deprecation warning when nextTick is used recursively
  // setImmediate should be used instead instead
  var version = process.versions.node.match(/^(?:(\d+)\.)?(?:(\d+)\.)?(\*|\d+)$/);
  if (Array.isArray(version) && version[1] === '0' && version[2] === '10') {
    nextTick = setImmediate;
  }
  return function () {
    return nextTick(flush);
  };
}

// vertx
function useVertxTimer() {
  if (typeof vertxNext !== 'undefined') {
    return function () {
      vertxNext(flush);
    };
  }
  return useSetTimeout();
}

function useMutationObserver() {
  var iterations = 0;
  var observer = new BrowserMutationObserver(flush);
  var node = document.createTextNode('');
  observer.observe(node, { characterData: true });

  return function () {
    return node.data = iterations = ++iterations % 2;
  };
}

// web worker
function useMessageChannel() {
  var channel = new MessageChannel();
  channel.port1.onmessage = flush;
  return function () {
    return channel.port2.postMessage(0);
  };
}

function useSetTimeout() {
  return function () {
    return setTimeout(flush, 1);
  };
}

var queue$1 = new Array(1000);

function flush() {
  for (var i = 0; i < len; i += 2) {
    var callback = queue$1[i];
    var arg = queue$1[i + 1];

    callback(arg);

    queue$1[i] = undefined;
    queue$1[i + 1] = undefined;
  }

  len = 0;
}

function attemptVertex() {
  try {
    var r = require;
    var vertx = r('vertx');
    vertxNext = vertx.runOnLoop || vertx.runOnContext;
    return useVertxTimer();
  } catch (e) {
    return useSetTimeout();
  }
}

var scheduleFlush$1 = void 0;
// Decide what async method to use to triggering processing of queued callbacks:
if (isNode) {
  scheduleFlush$1 = useNextTick();
} else if (BrowserMutationObserver) {
  scheduleFlush$1 = useMutationObserver();
} else if (isWorker) {
  scheduleFlush$1 = useMessageChannel();
} else if (browserWindow === undefined && typeof require === 'function') {
  scheduleFlush$1 = attemptVertex();
} else {
  scheduleFlush$1 = useSetTimeout();
}

var platform = void 0;

/* global self */
if (typeof self === 'object') {
  platform = self;

  /* global global */
} else if (typeof global === 'object') {
  platform = global;
} else {
  throw new Error('no global: `self` or `global` found');
}

var _asap$cast$Promise$Ev;

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

// defaults
config.async = asap;
config.after = function (cb) {
  return setTimeout(cb, 0);
};
var cast = resolve$2;

var async = function (callback, arg) {
  return config.async(callback, arg);
};

function on() {
  config['on'].apply(config, arguments);
}

function off() {
  config['off'].apply(config, arguments);
}

// Set up instrumentation through `window.__PROMISE_INTRUMENTATION__`
if (typeof window !== 'undefined' && typeof window['__PROMISE_INSTRUMENTATION__'] === 'object') {
  var callbacks = window['__PROMISE_INSTRUMENTATION__'];
  configure('instrument', true);
  for (var eventName in callbacks) {
    if (callbacks.hasOwnProperty(eventName)) {
      on(eventName, callbacks[eventName]);
    }
  }
}

// the default export here is for backwards compat:
//   https://github.com/tildeio/rsvp.js/issues/434
var rsvp = (_asap$cast$Promise$Ev = {
  asap: asap,
  cast: cast,
  Promise: Promise,
  EventTarget: EventTarget,
  all: all$1,
  allSettled: allSettled,
  race: race$1,
  hash: hash,
  hashSettled: hashSettled,
  rethrow: rethrow,
  defer: defer,
  denodeify: denodeify,
  configure: configure,
  on: on,
  off: off,
  resolve: resolve$2,
  reject: reject$2,
  map: map
}, _defineProperty(_asap$cast$Promise$Ev, 'async', async), _defineProperty(_asap$cast$Promise$Ev, 'filter', filter), _asap$cast$Promise$Ev);

exports['default'] = rsvp;
exports.asap = asap;
exports.cast = cast;
exports.Promise = Promise;
exports.EventTarget = EventTarget;
exports.all = all$1;
exports.allSettled = allSettled;
exports.race = race$1;
exports.hash = hash;
exports.hashSettled = hashSettled;
exports.rethrow = rethrow;
exports.defer = defer;
exports.denodeify = denodeify;
exports.configure = configure;
exports.on = on;
exports.off = off;
exports.resolve = resolve$2;
exports.reject = reject$2;
exports.map = map;
exports.async = async;
exports.filter = filter;

Object.defineProperty(exports, '__esModule', { value: true });

})));



}).call(this,require('_process'),typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"_process":1}],3:[function(require,module,exports){
const chrome = window.chrome
// const config = require('./config')
const utils = require('./utils')
// const storage = require('./chrome-storage.js')(chrome.storage.local)

chrome.storage.onChanged.addListener(function (changes, namespace) {
  for (let key in changes) {
    let storageChange = changes[key]
    console.log('Storage key "%s" in namespace "%s" changed. ' + 'Old value was "%s", new value is "%s".', key, namespace, storageChange.oldValue, storageChange.newValue)
  }
})

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  var selection
  console.log(sender.tab ? 'from a content script:' + sender.tab.url : 'from the extension')
  switch (request.action) {
    case 'select text':
      selection = utils.getSelectedText().toString().split('\n').filter(function (e) {
        return e.replace(/(\r\n|\n|\r)/gm, '')
      })
      sendResponse({
        data: selection
      })
      break
    case 'find tracks':
      sendResponse('looking for tracks')
  }
  return false
})

},{"./utils":4}],4:[function(require,module,exports){
var RSVP = require('rsvp')

const chrome = window.chrome

module.exports = {
  matchUrl: function (n) {
    if (n != null) {
      return window.location.href.match(n)
    }
  },
  getSelectedText: function () {
    if (window.getSelection) {
      return window.getSelection().toString()
    } else if (document.selection) {
      return document.selection.createRange().text
    }
    return ''
  },
  importHtml: function (href) {
    var promise
    promise = new RSVP.Promise(function (resolve, reject) {
      var elem
      if ('import' in document.createElement('link')) {
        elem = document.createElement('link')
        elem.rel = 'import'
        elem.href = chrome.extension.getURL(href)
        elem.onload = function (e) {
          return resolve(e)
        }
        elem.onerror = function (e) {
          return reject(Error(e))
        }
        return document.head.appendChild(elem)
      } else {
        return reject(Error('Html import not supported'))
      }
    })
    return promise
  },
  getParameterByName: function (name, url) {
    var regex, results
    if (!url) {
      url = window.location.href
    }
    url = url.toLowerCase()
    name = name.replace(/[[\]]/g, '\\$&').toLowerCase()
    regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)')
    results = regex.exec(url)
    if (!results) {
      return null
    }
    if (!results[2]) {
      return ''
    }
    return decodeURIComponent(results[2].replace(/\+/g, ' '))
  }
}

},{"rsvp":2}]},{},[3])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJub2RlX21vZHVsZXMvcHJvY2Vzcy9icm93c2VyLmpzIiwibm9kZV9tb2R1bGVzL3JzdnAvZGlzdC9yc3ZwLmpzIiwic3JjL21haW4uanMiLCJzcmMvdXRpbHMuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7QUN4TEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7OztBQ2ovRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzdCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCIvLyBzaGltIGZvciB1c2luZyBwcm9jZXNzIGluIGJyb3dzZXJcbnZhciBwcm9jZXNzID0gbW9kdWxlLmV4cG9ydHMgPSB7fTtcblxuLy8gY2FjaGVkIGZyb20gd2hhdGV2ZXIgZ2xvYmFsIGlzIHByZXNlbnQgc28gdGhhdCB0ZXN0IHJ1bm5lcnMgdGhhdCBzdHViIGl0XG4vLyBkb24ndCBicmVhayB0aGluZ3MuICBCdXQgd2UgbmVlZCB0byB3cmFwIGl0IGluIGEgdHJ5IGNhdGNoIGluIGNhc2UgaXQgaXNcbi8vIHdyYXBwZWQgaW4gc3RyaWN0IG1vZGUgY29kZSB3aGljaCBkb2Vzbid0IGRlZmluZSBhbnkgZ2xvYmFscy4gIEl0J3MgaW5zaWRlIGFcbi8vIGZ1bmN0aW9uIGJlY2F1c2UgdHJ5L2NhdGNoZXMgZGVvcHRpbWl6ZSBpbiBjZXJ0YWluIGVuZ2luZXMuXG5cbnZhciBjYWNoZWRTZXRUaW1lb3V0O1xudmFyIGNhY2hlZENsZWFyVGltZW91dDtcblxuZnVuY3Rpb24gZGVmYXVsdFNldFRpbW91dCgpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ3NldFRpbWVvdXQgaGFzIG5vdCBiZWVuIGRlZmluZWQnKTtcbn1cbmZ1bmN0aW9uIGRlZmF1bHRDbGVhclRpbWVvdXQgKCkge1xuICAgIHRocm93IG5ldyBFcnJvcignY2xlYXJUaW1lb3V0IGhhcyBub3QgYmVlbiBkZWZpbmVkJyk7XG59XG4oZnVuY3Rpb24gKCkge1xuICAgIHRyeSB7XG4gICAgICAgIGlmICh0eXBlb2Ygc2V0VGltZW91dCA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgICAgY2FjaGVkU2V0VGltZW91dCA9IHNldFRpbWVvdXQ7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBjYWNoZWRTZXRUaW1lb3V0ID0gZGVmYXVsdFNldFRpbW91dDtcbiAgICAgICAgfVxuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgY2FjaGVkU2V0VGltZW91dCA9IGRlZmF1bHRTZXRUaW1vdXQ7XG4gICAgfVxuICAgIHRyeSB7XG4gICAgICAgIGlmICh0eXBlb2YgY2xlYXJUaW1lb3V0ID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgICBjYWNoZWRDbGVhclRpbWVvdXQgPSBjbGVhclRpbWVvdXQ7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBjYWNoZWRDbGVhclRpbWVvdXQgPSBkZWZhdWx0Q2xlYXJUaW1lb3V0O1xuICAgICAgICB9XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgICBjYWNoZWRDbGVhclRpbWVvdXQgPSBkZWZhdWx0Q2xlYXJUaW1lb3V0O1xuICAgIH1cbn0gKCkpXG5mdW5jdGlvbiBydW5UaW1lb3V0KGZ1bikge1xuICAgIGlmIChjYWNoZWRTZXRUaW1lb3V0ID09PSBzZXRUaW1lb3V0KSB7XG4gICAgICAgIC8vbm9ybWFsIGVudmlyb21lbnRzIGluIHNhbmUgc2l0dWF0aW9uc1xuICAgICAgICByZXR1cm4gc2V0VGltZW91dChmdW4sIDApO1xuICAgIH1cbiAgICAvLyBpZiBzZXRUaW1lb3V0IHdhc24ndCBhdmFpbGFibGUgYnV0IHdhcyBsYXR0ZXIgZGVmaW5lZFxuICAgIGlmICgoY2FjaGVkU2V0VGltZW91dCA9PT0gZGVmYXVsdFNldFRpbW91dCB8fCAhY2FjaGVkU2V0VGltZW91dCkgJiYgc2V0VGltZW91dCkge1xuICAgICAgICBjYWNoZWRTZXRUaW1lb3V0ID0gc2V0VGltZW91dDtcbiAgICAgICAgcmV0dXJuIHNldFRpbWVvdXQoZnVuLCAwKTtcbiAgICB9XG4gICAgdHJ5IHtcbiAgICAgICAgLy8gd2hlbiB3aGVuIHNvbWVib2R5IGhhcyBzY3Jld2VkIHdpdGggc2V0VGltZW91dCBidXQgbm8gSS5FLiBtYWRkbmVzc1xuICAgICAgICByZXR1cm4gY2FjaGVkU2V0VGltZW91dChmdW4sIDApO1xuICAgIH0gY2F0Y2goZSl7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICAvLyBXaGVuIHdlIGFyZSBpbiBJLkUuIGJ1dCB0aGUgc2NyaXB0IGhhcyBiZWVuIGV2YWxlZCBzbyBJLkUuIGRvZXNuJ3QgdHJ1c3QgdGhlIGdsb2JhbCBvYmplY3Qgd2hlbiBjYWxsZWQgbm9ybWFsbHlcbiAgICAgICAgICAgIHJldHVybiBjYWNoZWRTZXRUaW1lb3V0LmNhbGwobnVsbCwgZnVuLCAwKTtcbiAgICAgICAgfSBjYXRjaChlKXtcbiAgICAgICAgICAgIC8vIHNhbWUgYXMgYWJvdmUgYnV0IHdoZW4gaXQncyBhIHZlcnNpb24gb2YgSS5FLiB0aGF0IG11c3QgaGF2ZSB0aGUgZ2xvYmFsIG9iamVjdCBmb3IgJ3RoaXMnLCBob3BmdWxseSBvdXIgY29udGV4dCBjb3JyZWN0IG90aGVyd2lzZSBpdCB3aWxsIHRocm93IGEgZ2xvYmFsIGVycm9yXG4gICAgICAgICAgICByZXR1cm4gY2FjaGVkU2V0VGltZW91dC5jYWxsKHRoaXMsIGZ1biwgMCk7XG4gICAgICAgIH1cbiAgICB9XG5cblxufVxuZnVuY3Rpb24gcnVuQ2xlYXJUaW1lb3V0KG1hcmtlcikge1xuICAgIGlmIChjYWNoZWRDbGVhclRpbWVvdXQgPT09IGNsZWFyVGltZW91dCkge1xuICAgICAgICAvL25vcm1hbCBlbnZpcm9tZW50cyBpbiBzYW5lIHNpdHVhdGlvbnNcbiAgICAgICAgcmV0dXJuIGNsZWFyVGltZW91dChtYXJrZXIpO1xuICAgIH1cbiAgICAvLyBpZiBjbGVhclRpbWVvdXQgd2Fzbid0IGF2YWlsYWJsZSBidXQgd2FzIGxhdHRlciBkZWZpbmVkXG4gICAgaWYgKChjYWNoZWRDbGVhclRpbWVvdXQgPT09IGRlZmF1bHRDbGVhclRpbWVvdXQgfHwgIWNhY2hlZENsZWFyVGltZW91dCkgJiYgY2xlYXJUaW1lb3V0KSB7XG4gICAgICAgIGNhY2hlZENsZWFyVGltZW91dCA9IGNsZWFyVGltZW91dDtcbiAgICAgICAgcmV0dXJuIGNsZWFyVGltZW91dChtYXJrZXIpO1xuICAgIH1cbiAgICB0cnkge1xuICAgICAgICAvLyB3aGVuIHdoZW4gc29tZWJvZHkgaGFzIHNjcmV3ZWQgd2l0aCBzZXRUaW1lb3V0IGJ1dCBubyBJLkUuIG1hZGRuZXNzXG4gICAgICAgIHJldHVybiBjYWNoZWRDbGVhclRpbWVvdXQobWFya2VyKTtcbiAgICB9IGNhdGNoIChlKXtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIC8vIFdoZW4gd2UgYXJlIGluIEkuRS4gYnV0IHRoZSBzY3JpcHQgaGFzIGJlZW4gZXZhbGVkIHNvIEkuRS4gZG9lc24ndCAgdHJ1c3QgdGhlIGdsb2JhbCBvYmplY3Qgd2hlbiBjYWxsZWQgbm9ybWFsbHlcbiAgICAgICAgICAgIHJldHVybiBjYWNoZWRDbGVhclRpbWVvdXQuY2FsbChudWxsLCBtYXJrZXIpO1xuICAgICAgICB9IGNhdGNoIChlKXtcbiAgICAgICAgICAgIC8vIHNhbWUgYXMgYWJvdmUgYnV0IHdoZW4gaXQncyBhIHZlcnNpb24gb2YgSS5FLiB0aGF0IG11c3QgaGF2ZSB0aGUgZ2xvYmFsIG9iamVjdCBmb3IgJ3RoaXMnLCBob3BmdWxseSBvdXIgY29udGV4dCBjb3JyZWN0IG90aGVyd2lzZSBpdCB3aWxsIHRocm93IGEgZ2xvYmFsIGVycm9yLlxuICAgICAgICAgICAgLy8gU29tZSB2ZXJzaW9ucyBvZiBJLkUuIGhhdmUgZGlmZmVyZW50IHJ1bGVzIGZvciBjbGVhclRpbWVvdXQgdnMgc2V0VGltZW91dFxuICAgICAgICAgICAgcmV0dXJuIGNhY2hlZENsZWFyVGltZW91dC5jYWxsKHRoaXMsIG1hcmtlcik7XG4gICAgICAgIH1cbiAgICB9XG5cblxuXG59XG52YXIgcXVldWUgPSBbXTtcbnZhciBkcmFpbmluZyA9IGZhbHNlO1xudmFyIGN1cnJlbnRRdWV1ZTtcbnZhciBxdWV1ZUluZGV4ID0gLTE7XG5cbmZ1bmN0aW9uIGNsZWFuVXBOZXh0VGljaygpIHtcbiAgICBpZiAoIWRyYWluaW5nIHx8ICFjdXJyZW50UXVldWUpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBkcmFpbmluZyA9IGZhbHNlO1xuICAgIGlmIChjdXJyZW50UXVldWUubGVuZ3RoKSB7XG4gICAgICAgIHF1ZXVlID0gY3VycmVudFF1ZXVlLmNvbmNhdChxdWV1ZSk7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgcXVldWVJbmRleCA9IC0xO1xuICAgIH1cbiAgICBpZiAocXVldWUubGVuZ3RoKSB7XG4gICAgICAgIGRyYWluUXVldWUoKTtcbiAgICB9XG59XG5cbmZ1bmN0aW9uIGRyYWluUXVldWUoKSB7XG4gICAgaWYgKGRyYWluaW5nKSB7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG4gICAgdmFyIHRpbWVvdXQgPSBydW5UaW1lb3V0KGNsZWFuVXBOZXh0VGljayk7XG4gICAgZHJhaW5pbmcgPSB0cnVlO1xuXG4gICAgdmFyIGxlbiA9IHF1ZXVlLmxlbmd0aDtcbiAgICB3aGlsZShsZW4pIHtcbiAgICAgICAgY3VycmVudFF1ZXVlID0gcXVldWU7XG4gICAgICAgIHF1ZXVlID0gW107XG4gICAgICAgIHdoaWxlICgrK3F1ZXVlSW5kZXggPCBsZW4pIHtcbiAgICAgICAgICAgIGlmIChjdXJyZW50UXVldWUpIHtcbiAgICAgICAgICAgICAgICBjdXJyZW50UXVldWVbcXVldWVJbmRleF0ucnVuKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcXVldWVJbmRleCA9IC0xO1xuICAgICAgICBsZW4gPSBxdWV1ZS5sZW5ndGg7XG4gICAgfVxuICAgIGN1cnJlbnRRdWV1ZSA9IG51bGw7XG4gICAgZHJhaW5pbmcgPSBmYWxzZTtcbiAgICBydW5DbGVhclRpbWVvdXQodGltZW91dCk7XG59XG5cbnByb2Nlc3MubmV4dFRpY2sgPSBmdW5jdGlvbiAoZnVuKSB7XG4gICAgdmFyIGFyZ3MgPSBuZXcgQXJyYXkoYXJndW1lbnRzLmxlbmd0aCAtIDEpO1xuICAgIGlmIChhcmd1bWVudHMubGVuZ3RoID4gMSkge1xuICAgICAgICBmb3IgKHZhciBpID0gMTsgaSA8IGFyZ3VtZW50cy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgYXJnc1tpIC0gMV0gPSBhcmd1bWVudHNbaV07XG4gICAgICAgIH1cbiAgICB9XG4gICAgcXVldWUucHVzaChuZXcgSXRlbShmdW4sIGFyZ3MpKTtcbiAgICBpZiAocXVldWUubGVuZ3RoID09PSAxICYmICFkcmFpbmluZykge1xuICAgICAgICBydW5UaW1lb3V0KGRyYWluUXVldWUpO1xuICAgIH1cbn07XG5cbi8vIHY4IGxpa2VzIHByZWRpY3RpYmxlIG9iamVjdHNcbmZ1bmN0aW9uIEl0ZW0oZnVuLCBhcnJheSkge1xuICAgIHRoaXMuZnVuID0gZnVuO1xuICAgIHRoaXMuYXJyYXkgPSBhcnJheTtcbn1cbkl0ZW0ucHJvdG90eXBlLnJ1biA9IGZ1bmN0aW9uICgpIHtcbiAgICB0aGlzLmZ1bi5hcHBseShudWxsLCB0aGlzLmFycmF5KTtcbn07XG5wcm9jZXNzLnRpdGxlID0gJ2Jyb3dzZXInO1xucHJvY2Vzcy5icm93c2VyID0gdHJ1ZTtcbnByb2Nlc3MuZW52ID0ge307XG5wcm9jZXNzLmFyZ3YgPSBbXTtcbnByb2Nlc3MudmVyc2lvbiA9ICcnOyAvLyBlbXB0eSBzdHJpbmcgdG8gYXZvaWQgcmVnZXhwIGlzc3Vlc1xucHJvY2Vzcy52ZXJzaW9ucyA9IHt9O1xuXG5mdW5jdGlvbiBub29wKCkge31cblxucHJvY2Vzcy5vbiA9IG5vb3A7XG5wcm9jZXNzLmFkZExpc3RlbmVyID0gbm9vcDtcbnByb2Nlc3Mub25jZSA9IG5vb3A7XG5wcm9jZXNzLm9mZiA9IG5vb3A7XG5wcm9jZXNzLnJlbW92ZUxpc3RlbmVyID0gbm9vcDtcbnByb2Nlc3MucmVtb3ZlQWxsTGlzdGVuZXJzID0gbm9vcDtcbnByb2Nlc3MuZW1pdCA9IG5vb3A7XG5wcm9jZXNzLnByZXBlbmRMaXN0ZW5lciA9IG5vb3A7XG5wcm9jZXNzLnByZXBlbmRPbmNlTGlzdGVuZXIgPSBub29wO1xuXG5wcm9jZXNzLmxpc3RlbmVycyA9IGZ1bmN0aW9uIChuYW1lKSB7IHJldHVybiBbXSB9XG5cbnByb2Nlc3MuYmluZGluZyA9IGZ1bmN0aW9uIChuYW1lKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdwcm9jZXNzLmJpbmRpbmcgaXMgbm90IHN1cHBvcnRlZCcpO1xufTtcblxucHJvY2Vzcy5jd2QgPSBmdW5jdGlvbiAoKSB7IHJldHVybiAnLycgfTtcbnByb2Nlc3MuY2hkaXIgPSBmdW5jdGlvbiAoZGlyKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdwcm9jZXNzLmNoZGlyIGlzIG5vdCBzdXBwb3J0ZWQnKTtcbn07XG5wcm9jZXNzLnVtYXNrID0gZnVuY3Rpb24oKSB7IHJldHVybiAwOyB9O1xuIiwiLyohXG4gKiBAb3ZlcnZpZXcgUlNWUCAtIGEgdGlueSBpbXBsZW1lbnRhdGlvbiBvZiBQcm9taXNlcy9BKy5cbiAqIEBjb3B5cmlnaHQgQ29weXJpZ2h0IChjKSAyMDE2IFllaHVkYSBLYXR6LCBUb20gRGFsZSwgU3RlZmFuIFBlbm5lciBhbmQgY29udHJpYnV0b3JzXG4gKiBAbGljZW5zZSAgIExpY2Vuc2VkIHVuZGVyIE1JVCBsaWNlbnNlXG4gKiAgICAgICAgICAgIFNlZSBodHRwczovL3Jhdy5naXRodWJ1c2VyY29udGVudC5jb20vdGlsZGVpby9yc3ZwLmpzL21hc3Rlci9MSUNFTlNFXG4gKiBAdmVyc2lvbiAgIDMuNi4yXG4gKi9cblxuKGZ1bmN0aW9uIChnbG9iYWwsIGZhY3RvcnkpIHtcblx0dHlwZW9mIGV4cG9ydHMgPT09ICdvYmplY3QnICYmIHR5cGVvZiBtb2R1bGUgIT09ICd1bmRlZmluZWQnID8gZmFjdG9yeShleHBvcnRzKSA6XG5cdHR5cGVvZiBkZWZpbmUgPT09ICdmdW5jdGlvbicgJiYgZGVmaW5lLmFtZCA/IGRlZmluZShbJ2V4cG9ydHMnXSwgZmFjdG9yeSkgOlxuXHQoZmFjdG9yeSgoZ2xvYmFsLlJTVlAgPSBnbG9iYWwuUlNWUCB8fCB7fSkpKTtcbn0odGhpcywgKGZ1bmN0aW9uIChleHBvcnRzKSB7ICd1c2Ugc3RyaWN0JztcblxuZnVuY3Rpb24gaW5kZXhPZihjYWxsYmFja3MsIGNhbGxiYWNrKSB7XG4gIGZvciAodmFyIGkgPSAwLCBsID0gY2FsbGJhY2tzLmxlbmd0aDsgaSA8IGw7IGkrKykge1xuICAgIGlmIChjYWxsYmFja3NbaV0gPT09IGNhbGxiYWNrKSB7XG4gICAgICByZXR1cm4gaTtcbiAgICB9XG4gIH1cblxuICByZXR1cm4gLTE7XG59XG5cbmZ1bmN0aW9uIGNhbGxiYWNrc0ZvcihvYmplY3QpIHtcbiAgdmFyIGNhbGxiYWNrcyA9IG9iamVjdC5fcHJvbWlzZUNhbGxiYWNrcztcblxuICBpZiAoIWNhbGxiYWNrcykge1xuICAgIGNhbGxiYWNrcyA9IG9iamVjdC5fcHJvbWlzZUNhbGxiYWNrcyA9IHt9O1xuICB9XG5cbiAgcmV0dXJuIGNhbGxiYWNrcztcbn1cblxuLyoqXG4gIEBjbGFzcyBSU1ZQLkV2ZW50VGFyZ2V0XG4qL1xudmFyIEV2ZW50VGFyZ2V0ID0ge1xuXG4gIC8qKlxuICAgIGBSU1ZQLkV2ZW50VGFyZ2V0Lm1peGluYCBleHRlbmRzIGFuIG9iamVjdCB3aXRoIEV2ZW50VGFyZ2V0IG1ldGhvZHMuIEZvclxuICAgIEV4YW1wbGU6XG4gICAgIGBgYGphdmFzY3JpcHRcbiAgICBsZXQgb2JqZWN0ID0ge307XG4gICAgIFJTVlAuRXZlbnRUYXJnZXQubWl4aW4ob2JqZWN0KTtcbiAgICAgb2JqZWN0Lm9uKCdmaW5pc2hlZCcsIGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgICAvLyBoYW5kbGUgZXZlbnRcbiAgICB9KTtcbiAgICAgb2JqZWN0LnRyaWdnZXIoJ2ZpbmlzaGVkJywgeyBkZXRhaWw6IHZhbHVlIH0pO1xuICAgIGBgYFxuICAgICBgRXZlbnRUYXJnZXQubWl4aW5gIGFsc28gd29ya3Mgd2l0aCBwcm90b3R5cGVzOlxuICAgICBgYGBqYXZhc2NyaXB0XG4gICAgbGV0IFBlcnNvbiA9IGZ1bmN0aW9uKCkge307XG4gICAgUlNWUC5FdmVudFRhcmdldC5taXhpbihQZXJzb24ucHJvdG90eXBlKTtcbiAgICAgbGV0IHllaHVkYSA9IG5ldyBQZXJzb24oKTtcbiAgICBsZXQgdG9tID0gbmV3IFBlcnNvbigpO1xuICAgICB5ZWh1ZGEub24oJ3Bva2UnLCBmdW5jdGlvbihldmVudCkge1xuICAgICAgY29uc29sZS5sb2coJ1llaHVkYSBzYXlzIE9XJyk7XG4gICAgfSk7XG4gICAgIHRvbS5vbigncG9rZScsIGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgICBjb25zb2xlLmxvZygnVG9tIHNheXMgT1cnKTtcbiAgICB9KTtcbiAgICAgeWVodWRhLnRyaWdnZXIoJ3Bva2UnKTtcbiAgICB0b20udHJpZ2dlcigncG9rZScpO1xuICAgIGBgYFxuICAgICBAbWV0aG9kIG1peGluXG4gICAgQGZvciBSU1ZQLkV2ZW50VGFyZ2V0XG4gICAgQHByaXZhdGVcbiAgICBAcGFyYW0ge09iamVjdH0gb2JqZWN0IG9iamVjdCB0byBleHRlbmQgd2l0aCBFdmVudFRhcmdldCBtZXRob2RzXG4gICovXG4gIG1peGluOiBmdW5jdGlvbiAob2JqZWN0KSB7XG4gICAgb2JqZWN0WydvbiddID0gdGhpc1snb24nXTtcbiAgICBvYmplY3RbJ29mZiddID0gdGhpc1snb2ZmJ107XG4gICAgb2JqZWN0Wyd0cmlnZ2VyJ10gPSB0aGlzWyd0cmlnZ2VyJ107XG4gICAgb2JqZWN0Ll9wcm9taXNlQ2FsbGJhY2tzID0gdW5kZWZpbmVkO1xuICAgIHJldHVybiBvYmplY3Q7XG4gIH0sXG5cblxuICAvKipcbiAgICBSZWdpc3RlcnMgYSBjYWxsYmFjayB0byBiZSBleGVjdXRlZCB3aGVuIGBldmVudE5hbWVgIGlzIHRyaWdnZXJlZFxuICAgICBgYGBqYXZhc2NyaXB0XG4gICAgb2JqZWN0Lm9uKCdldmVudCcsIGZ1bmN0aW9uKGV2ZW50SW5mbyl7XG4gICAgICAvLyBoYW5kbGUgdGhlIGV2ZW50XG4gICAgfSk7XG4gICAgIG9iamVjdC50cmlnZ2VyKCdldmVudCcpO1xuICAgIGBgYFxuICAgICBAbWV0aG9kIG9uXG4gICAgQGZvciBSU1ZQLkV2ZW50VGFyZ2V0XG4gICAgQHByaXZhdGVcbiAgICBAcGFyYW0ge1N0cmluZ30gZXZlbnROYW1lIG5hbWUgb2YgdGhlIGV2ZW50IHRvIGxpc3RlbiBmb3JcbiAgICBAcGFyYW0ge0Z1bmN0aW9ufSBjYWxsYmFjayBmdW5jdGlvbiB0byBiZSBjYWxsZWQgd2hlbiB0aGUgZXZlbnQgaXMgdHJpZ2dlcmVkLlxuICAqL1xuICBvbjogZnVuY3Rpb24gKGV2ZW50TmFtZSwgY2FsbGJhY2spIHtcbiAgICBpZiAodHlwZW9mIGNhbGxiYWNrICE9PSAnZnVuY3Rpb24nKSB7XG4gICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdDYWxsYmFjayBtdXN0IGJlIGEgZnVuY3Rpb24nKTtcbiAgICB9XG5cbiAgICB2YXIgYWxsQ2FsbGJhY2tzID0gY2FsbGJhY2tzRm9yKHRoaXMpLFxuICAgICAgICBjYWxsYmFja3MgPSB2b2lkIDA7XG5cbiAgICBjYWxsYmFja3MgPSBhbGxDYWxsYmFja3NbZXZlbnROYW1lXTtcblxuICAgIGlmICghY2FsbGJhY2tzKSB7XG4gICAgICBjYWxsYmFja3MgPSBhbGxDYWxsYmFja3NbZXZlbnROYW1lXSA9IFtdO1xuICAgIH1cblxuICAgIGlmIChpbmRleE9mKGNhbGxiYWNrcywgY2FsbGJhY2spID09PSAtMSkge1xuICAgICAgY2FsbGJhY2tzLnB1c2goY2FsbGJhY2spO1xuICAgIH1cbiAgfSxcblxuXG4gIC8qKlxuICAgIFlvdSBjYW4gdXNlIGBvZmZgIHRvIHN0b3AgZmlyaW5nIGEgcGFydGljdWxhciBjYWxsYmFjayBmb3IgYW4gZXZlbnQ6XG4gICAgIGBgYGphdmFzY3JpcHRcbiAgICBmdW5jdGlvbiBkb1N0dWZmKCkgeyAvLyBkbyBzdHVmZiEgfVxuICAgIG9iamVjdC5vbignc3R1ZmYnLCBkb1N0dWZmKTtcbiAgICAgb2JqZWN0LnRyaWdnZXIoJ3N0dWZmJyk7IC8vIGRvU3R1ZmYgd2lsbCBiZSBjYWxsZWRcbiAgICAgLy8gVW5yZWdpc3RlciBPTkxZIHRoZSBkb1N0dWZmIGNhbGxiYWNrXG4gICAgb2JqZWN0Lm9mZignc3R1ZmYnLCBkb1N0dWZmKTtcbiAgICBvYmplY3QudHJpZ2dlcignc3R1ZmYnKTsgLy8gZG9TdHVmZiB3aWxsIE5PVCBiZSBjYWxsZWRcbiAgICBgYGBcbiAgICAgSWYgeW91IGRvbid0IHBhc3MgYSBgY2FsbGJhY2tgIGFyZ3VtZW50IHRvIGBvZmZgLCBBTEwgY2FsbGJhY2tzIGZvciB0aGVcbiAgICBldmVudCB3aWxsIG5vdCBiZSBleGVjdXRlZCB3aGVuIHRoZSBldmVudCBmaXJlcy4gRm9yIGV4YW1wbGU6XG4gICAgIGBgYGphdmFzY3JpcHRcbiAgICBsZXQgY2FsbGJhY2sxID0gZnVuY3Rpb24oKXt9O1xuICAgIGxldCBjYWxsYmFjazIgPSBmdW5jdGlvbigpe307XG4gICAgIG9iamVjdC5vbignc3R1ZmYnLCBjYWxsYmFjazEpO1xuICAgIG9iamVjdC5vbignc3R1ZmYnLCBjYWxsYmFjazIpO1xuICAgICBvYmplY3QudHJpZ2dlcignc3R1ZmYnKTsgLy8gY2FsbGJhY2sxIGFuZCBjYWxsYmFjazIgd2lsbCBiZSBleGVjdXRlZC5cbiAgICAgb2JqZWN0Lm9mZignc3R1ZmYnKTtcbiAgICBvYmplY3QudHJpZ2dlcignc3R1ZmYnKTsgLy8gY2FsbGJhY2sxIGFuZCBjYWxsYmFjazIgd2lsbCBub3QgYmUgZXhlY3V0ZWQhXG4gICAgYGBgXG4gICAgIEBtZXRob2Qgb2ZmXG4gICAgQGZvciBSU1ZQLkV2ZW50VGFyZ2V0XG4gICAgQHByaXZhdGVcbiAgICBAcGFyYW0ge1N0cmluZ30gZXZlbnROYW1lIGV2ZW50IHRvIHN0b3AgbGlzdGVuaW5nIHRvXG4gICAgQHBhcmFtIHtGdW5jdGlvbn0gY2FsbGJhY2sgb3B0aW9uYWwgYXJndW1lbnQuIElmIGdpdmVuLCBvbmx5IHRoZSBmdW5jdGlvblxuICAgIGdpdmVuIHdpbGwgYmUgcmVtb3ZlZCBmcm9tIHRoZSBldmVudCdzIGNhbGxiYWNrIHF1ZXVlLiBJZiBubyBgY2FsbGJhY2tgXG4gICAgYXJndW1lbnQgaXMgZ2l2ZW4sIGFsbCBjYWxsYmFja3Mgd2lsbCBiZSByZW1vdmVkIGZyb20gdGhlIGV2ZW50J3MgY2FsbGJhY2tcbiAgICBxdWV1ZS5cbiAgKi9cbiAgb2ZmOiBmdW5jdGlvbiAoZXZlbnROYW1lLCBjYWxsYmFjaykge1xuICAgIHZhciBhbGxDYWxsYmFja3MgPSBjYWxsYmFja3NGb3IodGhpcyksXG4gICAgICAgIGNhbGxiYWNrcyA9IHZvaWQgMCxcbiAgICAgICAgaW5kZXggPSB2b2lkIDA7XG5cbiAgICBpZiAoIWNhbGxiYWNrKSB7XG4gICAgICBhbGxDYWxsYmFja3NbZXZlbnROYW1lXSA9IFtdO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGNhbGxiYWNrcyA9IGFsbENhbGxiYWNrc1tldmVudE5hbWVdO1xuXG4gICAgaW5kZXggPSBpbmRleE9mKGNhbGxiYWNrcywgY2FsbGJhY2spO1xuXG4gICAgaWYgKGluZGV4ICE9PSAtMSkge1xuICAgICAgY2FsbGJhY2tzLnNwbGljZShpbmRleCwgMSk7XG4gICAgfVxuICB9LFxuXG5cbiAgLyoqXG4gICAgVXNlIGB0cmlnZ2VyYCB0byBmaXJlIGN1c3RvbSBldmVudHMuIEZvciBleGFtcGxlOlxuICAgICBgYGBqYXZhc2NyaXB0XG4gICAgb2JqZWN0Lm9uKCdmb28nLCBmdW5jdGlvbigpe1xuICAgICAgY29uc29sZS5sb2coJ2ZvbyBldmVudCBoYXBwZW5lZCEnKTtcbiAgICB9KTtcbiAgICBvYmplY3QudHJpZ2dlcignZm9vJyk7XG4gICAgLy8gJ2ZvbyBldmVudCBoYXBwZW5lZCEnIGxvZ2dlZCB0byB0aGUgY29uc29sZVxuICAgIGBgYFxuICAgICBZb3UgY2FuIGFsc28gcGFzcyBhIHZhbHVlIGFzIGEgc2Vjb25kIGFyZ3VtZW50IHRvIGB0cmlnZ2VyYCB0aGF0IHdpbGwgYmVcbiAgICBwYXNzZWQgYXMgYW4gYXJndW1lbnQgdG8gYWxsIGV2ZW50IGxpc3RlbmVycyBmb3IgdGhlIGV2ZW50OlxuICAgICBgYGBqYXZhc2NyaXB0XG4gICAgb2JqZWN0Lm9uKCdmb28nLCBmdW5jdGlvbih2YWx1ZSl7XG4gICAgICBjb25zb2xlLmxvZyh2YWx1ZS5uYW1lKTtcbiAgICB9KTtcbiAgICAgb2JqZWN0LnRyaWdnZXIoJ2ZvbycsIHsgbmFtZTogJ2JhcicgfSk7XG4gICAgLy8gJ2JhcicgbG9nZ2VkIHRvIHRoZSBjb25zb2xlXG4gICAgYGBgXG4gICAgIEBtZXRob2QgdHJpZ2dlclxuICAgIEBmb3IgUlNWUC5FdmVudFRhcmdldFxuICAgIEBwcml2YXRlXG4gICAgQHBhcmFtIHtTdHJpbmd9IGV2ZW50TmFtZSBuYW1lIG9mIHRoZSBldmVudCB0byBiZSB0cmlnZ2VyZWRcbiAgICBAcGFyYW0geyp9IG9wdGlvbnMgb3B0aW9uYWwgdmFsdWUgdG8gYmUgcGFzc2VkIHRvIGFueSBldmVudCBoYW5kbGVycyBmb3JcbiAgICB0aGUgZ2l2ZW4gYGV2ZW50TmFtZWBcbiAgKi9cbiAgdHJpZ2dlcjogZnVuY3Rpb24gKGV2ZW50TmFtZSwgb3B0aW9ucywgbGFiZWwpIHtcbiAgICB2YXIgYWxsQ2FsbGJhY2tzID0gY2FsbGJhY2tzRm9yKHRoaXMpLFxuICAgICAgICBjYWxsYmFja3MgPSB2b2lkIDAsXG4gICAgICAgIGNhbGxiYWNrID0gdm9pZCAwO1xuXG4gICAgaWYgKGNhbGxiYWNrcyA9IGFsbENhbGxiYWNrc1tldmVudE5hbWVdKSB7XG4gICAgICAvLyBEb24ndCBjYWNoZSB0aGUgY2FsbGJhY2tzLmxlbmd0aCBzaW5jZSBpdCBtYXkgZ3Jvd1xuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBjYWxsYmFja3MubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgY2FsbGJhY2sgPSBjYWxsYmFja3NbaV07XG5cbiAgICAgICAgY2FsbGJhY2sob3B0aW9ucywgbGFiZWwpO1xuICAgICAgfVxuICAgIH1cbiAgfVxufTtcblxudmFyIGNvbmZpZyA9IHtcbiAgaW5zdHJ1bWVudDogZmFsc2Vcbn07XG5cbkV2ZW50VGFyZ2V0WydtaXhpbiddKGNvbmZpZyk7XG5cbmZ1bmN0aW9uIGNvbmZpZ3VyZShuYW1lLCB2YWx1ZSkge1xuICBpZiAoYXJndW1lbnRzLmxlbmd0aCA9PT0gMikge1xuICAgIGNvbmZpZ1tuYW1lXSA9IHZhbHVlO1xuICB9IGVsc2Uge1xuICAgIHJldHVybiBjb25maWdbbmFtZV07XG4gIH1cbn1cblxuZnVuY3Rpb24gb2JqZWN0T3JGdW5jdGlvbih4KSB7XG4gIHZhciB0eXBlID0gdHlwZW9mIHg7XG4gIHJldHVybiB4ICE9PSBudWxsICYmICh0eXBlID09PSAnb2JqZWN0JyB8fCB0eXBlID09PSAnZnVuY3Rpb24nKTtcbn1cblxuZnVuY3Rpb24gaXNGdW5jdGlvbih4KSB7XG4gIHJldHVybiB0eXBlb2YgeCA9PT0gJ2Z1bmN0aW9uJztcbn1cblxuZnVuY3Rpb24gaXNPYmplY3QoeCkge1xuICByZXR1cm4geCAhPT0gbnVsbCAmJiB0eXBlb2YgeCA9PT0gJ29iamVjdCc7XG59XG5cbmZ1bmN0aW9uIGlzTWF5YmVUaGVuYWJsZSh4KSB7XG4gIHJldHVybiB4ICE9PSBudWxsICYmIHR5cGVvZiB4ID09PSAnb2JqZWN0Jztcbn1cblxudmFyIF9pc0FycmF5ID0gdm9pZCAwO1xuaWYgKEFycmF5LmlzQXJyYXkpIHtcbiAgX2lzQXJyYXkgPSBBcnJheS5pc0FycmF5O1xufSBlbHNlIHtcbiAgX2lzQXJyYXkgPSBmdW5jdGlvbiAoeCkge1xuICAgIHJldHVybiBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwoeCkgPT09ICdbb2JqZWN0IEFycmF5XSc7XG4gIH07XG59XG5cbnZhciBpc0FycmF5ID0gX2lzQXJyYXk7XG5cbi8vIERhdGUubm93IGlzIG5vdCBhdmFpbGFibGUgaW4gYnJvd3NlcnMgPCBJRTlcbi8vIGh0dHBzOi8vZGV2ZWxvcGVyLm1vemlsbGEub3JnL2VuLVVTL2RvY3MvV2ViL0phdmFTY3JpcHQvUmVmZXJlbmNlL0dsb2JhbF9PYmplY3RzL0RhdGUvbm93I0NvbXBhdGliaWxpdHlcbnZhciBub3cgPSBEYXRlLm5vdyB8fCBmdW5jdGlvbiAoKSB7XG4gIHJldHVybiBuZXcgRGF0ZSgpLmdldFRpbWUoKTtcbn07XG5cbnZhciBxdWV1ZSA9IFtdO1xuXG5mdW5jdGlvbiBzY2hlZHVsZUZsdXNoKCkge1xuICBzZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IHF1ZXVlLmxlbmd0aDsgaSsrKSB7XG4gICAgICB2YXIgZW50cnkgPSBxdWV1ZVtpXTtcblxuICAgICAgdmFyIHBheWxvYWQgPSBlbnRyeS5wYXlsb2FkO1xuXG4gICAgICBwYXlsb2FkLmd1aWQgPSBwYXlsb2FkLmtleSArIHBheWxvYWQuaWQ7XG4gICAgICBwYXlsb2FkLmNoaWxkR3VpZCA9IHBheWxvYWQua2V5ICsgcGF5bG9hZC5jaGlsZElkO1xuICAgICAgaWYgKHBheWxvYWQuZXJyb3IpIHtcbiAgICAgICAgcGF5bG9hZC5zdGFjayA9IHBheWxvYWQuZXJyb3Iuc3RhY2s7XG4gICAgICB9XG5cbiAgICAgIGNvbmZpZ1sndHJpZ2dlciddKGVudHJ5Lm5hbWUsIGVudHJ5LnBheWxvYWQpO1xuICAgIH1cbiAgICBxdWV1ZS5sZW5ndGggPSAwO1xuICB9LCA1MCk7XG59XG5cbmZ1bmN0aW9uIGluc3RydW1lbnQoZXZlbnROYW1lLCBwcm9taXNlLCBjaGlsZCkge1xuICBpZiAoMSA9PT0gcXVldWUucHVzaCh7XG4gICAgbmFtZTogZXZlbnROYW1lLFxuICAgIHBheWxvYWQ6IHtcbiAgICAgIGtleTogcHJvbWlzZS5fZ3VpZEtleSxcbiAgICAgIGlkOiBwcm9taXNlLl9pZCxcbiAgICAgIGV2ZW50TmFtZTogZXZlbnROYW1lLFxuICAgICAgZGV0YWlsOiBwcm9taXNlLl9yZXN1bHQsXG4gICAgICBjaGlsZElkOiBjaGlsZCAmJiBjaGlsZC5faWQsXG4gICAgICBsYWJlbDogcHJvbWlzZS5fbGFiZWwsXG4gICAgICB0aW1lU3RhbXA6IG5vdygpLFxuICAgICAgZXJyb3I6IGNvbmZpZ1tcImluc3RydW1lbnQtd2l0aC1zdGFja1wiXSA/IG5ldyBFcnJvcihwcm9taXNlLl9sYWJlbCkgOiBudWxsXG4gICAgfSB9KSkge1xuICAgIHNjaGVkdWxlRmx1c2goKTtcbiAgfVxufVxuXG4vKipcbiAgYFJTVlAuUHJvbWlzZS5yZXNvbHZlYCByZXR1cm5zIGEgcHJvbWlzZSB0aGF0IHdpbGwgYmVjb21lIHJlc29sdmVkIHdpdGggdGhlXG4gIHBhc3NlZCBgdmFsdWVgLiBJdCBpcyBzaG9ydGhhbmQgZm9yIHRoZSBmb2xsb3dpbmc6XG5cbiAgYGBgamF2YXNjcmlwdFxuICBsZXQgcHJvbWlzZSA9IG5ldyBSU1ZQLlByb21pc2UoZnVuY3Rpb24ocmVzb2x2ZSwgcmVqZWN0KXtcbiAgICByZXNvbHZlKDEpO1xuICB9KTtcblxuICBwcm9taXNlLnRoZW4oZnVuY3Rpb24odmFsdWUpe1xuICAgIC8vIHZhbHVlID09PSAxXG4gIH0pO1xuICBgYGBcblxuICBJbnN0ZWFkIG9mIHdyaXRpbmcgdGhlIGFib3ZlLCB5b3VyIGNvZGUgbm93IHNpbXBseSBiZWNvbWVzIHRoZSBmb2xsb3dpbmc6XG5cbiAgYGBgamF2YXNjcmlwdFxuICBsZXQgcHJvbWlzZSA9IFJTVlAuUHJvbWlzZS5yZXNvbHZlKDEpO1xuXG4gIHByb21pc2UudGhlbihmdW5jdGlvbih2YWx1ZSl7XG4gICAgLy8gdmFsdWUgPT09IDFcbiAgfSk7XG4gIGBgYFxuXG4gIEBtZXRob2QgcmVzb2x2ZVxuICBAc3RhdGljXG4gIEBwYXJhbSB7Kn0gb2JqZWN0IHZhbHVlIHRoYXQgdGhlIHJldHVybmVkIHByb21pc2Ugd2lsbCBiZSByZXNvbHZlZCB3aXRoXG4gIEBwYXJhbSB7U3RyaW5nfSBsYWJlbCBvcHRpb25hbCBzdHJpbmcgZm9yIGlkZW50aWZ5aW5nIHRoZSByZXR1cm5lZCBwcm9taXNlLlxuICBVc2VmdWwgZm9yIHRvb2xpbmcuXG4gIEByZXR1cm4ge1Byb21pc2V9IGEgcHJvbWlzZSB0aGF0IHdpbGwgYmVjb21lIGZ1bGZpbGxlZCB3aXRoIHRoZSBnaXZlblxuICBgdmFsdWVgXG4qL1xuZnVuY3Rpb24gcmVzb2x2ZSQxKG9iamVjdCwgbGFiZWwpIHtcbiAgLypqc2hpbnQgdmFsaWR0aGlzOnRydWUgKi9cbiAgdmFyIENvbnN0cnVjdG9yID0gdGhpcztcblxuICBpZiAob2JqZWN0ICYmIHR5cGVvZiBvYmplY3QgPT09ICdvYmplY3QnICYmIG9iamVjdC5jb25zdHJ1Y3RvciA9PT0gQ29uc3RydWN0b3IpIHtcbiAgICByZXR1cm4gb2JqZWN0O1xuICB9XG5cbiAgdmFyIHByb21pc2UgPSBuZXcgQ29uc3RydWN0b3Iobm9vcCwgbGFiZWwpO1xuICByZXNvbHZlKHByb21pc2UsIG9iamVjdCk7XG4gIHJldHVybiBwcm9taXNlO1xufVxuXG5mdW5jdGlvbiB3aXRoT3duUHJvbWlzZSgpIHtcbiAgcmV0dXJuIG5ldyBUeXBlRXJyb3IoJ0EgcHJvbWlzZXMgY2FsbGJhY2sgY2Fubm90IHJldHVybiB0aGF0IHNhbWUgcHJvbWlzZS4nKTtcbn1cblxuZnVuY3Rpb24gbm9vcCgpIHt9XG5cbnZhciBQRU5ESU5HID0gdm9pZCAwO1xudmFyIEZVTEZJTExFRCA9IDE7XG52YXIgUkVKRUNURUQgPSAyO1xuXG52YXIgR0VUX1RIRU5fRVJST1IgPSBuZXcgRXJyb3JPYmplY3QoKTtcblxuZnVuY3Rpb24gZ2V0VGhlbihwcm9taXNlKSB7XG4gIHRyeSB7XG4gICAgcmV0dXJuIHByb21pc2UudGhlbjtcbiAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICBHRVRfVEhFTl9FUlJPUi5lcnJvciA9IGVycm9yO1xuICAgIHJldHVybiBHRVRfVEhFTl9FUlJPUjtcbiAgfVxufVxuXG5mdW5jdGlvbiB0cnlUaGVuKHRoZW4kJDEsIHZhbHVlLCBmdWxmaWxsbWVudEhhbmRsZXIsIHJlamVjdGlvbkhhbmRsZXIpIHtcbiAgdHJ5IHtcbiAgICB0aGVuJCQxLmNhbGwodmFsdWUsIGZ1bGZpbGxtZW50SGFuZGxlciwgcmVqZWN0aW9uSGFuZGxlcik7XG4gIH0gY2F0Y2ggKGUpIHtcbiAgICByZXR1cm4gZTtcbiAgfVxufVxuXG5mdW5jdGlvbiBoYW5kbGVGb3JlaWduVGhlbmFibGUocHJvbWlzZSwgdGhlbmFibGUsIHRoZW4kJDEpIHtcbiAgY29uZmlnLmFzeW5jKGZ1bmN0aW9uIChwcm9taXNlKSB7XG4gICAgdmFyIHNlYWxlZCA9IGZhbHNlO1xuICAgIHZhciBlcnJvciA9IHRyeVRoZW4odGhlbiQkMSwgdGhlbmFibGUsIGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgICAgaWYgKHNlYWxlZCkge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICBzZWFsZWQgPSB0cnVlO1xuICAgICAgaWYgKHRoZW5hYmxlICE9PSB2YWx1ZSkge1xuICAgICAgICByZXNvbHZlKHByb21pc2UsIHZhbHVlLCB1bmRlZmluZWQpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgZnVsZmlsbChwcm9taXNlLCB2YWx1ZSk7XG4gICAgICB9XG4gICAgfSwgZnVuY3Rpb24gKHJlYXNvbikge1xuICAgICAgaWYgKHNlYWxlZCkge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICBzZWFsZWQgPSB0cnVlO1xuXG4gICAgICByZWplY3QocHJvbWlzZSwgcmVhc29uKTtcbiAgICB9LCAnU2V0dGxlOiAnICsgKHByb21pc2UuX2xhYmVsIHx8ICcgdW5rbm93biBwcm9taXNlJykpO1xuXG4gICAgaWYgKCFzZWFsZWQgJiYgZXJyb3IpIHtcbiAgICAgIHNlYWxlZCA9IHRydWU7XG4gICAgICByZWplY3QocHJvbWlzZSwgZXJyb3IpO1xuICAgIH1cbiAgfSwgcHJvbWlzZSk7XG59XG5cbmZ1bmN0aW9uIGhhbmRsZU93blRoZW5hYmxlKHByb21pc2UsIHRoZW5hYmxlKSB7XG4gIGlmICh0aGVuYWJsZS5fc3RhdGUgPT09IEZVTEZJTExFRCkge1xuICAgIGZ1bGZpbGwocHJvbWlzZSwgdGhlbmFibGUuX3Jlc3VsdCk7XG4gIH0gZWxzZSBpZiAodGhlbmFibGUuX3N0YXRlID09PSBSRUpFQ1RFRCkge1xuICAgIHRoZW5hYmxlLl9vbkVycm9yID0gbnVsbDtcbiAgICByZWplY3QocHJvbWlzZSwgdGhlbmFibGUuX3Jlc3VsdCk7XG4gIH0gZWxzZSB7XG4gICAgc3Vic2NyaWJlKHRoZW5hYmxlLCB1bmRlZmluZWQsIGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgICAgaWYgKHRoZW5hYmxlICE9PSB2YWx1ZSkge1xuICAgICAgICByZXNvbHZlKHByb21pc2UsIHZhbHVlLCB1bmRlZmluZWQpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgZnVsZmlsbChwcm9taXNlLCB2YWx1ZSk7XG4gICAgICB9XG4gICAgfSwgZnVuY3Rpb24gKHJlYXNvbikge1xuICAgICAgcmV0dXJuIHJlamVjdChwcm9taXNlLCByZWFzb24pO1xuICAgIH0pO1xuICB9XG59XG5cbmZ1bmN0aW9uIGhhbmRsZU1heWJlVGhlbmFibGUocHJvbWlzZSwgbWF5YmVUaGVuYWJsZSwgdGhlbiQkMSkge1xuICB2YXIgaXNPd25UaGVuYWJsZSA9IG1heWJlVGhlbmFibGUuY29uc3RydWN0b3IgPT09IHByb21pc2UuY29uc3RydWN0b3IgJiYgdGhlbiQkMSA9PT0gdGhlbiAmJiBwcm9taXNlLmNvbnN0cnVjdG9yLnJlc29sdmUgPT09IHJlc29sdmUkMTtcblxuICBpZiAoaXNPd25UaGVuYWJsZSkge1xuICAgIGhhbmRsZU93blRoZW5hYmxlKHByb21pc2UsIG1heWJlVGhlbmFibGUpO1xuICB9IGVsc2UgaWYgKHRoZW4kJDEgPT09IEdFVF9USEVOX0VSUk9SKSB7XG4gICAgcmVqZWN0KHByb21pc2UsIEdFVF9USEVOX0VSUk9SLmVycm9yKTtcbiAgICBHRVRfVEhFTl9FUlJPUi5lcnJvciA9IG51bGw7XG4gIH0gZWxzZSBpZiAoaXNGdW5jdGlvbih0aGVuJCQxKSkge1xuICAgIGhhbmRsZUZvcmVpZ25UaGVuYWJsZShwcm9taXNlLCBtYXliZVRoZW5hYmxlLCB0aGVuJCQxKTtcbiAgfSBlbHNlIHtcbiAgICBmdWxmaWxsKHByb21pc2UsIG1heWJlVGhlbmFibGUpO1xuICB9XG59XG5cbmZ1bmN0aW9uIHJlc29sdmUocHJvbWlzZSwgdmFsdWUpIHtcbiAgaWYgKHByb21pc2UgPT09IHZhbHVlKSB7XG4gICAgZnVsZmlsbChwcm9taXNlLCB2YWx1ZSk7XG4gIH0gZWxzZSBpZiAob2JqZWN0T3JGdW5jdGlvbih2YWx1ZSkpIHtcbiAgICBoYW5kbGVNYXliZVRoZW5hYmxlKHByb21pc2UsIHZhbHVlLCBnZXRUaGVuKHZhbHVlKSk7XG4gIH0gZWxzZSB7XG4gICAgZnVsZmlsbChwcm9taXNlLCB2YWx1ZSk7XG4gIH1cbn1cblxuZnVuY3Rpb24gcHVibGlzaFJlamVjdGlvbihwcm9taXNlKSB7XG4gIGlmIChwcm9taXNlLl9vbkVycm9yKSB7XG4gICAgcHJvbWlzZS5fb25FcnJvcihwcm9taXNlLl9yZXN1bHQpO1xuICB9XG5cbiAgcHVibGlzaChwcm9taXNlKTtcbn1cblxuZnVuY3Rpb24gZnVsZmlsbChwcm9taXNlLCB2YWx1ZSkge1xuICBpZiAocHJvbWlzZS5fc3RhdGUgIT09IFBFTkRJTkcpIHtcbiAgICByZXR1cm47XG4gIH1cblxuICBwcm9taXNlLl9yZXN1bHQgPSB2YWx1ZTtcbiAgcHJvbWlzZS5fc3RhdGUgPSBGVUxGSUxMRUQ7XG5cbiAgaWYgKHByb21pc2UuX3N1YnNjcmliZXJzLmxlbmd0aCA9PT0gMCkge1xuICAgIGlmIChjb25maWcuaW5zdHJ1bWVudCkge1xuICAgICAgaW5zdHJ1bWVudCgnZnVsZmlsbGVkJywgcHJvbWlzZSk7XG4gICAgfVxuICB9IGVsc2Uge1xuICAgIGNvbmZpZy5hc3luYyhwdWJsaXNoLCBwcm9taXNlKTtcbiAgfVxufVxuXG5mdW5jdGlvbiByZWplY3QocHJvbWlzZSwgcmVhc29uKSB7XG4gIGlmIChwcm9taXNlLl9zdGF0ZSAhPT0gUEVORElORykge1xuICAgIHJldHVybjtcbiAgfVxuICBwcm9taXNlLl9zdGF0ZSA9IFJFSkVDVEVEO1xuICBwcm9taXNlLl9yZXN1bHQgPSByZWFzb247XG4gIGNvbmZpZy5hc3luYyhwdWJsaXNoUmVqZWN0aW9uLCBwcm9taXNlKTtcbn1cblxuZnVuY3Rpb24gc3Vic2NyaWJlKHBhcmVudCwgY2hpbGQsIG9uRnVsZmlsbG1lbnQsIG9uUmVqZWN0aW9uKSB7XG4gIHZhciBzdWJzY3JpYmVycyA9IHBhcmVudC5fc3Vic2NyaWJlcnM7XG4gIHZhciBsZW5ndGggPSBzdWJzY3JpYmVycy5sZW5ndGg7XG5cbiAgcGFyZW50Ll9vbkVycm9yID0gbnVsbDtcblxuICBzdWJzY3JpYmVyc1tsZW5ndGhdID0gY2hpbGQ7XG4gIHN1YnNjcmliZXJzW2xlbmd0aCArIEZVTEZJTExFRF0gPSBvbkZ1bGZpbGxtZW50O1xuICBzdWJzY3JpYmVyc1tsZW5ndGggKyBSRUpFQ1RFRF0gPSBvblJlamVjdGlvbjtcblxuICBpZiAobGVuZ3RoID09PSAwICYmIHBhcmVudC5fc3RhdGUpIHtcbiAgICBjb25maWcuYXN5bmMocHVibGlzaCwgcGFyZW50KTtcbiAgfVxufVxuXG5mdW5jdGlvbiBwdWJsaXNoKHByb21pc2UpIHtcbiAgdmFyIHN1YnNjcmliZXJzID0gcHJvbWlzZS5fc3Vic2NyaWJlcnM7XG4gIHZhciBzZXR0bGVkID0gcHJvbWlzZS5fc3RhdGU7XG5cbiAgaWYgKGNvbmZpZy5pbnN0cnVtZW50KSB7XG4gICAgaW5zdHJ1bWVudChzZXR0bGVkID09PSBGVUxGSUxMRUQgPyAnZnVsZmlsbGVkJyA6ICdyZWplY3RlZCcsIHByb21pc2UpO1xuICB9XG5cbiAgaWYgKHN1YnNjcmliZXJzLmxlbmd0aCA9PT0gMCkge1xuICAgIHJldHVybjtcbiAgfVxuXG4gIHZhciBjaGlsZCA9IHZvaWQgMCxcbiAgICAgIGNhbGxiYWNrID0gdm9pZCAwLFxuICAgICAgcmVzdWx0ID0gcHJvbWlzZS5fcmVzdWx0O1xuXG4gIGZvciAodmFyIGkgPSAwOyBpIDwgc3Vic2NyaWJlcnMubGVuZ3RoOyBpICs9IDMpIHtcbiAgICBjaGlsZCA9IHN1YnNjcmliZXJzW2ldO1xuICAgIGNhbGxiYWNrID0gc3Vic2NyaWJlcnNbaSArIHNldHRsZWRdO1xuXG4gICAgaWYgKGNoaWxkKSB7XG4gICAgICBpbnZva2VDYWxsYmFjayhzZXR0bGVkLCBjaGlsZCwgY2FsbGJhY2ssIHJlc3VsdCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGNhbGxiYWNrKHJlc3VsdCk7XG4gICAgfVxuICB9XG5cbiAgcHJvbWlzZS5fc3Vic2NyaWJlcnMubGVuZ3RoID0gMDtcbn1cblxuZnVuY3Rpb24gRXJyb3JPYmplY3QoKSB7XG4gIHRoaXMuZXJyb3IgPSBudWxsO1xufVxuXG52YXIgVFJZX0NBVENIX0VSUk9SID0gbmV3IEVycm9yT2JqZWN0KCk7XG5cbmZ1bmN0aW9uIHRyeUNhdGNoKGNhbGxiYWNrLCByZXN1bHQpIHtcbiAgdHJ5IHtcbiAgICByZXR1cm4gY2FsbGJhY2socmVzdWx0KTtcbiAgfSBjYXRjaCAoZSkge1xuICAgIFRSWV9DQVRDSF9FUlJPUi5lcnJvciA9IGU7XG4gICAgcmV0dXJuIFRSWV9DQVRDSF9FUlJPUjtcbiAgfVxufVxuXG5mdW5jdGlvbiBpbnZva2VDYWxsYmFjayhzdGF0ZSwgcHJvbWlzZSwgY2FsbGJhY2ssIHJlc3VsdCkge1xuICB2YXIgaGFzQ2FsbGJhY2sgPSBpc0Z1bmN0aW9uKGNhbGxiYWNrKTtcbiAgdmFyIHZhbHVlID0gdm9pZCAwLFxuICAgICAgZXJyb3IgPSB2b2lkIDA7XG5cbiAgaWYgKGhhc0NhbGxiYWNrKSB7XG4gICAgdmFsdWUgPSB0cnlDYXRjaChjYWxsYmFjaywgcmVzdWx0KTtcblxuICAgIGlmICh2YWx1ZSA9PT0gVFJZX0NBVENIX0VSUk9SKSB7XG4gICAgICBlcnJvciA9IHZhbHVlLmVycm9yO1xuICAgICAgdmFsdWUuZXJyb3IgPSBudWxsOyAvLyByZWxlYXNlXG4gICAgfSBlbHNlIGlmICh2YWx1ZSA9PT0gcHJvbWlzZSkge1xuICAgICAgcmVqZWN0KHByb21pc2UsIHdpdGhPd25Qcm9taXNlKCkpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgfSBlbHNlIHtcbiAgICB2YWx1ZSA9IHJlc3VsdDtcbiAgfVxuXG4gIGlmIChwcm9taXNlLl9zdGF0ZSAhPT0gUEVORElORykge1xuICAgIC8vIG5vb3BcbiAgfSBlbHNlIGlmIChoYXNDYWxsYmFjayAmJiBlcnJvciA9PT0gdW5kZWZpbmVkKSB7XG4gICAgcmVzb2x2ZShwcm9taXNlLCB2YWx1ZSk7XG4gIH0gZWxzZSBpZiAoZXJyb3IgIT09IHVuZGVmaW5lZCkge1xuICAgIHJlamVjdChwcm9taXNlLCBlcnJvcik7XG4gIH0gZWxzZSBpZiAoc3RhdGUgPT09IEZVTEZJTExFRCkge1xuICAgIGZ1bGZpbGwocHJvbWlzZSwgdmFsdWUpO1xuICB9IGVsc2UgaWYgKHN0YXRlID09PSBSRUpFQ1RFRCkge1xuICAgIHJlamVjdChwcm9taXNlLCB2YWx1ZSk7XG4gIH1cbn1cblxuZnVuY3Rpb24gaW5pdGlhbGl6ZVByb21pc2UocHJvbWlzZSwgcmVzb2x2ZXIpIHtcbiAgdmFyIHJlc29sdmVkID0gZmFsc2U7XG4gIHRyeSB7XG4gICAgcmVzb2x2ZXIoZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgICBpZiAocmVzb2x2ZWQpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgcmVzb2x2ZWQgPSB0cnVlO1xuICAgICAgcmVzb2x2ZShwcm9taXNlLCB2YWx1ZSk7XG4gICAgfSwgZnVuY3Rpb24gKHJlYXNvbikge1xuICAgICAgaWYgKHJlc29sdmVkKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICAgIHJlc29sdmVkID0gdHJ1ZTtcbiAgICAgIHJlamVjdChwcm9taXNlLCByZWFzb24pO1xuICAgIH0pO1xuICB9IGNhdGNoIChlKSB7XG4gICAgcmVqZWN0KHByb21pc2UsIGUpO1xuICB9XG59XG5cbmZ1bmN0aW9uIHRoZW4ob25GdWxmaWxsbWVudCwgb25SZWplY3Rpb24sIGxhYmVsKSB7XG4gIHZhciBwYXJlbnQgPSB0aGlzO1xuICB2YXIgc3RhdGUgPSBwYXJlbnQuX3N0YXRlO1xuXG4gIGlmIChzdGF0ZSA9PT0gRlVMRklMTEVEICYmICFvbkZ1bGZpbGxtZW50IHx8IHN0YXRlID09PSBSRUpFQ1RFRCAmJiAhb25SZWplY3Rpb24pIHtcbiAgICBjb25maWcuaW5zdHJ1bWVudCAmJiBpbnN0cnVtZW50KCdjaGFpbmVkJywgcGFyZW50LCBwYXJlbnQpO1xuICAgIHJldHVybiBwYXJlbnQ7XG4gIH1cblxuICBwYXJlbnQuX29uRXJyb3IgPSBudWxsO1xuXG4gIHZhciBjaGlsZCA9IG5ldyBwYXJlbnQuY29uc3RydWN0b3Iobm9vcCwgbGFiZWwpO1xuICB2YXIgcmVzdWx0ID0gcGFyZW50Ll9yZXN1bHQ7XG5cbiAgY29uZmlnLmluc3RydW1lbnQgJiYgaW5zdHJ1bWVudCgnY2hhaW5lZCcsIHBhcmVudCwgY2hpbGQpO1xuXG4gIGlmIChzdGF0ZSA9PT0gUEVORElORykge1xuICAgIHN1YnNjcmliZShwYXJlbnQsIGNoaWxkLCBvbkZ1bGZpbGxtZW50LCBvblJlamVjdGlvbik7XG4gIH0gZWxzZSB7XG4gICAgdmFyIGNhbGxiYWNrID0gc3RhdGUgPT09IEZVTEZJTExFRCA/IG9uRnVsZmlsbG1lbnQgOiBvblJlamVjdGlvbjtcbiAgICBjb25maWcuYXN5bmMoZnVuY3Rpb24gKCkge1xuICAgICAgcmV0dXJuIGludm9rZUNhbGxiYWNrKHN0YXRlLCBjaGlsZCwgY2FsbGJhY2ssIHJlc3VsdCk7XG4gICAgfSk7XG4gIH1cblxuICByZXR1cm4gY2hpbGQ7XG59XG5cbnZhciBFbnVtZXJhdG9yID0gZnVuY3Rpb24gKCkge1xuICBmdW5jdGlvbiBFbnVtZXJhdG9yKENvbnN0cnVjdG9yLCBpbnB1dCwgYWJvcnRPblJlamVjdCwgbGFiZWwpIHtcbiAgICB0aGlzLl9pbnN0YW5jZUNvbnN0cnVjdG9yID0gQ29uc3RydWN0b3I7XG4gICAgdGhpcy5wcm9taXNlID0gbmV3IENvbnN0cnVjdG9yKG5vb3AsIGxhYmVsKTtcbiAgICB0aGlzLl9hYm9ydE9uUmVqZWN0ID0gYWJvcnRPblJlamVjdDtcblxuICAgIHRoaXMuX2luaXQuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgfVxuXG4gIEVudW1lcmF0b3IucHJvdG90eXBlLl9pbml0ID0gZnVuY3Rpb24gX2luaXQoQ29uc3RydWN0b3IsIGlucHV0KSB7XG4gICAgdmFyIGxlbiA9IGlucHV0Lmxlbmd0aCB8fCAwO1xuICAgIHRoaXMubGVuZ3RoID0gbGVuO1xuICAgIHRoaXMuX3JlbWFpbmluZyA9IGxlbjtcbiAgICB0aGlzLl9yZXN1bHQgPSBuZXcgQXJyYXkobGVuKTtcblxuICAgIHRoaXMuX2VudW1lcmF0ZShpbnB1dCk7XG4gICAgaWYgKHRoaXMuX3JlbWFpbmluZyA9PT0gMCkge1xuICAgICAgZnVsZmlsbCh0aGlzLnByb21pc2UsIHRoaXMuX3Jlc3VsdCk7XG4gICAgfVxuICB9O1xuXG4gIEVudW1lcmF0b3IucHJvdG90eXBlLl9lbnVtZXJhdGUgPSBmdW5jdGlvbiBfZW51bWVyYXRlKGlucHV0KSB7XG4gICAgdmFyIGxlbmd0aCA9IHRoaXMubGVuZ3RoO1xuICAgIHZhciBwcm9taXNlID0gdGhpcy5wcm9taXNlO1xuXG4gICAgZm9yICh2YXIgaSA9IDA7IHByb21pc2UuX3N0YXRlID09PSBQRU5ESU5HICYmIGkgPCBsZW5ndGg7IGkrKykge1xuICAgICAgdGhpcy5fZWFjaEVudHJ5KGlucHV0W2ldLCBpKTtcbiAgICB9XG4gIH07XG5cbiAgRW51bWVyYXRvci5wcm90b3R5cGUuX3NldHRsZU1heWJlVGhlbmFibGUgPSBmdW5jdGlvbiBfc2V0dGxlTWF5YmVUaGVuYWJsZShlbnRyeSwgaSkge1xuICAgIHZhciBjID0gdGhpcy5faW5zdGFuY2VDb25zdHJ1Y3RvcjtcbiAgICB2YXIgcmVzb2x2ZSQkMSA9IGMucmVzb2x2ZTtcblxuICAgIGlmIChyZXNvbHZlJCQxID09PSByZXNvbHZlJDEpIHtcbiAgICAgIHZhciB0aGVuJCQxID0gZ2V0VGhlbihlbnRyeSk7XG5cbiAgICAgIGlmICh0aGVuJCQxID09PSB0aGVuICYmIGVudHJ5Ll9zdGF0ZSAhPT0gUEVORElORykge1xuICAgICAgICBlbnRyeS5fb25FcnJvciA9IG51bGw7XG4gICAgICAgIHRoaXMuX3NldHRsZWRBdChlbnRyeS5fc3RhdGUsIGksIGVudHJ5Ll9yZXN1bHQpO1xuICAgICAgfSBlbHNlIGlmICh0eXBlb2YgdGhlbiQkMSAhPT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICB0aGlzLl9yZW1haW5pbmctLTtcbiAgICAgICAgdGhpcy5fcmVzdWx0W2ldID0gdGhpcy5fbWFrZVJlc3VsdChGVUxGSUxMRUQsIGksIGVudHJ5KTtcbiAgICAgIH0gZWxzZSBpZiAoYyA9PT0gUHJvbWlzZSkge1xuICAgICAgICB2YXIgcHJvbWlzZSA9IG5ldyBjKG5vb3ApO1xuICAgICAgICBoYW5kbGVNYXliZVRoZW5hYmxlKHByb21pc2UsIGVudHJ5LCB0aGVuJCQxKTtcbiAgICAgICAgdGhpcy5fd2lsbFNldHRsZUF0KHByb21pc2UsIGkpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5fd2lsbFNldHRsZUF0KG5ldyBjKGZ1bmN0aW9uIChyZXNvbHZlJCQxKSB7XG4gICAgICAgICAgcmV0dXJuIHJlc29sdmUkJDEoZW50cnkpO1xuICAgICAgICB9KSwgaSk7XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuX3dpbGxTZXR0bGVBdChyZXNvbHZlJCQxKGVudHJ5KSwgaSk7XG4gICAgfVxuICB9O1xuXG4gIEVudW1lcmF0b3IucHJvdG90eXBlLl9lYWNoRW50cnkgPSBmdW5jdGlvbiBfZWFjaEVudHJ5KGVudHJ5LCBpKSB7XG4gICAgaWYgKGlzTWF5YmVUaGVuYWJsZShlbnRyeSkpIHtcbiAgICAgIHRoaXMuX3NldHRsZU1heWJlVGhlbmFibGUoZW50cnksIGkpO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLl9yZW1haW5pbmctLTtcbiAgICAgIHRoaXMuX3Jlc3VsdFtpXSA9IHRoaXMuX21ha2VSZXN1bHQoRlVMRklMTEVELCBpLCBlbnRyeSk7XG4gICAgfVxuICB9O1xuXG4gIEVudW1lcmF0b3IucHJvdG90eXBlLl9zZXR0bGVkQXQgPSBmdW5jdGlvbiBfc2V0dGxlZEF0KHN0YXRlLCBpLCB2YWx1ZSkge1xuICAgIHZhciBwcm9taXNlID0gdGhpcy5wcm9taXNlO1xuXG4gICAgaWYgKHByb21pc2UuX3N0YXRlID09PSBQRU5ESU5HKSB7XG4gICAgICBpZiAodGhpcy5fYWJvcnRPblJlamVjdCAmJiBzdGF0ZSA9PT0gUkVKRUNURUQpIHtcbiAgICAgICAgcmVqZWN0KHByb21pc2UsIHZhbHVlKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMuX3JlbWFpbmluZy0tO1xuICAgICAgICB0aGlzLl9yZXN1bHRbaV0gPSB0aGlzLl9tYWtlUmVzdWx0KHN0YXRlLCBpLCB2YWx1ZSk7XG4gICAgICAgIGlmICh0aGlzLl9yZW1haW5pbmcgPT09IDApIHtcbiAgICAgICAgICBmdWxmaWxsKHByb21pc2UsIHRoaXMuX3Jlc3VsdCk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH07XG5cbiAgRW51bWVyYXRvci5wcm90b3R5cGUuX21ha2VSZXN1bHQgPSBmdW5jdGlvbiBfbWFrZVJlc3VsdChzdGF0ZSwgaSwgdmFsdWUpIHtcbiAgICByZXR1cm4gdmFsdWU7XG4gIH07XG5cbiAgRW51bWVyYXRvci5wcm90b3R5cGUuX3dpbGxTZXR0bGVBdCA9IGZ1bmN0aW9uIF93aWxsU2V0dGxlQXQocHJvbWlzZSwgaSkge1xuICAgIHZhciBlbnVtZXJhdG9yID0gdGhpcztcblxuICAgIHN1YnNjcmliZShwcm9taXNlLCB1bmRlZmluZWQsIGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgICAgcmV0dXJuIGVudW1lcmF0b3IuX3NldHRsZWRBdChGVUxGSUxMRUQsIGksIHZhbHVlKTtcbiAgICB9LCBmdW5jdGlvbiAocmVhc29uKSB7XG4gICAgICByZXR1cm4gZW51bWVyYXRvci5fc2V0dGxlZEF0KFJFSkVDVEVELCBpLCByZWFzb24pO1xuICAgIH0pO1xuICB9O1xuXG4gIHJldHVybiBFbnVtZXJhdG9yO1xufSgpO1xuXG5mdW5jdGlvbiBtYWtlU2V0dGxlZFJlc3VsdChzdGF0ZSwgcG9zaXRpb24sIHZhbHVlKSB7XG4gIGlmIChzdGF0ZSA9PT0gRlVMRklMTEVEKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIHN0YXRlOiAnZnVsZmlsbGVkJyxcbiAgICAgIHZhbHVlOiB2YWx1ZVxuICAgIH07XG4gIH0gZWxzZSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIHN0YXRlOiAncmVqZWN0ZWQnLFxuICAgICAgcmVhc29uOiB2YWx1ZVxuICAgIH07XG4gIH1cbn1cblxuLyoqXG4gIGBSU1ZQLlByb21pc2UuYWxsYCBhY2NlcHRzIGFuIGFycmF5IG9mIHByb21pc2VzLCBhbmQgcmV0dXJucyBhIG5ldyBwcm9taXNlIHdoaWNoXG4gIGlzIGZ1bGZpbGxlZCB3aXRoIGFuIGFycmF5IG9mIGZ1bGZpbGxtZW50IHZhbHVlcyBmb3IgdGhlIHBhc3NlZCBwcm9taXNlcywgb3JcbiAgcmVqZWN0ZWQgd2l0aCB0aGUgcmVhc29uIG9mIHRoZSBmaXJzdCBwYXNzZWQgcHJvbWlzZSB0byBiZSByZWplY3RlZC4gSXQgY2FzdHMgYWxsXG4gIGVsZW1lbnRzIG9mIHRoZSBwYXNzZWQgaXRlcmFibGUgdG8gcHJvbWlzZXMgYXMgaXQgcnVucyB0aGlzIGFsZ29yaXRobS5cblxuICBFeGFtcGxlOlxuXG4gIGBgYGphdmFzY3JpcHRcbiAgbGV0IHByb21pc2UxID0gUlNWUC5yZXNvbHZlKDEpO1xuICBsZXQgcHJvbWlzZTIgPSBSU1ZQLnJlc29sdmUoMik7XG4gIGxldCBwcm9taXNlMyA9IFJTVlAucmVzb2x2ZSgzKTtcbiAgbGV0IHByb21pc2VzID0gWyBwcm9taXNlMSwgcHJvbWlzZTIsIHByb21pc2UzIF07XG5cbiAgUlNWUC5Qcm9taXNlLmFsbChwcm9taXNlcykudGhlbihmdW5jdGlvbihhcnJheSl7XG4gICAgLy8gVGhlIGFycmF5IGhlcmUgd291bGQgYmUgWyAxLCAyLCAzIF07XG4gIH0pO1xuICBgYGBcblxuICBJZiBhbnkgb2YgdGhlIGBwcm9taXNlc2AgZ2l2ZW4gdG8gYFJTVlAuYWxsYCBhcmUgcmVqZWN0ZWQsIHRoZSBmaXJzdCBwcm9taXNlXG4gIHRoYXQgaXMgcmVqZWN0ZWQgd2lsbCBiZSBnaXZlbiBhcyBhbiBhcmd1bWVudCB0byB0aGUgcmV0dXJuZWQgcHJvbWlzZXMnc1xuICByZWplY3Rpb24gaGFuZGxlci4gRm9yIGV4YW1wbGU6XG5cbiAgRXhhbXBsZTpcblxuICBgYGBqYXZhc2NyaXB0XG4gIGxldCBwcm9taXNlMSA9IFJTVlAucmVzb2x2ZSgxKTtcbiAgbGV0IHByb21pc2UyID0gUlNWUC5yZWplY3QobmV3IEVycm9yKFwiMlwiKSk7XG4gIGxldCBwcm9taXNlMyA9IFJTVlAucmVqZWN0KG5ldyBFcnJvcihcIjNcIikpO1xuICBsZXQgcHJvbWlzZXMgPSBbIHByb21pc2UxLCBwcm9taXNlMiwgcHJvbWlzZTMgXTtcblxuICBSU1ZQLlByb21pc2UuYWxsKHByb21pc2VzKS50aGVuKGZ1bmN0aW9uKGFycmF5KXtcbiAgICAvLyBDb2RlIGhlcmUgbmV2ZXIgcnVucyBiZWNhdXNlIHRoZXJlIGFyZSByZWplY3RlZCBwcm9taXNlcyFcbiAgfSwgZnVuY3Rpb24oZXJyb3IpIHtcbiAgICAvLyBlcnJvci5tZXNzYWdlID09PSBcIjJcIlxuICB9KTtcbiAgYGBgXG5cbiAgQG1ldGhvZCBhbGxcbiAgQHN0YXRpY1xuICBAcGFyYW0ge0FycmF5fSBlbnRyaWVzIGFycmF5IG9mIHByb21pc2VzXG4gIEBwYXJhbSB7U3RyaW5nfSBsYWJlbCBvcHRpb25hbCBzdHJpbmcgZm9yIGxhYmVsaW5nIHRoZSBwcm9taXNlLlxuICBVc2VmdWwgZm9yIHRvb2xpbmcuXG4gIEByZXR1cm4ge1Byb21pc2V9IHByb21pc2UgdGhhdCBpcyBmdWxmaWxsZWQgd2hlbiBhbGwgYHByb21pc2VzYCBoYXZlIGJlZW5cbiAgZnVsZmlsbGVkLCBvciByZWplY3RlZCBpZiBhbnkgb2YgdGhlbSBiZWNvbWUgcmVqZWN0ZWQuXG4gIEBzdGF0aWNcbiovXG5mdW5jdGlvbiBhbGwoZW50cmllcywgbGFiZWwpIHtcbiAgaWYgKCFpc0FycmF5KGVudHJpZXMpKSB7XG4gICAgcmV0dXJuIHRoaXMucmVqZWN0KG5ldyBUeXBlRXJyb3IoXCJQcm9taXNlLmFsbCBtdXN0IGJlIGNhbGxlZCB3aXRoIGFuIGFycmF5XCIpLCBsYWJlbCk7XG4gIH1cbiAgcmV0dXJuIG5ldyBFbnVtZXJhdG9yKHRoaXMsIGVudHJpZXMsIHRydWUgLyogYWJvcnQgb24gcmVqZWN0ICovLCBsYWJlbCkucHJvbWlzZTtcbn1cblxuLyoqXG4gIGBSU1ZQLlByb21pc2UucmFjZWAgcmV0dXJucyBhIG5ldyBwcm9taXNlIHdoaWNoIGlzIHNldHRsZWQgaW4gdGhlIHNhbWUgd2F5IGFzIHRoZVxuICBmaXJzdCBwYXNzZWQgcHJvbWlzZSB0byBzZXR0bGUuXG5cbiAgRXhhbXBsZTpcblxuICBgYGBqYXZhc2NyaXB0XG4gIGxldCBwcm9taXNlMSA9IG5ldyBSU1ZQLlByb21pc2UoZnVuY3Rpb24ocmVzb2x2ZSwgcmVqZWN0KXtcbiAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCl7XG4gICAgICByZXNvbHZlKCdwcm9taXNlIDEnKTtcbiAgICB9LCAyMDApO1xuICB9KTtcblxuICBsZXQgcHJvbWlzZTIgPSBuZXcgUlNWUC5Qcm9taXNlKGZ1bmN0aW9uKHJlc29sdmUsIHJlamVjdCl7XG4gICAgc2V0VGltZW91dChmdW5jdGlvbigpe1xuICAgICAgcmVzb2x2ZSgncHJvbWlzZSAyJyk7XG4gICAgfSwgMTAwKTtcbiAgfSk7XG5cbiAgUlNWUC5Qcm9taXNlLnJhY2UoW3Byb21pc2UxLCBwcm9taXNlMl0pLnRoZW4oZnVuY3Rpb24ocmVzdWx0KXtcbiAgICAvLyByZXN1bHQgPT09ICdwcm9taXNlIDInIGJlY2F1c2UgaXQgd2FzIHJlc29sdmVkIGJlZm9yZSBwcm9taXNlMVxuICAgIC8vIHdhcyByZXNvbHZlZC5cbiAgfSk7XG4gIGBgYFxuXG4gIGBSU1ZQLlByb21pc2UucmFjZWAgaXMgZGV0ZXJtaW5pc3RpYyBpbiB0aGF0IG9ubHkgdGhlIHN0YXRlIG9mIHRoZSBmaXJzdFxuICBzZXR0bGVkIHByb21pc2UgbWF0dGVycy4gRm9yIGV4YW1wbGUsIGV2ZW4gaWYgb3RoZXIgcHJvbWlzZXMgZ2l2ZW4gdG8gdGhlXG4gIGBwcm9taXNlc2AgYXJyYXkgYXJndW1lbnQgYXJlIHJlc29sdmVkLCBidXQgdGhlIGZpcnN0IHNldHRsZWQgcHJvbWlzZSBoYXNcbiAgYmVjb21lIHJlamVjdGVkIGJlZm9yZSB0aGUgb3RoZXIgcHJvbWlzZXMgYmVjYW1lIGZ1bGZpbGxlZCwgdGhlIHJldHVybmVkXG4gIHByb21pc2Ugd2lsbCBiZWNvbWUgcmVqZWN0ZWQ6XG5cbiAgYGBgamF2YXNjcmlwdFxuICBsZXQgcHJvbWlzZTEgPSBuZXcgUlNWUC5Qcm9taXNlKGZ1bmN0aW9uKHJlc29sdmUsIHJlamVjdCl7XG4gICAgc2V0VGltZW91dChmdW5jdGlvbigpe1xuICAgICAgcmVzb2x2ZSgncHJvbWlzZSAxJyk7XG4gICAgfSwgMjAwKTtcbiAgfSk7XG5cbiAgbGV0IHByb21pc2UyID0gbmV3IFJTVlAuUHJvbWlzZShmdW5jdGlvbihyZXNvbHZlLCByZWplY3Qpe1xuICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKXtcbiAgICAgIHJlamVjdChuZXcgRXJyb3IoJ3Byb21pc2UgMicpKTtcbiAgICB9LCAxMDApO1xuICB9KTtcblxuICBSU1ZQLlByb21pc2UucmFjZShbcHJvbWlzZTEsIHByb21pc2UyXSkudGhlbihmdW5jdGlvbihyZXN1bHQpe1xuICAgIC8vIENvZGUgaGVyZSBuZXZlciBydW5zXG4gIH0sIGZ1bmN0aW9uKHJlYXNvbil7XG4gICAgLy8gcmVhc29uLm1lc3NhZ2UgPT09ICdwcm9taXNlIDInIGJlY2F1c2UgcHJvbWlzZSAyIGJlY2FtZSByZWplY3RlZCBiZWZvcmVcbiAgICAvLyBwcm9taXNlIDEgYmVjYW1lIGZ1bGZpbGxlZFxuICB9KTtcbiAgYGBgXG5cbiAgQW4gZXhhbXBsZSByZWFsLXdvcmxkIHVzZSBjYXNlIGlzIGltcGxlbWVudGluZyB0aW1lb3V0czpcblxuICBgYGBqYXZhc2NyaXB0XG4gIFJTVlAuUHJvbWlzZS5yYWNlKFthamF4KCdmb28uanNvbicpLCB0aW1lb3V0KDUwMDApXSlcbiAgYGBgXG5cbiAgQG1ldGhvZCByYWNlXG4gIEBzdGF0aWNcbiAgQHBhcmFtIHtBcnJheX0gZW50cmllcyBhcnJheSBvZiBwcm9taXNlcyB0byBvYnNlcnZlXG4gIEBwYXJhbSB7U3RyaW5nfSBsYWJlbCBvcHRpb25hbCBzdHJpbmcgZm9yIGRlc2NyaWJpbmcgdGhlIHByb21pc2UgcmV0dXJuZWQuXG4gIFVzZWZ1bCBmb3IgdG9vbGluZy5cbiAgQHJldHVybiB7UHJvbWlzZX0gYSBwcm9taXNlIHdoaWNoIHNldHRsZXMgaW4gdGhlIHNhbWUgd2F5IGFzIHRoZSBmaXJzdCBwYXNzZWRcbiAgcHJvbWlzZSB0byBzZXR0bGUuXG4qL1xuZnVuY3Rpb24gcmFjZShlbnRyaWVzLCBsYWJlbCkge1xuICAvKmpzaGludCB2YWxpZHRoaXM6dHJ1ZSAqL1xuICB2YXIgQ29uc3RydWN0b3IgPSB0aGlzO1xuXG4gIHZhciBwcm9taXNlID0gbmV3IENvbnN0cnVjdG9yKG5vb3AsIGxhYmVsKTtcblxuICBpZiAoIWlzQXJyYXkoZW50cmllcykpIHtcbiAgICByZWplY3QocHJvbWlzZSwgbmV3IFR5cGVFcnJvcignUHJvbWlzZS5yYWNlIG11c3QgYmUgY2FsbGVkIHdpdGggYW4gYXJyYXknKSk7XG4gICAgcmV0dXJuIHByb21pc2U7XG4gIH1cblxuICBmb3IgKHZhciBpID0gMDsgcHJvbWlzZS5fc3RhdGUgPT09IFBFTkRJTkcgJiYgaSA8IGVudHJpZXMubGVuZ3RoOyBpKyspIHtcbiAgICBzdWJzY3JpYmUoQ29uc3RydWN0b3IucmVzb2x2ZShlbnRyaWVzW2ldKSwgdW5kZWZpbmVkLCBmdW5jdGlvbiAodmFsdWUpIHtcbiAgICAgIHJldHVybiByZXNvbHZlKHByb21pc2UsIHZhbHVlKTtcbiAgICB9LCBmdW5jdGlvbiAocmVhc29uKSB7XG4gICAgICByZXR1cm4gcmVqZWN0KHByb21pc2UsIHJlYXNvbik7XG4gICAgfSk7XG4gIH1cblxuICByZXR1cm4gcHJvbWlzZTtcbn1cblxuLyoqXG4gIGBSU1ZQLlByb21pc2UucmVqZWN0YCByZXR1cm5zIGEgcHJvbWlzZSByZWplY3RlZCB3aXRoIHRoZSBwYXNzZWQgYHJlYXNvbmAuXG4gIEl0IGlzIHNob3J0aGFuZCBmb3IgdGhlIGZvbGxvd2luZzpcblxuICBgYGBqYXZhc2NyaXB0XG4gIGxldCBwcm9taXNlID0gbmV3IFJTVlAuUHJvbWlzZShmdW5jdGlvbihyZXNvbHZlLCByZWplY3Qpe1xuICAgIHJlamVjdChuZXcgRXJyb3IoJ1dIT09QUycpKTtcbiAgfSk7XG5cbiAgcHJvbWlzZS50aGVuKGZ1bmN0aW9uKHZhbHVlKXtcbiAgICAvLyBDb2RlIGhlcmUgZG9lc24ndCBydW4gYmVjYXVzZSB0aGUgcHJvbWlzZSBpcyByZWplY3RlZCFcbiAgfSwgZnVuY3Rpb24ocmVhc29uKXtcbiAgICAvLyByZWFzb24ubWVzc2FnZSA9PT0gJ1dIT09QUydcbiAgfSk7XG4gIGBgYFxuXG4gIEluc3RlYWQgb2Ygd3JpdGluZyB0aGUgYWJvdmUsIHlvdXIgY29kZSBub3cgc2ltcGx5IGJlY29tZXMgdGhlIGZvbGxvd2luZzpcblxuICBgYGBqYXZhc2NyaXB0XG4gIGxldCBwcm9taXNlID0gUlNWUC5Qcm9taXNlLnJlamVjdChuZXcgRXJyb3IoJ1dIT09QUycpKTtcblxuICBwcm9taXNlLnRoZW4oZnVuY3Rpb24odmFsdWUpe1xuICAgIC8vIENvZGUgaGVyZSBkb2Vzbid0IHJ1biBiZWNhdXNlIHRoZSBwcm9taXNlIGlzIHJlamVjdGVkIVxuICB9LCBmdW5jdGlvbihyZWFzb24pe1xuICAgIC8vIHJlYXNvbi5tZXNzYWdlID09PSAnV0hPT1BTJ1xuICB9KTtcbiAgYGBgXG5cbiAgQG1ldGhvZCByZWplY3RcbiAgQHN0YXRpY1xuICBAcGFyYW0geyp9IHJlYXNvbiB2YWx1ZSB0aGF0IHRoZSByZXR1cm5lZCBwcm9taXNlIHdpbGwgYmUgcmVqZWN0ZWQgd2l0aC5cbiAgQHBhcmFtIHtTdHJpbmd9IGxhYmVsIG9wdGlvbmFsIHN0cmluZyBmb3IgaWRlbnRpZnlpbmcgdGhlIHJldHVybmVkIHByb21pc2UuXG4gIFVzZWZ1bCBmb3IgdG9vbGluZy5cbiAgQHJldHVybiB7UHJvbWlzZX0gYSBwcm9taXNlIHJlamVjdGVkIHdpdGggdGhlIGdpdmVuIGByZWFzb25gLlxuKi9cbmZ1bmN0aW9uIHJlamVjdCQxKHJlYXNvbiwgbGFiZWwpIHtcbiAgLypqc2hpbnQgdmFsaWR0aGlzOnRydWUgKi9cbiAgdmFyIENvbnN0cnVjdG9yID0gdGhpcztcbiAgdmFyIHByb21pc2UgPSBuZXcgQ29uc3RydWN0b3Iobm9vcCwgbGFiZWwpO1xuICByZWplY3QocHJvbWlzZSwgcmVhc29uKTtcbiAgcmV0dXJuIHByb21pc2U7XG59XG5cbnZhciBndWlkS2V5ID0gJ3JzdnBfJyArIG5vdygpICsgJy0nO1xudmFyIGNvdW50ZXIgPSAwO1xuXG5mdW5jdGlvbiBuZWVkc1Jlc29sdmVyKCkge1xuICB0aHJvdyBuZXcgVHlwZUVycm9yKCdZb3UgbXVzdCBwYXNzIGEgcmVzb2x2ZXIgZnVuY3Rpb24gYXMgdGhlIGZpcnN0IGFyZ3VtZW50IHRvIHRoZSBwcm9taXNlIGNvbnN0cnVjdG9yJyk7XG59XG5cbmZ1bmN0aW9uIG5lZWRzTmV3KCkge1xuICB0aHJvdyBuZXcgVHlwZUVycm9yKFwiRmFpbGVkIHRvIGNvbnN0cnVjdCAnUHJvbWlzZSc6IFBsZWFzZSB1c2UgdGhlICduZXcnIG9wZXJhdG9yLCB0aGlzIG9iamVjdCBjb25zdHJ1Y3RvciBjYW5ub3QgYmUgY2FsbGVkIGFzIGEgZnVuY3Rpb24uXCIpO1xufVxuXG4vKipcbiAgUHJvbWlzZSBvYmplY3RzIHJlcHJlc2VudCB0aGUgZXZlbnR1YWwgcmVzdWx0IG9mIGFuIGFzeW5jaHJvbm91cyBvcGVyYXRpb24uIFRoZVxuICBwcmltYXJ5IHdheSBvZiBpbnRlcmFjdGluZyB3aXRoIGEgcHJvbWlzZSBpcyB0aHJvdWdoIGl0cyBgdGhlbmAgbWV0aG9kLCB3aGljaFxuICByZWdpc3RlcnMgY2FsbGJhY2tzIHRvIHJlY2VpdmUgZWl0aGVyIGEgcHJvbWlzZeKAmXMgZXZlbnR1YWwgdmFsdWUgb3IgdGhlIHJlYXNvblxuICB3aHkgdGhlIHByb21pc2UgY2Fubm90IGJlIGZ1bGZpbGxlZC5cblxuICBUZXJtaW5vbG9neVxuICAtLS0tLS0tLS0tLVxuXG4gIC0gYHByb21pc2VgIGlzIGFuIG9iamVjdCBvciBmdW5jdGlvbiB3aXRoIGEgYHRoZW5gIG1ldGhvZCB3aG9zZSBiZWhhdmlvciBjb25mb3JtcyB0byB0aGlzIHNwZWNpZmljYXRpb24uXG4gIC0gYHRoZW5hYmxlYCBpcyBhbiBvYmplY3Qgb3IgZnVuY3Rpb24gdGhhdCBkZWZpbmVzIGEgYHRoZW5gIG1ldGhvZC5cbiAgLSBgdmFsdWVgIGlzIGFueSBsZWdhbCBKYXZhU2NyaXB0IHZhbHVlIChpbmNsdWRpbmcgdW5kZWZpbmVkLCBhIHRoZW5hYmxlLCBvciBhIHByb21pc2UpLlxuICAtIGBleGNlcHRpb25gIGlzIGEgdmFsdWUgdGhhdCBpcyB0aHJvd24gdXNpbmcgdGhlIHRocm93IHN0YXRlbWVudC5cbiAgLSBgcmVhc29uYCBpcyBhIHZhbHVlIHRoYXQgaW5kaWNhdGVzIHdoeSBhIHByb21pc2Ugd2FzIHJlamVjdGVkLlxuICAtIGBzZXR0bGVkYCB0aGUgZmluYWwgcmVzdGluZyBzdGF0ZSBvZiBhIHByb21pc2UsIGZ1bGZpbGxlZCBvciByZWplY3RlZC5cblxuICBBIHByb21pc2UgY2FuIGJlIGluIG9uZSBvZiB0aHJlZSBzdGF0ZXM6IHBlbmRpbmcsIGZ1bGZpbGxlZCwgb3IgcmVqZWN0ZWQuXG5cbiAgUHJvbWlzZXMgdGhhdCBhcmUgZnVsZmlsbGVkIGhhdmUgYSBmdWxmaWxsbWVudCB2YWx1ZSBhbmQgYXJlIGluIHRoZSBmdWxmaWxsZWRcbiAgc3RhdGUuICBQcm9taXNlcyB0aGF0IGFyZSByZWplY3RlZCBoYXZlIGEgcmVqZWN0aW9uIHJlYXNvbiBhbmQgYXJlIGluIHRoZVxuICByZWplY3RlZCBzdGF0ZS4gIEEgZnVsZmlsbG1lbnQgdmFsdWUgaXMgbmV2ZXIgYSB0aGVuYWJsZS5cblxuICBQcm9taXNlcyBjYW4gYWxzbyBiZSBzYWlkIHRvICpyZXNvbHZlKiBhIHZhbHVlLiAgSWYgdGhpcyB2YWx1ZSBpcyBhbHNvIGFcbiAgcHJvbWlzZSwgdGhlbiB0aGUgb3JpZ2luYWwgcHJvbWlzZSdzIHNldHRsZWQgc3RhdGUgd2lsbCBtYXRjaCB0aGUgdmFsdWUnc1xuICBzZXR0bGVkIHN0YXRlLiAgU28gYSBwcm9taXNlIHRoYXQgKnJlc29sdmVzKiBhIHByb21pc2UgdGhhdCByZWplY3RzIHdpbGxcbiAgaXRzZWxmIHJlamVjdCwgYW5kIGEgcHJvbWlzZSB0aGF0ICpyZXNvbHZlcyogYSBwcm9taXNlIHRoYXQgZnVsZmlsbHMgd2lsbFxuICBpdHNlbGYgZnVsZmlsbC5cblxuXG4gIEJhc2ljIFVzYWdlOlxuICAtLS0tLS0tLS0tLS1cblxuICBgYGBqc1xuICBsZXQgcHJvbWlzZSA9IG5ldyBQcm9taXNlKGZ1bmN0aW9uKHJlc29sdmUsIHJlamVjdCkge1xuICAgIC8vIG9uIHN1Y2Nlc3NcbiAgICByZXNvbHZlKHZhbHVlKTtcblxuICAgIC8vIG9uIGZhaWx1cmVcbiAgICByZWplY3QocmVhc29uKTtcbiAgfSk7XG5cbiAgcHJvbWlzZS50aGVuKGZ1bmN0aW9uKHZhbHVlKSB7XG4gICAgLy8gb24gZnVsZmlsbG1lbnRcbiAgfSwgZnVuY3Rpb24ocmVhc29uKSB7XG4gICAgLy8gb24gcmVqZWN0aW9uXG4gIH0pO1xuICBgYGBcblxuICBBZHZhbmNlZCBVc2FnZTpcbiAgLS0tLS0tLS0tLS0tLS0tXG5cbiAgUHJvbWlzZXMgc2hpbmUgd2hlbiBhYnN0cmFjdGluZyBhd2F5IGFzeW5jaHJvbm91cyBpbnRlcmFjdGlvbnMgc3VjaCBhc1xuICBgWE1MSHR0cFJlcXVlc3Rgcy5cblxuICBgYGBqc1xuICBmdW5jdGlvbiBnZXRKU09OKHVybCkge1xuICAgIHJldHVybiBuZXcgUHJvbWlzZShmdW5jdGlvbihyZXNvbHZlLCByZWplY3Qpe1xuICAgICAgbGV0IHhociA9IG5ldyBYTUxIdHRwUmVxdWVzdCgpO1xuXG4gICAgICB4aHIub3BlbignR0VUJywgdXJsKTtcbiAgICAgIHhoci5vbnJlYWR5c3RhdGVjaGFuZ2UgPSBoYW5kbGVyO1xuICAgICAgeGhyLnJlc3BvbnNlVHlwZSA9ICdqc29uJztcbiAgICAgIHhoci5zZXRSZXF1ZXN0SGVhZGVyKCdBY2NlcHQnLCAnYXBwbGljYXRpb24vanNvbicpO1xuICAgICAgeGhyLnNlbmQoKTtcblxuICAgICAgZnVuY3Rpb24gaGFuZGxlcigpIHtcbiAgICAgICAgaWYgKHRoaXMucmVhZHlTdGF0ZSA9PT0gdGhpcy5ET05FKSB7XG4gICAgICAgICAgaWYgKHRoaXMuc3RhdHVzID09PSAyMDApIHtcbiAgICAgICAgICAgIHJlc29sdmUodGhpcy5yZXNwb25zZSk7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJlamVjdChuZXcgRXJyb3IoJ2dldEpTT046IGAnICsgdXJsICsgJ2AgZmFpbGVkIHdpdGggc3RhdHVzOiBbJyArIHRoaXMuc3RhdHVzICsgJ10nKSk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9O1xuICAgIH0pO1xuICB9XG5cbiAgZ2V0SlNPTignL3Bvc3RzLmpzb24nKS50aGVuKGZ1bmN0aW9uKGpzb24pIHtcbiAgICAvLyBvbiBmdWxmaWxsbWVudFxuICB9LCBmdW5jdGlvbihyZWFzb24pIHtcbiAgICAvLyBvbiByZWplY3Rpb25cbiAgfSk7XG4gIGBgYFxuXG4gIFVubGlrZSBjYWxsYmFja3MsIHByb21pc2VzIGFyZSBncmVhdCBjb21wb3NhYmxlIHByaW1pdGl2ZXMuXG5cbiAgYGBganNcbiAgUHJvbWlzZS5hbGwoW1xuICAgIGdldEpTT04oJy9wb3N0cycpLFxuICAgIGdldEpTT04oJy9jb21tZW50cycpXG4gIF0pLnRoZW4oZnVuY3Rpb24odmFsdWVzKXtcbiAgICB2YWx1ZXNbMF0gLy8gPT4gcG9zdHNKU09OXG4gICAgdmFsdWVzWzFdIC8vID0+IGNvbW1lbnRzSlNPTlxuXG4gICAgcmV0dXJuIHZhbHVlcztcbiAgfSk7XG4gIGBgYFxuXG4gIEBjbGFzcyBSU1ZQLlByb21pc2VcbiAgQHBhcmFtIHtmdW5jdGlvbn0gcmVzb2x2ZXJcbiAgQHBhcmFtIHtTdHJpbmd9IGxhYmVsIG9wdGlvbmFsIHN0cmluZyBmb3IgbGFiZWxpbmcgdGhlIHByb21pc2UuXG4gIFVzZWZ1bCBmb3IgdG9vbGluZy5cbiAgQGNvbnN0cnVjdG9yXG4qL1xuXG52YXIgUHJvbWlzZSA9IGZ1bmN0aW9uICgpIHtcbiAgZnVuY3Rpb24gUHJvbWlzZShyZXNvbHZlciwgbGFiZWwpIHtcbiAgICB0aGlzLl9pZCA9IGNvdW50ZXIrKztcbiAgICB0aGlzLl9sYWJlbCA9IGxhYmVsO1xuICAgIHRoaXMuX3N0YXRlID0gdW5kZWZpbmVkO1xuICAgIHRoaXMuX3Jlc3VsdCA9IHVuZGVmaW5lZDtcbiAgICB0aGlzLl9zdWJzY3JpYmVycyA9IFtdO1xuXG4gICAgY29uZmlnLmluc3RydW1lbnQgJiYgaW5zdHJ1bWVudCgnY3JlYXRlZCcsIHRoaXMpO1xuXG4gICAgaWYgKG5vb3AgIT09IHJlc29sdmVyKSB7XG4gICAgICB0eXBlb2YgcmVzb2x2ZXIgIT09ICdmdW5jdGlvbicgJiYgbmVlZHNSZXNvbHZlcigpO1xuICAgICAgdGhpcyBpbnN0YW5jZW9mIFByb21pc2UgPyBpbml0aWFsaXplUHJvbWlzZSh0aGlzLCByZXNvbHZlcikgOiBuZWVkc05ldygpO1xuICAgIH1cbiAgfVxuXG4gIFByb21pc2UucHJvdG90eXBlLl9vbkVycm9yID0gZnVuY3Rpb24gX29uRXJyb3IocmVhc29uKSB7XG4gICAgdmFyIF90aGlzID0gdGhpcztcblxuICAgIGNvbmZpZy5hZnRlcihmdW5jdGlvbiAoKSB7XG4gICAgICBpZiAoX3RoaXMuX29uRXJyb3IpIHtcbiAgICAgICAgY29uZmlnLnRyaWdnZXIoJ2Vycm9yJywgcmVhc29uLCBfdGhpcy5fbGFiZWwpO1xuICAgICAgfVxuICAgIH0pO1xuICB9O1xuXG4gIC8qKlxuICAgIGBjYXRjaGAgaXMgc2ltcGx5IHN1Z2FyIGZvciBgdGhlbih1bmRlZmluZWQsIG9uUmVqZWN0aW9uKWAgd2hpY2ggbWFrZXMgaXQgdGhlIHNhbWVcbiAgICBhcyB0aGUgY2F0Y2ggYmxvY2sgb2YgYSB0cnkvY2F0Y2ggc3RhdGVtZW50LlxuICBcbiAgICBgYGBqc1xuICAgIGZ1bmN0aW9uIGZpbmRBdXRob3IoKXtcbiAgICAgIHRocm93IG5ldyBFcnJvcignY291bGRuXFwndCBmaW5kIHRoYXQgYXV0aG9yJyk7XG4gICAgfVxuICBcbiAgICAvLyBzeW5jaHJvbm91c1xuICAgIHRyeSB7XG4gICAgICBmaW5kQXV0aG9yKCk7XG4gICAgfSBjYXRjaChyZWFzb24pIHtcbiAgICAgIC8vIHNvbWV0aGluZyB3ZW50IHdyb25nXG4gICAgfVxuICBcbiAgICAvLyBhc3luYyB3aXRoIHByb21pc2VzXG4gICAgZmluZEF1dGhvcigpLmNhdGNoKGZ1bmN0aW9uKHJlYXNvbil7XG4gICAgICAvLyBzb21ldGhpbmcgd2VudCB3cm9uZ1xuICAgIH0pO1xuICAgIGBgYFxuICBcbiAgICBAbWV0aG9kIGNhdGNoXG4gICAgQHBhcmFtIHtGdW5jdGlvbn0gb25SZWplY3Rpb25cbiAgICBAcGFyYW0ge1N0cmluZ30gbGFiZWwgb3B0aW9uYWwgc3RyaW5nIGZvciBsYWJlbGluZyB0aGUgcHJvbWlzZS5cbiAgICBVc2VmdWwgZm9yIHRvb2xpbmcuXG4gICAgQHJldHVybiB7UHJvbWlzZX1cbiAgKi9cblxuXG4gIFByb21pc2UucHJvdG90eXBlLmNhdGNoID0gZnVuY3Rpb24gX2NhdGNoKG9uUmVqZWN0aW9uLCBsYWJlbCkge1xuICAgIHJldHVybiB0aGlzLnRoZW4odW5kZWZpbmVkLCBvblJlamVjdGlvbiwgbGFiZWwpO1xuICB9O1xuXG4gIC8qKlxuICAgIGBmaW5hbGx5YCB3aWxsIGJlIGludm9rZWQgcmVnYXJkbGVzcyBvZiB0aGUgcHJvbWlzZSdzIGZhdGUganVzdCBhcyBuYXRpdmVcbiAgICB0cnkvY2F0Y2gvZmluYWxseSBiZWhhdmVzXG4gIFxuICAgIFN5bmNocm9ub3VzIGV4YW1wbGU6XG4gIFxuICAgIGBgYGpzXG4gICAgZmluZEF1dGhvcigpIHtcbiAgICAgIGlmIChNYXRoLnJhbmRvbSgpID4gMC41KSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcigpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIG5ldyBBdXRob3IoKTtcbiAgICB9XG4gIFxuICAgIHRyeSB7XG4gICAgICByZXR1cm4gZmluZEF1dGhvcigpOyAvLyBzdWNjZWVkIG9yIGZhaWxcbiAgICB9IGNhdGNoKGVycm9yKSB7XG4gICAgICByZXR1cm4gZmluZE90aGVyQXV0aG9yKCk7XG4gICAgfSBmaW5hbGx5IHtcbiAgICAgIC8vIGFsd2F5cyBydW5zXG4gICAgICAvLyBkb2Vzbid0IGFmZmVjdCB0aGUgcmV0dXJuIHZhbHVlXG4gICAgfVxuICAgIGBgYFxuICBcbiAgICBBc3luY2hyb25vdXMgZXhhbXBsZTpcbiAgXG4gICAgYGBganNcbiAgICBmaW5kQXV0aG9yKCkuY2F0Y2goZnVuY3Rpb24ocmVhc29uKXtcbiAgICAgIHJldHVybiBmaW5kT3RoZXJBdXRob3IoKTtcbiAgICB9KS5maW5hbGx5KGZ1bmN0aW9uKCl7XG4gICAgICAvLyBhdXRob3Igd2FzIGVpdGhlciBmb3VuZCwgb3Igbm90XG4gICAgfSk7XG4gICAgYGBgXG4gIFxuICAgIEBtZXRob2QgZmluYWxseVxuICAgIEBwYXJhbSB7RnVuY3Rpb259IGNhbGxiYWNrXG4gICAgQHBhcmFtIHtTdHJpbmd9IGxhYmVsIG9wdGlvbmFsIHN0cmluZyBmb3IgbGFiZWxpbmcgdGhlIHByb21pc2UuXG4gICAgVXNlZnVsIGZvciB0b29saW5nLlxuICAgIEByZXR1cm4ge1Byb21pc2V9XG4gICovXG5cblxuICBQcm9taXNlLnByb3RvdHlwZS5maW5hbGx5ID0gZnVuY3Rpb24gX2ZpbmFsbHkoY2FsbGJhY2ssIGxhYmVsKSB7XG4gICAgdmFyIHByb21pc2UgPSB0aGlzO1xuICAgIHZhciBjb25zdHJ1Y3RvciA9IHByb21pc2UuY29uc3RydWN0b3I7XG5cbiAgICByZXR1cm4gcHJvbWlzZS50aGVuKGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgICAgcmV0dXJuIGNvbnN0cnVjdG9yLnJlc29sdmUoY2FsbGJhY2soKSkudGhlbihmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJldHVybiB2YWx1ZTtcbiAgICAgIH0pO1xuICAgIH0sIGZ1bmN0aW9uIChyZWFzb24pIHtcbiAgICAgIHJldHVybiBjb25zdHJ1Y3Rvci5yZXNvbHZlKGNhbGxiYWNrKCkpLnRoZW4oZnVuY3Rpb24gKCkge1xuICAgICAgICB0aHJvdyByZWFzb247XG4gICAgICB9KTtcbiAgICB9LCBsYWJlbCk7XG4gIH07XG5cbiAgcmV0dXJuIFByb21pc2U7XG59KCk7XG5cblxuXG5Qcm9taXNlLmNhc3QgPSByZXNvbHZlJDE7IC8vIGRlcHJlY2F0ZWRcblByb21pc2UuYWxsID0gYWxsO1xuUHJvbWlzZS5yYWNlID0gcmFjZTtcblByb21pc2UucmVzb2x2ZSA9IHJlc29sdmUkMTtcblByb21pc2UucmVqZWN0ID0gcmVqZWN0JDE7XG5cblByb21pc2UucHJvdG90eXBlLl9ndWlkS2V5ID0gZ3VpZEtleTtcblxuLyoqXG4gIFRoZSBwcmltYXJ5IHdheSBvZiBpbnRlcmFjdGluZyB3aXRoIGEgcHJvbWlzZSBpcyB0aHJvdWdoIGl0cyBgdGhlbmAgbWV0aG9kLFxuICB3aGljaCByZWdpc3RlcnMgY2FsbGJhY2tzIHRvIHJlY2VpdmUgZWl0aGVyIGEgcHJvbWlzZSdzIGV2ZW50dWFsIHZhbHVlIG9yIHRoZVxuICByZWFzb24gd2h5IHRoZSBwcm9taXNlIGNhbm5vdCBiZSBmdWxmaWxsZWQuXG5cbiAgYGBganNcbiAgZmluZFVzZXIoKS50aGVuKGZ1bmN0aW9uKHVzZXIpe1xuICAgIC8vIHVzZXIgaXMgYXZhaWxhYmxlXG4gIH0sIGZ1bmN0aW9uKHJlYXNvbil7XG4gICAgLy8gdXNlciBpcyB1bmF2YWlsYWJsZSwgYW5kIHlvdSBhcmUgZ2l2ZW4gdGhlIHJlYXNvbiB3aHlcbiAgfSk7XG4gIGBgYFxuXG4gIENoYWluaW5nXG4gIC0tLS0tLS0tXG5cbiAgVGhlIHJldHVybiB2YWx1ZSBvZiBgdGhlbmAgaXMgaXRzZWxmIGEgcHJvbWlzZS4gIFRoaXMgc2Vjb25kLCAnZG93bnN0cmVhbSdcbiAgcHJvbWlzZSBpcyByZXNvbHZlZCB3aXRoIHRoZSByZXR1cm4gdmFsdWUgb2YgdGhlIGZpcnN0IHByb21pc2UncyBmdWxmaWxsbWVudFxuICBvciByZWplY3Rpb24gaGFuZGxlciwgb3IgcmVqZWN0ZWQgaWYgdGhlIGhhbmRsZXIgdGhyb3dzIGFuIGV4Y2VwdGlvbi5cblxuICBgYGBqc1xuICBmaW5kVXNlcigpLnRoZW4oZnVuY3Rpb24gKHVzZXIpIHtcbiAgICByZXR1cm4gdXNlci5uYW1lO1xuICB9LCBmdW5jdGlvbiAocmVhc29uKSB7XG4gICAgcmV0dXJuICdkZWZhdWx0IG5hbWUnO1xuICB9KS50aGVuKGZ1bmN0aW9uICh1c2VyTmFtZSkge1xuICAgIC8vIElmIGBmaW5kVXNlcmAgZnVsZmlsbGVkLCBgdXNlck5hbWVgIHdpbGwgYmUgdGhlIHVzZXIncyBuYW1lLCBvdGhlcndpc2UgaXRcbiAgICAvLyB3aWxsIGJlIGAnZGVmYXVsdCBuYW1lJ2BcbiAgfSk7XG5cbiAgZmluZFVzZXIoKS50aGVuKGZ1bmN0aW9uICh1c2VyKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdGb3VuZCB1c2VyLCBidXQgc3RpbGwgdW5oYXBweScpO1xuICB9LCBmdW5jdGlvbiAocmVhc29uKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdgZmluZFVzZXJgIHJlamVjdGVkIGFuZCB3ZVxcJ3JlIHVuaGFwcHknKTtcbiAgfSkudGhlbihmdW5jdGlvbiAodmFsdWUpIHtcbiAgICAvLyBuZXZlciByZWFjaGVkXG4gIH0sIGZ1bmN0aW9uIChyZWFzb24pIHtcbiAgICAvLyBpZiBgZmluZFVzZXJgIGZ1bGZpbGxlZCwgYHJlYXNvbmAgd2lsbCBiZSAnRm91bmQgdXNlciwgYnV0IHN0aWxsIHVuaGFwcHknLlxuICAgIC8vIElmIGBmaW5kVXNlcmAgcmVqZWN0ZWQsIGByZWFzb25gIHdpbGwgYmUgJ2BmaW5kVXNlcmAgcmVqZWN0ZWQgYW5kIHdlXFwncmUgdW5oYXBweScuXG4gIH0pO1xuICBgYGBcbiAgSWYgdGhlIGRvd25zdHJlYW0gcHJvbWlzZSBkb2VzIG5vdCBzcGVjaWZ5IGEgcmVqZWN0aW9uIGhhbmRsZXIsIHJlamVjdGlvbiByZWFzb25zIHdpbGwgYmUgcHJvcGFnYXRlZCBmdXJ0aGVyIGRvd25zdHJlYW0uXG5cbiAgYGBganNcbiAgZmluZFVzZXIoKS50aGVuKGZ1bmN0aW9uICh1c2VyKSB7XG4gICAgdGhyb3cgbmV3IFBlZGFnb2dpY2FsRXhjZXB0aW9uKCdVcHN0cmVhbSBlcnJvcicpO1xuICB9KS50aGVuKGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgIC8vIG5ldmVyIHJlYWNoZWRcbiAgfSkudGhlbihmdW5jdGlvbiAodmFsdWUpIHtcbiAgICAvLyBuZXZlciByZWFjaGVkXG4gIH0sIGZ1bmN0aW9uIChyZWFzb24pIHtcbiAgICAvLyBUaGUgYFBlZGdhZ29jaWFsRXhjZXB0aW9uYCBpcyBwcm9wYWdhdGVkIGFsbCB0aGUgd2F5IGRvd24gdG8gaGVyZVxuICB9KTtcbiAgYGBgXG5cbiAgQXNzaW1pbGF0aW9uXG4gIC0tLS0tLS0tLS0tLVxuXG4gIFNvbWV0aW1lcyB0aGUgdmFsdWUgeW91IHdhbnQgdG8gcHJvcGFnYXRlIHRvIGEgZG93bnN0cmVhbSBwcm9taXNlIGNhbiBvbmx5IGJlXG4gIHJldHJpZXZlZCBhc3luY2hyb25vdXNseS4gVGhpcyBjYW4gYmUgYWNoaWV2ZWQgYnkgcmV0dXJuaW5nIGEgcHJvbWlzZSBpbiB0aGVcbiAgZnVsZmlsbG1lbnQgb3IgcmVqZWN0aW9uIGhhbmRsZXIuIFRoZSBkb3duc3RyZWFtIHByb21pc2Ugd2lsbCB0aGVuIGJlIHBlbmRpbmdcbiAgdW50aWwgdGhlIHJldHVybmVkIHByb21pc2UgaXMgc2V0dGxlZC4gVGhpcyBpcyBjYWxsZWQgKmFzc2ltaWxhdGlvbiouXG5cbiAgYGBganNcbiAgZmluZFVzZXIoKS50aGVuKGZ1bmN0aW9uICh1c2VyKSB7XG4gICAgcmV0dXJuIGZpbmRDb21tZW50c0J5QXV0aG9yKHVzZXIpO1xuICB9KS50aGVuKGZ1bmN0aW9uIChjb21tZW50cykge1xuICAgIC8vIFRoZSB1c2VyJ3MgY29tbWVudHMgYXJlIG5vdyBhdmFpbGFibGVcbiAgfSk7XG4gIGBgYFxuXG4gIElmIHRoZSBhc3NpbWxpYXRlZCBwcm9taXNlIHJlamVjdHMsIHRoZW4gdGhlIGRvd25zdHJlYW0gcHJvbWlzZSB3aWxsIGFsc28gcmVqZWN0LlxuXG4gIGBgYGpzXG4gIGZpbmRVc2VyKCkudGhlbihmdW5jdGlvbiAodXNlcikge1xuICAgIHJldHVybiBmaW5kQ29tbWVudHNCeUF1dGhvcih1c2VyKTtcbiAgfSkudGhlbihmdW5jdGlvbiAoY29tbWVudHMpIHtcbiAgICAvLyBJZiBgZmluZENvbW1lbnRzQnlBdXRob3JgIGZ1bGZpbGxzLCB3ZSdsbCBoYXZlIHRoZSB2YWx1ZSBoZXJlXG4gIH0sIGZ1bmN0aW9uIChyZWFzb24pIHtcbiAgICAvLyBJZiBgZmluZENvbW1lbnRzQnlBdXRob3JgIHJlamVjdHMsIHdlJ2xsIGhhdmUgdGhlIHJlYXNvbiBoZXJlXG4gIH0pO1xuICBgYGBcblxuICBTaW1wbGUgRXhhbXBsZVxuICAtLS0tLS0tLS0tLS0tLVxuXG4gIFN5bmNocm9ub3VzIEV4YW1wbGVcblxuICBgYGBqYXZhc2NyaXB0XG4gIGxldCByZXN1bHQ7XG5cbiAgdHJ5IHtcbiAgICByZXN1bHQgPSBmaW5kUmVzdWx0KCk7XG4gICAgLy8gc3VjY2Vzc1xuICB9IGNhdGNoKHJlYXNvbikge1xuICAgIC8vIGZhaWx1cmVcbiAgfVxuICBgYGBcblxuICBFcnJiYWNrIEV4YW1wbGVcblxuICBgYGBqc1xuICBmaW5kUmVzdWx0KGZ1bmN0aW9uKHJlc3VsdCwgZXJyKXtcbiAgICBpZiAoZXJyKSB7XG4gICAgICAvLyBmYWlsdXJlXG4gICAgfSBlbHNlIHtcbiAgICAgIC8vIHN1Y2Nlc3NcbiAgICB9XG4gIH0pO1xuICBgYGBcblxuICBQcm9taXNlIEV4YW1wbGU7XG5cbiAgYGBgamF2YXNjcmlwdFxuICBmaW5kUmVzdWx0KCkudGhlbihmdW5jdGlvbihyZXN1bHQpe1xuICAgIC8vIHN1Y2Nlc3NcbiAgfSwgZnVuY3Rpb24ocmVhc29uKXtcbiAgICAvLyBmYWlsdXJlXG4gIH0pO1xuICBgYGBcblxuICBBZHZhbmNlZCBFeGFtcGxlXG4gIC0tLS0tLS0tLS0tLS0tXG5cbiAgU3luY2hyb25vdXMgRXhhbXBsZVxuXG4gIGBgYGphdmFzY3JpcHRcbiAgbGV0IGF1dGhvciwgYm9va3M7XG5cbiAgdHJ5IHtcbiAgICBhdXRob3IgPSBmaW5kQXV0aG9yKCk7XG4gICAgYm9va3MgID0gZmluZEJvb2tzQnlBdXRob3IoYXV0aG9yKTtcbiAgICAvLyBzdWNjZXNzXG4gIH0gY2F0Y2gocmVhc29uKSB7XG4gICAgLy8gZmFpbHVyZVxuICB9XG4gIGBgYFxuXG4gIEVycmJhY2sgRXhhbXBsZVxuXG4gIGBgYGpzXG5cbiAgZnVuY3Rpb24gZm91bmRCb29rcyhib29rcykge1xuXG4gIH1cblxuICBmdW5jdGlvbiBmYWlsdXJlKHJlYXNvbikge1xuXG4gIH1cblxuICBmaW5kQXV0aG9yKGZ1bmN0aW9uKGF1dGhvciwgZXJyKXtcbiAgICBpZiAoZXJyKSB7XG4gICAgICBmYWlsdXJlKGVycik7XG4gICAgICAvLyBmYWlsdXJlXG4gICAgfSBlbHNlIHtcbiAgICAgIHRyeSB7XG4gICAgICAgIGZpbmRCb29va3NCeUF1dGhvcihhdXRob3IsIGZ1bmN0aW9uKGJvb2tzLCBlcnIpIHtcbiAgICAgICAgICBpZiAoZXJyKSB7XG4gICAgICAgICAgICBmYWlsdXJlKGVycik7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgIGZvdW5kQm9va3MoYm9va3MpO1xuICAgICAgICAgICAgfSBjYXRjaChyZWFzb24pIHtcbiAgICAgICAgICAgICAgZmFpbHVyZShyZWFzb24pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICB9IGNhdGNoKGVycm9yKSB7XG4gICAgICAgIGZhaWx1cmUoZXJyKTtcbiAgICAgIH1cbiAgICAgIC8vIHN1Y2Nlc3NcbiAgICB9XG4gIH0pO1xuICBgYGBcblxuICBQcm9taXNlIEV4YW1wbGU7XG5cbiAgYGBgamF2YXNjcmlwdFxuICBmaW5kQXV0aG9yKCkuXG4gICAgdGhlbihmaW5kQm9va3NCeUF1dGhvcikuXG4gICAgdGhlbihmdW5jdGlvbihib29rcyl7XG4gICAgICAvLyBmb3VuZCBib29rc1xuICB9KS5jYXRjaChmdW5jdGlvbihyZWFzb24pe1xuICAgIC8vIHNvbWV0aGluZyB3ZW50IHdyb25nXG4gIH0pO1xuICBgYGBcblxuICBAbWV0aG9kIHRoZW5cbiAgQHBhcmFtIHtGdW5jdGlvbn0gb25GdWxmaWxsbWVudFxuICBAcGFyYW0ge0Z1bmN0aW9ufSBvblJlamVjdGlvblxuICBAcGFyYW0ge1N0cmluZ30gbGFiZWwgb3B0aW9uYWwgc3RyaW5nIGZvciBsYWJlbGluZyB0aGUgcHJvbWlzZS5cbiAgVXNlZnVsIGZvciB0b29saW5nLlxuICBAcmV0dXJuIHtQcm9taXNlfVxuKi9cblByb21pc2UucHJvdG90eXBlLnRoZW4gPSB0aGVuO1xuXG5mdW5jdGlvbiBSZXN1bHQoKSB7XG4gIHRoaXMudmFsdWUgPSB1bmRlZmluZWQ7XG59XG5cbnZhciBFUlJPUiA9IG5ldyBSZXN1bHQoKTtcbnZhciBHRVRfVEhFTl9FUlJPUiQxID0gbmV3IFJlc3VsdCgpO1xuXG5mdW5jdGlvbiBnZXRUaGVuJDEob2JqKSB7XG4gIHRyeSB7XG4gICAgcmV0dXJuIG9iai50aGVuO1xuICB9IGNhdGNoIChlcnJvcikge1xuICAgIEVSUk9SLnZhbHVlID0gZXJyb3I7XG4gICAgcmV0dXJuIEVSUk9SO1xuICB9XG59XG5cbmZ1bmN0aW9uIHRyeUFwcGx5KGYsIHMsIGEpIHtcbiAgdHJ5IHtcbiAgICBmLmFwcGx5KHMsIGEpO1xuICB9IGNhdGNoIChlcnJvcikge1xuICAgIEVSUk9SLnZhbHVlID0gZXJyb3I7XG4gICAgcmV0dXJuIEVSUk9SO1xuICB9XG59XG5cbmZ1bmN0aW9uIG1ha2VPYmplY3QoXywgYXJndW1lbnROYW1lcykge1xuICB2YXIgb2JqID0ge307XG4gIHZhciBsZW5ndGggPSBfLmxlbmd0aDtcbiAgdmFyIGFyZ3MgPSBuZXcgQXJyYXkobGVuZ3RoKTtcblxuICBmb3IgKHZhciB4ID0gMDsgeCA8IGxlbmd0aDsgeCsrKSB7XG4gICAgYXJnc1t4XSA9IF9beF07XG4gIH1cblxuICBmb3IgKHZhciBpID0gMDsgaSA8IGFyZ3VtZW50TmFtZXMubGVuZ3RoOyBpKyspIHtcbiAgICB2YXIgbmFtZSA9IGFyZ3VtZW50TmFtZXNbaV07XG4gICAgb2JqW25hbWVdID0gYXJnc1tpICsgMV07XG4gIH1cblxuICByZXR1cm4gb2JqO1xufVxuXG5mdW5jdGlvbiBhcnJheVJlc3VsdChfKSB7XG4gIHZhciBsZW5ndGggPSBfLmxlbmd0aDtcbiAgdmFyIGFyZ3MgPSBuZXcgQXJyYXkobGVuZ3RoIC0gMSk7XG5cbiAgZm9yICh2YXIgaSA9IDE7IGkgPCBsZW5ndGg7IGkrKykge1xuICAgIGFyZ3NbaSAtIDFdID0gX1tpXTtcbiAgfVxuXG4gIHJldHVybiBhcmdzO1xufVxuXG5mdW5jdGlvbiB3cmFwVGhlbmFibGUodGhlbiwgcHJvbWlzZSkge1xuICByZXR1cm4ge1xuICAgIHRoZW46IGZ1bmN0aW9uIChvbkZ1bEZpbGxtZW50LCBvblJlamVjdGlvbikge1xuICAgICAgcmV0dXJuIHRoZW4uY2FsbChwcm9taXNlLCBvbkZ1bEZpbGxtZW50LCBvblJlamVjdGlvbik7XG4gICAgfVxuICB9O1xufVxuXG4vKipcbiAgYFJTVlAuZGVub2RlaWZ5YCB0YWtlcyBhICdub2RlLXN0eWxlJyBmdW5jdGlvbiBhbmQgcmV0dXJucyBhIGZ1bmN0aW9uIHRoYXRcbiAgd2lsbCByZXR1cm4gYW4gYFJTVlAuUHJvbWlzZWAuIFlvdSBjYW4gdXNlIGBkZW5vZGVpZnlgIGluIE5vZGUuanMgb3IgdGhlXG4gIGJyb3dzZXIgd2hlbiB5b3UnZCBwcmVmZXIgdG8gdXNlIHByb21pc2VzIG92ZXIgdXNpbmcgY2FsbGJhY2tzLiBGb3IgZXhhbXBsZSxcbiAgYGRlbm9kZWlmeWAgdHJhbnNmb3JtcyB0aGUgZm9sbG93aW5nOlxuXG4gIGBgYGphdmFzY3JpcHRcbiAgbGV0IGZzID0gcmVxdWlyZSgnZnMnKTtcblxuICBmcy5yZWFkRmlsZSgnbXlmaWxlLnR4dCcsIGZ1bmN0aW9uKGVyciwgZGF0YSl7XG4gICAgaWYgKGVycikgcmV0dXJuIGhhbmRsZUVycm9yKGVycik7XG4gICAgaGFuZGxlRGF0YShkYXRhKTtcbiAgfSk7XG4gIGBgYFxuXG4gIGludG86XG5cbiAgYGBgamF2YXNjcmlwdFxuICBsZXQgZnMgPSByZXF1aXJlKCdmcycpO1xuICBsZXQgcmVhZEZpbGUgPSBSU1ZQLmRlbm9kZWlmeShmcy5yZWFkRmlsZSk7XG5cbiAgcmVhZEZpbGUoJ215ZmlsZS50eHQnKS50aGVuKGhhbmRsZURhdGEsIGhhbmRsZUVycm9yKTtcbiAgYGBgXG5cbiAgSWYgdGhlIG5vZGUgZnVuY3Rpb24gaGFzIG11bHRpcGxlIHN1Y2Nlc3MgcGFyYW1ldGVycywgdGhlbiBgZGVub2RlaWZ5YFxuICBqdXN0IHJldHVybnMgdGhlIGZpcnN0IG9uZTpcblxuICBgYGBqYXZhc2NyaXB0XG4gIGxldCByZXF1ZXN0ID0gUlNWUC5kZW5vZGVpZnkocmVxdWlyZSgncmVxdWVzdCcpKTtcblxuICByZXF1ZXN0KCdodHRwOi8vZXhhbXBsZS5jb20nKS50aGVuKGZ1bmN0aW9uKHJlcykge1xuICAgIC8vIC4uLlxuICB9KTtcbiAgYGBgXG5cbiAgSG93ZXZlciwgaWYgeW91IG5lZWQgYWxsIHN1Y2Nlc3MgcGFyYW1ldGVycywgc2V0dGluZyBgZGVub2RlaWZ5YCdzXG4gIHNlY29uZCBwYXJhbWV0ZXIgdG8gYHRydWVgIGNhdXNlcyBpdCB0byByZXR1cm4gYWxsIHN1Y2Nlc3MgcGFyYW1ldGVyc1xuICBhcyBhbiBhcnJheTpcblxuICBgYGBqYXZhc2NyaXB0XG4gIGxldCByZXF1ZXN0ID0gUlNWUC5kZW5vZGVpZnkocmVxdWlyZSgncmVxdWVzdCcpLCB0cnVlKTtcblxuICByZXF1ZXN0KCdodHRwOi8vZXhhbXBsZS5jb20nKS50aGVuKGZ1bmN0aW9uKHJlc3VsdCkge1xuICAgIC8vIHJlc3VsdFswXSAtPiByZXNcbiAgICAvLyByZXN1bHRbMV0gLT4gYm9keVxuICB9KTtcbiAgYGBgXG5cbiAgT3IgaWYgeW91IHBhc3MgaXQgYW4gYXJyYXkgd2l0aCBuYW1lcyBpdCByZXR1cm5zIHRoZSBwYXJhbWV0ZXJzIGFzIGEgaGFzaDpcblxuICBgYGBqYXZhc2NyaXB0XG4gIGxldCByZXF1ZXN0ID0gUlNWUC5kZW5vZGVpZnkocmVxdWlyZSgncmVxdWVzdCcpLCBbJ3JlcycsICdib2R5J10pO1xuXG4gIHJlcXVlc3QoJ2h0dHA6Ly9leGFtcGxlLmNvbScpLnRoZW4oZnVuY3Rpb24ocmVzdWx0KSB7XG4gICAgLy8gcmVzdWx0LnJlc1xuICAgIC8vIHJlc3VsdC5ib2R5XG4gIH0pO1xuICBgYGBcblxuICBTb21ldGltZXMgeW91IG5lZWQgdG8gcmV0YWluIHRoZSBgdGhpc2A6XG5cbiAgYGBgamF2YXNjcmlwdFxuICBsZXQgYXBwID0gcmVxdWlyZSgnZXhwcmVzcycpKCk7XG4gIGxldCByZW5kZXIgPSBSU1ZQLmRlbm9kZWlmeShhcHAucmVuZGVyLmJpbmQoYXBwKSk7XG4gIGBgYFxuXG4gIFRoZSBkZW5vZGlmaWVkIGZ1bmN0aW9uIGluaGVyaXRzIGZyb20gdGhlIG9yaWdpbmFsIGZ1bmN0aW9uLiBJdCB3b3JrcyBpbiBhbGxcbiAgZW52aXJvbm1lbnRzLCBleGNlcHQgSUUgMTAgYW5kIGJlbG93LiBDb25zZXF1ZW50bHkgYWxsIHByb3BlcnRpZXMgb2YgdGhlIG9yaWdpbmFsXG4gIGZ1bmN0aW9uIGFyZSBhdmFpbGFibGUgdG8geW91LiBIb3dldmVyLCBhbnkgcHJvcGVydGllcyB5b3UgY2hhbmdlIG9uIHRoZVxuICBkZW5vZGVpZmllZCBmdW5jdGlvbiB3b24ndCBiZSBjaGFuZ2VkIG9uIHRoZSBvcmlnaW5hbCBmdW5jdGlvbi4gRXhhbXBsZTpcblxuICBgYGBqYXZhc2NyaXB0XG4gIGxldCByZXF1ZXN0ID0gUlNWUC5kZW5vZGVpZnkocmVxdWlyZSgncmVxdWVzdCcpKSxcbiAgICAgIGNvb2tpZUphciA9IHJlcXVlc3QuamFyKCk7IC8vIDwtIEluaGVyaXRhbmNlIGlzIHVzZWQgaGVyZVxuXG4gIHJlcXVlc3QoJ2h0dHA6Ly9leGFtcGxlLmNvbScsIHtqYXI6IGNvb2tpZUphcn0pLnRoZW4oZnVuY3Rpb24ocmVzKSB7XG4gICAgLy8gY29va2llSmFyLmNvb2tpZXMgaG9sZHMgbm93IHRoZSBjb29raWVzIHJldHVybmVkIGJ5IGV4YW1wbGUuY29tXG4gIH0pO1xuICBgYGBcblxuICBVc2luZyBgZGVub2RlaWZ5YCBtYWtlcyBpdCBlYXNpZXIgdG8gY29tcG9zZSBhc3luY2hyb25vdXMgb3BlcmF0aW9ucyBpbnN0ZWFkXG4gIG9mIHVzaW5nIGNhbGxiYWNrcy4gRm9yIGV4YW1wbGUsIGluc3RlYWQgb2Y6XG5cbiAgYGBgamF2YXNjcmlwdFxuICBsZXQgZnMgPSByZXF1aXJlKCdmcycpO1xuXG4gIGZzLnJlYWRGaWxlKCdteWZpbGUudHh0JywgZnVuY3Rpb24oZXJyLCBkYXRhKXtcbiAgICBpZiAoZXJyKSB7IC4uLiB9IC8vIEhhbmRsZSBlcnJvclxuICAgIGZzLndyaXRlRmlsZSgnbXlmaWxlMi50eHQnLCBkYXRhLCBmdW5jdGlvbihlcnIpe1xuICAgICAgaWYgKGVycikgeyAuLi4gfSAvLyBIYW5kbGUgZXJyb3JcbiAgICAgIGNvbnNvbGUubG9nKCdkb25lJylcbiAgICB9KTtcbiAgfSk7XG4gIGBgYFxuXG4gIHlvdSBjYW4gY2hhaW4gdGhlIG9wZXJhdGlvbnMgdG9nZXRoZXIgdXNpbmcgYHRoZW5gIGZyb20gdGhlIHJldHVybmVkIHByb21pc2U6XG5cbiAgYGBgamF2YXNjcmlwdFxuICBsZXQgZnMgPSByZXF1aXJlKCdmcycpO1xuICBsZXQgcmVhZEZpbGUgPSBSU1ZQLmRlbm9kZWlmeShmcy5yZWFkRmlsZSk7XG4gIGxldCB3cml0ZUZpbGUgPSBSU1ZQLmRlbm9kZWlmeShmcy53cml0ZUZpbGUpO1xuXG4gIHJlYWRGaWxlKCdteWZpbGUudHh0JykudGhlbihmdW5jdGlvbihkYXRhKXtcbiAgICByZXR1cm4gd3JpdGVGaWxlKCdteWZpbGUyLnR4dCcsIGRhdGEpO1xuICB9KS50aGVuKGZ1bmN0aW9uKCl7XG4gICAgY29uc29sZS5sb2coJ2RvbmUnKVxuICB9KS5jYXRjaChmdW5jdGlvbihlcnJvcil7XG4gICAgLy8gSGFuZGxlIGVycm9yXG4gIH0pO1xuICBgYGBcblxuICBAbWV0aG9kIGRlbm9kZWlmeVxuICBAc3RhdGljXG4gIEBmb3IgUlNWUFxuICBAcGFyYW0ge0Z1bmN0aW9ufSBub2RlRnVuYyBhICdub2RlLXN0eWxlJyBmdW5jdGlvbiB0aGF0IHRha2VzIGEgY2FsbGJhY2sgYXNcbiAgaXRzIGxhc3QgYXJndW1lbnQuIFRoZSBjYWxsYmFjayBleHBlY3RzIGFuIGVycm9yIHRvIGJlIHBhc3NlZCBhcyBpdHMgZmlyc3RcbiAgYXJndW1lbnQgKGlmIGFuIGVycm9yIG9jY3VycmVkLCBvdGhlcndpc2UgbnVsbCksIGFuZCB0aGUgdmFsdWUgZnJvbSB0aGVcbiAgb3BlcmF0aW9uIGFzIGl0cyBzZWNvbmQgYXJndW1lbnQgKCdmdW5jdGlvbihlcnIsIHZhbHVlKXsgfScpLlxuICBAcGFyYW0ge0Jvb2xlYW58QXJyYXl9IFtvcHRpb25zXSBBbiBvcHRpb25hbCBwYXJhbXRlciB0aGF0IGlmIHNldFxuICB0byBgdHJ1ZWAgY2F1c2VzIHRoZSBwcm9taXNlIHRvIGZ1bGZpbGwgd2l0aCB0aGUgY2FsbGJhY2sncyBzdWNjZXNzIGFyZ3VtZW50c1xuICBhcyBhbiBhcnJheS4gVGhpcyBpcyB1c2VmdWwgaWYgdGhlIG5vZGUgZnVuY3Rpb24gaGFzIG11bHRpcGxlIHN1Y2Nlc3NcbiAgcGFyYW10ZXJzLiBJZiB5b3Ugc2V0IHRoaXMgcGFyYW10ZXIgdG8gYW4gYXJyYXkgd2l0aCBuYW1lcywgdGhlIHByb21pc2Ugd2lsbFxuICBmdWxmaWxsIHdpdGggYSBoYXNoIHdpdGggdGhlc2UgbmFtZXMgYXMga2V5cyBhbmQgdGhlIHN1Y2Nlc3MgcGFyYW1ldGVycyBhc1xuICB2YWx1ZXMuXG4gIEByZXR1cm4ge0Z1bmN0aW9ufSBhIGZ1bmN0aW9uIHRoYXQgd3JhcHMgYG5vZGVGdW5jYCB0byByZXR1cm4gYW5cbiAgYFJTVlAuUHJvbWlzZWBcbiAgQHN0YXRpY1xuKi9cbmZ1bmN0aW9uIGRlbm9kZWlmeShub2RlRnVuYywgb3B0aW9ucykge1xuICB2YXIgZm4gPSBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgIHZhciBsID0gYXJndW1lbnRzLmxlbmd0aDtcbiAgICB2YXIgYXJncyA9IG5ldyBBcnJheShsICsgMSk7XG4gICAgdmFyIHByb21pc2VJbnB1dCA9IGZhbHNlO1xuXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBsOyArK2kpIHtcbiAgICAgIHZhciBhcmcgPSBhcmd1bWVudHNbaV07XG5cbiAgICAgIGlmICghcHJvbWlzZUlucHV0KSB7XG4gICAgICAgIC8vIFRPRE86IGNsZWFuIHRoaXMgdXBcbiAgICAgICAgcHJvbWlzZUlucHV0ID0gbmVlZHNQcm9taXNlSW5wdXQoYXJnKTtcbiAgICAgICAgaWYgKHByb21pc2VJbnB1dCA9PT0gR0VUX1RIRU5fRVJST1IkMSkge1xuICAgICAgICAgIHZhciBwID0gbmV3IFByb21pc2Uobm9vcCk7XG4gICAgICAgICAgcmVqZWN0KHAsIEdFVF9USEVOX0VSUk9SJDEudmFsdWUpO1xuICAgICAgICAgIHJldHVybiBwO1xuICAgICAgICB9IGVsc2UgaWYgKHByb21pc2VJbnB1dCAmJiBwcm9taXNlSW5wdXQgIT09IHRydWUpIHtcbiAgICAgICAgICBhcmcgPSB3cmFwVGhlbmFibGUocHJvbWlzZUlucHV0LCBhcmcpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICBhcmdzW2ldID0gYXJnO1xuICAgIH1cblxuICAgIHZhciBwcm9taXNlID0gbmV3IFByb21pc2Uobm9vcCk7XG5cbiAgICBhcmdzW2xdID0gZnVuY3Rpb24gKGVyciwgdmFsKSB7XG4gICAgICBpZiAoZXJyKSByZWplY3QocHJvbWlzZSwgZXJyKTtlbHNlIGlmIChvcHRpb25zID09PSB1bmRlZmluZWQpIHJlc29sdmUocHJvbWlzZSwgdmFsKTtlbHNlIGlmIChvcHRpb25zID09PSB0cnVlKSByZXNvbHZlKHByb21pc2UsIGFycmF5UmVzdWx0KGFyZ3VtZW50cykpO2Vsc2UgaWYgKGlzQXJyYXkob3B0aW9ucykpIHJlc29sdmUocHJvbWlzZSwgbWFrZU9iamVjdChhcmd1bWVudHMsIG9wdGlvbnMpKTtlbHNlIHJlc29sdmUocHJvbWlzZSwgdmFsKTtcbiAgICB9O1xuXG4gICAgaWYgKHByb21pc2VJbnB1dCkge1xuICAgICAgcmV0dXJuIGhhbmRsZVByb21pc2VJbnB1dChwcm9taXNlLCBhcmdzLCBub2RlRnVuYywgc2VsZik7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBoYW5kbGVWYWx1ZUlucHV0KHByb21pc2UsIGFyZ3MsIG5vZGVGdW5jLCBzZWxmKTtcbiAgICB9XG4gIH07XG5cbiAgZm4uX19wcm90b19fID0gbm9kZUZ1bmM7XG5cbiAgcmV0dXJuIGZuO1xufVxuXG5mdW5jdGlvbiBoYW5kbGVWYWx1ZUlucHV0KHByb21pc2UsIGFyZ3MsIG5vZGVGdW5jLCBzZWxmKSB7XG4gIHZhciByZXN1bHQgPSB0cnlBcHBseShub2RlRnVuYywgc2VsZiwgYXJncyk7XG4gIGlmIChyZXN1bHQgPT09IEVSUk9SKSB7XG4gICAgcmVqZWN0KHByb21pc2UsIHJlc3VsdC52YWx1ZSk7XG4gIH1cbiAgcmV0dXJuIHByb21pc2U7XG59XG5cbmZ1bmN0aW9uIGhhbmRsZVByb21pc2VJbnB1dChwcm9taXNlLCBhcmdzLCBub2RlRnVuYywgc2VsZikge1xuICByZXR1cm4gUHJvbWlzZS5hbGwoYXJncykudGhlbihmdW5jdGlvbiAoYXJncykge1xuICAgIHZhciByZXN1bHQgPSB0cnlBcHBseShub2RlRnVuYywgc2VsZiwgYXJncyk7XG4gICAgaWYgKHJlc3VsdCA9PT0gRVJST1IpIHtcbiAgICAgIHJlamVjdChwcm9taXNlLCByZXN1bHQudmFsdWUpO1xuICAgIH1cbiAgICByZXR1cm4gcHJvbWlzZTtcbiAgfSk7XG59XG5cbmZ1bmN0aW9uIG5lZWRzUHJvbWlzZUlucHV0KGFyZykge1xuICBpZiAoYXJnICYmIHR5cGVvZiBhcmcgPT09ICdvYmplY3QnKSB7XG4gICAgaWYgKGFyZy5jb25zdHJ1Y3RvciA9PT0gUHJvbWlzZSkge1xuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBnZXRUaGVuJDEoYXJnKTtcbiAgICB9XG4gIH0gZWxzZSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG59XG5cbi8qKlxuICBUaGlzIGlzIGEgY29udmVuaWVudCBhbGlhcyBmb3IgYFJTVlAuUHJvbWlzZS5hbGxgLlxuXG4gIEBtZXRob2QgYWxsXG4gIEBzdGF0aWNcbiAgQGZvciBSU1ZQXG4gIEBwYXJhbSB7QXJyYXl9IGFycmF5IEFycmF5IG9mIHByb21pc2VzLlxuICBAcGFyYW0ge1N0cmluZ30gbGFiZWwgQW4gb3B0aW9uYWwgbGFiZWwuIFRoaXMgaXMgdXNlZnVsXG4gIGZvciB0b29saW5nLlxuKi9cbmZ1bmN0aW9uIGFsbCQxKGFycmF5LCBsYWJlbCkge1xuICByZXR1cm4gUHJvbWlzZS5hbGwoYXJyYXksIGxhYmVsKTtcbn1cblxuZnVuY3Rpb24gX3Bvc3NpYmxlQ29uc3RydWN0b3JSZXR1cm4oc2VsZiwgY2FsbCkgeyBpZiAoIXNlbGYpIHsgdGhyb3cgbmV3IFJlZmVyZW5jZUVycm9yKFwidGhpcyBoYXNuJ3QgYmVlbiBpbml0aWFsaXNlZCAtIHN1cGVyKCkgaGFzbid0IGJlZW4gY2FsbGVkXCIpOyB9IHJldHVybiBjYWxsICYmICh0eXBlb2YgY2FsbCA9PT0gXCJvYmplY3RcIiB8fCB0eXBlb2YgY2FsbCA9PT0gXCJmdW5jdGlvblwiKSA/IGNhbGwgOiBzZWxmOyB9XG5cbmZ1bmN0aW9uIF9pbmhlcml0cyhzdWJDbGFzcywgc3VwZXJDbGFzcykgeyBpZiAodHlwZW9mIHN1cGVyQ2xhc3MgIT09IFwiZnVuY3Rpb25cIiAmJiBzdXBlckNsYXNzICE9PSBudWxsKSB7IHRocm93IG5ldyBUeXBlRXJyb3IoXCJTdXBlciBleHByZXNzaW9uIG11c3QgZWl0aGVyIGJlIG51bGwgb3IgYSBmdW5jdGlvbiwgbm90IFwiICsgdHlwZW9mIHN1cGVyQ2xhc3MpOyB9IHN1YkNsYXNzLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoc3VwZXJDbGFzcyAmJiBzdXBlckNsYXNzLnByb3RvdHlwZSwgeyBjb25zdHJ1Y3RvcjogeyB2YWx1ZTogc3ViQ2xhc3MsIGVudW1lcmFibGU6IGZhbHNlLCB3cml0YWJsZTogdHJ1ZSwgY29uZmlndXJhYmxlOiB0cnVlIH0gfSk7IGlmIChzdXBlckNsYXNzKSBPYmplY3Quc2V0UHJvdG90eXBlT2YgPyBPYmplY3Quc2V0UHJvdG90eXBlT2Yoc3ViQ2xhc3MsIHN1cGVyQ2xhc3MpIDogc3ViQ2xhc3MuX19wcm90b19fID0gc3VwZXJDbGFzczsgfVxuXG52YXIgQWxsU2V0dGxlZCA9IGZ1bmN0aW9uIChfRW51bWVyYXRvcikge1xuICBfaW5oZXJpdHMoQWxsU2V0dGxlZCwgX0VudW1lcmF0b3IpO1xuXG4gIGZ1bmN0aW9uIEFsbFNldHRsZWQoQ29uc3RydWN0b3IsIGVudHJpZXMsIGxhYmVsKSB7XG4gICAgcmV0dXJuIF9wb3NzaWJsZUNvbnN0cnVjdG9yUmV0dXJuKHRoaXMsIF9FbnVtZXJhdG9yLmNhbGwodGhpcywgQ29uc3RydWN0b3IsIGVudHJpZXMsIGZhbHNlIC8qIGRvbid0IGFib3J0IG9uIHJlamVjdCAqLywgbGFiZWwpKTtcbiAgfVxuXG4gIHJldHVybiBBbGxTZXR0bGVkO1xufShFbnVtZXJhdG9yKTtcblxuQWxsU2V0dGxlZC5wcm90b3R5cGUuX21ha2VSZXN1bHQgPSBtYWtlU2V0dGxlZFJlc3VsdDtcblxuLyoqXG5gUlNWUC5hbGxTZXR0bGVkYCBpcyBzaW1pbGFyIHRvIGBSU1ZQLmFsbGAsIGJ1dCBpbnN0ZWFkIG9mIGltcGxlbWVudGluZ1xuYSBmYWlsLWZhc3QgbWV0aG9kLCBpdCB3YWl0cyB1bnRpbCBhbGwgdGhlIHByb21pc2VzIGhhdmUgcmV0dXJuZWQgYW5kXG5zaG93cyB5b3UgYWxsIHRoZSByZXN1bHRzLiBUaGlzIGlzIHVzZWZ1bCBpZiB5b3Ugd2FudCB0byBoYW5kbGUgbXVsdGlwbGVcbnByb21pc2VzJyBmYWlsdXJlIHN0YXRlcyB0b2dldGhlciBhcyBhIHNldC5cbiBSZXR1cm5zIGEgcHJvbWlzZSB0aGF0IGlzIGZ1bGZpbGxlZCB3aGVuIGFsbCB0aGUgZ2l2ZW4gcHJvbWlzZXMgaGF2ZSBiZWVuXG5zZXR0bGVkLiBUaGUgcmV0dXJuIHByb21pc2UgaXMgZnVsZmlsbGVkIHdpdGggYW4gYXJyYXkgb2YgdGhlIHN0YXRlcyBvZlxudGhlIHByb21pc2VzIHBhc3NlZCBpbnRvIHRoZSBgcHJvbWlzZXNgIGFycmF5IGFyZ3VtZW50LlxuIEVhY2ggc3RhdGUgb2JqZWN0IHdpbGwgZWl0aGVyIGluZGljYXRlIGZ1bGZpbGxtZW50IG9yIHJlamVjdGlvbiwgYW5kXG5wcm92aWRlIHRoZSBjb3JyZXNwb25kaW5nIHZhbHVlIG9yIHJlYXNvbi4gVGhlIHN0YXRlcyB3aWxsIHRha2Ugb25lIG9mXG50aGUgZm9sbG93aW5nIGZvcm1hdHM6XG4gYGBgamF2YXNjcmlwdFxueyBzdGF0ZTogJ2Z1bGZpbGxlZCcsIHZhbHVlOiB2YWx1ZSB9XG4gIG9yXG57IHN0YXRlOiAncmVqZWN0ZWQnLCByZWFzb246IHJlYXNvbiB9XG5gYGBcbiBFeGFtcGxlOlxuIGBgYGphdmFzY3JpcHRcbmxldCBwcm9taXNlMSA9IFJTVlAuUHJvbWlzZS5yZXNvbHZlKDEpO1xubGV0IHByb21pc2UyID0gUlNWUC5Qcm9taXNlLnJlamVjdChuZXcgRXJyb3IoJzInKSk7XG5sZXQgcHJvbWlzZTMgPSBSU1ZQLlByb21pc2UucmVqZWN0KG5ldyBFcnJvcignMycpKTtcbmxldCBwcm9taXNlcyA9IFsgcHJvbWlzZTEsIHByb21pc2UyLCBwcm9taXNlMyBdO1xuIFJTVlAuYWxsU2V0dGxlZChwcm9taXNlcykudGhlbihmdW5jdGlvbihhcnJheSl7XG4gIC8vIGFycmF5ID09IFtcbiAgLy8gICB7IHN0YXRlOiAnZnVsZmlsbGVkJywgdmFsdWU6IDEgfSxcbiAgLy8gICB7IHN0YXRlOiAncmVqZWN0ZWQnLCByZWFzb246IEVycm9yIH0sXG4gIC8vICAgeyBzdGF0ZTogJ3JlamVjdGVkJywgcmVhc29uOiBFcnJvciB9XG4gIC8vIF1cbiAgLy8gTm90ZSB0aGF0IGZvciB0aGUgc2Vjb25kIGl0ZW0sIHJlYXNvbi5tZXNzYWdlIHdpbGwgYmUgJzInLCBhbmQgZm9yIHRoZVxuICAvLyB0aGlyZCBpdGVtLCByZWFzb24ubWVzc2FnZSB3aWxsIGJlICczJy5cbn0sIGZ1bmN0aW9uKGVycm9yKSB7XG4gIC8vIE5vdCBydW4uIChUaGlzIGJsb2NrIHdvdWxkIG9ubHkgYmUgY2FsbGVkIGlmIGFsbFNldHRsZWQgaGFkIGZhaWxlZCxcbiAgLy8gZm9yIGluc3RhbmNlIGlmIHBhc3NlZCBhbiBpbmNvcnJlY3QgYXJndW1lbnQgdHlwZS4pXG59KTtcbmBgYFxuIEBtZXRob2QgYWxsU2V0dGxlZFxuQHN0YXRpY1xuQGZvciBSU1ZQXG5AcGFyYW0ge0FycmF5fSBlbnRyaWVzXG5AcGFyYW0ge1N0cmluZ30gbGFiZWwgLSBvcHRpb25hbCBzdHJpbmcgdGhhdCBkZXNjcmliZXMgdGhlIHByb21pc2UuXG5Vc2VmdWwgZm9yIHRvb2xpbmcuXG5AcmV0dXJuIHtQcm9taXNlfSBwcm9taXNlIHRoYXQgaXMgZnVsZmlsbGVkIHdpdGggYW4gYXJyYXkgb2YgdGhlIHNldHRsZWRcbnN0YXRlcyBvZiB0aGUgY29uc3RpdHVlbnQgcHJvbWlzZXMuXG4qL1xuXG5mdW5jdGlvbiBhbGxTZXR0bGVkKGVudHJpZXMsIGxhYmVsKSB7XG4gIGlmICghaXNBcnJheShlbnRyaWVzKSkge1xuICAgIHJldHVybiBQcm9taXNlLnJlamVjdChuZXcgVHlwZUVycm9yKFwiUHJvbWlzZS5hbGxTZXR0bGVkIG11c3QgYmUgY2FsbGVkIHdpdGggYW4gYXJyYXlcIiksIGxhYmVsKTtcbiAgfVxuXG4gIHJldHVybiBuZXcgQWxsU2V0dGxlZChQcm9taXNlLCBlbnRyaWVzLCBsYWJlbCkucHJvbWlzZTtcbn1cblxuLyoqXG4gIFRoaXMgaXMgYSBjb252ZW5pZW50IGFsaWFzIGZvciBgUlNWUC5Qcm9taXNlLnJhY2VgLlxuXG4gIEBtZXRob2QgcmFjZVxuICBAc3RhdGljXG4gIEBmb3IgUlNWUFxuICBAcGFyYW0ge0FycmF5fSBhcnJheSBBcnJheSBvZiBwcm9taXNlcy5cbiAgQHBhcmFtIHtTdHJpbmd9IGxhYmVsIEFuIG9wdGlvbmFsIGxhYmVsLiBUaGlzIGlzIHVzZWZ1bFxuICBmb3IgdG9vbGluZy5cbiAqL1xuZnVuY3Rpb24gcmFjZSQxKGFycmF5LCBsYWJlbCkge1xuICByZXR1cm4gUHJvbWlzZS5yYWNlKGFycmF5LCBsYWJlbCk7XG59XG5cbmZ1bmN0aW9uIF9wb3NzaWJsZUNvbnN0cnVjdG9yUmV0dXJuJDEoc2VsZiwgY2FsbCkgeyBpZiAoIXNlbGYpIHsgdGhyb3cgbmV3IFJlZmVyZW5jZUVycm9yKFwidGhpcyBoYXNuJ3QgYmVlbiBpbml0aWFsaXNlZCAtIHN1cGVyKCkgaGFzbid0IGJlZW4gY2FsbGVkXCIpOyB9IHJldHVybiBjYWxsICYmICh0eXBlb2YgY2FsbCA9PT0gXCJvYmplY3RcIiB8fCB0eXBlb2YgY2FsbCA9PT0gXCJmdW5jdGlvblwiKSA/IGNhbGwgOiBzZWxmOyB9XG5cbmZ1bmN0aW9uIF9pbmhlcml0cyQxKHN1YkNsYXNzLCBzdXBlckNsYXNzKSB7IGlmICh0eXBlb2Ygc3VwZXJDbGFzcyAhPT0gXCJmdW5jdGlvblwiICYmIHN1cGVyQ2xhc3MgIT09IG51bGwpIHsgdGhyb3cgbmV3IFR5cGVFcnJvcihcIlN1cGVyIGV4cHJlc3Npb24gbXVzdCBlaXRoZXIgYmUgbnVsbCBvciBhIGZ1bmN0aW9uLCBub3QgXCIgKyB0eXBlb2Ygc3VwZXJDbGFzcyk7IH0gc3ViQ2xhc3MucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShzdXBlckNsYXNzICYmIHN1cGVyQ2xhc3MucHJvdG90eXBlLCB7IGNvbnN0cnVjdG9yOiB7IHZhbHVlOiBzdWJDbGFzcywgZW51bWVyYWJsZTogZmFsc2UsIHdyaXRhYmxlOiB0cnVlLCBjb25maWd1cmFibGU6IHRydWUgfSB9KTsgaWYgKHN1cGVyQ2xhc3MpIE9iamVjdC5zZXRQcm90b3R5cGVPZiA/IE9iamVjdC5zZXRQcm90b3R5cGVPZihzdWJDbGFzcywgc3VwZXJDbGFzcykgOiBzdWJDbGFzcy5fX3Byb3RvX18gPSBzdXBlckNsYXNzOyB9XG5cbnZhciBoYXNPd25Qcm9wZXJ0eSA9IE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHk7XG5cbnZhciBQcm9taXNlSGFzaCA9IGZ1bmN0aW9uIChfRW51bWVyYXRvcikge1xuICBfaW5oZXJpdHMkMShQcm9taXNlSGFzaCwgX0VudW1lcmF0b3IpO1xuXG4gIGZ1bmN0aW9uIFByb21pc2VIYXNoKENvbnN0cnVjdG9yLCBvYmplY3QpIHtcbiAgICB2YXIgYWJvcnRPblJlamVjdCA9IGFyZ3VtZW50cy5sZW5ndGggPiAyICYmIGFyZ3VtZW50c1syXSAhPT0gdW5kZWZpbmVkID8gYXJndW1lbnRzWzJdIDogdHJ1ZTtcbiAgICB2YXIgbGFiZWwgPSBhcmd1bWVudHNbM107XG4gICAgcmV0dXJuIF9wb3NzaWJsZUNvbnN0cnVjdG9yUmV0dXJuJDEodGhpcywgX0VudW1lcmF0b3IuY2FsbCh0aGlzLCBDb25zdHJ1Y3Rvciwgb2JqZWN0LCBhYm9ydE9uUmVqZWN0LCBsYWJlbCkpO1xuICB9XG5cbiAgUHJvbWlzZUhhc2gucHJvdG90eXBlLl9pbml0ID0gZnVuY3Rpb24gX2luaXQoQ29uc3RydWN0b3IsIG9iamVjdCkge1xuICAgIHRoaXMuX3Jlc3VsdCA9IHt9O1xuXG4gICAgdGhpcy5fZW51bWVyYXRlKG9iamVjdCk7XG4gICAgaWYgKHRoaXMuX3JlbWFpbmluZyA9PT0gMCkge1xuICAgICAgZnVsZmlsbCh0aGlzLnByb21pc2UsIHRoaXMuX3Jlc3VsdCk7XG4gICAgfVxuICB9O1xuXG4gIFByb21pc2VIYXNoLnByb3RvdHlwZS5fZW51bWVyYXRlID0gZnVuY3Rpb24gX2VudW1lcmF0ZShpbnB1dCkge1xuICAgIHZhciBwcm9taXNlID0gdGhpcy5wcm9taXNlO1xuICAgIHZhciByZXN1bHRzID0gW107XG5cbiAgICBmb3IgKHZhciBrZXkgaW4gaW5wdXQpIHtcbiAgICAgIGlmIChoYXNPd25Qcm9wZXJ0eS5jYWxsKGlucHV0LCBrZXkpKSB7XG4gICAgICAgIHJlc3VsdHMucHVzaCh7XG4gICAgICAgICAgcG9zaXRpb246IGtleSxcbiAgICAgICAgICBlbnRyeTogaW5wdXRba2V5XVxuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICB2YXIgbGVuZ3RoID0gcmVzdWx0cy5sZW5ndGg7XG4gICAgdGhpcy5fcmVtYWluaW5nID0gbGVuZ3RoO1xuICAgIHZhciByZXN1bHQgPSB2b2lkIDA7XG5cbiAgICBmb3IgKHZhciBpID0gMDsgcHJvbWlzZS5fc3RhdGUgPT09IFBFTkRJTkcgJiYgaSA8IGxlbmd0aDsgaSsrKSB7XG4gICAgICByZXN1bHQgPSByZXN1bHRzW2ldO1xuICAgICAgdGhpcy5fZWFjaEVudHJ5KHJlc3VsdC5lbnRyeSwgcmVzdWx0LnBvc2l0aW9uKTtcbiAgICB9XG4gIH07XG5cbiAgcmV0dXJuIFByb21pc2VIYXNoO1xufShFbnVtZXJhdG9yKTtcblxuLyoqXG4gIGBSU1ZQLmhhc2hgIGlzIHNpbWlsYXIgdG8gYFJTVlAuYWxsYCwgYnV0IHRha2VzIGFuIG9iamVjdCBpbnN0ZWFkIG9mIGFuIGFycmF5XG4gIGZvciBpdHMgYHByb21pc2VzYCBhcmd1bWVudC5cblxuICBSZXR1cm5zIGEgcHJvbWlzZSB0aGF0IGlzIGZ1bGZpbGxlZCB3aGVuIGFsbCB0aGUgZ2l2ZW4gcHJvbWlzZXMgaGF2ZSBiZWVuXG4gIGZ1bGZpbGxlZCwgb3IgcmVqZWN0ZWQgaWYgYW55IG9mIHRoZW0gYmVjb21lIHJlamVjdGVkLiBUaGUgcmV0dXJuZWQgcHJvbWlzZVxuICBpcyBmdWxmaWxsZWQgd2l0aCBhIGhhc2ggdGhhdCBoYXMgdGhlIHNhbWUga2V5IG5hbWVzIGFzIHRoZSBgcHJvbWlzZXNgIG9iamVjdFxuICBhcmd1bWVudC4gSWYgYW55IG9mIHRoZSB2YWx1ZXMgaW4gdGhlIG9iamVjdCBhcmUgbm90IHByb21pc2VzLCB0aGV5IHdpbGxcbiAgc2ltcGx5IGJlIGNvcGllZCBvdmVyIHRvIHRoZSBmdWxmaWxsZWQgb2JqZWN0LlxuXG4gIEV4YW1wbGU6XG5cbiAgYGBgamF2YXNjcmlwdFxuICBsZXQgcHJvbWlzZXMgPSB7XG4gICAgbXlQcm9taXNlOiBSU1ZQLnJlc29sdmUoMSksXG4gICAgeW91clByb21pc2U6IFJTVlAucmVzb2x2ZSgyKSxcbiAgICB0aGVpclByb21pc2U6IFJTVlAucmVzb2x2ZSgzKSxcbiAgICBub3RBUHJvbWlzZTogNFxuICB9O1xuXG4gIFJTVlAuaGFzaChwcm9taXNlcykudGhlbihmdW5jdGlvbihoYXNoKXtcbiAgICAvLyBoYXNoIGhlcmUgaXMgYW4gb2JqZWN0IHRoYXQgbG9va3MgbGlrZTpcbiAgICAvLyB7XG4gICAgLy8gICBteVByb21pc2U6IDEsXG4gICAgLy8gICB5b3VyUHJvbWlzZTogMixcbiAgICAvLyAgIHRoZWlyUHJvbWlzZTogMyxcbiAgICAvLyAgIG5vdEFQcm9taXNlOiA0XG4gICAgLy8gfVxuICB9KTtcbiAgYGBgYFxuXG4gIElmIGFueSBvZiB0aGUgYHByb21pc2VzYCBnaXZlbiB0byBgUlNWUC5oYXNoYCBhcmUgcmVqZWN0ZWQsIHRoZSBmaXJzdCBwcm9taXNlXG4gIHRoYXQgaXMgcmVqZWN0ZWQgd2lsbCBiZSBnaXZlbiBhcyB0aGUgcmVhc29uIHRvIHRoZSByZWplY3Rpb24gaGFuZGxlci5cblxuICBFeGFtcGxlOlxuXG4gIGBgYGphdmFzY3JpcHRcbiAgbGV0IHByb21pc2VzID0ge1xuICAgIG15UHJvbWlzZTogUlNWUC5yZXNvbHZlKDEpLFxuICAgIHJlamVjdGVkUHJvbWlzZTogUlNWUC5yZWplY3QobmV3IEVycm9yKCdyZWplY3RlZFByb21pc2UnKSksXG4gICAgYW5vdGhlclJlamVjdGVkUHJvbWlzZTogUlNWUC5yZWplY3QobmV3IEVycm9yKCdhbm90aGVyUmVqZWN0ZWRQcm9taXNlJykpLFxuICB9O1xuXG4gIFJTVlAuaGFzaChwcm9taXNlcykudGhlbihmdW5jdGlvbihoYXNoKXtcbiAgICAvLyBDb2RlIGhlcmUgbmV2ZXIgcnVucyBiZWNhdXNlIHRoZXJlIGFyZSByZWplY3RlZCBwcm9taXNlcyFcbiAgfSwgZnVuY3Rpb24ocmVhc29uKSB7XG4gICAgLy8gcmVhc29uLm1lc3NhZ2UgPT09ICdyZWplY3RlZFByb21pc2UnXG4gIH0pO1xuICBgYGBcblxuICBBbiBpbXBvcnRhbnQgbm90ZTogYFJTVlAuaGFzaGAgaXMgaW50ZW5kZWQgZm9yIHBsYWluIEphdmFTY3JpcHQgb2JqZWN0cyB0aGF0XG4gIGFyZSBqdXN0IGEgc2V0IG9mIGtleXMgYW5kIHZhbHVlcy4gYFJTVlAuaGFzaGAgd2lsbCBOT1QgcHJlc2VydmUgcHJvdG90eXBlXG4gIGNoYWlucy5cblxuICBFeGFtcGxlOlxuXG4gIGBgYGphdmFzY3JpcHRcbiAgZnVuY3Rpb24gTXlDb25zdHJ1Y3Rvcigpe1xuICAgIHRoaXMuZXhhbXBsZSA9IFJTVlAucmVzb2x2ZSgnRXhhbXBsZScpO1xuICB9XG5cbiAgTXlDb25zdHJ1Y3Rvci5wcm90b3R5cGUgPSB7XG4gICAgcHJvdG9Qcm9wZXJ0eTogUlNWUC5yZXNvbHZlKCdQcm90byBQcm9wZXJ0eScpXG4gIH07XG5cbiAgbGV0IG15T2JqZWN0ID0gbmV3IE15Q29uc3RydWN0b3IoKTtcblxuICBSU1ZQLmhhc2gobXlPYmplY3QpLnRoZW4oZnVuY3Rpb24oaGFzaCl7XG4gICAgLy8gcHJvdG9Qcm9wZXJ0eSB3aWxsIG5vdCBiZSBwcmVzZW50LCBpbnN0ZWFkIHlvdSB3aWxsIGp1c3QgaGF2ZSBhblxuICAgIC8vIG9iamVjdCB0aGF0IGxvb2tzIGxpa2U6XG4gICAgLy8ge1xuICAgIC8vICAgZXhhbXBsZTogJ0V4YW1wbGUnXG4gICAgLy8gfVxuICAgIC8vXG4gICAgLy8gaGFzaC5oYXNPd25Qcm9wZXJ0eSgncHJvdG9Qcm9wZXJ0eScpOyAvLyBmYWxzZVxuICAgIC8vICd1bmRlZmluZWQnID09PSB0eXBlb2YgaGFzaC5wcm90b1Byb3BlcnR5XG4gIH0pO1xuICBgYGBcblxuICBAbWV0aG9kIGhhc2hcbiAgQHN0YXRpY1xuICBAZm9yIFJTVlBcbiAgQHBhcmFtIHtPYmplY3R9IG9iamVjdFxuICBAcGFyYW0ge1N0cmluZ30gbGFiZWwgb3B0aW9uYWwgc3RyaW5nIHRoYXQgZGVzY3JpYmVzIHRoZSBwcm9taXNlLlxuICBVc2VmdWwgZm9yIHRvb2xpbmcuXG4gIEByZXR1cm4ge1Byb21pc2V9IHByb21pc2UgdGhhdCBpcyBmdWxmaWxsZWQgd2hlbiBhbGwgcHJvcGVydGllcyBvZiBgcHJvbWlzZXNgXG4gIGhhdmUgYmVlbiBmdWxmaWxsZWQsIG9yIHJlamVjdGVkIGlmIGFueSBvZiB0aGVtIGJlY29tZSByZWplY3RlZC5cbiovXG5mdW5jdGlvbiBoYXNoKG9iamVjdCwgbGFiZWwpIHtcbiAgaWYgKCFpc09iamVjdChvYmplY3QpKSB7XG4gICAgcmV0dXJuIFByb21pc2UucmVqZWN0KG5ldyBUeXBlRXJyb3IoXCJQcm9taXNlLmhhc2ggbXVzdCBiZSBjYWxsZWQgd2l0aCBhbiBvYmplY3RcIiksIGxhYmVsKTtcbiAgfVxuXG4gIHJldHVybiBuZXcgUHJvbWlzZUhhc2goUHJvbWlzZSwgb2JqZWN0LCBsYWJlbCkucHJvbWlzZTtcbn1cblxuZnVuY3Rpb24gX3Bvc3NpYmxlQ29uc3RydWN0b3JSZXR1cm4kMihzZWxmLCBjYWxsKSB7IGlmICghc2VsZikgeyB0aHJvdyBuZXcgUmVmZXJlbmNlRXJyb3IoXCJ0aGlzIGhhc24ndCBiZWVuIGluaXRpYWxpc2VkIC0gc3VwZXIoKSBoYXNuJ3QgYmVlbiBjYWxsZWRcIik7IH0gcmV0dXJuIGNhbGwgJiYgKHR5cGVvZiBjYWxsID09PSBcIm9iamVjdFwiIHx8IHR5cGVvZiBjYWxsID09PSBcImZ1bmN0aW9uXCIpID8gY2FsbCA6IHNlbGY7IH1cblxuZnVuY3Rpb24gX2luaGVyaXRzJDIoc3ViQ2xhc3MsIHN1cGVyQ2xhc3MpIHsgaWYgKHR5cGVvZiBzdXBlckNsYXNzICE9PSBcImZ1bmN0aW9uXCIgJiYgc3VwZXJDbGFzcyAhPT0gbnVsbCkgeyB0aHJvdyBuZXcgVHlwZUVycm9yKFwiU3VwZXIgZXhwcmVzc2lvbiBtdXN0IGVpdGhlciBiZSBudWxsIG9yIGEgZnVuY3Rpb24sIG5vdCBcIiArIHR5cGVvZiBzdXBlckNsYXNzKTsgfSBzdWJDbGFzcy5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKHN1cGVyQ2xhc3MgJiYgc3VwZXJDbGFzcy5wcm90b3R5cGUsIHsgY29uc3RydWN0b3I6IHsgdmFsdWU6IHN1YkNsYXNzLCBlbnVtZXJhYmxlOiBmYWxzZSwgd3JpdGFibGU6IHRydWUsIGNvbmZpZ3VyYWJsZTogdHJ1ZSB9IH0pOyBpZiAoc3VwZXJDbGFzcykgT2JqZWN0LnNldFByb3RvdHlwZU9mID8gT2JqZWN0LnNldFByb3RvdHlwZU9mKHN1YkNsYXNzLCBzdXBlckNsYXNzKSA6IHN1YkNsYXNzLl9fcHJvdG9fXyA9IHN1cGVyQ2xhc3M7IH1cblxudmFyIEhhc2hTZXR0bGVkID0gZnVuY3Rpb24gKF9Qcm9taXNlSGFzaCkge1xuICBfaW5oZXJpdHMkMihIYXNoU2V0dGxlZCwgX1Byb21pc2VIYXNoKTtcblxuICBmdW5jdGlvbiBIYXNoU2V0dGxlZChDb25zdHJ1Y3Rvciwgb2JqZWN0LCBsYWJlbCkge1xuICAgIHJldHVybiBfcG9zc2libGVDb25zdHJ1Y3RvclJldHVybiQyKHRoaXMsIF9Qcm9taXNlSGFzaC5jYWxsKHRoaXMsIENvbnN0cnVjdG9yLCBvYmplY3QsIGZhbHNlLCBsYWJlbCkpO1xuICB9XG5cbiAgcmV0dXJuIEhhc2hTZXR0bGVkO1xufShQcm9taXNlSGFzaCk7XG5cbkhhc2hTZXR0bGVkLnByb3RvdHlwZS5fbWFrZVJlc3VsdCA9IG1ha2VTZXR0bGVkUmVzdWx0O1xuXG4vKipcbiAgYFJTVlAuaGFzaFNldHRsZWRgIGlzIHNpbWlsYXIgdG8gYFJTVlAuYWxsU2V0dGxlZGAsIGJ1dCB0YWtlcyBhbiBvYmplY3RcbiAgaW5zdGVhZCBvZiBhbiBhcnJheSBmb3IgaXRzIGBwcm9taXNlc2AgYXJndW1lbnQuXG5cbiAgVW5saWtlIGBSU1ZQLmFsbGAgb3IgYFJTVlAuaGFzaGAsIHdoaWNoIGltcGxlbWVudCBhIGZhaWwtZmFzdCBtZXRob2QsXG4gIGJ1dCBsaWtlIGBSU1ZQLmFsbFNldHRsZWRgLCBgaGFzaFNldHRsZWRgIHdhaXRzIHVudGlsIGFsbCB0aGVcbiAgY29uc3RpdHVlbnQgcHJvbWlzZXMgaGF2ZSByZXR1cm5lZCBhbmQgdGhlbiBzaG93cyB5b3UgYWxsIHRoZSByZXN1bHRzXG4gIHdpdGggdGhlaXIgc3RhdGVzIGFuZCB2YWx1ZXMvcmVhc29ucy4gVGhpcyBpcyB1c2VmdWwgaWYgeW91IHdhbnQgdG9cbiAgaGFuZGxlIG11bHRpcGxlIHByb21pc2VzJyBmYWlsdXJlIHN0YXRlcyB0b2dldGhlciBhcyBhIHNldC5cblxuICBSZXR1cm5zIGEgcHJvbWlzZSB0aGF0IGlzIGZ1bGZpbGxlZCB3aGVuIGFsbCB0aGUgZ2l2ZW4gcHJvbWlzZXMgaGF2ZSBiZWVuXG4gIHNldHRsZWQsIG9yIHJlamVjdGVkIGlmIHRoZSBwYXNzZWQgcGFyYW1ldGVycyBhcmUgaW52YWxpZC5cblxuICBUaGUgcmV0dXJuZWQgcHJvbWlzZSBpcyBmdWxmaWxsZWQgd2l0aCBhIGhhc2ggdGhhdCBoYXMgdGhlIHNhbWUga2V5IG5hbWVzIGFzXG4gIHRoZSBgcHJvbWlzZXNgIG9iamVjdCBhcmd1bWVudC4gSWYgYW55IG9mIHRoZSB2YWx1ZXMgaW4gdGhlIG9iamVjdCBhcmUgbm90XG4gIHByb21pc2VzLCB0aGV5IHdpbGwgYmUgY29waWVkIG92ZXIgdG8gdGhlIGZ1bGZpbGxlZCBvYmplY3QgYW5kIG1hcmtlZCB3aXRoIHN0YXRlXG4gICdmdWxmaWxsZWQnLlxuXG4gIEV4YW1wbGU6XG5cbiAgYGBgamF2YXNjcmlwdFxuICBsZXQgcHJvbWlzZXMgPSB7XG4gICAgbXlQcm9taXNlOiBSU1ZQLlByb21pc2UucmVzb2x2ZSgxKSxcbiAgICB5b3VyUHJvbWlzZTogUlNWUC5Qcm9taXNlLnJlc29sdmUoMiksXG4gICAgdGhlaXJQcm9taXNlOiBSU1ZQLlByb21pc2UucmVzb2x2ZSgzKSxcbiAgICBub3RBUHJvbWlzZTogNFxuICB9O1xuXG4gIFJTVlAuaGFzaFNldHRsZWQocHJvbWlzZXMpLnRoZW4oZnVuY3Rpb24oaGFzaCl7XG4gICAgLy8gaGFzaCBoZXJlIGlzIGFuIG9iamVjdCB0aGF0IGxvb2tzIGxpa2U6XG4gICAgLy8ge1xuICAgIC8vICAgbXlQcm9taXNlOiB7IHN0YXRlOiAnZnVsZmlsbGVkJywgdmFsdWU6IDEgfSxcbiAgICAvLyAgIHlvdXJQcm9taXNlOiB7IHN0YXRlOiAnZnVsZmlsbGVkJywgdmFsdWU6IDIgfSxcbiAgICAvLyAgIHRoZWlyUHJvbWlzZTogeyBzdGF0ZTogJ2Z1bGZpbGxlZCcsIHZhbHVlOiAzIH0sXG4gICAgLy8gICBub3RBUHJvbWlzZTogeyBzdGF0ZTogJ2Z1bGZpbGxlZCcsIHZhbHVlOiA0IH1cbiAgICAvLyB9XG4gIH0pO1xuICBgYGBcblxuICBJZiBhbnkgb2YgdGhlIGBwcm9taXNlc2AgZ2l2ZW4gdG8gYFJTVlAuaGFzaGAgYXJlIHJlamVjdGVkLCB0aGUgc3RhdGUgd2lsbFxuICBiZSBzZXQgdG8gJ3JlamVjdGVkJyBhbmQgdGhlIHJlYXNvbiBmb3IgcmVqZWN0aW9uIHByb3ZpZGVkLlxuXG4gIEV4YW1wbGU6XG5cbiAgYGBgamF2YXNjcmlwdFxuICBsZXQgcHJvbWlzZXMgPSB7XG4gICAgbXlQcm9taXNlOiBSU1ZQLlByb21pc2UucmVzb2x2ZSgxKSxcbiAgICByZWplY3RlZFByb21pc2U6IFJTVlAuUHJvbWlzZS5yZWplY3QobmV3IEVycm9yKCdyZWplY3Rpb24nKSksXG4gICAgYW5vdGhlclJlamVjdGVkUHJvbWlzZTogUlNWUC5Qcm9taXNlLnJlamVjdChuZXcgRXJyb3IoJ21vcmUgcmVqZWN0aW9uJykpLFxuICB9O1xuXG4gIFJTVlAuaGFzaFNldHRsZWQocHJvbWlzZXMpLnRoZW4oZnVuY3Rpb24oaGFzaCl7XG4gICAgLy8gaGFzaCBoZXJlIGlzIGFuIG9iamVjdCB0aGF0IGxvb2tzIGxpa2U6XG4gICAgLy8ge1xuICAgIC8vICAgbXlQcm9taXNlOiAgICAgICAgICAgICAgeyBzdGF0ZTogJ2Z1bGZpbGxlZCcsIHZhbHVlOiAxIH0sXG4gICAgLy8gICByZWplY3RlZFByb21pc2U6ICAgICAgICB7IHN0YXRlOiAncmVqZWN0ZWQnLCByZWFzb246IEVycm9yIH0sXG4gICAgLy8gICBhbm90aGVyUmVqZWN0ZWRQcm9taXNlOiB7IHN0YXRlOiAncmVqZWN0ZWQnLCByZWFzb246IEVycm9yIH0sXG4gICAgLy8gfVxuICAgIC8vIE5vdGUgdGhhdCBmb3IgcmVqZWN0ZWRQcm9taXNlLCByZWFzb24ubWVzc2FnZSA9PSAncmVqZWN0aW9uJyxcbiAgICAvLyBhbmQgZm9yIGFub3RoZXJSZWplY3RlZFByb21pc2UsIHJlYXNvbi5tZXNzYWdlID09ICdtb3JlIHJlamVjdGlvbicuXG4gIH0pO1xuICBgYGBcblxuICBBbiBpbXBvcnRhbnQgbm90ZTogYFJTVlAuaGFzaFNldHRsZWRgIGlzIGludGVuZGVkIGZvciBwbGFpbiBKYXZhU2NyaXB0IG9iamVjdHMgdGhhdFxuICBhcmUganVzdCBhIHNldCBvZiBrZXlzIGFuZCB2YWx1ZXMuIGBSU1ZQLmhhc2hTZXR0bGVkYCB3aWxsIE5PVCBwcmVzZXJ2ZSBwcm90b3R5cGVcbiAgY2hhaW5zLlxuXG4gIEV4YW1wbGU6XG5cbiAgYGBgamF2YXNjcmlwdFxuICBmdW5jdGlvbiBNeUNvbnN0cnVjdG9yKCl7XG4gICAgdGhpcy5leGFtcGxlID0gUlNWUC5Qcm9taXNlLnJlc29sdmUoJ0V4YW1wbGUnKTtcbiAgfVxuXG4gIE15Q29uc3RydWN0b3IucHJvdG90eXBlID0ge1xuICAgIHByb3RvUHJvcGVydHk6IFJTVlAuUHJvbWlzZS5yZXNvbHZlKCdQcm90byBQcm9wZXJ0eScpXG4gIH07XG5cbiAgbGV0IG15T2JqZWN0ID0gbmV3IE15Q29uc3RydWN0b3IoKTtcblxuICBSU1ZQLmhhc2hTZXR0bGVkKG15T2JqZWN0KS50aGVuKGZ1bmN0aW9uKGhhc2gpe1xuICAgIC8vIHByb3RvUHJvcGVydHkgd2lsbCBub3QgYmUgcHJlc2VudCwgaW5zdGVhZCB5b3Ugd2lsbCBqdXN0IGhhdmUgYW5cbiAgICAvLyBvYmplY3QgdGhhdCBsb29rcyBsaWtlOlxuICAgIC8vIHtcbiAgICAvLyAgIGV4YW1wbGU6IHsgc3RhdGU6ICdmdWxmaWxsZWQnLCB2YWx1ZTogJ0V4YW1wbGUnIH1cbiAgICAvLyB9XG4gICAgLy9cbiAgICAvLyBoYXNoLmhhc093blByb3BlcnR5KCdwcm90b1Byb3BlcnR5Jyk7IC8vIGZhbHNlXG4gICAgLy8gJ3VuZGVmaW5lZCcgPT09IHR5cGVvZiBoYXNoLnByb3RvUHJvcGVydHlcbiAgfSk7XG4gIGBgYFxuXG4gIEBtZXRob2QgaGFzaFNldHRsZWRcbiAgQGZvciBSU1ZQXG4gIEBwYXJhbSB7T2JqZWN0fSBvYmplY3RcbiAgQHBhcmFtIHtTdHJpbmd9IGxhYmVsIG9wdGlvbmFsIHN0cmluZyB0aGF0IGRlc2NyaWJlcyB0aGUgcHJvbWlzZS5cbiAgVXNlZnVsIGZvciB0b29saW5nLlxuICBAcmV0dXJuIHtQcm9taXNlfSBwcm9taXNlIHRoYXQgaXMgZnVsZmlsbGVkIHdoZW4gd2hlbiBhbGwgcHJvcGVydGllcyBvZiBgcHJvbWlzZXNgXG4gIGhhdmUgYmVlbiBzZXR0bGVkLlxuICBAc3RhdGljXG4qL1xuXG5mdW5jdGlvbiBoYXNoU2V0dGxlZChvYmplY3QsIGxhYmVsKSB7XG4gIGlmICghaXNPYmplY3Qob2JqZWN0KSkge1xuICAgIHJldHVybiBQcm9taXNlLnJlamVjdChuZXcgVHlwZUVycm9yKFwiUlNWUC5oYXNoU2V0dGxlZCBtdXN0IGJlIGNhbGxlZCB3aXRoIGFuIG9iamVjdFwiKSwgbGFiZWwpO1xuICB9XG5cbiAgcmV0dXJuIG5ldyBIYXNoU2V0dGxlZChQcm9taXNlLCBvYmplY3QsIGZhbHNlLCBsYWJlbCkucHJvbWlzZTtcbn1cblxuLyoqXG4gIGBSU1ZQLnJldGhyb3dgIHdpbGwgcmV0aHJvdyBhbiBlcnJvciBvbiB0aGUgbmV4dCB0dXJuIG9mIHRoZSBKYXZhU2NyaXB0IGV2ZW50XG4gIGxvb3AgaW4gb3JkZXIgdG8gYWlkIGRlYnVnZ2luZy5cblxuICBQcm9taXNlcyBBKyBzcGVjaWZpZXMgdGhhdCBhbnkgZXhjZXB0aW9ucyB0aGF0IG9jY3VyIHdpdGggYSBwcm9taXNlIG11c3QgYmVcbiAgY2F1Z2h0IGJ5IHRoZSBwcm9taXNlcyBpbXBsZW1lbnRhdGlvbiBhbmQgYnViYmxlZCB0byB0aGUgbGFzdCBoYW5kbGVyLiBGb3JcbiAgdGhpcyByZWFzb24sIGl0IGlzIHJlY29tbWVuZGVkIHRoYXQgeW91IGFsd2F5cyBzcGVjaWZ5IGEgc2Vjb25kIHJlamVjdGlvblxuICBoYW5kbGVyIGZ1bmN0aW9uIHRvIGB0aGVuYC4gSG93ZXZlciwgYFJTVlAucmV0aHJvd2Agd2lsbCB0aHJvdyB0aGUgZXhjZXB0aW9uXG4gIG91dHNpZGUgb2YgdGhlIHByb21pc2UsIHNvIGl0IGJ1YmJsZXMgdXAgdG8geW91ciBjb25zb2xlIGlmIGluIHRoZSBicm93c2VyLFxuICBvciBkb21haW4vY2F1c2UgdW5jYXVnaHQgZXhjZXB0aW9uIGluIE5vZGUuIGByZXRocm93YCB3aWxsIGFsc28gdGhyb3cgdGhlXG4gIGVycm9yIGFnYWluIHNvIHRoZSBlcnJvciBjYW4gYmUgaGFuZGxlZCBieSB0aGUgcHJvbWlzZSBwZXIgdGhlIHNwZWMuXG5cbiAgYGBgamF2YXNjcmlwdFxuICBmdW5jdGlvbiB0aHJvd3MoKXtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ1dob29wcyEnKTtcbiAgfVxuXG4gIGxldCBwcm9taXNlID0gbmV3IFJTVlAuUHJvbWlzZShmdW5jdGlvbihyZXNvbHZlLCByZWplY3Qpe1xuICAgIHRocm93cygpO1xuICB9KTtcblxuICBwcm9taXNlLmNhdGNoKFJTVlAucmV0aHJvdykudGhlbihmdW5jdGlvbigpe1xuICAgIC8vIENvZGUgaGVyZSBkb2Vzbid0IHJ1biBiZWNhdXNlIHRoZSBwcm9taXNlIGJlY2FtZSByZWplY3RlZCBkdWUgdG8gYW5cbiAgICAvLyBlcnJvciFcbiAgfSwgZnVuY3Rpb24gKGVycil7XG4gICAgLy8gaGFuZGxlIHRoZSBlcnJvciBoZXJlXG4gIH0pO1xuICBgYGBcblxuICBUaGUgJ1dob29wcycgZXJyb3Igd2lsbCBiZSB0aHJvd24gb24gdGhlIG5leHQgdHVybiBvZiB0aGUgZXZlbnQgbG9vcFxuICBhbmQgeW91IGNhbiB3YXRjaCBmb3IgaXQgaW4geW91ciBjb25zb2xlLiBZb3UgY2FuIGFsc28gaGFuZGxlIGl0IHVzaW5nIGFcbiAgcmVqZWN0aW9uIGhhbmRsZXIgZ2l2ZW4gdG8gYC50aGVuYCBvciBgLmNhdGNoYCBvbiB0aGUgcmV0dXJuZWQgcHJvbWlzZS5cblxuICBAbWV0aG9kIHJldGhyb3dcbiAgQHN0YXRpY1xuICBAZm9yIFJTVlBcbiAgQHBhcmFtIHtFcnJvcn0gcmVhc29uIHJlYXNvbiB0aGUgcHJvbWlzZSBiZWNhbWUgcmVqZWN0ZWQuXG4gIEB0aHJvd3MgRXJyb3JcbiAgQHN0YXRpY1xuKi9cbmZ1bmN0aW9uIHJldGhyb3cocmVhc29uKSB7XG4gIHNldFRpbWVvdXQoZnVuY3Rpb24gKCkge1xuICAgIHRocm93IHJlYXNvbjtcbiAgfSk7XG4gIHRocm93IHJlYXNvbjtcbn1cblxuLyoqXG4gIGBSU1ZQLmRlZmVyYCByZXR1cm5zIGFuIG9iamVjdCBzaW1pbGFyIHRvIGpRdWVyeSdzIGAkLkRlZmVycmVkYC5cbiAgYFJTVlAuZGVmZXJgIHNob3VsZCBiZSB1c2VkIHdoZW4gcG9ydGluZyBvdmVyIGNvZGUgcmVsaWFudCBvbiBgJC5EZWZlcnJlZGAnc1xuICBpbnRlcmZhY2UuIE5ldyBjb2RlIHNob3VsZCB1c2UgdGhlIGBSU1ZQLlByb21pc2VgIGNvbnN0cnVjdG9yIGluc3RlYWQuXG5cbiAgVGhlIG9iamVjdCByZXR1cm5lZCBmcm9tIGBSU1ZQLmRlZmVyYCBpcyBhIHBsYWluIG9iamVjdCB3aXRoIHRocmVlIHByb3BlcnRpZXM6XG5cbiAgKiBwcm9taXNlIC0gYW4gYFJTVlAuUHJvbWlzZWAuXG4gICogcmVqZWN0IC0gYSBmdW5jdGlvbiB0aGF0IGNhdXNlcyB0aGUgYHByb21pc2VgIHByb3BlcnR5IG9uIHRoaXMgb2JqZWN0IHRvXG4gICAgYmVjb21lIHJlamVjdGVkXG4gICogcmVzb2x2ZSAtIGEgZnVuY3Rpb24gdGhhdCBjYXVzZXMgdGhlIGBwcm9taXNlYCBwcm9wZXJ0eSBvbiB0aGlzIG9iamVjdCB0b1xuICAgIGJlY29tZSBmdWxmaWxsZWQuXG5cbiAgRXhhbXBsZTpcblxuICAgYGBgamF2YXNjcmlwdFxuICAgbGV0IGRlZmVycmVkID0gUlNWUC5kZWZlcigpO1xuXG4gICBkZWZlcnJlZC5yZXNvbHZlKFwiU3VjY2VzcyFcIik7XG5cbiAgIGRlZmVycmVkLnByb21pc2UudGhlbihmdW5jdGlvbih2YWx1ZSl7XG4gICAgIC8vIHZhbHVlIGhlcmUgaXMgXCJTdWNjZXNzIVwiXG4gICB9KTtcbiAgIGBgYFxuXG4gIEBtZXRob2QgZGVmZXJcbiAgQHN0YXRpY1xuICBAZm9yIFJTVlBcbiAgQHBhcmFtIHtTdHJpbmd9IGxhYmVsIG9wdGlvbmFsIHN0cmluZyBmb3IgbGFiZWxpbmcgdGhlIHByb21pc2UuXG4gIFVzZWZ1bCBmb3IgdG9vbGluZy5cbiAgQHJldHVybiB7T2JqZWN0fVxuICovXG5cbmZ1bmN0aW9uIGRlZmVyKGxhYmVsKSB7XG4gIHZhciBkZWZlcnJlZCA9IHsgcmVzb2x2ZTogdW5kZWZpbmVkLCByZWplY3Q6IHVuZGVmaW5lZCB9O1xuXG4gIGRlZmVycmVkLnByb21pc2UgPSBuZXcgUHJvbWlzZShmdW5jdGlvbiAocmVzb2x2ZSwgcmVqZWN0KSB7XG4gICAgZGVmZXJyZWQucmVzb2x2ZSA9IHJlc29sdmU7XG4gICAgZGVmZXJyZWQucmVqZWN0ID0gcmVqZWN0O1xuICB9LCBsYWJlbCk7XG5cbiAgcmV0dXJuIGRlZmVycmVkO1xufVxuXG4vKipcbiBgUlNWUC5tYXBgIGlzIHNpbWlsYXIgdG8gSmF2YVNjcmlwdCdzIG5hdGl2ZSBgbWFwYCBtZXRob2QsIGV4Y2VwdCB0aGF0IGl0XG4gIHdhaXRzIGZvciBhbGwgcHJvbWlzZXMgdG8gYmVjb21lIGZ1bGZpbGxlZCBiZWZvcmUgcnVubmluZyB0aGUgYG1hcEZuYCBvblxuICBlYWNoIGl0ZW0gaW4gZ2l2ZW4gdG8gYHByb21pc2VzYC4gYFJTVlAubWFwYCByZXR1cm5zIGEgcHJvbWlzZSB0aGF0IHdpbGxcbiAgYmVjb21lIGZ1bGZpbGxlZCB3aXRoIHRoZSByZXN1bHQgb2YgcnVubmluZyBgbWFwRm5gIG9uIHRoZSB2YWx1ZXMgdGhlIHByb21pc2VzXG4gIGJlY29tZSBmdWxmaWxsZWQgd2l0aC5cblxuICBGb3IgZXhhbXBsZTpcblxuICBgYGBqYXZhc2NyaXB0XG5cbiAgbGV0IHByb21pc2UxID0gUlNWUC5yZXNvbHZlKDEpO1xuICBsZXQgcHJvbWlzZTIgPSBSU1ZQLnJlc29sdmUoMik7XG4gIGxldCBwcm9taXNlMyA9IFJTVlAucmVzb2x2ZSgzKTtcbiAgbGV0IHByb21pc2VzID0gWyBwcm9taXNlMSwgcHJvbWlzZTIsIHByb21pc2UzIF07XG5cbiAgbGV0IG1hcEZuID0gZnVuY3Rpb24oaXRlbSl7XG4gICAgcmV0dXJuIGl0ZW0gKyAxO1xuICB9O1xuXG4gIFJTVlAubWFwKHByb21pc2VzLCBtYXBGbikudGhlbihmdW5jdGlvbihyZXN1bHQpe1xuICAgIC8vIHJlc3VsdCBpcyBbIDIsIDMsIDQgXVxuICB9KTtcbiAgYGBgXG5cbiAgSWYgYW55IG9mIHRoZSBgcHJvbWlzZXNgIGdpdmVuIHRvIGBSU1ZQLm1hcGAgYXJlIHJlamVjdGVkLCB0aGUgZmlyc3QgcHJvbWlzZVxuICB0aGF0IGlzIHJlamVjdGVkIHdpbGwgYmUgZ2l2ZW4gYXMgYW4gYXJndW1lbnQgdG8gdGhlIHJldHVybmVkIHByb21pc2Unc1xuICByZWplY3Rpb24gaGFuZGxlci4gRm9yIGV4YW1wbGU6XG5cbiAgYGBgamF2YXNjcmlwdFxuICBsZXQgcHJvbWlzZTEgPSBSU1ZQLnJlc29sdmUoMSk7XG4gIGxldCBwcm9taXNlMiA9IFJTVlAucmVqZWN0KG5ldyBFcnJvcignMicpKTtcbiAgbGV0IHByb21pc2UzID0gUlNWUC5yZWplY3QobmV3IEVycm9yKCczJykpO1xuICBsZXQgcHJvbWlzZXMgPSBbIHByb21pc2UxLCBwcm9taXNlMiwgcHJvbWlzZTMgXTtcblxuICBsZXQgbWFwRm4gPSBmdW5jdGlvbihpdGVtKXtcbiAgICByZXR1cm4gaXRlbSArIDE7XG4gIH07XG5cbiAgUlNWUC5tYXAocHJvbWlzZXMsIG1hcEZuKS50aGVuKGZ1bmN0aW9uKGFycmF5KXtcbiAgICAvLyBDb2RlIGhlcmUgbmV2ZXIgcnVucyBiZWNhdXNlIHRoZXJlIGFyZSByZWplY3RlZCBwcm9taXNlcyFcbiAgfSwgZnVuY3Rpb24ocmVhc29uKSB7XG4gICAgLy8gcmVhc29uLm1lc3NhZ2UgPT09ICcyJ1xuICB9KTtcbiAgYGBgXG5cbiAgYFJTVlAubWFwYCB3aWxsIGFsc28gd2FpdCBpZiBhIHByb21pc2UgaXMgcmV0dXJuZWQgZnJvbSBgbWFwRm5gLiBGb3IgZXhhbXBsZSxcbiAgc2F5IHlvdSB3YW50IHRvIGdldCBhbGwgY29tbWVudHMgZnJvbSBhIHNldCBvZiBibG9nIHBvc3RzLCBidXQgeW91IG5lZWRcbiAgdGhlIGJsb2cgcG9zdHMgZmlyc3QgYmVjYXVzZSB0aGV5IGNvbnRhaW4gYSB1cmwgdG8gdGhvc2UgY29tbWVudHMuXG5cbiAgYGBgamF2c2NyaXB0XG5cbiAgbGV0IG1hcEZuID0gZnVuY3Rpb24oYmxvZ1Bvc3Qpe1xuICAgIC8vIGdldENvbW1lbnRzIGRvZXMgc29tZSBhamF4IGFuZCByZXR1cm5zIGFuIFJTVlAuUHJvbWlzZSB0aGF0IGlzIGZ1bGZpbGxlZFxuICAgIC8vIHdpdGggc29tZSBjb21tZW50cyBkYXRhXG4gICAgcmV0dXJuIGdldENvbW1lbnRzKGJsb2dQb3N0LmNvbW1lbnRzX3VybCk7XG4gIH07XG5cbiAgLy8gZ2V0QmxvZ1Bvc3RzIGRvZXMgc29tZSBhamF4IGFuZCByZXR1cm5zIGFuIFJTVlAuUHJvbWlzZSB0aGF0IGlzIGZ1bGZpbGxlZFxuICAvLyB3aXRoIHNvbWUgYmxvZyBwb3N0IGRhdGFcbiAgUlNWUC5tYXAoZ2V0QmxvZ1Bvc3RzKCksIG1hcEZuKS50aGVuKGZ1bmN0aW9uKGNvbW1lbnRzKXtcbiAgICAvLyBjb21tZW50cyBpcyB0aGUgcmVzdWx0IG9mIGFza2luZyB0aGUgc2VydmVyIGZvciB0aGUgY29tbWVudHNcbiAgICAvLyBvZiBhbGwgYmxvZyBwb3N0cyByZXR1cm5lZCBmcm9tIGdldEJsb2dQb3N0cygpXG4gIH0pO1xuICBgYGBcblxuICBAbWV0aG9kIG1hcFxuICBAc3RhdGljXG4gIEBmb3IgUlNWUFxuICBAcGFyYW0ge0FycmF5fSBwcm9taXNlc1xuICBAcGFyYW0ge0Z1bmN0aW9ufSBtYXBGbiBmdW5jdGlvbiB0byBiZSBjYWxsZWQgb24gZWFjaCBmdWxmaWxsZWQgcHJvbWlzZS5cbiAgQHBhcmFtIHtTdHJpbmd9IGxhYmVsIG9wdGlvbmFsIHN0cmluZyBmb3IgbGFiZWxpbmcgdGhlIHByb21pc2UuXG4gIFVzZWZ1bCBmb3IgdG9vbGluZy5cbiAgQHJldHVybiB7UHJvbWlzZX0gcHJvbWlzZSB0aGF0IGlzIGZ1bGZpbGxlZCB3aXRoIHRoZSByZXN1bHQgb2YgY2FsbGluZ1xuICBgbWFwRm5gIG9uIGVhY2ggZnVsZmlsbGVkIHByb21pc2Ugb3IgdmFsdWUgd2hlbiB0aGV5IGJlY29tZSBmdWxmaWxsZWQuXG4gICBUaGUgcHJvbWlzZSB3aWxsIGJlIHJlamVjdGVkIGlmIGFueSBvZiB0aGUgZ2l2ZW4gYHByb21pc2VzYCBiZWNvbWUgcmVqZWN0ZWQuXG4gIEBzdGF0aWNcbiovXG5mdW5jdGlvbiBtYXAocHJvbWlzZXMsIG1hcEZuLCBsYWJlbCkge1xuICBpZiAoIWlzQXJyYXkocHJvbWlzZXMpKSB7XG4gICAgcmV0dXJuIFByb21pc2UucmVqZWN0KG5ldyBUeXBlRXJyb3IoXCJSU1ZQLm1hcCBtdXN0IGJlIGNhbGxlZCB3aXRoIGFuIGFycmF5XCIpLCBsYWJlbCk7XG4gIH1cblxuICBpZiAoIWlzRnVuY3Rpb24obWFwRm4pKSB7XG4gICAgcmV0dXJuIFByb21pc2UucmVqZWN0KG5ldyBUeXBlRXJyb3IoXCJSU1ZQLm1hcCBleHBlY3RzIGEgZnVuY3Rpb24gYXMgYSBzZWNvbmQgYXJndW1lbnRcIiksIGxhYmVsKTtcbiAgfVxuXG4gIHJldHVybiBQcm9taXNlLmFsbChwcm9taXNlcywgbGFiZWwpLnRoZW4oZnVuY3Rpb24gKHZhbHVlcykge1xuICAgIHZhciBsZW5ndGggPSB2YWx1ZXMubGVuZ3RoO1xuICAgIHZhciByZXN1bHRzID0gbmV3IEFycmF5KGxlbmd0aCk7XG5cbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGxlbmd0aDsgaSsrKSB7XG4gICAgICByZXN1bHRzW2ldID0gbWFwRm4odmFsdWVzW2ldKTtcbiAgICB9XG5cbiAgICByZXR1cm4gUHJvbWlzZS5hbGwocmVzdWx0cywgbGFiZWwpO1xuICB9KTtcbn1cblxuLyoqXG4gIFRoaXMgaXMgYSBjb252ZW5pZW50IGFsaWFzIGZvciBgUlNWUC5Qcm9taXNlLnJlc29sdmVgLlxuXG4gIEBtZXRob2QgcmVzb2x2ZVxuICBAc3RhdGljXG4gIEBmb3IgUlNWUFxuICBAcGFyYW0geyp9IHZhbHVlIHZhbHVlIHRoYXQgdGhlIHJldHVybmVkIHByb21pc2Ugd2lsbCBiZSByZXNvbHZlZCB3aXRoXG4gIEBwYXJhbSB7U3RyaW5nfSBsYWJlbCBvcHRpb25hbCBzdHJpbmcgZm9yIGlkZW50aWZ5aW5nIHRoZSByZXR1cm5lZCBwcm9taXNlLlxuICBVc2VmdWwgZm9yIHRvb2xpbmcuXG4gIEByZXR1cm4ge1Byb21pc2V9IGEgcHJvbWlzZSB0aGF0IHdpbGwgYmVjb21lIGZ1bGZpbGxlZCB3aXRoIHRoZSBnaXZlblxuICBgdmFsdWVgXG4qL1xuZnVuY3Rpb24gcmVzb2x2ZSQyKHZhbHVlLCBsYWJlbCkge1xuICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKHZhbHVlLCBsYWJlbCk7XG59XG5cbi8qKlxuICBUaGlzIGlzIGEgY29udmVuaWVudCBhbGlhcyBmb3IgYFJTVlAuUHJvbWlzZS5yZWplY3RgLlxuXG4gIEBtZXRob2QgcmVqZWN0XG4gIEBzdGF0aWNcbiAgQGZvciBSU1ZQXG4gIEBwYXJhbSB7Kn0gcmVhc29uIHZhbHVlIHRoYXQgdGhlIHJldHVybmVkIHByb21pc2Ugd2lsbCBiZSByZWplY3RlZCB3aXRoLlxuICBAcGFyYW0ge1N0cmluZ30gbGFiZWwgb3B0aW9uYWwgc3RyaW5nIGZvciBpZGVudGlmeWluZyB0aGUgcmV0dXJuZWQgcHJvbWlzZS5cbiAgVXNlZnVsIGZvciB0b29saW5nLlxuICBAcmV0dXJuIHtQcm9taXNlfSBhIHByb21pc2UgcmVqZWN0ZWQgd2l0aCB0aGUgZ2l2ZW4gYHJlYXNvbmAuXG4qL1xuZnVuY3Rpb24gcmVqZWN0JDIocmVhc29uLCBsYWJlbCkge1xuICByZXR1cm4gUHJvbWlzZS5yZWplY3QocmVhc29uLCBsYWJlbCk7XG59XG5cbi8qKlxuIGBSU1ZQLmZpbHRlcmAgaXMgc2ltaWxhciB0byBKYXZhU2NyaXB0J3MgbmF0aXZlIGBmaWx0ZXJgIG1ldGhvZCwgZXhjZXB0IHRoYXQgaXRcbiAgd2FpdHMgZm9yIGFsbCBwcm9taXNlcyB0byBiZWNvbWUgZnVsZmlsbGVkIGJlZm9yZSBydW5uaW5nIHRoZSBgZmlsdGVyRm5gIG9uXG4gIGVhY2ggaXRlbSBpbiBnaXZlbiB0byBgcHJvbWlzZXNgLiBgUlNWUC5maWx0ZXJgIHJldHVybnMgYSBwcm9taXNlIHRoYXQgd2lsbFxuICBiZWNvbWUgZnVsZmlsbGVkIHdpdGggdGhlIHJlc3VsdCBvZiBydW5uaW5nIGBmaWx0ZXJGbmAgb24gdGhlIHZhbHVlcyB0aGVcbiAgcHJvbWlzZXMgYmVjb21lIGZ1bGZpbGxlZCB3aXRoLlxuXG4gIEZvciBleGFtcGxlOlxuXG4gIGBgYGphdmFzY3JpcHRcblxuICBsZXQgcHJvbWlzZTEgPSBSU1ZQLnJlc29sdmUoMSk7XG4gIGxldCBwcm9taXNlMiA9IFJTVlAucmVzb2x2ZSgyKTtcbiAgbGV0IHByb21pc2UzID0gUlNWUC5yZXNvbHZlKDMpO1xuXG4gIGxldCBwcm9taXNlcyA9IFtwcm9taXNlMSwgcHJvbWlzZTIsIHByb21pc2UzXTtcblxuICBsZXQgZmlsdGVyRm4gPSBmdW5jdGlvbihpdGVtKXtcbiAgICByZXR1cm4gaXRlbSA+IDE7XG4gIH07XG5cbiAgUlNWUC5maWx0ZXIocHJvbWlzZXMsIGZpbHRlckZuKS50aGVuKGZ1bmN0aW9uKHJlc3VsdCl7XG4gICAgLy8gcmVzdWx0IGlzIFsgMiwgMyBdXG4gIH0pO1xuICBgYGBcblxuICBJZiBhbnkgb2YgdGhlIGBwcm9taXNlc2AgZ2l2ZW4gdG8gYFJTVlAuZmlsdGVyYCBhcmUgcmVqZWN0ZWQsIHRoZSBmaXJzdCBwcm9taXNlXG4gIHRoYXQgaXMgcmVqZWN0ZWQgd2lsbCBiZSBnaXZlbiBhcyBhbiBhcmd1bWVudCB0byB0aGUgcmV0dXJuZWQgcHJvbWlzZSdzXG4gIHJlamVjdGlvbiBoYW5kbGVyLiBGb3IgZXhhbXBsZTpcblxuICBgYGBqYXZhc2NyaXB0XG4gIGxldCBwcm9taXNlMSA9IFJTVlAucmVzb2x2ZSgxKTtcbiAgbGV0IHByb21pc2UyID0gUlNWUC5yZWplY3QobmV3IEVycm9yKCcyJykpO1xuICBsZXQgcHJvbWlzZTMgPSBSU1ZQLnJlamVjdChuZXcgRXJyb3IoJzMnKSk7XG4gIGxldCBwcm9taXNlcyA9IFsgcHJvbWlzZTEsIHByb21pc2UyLCBwcm9taXNlMyBdO1xuXG4gIGxldCBmaWx0ZXJGbiA9IGZ1bmN0aW9uKGl0ZW0pe1xuICAgIHJldHVybiBpdGVtID4gMTtcbiAgfTtcblxuICBSU1ZQLmZpbHRlcihwcm9taXNlcywgZmlsdGVyRm4pLnRoZW4oZnVuY3Rpb24oYXJyYXkpe1xuICAgIC8vIENvZGUgaGVyZSBuZXZlciBydW5zIGJlY2F1c2UgdGhlcmUgYXJlIHJlamVjdGVkIHByb21pc2VzIVxuICB9LCBmdW5jdGlvbihyZWFzb24pIHtcbiAgICAvLyByZWFzb24ubWVzc2FnZSA9PT0gJzInXG4gIH0pO1xuICBgYGBcblxuICBgUlNWUC5maWx0ZXJgIHdpbGwgYWxzbyB3YWl0IGZvciBhbnkgcHJvbWlzZXMgcmV0dXJuZWQgZnJvbSBgZmlsdGVyRm5gLlxuICBGb3IgaW5zdGFuY2UsIHlvdSBtYXkgd2FudCB0byBmZXRjaCBhIGxpc3Qgb2YgdXNlcnMgdGhlbiByZXR1cm4gYSBzdWJzZXRcbiAgb2YgdGhvc2UgdXNlcnMgYmFzZWQgb24gc29tZSBhc3luY2hyb25vdXMgb3BlcmF0aW9uOlxuXG4gIGBgYGphdmFzY3JpcHRcblxuICBsZXQgYWxpY2UgPSB7IG5hbWU6ICdhbGljZScgfTtcbiAgbGV0IGJvYiAgID0geyBuYW1lOiAnYm9iJyB9O1xuICBsZXQgdXNlcnMgPSBbIGFsaWNlLCBib2IgXTtcblxuICBsZXQgcHJvbWlzZXMgPSB1c2Vycy5tYXAoZnVuY3Rpb24odXNlcil7XG4gICAgcmV0dXJuIFJTVlAucmVzb2x2ZSh1c2VyKTtcbiAgfSk7XG5cbiAgbGV0IGZpbHRlckZuID0gZnVuY3Rpb24odXNlcil7XG4gICAgLy8gSGVyZSwgQWxpY2UgaGFzIHBlcm1pc3Npb25zIHRvIGNyZWF0ZSBhIGJsb2cgcG9zdCwgYnV0IEJvYiBkb2VzIG5vdC5cbiAgICByZXR1cm4gZ2V0UHJpdmlsZWdlc0ZvclVzZXIodXNlcikudGhlbihmdW5jdGlvbihwcml2cyl7XG4gICAgICByZXR1cm4gcHJpdnMuY2FuX2NyZWF0ZV9ibG9nX3Bvc3QgPT09IHRydWU7XG4gICAgfSk7XG4gIH07XG4gIFJTVlAuZmlsdGVyKHByb21pc2VzLCBmaWx0ZXJGbikudGhlbihmdW5jdGlvbih1c2Vycyl7XG4gICAgLy8gdHJ1ZSwgYmVjYXVzZSB0aGUgc2VydmVyIHRvbGQgdXMgb25seSBBbGljZSBjYW4gY3JlYXRlIGEgYmxvZyBwb3N0LlxuICAgIHVzZXJzLmxlbmd0aCA9PT0gMTtcbiAgICAvLyBmYWxzZSwgYmVjYXVzZSBBbGljZSBpcyB0aGUgb25seSB1c2VyIHByZXNlbnQgaW4gYHVzZXJzYFxuICAgIHVzZXJzWzBdID09PSBib2I7XG4gIH0pO1xuICBgYGBcblxuICBAbWV0aG9kIGZpbHRlclxuICBAc3RhdGljXG4gIEBmb3IgUlNWUFxuICBAcGFyYW0ge0FycmF5fSBwcm9taXNlc1xuICBAcGFyYW0ge0Z1bmN0aW9ufSBmaWx0ZXJGbiAtIGZ1bmN0aW9uIHRvIGJlIGNhbGxlZCBvbiBlYWNoIHJlc29sdmVkIHZhbHVlIHRvXG4gIGZpbHRlciB0aGUgZmluYWwgcmVzdWx0cy5cbiAgQHBhcmFtIHtTdHJpbmd9IGxhYmVsIG9wdGlvbmFsIHN0cmluZyBkZXNjcmliaW5nIHRoZSBwcm9taXNlLiBVc2VmdWwgZm9yXG4gIHRvb2xpbmcuXG4gIEByZXR1cm4ge1Byb21pc2V9XG4qL1xuXG5mdW5jdGlvbiByZXNvbHZlQWxsKHByb21pc2VzLCBsYWJlbCkge1xuICByZXR1cm4gUHJvbWlzZS5hbGwocHJvbWlzZXMsIGxhYmVsKTtcbn1cblxuZnVuY3Rpb24gcmVzb2x2ZVNpbmdsZShwcm9taXNlLCBsYWJlbCkge1xuICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKHByb21pc2UsIGxhYmVsKS50aGVuKGZ1bmN0aW9uIChwcm9taXNlcykge1xuICAgIHJldHVybiByZXNvbHZlQWxsKHByb21pc2VzLCBsYWJlbCk7XG4gIH0pO1xufVxuXG5mdW5jdGlvbiBmaWx0ZXIocHJvbWlzZXMsIGZpbHRlckZuLCBsYWJlbCkge1xuICBpZiAoIWlzQXJyYXkocHJvbWlzZXMpICYmICEoaXNPYmplY3QocHJvbWlzZXMpICYmIHByb21pc2VzLnRoZW4gIT09IHVuZGVmaW5lZCkpIHtcbiAgICByZXR1cm4gUHJvbWlzZS5yZWplY3QobmV3IFR5cGVFcnJvcihcIlJTVlAuZmlsdGVyIG11c3QgYmUgY2FsbGVkIHdpdGggYW4gYXJyYXkgb3IgcHJvbWlzZVwiKSwgbGFiZWwpO1xuICB9XG5cbiAgaWYgKCFpc0Z1bmN0aW9uKGZpbHRlckZuKSkge1xuICAgIHJldHVybiBQcm9taXNlLnJlamVjdChuZXcgVHlwZUVycm9yKFwiUlNWUC5maWx0ZXIgZXhwZWN0cyBmdW5jdGlvbiBhcyBhIHNlY29uZCBhcmd1bWVudFwiKSwgbGFiZWwpO1xuICB9XG5cbiAgdmFyIHByb21pc2UgPSBpc0FycmF5KHByb21pc2VzKSA/IHJlc29sdmVBbGwocHJvbWlzZXMsIGxhYmVsKSA6IHJlc29sdmVTaW5nbGUocHJvbWlzZXMsIGxhYmVsKTtcbiAgcmV0dXJuIHByb21pc2UudGhlbihmdW5jdGlvbiAodmFsdWVzKSB7XG4gICAgdmFyIGxlbmd0aCA9IHZhbHVlcy5sZW5ndGg7XG4gICAgdmFyIGZpbHRlcmVkID0gbmV3IEFycmF5KGxlbmd0aCk7XG5cbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGxlbmd0aDsgaSsrKSB7XG4gICAgICBmaWx0ZXJlZFtpXSA9IGZpbHRlckZuKHZhbHVlc1tpXSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHJlc29sdmVBbGwoZmlsdGVyZWQsIGxhYmVsKS50aGVuKGZ1bmN0aW9uIChmaWx0ZXJlZCkge1xuICAgICAgdmFyIHJlc3VsdHMgPSBuZXcgQXJyYXkobGVuZ3RoKTtcbiAgICAgIHZhciBuZXdMZW5ndGggPSAwO1xuXG4gICAgICBmb3IgKHZhciBfaSA9IDA7IF9pIDwgbGVuZ3RoOyBfaSsrKSB7XG4gICAgICAgIGlmIChmaWx0ZXJlZFtfaV0pIHtcbiAgICAgICAgICByZXN1bHRzW25ld0xlbmd0aF0gPSB2YWx1ZXNbX2ldO1xuICAgICAgICAgIG5ld0xlbmd0aCsrO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIHJlc3VsdHMubGVuZ3RoID0gbmV3TGVuZ3RoO1xuXG4gICAgICByZXR1cm4gcmVzdWx0cztcbiAgICB9KTtcbiAgfSk7XG59XG5cbnZhciBsZW4gPSAwO1xudmFyIHZlcnR4TmV4dCA9IHZvaWQgMDtcbmZ1bmN0aW9uIGFzYXAoY2FsbGJhY2ssIGFyZykge1xuICBxdWV1ZSQxW2xlbl0gPSBjYWxsYmFjaztcbiAgcXVldWUkMVtsZW4gKyAxXSA9IGFyZztcbiAgbGVuICs9IDI7XG4gIGlmIChsZW4gPT09IDIpIHtcbiAgICAvLyBJZiBsZW4gaXMgMSwgdGhhdCBtZWFucyB0aGF0IHdlIG5lZWQgdG8gc2NoZWR1bGUgYW4gYXN5bmMgZmx1c2guXG4gICAgLy8gSWYgYWRkaXRpb25hbCBjYWxsYmFja3MgYXJlIHF1ZXVlZCBiZWZvcmUgdGhlIHF1ZXVlIGlzIGZsdXNoZWQsIHRoZXlcbiAgICAvLyB3aWxsIGJlIHByb2Nlc3NlZCBieSB0aGlzIGZsdXNoIHRoYXQgd2UgYXJlIHNjaGVkdWxpbmcuXG4gICAgc2NoZWR1bGVGbHVzaCQxKCk7XG4gIH1cbn1cblxudmFyIGJyb3dzZXJXaW5kb3cgPSB0eXBlb2Ygd2luZG93ICE9PSAndW5kZWZpbmVkJyA/IHdpbmRvdyA6IHVuZGVmaW5lZDtcbnZhciBicm93c2VyR2xvYmFsID0gYnJvd3NlcldpbmRvdyB8fCB7fTtcbnZhciBCcm93c2VyTXV0YXRpb25PYnNlcnZlciA9IGJyb3dzZXJHbG9iYWwuTXV0YXRpb25PYnNlcnZlciB8fCBicm93c2VyR2xvYmFsLldlYktpdE11dGF0aW9uT2JzZXJ2ZXI7XG52YXIgaXNOb2RlID0gdHlwZW9mIHNlbGYgPT09ICd1bmRlZmluZWQnICYmIHR5cGVvZiBwcm9jZXNzICE9PSAndW5kZWZpbmVkJyAmJiB7fS50b1N0cmluZy5jYWxsKHByb2Nlc3MpID09PSAnW29iamVjdCBwcm9jZXNzXSc7XG5cbi8vIHRlc3QgZm9yIHdlYiB3b3JrZXIgYnV0IG5vdCBpbiBJRTEwXG52YXIgaXNXb3JrZXIgPSB0eXBlb2YgVWludDhDbGFtcGVkQXJyYXkgIT09ICd1bmRlZmluZWQnICYmIHR5cGVvZiBpbXBvcnRTY3JpcHRzICE9PSAndW5kZWZpbmVkJyAmJiB0eXBlb2YgTWVzc2FnZUNoYW5uZWwgIT09ICd1bmRlZmluZWQnO1xuXG4vLyBub2RlXG5mdW5jdGlvbiB1c2VOZXh0VGljaygpIHtcbiAgdmFyIG5leHRUaWNrID0gcHJvY2Vzcy5uZXh0VGljaztcbiAgLy8gbm9kZSB2ZXJzaW9uIDAuMTAueCBkaXNwbGF5cyBhIGRlcHJlY2F0aW9uIHdhcm5pbmcgd2hlbiBuZXh0VGljayBpcyB1c2VkIHJlY3Vyc2l2ZWx5XG4gIC8vIHNldEltbWVkaWF0ZSBzaG91bGQgYmUgdXNlZCBpbnN0ZWFkIGluc3RlYWRcbiAgdmFyIHZlcnNpb24gPSBwcm9jZXNzLnZlcnNpb25zLm5vZGUubWF0Y2goL14oPzooXFxkKylcXC4pPyg/OihcXGQrKVxcLik/KFxcKnxcXGQrKSQvKTtcbiAgaWYgKEFycmF5LmlzQXJyYXkodmVyc2lvbikgJiYgdmVyc2lvblsxXSA9PT0gJzAnICYmIHZlcnNpb25bMl0gPT09ICcxMCcpIHtcbiAgICBuZXh0VGljayA9IHNldEltbWVkaWF0ZTtcbiAgfVxuICByZXR1cm4gZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiBuZXh0VGljayhmbHVzaCk7XG4gIH07XG59XG5cbi8vIHZlcnR4XG5mdW5jdGlvbiB1c2VWZXJ0eFRpbWVyKCkge1xuICBpZiAodHlwZW9mIHZlcnR4TmV4dCAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICByZXR1cm4gZnVuY3Rpb24gKCkge1xuICAgICAgdmVydHhOZXh0KGZsdXNoKTtcbiAgICB9O1xuICB9XG4gIHJldHVybiB1c2VTZXRUaW1lb3V0KCk7XG59XG5cbmZ1bmN0aW9uIHVzZU11dGF0aW9uT2JzZXJ2ZXIoKSB7XG4gIHZhciBpdGVyYXRpb25zID0gMDtcbiAgdmFyIG9ic2VydmVyID0gbmV3IEJyb3dzZXJNdXRhdGlvbk9ic2VydmVyKGZsdXNoKTtcbiAgdmFyIG5vZGUgPSBkb2N1bWVudC5jcmVhdGVUZXh0Tm9kZSgnJyk7XG4gIG9ic2VydmVyLm9ic2VydmUobm9kZSwgeyBjaGFyYWN0ZXJEYXRhOiB0cnVlIH0pO1xuXG4gIHJldHVybiBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIG5vZGUuZGF0YSA9IGl0ZXJhdGlvbnMgPSArK2l0ZXJhdGlvbnMgJSAyO1xuICB9O1xufVxuXG4vLyB3ZWIgd29ya2VyXG5mdW5jdGlvbiB1c2VNZXNzYWdlQ2hhbm5lbCgpIHtcbiAgdmFyIGNoYW5uZWwgPSBuZXcgTWVzc2FnZUNoYW5uZWwoKTtcbiAgY2hhbm5lbC5wb3J0MS5vbm1lc3NhZ2UgPSBmbHVzaDtcbiAgcmV0dXJuIGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gY2hhbm5lbC5wb3J0Mi5wb3N0TWVzc2FnZSgwKTtcbiAgfTtcbn1cblxuZnVuY3Rpb24gdXNlU2V0VGltZW91dCgpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gc2V0VGltZW91dChmbHVzaCwgMSk7XG4gIH07XG59XG5cbnZhciBxdWV1ZSQxID0gbmV3IEFycmF5KDEwMDApO1xuXG5mdW5jdGlvbiBmbHVzaCgpIHtcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBsZW47IGkgKz0gMikge1xuICAgIHZhciBjYWxsYmFjayA9IHF1ZXVlJDFbaV07XG4gICAgdmFyIGFyZyA9IHF1ZXVlJDFbaSArIDFdO1xuXG4gICAgY2FsbGJhY2soYXJnKTtcblxuICAgIHF1ZXVlJDFbaV0gPSB1bmRlZmluZWQ7XG4gICAgcXVldWUkMVtpICsgMV0gPSB1bmRlZmluZWQ7XG4gIH1cblxuICBsZW4gPSAwO1xufVxuXG5mdW5jdGlvbiBhdHRlbXB0VmVydGV4KCkge1xuICB0cnkge1xuICAgIHZhciByID0gcmVxdWlyZTtcbiAgICB2YXIgdmVydHggPSByKCd2ZXJ0eCcpO1xuICAgIHZlcnR4TmV4dCA9IHZlcnR4LnJ1bk9uTG9vcCB8fCB2ZXJ0eC5ydW5PbkNvbnRleHQ7XG4gICAgcmV0dXJuIHVzZVZlcnR4VGltZXIoKTtcbiAgfSBjYXRjaCAoZSkge1xuICAgIHJldHVybiB1c2VTZXRUaW1lb3V0KCk7XG4gIH1cbn1cblxudmFyIHNjaGVkdWxlRmx1c2gkMSA9IHZvaWQgMDtcbi8vIERlY2lkZSB3aGF0IGFzeW5jIG1ldGhvZCB0byB1c2UgdG8gdHJpZ2dlcmluZyBwcm9jZXNzaW5nIG9mIHF1ZXVlZCBjYWxsYmFja3M6XG5pZiAoaXNOb2RlKSB7XG4gIHNjaGVkdWxlRmx1c2gkMSA9IHVzZU5leHRUaWNrKCk7XG59IGVsc2UgaWYgKEJyb3dzZXJNdXRhdGlvbk9ic2VydmVyKSB7XG4gIHNjaGVkdWxlRmx1c2gkMSA9IHVzZU11dGF0aW9uT2JzZXJ2ZXIoKTtcbn0gZWxzZSBpZiAoaXNXb3JrZXIpIHtcbiAgc2NoZWR1bGVGbHVzaCQxID0gdXNlTWVzc2FnZUNoYW5uZWwoKTtcbn0gZWxzZSBpZiAoYnJvd3NlcldpbmRvdyA9PT0gdW5kZWZpbmVkICYmIHR5cGVvZiByZXF1aXJlID09PSAnZnVuY3Rpb24nKSB7XG4gIHNjaGVkdWxlRmx1c2gkMSA9IGF0dGVtcHRWZXJ0ZXgoKTtcbn0gZWxzZSB7XG4gIHNjaGVkdWxlRmx1c2gkMSA9IHVzZVNldFRpbWVvdXQoKTtcbn1cblxudmFyIHBsYXRmb3JtID0gdm9pZCAwO1xuXG4vKiBnbG9iYWwgc2VsZiAqL1xuaWYgKHR5cGVvZiBzZWxmID09PSAnb2JqZWN0Jykge1xuICBwbGF0Zm9ybSA9IHNlbGY7XG5cbiAgLyogZ2xvYmFsIGdsb2JhbCAqL1xufSBlbHNlIGlmICh0eXBlb2YgZ2xvYmFsID09PSAnb2JqZWN0Jykge1xuICBwbGF0Zm9ybSA9IGdsb2JhbDtcbn0gZWxzZSB7XG4gIHRocm93IG5ldyBFcnJvcignbm8gZ2xvYmFsOiBgc2VsZmAgb3IgYGdsb2JhbGAgZm91bmQnKTtcbn1cblxudmFyIF9hc2FwJGNhc3QkUHJvbWlzZSRFdjtcblxuZnVuY3Rpb24gX2RlZmluZVByb3BlcnR5KG9iaiwga2V5LCB2YWx1ZSkgeyBpZiAoa2V5IGluIG9iaikgeyBPYmplY3QuZGVmaW5lUHJvcGVydHkob2JqLCBrZXksIHsgdmFsdWU6IHZhbHVlLCBlbnVtZXJhYmxlOiB0cnVlLCBjb25maWd1cmFibGU6IHRydWUsIHdyaXRhYmxlOiB0cnVlIH0pOyB9IGVsc2UgeyBvYmpba2V5XSA9IHZhbHVlOyB9IHJldHVybiBvYmo7IH1cblxuLy8gZGVmYXVsdHNcbmNvbmZpZy5hc3luYyA9IGFzYXA7XG5jb25maWcuYWZ0ZXIgPSBmdW5jdGlvbiAoY2IpIHtcbiAgcmV0dXJuIHNldFRpbWVvdXQoY2IsIDApO1xufTtcbnZhciBjYXN0ID0gcmVzb2x2ZSQyO1xuXG52YXIgYXN5bmMgPSBmdW5jdGlvbiAoY2FsbGJhY2ssIGFyZykge1xuICByZXR1cm4gY29uZmlnLmFzeW5jKGNhbGxiYWNrLCBhcmcpO1xufTtcblxuZnVuY3Rpb24gb24oKSB7XG4gIGNvbmZpZ1snb24nXS5hcHBseShjb25maWcsIGFyZ3VtZW50cyk7XG59XG5cbmZ1bmN0aW9uIG9mZigpIHtcbiAgY29uZmlnWydvZmYnXS5hcHBseShjb25maWcsIGFyZ3VtZW50cyk7XG59XG5cbi8vIFNldCB1cCBpbnN0cnVtZW50YXRpb24gdGhyb3VnaCBgd2luZG93Ll9fUFJPTUlTRV9JTlRSVU1FTlRBVElPTl9fYFxuaWYgKHR5cGVvZiB3aW5kb3cgIT09ICd1bmRlZmluZWQnICYmIHR5cGVvZiB3aW5kb3dbJ19fUFJPTUlTRV9JTlNUUlVNRU5UQVRJT05fXyddID09PSAnb2JqZWN0Jykge1xuICB2YXIgY2FsbGJhY2tzID0gd2luZG93WydfX1BST01JU0VfSU5TVFJVTUVOVEFUSU9OX18nXTtcbiAgY29uZmlndXJlKCdpbnN0cnVtZW50JywgdHJ1ZSk7XG4gIGZvciAodmFyIGV2ZW50TmFtZSBpbiBjYWxsYmFja3MpIHtcbiAgICBpZiAoY2FsbGJhY2tzLmhhc093blByb3BlcnR5KGV2ZW50TmFtZSkpIHtcbiAgICAgIG9uKGV2ZW50TmFtZSwgY2FsbGJhY2tzW2V2ZW50TmFtZV0pO1xuICAgIH1cbiAgfVxufVxuXG4vLyB0aGUgZGVmYXVsdCBleHBvcnQgaGVyZSBpcyBmb3IgYmFja3dhcmRzIGNvbXBhdDpcbi8vICAgaHR0cHM6Ly9naXRodWIuY29tL3RpbGRlaW8vcnN2cC5qcy9pc3N1ZXMvNDM0XG52YXIgcnN2cCA9IChfYXNhcCRjYXN0JFByb21pc2UkRXYgPSB7XG4gIGFzYXA6IGFzYXAsXG4gIGNhc3Q6IGNhc3QsXG4gIFByb21pc2U6IFByb21pc2UsXG4gIEV2ZW50VGFyZ2V0OiBFdmVudFRhcmdldCxcbiAgYWxsOiBhbGwkMSxcbiAgYWxsU2V0dGxlZDogYWxsU2V0dGxlZCxcbiAgcmFjZTogcmFjZSQxLFxuICBoYXNoOiBoYXNoLFxuICBoYXNoU2V0dGxlZDogaGFzaFNldHRsZWQsXG4gIHJldGhyb3c6IHJldGhyb3csXG4gIGRlZmVyOiBkZWZlcixcbiAgZGVub2RlaWZ5OiBkZW5vZGVpZnksXG4gIGNvbmZpZ3VyZTogY29uZmlndXJlLFxuICBvbjogb24sXG4gIG9mZjogb2ZmLFxuICByZXNvbHZlOiByZXNvbHZlJDIsXG4gIHJlamVjdDogcmVqZWN0JDIsXG4gIG1hcDogbWFwXG59LCBfZGVmaW5lUHJvcGVydHkoX2FzYXAkY2FzdCRQcm9taXNlJEV2LCAnYXN5bmMnLCBhc3luYyksIF9kZWZpbmVQcm9wZXJ0eShfYXNhcCRjYXN0JFByb21pc2UkRXYsICdmaWx0ZXInLCBmaWx0ZXIpLCBfYXNhcCRjYXN0JFByb21pc2UkRXYpO1xuXG5leHBvcnRzWydkZWZhdWx0J10gPSByc3ZwO1xuZXhwb3J0cy5hc2FwID0gYXNhcDtcbmV4cG9ydHMuY2FzdCA9IGNhc3Q7XG5leHBvcnRzLlByb21pc2UgPSBQcm9taXNlO1xuZXhwb3J0cy5FdmVudFRhcmdldCA9IEV2ZW50VGFyZ2V0O1xuZXhwb3J0cy5hbGwgPSBhbGwkMTtcbmV4cG9ydHMuYWxsU2V0dGxlZCA9IGFsbFNldHRsZWQ7XG5leHBvcnRzLnJhY2UgPSByYWNlJDE7XG5leHBvcnRzLmhhc2ggPSBoYXNoO1xuZXhwb3J0cy5oYXNoU2V0dGxlZCA9IGhhc2hTZXR0bGVkO1xuZXhwb3J0cy5yZXRocm93ID0gcmV0aHJvdztcbmV4cG9ydHMuZGVmZXIgPSBkZWZlcjtcbmV4cG9ydHMuZGVub2RlaWZ5ID0gZGVub2RlaWZ5O1xuZXhwb3J0cy5jb25maWd1cmUgPSBjb25maWd1cmU7XG5leHBvcnRzLm9uID0gb247XG5leHBvcnRzLm9mZiA9IG9mZjtcbmV4cG9ydHMucmVzb2x2ZSA9IHJlc29sdmUkMjtcbmV4cG9ydHMucmVqZWN0ID0gcmVqZWN0JDI7XG5leHBvcnRzLm1hcCA9IG1hcDtcbmV4cG9ydHMuYXN5bmMgPSBhc3luYztcbmV4cG9ydHMuZmlsdGVyID0gZmlsdGVyO1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgJ19fZXNNb2R1bGUnLCB7IHZhbHVlOiB0cnVlIH0pO1xuXG59KSkpO1xuXG4vLyMgc291cmNlTWFwcGluZ1VSTD1yc3ZwLm1hcFxuIiwiY29uc3QgY2hyb21lID0gd2luZG93LmNocm9tZVxuLy8gY29uc3QgY29uZmlnID0gcmVxdWlyZSgnLi9jb25maWcnKVxuY29uc3QgdXRpbHMgPSByZXF1aXJlKCcuL3V0aWxzJylcbi8vIGNvbnN0IHN0b3JhZ2UgPSByZXF1aXJlKCcuL2Nocm9tZS1zdG9yYWdlLmpzJykoY2hyb21lLnN0b3JhZ2UubG9jYWwpXG5cbmNocm9tZS5zdG9yYWdlLm9uQ2hhbmdlZC5hZGRMaXN0ZW5lcihmdW5jdGlvbiAoY2hhbmdlcywgbmFtZXNwYWNlKSB7XG4gIGZvciAobGV0IGtleSBpbiBjaGFuZ2VzKSB7XG4gICAgbGV0IHN0b3JhZ2VDaGFuZ2UgPSBjaGFuZ2VzW2tleV1cbiAgICBjb25zb2xlLmxvZygnU3RvcmFnZSBrZXkgXCIlc1wiIGluIG5hbWVzcGFjZSBcIiVzXCIgY2hhbmdlZC4gJyArICdPbGQgdmFsdWUgd2FzIFwiJXNcIiwgbmV3IHZhbHVlIGlzIFwiJXNcIi4nLCBrZXksIG5hbWVzcGFjZSwgc3RvcmFnZUNoYW5nZS5vbGRWYWx1ZSwgc3RvcmFnZUNoYW5nZS5uZXdWYWx1ZSlcbiAgfVxufSlcblxuY2hyb21lLnJ1bnRpbWUub25NZXNzYWdlLmFkZExpc3RlbmVyKGZ1bmN0aW9uIChyZXF1ZXN0LCBzZW5kZXIsIHNlbmRSZXNwb25zZSkge1xuICB2YXIgc2VsZWN0aW9uXG4gIGNvbnNvbGUubG9nKHNlbmRlci50YWIgPyAnZnJvbSBhIGNvbnRlbnQgc2NyaXB0OicgKyBzZW5kZXIudGFiLnVybCA6ICdmcm9tIHRoZSBleHRlbnNpb24nKVxuICBzd2l0Y2ggKHJlcXVlc3QuYWN0aW9uKSB7XG4gICAgY2FzZSAnc2VsZWN0IHRleHQnOlxuICAgICAgc2VsZWN0aW9uID0gdXRpbHMuZ2V0U2VsZWN0ZWRUZXh0KCkudG9TdHJpbmcoKS5zcGxpdCgnXFxuJykuZmlsdGVyKGZ1bmN0aW9uIChlKSB7XG4gICAgICAgIHJldHVybiBlLnJlcGxhY2UoLyhcXHJcXG58XFxufFxccikvZ20sICcnKVxuICAgICAgfSlcbiAgICAgIHNlbmRSZXNwb25zZSh7XG4gICAgICAgIGRhdGE6IHNlbGVjdGlvblxuICAgICAgfSlcbiAgICAgIGJyZWFrXG4gICAgY2FzZSAnZmluZCB0cmFja3MnOlxuICAgICAgc2VuZFJlc3BvbnNlKCdsb29raW5nIGZvciB0cmFja3MnKVxuICB9XG4gIHJldHVybiBmYWxzZVxufSlcbiIsInZhciBSU1ZQID0gcmVxdWlyZSgncnN2cCcpXG5cbmNvbnN0IGNocm9tZSA9IHdpbmRvdy5jaHJvbWVcblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gIG1hdGNoVXJsOiBmdW5jdGlvbiAobikge1xuICAgIGlmIChuICE9IG51bGwpIHtcbiAgICAgIHJldHVybiB3aW5kb3cubG9jYXRpb24uaHJlZi5tYXRjaChuKVxuICAgIH1cbiAgfSxcbiAgZ2V0U2VsZWN0ZWRUZXh0OiBmdW5jdGlvbiAoKSB7XG4gICAgaWYgKHdpbmRvdy5nZXRTZWxlY3Rpb24pIHtcbiAgICAgIHJldHVybiB3aW5kb3cuZ2V0U2VsZWN0aW9uKCkudG9TdHJpbmcoKVxuICAgIH0gZWxzZSBpZiAoZG9jdW1lbnQuc2VsZWN0aW9uKSB7XG4gICAgICByZXR1cm4gZG9jdW1lbnQuc2VsZWN0aW9uLmNyZWF0ZVJhbmdlKCkudGV4dFxuICAgIH1cbiAgICByZXR1cm4gJydcbiAgfSxcbiAgaW1wb3J0SHRtbDogZnVuY3Rpb24gKGhyZWYpIHtcbiAgICB2YXIgcHJvbWlzZVxuICAgIHByb21pc2UgPSBuZXcgUlNWUC5Qcm9taXNlKGZ1bmN0aW9uIChyZXNvbHZlLCByZWplY3QpIHtcbiAgICAgIHZhciBlbGVtXG4gICAgICBpZiAoJ2ltcG9ydCcgaW4gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnbGluaycpKSB7XG4gICAgICAgIGVsZW0gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdsaW5rJylcbiAgICAgICAgZWxlbS5yZWwgPSAnaW1wb3J0J1xuICAgICAgICBlbGVtLmhyZWYgPSBjaHJvbWUuZXh0ZW5zaW9uLmdldFVSTChocmVmKVxuICAgICAgICBlbGVtLm9ubG9hZCA9IGZ1bmN0aW9uIChlKSB7XG4gICAgICAgICAgcmV0dXJuIHJlc29sdmUoZSlcbiAgICAgICAgfVxuICAgICAgICBlbGVtLm9uZXJyb3IgPSBmdW5jdGlvbiAoZSkge1xuICAgICAgICAgIHJldHVybiByZWplY3QoRXJyb3IoZSkpXG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGRvY3VtZW50LmhlYWQuYXBwZW5kQ2hpbGQoZWxlbSlcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiByZWplY3QoRXJyb3IoJ0h0bWwgaW1wb3J0IG5vdCBzdXBwb3J0ZWQnKSlcbiAgICAgIH1cbiAgICB9KVxuICAgIHJldHVybiBwcm9taXNlXG4gIH0sXG4gIGdldFBhcmFtZXRlckJ5TmFtZTogZnVuY3Rpb24gKG5hbWUsIHVybCkge1xuICAgIHZhciByZWdleCwgcmVzdWx0c1xuICAgIGlmICghdXJsKSB7XG4gICAgICB1cmwgPSB3aW5kb3cubG9jYXRpb24uaHJlZlxuICAgIH1cbiAgICB1cmwgPSB1cmwudG9Mb3dlckNhc2UoKVxuICAgIG5hbWUgPSBuYW1lLnJlcGxhY2UoL1tbXFxdXS9nLCAnXFxcXCQmJykudG9Mb3dlckNhc2UoKVxuICAgIHJlZ2V4ID0gbmV3IFJlZ0V4cCgnWz8mXScgKyBuYW1lICsgJyg9KFteJiNdKil8JnwjfCQpJylcbiAgICByZXN1bHRzID0gcmVnZXguZXhlYyh1cmwpXG4gICAgaWYgKCFyZXN1bHRzKSB7XG4gICAgICByZXR1cm4gbnVsbFxuICAgIH1cbiAgICBpZiAoIXJlc3VsdHNbMl0pIHtcbiAgICAgIHJldHVybiAnJ1xuICAgIH1cbiAgICByZXR1cm4gZGVjb2RlVVJJQ29tcG9uZW50KHJlc3VsdHNbMl0ucmVwbGFjZSgvXFwrL2csICcgJykpXG4gIH1cbn1cbiJdfQ==
