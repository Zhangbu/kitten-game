/**
 * Simple game timer.
 * dojo.declare registers this globally as classes.game.Timer.
 */
dojo.declare("classes.game.Timer", null, {
  handlers: [],
  scheduledHandlers: [],

  ticksTotal: 0,
  timestampStart: null,
  totalUpdateTime: null,
  currentTime: 0,
  averageTime: 0,

  addEvent: function(handler, frequency) {
    this.handlers.push({ handler, frequency, phase: 0 });
  },

  update: function() {
    for (var i = 0; i < this.handlers.length; i++) {
      var h = this.handlers[i];
      h.phase--;
      if (h.phase <= 0) {
        h.phase = h.frequency;
        h.handler();
      }
    }
  },

  scheduleEvent: function(handler) {
    this.scheduledHandlers.push(handler);
  },

  updateScheduledEvents: function() {
    for (var i in this.scheduledHandlers) {
      this.scheduledHandlers[i]();
    }
    this.scheduledHandlers = [];
  },

  beforeUpdate: function() {
    this.timestampStart = new Date().getTime();
  },

  afterUpdate: function() {
    this.ticksTotal++;
    var tsDiff = new Date().getTime() - this.timestampStart;
    this.totalUpdateTime += tsDiff;
    this.currentTime = tsDiff;
    this.averageTime = Math.round(this.totalUpdateTime / this.ticksTotal);
  }
});
