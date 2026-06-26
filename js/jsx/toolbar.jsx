import React, { useState, useEffect, useRef, useCallback } from 'react';

/* ============================================================
 * WToolbarIconContainer — wrapper with tooltip support
 * ============================================================ */
function WToolbarIconContainer(props) {
  var iconRef = useRef(null);

  useEffect(function () {
    if (props.getTooltip && iconRef.current) {
      UIUtils.attachTooltip(props.game, iconRef.current, 0, 100, props.getTooltip);
    }
  }, []);

  return (
    <div className={"toolbarIcon " + (props.className || "")} ref={iconRef}>
      {props.children}
    </div>
  );
}

/* ============================================================
 * WToolbarHappiness
 * ============================================================ */
function WToolbarHappiness(props) {
  var game = props.game;
  if (game.village.getKittens() <= 5) {
    return null;
  }

  function getTooltip() {
    var base = game.getEffect("happiness");
    var tooltip = $I("village.happiness.base") + ": 100%<br>" +
      $I("village.happiness.buildings") + ": +" + (Math.floor(base)) + "%<br>";

    var resHappiness = 0;
    var resources = game.resPool.resources;
    var happinessPerLuxury = 10;
    happinessPerLuxury += game.getEffect("luxuryHappinessBonus");
    for (var i = resources.length - 1; i >= 0; i--) {
      if (resources[i].type !== "common" && resources[i].value > 0) {
        resHappiness += happinessPerLuxury;
        if (resources[i].name === "elderBox" && game.resPool.get("wrappingPaper").value) {
          resHappiness -= happinessPerLuxury;
        }
        if (resources[i].type === "uncommon") {
          resHappiness += game.getEffect("consumableLuxuryHappiness");
        }
      }
    }
    tooltip += $I("village.happiness.rare.resources") + ": +" +
      game.getDisplayValueExt(resHappiness, false, false, 0) + "%<br>";

    var karma = game.resPool.get("karma");
    if (karma.value > 0) {
      tooltip += $I("village.happiness.karma") + ": +" +
        game.getDisplayValueExt(karma.value, false, false, 0) + "%<br>";
    }

    if (game.calendar.festivalDays > 0) {
      var festivalHappinessEffect = 30 * (1 + game.getEffect("festivalRatio"));
      tooltip += $I("village.happiness.festival") + ": +" +
        game.getDisplayValueExt(festivalHappinessEffect, false, false, 0) + "%<br>";
    }

    var unhappiness = game.village.getUnhappiness() / (1 + game.getEffect("unhappinessRatio")),
      unhappinessReduction = unhappiness * game.getEffect("unhappinessRatio", true);
    var environmentEffect = game.village.getEnvironmentEffect();
    tooltip += $I("village.happiness.penalty") + ": -" +
      game.getDisplayValueExt(unhappiness + unhappinessReduction, false, false, 0) + "%<br>";
    tooltip += "* " + $I("village.happiness.penalty.base") + ": -" +
      game.getDisplayValueExt(unhappiness, false, false, 0) + "%<br>";
    tooltip += "* " + $I("village.happiness.penalty.mitigated") + ": " +
      game.getDisplayValueExt(-unhappinessReduction, false, false, 0) + "%<br>";
    tooltip += $I("village.happiness.environment") + ": " +
      game.getDisplayValueExt(environmentEffect, false, false, 0) + "%<br>";

    var overpopulation = game.village.getOverpopulation();
    if (overpopulation > 0) {
      tooltip += $I("village.happiness.overpopulation") + ": -" + overpopulation * 2 + "%<br>";
    }

    return tooltip;
  }

  return (
    <WToolbarIconContainer game={game} getTooltip={getTooltip} className="happiness">
      <div className="happinessText"
        dangerouslySetInnerHTML={{
          __html: Math.floor(game.village.happiness * 100) + "%"
        }}
      />
    </WToolbarIconContainer>
  );
}

/* ============================================================
 * WToolbarEnergy
 * ============================================================ */
