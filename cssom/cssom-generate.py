# GENERATE CSSOM

cssidlattributes = """azimuth
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

def generate_propertyidl():
    value = ""
    for attribute in cssidlattributes.split("\n"):
        value += "           attribute DOMString <span title=\"dom-CSSStyleDeclaration-" + attribute + "\">" + attribute + "</span>;\n"
    return value

def generate_propertytable():
    value = ""
    for attribute in cssidlattributes.split("\n"):
        identifier = "dom-CSSStyleDeclaration-" + attribute
        value += "    <tr>\n     <td><dfn title=\"" + identifier + "\"><code>" + attribute + "</code></dfn></td>\n     <td>\"<code>" + property_from_attribute(attribute) + "</code>\"</td>\n"
    return value


def generate_spec():
    source = open("./cssom-source", "r").read()

    source = source.replace("<!--CSSOM-DECLARATIONIDL-->\n", generate_propertyidl())
    source = source.replace("<!--CSSOM-DECLARATIONTABLE-->\n", generate_propertytable())

    file = open("./Overview.src.html", "w")
    file.write(source)
    file.close()

if __name__ == '__main__':
    generate_spec()
