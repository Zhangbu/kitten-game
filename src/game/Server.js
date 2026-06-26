/**
 * KGNet server communication.
 * dojo.declare registers this globally as classes.game.Server.
 */
dojo.declare("classes.game.Server", null, {
  showMotd: true,
  motdTitle: null,
  motdContent: null,
  game: null,
  motdContentPrevious: null,
  motdFreshMessage: false,
  userProfile: null,
  chiral: null,
  lastBackup: null,
  saveData: null,

  constructor: function(game) { this.game = game; },

  setUserProfile: function(userProfile) { this.userProfile = userProfile; },

  getServerUrl: function() {
    var host = window.location.hostname;
    var isLocalhost = window.location.protocol === "file:" || host === "localhost" || host === "127.0.0.1";
    return isLocalhost ? "http://localhost:7780" : "";
  },

  refresh: function() {
    var self = this;
    console.log("Loading server settings...");
    $.ajax({ cache: false, url: "server.json", dataType: "json",
      success: function(json) {
        self.showMotd = json.showMotd;
        self.motdTitle = json.motdTitle;
        self.motdContent = json.motdContent;
      }
    }).done(function() {
      if (self.motdContentPrevious !== self.motdContent) {
        self.motdContentPrevious = self.motdContent;
        self.motdFreshMessage = true;
      }
    }).fail(function(err) {
      console.log("Unable to parse server.json configuration:", err);
    });
    if (!this.userProfile) this.syncUserProfile();
  },

  _xhr: function(url, method, data, handler) {
    return $.ajax({
      cache: false, type: method || "GET", dataType: "JSON",
      url: this.getServerUrl() + url,
      xhrFields: { withCredentials: true }, data: data
    }).done(function(resp) { handler(resp); });
  },

  syncUserProfile: function() {
    var self = this;
    this._xhr("/user/", "GET", {}, function(resp) {
      if (resp && resp.id) self.setUserProfile(resp);
    });
  },

  syncSaveData: function() {
    var self = this;
    return this._xhr("/kgnet/save/", "GET", {}, function(resp) { self.saveData = resp; });
  },

  pushSave: function() {
    var self = this, game = this.game;
    game.lastBackup = new Date().getTime();
    var saveData = this.game.save();
    this._xhr("/kgnet/save/upload/", "POST", {
      guid: this.game.telemetry.guid,
      saveData: this.game.compressLZData(JSON.stringify(saveData), true),
      metadata: { calendar: { year: game.calendar.year, day: game.calendar.day } }
    }, function(resp) {
      self.saveData = resp;
      self.game.msg($I("save.export.msg"));
    });
  },

  pushSaveMetadata: function(guid, metadata) {
    var self = this;
    return this._xhr("/kgnet/save/update/", "POST", { guid, metadata }, function(resp) { self.saveData = resp; });
  },

  loadSave: function(guid) {
    var self = this;
    this._xhr("/kgnet/save/" + guid + "/download/", "GET", {}, function(resp) {
      if (!resp.data) { console.error("unable to load game data", resp); return; }
      LCstorage["com.nuclearunicorn.kittengame.savedata"] = resp.data;
      self.game.load();
      self.game.msg($I("save.import.msg"));
    });
  },

  save: function(saveData) {
    saveData.server = { motdContent: this.motdContent };
  },

  sendCommand: function(command) {
    var self = this;
    this._xhr("/kgnet/chiral/game/command/", "POST", { command }, function(resp) {
      if (resp.clientState) self.setChiral(resp);
    });
  },

  setChiral: function(data) { this.chiral = JSON.stringify(data, null, 2); }
});
