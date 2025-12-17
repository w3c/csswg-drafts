## Interface SVGFilterElement ## {#InterfaceSVGFilterElement}

The <dfn dfn-type=interface>SVGFilterElement</dfn> interface corresponds to the <a element>filter</a> element.

<pre class=idl>
[Exposed=Window]
interface SVGFilterElement : SVGElement {
  readonly attribute SVGAnimatedEnumeration filterUnits;
  readonly attribute SVGAnimatedEnumeration primitiveUnits;
  readonly attribute SVGAnimatedLength x;
  readonly attribute SVGAnimatedLength y;
  readonly attribute SVGAnimatedLength width;
  readonly attribute SVGAnimatedLength height;
};

SVGFilterElement includes SVGURIReference;
</pre>

<div dfn-type=attribute dfn-for=SVGFilterElement>
    : Attributes:
    ::
        : <dfn>filterUnits</dfn>
        :: Corresponds to attribute <a element-attr>filterUnits</a> on the given <a element>filter</a> element. Takes one of the constants defined in <a interface>SVGUnitTypes</a>.
        : <dfn>primitiveUnits</dfn>
        :: Corresponds to attribute <a element-attr>primitiveUnits</a> on the given <a element>filter</a> element. Takes one of the constants defined in <a interface>SVGUnitTypes</a>.
        : <dfn>x</dfn>
        :: Corresponds to attribute <a element-attr for=filter>x</a> on the given <a element>filter</a> element.
        : <dfn>y</dfn>
        :: Corresponds to attribute <a element-attr for=filter>y</a> on the given <a element>filter</a> element.
        : <dfn>width</dfn>
        :: Corresponds to attribute <a element-attr for=filter>width</a> on the given <a element>filter</a> element.
        : <dfn>height</dfn>
        :: Corresponds to attribute <a element-attr for=filter>height</a> on the given <a element>filter</a> element.
</div>

## Interface SVGFilterPrimitiveStandardAttributes ## {#InterfaceSVGFilterPrimitiveStandardAttributes}

<pre class=idl>
interface mixin SVGFilterPrimitiveStandardAttributes {
  readonly attribute SVGAnimatedLength x;
  readonly attribute SVGAnimatedLength y;
  readonly attribute SVGAnimatedLength width;
  readonly attribute SVGAnimatedLength height;
  readonly attribute SVGAnimatedString result;
};
</pre>

<div dfn-type=attribute dfn-for=SVGFilterPrimitiveStandardAttributes>
    : Attributes:
    ::
        : <dfn>x</dfn>
        :: Corresponds to attribute <a element-attr for=filter-primitive>x</a> on the given element.
        : <dfn>y</dfn>
        :: Corresponds to attribute <a element-attr for=filter-primitive>y</a> on the given element.
        : <dfn>width</dfn>
        :: Corresponds to attribute <a element-attr for=filter-primitive>width</a> on the given element.
        : <dfn>height</dfn>
        :: Corresponds to attribute <a element-attr for=filter-primitive>height</a> on the given element.
        : <dfn>result</dfn>
        :: Corresponds to attribute <a element-attr for=filter-primitive>result</a> on the given element.
</div>

## Interface SVGFEBlendElement ## {#InterfaceSVGFEBlendElement}

The <dfn dfn-type=interface>SVGFEBlendElement</dfn> interface corresponds to the <a element>feBlend</a> element.

<pre class=idl>
[Exposed=Window]
interface SVGFEBlendElement : SVGElement {

  // Blend Mode Types
  const unsigned short SVG_FEBLEND_MODE_UNKNOWN = 0;
  const unsigned short SVG_FEBLEND_MODE_NORMAL = 1;
  const unsigned short SVG_FEBLEND_MODE_MULTIPLY = 2;
  const unsigned short SVG_FEBLEND_MODE_SCREEN = 3;
  const unsigned short SVG_FEBLEND_MODE_DARKEN = 4;
  const unsigned short SVG_FEBLEND_MODE_LIGHTEN = 5;
  const unsigned short SVG_FEBLEND_MODE_OVERLAY = 6;
  const unsigned short SVG_FEBLEND_MODE_COLOR_DODGE = 7;
  const unsigned short SVG_FEBLEND_MODE_COLOR_BURN = 8;
  const unsigned short SVG_FEBLEND_MODE_HARD_LIGHT = 9;
  const unsigned short SVG_FEBLEND_MODE_SOFT_LIGHT = 10;
  const unsigned short SVG_FEBLEND_MODE_DIFFERENCE = 11;
  const unsigned short SVG_FEBLEND_MODE_EXCLUSION = 12;
  const unsigned short SVG_FEBLEND_MODE_HUE = 13;
  const unsigned short SVG_FEBLEND_MODE_SATURATION = 14;
  const unsigned short SVG_FEBLEND_MODE_COLOR = 15;
  const unsigned short SVG_FEBLEND_MODE_LUMINOSITY = 16;

  readonly attribute SVGAnimatedString in1;
  readonly attribute SVGAnimatedString in2;
  readonly attribute SVGAnimatedEnumeration mode;
};

SVGFEBlendElement includes SVGFilterPrimitiveStandardAttributes;
</pre>

<div dfn-type=const dfn-for=SVGFEBlendElement>
    : Constants in group “Blend Mode Types”:
    ::
        : <dfn>SVG_FEBLEND_MODE_UNKNOWN</dfn>
        :: The type is not one of predefined types. It is invalid to attempt to define a new value of this type or to attempt to switch an existing value to this type.
        : <dfn>SVG_FEBLEND_MODE_NORMAL</dfn>
        :: Corresponds to value ''normal''.
        : <dfn>SVG_FEBLEND_MODE_MULTIPLY</dfn>
        :: Corresponds to value ''multiply''.
        : <dfn>SVG_FEBLEND_MODE_SCREEN</dfn>
        :: Corresponds to value ''screen''.
        : <dfn>SVG_FEBLEND_MODE_DARKEN</dfn>
        :: Corresponds to value ''darken''.
        : <dfn>SVG_FEBLEND_MODE_LIGHTEN</dfn>
        :: Corresponds to value ''lighten''.
        : <dfn>SVG_FEBLEND_MODE_OVERLAY</dfn>
        :: Corresponds to value ''overlay''.
        : <dfn>SVG_FEBLEND_MODE_COLOR_DODGE</dfn>
        :: Corresponds to value ''color-dodge''.
        : <dfn>SVG_FEBLEND_MODE_COLOR_BURN</dfn>
        :: Corresponds to value ''color-burn''.
        : <dfn>SVG_FEBLEND_MODE_HARD_LIGHT</dfn>
        :: Corresponds to value ''hard-light''.
        : <dfn>SVG_FEBLEND_MODE_SOFT_LIGHT</dfn>
        :: Corresponds to value ''soft-light''.
        : <dfn>SVG_FEBLEND_MODE_DIFFERENCE</dfn>
        :: Corresponds to value ''difference''.
        : <dfn>SVG_FEBLEND_MODE_EXCLUSION</dfn>
        :: Corresponds to value ''exclusion''.
        : <dfn>SVG_FEBLEND_MODE_HUE</dfn>
        :: Corresponds to value ''hue''.
        : <dfn>SVG_FEBLEND_MODE_SATURATION</dfn>
        :: Corresponds to value ''saturation''.
        : <dfn>SVG_FEBLEND_MODE_COLOR</dfn>
        :: Corresponds to value ''color''.
        : <dfn>SVG_FEBLEND_MODE_LUMINOSITY</dfn>
        :: Corresponds to value ''luminosity''.
