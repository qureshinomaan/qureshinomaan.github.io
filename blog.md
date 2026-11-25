---
layout: default
title: Blog
description: "Short notes by Nomaan Qureshi on robot learning, simulators for robotics, imitation and agricultural robotics."
permalink: /blog/
---
<article class="paper">
  <header class="paper-head">
    <p class="breadcrumb"><a href="/">Nomaan Qureshi</a> <span aria-hidden="true">/</span> Blog</p>
    <h1>Blog</h1>
  </header>
  <p class="lede">Inspired by Paul. G's emphasis on writing, I have decided to write this blog more actively. These are quick 2-3 paragraphs notes about what I have been thinking.</p>

  <ol class="post-list" reversed>
    {% for post in site.posts %}
    <li>
      <a href="{{ post.url | relative_url }}">
        <h2>{{ post.title | strip }}</h2>
        <p>{{ post.content | strip_html | normalize_whitespace | truncate: 190 }}</p>
      </a>
    </li>
    {% endfor %}
  </ol>
</article>
