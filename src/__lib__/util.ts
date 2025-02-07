const StringUtil = (() => {
  function normalizeSpaces<T>(str: T) {
    return _.isString(str) ? str.trim().replace(/\s+/g, " ") : str;
  }
  function normalizeWith(transform: (str: string) => string) {
    return <T>(str: T) => _.isString(str) ? transform(normalizeSpaces(str)) : str;
  }
  function isBlanks(str: unknown) {
    return _.isString(str) ? R.isEmpty(normalizeSpaces(str)) : R.isNil(str);
  }
  function isNotBlanks(str: unknown) {
    return _.isString(str) ? R.isNotEmpty(normalizeSpaces(str)) : R.isNotNil(str);
  }
  function equalsIgnoreCase(a: string, b: string) {
    a = normalizeSpaces(a).toLowerCase();
    b = normalizeSpaces(b).toLowerCase();
    return a === b;
  }
  function matchesIgnoreCase(a: string, b: string) {
    a = normalizeSpaces(a).toLowerCase();
    b = normalizeSpaces(b).toLowerCase();
    return !(a && b) ? a === b : (a.includes(b) || b.includes(a));
  }
  return Object.freeze({
    normalizeSpaces,
    normalizeWith,
    isBlanks,
    isNotBlanks,
    equalsIgnoreCase,
    matchesIgnoreCase,
  });
})();

const SheetUtil = (() => {
  function columnNumberToLetter(column: number) {
    if (column < 1) {
      throw new Error("Column number must be greater than or equal to 1");
    }
    const chars = [];
    while (column > 0) {
      const remainder = (column - 1) % 26;
      chars.push(String.fromCharCode(65 + remainder));
      column = Math.floor((column - 1) / 26);
    }
    return chars.reverse().join("");
  }
  function getA1Notation(row: number, column: number): string;
  function getA1Notation(row: number, column: number, numRows: number, numCols: number): string;
  function getA1Notation(row: number, column: number, numRows = 1, numCols = 1) {
    if (row < 1) {
      throw new Error("Row number must be greater than or equal to 1");
    }
    if (numRows < 1) {
      throw new Error("Number of rows must be greater than or equal to 1");
    }
    if (numCols < 1) {
      throw new Error("Number of columns should be greater than or equal to 1");
    }
    const a1Notation = (row_: number, col_: number) => columnNumberToLetter(col_) + row_;
    return numRows === 1 && numCols === 1
      ? a1Notation(row, column)
      : a1Notation(row, column) + ":" + a1Notation(row + numRows - 1, column + numCols - 1);
  }
  function getAbsoluteA1Notation(row: number, column: number): string;
  function getAbsoluteA1Notation(row: number, column: number, numRows: number, numCols: number): string;
  function getAbsoluteA1Notation(row: number, column: number, numRows = 1, numCols = 1) {
    if (row < 1) {
      throw new Error("Row number must be greater than or equal to 1");
    }
    if (numRows < 1) {
      throw new Error("Number of rows must be greater than or equal to 1");
    }
    if (numCols < 1) {
      throw new Error("Number of columns must be greater than or equal to 1");
    }
    const absoluteA1Notation = (row_: number, col_: number) => "$" + columnNumberToLetter(col_) + "$" + row_;
    return numRows === 1 && numCols === 1
      ? absoluteA1Notation(row, column)
      : absoluteA1Notation(row, column) + ":" + absoluteA1Notation(row + numRows - 1, column + numCols - 1);
  }
  return Object.freeze({
    getA1Notation,
    getAbsoluteA1Notation,
  });
})();
