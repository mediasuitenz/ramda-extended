#!/usr/bin/env bash

SRC="src"
DIST="dist"
EMBER="$DIST/emberjs-compatible"
BROWSER="$DIST/browser-compatible"

FNAME="ramda-extended.js"
FNAME_MIN="ramda-extended.min.js"

[ ! -d "$DIST" ] && mkdir "$DIST"
[ ! -d "$EMBER" ] && mkdir "$EMBER"
[ ! -d "$BROWSER" ] && mkdir "$BROWSER"

cp "$SRC/$FNAME" "$DIST/$FNAME"
uglifyjs "$DIST/$FNAME" --mangle --keepfnames > "$DIST/$FNAME_MIN"

browserify "$SRC/$FNAME" -s R > "$BROWSER/$FNAME"
uglifyjs "$BROWSER/$FNAME" --mangle --keepfnames > "$BROWSER/$FNAME_MIN"

browserify "$SRC/ramda-ember.js" -s R > "$EMBER/$FNAME"
uglifyjs "$EMBER/$FNAME" --mangle --keepfnames > "$EMBER/$FNAME_MIN"