</div>

<div dfn-type=attribute dfn-for=SVGFEBlendElement>
    : Attributes:
    ::
        : <dfn>in1</dfn>
        :: Corresponds to attribute <a element-attr>in</a> on the given <a element>feBlend</a> element.
        : <dfn>in2</dfn>
        :: Corresponds to attribute <a element-attr for=feBlend>in2</a> on the given <a element>feBlend</a> element.
        : <dfn>mode</dfn>
        :: Corresponds to attribute <a element-attr for=feBlend>mode</a> on the given <a element>feBlend</a> element. Takes one of the SVG_FEBLEND_MODE_* constants defined on this interface.
</div>

## Interface SVGFEColorMatrixElement ## {#InterfaceSVGFEColorMatrixElement}

The <dfn dfn-type=interface>SVGFEColorMatrixElement</dfn> interface corresponds to the <a element>feColorMatrix</a> element.

<pre class=idl>
[Exposed=Window]
interface SVGFEColorMatrixElement : SVGElement {

  // Color Matrix Types
  const unsigned short SVG_FECOLORMATRIX_TYPE_UNKNOWN = 0;
  const unsigned short SVG_FECOLORMATRIX_TYPE_MATRIX = 1;
  const unsigned short SVG_FECOLORMATRIX_TYPE_SATURATE = 2;
  const unsigned short SVG_FECOLORMATRIX_TYPE_HUEROTATE = 3;
  const unsigned short SVG_FECOLORMATRIX_TYPE_LUMINANCETOALPHA = 4;

  readonly attribute SVGAnimatedString in1;
  readonly attribute SVGAnimatedEnumeration type;
  readonly attribute SVGAnimatedNumberList values;
};

SVGFEColorMatrixElement includes SVGFilterPrimitiveStandardAttributes;
</pre>

<div dfn-type=const dfn-for=SVGFEColorMatrixElement>
    : Constants in group “Color Matrix Types”:
    ::
        : <dfn>SVG_FECOLORMATRIX_TYPE_UNKNOWN</dfn>
        :: The type is not one of predefined types. It is invalid to attempt to define a new value of this type or to attempt to switch an existing value to this type.
        : <dfn>SVG_FECOLORMATRIX_TYPE_MATRIX</dfn>
        :: Corresponds to value ''matrix''.
        : <dfn>SVG_FECOLORMATRIX_TYPE_SATURATE</dfn>
        :: Corresponds to value ''saturate''.
        : <dfn>SVG_FECOLORMATRIX_TYPE_HUEROTATE</dfn>
        :: Corresponds to value ''hueRotate''.
        : <dfn>SVG_FECOLORMATRIX_TYPE_LUMINANCETOALPHA</dfn>
        :: Corresponds to value ''luminanceToAlpha''.
</div>

<div dfn-type=attribute dfn-for=SVGFEColorMatrixElement>
    : Attributes:
    ::
        : <dfn>in1</dfn>
        :: Corresponds to attribute <a element-attr>in</a> on the given <a element>feColorMatrix</a> element.
        : <dfn>type</dfn>
        :: Corresponds to attribute <a element-attr for=feColorMatrix>type</a> on the given <a element>feColorMatrix</a> element. Takes one of the SVG_FECOLORMATRIX_TYPE_* constants defined on this interface.
        : <dfn>values</dfn>
        :: Corresponds to attribute <a element-attr for=feColorMatrix>values</a> on the given <a element>feColorMatrix</a> element.
</div>

## Interface SVGFEComponentTransferElement ## {#InterfaceSVGFEComponentTransferElement}

The <dfn dfn-type=interface>SVGFEComponentTransferElement</dfn> interface corresponds to the <a element>feComponentTransfer</a> element.

<pre class=idl>
[Exposed=Window]
interface SVGFEComponentTransferElement : SVGElement {
  readonly attribute SVGAnimatedString in1;
};

SVGFEComponentTransferElement includes SVGFilterPrimitiveStandardAttributes;
</pre>

<div dfn-type=attribute dfn-for=SVGFEComponentTransferElement>
    : Attributes:
    ::
        : <dfn>in1</dfn>
        :: Corresponds to attribute <a element-attr>in</a> on the given <a element>feComponentTransfer</a> element.
</div>

## Interface SVGComponentTransferFunctionElement ## {#InterfaceSVGComponentTransferFunctionElement}

This interface defines a base interface used by the component transfer function interfaces.

<pre class=idl>
[Exposed=Window]
interface SVGComponentTransferFunctionElement : SVGElement {

  // Component Transfer Types
  const unsigned short SVG_FECOMPONENTTRANSFER_TYPE_UNKNOWN = 0;
  const unsigned short SVG_FECOMPONENTTRANSFER_TYPE_IDENTITY = 1;
  const unsigned short SVG_FECOMPONENTTRANSFER_TYPE_TABLE = 2;
  const unsigned short SVG_FECOMPONENTTRANSFER_TYPE_DISCRETE = 3;
  const unsigned short SVG_FECOMPONENTTRANSFER_TYPE_LINEAR = 4;
  const unsigned short SVG_FECOMPONENTTRANSFER_TYPE_GAMMA = 5;

  readonly attribute SVGAnimatedEnumeration type;
  readonly attribute SVGAnimatedNumberList tableValues;
  readonly attribute SVGAnimatedNumber slope;
  readonly attribute SVGAnimatedNumber intercept;
  readonly attribute SVGAnimatedNumber amplitude;
  readonly attribute SVGAnimatedNumber exponent;
  readonly attribute SVGAnimatedNumber offset;
};
</pre>

