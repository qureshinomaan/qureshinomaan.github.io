---
layout: default
title: Blog
---

<h1>Blog Posts</h1>
Inspied by Paul. G's emphasis on writing, I have decided to write this blog more actively. These are 2-3 paragraphs notes about what I have been thinking. 



<ul class="post-list">
  {% assign total_posts = site.posts.size %}
  {% for post in site.posts %}
    <li>
        [{{ total_posts | minus: forloop.index | plus: 1 }}] 
        <a href="{{ post.url | prepend: site.baseurl }}">{{ post.title }}</a>
    </li>
  {% endfor %}
</ul>

