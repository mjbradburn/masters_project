require('file?name=[name].[ext]!../node_modules/neo4j-driver/lib/browser/neo4j-web.min.js');
var Movie = require('./models/Movie');
var MovieCast = require('./models/MovieCast');
var _ = require('lodash');

var neo4j = window.neo4j.v1;
//var neo4j = require('neo4j-driver').v1;
var driver = neo4j.driver("bolt://localhost", 
  neo4j.auth.basic("neo4j", "Charlie711"));

function searchMovies(queryString) {
  var session = driver.session();
  return session
    .run(
      'match (movie:Skate) \
      where movie.common_name =~ {title} \
      return movie',
      {title: '(?i).*' + queryString + '.*'}
    )
    .then(result => {
      session.close();
      return result.records.map(record => {
        return new Movie(record.get('movie'));
      });
    })
    .catch(error => {
      session.close();
      throw error;
    });
}

function getMovie(title) {
  var session = driver.session();
  return session
    .run(
      "MATCH (skate:Skate {common_name:{title}}) \
      OPTIONAL MATCH (skate)-[:HAS_A]->(property:Property) \
      RETURN skate.common_name AS Name, \
      collect(property.desc) \
            AS Description", {title})
    .then(result => {
      session.close();

      if (_.isEmpty(result.records))
        return null;

      var record = result.records[0];
      return new MovieCast(record.get('Name'), record.get('Description'));
    })
    .catch(error => {
      session.close();
      throw error;
    });
}

function getGraph(queryString) {
  console.log("calling getGraph(param)");
  var session = driver.session();
  var defaultQuery = 'match (sk:Skate)-[r:HAS_A]->(p:Property)  \
      return sk.common_name as Name,collect( p.desc) as Description'
  var optional = "match (sk:Skate)-[r:HAS_A]->(p:Property) where sk.common_name = " + "'" + queryString + "'" + " \
      return sk.common_name as Name,collect( p.desc) as Description"
  var query = (!queryString)? defaultQuery : optional;
  console.log("query is " + query);
  // return session
  //   .run("match (sk:Skate)-[r:HAS_A]->(p:Property) \
  //     return sk.common_name as Name,collect( p.desc) \
  //     as Description")
  //   .then( function( result ){
  //     session.close();
  //     driver.close();
  //     var nodes = [], links = [];

  //     _.forEach(result.records, function(value){
  //       var species = value._fields[0];
  //       nodes.push({id: species})

  //       _.forEach(value._fields[1], function(value){
  //         nodes.push({id: value});
  //         links.push({source: species, target: value});
  //       })
  //     })

  //     nodes = _.uniqWith(nodes,_.isEqual);
  //     console.log({nodes,links});
  //     return JSON.stringify({nodes, links});
  //   });
  return session.run(
      query)
    .then(results => {
      session.close();
      var nodes = [], rels = [], i = 0;
      results.records.forEach(res => {
        nodes.push({title: res.get('Name'), label: 'Species'});
        var target = i;
        i++;

        res.get('Description').forEach(name => {
          var actor = {title: name, label: 'Property'};
          var source = _.findIndex(nodes, actor);
          if (source == -1) {
            nodes.push(actor);
            source = i;
            i++;
          }
          rels.push({source, target})
        })
      });
      console.log("running getGraph()" + queryString);
      return {nodes, links: rels};
    });
}

// function getGraph() {
//   var session = driver.session();
//   console.log("calling getGraph()");
//   // var defaultQuery = 'match (sk:Skate)-[r:HAS_A]->(p:Property)  \
//   //     return sk.common_name as Name,collect( p.desc) as Description'
//   // var optional = 'match (sk:Skate)-[r:HAS_A]->(p:Property) where sk.common_name = ' + queryString + '\
//   //     return sk.common_name as Name,collect( p.desc) as Description'
//   // var query = (typeof queryString === 'undefined')? defaultQuery : optional;
//   // return session
//   //   .run("match (sk:Skate)-[r:HAS_A]->(p:Property) \
//   //     return sk.common_name as Name,collect( p.desc) \
//   //     as Description")
//   //   .then( function( result ){
//   //     session.close();
//   //     driver.close();
//   //     var nodes = [], links = [];

//   //     _.forEach(result.records, function(value){
//   //       var species = value._fields[0];
//   //       nodes.push({id: species})

//   //       _.forEach(value._fields[1], function(value){
//   //         nodes.push({id: value});
//   //         links.push({source: species, target: value});
//   //       })
//   //     })

//   //     nodes = _.uniqWith(nodes,_.isEqual);
//   //     console.log({nodes,links});
//   //     return JSON.stringify({nodes, links});
//   //   });
//   return session.run(
//       'match (sk:Skate)-[r:HAS_A]->(p:Property)  \
//       return sk.common_name as Name,collect( p.desc) as Description')
//     .then(results => {
//       session.close();
//       var nodes = [], rels = [], i = 0;
//       results.records.forEach(res => {
//         nodes.push({title: res.get('Name'), label: 'Species'});
//         var target = i;
//         i++;

//         res.get('Description').forEach(name => {
//           var actor = {title: name, label: 'Property'};
//           var source = _.findIndex(nodes, actor);
//           if (source == -1) {
//             nodes.push(actor);
//             source = i;
//             i++;
//           }
//           rels.push({source, target})
//         })
//       });
//       //console.log("running getGraph()" + queryString);
//       return {nodes, links: rels};
//     });
// }

exports.searchMovies = searchMovies;
exports.getMovie = getMovie;
exports.getGraph = getGraph;

