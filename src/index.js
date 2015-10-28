/**
 * A collection of utilities
 */

(function () {
  var root = this;
  var R = require('ramda');
  var hasEmber;
  try {
    hasEmber = require.resolve('Ember')
  } catch (e) {
    hasEmber = false;
  }

  // @sig a -> Boolean
  R.isUndefined = function (x) {return typeof x === 'undefined'};
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


  /**
   * rsvp is a collection promise-enabled control flow functions
   */
  console.log('HAS EMBER', hasEmber)
  if (hasEmber) {

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
    var E = {};
    R.E = E;
    R.Ember = E;

    /* Re-implement Ramda functions to work with Ember getters/setters*/
    // @sig k -> Object -> v
    E.prop = R.flip(Ember.get);
    E.get = E.prop;

    E.propOr = R.curryN(3, function propOr (val, p, obj) {
      if (R.isNilOrEmptyObj(obj)) return val;
      var result = E.get(p, obj);
      return R.isUndefined(result) ? val : result;
    })
    E.getOr = E.propOr;

    // @sig [k] -> {k: v} -> [v]
    E.props = R.curryN(2, function props (props, obj) {
      return R.compose(
          R.rmap(obj),
          R.map(E.get)
      )(props)
    });

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

    // @sig DS.Model -> Promise(DS.Model)
    E.save = R.invoker(0, 'save');
    // @sig [DS.Model] -> Promise([DS.Model])
    E.saveAll = rsvp.all(R.map(E.save))
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
      return rsvp.effect(function (b) {return parent.linkRelated(b)}, related)
    });
    // @sig a -> [b] -> PromiseArray([b])
    E.linkManyRelated = R.curryN(2, function linkManyRelated (theOne, theMany) {
      return rsvp.map(E.linkRelated(theOne), theMany)
    });

    // @sig String -> a -> b -> Promise(b)
    E.linkCustomRelated = R.curryN(3, function linkCustomRelated (relatedName, a, b) {
      return rsvp.effect(function (b) {return a.linkRelated(b, relatedName)}, b)
    });

    // @sig String -> a -> PromiseArray([b])
    E.findAllRelated = R.curryN(2, function findAllRelated (relatedModelName, model) {
      return model.get('store').findAllRelated(model, relatedModelName);
    })
  }

  if (typeof exports === 'object') {
    module.exports = R;
  } else if (typeof define === 'function' && define.amd) {
    define(function () { return R; });
  } else {
    root.R = R;
  }

}.call(this));
