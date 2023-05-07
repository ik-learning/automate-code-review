// https://github.com/sogame/danger-plugin-toolbox/blob/b32d7f9b1b0bfb10fcd45670e14a23dc7e53b38f/src/rules/helpers.js
Object.entries(removedLines).forEach(([lineNumber, content]) => {
  ...
});

export const fileAddedLines = async (filename) => {
  const diff = await diffForFile(filename);
  const { added } = diff || {};
  return added || '';
};

export const fileRemovedLines = async (filename) => {
  const diff = await diffForFile(filename);
  const { removed } = diff || {};
  return removed || '';
};

export const fileAddedLineMatch = async (filename, pattern) => {
  const addedLines = await fileAddedLines(filename);
  return addedLines.match(pattern) !== null;
};

export const fileRemovedLineMatch = async (filename, pattern) => {
  const removedLines = await fileRemovedLines(filename);
  return removedLines.match(pattern) !== null;
};
