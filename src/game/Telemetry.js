/**
 * Telemetry — game event logging and New Relic integration.
 */
dojo.declare("mixin.IDataStorageAware", null, {
  constructor: function() {
    dojo.subscribe("server/save", dojo.hitch(this, this.save));
    dojo.subscribe("server/load", dojo.hitch(this, this.load));
  }
});

dojo.declare("classes.game.Telemetry", [mixin.IDataStorageAware], {
  guid: null,
  game: null,
  buildRevision: null,
  version: null,
  errorCount: 0,

  constructor: function(game) {
    this.guid = this.generateGuid();
    this.game = game;
  },

  generateGuid: function() {
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function(c) {
      return (c === "x" ? 16 * Math.random() | 0 : 4 * Math.random() | 8).toString(16);
    });
  },

  save: function(data) { data.telemetry = { guid: this.guid }; },

  load: function(data) {
    if (data.telemetry) this.guid = data.telemetry.guid || this.generateGuid();
    var self = this;
    if (window.newrelic && !this.game.opts.disableTelemetry) {
      window.newrelic.addRelease("KG", this.version + ".r" + this.buildRevision);
      window.newrelic.setCustomAttribute("buildRevision", this.version + ".r" + this.buildRevision);
      window.newrelic.setCustomAttribute("guid", this.guid);
      if (this.game.server.userProfile) window.newrelic.setCustomAttribute("uid", this.game.server.userProfile.uid);
      window.newrelic.setErrorHandler(function(err) {
        self.game.achievements.unlockBadge("ghostInTheMachine");
        if (self.errorCount >= 100) return true;
        if (err.stack && err.stack.lastIndexOf("mikiso1024") >= 0) return true;
        self.errorCount++;
        return false;
      });
    }
  },

  logEvent: function(eventType, payload) {
    payload = payload || {};
    if (window.newrelic && !this.game.opts.disableTelemetry) window.newrelic.addPageAction(eventType, payload);
  },

  logRouteChange: function(name) {
    if (window.newrelic && !this.game.opts.disableTelemetry) {
      var interaction = window.newrelic.interaction();
      window.newrelic.setCurrentRouteName(name);
      interaction.save();
      this.logEvent("routeChange", { name: name });
    }
  }
});
