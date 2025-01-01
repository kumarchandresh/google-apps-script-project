/**
 * @fileOverview
 *
 * Customize the execution environment here. Scripts are executed in order they
 * are shown in the Google apps script environment.
 *
 * __lib__/lodash.js
 * @framework/logger.js
 * #include.js
 * myFile.js
 */

const logger = LogManager.getLogger({
  useStackDriver: true,
  useSpreadSheet: true,
})