<div dfn-type=const dfn-for=SVGComponentTransferFunctionElement>
    : Constants in group “Component Transfer Types”:
    ::
        : <dfn>SVG_FECOMPONENTTRANSFER_TYPE_UNKNOWN</dfn>
        :: The type is not one of predefined types. It is invalid to attempt to define a new value of this type or to attempt to switch an existing value to this type.
        : <dfn>SVG_FECOMPONENTTRANSFER_TYPE_IDENTITY</dfn>
        :: Corresponds to value ''identity''.
        : <dfn>SVG_FECOMPONENTTRANSFER_TYPE_TABLE</dfn>
        :: Corresponds to value ''table''.
        : <dfn>SVG_FECOMPONENTTRANSFER_TYPE_DISCRETE</dfn>
        :: Corresponds to value ''discrete''.
        : <dfn>SVG_FECOMPONENTTRANSFER_TYPE_LINEAR</dfn>
        :: Corresponds to value ''linear''.
        : <dfn>SVG_FECOMPONENTTRANSFER_TYPE_GAMMA</dfn>
        :: Corresponds to value ''gamma''.
</div>

<div dfn-type=attribute dfn-for=SVGComponentTransferFunctionElement>
    : Attributes:
    ::
        : <dfn>type</dfn>
        :: Corresponds to attribute <a element-attr>in</a> on the given <a element>feComponentTransfer</a> element. Takes one of the SVG_FECOMPONENTTRANSFER_TYPE_* constants defined on this interface.
        : <dfn>tableValues</dfn>
        :: Corresponds to attribute <a element-attr for=feComponentTransfer>tableValues</a> on the given <a element>feComponentTransfer</a> element. Takes one of the SVG_FECOLORMATRIX_TYPE_* constants defined on this interface.
        : <dfn>slope</dfn>
        :: Corresponds to attribute <a element-attr for=feComponentTransfer>slope</a> on the given <a element>feComponentTransfer</a> element.
        : <dfn>intercept</dfn>
        :: Corresponds to attribute <a element-attr for=feComponentTransfer>intercept</a> on the given <a element>feComponentTransfer</a> element.
        : <dfn>amplitude</dfn>
        :: Corresponds to attribute <a element-attr for=feComponentTransfer>amplitude</a> on the given <a element>feComponentTransfer</a> element.
        : <dfn>exponent</dfn>
        :: Corresponds to attribute <a element-attr for=feComponentTransfer>exponent</a> on the given <a element>feComponentTransfer</a> element.
        : <dfn>offset</dfn>
        :: Corresponds to attribute <a element-attr for=feComponentTransfer>offset</a> on the given <a element>feComponentTransfer</a> element.
</div>

## Interface SVGFEFuncRElement ## {#InterfaceSVGFEFuncRElement}

The <dfn dfn-type=interface>SVGFEFuncRElement</dfn> interface corresponds to the <a element>feFuncR</a> element.

<pre class=idl>
[Exposed=Window]
interface SVGFEFuncRElement : SVGComponentTransferFunctionElement {
};
</pre>

## Interface SVGFEFuncGElement ## {#InterfaceSVGFEFuncGElement}

The <dfn dfn-type=interface>SVGFEFuncGElement</dfn> interface corresponds to the <a element>feFuncG</a> element.

<pre class=idl>
[Exposed=Window]
interface SVGFEFuncGElement : SVGComponentTransferFunctionElement {
};
</pre>

## Interface SVGFEFuncBElement ## {#InterfaceSVGFEFuncBElement}

The <dfn dfn-type=interface>SVGFEFuncBElement</dfn> interface corresponds to the <a element>feFuncB</a> element.

<pre class=idl>
[Exposed=Window]
interface SVGFEFuncBElement : SVGComponentTransferFunctionElement {
};
</pre>

## Interface SVGFEFuncAElement ## {#InterfaceSVGFEFuncAElement}

The <dfn dfn-type=interface>SVGFEFuncAElement</dfn> interface corresponds to the <a element>feFuncA</a> element.

<pre class=idl>
[Exposed=Window]
interface SVGFEFuncAElement : SVGComponentTransferFunctionElement {
};
</pre>

## Interface SVGFECompositeElement ## {#InterfaceSVGFECompositeElement}

The <dfn dfn-type=interface>SVGFECompositeElement</dfn> interface corresponds to the <a element>feComposite</a> element.

<pre class=idl>
[Exposed=Window]
interface SVGFECompositeElement : SVGElement {

  // Composite Operators
  const unsigned short SVG_FECOMPOSITE_OPERATOR_UNKNOWN = 0;
  const unsigned short SVG_FECOMPOSITE_OPERATOR_OVER = 1;
  const unsigned short SVG_FECOMPOSITE_OPERATOR_IN = 2;
  const unsigned short SVG_FECOMPOSITE_OPERATOR_OUT = 3;
  const unsigned short SVG_FECOMPOSITE_OPERATOR_ATOP = 4;
  const unsigned short SVG_FECOMPOSITE_OPERATOR_XOR = 5;
  const unsigned short SVG_FECOMPOSITE_OPERATOR_ARITHMETIC = 6;

  readonly attribute SVGAnimatedString in1;
  readonly attribute SVGAnimatedString in2;
  readonly attribute SVGAnimatedEnumeration operator;
  readonly attribute SVGAnimatedNumber k1;
  readonly attribute SVGAnimatedNumber k2;
  readonly attribute SVGAnimatedNumber k3;
  readonly attribute SVGAnimatedNumber k4;
};

SVGFECompositeElement includes SVGFilterPrimitiveStandardAttributes;
</pre>

<div dfn-type=const dfn-for=SVGFECompositeElement>
    : Constants in group “Composite Operators”:
    ::
        : <dfn>SVG_FECOMPOSITE_OPERATOR_UNKNOWN</dfn>
        :: The type is not one of predefined types. It is invalid to attempt to define a new value of this type or to attempt to switch an existing value to this type.
        : <dfn>SVG_FECOMPOSITE_OPERATOR_OVER</dfn>
        :: Corresponds to value <a attr-value>over</a>.
        : <dfn>SVG_FECOMPOSITE_OPERATOR_IN</dfn>
        :: Corresponds to value <a attr-value>in</a>.
        : <dfn>SVG_FECOMPOSITE_OPERATOR_OUT</dfn>
        :: Corresponds to value <a attr-value>out</a>.
        : <dfn>SVG_FECOMPOSITE_OPERATOR_ATOP</dfn>
        :: Corresponds to value <a attr-value>atop</a>.
        : <dfn>SVG_FECOMPOSITE_OPERATOR_XOR</dfn>
        :: Corresponds to value <a attr-value>xor</a>.
        : <dfn>SVG_FECOMPOSITE_OPERATOR_ARITHMETIC</dfn>
        :: Corresponds to value <a attr-value>arithmetic</a>.
</div>

