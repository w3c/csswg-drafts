# Web Platform Incubator Community Group

This repository is being used for work in the Web Platform Incubator Community Group, governed by the [W3C Community License 
Agreement (CLA)](http://www.w3.org/community/about/agreements/cla/). To contribute, you must join 
the CG. 

If you are not the sole contributor to a contribution (pull request), please identify all 
contributors in the pull request's body or in subsequent comments.

To add a contributor (other than yourself, that's automatic), mark them one per line as follows:

```
+@github_username
```

If you added a contributor by mistake, you can remove them in a comment with:

```
-@github_username
```

If you are making a pull request on behalf of someone else but you had no part in designing the 
feature, you can remove yourself with the above syntax.

# Tests

For normative changes, a corresponding
[web-platform-tests](https://github.com/web-platform-tests/wpt) PR is highly appreciated. Typically,
both PRs will be merged at the same time. Note that a test change that contradicts the spec should
not be merged before the corresponding spec change. If testing is not practical, please explain why
and if appropriate [file an issue](https://github.com/web-platform-tests/wpt/issues/new) to follow
up later. Add the `type:untestable` or `type:missing-coverage` label as appropriate.
