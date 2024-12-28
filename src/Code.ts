function myFunction() {
  for (const i of range(2)) {
    if (i) {
      throw new Error("Goodbye, world.")
    }
    Logger.log("Hello, world.")
  }
}

function* range(min: number, max?: number, step = 1) {
  if (arguments.length == 1) {
    max = min
    min = 0
  }
  while (typeof max != "number" ? true : min < max) {
    yield min
    min += typeof step != "number" ? 1 : step
  }
}
