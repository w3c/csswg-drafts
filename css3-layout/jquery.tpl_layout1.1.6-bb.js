/*
 * CSS Template Layout Module Implementation <http://code.google.com/p/css-template-layout/>
 * Version: 1.1.6-bb (2010-08-09)
 * Copyright: 2010, Alexis Deveria <http://a.deveria.com/>
 * License: GNU General Public License, Free Software Foundation
 *          <http://creativecommons.org/licenses/GPL/2.0/>
 */


/*
Known bugs:
	- Template widths are not used if total of row widths is smaller
	- min/max-width/heights for elements is not supported
	- template content should flow in first slot if not @ is found

Changelog

V1.01

   * Replaced .css() notation for width and height with shorter notations
   * Improved the way multiple elements per slot appear

V1.1

   * Fixed margin/border/padding behavior
   * Changed slot behavior to match spec text rather than examples
   * Limited ::slot() values to allowed values
   * Support for ::slot() vertical-align "middle" and "bottom" added
   * Support for ::slot() overflow hidden/visible added
   * Proper support far ::slot() background properties
   * Support for template background in combination with slot backgrounds

V1.1.1

   * Added support for comma-seperated selectors
   * Fixed background positioning for body templates.
   * Added support for setting template display/position properties using jQuery().css()
   
V1.1.2

   * Added/fixed support for width/height set in CSS for elements in a slot
   * Allow fallback class to be set, to hide fallback CSS rules
   * Improved display property parsing, corrected handling of incorrect width values
   * Added support for spaces between minmax() values
   * Added $.templateLayoutShowOnReady to hide the non-template rendering.
   * Added support for sub-templates with same letters

V1.1.3

   * Fixed IE bugs

V1.1.4

   * Made body appear visible on native support
   * Fixed vertical positioning for multiple elements with margins
   
V1.1.5

   * Fixed Bug where first given column width would be ignored

V1.1.6

   * Fixed jQuery 1.4/IE8 bug

V1.1.6-bb

   * Now using grid/flow properties instead of display/position
     (By Bert Bos <bert@w3.org>, 20 March 2012)

*/


