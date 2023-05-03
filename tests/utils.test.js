
const { sentenceContainsValues } = require('../src/utils');

describe("Test utils.js ...", () => {

  describe("sentenceContainsValues(string,array[string]))", () => {
    test('sentence contains array values', () => {
      expect(sentenceContainsValues("## checklist \\n and le's remove", ['## checklist', 'remove'])).toBeTruthy();
    });

    test('sentence contains case insensitive values from an array', () => {
      expect(sentenceContainsValues("## Checklist \\n and le's remove", ['## checklist', 'remove'])).toBeTruthy();
    });

    test('sentence do not contains all the values from an array', () => {
      expect(sentenceContainsValues("## checklist \\n and le's remove", ['## checklist', 'added'])).toBeFalsy();
    });
  })

  describe("contains(string,array[string]))", () => {

  })
})
