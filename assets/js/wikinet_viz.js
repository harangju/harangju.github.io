// http://www.biovisualize.com/2012/07/embedding-d3js-in-blog-post.html
// https://github.com/vlandham/force_talk/blob/gh-pages/slides/simple_force.html
'use strict'

// TODO: https://www.freecodecamp.org/news/get-ready-to-zoom-and-pan-like-a-pro-after-reading-this-in-depth-tutorial-5d963b0a153e/
// TODO: https://observablehq.com/@d3/delaunay-find-zoom

const width = 770,
  height_net = 540,
  height_bar = 300;
const year_min = 0,
  year_max = 2020;

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

// UI

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

let year_label = d3.select('#year_label')
  .html(year_max);
let slider = d3.select('#year_slider')
  .attr('min', year_min)
  .attr('max', year_max)
  .attr('value', year_max)
  .on('change', function() {
    update_network();
  })
  .on('input', function() {
    year_label.html(this.value);
  });

let svg_net = d3.select('.viz_net')
  .append('svg')
  .attr('width', width)
  .attr('height', height_net);

let svg_bar = d3.select('.viz_bar')
  .append('svg')
  .attr('width', width)
  .attr('height', height_bar)
  .append('g')
  .attr('transform', `translate(${5},${5})`);

let tooltip = d3.select('.viz_net')
  .append('div')
  .attr('class', 'tooltip')
  .style('opacity', 0)
  .style('background-color', 'white')
  .style('border', 'solid')
  .style('border-width', '2px')
  .style('border-radius', '5px')
  .style('padding', '5px')
  .style('position', 'absolute');

let simulation = d3.forceSimulation()
  .force('center', d3.forceCenter(width/2, height_net/2))
  .force('charge', d3.forceManyBody())
  .force('link', d3.forceLink().id(d => d.id))
  .on('tick', tick);
simulation.stop();

var link = svg_net.append('g')
  .attr('class', 'link')
  .style('stroke-width', 0.4)
  .style('stroke', 'steelblue')
  .selectAll('line');
var node = svg_net.append('g')
  .style('fill', 'steelblue')
  .style('stroke', 'lightblue')
  .selectAll('circle');
function tick() {
  link
    .attr('x1', d => d.source.x)
    .attr('y1', d => d.source.y)
    .attr('x2', d => d.target.x)
    .attr('y2', d => d.target.y);
  node
    .attr('cx', d => d.x)
    .attr('cy', d => d.y);
}

// Load data

load_network(topics[0]);
load_barcode(topics[0]);

// https://stats.stackexchange.com/questions/281162/scale-a-number-between-a-range
const tmin = 6,
  tmax = 14;
let rmin = 1,
  rmax = 0;
let json;
function load_network(topic) {
  $.getJSON(`/assets/wikinets/${topic}.json`, data => {
    json = data;
    json.links.forEach(function(d, i) {
      d.source = json.nodes.map(d => d.id)[d.source];
      d.target = json.nodes.map(d => d.id)[d.target];
    });
    console.log(`${topic}: ${json.nodes.length} nodes.`);
    rmax = Math.max.apply(Math, json.nodes.map(d => d.degree));
    rmin = Math.min.apply(Math, json.nodes.map(d => d.degree));
    update_network();
  });
}

let barcode;
function load_barcode(topic) {
  d3.csv(`/assets/wikibars/${'test'}.csv`, data => {
    barcode = data;
    update_barcode();
  });
}

// Network

let nodes;
let links;
function update_network() {
  let year = slider.property('value');
  nodes = json.nodes
    .map(d => Object.create(d))
    .filter(d => d.year <= year);
  let nids = json.nodes.map(d => d.id);
  links = json.links
    .map(d => Object.create(d))
    .filter(d => json.nodes[nids.indexOf(d.source)].year <= year &&
      json.nodes[nids.indexOf(d.target)].year <= year);
  const old_nodes = new Map(node.data().map(d => [d.id, d]));
  nodes = nodes.map(d => old_nodes.get(d.id) || d);
  link = link.data(links)
    .join('line');
  node = node.data(nodes)
    .join(enter => enter.append('circle')
      .attr('r', d => (d.degree-rmin)/(rmax-rmin)*(tmax-tmin)+tmin)
      .on('mouseover', mouseover)
      .on('mousemove', mousemove)
      .on('mouseout', mouseout)
      .call(drag(simulation))
      .call(node => node.append('title').text(d => d.id)));
  simulation.nodes(nodes)
  simulation.force('link').links(links)
  simulation.alpha(1).restart().tick();
}

function drag(simulation) {
  function dragstarted(event, d) {
    if (!event.active) simulation.alphaTarget(0.3).restart();
    d.fx = d.x;
    d.fy = d.y;
  }
  function dragged(event, d) {
    d.fx = event.x;
    d.fy = event.y;
  }
  function dragended(event, d) {
    if (!event.active) simulation.alphaTarget(0);
    d.fx = null;
    d.fy = null;
  }
  return d3.drag()
      .on("start", dragstarted)
      .on("drag", dragged)
      .on("end", dragended);
}

function mouseover(event, d) {
  d3.select(this).style('fill', 'red');
  tooltip.html(d.id)
    .style('opacity', 1);
}

function mousemove(event) {
  tooltip.style('left', (d3.pointer(event, this)[0]+10) + 'px')
    .style('top', (d3.pointer(event, this)[1]) + 'px');
}

function mouseout(event) {
  d3.select(this).style('fill', 'steelblue');
  tooltip.style('opacity', 0);
}

// Barcodes

function update_barcode() {

}
