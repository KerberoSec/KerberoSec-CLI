---
title: Blog
permalink: /blog
---
## Blog

<ul>
  {% for post in site.posts %}
    <li>
      <a href="{{ post.url }}">{{ post.title }}</a>
      {% if post.categories %}
        <small><em>{{ post.categories | join: "</em>: <em>" }}</em></small>
      {% endif %}
      {{ post.excerpt }}
    </li>
  {% endfor %}
</ul>