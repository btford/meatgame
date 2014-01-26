var resolvePath = require('./lib/resolve-path');

var createProxyHandler = function (obj) {

  return {
    getOwnPropertyDescriptor: function () {
      return Object.getOwnPropertyDescriptor(obj);
    },
    getPropertyDescriptor: function () {
      return Object.getOwnPropertyDescriptor(obj);
    },
    getOwnPropertyNames: function () {
      return Object.getOwnPropertyNames(obj);
    },
    getPropertyNames: function () {
      return Object.getOwnPropertyNames(obj);
    },
    defineProperty: function (name, desc) {
      return Object.defineProperty(obj, name, desc);
    },
    delete: function (name) {
      obj.__dirty[name] = true;
      return obj[name] = null;
    },
    fix: function () {

    },
    get: function (rec, name) {
      if (name.substr(0, 2) === '__' || name === 'inspect') {
        return;
      }

      if (!obj[name]) {
        obj[name] = createModel();
      }

      if (typeof val === 'object' && obj[name] !== Object(obj[name])) {
        obj[name] = createModel(obj[name]);
      }

      return obj[name];
    },
    set: function (rec, name, val) {
      if (name === '__diff') {
        return false;
      }
      if (obj[name] === val) {
        return false;
      }

      if (typeof val === 'object') {
        val = createModel(val);
      } else {
        obj.__dirty[name] = true;
      }

      obj[name] = val;

      return true;
    },
    has: function (name) {
      return name in obj;
    },
    keys: function () {
      return Object.keys(obj).filter(function (key) {
        return key.substr(0, 2) !== '__';
      });
    }
  };
};

var createModel = module.exports = function (obj) {

  if (obj === undefined) {
    obj = {};
  } else if (typeof obj !== 'object') {
    return obj;
  }

  // init dirty tracking

  obj.__dirty = {};
  Object.keys(obj).forEach(function (key) {
    if (typeof obj[key] !== 'object' &&
        typeof obj[key] !== 'function') {

      obj.__dirty[key] = true;
    }
  });

  obj._diff = function () {
    var dirt = Object.keys(this).
      filter(function (key) {
        return key[0] !== '_';
      }).
      map(function (key) {
        if (typeof obj[key] === 'object' && obj[key] != undefined) {
          if (!obj[key].diff) {
            console.log(key, obj)
          }
          return obj[key]._diff().map(function (subKey) {
            return key + '.' + subKey;
          });
        }
        return [];
      }).
      reduce(function (a, b) {
        return a.concat(b);
      }).
      concat(Object.keys(obj.__dirty));

    obj.__dirty = {};

    return dirt;
  };

  obj.diff = function () {
    return obj._diff().
      map(function (path) {
        return {
          key: path,
          value: resolvePath(path, obj)
        };
      });
  };

  return Proxy.create(createProxyHandler(obj));
};
