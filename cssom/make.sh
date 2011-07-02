echo "run preprocessor"
python cssom-generate.py
echo "run anolis"
anolis --omit-optional-tags --quote-attr-values --w3c-compat --enable=xspecxref --enable=refs --w3c-shortname="cssom" --filter=".publish" Overview.src.html Overview.html
