// Custom modifiers for people submitting PRs to be able to say "skip this"
const trivialPR = bodyAndTitle.includes("trivial")
const acceptedNoTests = bodyAndTitle.includes("skip new tests")

const typescriptOnly = (file: string) => includes(file, ".ts")
const filesOnly = (file: string) => fs.existsSync(file) && fs.lstatSync(file).isFile()

// Custom subsets of known files
const modifiedAppFiles = modified.filter(p => includes(p, "lib/")).filter(p => filesOnly(p) && typescriptOnly(p))

// Modified or Created can be treated the same a lot of the time
const touchedFiles = modified.concat(danger.git.created_files).filter(p => filesOnly(p))

const touchedAppOnlyFiles = touchedFiles.filter(
  p => includes(p, "src/lib/") && !includes(p, "__tests__") && typescriptOnly(p)
)

const touchedComponents = touchedFiles.filter(p => includes(p, "src/lib/components") && !includes(p, "__tests__"))

// Rules
// When there are app-changes and it's not a PR marked as trivial, expect
// there to be CHANGELOG changes.
const changelogChanges = includes(modified, "CHANGELOG.md")
if (modifiedAppFiles.length > 0 && !trivialPR && !changelogChanges) {
  fail("No CHANGELOG added.")
}

// Check that every file touched has a corresponding test file
const correspondingTestsForAppFiles = touchedAppOnlyFiles.map(f => {
  const newPath = path.dirname(f)
  const name = path.basename(f).replace(".ts", "-tests.ts")
  return `${newPath}/__tests__/${name}`
})

// New app files should get new test files
// Allow warning instead of failing if you say "Skip New Tests" inside the body, make it explicit.
const testFilesThatDontExist = correspondingTestsForAppFiles
  .filter(f => !f.includes("Index-tests.tsx")) // skip indexes
  .filter(f => !f.includes("types-tests.ts")) // skip type definitions
  .filter(f => !f.includes("__stories__")) // skip stories
  .filter(f => !f.includes("AppRegistry")) // skip registry, kinda untestable
  .filter(f => !f.includes("Routes")) // skip routes, kinda untestable
  .filter(f => !f.includes("NativeModules")) // skip modules that are native, they are untestable
  .filter(f => !f.includes("lib/relay/")) // skip modules that are native, they are untestable
  .filter(f => !f.includes("Storybooks/")) // skip modules that are native, they are untestable
  .filter(f => !fs.existsSync(f))

if (testFilesThatDontExist.length > 0) {
  const callout = acceptedNoTests ? warn : fail
  const output = `Missing Test Files:
${testFilesThatDontExist.map(f => `- \`${f}\``).join("\n")}
If these files are supposed to not exist, please update your PR body to include "Skip New Tests".`
  callout(output)
}
