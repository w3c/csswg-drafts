# TAG review request

From https://github.com/w3ctag/design-reviews/issues/new?template=010-wg-revision-review.yaml

- The WG's request for this TAG review: https://  <!-- Usually a deep link into minutes or an email thread. -->
- TAG review of the previous version of this specification, if any: https://github.com/w3ctag/design-reviews/issues/####
- A description of what has changed since our previous review: https://...#section

<!-- Make a copy of the below items for each distinct feature that
 has changed since our previous review, and fill in links to
 describe that feature. For small changes, these may all be included
 in the issue that motivated the change, but please double-check that
 all the answers are actually there. -->
Feature 1:
- Previous early design review, if any: https://github.com/w3ctag/design-reviews/issues/####
- An introduction to the feature, aimed at unfamiliar audiences: https://  <!-- Can be the specification's or explainer's introduction, or another section. -->
- A description of the problems that end-users were facing before this proposal: https://  <!-- See https://w3ctag.github.io/explainer-explainer/#end-user-need -->
- Alternatives considered: https://  <!-- See https://w3ctag.github.io/explainer-explainer/#alternatives -->
- Examples of how to use the proposal to solve the end-users' problems: https://  <!-- See https://w3ctag.github.io/explainer-explainer/#describe-proposal -->
- What do the end-users experience with this proposal: https://  <!-- See https://w3ctag.github.io/explainer-explainer/#describe-proposal -->
- User research you did to validate the problem and/or design, if any: https://
- Web Platform Tests:  <!-- Or other tests if this is not a web platform feature. -->

### New features since 2020 TAG review

    - Device independent colors, Oklab and Oklch added to existing CIE Lab and LCH
    - Predefined color spaces expanded, including linear-light versions requested for Canvas
    - @color-profile, calibrated CMYK, device-cmyk moved to color 5
    - Working Color Space: placeholder issue dropped, replaced by explicit, as-needed, color conversion
    - Converting colors added (plus sample code and reference implementation)
    - Comparing colors (for container queries and transitions)
    - Color interpolation (between any colorspaces) (for gradients, color-mix)
    - Gamut mapping (for colors outside the gamut of canvas or of the display )
    - Serialization (moved from CSSOM) including HTML-specifics (requested by WHATwg)

## Where and who


- GitHub repo:
- Primary contacts:
  - $name (@-mention), $organization/s, $role in developing specification
  - <!-- repeat as necessary, we recommend including group chairs and editors in this list -->
- Organization/project driving the specification:
- This work is being funded by:
- Primary standards group developing this feature:
- Incubation and standards groups that have discussed the design:
  - {{ABC CG}} <!-- Include a link to minutes or issues in this group if possible. -->
  - {{DEF WG}}

## Feedback

- Active horizontal reviews: https:// <!-- Link to an issue like https://github.com/webmachinelearning/webnn/issues/239, https://github.com/WebAssembly/spec/issues/1804, or https://github.com/w3c/did/issues/885, which itself links to the other horizontal reviews. If you haven't started the rest of the horizontal reviews, please consider doing so. -->
- Multi-stakeholder feedback:
  - Chromium comments:
  - Mozilla comments: https://github.com/mozilla/standards-positions/issues/NNN <!-- And/or other places they've given feedback -->
  - WebKit comments: https://github.com/WebKit/standards-positions/issues/NNN <!-- And/or other places they've given feedback -->
  - {{...include feedback/review from developers, implementers, civil society, and others}}
- Major unresolved issues with or opposition to this specification:
- Status/issue trackers for implementations: <!-- Include links to [Chrome Status](https://chromestatus.com/), [Mozilla's](https://bugzilla.mozilla.org/), [WebKit's Bugzilla](https://bugs.webkit.org/), and trackers for other implementations if those are known to you. -->

## You should also know

