/* Spatial Navigation API Polyfill v0.1
* : API for Spatial Navigation
*   - 'spatial-navigation-contain' CSS Property
*
* Copyright 2018 LG Electronics Inc. All rights reserved.
*
* https://github.com/WICG/spatial-navigation
* https://wicg.github.io/spatial-navigation
*/

(function () {

  'use strict';
  function SpatnavAPI(options) {

    if (!(this instanceof SpatnavAPI)) return new SpatnavAPI(options);

    // set the options
    this._options = options;
  }

  /**
  * CSS.registerProperty() from the Properties and Values API
  * Reference: https://drafts.css-houdini.org/css-properties-values-api/#the-registerproperty-function
  */
  if (window.CSS && CSS.registerProperty) {
    console.log("registerProperty is available");
    CSS.registerProperty({
      name: '--spatial-navigation-contain',
      syntax: 'auto | contain',
      inherits: false,
      initialValue: 'auto'
    });
  }

  /**
  * Gives a CSS custom property value applied at the element
  * @function
  * @param
  * element {Element}
  * varName {String} without '--'
  */
  function readCssVar (element, varName) {
    const elementStyles = getComputedStyle(element);
    return elementStyles.getPropertyValue(`--${varName}`).trim();
  }

  SpatnavAPI.prototype.isCSSSpatNavContain = function(el) {
    if (readCssVar(el, 'spatial-navigation-contain') == 'contain') return true;
    else return false;
  };

  /**
  * Support the NavigatoinEvent: navbeforefocus, navbeforescroll, navnotarget
  *
  * Reference: https://wicg.github.io/spatial-navigation/#events-navigationevent
  **/
  SpatnavAPI.prototype.createNavEvents = function(option, element, direction) {
    const data_ = {
      relatedTarget: element,
      dir: direction
    };

    switch (option) {
    case 'beforefocus':
      const navbeforefocus_event = document.createEvent('CustomEvent');
      if (typeof spatnavPolyfillOptions == 'object' && spatnavPolyfillOptions.standardName) {
        navbeforefocus_event.initCustomEvent('navbeforefocus', true, true, data_);
      } else {
        navbeforefocus_event.initCustomEvent('navbeforefocusPolyfill', true, true, data_);
      }
      element.dispatchEvent(navbeforefocus_event);
      break;

    case 'beforescroll':
      const navbeforescroll_event = document.createEvent('CustomEvent');
      if (typeof spatnavPolyfillOptions == 'object' && spatnavPolyfillOptions.standardName) {
        navbeforescroll_event.initCustomEvent('navbeforescroll', true, true, data_);
      } else {
        navbeforescroll_event.initCustomEvent('navbeforescrollPolyfill', true, true, data_);
      }
      element.dispatchEvent(navbeforescroll_event);
      break;

    case 'notarget':
      const navnotarget_event = document.createEvent('CustomEvent');
      if (typeof spatnavPolyfillOptions == 'object' && spatnavPolyfillOptions.standardName) {
        navnotarget_event.initCustomEvent('navnotarget', true, true, data_);
      } else {
        navnotarget_event.initCustomEvent('navnotargetPolyfill', true, true, data_);
      }
      element.dispatchEvent(navnotarget_event);
      break;
    }
  };

  SpatnavAPI.constructors = {};

  window.SpatnavAPI = SpatnavAPI;

})(window, document);
