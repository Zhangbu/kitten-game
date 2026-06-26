import React, { useState, useEffect, useRef, useCallback, memo } from 'react';

/* ============================================================
 * WCollapsiblePanel
 * ============================================================ */
function WCollapsiblePanel(props) {
  var [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div>
      <div>
        <div className="left">
          <a className="link collapse" onClick={function () { setIsCollapsed(function (v) { return !v; }); }}>
            {isCollapsed ? ">(" + props.title + ")" : "v"}
          </a>
        </div>
      </div>
      {!isCollapsed && props.children}
    </div>
  );
}

/* ============================================================
 * WResourceRow
 * ============================================================ */
function WResourceRowRaw(props) {
  var perTickRef = useRef(null);
  var tooltipNodeRef = useRef(null);

  // Initial state from resource
  var [visible, setVisible] = useState(!props.resource.isHidden);

  // Attach tooltip on mount and update
  useEffect(function () {
    if (perTickRef.current && !tooltipNodeRef.current) {
      tooltipNodeRef.current = perTickRef.current;
      window.game.attachResourceTooltip(perTickRef.current, props.resource);
    }
  });

  // Cleanup on unmount
  useEffect(function () {
    return function () {
      if (tooltipNodeRef.current) {
        dojo.destroy(tooltipNodeRef.current);
      }
    };
  }, []);

  var res = props.resource;
  var game = window.game;

  if (!res.visible && !props.showHiddenResources) {
    return null;
  }

  var hasVisibility = (res.unlocked || (res.name === "kittens" && res.maxValue));
  if (!hasVisibility || (!visible && !props.isEditMode)) {
    return null;
  }

  if (game.resPool.isNormalCraftableResource(res) && game.workshop.getCraft(res.name).unlocked) {
    return null;
  }

  var isTimeParadox = props.isTemporalParadox;
  var perTick = isTimeParadox ? 0 : game.getResourcePerTick(res.name, true);
  perTick = game.opts.usePerSecondValues ? perTick * game.getTicksPerSecondUI() : perTick;
  var postfix = game.opts.usePerSecondValues ? "/" + $I("unit.s") : "";
  if (game.opts.usePercentageResourceValues && res.maxValue) {
    perTick = (perTick / res.maxValue * 100).toFixed(2);
    postfix = "%" + postfix;
  }

  var perTickVal =
    game.getResourcePerTick(res.name, false) ||
      game.getResourcePerTickConvertion(res.name)
      ? game.getDisplayValueExt(perTick, true, false) + postfix
      : (res.calculatePerDay)
        ? game.getDisplayValueExt(
          (game.getResourcePerDay(res.name)) *
          ((res.name === "necrocorn") ? 1 + game.timeAccelerationRatio() : 1),
          true, false
        ) + "/" + $I("unit.d")
        : (res.calculateOnYear)
          ? game.getDisplayValueExt(game.getResourceOnYearProduction(res.name), true, false) + "/" + $I("unit.y")
          : "";

  var resNameCss = {};
  if (res.type === "uncommon") {
    resNameCss = { color: "Coral" };
  }
  if (res.type === "rare") {
    resNameCss = { color: "orange", textShadow: "1px 0px 10px Coral" };
  }
  if (res.color) {
    resNameCss = { color: res.color };
  }
  if (res.style) {
    for (var styleKey in res.style) {
      if (Object.prototype.hasOwnProperty.call(res.style, styleKey)) {
        resNameCss[styleKey] = res.style[styleKey];
      }
    }
  }

  var resAmtClassName = "resAmount";
  if (res.value > res.maxValue * 0.95 && res.maxValue > 0) {
    resAmtClassName = "resAmount resLimitNotice";
  } else if (res.value > res.maxValue * 0.75 && res.maxValue > 0) {
    resAmtClassName = "resAmount resLimitWarn";
  }

  var season = game.calendar.getCurSeason();
  var weatherModValue = null;
  var weatherModCss = null;

  if (season.modifiers[res.name] && perTick !== 0) {
    var modifier = game.calendar.getWeatherMod(res);
    if (modifier === 0) {
      modifier = -100;
    } else {
      modifier = Math.max(Math.round((modifier - 1) * 100), -99);
    }
    weatherModValue = modifier ? "[" + (modifier > 0 ? "+" : "") + modifier.toFixed() + "%]" : "";
    if (modifier > 0) {
      weatherModCss = "positive-weather";
    } else if (modifier < 0) {
      weatherModCss = "negative-weather";
    }
  }

  var specialClass = "";
  if (res.value === 420) {
    specialClass = " blaze";
  } else if (res.value === 666) {
    specialClass = " hail";
  } else if (res.value === 777) {
    specialClass = " pray";
  } else if (res.value === 1337) {
    specialClass = " leet";
  }

  var resLeaderBonus = "";
  var currentLeader = game.village.leader;
  if (currentLeader) {
    if (currentLeader.job) {
      var currentLeaderJob = game.village.getJob(currentLeader.job);
      if (currentLeaderJob) {
        for (var jobResName in currentLeaderJob.modifiers) {
          if (res.name === jobResName) {
            resLeaderBonus = " resLeaderBonus ";
          }
        }
      }
    }
  }

  var resRowClass = "res-row resource_" + res.name + resLeaderBonus +
    (props.isRequired ? " highlited" : "") +
    (!res.visible ? " hidden" : "");

  function toggleView() {
    setVisible(function (v) { return !v; });
    res.isHidden = !visible;
  }

  function onClickName(e) {
    if (props.isEditMode || e.ctrlKey || e.metaKey) {
      toggleView();
    }
  }

  return (
    <div className={resRowClass}>
      {props.isEditMode ? (
        <div className="res-cell">
          <input type="checkbox" checked={visible}
            onClick={toggleView}
            style={{ display: "inline-block" }}
          />
        </div>
      ) : null}
      <div className="res-cell resource-name" style={resNameCss}
        onClick={onClickName}
        title={res.title || res.name}>
        {res.title || res.name}
      </div>
      <div className={"res-cell " + resAmtClassName + specialClass}>
        {game.getDisplayValueExt(res.value)}
      </div>
      <div className="res-cell maxRes">
        {res.maxValue ? "/" + game.getDisplayValueExt(res.maxValue) : ""}
      </div>
      <div className="res-cell resPerTick" ref={perTickRef}>
        {isTimeParadox ? "???" : perTickVal}
      </div>
      <div className={"res-cell" + (weatherModCss ? " " + weatherModCss : "")}>
        {weatherModValue}
      </div>
    </div>
  );
}

