dojo.declare("com.nuclearunicorn.game.log.Console", null, {
	static: {

		filters: {
			"astronomicalEvent": {
				title: $I("console.filter.astronomicalEvent"),
				enabled: true,
				unlocked: false
			},
			"hunt": {
				title: $I("console.filter.hunt"),
				enabled: true,
				unlocked: false
			},
			"trade": {
				title: $I("console.filter.trade"),
				enabled: true,
				unlocked: false
			},
			"craft": {
				title: $I("console.filter.craft"),
				enabled: true,
				unlocked: false
			},
			"workshopAutomation": {
				title: $I("console.filter.workshopAutomation"),
				enabled: true,
				unlocked: false
			},
			"meteor": {
				title: $I("console.filter.meteor"),
				enabled: true,
				unlocked: false
			},
			"ivoryMeteor": {
				title: $I("console.filter.ivoryMeteor"),
				enabled: true,
				unlocked: false
			},
			"unicornRift": {
				title: $I("console.filter.unicornRift"),
				enabled: true,
				unlocked: false
			},
			"unicornSacrifice": {
				title: $I("console.filter.unicornSacrifice"),
				enabled: true,
				unlocked: false
			},
			"alicornRift": {
				title: $I("console.filter.alicornRift"),
				enabled: true,
				unlocked: false
			},
			"alicornSacrifice": {
				title: $I("console.filter.alicornSacrifice"),
				enabled: true,
				unlocked: false
			},
			"alicornCorruption":{
				title: $I("console.filter.alicornCorruption"),
				enabled: true,
				unlocked: false
			},
			"tcShatter": {
				title: $I("console.filter.tcShatter"),
				enabled: true,
				unlocked: false
			},
			"tcRefine": {
				title: $I("console.filter.tcRefine"),
				enabled: true,
				unlocked: false
			},
			"faith": {
				title: $I("console.filter.faith"),
				enabled: true,
				unlocked: false
			},
			"elders": {
				title: $I("console.filter.elders"),
				enabled: true,
				unlocked: false
			},
			"blackcoin": {
				title: $I("console.filter.blackcoin"),
				enabled: true,
				unlocked: false
			}
		}
	},

	messages: null,
	maxMessages: 40,
	messageIdCounter: 0,
	ui: null,
	game: null,

	constructor: function(game) {
		this.game = game;
		this.messages = [];
		this.filters = dojo.clone(this.static.filters);
	},

	/**
	 * Prints message in the console. Returns a DOM node for the last created message
	 */
	msg : function(message, type, tag, noBullet) {
		 if (tag && this.filters[tag]){
            var filter = this.filters[tag];

            if (!filter.unlocked){
                filter.unlocked = true;
                this.ui.renderFilters();
            } else if (!filter.enabled){
                return;
            }
        }

		var hasCalendarTech = this.game.science.get("calendar").researched;

		var logmsg = {
			text: message,
			type: type,
			tag: tag,
			noBullet: noBullet,
			id: "consoleMessage_" + (this.messageIdCounter++),
			hasCalendarTech: hasCalendarTech,
			year: hasCalendarTech ? this.game.calendar.year.toLocaleString() : null,
			seasonTitle: hasCalendarTech ? this.game.calendar.getCurSeasonTitle() : null,
			seasonTitleShorten: hasCalendarTech ? this.game.calendar.getCurSeasonTitleShorten() : null

		};
		this.messages.push(logmsg);


		if (this.messages.length > this.maxMessages){
			this.messages.shift();
		}

		this.ui.renderConsoleLog();

		this.ui.notifyLogEvent(logmsg);

		return logmsg;
	},

	clear: function(){
		this.messages = [];
		this.ui.renderConsoleLog();
	},



	resetState: function (){
		for (var fId in this.filters){
			var filter = this.filters[fId];
			filter.unlocked = filter.defaultUnlocked || false;
			filter.enabled = true;
		}
		//TODO: find usage and call ui.renderFilters
		this.ui.renderFilters();
	},

	save: function(saveData){
		var saveFilters = {};
		for (var fId in this.filters) {
			var filter = this.filters[fId];
			saveFilters[fId] = {unlocked: filter.unlocked, enabled: filter.enabled};
		}

		saveData.console = {
			filters: saveFilters
		};
	},

	load: function(saveData){
		if (saveData.console && saveData.console.filters){
			for (var fId in saveData.console.filters){
				var savedFilter = saveData.console.filters[fId];

				if (this.filters[fId]) {
					this.filters[fId].unlocked = savedFilter.unlocked;
					this.filters[fId].enabled = savedFilter.enabled;
				}
			}
		}
	}
});