<div dfn-type=attribute dfn-for=SVGFECompositeElement>
    : Attributes:
    ::
        : <dfn>in1</dfn>
        :: Corresponds to attribute <a element-attr>in</a> on the given <a element>feComposite</a> element.
        : <dfn>in2</dfn>
        :: Corresponds to attribute <a element-attr for=feComposite>in2</a> on the given <a element>feComposite</a> element.
        : <dfn>operator</dfn>
        :: Corresponds to attribute <a element-attr for=feComposite>operator</a> on the given <a element>feComposite</a> element.
        : <dfn>k1</dfn>
        :: Corresponds to attribute <a element-attr for=feComposite>k1</a> on the given <a element>feComposite</a> element.
        : <dfn>k2</dfn>
        :: Corresponds to attribute <a element-attr for=feComposite>k2</a> on the given <a element>feComposite</a> element.
        : <dfn>k3</dfn>
        :: Corresponds to attribute <a element-attr for=feComposite>k3</a> on the given <a element>feComposite</a> element.
        : <dfn>k4</dfn>
        :: Corresponds to attribute <a element-attr for=feComposite>k4</a> on the given <a element>feComposite</a> element.
</div>

## Interface SVGFEConvolveMatrixElement ## {#InterfaceSVGFEConvolveMatrixElement}

The <dfn dfn-type=interface>SVGFEConvolveMatrixElement</dfn> interface corresponds to the <a element>feConvolveMatrix</a> element.

<pre class=idl>
[Exposed=Window]
interface SVGFEConvolveMatrixElement : SVGElement {

  // Edge Mode Values
  const unsigned short SVG_EDGEMODE_UNKNOWN = 0;
  const unsigned short SVG_EDGEMODE_DUPLICATE = 1;
  const unsigned short SVG_EDGEMODE_WRAP = 2;
  const unsigned short SVG_EDGEMODE_NONE = 3;

  readonly attribute SVGAnimatedString in1;
  readonly attribute SVGAnimatedInteger orderX;
  readonly attribute SVGAnimatedInteger orderY;
  readonly attribute SVGAnimatedNumberList kernelMatrix;
  readonly attribute SVGAnimatedNumber divisor;
  readonly attribute SVGAnimatedNumber bias;
  readonly attribute SVGAnimatedInteger targetX;
  readonly attribute SVGAnimatedInteger targetY;
  readonly attribute SVGAnimatedEnumeration edgeMode;
  readonly attribute SVGAnimatedNumber kernelUnitLengthX;
  readonly attribute SVGAnimatedNumber kernelUnitLengthY;
  readonly attribute SVGAnimatedBoolean preserveAlpha;
};

SVGFEConvolveMatrixElement includes SVGFilterPrimitiveStandardAttributes;
</pre>

<div dfn-type=const dfn-for=SVGFEConvolveMatrixElement>
    : Constants in group “Edge Mode Values”:
    ::
        : <dfn>SVG_EDGEMODE_UNKNOWN</dfn>
        :: The type is not one of predefined types. It is invalid to attempt to define a new value of this type or to attempt to switch an existing value to this type.
        : <dfn>SVG_EDGEMODE_DUPLICATE</dfn>
        :: Corresponds to value <a attr-value>duplicate</a>.
        : <dfn>SVG_EDGEMODE_WRAP</dfn>
        :: Corresponds to value <a attr-value>wrap</a>.
        : <dfn>SVG_EDGEMODE_NONE</dfn>
        :: Corresponds to value ''feConvolveMatrix/none''.
</div>

<div dfn-type=attribute dfn-for=SVGFEConvolveMatrixElement>
    : Attributes:
    ::
        : <dfn>in1</dfn>
        :: Corresponds to attribute <a element-attr>in</a> on the given <a element>feConvolveMatrix</a> element.
        : <dfn>orderX</dfn>
        :: Corresponds to attribute <a element-attr for=feConvolveMatrix>order</a> on the given <a element>feConvolveMatrix</a> element.
        : <dfn>orderY</dfn>
        :: Corresponds to attribute <a element-attr for=feConvolveMatrix>order</a> on the given <a element>feConvolveMatrix</a> element.
        : <dfn>kernelMatrix</dfn>
        :: Corresponds to attribute <a element-attr for=feConvolveMatrix>kernelMatrix</a> on the given <a element>feConvolveMatrix</a> element.
        : <dfn>divisor</dfn>
        :: Corresponds to attribute <a element-attr for=feConvolveMatrix>divisor</a> on the given <a element>feConvolveMatrix</a> element.
        : <dfn>bias</dfn>
        :: Corresponds to attribute <a element-attr for=feConvolveMatrix>bias</a> on the given <a element>feConvolveMatrix</a> element.
        : <dfn>targetX</dfn>
        :: Corresponds to attribute <a element-attr for=feConvolveMatrix>targetX</a> on the given <a element>feConvolveMatrix</a> element.
        : <dfn>targetY</dfn>
        :: Corresponds to attribute <a element-attr for=feConvolveMatrix>targetY</a> on the given <a element>feConvolveMatrix</a> element.
        : <dfn>edgeMode</dfn>
        :: Corresponds to attribute <a element-attr for=feConvolveMatrix>edgeMode</a> on the given <a element>feConvolveMatrix</a> element.
        : <dfn>kernelUnitLengthX</dfn>
        :: Corresponds to attribute <a element-attr for=feConvolveMatrix>kernelUnitLength</a> on the given <a element>feConvolveMatrix</a> element.
        : <dfn>kernelUnitLengthY</dfn>
        :: Corresponds to attribute <a element-attr for=feConvolveMatrix>kernelUnitLength</a> on the given <a element>feConvolveMatrix</a> element.
        : <dfn>preserveAlpha</dfn>
        :: Corresponds to attribute <a element-attr for=feConvolveMatrix>preserveAlpha</a> on the given <a element>feConvolveMatrix</a> element.
</div>

## Interface SVGFEDiffuseLightingElement ## {#InterfaceSVGFEDiffuseLightingElement}

The <dfn dfn-type=interface>SVGFEDiffuseLightingElement</dfn> interface corresponds to the <a element>feDiffuseLighting</a> element.

<pre class=idl>
[Exposed=Window]
interface SVGFEDiffuseLightingElement : SVGElement {
  readonly attribute SVGAnimatedString in1;
  readonly attribute SVGAnimatedNumber surfaceScale;
  readonly attribute SVGAnimatedNumber diffuseConstant;
  readonly attribute SVGAnimatedNumber kernelUnitLengthX;
  readonly attribute SVGAnimatedNumber kernelUnitLengthY;
};

SVGFEDiffuseLightingElement includes SVGFilterPrimitiveStandardAttributes;
</pre>

<div dfn-type=attribute dfn-for=SVGFEDiffuseLightingElement>
    : Attributes:
    ::
        : <dfn>in1</dfn>
        :: Corresponds to attribute <a element-attr>in</a> on the given <a element>feDiffuseLighting</a> element.
        : <dfn>surfaceScale</dfn>
        :: Corresponds to attribute <a element-attr for=feDiffuseLighting>surfaceScale</a> on the given <a element>feDiffuseLighting</a> element.
        : <dfn>diffuseConstant</dfn>
        :: Corresponds to attribute <a element-attr for=feDiffuseLighting>diffuseConstant</a> on the given <a element>feDiffuseLighting</a> element.
        : <dfn>kernelUnitLengthX</dfn>
        :: Corresponds to attribute <a element-attr for=feDiffuseLighting>kernelUnitLength</a> on the given <a element>feDiffuseLighting</a> element.
        : <dfn>kernelUnitLengthY</dfn>
        :: Corresponds to attribute <a element-attr for=feDiffuseLighting>kernelUnitLength</a> on the given <a element>feDiffuseLighting</a> element.
