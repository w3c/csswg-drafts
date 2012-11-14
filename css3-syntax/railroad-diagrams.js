// Display constants
var VERTICAL_SEPARATION = 8;
var ARC_RADIUS = 10;
var DIAGRAM_CLASS = 'railroad-diagram';
var TRANSLATE_HALF_PIXEL = true;


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

function Path(x,y) {
	if(!(this instanceof Path)) return new Path(x,y);
	this.str = "M"+x+' '+y;
}
Path.prototype.m = function(x,y) {
	this.str += 'm'+x+' '+y;
	return this;
}
Path.prototype.h = function(val) {
	this.str += 'h'+val;
	return this;
}
Path.prototype.right = Path.prototype.h;
Path.prototype.left = function(val) { return this.h(-val); }
Path.prototype.v = function(val) {
	this.str += 'v'+val;
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
	this.str += "a"+ARC_RADIUS+" "+ARC_RADIUS+" 0 0 "+cw+' '+x+' '+y;
	return this;
}
Path.prototype.toSVG = function() {
	return SVG('path', {d:this.str+'h.5'});
}
Path.prototype.addTo = function(container) {
	container.appendChild(this.toSVG());
	return container;
}

function unnull(/* children */) {
	return [].slice.call(arguments).reduce(function(sofar, x) { return sofar !== undefined ? sofar : x; });
}


function wrapString(value) {
    return ((typeof value) == 'string') ? new Terminal(value) : value;
}

function wrapStringArray(value) {
    for (var i = 0; i < value.length; i++) {
        if ((typeof value[i]) == 'string') {
            value[i] = new Terminal(value[i]);
        }
    }
    return value;
}

function Diagram(children) {
	if(!(this instanceof Diagram)) return new Diagram([].slice.call(arguments));
	this.children = wrapStringArray(children);
	this.children.unshift(new Start);
	this.children.push(new End);
	this.width = this.children.reduce(function(sofar, el) { return sofar + el.width + (el.needsSpace?20:0)}, 0)+1;
	this.up = this.children.reduce(function(sofar,el) { return Math.max(sofar, el.up)}, 0);
	this.down = this.children.reduce(function(sofar,el) { return Math.max(sofar, el.down)}, 0);
}
Diagram.prototype.toSVG = function(paddingt, paddingr, paddingb, paddingl) {
	paddingt = unnull(paddingt, 20);
	paddingr = unnull(paddingt, 20);
	paddingb = unnull(paddingt, 20);
	paddingl = unnull(paddingr, 20);
	var x = paddingl;
	var y = paddingt;
	y += this.up;
	var g = SVG('g', TRANSLATE_HALF_PIXEL ? {transform:'translate(.5 .5)'} : {});
	for(var i = 0; i < this.children.length; i++) {
		var child = this.children[i];
		if(child.needsSpace) {
			Path(x,y).h(10).addTo(g);
			x += 10;
		}
		g.appendChild(child.toSVG(x, y, child.width));
		x += child.width;
		if(child.needsSpace) {
			Path(x,y).h(10).addTo(g);
			x += 10;
		}
	}
	var svg = SVG('svg',{width:this.width+paddingl+paddingr, height:this.up+this.down+paddingt+paddingb, class:DIAGRAM_CLASS});
	svg.appendChild(g);
	return svg;
}
Diagram.prototype.addTo = function(el) {
	el = el || document.body;
	return el.appendChild(this.toSVG());
}

function Sequence(children) {
	if(!(this instanceof Sequence)) return new Sequence([].slice.call(arguments));
	this.children = wrapStringArray(children);
	this.width = this.children.reduce(function(sofar, el) { return sofar + el.width + (el.needsSpace?20:0)}, 0);
	this.up = this.children.reduce(function(sofar,el) { return Math.max(sofar, el.up)}, 0);
	this.down = this.children.reduce(function(sofar,el) { return Math.max(sofar, el.down)}, 0);
}
Sequence.prototype.toSVG = function(x,y,width) {
	var diff = width - this.width;
	var g = SVG('g');
	Path(x,y).h(diff/2).addTo(g);
	x += diff/2;
	for(var i = 0; i < this.children.length; i++) {
		var child = this.children[i];
		if(child.needsSpace) {
			Path(x,y).h(10).addTo(g);
			x += 10;
		}
		g.appendChild(child.toSVG(x, y, child.width));
		x += child.width;
		if(child.needsSpace) {
			Path(x,y).h(10).addTo(g);
			x += 10;
		}
	}
	Path(x,y).h(diff/2).addTo(g);
	return g;
}

