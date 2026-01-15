# Specific feature detection: The `named-feature()` function for `@supports`

L. David Baron ([@dbaron](https://github.com/dbaron)), January 2026

## Particpate

* https://github.com/w3c/csswg-drafts/issues
* https://github.com/w3c/csswg-drafts/issues/3559
* https://github.com/w3c/csswg-drafts/issues/9875

## Introduction

Developers writing stylesheets sometimes want to use new features
in a way that improves the experience for users
using implementations that support those features,
but that gracefully degrades to a usable but less ideal experience
in older implementations that do not.

The first mechanism for feature detection in CSS is its error handling rules.
CSS has well-defined parsing rules that cause syntax not known to an implementation
to be ignored.
This allows newly-introduced syntax to be ignored by older implementations.
This is sufficient when ignoring only the new syntax is enough.

However, sometimes developers need other pieces of CSS syntax to be ignored
along with the new syntax, so that styles work together depending on whether or not
a new feature is supported.
The CSS `@supports` rule was introduced to address this need;
it is a mechanism for feature detection in CSS syntax.
It has general mechanisms for detecting support for CSS properties and values,
CSS selectors, CSS at-rules, and some other general mechanisms.

However, sometimes feature-detection for a specific new feature would be useful
for developers to improve the experience for their users,
but the feature doesn't fit into the general mechanisms that `@supports` provides.
For example, a piece of CSS syntax might work in a new situation where it didn't do so before,
such as on a new CSS display type or a new type of element.
Adding mechanisms to `@supports` to detect every such case
would require defining "support" for millions of combinations of these features,
which would be infeasable to standardize, implement, test, and get interoperability on.
However, there are a small number of such features introduced
(probably a low single digit number per year)
where we know there is real demand for such feature detection.

The `named-feature()` function is designed to address this demand for feature detection
by adding names for the features where feature detection is needed
without needing to solve the problem of defining
what combinations of support mean across millions of possible combinations.

## Proposed approach

The proposed approach to address this is to add the `named-feature()` function
to the `@supports` rule,
and have the CSS specification define a limited number of keywords
to address specific feature detection problems.

For example, if a developer wants to detect whether the `align-content` property
is supported on elements with `display: block`, they could do something like:

```css
@supports named-feature(align-content-on-display-block) {
  main {
    min-height: min-content;
    align-content: stretch;
  }
}
```

## Alternatives considered

### Feature detection for combinations of features

An alternative that was considered was feature detection for combinations of features.
For example, we could add a syntax like `with` to `@supports` rules such as

```css
@supports (align-content: stretch) with (display: block) {
  /* rules here */
}
```

The problem with this syntax is that there are millions of combinations
and there is no existing data source that represents which ones are meaningful
today and which ones are not.
This means that the working group would need to define the behavior for these
millions of combinations
which would either dramatically slow the development of CSS overall
or would lead to many combinations that are initially defined wrong,
which would then make the feature detection not work when the combination
is actually supported meaningfully.

## Accessibility, Internationalization, Privacy, and Security Considerations

While developers in general need to test feature detection code carefully
to make sure that their testing covers all of the relevant branches,
this doesn't pose any considerations that are specific to accessibility or internationalization
other than generally increasing their testing matrix
(because the testing matrices for accessibility and internationalization should probably 
combine with the matrices for feature detection, at least to some degree).

We're not aware of any privacy and security considerations
since this feature detection is generally testing characteristics of the implementation
which are already detectable by developers in other ways.

## Stakeholder Feedback / Opposition

- Chromium: Positive, see https://chromestatus.com/feature/5153932394102784
- Gecko: Unknown
- WebKit: Unknown


