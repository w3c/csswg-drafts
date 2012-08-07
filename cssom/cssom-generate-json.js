
(function() {
    var sys = require("util");
    var fs = require("fs");
    var parser = require("WebIDLParser.js").Parser;
    var input = '';
    var $ = {
        ondata : function(d) {
            input += d;
        },
        onend : function() {
            sys.puts ( JSON.stringify ( parser.parse ( input ), false, null ) );
        },
        onerror : function(e) {
            sys.puts ( sys.inspect ( e ) );
        },
        run : function(argv) {
            try {
                if ( argv.length > 2 ) {
                    fs.readFile ( argv [ argv.length - 1 ], 'utf-8',
                        function(e,d) {
                            if ( ! e ) {
                                input = d; setTimeout ( $.onend, 0 );
                            } else {
                                setTimeout ( $.onerror, 0, e );
                            }
                        }
                    );
                } else {
                    var s = process.stdin;
                    s.on ( 'data', $.ondata );
                    s.on ( 'end', $.onend );
                    s.on ( 'error', $.onerror );
                    s.setEncoding ( 'utf-8' );
                    s.resume();
                }
            } catch ( e ) {
                setTimeout ( $.onerror, 0, e );
            }
        }
    };
    $.run ( process.argv );
})();