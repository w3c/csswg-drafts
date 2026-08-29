# Explainer: The revert-rule Keyword

## Authors

@andruud

## Introduction

CSS has built-in mechanisms for falling back to a previously specified value whenever an invalid value is encountered. For example:

```css
div.basic {
  display: block;
}
div.fancy {
  display: fancy;
}
```

Given `<div class="basic fancy">`, and assuming that `fancy` is not (yet) a valid `display` type in your user agent, the `display: fancy` declaration is simply ignored; we effectively fall back to `display: block`.

This fallback functionality depends on declarations being recognized as valid or invalid at _parse time_. With the proliferation of
[arbitrary substitution functions](https://drafts.csswg.org/css-values-5/#arbitrary-substitution), however, this is no longer possible, since values containing such functions are assumed to be valid at that time. For example, say we want to make `display` `fancy` conditionally
based on a custom property:

```css
div.basic {
  display: block;
}
div.fancy {
  display: if(style(--enable-fancy): fancy);
}
```

If `--enable-fancy` is _not_ set here, we do not fall back to `block`; it instead becomes [invalid at computed value time](https://drafts.csswg.org/css-values-5/#invalid-at-computed-value-time), and ultimately the property's initial value (`inline`). While you could provide your fallback as an `else:block` branch to the `if()` function, this requires providing the `block` value explicitly; you lose the flexibility inherent in the behavior of falling back to whatever you would otherwise get (without knowing the details).

## Solution: The `revert-rule` Keyword

The `revert-rule` keyword allows authors to dynamically revert back to the previous rule in the [sorting order](https://drafts.csswg.org/css-cascade-5/#cascade-sort)
determined by css-cascade:

```css
div.basic {
  display: block;
}
div.fancy {
  display: if(style(--enable-fancy): fancy; else: revert-rule);
}
```

When `--enable-fancy` is not set, the `revert-rule` in the `else` branch effectively eliminates the declaration, and reverts back to whatever value would otherwise win the cascade for `display`. In this simple case, that is `block` from `div.basic`, but in a more complicated example, the reverted-to value could vary based on a number of CSS style rules and conditionals.

## Future Extensions

It's worth noting that it's already possible to effectively get `revert-rule`-like behavior by wrapping declarations in an anonymous layer and using `revert-layer` instead:

```css
div.fancy {
  @layer {
    display: if(style(--enable-fancy): fancy; else: revert-layer);
  }
}
```

The `revert-rule` keyword may therefore be seen as an author convenience to achieve what can currently be achieved with anonymous layers and the `revert-layer` keyword.

Although this is already valuable enough from an ergonomic perspective, the higher-level CSS concepts that could be unblocked by `revert-rule`'s underlying behavior are perhaps more exciting:

 - A conditional `@if` block rule, [Issue 12909](https://github.com/w3c/csswg-drafts/issues/12909).
 - Additive styling via an equivalent functional notation (`revert-rule()`). For example, `div { --foo: revert-rule(--foo) bar; }` would append `bar` to the previous value of `--foo`.

## Security and Privacy Considerations

There are no known security or privacy concerns. The `revert-rule` is functionally equivalent to behavior that is already possible in a more verbose way (see previous section).

## Resources

- [CSS Values 5 Specification](https://drafts.csswg.org/css-cascade-5/#valdef-all-revert-rule)
- [Issue 10443](https://github.com/w3c/csswg-drafts/issues/10443) (original proposal)
