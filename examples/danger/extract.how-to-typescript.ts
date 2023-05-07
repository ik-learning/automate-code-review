// https://github.com/danger/danger-js/issues/1109
export { };
// DangerJS has a weird compile/runtime environment, but this is a stable detail!
// Briefly documented here:
// https://github.com/danger/danger-js/blob/master/docs/usage/extending-danger.html.md#writing-your-plugin

import { DangerDSLType } from "../../../node_modules/danger/distribution/dsl/DangerDSL";

// Provides dev-time type structures for  `danger` - doesn't affect runtime.
declare global {
  let danger: DangerDSLType;
  function warn(message: string, file?: string, line?: number): void;
  function fail(message: string, file?: string, line?: number): void;
  function markdown(message: string, file?: string, line?: number): void;
}
