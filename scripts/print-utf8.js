// convert file with <codepoint, description> to <codepoint, utf8, description>

var filePath = process.argv[2];
var fs       = require('fs');

function decode_utf8( s ) {
  return decodeURIComponent( escape( s ) );
}

function encode_utf8( s ) {
  return unescape( encodeURIComponent( s ) );
}

function quote_string( s ) {
  return '"' + s + '"';
}

function unquote_string( s ) {
  return eval( '"' + s + '"' );
}

function hex_encode( s ) {
  var r   = '';
  var len = s.length;
  var i;
  for (i= 0;i<len;i++) {
    r += '\\x' + s.charCodeAt(i).toString(16).substr(-2);
  }
  return r;
}

fs.readFile( filePath, function (err, data) {
	var lines     = data.toString().split('\n');
	var lineCount = lines.length;
	var i;
  for (i=0;i<lineCount;i++) {
		var line         = lines[i];
    var commentStart = line.indexOf('#');
    var strippedLine = ( commentStart >= 0 ) ? line.slice(0,commentStart) : line;
    var trimmedLine  = strippedLine.trim();
		if ( trimmedLine.length > 0 ) {
			var fields      = trimmedLine.split(',');
      var codePoint   = fields[0].trim();
      var description = fields[1].trim();
			var utf16       = codePoint.replace(/U\+/i,'\\u');
			var literal     = unquote_string( utf16 );
			var utf8        = encode_utf8( literal );
			var utf8_hex    = hex_encode( utf8 );

			console.log( codePoint + ', ' + utf8_hex + ', ' + description );
		}
	}
});
