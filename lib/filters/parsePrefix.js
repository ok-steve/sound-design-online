module.exports = function (value, list) {
  return list.reduce(
    (res, prefix) => (value.includes(prefix) ? prefix : res),
    ''
  );
};
