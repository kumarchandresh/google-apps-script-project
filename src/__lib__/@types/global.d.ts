declare global {
  const _: import("lodash").LoDashStatic
  const fp: import("lodash/fp").LoDashFp
  const R: typeof import("node_modules/types-ramda/es/index")
  const validator: typeof import("validator")
  const luxon: typeof import("luxon")
  const DateTime: typeof import("luxon").DateTime
  const Zod: typeof import("node_modules/zod/lib/index")
  const z: typeof import("node_modules/zod/lib/index").z
  const htmlparser2: typeof import("node_modules/htmlparser2/dist/esm/index")
  const cssSelect: typeof import("node_modules/css-select/lib/index")
  const Flatted: typeof import("node_modules/flatted/types/index")
}

export { }
