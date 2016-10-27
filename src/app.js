var api = require('./neo4jApi');

$(function () {
  
  $("#query-builder").tagsinput('add', "");
  // renderGraph("");
  search();

  $("#search").submit(e => {
    e.preventDefault();
    search();
    $("#graph").empty();
    //renderGraph($("#search").find("input[name=search]").val());
  });

  $("#query").submit(e => {
    e.preventDefault();
    query();
    // $("#graph").empty();
    //renderGraph($("#search").find("input[name=search]").val());
  });

});

// function showMovie(title) {
//   console.log(title);
//   api
//     .getMovie(title)
//     .then(movie => {
//       if (!movie) return

//       $("#title").text(movie.title);
//       // $("#poster").attr("src", "http://neo4j-contrib.github.io/developer-resources/language-guides/assets/posters/" + movie.title + ".jpg");
//       var $list = $("#crew").empty();
//       // movie.Description.forEach(item => {
//       //   console.log(item);
//       //   $list.append($("<li>" + item  + "</li>"));
//       // })
//       movie.cast.forEach(cast => {
//         $list.append($("<li>" + cast.skate +"</li>"));
//       });
//     }, "json");
// }

function search() {
  var query = $("#search").find("input[name=search]").val();
  api
    .searchByFeature(query)
    .then(features => {
      var t = $("table#results tbody").empty();

      if (features) {
        features.forEach(feature => {
          $("<tr><td class='feature'>" + feature.desc + "</td>" ).appendTo(t)
            .click(function() {
              // showMovie($(this).find("td.movie").text());
              
              $("#graph").empty();
              // renderGraph($(this).find("td.feature").text());

              $("#query-builder").tagsinput('add', feature.desc);
            })
        });

        // var first = movies[0];
        // if (first) {
        //   showMovie(first.desc);
        // }
      }
    });
}

function query(){
  var tokens = $('#query-builder').val();
  var token_count = tokens.split(",").length;

  var t = $('#candidates-count tbody').empty();
  var candidates = api.getCandidates(tokens).then( candidates => {
    candidates.forEach(candidate => {
      $('<tr><td>' + candidate.species + '</td><td>' + Math.round(candidate.count/token_count*100) + '%</td>').appendTo(t);
    })
  }
    


    );
  

}

// function searchFromGraph(query) {
//   //var query = $("#search").find("input[name=search]").val();
//   api
//     .searchMovies(query)
//     .then(movies => {
//       var t = $("table#results tbody").empty();

//       if (movies) {
//         movies.forEach(movie => {
//           $("<tr><td class='movie'>" + movie.desc + "</td>" ).appendTo(t)
//             .click(function() {
//               showMovie($(this).find("td.movie").text());
//               $("#graph").empty();
//               renderGraph($(this).find("td.movie").text());
//             })
//         });

//         var first = movies[0];
//         if (first) {
//           showMovie(first.desc);
//         }
//       }
//     });
// }
// function renderGraph() {
//   var width = 800, height = 800;
//   var force = d3.layout.force()
//     .charge(-200).linkDistance(30).size([width, height]);

//   var svg = d3.select("#graph").append("svg")
//     .attr("width", "100%").attr("height", "100%")
//     .attr("pointer-events", "all");

//   api
//     .getGraph()
//     .then(graph => {
//       force.nodes(graph.nodes).links(graph.links).start();

//       var link = svg.selectAll(".link")
//         .data(graph.links).enter()
//         .append("line").attr("class", "link");

//       var node = svg.selectAll(".node")
//         .data(graph.nodes).enter()
//         .append("circle")
//         .attr("class", d => {
//           return "node " + d.label
//         })
//         .attr("r", 10)
//         .call(force.drag);


//       // html title attribute
//       node.append("title")
//         .text(d => {
//           return d.title;
//         });

//       // force feed algo ticks
//       force.on("tick", () => {
//         link.attr("x1", d => {
//           return d.source.x;
//         }).attr("y1", d => {
//           return d.source.y;
//         }).attr("x2", d => {
//           return d.target.x;
//         }).attr("y2", d => {
//           return d.target.y;
//         });

//         node.attr("cx", d => {
//           return d.x;
//         }).attr("cy", d => {
//           return d.y;
//         });
//       });
//     });
// }

function renderGraph(queryString) {
  var width = 800, height = 800;
  var force = d3.layout.force()
    .charge(-200).linkDistance(30).size([width, height]);
  var svg = d3.select("#graph").append("svg")
    .attr("width", "100%").attr("height", "100%")
    .attr("pointer-events", "all");

  // $("svg").css({display: 'inline-block'});//{top: -100, left: 200, position:'relative'});

  api
    .getGraph(queryString)
    .then(graph => {
      force.nodes(graph.nodes).links(graph.links).start();

      var link = svg.selectAll(".link")
        .data(graph.links).enter()
        .append("line").attr("class", "link");

      var node = svg.selectAll(".node")
        .data(graph.nodes).enter()
        .append("circle")
        .attr("class", d => {
          return "node " + d.label
        })
        .attr("r", 10)
        .call(force.drag);


      // html title attribute
      node.append("title")
        .text(d => {
          return d.title;
        });

      //adding click interactivity
      node.on("click",(function(d){
        $("#graph").empty();
        renderGraph(d.title);
        searchFromGraph(d.title);
        //$("#query-builder").tagsinput('add', d.title);
      }));


      // force feed algo ticks
      force.on("tick", () => {
        link.attr("x1", d => {
          return d.source.x;
        }).attr("y1", d => {
          return d.source.y;
        }).attr("x2", d => {
          return d.target.x;
        }).attr("y2", d => {
          return d.target.y;
        });

        node.attr("cx", d => {
          return d.x;
        }).attr("cy", d => {
          return d.y;
        });
      });
    });
}
