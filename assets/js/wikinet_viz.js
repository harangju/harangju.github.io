// http://www.biovisualize.com/2012/07/embedding-d3js-in-blog-post.html
// https://github.com/vlandham/force_talk/blob/gh-pages/slides/simple_force.html
'use strict'

// TODO: https://www.freecodecamp.org/news/get-ready-to-zoom-and-pan-like-a-pro-after-reading-this-in-depth-tutorial-5d963b0a153e/
// TODO: https://observablehq.com/@d3/delaunay-find-zoom

const width = 770,
  height_net = 500,
  height_bar = 280;
const year_min = -1000,
  year_max = 2020;
const margin = {top: 20, right: 30, bottom: 18, left: 10};
const link_width = 0.4,
  link_width_on = 2;

const topics = ['cognitive science',
 'evolutionary biology', 'immunology',
 'molecular biology', 'biophysics', 'energy',
 'optics', 'earth science', 'geology', 'meteorology',
 'philosophy of language', 'philosophy of law',
 'philosophy of mind', 'philosophy of science', 'economics',
 'accounting', 'education', 'linguistics',
 'software engineering',
 'calculus', 'geometry', 'abstract algebra', 'Boolean algebra',
 'commutative algebra', 'group theory', 'linear algebra',
 'number theory', 'dynamical systems',
 ];
// for now, remove topics with too many nodes
// 'anatomy', 'biochemistry', 'genetics', 'chemistry',
// 'sociology', 'education', 'law', 'psychology', 'electronics'
// 'robotics', 'physics', 'mathematics'

// UI

let dropdown = d3.select('select')
  .on('change', function() {
    let index = dropdown.property('selectedIndex');
    console.log(`changed to ${topics[index]} at ${index}`);
    load_network(topics[index]);
    load_barcode(topics[index]);
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

  })
  .on('input', function() {
    year_label.html(this.value);
    update_network();
  });

let svg_net = d3.select('.viz_net')
  .append('svg')
  .attr('width', width)
  .attr('height', height_net);

let tooltip_node = d3.select('.viz_net')
  .append('div')
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
  .style('stroke-width', link_width)
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
setTimeout(function(){
  load_network(topics[0]);
  load_barcode(topics[0]);
}, 1000);

// https://stats.stackexchange.com/questions/281162/scale-a-number-between-a-range
const tmin = 6,
  tmax = 14;
let rmin = 1,
  rmax = 0;
