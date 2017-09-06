## Summary

Scroll Boundary Behavior introduces a new method to control over the behavior of a scroll container
element when its scrollport reaches the boundary of its scroll box. It allows the content author to
specify that a scroll container element must prevent scroll chaining and/or overscroll affordances.

To our knowledge it poses no known security or privacy risks.

## Questionnaire

Source: https://www.w3.org/TR/security-privacy-questionnaire/


|Question | Answer|
|---------|-------|
|3.1 Does this specification deal with personally-identifiable information?| NO |
|3.2 Does this specification deal with high-value data?| NO |
|3.3 Does this specification introduce new state for an origin that persists across browsing sessions?| NO |
|3.4 Does this specification expose persistent, cross-origin state to the web?| NO |
|3.5 Does this specification expose any other data to an origin that it doesn’t currently have access to?| NO |
|3.6 Does this specification enable new script execution/loading mechanisms?| NO |
|3.7 Does this specification allow an origin access to a user’s location?| NO |
|3.8 Does this specification allow an origin access to sensors on a user’s device?| NO |
|3.9 Does this specification allow an origin access to aspects of a user’s local computing environment?| NO |
|3.10 Does this specification allow an origin access to other devices?| NO |
|3.11 Does this specification allow an origin some measure of control over a user agent’s native UI?| YES|
|3.12 Does this specification expose temporary identifiers to the web?| NO |
|3.13 Does this specification distinguish between behavior in first-party and third-party contexts?| NO |
|3.14 How should this specification work in the context of a user agent’s "incognito" mode?| SAME|
|3.15 Does this specification persist data to a user’s local device?| NO |
|3.16 Does this specification have a "Security Considerations" and "Privacy Considerations" section?| NO |
|3.17 Does this specification allow downgrading default security characteristics?| NO |

## Additional Clarifications

3.11 Does this specification allow an origin some measure of control over a user agent’s native UI?

Yes. The feature may be used to prevent overscroll affordances and overscroll navigations (pull-to-refresh, swipe navigations).
However this power is not new and may be achieve by prevent defaulting the event that causes the scroll to begin with.

