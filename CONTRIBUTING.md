# Contributor Guidelines

Thank you for your interest in contributing to the [CSS Working Group](https://www.w3.org/Style/CSS/) 
drafts!

Contributions to this repository are intended to become part of Recommendation-track 
documents governed by the: 

  * [W3C Patent Policy](https://www.w3.org/Consortium/Patent-Policy-20040205/)
  * [Software and Document License](https://www.w3.org/Consortium/Legal/copyright-software)

To make substantive contributions to specifications, you must either participate
in the relevant W3C Working Group or make a non-member patent licensing commitment.

## Issue disclosure and discussion

The first step for any contribution, substantive or not, is to either:

  1. [Find an existing issue](https://github.com/w3c/csswg-drafts/issues) directly related to the contribution
  2. [Add a new issue](https://github.com/w3c/csswg-drafts/issues/new)

Issues are where individual reports and Working Group discussions come together such 
that the eventual consensus can be turned into official specification language.

If you are familiar with a [GitHub-based pull request contribution workflow](https://help.github.com/articles/about-pull-requests/), 
please note that **most issues are subject to quite a bit of discussion** before 
draft language becomes ready for a pull request. Please ensure the full problem 
space of the issue is explored in the discussion, and that consensus has been reached 
by the participating members, before contributing to the 
repository.

## Normative and/or substantive contributions

The CSS Working Group operates via the consensus of its membership, and discusses 
all significant matters prior to implementation.

If adding an new, normative issue, please label/tag the PR as 'Agenda+' to bring 
it to the Working Group's attention.

The Working Group, aside from managing issues on GitHub, mainly discusses specifications 
and requests on [the www-style public mailing list](https://lists.w3.org/Archives/Public/www-style/), 
and in CSSWG meetings.

### After discussion

Once the Working Group has come to a consensus, a contributor may file a pull request 
against the issue. The editor of the specification related to the issue will then be 
responsible for reviewing both the content and implementation of the contributed 
changes.

Please follow the [Pull Request template](https://github.com/w3c/csswg-drafts/blob/master/.github/PULL_REQUEST_TEMPLATE.md) 
when contributing to the repository.

### Tests

For normative changes for any specification in
[CR or later](https://www.w3.org/Style/CSS/current-work) as well as the pre-CR specifications listed
below, a corresponding [web-platform-tests](https://github.com/web-platform-tests/wpt) PR must be
provided, except if testing is not practical; for other specifications it is usually appreciated.

Typically, both PRs will be merged at the same time. Note that a test change that contradicts the
spec should not be merged before the corresponding spec change. If testing is not practical, please
explain why and if appropriate [file an issue](https://github.com/web-platform-tests/wpt/issues/new)
to follow up later. Add the `type:untestable` or `type:missing-coverage` label as appropriate.

The pre-CR specifications with this testing requirement are currently:

  * cssom
  * cssom-view

## Non-substantive contributions

For simple spelling, grammar, or markup fixes unrelated to the substance of a specification, 
please file an issue with the usual shortname tagging (ie. `[css-foo]`) for the spec(s) 
edited by the change. You may then issue a pull request referencing the issue number.
