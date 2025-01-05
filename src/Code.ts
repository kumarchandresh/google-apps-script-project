function myFunction() {
  // lodash
  (() => {
    const fruits = ["apple", "banana", "kiwi", "oranges"]
    Logger.log(_.map(fruits, _.startCase))
  })();
  // lodash/fp
  (() => {
    const people = [
      { name: "Jack" },
      { name: "Jill" },
    ]
    const getNames = fp.pluck("name")
    const sayHello = fp.map(name => `Hi ${name}`)
    Logger.log(sayHello(getNames(people)))
  })();
  // Ramda
  (() => {
    const people = [
      { name: "John" },
      { name: "Jane" },
    ]
    const getNames = R.pluck("name")
    const sayHello = R.map(name => `Hello ${name}`)
    Logger.log(sayHello(getNames(people)))
  })();
  // Luxon
  (() => {
    const now = DateTime.now()
    Logger.log("toISO(): " + now.toISO())
    Logger.log("toSQL(): " + now.toSQL())
    Logger.log("toRFC2822(): " + now.toRFC2822())
    Logger.log("toHTTP(): " + now.toHTTP())
  })();
  // Validator
  (() => {
    Logger.log('isEmail("foo@bar.com"): ' + validator.isEmail("foo@bar.com"))
    Logger.log('isURL("google.com"): ' + validator.isURL("google.com"))
    Logger.log('isAscii("👉"): ' + validator.isAscii("👉"))
  })();
  // Zod
  (() => {
    Logger.log(z.number().parse(0))
    Logger.log(z.string().parse("Mango"))
    Logger.log(z.string().safeParse(1))
  })();
  // htmlparser2 and css-select
  (() => {
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
      Logger.log("Link text: " + z.string().parse(link.children[0].data)) // Example Link
      Logger.log("Link href: " + z.string().parse(link.attribs.href)) // https://example.com
    }
    tableCells.forEach((cell, index) => {
      Logger.log(`Cell ${index + 1}: ` + z.string().parse(cell.children[0].data)) // Cell 1, Cell 2
    })
  })();
  // Flatted
  (() => {
    const a = [{}]
    Object.assign(a[0], { a }) // a[0].a = a
    a.push(a)
    Logger.log(Flatted.stringify(a)) // [["1","0"],{"a":"0"}]
  })()
}
