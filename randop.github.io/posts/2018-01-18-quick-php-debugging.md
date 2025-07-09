---
layout: post
title:  "Quick PHP Debugging"
date: 2018-01-18T10:00:00+08:00
categories: php debug debugging programming
---
Put this on top of your script and easily see the errors and warnings.

```php
<?php
error_reporting(E_ALL ^ E_DEPRECATED);
ini_set('error_reporting', E_ALL ^ E_DEPRECATED);
ini_set('display_startup_errors', 1);
ini_set('display_errors', 1);
```