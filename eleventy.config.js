const eleventyNavigationPlugin = require('@11ty/eleventy-navigation');
const pkg = require('./package.json');

module.exports = function (eleventyConfig) {
  const pathPrefix =
    process.env.ELEVENTY_RUN_MODE === 'build' ? `/${pkg.name}/` : '/';

  eleventyConfig.addPlugin(eleventyNavigationPlugin);

  eleventyConfig.setServerPassthroughCopyBehavior('passthrough');
  eleventyConfig.addPassthroughCopy('./public');

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
    htmlTemplateEngine: 'njk',
    markdownTemplateEngine: 'njk',
    dir: {
      input: 'src',
      output: 'dist',
      layouts: '_layouts',
    },
  };
};
