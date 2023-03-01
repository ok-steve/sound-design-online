const pkg = require('../../package.json');

module.exports = () => {
  return {
    name: pkg.name
      .split('-')
      .map(
        (str) => `${str.charAt(0).toUpperCase()}${str.slice(1).toLowerCase()}`
      )
      .join(' '),
    description: pkg.description,
    url: `${pkg.author.url}/${pkg.name}`,
    author: pkg.author,
  };
};
