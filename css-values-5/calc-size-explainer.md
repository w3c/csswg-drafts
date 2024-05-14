# Explainer: calc-size() function for transitions and animations to/from intrinsic sizes

## Authors:

- L. David Baron ([@dbaron](https://github.com/dbaron)), Google
- Tab Atkins ([@tabatkins](https://github.com/tabatkins)), Google

## Participate
- https://github.com/w3c/csswg-drafts/issues with prefix `[css-values-5]` and @-mentions of authors

## Introduction

Animation to or from auto heights is commonly requested by web developers.
It is important for animation of elements
(such as the contents of disclosure widgets)
opening/closing between a content-based height (or width)
and a small (often zero) height (or width).
This `calc-size()` proposal fits the desire to do such animations
into the way that CSS transitions and animations work.
More generally,
this allows animating
between a fixed length and
almost any type of height (or width, or min/max-height/width)
that can currently be specified in CSS.

The CSS `calc-size()` function is a CSS function similar to calc(),
but that also supports operations on exactly one of the values
auto, min-content, max-content, fit-content, stretch, or contain,
which are the intrinsic sizing keywords.
This allows transitions and animations to and from these values
(or mathematical functions of these values),
as long as the `calc-size()` function is used
on at least one of the endpoints of the transition or animation to opt in.

## Goals

Animations often make it clearer to a user what is changing about a page,
particularly when changes happen in response to a user interaction.
CSS has existing support for animation,
including both [CSS Animations](https://drafts.csswg.org/css-animations-1/), and
[CSS Transitions](https://drafts.csswg.org/css-transitions-1/)
(which are a feature that specifically animations changes to CSS computed values).

CSS also contains features that allow boxes to be sized based on the content;
such sizes are often called intrinsic sizes,
and are represented by keywords such as `auto`, `fit-content`, `stretch`, etc.
The most common example is probably `height: auto`,
which is the initial value of the `height` property.
These features are used by developers to make pages that respond well to
different device characteristics, different user preferences, and different software.
Use of these features makes pages that users can use across more devices and in ways
that better suit the users.

However, currently, CSS does not contain features that allow animating a size to or from
one of these intrinsic sizes.
A common case where such animations are useful are when
a user interface component causes content to appear or disappear.
For example, when a disclosure widget opens,
it can be desirable for the content that appears to animate into existence
by transitioning from zero height to its intrinsic height.

Given this gap in current CSS, developers are forced to limit themselves
to only two out of three of the following:
* using animations of sizes,
* using intrinsic sizes, and
* avoiding javascript in their animations.

(Using javascript to do this sort of animation can often make pages slower
both because computing the correct sizes for the animation requires
forcing extra layouts to happen,
and because efficiently integrating such an animation
with the browser's refresh cycle is tricky.)

The goal of this feature is to remove this limitation and
allow developers to use CSS animate sizes to or from intrinsic sizes.

## Non-goals

It is not a goal of this feature to support animation of a change in size
that results from a change to the element's intrinsic size (for example, when
the content changes and the element becomes taller or shorter as a result).
It is only designed to support animations when the computed value changes.
(This is tied to deeper limitations in CSS's animation model,
and would perhaps be better addressed by a mechanism for layout animations,
though such a mechanism has not yet been clearly described or proposed.)

It is not a goal of this feature to build a new model for animations in CSS.
It is designed to fit in to the existing CSS mechanisms for transitions and animations.

## `calc-size(<basis>, <calculation>)`

The basic form of the proposal is a `calc-size()` function that takes two arguments.
(There is also a one-argument form for convenience; see below.)
The first argument is the *basis* and the second argument is the *calculation*.
It is similar to the existing `calc()` function but is accepted only
for [a small set of CSS properties](https://github.com/w3c/csswg-drafts/issues/626#issuecomment-2025918637)
that relate to sizes.

In addition to the usual mathematical expressions,
the basis also accepts intrinsic sizing keywords.

The basic way the two arguments work is that:
* anything considering the type of the value looks only at the basis,
* anything considering the length resulting from the value looks at the calculation, and
* the `size` keyword can be used in the calculation to substitute in the basis.

In other words, when a CSS-based layout algorithm
(for example, block layout, flex layout, grid layout, table layout, or multicolumn layout)
has something that in pseudocode would be expressed as "if the value is a percentage" or
"if the value is the `fit-content` keyword",
then that pseudocode now examines the *basis* of any `calc-size()` value.
However, when the layout algorithm needs the mathematical value resulting from the value,
then the *calculation* is used.

So, for example, `width: calc-size(min-content, size * 1.5)` makes an element's width
be 1.5 times its `min-content` intrinsic width.
Likewise, `height: calc-size(auto, size * 0.7)` makes an element's height
be 0.7 times its `auto` height;
this would be a normal intermediate value at 70% of the way through an animation from
`0` height to `auto` height
(assuming that one of the values was wrapped in `calc-size()` to opt in to such animation).

This is specified [in css-values-5](https://drafts.csswg.org/css-values-5/#calc-size).

## `calc-size(<value>)`

`calc-size()` also has a single-argument form.
If that single argument is an intrinsic sizing keyword or a `calc-size()` function,
then the argument is treated as the `<basis>` and the calculation is `size`.
Otherwise the single argument is a `<calc-sum>` expression that is treated as the calculation,
and the basis is `any`.

This form makes it more convenient to opt in to animation using `calc-size()`
by wrapping at least one endpoint of the animation in `calc-size()`.

The following slightly more involved example shows
(while using the separately proposed `::details-content` pseudo-element)
the CSS needed to make a `<details>` element
animate its `height` when it opens and closes:

```css
details::details-content {
  --open-close-duration: 500ms;
  display: block; /* override default 'display: contents' */
  height: 0;
  transition: height var(--open-close-duration),
              content-visibility var(--open-close-duration) allow-discrete step-end;
}
details[open]::details-content {
  height: calc-size(max-content);
  /* repeat the 'transition' but with 'step-start' (for opening) rather than
     'step-end' (for closing) */
  transition: height var(--open-close-duration),
              content-visibility var(--open-close-duration) allow-discrete step-start;
}
```

This is specified [in css-values-5](https://drafts.csswg.org/css-values-5/#calc-size).

## Detailed design discussion

Much of the design discussion happened in w3c/csswg-drafts#626
starting with
[Tab's comment on 2023-11-06](https://github.com/w3c/csswg-drafts/issues/626#issuecomment-1796541071).
There has also been further discussion in
[w3c/csswg-drafts#10220](https://github.com/w3c/csswg-drafts/issues/10220),
[w3c/csswg-drafts#10259](https://github.com/w3c/csswg-drafts/issues/10259), and
[w3c/csswg-drafts#10294](https://github.com/w3c/csswg-drafts/issues/10294).

## Considered alternatives

### Allowing CSS transitions directly to or from intrinsic size keywords

One alternative that was considered was using `calc-size()` only as a mechanism
for describing the values mid-animation, but still allowing authors to specify
CSS transitions between values such as `0` and `auto`.

This was rejected
because of [compatibility problems](https://github.com/w3c/csswg-drafts/issues/626#issuecomment-2071016522)
it would cause (shown by prototyping it in Chromium).

Currently, using `calc-size()` at at least one of the endpoints of an animation
is required to opt in to animating using `calc-size()` intermediate values.
[w3c/csswg-drafts#10294](https://github.com/w3c/csswg-drafts/issues/10294)
proposes that we consider an additional opt-in mechanism.

### Allowing intrinsic sizing keywords inside of `calc()`

A longstanding proposal for addressing this issue was to allow
CSS intrinsic sizing keywords inside of `calc()`,
and thus allow this sort of animation by
allowing expressions like `calc(10px + 0.5 * auto)`.

This alternative would be more general than the `calc-size()` proposal.
In particular, this allows values that *mix* intrinsic keywords.
On the other hand, the `calc-size()` proposal is intentionally designed
to avoid allowing mixes of different intrinsic keywords.
This is needed to avoid problematic interactions with
many existing layout algorithms specified by CSS,
which follow different behavior for specific intrinsic sizing keywords
or different behavior for values with percentages.

The `calc-size()` proposal avoids these issues by ensuring that
all resulting values can be categorized by their underlying type (or basis)
which is either (a) *one* of the intrinsic sizing keywords,
(b) a `<length-percentage>` value that contains percentages, or
(c) a `<length>` that does not contain percentages.

Animation is only supported between values whose
bases are the same intrinsic sizing keyword
or between values where at least one of the values has
a basis that is not an intrinsic sizing keyword.
This avoids most issues with animation,
although it does have the issue of erasing "percentage-ness"
during an animation between a percentage value and an intrinsic sizing keyword.
(This seems better than disallowing such an animation, though.)

### Other proposals

There were other proposals
in [w3c/csswg-drafts#626](https://github.com/w3c/csswg-drafts/issues/626),
many of which don't integrate well with the model for CSS animations or transitions.

## Stakeholder Feedback / Opposition

- Google: [Positive](https://chromestatus.com/feature/5196713071738880)
- Mozilla: https://github.com/mozilla/standards-positions/issues/1022
- WebKit: https://github.com/WebKit/standards-positions/issues/348

## References & acknowledgements

Many thanks for valuable feedback and advice from:

- Oriol Brufau ([@Loirooriol](https://github.com/Loirooriol))
- Rob Flack ([@flackr](https://github.com/flackr))
- Ian Kilpatrick ([@bfgeek](https://github.com/bfgeek))
- Daniil Sakhapov ([@danielsakhapov](https://github.com/danielsakhapov))
- Lea Verou ([@LeaVerou](https://github.com/LeaVerou))
