const eleventyNavigationPlugin = require('@11ty/eleventy-navigation');
const pkg = require('./package.json');

module.exports = function (eleventyConfig) {
  const pathPrefix =
    process.env.ELEVENTY_ENV === 'production' ? `/${pkg.name}/` : '/';

  eleventyConfig.addPlugin(eleventyNavigationPlugin);

  eleventyConfig.addPassthroughCopy('./public');
  eleventyConfig.addPassthroughCopy('./src/sw.js');

  eleventyConfig.addFilter('parsePrefix', (value, list) =>
    list.reduce((res, prefix) => (value.includes(prefix) ? prefix : res), '')
  );

  eleventyConfig.addFilter('mapPrefix', (value, prefix) =>
    value.map((item) => `${prefix}${item}`)
  );

  eleventyConfig.addPairedShortcode('card', (content, title, id) => {
    return `
      <fieldset id="${id}">
        <legend>${title}</legend>
        ${content}
      </fieldset>
    `;
  });

  eleventyConfig.addPairedShortcode('field', (content, label, attrs) => {
    return `
      <label for="${attrs.id}">${label}</label>
      ${content}
    `;
  });

  return {
    pathPrefix,
    dataTemplateEngine: 'njk',
    dir: {
      input: 'src',
      output: 'dist',
      layouts: '_layouts',
    },
  };
};
