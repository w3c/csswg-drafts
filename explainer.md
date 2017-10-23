# Proposed APIs for the spatial navigation
To support the spatial navigation in the Web, we need to develop several standard APIs. The API seems to be discussed with the suitable working groups in W3C (mainly in CSS WG). In this explainer page, the latest status of the spatial navigation would be summarized so that the overall progress could be tracked at a glance.

## Enabling the spatial navigation mode
It makes author set the spatial navigation mode. The following API could be considered for the possibilities to support the feature:
  - HTML: &lt;meta name="device" content="type=tv, input=remote-controller"&gt;
  - CSS: arrow-key-behavior: auto | navigation | scroll" or "spatial-mode: always | none
  - JS: setSpatialNavigation(true)
  
## Overriding methods on top of the heuristic algorithm
Developers can customize the spatial navigation with CSS properties by overriding the heuristic spatial navigation.

### Current Approach
There are the properties about the directional focus navigation already in the CSS Basic User Interface Module Level 4.
  - [nav-up/right/down/left properties (CSSUI4)](https://drafts.csswg.org/css-ui-4/#nav-dir)
    - Determine which element to navigate the focus in response to the arrow keys input.
    - Applied to the each element which can be focused.
    - Able to use even if the Heuristic Spatial Navigation is not supported.
    - Override the Heuristic Spatial Navigation if it is supported.
    - value: auto | <id> [ current | root | <target-name> ]?

### Proposal
The following properties are proposed to embrace the developer’s intention and make easier to implement and use the spatial navigation.
  - nav-rule property (CSSUI4)
    - Able to use if the Heuristic Spatial Navigation is enabled by default.
    - Applied to the containing block of the element which can be focused.
    - All focusable elements in the applied element follow the specified rule, so developer can customize the spatial navigation of the group of elements in response to directional navigational input.
    - Overridden by nav-left/right/top/bottom properties.
    - Override the Heuristic Spatial Navigation if it is supported.
    - value: auto | projection | direction | nearest
      - auto: The UA automatically determines which element to navigate the focus
      - projection: Moves the focus to the first element encountered when projecting the edge of the currently focused element to the edge of the applied element in the direction of navigation.
      - direction : Moves the focus to the first element encountered when projecting the edge of the applied element from the currently focused element in the direction of navigation.
      - nearest: Moves the focus to the closest element based on the shortest 2D distance and the distance is measured depending on the center of each element.
  - nav-loop property (CSSUI4)
    - Enables ability about the focus looping (moving the focus when the focus reaches to the end of the document).
    - The sequential focus navigation by tab key uses the focus looping, but the heuristic spatial navigation implemented in blink currently doesn’t support it.
    - value: auto | no-repeat | repeat
      - auto: The UA automatically determines where to move the focus when the focus reaches to the end of the document.
      - no-repeat: Disables the focus looping
      - repeat: Enables the focus looping
  
### Future work
Solving unreachability, saving last focus, group concept, aligning with scrolling, pointer/key mode selection
