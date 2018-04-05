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

  function matchesDeclaration(rule, media, supports) {
    if (!keywords.declarations) return
    var declaration
      , i = 0
    while (declaration = rule.declarations[i++]) {
      if (matchesKeywordPattern(declaration, keywords.declarations)) {
        addRule({
          media: media,
          supports: supports,
          selectors: rule.selectors,
          declarations: rule.declarations
        })
        return true
      }
    }
  }

  /**
   * Add the `focus-visible` class to the given element if it was not added by
   * the author.
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
   * Remove the `focus-visible` class from the given element if it was not
   * originally added by the author.
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
    this._options = options

    // allow the keywords option to be the only object passed
    //if (!options.keywords) this._options = { keywords: options }
  }

  SpatnavAPI.prototype.isCSSSpatNavContain = function(el) {
    if (el.classList.contains('spatnav-contain')) return true;
    else return false;
  }

  SpatnavAPI.prototype.filterCSSByKeywords = function() {
    this._defer(
      function() {
        return this._stylesheets
          && this._stylesheets.length
          && this._stylesheets[0].rules
      },
      function() {
        var stylesheet
          , rules = []
          , i = 0
        while (stylesheet = this._stylesheets[i++]) {
          rules = rules.concat(stylesheet.rules)
        }
        this._filteredRules = StyleManager.filter(rules, this._options.keywords)
      }
    )
  }

  /* TODO: parsing CSS
  SpatnavAPI.modules = {
    StyleManager: StyleManager
  }
  */

  SpatnavAPI.constructors = {
    Rule: Rule
  }

  window.SpatnavAPI = SpatnavAPI

})(window, document);
