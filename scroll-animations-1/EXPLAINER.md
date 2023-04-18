
# Scroll-driven Animations Explainer

## Participate
[Issue tracker](https://github.com/w3c/csswg-drafts/labels/scroll-animations-1)

## Introduction

Scroll-driven animations are a common UX pattern on the web. We are proposing a new API that works
in conjunction with existing [Web Animations](https://drafts.csswg.org/web-animations/) and [CSS
Animations](https://drafts.csswg.org/css-animations/) APIs to enable declarative scroll driven
animations to improve their smoothness and ergonomics. In Web Animations, an
[AnimationTimeline](https://drafts.csswg.org/web-animations/#timelines) is the source of time
progress that drives the animations. ScrollTimeline and ViewTimeline are new timelines whose function is to
translate “changes in scroll position” of an element into “changes in time”. This allows animations
to be driven by scrolling as opposed to by wall clock thus taking advantage of all existing
animation machinery on the web.

## Motivating Use Cases and Goals

Scroll-driven animated effect are common in web design:
* Parallax Effects
* Reveal/Unreveal effects
* Image Zoom effects
* Progress-bar animations
* Scroll-driven Before/After Image slider
* Creative scroll-driven story-telling


Currently the only way to achieve them is to respond to scroll events on the main thread. This
means that these animations have to run on the main thread which leads to two main problems:
1. Modern browsers perform scrolling on separate thread/process so scroll events are delivered
   asynchronously.
2. Main thread animations are subject to jank.

These make creating performant scroll driven animations that are in-sync with
scrolling impossible or [very
difficult](https://developers.google.com/web/updates/2016/12/performant-parallaxing).


Our primary goal is to enable declarative scroll-driven animations that can be easily moved off
main thread similar to existing time-based web animations. Our secondary goal is to bring
scroll-driven animation under the existing common web-animation model allowing them to be created,
inspected, controlled via a common animations API.

### Non-goals

#### Scroll-triggered animations

These are a class of animation whose progress is driven by time but whose activation may be
triggered when scrolling past a certain position or into a given scroll range.  These are also
common on the web but they don't suffer from main thread jank and synchronous scrolling lag in the
same way that scroll-driven animations do. This is because only their activation is tied to scroll
position and not their progress.

However, we found that in the vast majority of cases where a web author would want to do this, they
would want to do it for a CSS transition (as opposed to a CSS animation). Unfortunately, it's not
possible to trigger CSS transitions from the compositor thread (because triggering a transition
requires style resolution, which cannot be performed on the compositor thread).

Earlier versions of this specification included a triggering mechanism. But given the extent to
which triggering complicated the API and because of the smaller benefit that these type of
animation will receive, we decided it wasn't worth it if you can't use it for transitions, so this
feature was remove and scroll-triggered animations are non-goal for this API.


At the moment, the current best practice is to use IntersectionObserver to kick-off such animation
which seems sufficient. Other alternative ideas (`:ever-been-visible` pseudo class or generic
animation-trigger) have been proposed
[here](https://github.com/w3c/csswg-drafts/issues/4339#issuecomment-499666491) that the current
scroll-driven animations proposal does not prohibit.
The design space for triggering animations is still open and we welcome input on this subject for future revisions in this specification.

#### Stateful scripted scroll-driven animations

Some scroll-driven animations may not fit well within declarative animations such as those that
depend on scroll velocity, or direction, or have custom per frame logic. We believe these can
continue to be solved using rAF (and in future be made more efficient with [Houdini Animation
Worklet](https://drafts.css-houdini.org/css-animationworklet/)). ScrollTimeline and ViewTimeline
may be used in conjunction with these.

## New APIs

The [Scroll-driven Animations](https://drafts.csswg.org/scroll-animations-1/) spec introduces two
new timelines: ScrollTimeline and ViewTimeline

These timelines can be constructed via Javascript or declared via CSS,
being implicitly constructed and used as the timeline for CSS animations.

The [Web Animations](https://www.w3.org/TR/web-animations-1/) spec has been updated to support
the use of progress-based "time" values as the input from which to derive the animation local
time.

### ScrollTimeline

A [ScrollTimeline](https://drafts.csswg.org/scroll-animations-1/#scrolltimeline-interface) is an
[AnimationTimeline](https://drafts.csswg.org/web-animations-1/#the-animationtimeline-interface)
whose time values are determined by the progress of scrolling in a
[scroll container](https://drafts.csswg.org/css-overflow-3/#scroll-container). A ScrollTimeline
converts a position in a scroll range to a progress.
The time value a ScrollTimeline produces is determined by the following algorithm:

```
Timeline current time = (current scroll offset) / (scrollable overflow size - scroll container size)
```

A ScrollTimeline is specified by two parameters:
* **[source](https://drafts.csswg.org/scroll-animations-1/#dom-scrolltimeline-source)**: The
  scrollable element whose scrolling drives the progress of the timeline.
* **[axis](https://drafts.csswg.org/scroll-animations-1/#dom-scrolltimeline-axis)**:
  Determines the scrolling orientation which triggers the activation and drives the progress of the trigger.

### ViewTimeline

A [ViewTimeline](https://drafts.csswg.org/scroll-animations-1/#viewtimeline-interface) is an
[AnimationTimeline](https://drafts.csswg.org/web-animations-1/#the-animationtimeline-interface)
whose time values are determined by the relative progress of a particular element
scrolling through its [scroll container](https://drafts.csswg.org/css-overflow-3/#scroll-container).
The time value a ViewTimeline produces is determined by the following algorithm:

```
Timeline current time = (current scroll offset - start offset) / (end offset - start offset)
```

Where:
* `start offset` is the scroll offset at which the start border edge of the element's principal box
  coincides with the end edge of the scroll port (reduced by insets).
* `end offset` is the scroll offset at which the end border edge of the element's principal box
  coincides with the start edge of the scroll port (reduced by insets).

Note: These offsets are not clamped and thus may be less than 0 or beyond the scrollable range of the scrollport.

A ViewTimeline extends ScrollTimeline and adding one additional parameter:
* **[subject](https://drafts.csswg.org/scroll-animations-1/#dom-viewtimeline-subject)**:
  The element whose principal box’s visibility in the scrollport defines the progress of the timeline.

#### JavaScript APIs

```html
<div class="target"></div>
<div class="scroller">  <!-- 100x100 viewport -->
  <div class="contents"></div>  <!-- 500x500 -->
</div>

<script>
  const scrollTimeline = new ScrollTimeline({
      source: scroller,
      orientation: 'block',  // Default value.
  });
  const effect = new KeyframeEffect(target, { opacity: [1, 0] }, {});
  const animation = new Animation(effect, scrollTimeline);
  animation.play();
</script>
```

#### CSS syntax

The spec introduces `scroll-timeline` and `view-timeline` shorthands with appropriate longhand properties for defining timelines,
`scroll()` and `view()` functions for defining anonymous timelines,
as well as `animation-range` and `animation-timeline` properties on animation targets to link to timelines which
allow scroll-drive animation to be entirely specified in CSS.

Here is an example to demonstrate this which fades the target
as its nearest ancestor scroller scrolls from zero to its scroll range.

```css
#target {
  animation: fade;
  animation-timeline: scroll();
}

@keyframes fade {
  from { opacity: 1 }
  to { opacity: 0 }
}
```

It is possible to define and use a timeline name to associate a single timeline with multiple animations.
Here is a more complex example of colliding circles that demonstrates this:

```css
div.circle {
  animation-timing-function: linear;
  animation-fill-mode: forwards;
  animation-range: 200px 300px;
}
#left-circle {
  animation-name: left-circle;
  animation-timeline: collision-timeline;
}
#right-circle {
  animation-name: right-circle;
  animation-timeline: collision-timeline;
}
#union-circle {
  animation-name: union-circle;
  animation-timeline: collision-timeline;
  animation-range: 250px 300px;
}

#container {
  scroll-timeline-name: collision-timeline;
}

@keyframes left-circle {
  to { transform: translate(300px) }
}
@keyframes right-circle {
  to { transform: translate(350px) }
}
@keyframes union-circle {
  to { opacity: 1 }
}
```

#### View timeline animations

A very common usage pattern for scroll timeline is that the animation is not based on the absolute
scroll position, but instead based on the location of an element within the scroller. Most commonly
this is when the element enters the scroller viewport. View timelines provide a means to address
these use cases by defining animations in terms of the relative progress of an element through its
nearest ancestor scrollport.

Here is a simple example that shows how this can be used to fade-in an element as it enters the
viewport until it becomes fully visible.


```javascript

const image = document.getElementById("image");

const revealTimeline = new ViewTimeline({subject: image});

const animation = image.animate(
  { opacity: [0, 1] },
  {
    timeline: revealTimeline,
    fill: 'both',
    // The animation starts at the offset that corresponds with image starting
    // to enter scrollport (i.e., 0% intersect with scroller at its “end” edge).
    rangeStart: 'entry 0%',
    // The animation ends at the offset that corresponds with image becoming
    // fully visible (i.e., 100% intersect with scroller at its “end” edge).
    rangeEnd: 'entry 100%'
  }
);
```

## Key scenarios

Some of these examples below can already be tried with the existing [Scroll Timeline
polyfill](https://flackr.github.io/scroll-timeline/demo/parallax/index.html).

### Scenario 1 - Parallax


Parallax is one of the most popular scroll-driven effects on the web today. See Android 10 launch
[site](https://www.android.com/android-10/) for an example of this.

![Parallax example](https://gist.github.com/majido/a1279d6d986ab8881d51a77e98769e69/raw/explainer-parallax.gif)

To create a parallax effect with ScrollTimeline APIs, one can simply do:

```js
let header = document.querySelector('.header');
document.querySelector('.header > .background').animate({
    transform: ['none', 'translateY(30%)']}, {
    fill: 'both',
    // leaving options empty default using root scroller
    // for its entire scroll range.
    timeline: new ScrollTimeline()
  });
}
```

### Scenario 2 - Reveal/Unreveal

In this UX pattern an element fades in/out or swipes in/out as user scrolls the page. These are
often used to create interactive stories. For example see how New York Times applies scroll-driven
animations for creative
[storytelling](http://www.nytimes.com/projects/2013/tomato-can-blues/index.html).

![Reveal example](https://gist.github.com/majido/a1279d6d986ab8881d51a77e98769e69/raw/explainer-reveal.gif)


Here is a simple example where we reveal each header as they enters the viewport. This example uses
the ViewTimeline API.


```js
  const headers = document.querySelectorAll('h2, h3');
  for (let i = 0; i < headers.length; i++) {
    headers[i].animate([
        {transform: 'translateX(-10px)', opacity: 0},
        {transform: 'none', opacity: 1}],
        {
          rangeStart: 'entry 0%',
          rangeEnd: 'entry 100%',
          fill: 'both',
          timeline: new ViewTimeline({subject: headers[i]})
        }
    );
  }
}
```

### Scenario 3 - Progress-bar Animation

Another common example of an animation that tracks scroll position is a progress bar that is used
to indicate the reader’s position in a long article.

![Progressbar example](https://gist.github.com/majido/a1279d6d986ab8881d51a77e98769e69/raw/explainer-progressbar.gif)

Below is a simple example where a progress bar is animate from 0 to full width as we scroll the
document.

``` js
document.querySelector('#progressbar').animate({
    width: ['0', '100vw']}, {
    fill: 'both',
    timeline: new ScrollTimeline()
});
```

### Image Zoom In/Out

This is another common usage pattern when an image scales up to fill a larger canvas. For an
example of this see [iPhone 11 launch site](https://www.apple.com/iphone-11/).

![Zoom example](https://gist.github.com/majido/a1279d6d986ab8881d51a77e98769e69/raw/explainer-zoom.gif)

In this example we start scaling a DIV as soon as its container fully enters the scrollport and
until it starts existing the scroll port. Not how in this case the animating element is different
from the element that is used to specify the scroll timeline bounds.

```js
const container = document.querySelector('#zoom');
document.querySelector('#zoom > div').animate({
    transform: ['scale(3) translateX(10%)', 'scale(1)']}, {
    fill: 'both',
    rangeStart: 'contain 0%',
    rangeEnd: 'contain 100%',
    timeline: new ViewTimeline({subject: container})
});
}
```

## Detailed design discussion

### Integration with Web Animations

Using Web Animations API was a key decision. On the upside it has many benefits: using established
concepts and models for animation/keyframe/easing etc. This means scroll animations can be created,
controlled, and inspected with existing methods.

Some of the complexities that come from this decision are:

* **Time vs Scroll Offset**: The concept of **time value** (exposed in
  Milliseconds units) were central to the Web Animation model.  Adding
  ScrollTimeline requires updating the animation timing model to allow
  for other unit types. We decided to go with percentages as they had a
  clean direct mapping to animation progress (which is already a proportion).

* **Exclusive end ranges**: In Web Animations, ranges have exclusive ends to
  help make it easier to use overlapping ranges such as putting multiple
  animations in a sequence. ScrollTimeline scroll range also has exclusive ends
  to match this. However this is problematic for a common case where scroll
  range is full size. Our solution was to [special
  case](https://github.com/w3c/csswg-drafts/issues/5223) this one.

* **Dynamic Scrollability**: It is possible for a scroller to no longer
  overflow (`overflow: auto`). We mapped this to the web animations model
  by having the timeline become idle in these situations where a time cannot
  be worked out.

### Avoiding Layout Cycle

The ability for scrolling to drive the progress of an animation, gives rise to the possibility of
layout cycles, where a change to a scroll offset causes an animation’s effect to update, which in
turn causes a new change to the scroll offset. Imagine that an animation shrinks the height of the
content of the scroller which may cause the max scroll offset to reduce which may change the scroll
offset.

To avoid such layout cycles, animations with a ScrollTimeline are sampled once per frame, after
scrolling in response to input events has taken place, but before `requestAnimationFrame()`
callbacks are run. If the sampling of such an animation causes a change to a scroll offset, the
animation will not be re-sampled to reflect the new offset until the next frame.

However, newly declared CSS scroll timelines and view timelines are not detected until after style and layout.
If we did not sample these the user would see a single frame where the animation effect was not applied.
For this we have taken an [approach](https://github.com/w3c/csswg-drafts/issues/5261) similar to ResizeObserver,
where once per frame if we have identified new scroll driven timelines we repeat style and layout
to ensure those new timelines have an initial time.

![Ordering of scroll-driven animations](img/explainer-ordering.svg)

Note that this ensures the output of scroll-driven animation is always up-to-date when the user is
scrolling and avoids layout cycle. But it also means that in some situations the rendered scroll
offset may not be consistent with the output of scroll-driven animations. For example when the
scroll-driven animation itself is indirectly causing the scroll offset to change. We believe this
is rare and often not actually desired by authors.


Another thing to note is that if one updates scroll offsets in a `requestAnimationFrame` callback
it is not reflected in scroll-driven animations in the same frame. This is because
`requestAnimationFrame` callback are specified to run after updating web animations step which includes
scroll-driven animations.

### Accommodate Asynchronous Scrolling

Most modern browsers [perform scrolling
asynchronously](https://blogs.windows.com/msedgedev/2017/03/08/scrolling-on-the-web/) to ensure
smoothness and responsiveness to user actions. In other words the majority of scrolling is handled
off main-thread. We have opted for the following model to ensure that is not affected:

1. The scroll-driven effects are expressed declaratively similar to other
   web-animations and may be sampled asynchronously.
2. The user-agent is allowed to sample scroll-driven animations more often than main
   thread animation frames.
3. The user-agent is allowed to sample the scroll-driven effects on main-thread once
   per main-thread animation frame and use the last known scroll offset.


(1) and (2) mean that scroll-driven animation can potentially run off-main thread and in sync with
asynchronous scrolling that happens off thread. (3) ensures they can also run on main-thread
without forcing scrolling itself to be on main thread. Together they guarantee that scroll-driven
animations would render as often as the current existing approach of using scroll events while also
enabling user-agents to optimize such animations to potentially run off-thread and in sync with
asynchronous scrolling.

### Access top-level window scroll in iframes

It is desirable to perhaps allow scroll-driven animations to respond to the top-level window
viewport in an iframe. The current specification does not allow this as we are not sure of the
security impact of enabling this in cross-origin iframes. But in terms of API it may be just
allowing empty source attributes to mean top-level window scroller. More discussion on
the use case and possible solutions are [here](https://github.com/w3c/csswg-drafts/issues/4344)

###  Logical Scrolling vs Animation of Physical properties

This is not an issue directly related to Scroll-driven animation but one that gets exposed more
clearly with it. The issue is that many CSS properties, most predominantly transform, are physical
but scroll-driven timeline orientation is logical (in that it can be affected by writing-mode).
So authors have to be careful to use physical orientation with a scroll timeline if they intend to use it to
animate physical properties. More details on this [issue
here](https://github.com/w3c/csswg-drafts/issues/4350#issue-495584798).  Long-term, perhaps we
should consider [logical transforms](https://github.com/w3c/fxtf-drafts/issues/311) (also
[this](https://github.com/w3c/csswg-drafts/issues/1788)).

## Considered alternatives

### CSS Syntax Alternatives
We have gone back and forth on the particular CSS syntax for declaring timelines.
We [originally considered function based css syntax but decided to go with a @scroll-timeline rule instead](https://github.com/w3c/csswg-drafts/issues/4338).
Subsequently there was a [proposal to rethink the syntax](https://github.com/w3c/csswg-drafts/issues/6674)
which resulted in the syntax we have in the specification today.

### Element-based start/end Offsets Alternatives

A common usage pattern for scroll-driven animation is to start animation when an element enters scrollport (or viewport) until it leaves viewport.
The current proposal achieves this with ViewTimelines which observe a particular element's progress through the scrollport.

Below are alternatives we have considered:

1. Only expose static offsets and leave it to authors to compute these offset based on element and
   scroller bounding client rects. While this seems simple on surface but putting the onus on
   authors has a number of problems: Also requiring `getBoundingClientRect()` usage can cause layout
   thrashing if not careful. Anything else that affects layout such as new content added to the page
   may invalidate these offsets. So authors have to ensure they correctly recompute these offsets.
   Worst still, some size changes such as ping-zooms may not be easily detectable.

2. Use scroll-snap like alignment syntax (at the moment only exists in CSS). This may be a viable
   alternative compared to intersection observer style syntax (at the moment only exists in JS).
   One argument is that most element-based effects are defined as elements entering/exiting the
   viewport which are more naturally expressed as intersections as opposed to alignments. However
   this is open to debate and feedback is welcome.

3. Allowing element based start/end offsets to be declared in terms of intersection with the
   scroller. This was [designed and prototyped](https://github.com/w3c/csswg-drafts/issues/4337) with
   minor concerns around the ergonomics of the element based offsets. The main concern was the heavy
   reliance on element ids.

## CSS animation-timebase

This is an [idea](https://lists.w3.org/Archives/Public/www-style/2014Sep/0135.html) that most
closely matches the spirit of this current proposal. It proposed css syntax that allows animations
to be scrubbed in response to scroll. It also suggests a syntax for trigger. The current proposal
captures most of the functionality proposed for animation-timebase and defines exactly how it
integrates with web animations.


### Exposed Scroll Offset in Worker/Worklet
This is an idea that was first proposed in Compositor Worker and then was explored more in [Houdini
Animation Worklet](https://github.com/w3c/css-houdini-drafts/tree/master/css-animationworklet). The
idea was to simply expose scroll offset to special JS based `animate()` callbacks that can run off
thread. We believe ScrollTimeline can be used in conjunction with Houdini Animation Worklet thus
there is no need to expose scroll offsets directly. This can enable more complex scroll-driven
animations using Animation Worklet while also making it easy to create fully declarative animations
for common simpler use cases via Web Animations.

Another [take on this idea](https://github.com/w3c/csswg-drafts/issues/2493) was to change Web
Animations time value to no longer be scalar but value could be a bag of values which may be scroll
positions, touch position etc. This combined with custom js animation callback, such as Animation
Worklet, could allow very sophisticated scroll-driven animations but this was also scrapped as we
believed this may not be compatible with the Web Animation model.


## Stakeholder Feedback / Opposition
Safari, Mozilla, Chrome, Edge are participating in CSSWG and have been supportive of the idea.
There are engineers from all four browsers as editors in the specification.

Additional links
 - [Mozilla standard positions](https://github.com/mozilla/standards-positions/issues/347)
 - [Chromium status](https://chromestatus.com/feature/6752840701706240)
 - [WebKit-dev thread](https://lists.webkit.org/pipermail/webkit-dev/2020-June/031228.html)


## Considerations for Security and Privacy
There are no known security or privacy impacts of this feature.

The W3C TAG [self-review questionnaire](https://www.w3.org/TR/security-privacy-questionnaire/) [questions](https://www.w3.org/TR/security-privacy-questionnaire/#questions) have been considered and answered below:

2.1. What information might this feature expose to Web sites or other parties, and for what purposes is that exposure necessary?

     1. What information does your spec expose to the first party that the first party cannot currently easily determine.

        This spec does not expose any information to the first party that the first party cannot currently easily determine.

     2. What information does your spec expose to third parties that third parties cannot currently easily determine.

        This spec does not expose any information to third parties that they cannot easily determine.
        We avoided [supporting observing the scroll position of the root frame](#access-top-level-window-scroll-in-iframes) for now to avoid any additional risk here.
        Note that third parties can currently determine this through the intersection observer API so it again wouldn't be a new path.

     3. What potentially identifying information does your spec expose to the first party that the first party can already access (i.e., what identifying information does your spec duplicate or mirror).

        The spec indirectly exposes the size and position of scroll ports and elements within them.
        The size and position of scroll ports are already trivially accessible through `scroller.scrollLeft`, `scroller.scrollTop`, `scroller.clientWidth`, `scroller.clientHeight`, `window.innerWidth` and `window.innerHeight`.
        The position of elements relative to the viewport can already be determined using API's like `element.offsetLeft`, `element.offsetTop`, `element.clientWidth`, and `element.clientHeight` or through `element.getBoundingClientRect()`.

     4. What potentially identifying information does your spec expose to third parties that third parties can already access.

        The same information as above in 2.1.3 is exposed in third party frames.

2.2. Do features in your specification expose the minimum amount of information necessary to enable their intended uses?

     Yes, the feature does not expose anything which isn't necessary to use the API.

2.3. How do the features in your specification deal with personal information, personally-identifiable information (PII), or information derived from them?

     There is no PII processed by scroll driven animations.

2.4. How do the features in your specification deal with sensitive information?

     No sensitive information is used by this feature.

2.5. Do the features in your specification introduce new state for an origin that persists across browsing sessions?

     No.

2.6. Do the features in your specification expose information about the underlying platform to origins?

     No new information is exposed that wasn't already available from pre-existing APIs such as `window.innerHeight`.

2.7. Does this specification allow an origin to send data to the underlying platform?

     No.

2.8. Do features in this specification enable access to device sensors?

     No.

2.9. Do features in this specification enable new script execution/loading mechanisms?

     No.

2.10. Do features in this specification allow an origin to access other devices?

     No.

2.11. Do features in this specification allow an origin some measure of control over a user agent’s native UI?

     No.

2.12. What temporary identifiers do the features in this specification create or expose to the web?

     No temporary identifiers are created / exposed by this specification.

2.13. How does this specification distinguish between behavior in first-party and third-party contexts?

     The feature allows third-party contexts to animate content with respect to scrollers on that third-party context.
     No information about the first-party context is used to do this.

2.14. How do the features in this specification work in the context of a browser’s Private Browsing or Incognito mode?

     There is no additional state from the user's browser state used by this specification.

2.15. Does this specification have both "Security Considerations" and "Privacy Considerations" sections?

     This is tracked by https://github.com/w3c/csswg-drafts/issues/8644

2.16. Do features in your specification enable origins to downgrade default security protections?

     No.

2.17. How does your feature handle non-"fully active" documents?

     There is no special handling for such documents. Scroll driven animations follow the same model as other CSS and web animations.

2.18. What should this questionnaire have asked?

     Nothing comes to mind.

## References & acknowledgements
Many thanks for valuable contributions, feedback and advice from:
 * All current and former specification editors.
 * CSSWG members for valuable feedback on this proposal.

