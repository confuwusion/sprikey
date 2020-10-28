const aliases = require(`alias-hq`);

aliases.config.baseUrl = ``;

module.exports = {
  transform: { "^.+\.ts$": `ts-jest` },
  testEnvironment: `node`,
  testRegex: `/src/tests/.*\.(test|spec)?\.(ts)$`,
  moduleFileExtensions: [ `js`, `ts` ],
  moduleNameMapper: aliases.get(`jest`),
  rootDir: `./`,
  setupFiles: [ `./.jest/env.js` ],
  testTimeout: 60000
};