</div>

## Interface SVGFEDistantLightElement ## {#InterfaceSVGFEDistantLightElement}

The <dfn dfn-type=interface>SVGFEDistantLightElement</dfn> interface corresponds to the <a element>feDistantLight</a> element.

<pre class=idl>
[Exposed=Window]
interface SVGFEDistantLightElement : SVGElement {
  readonly attribute SVGAnimatedNumber azimuth;
  readonly attribute SVGAnimatedNumber elevation;
};
</pre>

<div dfn-type=attribute dfn-for=SVGFEDistantLightElement>
    : Attributes:
    ::
        : <dfn>azimuth</dfn>
        :: Corresponds to attribute <a element-attr>azimuth</a> on the given <a element>feDistantLight</a> element.
        : <dfn>elevation</dfn>
        :: Corresponds to attribute <a element-attr for=feDistantLight>elevation</a> on the given <a element>feDistantLight</a> element.
</div>

## Interface SVGFEPointLightElement ## {#InterfaceSVGFEPointLightElement}

The <dfn dfn-type=interface>SVGFEPointLightElement</dfn> interface corresponds to the <a element>fePointLight</a> element.

<pre class=idl>
[Exposed=Window]
interface SVGFEPointLightElement : SVGElement {
  readonly attribute SVGAnimatedNumber x;
  readonly attribute SVGAnimatedNumber y;
  readonly attribute SVGAnimatedNumber z;
};
</pre>

<div dfn-type=attribute dfn-for=SVGFEPointLightElement>
    : Attributes:
    ::
        : <dfn>x</dfn>
        :: Corresponds to attribute <a element-attr for=fePointLight>x</a> on the given <a element>fePointLight</a> element.
        : <dfn>y</dfn>
        :: Corresponds to attribute <a element-attr for=fePointLight>y</a> on the given <a element>fePointLight</a> element.
        : <dfn>z</dfn>
        :: Corresponds to attribute <a element-attr for=fePointLight>z</a> on the given <a element>fePointLight</a> element.
</div>

## Interface SVGFESpotLightElement ## {#InterfaceSVGFESpotLightElement}

The <dfn dfn-type=interface>SVGFESpotLightElement</dfn> interface corresponds to the <a element>feSpotLight</a> element.

<pre class=idl>
[Exposed=Window]
interface SVGFESpotLightElement : SVGElement {
  readonly attribute SVGAnimatedNumber x;
  readonly attribute SVGAnimatedNumber y;
  readonly attribute SVGAnimatedNumber z;
  readonly attribute SVGAnimatedNumber pointsAtX;
  readonly attribute SVGAnimatedNumber pointsAtY;
  readonly attribute SVGAnimatedNumber pointsAtZ;
  readonly attribute SVGAnimatedNumber specularExponent;
  readonly attribute SVGAnimatedNumber limitingConeAngle;
};
</pre>

<div dfn-type=attribute dfn-for=SVGFESpotLightElement>
    : Attributes:
    ::
        : <dfn>x</dfn>
        :: Corresponds to attribute <a element-attr for=feSpotLight>x</a> on the given <a element>feSpotLight</a> element.
        : <dfn>y</dfn>
        :: Corresponds to attribute <a element-attr for=feSpotLight>y</a> on the given <a element>feSpotLight</a> element.
        : <dfn>z</dfn>
        :: Corresponds to attribute <a element-attr for=feSpotLight>z</a> on the given <a element>feSpotLight</a> element.
        : <dfn>pointsAtX</dfn>
        :: Corresponds to attribute <a element-attr for=feSpotLight>pointsAtX</a> on the given <a element>feSpotLight</a> element.
        : <dfn>pointsAtY</dfn>
        :: Corresponds to attribute <a element-attr for=feSpotLight>pointsAtY</a> on the given <a element>feSpotLight</a> element.
        : <dfn>pointsAtZ</dfn>
        :: Corresponds to attribute <a element-attr for=feSpotLight>pointsAtZ</a> on the given <a element>feSpotLight</a> element.
        : <dfn>specularExponent</dfn>
        :: Corresponds to attribute <a element-attr for=feSpotLight>specularExponent</a> on the given <a element>feSpotLight</a> element.
        : <dfn>limitingConeAngle</dfn>
        :: Corresponds to attribute <a element-attr for=feSpotLight>limitingConeAngle</a> on the given <a element>feSpotLight</a> element.
</div>

## Interface SVGFEDisplacementMapElement ## {#InterfaceSVGFEDisplacementMapElement}

The <dfn dfn-type=interface>SVGFEDisplacementMapElement</dfn> interface corresponds to the <a element>feDisplacementMap</a> element.

<pre class=idl>
[Exposed=Window]
interface SVGFEDisplacementMapElement : SVGElement {

  // Channel Selectors
  const unsigned short SVG_CHANNEL_UNKNOWN = 0;
  const unsigned short SVG_CHANNEL_R = 1;
  const unsigned short SVG_CHANNEL_G = 2;
  const unsigned short SVG_CHANNEL_B = 3;
  const unsigned short SVG_CHANNEL_A = 4;

  readonly attribute SVGAnimatedString in1;
  readonly attribute SVGAnimatedString in2;
  readonly attribute SVGAnimatedNumber scale;
  readonly attribute SVGAnimatedEnumeration xChannelSelector;
  readonly attribute SVGAnimatedEnumeration yChannelSelector;
};

SVGFEDisplacementMapElement includes SVGFilterPrimitiveStandardAttributes;
</pre>

<div dfn-type=const dfn-for=SVGFEDisplacementMapElement>
    : Constants in group “Channel Selectors”:
    ::
        : <dfn>SVG_CHANNEL_UNKNOWN</dfn>
        :: The type is not one of predefined types. It is invalid to attempt to define a new value of this type or to attempt to switch an existing value to this type.
        : <dfn>SVG_CHANNEL_R</dfn>
        :: Corresponds to value ''R''.
        : <dfn>SVG_CHANNEL_G</dfn>
        :: Corresponds to value ''G''.
        : <dfn>SVG_CHANNEL_B</dfn>
        :: Corresponds to value ''B''.
        : <dfn>SVG_CHANNEL_A</dfn>
        :: Corresponds to value ''A''.
</div>

