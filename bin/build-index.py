"""
Builds the GitHub Pages root page,
which now is just a redirect to the drafts server listing.
"""



with open("./index.html", mode='w', encoding="UTF-8") as f:
    f.write("""
<!doctype html>
<meta charset=utf-8>
<title>Redirecting to the Drafts listing...</title>
<meta http-equiv=Refresh content="0; url='https://drafts.csswg.org'">
<script>
window.location.href = "https://drafts.csswg.org";
</script>
""")