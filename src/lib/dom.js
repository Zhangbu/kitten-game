/**
 * Native DOM replacements for Dojo DOM functions
 *
 * This file monkeypatches dojo's DOM methods with native DOM API equivalents.
 * No game file changes needed — existing dojo.xxx() calls continue to work
 * transparently under the hood.
 *
 * Load this as a non-module <script> tag BEFORE any game files.
 */

(function() {
  'use strict';

  // Only apply if dojo exists
  if (typeof dojo === 'undefined') return;

  // ── dojo.byId(id, doc) → document.getElementById(id) ──────────────
  dojo.byId = function(id, doc) {
    return ((doc) || document).getElementById(id);
  };

  // ── dojo.create(tag, attrs, refNode, pos) ────────────────────────
  // Creates an element, sets attributes, optionally places it in DOM.
  dojo.create = function(tag, attrs, refNode, pos) {
    if (!tag) return null;

    var el = document.createElement(tag);

    if (attrs) {
      for (var key in attrs) {
        if (!Object.prototype.hasOwnProperty.call(attrs, key)) continue;
        var val = attrs[key];
        if (val == null) continue;

        if (key === 'className' || key === 'class') {
          el.className = val;
        } else if (key === 'style' && typeof val === 'object') {
          for (var prop in val) {
            if (Object.prototype.hasOwnProperty.call(val, prop)) {
              el.style[prop] = val[prop];
            }
          }
        } else if (key === 'innerHTML') {
          el.innerHTML = val;
        } else if (key === 'tabIndex' || key === 'tabindex') {
          el.tabIndex = val;
        } else if (key in el) {
          try { el[key] = val; } catch (e) { el.setAttribute(key, val); }
        } else {
          el.setAttribute(key, val);
        }
      }
    }

    if (refNode) {
      dojo.place(el, refNode, pos);
    }

    return el;
  };

  // ── dojo.place(node, refNode, pos) ───────────────────────────────
  // Positions `node` relative to `refNode`. Positions: "last" (default),
  // "first", "before", "after", "replace", or a numeric index.
  dojo.place = function(node, refNode, pos) {
    if (!node || !refNode) return node;

    // Normalize position
    pos = pos || 'last';

    switch (pos) {
      case 'last':
        refNode.appendChild(node);
        break;
      case 'first':
        if (refNode.firstChild) {
          refNode.insertBefore(node, refNode.firstChild);
        } else {
          refNode.appendChild(node);
        }
        break;
      case 'before':
        refNode.parentNode && refNode.parentNode.insertBefore(node, refNode);
        break;
      case 'after':
        if (refNode.nextSibling) {
          refNode.parentNode && refNode.parentNode.insertBefore(node, refNode.nextSibling);
        } else {
          refNode.parentNode && refNode.parentNode.appendChild(node);
        }
        break;
      case 'replace':
        refNode.parentNode && refNode.parentNode.replaceChild(node, refNode);
        break;
      default:
        // Treat as numeric index (legacy support)
        if (typeof pos === 'number' && refNode.children[pos]) {
          refNode.insertBefore(node, refNode.children[pos]);
        } else {
          refNode.appendChild(node);
        }
    }
    return node;
  };

  // ── dojo.empty(node) ─────────────────────────────────────────────
  dojo.empty = function(node) {
    if (node) {
      // Fast clearing
      while (node.lastChild) {
        node.removeChild(node.lastChild);
      }
    }
    return node;
  };

  // ── dojo.destroy(node) ───────────────────────────────────────────
  dojo.destroy = function(node) {
    if (node) {
      if (node.parentNode) {
        node.parentNode.removeChild(node);
      }
    }
  };

  // ── dojo.style(node, prop, value) ────────────────────────────────
  // Getter:  dojo.style(node, "display")  → returns computed style
  // Setter:  dojo.style(node, "display", "none")
  // Object:  dojo.style(node, {display:"none", opacity:"0"})
  dojo.style = function(node, prop, value) {
    if (!node) return undefined;

    // Object setter: dojo.style(node, { prop: val, ... })
    if (typeof prop === 'object') {
      for (var key in prop) {
        if (Object.prototype.hasOwnProperty.call(prop, key)) {
          node.style[key] = prop[key];
        }
      }
      return node;
    }

    // Getter: dojo.style(node, "display")
    if (value === undefined) {
      // Return computed style
      return node.style[prop] || (node.currentStyle || window.getComputedStyle(node, ''))[prop] || '';
    }

    // Setter: dojo.style(node, "display", "none")
    node.style[prop] = value;
    return node;
  };

  // ── dojo.addClass(node, class) ───────────────────────────────────
  dojo.addClass = function(node, cls) {
    if (node && cls) {
      if (node.classList) {
        cls.split(/\s+/).forEach(function(c) {
          if (c) node.classList.add(c);
        });
      } else {
        node.className += ' ' + cls;
      }
    }
    return node;
  };

  // ── dojo.removeClass(node, class) ────────────────────────────────
  dojo.removeClass = function(node, cls) {
    if (node && cls) {
      if (node.classList) {
        cls.split(/\s+/).forEach(function(c) {
          if (c) node.classList.remove(c);
        });
      } else {
        node.className = node.className.replace(
          new RegExp('(^|\\s)' + cls + '(\\s|$)', 'g'), ' '
        ).trim();
      }
    }
    return node;
  };

  // ── dojo.toggleClass(node, class) ────────────────────────────────
  dojo.toggleClass = function(node, cls) {
    if (node && cls) {
      if (node.classList) {
        node.classList.toggle(cls);
      } else {
        if (dojo.hasClass(node, cls)) {
          dojo.removeClass(node, cls);
        } else {
          dojo.addClass(node, cls);
        }
      }
    }
    return node;
  };

  // ── dojo.hasClass(node, class) ───────────────────────────────────
  dojo.hasClass = function(node, cls) {
    if (!node || !cls) return false;
    if (node.classList) {
      return node.classList.contains(cls);
    }
    return new RegExp('(^|\\s)' + cls + '(\\s|$)').test(node.className);
  };

  // ── dojo.connect(obj, event, context, method) → addEventListener ─
  // Supports: dojo.connect(node, "onclick", ctx, "methodName")
  //           dojo.connect(node, "onclick", ctx, fn)
  //           dojo.connect(node, "onclick", fn)
  dojo.connect = function(obj, event, context, method) {
    if (!obj || !event) return null;

    // Normalize event name: "onclick" → "click"
    var eventName = event;
    if (eventName.indexOf('on') === 0) {
      eventName = eventName.slice(2);
    }

    // Handle different argument patterns
    var fn;
    if (typeof context === 'function') {
      // dojo.connect(obj, event, fn)
      fn = context;
      context = null;
    } else if (typeof method === 'string') {
      // dojo.connect(obj, event, ctx, "methodName")
      fn = function(evt) {
        context[method](evt);
      };
    } else if (typeof method === 'function') {
      // dojo.connect(obj, event, ctx, fn)
      fn = function(evt) {
        method.call(context, evt);
      };
    } else {
      fn = function() {};
    }

    obj.addEventListener(eventName, fn, false);

    // Return a handle with remove() for dojo.disconnect compatibility
    var handle = {
      remove: function() {
        obj.removeEventListener(eventName, fn, false);
      }
    };
    return handle;
  };

  // ── dojo.marginBox(node) ─────────────────────────────────────────
  // Returns {w, h} of the node including padding and border
  if (typeof dojo.marginBox !== 'function') {
    dojo.marginBox = function(node) {
      if (!node) return { w: 0, h: 0 };
      var rect = node.getBoundingClientRect();
      return { w: rect.width, h: rect.height };
    };
  }

  // ── dojo.coords(node) ────────────────────────────────────────────
  // Returns position and size info about the node
  if (typeof dojo.coords !== 'function') {
    dojo.coords = function(node) {
      if (!node) return { x: 0, y: 0, w: 0, h: 0 };
      var rect = node.getBoundingClientRect();
      return {
        x: rect.left + window.scrollX,
        y: rect.top + window.scrollY,
        w: rect.width,
        h: rect.height
      };
    };
  }

  // ── dojo.position(node) ──────────────────────────────────────────
  if (typeof dojo.position !== 'function') {
    dojo.position = function(node) {
      if (!node) return { x: 0, y: 0, w: 0, h: 0 };
      var rect = node.getBoundingClientRect();
      return {
        x: rect.left,
        y: rect.top,
        w: rect.width,
        h: rect.height
      };
    };
  }

  console.log('[dom.js] Dojo DOM functions replaced with native implementations');
})();