<div dfn-type=attribute dfn-for=SVGFEDisplacementMapElement>
    : Attributes:
    ::
        : <dfn>in1</dfn>
        :: Corresponds to attribute <a element-attr>in</a> on the given <a element>feDisplacementMap</a> element.
        : <dfn>in2</dfn>
        :: Corresponds to attribute <a element-attr for=feDisplacementMap>in2</a> on the given <a element>feDisplacementMap</a> element.
        : <dfn>scale</dfn>
        :: Corresponds to attribute <a element-attr for=feDisplacementMap>scale</a> on the given <a element>feDisplacementMap</a> element.
        : <dfn>xChannelSelector</dfn>
        :: Corresponds to attribute <a element-attr for=feDisplacementMap>xChannelSelector</a> on the given <a element>feDisplacementMap</a> element. Takes one of the SVG_CHANNEL_* constants defined on this interface.
        : <dfn>yChannelSelector</dfn>
        :: Corresponds to attribute <a element-attr for=feDisplacementMap>yChannelSelector</a> on the given <a element>feDisplacementMap</a> element. Takes one of the SVG_CHANNEL_* constants defined on this interface.
</div>

## Interface SVGFEDropShadowElement ## {#InterfaceSVGFEDropShadowElement}

The <dfn dfn-type=interface>SVGFEDropShadowElement</dfn> interface corresponds to the <a element>feDropShadow</a> element.

<pre class=idl>
[Exposed=Window]
interface SVGFEDropShadowElement : SVGElement {
  readonly attribute SVGAnimatedString in1;
  readonly attribute SVGAnimatedNumber dx;
  readonly attribute SVGAnimatedNumber dy;
  readonly attribute SVGAnimatedNumber stdDeviationX;
  readonly attribute SVGAnimatedNumber stdDeviationY;

  undefined setStdDeviation(float stdDeviationX, float stdDeviationY);
};

SVGFEDropShadowElement includes SVGFilterPrimitiveStandardAttributes;
</pre>

<div dfn-type=attribute dfn-for=SVGFEDropShadowElement>
    : Attributes:
    ::
        : <dfn>in1</dfn>
        :: Corresponds to attribute <a element-attr>in</a> on the given <a element>feDropShadow</a> element.
        : <dfn>dx</dfn>
        :: Corresponds to attribute <a element-attr for=feDropShadow>dx</a> on the given <a element>feDropShadow</a> element.
        : <dfn>dy</dfn>
        :: Corresponds to attribute <a element-attr for=feDropShadow>dy</a> on the given <a element>feDropShadow</a> element.
        : <dfn>stdDeviationX</dfn>
        :: Corresponds to attribute <a element-attr for=feDropShadow>stdDeviation</a> on the given <a element>feDropShadow</a> element. Contains the X component of attribute <a element-attr for=feDropShadow>stdDeviation</a>.
        : <dfn>stdDeviationY</dfn>
        :: Corresponds to attribute <a element-attr for=feDropShadow>stdDeviation</a> on the given <a element>feDropShadow</a> element. Contains the Y component of attribute <a element-attr for=feDropShadow>stdDeviation</a>.
</div>

<div dfn-type=method dfn-for=SVGFEDropShadowElement>
    : Methods:
    ::
        : <dfn>setStdDeviation(stdDeviationX, stdDeviationY)</dfn>
        ::
            Sets the values for attribute <a element-attr for=feDropShadow>stdDeviation</a>.
            <div dfn-type=argument dfn-for="SVGFEDropShadowElement/setStdDeviation(stdDeviationX, stdDeviationY)">
                : <dfn>stdDeviationX</dfn>
                :: The X component of attribute <a element-attr for=feDropShadow>stdDeviation</a>.
                : <dfn>stdDeviationY</dfn>
                :: The Y component of attribute <a element-attr for=feDropShadow>stdDeviation</a>.
            </div>
</div>

## Interface SVGFEFloodElement ## {#InterfaceSVGFEFloodElement}

The <dfn dfn-type=interface>SVGFEFloodElement</dfn> interface corresponds to the <a element>feFlood</a> element.

<pre class=idl>
[Exposed=Window]
interface SVGFEFloodElement : SVGElement {
};

SVGFEFloodElement includes SVGFilterPrimitiveStandardAttributes;
</pre>

## Interface SVGFEGaussianBlurElement ## {#InterfaceSVGFEGaussianBlurElement}

The <dfn dfn-type=interface>SVGFEGaussianBlurElement</dfn> interface corresponds to the <a element>feGaussianBlur</a> element.

<pre class=idl>
[Exposed=Window]
interface SVGFEGaussianBlurElement : SVGElement {

  // Edge Mode Values
  const unsigned short SVG_EDGEMODE_UNKNOWN = 0;
  const unsigned short SVG_EDGEMODE_DUPLICATE = 1;
  const unsigned short SVG_EDGEMODE_WRAP = 2;
  const unsigned short SVG_EDGEMODE_NONE = 3;

  readonly attribute SVGAnimatedString in1;
  readonly attribute SVGAnimatedNumber stdDeviationX;
  readonly attribute SVGAnimatedNumber stdDeviationY;
  readonly attribute SVGAnimatedEnumeration edgeMode;

  undefined setStdDeviation(float stdDeviationX, float stdDeviationY);
};

SVGFEGaussianBlurElement includes SVGFilterPrimitiveStandardAttributes;
</pre>

<div dfn-type=const dfn-for=SVGFEGaussianBlurElement>
    : Constants in group “Edge Mode Values”:
    ::
        : <dfn>SVG_EDGEMODE_UNKNOWN</dfn>
        :: The type is not one of predefined types. It is invalid to attempt to define a new value of this type or to attempt to switch an existing value to this type.
        : <dfn>SVG_EDGEMODE_DUPLICATE</dfn>
        :: Corresponds to value ''duplicate''.
        : <dfn>SVG_EDGEMODE_WRAP</dfn>
        :: Corresponds to value <a attr-value>wrap</a>.
        : <dfn>SVG_EDGEMODE_NONE</dfn>
        :: Corresponds to value ''feGaussianBlur/none''.
</div>

<div dfn-type=attribute dfn-for=SVGFEGaussianBlurElement>
    : Attributes:
    ::
        : <dfn>in1</dfn>
        :: Corresponds to attribute <a element-attr>in</a> on the given <a element>feGaussianBlur</a> element.
        : <dfn>stdDeviationX</dfn>
        :: Corresponds to attribute <a element-attr for=feGaussianBlur>stdDeviation</a> on the given <a element>feGaussianBlur</a> element. Contains the X component of attribute <a element-attr for=feGaussianBlur>stdDeviation</a>.
        : <dfn>stdDeviationY</dfn>
        :: Corresponds to attribute <a element-attr for=feGaussianBlur>stdDeviation</a> on the given <a element>feGaussianBlur</a> element. Contains the Y component of attribute <a element-attr for=feGaussianBlur>stdDeviation</a>.
        : <dfn>edgeMode</dfn>
        :: Corresponds to attribute <a element-attr for=feGaussianBlur>edgeMode</a> on the given <a element>feGaussianBlur</a> element. Takes one of the SVG_EDGEMODE_* constants defined on this interface.
