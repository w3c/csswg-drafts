# Scoped View Transitions

Scoped View Transitions is an extension to the
[View Transition API][VT-api] to help developers perform transitions within the
scope of a DOM subtree.

The new API looks like this:

```js
element.startViewTransition(() => {
  // Update the DOM somehow.
});
```

This performs a same-document view transition similar to
[`document.startViewTransition()`][document-SVT], except that we are now calling
`startViewTransition()` on an arbitrary HTML element instead of the document.

That element becomes the "scope" for the transition, which
means that it will host the [`::view-transition`][v-t-pseudo] pseudo-element
tree, and act as a container for the transition animations.

## Motivation

Scoped View Transitions delivers four benefits to the developer that were not achievable before:

* _Concurrent transitions:_  Two or more elements can run view transitions at the same
  time without being aware of each other.  For example, different component libraries
  may each want to use view transitions and remain composable with each other.

* _Transitions affected by ancestor properties:_  View transitions can render
  inside a container that applies a clip, transform, or animation to it. For
  example, a view transition may run inside content while that content is
  scrolling.

* _Smooth rendering outside the transition scope:_  View transitions have to [pause
  rendering][render-suppression] while the DOM callback is running, but now we can
  pause rendering in only part of the page.

* _Transitions respect z-index:_  Non-transitioning content outside the scoped
  transition root can now paint on top of the transitioning content.  This is
  useful for overlays such as menus and notification bars, which previously
  could not stack in front of the pseudo-element tree.

## Current status

