/**
 * A collection of utilities
 */

(function () {
  var root = this;
  var R = require('./base');
  R.rsvp = require('./rsvp')(R, Ember.RSVP);

  ///* Ember-specific functions */

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
  Re.saveAll = R.rsvp.all(R.map(Re.save))

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
    return R.rsvp.effect(function (b) {return parent.linkRelated(b)}, related)
  });
  // @sig a -> [b] -> PromiseArray([b])
  Re.linkManyRelated = R.curryN(2, function linkManyRelated (theOne, theMany) {
    return R.rsvp.map(Re.linkRelated(theOne), theMany)
  });

  // @sig String -> a -> b -> Promise(b)
  Re.linkCustomRelated = R.curryN(3, function linkCustomRelated (relatedName, a, b) {
    return R.rsvp.effect(function (b) {return a.linkRelated(b, relatedName)}, b)
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
