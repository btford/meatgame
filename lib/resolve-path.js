module.exports = function resolvePath (path, obj) {
  path = path.split('.');
  var segment;
  while (path.length && (segment = path.shift())) {
    if (obj[segment]) {
      obj = obj[segment];
    } else {
      return;
    }
  }
  return obj;
};
