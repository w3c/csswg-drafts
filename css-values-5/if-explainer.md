# Explainer: CSS `if()` function

This document is an explainer for the `if()` function proposed for CSS Values and Units Module Level 5.

## Introduction

The `if()` function introduces powerful,
inline conditional logic to CSS properties.
It allows authors to select a value for a property based on a set of ordered conditions,
similar to `if/else` constructs in many programming languages.
This provides a more dynamic and streamlined way to write CSS
without relying on verbose selectors or JavaScript.

## Motivation

Currently, CSS authors often need to repeat selectors
to apply different styles under different conditions.
For example, to change a property based on a custom property for theming,
one would write:

```css
.my-element {
  color: blue; /* default */
}

.theme-dark .my-element {
  color: red; /* theme override */
}
```

While functional, this pattern can lead to verbose and fragmented code,
especially when multiple conditions are involved.
The `if()` function aims to simplify this
by allowing conditional logic to be expressed inline within a single declaration,
using `style()` query to check custom properties values:

```css
/* Assuming a parent has --theme: dark set */
.my-element {
  color: if(style(--theme: dark): red; else: blue);
}
```

This approach improves readability and co-locates related logic,
making stylesheets easier to maintain.
This is especially powerful when combined with CSS Custom Properties,
allowing for the creation of dynamic,
themeable components with logic encapsulated directly in the CSS.

## Syntax

The `if()` function's syntax is formally defined as:

```
<<if()>> = if( [ <<if-branch>> ; ]* <<if-branch>> ;? )
<if-branch> = <if-condition> : <declaration-value>?
<if-condition> = <boolean-expr[ <if-test> ]> | else
<if-test> =
  supports( [ <ident> : <declaration-value> ] | <supports-condition> ) |
  media( <media-feature> | <media-condition> ) |
  style( <style-query> )
```

In essence,
the function is a list of conditional branches separated by semicolons.
Each branch contains a condition followed by a colon (`:`) and a value.
The conditions are evaluated in order,
and the value from the first branch with a true condition is used.

The `else` keyword can be used as a condition that is always true.
This makes it useful for providing a final fallback value,
as any branches after an `else` branch will be ignored.

## Use Cases

### 1. Simple Media Query

A common use case is to switch a value based on a media query.

```css
.component {
  background-color: if(media(width >= 600px): blue; else: green);
}
```

### 2. Feature Support

Conditionally apply a value based on whether the browser supports a particular CSS feature,
allowing for progressive enhancement.
For example, using a modern,
more vibrant color from a wider-gamut color space like Display P3,
inside of a gradient,
and falling back to a standard sRGB color if P3 is not supported.
Without `if()`,
the author would have to repeat the entire `linear-gradient()` expression.

```css
.highlight {
  background-image: linear-gradient(
    to right,
    hsl(50 100% 50%),
    if(
      supports(color: color(display-p3 0 0 0)): color(display-p3 1 0.5 0);
      else: hsl(30 100% 50%)
    )
  );
}
```

### 3. Theming with Custom Properties

The `if()` function is particularly powerful for creating themes.
Here, we use `style()` to check the value of a `--theme` custom property inherited from an ancestor
and adjust colors accordingly.

```css
/* On a parent element, you might have: --theme: dark; */

.themed-component {
  --bg-color: if(
    style(--theme: dark): #333;
    style(--theme: sepia): #f4e8d5;
    else: #eee
  );
  --text-color: if(
    style(--theme: dark): #eee;
    style(--theme: sepia): #5b4636;
    else: #333
  );

  background-color: var(--bg-color);
  color: var(--text-color);
}
```

### 4. Combining Conditions with `and`

Conditions can be combined with boolean keywords like `and`, `or`, and `not`.
This allows for more complex logic,
such as applying a style only when multiple conditions are met.

```css
.widget {
  --base-size: 2rem;
  --enhanced-size: 3rem;

  /* Use the enhanced size only on wide screens that also support flexbox */
  font-size: if(
    media(width >= 1024px) and supports(display: flex): var(--enhanced-size);
    else: var(--base-size)
  );
}
```

## Fallback Behavior

If no condition in an `if()` function evaluates to true
and no `else` branch is provided,
the function resolves to a `<guaranteed-invalid>` value.
This makes the declaration invalid at computed-value time,
causing the property to fall back to its inherited or initial value (behaving like `unset`).

```css
.box {
  /* If the viewport width is less than 500px, this property becomes invalid */
  padding: if(media(width >= 500px): 20px);
}
```

To ensure predictable behavior, it is recommended to always provide an `else` branch.

## Stakeholder Feedback

This proposal has been discussed in the CSS Working Group,
and feedback from browser vendors and web developers has been positive.
Currently, `media()`, `supports()`, and `style()` queries are supported,
but there are possibilities for expansion in the future.

## Security and Privacy Considerations

The `if()` function itself does not introduce new security or privacy concerns.
It provides a new syntax for expressing conditional logic
but relies on existing mechanisms (`media()`, `supports()`, `style()`)
that have their own, already-defined security profiles.
It does not introduce any new capabilities
that could be used to fingerprint users or exfiltrate data.
