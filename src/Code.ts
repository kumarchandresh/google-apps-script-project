function myFunction() {
  new Command(function myFunction_() {
    logger.log("Starting at: " + DateTime.now().toISO())
    logger.log("locale: en-US: " + validator.isLocale("en-US"))
    const greet = R.replace("{name}", R.__, "Hello, {name}.")
    const getName = R.prop("name")
    const data = { name: "world" }
    logger.debug(z.string().safeParse(1).error)
    logger.log(new TypeError("I'm a woman"))
    logger.log([callsites()[0].getFileName(), callsites()[0].getLineNumber()].join(":"))
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const person = { name: "John Doe" } as any
    person.self = person
    logger.warn(Flatted.stringify(person))
    logger.error(_stringify(Flatted.parse(Flatted.stringify(person))))
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const arr = [] as any[]
    arr[0] = arr
    arr[1] = person
    person.src = arr
    logger.log(_stringify(arr))
    for (const i of range(2)) {
      if (i) {
        logger.error(_.upperCase("Goodbye, world."))
      }
      else {
        logger.log(greet(getName(data)))
      }
    }
    const html = `
  <html>
    <body>
      <a href="https://example.com">Example Link</a>
      <table>
        <tr>
          <td>Cell 1</td>
          <td>Cell 2</td>
        </tr>
      </table>
    </body>
  </html>
`

    // Parse the HTML into a DOM-like structure
    const document = htmlparser2.parseDocument(html)

    // Select elements using CSS selectors
    const link = cssSelect.selectOne("a", document) // Select the first <a> element
    const tableCells = cssSelect.selectAll("table td", document) // Select all <td> elements in the <table>

    // Access properties of the selected elements
    if (link) {
      logger.log("Link text: " + link.children[0].data) // Example Link
      logger.log("Link href: " + link.attribs.href) // https://example.com
    }

    tableCells.forEach((cell, index) => {
      logger.log(`Cell ${index + 1}: ` + cell.children[0].data) // Cell 1, Cell 2
    })
  })
    .withName(myFunction.name)
    .withFailureMessage("Uh, oh!")
    .run()
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

function brokenSum(...args: number[]) {
  return args.reduce((sum, n, i) => {
    if (i === 2) {
      throw new TypeError("Cannot add more than two numbers")
    }
    return sum + n
  }, 0)
}

function addOneTwo() {
  return new Command(() => brokenSum(1, 2))
    .withName(addOneTwo.name)
    .withFailureMessage("Couldn't do 1 + 2")
    .run()
}

function addOneTwoThree() {
  return new Command(() => brokenSum(1, 2, 3))
    .withName(addOneTwoThree.name)
    .withFailureMessage("Couldn't do 1 + 2 + 3")
    .run()
}

function onOpen() {
  _getUi()
    ?.createMenu("[AppsScript]")
    .addItem("1 + 2", addOneTwo.name)
    .addItem("1 + 2 + 3", addOneTwoThree.name)
    .addToUi()
}
