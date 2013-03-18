// Scrape descriptions from fileformat.info
// See: http://www.fileformat.info/info/unicode/block/index.htm
// Replacing previous data collected. This is a more complete source.
// This script is only here for archival purposes. Not maintained.
// If you run this script yourself, expect it to:
//     (a) take a stupidly long time
//     (b) not provide a lot of feedback when ridiculously slow transforms are being done.

var kTextInfo    = '\033[94m';
var kTextSuccess = '\033[92m';
var kTextWarning = '\033[93m';
var kTextError   = '\033[91m';
var kTextReset   = '\033[0m';
var kRetryCount  = 10;

var request = require('request');
var jsdom   = require('jsdom');
var fs      = require('fs');

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
    r += '\\x' + ( '00' + s.charCodeAt(i).toString(16) ).substr(-2);
  }
  return r;
}

function ascii_encode_unicode( s ) {
  function is_ascii_printable( code ) {
    return (code >= 32) && (code < 127);
  };
  function unicode_escape( code ) {
    return '\\u' + ('0000' + code.toString(16).toUpperCase()).substr(-4);
  }

  var len    = s.length;
  var result = '';
  var i;

  for (i=0;i<len;i++) {
    var code = s.charCodeAt(i);
    var ch   = is_ascii_printable(code)?s[i]:unicode_escape(code);
    result += ch;
  }
  return result;
}

function is_valid_code_point( codePoint ) {
  try {
    var unicodeString  = codePoint.replace(/U\+/,'\\u');
    var unicodeLiteral = unquote_string( unicodeString );
    var utf8Literal    = encode_utf8( unicodeLiteral );
    return true;
  } catch(err) {
    return false;
  }
}

function getSource( pageName, pageUri, pageStart, pageEnd, retryCount ) {
  if ( !is_valid_code_point( pageStart )  ) {
    console.log( kTextInfo + 'SKIP ' + pageUri + ' does not start at valid code point.' + kTextReset );
    return;
  }
  request({ uri:pageUri }, function (error, response, body) {
    var statusCode = ( response && response.statusCode ) ? response.statusCode : '<NORESPONSE>';
    if (error && statusCode !== 200) {
      if ( retryCount == kRetryCount ) {   
        console.log( kTextError + 'ERROR: Failed ' + statusCode + ' retreiving ' + pageUri + kTextReset );
      } else {
        console.log( kTextWarning + 'WARNING: Retrying due to ' + statusCode + ' retreiving ' + pageUri + kTextReset );
        getSource( pageName, pageUri, pageStart, pageEnd, retryCount+1 );
      }
      return;
    }
          
    jsdom.env({
      html: body,
      scripts: [
        'http://code.jquery.com/jquery-1.5.min.js'
      ]
      }, function (err, window) {
        if ( err ) {
          if ( retryCount == kRetryCount ) {
            console.log( kTextError + 'ERROR: Failed to parse ' + pageUri + ' ' + JSON.stringify(err) + kTextReset );
          } else {
            console.log( kTextWarning + 'WARNING: Retrying ' + pageUri + ' due to ' + JSON.stringify(err) + kTextReset );
            getSource( pageName, pageUri, pageStart, pageEnd, retryCount+1 );
          }
          return;
        }
        var $       = window.jQuery;
        var title   = $('h1').text();
        var csvName = pageStart + '-' + pageEnd + '-' + pageName + '.csv';
        var stream  = fs.createWriteStream( csvName );

        stream.once('open', function(fd) {
          if ( retryCount > 0 ) {
            console.log( kTextInfo + 'Retrieved ' + pageUri + ' (' + csvName + ') retryCount=' + retryCount + kTextReset );
          } else {
            console.log( 'Retrieved ' + pageUri + ' (' + csvName + ')' );
          }
          stream.write( '# ' + title + '\n' );
          stream.write( '# Source: ' + pageUri + '\n' );
          $('table tr').each( function( row_ndx, row_value ) { 
            var td          = $(row_value).find('td');
            var codePoint   = $(td[0]).text().trim();
            var description = ascii_encode_unicode( $(td[1]).text().trim() );

            if ( codePoint.length > 0 ) {
              var utf16       = codePoint.replace(/U\+/i,'\\u');
              var literal     = unquote_string( utf16 );
              var utf8        = encode_utf8( literal );
              var utf8_hex    = hex_encode( utf8 );

              stream.write( '"' + codePoint + '"' + ', "' + utf8_hex + '", "' + description + '"\n' );
            }               
          });
          stream.end();
        });
    });
  });
}

var codePageIndexUri = 'http://www.fileformat.info/info/unicode/block/index.htm';
request({ uri:codePageIndexUri }, function (error, response, body) {
  var statusCode = ( response && response.statusCode ) ? response.statusCode : '<NORESPONSE>';
  if (error && statusCode !== 200) {
    console.log( kTextError + 'ERROR: ' + statusCode + ' retreiving ' + pageUri + kTextReset );
    return;
  }
  console.log('Retrieved page index.');
        
  jsdom.env({
    html: body,
    scripts: [
      'http://code.jquery.com/jquery-1.5.min.js'
    ]
    }, function (err, window) {
      var $      = window.jQuery;
      var pages  = $($('h2')[1]).next().find('a');

      console.log( pages.length + ' pages.' );
      pages.each( function( ndx, value ) { 
        var href       = $(value).attr('href'); 
        var components = href.split('/'); 
        var name       = components[0]; 
        var parent     = $(value).closest('td'); 
        var start      = parent.next(); 
        var end        = start.next(); 
        getSource( name, 'http://www.fileformat.info/info/unicode/block/' + name + '/list.htm', start.text(), end.text(), 0 );
      }); 
    });
});
