---
layout: page
title: wikipedia networks
description: vizualizing knowledge gaps
img: /assets/img/big_graph.jpg
importance: 1
---

<script src="https://d3js.org/d3.v6.min.js"></script>
<script defer type="text/javascript" src="/assets/js/wikinet_viz.js"></script>

In my recent <a href='http://arxiv.org/abs/2010.08381' target='blank'>paper</a>,
 we use persistent homology to identify knowledge gaps. You can explore networks of hyperlinked science articles on Wikipedia.

<div class="container">
  <div class="row">
    <div class="col">
      <strong>Subject: </strong>
      <select></select>
    </div>
    <div class="col" style="white-space: nowrap; overflow-x: auto; overflow-y: hidden;">
      <strong style="display: inline-block;">Year: </strong>
      <input type="range" id="year_slider" min="0" max="10" value="10" step="1">
      <div id="year_label" style="display: inline-block;"></div>
    </div>
  </div>
</div>

<div style="display: flex; justify-content: center; min-height: 20%; height: auto; flex-shrink: 0;">
  <div class="viz_net" style="position: relative;"></div>
</div>

<div style="display: flex; justify-content: center; min-height: 20%; height: auto; flex-shrink: 0;">
  <div class="viz_bar" style="position: relative;"></div>
</div>

I have omitted some of the larger networks because the current D3 app is slow in handling larger (>1000 nodes) networks.
