(from [updated cr transitions](https://www.w3.org/Guide/transitions?profile=CR&cr=substantive) )

# Transition request for updated CR: Writing Modes 3

## Document title, URIs, and estimated publication date

CSS Writing Modes Level 3

https://drafts.csswg.org/css-writing-modes-3/

First Tues or Thurs after a successful transition decision.


## The document Abstract and Status sections

[abstract](https://drafts.csswg.org/css-writing-modes-3/#abstract)

[status (as ED)](https://drafts.csswg.org/css-writing-modes-3/#status)

## Link to previous transition

[09 Nov 2015](https://lists.w3.org/Archives/Member/chairs/2015OctDec/0097.html) (W3C Member only)

## Decision to request transition

RESOLVED: Add "size of nearest fixed scrollport" to the list of things you clamp orthogonal flow inline sizes to, editing the CR.

[minutes, 04 Aug 2017 telcon](https://github.com/w3c/csswg-drafts/issues/1391#issuecomment-320215251)

## Changes

* Three features were deferred to Level 4. These were all listed as "at-risk" in the Candidate Recommendation. A fourth feature was marked as "at-risk" but has been retained.
* A Privacy and Security Considerations section was added, the contents of which say 'This specification introduces no new privacy leaks, or security considerations beyond "implement it correctly".' This is not a substantive change.
* [Issue 1391](https://github.com/w3c/csswg-drafts/issues/1391) was a substantive change

[Changes since the December 2015 CR](https://drafts.csswg.org/css-writing-modes-3/#changes-201512)

## Requirements satisfied

(no formal requirements document)

This specification helps meet requirements listed in [Requirements for Japanese Text Layout](https://www.w3.org/TR/jlreq/) 
in particular section "2.3 Vertical Writing Mode and Horizontal Writing Mode".
It also meets requirements listed in an (early ED of) [Text Layout Requirements for the Arabic Script](https://w3c.github.io/alreq/)
in particular section "2.3 Direction".
The number 2.3 has no numerological significance here.

## Dependencies met (or not)

The following normative references are not yet at CR:

* CSS Display Module Level 3
* CSS Inline Layout Module Level 3
* CSS Overflow Module Level 3
* CSS Positioned Layout Module Level 3
* CSS Ruby Layout Module Level 1
* CSS Text Module Level 3
* Cascading Style Sheets Level 2 Revision 2 (CSS 2.2) Specification
* CSS Intrinsic & Extrinsic Sizing Module Level 3
* CSS Paged Media Module Level 3

These are primarily to link to the latest definitions of each term.

## Wide Review

The specification has been reviewed in depth by the I18N Core Working group. Internationalization has published the 
following articles which explain how to use CSS Writing Modes 3.

* [Styling vertical Chinese, Japanese, Korean and Mongolian text](https://www.w3.org/International/articles/vertical-text/)
* [CSS and International Text](https://www.w3.org/International/articles/css3-text/index)
   
## Issues addressed

The [Disposition of Comments](https://drafts.csswg.org/css-writing-modes-3/issues-cr-2015) 

Of the 22 issues raised, 12 were accepted. Three were rejected, and for two of them the commenter indicated they were satisfied. 
Five comments were invalid. One comment was later retracted. One, calling for a Japanese translation of the specification to be linked, was 
rejected as out of scope (translations may be provided by third parties of W3C Recommendations, following the usual procedure). 

## Formal Objections

None

## Implementation

The specification is [widely implemented](http://caniuse.com/#feat=css-writing-mode), although Safari on OSX and iOS 
still uses a -webkit- prefix. We would expect Apple to support the unprefixed property once Writing Modes progresses 
to W3C Recommendation.

The [testsuite](https://test.csswg.org/harness/results/css-writing-modes-3_dev/grouped/filter/1/) shows that
985 of 1143 required tests meet CR exit criteria, and 8 of 17 optional tests meet CR exit criteria.

An [analysis of the test results](https://drafts.csswg.org/css-writing-modes-3/implementation-report.html) is also available
  

:boom:  the tests for features moved to Level 4 are still marked as level 3 tests, so need to be edited to make them Level 4 tests during the CR period, once Writing Modes 4 is published. All tests with `srl` or `slr` in the filename are so affected.

## Patent disclosures

[none](https://www.w3.org/2004/01/pp-impl/32061/status)
