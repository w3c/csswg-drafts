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
        value += "  readonly attribute CSSPropertyValue <span data-anolis-spec=cssom data-anolis-xref=\"dom-CSSStyleDeclaration-" + attribute + "\">" + attribute + "</span>;\n"
    return value

def generate_spec():
    source = open("./cssom-values-source", "r").read()

    source = source.replace("<!--CSSOM-DECLARATIONVALUEIDL-->\n", generate_propertyidl())

    file = open("./Overview.src.html", "w")
    file.write(source)
    file.close()

if __name__ == '__main__':
    generate_spec()
