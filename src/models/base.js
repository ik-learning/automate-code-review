
class Base {

  constructor(danger) {
    this.danger = danger
  }

  danger() {
    console.log(this.danger.git);
  }
  git() {
    console.log(this.danger.git);
  }

  run() {
    throw new Error('You have to implement the method run()!');
  }
}

module.exports = {
  Base,
}
