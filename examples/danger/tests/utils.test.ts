// https://github.com/elementsinteractive/danger/blob/main/src/common/util.test.ts
import { isChangelogModified, isDocumentationModified } from './util'

describe('util', () => {
  describe('isChangelogModified', () => {
    it.each([
      [['index.ts', 'docs/index.md', 'changelog.md'], true],
      [['build.gradle', 'README.md', 'CHANGELOG.md'], true],
      [['Dockerfile'], false],
      [[], false],
    ])(
      'given a list of modified files - when it contains changelog changes - then returns true, otherwise false',
      (modifiedFiles: string[], expected: boolean) => {
        expect(isChangelogModified(modifiedFiles)).toEqual(expected)
      },
    )
  })

  describe('isDocumentationModified', () => {
    it.each([
      [['index.ts', 'documentation/index.md', 'changelog.md'], true],
      [['Dockerfile'], false],
      [[], false],
    ])(
      'given a list of modified files - when it contains documentation changes - then returns true, otherwise false',
      (modifiedFiles: string[], expected: boolean) => {
        expect(isDocumentationModified(modifiedFiles)).toEqual(expected)
      },
    )
  })
})
