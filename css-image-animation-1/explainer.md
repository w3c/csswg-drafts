# CSS Image Animation

Authors: Florian Rivoal, Lea Verou

Previous Version: [https://github.com/webplatformco/project-image-animation/blob/main/image-animation-property/README.md](https://github.com/webplatformco/project-image-animation/blob/main/image-animation-property/README.md)


<details open>
<summary>Contents</summary>

1. [User Needs \& Use Cases](#user-needs--use-cases)
2. [User Research](#user-research)
    1. [Developer \& User signals](#developer--user-signals)
    2. [Current Workarounds](#current-workarounds)
3. [Goals](#goals)
    1. [Non-goals](#non-goals)
4. [Proposed Solution](#proposed-solution)
    1. [Sample Code Snippets](#sample-code-snippets)
    2. [Beyond the Basics](#beyond-the-basics)
        1. [High-level Solution](#high-level-solution)
        1. [Low-level Solution](#low-level-solution)
    3. [Possible Extensions](#possible-extensions)
        1. [Control Over Iterations](#control-over-iterations)
        2. [Longhands And Further Controls](#longhands-and-further-controls)
        3. [Control Over the Paused State](#control-over-the-paused-state)
    4. [Accessibility Considerations](#accessibility-considerations)
    5. [Privacy Considerations](#privacy-considerations)
5. [Complementary Solutions](#complementary-solutions)
    1. [Images in the `<video>` Element](#images-in-the-video-element)
    2. [What About `<img control>`?](#what-about-img-control)
6. [Rejected Alternatives](#rejected-alternatives)
    1. [Provide this as a UA Setting](#provide-this-as-a-ua-setting)
    2. [Reuse the Existing `animation-*` Properties](#reuse-the-existing-animation--properties)
    3. [Other Alternatives](#other-alternatives)
</details>

## User Needs & Use Cases
Animated images (as enabled by GIF, APNG, WebP) are in common use on the web,
for a variety of reasons, such as:
* Purely decorative design elements
* States or transitions of UI elements highlighting various interactions
* Part of the content supplied by the author
* User-generated content
    * (animated) image upload can be an explicit feature of the site (social media, image gallery, chat applications…)
    * (animated) images may be included as a side effect of providing a rich text editor
    * (animated) images may be received within rich text created in a different service (e.g. email)

By default, UAs autoplay these images,
which can be jarring for users,
especially in use cases where there are multiple images on a single page (e.g. image galleries)
and violates [WCAG](https://www.w3.org/WAI/WCAG21/Understanding/pause-stop-hide.html),
and currently,
site authors have no control over this.

This leads to a user desire to control such animations.
However, due to the diversity of usage,
there is a wide range of use cases and desired UIs and user experiences,
so making this an automatic or opt-in UA feature [would not be sufficient](#provide-this-as-a-ua-setting).

To offer their users the best experience,
websites need to control the playback experience,
separately for each different uses of animated images.
For example:
* Start paused and play on hover and focus
* Start paused with a play button and toggle between playing and paused states on click
* Autoplay unless `prefers-reduced-motion` is on
* Turn off autoplay for decorative images when `prefers-reduced-motion` is on,
    while keeping animations on for those that are part of UI interactions

In some cases,
this can already be done using alternatives to animated images,
such as CSS animations, SVG, or `<video>` elements,
which give authors different ways to control playback.
But this is not always practical:
* Animated images provided by the author for decorative/UI purposes
    can sometimes be recreated as CSS animations or SVG,
    but depending on the effect, this can be difficult.
* GIF/APNG/WebP support *transparent* animated images,
    but support for transparency in codecs usable in `<video>` is limited.
* Codec conversion can be lossy
* Codec conversion can be expensive,
    especially for sites with large existing content bases
* There are vast amounts of pre-existing content that include animated images in `<img>` tags,
    either stored as static pages or in generated markup,
    and retrofitting such markup in order to provide animation control is generally not economical. 
* `contenteditable` and JS-based editors (derived from `contenteditable` or not) generate `<img>` elements
    when (animated) images are inserted into the text.
    Rich text editors are famously complex and fiddly pieces of of software,
    and modifying them use `<video>` elements instead would be a major undertaking.
    Post processing the generated markup may be easier,
    but doing so robustly remains complex.
* When authors don't provide animation control,
    users may want to take the matters into their own hands,
    possibly through user-stylesheets,
    or by using [Web Extensions](https://w3c.github.io/webextensions/specification/).
    In such cases,
    being able to work directly with the markup's `<img>` tags
    is far easier than trying to replace them on the fly with something else.

## User Research

### Developer & User Signals
A few examples amongst many of people asking for that type of functionality.
* Stack overflow:
    [1](https://stackoverflow.com/questions/20644209/play-gif-on-mouseover-and-pause-gif-on-mouse-out-without-replacing-images)
    [2](https://stackoverflow.com/questions/69593429/how-can-i-pause-and-play-gif-which-is-set-on-webpage-background) 
    [3](https://stackoverflow.com/questions/21872700/how-can-i-play-a-gif-like-9-gag)
    [4](https://stackoverflow.com/questions/29661821/is-it-possible-to-pause-a-gif-image)
    [5](https://stackoverflow.com/questions/5818003/stop-a-gif-animation-onload-on-mouseover-start-the-activation)
* CSS-WG github:
    [issue 1615](https://github.com/w3c/csswg-drafts/issues/1615)
* Reddit:
    [1](https://old.reddit.com/r/HTML/comments/3hjccx/how_can_i_animate_and_stop_gifs_with_mouse_hover/)
    [2](https://old.reddit.com/r/FirefoxCSS/comments/1523xwr/stop_animated_gifs_play_on_hoverclick/)

### Current Workarounds
Numerous workarounds exist (further highlighting author/user  demand),
all with a variety of downsides.
See the [“Current Workarounds” section of the Images-in-video explainer](../images-in-video#user-content-current-workarounds) for a brief discussion.

## Goals
* Provide declarative syntax to enable/disable animation of images
* Handle images that are part of the content as well as decorative images
* Enable applying different settings to different images
* Enable simple user interactions (e.g. click to play)
* Work with existing markup and/or without

### Non-goals
* Turning animated images into fully fledged video player.
    (This [could be pursued separately](../images-in-video/README.md),
    but is not the focus of this explainer.)

## Proposed Solution

The proposed solution is a css property to control animation of images.
At its most basic version, it would take the following form:

> Name: `image-animation`
> Value: `normal` | `paused` | `running`
> Initial: `normal`
> Applies to: see text
> Inherited: yes
> Computed Value: specified keyword

This property applies to:
* **content images**, which are part of the document, as defined by the host language.
    In the case of HTML, this is the `<img>` element (including its use inside the `<picture>` element).
    In the case of SVG, this is the `<imgage>` element.
    Images injected into the page though the CSS `content` property on real (non-pseudo) elements
    are also considered content images.
* **decorative images**: images injected into the page via CSS,
    such as background images,
    border images,
    through the `content` property on pseudo elements,
    or any other reference to external images.

This property has no effect on other types of graphical content, such as `<video>` elements, or `<canvas>`.

Issue: what about `<object>`, `<embed>`, `<svg>`, or the `<video>` element's poster image?

When an element contains several decorative images (e.g. background images *and* border images),
or if it contains both a content image *and* decorative images,
the property affects them all.
In the case of non-animated images,
all values have the same effect (i.e. none).

* **normal**:
    The current behavior,
    as specified in HTML,
    with images auto-playing,
    in a loop,
    synchronized with other instances of the same image on the page
* **paused**:
    the image animation does not run.
* **running**:
    the image animation plays,
    without synchronization with any other instance of the same image on the page.

### Sample Code Snippets
Turn off all image animations on the page:
```css
:root { image-animation: paused; }
```

Using some knowledge about how the site is structured,
it is possible to fine tune the response to a preference for reduced motion,
for instance suppressing non-essential decorative animations,
while keeping those that are informative components some UI element.
and offering on-demand playback for relevant parts of the content.
```css
@media (prefers-reduced-motion) {
  :root { image-animation: paused; }
  .loading-indicator { immage-animmation: normal; } 
}
```

Elaborate controls to start or stop a paused image can be built with custom markup and script,
but simple cases can be done declaratively.
For instance, you could start paused and play on hover and focus:
```css
img {
  image-animation: paused;
  filter: grayscale(10%) contrast(50%) brightness(80%);
}
img:hover, img:focus {
  filter: none;
  image-animation: running;
}
```

<p id=ex-carousel>
Interesting effects can easily be achieved in combination with other CSS:
```css
.carousel {
  overflow: scroll;
  scroll-snap-type: both mandatory;
}
.carousel img {
  scroll-snap-align: center;
  image-animation: paused;
}
.carousel img:snapped { image-animation: play; }
```

### Beyond the Basics

A key limitation of the above property is encountered
when authors want to set up a means for users
to selectively activate paused animations:
the author has no means to identify
which images in the page are animated images,
and therefore which images need to be provided
with some a user interface of some kind
to activate the animation.

Two approaches are being considered to complement the basic design above.


#### High-level Approach

An additional value can be added to the `image-animation` property:
* **controlled**:
	* on decorative images: same as **paused**
	* on content images:
        initially, the image animation does not run and the first frame is displayed.

        Additionally,
        if the underlying image actually is an animatable one,
        the user agent provides some UI to allow the user to play and pause the animation,
        and also makes the element focusable,
        so that the control may be interacted with.
        The specific control is UA defined,
        but must not change the dimensions of the image.
        Authors should not expect more capabilities from this control than the ability to play and pause the animation.
        If more is desired, consider using the `<video>` element instead.

With this, some common use-cases are easily handled.

Turning off autoplay on all images, showing UI controls for playback on animatable content images:
```css
:root { image-animation: controlled; }
```
Note that this can be applied just as easily by a site's author, a [web extension](https://w3c.github.io/webextensions/specification/), a user-stylesheet, without any modification to—or knowledge of—the site's markup patterns. Other uses could include a web-based email-client using this to keep animated images under control in HTML email.

Same as above, in response to a [user request for reduced motion](https://drafts.csswg.org/mediaqueries-5/#prefers-reduced-motion):
```css
@media (prefers-reduced-motion) {
  :root { image-animation: controlled; }
}
```


#### Low-level Approach

The `:animated-image` pseudo-class can be introduced,
and represents content image elements
where a animated image has been loaded.

While authors can apply `image-animation: paused` to all animated and static images alike
without undesirable side effects,
UI controls to restart the animation should not be added to static images.
This pseudo-class enables targeting only relevant images.

Further, in order to facilitate building UI controls
without having to modify the DOM to add additional markup,
an `::overlay` pseudo-element could be added to `<img>`
enabling generated content or other effects to be easily placed over the image.

### Possible Extensions

#### Control Over Iterations
Animated image formats such as GIF, WebP, or APNG include information
about how many times the animation is supposed to run.
This could be made into an overridable default, with alternate possibilities being specified in CSS.

`normal | paused | [ [ running | controlled ] && [ once | loop ] ? ]`

or more generally:

`normal | paused | [ [ running | controlled ] && [ loop | <integer [1,∞]>] ? ]`

This example shows how,
when the user prefers reduced motion,
memes in a image gallery could be paused by default,
with a browser-provided play button,
and run once only when activated,
instead of their default state,
which is to autoplay and (generally) to loop forever.
```css
@media (prefers-reduced-motion) {
  .funny-meme { image-animation: once controlled; }
}
```

Here, in a hypothetical music playing application,
artwork representing each album plays as a continuous animation
when the element is focused or hovered.
```css
.album-cover { image-animation: paused; }
@media not (prefers-reduced-motion) {
  .album-cover:hover,
  .album-cover:focus {
    image-animation: running loop;
  }
}
```

#### Longhands And Further Controls
The property above could be broken down into longhands
possibly similar to those of the `animation-*` family of properties
(`image-animation-play-state`, `image-animation-iteration-count`).
Depending on use cases,
additional properties inspired by `animation-*` properties could also be considered.

Note: if we want to go this way,
it might be better to rename some values discussed above;
names in this explainer were chosen to maximize self-explanatory power,
but if we want to be maximize similarity to the `animation-*` properties,
different names may be better.
For instance,
`loop` in `animation-iteration-count` is actually called `infinite`,
and `once` would be `1`.

#### Control Over the Paused State
The `paused` value could be extended to give control over which frame of the image is displayed when it is stopped.

`paused [ first | last | last-shown | <time> | <percent> | <number> ] ?`

### Accessibility Considerations
* Web pages can already contain animated images,
    and appropriate `alt` text is already expected to be provided.
    ”Cartoon coyote being squashed by a falling anvil“
    or “cute dancing hamster”
    remains equally appropriate and evocative
    whether the animation is running or not.
* Currently, screen readers typically do not chose to announce animated images
    differently from non-animated images,
    though they could if they wanted to.
    Similarly, it is not expected that they would announce paused or playing images any differently,
    though they could if they wanted to.
* Conversely, when the `controlled` value is specified
    on an element containing an actually animated content image,
    the element does become focusable so that its controls can be operated,
    and screen readers should announce the element distinctly,
    similar to how they do for `<video>` elements.
    Note that there is precedent for changing the focusability of elements based on CSS:
    in addition to a few of properties which can suppress an elements focusability (e.g. `display`, `visibility`…),
    `overflow: auto` / `scroll` makes elements focusable,
    only when there is something to scroll.

### Privacy Considerations
With regards to decorative images,
this property enables control over image animation cross origin,
without leaking any information about whether the image is actually animatable or not.
The computed value does not change based on this information.
The `running` value has effects that are visibly different on animatable vs non-animatable images,
but none of these differences are observable by the page itself.

With regards to of content images,
the `controlled` value causes the element to become focusable
so that the play/pause control can be keyboard-operated without needing to change the element's tab-index.
This effect is defined to only take effect if the image is actually animatable,
to avoid needlessly making elements focusable and showing disabled/unnecessary controls.
In the case of cross-origin images,
this change of focusability does enable the host page to know
whether the image is animatable or not,
which is otherwise not known from the `<img>` element.
Similarly, the `:animated-image` pseudo-class also reveals
whether an image is animated or not,
including cross origin.
Either of these effects could be blocked
by invoking CORS,
however, this proposal chooses not to.
We argue that this is an acceptable trade-off:
* There is not much to be gained from this information that isn't already known.
    * Whether an image is present at the target URL at all
        can reveal important information about the user
        (e.g. whether they are logged in in a particular domain),
        but that is already knowable from image dimensions,
        and animatability does not add to this risk.
    * It is in practice very unlikely that a site would be designed to serve
        both a static and an animated image from the same URL,
        choosing which to serve based on some user-dependent private information.
* Similar information is already being shared for videos:
    the `<video>` element exposes duration even for cross-origin videos.
    A static image is arguably a special case of an animated one with a duration of 0,
    so exposing that information is analogous.
* There is a proposal to allow images in the `<video>` element.
    If implemented, it means the situation would not just be analogous,
    but that whether an image is animatable would already be knowable cross-origin anyway.

## Complementary Solutions

### Images in the `<video>` Element
See [the explainer for “Images in `<video>`”](../images-in-video/README.md).

Animated images are effectively videos without a sound track.
Allowing images in the `<video>` element would take advantage of the rich controls
and APIs afforded to `HTMLMediaElement` in general
and `<video>` in particular,
and is arguably plugging an obvious gap in the web platform.

These approaches are complimentary.
While there is some overlap in terms of what they enable,
they each cover use-cases that the other does not.
Pursuing both would make sense.

***…insert summary table showing overlap and differences…***

### What About `<img control>`?

***…insert discussion of why that's not a full substitute,
but of how both features can be made compatible with each other if that's desired…***

## Rejected Alternatives

### Provide this as a UA Setting
Firefox's `about:config` has `image.animation_mode`,
which can turn off all image animations,
and Safari respects macOS's “auto-play animated images” setting (default on, can be turn off).
However, such settings are too blunt an instrument to handle all cases.
The browser doesn't know which images are decorative ones
whose animation can be suppressed outright when users want reduced motion,
and which are content,
which should remain viewable if desired
(but maybe upon clicking some play button or on hover).
As it is,
if the browser forcibly suppresses animation of images,
users will either no have means to individually turn them back on
(as is case for Safari and Firefox).
Alternatively, if they have some UI element for every paused image,
even the decorative ones with superfluous animations would get such a button,
and possibly worse if animated images are used as part of some UI component,
UI injected by indiscriminately by the browser might clash with the site's own UI.
Say, for example, that a flashy/tacky website has pulsating / sparkling images used as buttons.
It wouldn't be great if a GIF-stopping browser added play buttons onto that site's GIF-based buttons,
it's GIF-based checkboxes, etc.
But if it doesn't,
it also doesn't add them to animated images which are meaningful parts of the content,
since it doesn't reliably know which is which.

In a browser where `image-animation` is implemented,
this UI setting could continue to exist,
possibly implemented in different ways.
The most blunt way is to simply make all images non animated when the setting is on,
leaving the CSS property nothing to usefully take effect on.
More interestingly, the setting could be reinterpreted in terms of the CSS property,
```css
@media (prefers-reduced-motion) {
  *,
  *::before,
  *::after,
  *::marker {
    image-animation: controlled !important;
  }
}
```

### Reuse the Existing `animation-*` Properties
Properties like `animation-play-state: running | paused`
or `animation-iteration-count: infinite | <number [0,∞]>`
have value space that are similar to what is proposed here.
We could consider treating animated images as CSS animations,
and making (all) existing animation properties apply to images with multiple frames,
and attempt to explain the fact that they are animated in terms of CSS properties,
gaining full control over them along the way.

However a “similar“ value space is not an identical value space:
* The some values of `image-animation` are image specific
    and are missing from  `animation-play-state`,
    and would not be generally applicable.
* `animation-iteration-count` lacks a value that can default to what the image specifies internally.
* Various other `animation-*` properties lack values that can express what images need.
    For instance, what about `animation-duration`? 
* The initial values of the `animation-*` properties are not appropriate for images.

Adding these missing values or smart intial / auto values is certainly possible,
but making the `animation-*` properties be capable of expressing normal image behavior would require significant extensions.
Even if that were done, unless an additional opt-in is added,
this is certain to cause web-compatibility problems,
as `animation-*` properties are widely used on all sorts of elements with decorative or content images,
and so far without any effect.
Turning it on would cause undesired effects in unsuspecting web-sites.
If the regular `animation-*` properties cannot be made to apply by default and would need significant retro-fitting anyway,
it makes little sense to try and shoehorn image animations into them,
even if there are similarities.

### Other Alternatives

***This section is a work in progress.***

Here is a short list,
to be expanded,
of other things that were considered but did not seem like good solutions:
* [Media Fragments](../images-in-video#using-media-fragments)
