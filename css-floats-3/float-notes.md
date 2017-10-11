Float Notes
===========

Three types of float: inline, side (block, inline), corner.
Side and corner are "page floats".

'float' is shorthand for:

* float-origin: inline | block | flow-root | column | page | page( [ content-box | margin-box | bleed-box ] )
	* 'float' defaults this to "inline" for left/right/start/end single keywords, to "block" for everything else.
* float-policy: ??? (see Håkon's Figures draft)
* float-position:
	left | right | start | end |
	block-start | block-end |
	???
* float-offset: [ <length> | <percentage> | <line-height-unit> ]{1,4}

'clear' means "if something is already there (value of clear), I want to go somewhere else".

* column, page - if you're not the first thing in this column/page + position, move to next fragment and try again

Acceptable Floating Scenarios That Need Syntax
----------------------------------------------

1. inline left/right (today's float)
2. side float to block side of current fragment
	1. always float
	2. float if close to edge, otherwise in-flow
	3. float if crossing fragment boundary, otherwise in-flow
		1. always up (same page, anchor pushes to next)
		2. always down (next page, anchor left on previous)
		3. use JLREQ 4.3.5 condition to determine up or down
3. float to specific fragment
	1. corner float
	2. side float
4. float to subsequent fragment
	1. corner float
	2. side float
5. column spanning/intrusions?

Auto-Switching Float Types
--------------------------

1. in-flow to side
	1. become a side float if close to the edge (Figures’ snap() function)
	2. become a side (bottom of current/top of next) float if falling across a fragment boundary
1. inline/corner to side - some functionality to say if the leftover text space is too small, become a side float instead - JLREQ 4.3.3.e elaborates

Syntaxes???
-----------

1: float: left | right

2.1: float: block-start | block-end
	* two block-end floats - first goes on bottom (similar to float: right)? Do we need a reverse keyword?

2.2: float: snap && [ block-start <<length>>? || block-end <<length>>? || inline-start <<length>>? || inline-end <<length>>? ]

2.3.1: float: before-break
2.3.2: float: after-break
2.3.3: float: across-break

3/4. float: <position> && <origin>? && [ next ?? <integer> ]
(Intentional that you have to specify a particular or subsequent fragment to use this grammar clause.)
<integer> must be positive.

[Brad's thoughts on defining position](https://lists.w3.org/Archives/Public/www-style/2015Nov/0105.html)

	3.1: float: top left 2;
	3.2: float: block-start page 2; /* float to the top of the 2nd page */

Allow %s for the fragment-locator?
For long doc, allows to say "put this about halfway through",
regardless of how it actually fragments on a given screen.
Maybe just source-location + "next" is enough.

Need to define what to do if there isn't a given fragment.


Layout
------

The float-origin changes the float's CB.
	* What happens if there's a BFC boundary between the float's anchor and the desired float-origin?
		Floats shouldn't cross BFC boundaries.
		Require reparenting?
		Talk to implementors about this, as it'll be unpopular.

Resolving conflicts: resolve floats outside-in?
Start at page level, then work inward to find positions of things.

Clearing
--------

Def need the 8 cardinal values matching float-position

* 'both' for left+right
* <origin> for all positions in that origin

If you can't clear, then what?
* stay in-flow (ignore 'float')
* ignore 'clear', just float as normal.
* disappear
* move to another specified position

float: top right;
clear: top left / top right, top right / bottom right, bottom right / bottom left, bottom left / discard;
clear: [ <clear-position> / <clear-behavior>? ]#
* shift (default): shifts below stuff in clear-position (or above for bottom floats)
* <position>
* discard
* unfloat
* unclear
* next <position>? / [ unfloat | unclear | discard ]? (default is unfloat) (triggers if there's no next fragment to go to)

If you can clear, where to move to?
* clear: left/right/both move you down
* page/column floats move to next fragmentainer (or if they're a top float, maybe they want to move to bottom float)

clear: top / bottom, bottom / next top;
/* gives alternating top/bottom behavior, because we re-evaluate 'clear' when moving to another fragment */
