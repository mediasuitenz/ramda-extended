#!/usr/bin/env bash

SRC="src"
DIST="dist"

FNAME="ramda-extended.js"
FNAME_MIN="ramda-extended.min.js"

[ -d "$DIST" ] && rm -rf "$DIST"

mkdir "$DIST"

browserify "$SRC/$FNAME" -s R > "$DIST/$FNAME"
uglifyjs "$DIST/$FNAME" --mangle --keepfnames > "$DIST/$FNAME_MIN"
