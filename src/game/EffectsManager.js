dojo.declare("com.nuclearunicorn.game.EffectsManager", null, {
	game: null,

	constructor: function(game){
		this.game = game;
	},

	effectMeta: function(effectName) {
		var game = this.game;
		for (var i = 0; i < game.resPool.resources.length; i++) {
			var res = game.resPool.resources[i];
			if (effectName.indexOf(res.name) == 0) {
				var resname = res.name;
				var restitle = res.title || resname;
				restitle = restitle.charAt(0).toUpperCase() + restitle.substring(1, restitle.length);
				var type = effectName.substring(resname.length, effectName.length);
				break;
			}
		}

		switch (true){
			/* Worker pseudoeffect */
			case type == "":
				return {
					//title to be displayed for effect, id if not defined
					title: restitle,
					//effect will be hidden if resource is not unlocked
					resName: resname,
					//value will be affected by opts.usePerSecondValues
					type: "perTick"
				};
			case type == "PerTick":
				return {
					title: restitle,
					resName: resname,
					type: "perTick"
				};
			case type == "PerTickRatio":
				return {
					title: $I("effectsMgr.type.resRatio", [restitle]),
					resName: resname,
					type: "ratio"
				};
			case type == "Max":
				return {
					title: $I("effectsMgr.type.resMax", [restitle]),
					resName: resname
				};
			case type == "MaxChallenge": //for when challenges change Max of resources; LDR to all other sources of Max
				return {
					title: $I("effectsMgr.type.resMax", [restitle]),
					resName: resname
				};
			case type == "Ratio":
				return {
					title: $I("effectsMgr.type.resRatio", [restitle]),
					resName: resname,
					type: "ratio"
				};
			case type == "DemandRatio":
				return {
					title: $I("effectsMgr.type.resDemandRatio", [restitle]),
					resName: resname,
					type: "ratio"
				};
			case (type == "PerTickBase" || type == "PerTickBaseSpace"):
				return {
					title: $I("effectsMgr.type.resProduction", [restitle]),
					resName: resname,
					type: "perTick"
				};
			case (type == "PerTickCon" || type == "PerTickAutoprod" || type == "PerTickProd" || type == "PerTickSpace" || type == "PerTickAutoprodSpace"):
				return {
					title: $I("effectsMgr.type.resConversion", [restitle]),
					resName: resname,
					type: "perTick"
				};
			case type == "CraftRatio":
				return {
					title: $I("effectsMgr.type.resCraftRatio", [restitle]),
					resName: resname,
					type: "ratio"
				};
			case type == "GlobalCraftRatio":
				return {
					title: $I("effectsMgr.type.resGlobalCraftRatio", [restitle]),
					resName: resname,
					type: "ratio"
				};
			default:
				return 0;
		}
	},

	statics: {
		effectMeta: {
			// Specials meta of resources
			"catnipJobRatio" : {
				title: $I("effectsMgr.statics.catnipJobRatio.title"),
				resName: "catnip",
				type: "ratio"
			},

			"catnipDemandWorkerRatioGlobal": {
				title: $I("effectsMgr.statics.catnipDemandWorkerRatioGlobal.title"),
				resName: "catnip",
				type: "ratio"
			},

			"woodJobRatio" : {
				title: $I("effectsMgr.statics.woodJobRatio.title"),
				resName: "wood",
				type: "ratio"
			},

			"manpowerJobRatio" : {
				title: $I("effectsMgr.statics.manpowerJobRatio.title"),
				resName: "manpower",
				type: "ratio"
			},

			"coalRatioGlobal" : {
				title: $I("effectsMgr.statics.coalRatioGlobal.title"),
				resName: "coal",
				type: "ratio",
				calculation: "nonProportional"
			},

			"coalRatioGlobalReduction" : {
				title: $I("effectsMgr.statics.coalRatioGlobalReduction.title"),
				resName: "coal",
				type: "ratio"
			},

			"oilReductionRatio" : {
				title: $I("effectsMgr.statics.oilReductionRatio.title"),
				type: "ratio"
			},

			//kittens

			"maxKittens" : {
				title: $I("effectsMgr.statics.maxKittens.title")
			},

			"maxKittensRatio" : {
				title: $I("effectsMgr.statics.maxKittensRatio.title"),
				type: "ratio"
			},

			"simScalingRatio" : {
				title: $I("effectsMgr.statics.simScalingRatio.title"),
				type: "ratio"
			},

			"antimatterProduction": {
				title: $I("effectsMgr.statics.antimatterProduction.title"),
				type: "perYear"
			},

			"temporalFluxProduction": {
				title: $I("effectsMgr.statics.temporalFluxProduction.title"),
				type: "perYear"
			},

			"temporalFluxProductionChronosphere": {
				title: $I("effectsMgr.statics.temporalFluxProductionChronosphere.title"),
				type: "perYear"
			},

			// Miscellaneous

			"observatoryRatio" : {
                title: $I("effectsMgr.statics.observatoryRatio.title"),
                type: "ratio"
            },

			"magnetoBoostRatio" : {
				title: $I("effectsMgr.statics.magnetoBoostRatio.title"),
				resName: "oil",				//this is sort of hack to prevent early spoiler on magnetos
				type: "ratio"
			},

			"skillXP" : {
				title: $I("effectsMgr.statics.skillXP.title"),
				type: "perTick"
			},

			"refineRatio": {
				title: $I("effectsMgr.statics.refineRatio.title"),
				type: "ratio"
			},

			"craftRatio": {
				title: $I("effectsMgr.statics.craftRatio.title"),
				type: "ratio"
			},

			"happiness": {
				title: $I("effectsMgr.statics.happiness.title")
			},

			"unhappinessRatio": {
				title: $I("effectsMgr.statics.unhappinessRatio.title"),
				type: "ratio"
			},

			"tradeRatio": {
				title: $I("effectsMgr.statics.tradeRatio.title"),
				type: "ratio"
			},

			"standingRatio": {
				title: $I("effectsMgr.statics.standingRatio.title"),
				type: "ratio"
			},

			"resStasisRatio": {
				title: $I("effectsMgr.statics.resStasisRatio.title"),
				type: "ratio"
			},

			"beaconRelicsPerDay": {
				title: $I("effectsMgr.statics.beaconRelicsPerDay.title"),
				type: "perDay"
			},

			"relicPerDay": {
				title: $I("effectsMgr.statics.relicPerDay.title"),
				type: "perDay"
			},

			"routeSpeed": {
				title: $I("effectsMgr.statics.routeSpeed.title"),
				type: "fixed"
			},

			"festivalRatio":{
				title: $I("effectsMgr.statics.festivalRatio.title"),
				type: "ratio"
			},

			"festivalArrivalRatio":{
				title: $I("effectsMgr.statics.festivalArrivalRatio.title"),
				type: "ratio"
			},

			// energy

			"energyProduction": {
				title: $I("effectsMgr.statics.energyProduction.title"),
				type: "energy"
			},
			"energyConsumption": {
				title: $I("effectsMgr.statics.energyConsumption.title"),
				type: "energy",
				calculation: "nonProportional"
            },

			"energyProductionRatio": {
				title: $I("effectsMgr.statics.energyProductionRatio.title"),
				type: "ratio"
			},
			"energyConsumptionRatio": {
				title: $I("effectsMgr.statics.energyConsumptionRatio.title"),
				type: "ratio"
			},
			"energyConsumptionIncrease": {
				title: $I("effectsMgr.statics.energyConsumptionIncrease.title"),
				type: "ratio"
            },

			//production

            "productionRatio" : {
                title: $I("effectsMgr.statics.productionRatio.title"),
                type: "ratio"
            },

            "magnetoRatio" : {
                title: $I("effectsMgr.statics.magnetoRatio.title"),
                type: "ratio"
            },

            "spaceRatio" : {
				title: $I("effectsMgr.statics.spaceRatio.title"),
				type: "ratio"
			},

			"prodTransferBonus": {
				title: $I("effectsMgr.statics.prodTransferBonus.title"),
				type: "ratio"
			},

            //starEvent

            "starEventChance" : {
                title: $I("effectsMgr.statics.starEventChance.title"),
                type: "ratio"
            },

            "starAutoSuccessChance" : {
                title: $I("effectsMgr.statics.starAutoSuccessChance.title"),
                type: "ratio"
            },

            //in the tab workshop
            "lumberMillRatio" : {
                title: $I("effectsMgr.statics.lumberMillRatio.title"),
                type: "ratio"
            },

            "barnRatio" : {
                title: $I("effectsMgr.statics.barnRatio.title"),
                type: "ratio"
            },

            "warehouseRatio" : {
                title: $I("effectsMgr.statics.warehouseRatio.title"),
                type: "ratio"
            },

            "acceleratorRatio" : {
                title: $I("effectsMgr.statics.acceleratorRatio.title"),
                type: "ratio"
            },

            "harborRatio" : {
                title: $I("effectsMgr.statics.harborRatio.title"),
                type: "ratio"
            },

            "harborCoalRatio" : {
                title: $I("effectsMgr.statics.harborCoalRatio.title"),
                type: "ratio"
            },

            "catnipMaxRatio" : {
                title: $I("effectsMgr.statics.catnipMaxRatio.title"),
				type: "ratio",
				resName:"catnip"
            },

            "hunterRatio" : {
                title: $I("effectsMgr.statics.hunterRatio.title"),
                type: "ratio"
            },

            "solarFarmRatio" : {
                title: $I("effectsMgr.statics.solarFarmRatio.title"),
                type: "ratio"
            },

            "shipLimit" : {
                title: $I("effectsMgr.statics.shipLimit.title"),
                type: "ratio"
            },

            "hutPriceRatio" : {
                title: $I("effectsMgr.statics.hutPriceRatio.title"),
                type: "ratio"
            },

            "coalSuperRatio" : {
                title: $I("effectsMgr.statics.coalSuperRatio.title"),
                type: "ratio"
            },

            "smelterRatio" : {
                title: $I("effectsMgr.statics.smelterRatio.title"),
                type: "ratio"
            },

            "calcinerRatio" : {
                title: $I("effectsMgr.statics.calcinerRatio.title"),
                type: "ratio"
            },

            "calcinerSteelRatio" : {
                title: $I("effectsMgr.statics.calcinerSteelRatio.title"),
                type: "ratio"
            },

            "calcinerSteelCraftRatio" : {
                title: $I("effectsMgr.statics.calcinerSteelCraftRatio.title"),
                type: "ratio"
            },

            "calcinerSteelReactorBonus" : {
                title: $I("effectsMgr.statics.calcinerSteelReactorBonus.title"),
                type: "ratio"
            },

            "libraryRatio" : {
                title: $I("effectsMgr.statics.libraryRatio.title"),
                type: "ratio"
            },

            "hydroPlantRatio" : {
                title: $I("effectsMgr.statics.hydroPlantRatio.title"),
                type: "ratio"
            },

            "spaceScienceRatio" : {
                title: $I("effectsMgr.statics.spaceScienceRatio.title"),
                type: "ratio"
            },

            "oilWellRatio" : {
                title: $I("effectsMgr.statics.oilWellRatio.title"),
                type: "ratio"
            },

            "unicornsGlobalRatio" : {
                title: $I("effectsMgr.statics.unicornsGlobalRatio.title"),
                type: "ratio"
            },

            "biofuelRatio" : {
                title: $I("effectsMgr.statics.biofuelRatio.title"),
                type: "ratio"
            },

            "cadBlueprintCraftRatio" : {
                title: $I("effectsMgr.statics.cadBlueprintCraftRatio.title"),
                type: "ratio"
            },

            "skillMultiplier" : {
                title: $I("effectsMgr.statics.skillMultiplier.title"),
                type: "ratio"
            },

            "masterSkillMultiplier" : {
                title: $I("effectsMgr.statics.masterSkillMultiplier.title"),
                type: "ratio"
            },

            "uraniumRatio" : {
                title: $I("effectsMgr.statics.uraniumRatio.title"),
                type: "ratio"
            },

            "reactorEnergyRatio" : {
                title: $I("effectsMgr.statics.reactorEnergyRatio.title"),
                type: "ratio"
            },

			"reactorThoriumPerTick" : {
                title: $I("effectsMgr.statics.reactorThoriumPerTick.title"),
                type: "perTick"
            },

            "starchartGlobalRatio" : {
                title: $I("effectsMgr.statics.starchartGlobalRatio.title"),
                type: "ratio"
            },

            "satnavRatio" : {
                title: $I("effectsMgr.statics.satnavRatio.title"),
                type: "ratio"
            },

            "broadcastTowerRatio" : {
                title: $I("effectsMgr.statics.broadcastTowerRatio.title"),
                type: "ratio"
            },

            "cultureMaxRatio" : {
                title: $I("effectsMgr.statics.cultureMaxRatio.title"),
                type: "ratio"
            },

            "lunarOutpostRatio" : {
                title: $I("effectsMgr.statics.lunarOutpostRatio.title"),
                type: "ratio"
            },

            "crackerRatio" : {
                title: $I("effectsMgr.statics.crackerRatio.title"),
                type: "ratio"
            },

            "factoryRefineRatio" : {
                title: $I("effectsMgr.statics.factoryRefineRatio.title"),
                type: "ratio"
            },

            "timeRatio" :  {
                title: $I("effectsMgr.statics.timeRatio.title"),
                type: "ratio"
            },

            "temporalParadoxVoid" :  {
                title: $I("effectsMgr.statics.temporalParadoxVoid.title"),
                type: "perDay"
            },

            "temporalParadoxDay" :  {
                title: $I("effectsMgr.statics.temporalParadoxDay.title"),
                type: "fixed"
            },

            "temporalParadoxDayBonus" :  {
                title: $I("effectsMgr.statics.temporalParadoxDayBonus.title"),
                type: "fixed"
            },

			"unicornsRatioReligion" :  {
                title: $I("effectsMgr.statics.unicornsRatioReligion.title"),
                type: "ratio"
            },

			"riftChance" :  {
                title: $I("effectsMgr.statics.riftChance.title"),
                type: "ratio"
            },

			"ivoryMeteorChance" :  {
                title: $I("effectsMgr.statics.ivoryMeteorChance.title"),
                type: "ratio"
            },

            "ivoryMeteorRatio" :  {
                title: $I("effectsMgr.statics.ivoryMeteorRatio.title"),
                type: "ratio"
            },

            "goldMaxRatio" :  {
                title: $I("effectsMgr.statics.goldMaxRatio.title"),
                type: "ratio"
            },

			"alicornChance" :  {
                title: $I("effectsMgr.statics.alicornChance.title"),
                type: "ratio"
            },

			"tcRefineRatio" :  {
                title: $I("effectsMgr.statics.tcRefineRatio.title"),
                type: "ratio"
            },

			"corruptionRatio" :  {
                title: $I("effectsMgr.statics.corruptionRatio.title"),
                type: "ratio"
            },

			"cultureMaxRatioBonus" :  {
                title: $I("effectsMgr.statics.cultureMaxRatioBonus.title"),
                type: "ratio"
            },

			"faithRatioReligion" :  {
                title: $I("effectsMgr.statics.faithRatioReligion.title"),
                type: "ratio"
            },

            "solarRevolutionLimit" : {
                title: $I("effectsMgr.statics.solarRevolutionLimit.title"),
                type: "ratio"
            },

            "solarRevolutionRatio" : {
                title: $I("effectsMgr.statics.solarRevolutionRatio.title"),
                type: "ratio"
            },

            "faithSolarRevolutionBoost" : {
                title: $I("effectsMgr.statics.faithSolarRevolutionBoost.title"),
                type: "ratio"
            },

			"relicRefineRatio" :  {
                title: $I("effectsMgr.statics.relicRefineRatio.title"),
                type: "ratio"
            },

			"blsLimit" :  {
                title: $I("effectsMgr.statics.blsLimit.title"),
                type: "integerRatio"
            },

			"globalResourceRatio" :  {
                title: $I("effectsMgr.statics.globalResourceRatio.title"),
                type: "ratio"
            },

            "timeImpedance" :  {
                title: $I("effectsMgr.statics.timeImpedance.title"),
                type: "fixed"
            },

            "shatterTCGain" :  {
                title: $I("effectsMgr.statics.shatterTCGain.title"),
                type: "ratio"
            },

            "rrRatio" :  {
                title: $I("effectsMgr.statics.rrRatio.title"),
                type: "ratio"
            },

            "shatterYearBoost":{
                title: $I("effectsMgr.statics.shatterYearBoost.title")
            },

			"priceRatio" :  {
                title: $I("effectsMgr.statics.priceRatio.title"),
                type: "ratio"
            },

			"kittenGrowthRatio" :  {
                title: $I("effectsMgr.statics.kittenGrowthRatio.title"),
                type: "ratio"
            },

			"t1CraftRatio" :  {
                title: $I("effectsMgr.statics.t1CraftRatio.title"),
                type: "fixed"
            },

			"t2CraftRatio" :  {
                title: $I("effectsMgr.statics.t2CraftRatio.title"),
                type: "fixed"
            },

			"t3CraftRatio" :  {
                title: $I("effectsMgr.statics.t3CraftRatio.title"),
                type: "fixed"
            },

			"t4CraftRatio" :  {
                title: $I("effectsMgr.statics.t4CraftRatio.title"),
                type: "fixed"
            },

			"t5CraftRatio" :  {
                title: $I("effectsMgr.statics.t5CraftRatio.title"),
                type: "fixed"
            },
			"queueCap": {
                title: $I("effectsMgr.statics.queueCap"),
                type: "fixed"
			},
			//Spaceports
			"moonBaseStorageBonus": {
				title: $I( "effectsMgr.statics.moonBaseStorageBonus.title" ),
				type: "ratio"
			},
			"planetCrackerStorageBonus": {
				title: $I( "effectsMgr.statics.planetCrackerStorageBonus.title" ),
				type: "ratio"
			},
			"cryostationStorageBonus": {
				title: $I( "effectsMgr.statics.cryostationStorageBonus.title" ),
				type: "ratio"
			},
			// cycleEffects
			"spaceElevator-prodTransferBonus": {
                title: $I("effectsMgr.statics.spaceElevator-prodTransferBonus.title"),
                type: "ratio"
            },

			"sattelite-starchartPerTickBaseSpace": {
                title: $I("effectsMgr.statics.sattelite-starchartPerTickBaseSpace.title"),
                type: "ratio"
            },

			"sattelite-observatoryRatio": {
                title: $I("effectsMgr.statics.sattelite-observatoryRatio.title"),
                type: "ratio"
            },

			"spaceStation-scienceRatio": {
                title: $I("effectsMgr.statics.spaceStation-scienceRatio.title"),
                type: "ratio"
            },

			"moonOutpost-unobtainiumPerTickSpace": {
                title: $I("effectsMgr.statics.moonOutpost-unobtainiumPerTickSpace.title"),
                type: "ratio"
            },

			"planetCracker-uraniumPerTickSpace": {
                title: $I("effectsMgr.statics.planetCracker-uraniumPerTickSpace.title"),
                type: "ratio"
            },

			"hydrofracturer-oilPerTickAutoprodSpace": {
                title: $I("effectsMgr.statics.hydrofracturer-oilPerTickAutoprodSpace.title"),
                type: "ratio"
            },

			"researchVessel-starchartPerTickBaseSpace": {
                title: $I("effectsMgr.statics.researchVessel-starchartPerTickBaseSpace.title"),
                type: "ratio"
            },

			"sunlifter-energyProduction": {
                title: $I("effectsMgr.statics.sunlifter-energyProduction.title"),
                type: "ratio"
            },

                        "cryostation-woodMax": {
                title: $I("effectsMgr.statics.cryostation-woodMax.title"),
                type: "ratio"
            },

                        "cryostation-mineralsMax": {
                title: $I("effectsMgr.statics.cryostation-mineralsMax.title"),
                type: "ratio"
            },

                        "cryostation-ironMax": {
                title: $I("effectsMgr.statics.cryostation-ironMax.title"),
                type: "ratio"
            },

                        "cryostation-coalMax": {
                title: $I("effectsMgr.statics.cryostation-coalMax.title"),
                type: "ratio"
            },

                        "cryostation-uraniumMax": {
                title: $I("effectsMgr.statics.cryostation-uraniumMax.title"),
                type: "ratio"
            },

                        "cryostation-titaniumMax": {
                title: $I("effectsMgr.statics.cryostation-titaniumMax.title"),
                type: "ratio"
            },

                        "cryostation-oilMax": {
                title: $I("effectsMgr.statics.cryostation-oilMax.title"),
                type: "ratio"
            },

                        "cryostation-unobtainiumMax": {
                title: $I("effectsMgr.statics.cryostation-unobtainiumMax.title"),
                type: "ratio"
            },

			"spaceBeacon-starchartPerTickBaseSpace": {
                title: $I("effectsMgr.statics.spaceBeacon-starchartPerTickBaseSpace.title"),
                type: "ratio"
            },

                        "hydroponics-catnipRatio": {
                title: $I("effectsMgr.statics.hydroponics-catnipRatio.title"),
                type: "ratio"
            },

                        "hrHarvester-energyProduction": {
                title: $I("effectsMgr.statics.hrHarvester-energyProduction.title"),
                type: "ratio"
            },

                        "entangler-gflopsConsumption": {
                title: $I("effectsMgr.statics.entangler-gflopsConsumption.title"),
                type: "ratio"
            },
			"hrProgress": {
				title: $I("effectsMgr.statics.entangler-hrProgress.title"),
				type: "ratio",
				calculation: "nonProportional"
			},

			"aiLevel" :  {
				title: $I("effectsMgr.statics.aiLevel.title"),
				type: "fixed",
				calculation: "nonProportional"
			},

			"gflopsConsumption" :  {
				title: $I("effectsMgr.statics.gflopsConsumption.title"),
				type: "perTick"
			},

			"hashrate" :  {
				title: $I("effectsMgr.statics.hashrate.title"),
				type: "fixed",
				calculation: "nonProportional"
			},

			"nextHashLevelAt" :  {
				title: $I("effectsMgr.statics.nextHashLevelAt.title"),
				type: "fixed",
				calculation: "nonProportional"
			},

			"hashRateLevel" :  {
				title: $I("effectsMgr.statics.hashrateLevel.title"),
				type: "fixed",
				calculation: "nonProportional"
			},

			"corruptionBoostRatio": {
				title: $I("effectsMgr.statics.corruptionBoostRatio.title"),
				type: "ratio"
			},

			"corruptionBoostRatioChallenge": {
				title: $I("effectsMgr.statics.corruptionBoostRatioChallenge.title"),
				type: "ratio"
			},

			"bskSattelitePenalty" : {
				title: $I("effectsMgr.statics.bskSattelitePenalty.title"),
				type: "ratio"
			},

			"blsCorruptionRatio": {
				title: $I("effectsMgr.statics.blsCorruptionRatio.title"),
				type: "ratio"
			},

			"baseMetalMaxRatio": {
				title: $I("effectsMgr.statics.baseMetalMaxRatio.title"),
				type: "ratio"
			},

			"scienceMaxCompendia": {
				title: $I("effectsMgr.statics.scienceMaxCompendia.title"),
				type: "fixed"
			},

			"uplinkDCRatio": {
				title: $I("effectsMgr.statics.uplinkDCRatio.title"),
				type: "ratio"
			},

			"uplinkLabRatio": {
				title: $I("effectsMgr.statics.uplinkLabRatio.title"),
				type: "ratio"
			},

			"dataCenterAIRatio": {
				title: $I("effectsMgr.statics.dataCenterAIRatio.title"),
			},

			"compendiaTTBoostRatio": {
				title: $I("effectsMgr.statics.compendiaTTBoostRatio.title"),
				type: "ratio"
			},

			"blackLibraryBonus": {
				title: $I("effectsMgr.statics.blackLibraryBonus.title"),
				type: "ratio"
			},

			"solarFarmSeasonRatio": {
				title: $I("effectsMgr.statics.solarFarmSeasonRatio.title"),
				type: "fixed"
			},

			"tectonicBonus": {
				title: $I("effectsMgr.statics.tectonicBonus.title"),
				type: "ratio"
			},

			"umbraBoostRatio": {
				title: $I("effectsMgr.statics.umbraBoostRatio.title"),
				type: "ratio"
			},

			"eludiumAutomationBonus": {
				title: $I("effectsMgr.statics.eludiumAutomationBonus.title"),
				type: "ratio"
			},

			"heatMax": {
				title: $I("effectsMgr.statics.heatMax.title"),
				type: "fixed"
			},

			"heatPerTick": {
				title: $I("effectsMgr.statics.heatPerTick.title"),
				type: "perTick"
			},

			"heatMaxExpansion": {
				title: $I("effectsMgr.statics.heatMaxExpansion.title"),
				type: "fixed",
				calculation: "nonProportional"
			},

			"voidResonance": {
				title: $I("effectsMgr.statics.voidResonance.title"),
				type: "ratio"
			},

			"terraformingMaxKittensRatio": {
				title: $I("effectsMgr.statics.terraformingMaxKittens.title"),
				type: "ratio",
				calculation: "nonProportional"
			},
			//age 1 policy effects
			"happinessKittenProductionRatio": {
				title: $I("effectsMgr.statics.happinessKittenProductionRatio.title"),
				type: "ratio"
			},
			"cultureFromManuscripts": {
				title: $I("effectsMgr.statics.cultureFromManuscripts.title"),
				type: "ratio"
			},
			"manuscriptParchmentCost": {
				title: $I("effectsMgr.statics.manuscriptCost.title", [$I("resources.parchment.title")]),
				type: "fixed"
			},
			"manuscriptCultureCost": {
				title: $I("effectsMgr.statics.manuscriptCost.title",[$I("resources.culture.title")]),
				type: "fixed"
			},
			//age 2 policy effects
			"rankLeaderBonusConversion": {
				title: $I("effectsMgr.statics.rankLeaderBonusConversion.title"),
                type: "ratio"
			},
			"boostFromLeader": {
                title: $I("effectsMgr.statics.boostFromLeader.title"),
                type: "ratio"
			},
			//age 3 policy effects
			"goldCostReduction": {
                title: $I("effectsMgr.statics.goldCostReduction.title"),
                type: "ratio"
			},
			"factoryCostReduction":{
                title: $I("effectsMgr.statics.factoryCostReduction.title"),
                type: "ratio"
			},
			"logHouseCostReduction":{
                title: $I("effectsMgr.statics.logHouseCostReduction.title"), //yes, it is log house!
                type: "ratio"
			},
			"communismProductionBonus":{
                title: $I("effectsMgr.statics.communismProductionBonus.title"),
                type: "ratio"
			},
			//age 4 policy effects
			"technocracyScienceCap":{
                title: $I("effectsMgr.statics.technocracyScienceCap.title"),
                type: "ratio"
			},
			//age 5 policy effects
			"aiCoreProductivness":{
                title: $I("effectsMgr.statics.aiCoreProductivity.title"),
                type: "ratio"
			},
			"aiCoreUpgradeBonus":{
				title: $I("effectsMgr.statics.aiCoreUpgradeBonus.title"),
				type: "ratio"
			},
			"blsProductionBonus":{
                title: $I("effectsMgr.statics.blsProductionBonus.title"),
                type: "ratio"
			},
			"leviathansEnergyModifier":{
                title: $I("effectsMgr.statics.leviathansEnergyModifier.title"),
                type: "ratio"
			},
			"holyGenocideBonus":{
                title: $I("effectsMgr.statics.holyGenocideBonus.title"),
                type: "ratio"
			},
            //foreign policy effects
            "tradeCatpowerDiscount":{
                title: $I("effectsMgr.statics.tradeCatpowerDiscount.title"),
                type: "fixed"
            },
            "tradeGoldDiscount":{
                title: $I("effectsMgr.statics.tradeGoldDiscount.title"),
                type: "fixed"
            },
            "zebraRelationModifier":{
                title: $I("effectsMgr.statics.zebraRelationModifier.title"),
                type: "fixed"
            },
            "nonZebraRelationModifier":{
                title: $I("effectsMgr.statics.nonZebraRelationModifier.title"),
                type: "fixed"
            },
            "sharedKnowledgeBonus":{
                title: $I("effectsMgr.statics.sharedKnowledgeBonus.title"),
                type: "ratio"
            },
            "culturalExchangeBonus":{
                title: $I("effectsMgr.statics.culturalExchangeBonus.title"),
                type: "ratio"
            },
            "embassyCostReduction":{
                title: $I("effectsMgr.statics.embassyCostReduction.title"),
                type: "ratio"
            },
            "onAHillCultureCap":{
                title: $I("effectsMgr.statics.onAHillCultureCap.title"),
                type: "ratio"
            },
            "satelliteSynergyBonus":{
                title: $I("effectsMgr.statics.satelliteSynergyBonus.title"),
                type: "ratio"
            },
            "globalRelationsBonus":{
            title: $I("effectsMgr.statics.globalRelationsBonus.title"),
                type: "fixed"
            },
            //philosophy
            "luxuryDemandRatio":{
                title: $I("effectsMgr.statics.luxuryDemandRatio.title"),
                type: "ratio"
            },
			"breweryConsumptionRatio":{
                title: $I("effectsMgr.statics.breweryConsumptionRatio.title"),
                type: "ratio"
			},
            "luxuryHappinessBonus":{
                title: $I("effectsMgr.statics.luxuryHappinessBonus.title"),
                type: "fixed"
            },
            "rationalityBonus":{
                title: $I("effectsMgr.statics.rationalityBonus.title"),
                type: "ratio"
            },
        	"mysticismBonus":{
        	    title: $I("effectsMgr.statics.mysticismBonus.title"),
               type: "ratio"
            },
			"festivalLuxuryConsumptionRatio":{
            	title: $I("effectsMgr.statics.festivalLuxuryConsumptionRatio.title"),
            	type: "ratio"
			},"consumableLuxuryHappiness":{
                title: $I("effectsMgr.statics.consumableLuxuryHappiness.title"),
                type: "fixed"
			},
			 "hapinnessConsumptionRatio":{
                title: $I("effectsMgr.statics.hapinnessConsumptionRatio.title"),
                type: "ratio"
			},
			 "mintRatio":{
                title: $I("effectsMgr.statics.mintRatio.title"),
                type: "ratio"
			},
             //environment policy
            "environmentMineralBonus":{
                title: $I("effectsMgr.statics.environmentMineralBonus.title"),
                type: "ratio"
            },
            "environmentWoodBonus":{
				title: $I("effectsMgr.statics.environmentWoodBonus.title"),
				type: "ratio"
            },
            "environmentHappinessBonus":{
                title: $I("effectsMgr.statics.environmentHappinessBonus.title"),
                type: "fixed"
            },
            "environmentUnhappiness":{
                title: $I("effectsMgr.statics.environmentUnhappiness.title"),
                type: "fixed"
            },
            "environmentFactoryCraftBonus":{
				title: $I("effectsMgr.statics.environmentFactoryCraftBonus.title"),
				type: "ratio"
			},
            "coalPolicyRatio":{
				title: $I("effectsMgr.statics.coalPolicyRatio.title"),
				type: "ratio"
            },
            "ironPolicyRatio":{
				title: $I("effectsMgr.statics.ironPolicyRatio.title"),
				type: "ratio"
            },
            "titaniumPolicyRatio":{
				title: $I("effectsMgr.statics.titaniumPolicyRatio.title"),
				type: "ratio"
            },
            "faithPolicyRatio":{
				title: $I("effectsMgr.statics.faithPolicyRatio.title"),
				type: "ratio"
            },
            "unobtainiumPolicyRatio":{
				title: $I("effectsMgr.statics.unobtainiumPolicyRatio.title"),
				type: "ratio"
            },
            "sciencePolicyRatio":{
				title: $I("effectsMgr.statics.sciencePolicyRatio.title"),
				type: "ratio"
            },
            "culturePolicyRatio":{
				title: $I("effectsMgr.statics.culturePolicyRatio.title"),
				type: "ratio"
            },
            "mineralsPolicyRatio":{
				title: $I("effectsMgr.statics.mineralsPolicyRatio.title"),
				type: "ratio"
            },
            "woodPolicyRatio":{
				title: $I("effectsMgr.statics.woodPolicyRatio.title"),
				type: "ratio"
            },
            "goldPolicyRatio":{
				title: $I("effectsMgr.statics.goldPolicyRatio.title"),
				type: "ratio"
			},
			//challenges
			"springCatnipRatio": {
				title: $I("effectsMgr.statics.springCatnipRatio.title"),
				type: "ratio"
			},
            "summerSolarFarmRatio": {
                title: $I("effectsMgr.statics.summerSolarFarmRatio.title"),
				type: "ratio"
            },
            "shatterCostReduction": {
                title: $I("effectsMgr.statics.shatterCostReduction.title"),
                type: "ratio"
			},
            "temporalPressCap": {
                title: $I("effectsMgr.statics.temporalPressCap.title"),
                type: "fixed"
			},
            "heatEfficiency": {
                title: $I("effectsMgr.statics.heatEfficiency.title"),
                type: "ratio"
			},
            "shatterCostIncreaseChallenge": {
                title: $I("effectsMgr.statics.shatterCostIncreaseChallenge.title"),
                type: "ratio"
			},
			"coldChance": {
                title: $I("effectsMgr.statics.coldChance.title"),
                type: "ratio"
			},
			"coldHarshness": {
                title: $I("effectsMgr.statics.coldHarshness.title"),
                type: "ratio"
			},
			"kittenLaziness": {
                title: $I("effectsMgr.statics.kittenLaziness.title"),
                type: "ratio"
			},
			"shatterVoidCost":{
                title: $I("effectsMgr.statics.shatterVoidCost.title"),
                type: "fixed"
			},
			"challengeHappiness":{
                title: $I("effectsMgr.statics.challengeHappiness.title")
			},
			"tradeKnowledge":{
				title: $I("effectsMgr.statics.tradeKnowledge.title")
			},
			"tradeKnowledgeRatio" :  {
				title: $I("effectsMgr.statics.tradeKnowledgeRatio.title"),
				type: "ratio",
				calculation: "nonProportional"
			},
			"steamworksFakeBought":{
				title: $I("effectsMgr.statics.steamworksFakeBought.title")
			},
			"embassyFakeBought":{
				title: $I("effectsMgr.statics.embassyFakeBought.title")
			},
			"policyFakeBought":{
				title: $I("effectsMgr.statics.policyFakeBought.title")
			},
			"weaponEfficency":{
				title: $I("effectsMgr.statics.weaponEfficency.title"),
				type: "ratio"
			},
			"cryochamberSupport":{
				title: $I("effectsMgr.statics.cryochamberSupport.title"),
			},
			"arrivalSlowdown":{
				title: $I("effectsMgr.statics.arrivalSlowdown.title"),
				type: "ratio"
			},
			"mausoleumBonus":{
				title: $I("effectsMgr.statics.mausoleumBonus.title"),
				type: "ratio"
			},
			//pacts
            "pactsAvailable":{
				title: $I("effectsMgr.statics.pactsAvailable.title"),
				type: "fixed"
			},
            "kittensKarmaPerMinneliaRatio":{
				title: $I("effectsMgr.statics.kittensKarmaPerMinneliaRatio.pact.title"),
				type: "ratio"
			},
            "necrocornPerDay":{
				title: $I("effectsMgr.statics.necrocornPerDay.pact.title"),
				type: "perDay"
			},
            "pactGlobalResourceRatio":{
				title: $I("effectsMgr.statics.pactGlobalResourceRatio.title"),
				type: "ratio"
			},
            "pactGlobalProductionRatio":{
				title: $I("effectsMgr.statics.pactGlobalProductionRatio.title"),
				type: "ratio"
			},
            "pactFaithRatio":{
				title: $I("effectsMgr.statics.pactFaithRatio.title"),
				type: "ratio"
			},
			"pyramidGlobalResourceRatio":{
				title: $I("effectsMgr.statics.pyramidGlobalResourceRatio.title"),
				type: "ratio"
			},
			"pyramidGlobalProductionRatio":{
				title: $I("effectsMgr.statics.pyramidGlobalProductionRatio.title"),
				type: "ratio"
			},
			"deficitRecoveryRatio":{
				title: $I("effectsMgr.statics.deficitRecoveryRatio.title"),
				type: "ratio"
			},
			"pyramidFaithRatio":{
				title: $I("effectsMgr.statics.pyramidFaithRatio.title"),
				type: "ratio"
			},
			"pyramidSpaceCompendiumRatio":{
				title: $I("effectsMgr.statics.pyramidSpaceCompendiumRatio.title"),
				type: "ratio"
			},
			"pactBlackLibraryBoost":{
				title: $I("effectsMgr.statics.pactBlackLibraryBoost.title"),
				type: "ratio"
			},
			"pactDeficitRecoveryRatio":{
				title: $I("effectsMgr.statics.pactDeficitRecoveryRatio.title"),
				type: "ratio"
			},
			"pactSpaceCompendiumRatio":{
				title: $I("effectsMgr.statics.pactSpaceCompendiumRatio.title"),
				type: "ratio"
			},
			//pollution
			"cathPollutionPerTickProd":{
				type: "hidden"
			},
			"cathPollutionPerTickCon":{
				type: "hidden"
			},
			"cathPollutionRatio":{
				title:  $I("effectsMgr.statics.pollutionRatio.title"),
				type: "ratio"
			},
            //zebra workshop upgrades
            "zebraPreparations": {
                title: $I("effectsMgr.statics.zebraPreparations.title"),
                type: "fixed"
			},
			"academyMeteorBonus": {
                title: $I("effectsMgr.statics.academyMeteorBonus.title"),
                type: "ratio"
			},
			"activeHG":{
				title: $I("effectsMgr.statics.activeHG.title"),
				type: "fixed",
				calculation: "nonProportional"

			}
		}
	}
});