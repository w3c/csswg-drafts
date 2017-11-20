# Spatial Navigation
This is a repository for making the Web excellently embrace the spatial navigation's features so that the Web technology can be propagated into several industries such as TV, IVI, game console, and upcoming smart devices as well as PC and mobile for a11y.

This repository consists of the basic description for the spatial navigation, landscapes of the relevant industries, and the current status of [W3C standardization](explainer.md) and [Implementation of Web engines](implStatus.md) such as Blink, WebKit, Gecko, and EdgeHTML, while the relevant issues would be discussed in W3C working groups and Web engine open source communities.

You're welcome to contribute! If you have something to say for the spatial navigation, please kindly put it on [issues](https://github.com/WICG/spatial-navigation/issues) of this repository or send it via [email](mailto://lgewst@gmail.com). Let's make the Web to be extensible for the several industries!

## Overview
**Spatial navigation (aka Spatnav)** is the ability to navigate between focusable elements based on their position within a structured document. Spatial navigation is often called 'directional navigation' which enables four(4) directional navigation. Users are usually familiar with the 2-way navigation using tab key for the forward direction and shift+tab key for the backward direction, but not familiar with the 4-way navigation using arrow keys.

Regarding TV remote control, game console pad, IVI jog dial with 4-way keys, and Web accessibility, the spatial navigation has been a rising important input mechanism in several industries. If the Web can embrace the spatial navigation and efficiently support the functionalities in Web engines and W3C APIs, it will be more promising technology for existing products as mentioned above and various upcoming smart devices.

## Mission
Prior to the mission explanation, we need to understand how the arrow keys work currently on the Web. If you're watching this page in a normal HD monitor and desktop, not mobile, please push a down-arrow key on your keyboard. What happens? Basically, scrolling downward would be triggered. That's the default behavior of arrow keys in the Web, only when the page is scrollable in the direction.

In spatial navigation mode, the default behavior of arrow keys is changed from scrolling behavior to focus moving so that users can use the arrow keys to navigate between focusable elements based on their position. To support the functionalities of the spatial navigation, we should consider the following three steps:
1. The new API for enabling the spatial navigation mode (HTML/CSS/JS)
2. A heuristic algorithm for the spatial navigation in Web engines
3. Overriding methods on top of the heuristic algorithm

See the [explainer](explainer.md) for the details of W3C standardization for #1 and #3 above.
 
See the [implStatus](implStatus.md) for the details of the implementation in Web engines for #2 above.

## FAQ
**Q. I’m not sure how the Spatnav (directional) navigation works.**
- You can see the video that shows the Spatnav operations in the YouTube page ([link](https://www.youtube.com/watch?v=TzDtcX9urUg)).
- You can see the brief description for the Spatnav in Wikipedia ([link](https://en.wikipedia.org/wiki/Spatial_navigation)).
- In several references below, you can get the help to understand the Spatnav operations well.

**Q. Isn’t it enough just using the relevant Web frameworks?**
- Several Web frameworks and extensions for the Spatnav have been provided so far due to no support from web engines. For examples, [js-spatial-navigation](https://github.com/luke-chang/js-spatial-navigation) made by Mozilla seems one of the frameworks and its quality would be good to support the features of Spatnav. [Spotlight library](https://github.com/enyojs/spotlight) implemented by LGE is also an instance of the frameworks for the Spatnav, even though it was deprecated now. However, the support of Spatnav from Web frameworks has some limits as follows:
  - Difficult to align native scroll behavior when moving the focus to an element out of view
  - Difficult to align native focus method for a11y support
  - Performance degradation due to the expensive cost of DOM Access
  - Inconsistency of user experience (various kinds of frameworks)
  - Impossible to control isolated frames like iframe and shadow DOM

**Q. The Spatnav seems not the general feature esp. in mobile with no physical key-based interface.**
- Honestly, the mobile has been a first citizen of Spatnav about 10 years old. Before touch-based interface, the majority of interface for mobile was the key-based interface. We're familiar with kind of mobile phone named a feature phone, and it has been supported in several developing countries such as South America, Africa even until now.

- In the future, the input method for smart devices will change to something like voice command, hand gesture, and gaze direction, but the key-based interface will never disappear, even though it'll be used as a secondary method. The key-based interface used to be evaluated as one of the most intuitive ways with a strong sense feedback of finger after pushing a key, while we couldn't imagine a touch-based keyboard without any physical keys.

**Q. Put any question on [issues](https://github.com/WICG/spatial-navigation/issues) of this repository :D**
- Everything for Spatnav is welcome!

## Reference
- JavaScript Spatial Navigation (Mozilla)
  - https://github.com/luke-chang/js-spatial-navigation
- Spotlight library for spatial navigation (LG Electronics)
  - https://github.com/enyojs/spotlight (deprecated)
- Implementing TV remote control navigation (MDN)
  - https://developer.mozilla.org/en-US/docs/Mozilla/Firefox_OS_for_TV/TV_remote_control_navigation
- Focus navigation with keyboard, gamepad, and accessibility tools (MS)
  - https://docs.microsoft.com/en-us/windows/uwp/input-and-devices/managing-focus-navigation
- Designing for Xbox and TV (MS)
  - https://docs.microsoft.com/en-us/windows/uwp/input-and-devices/designing-for-tv
- Spatial Navigation in the Web (slides presented in BlinkOn 8)
  - https://docs.google.com/presentation/d/1x4RaJIzTYeX0-nySVuq0TThe5shfmOsjbGIMrZJLBTE/edit
