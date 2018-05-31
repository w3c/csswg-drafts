/* Spatial Navigation API Polyfill v0.1
* : API for Spatial Navigation
*   - 'spatial-navigation-contain' CSS Property
*
* Copyright 2018 LG Electronics Inc. All rights reserved.
*
* https://github.com/WICG/spatial-navigation
* https://wicg.github.io/spatial-navigation
*/

;(function (window, document, undefined) {

  'use strict';

  /**
   * @param {Element} el
   */
  function addSpatNavContain(el) {
    if (el.classList.contains('spatnav-contain')) {
      return;
    }
    el.classList.add('spatnav-contain');
    el.setAttribute('data-spatnav-contain-created', '');
  }

  /**
   * @param {Element} el
   */
  function removeSpatNavContain(el) {
    if (!el.hasAttribute('data-spatnav-contain-created')) {
      return;
    }
    el.classList.remove('spatnav-contain');
    el.removeAttribute('data-spatnav-contain-created');
  }

  function Rule(rule) {
    this._rule = rule
  }

  Rule.prototype.getDeclaration = function() {
    var styles = {}
      , i = 0
      , declaration
      , declarations = this._rule.declarations
    while (declaration = declarations[i++]) {
      styles[declaration.property] = declaration.value
    }
    return styles
  }


  function SpatnavAPI(options) {

    if (!(this instanceof SpatnavAPI)) return new SpatnavAPI(options)

    // set the options
    this._options = options;

    // allow the keywords option to be the only object passed
    //if (!options.keywords) this._options = { keywords: options }
  }

  SpatnavAPI.prototype.isCSSSpatNavContain = function(el) {
    if (el.classList.contains('spatnav-contain')) return true;
    else return false;
  }

  /**
  * Support the NavigatoinEvent: navbeforefocus, navbeforescroll, navnotarget
  *
  * Reference: https://wicg.github.io/spatial-navigation/#events-navigationevent
  **/

  SpatnavAPI.prototype.createNavEvents = function(option, element, direction) {
    let data_ = {
      relatedTarget: element,
      dir: direction
    };

    switch (option) {
      case 'beforefocus':
        let navbeforefocus_event = document.createEvent("CustomEvent");
        if (typeof spatnavPolyfillOptions == "object" && spatnavPolyfillOptions.standardName) {
          navbeforefocus_event.initCustomEvent("navbeforefocus", true, true, data_);
        } else {
          navbeforefocus_event.initCustomEvent("navbeforefocusPolyfill", true, true, data_);
        }
        element.dispatchEvent(navbeforefocus_event);
        break;

      case 'beforescroll':
        let navbeforescroll_event = document.createEvent("CustomEvent");
        if (typeof spatnavPolyfillOptions == "object" && spatnavPolyfillOptions.standardName) {
          navbeforescroll_event.initCustomEvent("navbeforescroll", true, true, data_);
        } else {
          navbeforescroll_event.initCustomEvent("navbeforescrollPolyfill", true, true, data_);
        }
        element.dispatchEvent(navbeforescroll_event);
        break;

      case 'notarget':
        let navnotarget_event = document.createEvent("CustomEvent");
        if (typeof spatnavPolyfillOptions == "object" && spatnavPolyfillOptions.standardName) {
          navnotarget_event.initCustomEvent("navnotarget", true, true, data_);
        } else {
          navnotarget_event.initCustomEvent("navnotargetPolyfill", true, true, data_);
        }
        element.dispatchEvent(navnotarget_event);
        break;
    }
  }

  SpatnavAPI.constructors = {
    Rule: Rule
  }

  window.SpatnavAPI = SpatnavAPI

})(window, document);
