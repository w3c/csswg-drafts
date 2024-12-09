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
However, this should be simple to express and declare in CSS.

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

## Putting it all together

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

## Future work

There are a few carousel designs not currently addressed.
This section enumerates and explores these areas.

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
