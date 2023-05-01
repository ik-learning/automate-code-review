"use strict";

const hcl = require("hcl2-parser");
const hash = require('object-hash');

// helper functions
const contains = (target, pattern) => {
  // TODO: probably compare lowercase too
  let result = 0;
  pattern.forEach(function (word) {
    result = result + target.includes(word);
  });
  return (result === pattern.length)
};

// Collection to contain a string
const arrayContainsString = (collection, input) => {
  return collection.includes(input, 0)
}

const getHashDifference = (firstArr, secondArr) => {
  return firstArr.filter(first => {
    // could do without hashing, e.g. key buy key comparison
    return !secondArr.some(second => hash(first) === hash(second));
  })
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
  contains,
  hclToJson,
  getHashDifference,
  uniqueArraySize,
  arrayContainsString,
  containsInList,
};
