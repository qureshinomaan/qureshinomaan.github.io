---
layout: default
title: Blog
description: "Short notes by Nomaan Qureshi on robot learning, simulators for robotics, imitation and agricultural robotics."
permalink: /blog/
---

<h1>Blog</h1>
Inspired by Paul. G's emphasis on writing, I have decided to write this blog more actively. These are quick 2-3 paragraphs notes about what I have been thinking. 



<ul class="post-list">
  {% assign total_posts = site.posts.size %}
  {% for post in site.posts %}
    <li>
        [{{ total_posts | minus: forloop.index | plus: 1 }}] 
        <a href="{{ post.url | prepend: site.baseurl }}">{{ post.title }}</a>
    </li>
  {% endfor %}
</ul>

