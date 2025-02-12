enum LogLevel {
  DEBUG = "DEBUG",
  INFO = "INFO",
  WARNING = "WARNING",
  ERROR = "ERROR",
}

const getLogLevelOrdinal_ = (level: LogLevel): number => {
  return _.indexOf(Object.values(LogLevel), level);
};

const appendGs_ = <T>(any: T) => {
  return typeof any == "string"
    ? any.endsWith(".gs") ? any : any.concat(".gs")
    : any;
};

const toString_ = (any: unknown) => {
  if (any instanceof Error) {
    const name = any.name ?? any.constructor.name ?? "Error";
    return name + (any.message ? ": " + any.message : "")
      + (any.stack ? "\n" + any.stack.split("\n").filter(line => /^\s*at/.test(line)).join("\n") : "");
  }
  return typeof any === "string" ? any : stringify(any);
};

type LoggerOptions = {
  level: LogLevel;
  maxLogs: number;
  useSpreadsheet: boolean | string;
};

type Log = {
  fingerprint: string;
  timestamp: string;
  elapsed: string;
  level: string;
  stacktrace: string;
  message: string;
};

class Logger_ {
  private level: LogLevel;
  private maxRows: number;
  private fingerprint = Utilities.getUuid(); // Unique ID to correlate logs in the spreadsheet
  private useSpreadsheet: boolean | string;  // Spreadsheet ID or `true` for bound spreadsheet
  private temp = [] as Log[];                // Flushed to spreadsheet
  private logs = [] as Log[];                // To `getLog`
  constructor(options: Partial<LoggerOptions> = {}) {
    const callee = callsites().at(0);
    const caller = callsites().at(1);
    if (caller?.getFileName() !== callee?.getFileName()) {
      throw new Error("Logger_ cannot be instantiated directly; use LogManager instead.");
    }
    const config = Object.assign({
      maxLogs: 100_000,
      level: LogLevel.INFO,
      useSpreadsheet: false,
    }, options);
    this.level = config.level;
    this.maxRows = Math.max(config.maxLogs, 10);
    this.useSpreadsheet = config.useSpreadsheet;
  }

  private logger(level: LogLevel, runnable: () => void) {
    const srcLevel = getLogLevelOrdinal_(level);
    const dstLevel = getLogLevelOrdinal_(this.level);
    if (srcLevel >= dstLevel) {
      runnable.call(this);
    }
  }

  private write(level: LogLevel, ...args: unknown[]) {
    const timestamp = DateTime.now();
    const callSite = callsites().slice(2).find(it => it.getFileName() != "__lib__/framework") ?? callsites().at(2);
    const fileName = _.defaultTo(appendGs_(callSite?.getFileName()), "<anonymous>");
    const functionName = _.defaultTo(callSite?.getFunctionName(), "<anonymous>");
    const lineNumber = _.defaultTo(callSite?.getLineNumber(), "?").toString();
    const stackTrace = `${fileName}:${lineNumber} (${functionName})`;
    const message = args.map(toString_).join(" ");
    const log: Log = {
      fingerprint: this.fingerprint,
      timestamp: timestamp.toSQL(),
      elapsed: ms(time.elapsed()),
      level: level.toString(),
      stacktrace: stackTrace,
      message,
    };
    this.logger(level, () => {
      this.logs.push(log);
      if (this.useSpreadsheet) {
        this.temp.push(log);
      }
      switch (level) {
        case LogLevel.INFO:
          console.info(message);
          break;
        case LogLevel.DEBUG:
          console.log(message);
          break;
        case LogLevel.WARNING:
          console.warn(message);
          break;
        case LogLevel.ERROR:
          console.error(message);
          break;
        default:
          console.log(message);
          break;
      }
    });
  }

  clear() {
    this.logs = [];
    this.temp = [];
  }

  getLog() {
    return this.logs.map((log) => {
      return [log.timestamp, log.level.padEnd(7), log.message].join(" ".repeat(2));
    }).join("\n");
  }