Scoped View Transitions has been proposed to the CSS Working Group
([#9890](https://github.com/w3c/csswg-drafts/issues/9890)) as a change to the
[CSS View Transitions Module Level 2][css-view-transitions-2] specification,
and [passed review](https://github.com/w3ctag/design-reviews/issues/1188)
by the W3C Technical Architecture Group (TAG).

Chrome 147 has
[shipped](https://groups.google.com/a/chromium.org/g/blink-dev/c/n1-oZUKaXHY/m/LqwtfSBWBQAJ)
Scoped View Transitions.
See also [Chrome Platform Status](https://chromestatus.com/feature/5109852273377280)
and the [implementation tracking bug](https://crbug.com/394052227).
Older Chrome versions require the `--enable-features=ScopedViewTransitions` command-line flag.

Here is a [**DEMO**](https://output.jsbin.com/runezug/quiet) of Scoped View Transitions,
showing concurrent transitions, transitioning inside a scroller, nested scoped transitions,
and transitioning behind a higher z-index overlay.

[VT-api]: https://developer.mozilla.org/en-US/docs/Web/API/View_Transition_API
[document-SVT]: https://developer.mozilla.org/en-US/docs/Web/API/Document/startViewTransition
[v-t-pseudo]: https://developer.mozilla.org/en-US/docs/Web/CSS/::view-transition
[css-view-transitions-2]: https://drafts.csswg.org/css-view-transitions-2/
[render-suppression]: https://drafts.csswg.org/css-view-transitions/#document-rendering-suppression-for-view-transitions

## How to use

You can play with Scoped View Transitions in Google Chrome today.

* Use Chrome 147 or newer.

* In your HTML, declare a scope element with one or more participants like this:

```html
<style>
  #scope { contain: layout; view-transition-scope: all }
  #participant { view-transition-name: greeting }
</style>
<div id="scope">
  <div id="participant">Hello</div>
</div>
```

* In your Javascript, call `startViewTransition` on the scope. Pass a callback that
  modifies the participants.

```html
<script>
  scope.startViewTransition(() => {
    participant.innerText = "World";
  });
</script>
```

## Feedback wanted

We're interested in feedback from the web developer community about
the shape of the Scoped View Transitions API, and
use cases where the feature works well or didn't work as expected.

You can share your feedback by commenting on
[CSS WG issue #9890](https://github.com/w3c/csswg-drafts/issues/9890).

## Design

### Pseudo-element tree

The pseudo-element tree for a scoped view transition looks similar to the
[pseudo-element tree for a document view transition](https://drafts.csswg.org/css-view-transitions-1/#view-transition-pseudos),
except that it is associated with the scope instead of the
`<html>` element.

The example above produces the following DOM subtree during the transition:

```
div#scope
└─ ::view-transition
   ├─ ::view-transition-group(root)
   │  └─ ::view-transition-image-pair(root)
   │     ├─ ::view-transition-old(root)
   │     └─ ::view-transition-new(root)
   └─ ::view-transition-group(greeting)
      └─ ::view-transition-image-pair(greeting)
         ├─ ::view-transition-old(greeting)
         └─ ::view-transition-new(greeting)
```

The `::view-transition` pseudo-element is laid out as a
`position: absolute; inset: 0` child of the scope. However, see
[Self-participating scopes](#Self-participating-scopes) and
[Scroller scopes](#Scroller-scopes) below for some special aspects of the relationship
between the scope and its pseudo tree.

### Algorithm

The steps for a scoped view transition are based on the
[steps for a document view transition](https://drafts.csswg.org/css-view-transitions-1/#lifecycle)
with appropriate modifications.  At a high level:

1. Create the [`ViewTransition`](https://drafts.csswg.org/css-view-transitions-1/#viewtransition) object.

2. At the next rendering opportunity, capture the painted output of each tagged
   element in the scope's DOM subtree, and create the pseudo-element tree
   with `::view-transition-old` pseudo-elements. A tagged element's geometry
   information is computed relative to the scope.

3. Invoke the callback passed to `startViewTransition`.

4. Create the `::view-transition-new` pseudo-elements and set up the default
   animations.

5. Run the animations.

6. Clean up by destroying the pseudo-element tree.

Between steps 2 and 4, we [pause the rendering](#Pause-rendering) of the
scope's subtree, so that any DOM updates inside that subtree
that occur during the callback are not presented to the user prematurely.

### Constraints

* The scope must be a block container with `contain: layout`. This ensures that
  it generates a [stacking context][stacking-contexts] so that its painted
  output can be captured as an atomic unit. (`display: inline-block` is allowed.)

> If the scope does not have `contain: layout`, it acquires the behavior of
> `contain: layout` while the transition is running. But it's recommended for
> the developer to set `contain: layout` explicitly, since toggling it can reflow
> the surrounding content.

* There cannot be more than one active transition with the same scope. If a
  transition is started on an element that is already running a transition, the
  pre-existing transition is skipped.

* A tagged element cannot participate (by generating a `::view-transition-group`)
  in more than one active transition at the same time. If you try to start a
  transition which would trigger this situation, it is skipped. (See
  [#12323](https://github.com/w3c/csswg-drafts/issues/12323) for discussion of
  which transition to skip.)

Within these constraints it is possible for two view transitions to run
concurrently on different scopes, even if one is a descendant of the other.
This is important for independent web components to be composable.

[stacking-contexts]: https://developer.mozilla.org/docs/Web/CSS/CSS_positioned_layout/Understanding_z-index/Stacking_context

### Tag containment

Because scoped view transitions are intended to enable composition (nesting of
unrelated components that both use transitions), developers need a way to avoid
tag collisions when choosing their `view-transition-name` values.

A new style value, `view-transition-scope: all`, serves this purpose.

> `view-transition-scope: all` was spelled `view-transition-scope: auto` before
> Chrome 147.0.7717.0 and `contain: view-transition` before Chrome 146.0.7652.0.
> See [CSS WG issue #13123](https://github.com/w3c/csswg-drafts/issues/13123).

A scoped view transition looks for tagged participants, starting with the scope
itself. If this tag search encounters a descendant with `view-transition-scope: all`,
it ignores that element and everything inside it, on the assumption that those tags
belong to a different scope.

> If the scope does not have `view-transition-scope: all`, it acquires the behavior of
> `view-transition-scope: all` while the transition is running. But it's recommended
> for the developer to set `view-transition-scope: all` explicitly, as this will
> guarantee that there is never a participant collision (see [constraints](#Constraints)).

### Pause rendering

The developer can asynchronously mutate the DOM during the `startViewTransition`
callback (which may return a Promise). To avoid presenting intermediate states
to the user, we must pause the rendering of the DOM being transitioned.

Document view transitions pause the rendering of the entire document while the
callback is running, but Scoped View Transitions will only pause the rendering
of the DOM subtree rooted at the scope.

When the callback is finished and the transition animations are running, the
rendering is no longer paused, but each tagged element participating in the
transition has its rendering hoisted into the corresponding
`::view-transition-new` pseudo-element. (This is the same for scoped and
document view transitions.)

### Transition root

Now that view transitions are scoped, we want to make it easy for the developer
to determine which scope a `ViewTransition` object is associated with.
So we're adding a `transitionRoot` property:

```js
interface ViewTransition {
    ...
    readonly attribute Element transitionRoot;
    ...
};
```

Example usage:

```js
function processAnimations(transition) {
    let anims = transition.transitionRoot.getAnimations()
    ...
}
...
let transition = el.startViewTransition();
transition.ready.then(() => processAnimations(transition));
```

See [CSSWG resolution for the transitionRoot property](https://github.com/w3c/csswg-drafts/issues/9908#issuecomment-2165621635).

### Self-participating scopes

By default, the scope is a participant in its own transition ("self-participating")
as if it had `view-transition-name: root`. The developer can opt out of this behavior by
setting `view-transition-name: none` on the scope explicitly.

> The default `view-transition-name: root` style on the scope is inside a special
> dynamic user-agent stylesheet that is only visible to the transition and will not
> be reflected in [getComputedStyle()](https://developer.mozilla.org/en-US/docs/Web/API/Window/getComputedStyle).

#### Interactivity

The opt-out from self-participation can be combined with
`::view-transition { pointer-events: none }` to preserve
interactivity and hover effects for non-transitioning elements
within the scope.

See [Keeping the page interactive while a View Transition is running](https://css-tricks.com/keeping-the-page-interactive-while-a-view-transition-is-running/).

#### Transitionable scope properties

If the scope is self-participating, all parts of its rendering can be transitioned,
including borders and box decorations (outline, box-shadow). This implies that the
transition animation can overflow the box bounds of the `::view-transition` pseudo-element.

Effects such as CSS `opacity` on the scope can be transitioned as well — in other words,
they apply "on the inside" of the scope's capture, not "on the outside" of the
scope's transition pseudo-tree.

> Unlike effects, changes to the CSS `transform` or the layout offset of the scope
> cannot be transitioned, as they directly affect the placement of the transition
> pseudo-tree itself.

#### Ancestor transition participation

A scope cannot directly participate in an ancestor transition, because we treat it
as `view-transition-scope: all` (see [Tag containment](#Tag-containment)).

However, a
scope and its transition can render inside a container that is participating in an
ancestor transition. This is illustrated in the [demo](https://output.jsbin.com/runezug/quiet)
(enable and play the "transitioning ancestor").

### Scroller scopes

A scope may also be a scroller — that is, it may have `overflow: auto` or `overflow: scroll`.

Note that because scopes can be [self-participating](#Self-participating-scopes), the transition
pseudo-tree is not moved by the scope's scroll offset. It is also not clipped to the scope's
client area, which can lead to participants appearing to "pop out" of the scroller.

If you are **opting out** of [self-participation](#Self-participating-scopes), your scope
probably should not be a scroller. Wrap your scope in a containing `<div>` that is a scroller
if you want the transition to run inside the scrolling contents.

#### Automatic nesting

If you have a **self-participating scroller scope**, we use
[Nested View Transition Groups](https://github.com/WICG/view-transitions/blob/main/nested-explainer.md) and set `::view-transition-group-children(root) { overflow: clip }` to ensure that non-root
participants are clipped to the scope's client area.

See [#13420](https://github.com/w3c/csswg-drafts/issues/13420) for more information about this
behavior.

#### Scrollbar padding

If you have an auto-nested self-participating scroller scope as described above,
you may observe that the `::view-transition-group-children` incorrectly overlaps the scrollbars.
This is a known limitation of nested groups ([crbug.com/475236700](https://crbug.com/475236700)).

You can work around this by setting `overflow-clip-margin: content-box` and
applying padding to the `::view-transition-group-children` corresponding to the
space occupied by the scrollbars ([demo](https://output.jsbin.com/xiruqev/quiet)).
(You might need to use Javascript to detect the existence and thickness of the scrollbar.)

We are [considering](https://github.com/w3c/csswg-drafts/issues/13407) ways to
use `scrollbar-gutter` to incorporate this logic into the user-agent style sheet.

## Alternatives Considered

Here are things we could have done instead of scoped view transitions, and things
we could have done differently within scoped view transitions.

### Nothing (status quo)

We could stick with document-level view transitions and the limitations described
in the [Motivation](#Motivation) section.

Developers have expressed that those limitations cause real problems. For example,
a content area may be the logical subject of a view transition, but other page elements
like tooltips and menus need to appear on top of the content area in the `z-index` order.
Developers end up adding `view-transition-name` to those overlaid elements, even though
they are not transitioning, just to keep them on top, which becomes a game of "whack-a-mole".

The global nature of document-level view transitions is also incongruous with the web's
core values of composition and modularity. CSS and DOM in general are designed to facilitate
granular application of rendering features, and the "isolation" of features to subtrees
(see e.g. [`contain`](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/contain))
is important for performance and heterogeneous components.

### Other scoping mechanisms

View transitions could have been "scoped" to something other than an element.

A limited form of scoping was already possible by running a view transition in an `<iframe>`.
However, it is limiting and impractical for developers to create an iframe wherever they
want to run a view transition.

Similarly, we could have tied view transitions to
[shadow trees](https://developer.mozilla.org/en-US/docs/Glossary/Shadow_tree) to
enable scoped view transitions for
[Web Components](https://developer.mozilla.org/en-US/docs/Web/API/Web_components).
But shadow DOM comes with its own limitations (Web Components are
[okay](https://nolanlawson.com/2024/09/28/web-components-are-okay/) but far from universally
adopted), and many component frameworks are not based on shadow DOM.

> There is a [proposal](https://github.com/w3c/csswg-drafts/issues/12953) to allow starting
> a scoped view transition on a shadow root.

### API alternatives

The `startViewTransition` method accepts an
[options](https://developer.mozilla.org/en-US/docs/Web/API/Document/startViewTransition#options)
object, which we could have extended to produce something like
`document.startViewTransition({ scope: element, ... })`.
But if scoped view transitions are logically independent and isolated from each other,
it seems more intuitive for the scope element to be the target of the method.

The [tag containment](#Tag-containment) API could have been something other than
`view-transition-scope: all`. We considered adding a new value to the `contain` property
to express this. However, `contain: view-transition` raises difficult questions, such as
whether it is implied by `contain: strict`.

### Self-participation alternatives

A number of design questions relating to [self-participating scopes](#Self-participating-scopes)
were explored in [Self-Participating Scopes](https://bit.ly/svt-sps). We settled on the following:

* Self-participation is allowed and the default, but opt-out for [interactivity](#Interactivity) is possible.
* Scopes are treated as `view-transition-scope: all` and cannot participate in outer transitions.
* The `::view-transition` pseudo is laid out as a box-tree child of the scope with some magical sibling-like behaviors.
* The `::view-transition` pseudo tree is painted on top of the scope regardless of z-index.

Alternatively, we could have disallowed self-participation, achieving some conceptual
simplifications at the cost of forcing developers to create an extra `<div>` to serve as the scope.

It was decided that the ergonomic benefits of enabling trivial cases like `<div id=scope>Hello world</div>`
to perform the expected cross-fade
(instead of making you write `<div id=scope><div id=participant>Hello world</div></div>`)
were sufficient to justify the spec and implementation complexity of self-participation.
See [Web Platform Design Principles, "Priority of Constituencies"](https://www.w3.org/TR/design-principles/#priority-of-constituencies).


## Prior Work

[Jake Archibald, "Shadow DOM or not - shared element transitions" (Sep 2022)](https://docs.google.com/document/d/1kW4maYe-Zqi8MIkuzvXraIkfx3XF-9hkKDXYWoxzQFA/edit?usp=sharing)
considers an alternate Shadow DOM implementation.

Presentation on Scoped View Transitions at the BlinkOn 20 conference in April 2025:
[slides](https://bit.ly/svt-blinkon),
[recording](https://bit.ly/svt-blinkon-video).