(function($) {

	var css_data, prefix = '';
	var templates;
	var same_els = [];
	var cur_tpl_sel;
	var delay = 0;
	var page_hidden = false;
	var rules = [];
	
	// Set Template grid/flow values using jQuery
    var proxied = jQuery.fn.css;
    jQuery.fn.css = function(key, value) {

		var disp_prop = prefix + 'grid';
		var pos_prop = prefix + 'flow';
       	var disp = false, pos = false;
    
        if(value) {
        	if(key == disp_prop && value.indexOf('"') != -1) {
        		disp = true;
        	} else if(key == pos_prop && value.length == 1) {
        		pos = true;
        	} else {
				return proxied.apply(this, arguments);
        	}
        	
			var jq_el = this;

			//Change "grid" value			

			var cur_sel;
			
			
			$.each(templates,function(sel,tpl) {
				if(disp) {
					if(jq_el.is(sel)) { cur_sel = sel; }
				} else {
					$.each(tpl.chars,function(chr,chr_data) {
						if(jq_el.is(chr_data.selector)) {
							cur_sel = chr_data.selector;
						}
					});
				}
			});

			$.each(rules,function(i,rule) {
				if(rule.selector == cur_sel) {
				
					if(disp) {
						rule.properties[disp_prop] = value;
					} else if(pos) {
						rule.properties[pos_prop] = value;
					}
				}
			});

			getTemplateData(rules);
			setLayout();
			
        } else {
        
	        return proxied.apply(this, arguments);
	    }
    };
	
	$.templateLayoutShowOnReady = function() {
		document.write('<style> body {visibility:hidden} </style>');
		page_hidden = true;
	}
	
	$.setTemplateLayout = function(given_data, given_pre) {

		// Do nothing if native support is found
		if(hasNativeSupport()) {
			showPage();
			return false;
		}
		
		// Redo layout on resize
		setTimeout(function() {
			$(window).resize(setLayout);
		},100);
		
		if(typeof given_data == 'string') {
			given_data = {file:given_data};
		}
		
		if(given_pre) {
			given_data.prefix = given_pre;
		}
		
		// Set prefix if given
		if(given_data) {
			if(given_data.prefix) {
				prefix = '-' + given_data.prefix + '-';
			}
			
			if(given_data.delay) {
				delay = given_data.delay;
			}
			
			if(given_data.fallback) {
				$('.' + given_data.fallback).remove();
			}
		}
		
		if(!given_data) {
			setLayoutFromTag();
		} else {
			css_data = '';
			
			if(given_data.text) {
				css_data = given_data.text;	
				$('head').append('<style>' + css_data + '</style>');
			}
			
			if(given_data.file) {
				$.get(given_data.file,function(str) {
					css_data += str;		
					setLayout();
				});
			} 

			if(!given_data.file && !css_data) {
				setLayoutFromTag();
				return false;
			}

			if(css_data) setLayout();
		}
	};
	
	$.redoTemplateLayout = setLayout;
	
	function showPage() {
		if(page_hidden) {
			$('body').css('visibility','visible');
			page_hidden = false;
		}
	}
	
	function setLayoutFromTag() {
		var st_el = $('style');
		if(!st_el.length) return;
		
		if(st_el.text()) {
			css_data = st_el.text();
			setLayout();
		} else {
			// Get raw HTML page as string and get CSS using regexp
			$.get(document.location.href,function(html_page) {
				var style_match = html_page.match(/<style.*?>([\s\S]*?)<\/style>/);
				css_data = style_match?style_match[1]:'';

				setLayout();
			});
		}
	}

	// Returns the CSS data as an array with objects
	function getCSSRules() {
	
		// Remove commented out stuff
		css_data = css_data.replace(/\/\*[\s\S]*?\*\//g,'');
	
		var bits = css_data.split('}');
		
		$.each(bits,function() {
			var rule = $.trim(this);
			
			if(!rule) return;
			
			var rule_data = parseRule(rule);
			
			if(!rule_data) return;
				
			if(rule_data.selector.indexOf(',') != -1) {
				// Multiple selectors
				var selectors = rule_data.selector.split(',');
				$.each(selectors, function(i,sel) {
					rules.push({
						'selector':		$.trim(sel),
						'properties':	rule_data.properties
					});
				});
				
			} else {
				// One selector
				rules.push(rule_data);
			}

		});
		
		return rules;
	}
	
	// Returns CSS selectors and properties
	function parseRule(rule) {
	
		if(rule.indexOf('*') === 0 || rule.indexOf('{') == -1) {
			return false;
		}

		var rule_parts = rule.split('{');
	
		var sel = $.trim(rule_parts[0]);
	
		var prop_text = rule_parts[1].split(';');
		var props = {};
		
		$.each(prop_text,function() {
			var prop_parts = this.split(':');
			var name = $.trim(prop_parts[0]).toLowerCase(); // lowercase for IE
			var value = $.trim(prop_parts[1]);
			props[name] = value;
		});
		
		return {
			'selector':sel,
			'properties':props
		};
	}
	
	function getTemplateDisplay(display_val) {
		// Remove newlines
		var str = display_val.replace(/\n|\r/g,' ');
		
		var d_parts = str.split('"');
		
		var rows = [];
		var widths = [];
		var unique_chars = {};

		// Loop through even numbers
		for(var i = 2, l = d_parts.length; i < l; i+=2) {
			
			var part = d_parts[i];
			
			var height = 'auto';
			
			if(part.indexOf('/') != -1) {
				// Has a row height
				var val_parts = part.match(/\/\s*(\S+)(.*)/);
				
				height = $.trim(val_parts[1]);
				
			} 
			
			if($.trim(part) && i == l-1) {
			
				var last = $.trim(d_parts[l-1]).replace(/^\/\s*\S+\s*/,'');
			
				if(last && last.indexOf('/') == -1) {
					if(last.indexOf('(') != -1) {
						// Deal with minmax pars
						var pars = last.match(/minmax(\(.*?\))/g);
						
						$.each(pars,function(i,p_set) {
							var clean_p = p_set.replace(/\s*/g,'');
							last = last.replace(p_set,clean_p);
						});
					}
				
					last = last.replace(/\(\)/,'');
				
					widths = last.split(/\s+/);
				}
			}
			
			var chars = d_parts[i-1].replace(/[^a-z*\.]/gi,'');
			
			chars = $.trim(chars).split('');
			
			// Get unique characters
			$.each(chars,function() {
				unique_chars[this] = true;
			});
			
			// Do not allow negative row heights
			if(height.indexOf('-') == 0) {
				return false;
			}
			
			rows.push({
				'chars':chars,
				'height':height
			});
		}
		
		var col_width = rows[0].chars.length;
		
		// too many widths, cut last off
		while(widths.length > col_width) {
			widths.pop();
		}
		
		// too few, add '*'
		while(widths.length < col_width) {
			widths.push('*');
		}

		return {
			'rows':rows,
			'widths':widths,
			'chars':unique_chars
		}
		
	}
	

	function getTemplateData(rules) {

		var tpl_positions = {};
		var pseudo_props = {};
		var tpl_num = 0;
		
		var tmp_templates = [];
		
		$.each(rules,function(r,rule) {
			var props = rule.properties;
			var selector = rule.selector;
			var disp_prop = prefix + 'grid';
			var pos_prop = prefix + 'flow';
	
			var slotEl = false;
	
			//Look for ::slot() pseudo-class
			if(selector.indexOf('::slot(') != -1) {
				var matches = selector.match(/slot\((.)\)/);
	
				if(matches && matches.length > 1) {
					var p_char = matches[1];
					var selector_start = selector.split('::slot')[0];
					
					var allowed_props = {};
					$.each(props,function(name,val) {
						if(name.indexOf('background') == 0
						|| name.indexOf('overflow') != -1
						|| name.indexOf('vertical-align') != -1) {
							allowed_props[name] = val;
						}
					});
					
					pseudo_props[selector_start + '|' + p_char] = allowed_props;
				}
			}
	
			//Look for Layout "flow" property
			if(props[pos_prop] && props[pos_prop].length == 1) {
				var chr = props[pos_prop];
			
				tpl_positions[selector] = {
					'chr':chr,
					'props':props
				}

				slotEl = true;
			} else if(props[pos_prop] == 'same') {
				same_els.push(selector);
			}
	
			//Look for Layout "grid" property
			if(props[disp_prop] && props[disp_prop].indexOf('"') != -1) {
			
				var tpl_display = getTemplateDisplay(props[disp_prop]);
				
				if(!tpl_display) return;
			
				// Store template data
				tmp_templates.push({
					'sel':selector,
					'rows':tpl_display.rows,
					'widths':tpl_display.widths,
					'chars':tpl_display.chars,
					'properties':props,
					'pseudo_props':{},
					'num':tpl_num,
					'slotEl':slotEl
				});

				tpl_num++;
			}
		});
		
		// Re-order to process parent templates first
		tmp_templates.sort(function(a,b) { return !b.slotEl; });
		
		$.each(tmp_templates,function(i,tpl) {
			templates[tpl.sel] = tpl;
		});
	
		$.each(tpl_positions,function(p_sel,pos) {
			var min_distance = false;
			var cur_sel = false;
			
			$.each(templates,function(t_sel,tpl) {
				// Check if template includes this character and has it as a child
				if(t_sel == p_sel) {
					tpl_positions[t_sel].tplEl = true;
				}
				
				if(!tpl.chars[pos.chr]) return;
				
				var parents = $(p_sel).parents();
				
				if(parents.is(t_sel)) {
					// Calculate closeness
				
					var distance;
					var i = 0;
					parents.each(function() {
						if(parents[i] == $(t_sel)[0]) {
							distance = i;
						}
						i++;
					});
					
					// Get first template or nearest one
					if(min_distance === false || distance < min_distance) {
						min_distance = distance;
						cur_sel = t_sel;
					}
					
				}
			});
			
			var tplEl = pos.tplEl || false;
			
			if(cur_sel) {
			
				var pseudo_id = cur_sel + '|' + pos.chr;
			
				var p_props = pseudo_props[pseudo_id] || false;
			
				templates[cur_sel].chars[pos.chr] = {
					'selector':p_sel,
					'props':pos.props,
					'pseudo_props':p_props,
					'tplEl':tplEl,
					'cur_sel':cur_sel
				};
			}
		});
		
	}
	
	// Check if browser has native support for template layout
	function hasNativeSupport() {
// 		var test_val = '"*"';
// 		var test_el = $('<p></p>');
// 		var supported = true;
// 		try {
// 		test_el.get(0).style.grid = test_val;
// 		} catch(err) {
// 			supported = false;
// 		}

// 		supported = (test_el.css('grid') == test_val);
// 		test_el.remove();
// 		return supported;
		return false;
	}
	
	// Template Constructor
	function Template(tpl,tpl_sel) {
		
		var given_widths = tpl.widths;
		var rows = tpl.rows;
		var tpl_props = tpl.properties;

		var widths = [], heights = [];
		var tpl_el = $(tpl_sel);
		var slots = tpl.chars;
		
		$.each(slots,function(chr,slot) {
			if(slot !== true) {
				slot.slot_w = 1;
				slot.slot_h = 1;
			}
		});
		
		
		tpl.margins = 0;
		
		// Get the width of a 'min/max-content' column
		function getContentWidth(col_num, type) {
			var cell_widths = [];
	
			$.each(slots,function(chr,slot) {
				
				var width = slot.props.width || 'auto';
			

				if(slot.col == col_num && slot.slot_w == 1) {
					//Get content width from this element
					
					var cur_w = getDivDims({
						'width':width,
						'top':'auto',
						'left':'auto'
					},slot.el.clone()).w;
					
					cell_widths.push(cur_w);
				}
			});
			
			var calc = type.split('-')[0];

			// Get min-content or max-content value
			return Math[calc].apply({}, cell_widths);
		}
		
		// Get width and height based on given style/content
		function getDivDims(given_css, content) {
			var testDiv = $('<div><\/div>');
			testDiv.css({
				'visibility':'hidden',
				'margin':0,
				'padding':0,
				'position':'absolute'
			});
			
			if(content) {
			
				testDiv.append(content);
			}
			if(given_css) {
				testDiv.css(given_css);
			}
			
			tpl_el.append(testDiv);
			
			var info = {
				w:testDiv.width(),
				h:testDiv.height()
			}
			
			testDiv.remove();
			
			return info;
		}
		
		// Get width or height of an element in pixels
		function getPixelData(type,size,col_num) {
			var width = 'auto', height = 'auto';
			if(type == 'h') {
				height = size;
			} else {
				width = size;
				
				if(width == 'min-content' || width == 'max-content') {
					return getContentWidth(col_num, width);
				}
			}
			
			var dims = getDivDims({
				'height':height,
				'width':width
			});
			
			return dims[type];
		}
		
		function getHeight(slot) {
			var total_h = 0;
			
			for(var i = slot.row; i < slot.slot_h+slot.row && i < heights.length;i++) {
				total_h += heights[i];
			}
			
			//Change based on negative top margin
			var t_margin = parseInt(slot.el.css('margin-top'));

			if(t_margin < 0) {
				total_h -= t_margin;
			}
			
			return total_h;
		}
		
		function getElSize(type,chr,cur_size) {
			var css_val = slots[chr].props[type]+'';
			var new_size = css_val;
			
			if(css_val.indexOf('%') != -1 && type == 'width') {
				new_size = cur_size * parseInt(css_val)/100;
			} 
			
			return new_size;
		}
		
		// Get the pixel width of a given slot
		function getWidth(slot) {
			var total_w = 0;
			
			for(var i = slot.col; i < slot.slot_w+slot.col;i++) {
				total_w += widths[i];
			}

			//Change based on margin
		
			var cur_border = slot.el.outerWidth(true) - slot.el.width();
			if(cur_border) {

				total_w -= cur_border;
			}
			

			
			if(slot.tplEl) {
			
				// Give width/height to sub-template if given
				if(rows[slot.row].height && rows[slot.row].height != '*') {
					templates[slot.selector].properties.height = rows[slot.row].height;
				}
		
				templates[slot.selector].properties.width = total_w;

				var newTpl = new Template(templates[slot.selector], slot.selector);
				var sub_tpl = newTpl.make();
				slot.genHeight = sub_tpl.height;
				return sub_tpl.width;
			}
			
			return total_w;
		}
		
		// Get total height of multiple elements
		function getMultiHeight(el) {
			
			var btop = el.css('border-top-width');
			
			
			var clone = el.clone();
		
			clone.each(function() {
				$(this).css('position','static');
			});
			
			return getDivDims(0,clone).h;
		
		}
		
		// Calculate row heights
		function calcRowHeights() {

// 			if(tpl.slotEl && slots['*']) {
			if(tpl.slotEl) {
				// Is template as well as slot, get height if exists
				tpl_props.height = tpl_el.height();
			}
			
			//Set template height to 100% or the given height
			if(tpl_props.height) {
			
				tpl_el.height(tpl_props.height);
				var tot_height = tpl_el.height();
				
			} else {
				var tpl_height = 0;
			}
			
			var flex_rows = 0;
			
			var min_heights = [];
		
			$.each(rows,function(row_num,row) {
				var max_h = 0;

				$.each(slots,function(chr,slot) {
			
					if(slot.row == row_num) { //  && slot.slot_h == 1
						
						if(slot.props.height) {
							slot.el.height(slot.props.height);
						} else {
							slot.el.height('auto');
						}

						if(!min_heights[row_num]) {
							min_heights[row_num] = 0;
						}
						
						var cur_h;
						
						// If slot is a template, get its generated height
						if(slot.genHeight) {
							cur_h = slot.genHeight;
						} else if(slot.slot_h == 1) {
							cur_h = getMultiHeight(slot.el);
						} else {
							var part_h = getMultiHeight(slot.el)/slot.slot_h;
							
							for(var i = row_num; i<slot.slot_h; i++) {
								min_heights[i] = part_h;
							}
							
						}
						
						if(max_h < min_heights[row_num]) {
							max_h = min_heights[row_num];
						}

						if(max_h < cur_h) {
							max_h = cur_h;
						}
					}
				});
				
				if(tpl_props.height && tpl_props.height != 'auto') {
					// Any "auto" / * rows should be distributed
					flex_rows++;
					max_h = 0;
				} else if(row.height != '*' && row.height != 'auto') {
					max_h = getPixelData('h',row.height);
				}
				
				heights[row_num] = max_h;
				tpl_height += max_h;
			});
			
			if(flex_rows) {
				var flex_height = tot_height/flex_rows;
				
				$.each(rows,function(row_num,row) {
					if(row.height == '*' || row.height == 'auto') {
						heights[row_num] = flex_height;
					} 
				});
			} else {
				tpl_el.height(tpl_height);
			}
			
		}
		
		
		function calcColWidths() {
		
			var px_width = 0;
			var flex_cols = 0;
	
			if(tpl.slotEl) {
				tpl_el.width(tpl_el.width());
			}
	
			//Set template width to 100% or the given width
			tpl_el.width(tpl_props.width || '100%');
	
			var tot_width = tpl_el.width();
			
			widths = [];
			var new_tot = 0;
			
			$.each(given_widths,function(i,w) {
				if(w == 'fit-content') {
					w = given_widths[i] = 'minmax(min-content,max-content)';
				}
			
				if(w == '*' || w == 'auto') {
					flex_cols++;
					px_width = 0;
				} else if(w.indexOf('minmax') === 0) {
					//Calc min/max
					var minmax = w.match(/\((.*?),(.*?)\)/);
					var min = minmax[1];
					var max = minmax[2];
					
					px_width = getPixelData('w',max,i);
					tot_width -= px_width;
				} else {
					px_width = getPixelData('w',w,i);
					tot_width -= px_width;
				}
				
				widths.push(px_width);
				new_tot += px_width;
			});
			
			if(tot_width < 0) {
				$.each(given_widths,function(i,w) {
					if(w.indexOf('minmax') != -1) {
						var minmax = w.match(/\((.*?),(.*?)\)/);
						var min = minmax[1];
						var max = minmax[2];
						
						min_pixels = getPixelData('w',min,i);
					
						widths[i] += tot_width;
						tot_width = 0;
						
						if(widths[i] < min_pixels) {
							widths[i] = min_pixels;
						}
					} 
				});
			}
			
			var flex_width = tot_width/flex_cols;
			
			$.each(given_widths,function(i,w) {
				if(w == '*' || w == 'auto') {
					widths[i] = flex_width;
				} 
			});
		}
		
		function getTop(slot, offset) {
			var total_h = offset || 0;
			var row_num = slot.row;
			
			if(slots['*'] && !slot.isHolder) {
				total_h = -1*getPixelData('h',tpl_el.css('top'));
			}
			
			$.each(heights,function(i) {
				if(i < row_num) {
					total_h += this;
				}
			});
			
			return total_h;
		}
		
		function getLeft(slot) {
			var col_num = slot.col;
			var total_w = 0;
			
			if(slots['*'] && !slot.isHolder) {
				total_w = -1*getPixelData('w',tpl_el.css('left'));
			}
			
			$.each(widths,function(i) {
				if(i < col_num) {
					total_w += this;
				}
			});
			
			return total_w;
		}
		
		function setSames(slot) {
			// Loop through "same" elements
			$.each(same_els,function(a,el_sel) {
			
				var same_el = $(el_sel);
			
				// Loop through "same" element collection
				same_el.each(function() {
					var cur_el = $(this);
					
					var new_group = false;

					// Make a new element collection including "same" elements if it's the same as the slot element
					slot.el.each(function() {
						var cslot_el = $(this);
						
						if(!new_group) {
							new_group = cslot_el;
						} else {
							new_group[new_group.length++] = cslot_el[0];
						}
						
						if(cslot_el.next()[0] == cur_el[0]) {
							new_group[new_group.length++] = cur_el[0];
						}
						
					});
				
					if(new_group.length > 1) {
						slot.el = new_group;
						slot.multi = true;					
					}
					
				});

			});
		}
		
		function setBackground() {
		
			var set_bg = false;
			var bg_props = {};
			
			if(tpl_el.is('body')) {
				return;
			}
			
			$.each(tpl_props,function(name,val) {
			
				if(name.indexOf('background') === 0) {
					set_bg = true;
					bg_props[name] = val;
				}
			});

			if(!set_bg) return;
		
			var id = 'jq_tpl_bg-' + tpl.num;
			var off = tpl_el.offset();			
			var tpl_bg = $('#'+id);
			
			if(!tpl_bg.length) {
				tpl_bg = $('<div id="'+id+'"></div>');
								
				tpl_bg.css(bg_props);
			}
			
			tpl_bg.css({
				'z-index':	-2,
				position: 'absolute',
				top:	off.top,
				left:	off.left,
				width:	tpl_el.width(),
				height:	tpl_el.height()
			});
			
			$('body').append(tpl_bg);
		}
		
		function makePseudoSlot(chr,slot) {
			// Set pseudo-slot properties if found
			if(slot.pseudo_props) {
				var doc_offset = slot.el.offset();
				var id = 'jq_tpl' + tpl.num + '_slot-' + chr;
				var p_slot = $('#'+id);
				var p_props = slot.pseudo_props;
				
				if(!p_slot.length) {
					
					// Create if not existant
					p_slot = $('<div id="' + id + '"></div>');
					$('body').append(p_slot)
				} 
				
				var slot_w = slot.el.outerWidth(true);
				var slot_h = getHeight(slot);
				
				p_slot.css({
					display:	'block',
					position:	'absolute',
					'z-index':	(tpl.num-10),
					top:		doc_offset.top,
					left:		doc_offset.left,
					width:		slot_w,
					height:		slot_h
				});
				
				// Fix left offset when body is template and has left margin
				if($('body').is(tpl_sel)) {
				
					if(!tpl.margins) {
						var p = $('<p style="position:static;margin:0;display:block;visibility:hidden;"></p>');
						tpl_el.append(p);
						tpl.margins = p.offset();
						tpl.margins.left -= parseFloat(tpl_el.css('padding-left'));
						tpl.margins.top -= parseFloat(tpl_el.css('padding-top'));
						p.remove();
					}

					p_slot.css('left',doc_offset.left - tpl.margins.left);
					p_slot.css('top',doc_offset.top - tpl.margins.top);
				}
				
				
				
				p_slot.css(p_props);
				
				if(p_props['vertical-align']) {
					var more_top = 0;
					var align = p_props['vertical-align'];
					
					switch ( align ) {
						case 'middle':
							
							more_top = slot_h/2 - slot.el.height()/2;;
							break;
						
						case 'bottom':
							more_top = slot_h - slot.el.height();
							break;
							
						case 'baseline':
						
							// Not correct
							more_top = slot_h - slot.el.height();
							break;
							
						default:
							break;
					} 
					
					slot.el.css('top', getTop(slot) + more_top);
				}
			}
		}
			
		function makeSlots() {
		
			// Get element position info
			$.each(rows,function(i,row) {
				
				$.each(row.chars,function(j,chr) {
					
					// Skip if whitespace block
					if(chr == '.') {
						return;
					}
					
					if(chr == '*') {
						slots['*'] = {
							'selector':tpl_sel,
							isHolder:true
						}
					}
					
					var slot = slots[chr];

					slot.el = $(slot.selector);
					
					// Set slot width based on last char
					if(j > 0 && row.chars[j-1] == chr) {
						if(slot.slot_h == 1) {
							slot.slot_w++;
						}
					}
	
					// Set slot height based on last char
					if(i > 0 && rows[i-1].chars[j] == chr) {
						slot.slot_h++;
					}
					
					// Set row/col value only for first occurance
					if(isNaN(slot.row)) slot.row = i;
					
					if(isNaN(slot.col)) slot.col = j;
					
					// Check if element is child of template
					if(!slot.el.parents().is(tpl_sel) && !slot.el.is(tpl_sel)) {
						// Not a child, remove slot!
						delete slot;
						return;
					}
					
					if(slot.el.length > 1) {
						slot.multi = true;
					}

					setSames(slot);
				});

			});
			
			delete slots['.'];

		}
		
		this.make = function() {

			tpl_el.css('position','relative');
			
			makeSlots();
			
			calcColWidths();
	
			if(slots['*']) {
				// Do holder slot first
				slots['*'].el.css('left',getLeft(slots['*']));
			}
	
			$.each(slots,function(chr,slot) {
				var el = slot.el;
	
				var elWidth = getWidth(slot);
				
				if(slot.props.width) {
					elWidth = getElSize('width',chr,elWidth);
				}
	
				el.css({
					'display': 'block',
					'position': 'absolute',
					'width': elWidth
				});
				
				el.css('left',getLeft(slot));
				
			});
	
			calcRowHeights();
			
			if(slots['*']) {
				// Do holder slot first
				slots['*'].el.css('top',getTop(slots['*']));
			}
			
			// Set heights & tops
			$.each(slots,function(chr,slot) {
				
				if(slot.tplEl) {
					templates[slot.selector].genTop = getTop(slot);
				}
				
				
				var slotTop = getTop(slot);
				var slotHeight = getHeight(slot);
				var newTop = slotTop;

				var hide_overflow = false;				
				if(slot.pseudo_props) {
					if(slot.pseudo_props.overflow == 'hidden') {
						hide_overflow = true;
					}
				}

				slot.el.each(function(i) {
					if(i > 0) {
						newTop += slot.el.eq(i-1).outerHeight(true);
					} 
					
					$(this).css('top',newTop);
					
					// Check for percentage height
					if(slot.props.height) {
						slotHeight = getElSize('height',chr,slotHeight);
						$(this).height(slotHeight);
					}
					
					if(hide_overflow) {
						var lastHeight = slotHeight - newTop + slotTop;
						var full_overflow = (newTop - slotTop > slotHeight);
						var part_overflow = (slot.el.height() + newTop - slotTop > slotHeight);
						
						if(full_overflow || part_overflow) {
							$(this).height( full_overflow?0:lastHeight );
							$(this).css('overflow','hidden');
						}
					}

				});
				
				if(slot.tplEl) {
					slot.el.height(getHeight(slot));
				}
				
				makePseudoSlot(chr,slot);
				
			});
			
			setBackground();
			
			if(tpl.genTop && slots['*']) {
				slots['*'].el.css('top',getTop(slots['*'],tpl.genTop));
			}
			
			return {
				'height':tpl_el.height(),
				'width':tpl_el.width()
			};
		}

	}
	
	function makeTemplate(tpl_sel,tpl) {

		var t = new Template(tpl,tpl_sel);
		t.make();
	}
	
	function setLayout() {
		
		// Create templates if not done already
		if(!templates) {
			templates = {};
			rules = getCSSRules();
			var tpl_positions = {};

			getTemplateData(rules);
		} 
		
		setTimeout(function() {
			$.each(templates,makeTemplate);
			showPage();
		},delay);
		
		delay = 0;
	}

})(jQuery);