function WToolbarEnergy(props) {
  var game = props.game;

  if (!game.science.get("electricity").researched) {
    return null;
  }

  var resPool = game.resPool;
  var className = "";
  if (resPool.energyProd < resPool.energyCons) {
    className = " warning";
  } else if (resPool.energyWinterProd < resPool.energyCons) {
    className = " warningWinter";
  }

  function getTooltip() {
    var energy = resPool.energyProd - resPool.energyCons;
    var delta = game.resPool.getEnergyDelta();
    var penalty = energy >= 0 ? "" :
      "<br><br>" + $I("navbar.energy.penalty") +
      "<span class='energyPenalty'>-" + Math.floor((1 - delta) * 100) + "%</span>";

    return $I("navbar.energy.prod.short") +
      " <span class='energyProduction'>" + game.getDisplayValueExt(resPool.energyProd, true, false) +
      $I("unit.watt") + "</span>" +
      "<br>" + $I("navbar.energy.cons.short") +
      " <span class='energyConsumption'>-" + game.getDisplayValueExt(resPool.energyCons) +
      $I("unit.watt") + "</span>" + penalty;
  }

  return (
    <WToolbarIconContainer game={game} getTooltip={getTooltip} className={"energy" + className}>
      <div className="energyText"
        dangerouslySetInnerHTML={{
          __html: game.getDisplayValueExt(resPool.energyProd - resPool.energyCons) + $I("unit.watt")
        }}
      />
    </WToolbarIconContainer>
  );
}

/* ============================================================
 * WToolbarMOTD
 * ============================================================ */
function WToolbarMOTD(props) {
  var game = props.game;
  var server = game.server;

  if (!server.showMotd || !server.motdTitle) {
    return null;
  }

  function getTooltip() {
    if (server.showMotd && server.motdContent) {
      server.motdFreshMessage = false;
      return "Message of the day:<br />" + server.motdContent;
    }
    return "";
  }

  return (
    <WToolbarIconContainer
      game={game}
      getTooltip={getTooltip}
      className={server.motdFreshMessage ? "freshMessage" : null}
    >
      <div dangerouslySetInnerHTML={{
        __html: "&nbsp;" + server.motdTitle + "&nbsp;"
      }} />
    </WToolbarIconContainer>
  );
}

/* ============================================================
 * WToolbarPollution
 * ============================================================ */