function Choice(normal, children) {
	if(!(this instanceof Choice)) return new Choice(normal, [].slice.call(arguments,1));
	this.normal = normal;
	this.children = wrapStringArray(children);
	this.width = this.children.reduce(function(sofar, el){return Math.max(sofar, el.width)},0) + ARC_RADIUS*4;
	this.up = this.down = 0;
	for(var i = 0; i < children.length; i++) {
		var child = children[i];
		if(i < normal) { this.up += Math.max(ARC_RADIUS,child.up + child.down + VERTICAL_SEPARATION); }
		if(i == normal) { this.up += Math.max(ARC_RADIUS, child.up); this.down += Math.max(ARC_RADIUS, child.down); }
		if(i > normal) { this.down += Math.max(ARC_RADIUS,VERTICAL_SEPARATION + child.up + child.down); }
	}
}
Choice.prototype.toSVG = function(x,y,width) {
	var g = SVG('g');

	var last = this.children.length -1;
	var innerWidth = this.width - ARC_RADIUS*4;

	// Hook up the two sides if this is narrower than its stated width.
	var diff = width - this.width;
	Path(x,y).h(diff/2).addTo(g);
	Path(x+diff/2+this.width,y).h(diff/2).addTo(g);
	x += diff/2;

	// Do the elements that curve above
	for(var i = this.normal - 1; i >= 0; i--) {
		var child = this.children[i];
		if( i == this.normal - 1 ) {
			var distanceFromY = Math.max(ARC_RADIUS*2, this.children[i+1].up + VERTICAL_SEPARATION + child.down);
		}
		Path(x,y).arc('se').up(distanceFromY - ARC_RADIUS*2).arc('wn').addTo(g);
		g.appendChild(child.toSVG(x+ARC_RADIUS*2,y - distanceFromY,innerWidth));
		Path(x+ARC_RADIUS*2+innerWidth, y-distanceFromY).arc('ne').down(distanceFromY - ARC_RADIUS*2).arc('ws').addTo(g);
		distanceFromY += Math.max(ARC_RADIUS, child.up + VERTICAL_SEPARATION + (i == 0 ? 0 : this.children[i-1].down));
	}

	// Do the straight-line path.
	Path(x,y).right(ARC_RADIUS*2).addTo(g);
	g.appendChild(this.children[this.normal].toSVG(x+ARC_RADIUS*2, y, innerWidth));
	Path(x+ARC_RADIUS*2+innerWidth, y).right(ARC_RADIUS*2).addTo(g);

	// Do the elements that curve below
	for(var i = this.normal+1; i <= last; i++) {
		var child = this.children[i];
		if( i == this.normal + 1 ) {
			var distanceFromY = Math.max(ARC_RADIUS*2, this.children[i-1].down + VERTICAL_SEPARATION + child.up);
		}
		Path(x,y).arc('ne').down(distanceFromY - ARC_RADIUS*2).arc('ws').addTo(g);
		g.appendChild(child.toSVG(x+ARC_RADIUS*2, y+distanceFromY, innerWidth));
		Path(x+ARC_RADIUS*2+innerWidth, y+distanceFromY).arc('se').up(distanceFromY - ARC_RADIUS*2).arc('wn').addTo(g);
		distanceFromY += Math.max(ARC_RADIUS, child.down + VERTICAL_SEPARATION + (i == last ? 0 : this.children[i+1].up));
	}

	return g;
}

function Optional(child) {
	return Choice(1, Skip(), child);
}

