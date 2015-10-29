/**
 * A collection of utilities
 */

(function () {
  var root = this;
  var R = require('./ramda-extended');

  /**
   * rsvp is a collection promise-enabled control flow functions
   */

  var rsvp = {};
  R.rsvp = rsvp;

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
   * @returns {Ember.RSVP.hash} The results of invoking the transformations with the object
   *
   */
  rsvp.parallelHash = R.curryN(2, function parallelHash (transformations, object) {
    return R.compose(
        Ember.RSVP.hash,
        R.mapObj(function (fn) {return fn(object)})
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
  //}

  ///* Ember-specific functions */
  //if (Ember) {
  //var E = {};
  //R.E = E;
  //R.Ember = E;

  /* Re-implement Ramda functions to work with Ember getters/setters*/
  // @sig k -> Object -> v
  R.prop = R.flip(Ember.get);

  R.propOr = R.curryN(3, function propOr (val, p, obj) {
    if (R.isNilOrEmptyObj(obj)) return val;
    var result = R.prop(p, obj);
    return R.isUndefined(result) ? val : result;
  })

  // @sig [k] -> {k: v} -> [v]
  R.props = R.curryN(2, function props (props, obj) {
    return R.compose(
        R.rmap(obj),
        R.map(R.prop)
    )(props)
  });

  // @sig k -> [Object] -> [v]
  R.pluck = R.curryN(2, function pluck (p, list) {
    return R.map(R.prop(p), list);
  });

  // @sig (a -> Boolean) -> String -> {String: a} -> Boolean
  R.propSatisfies = R.curryN(3, function propSatisfies (pred, name, obj) {
    return pred(Ember.get(obj, name))
  });

  // @sig String -> a -> Object -> Boolean
  R.propEq = R.curryN(3, function propEq (name, val, obj) {
    return R.propSatisfies(R.equals(val), name, obj)
  });

  // @sig String -> Object -> Object -> Boolean
  R.eqProps = R.curryN(3, function eqProps (prop, obj1, obj2) {
    return R.equals(R.prop(prop, obj1), R.prop(prop, obj2))
  });

  /* Custom Ember methods, aka "ramda-ember"*/
  var Re = {};
  R.E = Re;
  R.Ember = Re;

  // @sig DS.Model -> Promise(DS.Model)
  Re.save = R.invoker(0, 'save');
  // @sig [DS.Model] -> Promise([DS.Model])
  Re.saveAll = rsvp.all(R.map(Re.save))

  // @sig k -> Object -> v
  Re.get = R.prop;
  // @sig [k] -> Object -> {k: v}
  Re.getProperties = R.flip(Ember.getProperties);

  // @sig String -> * -> a -> a
  Re.set = R.curryN(3, function set (keyName, value, object) {
    Ember.set(object, keyName, value);
    return object
  });
  // @sig a -> * -> a
  Re.setProperties = R.flip(Ember.setProperties);

  // @sig a -> b -> Promise(b)
  Re.linkRelated = R.curryN(2, function linkRelated (parent, related) {
    return rsvp.effect(function (b) {return parent.linkRelated(b)}, related)
  });
  // @sig a -> [b] -> PromiseArray([b])
  Re.linkManyRelated = R.curryN(2, function linkManyRelated (theOne, theMany) {
    return rsvp.map(Re.linkRelated(theOne), theMany)
  });

  // @sig String -> a -> b -> Promise(b)
  Re.linkCustomRelated = R.curryN(3, function linkCustomRelated (relatedName, a, b) {
    return rsvp.effect(function (b) {return a.linkRelated(b, relatedName)}, b)
  });

  // @sig String -> a -> PromiseArray([b])
  Re.findAllRelated = R.curryN(2, function findAllRelated (relatedModelName, model) {
    return model.get('store').findAllRelated(model, relatedModelName);
  })

  if (typeof exports === 'object') {
    module.exports = R;
  } else if (typeof define === 'function' && define.amd) {
    define(function () { return R; });
  } else {
    root.R = R;
  }

}.call(this));
