/**
 * Event bus — replaces dojo.publish / dojo.subscribe / dojo.unsubscribe / dojo.hitch
 *
 * Uses mitt under the hood. Monkeypatches dojo's pub/sub functions so existing
 * game code continues to work without modification.
 */
import mitt from 'mitt';

interface HandleEntry {
  topic: string;
  fn: (evt?: any) => void;
}

// ── Bus ─────────────────────────────────────────────────────
const bus = mitt();
const handleMap = new Map<number, HandleEntry>();
let handleId = 0;

/**
 * Install monkeypatches onto window.dojo.
 * Called from main.js after dojo is loaded but before game files.
 */
export function installEventBus(): void {
  if (typeof (window as any).dojo === 'undefined') {
    console.warn('[event-bus] dojo not found, skipping monkeypatches');
    return;
  }

  const dojo = (window as any).dojo;

  // ── dojo.publish(topic, args) ─────────────────────────────
  dojo.publish = function(topic: string, args: any) {
    var eventArg = args;
    if (Array.isArray(args) && args.length === 1) {
      eventArg = args[0];
    }
    bus.emit(topic, eventArg);
  };

  // ── dojo.subscribe(topic, context, method) ────────────────
  dojo.subscribe = function(topic: string, context: any, method: any) {
    var fn: (evt?: any) => void;

    if (typeof context === 'function') {
      fn = context;
    } else if (typeof method === 'string') {
      fn = function(evt: any) { context[method](evt); };
    } else if (typeof method === 'function') {
      fn = function(evt: any) { method.call(context, evt); };
    } else {
      fn = function() {};
    }

    bus.on(topic, fn);

    var handle = ++handleId;
    handleMap.set(handle, { topic, fn });
    return handle;
  };

  // ── dojo.unsubscribe(handle) ──────────────────────────────
  dojo.unsubscribe = function(handle: any) {
    if (handle && typeof handle === 'object' && handle.remove) {
      handle.remove();
      return;
    }
    var entry = handleMap.get(handle);
    if (entry) {
      bus.off(entry.topic, entry.fn);
      handleMap.delete(handle);
    }
  };

  // ── dojo.hitch(ctx, method) ───────────────────────────────
  dojo.hitch = function(ctx: any, method: any) {
    if (typeof method === 'string') {
      return function(this: any) { return ctx[method].apply(ctx, arguments); };
    }
    return method.bind(ctx);
  };

  console.log('[event-bus] dojo.publish/subscribe/unsubscribe/hitch replaced with mitt');
}

export default bus;
