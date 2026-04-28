# Column wrapping

Implementing the CSS properties `column-height` and `column-wrap` from https://drafts.csswg.org/css-multicol-2/

In multi-column (multicol) layout, content is fragmented into columns. When one column is full, another is created next to it, in the inline direction. If the block-size of the multicol container is unconstrained, and there are no forced breaks inside the columns, there will not be more columns than specified via the `column-width` and/or `column-count` CSS properties. If the multicol container block-size is constrained, and the multicol container isn't nested inside another fragmentation context, any additional columns needed will simply be created in the inline direction, overflowing the multicol container. If block-size is constrained by an outer fragmentation context, when paginating for printing, for instance, columns will take up all the available block-size on the page, and create at most as many columns as specified (still via `column-count` and `column-width`). If that's not enough to fit all the content, a page break will be inserted, and multicol layout will resume on the next page. This is essentially a form of implicit column wrapping.

The new `column-wrap` property is intended to enable column wrapping in other scenarios than for nested multicol described above. If the value of `column-wrap` is `wrap`, and all the specified columns have been filled in the inline direction, instead of overflowing in the inline direction, a new row for columns will be created, so that more content can be added *below* the previous row of columns. The block-size of the rows can be set via the new `column-height` property. If it is `auto`, the block-size of the content box will be used instead. Treating `auto` like this is useful for scrollable overflow, so that there's room for one row of columns in the scrollport.

Column layout, or paginated / fragmented content in general, with lots of content (like articles and bigger), where the order of the content matters, has been working well for paged media (where it wraps into reasonably sized chunks, aka pages), whereas for interactive media on screen it is not that convenient. When the user has read and scrolled to the end of one column, the user then has to scroll all the way back up to the beginning of the next column to continue reading, which is tedious (much more so than e.g. turning a page).

Like this:

https://github.com/user-attachments/assets/4b6c2b2b-8858-4543-8082-c5be82f4861a

Adding column wrapping should allow for large-content use cases on screen as well. On that note, Wikipedia uses multicol for the references at the end of articles, and the columns become really tall if there are many references, but that's not much of a problem, since the reading order here isn't crucial.

Another use case is paginated vertical carousels.

## Example 1: simple vertical pagination

Here's one example that sets `column-wrap` but no `column-height`. The height of the columns will be the same as that of the content box of the multicol container.

```html
<!DOCTYPE html>
<style>
  #mc {
    overflow: auto;
    scroll-snap-type: both mandatory;
    padding: 20px;
    width: 450px;
    height: 600px;
    columns: 1;
    column-fill: auto;
    column-wrap: wrap;
    row-gap: 30px;
  }
  #mc::column {
    scroll-snap-align: start;
  }
  #container {
    padding: 10px;
    border: 1px solid;
    box-decoration-break: clone;
    box-shadow:10px 10px 10px gray;
  }
</style>
<div id="mc">
  <div id="container">
    <h2><a id="chap01"></a>CHAPTER I.<br>
      Down the Rabbit-Hole</h2>
    <p>
      Alice was beginning to get very tired of sitting by her sister on the bank, and
      of having nothing to do: once or twice she had peeped into the book her sister
      was reading, but it had no pictures or conversations in it, “and what is
[...]
```

https://github.com/user-attachments/assets/37855721-3b05-493b-8ea5-a99a8e66ad98

## Example 2: 2D columns

Here's an example that sets both column width and height. It will create as many columns as there is room for along the inline axis, with a column height close to that of the viewport, and wrap into multiple rows as needed.

```html
<!DOCTYPE html>
<style>
  #mc {
    column-width: 20em;
    column-height: 80vh;
    column-fill: auto;
    column-wrap: wrap;
    row-gap: 40px;
    padding: 10px;
    background: #eee;
  }
  .chapter {
    break-before: column;
  }
  #container {
    display: flow-root;
    padding: 0 10px;
    text-align: justify;
    background: white;
  }
</style>
<div id="mc">
  <div id="container">
    <div class="chapter">
    <h2><a id="chap01"></a>CHAPTER I.<br>
      Down the Rabbit-Hole</h2>
    <p>
      Alice was beginning to get very tired of sitting by her sister on the bank, and
      of having nothing to do: once or twice she had peeped into the book her sister
      was reading, but it had no pictures or conversations in it, “and what is
[...]
```

