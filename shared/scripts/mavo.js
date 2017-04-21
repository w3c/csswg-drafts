!function(){"use strict";function t(e,r,s){return r=void 0===r?1:r,s=s||r+1,1>=s-r?function(){if(arguments.length<=r||"string"===n.type(arguments[r]))return e.apply(this,arguments);var t,s=arguments[r];for(var i in s){var o=Array.from(arguments);o.splice(r,1,i,s[i]),t=e.apply(this,o)}return t}:t(t(e,r+1,s),r,s-1)}function e(t,n,s){var i=r(s);if("string"===i){var o=Object.getOwnPropertyDescriptor(n,s);!o||o.writable&&o.configurable&&o.enumerable&&!o.get&&!o.set?t[s]=n[s]:(delete t[s],Object.defineProperty(t,s,o))}else if("array"===i)s.forEach(function(r){r in n&&e(t,n,r)});else for(var a in n)s&&("regexp"===i&&!s.test(a)||"function"===i&&!s.call(n,a))||e(t,n,a);return t}function r(t){if(null===t)return"null";if(void 0===t)return"undefined";var e=(Object.prototype.toString.call(t).match(/^\[object\s+(.*?)\]$/)[1]||"").toLowerCase();return"number"==e&&isNaN(t)?"nan":e}var n=self.Bliss=e(function(t,e){return 2==arguments.length&&!e||!t?null:"string"===n.type(t)?(e||document).querySelector(t):t||null},self.Bliss);e(n,{extend:e,overload:t,type:r,property:n.property||"_",sources:{},noop:function(){},$:function(t,e){return t instanceof Node||t instanceof Window?[t]:2!=arguments.length||e?Array.from("string"==typeof t?(e||document).querySelectorAll(t):t||[]):[]},defined:function(){for(var t=0;t<arguments.length;t++)if(void 0!==arguments[t])return arguments[t]},create:function(t,e){return t instanceof Node?n.set(t,e):(1===arguments.length&&("string"===n.type(t)?e={}:(e=t,t=e.tag,e=n.extend({},e,function(t){return"tag"!==t}))),n.set(document.createElement(t||"div"),e))},each:function(t,e,r){r=r||{};for(var n in t)r[n]=e.call(t,n,t[n]);return r},ready:function(t){return t=t||document,new Promise(function(e,r){"loading"!==t.readyState?e():t.addEventListener("DOMContentLoaded",function(){e()})})},Class:function(t){var e,r=["constructor","extends","abstract","static"].concat(Object.keys(n.classProps)),s=t.hasOwnProperty("constructor")?t.constructor:n.noop;2==arguments.length?(e=arguments[0],t=arguments[1]):(e=function(){if(this.constructor.__abstract&&this.constructor===e)throw new Error("Abstract classes cannot be directly instantiated.");e["super"]&&e["super"].apply(this,arguments),s.apply(this,arguments)},e["super"]=t["extends"]||null,e.prototype=n.extend(Object.create(e["super"]?e["super"].prototype:Object),{constructor:e}),e.prototype["super"]=e["super"]?e["super"].prototype:null,e.__abstract=!!t["abstract"]);var i=function(t){return this.hasOwnProperty(t)&&-1===r.indexOf(t)};if(t["static"]){n.extend(e,t["static"],i);for(var o in n.classProps)o in t["static"]&&n.classProps[o](e,t["static"][o])}n.extend(e.prototype,t,i);for(var o in n.classProps)o in t&&n.classProps[o](e.prototype,t[o]);return e},classProps:{lazy:t(function(t,e,r){return Object.defineProperty(t,e,{get:function(){var t=r.call(this);return Object.defineProperty(this,e,{value:t,configurable:!0,enumerable:!0,writable:!0}),t},set:function(t){Object.defineProperty(this,e,{value:t,configurable:!0,enumerable:!0,writable:!0})},configurable:!0,enumerable:!0}),t}),live:t(function(t,e,r){return"function"===n.type(r)&&(r={set:r}),Object.defineProperty(t,e,{get:function(){var t=this["_"+e],n=r.get&&r.get.call(this,t);return void 0!==n?n:t},set:function(t){var n=this["_"+e],s=r.set&&r.set.call(this,t,n);this["_"+e]=void 0!==s?s:t},configurable:r.configurable,enumerable:r.enumerable}),t})},include:function(){var t=arguments[arguments.length-1],e=2===arguments.length?arguments[0]:!1,r=document.createElement("script");return e?Promise.resolve():new Promise(function(e,s){n.set(r,{async:!0,onload:function(){e(),n.remove(r)},onerror:function(){s()},src:t,inside:document.head})})},fetch:function(t,r){if(!t)throw new TypeError("URL parameter is mandatory and cannot be "+t);var s=e({url:new URL(t,location),data:"",method:"GET",headers:{},xhr:new XMLHttpRequest},r);s.method=s.method.toUpperCase(),n.hooks.run("fetch-args",s),"GET"===s.method&&s.data&&(s.url.search+=s.data),document.body.setAttribute("data-loading",s.url),s.xhr.open(s.method,s.url.href,s.async!==!1,s.user,s.password);for(var i in r)if(i in s.xhr)try{s.xhr[i]=r[i]}catch(o){self.console&&console.error(o)}"GET"===s.method||s.headers["Content-type"]||s.headers["Content-Type"]||s.xhr.setRequestHeader("Content-type","application/x-www-form-urlencoded");for(var a in s.headers)s.xhr.setRequestHeader(a,s.headers[a]);return new Promise(function(t,e){s.xhr.onload=function(){document.body.removeAttribute("data-loading"),0===s.xhr.status||s.xhr.status>=200&&s.xhr.status<300||304===s.xhr.status?t(s.xhr):e(n.extend(Error(s.xhr.statusText),{xhr:s.xhr,get status(){return this.xhr.status}}))},s.xhr.onerror=function(){document.body.removeAttribute("data-loading"),e(n.extend(Error("Network Error"),{xhr:s.xhr}))},s.xhr.ontimeout=function(){document.body.removeAttribute("data-loading"),e(n.extend(Error("Network Timeout"),{xhr:s.xhr}))},s.xhr.send("GET"===s.method?null:s.data)})},value:function(t){var e="string"!==n.type(t);return n.$(arguments).slice(+e).reduce(function(t,e){return t&&t[e]},e?t:self)}}),n.Hooks=new n.Class({add:function(t,e,r){if("string"==typeof arguments[0])(Array.isArray(t)?t:[t]).forEach(function(t){this[t]=this[t]||[],e&&this[t][r?"unshift":"push"](e)},this);else for(var t in arguments[0])this.add(t,arguments[0][t],arguments[1])},run:function(t,e){this[t]=this[t]||[],this[t].forEach(function(t){t.call(e&&e.context?e.context:e,e)})}}),n.hooks=new n.Hooks;var s=n.property;n.Element=function(t){this.subject=t,this.data={},this.bliss={}},n.Element.prototype={set:t(function(t,e){t in n.setProps?n.setProps[t].call(this,e):t in this?this[t]=e:this.setAttribute(t,e)},0),transition:function(t,e){return e=+e||400,new Promise(function(r,s){if("transition"in this.style){var i=n.extend({},this.style,/^transition(Duration|Property)$/);n.style(this,{transitionDuration:(e||400)+"ms",transitionProperty:Object.keys(t).join(", ")}),n.once(this,"transitionend",function(){clearTimeout(o),n.style(this,i),r(this)});var o=setTimeout(r,e+50,this);n.style(this,t)}else n.style(this,t),r(this)}.bind(this))},fire:function(t,e){var r=document.createEvent("HTMLEvents");return r.initEvent(t,!0,!0),this.dispatchEvent(n.extend(r,e))},unbind:t(function(t,e){(t||"").split(/\s+/).forEach(function(t){if(s in this&&(t.indexOf(".")>-1||!e)){t=(t||"").split(".");var r=t[1];t=t[0];var n=this[s].bliss.listeners=this[s].bliss.listeners||{};for(var i in n)if(!t||i===t)for(var o,a=0;o=n[i][a];a++)r&&r!==o.className||e&&e!==o.callback||(this.removeEventListener(i,o.callback,o.capture),a--)}else this.removeEventListener(t,e)},this)},0)},n.setProps={style:function(t){for(var e in t)e in this.style?this.style[e]=t[e]:this.style.setProperty(e,t[e])},attributes:function(t){for(var e in t)this.setAttribute(e,t[e])},properties:function(t){n.extend(this,t)},events:function(t){if(t&&t.addEventListener){var e=this;if(t[s]&&t[s].bliss){var r=t[s].bliss.listeners;for(var i in r)r[i].forEach(function(t){e.addEventListener(i,t.callback,t.capture)})}for(var o in t)0===o.indexOf("on")&&(this[o]=t[o])}else if(arguments.length>1&&"string"===n.type(t)){var a=arguments[1],u=arguments[2];t.split(/\s+/).forEach(function(t){this.addEventListener(t,a,u)},this)}else for(var c in t)n.events(this,c,t[c])},once:t(function(t,e){t=t.split(/\s+/);var r=this,n=function(){return t.forEach(function(t){r.removeEventListener(t,n)}),e.apply(r,arguments)};t.forEach(function(t){r.addEventListener(t,n)})},0),delegate:t(function(t,e,r){this.addEventListener(t,function(t){t.target.closest(e)&&r.call(this,t)})},0,2),contents:function(t){(t||0===t)&&(Array.isArray(t)?t:[t]).forEach(function(t){var e=n.type(t);/^(string|number)$/.test(e)?t=document.createTextNode(t+""):"object"===e&&(t=n.create(t)),t instanceof Node&&this.appendChild(t)},this)},inside:function(t){t.appendChild(this)},before:function(t){t.parentNode.insertBefore(this,t)},after:function(t){t.parentNode.insertBefore(this,t.nextSibling)},start:function(t){t.insertBefore(this,t.firstChild)},around:function(t){t.parentNode&&n.before(this,t),(/^template$/i.test(this.nodeName)?this.content||this:this).appendChild(t)}},n.Array=function(t){this.subject=t},n.Array.prototype={all:function(t){var e=$$(arguments).slice(1);return this[t].apply(this,e)}},n.add=t(function(t,e,r,s){r=n.extend({$:!0,element:!0,array:!0},r),"function"==n.type(e)&&(!r.element||t in n.Element.prototype&&s||(n.Element.prototype[t]=function(){return this.subject&&n.defined(e.apply(this.subject,arguments),this.subject)}),!r.array||t in n.Array.prototype&&s||(n.Array.prototype[t]=function(){var t=arguments;return this.subject.map(function(r){return r&&n.defined(e.apply(r,t),r)})}),r.$&&(n.sources[t]=n[t]=e,(r.array||r.element)&&(n[t]=function(){var e=[].slice.apply(arguments),s=e.shift(),i=r.array&&Array.isArray(s)?"Array":"Element";return n[i].prototype[t].apply({subject:s},e)})))},0),n.add(n.Array.prototype,{element:!1}),n.add(n.Element.prototype),n.add(n.setProps),n.add(n.classProps,{element:!1,array:!1});var i=document.createElement("_");n.add(n.extend({},HTMLElement.prototype,function(t){return"function"===n.type(i[t])}),null,!0)}(),function(t){"use strict";if(Bliss&&!Bliss.shy){var e=Bliss.property;if(t.add({clone:function(){var e=this.cloneNode(!0),r=t.$("*",e).concat(e);return t.$("*",this).concat(this).forEach(function(e,n,s){t.events(r[n],e),r[n]._.data=t.extend({},e._.data)}),e}},{array:!1}),Object.defineProperty(Node.prototype,e,{get:function o(){return Object.defineProperty(Node.prototype,e,{get:void 0}),Object.defineProperty(this,e,{value:new t.Element(this)}),Object.defineProperty(Node.prototype,e,{get:o}),this[e]},configurable:!0}),Object.defineProperty(Array.prototype,e,{get:function(){return Object.defineProperty(this,e,{value:new t.Array(this)}),this[e]},configurable:!0}),self.EventTarget&&"addEventListener"in EventTarget.prototype){var r=EventTarget.prototype.addEventListener,n=EventTarget.prototype.removeEventListener,s=function(t,e,r){return r.callback===t&&r.capture==e},i=function(){return!s.apply(this,arguments)};EventTarget.prototype.addEventListener=function(t,n,i){if(this&&this[e]&&this[e].bliss&&n){var o=this[e].bliss.listeners=this[e].bliss.listeners||{};if(t.indexOf(".")>-1){t=t.split(".");var a=t[1];t=t[0]}o[t]=o[t]||[],0===o[t].filter(s.bind(null,n,i)).length&&o[t].push({callback:n,capture:i,className:a})}return r.call(this,t,n,i)},EventTarget.prototype.removeEventListener=function(t,r,s){if(this&&this[e]&&this[e].bliss&&r){var o=this[e].bliss.listeners=this[e].bliss.listeners||{};o[t]&&(o[t]=o[t].filter(i.bind(null,r,s)))}return n.call(this,t,r,s)}}self.$=self.$||t,self.$$=self.$$||t.$}}(Bliss);
//     JavaScript Expression Parser (JSEP) <%= version %>
//     JSEP may be freely distributed under the MIT License
//     http://jsep.from.so/

/*global module: true, exports: true, console: true */
(function (root) {
	'use strict';
	// Node Types
	// ----------
	
	// This is the full set of types that any JSEP node can be.
	// Store them here to save space when minified
	var COMPOUND = 'Compound',
		IDENTIFIER = 'Identifier',
		MEMBER_EXP = 'MemberExpression',
		LITERAL = 'Literal',
		THIS_EXP = 'ThisExpression',
		CALL_EXP = 'CallExpression',
		UNARY_EXP = 'UnaryExpression',
		BINARY_EXP = 'BinaryExpression',
		LOGICAL_EXP = 'LogicalExpression',
		CONDITIONAL_EXP = 'ConditionalExpression',
		ARRAY_EXP = 'ArrayExpression',

		PERIOD_CODE = 46, // '.'
		COMMA_CODE  = 44, // ','
		SQUOTE_CODE = 39, // single quote
		DQUOTE_CODE = 34, // double quotes
		OPAREN_CODE = 40, // (
		CPAREN_CODE = 41, // )
		OBRACK_CODE = 91, // [
		CBRACK_CODE = 93, // ]
		QUMARK_CODE = 63, // ?
		SEMCOL_CODE = 59, // ;
		COLON_CODE  = 58, // :

		throwError = function(message, index) {
			var error = new Error(message + ' at character ' + index);
			error.index = index;
			error.description = message;
			throw error;
		},

	// Operations
	// ----------
	
	// Set `t` to `true` to save space (when minified, not gzipped)
		t = true,
	// Use a quickly-accessible map to store all of the unary operators
	// Values are set to `true` (it really doesn't matter)
		unary_ops = {'-': t, '!': t, '~': t, '+': t},
	// Also use a map for the binary operations but set their values to their
	// binary precedence for quick reference:
	// see [Order of operations](http://en.wikipedia.org/wiki/Order_of_operations#Programming_language)
		binary_ops = {
			'||': 1, '&&': 2, '|': 3,  '^': 4,  '&': 5,
			'==': 6, '!=': 6, '===': 6, '!==': 6,
			'<': 7,  '>': 7,  '<=': 7,  '>=': 7, 
			'<<':8,  '>>': 8, '>>>': 8,
			'+': 9, '-': 9,
			'*': 10, '/': 10, '%': 10
		},
	// Get return the longest key length of any object
		getMaxKeyLen = function(obj) {
			var max_len = 0, len;
			for(var key in obj) {
				if((len = key.length) > max_len && obj.hasOwnProperty(key)) {
					max_len = len;
				}
			}
			return max_len;
		},
		max_unop_len = getMaxKeyLen(unary_ops),
		max_binop_len = getMaxKeyLen(binary_ops),
	// Literals
	// ----------
	// Store the values to return for the various literals we may encounter
		literals = {
			'true': true,
			'false': false,
			'null': null
		},
	// Except for `this`, which is special. This could be changed to something like `'self'` as well
		this_str = 'this',
	// Returns the precedence of a binary operator or `0` if it isn't a binary operator
		binaryPrecedence = function(op_val) {
			return binary_ops[op_val] || 0;
		},
	// Utility function (gets called from multiple places)
	// Also note that `a && b` and `a || b` are *logical* expressions, not binary expressions
		createBinaryExpression = function (operator, left, right) {
			var type = (operator === '||' || operator === '&&') ? LOGICAL_EXP : BINARY_EXP;
			return {
				type: type,
				operator: operator,
				left: left,
				right: right
			};
		},
		// `ch` is a character code in the next three functions
		isDecimalDigit = function(ch) {
			return (ch >= 48 && ch <= 57); // 0...9
		},
		isIdentifierStart = function(ch) {
			return (ch === 36) || (ch === 95) || // `$` and `_`
					(ch >= 65 && ch <= 90) || // A...Z
					(ch >= 97 && ch <= 122) || // a...z
                    (ch >= 128 && !binary_ops[String.fromCharCode(ch)]); // any non-ASCII that is not an operator
		},
		isIdentifierPart = function(ch) {
			return (ch === 36) || (ch === 95) || // `$` and `_`
					(ch >= 65 && ch <= 90) || // A...Z
					(ch >= 97 && ch <= 122) || // a...z
					(ch >= 48 && ch <= 57) || // 0...9
                    (ch >= 128 && !binary_ops[String.fromCharCode(ch)]); // any non-ASCII that is not an operator
		},

		// Parsing
		// -------
		// `expr` is a string with the passed in expression
		jsep = function(expr) {
			// `index` stores the character number we are currently at while `length` is a constant
			// All of the gobbles below will modify `index` as we move along
			var index = 0,
				charAtFunc = expr.charAt,
				charCodeAtFunc = expr.charCodeAt,
				exprI = function(i) { return charAtFunc.call(expr, i); },
				exprICode = function(i) { return charCodeAtFunc.call(expr, i); },
				length = expr.length,

				// Push `index` up to the next non-space character
				gobbleSpaces = function() {
					var ch = exprICode(index);
					// space or tab
					while(ch === 32 || ch === 9) {
						ch = exprICode(++index);
					}
				},
				
				// The main parsing function. Much of this code is dedicated to ternary expressions
				gobbleExpression = function() {
					var test = gobbleBinaryExpression(),
						consequent, alternate;
					gobbleSpaces();
					if(exprICode(index) === QUMARK_CODE) {
						// Ternary expression: test ? consequent : alternate
						index++;
						consequent = gobbleExpression();
						if(!consequent) {
							throwError('Expected expression', index);
						}
						gobbleSpaces();
						if(exprICode(index) === COLON_CODE) {
							index++;
							alternate = gobbleExpression();
							if(!alternate) {
								throwError('Expected expression', index);
							}
							return {
								type: CONDITIONAL_EXP,
								test: test,
								consequent: consequent,
								alternate: alternate
							};
						} else {
							throwError('Expected :', index);
						}
					} else {
						return test;
					}
				},

				// Search for the operation portion of the string (e.g. `+`, `===`)
				// Start by taking the longest possible binary operations (3 characters: `===`, `!==`, `>>>`)
				// and move down from 3 to 2 to 1 character until a matching binary operation is found
				// then, return that binary operation
				gobbleBinaryOp = function() {
					gobbleSpaces();
					var biop, to_check = expr.substr(index, max_binop_len), tc_len = to_check.length;
					while(tc_len > 0) {
						if(binary_ops.hasOwnProperty(to_check)) {
							index += tc_len;
							return to_check;
						}
						to_check = to_check.substr(0, --tc_len);
					}
					return false;
				},

				// This function is responsible for gobbling an individual expression,
				// e.g. `1`, `1+2`, `a+(b*2)-Math.sqrt(2)`
				gobbleBinaryExpression = function() {
					var ch_i, node, biop, prec, stack, biop_info, left, right, i;

					// First, try to get the leftmost thing
					// Then, check to see if there's a binary operator operating on that leftmost thing
					left = gobbleToken();
					biop = gobbleBinaryOp();

					// If there wasn't a binary operator, just return the leftmost node
					if(!biop) {
						return left;
					}

					// Otherwise, we need to start a stack to properly place the binary operations in their
					// precedence structure
					biop_info = { value: biop, prec: binaryPrecedence(biop)};

					right = gobbleToken();
					if(!right) {
						throwError("Expected expression after " + biop, index);
					}
					stack = [left, biop_info, right];

					// Properly deal with precedence using [recursive descent](http://www.engr.mun.ca/~theo/Misc/exp_parsing.htm)
					while((biop = gobbleBinaryOp())) {
						prec = binaryPrecedence(biop);

						if(prec === 0) {
							break;
						}
						biop_info = { value: biop, prec: prec };

						// Reduce: make a binary expression from the three topmost entries.
						while ((stack.length > 2) && (prec <= stack[stack.length - 2].prec)) {
							right = stack.pop();
							biop = stack.pop().value;
							left = stack.pop();
							node = createBinaryExpression(biop, left, right);
							stack.push(node);
						}

						node = gobbleToken();
						if(!node) {
							throwError("Expected expression after " + biop, index);
						}
						stack.push(biop_info, node);
					}

					i = stack.length - 1;
					node = stack[i];
					while(i > 1) {
						node = createBinaryExpression(stack[i - 1].value, stack[i - 2], node); 
						i -= 2;
					}
					return node;
				},

				// An individual part of a binary expression:
				// e.g. `foo.bar(baz)`, `1`, `"abc"`, `(a % 2)` (because it's in parenthesis)
				gobbleToken = function() {
					var ch, to_check, tc_len;
					
					gobbleSpaces();
					ch = exprICode(index);

					if(isDecimalDigit(ch) || ch === PERIOD_CODE) {
						// Char code 46 is a dot `.` which can start off a numeric literal
						return gobbleNumericLiteral();
					} else if(ch === SQUOTE_CODE || ch === DQUOTE_CODE) {
						// Single or double quotes
						return gobbleStringLiteral();
					} else if(isIdentifierStart(ch) || ch === OPAREN_CODE) { // open parenthesis
						// `foo`, `bar.baz`
						return gobbleVariable();
					} else if (ch === OBRACK_CODE) {
						return gobbleArray();
					} else {
						to_check = expr.substr(index, max_unop_len);
						tc_len = to_check.length;
						while(tc_len > 0) {
							if(unary_ops.hasOwnProperty(to_check)) {
								index += tc_len;
								return {
									type: UNARY_EXP,
									operator: to_check,
									argument: gobbleToken(),
									prefix: true
								};
							}
							to_check = to_check.substr(0, --tc_len);
						}
						
						return false;
					}
				},
				// Parse simple numeric literals: `12`, `3.4`, `.5`. Do this by using a string to
				// keep track of everything in the numeric literal and then calling `parseFloat` on that string
				gobbleNumericLiteral = function() {
					var number = '', ch, chCode;
					while(isDecimalDigit(exprICode(index))) {
						number += exprI(index++);
					}

					if(exprICode(index) === PERIOD_CODE) { // can start with a decimal marker
						number += exprI(index++);

						while(isDecimalDigit(exprICode(index))) {
							number += exprI(index++);
						}
					}
					
					ch = exprI(index);
					if(ch === 'e' || ch === 'E') { // exponent marker
						number += exprI(index++);
						ch = exprI(index);
						if(ch === '+' || ch === '-') { // exponent sign
							number += exprI(index++);
						}
						while(isDecimalDigit(exprICode(index))) { //exponent itself
							number += exprI(index++);
						}
						if(!isDecimalDigit(exprICode(index-1)) ) {
							throwError('Expected exponent (' + number + exprI(index) + ')', index);
						}
					}
					

					chCode = exprICode(index);
					// Check to make sure this isn't a variable name that start with a number (123abc)
					if(isIdentifierStart(chCode)) {
						throwError('Variable names cannot start with a number (' +
									number + exprI(index) + ')', index);
					} else if(chCode === PERIOD_CODE) {
						throwError('Unexpected period', index);
					}

					return {
						type: LITERAL,
						value: parseFloat(number),
						raw: number
					};
				},

				// Parses a string literal, staring with single or double quotes with basic support for escape codes
				// e.g. `"hello world"`, `'this is\nJSEP'`
				gobbleStringLiteral = function() {
					var str = '', quote = exprI(index++), closed = false, ch;

					while(index < length) {
						ch = exprI(index++);
						if(ch === quote) {
							closed = true;
							break;
						} else if(ch === '\\') {
							// Check for all of the common escape codes
							ch = exprI(index++);
							switch(ch) {
								case 'n': str += '\n'; break;
								case 'r': str += '\r'; break;
								case 't': str += '\t'; break;
								case 'b': str += '\b'; break;
								case 'f': str += '\f'; break;
								case 'v': str += '\x0B'; break;
								default : str += '\\' + ch;
							}
						} else {
							str += ch;
						}
					}

					if(!closed) {
						throwError('Unclosed quote after "'+str+'"', index);
					}

					return {
						type: LITERAL,
						value: str,
						raw: quote + str + quote
					};
				},
				
				// Gobbles only identifiers
				// e.g.: `foo`, `_value`, `$x1`
				// Also, this function checks if that identifier is a literal:
				// (e.g. `true`, `false`, `null`) or `this`
				gobbleIdentifier = function() {
					var ch = exprICode(index), start = index, identifier;

					if(isIdentifierStart(ch)) {
						index++;
					} else {
						throwError('Unexpected ' + exprI(index), index);
					}

					while(index < length) {
						ch = exprICode(index);
						if(isIdentifierPart(ch)) {
							index++;
						} else {
							break;
						}
					}
					identifier = expr.slice(start, index);

					if(literals.hasOwnProperty(identifier)) {
						return {
							type: LITERAL,
							value: literals[identifier],
							raw: identifier
						};
					} else if(identifier === this_str) {
						return { type: THIS_EXP };
					} else {
						return {
							type: IDENTIFIER,
							name: identifier
						};
					}
				},

				// Gobbles a list of arguments within the context of a function call
				// or array literal. This function also assumes that the opening character
				// `(` or `[` has already been gobbled, and gobbles expressions and commas
				// until the terminator character `)` or `]` is encountered.
				// e.g. `foo(bar, baz)`, `my_func()`, or `[bar, baz]`
				gobbleArguments = function(termination) {
					var ch_i, args = [], node, closed = false;
					while(index < length) {
						gobbleSpaces();
						ch_i = exprICode(index);
						if(ch_i === termination) { // done parsing
							closed = true;
							index++;
							break;
						} else if (ch_i === COMMA_CODE) { // between expressions
							index++;
						} else {
							node = gobbleExpression();
							if(!node || node.type === COMPOUND) {
								throwError('Expected comma', index);
							}
							args.push(node);
						}
					}
					if (!closed) {
						throwError('Expected ' + String.fromCharCode(termination), index);
					}
					return args;
				},

				// Gobble a non-literal variable name. This variable name may include properties
				// e.g. `foo`, `bar.baz`, `foo['bar'].baz`
				// It also gobbles function calls:
				// e.g. `Math.acos(obj.angle)`
				gobbleVariable = function() {
					var ch_i, node;
					ch_i = exprICode(index);
						
					if(ch_i === OPAREN_CODE) {
						node = gobbleGroup();
					} else {
						node = gobbleIdentifier();
					}
					gobbleSpaces();
					ch_i = exprICode(index);
					while(ch_i === PERIOD_CODE || ch_i === OBRACK_CODE || ch_i === OPAREN_CODE) {
						index++;
						if(ch_i === PERIOD_CODE) {
							gobbleSpaces();
							node = {
								type: MEMBER_EXP,
								computed: false,
								object: node,
								property: gobbleIdentifier()
							};
						} else if(ch_i === OBRACK_CODE) {
							node = {
								type: MEMBER_EXP,
								computed: true,
								object: node,
								property: gobbleExpression()
							};
							gobbleSpaces();
							ch_i = exprICode(index);
							if(ch_i !== CBRACK_CODE) {
								throwError('Unclosed [', index);
							}
							index++;
						} else if(ch_i === OPAREN_CODE) {
							// A function call is being made; gobble all the arguments
							node = {
								type: CALL_EXP,
								'arguments': gobbleArguments(CPAREN_CODE),
								callee: node
							};
						}
						gobbleSpaces();
						ch_i = exprICode(index);
					}
					return node;
				},

				// Responsible for parsing a group of things within parentheses `()`
				// This function assumes that it needs to gobble the opening parenthesis
				// and then tries to gobble everything within that parenthesis, assuming
				// that the next thing it should see is the close parenthesis. If not,
				// then the expression probably doesn't have a `)`
				gobbleGroup = function() {
					index++;
					var node = gobbleExpression();
					gobbleSpaces();
					if(exprICode(index) === CPAREN_CODE) {
						index++;
						return node;
					} else {
						throwError('Unclosed (', index);
					}
				},

				// Responsible for parsing Array literals `[1, 2, 3]`
				// This function assumes that it needs to gobble the opening bracket
				// and then tries to gobble the expressions as arguments.
				gobbleArray = function() {
					index++;
					return {
						type: ARRAY_EXP,
						elements: gobbleArguments(CBRACK_CODE)
					};
				},

				nodes = [], ch_i, node;
				
			while(index < length) {
				ch_i = exprICode(index);

				// Expressions can be separated by semicolons, commas, or just inferred without any
				// separators
				if(ch_i === SEMCOL_CODE || ch_i === COMMA_CODE) {
					index++; // ignore separators
				} else {
					// Try to gobble each expression individually
					if((node = gobbleExpression())) {
						nodes.push(node);
					// If we weren't able to find a binary expression and are out of room, then
					// the expression passed in probably has too much
					} else if(index < length) {
						throwError('Unexpected "' + exprI(index) + '"', index);
					}
				}
			}

			// If there's only one expression just try returning the expression
			if(nodes.length === 1) {
				return nodes[0];
			} else {
				return {
					type: COMPOUND,
					body: nodes
				};
			}
		};

	// To be filled in by the template
	jsep.version = '<%= version %>';
	jsep.toString = function() { return 'JavaScript Expression Parser (JSEP) v' + jsep.version; };

	/**
	 * @method jsep.addUnaryOp
	 * @param {string} op_name The name of the unary op to add
	 * @return jsep
	 */
	jsep.addUnaryOp = function(op_name) {
		max_unop_len = Math.max(op_name.length, max_unop_len);
		unary_ops[op_name] = t; return this;
	};

	/**
	 * @method jsep.addBinaryOp
	 * @param {string} op_name The name of the binary op to add
	 * @param {number} precedence The precedence of the binary op (can be a float)
	 * @return jsep
	 */
	jsep.addBinaryOp = function(op_name, precedence) {
		max_binop_len = Math.max(op_name.length, max_binop_len);
		binary_ops[op_name] = precedence;
		return this;
	};

	/**
	 * @method jsep.addLiteral
	 * @param {string} literal_name The name of the literal to add
	 * @param {*} literal_value The value of the literal
	 * @return jsep
	 */
	jsep.addLiteral = function(literal_name, literal_value) {
		literals[literal_name] = literal_value;
		return this;
	};

	/**
	 * @method jsep.removeUnaryOp
	 * @param {string} op_name The name of the unary op to remove
	 * @return jsep
	 */
	jsep.removeUnaryOp = function(op_name) {
		delete unary_ops[op_name];
		if(op_name.length === max_unop_len) {
			max_unop_len = getMaxKeyLen(unary_ops);
		}
		return this;
	};

	/**
	 * @method jsep.removeBinaryOp
	 * @param {string} op_name The name of the binary op to remove
	 * @return jsep
	 */
	jsep.removeBinaryOp = function(op_name) {
		delete binary_ops[op_name];
		if(op_name.length === max_binop_len) {
			max_binop_len = getMaxKeyLen(binary_ops);
		}
		return this;
	};

	/**
	 * @method jsep.removeLiteral
	 * @param {string} literal_name The name of the literal to remove
	 * @return jsep
	 */
	jsep.removeLiteral = function(literal_name) {
		delete literals[literal_name];
		return this;
	};

	// In desktop environments, have a way to restore the old value for `jsep`
	if (typeof exports === 'undefined') {
		var old_jsep = root.jsep;
		// The star of the show! It's a function!
		root.jsep = jsep;
		// And a courteous function willing to move out of the way for other similarly-named objects!
		jsep.noConflict = function() {
			if(root.jsep === jsep) {
				root.jsep = old_jsep;
			}
			return jsep;
		};
	} else {
		// In Node.JS environments
		if (typeof module !== 'undefined' && module.exports) {
			exports = module.exports = jsep;
		} else {
			exports.parse = jsep;
		}
	}
}(this));

