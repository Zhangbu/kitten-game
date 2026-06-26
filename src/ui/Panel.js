dojo.declare("com.nuclearunicorn.game.ui.Spacer", null, {

	title: "",

	constructor: function(title){
		this.title = title;
	},

	render: function(container){
		dojo.create("div", { innerHTML: this.title, className: "spacer"}, container);
	},

	update: function(){
	}
});


dojo.declare("com.nuclearunicorn.game.ui.ContentRowRenderer", null, {
	twoRows: false,	//by default every tab/panel has one row only

	leftRow: null,
	rightRow: null,

	initRenderer: function(content){
		this.content = content;

		if (this.twoRows){
			var table = dojo.create("table", {
				cellpadding: "0",
				cellspacing: "0",
				style: { width: "100%"}
			}, content);
			var tr = dojo.create("tr", {}, table);
			this.leftRow  = dojo.create("td", {style:{verticalAlign: "top"}}, tr);
			this.rightRow = dojo.create("td", {style:{verticalAlign: "top"}}, tr);
		}
	},

	/**
	 * Get a DOM Node container for an array element with a given index, starting with 0
	 */
	getElementContainer: function(id){
		if (!this.twoRows){
			return this.content;
		}

		if (id % 2 == 0){
			return this.leftRow;
		} else {
			return this.rightRow;
		}
	}
});

dojo.declare("mixin.IGameAware", null, {
	game: null,

	setGame: function(game){
		this.game = game;
	}
});

dojo.declare("mixin.IChildrenAware", null, {
	children: null,

	constructor: function(){
		this.children = [];
	},

	addChild: function (child) {
		if (!child) {
			throw "Child can't be null";
		}
		this.children.push(child);
	},

	render: function(container){
		dojo.forEach(this.children, function(e, i){
			e.render(container);
		});
	},

	update: function(){
		dojo.forEach(this.children, function(e, i){ e.update(); });
	}
});
/**
 * Collapsible panel for a tab
 */
dojo.declare("com.nuclearunicorn.game.ui.Panel", [com.nuclearunicorn.game.ui.ContentRowRenderer, mixin.IChildrenAware], {
	game: null,

	collapsed: false,
	visible: true,
	name: "",

	panelDiv: null,


	//------ collapse ------
	toggle: null,
	contentDiv: null,

	constructor: function(name, tabManager){
		this.name = name;
		if (tabManager){
			tabManager.registerPanel(name, this);
		}
	},

	render: function(container){
		var panel = dojo.create("div", {
			className: "panelContainer",
			style: {
				display: this.visible ? "" : "none"
			}
		},
		container);

		this.toggle = dojo.create("div", {
			innerHTML: this.collapsed ? "+" : "-",
			tabIndex: 0,
			className: "toggle" + (this.collapsed ? " collapsed" : ""),
			style: {
				float: "right"
			}
		}, panel);

		this.title = dojo.create("div", {
			innerHTML: this.name,
			className: "title"
		}, panel);

		this.contentDiv = dojo.create("div", {
			className: "container",
			style: {
				display: this.collapsed ? "none" : ""
			}
		}, panel);

		dojo.connect(this.toggle, "onclick", this, function(){
			this.collapse(!this.collapsed);
		});
		dojo.connect(this.toggle, "onkeypress", this, "onKeyPress");

		this.panelDiv = panel;

		/*
		 *	Render all children, probably not a best thing from architectual point of view
		 */
		this.inherited(arguments, [this.contentDiv] /* dojo majic */);

		return this.contentDiv;
	},


	onKeyPress: function(event){
		if (event.key == "Enter"){
			this.collapse(!this.collapsed);
		}
	},

	collapse: function(isCollapsed){
		this.collapsed = isCollapsed;

		$(this.contentDiv).toggle(!isCollapsed);
		this.toggle.innerHTML = isCollapsed ? "+" : "-";

		this.onToggle(isCollapsed);
		var hasClassCollapsed = dojo.hasClass(this.toggle, "collapsed");
		if (isCollapsed && !hasClassCollapsed){
			dojo.addClass(this.toggle, "collapsed");			
		} else if (!isCollapsed && hasClassCollapsed) {
			dojo.removeClass(this.toggle, "collapsed");			
		}
	},

	onToggle: function(isCollapsed){
		//subscribe me!
	},

	setVisible: function(visible){
		this.visible = visible;
		if (this.panelDiv){
			$(this.panelDiv).toggle(visible);
		}
	},

	update: function(){
		this.inherited(arguments);
	},

	setGame: function(game){
		this.game = game;
	}
});

/**
 * Tab
*/
dojo.declare("com.nuclearunicorn.game.ui.tab", [com.nuclearunicorn.game.ui.ContentRowRenderer, mixin.IChildrenAware], {

	game: 		null,
	buttons: 	null,

	tabId: 		null,
	tabName: 	null,
	domNode:  null,
	visible: 	true,

	constructor: function(opts, game){
		this.tabName = opts.name;
		this.tabId = opts.id;
		this.buttons = [];

		this.game = game;
	},

	render: function(tabContainer){
		this.inherited(arguments);
		this.initRenderer(tabContainer);
	},

	update: function(){
		this.inherited(arguments);

		/*--------------------------
		Todo: this stuff is really deprecated, move it to the BLDv2 tab?
		---------------------------*/
		for (var i = 0; i < this.buttons.length; i++){
			var button = this.buttons[i];
			button.update();
		}
	},

	updateTab: function(){
	},

	/*--------------------------
	 This stuff is deprecated to
	 ---------------------------*/
	addButton:function(button){
		button.game = this.game;
		button.tab = this;
		this.buttons.push(button);
	}
});

/**
 * TODO: return offset from a htmlProvider.
 * Ideally it should be some structure like
 * {
 * 	x,
 * 	y,
 * 	html
 * }
 */
UIUtils = {
	attachTooltip: function(game, container, topPosition, leftPosition, htmlProvider) {
		var gameNode = dojo.byId("game");
		var tooltip = dojo.byId("tooltip");

		dojo.connect(container, "onmouseover", this, function() {
			game.tooltipUpdateFunc = function(){
				tooltip.innerHTML = dojo.hitch(game, htmlProvider)();
			};
			game.tooltipUpdateFunc();

			var pos = $(container).offset();

			// Compensate tooltip position for game container offset.
			var posGame = $(gameNode).offset();
			pos.top -= posGame.top;
			pos.left -= posGame.left;

			pos.top += topPosition;
			pos.left += leftPosition;

			// Prevent tooltip from leaving the window area
			// The 25 here is an arbitrary padding, so that the tooltip doesn't sit right on the window edge.
			var maxTooltipTop = $(window).scrollTop() + $(window).height() - $(tooltip).outerHeight() - 25;
			var maxTooltipLeft = $(window).scrollLeft() + $(window).width() - $(tooltip).outerWidth() - 25;

			// Keep position inside expected bounds.
			pos.top = Math.min(pos.top, maxTooltipTop);
			pos.left = Math.min(pos.left, maxTooltipLeft);

			dojo.style(tooltip, "top", pos.top + "px");
			dojo.style(tooltip, "left", pos.left + "px");

			if (tooltip.innerHTML) {
				dojo.style(tooltip, "display", "");
			}
		});

		dojo.connect(container, "onmouseout", this, function(){
			game.tooltipUpdateFunc = null;
			dojo.style(tooltip, "display", "none");
		});

		return htmlProvider;
	}
};