// NOTE: Game model objects are mutated in place, so React.memo reference-checking
// won't detect value changes.  Throttling the parent state update instead.
var WResourceRow = WResourceRowRaw;

/* ============================================================
 * WCraftShortcut
 * ============================================================ */
function WCraftShortcut(props) {
  var linkBlockRef = useRef(null);

  useEffect(function () {
    var recipe = props.recipe;
    var ratio = props.craftPercent;

    if (props.craftPercent === 1) {
      return;
    }

    var node = linkBlockRef.current;
    if (node && node.firstChild) {
      UIUtils.attachTooltip(window.game, node.firstChild, 0, 60, dojo.partial(function (recipe) {
        var tooltip = dojo.create("div", { className: "button_tooltip" }, null);
        var prices = window.game.workshop.getCraftPrice(recipe);
        var allCount = window.game.workshop.getCraftAllCount(recipe.name);
        var ratioCount = Math.floor(allCount * ratio);
        var num = props.craftFixed;
        if (num < ratioCount) {
          num = ratioCount;
        }
        for (var i = 0; i < prices.length; i++) {
          var price = prices[i];
          var priceItemNode = dojo.create("div", { style: { clear: "both" } }, tooltip);
          var res = window.game.resPool.get(price.name);
          dojo.create("span", {
            innerHTML: res.title || res.name,
            style: { float: "left" }
          }, priceItemNode);
          dojo.create("span", {
            innerHTML: window.game.getDisplayValueExt(price.val * num),
            style: { float: "right", paddingLeft: "6px" }
          }, priceItemNode);
        }
        return tooltip.outerHTML;
      }, recipe));
    }
  }, []);

  useEffect(function () {
    return function () {
      var node = linkBlockRef.current;
      if (node) {
        dojo.destroy(node.firstChild);
      }
    };
  }, []);

  var res = props.resource;
  var recipe = props.recipe;
  var craftFixed = props.craftFixed;
  var craftPercent = props.craftPercent;
  var game = window.game;
  var allCount = game.workshop.getCraftAllCount(res.name);
  var craftRatio = game.getResCraftRatio(res.name);
  var craftPrices = game.workshop.getCraftPrice(recipe);

  var craftRowAmt = craftFixed;
  if (craftFixed < allCount * craftPercent) {
    craftRowAmt = Math.floor(allCount * craftPercent);
  }

  var elem = null;
  var cssClasses = "res-cell craft-link ";
  if (craftPercent === 1) {
    cssClasses += "all";
    elem = (function () {
      if (hasMinAmt()) {
        return (
          <div className={cssClasses} onClick={doCraftAll}
            title={"+" + game.getDisplayValueExt(allCount * (1 + craftRatio), null, null, 0)}>
            {$I("resources.craftTable.all")}
          </div>
        );
      } else {
        return <div className={cssClasses} />;
      }
    })();
  } else {
    cssClasses += "craft-" + (craftPercent * 100) + "pc";
    elem = (function () {
      if (game.resPool.hasRes(craftPrices, craftRowAmt)) {
        if (game.opts.usePercentageConsumptionValues) {
          return (
            <div className={cssClasses} onClick={doCraft}
              title={"+" + game.getDisplayValueExt(craftRowAmt * (1 + craftRatio), null, null, 0)}>
              {(craftPercent * 100) + "%"}
            </div>
          );
        } else {
          return (
            <div className={cssClasses} onClick={doCraft}
              title={(craftPercent * 100) + "%"}>
              <span className="plusPrefix">+</span>
              {game.getDisplayValueExt(craftRowAmt * (1 + craftRatio), null, null, 0)}
            </div>
          );
        }
      } else {
        return <div className={cssClasses} />;
      }
    })();
  }

  return (
    <div ref={linkBlockRef} style={{ display: "contents" }}>
      {elem}
    </div>
  );

  function hasMinAmt() {
    var minAmt = Number.MAX_VALUE;
    var costPrices = game.workshop.getCraftPrice(recipe);
    for (var j = 0; j < costPrices.length; j++) {
      var totalRes = game.resPool.get(costPrices[j].name).value;
      var allAmt = Math.floor(totalRes / costPrices[j].val);
      if (allAmt < minAmt) {
        minAmt = allAmt;
      }
    }
    return minAmt > 0 && minAmt < Number.MAX_VALUE;
  }

  function doCraft(event) {
    var allCount = game.workshop.getCraftAllCount(res.name);
    var ratioCount = Math.floor(allCount * craftPercent);
    var num = craftFixed;
    if (num < ratioCount) {
      num = ratioCount;
    }
    game.craft(res.name, num);
  }

  function doCraftAll() {
    game.craftAll(res.name);
  }
}