</div>

<div dfn-type=method dfn-for=SVGFEGaussianBlurElement>
    : Methods:
    ::
        : <dfn>setStdDeviation(stdDeviationX, stdDeviationY)</dfn>
        ::
            Sets the values for attribute <a element-attr for=feGaussianBlur>stdDeviation</a>.
            <div dfn-type=argument dfn-for="SVGFEGaussianBlurElement/setStdDeviation(stdDeviationX, stdDeviationY)">
                : <dfn>stdDeviationX</dfn>
                :: The X component of attribute <a element-attr for=feGaussianBlur>stdDeviation</a>.
                : <dfn>stdDeviationY</dfn>
                :: The Y component of attribute <a element-attr for=feGaussianBlur>stdDeviation</a>.
            </div>
</div>

## Interface SVGFEImageElement ## {#InterfaceSVGFEImageElement}

The <dfn dfn-type=interface>SVGFEImageElement</dfn> interface corresponds to the <a element>feImage</a> element.

<pre class=idl>
[Exposed=Window]
interface SVGFEImageElement : SVGElement {
  readonly attribute SVGAnimatedPreserveAspectRatio preserveAspectRatio;
  readonly attribute SVGAnimatedString crossOrigin;
};

SVGFEImageElement includes SVGFilterPrimitiveStandardAttributes;
SVGFEImageElement includes SVGURIReference;
</pre>

<div dfn-type=attribute dfn-for=SVGFEImageElement>
    : Attributes:
    ::
        : <dfn>preserveAspectRatio</dfn>
        :: Corresponds to attribute <a element-attr for=feImage>preserveAspectRatio</a> on the given <a element>feImage</a> element.
        : <dfn>crossOrigin</dfn>
        :: The crossOrigin IDL attribute must reflect the <a element-attr for=feImage>crossorigin</a> content attribute, limited to only known values.
</div>

## Interface SVGFEMergeElement ## {#InterfaceSVGFEMergeElement}

The <dfn dfn-type=interface>SVGFEMergeElement</dfn> interface corresponds to the <a element>feMerge</a> element.

<pre class=idl>
[Exposed=Window]
interface SVGFEMergeElement : SVGElement {
};

SVGFEMergeElement includes SVGFilterPrimitiveStandardAttributes;
</pre>

## Interface SVGFEMergeNodeElement ## {#InterfaceSVGFEMergeNodeElement}

The <dfn dfn-type=interface>SVGFEMergeNodeElement</dfn> interface corresponds to the <a element>feMergeNode</a> element.

<pre class=idl>
[Exposed=Window]
interface SVGFEMergeNodeElement : SVGElement {
  readonly attribute SVGAnimatedString in1;
};
</pre>

<div dfn-type=attribute dfn-for=SVGFEMergeNodeElement>
    : Attributes:
    ::
        : <dfn>in1</dfn>
        :: Corresponds to attribute <a element-attr>in</a> on the given <a element>feMergeNode</a> element.
</div>

## Interface SVGFEMorphologyElement ## {#InterfaceSVGFEMorphologyElement}

The <dfn dfn-type=interface>SVGFEMorphologyElement</dfn> interface corresponds to the <a element>feMorphology</a> element.

<pre class=idl>
[Exposed=Window]
interface SVGFEMorphologyElement : SVGElement {

  // Morphology Operators
  const unsigned short SVG_MORPHOLOGY_OPERATOR_UNKNOWN = 0;
  const unsigned short SVG_MORPHOLOGY_OPERATOR_ERODE = 1;
  const unsigned short SVG_MORPHOLOGY_OPERATOR_DILATE = 2;

  readonly attribute SVGAnimatedString in1;
  readonly attribute SVGAnimatedEnumeration operator;
  readonly attribute SVGAnimatedNumber radiusX;
  readonly attribute SVGAnimatedNumber radiusY;
};

SVGFEMorphologyElement includes SVGFilterPrimitiveStandardAttributes;
</pre>

<div dfn-type=const dfn-for=SVGFEMorphologyElement>
    : Constants in group “Morphology Operators”:
    ::
        : <dfn>SVG_MORPHOLOGY_OPERATOR_UNKNOWN</dfn>
        :: The type is not one of predefined types. It is invalid to attempt to define a new value of this type or to attempt to switch an existing value to this type.
        : <dfn>SVG_MORPHOLOGY_OPERATOR_ERODE</dfn>
        :: Corresponds to value ''erode''.
        : <dfn>SVG_MORPHOLOGY_OPERATOR_DILATE</dfn>
        :: Corresponds to value ''dilate''.
</div>

<div dfn-type=attribute dfn-for=SVGFEMorphologyElement>
    : Attributes:
    ::
        : <dfn>in1</dfn>
        :: Corresponds to attribute <a element-attr>in</a> on the given <a element>feMorphology</a> element.
        : <dfn>operator</dfn>
        :: Corresponds to attribute <a element-attr for=feMorphology>operator</a> on the given <a element>feMorphology</a> element. Takes one of the SVG_MORPHOLOGY_OPERATOR_* constants defined on this interface.
        : <dfn>radiusX</dfn>
        :: Corresponds to attribute <a element-attr for=feMorphology>radius</a> on the given <a element>feMorphology</a> element. Contains the X component of attribute <a element-attr for=feMorphology>radius</a>.
        : <dfn>radiusY</dfn>
        :: Corresponds to attribute <a element-attr for=feMorphology>radius</a> on the given <a element>feMorphology</a> element. Contains the Y component of attribute <a element-attr for=feMorphology>radius</a>.
</div>

## Interface SVGFEOffsetElement ## {#InterfaceSVGFEOffsetElement}

The <dfn dfn-type=interface>SVGFEOffsetElement</dfn> interface corresponds to the <a element>feOffset</a> element.

<pre class=idl>
[Exposed=Window]
interface SVGFEOffsetElement : SVGElement {
  readonly attribute SVGAnimatedString in1;
  readonly attribute SVGAnimatedNumber dx;
  readonly attribute SVGAnimatedNumber dy;
};

SVGFEOffsetElement includes SVGFilterPrimitiveStandardAttributes;
</pre>

<div dfn-type=attribute dfn-for=SVGFEOffsetElement>
    : Attributes:
    ::
        : <dfn>in1</dfn>
        :: Corresponds to attribute <a element-attr>in</a> on the given <a element>feOffset</a> element.
        : <dfn>dx</dfn>
        :: Corresponds to attribute <a element-attr for=feOffset>dx</a> on the given <a element>feOffset</a> element.
        : <dfn>dy</dfn>
        :: Corresponds to attribute <a element-attr for=feOffset>dy</a> on the given <a element>feOffset</a> element.
