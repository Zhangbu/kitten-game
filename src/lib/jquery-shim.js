/**
 * jQuery compatibility shim — replaces jQuery with native DOM API
 *
 * Provides a jQuery-compatible `$` function and static methods
 * ($.getJSON, $.ajax, $.extend, $.Deferred) so existing game code
 * continues to work without modification.
 *
 * Loaded BEFORE any game files in index.html.
 */

(function() {
  'use strict';

  // ── Minimal Deferred (replaces $.Deferred) ────────────────────
  function Deferred() {
    // Auto-instantiate when called without `new` (matches real jQuery behavior)
    if (!(this instanceof Deferred)) return new Deferred();
    var self = this;
    this._promise = new Promise(function(resolve, reject) {
      self._resolve = resolve;
      self._reject = reject;
    });
    this._doneFns = [];
    this._failFns = [];
    this._resolved = false;
    this._rejected = false;
    this._value = undefined;
  }

  Deferred.prototype.resolve = function(val) {
    if (this._resolved || this._rejected) return this;
    this._resolved = true;
    this._value = val;
    this._resolve(val);
    var fns = this._doneFns;
    this._doneFns = [];
    for (var i = 0; i < fns.length; i++) fns[i](val);
    return this;
  };

  Deferred.prototype.reject = function(err) {
    if (this._resolved || this._rejected) return this;
    this._rejected = true;
    this._value = err;
    this._reject(err);
    var fns = this._failFns;
    this._failFns = [];
    for (var i = 0; i < fns.length; i++) fns[i](err);
    return this;
  };

  Deferred.prototype.done = function(fn) {
    if (this._resolved) { fn(this._value); return this; }
    this._doneFns.push(fn);
    this._promise.then(fn);
    return this;
  };

  Deferred.prototype.fail = function(fn) {
    if (this._rejected) { fn(this._value); return this; }
    this._failFns.push(fn);
    this._promise.catch(fn);
    return this;
  };

  Deferred.prototype.always = function(fn) {
    this.done(fn).fail(fn);
    return this;
  };

  Deferred.prototype.promise = function() {
    // Return self so callers can chain .done()/.fail()/.always()
    return this;
  };

  Deferred.prototype.then = function(doneFn, failFn) {
    this._promise.then(doneFn, failFn);
    return this;  // return Deferred for .fail()/.always() chaining
  };

  // ── Ajax (minimal) ────────────────────────────────────────────
  function ajax(options) {
    var deferred = new Deferred();

    var xhr = new XMLHttpRequest();
    xhr.open(options.type || 'GET', options.url, true);

    if (options.dataType === 'json') {
      xhr.setRequestHeader('Accept', 'application/json');
    }
    if (options.contentType) {
      xhr.setRequestHeader('Content-Type', options.contentType);
    }

    xhr.onload = function() {
      if (xhr.status >= 200 && xhr.status < 300) {
        var data = xhr.responseText;
        if (options.dataType === 'json' || options.url.indexOf('.json') >= 0) {
          try { data = JSON.parse(data); } catch (e) {}
        }
        deferred.resolve(data);
      } else {
        deferred.reject(new Error('HTTP ' + xhr.status));
      }
    };
    xhr.onerror = function() {
      deferred.reject(new Error('Network error'));
    };
    xhr.send(options.data || null);

    var xhrDeferred = deferred;
    xhrDeferred.xhr = xhr;
    return xhrDeferred;
  }

  // ── getJSON ───────────────────────────────────────────────────
  function getJSON(url, data, callback) {
    if (typeof data === 'function') {
      callback = data;
      data = null;
    }
    var deferred = ajax({
      url: url,
      type: 'GET',
      dataType: 'json',
      data: data
    });
    if (callback) {
      deferred.done(callback);
    }
    return deferred;
  }

  // ── extend ────────────────────────────────────────────────────
  function extend(target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = arguments[i];
      if (source) {
        for (var key in source) {
          if (Object.prototype.hasOwnProperty.call(source, key)) {
            target[key] = source[key];
          }
        }
      }
    }
    return target;
  }

  // ── DOM element collection ($(selector)) ──────────────────────
  // Returns an array-like object with jQuery-style methods.
  function jQueryShim(selector, context) {
    if (typeof selector === 'function') {
      // $(fn) — DOMContentLoaded shorthand
      if (document.readyState !== 'loading') {
        selector();
      } else {
        document.addEventListener('DOMContentLoaded', selector);
      }
      return jQueryShim.fn;
    }

    var elements;

    if (typeof selector === 'string') {
      var ctx = context || document;
      if (selector.charAt(0) === '<' && selector.charAt(selector.length - 1) === '>') {
        // Create element: $("<div>") or $("<link />")
        var tag = selector.slice(1, -1).replace(/\/\s*$/, '').trim();
        elements = [document.createElement(tag)];
      } else {
        // Query selector
        var nodeList = ctx.querySelectorAll(selector);
        elements = Array.prototype.slice.call(nodeList);
      }
    } else if (selector instanceof Element) {
      elements = [selector];
    } else if (selector instanceof NodeList || Array.isArray(selector)) {
      elements = Array.prototype.slice.call(selector);
    } else if (selector && selector.jquery) {
      return selector;
    } else {
      elements = [];
    }

    return createCollection(elements);
  }

  // ── Collection methods ────────────────────────────────────────
  function createCollection(elements) {
    var collection = elements.slice();

    // Array-like properties
    collection.length = elements.length;
    for (var i = 0; i < elements.length; i++) {
      collection[i] = elements[i];
    }

    // Extend with methods
    var methods = {
      jquery: '3.0.0-shim',

      each: function(fn) {
        for (var i = 0; i < this.length; i++) {
          fn.call(this[i], i, this[i]);
        }
        return this;
      },

      find: function(sel) {
        var results = [];
        this.each(function() {
          var found = this.querySelectorAll(sel);
          for (var j = 0; j < found.length; j++) {
            results.push(found[j]);
          }
        });
        return createCollection(results);
      },

      html: function(val) {
        if (val === undefined) {
          return this[0] ? this[0].innerHTML : undefined;
        }
        this.each(function() { this.innerHTML = val; });
        return this;
      },

      text: function(val) {
        if (val === undefined) {
          return this[0] ? this[0].textContent : '';
        }
        this.each(function() { this.textContent = val; });
        return this;
      },

      attr: function(name, val) {
        if (val === undefined) {
          return this[0] ? this[0].getAttribute(name) : undefined;
        }
        if (typeof name === 'object') {
          for (var k in name) {
            if (Object.prototype.hasOwnProperty.call(name, k)) {
              this.each(function() { this.setAttribute(k, name[k]); });
            }
          }
        } else {
          this.each(function() { this.setAttribute(name, val); });
        }
        return this;
      },

      val: function(val) {
        if (val === undefined) {
          return this[0] ? this[0].value : undefined;
        }
        this.each(function() { this.value = val; });
        return this;
      },

      css: function(prop, val) {
        if (typeof prop === 'object') {
          for (var k in prop) {
            if (Object.prototype.hasOwnProperty.call(prop, k)) {
              this.each(function() { this.style[k] = prop[k]; });
            }
          }
          return this;
        }
        if (val === undefined) {
          return this[0] ? getComputedStyle(this[0])[prop] : '';
        }
        this.each(function() { this.style[prop] = val; });
        return this;
      },

      addClass: function(cls) {
        if (!cls) return this;
        this.each(function() {
          var c = this;
          cls.split(/\s+/).forEach(function(name) {
            if (name) c.classList.add(name);
          });
        });
        return this;
      },

      removeClass: function(cls) {
        if (!cls) return this;
        this.each(function() {
          var c = this;
          cls.split(/\s+/).forEach(function(name) {
            if (name) c.classList.remove(name);
          });
        });
        return this;
      },

      hasClass: function(cls) {
        return this[0] ? this[0].classList.contains(cls) : false;
      },

      toggleClass: function(cls) {
        if (!cls) return this;
        this.each(function() { this.classList.toggle(cls); });
        return this;
      },

      hide: function() {
        this.each(function() { this.style.display = 'none'; });
        return this;
      },

      show: function() {
        this.each(function() {
          if (this.style.display === 'none') {
            this.style.display = '';
          }
        });
        return this;
      },

      toggle: function() {
        this.each(function() {
          if (this.style.display === 'none') {
            this.style.display = '';
          } else {
            this.style.display = 'none';
          }
        });
        return this;
      },

      append: function(content) {
        if (typeof content === 'string') {
          this.each(function() { this.insertAdjacentHTML('beforeend', content); });
        } else if (content instanceof Element) {
          this.each(function() { this.appendChild(content.cloneNode(true)); });
        } else if (content && content.jquery) {
          this.each(function(self) {
            content.each(function() { self.appendChild(this.cloneNode(true)); });
          });
        }
        return this;
      },

      appendTo: function(target) {
        var $target = jQueryShim(target);
        var self = this;
        $target.each(function(_idx, tgtEl) {
          for (var i = 0; i < self.length; i++) {
            var el = self[i];
            if (i === 0) {
              tgtEl.appendChild(el);
            } else {
              tgtEl.appendChild(el.cloneNode(true));
            }
          }
        });
        return this;
      },

      prepend: function(content) {
        this.each(function() {
          if (typeof content === 'string') {
            this.insertAdjacentHTML('afterbegin', content);
          } else if (content instanceof Element) {
            this.insertBefore(content, this.firstChild);
          }
        });
        return this;
      },

      before: function(content) {
        this.each(function() {
          this.insertAdjacentHTML('beforebegin', typeof content === 'string' ? content : '');
        });
        return this;
      },

      after: function(content) {
        this.each(function() {
          this.insertAdjacentHTML('afterend', typeof content === 'string' ? content : '');
        });
        return this;
      },

      remove: function() {
        this.each(function() { if (this.parentNode) this.parentNode.removeChild(this); });
        return this;
      },

      detach: function() {
        return this.remove();
      },

      empty: function() {
        this.each(function() {
          while (this.firstChild) this.removeChild(this.firstChild);
        });
        return this;
      },

      on: function(event, handler) {
        this.each(function() {
          this.addEventListener(event, handler);
        });
        return this;
      },

      off: function(event, handler) {
        this.each(function() {
          this.removeEventListener(event, handler);
        });
        return this;
      },

      trigger: function(event, data) {
        this.each(function() {
          this.dispatchEvent(new CustomEvent(event, { detail: data }));
        });
        return this;
      },

      first: function() {
        return createCollection(this.length > 0 ? [this[0]] : []);
      },

      last: function() {
        return createCollection(this.length > 0 ? [this[this.length - 1]] : []);
      },

      eq: function(i) {
        return createCollection(this[i] ? [this[i]] : []);
      },

      parent: function() {
        var results = [];
        this.each(function() {
          if (this.parentNode && results.indexOf(this.parentNode) < 0) {
            results.push(this.parentNode);
          }
        });
        return createCollection(results);
      },

      children: function() {
        var results = [];
        this.each(function() {
          var kids = this.children;
          for (var j = 0; j < kids.length; j++) results.push(kids[j]);
        });
        return createCollection(results);
      },

      closest: function(sel) {
        var results = [];
        this.each(function() {
          var el = this;
          while (el && !el.matches(sel)) el = el.parentElement;
          if (el && results.indexOf(el) < 0) results.push(el);
        });
        return createCollection(results);
      },

      is: function(sel) {
        return this[0] ? this[0].matches(sel) : false;
      },

      not: function(sel) {
        var results = [];
        this.each(function() {
          if (!this.matches(sel)) results.push(this);
        });
        return createCollection(results);
      },

      filter: function(sel) {
        var results = [];
        this.each(function() {
          if (this.matches(sel)) results.push(this);
        });
        return createCollection(results);
      },

      map: function(fn) {
        var results = [];
        this.each(function(i, el) {
          results.push(fn.call(el, i, el));
        });
        return createCollection(results);
      },

      slice: function(start, end) {
        return createCollection(Array.prototype.slice.call(this, start, end));
      },

      index: function(el) {
        if (!el) {
          return this[0] ? Array.prototype.indexOf.call(this[0].parentNode.children, this[0]) : -1;
        }
        return Array.prototype.indexOf.call(this, jQueryShim(el)[0]);
      },

      data: function(key, val) {
        if (val === undefined) {
          return this[0] ? this[0].dataset[key] : undefined;
        }
        this.each(function() { this.dataset[key] = String(val); });
        return this;
      },

      width: function() {
        return this[0] ? this[0].offsetWidth : 0;
      },

      height: function() {
        if (!this[0]) return 0;
        if (this[0] === window || this[0] === document) return window.innerHeight || document.documentElement.clientHeight || 0;
        return this[0].offsetHeight;
      },

      position: function() {
        if (!this[0]) return { top: 0, left: 0 };
        var rect = this[0].getBoundingClientRect();
        return { top: rect.top + window.scrollY, left: rect.left + window.scrollX };
      },

      offset: function() {
        if (!this[0]) return { top: 0, left: 0 };
        var rect = this[0].getBoundingClientRect();
        return { top: rect.top, left: rect.left };
      },

      scrollTop: function(val) {
        if (val !== undefined) {
          this.each(function() { this.scrollTop = val; window.scrollTo && window.scrollTo(window.scrollX, val); });
          return this;
        }
        var el = this[0];
        if (!el) return 0;
        if (el === window || el === document) return window.scrollY || document.documentElement.scrollTop || 0;
        return el.scrollTop;
      },

      scrollLeft: function(val) {
        if (val !== undefined) {
          this.each(function() { this.scrollLeft = val; window.scrollTo && window.scrollTo(val, window.scrollY); });
          return this;
        }
        var el = this[0];
        if (!el) return 0;
        if (el === window || el === document) return window.scrollX || document.documentElement.scrollLeft || 0;
        return el.scrollLeft;
      },

      width: function() {
        var el = this[0];
        if (!el) return 0;
        if (el === window || el === document) return window.innerWidth || document.documentElement.clientWidth || 0;
        return el.offsetWidth;
      },

      outerHeight: function(includeMargin) {
        var el = this[0];
        if (!el) return 0;
        var h = el.offsetHeight || 0;
        if (includeMargin) {
          var s = getComputedStyle(el);
          h += parseInt(s.marginTop || '0', 10) + parseInt(s.marginBottom || '0', 10);
        }
        return h;
      },

      outerWidth: function(includeMargin) {
        var el = this[0];
        if (!el) return 0;
        var w = el.offsetWidth || 0;
        if (includeMargin) {
          var s = getComputedStyle(el);
          w += parseInt(s.marginLeft || '0', 10) + parseInt(s.marginRight || '0', 10);
        }
        return w;
      },

      animate: function(props, duration, callback) {
        if (!this[0]) return this;
        var el = this[0];
        var self = this;
        // Set CSS changes directly (no CSS transitions — simpler for short anims)
        for (var key in props) {
          if (Object.prototype.hasOwnProperty.call(props, key)) {
            el.style[key] = props[key];
          }
        }
        // If duration is very short, callback fires after a small delay
        // to let the browser paint the change (pulse/highlight effect)
        if (callback) {
          setTimeout(callback, duration || 70);
        }
        return this;
      },
    };

    for (var key in methods) {
      if (Object.prototype.hasOwnProperty.call(methods, key)) {
        collection[key] = methods[key];
      }
    }

    return collection;
  }

  // ── Static methods ────────────────────────────────────────────
  jQueryShim.fn = createCollection([]);
  jQueryShim.Deferred = Deferred;
  jQueryShim.ajax = ajax;
  jQueryShim.getJSON = getJSON;
  jQueryShim.extend = extend;
  jQueryShim.each = function(arr, fn) {
    for (var i = 0; i < arr.length; i++) {
      if (fn.call(arr[i], i, arr[i]) === false) break;
    }
    return arr;
  };
  jQueryShim.trim = function(str) { return str ? str.trim() : ''; };
  jQueryShim.type = function(obj) { return Object.prototype.toString.call(obj).slice(8, -1).toLowerCase(); };
  jQueryShim.isArray = Array.isArray;
  jQueryShim.inArray = function(val, arr) { return arr.indexOf(val); };
  jQueryShim.makeArray = function(arr) { return Array.prototype.slice.call(arr); };
  jQueryShim.map = function(arr, fn) {
    var results = [];
    for (var i = 0; i < arr.length; i++) results.push(fn(arr[i], i));
    return results;
  };
  jQueryShim.grep = function(arr, fn) {
    var results = [];
    for (var i = 0; i < arr.length; i++) {
      if (fn(arr[i], i)) results.push(arr[i]);
    }
    return results;
  };

  // ── Install ───────────────────────────────────────────────────
  window.$ = window.jQuery = jQueryShim;

  console.log('[jquery-shim] jQuery replaced with native DOM shim');
})();
