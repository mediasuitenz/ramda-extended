#!/usr/bin/env bash

SRC="src"
DIST="dist"
EMBER="$DIST/ember"
NODE="$DIST/node"

FNAME="ramda-extended.js"
FNAME_MIN="ramda-extended.min.js"

[ -d "$DIST" ] && rm -rf "$DIST"

mkdir "$DIST"
mkdir "$EMBER"
mkdir "$NODE"

cp "$SRC/base.js" "$DIST/$FNAME"
uglifyjs "$DIST/$FNAME" --mangle --keepfnames > "$DIST/$FNAME_MIN"

browserify "$SRC/ember-compatible.js" -s R > "$EMBER/$FNAME"
uglifyjs "$EMBER/$FNAME" --mangle --keepfnames > "$EMBER/$FNAME_MIN"

browserify "$SRC/node-compatible.js" -s R > "$NODE/$FNAME"
uglifyjs "$NODE/$FNAME" --mangle --keepfnames > "$NODE/$FNAME_MIN"
