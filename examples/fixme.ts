import { readFileSync } from "fs"
import { includes as _includes } from "lodash"

// Provides dev-time type structures for  `danger` - doesn't affect runtime.
import { DangerDSLType } from "../node_modules/danger/distribution/dsl/DangerDSL"
declare var danger: DangerDSLType
export declare function message(message: string): void
export declare function warn(message: string): void
export declare function fail(message: string): void
export declare function markdown(message: string): void


const getStart = pattern => (_includes(["a", "e", "i", "o", "u"], pattern[0].toLowerCase()) ? "an" : "a")

/**
 * Have danger fail if she detects a FIXME annotation inside your code.
 */
export default function fixme(patterns = ["FIXME"]) {
  const newOrModifiedFiles = danger.git.modified_files.concat(danger.git.created_files)

  for (const file of newOrModifiedFiles) {
    const content = readFileSync(file).toString()
    const match = patterns.find(p => _includes(content, p))

    if (match) {
      fail(`${getStart(match)} \`${match}\` was left in: ${file}`)
    }
  }
}
