/**
 * Quote string depending on which quotes are used within the string. Good for
 * readable logs.
 */
function quoteString(str: string) {
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
function stringify<T>(any: T): string {
  let counter = 0
  const refs = new Map()
  return (function _stringify<_T>(any: _T): string {
    if (_.isString(any)) {
      return quoteString(any)
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
        return _stringify(it)
      }).join(",") + "]"
    }
    else if (any instanceof Error) {
      const name = any.name ?? any.constructor.name ?? "Error"
      const message = any.message ?? ""
      const stack = any.stack ?? ""
      return _stringify({ name, message, stack: stack.split(/\r?\n/) })
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
          return `${quoteString(key)}:[Circular *${count}]`
        }
        return `${quoteString(key)}:${_stringify(value)}`
      }).join(",") + "}"
    }
    else {
      return "" + any
    }
  })(any)
}

/**
 * Convert everything into strings.
 */
function toString<T>(any: T) {
  if (_.isString(any)) {
    return any
  }
  else if (_.isError(any)) {
    return any.stack || any.toString()
  }
  else {
    return stringify(any)
  }
}

/**
 * Check if an object has circular references.
*/
function isCyclic<T>(object: T) {
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
