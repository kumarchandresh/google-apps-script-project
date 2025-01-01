class Command_<T> {
  constructor(
    private name: string,
    private runnable: () => T,
    private failureMessage?: string,
  ) {
    const callee = callsites().at(0)
    const caller = callsites().at(1)
    if (caller?.getFileName() !== callee?.getFileName()) {
      throw new Error("Command_ cannot be instantiated")
    }
    this.run = this.run.bind(this)
    this.onBegin = this.onBegin.bind(this)
    this.onSuccess = this.onSuccess.bind(this)
    this.onError = this.onError.bind(this)
  }

  run() {
    let error: Error | null = null
    this.onBegin()
    const result: {
      success: boolean
      error?: unknown
      value?: T
    } = { success: true }
    try {
      result.value = this.runnable()
      this.onSuccess()
    }
    catch (err) {
      if (err instanceof Error) {
        error = err
      }
      result.error = err
      result.success = false
      this.onError(err)
    }
    finally {
      this.onEnd()
    }
    // if (error && error.message.startsWith("Exception:")) {
    //   throw error
    // }
    return result
  }

  private onBegin() {
    const activeUser = Session.getActiveUser().getEmail() || "<anonymous>"
    const effectiveUser = Session.getEffectiveUser().getEmail() || "<anonymous>"
    logger.info(`Executing command ${_stringify(this.name)} for ${_stringify(activeUser)} as ${_stringify(effectiveUser)}.`)
  }

  private onSuccess() {
    logger.info(`Command ${_stringify(this.name)} completed successfully.`)
  }

  private onError(error: unknown) {
    logger.error(error)
    logger.flush() // Flush before user interaction
    const ui = _getUi()
    if (ui) {
      if (error instanceof Error) {
        if (error.stack) {
          ui.alert(this.failureMessage || error.toString(), error.stack, ui.ButtonSet.OK)
        }
        else {
          ui.alert(this.failureMessage || error.toString(), ui.ButtonSet.OK)
        }
      }
      else {
        if (this.failureMessage) {
          ui.alert(this.failureMessage, _toString(error), ui.ButtonSet.OK)
        }
        else {
          ui.alert(_toString(error), ui.ButtonSet.OK)
        }
      }
    }
  }

  private onEnd() {
    logger.flush()
  }
}

class Command<T> {
  private name?: string
  private failureMessage?: string
  private callback?: ReturnType<Command<T>["build"]>
  constructor(private runnable: () => T) { }
  withName(name: string) {
    this.name = name
    return this
  }

  withFailureMessage(failureMessage: string) {
    this.failureMessage = failureMessage
    return this
  }

  private build() {
    const name = this.name || this.runnable.name || "<anonymous>"
    const callback = () => new Command_(name, this.runnable, this.failureMessage).run()
    Object.defineProperty(callback, "name", { value: callback.name, writable: true })
    return Object.assign(callback, { name })
  }

  run() {
    if (!this.callback) {
      this.callback = this.build()
    }
    return this.callback()
  }
}
