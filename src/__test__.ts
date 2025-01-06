function myFunction() {
  return makeCommand(function myFunction_() {
    (() => {
      const fruits = ["apple", "banana", "kiwi", "oranges"];
      logger.log(_.map(fruits, _.startCase));
    })();
    (() => {
      const people = [{ name: "Jack" }, { name: "Jill" }];
      const getNames = fp.pluck("name");
      const sayHello = fp.map(name => `Hi ${name}`);
      logger.log(sayHello(getNames(people)));
    })();
    (() => {
      const people = [{ name: "John" }, { name: "Jane" }];
      const getNames = R.pluck("name");
      const sayHello = R.map(name => `Hello ${name}`);
      logger.log(sayHello(getNames(people)));
    })();
    (() => {
      const now = DateTime.now();
      logger.log("toISO():", now.toISO());
      logger.log("toSQL():", now.toSQL());
      logger.log("toRFC2822():", now.toRFC2822());
      logger.log("toHTTP():", now.toHTTP());
    })();
    (() => {
      logger.log('isEmail("foo@bar.com"):', validator.isEmail("foo@bar.com"));
      logger.log('isURL("google.com"):', validator.isURL("google.com"));
      logger.log('isAscii("\u{1F449}"):', validator.isAscii("\u{1F449}"));
    })();
    (() => {
      logger.log(z.number().parse(0));
      logger.log(z.string().parse("Mango"));
      logger.log(z.string().safeParse(1));
    })();
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
`;
      const document = htmlparser2.parseDocument(html);
      const link = cssSelect.selectOne("a", document);
      const tableCells = cssSelect.selectAll("table td", document);
      if (link) {
        logger.log("Link text:", z.string().parse(link.children[0].data));
        logger.log("Link href:", z.string().parse(link.attribs.href));
      }
      tableCells.forEach((cell, index) => {
        logger.log(`Cell ${index + 1}:`, z.string().parse(cell.children[0].data));
      });
    })();
    (() => {
      const a = [{}];
      Object.assign(a[0], { a });
      a.push(a);
      logger.log(Flatted.stringify(a));
      logger.log(a);
    })();
  })();
}

function onOpen() {
  makeCommand(function onOpen_() {
    const ui = getUi();
    if (ui) {
      ui.createMenu("[Apps script]")
        .addItem("myFunction", myFunction.name)
        .addToUi();
    }
  })();
}