function OneOrMore(child, rep) {
	if(!(this instanceof OneOrMore)) return new OneOrMore(child, rep);
	rep = rep || (new Skip);
	this.child = child = wrapString(child);
	this.rep = rep = wrapString(rep);
	this.width = Math.max(child.width, rep.width) + ARC_RADIUS*2;
	this.up = child.up;
	this.down = Math.max(ARC_RADIUS*2, child.down + VERTICAL_SEPARATION + rep.up + rep.down);
}
OneOrMore.prototype.needsSpace = true;
OneOrMore.prototype.toSVG = function(x,y,width) {
	var g = SVG('g');

	// Hook up the two sides if this is narrower than its stated width.
	var diff = width - this.width;
	Path(x,y).h(diff/2).addTo(g);
	Path(x+diff/2+this.width,y).h(diff/2).addTo(g);
	x += diff/2;

	// Draw child
	Path(x,y).right(ARC_RADIUS).addTo(g);
	g.appendChild(this.child.toSVG(x+ARC_RADIUS,y,this.width-ARC_RADIUS*2));
	Path(x+this.width-ARC_RADIUS,y).right(ARC_RADIUS).addTo(g);

	// Draw repeat arc
	var distanceFromY = Math.max(ARC_RADIUS*2, this.child.down+VERTICAL_SEPARATION+this.rep.up);
	Path(x+ARC_RADIUS,y).arc('nw').down(distanceFromY-ARC_RADIUS*2).arc('ws').addTo(g);
	g.appendChild(this.rep.toSVG(x+ARC_RADIUS, y+distanceFromY, this.width - ARC_RADIUS*2));
	Path(x+this.width-ARC_RADIUS, y+distanceFromY).arc('se').up(distanceFromY-ARC_RADIUS*2).arc('en').addTo(g);

	return g;
}

function ZeroOrMore(child, rep) {
	return Optional(OneOrMore(child, rep));
}
ZeroOrMore.prototype = Object.create(OneOrMore.prototype);


function Start() {
	if(!(this instanceof Start)) return new Start();
	this.width = 20;
	this.up = 10;
	this.down = 10;
}
Start.prototype.toSVG = function(x,y) {
	return SVG('path', {d: 'M '+x+' '+(y-10)+' v 20 m 10 -20 v 20 m -10 -10 h 20.5'});
}

function End() {
	if(!(this instanceof End)) return new End();
	this.width = 20;
	this.up = 10;
	this.down = 10;
}
End.prototype.toSVG = function(x,y) {
	return SVG('path', {d: 'M '+x+' '+y+' h 20 m -10 -10 v 20 m 10 -20 v 20'});
}

function Terminal(text) {
	if(!(this instanceof Terminal)) return new Terminal(text);
	this.text = text;
	this.width = text.length * 8 + 20; /* Assume that each char is .5em, and that the em is 16px */
	this.up = 11;
	this.down = 11;
}
Terminal.prototype.needsSpace = true;
Terminal.prototype.toSVG = function(x, y, width) {
	var g = SVG('g');
	var diff = width - this.width;
	Path(x,y).right(width).addTo(g);
	g.appendChild(SVG('rect', {x:x+diff/2, y:y-11, width:this.width, height:this.up+this.down, rx:10, ry:10}));
	g.appendChild(SVG('text', {x:x+width/2, y:y+4}, this.text));
	return g;
}

function NonTerminal(text) {
	if(!(this instanceof NonTerminal)) return new NonTerminal(text);
	this.text = text;
	this.width = text.length * 8 + 20;
	this.up = 11;
	this.down = 11;
}
NonTerminal.prototype.needsSpace = true;
NonTerminal.prototype.toSVG = function(x, y, width) {
	var g = SVG('g');
	var diff = width - this.width;
	Path(x,y).right(width).addTo(g);
	g.appendChild(SVG('rect', {x:x+diff/2, y:y-11, width:this.width, height:this.up+this.down}));
	g.appendChild(SVG('text', {x:x+width/2, y:y+4}, this.text));
	return g;
}

function Comment(text) {
	if(!(this instanceof Comment)) return new Comment(text);
	this.text = text;
	this.width = text.length * 7 + 10;
	this.up = 11;
	this.down = 11;
}
Comment.prototype.needsSpace = true;
Comment.prototype.toSVG = function(x, y, width) {
	var g = SVG('g');
	var diff = width - this.width;
	Path(x,y).right(diff/2).addTo(g);
	Path(x+diff/2+this.width,y).right(diff/2).addTo(g)
	g.appendChild(SVG('text', {x:x+width/2, y:y+5, class:'comment'}, this.text));
	return g;
}

function Skip() {
	if(!(this instanceof Skip)) return new Skip();
	this.width = 0;
	this.up = 0;
	this.down = 0;
}
Skip.prototype.toSVG = function(x, y, width) {
	return Path(x,y).right(width).addTo(SVG('g'));
}
