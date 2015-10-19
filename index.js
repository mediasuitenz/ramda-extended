/**
 * A collection of utilities
 */

;
(function () {

  'use strict';

  var Re = {};

  // @sig a -> Boolean
  Re.isNotEmpty = R.complement(R.isEmpty);
  Re.isNotNil = R.complement(R.isNil);
  Re.isEmptyObj = R.compose(R.isEmpty, Object.keys);
  Re.isNotEmptyObj = R.complement(Re.isEmptyObj);
  Re.isNilOrEmpty = R.anyPass([R.isNil, R.isEmpty]);
  Re.isNotNilOrEmpty = R.complement(Re.isNilOrEmpty);
  Re.isNilOrEmptyObj = R.anyPass([R.isNil, Re.isEmptyObj]);
  Re.isNotNilOrEmptyObj = R.complement(Re.isNilOrEmptyObj);

  // @sig {k: v} -> {k: v} -> {k: v}
  Re.mergeRight = R.flip(R.merge);

  Re.toArray = R.invoker(0, 'toArray');
  Re.toNumber = x => Number(x);
  Re.toString = x => Number(x);

  // @sig a -> (a -> b) -> b
  Re.applyTo = R.curryN(2, (obj, fn) => fn(obj));
  // @sig a -> [(a -> b)] -> [b]
  Re.rmap = R.curryN(2, function rmap (obj, fns) {
    return R.map(Re.applyTo(obj), fns)
  });
  // @sig [(a -> b)] -> a -> [b]
  Re.juxt = R.flip(Re.rmap);

  // @sig a -> a
  Re.effect = R.curryN(2, function effect (fn, x) {
    fn(x);
    return x
  });

  // @sig String -> (a -> a)
  Re.trace = (msg) => Re.effect(val => console.log(msg, val));
  // @sig String -> (a -> b) -> (a -> a)
  Re.traceWith = (msg, fn) => Re.effect(val => console.log(msg, fn(val)));
  Re.log = Re.trace;
  Re.logWith = Re.traceWith;


  /**
   * rsvp is a collection promise-enabled control flow functions
   */
  var rsvp = {};
  Re.rsvp = rsvp;

  rsvp.compose = R.composeP;
  rsvp.pipe = R.pipeP;

  // @sig [(a -> b)] -> a -> [b]
  rsvp.parallel = R.curryN(2, function parallel (fns, x) {
    return rsvp.all(Re.juxt(fns))(x)
  });

  /**
   * Identical to rsvp.parallel, except that instead of a list,
   * you pass an object with the functions as the keys
   *
   * @func
   * @sig {k: (a -> b)} -> a -> Promise({k: b})
   * @param {Object} transformations The object specifying transformation functions to invoke in parallel
   * @param {Object} object The object to be transformed
   * @returns {Ember.RSVP.hash} The results of invoking the transformations with the object
   *
   */
  rsvp.parallelHash = R.curryN(2, function parallelHash (transformations, object) {
    return R.compose(
      Ember.RSVP.hash,
      R.mapObj(fn => fn(object))
    )(transformations)
  });

  // Wraps the result of calling fn in Ember.RSVP.all
  rsvp.all = R.curryN(1, function all (fn) {
    return R.compose(
      Ember.RSVP.all,
      fn
    )
  });

  // Wraps the result of calling fn in Ember.RSVP.hash
  rsvp.hash = R.curryN(1, function hash (fn) {
    return R.compose(
      Ember.RSVP.hash,
      fn
    )
  });

  // @sig (a -> b) -> [a] -> Promise([b])
  rsvp.map = R.curryN(2, function map (fn, list) {
    return rsvp.all(R.map(fn))(list)
  });

  /**
   * A version of fo;ter that works with composeP
   * @sig (* -> *) -> * -> Ember.RSVP.all([*])
   * @function
   * @param {Function} fn a function to apply to all items in list
   * @param {Array} list an array or items to apply the function to
   */
  rsvp.filter = R.curryN(2, function filter (fn, list) {
    return rsvp.all(R.filter(fn))(list)
  });

  /**
   * Applies fn to x, then returns x.
   * Because the results of fn are not returned, only the side effects of fn are relevant.
   * @sig (a -> b) -> a -> b
   * @param {Function} fn
   * @param {*} x
   * @returns {Ember.RSVP.Promise} Resolves to x
   */
  rsvp.effect = R.curryN(2, function effect (fn, x) {
    return fn(x).then(R.always(x))
  });

  /* Ember-specific functions */
  if (Ember) {
    var E = {};
    Re.E = E;
    Re.Ember = E;

    /* Re-implement Ramda functions to work with Ember getters/setters*/
    // @sig k -> Object -> v
    E.prop = R.flip(Ember.get);
    E.get = E.prop;

    // @sig k -> [Object] -> [v]
    E.pluck = R.curryN(2, function pluck (p, list) {
      return R.map(E.get(p), list);
    });

    // @sig (a -> Boolean) -> String -> {String: a} -> Boolean
    E.propSatisfies = R.curryN(3, function propSatisfies (pred, name, obj) {
      return pred(Ember.get(obj, name))
    });

    // @sig String -> a -> Object -> Boolean
    E.propEq = R.curryN(3, function propEq (name, val, obj) {
      return E.propSatisfies(R.equals(val), name, obj)
    });

    // @sig String -> Object -> Object -> Boolean
    E.eqProps = R.curryN(3, function eqProps (prop, obj1, obj2) {
      return R.equals(E.get(prop, obj1), E.get(prop, obj2))
    });

    /* Custom Ember methods */

    // @sig DS.Model -> Ember.RSVP.Promise
    E.save = R.invoker(0, 'save');
    // @sig DS.Model -> DS.Model
    E.clone = R.invoker(0, 'clone');
    // @sig a -> * -> a
    E.setProperties = R.flip(Ember.setProperties);
    // @sig String -> * -> a -> a
    E.set = R.curryN(3, function set (keyName, value, object) {
      Ember.set(object, keyName, value);
      return object
    });

    // @sig a -> b -> Promise(b)
    E.linkRelated = R.curryN(2, function linkRelated (parent, related) {
      return rsvp.effect(b => parent.linkRelated(b), related)
    });
    // @sig a -> [b] -> PromiseArray([b])
    E.linkManyRelated = R.curryN(2, function linkManyRelated (theOne, theMany) {
      return rsvp.map(E.linkRelated(theOne), theMany)
    });

    // @sig String -> a -> b -> Promise(b)
    E.linkCustomRelated = R.curryN(3, function linkCustomRelated (relatedName, a, b) {
      return rsvp.effect(b => a.linkRelated(b, relatedName), b)
    });

    // @sig String -> a -> PromiseArray([b])
    E.findAllRelated = R.curryN(2, function findAllRelated (relatedModelName, model) {
      return model.get('store').findAllRelated(model, relatedModelName);
    })
  }

  if (typeof exports === 'object') {
    module.exports = Re;
  } else if (typeof define === 'function' && define.amd) {
    define(function () { return Re; });
  } else {
    this.Re = Re;
  }

}.call(this));
