// http://www.biovisualize.com/2012/07/embedding-d3js-in-blog-post.html
// https://github.com/vlandham/force_talk/blob/gh-pages/slides/simple_force.html
'use strict'

let dropdown = d3.select('.options')
  .append('select')
  .on('change', function() {
    console.log('changed to ' + dropdown.property('selectedIndex'));
  });
let options = dropdown.selectAll('option')
  .data([0, 1, 2, 3])
  .enter().append("option")
  .text(d => d);

let svg = d3.select('.viz')
  .append('svg')
  .attr({width: 600, height: 600});

// https://www.d3-graph-gallery.com/graph/interactivity_tooltip.html
let tooltip = d3.select('.viz')
  .append('div')
  .attr('class', 'tooltip')
  .style('opacity', 0)
  .style('background-color', 'white')
  .style('border', 'solid')
  .style('border-width', '2px')
  .style('border-radius', '5px')
  .style('padding', '5px')
  .style('position', 'absolute');

let force = d3.layout.force()
  .on('tick', tick)
  .size([600, 600])
  .gravity(.4)
  .linkDistance(80)
  .charge(-100);

var json = null;
$.getJSON('/assets/graph.json', function(data) {
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

  link = svg.selectAll('line')
    .data(links)
    .enter().append('line')
    .attr('class', 'link')
    .style('stroke-width', 1)
    .style('stroke', 'steelblue');
  node = svg.selectAll('circle')
    .data(nodes)
    .enter().append('circle')
    .style('fill', 'steelblue')
    .attr('r', d => 7)
    .call(force.drag)
    .on('mouseover', mouseover)
    .on('mousemove', mousemove)
    .on('mouseout', mouseout);

  force.start();
}

function mouseover(d) {
  d3.select(this).style('fill', 'red');
  tooltip.html(d.id)
    .style('opacity', 1);
}

function mousemove(d) {
  tooltip.style('left', (d3.mouse(this)[0]+10) + 'px')
    .style('top', (d3.mouse(this)[1]) + 'px');
}

function mouseout(d) {
  d3.select(this).style('fill', 'steelblue');
  tooltip.style('opacity', 0);
}

var node, link;
function tick() {
  link.attr('x1', d => d.source.x)
    .attr('y1', d => d.source.y)
    .attr('x2', d => d.target.x)
    .attr('y2', d => d.target.y);
  node.attr('cx', d => d.x)
    .attr('cy', d => d.y);
}
