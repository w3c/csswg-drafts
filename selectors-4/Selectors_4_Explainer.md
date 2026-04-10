# Selectors 4 Explainer

## Author

 - Chris Lilley (W3C)

## Participate

- [Issue tracker](https://github.com/w3c/csswg-drafts/issues?q=state%3Aopen%20label%3A%22selectors-4%22)

## What are Selectors

Introduced with [CSS1](https://www.w3.org/TR/CSS1/#basic-concepts) in 1996,
Selectors are a mature and widely deployed way to
select **individual parts** of a (typically HTML) document,
so that they may be **styled** or **manipulated with script**.

They were further developed in [CSS2.1](https://www.w3.org/TR/CSS2/selector.html#q5.0) 
(W3C Recommendation, from 2011)
and in [Selectors 3](https://www.w3.org/TR/selectors-3/)
(W3C Recommendation, 2018).

[Selectors 4](https://www.w3.org/TR/selectors-4/)
is an incremental improvement to previous Selectors specifications,
responding to common user needs.

It is now widely deployed, stable,
and is being prepared for W3C Recommendation,
while less-mature Selectors have been moved to
[Selectors 5](https://www.w3.org/TR/selectors-5/).

However, the Selectors 4 specification
is a _complete specification_ of Selectors,
(including material from levels 1 through 3)
not a delta. This aids readability.

In view of this widespread use,
this explainer does not address early-review questions
such as general user need or alternatives considered;
instead it motivates the particular changes found in Selectors 4.

## Why `Selectors` not `CSS Selectors`?

Selectors have expanded beyond their initial use in CSS;
they are also widely used in the Document Object Model,
to select parts of a document for manipulation by JavaScript.
These are both majority uses, hence the naming of the specification.

## What is new in Selectors 4

(Expanded from [Changes Since Level 3](https://drafts.csswg.org/selectors-4/#changes-level-3))

### Conditional Logic

- The matches-any [`:is`](https://www.w3.org/TR/selectors-4/#matches) pseudo-class,
    formerly called `:matches()`,
    has been added to allow stylesheet authors to group functionally related elements,
    such as any element that is either hovered or focussed.
- The specificity-adjusting [`:where()`](https://www.w3.org/TR/selectors-4/#zero-matches) pseudo-class
    has been added to construct zero-specificity filters,
    which are easy to override,
    replacing the many ugly hacks previously required to simulate this
- The relational [`:has()`]() pseudo-class

### Interactivity and Forms

- Added the [`:modal`](https://www.w3.org/TR/selectors-4/#modal-state) pseudo-class,
    to select elements which exclude interaction with all other elements until dismissed
- Added [`:open`](https://www.w3.org/TR/selectors-4/#open-state)
    and [`:popover-open`](https://www.w3.org/TR/selectors-4/#popover-open-state) pseudo-classes,
    primarily but not exclusively to use with HTML forms

### Hyperlinking Support

- Added [`:any-link`](https://www.w3.org/TR/selectors-4/#the-any-link-pseudo) to match
    any element that acts as the source anchor of a hyperlink

### Clearer Expression of Authorial Intent

- Expanded the sibling-counting [`:nth-child()`](https://www.w3.org/TR/selectors-4/#the-nth-child-pseudo) 
    and negation [`:not()`](https://www.w3.org/TR/selectors-4/#negation) pseudo-classes
    to accept a **selector list**.

### Media State

- Added the `:playing`, `:paused` and `:seeking`  [media playback state](https://www.w3.org/TR/selectors-4/#video-state) pseudo classes,
    to enable selecting on the dynamic state of video elements,
    functionality which previously required JavaScript
- Added the `:buffered` and `:stalled`
    [media loading state](https://www.w3.org/TR/selectors-4/#media-loading-state) pseudo-classes,
    again providing functionality that previously needed JavaScript
- Added the [`:fullscreen`](https://www.w3.org/TR/selectors-4/#fullscreen-state) 
    and [`:picture-in-picture`](https://www.w3.org/TR/selectors-4/#pip-state) pseudo-classes
- Added the `:muted` and `volume-locked` pseudo-classes
    for sound-producing elements

### Internationalization Improvements

- Expanded the content language 
    [`:lang()`](https://www.w3.org/TR/selectors-4/#the-lang-pseudo) pseudo-class
    to accept **wildcard matching** and **lists of language codes**
    for greater flexibility styling related languages
- Added the content language writing direction
    [`dir()`](https://www.w3.org/TR/selectors-4/#the-dir-pseudo) pseudo-class
    for convenient styling of left-to-right and righ-to-left content
- Clarified case-insensitive string matching

### Consolidation

Selectors first introduced in
[CSS Basic UI 3](https://www.w3.org/TR/css-ui-3/),
have been moved to the main Selectors 4 specification.

## Further reading

For further information on the use of Selectors in CSS 
(covering all levels, but with a focus on level 4), see 
[CSS Selectors](https://css-tricks.com/css-selectors/) on CSS-Tricks.

For selectors in the DOM, see
[NodeList](https://developer.mozilla.org/en-US/docs/Web/API/NodeList) on MDN.

The [Horizontal Review of Selectors 4](https://github.com/w3c/csswg-drafts/issues/13469).