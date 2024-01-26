# CSS Scroll State Container Queries Explainer

## Introduction

Level 3 of CSS Containment introduces Container Queries for querying size and
style of containers to style their descendants depending on layout and computed
styles respectively. There are requests to allow to query other states
associated with a container, in particular various scroll based states.

## Background and Motivation

Certain scroll-based states are only available for styling through javascript
events. These include whether a sticky positioned element is stuck in the sense
that it has an position offset applied, whether a scroll-snap-aligned element
is snapped to its scroll snap container or not. Exposing these states in CSS
would make it simpler for authors to create effects on snapped elements, or
have sticky positioned elements change their appearance when stuck.

This article talks about the need for support for styling scroll-snapped
elements:
[https://web.dev/state-of-css-2022/#scroll-snap-features-are-too-limited](https://web.dev/state-of-css-2022/#scroll-snap-features-are-too-limited).
In particular, see: [https://web.dev/state-of-css-2022/#snap-target](https://web.dev/state-of-css-2022/#snap-target).
This article also talks about the lack of being able to style snapped elements,
using intersection observers as a javascript alternative:
[https://blog.logrocket.com/style-scroll-snap-points-css/](https://blog.logrocket.com/style-scroll-snap-points-css/).

These ideas have been explored before. For instance, see
[this github issue](https://github.com/w3c/csswg-drafts/issues/5979), and
[this explainer](https://github.com/argyleink/ScrollSnapExplainers/blob/main/css-snap-target/readme.md)
for `:snapped` pseudo classes. That explainer pre-dates the container queries
specification and implementation that has happened recently.

One major argument against exposing this state to style resolution is that it
introduces cycles in rendering updates since layout influences scroll positions
which influence this state which again can influence layout through style
depending on this state (see
[this comment](https://github.com/w3c/csswg-drafts/issues/5979#issuecomment-899765136)
and onwards).

There is an [open github issue](https://github.com/w3c/csswg-drafts/issues/6402)
for state container queries where it was resolved to defer to the next level of
the spec - presumably css-contain-4.

## Container Queries vs Pseudo Classes

Container queries are an alternative to using pseudo classes for these states.
There are pros and cons of using new pseudo classes. Container queries would
naturally limit the style depending on this state to be applied in the stuck or
snapped element's subtree, while a pseudo class could arbitrarily be used to
style sibling subtrees and even ancestors (using `:has()`) unless the use in
selectors are restricted to certain combinators. One can argue that using
pseudo classes would make it more likely to end up in situations where layout
cycles are an issue.

Containers already have the container-type property which can be used to
explicitly choose which elements can be queried for state, which could also
help avoiding cycles issues. It would also allow for more performant
implementations in that fewer elements need to be checked for state.  When size
containers were introduced, there was a conscious choice to introduce an
explicit container-type instead of implicitly deduce a size container from the
`contain` property. For a pseudo class approach, we would either have to
introduce an explicit state property or deduce that an element is allowed to
match based on another property. E.g. `:stuck` allowed for `position:sticky`.

In the discussion in:
[https://github.com/w3c/csswg-drafts/issues/5979](https://github.com/w3c/csswg-drafts/issues/5979),
container queries are brought up as an alternative to pseudo classes. That
issue is also talking about containment, whether container queries should be
used instead of pseudo classes, and the fact that the need for an extra loop
after snapshotting  could be hooked into the same HTML rendering update as for
scroll driven animations.

## States to Query

This explainer tries to capture scroll-based state queries and the following
sections cover each of them. The commonality is that they all rely on scroll
positions and sizes.

### Stuck Sticky-positioned Elements

Introduce a container-type `sticky` to allow sticky positioned elements as
query containers for querying whether the sticky positioned has an offset
applied to fulfill the constraint for a given inset property. For instance:

```html
<style>
#sticky {
  container-name: my-menu;
  container-type: sticky;
  position: sticky;
  top: 0px;
  height: 100px;
}

#sticky-child {
  background-color: orange;
  color: white;
  height: 100%;
}

@container my-menu scroll-state(stuck: top) {
  #sticky-child { width: 50%; }
}
</style>
<div id="sticky">
  <div id="sticky-child">
    Sticky
  </div>
</div>
```

There is a question whether the query should match when the applied offset is
still 0, but it is exactly aligned with the edge of where an offset would start
to take effect.

#### Use Cases and Author Requests

- Demo that changes class through javascript based on the scrollTop value:
  [Header (Logo pops in)](https://codepen.io/JGallardo/pen/ZEBbeP)
- [Article using IntersectionObserver](https://davidwalsh.name/detect-sticky),
  but stating there should ideally be a :stuck pseudo
- [Using IntersectionObserver to fire custom sticky-change events](https://developer.chrome.com/blog/sticky-headers/)
- [Another demo using IntersectionObserver](https://codepen.io/bhupendra1011/pen/GRKxWMM)

#### Chrome Prototype Demo

<video width="400px" src="https://lilles.github.io/explainers/sticky.mov" controls muted></video>

### Scroll-snapped Elements

Introduce a container-type `snapped` to allow scroll-snap-aligned elements to
be queried for whether they are currently
[snapped](https://drafts.csswg.org/css-scroll-snap/#scroll-snap) in a given
direction. For instance:

```css
@container scroll-state(snapped: block) {
  #snap-child {
    outline: 5px solid yellow;
  }
}
```

#### Use Cases and Author Requests

In general being able to highlight the scroll snapped element, for instance in
a carousel.

- [Author request on github](https://github.com/w3c/csswg-drafts/issues/7430)

### Overflowing

Query whether a container has scrollable overflow. Can be used to indicate
there is content to scroll to in a given direction.

Needs further exploration.

### Anchor position fallback

In earlier exploration of anchor positioning, it was suggested that container
queries could be used to style the contents of an anchor positioned element
based on which [`@position-fallback`](https://drafts.csswg.org/css-anchor-position-1/#fallback-rule)
is used.

This needs further exploration.

## Proposed Syntax

Add a new scroll-state() function to `@container` similar to `style()` where
`state:value` pairs, and logical combinations of them, can be queried.
`<state-feature>` will be similar to
[`<style-feature>`](https://drafts.csswg.org/css-contain-3/#typedef-style-feature)
in that it takes a state name and value separated by a colon.

Add a new [`container-type`](https://drafts.csswg.org/css-contain-3/#container-type)
for each state which can be combined with size container types:

- `stuck`
- `snapped`

Query values for `stuck`:

- `none`
- `top`
- `left`
- `right`
- `bottom`
- `inset-block-start`
- `inset-block-end`
- `inset-inline-start`
- `inset-inline-end`

Query values for `snapped`:

- `none`
- `block`
- `inline`

A query with only a state name (boolean context) would match if the state is
different from `none`.

## Containment Requirements

The proposed approach to handling layout cycles is to have a two-pass rendering
update if necessary like scroll-driven animations have. See the
[Layout Cycles](#layout-cycles) section below for details. There is strictly no
need to have containment applied to the new container-types to have a
predictable rendering, but it would help authors to avoid flickering issues.
The question is whether it makes sense to enforce containment if containment is
not enough to fix all flickering issues.

By flickering issues we mean cases where the stuck styling would cause the
sticky position to no longer be stuck and the following rendering update would
lose that style and cause it to be stuck again. Similarly a scroll-snapped
element could be made no longer snapped through style changes affecting layout
and scroll position.

## Layout Cycles

The scroll based state queries have the same issue with potential layout cycles
that scroll-driven animations have. Whether an element has a sticky position
offset or is scroll-snapped is not known until after layout, and state queries
affect styles inside the containers which may affect whether the sticky element
has a sticky position offset or not.

It is possible that a lot of these cycles could be avoided if enough
containment is applied, but that would not allow for inline-size containment
(require full size containment), and also nesting sticky positioned elements
would be a problematic case.

More importantly, there is the problem of applying scroll based state queries
on the first frame, which regardless requires finishing layout before the query
containers' state can be found which would require another pass regardless of
containment requirements.

The scroll-driven animations spec specifies a set of stale timelines which
makes it possible to apply the current timeline based on newly created
timelines, or timelines that changed because of layout changes, to the same
frame that the timeline was created or changed. It is however limited to a
single extra update, specified as
[modifications to the HTML event loop](https://drafts.csswg.org/scroll-animations/#html-processing-model-event-loop).

It should be possible to do scroll based state queries using the exact same
timing for updating state query state and detect if there is a need for a
second pass to update the rendering based on the updated state.

## Transitions

The two-pass rendering update introduces a side-effect of starting transitions
which can be unfortunate, especially for the first rendered frame. This is
already an observable effect for scroll-driven animations, which can be seen
in the example below.

```html
<!DOCTYPE html>
<style>
  #timeline {
    scroll-timeline: --scroll y;
    width: 400px;
    height: 400px;
    overflow-y: scroll;
  }
  @keyframes w {
    0% {
      width: 300px;
    }
    100% {
      width: 400px;
    }
  }
  #container {
    container-type: inline-size;
    position: fixed;
    animation-timeline: --scroll;
    animation-name: w;
    width: 200px;
    height: 200px;
  }
  #target {
    height: 100%;
    background-color: green;
    transition: background-color 4s;
  }
  #target { background-color: green; }
  @container (width > 200px) {
    #target { background-color: lime; }
  }
</style>
<div id="timeline">
  <div id="container">
    <div id="target"></div>
  </div>
  <div style="height:2000px"></div>
</div>
```
