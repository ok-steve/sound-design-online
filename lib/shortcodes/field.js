module.exports = function (content, label, attrs) {
  return `
    <label for="${attrs.id}">${label}</label>
    ${content}
  `;
};
