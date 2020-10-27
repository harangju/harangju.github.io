// http://www.biovisualize.com/2012/07/embedding-d3js-in-blog-post.html
// https://github.com/vlandham/force_talk/blob/gh-pages/slides/simple_force.html
'use strict'

// TODO: https://observablehq.com/@d3/temporal-force-directed-graph
// TODO: https://observablehq.com/@d3/delaunay-find-zoom

const width = 770,
  height = 600;

const topics = ['cognitive science',
 'evolutionary biology', 'immunology',
 'molecular biology', 'biophysics', 'energy',
 'optics', 'earth science', 'geology', 'meteorology',
 'philosophy of language', 'philosophy of law',
 'philosophy of mind', 'philosophy of science', 'economics',
 'accounting', 'education', 'linguistics', 'law',
 'software engineering',
 'calculus', 'geometry', 'abstract algebra', 'Boolean algebra',
 'commutative algebra', 'group theory', 'linear algebra',
 'number theory', 'dynamical systems',
 ];
// for now, remove topics with too many nodes
// 'anatomy', 'biochemistry', 'genetics', 'chemistry',
// 'sociology', 'education', 'psychology', 'electronics'
// 'robotics', 'physics', 'mathematics'

let dropdown = d3.select('select')
  .on('change', function() {
    let index = dropdown.property('selectedIndex');
    console.log(`changed to ${topics[index]} at ${index}`);
    load_network(topics[index]);
  });
let options = dropdown.selectAll('option')
  .data(topics)
  .enter().append('option')
  .text(d => d);

let year_label = d3.select('#year_label');
let slider = d3.select('#year_slider')
  .on('input', function() {
    year_label.html(this.value);
    update()
  });

let svg = d3.select('.viz')
  .append('svg')
  .attr({width: width, height: height});

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
  .size([width, height])
  .gravity(.3)
  .linkDistance(80)
  .charge(-200);

var link = svg.append('g')
  .attr('class', 'link')
  .style('stroke-width', 0.4)
  .style('stroke', 'steelblue')
  .selectAll('line');
var node = svg.append('g')
  .style('fill', 'steelblue')
  .style('stroke', 'lightblue')
  .selectAll('circle');
function tick() {
  link.attr('x1', d => d.source.x)
    .attr('y1', d => d.source.y)
    .attr('x2', d => d.target.x)
    .attr('y2', d => d.target.y);
  node.attr('cx', d => d.x)
    .attr('cy', d => d.y);
}

load_network(topics[0]);

// https://stats.stackexchange.com/questions/281162/scale-a-number-between-a-range
const tmin = 6,
  tmax = 14;
let rmin = 1,
  rmax = 0;
let json;
function load_network(topic, callback) {
  $.getJSON(`/assets/wikinets/${topic}.json`, data => {
    // nodes should be in chronological order
    json = data;
    console.log(`${topic}: ${json.nodes.length} nodes.`);
    rmax = Math.max.apply(Math, json.nodes.map(d => d.degree));
    rmin = Math.min.apply(Math, json.nodes.map(d => d.degree));
    let year_min = Math.min.apply(Math, json.nodes.map(d => d.year));
    let year_max = Math.max.apply(Math, json.nodes.map(d => d.year))
    slider.attr('min', 500)
      .attr('max', year_max)
      .attr('value', year_max);
    year_label.html(year_max);
    update();
  });
}

let nodes;
let links;
function update() {
  let year = slider.property('value');
  nodes = json.nodes
    .map(d => Object.create(d))
    .filter(d => d.year <= year);
  links = json.links
    .map(d => Object.create(d))
    .filter(d => json.nodes[d.source].year <= year &&
      json.nodes[d.target].year <= year);
  links.forEach(function(d, i, arr) {
    d.source = nodes.map(d => d.id).indexOf(json.nodes[d.source].id);
    d.target = nodes.map(d => d.id).indexOf(json.nodes[d.target].id);
  });
  const old_nodes = new Map(node.data().map(d => [d.id, d]));
  nodes = nodes.map(d => old_nodes.get(d.id) || d);
  link = link.data(links);
  link.enter().append('line');
  link.exit().remove();
  node = node.data(nodes);
  node.enter().append('circle')
    .attr('r', d => (d.degree-rmin)/(rmax-rmin)*(tmax-tmin)+tmin)
    .call(force.drag)
    .on('mouseover', mouseover)
    .on('mousemove', mousemove)
    .on('mouseout', mouseout);
  node.exit().remove();
  force.nodes(nodes)
    .links(links)
    .start();
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
