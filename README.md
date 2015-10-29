# Ramda (Extended)
Extend Ramda with extra capabilities, including Ember.js support.

## Overview
This package **extends** Ramda by importing Ramda, adding functions to the R namespace, and re-exporting the modified R object.
That means that you do not need to install Ramda separately.


## Using in the browser

**NOTE** This does not include the rsvp namespace.
`<script src="bower_components/ramda-extended/dist/browser-compatible/ramda-extended.js">`

or 

`<script src="bower_components/ramda-extended/dist/browser-compatible/ramda-extended.min.js">`



## Using in Node

This uses RSVP for the promise-enabled functions to be consistent with Ember.RSVP.
I don't really like bundling RSVP in the package like this, but idk how to get around it yet. Any ideas?

`npm install --save`

`var R = require('ramda-extended')`


## Using with Ember.js
This is a work in progress. When using the `ember/ramda-extended.js` version,
the regular R functions like `prop` and `pluck` are re-implemented to use Emberjs getters and setters.

**WARNING: Not all functions have been modified to be Emberjs compatible.** When in doubt,
check `src/ramda-ember.js` to see if a function has been implemented. If you need a Ramda function
that has not been ported yet, then please submit a pull request! 

`bower install --save ramda-extended`

```
// Add to ember-cli-build.js or Brocfile.js

app.import(app.bowerDirectory + '/ramda-extended/dist/ember/ramda-extended.js')
```

Ember-compatible mode also adds some new namespaces, namely `rsvp` and `Ember`. These add additional
functions that may only be used in an Ember context. 

They get their own namespace so as to not conflict with regular Ramda functions, since their
behavior is Ember-specific.
