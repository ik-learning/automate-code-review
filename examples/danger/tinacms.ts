// https://github.com/tinacms/tinacms/blob/5b736f43ddcb7d9d5d5e1ed7221d06f64f8e90dc/dangerfile.ts#L280

import { markdown, danger, warn, fail, message } from 'danger'
import * as fs from 'fs'
import * as path from 'path'

const LICENSE_HEADER: string[] = [
  `Copyright 2019 Forestry.io Inc`,
  `Licensed under the Apache License, Version 2.0 (the "License");`,
  `you may not use this file except in compliance with the License.`,
  `You may obtain a copy of the License at`,
  `http://www.apache.org/licenses/LICENSE-2.0`,
  `Unless required by applicable law or agreed to in writing, software`,
  `distributed under the License is distributed on an "AS IS" BASIS,`,
  `WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.`,
  `See the License for the specific language governing permissions and`,
  `limitations under the License.`,
]

runChecksOnPullRequest()

/**
 * An object representing a package in tinacms/tinacms.
 */
interface TinaPackage {
  /**
   * The path to the package in the repo.
   */
  path: string

  /**
   * The contents of it's `package.json`.
   */
  packageJson: {
    name: string
    scripts: {
      dev: string
      build: string
      watch: string
    }
    license: string
  }
}

/**
 * Executes all checks for the Pull Request.
 */
function runChecksOnPullRequest() {
  const allFiles = [
    ...danger.git.created_files,
    ...danger.git.deleted_files,
    ...danger.git.modified_files,
  ]

  // Files
  allFiles.filter(fileNeedsLicense).forEach(checkFileForLicenseHeader)

  // Packages
  let modifiedPackages = getModifiedPackages(allFiles)

  modifiedPackages.forEach(warnIfMissingTestChanges)
  modifiedPackages.forEach(checkForNpmScripts)
  modifiedPackages.forEach(checkForLicense)

  listTouchedPackages(modifiedPackages)

  // Github Actions Workflows
  listTouchedWorkflows(allFiles)

  // Pull Request
  if (modifiedPackages.length > 0) {
    checkForMilestone()
  }

  checkForDocsChanges(allFiles)
}

interface Consumers {
  [key: string]: Dep[]
}

interface Dep {
  file: string
  details: string
}
async function checkForDocsChanges(files: string[]) {
  files = files.map(file => `/${file}`)
  const consumerRequest = await fetch('https://tinacms.org/consumers.json')
  const consumers: Consumers = await consumerRequest.json()

  const potentialDocChanges: [string, Dep][] = []
  Object.keys(consumers).forEach(docFile => {
    const dependencies = consumers[docFile]

    dependencies.forEach(dep => {
      if (files.includes(dep.file)) {
        potentialDocChanges.push([docFile, dep])
      }
    })
  })

  if (potentialDocChanges.length > 0) {
    warnUpdateDoc(potentialDocChanges)
  }
}

const warnUpdateDoc = (changes: [string, Dep][]) =>
  warn(`
Update Docs for tinacms#${danger.github.pr.number}


<a href="https://github.com/tinacms/tinacms-site/issues/new?&title=${updateDocTitle(
    changes
  )}&body=${updateDocBody(changes)}">Create Issue</a>
`)

const updateDocTitle = (chagnes: [string, Dep][]) =>
  encodeURIComponent(`Update Docs for tinacms#${danger.github.pr.number}`)

const updateDocBody = (changes: [string, Dep][]) =>
  encodeURIComponent(`
A [pull request](${danger.github.pr.html_url
    }) in tinacms may require documentation updates.

The following files may need to be updated:

| File | Reason |
| --- | --- |
${changes.map(([file, dep]) => `| ${fileLink(file)} | ${dep.details} |`)}
`)

const fileLink = (file: string) => {
  const filename = file.split('/').pop()

  return `[${filename}](https://github.com/tinacms/tinacms-site/tree/master/${file})`
}

/**
 * Any PR that modifies one of the packages should be attached to a milestone.
 */
function checkForMilestone() {
  // @ts-ignore
  if (danger.github.pr.milestone) {
    // @ts-ignore
    let milestone: Milestone = danger.github.pr.milestone
    message(
      // @ts-ignore
      `You can expect the changes in this PR to be published on ${formatDate(
        new Date(milestone.due_on)
      )}`
    )
  } else {
    warn(`@tinacms/dev please add to a Milestone before merging `)
  }
}

