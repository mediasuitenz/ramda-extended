/**
 * A collection of utilities
 */

(function () {
  var root = this;
  var R = require('./base');
  var RSVP = require('rsvp')
  R.rsvp = require('./rsvp')(R, RSVP);

  if (typeof exports === 'object') {
    module.exports = R;
  } else if (typeof define === 'function' && define.amd) {
    define(function () { return R; });
  } else {
    root.R = R;
  }

}.call(this));
