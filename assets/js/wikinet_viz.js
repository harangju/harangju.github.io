// http://www.biovisualize.com/2012/07/embedding-d3js-in-blog-post.html
'use strict'

d3.helper = {};

d3.helper.tooltip = function(){
    var tooltipDiv;
    var bodyNode = d3.select('body').node();
    var attrs = {};
    var text = '';
    var styles = {};

    function tooltip(selection){

        selection.on('mouseover.tooltip', function(pD, pI){
            var name, value;
            // Clean up lost tooltips
            d3.select('body').selectAll('div.tooltip').remove();
            // Append tooltip
            tooltipDiv = d3.select('body').append('div');
            tooltipDiv.attr(attrs);
            tooltipDiv.style(styles);
            var absoluteMousePos = d3.mouse(bodyNode);
            tooltipDiv.style({
                left: (absoluteMousePos[0] + 10)+'px',
                top: (absoluteMousePos[1] - 15)+'px',
                position: 'absolute',
                'z-index': 1001
            });
            // Add text using the accessor function, Crop text arbitrarily
            tooltipDiv.style('width', function(d, i){ return (text(pD, pI).length > 80) ? '300px' : null; })
                .html(function(d, i){return text(pD, pI);});
        })
        .on('mousemove.tooltip', function(pD, pI){
            // Move tooltip
            var absoluteMousePos = d3.mouse(bodyNode);
            tooltipDiv.style({
                left: (absoluteMousePos[0] + 10)+'px',
                top: (absoluteMousePos[1] - 15)+'px'
            });
            // Keep updating the text, it could change according to position
            tooltipDiv.html(function(d, i){ return text(pD, pI); });
        })
        .on('mouseout.tooltip', function(pD, pI){
            // Remove tooltip
            tooltipDiv.remove();
        });

    }

    tooltip.attr = function(_x){
        if (!arguments.length) return attrs;
        attrs = _x;
        return this;
    };

    tooltip.style = function(_x){
        if (!arguments.length) return styles;
        styles = _x;
        return this;
    };

    tooltip.text = function(_x){
        if (!arguments.length) return text;
        text = d3.functor(_x);
        return this;
    };

    return tooltip;
};

let drag = simulation => {

  function dragstarted(event, d) {
    if (!event.active) simulation.alphaTarget(0.3).restart();
    d.fx = d.x;
    d.fy = d.y;
  }

  function dragged(event,d) {
    d.fx = event.x;
    d.fy = event.y;
  }

  function dragended(event,d) {
    if (!event.active) simulation.alphaTarget(0);
    d.fx = null;
    d.fy = null;
  }

  return d3.drag()
      .on("start", dragstarted)
      .on("drag", dragged)
      .on("end", dragended);
}

const height = 680

var json = null;
function update() {
  const nodes = json.links.map(d => Object.create(d));
  const links = json.links.map(d => Object.create(d));
  console.log(nodes);

  function tick() {
    viz_nodes.attr('cx', function(d) { return d.x; })
      .attr('cy', function(d) { return d.y; });
    viz_links.attr('x1', function(d) { return d.source.x })
      .attr('y1', function(d) { return d.source.y })
      .attr('x2', function(d) { return d.target.x })
      .attr('y2', function(d) { return d.target.y });
  }

  let force = d3.layout.force()
    .nodes(nodes)
    .size([600, 600])
    .gravity(.3)
    // .links(links)
    .linkDistance(80)
    .charge(-100)
    .on('tick', tick);
  force.start();

  let network = d3
    .select('.viz')
    .append('svg')
    .attr({width: 600, height: 600});

  let viz_nodes = network.selectAll("circle")
    .data(force.nodes())
    .enter().append("circle")
    .style("fill", "steelblue")
    .attr("r", 4);

  let viz_links = network.selectAll("lines")
    .data(force.links())
    .enter().append("line")
}

$.getJSON("/assets/graph.json", function(data) {
  console.log('graph file');
  json = data;
  console.log(json);
  console.log(json['nodes'][0]);
  console.log(json['links'][0]);
  update();
});
