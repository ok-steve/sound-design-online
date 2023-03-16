module.exports = function (content, title, id) {
  return `
    <fieldset id="${id}">
      <legend>${title}</legend>
      ${content}
    </fieldset>
  `;
};
