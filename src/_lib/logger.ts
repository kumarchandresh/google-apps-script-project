enum LogLevel {
  DEBUG = "DEBUG",
  INFO = "INFO",
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
  maxRows: number
  useSpreadsheet: boolean | string
}
type Log = [string, string, LogLevel, string, string]
class Logger_ {
  private level: LogLevel
  private maxRows: number
  private fingerprint = Utilities.getUuid()     // Unique ID to correlate logs in the spreadsheet
  private useSpreadsheet: boolean | string      // Spreadsheet ID or `true` for bound spreadsheet
  private cache = [] as Log[]                   // Flushed to spreadsheet
  private logs = [] as Log[]                    // To `getLog`
  constructor(options: Partial<LoggerOptions> = {}) {
    const callee = callsites().at(0)
    const caller = callsites().at(1)
    if (caller?.getFileName() !== callee?.getFileName()) {
      throw new Error("Logger_ cannot be instantiated")
    }
    const defaults: LoggerOptions = {
      maxRows: 100_000,
      level: LogLevel.DEBUG,
      useSpreadsheet: false,
    }
    const o = _.merge(defaults, options)
    this.level = o.level
    this.maxRows = o.maxRows
    this.useSpreadsheet = o.useSpreadsheet
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
    const callSite = callsites().slice(2).find((site) => {
      return !site.getFileName()?.startsWith("_lib/command")
        && !(site.getFileName()?.startsWith("_lib/logger") && site.getFunctionName()?.match(/^(log|info|debug|warn|error)$/))
    }) ?? callsites().at(2)
    const fileName = _.defaultTo(appendGs(callSite?.getFileName()), "<anonymous>")
    const functionName = _.defaultTo(callSite?.getFunctionName(), "<anonymous>")
    const lineNumber = _.defaultTo(callSite?.getLineNumber(), "?").toString()
    const entryPoint = `${fileName}:${lineNumber} (${functionName})`
    const message = args.map(_toString).join(" ")
    const log: Log = [
      this.fingerprint,
      timestamp.toSQL(),
      level,
      entryPoint,
      message,
    ]
    this.runAsPerLogLevel(level, () => {
      this.logs.push(log)
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
          console.log(message)
          break
      }
      if (this.useSpreadsheet) {
        this.cache.push(log)
      }
    })
  }

  clear() {
    this.logs = []
    this.cache = []
  }

  getLog() {
    return this.logs.map((log) => {
      const [__, timestamp, level, ___, message] = log
      return [timestamp, level.padEnd(7), message].join(" ".repeat(2))
    }).join("\n")
  }

  flush() {
    if (this.useSpreadsheet) {
      const lock = LockService.getScriptLock()
      const monospaceFont = "Ubuntu Mono"
      const spreadsheet = _.isString(this.useSpreadsheet)
        ? SpreadsheetApp.openById(this.useSpreadsheet)
        : SpreadsheetApp.getActiveSpreadsheet()
      if (spreadsheet && lock.tryLock(ms("5 minutes"))) {  // WARNING: Logs may be missing due to lock timeout
        const logs = this.cache.slice()
        this.cache = []  // Cleared
        const totalSheets = spreadsheet.getSheets().length
        let sheet = spreadsheet.getSheetByName("apps.script.logs")
        if (!sheet) {
          sheet = spreadsheet.insertSheet("apps.script.logs", totalSheets)
          sheet.hideSheet()
          sheet.getRange("A1:E1")
            .setFontStyle("italic")
            .setFontFamily(monospaceFont)
            .mergeAcross()
          sheet.getRange("A1").setValue(["** no previous logs **"]) // For backup
          sheet.getRange("A2:E2")
            .setValues([["Fingerprint", "Timestamp", "Log Level", "Entry Point", "Message"]])
            .setFontFamily(monospaceFont)
            .setFontWeight("bold")
          sheet.hideColumn(sheet.getRange("A:A"))
          sheet.setFrozenRows(2)
          if (!sheet) {
            console.error("Unable to create apps.script.logs sheet")
            return
          }
        }
        const debugColors = { background: "#F5F5F5", font: "#616161" }
        const errorColors = { background: "#FFEBEE", font: "#B71C1C" }
        const warningColors = { background: "#FFF8E1", font: "#A50E0E" }
        // Write in chunks
        const chunkSize = 1000
        for (const chunk of _.chunk(logs, chunkSize)) {
          let lastRow = sheet.getLastRow()
          if (lastRow + chunk.length > this.maxRows + 2) {
            this.backup(sheet)
            lastRow = sheet.getLastRow()
          }
          const totalColumns = chunk[0].length
          const rowCount = Math.min(chunk.length, chunkSize)
          sheet.getRange(lastRow + 1, 1, rowCount, totalColumns)
            .setFontFamily(monospaceFont)
            .setValues(chunk)
          sheet.autoResizeColumns(2, 4)
          const conditionalFormatRules = sheet.getConditionalFormatRules()
          conditionalFormatRules[0] = SpreadsheetApp.newConditionalFormatRule()
            .setRanges([sheet.getRange("A:Z")])
            .whenFormulaSatisfied('=$C:$C="DEBUG"')
            .setBackground(debugColors.background)
            .setFontColor(debugColors.font)
            .build()
          conditionalFormatRules[1] = SpreadsheetApp.newConditionalFormatRule()
            .setRanges([sheet.getRange("A:Z")])
            .whenFormulaSatisfied('=$C:$C="ERROR"')
            .setBackground(errorColors.background)
            .setFontColor(errorColors.font)
            .build()
          conditionalFormatRules[2] = SpreadsheetApp.newConditionalFormatRule()
            .setRanges([sheet.getRange("A:Z")])
            .whenFormulaSatisfied('=$C:$C="WARNING"')
            .setBackground(warningColors.background)
            .setFontColor(warningColors.font)
            .build()
          sheet.setConditionalFormatRules(conditionalFormatRules)
          SpreadsheetApp.flush()  // Flushed
        }
      }
      if (lock.hasLock()) lock.releaseLock()
    }
  }

  private backup(sheet: GoogleAppsScript.Spreadsheet.Sheet) {
    logger.info("apps.script.logs backup begin.")
    const spreadsheet = sheet.getParent()
    const backupSheet = SpreadsheetApp.create(`(apps.script.logs on ${DateTime.now().toSQLDate()}) ${spreadsheet.getName()}`)
    // Copy apps.script.logs
    sheet.copyTo(backupSheet).setName(sheet.getName())
    const sheet1 = backupSheet.getSheetByName("Sheet1")
    if (sheet1) {
      backupSheet.deleteSheet(sheet1)
    }
    // Clean existing apps.script.logs
    const lastRow = sheet.getLastRow()
    const logCount = lastRow - 2
    sheet.deleteRows(3, lastRow)
    sheet.getRange("A1").setFormula(`=HYPERLINK("${backupSheet.getUrl()}", "Previous logs: ${logCount}")`)
    // Fails soft after this point
    try {
      // Copy viewers and editors
      backupSheet.addViewers(spreadsheet.getViewers().map(user => user.getEmail()))
      backupSheet.addEditors(spreadsheet.getEditors().map(user => user.getEmail()))
      // Move file into the same folder as the apps.script.logs spreadsheet
      const newFile = DriveApp.getFileById(backupSheet.getId())
      const oldFile = DriveApp.getFileById(spreadsheet.getId())
      const folder = oldFile.getParents().next()
      newFile.moveTo(folder)
    }
    catch (err) {
      logger.error(err)
    }
    logger.info("apps.script.logs backup end.")
    logger.flush()
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
