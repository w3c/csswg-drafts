# Summary of Nesting proposals

*Original posted in [#7834](https://github.com/w3c/csswg-drafts/issues/7834#issuecomment-1275197850)*

To organize the discussion a bit, the options we're looking at are:

1. Current spec - every nested rule needs to be unambiguous on its own, either by starting with an `&` or by being an `@nest` rule. If not using `@nest`, every selector in a list needs to start with `&`, not just the first.
2. Parser switch proposal - after some parsing switch has been tripped, everything's assumed to be a nested rule. There are a few possibilities for the parsing switch:
	1. Just at-rules. This means any nested at-rule, like a nested @media, or the no-op `@nest;` rule we'd introduce.
	2. [(link)](https://github.com/w3c/csswg-drafts/issues/7834#issuecomment-1268979633) The above, plus any style rule starting with an `&`. (Rules following the switch can start with whatever.)
	3. [(link)](https://github.com/w3c/csswg-drafts/issues/7834#issuecomment-1270665794) The above, plus any style rule starting with a non-ident. (So `.foo`, `:hover`, etc will trigger the switch, but `div` won't.) (Rules following the switch can start with whatever.)
3. [Non-letter start proposal](https://github.com/w3c/csswg-drafts/issues/7834#issuecomment-1272373216) - No parsing switch, instead every nested rule has to be unambiguous on its own, by starting with anything but an ident. (You can write  `& div` or `:is(div)` if you need to start a selector with a type selector.) (This employs the same parsing strat as (2.iii) to avoid accidentally parsing invalid properties like `//color: red;` as rules.)
4. [Postfix proposal](https://github.com/w3c/csswg-drafts/issues/7834#issuecomment-1276360012) - Block after main rule containing nested rules, no `&` needed in nested selectors except for disambiguation. Style rules effectively consist of a selector, a declaration block, and an optional style rule block.
   1. Could add the rule block with an `@nest` rule
   2. Could add the rule block with special ASCII selector like bare `&` or `&&` to indicate association of nested rules with the previous selector
   3. Could [add the rule block with bare braces](https://github.com/w3c/csswg-drafts/issues/7834#issuecomment-1282630354), essentially giving the selector prelude associated two blocks (one declaration block, one optional rule block).

------

Arguments for each of the above options:

<table>
<thead>
 <tr><th>#<th>Pros<th>Cons
</thead>
<tr>
<th>(1)
<td>

- Every rule is valid or invalid "locally", no need to track context.
- `&` or `@nest` is visually distinct from properties.
- `@nest`, if used only when needed, signals "odd" nesting. (But might be used anywhere.)
- Theoretically can mix properties and rules in any order, tho we won't retain their relative order in the data model. (All properties will be treated as preceding all rules.) (Currently the spec disallows this, to avoid confusion.)

<td>

- Syntax is different from other nesting contexts (like `@scope`, or global `@media`), so you can't copy from `@scope`/etc to nesting. (It might be safe to copy from nesting to `@scope`/etc, if we explicitly allow `&` and `@nest` globally; see <a href="https://github.com/w3c/csswg-drafts/issues/5745">#5745</a>.)
- Requiring each selector in a list to be modified with & is error-prone (easy to forget) and is complicated to convert manually or automatically
- More verbose than Sass/etc-style, which many authors are used to. (And is arguably just a good design.)

<tr>
<th>(2.i)
<td>

- After the switch, syntax is the same as other nesting contexts.
- Syntax is same as Sass/etc-style, which many authors are used to. (And is arguably just a good design.)

<td>

- The `@nest;` no-op rule is weird and requiring it everywhere is very noisy.
- Can't *quite* naively move code between nested contexts; need to make sure the switch is there (or add it) when moving *to* plain nesting. (But moving to other contexts is always safe, even if you copy over the `@nest;` too.)
- Can't mix properties and rules - all properties have to come first. (But this matches the data model anyway.)

<tr>
<th>(2.ii)
<td>

- Same as (2.i), but you can avoid using `@nest;` most of the time if you instead start your first rule with `&`.


<td>

- Need to pay somewhat more attention to context, and make sure your first rule is written correctly - either preceded by an at-rule, or starting with `&`.

<tr>
<th>(2.iii)
<td>

- Same as (2.ii), but you can avoid using `@nest;` in even more cases: unless your first selector starts with a type selector, you can just nest naively.

<td>

- Still somewhat context-sensitive, just less so than (2.ii).
- Prevents us from ever changing property syntax to start with an ascii glyph. (Like `+transform:...;` for additive properties?) (But these are probably already ruled out anyway, due to people using garbage to "comment out" their properties, like `//color: red;`, or `*color:red;` for an old IE hack.)

<tr>
<th>(3)
<td>

- Like (1), every rule is valid or invalid "locally", no need to track context.
- Like the (2.X) set, can *mostly* transfer rules between nested contexts. Going *from* nested to `@scope`/etc is always valid; going from `@scope`/etc *to* nested is *usually* valid, unless the rule starts with a type selector.
- Like the (2.X) set, syntax is same as Sass/etc-style except for selectors starting with a type selector.
- Like (1), can theoretically mix properties and rules again, but the data model will still have to act as if all properties as coming first.
- No `@nest` rule needed
- In the future we could theoretically relax the syntax further, if we find a way to parse desecendant element selectors properly without infinite lookahead

<td>

- Rules are invalid if they start with a type selector, requiring them to be rephrased somehow. (Using `:is(div)`, starting with `&`, etc.)
- Like (2.iii), prevents us from changing property syntax to start with an ascii glyph in the future. (But similarly, this is probably already lost to us.)

<tr>
<th>(4)
<td>

- Blocks either contain declarations or rules, not both
- No double-nested indentation
- No `&` for selectors that do not require it
- Full compatibility with `@scope` and root contexts
- No `@nest` in variants (4.ii) and (4.iii)

<td>

- Nesting that is not nested
- No nesting in inline styles or other CSSStyleDeclaration contexts
- Requires another pair of brackets
- Requires either noisy `@nest` everywhere or cryptic ASCII syntax
- CSSOM with (arguably) a different structure than the syntax
- Can't mix properties and rules - all properties have to come first. (But this matches the data model anyway.)
- If you are *only* nesting rules, you still need an empty declaration block (`{}`), which looks awkward

</table>

## Twitter Polls

*(Percentages normalized to exclude "Just show results" answers)*

### [Poll 1: What do authors prefer for their own code](https://twitter.com/LeaVerou/status/1579902585540345857) (1,613 votes)

Which of the following best expresses how you want to write nested CSS when it's implemented by browsers?

- (**52%**) I want to use `&` in every selector, as I think it makes code more clear
- (**48%**) I want to be able to omit `&` whenever possible, as it's noisy to read and a hassle to type

### [Poll 2: What do authors want to be the general rule](https://twitter.com/LeaVerou/status/1580215877705687040) (592 votes)

If it were up to you, what syntax would you prefer for CSS Nesting?

- (**42%**) `&` should be mandatory, even in descendants and combinators
- (**58%**) `&` should be optional for descendants and combinators


## Discussion Participant Positions

[Add](https://github.com/w3c/csswg-drafts/edit/main/css-nesting-1/proposals.md) your name and preferred proposals below:

| Participant | Top choice | Runner-up | Third choice |
|-------------|------------|-----------|--------------|
| fantasai    | 3 or 4.ii or 4.iii | 2.ii or 2.iii | |
| LeaVerou    | 3          | 2.iii     | 2.ii        |
| tabatkins   | 3          | 1          | 2.iii      |
| Loirooriol  | 1          | 4.i or 4.iii | 2.i or 3 |
| argyleink   | 1          | 3          | 4          |
| bradkemper  | 2.iii      | 2.ii       | 3          |
| mirisuzanne | 3          | 2.iii      | 4          |
| romainmenke | 1          | 3          | 4          |
| FremyCompany | 4.iii     | 1          | 3          |
| dbaron | 3 [*](https://github.com/w3c/csswg-drafts/issues/7834#issuecomment-1283019419) | 4.iii | 1 |
| alohci      | 3          | 1          | 4          |
| svgeesus    | 3          | 2.iii      |            |
| lilles      | 1          | 3          |            |
| andruud     | 3          | 1          | 4          |

***Note:** It is not required to be a WG member to add your name to this list,
only to have followed the [discussion](https://github.com/w3c/csswg-drafts/issues/7834)
and considered the proposals (summarized above) carefully.*
