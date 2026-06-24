/**
 * Event bus — replaces dojo.publish / dojo.subscribe / dojo.unsubscribe / dojo.hitch
 *
 * Uses mitt (tiny 200b event emitter) under the hood.
 * Monkeypatches dojo's pub/sub functions so existing game code continues to work.
 *
 * Imported by src/main.js before any game files are dynamically loaded.
 */
import mitt from 'mitt';

// ── Create the bus ────────────────────────────────────────────
const bus = mitt();

// Keep a mapping of dojo subscribe handles → mitt handlers
// so unsubscribe by handle works correctly.
const handleMap = new Map();
let handleId = 0;

// ── Global references (set from module scope) ──────────────────
// These match the var aliases in main.js

/**
 * Install monkeypatches onto window.dojo.
 * Called from main.js after dojo is loaded but before game files.
 */
export function installEventBus() {
  if (typeof window.dojo === 'undefined') {
    console.warn('[event-bus] dojo not found, skipping monkeypatches');
    return;
  }

  const dojo = window.dojo;

  // ── dojo.publish(topic, args) ───────────────────────────────
  dojo.publish = function(topic, args) {
    // Dojo publishes with args: sometimes [arg], sometimes arg directly.
    // Normalize: if args is an array with one element, unwrap for mitt.
    var eventArg = args;
    if (Array.isArray(args) && args.length === 1) {
      eventArg = args[0];
    }
    bus.emit(topic, eventArg);
  };

  // ── dojo.subscribe(topic, context, method) ──────────────────
  // Supports: dojo.subscribe(topic, fn)
  //           dojo.subscribe(topic, ctx, "methodName")
  //           dojo.subscribe(topic, ctx, fn)
  dojo.subscribe = function(topic, context, method) {
    var fn;

    if (typeof context === 'function') {
      // dojo.subscribe(topic, fn)
      fn = context;
    } else if (typeof method === 'string') {
      // dojo.subscribe(topic, ctx, "methodName")
      fn = function(evt) {
        context[method](evt);
      };
    } else if (typeof method === 'function') {
      // dojo.subscribe(topic, ctx, fn)
      fn = function(evt) {
        method.call(context, evt);
      };
    } else {
      fn = function() {};
    }

    bus.on(topic, fn);

    // Return a numeric handle (like original dojo)
    var handle = ++handleId;
    handleMap.set(handle, { topic: topic, fn: fn });
    return handle;
  };

  // ── dojo.unsubscribe(handle) ────────────────────────────────
  dojo.unsubscribe = function(handle) {
    if (handle && typeof handle === 'object' && handle.remove) {
      // Handle from dojo.connect (DOM event)
      handle.remove();
      return;
    }
    var entry = handleMap.get(handle);
    if (entry) {
      bus.off(entry.topic, entry.fn);
      handleMap.delete(handle);
    }
  };

  // ── dojo.hitch(ctx, method) → fn.bind(ctx) ──────────────────
  // Supports: dojo.hitch(this, "methodName")
  //           dojo.hitch(this, fn)
  dojo.hitch = function(ctx, method) {
    if (typeof method === 'string') {
      // dojo.hitch(this, "methodName")  →  ctx.methodName.bind(ctx)
      return function() {
        return ctx[method].apply(ctx, arguments);
      };
    }
    // dojo.hitch(this, fn)  →  fn.bind(ctx)
    return method.bind(ctx);
  };

  console.log('[event-bus] dojo.publish/subscribe/unsubscribe/hitch replaced with mitt');
}

export default bus;
