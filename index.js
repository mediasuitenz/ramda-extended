/**
 * A collection of utilities
 */

;
(function () {

  'use strict';

  var Re = {};
  /**
   * Creates a function that calls several functions with the same arguments.
   * https://github.com/ramda/ramda/issues/986
   * @function juxt
   * @param {Array} array of functions to apply to the object in parallel
   * @param {Object}
   */
  Re.juxt = R.useWith(R.ap, R.identity, R.of);

  /**
   * The complement of R.Empty
   * @type {Function}
   */
  Re.isNotEmpty = R.complement(R.isEmpty);

  /**
   * The complement of R.isNil
   * @type {Function}
   */
  Re.isNotNil = R.complement(R.isNil);

  /**
   * isEmpty checks the "length" attr of an obj, which a POJO doesn't have.
   * @type {Function}
   */
  Re.isEmptyObj = R.compose(R.isEmpty, Object.keys);

  /**
   * The complement of isEmptyObj
   * @type {Function}
   */
  Re.isNotEmptyObj = R.complement(Re.isEmptyObj);


  /**
   * Checks whether a String or Array is undefined, null, or "empty"
   * @param {String|Array}
   * @type {Function}
   */
  Re.isNilOrEmpty = R.anyPass([R.isNil, R.isEmpty]);

  /**
   * Converse of isNilOrEmpty
   * @param {String|Array}
   * @type {Function}
   */
  Re.isNotNilOrEmpty = R.complement(Re.isNilOrEmpty);

  /**
   * Checks whether an Object is undefined, null, or has no keys
   * @param {Object}
   * @type {Function}
   */
  Re.isNilOrEmptyObj = R.anyPass([R.isNil, Re.isEmptyObj]);

  /**
   * Converse of isNilOrEmptyObj
   * @param {Object}
   * @type {Function}
   */
  Re.isNotNilOrEmptyObj = R.complement(Re.isNilOrEmptyObj);


  /**
   * The inverse of R.merge
   *
   * R.merge(a, b) --> own properties of b overwrites properties of a
   * mergeRight(a, b) --> own properties of a overwrites properties of b
   *
   * @func
   * @memberOf Re
   * @category Function
   * @param {Object} a
   * @param {Object} b
   * @return {Object} a merged into b
   * @see R.merge
   * @see R.flip
   */
  Re.mergeRight = R.flip(R.merge);

  Re.trace = function (message, fn) {
    return function (val) {
      if (fn) {
        console.log(message, fn(val), val)
      } else {
        console.log(message, val)
      }
      return val
    }
  };
  Re.log = Re.trace;

  Re.toArray = R.invoker(0, 'toArray');

  Re.effect = R.curryN(2, function (fn, x) {
    fn(x);
    return x
  });

  /**
   * A collection promise-enabled control flow methods
   */
  var rsvp = {};
  Re.rsvp = rsvp;

  /**
   * A version of juxt that works with composeP
   * @sig [(* -> *)] -> * -> Ember.RSVP.all([*])
   * @func
   */
  rsvp.parallel = R.curryN(2, function (fns, x) {
    return rsvp.all(Re.juxt(fns))(x)
  })

  /**
   * Identical to rsvp.parallel, except that instead of a list,
   * you pass an object with the functions as the keys
   *
   * @func
   * @sig {k: (v -> v)} -> * -> Ember.RSVP.promise({k: v})
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


  rsvp.all = R.curryN(1, function (fn) {
    return R.compose(
        Ember.RSVP.all,
        fn
    )
  });

  rsvp.hash = R.curryN(1, function (fn) {
    return R.compose(
        Ember.RSVP.hash,
        fn
    )
  });

  /**
   * Shorthand for `rsvp.hash(R.compose(/* fns... *\/))`
   */
  rsvp.compseHash = function composeHash () {
    return rsvp.hash(R.apply(R.compose, arguments))
  };


  /**
   * A version of map that works with composeP
   * @sig (* -> *) -> * -> Ember.RSVP.all([*])
   * @function
   * @param {Function} fn a function to apply to all items in list
   * @param {Array} list an array or items to apply the function to
   */
  rsvp.map = R.curryN(2, function (fn, list) {
    return rsvp.all(R.map(fn))(list)
  });

  /**
   * A version of fo;ter that works with composeP
   * @sig (* -> *) -> * -> Ember.RSVP.all([*])
   * @function
   * @param {Function} fn a function to apply to all items in list
   * @param {Array} list an array or items to apply the function to
   */
  rsvp.filter = R.curryN(2, function (fn, list) {
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
  rsvp.effect = R.curryN(2, function (fn, x) {
    return fn(x).then(R.always(x))
  });


  rsvp.compose = R.composeP;
  rsvp.pipe = R.pipeP;


  /**
   * Methods to use with with Ember objects
   */
  if (Ember) {

    /**
     * An implementation of Ramda that is compatible with Ember getters/setters
     * @type {{}}
     */
    var E = {};
    Re.E = E;
    Re.Ember = E;

    /**
     * R.prop for Ember objects
     * @sig a -> b -> Ember.get(b, a)
     * @param {String} name of attribute to get
     * @param {Object} object to get the attribute from
     * @return {*}
     */
    E.prop = R.flip(Ember.get);
    E.get = E.prop;

    /**
     * Pluck over an array of ember objects
     * @param p
     * @param list
     */
    E.pluck = R.curryN(2, function epluck (p, list) {
      return R.map(E.get(p), list);
    });

    /**
     * @see R.propSatisfies
     */
    E.propSatisfies = R.curryN(3, function propSatisfies (pred, name, obj) {
      return pred(Ember.get(obj, name))
    });

    /**
     * @see R.propEq
     */
    E.propEq = R.curryN(3, function propEq (val, name, obj) {
      return E.propSatisfies(R.equals(val), name, obj)
    });

    /**
     * @see R.eqProps
     */
    E.eqProps = R.curryN(3, function eqProps (prop, obj1, obj2) {
      return R.equals(E.get(prop, obj1), E.get(prop, obj2))
    });

    /**
     * Invokes `object.set(keyName, value)` then returns the object
     * @func
     * @sig String -> * -> Object -> Object
     * @param {String} keyName
     * @param {*} value
     * @param {Object} object
     * @returns {Object}
     */
    E.set = R.curryN(3, function set (keyName, value, object) {
      Ember.set(object, keyName, value);
      return object
    });

    /**
     * Calls `save` on the calling model
     * @func
     * @sig DS.Model -> Ember.RSVP.Promise
     * @param {DS.Model} model The model instance to save
     * @returns {Ember.RSVP.Promise} Resolves to the supplied model after having been saved
     */
    E.save = R.invoker(0, 'save');


    /**
     * Calls `save` on an object
     * @func
     * @sig DS.Model -> DS.Model
     * @param {DS.Model} model The model instance to clone
     * @returns {DS.Model} A cloned instance of the model
     */
    E.clone = R.invoker(0, 'clone');


    /**
     * @func
     * @sig Object -> * -> *
     * @param {Object} pojo of objects to pass to setProperties
     * @param {*} object to call setProperties on
     */
    E.setProperties = R.flip(Ember.setProperties)

    /**
     *
     */
    E.linkRelated = R.curryN(2, function (parent, related) {
      return rsvp.effect(b => parent.linkRelated(b), related)
    })

    E.linkManyRelated = R.curryN(2, function (theOne, theMany) {
      return rsvp.map(E.linkRelated(theOne), theMany)
    })

    E.linkCustomRelated = R.curryN(3, function (relatedName, a, b) {
      return rsvp.effect(b => a.linkRelated(b, relatedName), b)
    })


    /**
     * String -> DS.Model -> Ember.RSVP.Promise([DS.Model])
     */
    E.findAllRelated = R.curryN(2, function (relatedModelName, model) {
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