</div>

## Interface SVGFESpecularLightingElement ## {#InterfaceSVGFESpecularLightingElement}

The <dfn dfn-type=interface>SVGFESpecularLightingElement</dfn> interface corresponds to the <a element>feSpecularLighting</a> element.

<pre class=idl>
[Exposed=Window]
interface SVGFESpecularLightingElement : SVGElement {
  readonly attribute SVGAnimatedString in1;
  readonly attribute SVGAnimatedNumber surfaceScale;
  readonly attribute SVGAnimatedNumber specularConstant;
  readonly attribute SVGAnimatedNumber specularExponent;
  readonly attribute SVGAnimatedNumber kernelUnitLengthX;
  readonly attribute SVGAnimatedNumber kernelUnitLengthY;
};

SVGFESpecularLightingElement includes SVGFilterPrimitiveStandardAttributes;
</pre>

<div dfn-type=attribute dfn-for=SVGFESpecularLightingElement>
    : Attributes:
    ::
        : <dfn>in1</dfn>
        :: Corresponds to attribute <a element-attr>in</a> on the given <a element>feSpecularLighting</a> element.
        : <dfn>surfaceScale</dfn>
        :: Corresponds to attribute <a element-attr for=feSpecularLighting>surfaceScale</a> on the given <a element>feSpecularLighting</a> element.
        : <dfn>specularConstant</dfn>
        :: Corresponds to attribute <a element-attr for=feSpecularLighting>specularConstant</a> on the given <a element>feSpecularLighting</a> element.
        : <dfn>specularExponent</dfn>
        :: Corresponds to attribute <a element-attr for=feSpecularLighting>specularExponent</a> on the given <a element>feSpecularLighting</a> element.
        : <dfn>kernelUnitLengthX</dfn>
        :: Corresponds to attribute <a element-attr for=feSpecularLighting>kernelUnitLength</a> on the given <a element>feSpecularLighting</a> element.
        : <dfn>kernelUnitLengthY</dfn>
        :: Corresponds to attribute <a element-attr for=feSpecularLighting>kernelUnitLength</a> on the given <a element>feSpecularLighting</a> element.
</div>

## Interface SVGFETileElement ## {#InterfaceSVGFETileElement}

The <dfn dfn-type=interface>SVGFETileElement</dfn> interface corresponds to the <a element>feTile</a> element.

<pre class=idl>
[Exposed=Window]
interface SVGFETileElement : SVGElement {
  readonly attribute SVGAnimatedString in1;
};

SVGFETileElement includes SVGFilterPrimitiveStandardAttributes;
</pre>

<div dfn-type=attribute dfn-for=SVGFETileElement>
    : Attributes:
    ::
        : <dfn>in1</dfn>
        :: Corresponds to attribute <a element-attr>in</a> on the given <a element>feTile</a> element.
</div>

## Interface SVGFETurbulenceElement ## {#InterfaceSVGFETurbulenceElement}

The <dfn dfn-type=interface>SVGFETurbulenceElement</dfn> interface corresponds to the <a element>feTurbulence</a> element.

<pre class=idl>
[Exposed=Window]
interface SVGFETurbulenceElement : SVGElement {

  // Turbulence Types
  const unsigned short SVG_TURBULENCE_TYPE_UNKNOWN = 0;
  const unsigned short SVG_TURBULENCE_TYPE_FRACTALNOISE = 1;
  const unsigned short SVG_TURBULENCE_TYPE_TURBULENCE = 2;

  // Stitch Options
  const unsigned short SVG_STITCHTYPE_UNKNOWN = 0;
  const unsigned short SVG_STITCHTYPE_STITCH = 1;
  const unsigned short SVG_STITCHTYPE_NOSTITCH = 2;

  readonly attribute SVGAnimatedNumber baseFrequencyX;
  readonly attribute SVGAnimatedNumber baseFrequencyY;
  readonly attribute SVGAnimatedInteger numOctaves;
  readonly attribute SVGAnimatedNumber seed;
  readonly attribute SVGAnimatedEnumeration stitchTiles;
  readonly attribute SVGAnimatedEnumeration type;
};

SVGFETurbulenceElement includes SVGFilterPrimitiveStandardAttributes;
</pre>

<div dfn-type=const dfn-for=SVGFETurbulenceElement>
    : Constants in group “Turbulence Types”:
    ::
        : <dfn>SVG_TURBULENCE_TYPE_UNKNOWN</dfn>
        :: The type is not one of predefined types. It is invalid to attempt to define a new value of this type or to attempt to switch an existing value to this type.
        : <dfn>SVG_TURBULENCE_TYPE_FRACTALNOISE</dfn>
        :: Corresponds to value ''fractalNoise''.
        : <dfn>SVG_TURBULENCE_TYPE_TURBULENCE</dfn>
        :: Corresponds to value ''turbulence''.
    : Constants in group “Stitch Options”:
    ::
        : <dfn>SVG_STITCHTYPE_UNKNOWN</dfn>
        :: The type is not one of predefined types. It is invalid to attempt to define a new value of this type or to attempt to switch an existing value to this type.
        : <dfn>SVG_STITCHTYPE_STITCH</dfn>
        :: Corresponds to value ''stitch''.
        : <dfn>SVG_STITCHTYPE_NOSTITCH</dfn>
        :: Corresponds to value ''noStitch''.
</div>

<div dfn-type=attribute dfn-for=SVGFETurbulenceElement>
    : Attributes:
    ::
        : <dfn>baseFrequencyX</dfn>
        :: Corresponds to attribute <a element-attr for=feTurbulence>baseFrequency</a> on the given <a element>feTurbulence</a> element. Contains the X component of the <a element-attr for=feTurbulence>baseFrequency</a> attribute.
        : <dfn>baseFrequencyY</dfn>
        :: Corresponds to attribute <a element-attr for=feTurbulence>baseFrequency</a> on the given <a element>feTurbulence</a> element. Contains the Y component of the <a element-attr for=feTurbulence>baseFrequency</a> attribute.
        : <dfn>numOctaves</dfn>
        :: Corresponds to attribute <a element-attr for=feTurbulence>numOctaves</a> on the given <a element>feTurbulence</a> element.
        : <dfn>seed</dfn>
        :: Corresponds to attribute <a element-attr for=feTurbulence>seed</a> on the given <a element>feTurbulence</a> element.
        : <dfn>stitchTiles</dfn>
        :: Corresponds to attribute <a element-attr for=feTurbulence>stitchTiles</a> on the given <a element>feTurbulence</a> element. Takes one of the SVG_TURBULENCE_TYPE_* constants defined on this interface.
        : <dfn>type</dfn>
        :: Corresponds to attribute <a element-attr for=feTurbulence>type</a> on the given <a element>feTurbulence</a> element. Takes one of the SVG_STITCHTYPE_* constants defined on this interface.
</div>
