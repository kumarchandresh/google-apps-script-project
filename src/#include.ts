/**
 * @fileoverview
 *
 * .env
 *
 * Customize the execution environment here. Scripts are executed in order they
 * are shown in the Google apps script environment.
 *
 * _bundles/lodash.bundle.gs
 * _lib/logger.gs
 * #include.gs
 * Code.gs
 */

const logger = LogManager.getLogger({
  useSpreadsheet: true,
})