// This is missing from the `danger` types
interface Milestone {
  due_on: string
}

function formatDate(date: Date) {
  const day = date.getDay()
  const month = date.getMonth() + 1
  const year = date.getFullYear()
  return `${year}-${month}-${day}`
}

/**
 * Example Output:
 * ```
 * ### Modified Github Workflows
 *
 * * .github/workflows/danger.yml
 * ```
 */
function listTouchedWorkflows(allFiles: string[]) {
  let touchedWorkflows = allFiles.filter(filepath =>
    filepath.startsWith('.github/workflows/')
  )
  if (touchedWorkflows.length === 0) return

  message(`### Modified Github Workflows

* ${touchedWorkflows.join('\n* ')}`)
}

/**
 *
 */
function checkForNpmScripts({ packageJson }: TinaPackage) {
  if (packageJson.name === '@tinacms/scripts') {
    return
  }
  let scripts = packageJson.scripts || {}

  let requiredScripts: (keyof TinaPackage['packageJson']['scripts'])[] = [
    'dev',
    'build',
    'watch',
  ]

  requiredScripts.forEach(scriptName => {
    if (!scripts[scriptName]) {
      fail(`${packageJson.name} is missing a required script: ${scriptName}`)
    }
  })
}

/**
 *
 */
function checkForLicense({ packageJson }: TinaPackage) {
  let license = 'Apache-2.0'
  if (packageJson.license !== license) {
    fail(`${packageJson.name} package.json is missing the license: ${license}`)
  }
}

/**
 *
 */
function fileNeedsLicense(filepath: string) {
  return new RegExp(/\.(js|tsx?)$/).test(filepath)
}

/**
 *
 */
function checkFileForLicenseHeader(filepath: string) {
  try {
    let content = fs.readFileSync(path.resolve(`./${filepath}`), {
      encoding: 'utf8',
    })

    if (isMissingHeader(content)) {
      fail(`${filepath} is missing the license header`)
    }
  } catch {
    // The file was deleted. That's okay.
  }
}

function isMissingHeader(content: string) {
  for (const line of LICENSE_HEADER) {
    if (!content.includes(line)) {
      return true
    }
  }
}

/**
 * Example Output:
 * ```
 * ### Modified Packages
 *
 * * `@tinacms/fields`
 * * `react-tinacms`
 * ```
 */
function listTouchedPackages(modifiedPackages: TinaPackage[]) {
  if (!modifiedPackages.length) return
  markdown(`### Modified Packages

The following packages were modified by this pull request:

* ${modifiedPackages
      .map(({ packageJson }) => `\`${packageJson.name}\``)
      .join('\n* ')}`)
}

/**
 * Example Output:
 *
 * ```
 * `@tinacms/core` may need new tests.
 * ```
 */
function warnIfMissingTestChanges({ path, packageJson }: TinaPackage) {
  const hasTestChanges = !!danger.git.modified_files.find(p =>
    p.match(/.*.test.tsx?/)
  )
  if (!hasTestChanges) {
    warn(`\`${packageJson.name}\` may need new tests.`)
  }
}

/**
 * Lists all packages modified by this PR.
 */
function getModifiedPackages(allFiles: string[]) {
  let packageList: TinaPackage[] = []
  let paths = new Set(
    allFiles
      .filter(filepath => filepath.startsWith('packages/'))
      .filter(filepath => !filepath.startsWith('packages/demo'))
      .filter(filepath => !filepath.startsWith('packages/@testing'))
      /**
       * These are all the old directory groups.
       * For some reason they still exist in Github, even
       * though they can't be found. This is causing the danger
       * build to fail. Technology, amirite?
       */
      .filter(filepath => !filepath.startsWith('packages/api/'))
      .filter(filepath => !filepath.startsWith('packages/next/'))
      .filter(filepath => !filepath.startsWith('packages/react/'))
      .filter(filepath => !filepath.startsWith('packages/gatsby/'))
      .filter(filepath => !filepath.startsWith('packages/core/'))
      .map(filepath => {
        if (filepath.startsWith('packages/@tinacms')) {
          return filepath
            .split('/')
            .slice(0, 3)
            .join('/')
        }
        return filepath
          .split('/')
          .slice(0, 2)
          .join('/')
      })
  )

  paths.forEach(path => {
    try {
      let packageJson = require(`./${path}/package.json`)

      packageList.push({
        path,
        packageJson,
      })
    } catch (e) {
      warn(`Could not find package: ${path}`)
    }
  })
  return packageList
}
