declare global {
  const _: import("lodash").LoDashStatic;
  const f: import("lodash/fp").LoDashFp;
  const R: typeof import("node_modules/types-ramda/es/index");
  const ms: typeof import("ms");
  const luxon: typeof import("luxon");
  const DateTime: typeof import("luxon").DateTime;
  const Duration: typeof import("luxon").Duration;
  const stringify: (any: unknown) => string;
  const callsites: typeof import("node_modules/callsites/index").default;
  const flatted: typeof import("node_modules/flatted/types/index");
  const zod: typeof import("node_modules/zod/lib/index");
  const z: typeof import("node_modules/zod/lib/index").z;
  const htmlparser2: typeof import("node_modules/htmlparser2/dist/esm/index");
  const cssSelect: typeof import("node_modules/css-select/lib/index");
  const validator: typeof import("validator");

  // Types
  type DateTime = import("luxon").DateTime;
  type Duration = import("luxon").Duration;
  namespace z {
    type infer<T> = import("node_modules/zod/lib/index").infer<T>;
  }
}

export { };
