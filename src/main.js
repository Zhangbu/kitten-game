/**
 * Kitten Game — Vite Entry Point
 *
 * Game files (core.js, js/*.js, game.js) are loaded dynamically
 * after i18n initialization completes, preserving the original
 * async loading order that the SystemJS loader provided.
 */

// ============================================================
// Global aliases for strict module compatibility
// ============================================================
var $ = window.$;
var jQuery = window.jQuery;
var LCstorage = window.LCstorage;
var classes = window.classes;
var com = window.com;
var mixin = window.mixin;
var i18nLang = window.i18nLang;
var Dropbox = window.Dropbox;
var LZString = window.LZString;
var React = window.React;
var dojo = window.dojo;
var game, gamePage;  // set at runtime by startGame()

// ============================================================
// Dynamic script loader (sequential, preserves dependency order)
// ============================================================
function loadScript(src) {
  return new Promise(function(resolve, reject) {
    var s = document.createElement('script');
    s.src = src;
    s.onload = resolve;
    s.onerror = function() {
      console.error('[KG] Failed to load:', src);
      reject(new Error('Failed to load: ' + src));
    };
    document.head.appendChild(s);
  });
}

function loadGameFiles() {
  // Dependency order — must match SystemJS loading chain
  var files = [
    'core.js',

    'js/resources.js',
    'js/calendar.js',
    'js/buildings.js',
    'js/village.js',
    'js/science.js',
    'js/workshop.js',
    'js/diplomacy.js',
    'js/religion.js',
    'js/achievements.js',

    'js/jsx/left.jsx.js',
    'js/jsx/mid.jsx.js',
    'js/jsx/toolbar.jsx.js',
    'js/jsx/chiral.jsx.js',
    'js/jsx/queue.jsx.js',

    'js/ui.js',
    'js/space.js',
    'js/prestige.js',
    'js/time.js',
    'js/stats.js',
    'js/challenges.js',
    'js/void.js',
    'js/math.js',

    'game.js',
    'js/toolbar.js',
  ];

  return files.reduce(function(chain, file) {
    return chain.then(function() { return loadScript(file); });
  }, Promise.resolve());
}

// ============================================================
// Boot sequence
// ============================================================
(function boot() {
  var now = Date.now();
  var version = '1493';
  var buildRevision = 0;

  // ---- Fetch build version (non-blocking) ----
  $.getJSON('build.version.json?_=' + now)
    .then(function(json) {
      buildRevision = json.buildRevision;
      $('#versionLink').html(
        version.split('').join('.') + '.r' + buildRevision
      );
    });

  // ---- Load saved theme from localStorage ----
  var uiData = LCstorage['com.nuclearunicorn.kittengame.ui'];
  var uiSettings = uiData && JSON.parse(uiData);

  // ---- Load all theme CSS files ----
  var schemes = new classes.KGConfig().statics.schemes;
  for (var i = 0; i < schemes.length; i++) {
    if (!uiSettings || uiSettings.theme !== schemes[i]) {
      $('<link />')
        .attr('rel', 'stylesheet')
        .attr('type', 'text/css')
        .attr('href', 'res/theme_' + schemes[i] + '.css?_=' + now)
        .appendTo($('head'));
    }
  }

  if (uiSettings && uiSettings.theme) {
    $('body').addClass('scheme_' + uiSettings.theme);
  }

  // ---- Initialize i18n, then load game files ----
  i18nLang.init(now).done(function() {
    // i18n messages loaded — safe to load files that call $I()
    loadGameFiles().then(function() {
      startGame(version, buildRevision);
    });
  }).fail(function() {
    console.warn('Unable to load locales, starting game anyway');
    loadGameFiles().then(function() {
      startGame(version, buildRevision);
    });
  });
})();

// ============================================================
// Game initialization
// ============================================================
function startGame(version, buildRevision) {
  console.log('About to initialize the game');
  $('#loadingContainer').hide();
  $('#game').show();

  try {
    game = window.game = new com.nuclearunicorn.game.ui.GamePage();
    gamePage = window.gamePage = game;
    gamePage.setUI(new classes.ui.DesktopUI('gameContainerId'));

    gamePage.telemetry.version = version;
    gamePage.telemetry.buildRevision = buildRevision;
    if (window.location.href.indexOf('beta') >= 0) {
      gamePage.telemetry.buildRevision += '-b';
    }

    if (typeof Dropbox !== 'undefined' && Dropbox.Dropbox) {
      var dropBoxClient = new Dropbox.Dropbox({ clientId: 'u6lnczzgm94nwg3' });
      game.setDropboxClient(dropBoxClient);
    } else {
      console.log('[KG] Dropbox not available, skipping');
    }

    gamePage.load();
    gamePage.updateKarma();
    gamePage.render();
    gamePage.ui.renderFilters();
    gamePage.ui.onLoad();
    gamePage.start();

    $('iframe#kiwiirc_iframe').attr(
      'src',
      'https://kiwiirc.com/client/irc.canternet.org/?nick=kitten_?#kittensgame'
    );

    var config = new classes.KGConfig();
    gamePage.checkEldermass();

    var host = window.location.hostname;
    gamePage.isLocalhost = window.location.protocol === 'file:' ||
      host === 'localhost' || host === '127.0.0.1';
    if (gamePage.isLocalhost) {
      $('#devModeButton').show();
    }
  } catch (ex) {
    if (game && game.telemetry) {
      game.telemetry.logEvent('error', ex);
    }
    console.error(ex);
    console.trace();
  }
}
