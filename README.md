# Google AppsScript project template

![TypeScript](https://img.shields.io/badge/typescript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white)

## Libraries

| Library                                                     | License      | Version |       Size |
| :---------------------------------------------------------- | :----------- | ------: | ---------: |
| [Lodash](https://lodash.com)                                | MIT          | 4.17.21 |      71 KB |
| [Ramda](https://ramdajs.com)                                | MIT          |  0.30.1 |      57 KB |
| [Luxon](https://moment.github.io/luxon)                     | MIT          |   3.5.0 |      69 KB |
| [validator.js](https://github.com/validatorjs/validator.js) | MIT          | 13.12.0 |     121 KB |
| [Zod](https://zod.dev/)                                     | MIT          |  3.24.1 |      61 KB |
| [callsites](https://github.com/sindresorhus/callsites)      | MIT          |   4.2.0 |       0 KB |
| [flatted](https://github.com/WebReflection/flatted)         | ISC          |   3.3.2 |       2 KB |
| [htmlparser2](https://github.com/fb55/htmlparser2)          | MIT          |  10.0.0 |     165 KB |
| [css-select](https://github.com/fb55/css-select)            | BSD-2-Clause |   5.1.0 |     107 KB |
| **Total**                                                   |              |         | **650 KB** |

## How-to?

- Replace _`{{GOOGLE_APP_SCRIPT_ID}}`_ in `.clasp.json` file.
- Replace _`{{YOUR_NAME}}`_ in `package.json` and `LICENSE` file.
- Enable __*Chrome v8 runtime*__ in the Apps Script project.
- Update the timezone in `appsscript.json` manifest file
- Install `gulp-cli` and `@google/clasp` CLI from npm.
- Run the following commands:
  - `npm install`
  - `npm run build`
  - `clasp push`
