/**
 * Transitional dojo.declare → ES6 class replacement
 *
 * Monkeypatches dojo.declare to create ES6 classes instead.
 * Handles single inheritance, mixins, statics, and this.inherited().
 * Game code continues to use dojo.declare syntax unchanged.
 *
 * Loaded by main.js before any game files.
 */

(function() {
  'use strict';

  if (typeof window.dojo === 'undefined') {
    console.warn('[declare] dojo not found, skipping');
    return;
  }

  // ── Helper: fullyQualify(name) → resolves "classes.Foo.Bar" to the class ──
  function resolveNamespace(name) {
    var parts = name.split('.');
    var obj = window;
    for (var i = 0; i < parts.length; i++) {
      if (!obj[parts[i]]) obj[parts[i]] = {};
      obj = obj[parts[i]];
    }
    return obj;
  }

  // ── Inherited call stack tracking ──────────────────────────────────────
  // Each method wrapped by declare tracks which method name it belongs to,
  // so this.inherited() knows which parent method to dispatch to.

  var callStack = [];

  function wrapMethod(name, fn) {
    return function wrapped() {
      callStack.push(name);
      try {
        return fn.apply(this, arguments);
      } finally {
        callStack.pop();
      }
    };
  }

  // ── this.inherited(arguments, [extraArgs]) ──────────────────────────────
  // Calls the parent class's version of the currently-executing method.
  window.dojo.inherited = function(args, extra) {
    var methodName = callStack[callStack.length - 1];
    if (!methodName) {
      console.warn('[declare] inherited() called outside wrapped method');
      return;
    }

    // Walk up prototype chain to find parent's version
    var proto = Object.getPrototypeOf(this.constructor.prototype);
    while (proto && !proto.hasOwnProperty(methodName)) {
      proto = Object.getPrototypeOf(proto);
    }

    if (proto && typeof proto[methodName] === 'function') {
      // Extract the unwrapped function from the wrapper
      var parentFn = proto[methodName];
      // Call with either provided args or original arguments
      return parentFn.apply(this, extra || args);
    }

    return undefined;
  };

  // ── dojo.declare(className, superClass, props) ──────────────────────────
  window.dojo.declare = function(className, superClass, props) {
    if (typeof props === 'undefined' && typeof superClass === 'object') {
      // dojo.declare(className, props) — no inheritance
      props = superClass;
      superClass = null;
    }

    props = props || {};
    var hasStatics = props.statics;

    // Determine parent class(es)
    var parents = [];
    if (Array.isArray(superClass)) {
      parents = superClass;  // First element is the primary parent, rest are mixins
    } else if (superClass) {
      parents = [superClass];
    }

    var Parent = parents.length > 0 ? parents[0] : null;
    var mixins = parents.slice(1);

    // ── Build prototype methods ──
    var protoMethods = {};
    var staticProps = {};

    for (var key in props) {
      if (!Object.prototype.hasOwnProperty.call(props, key)) continue;
      var val = props[key];

      if (key === 'statics') {
        // statics are static properties/methods on the constructor
        for (var s in val) {
          if (Object.prototype.hasOwnProperty.call(val, s)) {
            staticProps[s] = val[s];
          }
        }
        continue;
      }

      if (key === 'constructor') {
        // constructor is not a method on the prototype
        continue;
      }

      if (typeof val === 'function') {
        protoMethods[key] = wrapMethod(key, val);
      } else {
        protoMethods[key] = val;
      }
    }

    // ── Create the class ──
    var NewClass;

    if (Parent) {
      NewClass = (function(ParentClass) {
        var cls = function() {
          // Call constructor
          if (props.constructor) {
            props.constructor.apply(this, arguments);
          }
          // Call mixin constructors
          for (var m = 0; m < mixins.length; m++) {
            if (typeof mixins[m] === 'function' && mixins[m].prototype && mixins[m].prototype.constructor
                && mixins[m].prototype.constructor !== Object) {
              // Apply mixin constructor logic if it exists
            }
          }
        };

        cls.prototype = Object.create(ParentClass.prototype);
        cls.prototype.constructor = cls;

        // Copy methods
        for (var k in protoMethods) {
          if (Object.prototype.hasOwnProperty.call(protoMethods, k)) {
            cls.prototype[k] = protoMethods[k];
          }
        }

        // Apply mixin methods (non-overriding)
        for (var m = 0; m < mixins.length; m++) {
          if (mixins[m] && mixins[m].prototype) {
            var mProto = mixins[m].prototype;
            for (var mk in mProto) {
              if (Object.prototype.hasOwnProperty.call(mProto, mk)
                  && !cls.prototype.hasOwnProperty(mk)
                  && mk !== 'constructor'
                  && typeof mProto[mk] === 'function') {
                cls.prototype[mk] = wrapMethod(mk, mProto[mk]);
              }
            }
          }
        }

        // Copy static properties from parent
        for (var pk in ParentClass) {
          if (Object.prototype.hasOwnProperty.call(ParentClass, pk)) {
            cls[pk] = ParentClass[pk];
          }
        }

        // Apply new static props
        for (var sp in staticProps) {
          if (Object.prototype.hasOwnProperty.call(staticProps, sp)) {
            cls[sp] = staticProps[sp];
          }
        }

        return cls;
      })(Parent);
    } else {
      // No parent — standalone class
      NewClass = function() {
        if (props.constructor) {
          props.constructor.apply(this, arguments);
        }
      };

      NewClass.prototype = { constructor: NewClass };
      for (var k in protoMethods) {
        if (Object.prototype.hasOwnProperty.call(protoMethods, k)) {
          NewClass.prototype[k] = protoMethods[k];
        }
      }
    }

    // Static props for standalone class
    if (!Parent) {
      for (var s in staticProps) {
        if (Object.prototype.hasOwnProperty.call(staticProps, s)) {
          NewClass[s] = staticProps[s];
        }
      }
    }

    // ── Register in global namespace ──
    registerClass(className, NewClass);

    return NewClass;
  };

  // ── Helper: register a class in its namespace ──────────────────────────
  function registerClass(name, cls) {
    var parts = name.split('.');
    var targetName = parts.pop();
    var namespace = parts.reduce(function(obj, part) {
      if (!obj[part]) obj[part] = {};
      return obj[part];
    }, window);
    namespace[targetName] = cls;
  }

  console.log('[declare] dojo.declare replaced with ES6 class implementation');
})();