function WToolbarPollution(props) {
  var game = props.game;

  // Track fresh message state across renders
  var freshMessageRef = useRef(false);
  var messageRef = useRef("");

  // Get the full tooltip text (without side effects on freshMessage)
  function getTooltip() {
    var message = "";
    var eqPol = game.bld.getEquilibriumPollution();
    var eqPolLvl = game.bld.getPollutionLevel(eqPol);
    var pollution = game.bld.cathPollution;
    var polLvl = game.bld.getPollutionLevel();
    var polLvlShow = game.bld.getPollutionLevel(pollution * 2);

    if (polLvl >= 4) {
      message += $I("pollution.level1") + "<br/>" + $I("pollution.level2") + "<br/>" +
        $I("pollution.level3", [game.villageTab.getVillageTitle()]) + "<br/>" + $I("pollution.level4");
    } else if (polLvlShow === 3 || polLvl === 3) {
      message += $I("pollution.level1") + "<br/>" + $I("pollution.level2") + "<br/>" +
        $I("pollution.level3", [game.villageTab.getVillageTitle()]);
    } else if (polLvlShow === 2) {
      message += $I("pollution.level1") + "<br/>" + $I("pollution.level2");
    } else if (polLvlShow === 1) {
      message += $I("pollution.level1");
    } else {
      message = $I("pollution.level0");
    }

    var warnLvl = game.bld.getPollutionLevel(pollution * 4);
    if (warnLvl >= 1 && warnLvl <= 4 && warnLvl > polLvlShow && warnLvl <= eqPolLvl) {
      message += "<br/>" + $I("pollution.level" + warnLvl + ".warning");
    }
    if (pollution * 1.5 <= eqPol || eqPolLvl > polLvl) {
      message += "<br/>" + $I("pollution.increasing");
    } else if (pollution >= 0 && game.bld.cathPollutionPerTick <= 0 && eqPolLvl < polLvl) {
      message += "<br/>" + $I("pollution.cleaning");
    } else if (eqPolLvl === polLvl && eqPol > 0) {
      message += "<br/>" + $I("pollution.equilibrium");
    } else {
      message += "<br/>" + $I("pollution.pristine");
    }

    message += "<br/>CO₂: " + (game.science.get("ecology").researched ?
      getPollutionMod() : $I("pollution.unspecified"));
    freshMessageRef.current = false;
    return message;
  }

  function getTooltipLabel() {
    var message = "";
    var eqPol = game.bld.getEquilibriumPollution();
    var eqPolLvl = game.bld.getPollutionLevel(eqPol);
    var pollution = game.bld.cathPollution;
    var polLvl = game.bld.getPollutionLevel();
    var polLvlShow = game.bld.getPollutionLevel(pollution * 2);

    if (polLvl >= 4) {
      message += $I("pollution.level1") + "<br/>" + $I("pollution.level2") + "<br/>" +
        $I("pollution.level3", [game.villageTab.getVillageTitle()]) + "<br/>" + $I("pollution.level4");
    } else if (polLvlShow === 3 || polLvl === 3) {
      message += $I("pollution.level1") + "<br/>" + $I("pollution.level2") + "<br/>" +
        $I("pollution.level3", [game.villageTab.getVillageTitle()]);
    } else if (polLvlShow === 2) {
      message += $I("pollution.level1") + "<br/>" + $I("pollution.level2");
    } else if (polLvlShow === 1) {
      message += $I("pollution.level1");
    } else {
      message = $I("pollution.level0");
    }

    var warnLvl = game.bld.getPollutionLevel(pollution * 4);
    if (warnLvl >= 1 && warnLvl <= 4 && warnLvl > polLvlShow && warnLvl <= eqPolLvl) {
      message += "<br/>" + $I("pollution.level" + warnLvl + ".warning");
    }
    if (pollution * 1.5 <= eqPol || eqPolLvl > polLvl) {
      message += "<br/>" + $I("pollution.increasing");
    } else if (pollution >= 0 && game.bld.cathPollutionPerTick <= 0 && eqPolLvl < polLvl) {
      message += "<br/>" + $I("pollution.cleaning");
    } else if (eqPolLvl === polLvl && eqPol > 0) {
      message += "<br/>" + $I("pollution.equilibrium");
    } else {
      message += "<br/>" + $I("pollution.pristine");
    }

    return message;
  }

  function getPollutionMod() {
    return game.getDisplayValueExt(
      (game.bld.cathPollution / game.bld.getPollutionLevelBase()) * 100
    ) + "ppm";
  }

  function getFreshMessage() {
    var msg = getTooltipLabel();
    if (messageRef.current !== msg) {
      freshMessageRef.current = messageRef.current !== "";
      messageRef.current = msg;
    }
    return freshMessageRef.current;
  }

  if (game.bld.cathPollution > 100000 || game.science.get("ecology").researched) {
    return (
      <WToolbarIconContainer
        game={game}
        getTooltip={getTooltip}
        className={"pollutionIcon" + (getFreshMessage() ? " energy warning" : "")}
      >
        <div className="pollutionText">
          {game.science.get("ecology").researched ? getPollutionMod() : " "}
        </div>
      </WToolbarIconContainer>
    );
  }
  return null;
}

/* ============================================================
 * WToolbarFPS
 * ============================================================ */
function WToolbarFPS(props) {
  var game = props.game;

  if (!game.isLocalhost) {
    return null;
  }

  function getTooltip() {
    var fps = game.fps;
    return " avg: " + fps.avg.toFixed() +
      " ms [" + fps.avg0.toFixed() +
      "." + fps.avg1.toFixed() +
      "." + fps.avg2.toFixed() +
      "." + fps.avg3.toFixed() +
      "." + fps.avg4.toFixed() + "] (Cl. to res.)";
  }

  return (
    <WToolbarIconContainer game={game} getTooltip={getTooltip}>
      <div>{"fps: " + game.fps.ms + " ms"}</div>
    </WToolbarIconContainer>
  );
}

