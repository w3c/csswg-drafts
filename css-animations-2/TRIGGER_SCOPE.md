# Explainer for trigger-scope

This explainer is a description of the `trigger-scope` CSS property which provides a
scoping mechanism for animation trigger-related names.

## Summary
Animation triggers created in CSS are given names through which those triggers
can be matched with animations. For example `timeline-trigger` declares a
timeline-based trigger which can then be matched with an animation via the
`animation-trigger` property. Here is an example:

```CSS
@keyframes expand {
  from { transform: scaleX(1) }
  to { transform: scaleX(2) }
}

.source {
  timeline-trigger: --trigger view() contain;
}

.target {
  animation: expand .1s linear both;
  animation-trigger: --trigger play-forwards play-backwards;
}
```

In the above example, an element with the class `target` attaches its `expand`
animation to the `timeline-trigger` named `--trigger` allowing the animation to
be played forward or backward when the appropriate scrolling occurs.

However, the name `--trigger` is globally visible by default. As such,
any element in the DOM that references `--trigger` in similar fashion will have
its animation attached to the same trigger object. This is useful and
might often match an author's intention but that might not always be the case.
One example is where an author intends to have elements of a
certain class behave (independently of each other) as both the `source` and
`target` in the previous example. Here is an example:

```CSS
@keyframes slide-in {
  from { transform: translateX(-50px) }
  to { transform: translateX(0xp) }
}

.section {
  timeline-trigger: --trigger view() contain;
  animation: slide-in .1s linear both;
  animation-trigger: --trigger play-forwards play-backwards;
}
```

In this example, the intention is to associate each `section` element with a
triggered animation which causes it to slide in as it comes into view within its
containing scroll port. Since the names declared by a `timeline-trigger`
declaration are globally visible, the `section` elements attach their animations
to the same trigger object.

## trigger-scope
`trigger-scope` gives an author the ability to scope the name declared by a
trigger-instantiating property (e.g. `timeline-trigger`) to the subtree of the
element declaring `trigger-scope`. To fix the previous example the author would
modify their code to the following:

```CSS
@keyframes slide-in {
  from { transform: translateX(-50px) }
  to { transform: translateX(0px) }
}

.section {
  trigger-scope: all;
  timeline-trigger: --trigger view() contain;
  animation: slide-in .1s linear both;
  animation-trigger: --trigger play-forwards play-backwards;
}
```

Note: it would also suffice to use `trigger-scope: --trigger` in the above example.

# Details

`timeline-scope` works similarly to [`anchor-scope`](https://drafts.csswg.org/css-anchor-position-1/#anchor-scope),
accepting `none` or `all` or a list of dashed idents. It prevents a trigger
name from being referred to by an element outside the subtree of the
element declaring `trigger-scope`. It also prevents an element within the
subtree of the element declaring `trigger-scope` from searching for a trigger
name outside the subtree.

`none` is the default and does not restrict the visibility of the trigger names
in the subtree of the element declaring `trigger-scope`.

`all` restricts the visibility of all the names in the trigger names in the
subtree.

## Alternatives Considered

### Make names scoped to subtree by default.
With regard to handling dashed ident names declared by CSS properties, two
models currently exist: the `timeline-scope` model and the `anchor-scope` model.

The `anchor-scope` model is the same as what is described above for
`trigger-scope`. The `timeline-scope` model takes the opposite approach: it
restricts the visibility of names declared by properties like `view-timeline`
and `scroll-timeline` to the subtree of the element declaring that property
(`view-timeline` or `scroll-timeline`) by default and uses `timeline-scope` to
expand the visibility of the name to the include the subtree of the element
declaring `timeline-scope`.

In issue [#12581](https://github.com/w3c/csswg-drafts/issues/12581#issuecomment-3206707173)
the CSS working group decided to have a consistent name scoping model and
reasoned that `anchor-scope` model was more consistent with the general pattern
of the visibility of named items in CSS. The working group also resolved to
switch `timeline-scope` over to the `anchor-scope` model.
