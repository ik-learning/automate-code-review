"use strict";

const hcl = require("hcl2-parser");
const hash = require('object-hash');
const fs = require('fs');

// helper functions
/**
 * A sentence contains all the values from a pattern.
 * @param {*} target
 * @param {*} pattern
 * @returns true or false
 */
const sentenceContainsMarkers = (target, pattern) => {
  let result = 0;
  let targetLowerCase = target.toLowerCase();
  pattern.forEach(function (word) {
    result = result + targetLowerCase.includes(word);
  });
  return (result === pattern.length);
};

// Collection to contain a string
const inputInCollection = (target, collection) => {
  return collection.includes(target, 0)
}

const isDiff = (first, second, diff) => {
  if (Array.isArray(first) && Array.isArray(second)) {

    if (Math.abs(first.length - second.length) > diff) {
      return true;
    }
    return second.filter(el => {
      // could do without hashing, e.g. key buy key comparison
      return !first.some(second => hash(el) === hash(second));
    }).length > diff;
  } else {
    return false;
  }
};

const hclParse = source => {
  return hcl.parseToObject(source)[0];
}

/**
 * Count number of unique elements in multiple arrays
 * @param  {...any} source string arrays
 * @returns
 */
const uniqueElementsCount = (...source) => {
  return new Set([].concat.apply([], source)).size
}

/**
 *  Is target string present in collection
 * @param {*} target string
 * @param {*} collection string array
 * @returns
 */
const isInCollection = (target, collection) => {
  return collection.some(element => {
    if (target.includes(element)) {
      return true;
    }
    return false;
  });
}

const filesMatchPath = (files, paths) => {
  return files.filter(val => {
    return paths.some(el => val.includes(el))
  });
}

/**
 * Write data to file.
 *
 * example usage: writeFileSync(process.cwd() + "/tests/models/__fixtures__/diff.json", JSON.stringify(diff))
 *
 * @param {string} filename
 * @param {string} data
 */
const writeFileSync = (filename, data) => {
  const buffer = Buffer.from(data);
  fs.writeFileSync(filename, buffer)
}

module.exports = {
  sentenceContainsMarkers,
  inputInCollection,
  isDiff,
  hclParse,
  uniqueElementsCount,
  isInCollection,
  filesMatchPath,
  writeFileSync,
};
