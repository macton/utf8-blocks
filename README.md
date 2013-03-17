# utf8-blocks

Each Unicode block with unicode code point, utf8 encoding and description
See also: <http://en.wikipedia.org/wiki/Unicode#Standardized_subsets>

## Format
Files are ASCII formatted and line based. 

* Comment lines begin with #
* Empty lines should be ignored (although there are none I'm aware of)
* UNIX-style line endings ("\n")
* Non ASCII text in description formated with javascript-style unicode escape ("\uXXXX")

Lines are divided into three comma-separated fields:

1. Unicode code point ("U+XXXX")
2. UTF-8 value, formated as one to four javascript-style hex bytes ("\xXX\xXX")
3. Description

Example:

    "U+002D", "\x2d", "HYPHEN-MINUS (U+002D)"

Example with unicode escape in description block:

    "U+341C", "\xe3\x90\x9c", "(same as \u4EC7) an enemy, enmity, hatred, to hate, a rival, a match (U+341C)"

