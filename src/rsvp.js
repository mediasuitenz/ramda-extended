/**
 * rsvp is a collection promise-enabled control flow functions
 */
;(function () {

  /**
   * @param R
   * @param {RSVP} RSVP
   * @param {RSVP.hash} RSVP.hash
   * @param {RSVP.all} RSVP.all
   */
  function rsvp (R, RSVP) {
    const hash = RSVP.hash;
    const all = RSVP.all;

    var rsvp = {};

    rsvp.compose = R.composeP;
    rsvp.pipe = R.pipeP;

    // @sig [(a -> b)] -> a -> [b]
    rsvp.parallel = R.curryN(2, function parallel (fns, x) {
      return rsvp.all(R.juxt(fns))(x)
    });

    /**
     * Identical to rsvp.parallel, except that instead of a list,
     * you pass an object with the functions as the keys
     *
     * @func
     * @sig {k: (a -> b)} -> a -> Promise({k: b})
     * @param {Object} transformations The object specifying transformation functions to invoke in parallel
     * @param {Object} object The object to be transformed
     * @returns {hash} The results of invoking the transformations with the object
     *
     */
    rsvp.parallelHash = R.curryN(2, function parallelHash (transformations, object) {
      return R.compose(
          hash,
          R.mapObj(function (fn) {return fn(object)})
      )(transformations)
    });

    // Wraps the result of calling fn in RSVP.all
    rsvp.all = R.curryN(1, function rsvpAll (fn) {
      return R.compose(
          all,
          fn
      )
    });

    // Wraps the result of calling fn in hash
    rsvp.hash = R.curryN(1, function rsvpHash (fn) {
      return R.compose(
          hash,
          fn
      )
    });

    // @sig (a -> b) -> [a] -> Promise([b])
    rsvp.map = R.curryN(2, function rsvpMap (fn, list) {
      return rsvp.all(R.map(fn))(list)
    });

    /**
     * A version of fo;ter that works with composeP
     * @sig (* -> *) -> * -> RSVP.all([*])
     * @function
     * @param {Function} fn a function to apply to all items in list
     * @param {Array} list an array or items to apply the function to
     */
    rsvp.filter = R.curryN(2, function rsvpFilter (fn, list) {
      return rsvp.all(R.filter(fn))(list)
    });

    /**
     * Applies fn to x, then returns x.
     * Because the results of fn are not returned, only the side effects of fn are relevant.
     * @sig (a -> b) -> a -> b
     * @param {Function} fn
     * @param {*} x
     * @returns {RSVP.Promise} Resolves to x
     */
    rsvp.effect = R.curryN(2, function rsvpEffect (fn, x) {
      return fn(x).then(R.always(x))
    });

    return rsvp;
  }

  if (typeof exports === 'object') {
    module.exports = rsvp;
  } else if (typeof define === 'function' && define.amd) {
    define(function () { return rsvp; });
  } else {
    throw new Error('This rsvp library may not be imported directly.')
  }
}.call(this));