/* jsep v0.3.1 (http://jsep.from.so/) */
!function(a){"use strict";var b="Compound",c="Identifier",d="MemberExpression",e="Literal",f="ThisExpression",g="CallExpression",h="UnaryExpression",i="BinaryExpression",j="LogicalExpression",k="ConditionalExpression",l="ArrayExpression",m=46,n=44,o=39,p=34,q=40,r=41,s=91,t=93,u=63,v=59,w=58,x=function(a,b){var c=new Error(a+" at character "+b);throw c.index=b,c.description=a,c},y=!0,z={"-":y,"!":y,"~":y,"+":y},A={"||":1,"&&":2,"|":3,"^":4,"&":5,"==":6,"!=":6,"===":6,"!==":6,"<":7,">":7,"<=":7,">=":7,"<<":8,">>":8,">>>":8,"+":9,"-":9,"*":10,"/":10,"%":10},B=function(a){var b,c=0;for(var d in a)(b=d.length)>c&&a.hasOwnProperty(d)&&(c=b);return c},C=B(z),D=B(A),E={"true":!0,"false":!1,"null":null},F="this",G=function(a){return A[a]||0},H=function(a,b,c){var d="||"===a||"&&"===a?j:i;return{type:d,operator:a,left:b,right:c}},I=function(a){return a>=48&&a<=57},J=function(a){return 36===a||95===a||a>=65&&a<=90||a>=97&&a<=122||a>=128&&!A[String.fromCharCode(a)]},K=function(a){return 36===a||95===a||a>=65&&a<=90||a>=97&&a<=122||a>=48&&a<=57||a>=128&&!A[String.fromCharCode(a)]},L=function(a){for(var i,j,y=0,B=a.charAt,L=a.charCodeAt,M=function(b){return B.call(a,b)},N=function(b){return L.call(a,b)},O=a.length,P=function(){for(var a=N(y);32===a||9===a||10===a||13===a;)a=N(++y)},Q=function(){var a,b,c=S();return P(),N(y)!==u?c:(y++,a=Q(),a||x("Expected expression",y),P(),N(y)===w?(y++,b=Q(),b||x("Expected expression",y),{type:k,test:c,consequent:a,alternate:b}):void x("Expected :",y))},R=function(){P();for(var b=a.substr(y,D),c=b.length;c>0;){if(A.hasOwnProperty(b))return y+=c,b;b=b.substr(0,--c)}return!1},S=function(){var a,b,c,d,e,f,g,h;if(f=T(),b=R(),!b)return f;for(e={value:b,prec:G(b)},g=T(),g||x("Expected expression after "+b,y),d=[f,e,g];(b=R())&&(c=G(b),0!==c);){for(e={value:b,prec:c};d.length>2&&c<=d[d.length-2].prec;)g=d.pop(),b=d.pop().value,f=d.pop(),a=H(b,f,g),d.push(a);a=T(),a||x("Expected expression after "+b,y),d.push(e,a)}for(h=d.length-1,a=d[h];h>1;)a=H(d[h-1].value,d[h-2],a),h-=2;return a},T=function(){var b,c,d;if(P(),b=N(y),I(b)||b===m)return U();if(b===o||b===p)return V();if(J(b)||b===q)return Y();if(b===s)return $();for(c=a.substr(y,C),d=c.length;d>0;){if(z.hasOwnProperty(c))return y+=d,{type:h,operator:c,argument:T(),prefix:!0};c=c.substr(0,--d)}return!1},U=function(){for(var a,b,c="";I(N(y));)c+=M(y++);if(N(y)===m)for(c+=M(y++);I(N(y));)c+=M(y++);if(a=M(y),"e"===a||"E"===a){for(c+=M(y++),a=M(y),"+"!==a&&"-"!==a||(c+=M(y++));I(N(y));)c+=M(y++);I(N(y-1))||x("Expected exponent ("+c+M(y)+")",y)}return b=N(y),J(b)?x("Variable names cannot start with a number ("+c+M(y)+")",y):b===m&&x("Unexpected period",y),{type:e,value:parseFloat(c),raw:c}},V=function(){for(var a,b="",c=M(y++),d=!1;y<O;){if(a=M(y++),a===c){d=!0;break}if("\\"===a)switch(a=M(y++)){case"n":b+="\n";break;case"r":b+="\r";break;case"t":b+="\t";break;case"b":b+="\b";break;case"f":b+="\f";break;case"v":b+="\x0B";break;default:b+="\\"+a}else b+=a}return d||x('Unclosed quote after "'+b+'"',y),{type:e,value:b,raw:c+b+c}},W=function(){var b,d=N(y),g=y;for(J(d)?y++:x("Unexpected "+M(y),y);y<O&&(d=N(y),K(d));)y++;return b=a.slice(g,y),E.hasOwnProperty(b)?{type:e,value:E[b],raw:b}:b===F?{type:f}:{type:c,name:b}},X=function(a){for(var c,d,e=[],f=!1;y<O;){if(P(),c=N(y),c===a){f=!0,y++;break}c===n?y++:(d=Q(),d&&d.type!==b||x("Expected comma",y),e.push(d))}return f||x("Expected "+String.fromCharCode(a),y),e},Y=function(){var a,b;for(a=N(y),b=a===q?Z():W(),P(),a=N(y);a===m||a===s||a===q;)y++,a===m?(P(),b={type:d,computed:!1,object:b,property:W()}):a===s?(b={type:d,computed:!0,object:b,property:Q()},P(),a=N(y),a!==t&&x("Unclosed [",y),y++):a===q&&(b={type:g,arguments:X(r),callee:b}),P(),a=N(y);return b},Z=function(){y++;var a=Q();return P(),N(y)===r?(y++,a):void x("Unclosed (",y)},$=function(){return y++,{type:l,elements:X(t)}},_=[];y<O;)i=N(y),i===v||i===n?y++:(j=Q())?_.push(j):y<O&&x('Unexpected "'+M(y)+'"',y);return 1===_.length?_[0]:{type:b,body:_}};if(L.version="0.3.1",L.toString=function(){return"JavaScript Expression Parser (JSEP) v"+L.version},L.addUnaryOp=function(a){return C=Math.max(a.length,C),z[a]=y,this},L.addBinaryOp=function(a,b){return D=Math.max(a.length,D),A[a]=b,this},L.addLiteral=function(a,b){return E[a]=b,this},L.removeUnaryOp=function(a){return delete z[a],a.length===C&&(C=B(z)),this},L.removeBinaryOp=function(a){return delete A[a],a.length===D&&(D=B(A)),this},L.removeLiteral=function(a){return delete E[a],this},"undefined"==typeof exports){var M=a.jsep;a.jsep=L,L.noConflict=function(){return a.jsep===L&&(a.jsep=M),L}}else"undefined"!=typeof module&&module.exports?exports=module.exports=L:exports.parse=L}(this);
//# sourceMappingURL=jsep.min.js.map
/*
 * Stretchy: Form element autosizing, the way it should be.
 * by Lea Verou http://lea.verou.me
 * MIT license
 */
(function() {

if (!self.Element) {
	return; // super old browser
}

if (!Element.prototype.matches) {
	Element.prototype.matches = Element.prototype.webkitMatchesSelector || Element.prototype.mozMatchesSelector || Element.prototype.msMatchesSelector || Element.prototype.oMatchesSelector || null;
}

if (!Element.prototype.matches) {
	return;
}

function $$(expr, con) {
	return expr instanceof Node || expr instanceof Window? [expr] :
	       [].slice.call(typeof expr == "string"? (con || document).querySelectorAll(expr) : expr || []);
}

var _ = self.Stretchy = {
	selectors: {
		base: 'textarea, select:not([size]), input:not([type]), input[type="' + "text url email tel".split(" ").join('"], input[type="') + '"]',
		filter: "*"
	},

	// Script element this was included with, if any
	script: document.currentScript || $$("script").pop(),

	// Autosize one element. The core of Stretchy.
	resize: function(element) {
		if (!_.resizes(element)) {
			return;
		}

		var cs = getComputedStyle(element);
		var offset = 0;

		if (!element.value && element.placeholder) {
			var empty = true;
			element.value = element.placeholder;
		}

		var type = element.nodeName.toLowerCase();

		if (type == "textarea") {
			element.style.height = "0";

			if (cs.boxSizing == "border-box") {
				offset = element.offsetHeight;
			}
			else if (cs.boxSizing == "content-box") {
				offset = -element.clientHeight;
			}

			element.style.height = element.scrollHeight + offset + "px";
		}
		else if(type == "input") {
			// First test that it is actually visible, otherwise all measurements are off
			element.style.width = "1000px";

			if (element.offsetWidth) {
				element.style.width = "0";

				if (cs.boxSizing == "border-box") {
					offset = element.offsetWidth;
				}
				else if (cs.boxSizing == "padding-box") {
					offset = element.clientWidth;
				}

				// Safari misreports scrollWidth, so we will instead set scrollLeft to a
				// huge number, and read that back to see what it was clipped to
				element.scrollLeft = 1e+10;

				var width = Math.max(element.scrollLeft + offset, element.scrollWidth - element.clientWidth);

				element.style.width = width + "px";
			}
			else {
				// Element is invisible, just set to something reasonable
				element.style.width = element.value.length + 1 + "ch";
			}
		}
		else if (type == "select") {
			var selectedIndex = element.selectedIndex > 0? element.selectedIndex : 0;

			// Need to use dummy element to measure :(
			var option = document.createElement("_");
			option.textContent = element.options[selectedIndex].textContent;
			element.parentNode.insertBefore(option, element.nextSibling);

			// The name of the appearance property, as it might be prefixed
			var appearance;

			for (var property in cs) {
				var value = cs[property];
				if (!/^(width|webkitLogicalWidth|length)$/.test(property) && typeof value == "string") {
					//console.log(property, option.offsetWidth, cs[property]);
					option.style[property] = value;

					if (/appearance$/i.test(property)) {
						appearance = property;
					}
				}
			}

			option.style.width = "";

			if (option.offsetWidth > 0) {
				element.style.width = option.offsetWidth + "px";

				if (!cs[appearance] || cs[appearance] !== "none") {
					// Account for arrow
					element.style.width = "calc(" + element.style.width + " + 2em)";
				}
			}

			option.parentNode.removeChild(option);
			option = null;
		}

		if (empty) {
			element.value = "";
		}
	},

	// Autosize multiple elements
	resizeAll: function(elements) {
		$$(elements || _.selectors.base).forEach(function (element) {
			_.resize(element);
		});
	},

	active: true,

	// Will stretchy do anything for this element?
	resizes: function(element) {
		return element &&
		       element.parentNode &&
		       element.matches &&
		       element.matches(_.selectors.base) &&
		       element.matches(_.selectors.filter);
	},

	init: function(){
		_.selectors.filter = _.script.getAttribute("data-filter") ||
		                     ($$("[data-stretchy-filter]").pop() || document.body).getAttribute("data-stretchy-filter") || Stretchy.selectors.filter || "*";

		_.resizeAll();
	},

	$$: $$
};

// Autosize all elements once the DOM is loaded

// DOM already loaded?
if (document.readyState !== "loading") {
	_.init();
}
else {
	// Wait for it
	document.addEventListener("DOMContentLoaded", _.init);
}

// Listen for changes
var listener = function(evt) {
	if (_.active) {
		_.resize(evt.target);
	}
};

document.documentElement.addEventListener("input", listener);

// Firefox fires a change event instead of an input event
document.documentElement.addEventListener("change", listener);

// Listen for new elements
if (self.MutationObserver) {
	(new MutationObserver(function(mutations) {
		if (_.active) {
			mutations.forEach(function(mutation) {
				if (mutation.type == "childList") {
					Stretchy.resizeAll(mutation.addedNodes);
				}
			});
		}
	})).observe(document.documentElement, {
		childList: true,
		subtree: true
	});
}

})();

