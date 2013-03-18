// Print csv codepage table with literals
// e.g. 
// $ node print-literals.js ../codepages/U+0000-U+007F-basic_latin.csv
// $ node print-literals.js ../codepages/U+3400-U+4DBF-cjk_unified_ideographs_extension_a.csv

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

// Return array of string values, or NULL if CSV string not well formed.
function CSVtoArray(text) {
    var re_valid = /^\s*(?:'[^'\\]*(?:\\[\S\s][^'\\]*)*'|"[^"\\]*(?:\\[\S\s][^"\\]*)*"|[^,'"\s\\]*(?:\s+[^,'"\s\\]+)*)\s*(?:,\s*(?:'[^'\\]*(?:\\[\S\s][^'\\]*)*'|"[^"\\]*(?:\\[\S\s][^"\\]*)*"|[^,'"\s\\]*(?:\s+[^,'"\s\\]+)*)\s*)*$/;
    var re_value = /(?!\s*$)\s*(?:'([^'\\]*(?:\\[\S\s][^'\\]*)*)'|"([^"\\]*(?:\\[\S\s][^"\\]*)*)"|([^,'"\s\\]*(?:\s+[^,'"\s\\]+)*))\s*(?:,|$)/g;
    // Return NULL if input string is not well formed CSV string.
    if (!re_valid.test(text)) return null;
    var a = [];                     // Initialize array to receive values.
    text.replace(re_value, // "Walk" the string using replace with callback.
        function(m0, m1, m2, m3) {
            // Remove backslash from \' in single quoted values.
            if      (m1 !== undefined) a.push(m1.replace(/\\'/g, "'"));
            // Remove backslash from \" in double quoted values.
            else if (m2 !== undefined) a.push(m2.replace(/\\"/g, '"'));
            else if (m3 !== undefined) a.push(m3);
            return ''; // Return empty string.
        });
    // Handle special case of empty last value.
    if (/,\s*$/.test(text)) a.push('');
    return a;
};

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
      var row                     = CSVtoArray( trimmedLine );
      var codePoint               = row[0].trim();
      var utf8Hex                 = row[1].trim();
      var description             = row[2].trim();
      var descriptionWithLiterals = unquote_string( description );
      var utf8                    = unquote_string( utf8Hex );
      var literal                 = decode_utf8( utf8 );

      console.log( '"' + codePoint + '", "' + utf8Hex + '", "' + literal + '", "' + descriptionWithLiterals + '"' );
    }
  }
});
