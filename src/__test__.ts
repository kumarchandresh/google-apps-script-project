function myFunction() {
  return Command.run(function myFunction_() {
    (() => {
      const fruits = ["apple", "banana", "kiwi", "oranges"];
      logger.info(_.map(fruits, _.startCase));
    })();
    (() => {
      const people = [{ name: "Jack" }, { name: "Jill" }];
      const getNames = f.pluck("name");
      const sayHello = f.map(name => `Hi ${name}`);
      logger.info(sayHello(getNames(people)));
    })();
    (() => {
      const people = [{ name: "John" }, { name: "Jane" }];
      const getNames = R.pluck("name");
      const sayHello = R.map(name => `Hello ${name}`);
      logger.info(sayHello(getNames(people)));
    })();
    (() => {
      const now = DateTime.now();
      logger.info("toISO():", now.toISO());
      logger.info("toSQL():", now.toSQL());
      logger.info("toRFC2822():", now.toRFC2822());
      logger.info("toHTTP():", now.toHTTP());
    })();
    (() => {
      logger.info('isEmail("foo@bar.com"):', validator.isEmail("foo@bar.com"));
      logger.info('isURL("google.com"):', validator.isURL("google.com"));
      logger.info('isAscii("\u{1F449}"):', validator.isAscii("\u{1F449}"));
    })();
    (() => {
      logger.debug(z.number().parse(0));
      logger.debug(z.string().parse("Mango"));
      logger.warn(z.string().safeParse(1));
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
      logger.log(pretty.format(a));
      logger.log(flatted.stringify(a));
      logger.log(a);
    })();
    (() => {
      const str = "   A  quick   brown fox jumps  over     the lazy dog.   ";
      logger.log(StringUtil.normalizeSpaces(str));
      logger.log(StringUtil.normalizeWith(R.toLower)(str));
      logger.log(StringUtil.normalizeWith(R.toUpper)(str));
      logger.log(StringUtil.isBlanks(str), StringUtil.isBlanks(""));
      logger.log(StringUtil.isNotBlanks(str), StringUtil.isNotBlanks(""));
      logger.log(StringUtil.equalsIgnoreCase(" AbC", "aBc "), StringUtil.equalsIgnoreCase(" AbC", "xYz "));
      logger.log(
        StringUtil.matchesIgnoreCase(" cooler ", "cool"),
        StringUtil.matchesIgnoreCase("lemon ", " lemonade"),
        StringUtil.matchesIgnoreCase("alpha", "beta"),
      );
    })();
    z.string().parse(0);
  }, {
    showErrorDialog: true,
  });
}

function onOpen() {
  Command.run(function onOpen_() {
    const ui = getUi_();
    if (ui) {
      ui.createMenu("[Apps script]")
        .addItem("myFunction", myFunction.name)
        .addToUi();
    }
  });
}