(function ($, $$) {

var _ = self.Mavo = $.Class({
	constructor: function (element) {
		this.treeBuilt = Mavo.defer();

		this.element = element;

		// Index among other mavos in the page, 1 is first
		this.index = _.length + 1;
		Object.defineProperty(_.all, this.index - 1, {value: this});

		// Convert any data-mv-* attributes to mv-*
		var selector = _.attributes.map(attribute => `[data-${attribute}]`).join(", ");

		[this.element, ...$$(selector, this.element)].forEach(element => {
			for (let attribute of _.attributes) {
				let value = element.getAttribute("data-" + attribute);

				if (value !== null) {
					element.setAttribute(attribute, value);
				}
			}
		});

		// Assign a unique (for the page) id to this mavo instance
		this.id = Mavo.getAttribute(this.element, "mv-app", "id") || `mavo${this.index}`;

		if (this.id in _.all) {
			// Duplicate app name
			for (var i=2; this.id + i in _.all; i++) {}
			this.id = this.id + i;
		}

		_.all[this.id] = this;
		this.element.setAttribute("mv-app", this.id);

		// Should we start in edit mode?
		this.autoEdit = this.element.classList.contains("mv-autoedit");

		// Should we save automatically?
		this.autoSave = this.element.hasAttribute("mv-autosave");
		this.autoSaveDelay = (this.element.getAttribute("mv-autosave") || 3) * 1000;

		this.element.setAttribute("typeof", "");

		Mavo.hooks.run("init-start", this);

		// Apply heuristic for groups
		for (var element of $$(_.selectors.primitive, this.element)) {
			var hasChildren = $(`${_.selectors.not(_.selectors.formControl)}, ${_.selectors.property}`, element);

			if (hasChildren) {
				var config = Mavo.Primitive.getConfig(element);
				var isCollection = Mavo.is("multiple", element);

				if (isCollection || !config.attribute && !config.hasChildren) {
					element.setAttribute("typeof", "");
				}
			}
		}

		this.expressions = new Mavo.Expressions(this);

		// Build mavo objects
		Mavo.hooks.run("init-tree-before", this);

		this.root = new Mavo.Group(this.element, this);
		this.treeBuilt.resolve();

		Mavo.hooks.run("init-tree-after", this);

		this.permissions = new Mavo.Permissions();

		var backendTypes = ["source", "storage", "init"]; // order is significant!

		// Figure out backends for storage, data reads, and initialization respectively
		for (let role of backendTypes) {
			this.updateBackend(role);
		}

		this.backendObserver = new Mavo.Observer(this.element, backendTypes.map(role => "mv-" + role), records => {
			var changed = {};

			var roles = records.map(record => {
				var role = record.attributeName.replace(/^mv-/, "");
				changed[role] = this.updateBackend(role);

				return role;
			});

			// Do we need to re-load data?
			if (changed.source) {  // if source changes, always reload
				this.load();
			}
			else if (!this.source) {
				if (changed.storage || changed.init && !this.root.data) {
					this.load();
				}
			}
		});

		this.permissions.can("login", () => {
			// We also support a URL param to trigger login, in case the user doesn't want visible login UI
			if ("login" in Mavo.Functions.$url && this.index == 1 || this.id + "-login" in Mavo.Functions.$url) {
				this.primaryBackend.login();
			}
		});

		// Update login status
		this.element.addEventListener("mavo:login.mavo", evt => {
			if (evt.backend == (this.source || this.storage)) {
				// If last time we rendered we got nothing, maybe now we'll have better luck?
				if (!this.root.data && !this.unsavedChanges) {
					this.load();
				}
			}
		});

		this.bar = new Mavo.UI.Bar(this);

		// Prevent editing properties inside <summary> to open and close the summary (fix bug #82)
		if ($("summary [property]:not([typeof])")) {
			this.element.addEventListener("click", evt => {
				if (evt.target != document.activeElement) {
					evt.preventDefault();
				}
			});
		}

		// Is there any control that requires an edit button?
		this.needsEdit = this.some(obj => obj != this.root && !obj.modes && obj.mode == "read");

		this.setUnsavedChanges(false);

		this.permissions.onchange(({action, value}) => {
			var permissions = this.element.getAttribute("mv-permissions") || "";
			permissions = permissions.trim().split(/\s+/).filter(a => a != action);

			if (value) {
				permissions.push(action);
			}

			this.element.setAttribute("mv-permissions", permissions.join(" "));
		});

		if (this.needsEdit) {
			this.permissions.can(["edit", "add", "delete"], () => {
				// Observe entire tree for mv-mode changes
				this.modeObserver = new Mavo.Observer(this.element, "mv-mode", records => {
					for (let record of records) {
						let element = record.target;

						nodeloop: for (let node of _.Node.children(element)) {
							let previousMode = node.mode, mode;

							if (node.element == element) {
								// If attribute set directly on a Mavo node, then it forces it into that mode
								// otherwise, descendant nodes still inherit, unless they are also mode-restricted
								mode = node.element.getAttribute("mv-mode");
								node.modes = mode;
							}
							else {
								// Inherited
								if (node.modes) {
									// Mode-restricted, we cannot change to the other mode
									continue nodeloop;
								}

								mode = _.getStyle(node.element.parentNode, "--mv-mode");
							}

							node.mode = mode;

							if (previousMode != node.mode) {
								node[node.mode == "edit"? "edit" : "done"]();
							}
						}
					}
				}, {subtree: true});

				if (this.autoEdit) {
					this.edit();
				}
			}, () => { // cannot
				this.modeObserver && this.modeObserver.destroy();
			});
		}

		if (this.storage || this.source) {
			// Fetch existing data
			this.permissions.can("read", () => this.load());
		}
		else {
			// No storage or source
			$.fire(this.element, "mavo:load");
		}

		this.permissions.can("save", () => {
			if (this.autoSave) {
				this.element.addEventListener("mavo:load.mavo:autosave", evt => {
					var debouncedSave = _.debounce(() => {
						this.save();
					}, this.autoSaveDelay);

					var callback = evt => {
						if (evt.node.saved) {
							debouncedSave();
						}
					};

					requestAnimationFrame(() => {
						this.permissions.can("save", () => {
							this.element.addEventListener("mavo:datachange.mavo:autosave", callback);
						}, () => {
							this.element.removeEventListener("mavo:datachange.mavo:autosave", callback);
						});
					});
				});
			}

			// Ctrl + S or Cmd + S to save
			this.element.addEventListener("keydown.mavo:save", evt => {
				if (evt.keyCode == 83 && evt[_.superKey]) {
					evt.preventDefault();
					this.save();
				}
			});
		}, () => {
			$.unbind(this.element, ".mavo:save .mavo:autosave");
		});

		Mavo.hooks.run("init-end", this);
	},

	get editing() {
		return this.root.editing;
	},

	getData: function() {
		return this.root.getData();
	},

	toJSON: function() {
		return _.toJSON(this.getData());
	},

	message: function(message, options) {
		return new _.UI.Message(this, message, options);
	},

	error: function(message, ...log) {
		this.message(message, {
			classes: "mv-error",
			dismiss: ["button", "timeout"]
		});

		// Log more info for programmers
		if (log.length > 0) {
			console.log(`%c${this.id}: ${message}`, "color: red; font-weight: bold", ...log);
		}
	},

	render: function(data) {
		this.expressions.active = false;

		var env = {context: this, data};
		_.hooks.run("render-start", env);

		if (env.data) {
			this.root.render(env.data);
		}

		this.unsavedChanges = false;

		this.expressions.active = true;
		requestAnimationFrame(() => this.expressions.update());

		_.hooks.run("render-end", env);
	},

	clear: function() {
		if (confirm("This will delete all your data. Are you sure?")) {
			this.store(null).then(() => this.root.clear());
		}
	},

	edit: function() {
		this.root.edit();

		$.events(this.element, "mouseenter.mavo:edit mouseleave.mavo:edit", evt => {
			if (evt.target.matches(_.selectors.multiple)) {
				evt.target.classList.remove("mv-has-hovered-item");

				var parent = evt.target.parentNode.closest(_.selectors.multiple);

				if (parent) {
					parent.classList.toggle("mv-has-hovered-item", evt.type == "mouseenter");
				}
			}
		}, true);

		this.setUnsavedChanges();
	},

	/**
	 * Set this mavo instance’s unsavedChanges flag.
	 * @param {Boolean} [value]
	 *        If true, just sets the flag to true, no traversal.
	 *        If false, sets the flag of the Mavo instance and every tree node to false
	 *        If not provided, traverses the tree and recalculates the flag value.
	 */
	setUnsavedChanges: function(value) {
		var unsavedChanges = !!value;

		if (!value) {
			this.walk(obj => {
				if (obj.unsavedChanges) {
					unsavedChanges = true;

					if (value === false) {
						obj.unsavedChanges = false;
					}

					return false;
				}
			});
		}

		return this.unsavedChanges = unsavedChanges;
	},

	// Conclude editing
	done: function() {
		this.root.done();
		$.unbind(this.element, ".mavo:edit");
		this.unsavedChanges = false;
	},

	/**
	 * Update the backend for a given role
	 * @return {Boolean} true if a change occurred, false otherwise
	 */
	updateBackend: function(role) {
		var previous = this[role], backend;

		if (this.index == 1) {
			backend = _.Functions.$url[role];
		}

		if (!backend) {
			backend =  _.Functions.$url[`${this.id}-${role}`] || this.element.getAttribute("mv-" + role) || null;
		}

		if (backend) {
			backend = backend.trim();

			if (backend == "none") {
				backend = null;
			}
		}

		if (backend && (!previous || !previous.equals(backend))) {
			// We have a string, convert to a backend object if different than existing
			this[role] = backend = _.Backend.create(backend, {
				mavo: this,
				format: this.element.getAttribute("mv-format-" + role) || this.element.getAttribute("mv-format")
			});
		}
		else if (!backend) {
			// We had a backend and now we will un-have it
			this[role] = null;
		}

		var changed = backend? !backend.equals(previous) : !!previous;

		if (changed) {
			// A change occured
			if (!this.storage && !this.source && this.init) {
				// If init is present with no storage and no source, init is equivalent to source
				this.source = this.init;
				this.init = null;
			}

			var permissions = this.storage? this.storage.permissions : new Mavo.Permissions({edit: true, save: false});
			permissions.parent = this.source && this.source.permissions;
			this.permissions.parent = permissions;

			this.primaryBackend = this.storage || this.source;
		}

		return changed;
	},

	/**
	 * load - Fetch data from source and render it.
	 *
	 * @return {Promise}  A promise that resolves when the data is loaded.
	 */
	load: function() {
		var backend = this.source || this.storage;

		if (!backend) {
			return Promise.resolve();
		}

		this.inProgress = "Loading";

		return backend.ready.then(() => backend.load())
		.catch(err => {
			// Try again with init
			if (this.init && this.init != backend) {
				backend = this.init;
				return this.init.ready.then(() => this.init.load());
			}

			// No init, propagate error
			return Promise.reject(err);
		})
		.catch(err => {
			if (err) {
				var xhr = err instanceof XMLHttpRequest? err : err.xhr;

				if (xhr && xhr.status == 404) {
					this.render(null);
				}
				else {
					var message = "Problem loading data";

					if (xhr) {
						message += xhr.status? `: HTTP error ${err.status}: ${err.statusText}` : ": Can’t connect to the Internet";
					}

					this.error(message, err);
				}
			}
			return null;
		})
		.then(data => this.render(data))
		.then(() => {
			this.inProgress = false;
			$.fire(this.element, "mavo:load");
		});
	},

	store: function() {
		if (!this.storage) {
			return Promise.resolve();
		}

		this.inProgress = "Saving";

		return this.storage.login()
			.then(() => this.storage.store(this.getData()))
			.catch(err => {
				if (err) {
					var message = "Problem saving data";

					if (err instanceof XMLHttpRequest) {
						message += err.status? `: HTTP error ${err.status}: ${err.statusText}` : ": Can’t connect to the Internet";
					}

					this.error(message, err);
				}

				return null;
			})
			.then(saved => {
				this.inProgress = false;
				return saved;
			});
	},

	upload: function(file, path = "images/" + file.name) {
		if (!this.uploadBackend) {
			return Promise.reject();
		}

		this.inProgress = "Uploading";

		return this.uploadBackend.upload(file, path)
			.then(url => {
				this.inProgress = false;
				return url;
			})
			.catch(err => {
				this.error("Error uploading file", err);
				this.inProgress = false;
				return null;
			});
	},

	save: function() {
		return this.store().then(saved => {
			if (saved) {
				$.fire(this.element, "mavo:save", saved);

				this.lastSaved = Date.now();
				this.root.save();
				this.unsavedChanges = false;
			}
		});
	},

	walk: function(callback) {
		return this.root.walk(callback);
	},

	/**
	 * Executes a test on every node. If ANY node passes (test returns true),
	 * the function returns true. Otherwise, it returns false.
	 * Similar semantics to Array.prototype.some().
	 */
	some: function(test) {
		return !this.walk((obj, path) => {
			var ret = test(obj, path);

			if (ret === true) {
				return false;
			}
		});
	},

	live: {
		inProgress: function(value) {
			$.toggleAttribute(this.element, "mv-progress", value, value);
		},

		unsavedChanges: function(value) {
			this.element.classList.toggle("mv-unsaved-changes", value);
		},

		needsEdit: function(value) {
			this.bar.toggle("edit", value);
		},

		storage: function(value) {
			if (value !== this._storage && !value) {
				var permissions = new Mavo.Permissions({edit: true, save: false});
				permissions.parent = this.permissions.parent;
				this.permissions.parent = permissions;
			}
		},

		primaryBackend: function(value) {
			value = value || null;

			if (value != this._primaryBackend) {
				if (value)  {
					this.element.style.setProperty("--mv-backend", `"${value.id}"`);
				}
				else {
					this.element.style.removeProperty("--mv-backend");
				}

				return value;
			}
		},

		uploadBackend: {
			get: function() {
				if (this.storage && this.storage.upload) {
					// Prioritize storage
					return this.storage;
				}
			}
		}
	},

	static: {
		all: {},

		get length() {
			return Object.keys(_.all).length;
		},

		get: function(id) {
			if (id instanceof Element) {
				// Get by element
				for (var name in _.all) {
					if (_.all[name].element == id) {
						return _.all[name];
					}
				}

				return null;
			}

			var name = typeof id === "number"? Object.keys(_.all)[id] : id;

			return _.all[name] || null;
		},

		superKey: navigator.platform.indexOf("Mac") === 0? "metaKey" : "ctrlKey",
		base: location.protocol == "about:"? (document.currentScript? document.currentScript.src : "http://mavo.io") : location,
		dependencies: [],

		init: function(container = document) {
			return $$(_.selectors.init, container)
				.filter(element => !_.get(element)) // not already inited
				.map(element => new _(element));
		},

		UI: {},

		hooks: new $.Hooks(),

		attributes: [
			"mv-app", "mv-storage", "mv-source", "mv-init", "mv-path", "mv-format",
			"mv-attribute", "mv-default", "mv-mode", "mv-edit", "mv-permisssions",
			"mv-rel"
		]
	}
});

{

let s = _.selectors = {
	init: ".mv-app, [mv-app], [data-mv-app]",
	property: "[property], [itemprop]",
	specificProperty: name => `[property=${name}], [itemprop=${name}]`,
	group: "[typeof], [itemscope], [itemtype], [mv-group]",
	multiple: "[mv-multiple]",
	formControl: "input, select, option, textarea",
	ui: ".mv-ui",
	container: {
		// "li": "ul, ol",
		"tr": "table",
		"option": "select",
		// "dt": "dl",
		// "dd": "dl"
	}
};

let arr = s.arr = selector => selector.split(/\s*,\s*/g);
let not = s.not = selector => arr(selector).map(s => `:not(${s})`).join("");
let or = s.or = (selector1, selector2) => selector1 + ", " + selector2;
let and = s.and = (selector1, selector2) => {
	var ret = [], arr2 = arr(selector2);

	arr(selector1).forEach(s1 => ret.push(...arr2.map(s2 => s1 + s2)));

	return ret.join(", ");
};
let andNot = s.andNot = (selector1, selector2) => and(selector1, not(selector2));

$.extend(_.selectors, {
	primitive: andNot(s.property, s.group),
	rootGroup: andNot(s.group, s.property),
	output: or(s.specificProperty("output"), ".mv-output")
});

}

// Init mavo. Async to give other scripts a chance to modify stuff.
requestAnimationFrame(() => {
	var isDecentBrowser = Array.from && window.Intl && document.documentElement.closest && self.URL && "searchParams" in URL.prototype;

	_.dependencies.push(
		$.ready(),
		_.Plugins.load(),
		$.include(isDecentBrowser, "https://cdn.polyfill.io/v2/polyfill.min.js?features=blissfuljs,Intl.~locale.en")
	);

	_.ready = _.all(_.dependencies);
	_.inited = _.ready.catch(console.error).then(() => Mavo.init());
});

Stretchy.selectors.filter = ".mv-editor:not([property]), .mv-autosize";

})(Bliss, Bliss.$);

(function ($, $$) {

var _ = $.extend(Mavo, {
	/**
	 * Load a file, only once
	 */
	load: (url, base = document.currentScript? document.currentScript.src : location) => {
		_.loaded = _.loaded || new Set();

		if (_.loaded.has(url + "")) {
			return;
		}

		url = new URL(url, base);

		if (/\.css$/.test(url.pathname)) {
			// CSS file
			$.create("link", {
				"href": url,
				"rel": "stylesheet",
				"inside": document.head
			});

			// No need to wait for stylesheets
			return Promise.resolve();
		}

		// JS file
		return $.include(url);
	},

	readFile: (file, format = "DataURL") => {
		var reader = new FileReader();

		return new Promise((resolve, reject) => {
			reader.onload = f => resolve(reader.result);
			reader.onerror = reader.onabort = reject;
			reader["readAs" + format](file);
		});
	},

	toJSON: data => {
		if (data === null) {
			return "";
		}

		if (typeof data === "string") {
			// Do not stringify twice!
			return data;
		}

		return JSON.stringify(data, null, "\t");
	},

	/**
	 * toJSON without cycles
	 */
	safeToJSON: function(o) {
		var cache = new WeakSet();

		return JSON.stringify(o, (key, value) => {
			if (typeof value === "object" && value !== null) {
				// No circular reference found

				if (cache.has(value)) {
					return; // Circular reference found!
				}

				cache.add(value);
			}

			return value;
		});
	},

	/**
	 * Array utlities
	 */

	// If the passed value is not an array, convert to an array
	toArray: arr => {
		return arr === undefined? [] : Array.isArray(arr)? arr : [arr];
	},

	delete: (arr, element) => {
		var index = arr && arr.indexOf(element);

		if (index > -1) {
			arr.splice(index, 1);
		}
	},

	// Recursively flatten a multi-dimensional array
	flatten: arr => {
		if (!Array.isArray(arr)) {
			return [arr];
		}

		return arr.reduce((prev, c) => _.toArray(prev).concat(_.flatten(c)), []);
	},

	// Push an item to an array iff it's not already in there
	pushUnique: (arr, item) => {
		if (arr.indexOf(item) === -1) {
			arr.push(item);
		}
	},

	/**
	 * DOM element utilities
	 */

	is: function(thing, ...elements) {
		for (let element of elements) {
			if (element && element.matches && element.matches(_.selectors[thing])) {
				return true;
			}
		}

		return false;
	},

	/**
	 * Get the current value of a CSS property on an element
	 */
	getStyle: (element, property) => element && getComputedStyle(element).getPropertyValue(property).trim(),

	/**
	 * Get/set data on an element
	 */
	data: function(element, name, value) {
		if (arguments.length == 2) {
			return $.value(element, "_", "data", "mavo", name);
		}
		else {
			element._.data.mavo = element._.data.mavo || {};
			return element._.data.mavo[name] = value;
		}
	},

	/**
	 * Revocably add/remove elements from the DOM
	 */
	revocably: {
		add: function(element, parent) {
			var comment = _.revocably.isRemoved(element);

			if (comment && comment.parentNode) {
				comment.parentNode.replaceChild(element, comment);
			}
			else if (element && parent && !element.parentNode) {
				// Has not been revocably removed because it has never even been added
				parent.appendChild(element);
			}

			return comment;
		},

		remove: function(element, commentText) {
			if (!element) {
				return;
			}

			var comment = _.data(element, "commentstub");

			if (!comment) {
				commentText = commentText || element.id || element.className || element.nodeName;
				comment = _.data(element, "commentstub", document.createComment(commentText));
			}

			if (element.parentNode) {
				// In DOM, remove
				element.parentNode.replaceChild(comment, element);
			}

			return comment;
		},

		isRemoved: function(element) {
			if (!element || element.parentNode) {
				return false;
			}

			var comment = _.data(element, "commentstub");

			if (comment && comment.parentNode) {
				return comment;
			}

			return false;
		}
	},

	inViewport: element => {
		var r = element.getBoundingClientRect();

		return (0 <= r.bottom && r.bottom <= innerHeight || 0 <= r.top && r.top <= innerHeight) // vertical
		       && (0 <= r.right && r.right <= innerWidth || 0 <= r.left && r.left <= innerWidth); // horizontal
	},

	scrollIntoViewIfNeeded: element => {
		if (element && !Mavo.inViewport(element)) {
			element.scrollIntoView({behavior: "smooth"});
		}
	},

	/**
	 * Get the value of an attribute, with fallback attributes in priority order.
	 */
	getAttribute: function(element, ...attributes) {
		for (let i=0, attribute; attribute = attributes[i]; i++) {
			let value = element.getAttribute(attribute);

			if (value) {
				return value;
			}
		}

		return null;
	},

	/**
	 * Object utilities
	 */

	subset: function(obj, path, value) {
		if (arguments.length == 3) {
			// Put
			if (path.length) {
				var parent = $.value(obj, ...path.slice(0, -1));
				parent[path[path.length - 1]] = value;
				return obj;
			}

			return value;
		}
		else if (typeof obj == "object" && path && path.length) { // Get
			return path.reduce((obj, property, i) => {
				if (obj && property in obj) {
					return obj[property];
				}

				if (Array.isArray(obj) && isNaN(property)) {
					// Non-numeric property on array, try getting by id
					for (var j=0; j<obj.length; j++) {
						if (obj[j] && obj[j].id == property) {
							path[i] = j;
							return obj[j];
						}
					}
				}

				return obj;

			}, obj);
		}
		else {
			return obj;
		}
	},

	clone: function(o) {
		return JSON.parse(_.safeToJSON(o));
	},

	// Credit: https://remysharp.com/2010/07/21/throttling-function-calls
	debounce: function (fn, delay) {
		if (!delay) {
			// No throttling
			return fn;
		}

		var timer = null, code;

		return function () {
			var context = this, args = arguments;
			code = function () {
				fn.apply(context, args);
				removeEventListener("beforeunload", code);
			};

			clearTimeout(timer);
			timer = setTimeout(code, delay);
			addEventListener("beforeunload", code);
		};
	},

	escapeRegExp: s => s.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&"),

	Observer: $.Class({
		constructor: function(element, attribute, callback, o = {}) {
			if (callback instanceof MutationObserver) {
				this.observer = callback;
			}

			this.observer = this.observer || new MutationObserver(callback);
			this.element = element;
			this.callback = callback;
			this.attribute = attribute;

			this.options = $.extend({}, o);

			if (attribute) {
				$.extend(this.options, {
					attributes: true,
					attributeFilter: this.attribute == "all"? undefined : Mavo.toArray(this.attribute),
					attributeOldValue: !!o.oldValue
				});
			}

			if (!this.attribute || this.attribute == "all") {
				$.extend(this.options, {
					characterData: true,
					childList: true,
					subtree: true,
					characterDataOldValue: !!o.oldValue
				});
			}

			this.run();
		},

		stop: function() {
			this.observer.disconnect();
			this.running = false;

			return this;
		},

		run: function() {
			if (this.observer) {
				this.observer.observe(this.element, this.options);
				this.running = true;
			}

			return this;
		},

		/**
		 * Disconnect an observer, run some code, then observe again
		 */
		sneak: function(callback) {
			if (this.running) {
				this.stop();
				var ret = callback();
				this.run();
			}
			else {
				var ret = callback();
			}

			return ret;
		},

		destroy: function() {
			this.observer.disconnect();
			this.observer = this.element = null;
		},

		static: {
			sneak: function(observer, callback) {
				return observer? observer.sneak(callback) : callback();
			}
		}
	}),

	defer: function(constructor) {
		var res, rej;

		var promise = new Promise((resolve, reject) => {
			if (constructor) {
				constructor(resolve, reject);
			}

			res = resolve;
			rej = reject;
		});

		promise.resolve = a => {
			res(a);
			return promise;
		};

		promise.reject = a => {
			rej(a);
			return promise;
		};

		return promise;
	},

	/**
	 * Similar to Promise.all() but can handle post-hoc additions
	 * and does not reject if one promise rejects.
	 */
	all: function(iterable) {
		// Turn rejected promises into resolved ones
		for (let promise of iterable) {
			if ($.type(promise) == "promise") {
				promise = promise.catch(err => err);
			}
		}

		return Promise.all(iterable).then(resolved => {
			if (iterable.length != resolved.length) {
				// The list of promises or values changed. Return a new Promise.
				// The original promise won't resolve until the new one does.
				return _.all(iterable);
			}

			// The list of promises or values stayed the same.
			// Return results immediately.
			return resolved;
		});
	},

	/**
	 * Run & Return a function
	 */
	rr: function(f) {
		f();
		return f;
	}
});

// Bliss plugins

$.add("toggleAttribute", function(name, value, test = value !== null) {
	if (test) {
		this.setAttribute(name, value);
	}
	else {
		this.removeAttribute(name);
	}
});

// Provide shortcuts to long property chains
$.proxy = $.classProps.proxy = $.overload(function(obj, property, proxy) {
	Object.defineProperty(obj, property, {
		get: function() {
			return this[proxy][property];
		},
		set: function(value) {
			this[proxy][property] = value;
		},
		configurable: true,
		enumerable: true
	});

	return obj;
});

$.classProps.propagated = function(proto, names) {
	Mavo.toArray(names).forEach(name => {
		var existing = proto[name];

		proto[name] = function() {
			var ret = existing && existing.apply(this, arguments);

			if (this.propagate && ret !== false) {
				this.propagate(name);
			}
		};
	});
};

// :focus-within and :target-within shim
function updateWithin(cl, element) {
	cl = "mv-" + cl + "-within";
	$$("." + cl).forEach(el => el.classList.remove(cl));

	while (element && element.classList) {
		element.classList.add(cl);
		element = element.parentNode;
	}
};

document.addEventListener("focus", evt => {
	updateWithin("focus", evt.target);
}, true);

document.addEventListener("blur", evt => {
	updateWithin("focus", null);
}, true);

addEventListener("hashchange", evt => {
	updateWithin("target", $(location.hash));
});

document.documentElement.addEventListener("mavo:datachange", evt => {
	// TODO debounce
	updateWithin("target", $(location.hash));
});

updateWithin("focus", document.activeElement !== document.body? document.activeElement : null);

})(Bliss, Bliss.$);

(function ($) {

Mavo.attributes.push("mv-plugins");

var _ = Mavo.Plugins = {
	loaded: {},

	load: function() {
		_.plugins = new Set();

		for (let element of $$("[mv-plugins]")) {
			let plugins = element.getAttribute("mv-plugins").trim().split(/\s+/);

			for (let plugin of plugins) {
				_.plugins.add(plugin);
			}
		}

		if (!_.plugins.size) {
			return Promise.resolve();
		}

		// Fetch plugin index
		return $.fetch(_.url + "/plugins.json", {
			responseType: "json"
		}).then(xhr => {
			// Fetch plugins
			return Mavo.all(xhr.response.plugin
				.filter(plugin => _.plugins.has(plugin.id))
				.map(plugin => {
					// Load plugin

					if (plugin.repo) {
						// Plugin hosted in a separate repo
						var base = `https://raw.githubusercontent.com/${plugin.repo}/`;
					}
					else {
						// Plugin hosted in the mavo-plugins repo
						var base = `${_.url}/${plugin.id}/`;
					}

					var url = `${base}mavo-${plugin.id}.js`;

					return $.include(_.loaded[plugin.id], url);
				}));
		});
	},

	register: function(o) {
		if (o.name && _.loaded[o.name]) {
			// Do not register same plugin twice
			return;
		}

		Mavo.hooks.add(o.hooks);

		for (let Class in o.extend) {
			let existing = Class == "Mavo"? Mavo : Mavo[Class];

			if ($.type(existing) === "function") {
				$.Class(existing, o.extend[Class]);
			}
			else {
				$.extend(existing, o.extend[Class]);
			}
		}

		var ready = [];

		if (o.ready) {
			ready.push(o.ready);
		}

		if (o.dependencies) {
			var base = document.currentScript? document.currentScript.src : location;
			var dependencies = o.dependencies.map(url => Mavo.load(url, base));
			ready.push(...dependencies);
		}

		if (ready.length) {
			Mavo.dependencies.push(...ready);
		}

		if (o.name) {
			_.loaded[o.name] = o;
		}

		if (o.init) {
			Promise.all(ready).then(() => o.init());
		}
	},

	url: "https://plugins.mavo.io/"
};

})(Bliss);

(function ($, $$) {

Mavo.attributes.push("mv-bar");

var _ = Mavo.UI.Bar = $.Class({
	constructor: function(mavo) {
		this.mavo = mavo;

		this.element = $(".mv-bar", this.mavo.element) || $.create({
			className: "mv-bar mv-ui",
			start: this.mavo.element,
			innerHTML: "<button>&nbsp;</button>"
		});

		if (this.element.classList.contains("mv-compact")) {
			this.noResize = true;
		}

		this.order = this.mavo.element.getAttribute("mv-bar") || this.element.getAttribute("mv-bar");

		if (this.order) {
			this.order = this.order == "none"? [] : this.order.split(/\s+/);
		}
		else {
			this.order = Object.keys(_.controls);
		}

		this.order = this.order.filter(id => _.controls[id]);

		if (this.order.length) {
			// Measure height of 1 row
			this.targetHeight = this.element.offsetHeight;
		}

		this.element.innerHTML = "";

		for (let id of this.order) {
			let o = _.controls[id];

			if (o.create) {
				this[id] = o.create.call(this.mavo);
			}
			else {
				var label = o.label || Mavo.Functions.readable(id);

				this[id] = $.create("button", {
					className: `mv-${id}`,
					textContent: label,
					title: label
				});
			}

			// We initially add all of them to retain order,
			// then we remove revocably when/if needed
			this.add(id);

			if (o.permission) {
				this.permissions.can(o.permission, () => {
					this.toggle(id, !o.condition || o.condition.call(this.mavo));
				}, () => {
					this.remove(id);
				});
			}
			else if (o.condition && !o.condition.call(this.mavo)) {
				this.remove(id);
			}

			for (var events in o.events) {
				$.events(this[id], events, o.events[events].bind(this.mavo));
			}

			if (o.action) {
				$.delegate(this.element, "click", ".mv-" + id, () => {
					if (!o.permission || this.permissions.is(o.permission)) {
						o.action.call(this.mavo);
					}
				});
			}
		}

		if (this.order.length && !this.noResize) {
			this.resize();

			if (self.ResizeObserver) {
				var previousRect = null;

				this.resizeObserver = new ResizeObserver(entries => {
					var contentRect = entries[entries.length - 1].contentRect;

					if (previousRect
						&& previousRect.width == contentRect.width
						&& previousRect.height == contentRect.height) {
						return;
					}

					this.resize();

					previousRect = contentRect;
				});

				this.resizeObserver.observe(this.element);
			}
		}
	},

	resize: function() {
		if (!this.targetHeight) {
			// We don't have a correct measurement for target height, abort
			this.targetHeight = this.element.offsetHeight;
			return;
		}

		this.resizeObserver && this.resizeObserver.disconnect();

		this.element.classList.remove("mv-compact", "mv-tiny");

		// Exceeded single row?
		if (this.element.offsetHeight > this.targetHeight * 1.5) {
			this.element.classList.add("mv-compact");

			if (this.element.offsetHeight > this.targetHeight * 1.2) {
				// Still too tall
				this.element.classList.add("mv-tiny");
			}
		}

		this.resizeObserver && this.resizeObserver.observe(this.element);
	},

	add: function(id) {
		var o =_.controls[id];

		if (o.prepare) {
			o.prepare.call(this.mavo);
		}

		Mavo.revocably.add(this[id], this.element);

		if (!this.resizeObserver && !this.noResize) {
			requestAnimationFrame(() => this.resize());
		}
	},

	remove: function(id) {
		var o =_.controls[id];

		Mavo.revocably.remove(this[id], "mv-" + id);

		if (o.cleanup) {
			o.cleanup.call(this.mavo);
		}

		if (!this.resizeObserver && !this.noResize) {
			requestAnimationFrame(() => this.resize());
		}
	},

	toggle: function(id, add) {
		return this[add? "add" : "remove"](id);
	},

	proxy: {
		"permissions": "mavo"
	},

	static: {
		controls: {
			status: {
				create: function() {
					var status = $.create({
						className: "mv-status"
					});

					return status;
				},
				prepare: function() {
					var backend = this.primaryBackend;

					if (backend && backend.user) {
						var user = backend.user;
						var html = user.name || "";

						if (user.avatar) {
							html = `<img class="mv-avatar" src="${user.avatar}" /> ${html}`;
						}

						if (user.url) {
							html = `<a href="${user.url}" target="_blank">${html}</a>`;
						}

						this.bar.status.innerHTML = html;
					}
				},
				permission: "logout"
			},

			edit: {
				action: function() {
					if (this.editing) {
						this.done();
					}
					else {
						this.edit();
					}
				},
				permission: ["edit", "add", "delete"],
				cleanup: function() {
					if (this.editing) {
						this.done();
					}
				}
			},

			save: {
				action: function() {
					this.save();
				},
				events: {
					"mouseenter focus": function() {
						this.element.classList.add("mv-highlight-unsaved");
					},
					"mouseleave blur": function() {
						this.element.classList.remove("mv-highlight-unsaved");
					}
				},
				permission: "save",
				condition: function() {
					return !this.autoSave || this.autoSaveDelay > 0;
				}
			},

			clear: {
				action: function() {
					this.clear();
				},
				permission: "delete"
			},

			login: {
				action: function() {
					this.primaryBackend.login();
				},
				permission: "login"
			},

			logout: {
				action: function() {
					this.primaryBackend.logout();
				},
				permission: "logout"
			}
		}
	}
});

})(Bliss, Bliss.$);

