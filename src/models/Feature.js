//var _ = require('lodash');

function Feature(node) {
  // _.extend(this, _node.properties);
  this.desc = node.properties.desc;
  // if (this.id) {
  //   this.id = this.id.toNumber();
  // }
  // if (this.duration) {
  //   this.duration = this.duration.toNumber();
  // }
}

module.exports = Feature;
