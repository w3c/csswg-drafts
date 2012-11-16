// Display constants
var VERTICAL_SEPARATION = 8;
var ARC_RADIUS = 10;
var DIAGRAM_CLASS = 'railroad-diagram';
var TRANSLATE_HALF_PIXEL = true;

function subclassOf(baseClass, superClass) {
	baseClass.prototype = Object.create(superClass.prototype);
	baseClass.prototype.$super = superClass.prototype;
}

function unnull(/* children */) {
	return [].slice.call(arguments).reduce(function(sofar, x) { return sofar !== undefined ? sofar : x; });
}


function SVG(name, attrs, text) {
	attrs = attrs || {};
	text = text || '';
	var el = document.createElementNS("http://www.w3.org/2000/svg",name);
	for(var attr in attrs) {
		el.setAttribute(attr, attrs[attr]);
	}
	el.textContent = text;
	return el;
}

function FakeSVG(tagName, attrs, text){
	if(!(this instanceof FakeSVG)) return new FakeSVG(tagName, attrs, text);
	if(text) this.children = text;
	else this.children = [];
	this.tagName = tagName;
	this.attrs = unnull(attrs, {});
	return this;
};
FakeSVG.prototype.format = function(x, y, width) {
	// Virtual
};
FakeSVG.prototype.addTo = function(parent) {
	if(parent instanceof FakeSVG) {
		parent.children.push(this);
		return this;
	} else {
		var svg = this.toSVG();
		parent.appendChild(svg);
		return svg;
	}
};
FakeSVG.prototype.toSVG = function() {
	var el = SVG(this.tagName, this.attrs);
	if(typeof this.children == 'string') {
		el.textContent = this.children;
	} else {
		this.children.forEach(function(e) {
			el.appendChild(e.toSVG());
		});
	}
	return el;
};
FakeSVG.prototype.toString = function() {
	var str = '<' + this.tagName + ' ';
	for(var attr in this.attrs) {
		str += attr + '="' + this.attrs[attr] + '" ';
	}
	str += '>';
	if(typeof this.children == 'string') {
		str += this.children;
	} else {
		this.children.forEach(function(e) {
			str += e;
		});
	}
	str += '</' + this.tagName + '>';
	return str;
}

function Path(x,y) {
	if(!(this instanceof Path)) return new Path(x,y);
	FakeSVG.call(this, 'path');
	this.attrs.d = "M"+x+' '+y;
}
subclassOf(Path, FakeSVG);
Path.prototype.m = function(x,y) {
	this.attrs.d += 'm'+x+' '+y;
	return this;
}
Path.prototype.h = function(val) {
	this.attrs.d += 'h'+val;
	return this;
}
Path.prototype.right = Path.prototype.h;
Path.prototype.left = function(val) { return this.h(-val); }
Path.prototype.v = function(val) {
	this.attrs.d += 'v'+val;
	return this;
}
Path.prototype.down = Path.prototype.v;
Path.prototype.up = function(val) { return this.v(-val); }
Path.prototype.arc = function(sweep){
	var x = ARC_RADIUS;
	var y = ARC_RADIUS;
	if(sweep[0] == 'e' || sweep[1] == 'w') {
		x *= -1;
	}
	if(sweep[0] == 's' || sweep[1] == 'n') {
		y *= -1;
	}
	if(sweep == 'ne' || sweep == 'es' || sweep == 'sw' || sweep == 'wn') {
		var cw = 1;
	} else {
		var cw = 0;
	}
	this.attrs.d += "a"+ARC_RADIUS+" "+ARC_RADIUS+" 0 0 "+cw+' '+x+' '+y;
	return this;
}
Path.prototype.format = function() {
	this.attrs.d += 'h.5';
	return this;
}

function wrapString(value) {
    return ((typeof value) == 'string') ? new Terminal(value) : value;
}

