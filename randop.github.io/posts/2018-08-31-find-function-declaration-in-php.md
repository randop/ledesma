---
layout: post
title:  "Find function declaration in PHP"
date: 2018-08-31T10:00:00+08:00
categories: php debug debugging programming
---
This is a simple way to find where the function is defined on your script

```php
<?php
$reflFunc = new ReflectionFunction('function_name');
print $reflFunc->getFileName() . ':' . $reflFunc->getStartLine();
```