let json;
function load_network(topic) {
  d3.json(`/assets/wikinets/${topic}.json`).then(data => {
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
  d3.csv(`/assets/wikibars/${topic}.csv`).then(data => {
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
  tooltip_node.html(d.id)
    .style('opacity', 1);
}

function mousemove(event) {
  tooltip_node.style('left', (d3.pointer(event, this)[0]+10) + 'px')
    .style('top', (d3.pointer(event, this)[1]) + 'px');
}

function mouseout(event) {
  d3.select(this).style('fill', 'steelblue');
  tooltip_node.style('opacity', 0);
}

// Barcodes

function update_barcode() {
  d3.select(".viz_bar").selectAll("*").remove();
  let svg_bar = d3.select('.viz_bar')
    .append('svg')
    .attr('width', width)
    .attr('height', height_bar)
    .append('g')
    .attr('transform', `translate(${margin.left},${-margin.bottom})`);
  let x = d3.scaleLinear()
    .domain([d3.min(barcode, d => Number(d.birth)),
      d3.max(barcode, d => Number(d.death))])
    .range([margin.left, width-margin.right]);
  svg_bar.append('g')
    .attr('transform', `translate(0,${height_bar-margin.bottom})`)
    .call(d3.axisBottom(x));
  let y = d3.scaleLinear()
    .domain([0, d3.max(barcode, d => Number(d.i)+1)])
    .range([height_bar-margin.bottom, margin.top]);
  svg_bar.append('text')
    .attr('x', width/2)
    .attr('y', height_bar + 14)
    .text('year');
  // svg_bar.append('g')
  //   .attr('transform', `translate(${margin.left},0)`)
  //   .call(d3.axisLeft(y));
  let series = barcode.map(d => {
    return {
      key: d.dim,
      values: [
        {year: d.birth, i: Number(d.i)+1},
        {year: d.death, i: Number(d.i)+1}
      ],
      cavity: d.cavity.split(';'),
      death_nodes: d.death_nodes.split(';')
    };
  });
  let res = series.map(d => d.key);
  let color = d3.scaleOrdinal()
    .domain(res)
    .range(['#264653','#2a9d8f','#e9c46a','#f4a261','#e76f51']);
  let line = d3.line()
    .x(d => x(d.year))
    .y(d => y(d.i));
  let path = svg_bar.append('g')
    .attr('fill', 'none')
    .attr('stroke-width', (height_bar-margin.top-margin.bottom)/barcode.length)
    .attr('stroke-linecap', 'round')
    .selectAll('path')
    .data(series)
    .join('path')
    .attr('d', d => line(d.values))
    .attr('stroke', d => color(d.key));
  d3.select('.viz_bar').call(hover, path, x, y, series);
}

function hover(svg, path, x, y, series) {
  let tooltip_bar = svg
    .append('div')
    .style('opacity', 0)
    .style('background-color', 'white')
    .style('border', 'solid')
    .style('border-width', '2px')
    .style('border-radius', '5px')
    .style('padding', '5px')
    .style('position', 'absolute');
  if ("ontouchstart" in document) svg
      .style("-webkit-tap-highlight-color", "transparent")
      .on("touchmove", moved)
      .on("touchstart", entered)
      .on("touchend", left)
  else svg
      .on("mousemove", moved)
      .on("mouseenter", entered)
      .on("mouseleave", left);
  function moved(event) {
    event.preventDefault();
    let pointer = d3.pointer(event, this);
    pointer[1] += margin.bottom;
    const ym = y.invert(pointer[1]);
    const bar = d3.least(series, d => Math.abs(d.values[0].i - ym));
    path.style('opacity', d => d === bar ? 1 : 0.5);
    tooltip_bar.style('right', (width-pointer[0]+10) + 'px')
      .style('bottom', (height_bar-pointer[1]+10) + 'px');
    if (bar.death_nodes.length > 0 && bar.death_nodes[0].length > 0) {
      tooltip_bar.html(`<div style='color: red;'><b>Cavity:</b> `
        + `${bar.cavity.join(', ')}</div>`
        + `<div style='color: orange';><b>Closed by:</b> `
        + `${bar.death_nodes.join(', ')}</div>`);
    } else {
      tooltip_bar.html(`<div style='color: red;'><b>Cavity:</b> `
        + `${bar.cavity.join(', ')}</div><b>Still open.</b>`);
    }
    node
      .style('fill', d => {
        if (bar.death_nodes.indexOf(d.id) > -1) {
          return 'orange';
        } else if (bar.cavity.indexOf(d.id) > -1) {
          return 'red';
        } else {
          return 'steelblue';
        }
      });
    link
      .style('stroke', d => {
        if ((bar.death_nodes.indexOf(d.source.id) > -1) && (bar.cavity.indexOf(d.target.id) > -1)) {
          return 'orange';
        } else if ((bar.cavity.indexOf(d.source.id) > -1) &&
         (bar.death_nodes.indexOf(d.target.id) > -1)) {
           return 'orange';
        } else if ((bar.cavity.indexOf(d.source.id) > -1) && (bar.cavity.indexOf(d.target.id) > -1)) {
          return 'red';
        } else {
          return 'steelblue';
        }
      })
      .style('stroke-width', d => {
        if ((bar.death_nodes.indexOf(d.source.id) > -1) && (bar.cavity.indexOf(d.target.id) > -1)) {
          return link_width_on;
        } else if ((bar.cavity.indexOf(d.source.id) > -1) &&
         (bar.death_nodes.indexOf(d.target.id) > -1)) {
           return link_width_on;
        } else if ((bar.cavity.indexOf(d.source.id) > -1) && (bar.cavity.indexOf(d.target.id) > -1)) {
          return link_width_on;
        } else {
          return link_width;
        }
      });
  }
  function entered() {
    tooltip_bar.style('opacity', 1);
  }
  function left() {
    path.style('opacity', 1);
    tooltip_bar.style('opacity', 0);
    node.style('fill', 'steelblue');
    link.style('stroke', 'steelblue')
      .style('stroke-width', link_width);
  }
}
