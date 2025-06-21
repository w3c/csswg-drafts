# Explainer: meta tag for text scaling behavior

> [!NOTE]
> This explainer is to be merged into the [`env(preferred-text-scale)` Explainer](./env-preferred-text-scale.md) once the proposed behaviors in both have been finalized and implemented. Currently, these proposals remain separate to highlight the new additions presented herein.

## Authors

- Josh Tumath (@JoshTumath), BBC
- David Grogan (@davidsgrogan), Google
- Philip Rogers (@progers), Google

## Table of contents

<!-- TOC start (generated with https://github.com/derlin/bitdowntoc) -->

- [Introduction](#introduction)
- [User-Facing Problem](#user-facing-problem)
  - [Goals](#goals)
  - [Non-goals (for now)](#non-goals-for-now)
- [Proposal](#proposal)
  - [`legacy` option](#legacy-option)
  - [`scale` option](#scale-option)
  - [Comparison of `legacy` and `scale`](#comparison-of-legacy-and-scale)
- [Alternatives Considered](#alternatives-considered)
  - [The `pem` unit](#the-pem-unit)

<!-- TOC end -->

## Introduction

Operating systems and web browsers provide global accessibility settings for the user to increase their system text scale. For authors to conform to the [WCAG 2.2 Resize Text success criterion](https://www.w3.org/TR/WCAG22/#resize-text), they must ensure that the user can increase the text size by up to 200%. Users can increase their text size globally in their operating system settings. However, browsers do not currently scale all text in a document based on the _OS-level_ text scale setting.

The new CSS `env(preferred-text-scale)` variable provides a mechanism for authors to respect the user’s text scale setting that they’ve set either in their operating system or web browser settings. Authors can use it to scale the `font-size` and alter the layout accordingly.

> [!NOTE]
> See the [`env(preferred-text-scale)` Explainer](./env-preferred-text-scale.md) for a comparison of the various ways users can scale content and examples of how to use the environment variable.

However, if authors have already used font-relative units like `rem` and `em` to conform to the Resize Text guideline, the browser could automatically incorporate the OS-level text scale setting into those font-relative units. This would allow authors to avoid having to determine the precise elements to apply the env() variable to.

We propose a new HTML meta tag that tells the user agent to apply the scaling factor from `env(preferred-text-scale)` to the entire page. We expect it will become best practice for authors to use this meta tag, just as they would use the viewport meta tag. The environment variable would be reserved for atypical use cases.

## User-Facing Problem

The [`env(preferred-text-scale)` Explainer](./env-preferred-text-scale.md) explains:

> Research has shown that around 37% of Android users and 34% of iOS users have changed their system-level font scale factor from the default.

So over a third of mobile device users have expressed a preference for a different text scale to the default, but nothing happens on the web when they do.

Authors are taught to use font-relative units like `em` and `rem` to size content[^1]. It is a well-established best practice and authors have expressed to us that they would not like to migrate to a new best practice.

The Explainer explains [how authors would use the environment variable](https://github.com/w3c/csswg-drafts/blob/main/css-env-1/explainers/env-preferred-text-scale.md#how-authors-will-use-envpreferred-text-scale), and they would need to use it in `calc()` functions to set the root font-size and some media queries. They would need a lot of guidance to ensure it gets used correctly and there would be little variation in how they would use it.

Therefore, it would be much easier for authors if they could continue to use font-relative units as they do now and the UA initial font-size was redefined to incorporate the OS-level text scale setting. However, we can’t simply change the UA initial font size OS-level, as the Explainer notes:

> Browsers can’t simply apply the user’s system-level font scale to all web pages, because – if they did – **many** existing page layouts would break, causing content to be invisible or to lose interactivity.

So for authors to continue just using font-relative units, they would need a way to _opt-in_ to a UA initial font size that incorporates the OS-level text scale.

Authors would need to test their websites before opting in to see if they need to adapt them to protect from overflowing text or content that is too squashed to be able to read or view easily. They would need to pay special attention to scaled up text on mobile devices, where the viewport is so small that content is very likely to be squashed.

![Screenshot showing an example of squashed text in two columns.](images/background-bbc-text-scaled-squashed.png)

_Firefox simulating an iPhone SE 2 with a viewport of 375px on [bbc.co.uk](http://bbc.co.uk), where the text scale is set to 200%. Because the content is in two columns, the boxes can only fit one or two words per line. When the text is scaled up this much on a small viewport, a one column layout would improve readability._

> [!NOTE]
> You could make the argument that users on desktop browsers can already change the UA’s initial font size in their browser settings, so there’s already a risk that websites could break.
>
> That is true, but the vast majority of users don’t do that[^2] (compared to approximately 36% of users on mobile OSs), so authors are much less likely to receive complaints about broken content, and therefore are less likely to be aware of it.
>
> Also, desktop browsers tend to have large viewports, so content is unlikely to get squashed. Authors are not used to dealing with scaled up text on small mobile-device-sized viewports.

### Goals

- Give authors an easy way to respect the OS-level text scale setting
- Allow authors to continue to follow best-practices around using font-relative units
- Don't break existing websites
- Make sure font-relative units in media queries are affected by the OS-level and UA-level text scaling

### Non-goals (for now)

UA-supplied non-linear scaling (i.e. scaling larger text at a lower rate). For example, where the 16px body doubles to 32px, but a 32px heading only increases to 48px rather than doubling. This automatic non-linear scaling could be supported via a future `text-scale` value of `progressive`.

> [!NOTE]
> Authors can already do non-linear scaling at the _application_ level via CSS today, using a formula such as:
>
> $$fontSize + (fontSize \cdot (preferredTextScale − 1)) \cdot rateOfIncrease$$
>
> For example:
>
> ```css
> h1 {
>   --heading-size: 2rem;
>   --rate-of-increase: 0.5;
>
>   font-size: calc(var(--heading-size) + (var(--heading-size) * (env(preferred-text-scale) − 1)) * var(--rate-of-increase);
> }
> ```

## Proposal

We propose a new HTML `meta` element extension with the keyword `text-scale`. The content value would be an enumerated type with the following options:

- `legacy`
- `scale`

If the `text-scale` metadata is not included in the document, the `legacy` option would be the _missing default value_.

> [!NOTE]
> In the [Alternatives Considered section of the `env(preferred-text-scale)` Explainer](./env-preferred-text-scale.md#new-meta-viewport-key-for-changing-text-scale), we proposed that the options would be an addition to the `<meta name="viewport">` tag. However, we decided that that would not be the right place, because text scaling behaviour has no relation to the viewport behaviour.

### `legacy` option

```html
<meta name="text-scale" content="legacy" />
```

When the author specifies `legacy`, or when `text-scale` is omitted, all affected features behave as they do today.

That means:

- The UA’s initial font-size (i.e. the computed value of `font-size: medium`) continues to be 16px by default. Desktop browser users continue to be able to change the initial font-size.
- `env(preferred-text-scale)` only provides the scale factor on mobile browsers. On desktop browsers, the variable always has the value `1`.

`env(preferred-text-scale)` is always `1` on desktop because:

- Desktop browsers incorporate the UA-level font size setting into the initial font-size. If the environment variable, which also incorporates the UA-level font size setting, applied as well, content would be scaled twice.
- On Windows, all major browsers do a full browser zoom of the web page in response to OS-level text scaling. If the environment variable applied as well, content would be scaled twice.
- On macOS, no major browsers do anything in response to OS-level text scaling (nor do most of the built-in macOS apps).

### `scale` option

```html
<meta name="text-scale" content="scale" />
```

When the author specifies `scale`, the UA’s initial font size is affected by the OS-level text scale setting.

That means:

- The UA’s initial font-size (i.e. the computed value of `font-size: medium`) changes to 16px multiplied by `env(preferred-text-scale)`.
- `env(preferred-text-scale)` provides the scale factor on both mobile and desktop browsers. It is derived from the OS-level font scale and UA-level font size setting. Desktop browser users continue to be able to change the initial font-size.

We expect `scale` to become best practice for authors to use on all new website designs, just as they use the viewport meta tag. It allows authors to continue to use font-relative units like `rem` and `em` like they normally would and mostly avoid using `env(preferred-text-scale)`.

### Comparison of `legacy` and `scale`

This comparison table summarises our proposal. **`legacy`** describes current behavior. **`scale`** represents a simple way for sites to obey the OS-level text settings.

<table>
  <thead>
    <tr>
      <th>Affected feature</th>
      <th><code>legacy</code></th>
      <th><code>scale</code></th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <th><code>font-size: medium</code> on mobile</th>
      <td rowspan="2">16px</td>
      <td rowspan="4">16px × OS-level scale × UA-level scale</td>
    </tr>
    <tr>
      <th><code>1rem</code> or <code>1em</code> in Media Queries on mobile</th>
    </tr>
    <tr>
      <th><code>font-size: medium</code> on desktop</th>
      <td rowspan="2">16px × UA-level scale</td>
    </tr>
    <tr>
      <th><code>1rem</code> or <code>1em</code> in Media Queries on desktop</th>
    </tr>
    <tr>
      <th><code>env(preferred-text-scale)</code> on mobile</th>
      <td>OS-level scale</td>
      <td rowspan="2">OS-level scale × UA-level scale</td>
    </tr>
    <tr>
      <th><code>env(preferred-text-scale)</code> on desktop</th>
      <td>1</td>
    </tr>
    <tr>
      <th>Heuristic-based text autosizer (i.e. <code>text-size-adjust: auto</code>) on mobile</th>
      <td>Enabled</td>
      <td>Disabled</td>
    </tr>
    <tr>
      <th>Full-page zoom on Windows</th>
      <td>Enabled</td>
      <td>Disabled</td>
    </tr>
  </tbody>
</table>

## Alternatives Considered

### The `pem` unit

`pem` would be a new CSS unit as a syntactic sugar for `env(preferred-text-scale)`. It would be defined as either:

1. Relative to the element font-size
2. Relative to the UA initial font size.

We would expect authors to use `pem` units in place of the environment variable in most use cases.

After gathering feedback from authors, we don’t believe `pem` units are useful. Authors we spoke to described that they are already ‘doing the right thing’ by using existing font-relative units like `rem` and `em`, so they would not like to change their pages to use `pem` everywhere; they would like to continue to use `rem` and `em` and are surprised to learn that browsers do not already use OS-level text scales for the UA’s initial font size.

> [!NOTE]
> We originally proposed `pem` units to the CSSWG along with the `env(preferred-text-scale)` proposal, but we no longer think it has merit due to the feedback from authors.

#### Option 1: Relative to the element font-size.

Equivalent to: `calc(1em * env(preferred-text-scale))`

```css
:root {
  /* This line causes rem to include the OS-level text scale. */
  font-size: 1pem;
}

.box {
  /* Authors can continue to use rem units. This rem is now relative to the modified
   * root font-size. */
  width: 10rem;
}

.sidebar {
  display: grid;
  /* Authors commonly want text to scale, but not spacing between text, hence px here. */
  gap: 16px;

  /* Units like rem and em aren't affected by changes to the stylesheet's root
   * font-size when used in media queries; they are instead relative to the UA's
   * initial font-size. For the same reason, even though pem is based on the
   * element font-size (just like em), we can use pem in a media query. */
  @media (width > 30pem) {
    grid-template-columns: 1fr 10rem;
  }
}
```

For this option, we don’t know if there would be a reason to use it within an element in the body of the document. If the author sets the font-size to `1pem`, they can still use `rem` units to size content and would likely only need `pem` for media queries.

#### Option 2: If pem is fixed to the browser’s initial font size

Equivalent to: `calc(the-ua-initial-font-size * env(preferred-text-scale))`

```css
:root {
  /* This line causes rem to include the OS-level text scale. */
  font-size: 1pem;
}

.box {
  /* Authors can use pem units everywhere, and they will work the same way
   * on all elements. They could still continue to use rem. */
  width: 10pem;
}

.sidebar {
  display: grid;
  gap: 16px;

  /* Authors could alternatively set:
   * @media (width > calc(30rem * env(preferred-text-scale))) */
  @media (width > 30pem) {
    grid-template-columns: 1fr 10pem;
  }
}
```

For this option, we envision authors using `pem` instead of `rem` everywhere for greenfield sites.

[^1]: It is mentioned in [WCAG 2.2](https://www.w3.org/WAI/WCAG22/Understanding/resize-text.html) and on websites like [CSS Tricks](https://css-tricks.com/accessible-font-sizing-explained/) and [Josh Comeau](https://www.joshwcomeau.com/css/surprising-truth-about-pixels-and-accessibility/).
[^2]: Evan Minto from the Internet Archive found in 2018 that approximately 3% of their visitors on desktop browsers changed the default UA font size from 16px. ‘[Pixels vs. Ems: Users DO Change Font Size’.](https://medium.com/@vamptvo/pixels-vs-ems-users-do-change-font-size-5cfb20831773)