function Diagram(items) {
	if(!(this instanceof Diagram)) return new Diagram([].slice.call(arguments));
	FakeSVG.call(this, 'svg', {class: DIAGRAM_CLASS});
	this.items = items.map(wrapString);
	this.items.unshift(new Start);
	this.items.push(new End);
	this.width = this.items.reduce(function(sofar, el) { return sofar + el.width + (el.needsSpace?20:0)}, 0)+1;
	this.up = this.items.reduce(function(sofar,el) { return Math.max(sofar, el.up)}, 0);
	this.down = this.items.reduce(function(sofar,el) { return Math.max(sofar, el.down)}, 0);
	this.formatted = false;
}
subclassOf(Diagram, FakeSVG);
Diagram.prototype.format = function(paddingt, paddingr, paddingb, paddingl) {
	paddingt = unnull(paddingt, 20);
	paddingr = unnull(paddingt, 20);
	paddingb = unnull(paddingt, 20);
	paddingl = unnull(paddingr, 20);
	var x = paddingl;
	var y = paddingt;
	y += this.up;
	var g = FakeSVG('g', TRANSLATE_HALF_PIXEL ? {transform:'translate(.5 .5)'} : {});
	for(var i = 0; i < this.items.length; i++) {
		var item = this.items[i];
		if(item.needsSpace) {
			Path(x,y).h(10).addTo(g);
			x += 10;
		}
		item.format(x, y, item.width).addTo(g);
		x += item.width;
		if(item.needsSpace) {
			Path(x,y).h(10).addTo(g);
			x += 10;
		}
	}
	this.attrs.width = this.width + paddingl + paddingr;
	this.attrs.height = this.up + this.down + paddingt + paddingb;
	g.addTo(this);
	this.formatted = true;
	return this;
}
Diagram.prototype.addTo = function(parent) {
	parent = parent || document.body;
	this.$super.addTo.call(this, parent);
}
Diagram.prototype.toSVG = function() {
	if (!this.formatted) {
		this.format();
	}
	return this.$super.toSVG.call(this);
}
Diagram.prototype.toString = function() {
	if (!this.formatted) {
		this.format();
	}
	this.$super.toString.call(this);
}

function Sequence(items) {
	if(!(this instanceof Sequence)) return new Sequence([].slice.call(arguments));
	FakeSVG.call(this, 'g');
	this.items = items.map(wrapString);
	this.width = this.items.reduce(function(sofar, el) { return sofar + el.width + (el.needsSpace?20:0)}, 0);
	this.up = this.items.reduce(function(sofar,el) { return Math.max(sofar, el.up)}, 0);
	this.down = this.items.reduce(function(sofar,el) { return Math.max(sofar, el.down)}, 0);
}
subclassOf(Sequence, FakeSVG);
Sequence.prototype.format = function(x,y,width) {
	var diff = width - this.width;
	Path(x,y).h(diff/2).addTo(this);
	x += diff/2;
	for(var i = 0; i < this.items.length; i++) {
		var item = this.items[i];
		if(item.needsSpace) {
			Path(x,y).h(10).addTo(this);
			x += 10;
		}
		item.format(x, y, item.width).addTo(this);
		x += item.width;
		if(item.needsSpace) {
			Path(x,y).h(10).addTo(this);
			x += 10;
		}
	}
	Path(x,y).h(diff/2).addTo(this);
	return this;
}

