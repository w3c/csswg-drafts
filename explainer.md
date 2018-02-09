# Proposed Model and APIs for spatial navigation

## Introduction

Historically, most browsers have not offered features to let users move the focus directionally.
Some, such as TV browsers, have enabled users to move the focus using the arrow keys out of necessity,
since no other input mechanism is available on a typical TV remote control.

Others, have enabled different key combinations to control spatial navigation,
such as pressing the <code class=key>Shift</code> key together with arrow keys.

This ability to move around the page directionally is called <strong>spatial navigation</strong>
(or <strong>spatnav</strong> for short).

Spatial navigation can be useful for a webpage built using a grid-like layout,
or other predominantly non linear layouts.
The figure below represents a photo gallery arranged in a grid layout.
If the user presses the <code class=key>Tab</code> key to move focus,
they need to press the key many times to reach the desired element.
Also, the grid layout may arrange the layout of elements independently of their source order.
Therefore sequential navigation using the <code class=key>Tab</code> key makes focus navigation unpredictable.
In contrast, <a>spatial navigation</a> moves the focus among focusable elements
depending on their position
allowing it to address problems encountered with sequential navigation.

<img alt="Illustration of a layout which benefits from spatial nativation" src="images/spatnav-enable.png" style="width: 500px; margin: auto; display: block"/>

While arrow keys are naturally suited to control spatial navigation,
pressing them (on devices that have such keys)
has generally triggered other behavior,
such as scrolling.
This specification introduces CSS properties and Javascript APIs
enabling authors to turn on spatial navigation using arrow keys
and to control its behavior.

Some aspects of this specification, such as the Javascript Events,
also extends how sequential navigation work,
in order to make sure that keyboard navigation in general
has a consistent and well defined model.


## Overview 

Spatial navigation is said to be <strong>active</strong> on an element
when the user can invoke spatial navigation
by pressing the arrow keys without modifier keys
when that element is focused.

Authors can activate spatial navigation
on a document or part of a document
using the `spatial navigation` property.

On devices which do not have any pointing input device,
and especially on devices such as TVs which also lack a <code>Tab</code> key to control
<a herf="https://html.spec.whatwg.org/multipage/interaction.html#sequential-focus-navigation">sequential focus navigation</a>,
User Agents should make spatial navigation active.

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
using the `spatnav-container` property).

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

Additionally, when the user has focused a <a>scroll container</a> which contains focusable elements,
the user may move the focus to the nested elements by pressing <code class=key>Enter</code>.

The User Agent will then follow a similar logic: first, search for visible and focusable items
within the currently focused <a>scroll container</a>,
and if there is any,
select the best one and move the focus there.

At key points during this search for the appropriate response to the spatial navigation request,
the User Agent will fires events.
These enable authors to prevent the upcoming action
(by calling `preventDefault()`),
and if desired to provide an alternate action,
such as using calling the `focus()` method on a different
element of the author's choosing.

## Overriding methods on top of the heuristic algorithm
Developers may want to customize the spatial navigation with CSS properties by overriding the heuristic spatial navigation.

### Approach proposed by the current specification

