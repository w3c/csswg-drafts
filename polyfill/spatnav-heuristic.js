/* Spatial Navigation Polyfill v0.1
* : common function for Spatial Navigation
*
* Copyright 2018 LG Electronics Inc. All rights reserved.
* Release Version 1.0
*
* https://github.com/WICG/spatial-navigation
* https://wicg.github.io/spatial-navigation
*/

(function () {

// Indicates global variables for spatnav (starting position)
let spatNavManager = {
  startingPosition: null,
  useStandardName: true,
};

// Use non standard names by default, as per https://www.w3.org/2001/tag/doc/polyfills/#don-t-squat-on-proposed-names-in-speculative-polyfills
// Allow binding to standard name for testing purposes
if (spatNavManager.useStandardName) {
  window.navigate = navigate;
  window.Element.prototype.spatNavSearch = spatNavSearch;
  window.Element.prototype.focusableAreas = focusableAreas;
  window.Element.prototype.getSpatnavContainer = getSpatnavContainer;
} else {
  window.navigatePolyfill = navigate;
  window.Element.prototype.spatNavSearchPolyfill = spatNavSearch;
  window.Element.prototype.focusableAreasPolyfill = focusableAreas;
  window.Element.prototype.getSpatnavContainerPolyfill = getSpatnavContainer;
}

const ARROW_KEY_CODE = {37: 'left', 38: 'up', 39: 'right', 40: 'down'};

function focusNavigationHeuristics() {

  /**
  * CSS.registerProperty() from the Properties and Values API
  * Reference: https://drafts.css-houdini.org/css-properties-values-api/#the-registerproperty-function
  **/
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
  * keydown EventListener :
  * If arrow key pressed, get the next focusing element and send it to focusing controller
  */
  window.addEventListener('keydown', function(e) {
    if (!e.defaultPrevented) {
      let focusNavigableArrowKey = {'left': true, 'up': true, 'right': true, 'down': true};
      const eventTarget = document.activeElement;
      const dir = ARROW_KEY_CODE[e.keyCode];

      // Edge case (text input, area) : Don't move focus, just navigate cursor in text area
      if ((eventTarget.nodeName === 'INPUT') || eventTarget.nodeName === 'TEXTAREA')
        focusNavigableArrowKey = handlingEditableElement(e);

      if (focusNavigableArrowKey[dir]) {
        e.preventDefault();
        navigate(dir);
      }
      spatNavManager.startingPosition = null;
    }
  });

  /**
  * mouseup EventListener :
  * If the mouse click a point in the page, the point will be the starting point.
  */
  window.addEventListener('mouseup', function(e) {
    spatNavManager.startingPosition = {xPosition: e.clientX, yPosition: e.clientY};
  });
}

/**
  * Navigate API :
  * reference: https://wicg.github.io/spatial-navigation/#dom-window-navigate
  * @function for Window
  * @param {SpatialNavigationDirection} direction
  * @returns NaN
**/
function navigate(dir) {
  // spatial navigation steps

  // 1
  const startingPoint = findStartingPoint();

  // 2 Optional step, not handled
  // UA defined starting point

  // 3
  let eventTarget = startingPoint;

  // 3-2 : the mouse clicked position will be come the starting point
  if (spatNavManager.startingPosition) {
    eventTarget = document.elementFromPoint(spatNavManager.startingPosition.xPosition, spatNavManager.startingPosition.yPosition);

    spatNavManager.startingPosition = null;
  }

  // 4
  if (eventTarget === document || eventTarget === document.documentElement) {
    eventTarget = document.body || document.documentElement;
  }

  // 5
  // At this point, spatNavSearch can be applied.
  // If startingPoint is either a scroll container or the document,
  // find the best candidate within startingPoint
  if ((isContainer(eventTarget) || eventTarget.nodeName === 'BODY') && !(eventTarget.nodeName === 'INPUT')) {
    if (eventTarget.nodeName === 'IFRAME')
      eventTarget = eventTarget.contentDocument.body;

    const candidates = eventTarget.focusableAreas();

    // 5-2
    if (Array.isArray(candidates) && candidates.length > 0) {
      if (focusingController(eventTarget.spatNavSearch(dir), dir)) return;
    }
    if (scrollingController(eventTarget, dir)) return;
  }

  // 6
  // Let container be the nearest ancestor of eventTarget
  let container = eventTarget.getSpatnavContainer();
  let parentContainer = container.getSpatnavContainer();

  // When the container is the viewport of a browsing context
  if (!parentContainer) {
    parentContainer = window.document.documentElement;
    // The container is IFRAME, so parentContainer will be retargeted to the document of the parent window
    if ( window.location !== window.parent.location ) {
      parentContainer = window.parent.document.documentElement;
    }
  }

  // 7
  while (parentContainer) {
    const candidates = filteredCandidates(eventTarget, container.focusableAreas(), dir, container);

    if (Array.isArray(candidates) && candidates.length > 0) {
      if (focusingController(eventTarget.spatNavSearch(dir, candidates, container), dir)) return;
    }
    else {
      // If there isn't any candidate and the best candidate among candidate:
      // 1) Scroll or 2) Find candidates of the ancestor container
      // 8 - if
      if (scrollingController(container, dir)) return;
      else {
        // 8 - else
        // [event] navnotarget : Fired when spatial navigation has failed to find any acceptable candidate to move the focus
        // to in the current spatnav container and when that same spatnav container cannot be scrolled either,
        // before going up the tree to search in the nearest ancestor spatnav container.

        createSpatNavEvents('notarget', container, dir);

        if (container === document || container === document.documentElement) {
          container = window.document.documentElement;

          // The page is in an iframe
          if ( window.location !== window.parent.location ) {

            // eventTarget needs to be reset because the position of the element in the IFRAME
            // is unuseful when the focus moves out of the iframe
            eventTarget = window.frameElement;
            container = window.parent.document.documentElement;
          }
          else {
            return;
          }

          parentContainer = container.getSpatnavContainer();
        }
        else {
          // avoiding when spatnav container with tabindex=-1
          if (isFocusable(container)) {
            eventTarget = container;
          }

          container = parentContainer;
          parentContainer = container.getSpatnavContainer();
        }
      }
    }
  }

  if (!parentContainer && container) {
    // Getting out from the current spatnav container

    const candidates = filteredCandidates(eventTarget, container.focusableAreas(), dir, container);

    // 9
    if (Array.isArray(candidates) && candidates.length > 0) {
      if (focusingController(eventTarget.spatNavSearch(dir, candidates, container), dir)) return;
    }
  }

  if (scrollingController(container, dir)) return;
}

/**
* focusing controller :
* Move focus or do nothing.
* @function
* @param {<Node>} the best candidate
* @param {SpatialNavigationDirection} direction
* @returns NaN
*/
function focusingController(bestCandidate, dir) {
  // 10 & 11
  // When bestCandidate is found
  if (bestCandidate) {
    const container = bestCandidate.getSpatnavContainer();

    // Scrolling container or document when the next focusing element isn't entirely visible
    if (isScrollContainer(container) && !isEntirelyVisible(bestCandidate))
      bestCandidate.scrollIntoView();

    // When bestCandidate is a focusable element and not a container : move focus
    /*
      * [event] navbeforefocus : Fired before spatial or sequential navigation changes the focus.
      */
    createSpatNavEvents('beforefocus', bestCandidate, dir);
    bestCandidate.focus();
    return true;
  }

  // When bestCandidate is not found within the scrollport of a container: Nothing
  else {
    console.log('No more target');
    return false;
  }
}

/**
* scrolling controller :
* Directionally scroll the element if it can be manually scrolled more.
* @function
* @param {<Node>} scroll container
* @param {SpatialNavigationDirection} direction
* @returns NaN
*/
function scrollingController(container, dir) {
  /*
    * [event] navbeforescroll : Fired before spatial navigation triggers scrolling.
    */
  // If there is any scrollable area among parent elements and it can be manually scrolled, scroll the document
  if (isScrollable(container, dir) && !isScrollBoundary(container, dir)) {
    createSpatNavEvents('beforescroll', container, dir);
    moveScroll(container, dir);
    return true;
  }

  // If the spatnav container is document and it can be scrolled, scroll the document
  if (!container.parentElement && !isHTMLScrollBoundary(container, dir)) {
    createSpatNavEvents('beforescroll', container, dir);
    moveScroll(document.documentElement, dir);
    return true;
  }
  return false;
}

/**
* Find the best candidate among focusable candidates within the container from the element
* reference: https://wicg.github.io/spatial-navigation/#js-api
* @function for Element
* @param {SpatialNavigationDirection} direction
* @param {sequence<Node>} candidates
* @param {<Node>} container
* @returns {<Node>} the best candidate
*/
function spatNavSearch (dir, candidates, container) {
  // Let container be the nearest ancestor of eventTarget that is a spatnav container.
  let targetElement = this;
  let bestCandidate = null;

  // If the container is unknown, get the closest container from the element
  if (!container)
    container = this.getSpatnavContainer();

  // If the candidates is unknown, find candidates
  // 5-1
  if(!Array.isArray(candidates) || candidates.length < 0) {
    if((isContainer(this) || this.nodeName === 'BODY') && !(this.nodeName === 'INPUT')) {
      if (this.nodeName === 'IFRAME')
        targetElement = this.contentDocument.body;

      candidates = targetElement.focusableAreas();
    }
    else {
      candidates = filteredCandidates(targetElement, container.focusableAreas(), dir, container);
    }
  }
  else {
    candidates = filteredCandidates(targetElement, candidates, dir, container);
  }

  // Find the best candidate
  // 5
  // If startingPoint is either a scroll container or the document,
  // find the best candidate within startingPoint
  if ((isContainer(targetElement) || targetElement.nodeName === 'BODY') && !(targetElement.nodeName === 'INPUT')) {
    if (Array.isArray(candidates) && candidates.length > 0) {
      bestCandidate = selectBestCandidateFromEdge(targetElement, candidates, dir);
    }
  }
  else {
    if (Array.isArray(candidates) && candidates.length > 0) {
      bestCandidate = selectBestCandidate(targetElement, candidates, dir);
    }
  }

  return bestCandidate;
}

/**
* Get the filtered candidate among candidates
* - Get rid of the starting point from the focusables
* - Get rid of the elements which aren't in the direction from the focusables
* reference: https://wicg.github.io/spatial-navigation/#select-the-best-candidate
* @function
* @param {<Node>} starting point
* @param {sequence<Node>} candidates - focusables
* @param {SpatialNavigationDirection} direction
* @param {<Node>} container
* @returns {sequence<Node>} filtered candidates
*/
function filteredCandidates(currentElm, candidates, dir, container) {
  const originalContainer = currentElm.getSpatnavContainer();
  let eventTargetRect;

  // to do
  // Offscreen handling when originalContainer is not <HTML>
  if (!isVisible(currentElm) && originalContainer.parentElement && container !== originalContainer)
    eventTargetRect = originalContainer.getBoundingClientRect();
  else eventTargetRect = currentElm.getBoundingClientRect();

  // If D(dir) is null, let candidates be the same as visibles
  if (dir === undefined)
    return candidates;

  /*
    * Else, let candidates be the subset of the elements in visibles
    * whose principal box’s geometric center is within the closed half plane
    * whose boundary goes through the geometric center of starting point and is perpendicular to D.
    */
  return candidates.filter(candidate =>
    container.contains(candidate.getSpatnavContainer()) &&
    isOutside(candidate.getBoundingClientRect(), eventTargetRect, dir)
  );
}

/**
* Select the best candidate among candidates
* - Find the closet candidate from the starting point
* - If there are element having same distance, then select the one depend on DOM tree order.
* reference: https://wicg.github.io/spatial-navigation/#select-the-best-candidate
* @function
* @param {<Node>} starting point
* @param {sequence<Node>} candidates
* @param {SpatialNavigationDirection} direction
* @returns {<Node>} the best candidate
*/
function selectBestCandidate(currentElm, candidates, dir) {
  let bestCandidate;
  let minDistance = Number.POSITIVE_INFINITY;
  let tempDistance = undefined;

  for (let i = 0; i < candidates.length; i++) {
    tempDistance = getDistance(currentElm.getBoundingClientRect(), candidates[i].getBoundingClientRect(), dir);
    if (tempDistance < minDistance) {
      minDistance = tempDistance;
      bestCandidate = candidates[i];
    }
  }
  return bestCandidate;
}

/**
* Select the best candidate among candidates
* - Find the closet candidate from the edge of the starting point
* reference: https://wicg.github.io/spatial-navigation/#select-the-best-candidate (Step 5)
* @function
* @param {<Node>} startingPoint
* @param {sequence<Node>} candidates
* @param {SpatialNavigationDirection} direction
* @returns {<Node>} the best candidate
*/
function selectBestCandidateFromEdge(currentElm, candidates, dir) {
  const eventTargetRect = currentElm.getBoundingClientRect();
  let minDistanceElement = undefined;
  let minDistance = Number.POSITIVE_INFINITY;
  let tempMinDistance = undefined;

  if(Array.isArray(candidates)) {
    for (let i = 0; i < candidates.length; i++) {
      tempMinDistance = getInnerDistance(eventTargetRect, candidates[i].getBoundingClientRect(), dir);

      // If the same distance, the candidate will be selected in the DOM order
      if (tempMinDistance < minDistance) {
        minDistance = tempMinDistance;
        minDistanceElement = candidates[i];
      }
    }
  }

  return minDistanceElement;
}

/**
* Get container of this element.
* - NOTE: Container could be different by the arrow direction, even if it's the same element
* reference: https://wicg.github.io/spatial-navigation/#dom-element-getspatnavcontainer
* @function for Element
* @returns {<Node>} container
*/
function getSpatnavContainer() {
  let container = this.parentElement;

  if (!container) return null; // if element==HTML
  while(!isContainer(container)) {
    container = container.parentElement;
    if (!container) return null; // if element==HTML
  }

  return container;
}

/**
* Find focusable elements within the container
* reference: https://wicg.github.io/spatial-navigation/#dom-element-focusableareas
* @function
* @param {FocusableAreasOptions} option
*         dictionary FocusableAreasOptions {FocusableAreaSearchMode mode;};
*         enum FocusableAreaSearchMode {"visible", "all"};
* @returns {sequence<Node>} focusable areas
*/
function focusableAreas(option) {
  let focusables = [];
  let children = [];
  let container = this;

  option = option || {'mode': 'visible'};

  if (container.childElementCount > 0) {
    if (!container.parentElement)
      container = document.body;

    // Find focusable areas among this
    children = container.children;

    for (let i = 0; i < children.length; i++) {
      const thisElement = children[i];
      if (isFocusable(thisElement)) {
        focusables.push(thisElement);
      }
      const recursiveFocusables = thisElement.focusableAreas(option);

      if (Array.isArray(recursiveFocusables) && recursiveFocusables.length) {
        focusables = focusables.concat(recursiveFocusables);
      }
    }
  }

  if (option.mode === 'all') {
    return focusables;
  }
  else if (option.mode === 'visible') {
    return findVisibles(focusables);
  }
}

/**
* Support the NavigatoinEvent: navbeforefocus, navbeforescroll, navnotarget
* reference: https://wicg.github.io/spatial-navigation/#events-navigationevent
* @function
* @param {option, element, direction}
* @returns NaN
**/
function createSpatNavEvents(option, element, direction) {
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
}

/**
* Find visible elements among focusable elements
* reference: https://wicg.github.io/spatial-navigation/#find-candidates (Step 4 - 5)
* @function
* @param {sequence<Node>} focusables - focusable areas
* @returns {sequence<Node>} - visible focusable areas
*/
function findVisibles(focusables) {
  return focusables.filter(isVisible);
}

/**
* Gives a CSS custom property value applied at the element
* @function
* @param
* element {Element}
* varName {String} without '--'
*/
function readCssVar(element, varName) {
  return element.style.getPropertyValue(`--${varName}`).trim();
}

function isCSSSpatNavContain(el) {
  if (readCssVar(el, 'spatial-navigation-contain') == 'contain') return true;
  else return false;
};

/**
* Find starting point :
* reference: https://wicg.github.io/spatial-navigation/#spatial-navigation-steps
* @function
* @returns {<Node>} Starting point
*/
function findStartingPoint() {
  let startingPoint = document.activeElement;
  if (!startingPoint ||
    (startingPoint === document.body && !document.querySelector(':focus')) /* body isn't actually focused*/
  ) {
    startingPoint = document;
  }
  return startingPoint;
}

/**
* Move Element Scroll :
* Move the scroll of this element for the arrow directrion
* (Assume that User Agent defined distance is '40px')
* Reference: https://wicg.github.io/spatial-navigation/#directionally-scroll-an-element
* @function
* @param {<Node>} element
* @param {SpatialNavigationDirection} dir
* @param {Number} offset
* @returns NaN
*/
function moveScroll(element, dir, offset = 0) {
  if (element) {
    switch (dir) {
    case 'left': element.scrollLeft -= (40 + offset); break;
    case 'right': element.scrollLeft += (40 + offset); break;
    case 'up': element.scrollTop -= (40 + offset); break;
    case 'down': element.scrollTop += (40 + offset); break;
    }
  }
}

/**
* Whether this element is container or not
* @function
* @param {<Node>} element
* @returns {Boolean}
*/
function isContainer(element) {
  return (!element.parentElement) ||
          (element.nodeName === 'IFRAME') ||
          (isScrollContainer(element)) ||
          (isCSSSpatNavContain(element));
}

/** Whether this element is a scrollable container or not
* reference: https://drafts.csswg.org/css-overflow-3/#scroll-container
* @function
* @param {<Node>} element
* @returns {Boolean}
*/
function isScrollContainer(element) {
  const overflowX = window.getComputedStyle(element).getPropertyValue('overflow-x');
  const overflowY = window.getComputedStyle(element).getPropertyValue('overflow-y');
  return (overflowX !== 'visible' && overflowX !== 'clip') && (overflowY !== 'visible' && overflowY !== 'clip');
}

/** Whether this element is scrollable or not
* @function
* @param {<Node>} element
* @returns {Boolean}
*/
function isScrollable(element, dir) { // element, dir
  if (element && typeof element === 'object') {
    if (dir && typeof dir === 'string') { // parameter: dir, element
      if (isOverflow(element, dir)) {
        // style property
        const overflowX = window.getComputedStyle(element, null).getPropertyValue('overflow-x');
        const overflowY = window.getComputedStyle(element, null).getPropertyValue('overflow-y');

        switch (dir) {
        case 'left':
          /* falls through */
        case 'right':
          return (overflowX !== 'visible' && overflowX !== 'clip');
        case 'up':
          /* falls through */
        case 'down':
          return (overflowY !== 'visible' && overflowY !== 'clip');
        }
      }
      return false;
    } else { // parameter: element
      return (element.nodeName === 'HTML' || element.nodeName === 'BODY') ||
              (isScrollContainer(element) && isOverflow(element));
    }
  }
}

/** Whether this element is overflow or not
* @function
* @param {<Node>} element
* @returns {Boolean}
*/
function isOverflow(element, dir) {
  if (element && typeof element === 'object') {
    if (dir && typeof dir === 'string') { // parameter: element, dir
      switch (dir) {
      case 'left':
        /* falls through */
      case 'right':
        return (element.scrollWidth > element.clientWidth);
      case 'up':
        /* falls through */
      case 'down':
        return (element.scrollHeight > element.clientHeight);
      }
    } else { // parameter: element
      return (element.scrollWidth > element.clientWidth || element.scrollHeight > element.clientHeight);
    }
    return false;
  }
}

/** Check whether the scrollbar of window reaches to the end or not
* @function
* @param {<Node>} element
* @param {SpatialNavigationDirection} direction
* @returns {Boolean}
*/
function isHTMLScrollBoundary(element, dir) {
  const scrollBottom = element.scrollHeight - element.scrollTop - element.clientHeight;
  const scrollRight = element.scrollWidth - element.scrollLeft - element.clientWidth;
  const scrollTop = window.scrollY;
  const scrollLeft = window.scrollX;

  const checkTargetValue = {left: scrollLeft, right: scrollRight, up: scrollTop, down: scrollBottom};
  return (checkTargetValue[dir] == 0);
}

/** Whether the scrollbar of an element reaches to the end or not
* @function
* @param {<Node>} element
* @param {String} direction
* @returns {Boolean}
*/
function isScrollBoundary(element, dir) {
  if (isScrollable(element, dir)) {
    const winScrollY = element.scrollTop;
    const winScrollX = element.scrollLeft;

    const height = element.scrollHeight - element.clientHeight;
    const width = element.scrollWidth - element.clientWidth;

    switch (dir) {
    case 'left': return (winScrollX === 0);
    case 'right': return (Math.abs(winScrollX - width) <= 1);
    case 'up': return (winScrollY === 0);
    case 'down': return (Math.abs(winScrollY - height) <= 1);
    }
  }
  return false;
}

/**
* isFocusable :
* Whether this element is focusable with spatnav.
* check1. Whether the element is the browsing context (document, iframe)
* check2. Whether the element is scrollable container or not. (regardless of scrollable axis)
* check3. The value of tabIndex is ">= 0"
*    There are several elements which the tabindex focus flag be set:
*    (https://html.spec.whatwg.org/multipage/interaction.html#specially-focusable)
*    The element with tabindex=-1 is omitted from the spatial navigation order,
*    but, if there is a focusable child element, it will be included in the spatial navigation order.
* check4. Whether the element is disabled or not.
*
* @function
* @param {<Node>} element
* @returns {Boolean}
*/
function isFocusable(element) {
  if (element.tabIndex < 0 || element.disabled)
    return false;
  else
    return ((!element.parentElement) ||
        (element.nodeName === 'IFRAME') ||
        (element.tabIndex >= 0) ||
        (isScrollable(element) && isOverflow(element)));
}

/**
* isVisible :
* Whether this element is partially or completely visible to user agent.
* check1. style property
* check2. hit test
* @function
* @param {<Node>} element
* @returns {Boolean}
*/
function isVisible(element) {
  return (!element.parentElement) || (isVisibleStyleProperty(element) && hitTest(element));
}

/**
* isEntirelyVisible :
* Check whether this element is completely visible in this viewport for the arrow direction.
* @function
* @param {<Node>} element
* @returns {Boolean}
*/
function isEntirelyVisible(element) {
  const rect = element.getBoundingClientRect();
  const containerRect = element.getSpatnavContainer().getBoundingClientRect();

  // FIXME: when element is bigger than container?
  const entirelyVisible = !((rect.left < containerRect.left) ||
    (rect.right > containerRect.right) ||
    (rect.top < containerRect.top) ||
    (rect.bottom > containerRect.botto));

  if(entirelyVisible)
    console.log('entirely in the view');

  return entirelyVisible;
}

/** Check the style property of this element whether it's visible or not
* @function
* @param {<Node>} element
* @returns {Boolean}
*/
function isVisibleStyleProperty(element) {
  const thisVisibility = window.getComputedStyle(element, null).getPropertyValue('visibility');
  const thisDisplay = window.getComputedStyle(element, null).getPropertyValue('display');
  const invisibleStyle = ['hidden', 'collapse'];

  return (!invisibleStyle.includes(thisVisibility) && thisDisplay !== 'none');
}

/**
* hitTest :
* Check whether this element is entirely or partially visible within the viewport.
* @function
* @param {<Node>} element
* @returns {Boolean}
*/
function hitTest(element) {
  let offsetX = parseInt(window.getComputedStyle(element, null).getPropertyValue('width')) / 10;
  let offsetY = parseInt(window.getComputedStyle(element, null).getPropertyValue('height')) / 10;

  offsetX = isNaN(offsetX) ? 0 : offsetX;
  offsetY = isNaN(offsetY) ? 0 : offsetY;

  const elementRect = element.getBoundingClientRect();

  const middleElem = document.elementFromPoint((elementRect.left + elementRect.right) / 2, (elementRect.top + elementRect.bottom) / 2);
  const leftTopElem = document.elementFromPoint(elementRect.left + offsetX, elementRect.top + offsetY);
  const leftBottomElem = document.elementFromPoint(elementRect.left + offsetX, elementRect.bottom - offsetY);
  const rightTopElem = document.elementFromPoint(elementRect.right - offsetX, elementRect.top + offsetY);
  const rightBottomElem = document.elementFromPoint(elementRect.right - offsetX, elementRect.bottom - offsetY);

  return ((element === middleElem || element.contains(middleElem)) ||
        (element === leftTopElem || element.contains(leftTopElem)) ||
        (element === leftBottomElem || element.contains(leftBottomElem)) ||
        (element === rightTopElem || element.contains(rightTopElem)) ||
        (element === rightBottomElem || element.contains(rightBottomElem)));
}

/* rect1 is outside of rect2 for the dir */
/**
* hitTest :
* Check whether this element is entirely or partially visible within the viewport.
* @function
* @param {DOMRect} rect1
* @param {DOMRect} rect2
* @param {SpatialNavigationDirection} dir
* @returns {Boolean}
*/
function isOutside(rect1, rect2, dir) {
  switch (dir) {
  case 'left':
    return isRightSide(rect2, rect1);
  case 'right':
    return isRightSide(rect1, rect2);
  case 'up':
    return isBelow(rect2, rect1);
  case 'down':
    return isBelow(rect1, rect2);
  default:
    return false;
  }
}

/* rect1 is right of rect2 */
function isRightSide(rect1, rect2) {
  return rect1.left >= rect2.right || (rect1.left >= rect2.left && rect1.right > rect2.right && rect1.bottom > rect2.top && rect1.top < rect2.bottom);
}

/* rect1 is below of rect2 */
function isBelow(rect1, rect2) {
  return rect1.top >= rect2.bottom || (rect1.top >= rect2.top && rect1.bottom > rect2.bottom && rect1.left < rect2.right && rect1.right > rect2.left);
}

/* rect1 is completely aligned or partially aligned for the direction */
function isAligned(rect1, rect2, dir) {
  switch (dir) {
  case 'left' :
    /* falls through */
  case 'right' :
    return rect1.bottom > rect2.top && rect1.top < rect2.bottom;
  case 'up' :
    /* falls through */
  case 'down' :
    return rect1.right > rect2.left && rect1.left < rect2.right;
  default:
    return false;
  }
}

/**
* Get distance between rect1 and rect2 for the direction
* reference: https://wicg.github.io/spatial-navigation/#select-the-best-candidate
* @function
* @param {DOMRect} rect1
* @param {DOMRect} rect2
* @param {SpatialNavigationDirection} dir
* @returns {SpatialNavigationDirection} distance
*/
function getInnerDistance(rect1, rect2, dir) {
  const points = {fromPoint: 0, toPoint: 0};

  switch (dir) {
  case 'right':
    points.fromPoint = rect1.left;
    points.toPoint = rect2.left;
    break;

  case 'down' :
    points.fromPoint = rect1.top;
    points.toPoint = rect2.top;
    break;

  case 'left' :
    points.fromPoint = rect1.right;
    points.toPoint = rect2.right;
    break;

  case 'up' :
    points.fromPoint = rect1.bottom;
    points.toPoint = rect2.bottom;
    break;
  }

  return Math.abs(points.fromPoint - points.toPoint);
}

/**
* Get the distance between two elements considering the direction
* reference: https://wicg.github.io/spatial-navigation/#select-the-best-candidate
* @function
* @param {DOMRect} rect1 (starting point)
* @param {DOMRect} rect2 (one of candidates)
* @param {SpatialNavigationDirection} dir
* @returns {Number} euclidian distance between two elements
*/
function getDistance(rect1, rect2, dir) {
  const kOrthogonalWeightForLeftRight = 30;
  const kOrthogonalWeightForUpDown = 2;

  let orthogonal_bias = 0;

  // Get exit point, entry point
  const points = getEntryAndExitPoints(dir, rect1, rect2);

  // Find the points P1 inside the border box of starting point and P2 inside the border box of candidate
  // that minimize the distance between these two points
  const P1 = Math.abs(points.entryPoint[0] - points.exitPoint[0]);
  const P2 = Math.abs(points.entryPoint[1] - points.exitPoint[1]);

  // A = The euclidian distance between P1 and P2.
  const A = Math.sqrt(Math.pow(P1, 2) + Math.pow(P2, 2));
  let B, C;

  // B: The absolute distance in the dir direction between P1 and P2, or 0 if dir is null.
  // C: The absolute distance in the direction which is orthogonal to dir between P1 and P2, or 0 if dir is null.
  switch (dir) {
  case 'left':
    /* falls through */
  case 'right' :
    B = P1;
    // If not aligned => add bias
    if (!isAligned(rect1, rect2, dir))
      orthogonal_bias = (rect1.height / 2);
    C = (P2 + orthogonal_bias) * kOrthogonalWeightForLeftRight;
    break;

  case 'up' :
    /* falls through */
  case 'down' :
    B = P2;
    // If not aligned => add bias
    if (!isAligned(rect1, rect2, dir))
      orthogonal_bias = (rect1.width / 2);
    C = (P1 + orthogonal_bias) * kOrthogonalWeightForUpDown;
    break;

  default:
    B = 0;
    C = 0;
    break;
  }

  // D: The square root of the area of intersection between the border boxes of candidate and starting point
  const intersection_rect = getIntersectionRect(rect1, rect2);
  const D = (intersection_rect) ? intersection_rect.width * intersection_rect.height : 0;

  return (A + B + C - D);
}

/**
* Get entry point and exit point of two elements considering the direction
* Note: The default value for dir is 'down'
* @function
* @param {SpatialNavigationDirection} dir
* @param {DOMRect} rect1 (starting point which contains entry point)
* @param {DOMRect} rect2 (one of candidates which contains exit point)
* @returns {Number} euclidian distance between two elements
*/
function getEntryAndExitPoints(dir = 'down', rect1, rect2) {
  let points = {entryPoint:[0,0], exitPoint:[0,0]};

  // Set direction
  switch (dir) {
  case 'left':
    points.exitPoint[0] = rect1.left;
    if (rect2.right < rect1.left) points.entryPoint[0] = rect2.right;
    else points.entryPoint[0] = rect1.left;
    break;
  case 'up':
    points.exitPoint[1] = rect1.top;
    if (rect2.bottom < rect1.top) points.entryPoint[1] = rect2.bottom;
    else points.entryPoint[1] = rect1.top;
    break;
  case 'right':
    points.exitPoint[0] = rect1.right;
    if (rect2.left > rect1.right) points.entryPoint[0] = rect2.left;
    else points.entryPoint[0] = rect1.right;
    break;
  case 'down':
    points.exitPoint[1] = rect1.bottom;
    if (rect2.top > rect1.bottom) points.entryPoint[1] = rect2.top;
    else points.entryPoint[1] = rect1.bottom;
    break;
  }

  // Set orthogonal direction
  switch (dir) {
  case 'left':
    /* falls through */
  case 'right':
    if (isBelow(rect1, rect2)) {
      points.exitPoint[1] = rect1.top;
      if (rect2.bottom < rect1.top) points.entryPoint[1] = rect2.bottom;
      else points.entryPoint[1] = rect1.top;
    }
    else if (isBelow(rect2, rect1)) {
      points.exitPoint[1] = rect1.bottom;
      if (rect2.top > rect1.bottom) points.entryPoint[1] = rect2.top;
      else points.entryPoint[1] = rect1.bottom;
    }
    else {
      points.exitPoint[1] = Math.max(rect1.top, rect2.top);
      points.entryPoint[1] = points.exitPoint[1];
    }
    break;

  case 'up':
  /* falls through */
  case 'down':
    if (isRightSide(rect1, rect2)) {
      points.exitPoint[0] = rect1.left;
      if (rect2.right < rect1.left) points.entryPoint[0] = rect2.right;
      else points.entryPoint[0] = rect1.left;
    }
    else if (isRightSide(rect2, rect1)) {
      points.exitPoint[0] = rect1.right;
      if (rect2.left > rect1.right) points.entryPoint[0] = rect2.left;
      else points.entryPoint[0] = rect1.right;
    }
    else {
      points.exitPoint[0] = Math.max(rect1.left, rect2.left);
      points.entryPoint[0] = points.exitPoint[0];
    }
    break;
  }
  return points;
}

/**
* Find focusable elements within the container
* reference: https://wicg.github.io/spatial-navigation/#dom-element-focusableareas
* @function
* @param {DOMRect} rect1
* @param {DOMRect} rect2
* @returns {Object} The intersection area between two elements (width , height)
*/
function getIntersectionRect(rect1, rect2) {
  let intersection_rect;
  const new_location = [Math.max(rect1.left, rect2.left), Math.max(rect1.top, rect2.top)];
  const new_max_point = [Math.min(rect1.right, rect2.right), Math.min(rect1.bottom, rect2.bottom)];

  if (!(new_location[0] >= new_max_point[0] || new_location[1] >= new_max_point[1])) {
    // intersecting-cases
    intersection_rect = {width: 0, height: 0};
    intersection_rect.width = Math.abs(new_location[0] - new_max_point[0]);
    intersection_rect.height = Math.abs(new_location[1] - new_max_point[1]);
  }
  return intersection_rect;
}

/**
* Handle the input elements
* reference- input element types:
* https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input
* @function
* @param {Event} e
* @returns {Boolean}
*/
function handlingEditableElement(e) {
  const spinnableInputTypes = ['email', 'date', 'month', 'number', 'time', 'week'],
    textInputTypes = ['password', 'text', 'search', 'tel', 'url'];
  const eventTarget = document.activeElement;
  const startPosition = eventTarget.selectionStart;
  const endPosition = eventTarget.selectionEnd;
  const focusNavigableArrowKey = {'left': false, 'up': false, 'right': false, 'down': false};

  const dir = ARROW_KEY_CODE[e.keyCode];
  if(dir === undefined) {
    return focusNavigableArrowKey;
  }

  if (spinnableInputTypes.includes(eventTarget.getAttribute('type')) &&
    (dir === 'up' || dir === 'down')) {
    focusNavigableArrowKey[dir] = true;
  }
  else if (textInputTypes.includes(eventTarget.getAttribute('type'))) {
    if (startPosition === 0) {
      focusNavigableArrowKey.left = true;
      focusNavigableArrowKey.up = true;
    }
    if (endPosition === eventTarget.value.length) {
      focusNavigableArrowKey.right = true;
      focusNavigableArrowKey.down = true;
    }
  }
  else {
    focusNavigableArrowKey[dir] = true;
  }

  return focusNavigableArrowKey;
}

function setStandardName() {
  spatNavManager.useStandardName = true;
}

window.addEventListener("load", function() {
  
  // load SpatNav polyfill
  focusNavigationHeuristics();
});

})(window, document);
