
const { contains } = require('../src/utils');

describe("Test utils.js ...", () => {

  test('sentence contains array values', () => {
    expect(contains("## checklist \\n and le's remove", ['## checklist', 'remove'])).toBeTruthy();
  });

  test('sentence contains case insensitive values from an array', () => {
    expect(contains("## Checklist \\n and le's remove", ['## checklist', 'remove'])).toBeTruthy();
  });

  test('sentence do not contain values', () => {
    expect(contains("## checklist \\n and le's remove", ['## checklist', 'added'])).toBeFalsy();
  });


})
