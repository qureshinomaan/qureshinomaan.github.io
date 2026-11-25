---
layout: default
title: "Research topics: sim-to-real, Gaussian Splatting, visual servoing, robot manipulation"
description: "Research by Nomaan Qureshi grouped by topic: sim-to-real transfer, Gaussian Splatting for robotics, visual servoing and optical flow, robot manipulation, reinforcement learning, planning and learning from video."
permalink: /research/
---
<article class="paper topics">
  <header class="paper-head">
    <p class="breadcrumb"><a href="/">Nomaan Qureshi</a> <span aria-hidden="true">/</span> Research</p>
    <h1>Research by topic</h1>
  </header>
  <p class="lede">Papers by Nomaan Qureshi (M. Nomaan Qureshi), grouped by topic.</p>
  <p>Each paper page has a plain-language summary, questions and answers, an interactive visual and a BibTeX entry. The full list in order is on the <a href="/#publications">home page</a>, and the BibTeX for every paper is in <a href="/papers.bib">papers.bib</a>.</p>
  <p class="topic-jump">{% for t in site.data.topics %}<a class="tlink" href="#{{ t.slug }}">{{ t.name }}</a>{% endfor %}</p>
  {% assign papers = site.papers | sort: "order" %}
  {% for t in site.data.topics %}
  <section class="topic" id="{{ t.slug }}">
    <h2>{{ t.name }}</h2>
    <p class="topic-blurb">{{ t.blurb }}</p>
    <ul class="topic-papers">
      {% for p in papers %}{% if p.topics contains t.slug %}
      <li>
        <a href="{{ p.url | relative_url }}">{{ p.title }}</a>
        <span class="badge">{{ p.venue_short | default: p.year }}</span>
        <p>{{ p.description }}</p>
      </li>
      {% endif %}{% endfor %}
    </ul>
  </section>
  {% endfor %}
</article>