(function ($, $$) {

var _ = Mavo.UI.Message = $.Class({
	constructor: function(mavo, message, o) {
		this.mavo = mavo;
		this.message = message;
		this.closed = Mavo.defer();

		this.element = $.create({
			className: "mv-ui mv-message",
			innerHTML: this.message,
			events: {
				click: e => Mavo.scrollIntoViewIfNeeded(this.mavo.element)
			},
			after: this.mavo.bar.element
		});

		if (o.classes) {
			this.element.classList.add(o.classes);
		}

		o.dismiss = o.dismiss || {};

		if (typeof o.dismiss == "string" || Array.isArray(o.dismiss)) {
			var dismiss = {};
			for (let prop of Mavo.toArray(o.dismiss)) {
				dismiss[prop] = true;
			}
			o.dismiss = dismiss;
		}

		if (o.dismiss.button) {
			$.create("button", {
				className: "mv-close mv-ui",
				textContent: "×",
				events: {
					"click": evt => this.close()
				},
				start: this.element
			});
		}

		if (o.dismiss.timeout) {
			var timeout = typeof o.dismiss.timeout === "number"? o.dismiss.timeout : 5000;
			var closeTimeout;

			$.events(this.element, {
				mouseenter: e => clearTimeout(closeTimeout),
				mouseleave: Mavo.rr(e => closeTimeout = setTimeout(() => this.close(), timeout)),
			});
		}

		if (o.dismiss.submit) {
			this.element.addEventListener("submit", evt => {
				evt.preventDefault();
				this.close(evt.target);
			});
		}
	},

	close: function(resolve) {
		$.transition(this.element, {opacity: 0}).then(() => {
			$.remove(this.element);
			this.closed.resolve(resolve);
		});
	}
});

})(Bliss, Bliss.$);

(function($) {

var _ = Mavo.Permissions = $.Class({
	constructor: function(o) {
		this.triggers = [];
		this.hooks = new $.Hooks();

		// If we don’t do this, there is no way to retrieve this from inside parentChanged
		this.parentChanged = _.prototype.parentChanged.bind(this);

		this.set(o);
	},

	// Set multiple permissions at once
	set: function(o) {
		for (var action in o) {
			this[action] = o[action];
		}
	},

	// Set a bunch of permissions to true. Chainable.
	on: function(actions) {
		Mavo.toArray(actions).forEach(action => this[action] = true);

		return this;
	},

	// Set a bunch of permissions to false. Chainable.
	off: function(actions) {
		actions = Array.isArray(actions)? actions : [actions];

		actions.forEach(action => this[action] = false);

		return this;
	},

	// Fired once at least one of the actions passed can be performed
	// Kind of like a Promise that can be resolved multiple times.
	can: function(actions, callback, cannot) {
		this.observe(actions, true, callback);

		if (cannot) {
			// Fired once the action cannot be done anymore, even though it could be done before
			this.cannot(actions, cannot);
		}
	},

	// Fired once NONE of the actions can be performed
	cannot: function(actions, callback) {
		this.observe(actions, false, callback);
	},

	// Schedule a callback for when a set of permissions changes value
	observe: function(actions, value, callback) {
		actions = Mavo.toArray(actions);

		if (this.is(actions, value)) {
			// Should be fired immediately
			callback();
		}

		// For future transitions
		this.triggers.push({ actions, value, callback, active: true });
	},

	// Compare a set of permissions with true or false
	// If comparing with true, we want at least one to be true, i.e. OR
	// If comparing with false, we want ALL to be false, i.e. NOR
	is: function(actions, able = true) {
		var or = Mavo.toArray(actions).map(action => !!this[action])
		                .reduce((prev, current) => prev || current);

		return able? or : !or;
	},

	// Monitor all changes
	onchange: function(callback) {
		// Future changes
		this.hooks.add("change", callback);

		// Fire for current values
		for (let action of _.actions) {
			callback.call(this, {action, value: this[action]});
		}
	},

	parentChanged: function(o = {}) {
		var localValue = this["_" + o.action];

		if (localValue !== undefined || o.from == o.value) {
			// We have a local value so we don’t care about parent changes OR nothing changed
			return;
		}

		this.fireTriggers(o.action);

		this.hooks.run("change", $.extend({context: this}, o));
	},

	// A single permission changed value
	changed: function(action, value, from) {
		from = !!from;
		value = !!value;

		if (value == from) {
			// Nothing changed
			return;
		}

		// $.live() calls the setter before the actual property is set so we
		// need to set it manually, otherwise it still has its previous value
		this["_" + action] = value;

		this.fireTriggers(action);

		this.hooks.run("change", {action, value, from, context: this});
	},

	fireTriggers: function(action) {
		for (let trigger of this.triggers) {
			var match = this.is(trigger.actions, trigger.value);

			if (trigger.active && trigger.actions.indexOf(action) > -1 && match) {

				trigger.active = false;
				trigger.callback();
			}
			else if (!match) {
				// This is so that triggers can only be executed in an actual transition
				// And that if there is a trigger for [a,b] it won't be executed twice
				// if a and b are set to true one after the other
				trigger.active = true;
			}
		}
	},

	or: function(permissions) {
		for (let action of _.actions) {
			this[action] = this[action] || permissions[action];
		}

		return this;
	},

	live: {
		parent: function(parent) {
			var oldParent = this._parent;

			if (oldParent == parent) {
				return;
			}

			this._parent = parent;

			// Remove previous trigger, if any
			if (oldParent) {
				Mavo.delete(oldParent.hooks.change, this.parentChanged);
			}

			// What changes does this cause? Fire triggers for them
			for (let action of _.actions) {
				this.parentChanged({
					action,
					value: parent? parent[action] : undefined,
					from: oldParent? oldParent[action] : undefined
				});
			}

			if (parent) {
				// Add new trigger
				parent.onchange(this.parentChanged);
			}
		}
	},

	static: {
		actions: [],

		// Register a new permission type
		register: function(action, setter) {
			if (Array.isArray(action)) {
				action.forEach(action => _.register(action, setter));
				return;
			}

			$.live(_.prototype, action, {
				get: function() {
					var ret = this["_" + action];

					if (ret === undefined && this.parent) {
						return this.parent[action];
					}

					return ret;
				},
				set: function(able, previous) {
					if (setter) {
						setter.call(this, able, previous);
					}

					this.changed(action, able, previous);
				}
			});

			_.actions.push(action);
		}
	}
});

_.register(["read", "save"]);

_.register("login", function(can) {
	if (can && this.logout) {
		this.logout = false;
	}
});

_.register("logout", function(can) {
	if (can && this.login) {
		this.login = false;
	}
});

_.register("edit", function(can) {
	if (can) {
		this.add = this.delete = true;
	}
});

_.register(["add", "delete"], function(can) {
	if (!can) {
		this.edit = false;
	}
});

})(Bliss);

(function($) {

/**
 * Base class for all backends
 */
var _ = Mavo.Backend = $.Class({
	constructor: function(url, o = {}) {
		this.source = url;
		this.url = new URL(this.source, Mavo.base);
		this.mavo = o.mavo;
		this.format = Mavo.Formats.create(o.format, this);

		// Permissions of this particular backend.
		this.permissions = new Mavo.Permissions();
	},

	get: function(url = new URL(this.url)) {
		url.searchParams.set("timestamp", Date.now()); // ensure fresh copy

		return $.fetch(url.href).then(xhr => Promise.resolve(xhr.responseText), () => Promise.resolve(null));
	},

	load: function() {
		return this.ready
			.then(() => this.get())
			.then(response => {
			if (typeof response != "string") {
				// Backend did the parsing, we're done here
				return response;
			}

			response = response.replace(/^\ufeff/, ""); // Remove Unicode BOM

			return this.format.parse(response);
		});
	},

	store: function(data, {path, format = this.format} = {}) {
		return this.ready.then(() => {
			var serialize = typeof data === "string"? Promise.resolve(data) : format.stringify(data);

			return serialize.then(serialized => this.put(serialized, path).then(() => {
				return {data, serialized};
			}));
		});
	},

	// To be be overriden by subclasses
	ready: Promise.resolve(),
	login: () => Promise.resolve(),
	logout: () => Promise.resolve(),

	isAuthenticated: function() {
		return !!this.accessToken;
	},

	// Any extra params to be passed to the oAuth URL.
	oAuthParams: () => "",

	toString: function() {
		return `${this.id} (${this.url})`;
	},

	equals: function(backend) {
		return backend === this || (backend && this.id == backend.id && this.source == backend.source);
	},

	/**
	 * Helper for making OAuth requests with JSON-based APIs.
	 */
	request: function(call, data, method = "GET", req = {}) {
		req.method = req.method || method;
		req.responseType = req.responseType || "json";
		req.headers = req.headers || {};
		req.headers["Content-Type"] = req.headers["Content-Type"] || "application/json; charset=utf-8";
		req.data = data;

		if (this.isAuthenticated()) {
			req.headers["Authorization"] = req.headers["Authorization"] || `Bearer ${this.accessToken}`;
		}

		if ($.type(req.data) === "object") {
			if (req.method == "GET") {
				req.data = Object.keys(req.data).map(p => p + "=" + encodeURIComponent(req.data[p])).join("&");
			}
			else {
				req.data = JSON.stringify(req.data);
			}
		}

		call = new URL(call, this.constructor.apiDomain);

		return $.fetch(call, req)
			.catch(err => {
				if (err && err.xhr) {
					return Promise.reject(err.xhr);
				}
				else {
					this.mavo.error("Something went wrong while connecting to " + this.id, err);
				}
			})
			.then(xhr => req.method == "HEAD"? xhr : xhr.response);
	},

	/**
	 * Helper method for authenticating in OAuth APIs
	 */
	oAuthenticate: function(passive) {
		return this.ready.then(() => {
			if (this.isAuthenticated()) {
				return Promise.resolve();
			}

			return new Promise((resolve, reject) => {
				var id = this.id.toLowerCase();

				if (passive) {
					this.accessToken = localStorage[`mavo:${id}token`];

					if (this.accessToken) {
						resolve(this.accessToken);
					}
				}
				else {
					// Show window
					var popup = {
						width: Math.min(1000, innerWidth - 100),
						height: Math.min(800, innerHeight - 100)
					};

					popup.top = (innerHeight - popup.height)/2 + (screen.top || screenTop);
					popup.left = (innerWidth - popup.width)/2 + (screen.left || screenLeft);

					var state = {
						url: location.href,
						backend: this.id
					};

					this.authPopup = open(`${this.constructor.oAuth}?client_id=${this.key}&state=${encodeURIComponent(JSON.stringify(state))}` + this.oAuthParams(),
						"popup", `width=${popup.width},height=${popup.height},left=${popup.left},top=${popup.top}`);

					addEventListener("message", evt => {
						if (evt.source === this.authPopup) {
							if (evt.data.backend == this.id) {
								this.accessToken = localStorage[`mavo:${id}token`] = evt.data.token;
							}

							if (!this.accessToken) {
								reject(Error("Authentication error"));
							}

							resolve(this.accessToken);
						}
					});
				}
			});
		});
	},

	/**
	 * oAuth logout helper
	 */
	oAuthLogout: function() {
		if (this.isAuthenticated()) {
			var id = this.id.toLowerCase();

			localStorage.removeItem(`mavo:${id}token`);
			delete this.accessToken;

			this.permissions.off(["edit", "add", "delete", "save"]).on("login");

			this.mavo.element._.fire("mavo:logout", {backend: this});
		}

		return Promise.resolve();
	},

	static: {
		// Return the appropriate backend(s) for this url
		create: function(url, o) {
			if (url) {
				var Backend = _.types.filter(Backend => Backend.test(url))[0] || _.Remote;

				return new Backend(url, o);
			}

			return null;
		},

		types: [],

		register: function(Class) {
			_[Class.prototype.id] = Class;
			_.types.push(Class);
			return Class;
		}
	}
});

/**
 * Save in an HTML element
 */
_.register($.Class({
	id: "Element",
	extends: _,
	constructor: function () {
		this.permissions.on(["read", "edit", "save"]);

		this.element = $(this.source) || $.create("script", {
			type: "application/json",
			id: this.source.slice(1),
			inside: document.body
		});
	},

	get: function() {
		return Promise.resolve(this.element.textContent);
	},

	put: function(serialized) {
		return Promise.resolve(this.element.textContent = serialized);
	},

	static: {
		test: url => url.indexOf("#") === 0
	}
}));

// Load from a remote URL, no save
_.register($.Class({
	id: "Remote",
	extends: _,
	constructor: function() {
		this.permissions.on("read");
	},

	static: {
		test: url => false
	}
}));

// Save in localStorage
_.register($.Class({
	extends: _,
	id: "Local",
	constructor: function() {
		this.permissions.on(["read", "edit", "save"]);
		this.key = this.mavo.id;
	},

	get: function() {
		return Promise[this.key in localStorage? "resolve" : "reject"](localStorage[this.key]);
	},

	put: function(serialized) {
		if (!serialized) {
			delete localStorage[this.key];
		}
		else {
			localStorage[this.key] = serialized;
		}

		return Promise.resolve(serialized);
	},

	static: {
		test: value => value == "local"
	}
}));

})(Bliss);

(function($, $$) {

var _ = Mavo.Formats = {};

var base = _.Base = $.Class({
	abstract: true,
	constructor: function(backend) {
		this.backend = backend;
	},
	proxy: {
		"mavo": "backend"
	},

	// So that child classes can only override the static methods if they don't
	// need access to any instance variables.
	parse: function(content) {
		return this.constructor.parse(content, this);
	},
	stringify: function(data) {
		return this.constructor.stringify(data, this);
	},

	static: {
		parse: serialized => Promise.resolve(serialized),
		stringify: data => Promise.resolve(data),
		extensions: [],
		dependencies: [],
		ready: function() {
			return Promise.all(this.dependencies.map(d => $.include(d.test(), d.url)));
		}
	}
});

var json = _.JSON = $.Class({
	extends: _.Base,
	static: {
		parse: serialized => Promise.resolve(serialized? JSON.parse(serialized) : null),
		stringify: data => Promise.resolve(Mavo.toJSON(data)),
		extensions: [".json", ".jsonld"]
	}
});

var text = _.Text = $.Class({
	extends: _.Base,
	constructor: function(backend) {
		this.property = this.mavo.root.getNames("Primitive")[0];
	},

	static: {
		extensions: [".txt"],
		parse: (serialized, me) => Promise.resolve({[me? me.property : "content"]: serialized}),
		stringify: (data, me) => Promise.resolve(data[me? me.property : "content"])
	}
});

var csv = _.CSV = $.Class({
	extends: _.Base,
	constructor: function(backend) {
		this.property = this.mavo.root.getNames("Collection")[0];
		this.options = $.extend({}, _.CSV.defaultOptions);
	},

	static: {
		extensions: [".csv", ".tsv"],
		defaultOptions: {
			header: true,
			dynamicTyping: true,
			skipEmptyLines: true
		},
		dependencies: [{
			test: () => self.Papa,
			url: "https://cdnjs.cloudflare.com/ajax/libs/PapaParse/4.1.4/papaparse.min.js"
		}],
		ready: base.ready,
		parse: (serialized, me) => csv.ready().then(() => {
			var data = Papa.parse(serialized, csv.defaultOptions);
			var property = me? me.property : "content";

			if (me) {
				// Get delimiter & linebreak for serialization
				me.options.delimiter = data.meta.delimiter;
				me.options.linebreak = data.meta.linebreak;
			}

			if (data.meta.aborted) {
				throw data.meta.errors.pop();
			}

			return {
				[property]: data.data
			};
		}),

		stringify: (serialized, me) => csv.ready().then(() => {
			var property = me? me.property : "content";
			var options = me? me.options : csv.defaultOptions;
			return Papa.unparse(data[property], options);
		})
	}
});

Object.defineProperty(_, "create", {
	value: function(format, backend) {
		if (format && typeof format === "object") {
			return format;
		}

		if (typeof format === "string") {
			// Search by id
			format = format.toLowerCase();

			for (var id in _) {
				var Format = _[id];

				if (id.toLowerCase() == format) {
					return new Format(backend);
				}
			}
		}

		if (!format) {
			var url = backend.url? backend.url.pathname : backend.source;
			var extension = (url.match(/\.\w+$/) || [])[0] || ".json";
			var Format = _.JSON;

			for (var id in _) {
				if (_[id].extensions.indexOf(extension) > -1) {
					// Do not return match, as we may find another match later
					// and last match wins
					Format = _[id];
				}
			}

			return new Format(backend);
		}
	}
});

})(Bliss, Bliss.$);

(function($, $$) {

var _ = Mavo.Node = $.Class({
	abstract: true,
	constructor: function (element, mavo, options = {}) {
		if (!element || !mavo) {
			throw new Error("Mavo.Node constructor requires an element argument and a mavo object");
		}

		var env = {context: this, options};

		// Set these first, for debug reasons
		this.uid = ++_.maxId;
		this.nodeType = this.nodeType;
		this.property = null;
		this.element = element;

		$.extend(this, env.options);

		_.all.set(element, [...(_.all.get(this.element) || []), this]);

		this.mavo = mavo;
		this.group = this.parentGroup = env.options.group;

		this.template = env.options.template;

		if (this.template) {
			this.template.copies.push(this);
		}
		else {
			// First (or only) of its kind
			this.copies = [];
		}

		if (!this.fromTemplate("property", "type")) {
			this.property = _.getProperty(element);
			this.type = Mavo.Group.normalize(element);
			this.storage = this.element.getAttribute("mv-storage"); // TODO rename to storage
		}

		this.modes = this.element.getAttribute("mv-mode");

		Mavo.hooks.run("node-init-start", env);

		this.mode = Mavo.getStyle(this.element, "--mv-mode") || "read";

		this.collection = env.options.collection;

		if (this.collection) {
			// This is a collection item
			this.group = this.parentGroup = this.collection.parentGroup;
		}

		// Must run before collections have a marker which messes up paths
		var template = this.template;

		if (template && template.expressions) {
			// We know which expressions we have, don't traverse again
			this.expressions = template.expressions.map(et => new Mavo.DOMExpression({
				template: et,
				item: this,
				mavo: this.mavo
			}));
		}

		Mavo.hooks.run("node-init-end", env);
	},

	get editing() {
		return this.mode == "edit";
	},

	get isRoot() {
		return !this.property;
	},

	get name() {
		return Mavo.Functions.readable(this.property || this.type).toLowerCase();
	},

	get saved() {
		return this.storage !== "none";
	},

	get path() {
		var path = this.parentGroup? this.parentGroup.path : [];

		return this.property? [...path, this.property] : path;
	},

	/**
	 * Runs after the constructor is done (including the constructor of the inheriting class), synchronously
	 */
	postInit: function() {
		if (this.modes == "edit") {
			this.edit();
		}
	},

	destroy: function() {
		if (this.template) {
			Mavo.delete(this.template.copies, this);
		}
	},

	getData: function(o = {}) {
		if (this.isDataNull(o)) {
			return null;
		}
	},

	isDataNull: function(o) {
		var env = {
			context: this,
			options: o,
			result: this.deleted || !this.saved && !o.live
		};

		Mavo.hooks.run("unit-isdatanull", env);

		return env.result;
	},

	/**
	 * Execute a callback on every node of the Mavo tree
	 * If callback returns (strict) false, walk stops.
	 * @return false if was stopped via a false return value, true otherwise
	 */
	walk: function(callback, path = []) {
		var walker = (obj, path) => {
			var ret = callback(obj, path);

			if (ret !== false) {
				for (let i in obj.children) {
					let node = obj.children[i];

					if (node instanceof Mavo.Node) {
						var ret = walker.call(node, node, [...path, i]);

						if (ret === false) {
							return false;
						}
					}
				}
			}

			return ret !== false;
		};

		return walker(this, path);
	},

	walkUp: function(callback) {
		var group = this;

		while (group = group.parentGroup) {
			var ret = callback(group);

			if (ret !== undefined) {
				return ret;
			}
		}
	},

	edit: function() {
		this.mode = "edit";

		if (this.mode != "edit") {
			return false;
		}

		Mavo.hooks.run("node-edit-end", this);
	},

	done: function() {
		this.mode = Mavo.getStyle(this.element.parentNode, "--mv-mode") || "read";

		if (this.mode != "read") {
			return false;
		}

		$.unbind(this.element, ".mavo:edit");

		this.propagate("done");

		Mavo.hooks.run("node-done-end", this);
	},

	propagate: function(callback) {
		for (let i in this.children) {
			let node = this.children[i];

			if (node instanceof Mavo.Node) {
				if (typeof callback === "function") {
					callback.call(node, node);
				}
				else if (callback in node) {
					node[callback]();
				}
			}
		}
	},

	propagated: ["save", "destroy"],

	toJSON: Mavo.prototype.toJSON,

	fromTemplate: function(...properties) {
		if (this.template) {
			for (let property of properties) {
				this[property] = this.template[property];
			}
		}

		return !!this.template;
	},

	render: function(data) {
		this.oldData = this.data;
		this.data = data;

		data = Mavo.subset(data, this.inPath);

		var env = {context: this, data};

		Mavo.hooks.run("node-render-start", env);

		if (this.nodeType != "Collection" && Array.isArray(data)) {
			// We are rendering an array on a singleton, what to do?
			var properties;
			if (this.isRoot && (properties = Object.keys(this.children)).length === 1 && this.children[properties[0]].nodeType === "Collection") {
				// If it's root with only one collection property, render on that property
				env.data = {
					[properties[0]]: env.data
				};
			}
			else {
				// Otherwise, render first item
				this.inPath.push("0");
				env.data = env.data[0];
			}
		}

		if (this.editing) {
			this.done();
			this.dataRender(env.data);
			this.edit();
		}
		else {
			this.dataRender(env.data);
		}

		this.save();

		Mavo.hooks.run("node-render-end", env);
	},

	dataChanged: function(action, o = {}) {
		$.fire(o.element || this.element, "mavo:datachange", $.extend({
			property: this.property,
			action,
			mavo: this.mavo,
			node: this
		}, o));
	},

	toString: function() {
		return `#${this.uid}: ${this.nodeType} (${this.property})`;
	},

	getClosestCollection: function() {
		if (this.collection && this.collection.mutable) {
			return this.collection;
		}

		if (this.group.collection && this.group.collection.mutable) {
			return this.group.collection;
		}

		return this.parentGroup? this.parentGroup.closestCollection : null;
	},

	/**
	 * Check if this unit is either deleted or inside a deleted group
	 */
	isDeleted: function() {
		var ret = this.deleted;

		if (this.deleted) {
			return true;
		}

		return !!this.parentGroup && this.parentGroup.isDeleted();
	},

	relativizeData: function(data, options = {live: true}) {
		return new Proxy(data, {
			get: (data, property, proxy) => {
				// Checking if property is in proxy might add it to the data
				if (property in data || (property in proxy && property in data)) {
					var ret = data[property];

					return ret;
				}
			},

			has: (data, property) => {
				if (property in data) {
					return true;
				}

				// Property does not exist, look for it elsewhere

				// Special values
				switch (property) {
					case "$index":
						data[property] = this.index || 0;
						return true; // if index is 0 it's falsy and has would return false!
					case "$next":
					case "$previous":
						if (this.closestCollection) {
							data[property] = this.closestCollection.getData(options)[this.index + (property == "$next"? 1 : -1)];
							return true;
						}

						data[property] = null;
						return false;
				}

				if (this instanceof Mavo.Group && property == this.property && this.collection) {
					data[property] = data;
					return true;
				}

				// First look in ancestors
				var ret = this.walkUp(group => {
					if (property in group.children) {
						return group.children[property];
					};
				});

				if (ret === undefined) {
					// Still not found, look in descendants
					ret = this.find(property);
				}

				if (ret !== undefined) {
					if (Array.isArray(ret)) {
						ret = ret.map(item => item.getData(options))
								 .filter(item => item !== null);
					}
					else if (ret instanceof Mavo.Node) {
						ret = ret.getData(options);
					}

					data[property] = ret;

					return true;
				}

				// Does it reference another Mavo?
				if (property in Mavo.all && Mavo.all[property].root) {
					return data[property] = Mavo.all[property].root.getData(options);
				}

				return false;
			},

			set: function(data, property, value) {
				throw Error("You can’t set data via expressions.");
			}
		});
	},

	lazy: {
		closestCollection: function() {
			return this.getClosestCollection();
		},

		// Are were only rendering and editing a subset of the data?
		inPath: function() {
			if (this.nodeType != "Collection") {
				return (this.element.getAttribute("mv-path") || "").split("/").filter(p => p.length);
			}

			return [];
		}
	},

	live: {
		store: function(value) {
			$.toggleAttribute(this.element, "mv-storage", value);
		},

		unsavedChanges: function(value) {
			if (value && (!this.saved || !this.editing)) {
				value = false;
			}

			this.element.classList.toggle("mv-unsaved-changes", value);

			return value;
		},

		mode: function (value) {
			if (this._mode != value) {
				// Is it allowed?
				if (this.modes && value != this.modes) {
					value = this.modes;
				}

				// If we don't do this, setting the attribute below will
				// result in infinite recursion
				this._mode = value;

				if (!(this instanceof Mavo.Collection) && [null, "", "read", "edit"].indexOf(this.element.getAttribute("mv-mode")) > -1) {
					// If attribute is not one of the recognized values, leave it alone
					var set = this.modes || value == "edit";
					Mavo.Observer.sneak(this.mavo.modeObserver, () => {
						$.toggleAttribute(this.element, "mv-mode", value, set);
					});
				}

				return value;
			}
		},

		modes: function(value) {
			if (value && value != "read" && value != "edit") {
				return null;
			}

			this._modes = value;

			if (value && this.mode != value) {
				this.mode = value;
			}
		},

		deleted: function(value) {
			this.element.classList.toggle("mv-deleted", value);

			if (value) {
				// Soft delete, store element contents in a fragment
				// and replace them with an undo prompt.
				this.elementContents = document.createDocumentFragment();
				$$(this.element.childNodes).forEach(node => {
					this.elementContents.appendChild(node);
				});

				$.contents(this.element, [
					{
						tag: "button",
						className: "mv-close mv-ui",
						textContent: "×",
						events: {
							"click": function(evt) {
								$.remove(this.parentNode);
							}
						}
					},
					"Deleted " + this.name,
					{
						tag: "button",
						className: "mv-undo mv-ui",
						textContent: "Undo",
						events: {
							"click": evt => this.deleted = false
						}
					}
				]);

				this.element.classList.remove("mv-highlight");
			}
			else if (this.deleted) {
				// Undelete
				this.element.textContent = "";
				this.element.appendChild(this.elementContents);

				// otherwise expressions won't update because this will still seem as deleted
				// Alternatively, we could fire datachange with a timeout.
				this._deleted = false;

				this.dataChanged("undelete");
			}
		}
	},

	static: {
		maxId: 0,

		all: new WeakMap(),

		create: function(element, mavo, o = {}) {
			if (Mavo.is("multiple", element) && !o.collection) {
				return new Mavo.Collection(element, mavo, o);
			}

			return new Mavo[Mavo.is("group", element)? "Group" : "Primitive"](element, mavo, o);
		},

		/**
		 * Get & normalize property name, if exists
		 */
		getProperty: function(element) {
			var property = element.getAttribute("property") || element.getAttribute("itemprop");

			if (!property && element.hasAttribute("property")) {
				property = element.name || element.id || element.classList[0];
			}

			if (property) {
				element.setAttribute("property", property);
			}

			return property;
		},

		get: function(element, prioritizePrimitive) {
			var nodes = (_.all.get(element) || []).filter(node => !(node instanceof Mavo.Collection));

			if (nodes.length < 2 || !prioritizePrimitive) {
				return nodes[0];
			}

			if (nodes[0] instanceof Mavo.Group) {
				return node[1];
			}
		},

		/**
		 * Get all properties that are inside an element but not nested into other properties
		 */
		children: function(element) {
			var ret = Mavo.Node.get(element);

			if (ret) {
				// element is a Mavo node
				return [ret];
			}

			ret = $$(Mavo.selectors.property, element)
				.map(e => Mavo.Node.get(e))
				.filter(e => !element.contains(e.parentGroup.element)) // drop nested properties
				.map(e => e.collection || e);

			return Mavo.Functions.unique(ret);
		}
	}
});

})(Bliss, Bliss.$);

