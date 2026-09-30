---
layout: page
title: Writeups for TryHackMe
---

<div id="archives" class="post">
  <div class="archive-group">
    
    <!-- Capture the category name for TryHackMe -->
    {% capture category_name %}TryHackMe{% endcapture %}
    
    <!-- Assign category data -->
    {% assign cat = site.data.categories[category_name] %}
    
    <!-- Display category description if available -->
    <p style="margin-bottom: 10px">{{ cat.description }}</p> 
    
    <!-- Loop through posts in the TryHackMe category -->
    <ul style="margin-bottom: 40px">
    {% for post in site.categories[category_name] %}
      <article class="post-preview">
        <!-- Post Thumbnail Image -->
        <div class="post-image post-image-normal">
          <a href="{{ post.url | absolute_url }}" aria-label="Thumbnail">
            *[Image: Post thumbnail]*
          </a>
        </div>
        <!-- Post Title and Subtitle -->
        <a href="{{ post.url | absolute_url }}">
          <h2 class="post-title">{{ post.title | strip_html }}</h2>
          <h3 class="post-subtitle">{{ post.subtitle | strip_html }}</h3>
        </a>
        <!-- Post Meta Information -->
        <p class="post-meta">
          {% assign date_format = site.date_format | default: "%B %-d, %Y" %}
          Posted on {{ post.date | date: date_format }}
        </p>
        <!-- Post Excerpt -->
        <div class="post-entry">
          {% assign excerpt_length = site.excerpt_length | default: 50 %}
          {{ post.excerpt | strip_html | truncatewords: excerpt_length }}
          {% assign excerpt_word_count = post.excerpt | number_of_words %}
          {% if post.content != post.excerpt or excerpt_word_count > excerpt_length %}
            <a href="{{ post.url | absolute_url }}" class="post-read-more">[Read&nbsp;More]</a>
          {% endif %}
        </div>
        <!-- Post Tags -->
        {% if site.feed_show_tags != false and post.tags.size > 0 %}
          <div class="blog-tags">
            <span>Tags:</span>
            {% for tag in post.tags %}
              <a href="{{ '/tags' | absolute_url }}#{{- tag -}}">{{- tag -}}</a>
            {% endfor %}
          </div>
        {% endif %}
      </article>
    {% endfor %}
    </ul>
  </div> 
</div>

