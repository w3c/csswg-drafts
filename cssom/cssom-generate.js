(function() {
    var html5 = require('html5'),
        events = require('events'),
        util = require('util'),
        fs = require('fs');
    var output = '';
    var parser = new html5.Parser();
    var idl = null;
    function augmentIDL(idl) {
        return augmentIDLDefinitions(idl);
    }
    function augmentIDLDefinitions(idl) {
        for ( var i in idl ) {
            augmentIDLDefinition ( idl[i] );
        }
        return idl;
    }
    function augmentIDLDefinition(def) {
        if ( def && !! def.type ) {
            if ( def.type == 'interface' ) {
                augmentIDLInterface ( def );
            }
        }
    }
    function augmentIDLInterface(def) {
        augmentIDLConstructors(def);
    }
    function augmentIDLConstructors(def) {
        for ( var i in def.extAttrs ) {
            var xa = def.extAttrs[i];
            if ( !! xa.name && ( xa.name == 'Constructor' ) ) {
                def.members.push ( generateIDLConstructor ( def, xa ) );
            }
        }
        for ( var i in def.extAttrs ) {
            var xa = def.extAttrs[i];
            if ( !! xa.name && ( xa.name == 'NamedConstructor' ) ) {
                def.members.push ( generateIDLConstructor ( def, xa ) );
            }
        }
    }
    function generateIDLConstructor(def,xa) {
        return {
            type: 'constructor',
            idlType: def.name,
            name: xa.value || def.name,
            arguments: !! xa.arguments ? xa.arguments : [],
            raises: '',
            extAttrs: xa.extAttrs
        };
    }
    var eol = '\n';
    function needsEOL(ln,end) {
        if ( ( ln == 'html' ) && ! end ) {
            return eol;
        } else if ( ( ln == 'body' ) && end ) {
            return eol;
        } else {
            return '';
        }
    }
    var ANOLIS_BOOLEAN_ATTRIBUTES = [
        'data-anolis-ref'
    ];
    function isBooleanAttr(ln,n) {
        if ( ( html5.BOOLEAN_ATTRIBUTES [ ln ] || [] ).indexOf(n) != -1 ) {
            return true;
        } else if ( ANOLIS_BOOLEAN_ATTRIBUTES.indexOf(n) != -1 ) {
            return true;
        } else {
            return false;
        }
    }
    var rSub = new RegExp ( /^\{@([^\}]*)\}$/ );
    function getSubstitutionComment(comment) {
        var m = rSub.exec ( comment );
        if ( m && ( m.length > 1 ) ) {
            return m[1];
        } else {
            return null;
        }
    }
    function isIDLComment(comment) {
        var c = getSubstitutionComment ( comment );
        return c && ( c.search ( /^idl[a-zA-Z]*\([^\)]*\)$/ ) == 0 );
    }
    var rIdl = new RegExp ( /^(idl[a-zA-Z]*)\(([^\)]*)\)$/ );
    var rSep = new RegExp ( /\s*,\s*/ );
    function processIDLComment(comment) {
        var m = rIdl.exec ( getSubstitutionComment ( comment ) );
        if ( m && ( m.length > 2 ) ) {
            return formatIDLComment ( m[1], m[2].split(rSep) );
        } else {
            return '';
        }
    }
    function hasArg(args,arg,skip) {
        if ( skip === 'undefined' ) {
            skip = 0;
        }
        var n = 0;
        for ( var i in args ) {
            if ( n++ < skip ) {
                continue;
            } else {
                var a = args[i].split('=');
                if ( a[0] == arg ) {
                    return true;
                }
            }
        }
        return false;
    }
    function getArgValue(args,arg,skip) {
        if ( skip === 'undefined' ) {
            skip = 0;
        }
        var n = 0;
        for ( var i in args ) {
            if ( n++ < skip ) {
                continue;
            } else {
                var a = args[i].split('=');
                if ( a[0] == arg ) {
                    return ( a.length > 1 ) ? a[1] : '';
                }
            }
        }
        return '';
    }
    function formatIDLComment(method,args) {
        if ( method == 'idl' ) {
            return formatIDL ( args );
        } else if ( method == 'idlDoc' ) {
            return formatIDLDoc ( args );
        } else if ( method == 'idlDef' ) {
            return formatIDLDef ( args );
        } else if ( method == 'idlDocMembers' ) {
            return formatIDLDocMembers ( args );
        } else if ( method == 'idlPartials' ) {
            return formatIDLPartials ( args );
        } else {
            return '';
        }
    }
    function formatIDL(args) {
        var s = '';
        s += formatIDLDoc ( args );
        s += formatIDLDef ( args );
        s += formatIDLDocMembers ( args );
        s += formatIDLPartials ( args );
        return s;
    }
    function findIDL(name, includePartials) {
        for ( var i in idl ) {
            var d = idl[i];
            if ( ( d.type == 'partialinterface' ) && !includePartials )
                continue;
            if ( !! d.name && ( d.name == name ) ) {
                return d;
            } else if ( !! d.target && ( d.target == name ) ) {
                return d;
            }
        }
        return null;
    }
    function formatIDLDef(args) {
        var d = findIDL ( args[0] );
        if ( d ) {
            return formatIDLDefinition ( d, args );
        } else {
            return '';
        }
    }
    function formatIDLDefinition(def,args) {
        var t = def.type;
        if ( t == 'interface' ) {
            return formatIDLInterface ( def, false, args );
        } else if ( t == 'partialinterface' ) {
            return formatIDLInterface ( def, true, args );
        } else if ( t == 'typedef' ) {
            return formatIDLTypedef ( def, args );
        } else if ( t == 'implements' ) {
            return formatIDLImplements ( def, args );
        } else {
            return '[[TBD - ' + t + ']]';
        }
    }
    function formatIDLInterface(def,partial,args) {
        var n = def.name;
        var x = def.inheritance;
        var s = '';
        s += eol;
        s += eltStart ( 'pre', [ newAttr ( 'class', 'idl' ) ], false );
        s += eltStart ( 'span', [ newAttr ( 'class', 'idlInterface' ), newAttr ( 'id', generateIDLDefinitionID ( def ) ) ], false );
        s += formatIDLExtendedAttributes ( def, args, true );
        if ( partial ) {
            s += 'partial ';
        }
        s += 'interface ';
        s += eltStart ( 'span', [ newAttr ( 'class', 'idlInterfaceID' ) ], false );
        s += n;
        s += eltEnd ( 'span', false );
        if ( x && ( x.length > 0 ) ) {
            s += ' : ';
            var xti = 0;
            for ( var i in x ) {
                var xt = x [ i ];
                if ( xti++ > 0 ) {
                    s += ', ';
                }
                s += eltStart ( 'span', [ newAttr ( 'class', 'idlSuperclass' ) ], false );
                s += formatNamedIDLDefinitionNameAsLink ( xt );
                s += eltEnd ( 'span', false );
            }
        }
        s += ' {' + eol;
        for ( var i in def.members ) {
            var m = def.members [ i ];
            var f = formatIDLMember ( def, m, args );
            if ( f != '' ) {
                s += f + eol;
            }
        }
        s += '};';
        s += eltEnd ( 'span', false );
        s += eltEnd ( 'pre', true );
        return s;
    }
    function formatIDLExtendedAttributes(def,args,useEol) {
        var s = '';
        var numExposed = 0;
        for ( var i in def.extAttrs ) {
            var ea = def.extAttrs[i];
            if ( isExposedExtendedAttribute ( ea ) ) {
                numExposed++;
            }
        }
        if ( numExposed > 0 ) {
            s += '[';
        }
        var numOutput = 0;
        for ( var i in def.extAttrs ) {
            var ea = def.extAttrs[i];
            if ( isExposedExtendedAttribute ( ea ) ) {
                if ( numOutput > 0 ) {
                    s += ',' + eol + ' ';
                }
                s += ea.name;
                if ( !! ea.value ) {
                    s += '=';
                    if ( isIDLIdentifier ( ea.value ) ) {
                        s += ea.value;
                        s += formatIDLExtendedAttributesArguments ( ea );
                    } else {
                        s += '"' + ea.value + '"';
                    }
                } else if ( !! ea.arguments ) {
                    s += formatIDLExtendedAttributesArguments ( ea );
                }
                numOutput++;
            }
        }
        if ( numExposed > 0 ) {
            if (useEol) {
                if ( numOutput > 1 ) {
                    s += eol;
                }
                s += ']' + eol;
            } else {
                s += ']' + ' ';
            }
        }
        return s;
    }
    function isIDLIdentifier(s) {
        for ( var i = 0, n = s.length; i < n; i++ ) {
            var c = s.charAt(i);
            if ( ( c >= 'A' ) && ( c <= 'Z' ) ) {
                continue;
            } else if ( ( c >= 'a' ) && ( c <= 'z' ) ) {
                continue;
            } else if ( ( i > 0 ) && ( c >= '0' ) && ( c <= '9' ) ) {
                continue;
            } else {
                return false;
            }
        }
        return true;
    }
    function isExposedExtendedAttribute(ea) {
        var n = ea.name;
        if ( n == 'ArrayClass' ) {
            return true;
        } else if ( n == 'Clamp' ) {
            return true;
        } else if ( n == 'Constructor' ) {
            return true;
        } else if ( n == 'EnforceRange' ) {
            return true;
        } else if ( n == 'ImplicitThis' ) {
            return true;
        } else if ( n == 'LenientThis' ) {
            return true;
        } else if ( n == 'NamedConstructor' ) {
            return true;
        } else if ( n == 'NoInterfaceObject' ) {
            return true;
        } else if ( n == 'OverrideBuiltins' ) {
            return true;
        } else if ( n == 'PutForwards' ) {
            return true;
        } else if ( n == 'Replaceable' ) {
            return true;
        } else if ( n == 'NamedPropertiesObject' ) {
            return true;
        } else if ( n == 'TreatNonCallableAsNull' ) {
            return true;
        } else if ( n == 'TreatNullAs' ) {
            return true;
        } else if ( n == 'TreatUndefinedAs' ) {
            return true;
        } else if ( n == 'Unforgeable' ) {
            return true;
        } else {
            return false;
        }
    }
    function formatIDLExtendedAttributesArguments(ea) {
        var s = '';
        if ( !! ea.arguments && ( ea.arguments.length > 0 ) ) {
            s += '(';
            for ( var i in ea.arguments ) {
                var a = ea.arguments[i];
                if ( i > 0 ) {
                    s += ',';
                }
                s += a.type.idlType;
                s += ' ';
                s += a.name;
            }
            s += ')';
        }
        return s;
    }
    function formatIDLMember(def, mem, args) {
        if ( mem.type == 'const' ) {
            return formatIDLConstMember ( def, mem, args );
        } else if ( mem.type == 'attribute' ) {
            return formatIDLAttrMember ( def, mem, args );
        } else if ( mem.type == 'operation' ) {
            return formatIDLOperMember ( def, mem, args );
        } else {
            return '';
        }
    }
    function formatIDLConstMember(def, mem, args) {
        var n = mem.name;
        var s = '';
        s += eltStart ( 'span', [ newAttr ( 'class', 'idlConst' ) ], false );
        s += '    ';
        s += formatIDLExtendedAttributes ( mem, args, false );
        s += 'const ';
        s += formatIDLConstType ( def, mem, mem.idlType, false, args );
        s += ' ';
        s += eltStart ( 'span', [ newAttr ( 'class', 'idlConstName' ) ], false );
        s += eltStart ( 'a', [ newAttr ( 'href', generateIDLConstIDRef ( def, mem ) ) ], false );
        s += n;
        s += eltEnd ( 'a', false );
        s += eltEnd ( 'span', false );
        if ( !! mem.value ) {
            s += ' = ';
            s += eltStart ( 'span', [ newAttr ( 'class', 'idlConstValue' ) ], false );
            s += mem.value;
            s += eltEnd ( 'span', false );
        }
        s += ';';
        s += eltEnd ( 'span', false );
        return s;
    }
    function formatIDLAttrMember(def, mem, args) {
        var n = mem.name;
        var s = '';
        s += eltStart ( 'span', [ newAttr ( 'class', 'idlAttribute' ) ], false );
        s += '    ';
        s += formatIDLExtendedAttributes ( mem, args, false );
        if ( mem.stringifier ) {
            s += 'stringifier ';
        }
        if ( mem.readonly ) {
            s += 'readonly ';
        }
        s += 'attribute ';
        s += formatIDLAttrType ( def, mem, mem.idlType, false, args );
        s += ' ';
        s += eltStart ( 'span', [ newAttr ( 'class', 'idlAttrName' ) ], false );
        s += eltStart ( 'a', [ newAttr ( 'href', generateIDLAttrIDRef ( def, mem ) ) ], false );
        s += n;
        s += eltEnd ( 'a', false );
        s += eltEnd ( 'span', false );
        s += ';';
        s += eltEnd ( 'span', false );
        return s;
    }
    function generateIDRef ( id ) {
        return '#' + id;
    }
    var IDL_ID_PREFIX = 'widl';
    function generateIDLDefinitionID(def) {
        return IDL_ID_PREFIX + '-def-' + def.name;
    }
    function generateIDLMemberID(def, mem, args) {
        if ( mem.type == 'const' ) {
            return generateIDLConstID ( def, mem, args );
        } else if ( mem.type == 'attribute' ) {
            return generateIDLAttrID ( def, mem, args );
        } else if ( mem.type == 'operation' ) {
            return generateIDLOperID ( def, mem, false, args );
        } else if ( mem.type == 'constructor' ) {
            return generateIDLOperID ( def, mem, false, args );
        } else {
            return '';
        }
    }
    function generateIDLConstID(def, mem, args) {
        return IDL_ID_PREFIX + '-' + def.name + '-' + mem.name;
    }
    function generateIDLConstIDRef(def, mem, args) {
        return generateIDRef ( generateIDLConstID ( def, mem, args ) );
    }
    function formatIDLConstType(def, mem, type, verbose, args) {
        return formatIDLType ( def, mem, type, 'idlConstType', verbose, args );
    }
    function formatIDLConstSignature(def, mem, verbose, args) {
        var s = '';
        s += ' ';
        s += formatIDLConstType ( def, mem, mem.idlType, verbose, args );
        if ( !! mem.value ) {
            s += ', with value ';
            s += mem.value;
        }
        return s;
    }
    function generateIDLAttrID(def, mem, args) {
        return IDL_ID_PREFIX + '-' + def.name + '-' + mem.name;
    }
    function generateIDLAttrIDRef(def, mem, args) {
        return generateIDRef ( generateIDLAttrID ( def, mem, args ) );
    }
    function formatIDLAttrType(def, mem, type, verbose, args) {
        return formatIDLType ( def, mem, type, 'idlAttrType', verbose, args );
    }
    function formatIDLAttrSignature(def, mem, verbose, args) {
        var s = '';
        s += ' ';
        s += formatIDLAttrType ( def, mem, mem.idlType, verbose, args );
        return s;
    }
    function formatIDLOperMember(def, mem, args) {
        var n = mem.name;
        var s = '';
        s += eltStart ( 'span', [ newAttr ( 'class', 'idlMethod' ) ], false );
        s += '    ';
        s += formatIDLExtendedAttributes ( mem, args, false );
        s += formatIDLOperType ( def, mem, mem.idlType, false, args );
        s += ' ';
        s += eltStart ( 'span', [ newAttr ( 'class', 'idlMethName' ) ], false );
        s += eltStart ( 'a', [ newAttr ( 'href', generateIDLOperIDRef ( def, mem, args ) ) ], false );
        s += n;
        s += eltEnd ( 'a', false );
        s += eltEnd ( 'span', false );
        s += ' (';
        for ( var i in mem.arguments ) {
            var p = mem.arguments [ i ];
            if ( i > 0 ) {
                s += ', ';
            }
            s += formatIDLOperParam ( def, mem, p, i, false, args );
        }
        s += ')';
        s += ';';
        s += eltEnd ( 'span', false );
        return s;
    }
    function formatIDLOperSignature(def, mem, includeReturnType, args) {
        var s = '';
        s += ' (';
        for ( var i in mem.arguments ) {
            var p = mem.arguments [ i ];
            if ( i > 0 ) {
                s += ', ';
            }
            s += formatIDLOperParam ( def, mem, p, i, false, args );
        }
        s += ')';
        if ( !! includeReturnType ) {
            s += ', returns ';
            s += formatIDLOperType ( def, mem, mem.idlType, false, args );
        }
        return s;
    }
    function generateIDLOperID(def, mem, verbose, args) {
        var s = '';
        s += IDL_ID_PREFIX;
        s += '-';
        s += def.name;
        if ( mem.type == 'operation' ) {
            s += '-';
            s += mem.name;
            if ( ( mem.idlType != 'void' ) || ( mem.arguments.length > 0 ) ) {
                s += '-';
                s += generateIDLOperTypeID ( def, mem, mem.idlType, verbose, args );
            }
        }
        if ( !! mem.arguments && ( mem.arguments.length > 0 ) ) {
            for ( var i in mem.arguments ) {
                var p = mem.arguments [ i ];
                s += '-';
                s += generateIDLOperParamID ( def, mem, p, verbose, args );
            }
        } else if ( mem.type == 'constructor' ) {
            s += '-void';
        }
        return s;
    }
    function generateIDLOperIDRef(def, mem, args) {
        return '#' + generateIDLOperID ( def, mem, false, args );
    }
    function formatIDLOperType(def, mem, type, verbose, args) {
        return formatIDLType ( def, mem, type, 'idlMethType', verbose, args );
    }
    function generateIDLOperTypeID(def, mem, type, verbose, args) {
        return generateIDLTypeID ( def, mem, type, verbose, args );
    }
    function formatIDLOperParam(def, mem, param, index, excludeParamName, args) {
        var s = '';
        s += eltStart ( 'span', [ newAttr ( 'class', 'idlParam' ) ], false );
        if ( !! param.optional ) {
            s += 'optional ';
        }
        s += formatIDLParamType ( def, mem, param.type, false, args );
        if ( ! excludeParamName ) {
            s += ' ';
            s += eltStart ( 'span', [ newAttr ( 'class', 'idlParamName' ) ], false );
            s += param.name;
            s += eltEnd ( 'span', false );
        }
        s += eltEnd ( 'span', false );
        return s;
    }
    function generateIDLOperParamID(def, mem, param, verbose, args) {
        var s = '';
        s += generateIDLTypeID ( def, mem, param.type, verbose, args );
        s += '-';
        s += param.name;
        return s;
    }
    function formatIDLParamType(def, mem, type, verbose, args) {
        return formatIDLType ( def, mem, type, 'idlParamType', verbose, args );
    }
    function formatIDLType(def, mem, type, cssClass, verbose, args) {
        var s = '';
        if ( !! verbose ) {
            s += 'of type ';
        }
        if ( !! cssClass ) {
            s += eltStart ( 'span', [ newAttr ( 'class', cssClass ) ], false );
        }
        s += eltStart ( 'a', [], false );
        s += type.idlType || type;
        s += eltEnd ( 'a', false );
        if ( !! type.nullable ) {
            s += '?';
        }
        if ( !! type.array ) {
            s += '[]';
        }
        if ( !! cssClass ) {
            s += eltEnd ( 'span', false );
        }
        if ( !! verbose ) {
            if ( !! mem.readonly ) {
                s += ', readonly';
            }
            if ( !! mem.nullable ) {
                s += ', nullable';
            }
        }
        return s;
    }
    function generateIDLTypeID(def, mem, type, verbose, args) {
        return hyphenateForID ( type.idlType || type );
    }
    function hyphenateForID(token) {
        var t = token;
        t = t.replace ( / /g, '-' );
        t = t.replace ( /_/g, '-' );
        return t;
    }
    function formatIDLTypedef(def,partial,args) {
        var s = '';
        s += eol;
        s += eltStart ( 'pre', [ newAttr ( 'class', 'idl' ) ], false );
        s += '[[TBD - TYPEDEF]]\n';
        s += eltEnd ( 'pre', true );
        return s;
    }
    function formatIDLImplements(def,partial,args) {
        var s = '';
        s += eol;
        s += eltStart ( 'pre', [ newAttr ( 'class', 'idl' ) ], false );
        s += '[[TBD - IMPLEMENTS]]\n';
        s += eltEnd ( 'pre', true );
        return s;
    }
    function generateIDLOtherID(def, mem) {
        var s = '';
        s += IDL_ID_PREFIX;
        s += '-';
        s += def.name;
        if ( mem ) {
            s += '-';
            s += mem.name;
        }
        return s;
    }
    function getIDLMemberID(def,mem,args) {
        if ( mem.type == 'const' ) {
            return generateIDLConstID ( def, mem, args );
        } else if ( mem.type == 'attribute' ) {
            return generateIDLAttrID ( def, mem, args );
        } else if ( mem.type == 'operation' ) {
            return generateIDLOperID ( def, mem, false, args );
        } else if ( mem.type == 'constructor' ) {
            return generateIDLOperID ( def, mem, false, args );
        } else {
            return generateIDLOtherID ( def, mem, args );
        }
    }
    function getIDLMemberCSSClass(def,mem,args) {
        if ( mem.type == 'const' ) {
            return 'idlConstant';
        } else if ( mem.type == 'attribute' ) {
            return 'idlAttribute';
        } else if ( mem.type == 'operation' ) {
            return 'idlMethod';
        } else if ( mem.type == 'constructor' ) {
            return 'idlConstructor';
        } else {
            return 'unknown';
        }
    }
    function getIDLMemberTermCSSClass(def,mem,args) {
        if ( mem.type == 'const' ) {
            return 'constant';
        } else if ( mem.type == 'attribute' ) {
            return 'attribute';
        } else if ( mem.type == 'operation' ) {
            return 'method';
        } else if ( mem.type == 'constructor' ) {
            return 'constructor';
        } else {
            return 'unknown';
        }
    }
    function getIDLMembersHeader(cssClass) {
        if ( cssClass == 'attributes' ) {
            return 'Attributes';
        } else if ( cssClass == 'constants' ) {
            return 'Constants';
        } else if ( cssClass == 'constructors' ) {
            return 'Constructors';
        } else if ( cssClass == 'members' ) {
            return 'Members';
        } else if ( cssClass == 'methods' ) {
            return 'Methods';
        } else {
            return '[TBD] - Unmapped CSS Class - ' + cssClass;
        }
    }
    function wrap(s,en,getAttrs,newLine,def,mem,args) {
        var sNew = '';
        sNew += eltStart ( en, !! getAttrs ? getAttrs ( def, mem, args ) : [], newLine );
        sNew += s;
        sNew += eltEnd ( en, newLine );
        return sNew;
    }
    function join(strings,sep) {
        var s = '';
        for ( var i in strings ) {
            if ( sep && ( s.length > 0 ) ) {
                s += sep;
            }
            s += strings[i];
        }
        return s;
    }
    var rKeyPattern = new RegExp ( /(\{@[^\}]*\})/ );
    var rKey = new RegExp ( /\{@([^\}]*)\}/ );
    function performKeywordSubs(s,subs) {
        var sa = s.split ( rKeyPattern );
        for ( var i in sa ) {
            var p = sa[i];
            var m = rKey.exec ( p );
            if ( m && ( m.length > 1 ) ) {
                var k = m[1];
                if ( subs && !! subs[k] ) {
                    sa[i] = subs[k];
                }
            }
        }
        return join ( sa );
    }
    function formatIDLDoc(args, ignorePartials) {
        var d = findIDL ( args[0] );
        if ( d ) {
            return formatIDLDefinitionDoc ( d, args );
        } else {
            return '';
        }
    }
    function formatIDLDefinitionDoc(def,args) {
        for ( var i in def.extAttrs ) {
            var xa = def.extAttrs[i];
            if ( !! xa.name && ( xa.name == 'Documentation' ) ) {
                return performKeywordSubs ( xa.value || '', collectIDLDefinitionKeywords ( def, args ) );
            }
        }
        return '';
    }
    function getIDLConstructorCount(def) {
        return !! def.constructors ? def.constructors.length : 0;
    }
    function collectIDLDefinitionKeywords(def,args) {
        return {
            type: def.type,
            name: formatAsCode ( def.name ),
            link: formatIDLDefinitionNameAsLink ( def, args ),
            memberCount: !! def.members ? def.members.length : 0,
            constructorCount: countConstructorMembers ( def, args )
        };
    }
    function formatIDLDefinitionNameAsLink(def,args) {
        return formatAsLink ( def.name, 'idlType', generateIDRef ( generateIDLDefinitionID ( def, args ) ), args );
    }
    function formatNamedIDLDefinitionNameAsLink(name,args) {
        if ( name ) {
            var d = findIDL ( name );
            if ( d ) {
                return formatIDLDefinitionNameAsLink ( d, args );
            } else {
                return formatAsCode ( name );
            }
        } else {
            return '';
        }
    }
    function formatIDLDocMembers(args, ignorePartials) {
        var d = findIDL ( args[0] );
        if ( d ) {
            return formatIDLDefinitionDocMembers ( d, args );
        } else {
            return '';
        }
    }
    function formatIDLDefinitionDocMembers(def,args) {
        if ( hasArg ( args, 'uncollatedMembers' ) ) {
            return formatIDLDefinitionDocMembersUncollated ( def, args );
        } else {
            return formatIDLDefinitionDocMembersCollated ( def, args );
        }
    }
    function countConstMembers(def,args) {
        return countMembers ( 'const', def, args );
    }
    function countAttrMembers(def,args) {
        return countMembers ( 'attribute', def, args );
    }
    function countOperMembers(def,args) {
        return countMembers ( 'operation', def, args );
    }
    function countConstructorMembers(def,args) {
        return countMembers ( 'constructor', def, args );
    }
    function countMembers(type,def,args) {
        var n = 0;
        for ( var i in def.members ) {
            var m = def.members[i];
            if ( m.type == type ) {
                n++;
            }
        }
        return n;
    }
    function formatIDLDefinitionDocMembersCollated(def,args) {
        var s = '';
        if ( countConstructorMembers ( def, args ) > 0 ) {
            s += formatIDLDefinitionDocConstructorMembers ( def, args );
        }
        if ( countConstMembers ( def, args ) > 0 ) {
            s += formatIDLDefinitionDocConstMembers ( def, args );
        }
        if ( countAttrMembers ( def, args ) > 0 ) {
            s += formatIDLDefinitionDocAttrMembers ( def, args );
        }
        if ( countOperMembers ( def, args ) > 0 ) {
            s += formatIDLDefinitionDocOperMembers ( def, args );
        }
        return s;
    }
    function formatIDLDefinitionDocMembersUncollated(def,args) {
        return formatIDLDefinitionDocAllMembers ( def, args );
    }
    function formatIDLDefinitionDocConstMembers(def,args) {
        return formatIDLDefinitionDocMembersByType ( 'const', def, args );
    }
    function formatIDLDefinitionDocAttrMembers(def,args) {
        return formatIDLDefinitionDocMembersByType ( 'attribute', def, args );
    }
    function formatIDLDefinitionDocOperMembers(def,args) {
        return formatIDLDefinitionDocMembersByType ( 'operation', def, args );
    }
    function formatIDLDefinitionDocConstructorMembers(def,args) {
        return formatIDLDefinitionDocMembersByType ( 'constructor', def, args );
    }
    function formatIDLDefinitionDocAllMembers(def,args) {
        return formatIDLDefinitionDocMembersByType ( null, def, args );
    }
    function getIDLDefinitionListCSSClass(type) {
        if ( type == 'const' ) {
            return 'constants';
        } else if ( type == 'attribute' ) {
            return 'attributes';
        } else if ( type == 'operation' ) {
            return 'methods';
        } else if ( type == 'constructor' ) {
            return 'constructors';
        } else {
            return 'members';
        }
    }
    function formatIDLDefinitionDocMembersByType(type,def,args) {
        var s = '';
        var c = getIDLDefinitionListCSSClass ( type );
        s += formatIDLDefinitionDocMembersHeader ( type, def, args, c );
        s += eltStart ( 'dl', [ newAttr ( 'class', c ) ], true );
        for ( var i in def.members ) {
            var m = def.members[i];
            if ( ! type || ( m.type == type ) ) {
                s += formatIDLMemberTerm ( def, m, args );
                s += formatIDLMemberDefinition ( def, m, args );
            }
        }
        s += eltEnd ( 'dl', true );
        return s;
    }
    function formatIDLDefinitionDocMembersHeader(type,def,args,cssClass) {
        var s = '';
        if ( hasArg ( args, 'level' ) ) {
            var level = parseInt ( getArgValue ( args, 'level' ) ) + 1;
            var heading = 'h' + level;
            s += eltStart ( heading, [ newAttr ( 'class', 'no-toc' ), newAttr ( 'id', generateIDLOtherID ( def ) + '-' + cssClass ) ], false );
            s += getIDLMembersHeader ( cssClass );
            s += eltEnd ( heading, true );
        }
        return s;
    }
    function formatIDLMemberTerm(def,mem,args) {
        var getDTAttrs = function(def,mem,args) {
            return [ newAttr ( 'class', getIDLMemberTermCSSClass ( def, mem, args ) ), newAttr ( 'id', getIDLMemberID ( def, mem, args ) ) ];
        };
        return wrap ( formatIDLMemberTermContent ( def, mem, args ), 'dt', getDTAttrs, true, def, mem, args );
    }
    function formatIDLMemberTermContent(def,mem,args) {
        var s = formatAsCode ( mem.name );
        if ( mem.type == 'const' ) {
            s += formatIDLConstSignature ( def, mem, true, args );
        } else if ( mem.type == 'attribute' ) {
            s += formatIDLAttrSignature ( def, mem, true, args );
        } else if ( mem.type == 'operation' ) {
            s += formatIDLOperSignature ( def, mem, true, args );
        } else if ( mem.type == 'constructor' ) {
            s += formatIDLOperSignature ( def, mem, false, args );
        }
        return s;
    }
    function wrapIDLMemberDD(s,def,mem,args) {
        return wrap ( s, 'dd', null, true, def, mem, args );
    }
    function formatIDLMemberDefinition(def,mem,args) {
        for ( var i in mem.extAttrs ) {
            var xa = mem.extAttrs[i];
            if ( !! xa.name && ( xa.name == 'Documentation' ) ) {
                return wrapIDLMemberDD ( performKeywordSubs ( xa.value || '', collectIDLMemberKeywords ( def, mem, args ) ), def, mem, args );
            }
        }
        return '';
    }
    function getIDLOperParamsSignature(mem,sep) {
        var s = '';
        for ( var i in mem.arguments ) {
            var a = mem.arguments[i];
            if ( sep && ( s.length > 0 ) ) {
                s += sep;
            }
        }
        return s;
    }
    function getIDLMemberSignature(mem) {
        if ( mem.type == 'operation' ) {
            return '(' + getIDLOperParamsSignature ( mem, ',' ) + ')';
        } else if ( mem.type == 'constructor' ) {
            return '(' + getIDLOperParamsSignature ( mem, ',' ) + ')';
        } else {
            return '';
        }
    }
    function collectIDLMemberKeywords(def,mem,args) {
        return {
            type: mem.type,
            name: formatAsCode ( mem.name ),
            link: formatIDLMemberNameAsLink ( def, mem, args ),
            signature: getIDLMemberSignature ( mem )
        };
    }
    function formatIDLMemberNameAsLink(def,mem,args) {
        return formatAsLink ( mem.name, getIDLMemberCSSClass ( def, mem, args ), generateIDRef ( generateIDLMemberID ( def, mem, args ) ), args );
    }
    function findIDLPartials(name) {
        var partials = [];
        for ( var i in idl ) {
            var d = idl[i];
            if ( d.type != 'partialinterface' ) {
                continue;
            } else if ( !! d.name && ( d.name == name ) ) {
                partials.push(d);
            }
        }
        return partials;
    }
    function formatIDLPartial(d, args) {
        var s = '';
        s += formatIDLDefinitionDoc ( d, args );
        s += formatIDLDefinition ( d, args );
        s += formatIDLDefinitionDocMembers ( d, args );
        return s;
    }
    function formatIDLPartials(args) {
        var s = '';
        var partials = findIDLPartials ( args[0] );
        for ( var i in partials ) {
            s += formatIDLPartial ( partials[i], args );
        }
        return s;
    }
    function newAttr(n,v) {
        return { nodeName: n, nodeValue: v };
    }
    function eltStartMaybeEmpty(ln,attrs,empty,newLine) {
        var s = '<' + ln;
        for ( var i in attrs ) {
            var a = attrs[i];
            s += ' ' + formatAttr ( a, ln );
        }
        if ( empty ) {
            s += '/';
        }
        s += '>' + ( newLine ? eol : '' );
        return s;
    }
    function eltEmpty(ln,attrs,newLine) {
        return eltStartMaybeEmpty(ln,attrs,true,newLine);
    }
    function eltStart(ln,attrs,newLine) {
        return eltStartMaybeEmpty(ln,attrs,false,newLine);
    }
    function eltEnd(ln,newLine) {
        var s = '</' + ln + '>' + ( newLine ? eol : '' );
        return s;
    }
    function formatAsCode(s) {
        return wrap ( s, 'code' );
    }
    function formatAsLink(inner,cssClass,href,args) {
        var s = '';
        var aa = [];
        if ( !! cssClass ) {
            aa.push ( newAttr ( 'class', cssClass ) );
        }
        if ( !! href ) {
            aa.push ( newAttr ( 'href', href ) );
        }
        s += eltStart ( 'a', aa );
        s += formatAsCode ( inner );
        s += eltEnd ( 'a' );
        return s;
    }
    var rQuote = new RegExp ( '[' + html5.SPACE_CHARACTERS_IN + '<=>\'\"' + ']' );
    var alwaysQuote = true;
    function formatAttr(a,ln) {
        var n = a.nodeName;
        var v = a.nodeValue;
        var s = n;
        if ( ! isBooleanAttr ( ln, n ) ) {
            var quote = alwaysQuote || ( v.length == 0 ) || rQuote.test ( v );
            s += '=';
            if ( quote ) {
                s += '"';
            }
            v = v.replace ( /&/g, '&amp;' );
            v = v.replace ( /\"/g, '&quot;' );
            v = v.replace ( /</g, '&lt;' );
            v = v.replace ( />/g, '&gt;' );
            s += v;
            if ( quote ) {
                s += '"';
            }
        }
        return s;
    }
    function formatChars(chars,ln) {
        var newChars = chars;
        newChars = newChars.replace ( /&/g, '&amp;' );
        newChars = newChars.replace ( /</g, '&lt;' );
        newChars = newChars.replace ( />/g, '&gt;' );
        return newChars;
    }
    var $ = {
        ondata : function(data) {
            output += data;
        },
        ontoken : function(token) {
            if ( token.type == 'Doctype' ) {
                $.ondata ( '<!DOCTYPE ' + token.name.toLowerCase() + '>' + eol );
            } else if ( ( token.type == 'Characters' ) || ( token.type == 'SpaceCharacters' ) ) {
                $.ondata ( formatChars ( token.data ) );
            } else if ( ( token.type == 'StartTag' ) || ( token.type == 'EmptyTag' ) ) {
                var ln = token.name.toLowerCase();
                var attrs = [];
                for ( var i = 0, n = token.data.length; i < n; i++ ) {
                    attrs.push(token.data.item(i));
                }
                var attributes = '';
                for ( var i in attrs ) {
                    var a = attrs [ i ];
                    attributes += ' ' + formatAttr ( a, ln );
                }
                $.ondata ( '<' + ln + attributes + ( ( token.type == 'EmptyTag' ) ? '/' : '' ) + '>' + needsEOL ( ln, false ) );
            } else if ( token.type == 'EndTag' ) {
                var ln = token.name.toLowerCase();
                $.ondata ( '</' + ln + '>' + needsEOL ( ln, true ) );
            } else if ( token.type == 'Comment' ) {
                if ( isIDLComment ( token.data ) ) {
                    $.ondata ( processIDLComment ( token.data ) );
                } else {
                    $.ondata ( '<!--' + token.data + '-->' );
                }
            } else {
            }
        },
        onend : function() {
            new html5.TreeWalker ( parser.tree.document, $.ontoken );
            util.puts ( output );
        },
        run : function(argv) {
            var argc = argv.length - 2;
            if ( argc < 1 ) {
                util.error ( "Error: Missing JSONFILE argument." );
                process.exit(2);
            } else if ( argc < 2 ) {
                util.error ( "Error: Missing INPUTFILE argument." );
                process.exit(2);
            } else {
              try {
                  var jsonFile = argv[argc++];
                  var inFile = argv[argc++];
                  var sIdl = fs.readFileSync ( jsonFile, 'utf8' );
                  idl = augmentIDL ( JSON.parse ( sIdl ) );
                  var sDoc = fs.createReadStream ( inFile );
                  parser.on ( 'end', $.onend );
                  parser.parse ( sDoc );
              } catch ( e ) {
                  util.error ( util.inspect ( e ) );
                  process.exit(1);
              }
            }
        }
    };
    $.run ( process.argv );
})();