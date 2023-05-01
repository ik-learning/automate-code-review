'use strict';

class Results {
  constructor() {
    this.warnings = []
    this.messages = []
  }

  addWarn(msg) {
    this.warnings.push(msg);
  }

  addMsg(msg) {
    this.messages.push(msg);
  }
}

module.exports = {
  Results,
}
