"use strict";

const hcl = require("hcl2-parser");
const hash = require('object-hash');

// helper functions
const sentenceContainsValues = (target, pattern) => {
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

const uniqueElementsCount = (...source) => {
  return new Set(...source).size
}

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

module.exports = {
  sentenceContainsValues,
  inputInCollection,
  isDiff,
  hclParse,
  uniqueElementsCount,
  isInCollection,
  filesMatchPath,
};
