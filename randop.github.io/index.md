---
layout: layout.njk
title: Randolph Ledesma Blog
---

Here are my latest blog posts:

{% for post in collections.latestPosts %}
## [{{ post.data.title | escape }}]({{ post.url }})
*Published: {{ post.date | dateFormat }}*

{{ post.data.description }}

[Read more...]({{ post.url }})

---
{% endfor %}
