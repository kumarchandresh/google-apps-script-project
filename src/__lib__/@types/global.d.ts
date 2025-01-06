declare global {
  // values
  const _: import("lodash").LoDashStatic;
  const fp: import("lodash/fp").LoDashFp;
  const R: typeof import("node_modules/types-ramda/es/index");
  const validator: typeof import("validator");
  const luxon: typeof import("luxon");
  const DateTime: typeof import("luxon").DateTime;
  const Duration: typeof import("luxon").Duration;
  const Zod: typeof import("node_modules/zod/lib/index");
  const z: typeof import("node_modules/zod/lib/index").z;
  const htmlparser2: typeof import("node_modules/htmlparser2/dist/esm/index");
  const cssSelect: typeof import("node_modules/css-select/lib/index");
  const Flatted: typeof import("node_modules/flatted/types/index");
  const callsites: typeof import("node_modules/callsites/index").default;
  const util: typeof import("util");
  const ms: typeof import("ms");
  // types
  type DateTime = import("luxon").DateTime;
  type Duration = import("luxon").Duration;
  namespace z {
    type infer<T> = import("node_modules/zod/lib/index").infer<T>;
  }
}

export { };
