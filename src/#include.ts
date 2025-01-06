const time = new Clock(Duration.fromObject({ minutes: 30 }));
const logger = LogManager.getLogger({
  level: LogLevel.DEBUG,
  useSpreadsheet: true,
});
