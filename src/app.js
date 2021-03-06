var api = require('./neo4jApi');

$(function () {
  $("#query-builder").tagsinput('add', "");
  renderGraph("");
  search();

  $("#search").submit(e => {
    e.preventDefault();
    search();
    // $("#graph").empty();
    // renderGraph($("#search").find("input[name=search]").val());
  });

  $("#query").submit(e => {
    e.preventDefault();
    query();
    $("#graph").empty();
    renderGraph($('#query-builder').val());
  });

});

function contentAdjust() {
  if ($('.navbar').height() > 75) {
    $('body').css('margin-top', '50');
  } else {
    $('body').css('margin-top', '0');
  } 
}

$("#search-clear").click(function(){
  $('#search-input').val("");
  $("#graph").empty();
  renderGraph("");
  search();
});

$("#query-clear").click(function(){
  $('#query-builder').tagsinput('removeAll');
  $('#candidates-count tbody').empty();
  $('#next-best tbody').empty();
  $("#graph").empty();
  contentAdjust();
  renderGraph("");
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
              //$("#graph").empty();
              // renderGraph($(this).find("td.feature").text());
              $("#query-builder").tagsinput('add', feature.desc);
              //push down content if navbar resizes
              contentAdjust();

              $('#search-input').val("");
              search();
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
      $('<tr><td>' + candidate.species + '</td><td>' + Math.round(candidate.count/token_count*100) + '%</td>').appendTo(t)
      .hover(
        function(){
          $('circle').css('stroke-width', '1.5px');
          var searchString = $(this).children().first().text();
          $('circle > title').filter(function(){
            return $(this).first().text() == searchString;
          }).parent().css('stroke-width', '5px');
        }
      );
        //var searchString = $(this).children().first().text();
        //console.log(searchString);
        // $('circle > title').filter(function(){
        //   return $(this).first().text() == searchString;
        // }).parent().css('stroke-width', '5px');}
        // function(){ $('circle').css('stroke-width', '1.5px');

        // }

      });

  });
  //pass tokens to api.getNextBest
  var ta = $('#next-best tbody').empty();
  var features = api.getNextBest(tokens).then( features => {
    features.forEach(feature => {
      console.log(feature.desc);
      $('<tr><td>' + feature.desc + '</td><td>' + feature.count + '</td>').appendTo(ta)
            .hover(
              function(){
                $('circle').css('stroke-width', '1.5px');
                var searchString = $(this).children().first().text();
                $('circle > title').filter(function(){
                return $(this).first().text() == searchString;
              }).parent().css('stroke-width', '5px');
            }
          )
      .click(function(){
        $("#query-builder").tagsinput('add', feature.desc);
        contentAdjust();
      });
    })
  });
}

// function suggest(){
//   var tokens = $('#query-builder').val();

//   //pass tokens to api.getNextBest
//   var t = $('#next-best tbody').empty();
//   var features = api.getNextBest(tokens).then( features => {
//     features.forEach(feature => {
//       $('<tr><td>' + feature.desc + '</td><td>' + feature.count + '%</td>').appendTo(t);
//     })
//   }
//     );

// }

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

function renderGraph(tokenString) {
  var width = 1000, height = 1000;
  var force = d3.layout.force()
    .charge(-200).linkDistance(30).size([width, height]);
  var svg = d3.select("#graph").append("svg")
    .attr("width", "100%").attr("height", height)
    .attr("pointer-events", "all");
  //var color = d3.scaleOrdinal(d3.schemeCategory20);
  // $("svg").css({display: 'inline-block'});//{top: -100, left: 200, position:'relative'});

  api
    .getGraph(tokenString)
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
        .attr("r", 8)
        .attr("fill", function(d) { return d.group == -1? '#23CE6B' : '#00A6A6' ; })
        .call(force.drag);


      // html title attribute
      node.append("title")
        .text(d => {
          return d.title;
        });

      //adding click interactivity
      node.on("dblclick",(function(d){
        //$("#graph").empty();
        //renderGraph(d.title);
        //searchFromGraph(d.title);
        $("#query-builder").tagsinput('add', d.title);
        contentAdjust();

      }));

      // node.on("mouseover", (
      //   function(d){
      //     //$('circle').css('stroke-width', '1.5px');
      //     var searchString = d.title;
      //     //console.log(d.title);
      //     $('#candidates-count > tbody > tr > td:first-child , #next-best > tbody > tr > td:first-child' )
      //     .filter(function(){
      //       console.log($(this).text() == searchString);
      //       return $(this).text() == searchString;
      //     }).css('font-weight', 'bold');
      //   })
      // );

      // node.on("mouseleave", 
      //   function(d){

      //   })
      // );


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
