/**
 * Transitional dojo.declare → ES6 class replacement
 */
(function() {
  'use strict';
  if (typeof window.dojo === 'undefined') { console.warn('[declare] dojo not found, skipping'); return; }

  var callStack = [];

  function wrapMethod(name, fn) {
    return function wrapped() {
      callStack.push(name);
      try { return fn.apply(this, arguments); } finally { callStack.pop(); }
    };
  }

  window.dojo.inherited = function(args, extra) {
    var methodName = callStack[callStack.length - 1];
    if (!methodName) return;

    // Count how many times this method name appears in the call stack.
    // Each nested `inherited` call adds another entry because the parent
    // method is also wrapped and pushes its name.  This tells us how many
    // prototype levels to skip.
    var depth = 0;
    for (var ci = 0; ci < callStack.length; ci++) {
      if (callStack[ci] === methodName) depth++;
    }

    var proto = Object.getPrototypeOf(this.constructor.prototype);
    var skipped = 0;
    while (proto) {
      if (proto.hasOwnProperty(methodName)) {
        if (skipped === depth - 1) break;
        skipped++;
      }
      proto = Object.getPrototypeOf(proto);
    }
    if (proto && typeof proto[methodName] === 'function') return proto[methodName].apply(this, extra || args);
  };

  window.dojo.declare = function(className, superClass, props) {
    if (typeof superClass === 'object' && typeof props === 'undefined') { props = superClass; superClass = null; }
    props = props || {};

    // Resolve parent & mixins
    var Parent = null, mixins = [];
    if (Array.isArray(superClass)) { Parent = superClass[0]; mixins = superClass.slice(1); }
    else if (superClass) { Parent = superClass; }

    // Separate static and instance properties
    var staticProps = {}, instanceProps = {};
    for (var k in props) {
      if (!Object.prototype.hasOwnProperty.call(props, k)) continue;
      if (k === 'statics') {
        for (var s in props.statics) { if (Object.prototype.hasOwnProperty.call(props.statics, s)) staticProps[s] = props.statics[s]; }
      } else if (k !== 'constructor') {
        instanceProps[k] = typeof props[k] === 'function' ? wrapMethod(k, props[k]) : props[k];
      }
    }

    // Build ALL prototype methods (own + mixin, mixins non-overriding)
    // We do this OUTSIDE the constructor so it runs once per class, not once per instantiation
    function buildProto(parentProto, own, mxns) {
      var p = Object.create(parentProto || null);
      for (var k in own) { if (Object.prototype.hasOwnProperty.call(own, k)) p[k] = own[k]; }
      for (var m = 0; m < mxns.length; m++) {
        if (mxns[m] && mxns[m].prototype) {
          for (var mk in mxns[m].prototype) {
            if (Object.prototype.hasOwnProperty.call(mxns[m].prototype, mk) && !p.hasOwnProperty(mk)
                && mk !== 'constructor' && typeof mxns[m].prototype[mk] === 'function') {
              p[mk] = wrapMethod(mk, mxns[m].prototype[mk]);
            }
          }
        }
      }
      return p;
    }

    // The actual constructor — runs parent chain then child.
    // IMPORTANT: This function has NO auto-instantiation guard because it is
    // ALWAYS called via apply() from the wrapper below.
    function realCtor() {
      if (Parent) {
        // Call parent's REAL constructor directly (bypass any auto-instantiation wrapper)
        var pc = Parent._real || Parent;
        if (typeof pc === 'function') pc.apply(this, arguments);
      }
      for (var mi = 0; mi < mixins.length; mi++) {
        var mc = mixins[mi]._real || mixins[mi];
        if (typeof mc === 'function') mc.apply(this, arguments);
      }
      if (props.constructor) props.constructor.apply(this, arguments);
    }

    // Public-facing constructor — adds auto-instantiation guard for user calls
    function Klass() {
      if (!(this instanceof Klass)) {
        return new (Function.prototype.bind.apply(Klass, [null].concat(Array.prototype.slice.call(arguments))))();
      }
      return realCtor.apply(this, arguments);
    }
    // Prototype chain
    Klass.prototype = Parent ? buildProto(Parent.prototype, instanceProps, mixins) : buildProto({}, instanceProps, mixins);
    Klass.prototype.constructor = Klass;

    // this.inherited on prototype
    Klass.prototype.inherited = function(args, extra) {
      return window.dojo.inherited.call(this, args, extra);
    };

    // Statics on constructor
    if (Parent) {
      for (var pk in Parent) { if (Object.prototype.hasOwnProperty.call(Parent, pk)) Klass[pk] = Parent[pk]; }
    }
    for (var sp in staticProps) { if (Object.prototype.hasOwnProperty.call(staticProps, sp)) Klass[sp] = staticProps[sp]; }

    // _real must be set AFTER parent statics copy, otherwise Parent._real overwrites it
    Klass._real = realCtor;

    // statics on instances (original Dojo compat)
    if (Object.keys(staticProps).length > 0) {
      Klass.prototype.statics = {};
      for (var sp2 in staticProps) { if (Object.prototype.hasOwnProperty.call(staticProps, sp2)) Klass.prototype.statics[sp2] = staticProps[sp2]; }
    }

    // Register
    var parts = className.split('.'), name = parts.pop();
    var ns = parts.reduce(function(o, p) { if (!o[p]) o[p] = {}; return o[p]; }, window);
    ns[name] = Klass;
    return Klass;
  };

  console.log('[declare] dojo.declare replaced with ES6 class implementation');
})();
