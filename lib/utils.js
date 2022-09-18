"use strict";

const HCL = require("hcl2-parser");

// helper functions
const contains = (target, pattern) => {
  // TODO: probably compare lowercase too
  let result = 0;
  pattern.forEach(function (word) {
    result = result + target.includes(word);
  });
  return (result === pattern.length)
};

const hclToJson = source => {
  return HCL.parseToObject(source)[0];
}

module.exports = {
  contains,
  hclToJson,
};
