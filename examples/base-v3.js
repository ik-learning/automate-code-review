import { danger } from "danger"

// danger.git.match = chainsmoker({
//   created: danger.git.created_files,
//   modified: danger.git.modified_files,
//   createdOrModified: danger.git.modified_files.concat(danger.git.created_files),
//   deleted: danger.git.deleted_files,
// })

const documentation = danger.git.match(
  '**/*.md',
  'lib/all-badge-examples.js',
  'frontend/components/usage.js'
)
const packageJson = danger.git.match('package.json')
const packageLock = danger.git.match('package-lock.json')
const helpers = danger.git.match('lib/**/*.js', '!**.spec.js')
const helperTests = danger.git.match('lib/**/*.spec.js')

// This is `true` whenever there are matches in the corresponding path array.
if (documentation.createdOrModified) {
  message('We :heart: our [documentarians](http://www.writethedocs.org/)!')
}

if (packageJson.modified && !packageLock.modified) {
  warn('This PR modified package.json, but not package-lock.json')
}

if (helpers.created && !helperTests.created) {
  warn('This PR added helper modules in lib/ but not accompanying tests.')
} else if (helpers.createdOrModified && !helperTests.createdOrModified) {
  warn('This PR modified helper modules in lib/ but not accompanying tests.')
}
