enum LogLevel {
  INFO = "INFO",
  DEBUG = "DEBUG",
  WARNING = "WARNING",
  ERROR = "ERROR",
}

function getLogLevelOrdinal(level: LogLevel): number {
  return _.indexOf(_.values(LogLevel), level)
}

const appendGs = R.ifElse<Nullable<string>, Nullable<string>, Nullable<string>, string>(
  R.isNil,
  R.identity,
  R.ifElse(R.endsWith(".gs"), R.identity, R.concat(R.__, ".gs")),
)

type LoggerOptions = {
  level: LogLevel
  useStackDriver: boolean
  useSpreadSheet: boolean | string
}
class Logger_ {
  private level: LogLevel
  private useStackDriver: boolean
  private useSpreadSheet: boolean | string // Spreadsheet ID or active spreadsheet
  private logs = [] as string[][]          // Flushed to spreadsheet __logs__
  constructor(options: Partial<LoggerOptions> = {}) {
    const callee = callsites().at(0)
    const caller = callsites().at(1)
    if (caller?.getFileName() !== callee?.getFileName()) {
      throw new Error("Logger_ cannot be instantiated")
    }
    const o = _.merge({
      level: LogLevel.INFO,
      useStackDriver: false,
      useSpreadSheet: false,
    }, options)
    this.level = o.level
    this.useStackDriver = o.useStackDriver
    this.useSpreadSheet = o.useSpreadSheet
  }

  private runAsPerLogLevel(level: LogLevel, runnable: () => void) {
    const srcLevel = getLogLevelOrdinal(level)
    const dstLevel = getLogLevelOrdinal(this.level)
    if (srcLevel >= dstLevel) {
      runnable.call(this)
    }
  }

  private write(level: LogLevel, ...args: unknown[]) {
    const timestamp = DateTime.now()
    const callSite = callsites()[2]
    const fileName = _.defaultTo(appendGs(callSite.getFileName()), "<anonymous>")
    const functionName = _.defaultTo(callSite.getFunctionName(), "<anonymous>")
    const lineNumber = _.defaultTo(callSite.getLineNumber(), "?").toString()
    const trace = `${fileName}:${lineNumber} (${functionName})`
    const message = [
      timestamp.toISOTime(),
      level.padEnd(7),
      trace,
      args.map(toString).join(" "),
    ].join(" ".repeat(4))
    // For Spreadsheet __logs__
    this.logs.push([
      timestamp.toFormat("hh:mm:ss.SSS a"),
      level,
      trace,
      args.map(toString).join(" "),
    ])
    if (this.useStackDriver) {
      this.runAsPerLogLevel(level, () => {
        switch (level) {
          case LogLevel.INFO:
            console.info(message)
            break
          case LogLevel.DEBUG:
            console.log(message)
            break
          case LogLevel.WARNING:
            console.warn(message)
            break
          case LogLevel.ERROR:
            console.error(message)
            break
          default:
            console.info(message)
            break
        }
      })
    }
    else {
      Logger.log(message)
    }
  }

  flush() {
    if (this.useSpreadSheet) {
      const monospaceFont = "Ubuntu Mono"
      const spreadsheet = _.isString(this.useSpreadSheet)
        ? SpreadsheetApp.openById(this.useSpreadSheet)
        : SpreadsheetApp.getActiveSpreadsheet()
      if (spreadsheet) {
        const totalSheets = spreadsheet.getSheets().length
        let sheet = spreadsheet.getSheetByName("__logs__")
        if (!sheet) {
          sheet = spreadsheet.insertSheet("__logs__", totalSheets)
          sheet.hideSheet()
          sheet.getRange("A1:D1")
            .setValues([["Timestamp", "Level", "Trace", "Message"]])
            .setFontFamily(monospaceFont)
            .setFontWeight("bold")
          if (!sheet) {
            console.error("Unable to create __logs__ sheet")
            return
          }
        }
        const errorColors = { background: "#FCE8E6", font: "#AD5A00" }
        const warningColors = { background: "#FEF7E0", font: "#A50E0E" }
        // Flush in chunks
        const chunkSize = 1000
        for (const logs of _.chunk(this.logs, chunkSize)) {
          const lastRow = sheet.getLastRow()
          const rowCount = Math.min(logs.length, chunkSize)
          sheet.getRange(lastRow + 1, 4, rowCount, 23).mergeAcross() // 4th and beyond
          sheet.getRange(lastRow + 1, 1, rowCount, 4).setValues(logs).setFontFamily(monospaceFont)
          const conditionalFormatRules = sheet.getConditionalFormatRules()
          conditionalFormatRules[0] = SpreadsheetApp.newConditionalFormatRule()
            .setRanges([sheet.getRange("A:Z")])
            .whenFormulaSatisfied('=$B:$B="ERROR"')
            .setBackground(errorColors.background)
            .setFontColor(errorColors.font)
            .build()
          conditionalFormatRules[1] = SpreadsheetApp.newConditionalFormatRule()
            .setRanges([sheet.getRange("A:Z")])
            .whenFormulaSatisfied('=$B:$B="WARNING"')
            .setBackground(warningColors.background)
            .setFontColor(warningColors.font)
            .build()
          sheet.setConditionalFormatRules(conditionalFormatRules)
          SpreadsheetApp.flush()
        }
      }
    }
  }

  log(...args: unknown[]) {
    this.write(LogLevel.INFO, ...args)
  }

  info(...args: unknown[]) {
    this.write(LogLevel.INFO, ...args)
  }

  debug(...args: unknown[]) {
    this.write(LogLevel.DEBUG, ...args)
  }

  warn(...args: unknown[]) {
    this.write(LogLevel.WARNING, ...args)
  }

  error(...args: unknown[]) {
    this.write(LogLevel.ERROR, ...args)
  }
}

class LogManager {
  static getLogger(...args: ConstructorParameters<typeof Logger_>) {
    return new Logger_(...args)
  }
}
