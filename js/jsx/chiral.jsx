import React, { useState, useEffect, useRef, useCallback } from 'react';

/**
 * WTerminal — command-line input component (stays as createClass-compatible pattern)
 */
function WTerminal(props) {
  const bashRef = useRef(null);
  const [command, setCommandState] = useState(null);
  const inputRef = useRef(null);

  useEffect(() => {
    bashRef.current = new classes.Bash({
      "help": { exec: function () { } },
      "work": {},
      "build": {},
      "sell": {}
    });
  }, []);

  var setCommand = useCallback(function (e) {
    e.stopPropagation();
    if (e.nativeEvent) e.nativeEvent.stopImmediatePropagation();
    setCommandState(e.target.value);
  }, []);

  function attemptAutocomplete() {
    var suggestion = bashRef.current.autocomplete(command || "");
    if (suggestion) setCommandState(suggestion);
  }

  function handleKeyDown(evt) {
    if (evt.which === 9) {
      attemptAutocomplete();
      evt.preventDefault();
    } else if (evt.which === 13) {
      doSubmit();
      evt.preventDefault();
    }
  }

  function doSubmit() {
    props.onSubmit(command);
  }

  return (
    <div>
      <input
        type="text"
        ref={inputRef}
        autoComplete="off"
        onKeyDown={handleKeyDown}
        onChange={setCommand}
        value={command || ""}
        placeholder="Type 'help' to see the list of all commands"
        style={{ width: "500px" }}
      />
      <a className="link" onClick={doSubmit}>send</a>
    </div>
  );
}

/**
 * WChiral — End of the Universe chiral terminal panel
 */
function WChiral(props) {
  const [gameState, setGameState] = useState(props.game);

  useEffect(() => {
    var handler = dojo.subscribe("ui/update", function (game) {
      setGameState(game);
    });
    return function () {
      dojo.unsubscribe(handler);
    };
  }, []);

  function sendCommand(command) {
    gameState.server.sendCommand(command);
  }

  var fr = gameState.space.getPlanet("furthestRing");
  if (!fr.reached) {
    return null;
  }

  if (gameState.server.userProfile) {
    return (
      <div>
        <div className="row">An alien machine lies here at the End of the Universe.</div>
        <div className="row">666 nodes online</div>
        <div className="row">
          <pre style={{ whiteSpace: "pre-wrap" }}>
            {gameState.server.chiral || ">"}
          </pre>
        </div>
        <div className="row">
          <WTerminal onSubmit={sendCommand} />
        </div>
      </div>
    );
  } else {
    return <div>The furthest ring is empty and silent</div>;
  }
}

export { WTerminal, WChiral };
window.WTerminal = WTerminal;
window.WChiral = WChiral;
