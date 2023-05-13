const { Changelog } = require("../../src/models");
const { setUpTestScenarioObject, setUpTestScenario,
  dangerFileMatch, setupDanger } = require("../fixtures");

describe("test models/changelog.js ...", () => {
  let target, dm;

  beforeEach(() => {
    dm = setupDanger();
    target = new Changelog(dm.danger);
  })

  it("should not message when changelogUnreleased() and CHANGELOG is not modified", () => {
    return target.changelogUnreleased().then(() => {
      expect(dm.message).toHaveBeenCalledTimes(0);
    })
  })

  it.each([
    [1, 'changelog-single-added-diff.ok.json', 'modified-files.json', 'Found modified CHANGELOG', null],
    [1, 'changelog-single-changed-diff.ok.json', 'modified-files.json', 'Found modified CHANGELOG', null],
    [1, null, 'modified-files.no-changelog.json', null, 'Could you add an entry'],
    [1, 'changelog-multi-changes-diff.ok.json', 'modified-files.json', null, 'keep a release small'],
  ])('should post message when changelogUnreleased() and required files modified', (times, fixture, modified, msg, warn) => {
    const filesFixtures = 'models/__fixtures__/changelog/changelogUnreleased';
    const gitFiles = setUpTestScenarioObject(`${filesFixtures}/${modified}`);
    dm.danger.git.fileMatch = dangerFileMatch({
      modified: gitFiles.modified_files, created: gitFiles.created_files, deleted: gitFiles.deleted_files, edited: gitFiles.modified_files
    });
    dm.danger.git.created_files = gitFiles.created_files;
    dm.danger.git.deleted_files = gitFiles.deleted_files;
    dm.danger.git.modified_files = gitFiles.modified_files;

    dm.danger.git.diffForFile = (file) => {
      if (fixture) return setUpTestScenarioObject(`models/__fixtures__/changelog/changelogUnreleased/${fixture}`)
    }

    return target.changelogUnreleased().then(() => {
      if (times === 1 && msg) {
        expect(dm.message).toHaveBeenCalledTimes(times);
        expect(dm.message).toHaveBeenCalledWith(expect.stringContaining(msg));
      } else if (times === 1 && warn) {
        expect(dm.warn).toHaveBeenCalledTimes(times);
        expect(dm.warn).toHaveBeenCalledWith(expect.stringContaining(warn));
      }
    })
  });

  it.each([
    [0, { modified: ['CHANGELOG.md'], created: [], deleted: [], edited: [] },
      { created_files: ['CHANGELOG.md'], deleted_files: [], modified_files: [] }],
    [0, { modified: [], created: [], deleted: ['k8s/helm/cron.yaml'], edited: [] },
      { created_files: [], deleted_files: ['k8s/helm/cron.yaml'], modified_files: [] }],
  ])('should not message when changelogUnreleased() and required files not modified', (times, keyedPaths, files) => {
    dm.danger.git.created_files = files.created_files;
    dm.danger.git.deleted_files = files.deleted_files;
    dm.danger.git.modified_files = files.modified_files;
    return target.changelogUnreleased().then(() => {
      expect(dm.message).toHaveBeenCalledTimes(0);
    })
  });

  it("should message when changelogNotPresent()", () => {
    dm.danger.git.fileMatch = dangerFileMatch({ modified: ['CHANGELOG.md'] });
    return target.changelogNotPresent().then(() => {
      expect(dm.warn).toHaveBeenCalledTimes(0);
    })
  })

  it("should message when changelogNotPresent() and single file modified", () => {
    target._committedFiles = ['.gitlab-ci.yml'];
    return target.changelogNotPresent().then(() => {
      expect(dm.warn).toHaveBeenCalledTimes(1);
      expect(dm.warn).toHaveBeenCalledWith(expect.stringContaining('modifies single file'));
    })
  })

  it("should message when changelogNotPresent() and multiple files modified", () => {
    target._committedFiles = ['.gitlab-ci.yml', 'helm/tests/values.yml'];
    return target.changelogNotPresent().then(() => {
      expect(dm.warn).toHaveBeenCalledTimes(1);
      expect(dm.warn).toHaveBeenCalledWith(expect.stringContaining('modifies multiple files'));
    })
  })

  it("should message when addPaasManualApplyMsg", () => {
    return target.chartYamlVersionReleased().then(() => {
      expect(dm.message).toHaveBeenCalledTimes(1);
      expect(dm.message).toHaveBeenCalledWith("🤖 On release, make sure chart `version` is updated in `Chart.yaml` file.");
    })
  })

  it("should test paradox", () => {
    dm.danger.git.created_files = [];
    dm.danger.git.modified_files = [];
    return target.run().then(() => {
      expect(dm.fail).toHaveBeenCalledTimes(0);
    })
  })
})
