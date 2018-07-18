/* Spatial Navigation Polyfill v0.1
* : common function for Spatial Navigation
*
* Copyright 2018 LG Electronics Inc. All rights reserved.
*
* https://github.com/WICG/spatial-navigation
* https://wicg.github.io/spatial-navigation
*/

function focusNavigationHeuristics(spatnavPolyfillOptions) {
  // condition: focus delegation model = false

  const ARROW_KEY_CODE = {37: 'left', 38: 'up', 39: 'right', 40: 'down'};
  const spinnableInputTypes = ['email', 'date', 'month', 'number', 'time', 'week'];
  const textInputTypes = ['password', 'text', 'search', 'tel', 'url'];

  if (!spatnavPolyfillOptions)
    spatnavPolyfillOptions = {"standardName": "true" };

  // Load SpatNav API lib
  const SpatNavAPI = SpatnavAPI();

  // Indicates for the position type starting point
  let startingPosition = null;

  /*
   * keydown EventListener :
   * If arrow key pressed, get the next focusing element and send it to focusing controller
   */
  document.addEventListener('keydown', function(e) {
    let focusNavigableArrowKey = {'left': true, 'up': true, 'right': true, 'down': true};
    const eventTarget = document.activeElement;

    let dir = ARROW_KEY_CODE[e.keyCode];
    // Edge case (text input, area) : Don't move focus, just navigate cursor in text area
    if ((eventTarget.nodeName === 'INPUT') || eventTarget.nodeName === 'TEXTAREA')
      focusNavigableArrowKey = handlingEditableElement(e);

    if (!focusNavigableArrowKey[dir]) {
      dir = null;
    }
    if (dir) {
      e.preventDefault();
      navigate(dir);
    }
  });

  /*
   * mouseclick EventListener :
   * If the mouse click a point in the page, the point will be the starting point.
   */
  document.addEventListener('click', function(e) {
    startingPosition = {xPosition: e.clientX, yPosition: e.clientY};
  });

  function navigate(dir) {
    // spatial navigation steps

    // 1
    const startingPoint = findStartingPoint();

    // 2 Optional step, not handled

    // 3
    let eventTarget = startingPoint;

    // 3-2 : the mouse clicked position will be come the starting point
    if (startingPosition) {
      eventTarget = document.elementFromPoint(startingPosition.xPosition, startingPosition.yPosition);

      startingPosition = null;
    }

    // 4
    if (eventTarget === document || eventTarget === document.documentElement) {
      eventTarget = document.body || document.documentElement;
    }

    // 5
    // If startingPoint is either a scroll container or the document,
    // find the best candidate within startingPoint
    if ((isContainer(eventTarget) || eventTarget.nodeName === 'BODY') && !(eventTarget.nodeName === 'INPUT')) {
      if (eventTarget.nodeName === 'IFRAME')
        eventTarget = eventTarget.contentDocument.body;

      const candidates = eventTarget.focusableAreas();
      let bestCandidate;

      if (Array.isArray(candidates) && candidates.length > 0) {
        bestCandidate = selectBestCandidateFromEdge(eventTarget, candidates, dir);
        focusingController(bestCandidate, dir);
        return;
      }

      if (scrollingController(eventTarget, dir)) return;
    }

    // 6
    // Let container be the nearest ancestor of eventTarget
    let container = eventTarget.getSpatnavContainer();
    let parentContainer = container.getSpatnavContainer();

    // The container is IFRAME
    if (!parentContainer) {
      parentContainer = window;

      if ( window.location !== window.parent.location ) {
        parentContainer = window.parent;
      }
    }

    while (parentContainer) {
      // 7
      const candidates = filteredCandidates(eventTarget, container.focusableAreas(), dir, container);

      if (Array.isArray(candidates) && candidates.length > 0) {
        // 9
        const bestCandidate = selectBestCandidate(eventTarget, candidates, dir, container);
        if (bestCandidate) {
          // 10 & 11
          focusingController(bestCandidate, dir);
          return;
        }
      }
      // 8
      else {
        // If there isn't any candidate and the best candidate among candidate:
        // 1) Scroll or 2) Find candidates of the ancestor container
        if (scrollingController(container, dir)) return;
        else {
          // [event] navnotarget : Fired when spatial navigation has failed to find any acceptable candidate to move the focus
          // to in the current spatnav container and when that same spatnav container cannot be scrolled either,
          // before going up the tree to search in the nearest ancestor spatnav container.
          SpatNavAPI.createNavEvents('notarget', container, dir);

          if (container === document || container === document.documentElement) {
            container = window;

            if ( window.location !== window.parent.location ) {
              // The page is in an iframe
              container = window.parent;
            }
            else {
              return;
            }
          }
          else {
            container = parentContainer;
            parentContainer = parentContainer.getSpatnavContainer();
          }
        }
      }
    }
    if (scrollingController(container, dir)) return;
  }

  /*
  * focusing controller :
  * Move focus or do nothing.
  * @function
  * @param {<Node>} the best candidate
  * @param {SpatialNavigationDirection} direction
  * @returns NaN
  */
  function focusingController(bestCandidate, dir) {
    const eventTarget = document.activeElement;
    const container = eventTarget.getSpatnavContainer();

    // When bestCandidate is found
    if (bestCandidate) {
      // Scrolling container or document when the next focusing element isn't entirely visible
      if (isScrollContainer(container) && !isEntirelyVisible(bestCandidate))
        bestCandidate.scrollIntoView();

      // When bestCandidate is a focusable element and not a container : move focus
      /*
       * [event] navbeforefocus : Fired before spatial or sequential navigation changes the focus.
       */
      SpatNavAPI.createNavEvents('beforefocus', bestCandidate, dir);
      bestCandidate.focus();
    }

    // When bestCandidate is not found within the scrollport of a container: Nothing
    else {
      console.log('Focus will stay');
    }
  }

  /*
  * scrolling controller :
  * Directionally scroll the element if it can be manually scrolled more.
  * @function
  * @param {Node} scroll container
  * @param {SpatialNavigationDirection} direction
  * @returns NaN
  */
  function scrollingController(container, dir) {
    /*
     * [event] navbeforescroll : Fired before spatial navigation triggers scrolling.
     */
    // If there is any scrollable area among parent elements and it can be manually scrolled, scroll the document
    if (isScrollable(container, dir) && !isScrollBoundary(container, dir)) {
      SpatNavAPI.createNavEvents('beforescroll', container, dir);
      moveScroll(container, dir);
      return true;
    }

    // If the spatnav container is document and it can be scrolled, scroll the document
    if (!container.parentElement && !isHTMLScrollBoundary(container, dir)) {
      SpatNavAPI.createNavEvents('beforescroll', container, dir);
      moveScroll(document.documentElement, dir);
      return true;
    }
    return false;
  }

  /*
  * Find the best candidate among focusable candidates within the container from the element
  * reference: https://wicg.github.io/spatial-navigation/#js-api
  * @function for Element
  * @param {SpatialNavigationDirection} direction
  * @param {sequence<Node>} candidates
  * @param {Node} container
  * @returns {Node} the best candidate
  */
  function spatNavSearch (dir, candidates, container) {
    // Let container be the nearest ancestor of eventTarget that is a spatnav container.
    let container_, candidates_;
    let bestCandidate = null;

    console.log('spatnavsearch');

    // If the container is unknown, get the closest container from the element
    if (container)
      container_ = container;
    else
      container_ = this.getSpatnavContainer();

    // If the candidates is unknown, find candidates
    if(Array.isArray(candidates) && candidates.length > 0) {
      candidates_ = candidates;
    }
    else {
      if((isContainer(this) || this.nodeName === 'BODY') && !(this.nodeName === 'INPUT'))
        candidates_ = this.focusableAreas();
      else
        candidates_ = container_.focusableAreas();
    }

    // Find the best candidate
    if (Array.isArray(candidates_) && candidates_.length > 0) {
      if((isContainer(this) || this.nodeName === 'BODY') && !(this.nodeName === 'INPUT'))
        bestCandidate = selectBestCandidateFromEdge(this, candidates_, dir);
      else
        bestCandidate = selectBestCandidate(this, candidates_, dir, container_);
    }

    return bestCandidate;
  }

  /*
  * Get the filtered candidate among candidates
  * - Get rid of the starting point from the focusables
  * - Get rid of the elements which aren't in the direction from the focusables
  * reference: https://wicg.github.io/spatial-navigation/#select-the-best-candidate
  * @function
  * @param {Node} starting point
  * @param {sequence<Node>} candidates - focusables
  * @param {SpatialNavigationDirection} direction
  * @param {Node} container
  * @returns {sequence<Node>} filtered candidates
  */
  function filteredCandidates(currentElm, candidates, dir, container) {
    const originalContainer = currentElm.getSpatnavContainer();
    let filteredcandidates = [];
    let eventTargetRect;

    // to do
    // Offscreen handling when originalContainer is not <HTML>
    if (!isVisible(currentElm) && originalContainer.parentElement && container !== originalContainer)
      eventTargetRect = originalContainer.getBoundingClientRect();
    else eventTargetRect = currentElm.getBoundingClientRect();

    // If D(dir) is null, let candidates be the same as visibles
    if (dir === undefined)
      filteredcandidates = candidates;

    /*
     * Else, let candidates be the subset of the elements in visibles
     * whose principal box’s geometric center is within the closed half plane
     * whose boundary goes through the geometric center of starting point and is perpendicular to D.
     */
    else
      for (let i = 0; i < candidates.length; i++) {
        const candidateContainer = candidates[i].getSpatnavContainer();
        const candidateRect = candidates[i].getBoundingClientRect();
        if (container.contains(candidateContainer) && isOutside(candidateRect, eventTargetRect, dir))
          filteredcandidates.push(candidates[i]);
      }

    return filteredcandidates;
  }

  /*
  * Select the best candidate among candidates
  * - Find the closet candidate from the starting point
  * - If there are element having same distance, then select the one depend on DOM tree order.
  * reference: https://wicg.github.io/spatial-navigation/#select-the-best-candidate
  * @function
  * @param {Node} starting point
  * @param {sequence<Node>} candidates
  * @param {SpatialNavigationDirection} direction
  * @param {Node} container
  * @returns {Node} the best candidate
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

  /*
  * Select the best candidate among candidates
  * - Find the closet candidate from the edge of the starting point
  * reference: https://wicg.github.io/spatial-navigation/#select-the-best-candidate (Step 5)
  * @function
  * @param {Node} starting point
  * @param {sequence<Node>} candidates
  * @param {SpatialNavigationDirection} direction
  * @returns {Node} the best candidate
  */
  function selectBestCandidateFromEdge(currentElm, candidates, dir) {
    const eventTargetRect = currentElm.getBoundingClientRect();
    let minDistanceElement = undefined;
    let minDistance = Number.POSITIVE_INFINITY;
    let tempMinDistance = undefined;

    if(Array.isArray(candidates)) {
      for (let i = 0; i < candidates.length; i++) {
        tempMinDistance = getInnerDistance(eventTargetRect, candidates[i].getBoundingClientRect(), dir);

        if (tempMinDistance < minDistance) {
          minDistance = tempMinDistance;
          minDistanceElement = candidates[i];
        }
      }
    }

    // FIXME: Test this considering cross origin
    //if (minDistanceElement.nodeName === "IFRAME") {
    //  minDistanceElement = (minDistanceElement.contentWindow || minDistanceElement.contentDocument);
    //}

    return minDistanceElement;
  }

  /*
  * Get container of this element.
  * - NOTE: Container could be different by the arrow direction, even if it's the same element
  * reference: https://wicg.github.io/spatial-navigation/#dom-element-getspatnavcontainer
  * @function for Element
  * @returns {Node} container
  */
  function getSpatnavContainer() {
    if (!this.parentElement) return this; // if element==HTML

    let container = this.parentElement;

    while(!isContainer(container)) {
      container = container.parentElement;
      if (!container) return this; // if element==HTML
    }

    return container;
  }

  /*
  * Find focusable elements within the container
  * reference: https://wicg.github.io/spatial-navigation/#dom-element-focusableareas
  * @function
  * @param {Node} container
  * @returns {sequence<Node>} focusable areas
  */
  function focusableAreas(option) {
    let focusables = [];
    let children = [];
    let container = this;

    if (!option)
      option = 'visible';

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
        else {
          const recursiveFocusables = thisElement.focusableAreas();

          if(Array.isArray(recursiveFocusables) && recursiveFocusables.length){
            focusables = focusables.concat(recursiveFocusables);
          }
        }
      }
    }

    if (option === 'all') {
      return focusables;
    }
    else if (option === 'visible') {
      return findVisibles(focusables);
    }
  }

  /*
  * Find visible elements among focusable elements
  * reference: https://wicg.github.io/spatial-navigation/#find-candidates (Step 4 - 5)
  * @function
  * @param {sequence<Node>} focusables - focusable areas
  * @returns {sequence<Node>} - visible focusable areas
  */
  function findVisibles(focusables) {
    const visibles = [];
    let thisElement = undefined;

    for (let i = 0; i < focusables.length; i++) {
      thisElement = focusables[i];
      if (isVisible(thisElement)) {
        visibles.push(thisElement);
      }
    }
    return visibles;
  }

  /*
  * Find starting point :
  * reference: https://wicg.github.io/spatial-navigation/#spatial-navigation-steps
  * @function
  * @returns {<Node>} Starting point
  */
  function findStartingPoint() {
    let startingPoint = document.activeElement;
    if (!startingPoint ||
      (startingPoint == document.body && !document.querySelector(':focus')) /* body isn't actually focused*/
    ) {
      startingPoint = document;
    }
    return startingPoint;
  }

  /*
   * Move Element Scroll :
   * Move the scroll of this element for the arrow directrion
   * (Assume that User Agent defined distance is '40px')
   * Reference: https://wicg.github.io/spatial-navigation/#directionally-scroll-an-element
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

  /* Whether this element is container or not */
  function isContainer(element) {
    return (!element.parentElement) ||
           (element.nodeName === 'IFRAME') ||
           (isScrollContainer(element)) ||
           (SpatNavAPI.isCSSSpatNavContain(element));
  }

  /* Whether this element is container or not
   * reference: https://drafts.csswg.org/css-overflow-3/#scroll-container
   */
  function isScrollContainer(element) {
    const overflowX = window.getComputedStyle(element).getPropertyValue('overflow-x');
    const overflowY = window.getComputedStyle(element).getPropertyValue('overflow-y');
    return (overflowX !== 'visible' && overflowX !== 'clip') && (overflowY !== 'visible' && overflowY !== 'clip');
  }

  /* Whether this element is scrollable or not */
  function isScrollable() { // element, dir
    // parameter: element
    if ((arguments.length == 1 && typeof arguments[0] === 'object') ||
        (arguments.length == 2 && typeof arguments[0] === 'object' && arguments[1] == null)) {
      const element = arguments[0];

      if (element.nodeName === 'HTML' || element.nodeName === 'BODY') return true;
      else if (isScrollContainer(element) && isOverflow(element)) return true;
      else return false;
    }

    // parameter: dir, element
    else if (arguments.length == 2 && typeof arguments[0] === 'object'
            && typeof arguments[1] === 'string') {
      const element = arguments[0];
      const dir = arguments[1];

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
    }

    else {
      console.log('Need parameters for isScrollable()');
      return false;
    }
  }

  /* Whether this element is overflow or not */
  function isOverflow() {
    // parameter: element
    if (arguments.length == 1 && typeof arguments[0] === 'object') {
      const element = arguments[0];
      if (element.scrollWidth > element.clientWidth || element.scrollHeight > element.clientHeight) {
        return true;
      }
      else {
        return false;
      }
    }
    // parameter: element, dir
    else if (arguments.length == 2 && typeof arguments[0] === 'object'
            && typeof arguments[1] === 'string') {
      const element = arguments[0];
      const dir = arguments[1];

      switch (dir) {
      case 'left':
        /* falls through */
      case 'right':
        if (element.scrollWidth > element.clientWidth)
          return true;
        break;
      case 'up':
        /* falls through */
      case 'down':
        if (element.scrollHeight > element.clientHeight)
          return true;
        break;
      }
      return false;
    }
    else {
      console.log('Need parameters for isOverflow()');
      return false;
    }
  }

  /* Check whether the scroll of window is down to the end or not */
  function isHTMLScrollBoundary(element, dir) {
    const scrollBottom = element.scrollHeight - element.scrollTop - element.clientHeight;
    const scrollRight = element.scrollWidth - element.scrollLeft - element.clientWidth;
    const scrollTop = window.scrollY;
    const scrollLeft = window.scrollX;

    const checkTargetValue = {left: scrollLeft, right: scrollRight, up: scrollTop, down: scrollBottom};
    return (checkTargetValue[dir] == 0);
  }

  /* Whether the scroll of this element is down to the end or not */
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

  /*
   * isFocusable :
   * Whether this element is focusable.
   * check1. Whether the element is the browsing context (document, iframe)
   * check2. The value of tabIndex is ">= 0"
   * check3. Whether the element is disabled or not.
   * check4. Whether the element is scrollable container or not. (regardless of scrollable axis)
   */
  function isFocusable(element) {
    return (!element.parentElement) ||
          (element.nodeName === 'IFRAME') ||
          (element.tabIndex >= 0 && !element.disabled) ||
          (isScrollable(element) && isOverflow(element));
  }

  /*
   * isVisible :
   * Whether this element is partially or completely visible to user agent.
   * check1. style property
   * check2. hit test
   */
  function isVisible(element) {
    return (!element.parentElement) || (isVisibleStyleProperty(element) && hitTest(element));
  }

  /*
   * isEntirelyVisible :
   * Check whether this element is completely visible in this viewport for the arrow direction.
   * //FIXME: Weird... checking HTML
   */
  function isEntirelyVisible(element) {
    const container = element.getSpatnavContainer();
    const rect = element.getBoundingClientRect();
    const containerRect = container.getBoundingClientRect();

    // FIXME: when element is bigger than container?

    if (rect.left < containerRect.left) return false;
    if (rect.right > containerRect.right) return false;
    if (rect.top < containerRect.top) return false;
    if (rect.bottom > containerRect.botto) return false;

    console.log('entirely in the view');
    return true;
  }

  /* Check the style property of this element whether it's visible or not  */
  function isVisibleStyleProperty(element) {
    const thisVisibility = window.getComputedStyle(element, null).getPropertyValue('visibility');
    const thisDisplay = window.getComputedStyle(element, null).getPropertyValue('display');
    const invisibleStyle = ['hidden', 'collapse'];

    return (!includes(invisibleStyle, thisVisibility) && thisDisplay !== 'none');
  }

  /*
   * hitTest :
   * Check whether this element is entirely or partially visible within the viewport.
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
    if (element === middleElem || element.contains(middleElem)) return true;
    if (element === leftTopElem || element.contains(leftTopElem)) return true;
    if (element === leftBottomElem || element.contains(leftBottomElem)) return true;
    if (element === rightTopElem || element.contains(rightTopElem)) return true;
    if (element === rightBottomElem || element.contains(rightBottomElem)) return true;
    return false;
  }

  /*------------------------------------------------------------------------*/
  /////////////////////////// Functions for rect  ////////////////////////////
  /*------------------------------------------------------------------------*/

  /* rect1 is outside of rect2 for the dir */
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

  /*
   * Get distance between rect1 and rect2 for the direction
   * reference: https://wicg.github.io/spatial-navigation/#select-the-best-candidate
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

  /*
   * Get distance between rect1 and rect2 for the direction
   * reference: https://wicg.github.io/spatial-navigation/#select-the-best-candidate
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

  /*
   * Get entry point and exit point of rect1 and rect2 for the direction
   * Default value dir = 'down' for findStartingPoint() function
   */
  function getEntryAndExitPoints(dir, rect1, rect2) {
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

  /*
   * Get the intersection rectangle of rect1 & rect2
   * rectangle object = {width: , height: }
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

  /*
   * Handle the input elements
   * reference- input element types:
   * https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input
   */
  function handlingEditableElement(e) {
    const eventTarget = document.activeElement;
    const startPosition = eventTarget.selectionStart;
    const endPosition = eventTarget.selectionEnd;
    const focusNavigableArrowKey = {'left': false, 'up': false, 'right': false, 'down': false};

    if (includes(spinnableInputTypes, eventTarget.getAttribute('type'))) {
      switch (e.keyCode) {
      case 37:      // left keycode
        focusNavigableArrowKey.left = false;
        break;
      case 38:      // up keycode
        focusNavigableArrowKey.up = true;
        break;
      case 39:      // right keycode
        focusNavigableArrowKey.right = false;
        break;
      case 40:      // down keycode
        focusNavigableArrowKey.down = true;
        break;
      }
    }
    else if (includes(textInputTypes, eventTarget.getAttribute('type'))) {
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
      switch (e.keyCode) {
      case 37:      // left keycode
        focusNavigableArrowKey.left = true;
        break;
      case 38:      // up keycode
        focusNavigableArrowKey.up = true;
        break;
      case 39:      // right keycode
        focusNavigableArrowKey.right = true;
        break;
      case 40:      // down keycode
        focusNavigableArrowKey.down = true;
        break;
      }
    }

    return focusNavigableArrowKey;
  }

  /*
   * Nodelist Object Function
   * Whether NodeList includes the element or not
   */
  function includes(nodelist, element) {
    for (let i = 0; i < nodelist.length; i++) {
      if (nodelist[i] === element) return true;
    }
    return false;
  }


  // Use non standard names by default, as per https://www.w3.org/2001/tag/doc/polyfills/#don-t-squat-on-proposed-names-in-speculative-polyfills
  // Allow binding to standard name for testing purposes
  if (typeof spatnavPolyfillOptions == 'object' && spatnavPolyfillOptions.standardName) {
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
}
