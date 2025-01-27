const g_maxTime = ms("30 min");
const time = (() => {
  const elapsed = Date.now() - g_startTime;
  return new Stopwatch(g_maxTime - elapsed);
})();
const logger = LogManager.getLogger({
  level: LogLevel.DEBUG,
  useSpreadsheet: true,
});