(function($, $$) {

var _ = Mavo.Group = $.Class({
	extends: Mavo.Node,
	nodeType: "Group",
	constructor: function (element, mavo, o) {
		this.children = {};

		this.group = this;

		Mavo.hooks.run("group-init-start", this);

		// Should this element also create a primitive?
		if (Mavo.Primitive.getValueAttribute(this.element)) {
			var obj = this.children[this.property] = new Mavo.Primitive(this.element, this.mavo, {group: this});
		}

		// Create Mavo objects for all properties in this group (primitives or groups),
		// but not properties in descendant groups (they will be handled by their group)
		var properties = $$(Mavo.selectors.property, this.element).filter(element => {
			return this.element === element.parentNode.closest(Mavo.selectors.group);
		});

		var propertyNames = properties.map(element => Mavo.Node.getProperty(element));

		properties.forEach((element, i) => {
			var property = propertyNames[i];
			var template = this.template? this.template.children[property] : null;
			var options = {template, group: this};

			if (this.children[property]) {
				// Already exists, must be a collection
				var collection = this.children[property];
				collection.add(element);
				collection.mutable = collection.mutable || Mavo.is("multiple", element);
			}
			else if (propertyNames.indexOf(property) != propertyNames.lastIndexOf(property)) {
				// There are duplicates, so this should be a collection.
				this.children[property] = new Mavo.Collection(element, this.mavo, options);
			}
			else {
				// Normal case
				this.children[property] = Mavo.Node.create(element, this.mavo, options);
			}
		});

		var vocabElement = (this.isRoot? this.element.closest("[vocab]") : null) || this.element;
		this.vocab = vocabElement.getAttribute("vocab");

		this.postInit();

		Mavo.hooks.run("group-init-end", this);
	},

	get isRoot() {
		return !this.property;
	},

	getNames: function(type = "Node") {
		return Object.keys(this.children).filter(p => this.children[p] instanceof Mavo[type]);
	},

	getData: function(o = {}) {
		var env = {
			context: this,
			options: o,
			data: this.super.getData.call(this, o)
		};

		if (env.data !== undefined) {
			// Super method returned something
			return env.data;
		}

		env.data = this.data? Mavo.clone(Mavo.subset(this.data, this.inPath)) : {};

		for (var property in this.children) {
			var obj = this.children[property];

			if (obj.saved || env.options.live) {
				var data = obj.getData(o);

				if (data !== null || env.options.live) {
					env.data[obj.property] = data;
				}
			}
		}

		if (!env.options.live) { // Stored data
			// If storing, use the rendered data too
			env.data = Mavo.subset(this.data, this.inPath, env.data);
		}

		// {foo: {foo: 5}} should become {foo: 5}
		var properties = Object.keys(env.data);

		if (properties.length == 1 && properties[0] == this.property) {
			env.data = env.data[this.property];
		}

		if (!env.options.live) { // Stored data again
			if (!properties.length && !this.isRoot) {
				// Avoid {} in the data
				env.data = null;
			}
			else if (env.data && typeof env.data === "object") {
				// Add JSON-LD stuff
				if (this.type && this.type != _.DEFAULT_TYPE) {
					env.data["@type"] = this.type;
				}

				if (this.vocab) {
					env.data["@context"] = this.vocab;
				}
			}
		}

		Mavo.hooks.run("node-getdata-end", env);

		return env.data;
	},

	/**
	 * Search entire subtree for property, return relative value
	 * @return {Mavo.Node}
	 */
	find: function(property, o = {}) {
		if (this.property == property) {
			return this;
		}

		if (property in this.children) {
			return this.children[property].find(property, o);
		}

		var all = [];

		for (var prop in this.children) {
			var ret = this.children[prop].find(property, o);

			if (ret !== undefined) {
				if (Array.isArray(ret)) {
					all.push(...ret);
				}
				else {
					return ret;
				}
			}
		}

		if (all.length) {
			return all;
		}
	},

	edit: function() {
		if (this.super.edit.call(this) === false) {
			return false;
		}

		this.propagate("edit");
	},

	save: function() {
		this.unsavedChanges = false;
	},

	propagated: ["save", "import", "clear"],

	// Do not call directly, call this.render() instead
	dataRender: function(data) {
		if (!data) {
			return;
		}

		// What if data is not an object?
		if (typeof data !== "object") {
			// Data is a primitive, render it on this.property or failing that, any writable property
			if (this.property in this.children) {
				var property = this.property;
			}
			else {
				var type = $.type(data);
				var score = prop => (this.children[prop] instanceof Mavo.Primitive) + (this.children[prop].datatype == type);

				var property = Object.keys(this.children)
					.filter(p => !this.children[p].expressionText)
					.sort((prop1, prop2) => score(prop1) - score(prop2))
					.reverse()[0];

			}

			data = {[property]: data};

			this.data = Mavo.subset(this.data, this.inPath, data);

			this.propagate(obj => {
				obj.render(data[obj.property]);
			});
		}
		else {
			this.propagate(obj => {
				obj.render(data[obj.property]);
			});

			// Fire datachange events for properties not in the template,
			// since nothing else will and they can still be referenced in expressions
			var oldData = Mavo.subset(this.oldData, this.inPath);

			for (var property in data) {
				if (!(property in this.children)) {
					var value = data[property];

					if (typeof value != "object" && (!oldData || oldData[property] != value)) {
						this.dataChanged("propertychange", {property});
					}
				}
			}
		}
	},

	static: {
		all: new WeakMap(),

		DEFAULT_TYPE: "Item",

		normalize: function(element) {
			// Get & normalize typeof name, if exists
			if (Mavo.is("group", element)) {
				var type = Mavo.getAttribute(element, "typeof", "itemtype") || _.DEFAULT_TYPE;

				element.setAttribute("typeof", type);

				return type;
			}

			return null;
		}
	}
});

})(Bliss, Bliss.$);

(function($, $$) {

var _ = Mavo.Primitive = $.Class({
	extends: Mavo.Node,
	nodeType: "Primitive",
	constructor: function (element, mavo, o) {
		if (!this.fromTemplate("config", "attribute", "templateValue")) {
			this.config = _.getConfig(element);

			// Which attribute holds the data, if any?
			// "null" or null for none (i.e. data is in content).
			this.attribute = this.config.attribute;
		}

		this.datatype = this.config.datatype;

		if ("modes" in this.config) {
			// If modes are related to element type, this overrides everything
			// because it means the other mode makes no sense for that element
			this.modes = this.config.modes;
			this.element.setAttribute("mv-mode", this.config.modes);
		}

		Mavo.hooks.run("primitive-init-start", this);

		// Link primitive with its expressionText object
		// We need to do this before any editing UI is generated
		this.expressionText = Mavo.DOMExpression.search(this.element, this.attribute);

		if (this.expressionText && !this.expressionText.mavoNode) {
			this.expressionText.primitive = this;
			this.storage = this.storage || "none";
			this.modes = "read";
		}

		if (this.config.init) {
			this.config.init.call(this, this.element);
		}

		if (this.config.changeEvents) {
			$.events(this.element, this.config.changeEvents, evt => {
				if (evt.target === this.element) {
					this.value = this.getValue();
				}
			});
		}

		/**
		 * Set up input widget
		 */

		 // Linked widgets
		if (!this.editor && this.element.hasAttribute("mv-edit")) {
			var original = $(this.element.getAttribute("mv-edit"));

			if (original) {
				this.editor = original.cloneNode(true);

				// Update editor if original mutates
				// This means that expressions on mv-edit for individual collection items will not be picked up
				if (!this.template) {
					new Mavo.Observer(original, "all", records => {
						var all = this.copies.concat(this);

						for (let primitive of all) {
							primitive.editor = original.cloneNode(true);
							primitive.setValue(primitive.value, {force: true, silent: true});
						}
					});
				}
			}
		}

		// Nested widgets
		if (!this.editor && !this.attribute) {
			this.editor = $$(this.element.children).filter(function (el) {
			    return el.matches(Mavo.selectors.formControl) && !el.matches(Mavo.selectors.property);
			})[0];

			if (this.editor) {
				this.element.textContent = this.editorValue;
				$.remove(this.editor);
			}
		}

		this.templateValue = this.getValue();

		this._default = this.element.getAttribute("mv-default");

		if (this.default === null) { // no mv-default
			this._default = this.modes === "read"? this.templateValue : (this.editor? this.editorValue : undefined);
		}
		else if (this.default === "") { // mv-default exists, no value, default is template value
			this._default = this.templateValue;
		}
		else { // mv-default with value
			this.defaultObserver = new Mavo.Observer(this.element, "mv-default", record => {
				this.default = this.element.getAttribute("mv-default");
			});
		}

		if (this.default === undefined && (!this.template || !this.closestCollection)) {
			this.initialValue = this.templateValue;
		}
		else {
			this.initialValue = this.default;
		}

		if (this.initialValue === undefined) {
			this.initialValue = this.emptyValue;
		}

		this.setValue(this.initialValue, {silent: true});

		// Observe future mutations to this property, if possible
		// Properties like input.checked or input.value cannot be observed that way
		// so we cannot depend on mutation observers for everything :(
		this.observer = new Mavo.Observer(this.element, this.attribute, records => {
			if (this.attribute || !this.editing) {
				this.value = this.getValue();
			}
		});

		this.postInit();

		Mavo.hooks.run("primitive-init-end", this);
	},

	get editorValue() {
		if (this.config.getEditorValue) {
			return this.config.getEditorValue.call(this);
		}

		if (this.editor) {
			if (this.editor.matches(Mavo.selectors.formControl)) {
				return _.getValue(this.editor, {datatype: this.datatype});
			}

			// if we're here, this.editor is an entire HTML structure
			var output = $(Mavo.selectors.output + ", " + Mavo.selectors.formControl, this.editor);

			if (output) {
				return _.getValue(output);
			}
		}
	},

	set editorValue(value) {
		if (this.config.setEditorValue) {
			return this.config.setEditorValue.call(this, value);
		}

		if (this.editor) {
			if (this.editor.matches(Mavo.selectors.formControl)) {
				_.setValue(this.editor, value, {config: this.editorDefaults});
			}
			else {
				// if we're here, this.editor is an entire HTML structure
				var output = $(Mavo.selectors.output + ", " + Mavo.selectors.formControl, this.editor);

				if (output) {
					_.setValue(output, value);
				}
			}
		}
	},

	destroy: function() {
		this.super.destroy.call(this);

		this.defaultObserver && this.defaultObserver.destroy();
		this.observer && this.observer.destroy();
	},

	getData: function(o = {}) {
		var env = {
			context: this,
			options: o,
			data: this.super.getData.call(this, o)
		};

		if (env.data !== undefined) {
			return env.data;
		}

		env.data = this.value;

		if (env.data === "") {
			env.data = null;
		}

		if (!o.live && this.inPath.length) {
			env.data = Mavo.subset(this.data, this.inPath, env.data);
		}

		Mavo.hooks.run("node-getdata-end", env);

		return env.data;
	},

	sneak: function(callback) {
		return Mavo.Observer.sneak(this.observer, callback);
	},

	save: function() {
		this.savedValue = this.value;
		this.unsavedChanges = false;
	},

	// Called only the first time this primitive is edited
	initEdit: function () {
		if (!this.editor) {
			// No editor provided, use default for element type
			// Find default editor for datatype
			var editor = this.config.editor || Mavo.Elements.defaultEditors[this.datatype] || Mavo.Elements.defaultEditors.string;

			this.editor = $.create($.type(editor) === "function"? editor.call(this) : editor);
			this.editorValue = this.value;
		}

		$.events(this.editor, {
			"input change": evt => {
				this.value = this.editorValue;
			},
			"focus": evt => {
				this.editor.select && this.editor.select();
			},
			"mavo:datachange": evt => {
				if (evt.property === "output") {
					evt.stopPropagation();
					$.fire(this.editor, "input");
				}
			}
		});

		if ("placeholder" in this.editor) {
			this.editor.placeholder = "(" + this.label + ")";
		}

		// Copy any data-input-* attributes from the element to the editor
		var dataInput = /^mv-edit-/i;
		$$(this.element.attributes).forEach(function (attribute) {
			if (dataInput.test(attribute.name)) {
				this.editor.setAttribute(attribute.name.replace(dataInput, ""), attribute.value);
			}
		}, this);

		if (this.attribute || this.config.popup) {
			this.popup = new Mavo.UI.Popup(this);
		}

		if (!this.popup) {
			this.editor.classList.add("mv-editor");
		}

		this.initEdit = null;
	},

	edit: function () {
		if (this.super.edit.call(this) === false) {
			return false;
		}

		// Make element focusable, so it can actually receive focus
		this.element._.data.prevTabindex = this.element.getAttribute("tabindex");
		this.element.tabIndex = 0;

		// Prevent default actions while editing
		// e.g. following links etc
		this.element.addEventListener("click.mavo:edit", evt => evt.preventDefault());

		this.preEdit = Mavo.defer((resolve, reject) => {
			// Empty properties should become editable immediately
			// otherwise they could be invisible!
			if (this.empty && !this.attribute) {
				return requestAnimationFrame(resolve);
			}

			var timer;

			var events = "click focus dragover dragenter".split(" ").map(e => e + ".mavo:preedit").join(" ");
			$.events(this.element, events, resolve);

			if (!this.attribute) {
				// Hovering over the element for over 150ms will trigger edit
				$.events(this.element, {
					"mouseenter.mavo:preedit": e => {
						clearTimeout(timer);
						timer = setTimeout(resolve, 150);
					},
					"mouseleave.mavo:preedit": e => {
						clearTimeout(timer);
					}
				});
			}
		}).then(() => $.unbind(this.element, ".mavo:preedit"));

		if (this.config.edit) {
			this.config.edit.call(this);
			return;
		}

		this.preEdit.then(() => {
			// Actual edit
			if (this.initEdit) {
				this.initEdit();
			}

			if (this.popup) {
				this.popup.show();
			}

			if (!this.attribute && !this.popup) {
				if (this.editor.parentNode != this.element) {
					this.editorValue = this.value;
					this.element.textContent = "";

					this.element.appendChild(this.editor);
				}
			}
		});
	}, // edit

	done: function () {
		if (this.super.done.call(this) === false) {
			return false;
		}

		if ("preEdit" in this) {
			$.unbind(this.element, ".mavo:preedit .mavo:edit");
		}

		this.sneak(() => {
			if (this.config.done) {
				this.config.done.call(this);
				return;
			}

			if (this.popup) {
				this.popup.close();
			}
			else if (!this.attribute && this.editor) {
				$.remove(this.editor);
				this.element.textContent = this.editorValue;
			}
		});

		// Revert tabIndex
		if (this.element._.data.prevTabindex !== null) {
			this.element.tabIndex = this.element._.data.prevTabindex;
		}
		else {
			this.element.removeAttribute("tabindex");
		}
	},

	clear: function() {
		this.value = this.templateValue;
	},

	dataRender: function(data) {
		if (data && typeof data === "object") {
			if (Symbol.toPrimitive in data) {
				data = data[Symbol.toPrimitive]();
			}
			else {
				// Candidate properties to get a value from
				for (let property of [this.property, "value", ...Object.keys(data)]) {
					if (property in data) {
						data = data[property];
						this.inPath.push(property);
						break;
					}
				}
			}
		}

		if (data === undefined) {
			// New property has been added to the schema and nobody has saved since
			if (this.modes != "read") {
				this.value = this.closestCollection? this.default : this.templateValue;
			}
		}
		else {
			this.value = data;
		}
	},

	find: function(property) {
		if (this.property == property) {
			return this;
		}
	},

	/**
	 * Get value from the DOM
	 */
	getValue: function(o) {
		return _.getValue(this.element, {
			config: this.config,
			attribute: this.attribute,
			datatype: this.datatype
		});
	},

	lazy: {
		label: function() {
			return Mavo.Functions.readable(this.property);
		},

		emptyValue: function() {
			switch (this.datatype) {
				case "boolean":
					return false;
				case "number":
					return 0;
			}

			return "";
		},

		editorDefaults: function() {
			return this.editor && _.getConfig(this.editor);
		}
	},

	setValue: function (value, o = {}) {
		this.sneak(() => {
			if ($.type(value) == "object" && "value" in value) {
				var presentational = value.presentational;
				value = value.value;
			}

			// Convert nulls and undefineds to empty string
			value = value || value === 0? value : "";

			// If there's no datatype, adopt that of the value
			if (!this.datatype && (typeof value == "number" || typeof value == "boolean")) {
				this.datatype = typeof value;
			}

			value = _.safeCast(value, this.datatype);

			if (value == this._value && !o.force) {
				return value;
			}

			if (this.editor && document.activeElement != this.editor) {
				this.editorValue = value;
			}

			if (this.config.humanReadable && this.attribute) {
				presentational = this.config.humanReadable.call(this, value);
			}

			if (!this.editing || this.popup || !this.editor) {
				if (this.config.setValue) {
					this.config.setValue.call(this, this.element, value);
				}
				else {
					if (this.editor && this.editor.matches("select") && this.editor.selectedOptions[0]) {
						presentational = this.editor.selectedOptions[0].textContent;
					}

					if (!o.dataOnly) {
						_.setValue(this.element, {value, presentational}, {
							config: this.config,
							attribute: this.attribute,
							datatype: this.datatype
						});
					}
				}
			}

			this.empty = value === "";

			this._value = value;

			if (!o.silent) {
				if (this.saved) {
					this.unsavedChanges = this.mavo.unsavedChanges = true;
				}

				this.dataChanged("propertychange", {value});
			}
		});

		return value;
	},

	dataChanged: function(action = "propertychange", o) {
		return this.super.dataChanged.call(this, action, o);
	},

	live: {
		default: function (value) {
			if (this.value == this._default) {

				this.value = value;
			}
		},

		value: function (value) {
			return this.setValue(value);
		},

		empty: function (value) {
			var hide = value && // is empty
			           !this.modes && // and supports both modes
					   this.config.default && // and using the default settings
			           !(this.attribute && $(Mavo.selectors.property, this.element)); // and has no property inside

			this.element.classList.toggle("mv-empty", !!hide);
		}
	},

	static: {
		all: new WeakMap(),

		getValueAttribute: function (element, config = Mavo.Elements.search(element)) {
			var ret = element.getAttribute("mv-attribute") || config.attribute;

			if (!ret || ret === "null" || ret === "none") {
				ret = null;
			}

			return ret;
		},

		/**
		 * Only cast if conversion is lossless
		 */
		safeCast: function(value, datatype) {
			var existingType = typeof value;
			var cast = _.cast(value, datatype);

			if (value === null || value === undefined) {
				return value;
			}

			if (datatype == "boolean") {
				if (value === "false" || value === 0 || value === "") {
					return false;
				}

				if (value === "true" || value > 0) {
					return true;
				}

				return value;
			}

			if (datatype == "number") {
				if (/^[-+]?[0-9.e]+$/i.test(value + "")) {
					return cast;
				}

				return value;
			}

			return cast;
		},

		/**
		 * Cast to a different primitive datatype
		 */
		cast: function(value, datatype) {
			switch (datatype) {
				case "number": return +value;
				case "boolean": return !!value;
				case "string": return value + "";
			}

			return value;
		},

		getValue: function (element, {config, attribute, datatype} = {}) {
			if (!config) {
				config = _.getConfig(element, attribute);
			}

			attribute = config.attribute;
			datatype = config.datatype;

			if (config.getValue && attribute == config.attribute) {
				return config.getValue(element);
			}

			var ret;

			if (attribute in element && _.useProperty(element, attribute)) {
				// Returning properties (if they exist) instead of attributes
				// is needed for dynamic elements such as checkboxes, sliders etc
				ret = element[attribute];
			}
			else if (attribute) {
				ret = element.getAttribute(attribute);
			}
			else {
				ret = element.getAttribute("content") || element.textContent || null;
			}

			return _.safeCast(ret, datatype);
		},

		getConfig: function(element, attribute, datatype) {
			if (attribute === undefined) {
				attribute = element.getAttribute("mv-attribute") || undefined;
			}

			if (attribute == "null" || attribute == "none") {
				attribute = null;
			}

			datatype = element.getAttribute("datatype") || undefined;

			var config = Mavo.Elements.search(element, attribute, datatype);

			if (config.attribute === undefined) {
				config.attribute = attribute || null;
			}

			if (config.datatype === undefined) {
				config.datatype = datatype;
			}

			return config;
		},

		setValue: function (element, value, {config, attribute, datatype} = {}) {
			if ($.type(value) == "object" && "value" in value) {
				var presentational = value.presentational;
				value = value.value;
			}

			if (element.nodeType === 1) {
				if (!config) {
					config = _.getConfig(element, attribute);
				}

				attribute = config.attribute;

				datatype = datatype !== undefined? datatype : config.datatype;

				if (config.setValue && attribute == config.attribute) {
					return config.setValue(element, value);
				}
			}

			if (attribute) {
				if (attribute in element && _.useProperty(element, attribute) && element[attribute] !== value) {
					// Setting properties (if they exist) instead of attributes
					// is needed for dynamic elements such as checkboxes, sliders etc
					try {
						element[attribute] = value;
					}
					catch (e) {}
				}

				// Set attribute anyway, even if we set a property because when
				// they're not in sync it gets really fucking confusing.
				if (datatype == "boolean") {
					if (value != element.hasAttribute(attribute)) {
						$.toggleAttribute(element, attribute, value, value);
					}
				}
				else if (element.getAttribute(attribute) != value) {  // intentionally non-strict, e.g. "3." !== 3
					element.setAttribute(attribute, value);

					if (presentational) {
						element.textContent = presentational;
					}
				}
			}
			else {
				if (datatype === "number" && !presentational) {
					presentational = _.formatNumber(value);
				}

				element.textContent = presentational || value;

				if (presentational && element.setAttribute) {
					element.setAttribute("content", value);
				}
			}
		},

		/**
		 *  Set/get a property or an attribute?
		 * @return {Boolean} true to use a property, false to use the attribute
		 */
		useProperty: function(element, attribute) {
			if (["href", "src"].indexOf(attribute) > -1) {
				// URL properties resolve "" as location.href, fucking up emptiness checks
				return false;
			}

			if (element.namespaceURI == "http://www.w3.org/2000/svg") {
				// SVG has a fucked up DOM, do not use these properties
				return false;
			}

			return true;
		},

		lazy: {
			formatNumber: () => {
				var numberFormat = new Intl.NumberFormat("en-US", {maximumFractionDigits:2});

				return function(value) {
					if (value === Infinity || value === -Infinity) {
						// Pretty print infinity
						return value < 0? "-∞" : "∞";
					}

					return numberFormat.format(value);
				};
			}
		}
	}
});

})(Bliss, Bliss.$);

