module.exports = function (value, prefix) {
  return value.map((item) => `${prefix}${item}`);
};
