#!/usr/bin/env bash

if [ ! -d "dist" ]
then
 mkdir "dist"
fi

browserify src/index.js -s R > dist/ramda-extensions.js
uglifyjs dist/ramda-extensions.js --mangle --keepfnames > dist/ramda-extensions.min.js
