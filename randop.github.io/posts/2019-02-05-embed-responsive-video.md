---
layout: post
title:  "Embed a <video> in responsive way"
date: 2019-02-05T10:00:00+08:00
categories: embed video responsive
---
This is how to embed a video on a page and make it responsive.

```
<style type="text/css">
.video-responsive{
    overflow:hidden;
    padding-bottom:56.25%;
    position:relative;
    height:0;
}
.video-responsive iframe{
    left:0;
    top:0;
    height:100%;
    width:100%;
    position:absolute;
}
</style>

<div class="video-responsive">
    <iframe src="https://www.youtube.com/embed/XXXXX" 
        frameborder="0" 
        width="970" height="548"></iframe>
</div>
```