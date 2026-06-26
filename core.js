/**
 * Workaround for IE9 local storage :V
 *
 * This fix is intended for IE in general and especially for IE9,
 * where localStorage is defined as system variable.
 *
 */

window.LCstorage = window.localStorage;
if (document.all && !window.localStorage) {
    window.LCstorage = {};
    window.LCstorage.removeItem = function () { };
}

dojo.declare("com.nuclearunicorn.core.Control", null, {
	//Base control class. Must be a superclass for all game components.
});

/**
 * core.js - a collection of base classes shared among all components of the game.
 * UI controls go there.
 * 
 * This should be your starting point to get familiar with the KG codebase. It has the most comments and explanation on some of KG's idiosincracies.
 * The next file to check is `game.js`
 */


/**
 * A base class for every tab manager component like science, village, bld, etc
 * Ideally every manager should be a subclass of a TabManager. See reference implementation in religion.js
 */
dojo.declare("com.nuclearunicorn.core.TabManager", com.nuclearunicorn.core.Control, {

	/**
	 * This may not be obvious, but all objects instantiated there will be STATIC and shared among all the instances of the class.
	 *
	 * Wrong:
	 *
	 * >>  arrayField: []
	 *
	 * Correct:
	 *
	 * >>  arrayField: null,
	 * >>
	 * >>  constructor: function() { this.arrayField = []; }
	 */
	effectsCachedExisting: null,
	meta: null,
	panelData: null,

	/**
	 * Constructors are INHERITED automatically and CHAINED in the class hierarchy
	 */
	constructor: function(){
		this.effectsCachedExisting = {};
		this.meta = [];
		this.panelData = {};
	},

	/**
	 * Methods however are NOT. Use this.inherited(arguments) to call a base method;
	 */

	registerPanel: function(id, panel){
		if (!this.panelData[id]){
			this.panelData[id] = {
				collapsed: panel.collapsed
			};
		}
		panel.collapsed = this.panelData[id].collapsed;
		dojo.connect(panel, "onToggle", this, function(collapsed){
			this.panelData[id].collapsed = collapsed;
		});
	},

	 /**
	 * @param meta	- metadata set (e.g. buildings list, upgrades list, etc)
	 * @param provider - any object having getEffect(metaElem, effectName) method
	 */
	registerMeta: function(type, meta, provider){
		if (!type) {
			this.meta.push({meta: meta, provider: provider});
		} else if (type == "research") {
			this.meta.push({
				meta: meta,
				provider: { getEffect : function(item, effect){
					return (item.researched && item.effects) ? item.effects[effect] : 0;
				}}
			});
		} else if (type == "stackable") {
			this.meta.push({
				meta: meta,
				provider: { getEffect : function(item, effect){
					return (item.effects) ? item.effects[effect] * item.on : 0;
				}}
			});
		}
	},

	/*
		TODO: do we need this? can this be simplified?
	*/
	setEffectsCachedExisting: function() {
		// Set effectsCachedExisting based on meta
		for (var a = 0; a < this.meta.length; a++){
			if (this.meta[a].meta){
				for (var i = 0; i < this.meta[a].meta.length; i++){
					for (var effect in this.meta[a].meta[i].effects) {
						this.effectsCachedExisting[effect] = 0;
					}
				}
			}
		}
		// Set effectsCachedExisting based on effectsBase
		if (typeof(this.effectsBase) == "object") {
			for (var effect in this.effectsBase) {
				this.effectsCachedExisting[effect] = 0;
			}
		}
	},

	updateEffectCached: function() {
		var effectsBase = this.effectsBase;
		if (effectsBase){
			effectsBase = this.game.resPool.addBarnWarehouseRatio(effectsBase);
		}

		for (var i = 0; i < this.meta.length; i++){
			this.updateMetaEffectCached(this.meta[i]);
		}

		for (var name in this.effectsCachedExisting) {
			// Add effect from meta
			var effect = 0;
			for (var i = 0; i < this.meta.length; i++){
				effect += this.getMetaEffect(name, this.meta[i]);
			}

			// Previously, catnip demand (or other buildings that both affect the same resource)
			// could have theoretically had more than 100% reduction because they diminished separately,
			// this takes the total effect and diminishes it as a whole.
			if (this._hasLimitedDiminishingReturn(name) && effect !== 0) {
				effect = this.game.getLimitedDR(effect, 1);
			}

			// Add effect from effectsBase
			if (effectsBase && effectsBase[name]) {
				effect += effectsBase[name];
			}

			// Add effect in globalEffectsCached, in addition of other managers
			this.game.globalEffectsCached[name] = typeof(this.game.globalEffectsCached[name]) == "number" ? this.game.globalEffectsCached[name] + effect : effect;
		}
	},

	updateMetaEffectCached: function (metadata) {
		for (var i = 0; i < metadata.meta.length; i++){
			var meta = metadata.meta[i];
			meta.totalEffectsCached = {};
			for (var effectName in this.effectsCachedExisting){
				var effect;
				if (metadata.provider){
					effect = metadata.provider.getEffect(meta, effectName) || 0;
				} else {
					effect = meta.effects[effectName] || 0;
				}
				meta.totalEffectsCached[effectName] = effect;
			}
		}
	},

	_hasLimitedDiminishingReturn: function(name) {
		return name == "catnipDemandRatio"
		    || name == "fursDemandRatio"
		    || name == "ivoryDemandRatio"
		    || name == "spiceDemandRatio"
		    || name == "unhappinessRatio";
	},

	/**
	 * Returns a cached combined value of effect of all managers, for effect existing in the manager
	 * Will calculate effect value of the manager if the value of effect of all managers is not yet implemented (launch of the game)
	 */
	 /*
	getEffect: function(name){
		// Search only if effect exists in the manager
		if (typeof(this.effectsCachedExisting[name]) == "undefined"){
			return 0;
		}
		// Search only if effect is not yet in the globalEffectsCached
		var cached = this.game.globalEffectsCached[name];
		if (cached != undefined) {
			return cached;
		}

		// Search
		var effect = 0;
		for (var i = 0; i< this.meta.length; i++){
			var effectMeta = this.getMetaEffect(name, this.meta[i]);
			effect += effectMeta;
		}
		return effect;
	},
*/
	/**
	 * Returns an effect from a generic array of effects like gamePage.bld.buildingsData
	 * Replacement for getEffect() method
	 */
	getMetaEffect: function(name, metadata){
		var totalEffect = 0;
		if (!metadata.meta){
			return 0;
		}
		for (var i = 0; i < metadata.meta.length; i++){
			var meta = metadata.meta[i];
			//
			// This is an ugly hack for managers like workshop or science
			// Ideally just a getter handler should be called there returning correct value
			//

			var effect = 0;
			if (meta.totalEffectsCached){
				effect = meta.totalEffectsCached[name] || 0;
			}
			totalEffect += effect;
		}

		return totalEffect || 0;
	},

	getMeta: function(name, metadata){
		for (var i = 0; i < metadata.length; i++){
			var meta = metadata[i];

			if (meta.name == name){
				return meta;
			}
		}
		console.error("Could not find metadata for ", name, "in", metadata);
	},

	loadMetadata: function(meta, saveMeta, metaId){
		if (!saveMeta){
			console.trace();
			console.warn("Unable to load metadata table '" + metaId + "', save record is empty");
			return;
		}

		for(var i = 0; i < saveMeta.length; i++){
			var savedMetaElem = saveMeta[i];

			if (savedMetaElem != null){
				var elem = this.getMeta(savedMetaElem.name, meta);

				if (!elem) { continue; }

				for (var fld in savedMetaElem){
					if (fld == name) {
						continue;
					}
					if (!elem.hasOwnProperty(fld)){
						console.warn("Can't find elem." + fld + " in", elem);
					}
					if (savedMetaElem[fld] !== undefined) {
						if (savedMetaElem[fld] != null && typeof(savedMetaElem[fld]) == "object") {
							this.loadMetadata(elem[fld], savedMetaElem[fld]);
						} else {
							elem[fld] = savedMetaElem[fld];
						}
					}
				}
			}

		}
	},

	filterMetadata: function(meta, fields){
		var filtered = [];
		for(var i = 0; i < meta.length; i++){
			var clone = {};

			for (var j = 0; j < fields.length; j++){
				var fld = fields[j];
				/*if (!meta[i].hasOwnProperty(fld)){
					console.warn("Can't find elem." + fld + " in", meta[i]);
				}*/
				clone[fld] = meta[i][fld];
			}
			filtered.push(clone);
		}
		return filtered;
	},

	//TODO: add saveMetadata

	/**
	 * TODO: this logic is very confusing. Ideally the only place devs need to change should be building metadata.
	 */
	resetStateStackable: function(bld) {
		bld.val = 0;
		bld.on = 0;
		if (bld.noStackable == "undefined") {
			bld.noStackable = false;
		}
		if (bld.isAutomationEnabled != undefined) {
			bld.isAutomationEnabled = null;
		}

		// Automatic settings of togglable

		if (bld.lackResConvert != undefined) {
			// Exceptions (when convertion is caused by an upgrade)
			bld.togglable = true;
		}

		for (var effect in bld.effects) {
			if (effect == "energyConsumption" || effect == "magnetoRatio" || effect == "productionRatio") {
				// Exceptions (when energyConsumption is caused by an upgrade)
				bld.togglable = (bld.name == "oilWell" || bld.name == "biolab" || bld.name == "chronosphere" || bld.name == "aiCore") ? false : true;
			}
		}
	},

	resetStateResearch: function() {
		//TODO
	}
});

