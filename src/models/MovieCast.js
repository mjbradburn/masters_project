var _ = require('lodash');

function MovieCast(title, cast) {
  _.extend(this, {
    title: title,
    cast: cast.map(function (c) {
      return {
        skate: c
        // job: c[1],
        // role: c[2]
      }
    })
  });
}

module.exports = MovieCast;
