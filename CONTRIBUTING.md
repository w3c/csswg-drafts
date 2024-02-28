# Contributor Guidelines

Thank you for your interest in contributing to the [CSS Working Group](https://www.w3.org/Style/CSS/) 
drafts!

Contributions to this repository are intended to become part of Recommendation-track 
documents governed by the: 

  * [W3C Patent Policy](https://www.w3.org/Consortium/Patent-Policy-20200915/)
  * [Software and Document License](https://www.w3.org/Consortium/Legal/copyright-software)

To make substantive contributions to specifications, you must either participate
in the relevant W3C Working Group or make a non-member patent licensing commitment.

## Issue disclosure and discussion

The first step for any substantive contribution is to either:

  1. [Find an existing issue](https://github.com/w3c/csswg-drafts/issues) directly related to the contribution
  2. [Add a new issue](https://github.com/w3c/csswg-drafts/issues/new)

Issues are where individual reports and Working Group discussions come together such 
that the eventual consensus can be turned into official specification language.

If you are familiar with a [GitHub-based pull request contribution workflow](https://help.github.com/articles/about-pull-requests/), 
please note that **most issues are subject to quite a bit of discussion** before 
they are ready for a pull request with specific wording changes. Please ensure
the full problem space of the issue is explored in the discussion, and that
consensus has been reached by the participants, before drafting a pull request.

## Normative and/or substantive contributions

The CSS Working Group operates via the consensus of its membership, and discusses 
all significant matters prior to implementation.

The Editors responsible for a particular spec are responsible for triaging their
issues on a regular basis; however note that sometimes this can take awhile
(anywhere from a few days to a few years) depending on the complexity of the
issue and the work schedules of people involved--this does not mean we are
ignoring the issue.

When issues need WG discussion or approval, WG members should label the issue
'Agenda+' to bring it to the Working Group's attention. Unfortunately,
GitHub doesn't allow labelling permissions without repository write permissions,
so if you believe an issue is urgent or discussion has stalled for awhile and
the WG's attention is needed to move forward, ask one of the Editors to flag it.

In general, you should not directly commit changes to a draft unless you are an
Editor of that draft, or have their explicit permission. If you are not an 
Editor of a draft, but wish to contribute changes, the best practice is to either 
work directly with an Editor to review proposed text, or file your proposal as a 
pull request (PR) originating from your own fork. Substantive changes
need WG consensus, not merely Editor agreement; typographic error and markup fixes
are generally okay to commit, but any substantive changes should have
clear WG consensus. Substantial changes or additions to non-normative text
should still have clear Editor approval.

In any case, WG consensus is expected prior to merging changes, and consensus is 
determined by the Chairs (not self-assessed) via synchronous decisions during 
meetings, and occasionally via async CFCs. Some degree of discretion is afforded 
to Editors to make changes prior to WG consensus, particularly early in a spec or 
feature's lifecycle, although Editors must confirm those changes with the WG 
prior to republishing on TR. References to the discussion and the WG consensus 
should be placed in the issue or commit. Agreement from an Editor in an issue 
is not a substitute for WG consensus.

The Working Group, aside from managing issues on GitHub, mainly discusses
specifications and requests on [the www-style public mailing list](https://lists.w3.org/Archives/Public/www-style/),
and in CSSWG meetings, whose minutes are posted to www-style.

### After discussion

Once the Working Group has come to a consensus, the editor may draft up and
commit the relevant changes for review by other contributors or a contributor
may file a pull request against the issue for review by the editor(s). Since
specification wording is tricky, it is strongly recommended that the editors
of that particular spec be involved, either as originator or as reviewer, in
any changes. We also encourage other participants in the issue discussion to
review the changes and request corrections or improvements as necessary.

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

For simple spelling, grammar, or markup fixes unrelated to the substance of a
specification, issuing a pull request without a corresponding issue is acceptable.

## Further information

Specification source files are in [Bikeshed format](https://tabatkins.github.io/bikeshed/).
The CSSWG wiki has more information on other [CSSWG tooling](https://wiki.csswg.org/tools).

See [about:csswg](http://fantasai.inkedblade.net/weblog/2011/inside-csswg/)
for more information on how the CSSWG operates, delegates authority, and
makes decisions. Someday maybe we'll also have a useful official website.
