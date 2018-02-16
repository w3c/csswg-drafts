# Contributor Guidelines

Contributions to this repository are intended to become part of Recommendation-track 
documents governed by the: 

  * [W3C Patent Policy](https://www.w3.org/Consortium/Patent-Policy-20040205/)
  * [Software and Document License](https://www.w3.org/Consortium/Legal/copyright-software)

To make substantive contributions to specifications, you must either participate
in the relevant W3C Working Group or make a non-member patent licensing commitment.

## Tests

For normative changes for any specification in
[CR or later](https://www.w3.org/Style/CSS/current-work) as well as the pre-CR specifications listed
below, a corresponding [web-platform-tests](https://github.com/w3c/web-platform-tests) PR must be
provided, except if testing is not practical; for other specifications it is usually appreciated.
Typically, both PRs will be merged at the same time. Note that a test change that contradicts the
spec should not be merged before the corresponding spec change. If testing is not practical, please
explain why and if appropriate [file an issue](https://github.com/w3c/web-platform-tests/issues/new)
to follow up later. Add the `type:untestable` or `type:missing-coverage` label as appropriate.

The pre-CR specifications with this testing requirement are currently:

  * cssom
  * cssom-view
