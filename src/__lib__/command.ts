function getUi() {
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
}

class Command_<T> {
  private name: string;
  private message?: string | ((error: unknown) => string);
  private noErrorDialog?: boolean;
  private _onStart?: () => void;
  private _onSuccess?: () => void;
  private _onFailure?: (error: unknown) => void;
  private _onEnd?: () => void;
  constructor(private runnable: () => T, options: {
    readonly name?: string;
    readonly noErrorDialog?: boolean;
    readonly message?: string | ((error: unknown) => string);
    readonly onStart?: () => void;
    readonly onSuccess?: () => void;
    readonly onFailure?: (error: unknown) => void;
    readonly onEnd?: () => void;
  } = {}) {
    const callee = callsites().at(0);
    const caller = callsites().at(1);
    if (caller?.getFileName() !== callee?.getFileName()) {
      throw new Error("Command_ cannot be instantiated");
    }
    this.name = options.name || this.runnable.name || "<anonymous>";
    this.noErrorDialog = options.noErrorDialog;
    this.message = options.message;
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
    logger.info(`Command "${this.name}" completed successfully.`);
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
    if (this.noErrorDialog) {
      return;
    }
    const message = typeof this.message == "function" ? this.message(error) : this.message;
    const ui = getUi();
    if (ui) {
      if (error instanceof Error) {
        if (error.stack) {
          ui.alert(message || error.toString(), error.stack, ui.ButtonSet.OK);
        }
        else {
          ui.alert(message || error.toString(), ui.ButtonSet.OK);
        }
      }
      else {
        if (message) {
          ui.alert(message, stringify(error), ui.ButtonSet.OK);
        }
        else {
          ui.alert(stringify(error), ui.ButtonSet.OK);
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

function makeCommand<T>(runnable: () => T, options: {
  readonly name?: string;
  readonly noErrorDialog?: boolean;
  readonly message?: string | ((error: unknown) => string);
  readonly onStart?: () => void;
  readonly onSuccess?: () => void;
  readonly onFailure?: (error: unknown) => void;
  readonly onEnd?: () => void;
} = {}) {
  return new Command_(runnable, options).build();
}
