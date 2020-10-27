---
layout: page
title: wikipedia networks
description: vizualizing knowledge gaps
img: /assets/img/big_graph.jpg
importance: 1
---

<script type="text/javascript" src="https://d3js.org/d3.v3.min.js"></script>
<script defer type="text/javascript" src="/assets/js/wikinet_viz.js"></script>

In my recent <a href='http://arxiv.org/abs/2010.08381' target='blank'>paper</a>,
 we use persistent homology to identify knowledge gaps. Explore knowledge gaps
 in networks of hyperlinked science articles on Wikipedia.

<div class="options">
  <strong>Subject: </strong>
</div>

<div style="display: flex; justify-content: center; min-height: 20%; height: auto; flex-shrink: 0;">
  <div class="viz" style="position: relative;"></div>
</div>

I have omitted some of the larger networks because the current D3 app is slow in handling larger (>1000 nodes) networks.
