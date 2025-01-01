declare global {
  const _: import("lodash").LoDashStatic
  const R: typeof import("node_modules/types-ramda/es/index")
  const luxon: typeof import("luxon")
  const DateTime: typeof luxon.DateTime
  const validator: typeof import("validator")
  const Zod: typeof import("node_modules/zod/lib/index")
  const z: typeof Zod.z
}

export { }
