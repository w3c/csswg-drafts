# Proposed Model and APIs for spatial navigation
## Introduction

Historically, most browsers have not offered features to let users move the focus directionally.
Some, such as TV browsers, have enabled users to move the focus using the arrow keys out of necessity,
since no other input mechanism is available on a typical TV remote control.

Others, have enabled different key combinations to control spatial navigation,
such as pressing the <code class=key>Shift</code> key together with arrow keys.

This ability to move around the page directionally is called <strong>spatial navigation</strong>
(or <strong>spatnav</strong> for short).

## What are we going to solve?

### Supporting spatial navigation on a web page by default

- **Getting devices whose only or primary means of navigation is the D-pad**

  Devices like TV, ßIVI, game console mainly use the D-pad for navigating focus directionally.
  In the future, the input mechanism such as voice command, hand gesture, eye gazing can be used for navigation.

- **Making life better for users of desktop browsers who use keyboard to navigate**

   For non sighted users, spatial navigation may not be in high demand. But for users who have the visual impairment which may be corrected with glasses, using keyboard can be much preferable to using mouse.

- **Using the simple and predictable spatial navigation**

  If spatial navigation become default in the browser, it will be easier for authors to implement a web page using this feature without having to write custom navigation code.
  Also it ensures the predictable result and reasonable performance of spatial navigation rather than using frameworks which are quite heavy and slow and don't consider all the diversity of use cases.

### Allowing authors to override the default spatial navigation behavior

Spatial navigation is intended to identify the most-likely desired element in the direction of the key press. But "most-likely desired" can depend on the situation.
Our proposal is possible to provide a behavior that performs well in most cases, but it will not be right for all cases. Hence the overriding APIs let authors tune and tweak the default spatial navigation behavior for their intention.

### Motivating Use cases
#### Moving focus to the desired element quickly
How are we going to look through all elements quickly on a webpage?
There are use cases such as:
- **Using a grid-like layout**

  The figure below represents a photo gallery arranged in a grid layout.
  If the user presses the <code class=key>Tab</code> key to move focus,
  they need to press the key many times to reach the desired element.
  Also, the grid layout may arrange the layout of elements independently of their source order.
  Therefore sequential navigation using the <code class=key>Tab</code> key makes focus navigation unpredictable.
  In contrast, <a>spatial navigation</a> moves the focus among focusable elements
  depending on their position
  allowing it to address problems encountered with sequential navigation.

- **Having too much focusable elements**

  Sometimes user don't want to navigate all focusable elements on a web page. If the user just want to move focus to <code>&lt;input></code> elements, they need to keep pressing the <code class=key>Tab</code> key until the focus reaches one of those.
  On the other hand, <a>spatial navigation</a> can move focus to <code>&lt;input></code> elements only using overriding APIs.


#### Moving focus just as authors intended

How do we ensure the correct element is focused?
There are some use cases which need interrupting the default spatial navigation and custom handling if necessary.

- **Navigating to the offscreen element within scrollport directly**

  There may be a desire about moving the focus to a hidden element while the user is using spatial navigation on a scrollable area. The default behavior of pressing the arrow key is scrolling if there isn’t any visible element in the scrollport. When the hidden element comes into the view, then it can gain the focus. But with proposing overriding APIs, the author can interrupt the default behavior and move the focus directly to it without scrolling.


## How are we going to solve?