/* ============================================================
 * WCraftRow
 * ============================================================ */
function WCraftRow(props) {
  var perTickRef = useRef(null);
  var tooltipNodeRef = useRef(null);
  var [visible, setVisible] = useState(!props.resource.isHidden);

  useEffect(function () {
    if (perTickRef.current && !tooltipNodeRef.current) {
      tooltipNodeRef.current = perTickRef.current;
      window.game.attachResourceTooltip(perTickRef.current, props.resource);
    }
  });

  var res = props.resource;
  var game = window.game;
  var recipe = game.workshop.getCraft(res.name);
  var hasVisibility = (res.unlocked && recipe.unlocked);

  if (!hasVisibility || (!visible && !props.isEditMode)) {
    return null;
  }

  var resNameCss = {};
  if (res.type === "uncommon") {
    resNameCss = { color: "Coral" };
  }
  if (res.type === "rare") {
    resNameCss = { color: "orange", textShadow: "1px 0px 10px Coral" };
  }
  if (res.color) {
    resNameCss = { color: res.color };
  }
  if (res.style) {
    for (var styleKey in res.style) {
      if (Object.prototype.hasOwnProperty.call(res.style, styleKey)) {
        resNameCss[styleKey] = res.style[styleKey];
      }
    }
  }

  var resVal = game.getDisplayValueExt(res.value);

  function toggleView() {
    setVisible(function (v) { return !v; });
    res.isHidden = !visible;
  }

  function onClickName(e) {
    if (props.isEditMode || e.ctrlKey) {
      toggleView();
    }
  }

  return (
    <div className={
      "res-row craft resource_" + res.name +
      (game.workshop.getEffectEngineer(res.name) !== 0 ? " craftEngineer " : "") +
      (props.isRequired ? " highlited" : "")
    }>
      {props.isEditMode ? (
        <div className="res-cell">
          <input type="checkbox" checked={visible}
            onClick={toggleView}
            style={{ display: "inline-block" }} />
        </div>
      ) : null}
      <div className="res-cell resource-name" style={resNameCss}
        onClick={onClickName}
        title={res.title || res.name}>
        {res.title || res.name}
      </div>
      <div className="res-cell resource-value" ref={perTickRef} title={resVal}>
        {resVal}
      </div>
      <WCraftShortcut resource={res} recipe={recipe} craftFixed={1} craftPercent={0.01} />
      <WCraftShortcut resource={res} recipe={recipe} craftFixed={25} craftPercent={0.05} />
      <WCraftShortcut resource={res} recipe={recipe} craftFixed={100} craftPercent={0.1} />
      <WCraftShortcut resource={res} recipe={recipe} craftPercent={1} />
    </div>
  );
}

