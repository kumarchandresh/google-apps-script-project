function myFunction() {
  Logger.log("Starting at: " + DateTime.now().toISO())
  const greet = R.replace("{name}", R.__, "Hello, {name}.")
  const getName = R.prop("name")
  const data = { name: "world" }
  for (const i of range(2)) {
    if (i) {
      throw new Error(_.upperCase("Goodbye, world."))
    }
    Logger.log(greet(getName(data)))
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
