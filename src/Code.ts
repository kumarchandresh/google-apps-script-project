function myFunction() {
  logger.log("Starting at: " + DateTime.now().toISO())
  logger.log("locale: en-US: " + validator.isLocale("en-US"))
  const greet = R.replace("{name}", R.__, "Hello, {name}.")
  const getName = R.prop("name")
  const data = { name: "world" }
  Logger.log(z.string().safeParse(1))
  Logger.log([callsites()[0].getFileName(), callsites()[0].getLineNumber()].join(":"))
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const person = { name: "John Doe" } as any
  person.self = person
  logger.log(Flatted.stringify(person))
  logger.error(stringify(Flatted.parse(Flatted.stringify(person))))
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const arr = [] as any[]
  arr[0] = arr
  arr[1] = person
  person.src = arr
  logger.log(stringify(arr))
  for (const i of range(2)) {
    if (i) {
      logger.error(_.upperCase("Goodbye, world."))
    }
    else {
      logger.log(greet(getName(data)))
    }
  }
  logger.flush()
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
