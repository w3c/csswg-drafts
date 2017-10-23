# Proposed APIs for the spatial navigation
To support the spatial navigation in the Web, we need to develop several standard APIs. The API seems to be discussed with the suitable working groups in W3C (mainly in CSS WG). In this explainer page, the latest status of the spatial navigation would be summarized so that the overall progress could be tracked at a glance.

## API for enabling the spatial navigation mode
It makes author set the spatial navigation mode. The following API could be considered for the possibilities to support the feature:
  - HTML: &lt;meta name="input" content="remote-controller"&gt;
    - If the using input device matches with the specified value of the content, the spatial navigation mode is enabled.
  - CSS:
  
    If the proposed property is applied to the element, the DOM subtree rooted at the element can be managed by the spatial nagivation or not.
    - arrow-key-behavior: auto | navigation | scroll
      - auto: The directional navigational input responses as the UA-defined manner.
      - navigation: The directional navigational input responses as the spatial navigation mode.
      - scroll: The directional navigational input responses for controlling the scrollbar.
      
    or
      
    - spatial-mode: always | none
      - always: The spatial navigation mode is enabled.
      - none: The spatial navigation mode is disabled.
  - JS: setSpatialNavigationEnabled(boolean)
    - If the parameter is `true`, the spatial navigation mode is enabled.
    - Otherwise, the spatial navigation mode is enabled and the directional navigational input responses as the UA-defined manner.
  
## Overriding methods on top of the heuristic algorithm
Developers can customize the spatial navigation with CSS properties by overriding the heuristic spatial navigation.

### Current Approach
There are the properties about the directional focus navigation already in the CSS Basic User Interface Module Level 4.
  - [nav-up/right/down/left properties (CSSUI4)](https://drafts.csswg.org/css-ui-4/#nav-dir)
    - value: auto | <id> [ current | root | <target-name> ]?
  
    The properites determine which element to navigate the focus in response to the directional navigational input. This is applied to the each element which can be focused.
    - Note
        - Able to use even if the heuristic spatial navigation is not supported.
        - Override the heuristic spatial navigation if it is supported.

### Proposal
The following properties are proposed to embrace the developer’s intention and make easier to implement and use the spatial navigation.
  - nav-rule property (CSSUI4)
   
    This property can customize the spatial navigation of the group of elements in response to the directional navigational input.
    - value: auto | projection | direction | nearest
      - auto: The UA automatically determines which element to navigate the focus.
      - projection: Moves the focus to the first element encountered when projecting the edge of the currently focused element to the edge of the applied element in the direction of navigation.
      - direction : Moves the focus to the first element encountered when projecting the edge of the applied element from the currently focused element in the direction of navigation.
      - nearest: Moves the focus to the closest element based on the shortest 2D distance and the distance is measured depending on the center of each element.
    - Note  
        - Able to use if the heuristic spatial navigation is enabled by default.
        - Applied to the containing block, so all focusable elements in the DOM subtree rooted at the applied element follow the specified rule for the spatial navigation.
        - Overridden by nav-left/right/top/bottom properties.
        - Override the Heuristic Spatial Navigation if it is supported.
    
    If the `nav-rule` property is applied to the element E, the DOM subtree rooted at E in the scrollable area created by E follows the focus moving algorithm as below.
      - Let E has child nodes A, B, C, and D which are `width: 50px; height: 50px;`.
      - Let the upper edge of the A is positioned `100px` down from the upper edge of the E and the leftside edge of the A is positioned `100px` to the right from the leftside edge of the E.
      - Let the upper edge of the B is positioned `50px` down from the upper edge of the E and the leftside edge of the B is positioned `250px` to the right from the leftside edge of the E.
      - Let the upper edge of the C is positioned `250px` down from the upper edge of the E and the leftside edge of the C is positioned `200px` to the right from the leftside edge of the E.
      - Let the upper edge of the D is positioned `100px` down from the upper edge of the E and the leftside edge of the D is positioned `500px` to the right from the leftside edge of the E.
      - Let the initial focus goes to A among the DOM subtree rooted at E.
      - If the current focused element is A and there is an input from the right-arrow key,
        - If `nav-rule: projection` is applied to the element E, the focus moves to D.
        - If `nav-rule: direction` is applied to the element E, the focus moves to C.
        - Otherwise `nav-rule: nearest` is applied to the element E, the focus moves to B.
      
  - nav-loop property (CSSUI4)
  
    This property enables the ability about the focus looping (moving the focus when the focus reaches to the end of the page).
    
    The sequential focus navigation by tab key supports the focus looping, but the heuristic spatial navigation implemented in blink doesn’t support it.
    It would be useful to have the focus looping feature in the spatial navigation, especially for the single page with long-scroll. 
    
    - value: auto | no-repeat | repeat
      - auto: The UA automatically determines where to move the focus when the focus reaches to the end of the page.
      - no-repeat: Disables the focus looping
      - repeat: Enables the focus looping
      
    If `nav-loop: repeat` is applied to the element E, the DOM subtree rooted at E is eligible to participate in the focus looping for any scrollable area created by E.
      - Let the element A is the first child node and the element Z is the last child node in the DOM subtree rooted at E.
      - If the current focused element is Z and there is an input from the down-arrow key, the focus is moved to A.

## Issues
- Why CSS properties instead of HTML attributes (like `tabindex`)?
- How can the feature be made to be composable.  Eg. in a world of custom elements and frameworks like polymer, how can you reason about spatial navigation without having global knowledge of the whole page?  Eg. could we instead make the properties define local spatial navigation (eg. between components) while allowing components to define navigation behavior inside of themselves?

## Future work
Solving unreachability, saving last focus, group concept, aligning with scrolling, pointer/key mode selection