  flush() {
    if (!this.useSpreadsheet) {
      return;
    }
    const lock = LockService.getScriptLock();
    const monospaceFont = "Ubuntu Mono";
    const spreadsheet = typeof this.useSpreadsheet == "string"
      ? SpreadsheetApp.openById(this.useSpreadsheet)
      : SpreadsheetApp.getActiveSpreadsheet();
    if (spreadsheet && lock.tryLock(ms("5 minutes"))) {
      const logs = this.temp.slice();
      this.temp = []; // Cleared
      const totalSheets = spreadsheet.getSheets().length;
      let sheet = spreadsheet.getSheetByName("apps.script.logs");
      const headers: { [K in keyof Log]: string } = {
        fingerprint: "Fingerprint",
        timestamp: "Timestamp",
        elapsed: "Elapsed",
        level: "Log level",
        stacktrace: "Stacktrace",
        message: "Message",
      };
      const totalColumns = Object.keys(headers).length;
      if (!sheet) {
        sheet = spreadsheet.insertSheet("apps.script.logs", totalSheets);
        sheet.getRange(1, 1, 1, totalColumns)
          .setFontStyle("italic")
          .setFontFamily(monospaceFont)
          .mergeAcross();
        sheet.getRange(1, 1, 1, totalColumns).setValue(["** no previous logs **"]); // For backup link
        sheet.getRange(2, 1, 1, totalColumns)
          .setValues([Object.values(headers)])
          .setFontFamily(monospaceFont)
          .setFontWeight("bold");
        sheet.hideColumn(sheet.getRange("A:A"));
        sheet.setFrozenRows(2);
        if (!sheet) {
          console.error("Unable to create apps.script.logs sheet");
          return;
        }
      }
      const debugColors = { background: "#FFFFFF", font: "#999999" };
      const errorColors = { background: "#FFEBEE", font: "#B71C1C" };
      const warningColors = { background: "#FFF8E1", font: "#A50E0E" };
      const appendLogs = (lastRow: number, logRows: Log[], logSheet: GoogleAppsScript.Spreadsheet.Sheet) => {
        logSheet.getRange(lastRow + 1, 1, logRows.length, totalColumns)
          .setFontFamily(monospaceFont)
          .setNumberFormat("@")
          .setValues(logRows
            .map(log => ({ ...log, message: _.truncate(log.message, { length: 50_000 }) }))
            .map(log => Object.values(_.mapValues(headers, (v, k: keyof typeof headers) => log[k]))),
          );
        const conditionalFormatRules = logSheet.getConditionalFormatRules();
        conditionalFormatRules[0] = SpreadsheetApp.newConditionalFormatRule()
          .setRanges([logSheet.getRange("A:Z")])
          .whenFormulaSatisfied('=$D:$D="DEBUG"')
          .setBackground(debugColors.background)
          .setFontColor(debugColors.font)
          .build();
        conditionalFormatRules[1] = SpreadsheetApp.newConditionalFormatRule()
          .setRanges([logSheet.getRange("A:Z")])
          .whenFormulaSatisfied('=$D:$D="ERROR"')
          .setBackground(errorColors.background)
          .setFontColor(errorColors.font)
          .build();
        conditionalFormatRules[2] = SpreadsheetApp.newConditionalFormatRule()
          .setRanges([logSheet.getRange("A:Z")])
          .whenFormulaSatisfied('=$D:$D="WARNING"')
          .setBackground(warningColors.background)
          .setFontColor(warningColors.font)
          .build();
        logSheet.setConditionalFormatRules(conditionalFormatRules);
        SpreadsheetApp.flush(); // Flushed
      };
      // Write in chunks
      const chunkSize = 1000;
      for (let chunk of _.chunk(logs, chunkSize)) {
        let lastRow = sheet.getLastRow();
        if (lastRow + chunk.length > (this.maxRows + 2)) {
          const remainingRows = (this.maxRows + 2) - lastRow;
          const slice = chunk.slice(0, remainingRows);
          appendLogs(lastRow, slice, sheet);
          this.backup(sheet);
          chunk = chunk.slice(remainingRows);
          lastRow = sheet.getLastRow();
        }
        appendLogs(lastRow, chunk, sheet);
      }
    }
    if (lock.hasLock()) lock.releaseLock();
  }

  private backup(sheet: GoogleAppsScript.Spreadsheet.Sheet) {
    logger.info("apps.script.logs backup begin.");
    const spreadsheet = sheet.getParent();
    const backupSheet = SpreadsheetApp.create(`(apps.script.logs on ${DateTime.now().toSQLDate()}) ${spreadsheet.getName()}`);
    // Copy apps.script.logs
    sheet.copyTo(backupSheet).setName(sheet.getName());
    const sheet1 = backupSheet.getSheetByName("Sheet1");
    if (sheet1) {
      backupSheet.deleteSheet(sheet1);
    }
    // Clean existing apps.script.logs
    const lastRow = sheet.getLastRow();
    const logCount = lastRow - 2;
    sheet.deleteRows(3, lastRow);
    sheet.getRange("A1").setFormula(`=HYPERLINK("${backupSheet.getUrl()}", "Previous logs: ${logCount}")`);
    // May fail soft after this point
    try {
      // Copy viewers and editors
      backupSheet.addViewers(spreadsheet.getViewers().map(user => user.getEmail()));
      backupSheet.addEditors(spreadsheet.getEditors().map(user => user.getEmail()));
      // Move file into the same folder as the apps.script.logs spreadsheet
      const newFile = DriveApp.getFileById(backupSheet.getId());
      const oldFile = DriveApp.getFileById(spreadsheet.getId());
      const folder = oldFile.getParents().next();
      newFile.moveTo(folder);
    }
    catch (err) {
      logger.error(err);
    }
    logger.info("apps.script.logs backup end.");
    logger.flush();
  }

  log(...args: unknown[]) {
    this.write(LogLevel.INFO, ...args);
  }

  info(...args: unknown[]) {
    this.write(LogLevel.INFO, ...args);
  }

  debug(...args: unknown[]) {
    this.write(LogLevel.DEBUG, ...args);
  }

  warn(...args: unknown[]) {
    this.write(LogLevel.WARNING, ...args);
  }

  error(...args: unknown[]) {
    this.write(LogLevel.ERROR, ...args);
  }
}

class LogManager {
  static getLogger(...args: ConstructorParameters<typeof Logger_>) {
    return new Logger_(...args);
  }
}
