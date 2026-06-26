/**
 * Undo Change state. Represents a change in one or multiple managers.
 * dojo.declare registers this globally as classes.game.UndoChange.
 */
dojo.declare("classes.game.UndoChange", null, {
  _static: { DEFAULT_TTL: 20 },
  ttl: 0,
  events: null,

  constructor: function(ttl) {
    this.ttl = ttl || this._static.DEFAULT_TTL;
    this.events = [];
  },

  addEvent: function(type, item) {
    this.events.push({ type, item });
  },

  commit: function() {
    /* no-op in the base class */
  },

  rollback: function() {
    for (var i = 0; i < this.events.length; i++) {
      var evt = this.events[i];
      // Default rollback dispatches to the item itself
      if (evt.item && evt.item.rollbackEvent) {
        evt.item.rollbackEvent(evt);
      }
    }
  },

  expired: function() { return this.ttl <= 0; },

  decrementTTL: function() { this.ttl--; }
});
