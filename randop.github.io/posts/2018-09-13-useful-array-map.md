---
layout: post
title:  "Useful array map"
date: 2018-09-13T10:00:00+08:00
categories: php array tips
---
Here is an example of array_map function to produce a string by appending each content of a flat array.

```php
<?php
$the_ids = [1,2,3,4];
echo implode(' OR ', array_map( function($id){ return 'id=' . $id; }, $the_ids ) );
```

Produces the following output:
id=1 OR id=2 OR id=3 OR id=4

This can be useful when trying to pass a where condition on a sql.