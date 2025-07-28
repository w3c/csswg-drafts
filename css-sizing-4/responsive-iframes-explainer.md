# Responsively-sized iframes

## Problem description

[Iframes](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/iframe) are very useful for sandboxing web content into different documents. The options currently available are:
 1. A [same-origin](https://developer.mozilla.org/en-US/docs/Web/Security/Same-origin_policy) iframe, which provides full style & 
layout isolation, and by-default script isolation. This prevents the parent and child documents from accidentally interfering with each other.
 2. A cross-origin iframe, which additionally provides robust security and privacy against untrusted embedders or embedees.

In addition, iframes participate in the layout of the parent document, via the style and layout of their owning `<iframe>` element.
However, unlike other HTML elements such as `<div>`, iframe elements do not have the ability to support *responsive layout*, i.e. size themselves automatically to contain the [natural dimensions](https://drafts.csswg.org/css-images-3/#natural-dimensions) of the contents of the iframe. Instead, browsers automatically add scrollbars to iframes as necessary, so that users can access the content.

This is a problem:
 * From a user's perspective, iframe scrollbars are a worse UX in cases where the iframe contents are important to them and can fit reasonably in the visible viewport without these additional scrollbars.
 * From a developer's perspective, they are forced to use non-trivial script to communicate natural dimensions across frames in order to help the user have better UX without scrollbars. 

Embedded SVG documents (in `<object>`/`<embed>`) already support responsive layout. *Responsive iframes* adds responsive layout to iframes, as long as the embedding and embedded document both opt in to doing so, thus providing support for responsive layout without losing any of the advantages of iframes in (1) and (2) above.

## Use cases

Use cases include:
 * 3P comment widgets ([example](https://github.com/whatwg/html/issues/555#issuecomment-177836009))
 * Embedding self-contained worked examples in teaching UI ([example](https://browser.engineering/layout.html#block-layout))

In general, there is a lot of demand for this feature, as evidenced by:
 * [Stack overflow](https://stackoverflow.com/search?q=resize+iframe)
 * Many comments and positive reactions on the [issue proposing the feature for HTML](https://github.com/whatwg/html/issues/555), and [the same for CSS](https://github.com/w3c/csswg-drafts/issues/1771)
 * Existence of multiple polyfills

## Solution

The embedding document opts in via the `contain-intrinsic-size: from-element` CSS property on the `<iframe>` element, and the embedded document opts in via a new `<meta name="responsive-embedded-sizing">` tag.

When the meta tag is present at the time the `load` event on the embedded document fires, the embedding document is notified with the new [natural height](https://drafts.csswg.org/css-images-3/#natural-height) of the embedded (iframe) document. If `contain-intrinsic-size` is set on the `<iframe>` element, it takes this heigh into consideration in the same way as any other replaced element's layout, along with other constraints specified by the HTML and CSS of the embedding document. Subsequent changes to content, styling or layout fo the embedded document do not affect the `<iframe>` sizing.

The double opt-in preserves:
 * Backward compatibility for existing content
 * Privacy and security guarantees of cross-origin content

The "one-shot" (only at `load` time) sizing to natural dimensions avoids:
 * Performance issues and CLS due to changing iframe sizing (To further mitigatge performance risks, limitations on levels of `<iframe>` nesting may be imposed.)
 * Potential infinite layout loops

## Example:

The following example wil display an iframe of content width `300px` (the default) and height `1000px` (the height of the `<div>`),
plus a `1px` border. Without this feature, the iframe would have been `150px` (the defaut) tall with a vertical scrollbar.

Embedding document:

```html
<!doctype HTML>
<style>
  iframe {
    contain-intrinsic-size: from-element;
    border: 1px solid black;
  }
</style>
<iframe src="my-iframe.html">
```

`my-iframe.html`:
```html
<!doctype HTML>
<style>
  * { margin: 0; }
</style>
<meta name="responsive-embedded-sizing"></meta>
<div style="height: 1000px"></div>
```

## Related work

A previous explainer for this feature is [here](https://github.com/domenic/cooperatively-sized-iframes).

## Future extensions

A JavaScript API could be added in the future that would allow embedded documents to request relayout in their embedding document context. This would allow dynamically generated iframe documents to update at times other than `load`.

## Privacy and security

Information about the contents of a cross-origin iframe can be exfiltrated by embedding it in a malicious document that observes the laid-out size of the iframe. This can be mitigated through use of the the `X-Frame-Options` HTTP header to allow embedding into only trusted embedding documents, plus the `responsive-embedded-sizing` `<meta>` tag to further opt into responsive layout. Additional restrictions could be put in place through contents of the `<meta>` tag that would restrict to only explicitly allowed origins.

[Fenced frames](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/fencedframe) are excluded from this feature.