/* ============================================================
 * WBLS
 * ============================================================ */
function WBLS(props) {
  var game = props.game;
  var sorrowRes = game.resPool.get("sorrow");
  var sorrow = sorrowRes.value;

  if (!sorrow) {
    return null;
  }
  var isMax = (sorrowRes.value === sorrowRes.maxValue);

  function getTooltip() {
    return $I("resources.sorrow.full");
  }

  return (
    <WToolbarIconContainer
      game={game}
      getTooltip={getTooltip}
      className={"sorrow" + (isMax ? " max" : "")}
    >
      <div>{$I("resources.sorrow.short") + ": " + sorrow.toFixed() + "%"}</div>
    </WToolbarIconContainer>
  );
}

/* ============================================================
 * WLoginForm
 * ============================================================ */
function WLoginForm(props) {
  var [loginState, setLoginState] = useState({ login: null, password: null, error: null, isLoading: false });

  var setLogin = useCallback(function (e) {
    e.stopPropagation();
    if (e.nativeEvent) e.nativeEvent.stopImmediatePropagation();
    setLoginState(function (prev) { return { ...prev, login: e.target.value }; });
  }, []);

  var setPassword = useCallback(function (e) {
    e.stopPropagation();
    if (e.nativeEvent) e.nativeEvent.stopImmediatePropagation();
    setLoginState(function (prev) { return { ...prev, password: e.target.value }; });
  }, []);

  function login() {
    setLoginState(function (prev) { return { ...prev, isLoading: true }; });
    $.ajax({
      cache: false,
      type: "POST",
      dataType: "JSON",
      data: {
        email: loginState.login,
        password: loginState.password
      },
      xhrFields: { withCredentials: true },
      url: props.game.server.getServerUrl() + "/user/login/",
    }).done(function (resp) {
      if (resp.id) {
        props.game.server.setUserProfile(resp);
      }
    }).fail(function (resp, status) {
      console.error("something went wrong, resp:", resp, status);
      setLoginState(function (prev) { return { ...prev, error: resp.responseText }; });
    }).always(function () {
      setLoginState(function (prev) { return { ...prev, isLoading: false }; });
    });
  }

  if (loginState.isLoading) {
    return <span>Loading...</span>;
  }

  var game = props.game;
  if (game.server.userProfile) {
    var userProfile = game.server.userProfile;
    return (
      <div className="userProfile">
        <img src={"https://www.gravatar.com/avatar/" +
          (userProfile.email ? md5(userProfile.email) : "n/a") + "?s=15"} />
        <a href="/ui/profile" target="_blank">{userProfile.id}</a>
      </div>
    );
  }

  return (
    <span onClick={function (e) { e.stopPropagation(); }}>
      <div className="row">
        Email:
        <input type="email" onChange={setLogin} value={loginState.login || ""} />
        Password:
        <input type="password" onChange={setPassword} value={loginState.password || ""} />
      </div>
      <div className="row">
        <a href="#" onClick={login}>login</a>
        <a target="_blank" href="http://kittensgame.com/ui/register">register</a>
      </div>
      {loginState.error && (
        <div className="row">
          <span className="error">{loginState.error}</span>
        </div>
      )}
    </span>
  );
}

/* ============================================================
 * WCloudSaveRecord
 * ============================================================ */