/* ============================================================
 * WResourceTable
 * ============================================================ */
function WResourceTable(props) {
  var [resTableState, setResTableState] = useState({
    isEditMode: false,
    isCollapsed: false,
    showHiddenResources: false
  });

  return (
    <div>
      <div>
        <div className="res-toolbar left">
          <a className="link collapse" onClick={function () {
            setResTableState(function (prev) {
              return { ...prev, isCollapsed: !prev.isCollapsed };
            });
          }}>
            {resTableState.isCollapsed ? ">(" + $I("left.resources") + ")" : "v"}
          </a>
        </div>
        <div className="res-toolbar right">
          <a className={"link" + (resTableState.isEditMode ? " toggled" : "")}
            onClick={function () {
              setResTableState(function (prev) {
                return { ...prev, isEditMode: !prev.isEditMode };
              });
            }}
            onKeyDown={function (event) {
              if (event.keyCode === 13) {
                setResTableState(function (prev) {
                  return { ...prev, isEditMode: !prev.isEditMode };
                });
              }
            }}
            tabIndex={0}>
            ⚙
          </a>
          <WTooltip body="?">{$I("left.resources.tip")}</WTooltip>
        </div>
      </div>
      {!resTableState.isCollapsed && (
        <div>
          {resTableState.isEditMode && (
            <div style={{ textAlign: "right" }}>
              <a className="link" onClick={function () { window.game.ui.zoomUp(); }}>
                {$I("left.font.inc")}
              </a>
              <a className="link" onClick={function () { window.game.ui.zoomDown(); }}>
                {$I("left.font.dec")}
              </a>
            </div>
          )}
          <div className="res-table">
            {(function () {
              var resRows = [];
              var resources = props.resources;
              for (var i in resources) {
                var res = resources[i];
                var isRequired = (props.reqRes.indexOf(res.name) >= 0);
                resRows.push(
                  <WResourceRow key={res.name}
                    resource={res}
                    isEditMode={resTableState.isEditMode}
                    isRequired={isRequired}
                    showHiddenResources={resTableState.showHiddenResources}
                    isTemporalParadox={window.game.calendar.day < 0}
                  />
                );
              }
              return resRows;
            })()}
          </div>
        </div>
      )}
      {!resTableState.isCollapsed && resTableState.isEditMode && (
        <div className="res-toggle-hidden">
          <input type="checkbox" checked={resTableState.showHiddenResources}
            onClick={function (e) {
              setResTableState(function (prev) {
                return { ...prev, showHiddenResources: e.target.checked };
              });
            }}
            style={{ display: "inline-block" }} />
          {$I("res.show.hidden")}
        </div>
      )}
    </div>
  );
}