https://github.com/user-attachments/assets/c66bf44c-4487-4cb1-b8c0-69a77292693c

## Example 3: vertical paginated carousel

And here's an online ice cream shop, with one column per row, but potentially room for more than one item in each column.

```html
<!DOCTYPE html>
<style>
  ul#carousel {
    margin: 0 0 0 40px;
    padding: 0;
    overflow: auto;
    height: 450px;
    anchor-name: --carousel;
    columns: 1;
    column-wrap: wrap;
    scroll-snap-type: block mandatory;
    counter-reset: item;
    scroll-marker-group: after;

    &::scroll-marker-group {
      position: absolute;
      position-anchor: --carousel;
      right: anchor(left);
      top: anchor(top);
      bottom: anchor(bottom);
      display: flex;
      flex-flow: column;
      justify-content: safe center;
    }
    &::column {
      scroll-snap-align: start;
    }
    &::column::scroll-marker {
      content: "";
      flex: none;
      border: 5px solid black;
      border-radius: 50%;
      width: 15px;
      height: 15px;
      margin: 4px 8px;
      background: gray;
    }
    &::column::scroll-marker:target-current {
      background: gold
    }
    li {
      display: inline-flex;
      justify-content: center;
      align-items: center;
      box-sizing: border-box;
      width: 300px;
      height: 100%;
      border: solid;
      border-radius: 5px;
    }
    li::before {
      content: "Icecream " counter(item);
      counter-increment: item;
    }
  }
</style>

<ul id="carousel">
  <li style="background: #cba;"></li>
  <li style="background: #ffe;"></li>
  <li style="background: #bdc;"></li>
  <li style="background: #dbc;"></li>
  <li style="background: #987;"></li>
  <li style="background: #789;"></li>
  <li style="background: #798;"></li>
  <li style="background: #897;"></li>
  <li style="background: #879;"></li>
  <li style="background: #fed;"></li>
  <li style="background: #def;"></li>
  <li style="background: #fde;"></li>
  <li style="background: #dfe;"></li>
  <li style="background: #efd;"></li>
</ul>
```

https://github.com/user-attachments/assets/b96c4ce2-b3e3-4c9f-978d-cb1d96dc3a1c

## What do web developers currently do to achieve such layout?

If the author has full control over the size of the contents, the author may of
course create a page-like experience with vertical scrolling (and
snapping). Alternatively, the author may use some heavy javascriptery to measure
the size of the contents, and place it into "pages" somehow. Currently there is
no way of creating fragmentainers stacked in the block direction.

## Alternatives to column wrapping

An alternative approach would be explicit paginated overflow:
https://drafts.csswg.org/css-overflow-5/#paginated-overflow , which hasn't yet
been specced, but is in many ways a continuation of
https://www.w3.org/TR/2011/WD-css3-gcpm-20111129/#paged-presentations , which
got implemented in Opera's Presto engine one and a half decades ago.

This would easily support [example 1](#example-1-simple-vertical-pagination) and
[example 3](#example-3-vertical-paginated-carousel). It would also be possible
to get paginated column layout by specifying both paged overflow AND `columns`
(or by speccing something like `pagination-layout: horizontal 2` as mentioned in
[ISSUE 22](https://drafts.csswg.org/css-overflow-5/#issue-e78fc89d)).

One limitation, though is that this approach would depend on overflow, so that
[example 2](#example-2-2d-columns), which has auto `height` and non-auto
`column-height` wouldn't work.

Another thing to figure out for the paginated overflow approach, is the gaps
(and rules / decoration) between the pages. With the `column-wrap` approach we
get it for "free", since there's both [`column-gap` /
`row-gap`](https://drafts.csswg.org/css-align/#column-row-gap) and
[`column-rule` /
`row-rule`](https://drafts.csswg.org/css-gaps-1/#gap-decoration-shorthands)
already.

## Are there any privacy, security and accessibility considerations?

There are no such additional concerns, compared to multicol without this
feature. There is no accessibility functionality specifically for columns. It
just relies on regular scrolling mechanisms and tab focus.
