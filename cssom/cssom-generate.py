# GENERATE CSSOM

from cssattrs import cssidlattributes

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
