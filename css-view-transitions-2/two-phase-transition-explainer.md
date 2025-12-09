# Two-phase cross-document navigation
Making the navigation experience customizable & declarative.

See whatwg/html#10616, whatwg/html#11819 and w3c/csswg-drafts#12829.

# Overview
The period between initiating a navigation (e.g. clicking a link) and consuming the content of the next page ([FCP](https://web.dev/articles/fcp)), is a sensitive moment in user experince.
It is a point in time where users are very likely to notice delays, jarring moments of frozen display, and abrupt changes to presentation.

The core of this being difficult stems from a tradeoff between speed and smoothness:
- The new document becomes activate ASAP (in favor of speed), at the moment the headers are received.
- However, it cannot render until all of its render-blocking resources and elements are present (in favor of smoothness, preventing FoUCs).

So, in the cases where the navigation is not instant, providing some instant animated response might cause an experience that doesn't feel smooth.

This "uncanny valley" where the old page is no longer active but the new page is not rendering any frames is far from being an optimal user experience, and the knobs given for developers to control it are crude and implicit.

# Current knobs

## Cross-document view transitions

This feature declaratively makes the navigation smoother. However, the view-transition starts very late. It captures the old state when the new page's response headers arrive, and then freezes the presentation until rendering is unblocked.

## Starting an animation manually on the old page
This would create an instant response to the navigation, however the animation would be interrupted as soon as the new page's headers arrive, freezing at that point. So by default this would be both abrupt and jarring.

## Intercepting the navigation and restarting it when the animation ends
This would feel smoother but slows down the whole navigation and tweaking it correctly is finicky.

## Timing out render-blocking
This can reduce the jarring time, however it means the transition doesn’t end at the optimal state, and also doesn’t help with making it feel instant.

# Proposed solutions

To make this part of the experience feel more seamless, developers should be able to create a "two-phase page transition".
This transition starts *instantly* after navigation initiation (link click), and continues *smoothly* until the next page is ready to render.
The instant part of the transition can only use information knows to the old page, which could be a skeleton of the new page or something generic of sorts.

To achieve that, proposing two provide the following:

## Allowing the author to control the commit scheduling

```js
// Returns a boolean if the page is prerendered/BFCached and not render-blocked.
navigateEvent.destination.ready

// Allows delaying the cross-document commit (aka page-swap) *without* intercepting this as a same-document navigation.
navigateEvent.deferPageSwap({
  // "immediate", which is also the default, means that the history is swapped immediately, like a `pushState`,
  // and the navigation becomes a `replace`.
  historyChange: "immediate" | "after-transition",

  // When the returned promise resovles, the navigation can proceed.
  // The handler can register a "restore" callback, to be called if the navigation is aborted
  // or if the page is restored from BFCache.
  handler: (controller) => Promise
});```

Possible usage:
```js
navigation.addEventListener("navigate", event => {
  if (!event.destination.ready) {
    event.deferPageSwap({
      // This means that the history is swapped immediately, like a `pushState`,
      // and the navigation becomes a `replace`.
      historyChange: "immediate",
      async handler(controller) {
         const transition = document.startViewTransition(() => show_preview());
    
         // The restore callback will be called if the navigation is aborted, or if this document is restored from BFCache.
         controller.addRestoreCallback(() => hide_preview());
         return transition.finished;
      }
    });
  }
});
```

### Some more details for deferred commit/page-swap
- By default, the new history entry applies immediately, like a `pushState` or `replaceState`.
  This makes it so that a quick press on "back" or so doesn't go too far back. The `historyChange` option can opt out of this behavior.
- Only same-origin navigations without cross-origin redirects are deferrable.


## Allowing animations to defer commit for a short period

The above knobs can be very effective, but might also require expertise to get right.

The likely use case to let an animation continue till the end, so we can perhaps enable this declaratively:

```css
::view-transition-group {
  animation-navigation-behavior: smooth;
}
```

