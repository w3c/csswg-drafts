# Explainer: Tree counting functions - sibling-index() and sibling-count()

## Authors

- Rune Lillesveen ([@lilles](https://github.com/lilles)), Google

## Participate

- https://github.com/w3c/csswg-drafts/issues with prefix `[css-values-5]`

## The Problem

Authors have been asking for a convenient way of styling elements based on
their DOM position among their siblings as well as the total number of siblings.

Example use cases for this are staggered animations setting the [animation- or
transition-delay](https://chriscoyier.net/2023/11/29/element-indexes/) based on
the sibling position, and [building a radial menu](https://una.im/radial-menu/).

It is possible to do this today through custom properties and exhaustingly
listing all possible number of sibling through `:nth-child()` and
`:has(:nth-child())` rules for sibling index and sibling count respectively.
This trick is described on [css-tricks.com](https://css-tricks.com/how-to-wait-for-the-sibling-count-and-sibling-index-functions/#aa-rubbing-two-sticks-together)

## The Solution

The CSS Values and Units Module Level 5 introduces [tree counting functions](https://drafts.csswg.org/css-values-5/#tree-counting),
specifically `sibling-index()` and `sibling-count()`. These functions can be
used as `<integer>` values directly or combined with other values in `calc()`
expressions. The `sibling-index()` and `sibling-count()` functions evaluate to
integers at computed value time based on the flat tree position of the element.

## Demo

Here is a demo that combines using `sibling-index()` and `sibling-count()` for
both transform and staggered transitions. The items are distributed in a half-
circle, the half-circle radius adapts to the number of elements, and the fan-
out transition that spreads the elements is delayed for each element based on
its sibling position.

```html
<!DOCTYPE html>
<style>
  body { margin: 0; }
  :root { height: 100vh; }
  .item {
    width: 50px;
    height: 50px;
    background: teal;
    position: absolute;
    inset: 0;
    bottom: 20px;
    place-self: center;
    border-radius: 50%;
    transition: transform ease-out 0.5s;
    transition-delay: calc(sibling-index() * 50ms);
    --angle: calc(180.0deg * ((sibling-index() - 1) / (sibling-count() - 1)));
    transform: rotate(var(--angle)) translate(0);
  }
  :root:hover .item {
    transform: rotate(var(--angle)) translate(calc(-20px * sibling-count()));
  }
</style>
<div class="item"></div>
<div class="item"></div>
<div class="item"></div>
<div class="item"></div>
<div class="item"></div>
<div class="item"></div>
<div class="item"></div>
<div class="item"></div>
```

## Resources

- [CSS Values 5 Specification](https://drafts.csswg.org/css-values-5/#tree-counting)
- [How to Wait for the sibling-count() and sibling-index() Functions](https://css-tricks.com/how-to-wait-for-the-sibling-count-and-sibling-index-functions/)
- [Element Indexes](https://chriscoyier.net/2023/11/29/element-indexes/)
- [Possible Future CSS: Tree-Counting Functions and Random Values](https://kizu.dev/tree-counting-and-random/)
- [Building a no-JS radial menu with CSS trigonometry, popover, and anchor positioning](https://una.im/radial-menu/)
