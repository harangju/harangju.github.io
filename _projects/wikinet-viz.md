---
layout: page
title: wikipedia networks
description: visualizing networks & knowledge gaps
img: /assets/img/big_graph.jpg
importance: 1
---

<script src="https://d3js.org/d3.v6.min.js"></script>
<script defer src="/assets/js/wikinet_viz.js"></script>

In my recent <a href='http://arxiv.org/abs/2010.08381' target='blank'>paper</a>,
 we use persistent homology to identify knowledge gaps in networks of hyperlinked articles on Wikipedia. You can explore the networks and knowledge gaps that have been filled.

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

##### Notes
* I used [`dionysus2`](https://www.mrzv.org/software/dionysus2/) to calculate persistent homology.
* [`dionysus2`](https://www.mrzv.org/software/dionysus2/) does not currently support finding representative cycles of cavities that are still open. So, for cavities that are still open, the visualization highlights only the nodes that are a part of the simplex that starts the cavity, without highlighting the whole cavity.
* I have omitted some of the larger networks because the current D3 app is slow in handling larger (>1000 nodes) networks.
