# Overscroll Behavior
---
# Draft Specification
https://wicg.github.io/overscroll-behavior/

# Problem

Scroll chaining is the process of propagating the scroll event to the nearest scrollable parent element once a scrollable reaches its limit. Scroll chaining is not always desirable. For example, consider a fixed/absolute position scroller whose scroll should not chain to the parent scroller, i.e. the document. You can find this UX pattern used in most chat boxes that live at the bottom of a page such as in Facebook or GMail UIs.

To give you a sense of how popular preventing scroll chaining may be, according to my quick http-archive search "-ms-scroll-chaining: none" is used in 0.4% of top 300K pages despite being limited in functionality and only supported on IE/Edge.

# Current Solution

-ms-scroll-chaining is a vendor specific API. The proposed CSS property provides a simple declarative way to prevent propagation of scroll gestures to parent containers but unfortunately it is limited to touch/touchpad scrolls only.

This means that currently the best cross-browser compatible way to prevent scroll propagation is to have a combination of a blocking wheel event listener (bad for performance), blocking keyboard listeners for all scroll inducing keys, carefully crafted touch-action values, and perhaps even -ms-scroll-chaining. These are rather ugly and complex hacks that "-ms-scroll-chaining" should have been able to replace but it cannot in its current form.

# Proposal

The current proposal is a summary of the public discussion from:
https://github.com/w3c/csswg-drafts/issues/769

This proposal introduces a new CSS property to control the scrolling behavior once a scrollable element reaches the boundary of the scrollport. This property will allow the author to hint that the user agent should deny scrolling from being chained to any ancestor. Note that for certain input modes, particularly on devices with a limited screen size and limited alternative input modes, the user agent may ignore the hint and allow scroll chaining to some ancestor, like the document viewport, or all ancestors.

The property can also hint at the overscroll behavior that the browser should take when at the boundary of the scrollport. The overscroll behavior is implementor defined. The property should provide a hint to either allow or disallow the overscroll behavior of the user agent.

The proposal for the syntax is:
```
overscroll-behavior{-x,-y}: auto | contain | none
```

where:
* auto - Allow the default behavior for the user agent.
* contain - Hint to disable scroll chaining. The user agent may show an appropriate overscroll affordance. If the scroll chaining would trigger a non-scroll action, such as a navigation action, this property should be a hint to disable the navigation action.
* none - Same as contain but also hint that no overscroll affordance should be triggered.

This should apply to all, non-programmatic, user scroll actions.
