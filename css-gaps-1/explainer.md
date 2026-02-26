# CSS Gap Decorations

## Authors

- [Kevin Babbitt](https://github.com/kbabbitt)

## Participate

- [Issue tracker](https://github.com/MicrosoftEdge/MSEdgeExplainers/labels/CSSGapDecorations)

## Status of this Document

This document is intended as a starting point for engaging the community and
standards bodies in developing collaborative solutions fit for standardization.
As the solutions to problems described in this document progress along the
standards-track, we will retain this document as an archive and use this section
to keep the community up-to-date with the most current standards venue and
content location of future work and discussions.

* This document status: **Active**
* Expected venue: [CSS Working Group](https://www.w3.org/Style/CSS/)
* Current version: this document

## Table of Contents

<!-- [You can generate a Table of Contents for markdown documents using a tool like [doctoc](https://github.com/thlorenz/doctoc).] -->

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->

- [CSS Gap Decorations](#css-gap-decorations)
  - [Authors](#authors)
  - [Participate](#participate)
  - [Status of this Document](#status-of-this-document)
  - [Table of Contents](#table-of-contents)
  - [Introduction](#introduction)
  - [Goals](#goals)
  - [Non-goals](#non-goals)
  - [User research](#user-research)
  - [Properties](#properties)
    - [Width, style, and color](#width-style-and-color)
    - [Interaction with intersection types](#interaction-with-intersection-types)
    - [Extending or shortening gap decoration segments](#extending-or-shortening-gap-decoration-segments)
    - [Paint order](#paint-order)
    - [Decorations next to empty areas](#decorations-next-to-empty-areas)
  - [Key scenarios](#key-scenarios)
    - [Scenario 1: Horizontal lines between CSS grid rows](#scenario-1-horizontal-lines-between-css-grid-rows)
    - [Scenario 2: Lines dividing items in both directions of a grid](#scenario-2-lines-dividing-items-in-both-directions-of-a-grid)
    - [Scenario 3: Segmented gap decorations](#scenario-3-segmented-gap-decorations)
    - [Scenario 4: Grid layout with white space in leading columns](#scenario-4-grid-layout-with-white-space-in-leading-columns)
    - [Scenario 5: Column decorations only between items](#scenario-5-column-decorations-only-between-items)
  - [Future ideas](#future-ideas)
    - [Images](#images)
    - [Corner joins](#corner-joins)
    - [Propagation of gap decorations into subgrids](#propagation-of-gap-decorations-into-subgrids)
    - [Extensions to decoration visibility controls](#extensions-to-decoration-visibility-controls)
    - [Placement of gap decorations](#placement-of-gap-decorations)
      - [Scenario: Calendar grid with header column](#scenario-calendar-grid-with-header-column)
      - [Scenario: Different lines for different gaps, applied to a sub-area of a grid](#scenario-different-lines-for-different-gaps-applied-to-a-sub-area-of-a-grid)
      - [Scenario: Periodic Table omitting decorations from certain areas](#scenario-periodic-table-omitting-decorations-from-certain-areas)
  - [Dropped ideas](#dropped-ideas)
    - [Logical properties](#logical-properties)
  - [Considered alternatives](#considered-alternatives)
    - [Alternative 1: 2021 draft specification](#alternative-1-2021-draft-specification)
    - [Alternative 2: Using pseudo-elements](#alternative-2-using-pseudo-elements)
  - [References \& acknowledgements](#references--acknowledgements)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

## Introduction

CSS multi-column containers allow for
[rules](https://drafts.csswg.org/css-multicol-1/#cr) to be drawn between
columns. Applying similar styling to other container layouts such as grid and
flex has been widely sought after, as seen in the discussion for CSS Working
Group issue [2748](https://github.com/w3c/csswg-drafts/issues/2748) and in
several StackOverflow questions (
[[1]](https://stackoverflow.com/questions/45884630/css-grid-is-it-possible-to-apply-color-to-grid-gaps)
[[2]](https://stackoverflow.com/questions/59899641/is-it-possible-to-draw-all-css-grid-lines-as-dotted-borders-or-outlines-if-js-i)
[[3]](https://stackoverflow.com/questions/47882924/preventing-double-borders-in-css-grid)
[[4]](https://stackoverflow.com/questions/67479163/css-border-doubling-with-flex)
). Currently, developers seeking to draw such decorations must resort to
non-ergonomic workarounds such as these examples:

- https://www.smashingmagazine.com/2017/09/css-grid-gotchas-stumbling-blocks/#how-do-i-add-backgrounds-and-borders-to-grid-areas
- https://x.com/geddski/status/1004731709764534274

## Goals

* Extend CSS [column rule
  properties](https://drafts.csswg.org/css-multicol-1/#column-gaps-and-rules) to
  apply to other container layouts such as grid, flex, and grid-lanes.
* Introduce row-direction gap decorations on CSS container layouts.
* Allow gap decorations to vary over a given container to handle cases such as
  alternating row separators.

## Non-goals

* Gap decorations on CSS Tables. The [CSS Tables
  specification](https://drafts.csswg.org/css-tables-3/) is currently Not Ready
  for Implementation, and there are interoperability differences among engines.
  Additionally, authors can achieve many of the scenarios covered by this
  explainer in a table already using cell borders.
* Images in gap decorations. Further exploration is needed into the best way to
  handle these, so this scenario is left as a [future idea](#images).

## User research

Use cases in this explainer were collected from the discussion in CSSWG issue
[2748](https://github.com/w3c/csswg-drafts/issues/2748). Additional inspiration
was drawn from discussions in CSSWG issues
[5080](https://github.com/w3c/csswg-drafts/issues/5080),
[6748](https://github.com/w3c/csswg-drafts/issues/6748), and
[9482](https://github.com/w3c/csswg-drafts/issues/9482).

Comments received on the feature in MSEdgeExplainers issues
[996](https://github.com/MicrosoftEdge/MSEdgeExplainers/issues/996),
[1099](https://github.com/MicrosoftEdge/MSEdgeExplainers/issues/1099),
[1100](https://github.com/MicrosoftEdge/MSEdgeExplainers/issues/1100), and
[1111](https://github.com/MicrosoftEdge/MSEdgeExplainers/issues/1111)
have also been incorporated into the design.

## Properties

Unless otherwise noted, corresponding `row-` and `column-` properties should be
assumed to have identical syntax. All such pairs of properties also have
shorthands that apply the same values in both directions.

For property grammar details, please see the
[Editor's Draft](https://drafts.csswg.org/css-gaps-1/).

### Width, style, and color

In addition to replicating the existing column-rule properties in the row
direction, we expand the syntax of both sets of properties to allow for multiple
definitions. If a given property has fewer list entries than the number of gaps,
the list is cycled through from the beginning as needed.

Authors may also use familiar syntax from CSS Grid such as `repeat()`
and `auto` to create patterns of line definitions. Note that while `repeat()` and `auto`
are inspired by CSS Grid, they may also be used to create patterns of decorations
in flex, multi-column, and grid-lanes containers.

Shorthands are also available to combine the width, style, and color properties.

```css
.alternate-red-blue {
  display: grid;
  grid-template-columns: repeat(3, 100px);
  grid-auto-rows: 30px;
  gap: 10px;
  row-rule: 1px solid;
  row-rule-color: red, blue;
}
```
<image src="images/example-red-blue.png">

```css
.alternate-heavy-light {
  display: grid;
  grid-template-columns: repeat(3, 100px);
  grid-auto-rows: 30px;
  gap: 10px;
  row-rule: 2px solid black, 1px solid lightgray;
}
```
<image src="images/example-heavy-light.png">

Like column rules in multi-column layout, gap decorations in other layout
containers do not take up space and do not affect the layout of items in the
container. Conceptually, gap decorations are considered after layout has
completed, and in particular after we already know the full extent of the
[implicit grid](https://drafts.csswg.org/css-grid-2/#implicit-grid) in grid
layout, or the number of lines in flex layout, or the number of columns in
multi-column layout, or the number of tracks in grid-lanes layout. Thus, the
`repeat()` grammar, while modeled after the `grid-template` properties, is
simpler for gap decorations as there are fewer unknowns to consider.

```css
.varying-widths {
  dispay: grid;
  grid-template-columns: repeat(3, 100px);
  grid-auto-rows: 30px;
  row-gap: 9px;
  row-rule: 5px solid black, repeat(auto, 1px solid black), 3px solid black;
}
.item {
  height: 30px;
  padding: 5px;
  border: 1px dotted lightgray;
}
```

<image src="images/example-width-style-color.png">

### Interaction with intersection types

Authors may change the set of intersections where gap decorations break,
from the default behavior to either "all intersections" or "no intersections."
Where gap decorations overlap items in the container, the decoration is painted
behind the item.

```css
.normal {
  rule-break: normal;
}
```
<image src="images/example-break-normal.png">

```css
.all-intersections {
  rule-break: intersection;
}
```
<image src="images/example-break-intersection.png">

```css
.no-intersections {
  rule-break: none;
}
```
<image src="images/example-break-none.png">

### Extending or shortening gap decoration segments

By default, gap decorations are painted as continuous segments that extend as
far as possible along the centerline of a given visible gap.
The decoration is painted from visible intersection to another,
with each endpoint at the innermost edge of the intersection.

```css
.grid-with-spans {
  display: grid;
  grid-template: repeat(4, 100px) / repeat(4, 100px);
  gap: 20px;
  row-rule: 6px solid red;
  column-rule: 6px solid blue;
}
```

<image src="images/example-grid-with-spans.png">

```css
.flex {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  width: 500px;
  row-rule: 6px solid red;
  column-rule: 6px solid blue;
}
```
<image src="images/example-flex.png">

Authors may adjust the positions of endpoints relative to gap intersections,
either as a fixed distance or as a percentage of the width of the intersection.
The "zero point" is the edge of the intersection, with negative values extending
into the intersection and positive values receding from it.

```css
.inset-0px {
  column-rule-break: intersection;
  column-rule-inset: 0px;
}
```
<image src="images/example-column-inset-0px.png">

```css
.inset-5px {
  column-rule-break: intersection;
  column-rule-inset: 5px;
}
```
<image src="images/example-column-inset-5px.png">

```css
.inset-negative-5px {
  column-rule-break: intersection;
  column-rule-inset: -5px;
}
```
<image src="images/example-column-inset-minus-5px.png">

Authors may also adjust endpoints more granularly, making a distinction between "edge"
endpoints (which fall on the edge of the container),
and "interior" endpoints (any endpoint that is not an "edge").

```css
.edge-interior-insets {
  column-rule-break: intersection;
  column-rule-edge-inset: 0px;
  column-rule-interior-inset: -5px;
}
```

<image src="images/example-column-interior-inset-5px.png">

Similarly, authors can have even more granular control to adjust the positions of endpoints,
making a distinction between "start" and "end" endpoints, in addition to the "edge" and "interior" distinction.

```css
.start-end-edge-interior-insets {
  column-rule-break: intersection;

  column-rule-edge-inset-start: 8px;
  column-rule-interior-inset-start: 8px;
  /* or shorthand: */
  column-rule-inset-start: 8px;
}
```

<image src="images/example-column-start-end-edge-interior-insets.png">

### Paint order

When row and column gap decorations overlap, authors can control their painting order.
By default, row-direction decorations are painted on top of column-direction decorations.

```css
rule-overlap: [ row-over-column | column-over-row ]
```

```css
.row-over-column {
  row-rule: 6px solid red;
  column-rule: 6px solid blue;
  rule-overlap: row-over-column;
}
```
<image src="images/example-row-over-column.png">

```css
.column-over-row {
  row-rule: 5px solid red;
  column-rule: 5px solid blue;
  rule-overlap: column-over-row;
}
```
<image src="images/example-column-over-row.png">

### Decorations next to empty areas

By default, gap decoration segments appear throughout a container.
In some cases, authors may not want to paint segments next to empty areas.
The `*-rule-visibility-items` properties allow control over this.

```css
.container {
  display: grid;
  grid-template: repeat(3, 100px) / repeat(3, 100px);
  gap: 10px;
  rule: 1px solid black;
  rule-break: intersection;
  rule-visibility-items: all; /* initial value */
}
.item {
  background: lightgray;
}
```
```html
<div class="container">
  <div class="item" style="grid-area: 1 / 1">Item 1</div>
  <div class="item" style="grid-area: 2 / 1">Item 2</div>
  <div class="item" style="grid-area: 2 / 2">Item 3</div>
  <div class="item" style="grid-area: 3 / 1">Item 4</div>
</div>
```

<image src="images/example-rule-visibility-items-all.png">

```css
.container {
  display: grid;
  grid-template: repeat(3, 100px) / repeat(3, 100px);
  gap: 10px;
  rule: 1px solid black;
  rule-break: intersection;
  rule-visibility-items: around;
}
.item {
  background: lightgray;
}
```
```html
<div class="container">
  <div class="item" style="grid-area: 1 / 1">Item 1</div>
  <div class="item" style="grid-area: 2 / 1">Item 2</div>
  <div class="item" style="grid-area: 2 / 2">Item 3</div>
  <div class="item" style="grid-area: 3 / 1">Item 4</div>
</div>
```

<image src="images/example-rule-visibility-items-around.png">

```css
.container {
  display: grid;
  grid-template: repeat(3, 100px) / repeat(3, 100px);
  gap: 10px;
  rule: 1px solid black;
  rule-break: intersection;
  rule-visibility-items: between;
}
.item {
  background: lightgray;
}
```
```html
<div class="container">
  <div class="item" style="grid-area: 1 / 1">Item 1</div>
  <div class="item" style="grid-area: 2 / 1">Item 2</div>
  <div class="item" style="grid-area: 2 / 2">Item 3</div>
  <div class="item" style="grid-area: 3 / 1">Item 4</div>
</div>
```

<image src="images/example-rule-visibility-items-between.png">

Note that `rule-visibility-items` in the examples above is a shorthand
for `column-rule-visibility-items` and `row-rule-visibility-items`,
which can also be set independently:

```css
.container {
  display: grid;
  grid-template: repeat(3, 100px) / repeat(3, 100px);
  gap: 10px;
  rule: 1px solid black;
  rule-break: intersection;
  column-rule-visibility-items: around;
  row-rule-visibility-items: between;
}
.item {
  background: lightgray;
}
```
```html
<div class="container">
  <div class="item" style="grid-area: 1 / 1">Item 1</div>
  <div class="item" style="grid-area: 2 / 1">Item 2</div>
  <div class="item" style="grid-area: 2 / 2">Item 3</div>
  <div class="item" style="grid-area: 3 / 1">Item 4</div>
</div>
```

<image src="images/example-rule-visibility-items-independent.png">

## Key scenarios

### Scenario 1: Horizontal lines between CSS grid rows

https://github.com/w3c/csswg-drafts/issues/2748#issuecomment-446379068, which
links to: https://codepen.io/urlyman/pen/yGNOya

> The desired effect is a line appearing only between the grid rows, and
> extending unbroken across the column gaps.
>
> Note that I don't want a line to appear above or beneath all rows, only in the
> gaps between rows.

```css
.container {
  row-rule: 1px solid #ccc;
}
```

<image src="images/csswg-drafts-issues-2748-issuecomment-446379068.png">

### Scenario 2: Lines dividing items in both directions of a grid

https://github.com/w3c/csswg-drafts/issues/2748#issuecomment-595663212

```css
.container {
  rule: thick solid green;
}
```

<image src="images/csswg-drafts-issues-2748-issuecomment-595663212.png">

### Scenario 3: Segmented gap decorations

https://github.com/w3c/csswg-drafts/issues/2748#issuecomment-446781218 - last
example

```css
.container {
  rule: 1px solid black;
  column-rule-inset: 0px;
}
```

<image
src="images/csswg-drafts-issues-2748-issuecomment-446781218-last-example.png">

### Scenario 4: Grid layout with white space in leading columns

https://github.com/MicrosoftEdge/MSEdgeExplainers/issues/1099

```css
.layout {
  display: grid;
  grid-template-areas:
    ". . content author"
    ". . content social";
  gap: 5px;
  rule: 1px solid gray;
  rule-visibility-items: around;
  border-top: 1px solid gray;
}
```

<image src="images/explainer-issue-1099.png">

### Scenario 5: Column decorations only between items

https://github.com/MicrosoftEdge/MSEdgeExplainers/issues/1100

```css
.layout {
  display: grid;
  grid-template-columns: 400px 1000px;
  column-gap: 90px;
  row-gap: 50px;
  column-rule: 1px solid white;
  column-rule-visibility-items: between;
}
```

<image src="images/explainer-issue-1100.png">

## Future ideas

### Images

Much like `border-image`, support for images in gap decorations would allow for
more decorative separators to be used. These could be purely design choices, or
they could be used to achieve practical effects such as coupon borders.
Examples:

* https://github.com/w3c/csswg-drafts/issues/2748#issuecomment-446781218 - third example

  <image src="images/csswg-drafts-issues-2748-issuecomment-446781218-third-example.png">

* https://github.com/w3c/csswg-drafts/issues/2748#issuecomment-621983931

  <image src="images/csswg-drafts-issues-2748-issuecomment-621983931-first-example.png">

* https://github.com/MicrosoftEdge/MSEdgeExplainers/issues/1161

  <image src="images/explainer-issue-1161.png">

However, unlike `border-image`, gap decoration images need to cover
significantly more cases, such as T intersections and cross intersections. More
detail and examination of this issue:

* https://github.com/w3c/csswg-drafts/issues/5080#issuecomment-1526585163
* https://github.com/w3c/csswg-drafts/issues/2748#issuecomment-623039817

### Corner joins

In [Issue 985](https://github.com/MicrosoftEdge/MSEdgeExplainers/issues/985), it
was suggested that we apply a `border-radius` like property to gap decorations
to allow for more flexible styling near intersections. We could also potentially
reuse concepts from `corner-shape` for even more flexibility. This idea is tracked
in [CSSWG Issue 12150](https://github.com/w3c/csswg-drafts/issues/12150).

### Propagation of gap decorations into subgrids

CSS Grid Level 2 defines the
[subgrid](https://www.w3.org/TR/css-grid-2/#subgrids) feature. A subgrid matches
up its grid lines to lines in the parent grid. Accordingly, gaps will also align
between a subgrid and its parent grid, though the sizes of these gaps may
differ. There may be use cases for propagating gap decorations from the parent
grid into corresponding gaps in the subgrid; we could perhaps do this with a
special keyword on the `*-rule-width`, `*-rule-style`, and `*-rule-color`
properties. See [CSSWG Issue
12326](https://github.com/w3c/csswg-drafts/issues/12326) for further discussion.

### Extensions to decoration visibility controls

Design discussions for `*-rule-visibility-items` also considered companion
`*-rule-visibility-self` properties which would allow the container-wide value to
be overridden on specific items. For example, an author who wants to draw 
decorations only around a specific item in the container might set
`rule-visibility-items: none` on the container, and
`rule-visibility-self: around` on the specific item that they want to draw around.

`start-side` and `end-side` have also been suggested as additional values for both
`*-rule-visibility-items` and `*-rule-visibility-self`, to draw decorations only 
on one side or the other of items.

### Placement of gap decorations

An author may want to apply different sets of gap decorations to different
regions of a given container layout. We refer to such regions as a *gap
decoration areas*. The examples below illustrate how these might work on a grid
container; gap decoration areas on other container types have not yet been
explored.

The author defines these areas using the `rule-areas` property. Each area is
defined by giving it first a name, then a tuple of numbers or line names which
work exactly as they would in the `grid-area` property:

```css
  rule-areas: --first-row 1 / 1 / 2 / -1, --first-column 1 / 1 / -1 / 2;
```

On a grid container, the above value of `rule-areas` would define an area named
`--first-row` that includes the grid lines within and around the first row (row
line 1, column line 1 to row line 2, column line -1) and an area named
`--first-column` that includes the grid lines within and around the first column
(row line 1, column line 1 to row line -1, column line 2). These areas are
inclusive of the grid lines on their edges.

Then, on other gap decoration properties such as `*-rule-width`, `*-rule-style`,
and `*-rule-color`, the author can then specify first a "default" set of values
for the container, then a named area, then a set of values that applies to that
area, and so on:

```css
  rule: 1px solid black, 1px solid gray [--first-row] 3px solid black, 5px solid black [--first-column] 1px solid blue;
```

Cycling behavior applies in named areas the same as it does elsewhere, and where
multiple values would cover the same segment of a gap, the last one that applies
will "win". Thus, the value above would apply alternating 1px solid black and
1px solid gray rules to the grid in general, then override gaps in the first row
with alternating 3px solid black and 5px solid black rules, then on top of that
override gaps in the first column with 1px solid blue rules.

#### Scenario: Calendar grid with header column

```css
.grid-multiple-decoration-areas {
  display: grid;
  grid-template-rows: [top] 30px [main-top] repeat(6, 30px) [bottom];
  grid-template-columns: [left] 100px [main-left] repeat(3, 100px) [right];
  gap: 10px;
  rule-areas: --month-column left / top / main-left / bottom;
  row-rule: 1px solid black [--month-column] 1px solid lightblue;
  column-rule: [--month-column] 1px solid lightblue;
}
```

<image src="images/example-multiple-areas.png">

#### Scenario: Different lines for different gaps, applied to a sub-area of a grid

https://github.com/w3c/csswg-drafts/issues/2748#issuecomment-595889781

```css
.container {
  rule-style: solid:
  rule-color: lightgray;
  rule-areas: --main 2 / 2 / -1 / -1;
  column-rule-width: [--main] 1px repeat(auto, 2px) 1px;
  row-rule-width: [--main] 0px repeat(auto, 2px 1px);
}
```

<image src="images/csswg-drafts-issues-2748-issuecomment-595889781.png">

#### Scenario: Periodic Table omitting decorations from certain areas

https://github.com/w3c/csswg-drafts/issues/12024#issuecomment-3086244002

```css
.container {
  display: grid;
  grid-template: repeat(4, 280px) / repeat(8, auto);
  gap: 20px;
  rule-areas: --top-center 1 / 4 / 2 / 6, --bottom-left -2 / 1 / -1 / 2, --bottom-right -2 / -1 / -1 / -1;
  column-rule: 18px solid red [--top-center] none [--bottom-left] none [--bottom-right] none;
}
```

<image src="images/csswg-drafts-issue-12024-issuecomment-3086244002-first-example.png">

## Dropped ideas

### Logical properties

*This idea was dropped based on feedback raised in the [initial proposal discussion](https://github.com/w3c/csswg-drafts/issues/10393).*

These are designed to enable scenarios where authors wish to switch, for example,
`flex-direction` based on space constraints or other factors.

| Property         | row or row-reverse direction | column or column-reverse direction |
|------------------|------------------------------|------------------------------------|
| main-rule-width  | row-rule-width               | column-rule-width                  |
| main-rule-style  | row-rule-style               | column-rule-style                  |
| main-rule-color  | row-rule-color               | column-rule-color                  |
| main-rule        | row-rule                     | column-rule                        |
| cross-rule-width | column-rule-width            | row-rule-width                     |
| cross-rule-style | column-rule-style            | row-rule-style                     |
| cross-rule-color | column-rule-color            | row-rule-color                     |
| cross-rule       | column-rule                  | row-rule                           |

And so on for other properties.

For flex containers, the logical properties map based on
`flex-direction` following the convention above.

For grid containers, `main` maps to `row`, and `cross` maps to `column`.

For multi-column containers, `main` maps to `column`, and `cross` maps to `row`.

## Considered alternatives

### Alternative 1: 2021 draft specification

In 2021, Mats Palmgren from Mozilla posted a [draft
specification](https://matspalmgren.github.io/css-gap-decorations/Overview.html)
for gap decorations. We believe the proposal in this explainer improves on
developer ergonomics by (a) reusing concepts from grid layout such as repeat and
grid lines, and (b) simplifying the model for fine-tuning segment placement. We
also believe the proposal in this explainer offers developers more flexibility
even absent support for gap decoration images; see Scenario 3 for one example.

### Alternative 2: Using pseudo-elements

An alternative approach to `column-rule-*` and `row-rule-*` properties would be
to introduce pseudo-elements representing gaps, for example:

```css
.container {
  display: grid;
  grid-template: auto / auto;
  gap: 5px;
}
.container::column-gaps {
  background: red;
  width: 1px;
}
.container::row-gaps {
  background: blue;
  width: 1px;
}
```

In some ways, this would be more powerful, as it would allow for more
flexibility for what can be placed in the gaps.

However, this approach also comes with drawbacks. Varying gap decorations over a
container becomes much harder. One might imagine a `::row-gaps::nth(even)`
pseudo selector to style every other row gap. However, certain container types
such as grid can automatically generate rows and columns depending on their
contents. That means we don't know until layout time how many such pseudo styles
we need to produce, which creates a wrong-way dependency between layout and
style. It would also mean that, for large containers, we would incur the costs
of calculating and storing styles for every single gap. That would be a large
overhead to absorb, especially considering that the more common case is to have
at most a single decoration style for a given container.

## References & acknowledgements

Many thanks for valuable feedback and advice from:

- <a href="https://github.com/alico-cra">@alico-cra</a>
- Ahmad Shadeed
- Alison Maher
- Benoît Rouleau
- Elika Etemad
- Ian Kilpatrick
- Josh Tumath
- Kurt Catti-Schmidt
- Lea Verou
- Oliver Williams
- Rachel Andrew
- Sam Davis Omekara Jr.
- Sebastian Zartner
- Tab Atkins-Bittner