/* ============================================================
 * WCraftTable
 * ============================================================ */
function WCraftTable(props) {
  var [craftState, setCraftState] = useState({
    isEditMode: false,
    isCollapsed: false
  });

  var game = window.game;

  if (game.bld.get("workshop").on <= 0) {
    return null;
  }

  return (
    <div>
      <div>
        <div className="res-toolbar left">
          <a className="link collapse" onClick={function () {
            setCraftState(function (prev) {
              return { ...prev, isCollapsed: !prev.isCollapsed };
            });
          }}>
            {craftState.isCollapsed ? ">(" + $I("left.craft") + ")" : "v"}
          </a>
        </div>
        <div className="res-toolbar right">
          <a className={"link" + (craftState.isEditMode ? " toggled" : "")}
            onClick={function () {
              setCraftState(function (prev) {
                return { ...prev, isEditMode: !prev.isEditMode };
              });
            }}
            onKeyDown={function (event) {
              if (event.keyCode === 13) {
                setCraftState(function (prev) {
                  return { ...prev, isEditMode: !prev.isEditMode };
                });
              }
            }}
            tabIndex={0}>
            ⚙
          </a>
        </div>
      </div>
      {!craftState.isCollapsed && (
        <div>
          <div className="res-table craftTable">
            {(function () {
              var resRows = [];
              var resources = props.resources;
              for (var i in resources) {
                var res = resources[i];
                if (!res.craftable) continue;
                var isRequired = (props.reqRes.indexOf(res.name) >= 0);
                resRows.push(
                  <WCraftRow key={res.name}
                    resource={res}
                    isEditMode={craftState.isEditMode}
                    isRequired={isRequired}
                  />
                );
              }
              return resRows;
            })()}
          </div>
        </div>
      )}
    </div>
  );
}

/* ============================================================
 * WPins
 * ============================================================ */
function WPins(props) {
  var game = props.game;
  var pins = [];
  for (var i in game.diplomacy.races) {
    var race = game.diplomacy.races[i];
    if (race.pinned) {
      pins.push({
        title: $I("left.trade.do", [race.title]),
        handler: function (race) {
          game.diplomacy.tradeAll(race);
        }.bind(null, race)
      });
    }
  }

  var pinLinks = [];
  for (var j in pins) {
    var pin = pins[j];
    pinLinks.push(
      <div key={j} className="pin-link">
        <a href="#" onClick={pin.handler}>{pin.title}</a>
      </div>
    );
  }

  return (
    <WCollapsiblePanel title={$I("left.trade")}>
      {pinLinks}
    </WCollapsiblePanel>
  );
}

/* ============================================================
 * WLeftPanel
 * ============================================================ */