function WCloudSaveRecord(props) {
  var [saveState, setSaveState] = useState({
    showActions: false,
    isEditable: false,
    label: props.save.label
  });
  // Force update counter for async operations
  var [, forceUpdate] = useState(0);

  function bytesToSize(bytes) {
    var sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    if (bytes === 0) return '0 Byte';
    var i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i), 2) + ' ' + sizes[i];
  }

  var game = props.game;
  var save = props.save;
  var isActiveSave = (save.guid === game.telemetry.guid);
  var guid = save.guid;

  return (
    <div className={"save-record " + (save.archived ? "archived" : "")}>
      <div className="save-record-cell">
        {saveState.isEditable ? (
          <input
            onClick={function (e) { e.stopPropagation(); }}
            onChange={function (e) {
              setSaveState(function (prev) { return { ...prev, label: e.target.value }; });
            }}
            onKeyPress={function (e) {
              if (e.key === 'Enter') {
                game.server.pushSaveMetadata(save.guid, { label: saveState.label })
                  .then(function () {
                    forceUpdate(function (n) { return n + 1; });
                  });
                setSaveState(function (prev) { return { ...prev, isEditable: false }; });
              }
            }}
            value={saveState.label}
          />
        ) : (
          <a href="#" onClick={function (e) {
            e.stopPropagation();
            setSaveState(function (prev) { return { ...prev, isEditable: !prev.isEditable }; });
          }}>
            {save.label || guid.substring(guid.length - 4, guid.length)}
          </a>
        )}
        {isActiveSave ? "[" + $I("ui.kgnet.save.current") + "]" : ""}
      </div>
      <div className="save-record-cell">
        {save.index
          ? ("Year " + save.index.calendar.year + ", day " + save.index.calendar.day)
          : "loading..."}
      </div>
      <div className="save-record-cell">
        {new Date(save.timestamp).toLocaleDateString("en-US", {
          month: 'long', day: 'numeric', hour: 'numeric', minute: 'numeric', hourCycle: "h24"
        })}
      </div>
      <div className="save-record-cell">{bytesToSize(save.size)}</div>
      {isActiveSave && (
        <a className="link"
          title="Upload your current game save to the server (this will overwrite your old cloud save)"
          onClick={function (e) {
            e.stopPropagation();
            game.ui.confirm("[S]ave", "This will override [SERVER] save. Y/N", function () {
              game.server.pushSave();
            });
          }}>
          {$I("ui.kgnet.save.save")}
        </a>
      )}
      <a className="link"
        title="Download a cloud save and apply it to your game (your current data will be lost)"
        onClick={function (e) {
          e.stopPropagation();
          game.ui.confirm("[L]oad", "This will override [LOCAL] save. Y/N", function () {
            game.server.loadSave(save.guid);
          });
        }}>
        {$I("ui.kgnet.save.load")}
      </a>
      <a className="link" href="#"
        onClick={function (e) {
          e.stopPropagation();
          setSaveState(function (prev) { return { ...prev, showActions: !prev.showActions }; });
        }}>
        ..
      </a>
      {saveState.showActions && (
        <a href="#"
          onClick={function (e) {
            e.stopPropagation();
            setSaveState(function (prev) { return { ...prev, isEditable: !prev.isEditable }; });
          }}>
          edit
        </a>
      )}
      {saveState.showActions && (
        <a href="#" onClick={function (e) {
          e.stopPropagation();
          game.server.pushSaveMetadata(save.guid, { archived: !save.archived })
            .then(function () {
              forceUpdate(function (n) { return n + 1; });
            });
        }}>
          archive
        </a>
      )}
    </div>
  );
}

/* ============================================================
 * WCloudSaves
 * ============================================================ */
function WCloudSaves(props) {
  var [isLoading, setIsLoading] = useState(false);
  var game = props.game;

  if (!game.server.userProfile) {
    return null;
  }

  var saveData = game.server.saveData;
  var hasActiveSaves = false;
  if (saveData && saveData.length) {
    for (var i in saveData) {
      if (saveData[i].guid === game.telemetry.guid) {
        hasActiveSaves = true;
      }
    }
  }

  return (
    <div>
      <div className="save-record-container">
        {saveData && (
          <div className="save-record header">
            <div className="save-record-cell">Id</div>
            <div className="save-record-cell">Save</div>
            <div className="save-record-cell">Last update</div>
            <div className="save-record-cell">Size</div>
            <div className="save-record-cell">Actions</div>
          </div>
        )}
        {saveData && saveData.map(function (save, idx) {
          return <WCloudSaveRecord key={idx} save={save} game={game} />;
        })}
      </div>
      <div className="save-record-container">
        {(saveData && !hasActiveSaves) && (
          <div className="save-record">
            <a href="#" onClick={function (e) {
              e.stopPropagation();
              game.server.pushSave();
            }}>
              Create new save ({game.telemetry.guid})
            </a>
          </div>
        )}
        <div className="save-record">
          <a className="link" href="#"
            title="Fetch the latest information about your cloud saves from the server."
            onClick={function (e) {
              e.stopPropagation();
              setIsLoading(true);
              game.server.syncSaveData().always(function () {
                setIsLoading(false);
              });
            }}>
            {isLoading ? "[loading..]" : ""}
            {$I("ui.kgnet.sync")}
          </a>
          <span style={{ paddingTop: "10px" }}>{$I("ui.kgnet.instructional")}</span>
        </div>
      </div>
    </div>
  );
}

