# Carousel CSS features

## Problem description

Carousels are an often used design pattern on the web.
They are used in a variety of contexts,
from product listing pages to slideshow like content.
OpenUI has [explored a range of carousel designs](https://open-ui.org/components/carousel.research/),
showing that the specific layout and appearance can vary dramatically.
They are also provided by many frameworks as components,
however implementing a carousel correctly is complicated
and often results in inconsistent and sometimes inaccessible implementations.

There are a [variety of problems being solved by carousels](https://css.oddbird.net/overflow/explainer/),
which we believe could be provided by a set of CSS features.
Developers could then combine these CSS features to create the various designs.
CSS-only component libraries could be built to further simplify this process.

### Scroll markers

Many carousels have markers or thumbnails
which provide convenient navigation
and a sense of overall progress through the carousel.

For individual items, an author *can* do this manually,
though it requires writing extra elements
which need to be kept up to date with the items to which they scroll.
Script also needs to be used to get the desired scrolling behavior.

For dynamically content-sized pages, this can only currently be done with script which generates DOM.
By having a way to automatically generate markers,
many more advanced UI patterns can be solved in CSS.

#### Requirements

Scroll markers require the combination of several behaviors:

1. They should scroll to the target on activation,
2. only one of the scroll markers in a group should be active (and focusable) at a time (see [roving tab-index](https://developer.mozilla.org/en-US/docs/Web/Accessibility/Keyboard-navigable_JavaScript_widgets#technique_1_roving_tabindex)),
3. arrow keys should cycle between the other markers,
4. the correct one is automatically activated as a result of scrolling, and
5. The active marker should be stylable.

### Scroll buttons

Many carousels provide buttons for direct navigation to the next / previous item or page of content.
While they could create these `<button>` elements as part of the page,
they are not semantically part of the list of items.
Further, the code for these adds a bit of additional complexity in terms of focus order, and tracking enabled state based on scroll position.

### CSS inert

It is common and [recommended practice](https://www.w3.org/WAI/tutorials/carousels/working-example/) (See use of aria-hidden) that
only content on the active page is included in focus order.
Users must use the carousel navigation controls (e.g. buttons / markers / swipe)
to access content on future pages.

This is typically accomplished through the use of Javascript,
as can be seen in the [Web Accessibility Initiative Carousel example](https://www.w3.org/WAI/tutorials/carousels/working-example/).
However, the interactivity state of carousel pages is necessarily dynamic.
Being able to express this in CSS allows authors to correctly reflect this expected design
without tracking and updating the script via state.

### Stylable columns

Carousels often show lists of many items as a single group per page.
Typically the user advances through one group at time.
Many existing carousel libraries have complex logic
to determine the number of items that fit per page and construct a per-page DOM.

However, automatic UA pagination can be done today through the use of column fragmentation, ([e.g.](https://jsbin.com/modewaj/edit?html,output)):
```css
.paginate {
overflow-x: scroll;
columns: 1;
}
```

This automatically handles paginating the content, but developers need access to a few additional styles to make these participate in a carousel UX.
Specifically, developers need to be able to:
* Set scroll snap points on them.
* Implicitly create scroll markers for each column.

## Proposed solutions

Many of these aspects of carousel experiences are highly differentiated and customizable
or are building blocks that are shared by different experiences.
As such, the proposed solutions here identify the specific features
that make it possible to pick and style the pieces a developer may want for their carousel-like experience. 

### Scroll markers

Anchor links are already used today to provide some of the behaviors of scroll markers.
We can extend anchor links to support the missing behaviors
by adding a grouping attribute. E.g.

```html
<style>
.container {
  scroll-marker-contain: auto;
}
</style>
<ul class="container">
  <li><a href="#intro">Intro</a></li>
  <li><a href="#overview">Overview</a></li>
  <li><a href="#summary">Summary</a></li>
  <li><a href="#faq">FAQ</a></li>
</ul>
```

By declaring that all of the anchor links in the list are part of a contained group,
the UA can ensure that one of them is determined to be the current marker,
allowing it to be styled with `::target-current`.

```css
a::target-current {
  font-weight: bold;
}
```

Roving tab-index selection can be added by adding the focusgroup attribute,
combined with the [guaranteed tab stop](https://open-ui.org/components/focusgroup.explainer/#guaranteed-tab-stop)
with the [last-focused element](https://open-ui.org/components/focusgroup.explainer/#last-focused-memory) automatically updated to the active marker.

```html
<ul class="container" focusgroup>
  <li><a tabindex="-1" href="#intro">Intro</a></li>
  <li><a tabindex="-1" href="#overview">Overview</a></li>
  <li><a tabindex="-1" href="#summary">Summary</a></li>
  <li><a tabindex="-1" href="#faq">FAQ</a></li>
</ul>
```

#### ::scroll-marker-group and ::scroll-marker pseudo-elements

Navigation controls are not part of the semantic content of the page.
Sometimes, they may be a presentational choice for a semantic list of content.
By allowing the creation of scroll marker groups from semantic lists,
developers can automatically augment existing content without HTML modification.

E.g.
```html
<style>
@media screen {
  .slides {
    overflow: auto;
    counter-reset: slide-number;
    scroll-marker-group: after;
  }
  .slide::scroll-marker {
    counter-increment: slide-number;
    content: counter(slide-number);
  }
}

@media print {
  .slides {
    counter-reset: slide-number;
  }
  .slide::before {
    counter-increment: slide-number;
    content: "Slide " counter(slide-number);
  }
}
</style>
<div class=slides>
  <div class=slide></div>
  <div class=slide></div>
  <div class=slide></div>
  <div class=slide></div>
  <div class=slide></div>
<div class=slideshow>
```

This allows for the HTML structure to be focused on the content,
with the controls to be generated automatically,
optionally dependent on presentation media or screen real estate.

### Scroll buttons

Similar to scroll markers, it should be easy to create scroll buttons.
If a developer has explicit `<button>` elements, they could use the [commandfor](https://open-ui.org/components/invokers.explainer/) attribute targeting the scrolling container
with an [action hint](https://open-ui.org/components/invokers.explainer/) of `scroll-<direction>`.

For use cases where the developer wishes to dynamically add scroll button controls,
the `::scroll-button(<direction>)` pseudo-element will establish a scroll button which
on activation scrolls the scrolling container of its owning element. E.g.

```css
.scroller {
  overflow: auto;
}

.scroller::scroll-button(down) {
  content: "v";
}

.scroller::scroll-button(up) {
  content: "^";
}
```

These pseudo-elements are focusable and behave as a button.
When activated, a scroll is performed in the indicated direction by a page (e.g. 85% of the scrollport similar to pressing the Page Down key on the keyboard).
When it is not possible to scroll in that direction, they are disabled and match the `:disabled` pseudo-class.

### CSS inert

The interactivity property [#10711](https://github.com/w3c/csswg-drafts/issues/10711)
combined with either a view timeline or snapped scroll state container query
can be used to make the offscreen content inert. E.g.

Using a view timeline:
```css
@keyframes interactive {
  0% { interactivity: auto; }
  100% { interactivity: auto; }
}

.slide {
  /* Inert out of view items */
  interactivity: inert;
  /* Make interactive when in view */
  animation: interactive;
  animation-timeline: view(inline);
}
```

Using a scroll-state query:
```css
.slide {
  @container not scroll-state(snapped) {
    interactivity: inert;
  }
}
```

### Stylable columns

Column fragmentation allows for automatic pagination ([example](https://jsbin.com/modewaj/edit?html,output)).
Developers need access to a few additional styles to make the columns participate in a carousel UX.

The `::column` pseudo-element allows applying a limited set of styles to generated columns.
Specifically, this is limited to styles which do not affect the layout,
and thus can be applied post-layout.

E.g. the following [example](https://jsbin.com/defazup/edit?html,output) automatically paginates a list of items snapping each page into view.
```css
ul {
  overflow: auto;
  container-type: size;
  columns: 1;
}
ul::column {
  scroll-snap-align: center;
}
```

This pseudo-element can additionally be used for the creation of `::scroll-marker` pseudo-elements:
```css
ul::column::scroll-marker {
  /* Marker styling */
}
```

## Use cases

### Carousels

With the features described, developers can create an automatically paginated carousel UX from a semantic list of items, e.g.

```html
<ul class=carousel>
  <li>Item 1</li>
  <li>Item 2</li>
  ...
  <li>Item n - 1</li>
  <li>Item n</li>
</ul>
```

With the following CSS,
the above HTML will be automatically paginated with
a scroll marker per page with the active page highlighted,
scroll buttons to go to the next / previous page,
snapping to pages,
and only having the user tab through content on the current page.

```css
.carousel {
  /* Automatically paginate into scrollport-sized columns. */
  columns: 1;

  /* Enable scrolling and set scrolling behaviors. */
  overflow-x: auto;
  overscroll-behavior-x: contain;
  scroll-snap-type: x mandatory;
  scroll-behavior: smooth;

  /* Scroll marker creation and styling. */
  scroll-marker-group: after;
  &::scroll-marker-group {
    height: 40px;
    overflow-x: auto;
  }
  &::column::scroll-marker {
    content: ' ';
    &:target-current {
      background: SelectedItem content-box;
    }
    &:focus {
      border-color: Highlight;
    }
  }

  /* Scroll button creation and styling. */
  &::scroll-button(*) {
    position: absolute;
  }
  &::scroll-button(left) {
    content: '<';
    left: 0;
  }
  &::scroll-button(right) {
    content: '>';
    right: 0;
  }

  /* Snap to columns as well. */
  &::column {
    scroll-snap-align: center;
  }

  & li {
    /* Inert out of view items */
    interactivity: inert;
    /* Make interactive when in view */
    animation: interactive;
    animation-timeline: view(inline);
  }
}

@keyframes interactive {
  0% { interactivity: auto; }
  100% { interactivity: auto; }
}
```

Of note, is that they can mix and match the features they want
and style each piece.

### Table of contents auto-highlighting

The scroll marker feature provides a great drop-in way for a table of contents to automatically highlight the current section, e.g.

```
<style>
/* A floating table of contents similar to spec pages */
#table-of-contents {
  position: fixed;
  top: 0;
  left: 0;
  scroll-marker-contain: auto;

  & a:target-current {
    font-weight: bold;
  }
}
</style>
<ul id=table-of-contents>
  <li><a href="#s1">Section 1</a></li>
  <li><a href="#s2">Section 2</a>
    <ul>
      <li><a href="#s2-1">Subsection 1</a>
      <li><a href="#s2-2">Subsection 2</a>
    <li>
  </li>
  ...
  <li><a href="#s2">Section n</a></li>
</ul>
```

### Paginated reading UI

A book reading interface can be created by using the automatic pagination. E.g.

```html
<style>
  .book {
    columns: 1;
    overflow: auto;
    scroll-snap-type: x mandatory;
  }
  .book::column {
    scroll-snap-align: center;
  }
  /* Optionally adding next/prev page buttons: */
  .book::scroll-button(next) {
    content: ">" / "Next page";
  }
  .book::scroll-button(prev) {
    content: "<" / "Previous page";
  }
```

## Future work

There are a few carousel designs not currently addressed.
This section enumerates and explores these areas.

### Vertical auto-paged carousels

Column fragmentation is a convenient way to automatically paginate a list of items horizontally,
however we should have a mechanism for paginating vertically as well.
Most likely, this will be of the form `column-wrap: wrap` similar to the `flex-wrap` property,
resulting in columns wrapping in the block direction after they overflow the inline direction.
With this a vertically paginated carousel could be defined as the following:

```css
.carousel {
  overflow: auto;
  scroll-snap-type: y mandatory;
  columns: 1;
  column-wrap: wrap;
}

.carousel::column {
  scroll-snap-align: center;
}

.carousel::column::scroll-marker {
  /* marker styles */
}
```

### Improved pagination styling

Many paginated interfaces allow the user to peek into the subsequent / previous pages.
Column layouts force an integer number of columns per page meaning they always perfectly fill the space.
This could be supported by allowing for a fractional column value,
or specifying the desired overlap region.

### Cyclic carousels

Many carousels allow scrolling from the last item in the list to the first, or vice versa.
We expect that some form of cyclic overflow support (e.g. [#5411](https://github.com/w3c/csswg-drafts/issues/5411))
will make this trivial for authors to enable on top of these other features.

In the interim, authors could continue to use script, as they do today,
to move content to the start / end of the carousel so that it can continuously scroll,
or by overriding the next button behavior when at the last item to scroll back to the beginning.

### Auto-advancing carousels

Auto-advancing carousels introduces many potential accessibility issues if not implemented properly.
The [Web Accessibility Initiative Carousel Animations](https://www.w3.org/WAI/tutorials/carousels/animations/) guidelines explores the necessary affordances.
Most carousel experiences can be authored without automatically advancing sections,
and in the mean-time author script could implement the animation following the WAI guidelines.

## Alternative approaches considered

There are many other ways that we could deliver these capabilities.

### &lt;carousel&gt; element

An element could encapsulate a lot of the features without needing to express them directly as CSS properties.
One of the main challenges with this approach is that carousels have a large amount of variation in their designs.
This would likely add significant complexity to the design of a high level element,
or require some of the individual features proposed anyways.

### Templated content instead of columns and pseudo-elements

It would be nice for authors to be able to slot in rich content,
as they would with a custom element.
For example, they could provide a template of content to be created per page
with a slot for the contents of that page.

One challenge is that the original content should retain its original structure.
This may be possible by dynamically slotting elements to particular pages in a shadow tree.

### Using regions or grid-flow instead of ::scroll-marker-group

It would be reasonable to think that if we had a way of flowing elements into another area,
we could use that to create the group of scroll markers.
E.g. you could imagine using the [flow-into](https://drafts.csswg.org/css-regions/#the-flow-into-property) and [flow-from](https://drafts.csswg.org/css-regions/#flow-from) properties as follows:

```html
<style>
  .markers {
    flow-from: markers;
  }
  /* Generated within the element, similar to a ::before pseudo-element. */
  li::scroll-marker {
    flow-into: markers;
    content: ' ';
  }
</style>
<ul class=scroller>
  <li>Item 1</li>
  <li>Item 2</li>
  <li>Item 3</li>
</ul>
<div class=markers>
</div>
```

This is in fact very similar to the original direction of this proposal,
and is nice in its generality, but was abandoned for a few main reasons:

1.  In most use cases that developers use scroll markers,
    they would want them to flow elsewhere rather than inline where the user is already scrolled to the content.
    Having this implicit with the `::scroll-marker-group` reduces the number of features needed to be combined to establish this.
    A notable exception to this is that when not reflowed they could serve as self links [#10498](https://github.com/w3c/csswg-drafts/issues/10498).
2.  Having an implicit group containing the markers makes allows for the implicit establishment of focusgroup semantics for those markers.
    One is active at a time, and can automatically assign appropriate itemized AX roles.
    If they're completely independent then there's an expectation they're focused in dom order w.r.t. their owning element,
    and not necessarily linked with the other markers.
3.  Requires the developer to create the area for the markers.
    This could be alleviated by allowing the `::before` or `::after` pseudo-elements to contain flowing content,
    but would likely introduce significant complexity. E.g.
    ```css
    .scroller::after {
      flow-from: markers;
    }
    ```

This is still a nice direction to be considered, and potentially which we could even explain the behavior of `::scroll-marker-group` in the future.
E.g. If we decide to do this later, we could explain that the default `::scroll-marker` `flow-into` value is the `flow-from` established by the `::scroll-marker-group`.

### Invoker action and focusgroup invoke action instead of scroll markers

We could add a new built-in `invoke-action` (see [invokers](https://open-ui.org/components/invokers.explainer/)) `scrollTo`. When invoked, the `invokeTarget` will be scrolled to within its ancestor scrolling container. E.g.

```html
<button invoketarget="my-section" invokeaction="scrollTo">Scroll to section</button>
...
<section id="my-section">
  This will be scrolled into view when you click the button
</section>
```

Invoker actions are only [invoked](https://open-ui.org/components/invokers.explainer/#terms) on explicit activation,
and interest actions are shown [interest](https://open-ui.org/components/interest-invokers.explainer/#terms) on focus or hover.
For scroll markers, we want the action to be taken only when the selected marker changes, which occurs on focus navigation within the group, but not on hover.

As such, we'd propose adding the `invoke` keyword to the `focusgroup` attribute to allow invoking the `invokeaction` on focusgroup focus changes. E.g.

```html
<style>
  #toc {
    position: sticky;
    top: 0;
  }
</style>
<ul class="toc" focusgroup="invoke">
  <li><button tabindex="-1" invoketarget="section-1" invokeaction="scrollTo">Section 1</button></li>
  <li><button tabindex="-1" invoketarget="section-2" invokeaction="scrollTo">Section 2</button></li>
  <li><button tabindex="-1" invoketarget="section-3" invokeaction="scrollTo">Section 3</button></li>
  <li><button tabindex="-1" invoketarget="section-4" invokeaction="scrollTo">Section 4</button></li>
</ul>
<section id="section-1">...</section>
<section id="section-2">...</section>
<section id="section-3">...</section>
<section id="section-4">...</section>
```

Note that this example uses tabindex="-1" to apply the [roving tab index with a guaranteed tab stop](https://open-ui.org/components/focusgroup.explainer/#guaranteed-tab-stop) behavior from focusgroup.

This approach implements the navigation behavior, but notably does not explain how scroll markers would track the scroll state and allow styling the active marker.

### overflow-interactivity: inert

One idea that was explored in [#10711](https://github.com/w3c/csswg-drafts/issues/10711)
is a property on a scrolling container which would automatically remove content which is outside of the scrollport.
This is appealing in that it would only remove content which is not seen currently,
ensuring that the content the user is seeing would be interactive and in the accessibility tree.

However, as we have explored use cases,
two key visual effects kept coming up where the later or earlier content is visible, but not intended to be interacted with.
These are:
* Peeking into the next item in the carousel (e.g. [1](https://flackr.github.io/web-demos/css-overflow/carousel/), [2](https://chrome.dev/carousel/vertical/list/)),
* Stacking or other 3d effects where the future or previous content may be visually obscured, scaled down, not intended to be interacted with but still within the scrollport (e.g. [1](https://chrome.dev/carousel/vertical/stack/)).

In these cases, overflow-interactivity would not produce the user's expected interaction model,
and they would have to manually adjust an attribute as they would need to today to mark that content as not currently readable / interactable.
