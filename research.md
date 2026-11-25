---
layout: default
title: "Research topics: sim-to-real, Gaussian Splatting, visual servoing, robot manipulation"
description: "Research by Nomaan Qureshi grouped by topic: sim-to-real transfer, Gaussian Splatting for robotics, visual servoing and optical flow, robot manipulation, reinforcement learning, planning and learning from video."
permalink: /research/
---
<article class="paper topics">
<p class="breadcrumb"><a href="/">Nomaan Qureshi</a> / Research</p>
<h1>Research by topic</h1>
<p>Papers by Nomaan Qureshi (M. Nomaan Qureshi), grouped by topic. Each paper page has a plain-language summary, questions and answers, an interactive visual and a BibTeX entry. The full list in order is on the <a href="/#publications">home page</a>.</p>
{% assign papers = site.papers | sort: "order" %}
{% for t in site.data.topics %}
<h2 id="{{ t.slug }}">{{ t.name }}</h2>
<p>{{ t.blurb }}</p>
<ul>
{% for p in papers %}{% if p.topics contains t.slug %}
<li><a href="{{ p.url | relative_url }}">{{ p.title }}</a>. {{ p.venue }}, {{ p.year }}. {{ p.description }}</li>
{% endif %}{% endfor %}
</ul>
{% endfor %}
</article>