function Choice(normal, items) {
	if(!(this instanceof Choice)) return new Choice(normal, [].slice.call(arguments,1));
	FakeSVG.call(this, 'g');
	this.normal = normal;
	this.items = items.map(wrapString);
	this.width = this.items.reduce(function(sofar, el){return Math.max(sofar, el.width)},0) + ARC_RADIUS*4;
	this.up = this.down = 0;
	for(var i = 0; i < this.items.length; i++) {
		var item = this.items[i];
		if(i < normal) { this.up += Math.max(ARC_RADIUS,item.up + item.down + VERTICAL_SEPARATION); }
		if(i == normal) { this.up += Math.max(ARC_RADIUS, item.up); this.down += Math.max(ARC_RADIUS, item.down); }
		if(i > normal) { this.down += Math.max(ARC_RADIUS,VERTICAL_SEPARATION + item.up + item.down); }
	}
}
subclassOf(Choice, FakeSVG);
Choice.prototype.format = function(x,y,width) {
	var last = this.items.length -1;
	var innerWidth = this.width - ARC_RADIUS*4;

	// Hook up the two sides if this is narrower than its stated width.
	var diff = width - this.width;
	Path(x,y).h(diff/2).addTo(this);
	Path(x+diff/2+this.width,y).h(diff/2).addTo(this);
	x += diff/2;

	// Do the elements that curve above
	for(var i = this.normal - 1; i >= 0; i--) {
		var item = this.items[i];
		if( i == this.normal - 1 ) {
			var distanceFromY = Math.max(ARC_RADIUS*2, this.items[i+1].up + VERTICAL_SEPARATION + item.down);
		}
		Path(x,y).arc('se').up(distanceFromY - ARC_RADIUS*2).arc('wn').addTo(this);
		item.format(x+ARC_RADIUS*2,y - distanceFromY,innerWidth).addTo(this);
		Path(x+ARC_RADIUS*2+innerWidth, y-distanceFromY).arc('ne').down(distanceFromY - ARC_RADIUS*2).arc('ws').addTo(this);
		distanceFromY += Math.max(ARC_RADIUS, item.up + VERTICAL_SEPARATION + (i == 0 ? 0 : this.items[i-1].down));
	}

	// Do the straight-line path.
	Path(x,y).right(ARC_RADIUS*2).addTo(this);
	this.items[this.normal].format(x+ARC_RADIUS*2, y, innerWidth).addTo(this);
	Path(x+ARC_RADIUS*2+innerWidth, y).right(ARC_RADIUS*2).addTo(this);

	// Do the elements that curve below
	for(var i = this.normal+1; i <= last; i++) {
		var item = this.items[i];
		if( i == this.normal + 1 ) {
			var distanceFromY = Math.max(ARC_RADIUS*2, this.items[i-1].down + VERTICAL_SEPARATION + item.up);
		}
		Path(x,y).arc('ne').down(distanceFromY - ARC_RADIUS*2).arc('ws').addTo(this);
		item.format(x+ARC_RADIUS*2, y+distanceFromY, innerWidth).addTo(this);
		Path(x+ARC_RADIUS*2+innerWidth, y+distanceFromY).arc('se').up(distanceFromY - ARC_RADIUS*2).arc('wn').addTo(this);
		distanceFromY += Math.max(ARC_RADIUS, item.down + VERTICAL_SEPARATION + (i == last ? 0 : this.items[i+1].up));
	}

	return this;
}

function Optional(item, skip) {
	if( skip === undefined )
		return Choice(1, Skip(), item);
	else if ( skip === "skip" )
		return Choice(0, Skip(), item);
	else
		throw "Unknown value for Optional()'s 'skip' argument.";
}

function OneOrMore(item, rep) {
	if(!(this instanceof OneOrMore)) return new OneOrMore(item, rep);
	FakeSVG.call(this, 'g');
	rep = rep || (new Skip);
	this.item = wrapString(item);
	this.rep = wrapString(rep);
	this.width = Math.max(this.item.width, this.rep.width) + ARC_RADIUS*2;
	this.up = this.item.up;
	this.down = Math.max(ARC_RADIUS*2, this.item.down + VERTICAL_SEPARATION + this.rep.up + this.rep.down);
}
subclassOf(OneOrMore, FakeSVG);
OneOrMore.prototype.needsSpace = true;
OneOrMore.prototype.format = function(x,y,width) {
	// Hook up the two sides if this is narrower than its stated width.
	var diff = width - this.width;
	Path(x,y).h(diff/2).addTo(this);
	Path(x+diff/2+this.width,y).h(diff/2).addTo(this);
	x += diff/2;

	// Draw item
	Path(x,y).right(ARC_RADIUS).addTo(this);
	this.item.format(x+ARC_RADIUS,y,this.width-ARC_RADIUS*2).addTo(this);
	Path(x+this.width-ARC_RADIUS,y).right(ARC_RADIUS).addTo(this);

	// Draw repeat arc
	var distanceFromY = Math.max(ARC_RADIUS*2, this.item.down+VERTICAL_SEPARATION+this.rep.up);
	Path(x+ARC_RADIUS,y).arc('nw').down(distanceFromY-ARC_RADIUS*2).arc('ws').addTo(this);
	this.rep.format(x+ARC_RADIUS, y+distanceFromY, this.width - ARC_RADIUS*2).addTo(this);
	Path(x+this.width-ARC_RADIUS, y+distanceFromY).arc('se').up(distanceFromY-ARC_RADIUS*2).arc('en').addTo(this);

	return this;
}

