---
layout: page
title: wikipedia networks
description: vizualizing knowledge gaps
img: /assets/img/big_graph.jpg
importance: 1
---

<script type="text/javascript" src="https://d3js.org/d3.v3.min.js"></script>
<script type="text/javascript" src="/assets/js/wikinet_viz.js"></script>

In my recent <a href='http://arxiv.org/abs/2010.08381' target='blank'>paper</a>,
 we use persistent homology to identify knowledge gaps. Here is a visualization
 of knowledge gaps in Wikipedia networks.

<div class="viz"></div>

<script type="text/javascript">

var sampleSVG = d3.select('.viz')
        .append('svg')
        .attr({width: 600, height: 100});

var data = d3.range(5).map(function(d, i){ return ~~(Math.random()*100); })

sampleSVG.selectAll('circle')
        .data(data)
        .enter().append('circle')
        .style({stroke: 'gray', fill: 'aliceblue'})
        .attr({r: 40, cx: function(d, i){ return i*100 + 50; }, cy: 50})
        .call(d3.helper.tooltip()
            .attr({class: function(d, i) { return d + ' ' +  i + ' A'; }})
            .style({color: 'blue'})
            .text(function(d, i){ return 'value: '+d; })
        )
        .on('mouseover', function(d, i){ d3.select(this).style({fill: 'skyblue'}); })
        .on('mouseout', function(d, i){ d3.select(this).style({fill: 'aliceblue'}); });

</script>