(function($, $$) {

var _ = Mavo.UI.Popup = $.Class({
	constructor: function(primitive) {
		this.primitive = primitive;

		// Need to be defined here so that this is what expected
		this.position = evt => {
			var bounds = this.element.getBoundingClientRect();
			var x = bounds.left;
			var y = bounds.bottom;

			if (this.popup.offsetHeight) {
				// Is in the DOM, check if it fits
				var popupBounds = this.popup.getBoundingClientRect();

				if (popupBounds.height + y > innerHeight) {
					y = innerHeight - popupBounds.height - 20;
				}
			}

			$.style(this.popup, { top:  `${y}px`, left: `${x}px` });
		};

		this.popup = $.create("div", {
			className: "mv-popup",
			hidden: true,
			contents: {
				tag: "fieldset",
				contents: [
					{
						tag: "legend",
						textContent: this.primitive.label + ":"
					},
					this.editor
				]
			},
			events: {
				keyup: evt => {
					if (evt.keyCode == 13 || evt.keyCode == 27) {
						if (this.popup.contains(document.activeElement)) {
							this.element.focus();
						}

						evt.stopPropagation();
						this.hide();
					}
				},
				transitionend: this.position
			}
		});

		// No point in having a dropdown in a popup
		if (this.editor.matches("select")) {
			this.editor.size = Math.min(10, this.editor.children.length);
		}
	},

	show: function() {
		$.unbind([this.element, this.popup], ".mavo:showpopup");

		this.shown = true;

		this.hideCallback = evt => {
			if (!this.popup.contains(evt.target) && !this.element.contains(evt.target)) {
				this.hide();
			}
		};

		this.position();

		document.body.appendChild(this.popup);

		requestAnimationFrame(e => this.popup.removeAttribute("hidden")); // trigger transition

		$.events(document, "focus click", this.hideCallback, true);
		window.addEventListener("scroll", this.position);
	},

	hide: function() {
		$.unbind(document, "focus click", this.hideCallback, true);
		window.removeEventListener("scroll", this.position);
		this.popup.setAttribute("hidden", ""); // trigger transition
		this.shown = false;

		setTimeout(() => {
			$.remove(this.popup);
		}, parseFloat(getComputedStyle(this.popup).transitionDuration) * 1000 || 400); // TODO transition-duration could override this

		$.events(this.element, {
			"click.mavo:showpopup": evt => {
				this.show();
			},
			"keyup.mavo:showpopup": evt => {
				if ([13, 113].indexOf(evt.keyCode) > -1) { // Enter or F2
					this.show();
					this.editor.focus();
				}
			}
		});
	},

	close: function() {
		this.hide();
		$.unbind(this.element, ".mavo:edit .mavo:preedit .mavo:showpopup");
	},

	proxy: {
		"editor": "primitive",
		"element": "primitive"
	}
});

})(Bliss, Bliss.$);

/**
 * Configuration for different types of elements. Options:
 * - attribute {String}
 * - useProperty {Boolean}
 * - datatype {"number"|"boolean"|"string"} Default is "string"
 * - modes
 * - editor {Object|Function}
 * - setEditorValue temporary
 * - edit
 * - done
 * - observe
 * - default: If there is no attribute, can we use that rule to pick one?
 * @
 */
(function($, $$) {

var _ = Mavo.Elements = {};

Object.defineProperties(_, {
	"register": {
		value: function(id, o) {
			if (typeof arguments[0] === "object") {
				// Multiple definitions
				for (let s in arguments[0]) {
					_.register(s, arguments[0][s]);
				}

				return;
			}

			var all = Mavo.toArray(arguments[1]);

			for (config of all) {
				config.attribute = Mavo.toArray(config.attribute || null);

				for (attribute of config.attribute) {
					let o = $.extend({}, config);
					o.attribute = attribute;
					o.selector = o.selector || id;
					o.id = id;

					_[id] = _[id] || [];
					_[id].push(o);
				}
			}

			return _;
		}
	},
	"search": {
		value: function(element, attribute, datatype) {

			var matches = _.matches(element, attribute, datatype);
			
			return matches[matches.length - 1] || { attribute };
		}
	},
	"matches": {
		value: function(element, attribute, datatype) {
			var matches = [];

			selectorloop: for (var id in _) {
				for (var o of _[id]) {
					// Passes attribute test?
					var attributeMatches = attribute === undefined && o.default || attribute === o.attribute;

					if (!attributeMatches) {
						continue;
					}

					// Passes datatype test?
					if (datatype !== undefined && datatype !== "string" && datatype !== o.datatype) {
						continue;
					}

					// Passes selector test?
					var selector = o.selector || id;
					if (!element.matches(selector)) {
						continue;
					}

					// Passes arbitrary test?
					if (o.test && !o.test(element, attribute, datatype)) {
						continue;
					}

					// All tests have passed
					matches.push(o);
				}
			}

			return matches;
		}
	},

	isSVG: {
		value: e => e.namespaceURI == "http://www.w3.org/2000/svg"
	},

	defaultEditors: {
		value: {
			"string":  { tag: "input" },
			"number":  { tag: "input", type: "number" },
			"boolean": { tag: "input", type: "checkbox" }
		}
	}
});

_.register({
	"*": [
		{
			test: (e, a) => a == "hidden",
			attribute: "hidden",
			datatype: "boolean"
		},
		{
			test: _.isSVG,
			attribute: "y",
			datatype: "number"
		},
		{
			default: true,
			test: _.isSVG,
			attribute: "x",
			datatype: "number"
		},
	],

	"media": {
		default: true,
		selector: "img, video, audio",
		attribute: "src",
		editor: function() {
			var uploadBackend = this.mavo.storage && this.mavo.storage.upload? this.mavo.storage : this.uploadBackend;

			var mainInput = $.create("input", {
				"type": "url",
				"placeholder": "http://example.com/image.png",
				"className": "mv-output",
				"aria-label": "URL to image"
			});

			if (uploadBackend && self.FileReader) {
				var popup;
				var type = this.element.nodeName.toLowerCase();
				type = type == "img"? "image" : type;
				var path = this.element.getAttribute("mv-uploads") || type + "s";

				var upload = (file, name = file.name) => {
					if (file && file.type.indexOf(type + "/") === 0) {
						this.mavo.upload(file, path + "/" + name).then(url => {
							mainInput.value = url;
							$.fire(mainInput, "input");
						});
					}
				};

				var uploadEvents = {
					"paste": evt => {
						var item = evt.clipboardData.items[0];

						if (item.kind == "file" && item.type.indexOf(type + "/") === 0) {
							// Is a file of the correct type, upload!
							var name = `pasted-${type}-${Date.now()}.${item.type.slice(6)}`; // image, video, audio are all 5 chars
							upload(item.getAsFile(), name);
							evt.preventDefault();
						}
					},
					"drag dragstart dragend dragover dragenter dragleave drop": evt => {
						evt.preventDefault();
						evt.stopPropagation();
					},
					"dragover dragenter": evt => {
						popup.classList.add("mv-dragover");
						this.element.classList.add("mv-dragover");
					},
					"dragleave dragend drop": evt => {
						popup.classList.remove("mv-dragover");
						this.element.classList.remove("mv-dragover");
					},
					"drop": evt => {
						upload(evt.dataTransfer.files[0]);
					}
				};

				$.events(this.element, uploadEvents);

				return popup = $.create({
					className: "mv-upload-popup",
					contents: [
						mainInput, {
							tag: "input",
							type: "file",
							"aria-label": "Upload image",
							accept: type + "/*",
							events: {
								change: evt => {
									var file = evt.target.files[0];

									if (!file) {
										return;
									}

									upload(file);
								}
							}
						}, {
							className: "mv-tip",
							innerHTML: "<strong>Tip:</strong> You can also drag & drop or paste!"
						}
					],
					events: uploadEvents
				});
			}
			else {
				return mainInput;
			}
		}
	},

	"video, audio": {
		attribute: ["autoplay", "buffered", "loop"],
		datatype: "boolean"
	},

	"a, link": {
		default: true,
		attribute: "href"
	},

	"input, select, button, textarea": {
		attribute: "disabled",
		datatype: "boolean"
	},

	"select, input": {
		default: true,
		attribute: "value",
		modes: "read",
		changeEvents: "input change"
	},

	"textarea": {
		default: true,
		modes: "read",
		changeEvents: "input",
		getValue: element => element.value,
		setValue: (element, value) => element.value = value
	},

	"input[type=range], input[type=number]": {
		default: true,
		attribute: "value",
		datatype: "number",
		modes: "read",
		changeEvents: "input change"
	},

	"input[type=checkbox]": {
		default: true,
		attribute: "checked",
		datatype: "boolean",
		modes: "read",
		changeEvents: "click"
	},

	"input[type=radio]": {
		default: true,
		attribute: "checked",
		modes: "read",
		getValue: element => {
			if (element.form) {
				return element.form[element.name].value;
			}

			var checked = $(`input[type=radio][name="${element.name}"]:checked`);
			return checked && checked.value;
		},
		setValue: (element, value) => {
			if (element.form) {
				element.form[element.name].value = value;
				return;
			}

			var toCheck = $(`input[type=radio][name="${element.name}"][value="${value}"]`);
			$.properties(toCheck, {checked: true});
		},
		init: function(element) {
			this.mavo.element.addEventListener("change", evt => {
				if (evt.target.name == element.name) {
					this.value = this.getValue();
				}
			});
		}
	},

	"button, .counter": {
		default: true,
		attribute: "mv-clicked",
		datatype: "number",
		modes: "read",
		init: function(element) {
			if (this.attribute === "mv-clicked") {
				element.setAttribute("mv-clicked", "0");

				element.addEventListener("click", evt => {
					let clicked = +element.getAttribute("mv-clicked") || 0;
					this.value = ++clicked;
				});
			}
		}
	},

	"meter, progress": {
		default: true,
		attribute: "value",
		datatype: "number",
		edit: function() {
			var min = +this.element.getAttribute("min") || 0;
			var max = +this.element.getAttribute("max") || 1;
			var range = max - min;
			var step = +this.element.getAttribute("mv-edit-step") || (range > 1? 1 : range/100);

			this.element.addEventListener("mousemove.mavo:edit", evt => {
				// Change property as mouse moves
				var left = this.element.getBoundingClientRect().left;
				var offset = Math.max(0, (evt.clientX - left) / this.element.offsetWidth);
				var newValue = min + range * offset;
				var mod = newValue % step;

				newValue += mod > step/2? step - mod : -mod;
				newValue = Math.max(min, Math.min(newValue, max));

				this.sneak(() => this.element.setAttribute("value", newValue));
			});

			this.element.addEventListener("mouseleave.mavo:edit", evt => {
				// Return to actual value
				this.sneak(() => this.element.setAttribute("value", this.value));
			});

			this.element.addEventListener("click.mavo:edit", evt => {
				// Register change
				this.value = this.getValue();
			});

			this.element.addEventListener("keydown.mavo:edit", evt => {
				// Edit with arrow keys
				if (evt.target == this.element && (evt.keyCode == 37 || evt.keyCode == 39)) {
					var increment = step * (evt.keyCode == 39? 1 : -1) * (evt.shiftKey? 10 : 1);
					var newValue = this.value + increment;
					newValue = Math.max(min, Math.min(newValue, max));

					this.element.setAttribute("value", newValue);
				}
			});
		},
		done: function() {
			$.unbind(this.element, ".mavo:edit");
		}
	},

	"meta": {
		default: true,
		attribute: "content"
	},

	"block": {
		default: true,
		selector: "p, div, li, dt, dd, h1, h2, h3, h4, h5, h6, article, section, address",
		editor: function() {
			var display = getComputedStyle(this.element).display;
			var tag = display.indexOf("inline") === 0? "input" : "textarea";
			var editor = $.create(tag);

			if (tag == "textarea") {
				// Actually multiline
				var width = this.element.offsetWidth;

				if (width) {
					editor.width = width;
				}
			}

			return editor;
		},

		setEditorValue: function(value) {
			if (this.datatype && this.datatype != "string") {
				value = value + "";
			}

			var cs = getComputedStyle(this.element);
			value = value || "";

			if (["normal", "nowrap"].indexOf(cs.whiteSpace) > -1) {
				// Collapse lines
				value = value.replace(/\r?\n/g, " ");
			}

			if (["normal", "nowrap", "pre-line"].indexOf(cs.whiteSpace) > -1) {
				// Collapse whitespace
				value = value.replace(/^[ \t]+|[ \t]+$/gm, "").replace(/[ \t]+/g, " ");
			}

			this.editor.value = value;
			return true;
		}
	},

	"time": {
		attribute: "datetime",
		default: true,
		editor: function() {
			var types = {
				"date": /^[Y\d]{4}-[M\d]{2}-[D\d]{2}$/i,
				"month": /^[Y\d]{4}-[M\d]{2}$/i,
				"time": /^[H\d]{2}:[M\d]{2}/i,
				"week": /[Y\d]{4}-W[W\d]{2}$/i,
				"datetime-local": /^[Y\d]{4}-[M\d]{2}-[D\d]{2} [H\d]{2}:[M\d]{2}/i
			};

			var datetime = this.element.getAttribute("datetime") || "YYYY-MM-DD";

			for (var type in types) {
				if (types[type].test(datetime)) {
					break;
				}
			}

			return {tag: "input", type};
		},
		humanReadable: function (value) {
			var date = new Date(value);

			if (!value || isNaN(date)) {
				return "(No " + this.label + ")";
			}

			// TODO do this properly (account for other datetime datatypes and different formats)
			var options = {
				"date": {day: "numeric", month: "short", year: "numeric"},
				"month": {month: "long"},
				"time": {hour: "numeric", minute: "numeric"},
				"datetime-local": {day: "numeric", month: "short", year: "numeric", hour: "numeric", minute: "numeric"}
			};

			var format = options[this.editor && this.editor.type] || options.date;
			format.timeZone = "UTC";

			return date.toLocaleString("en-GB", format);
		}
	},

	"circle": [
		{
			default: true,
			attribute: "r",
			datatype: "number"
		}, {
			attribute: ["cx", "cy"],
			datatype: "number"
		}
	],

	"text": {
		default: true,
		popup: true
	},

	"[role=checkbox]": {
		default: true,
		attribute: "aria-checked",
		datatype: "boolean",
		edit: function() {
			this.element.addEventListener("click.mavo:edit", evt => {
				this.value = !this.value;
				evt.preventDefault();
			});
		},
		done: function() {
			$.unbind(this.element, ".mavo:edit");
		}
	}
});

})(Bliss, Bliss.$);

(function($, $$) {

Mavo.attributes.push("mv-multiple", "mv-order", "mv-accepts");

var _ = Mavo.Collection = $.Class({
	extends: Mavo.Node,
	nodeType: "Collection",
	constructor: function (element, mavo, o) {
		/*
		 * Create the template, remove it from the DOM and store it
		 */
		this.templateElement = this.element;

		this.children = [];

		// ALL descendant property names as an array
		if (!this.fromTemplate("properties", "mutable", "templateElement", "accepts")) {
			this.properties = $$(Mavo.selectors.property, this.templateElement).map(Mavo.Node.getProperty);
			this.mutable = this.templateElement.matches(Mavo.selectors.multiple);
			this.accepts = (this.templateElement.getAttribute("mv-accepts") || "").split(/\s+/);

			// Must clone because otherwise once expressions are parsed on the template element
			// we will not be able to pick them up from subsequent items
			this.templateElement = this.templateElement.cloneNode(true);
		}

		var item = this.createItem(this.element);
		this.add(item, undefined, {silent: true});
		this.itemTemplate = item.template || item;

		this.postInit();

		Mavo.hooks.run("collection-init-end", this);
	},

	get length() {
		return this.children.length;
	},

	getData: function(o = {}) {
		var env = {
			context: this,
			options: o,
			data: []
		};

		for (item of this.children) {
			if (!item.deleted || env.options.live) {
				let itemData = item.getData(env.options);

				if (itemData || env.options.live) {
					env.data.push(itemData);
				}
			}
		}

		if (!this.mutable) {
			// If immutable, drop nulls

			env.data = env.data.filter(item => item !== null);

			if (env.options.live && env.data.length === 1) {
				// If immutable with only 1 item, return the item
				// See https://github.com/LeaVerou/mavo/issues/50#issuecomment-266079652
				env.data = env.data[0];
			}
			else if (this.data && !env.options.live) {
				var rendered = Mavo.subset(this.data, this.inPath);
				env.data = env.data.concat(rendered.slice(env.data.length));
			}
		}

		Mavo.hooks.run("node-getdata-end", env);

		return env.data;
	},

	// Create item but don't insert it anywhere
	// Mostly used internally
	createItem: function (element) {
		if (!element) {
			element = this.templateElement.cloneNode(true);
		}

		var item = Mavo.Node.create(element, this.mavo, {
			collection: this,
			template: this.itemTemplate || (this.template? this.template.itemTemplate : null),
			property: this.property,
			type: this.type
		});

		return item;
	},

	/**
	 * Add a new item to this collection
	 * @param item {Node|Mavo.Node} Optional. Element or Mavo object for the new item
	 * @param index {Number} Optional. Index of existing item, will be added opposite to list direction
	 * @param silent {Boolean} Optional. Throw a datachange event? Mainly used internally.
	 */
	add: function(item, index, o = {}) {
		if (item instanceof Node) {
			item = Mavo.Node.get(item) || this.createItem(item);
		}
		else {
			item = item || this.createItem();
		}

		if (item.collection != this) {
			this.adopt(item);
		}

		if (this.mutable) {
			// Add it to the DOM, or fix its place
			var rel = this.children[index]? this.children[index].element : this.marker;
			$[this.bottomUp? "after" : "before"](item.element, rel);

			if (index === undefined) {
				index = this.bottomUp? 0 : this.length;
			}
		}
		else {
			index = this.length;
		}

		var env = {context: this, item};

		env.previousIndex = item.index;

		// Update internal data model
		env.changed = this.splice({
			remove: env.item
		}, {
			index: index,
			add: env.item
		});

		if (this.mavo.expressions.active && !o.silent) {
			requestAnimationFrame(() => {
				env.changed.forEach(i => {
					i.dataChanged(i == env.item && env.previousIndex === undefined? "add" : "move");
					i.unsavedChanges = true;
				});

				this.unsavedChanges = this.mavo.unsavedChanges = true;

				this.mavo.expressions.update(env.item.element);
			});
		}

		Mavo.hooks.run("collection-add-end", env);

		return env.item;
	},

	splice: function(...actions) {
		for (let action of actions) {
			if (action.index === undefined && action.remove && isNaN(action.remove)) {
				// Remove is an item
				action.index = this.children.indexOf(action.remove);
				action.remove = 1;
			}
		}

		// Sort in reverse index order
		actions.sort((a, b) => b.index - a.index);

		// FIXME this could still result in buggy behavior.
		// Think of e.g. adding items on i, then removing > 1 items on i-1.
		// The new items would get removed instead of the old ones.
		// Not a pressing issue though since we always remove 1 max when adding things too.
		for (let action of actions) {
			if (action.index > -1 && (action.remove || action.add)) {
				action.remove = action.remove || 0;
				action.add = Mavo.toArray(action.add);

				this.children.splice(action.index, +action.remove, ...action.add);
			}
		}

		var changed = [];

		for (let i = 0; i < this.length; i++) {
			let item = this.children[i];

			if (item && item.index !== i) {
				item.index = i;
				changed.push(item);
			}
		}

		return changed;
	},

	adopt: function(item) {
		if (item.collection) {
			// It belongs to another collection, delete from there first
			item.collection.splice({remove: item});
			item.collection.dataChanged("delete");
		}

		 // Update collection & closestCollection properties
		this.walk(obj => {
			if (obj.closestCollection === item.collection) {
				obj.closestCollection = this;
			}

			// Belongs to another Mavo?
			if (item.mavo != this.mavo) {
				item.mavo = this.mavo;
			}
		});

		item.collection = this;

		// Adjust templates and their copies
		if (item.template) {
			Mavo.delete(item.template.copies, item);

			item.template = this.itemTemplate;
		}
	},

	delete: function(item, hard) {
		if (hard) {
			// Hard delete
			$.remove(item.element);
			this.splice({remove: item});
			item.destroy();
			return;
		}

		return $.transition(item.element, {opacity: 0}).then(() => {
			item.deleted = true; // schedule for deletion
			item.element.style.opacity = "";

			item.dataChanged("delete");

			this.unsavedChanges = item.unsavedChanges = this.mavo.unsavedChanges = true;
		});
	},

	/**
	 * Move existing item to a new position. Wraps around if position is out of bounds.
	 * @offset relative position
	 */
	move: function(item, offset) {
		index = item.index + offset + (offset > 0);

		if (index < 0) {
			index = this.children.length;
		}
		else if (index > this.children.length) {
			index = 0;
		}

		this.add(item, index);
	},

	editItem: function(item) {
		if (this.mutable) {
			if (!item.itemControls) {
				item.itemControls = new Mavo.UI.Itembar(item);
			}

			item.itemControls.add();
		}

		item.edit();
	},

	edit: function() {
		if (this.super.edit.call(this) === false) {
			return false;
		}

		if (this.mutable) {
			// Insert the add button if it's not already in the DOM
			if (!this.addButton.parentNode) {
				var tag = this.element.tagName.toLowerCase();
				var containerSelector = Mavo.selectors.container[tag];
				var rel = containerSelector? this.marker.parentNode.closest(containerSelector) : this.marker;
				$[this.bottomUp? "before" : "after"](this.addButton, rel);
			}

			// Set up drag & drop
			_.dragula.then(() => {
				this.getDragula();
			});
		}

		// Edit items, maybe insert item bar
		this.propagate(item => {
			this.editItem(item);
		});
	},

	done: function() {
		if (this.super.done.call(this) === false) {
			return false;
		}

		if (this.mutable) {
			if (this.addButton.parentNode) {
				this.addButton.remove();
			}

			this.propagate(item => {
				if (item.itemControls) {
					item.itemControls.remove();
				}
			});
		}
	},

	/**
	 * Delete all items in the collection. Not undoable.
	 */
	clear: function() {
		if (this.mutable) {
			for (var i = 1, item; item = this.children[i]; i++) {
				item.element.remove();
				item.destroy();
			}

			this.children = this.children.slice(0, 1);

			this.dataChanged("clear");
		}

		this.propagate("clear");
	},

	dataChanged: function(action, o = {}) {
		o.element = o.element || this.marker;
		return this.super.dataChanged.call(this, action, o);
	},

	save: function() {
		for (let item of this.children) {
			if (item.deleted) {
				this.delete(item, true);
			}
			else {
				item.unsavedChanges = false;
			}
		}
	},

	propagated: ["save"],

	dataRender: function(data) {
		if (!data) {
			return;
		}

		data = Mavo.toArray(data);

		if (!this.mutable) {
			this.children.forEach((item, i) => item.render(data && data[i]));
		}
		else {
			// First render on existing items
			for (var i = 0; i < this.children.length; i++) {
				if (i < data.length) {
					this.children[i].render(data[i]);
				}
				else {
					this.children[i].dataChanged("delete");
					this.delete(this.children[i], true);
				}
			}

			if (data.length > i) {
				// There are still remaining items
				// Using document fragments improves performance by 60%
				var fragment = document.createDocumentFragment();

				for (var j = i; j < data.length; j++) {
					var item = this.createItem();

					item.render(data[j]);

					this.children.push(item);
					item.index = j;

					fragment.appendChild(item.element);

					var env = {context: this, item};
					Mavo.hooks.run("collection-add-end", env);
				}

				if (this.bottomUp) {
					$.after(fragment, i > 0? this.children[i-1].element : this.marker);
				}
				else {
					$.before(fragment, this.marker);
				}

				for (var j = i; j < this.children.length; j++) {
					this.children[j].dataChanged("add");
				}
			}
		}
	},

	find: function(property, o = {}) {
		var items = this.children.filter(item => !item.deleted);

		if (this.property == property) {
			return o.collections? this : items;
		}

		if (this.properties.indexOf(property) > -1) {
			var ret = items.map(item => item.find(property, o));

			return Mavo.flatten(ret);
		}
	},

	isCompatible: function(c) {
		return c && this.itemTemplate.nodeType == c.itemTemplate.nodeType && (c === this
		       || c.template == this || this.template == c || this.template && this.template == c.template
		       || this.accepts.indexOf(c.property) > -1);
	},

	live: {
		mutable: function(value) {
			if (value && value !== this.mutable) {
				// Why is all this code here? Because we want it executed
				// every time mutable changes, not just in the constructor
				// (think multiple elements with the same property name, where only one has mv-multiple)
				this._mutable = value;

				// Keep position of the template in the DOM, since we might remove it
				this.marker = document.createComment("mv-marker");
				Mavo.data(this.marker, "collection", this);
				$.after(this.marker, this.templateElement);
			}
		}
	},

	// Make sure to only call after dragula has loaded
	getDragula: function() {
		if (this.dragula) {
			return this.dragula;
		}

		if (this.template) {
			Mavo.pushUnique(this.template.getDragula().containers, this.marker.parentNode);
			return this.dragula = this.template.dragula || this.template.getDragula();
		}

		var me = this;
		this.dragula = dragula({
			containers: [this.marker.parentNode],
			isContainer: el => {
				if (this.accepts.length) {
					return Mavo.flatten(this.accepts.map(property => this.mavo.root.find(property, {collections: true})))
								.filter(c => c && c instanceof _)
								.map(c => c.marker.parentNode)
								.indexOf(el) > -1;
				}

				return false;
			},
			moves: (el, container, handle) => {
				return handle.classList.contains("mv-drag-handle") && handle.closest(Mavo.selectors.multiple) == el;
			},
			accepts: function(el, target, source, next) {
				if (el.contains(target)) {
					return false;
				}

				var previous = next? next.previousElementSibling : target.lastElementChild;

				var collection = _.get(previous) || _.get(next);

				if (!collection) {
					return false;
				}

				var item = Mavo.Node.get(el);

				return item && item.collection.isCompatible(collection);
			}
		});

		this.dragula.on("drop", (el, target, source) => {
			var item = Mavo.Node.get(el);
			var oldIndex = item && item.index;
			var next = el.nextElementSibling;
			var previous = el.previousElementSibling;
			var collection = _.get(previous) || _.get(next);
			var closestItem = Mavo.Node.get(previous) || Mavo.Node.get(next);

			if (closestItem && closestItem.collection != collection) {
				closestItem = null;
			}

			if (item.collection.isCompatible(collection)) {
				var index = closestItem? closestItem.index + (closestItem.element === previous) : collection.length;
				collection.add(item, index);
			}
			else {
				return this.dragula.cancel(true);
			}
		});

		_.dragulas.push(this.dragula);

		return this.dragula;
	},

	lazy: {
		bottomUp: function() {
			/*
			 * Add new items at the top or bottom?
			 */

			if (!this.mutable) {
				return false;
			}

			var order = this.templateElement.getAttribute("mv-order");
			if (order !== null) {
				// Attribute has the highest priority and overrides any heuristics
				return /^desc\b/i.test(order);
			}

			if (!this.addButton.parentNode) {
				// If add button not in DOM, do the default
				return false;
			}

			// If add button is already in the DOM and *before* our template, then we default to prepending
			return !!(this.addButton.compareDocumentPosition(this.marker) & Node.DOCUMENT_POSITION_FOLLOWING);
		},

		closestCollection: function() {
			var parent = this.marker? this.marker.parentNode : this.templateElement.parentNode;

			return parent.closest(Mavo.selectors.multiple);
		},

		addButton: function() {
			// Find add button if provided, or generate one
			var selector = `button.mv-add-${this.property}`;
			var group = this.closestCollection || this.marker.parentNode.closest(Mavo.selectors.group);

			if (group) {
				var button = $$(selector, group).filter(button => {
					return !this.templateElement.contains(button);
				})[0];
			}

			if (!button) {
				button = $.create("button", {
					className: "mv-add",
					textContent: "Add " + this.name
				});
			};

			button.classList.add("mv-ui", "mv-add");
			Mavo.data(button, "collection", this);

			if (this.property) {
				button.classList.add(`mv-add-${this.property}`);
			}

			button.addEventListener("click", evt => {
				evt.preventDefault();

				this.editItem(this.add());
			});

			return button;
		}
	},

	static: {
		dragulas: [],
		get: element => {
			// Is it an add button or a marker?
			var collection = Mavo.data(element, "collection");

			if (collection) {
				return collection;
			}

			// Maybe it's a collection item?
			var item = Mavo.Node.get(element);

			return item && item.collection || null;
		},

		lazy: {
			dragula: () => $.include(self.dragula, "https://cdnjs.cloudflare.com/ajax/libs/dragula/3.7.2/dragula.min.js")
		}
	}
});

})(Bliss, Bliss.$);

