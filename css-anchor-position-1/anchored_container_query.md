# CSS Anchored Fallback Container Queries Explainer

## Introduction

CSS Anchor Positioning Level 1 introduced a way to position and size absolute
positioned elements relative to a specific anchor element.

There have been multiple requests to support styling of anchored elements based
on the chosen position.

Identified needs:

- Style a tether like arrows to match the direction of the anchored elements
  position relative to its anchor
- Styling background gradients based on direction
- Run different animations based on the position of the anchored element

See the filed github issues [[1](https://github.com/w3c/csswg-drafts/issues/8171)],
[[2](https://github.com/w3c/csswg-drafts/issues/9332)]


## Proposed solution

A declarative way of supporting this is through `@container` queries. An
anchored element can be queried about its applied fallback styles and the
descendant elements can be styled accordingly.

The caveat is that the anchored element itself cannot be styled with such
queries. If it is possible to allow more properties than the ones currently
allow in `@position-try` rules, the spec could instead extend that list and
allow the queries outlined here to offer a more rich styling for the anchored
element subtree.


## Proposed syntax

### The `anchored` container-type

Apart from `style() `queries, container candidates need to be explicitly made
so through the `container-type` property. For anchored elements there is no
trivial way to identify that an element is anchored - it is a combination of
computed values for several properties that makes it so. Therefore, the
proposal is to introduce a new `container-type: anchored`. Setting this
`container-type` makes the element an anchored container even if it is not
anchored, nor even an absolute positioned element.

The new container type can be combined with existing container types.

### The `anchored(fallback)` query function

Container queries currently support size (just parentheses), `style()`, and
`scroll-state()`.

The proposal here is to introduce a new `anchored()` function to match features
of anchored elements along with a `fallback` feature to query which of the
`position-try-fallbacks` is applied to the anchored element.

#### Index-based query

The simplest way of querying the fallback is an `<integer>` value where `0`
means no fallback, and any other value is a 1-based index into the computed
value of `position-try-fallbacks`. No applied fallbar (`0`) would evaluate to
false in the boolean context.

This is the syntax that is implemented in the current prototype in Chrome.

#### Value-based query

A more author-friendly syntax is to instead match against the actual fallback
value from the list of entried in `position-try-fallbacks`, where `none`
matches when no fallback is applied.

The canonicalized order would be used for matching. That is,
`@container anchored(fallback: flip-block --foo) {}` would match
`position-try-fallbacks: --foo flip-block`.

Open question: Does the tree-scoped name lookup of `@position-try` need to
match the exact same rule? The named lookup may result in different rules for
`@container` and `position-try-fallbacks` if they origin from diferrent trees.

### Example

Here is an example based on the proposed synax above with value-based queries:

```html
<style>
  @position-try --foo {
    position-area: top center;
  }

  #anchored {
    container-type: anchored;
    position-anchor: --a;
    position-area: left center;
    position: absolute;
    position-try-fallbacks: --foo flip-block, --foo;
  }

  /* Matches the first fallback */
  @container anchored(fallback: flip-block --foo) {
    #target { background: lime; }
  }
  /* Matches the second fallback */
  @container anchored(fallback: --foo) {
    #target { background: orange; }
  }
</style>
<div id="anchor"></div>
<div id="anchored">
  <div id="target">Anchored</div>
</div>
```


## Containment requirements and limitations

Anchor positioned elements depend on layout in order to compute anchor
functions and select applied `position-try-fallbacks`. That means there might
be containment requirements.

### Style containment

Incrementing or resetting CSS counters may affect generated content of any
succeeding element regardless of layout mode, hence the layout of any element
succeeding an anchored element. This may lead to circular dependencies if
`anchored()` queries if counter changes are allowed to escape the anchored
element subtree.

This can be remedied by applying style containment to `container-type:anchored`
elements, similarly to what we do for size containers.

### Layout containment

Whatever layout containment is necessary for size container queries should be
necessary, but also sufficient, for anchored queries. A size container currently
[establishes an independent formatting context](https://drafts.csswg.org/css-conditional-5/#valdef-container-type-size),
but does not apply layout containment.

### Styling the anchored element itself

As with other query containers, it is not possibly to change the style of the
anchored element itself. This is also an implication of the layout dependency
and the limited list of properties which can be applied by `@position-try` and
other fallback rules. See
[The @position-try Rule](https://drafts.csswg.org/css-anchor-position-1/#fallback-rule)


## ::tether

There is an [alternative proposal](https://github.com/w3c/csswg-drafts/issues/9271)
to introduce a `::tether` pseudo element for the tether rendering use case
specifically.

Having a separate pseudo element for tethers could make them more convenient
for authors to create if it is possible to construct UA styles which gives a
sensible behavior for sizing and positioning in more than just the trivial use
cases. As can be seen from
[explorations in the issue](https://github.com/w3c/csswg-drafts/issues/9271#issuecomment-1721772484),
this is complicated.

The codepen demo in the section below uses the `::after` element in the
anchored element to render the tether. One thing to point out from the
`::tether` proposal is that it is pulling the box for the pseudo element out as
a sibling of its originating element, which is something one cannot do with the
container query proposed here. However, pulling the box out like that is known
to have [issues](https://github.com/w3c/csswg-drafts/issues/11213) with e.g.
size container queries. It is not unlikely that an author would want the tether
to respond to size queries on the anchored element.

## Use Cases and Author Requests

- https://github.com/w3c/csswg-drafts/issues/8171#issue-1472061771
- https://github.com/w3c/csswg-drafts/issues/8171#issuecomment-2465816828
- https://utilitybend.com/blog/lets-hang-an-intro-to-css-anchor-positioning-with-basic-examples


## Chrome Prototype Demo

Chrome Canary 138.0.7194.0 and later has an experimental implementation behind a
[flag](chrome://flags/#enable-experimental-web-platform-features) which uses the
index-based syntax. A simple demo can be found on
[codepen](https://codepen.io/lilles/pen/VYLZZqj).

