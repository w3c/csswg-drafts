# Spatial Navigation Polyfill

## What is this?

This is a JavaScript implementation of the [Spatial Navigation Specification](https://wicg.github.io/spatial-navigation/).

It enables users to navigate the page using the arrow keys of the keyboard (or remote control, or game pad…),
instead of (or in addition to)
the <code class="key">Tab</code> key,
the mouse cursor,
or the touch screen.

Depending on the content and layout of the page,
pressing one of the directional keys
will either move the focus in that direction,
or scroll the page, as appropriate.

For more details, see [the specification](https://wicg.github.io/spatial-navigation/)
or [its explainer document](https://wicg.github.io/spatial-navigation/explainer.html).

## Why use the Polyfill

Eventually, we expect spatial navigation to be natively supported by browsers.
However, this is not yet the case.

Until then, authors who wish to experiment with providing this feature to their users
can include this polyfill in their page.

It can also be used for people interested in reviewing the specification
it order to test the behavior it defines in various situations.

## Current Status

The polyfill is not yet complete.
It roughly matches the specification
but does not yet follow it closely,
and has a number of known issues.

See [the list of open bugs](https://github.com/wicg/spatial-navigation/issues?q=is%3Aissue+is%3Aopen+label%3Atopic%3Apolyfill) in github.

## How to Use

### Including the Polyfill in a page

Include the following code in your web page,
and the polyfill will be included,
enabling spatial navigation.

```html
<script src="https://wicg.github.io/spatial-navigation/polyfill/spatnav-heuristic.js"></script>
<script src="https://wicg.github.io/spatial-navigation/polyfill/spatnav-api.js"></script>
<script>focusNavigationHeuristics();</script>
```

Users can now user the keyboard's arrow keys to navigate the page.

### Using the APIs

The spatial navigation specification defines several JavaScript [events](https://wicg.github.io/spatial-navigation/#events-navigationevent) and [APIs](https://wicg.github.io/spatial-navigation/#js-api).
Using these is not necessary to use the polyfill,
and users can start using the arrow keys as soon as the polyfill is included,
but they can be convenient for authors who wish to override the default behavior in some cases.
See the specification for more details.

Following [the guidance from the W3C Technical Architecture Group](https://www.w3.org/2001/tag/doc/polyfills/#don-t-squat-on-proposed-names-in-speculative-polyfills),
the polyfill provides these features under alternative names,
to avoid interfering with the standardization process.

| Standard Name | Polyfill Name |
|-|-|
| navbeforefocus | navbeforefocusPolyfill |
| navbeforescroll | navbeforescrollPolyfill |
| navnotarget | navnotargetPolyfill |
| spatNavSearch() | spatNavSearchPolyfill() |
| navigate() | navigatePolyfill() |
| getSpatnavContainer() | getSpatnavContainerPolyfill() |
| focusableAreas() | focusableAreasPolyfill() |


## Usage in automated tests

Automated tests for the specification are written assuming standard syntax.
In order to be able to use the Polyfill to run those tests,
it is possible to load it in a special mode
where it uses the standard names for the APIs and Events,
unlike what is described in section [#using-the-apis].

**It is recommended not to use this option
for purposes other than runing the automated tests of the specication**.

````html
<script>var spatnavPolyfillOptions = {"standardName": "true" };</script>
<script src="../polyfill/spatnav-heuristic.js"></script>
<script src="../polyfill/spatnav-api.js"></script>
<script>focusNavigationHeuristics();</script>
```
