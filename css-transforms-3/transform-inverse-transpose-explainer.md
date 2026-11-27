# Explainer: Transform Inverse and Transpose

## Authors

- Adam Kecskes ([@K-Adam](https://github.com/K-Adam))

## Participate

Issue to be filed in [w3c/csswg-drafts](https://github.com/w3c/csswg-drafts/issues), tagged `[css-transforms-3]`.

## Introduction

CSS can't invert a transform. A pin on a zooming map should keep its size, but a hand-written counter-animation doesn't cancel: halfway through `scale(1)` to `scale(4)`, a child going to `scale(.25)` is still left with a net scale of 1.56. Multiplication by whitespace is the only matrix operation CSS has.

This proposal adds two more, each of which is itself a `<transform-function>`:

```
<transform-inverse()>   = transform-inverse( <transform-list> )
<transform-transpose()> = transform-transpose( <transform-list> )
```

```css
.map {
  --view: scale(1);
  transform: var(--view);
  transform-origin: 0 0;
  transition: transform .3s;
}
.map.zoomed { --view: scale(4); }
.pin {
  transform: transform-inverse(var(--view));
  transform-origin: 0 0;
  transition: transform .3s;
}
```

## Status of this document

This is an unofficial proposal with no CSSWG resolution. It targets a future CSS Transforms Level 3, which has no draft yet, because Level 2's features have shipped and its open issues are mostly about stabilizing them.

## Goals

- Let one transform exactly cancel another whose structure it doesn't know, when both are evaluated together.
- Allow transposing transforms that CSS can't take apart.

## Non-goals

- Adding a matrix type to `calc()`.
- Extracting individual matrix components into CSS values.

## The problem

Writing an inverse by hand as a second list of functions fails in two ways.

**The value may be opaque.** A transform held in a custom property can't be taken apart, because CSS has no way to extract its components.

**Interpolation doesn't cancel for `scale()` and matrices.** Interpolating two inverses isn't the inverse of the interpolation. `rotate()` and `translate()` do cancel, because negating their arguments is linear. Here a parent goes from `scale(1)` to `scale(4)`, and a child from `scale(1)` to `scale(.25)`:

| Progress | Parent | Child, today | Product, today | Product with `transform-inverse()` |
|---|---|---|---|---|
| 25% | 1.75 | 0.8125 | 1.42 | 1 |
| 50% | 2.5 | 0.625 | 1.56 | 1 |
| 75% | 3.25 | 0.4375 | 1.42 | 1 |

Script can work around this. [Chrome's expand/collapse article](https://developer.chrome.com/blog/performant-expand-and-collapse) precomputes a keyframe per step, and [react-flip-toolkit](https://npmjs.com/package/react-flip-toolkit) has an inverse mode on its `Flipped` wrapper.

When the structure is known, a registered number property does cancel exactly:

```css
@property --s { syntax: "<number>"; inherits: true; initial-value: 1; }
.map { transform: scale(var(--s)); transition: --s .3s; }
.map.zoomed { --s: 4; }
.pin { transform: scale(calc(1 / var(--s))); }
```

This proposal targets what that can't do:

1. Lists of unknown or changing structure, and matrices held as a single opaque value.
2. Cancellation off the main thread. Animating a custom property keeps the work on the main thread, while a direct `transform` transition [could be composited](#compositor-support).

## Key scenarios

### Inverse: labels that stay upright and unscaled on a transformed surface

Map pins, chart labels and hotspots should follow a point on a surface without taking on its rotation or scale. Each child inverts one shared variable, whatever that variable holds:

```css
.surface {
  --view: rotate(20deg) scale(3);
  transform: var(--view);
  transform-origin: 0 0;
  transition: transform .3s;
}
.surface.overview { --view: scale(2) rotate(-10deg); }
.pin {
  position: absolute;
  left: 40px;
  top: 20px;
  transform: transform-inverse(var(--view));
  transform-origin: 0 0;
  transition: transform .3s;
}
```

Checked in Chromium, Firefox and WebKit using equivalent `matrix()` values, a 30px by 10px pin under `rotate(20deg) scale(3)` keeps its exact size and orientation, and its corner lands where the surface carries that point.

These two presets have different structure, so hand-reversed lists don't cancel between them: at 50% they leave a net scale of 1.04.

Panning belongs in the `translate` property or on a wrapper. A translation inside `--view` would be inverted too, so the pin wouldn't follow the surface.

### Inverse: a camera for a CSS 3D scene

A scene is rendered from a camera by applying the inverse of the camera's transform to the world. A camera exported from a 3D tool is a single matrix, which a hand-reversed list can't express:

```css
@property --camera { syntax: "<transform-list>"; inherits: true; initial-value: translate3d(0, 0, 0); }

.viewport { perspective: 800px; }
.world {
  transform-style: preserve-3d;
  transform: transform-inverse(var(--camera));
  transition: --camera 1s;
}
.world.overview { --camera: translate3d(0, -200px, 600px) rotateX(20deg); }
.world.exported { --camera: matrix3d(/* 16 values from a 3D tool */); }
```

### Transpose: lines that stay perpendicular to a transformed surface

Ticks and leader lines often need to stand perpendicular to an edge of a sheared or squashed surface. A child inherits the surface's distortion, so it stops being perpendicular. The direction it needs is the surface's normal, which transforms by the inverse transpose.

```css
.surface {
  transform: var(--surface);
  transform-origin: 0 0;
}
.tick {
  position: absolute;
  left: 40%;
  top: 0;
  width: 2px;
  height: 30px;
  transform-origin: 0 0;
  /* Undo the surface, then apply its normal matrix. */
  transform: transform-inverse(var(--surface))
             transform-transpose(transform-inverse(var(--surface)));
}
```

For any invertible 2D `--surface` without a translation, the tick stays anchored at 40% of the transformed edge and its length axis is perpendicular to that edge. Checked in Chromium, Firefox and WebKit using equivalent `matrix()` values:

| `--surface` | Angle to the edge, plain child | Angle to the edge, this technique | Tick length |
|---|---|---|---|
| `rotate(-30deg) skewX(30deg) scale(1.2, .6)` | 60° | 90° | 50px |
| `skewY(20deg) scale(2, .5)` | 70° | 90° | 64px |

- **When it matters:** with shear, or a scale followed by a rotation. Under `rotate() scale()`, a plain child is already perpendicular.
- **Thin lines only:** just the length axis is normal. The box is sheared and its length and width vary, and CSS can't correct that without extracting components. This doesn't suit content such as callout text.
- **No translation:** the transpose moves a translation into the bottom row, making the result projective. Use the `translate` property, or a wrapper.
- **3D:** this needs `transform-style: preserve-3d`, and the line is perpendicular in space rather than on screen.

### Transpose: imported matrices

`matrix3d()` expects column-major order. Transposing converts a matrix written for column vectors and listed row by row, as in math notation or a flattened NumPy array. Such a matrix has its translation in elements 4, 8 and 12. Row-vector data listed row by row, as in DirectX, is already in the right order. Use this for static values, because interpolation would happen in the source convention.

```css
.imported { transform: transform-transpose(matrix3d(var(--row-listed-matrix))); }
```

`matrix3d()` can write out a transposed result only for known values. `transform-transpose(var(--transformation))` has no equivalent today.

## Detailed design

### Definitions

The argument becomes a 4x4 matrix by post-multiplying its functions.

- `transform-inverse(A)` is A⁻¹.
- `transform-transpose(A)` is Aᵀ, using the column-vector layout in css-transforms-2's Mathematical Description, with lengths in CSS pixels before any zoom. The result depends on that unit, and a percentage translation's effect depends on the box size. The transpose of a rotation is its inverse, and the transpose of a translation is projective.

Like `transform-mix()`, the functions don't accept `none`. `--t: none` makes `transform: transform-inverse(var(--t))` invalid at computed-value time, which gives `none`, the correct identity. In a longer list the whole declaration is lost, so use an identity value such as `scale(1)`.

### Computed and resolved values

The computed value is the function with its argument computed recursively, and it serializes as a computed `<transform-list>`. It isn't simplified to a matrix or to equivalent functions, and it isn't omitted when the result is the identity.

So `transform-inverse(scale(4))` and `scale(.25)` are unequal computed values, and switching between them starts a transition. Unlike `transform-mix()`, which collapses when it can, these functions must stay intact, because collapsing would bring back the error in the table above.

The resolved value uses the existing steps, which post-multiply the functions and serialize a `matrix()` or `matrix3d()`.

### Interpolation

Two `transform-inverse()` or two `transform-transpose()` functions interpolate their arguments as transform lists, and the result is the same function with the interpolated list as its argument. Accumulation pairs functions the same way, and accumulates the arguments before applying the operation.

If interpolating the arguments falls back to discrete animation, the whole transform list does, as it does today for a singular `matrix()`.

A different function paired with one of these is a mismatch, and uses the existing rule that multiplies the remainder of each list and interpolates the matrices. `transform-mix()` and `transform-interpolate()` interpolate as css-values-5 defines, including as arguments. Cancellation doesn't depend on that rule, because parent and child both follow it.

For padding the shorter list, the identity function is the same function with each function in its argument replaced by that function's identity, such as `transform-inverse(scale(1))` for `transform-inverse(scale(2))`. A function with no identity form, such as `transform-mix()`, is replaced by an identity `matrix()`.

Consequences:

- **Exact cancellation:** P(t) · P(t)⁻¹ is the identity, up to float precision, whenever the parent's matrix P(t) at progress t is invertible, including under matrix fallback. This requires identical computed endpoints after substitution, the same timing and replace compositing, plus the same reference box if percentages are present.
- **Interruption:** the result keeps the function rather than becoming a matrix, so a transition reversed mid-flight still pairs and still cancels.
- **No flattening:** an engine that turns each keyframe into a matrix and blends those, including on a compositor, reproduces the error in the table above and doesn't conform.

### Non-invertible arguments

If `transform-inverse()`'s argument is non-invertible, or inversion gives a non-finite result, the result is `matrix(0, 0, 0, 0, 0, 0)`. A non-invertible current transformation matrix isn't displayed, so the element is hidden, as it is in all three engines tested. The result stays singular when multiplied on either side or inverted again.

A list is non-invertible if any function in it is, and each function is decided as follows:

| Function | Non-invertible when |
|---|---|
| `scale()` and its derivatives | a parameter is exactly 0 |
| `translate()`, `rotate()`, `perspective()`, `skewX()`, `skewY()` and their derivatives | never |
| `transform-inverse()`, `transform-transpose()` | its argument is |
| `matrix()`, `matrix3d()`, `skew(a, b)`, and anything else | its determinant is zero at the precision the UA computes with |

- **Why test each function, not the product:** `rotate(30deg) matrix(1,1,1,1,0,0) rotate(17deg)` has a singular factor, but engines that multiply first get a non-zero determinant and [very different inverses](#appendix-browser-test-results).
- **No tolerance:** geometry-1 doesn't define one, and CSS doesn't define numeric precision. Values singular only on paper, such as `skew(45deg, 45deg)`, depend on rounding, so tests should avoid them.
- **Why not NaN:** CSS values can't hold NaN, and [a top-level `calc(NaN)` becomes 0](https://drafts.csswg.org/css-values-4/#calc-ieee). So `new DOMMatrix("scale(0)").inverse()` gives NaN while this function gives a zero matrix.
- **Why not invalid at computed-value time:** singular values can arise on animation frames, where a value can't become invalid.

### 3D classification

`transform-inverse()` is a 3D transform function if its argument contains one.

`transform-transpose()` is a 3D transform function unless its argument contains only 2D rotation, scale and skew functions, `matrix()` with zero translation, and `transform-inverse()` or `transform-transpose()` of such lists. The transposes of those functions stay 2D, and a transposed translation doesn't.

An interpolated value is a 3D transform function if either endpoint is, so classification doesn't change mid-animation.

This classification determines 3D transformed elements, the rejection of 3D functions on `clipPath` and similar, `is2D` in geometry-1, and the CSS `transform` property on SVG elements.

### Limits of cancellation

- **Translation:** a translation in the list is cancelled too, so the child doesn't follow it. Use the `translate` property or a wrapper for movement the child should follow.
- **Origin:** `transform-origin` wraps the whole value as T(o) · M · T(−o), and only M is inverted. If the parent's pivot P and the child's pivot C differ, the child stays undistorted but moves by (L − I)(C − P), where L is the linear part of M. This is what anchored labels want, because the child's pivot lands where the parent carries it. A child that should stay still needs a shared pivot.
- **Other properties:** the transformation matrix also includes the `translate`, `rotate`, `scale` and `offset` properties, so `.map { scale: 4 }` isn't cancelled. A `perspective` property on the parent isn't cancelled either.
- **Percentages and `em`:** these resolve per element, unless an `em` is carried by an inherited registered property. `translate(50%)` on a 200px parent and its inverse on a 100px child leave 50px.
- **Custom properties with percentages and mismatched lists:** a registered property going from `translateX(100%)` to `rotate(45deg)` has no interoperable mid-flight value today ([#2854](https://github.com/w3c/csswg-drafts/issues/2854), and see the [test results](#appendix-browser-test-results)). A direct `transform` transition doesn't have this problem.
- **Custom properties that may hold `none`:** a registration with a `none` alternative animates discretely when an endpoint is `none`, so animated values should register `<transform-list>` with an identity initial value.
- **`composite: add`:** adding on the inverse side doesn't cancel non-commuting transforms. A · B · A⁻¹ · B⁻¹ with `translate(100px)` and `rotate(90deg)` leaves (100, -100). Add on the custom property instead.
- **3D:** a flat parent flattens its children, so cancelling a 3D rotation needs `transform-style: preserve-3d`. Grouping properties such as `opacity`, `filter` and clipping force `flat`.
- **Scrollable overflow:** a transformed child still contributes to its scroll container's overflow in that container's own coordinates. In an `overflow: auto` parent at `scale(.1)`, a 100px child at `scale(10)` gives `scrollWidth` 550 and `clientWidth` 100.
- **Very large values:** `transform-inverse(scale(1))` to `transform-inverse(scale(-1))` reaches scale 500 at t = .499. A matching parent cancels this, but a standalone element grows very large.
- **`inherit()`:** `transform-inverse(inherit(--t))` works, but `inherit(transform)` doesn't, as standard properties in `inherit()` are deferred from Values 5.

### Other specifications

- **geometry-1:** "parse a string into an abstract matrix" should reject relative lengths and percentages in nested arguments. Percentages aren't named there today, even for top-level functions.
- **css-typed-om:** values using these functions reify as a plain `CSSStyleValue` under [§5.2 "Unrepresentable Values"](https://drafts.css-houdini.org/css-typed-om-1/), but §5.8 reifies every `<transform-list>` as a `CSSTransformValue`, so §5.8 needs an explicit branch. `computedStyleMap().get('transform')` then stops being a `CSSTransformValue` for these values.
- **SVG:** the `transform` attribute keeps its own closed grammar of six functions.

## Implementation considerations

### Cost

Inversion can be resolved without layout for nearly every input, because the inverse of a list is the reversed list of inverted functions. `translate()` negates, including percentages. `rotate()`, `rotate3d()`, `skewX()` and `skewY()` negate the angle, `scale(a)` becomes `scale(1/a)`, and `perspective(d)` becomes a matrix with m34 = +1/max(d, 1px). Among the primitive functions, only `matrix()`, `matrix3d()` and `skew(a, b)` need a numeric inverse. `transform-transpose()` with a percentage in its argument needs a deferred operation.

These are type-specific functions, the direction the WG chose when it dropped `mix()` from Values 4 ([#9343](https://github.com/w3c/csswg-drafts/issues/9343)). `transform` already has deferred representations: Blink's [`InterpolatedTransformOperation`](https://chromium.googlesource.com/chromium/src/+/refs/heads/main/third_party/blink/renderer/platform/transforms/interpolated_transform_operation.h) and Gecko's [`InterpolateMatrix`/`AccumulateMatrix`](https://raw.githubusercontent.com/mozilla-firefox/firefox/main/servo/components/style/values/generics/transform.rs). Blink evaluates non-box-dependent matrix blends eagerly to avoid structures of unbounded depth. An argument can be evaluated the same way, because inverting a blended matrix still gives the inverse of the interpolated value.

### Compositor support

The performance advantage over registered number properties depends on compositing, and it's unproven. A native `transform` transition on these functions looks feasible in all three engines, with the most work in Blink. This is based on reading engine source, and no engine has prototyped or committed to it.

An engine that composites a plain `transform` animation but not these functions would run a cancelling pair on two threads, and the two would drift. That is worse than a main-thread custom property, which can't drift. If engines won't composite these functions or keep a pair together, the case rests on unknown-structure lists alone.

Questions for implementers:

- Can a cancelling pair be kept on one thread, for example by demoting the ancestor's animation?
- Can a net matrix that is the identity only up to float precision defeat text snapping or LCD antialiasing, so a resting label renders differently?

<details>
<summary>Per-engine notes</summary>

| Engine | Current path | Likely work |
|---|---|---|
| Gecko | The compositor [receives `StyleTransform`](https://raw.githubusercontent.com/mozilla-firefox/firefox/main/gfx/layers/ipc/LayersMessages.ipdlh) and [calls the same Servo interpolation](https://raw.githubusercontent.com/mozilla-firefox/firefox/main/gfx/layers/AnimationHelper.cpp) as the main thread. | A new operation variant, plus a case where [percentages are resolved](https://raw.githubusercontent.com/mozilla-firefox/firefox/main/gfx/layers/AnimationInfo.cpp) before sending. It must not flatten to `Matrix3D`, as `InterpolateMatrix` does there. |
| WebKit | Threaded animations are on by default on Cocoa and [blend `TransformOperations`](https://raw.githubusercontent.com/WebKit/WebKit/main/Source/WebCore/platform/animation/AcceleratedEffect.cpp). Core Animation's path [only has shared primitives or Matrix3D](https://raw.githubusercontent.com/WebKit/WebKit/main/Source/WebCore/platform/graphics/ca/GraphicsLayerCA.cpp). | A new operation for the threaded path. The Core Animation path can fall back to software, as it does for large 3D rotations. |
| Blink | The compositor uses [`gfx::TransformOperation`](https://chromium.googlesource.com/chromium/src/+/refs/heads/main/ui/gfx/geometry/transform_operation.h), a flat list of types with no nesting. | A new nested operation and blend path in `gfx` and `cc`. Keyframes already [receive the box size](https://chromium.googlesource.com/chromium/src/+/refs/heads/main/third_party/blink/renderer/core/animation/compositor_animations.cc), so percentages are not an obstacle. |

Raster scale isn't a blocker for a cancelling pair: Blink's `cc` [already handles](https://chromium.googlesource.com/chromium/src/+/refs/heads/main/cc/trees/property_tree.cc) a node scaling 10 to 1 under an ancestor scaling 1 to 10, by using the ancestor's maximum scale.

</details>

## Privacy, security and accessibility considerations

The functions compute only from values the author already supplied, and box-dependent results expose nothing beyond the existing resolved value of `transform`. They change only visual rendering, as existing transforms do. No new considerations are expected.

## Stakeholder feedback

No signals yet from implementers or web developers.

## Alternatives considered

- **Infix math, such as `calc(A * inverse(B))`:** `calc()` is built around numeric types, and this would add a matrix type for no extra capability.
- **Bare `inverse()` and `transpose()`:** these are generic names in a shared function namespace, and `invert()` is already a filter function. The `transform-` prefix follows `transform-mix()` and `transform-interpolate()`, and `inverse` matches `DOMMatrix.inverse()`.
- **A linear-only transpose, using the upper 3x3:** this would keep translations in place and let normal matrices work with a translated surface, but it wouldn't be the transpose of the 4x4 matrix that CSS transforms are defined by.
- **Script (`DOMMatrix.inverse()`):** this must recompute whenever the value or box changes, needs baked keyframes or per-frame work, and sees percentages only through the resolved value.
- **A parent-referencing `counter-transform` property:** a UA that knows the relationship could avoid drift and use the parent's pivot. But it would add a new relationship to the property model and raise questions about hit testing, and it wouldn't reach siblings, out-of-flow elements or a chosen ancestor, which a shared variable can.
- **View Transitions:** these animate captured images in pseudo-elements, so they don't give a live element a counter-transform.
- **Converting width and height animations to scale ([#13064](https://github.com/w3c/csswg-drafts/issues/13064)):** this addresses layout-driven animation, not cancelling an author's transform.

## Proposed spec text

Draft for a future `css-transforms-3/Overview.bs`, as a delta over Level 2, using the same `link-defaults` as Level 2. Add a new section:

```
Transform Matrix Operations {#transform-matrix-operations}
---------------------------

A <dfn export>transform matrix operation</dfn> is a <<transform-function>> that operates on the matrix of its argument.
That matrix is the result of post-multiplying the argument's <<transform-function>>s from left to right.

: <span class='prod'><dfn>transform-inverse()</dfn> = transform-inverse( <<transform-list>> )</span>
:: Specifies the inverse of its argument's matrix.
	If its argument is non-invertible,
	or the inverse has a non-finite element,
	the result is the same as ''matrix(0, 0, 0, 0, 0, 0)''.

: <span class='prod'><dfn>transform-transpose()</dfn> = transform-transpose( <<transform-list>> )</span>
:: Specifies the transpose of its argument's matrix, as laid out in [[css-transforms-2#mathematical-description]],
	with lengths expressed in CSS pixels before any zoom is applied.

A transform list is non-invertible if any <<transform-function>> in it is:

* ''scale()'' and its derivatives are non-invertible if a parameter is exactly zero.
* ''translate()'', ''rotate()'', ''perspective()'', ''skewX()'', ''skewY()'' and their derivatives are never non-invertible.
* A [=transform matrix operation=] is non-invertible if its argument is.
* Any other <<transform-function>> is non-invertible if the determinant of its matrix is zero
	at the precision the UA computes with.

The computed value of a [=transform matrix operation=] is the function
with its argument computed according to its type.
It is not simplified or omitted, even if it is equivalent to another <<transform-function>> or to the identity.
Its argument serializes as a computed <<transform-list>>.

Note: Keeping the function in the computed value lets ''transform-inverse()'' cancel an animating transform exactly,
because the inverse is applied after interpolation.

''transform-inverse()'' is one of the [=3d transform functions=]
if its argument contains one.
''transform-transpose()'' is one of the [=3d transform functions=]
unless its argument contains only two-dimensional rotation, scale and skew functions,
''matrix()'' functions with zero translation,
and [=transform matrix operations=] whose arguments meet this same condition.
An interpolated value is one of the [=3d transform functions=] if either endpoint is.

Note: ''transform-inverse()'' inverts only the 'transform' value, not 'transform-origin',
and percentages resolve against each element's own [=reference box=].
Exact cancellation between two elements therefore needs a shared pivot point and the same resolved values.
```

Add to "Interpolation of primitives and derived transform functions":

```
Two ''transform-inverse()'' or two ''transform-transpose()'' functions are interpolated
by interpolating their arguments as transform lists.
The result is the same function with the interpolated list as its argument.

If interpolating the arguments falls back to discrete animation,
the entire transform list falls back to discrete animation.

Two ''transform-inverse()'' or two ''transform-transpose()'' functions are accumulated
by accumulating their arguments as transform lists.

The [=identity transform function=] for a [=transform matrix operation=]
is the same function with each <<transform-function>> in its argument
replaced by that function's [=identity transform function=],
or by an identity ''matrix()'' if it has none.
```

## Appendix: Browser test results

These are existing behaviors the design relies on, tested on HTML elements in Playwright's headless builds. The WebKit build is the Windows one, and its painting may differ from Safari.

| Test | Chromium 156 | Firefox 157 | WebKit 26.6 |
|---|---|---|---|
| `"<transform-list>"` transition, `scale(1)` to `scale(4)`, at 50% | `scale(2.5)` | `scale(2.5)` | `scale(2.5)` |
| `"none \| <transform-list>"` transition from `none` to `scale(4)` | doesn't start | doesn't start | doesn't start |
| Hand-reversed lists, `rotate(20deg) scale(3)` to `scale(2) rotate(-10deg)`, net scale at 50% | 1.04 | 1.04 | 1.04 |
| Registered `translateX(100%)` to `rotate(45deg)`, at 50%, `--x` | `rotate(45deg)` | `interpolatematrix(...)` | a resolved `matrix()` |
| The same, resolved `transform: var(--x)` | the rotation | `none` | the same `matrix()` |
| `transition: transform` on `matrix(1,0,0,1,0,0)` to `matrix(0,0,0,0,0,0)` | doesn't start | doesn't start | doesn't start |
| The same, with a matching `rotate()` before the `matrix()` | doesn't start | doesn't start | doesn't start |
| `matrix(0, 0, 0, 0, 0, 0)` | hidden | hidden | hidden |
| `scaleZ(0)`, `scale3d(1, 1, 0)` | hidden | hidden | painted, hit-testable |
| `matrix3d()` with m44 = 0 | hidden | hidden | painted, not hit-testable |
| `transform-mix()`, `transform-interpolate()` | unsupported | unsupported | unsupported |
| `matrix(calc(NaN), 0, 0, 1, 0, 0)` | `matrix(0, 0, 0, 1, 0, 0)` | same | same |
| `new DOMMatrix("scale(1e-30)").inverse().a` | NaN | about 1e30 | 1e30 |
| Inverse of `rotate(30deg) matrix(1,1,1,1,0,0) rotate(17deg)`, `.a` | about 1.6e16 | about 2.6e8 | about 1.6e16 |

[#11046](https://github.com/w3c/csswg-drafts/issues/11046) reports `scaleZ(0)` as hidden in Safari, so that WebKit result looks specific to this build. There is no Safari report for `scale3d(1, 1, 0)` or m44 = 0.
