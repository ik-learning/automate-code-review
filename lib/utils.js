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

const getHashDifference = (firstArr, secondArr) => {
  return firstArr.filter(first => {
    // could do without hashing, e.g. key buy key comparison
    return !secondArr.some(second => hash(first) === hash(second));
  })
};

const hclToJson = source => {
  return hcl.parseToObject(source)[0];
}

module.exports = {
  contains,
  hclToJson,
  getHashDifference,
};