function WLeftPanel(props) {
  var [tick, setTick] = useState(0);
  var lastUpdate = useRef(0);

  useEffect(function () {
    var handler = dojo.subscribe("ui/update", function () {
      // Throttle to ~100ms — prevents flashing at 50ms tick rate
      var now = Date.now();
      if (now - lastUpdate.current < 100) return;
      lastUpdate.current = now;
      setTick(function (t) { return t + 1; });
    });
    return function () { dojo.unsubscribe(handler); };
  }, []);

  var leftGame = props.game || window.game;

  var reqRes = leftGame.getRequiredResources(leftGame.selectedBuilding);

  var catpower = leftGame.resPool.get("manpower");
  var huntCount = Math.floor(catpower.value / 100);

  var canHunt = ((leftGame.resPool.get("paragon").value > 0) ||
    (leftGame.science.get("archery").researched)) &&
    (!leftGame.challenges.isActive("pacifism"));
  var showFastHunt = (catpower.value >= 100);

  var showAdvisor = false;
  if (leftGame.bld.get("field").on > 0) {
    var calendar = leftGame.calendar;
    var winterDays = calendar.daysPerSeason -
      (calendar.getCurSeason().name === "winter" ? calendar.day : 0);
    var catnipPerTick = leftGame.winterCatnipPerTick;
    showAdvisor = (leftGame.resPool.get("catnip").value +
      winterDays * catnipPerTick * calendar.ticksPerDay) <= 0;
  }

  return (
    <div>
      <WResourceTable resources={(function () {
        var resPool = [];
        resPool = resPool.concat(leftGame.resPool.resources);
        resPool = resPool.concat(leftGame.resPool.getPseudoResources());
        return resPool;
      })()} reqRes={reqRes} />

      <div id="advisorsContainer" style={{
        paddingTop: "10px",
        display: (showAdvisor ? "block" : "none")
      }}>
        {$I("general.food.advisor.text")}
      </div>

      <div id="fastHuntContainer" className="pin-link" style={{
        display: (canHunt ? "block" : "none"),
        visibility: (showFastHunt ? "visible" : "hidden")
      }}>
        <a href="#" onClick={function (event) { leftGame.huntAll(event); }}>
          {$I("left.hunt") + " ("}
          <span id="fastHuntContainerCount">
            {leftGame.getDisplayValueExt(huntCount, false, false, 0) + " " +
              (huntCount === 1 ? $I("left.hunt.time") : $I("left.hunt.times"))}
          </span>
          )
        </a>
      </div>

      <div id="fastPraiseContainer" className="pin-link" style={{ visibility: "hidden" }}>
        <a href="#" onClick={function (event) { leftGame.praise(event); }}>
          {$I("left.praise")}
        </a>
      </div>

      <WPins game={leftGame} />
      <WCraftTable resources={leftGame.resPool.resources} reqRes={reqRes} />
    </div>
  );
}

/* ============================================================
 * WTooltip
 * ============================================================ */
function WTooltip(props) {
  var [showTooltip, setShowTooltip] = useState(false);

  return (
    <div tabIndex={0} className="tooltip-block"
      onMouseOver={function () { setShowTooltip(true); }}
      onMouseOut={function () { setShowTooltip(false); }}
      onKeyDown={function (e) {
        if (e.keyCode === 13) setShowTooltip(function (v) { return !v; });
      }}>
      {props.body || <div className="tooltip-icon">[?]</div>}
      {showTooltip ? (
        <div className="tooltip-content">{props.children}</div>
      ) : null}
    </div>
  );
}

export {
  WCollapsiblePanel, WResourceRow, WCraftShortcut, WCraftRow,
  WResourceTable, WCraftTable, WPins, WLeftPanel, WTooltip
};
window.WCollapsiblePanel = WCollapsiblePanel;
window.WResourceRow = WResourceRow;
window.WCraftShortcut = WCraftShortcut;
window.WCraftRow = WCraftRow;
window.WResourceTable = WResourceTable;
window.WCraftTable = WCraftTable;
window.WPins = WPins;
window.WLeftPanel = WLeftPanel;
window.WTooltip = WTooltip;
