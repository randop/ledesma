---
layout: post
title:  "Using Reflection to access protected properties in PHP"
date: 2019-04-15T10:00:00+08:00
categories: php array tips
---
Here is how to access protected class properties. Reflection is generally a method for   inspecting classes and modify its logic at execution time.

```php
<?php
$class = new ReflectionClass($classInstance);
$property = $class->getProperty("properties");
$property->setAccessible(true);
$properties = $property->getValue($number);
```