/**
 * A collection of utilities
 */

;(function (root, factory) {
  if (typeof exports === 'object') {
    module.exports = factory(require('ramda'));
  } else if (typeof define === 'function' && define.amd) {
    define(['ramda'], factory);
  } else {
    root.R = factory(root.R);
  }

}(this, function ramdaExtended (R) {

  // @sig a -> Boolean
  R.isUndefined = function (x) {return typeof x === 'undefined'};
  R.isNotUndefined = R.complement(R.isUndefined);
  R.isNotEmpty = R.complement(R.isEmpty);
  R.isNotNil = R.complement(R.isNil);
  R.isEmptyObj = R.compose(R.isEmpty, Object.keys);
  R.isNotEmptyObj = R.complement(R.isEmptyObj);
  R.isNilOrEmpty = R.anyPass([R.isNil, R.isEmpty]);
  R.isNotNilOrEmpty = R.complement(R.isNilOrEmpty);
  R.isNilOrEmptyObj = R.anyPass([R.isNil, R.isEmptyObj]);
  R.isNotNilOrEmptyObj = R.complement(R.isNilOrEmptyObj);

  // @sig {k: v} -> {k: v} -> {k: v}
  R.mergeRight = R.flip(R.merge);

  R.toArray = R.invoker(0, 'toArray');
  R.toJSON = R.invoker(0, 'toJSON');
  R.toNumber = Number;
  R.toString = String;

  // @sig a -> (a -> b) -> b
  R.applyTo = R.curryN(2, function (obj, fn) { return fn(obj) });
  // @sig a -> [(a -> b)] -> [b]
  R.rmap = R.curryN(2, function rmap (obj, fns) {
    return R.map(R.applyTo(obj), fns)
  });
  // @sig [(a -> b)] -> a -> [b]
  R.juxt = R.flip(R.rmap);

  // @sig a -> a
  R.effect = R.curryN(2, function effect (fn, x) {
    fn(x);
    return x
  });

  // @sig a -> a
  R.log = R.effect(function (val) {console.log(val)});
  // @sig (a -> b) -> a -> a
  R.logWith = function (fn) {
    return R.effect(function (val) {console.log(fn(val))});
  };
  // @sig String -> (a -> a)
  R.trace = function (msg) {
    return R.effect(function (val) {console.log(msg, val)});
  };
  // @sig String -> (a -> b) -> (a -> a)
  R.traceWith = function (msg, fn) {
    return R.effect(function (val) {console.log(msg, fn(val))});
  };

  return R
}));
