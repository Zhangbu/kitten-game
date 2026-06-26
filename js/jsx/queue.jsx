import React, { useState, useEffect, useRef, useCallback } from 'react';

/**
 * WQueueItem — single queue entry with remove/push controls
 */
function WQueueItem(props) {
  const itemLabelRef = useRef(null);

  useEffect(() => {
    attachTooltip();
  }, []);

  function attachTooltip() {
    var item = props.item;
    var node = itemLabelRef.current;
    if (item.type !== "buildings" || !node) return;

    var controller = new classes.ui.btn.BuildingBtnModernController(window.game);
    var model = controller.fetchModel({
      building: item.name,
      key: item.name,
    });
    UIUtils.attachTooltip(window.game, node, 0, 200, dojo.partial(ButtonModernHelper.getTooltipHTML, controller, model));
  }

  const pushBack = useCallback(function () {
    props.queueManager.pushBack(props.index);
  }, [props.index, props.queueManager]);

  const pushFront = useCallback(function () {
    props.queueManager.pushFront(props.index);
  }, [props.index, props.queueManager]);

  const removeOne = useCallback(function () {
    props.queueManager.remove(props.index, 1);
  }, [props.index, props.queueManager]);

  const removeAll = useCallback(function () {
    props.queueManager.remove(props.index, props.item.value);
  }, [props.index, props.item, props.queueManager]);

  var item = props.item;
  var buttons = [
    <a key="rm1" href="#" onClick={removeOne}>[-]</a>
  ];

  if (item.value) {
    buttons.push(<a key="rmAll" href="#" onClick={removeAll}>[x]</a>);
  }

  if (!props.isLast) {
    buttons.push(<a key="pushBack" href="#" onClick={pushBack}>[↓]</a>);
  }

  if (props.index > 0) {
    buttons.push(<a key="pushFront" href="#" onClick={pushFront}>[↑]</a>);
  }

  return (
    <div>
      {"[" + item.type + "] - "}
      <span ref={itemLabelRef} className="queue-label">{item.label}</span>
      {item.value ? (" " + item.value) : ""}
      {buttons}
    </div>
  );
}

/**
 * WQueue — queue manager panel with type/item selects
 */
function WQueue(props) {
  const [state, setState] = useState({
    typeId: "buildings",
    itemId: null,
    itemLabel: null,
  });

  // Subscribe to ui/update
  var game = window.game;

  useEffect(() => {
    var handler = dojo.subscribe("ui/update", function () {
      setState(function (prev) { return { ...prev }; });
    });
    return function () {
      dojo.unsubscribe(handler);
    };
  }, []);

  function getQueueTypeSelect() {
    var options = [];
    var queueSources = window.game.time.queue.queueSourcesArr;
    for (var i in queueSources) {
      options.push(
        <option key={queueSources[i].name} value={queueSources[i].name}>
          {queueSources[i].label}
        </option>
      );
    }
    return (
      <select value={state.typeId} onChange={function (e) {
        var typeId = e.target.value;
        setState(function (prev) { return { ...prev, typeId: typeId }; });
        var opts = window.game.time.queue.getQueueOptions(typeId);
        if (opts.length) {
          setState(function (prev) {
            return { ...prev, itemId: 0, itemLabel: opts[0].label };
          });
        }
      }}>
        {options}
      </select>
    );
  }

  function getQueueItemSelect(options) {
    var selectOpts = [];
    for (var i in options) {
      var option = options[i];
      selectOpts.push(
        <option key={i} value={i} data-label={option.label}>{option.label}</option>
      );
    }
    if (!options.length) {
      selectOpts.push(<option key="-" value="">-</option>);
    }
    return (
      <select value={state.itemId != null ? state.itemId : ""} onChange={function (e) {
        setState(function (prev) {
          return {
            ...prev,
            itemId: e.target.value,
            itemLabel: options[e.target.value].label
          };
        });
      }}>
        {selectOpts}
      </select>
    );
  }

  function getQueueItems() {
    var queueManager = window.game.time.queue;
    var queueItems = queueManager.queueItems;
    var items = [];
    for (var i = 0; i < queueItems.length; i++) {
      var item = queueItems[i];
      if (!item) {
        items.push(<div key={"null-" + i}>&lt;unknown&gt;</div>);
        continue;
      }
      items.push(
        <WQueueItem
          key={i}
          item={item}
          index={i}
          isLast={i === queueItems.length - 1}
          queueManager={queueManager}
        />
      );
    }
    return <div>{items}</div>;
  }

  function toggleAlphabetical() {
    window.game.time.queue.toggleAlphabeticalSort();
    setState(function (prev) { return { ...prev }; });
  }

  var typeId = state.typeId;
  var options = window.game.time.queue.getQueueOptions(typeId);

  return (
    <div className="queue-container">
      {getQueueTypeSelect()}
      {getQueueItemSelect(options)}
      <button onClick={function (e) {
        if (state.itemId != null) {
          window.game.time.queue.addToQueue(
            options[state.itemId].name,
            state.typeId,
            state.itemLabel,
            e.shiftKey
          );
        } else if (options.length) {
          window.game.time.queue.addToQueue(
            options[0].name,
            state.typeId,
            options[0].label,
            e.shiftKey
          );
        }
        setState(function (prev) { return { ...prev }; });
      }}>
        Add to queue
      </button>
      <div className="alphabetical-toggle">
        <input type="checkbox"
          defaultChecked={window.game.time.queue.alphabeticalSort}
          onClick={toggleAlphabetical}
          style={{ display: "inline-block" }}
        />
        {$I("queue.alphabeticalToggle")}
      </div>
      {getQueueItems()}
    </div>
  );
}

export { WQueueItem, WQueue };
window.WQueueItem = WQueueItem;
window.WQueue = WQueue;