(function($, $$) {

var _ = Mavo.UI.Itembar = $.Class({
	constructor: function(item) {
		this.item = item;

		this.element = $$(`.mv-item-bar:not([mv-rel]), .mv-item-bar[mv-rel="${this.item.property}"]`, this.item.element).filter(el => {
				// Remove item controls meant for other collections
				return el.closest(Mavo.selectors.multiple) == this.item.element && !Mavo.data(el, "item");
			})[0];

		this.element = this.element || $.create({
			className: "mv-item-bar mv-ui"
		});

		Mavo.data(this.element, "item", this.item);

		$.set(this.element, {
			"mv-rel": this.item.property,
			contents: [
				{
					tag: "button",
					title: "Delete this " + this.item.name,
					className: "mv-delete",
					events: {
						"click": evt => this.item.collection.delete(item)
					}
				}, {
					tag: "button",
					title: `Add new ${this.item.name.replace(/s$/i, "")} ${this.collection.bottomUp? "after" : "before"}`,
					className: "mv-add",
					events: {
						"click": evt => {
							var newItem = this.collection.add(null, this.item.index);

							if (evt[Mavo.superKey]) {
								newItem.render(this.item.data);
							}

							Mavo.scrollIntoViewIfNeeded(newItem.element);

							return this.collection.editItem(newItem);
						}
					}
				}, {
					tag: "button",
					title: "Drag to reorder " + this.item.name,
					className: "mv-drag-handle",
					events: {
						click: evt => evt.target.focus(),
						keydown: evt => {
							if (evt.keyCode >= 37 && evt.keyCode <= 40) {
								// Arrow keys
								this.move(this.item, evt.keyCode <= 38? -1 : 1);

								evt.stopPropagation();
								evt.preventDefault();
								evt.target.focus();
							}
						}
					}
				}
			],
			events: {
				mouseenter: evt => {
					this.item.element.classList.add("mv-highlight");
				},
				mouseleave: evt => {
					this.item.element.classList.remove("mv-highlight");
				}
			}
		});
	},

	add: function() {
		if (!this.element.parentNode) {
			if (!Mavo.revocably.add(this.element)) {
				if (this.item instanceof Mavo.Primitive && !this.item.attribute) {
					this.element.classList.add("mv-adjacent");
					$.after(this.element, this.item.element);
				}
				else {
					this.item.element.appendChild(this.element);
				}
			}
		}
	},

	remove: function() {
		 Mavo.revocably.remove(this.element);
	},

	proxy: {
		collection: "item",
		mavo: "item"
	}
});

})(Bliss, Bliss.$);

(function($) {

Mavo.attributes.push("mv-expressions");

var _ = Mavo.Expression = $.Class({
	constructor: function(expression) {
		this.expression = expression;
	},

	eval: function(data) {
		this.oldValue = this.value;

		Mavo.hooks.run("expression-eval-beforeeval", this);

		try {
			if (!this.function) {
				this.function = _.compile(this.expression);
				this.identifiers = this.expression.match(/[$a-z][$\w]*/ig) || [];
			}

			this.value = this.function(data);
		}
		catch (exception) {
			console.info("%cExpression error!", "color: red; font-weight: bold", `${exception.message} in expression ${this.expression}`);

			Mavo.hooks.run("expression-eval-error", {context: this, exception});

			this.value = exception;
		}

		return this.value;
	},

	toString() {
		return this.expression;
	},

	changedBy: function(evt) {
		if (!evt) {
			return true;
		}

		if (!this.identifiers) {
			return false;
		}

		if (this.identifiers.indexOf(evt.property) > -1) {
			return true;
		}

		if (Mavo.Functions.intersects(evt.properties, this.identifiers)) {
			return true;
		}

		if (evt.action != "propertychange") {
			if (Mavo.Functions.intersects(["$index", "$previous", "$next"], this.identifiers)) {
				return true;
			}

			var collection = evt.node.collection || evt.node;

			if (Mavo.Functions.intersects(collection.properties, this.identifiers)) {
				return true;
			}
		}

		return false;
	},

	live: {
		expression: function(value) {
			var code = value = value;

			this.function = null;
		}
	},

	static: {
		/**
		 * These serializers transform the AST into JS
		 */
		serializers: {
			"BinaryExpression": node => `${_.serialize(node.left)} ${node.operator} ${_.serialize(node.right)}`,
			"UnaryExpression": node => `${node.operator}${_.serialize(node.argument)}`,
			"CallExpression": node => `${_.serialize(node.callee)}(${node.arguments.map(_.serialize).join(", ")})`,
			"ConditionalExpression": node => `${_.serialize(node.test)}? ${_.serialize(node.consequent)} : ${_.serialize(node.alternate)}`,
			"MemberExpression": node => `get(${_.serialize(node.object)}, "${node.property.name || node.property.value}")`,
			"ArrayExpression": node => `[${node.elements.map(_.serialize).join(", ")}]`,
			"Literal": node => node.raw,
			"Identifier": node => node.name,
			"ThisExpression": node => "this",
			"Compound": node => node.body.map(_.serialize).join(" ")
		},

		/**
		 * These are run before the serializers and transform the expression to support MavoScript
		 */
		transformations: {
			"BinaryExpression": node => {
				let name = Mavo.Script.getOperatorName(node.operator);
				let details = Mavo.Script.operators[name];

				// Flatten same operator calls
				var nodeLeft = node;
				var args = [];

				do {
					args.unshift(nodeLeft.right);
					nodeLeft = nodeLeft.left;
				} while (Mavo.Script.getOperatorName(nodeLeft.operator) === name);

				args.unshift(nodeLeft);

				if (args.length > 1) {
					return `${name}(${args.map(_.serialize).join(", ")})`;
				}
			},
			"CallExpression": node => {
				if (node.callee.type == "Identifier" && node.callee.name == "if") {
					node.callee.name = "iff";
				}
			}
		},

		serialize: node => {
			if (_.transformations[node.type]) {
				var ret = _.transformations[node.type](node);

				if (ret !== undefined) {
					return ret;
				}
			}

			return _.serializers[node.type](node);
		},

		rewrite: function(code) {
			try {
				return _.serialize(_.parse(code));
			}
			catch (e) {
				// Parsing as MavoScript failed, falling back to plain JS
				return code;
			}
		},

		compile: function(code) {
			code = _.rewrite(code);

			return new Function("data", `with(Mavo.Functions._Trap)
					with (data || {}) {
						return ${code};
					}`);
		},

		parse: self.jsep,
	}
});

if (self.jsep) {
	jsep.addBinaryOp("and", 2);
	jsep.addBinaryOp("or", 2);
	jsep.addBinaryOp("=", 6);
	jsep.addBinaryOp("mod", 10);
	jsep.removeBinaryOp("===");
}

_.serializers.LogicalExpression = _.serializers.BinaryExpression;
_.transformations.LogicalExpression = _.transformations.BinaryExpression;

_.Syntax = $.Class({
	constructor: function(start, end) {
		this.start = start;
		this.end = end;
		this.regex = RegExp(`${Mavo.escapeRegExp(start)}([\\S\\s]+?)${Mavo.escapeRegExp(end)}`, "gi");
	},

	test: function(str) {
		this.regex.lastIndex = 0;

		return this.regex.test(str);
	},

	tokenize: function(str) {
		var match, ret = [], lastIndex = 0;

		this.regex.lastIndex = 0;

		while ((match = this.regex.exec(str)) !== null) {
			// Literal before the expression
			if (match.index > lastIndex) {
				ret.push(str.substring(lastIndex, match.index));
			}

			lastIndex = this.regex.lastIndex;

			ret.push(new Mavo.Expression(match[1]));
		}

		// Literal at the end
		if (lastIndex < str.length) {
			ret.push(str.substring(lastIndex));
		}

		return ret;
	},

	static: {
		create: function(element) {
			if (element) {
				var syntax = element.getAttribute("mv-expressions");

				if (syntax) {
					syntax = syntax.trim();
					return /\s/.test(syntax)? new _.Syntax(...syntax.split(/\s+/)) : _.Syntax.ESCAPE;
				}
			}
		},

		ESCAPE: -1
	}
});

_.Syntax.default = new _.Syntax("[", "]");

})(Bliss);

(function($) {

var _ = Mavo.DOMExpression = $.Class({
	constructor: function(o = {}) {
		this.mavo = o.mavo;
		this.template = o.template && o.template.template || o.template;

		for (let prop of ["item", "path", "syntax", "fallback", "attribute"]) {
			this[prop] = o[prop] === undefined && this.template? this.template[prop] : o[prop];
		}

		this.node = o.node;

		if (!this.node) {
			// No node provided, figure it out from path
			this.node = this.path.reduce((node, index) => {
				return node.childNodes[index];
			}, this.item.element);
		}

		this.element = this.node;
		this.attribute = this.attribute || null;

		Mavo.hooks.run("domexpression-init-start", this);

		if (!this.expression) { // Still unhandled?
			if (this.node.nodeType === 3) {
				this.element = this.node.parentNode;

				// If no element siblings make this.node the element, which is more robust
				// Same if attribute, there are no attributes on a text node!
				if (!this.node.parentNode.children.length || this.attribute) {
					this.node = this.element;
					this.element.normalize();
				}
			}

			if (this.attribute) {
				this.expression = this.node.getAttribute(this.attribute).trim();
			}
			else {
				// Move whitespace outside to prevent it from messing with types
				this.node.normalize();

				if (this.node.firstChild && this.node.childNodes.length === 1 && this.node.firstChild.nodeType === 3) {
					var whitespace = this.node.firstChild.textContent.match(/^\s*|\s*$/g);

					if (whitespace[1]) {
						this.node.firstChild.splitText(this.node.firstChild.textContent.length - whitespace[1].length);
						$.after(this.node.lastChild, this.node);
					}

					if (whitespace[0]) {
						this.node.firstChild.splitText(whitespace[0].length);
						this.node.parentNode.insertBefore(this.node.firstChild, this.node);
					}
				}

				this.expression = this.node.textContent;
			}


			this.parsed = o.template? o.template.parsed : this.syntax.tokenize(this.expression);
		}

		this.oldValue = this.value = this.parsed.map(x => x instanceof Mavo.Expression? x.expression : x);

		this.mavo.treeBuilt.then(() => {
			if (!this.template) {
				// Only collection items and groups can have their own expressions arrays
				this.item = Mavo.Node.get(this.element.closest(Mavo.selectors.multiple + ", " + Mavo.selectors.group));
				this.item.expressions = [...(this.item.expressions || []), this];
			}

			Mavo.hooks.run("domexpression-init-treebuilt", this);
		});

		Mavo.hooks.run("domexpression-init-end", this);

		_.elements.set(this.element, [...(_.elements.get(this.element) || []), this]);
	},

	changedBy: function(evt) {
		return !this.parsed.every(expr => !(expr instanceof Mavo.Expression) || !expr.changedBy(evt));
	},

	update: function(data = this.data, event) {
		var env = {context: this, ret: {}, event};
		var parentEnv = env;

		this.data = data;

		env.ret = {};

		Mavo.hooks.run("domexpression-update-start", env);

		this.oldValue = this.value;

		env.ret.value = this.value = this.parsed.map((expr, i) => {
			if (expr instanceof Mavo.Expression) {
				if (expr.changedBy(parentEnv.event)) {
					var env = {context: this, expr, parentEnv};

					Mavo.hooks.run("domexpression-update-beforeeval", env);

					env.value = env.expr.eval(data);

					Mavo.hooks.run("domexpression-update-aftereval", env);

					if (env.value instanceof Error) {
						return this.fallback !== undefined? this.fallback : env.expr.expression;
					}
					if (env.value === undefined || env.value === null) {
						// Don’t print things like "undefined" or "null"
						return "";
					}

					return env.value;
				}
				else {
					return this.oldValue[i];
				}
			}

			return expr;
		});

		if (!this.attribute) {
			// Separate presentational & actual values only apply when content is variable
			env.ret.presentational = this.value.map(value => {
				if (Array.isArray(value)) {
					return value.join(", ");
				}

				if (typeof value == "number") {
					return Mavo.Primitive.formatNumber(value);
				}

				return value;
			});

			env.ret.presentational = env.ret.presentational.length === 1? env.ret.presentational[0] : env.ret.presentational.join("");
		}

		env.ret.value = env.ret.value.length === 1? env.ret.value[0] : env.ret.value.join("");

		if (this.primitive && this.parsed.length === 1) {
			if (typeof env.ret.value === "number") {
				this.primitive.datatype = "number";
			}
			else if (typeof env.ret.value === "boolean") {
				this.primitive.datatype = "boolean";
			}
		}

		if (env.ret.presentational === env.ret.value) {
			ret = env.ret.value;
		}

		this.output(env.ret);

		Mavo.hooks.run("domexpression-update-end", env);
	},

	output: function(value) {
		if (this.primitive) {
			this.primitive.value = value;
		}
		else {
			value = value.presentational || value;
			Mavo.Primitive.setValue(this.node, value, {attribute: this.attribute});
		}
	},

	static: {
		elements: new WeakMap(),

		/**
		 * Search for Mavo.DOMExpression object(s) associated with a given element
		 * and optionally an attribute.
		 *
		 * @return If one argument, array of matching DOMExpression objects.
		 *         If two arguments, the matching DOMExpression object or null
		 */
		search: function(element, attribute) {
			var all = _.elements.get(element) || [];

			if (arguments.length > 1) {
				if (!all.length) {
					return null;
				}

				return all.filter(et => et.attribute === attribute)[0] || null;
			}

			return all;
		}
	}
});

})(Bliss);

(function($, $$) {

var _ = Mavo.Expressions = $.Class({
	constructor: function(mavo) {
		this.mavo = mavo;
		this.active = true;

		this.expressions = [];

		var syntax = Mavo.Expression.Syntax.create(this.mavo.element.closest("[mv-expressions]")) || Mavo.Expression.Syntax.default;
		this.traverse(this.mavo.element, undefined, syntax);

		this.scheduled = new Set();

		this.mavo.treeBuilt.then(() => {
			this.expressions = [];

			// Watch changes and update value
			document.documentElement.addEventListener("mavo:datachange", evt => {
				if (!this.active) {
					return;
				}

				if (evt.action == "propertychange" && evt.node.closestCollection) {
					// Throttle propertychange events in collections and events from other Mavos
					if (!this.scheduled.has(evt.property)) {
						setTimeout(() => {
							this.scheduled.delete(evt.property);
							this.update(evt);
						}, _.PROPERTYCHANGE_THROTTLE);

						this.scheduled.add(evt.property);
					}
				}
				else {
					requestAnimationFrame(() => this.update(evt));
				}
			});

			this.update();
		});
	},

	update: function(evt) {
		var root, rootGroup;

		if (!this.active) {
			return;
		}

		if (evt instanceof Element) {
			root = evt.closest(Mavo.selectors.group);
			evt = null;
		}

		root = root || this.mavo.element;
		rootGroup = Mavo.Node.get(root);

		var allData = rootGroup.getData({live: true});

		rootGroup.walk((obj, path) => {
			var data = $.value(allData, ...path);

			if (obj.expressions && obj.expressions.length && !obj.isDeleted()) {
				if (typeof data != "object") {
					var parentData = $.value(allData, ...path.slice(0, -1));

					data = {
						[Symbol.toPrimitive]: () => data,
						[obj.property]: data
					};

					if (self.Proxy) {
						data = obj.relativizeData(data);
					}
				}

				for (let et of obj.expressions) {
					if (et.changedBy(evt)) {
						et.update(data, evt);
					}
				}
			}
		});
	},

	extract: function(node, attribute, path, syntax) {
		if (attribute && attribute.name == "mv-expressions") {
			return;
		}

		if ((attribute && _.directives.indexOf(attribute.name) > -1) ||
		    syntax.test(attribute? attribute.value : node.textContent)
		) {
			this.expressions.push(new Mavo.DOMExpression({
				node, syntax,
				path: path? path.slice(1).split("/").map(i => +i) : [],
				attribute: attribute && attribute.name,
				mavo: this.mavo
			}));
		}
	},

	// Traverse an element, including attribute nodes, text nodes and all descendants
	traverse: function(node, path = "", syntax) {
		if (node.nodeType === 8) {
			// We don't want expressions to be picked up from comments!
			// Commenting stuff out is a common debugging technique
			return;
		}

		if (node.nodeType === 3) { // Text node
			// Leaf node, extract references from content
			this.extract(node, null, path, syntax);
		}
		else {
			node.normalize();

			syntax = Mavo.Expression.Syntax.create(node) || syntax;

			if (syntax === Mavo.Expression.Syntax.ESCAPE) {
				return;
			}

			if (Mavo.is("multiple", node)) {
				path = "";
			}

			$$(node.attributes).forEach(attribute => this.extract(node, attribute, path, syntax));
			$$(node.childNodes).forEach((child, i) => this.traverse(child, `${path}/${i}`, syntax));
		}
	},

	static: {
		directives: [],

		PROPERTYCHANGE_THROTTLE: 50,

		directive: function(name, o) {
			_.directives.push(name);
			Mavo.attributes.push(name);
			o.name = name;
			Mavo.Plugins.register(o);
		}
	}
});

if (self.Proxy) {
	Mavo.hooks.add("node-getdata-end", function(env) {
		if (env.options.live && (env.data || env.data === 0 || env.data === "") && (typeof env.data === "object")) {
			var data = env.data;

			env.data = this.relativizeData(data);
		}
	});
}

})(Bliss, Bliss.$);

// mv-if plugin
(function($, $$) {

Mavo.Expressions.directive("mv-if", {
	extend: {
		"Primitive": {
			live: {
				"hidden": function(value) {
					if (this._hidden !== value) {
						this._hidden = value;
						this.dataChanged();
					}
				}
			}
		},
		"DOMExpression": {
			lazy: {
				"childProperties": function() {
					if (this.attribute != "mv-if") {
						return;
					}

					var properties = $$(Mavo.selectors.property, this.element)
									.filter(el => el.closest("[mv-if]") == this.element)
									.map(el => Mavo.Node.get(el));

					// When the element is detached, datachange events from properties
					// do not propagate up to the group so expressions do not recalculate.
					// We must do this manually.
					this.element.addEventListener("mavo:datachange", evt => {
						// Cannot redispatch synchronously [why??]
						requestAnimationFrame(() => {
							if (!this.element.parentNode) { // out of the DOM?
							this.item.element.dispatchEvent(evt);
						}
						});
					});

					return properties;
				}
			}
		}
	},
	hooks: {
		"domexpression-init-start": function() {
			if (this.attribute != "mv-if") {
				return;
			}

			this.expression = this.element.getAttribute("mv-if");
			this.parsed = [new Mavo.Expression(this.expression)];
			this.expression = this.syntax.start + this.expression + this.syntax.end;

			this.parentIf = this.element.parentNode && Mavo.DOMExpression.search(this.element.parentNode.closest("[mv-if]"), "mv-if");

			if (this.parentIf) {
				this.parentIf.childIfs = (this.parentIf.childIfs || new Set()).add(this);
			}
		},
		"domexpression-update-end": function() {
			if (this.attribute != "mv-if") {
				return;
			}

			var value = this.value[0];
			var oldValue = this.oldValue[0];

			// Only apply this after the tree is built, otherwise any properties inside the if will go missing!
			this.item.mavo.treeBuilt.then(() => {
				if (this.parentIf) {
					var parentValue = this.parentIf.value[0];
					this.value[0] = value = value && parentValue;
				}

				if (value === oldValue) {
					return;
				}

				if (parentValue !== false) { // If parent if was false, it wouldn't matter whether this is in the DOM or not
					if (value) {
						// Is removed from the DOM and needs to get back
						Mavo.revocably.add(this.element);
					}
					else if (this.element.parentNode) {
						// Is in the DOM and needs to be removed
						Mavo.revocably.remove(this.element, "mv-if");
					}
				}

				// Mark any properties inside as hidden or not
				if (this.childProperties) {
					for (let property of this.childProperties) {
						property.hidden = !value;
					}
				}

				if (this.childIfs) {
					for (let childIf of this.childIfs) {
						childIf.update();
					}
				}
			});
		},
		"unit-isdatanull": function(env) {
			env.result = env.result || (this.hidden && env.options.live);
		}
	}
});

})(Bliss, Bliss.$);

// mv-value plugin
Mavo.Expressions.directive("mv-value", {
	hooks: {
		"node-init-start": function() {
			if (!(this instanceof Mavo.Group || this.collection)) {
				return;
			}

			var et = Mavo.DOMExpression.search(this.element).filter(et => et.originalAttribute == "mv-value")[0];

			if (!et) {
				return;
			}

			et.mavoNode = this;
			this.expressionText = et;
			this.storage = this.storage || "none";
			this.modes = "read";

			if (this.collection) {
				this.collection.expressions = [...(this.collection.expressions || []), et];
				et.mavoNode = this.collection;
				this.collection.storage = this.collection.storage || "none";
				this.collection.modes = "read";
			}
		},
		"domexpression-init-start": function() {
			if (this.attribute != "mv-value") {
				return;
			}

			this.originalAttribute = "mv-value";
			this.attribute = Mavo.Primitive.getValueAttribute(this.element);
			this.fallback = this.fallback || Mavo.Primitive.getValue(this.element, {attribute: this.attribute});
			this.expression = this.element.getAttribute("mv-value");
			this.element.removeAttribute("mv-value");

			this.parsed = [new Mavo.Expression(this.expression)];
			this.expression = this.syntax.start + this.expression + this.syntax.end;
		},
		"domexpression-init-treebuilt": function() {
			if (this.originalAttribute != "mv-value" ||
			   !this.mavoNode ||
			   !(this.mavoNode == this.item || this.mavoNode == this.item.collection)) {
				return;
			}

			if (this.mavoNode == this.item.collection) {
				Mavo.delete(this.item.expressions, this);
			}

			this.output = function(value) {
				value = value.value || value;

				this.mavoNode.render(value);
			};

			this.changedBy = evt => true;
		},
		"domexpression-update-start": function() {
			if (this.originalAttribute != "mv-value" || this.mavoNode != this.item) {
				return;
			}
		}
	}
});

/**
 * Functions available inside Mavo expressions
 */

