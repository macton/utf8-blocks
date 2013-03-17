# utf8-blocks

Each Unicode block with unicode code point, utf8 encoding and description
See also: <http://en.wikipedia.org/wiki/Unicode#Standardized_subsets>

## Format

Files is line based. Empty lines should be ignored.
Anything after a `# is a comment

Lines are divided into three comma-separated fields:
1. Unicode code point ("U+XXXX")
2. UTF-8 value, formated in javascript-style hex bytes ("\xXX\xXX")
3. Description
