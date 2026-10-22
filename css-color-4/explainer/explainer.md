# Explainer for CSS Color 4

## Authors:

- [Chris Lilley] (W3C)


## Participate
- [Issue tracker](https://github.com/w3c/csswg-drafts/issues?q=is%3Aissue+state%3Aopen+label%3Acss-color-4+sort%3Aupdated-desc)

## Table of Contents [if the explainer is longer than one printed page]

[You can generate a Table of Contents for markdown documents using a tool like [doctoc](https://github.com/thlorenz/doctoc).]

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- END doctoc generated TOC please keep comment here to allow auto update -->

## Introduction

[The "executive summary" or "abstract".
Explain in a few sentences what the goals of the project are,
and a brief overview of how the solution works.
This should be no more than 1-2 paragraphs.]

## User-Facing Problem

[What is the **end-user need** which this project aims to address?]

### Goals [or Motivating Use Cases, or Scenarios]

- [A bulleted list of goals can help with comparing proposed solutions.]

### Non-goals

[If there are "adjacent" goals which may appear to be in scope but aren't,
enumerate them here. This section may be fleshed out as your design progresses and you encounter necessary technical and other trade-offs.]

## User research

[If any user research has been conducted to inform the design choices presented,
discuss the process and findings.
We strongly encourage that API designers consider conducting user research to
verify that their designs meet user needs and iterate on them,
though we understand this is not always feasible.]

## Proposed Approach

[Explain the proposed solution or approach to addressing the identified problem.
Do not include WebIDL in this section.
Show example code using your approach.]

[Where necessary, provide links to longer explanations of the relevant pre-existing concepts and API.
If there is no suitable external documentation, you might like to provide supplementary information as an appendix in this document, and provide an internal link where appropriate.]

[If this is already specced, link to the relevant section of the spec.]

[If spec work is in progress, link to the PR or draft of the spec.]

### Dependencies on non-stable features

[If your proposed solution depends on any other features that haven't been either implemented by
multiple browser engines or adopted by a standards working group (that is, not just a W3C community
group), list them here.]

### Solving [goal 1] with this approach

```js
// Provide example code - not IDL - demonstrating the design of the feature.

// If this API can be used on its own to address a user need,
// link it back to one of the scenarios in the goals section.

// If you need to show how to get the feature set up
// (initialized, or using permissions, etc.), include that too.
```

### Solving [goal 2] with this approach

[If some goals require a suite of interacting APIs, show how they work together to achieve the goals.]

[etc.]

## Alternatives considered

[This should include as many alternatives as you can,
from high level architectural decisions down to alternative naming choices.
If you capture your alternatives as Architectural Decision Records,
use this section to link to the ADRs.]

### [Alternative 1]

[Describe an alternative which was considered.
This alternative may have been part of a prior proposal in the same area,
or it may be new.
If you did any research in evaluating this alternative, discuss it here.]

#### Pros

* [List]

#### Cons

* [List]

#### Reason for rejection

[Why do you feel the cons outweigh the pros?]

### [Alternative 2]

#### Pros

* [List]

#### Cons

* [List]

#### Reason for rejection

[You may not have decided about some alternatives.
Describe them as open questions here, and adjust the description once you make a decision.]

### [Alternative 3]

[etc.]

## Accessibility, Internationalization, Privacy, and Security Considerations

[Highlight any accessibility, internationalization, privacy, and security implications
that have been taken into account during the design process.]

## Stakeholder Feedback / Opposition

[Implementors and other stakeholders may already have publicly stated positions on this work. If you can, list them here with links to evidence as appropriate.]

[Widely implemented in browsers](https://wpt.fyi/results/css/css-color?label=master&product=chrome%5Bexperimental%5D&product=edge%5Bexperimental%5D&product=firefox%5Bexperimental%5D&product=safari%5Bexperimental%5D&product=ladybird&product=servo) in Chrome, Edge, Firefox, Safari, Ladybird and Servo.

<!-- - [Implementor A] : Positive
- [Stakeholder B] : No signals
- [Implementor C] : Negative -->


## References & acknowledgements

[Your design will change and be informed by many people; acknowledge them in an ongoing way! It helps build community and, as we only get by through the contributions of many, is only fair.]

[Unless you have a specific reason not to, these should be in alphabetical order.]

Many thanks for valuable feedback and advice from:

- [Person 1]
- [Person 2]
- [etc.]

Thanks to the following proposals, projects, libraries, frameworks, and languages
for their work on similar problems that influenced this proposal.

- [Framework 1]
- [Project 2]
- [Proposal 3]
- [etc.]


-------------------------------------

Central authoritative reference for color on the Web platform
Referenced by HTML LS (Canvas) and CSS OM
Referenced by CSS Color 5, CSS Images 4 (find others)
Well-tested sample code
Widely used reference implementation

gamut mapping with mid-lightness color inside sRGB. Triple the chromaticity, oog. Show result from naive clipping and from gamut mapping.
Link to https://www.w3.org/TR/css-color-4/#gamut-mapping-intro for introductory material

interpolation, use gradient examples from images-4

oklab/oklch link to https://www.w3.org/TR/css-color-4/#GM-hue-curvature