Following the principles of the [The Extensible Web Manifesto](https://github.com/extensibleweb/manifesto),
the specification exposes Javascript APIs and Events that enable authors to interact with, and if necessary, override the behavior of spatial navigation.

### Current Approach of the CSS Basic User Interface Module Level 4

CSS Basic User Interface Module Level 4 offers 3 properties that can override the spatial navigation heuristic.
This is currently not integrated with the present draft, but that could easily be done. They could also be implemented as a polyfil on top of the Javascript APIs and Events offered by the spatnav specification.

There were the properties about the directional focus navigation in the CSS Basic User Interface Module Level 4.
- [nav-up/right/down/left properties (CSSUI4)](https://drafts.csswg.org/css-ui-4/#nav-dir)
```css
// nav-right, nav-down, nav-left have same values as nav-up below
nav-up: auto | <id> [ current | root | <target-name> ]?
```  
- The properties determine which element to navigate the focus in response to pressing the arrow keys. This is applied to each element which can be focused.
- Note
  - Able to use even if the heuristic spatial navigation is not supported.
  - Override the heuristic spatial navigation if it is supported.
- Issues
  - Why CSS properties instead of HTML attributes (like `tabindex` as a DOM attribute)?
  - How does the feature interact with the existing definition of focus and what is or isn't focusable?
  - How can the feature be made to be composable?
    - E.g. in a world of custom elements and frameworks like polymer, how can you reason about spatial navigation without having global knowledge of the whole page?
    - E.g. could we instead make the properties define local spatial navigation (e.g. between components) while allowing components to determine navigation behavior inside of themselves?


### Other suggested extensions
The following properties have been suggested to provide ways for customization of the spatial navigation.
The current specification does not integrate them.
We prefer focusing on the base functionality for the moment,
offering author the ability to add their own behavior via Javascript APIs.

If experience shows that authors often use the javacript APIs to create solutions
similar to the features described below,
they could be considered for standardization in a later stage.

#### `nav-rule` property (CSSUI4)
- This property can customize the spatial navigation of the group of elements in response to pressing the arrow keys.
```css
nav-rule: auto | projection | direction | nearest
```
- The meaning of `nav-rule` values
  - auto: The UA automatically determines which element to navigate the focus.
  - projection: Moves the focus to the first element encountered when projecting the edge of the currently focused element to the edge of the applied element in the direction of navigation.
  - direction : Moves the focus to the first element encountered when projecting the edge of the applied element from the currently focused element in the direction of navigation.
  - nearest: Moves the focus to the closest element based on the shortest 2D distance and the distance is measured depending on the center of each element.
- Note  
  - Able to use if the heuristic spatial navigation is enabled by default.
  - Applied to the containing block, so all focusable elements in the DOM subtree rooted at the applied element follow the specified rule for the spatial navigation.
  - Overridden by nav-left/right/top/bottom properties.
  - Override the Heuristic Spatial Navigation if it is supported.
- If the `nav-rule` property is applied to the element E, the focus moves in the DOM subtree rooted at E in the scrollable area created by E as below.    
    ```html
    // HTML
    <div id="E">
        <div id="A" tabindex="1" style="top: 100px; left: 50px;">A</div>
        <div id="B" tabindex="1" style="top: 250px; left: 150px;">B</div>
        <div id="C" tabindex="1" style="top: 50px; left: 200px;">C</div>
        <div id="D" tabindex="1" style="top: 100px; left: 300px;">D</div>
    </div>
    ```
    ```css
    // CSS
    #E { width: 400px; height: 300px; }
    #A, #B, #C, #D { width: 50px; height: 50px; }
    ```
    ![The results of the next focused element are differ from the value given to nav-rule](images/nav-rule-example.png)
    
    - If the currently focused element is A and there is input from the :arrow_right: (right-arrow key),
      - If `nav-rule: projection` is applied to the element E, the focus moves to D.
      - If `nav-rule: direction` is applied to the element E, the focus moves to B.
      - Otherwise `nav-rule: nearest` is applied to the element E, the focus moves to C.
      
#### `nav-loop` property (CSSUI4)
- This property enables the ability about the focus looping (moving the focus when the focus reaches the end of the page).
- The sequential focus navigation by tab key supports the focus looping, but the heuristic spatial navigation implemented in blink does not support it.
- It would be useful to have the focus looping feature in the spatial navigation, especially for the single page with long-scroll. 
```css
nav-loop: auto | no-repeat | repeat
```
- The meaning of `nav-loop` values
  - auto: The UA automatically determines where to move the focus when the focus reaches the end of the page.
  - no-repeat: Disables the focus looping
  - repeat: Enables the focus looping

- If `nav-loop: repeat` is applied to the element E, the DOM subtree rooted at E is eligible to participate in the focus looping for any scrollable area created by E.
  - Let the element A is the first child node, and the element Z is the last child node in the DOM subtree rooted at E.
  - If the currently focused element is Z and there is an input from the :arrow_down: (down-arrow key), the focus is moved to A.

## FAQ

### Why is `spatial-navigation` a CSS property? Could we have an element attribute do the same thing? What's best in terms of web practices/standards?

CSS is 99% about styling and we should not be too careless about adding non-styling things to it,
but the CSSWG is open to non styling things in css as long as it makes sense from a coupling point of view.
`-webkit-user-modify` was an example of something that didn't belong in CSS,
because it is arguably part of the document's semantics,
and would never do anything useful anyway without some JS.

For activating spatnav, our logic is that it isn't semantic,
and is useful even in the absence of JS,
so CSS is the most practical place to put it in:

* Spatnav isn't about the semantics of the marup
* With markup alone, you do not know if spatnav is going to be appropriate for the document/app or not. You need to consider the layout and the JS application logic to figure out if spatnav is more likely to help or to clash with the way the layout is built, with event handlers, animations, and what have you. So that leaves us with two choices: put it in JS, or put it in CSS.
* The likelyhood that spatnav clashes with something in JS is arguably somewhat higher than the likelyhood that it would work poorly due to a weird layout, however:
    * There can be documents written without javascript at all that could want to turn on spatnav
    * Some users turn JS off, ad blockers sometimes block some JS, JS sometimes fail to load for other reasons broken for other reasons (ES6 parse error, network issue, etc), and there's not reason for that to turn off spatnav if the rest still works.
    * As an author if you really prefer to set it in JS, it is trivial to set css properties from js. If you would really prefer to put it in the markup, you can use the style attribute. But the opposite isn't true, and you cannot set markup or JS things from CSS.

### Why do we need a `focus-container` property? Is it not enough to placing the focusables next to each other to create a group? What use cases do you see for focus-container?

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
Here's an simplified demo:
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
If you turn `focus-container: create` on the table, you get that.
You can still escape it,
for example by going right from "Foo".
Since there is nothing in the grid that is to the right,
you'll go to "Next week",
but if you go down from "Foo" there is something inside the grid,
so it will go there without considering things that are outside.

You could achieve the same effect by wrapping the table in a div
and using the overflow property on the div to make it scrollable,
but that has side effects you probably do not want.

### Maybe authors could create "spatnav containers" with JavaScript instead? They could listen for spat nav events to cancel (=preventDefault) the navigation? Such an event could give authors even more freedom: they might wanna grab the event and manually put focus somewhere else (to override the spatnav's default choice). Such event would allow authors to "patch" the default algorithm in a more flexible way?

Yes, they absolutely could.
We have prepared the spec with an event model that lets js authors take control,
and override the default spatnav algo to do anything they like.
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
- [Calendar App using the proposed spatial navigation features](https://wicg.github.io/spatial-navigation/demo/)
- [Test cases for the heuristic spatial navigation](https://wicg.github.io/spatial-navigation/demo/heuristic/heuristic_testcases)