function ZeroOrMore(item, rep, skip) {
	return Optional(OneOrMore(item, rep), skip);
}

function Start() {
	if(!(this instanceof Start)) return new Start();
	FakeSVG.call(this, 'path');
	this.width = 20;
	this.up = 10;
	this.down = 10;
}
subclassOf(Start, FakeSVG);
Start.prototype.format = function(x,y) {
	this.attrs.d = 'M '+x+' '+(y-10)+' v 20 m 10 -20 v 20 m -10 -10 h 20.5';
	return this;
}

function End() {
	if(!(this instanceof End)) return new End();
	FakeSVG.call(this, 'path');
	this.width = 20;
	this.up = 10;
	this.down = 10;
}
subclassOf(End, FakeSVG);
End.prototype.format = function(x,y) {
	this.attrs.d = 'M '+x+' '+y+' h 20 m -10 -10 v 20 m 10 -20 v 20';
	return this;
}

function Terminal(text) {
	if(!(this instanceof Terminal)) return new Terminal(text);
	FakeSVG.call(this, 'g');
	this.text = text;
	this.width = text.length * 8 + 20; /* Assume that each char is .5em, and that the em is 16px */
	this.up = 11;
	this.down = 11;
}
subclassOf(Terminal, FakeSVG);
Terminal.prototype.needsSpace = true;
Terminal.prototype.format = function(x, y, width) {
	var diff = width - this.width;
	Path(x,y).right(width).addTo(this);
	FakeSVG('rect', {x:x+diff/2, y:y-11, width:this.width, height:this.up+this.down, rx:10, ry:10}).addTo(this);
	FakeSVG('text', {x:x+width/2, y:y+4}, this.text).addTo(this);
	return this;
}

function NonTerminal(text) {
	if(!(this instanceof NonTerminal)) return new NonTerminal(text);
	FakeSVG.call(this, 'g');
	this.text = text;
	this.width = text.length * 8 + 20;
	this.up = 11;
	this.down = 11;
}
subclassOf(NonTerminal, FakeSVG);
NonTerminal.prototype.needsSpace = true;
NonTerminal.prototype.format = function(x, y, width) {
	var diff = width - this.width;
	Path(x,y).right(width).addTo(this);
	FakeSVG('rect', {x:x+diff/2, y:y-11, width:this.width, height:this.up+this.down}).addTo(this);
	FakeSVG('text', {x:x+width/2, y:y+4}, this.text).addTo(this);
	return this;
}

function Comment(text) {
	if(!(this instanceof Comment)) return new Comment(text);
	FakeSVG.call(this, 'g');
	this.text = text;
	this.width = text.length * 7 + 10;
	this.up = 11;
	this.down = 11;
}
subclassOf(Comment, FakeSVG);
Comment.prototype.needsSpace = true;
Comment.prototype.format = function(x, y, width) {
	var diff = width - this.width;
	Path(x,y).right(diff/2).addTo(this);
	Path(x+diff/2+this.width,y).right(diff/2).addTo(this)
	FakeSVG('text', {x:x+width/2, y:y+5, class:'comment'}, this.text).addTo(this);
	return this;
}

function Skip() {
	if(!(this instanceof Skip)) return new Skip();
	FakeSVG.call(this, 'g');
	this.width = 0;
	this.up = 0;
	this.down = 0;
}
subclassOf(Skip, FakeSVG);
Skip.prototype.format = function(x, y, width) {
	Path(x,y).right(width).addTo(this);
	return this;
}
