/**
 * Quote string depending on which quotes are used within the string. Good for
 * readable logs.
 */
function _quoteString(str: string) {
  if (str.includes('"') && str.includes("'") && str.includes("`")) {
    return `"${str.replace(/"/g, '\\"').replace(/'/g, "\\'").replace(/`/g, "\\`")}"`
  }
  else if (str.includes('"') && str.includes("'")) {
    return `\`${str}\``
  }
  else if (str.includes('"')) {
    return `'${str}'`
  }
  else {
    return `"${str}"`
  }
}

/**
 * Stringify anything.
 * NOTE: Result is not necessarily parsable, use JSON.stringify for that, or
 * Flatted.stringify if the object contains circular references.
 */
function _stringify<T>(any: T): string {
  let counter = 0
  const refs = new Map()
  return (function __stringify<_T>(any: _T): string {
    if (_.isString(any)) {
      return _quoteString(any)
    }
    else if (_.isNumber(any)) {
      return _.toString(any) // Lodash preserves "-0"
    }
    else if (_.isArrayLike(any)) {
      refs.set(any, 0)
      return "[" + Array.from(any).map((it) => {
        if (refs.has(it)) {
          let count = refs.get(it)
          if (!count) {
            count = ++counter
            refs.set(it, counter)
          }
          return `[Circular *${count}]`
        }
        return __stringify(it)
      }).join(",") + "]"
    }
    else if (any instanceof Error) {
      const name = any.name ?? any.constructor.name ?? "Error"
      const message = any.message ?? ""
      const stack = any.stack ?? ""
      return __stringify({ ...any, name, message, stack: _clearerStack(stack) })
    }
    else if (any && typeof any == "object") {
      refs.set(any, 0)
      return "{" + Object.entries(any).map(([key, value]) => {
        if (refs.has(value)) {
          let count = refs.get(value)
          if (!count) {
            count = ++counter
            refs.set(value, counter)
          }
          return `${_quoteString(key)}:[Circular *${count}]`
        }
        return `${_quoteString(key)}:${__stringify(value)}`
      }).join(",") + "}"
    }
    else {
      return "" + any
    }
  })(any)
}

function _clearerStack(stacktrace: string) {
  return stacktrace.split("\n").filter((ln) => {
    return !ln.includes("__GS_INTERNAL")                       // at __GS_INTERNAL_top_function_call__.gs:1:8
      && !ln.match(/at Command_?.(run|runnable|on\w+)/)        // at Command_.run (_lib/command:22:27)
      && !ln.match(/at Command_?.*\[as (runnable|callback)]/)  // at Command.myFunction [as callback] (_lib/command:82:83)
  }).join("\n")
}

/**
 * Convert everything into strings.
 */
function _toString<T>(any: T) {
  if (_.isString(any)) {
    return any
  }
  else if (_.isError(any)) {
    return any.stack ? _clearerStack(any.stack) : any.toString()
  }
  else {
    return _stringify(any)
  }
}

/**
 * Check if an object has circular references.
*/
function _isCyclic<T>(object: T) {
  const refs = new WeakSet()
  return (function detect<_T>(obj: _T) {
    if (obj && typeof obj == "object") {
      if (refs.has(obj)) {
        return true
      }
      refs.add(obj)
      for (const key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key) && detect(obj[key])) {
          return true
        }
      }
    }
    return false
  })(object)
}

/**
 * Gets the `Ui` object for if the script is bound, `null` otherwise.
 */
function _getUi() {
  try {
    return SpreadsheetApp.getUi()
  }
  catch (e) { /* silence */ }
  try {
    return DocumentApp.getUi()
  }
  catch (e) { /* silence */ }
  try {
    return SlidesApp.getUi()
  }
  catch (e) { /* silence */ }
  try {
    return FormApp.getUi()
  }
  catch (e) { /* silence */ }
  return null
}
