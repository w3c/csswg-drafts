# Proposed APIs for the spatial navigation
To support the spatial navigation in the Web, we need to develop several standard APIs. The API seems to be discussed with the suitable working groups in W3C (mainly in CSS WG). In this explainer page, the latest status of the spatial navigation would be summarized so that the overall progress could be tracked at a glance.

## Options for enabling the spatial navigation mode
It makes author set the spatial navigation mode. The following API could be considered for the options.
  - HTML: <meta name="device" content="type=tv, input=remote-controller">
  - CSS: arrow-key-behavior: auto | navigation | scroll" or "spatial-mode: always | none
  - JS: setSpatialNavigation(true)
  
## Overriding methods on top of the heuristic algorithm
  - nav-rule property (CSSUI4)
  - nav-up/right/down/left properties (CSSUI4)
  - nav-loop property (CSSUI4)
  - etc. (unreachability, saving last focus, group concept, aligning with scrolling, pointer/key mode selection)
