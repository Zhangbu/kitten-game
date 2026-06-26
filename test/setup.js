/**
 * ======================================
 *  Welcome to the VITEST KG bootloader!
 *
 *  dojo is problematic to load in the headless test context,
 *  given that it is a bunch of AMD modules with a lot of XHR request in the .xd. wrapper we use
 *
 *  Until this problem is fixed (and trust me, it's not straightforward), we use the mocked dojo
 *
 *  To at least load the game core, we are relying on the portable dojo.declare version and some fuckery with
 *  global namespaces
 * =======================================
 */

/* global

    global,
    require,
    gamePage
*/
try {
    global.React = require("react");
    // Provide createRoot for React 18 compatibility (ui.js now uses it)
    global.createRoot = function(container) {
        return {
            render: function(element) {
                // no-op in test environment
            },
            unmount: function() {
                // no-op
            }
        };
    };

    //---------- inventing creative workarounds since 20XX -------
    var createNamespace = require("./declare");

    var namespace = { com: {}, classes: {}, mixin: {} };
    var dojo = createNamespace(namespace);
    global.com = namespace.com;
    global.classes = namespace.classes;
    global.mixin = namespace.mixin;

    //-------------------------------------------------------------
    //we can't load dojo so let's just mock it (what could possibly go wrong)
    global.dojo = {
        version: {minor: 6},
        declare: dojo.declare,
        destroy: function(){},
        empty: function(){},
        byId: function(){},
        forEach: function(array, predicate){
            for (var i in array){
                predicate(array[i]);
            }
        },
        clone: function(mixin){return Object.assign({}, mixin);},
        hitch: function(ctx, method){ return function() {
            return typeof method === 'string' ? ctx[method].apply(ctx, arguments) : method.apply(ctx, arguments);
        };},
        connect: function(){},
        publish: function(){},
        subscribe: function(){ return 0; },
        unsubscribe: function(){},
        partial: function(fn) {
            var args = Array.prototype.slice.call(arguments, 1);
            return function() {
                return fn.apply(this, args.concat(Array.prototype.slice.call(arguments)));
            };
        },
        mixin: function(obj, mixin){return Object.assign(obj, mixin); },
        create: function(tag, attrs, refNode, pos) {
            var el = { style: {}, className: '', innerHTML: '' };
            if (attrs) {
                for (var k in attrs) el[k] = attrs[k];
            }
            return el;
        },
        place: function(node, refNode, pos) { return node; },
        style: function(node, prop, val) { return ''; },
        addClass: function(){},
        removeClass: function(){},
    };

    var xhrMock = {
        done: function(){return this},
        fail: function(){return this},
        always: function(){return this},
    };
    global.$ = {
        ajax: function(){ return xhrMock; },
        getJSON: function(url, cb) {
            if (typeof url === 'function') cb = url;
            if (cb) cb({ buildRevision: 0 });
            return xhrMock;
        },
        Deferred: function() {
            var d = {
                resolve: function(){ return d; },
                reject: function(){ return d; },
                done: function(fn){ return d; },
                fail: function(fn){ return d; },
                always: function(fn){ return d; },
                then: function(fn){ return d; },
                promise: function(){ return d; },
            };
            return d;
        },
    };

    global.LZString = require("../lib/lz-string.js");
    require("../lib/dropbox_v2.js");

    global.LCstorage = {};
    global.LCstorage.removeItem = function () { };
    global.LCstorage.getItem = function() { return null; };
    global.LCstorage.setItem = function() { };

    require("../config");
    require("../i18n");

    //mock $I
    global.$I = function(key, args) {
        return "$" + key + "$";
    };

    require("../core");
    require("../src/ui/Console");
    require("../src/ui/Button");
    require("../src/ui/Panel");

    require("../js/resources");
    require("../js/calendar");
    require("../js/buildings");
    require("../js/village");
    require("../js/science");
    require("../js/workshop");
    require("../js/diplomacy");
    require("../js/religion");

    require("../js/achievements");
    require("../js/space");
    require("../js/prestige");
    require("../js/time");
    require("../js/stats");
    require("../js/challenges");
    require("../js/void");
    require("../js/math");
    require("../src/game/Timer");
    require("../src/game/Telemetry");
    require("../src/game/Server");
    require("../src/game/UndoChange");
    require("../src/game/EffectsManager");
    require("../game");
    require("../js/ui");
    require("../js/toolbar");

    // Suppress console noise in tests
    if (typeof vi !== 'undefined') {
        vi.spyOn(global.console, "log").mockImplementation(function() {});
        vi.spyOn(global.console, "trace").mockImplementation(function() {});
        vi.spyOn(global.console, "warn").mockImplementation(function() {});
    }
}
catch (e) {
    console.log("oh no big error");
    console.error(e);
}
