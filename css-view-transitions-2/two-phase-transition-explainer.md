# Two-phase view transition
Making cross-document view-transitions feel instant and seamless.

See w3c/csswg-drafts#10616

# Current state
View-transitions don’t start immediately - rendering is paused until the new state is ready. 
This is especially visible in cross-document view transitions, where the transition only captures the old when the new document’s response arrives, and starts when the new document is ready to render.

This can create a jarring or abrupt experience.

# Current workarounds

## Starting an animation manually on the old page
This is possible, however the old page cannot delay the navigation, which means the animation is likely to be interrupted when the navigation commits.

## Intercepting the navigation and restarting it when the animation ends
This works but is hard to achieve without slowing down the whole navigation process.

## Timing out render-blocking
This can reduce the “frozen” time, however it means the transition doesn’t end at the optimal state, and also doesn’t help with making it feel instant.

# Proposed solution
The core of the problem is that view-transitions require a start and an end phase before starting, but we don’t know the end phase in advance when it is computed in an async function (e.g. in a navigation).

## In a nutshell
Proposing to prototype a “two-phase” view-transition: 
Instantly start a transition to a state that can be computed quickly enough or synchronously. Call this a “preview” state.
When the to-preview transition ends, transition from there to the final state.
Only interrupt the first transition after a timeout, otherwise stall the navigation commit until finished.
This should ideally not delay the LCP / loading experience of the new page, as the content keeps loading (and potentially prerendering) in the background.

## Phase 1: script-invoked preview
We can create this kind of seamless/instant experience without any new CSS, and potentially without needing to fully spec it normatively by changing the behavior as follows:
Calling document.startViewTransition while there is an uncommitted navigation currently works, however it might get cancelled if the navigation is committed.
Instead, if setting up that preview transition’s new state is fast enough so that it is activated before commit, let the animation run its course and use the final state as the “old” state for the cross-document view-transition.

## Phase 2: declarative, using route-matching
Instead of relying on carefully crafted scripts, use the proposed [declarative routing feature](https://github.com/WICG/declarative-partial-updates/blob/main/route-matching-explainer.md), and compute the preview value declaratively and synchronously by applying the style associated with the new route and using it as the intermediate state.

Something like this, though perhaps the “preview” opt-in is not necessary and we can make this inferred

@route (to: article) {
  .article-skeleton { display: block } 
}

@view-transition {
  navigation: preview;
}

The big advantage of doing this declaratively is that the author doesn't have to worry about "cleaning up after themselves", e.g. in the case of restoring from BFCache.
Since routing is declarative, the style of the "new" route would simply not apply when restoring the "old" page from BFCache because the user is no longer navigating to it.


