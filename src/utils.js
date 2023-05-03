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

const hclToJson = source => {
  return hcl.parseToObject(source)[0];
}

const uniqueArraySize = (...source) => {
  return new Set(...source).size
}

const containsInList = (repository, repoInAList) => {
  return repoInAList.some(element => {
    if (repository.includes(element)) {
      return true;
    }
    return false;
  });
}

module.exports = {
  sentenceContainsValues,
  inputInCollection,
  isDiff,
  hclToJson,
  uniqueArraySize,
  containsInList,
};
