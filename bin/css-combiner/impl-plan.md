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

* The relevant input documents are all of the Overview.bs documents in top-level folders here, except for the Snapshot documents in folders of the form `css-YEAR`. Most spec folders start with `css-`, but not all. Any spec directory will contain either an `Overview.bs` file, an `index.bs` file.
	* Some specs predate Bikeshed and don't have a `*.bs` file. In these cases, there will be an `Overview.html` file which can be used directly for the later steps, skipping the "build with Bikeshed" part of the process.
* The set of specs will grow over time, so the input folders must be discovered dynamically. However, some specs will require special care to be merged, which you will discover while coding this project, and maintain a config file (in *this* folder) listing any special information that is needed for the combiner script to work correctly.
* Some specs are split across multiple levels, named like `css-foo-1`, `css-foo-2`, etc.
	* Sometimes the later levels are replacements for the earlier, in which case the earlier should be ignored.
	* Sometimes the later levels are "diff specs" for the earlier, which should be interpreted as additions to the earlier spec. This is not indicated in any consistent way, and must be discovered yourself.
		* Some diff specs reproduce some or all of the heading structure of the earlier level, and should merge their new sections into the appropriate sections of the earlier spec.
		* Other diff specs just create their own new sections unrelated to the earlier spec, which should be appended to the earlier spec.
* If a new input folder is added in the future which is not in your config file, flag an error asking for the config file to be updated (and listing what metadata needs to be specified), and skip that folder. Add a dismissable warning to the output document listing the specs that need to be configured, so a human is likely to notice the problem, rather than the error just showing up repeatedly in the CI logs.

Outputs
-------

* A single `index.html` file which contains the combined "meaningful content" of all the input specs, placed in the top-level `all-css` folder (already provided for you).
* An equivalent `index.md` file which has all the same content, but in Markdown format for easier ingestion by agents, produced directly from the output HTML.
* Images and other referenced files which are inside a spec's directory should be linked in the combined document with relative paths into that spec folder, rather than copying them over into `all-css`.



Implementation Plan
-------------------

1. Create a config file in this directory which contains a list of all the specs to b
1. Build each spec separately with Bikeshed. 
	* They might print Bikeshed errors; this is acceptable. Collect these errors and the spec they're from, and put them into an appendix in the output document.
1. Extract the "meaningful content" of each built spec.
	* Meaningful content is the stuff within the `<main>` element. Everything outside of it is boilerplate.
	* Within the `<main>` element, Acknowledgements and Changes sections are not meaningful, and must be removed.
	* Within the `<main>` element, Security and Privacy sections are meaningful, but should be removed and combined into a single Security and Privacy section at the end of the output document, categorized by which spec they were removed from.
1. Combine the "meaningful contents" together into a single document.
	* Eagerly disambiguate all IDs in each document by prepending the spec's versioned shortname to each ID in it, like turning `the-foo-property` into `css-foo-1:the-foo-property`.
	* Rewrite links in each document to match:
		* Local links (`href` attribute starting with `#`) just need to be rewritten in the same way as the IDs.
		* Cross-document links *that are linking to one of the specs being combined* must be rewritten into local links. You can tell which spec is being referenced by examining the `href`; it will contain the spec's versioned shortname as a substring (but potentially with a data afterwards).
		* Cross-document links *to specs not being combined* should be left as-is.
1. Generate a combined Internal and External index:
	* Combine all the internal indexes from every input spec into a single sorted list. When necessary, disambiguate terms in the existing fashion in the indexes (a sublist under the term), but with the spec's versioned shortnames included in the disambiguation key.
	* Combine all the external indexes, but with any terms that "external" links to specs being combined here (found earlier, when rewriting their `href` attributes to be local links) removed, so the index only contains terms that are totally outside of the input specs.
	* Add these indexes to the end of the combined document.
1. Create an appropriate header for the document, in the same style as the existing spec headers.
1. Reuse the same styling as the existing input specs.
1. Write the resulting output document to `all-css/index.html`.
1. Serialize the entire document to well-formatted Markdown and write it to `all-css/index.md`.

Also, edit the existing Github workflow that builds all of the specs to also run the combiner.

Coding Guidelines
-----------------

* Write for Python 3.12. MyPy should already enforce this to keep you honest.
* Organize the code well, into multiple files if it would be appropriate.
* Use MyPy type annotations, with appropriate type aliases for readability instead of anonymous dicts/etc.
* Write concise docstrings documenting every method and class. If you make any unusual choices that should be noted by future maintainers, add a concise comment pointing out the issue.
* Use NamedTuple instead of plain tuples.
* Document the config file well, so humans can maintain it by hand in the future.