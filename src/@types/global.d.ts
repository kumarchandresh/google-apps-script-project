declare global {
  const _: import("lodash").LoDashStatic
  const R: typeof import("node_modules/types-ramda/es/index")
  const luxon: typeof import("luxon")
  const DateTime: typeof luxon.DateTime
  const ms: typeof import("ms")
  const validator: typeof import("validator")
  const Zod: typeof import("node_modules/zod/lib/index")
  const z: typeof Zod.z
  const callsites: typeof import("node_modules/callsites/index").default
  const Flatted: typeof import("node_modules/flatted/types/index")
  const htmlparser2: typeof import("node_modules/htmlparser2/dist/esm/index")
  const cssSelect: typeof import("node_modules/css-select/lib/index")
  // types
  type DateTime = typeof luxon.DateTime
}

export { }
