// Import centralized validation utility
const { validateI18nMessage } = require('../src/lib/utils.ts');

const validate = (message = '') => {
  validateI18nMessage(message);
  if (
    (message.includes('{') || message.includes('}')) &&
    !/{{ ?(?:- |\w+?)(, ?)?\w+? ?}}/g.test(message)
  ) {
    throw new SyntaxError(
      'Interpolation error. See: https://www.i18next.com/misc/json-format'
    );
  }
  if (message.includes('$t(') && !/\$t\([\w]+:\w+(?:\.\w+)*\)/g.test(message)) {
    throw new SyntaxError(
      'Nesting error. See: https://www.i18next.com/misc/json-format'
    );
  }
};

module.exports = validate;
