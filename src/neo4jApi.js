require('file?name=[name].[ext]!../node_modules/neo4j-driver/lib/browser/neo4j-web.min.js');
var Feature = require('./models/Feature');
var MovieCast = require('./models/MovieCast');
var Candidate = require('./models/Candidate');
var _ = require('lodash');

var neo4j = window.neo4j.v1;
//var neo4j = require('neo4j-driver').v1;
var driver = neo4j.driver("bolt://localhost", 
  neo4j.auth.basic("neo4j", "Charlie711"));

function tokenizeString(queryString){
  //tokenize string
  var tokens = queryString.split(",");
  var tokenQueryString = "";
  for (var i = 0; i < tokens.length; i++){
    tokenQueryString += "feature.desc CONTAINS '" + tokens[i] + "'";
    if (i != tokens.length - 1)
      tokenQueryString += " OR "
  }
  return tokenQueryString;
}

function searchByFeature(queryString) {

  var tokenQueryString = tokenizeString(queryString);

  var session = driver.session();
  return session
    .run(
      "MATCH (feature:Property) \
      where " + tokenQueryString + " return feature"
    )
    .then(result => {
      session.close();
      return result.records.map(record => {
        return new Feature(record.get('feature'));
      });
    })
    .catch(error => {
      session.close();
      throw error;
    });
}

function makeQuery(){

}

// function getMovie(title) {
//   var session = driver.session();
//   return session
//     .run(
//       "MATCH (p1:Property {desc:{title}}) \
//       OPTIONAL MATCH (p1)<-[:HAS_A]-(skate:Skate) \
//       RETURN p1.desc AS Description, \
//       collect(skate.common_name) \
//             AS Species", {title})
//     .then(result => {
//       session.close();
//       console.log(result.records);

//       if (_.isEmpty(result.records))
//         return null;

//       var record = result.records[0];
//       return new MovieCast(record.get('Description'), record.get('Species'));
//     })
//     .catch(error => {
//       session.close();
//       throw error;
//     });
// }

function getCandidates(tokenString){
  var tokenQueryString = tokenizeString(tokenString);
  var session = driver.session();
  return session
    .run(
      "MATCH (feature:Property)<--(species:Skate) \
      where " + tokenQueryString + "\
      return species, count(*) AS count order by count desc"
    ).then(results =>{
      session.close();
      var candidates =[];
       _.forEach(results.records, function(value){
      
      var candidate = 
      new Candidate(value._fields[0].properties.common_name,value._fields[1].low);
      candidates.push(candidate);
    })
      return candidates;
    })
    .catch(error => {
      session.close();
      throw error;
    });
}

function getGraph(queryString) {
  var session = driver.session();
  var defaultQuery = 'match (sk:Skate)-[r:HAS_A]->(p:Property)  \
      return p.desc as Description,collect( sk.common_name) as Name'
  var optional = "match (sk:Skate)-[r:HAS_A]->(p:Property) where p.desc = " + "'" + queryString + "'" + " \
      return p.desc as Description,collect( sk.common_name) as Name"
  var query = (!queryString)? defaultQuery : optional;

  return session.run(
      query)
    .then(results => {
      session.close();
      var nodes = [], rels = [], i = 0;
      results.records.forEach(res => {
        nodes.push({title: res.get('Description'), label: 'Property'});
        var target = i;
        i++;

        res.get('Name').forEach(name => {
          var actor = {title: name, label: 'Skate'};
          var source = _.findIndex(nodes, actor);
          if (source == -1) {
            nodes.push(actor);
            source = i;
            i++;
          }
          rels.push({source, target})
        })
      });
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

exports.searchByFeature = searchByFeature;
// exports.getMovie = getMovie;
exports.getGraph = getGraph;
exports.getCandidates = getCandidates;
exports.tokenizeString = tokenizeString;