(function() {

var _ = Mavo.Functions = {
	operators: {
		"=": "eq"
	},

	/**
	 * Get a property of an object. Used by the . operator to prevent TypeErrors
	 */
	get: function(obj, property) {
		if (obj && obj[property] !== undefined) {
			return obj[property];
		}

		if (Array.isArray(obj) && isNaN(property)) {
			// Array and non-numerical property
			for (var first of obj) {
				if (first && typeof first === "object") {
					break;
				}
			}

			if (first) {
				if ("id" in first) {
					// Try by id?
					for (var i=0; i<obj.length; i++) {
						if (obj[i] && obj[i].id == property) {
							return _.get(obj, i);
						}
					}
				}

				// Still here, get that property from the objects inside
				return obj.map(e => _.get(e, property));
			}
		}

		// Not found :(
		return null;
	},

	unique: function(arr) {
		if (!Array.isArray(arr)) {
			return arr;
		}

		return [...new Set(arr)];
	},

	/**
	 * Do two arrays have a non-empty intersection?
	 * @return {Boolean}
	 */
	intersects: (arr1, arr2) => arr1 && arr2 && !arr1.every(el => arr2.indexOf(el) == -1),

	/*********************
	 * Number functions
	 *********************/

	/**
	 * Aggregate sum
	 */
	sum: function(array) {
		return numbers(array, arguments).reduce((prev, current) => {
			return +prev + (+current || 0);
		}, 0);
	},

	/**
	 * Average of an array of numbers
	 */
	average: function(array) {
		array = numbers(array, arguments);

		return array.length && _.sum(array) / array.length;
	},

	/**
	 * Min of an array of numbers
	 */
	min: function(array) {
		return Math.min(...numbers(array, arguments));
	},

	/**
	 * Max of an array of numbers
	 */
	max: function(array) {
		return Math.max(...numbers(array, arguments));
	},

	count: function(array) {
		return Mavo.toArray(array).filter(a => a !== null && a !== false && a !== "").length;
	},

	round: function(num, decimals) {
		if (!num || !decimals || !isFinite(num)) {
			return Math.round(num);
		}

		return +num.toLocaleString("en-US", {
			useGrouping: false,
			maximumFractionDigits: decimals
		});
	},

	iff: function(condition, iftrue, iffalse="") {
		if (Array.isArray(condition)) {
			return condition.map((c, i) => {
				var ret = c? iftrue : iffalse;

				if (Array.isArray(ret)) {
					return ret[Math.min(i, ret.length - 1)];
				}

				return ret;
			});
		}

		return condition? iftrue : iffalse;
	},

	/*********************
	 * String functions
	 *********************/

	/**
	 * Replace all occurences of a string with another string
	 */
	replace: function(haystack, needle, replacement = "", iterations = 1) {
		if (Array.isArray(haystack)) {
			return haystack.map(item => _.replace(item, needle, replacement));
		}

		// Simple string replacement
		var needleRegex = RegExp(Mavo.escapeRegExp(needle), "g");
		var ret = haystack, prev;
		var counter = 0;

		while (ret != prev && (counter++ < iterations)) {
			prev = ret;
			ret = ret.replace(needleRegex, replacement);
		}

		return ret;
	},

	len: str => (str || "").length,
	/**
	 * Case insensitive search
	 */
	search: (haystack, needle) => haystack && needle? (haystack + "").toLowerCase().indexOf((needle + "").toLowerCase()) : -1,

	starts: (haystack, needle) => _.search((haystack + ""), (needle + "")) === 0,
	ends: function(haystack, needle) {
		haystack += "";
		needle += "";
		var i = _.search(haystack, needle);
		return  i > -1 && i === haystack.length - needle.length;
	},

	join: function(array, glue = "") {
		return Mavo.toArray(array).join(glue);
	},

	idify: function(readable) {
		return ((readable || "") + "")
			.replace(/\s+/g, "-") // Convert whitespace to hyphens
			.replace(/[^\w-]/g, "") // Remove weird characters
			.toLowerCase();
	},

	// Convert an identifier to readable text that can be used as a label
	readable: function (identifier) {
		// Is it camelCase?
		return identifier && identifier
				 .replace(/([a-z])([A-Z])(?=[a-z])/g, ($0, $1, $2) => $1 + " " + $2.toLowerCase()) // camelCase?
				 .replace(/([a-z])[_\/-](?=[a-z])/g, "$1 ") // Hyphen-separated / Underscore_separated?
				 .replace(/^[a-z]/, $0 => $0.toUpperCase()); // Capitalize
	},

	uppercase: str => (str + "").toUpperCase(),
	lowercase: str => (str + "").toLowerCase(),

	/*********************
	 * Date functions
	 *********************/

	get $now() {
		return new Date();
	},

	year: getDateComponent("year"),
	month: getDateComponent("month"),
	day: getDateComponent("day"),
	weekday: getDateComponent("weekday"),
	hour: getDateComponent("hour"),
	hour12: getDateComponent("hour", "numeric", {hour12:true}),
	minute: getDateComponent("minute"),
	second: getDateComponent("second"),

	date: date => {
		return `${_.year(date)}-${_.month(date).twodigit}-${_.day(date).twodigit}`;
	},
	time: date => {
		return `${_.hour(date).twodigit}:${_.minute(date).twodigit}:${_.second(date).twodigit}`;
	},

	minutes: seconds => Math.floor(Math.abs(seconds) / 60),
	hours: seconds => Math.floor(Math.abs(seconds) / 3600),
	days: seconds => Math.floor(Math.abs(seconds) / 86400),
	weeks: seconds => Math.floor(Math.abs(seconds) / 604800),
	months: seconds => Math.floor(Math.abs(seconds) / (30.4368 * 86400)),
	years: seconds => Math.floor(Math.abs(seconds) / (30.4368 * 86400 * 12)),

	localTimezone: -(new Date()).getTimezoneOffset(),

	// Log to the console and return
	log: (...args) => {
		console.log(args);
		return args[0];
	}
};

// $url: Read-only syntactic sugar for URL stuff
$.lazy(Mavo.Functions, "$url", function() {
	var ret = {};
	var url = new URL(location);

	for (let pair of url.searchParams) {
		ret[pair[0]] = pair[1];
	}

	Object.defineProperty(ret, "toString", {
		value: () => new URL(location)
	});

	return ret;
});

Mavo.Script = {
	addUnaryOperator: function(name, o) {
		return operand => Array.isArray(operand)? operand.map(o.scalar) : o.scalar(operand);
	},

	/**
	 * Extend a scalar operator to arrays, or arrays and scalars
	 * The operation between arrays is applied element-wise.
	 * The operation operation between a scalar and an array will result in
	 * the operation being applied between the scalar and every array element.
	 */
	addBinaryOperator: function(name, o) {
		if (o.symbol) {
			// Build map of symbols to function names for easy rewriting
			for (let symbol of Mavo.toArray(o.symbol)) {
				Mavo.Script.symbols[symbol] = name;
			}
		}

		o.identity = o.identity === undefined? 0 : o.identity;

		return _[name] = o.code || function(...operands) {
			if (operands.length === 1) {
				if (Array.isArray(operands[0])) {
					// Operand is an array of operands, expand it out
					operands = [...operands[0]];
				}
			}

			var prev = o.logical? o.identity : operands[0], result;

			for (let i = 1; i < operands.length; i++) {
				let a = o.logical? operands[i - 1] : prev;
				let b = operands[i];

				if (Array.isArray(b)) {
					if (typeof o.identity == "number") {
						b = numbers(b);
					}

					if (Array.isArray(a)) {
						result = [
							...b.map((n, i) => o.scalar(a[i] === undefined? o.identity : a[i], n)),
							...a.slice(b.length)
						];
					}
					else {
						result = b.map(n => o.scalar(a, n));
					}
				}
				else if (Array.isArray(a)) {
					result = a.map(n => o.scalar(n, b));
				}
				else {
					result = o.scalar(a, b);
				}

				if (o.reduce) {
					prev = o.reduce(prev, result, a, b);
				}
				else if (o.logical) {
					prev = prev && result;
				}
				else {
					prev = result;
				}
			}

			return prev;
		};
	},

	/**
	 * Mapping of operator symbols to function name.
	 * Populated via addOperator() and addLogicalOperator()
	 */
	symbols: {},

	getOperatorName: op => Mavo.Script.symbols[op] || op,

	/**
	 * Operations for elements and scalars.
	 * Operations between arrays happen element-wise.
	 * Operations between a scalar and an array will result in the operation being performed between the scalar and every array element.
	 * Ordered by precedence (higher to lower)
	 * @param scalar {Function} The operation between two scalars
	 * @param identity The operation’s identity element. Defaults to 0.
	 */
	operators: {
		"not": {
			scalar: a => a => !a
		},
		"multiply": {
			scalar: (a, b) => a * b,
			identity: 1,
			symbol: "*"
		},
		"divide": {
			scalar: (a, b) => a / b,
			identity: 1,
			symbol: "/"
		},
		"add": {
			scalar: (a, b) => +a + +b,
			symbol: "+"
		},
		"subtract": {
			scalar: (a, b) => {
				if (isNaN(a) || isNaN(b)) {
					var dateA = toDate(a), dateB = toDate(b);

					if (dateA && dateB) {
						return (dateA - dateB)/1000;
					}
				}

				return a - b;
			},
			symbol: "-"
		},
		"mod": {
			scalar: (a, b) => {
				var ret = a % b;
				ret += ret < 0? b : 0;
				return ret;
			}
		},
		"lte": {
			logical: true,
			scalar: (a, b) => {
				[a, b] = Mavo.Script.getNumericalOperands(a, b);
				return a <= b;
			},
			identity: true,
			symbol: "<="
		},
		"lt": {
			logical: true,
			scalar: (a, b) => {
				[a, b] = Mavo.Script.getNumericalOperands(a, b);
				return a < b;
			},
			identity: true,
			symbol: "<"
		},
		"gte": {
			logical: true,
			scalar: (a, b) => {
				[a, b] = Mavo.Script.getNumericalOperands(a, b);
				return a >= b;
			},
			identity: true,
			symbol: ">="
		},
		"gt": {
			logical: true,
			scalar: (a, b) => {
				[a, b] = Mavo.Script.getNumericalOperands(a, b);
				return a > b;
			},
			identity: true,
			symbol: ">"
		},
		"eq": {
			logical: true,
			scalar: (a, b) => a == b,
			symbol: ["=", "=="],
			identity: true
		},
		"neq": {
			logical: true,
			scalar: (a, b) => a != b,
			symbol: ["!="],
			identity: true
		},
		"and": {
			logical: true,
			scalar: (a, b) => !!a && !!b,
			identity: true,
			symbol: "&&"
		},
		"or": {
			logical: true,
			scalar: (a, b) => !!a || !!b,
			reduce: (p, r) => p || r,
			identity: false,
			symbol: "||"
		},
		"concatenate": {
			symbol: "&",
			identity: "",
			scalar: (a, b) => "" + (a || "") + (b || "")
		},
		"filter": {
			scalar: (a, b) => b? a : null
		}
	},

	getNumericalOperands: function(a, b) {
		if (isNaN(a) || isNaN(b)) {
			// Try comparing as dates
			var da = toDate(a), db = toDate(b);

			if (da && db) {
				// Both valid dates
				return [da, db];
			}
		}

		return [a, b];
	}
};

for (let name in Mavo.Script.operators) {
	let details = Mavo.Script.operators[name];

	if (details.scalar.length < 2) {
		Mavo.Script.addUnaryOperator(name, details);
	}
	else {
		Mavo.Script.addBinaryOperator(name, details);
	}
}

var aliases = {
	average: "avg",
	iff: "iff IF",
	subtract: "minus",
	multiply: "mult product",
	divide: "div",
	lt: "lessThan smaller",
	gt: "moreThan greater greaterThan bigger",
	eq: "equal equality"
};

for (let name in aliases) {
	aliases[name].split(/\s+/g).forEach(alias => _[alias] = _[name]);
}

// Make function names case insensitive
Mavo.Functions._Trap = self.Proxy? new Proxy(_, {
	get: (functions, property) => {
		if (property in functions) {
			return functions[property];
		}

		var propertyL = property.toLowerCase && property.toLowerCase();

		if (propertyL && functions.hasOwnProperty(propertyL)) {
			return functions[propertyL];
		}

		if (property in Math || propertyL in Math) {
			return Math[property] || Math[propertyL];
		}

		if (property in self) {
			return self[property];
		}

		// Prevent undefined at all costs
		return property;
	},

	// Super ugly hack, but otherwise data is not
	// the local variable it should be, but the string "data"
	// so all property lookups fail.
	has: (functions, property) => property != "data"
}) : Mavo.Functions;

/**
 * Private helper methods
 */
function numbers(array, args) {
	array = Array.isArray(array)? array : (args? $$(args) : [array]);

	return array.filter(number => !isNaN(number) && number !== "").map(n => +n);
}

var twodigits = new Intl.NumberFormat("en", {
	minimumIntegerDigits: "2"
});

twodigits = twodigits.format.bind(twodigits);

function toDate(date) {
	if (!date) {
		return null;
	}

	if ($.type(date) === "string") {
		// Fix up time format

		if (date.indexOf(":") === -1) {
			// Add a time if one doesn't exist
			date += "T00:00:00";
		}
		else {
			// Make sure time starts with T, due to Safari bug
			date = date.replace(/\-(\d{2})\s+(?=\d{2}:)/, "-$1T");
		}

		// Remove all whitespace
		date = date.replace(/\s+/g, "");

		// If no timezone, insert local
		var timezone = (date.match(/[+-]\d{2}:?\d{2}|Z$/) || [])[0];

		if (!timezone) {
			var local = _.localTimezone;
			var minutes = Math.abs(local % 60);
			var hours = (Math.abs(local) - minutes) / 60;
			var sign = local < 0? "-" : "+";
			date += sign + twodigits(hours) + ":" + twodigits(minutes);
		}
	}

	date = new Date(date);

	if (isNaN(date)) {
		return null;
	}

	return date;
}

function getDateComponent(component, option = "numeric", o) {
	var locale = document.documentElement.lang || "en-GB";

	return function(date, format = option) {
		date = toDate(date);

		if (!date) {
			return "";
		}

		var options = $.extend({
			[component]: format,
			hour12: false
		}, o);

		if (component == "weekday" && format == "numeric") {
			ret = date.getDay() || 7;
		}
		else {
			var ret = date.toLocaleString(locale, options);
		}

		if (format == "numeric" && !isNaN(ret)) {
			ret = new Number(ret);

			if (component == "month" || component == "weekday") {
				options[component] = "long";
				ret.name = date.toLocaleString(locale, options);

				options[component] = "short";
				ret.shortname = date.toLocaleString(locale, options);
			}

			if (component != "weekday") {
				options[component] = "2-digit";
				ret.twodigit = date.toLocaleString(locale, options);
			}
		}

		return ret;
	};
}

})();

(function($) {

var _ = Mavo.Backend.register($.Class({
	extends: Mavo.Backend,
	id: "Dropbox",
	constructor: function() {
		this.permissions.on(["login", "read"]);

		this.key = this.mavo.element.getAttribute("mv-dropbox-key") || "2mx6061p054bpbp";

		// Transform the dropbox shared URL into something raw and CORS-enabled
		this.url = _.fixShareURL(this.url);

		this.login(true);
	},

	upload: function(file, path) {
		path = this.path.replace(/[^/]+$/, "") + path;

		return this.put(file, path).then(fileInfo => this.getURL(path));
	},

	getURL: function(path) {
		return this.request("sharing/create_shared_link_with_settings", {path}, "POST")
			.then(shareInfo => _.fixShareURL(shareInfo.url));
	},

	/**
	 * Saves a file to the backend.
	 * @param {Object} file - An object with name & data keys
	 * @return {Promise} A promise that resolves when the file is saved.
	 */
	put: function(serialized, path = this.path, o = {}) {
		return this.request("https://content.dropboxapi.com/2/files/upload", serialized, "POST", {
			headers: {
				"Dropbox-API-Arg": JSON.stringify({
					path,
					mode: "overwrite"
				}),
				"Content-Type": "application/octet-stream"
			}
		});
	},

	oAuthParams: () => `&redirect_uri=${encodeURIComponent("https://auth.mavo.io")}&response_type=code`,

	getUser: function() {
		if (this.user) {
			return Promise.resolve(this.user);
		}

		return this.request("users/get_current_account", "null", "POST")
			.then(info => {
				this.user = {
					username: info.email,
					name: info.name.display_name,
					avatar: info.profile_photo_url,
					info
				};
			});
	},

	login: function(passive) {
		return this.oAuthenticate(passive)
			.then(() => this.getUser())
			.then(u => {
				if (this.user) {
					this.permissions.logout = true;

					// Check if can actually edit the file
					this.request("sharing/get_shared_link_metadata", {
						"url": this.source
					}, "POST").then(info => {
						this.path = info.path_lower;
						this.permissions.on(["edit", "save"]);
					});
				}
			});
	},

	logout: function() {
		return this.oAuthLogout();
	},

	static: {
		apiDomain: "https://api.dropboxapi.com/2/",
		oAuth: "https://www.dropbox.com/oauth2/authorize",

		test: function(url) {
			url = new URL(url, Mavo.base);
			return /dropbox.com/.test(url.host);
		},

		fixShareURL: url => {
			url = new URL(url, Mavo.base);
			url.hostname = "dl.dropboxusercontent.com";
			url.search = url.search.replace(/\bdl=0|^$/, "raw=1");
			return url;
		}
	}
}));

})(Bliss);

(function($) {

var _ = Mavo.Backend.register($.Class({
	extends: Mavo.Backend,
	id: "Github",
	constructor: function() {
		this.permissions.on(["login", "read"]);

		this.key = this.mavo.element.getAttribute("mv-github-key") || "7e08e016048000bc594e";

		// Extract info for username, repo, branch, filepath from URL
		var parsedURL = _.parseURL(this.url);

		if (parsedURL.username) {
			$.extend(this, parsedURL);
			this.repo = this.repo || "mv-data";
			this.path = this.path || `${this.mavo.id}.json`;
			this.apiCall = `repos/${this.username}/${this.repo}/contents/${this.path}`;
		}
		else {
			this.apiCall = this.url.pathname.slice(1);
		}

		this.login(true);
	},

	get: function() {
		if (this.isAuthenticated() || !this.path) {
			// Authenticated or raw API call
			return this.request(this.apiCall)
			       .then(response => Promise.resolve(this.repo? _.atob(response.content) : response));
		}
		else {
			// Unauthenticated, use simple GET request to avoid rate limit
			var url = new URL(`https://raw.githubusercontent.com/${this.username}/${this.repo}/${this.branch || "master"}/${this.path}`);

			return this.super.get.call(this, url);
		}
	},

	upload: function(file, path = this.path) {
		return Mavo.readFile(file).then(dataURL => {
				var base64 = dataURL.slice(5); // remove data:
				var media = base64.match(/^\w+\/[\w+]+/)[0];
				base64 = base64.replace(RegExp(`^${media}(;base64)?,`), "");
				path = this.path.replace(/[^/]+$/, "") + path;

				return this.put(base64, path, {isEncoded: true});
			})
			.then(fileInfo => this.getURL(path, fileInfo.commit.sha));
	},

	/**
	 * Saves a file to the backend.
	 * @param {String} serialized - Serialized data
	 * @param {String} path - Optional file path
	 * @return {Promise} A promise that resolves when the file is saved.
	 */
	put: function(serialized, path = this.path, o = {}) {
		if (!path) {
			// Raw API calls are read-only for now
			return;
		}

		var repoCall = `repos/${this.username}/${this.repo}`;
		var fileCall = `${repoCall}/contents/${path}`;
		var commitPrefix = this.mavo.element.getAttribute("mv-github-commit-prefix");

		// Create repo if it doesn’t exist
		var repoInfo = this.repoInfo || this.request("user/repos", {name: this.repo}, "POST").then(repoInfo => this.repoInfo = repoInfo);

		serialized = o.isEncoded? serialized : _.btoa(serialized);

		return Promise.resolve(repoInfo)
			.then(repoInfo => {
				if (!this.canPush()) {
					// Does not have permission to commit, create a fork
					return this.request(`${repoCall}/forks`, {name: this.repo}, "POST")
						.then(forkInfo => {
							fileCall = `repos/${forkInfo.full_name}/contents/${path}`;
							return this.forkInfo = forkInfo;
						})
						.then(forkInfo => {
							// Ensure that fork is created (they take a while)
							var timeout;
							var test = (resolve, reject) => {
								clearTimeout(timeout);
								this.request(`repos/${forkInfo.full_name}/commits`, {until: "1970-01-01T00:00:00Z"}, "HEAD")
									.then(x => {
										resolve(forkInfo);
									})
									.catch(x => {
										// Try again after 1 second
										timeout = setTimeout(test, 1000);
									});
							};

							return new Promise(test);
						});
				}

				return repoInfo;
			})
			.then(repoInfo => {
				return this.request(fileCall, {
					ref: this.branch
				}).then(fileInfo => this.request(fileCall, {
					message: `${commitPrefix} Updated ${fileInfo.name || "file"}`,
					content: serialized,
					branch: this.branch,
					sha: fileInfo.sha
				}, "PUT"), xhr => {
					if (xhr.status == 404) {
						// File does not exist, create it
						return this.request(fileCall, {
							message: commitPrefix + "Created file",
							content: serialized,
							branch: this.branch
						}, "PUT");
					}

					return xhr;
				});
			})
			.then(fileInfo => {
				if (this.forkInfo) {
					// We saved in a fork, do we have a pull request?
					this.request(`repos/${this.username}/${this.repo}/pulls`, {
						head: `${this.user.username}:${this.branch}`,
						base: this.branch
					}).then(prs => {
						this.pullRequest(prs[0]);
					});
				}

				return fileInfo;
			});
	},

	pullRequest: function(existing) {
		var previewURL = new URL(location);
		previewURL.searchParams.set(this.mavo.id + "-storage", `https://github.com/${this.forkInfo.full_name}/${this.path}`);
		var message = `Your edits are saved to <a href="${previewURL}" target="_blank">your own profile</a>, because you are not allowed to edit this page.`;

		if (this.notice) {
			this.notice.close();
		}

		if (existing) {
			// We already have a pull request, ask about closing it
			this.notice = this.mavo.message(`${message}
				You have selected to suggest your edits to the page admins. Your suggestions have not been reviewed yet.
				<form onsubmit="return false">
					<button class="mv-danger">Revoke edit suggestion</button>
				</form>`, {
					classes: "mv-inline",
					dismiss: ["button", "submit"]
				});

			this.notice.closed.then(form => {
				if (!form) {
					return;
				}

				// Close PR
				this.request(`repos/${this.username}/${this.repo}/pulls/${existing.number}`, {
					state: "closed"
				}, "POST").then(prInfo => {
					new Mavo.UI.Message(this.mavo, `<a href="${prInfo.html_url}">Edit suggestion cancelled successfully!</a>`, {
						dismiss: ["button", "timeout"]
					});

					this.pullRequest();
				});
			});
		}
		else {
			// Ask about creating a PR
			this.notice = this.mavo.message(`${message}
				Write a short description of your edits below to suggest them to the page admins:
				<form onsubmit="return false">
					<textarea name="edits" class="mv-autosize" placeholder="I added / corrected / deleted ..."></textarea>
					<button>Send edit suggestion</button>
				</form>`, {
					classes: "mv-inline",
					dismiss: ["button", "submit"]
				});

			this.notice.closed.then(form => {
				if (!form) {
					return;
				}

				// We want to send a pull request
				this.request(`repos/${this.username}/${this.repo}/pulls`, {
					title: "Suggested edits to data",
					body: `Hello there! I used Mavo to suggest the following edits:
${form.elements.edits.value}
Preview my changes here: ${previewURL}`,
					head: `${this.user.username}:${this.branch}`,
					base: this.branch
				}, "POST").then(prInfo => {
					new Mavo.UI.Message(this.mavo, `<a href="${prInfo.html_url}">Edit suggestion sent successfully!</a>`, {
						dismiss: ["button", "timeout"]
					});

					this.pullRequest(prInfo);
				});
			});
		}
	},

	login: function(passive) {
		return this.oAuthenticate(passive)
			.then(() => this.getUser())
			.catch(xhr => {
				if (xhr.status == 401) {
					// Unauthorized. Access token we have is invalid, discard it
					this.logout();
				}
			})
			.then(u => {
				if (this.user) {
					this.permissions.on(["edit", "save", "logout"]);

					if (this.repo) {
						return this.request(`repos/${this.username}/${this.repo}`)
							.then(repoInfo => {
								if (this.branch === undefined) {
									this.branch = repoInfo.default_branch;
								}

								return this.repoInfo = repoInfo;
							});
					}
				}
			});
	},

	canPush: function() {
		if (this.repoInfo) {
			return this.repoInfo.permissions.push;
		}

		// Repo does not exist so we can't check permissions
		// Just check if authenticated user is the same as our URL username
		return this.user && this.user.username.toLowerCase() == this.username.toLowerCase();
	},

	oAuthParams: () => "&scope=repo,gist",

	logout: function() {
		return this.oAuthLogout().then(() => {
			this.user = null;
		});
	},

	getUser: function() {
		if (this.user) {
			return Promise.resolve(this.user);
		}

		return this.request("user").then(info => {
			this.user = {
				username: info.login,
				name: info.name || info.login,
				avatar: info.avatar_url,
				url: "https://github.com/" + info.login,
				info
			};

			$.fire(this.mavo.element, "mavo:login", { backend: this });
		});
	},

	getURL: function(path = this.path, sha) {
		var repo = `${this.username}/${this.repo}`;
		path = path.replace(/ /g, "%20");

		return this.request(`repos/${repo}/pages`, {}, "GET", {
			headers: {
				"Accept": "application/vnd.github.mister-fantastic-preview+json"
			}
		})
		.then(pagesInfo => pagesInfo.html_url + path)
		.catch(xhr => {
			// No Github Pages, return rawgit URL
			if (sha) {
				return `https://cdn.rawgit.com/${repo}/${sha}/${path}`;
			}
			else {
				return `https://rawgit.com/${repo}/${this.branch}/${path}`;
			}
		});
	},

	static: {
		apiDomain: "https://api.github.com/",
		oAuth: "https://github.com/login/oauth/authorize",

		test: function(url) {
			url = new URL(url, Mavo.base);
			return /\bgithub.com|raw.githubusercontent.com/.test(url.host);
		},

		/**
		 * Parse Github URLs, return username, repo, branch, path
		 */
		parseURL: function(url) {
			var ret = {};

			url = new URL(url, Mavo.base);

			var path = url.pathname.slice(1).split("/");

			ret.username = path.shift();
			ret.repo = path.shift();

			if (/raw.githubusercontent.com$/.test(url.host)) {
				ret.branch = path.shift();
			}
			else if (/api.github.com$/.test(url.host)) {
				// raw API call, stop parsing and just return
				return {};
			}
			else if (/github.com$/.test(url.host) && path[0] == "blob") {
				path.shift();
				ret.branch = path.shift();
			}

			ret.path = path.join("/");

			return ret;
		},

		// Fix atob() and btoa() so they can handle Unicode
		btoa: str => btoa(unescape(encodeURIComponent(str))),
		atob: str => decodeURIComponent(escape(window.atob(str)))
	}
}));

})(Bliss);

//# sourceMappingURL=maps/mavo.js.map
