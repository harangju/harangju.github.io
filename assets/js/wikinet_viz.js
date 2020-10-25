// http://www.biovisualize.com/2012/07/embedding-d3js-in-blog-post.html
'use strict'

let svg = d3
  .select('.viz')
  .append('svg')
  .attr({width: 600, height: 600});

let force = d3.layout.force()
  .on("tick", tick)
  .size([600, 600])
  .gravity(.4)
  .linkDistance(80)
  .charge(-100);

var json = null;
$.getJSON("/assets/graph.json", function(data) {
  json = data;
  json.links.forEach(function (value, i) {
    value['source'] = json.nodes
      .map(d => d['id']==value['source'])
      .indexOf(true);
    value['target'] = json.nodes
      .map(d => d['id']==value['target'])
      .indexOf(true);
  });
  console.log(json);
  update();
});

function update() {
  let nodes = json.nodes.map(d => Object.create(d));
  let links = json.links.map(d => Object.create(d));
  force.nodes(nodes)
    .links(links);

  node = svg.selectAll("circle")
    .data(nodes)
    .enter().append("circle")
    .style("fill", "steelblue")
    .attr("r", d => 4.5)
    .call(force.drag);
  link = svg.selectAll("line")
    .data(links)
    .enter().append("line")
    .attr("class", "link")
    .style("stroke-width", 1)
    .style("stroke", "#3182bd");

  force.start();
}

var node, link;
function tick() {
  node.attr('cx', d => d.x)
    .attr('cy', d => d.y);
  link.attr('x1', d => d.source.x)
    .attr('y1', d => d.source.y)
    .attr('x2', d => d.target.x)
    .attr('y2', d => d.target.y);
}
