const { EleventyHtmlBasePlugin } = require('@11ty/eleventy');
const EleventyNavigation = require('@11ty/eleventy-navigation');

module.exports = function (eleventyConfig) {
  eleventyConfig.addPlugin(EleventyHtmlBasePlugin);
  eleventyConfig.addPlugin(EleventyNavigation);

  eleventyConfig.setServerPassthroughCopyBehavior('passthrough');
  eleventyConfig.addPassthroughCopy('./public');

  ['mapPrefix', 'parsePrefix'].forEach((filter) =>
    eleventyConfig.addFilter(filter, require(`./lib/filters/${filter}`))
  );

  ['card', 'field'].forEach((shortcode) =>
    eleventyConfig.addPairedShortcode(
      shortcode,
      require(`./lib/shortcodes/${shortcode}`)
    )
  );

  return {
    dir: {
      input: 'src',
      output: 'dist',
      layouts: '_layouts',
    },
  };
};
