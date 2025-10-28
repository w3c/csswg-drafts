# Two-phase cross-document navigation
Making the navigation experience customizable & declarative.

See whatwg/html#10616, whatwg/html#11819 and w3c/csswg-drafts#12829.

# Overview
The period between initiating a navigation (e.g. clicking a link) and consuming the content of the next page ([FCP](https://web.dev/articles/fcp)), is a sensitive moment in user experince.
It is a point in time where users are very likely to notice delays, jarring moments of frozen display, and abrupt changes to presentation.

The core of this being difficult stems from a tradeoff between speed and smoothness.
The new document becomes activate ASAP (in favor of speed), at the moment the headers are received.
However, it cannot render until all of its render-blocking resources and elements are present (in favor of smoothness, preventing FoUCs).

This "uncanny valley" where the old page is no longer active but the new page cannot render anything is far from being an optimal user experience, and the knobs given for developers to control it are crude and implicit.

# Current knobs

## Cross-document view transitions

This feature declaratively makes the navigation smoother. However, the view-transition starts very late. It captures the old state when the new page's response headers arrive, and then freezes the presentation until rendering is unblocked.

## Starting an animation manually on the old page
This would create an instant response to the navigation, however the animation would be interrupted as soon as the new page's headers arrive, freezing at that point. So by default this would be both abrupt and jarring.

## Intercepting the navigation and restarting it when the animation ends
This would feel smoother but slows down the whole navigation and tweaking it correctly is finicky.

## Timing out render-blocking
This can reduce the jarring time, however it means the transition doesn’t end at the optimal state, and also doesn’t help with making it feel instant.

# Two-phase transition

To make this part of the experience feel more seamless, developers should be able to create a "two-phase page transition".
This transition starts *instantly* after navigation initiation (link click), and continues *smoothly* until the next page is ready to render.
The instant part of the transition can only use information knows to the old page, which could be a skeleton of the new page or something generic of sorts.

To achieve that, there are 3(?) potential avenues

## Heuristic-based
Allow a subset of animations, e.g. ones that started after the navigation was initiated, to continue until the new page is ready to commit.
This would allow instant reactions to a navigation while not creating the abrupt experience of spotting it prematurely.

## Low-level knobs with prerendering support
Currently, deferring the commit, even for same-origin navigation, is not possible. So the browser is responsible for the handover,
not allowing the developer to curate this experience.

### Deferring commit
Something like `navigateEvent.waitUntil(promise)` (or `defer` or some such) can let the developer tweak the handover point.
This can of course also be a footgun as it's a simple way to delay navigations, however it's arguably less of a footgun than the current workarounds.

### Responding to prerender
When prerendering takes place, a more sensible time to hand over the control to the new document is when it is ready to produce a frame (all the render-blocking resources had been discovered).
However, it is not guaranteed that the destination page is prerendered, and there is no hook to know when the new page is ready to render.

A rather low level way to expose this is `navigateEvent.prerender()` which initiates a prerender if that hasn't happened yet, and returns a promise that resolves at that point, and compose it with the `waitUntil` method above.
It is also possible to short-circuit this and somehow declare "please defer commit until prerender", which is perhaps safer than a general-purpose promise-based API.

## Declarative preview transitions

The above knobs might be very effective, but might also require expertise to get right.

```css
@view-transition {
  navigation: preview;
  types: skeleton;
}

:active-view-transition-types(skeleton) {
/* style the transition here */
}
```

This is especially expressive together with route-matching:

```css
@route (from: movie-list) and (to: movie-details) {
  @view-transition {
    navigation: preview;
    types: skeleton;
  }
}

@route (movie-details) {
  :active-view-transition-types(skeleton) {
    /* style the page as a details page skeleton even if we don't have all the data */
  }
}
```

# Conclusion
Proposing to pursue both the declarative and JS-based approach for completeness (one for ease of use, one for fine-tuning and complete control), and avoid the heuristic approach as it's a bit opaque and implicit.

