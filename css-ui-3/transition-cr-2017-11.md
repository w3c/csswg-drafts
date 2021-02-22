(from [pr transitions](https://www.w3.org/Guide/transitions?profile=PR) )
<!-- read that link to understand how to fill in the template -->

# Transition request for Updated CR: CSS-UI-3

## Document title, URIs, and estimated publication date

CSS Basic User Interface Module Level 3 (CSS3 UI)

https://drafts.csswg.org/css-ui-3/

First Tuesday or Thursday after a successful transition decision.

## The document Abstract and Status sections

[abstract](https://drafts.csswg.org/css-ui-3/#abstract)

[status (as ED)](https://drafts.csswg.org/css-ui-3/#status)


## Decision to request transition

  - RESOLVED: Publish an updated CR of CSS UI

[IRC log, 2017-11-01 telcon](https://logs.csswg.org/irc.w3.org/css/2017-11-01/#e901404)

## Changes

[Changes since the 2017-10-25 Candidate Recommendation](https://drafts.csswg.org/css-ui-3/#changes)
<!-- no substantive changes -->

There are 4 normative changes, all based on feedback from actual implementations on a few subtleties of how they had implemented the features.

* Clarify (as a SHOULD) the implications of text-overflow on pointer events to capture implementor consensus (corresponding test).
* Clarify that UAs may ignore the cursor property to reflect the UA’s UI state
* Allow, but stop requiring support for SVG images without intrinsic sizes for cursors (corresponding test update).
* Align the spec with implementations, and make cursor: auto look like text over selectable text, and over editable elements (corresponding tests).

The first 3 changes are small tweaks and cannot make an implementation that conformed to the spec prior to the changes become non-conformant.

The 4th change could theoretically impact conformance, but in practice does not.
Zero known implementations (Gecko/Edge/Webkit/Blink/Presto) conformed with the previous wording (the [issue 1598 was openly reviewed and discussed](https://github.com/w3c/csswg-drafts/issues/1598) for several months),
while multiple implementations pass tests and interoperate with the change,
and all others for which conformance was not affected (did not pass before or after) agreed to update to conform to the new wording (over the old).

<!-- Only relevant for the PR transition

Thus the editors and WG believe all four normative changes fall within the bounds allowed for a CR->PR transition.

-->

## Requirements satisfied

There is no specific requirements document for this specification. The work
is within the scope defined in the CSS WG's charter,

## Dependencies met (or not)

<!--  no normative references to a Rescinded Recommendation -->

The following normative reference to W3C documents is not yet at CR:

* [CSS-COLOR-4](https://www.w3.org/TR/css-color-4/), in order to refer to a precise definition of a concept that exists implicitly since CSS21.

<!-- Only relevant for the PR transition

Additionally, the following normative references to W3C documents are at CR but not yet at PR:

* [CSS-VALUES-3](https://www.w3.org/TR/css-values-3/), in order to define the grammar of properties using newer terminology anchors that those of CSS21.
* [CSS-WRITING-MODES-3](https://www.w3.org/TR/css-writing-modes-3/), in order to refer to newer definitions of bidi terms than those of CSS21. Note that this specification is also almost ready to enter PR.
* [CSS3-BACKGROUND](https://www.w3.org/TR/css3-background/), in order to refer to the border-radius property, which has been interoperably implemented in all major browser engines for many years.
* [CSS3-IMAGES](https://www.w3.org/TR/css3-images/), in order to refer to updated definitions of concepts already present in CSS21, and to more precise definition of how image sizing in CSS should work than available in CSS21.
* [SVG2](https://www.w3.org/TR/SVG2/), in order to reuse new terminology about existing behavior (loading an SVG file without script nor external references).

 -->

## Wide Review

This specification has been in development over many years (since 2002),
and has been mostly stable since 2015.
Over its development period, it has received extensive feedback from numerous parties,
implementors or otherwise.

Explicit calls for horizontal reviews were sent,
the [latest one](https://lists.w3.org/Archives/Public/public-review-announce/2017Mar/0002.html) being for the current draft.

There has now been additional implementation feedback from multiple browsers.
All current feedback has been addressed and collected in the latest Disposition
of Comments.

## Issues addressed

The [Disposition of Comments](https://drafts.csswg.org/css-ui-3/issues-2017-2) shows 9 issues since the last CR update.
The [previous disposition of Comments](https://drafts.csswg.org/css-ui-3/issues-2015-2017) showed 12 issues,
and [the one before](https://drafts.csswg.org/css-ui-3/issues-2012-2015) showed 103 issues.

All are resolved.


## Formal Objections

None

## Implementation

[Final implementation report](https://drafts.csswg.org/css-ui-3/implementation-report)

The [testsuite](https://test.csswg.org/harness/results/css-ui-3_dev/grouped/) shows that
203 of 203 required tests meet CR exit criteria.

## Patent disclosures

[none](https://www.w3.org/2004/01/pp-impl/32061/status)
