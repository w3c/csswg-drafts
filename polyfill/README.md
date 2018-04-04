#### 2018.4.4 updated
#### Reference: https://wicg.github.io/spatial-navigation/

# Spatial Navigation (Polyfill version 1)
## Features
1. Spatial Navigation Processing model
    - Not using focus delegation model
    - Not using enter key

2. JS API
    - getSpatnavContainer()
    - focusableAreas(optional FocusableAreasOptions arg)
    - spatNavSearch(SpatNavSearchOptions arg)

## Definition
* Starting point
  - The element gaining the focus when spatial navigation is triggered.
* Focusable
  - Condition
    - Browsing context (document, iframe)
    - Element with tabIndex
    - Scrollable region (a.k.a. Scroll Container)
* Container
  - Condition
    - document
    - Scroll Container
      - The element not having 'visible' and 'clip' for CSS overflow property
  - NOTE: Container is not always focusable

* Candidates
  - Elements which are possible to get the focus within the container of currently focused element when there is an input of SpatNav.
  - Reference: https://wicg.github.io/spatial-navigation/#find-focusable-areas

* Best Candidate
  - An element which will gain the focus.
  - An element which has the shortest distance among candidates.
  - If there are multiple candidates which have the same distance, the best candidate is decided in order of DOM tree.
  - Reference: https://wicg.github.io/spatial-navigation/#select-the-best-candidate

## Core Function
### focusNavigationHeuristics()
- Summary: Load SpatNav Polyfill
- Syntax
  - Parameter: N/A
  - Return: N/A

### spatNavSearch()
- Summary: Run the spatial navigation step and find the best candidate which will gain the focus.
- Syntax
  - Parameter: direction
  - Return: best candidate
- Reference: https://wicg.github.io/spatial-navigation/#spatial-navigation-steps

### focusingController()
- Summary: Decide focus behavior triggered by the directional input.
- Syntax
  - Parameter: bestCandidate, event, direction
  - Return: N/A

## Main Logic
### Inital Stage
1. focusNavigationHeuristics()    (spatnav-utils.js)
2. findStartingPoint(activeElement, null, null)            (spatnav-heuristic.js)
3. focusingController(bestCandidate, event, direction)           (spatnav-heuristic.js)

### SpatNav Input
1. Keydown Event                  (spatnav-heuristic.js)
2. spatNavSearch(direction)       (spatnav-heuristic.js)
3. focusingController(bestCandidate, event, direction)           (spatnav-heuristic.js)

# To Do
## Future Implementation
  - <code>spatial-navigation-contain</code> CSS property
  - NavigationEvent (<code>navbeforefocus</code>, <code>navbeforescroll</code>, <code>navnotarget</code>)
