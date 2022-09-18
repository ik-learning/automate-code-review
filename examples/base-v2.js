// Check that every file touched has a corresponding test file
const correspondingTestsForModifiedFiles = modifiedFiles.map(f => {
  const newPath = path.dirname(f);
  const name = path.basename(f);
  return `${newPath}/__tests__/${name}`;
});

const testFilesThatDontExist = correspondingTestsForModifiedFiles
  .filter(f => !f.includes('__stories__')) // skip stories
  .filter(f => !fs.existsSync(f));

if (testFilesThatDontExist.length > 0 && !skipTests) {
  const output = `Missing Test Files:
${testFilesThatDontExist.map(f => `- \`${f}\``).join('\n')}
If these files are supposed to not exist, please update your PR body to include "Skip New Tests".`;
  warn(output);
}

// Find changed React components
const changedComponents = modifiedFiles.filter(file => {
  const content = fs.readFileSync(file).toString();
  return content.includes('React');
});

// Check for images in PR description if new components added
if (changedComponents.length > 0 && !skipVisualDiff && !hasScreenShots) {
  const output = `Should there be images to represent these components:
  ${changedComponents.map(f => `- \`${f}\``).join('\n')}
  If these changes are not visual, please update your PR body to include "Skip Visual Diff".`;
  warn(output);
}

// Check that every component touched has a corresponding story
const correspondingStoriesForChangedComponents = uniq(
  changedComponents.map(f => {
    const newPath = path.dirname(f);
    return `${newPath}/__stories__/index.js`;
  })
);

const missingStories = correspondingStoriesForChangedComponents.filter(
  f => !fs.existsSync(f)
);
