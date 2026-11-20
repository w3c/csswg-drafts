CSS Combiner Project
====================

The goal of this project is to produce a Python script that, 
when run either manually from within this folder (this folder)
or by GitHub CI in the csswg-drafts repository (the root of the cloned repository you're in),
will combine all of the CSS specifications into a single mega-spec.
The purpose of this is both for humans to have something they can easily ctrl-F over,
and for agents to have a single authoritative document they can ingest for context when asked questions about the CSS specs.

Tools
-----

* You have access to Python 3.12.
* You have access to the `bikeshed` Python library. (For the CI version, you will have to load it in the CI config file.)
* You have access to the `lint` shell script, which runs lints, formatters, and type-checkers. This command must pass with no errors before you can consider any step to be done.

Inputs
------

* The relevant input documents are most of the Overview.bs documents in top-level folders here. Most spec folders start with `css-`, but not all. Any spec directory will contain either an `Overview.bs` file, an `index.bs` file.
	* Omit the Snapshot specs (all named with the pattern `css-YEAR`)
	* Omit any abandoned or retired specifications, and any Notes.
	* Omit `css-module` and `indexes`.
	* Omit any specs that are just redirect stubs.
	* Include the `css2` spec, as while large portions of it have been superceded, it still contains some vital concepts that have not yet been moved to new specifications.
	* Include the other specs in the repository that don't start with `css`.
	* Some specs predate Bikeshed and don't have a `*.bs` file. In these cases, there will be an `Overview.html` file which can be used directly for the later steps, skipping the "build with Bikeshed" part of the process. (These specs will not have a `<main>` element to denote their "meaningful content"; instead, extract the segment between the ToC and the backmatter.)
* The set of specs will grow over time, so the input folders must be discovered dynamically. However, some specs will require special care to be merged, which you will discover while coding this project, and maintain a config file (in *this* folder) listing any special information that is needed for the combiner script to work correctly.
* Some specs are split across multiple levels, named like `css-foo-1`, `css-foo-2`, etc.
	* Sometimes the later levels are replacements for the earlier, in which case the earlier should be ignored and only the later one used.
	* Sometimes the later levels are "diff specs" for the earlier. These should be treated as new, independent specs. This is not indicated in any consistent way, and must be discovered yourself.
* If a new input folder is added in the future which is not in your config file, flag an error asking for the config file to be updated (and listing what metadata needs to be specified), and skip that folder. Add a dismissable warning to the output document listing the specs that need to be configured, so a human is likely to notice the problem, rather than the error just showing up repeatedly in the CI logs.

Outputs
-------

* A single `index.html` file which contains the combined "meaningful content" of all the input specs, placed in the top-level `all-css` folder (already provided for you).
* An equivalent `index.md` file which has all the same content, but in Markdown format for easier ingestion by agents, produced directly from the output HTML.
* Images and other referenced files which are inside a spec's directory should be linked in the combined document with relative paths into that spec folder, rather than copying them over into `all-css`.
* For the *known* errors that are collected and emitted in the output document, still have the script complete successfully with error code 0. Unknown/unexpected errors should cause the script to fail, as usual.



Implementation Plan
-------------------

1. Create a TOML config file (`config.toml`) in this directory which contains a list of all the specs that will be combined, along with necessary metadata (which you'll discover while building this project) to ensure the specs can be combined accurately.
1. Build each spec separately with Bikeshed. 
	* They might print Bikeshed errors; this is acceptable. Collect these errors and the spec they're from, and put them into an appendix in the output document.
1. Extract the "meaningful content" of each built spec.
	* Meaningful content is the stuff within the `<main>` element. Everything outside of it is boilerplate.
	* Within the `<main>` element, Acknowledgements and Changes sections are not meaningful, and must be removed.
	* Within the `<main>` element, Security and Privacy sections are meaningful, but should be removed and combined into a single Security and Privacy section at the end of the output document, categorized by which spec they were removed from.
1. Combine the "meaningful contents" together into a single document.
	* Order the specs with more important/foundational documents first, with the ordering recorded in the config file so it can be adjusted for taste in the future. If multiple levels of a spec exists, keep them grouped together in ascending level order.
	* Eagerly disambiguate all IDs in each document by prepending the spec's versioned shortname to each ID in it, like turning `the-foo-property` into `css-foo-1:the-foo-property`.
	* Rewrite links in each document to match:
		* Local links (`href` attribute starting with `#`) just need to be rewritten in the same way as the IDs.
		* Cross-document links *that are linking to one of the specs being combined* must be rewritten into local links. You can tell which spec is being referenced by examining the `href`; it will contain the spec's versioned shortname as a substring (but potentially with a data afterwards).
			* If a link is to an *unversioned* shortname, load the `bin/build-index.py` script (just outside of this folder) and use the `CURRENT_WORK_EXCEPTIONS` dict defined there. For anything not listed there, use the latest level. 
			* A bare link (no #anchor on the URL) to one of the combined files should instead be rewritten to a local anchor pointing to the corresponding spec's top-level heading.
		* Cross-document links *to specs not being combined* should be left as-is.
	* Leave dfn-panels in, but fix all of the data lists so that local IDs point to the new disambiguated IDs, and full URLs that point to a spec being combined are fixed to point to the new local ID. Remove all but one copy of the actual script.
	* Similarly, leave ref-hints in, but fix the IDs and links in their data in the same way. Remove all but one copy of the actual script.
	* Leave in MDN annotations, but remove all but one copy of the actual script.
1. Each combined spec's content should be organized under an `<h2>` giving the spec name, and a short list of necessary metadata about the spec: link to the ED and (if present) the TR version; its W3C status; the date of the most recent edit to the spec; what spec it's a diff over, if any. If anything else seems useful to add, go ahead and do so.
	* All the headings from each spec's contents should, correspondingly, be bumped down one level to nest under their spec's name. If a spec contains an `<h6>`, leave it as an `<h6>`.
	* Heading numbering should be retained from the source specs, so it's easy to find a section in the individual specs.
	* A link should be added to beginning of each heading to the original ID of the heading in the document at the ED url.
	* Retain any spec-specific styles and scripts. If the styles have any rules not prefixed with an ID, log that in an error message so they can be fixed in the source files.
1. Generate a combined Internal and External index:
	* Combine all the internal indexes from every input spec into a single sorted list. When necessary, disambiguate terms in the existing fashion in the indexes (a sublist under the term), but with the spec's versioned shortnames included in the disambiguation key.
	* Combine all the external indexes, but with any terms that "external" links to specs being combined here (found earlier, when rewriting their `href` attributes to be local links) removed, so the index only contains terms that are totally outside of the input specs.
	* Add these indexes to the end of the combined document.
1. Generate a combined Property Index, with an extra column denoting what spec each is from. When a property appears in the indexes of multiple specs, keep the lines separate but group them adjacently. Sort the entire index alphabetically (do not group by spec).
1. Drop all other backmatter.
1. Create an appropriate header for the document, in the same style as the existing spec headers.
	* Create a concise Introduction section descripting what this document is and how to use it.
	* Generate a combined Table of Contents and include it in the header. 
1. Reuse the same styling as the existing input specs.
1. Write the resulting output document to `all-css/index.html`.
1. Serialize the entire document to well-formatted Markdown and write it to `all-css/index.md`. Omit any markup that is useful to humans but wasteful for agents to process, such as dfn-panels, ref-hints, unneeded indexes, etc.

Edit the existing Github workflow that builds all of the specs to also run the combiner. Add links to the `all-css` HTML and Markdown to the specs index.

Coding Guidelines
-----------------

* Write for Python 3.12. MyPy should already enforce this to keep you honest.
* Organize the code well, into multiple files if it would be appropriate.
* Use MyPy type annotations, with appropriate type aliases for readability instead of anonymous dicts/etc.
* Write concise docstrings documenting every method and class. If you make any unusual choices that should be noted by future maintainers, add a concise comment pointing out the issue.
* Use NamedTuple instead of plain tuples.
* Document the config file well, so humans can maintain it by hand in the future.
* Use stdlib when possible, but if you absolutely need some functionality from a 3rd party library, it's okay to install and use it.