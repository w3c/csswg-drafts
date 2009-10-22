import sys

input = """azimuth
background
backgroundAttachment
backgroundColor
backgroundImage
backgroundPosition
backgroundRepeat
border
borderCollapse
borderColor
borderSpacing
borderStyle
borderTop
borderRight
borderBottom
borderLeft
borderTopColor
borderRightColor
borderBottomColor
borderLeftColor
borderTopStyle
borderRightStyle
borderBottomStyle
borderLeftStyle
borderTopWidth
borderRightWidth
borderBottomWidth
borderLeftWidth
borderWidth
bottom
captionSide
clear
clip
color
content
counterIncrement
counterReset
cue
cueAfter
cueBefore
cursor
direction
display
elevation
emptyCells
cssFloat
font
fontFamily
fontSize
fontSizeAdjust
fontStretch
fontStyle
fontVariant
fontWeight
height
left
letterSpacing
lineHeight
listStyle
listStyleImage
listStylePosition
listStyleType
margin
marginTop
marginRight
marginBottom
marginLeft
markerOffset
marks
maxHeight
maxWidth
minHeight
minWidth
orphans
outline
outlineColor
outlineStyle
outlineWidth
overflow
padding
paddingTop
paddingRight
paddingBottom
paddingLeft
page
pageBreakAfter
pageBreakBefore
pageBreakInside
pause
pauseAfter
pauseBefore
pitch
pitchRange
playDuring
position
quotes
richness
right
size
speak
speakHeader
speakNumeral
speakPunctuation
speechRate
stress
tableLayout
textAlign
textDecoration
textIndent
textShadow
textTransform
top
unicodeBidi
verticalAlign
visibility
voiceFamily
volume
whiteSpace
widows
width
wordSpacing
zIndex"""

def property_from_attribute(attribute):
    output = ""
    if attribute == "cssFloat":
        return "float"
    for char in attribute:
        if char.isupper():
            output += "-"
            output += char.lower()
        else:
            output += char
    return output

if "idl" in sys.argv:
    for attribute in input.split("\n"):
        sys.stdout.write("           attribute DOMString <span title=\"cssstyledeclaration-" + attribute.lower() + "\">" + attribute + "</span>;\n")
elif "table" in sys.argv:
    for attribute in input.split("\n"):
        identifier = "cssstyledeclaration-" + attribute.lower()
        sys.stdout.write("    <tr>\n     <td><dfn id=\"" + identifier + "\" title=\"" + identifier + "\"><code>" + attribute + "</code></dfn></td>\n     <td>\"<code>" + property_from_attribute(attribute) + "</code>\"</td>\n")

