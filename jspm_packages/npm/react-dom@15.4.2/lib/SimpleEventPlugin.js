/* */ 
(function(process) {
  'use strict';
  var _prodInvariant = require('./reactProdInvariant');
  var EventListener = require('fbjs/lib/EventListener');
  var EventPropagators = require('./EventPropagators');
  var ReactDOMComponentTree = require('./ReactDOMComponentTree');
  var SyntheticAnimationEvent = require('./SyntheticAnimationEvent');
  var SyntheticClipboardEvent = require('./SyntheticClipboardEvent');
  var SyntheticEvent = require('./SyntheticEvent');
  var SyntheticFocusEvent = require('./SyntheticFocusEvent');
  var SyntheticKeyboardEvent = require('./SyntheticKeyboardEvent');
  var SyntheticMouseEvent = require('./SyntheticMouseEvent');
  var SyntheticDragEvent = require('./SyntheticDragEvent');
  var SyntheticTouchEvent = require('./SyntheticTouchEvent');
  var SyntheticTransitionEvent = require('./SyntheticTransitionEvent');
  var SyntheticUIEvent = require('./SyntheticUIEvent');
  var SyntheticWheelEvent = require('./SyntheticWheelEvent');
  var emptyFunction = require('fbjs/lib/emptyFunction');
  var getEventCharCode = require('./getEventCharCode');
  var invariant = require('fbjs/lib/invariant');
  var eventTypes = {};
  var topLevelEventsToDispatchConfig = {};
  ['abort', 'animationEnd', 'animationIteration', 'animationStart', 'blur', 'canPlay', 'canPlayThrough', 'click', 'contextMenu', 'copy', 'cut', 'doubleClick', 'drag', 'dragEnd', 'dragEnter', 'dragExit', 'dragLeave', 'dragOver', 'dragStart', 'drop', 'durationChange', 'emptied', 'encrypted', 'ended', 'error', 'focus', 'input', 'invalid', 'keyDown', 'keyPress', 'keyUp', 'load', 'loadedData', 'loadedMetadata', 'loadStart', 'mouseDown', 'mouseMove', 'mouseOut', 'mouseOver', 'mouseUp', 'paste', 'pause', 'play', 'playing', 'progress', 'rateChange', 'reset', 'scroll', 'seeked', 'seeking', 'stalled', 'submit', 'suspend', 'timeUpdate', 'touchCancel', 'touchEnd', 'touchMove', 'touchStart', 'transitionEnd', 'volumeChange', 'waiting', 'wheel'].forEach(function(event) {
    var capitalizedEvent = event[0].toUpperCase() + event.slice(1);
    var onEvent = 'on' + capitalizedEvent;
    var topEvent = 'top' + capitalizedEvent;
    var type = {
      phasedRegistrationNames: {
        bubbled: onEvent,
        captured: onEvent + 'Capture'
      },
      dependencies: [topEvent]
    };
    eventTypes[event] = type;
    topLevelEventsToDispatchConfig[topEvent] = type;
  });
  var onClickListeners = {};
  function getDictionaryKey(inst) {
    return '.' + inst._rootNodeID;
  }
  function isInteractive(tag) {
    return tag === 'button' || tag === 'input' || tag === 'select' || tag === 'textarea';
  }
  var SimpleEventPlugin = {
    eventTypes: eventTypes,
    extractEvents: function(topLevelType, targetInst, nativeEvent, nativeEventTarget) {
      var dispatchConfig = topLevelEventsToDispatchConfig[topLevelType];
      if (!dispatchConfig) {
        return null;
      }
      var EventConstructor;
      switch (topLevelType) {
        case 'topAbort':
        case 'topCanPlay':
        case 'topCanPlayThrough':
        case 'topDurationChange':
        case 'topEmptied':
        case 'topEncrypted':
        case 'topEnded':
        case 'topError':
        case 'topInput':
        case 'topInvalid':
        case 'topLoad':
        case 'topLoadedData':
        case 'topLoadedMetadata':
        case 'topLoadStart':
        case 'topPause':
        case 'topPlay':
        case 'topPlaying':
        case 'topProgress':
        case 'topRateChange':
        case 'topReset':
        case 'topSeeked':
        case 'topSeeking':
        case 'topStalled':
        case 'topSubmit':
        case 'topSuspend':
        case 'topTimeUpdate':
        case 'topVolumeChange':
        case 'topWaiting':
          EventConstructor = SyntheticEvent;
          break;
        case 'topKeyPress':
          if (getEventCharCode(nativeEvent) === 0) {
            return null;
          }
        case 'topKeyDown':
        case 'topKeyUp':
          EventConstructor = SyntheticKeyboardEvent;
          break;
        case 'topBlur':
        case 'topFocus':
          EventConstructor = SyntheticFocusEvent;
          break;
        case 'topClick':
          if (nativeEvent.button === 2) {
            return null;
          }
        case 'topDoubleClick':
        case 'topMouseDown':
        case 'topMouseMove':
        case 'topMouseUp':
        case 'topMouseOut':
        case 'topMouseOver':
        case 'topContextMenu':
          EventConstructor = SyntheticMouseEvent;
          break;
        case 'topDrag':
        case 'topDragEnd':
        case 'topDragEnter':
        case 'topDragExit':
        case 'topDragLeave':
        case 'topDragOver':
        case 'topDragStart':
        case 'topDrop':
          EventConstructor = SyntheticDragEvent;
          break;
        case 'topTouchCancel':
        case 'topTouchEnd':
        case 'topTouchMove':
        case 'topTouchStart':
          EventConstructor = SyntheticTouchEvent;
          break;
        case 'topAnimationEnd':
        case 'topAnimationIteration':
        case 'topAnimationStart':
          EventConstructor = SyntheticAnimationEvent;
          break;
        case 'topTransitionEnd':
          EventConstructor = SyntheticTransitionEvent;
          break;
        case 'topScroll':
          EventConstructor = SyntheticUIEvent;
          break;
        case 'topWheel':
          EventConstructor = SyntheticWheelEvent;
          break;
        case 'topCopy':
        case 'topCut':
        case 'topPaste':
          EventConstructor = SyntheticClipboardEvent;
          break;
      }
      !EventConstructor ? process.env.NODE_ENV !== 'production' ? invariant(false, 'SimpleEventPlugin: Unhandled event type, `%s`.', topLevelType) : _prodInvariant('86', topLevelType) : void 0;
      var event = EventConstructor.getPooled(dispatchConfig, targetInst, nativeEvent, nativeEventTarget);
      EventPropagators.accumulateTwoPhaseDispatches(event);
      return event;
    },
    didPutListener: function(inst, registrationName, listener) {
      if (registrationName === 'onClick' && !isInteractive(inst._tag)) {
        var key = getDictionaryKey(inst);
        var node = ReactDOMComponentTree.getNodeFromInstance(inst);
        if (!onClickListeners[key]) {
          onClickListeners[key] = EventListener.listen(node, 'click', emptyFunction);
        }
      }
    },
    willDeleteListener: function(inst, registrationName) {
      if (registrationName === 'onClick' && !isInteractive(inst._tag)) {
        var key = getDictionaryKey(inst);
        onClickListeners[key].remove();
        delete onClickListeners[key];
      }
    }
  };
  module.exports = SimpleEventPlugin;
})(require('process'));
