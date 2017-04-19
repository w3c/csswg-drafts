Fonts.html: Fonts.src.html
	curl -u $(W3C_USERNAME):$(W3C_PASSWORD) -F file=@$< -F group=CSS -F output=html -F method=file https://www.w3.org/Style/Group/process.cgi -o $@