The [specification of spatial navigation](https://wicg.github.io/spatial-navigation/) introduces the processing model for spatial navigation which explains the default spatial navigation behavior.
Also, it proposes Javascript APIs, Javascript Events, and a CSS property
to extend how spatial navigation work.

### Activating Spatial Navigation
The spec supposes that User Agents decide to activate spatial navigation.
On devices which do not have any pointing input device,
and especially on devices such as TVs which also lack a <code>Tab</code> key to control
<a herf="https://html.spec.whatwg.org/multipage/interaction.html#sequential-focus-navigation">sequential focus navigation</a>,
User Agents should make spatial navigation active.

### Processing model

When spatial navigation is active,
pressing an arrow key will either
move the focus from its current location to a new focusable item in the direction requested,
or scroll if there is no appropriate item.

More specifically,
the User Agent will first search for visible and focusable items
in the direction indicated
within the current spatial navigation focus container
(by default the root element, scrollable elements, and iframes,
but other elements can be made into spatial navigation focus containers
using the `spatial-navigation-contain` property).

If it finds any, it will pick the best one for that direction,
and move the focus there.

If it does not, it will scroll the spatial navigation focus container in the requested direction
instead of moving focus.
Doing so may uncover focusable elements
which would then be eligible targets to move the focus to
next time spatial navigation in the same direction is requested.

If the spatial navigation focus container cannot be scrolled,
either because it is not a scrollable element
or because it is already scrolled to the maximum in that direction,
the User Agent will select the next spatial navigation focus container up the ancestry chain,
and repeat the process of
looking for eligible focus targets,
selecting the best one if there's any,
scrolling if not,
going up the ancestry chain if it cannot scroll,
until it has either moved focus,
scrolled,
or reached the root.

Additionally, when the user has focused a scroll container which contains focusable elements,
the user may move the focus to the nested elements by pressing arrow keys.
The focus will move to the element which is the closest from the edge of the scroll container in the direction of navigation.

At key points during this search for the appropriate response to the spatial navigation request,
the User Agent will fires events.
These enable authors to prevent the upcoming action
(by calling `preventDefault()`),
and if desired to provide an alternate action,
such as using calling the `focus()` method on a different
element of the author's choosing.

The detailed behavior is described in the [Processing Model](https://wicg.github.io/spatial-navigation/#processing-model).

### Overriding the heuristic algorithm
Authors may want to customize the spatial navigation by overriding the heuristic spatial navigation.

Following the principles of [The Extensible Web Manifesto](https://github.com/extensibleweb/manifesto),
the specification exposes Javascript APIs and Events that enable authors to interact with, and if necessary, override the behavior of spatial navigation.

#### JS APIs

* getSpatnavContainer()
  - Returns the spatial navigation focus container of an element.

* focusableAreas()
  - Returns all focusable elements within a spatial navigation focus container.

* spatNavSearch()
  - Runs the spatial navigation step and returns the best candidate which will gain the focus.

#### Navigation Events
* navbeforefocus
  - Occurs before spatial or sequential navigation changes the focus.

* navbeforescroll
  - Occurs before spatial navigation triggers scrolling.

* navnotarget
  - Occurs before going up the tree to search candidates in the nearest ancestor spatial navigation focus container when spatial navigation has failed to find any candidate within the current spatial navigation focus container.

#### Example
The following code changes the behavior of spatial navigation from scrolling when there is no focusable element visible, to jumping to focusable elements even when they are not visible.
```js
document.addEventListener("navbeforescroll", function(e) {
    var container = e.relatedTarget;
    var areas = container.focusableAreas({ mode: "all" });

    if (areas.length == 0)) { return; }

    e.preventDefault();
    var t = e.target.spatNavSearch({
        dir: e.dir,
        candidates: areas
    });
    t.focus();
});
```

## FAQ

### Why do we need a `spatial-navigation-contain` property? Is it not enough to placing the focusables next to each other to create a group? What use cases do you see for this property?

First, we needed to define a container concept anyway (the blink implementation uses "ScrollableArea or Document"),
to define the rest of the logic.
Then, based on that, pretty much nothing changes in the specification
if we allow users to turn other elements into containers as well,
so we thought it was an easy addition.
It could be removed for now,
as it would be easy to add back later without breaking compatibility,
but was included because we think there is a justification / use case:

Take for example something like a TV program schedule, or a calendar:
it will have a grid of elements representing TV shows or calendar entries,
and some UI buttons around it.
Here's a simplified demo:
http://output.jsbin.com/cuyasob

In this case, the grid is quite sparse,
so if you try to move down from "Foo",
you will end up on "Next Week",
as it is objectively closer in the down direction.
Same for going down from "Bar" and ending up on "Previous Week".

This may be ok,
but quite possibly the author wants to provide a different UX,
where once you are inside the program grid, you mostly want to move inside the grid
(because you are navigating your calendar, so things around it don't matter as much).
If you turn `spatial-navigation-contain: contain` on the table, you get that.
You can still escape it,
for example by going right from "Foo".
Since there is nothing in the grid that is to the right,
you'll go to "Next week",
but if you go down from "Foo" there is something inside the grid,
so it will go there without considering things that are outside.

You could achieve the same effect by wrapping the table in a div
and using the overflow property on the div to make it scrollable,
but that has side effects you probably do not want.

### Maybe authors could create "spatnav containers" with JavaScript instead? Could they listen for spat nav events to cancel (=preventDefault) the navigation? Such an event could give authors even more freedom: they might wanna grab the event and manually put focus somewhere else (to override the spatnav's default choice). Would such event allow authors to "patch" the default algorithm in a more flexible way?

Yes, they absolutely could.
We have prepared the spec with an event model that lets js authors take control,
and override the default spatnav also to do anything they like.
That could indeed be used to manually create spatial navigation containers other than documents or scrollers.

We had various idea for other controls to influence what gets the focus,
(e.g. looping when you reach an edge, picking a different heuristic...),
and we decided to leave these out because they could indeed be left to JS
and be added later with declarative syntax if there was strong demand.

However, we still included this property, because:
1. This is trivial to add to the spec (and presumably, to implementations as well), since the concept of looking for a container and searching for focusable things inside it is built-in into the spatnav logic, and we're merely exposing a hook to add additional containers
2. Recreating that logic in JS if you're fine with everything else could be quite fiddly
3. It seems like a fairly basic need

## Demo
- [Blog using the spatial navigation polyfill](https://wicg.github.io/spatial-navigation/demo/blog/)

- [Samples using the spatial navigation polyfill](https://wicg.github.io/spatial-navigation/sample/)

- [Samples for testing the implementation in Blink](https://wicg.github.io/spatial-navigation/blink_impl/heuristic_default_move.html)

  ***Note***: Samples work best in the latest Chrome with the experimental web platform features enabled (--enable-spatial-navigation flag) otherwise they won't work.