/* ============================================================
 * WLogin
 * ============================================================ */
function WLogin(props) {
  var [isExpanded, setIsExpanded] = useState(false);
  var game = props.game;

  var lastBackup = (new Date().getTime() - game.lastBackup) / (1000 * 60 * 60 * 24);

  return (
    <WToolbarIconContainer game={game}>
      <div onClick={function () { setIsExpanded(function (v) { return !v; }); }}>
        <span className={"kgnet-login-link status-indicator-" +
          (game.server.userProfile ? "online" : "offline") +
          (lastBackup >= 7 ? " freshMessage" : "")}>
          {"* " + (game.server.userProfile ? $I("ui.kgnet.online") : $I("ui.kgnet.login"))}
        </span>
        {isExpanded && (
          <div className="login-popup button_tooltip tooltip-block">
            <div>
              <div className="last-backup">
                {lastBackup >= 7 && <span className="hazard" />}
                {"Last backup: " + lastBackup.toFixed(1) + " days ago"}
                {lastBackup >= 7 && <span className="hazard" />}
              </div>
              <WLoginForm game={game} />
              <WCloudSaves game={game} />
            </div>
          </div>
        )}
      </div>
    </WToolbarIconContainer>
  );
}

/* ============================================================
 * WToolbar — main toolbar
 * ============================================================ */
function WToolbar(props) {
  var [toolbarState, setToolbarState] = useState({ game: props.game, updateTick: 0 });
  var lastToolbarUpdate = useRef(0);

  useEffect(function () {
    var handler = dojo.subscribe("ui/update", function (game) {
      var now = Date.now();
      if (now - lastToolbarUpdate.current < 200) return;
      lastToolbarUpdate.current = now;
      setToolbarState(function (prev) { return { game: game, updateTick: prev.updateTick + 1 }; });
    });
    return function () { dojo.unsubscribe(handler); };
  }, []);

  function getIcons() {
    var curGame = toolbarState.game;
    var icons = [];
    icons.push(
      <WToolbarFPS key="fps" game={curGame} />,
      curGame.opts.disablePollution ? null : <WToolbarPollution key="pollution" game={curGame} />,
      <WToolbarHappiness key="happiness" game={curGame} />,
      <WToolbarEnergy key="energy" game={curGame} />,
      <WBLS key="bls" game={curGame} />,
      <WToolbarMOTD key="motd" game={curGame} />,
      <WLogin key="login" game={curGame} />
    );
    return icons;
  }

  return (
    <div className="icons-container">
      {getIcons()}
    </div>
  );
}

export {
  WToolbarIconContainer, WToolbarHappiness, WToolbarEnergy,
  WToolbarMOTD, WToolbarPollution, WToolbarFPS,
  WBLS, WLoginForm, WCloudSaveRecord, WCloudSaves,
  WLogin, WToolbar
};
window.WToolbarIconContainer = WToolbarIconContainer;
window.WToolbarHappiness = WToolbarHappiness;
window.WToolbarEnergy = WToolbarEnergy;
window.WToolbarMOTD = WToolbarMOTD;
window.WToolbarPollution = WToolbarPollution;
window.WToolbarFPS = WToolbarFPS;
window.WBLS = WBLS;
window.WLoginForm = WLoginForm;
window.WCloudSaveRecord = WCloudSaveRecord;
window.WCloudSaves = WCloudSaves;
window.WLogin = WLogin;
window.WToolbar = WToolbar;
