const getUi_ = () => {
  try {
    return SpreadsheetApp.getUi();
  }
  catch (e) { /* silence */ }
  try {
    return DocumentApp.getUi();
  }
  catch (e) { /* silence */ }
  try {
    return SlidesApp.getUi();
  }
  catch (e) { /* silence */ }
  try {
    return FormApp.getUi();
  }
  catch (e) { /* silence */ }
  return null;
};

type CommandOptions = {
  name: string;
  showErrorDialog: boolean;
  failureMessage: string | ((error: unknown) => string);
  onStart: () => void;
  onSuccess: () => void;
  onFailure: (error: unknown) => void;
  onEnd: () => void;
};

class Command_<T> {
  private name: string;
  private failureMessage?: string | ((error: unknown) => string);
  private showErrorDialog?: boolean;
  private _onStart?: () => void;
  private _onSuccess?: () => void;
  private _onFailure?: (error: unknown) => void;
  private _onEnd?: () => void;
  constructor(private runnable: () => T, options: Partial<CommandOptions> = {}) {
    const callee = callsites().at(0);
    const caller = callsites().at(1);
    if (caller?.getFileName() !== callee?.getFileName()) {
      throw new Error("Command_ cannot be instantiated directly; use makeCommand instead.");
    }
    this.name = options.name || this.runnable.name || "<anonymous>";
    this.showErrorDialog = options.showErrorDialog;
    this.failureMessage = options.failureMessage;
    this._onStart = options.onStart;
    this._onSuccess = options.onSuccess;
    this._onFailure = options.onFailure;
    this._onEnd = options.onEnd;
  }

  build() {
    const callback = () => {
      this.onStart();
      try {
        const value = this.runnable();
        this.onSuccess();
        return { success: true as const, value };
      }
      catch (error) {
        this.onFailure(error);
        return { success: false as const, error };
      }
      finally {
        this.onEnd();
      }
    };
    Object.defineProperty(callback, "name", { value: this.name });
    return callback;
  }

  // Lifecycle methods
  onStart() {
    const activeUser = Session.getActiveUser().getEmail();
    const effectiveUser = Session.getEffectiveUser().getEmail();
    logger.info(`Executing command "${this.name}" for "${activeUser}" as "${effectiveUser}".`);
    if (typeof this._onStart == "function") {
      this._onStart();
    }
  }

  onSuccess() {
    logger.info(`Command "${this.name}" completed successfully (took ${ms(time.elapsed())}).`);
    if (typeof this._onSuccess == "function") {
      this._onSuccess();
    }
  }

  onFailure(error: unknown) {
    logger.error(error);
    logger.flush(); // Log the error
    if (typeof this._onFailure == "function") {
      this._onFailure(error);
    }
    if (!this.showErrorDialog) {
      return;
    }
    const failureMessage = typeof this.failureMessage == "function"
      ? this.failureMessage(error)
      : this.failureMessage;
    const ui = getUi_();
    if (ui) {
      if (error instanceof Error) {
        const errorName = error.name ?? error.constructor.name ?? "Error";
        const errorMessage = errorName + (error.message ? ": " + error.message : "");
        if (error.stack) {
          ui.alert(failureMessage || errorName, toString_(error), ui.ButtonSet.OK);
        }
        else {
          ui.alert(failureMessage || errorMessage, ui.ButtonSet.OK);
        }
      }
      else {
        if (failureMessage) {
          ui.alert(failureMessage, toString_(error), ui.ButtonSet.OK);
        }
        else {
          ui.alert(toString_(error), ui.ButtonSet.OK);
        }
      }
    }
  }

  onEnd() {
    logger.flush();
    if (typeof this._onEnd == "function") {
      this._onEnd();
    }
  }
}

class Command {
  static run<T>(runnable: () => T, options: Partial<CommandOptions> = {}) {
    return new Command_(runnable, options).build().call(null);
  }
}
