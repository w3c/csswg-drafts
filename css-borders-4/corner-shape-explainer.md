# Shaping Corners

## The user need
Squircles, and other shaped corners, have been [sought after](https://www.figma.com/blog/desperately-seeking-squircles/) in the web
for quite a while.

[Native platforms](https://blog.minimal.app/rounded-corners-in-the-apple-ecosystem/) have had different versions of them for a long time,
and they have been a common design in the design ecosystem, everywhere except for in the web platform.

## The solution
To allow for these designs, CSS enhances the existing concept of `border-radius`, by allowing the author to specify how convex/concave
the shape of the corner should be, alongside its radii.

The `corner-shape` property accepts any value between `notch` (fully concave) and `square` (full convex), using the `superellipse()` function.
Designers can choose the shape of the corner that they fancy, and also animate between different corner shapes.

Borders and shadows are also shaped according to the given `corner-shape`.

## Why "corners"?
Alternatively to using the concept of corners, there was an option to use free-form shapes as borders.
This is expressed in a separate proposal (`border-shape`). However, by extending the concept of corners the web platform allows
this type of shaping to be a progressive enhancement on top of existing `border-radius`, as well as giving a relatively simple tool
for shaping the corners rather than overloading everything on top of a general purpose shaping power tool.

In addition, when constraining the problem to "corners", we can lift other constraints that exist on general-purpose shapes: for example,
border styles are renderable because the edge-cases are more manageable.


## Self review S&P questionnaire

01.  What information does this feature expose,
     and for what purposes?

It does not expose information.
     
3.  Do features in your specification expose the minimum amount of information
     necessary to implement the intended functionality?

Yes

5.  Do the features in your specification expose personal information,
     personally-identifiable information (PII), or information derived from
     either?

No

6.  How do the features in your specification deal with sensitive information?

No sensitive information

8.  Does data exposed by your specification carry related but distinct
     information that may not be obvious to users?

No

10.  Do the features in your specification introduce state
     that persists across browsing sessions?

No

12.  Do the features in your specification expose information about the
     underlying platform to origins?

No

14.  Does this specification allow an origin to send data to the underlying
     platform?

No

16.  Do features in this specification enable access to device sensors?

No

18.  Do features in this specification enable new script execution/loading
     mechanisms?

No

20.  Do features in this specification allow an origin to access other devices?

No

21.  Do features in this specification allow an origin some measure of control over
     a user agent's native UI?

No
     
23.  What temporary identifiers do the features in this specification create or
     expose to the web?

None
     
25.  How does this specification distinguish between behavior in first-party and
     third-party contexts?

No
     
27.  How do the features in this specification work in the context of a browser’s
     Private Browsing or Incognito mode?

N/A
     
29.  Does this specification have both "Security Considerations" and "Privacy
     Considerations" sections?

No
     
31.  Do features in your specification enable origins to downgrade default
     security protections?

No
     
33.  What happens when a document that uses your feature is kept alive in BFCache
     (instead of getting destroyed) after navigation, and potentially gets reused
     on future navigations back to the document?

Nothing in particular
     
35.  What happens when a document that uses your feature gets disconnected?

N/A

37.  Does your spec define when and how new kinds of errors should be raised?

No

39.  Does your feature allow sites to learn about the user's use of assistive technology?

No

40.  What should this questionnaire have asked?

Nothing in addition
